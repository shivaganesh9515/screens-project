# Rules

## Git Rules
- Work ONLY on your branch (`harshitha`, `srinitha`, or `abhinya`)
- NEVER push to `master` directly
- Before starting work, always run:
  ```bash
  git checkout <your-branch>
  git pull origin <your-branch>
  ```
- After finishing work:
  ```bash
  git add .
  git commit -m "clear description of what you did"
  git push origin <your-branch>
  ```
- Commit messages should be descriptive: "add folder/tag fields to media upload" not "update"

## Code Rules
- **Never guess column names.** Check `supabase/migrations/00001_schema.sql` or `lib/types/database.ts` first.
- **Never insert into `users` table.** It doesn't exist. `auth.users` is the source of truth.
- **Never use `JSON.stringify()` on JSONB columns.** Supabase-js handles serialization. Stringifying first double-encodes.
- **Always use `org_id` in queries.** All tables are org-isolated via RLS.
- **Check existing patterns.** Before writing new code, look at similar files (e.g., `screen-detail.tsx` for Select patterns, `playlist-builder.tsx` for drag-drop).

## Naming Conventions
- Components: `kebab-case.tsx` (e.g., `media-upload.tsx`)
- Pages: `page.tsx` in directory (e.g., `app/(app)/media/page.tsx`)
- Server components: default export, fetch data, pass to client components
- Client components: `"use client"` at top, receive data as props

## File Locations
- Auth pages: `app/(auth)/`
- Dashboard pages: `app/(app)/`
- Player: `app/player/[token]/`
- API routes: `app/api/`
- Supabase client: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server)
- Types: `lib/types/database.ts`
- UI components: `components/ui/` (shadcn/ui)
- Schema: `supabase/migrations/00001_schema.sql`

## When Blocked
- Need real Supabase credentials? Ask harshitha
- Need to know a column name? Check schema file
- Need test data? Create through UI or check `lib/supabase/mock-data.ts`
- Git conflict? Tell the team lead
- Not sure what to build? Read your `-TASKS.md` file

## Before Merging
- All bugs in `BUGS-AND-FIXES.md` must be fixed
- Template zone editor must be built
- Player playback must work
- Test against real Supabase (not mock)
- Merge order: harshitha → srinitha → abhinya → harshitha (player)
