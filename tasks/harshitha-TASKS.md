# harshitha — Your Tasks (Simple Version)

You build the **backbone** of the project. Everyone else depends on your work. Start with Task 1 first.

---

## TASK 1: Database (DO THIS FIRST)

### What
Create all the tables in Supabase that store everything — screens, users, ads, media, etc.

### How
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Create a new migration file: `supabase/migrations/001_initial_schema.sql`
4. Copy-paste the SQL below and run it

### SQL to run

```sql
-- USERS TABLE (who uses the system)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID,
  role TEXT NOT NULL CHECK (role IN ('admin', 'franchise', 'advertiser', 'readonly')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORGANIZATIONS TABLE (companies/franchises)
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('admin', 'franchise')),
  slug TEXT UNIQUE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  logo_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix: add foreign key after both tables exist
ALTER TABLE users ADD CONSTRAINT users_org_fk 
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE;

-- SCREENS TABLE (the TVs in buses/autos)
CREATE TABLE screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id TEXT UNIQUE NOT NULL,
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'New Screen',
  screen_type TEXT NOT NULL CHECK (screen_type IN ('landscape', 'portrait')),
  device_type TEXT NOT NULL CHECK (device_type IN ('bus', 'auto', 'other')),
  vehicle_number TEXT,
  internet_type TEXT CHECK (internet_type IN ('sim', 'wifi')),
  internet_provider TEXT,
  sim_number TEXT,
  pairing_code TEXT,
  pairing_expires_at TIMESTAMPTZ,
  paired_at TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  is_online BOOLEAN DEFAULT FALSE,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCREEN LOCATIONS (GPS history)
CREATE TABLE screen_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDIA TABLE (images, videos, live links)
CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'live_url')),
  orientation TEXT CHECK (orientation IN ('landscape', 'portrait')),
  storage_path TEXT,
  live_url TEXT,
  thumbnail_path TEXT,
  duration_ms INTEGER,
  size_bytes INTEGER,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAYLISTS (groups of videos)
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAYLIST ITEMS (videos inside a playlist)
CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 10000,
  play_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADS (advertisements)
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  name TEXT NOT NULL,
  media_item_id UUID REFERENCES media_items(id),
  playlist_id UUID REFERENCES playlists(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  screen_ids UUID[],
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AD PLAY LOGS (when ads actually played)
CREATE TABLE ad_play_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
  screen_id UUID REFERENCES screens(id) ON DELETE SET NULL,
  media_item_id UUID REFERENCES media_items(id) ON DELETE SET NULL,
  advertiser_id UUID REFERENCES users(id),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_ms INTEGER
);

-- SCREEN SAVER (what shows when no ad is playing)
CREATE TABLE screen_saver (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id),
  timeout_seconds INTEGER DEFAULT 300,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### After running SQL
1. Create TypeScript types file: `lib/types/database.ts`
2. Create a storage bucket called `media` (public) in Supabase Storage
3. Create a storage bucket called `logos` (public)
4. Create a storage bucket called `thumbnails` (public)

### Check if it worked
- All tables should appear in Supabase Table Editor
- You should be able to insert a test row into `screens`

---

## TASK 2: Screen Management

### What
Pages to add screens, see them in a list, and pair physical devices.

### Files to create

#### `app/(app)/screens/page.tsx`
Screen list page. Shows all screens in a table.

**What it shows:**
- Green dot = online, Red dot = offline
- Screen name
- Unique ID (like SCR-04821) — click to copy
- Bus/Auto number
- Device type (Bus/Auto)
- Screen type (Landscape/Portrait)
- Last seen time
- "Add Screen" button at top

**How to build:**
1. Read the existing file at `app/(app)/overview/page.tsx` to understand the layout style
2. Create new file `app/(app)/screens/page.tsx`
3. Fetch screens from Supabase: `supabase.from("screens").select("*")`
4. Display in a table using the same style as other pages

#### `app/(app)/screens/[id]/page.tsx`
Screen detail page. Shows one screen's full info.

**What it shows:**
- Screen name and status
- All info: unique ID, device type, screen type, vehicle number, internet info
- GPS history: list of recent locations with timestamps
- "Delete" button

#### `components/screens/pairing-modal.tsx`
Modal that appears when you click "Add Screen".

**Steps:**
1. User fills in: name, landscape/portrait, bus/auto, vehicle number, SIM/WiFi
2. Clicks "Generate Code"
3. Code appears on screen (6 digits, big text)
4. Code expires in 10 minutes
5. When physical screen enters the code → screen is registered

#### `app/api/screens/pair/route.ts`
API that generates pairing codes.

**What it does:**
1. Receives screen details from the form
2. Generates a unique screen ID (SCR-XXXXX)
3. Generates a 6-digit pairing code
4. Saves to database
5. Returns the code

#### `app/api/screens/heartbeat/route.ts`
API that screens call every 30 seconds.

**What it does:**
1. Receives: screen_id, lat, lng
2. Updates screen: last_seen = now, is_online = true, lat, lng
3. Saves location to screen_locations table
4. Returns ok

---

## TASK 3: Ad System

### What
Pages to create ads, see them, and approve/reject them.

### Files to create

#### `app/(app)/ads/page.tsx`
Ad list page. Shows all ads.

**What it shows:**
- Tabs: All | Pending | Approved | Rejected
- Each ad shows: name, status badge, who created it, date
- "Create Ad" button
- If logged in as advertiser → only shows THEIR ads

#### `app/(app)/ads/create/page.tsx`
Create ad form.

**Form fields:**
- Ad name
- Pick content: choose a media file OR a playlist
- Pick screens: which screens should play this ad
- Start date and end date
- Submit → ad goes to "pending" status

#### `app/(app)/ads/approve/page.tsx`
Admin-only page to approve/reject ads.

**What it shows:**
- List of pending ads
- Each ad: name, who created it, what content, which screens
- "Approve" button (green)
- "Reject" button (red) — asks for reason

#### `app/api/ads/approve/route.ts`
API to approve or reject ads.

**What it does:**
1. Receives: ad_id, action (approve/reject), reason (if reject)
2. Updates the ad status
3. If approve: sets approved_by and approved_at

---

## TASK 4: Player App (What Runs on the TV)

### What
The web page that opens on the physical screen in the bus/auto. It plays the ads.

### Files to create

#### `app/player/[token]/page.tsx`
Main player page.

**What it does:**
1. Opens on the TV screen
2. Checks if screen is paired (localStorage)
3. If not paired → shows pairing code entry
4. If paired → starts playing ads

#### `components/player/pairing-screen.tsx`
Big 6-digit code entry screen.

**What it shows:**
- Dark background
- Big numbers for entering the code
- "Pair" button
- After pairing → saves screen_id to localStorage

#### `components/player/playback-engine.tsx`
Plays the ads.

**What it does:**
1. Fetches current ad from API
2. If image → shows it for the duration
3. If video → plays it
4. When done → moves to next ad
5. Loops forever

#### `components/player/gps-heartbeat.tsx`
Sends location every 30 seconds.

**What it does:**
1. Gets device GPS location
2. Sends to `/api/screens/heartbeat`
3. Repeats every 30 seconds

#### `app/api/screens/[id]/schedule/route.ts`
API that returns what ad to play right now.

**What it does:**
1. Finds the screen
2. Checks which approved ads target this screen
3. Returns the current ad and its content

---

## Test Checklist

After each task, check:

- [ ] Task 1: All tables exist in Supabase
- [ ] Task 2: Can add a screen, see it in list, generate pairing code
- [ ] Task 3: Can create an ad, see it pending, approve it
- [ ] Task 4: Player shows on TV, pairs, plays content

---

## Git Rules

```bash
# Switch to your branch
git checkout harshitha

# Save your work
git add .
git commit -m "describe what you did"
git push origin harshitha
```

NEVER push to master. Only push to your branch.
