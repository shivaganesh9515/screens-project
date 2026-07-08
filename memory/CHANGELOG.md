# Changelog

## 2026-07-04

### Initial Setup
- Created GitHub repo: `shivaganesh9515/screens-project`
- Created 3 employee branches: `harshitha`, `srinitha`, `abhinya`
- Created task files in `tasks/` folder
- Added `.claude/`, `.next/`, `.planning/` to `.gitignore`

### Task Files Created
- `tasks/README.md` — project overview
- `tasks/COORDINATION.md` — who does what, dependencies
- `tasks/harshitha-TASKS.md` — DB, screens, schedules, player
- `tasks/srinitha-TASKS.md` — auth, media, analytics
- `tasks/abhinya-TASKS.md` — dashboard, playlists, templates, settings

### Memory Folder Created
- `memory/PROJECT-OVERVIEW.md` — what the product is
- `memory/TECH-STACK.md` — technologies used
- `memory/FILE-STRUCTURE.md` — complete file listing
- `memory/SCHEMA-REFERENCE.md` — database tables
- `memory/COMPONENTS.md` — component details
- `memory/API-ROUTES.md` — API route details
- `memory/HOOKS-AND-UTILITIES.md` — hooks and utilities
- `memory/BUGS-AND-FIXES.md` — known bugs
- `memory/TEAM-TASKS.md` — who owns what
- `memory/RULES.md` — git and code rules
- `memory/SESSION-LOG.md` — progress tracking
- `memory/CHANGELOG.md` — this file

### Code Changes
- Added `memory/` to `.gitignore`
- Resolved merge conflict in `app/(auth)/signup/page.tsx` (used API route version)

### Branch Status
- All branches synced at commit `6e3f947`
- Memory folder pushed to all branches
- Employees can pull and get full context

### Bugs Identified
1. `schedule-calendar.tsx:54` — `group_id` never inserted
2. `templates-list.tsx:34,42` — double JSON encoding
3. `quick-deploy-widget.tsx:43-48` — stub (no DB write)
4. `media-upload.tsx:51` — no folder/tags
5. `player/[token]/page.tsx` — no playback
6. `templates/` — no editor page
7. `signup/page.tsx` — not atomic
8. `reset-password/page.tsx` — redirect param mismatch
9. `analytics-dashboard.tsx` — groups by name
10. `analytics/page.tsx` — 2000 row cap

### Features Not Built
1. Template zone editor (abhinya)
2. Player playback loop (harshitha)

---

## Update Process

After any significant change, update this file with:
1. What was changed
2. Why it was changed
3. Who made the change
4. Any bugs found or fixed
5. Any decisions made

Also update relevant memory files:
- `SESSION-LOG.md` — add new session entry
- `BUGS-AND-FIXES.md` — add/remove/fix bugs
- `TEAM-TASKS.md` — update task status
- `COMPONENTS.md` — add/update component docs
- `API-ROUTES.md` — add/update route docs
