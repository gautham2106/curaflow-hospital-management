-- Add detailed visit tracking fields to visits table
-- Run this in your Supabase SQL Editor

-- Add new columns for detailed visit tracking
ALTER TABLE visits ADD COLUMN IF NOT EXISTS waiting_time_minutes INTEGER DEFAULT 0;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS consultation_time_minutes INTEGER DEFAULT 0;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS total_time_minutes INTEGER DEFAULT 0;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS was_skipped BOOLEAN DEFAULT FALSE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS skip_reason TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS was_out_of_turn BOOLEAN DEFAULT FALSE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS out_of_turn_reason TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS session_end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_notes TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS patient_satisfaction_rating INTEGER CHECK (patient_satisfaction_rating >= 1 AND patient_satisfaction_rating <= 5);

-- Add index for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_visits_waiting_time ON visits(waiting_time_minutes);
CREATE INDEX IF NOT EXISTS idx_visits_consultation_time ON visits(consultation_time_minutes);
CREATE INDEX IF NOT EXISTS idx_visits_was_skipped ON visits(was_skipped);
CREATE INDEX IF NOT EXISTS idx_visits_session_end_time ON visits(session_end_time);

-- Update the complete_previous_consultation function to calculate times
CREATE OR REPLACE FUNCTION complete_previous_consultation(p_doctor_id UUID, p_clinic_id UUID)
RETURNS VOID AS $$
DECLARE
    visit_record RECORD;
    waiting_time INTEGER;
    consultation_time INTEGER;
    total_time INTEGER;
BEGIN
    -- Get all in-consultation visits for this doctor
    FOR visit_record IN 
        SELECT id, check_in_time, called_time, completed_time
        FROM visits 
        WHERE doctor_id = p_doctor_id 
        AND clinic_id = p_clinic_id 
        AND status = 'In-consultation'
    LOOP
        -- Calculate waiting time (check_in_time to called_time)
        IF visit_record.called_time IS NOT NULL AND visit_record.check_in_time IS NOT NULL THEN
            waiting_time := EXTRACT(EPOCH FROM (visit_record.called_time - visit_record.check_in_time)) / 60;
        ELSE
            waiting_time := 0;
        END IF;
        
        -- Calculate consultation time (called_time to now)
        IF visit_record.called_time IS NOT NULL THEN
            consultation_time := EXTRACT(EPOCH FROM (NOW() - visit_record.called_time)) / 60;
        ELSE
            consultation_time := 0;
        END IF;
        
        -- Calculate total time
        total_time := waiting_time + consultation_time;
        
        -- Update the visit record
        UPDATE visits 
        SET 
            status = 'Completed', 
            completed_time = NOW(),
            waiting_time_minutes = waiting_time,
            consultation_time_minutes = consultation_time,
            total_time_minutes = total_time
        WHERE id = visit_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to end session with detailed tracking for specific doctor and session
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
    visit_record RECORD;
    waiting_time INTEGER;
    consultation_time INTEGER;
    total_time INTEGER;
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
        COUNT(CASE WHEN status = 'Skipped' THEN 1 END) as skipped_patients,
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

SELECT 'Visit tracking fields added successfully' as status;
