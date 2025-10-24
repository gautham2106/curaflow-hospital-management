-- ============================================================
-- CRITICAL FIX: Add session field to get_full_queue() function
-- ============================================================
-- This fix ensures the queue filtering by session works correctly
-- in the live queue management page.
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" or press Ctrl+Enter
-- 5. Verify success message
--
-- Expected Result: Function updated successfully
-- Time Required: 5 minutes
-- ============================================================

-- Step 1: Drop the existing function (safe - will recreate immediately)
DROP FUNCTION IF EXISTS get_full_queue(UUID);

-- Step 2: Create the updated function WITH session field
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
    session TEXT  -- ← CRITICAL: This field was missing
)
LANGUAGE plpgsql
SECURITY DEFINER
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
        v.session  -- ← CRITICAL: Fetch session from visits table
    FROM queue q
    INNER JOIN visits v ON q.appointment_id = v.id
    INNER JOIN patients p ON v.patient_id = p.id
    INNER JOIN doctors d ON v.doctor_id = d.id
    WHERE q.clinic_id = p_clinic_id
    ORDER BY q.check_in_time ASC;
END;
$$;

-- Step 3: Verify the function works (replace with your actual clinic_id)
-- SELECT * FROM get_full_queue('your-clinic-id-here'::UUID);

-- ============================================================
-- VERIFICATION CHECKLIST
-- ============================================================
-- After running this script, verify:
-- ✓ Function created successfully (no errors)
-- ✓ Test query returns data (if you have queue items)
-- ✓ Session field is present in returned columns
-- ✓ Frontend queue page now filters by session correctly
--
-- Rollback (if needed):
-- If something goes wrong, the old function version is in:
-- COMPLETE-SUPABASE-SETUP.sql (lines 175-204)
-- ============================================================
