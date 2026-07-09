# Screens Project — Memory / State Document

> **Generated:** July 4, 2026  
> **Purpose:** A living record of everything built, gaps remaining, and current state — so anyone (human or AI) can pick up where things left off.

---

## 1. Project Overview

A **full-stack cloud digital signage SaaS platform** — a functional clone of Intelisa (login.intelisa.in).  
Businesses manage networks of physical display screens (TVs, kiosks, menu boards) from a web dashboard.  
Users register media players, upload content, build playlists, schedule what plays on which screen and when, and monitor screens in real time.

**Repository:** `wps_download/screens-project/`  
**Framework:** Next.js 15 (App Router, TypeScript)  
**UI:** shadcn/ui + Tailwind CSS 4  
**Auth + DB + Storage:** Supabase (@supabase/ssr, Postgres, Storage, Realtime)  
**Currently running against:** Mock in-memory Supabase client (`.env.local` has blank credentials)

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Dashboard framework | Next.js 15 (App Router, TypeScript) |
| UI components | shadcn/ui + Tailwind CSS 4 |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Database | Supabase Postgres + Row Level Security |
| File storage | Supabase Storage (public CDN bucket `media`) |
| Real-time | Supabase Realtime (channels) |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| Scheduling UI | FullCalendar React |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Date utils | date-fns |
| Icons | Lucide React |
| State (global) | Zustand |
| Server state | TanStack Query v5 |
| Tables | @tanstack/react-table |
| Notifications | Sonner |
| Drawer/Sheet | Vaul |
| CSS framework | Tailwind CSS 4 |

---

## 3. Completed Phases (from Git History)

### Phase 1 — Design Tokens
- Custom font loading (Plus Jakarta Sans)
- Thematic token configuration (colors, radii, shadows)
- Vella-inspired light theme design language

### Phase 2 — App Shell Redesign
- Global application layout overhaul
- Light theme sidebar (white bg, soft blue active blocks)
- Top header with welcome message, search, and user cluster
- Transition from dark to light theme

### Phase 3 — UI Primitives
- Core design system components built:
  - `StatCard` — icon chip + label + value + trend pill
  - `GradientAreaChart` — Recharts wrapper with blue gradient fill
  - `CapsuleInput` / `CapsuleSelect` — rounded fields
  - `StatusPill` — Online/Offline/Playing/Scheduled variants
  - `TrendPill` — emerald/coral rounded chip with arrow
  - `SectionCard` — white card with soft shadow
  - `TimeframeToggle` — pill group `1D 1W 1M 1Y ALL`
  - `ProgressBar` — labeled linear meter
  - Stagger animations (`StaggerWrapper`, `useStaggerAnimation`)
  - `CountUp` component for animated numbers

### Phase 4 — Overview Dashboard
- **Stats cards row:** Total Screens | Online Screens | Offline Screens | Active Content
- **Playback Activity** — area chart with timeframe toggle
- **Quick Deploy widget** — playlist + screen/group selector (mostly wired)
- **Recent Activity** — list with status pills
- **Smart Insights** + **Operational Metrics** panels
- Extra charts: media-distribution, screen-health, top-content, recent-media, upcoming-schedules

### Phase 5 — Pages Sweep (All Pages Restyled)
- **Auth pages** (`/login`, `/signup`, `/reset-password`) — split layout, capsule inputs
- **Screens page** — table with status pills, group display
- **Media page** — grid/list toggle, upload dropzone, folder/tag filters
- **Playlists page** — cards with item count + duration
- **Templates page** — preset layout cards, preview
- **Schedule page** — FullCalendar integration
- **Analytics page** — KPI cards, charts, CSV export
- **Settings page** — tabs (Organization, Team, Profile, Billing)
- All pages use borderless cards, capsule inputs, consistent color palette

### Phase 6 — Motion & Interaction
- Staggered entry animations across card grids and KPI cards
- CountUp component for numeric stat displays
- `ErrorBoundary` wrappers across app layout
- `EmptyState` component replacing inline empty states
- `loading.tsx` skeleton screens for all major routes
- `useStaggerAnimation` hook for card animations

### Core Infrastructure (ongoing)
- Supabase schema written and migrated (`00001_schema.sql`)
- API routes: all CRUD endpoints built (screens, playlists, schedules, screen-groups, media, ads, org members, health check, offline-check)
- Shared API helpers: `lib/api/auth.ts`, `lib/api/errors.ts`, `lib/api/validation.ts`
- Full API audit: `docs/API-AUDIT.md`
- Player app kiosk chrome (fullscreen, wake lock, hide cursor, block escape)
- Middleware for auth session refresh
- Supabase client helpers (client.ts, server.ts) with mock fallback

---

## 4. Team Task Status

### harshitha — Database, Screens, Schedules, Player App

| Task | Status | Details |
|------|--------|---------|
| **Database / Supabase** | ✅ DONE | Schema exists, but `.env.local` is **blank** — no real Supabase connected |
| **Screen Management** | ✅ DONE | Pair, list, detail, groups, heartbeat all built. Group counts verified correct. |
| **Schedules** | ✅ DONE | Calendar view, create/delete schedules. Group-targeting verified correct. API GET now includes screen_groups join. |
| **Recurrence UI** | ❌ NOT STARTED | `schedules.recurrence` JSONB column never read/written |
| **Player App** | ❌ MOSTLY NOT STARTED | Kiosk chrome exists. No real pairing, no playback, no play_logs |
| **Offline Detection** | ✅ DONE | `app/api/screens/offline-check/route.ts` marks screens offline after 90s |

**Known gaps:**
- Real Supabase credentials needed in `.env.local`
- No recurrence UI (day-of-week picker, time windows)
- Player app is essentially a shell — no content playback

### srinitha — Auth, Media, Analytics

| Task | Status | Details |
|------|--------|---------|
| **Login/Signup/Reset** | ✅ DONE | Two small bugs: non-atomic signup, redirect param mismatch |
| **Media Upload** | ✅ DONE | Upload works. Folder/tag fields now properly separated from link fields. |
| **Media Tags** | ✅ DONE | Tag filtering dropdown, tag badges on grid/list views |
| **Analytics** | ✅ DONE | Real play_logs reporting. Minor: grouping by name vs id, hard 2000-row cap |

**Known gaps:**
- Signup isn't atomic (org may fail after auth user created)
- Reset password redirect param mismatch (`redirect_to` vs `next`)
- Analytics groups by name instead of id (duplicate names merge stats)
- "Uptime %" is live snapshot, not historical
- Hard 2000-row cap on play_logs query

### abhinya — Dashboard, Playlists, Templates, Settings

| Task | Status | Details |
|------|--------|---------|
| **Dashboard Home** | ✅ DONE | Real KPIs/charts. Quick Deploy now writes to `schedules` table. Two hardcoded placeholders remain (storage=64, freshness=87) |
| **Playlists** | ✅ DONE | Drag-and-drop builder, per-item duration, save/delete |
| **Templates (Zone Editor)** | ✅ DONE | Full editor at `/templates/[id]/` with canvas, playlist binding per zone, add/remove zones, save. No drag-resize |
| **Settings** | ✅ DONE | Logo upload, full invite API route (`/api/org/invite`), password change. Admin-gated. Billing is placeholder |

**Known gaps:**
- `storageUsed` and `contentFreshness` still hardcoded (low priority)
- Zone editor doesn't have drag-to-resize (stretch goal)
- Billing section is intentional placeholder

**What was built on `abhinya` branch** (`bc451a9` + `7ecaa82`):
- Quick Deploy now inserts into `schedules` table
- Zone editor page at `/templates/[id]/` with playlist binding, canvas preview, add/remove zones
- Settings: logo upload (`media` bucket), invite API (service role key), password change
- Fix: double-JSON-encoding removed from template creation
- Fix: zone editor crash (zoneColors index)

---

## 5. Git Branches

| Branch | Purpose | Status |
|--------|---------|--------|
| `master` | Main/integration branch | Has all phases 1-6 commits |
| `abhinya` | abhinya's feature branch | 2 commits ahead of master (zone editor fix, Quick Deploy wiring) |
| `harshitha` | harshitha's feature branch | Unknown divergence from master |
| `srinitha` | srinitha's feature branch | Unknown divergence from master |

**Latest commit on current branch (`abhinya`):**  
`7ecaa82 fix: template zone editor crash - zoneColors index missing .length`

---

## 6. Key Architecture Decisions

1. **Mock client fallback:** When `.env.local` has blank Supabase credentials, the app auto-falls back to an in-memory mock client (`lib/supabase/mock-client.ts` + `mock-data.ts`). This lets UI development proceed without a real backend.
2. **Server Components for data pages:** All data-heavy pages use Server Components with direct Supabase queries — not client-fetched.
3. **RLS on every table:** Org isolation enforced via Row Level Security policies.
4. **Player uses anon user:** Screens get their own Supabase anon user (`anon_user_id`) scoped only to read their own schedule.
5. **Zones stored as percentages:** Zone dimensions use `x%, y%, w%, h%` so layouts work across screen resolutions.
6. **shadcn/ui only for primitives:** No mixing of other component libraries.
7. **Vella-inspired design:** Light theme, spacious, premium SaaS look with blue accent (`#4A7CF7`).

---

## 7. Database Schema Summary

Tables (all with `org_id` for RLS isolation):
- `orgs` — name, slug, plan, timezone, logo_path
- `org_members` — org_id, user_id, role (admin/editor/viewer)
- `screen_groups` — name
- `screens` — group_id, anon_user_id, pairing_code/expires_at, paired_at, last_seen, is_online, resolution, tags[]
- `media_items` — type (image|video), storage_path, thumbnail_path, duration_ms, size_bytes, folder, tags[]
- `playlists` — name
- `playlist_items` — position, duration_ms (FK to playlist + media_item)
- `templates` — zones JSONB (`[{id,x,y,w,h,playlist_id}]`)
- `schedules` — screen_id OR group_id, playlist_id OR template_id, is_default, priority, start_at/end_at, recurrence JSONB
- `play_logs` — screen_id, media_item_id, playlist_id, started_at, ended_at, duration_ms

---

## 8. Environment Variables Needed

```env
NEXT_PUBLIC_SUPABASE_URL=<from Supabase project>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase project>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase project>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 9. Memory System (for AI Continuity)

This project has a `memory/` folder designed so any AI model can pick up mid-stream with zero context loss.

| File | Purpose |
|------|---------|
| `memory/INSTRUCTIONS_FOR_NEXT_AI.md` | Guide for the next AI — read this first |
| `memory/PROJECT_STATE.md` | This file — full project state |
| `memory/SESSION_LOG.md` | Running log of every session and what was done |
| `memory/NEXT_STEPS.md` | Current priority queue, updated after every session |

**Rule for every session:** Before making changes, read the memory folder. After making changes, update the memory folder.

---

## 10. How to Start Development

```bash
cd wps_download/screens-project
npm install    # already done
npm run dev    # starts on localhost:3000
```

The app currently runs in **mock mode** (no real Supabase). All data resets on server restart until `.env.local` has real Supabase credentials.

---

## 11. Critical Next Actions (Priority Order)

1. **🔥 Connect real Supabase** — fill `.env.local` with credentials so the app works against real data
2. **🔧 Build zone editor** (`/templates/[id]/page.tsx`) — bind zones to playlists (biggest feature gap)
3. **🔧 Build player playback** — make the player actually fetch and play content, log plays
4. **🔧 Fix bugs** — group counts, schedule group-targeting, signup atomicity, Quick Deploy wiring
5. **🔧 Polish** — settings invite, logo upload, recurrence UI, media folder/tags, Storage cleanup
