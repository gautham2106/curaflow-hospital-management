-- ============================================================
-- SUPABASE STORAGE SETUP FOR AD RESOURCES
-- ============================================================
-- This script sets up Supabase Storage for ad resource files
-- Run this in your Supabase SQL Editor

-- ============================================================
-- STEP 1: CREATE STORAGE BUCKET
-- ============================================================
-- Create the ad-resources bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ad-resources', 
    'ad-resources', 
    true,  -- Public bucket for easy access
    52428800,  -- 50MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================
-- STEP 2: CREATE STORAGE POLICIES
-- ============================================================

-- Policy 1: Allow authenticated users to upload ad resources
CREATE POLICY "Allow authenticated users to upload ad resources" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'ad-resources' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'ad-resources'
);

-- Policy 2: Allow authenticated users to update their own ad resources
CREATE POLICY "Allow authenticated users to update ad resources" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'ad-resources' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'ad-resources'
);

-- Policy 3: Allow authenticated users to delete their own ad resources
CREATE POLICY "Allow authenticated users to delete ad resources" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'ad-resources' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'ad-resources'
);

-- Policy 4: Allow public access to view ad resources (for display)
CREATE POLICY "Allow public access to view ad resources" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ad-resources');

-- ============================================================
-- STEP 3: VERIFY SETUP
-- ============================================================
-- Check if bucket was created successfully
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ad-resources') THEN
        RAISE NOTICE '✅ Ad resources bucket created successfully';
    ELSE
        RAISE EXCEPTION '❌ Failed to create ad resources bucket';
    END IF;
END $$;

-- Check policies
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%ad resources%';
    
    IF policy_count >= 4 THEN
        RAISE NOTICE '✅ Storage policies created successfully (% policies)', policy_count;
    ELSE
        RAISE WARNING '⚠️ Only % policies found, expected 4', policy_count;
    END IF;
END $$;

-- ============================================================
-- STEP 4: TEST UPLOAD FUNCTION
-- ============================================================
-- Create a test function to verify storage access
CREATE OR REPLACE FUNCTION test_storage_access()
RETURNS TEXT AS $$
DECLARE
    bucket_exists BOOLEAN;
    policies_exist BOOLEAN;
BEGIN
    -- Check if bucket exists
    SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'ad-resources') INTO bucket_exists;
    
    -- Check if policies exist
    SELECT COUNT(*) >= 4 INTO policies_exist 
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%ad resources%';
    
    IF bucket_exists AND policies_exist THEN
        RETURN '✅ Supabase Storage setup complete! Ready for file uploads.';
    ELSE
        RETURN '❌ Storage setup incomplete. Check bucket and policies.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the test
SELECT test_storage_access();

-- ============================================================
-- USAGE INSTRUCTIONS
-- ============================================================
/*
1. Run this script in your Supabase SQL Editor
2. The bucket 'ad-resources' will be created
3. Files will be stored in: ad-resources/{clinic_id}/{filename}
4. Public URLs will be: https://your-project.supabase.co/storage/v1/object/public/ad-resources/{clinic_id}/{filename}
5. Use the Supabase client to upload files from your Next.js app
*/
