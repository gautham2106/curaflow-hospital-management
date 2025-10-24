-- Populate Database with Comprehensive Test Data
-- This script creates realistic test data for thorough testing

-- First, let's ensure we have the clinic
-- Use a fixed UUID for consistency
INSERT INTO clinics (id, name, address, phone, email, created_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'CuraFlow Central Hospital',
    '123 Medical Center Drive, Healthcare City, HC 12345',
    '+1-555-0123',
    'info@curaflowcentral.com',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Add more departments
INSERT INTO departments (id, clinic_id, name, created_at)
VALUES 
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Cardiology', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Neurology', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Orthopedics', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Pediatrics', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Dermatology', NOW())
ON CONFLICT DO NOTHING;

-- Add more doctors
INSERT INTO doctors (id, clinic_id, name, specialty, phone, status, created_at)
VALUES 
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Dr. Sarah Johnson', 'Cardiology', '+1-555-1001', 'Available', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Dr. Michael Chen', 'Neurology', '+1-555-1002', 'Available', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Dr. Emily Rodriguez', 'Orthopedics', '+1-555-1003', 'Available', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Dr. David Kim', 'Pediatrics', '+1-555-1004', 'Available', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Dr. Lisa Thompson', 'Dermatology', '+1-555-1005', 'Available', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Dr. James Wilson', 'General Medicine', '+1-555-1006', 'Available', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Dr. Maria Garcia', 'Internal Medicine', '+1-555-1007', 'Available', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Dr. Robert Brown', 'Emergency Medicine', '+1-555-1008', 'Available', NOW())
ON CONFLICT DO NOTHING;

-- Add sessions for the clinic
INSERT INTO sessions (id, clinic_id, name, start_time, end_time, created_at)
VALUES 
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Morning', '09:00', '12:00', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Afternoon', '14:00', '17:00', NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Evening', '18:00', '21:00', NOW())
ON CONFLICT DO NOTHING;

-- Create test patients
INSERT INTO patients (id, clinic_id, family_id, name, phone, age, gender, last_visit, total_visits, created_at)
VALUES 
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'John Smith', '+1-555-2001', 39, 'Male', NOW() - INTERVAL '2 days', 3, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Jane Doe', '+1-555-2003', 34, 'Female', NOW() - INTERVAL '1 day', 2, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Mike Johnson', '+1-555-2005', 46, 'Male', NOW() - INTERVAL '3 days', 1, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Sarah Williams', '+1-555-2007', 32, 'Female', NOW() - INTERVAL '1 week', 4, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'David Brown', '+1-555-2009', 36, 'Male', NOW() - INTERVAL '5 days', 2, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Lisa Davis', '+1-555-2011', 29, 'Female', NOW() - INTERVAL '2 days', 1, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Tom Wilson', '+1-555-2013', 41, 'Male', NOW() - INTERVAL '4 days', 3, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Amy Taylor', '+1-555-2015', 33, 'Female', NOW() - INTERVAL '1 day', 2, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Chris Anderson', '+1-555-2017', 37, 'Male', NOW() - INTERVAL '6 days', 1, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Kelly Martinez', '+1-555-2019', 31, 'Female', NOW() - INTERVAL '3 days', 2, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Ryan Thompson', '+1-555-2021', 38, 'Male', NOW() - INTERVAL '2 days', 1, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Michelle Garcia', '+1-555-2023', 30, 'Female', NOW() - INTERVAL '1 week', 3, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Daniel Lee', '+1-555-2025', 35, 'Male', NOW() - INTERVAL '4 days', 2, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Jennifer White', '+1-555-2027', 28, 'Female', NOW() - INTERVAL '1 day', 1, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Kevin Harris', '+1-555-2029', 40, 'Male', NOW() - INTERVAL '5 days', 2, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Nicole Clark', '+1-555-2031', 27, 'Female', NOW() - INTERVAL '2 days', 1, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Brian Lewis', '+1-555-2033', 43, 'Male', NOW() - INTERVAL '3 days', 3, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Stephanie Walker', '+1-555-2035', 26, 'Female', NOW() - INTERVAL '1 day', 1, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Jason Hall', '+1-555-2037', 42, 'Male', NOW() - INTERVAL '6 days', 2, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', uuid_generate_v4(), 'Rachel Young', '+1-555-2039', 25, 'Female', NOW() - INTERVAL '4 days', 1, NOW())
ON CONFLICT DO NOTHING;

-- Get doctor and patient IDs for creating visits
DO $$
DECLARE
    doctor_rec RECORD;
    patient_rec RECORD;
    visit_id UUID;
    queue_id UUID;
    token_counter INTEGER := 1;
    visit_date DATE := CURRENT_DATE;
    session_times TEXT[] := ARRAY['Morning', 'Afternoon', 'Evening'];
    current_session TEXT;
    check_in_time TIMESTAMP WITH TIME ZONE;
    called_time TIMESTAMP WITH TIME ZONE;
    completed_time TIMESTAMP WITH TIME ZONE;
    visit_status TEXT;
    queue_status TEXT;
    session_start_hour INTEGER;
    session_end_hour INTEGER;
    random_num INTEGER;
BEGIN
    -- Create visits for each doctor and session
    FOR doctor_rec IN SELECT id, name, specialty FROM doctors WHERE clinic_id = '550e8400-e29b-41d4-a716-446655440000' AND status = 'Available' LOOP
        FOR current_session IN SELECT unnest(session_times) LOOP
            -- Determine session times
            CASE current_session
                WHEN 'Morning' THEN
                    session_start_hour := 9;
                    session_end_hour := 12;
                WHEN 'Afternoon' THEN
                    session_start_hour := 14;
                    session_end_hour := 17;
                WHEN 'Evening' THEN
                    session_start_hour := 18;
                    session_end_hour := 21;
            END CASE;
            
            -- Create 3-5 visits per doctor per session
            FOR i IN 1..(3 + (random() * 3)::INTEGER) LOOP
                -- Get a random patient
                SELECT id, name, phone FROM patients 
                WHERE clinic_id = '550e8400-e29b-41d4-a716-446655440000' 
                ORDER BY random() 
                LIMIT 1 INTO patient_rec;
                
                -- Create visit
                visit_id := uuid_generate_v4();
                
                -- Calculate times based on session and random factors
                check_in_time := visit_date + (session_start_hour + (random() * 2))::INTEGER * INTERVAL '1 hour' + (random() * 30)::INTEGER * INTERVAL '1 minute';
                called_time := check_in_time + (random() * 30)::INTEGER * INTERVAL '1 minute';
                completed_time := called_time + (15 + random() * 30)::INTEGER * INTERVAL '1 minute';
                
                -- Determine status (mix of different statuses)
                random_num := (random() * 100)::INTEGER;
                IF random_num <= 60 THEN
                    visit_status := 'Completed';
                    queue_status := 'Completed';
                ELSIF random_num <= 75 THEN
                    visit_status := 'No-show';
                    queue_status := 'Cancelled';
                    called_time := NULL;
                    completed_time := NULL;
                ELSIF random_num <= 85 THEN
                    visit_status := 'Cancelled';
                    queue_status := 'Cancelled';
                    completed_time := NULL;
                ELSIF random_num <= 95 THEN
                    visit_status := 'In-consultation';
                    queue_status := 'In-consultation';
                    completed_time := NULL;
                ELSE
                    visit_status := 'Checked-in';
                    queue_status := 'Waiting';
                    called_time := NULL;
                    completed_time := NULL;
                END IF;
                
                -- Insert visit
                INSERT INTO visits (
                    id, clinic_id, patient_id, doctor_id, token_number, date, session,
                    check_in_time, called_time, completed_time, status, fee, payment_method,
                    waiting_time_minutes, consultation_time_minutes, total_time_minutes,
                    was_skipped, skip_reason, was_out_of_turn, out_of_turn_reason,
                    session_end_time, visit_notes, patient_satisfaction_rating
                ) VALUES (
                    visit_id, '550e8400-e29b-41d4-a716-446655440000', patient_rec.id, doctor_rec.id, token_counter,
                    visit_date, current_session, check_in_time, called_time, completed_time,
                    visit_status, 
                    CASE WHEN visit_status = 'Completed' THEN (100 + random() * 200)::DECIMAL(10,2) ELSE NULL END,
                    CASE WHEN visit_status = 'Completed' THEN 
                        CASE (random() * 3)::INTEGER WHEN 0 THEN 'Cash' WHEN 1 THEN 'UPI' ELSE 'Card' END
                    ELSE NULL END,
                    CASE WHEN called_time IS NOT NULL AND check_in_time IS NOT NULL THEN
                        EXTRACT(EPOCH FROM (called_time - check_in_time)) / 60
                    ELSE 0 END,
                    CASE WHEN called_time IS NOT NULL AND completed_time IS NOT NULL THEN
                        EXTRACT(EPOCH FROM (completed_time - called_time)) / 60
                    ELSE 0 END,
                    CASE WHEN check_in_time IS NOT NULL AND completed_time IS NOT NULL THEN
                        EXTRACT(EPOCH FROM (completed_time - check_in_time)) / 60
                    ELSE 0 END,
                    visit_status = 'Cancelled',
                    CASE WHEN visit_status = 'Cancelled' AND random_num > 75 THEN 
                        CASE (random() * 4)::INTEGER 
                            WHEN 0 THEN 'Patient requested to skip'
                            WHEN 1 THEN 'Doctor unavailable'
                            WHEN 2 THEN 'Patient emergency'
                            ELSE 'Rescheduled'
                        END
                    ELSE NULL END,
                    (random() * 10)::INTEGER < 2, -- 20% chance of out of turn
                    CASE WHEN (random() * 10)::INTEGER < 2 THEN
                        CASE (random() * 3)::INTEGER 
                            WHEN 0 THEN 'Emergency case'
                            WHEN 1 THEN 'VIP patient'
                            ELSE 'Doctor request'
                        END
                    ELSE NULL END,
                    CASE WHEN visit_status = 'Completed' THEN completed_time ELSE NULL END,
                    CASE WHEN visit_status = 'Completed' THEN 
                        CASE (random() * 3)::INTEGER 
                            WHEN 0 THEN 'Regular checkup completed successfully'
                            WHEN 1 THEN 'Prescription provided, follow-up in 2 weeks'
                            ELSE 'Treatment plan discussed with patient'
                        END
                    ELSE NULL END,
                    CASE WHEN visit_status = 'Completed' THEN (3 + random() * 2)::INTEGER ELSE NULL END
                );
                
                -- Insert queue entry
                queue_id := uuid_generate_v4();
                INSERT INTO queue (id, clinic_id, appointment_id, check_in_time, status, priority)
                VALUES (
                    queue_id, '550e8400-e29b-41d4-a716-446655440000', visit_id, check_in_time, queue_status,
                    CASE (random() * 3)::INTEGER WHEN 0 THEN 'High' WHEN 1 THEN 'Medium' ELSE 'Low' END
                );
                
                token_counter := token_counter + 1;
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Test data populated successfully!';
END $$;

-- Create some ad resources for testing
INSERT INTO ad_resources (id, clinic_id, title, type, url, duration, display_order, created_at)
VALUES 
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Health Checkup Promotion', 'image', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800', 30, 1, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Emergency Services', 'image', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800', 25, 2, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Cardiology Department', 'image', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800', 35, 3, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Pediatric Care', 'image', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', 20, 4, NOW()),
    (uuid_generate_v4(), '550e8400-e29b-41d4-a716-446655440000', 'Wellness Program', 'image', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 40, 5, NOW())
ON CONFLICT DO NOTHING;

-- Note: Clinic statistics are not stored in the clinics table
-- They can be calculated dynamically when needed

-- Display summary
SELECT 
    'Data Population Complete!' as status,
    (SELECT COUNT(*) FROM doctors WHERE clinic_id = '550e8400-e29b-41d4-a716-446655440000') as doctors_count,
    (SELECT COUNT(*) FROM patients WHERE clinic_id = '550e8400-e29b-41d4-a716-446655440000') as patients_count,
    (SELECT COUNT(*) FROM visits WHERE clinic_id = '550e8400-e29b-41d4-a716-446655440000') as visits_count,
    (SELECT COUNT(*) FROM queue WHERE clinic_id = '550e8400-e29b-41d4-a716-446655440000') as queue_count;
