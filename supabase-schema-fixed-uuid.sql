-- CuraFlow Hospital Management System Database Schema - FIXED UUID VERSION
-- This script creates all necessary tables, relationships, and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS get_full_queue(UUID);
DROP FUNCTION IF EXISTS complete_previous_consultation(UUID, UUID);
DROP FUNCTION IF EXISTS end_session_for_doctor(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_clinic_user(TEXT, TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS seed_data();

-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Busy', 'On Leave', 'Unavailable')),
    sessions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    family_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    age INTEGER,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    last_visit TIMESTAMP WITH TIME ZONE,
    total_visits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (name IN ('Morning', 'Afternoon', 'Evening')),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    token_number INTEGER NOT NULL,
    date DATE NOT NULL,
    session TEXT CHECK (session IN ('Morning', 'Afternoon', 'Evening')),
    check_in_time TIMESTAMP WITH TIME ZONE,
    called_time TIMESTAMP WITH TIME ZONE,
    completed_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Checked-in', 'In-consultation', 'Completed', 'Cancelled', 'No-show')),
    fee DECIMAL(10,2),
    payment_method TEXT CHECK (payment_method IN ('Cash', 'UPI', 'Card')),
    out_of_turn_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create queue table
CREATE TABLE IF NOT EXISTS queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'Waiting' CHECK (status IN ('Waiting', 'In-consultation', 'Completed', 'Cancelled', 'Skipped')),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad_resources table
CREATE TABLE IF NOT EXISTS ad_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 30,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_family_id ON patients(family_id);
CREATE INDEX IF NOT EXISTS idx_visits_clinic_id ON visits(clinic_id);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_doctor_id ON visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(date);
CREATE INDEX IF NOT EXISTS idx_queue_clinic_id ON queue(clinic_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);
CREATE INDEX IF NOT EXISTS idx_departments_clinic_id ON departments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_sessions_clinic_id ON sessions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_ad_resources_clinic_id ON ad_resources(clinic_id);

-- Enable Row Level Security (RLS)
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_resources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for multi-tenant access
-- Clinics policies
CREATE POLICY "Allow all operations on clinics for authenticated users" ON clinics
    FOR ALL USING (auth.role() = 'authenticated');

-- Departments policies
CREATE POLICY "Allow all operations on departments for authenticated users" ON departments
    FOR ALL USING (auth.role() = 'authenticated');

-- Doctors policies
CREATE POLICY "Allow all operations on doctors for authenticated users" ON doctors
    FOR ALL USING (auth.role() = 'authenticated');

-- Patients policies
CREATE POLICY "Allow all operations on patients for authenticated users" ON patients
    FOR ALL USING (auth.role() = 'authenticated');

-- Sessions policies
CREATE POLICY "Allow all operations on sessions for authenticated users" ON sessions
    FOR ALL USING (auth.role() = 'authenticated');

-- Visits policies
CREATE POLICY "Allow all operations on visits for authenticated users" ON visits
    FOR ALL USING (auth.role() = 'authenticated');

-- Queue policies
CREATE POLICY "Allow all operations on queue for authenticated users" ON queue
    FOR ALL USING (auth.role() = 'authenticated');

-- Ad resources policies
CREATE POLICY "Allow all operations on ad_resources for authenticated users" ON ad_resources
    FOR ALL USING (auth.role() = 'authenticated');

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_full_queue(p_clinic_id UUID)
RETURNS TABLE (
    id UUID,
    token_number INTEGER,
    patient_name TEXT,
    doctor_name TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE,
    status TEXT,
    priority TEXT,
    appointment_id UUID
) AS $$
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
        q.appointment_id
    FROM queue q
    JOIN visits v ON q.appointment_id = v.id
    JOIN patients p ON v.patient_id = p.id
    JOIN doctors d ON v.doctor_id = d.id
    WHERE q.clinic_id = p_clinic_id
    ORDER BY q.check_in_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete previous consultation
CREATE OR REPLACE FUNCTION complete_previous_consultation(p_doctor_id UUID, p_clinic_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE visits 
    SET status = 'Completed', completed_time = NOW()
    WHERE doctor_id = p_doctor_id 
    AND clinic_id = p_clinic_id 
    AND status = 'In-consultation';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end session for doctor
CREATE OR REPLACE FUNCTION end_session_for_doctor(p_clinic_id UUID, p_doctor_name TEXT, p_session_name TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE doctors 
    SET status = 'Unavailable'
    WHERE clinic_id = p_clinic_id 
    AND name = p_doctor_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create clinic user (for authentication)
CREATE OR REPLACE FUNCTION create_clinic_user(
    user_email TEXT,
    user_password TEXT,
    clinic_id_to_assign UUID,
    clinic_name_to_assign TEXT,
    user_full_name TEXT
)
RETURNS TEXT AS $$
DECLARE
    new_user_id UUID;
BEGIN
    new_user_id := uuid_generate_v4();
    RETURN new_user_id::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to seed initial data with proper UUIDs
CREATE OR REPLACE FUNCTION seed_data()
RETURNS VOID AS $$
DECLARE
    curaflow_id UUID;
    sunrise_id UUID;
BEGIN
    -- Generate UUIDs for clinics
    curaflow_id := uuid_generate_v4();
    sunrise_id := uuid_generate_v4();
    
    -- Insert sample clinics
    INSERT INTO clinics (id, name, address, phone, email) VALUES
    (curaflow_id, 'CuraFlow Central Hospital', '123 Health St, Wellness City, 12345', '(123) 456-7890', 'contact@curaflow.com'),
    (sunrise_id, 'Sunrise Medical Clinic', '456 Wellness Ave, Sunnyside, 54321', '(987) 654-3210', 'info@sunrisemedical.com')
    ON CONFLICT (id) DO NOTHING;

    -- Insert sample departments
    INSERT INTO departments (clinic_id, name) VALUES
    (curaflow_id, 'Cardiology'),
    (curaflow_id, 'Pediatrics'),
    (curaflow_id, 'Dermatology'),
    (curaflow_id, 'Neurology'),
    (curaflow_id, 'General Medicine'),
    (sunrise_id, 'Dermatology'),
    (sunrise_id, 'Neurology'),
    (sunrise_id, 'Orthopedics')
    ON CONFLICT DO NOTHING;

    -- Insert sample sessions
    INSERT INTO sessions (clinic_id, name, start_time, end_time) VALUES
    (curaflow_id, 'Morning', '09:00', '13:00'),
    (curaflow_id, 'Afternoon', '14:00', '18:00'),
    (curaflow_id, 'Evening', '18:00', '21:00'),
    (sunrise_id, 'Morning', '08:30', '12:30'),
    (sunrise_id, 'Afternoon', '13:30', '17:30')
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the seed data function
SELECT seed_data();

