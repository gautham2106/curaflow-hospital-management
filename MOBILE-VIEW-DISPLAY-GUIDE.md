# Mobile View Display Guide

## What Patients See When They Scan QR Code or Click WhatsApp Link

This document shows exactly what appears on the mobile screen when a patient scans their token QR code or clicks the WhatsApp tracking link.

---

## 📱 Mobile Display Layout

### Full Screen View:

```
┌─────────────────────────────────────┐
│  📱 MOBILE PHONE SCREEN             │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     Dr. Gautham                │ │
│  │     General Physician          │ │
│  │     ● Available                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Morning Session               │ │
│  │  09:00 - 13:00                 │ │
│  │                Current Time    │ │
│  │                10:30 AM        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │      NOW SERVING               │ │
│  │                                │ │
│  │         #40                    │ │
│  │                                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │         NEXT                   │ │
│  │                                │ │
│  │         #41                    │ │
│  │                                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │        WAITING                 │ │
│  │                                │ │
│  │  #42  #43  #44  #45  #46      │ │
│  │  ^^^^                          │ │
│  │  YOUR TOKEN (Blue, Pulsing)    │ │
│  │                                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     Current Time               │ │
│  │       10:30 AM                 │ │
│  │  Friday, Oct 25                │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 Detailed Component Breakdown

### 1. **Doctor Header Card** (White background)

```
┌─────────────────────────────┐
│    Dr. Gautham              │
│    General Physician        │
│    ● Available              │  ← Green badge
└─────────────────────────────┘
```

**Shows:**
- Doctor's name
- Doctor's specialty
- Doctor's status (Available = Green, Unavailable = Red)

---

### 2. **Session Info Card** (Light blue background)

```
┌─────────────────────────────┐
│  Morning Session            │  Current Time
│  09:00 - 13:00              │  10:30 AM
└─────────────────────────────┘
```

**Shows:**
- Current session name (Morning/Afternoon/Evening)
- Session time range (e.g., 09:00 - 13:00)
- Current time (right side)

**Color:** Light blue background with blue text

---

### 3. **NOW SERVING Card** (White background)

```
┌─────────────────────────────┐
│      NOW SERVING            │
│                             │
│         #40                 │  ← Large font
│                             │
└─────────────────────────────┘
```

**Shows:**
- Currently being served patient token number
- Displays in **HUGE font** (text-6xl)
- If it's YOUR token: **GREEN color + pulsing animation** ✨
- If empty: Shows "---"
- If doctor unavailable: Shows "DOCTOR UNAVAILABLE" in red

**Special Effect:**
- If the patient's token (#42) becomes "NOW SERVING", it turns **green** and **pulses**

---

### 4. **NEXT Card** (White background)

```
┌─────────────────────────────┐
│         NEXT                │
│                             │
│         #41                 │  ← Medium-large font
│                             │
└─────────────────────────────┘
```

**Shows:**
- Next patient to be called
- Medium-large font (text-4xl)
- If it's YOUR token: **BLUE color + pulsing animation** ✨
- If empty: Shows "---"

---

### 5. **WAITING Card** (White background)

```
┌─────────────────────────────┐
│        WAITING              │
│                             │
│  #42  #43  #44  #45  #46   │
│  ^^^^                       │
│  Blue badge, pulsing        │
│  (Your token)               │
│                             │
└─────────────────────────────┘
```

**Shows:**
- All waiting patient tokens
- Displayed as badges/pills
- YOUR token: **Blue background, white text, PULSING** ✨
- Other tokens: White background with outline
- If queue empty: Shows "Queue is empty"

**Special Visual:**
- Your token (#42): Large blue badge with white text, animated pulse
- Other tokens: Outlined badges

---

### 6. **Current Time Card** (White background)

```
┌─────────────────────────────┐
│     Current Time            │
│       10:30 AM              │  ← Large bold
│  Friday, Oct 25             │  ← Small gray
└─────────────────────────────┘
```

**Shows:**
- Current time in 12-hour format
- Current date with day name

---

## 🎯 Real Examples Based on Your Data

### Example 1: Patient with Token #2 (Morning Session)

**Scenario:** Sivakumar has token #2 for Morning session. Currently token #1 is being served.

```
📱 MOBILE SCREEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────┐
│    Dr. Gautham              │
│    General Physician        │
│    ● Available              │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Morning Session            │  Current Time
│  09:00 - 13:00              │  10:30 AM
└─────────────────────────────┘

┌─────────────────────────────┐
│      NOW SERVING            │
│                             │
│         #1                  │
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│         NEXT                │
│                             │
│         #2                  │  ← BLUE + PULSING
│                             │     (This is Sivakumar!)
└─────────────────────────────┘

┌─────────────────────────────┐
│        WAITING              │
│                             │
│  #2 (Rithesh)               │  ← Regular badge
│                             │
└─────────────────────────────┘
```

**What Sivakumar sees:**
- NOW SERVING: #1 (harish is currently with doctor)
- NEXT: **#2 in BLUE and PULSING** ← "I'm next!"
- WAITING: Other #2 token (Rithesh)

---

### Example 2: Patient with Token #1 (Evening Session)

**Scenario:** Patient with token #1 for Evening session. Session hasn't started yet. Current time is 3:00 PM.

```
📱 MOBILE SCREEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────┐
│    Session Not Started      │
│                             │
│    ⏰ Evening Session       │
│    Starts at 6:00 PM        │
│                             │
│    Your Token: #1           │
│                             │
│    Please arrive by:        │
│    5:45 PM                  │
│                             │
└─────────────────────────────┘
```

**Shows:** Pre-session screen with:
- Session start time
- Patient's token number
- Suggested arrival time

---

### Example 3: Patient with Token #42 in Waiting List

**Scenario:** Patient #42 is waiting. #40 is being served, #41 is next.

```
📱 MOBILE SCREEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────┐
│    Dr. Gautham              │
│    General Physician        │
│    ● Available              │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Morning Session            │  Current Time
│  09:00 - 13:00              │  10:45 AM
└─────────────────────────────┘

┌─────────────────────────────┐
│      NOW SERVING            │
│                             │
│         #40                 │
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│         NEXT                │
│                             │
│         #41                 │
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│        WAITING              │
│                             │
│  #42  #43  #44  #45  #46   │
│  ^^^^                       │
│  BLUE BADGE, PULSING!       │
│  (You are here)             │
│                             │
│  Position: 2 patients ahead │
│                             │
└─────────────────────────────┘
```

**What Patient sees:**
- NOW SERVING: #40
- NEXT: #41
- WAITING: **#42 is highlighted in BLUE with pulsing animation** ← "That's me!"
- Can easily see 2 patients are ahead

---

## 🎨 Visual Styling Details

### Color Scheme:

1. **Background:** Gradient from gray-50 to blue-50
2. **Cards:** White background with shadows
3. **Session Info Card:** Light blue background (bg-blue-50)

### Token Highlighting Colors:

```
NOW SERVING (if your token):
  Color: GREEN (text-green-600)
  Effect: PULSING animation
  Size: HUGE (text-6xl, about 72px)

NEXT (if your token):
  Color: BLUE (text-blue-600)
  Effect: PULSING animation
  Size: LARGE (text-4xl, about 48px)

WAITING (if your token):
  Background: BLUE (bg-blue-600)
  Text: WHITE
  Effect: PULSING animation
  Size: MEDIUM (text-lg)

Other tokens:
  Background: WHITE
  Border: GRAY outline
  Text: DARK GRAY
  Effect: None
  Size: MEDIUM (text-lg)
```

### Animations:

**Pulsing Effect:**
```css
animate-pulse
/* Makes the token gently pulse in and out */
/* Opacity: 100% → 50% → 100% */
/* Duration: 2 seconds, repeats infinitely */
```

---

## 🔄 Real-Time Updates

### Update Frequency: **Every 5 seconds**

```
Time 0:00 → Queue loads
Time 0:05 → Refresh #1
Time 0:10 → Refresh #2
Time 0:15 → Refresh #3
...
```

**What Updates:**
- NOW SERVING token
- NEXT token
- WAITING list
- Current time
- Doctor status

**How it feels:**
- Very responsive
- Almost real-time
- Patient sees changes quickly
- Maximum wait for update: 5 seconds

---

## 📊 Session Filtering

### Critical Feature: Only Shows Current Session

**Example:**

Patient has **Evening session** token #1.

**Current time: 10:00 AM (Morning)**

```
Mobile view shows:
❌ Does NOT show any Morning session patients
❌ Does NOT show any Afternoon session patients
✅ Shows ONLY Evening session patients:
   - Token #1 (divi)
   - Token #1 (divi - another one)
   - Token #1 (G)
```

**This means:**
- Patient doesn't get confused by other sessions
- Sees only relevant queue
- Accurate position in queue
- No information overload

---

## 🎯 Key Features for Patients

### 1. **Instant Token Identification**
- Your token JUMPS OUT visually
- Blue color + pulsing animation
- Can't miss it

### 2. **Position Awareness**
```
NOW SERVING: #40  ← Doctor is with this patient
NEXT: #41         ← This patient should get ready
WAITING: #42 ← YOU ARE HERE (2 ahead of you)
         #43
         #44
```

### 3. **Time Management**
- See current time
- Know session time range
- Can estimate wait time

### 4. **Doctor Status**
- Green badge = Available
- Red badge = Unavailable/On break

### 5. **Session Clarity**
- Shows which session (Morning/Afternoon/Evening)
- Shows session time range
- Filters out other sessions

---

## 📱 Mobile Responsiveness

### Screen Size Adaptation:

**Small phones (320px):**
- Stacked layout
- Single column
- Large touch targets

**Medium phones (375px - 428px):**
- Optimized spacing
- Readable fonts
- Clear badges

**Tablets:**
- Same layout as phones
- Better use of space
- Still mobile-optimized

---

## 🔍 Different Scenarios

### Scenario 1: Queue is Empty

```
┌─────────────────────────────┐
│      NOW SERVING            │
│                             │
│         ---                 │
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│         NEXT                │
│                             │
│         ---                 │
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│        WAITING              │
│                             │
│    Queue is empty           │
│                             │
└─────────────────────────────┘
```

### Scenario 2: Doctor Unavailable

```
┌─────────────────────────────┐
│    Dr. Gautham              │
│    General Physician        │
│    ● Unavailable            │  ← Red badge
└─────────────────────────────┘

┌─────────────────────────────┐
│      NOW SERVING            │
│                             │
│  DOCTOR UNAVAILABLE         │  ← Red text
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│         NEXT                │
│                             │
│      NO QUEUE               │  ← Red text
│                             │
└─────────────────────────────┘

┌─────────────────────────────┐
│        WAITING              │
│                             │
│  Doctor is unavailable      │
│                             │
└─────────────────────────────┘
```

### Scenario 3: Your Token is NOW SERVING

```
┌─────────────────────────────┐
│      NOW SERVING            │
│                             │
│         #42                 │  ← GREEN + PULSING
│                             │     (Your token!)
│    PLEASE PROCEED TO        │
│    CONSULTATION ROOM        │
└─────────────────────────────┘
```

**Visual Effect:**
- HUGE green number
- Intense pulsing animation
- Impossible to miss
- Clear call to action

---

## 🚀 Summary

### What Mobile View Shows:

1. ✅ **Doctor Information**
   - Name, specialty, availability status

2. ✅ **Session Information**
   - Current session name
   - Session time range
   - Current time

3. ✅ **Queue Status**
   - NOW SERVING (current patient)
   - NEXT (next patient)
   - WAITING (all waiting patients)

4. ✅ **Your Token Highlighting**
   - Blue background
   - White text
   - Pulsing animation
   - Stands out clearly

5. ✅ **Position in Queue**
   - Visual representation
   - Easy to count ahead
   - Understand wait time

6. ✅ **Real-Time Updates**
   - Every 5 seconds
   - Fresh data
   - Accurate status

7. ✅ **Session Filtering**
   - Shows only your session
   - No confusion
   - Relevant information only

---

## 📊 Complete User Experience

```
Patient Journey:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Register at reception
   → Get printed token with QR code

2. Scan QR code with phone camera
   → Opens mobile queue view

3. See current status:
   NOW SERVING: #15
   NEXT: #16
   WAITING: #17, #18, #19, #20 ← YOU (#20, blue, pulsing)

4. Sit and wait
   → Screen updates every 5 seconds

5. Watch progress:
   #15 done → #16 NOW SERVING
   #17 NEXT
   WAITING: #18, #19, #20 ← YOU (still blue, pulsing)

6. Get closer:
   #16 done → #17 NOW SERVING
   #18 NEXT
   WAITING: #19, #20 ← YOU (still blue, pulsing)

7. You're next:
   #17 done → #18 NOW SERVING
   NEXT: #20 ← YOU (BLUE + PULSING, large font!)

8. Your turn:
   NOW SERVING: #20 ← YOU (GREEN + PULSING, HUGE!)
   → Stand up and go to consultation room
```

---

**Perfect for:**
- ✅ Indian hospital waiting rooms
- ✅ Patients unfamiliar with technology
- ✅ Multiple sessions per day
- ✅ Multiple doctors
- ✅ Real-time queue tracking
- ✅ Clear visual communication

**No confusion, no missed calls, clear status at all times!**
