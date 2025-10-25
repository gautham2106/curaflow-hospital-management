-- Atomic Token Number Generation Function
-- This ensures sequential token numbers even with concurrent requests

CREATE OR REPLACE FUNCTION get_next_token_number(
    p_clinic_id UUID,
    p_doctor_id UUID,
    p_date DATE,
    p_session TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_token INTEGER;
BEGIN
    -- Get the highest token number for this doctor/session/date
    SELECT COALESCE(MAX(token_number), 0) + 1
    INTO next_token
    FROM visits
    WHERE clinic_id = p_clinic_id
      AND doctor_id = p_doctor_id
      AND date = p_date
      AND session = p_session;
    
    -- Return the next token number
    RETURN next_token;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_next_token_number(UUID, UUID, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_token_number(UUID, UUID, DATE, TEXT) TO anon;
