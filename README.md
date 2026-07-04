# Screens Website

Ad management system for screens installed in buses and autos. See `tasks/README.md` for the product overview and `tasks/COORDINATION.md` for who's building what.

## How to Run

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

You can leave the Supabase keys **blank** — the app automatically falls back to an in-memory mock Supabase client (see `lib/supabase/mock-client.ts`) so you can run and develop the full UI without a real database. This is the fastest way to get started.

To connect a real Supabase project instead, fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (get these from your project's Settings → API page), then run the schema migration in `supabase/migrations/00001_schema.sql` against it.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pages auto-reload as you edit.

### Other scripts

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## Project Structure

- `app/(app)/` — main authenticated app pages (overview, screens, schedule, etc.)
- `app/auth/` — auth routes
- `app/player/` — the player app that runs on the physical screens
- `app/api/` — API routes (screen pairing, heartbeat, media upload, play logs)
- `components/` — shared UI (`components/ui/` is shadcn-based)
- `lib/supabase/` — Supabase client, server client, and the mock client used for local dev
- `supabase/migrations/` — SQL schema

## Note on Next.js version

This repo uses a newer/pre-release Next.js. Read `AGENTS.md` before making changes — it flags that some conventions here differ from what you may expect from prior Next.js versions (e.g. `middleware.ts` is being deprecated in favor of `proxy.ts`; the running dev server already warns about this).
