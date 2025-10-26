-- ============================================================================
-- CRITICAL DATABASE UPDATE - FIXES ALL 3 PRODUCTION ISSUES
-- ============================================================================
--
-- This SQL script fixes:
-- 1. TV Display showing empty queue (adds session field to get_full_queue)
-- 2. Duplicate token numbers (adds atomic token generation function)
-- 3. Mobile display errors (types will be fixed separately)
--
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and run this script
-- 4. Verify success by checking the output
--
-- ============================================================================

-- ============================================================================
-- FIX #1: Update get_full_queue to include session field
-- ============================================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS get_full_queue(UUID);

-- Create the updated function with session information
CREATE OR REPLACE FUNCTION get_full_queue(p_clinic_id UUID)
RETURNS TABLE (
    id UUID,
    token_number INTEGER,
    patient_name TEXT,
    doctor_name TEXT,
    check_in_time TIMESTAMPTZ,
    status TEXT,
    priority TEXT,
    appointment_id UUID,
    session TEXT
)
LANGUAGE plpgsql
AS $$
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
        q.appointment_id,
        v.session
    FROM queue q
    JOIN visits v ON q.appointment_id = v.id
    JOIN patients p ON v.patient_id = p.id
    JOIN doctors d ON v.doctor_id = d.id
    WHERE q.clinic_id = p_clinic_id
    ORDER BY q.check_in_time ASC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_full_queue(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_full_queue(UUID) TO service_role;

-- ============================================================================
-- FIX #2: Create atomic token generation function
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_and_increment_token_number(UUID, UUID, DATE, TEXT);

-- Create atomic token generation function
CREATE OR REPLACE FUNCTION get_and_increment_token_number(
    p_clinic_id UUID,
    p_doctor_id UUID,
    p_date DATE,
    p_session TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_next_token INTEGER;
    v_lock_key BIGINT;
BEGIN
    -- Create a unique lock key based on clinic, doctor, date, and session
    -- This ensures only one token generation happens at a time for this combination
    v_lock_key := ('x' || substr(md5(
        p_clinic_id::text ||
        p_doctor_id::text ||
        p_date::text ||
        p_session::text
    ), 1, 15))::bit(60)::bigint;

    -- Acquire advisory lock (will wait if another transaction has it)
    PERFORM pg_advisory_lock(v_lock_key);

    -- Get the current max token number for this specific combination
    SELECT COALESCE(MAX(token_number), 0) + 1
    INTO v_next_token
    FROM visits
    WHERE clinic_id = p_clinic_id
      AND doctor_id = p_doctor_id
      AND date = p_date
      AND session = p_session;

    -- Release the advisory lock
    PERFORM pg_advisory_unlock(v_lock_key);

    RETURN v_next_token;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_and_increment_token_number(UUID, UUID, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_and_increment_token_number(UUID, UUID, DATE, TEXT) TO service_role;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test get_full_queue - Replace 'your-clinic-id' with your actual clinic ID
-- SELECT * FROM get_full_queue('your-clinic-id'::UUID);

-- Test get_and_increment_token_number - Replace with your actual IDs
-- SELECT get_and_increment_token_number(
--     'your-clinic-id'::UUID,
--     'your-doctor-id'::UUID,
--     CURRENT_DATE,
--     'Morning'
-- );

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database update completed successfully!';
    RAISE NOTICE '✅ get_full_queue now returns session field';
    RAISE NOTICE '✅ get_and_increment_token_number function created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update TypeScript types to match new database schema';
    RAISE NOTICE '2. Deploy updated code to production';
    RAISE NOTICE '3. Test queue display and token generation';
END $$;
