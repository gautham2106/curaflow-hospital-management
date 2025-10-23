-- Quick fix for the function return type error
-- Run this first, then run the main schema

-- Drop the existing function that's causing the conflict
DROP FUNCTION IF EXISTS get_full_queue(UUID);

-- Now you can run the main supabase-schema-fixed.sql file
