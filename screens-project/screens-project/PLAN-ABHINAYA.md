# 📋 Abhinaya — Implementation Plan

> **Project:** Screens Digital Signage Platform — Franchise/Advertiser Milestone  
> **Branch:** `abhinaya`  
> **Scope:** Analytics — Uptime History, Ad Play Counts, Advertiser Views, Bug Fixes  
> **Status:** ⚠️ 3/4 Tasks blocked (awaiting Ashwanth schema + Harshitha RBAC)

---

## 🔗 Dependency Chain

```
Ashwanth (Schema Foundation) ──► Abhinaya (Analytics Tasks 1, 2, 3)
Harshitha (RBAC/Routing)     ──► Abhinaya (Analytics Task 3)
                                 Abhinaya (Task 4) ◄── INDEPENDENT — can start now
```

---

## 🗂 File Map — What Exists vs What Needs to Change

| File | Status | Notes |
|------|--------|-------|
| `app/(app)/analytics/analytics-dashboard.tsx` | ✅ EXISTS | ~460 lines, full dashboard with KPI cards, charts, table |
| `app/(app)/analytics/page.tsx` | ✅ EXISTS | Server component fetching play_logs, screens, media_items |
| `app/(app)/analytics/loading.tsx` | ✅ EXISTS | Loading skeleton |
| `supabase/migrations/00001_schema.sql` | ✅ EXISTS | Base schema — no franchise/advertiser/ads tables yet |
| `lib/types/database.ts` | ✅ EXISTS | Types for current schema only |
| `app/(app)/screens/*` | ✅ EXISTS | Screen management UI (Soumya's scope) |
| `app/(advertiser)/` | ❌ DOES NOT EXIST | Needs Harshitha's RBAC routing first |
| `app/api/invite/route.ts` | ✅ EXISTS | Invite endpoint (built already) |

---

## ✅ Task 4: Fix Screen Performance Grouping — CAN START NOW (No Dependencies)

### 🔍 Problem
In `analytics-dashboard.tsx`, the `screenPerformance` memo groups by `screens?.name`:
```tsx
const name = log.screens?.name ?? "Unknown";
if (!map[name]) map[name] = { plays: 0, avgDuration: 0, count: 0 };
```
This causes screens with duplicate names to have their stats merged incorrectly.

### 🔧 Fix
Change grouping key from `name` to `id`:
```tsx
// Before
const name = log.screens?.name ?? "Unknown";
if (!map[name]) map[name] = { plays: 0, ... };

// After  
const screenId = log.screen_id;
if (!map[screenId]) map[screenId] = { 
  id: screenId, 
  name: log.screens?.name ?? "Unknown", 
  plays: 0, ... 
};
```

### 📝 Files to modify
- `app/(app)/analytics/analytics-dashboard.tsx` — fix `screenPerformance` memo & BarChart dataKey
- `app/(app)/analytics/page.tsx` — pass `id` in screen select query (already does)

**⚠️ Note on uptime label:** The current `uptimePercent` KPIs show "Currently Online %" but the task mentions labeling as "Currently Online %" to avoid implying historical data. This is already labeled as `onlineScreens / screens.length` — double-check the label matches.

---

## ⏳ Task 1: Screen Uptime/Downtime History — BLOCKED by Ashwanth

### 🔍 What's Needed
The schema currently has `screens.is_online` (boolean) but **no historical logging** of status changes. This is a boolean snapshot, not a history.

### 📋 Prerequisites (Ashwanth must provide)
1. **`screen_status_log` table** (or similar) with:
   ```sql
   CREATE TABLE screen_status_log (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
     status TEXT NOT NULL CHECK (status IN ('online', 'offline')),
     changed_at TIMESTAMPTZ DEFAULT NOW()
   );
   -- Index for fast queries per screen
   CREATE INDEX screen_status_log_screen_id_idx ON screen_status_log(screen_id);
   CREATE INDEX screen_status_log_changed_at_idx ON screen_status_log(changed_at);
   ```
2. **OR** extend the heartbeat endpoint to log status changes
3. **RLS policies** for the new table

### 🛠 Implementation Steps (once unblocked)

**Step 1: Update Database Types**
- Add `ScreenStatusLog` interface to `lib/types/database.ts`
- Add `screen_status_log` to the `Database` type export

**Step 2: Create Uptime Query (Server Component)**
- In `app/(app)/analytics/page.tsx`, add a new data fetch:
  ```tsx
  // Fetch historical uptime data
  const statusLogs = await supabase
    .from("screen_status_log")
    .select("screen_id, status, changed_at")
    .in("screen_id", screenIds)
    .order("changed_at", { ascending: true });
  ```

**Step 3: Add Uptime History to Analytics Dashboard**
- Add a new `uptimeHistory` prop to `AnalyticsDashboard`
- Create a "Uptime" tab or section with:
  - Per-screen online/offline timeline (colored bar chart)
  - Historical uptime percentage per screen
  - Overall org uptime trend over time

**Step 4: Wire into the Dashboard**
- Pass status logs from `page.tsx` → `AnalyticsDashboard`
- Add a new chart card: "Screen Uptime History"

### 📝 Files to modify
- `lib/types/database.ts` — add `ScreenStatusLog` type
- `app/(app)/analytics/page.tsx` — fetch status logs
- `app/(app)/analytics/analytics-dashboard.tsx` — add uptime history displays

---

## ⏳ Task 2: Ad Play Count Analytics — BLOCKED by Ashwanth + Srinitha

### 🔍 What's Needed
The current `play_logs` table tracks `media_item_id` but has **no concept of "ads"**. The franchise/advertiser milestone introduces an `ads` table and `ad_id` on `play_logs`.

### 📋 Prerequisites (Ashwanth must provide)
1. **`ads` table** with:
   ```sql
   CREATE TABLE ads (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
     advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
     media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
     target_franchises UUID[],  -- array of franchise_ids, or use join table
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
2. **`ad_id` column** on `play_logs`:
   ```sql
   ALTER TABLE play_logs ADD COLUMN ad_id UUID REFERENCES ads(id);
   ```
3. **RLS policies** for the ads table

### 🛠 Implementation Steps (once unblocked)

**Step 1: Update Database Types**
- Add `Ad` and `Advertiser` interfaces to `lib/types/database.ts`
- Add `ad_id` to `PlayLog` interface

**Step 2: Create Ad Play Count Queries**
- In analytics page, add query to group `play_logs` by `ad_id`:
  ```tsx
  const adPlays = await supabase
    .from("play_logs")
    .select("ad_id, count:ad_id.count(), ads!inner(name, advertiser_id)")
    .in("screen_id", screenIds)
    .not("ad_id", "is", null)
    .gte("started_at", dateStart)
    .order("count", { ascending: false });
  ```

**Step 3: Add Ad Analytics to Dashboard**
- New section: "Ad Performance"
  - Top ads by play count (bar chart)
  - Per-advertiser breakdown (pie chart)
  - Play count over time per ad (line chart)

**Step 4: Add Date Range Filter Integration**
- Push date filtering into the Supabase query (replace client-side filter)
- Change the 2000-row cap to use proper `.range()` pagination

### 📝 Files to modify
- `lib/types/database.ts` — add `Ad`, `Advertiser`, update `PlayLog`
- `app/(app)/analytics/page.tsx` — add ad play queries
- `app/(app)/analytics/analytics-dashboard.tsx` — add ad performance section

---

## ⏳ Task 3: Advertiser-Scoped Analytics — BLOCKED by Harshitha

### 🔍 What's Needed
Create a restricted analytics view so advertisers can only see data for their own ads. This requires:
1. **Route group:** `app/(advertiser)/analytics/page.tsx`
2. **RBAC middleware/Layout:** Restrict access to `advertiser` role users
3. **Scoped queries:** Filter all analytics by `ads.advertiser_id = current_user_advertiser_id`

### 📋 Prerequisites (Harshitha must provide)
1. **RBAC routing shell** — `app/(advertiser)/layout.tsx` that:
   - Checks the user's role
   - Redirects non-advertiser users
   - Provides `advertiser_id` in context
2. **User → advertiser mapping** — How the platform knows which advertiser a user belongs to
3. **Route structure** — Whether it's `app/(advertiser)/analytics` or a sub-path

### 🛠 Implementation Steps (once unblocked)

**Step 1: Create Advertiser Analytics Page**
```tsx
// app/(advertiser)/analytics/page.tsx
export default async function AdvertiserAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get advertiser_id from user profile/metadata
  const advertiserId = user?.user_metadata?.advertiser_id;
  if (!advertiserId) return <div>No advertiser account linked</div>;
  
  // Fetch only ads for this advertiser
  const { data: ads } = await supabase
    .from("ads")
    .select("id, name")
    .eq("advertiser_id", advertiserId);
  
  const adIds = ads?.map(a => a.id) ?? [];
  
  // Fetch play logs only for those ads
  const { data: playLogs } = await supabase
    .from("play_logs")
    .select("*, ads!inner(name)")
    .in("ad_id", adIds)
    .order("started_at", { ascending: false })
    .limit(1000);
  
  return <AdvertiserAnalyticsDashboard ads={ads} playLogs={playLogs} />;
}
```

**Step 2: Build Advertiser Analytics Dashboard**
- Simplified dashboard showing only:
  - Total ad plays for this advertiser
  - Per-ad play counts
  - Daily play trend
  - Target franchise breakdown (if applicable)
- No access to other org data, screen data, or other advertisers' data

**Step 3: Security Considerations**
- Ensure RLS on `ads` table filters by `advertiser_id`
- Never expose `play_logs` for non-ad ads
- Add `advertiser_id` to RLS policies

### 📝 Files to create
- `app/(advertiser)/analytics/page.tsx` — server component
- `app/(advertiser)/analytics/advertiser-analytics-dashboard.tsx` — dashboard client component
- `app/(advertiser)/analytics/loading.tsx` — skeleton

### 📝 Files to modify (by Harshitha first)
- `middleware.ts` — add advertiser route protection
- New `app/(advertiser)/layout.tsx` — RBAC check layout

---

## 📊 Summary Table

| # | Task | Est. Effort | Depends On | Status |
|---|------|------------|------------|--------|
| 4 | Fix screen grouping (name → id) | 15 min | None | ✅ **Done** — committed & pushed (`afc04a7`) |
| 1 | Screen uptime/downtime history | 3-4 hrs | Ashwanth: `screen_status_log` table | 🔴 Blocked |
| 2 | Ad play count analytics | 4-5 hrs | Ashwanth: `ads` table + `ad_id` on `play_logs` | 🔴 Blocked |
| 3 | Advertiser-scoped analytics | 3-4 hrs | Harshitha: RBAC routing + layout | 🔴 Blocked |

---

## 🎯 Recommended Order of Work

1. ✅ **Done:** Task 4 (bug fix)
2. 🔴 **Waiting for team:** Tasks 1-3 require schema/RBAC from other team members
   - Harshitha has `franchises`, `advertisers`, `ads` tables on her branch (not yet merged to master)
   - Harshitha has NOT yet built RBAC routing
   - `screen_status_log` table and `ad_id` column on `play_logs` still need to be created
3. **When dependencies clear:** Implement **Task 1** → **Task 2** → **Task 3**

---

## 🧪 Test Checklist

- [x] **Task 4:** Dashboard groups screens by `id`, not `name` — duplicate name screens show separate stats
- [ ] **Task 1:** Uptime history shows accurate online/offline timeline per screen
- [ ] **Task 1:** Historical uptime percentage matches manual calculation from logs
- [ ] **Task 2:** Ad play counts appear correctly in analytics dashboard
- [ ] **Task 2:** Filtering by date range correctly scopes ad play counts
- [ ] **Task 3:** Advertiser sees ONLY their own ad data (not other org data)
- [ ] **Task 3:** Non-advertiser users are redirected away from `/advertiser/*`
- [ ] **All Tasks:** TypeScript `tsc --noEmit` passes with no errors
- [ ] **All Tasks:** Build (`npm run build`) succeeds
