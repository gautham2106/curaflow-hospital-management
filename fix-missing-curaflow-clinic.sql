-- Fix missing CuraFlow Central Hospital clinic
-- This script adds the missing CuraFlow clinic with a proper UUID

-- First, check if CuraFlow clinic exists
SELECT id, name FROM clinics WHERE name = 'CuraFlow Central Hospital';

-- If the above query returns no results, run the following:

-- Insert the missing CuraFlow Central Hospital clinic
-- Note: We'll use a simple INSERT since there's no unique constraint on name
INSERT INTO clinics (id, name, address, phone, email) VALUES
(uuid_generate_v4(), 'CuraFlow Central Hospital', '123 Health St, Wellness City, 12345', '(123) 456-7890', 'contact@curaflow.com');

-- Verify both clinics exist
SELECT id, name, created_at FROM clinics ORDER BY name;

-- If you need to add departments for CuraFlow, run:
-- Get the CuraFlow clinic ID first
SELECT id FROM clinics WHERE name = 'CuraFlow Central Hospital';

-- Then add departments (replace 'CURAFLOW_CLINIC_ID' with the actual UUID from above):
-- INSERT INTO departments (clinic_id, name) VALUES
-- ('CURAFLOW_CLINIC_ID', 'Cardiology'),
-- ('CURAFLOW_CLINIC_ID', 'Pediatrics'),
-- ('CURAFLOW_CLINIC_ID', 'Dermatology'),
-- ('CURAFLOW_CLINIC_ID', 'Neurology'),
-- ('CURAFLOW_CLINIC_ID', 'General Medicine');
