# Screens — Digital Signage Platform (Intelisa-inspired clone)

## What This Is

A cloud-based digital signage SaaS platform that lets businesses manage networks of physical display screens from a central web dashboard. Users register media players (web-kiosk PWA, later Android TV), upload content, build playlists and multi-zone layouts, schedule what plays when and where, and monitor screens in real time. It is a functional + visual equivalent of Intelisa (login.intelisa.in), built clean-room — our own code, schema, and assets, modeled on the same feature set and UX patterns.

## Core Value

A user can push content to a physical screen and see it play — register a screen, assign scheduled content, and have that content reliably display on the device with online/offline visibility. If everything else fails, content-to-screen delivery must work.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Auth & multi-tenant orgs with roles (admin/editor/viewer)
- [ ] Overview dashboard (screen counts, online/offline, active content, recent activity)
- [ ] Screen/device management: list, groups, status, pairing flow (code → device), detail view
- [ ] Media library: upload images/videos to storage, thumbnails, folders/tags
- [ ] Playlists: ordered content with per-item duration
- [ ] Multi-zone templates/layouts (e.g. main video + ticker + sidebar)
- [ ] Scheduling & dayparting: assign playlist → screen/group with time rules
- [ ] Player client (web-kiosk PWA): pair, pull schedule, offline cache, loop playback, heartbeat
- [ ] Real-time push: content/schedule changes reach screens without manual refresh
- [ ] Analytics & playback proof: play logs, impressions, per-screen uptime
- [ ] Settings: org/profile/billing scaffolding
- [ ] Deploy on Vercel (dashboard) + Supabase (backend)

### Out of Scope

- Native Android TV app (v1 uses web-kiosk PWA; native wrapper deferred to v2) — reduces v1 surface, PWA runs on most TV browsers/Chromecast
- AI content recommendations — differentiator, not core to delivery; deferred to v2
- Hardware media-player provisioning / OS image — out of software scope
- Reproducing Intelisa's proprietary logos, brand assets, or source code — clean-room build only
- Payment processing integration (real billing) — settings scaffolding only in v1

## Context

- Original product: Intelisa (intelisa.in), founded 2019, Indian digital-signage SaaS. The `login.intelisa.in/#/overview` route is the post-login dashboard landing (SPA, hash routing — appears Angular). Serves retail, restaurants, corporate, healthcare, manufacturing, OOH advertising.
- Design reference: user will provide demo login credentials so the live dashboard can be captured (screenshots via browser tool) to drive high visual fidelity during execution. Until captured, build to a clean functional-equivalent layout and refine against captures.
- Signage products are read-heavy on the dashboard, write-light, but realtime-critical on the device channel (screens must learn about changes fast and survive network drops via offline cache).

## Constraints

- **Tech stack**: Next.js (App Router) + Supabase (Auth, Postgres, Storage, Realtime) + Vercel — chosen for integrated auth/db/storage/realtime and fast deploy
- **Player runtime**: Web-kiosk PWA in v1 (any browser / smart TV / Chromecast), offline-capable
- **Fidelity**: High — match both visuals and functionality of the original as closely as practical (pending design-reference capture)
- **Tenancy**: Multi-tenant with Postgres Row-Level Security enforcing org isolation
- **Legal**: Clean-room functional equivalent; no proprietary Intelisa assets or code reproduced

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase as backend | Auth + Postgres + Storage + Realtime in one; Realtime fits screen push/heartbeat | — Pending |
| Web-kiosk PWA player before native Android TV | Fastest path to content-on-screen; runs broadly; native deferred to v2 | — Pending |
| Next.js App Router on Vercel | First-class Supabase support, server actions, easy deploy | — Pending |
| Clean-room equivalent, not literal copy | Avoid IP issues; capture visuals as reference only | — Pending |
| Comprehensive depth, sequential execution, YOLO mode | User wants full platform but token-conscious | — Pending |

---
*Last updated: 2026-06-28 after initialization*
