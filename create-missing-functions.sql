-- Create missing database functions for queue management
-- Run this in your Supabase SQL Editor

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS complete_previous_consultation(UUID, UUID);
DROP FUNCTION IF EXISTS end_session_for_doctor(UUID, TEXT, TEXT);

-- Create complete_previous_consultation function
CREATE OR REPLACE FUNCTION complete_previous_consultation(p_doctor_id UUID, p_clinic_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
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
END;
$$;

-- Create end_session_for_doctor function
CREATE OR REPLACE FUNCTION end_session_for_doctor(p_clinic_id UUID, p_doctor_name TEXT, p_session_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
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
END;
$$;

-- Test the functions
SELECT 'Functions created successfully' as status;

