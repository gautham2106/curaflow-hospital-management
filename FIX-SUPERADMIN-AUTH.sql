-- =====================================================
-- FIX SUPERADMIN AUTHENTICATION - COMPREHENSIVE SOLUTION
-- =====================================================
-- 
-- This file fixes all superadmin authentication issues by:
-- 1. Creating required tables with proper structure
-- 2. Creating authentication functions
-- 3. Setting up RLS policies for service role access
-- 4. Inserting default superadmin user
-- 5. Testing the setup
--
-- Run this in Supabase SQL Editor to fix authentication errors
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 1: CREATE SUPERADMIN TABLES
-- =====================================================

-- Drop existing tables if they exist (to ensure clean setup)
DROP TABLE IF EXISTS superadmin_sessions CASCADE;
DROP TABLE IF EXISTS superadmins CASCADE;

-- Create superadmins table
CREATE TABLE superadmins (
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

-- Create superadmin_sessions table
CREATE TABLE superadmin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    superadmin_id UUID NOT NULL REFERENCES superadmins(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Add clinic management fields (if clinics table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinics') THEN
        ALTER TABLE clinics ADD COLUMN IF NOT EXISTS created_by_superadmin UUID REFERENCES superadmins(id);
        ALTER TABLE clinics ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        ALTER TABLE clinics ADD COLUMN IF NOT EXISTS last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        ALTER TABLE clinics ADD COLUMN IF NOT EXISTS modification_notes TEXT;
    END IF;
END $$;

-- =====================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_superadmins_username ON superadmins(username);
CREATE INDEX IF NOT EXISTS idx_superadmins_email ON superadmins(email);
CREATE INDEX IF NOT EXISTS idx_superadmins_is_active ON superadmins(is_active);
CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_token ON superadmin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_superadmin_id ON superadmin_sessions(superadmin_id);
CREATE INDEX IF NOT EXISTS idx_superadmin_sessions_expires_at ON superadmin_sessions(expires_at);

-- Add clinic index if clinics table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinics') THEN
        CREATE INDEX IF NOT EXISTS idx_clinics_created_by_superadmin ON clinics(created_by_superadmin);
    END IF;
END $$;

-- =====================================================
-- STEP 3: CREATE AUTHENTICATION FUNCTIONS
-- =====================================================

-- Drop existing functions to ensure clean recreation
DROP FUNCTION IF EXISTS authenticate_superadmin(TEXT, TEXT);
DROP FUNCTION IF EXISTS validate_superadmin_session(TEXT);

-- Create authenticate_superadmin function
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
    
    -- Check if superadmin exists and password matches
    -- Using SHA256 hash for demo (in production, use bcrypt)
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

-- Create validate_superadmin_session function
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
    SELECT s.superadmin_id, sa.username, sa.full_name, sa.email
    INTO session_record
    FROM superadmin_sessions s
    JOIN superadmins sa ON s.superadmin_id = sa.id
    WHERE s.token = p_token 
    AND s.expires_at > NOW()
    AND sa.is_active = TRUE;
    
    -- Check if valid session found
    IF session_record.superadmin_id IS NOT NULL THEN
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

-- =====================================================
-- STEP 4: SET UP ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on tables
ALTER TABLE superadmins ENABLE ROW LEVEL SECURITY;
ALTER TABLE superadmin_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow service role full access to superadmins" ON superadmins;
DROP POLICY IF EXISTS "Allow service role full access to superadmin_sessions" ON superadmin_sessions;

-- Create policies for service role access
CREATE POLICY "Allow service role full access to superadmins" ON superadmins
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to superadmin_sessions" ON superadmin_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- STEP 5: INSERT DEFAULT SUPERADMIN USER
-- =====================================================

-- Insert default superadmin (password: superadmin123)
-- Hash: SHA256 of 'superadmin123'
INSERT INTO superadmins (username, password_hash, email, full_name, is_active) VALUES
(
    'superadmin', 
    encode(digest('superadmin123', 'sha256'), 'hex'), 
    'admin@curaflow.com', 
    'Super Administrator', 
    TRUE
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    is_active = EXCLUDED.is_active;

-- =====================================================
-- STEP 6: CREATE ADDITIONAL UTILITY FUNCTIONS
-- =====================================================

-- Function to get superadmin statistics
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
    
    -- Return statistics (only if clinics table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinics') THEN
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
    ELSE
        -- Return zeros if clinics table doesn't exist
        RETURN QUERY SELECT 0, 0, 0, 0, 0, 0, 0, 0;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 7: TEST THE SETUP
-- =====================================================

-- Test 1: Check if tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'superadmins') THEN
        RAISE NOTICE '✅ superadmins table created successfully';
    ELSE
        RAISE NOTICE '❌ superadmins table creation failed';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'superadmin_sessions') THEN
        RAISE NOTICE '✅ superadmin_sessions table created successfully';
    ELSE
        RAISE NOTICE '❌ superadmin_sessions table creation failed';
    END IF;
END $$;

-- Test 2: Check if functions exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'authenticate_superadmin') THEN
        RAISE NOTICE '✅ authenticate_superadmin function created successfully';
    ELSE
        RAISE NOTICE '❌ authenticate_superadmin function creation failed';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'validate_superadmin_session') THEN
        RAISE NOTICE '✅ validate_superadmin_session function created successfully';
    ELSE
        RAISE NOTICE '❌ validate_superadmin_session function creation failed';
    END IF;
END $$;

-- Test 3: Check if default superadmin exists
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM superadmins WHERE username = 'superadmin';
    IF admin_count > 0 THEN
        RAISE NOTICE '✅ Default superadmin user created successfully';
    ELSE
        RAISE NOTICE '❌ Default superadmin user creation failed';
    END IF;
END $$;

-- Test 4: Test authentication function
DO $$
DECLARE
    auth_result RECORD;
BEGIN
    SELECT * INTO auth_result FROM authenticate_superadmin('superadmin', 'superadmin123');
    IF auth_result.is_authenticated THEN
        RAISE NOTICE '✅ Superadmin authentication test PASSED';
        RAISE NOTICE '   Token generated: %', CASE WHEN auth_result.token IS NOT NULL THEN 'Yes' ELSE 'No' END;
    ELSE
        RAISE NOTICE '❌ Superadmin authentication test FAILED';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Superadmin authentication test ERROR: %', SQLERRM;
END $$;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT '🎉 SUPERADMIN AUTHENTICATION FIX COMPLETED!' as status,
       'You can now login with username: superadmin, password: superadmin123' as instructions,
       'Run verify-superadmin-db.js to verify the setup' as next_step;
