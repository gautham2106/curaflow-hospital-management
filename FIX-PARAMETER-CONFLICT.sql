-- =====================================================
-- FIX SUPERADMIN AUTHENTICATION - PARAMETER CONFLICT FIX
-- =====================================================
-- 
-- This fixes the parameter name conflict in the function
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop and recreate the function with proper parameter names
DROP FUNCTION IF EXISTS authenticate_superadmin(TEXT, TEXT);

CREATE OR REPLACE FUNCTION authenticate_superadmin(
    p_username_param TEXT, 
    p_password_param TEXT
)
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
    -- Look up superadmin by username (using different parameter names)
    SELECT id, username, password_hash, full_name, email, is_active
    INTO admin_record
    FROM superadmins 
    WHERE superadmins.username = p_username_param  -- Use different parameter name
    AND superadmins.is_active = TRUE;
    
    -- Check if superadmin exists and password matches
    IF admin_record.id IS NOT NULL AND admin_record.password_hash = encode(digest(p_password_param, 'sha256'), 'hex') THEN
        -- Generate session token
        session_token := encode(gen_random_bytes(32), 'hex');
        session_expires := NOW() + INTERVAL '24 hours';
        
        -- Create session record
        INSERT INTO superadmin_sessions (superadmin_id, token, expires_at)
        VALUES (admin_record.id, session_token, session_expires);
        
        -- Update last login
        UPDATE superadmins 
        SET last_login = NOW() 
        WHERE superadmins.id = admin_record.id;
        
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

-- Test the fixed function
SELECT 'Fixed authenticate_superadmin function with proper parameter names!' as status;

-- Test authentication
SELECT * FROM authenticate_superadmin('superadmin', 'superadmin123');
