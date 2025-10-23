-- Complete database migration to fix UUID issues
-- Run this in your Supabase SQL Editor

-- Step 1: Check current state
SELECT 'Current clinics:' as status;
SELECT id, name, created_at FROM clinics ORDER BY name;

-- Step 2: Add missing CuraFlow Central Hospital if it doesn't exist
-- First check if it exists
SELECT 'Checking for CuraFlow clinic:' as status;
SELECT id, name FROM clinics WHERE name = 'CuraFlow Central Hospital';

-- If no results above, then insert the missing clinic
INSERT INTO clinics (id, name, address, phone, email) VALUES
(uuid_generate_v4(), 'CuraFlow Central Hospital', '123 Health St, Wellness City, 12345', '(123) 456-7890', 'contact@curaflow.com');

-- Step 3: Verify both clinics exist
SELECT 'After adding CuraFlow:' as status;
SELECT id, name, created_at FROM clinics ORDER BY name;

-- Step 4: Check if departments exist for CuraFlow
SELECT 'CuraFlow departments:' as status;
SELECT d.name as department_name, c.name as clinic_name 
FROM departments d 
JOIN clinics c ON d.clinic_id = c.id 
WHERE c.name = 'CuraFlow Central Hospital';

-- Step 5: Add missing departments for CuraFlow if needed
-- Get the CuraFlow clinic ID first
DO $$
DECLARE
    curaflow_id UUID;
BEGIN
    -- Get CuraFlow clinic ID
    SELECT id INTO curaflow_id FROM clinics WHERE name = 'CuraFlow Central Hospital';
    
    -- Add departments
    INSERT INTO departments (clinic_id, name) VALUES
    (curaflow_id, 'Cardiology'),
    (curaflow_id, 'Pediatrics'),
    (curaflow_id, 'Dermatology'),
    (curaflow_id, 'Neurology'),
    (curaflow_id, 'General Medicine');
    
    RAISE NOTICE 'Added departments for CuraFlow clinic: %', curaflow_id;
END $$;

-- Step 6: Final verification
SELECT 'Final verification:' as status;
SELECT c.name as clinic_name, COUNT(d.id) as department_count
FROM clinics c
LEFT JOIN departments d ON c.id = d.clinic_id
GROUP BY c.id, c.name
ORDER BY c.name;
