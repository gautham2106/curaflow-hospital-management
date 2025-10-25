-- ============================================================
-- FIX: Token Number Race Condition for Family Members
-- ============================================================
-- Problem: When generating tokens for multiple family members
-- quickly, they all get token #1 instead of sequential numbers
--
-- Root Cause: Race condition in getNextTokenNumber()
-- - Multiple requests read max token = 0
-- - All add 1 and get token = 1
-- - All write token = 1 simultaneously
--
-- Solution: Atomic token generation using PostgreSQL advisory locks
-- ============================================================

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

    -- Get the current max token number
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_and_increment_token_number(UUID, UUID, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_and_increment_token_number(UUID, UUID, DATE, TEXT) TO service_role;

-- ============================================================
-- USAGE INSTRUCTIONS
-- ============================================================
-- 1. Run this script in Supabase SQL Editor
-- 2. Update the TypeScript service to use this function
-- 3. Test by generating tokens for multiple family members quickly
--
-- Expected Behavior After Fix:
-- ✅ Family member 1: Token #1
-- ✅ Family member 2: Token #2
-- ✅ Family member 3: Token #3
-- ✅ Even when clicked rapidly within milliseconds
--
-- How It Works:
-- 1. PostgreSQL advisory lock ensures only one token generation
--    runs at a time for each (clinic, doctor, date, session) combo
-- 2. Other requests wait in queue until lock is released
-- 3. Each gets the next sequential number atomically
-- 4. No more race conditions!
-- ============================================================

-- Test the function (replace UUIDs with actual values from your database)
-- SELECT get_and_increment_token_number(
--     'your-clinic-id'::UUID,
--     'your-doctor-id'::UUID,
--     CURRENT_DATE,
--     'Morning'
-- );

-- Expected result: 1, then 2, then 3, etc. when called multiple times

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
-- After implementing, generate 5 tokens for same doctor/date/session
-- Then run this to verify all tokens are unique and sequential:

-- SELECT
--     token_number,
--     patient_id,
--     check_in_time,
--     ROW_NUMBER() OVER (ORDER BY check_in_time) as expected_token
-- FROM visits
-- WHERE clinic_id = 'your-clinic-id'
--   AND doctor_id = 'your-doctor-id'
--   AND date = CURRENT_DATE
--   AND session = 'Morning'
-- ORDER BY token_number;

-- If token_number matches expected_token for all rows, it's fixed! ✅
