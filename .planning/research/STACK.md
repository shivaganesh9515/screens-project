# Stack Research: Digital Signage SaaS (Screens)

## Core Stack

### Dashboard (Admin App)

| Layer | Choice | Version | Confidence |
|-------|--------|---------|-----------|
| Framework | Next.js (App Router) | 15.x | High |
| Language | TypeScript | 5.x | High |
| UI components | shadcn/ui | latest | High |
| Styling | Tailwind CSS | 4.x | High |
| State (server) | Next.js Server Actions + React Query (TanStack Query) | RQ 5.x | High |
| State (client) | Zustand (light global) | 5.x | Medium |
| Forms | React Hook Form + Zod | RHF 7, Zod 3 | High |
| Drag & drop (playlists / zones) | @dnd-kit/core + @dnd-kit/sortable | 6.x | High |
| Calendar / scheduling | FullCalendar (React wrapper) OR react-big-calendar | FC 6 | Medium |
| Charts / analytics | Recharts | 2.x | High |
| Date handling | date-fns | 4.x | High |
| Media upload | Supabase Storage JS client (direct-to-storage) + uppy (optional UX) | | Medium |
| Video thumbnails | Browser Canvas API (draw frame from <video>) server-side: ffmpeg via Supabase Edge Function | | High |
| Icons | Lucide React | latest | High |

### Backend

| Layer | Choice | Notes |
|-------|--------|-------|
| Auth | Supabase Auth (email/password + magic link) | SSR via @supabase/ssr |
| Database | Supabase Postgres | Row-Level Security for multi-tenancy |
| Storage | Supabase Storage | Public bucket for media assets |
| Realtime | Supabase Realtime (Postgres Changes + Broadcast) | Screen heartbeat + content push |
| Edge Functions | Supabase Edge Functions (Deno) | Thumbnail generation, pairing code logic, analytics rollup |

### Player App (Web-Kiosk PWA)

| Layer | Choice | Notes |
|-------|--------|-------|
| Runtime | Vanilla JS / minimal framework (Preact or plain TS) | Keep bundle tiny for low-spec TVs |
| PWA | Workbox (via vite-plugin-pwa) | Service worker + Cache Storage for media |
| Offline storage | Cache Storage (media files) + IndexedDB (schedule/playlist JSON) | |
| Realtime | Supabase Realtime channel subscription | Push new schedule on change |
| Video playback | HTML5 <video> (autoplay muted required on most smart TVs) | |
| Kiosk UX | Screen Wake Lock API + Fullscreen API | Browser support: Chrome/Edge/modern TV browsers |
| Heartbeat | fetch() every 30s → Supabase Edge Function → updates screens.last_seen | |
| Build tool | Vite | Fast, lightweight |

### Deploy

| Layer | Choice |
|-------|--------|
| Dashboard | Vercel (Next.js native) |
| Player PWA | Vercel (separate /player route or separate project) |
| Backend | Supabase cloud |
| CDN (media assets) | Supabase Storage CDN (built-in) |

## What NOT To Use

- **Edge Runtime for dashboard API routes** — Supabase SSR auth uses Node.js APIs; stick to Node runtime
- **Redux** — Zustand + Server Actions is sufficient; Redux adds unnecessary complexity
- **Prisma** — Supabase JS client + generated types from `supabase gen types` is cleaner for Supabase projects
- **React Native for player v1** — PWA covers 80% of screen targets faster; defer native to v2
- **Socket.io** — Supabase Realtime replaces it; don't add another WebSocket layer

## Key Library Rationale

- **@dnd-kit** over react-beautiful-dnd: maintained, accessible, works with React 19
- **FullCalendar** for scheduling: only mature React calendar with time-grid + resource views needed for dayparting
- **Recharts** over Chart.js: React-native, good TypeScript support, sufficient for signage analytics
- **Workbox** for PWA: Google-maintained, handles cache versioning and offline fallback patterns
- **shadcn/ui**: Copy-paste components (not a dependency) — easy to customise to match Intelisa's visual style

## Signage-Specific Concerns

- **Autoplay policy**: browsers block autoplay with sound. Player must use `<video muted autoplay loop>`. Never rely on audio.
- **Wake Lock**: `navigator.wakeLock.request('screen')` prevents TV screen sleep. Must be re-acquired after page visibility change.
- **Fullscreen**: `document.documentElement.requestFullscreen()` on kiosk boot. Handle escape key suppression.
- **Offline cache order**: Pre-cache next N playlist items before current one ends. Avoid mid-playback cache misses.
- **Service Worker update strategy**: Use `skipWaiting` carefully — mid-play SW update can disrupt playback. Update on idle.
