-- ============================================================
-- QUICK FIX: Resolve Constraint Violation Error
-- ============================================================
-- Run this immediately to fix the constraint violation error
-- ============================================================

-- STEP 1: First, drop the problematic constraint
ALTER TABLE queue DROP CONSTRAINT IF EXISTS queue_status_check;
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_status_check;

-- STEP 2: Migrate existing 'Cancelled' data to 'No-show'
UPDATE queue 
SET status = 'No-show' 
WHERE status = 'Cancelled';

UPDATE visits 
SET status = 'No-show' 
WHERE status = 'Cancelled';

-- STEP 3: Verify migration
SELECT 'Cancelled statuses remaining in queue:' as info, COUNT(*) as count 
FROM queue 
WHERE status = 'Cancelled';

SELECT 'Cancelled statuses remaining in visits:' as info, COUNT(*) as count 
FROM visits 
WHERE status = 'Cancelled';

-- STEP 4: Add the new constraint (should work now)
ALTER TABLE queue ADD CONSTRAINT queue_status_check 
    CHECK (status IN ('Waiting', 'In-consultation', 'Skipped', 'Completed', 'No-show'));

ALTER TABLE visits ADD CONSTRAINT visits_status_check 
    CHECK (status IN ('Scheduled', 'Waiting', 'In-consultation', 'Skipped', 'Completed', 'No-show'));

-- STEP 5: Verify success
SELECT 'Migration completed successfully!' as status;
SELECT 'Constraint violation should be resolved' as info;
