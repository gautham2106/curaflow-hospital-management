-- ============================================================
-- INTELLIGENT SESSION TRANSITION LOGIC
-- ============================================================
-- Handles overlapping sessions and overflow patients intelligently
-- ============================================================

-- ============================================================
-- FUNCTION: Handle Session Transition with Overflow
-- ============================================================
-- This function handles the transition between sessions when there are
-- still patients waiting in the current session

CREATE OR REPLACE FUNCTION handle_session_transition(
    p_clinic_id UUID,
    p_doctor_id UUID,
    p_ending_session TEXT,
    p_next_session TEXT,
    p_transition_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    total_patients INTEGER,
    completed_patients INTEGER,
    waiting_patients INTEGER,
    skipped_patients INTEGER,
    no_show_patients INTEGER,
    overflow_patients INTEGER,
    transitioned_patients INTEGER,
    avg_waiting_time DECIMAL,
    avg_consultation_time DECIMAL,
    total_revenue DECIMAL
) AS $$
DECLARE
    session_stats RECORD;
    overflow_count INTEGER;
    transitioned_count INTEGER;
    avg_waiting_time_calc DECIMAL;
    avg_consultation_time_calc DECIMAL;
    total_revenue_calc DECIMAL;
BEGIN
    -- Step 1: Count patients still waiting in the ending session
    SELECT COUNT(*) INTO overflow_count
    FROM queue q
    JOIN visits v ON q.appointment_id = v.id
    WHERE q.clinic_id = p_clinic_id
    AND v.doctor_id = p_doctor_id
    AND v.session = p_ending_session
    AND v.date = CURRENT_DATE
    AND q.status IN ('Waiting', 'Skipped');

    -- Step 2: Handle overflow patients based on clinic policy
    -- Option A: Move overflow patients to next session (if same day)
    -- Option B: Mark as no-show and reschedule
    -- Option C: Create extended session
    
    -- For now, we'll implement Option A: Move to next session
    IF overflow_count > 0 THEN
        -- Update visits to next session
        UPDATE visits
        SET 
            session = p_next_session,
            status = 'Scheduled' -- Reset to scheduled for next session
        WHERE clinic_id = p_clinic_id
        AND doctor_id = p_doctor_id
        AND session = p_ending_session
        AND date = CURRENT_DATE
        AND id IN (
            SELECT v.id
            FROM visits v
            JOIN queue q ON v.id = q.appointment_id
            WHERE q.clinic_id = p_clinic_id
            AND q.status IN ('Waiting', 'Skipped')
        );

        -- Update queue status
        UPDATE queue
        SET status = 'Waiting' -- Reset to waiting for next session
        WHERE clinic_id = p_clinic_id
        AND appointment_id IN (
            SELECT v.id
            FROM visits v
            WHERE v.clinic_id = p_clinic_id
            AND v.doctor_id = p_doctor_id
            AND v.session = p_next_session
            AND v.date = CURRENT_DATE
        );

        -- Count transitioned patients
        SELECT COUNT(*) INTO transitioned_count
        FROM visits v
        WHERE v.clinic_id = p_clinic_id
        AND v.doctor_id = p_doctor_id
        AND v.session = p_next_session
        AND v.date = CURRENT_DATE
        AND v.status = 'Scheduled';
    END IF;

    -- Step 3: Mark remaining patients as no-show
    -- (Only those who couldn't be transitioned)
    UPDATE queue
    SET status = 'No-show'
    WHERE clinic_id = p_clinic_id
    AND appointment_id IN (
        SELECT v.id
        FROM visits v
        WHERE v.doctor_id = p_doctor_id
        AND v.session = p_ending_session
        AND v.date = CURRENT_DATE
        AND v.clinic_id = p_clinic_id
    )
    AND status IN ('Waiting', 'Skipped');

    -- Step 4: Update visit records
    UPDATE visits
    SET
        status = 'No-show',
        session_end_time = p_transition_time
    WHERE clinic_id = p_clinic_id
    AND doctor_id = p_doctor_id
    AND session = p_ending_session
    AND date = CURRENT_DATE
    AND status IN ('Waiting', 'Skipped');

    -- Step 5: Calculate statistics
    SELECT
        COUNT(v.id) AS total_patients,
        COUNT(CASE WHEN v.status = 'Completed' THEN 1 END) AS completed_patients,
        COUNT(CASE WHEN q.status = 'Waiting' THEN 1 END) AS waiting_patients,
        COUNT(CASE WHEN q.status = 'Skipped' THEN 1 END) AS skipped_patients,
        COUNT(CASE WHEN v.status = 'No-show' THEN 1 END) AS no_show_patients,
        COALESCE(AVG(v.waiting_time_minutes), 0) AS avg_waiting_time,
        COALESCE(AVG(v.consultation_time_minutes), 0) AS avg_consultation_time,
        COALESCE(SUM(v.total_revenue), 0) AS total_revenue
    INTO session_stats
    FROM visits v
    LEFT JOIN queue q ON v.id = q.appointment_id AND q.clinic_id = p_clinic_id
    WHERE v.clinic_id = p_clinic_id
    AND v.doctor_id = p_doctor_id
    AND v.session = p_ending_session
    AND v.date = CURRENT_DATE;

    -- Calculate averages safely
    avg_waiting_time_calc := COALESCE(session_stats.avg_waiting_time, 0);
    avg_consultation_time_calc := COALESCE(session_stats.avg_consultation_time, 0);
    total_revenue_calc := COALESCE(session_stats.total_revenue, 0);

    -- Return statistics
    RETURN QUERY SELECT
        session_stats.total_patients,
        session_stats.completed_patients,
        session_stats.waiting_patients,
        session_stats.skipped_patients,
        session_stats.no_show_patients,
        overflow_count,
        transitioned_count,
        avg_waiting_time_calc,
        avg_consultation_time_calc,
        total_revenue_calc;
        
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Check Session Overlap
-- ============================================================
-- This function checks if there will be session overlap and suggests solutions

CREATE OR REPLACE FUNCTION check_session_overlap(
    p_clinic_id UUID,
    p_doctor_id UUID,
    p_current_session TEXT,
    p_next_session TEXT
)
RETURNS TABLE(
    has_overlap BOOLEAN,
    waiting_patients INTEGER,
    suggested_action TEXT,
    overflow_patients INTEGER
) AS $$
DECLARE
    waiting_count INTEGER;
    overflow_count INTEGER;
    suggested_action TEXT;
BEGIN
    -- Count patients still waiting in current session
    SELECT COUNT(*) INTO waiting_count
    FROM queue q
    JOIN visits v ON q.appointment_id = v.id
    WHERE q.clinic_id = p_clinic_id
    AND v.doctor_id = p_doctor_id
    AND v.session = p_current_session
    AND v.date = CURRENT_DATE
    AND q.status IN ('Waiting', 'Skipped');

    -- Count patients already scheduled for next session
    SELECT COUNT(*) INTO overflow_count
    FROM visits v
    WHERE v.clinic_id = p_clinic_id
    AND v.doctor_id = p_doctor_id
    AND v.session = p_next_session
    AND v.date = CURRENT_DATE
    AND v.status = 'Scheduled';

    -- Determine if there's overlap
    has_overlap := waiting_count > 0;

    -- Suggest action based on situation
    IF waiting_count = 0 THEN
        suggested_action := 'No overlap - safe to end session';
    ELSIF waiting_count <= 5 THEN
        suggested_action := 'Minor overflow - move patients to next session';
    ELSIF waiting_count <= 10 THEN
        suggested_action := 'Moderate overflow - consider extending current session by 30 minutes';
    ELSE
        suggested_action := 'Major overflow - consider extending current session by 1 hour or reschedule overflow patients';
    END IF;

    RETURN QUERY SELECT
        has_overlap,
        waiting_count,
        suggested_action,
        overflow_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Extend Session
-- ============================================================
-- This function extends the current session to accommodate overflow patients

CREATE OR REPLACE FUNCTION extend_session(
    p_clinic_id UUID,
    p_doctor_id UUID,
    p_session_name TEXT,
    p_extension_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(
    session_extended BOOLEAN,
    new_end_time TIMESTAMP WITH TIME ZONE,
    patients_affected INTEGER
) AS $$
DECLARE
    new_end_time TIMESTAMP WITH TIME ZONE;
    affected_count INTEGER;
BEGIN
    -- Calculate new end time
    new_end_time := NOW() + (p_extension_minutes || ' minutes')::INTERVAL;

    -- Update session end time in visits
    UPDATE visits
    SET session_end_time = new_end_time
    WHERE clinic_id = p_clinic_id
    AND doctor_id = p_doctor_id
    AND session = p_session_name
    AND date = CURRENT_DATE;

    -- Count affected patients
    SELECT COUNT(*) INTO affected_count
    FROM visits v
    WHERE v.clinic_id = p_clinic_id
    AND v.doctor_id = p_doctor_id
    AND v.session = p_session_name
    AND v.date = CURRENT_DATE;

    RETURN QUERY SELECT
        TRUE,
        new_end_time,
        affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE 'Intelligent Session Transition functions created successfully!';
    RAISE NOTICE 'handle_session_transition() - Handles overflow patients intelligently';
    RAISE NOTICE 'check_session_overlap() - Checks for potential session conflicts';
    RAISE NOTICE 'extend_session() - Extends current session to accommodate overflow';
    RAISE NOTICE 'Key features:';
    RAISE NOTICE '  - Moves overflow patients to next session';
    RAISE NOTICE '  - Suggests appropriate actions based on overflow size';
    RAISE NOTICE '  - Allows session extension when needed';
    RAISE NOTICE '  - Maintains data integrity and patient care';
END $$;
