-- ============================================================
-- SAFE MIGRATION: Step-by-Step Status Update
-- ============================================================
-- Run these commands ONE BY ONE in Supabase SQL Editor
-- This ensures safe migration without constraint violations
-- ============================================================

-- STEP 1: Check current data before migration
-- Run this first to see what data exists
SELECT 'Current queue statuses:' as info;
SELECT status, COUNT(*) as count 
FROM queue 
GROUP BY status 
ORDER BY status;

SELECT 'Current visit statuses:' as info;
SELECT status, COUNT(*) as count 
FROM visits 
GROUP BY status 
ORDER BY status;

-- ============================================================
-- STEP 2: Migrate existing 'Cancelled' data to 'No-show'
-- ============================================================

-- Update queue table
UPDATE queue 
SET status = 'No-show' 
WHERE status = 'Cancelled';

-- Check how many rows were updated
SELECT 'Queue table updated:' as info, ROW_COUNT() as rows_affected;

-- Update visits table
UPDATE visits 
SET status = 'No-show' 
WHERE status = 'Cancelled';

-- Check how many rows were updated
SELECT 'Visits table updated:' as info, ROW_COUNT() as rows_affected;

-- ============================================================
-- STEP 3: Verify migration was successful
-- ============================================================

-- Check that no 'Cancelled' statuses remain
SELECT 'Remaining Cancelled in queue:' as info, COUNT(*) as count 
FROM queue 
WHERE status = 'Cancelled';

SELECT 'Remaining Cancelled in visits:' as info, COUNT(*) as count 
FROM visits 
WHERE status = 'Cancelled';

-- Check new status distribution
SELECT 'New queue statuses:' as info;
SELECT status, COUNT(*) as count 
FROM queue 
GROUP BY status 
ORDER BY status;

SELECT 'New visit statuses:' as info;
SELECT status, COUNT(*) as count 
FROM visits 
GROUP BY status 
ORDER BY status;

-- ============================================================
-- STEP 4: Update constraints (only after data migration)
-- ============================================================

-- Update queue table constraint
ALTER TABLE queue DROP CONSTRAINT IF EXISTS queue_status_check;
ALTER TABLE queue ADD CONSTRAINT queue_status_check 
    CHECK (status IN ('Waiting', 'In-consultation', 'Skipped', 'Completed', 'No-show'));

-- Update visits table constraint  
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_status_check;
ALTER TABLE visits ADD CONSTRAINT visits_status_check 
    CHECK (status IN ('Scheduled', 'Waiting', 'In-consultation', 'Skipped', 'Completed', 'No-show'));

-- ============================================================
-- STEP 5: Verify constraints are working
-- ============================================================

-- Test that constraints are working by trying to insert invalid status
-- This should fail if constraints are working properly
-- (Comment out if you don't want to test)
/*
INSERT INTO queue (id, clinic_id, appointment_id, status) 
VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Cancelled');
*/

-- ============================================================
-- STEP 6: Final verification
-- ============================================================

-- Check final status distribution
SELECT 'Final queue statuses:' as info;
SELECT status, COUNT(*) as count 
FROM queue 
GROUP BY status 
ORDER BY status;

SELECT 'Final visit statuses:' as info;
SELECT status, COUNT(*) as count 
FROM visits 
GROUP BY status 
ORDER BY status;

-- Check constraints exist
SELECT 'Queue constraints:' as info;
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'queue'::regclass 
AND conname LIKE '%status%';

SELECT 'Visits constraints:' as info;
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'visits'::regclass 
AND conname LIKE '%status%';

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
SELECT 'Migration completed successfully!' as status;
SELECT 'All Cancelled statuses have been converted to No-show' as info;
SELECT 'New constraints are in place to prevent Cancelled status' as info;
