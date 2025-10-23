-- Get the clinic IDs that were created
-- Run this after the main schema to see the actual UUIDs

SELECT id, name FROM clinics ORDER BY created_at;
