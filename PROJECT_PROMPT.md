# Screens — Digital Signage Platform
## Master Build Prompt (for AI executors / Freebuff / Cursor / etc.)

---

## What We Are Building

A **full-stack cloud digital signage SaaS platform** — a functional and visual clone of **Intelisa** (login.intelisa.in). The product lets businesses manage networks of physical display screens (TVs, kiosks, menu boards) from a web dashboard. Users register media players, upload content, build playlists, schedule what plays on which screen and when, and monitor screens in real time.

The original Intelisa is a SPA (Angular, hash routing `#/overview`). We build a clean-room equivalent using **Next.js + Supabase + Vercel** — same features, same UX patterns, our own code.

---

## Tech Stack (fixed — do not deviate)

| Layer | Technology |
|-------|-----------|
| **Dashboard framework** | Next.js 15 (App Router, TypeScript) |
| **UI components** | shadcn/ui + Tailwind CSS 4 |
| **Auth** | Supabase Auth (`@supabase/ssr`) |
| **Database** | Supabase Postgres + Row Level Security |
| **File storage** | Supabase Storage (public CDN bucket) |
| **Real-time** | Supabase Realtime (channels) |
| **Edge logic** | Supabase Edge Functions (Deno) |
| **Drag & drop** | @dnd-kit/core + @dnd-kit/sortable |
| **Scheduling UI** | FullCalendar React or react-big-calendar |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Date utils** | date-fns |
| **Icons** | Lucide React |
| **Player framework** | Vite + TypeScript (minimal, no heavy framework) |
| **PWA / offline** | Workbox (vite-plugin-pwa) |
| **Deploy** | Vercel (dashboard + player) |
| **State (global)** | Zustand (light, client-only state) |
| **Server state** | TanStack Query (React Query) v5 |

---

## Product: Pages & Features

### 1. Authentication (`/login`, `/signup`, `/reset-password`)
- Email + password login
- Org creation on first signup
- Password reset via email
- Session cookie via `@supabase/ssr` middleware refresh
- Protected routes — redirect to `/login` if no session

### 2. Overview Dashboard (`/overview`) ← **main landing after login**
- **Stats cards row**: Total Screens | Online Screens | Offline Screens | Active Content items
- **Screen status list**: table of screens showing name, group, status (green dot = online, red = offline), currently playing content, last seen time
- **Recent media**: last 5 uploaded items with thumbnails
- **Upcoming schedules**: next 3 scheduled content changes
- **Quick actions**: "Add Screen", "Upload Media", "Create Playlist" buttons
- Sidebar navigation (present on all app pages)

### 3. Screens (`/screens`)
- **Screens list page**: table/grid of all screens with online status badge, group, assigned playlist, last seen
- **Screen detail page** (`/screens/[id]`): live status, current playlist, group membership, pairing info, edit name/tags
- **Screen groups**: create groups, assign screens to groups, assign playlists/schedules to entire groups
- **Pairing flow**:
  1. Click "Add Screen" → system generates a 6-digit pairing code
  2. Admin enters code shown on the physical screen's player app
  3. Screen is registered to org and named
- **Bulk actions**: select multiple screens → assign playlist / assign group / delete

### 4. Media Library (`/media`)
- **Grid + list toggle view** of all media items
- **Upload**: drag-and-drop or click-to-upload; supports JPG, PNG, GIF, WebP, MP4 (H.264)
- **Auto-thumbnail**: images show thumbnail directly; videos auto-generate a poster frame (Canvas API, frame 0)
- **File info chip**: duration (video), file size, type badge
- **Folders / Tags**: organize media into folders; tag for search
- **Search + filter**: by name, type, tag, date uploaded
- **Delete**: with usage warning if item is in active playlist
- **Media detail panel** (slide-out): full preview, metadata, "used in" playlists list

### 5. Playlists (`/playlists`)
- **Playlist list**: cards showing name, item count, total duration, assigned screens
- **Playlist builder** (`/playlists/[id]`):
  - Drag-and-drop reorder of items (powered by @dnd-kit)
  - Per-item duration override (for images; videos respect file duration by default)
  - Add items from media library (search modal)
  - Remove items
  - Preview: click any item to preview in a mini player
- **Assign**: assign playlist to screen(s) or screen group(s)

### 6. Zone Templates (`/templates`)
- **Template library**: preset layouts as visual cards
  - Full Screen (single zone, 100%)
  - L-Bar (main 80% + bottom ticker 20%)
  - Split Horizontal (50/50 left/right)
  - Split Vertical (70/30 top/bottom)
  - Picture-in-Picture (main + small overlay corner)
- **Template editor**: visual drag/resize zone editor on a 16:9 canvas
  - Each zone has an assigned playlist
  - Zones stored as `{ id, x%, y%, w%, h%, playlist_id }`
- Template assigned to screen instead of (or alongside) a playlist

### 7. Scheduling (`/schedule`)
- **Calendar view** (week/month): shows what plays on which screen/group
- **Schedule rule creation**:
  - Target: specific screen OR screen group
  - Content: playlist OR template
  - Type: Default (always-on fallback) OR time-range override
  - Time override: date range + time of day + day-of-week recurrence
- **Conflict resolution**: screen-specific > group, time-range > default, higher priority wins
- **"Push Now" override**: instantly push any playlist/template to a screen, bypassing schedule

### 8. Player App (`/player/[screen-token]`) — web-kiosk PWA
- Served from the Next.js app or a separate Vite project on Vercel
- **Boot flow**:
  1. Check localStorage for `screen_id` + `screen_token`
  2. If missing → show pairing screen (6-digit code, full screen)
  3. If present → authenticate with Supabase anon session scoped to screen
  4. Subscribe to Realtime channel `screen:{screen_id}`
  5. Fetch resolved schedule from API
  6. Pre-cache all media files via Service Worker
  7. Begin playback loop in fullscreen
- **Playback engine**:
  - Single-zone: cycle through playlist items, respecting durations
  - Multi-zone: render zones absolutely positioned, each cycling its own playlist
  - Video: `<video muted autoplay playsinline loop>`
  - Image: `<img>` with CSS transition between items
  - Smooth fade transition between items (300ms crossfade)
- **Offline behaviour**:
  - Schedule JSON cached in IndexedDB
  - Media files cached in Cache Storage (Workbox CacheFirst)
  - If network drops: continue playing cached content silently
  - Auto-reconnect and sync when network restores
- **Heartbeat**: fetch to `/api/screens/heartbeat` every 30s with screen_id → updates `screens.last_seen`
- **Realtime push**: on `schedule_update` message → fetch new schedule → diff → pre-cache new media → swap at next item boundary
- **Kiosk hardening**:
  - `document.documentElement.requestFullscreen()` on start
  - `navigator.wakeLock.request('screen')` to prevent sleep
  - Hide cursor after 3s idle
  - Suppress context menu and keyboard shortcuts

### 9. Analytics (`/analytics`)
- **Overview stats**: total impressions (play events), total play time, unique screens active
- **Per-screen report**: uptime %, content played, impressions per item
- **Per-media report**: how many times each item played, on how many screens, total duration
- **Date range picker**: filter last 7d / 30d / 90d / custom
- **Export CSV** of play logs

### 10. Settings (`/settings`)
- **Organisation**: name, logo upload, timezone
- **Team members**: invite by email, assign role (Admin/Editor/Viewer), remove member
- **Profile**: display name, email, change password
- **Billing** (scaffolding only): show current plan, "Upgrade" CTA → not wired to real payment in v1

---

## Database Schema

```sql
-- Orgs
CREATE TABLE orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  timezone TEXT DEFAULT 'UTC',
  logo_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users ↔ Orgs (roles: admin, editor, viewer)
CREATE TABLE org_members (
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- Screen groups
CREATE TABLE screen_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Screens / devices
CREATE TABLE screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  group_id UUID REFERENCES screen_groups(id) ON DELETE SET NULL,
  anon_user_id UUID,                    -- Supabase anon user tied to this device
  name TEXT NOT NULL DEFAULT 'New Screen',
  pairing_code TEXT,                    -- 6-digit, expires after 10 min
  pairing_expires_at TIMESTAMPTZ,
  paired_at TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  is_online BOOLEAN DEFAULT FALSE,
  resolution TEXT,                      -- e.g. '1920x1080'
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media items
CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  storage_path TEXT NOT NULL,           -- Supabase Storage path
  thumbnail_path TEXT,
  duration_ms INTEGER,                  -- for video
  size_bytes INTEGER,
  folder TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlists
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zone templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_preset BOOLEAN DEFAULT FALSE,
  zones JSONB NOT NULL DEFAULT '[]',
  -- zones: [{ "id": "z1", "x": 0, "y": 0, "w": 100, "h": 100, "playlist_id": "..." }]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  group_id UUID REFERENCES screen_groups(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  is_default BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  recurrence JSONB,
  -- recurrence: { "days": [1,2,3,4,5], "time_start": "09:00", "time_end": "17:00" }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Play logs (from player)
CREATE TABLE play_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id) ON DELETE SET NULL,
  media_item_id UUID REFERENCES media_items(id) ON DELETE SET NULL,
  playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_ms INTEGER
);
```

### RLS Policies (apply to ALL tables)
```sql
-- Pattern for every table with org_id:
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON <table>
  USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );
```

---

## API Routes (Next.js App Router)

```
POST   /api/auth/callback              ← Supabase OAuth redirect handler
POST   /api/screens/pair               ← Generate pairing code (returns { code, expires_at })
PUT    /api/screens/pair/[code]        ← Claim pairing code (links screen to org)
POST   /api/screens/heartbeat          ← Player sends { screen_id } every 30s
GET    /api/screens/[id]/schedule      ← Player fetches resolved current schedule
POST   /api/media/upload               ← Presigned URL for direct-to-Supabase-Storage upload
POST   /api/media/thumbnail            ← Accept canvas-generated thumbnail blob, store it
POST   /api/play-logs                  ← Player POSTs play events (batched)
POST   /api/realtime/push              ← Dashboard triggers push to screen channel
```

---

## Supabase Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `generate-pairing-code` | HTTP (POST /api/screens/pair) | Create unique 6-digit code with expiry |
| `claim-pairing-code` | HTTP (PUT /api/screens/pair/[code]) | Link screen to org, create anon user |
| `resolve-schedule` | HTTP (GET /api/screens/[id]/schedule) | Compute current playlist from schedule rules |
| `update-screen-status` | Scheduled (every 1 min) | Set is_online=false for screens with last_seen > 90s |

---

## Player PWA Architecture

```
/player/[screen-token]/
├── index.html
├── main.ts           ← boot: check pair status, init realtime, start playback
├── pairing.ts        ← show pairing code screen
├── player.ts         ← playback loop engine
├── schedule.ts       ← fetch + cache schedule JSON
├── cache.ts          ← pre-cache media via Cache Storage
├── heartbeat.ts      ← 30s interval ping
├── realtime.ts       ← Supabase channel subscription
└── sw.ts             ← Workbox service worker (media CacheFirst, API NetworkFirst)
```

**Playback engine pseudocode:**
```ts
while (true) {
  const item = playlist[currentIndex]
  await showItem(item)           // display image or play video
  await sleep(item.duration_ms)  // or wait for video 'ended' event
  currentIndex = (currentIndex + 1) % playlist.length
}
```

---

## Visual Design Reference

The original Intelisa dashboard uses:
- **Dark sidebar** with logo and nav icons + labels
- **Light main content area** (white / very light grey background)
- **Blue primary accent** (`#1E6FFF` approx) — used on buttons, active nav, status badges
- **Status colours**: Green `#22C55E` (online), Red `#EF4444` (offline), Yellow `#EAB308` (warning)
- **Card-based layout**: overview stats in cards with icon + number + label
- **Data tables** with alternating row shading, action buttons per row
- **Top header bar**: breadcrumb / page title on left, org name + avatar on right
- Font: Inter (system-ui fallback) — standard SaaS look

We will get screenshot references from the live demo login to refine colour tokens, spacing, and specific component layouts before the polish phase.

---

## Folder Structure (Next.js App)

```
screens-website/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          ← sidebar + header shell
│   │   ├── overview/page.tsx
│   │   ├── screens/
│   │   │   ├── page.tsx        ← screen list
│   │   │   └── [id]/page.tsx   ← screen detail
│   │   ├── media/page.tsx
│   │   ├── playlists/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── templates/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── settings/page.tsx
│   ├── player/
│   │   └── [token]/page.tsx    ← serves PWA player shell
│   └── api/
│       ├── screens/
│       │   ├── pair/route.ts
│       │   ├── pair/[code]/route.ts
│       │   └── heartbeat/route.ts
│       ├── media/
│       │   └── upload/route.ts
│       └── play-logs/route.ts
├── components/
│   ├── ui/                     ← shadcn/ui primitives
│   ├── layout/                 ← Sidebar, Header, PageShell
│   ├── screens/                ← ScreenCard, ScreenTable, PairingModal
│   ├── media/                  ← MediaGrid, UploadDropzone, MediaPicker
│   ├── playlists/              ← PlaylistBuilder, PlaylistItem
│   ├── templates/              ← ZoneCanvas, ZoneEditor, TemplateCard
│   ├── schedule/               ← ScheduleCalendar, RuleForm
│   └── analytics/              ← StatsCard, PlayLogTable, UptimeChart
├── lib/
│   ├── supabase/
│   │   ├── client.ts           ← browser client
│   │   ├── server.ts           ← server component client
│   │   └── middleware.ts       ← session refresh
│   ├── hooks/                  ← useScreens, useMedia, usePlaylists, etc.
│   ├── types/                  ← DB types (generated + extended)
│   └── utils/                  ← cn(), formatDuration(), etc.
├── middleware.ts                ← Supabase SSR auth middleware
├── public/
│   └── player/                 ← Compiled player PWA static files
└── supabase/
    ├── migrations/             ← SQL migration files
    └── functions/              ← Edge Functions
```

---

## Build Phases

Execute in this order. Each phase is a standalone deliverable.

### Phase 0 — Foundations
**Goal:** Repo is wired up, DB schema exists with RLS, CI/CD deploys to Vercel, shadcn/ui installed.

Tasks:
- `npx create-next-app@latest screens-website --typescript --tailwind --app`
- Install dependencies: supabase, @supabase/ssr, shadcn/ui, lucide-react, zod, react-hook-form
- Init Supabase project (CLI: `supabase init`)
- Write all migrations (tables above + RLS policies)
- Create Supabase client helpers (`lib/supabase/client.ts`, `server.ts`)
- Write `middleware.ts` for session refresh
- Set up Vercel project + environment variables
- Implement `app/layout.tsx` root with font and theme

Deliverable: `npm run dev` starts, blank dashboard shell deploys to Vercel preview URL, all DB tables exist with RLS enabled.

---

### Phase 1 — Auth & Org
**Goal:** User can sign up, create an org, log in, and be redirected to the dashboard. Roles enforced.

Tasks:
- Login page (`/login`) — email/password form, error states
- Signup page (`/signup`) — name, email, password, auto-create org on signup via Server Action
- Password reset (`/reset-password`) — send email + confirm new password
- `middleware.ts` auth guard — redirect unauthenticated to `/login`
- Org context in layout — read current org from session JWT
- Role guard hook `useRole()` — block editor/viewer from admin actions

Deliverable: Full auth flow works end-to-end. Protected routes redirect correctly.

---

### Phase 2 — App Shell & Overview Dashboard
**Goal:** Sidebar navigation, header, and the `/overview` page with live stats.

Tasks:
- Sidebar component: logo, nav items (Overview, Screens, Media, Playlists, Templates, Schedule, Analytics, Settings), active state, collapse on mobile
- Header: breadcrumb, org name, user avatar dropdown (profile/logout)
- Overview stats cards (query: screen counts, online count, media count)
- Screen status mini-table (top 5 screens with status)
- Recent media row (last 5 uploads)
- Upcoming schedules list
- Quick-action buttons

Deliverable: Logging in lands on `/overview` showing real data from DB.

---

### Phase 3 — Screens & Pairing
**Goal:** Admin can register a screen via pairing code, see it appear online, and manage screen groups.

Tasks:
- Screens list page: table with status badge, group, last seen, actions
- Screen detail page: editable name, group assignment, current playlist, pairing info
- Screen groups CRUD
- "Add Screen" modal → calls `POST /api/screens/pair` → shows pairing code
- `POST /api/screens/pair` route — generate code, store with expiry
- `PUT /api/screens/pair/[code]` route — claim code, create screen record
- Heartbeat route `POST /api/screens/heartbeat` — update `last_seen`
- Edge Function: mark screens offline if `last_seen` > 90s (cron every 60s)
- Realtime: dashboard subscribes to screen status changes, updates status badges live

Deliverable: Admin enters pairing code → screen appears in list → heartbeats keep it green.

---

### Phase 4 — Media Library
**Goal:** User can upload, preview, organise, and delete media files.

Tasks:
- Media library page: grid view + list toggle, search/filter bar
- Upload dropzone (drag-and-drop + click): multi-file, progress per file
- Direct-to-Supabase-Storage upload (presigned URL or client SDK)
- Client-side video thumbnail: Canvas API draws frame 0 → uploads as separate file
- Media card: thumbnail, name, type badge, duration (video), size
- Folder sidebar + tag filter
- Media detail slide-out panel: full preview, metadata, "used in" info
- Delete with usage check (query playlist_items for this media_item_id)

Deliverable: Upload 5 images and 2 videos → all appear with thumbnails → can filter/search → delete warns if in use.

---

### Phase 5 — Playlists & Zone Templates
**Goal:** User can build a playlist of media items with drag-and-drop ordering, and pick a zone template.

Tasks:
- Playlists list page: cards with item count, total duration, assigned screens
- Playlist builder (`/playlists/[id]`):
  - @dnd-kit drag-and-drop list
  - Add item modal (search media library)
  - Per-item duration input (images)
  - Remove item
  - Save button → upserts playlist_items with positions
- Templates page: preset template cards (Full, L-Bar, Split-H, Split-V, PiP)
- Template detail: visual zone canvas (fixed 16:9 ratio), assign playlist to each zone
- Template save (stores zones JSONB)

Deliverable: Build a 5-item playlist by drag-drop → assign playlists to zones in a template → data persists.

---

### Phase 6 — Scheduling
**Goal:** User can assign content to screens/groups with time rules; player gets a resolved schedule.

Tasks:
- Schedule page: FullCalendar week view showing what plays where
- "Add rule" side panel: target (screen/group), content (playlist/template), type (default/time-range), recurrence
- Schedule rule CRUD (create/edit/delete rules)
- `GET /api/screens/[id]/schedule` Edge Function:
  - Fetch all rules for this screen (direct + via group)
  - Resolve current rule: check time, priority, recurrence
  - Return `{ playlist_id, template_id, zones, items: [...], next_change_at }`
- "Push Now" button: send `schedule_update` message to Realtime channel `screen:{id}`

Deliverable: Create a default playlist + a lunch-hour override → API returns correct content for current time.

---

### Phase 7 — Player PWA
**Goal:** A browser tab opened at `/player/[token]` plays assigned content fullscreen, works offline.

Tasks:
- Player boot: check token in URL → if no screen_id → show pairing UI
- Pairing UI: display 6-digit code fullscreen (large, readable at distance)
- Authenticated player: fetch schedule → render content
- Single-zone engine: cycle playlist items with fade transition
- Multi-zone engine: render absolute-positioned divs, each cycling its playlist
- Video: `<video muted autoplay playsinline>` with ended handler
- Image: `<img>` with CSS crossfade on swap
- Workbox service worker: CacheFirst for media, NetworkFirst for schedule API
- IndexedDB: store schedule JSON for offline fallback
- Heartbeat: `setInterval` every 30s → POST `/api/screens/heartbeat`
- Realtime: subscribe `screen:{id}` → on `schedule_update` → re-fetch + re-cache
- Kiosk: requestFullscreen on boot, wakeLock, hide cursor, suppress context menu
- PWA manifest: `display: fullscreen`, icons, theme-color

Deliverable: Open player URL in Chrome → pairs in 30s → assigned playlist plays fullscreen → disconnect network → content keeps playing from cache.

---

### Phase 8 — Analytics
**Goal:** Dashboard shows playback proof and screen uptime data.

Tasks:
- Player batches play events: after each item ends, queue `{ screen_id, media_item_id, playlist_id, started_at, ended_at }`
- POST `/api/play-logs` — batch insert play_logs rows
- Analytics page:
  - Stats cards: total impressions, total play time, active screens
  - Play log table: media name, screen, played at, duration
  - Per-screen uptime chart (Recharts): `last_seen` history → uptime %
  - Per-media impression bar chart
  - Date range filter
  - Export CSV (client-side, from query results)

Deliverable: After 10 minutes of player running → analytics page shows impression counts and uptime.

---

### Phase 9 — Polish & Visual Fidelity
**Goal:** App visually matches Intelisa's dashboard style; all empty states, error states, and loading states handled.

Tasks:
- Apply Intelisa colour tokens from captured screenshots: sidebar dark bg, blue accent, status colours
- Implement skeleton loaders (`loading.tsx`) for every page
- Empty state illustrations for screens/media/playlists (empty bucket + CTA)
- Error boundary per route
- Toast notifications (shadcn/ui Sonner) for all mutations
- Mobile-responsive sidebar (collapse to icon rail on < 768px)
- Settings page: org name/logo, team member invite, profile edit
- Billing scaffolding: plan display, upgrade modal (no payment wiring)
- Accessibility: keyboard navigation, focus rings, ARIA labels on icon buttons
- Performance: verify Core Web Vitals pass in Vercel analytics

Deliverable: App looks and feels like a polished SaaS — matches reference screenshots, no rough edges.

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only, never expose to client

# App
NEXT_PUBLIC_APP_URL=https://screens.yourdomain.com
```

---

## Key Rules for the Executor

1. **Never use `getSession()` server-side** — always use `getUser()` to prevent stale JWT.
2. **Enable RLS on every table** — no exceptions. Test with a second org account.
3. **Video elements must have `muted` attribute** — required for autoplay in all browsers.
4. **Store zone dimensions as percentages** — never pixels (screens have different resolutions).
5. **Player schedule API must resolve server-side** — player receives final `items[]` array, not raw rules.
6. **Media cached by content hash** — Supabase Storage paths are stable after upload; use CacheFirst.
7. **Heartbeat fails silently** — player must not crash or show error UI if heartbeat POST fails.
8. **Commit after every phase** — do not batch across phases.
9. **Use Server Components for all data-heavy pages** — data fetched on server, not client-fetched.
10. **shadcn/ui only for UI primitives** — do not mix in other component libraries.
