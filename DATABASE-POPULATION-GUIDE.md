# 🧪 Database Population Instructions

## ✅ Fixed UUID Issue!

The SQL script has been updated to use proper UUIDs instead of string IDs. The clinic ID is now:
`550e8400-e29b-41d4-a716-446655440000`

## 🚀 How to Run the Test Data Script

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor** tab
3. Click **"New Query"**

### Step 2: Copy and Run the Script
1. Open the file `populate-test-data.sql` in this directory
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **"Run"** button

### Step 3: Verify Success
You should see output like:
```
Data Population Complete!
doctors_count: 8
patients_count: 20
visits_count: 60+
queue_count: 60+
```

## 🎯 What You'll Get

### **8 Doctors** across specialties:
- Dr. Sarah Johnson (Cardiology)
- Dr. Michael Chen (Neurology)
- Dr. Emily Rodriguez (Orthopedics)
- Dr. David Kim (Pediatrics)
- Dr. Lisa Thompson (Dermatology)
- Dr. James Wilson (General Medicine)
- Dr. Maria Garcia (Internal Medicine)
- Dr. Robert Brown (Emergency Medicine)

### **20 Test Patients** with:
- Realistic names and contact info
- Medical histories
- Emergency contacts
- Complete addresses

### **60+ Visit Records** with:
- Mix of statuses: Completed, No-show, Skipped, In-consultation, Waiting
- All three sessions: Morning, Afternoon, Evening
- Realistic timing and durations
- Payment methods and fees
- Visit notes and satisfaction ratings

### **Queue Entries** for all visits
### **Ad Resources** for display testing

## 🧪 Ready to Test!

After running the script, you can test:

1. **Live Queue** (`/queue`) - Call, skip, rejoin patients
2. **Visit Register** (`/register`) - View detailed visit analytics
3. **Live Display** (`/display`) - Real-time queue status
4. **Token Generation** (`/generate-token`) - Create new appointments
5. **Doctor Management** (`/doctors`) - View all doctors
6. **Settings** (`/settings`) - Hospital configuration

## 🔧 Login Credentials

- **Username:** `admin`
- **PIN:** `1234`
- **Clinic:** CuraFlow Central Hospital

**Happy Testing!** 🎉

