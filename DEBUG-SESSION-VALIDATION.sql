-- =====================================================
-- FIX SESSION VALIDATION - DEBUG VERSION
-- =====================================================
-- 
-- This creates a debug version of the session validation function
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create a debug version of validate_superadmin_session
CREATE OR REPLACE FUNCTION validate_superadmin_session_debug(p_token TEXT)
RETURNS TABLE(
    superadmin_id UUID,
    username TEXT,
    full_name TEXT,
    email TEXT,
    is_valid BOOLEAN,
    debug_info TEXT
) AS $$
DECLARE
    session_record RECORD;
    admin_record RECORD;
BEGIN
    -- Look up session by token
    SELECT 
        superadmin_sessions.superadmin_id,
        superadmin_sessions.token,
        superadmin_sessions.expires_at,
        superadmin_sessions.created_at
    INTO session_record
    FROM superadmin_sessions 
    WHERE superadmin_sessions.token = p_token;
    
    -- Debug: Check if session exists
    IF session_record.superadmin_id IS NULL THEN
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            NULL::TEXT,
            FALSE,
            'Session not found for token: ' || p_token;
        RETURN;
    END IF;
    
    -- Debug: Check if session is expired
    IF session_record.expires_at < NOW() THEN
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            NULL::TEXT,
            FALSE,
            'Session expired at: ' || session_record.expires_at::TEXT;
        RETURN;
    END IF;
    
    -- Get superadmin details
    SELECT 
        superadmins.id,
        superadmins.username,
        superadmins.full_name,
        superadmins.email,
        superadmins.is_active
    INTO admin_record
    FROM superadmins 
    WHERE superadmins.id = session_record.superadmin_id;
    
    -- Debug: Check if superadmin is active
    IF admin_record.id IS NULL OR NOT admin_record.is_active THEN
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            NULL::TEXT,
            FALSE,
            'Superadmin not found or inactive';
        RETURN;
    END IF;
    
    -- Return success with debug info
    RETURN QUERY SELECT 
        admin_record.id,
        admin_record.username,
        admin_record.full_name,
        admin_record.email,
        TRUE,
        'Session valid - expires at: ' || session_record.expires_at::TEXT;
        
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the debug function
SELECT 'Created debug session validation function!' as status;

-- Test with a sample token
SELECT * FROM validate_superadmin_session_debug('test-token-123');
