-- ============================================================================
-- FIND AND CLEAN UP DUPLICATE TOKENS
-- ============================================================================
-- This script helps identify and optionally clean up duplicate token numbers
-- that were created before the atomic token generation fix was deployed.
-- ============================================================================

-- STEP 1: Find all duplicate tokens (same doctor, same date, same session, same token number)
-- NOTE: Replace 'your-clinic-id' with your actual clinic ID

WITH duplicate_tokens AS (
    SELECT
        v.clinic_id,
        v.doctor_id,
        d.name as doctor_name,
        v.date,
        v.session,
        v.token_number,
        COUNT(*) as duplicate_count,
        ARRAY_AGG(v.id ORDER BY v.created_at) as visit_ids,
        ARRAY_AGG(v.created_at ORDER BY v.created_at) as created_times,
        ARRAY_AGG(p.name ORDER BY v.created_at) as patient_names
    FROM visits v
    JOIN doctors d ON v.doctor_id = d.id
    JOIN patients p ON v.patient_id = p.id
    WHERE v.date = CURRENT_DATE  -- Only today's visits
    -- WHERE v.clinic_id = 'your-clinic-id'::UUID  -- Uncomment and set your clinic ID
    GROUP BY v.clinic_id, v.doctor_id, d.name, v.date, v.session, v.token_number
    HAVING COUNT(*) > 1
)
SELECT
    doctor_name,
    session,
    token_number,
    duplicate_count,
    patient_names,
    created_times,
    visit_ids
FROM duplicate_tokens
ORDER BY doctor_name, session, token_number;

-- STEP 2: After reviewing the duplicates above, you can delete them manually
-- IMPORTANT: Only delete if you're sure which ones to remove!
--
-- Example: To delete a specific visit by ID:
-- DELETE FROM queue WHERE appointment_id = 'visit-id-to-delete'::UUID;
-- DELETE FROM visits WHERE id = 'visit-id-to-delete'::UUID;
--
-- OR to keep only the FIRST created visit and delete the rest:
-- (This is safer - keeps the oldest token)
--
-- Example for a specific duplicate:
-- WITH duplicates AS (
--     SELECT id, ROW_NUMBER() OVER (PARTITION BY doctor_id, date, session, token_number ORDER BY created_at) as rn
--     FROM visits
--     WHERE doctor_id = 'your-doctor-id'::UUID
--     AND date = CURRENT_DATE
--     AND session = 'Morning'
--     AND token_number = 1
-- )
-- DELETE FROM queue WHERE appointment_id IN (SELECT id FROM duplicates WHERE rn > 1);
-- DELETE FROM visits WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

SELECT 'Review the duplicate tokens above. DO NOT run any DELETE commands until you are certain which visits to remove.' as warning;
