# Features Research: Digital Signage SaaS

## Table Stakes (users expect these — missing = users leave)

### Authentication & Multi-Tenancy
- Email/password login + session persistence
- Organization-scoped accounts (one org per subscription)
- Role-based access: Admin (full control), Editor (content/schedule), Viewer (read-only)
- Password reset via email

### Screen / Device Management
- Screen registration via pairing code (code displayed on player → entered in dashboard)
- Screen list with online/offline status (last-seen heartbeat)
- Screen name, location/group tagging
- Screen detail view: current content, last heartbeat, group membership
- Screen groups for bulk assignment

### Media Library
- Upload images (JPG, PNG, GIF, WebP) and videos (MP4 H.264)
- Thumbnail preview (auto-generated poster for video)
- File name, size, duration (video) display
- Delete media (with usage check — warn if used in active playlist)
- Folder / tag organization

### Playlists
- Create named playlist from media items
- Set per-item duration (images); video plays to end or loops
- Reorder items via drag-and-drop
- Assign playlist to screen(s) or group(s)

### Scheduling
- Default (always-on) playlist per screen/group
- Time-based overrides: play different playlist on specific dates/times
- Repeat rules: daily, weekly, custom day-of-week
- Conflict resolution: more specific rule wins (screen > group, time-range > default)

### Overview Dashboard
- Total screens / online / offline counts
- Active content per screen (what's playing now)
- Recently added media
- Upcoming scheduled changes
- Quick-action shortcuts

### Player
- Fullscreen content loop (no browser chrome visible)
- Smooth transition between items
- Offline fallback: last-known schedule plays from cache
- Auto-reconnect on network restore and resume latest schedule
- Heartbeat every 30s with online status report

## Differentiators (competitive advantage — nice to have in v1)

### Multi-Zone Layouts / Templates
- Split screen into zones (e.g. main content + ticker + sidebar)
- Per-zone playlist assignment
- Template library (preset zone arrangements: full screen, L-bar, split horizontal, PiP)
- Zone-level scheduling (different content per zone)

### Real-Time Push
- Content/schedule changes delivered to screens in <5 seconds (not polling)
- "Send to screen now" emergency override button
- Live preview: see what any screen is displaying right now

### Analytics & Playback Proof
- Play log: which item played, on which screen, for how long
- Impression count per media item
- Screen uptime % over period
- Export report (CSV)

### Playback Proof of Play
- Screenshot / thumbnail capture at random intervals (evidence for advertisers)
- Proof-of-play PDF report

## Anti-Features (deliberately exclude)

- **Built-in content editor** — Users create content in Canva/Adobe; we're a distribution platform, not a design tool. Adding an editor is a product pivot.
- **Social media auto-pull** (posting live tweets to screens) — real-time API rate limits + content moderation complexity; v2 at earliest
- **Audio/music scheduling** — opens licensing can of worms; exclude
- **Hardware sales / device management** (remote OS control, firmware OTA) — out of software scope
- **Real-time chat between org members** — not signage-relevant

## Feature Complexity Notes

| Feature | Complexity | Dependency |
|---------|-----------|-----------|
| Auth + orgs | Medium | Foundation for everything |
| Screen pairing | Medium | Requires Supabase Realtime + Edge Function |
| Media upload + thumbnails | Medium | Supabase Storage + video frame extraction |
| Playlist builder (drag-drop) | Medium | @dnd-kit |
| Multi-zone templates | High | Canvas-like zone editor, complex state |
| Scheduling / dayparting | High | Time rule engine, conflict resolution logic |
| PWA player (offline) | High | Service worker, Cache API, Workbox |
| Real-time push | Medium | Supabase Realtime channels |
| Analytics / proof of play | Medium | Play log insert from player, aggregation query |
