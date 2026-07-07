# Team Coordination — Franchise/Advertiser Milestone

This is a new, bigger milestone on top of the existing screens/playlists/schedules/media/templates engine (which is done and merged into `master`). It adds a 3-tier structure: **main admin** (whole platform) → **franchise** (a territory, the "all-rounder") → **advertiser** (only sees their own ads, can target multiple franchises).

## Team Structure

**Backend (schema, APIs, RLS, business logic):**

| Person | Branch | Owns |
|--------|--------|------|
| **harshitha** | `harshitha` | `franchises`/`advertisers`/`ads` tables, roles, two-tier approval workflow logic |
| **srinitha** | `srinitha` | Media (orientation, live-link) backend, playlist repeat-count, screensaver setting |
| **abhinaya** | `abhinaya` | `screens` metadata columns, GPS table, screen status history, analytics queries |

**Frontend (all UI):**

| Person | Branch | Owns |
|--------|--------|------|
| **soumya** | `soumya` | Screen registration UI, media upload UI, playlist builder UI, screensaver/invite settings UI |
| **manaswini** | `manaswini` | Live map, GPS display, role-based routing, all 3 dashboards (main admin/franchise/advertiser) |

**Floating support:**

| Person | Branch | Owns |
|--------|--------|------|
| **ashwanth** | `ashwanth` | No fixed area — jumps in wherever backend or frontend is blocked/behind, starting backend-heavy since that's the critical path |

Full task breakdown for each person is in `tasks/<name>-TASKS.md`.

## Real Dependency Chain

1. **Backend unblocks frontend.** Almost everything soumya and manaswini build needs a real column/table from harshitha, srinitha, or abhinaya first. Backend should push early/rough rather than wait for polish.
2. **harshitha's `franchises`/`advertisers`/`ads`/roles** is the biggest single unlock — manaswini's dashboards and role-based routing can't really start without it.
3. **abhinaya's `screens` metadata + GPS tables** unblock soumya's screen registration form and manaswini's live map.
4. **srinitha's media/playlist backend** unblocks soumya's media/playlist UI.
5. **manaswini's dashboards are the biggest frontend chunk** (three dashboards + map + GPS + routing) — soumya has comparatively less, so soumya should help manaswini once her own screen/media UI tasks are done. ashwanth should also lean frontend/manaswini once the schema is stable.

## What to Do If Blocked

| Problem | Do This |
|---------|---------|
| Need a column/table that doesn't exist yet | Check `memory/SCHEMA-REFERENCE.md` first; if genuinely missing, flag it in the group rather than guessing a name |
| Not sure what to build | Read your `-TASKS.md` file — exact file paths and field names are listed |
| Falling behind / need help | Say so in the group — ashwanth (and anyone with slack) reassigns to help |
| Git conflict | Tell the team lead |

## Git Rules

- Work ONLY on your own branch
- NEVER push to master
- Push with: `git push origin <your-branch>`
- Pull `master` first before branching off, so you start from the latest merged state
- Update `memory/SCHEMA-REFERENCE.md` whenever you add a table/column so nobody downstream guesses names
