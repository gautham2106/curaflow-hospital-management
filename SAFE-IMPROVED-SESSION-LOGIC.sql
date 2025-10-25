-- ============================================================
-- SAFE IMPROVED SESSION LOGIC - NO CONSTRAINT ISSUES
-- ============================================================
-- This version focuses only on the improved session end logic
-- without touching constraints to avoid violation errors
-- ============================================================

-- ============================================================
-- IMPROVED SESSION END FUNCTION
-- ============================================================
-- This function implements the improved session transition logic:
-- 1. Allow ongoing consultations to continue beyond session end
-- 2. Mark waiting and skipped patients as "No-show" at session end
-- 3. Provide detailed session statistics

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS end_session_with_tracking(UUID, UUID, TEXT, TIMESTAMPTZ);

-- Create the improved function to end session with detailed tracking
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
    ongoing_consultations_count INTEGER;
    avg_waiting_time_calc DECIMAL;
    avg_consultation_time_calc DECIMAL;
    total_revenue_calc DECIMAL;
BEGIN
    -- Step 1: Update queue items for the current session and doctor
    -- Mark 'Waiting' and 'Skipped' patients as 'No-show' in the queue
    UPDATE queue
    SET status = 'No-show'
    WHERE clinic_id = p_clinic_id
    AND appointment_id IN (
        SELECT v.id
        FROM visits v
        WHERE v.doctor_id = p_doctor_id
        AND v.session = p_session_name
        AND v.date = CURRENT_DATE
        AND v.clinic_id = p_clinic_id
    )
    AND status IN ('Waiting', 'Skipped');

    -- Note: 'In-consultation' patients are NOT force-completed here.
    -- They are allowed to continue their consultation beyond the session end time.
    -- Their status will be updated to 'Completed' when the receptionist explicitly completes them.

    -- Step 2: Update visit records for the current session and doctor
    -- Mark 'Waiting' and 'Skipped' visits as 'No-show'
    UPDATE visits
    SET
        status = 'No-show',
        session_end_time = p_session_end_time
    WHERE clinic_id = p_clinic_id
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE
    AND status IN ('Waiting', 'Skipped');

    -- For 'In-consultation' visits, only set session_end_time, but keep status as 'In-consultation'
    UPDATE visits
    SET
        session_end_time = p_session_end_time
    WHERE clinic_id = p_clinic_id
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE
    AND status = 'In-consultation';

    -- Step 3: Calculate session statistics
    SELECT
        COUNT(v.id) AS total_patients,
        COUNT(CASE WHEN v.status = 'Completed' THEN 1 END) AS completed_patients,
        COUNT(CASE WHEN q.status = 'Waiting' THEN 1 END) AS waiting_patients, -- Should be 0 after update
        COUNT(CASE WHEN q.status = 'Skipped' THEN 1 END) AS skipped_patients, -- Should be 0 after update
        COUNT(CASE WHEN v.status = 'No-show' THEN 1 END) AS no_show_patients,
        COALESCE(AVG(v.waiting_time_minutes), 0) AS avg_waiting_time,
        COALESCE(AVG(v.consultation_time_minutes), 0) AS avg_consultation_time,
        COALESCE(SUM(v.total_revenue), 0) AS total_revenue
    INTO session_stats
    FROM visits v
    LEFT JOIN queue q ON v.id = q.appointment_id AND q.clinic_id = p_clinic_id
    WHERE v.clinic_id = p_clinic_id
    AND v.doctor_id = p_doctor_id
    AND v.session = p_session_name
    AND v.date = CURRENT_DATE;

    -- Count ongoing consultations (In-consultation status)
    SELECT COUNT(*)
    INTO ongoing_consultations_count
    FROM visits v
    WHERE v.clinic_id = p_clinic_id
    AND v.doctor_id = p_doctor_id
    AND v.session = p_session_name
    AND v.date = CURRENT_DATE
    AND v.status = 'In-consultation';

    -- Calculate averages safely
    avg_waiting_time_calc := COALESCE(session_stats.avg_waiting_time, 0);
    avg_consultation_time_calc := COALESCE(session_stats.avg_consultation_time, 0);
    total_revenue_calc := COALESCE(session_stats.total_revenue, 0);

    -- Return the session statistics
    RETURN QUERY SELECT
        session_stats.total_patients,
        session_stats.completed_patients,
        session_stats.waiting_patients,
        session_stats.skipped_patients,
        session_stats.no_show_patients,
        ongoing_consultations_count,
        avg_waiting_time_calc,
        avg_consultation_time_calc,
        total_revenue_calc;
        
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTION: Get Session Statistics
-- ============================================================
-- This function provides detailed session statistics without ending the session

CREATE OR REPLACE FUNCTION get_session_statistics(
    p_clinic_id UUID, 
    p_doctor_id UUID, 
    p_session_name TEXT
)
RETURNS TABLE(
    total_patients INTEGER,
    completed_patients INTEGER,
    waiting_patients INTEGER,
    skipped_patients INTEGER,
    in_consultation_patients INTEGER,
    no_show_patients INTEGER,
    avg_waiting_time DECIMAL,
    avg_consultation_time DECIMAL,
    total_revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(v.id) AS total_patients,
        COUNT(CASE WHEN v.status = 'Completed' THEN 1 END) AS completed_patients,
        COUNT(CASE WHEN q.status = 'Waiting' THEN 1 END) AS waiting_patients,
        COUNT(CASE WHEN q.status = 'Skipped' THEN 1 END) AS skipped_patients,
        COUNT(CASE WHEN v.status = 'In-consultation' THEN 1 END) AS in_consultation_patients,
        COUNT(CASE WHEN v.status = 'No-show' THEN 1 END) AS no_show_patients,
        COALESCE(AVG(v.waiting_time_minutes), 0) AS avg_waiting_time,
        COALESCE(AVG(v.consultation_time_minutes), 0) AS avg_consultation_time,
        COALESCE(SUM(v.total_revenue), 0) AS total_revenue
    FROM visits v
    LEFT JOIN queue q ON v.id = q.appointment_id AND q.clinic_id = p_clinic_id
    WHERE v.clinic_id = p_clinic_id
    AND v.doctor_id = p_doctor_id
    AND v.session = p_session_name
    AND v.date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE 'Improved session logic functions created successfully!';
    RAISE NOTICE 'end_session_with_tracking() - Handles session end with improved logic';
    RAISE NOTICE 'get_session_statistics() - Provides detailed session statistics';
    RAISE NOTICE 'Key improvements:';
    RAISE NOTICE '  - Ongoing consultations can continue beyond session end';
    RAISE NOTICE '  - Waiting/Skipped patients become No-show at session end';
    RAISE NOTICE '  - Detailed statistics including ongoing consultations';
END $$;
