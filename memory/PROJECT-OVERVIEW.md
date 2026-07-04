# Project Overview — Screens Digital Signage Platform

## What Is This Product?
A cloud-based digital signage platform for managing content on screens in buses, autos, and other vehicles. Organizations upload media → build playlists → arrange into zone templates → schedule on screens → player plays content → logs everything.

**This is NOT an ad marketplace.** There are no advertisers, franchises, GPS coordinates, lat/lng, vehicle numbers, or approval workflows. It's a simple content management + playback system.

## How It Works (User Flow)
1. **Sign up** → creates an org + admin member
2. **Upload media** (images/videos) → stored in Supabase Storage
3. **Build playlists** → drag-reorder media items, set duration per item
4. **Create templates** → arrange zones (e.g., L-bar, split screen) and bind each zone to a playlist
5. **Schedule** → assign a playlist/template to a screen or group, set time window
6. **Player** → physical screen loads its assigned playlist/template, plays content in a loop
7. **Analytics** → see what played where, when, for how long

## Key Concepts
- **Org** — top-level entity. Users belong to orgs via `org_members` with roles (admin/editor/viewer)
- **Screen** — a physical device. Has a pairing code. Belongs to one org, optionally one group.
- **Media Item** — an uploaded image or video. Has folder, tags, duration.
- **Playlist** — ordered list of media items with per-item duration.
- **Template** — a layout of zones. Each zone has position (x,y,w,h) and a playlist binding.
- **Schedule** — assigns a playlist or template to a screen or group, with optional time window.
- **Play Log** — records what played on which screen, when, for how long.

## The Real Schema
All tables are in `supabase/migrations/00001_schema.sql`. The types are in `lib/types/database.ts`. These are the source of truth — NOT any task files or documentation.

## Current State
- App runs on mock Supabase client (`lib/supabase/mock-client.ts`)
- `.env.local` has blank Supabase credentials
- harshitha needs to wire real Supabase before anyone can test end-to-end
- 4 bugs confirmed, 2 features not built yet
- See `BUGS-AND-FIXES.md` for details

## Dependencies
See `package.json` for full list. Key ones:
- next@16.2.0
- react@19.2.0
- @supabase/supabase-js@2.52.1
- @fullcalendar/react@6.1.17
- @dnd-kit/core@6.3.1
- tailwindcss@4.1.11
- typescript@5.8.3
