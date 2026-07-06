# ashwanth — Floating Support (Backend + Frontend)

**Branch:** `ashwanth`
**Role:** Support — you don't own a fixed feature area this round. You jump in wherever the team is blocked or behind.

## How this works
- Check in daily with the team (see `tasks/COORDINATION.md` for the dependency chain) and ask who's stuck or furthest behind.
- Early in the milestone, the **backend side** (harshitha, srinitha, abhinaya) is the critical path — almost everything the frontend side (manaswini, soumya) builds depends on their tables/columns existing. Lean backend-heavy in the first few days: help get migrations pushed fast, especially:
  - harshitha's `franchises`/`advertisers`/`ads`/roles tables
  - abhinaya's `screens` metadata columns + `screen_locations`/`screen_status_log` tables
- Once the schema is in decent shape, shift toward whichever frontend piece is behind — likely manaswini's dashboards (there are three of them, that's a lot for one person) or soumya's screen/media UI.

## Ground rules
- Don't start new scope of your own — always pick up from someone else's `-TASKS.md` file so there's no duplicate/conflicting work. Coordinate in the group before touching a file someone else is mid-way through.
- If you finish a piece someone else started, hand it back clearly (what you changed, what's left) so they're not confused pulling your commits.
- Push to `ashwanth` branch as normal, but note in your commit message whose task you were helping with (e.g. "ashwanth: help harshitha - franchises RLS policies").

## Deliverable
No fixed deliverable — your job is unblocking whoever's behind. Check `tasks/COORDINATION.md` and the group chat daily to know where to go next.
