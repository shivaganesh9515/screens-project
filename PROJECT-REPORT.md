# Screens Website — Project Report

> **Generated:** July 10, 2026  
> **Repository:** `screens-website`  
> **Branch:** `master`  
> **Status:** Core platform complete, franchise milestone merged, local Supabase running

---

## 1. Project Overview

A **full-stack cloud digital signage SaaS platform** — a functional clone of Intelisa (login.intelisa.in). Businesses manage networks of physical display screens (TVs, kiosks, menu boards in buses and autos) from a web dashboard. Users register media players, upload content, build playlists, schedule what plays on which screen and when, and monitor screens in real time.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| UI Components | shadcn/ui + Tailwind CSS 4 |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Database | Supabase Postgres + Row Level Security |
| File Storage | Supabase Storage (public CDN bucket `media`) |
| Real-time | Supabase Realtime (channels) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Scheduling UI | FullCalendar React |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State (global) | Zustand |
| Server State | TanStack Query v5 |
| Tables | @tanstack/react-table |
| Icons | Lucide React |
| Notifications | Sonner |

---

## 3. What Has Been Built

### 3.1 Core Platform (Phases 1-6)

#### Phase 1 — Design Tokens
- Custom font loading (Plus Jakarta Sans)
- Thematic token configuration (colors, radii, shadows)
- Vella-inspired light theme design language

#### Phase 2 — App Shell Redesign
- Global application layout overhaul
- Light theme sidebar (white bg, soft blue active blocks)
- Top header with welcome message, search, and user cluster
- Transition from dark to light theme

#### Phase 3 — UI Primitives
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

#### Phase 4 — Overview Dashboard
- Stats cards row: Total Screens | Online Screens | Offline Screens | Active Content
- Playback Activity — area chart with timeframe toggle
- Quick Deploy widget — playlist + screen/group selector
- Recent Activity — list with status pills
- Smart Insights + Operational Metrics panels
- Extra charts: media-distribution, screen-health, top-content, recent-media, upcoming-schedules

#### Phase 5 — Pages Sweep (All Pages Restyled)
- Auth pages (`/login`, `/signup`, `/reset-password`) — split layout, capsule inputs
- Screens page — table with status pills, group display
- Media page — grid/list toggle, upload dropzone, folder/tag filters
- Playlists page — cards with item count + duration
- Templates page — preset layout cards, preview
- Schedule page — FullCalendar integration
- Analytics page — KPI cards, charts, CSV export
- Settings page — tabs (Organization, Team, Profile, Billing)

#### Phase 6 — Motion & Interaction
- Staggered entry animations across card grids and KPI cards
- CountUp component for numeric stat displays
- `ErrorBoundary` wrappers across app layout
- `EmptyState` component replacing inline empty states
- `loading.tsx` skeleton screens for all major routes
- `useStaggerAnimation` hook for card animations

### 3.2 Database & API

#### Schema
- 16 tables with RLS policies for org isolation
- Core tables: `orgs`, `org_members`, `screens`, `screen_groups`, `media_items`, `playlists`, `playlist_items`, `templates`, `schedules`, `play_logs`
- Franchise tables: `franchises`, `advertisers`, `ads`, `ad_franchise_targets`
- Metadata: `screen_status_log`, `screen_locations`
- Consolidated migration: `supabase/migrations/00001_schema.sql`

#### API Routes (25+ endpoints)
- **Screens:** list, detail, update, delete, pair, heartbeat, offline-check
- **Media:** upload, list, detail, update, delete (with Storage cleanup)
- **Playlists:** list, create, detail, update, delete
- **Schedules:** list, create, detail, update, delete
- **Screen Groups:** list, create, update, delete
- **Ads:** list, approve, reject, franchise-scoped
- **Auth:** login, signup, reset-password, callback
- **Settings:** org update, invite, password change
- **Health:** health check endpoint

#### Shared API Helpers
- `lib/api/auth.ts` — requireAuth, requireOrgMember, requireRole, getUserOrgId, getServiceClient
- `lib/api/errors.ts` — ApiError, handleApiError
- `lib/api/validation.ts` — Zod schemas for all resources

### 3.3 Franchise/Advertiser Milestone

#### Three-Tier Role Structure
- **Main Admin** — full platform access
- **Franchise** — territory-based access, can approve/reject ads
- **Advertiser** — sees only their own ads, can target multiple franchises

#### What Was Built
- Franchise/advertiser/ad tables with RLS
- Ad submission, approval, and rejection API endpoints
- Role-based routing (admin → admin, franchise → franchise, advertiser → advertiser)
- Franchise dashboard with screens/playlists/schedules stats, activity feed, approval queue
- Ad request submission UI, franchise ads table
- Screen metadata (orientation, size, type, unique number, connectivity, location)
- GPS tracking for vehicles
- Online/offline history table
- Ad play count tracking

### 3.4 Bug Fixes & Improvements (Sessions 6-8)

#### Session 8 — Local Supabase Setup
- Consolidated 15 overlapping migrations into single `00001_schema.sql`
- Fixed `playlist_items` RLS (table has no `org_id`)
- Fixed FK ordering (ALTER TABLE for screensaver_media_id, franchise_id, ad_id)
- Configured `.env.local` with local Supabase credentials
- Disabled analytics container for Windows Docker compatibility

#### Session 7 — P2 Bug Fixes
- **Signup atomicity** — onboard route deletes orphaned auth user on failure
- **Reset-password redirect** — changed from `next` to `redirect_to`
- **Analytics grouping** — mediaBreakdown groups by `media_item_id` instead of name
- **Server-side date range filter** — analytics reads `?range=` param, applies `.gte()`

#### Session 6 — API Audit & Security
- Full API audit (`docs/API-AUDIT.md`)
- Auth + Zod validation on all 12 existing routes
- 13 new CRUD endpoints created
- Crypto-resistant pairing codes (`crypto.getRandomValues()`)
- Offline detection endpoint (marks screens offline after 90s)
- Media upload restructured (folder/tags separated from link fields)
- Tag filtering on media grid

### 3.5 Player App
- Kiosk chrome (fullscreen, wake lock, hide cursor, block escape)
- Pairing screen shell
- Basic routing structure (`/player/[token]`)

---

## 4. Current State

### What Works
- Full UI with 8 pages (overview, screens, media, playlists, templates, schedule, analytics, settings)
- Auth flow (login, signup, password reset)
- All CRUD operations for screens, media, playlists, schedules, screen groups
- Local Supabase running on `localhost:54321` with full schema
- Real data flowing through analytics (play_logs)
- Franchise/advertiser 3-tier structure with role-based dashboards
- Mock client fallback for UI development without database

### What's Missing
| Area | Status |
|------|--------|
| Player playback engine | Shell only — no real content playback |
| Recurrence UI | `schedules.recurrence` JSONB column never set |
| Marketing website | Planned but not built |
| Production Supabase | Local only — needs production credentials |
| `storageUsed` / `contentFreshness` | Hardcoded (64 / 87) instead of computed |

### Known Issues
| Issue | Severity | Notes |
|-------|----------|-------|
| Pre-existing implicit-`any` TS errors | Low | ~15 errors across admin/franchise pages |
| `approval-actions.tsx` dead code | Low | Superseded by `approval-queue.tsx` |
| `origin/soumyaa` branch unmerged | Medium | Contains accidental duplicate of entire repo |

---

## 5. Git History Summary

- **Total commits on master:** 20+
- **Branches:** `master`, `abhinya`, `harshitha`, `srinitha` (all merged)
- **Latest commit:** `51fec26` — docs: update memory files for Session 8
- **Key commits:**
  - `17f07cf` — feat: complete API audit, CRUD endpoints, P1/P2 fixes, local Supabase setup
  - `9d90b17` — Merge branch 'manaswini' into master
  - `4fa915b` — Merge branch 'harshitha' into master
  - `b0fd161` — feat: complete admin, franchise and advertiser dashboards

---

## 6. Team Contributions

| Member | Focus Area | Status |
|--------|-----------|--------|
| harshitha | Database, Screens, Schedules, Player App | DB ✅, Screens ✅, Schedules ✅, Player ⚠️ shell only |
| srinitha | Auth, Media, Analytics | Auth ✅, Media ✅, Analytics ✅ (minor gaps) |
| abhinya | Dashboard, Playlists, Templates, Settings | All ✅ Complete |
| manaswini | Live Map, Dashboards | Dashboards ✅, Live Map ❌ not built |
| soumya | Screen/Media/Playlist UI | Screens ✅, Media ✅, Playlist ✅ |
| ashwanth | Floating Support | Did abhinaya's backend work |

---

## 7. Environment Setup

```bash
# Install dependencies
npm install

# Start local Supabase (requires Docker)
supabase start    # runs on localhost:54321

# Start dev server
npm run dev       # runs on localhost:3000

# Supabase Studio
# http://127.0.0.1:54323
```

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 8. Next Steps (Priority Order)

1. **Build player playback** — make the player actually fetch and play content, log plays
2. **Add recurrence UI** — day-of-week picker, time windows for schedules
3. **Build marketing website** — plan at `docs/plans/2026-07-07-marketing-website.md`
4. **Compute `storageUsed` / `contentFreshness`** from real data
5. **Clean up pre-existing TS errors** — ~15 implicit-any across admin/franchise pages
6. **Production deployment** — set up production Supabase, deploy to Vercel

---

*Report generated by opencode on July 10, 2026*
