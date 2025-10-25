# 🗂️ SUPABASE STORAGE SETUP GUIDE

## **📋 OVERVIEW**

This guide will help you set up Supabase Storage for your ad resources, enabling proper file upload and storage instead of temporary blob URLs.

---

## **🚀 QUICK SETUP (5 minutes)**

### **Step 1: Run Storage Setup SQL**

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Run the Storage Setup Script**
   - Copy the contents of `SUPABASE-STORAGE-SETUP.sql`
   - Paste into SQL Editor
   - Click **Run**

3. **Verify Setup**
   - Look for success messages:
     - ✅ Ad resources bucket created successfully
     - ✅ Storage policies created successfully (4 policies)

---

## **🔧 WHAT GETS CREATED**

### **1. Storage Bucket**
- **Name**: `ad-resources`
- **Type**: Public bucket
- **File Size Limit**: 50MB
- **Allowed Types**: Images (JPEG, PNG, WebP, GIF) and Videos (MP4, WebM, QuickTime)

### **2. Storage Policies**
- ✅ **Upload**: Authenticated users can upload files
- ✅ **Update**: Users can update their own files
- ✅ **Delete**: Users can delete their own files
- ✅ **View**: Public access for display

### **3. File Organization**
```
ad-resources/
├── {clinic-id-1}/
│   ├── 1703123456_abc123.jpg
│   ├── 1703123457_def456.mp4
│   └── ...
├── {clinic-id-2}/
│   ├── 1703123458_ghi789.png
│   └── ...
└── ...
```

---

## **📱 HOW IT WORKS NOW**

### **Before (Broken)**
```typescript
// User selects file
const file = event.target.files[0];
const blobUrl = URL.createObjectURL(file); // blob:http://localhost:3000/abc123

// Store in database
url: blobUrl // ❌ Temporary, becomes invalid
```

### **After (Fixed)**
```typescript
// User selects file
const file = event.target.files[0];

// Upload to Supabase Storage
const uploadResult = await SupabaseStorageService.uploadFile(file, clinicId);
// Returns: https://project.supabase.co/storage/v1/object/public/ad-resources/clinic123/file.jpg

// Store in database
url: uploadResult.url // ✅ Permanent, accessible globally
```

---

## **🎯 FEATURES ADDED**

### **✅ File Upload Service**
- **Location**: `src/lib/supabase/storage.ts`
- **Features**:
  - File validation (size, type)
  - Unique filename generation
  - Error handling
  - Public URL generation

### **✅ Updated Add Resource Dialog**
- **Location**: `src/components/ad-resources/add-resource-dialog.tsx`
- **Features**:
  - Real file upload to Supabase
  - Upload progress indicator
  - File validation
  - Error handling
  - Old file cleanup on edit

### **✅ File Management**
- **Upload**: Files uploaded to `ad-resources/{clinic-id}/filename`
- **Delete**: Old files automatically deleted when updating
- **Access**: Public URLs for display
- **Organization**: Files organized by clinic ID

---

## **🔍 TESTING THE SETUP**

### **1. Test Storage Access**
Run this in Supabase SQL Editor:
```sql
SELECT test_storage_access();
```
Should return: ✅ Supabase Storage setup complete!

### **2. Test File Upload**
1. Go to **Ad Resources** page in your app
2. Click **Add New Resource**
3. Select an image or video file
4. Enter a title
5. Click **Add Resource**
6. Check that upload shows progress indicator
7. Verify file appears in your ad resources list

### **3. Test File Display**
1. Go to **Display** page
2. Verify your uploaded files appear in the carousel
3. Check that images/videos load properly

---

## **📊 STORAGE BENEFITS**

### **Before vs After**

| Feature | Before ❌ | After ✅ |
|---------|-----------|----------|
| **File Storage** | Browser memory only | Supabase Storage |
| **URL Type** | `blob:http://...` | `https://supabase.co/...` |
| **Persistence** | Lost on refresh | Permanent |
| **Access** | Local only | Global access |
| **Scalability** | Not scalable | Fully scalable |
| **File Size** | Limited by browser | 50MB limit |
| **File Types** | No validation | Validated types |
| **Organization** | No structure | Organized by clinic |

---

## **🚨 TROUBLESHOOTING**

### **Common Issues**

#### **1. "Bucket not found" Error**
```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'ad-resources';
```
**Solution**: Re-run the storage setup SQL

#### **2. "Permission denied" Error**
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```
**Solution**: Ensure all 4 policies were created

#### **3. "File too large" Error**
- **Current limit**: 50MB
- **Solution**: Compress your file or increase limit in setup SQL

#### **4. "Invalid file type" Error**
- **Allowed types**: JPEG, PNG, WebP, GIF, MP4, WebM, QuickTime
- **Solution**: Convert your file to an allowed format

---

## **🎉 SUCCESS INDICATORS**

You'll know the setup is working when:

✅ **Storage bucket exists** in Supabase Dashboard  
✅ **Files upload successfully** with progress indicator  
✅ **Files display properly** in the ad carousel  
✅ **URLs are permanent** (not blob URLs)  
✅ **Files persist** after page refresh  
✅ **No console errors** during upload  

---

## **🔧 NEXT STEPS**

1. **Run the storage setup SQL** ✅
2. **Test file upload** ✅
3. **Verify display works** ✅
4. **Deploy to production** ✅

**Your ad resource system is now production-ready with proper file storage!** 🎬

---

## **📞 SUPPORT**

If you encounter any issues:
1. Check the Supabase Dashboard for error logs
2. Verify the storage bucket exists
3. Ensure all policies are created
4. Check browser console for JavaScript errors

**The system now properly stores files in Supabase Storage instead of temporary blob URLs!** 🚀
