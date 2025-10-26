-- ============================================================================
-- VERIFY DATABASE FUNCTIONS ARE INSTALLED
-- ============================================================================

-- Check if get_full_queue function exists and returns session field
SELECT
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name IN ('get_full_queue', 'get_and_increment_token_number')
AND routine_schema = 'public';

-- Check the parameters of get_and_increment_token_number
SELECT
    routine_name,
    parameter_name,
    data_type,
    parameter_mode
FROM information_schema.parameters
WHERE routine_name = 'get_and_increment_token_number'
AND routine_schema = 'public'
ORDER BY ordinal_position;

-- Test get_full_queue to see if session field is returned
-- NOTE: Replace 'your-clinic-id' with your actual clinic ID
-- SELECT * FROM get_full_queue('92fc77cd-e5d8-45b5-a359-a3a83692ed9d'::UUID) LIMIT 5;

SELECT 'Functions verification complete. Check the results above.' as status;
