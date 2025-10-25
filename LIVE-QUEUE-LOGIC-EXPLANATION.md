# 🏥 CURAFLOW LIVE QUEUE LOGIC - COMPREHENSIVE EXPLANATION

## 🎯 **OVERVIEW**

The live queue system is the **core functionality** of CuraFlow that manages real-time patient flow in hospitals. It handles the complete patient journey from check-in to consultation completion.

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **3-Layer Architecture**
```
Frontend (React) → API Routes (Next.js) → Database (Supabase PostgreSQL)
     ↓                    ↓                      ↓
Queue Management    Business Logic         Data Storage
Real-time Updates   Status Transitions     Queue State
```

---

## 📊 **DATABASE STRUCTURE**

### **Core Tables**

#### **1. `queue` Table** - Real-time Queue State
```sql
CREATE TABLE queue (
    id UUID PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id),
    appointment_id UUID REFERENCES visits(id),
    check_in_time TIMESTAMPTZ,
    status TEXT CHECK (status IN ('Waiting', 'In-consultation', 'Skipped', 'Completed', 'Cancelled')),
    priority TEXT DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **2. `visits` Table** - Appointment Records
```sql
CREATE TABLE visits (
    id UUID PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id),
    patient_id UUID REFERENCES patients(id),
    doctor_id UUID REFERENCES doctors(id),
    token_number INTEGER,
    date DATE,
    session TEXT CHECK (session IN ('Morning', 'Afternoon', 'Evening')),
    status TEXT,
    check_in_time TIMESTAMPTZ,
    called_time TIMESTAMPTZ,
    completed_time TIMESTAMPTZ
);
```

#### **3. `patients` & `doctors` Tables** - Reference Data
- **Patients**: Name, phone, age, gender, visit history
- **Doctors**: Name, specialty, availability status

---

## 🔄 **QUEUE STATUS FLOW**

### **Status Transitions**
```
Token Generated → Waiting → In-consultation → Completed
                      ↓           ↓
                   Skipped ←──────┘
                      ↓
                   Rejoin (back to Waiting)
```

### **Status Definitions**

#### **1. 🟡 Waiting**
- **When**: Patient checked in, waiting for doctor
- **Action**: Can be called by receptionist
- **Display**: Amber badge with clock icon

#### **2. 🟢 In-consultation** 
- **When**: Patient called and currently with doctor
- **Action**: Can be skipped by receptionist
- **Display**: Green badge with "NOW" text

#### **3. 🟠 Skipped**
- **When**: Patient was in consultation but skipped
- **Action**: Can rejoin queue (back to Waiting)
- **Display**: Yellow badge with warning icon

#### **4. ✅ Completed**
- **When**: Consultation finished successfully
- **Action**: No further actions (final state)
- **Display**: Green badge with checkmark

#### **5. ❌ Cancelled**
- **When**: Appointment cancelled or patient no-show
- **Action**: No further actions (final state)
- **Display**: Red badge with X icon

---

## 🎮 **USER INTERACTIONS**

### **Receptionist Actions**

#### **1. 📞 Call Patient**
```typescript
// Frontend: queue/page.tsx
const handleCallPatient = (patientId: string) => {
    const waitingQueue = doctorQueue.filter(item => item.status === 'Waiting');
    const isNextInLine = waitingQueue[0].id === patientId;
    const isAnyPatientInConsultation = doctorQueue.some(p => p.status === 'In-consultation');

    // If calling out-of-turn, ask for reason
    if (!isNextInLine && isAnyPatientInConsultation) {
        setReasonDialogOpen(true);
    } else {
        performCallPatient(patientId);
    }
};
```

**Logic:**
- ✅ **In-order**: Call next patient in line
- ⚠️ **Out-of-turn**: Ask for reason (priority, emergency, etc.)
- 🔄 **Auto-complete**: Complete current patient before calling new one

#### **2. ⏭️ Skip Patient**
```typescript
// When patient is in consultation but needs to be skipped
const handleSkipPatient = async (patientId: string) => {
    await post('/api/queue/skip', { patientId });
    // Updates status to 'Skipped'
};
```

**Use Cases:**
- Patient needs to leave temporarily
- Doctor needs to attend emergency
- Patient requests to be called later

#### **3. 🔄 Rejoin Patient**
```typescript
// When skipped patient wants to rejoin
const handleRejoinPatient = async (patientId: string) => {
    await post('/api/queue/rejoin', { patientId });
    // Updates status back to 'Waiting'
};
```

---

## 🔧 **API ENDPOINTS**

### **1. GET `/api/queue`** - Fetch Queue Data
```typescript
// Returns current queue state for clinic
const queue = await supabaseService.getQueue(clinicId);
```

**Database Function:**
```sql
CREATE OR REPLACE FUNCTION get_full_queue(p_clinic_id UUID)
RETURNS TABLE (
    id UUID,
    token_number INTEGER,
    patient_name TEXT,
    doctor_name TEXT,
    check_in_time TIMESTAMPTZ,
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
$$ LANGUAGE plpgsql;
```

### **2. POST `/api/queue/call`** - Call Patient
```typescript
export async function POST(request: NextRequest) {
    const { patientId, doctorId, reason } = await request.json();
    
    // 1. Complete any current patient for this doctor
    await supabaseService.completeCurrentPatientInQueue(doctorId, clinicId);
    
    // 2. Find queue item
    const queueItem = queue.find(q => q.appointment_id === patientId);
    
    // 3. Call the patient
    await supabaseService.callPatient(queueItem.id, reason);
    
    // 4. Update visit record
    await supabaseService.updateVisit(patientId, {
        called_time: new Date().toISOString(),
        out_of_turn_reason: reason
    });
    
    // 5. Return updated queue
    return ApiResponse.success(updatedQueue);
}
```

### **3. POST `/api/queue/skip`** - Skip Patient
```typescript
export async function POST(request: NextRequest) {
    const { patientId } = await request.json();
    
    // Find and skip patient
    const queueItem = queue.find(q => q.appointment_id === patientId);
    await supabaseService.skipPatient(queueItem.id, 'Skipped by receptionist');
    
    return ApiResponse.success(updatedQueue);
}
```

### **4. POST `/api/queue/rejoin`** - Rejoin Patient
```typescript
export async function POST(request: NextRequest) {
    const { patientId } = await request.json();
    
    // Rejoin patient to waiting queue
    const queueItem = queue.find(q => q.appointment_id === patientId);
    await supabaseService.updateQueueStatus(queueItem.id, 'Waiting');
    
    return ApiResponse.success(updatedQueue);
}
```

---

## ⚡ **REAL-TIME FEATURES**

### **1. Auto-Refresh**
```typescript
// Refresh queue every 30 seconds
useEffect(() => {
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
}, []);
```

### **2. Cross-Page Synchronization**
```typescript
// Updates across all open browser tabs
const { triggerUpdate } = useCrossPageSync({
    onQueueUpdate: async () => {
        await fetchQueue(); // Refresh queue data
    }
});
```

### **3. Session Management**
```typescript
// Automatic session transition detection
const sessionTransitionInfo = checkSessionTransition(
    currentSession, 
    previousSession, 
    doctors
);

if (sessionTransitionInfo.hasTransitioned) {
    // Handle session change
    // Complete current patients
    // Clear previous session data
}
```

---

## 🎯 **QUEUE FILTERING & SORTING**

### **Filtering Options**
1. **By Doctor** - Show only specific doctor's queue
2. **By Session** - Morning/Afternoon/Evening
3. **By Status** - Waiting/In-consultation/Skipped/Completed

### **Sorting Logic**
```typescript
// Priority-based sorting
const sortedQueue = queue.sort((a, b) => {
    // 1. Status priority: In-consultation → Waiting → Skipped → Completed
    const statusPriority = { 'In-consultation': 1, 'Waiting': 2, 'Skipped': 3, 'Completed': 4 };
    
    // 2. Check-in time (earlier first)
    if (statusPriority[a.status] === statusPriority[b.status]) {
        return new Date(a.check_in_time) - new Date(b.check_in_time);
    }
    
    return statusPriority[a.status] - statusPriority[b.status];
});
```

---

## 📱 **USER INTERFACE**

### **Desktop View**
- **Table Layout** - Professional table with all details
- **Action Buttons** - Call/Skip/Rejoin buttons per row
- **Status Badges** - Color-coded status indicators
- **Real-time Updates** - Live data refresh

### **Mobile View**
- **Card Layout** - Touch-friendly cards
- **Swipe Actions** - Mobile-optimized interactions
- **Responsive Design** - Adapts to screen size

---

## 🔒 **SECURITY & VALIDATION**

### **Multi-tenant Security**
```typescript
// Every operation checks clinic_id
const clinicId = getClinicId(request);
if (!clinicId) return clinicIdNotFoundResponse();
```

### **Input Validation**
```typescript
// Validate required fields
const validationError = validateRequiredFields({ patientId }, ['patientId']);
if (validationError) return validationError;
```

### **Database Security**
```sql
-- Row Level Security (RLS)
CREATE POLICY "Allow all operations on queue for authenticated users" ON queue
    FOR ALL USING (auth.role() = 'authenticated');
```

---

## 📊 **STATISTICS & ANALYTICS**

### **Real-time Metrics**
- **Total Patients** - Count of all patients in queue
- **Waiting Patients** - Patients waiting for doctor
- **In Consultation** - Currently being served
- **Completed Today** - Successfully finished consultations

### **Performance Tracking**
- **Average Wait Time** - Time from check-in to call
- **Consultation Duration** - Time spent with doctor
- **Skip Rate** - Percentage of skipped patients
- **Completion Rate** - Percentage of completed consultations

---

## 🚀 **ADVANCED FEATURES**

### **1. Priority Management**
- **Out-of-turn Calling** - Emergency patients can jump queue
- **Reason Tracking** - Log why patient was called out-of-turn
- **Priority Levels** - High/Medium/Low priority system

### **2. Session Management**
- **Automatic Transitions** - Detect session changes
- **Session Cleanup** - Complete patients when session ends
- **No-show Handling** - Mark waiting patients as no-show

### **3. Doctor Availability**
- **Status Toggle** - Available/Unavailable/On Leave
- **Queue Filtering** - Show only available doctors
- **Display Integration** - TV display shows availability

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Queue Not Updating**
- **Check**: Auto-refresh interval (30 seconds)
- **Check**: Cross-page sync is enabled
- **Check**: Database connection

#### **2. Patient Not Found**
- **Check**: `appointment_id` mapping
- **Check**: Queue item exists in database
- **Check**: Clinic ID is correct

#### **3. Status Not Changing**
- **Check**: Database permissions
- **Check**: RPC function exists
- **Check**: API response handling

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **Database Optimization**
- **Indexes** - On clinic_id, status, check_in_time
- **RPC Functions** - Optimized queries
- **Connection Pooling** - Efficient database connections

### **Frontend Optimization**
- **Debounced Updates** - Prevent excessive API calls
- **Memoization** - Cache expensive calculations
- **Lazy Loading** - Load data on demand

---

## 🎯 **SUMMARY**

The live queue system is a **sophisticated real-time patient management system** that:

1. **Manages Patient Flow** - From check-in to completion
2. **Handles Status Transitions** - Waiting → In-consultation → Completed
3. **Supports Priority Management** - Out-of-turn calling with reasons
4. **Provides Real-time Updates** - Live synchronization across devices
5. **Ensures Data Integrity** - Multi-tenant security and validation
6. **Offers Analytics** - Performance metrics and statistics

**The system is production-ready and handles all aspects of hospital queue management efficiently!** 🏥✨
