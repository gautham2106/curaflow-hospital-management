-- ADD CLINIC AUTHENTICATION SUPPORT TO EXISTING SCHEMA
-- Run this AFTER the COMPLETE-SUPABASE-SETUP.sql

-- Add authentication fields to clinics table
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS admin_username TEXT UNIQUE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS admin_pin TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS admin_name TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise'));
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS max_doctors INTEGER DEFAULT 10;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS max_patients_per_day INTEGER DEFAULT 100;

-- Create index for faster login lookups
CREATE INDEX IF NOT EXISTS idx_clinics_admin_username ON clinics(admin_username);
CREATE INDEX IF NOT EXISTS idx_clinics_is_active ON clinics(is_active);

-- Update existing clinics with admin credentials
UPDATE clinics 
SET 
    admin_username = 'admin',
    admin_pin = '1234',
    admin_name = 'Admin User',
    is_active = TRUE
WHERE name = 'CuraFlow Central Hospital';

UPDATE clinics 
SET 
    admin_username = 'sunrise-admin',
    admin_pin = '5678',
    admin_name = 'Sunrise Admin',
    is_active = TRUE
WHERE name = 'Sunrise Medical Clinic';

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

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "Allow all operations on clinics for authenticated users" ON clinics;
CREATE POLICY "Allow all operations on clinics for authenticated users" ON clinics
    FOR ALL USING (auth.role() = 'authenticated');

-- Test the authentication function
SELECT 'Clinic authentication system added successfully!' as status;
