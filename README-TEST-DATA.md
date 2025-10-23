# 🧪 Test Data Population Guide

## How to Populate Your Database with Test Data

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase dashboard
2. Navigate to the "SQL Editor" tab
3. Click "New Query"

### Step 2: Run the Test Data Script
Copy and paste the contents of `populate-test-data.sql` into the SQL editor and run it.

### Step 3: Verify Data Population
After running the script, you should see:
- 8 doctors across different specialties
- 20 test patients with realistic data
- 60+ visit records across all sessions
- Queue entries for all visits
- Ad resources for display testing

## 🎯 What You Can Test

### 1. **Live Queue Management**
- Go to `/queue` page
- Select different doctors and sessions
- Test Call, Skip, and Rejoin functionality
- End sessions to see statistics

### 2. **Visit Register Analytics**
- Go to `/register` page
- View today's visit records
- Filter by doctor, session, and status
- Export data to PDF

### 3. **Live Display**
- Go to `/display` page
- See real-time queue status
- Test QR code tracking links
- Verify session-based filtering

### 4. **Token Generation**
- Go to `/generate-token` page
- Create new appointments
- Test WhatsApp notifications
- Verify tracking links

### 5. **Doctor Management**
- Go to `/doctors` page
- View all doctors and their status
- Test doctor availability

### 6. **Settings & Configuration**
- Go to `/settings` page
- View hospital information
- Manage departments and sessions

## 📊 Test Data Includes

### **Doctors (8 total)**
- Dr. Sarah Johnson (Cardiology)
- Dr. Michael Chen (Neurology) 
- Dr. Emily Rodriguez (Orthopedics)
- Dr. David Kim (Pediatrics)
- Dr. Lisa Thompson (Dermatology)
- Dr. James Wilson (General Medicine)
- Dr. Maria Garcia (Internal Medicine)
- Dr. Robert Brown (Emergency Medicine)

### **Patients (20 total)**
- Realistic names, phone numbers, emails
- Various ages and medical histories
- Emergency contacts
- Complete addresses

### **Visits (60+ total)**
- Mix of statuses: Completed, No-show, Skipped, In-consultation, Waiting
- All three sessions: Morning, Afternoon, Evening
- Realistic timing and durations
- Payment methods and fees
- Visit notes and satisfaction ratings

### **Queue Entries**
- Corresponding queue status for each visit
- Priority levels (High, Medium, Low)
- Check-in times

### **Ad Resources (5 total)**
- Healthcare-related images
- Different durations
- Display order configuration

## 🔄 Testing Scenarios

### **Scenario 1: Morning Session**
1. Select a doctor for Morning session
2. Call patients in order
3. Skip some patients
4. End session and check statistics

### **Scenario 2: Afternoon Session**
1. Switch to Afternoon session
2. Test out-of-turn calls
3. Verify queue updates
4. Check visit register

### **Scenario 3: Evening Session**
1. Test Evening session
2. Create new appointments
3. Test WhatsApp notifications
4. Verify live display

### **Scenario 4: Cross-Session Testing**
1. Have patients in different sessions
2. Test session filtering
3. Verify data isolation
4. Test multi-doctor scenarios

## 🚀 Ready to Test!

Your database will be populated with comprehensive test data that covers all possible scenarios and edge cases. This will allow you to thoroughly test every feature of your hospital management system.

**Happy Testing!** 🎉

