-- =====================================================
-- RESTORE PROPER SESSION VALIDATION
-- =====================================================
-- 
-- This restores the proper session validation function
-- Run this in Supabase SQL Editor
-- =====================================================

-- Restore the original validate_superadmin_session function
DROP FUNCTION IF EXISTS validate_superadmin_session(TEXT);

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
    
    -- Check if session exists
    IF session_record.superadmin_id IS NULL THEN
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            NULL::TEXT,
            FALSE;
        RETURN;
    END IF;
    
    -- Check if session is expired
    IF session_record.expires_at < NOW() THEN
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            NULL::TEXT,
            FALSE;
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
    
    -- Check if superadmin is active
    IF admin_record.id IS NULL OR NOT admin_record.is_active THEN
        RETURN QUERY SELECT 
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            NULL::TEXT,
            FALSE;
        RETURN;
    END IF;
    
    -- Return success
    RETURN QUERY SELECT 
        admin_record.id,
        admin_record.username,
        admin_record.full_name,
        admin_record.email,
        TRUE;
        
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the restored function
SELECT 'Proper session validation restored!' as status;

-- Test with a sample token (should return false)
SELECT * FROM validate_superadmin_session('test-token-123');
