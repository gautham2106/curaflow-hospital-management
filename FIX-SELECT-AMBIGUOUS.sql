-- =====================================================
-- FIX SUPERADMIN AUTHENTICATION - SELECT AMBIGUOUS COLUMN FIX
-- =====================================================
-- 
-- This fixes the ambiguous column reference in the SELECT statement
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop and recreate the function with explicit column references
DROP FUNCTION IF EXISTS authenticate_superadmin(TEXT, TEXT);

CREATE OR REPLACE FUNCTION authenticate_superadmin(
    p_user TEXT, 
    p_pass TEXT
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
    -- Look up superadmin by username (explicit column references)
    SELECT 
        superadmins.id, 
        superadmins.username, 
        superadmins.password_hash, 
        superadmins.full_name, 
        superadmins.email, 
        superadmins.is_active
    INTO admin_record
    FROM superadmins 
    WHERE superadmins.username = p_user
    AND superadmins.is_active = TRUE;
    
    -- Check if superadmin exists and password matches
    IF admin_record.id IS NOT NULL AND admin_record.password_hash = encode(digest(p_pass, 'sha256'), 'hex') THEN
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
SELECT 'Fixed authenticate_superadmin function with explicit column references!' as status;

-- Test authentication
SELECT * FROM authenticate_superadmin('superadmin', 'superadmin123');
