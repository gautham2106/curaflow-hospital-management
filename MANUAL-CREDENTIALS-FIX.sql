-- MANUAL FIX: Create Default Clinic Credentials
-- Run this in Supabase SQL Editor if the default credentials are missing

-- First, check if clinics exist
SELECT id, name, admin_username, admin_pin, is_active FROM clinics;

-- If no clinics exist, create them manually
INSERT INTO clinics (
    id, name, address, phone, email,
    admin_username, admin_pin, admin_name,
    subscription_plan, max_doctors, max_patients_per_day,
    is_active, created_at
) VALUES 
(
    uuid_generate_v4(),
    'CuraFlow Central Hospital',
    '123 Medical Center Drive',
    '555-0100',
    'info@curaflow.com',
    'admin',
    '1234',
    'Admin User',
    'premium',
    20,
    200,
    TRUE,
    NOW()
),
(
    uuid_generate_v4(),
    'Sunrise Medical Clinic',
    '456 Health Avenue',
    '555-0200',
    'contact@sunrise.com',
    'sunrise-admin',
    '5678',
    'Sunrise Admin',
    'basic',
    10,
    100,
    TRUE,
    NOW()
)
ON CONFLICT (admin_username) DO NOTHING;

-- Create default sessions for each clinic
INSERT INTO sessions (clinic_id, name, start_time, end_time)
SELECT 
    c.id,
    session_name,
    session_start,
    session_end
FROM clinics c
CROSS JOIN (
    VALUES 
    ('Morning', '09:00', '13:00'),
    ('Afternoon', '14:00', '18:00'),
    ('Evening', '18:00', '21:00')
) AS sessions(session_name, session_start, session_end)
WHERE c.name IN ('CuraFlow Central Hospital', 'Sunrise Medical Clinic')
ON CONFLICT DO NOTHING;

-- Create default departments for each clinic
INSERT INTO departments (clinic_id, name)
SELECT 
    c.id,
    dept_name
FROM clinics c
CROSS JOIN (
    VALUES 
    ('General Medicine'),
    ('Cardiology'),
    ('Pediatrics'),
    ('Orthopedics')
) AS depts(dept_name)
WHERE c.name IN ('CuraFlow Central Hospital', 'Sunrise Medical Clinic')
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 
    c.name,
    c.admin_username,
    c.admin_pin,
    c.is_active,
    COUNT(s.id) as sessions_count,
    COUNT(d.id) as departments_count
FROM clinics c
LEFT JOIN sessions s ON c.id = s.clinic_id
LEFT JOIN departments d ON c.id = d.clinic_id
WHERE c.name IN ('CuraFlow Central Hospital', 'Sunrise Medical Clinic')
GROUP BY c.id, c.name, c.admin_username, c.admin_pin, c.is_active;

-- Test the authenticate_clinic function
SELECT * FROM authenticate_clinic('admin', '1234');
SELECT * FROM authenticate_clinic('sunrise-admin', '5678');

-- Show success message
SELECT 'Default clinic credentials created successfully!' as status;
