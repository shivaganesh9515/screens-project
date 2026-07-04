# Tech Stack

## Frontend
- **Next.js 16** (App Router) — `app/` directory
- **React 19** — client and server components
- **TypeScript** — strict mode
- **Tailwind CSS 4** — utility-first styling
- **shadcn/ui** — component library (Button, Input, Select, Dialog, etc.)
- **@dnd-kit** — drag and drop (used in playlist builder)
- **FullCalendar** — schedule calendar UI
- **Lucide React** — icons
- **Sonner** — toast notifications

## Backend
- **Supabase** — database, auth, storage, RLS
- **PostgreSQL** — via Supabase
- **Row Level Security (RLS)** — org-isolation policies on all tables

## File Structure
```
app/
├── (auth)/           # Login, signup, reset-password
├── (app)/            # Main dashboard (requires auth)
│   ├── overview/     # Dashboard home page
│   ├── screens/      # Screen management
│   ├── media/        # Media upload + grid
│   ├── playlists/    # Playlist builder
│   ├── templates/    # Zone templates
│   ├── schedule/     # Schedule calendar
│   ├── analytics/    # Analytics dashboard
│   └── settings/     # Org settings, team, billing
├── player/           # Player app (runs on physical screens)
└── api/              # API routes
lib/
├── supabase/
│   ├── client.ts     # Browser Supabase client (falls back to mock)
│   ├── server.ts     # Server Supabase client (falls back to mock)
│   ├── mock-client.ts # In-memory mock when no real credentials
│   └── mock-data.ts  # Seed data for mock mode
├── types/
│   └── database.ts   # TypeScript types for all tables
components/
├── ui/               # shadcn/ui components
└── ...               # Feature-specific components
supabase/
└── migrations/
    └── 00001_schema.sql  # Database schema (source of truth)
tasks/
├── README.md         # Project overview
├── COORDINATION.md   # Who does what, dependencies
├── harshitha-TASKS.md
├── srinitha-TASKS.md
└── abhinya-TASKS.md
```

## Environment Variables
```bash
# .env.local (currently blank — using mock client)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Git Branches
- `master` — production branch, never push directly
- `harshitha` — DB, screens, schedules, player
- `srinitha` — Auth, media, analytics
- `abhinya` — Dashboard, playlists, templates, settings

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
```
