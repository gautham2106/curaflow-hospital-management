-- ============================================================
-- FIX STORAGE RLS POLICIES FOR AD RESOURCES
-- ============================================================
-- This script fixes the Row Level Security policies for storage
-- Run this in your Supabase SQL Editor

-- ============================================================
-- STEP 1: DROP EXISTING RESTRICTIVE POLICIES
-- ============================================================
-- Remove existing policies that are too restrictive
DROP POLICY IF EXISTS "Allow authenticated users to upload ad resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update ad resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete ad resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to view ad resources" ON storage.objects;

-- ============================================================
-- STEP 2: CREATE SIMPLER, MORE PERMISSIVE POLICIES
-- ============================================================

-- Policy 1: Allow anyone to upload to ad-resources bucket
CREATE POLICY "Allow upload to ad-resources bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'ad-resources');

-- Policy 2: Allow anyone to update files in ad-resources bucket
CREATE POLICY "Allow update in ad-resources bucket" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'ad-resources');

-- Policy 3: Allow anyone to delete files in ad-resources bucket
CREATE POLICY "Allow delete from ad-resources bucket" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'ad-resources');

-- Policy 4: Allow public access to view ad resources
CREATE POLICY "Allow public read access to ad-resources" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ad-resources');

-- ============================================================
-- STEP 3: ALTERNATIVE - DISABLE RLS FOR STORAGE (IF NEEDED)
-- ============================================================
-- If the above policies still don't work, you can disable RLS entirely for storage
-- Uncomment the following line if you need to disable RLS:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 4: VERIFY BUCKET EXISTS AND IS PUBLIC
-- ============================================================
-- Ensure the bucket exists and is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'ad-resources';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ad-resources', 
    'ad-resources', 
    true,  -- Public bucket
    52428800,  -- 50MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- STEP 5: TEST STORAGE ACCESS
-- ============================================================
-- Create a test function to verify storage access
CREATE OR REPLACE FUNCTION test_storage_access_fixed()
RETURNS TEXT AS $$
DECLARE
    bucket_exists BOOLEAN;
    bucket_public BOOLEAN;
    policies_exist BOOLEAN;
BEGIN
    -- Check if bucket exists and is public
    SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'ad-resources'), 
           (SELECT public FROM storage.buckets WHERE id = 'ad-resources')
    INTO bucket_exists, bucket_public;
    
    -- Check if policies exist
    SELECT COUNT(*) >= 4 INTO policies_exist 
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%ad-resources%';
    
    IF bucket_exists AND bucket_public AND policies_exist THEN
        RETURN '✅ Storage setup fixed! Bucket is public and policies are permissive.';
    ELSIF bucket_exists AND bucket_public THEN
        RETURN '✅ Bucket exists and is public. Policies may need adjustment.';
    ELSE
        RETURN '❌ Storage setup still has issues. Check bucket and policies.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the test
SELECT test_storage_access_fixed();

-- ============================================================
-- STEP 6: EMERGENCY FALLBACK - DISABLE RLS
-- ============================================================
-- If you're still having issues, uncomment this line to disable RLS entirely:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- USAGE INSTRUCTIONS
-- ============================================================
/*
1. Run this script in your Supabase SQL Editor
2. The storage policies will be updated to be more permissive
3. The ad-resources bucket will be made public
4. Try uploading files again from your application
5. If still having issues, uncomment the RLS disable line above
*/
