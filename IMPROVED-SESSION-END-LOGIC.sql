-- ============================================================
-- IMPROVED SESSION END LOGIC - Better Patient Handling
-- ============================================================
-- This implements the improved logic you requested:
-- 1. Allow ongoing consultations to continue (don't force complete)
-- 2. Mark waiting and skipped patients as no-show
-- 3. Remove cancelled status confusion
-- ============================================================

-- Drop existing function
DROP FUNCTION IF EXISTS end_session_with_tracking(UUID, UUID, TEXT, TIMESTAMP WITH TIME ZONE);

-- Create improved session end function
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
    ongoing_consultations INTEGER,
    avg_waiting_time DECIMAL,
    avg_consultation_time DECIMAL,
    total_revenue DECIMAL
) AS $$
DECLARE
    session_stats RECORD;
    total_patients_count INTEGER := 0;
    completed_patients_count INTEGER := 0;
    waiting_patients_count INTEGER := 0;
    skipped_patients_count INTEGER := 0;
    no_show_patients_count INTEGER := 0;
    ongoing_consultations_count INTEGER := 0;
    avg_waiting_time_calc DECIMAL := 0;
    avg_consultation_time_calc DECIMAL := 0;
    total_revenue_calc DECIMAL := 0;
BEGIN
    -- ============================================================
    -- IMPROVED LOGIC: Handle different patient states appropriately
    -- ============================================================
    
    -- 1. COUNT PATIENTS BEFORE MAKING CHANGES
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'Waiting' THEN 1 END) as waiting,
        COUNT(CASE WHEN status = 'Skipped' THEN 1 END) as skipped,
        COUNT(CASE WHEN status = 'In-consultation' THEN 1 END) as ongoing
    INTO session_stats
    FROM visits 
    WHERE clinic_id = p_clinic_id 
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE;
    
    total_patients_count := session_stats.total;
    completed_patients_count := session_stats.completed;
    waiting_patients_count := session_stats.waiting;
    skipped_patients_count := session_stats.skipped;
    ongoing_consultations_count := session_stats.ongoing;
    
    -- 2. HANDLE WAITING PATIENTS - Mark as No Show
    -- These are patients who checked in but were never called
    UPDATE visits 
    SET 
        status = 'No-show',
        session_end_time = p_session_end_time,
        waiting_time_minutes = CASE 
            WHEN check_in_time IS NOT NULL THEN
                EXTRACT(EPOCH FROM (p_session_end_time - check_in_time)) / 60
            ELSE 0
        END
    WHERE clinic_id = p_clinic_id 
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE
    AND status = 'Waiting';
    
    -- Update corresponding queue items
    UPDATE queue 
    SET status = 'No-show'
    WHERE clinic_id = p_clinic_id 
    AND appointment_id IN (
        SELECT id FROM visits 
        WHERE clinic_id = p_clinic_id 
        AND doctor_id = p_doctor_id
        AND session = p_session_name
        AND date = CURRENT_DATE
        AND status = 'No-show'
    );
    
    -- 3. HANDLE SKIPPED PATIENTS - Mark as No Show
    -- These are patients who were called but skipped and never rejoined
    UPDATE visits 
    SET 
        status = 'No-show',
        session_end_time = p_session_end_time
    WHERE clinic_id = p_clinic_id 
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE
    AND status = 'Skipped';
    
    -- Update corresponding queue items
    UPDATE queue 
    SET status = 'No-show'
    WHERE clinic_id = p_clinic_id 
    AND appointment_id IN (
        SELECT id FROM visits 
        WHERE clinic_id = p_clinic_id 
        AND doctor_id = p_doctor_id
        AND session = p_session_name
        AND date = CURRENT_DATE
        AND status = 'No-show'
    );
    
    -- 4. ONGOING CONSULTATIONS - LEAVE THEM ALONE
    -- These patients are currently with the doctor and should continue
    -- We don't force complete them - they finish naturally
    
    -- 5. CALCULATE STATISTICS
    -- Count final states
    SELECT 
        COUNT(CASE WHEN status = 'No-show' THEN 1 END) as no_show_count
    INTO session_stats
    FROM visits 
    WHERE clinic_id = p_clinic_id 
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE;
    
    no_show_patients_count := session_stats.no_show_count;
    
    -- Calculate average waiting time for completed consultations
    SELECT 
        COALESCE(AVG(
            CASE 
                WHEN called_time IS NOT NULL AND check_in_time IS NOT NULL THEN
                    EXTRACT(EPOCH FROM (called_time - check_in_time)) / 60
                ELSE 0
            END
        ), 0) as avg_waiting
    INTO avg_waiting_time_calc
    FROM visits 
    WHERE clinic_id = p_clinic_id 
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE
    AND status = 'Completed';
    
    -- Calculate average consultation time for completed consultations
    SELECT 
        COALESCE(AVG(
            CASE 
                WHEN called_time IS NOT NULL AND completed_time IS NOT NULL THEN
                    EXTRACT(EPOCH FROM (completed_time - called_time)) / 60
                ELSE 0
            END
        ), 0) as avg_consultation
    INTO avg_consultation_time_calc
    FROM visits 
    WHERE clinic_id = p_clinic_id 
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE
    AND status = 'Completed';
    
    -- Return comprehensive statistics
    RETURN QUERY SELECT 
        total_patients_count,
        completed_patients_count,
        waiting_patients_count,
        skipped_patients_count,
        no_show_patients_count,
        ongoing_consultations_count,
        avg_waiting_time_calc,
        avg_consultation_time_calc,
        total_revenue_calc;
        
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SIMPLIFIED QUEUE STATUS CONSTRAINTS
-- ============================================================
-- Remove 'Cancelled' status to avoid confusion
-- Keep only: Waiting, In-consultation, Skipped, Completed, No-show

-- Update queue table constraint
ALTER TABLE queue DROP CONSTRAINT IF EXISTS queue_status_check;
ALTER TABLE queue ADD CONSTRAINT queue_status_check 
    CHECK (status IN ('Waiting', 'In-consultation', 'Skipped', 'Completed', 'No-show'));

-- Update visits table constraint  
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_status_check;
ALTER TABLE visits ADD CONSTRAINT visits_status_check 
    CHECK (status IN ('Scheduled', 'Waiting', 'In-consultation', 'Skipped', 'Completed', 'No-show'));

-- ============================================================
-- HELPER FUNCTION: Convert Cancelled to No-show
-- ============================================================
-- This function helps migrate existing 'Cancelled' status to 'No-show'
CREATE OR REPLACE FUNCTION migrate_cancelled_to_no_show()
RETURNS VOID AS $$
BEGIN
    -- Update queue table
    UPDATE queue 
    SET status = 'No-show' 
    WHERE status = 'Cancelled';
    
    -- Update visits table
    UPDATE visits 
    SET status = 'No-show' 
    WHERE status = 'Cancelled';
    
    RAISE NOTICE 'Successfully migrated all Cancelled statuses to No-show';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Test the improved function (replace with your actual clinic_id and doctor_id)
-- SELECT * FROM end_session_with_tracking(
--     'your-clinic-id'::UUID, 
--     'your-doctor-id'::UUID, 
--     'Morning'
-- );

-- Check current status distribution
-- SELECT status, COUNT(*) as count 
-- FROM visits 
-- WHERE clinic_id = 'your-clinic-id'::UUID 
-- AND date = CURRENT_DATE 
-- GROUP BY status;

-- ============================================================
-- MIGRATION INSTRUCTIONS
-- ============================================================
-- 1. Run this SQL script in your Supabase SQL Editor
-- 2. Run the migration function: SELECT migrate_cancelled_to_no_show();
-- 3. Verify the constraints are working
-- 4. Test the improved session end logic
-- ============================================================
