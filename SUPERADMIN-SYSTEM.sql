-- SUPERADMIN SYSTEM FOR CLINIC MANAGEMENT
-- Add this to your FINAL-COMPLETE-SQL.sql or run separately

-- Create superadmin table
CREATE TABLE IF NOT EXISTS superadmins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES superadmins(id)
);

-- Create superadmin sessions table
CREATE TABLE IF NOT EXISTS superadmin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    superadmin_id UUID NOT NULL REFERENCES superadmins(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Add clinic management fields
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS created_by_superadmin UUID REFERENCES superadmins(id);
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS modification_notes TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_superadmins_username ON superadmins(username);
CREATE INDEX IF NOT EXISTS idx_superadmins_email ON superadmins(email);
CREATE INDEX IF NOT EXISTS idx_superadmins_is_active ON superadmins(is_active);
CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_token ON superadmin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_superadmin_id ON superadmin_sessions(superadmin_id);
CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_expires_at ON superadmin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_clinics_created_by_superadmin ON clinics(created_by_superadmin);

-- Create superadmin authentication function
CREATE OR REPLACE FUNCTION authenticate_superadmin(p_username TEXT, p_password TEXT)
RETURNS TABLE(
    superadmin_id UUID,
    username TEXT,
    full_name TEXT,
    email TEXT,
    is_authenticated BOOLEAN,
    token TEXT
) AS $$
DECLARE
    admin_record RECORD;
    session_token TEXT;
    session_expires TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Look up superadmin by username
    SELECT id, username, password_hash, full_name, email, is_active
    INTO admin_record
    FROM superadmins 
    WHERE username = p_username 
    AND is_active = TRUE;
    
    -- Check if superadmin exists and password matches (simple hash for demo)
    -- In production, use proper password hashing like bcrypt
    IF admin_record.id IS NOT NULL AND admin_record.password_hash = encode(digest(p_password, 'sha256'), 'hex') THEN
        -- Generate session token
        session_token := encode(gen_random_bytes(32), 'hex');
        session_expires := NOW() + INTERVAL '24 hours';
        
        -- Create session record
        INSERT INTO superadmin_sessions (superadmin_id, token, expires_at)
        VALUES (admin_record.id, session_token, session_expires);
        
        -- Update last login
        UPDATE superadmins 
        SET last_login = NOW() 
        WHERE id = admin_record.id;
        
        -- Return success
        RETURN QUERY SELECT 
            admin_record.id,
            admin_record.username,
            admin_record.full_name,
            admin_record.email,
            TRUE,
            session_token;
    ELSE
        -- Return failure
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            NULL::TEXT,
            FALSE,
            NULL::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate superadmin session
CREATE OR REPLACE FUNCTION validate_superadmin_session(p_token TEXT)
RETURNS TABLE(
    superadmin_id UUID,
    username TEXT,
    full_name TEXT,
    email TEXT,
    is_valid BOOLEAN
) AS $$
DECLARE
    session_record RECORD;
BEGIN
    -- Look up session by token
    SELECT s.superadmin_id, sa.username, sa.full_name, sa.email, s.expires_at
    INTO session_record
    FROM superadmin_sessions s
    JOIN superadmins sa ON s.superadmin_id = sa.id
    WHERE s.token = p_token
    AND s.expires_at > NOW()
    AND sa.is_active = TRUE;
    
    -- Check if session exists and is not expired
    IF session_record.superadmin_id IS NOT NULL THEN
        -- Extend session
        UPDATE superadmin_sessions 
        SET expires_at = NOW() + INTERVAL '24 hours'
        WHERE token = p_token;
        
        -- Return success
        RETURN QUERY SELECT 
            session_record.superadmin_id,
            session_record.username,
            session_record.full_name,
            session_record.email,
            TRUE;
    ELSE
        -- Return failure
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            NULL::TEXT,
            FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create clinic as superadmin
CREATE OR REPLACE FUNCTION create_clinic_as_superadmin(
    p_superadmin_id UUID,
    p_name TEXT,
    p_address TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_admin_username TEXT,
    p_admin_pin TEXT,
    p_admin_name TEXT,
    p_subscription_plan TEXT DEFAULT 'basic',
    p_max_doctors INTEGER DEFAULT 10,
    p_max_patients_per_day INTEGER DEFAULT 100,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    clinic_id UUID,
    clinic_name TEXT,
    admin_username TEXT,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    new_clinic_id UUID;
    validation_result RECORD;
BEGIN
    -- Validate superadmin session
    SELECT * INTO validation_result
    FROM validate_superadmin_session(
        (SELECT token FROM superadmin_sessions 
         WHERE superadmin_id = p_superadmin_id 
         AND expires_at > NOW() 
         ORDER BY created_at DESC LIMIT 1)
    );
    
    IF NOT validation_result.is_valid THEN
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            FALSE,
            'Invalid or expired superadmin session';
        RETURN;
    END IF;
    
    -- Check if clinic name already exists
    IF EXISTS (SELECT 1 FROM clinics WHERE name = p_name) THEN
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            FALSE,
            'Clinic name already exists';
        RETURN;
    END IF;
    
    -- Check if admin username already exists
    IF EXISTS (SELECT 1 FROM clinics WHERE admin_username = p_admin_username) THEN
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            FALSE,
            'Admin username already exists';
        RETURN;
    END IF;
    
    -- Generate new clinic ID
    new_clinic_id := uuid_generate_v4();
    
    -- Insert new clinic
    INSERT INTO clinics (
        id, name, address, phone, email, 
        admin_username, admin_pin, admin_name,
        subscription_plan, max_doctors, max_patients_per_day,
        is_active, created_at, created_by_superadmin, modification_notes
    ) VALUES (
        new_clinic_id, p_name, p_address, p_phone, p_email,
        p_admin_username, p_admin_pin, p_admin_name,
        p_subscription_plan, p_max_doctors, p_max_patients_per_day,
        TRUE, NOW(), p_superadmin_id, p_notes
    );
    
    -- Create default sessions for the new clinic
    INSERT INTO sessions (clinic_id, name, start_time, end_time) VALUES
    (new_clinic_id, 'Morning', '09:00', '13:00'),
    (new_clinic_id, 'Afternoon', '14:00', '18:00'),
    (new_clinic_id, 'Evening', '18:00', '21:00');
    
    -- Create default departments
    INSERT INTO departments (clinic_id, name) VALUES
    (new_clinic_id, 'General Medicine'),
    (new_clinic_id, 'Cardiology'),
    (new_clinic_id, 'Pediatrics');
    
    -- Return success
    RETURN QUERY SELECT 
        new_clinic_id,
        p_name,
        p_admin_username,
        TRUE,
        'Clinic created successfully';
        
EXCEPTION WHEN OTHERS THEN
    -- Return failure on error
    RETURN QUERY SELECT 
        NULL::UUID,
        NULL::TEXT,
        NULL::TEXT,
        FALSE,
        'Error creating clinic: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all clinics for superadmin
CREATE OR REPLACE FUNCTION get_all_clinics_for_superadmin(p_superadmin_id UUID)
RETURNS TABLE(
    id UUID,
    name TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    admin_username TEXT,
    admin_name TEXT,
    subscription_plan TEXT,
    max_doctors INTEGER,
    max_patients_per_day INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    last_modified TIMESTAMP WITH TIME ZONE,
    modification_notes TEXT,
    total_doctors BIGINT,
    total_patients BIGINT,
    total_visits_today BIGINT
) AS $$
DECLARE
    validation_result RECORD;
BEGIN
    -- Validate superadmin session
    SELECT * INTO validation_result
    FROM validate_superadmin_session(
        (SELECT token FROM superadmin_sessions 
         WHERE superadmin_id = p_superadmin_id 
         AND expires_at > NOW() 
         ORDER BY created_at DESC LIMIT 1)
    );
    
    IF NOT validation_result.is_valid THEN
        RETURN; -- Return empty result for invalid session
    END IF;
    
    -- Return all clinics with statistics
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.address,
        c.phone,
        c.email,
        c.admin_username,
        c.admin_name,
        c.subscription_plan,
        c.max_doctors,
        c.max_patients_per_day,
        c.is_active,
        c.created_at,
        c.last_modified,
        c.modification_notes,
        COUNT(DISTINCT d.id) as total_doctors,
        COUNT(DISTINCT p.id) as total_patients,
        COUNT(DISTINCT v.id) as total_visits_today
    FROM clinics c
    LEFT JOIN doctors d ON c.id = d.clinic_id
    LEFT JOIN patients p ON c.id = p.clinic_id
    LEFT JOIN visits v ON c.id = v.clinic_id AND v.date = CURRENT_DATE
    GROUP BY c.id, c.name, c.address, c.phone, c.email, c.admin_username, 
             c.admin_name, c.subscription_plan, c.max_doctors, c.max_patients_per_day,
             c.is_active, c.created_at, c.last_modified, c.modification_notes
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update clinic as superadmin
CREATE OR REPLACE FUNCTION update_clinic_as_superadmin(
    p_superadmin_id UUID,
    p_clinic_id UUID,
    p_name TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_admin_username TEXT DEFAULT NULL,
    p_admin_pin TEXT DEFAULT NULL,
    p_admin_name TEXT DEFAULT NULL,
    p_subscription_plan TEXT DEFAULT NULL,
    p_max_doctors INTEGER DEFAULT NULL,
    p_max_patients_per_day INTEGER DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    validation_result RECORD;
    update_fields TEXT[];
    update_values TEXT[];
BEGIN
    -- Validate superadmin session
    SELECT * INTO validation_result
    FROM validate_superadmin_session(
        (SELECT token FROM superadmin_sessions 
         WHERE superadmin_id = p_superadmin_id 
         AND expires_at > NOW() 
         ORDER BY created_at DESC LIMIT 1)
    );
    
    IF NOT validation_result.is_valid THEN
        RETURN QUERY SELECT 
            FALSE,
            'Invalid or expired superadmin session';
        RETURN;
    END IF;
    
    -- Check if clinic exists
    IF NOT EXISTS (SELECT 1 FROM clinics WHERE id = p_clinic_id) THEN
        RETURN QUERY SELECT 
            FALSE,
            'Clinic not found';
        RETURN;
    END IF;
    
    -- Build dynamic update query
    IF p_name IS NOT NULL THEN
        update_fields := array_append(update_fields, 'name');
        update_values := array_append(update_values, quote_literal(p_name));
    END IF;
    
    IF p_address IS NOT NULL THEN
        update_fields := array_append(update_fields, 'address');
        update_values := array_append(update_values, quote_literal(p_address));
    END IF;
    
    IF p_phone IS NOT NULL THEN
        update_fields := array_append(update_fields, 'phone');
        update_values := array_append(update_values, quote_literal(p_phone));
    END IF;
    
    IF p_email IS NOT NULL THEN
        update_fields := array_append(update_fields, 'email');
        update_values := array_append(update_values, quote_literal(p_email));
    END IF;
    
    IF p_admin_username IS NOT NULL THEN
        -- Check if username already exists
        IF EXISTS (SELECT 1 FROM clinics WHERE admin_username = p_admin_username AND id != p_clinic_id) THEN
            RETURN QUERY SELECT 
                FALSE,
                'Admin username already exists';
            RETURN;
        END IF;
        update_fields := array_append(update_fields, 'admin_username');
        update_values := array_append(update_values, quote_literal(p_admin_username));
    END IF;
    
    IF p_admin_pin IS NOT NULL THEN
        update_fields := array_append(update_fields, 'admin_pin');
        update_values := array_append(update_values, quote_literal(p_admin_pin));
    END IF;
    
    IF p_admin_name IS NOT NULL THEN
        update_fields := array_append(update_fields, 'admin_name');
        update_values := array_append(update_values, quote_literal(p_admin_name));
    END IF;
    
    IF p_subscription_plan IS NOT NULL THEN
        update_fields := array_append(update_fields, 'subscription_plan');
        update_values := array_append(update_values, quote_literal(p_subscription_plan));
    END IF;
    
    IF p_max_doctors IS NOT NULL THEN
        update_fields := array_append(update_fields, 'max_doctors');
        update_values := array_append(update_values, p_max_doctors::TEXT);
    END IF;
    
    IF p_max_patients_per_day IS NOT NULL THEN
        update_fields := array_append(update_fields, 'max_patients_per_day');
        update_values := array_append(update_values, p_max_patients_per_day::TEXT);
    END IF;
    
    IF p_is_active IS NOT NULL THEN
        update_fields := array_append(update_fields, 'is_active');
        update_values := array_append(update_values, p_is_active::TEXT);
    END IF;
    
    -- Always update last_modified and modification_notes
    update_fields := array_append(update_fields, 'last_modified');
    update_values := array_append(update_values, 'NOW()');
    
    update_fields := array_append(update_fields, 'modification_notes');
    update_values := array_append(update_values, quote_literal(COALESCE(p_notes, 'Updated by superadmin')));
    
    -- Execute update
    IF array_length(update_fields, 1) > 0 THEN
        EXECUTE 'UPDATE clinics SET ' || 
                array_to_string(array_agg(update_fields[i] || ' = ' || update_values[i]), ', ') ||
                ' WHERE id = $1'
        USING p_clinic_id;
        
        RETURN QUERY SELECT 
            TRUE,
            'Clinic updated successfully';
    ELSE
        RETURN QUERY SELECT 
            FALSE,
            'No fields to update';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE,
        'Error updating clinic: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to deactivate clinic as superadmin
CREATE OR REPLACE FUNCTION deactivate_clinic_as_superadmin(
    p_superadmin_id UUID,
    p_clinic_id UUID,
    p_reason TEXT DEFAULT 'Deactivated by superadmin'
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    validation_result RECORD;
BEGIN
    -- Validate superadmin session
    SELECT * INTO validation_result
    FROM validate_superadmin_session(
        (SELECT token FROM superadmin_sessions 
         WHERE superadmin_id = p_superadmin_id 
         AND expires_at > NOW() 
         ORDER BY created_at DESC LIMIT 1)
    );
    
    IF NOT validation_result.is_valid THEN
        RETURN QUERY SELECT 
            FALSE,
            'Invalid or expired superadmin session';
        RETURN;
    END IF;
    
    -- Deactivate clinic
    UPDATE clinics 
    SET 
        is_active = FALSE,
        last_modified = NOW(),
        modification_notes = p_reason
    WHERE id = p_clinic_id;
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            TRUE,
            'Clinic deactivated successfully';
    ELSE
        RETURN QUERY SELECT 
            FALSE,
            'Clinic not found';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get superadmin statistics
CREATE OR REPLACE FUNCTION get_superadmin_stats(p_superadmin_id UUID)
RETURNS TABLE(
    total_clinics BIGINT,
    active_clinics BIGINT,
    inactive_clinics BIGINT,
    total_doctors BIGINT,
    total_patients BIGINT,
    total_visits_today BIGINT,
    clinics_created_today BIGINT,
    clinics_created_this_month BIGINT
) AS $$
DECLARE
    validation_result RECORD;
BEGIN
    -- Validate superadmin session
    SELECT * INTO validation_result
    FROM validate_superadmin_session(
        (SELECT token FROM superadmin_sessions 
         WHERE superadmin_id = p_superadmin_id 
         AND expires_at > NOW() 
         ORDER BY created_at DESC LIMIT 1)
    );
    
    IF NOT validation_result.is_valid THEN
        RETURN; -- Return empty result for invalid session
    END IF;
    
    -- Return statistics
    RETURN QUERY
    SELECT 
        COUNT(*) as total_clinics,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_clinics,
        COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive_clinics,
        (SELECT COUNT(*) FROM doctors) as total_doctors,
        (SELECT COUNT(*) FROM patients) as total_patients,
        (SELECT COUNT(*) FROM visits WHERE date = CURRENT_DATE) as total_visits_today,
        COUNT(CASE WHEN created_at::date = CURRENT_DATE THEN 1 END) as clinics_created_today,
        COUNT(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN 1 END) as clinics_created_this_month
    FROM clinics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default superadmin (password: superadmin123)
INSERT INTO superadmins (username, password_hash, email, full_name, is_active) VALUES
('superadmin', encode(digest('superadmin123', 'sha256'), 'hex'), 'admin@curaflow.com', 'Super Administrator', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Update RLS policies
DROP POLICY IF EXISTS "Allow all operations on superadmins for authenticated users" ON superadmins;
CREATE POLICY "Allow all operations on superadmins for authenticated users" ON superadmins
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all operations on superadmin_sessions for authenticated users" ON superadmin_sessions;
CREATE POLICY "Allow all operations on superadmin_sessions for authenticated users" ON superadmin_sessions
    FOR ALL USING (auth.role() = 'authenticated');

-- Test the superadmin system
SELECT 'Superadmin system created successfully!' as status;
