# Architecture Research: Digital Signage SaaS

## Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD (Next.js 15 App Router — Vercel)                      │
│                                                                  │
│  app/                                                            │
│  ├── (auth)/login, signup, reset                                 │
│  ├── (app)/                                                      │
│  │   ├── overview/          ← stats, recent activity            │
│  │   ├── screens/           ← list, detail, pairing             │
│  │   ├── media/             ← library, upload                   │
│  │   ├── playlists/         ← builder, list                     │
│  │   ├── templates/         ← zone layout editor                │
│  │   ├── schedule/          ← calendar + rules                  │
│  │   ├── analytics/         ← charts, play logs                 │
│  │   └── settings/          ← org, members, billing             │
│  └── player/[screen-id]/    ← PWA player served here            │
└───────────┬─────────────────────────────────────────────────────┘
            │ @supabase/ssr (Server Components + Actions)
┌───────────▼─────────────────────────────────────────────────────┐
│  SUPABASE                                                        │
│                                                                  │
│  Auth         — sessions, JWT, org membership                   │
│  Postgres     — all relational data (see schema below)          │
│  Storage      — media files (public CDN bucket)                 │
│  Realtime     — screen channels: content push + heartbeat       │
│  Edge Funcs   — pairing, thumbnail gen, analytics rollup        │
└───────────┬─────────────────────────────────────────────────────┘
            │ Realtime channel + REST (device-scoped anon key)
┌───────────▼─────────────────────────────────────────────────────┐
│  PLAYER PWA (served from /player/[id] or separate Vercel app)   │
│                                                                  │
│  Boot → read pairing token from URL/localStorage                │
│  → subscribe Realtime channel `screen:{id}`                     │
│  → pull schedule JSON → cache to IndexedDB                      │
│  → pre-cache media files → Cache Storage                        │
│  → begin playback loop                                          │
│  → heartbeat every 30s → screens.last_seen updated             │
│  → on Realtime message: reload schedule, swap content           │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema (Core Tables)

```sql
-- Multi-tenancy anchor
orgs (id, name, slug, plan, created_at)
org_members (org_id, user_id, role: admin|editor|viewer)

-- Devices
screens (id, org_id, name, group_id, pairing_code, paired_at,
         last_seen, is_online, resolution, tags, created_at)
screen_groups (id, org_id, name)

-- Content
media_items (id, org_id, name, type: image|video, storage_path,
             thumbnail_path, duration_ms, size_bytes, folder, tags, created_at)

-- Playlists
playlists (id, org_id, name, created_at)
playlist_items (id, playlist_id, media_item_id, duration_ms, position, created_at)

-- Zone templates
templates (id, org_id, name, zones: jsonb)
-- zones JSONB: [{ id, x%, y%, w%, h%, playlist_id }]

-- Scheduling
schedules (id, org_id, screen_id, group_id, playlist_id, template_id,
           priority, start_at, end_at, recurrence: jsonb, is_default)
-- recurrence JSONB: { days: [0-6], time_start: "HH:MM", time_end: "HH:MM" }

-- Analytics
play_logs (id, screen_id, media_item_id, playlist_id,
           started_at, ended_at, duration_ms)

-- RLS: every table filters by org_id matching auth.jwt()->'org_id'
```

## Data Flow: Content to Screen

```
1. Editor uploads video → Supabase Storage → storage_path stored in media_items
2. Editor builds playlist → playlist_items rows with positions/durations
3. Editor creates schedule rule → schedules row: screen_id + playlist_id + time rules
4. Dashboard POSTs schedule change → Edge Function publishes to Realtime channel
   `screen:{screen_id}` with payload { type: 'schedule_update' }
5. Player receives Realtime message → fetches new schedule JSON from API
6. Player caches new media files via Service Worker → Cache Storage
7. Player swaps playlist at appropriate time
8. Player posts play_log row for each item played
9. Dashboard queries play_logs for analytics / proof-of-play
```

## Data Flow: Screen Pairing

```
1. New screen opens player URL (no screen ID yet)
2. Player requests pairing: POST /api/screens/pair → Edge Function generates
   6-digit code, stores in screens table with expiry
3. Player displays code fullscreen
4. Admin enters code in dashboard → PUT /api/screens/pair/{code} with screen name
5. Edge Function links screen to org, stores screen_id in player localStorage
6. Player refreshes → now authenticated, subscribes to channel, starts playback
```

## Key Architectural Constraints

- **RLS everywhere**: Every Supabase table must have RLS policies enforcing `org_id` isolation. No query bypasses org scope.
- **Player auth**: Player uses an anonymous Supabase session scoped to a single `screen_id`. It cannot read other screens' data.
- **Realtime fan-out**: One channel per screen (`screen:{id}`). Dashboard broadcasts; players subscribe. Do not use a single org-level channel (privacy + scale).
- **Offline resilience**: Player must survive 24h+ offline. All media pre-cached, schedule stored in IndexedDB, heartbeat fails silently.
- **Edge Function for pairing**: Pairing code generation/validation must be server-side (cannot expose org data to unauthenticated player).

## Build Order (phase dependency)

1. Foundation (infra, schema, auth) — everything depends on this
2. Overview dashboard (uses screens + media counts)
3. Screen management + pairing (core device flow)
4. Media library (required before playlists)
5. Playlists (required before scheduling)
6. Zone templates (optional for scheduling — can schedule single-zone first)
7. Scheduling engine (requires screens + playlists)
8. Player PWA (requires scheduling + Realtime + media CDN)
9. Analytics (requires player sending play_logs)
10. Polish (visual fidelity pass, settings, billing scaffolding)
