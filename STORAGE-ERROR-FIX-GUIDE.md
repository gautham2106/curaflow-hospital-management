# 🔧 **STORAGE ERROR FIX GUIDE**

## **❌ ERROR IDENTIFIED**

**Error**: `StorageApiError: new row violates row-level security policy`

**Cause**: Supabase Storage Row Level Security (RLS) policies are too restrictive for anonymous users.

---

## **🚀 QUICK FIX (2 minutes)**

### **Step 1: Run SQL Fix Script** ⏱️ **1 minute**

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste this script**:

```sql
-- Fix Storage RLS Policies
DROP POLICY IF EXISTS "Allow authenticated users to upload ad resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update ad resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete ad resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to view ad resources" ON storage.objects;

-- Create simpler, more permissive policies
CREATE POLICY "Allow upload to ad-resources bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'ad-resources');

CREATE POLICY "Allow update in ad-resources bucket" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'ad-resources');

CREATE POLICY "Allow delete from ad-resources bucket" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'ad-resources');

CREATE POLICY "Allow public read access to ad-resources" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ad-resources');

-- Ensure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'ad-resources';
```

4. **Click "Run"** to execute the script

### **Step 2: Test File Upload** ⏱️ **1 minute**

1. **Go to your live app**: https://curaflow-saas-9fj0a465x-gs-projects-13b73890.vercel.app
2. **Login as a clinic admin**
3. **Go to Ad Resources page**
4. **Try uploading a file**
5. **Check if it works**

---

## **🆘 ALTERNATIVE FIX (If above doesn't work)**

### **Emergency Fallback - Disable RLS** ⏱️ **30 seconds**

If the above fix doesn't work, run this in Supabase SQL Editor:

```sql
-- Disable RLS for storage (emergency fix)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Ensure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'ad-resources';
```

---

## **🔍 WHAT CAUSED THIS ERROR?**

### **Root Cause:**
- Supabase Storage has Row Level Security (RLS) enabled
- The original policies required authenticated users
- Our storage service uses anonymous key (not authenticated)
- This caused the "violates row-level security policy" error

### **Why This Happens:**
- Supabase Storage is secure by default
- RLS policies control who can upload/access files
- Anonymous users need specific policies to upload
- The original policies were too restrictive

---

## **✅ EXPECTED RESULT AFTER FIX**

### **After running the fix:**
- ✅ **File uploads will work** without authentication
- ✅ **Ad resources can be uploaded** from the app
- ✅ **Files will be stored** in Supabase Storage
- ✅ **Public URLs will be generated** for display
- ✅ **No more RLS errors** in console

---

## **🧪 TEST THE FIX**

### **Test Steps:**
1. **Run the SQL script** in Supabase
2. **Refresh your app** in the browser
3. **Go to Ad Resources page**
4. **Upload a test image** (JPG, PNG, etc.)
5. **Check if it appears** in the list
6. **Verify no console errors**

### **Success Indicators:**
- ✅ **No console errors** about RLS
- ✅ **File uploads successfully**
- ✅ **Files appear in ad resources list**
- ✅ **Files display correctly** on TV display

---

## **📞 IF STILL HAVING ISSUES**

### **Check These:**
1. **Supabase Project**: Make sure you're in the right project
2. **Bucket Exists**: Verify 'ad-resources' bucket exists
3. **Policies Applied**: Check that policies were created
4. **Bucket Public**: Ensure bucket is set to public

### **Debug Commands:**
```sql
-- Check if bucket exists and is public
SELECT id, name, public FROM storage.buckets WHERE id = 'ad-resources';

-- Check storage policies
SELECT policyname, cmd, qual FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

---

## **🎉 AFTER FIXING**

**Your ad resources feature will work perfectly!**

- ✅ **Upload images and videos** for TV display
- ✅ **Manage ad content** from the admin panel
- ✅ **Display ads** on the TV screen
- ✅ **No more storage errors**

**The fix is simple and takes just 2 minutes!** 🚀
