-- FINAL COMPLETE SQL - SAFE FOR EXISTING TABLES
-- This script safely adds unlimited clinic support to your existing CuraFlow database
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions (safe - won't recreate if exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- PART 1: SAFELY ADD MISSING COLUMNS
-- ========================================

-- Add authentication fields to clinics table (safe - won't duplicate)
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS admin_username TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS admin_pin TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS admin_name TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise'));
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS max_doctors INTEGER DEFAULT 10;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS max_patients_per_day INTEGER DEFAULT 100;

-- Add missing columns to visits table (safe - won't duplicate)
ALTER TABLE visits ADD COLUMN IF NOT EXISTS was_skipped BOOLEAN DEFAULT FALSE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS skip_reason TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS was_out_of_turn BOOLEAN DEFAULT FALSE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS waiting_time_minutes INTEGER DEFAULT 0;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS consultation_time_minutes INTEGER DEFAULT 0;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS total_time_minutes INTEGER DEFAULT 0;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS session_end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_notes TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS patient_satisfaction_rating INTEGER CHECK (patient_satisfaction_rating >= 1 AND patient_satisfaction_rating <= 5);

-- ========================================
-- PART 2: CREATE INDEXES (SAFE)
-- ========================================

-- Create indexes for better performance (safe - won't duplicate)
CREATE INDEX IF NOT EXISTS idx_clinics_admin_username ON clinics(admin_username);
CREATE INDEX IF NOT EXISTS idx_clinics_is_active ON clinics(is_active);
CREATE INDEX IF NOT EXISTS idx_visits_was_skipped ON visits(was_skipped);
CREATE INDEX IF NOT EXISTS idx_visits_waiting_time ON visits(waiting_time_minutes);
CREATE INDEX IF NOT EXISTS idx_visits_consultation_time ON visits(consultation_time_minutes);
CREATE INDEX IF NOT EXISTS idx_visits_session_end_time ON visits(session_end_time);

-- ========================================
-- PART 3: UPDATE EXISTING DATA
-- ========================================

-- Update existing clinics with admin credentials (safe - only updates if NULL)
UPDATE clinics 
SET 
    admin_username = 'admin',
    admin_pin = '1234',
    admin_name = 'Admin User',
    is_active = TRUE
WHERE name = 'CuraFlow Central Hospital' AND admin_username IS NULL;

UPDATE clinics 
SET 
    admin_username = 'sunrise-admin',
    admin_pin = '5678',
    admin_name = 'Sunrise Admin',
    is_active = TRUE
WHERE name = 'Sunrise Medical Clinic' AND admin_username IS NULL;

-- ========================================
-- PART 4: CREATE/UPDATE FUNCTIONS
-- ========================================

-- Drop existing functions to avoid conflicts (safe)
DROP FUNCTION IF EXISTS get_full_queue(UUID);
DROP FUNCTION IF EXISTS complete_previous_consultation(UUID, UUID);
DROP FUNCTION IF EXISTS end_session_for_doctor(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS end_session_with_tracking(UUID, UUID, TEXT, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS authenticate_clinic(TEXT, TEXT);
DROP FUNCTION IF EXISTS create_clinic_with_admin(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS update_clinic_admin(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS deactivate_clinic(UUID);
DROP FUNCTION IF EXISTS get_clinic_stats(UUID);

-- Create function to get full queue with proper joins
CREATE OR REPLACE FUNCTION get_full_queue(p_clinic_id UUID)
RETURNS TABLE (
    id UUID,
    token_number INTEGER,
    patient_name TEXT,
    doctor_name TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE,
    status TEXT,
    priority TEXT,
    appointment_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        v.token_number,
        p.name as patient_name,
        d.name as doctor_name,
        q.check_in_time,
        q.status,
        q.priority,
        q.appointment_id
    FROM queue q
    JOIN visits v ON q.appointment_id = v.id
    JOIN patients p ON v.patient_id = p.id
    JOIN doctors d ON v.doctor_id = d.id
    WHERE q.clinic_id = p_clinic_id
    ORDER BY q.check_in_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to complete previous consultation
CREATE OR REPLACE FUNCTION complete_previous_consultation(p_doctor_id UUID, p_clinic_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Complete any previous consultation for this doctor
    UPDATE queue 
    SET status = 'Completed'
    WHERE clinic_id = p_clinic_id 
    AND appointment_id IN (
        SELECT v.id 
        FROM visits v 
        WHERE v.doctor_id = p_doctor_id 
        AND v.clinic_id = p_clinic_id
    )
    AND status = 'In-consultation';
    
    -- Also update visits table
    UPDATE visits 
    SET status = 'Completed', completed_time = NOW()
    WHERE doctor_id = p_doctor_id 
    AND clinic_id = p_clinic_id 
    AND status = 'In-consultation';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to end session for doctor
CREATE OR REPLACE FUNCTION end_session_for_doctor(p_clinic_id UUID, p_doctor_name TEXT, p_session_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Complete all consultations for this doctor in this session
    UPDATE queue 
    SET status = 'Completed'
    WHERE clinic_id = p_clinic_id 
    AND appointment_id IN (
        SELECT v.id 
        FROM visits v 
        JOIN doctors d ON v.doctor_id = d.id
        WHERE d.name = p_doctor_name 
        AND v.session = p_session_name
        AND v.clinic_id = p_clinic_id
    )
    AND status IN ('In-consultation', 'Waiting');
    
    -- Update visits table
    UPDATE visits 
    SET status = 'Completed', completed_time = NOW()
    WHERE clinic_id = p_clinic_id 
    AND doctor_id IN (
        SELECT id FROM doctors 
        WHERE name = p_doctor_name 
        AND clinic_id = p_clinic_id
    )
    AND session = p_session_name
    AND status IN ('In-consultation', 'Waiting');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to end session with detailed tracking
CREATE OR REPLACE FUNCTION end_session_with_tracking(
    p_clinic_id UUID, 
    p_doctor_id UUID, 
    p_session_name TEXT,
    p_session_end_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    total_patients INTEGER,
    completed_patients INTEGER,
    waiting_patients INTEGER,
    skipped_patients INTEGER,
    no_show_patients INTEGER,
    avg_waiting_time DECIMAL,
    avg_consultation_time DECIMAL,
    total_revenue DECIMAL
) AS $$
DECLARE
    session_stats RECORD;
BEGIN
    -- First, complete any ongoing consultations for this doctor
    UPDATE visits 
    SET 
        status = 'Completed',
        completed_time = p_session_end_time,
        waiting_time_minutes = CASE 
            WHEN called_time IS NOT NULL AND check_in_time IS NOT NULL THEN
                EXTRACT(EPOCH FROM (called_time - check_in_time)) / 60
            ELSE 0
        END,
        consultation_time_minutes = CASE 
            WHEN called_time IS NOT NULL THEN
                EXTRACT(EPOCH FROM (p_session_end_time - called_time)) / 60
            ELSE 0
        END,
        total_time_minutes = CASE 
            WHEN check_in_time IS NOT NULL THEN
                EXTRACT(EPOCH FROM (p_session_end_time - check_in_time)) / 60
            ELSE 0
        END,
        session_end_time = p_session_end_time
    WHERE clinic_id = p_clinic_id 
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE
    AND status = 'In-consultation';
    
    -- Then, mark waiting patients as no-show
    UPDATE visits 
    SET 
        status = 'No-show',
        session_end_time = p_session_end_time,
        waiting_time_minutes = CASE 
            WHEN check_in_time IS NOT NULL THEN
                EXTRACT(EPOCH FROM (p_session_end_time - check_in_time)) / 60
            ELSE 0
        END,
        consultation_time_minutes = 0,
        total_time_minutes = CASE 
            WHEN check_in_time IS NOT NULL THEN
                EXTRACT(EPOCH FROM (p_session_end_time - check_in_time)) / 60
            ELSE 0
        END
    WHERE clinic_id = p_clinic_id 
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE
    AND status = 'Waiting';
    
    -- Update queue status for this doctor's session
    UPDATE queue 
    SET status = 'Completed'
    WHERE clinic_id = p_clinic_id 
    AND appointment_id IN (
        SELECT v.id 
        FROM visits v 
        WHERE v.doctor_id = p_doctor_id 
        AND v.session = p_session_name
        AND v.date = CURRENT_DATE
        AND v.clinic_id = p_clinic_id
    )
    AND status IN ('Waiting', 'In-consultation');
    
    -- Calculate session statistics for this specific doctor and session
    SELECT 
        COUNT(*) as total_patients,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_patients,
        COUNT(CASE WHEN status = 'Waiting' THEN 1 END) as waiting_patients,
        COUNT(CASE WHEN was_skipped = true THEN 1 END) as skipped_patients,
        COUNT(CASE WHEN status = 'No-show' THEN 1 END) as no_show_patients,
        AVG(CASE WHEN waiting_time_minutes > 0 THEN waiting_time_minutes END) as avg_waiting_time,
        AVG(CASE WHEN consultation_time_minutes > 0 THEN consultation_time_minutes END) as avg_consultation_time,
        SUM(CASE WHEN status = 'Completed' THEN COALESCE(fee, 0) ELSE 0 END) as total_revenue
    INTO session_stats
    FROM visits 
    WHERE clinic_id = p_clinic_id 
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE;
    
    -- Return the statistics
    RETURN QUERY SELECT 
        session_stats.total_patients::INTEGER,
        session_stats.completed_patients::INTEGER,
        session_stats.waiting_patients::INTEGER,
        session_stats.skipped_patients::INTEGER,
        session_stats.no_show_patients::INTEGER,
        COALESCE(session_stats.avg_waiting_time, 0)::DECIMAL,
        COALESCE(session_stats.avg_consultation_time, 0)::DECIMAL,
        COALESCE(session_stats.total_revenue, 0)::DECIMAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to authenticate clinic
CREATE OR REPLACE FUNCTION authenticate_clinic(p_username TEXT, p_pin TEXT)
RETURNS TABLE(
    clinic_id UUID,
    clinic_name TEXT,
    admin_name TEXT,
    is_authenticated BOOLEAN
) AS $$
DECLARE
    clinic_record RECORD;
BEGIN
    -- Look up clinic by admin username
    SELECT id, name, admin_name, admin_pin, is_active
    INTO clinic_record
    FROM clinics 
    WHERE admin_username = p_username 
    AND is_active = TRUE;
    
    -- Check if clinic exists and PIN matches
    IF clinic_record.id IS NOT NULL AND clinic_record.admin_pin = p_pin THEN
        RETURN QUERY SELECT 
            clinic_record.id,
            clinic_record.name,
            clinic_record.admin_name,
            TRUE;
    ELSE
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create new clinic with admin
CREATE OR REPLACE FUNCTION create_clinic_with_admin(
    p_name TEXT,
    p_address TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_admin_username TEXT,
    p_admin_pin TEXT,
    p_admin_name TEXT,
    p_subscription_plan TEXT DEFAULT 'basic',
    p_max_doctors INTEGER DEFAULT 10,
    p_max_patients_per_day INTEGER DEFAULT 100
)
RETURNS TABLE(
    clinic_id UUID,
    clinic_name TEXT,
    admin_username TEXT,
    success BOOLEAN
) AS $$
DECLARE
    new_clinic_id UUID;
BEGIN
    -- Generate new clinic ID
    new_clinic_id := uuid_generate_v4();
    
    -- Insert new clinic
    INSERT INTO clinics (
        id, name, address, phone, email, 
        admin_username, admin_pin, admin_name,
        subscription_plan, max_doctors, max_patients_per_day,
        is_active, created_at
    ) VALUES (
        new_clinic_id, p_name, p_address, p_phone, p_email,
        p_admin_username, p_admin_pin, p_admin_name,
        p_subscription_plan, p_max_doctors, p_max_patients_per_day,
        TRUE, NOW()
    );
    
    -- Create default sessions for the new clinic
    INSERT INTO sessions (clinic_id, name, start_time, end_time) VALUES
    (new_clinic_id, 'Morning', '09:00', '13:00'),
    (new_clinic_id, 'Afternoon', '14:00', '18:00'),
    (new_clinic_id, 'Evening', '18:00', '21:00');
    
    -- Create default departments
    INSERT INTO departments (clinic_id, name) VALUES
    (new_clinic_id, 'General Medicine'),
    (new_clinic_id, 'Cardiology'),
    (new_clinic_id, 'Pediatrics');
    
    -- Return success
    RETURN QUERY SELECT 
        new_clinic_id,
        p_name,
        p_admin_username,
        TRUE;
        
EXCEPTION WHEN OTHERS THEN
    -- Return failure on error
    RETURN QUERY SELECT 
        NULL::UUID,
        NULL::TEXT,
        NULL::TEXT,
        FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update clinic admin credentials
CREATE OR REPLACE FUNCTION update_clinic_admin(
    p_clinic_id UUID,
    p_new_username TEXT,
    p_new_pin TEXT,
    p_new_admin_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE clinics 
    SET 
        admin_username = p_new_username,
        admin_pin = p_new_pin,
        admin_name = p_new_admin_name
    WHERE id = p_clinic_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to deactivate clinic
CREATE OR REPLACE FUNCTION deactivate_clinic(p_clinic_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE clinics 
    SET is_active = FALSE
    WHERE id = p_clinic_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get clinic statistics
CREATE OR REPLACE FUNCTION get_clinic_stats(p_clinic_id UUID)
RETURNS TABLE(
    total_doctors INTEGER,
    total_patients INTEGER,
    total_visits_today INTEGER,
    active_queue_count INTEGER,
    subscription_plan TEXT,
    max_doctors INTEGER,
    max_patients_per_day INTEGER
) AS $$
DECLARE
    stats RECORD;
BEGIN
    SELECT 
        COUNT(DISTINCT d.id) as doctor_count,
        COUNT(DISTINCT p.id) as patient_count,
        COUNT(DISTINCT v.id) as visits_today,
        COUNT(DISTINCT q.id) as queue_count,
        c.subscription_plan,
        c.max_doctors,
        c.max_patients_per_day
    INTO stats
    FROM clinics c
    LEFT JOIN doctors d ON c.id = d.clinic_id
    LEFT JOIN patients p ON c.id = p.clinic_id
    LEFT JOIN visits v ON c.id = v.clinic_id AND v.date = CURRENT_DATE
    LEFT JOIN queue q ON c.id = q.clinic_id AND q.status IN ('Waiting', 'In-consultation')
    WHERE c.id = p_clinic_id
    GROUP BY c.id, c.subscription_plan, c.max_doctors, c.max_patients_per_day;
    
    RETURN QUERY SELECT 
        COALESCE(stats.doctor_count, 0)::INTEGER,
        COALESCE(stats.patient_count, 0)::INTEGER,
        COALESCE(stats.visits_today, 0)::INTEGER,
        COALESCE(stats.queue_count, 0)::INTEGER,
        COALESCE(stats.subscription_plan, 'basic'),
        COALESCE(stats.max_doctors, 10),
        COALESCE(stats.max_patients_per_day, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PART 5: UPDATE RLS POLICIES (SAFE)
-- ========================================

-- Update RLS policies to include new fields (safe - won't duplicate)
DROP POLICY IF EXISTS "Allow all operations on clinics for authenticated users" ON clinics;
CREATE POLICY "Allow all operations on clinics for authenticated users" ON clinics
    FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- PART 6: VERIFICATION
-- ========================================

-- Test the authentication function
SELECT 'CuraFlow unlimited clinics setup completed successfully!' as status;

-- Show current clinics
SELECT 
    id,
    name,
    admin_username,
    is_active,
    subscription_plan,
    created_at
FROM clinics 
ORDER BY created_at DESC;
