-- Fix parameter type conflicts in database functions
-- Run this in your Supabase SQL Editor

-- Drop the conflicting function
DROP FUNCTION IF EXISTS end_session_for_doctor(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS end_session_for_doctor(UUID, CHARACTER VARYING, CHARACTER VARYING);

-- Create the function with explicit parameter types
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

-- Test the function
SELECT 'Function fixed successfully' as status;
