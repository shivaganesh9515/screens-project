# Screens Project — Simple Overview

## What Are We Building?

A digital signage system for screens installed in **buses and autos**. An org uploads media (images/videos), groups them into **playlists**, optionally arranges playlists into **zone templates** (split-screen layouts where each region plays its own playlist), and **schedules** a playlist or template onto a screen or a group of screens for a time window (or as the always-on default). Each physical screen runs a **player app** that pairs with a code, figures out what it should be showing right now, plays it, and logs every play to `play_logs` for reporting.

This is **not** an ad-approval marketplace — there's no advertiser/franchise roles, no ad creation/approval workflow, and no GPS tracking. Everyone in the org (scoped by `role`: admin/editor/viewer on `org_members`) can manage screens, media, playlists, templates, and schedules, subject to their role.

## Core Concepts (real schema — see `supabase/migrations/00001_schema.sql` and `lib/types/database.ts`)

- **org / org_members** — every screen, media item, playlist, template, and schedule belongs to an `org`. There's no separate `users` table — `auth.users` (Supabase Auth) is the source of truth for accounts, and `org_members` links a user to an org with a role.
- **screens / screen_groups** — a screen is a physical device (or a browser tab acting as one). It pairs via a 6-character `pairing_code` that expires in 10 minutes, then reports `last_seen`/`is_online` via a heartbeat. Screens can be grouped (`screen_groups`) so a schedule can target many screens at once.
- **media_items** — an uploaded image or video (`type: 'image' | 'video'` only — no live-stream URLs, no portrait/landscape flag). Has `storage_path`/`thumbnail_path` (Supabase Storage), `duration_ms`, `folder`, `tags[]`.
- **playlists / playlist_items** — an ordered list of media items, each with its own `duration_ms` (how long it shows before advancing). Add the same media item multiple times if you want it to repeat more often — there's no separate "play count" field.
- **templates** — a zone layout: `zones` is a JSON array of `{id, x, y, w, h, playlist_id}` — each zone is a rectangle (as percentages of the screen) bound to a playlist that loops inside it. Good for split-screen layouts (e.g. a big video zone + a small ticker zone).
- **schedules** — the thing that actually says "play X on screen/group Y, starting at Z." Targets either a single `screen_id` or a whole `group_id`; plays either a `playlist_id` or a `template_id`; can be a one-off window (`start_at`/`end_at`), a recurring window (`recurrence` JSON: days of week + daily time range), or the always-on fallback (`is_default = true`) when nothing else matches. `priority` breaks ties when more than one schedule could apply at once.
- **play_logs** — one row per media item actually played on a screen (`screen_id`, `media_item_id`, `playlist_id`, `started_at`, `ended_at`, `duration_ms`). This is what analytics/reporting reads.

## How It Works (real flow)

```
1. Someone with access adds a screen in the dashboard → gets a 6-character pairing code (expires in 10 min)
2. The physical screen (or a browser at /player/[token]) enters that code → screen is paired
3. The paired screen sends a heartbeat every ~30s (last_seen, is_online)
4. Someone builds a playlist (media + order + duration) and, optionally, a zone template (playlist per zone)
5. Someone creates a schedule: this playlist/template plays on this screen/group, now or on a recurring window, or as the default
6. The player figures out which schedule currently applies (highest-priority match, else the default) and plays it
7. The player logs each play to play_logs
8. Analytics reads play_logs + screens to show impressions, play time, uptime, per-media/per-screen breakdowns, CSV export
```

## What Each Person Owns

### harshitha
1. Database / real Supabase connection (schema is already written and DONE — she needs to wire `.env.local` to a real project)
2. Screen management: add screen, pair, screen groups, heartbeat
3. Schedules: assign a playlist/template to a screen/group, with time windows and recurrence
4. Player app: the page that runs on the actual screen — pairing, figuring out what to play, playing it, logging `play_logs`

### srinitha
1. Login system (email + password, via Supabase Auth — no custom `users` table)
2. Media upload (images/videos, folders, tags)
3. Analytics (reporting off `play_logs`, CSV export)

### abhinya
1. Dashboard home page (KPIs/charts off real screens/media/schedules/play_logs — not a map)
2. Playlists (drag-and-drop ordering + per-item duration)
3. Templates (zone layouts — building the actual zone-to-playlist editor is the single biggest remaining gap in the app)
4. Settings (org info, team members, profile)

## Files

- `harshitha-TASKS.md` — detailed status + steps for harshitha
- `srinitha-TASKS.md` — detailed status + steps for srinitha
- `abhinya-TASKS.md` — detailed status + steps for abhinya
- `COORDINATION.md` — real dependency chain, who waits for whom
