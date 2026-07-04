# Complete File Structure

## Root Files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.ts` | Tailwind CSS config |
| `next.config.ts` | Next.js config |
| `.env.local` | Environment variables (blank = mock mode) |
| `.env.example` | Template for env vars |
| `.gitignore` | Files to ignore in git |
| `README.md` | Project documentation |
| `AGENTS.md` | AI agent instructions |

## App Directory (`app/`)

### Auth Pages (`app/(auth)/`)
| File | Purpose | Status |
|------|---------|--------|
| `layout.tsx` | Auth layout (centered card) | DONE |
| `login/page.tsx` | Email/password login | DONE |
| `signup/page.tsx` | Create account + org | DONE (uses API route) |
| `reset-password/page.tsx` | Password reset email | DONE (redirect param bug) |

### Dashboard Pages (`app/(app)/`)
| File | Purpose | Status |
|------|---------|--------|
| `layout.tsx` | Dashboard layout with sidebar | DONE |
| `overview/page.tsx` | Dashboard home (server component) | DONE |
| `overview/analytics-cards.tsx` | KPI cards (total/online/offline screens) | DONE |
| `overview/playback-activity-chart.tsx` | Play logs chart (1D/1W/1M/1Y/ALL) | DONE |
| `overview/recent-activity.tsx` | Recent play logs list | DONE |
| `overview/media-distribution-chart.tsx` | Media type breakdown | DONE |
| `overview/screen-health-chart.tsx` | Screen online/offline chart | DONE |
| `overview/top-content.tsx` | Most played content | DONE |
| `overview/recent-media.tsx` | Recently uploaded media | DONE |
| `overview/upcoming-schedules.tsx` | Upcoming schedule rules | DONE |
| `overview/screen-status-list.tsx` | Screen status list | DONE |
| `overview/smart-insights.tsx` | Computed insights | DONE |
| `overview/operational-metrics.tsx` | Storage, freshness metrics | DONE (hardcoded) |
| `overview/quick-deploy-widget.tsx` | Push content to screens | DONE (stub - no DB write) |
| `overview/quick-actions.tsx` | Quick action buttons | DONE |
| `screens/page.tsx` | Screen list (server component) | DONE |
| `screens/screens-table.tsx` | Screen table with status | DONE |
| `screens/add-screen-modal.tsx` | Add new screen | DONE |
| `screens/[id]/page.tsx` | Screen detail (server component) | DONE |
| `screens/[id]/screen-detail.tsx` | Screen detail view | DONE |
| `media/page.tsx` | Media list (server component) | DONE |
| `media/media-grid.tsx` | Media grid with filters | DONE |
| `media/media-upload.tsx` | Upload dialog | DONE (no folder/tags) |
| `playlists/page.tsx` | Playlist list (server component) | DONE |
| `playlists/playlists-list.tsx` | Playlist grid | DONE |
| `playlists/[id]/page.tsx` | Playlist detail (server component) | DONE |
| `playlists/[id]/playlist-builder.tsx` | Drag-drop playlist builder | DONE |
| `templates/page.tsx` | Template list (server component) | DONE |
| `templates/templates-list.tsx` | Template list with presets | DONE (double JSON bug) |
| `templates/[id]/page.tsx` | Template editor (server component) | DONE (just created) |
| `templates/[id]/zone-editor.tsx` | Zone editor component | DONE (just created) |
| `templates/[id]/loading.tsx` | Loading skeleton | DONE (just created) |
| `schedule/page.tsx` | Schedule list (server component) | DONE |
| `schedule/schedule-calendar.tsx` | FullCalendar schedule UI | DONE (group_id bug) |
| `analytics/page.tsx` | Analytics (server component) | DONE |
| `analytics/analytics-dashboard.tsx` | Analytics charts + CSV export | DONE |
| `settings/page.tsx` | Settings (server component) | DONE |
| `settings/settings-form.tsx` | Settings tabs (org/team/profile/billing) | DONE (logo/invite/password missing) |

### Player (`app/player/`)
| File | Purpose | Status |
|------|---------|--------|
| `[token]/page.tsx` | Player app (runs on screens) | PARTIAL (pairing works, no playback) |

### API Routes (`app/api/`)
| File | Purpose | Status |
|------|---------|--------|
| `auth/onboard/route.ts` | Signup org creation | DONE |
| `org/invite/route.ts` | Team member invite | DONE (just created) |
| `screens/heartbeat/route.ts` | Screen heartbeat | DONE |

## Library (`lib/`)

### Supabase (`lib/supabase/`)
| File | Purpose | Status |
|------|---------|--------|
| `client.ts` | Browser client (falls back to mock) | DONE |
| `server.ts` | Server client (falls back to mock) | DONE |
| `mock-client.ts` | In-memory mock when no creds | DONE |
| `mock-data.ts` | Seed data for mock mode | DONE |

### Types (`lib/types/`)
| File | Purpose | Status |
|------|---------|--------|
| `database.ts` | TypeScript types for all tables | DONE |

## Components (`components/`)

### UI (`components/ui/`)
| File | Purpose |
|------|---------|
| `button.tsx` | Button component (shadcn) |
| `input.tsx` | Input component (shadcn) |
| `label.tsx` | Label component (shadcn) |
| `select.tsx` | Select component (shadcn) |
| `dialog.tsx` | Dialog component (shadcn) |
| `badge.tsx` | Badge component (shadcn) |
| `toast.tsx` | Toast component (shadcn) |
| `section-card.tsx` | Section card wrapper |
| `empty-state.tsx` | Empty state component |

## Hooks (`hooks/`)
| File | Purpose |
|------|---------|
| `useStaggerAnimation.ts` | Stagger animation hook + StaggerWrapper |

## Database (`supabase/`)
| File | Purpose |
|------|---------|
| `migrations/00001_schema.sql` | Full database schema |
| `migrations/00002_rls_fix.sql` | RLS policy fixes |

## Tasks (`tasks/`)
| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `COORDINATION.md` | Who does what, dependencies |
| `harshitha-TASKS.md` | harshitha's tasks |
| `srinitha-TASKS.md` | srinitha's tasks |
| `abhinya-TASKS.md` | abhinya's tasks |
| `CURRENT-STATUS.md` | Current project status |

## Memory (`memory/`)
| File | Purpose |
|------|---------|
| `PROJECT-OVERVIEW.md` | What the product is |
| `TECH-STACK.md` | Technologies used |
| `FILE-STRUCTURE.md` | This file |
| `SCHEMA-REFERENCE.md` | Database tables |
| `COMPONENTS.md` | Component details |
| `API-ROUTES.md` | API route details |
| `BUGS-AND-FIXES.md` | Known bugs |
| `TEAM-TASKS.md` | Who owns what |
| `RULES.md` | Git and code rules |
| `SESSION-LOG.md` | Progress tracking |
| `CHANGELOG.md` | All changes made |
