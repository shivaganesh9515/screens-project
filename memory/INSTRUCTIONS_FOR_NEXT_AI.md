# 🧠 Memory System — Instructions for the Next AI

> **Read this FIRST before doing anything else.**  
> This folder is designed so any AI model can pick up the project mid-stream with zero context loss.

---

## 📋 How to Get Oriented (read in this order)

1. **`INSTRUCTIONS_FOR_NEXT_AI.md`** ← You are here. This tells you how the memory system works.
2. **`PROJECT_STATE.md`** — Everything about the project: architecture, completed work, team tasks, gaps. Read this first.
3. **`SESSION_LOG.md`** — The running log of every session and what was done in each. Start from the bottom (most recent).
4. **`NEXT_STEPS.md`** — The current priority list and what was actively being worked on when the last session ended.

> Also check: `CLAUDE.md` and `AGENTS.md` at the project root — they may have important runtime constraints about the Next.js version.

---

## 🔄 This Memory System

The `memory/` folder is **the single source of truth** for project continuity. Every session MUST:

### ✅ Before making changes:  
1. Read the latest `PROJECT_STATE.md` — for context on the codebase
2. Read `NEXT_STEPS.md` — to know what's currently being worked on
3. Read the most recent entry in `SESSION_LOG.md` — to know what was just done
4. Read the relevant source files you plan to change

### ✅ After making changes:  
1. **Update `SESSION_LOG.md`** — Add a new entry at the top with today's date and:
   - What changes were made (files modified, features built, bugs fixed)
   - Any problems encountered  
   - Current state of the branch (committed, uncommitted, etc.)
2. **Update `NEXT_STEPS.md`** — Refresh the priority list based on what was just completed
3. **Update `PROJECT_STATE.md`** — If you completed a major task, changed status, or discovered new gaps, update the relevant sections
4. **Update `CLAUDE.md` / `AGENTS.md`** if needed — Only if there are new AI-relevant constraints

### ⚠️ Golden Rule
> **The `memory/` folder must always reflect reality.**  
> If you build something, log it. If you find a bug, log it. If priorities change, update `NEXT_STEPS.md`.  
> Future-you (or future-AI) will thank you.

---

## 🏗 Project Quick Facts (cheatsheet)

| Item | Info |
|------|------|
| **Project** | Digital signage SaaS (Intelisa clone) |
| **Stack** | Next.js 15 + Supabase + Tailwind 4 + shadcn/ui |
| **Root dir** | `wps_download/screens-project/` |
| **Branch** | Currently `master` (others: `abhinya`, `harshitha`, `srinitha`) |
| **Supabase** | Local instance running on `localhost:54321`, schema in `supabase/migrations/00001_schema.sql` (consolidated), `.env.local` configured |
| **State** | Most UI is built. Connected to local Supabase. Key gap: player playback |
| **Team** | harshitha (DB/screens/schedules/player), srinitha (auth/media/analytics), abhinya (dashboard/playlists/templates/settings) |

---

## 💡 Tips for the New AI

1. **Local Supabase** — running on `localhost:54321`. Start with `supabase stop` then `supabase start`. Use Studio at `http://127.0.0.1:54323` to browse data.
2. **Server Components first** — Data-heavy pages fetch Supabase directly in server components. Don't rewrite them as client components.
3. **shadcn/ui only** — Don't mix in other component libraries (Material, Chakra, etc.).
4. **Zone dimensions are percentages** — Always `x%, y%, w%, h%`, never pixels.
5. **Check the tasks/** folder for detailed per-person task files with exact file paths and known bugs.
6. **Run `npm run dev` to start**, open `http://localhost:3000` to test.
