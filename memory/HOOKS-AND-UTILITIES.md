# Hooks and Utilities

## Hooks

### useStaggerAnimation.ts
**Purpose:** Stagger animation for list items
**Exports:**
- `useStaggerAnimation(itemCount, itemsPerRow)` — returns animation styles
- `StaggerWrapper` — wrapper component that applies stagger animation

**Usage:**
```tsx
import { StaggerWrapper } from "@/hooks/useStaggerAnimation";

{items.map((item, idx) => (
  <StaggerWrapper key={item.id} index={idx} itemsPerRow={3}>
    <div>...</div>
  </StaggerWrapper>
))}
```

## Supabase Client

### lib/supabase/client.ts
**Purpose:** Browser Supabase client with mock fallback
**Export:** `createClient()`
**Behavior:**
- If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set → real Supabase client
- Otherwise → mock client (in-memory)

### lib/supabase/server.ts
**Purpose:** Server Supabase client with mock fallback
**Export:** `createClient()`
**Behavior:** Same as browser client but for server components

### lib/supabase/mock-client.ts
**Purpose:** In-memory mock Supabase client
**Features:**
- CRUD operations on all tables
- Auth simulation (signUp, signIn, signOut)
- Storage simulation (upload, download, remove)
- RLS simulation (org isolation)
- Seed data from mock-data.ts

### lib/supabase/mock-data.ts
**Purpose:** Seed data for mock mode
**Contains:**
- 1 org ("Acme Corp")
- 2 users (admin, editor)
- 3 screens
- 5 media items
- 2 playlists
- 1 template
- 2 schedules
- Sample play_logs

## Types

### lib/types/database.ts
**Purpose:** TypeScript types for all tables
**Exports:**
- `Org`, `OrgMember`, `ScreenGroup`, `Screen`, `MediaItem`, `Playlist`, `PlaylistItem`, `Template`, `Schedule`, `PlayLog`
- `Zone` type: `{ id: string; x: number; y: number; w: number; h: number; playlist_id?: string }`
- `Json` type for JSONB columns

## Utilities

### lib/utils.ts
**Purpose:** Utility functions
**Exports:**
- `cn(...inputs)` — className merger (clsx + twMerge)

## Constants

### Preset Templates (in templates-list.tsx)
```typescript
const presets = [
  { name: "Full Screen", zones: [{ id: "z1", x: 0, y: 0, w: 100, h: 100 }] },
  { name: "L-Bar", zones: [
    { id: "z1", x: 0, y: 0, w: 100, h: 80 },
    { id: "z2", x: 0, y: 80, w: 100, h: 20 }
  ]},
  { name: "Split Horizontal", zones: [
    { id: "z1", x: 0, y: 0, w: 50, h: 100 },
    { id: "z2", x: 50, y: 0, w: 50, h: 100 }
  ]},
  { name: "Split Vertical", zones: [
    { id: "z1", x: 0, y: 0, w: 100, h: 70 },
    { id: "z2", x: 0, y: 70, w: 100, h: 30 }
  ]},
  { name: "Picture-in-Picture", zones: [
    { id: "z1", x: 0, y: 0, w: 100, h: 100 },
    { id: "z2", x: 70, y: 5, w: 25, h: 25 }
  ]}
];
```

## Middleware

### middleware.ts
**Purpose:** Auth middleware for route protection
**Behavior:**
- Mock mode: bypasses auth checks
- Real mode: checks Supabase session
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from auth pages
- Leaves `/api` and `/player` alone
