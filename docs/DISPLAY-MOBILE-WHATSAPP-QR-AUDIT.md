# Mobile Display, WhatsApp & QR Code Workflow - Complete Audit

**Date:** 2025-10-26
**Scope:** Complete analysis of display URLs, mobile access, WhatsApp integration, QR codes, and real-time updates

---

## Executive Summary

**Overall Status:** ⚠️ **NEEDS CRITICAL FIXES (65% Complete)**

**Key Issues Found:**
1. ❌ **QR URL Missing `tokenNumber` Parameter** - Cannot highlight user's token
2. ⚠️ **WhatsApp URL Uses Different Base URL** - Hard-coded Vercel URL
3. ⚠️ **30-Second Polling Delay** - Not truly real-time
4. ❌ **No Token Highlighting in Mobile View** - Token parameter not used properly
5. ⚠️ **Cross-Page Sync Only Works Same Browser** - BroadcastChannel limitation
6. ❌ **Mobile View Missing Session Info** - No session time display
7. ⚠️ **QR Mode Bypasses SessionStorage** - May cause issues

---

## Use Cases Analysis

### Use Case 1: Patient Scans QR Code from Printed Token

**Current Flow:**
```
1. Patient receives printed token at clinic
2. Token has QR code with URL:
   /display?clinicId=X&doctorId=Y&date=2025-10-26&session=Morning&tokenId=abc-123
3. Patient scans QR → Opens on mobile browser
4. Display page loads in "QR Mode"
5. Shows mobile queue view
```

**✅ What Works:**
- QR code generates correctly
- Mobile responsive view displays
- Detects "QR Mode" based on URL parameters
- Future appointment detection works
- Pre-session countdown works

**❌ Critical Issues:**

#### Issue 1: Token Number Not in URL
**Problem:**
```typescript
// QR URL generated in print-token.tsx
const trackingUrl = `${window.location.origin}/display?clinicId=${clinicId}&doctorId=${doctor.id}&date=${format(date, 'yyyy-MM-dd')}&session=${session}&tokenId=${id}`
```

**Missing:** `tokenNumber=${tokenNumber}`

**Impact:**
- URL has `tokenId` (visit ID) but NOT the actual token number
- Display page tries to find token by `tokenId`:
  ```typescript
  const tokenToHighlight = useMemo(() => {
      if (qrTokenId) {
          const item = queue.find(q => q.appointmentId === qrTokenId);
          return item?.tokenNumber;  // ❌ May not find it!
      }
  }, [qrTokenId, queue]);
  ```
- If queue hasn't loaded or token ID doesn't match, highlighting fails

**Fix Needed:** Add `tokenNumber` to URL so display can highlight immediately.

---

#### Issue 2: Real-Time Updates Only 30-Second Polling

**Current Implementation:**
```typescript
// Refresh queue data every 30 seconds
useEffect(() => {
    const refreshQueue = async () => {
        // Fetch queue data
    };
    const interval = setInterval(refreshQueue, 30000); // ❌ 30 seconds!
    return () => clearInterval(interval);
}, [clinicId, isQrMode, get]);
```

**Problem:**
- Patient sees updates only every 30 seconds
- If their token is called, they may not see it for up to 29 seconds
- Not "real-time" as advertised

**Cross-Page Sync Limitation:**
```typescript
useCrossPageSync({
    onQueueUpdate: async () => {
        // Refresh immediately
    }
});
```
- Uses `BroadcastChannel` API
- Only works if patient AND receptionist are on **same browser**
- Mobile users scanning QR → different device → **doesn't work**

**Impact:** Patients miss their calls because updates are delayed.

---

#### Issue 3: Mobile View Doesn't Show Session Times

**Current Mobile View:**
```typescript
<Card className="p-4 text-center">
    <h1>{doctor.name}</h1>
    <p>{doctor.specialty}</p>
    <Badge>{doctor.status}</Badge>
    {/* ❌ No session time shown! */}
</Card>
```

**Missing Information:**
- Session name: "Morning Session"
- Session time range: "9:00 AM - 1:00 PM"
- Current time in session
- Estimated wait time

**Impact:** Patient doesn't know:
- When session ends
- How long they might wait
- If they arrived on time

---

### Use Case 2: WhatsApp Link Sent to Patient

**Current Flow:**
```
1. Receptionist generates token
2. Clicks "Send WhatsApp" button
3. Backend creates shortened URL via TinyURL
4. Sends WhatsApp template message with link
5. Patient clicks link → Opens display page
```

**WhatsApp Template:**
```
Hi {{patient_name}}!

Your appointment at {{clinic_name}} is confirmed.

Token: #{{token_number}}
Doctor: {{doctor_name}} ({{specialty}})
Date: {{date}}
Session: {{session}} ({{session_time}})

Track your queue live:
{{tracking_url}}
```

**✅ What Works:**
- WhatsApp API integration configured
- Template message format correct
- TinyURL shortening works
- All parameters passed correctly

**❌ Critical Issues:**

#### Issue 4: Hard-Coded Base URL

**Code:**
```typescript
// src/app/api/notifications/whatsapp/route.ts
const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://curaflow-saas-5ishsvhl4-gs-projects-13b73890.vercel.app';

const longUrl = `${baseUrl}/display?clinicId=${tokenData.clinicId}&doctorId=${tokenData.doctor.id}&date=${new Date(tokenData.date).toISOString().split('T')[0]}&session=${tokenData.session}&tokenId=${tokenData.id}`;
```

**Problems:**
1. **Fallback URL is hard-coded** - Won't work for other deployments
2. **Different from QR URL base** - QR uses `window.location.origin`, WhatsApp uses env variable
3. **Missing `tokenNumber`** - Same issue as QR code
4. **`tokenData.clinicId` may not exist** - Should use `sessionStorage` or header

**Impact:**
- WhatsApp links may break if env not set
- Won't work for custom domains
- Inconsistent with QR code URLs

---

#### Issue 5: WhatsApp Requires Env Variables

**Required:**
```
WHATSAPP_ACCESS_TOKEN=xxx
WHATSAPP_PHONE_ID=yyy
```

**Current Error Handling:**
```typescript
if (!accessToken || !phoneId) {
    return NextResponse.json({
        message: 'WhatsApp API credentials not configured',
        error: 'Missing environment variables'
    }, { status: 500 });
}
```

**Problem:**
- Returns 500 error (crashes to user)
- No graceful degradation
- Button still shows even if WhatsApp not configured

**Better Approach:**
- Check env variables on page load
- Hide WhatsApp button if not configured
- Show friendly message if clicked anyway

---

### Use Case 3: TV Display in Hospital Waiting Room

**Current Flow:**
```
1. Receptionist opens dashboard
2. Clicks "Display Options"
3. Selects doctors to show
4. Chooses ad mode (sidebar/fullscreen/split)
5. URL generated: /display?doctorIds=id1,id2&ads=true
6. Opens in kiosk mode on TV
```

**✅ What Works:**
- Multi-doctor display
- Ad carousel with images/videos
- Auto-cycling between doctors (15 seconds)
- Responsive layouts
- Session-based filtering

**Real-Time Updates:**
```typescript
// 30-second polling
useEffect(() => {
    const refreshQueue = async () => {
        const queueRes = await get('/api/queue');
        setQueue(await queueRes.json());
    };
    const interval = setInterval(refreshQueue, 30000);
}, []);

// Cross-page sync (same browser only)
useCrossPageSync({
    onQueueUpdate: async () => {
        // Immediate refresh when receptionist updates
    }
});
```

**✅ Acceptable:** 30 seconds is okay for TV display (not as critical as mobile)

---

### Use Case 4: Future Appointment (QR Scan Before Date)

**Current Implementation:**
```typescript
// Check if visit is for future date
const isFutureAppointment = highlightToken && !nowServing && !next &&
    !waitingList.find(item => item.tokenNumber === highlightToken);

if (isFutureAppointment) {
    return (
        <FutureAppointmentScreen
            date={sessionStartTime}
            doctorName={doctor.name}
            tokenNumber={highlightToken!}
        />
    );
}
```

**✅ What Works:**
- Detects future appointments
- Shows special screen: "Appointment Scheduled"
- Displays date in large format
- Shows token number and doctor

**⚠️ Issue:**
**Logic is Flawed:**
```typescript
const isFutureAppointment = highlightToken && !nowServing && !next &&
    !waitingList.find(item => item.tokenNumber === highlightToken);
```

**Problem:** This also triggers if:
- Queue is empty (no one serving, no next)
- Token not in queue yet (but it's today!)

**Better Check:**
```typescript
const visitDate = new Date(qrDate);  // From URL parameter
const today = new Date();
const isFutureAppointment = visitDate > today;
```

---

### Use Case 5: Pre-Session (Patient Arrives Early)

**Current Implementation:**
```typescript
const isPreSession = currentTime && isBefore(currentTime, sessionStartTime);

if (isPreSession) {
    return (
        <PreSessionScreen
            sessionStartTime={sessionStartTime}
            tokenNumber={highlightToken || 0}
        />
    );
}
```

**✅ What Works:**
- Detects if session hasn't started
- Shows countdown: "Session starts in 2h 15m"
- Shows session start time
- Shows token number

**⚠️ Issue:**
**Session Start Time Calculation:**
```typescript
const sessionConfig = sessionConfigs.find(s => s.name === currentSession);
const sessionStartTime = sessionConfig ?
    new Date(`${new Date().toISOString().split('T')[0]}T${sessionConfig.start_time}`)
    : new Date();
```

**Problems:**
1. Uses `sessionConfig.start_time` but should be `sessionConfig.start`
2. Assumes session is today (what if scanning day before?)
3. Should use `qrDate` from URL, not `new Date()`

**Fix:**
```typescript
const sessionConfig = sessionConfigs.find(s => s.name === qrSession);
const sessionStartTime = sessionConfig ?
    new Date(`${qrDate}T${sessionConfig.start}:00`)  // Use URL date + session start
    : new Date();
```

---

## All URL Parameters Breakdown

### QR Code URL (from Token Print)

**Generated In:** `src/components/token/print-token.tsx:52-54`

**Current:**
```
/display?clinicId=xxx&doctorId=yyy&date=2025-10-26&session=Morning&tokenId=abc-123
```

**Parameters:**
| Parameter | Source | Purpose | Issues |
|-----------|--------|---------|--------|
| `clinicId` | `sessionStorage` | Identify clinic | ✅ Works |
| `doctorId` | `tokenData.doctor.id` | Identify doctor | ✅ Works |
| `date` | `tokenData.date` | Appointment date | ✅ Works |
| `session` | `tokenData.session` | Session name | ✅ Works |
| `tokenId` | `tokenData.id` | Visit ID | ✅ Works |
| **MISSING** | `tokenData.tokenNumber` | **Token #** | ❌ **CRITICAL** |

---

### WhatsApp URL (from API)

**Generated In:** `src/app/api/notifications/whatsapp/route.ts:34`

**Current:**
```
https://curaflow-saas-xxx.vercel.app/display?clinicId=xxx&doctorId=yyy&date=2025-10-26&session=Morning&tokenId=abc-123
```

**Issues:**
| Issue | Impact |
|-------|--------|
| Hard-coded base URL | Won't work on custom domains |
| Different from QR base | Inconsistent |
| Missing `tokenNumber` | Same as QR issue |
| `tokenData.clinicId` undefined | May crash if not passed |

---

### TV Display URL (from Dashboard)

**Generated In:** `src/components/dashboard/display-options-dialog.tsx`

**Current:**
```
/display?doctorIds=id1,id2,id3&ads=true
```

**Parameters:**
| Parameter | Purpose | Issues |
|-----------|---------|--------|
| `doctorIds` | Comma-separated doctor IDs | ✅ Works |
| `ads` | Enable ad carousel | ✅ Works |

**Missing for Full Functionality:**
- `adMode=sidebar/fullscreen/split` - Currently defaults to sidebar
- `refreshInterval=30` - Customizable refresh rate
- `highlightDuration=5` - How long to animate highlights

---

## Real-Time Update Mechanisms

### Current Implementation

#### 1. Polling (30 seconds)
```typescript
useEffect(() => {
    const refreshQueue = async () => {
        if (!clinicId) return;
        const queueRes = await get('/api/queue');
        const queueData = await queueRes.json();
        setQueue(queueData);
    };

    const interval = setInterval(refreshQueue, 30000);  // Every 30 seconds
    return () => clearInterval(interval);
}, [clinicId, get]);
```

**Pros:**
- Simple to implement
- Works across devices
- No server infrastructure needed

**Cons:**
- ❌ 30-second delay
- ❌ Wastes bandwidth (polls even if no changes)
- ❌ Not truly "real-time"

---

#### 2. Cross-Page Sync (BroadcastChannel)
```typescript
useCrossPageSync({
    onQueueUpdate: async () => {
        if (!clinicId) return;
        const queueRes = await get('/api/queue');
        setQueue(await queueRes.json());
    }
});
```

**How It Works:**
- Uses Browser `BroadcastChannel` API
- When receptionist updates queue → broadcasts event
- Display page listening on same browser → refreshes immediately

**Pros:**
- ✅ Instant updates (< 100ms)
- ✅ No server infrastructure
- ✅ Works great for TV display

**Cons:**
- ❌ **Only works same browser** - Mobile users won't get updates
- ❌ Different tabs/windows only
- ❌ Won't work across devices

---

### What's Missing: True Real-Time for Mobile

**Mobile Patient Scenario:**
```
Patient scans QR → Opens on their phone
Receptionist calls patient → Updates on clinic computer
Patient's phone: ❌ NO INSTANT UPDATE (waits 30 seconds)
```

**Solutions Needed:**

#### Option 1: Shorter Polling Interval (Quick Fix)
```typescript
const interval = setInterval(refreshQueue, 5000);  // Every 5 seconds
```
**Pros:** Simple, works across devices
**Cons:** Still not instant, more bandwidth

#### Option 2: Server-Sent Events (SSE) - Better
```typescript
// Server endpoint: /api/queue/stream
export async function GET() {
    const stream = new ReadableStream({
        start(controller) {
            // Send updates when queue changes
        }
    });
    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    });
}

// Client
useEffect(() => {
    const eventSource = new EventSource('/api/queue/stream');
    eventSource.onmessage = (event) => {
        setQueue(JSON.parse(event.data));
    };
}, []);
```
**Pros:** True real-time, one-way from server
**Cons:** Needs special server setup

#### Option 3: Supabase Realtime (Best for This Stack)
```typescript
// Subscribe to queue changes
useEffect(() => {
    const channel = supabase
        .channel('queue-changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'visits'
        }, (payload) => {
            // Refresh queue when visits table changes
            refreshQueue();
        })
        .subscribe();

    return () => supabase.removeChannel(channel);
}, []);
```
**Pros:** True real-time, works across devices, built into Supabase
**Cons:** Requires Supabase Realtime enabled

---

## Mobile View Quality Issues

### What Mobile Users See

**Good:**
```
✅ Doctor name and specialty
✅ Doctor status (Available/Unavailable)
✅ NOW SERVING token (large, highlighted if theirs)
✅ NEXT token (medium, highlighted if theirs)
✅ WAITING list (all waiting tokens)
✅ Future appointment screen
✅ Pre-session countdown screen
```

**Missing/Bad:**
```
❌ Session name (Morning/Afternoon/Evening)
❌ Session time range (9:00 AM - 1:00 PM)
❌ Current time
❌ Queue position (e.g., "You are 5th in line")
❌ Estimated wait time
❌ "Your Turn Soon!" notification
❌ Audio/vibration alert when called
❌ Refresh indicator (user can't tell if it's updating)
❌ Last updated timestamp
```

---

## Issue Summary & Priority

| # | Issue | Severity | Impact | Priority |
|---|-------|----------|--------|----------|
| 1 | Missing `tokenNumber` in QR/WhatsApp URLs | 🔴 **CRITICAL** | Token highlighting fails | **P0** |
| 2 | 30-second polling not real-time | 🔴 **CRITICAL** | Patients miss their calls | **P0** |
| 3 | Hard-coded WhatsApp base URL | 🟠 **HIGH** | Breaks on custom domains | **P1** |
| 4 | Mobile view missing session info | 🟠 **HIGH** | Poor UX, confusion | **P1** |
| 5 | Future appointment detection flawed | 🟡 **MEDIUM** | Edge case bugs | **P2** |
| 6 | Pre-session time calculation wrong | 🟡 **MEDIUM** | Shows wrong countdown | **P2** |
| 7 | No queue position indicator | 🟡 **MEDIUM** | Patient anxiety | **P2** |
| 8 | No refresh indicator | 🟡 **MEDIUM** | Users don't know if updating | **P2** |
| 9 | WhatsApp button always visible | 🟢 **LOW** | Confusing if not configured | **P3** |
| 10 | Cross-page sync limited | 🟢 **LOW** | Works but not cross-device | **P3** |

---

## Recommended Fixes

### Priority 0 (CRITICAL) - Do First

#### Fix 1: Add Token Number to URLs

**File:** `src/components/token/print-token.tsx`
```typescript
// Line 52-54
const trackingUrl = (typeof window !== 'undefined' && clinicId)
  ? `${window.location.origin}/display?clinicId=${clinicId}&doctorId=${doctor.id}&date=${format(new Date(date), 'yyyy-MM-dd')}&session=${session}&tokenId=${id}&tokenNumber=${tokenNumber}`  // ADD THIS
  : '';
```

**File:** `src/app/api/notifications/whatsapp/route.ts`
```typescript
// Line 34
const longUrl = `${baseUrl}/display?clinicId=${tokenData.clinicId}&doctorId=${tokenData.doctor.id}&date=${new Date(tokenData.date).toISOString().split('T')[0]}&session=${tokenData.session}&tokenId=${tokenData.id}&tokenNumber=${tokenData.tokenNumber}`;  // ADD THIS
```

**File:** `src/app/(display)/display/page.tsx`
```typescript
// Line 455 - Add parameter
const qrTokenNumber = searchParams.get('tokenNumber');

// Line 535-541 - Use it directly
const tokenToHighlight = useMemo(() => {
    // Try URL parameter first
    if (qrTokenNumber) {
        return parseInt(qrTokenNumber);
    }
    // Fallback to finding by tokenId
    if (qrTokenId) {
        const item = queue.find(q => q.appointmentId === qrTokenId);
        return item?.tokenNumber;
    }
    return undefined;
}, [qrTokenNumber, qrTokenId, queue]);
```

---

#### Fix 2: Implement Real-Time Updates via Supabase

**File:** `src/app/(display)/display/page.tsx`
```typescript
// Add after initial data fetch
useEffect(() => {
    if (!clinicId) return;

    // Subscribe to queue changes
    const channel = supabase
        .channel('queue-realtime')
        .on('postgres_changes', {
            event: '*',  // INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'visits',
            filter: `clinic_id=eq.${clinicId}`
        }, async (payload) => {
            console.log('Queue changed:', payload);
            // Refresh queue immediately
            const queueRes = await get('/api/queue');
            if (queueRes && queueRes.ok) {
                const queueData = await queueRes.json();
                setQueue(queueData);
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}, [clinicId, get]);
```

**Alternative: Reduce polling to 5 seconds (quick fix)**
```typescript
const interval = setInterval(refreshQueue, 5000);  // 5 seconds instead of 30
```

---

### Priority 1 (HIGH) - Do Soon

#### Fix 3: Dynamic Base URL for WhatsApp

**File:** `src/app/api/notifications/whatsapp/route.ts`
```typescript
// Line 30-32 - Replace with
const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
```

**Then add to `.env`:**
```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

#### Fix 4: Add Session Info to Mobile View

**File:** `src/app/(display)/display/page.tsx`
```typescript
// In MobileQueueDisplay component, add after header card:
<Card className="p-4 bg-blue-50 border-blue-200">
    <div className="flex justify-between items-center">
        <div>
            <p className="font-semibold text-blue-800">{currentSession} Session</p>
            <p className="text-sm text-blue-600">
                {sessionTimeRange}
            </p>
        </div>
        <div className="text-right">
            <p className="text-xs text-blue-600">Current Time</p>
            <p className="font-bold text-blue-800">
                {format(currentTime || new Date(), 'h:mm a')}
            </p>
        </div>
    </div>
</Card>
```

---

### Priority 2 (MEDIUM) - Nice to Have

#### Fix 5: Add Queue Position Indicator
```typescript
{highlightToken && (
    <Card className="p-4 bg-amber-50 border-amber-200">
        <p className="text-center text-amber-800">
            Your position: <span className="font-bold text-2xl">
                {waitingList.findIndex(item => item.tokenNumber === highlightToken) + 1}
            </span> of {waitingList.length}
        </p>
    </Card>
)}
```

---

## Testing Checklist

### QR Code Scanning
- [ ] Scan token from same-day appointment → Shows live queue
- [ ] Scan token from future appointment → Shows "Appointment Scheduled" screen
- [ ] Scan token before session starts → Shows countdown
- [ ] User's token is highlighted in queue
- [ ] Updates when receptionist calls next patient
- [ ] Works on different mobile devices (iOS/Android)

### WhatsApp Links
- [ ] Click WhatsApp link → Opens display page
- [ ] Token highlighted correctly
- [ ] All appointment details match
- [ ] Works on mobile data (not just WiFi)
- [ ] TinyURL redirect works

### Real-Time Updates
- [ ] Receptionist calls patient → Display updates within 5 seconds
- [ ] Token status changes (Waiting → In-consultation → Completed)
- [ ] Queue order changes reflect immediately
- [ ] Doctor status changes (Available → Unavailable)

### Mobile UX
- [ ] All text readable on small screens
- [ ] Touch targets large enough
- [ ] No horizontal scrolling
- [ ] Refresh button works
- [ ] Future appointment screen clear
- [ ] Pre-session countdown accurate

### TV Display
- [ ] Multi-doctor view cycles correctly
- [ ] Ad carousel plays smoothly
- [ ] Queue updates every 30 seconds
- [ ] Doctor status changes show
- [ ] Layout doesn't break with many patients

---

## Conclusion

**Current State:** The display system has a solid foundation but needs **critical fixes** for production use.

**Biggest Issues:**
1. Missing `tokenNumber` parameter breaks primary feature (highlighting)
2. 30-second polling creates poor mobile experience
3. Hard-coded URLs limit deployment flexibility

**Recommended Action Plan:**
1. **Week 1:** Fix token number parameter (P0)
2. **Week 1:** Implement Supabase Realtime or reduce polling to 5s (P0)
3. **Week 2:** Fix WhatsApp base URL (P1)
4. **Week 2:** Enhance mobile view with session info (P1)
5. **Week 3:** Add nice-to-have features (P2)

**After Fixes:** System will be **production-ready** for Indian hospitals with real-time queue tracking via mobile.

---

**Generated:** 2025-10-26
**Auditor:** Claude (CuraFlow Display System Analysis)
