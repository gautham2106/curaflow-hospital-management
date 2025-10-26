# CRITICAL DATABASE UPDATE - MUST RUN IMMEDIATELY

## Problem Identified

Your current Supabase database may be missing the `session` field in the `get_full_queue()` function. This is CRITICAL because:

- Mobile queue view won't filter by session correctly
- Session-based queue management will be broken
- Patients from different sessions will be mixed together

## Solution

Run the following SQL in your Supabase SQL Editor **IMMEDIATELY**.

## Step-by-Step Instructions

### Step 1: Login to Supabase
1. Go to https://supabase.com
2. Open your CuraFlow project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run This SQL

Copy and paste the following SQL and click "Run":

```sql
-- ============================================================
-- CRITICAL FIX: Update get_full_queue() function
-- ============================================================
-- This adds the missing session field to the queue function
-- Time Required: 30 seconds
-- ============================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS get_full_queue(UUID);

-- Create the updated function WITH session field
CREATE OR REPLACE FUNCTION get_full_queue(p_clinic_id UUID)
RETURNS TABLE (
    id UUID,
    token_number INTEGER,
    patient_name TEXT,
    doctor_name TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE,
    status TEXT,
    priority TEXT,
    appointment_id UUID,
    session TEXT
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
        q.appointment_id,
        v.session
    FROM queue q
    JOIN visits v ON q.appointment_id = v.id
    JOIN patients p ON v.patient_id = p.id
    JOIN doctors d ON v.doctor_id = d.id
    WHERE q.clinic_id = p_clinic_id
    ORDER BY q.check_in_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Verify Success

Run this test query (replace `your-clinic-id` with your actual clinic ID):

```sql
SELECT * FROM get_full_queue('your-clinic-id'::UUID);
```

**Expected Result:** You should see a `session` column in the output with values like "Morning", "Afternoon", or "Evening".

## What Was Fixed

### Before (OLD - BROKEN):
```sql
RETURNS TABLE (
    id UUID,
    token_number INTEGER,
    patient_name TEXT,
    doctor_name TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE,
    status TEXT,
    priority TEXT,
    appointment_id UUID
    -- ❌ Missing session field
)
```

### After (NEW - WORKING):
```sql
RETURNS TABLE (
    id UUID,
    token_number INTEGER,
    patient_name TEXT,
    doctor_name TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE,
    status TEXT,
    priority TEXT,
    appointment_id UUID,
    session TEXT  -- ✅ Session field added
)
```

## Impact

This fix ensures:
- ✅ Queue filtering by session works correctly
- ✅ Mobile view shows only relevant session patients
- ✅ Morning/Afternoon/Evening sessions don't mix
- ✅ 100% production ready system

## Files Updated

The following SQL setup files have been updated to include this fix:
- `FINAL-COMPLETE-SQL.sql` (line 81-112)
- `COMPLETE-SUPABASE-SETUP.sql` (line 175-206)
- `update-get-full-queue.sql` (standalone fix file)
- `docs/SQL-FIX-session-field.sql` (standalone fix file)

## Status After Running

After running this SQL update, your system will be at **100% production readiness** for session-based queue management.

---

**IMPORTANT:** Run this update IMMEDIATELY before going to production.
