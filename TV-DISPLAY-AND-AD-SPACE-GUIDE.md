# TV Display & Ad Space Complete Guide

## What This Document Covers

1. **TV/Live Display Layout** - What appears on the waiting room TV screen
2. **Ad Space Functionality** - How ads work, dimensions, modes
3. **Image & Video Support** - Any dimension photo/video handling
4. **Layout Modes** - Sidebar, Fullscreen, Split modes

---

## 📺 TV Display Layout (General/Common Display)

### Full Screen View (WITHOUT Ads):

```
┌──────────────────────────────────────────────────────────────────────┐
│  🖥️ LARGE TV SCREEN (1920x1080 or larger)                           │
│                                                                      │
│  ╔══════════════════════════════════════════════════════════════╗  │
│  ║  HEADER                                                      ║  │
│  ║  ┌───────┐  YOUR HOSPITAL NAME - LIVE QUEUE        10:30 AM ║  │
│  ║  │ Logo  │                                    Friday, Oct 25 ║  │
│  ║  └───────┘                                                   ║  │
│  ╚══════════════════════════════════════════════════════════════╝  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Dr. Gautham                                 │ │
│  │                 General Physician                              │ │
│  │                   ● Available                                  │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │           NOW SERVING                                    │ │ │
│  │  │                                                          │ │ │
│  │  │              #42                                         │ │ │
│  │  │           (HUGE FONT)                                    │ │ │
│  │  │                                                          │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │              NEXT                                        │ │ │
│  │  │                                                          │ │ │
│  │  │              #43                                         │ │ │
│  │  │                                                          │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │            WAITING                                       │ │ │
│  │  │                                                          │ │ │
│  │  │   #44   #45   #46   #47   #48   #49   #50              │ │ │
│  │  │                                                          │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📺 TV Display Layout (WITH Ads - Sidebar Mode):

```
┌──────────────────────────────────────────────────────────────────────┐
│  🖥️ LARGE TV SCREEN (1920x1080)                                     │
│                                                                      │
│  ╔══════════════════════════════════════════════════════════════╗  │
│  ║  HEADER - YOUR HOSPITAL NAME - LIVE QUEUE        10:30 AM   ║  │
│  ╚══════════════════════════════════════════════════════════════╝  │
│                                                                      │
│  ┌──────────────────────────────┬─────────────────────────────────┐ │
│  │ QUEUE DISPLAY (75% width)    │  AD SPACE (25% width)          │ │
│  │                              │                                 │ │
│  │  Dr. Gautham                 │  ┌───────────────────────────┐ │ │
│  │  General Physician           │  │                           │ │ │
│  │  ● Available                 │  │                           │ │ │
│  │                              │  │                           │ │ │
│  │  ┌────────────────────────┐  │  │     ADVERTISEMENT         │ │ │
│  │  │   NOW SERVING          │  │  │                           │ │ │
│  │  │                        │  │  │   (Photo or Video)        │ │ │
│  │  │      #42               │  │  │                           │ │ │
│  │  │                        │  │  │   ANY DIMENSION           │ │ │
│  │  └────────────────────────┘  │  │   AUTO-FITTED             │ │ │
│  │                              │  │                           │ │ │
│  │  ┌────────────────────────┐  │  │                           │ │ │
│  │  │       NEXT             │  │  │                           │ │ │
│  │  │       #43              │  │  │                           │ │ │
│  │  └────────────────────────┘  │  │                           │ │ │
│  │                              │  │                           │ │ │
│  │  ┌────────────────────────┐  │  │                           │ │ │
│  │  │      WAITING           │  │  │                           │ │ │
│  │  │  #44 #45 #46 #47 #48  │  │  └───────────────────────────┘ │ │
│  │  └────────────────────────┘  │                                 │ │
│  │                              │  Ad 1/5 (Counter)               │ │
│  │                              │  Progress Indicators            │ │
│  └──────────────────────────────┴─────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🎬 Ad Space - Detailed Analysis

### ✅ YES - Supports ANY Dimension Photo or Video!

**Key Feature:** `object-fit: cover`

```css
Images and Videos use:
  width: 100%
  height: 100%
  object-fit: cover
```

**What This Means:**
- ✅ **Any aspect ratio** works (square, portrait, landscape, ultra-wide, etc.)
- ✅ **Any resolution** works (low-res to 4K+)
- ✅ **Auto-fits** the container
- ✅ **Maintains aspect ratio** (no stretching/distortion)
- ✅ **Crops intelligently** (centers image/video)
- ✅ **Always fills space** (no empty areas)

---

## 📐 Image Dimension Examples

### All These Work Perfectly:

#### 1. **Square Images**
```
Dimensions: 1080x1080, 800x800, 1000x1000
Aspect Ratio: 1:1
Result: ✅ Fits perfectly, centers, crops if needed
```

#### 2. **Portrait Images** (Vertical)
```
Dimensions: 1080x1920 (Instagram story), 720x1280
Aspect Ratio: 9:16, 2:3, 3:4
Result: ✅ Fits perfectly, fills width, crops top/bottom if needed
```

#### 3. **Landscape Images** (Horizontal)
```
Dimensions: 1920x1080 (Full HD), 1280x720 (HD)
Aspect Ratio: 16:9
Result: ✅ Fits perfectly, fills height, crops left/right if needed
```

#### 4. **Ultra-Wide Images**
```
Dimensions: 2560x1080, 3440x1440
Aspect Ratio: 21:9, 32:9
Result: ✅ Fits perfectly, fills height, crops sides
```

#### 5. **Ultra-Tall Images** (Social Media)
```
Dimensions: 1080x1350 (Instagram post), 1080x1920 (Story)
Aspect Ratio: 4:5, 9:16
Result: ✅ Fits perfectly, fills width, crops top/bottom
```

#### 6. **Odd Dimensions**
```
Dimensions: 500x800, 1200x900, 640x480
Aspect Ratio: Any
Result: ✅ All work! Auto-fits with intelligent cropping
```

---

## 🎥 Video Support

### Supported Video Formats:

```
✅ MP4 (H.264)        - Most common, best compatibility
✅ WebM               - Modern, efficient
✅ OGG                - Open format
✅ MOV (if browser supports)
```

### Video Dimensions - All Work:

```
✅ Vertical Videos   - 1080x1920 (TikTok/Reels/Stories)
✅ Square Videos     - 1080x1080 (Instagram)
✅ Landscape Videos  - 1920x1080 (YouTube standard)
✅ 4K Videos         - 3840x2160
✅ HD Videos         - 1280x720
✅ Any custom size   - All auto-fit!
```

### Video Features:

```typescript
<video
    src={currentResource.url}
    muted              ✅ Auto-mutes (important for public display)
    playsInline        ✅ Plays inline on mobile browsers
    autoPlay           ✅ Starts automatically
    loop               ✅ Repeats infinitely
    className="w-full h-full object-cover"  ✅ Fits any dimension
/>
```

**Video Behavior:**
- ✅ Plays automatically
- ✅ Muted (no sound on TV - better for hospital)
- ✅ Loops continuously
- ✅ No controls shown (clean display)
- ✅ Fits container perfectly

---

## 🎨 How `object-fit: cover` Works

### Visual Explanation:

**Scenario 1: Portrait Image (1080x1920) in Landscape Container**

```
Original Image:        Container:              Result:
┌──────┐              ┌────────────────┐      ┌────────────────┐
│      │              │                │      │xxxxxxxxxxxxxxxx│
│      │              │                │      │xxxxxxxxxxxxxxxx│
│ IMG  │     →        │   Container    │  →   │     IMAGE      │
│      │              │                │      │xxxxFITS HERExx│
│      │              │                │      │xxxxxxxxxxxxxxxx│
│      │              └────────────────┘      │xxxxxxxxxxxxxxxx│
└──────┘                                      └────────────────┘

Crops top/bottom, fills width perfectly
```

**Scenario 2: Landscape Image (1920x1080) in Portrait Container**

```
Original Image:                 Container:       Result:
┌──────────────────────┐        ┌──────┐        ┌──────┐
│                      │        │      │        │xxxxxx│
│       IMAGE          │   →    │      │   →    │IMAGE │
│                      │        │ Con  │        │FITS  │
└──────────────────────┘        │tainer│        │HERE  │
                                │      │        │xxxxxx│
                                └──────┘        └──────┘

Crops left/right, fills height perfectly
```

**Scenario 3: Square Image (1000x1000) in Any Container**

```
Original Image:        Container:              Result:
┌─────────┐           ┌────────────────┐      ┌────────────────┐
│         │           │                │      │xxxx┌─────┐xxxxx│
│  IMAGE  │    →      │   Container    │  →   │xxxx│IMAGE│xxxxx│
│         │           │                │      │xxxx└─────┘xxxxx│
└─────────┘           └────────────────┘      └────────────────┘

Centers and fills container, crops as needed
```

**Key Point:** NO DISTORTION - always maintains original aspect ratio!

---

## 🎯 Three Ad Display Modes

### Mode 1: **Sidebar** (Default)

```
Queue: 75% width  |  Ads: 25% width
──────────────────┼──────────────────
NOW SERVING: #42  │   ┌──────────┐
NEXT: #43         │   │          │
WAITING: #44-#50  │   │   AD     │
                  │   │          │
                  │   │ (Vertical│
                  │   │  Reels   │
                  │   │  Style)  │
                  │   │          │
                  │   └──────────┘
```

**Best For:**
- ✅ Vertical images (portrait orientation)
- ✅ Social media content (Instagram stories, TikTok)
- ✅ Phone screenshots
- ✅ Tall banners

**Container Dimensions:** Approximately 480px wide × 900px tall (on 1920x1080 screen)

---

### Mode 2: **Fullscreen** (Button to toggle)

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│                                      │
│                                      │
│             ADVERTISEMENT            │
│            (Full Screen)             │
│                                      │
│                                      │
│                                      │
│                                      │
└──────────────────────────────────────┘

Queue display hidden
```

**Best For:**
- ✅ Horizontal/landscape images (16:9, 21:9)
- ✅ Promotional videos
- ✅ Wide banners
- ✅ Product showcases
- ✅ Hospital announcements

**Container Dimensions:** Full screen (entire viewport)

**Note:** This mode hides the queue - not recommended during active hours!

---

### Mode 3: **Split** (Button to toggle)

```
Queue: 50% width  |  Ads: 50% width
──────────────────┼──────────────────
NOW SERVING: #42  │   ┌──────────┐
                  │   │          │
NEXT: #43         │   │          │
                  │   │   AD     │
WAITING:          │   │          │
#44 #45 #46       │   │ (Square  │
#47 #48 #49       │   │  or any  │
                  │   │  ratio)  │
                  │   │          │
                  │   └──────────┘
```

**Best For:**
- ✅ Square images (1:1 ratio)
- ✅ Balanced layout
- ✅ Both queue and ads get equal importance

**Container Dimensions:** Approximately 960px wide × 900px tall (on 1920x1080 screen)

---

## 🔄 Ad Carousel Features

### Auto-Rotation

```
Timeline:
0:00 → Ad 1 (Hospital Services)
0:04 → Ad 2 (Health Insurance)
0:08 → Ad 3 (Pharmacy Discount)
0:12 → Ad 4 (Lab Tests)
0:16 → Ad 5 (Doctor Consultation)
0:20 → Back to Ad 1 (loops forever)
```

**Rotation Speed:** Every **4 seconds**

**Total Cycle Time:** 4 seconds × number of ads

**Example:**
- 5 ads = 20 seconds total cycle
- 10 ads = 40 seconds total cycle
- Loops infinitely

---

### Visual Indicators

#### 1. **Progress Bars** (Vertical)

```
Right side of ad space:
┌─┐
│█│ ← Current ad (white, highlighted)
├─┤
│░│ ← Next ad (gray, dimmed)
├─┤
│░│
├─┤
│░│
├─┤
│░│
└─┘
```

**Purpose:** Shows which ad is currently displayed

---

#### 2. **Counter Badge**

```
Top-left corner:
┌──────────┐
│  2 / 5   │ ← "Ad 2 of 5 total"
└──────────┘
```

**Purpose:** Shows position in ad sequence

---

#### 3. **Title Overlay**

```
Bottom of ad (gradient overlay):
╔═══════════════════════════════╗
║                               ║
║  Title: "20% Off Lab Tests"   ║
║  Duration: 30 seconds          ║
╚═══════════════════════════════╝
```

**Purpose:** Shows ad title and duration setting

---

## 📊 Complete Ad Configuration

### In Database (ad_resources table):

```sql
CREATE TABLE ad_resources (
    id UUID PRIMARY KEY,
    clinic_id UUID NOT NULL,
    title TEXT NOT NULL,                    -- "Lab Test Discount"
    type TEXT NOT NULL,                      -- 'image' or 'video'
    url TEXT NOT NULL,                       -- Full URL to image/video
    duration INTEGER NOT NULL DEFAULT 30,    -- Display duration (unused currently)
    display_order INTEGER DEFAULT 0,         -- Order in carousel
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Example Ad Records:

```javascript
{
  id: "uuid-1",
  title: "Hospital Services",
  type: "image",
  url: "https://your-cdn.com/images/services-poster.jpg",  // ANY dimension!
  duration: 30,
  display_order: 1
}

{
  id: "uuid-2",
  title: "Health Check Packages",
  type: "video",
  url: "https://your-cdn.com/videos/health-check.mp4",  // ANY dimension!
  duration: 30,
  display_order: 2
}
```

---

## 🎨 Dimension Compatibility Chart

| Media Type | Dimension Example | Aspect Ratio | Status | Notes |
|------------|------------------|--------------|--------|-------|
| **Images** |
| Social Media | 1080x1080 | 1:1 | ✅ Perfect | Square, centers well |
| Instagram Story | 1080x1920 | 9:16 | ✅ Perfect | Portrait, ideal for sidebar |
| Instagram Post | 1080x1350 | 4:5 | ✅ Perfect | Slightly tall |
| YouTube Thumbnail | 1280x720 | 16:9 | ✅ Perfect | Landscape |
| Banner | 728x90 | 8:1 | ✅ Works | Ultra-wide, crops sides |
| Print Poster | 11x17 inches | Custom | ✅ Works | Any ratio works |
| Phone Screenshot | 1170x2532 | 9:19.5 | ✅ Perfect | iPhone size |
| **Videos** |
| TikTok/Reels | 1080x1920 | 9:16 | ✅ Perfect | Vertical video |
| YouTube | 1920x1080 | 16:9 | ✅ Perfect | Standard video |
| YouTube Shorts | 1080x1920 | 9:16 | ✅ Perfect | Vertical |
| 4K Video | 3840x2160 | 16:9 | ✅ Perfect | High quality |
| Square Video | 1080x1080 | 1:1 | ✅ Perfect | Instagram style |

**Bottom Line:** ✅ **ALL DIMENSIONS WORK PERFECTLY!**

---

## 🎯 TV Display Features Summary

### What TV Display Shows:

1. **Header Bar:**
   - Hospital logo (CuraFlow icon)
   - Hospital name (customizable)
   - Current time (10:30 AM)
   - Current date (Friday, October 25)

2. **Doctor Card:**
   - Doctor name (Dr. Gautham)
   - Specialty (General Physician)
   - Status badge (● Available / ● Unavailable)

3. **NOW SERVING Section:**
   - Current patient token number
   - HUGE font (text-5xl, ~60px)
   - Green background when active
   - Shows "DOCTOR UNAVAILABLE" if doctor not available

4. **NEXT Section:**
   - Next patient to be called
   - Large font (text-3xl, ~36px)
   - Blue background
   - Shows "NO QUEUE" if no patients waiting

5. **WAITING Section:**
   - All waiting patient tokens
   - Badge style display (#44, #45, #46, etc.)
   - Wraps to multiple lines if many patients
   - Shows "Queue is empty" if no one waiting

---

## 🔄 Updates & Refresh

### Auto-Refresh Rate:

```
TV Display: Every 30 seconds
Ads: Every 4 seconds (auto-rotate)
Clock: Every second (real-time)
```

### What Updates:

- ✅ NOW SERVING token
- ✅ NEXT token
- ✅ WAITING list
- ✅ Doctor status
- ✅ Current time
- ✅ Ad rotation

---

## 🎨 Session Filtering on TV

### CRITICAL: Only Shows Current Session

**Time: 10:30 AM** (Morning Session)

**TV Shows:**
```
Dr. Gautham - Morning Session
━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOW SERVING: #1  (Morning patient)
NEXT: #2         (Morning patient)
WAITING: #2      (Morning patient - Rithesh)
```

**Does NOT Show:**
- ❌ Afternoon patients (#1, #2, #3, #4)
- ❌ Evening patients (#1, #1, #1)

**Shows ONLY:**
- ✅ Morning session patients

**Same filtering works for all sessions!**

---

## 🖥️ Multiple Doctor Support

### If Multiple Doctors Available:

```
Cycle Time: 15 seconds per doctor

0:00 → Shows Dr. Gautham's queue
0:15 → Shows Dr. Sharma's queue
0:30 → Shows Dr. Patel's queue
0:45 → Back to Dr. Gautham
... loops forever
```

**Each doctor gets:**
- 15 seconds display time
- Their own queue (NOW/NEXT/WAITING)
- Session filtered (only current session)

---

## 📱 URL Parameters for TV Display

### Basic TV Display:

```
URL: https://yourapp.com/display

Shows: All available doctors
Ads: Hidden (unless enabled)
Updates: Every 30 seconds
```

### TV Display with Specific Doctors:

```
URL: https://yourapp.com/display?doctorIds=uuid1,uuid2,uuid3

Shows: Only specified doctors (cycles between them)
Ads: Hidden
Updates: Every 30 seconds
```

### TV Display with Ads:

```
URL: https://yourapp.com/display?ads=true

Shows: Queue on left (75%), ads on right (25%)
Ad Mode: Sidebar (default)
Ad Rotation: Every 4 seconds
Updates: Every 30 seconds
```

### TV Display with Specific Doctors + Ads:

```
URL: https://yourapp.com/display?doctorIds=uuid1,uuid2&ads=true

Shows: Specified doctors + ads
Ad Mode: Sidebar
Cycles doctors: Every 15 seconds
Ad Rotation: Every 4 seconds
```

---

## 🎯 Ad Space Technical Details

### Container Styling:

```css
.ad-container {
  width: 25%;              /* Sidebar mode */
  height: 100%;            /* Full height minus header */
  overflow: hidden;        /* Prevents image overflow */
  border-radius: 0.5rem;   /* Rounded corners */
  box-shadow: large;       /* Nice shadow */
  background: black;       /* Black background */
  position: relative;      /* For absolute positioned overlays */
}
```

### Image/Video Styling:

```css
img, video {
  width: 100%;
  height: 100%;
  object-fit: cover;       /* KEY: Fits any dimension! */
  object-position: center; /* Centers the content */
}
```

**What `object-fit: cover` Does:**

1. **Maintains Aspect Ratio** - Never stretches or distorts
2. **Fills Container** - Always fills 100% width and 100% height
3. **Crops Intelligently** - Centers content and crops edges if needed
4. **Works with Any Dimension** - Portrait, landscape, square, ultra-wide, ultra-tall

---

## ✅ Summary: Ad Space Capabilities

### Questions Answered:

**Q: Can it display any dimension photo?**
**A: ✅ YES** - Any aspect ratio, any resolution, any dimension

**Q: Can it display any dimension video?**
**A: ✅ YES** - Vertical, horizontal, square, 4K, HD, any custom size

**Q: Will images/videos look distorted?**
**A: ❌ NO** - Always maintains original aspect ratio

**Q: What happens to images that don't match container size?**
**A: Auto-crops intelligently** - Centers content, crops edges to fill space

**Q: What if image is too small?**
**A: Scales up** - Fills container, may look pixelated if very low-res

**Q: What if image is HUGE (like 8000x6000)?**
**A: Scales down** - Browser handles it, looks perfect

**Q: Do I need to resize images before uploading?**
**A: ❌ NO** - Upload any size, any dimension, system handles it

**Q: What about different screen sizes?**
**A: Responsive** - Works on any TV size (720p, 1080p, 4K, etc.)

---

## 🎨 Best Practices for Ads

### For Sidebar Mode (Portrait Container):

✅ **Recommended:**
- Vertical images (9:16, 4:5 ratios)
- Social media content
- Phone screenshots
- Tall posters

❌ **Not Ideal:**
- Ultra-wide images (will crop a lot)
- Horizontal videos (will crop top/bottom)

### For Fullscreen Mode (Landscape Container):

✅ **Recommended:**
- Horizontal images (16:9, 21:9 ratios)
- Landscape videos
- Wide banners
- TV-style content

❌ **Not Ideal:**
- Vertical videos (will crop sides)
- Portrait images (will crop a lot)

### For Split Mode (Square-ish Container):

✅ **Recommended:**
- Square images (1:1 ratio)
- Slightly rectangular (4:3, 3:2)
- Balanced content

✅ **Works for Everything:**
- Any dimension works, but square looks best

---

## 🚀 Production Ready Features

### TV Display:

- ✅ Multi-doctor support
- ✅ Session filtering
- ✅ Real-time updates (30s)
- ✅ Clean, professional layout
- ✅ Large, readable fonts
- ✅ Color-coded sections

### Ad Space:

- ✅ Any dimension support
- ✅ Auto-rotation (4s)
- ✅ 3 display modes
- ✅ Progress indicators
- ✅ Title overlays
- ✅ Video support with auto-play
- ✅ Muted videos (hospital-appropriate)
- ✅ Infinite loop

---

**BOTTOM LINE:**

1. **TV Display:** Shows queue beautifully with session filtering ✅
2. **Ad Space:** Supports **ANY dimension** photo or video ✅
3. **object-fit: cover** handles all resizing perfectly ✅
4. **No image preparation needed** - upload and go! ✅
