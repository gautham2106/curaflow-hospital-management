-- =====================================================
-- CREATE CLINIC CREATION FUNCTION
-- =====================================================
-- 
-- This creates the missing create_clinic_as_superadmin function
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create the clinic creation function
CREATE OR REPLACE FUNCTION create_clinic_as_superadmin(
    p_superadmin_id UUID,
    p_name TEXT,
    p_address TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_admin_username TEXT,
    p_admin_pin TEXT,
    p_admin_name TEXT,
    p_subscription_plan TEXT DEFAULT 'premium',
    p_max_doctors INTEGER DEFAULT 10,
    p_max_patients_per_day INTEGER DEFAULT 100,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    clinic_id UUID,
    clinic_name TEXT,
    admin_username TEXT,
    message TEXT
) AS $$
DECLARE
    new_clinic_id UUID;
    clinic_admin_id UUID;
BEGIN
    -- Generate new clinic ID
    new_clinic_id := gen_random_uuid();
    
    -- Generate clinic admin ID
    clinic_admin_id := gen_random_uuid();
    
    -- Insert clinic
    INSERT INTO clinics (
        id,
        name,
        address,
        phone,
        email,
        admin_username,
        admin_pin,
        admin_name,
        subscription_plan,
        max_doctors,
        max_patients_per_day,
        is_active,
        created_at,
        notes
    ) VALUES (
        new_clinic_id,
        p_name,
        p_address,
        p_phone,
        p_email,
        p_admin_username,
        p_admin_pin,
        p_admin_name,
        p_subscription_plan,
        p_max_doctors,
        p_max_patients_per_day,
        TRUE,
        NOW(),
        p_notes
    );
    
    -- Insert clinic admin user
    INSERT INTO clinic_admins (
        id,
        clinic_id,
        username,
        pin,
        name,
        email,
        is_active,
        created_at
    ) VALUES (
        clinic_admin_id,
        new_clinic_id,
        p_admin_username,
        p_admin_pin,
        p_admin_name,
        p_email,
        TRUE,
        NOW()
    );
    
    -- Return success
    RETURN QUERY SELECT 
        TRUE,
        new_clinic_id,
        p_name,
        p_admin_username,
        'Clinic created successfully';
        
EXCEPTION
    WHEN OTHERS THEN
        -- Return error
        RETURN QUERY SELECT 
            FALSE,
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            'Failed to create clinic: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT 'Clinic creation function created!' as status;

-- Test with sample data
SELECT * FROM create_clinic_as_superadmin(
    '353e1953-f030-4602-b1fc-62b9824ee2bf'::UUID, -- superadmin ID
    'Test Hospital',
    '123 Test Street',
    '+1-555-0123',
    'test@hospital.com',
    'testadmin',
    '1234',
    'Dr. Test',
    'premium',
    10,
    100,
    'Test clinic'
);
