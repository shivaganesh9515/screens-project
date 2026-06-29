---
phase: 05-pages
plan: 01-07
type: execute
wave: 1
depends_on: []
files_modified:
  - app/(app)/screens/screens-table.tsx
  - app/(app)/screens/add-screen-modal.tsx
  - app/(app)/screens/page.tsx
  - app/(app)/media/media-grid.tsx
  - app/(app)/media/media-upload.tsx
  - app/(app)/media/page.tsx
  - app/(app)/playlists/playlists-list.tsx
  - app/(app)/playlists/page.tsx
  - app/(app)/playlists/[id]/playlist-builder.tsx
  - app/(app)/playlists/[id]/page.tsx
  - app/(app)/templates/templates-list.tsx
  - app/(app)/templates/page.tsx
  - app/(app)/schedule/schedule-calendar.tsx
  - app/(app)/schedule/page.tsx
  - app/(app)/analytics/analytics-dashboard.tsx
  - app/(app)/analytics/page.tsx
  - app/(app)/settings/settings-form.tsx
  - app/(app)/settings/page.tsx
  - app/(auth)/layout.tsx
  - app/(auth)/login/page.tsx
  - app/(auth)/signup/page.tsx
  - app/(auth)/reset-password/page.tsx
autonomous: true
requirements: []
user_setup: []

must_haves:
  truths:
    - "Screens table has light rows, capsule search/filter, and status pills using new tokens"
    - "Add Screen modal shows big mono pairing code in soft blue container"
    - "Media cards have 14px radius thumbnails, hover lift effect, and type badge overlay"
    - "Playlist builder uses light dnd-kit cards with grip handle and elevated drag shadow"
    - "Template preset cards show blue-zone wireframes with selected = blue ring"
    - "FullCalendar uses token-based blue events, light grid lines, rounded blocks"
    - "Analytics dashboard matches Overview KPI-card + gradient-area-chart language"
    - "Settings uses sectioned cards with capsule inputs and primary-blue save button"
    - "Auth pages have split layout: left blue-gradient brand panel, right white form card"
  artifacts:
    - path: "app/(app)/screens/screens-table.tsx"
      provides: "Restyled screens table"
    - path: "app/(app)/screens/add-screen-modal.tsx"
      provides: "Restyled pairing code modal"
    - path: "app/(app)/media/media-grid.tsx"
      provides: "Restyled media card grid"
    - path: "app/(app)/playlists/[id]/playlist-builder.tsx"
      provides: "Restyled dnd-kit playlist builder"
    - path: "app/(app)/templates/templates-list.tsx"
      provides: "Restyled template preset cards"
    - path: "app/(app)/schedule/schedule-calendar.tsx"
      provides: "Restyled FullCalendar"
    - path: "app/(app)/analytics/analytics-dashboard.tsx"
      provides: "Restyled analytics KPI + charts"
    - path: "app/(app)/settings/settings-form.tsx"
      provides: "Restyled settings form"
    - path: "app/(auth)/layout.tsx"
      provides: "Restyled auth split layout"
  key_links:
    - from: "screens-table.tsx"
      to: "globals.css @theme tokens"
      via: "Tailwind classes using --color-*, --radius-*, --shadow-card-*"
    - from: "analytics-dashboard.tsx"
      to: "globals.css --color-chart-*"
      via: "Recharts stroke/fill colors mapped to design tokens"
    - from: "schedule-calendar.tsx"
      to: "globals.css .fc overrides"
      via: "FullCalendar CSS variables in global styles"
---

<objective>
Restyle all remaining dashboard pages per Section 4 of UI_REDESIGN_PLAN.md — screens, media, playlists, templates, schedule, analytics, settings, and auth — applying the Vella-inspired design tokens (light/airy, 14px radius, soft shadows, royal blue accent) without changing routes, data fetching, Supabase wiring, or component file names.

Purpose: Complete the UI sweep across every page to achieve visual consistency with the new design language established in phases 1-4 (tokens, shell, primitives, overview).
Output: 22 files restyled in place across 8 page groups.
</objective>

<execution_context>
@./.planning/PROJECT.md
@./.planning/config.json
@./UI_REDESIGN_PLAN.md
</execution_context>

<context>
Use these existing component/shim imports - do NOT rename or swap for alternatives:
- `@/components/ui/table` — Table, TableBody, TableCell, TableHead, TableHeader, TableRow
- `@/components/ui/badge` — Badge
- `@/components/ui/button` — Button
- `@/components/ui/input` — Input
- `@/components/ui/dialog` — Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter
- `@/components/ui/select` — Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- `@/components/ui/label` — Label
- `@/components/ui/avatar` — Avatar, AvatarFallback
- `@/components/shadcn/chart` — ChartContainer, ChartTooltip, ChartTooltipContent (for new analytics charts)
- `@/lib/utils` — cn, formatRelativeTime, formatFileSize, formatDuration
- `sonner` — toast

Design tokens already available via `globals.css` @theme:
- `bg-background` (#F8F9FA), `text-foreground` (#0F1A2E)
- `bg-card` (#FFFFFF), `text-card-foreground` (#0F1A2E)
- `border-border` (#ECEFF4), `bg-muted` (#F0F3FA), `text-muted-foreground` (#6B7394)
- `bg-primary` (#4A7CF7), `text-primary-foreground` (#FFFFFF), `bg-primary-muted` (#EEF3FF)
- `text-success` (#10B981), `text-destructive` (#F43F5E)/`text-warning` (#F59E0B)
- `shadow-card`, `shadow-card-hover`, `shadow-card-elevated`
- `rounded-xl` (0.625rem/10px), `rounded-2xl` (0.875rem/14px)
- `animate-fade-in`, `animate-slide-up`

PowerShell search commands to find token usage patterns:
```powershell
Select-String -Path "app/globals.css" -Pattern "--color-" | ForEach-Object { $_ -replace '.*(--color-[\w-]+).*', '$1' }
```
</context>

<tasks>

<!-- ==================== PLAN 01: SCREENS ==================== -->

<task type="auto">
  <name>Task 1: Restyle Screens table (screens-table.tsx)</name>
  <files>
    app/(app)/screens/screens-table.tsx
  </files>
  <action>
    Restyle the ScreensTable component per Section 4 rules — keep all data logic, state, handlers, imports intact.

    Changes to make:
    1. **Search bar**: Make it fully capsule — change `rounded-xl` to `rounded-full` on the Input, ensure it uses `bg-muted` background (not `bg-card`), `pl-10` left padding. Search icon stays.
    2. **Filter pills**: The existing toggle group (`All`/`Online`/`Offline`) already uses `rounded-xl` with `border border-border bg-card p-1`. Update the active pill to use `bg-primary text-primary-foreground` and inactive to `text-muted-foreground`. Already looks close — keep as-is.
    3. **Table container**: Currently uses `rounded-2xl border border-border bg-card shadow-card overflow-hidden`. This is already correct per the design system. Keep.
    4. **Table header row**: Change `bg-muted/50` to `bg-muted/30` for lighter header. Keep uppercase tracking header style.
    5. **Table rows**: Remove `hover:bg-muted/40` — replace with `hover:bg-muted/30 transition-colors`. Remove any `border-b` on rows if present — use `border-border` for row dividers. Rows should NOT have zebra striping — just alternating light dividers.
    6. **Name column**: Keep Link with `font-medium`, keep `ExternalLink` icon on hover.
    7. **Status pill**: Already uses Badge with `rounded-lg`. Update: online should use `border-emerald-200 bg-emerald-50 text-emerald-700` (not the current `border-success/20 bg-success/5 text-success`). Offline should use `border-red-200 bg-red-50 text-red-700`. The dot indicator stays. This makes status pills consistent with the Vella "chip" look — softer, more opaque backgrounds.
       - Online: `border-emerald-200 bg-emerald-50 text-emerald-700`
       - Offline: `border-red-200 bg-red-50 text-red-700`
    8. **Tag badges**: Change from `rounded-lg` to `rounded-full` on secondary badges for capsule look.
    9. **Delete button**: Keep as-is (rounded-lg hover state).
    10. **Empty state**: Keep existing design — already looks good with centered icon and text.
    11. **Tooltip**: Keep existing TooltipProvider wrapper.

    Do NOT change: imports, interfaces, state hooks, filter logic, delete handler, formatting functions, or any of the data-wiring.
  </action>
  <verify>
    Verify with: `npm run build` passes (no TypeScript errors). Then visually confirm:
    - Search input has `rounded-full` class (capsule shape)
    - Online status pills show emerald-200/50/700 classes
    - Offline status pills show red-200/50/700 classes
    - No zebra striping on table rows
    - Tag badges show `rounded-full`
  </verify>
  <done>
    ScreensTable renders with capsule search, lighter rows with soft dividers, emerald/red status pills, and capsule tag badges — no type errors, all data logic preserved.
  </done>
</task>

<task type="auto">
  <name>Task 2: Restyle Add Screen modal (add-screen-modal.tsx)</name>
  <files>
    app/(app)/screens/add-screen-modal.tsx
  </files>
  <action>
    Restyle the AddScreenModal component per Section 4 rules.

    Changes to make:
    1. **Dialog trigger button**: Already `rounded-xl gap-2 h-10 shadow-sm` with Plus icon. Keep.
    2. **Dialog content wrapper**: Currently `sm:max-w-md rounded-2xl`. Change to `sm:max-w-md rounded-2xl shadow-card-elevated` for elevated feel. Add `p-0 gap-0` to remove default dialog padding (let inner content handle spacing).
    3. **Header section**: Keep DialogHeader but add `px-6 pt-6 pb-2` padding. DialogTitle: keep `text-lg` but add `font-semibold`. DialogDescription: keep as-is.
    4. **Pairing code display** (the `pairingCode` branch):
       - Outer container: change from `rounded-2xl border-2 border-dashed border-primary/20 bg-primary-muted p-8 text-center` to `rounded-2xl bg-primary-muted p-8 text-center` (remove dashed border, keep the soft blue wash).
       - MonitorSmartphone icon: keep.
       - "Pairing Code" label: keep uppercase tracking style. Add `text-primary/60` color.
       - The big code itself: currently `text-5xl font-bold tracking-[0.15em] text-primary`. Change to `text-5xl font-bold tracking-[0.2em] text-primary font-mono` — add `font-mono` for monospace display. Wrap in a container with `bg-white/60 rounded-xl p-4` for contrast within the blue container.
       - "Code expires" text: keep.
       - Copy button: currently `variant="outline" w-full rounded-xl gap-2`. Keep but change to `rounded-full` for capsule shape.
    5. **Form** (no-pairing-code branch):
       - Form inputs: Already `rounded-xl h-11`. Keep. Add `rounded-full` to make them capsule-shaped? No — per Section 4, inputs are `rounded-lg` (capsule inputs). Currently `rounded-xl` which is close. Actually Section 4 says "capsule inputs" — the Input already has `rounded-xl`. Let's keep `rounded-xl` for form inputs since that's the consistent token.
       - Select triggers: Already `rounded-xl h-11`. Keep.
       - Submit button: Already `rounded-xl h-10` with loading state. Keep but change to `rounded-full` for capsule CTA shape — this aligns with the "full-width blue CTA" pattern.
       - Form footer: Keep DialogFooter default styling.
    6. **Form padding**: Wrap form contents in `px-6 pb-6`. The form currently lacks padding context from DialogContent.

    Do NOT change: state management, submit handler, copy handler, close handler, imports, API call logic, or the pairing code generation.
  </action>
  <verify>
    `npm run build` passes. Visually verify:
    - Pairing code uses `font-mono` class
    - Code container has `bg-white/60` overlay for contrast
    - Submit/Copy buttons use rounded-full
    - Layout has proper padding
  </verify>
  <done>
    AddScreenModal renders with elevated shadow, soft blue code container, monospace pairing code, capsule buttons — all data flow preserved.
  </done>
</task>

<task type="auto">
  <name>Task 3: Restyle Screens page layout (screens/page.tsx)</name>
  <files>
    app/(app)/screens/page.tsx
  </files>
  <action>
    Restyle the ScreensPage server component to match the new page-header language.

    Changes:
    1. **Page title area**: Currently has `text-2xl font-semibold tracking-tight` for h2 and `text-sm text-muted-foreground` for subtitle. Keep these — they already match the design system. The section already looks right.
    2. **Page wrapper**: `<div className="space-y-6 animate-fade-in">` — keep as-is, correct.
    3. **Screen groups sidebar**: The `<div>` wrapper for ScreenGroups currently uses `rounded-xl border border-border bg-card p-5 shadow-sm`. Change to `rounded-2xl border border-border bg-card p-6 shadow-card` — matching the new card standard (14px radius, consistent shadow, larger padding).
    4. **Layout grid**: Keep `grid gap-6 lg:grid-cols-3` with screens table in `lg:col-span-2`. The grid layout is correct.
    5. **"Add Screen" button**: The AddScreenModal is already the trigger. Keep as-is.

    Do NOT change: imports, data fetching, Supabase queries, or the component composition.
  </action>
  <verify>
    `npm run build` passes. Section header retains correct styling, screen groups card uses `rounded-2xl` and `shadow-card` with `p-6`.
  </verify>
  <done>
    Screens page layout updated with consistent card standards — no functional changes.
  </done>
</task>

<!-- ==================== PLAN 02: MEDIA ==================== -->

<task type="auto">
  <name>Task 4: Restyle Media grid (media-grid.tsx)</name>
  <files>
    app/(app)/media/media-grid.tsx
  </files>
  <action>
    Restyle the MediaGrid component per Section 4 rules.

    Changes:
    1. **Search**: Already capsule-like with `rounded-xl pl-10`. Change to `rounded-full` (capsule). Keep `bg-card` — no, use `bg-muted` for consistency with screens search. Keep `border-border`.
    2. **Filter selects**: Already `rounded-xl h-10`. Keep.
    3. **View toggle**: Already `rounded-xl border border-border bg-card p-1`. Keep. The active state already uses button variant="secondary". Fine.
    4. **Grid cards** (the `view === "grid"` branch):
       - Card wrapper: currently `rounded-2xl border border-border bg-card shadow-card`. Remove `border border-border` — let cards use soft shadow instead of border per Section 1 rule ("Cards prefer soft shadow over borders — drop border on stat/chart cards"). Add `shadow-card` (already present). Change hover from `hover:shadow-card-hover hover:border-primary/20` to just `hover:shadow-card-hover hover:-translate-y-0.5` — add a subtle lift without the border highlight. Add `transition-all duration-200`.
       - Thumbnail area (`aspect-video bg-muted relative`): Keep. The gradient overlay on hover is fine. The delete button positioning is fine.
       - **Type badge** for video: currently a Badge `variant="secondary"` at bottom-left with Film icon + duration. Restyle: make it a **chip** at bottom-left with `bg-black/60 backdrop-blur-sm text-white text-xs border-0 rounded-lg px-2 py-0.5`. Keep the Film icon and formatDuration.
       - **Type badge** for image (currently missing — add one): Add a small chip at bottom-left for images too: `bg-black/60 backdrop-blur-sm text-white text-xs border-0 rounded-lg px-2 py-0.5` with Image icon and "Image" label. Position same as video badge.
       - Card info area (`p-3.5`): Keep. The name and metadata are fine.
    5. **List view** (the `view === "list"` branch):
       - Table wrapper: already `rounded-2xl border border-border bg-card shadow-card`. Keep.
       - Header row: `bg-muted/50`. Change to `bg-muted/30` for lighter header.
       - Data rows: `border-t border-border hover:bg-muted/30 transition-colors`. Keep.
       - Type badge in list: already `variant="secondary" rounded-lg`. Keep.
    6. **Empty state**: Already looks good. Keep.

    Do NOT change: imports, state, filter logic, delete handler, view toggle logic, router, supabase, or any data wiring.
  </action>
  <verify>
    `npm run build` passes. Visually verify:
    - Grid cards have no `border` class, use `shadow-card` only
    - Cards have `hover:-translate-y-0.5` lift effect
    - Video type badge has `bg-black/60 backdrop-blur-sm` styling
    - Image items also show a type badge
    - Capsule search uses `rounded-full bg-muted`
  </verify>
  <done>
    MediaGrid renders with borderless cards, hover lift, type badges on all items, capsule search — all data logic preserved.
  </done>
</task>

<task type="auto">
  <name>Task 5: Restyle Media upload dropzone (media-upload.tsx)</name>
  <files>
    app/(app)/media/media-upload.tsx
  </files>
  <action>
    Restyle the MediaUpload (upload dialog) component per Section 4 rules.

    Changes:
    1. **Trigger button**: Already `rounded-xl gap-2 h-10 shadow-sm`. Keep.
    2. **Dialog content**: Already `sm:max-w-xl rounded-2xl`. Keep. Add `shadow-card-elevated`.
    3. **Dropzone area**: Currently uses `rounded-2xl border-2 border-dashed border-border bg-muted/30 p-14 text-center transition-all hover:border-primary/40 hover:bg-primary-muted`. 
       - Keep the structure but adjust: Change `hover:bg-primary-muted` to `hover:bg-primary-muted/50` (softer). Add `active:scale-[0.99]` (already there). 
       - Add `group` class for icon hover effects.
       - The Upload icon currently uses `text-muted-foreground/40` with hover scaling. Keep but add `group-hover:text-primary` for the icon color change on hover.
    4. **File list items**: currently `rounded-xl bg-muted/50 px-4 py-3`. Keep. Add `border border-border` for subtle separation.
    5. **Upload button**: Already `w-full rounded-xl gap-2`. Change to `rounded-full` for capsule CTA.
    
    Do NOT change: any upload logic, Supabase storage calls, thumbnail generation, drag/drop handlers, file state, or progress tracking.
  </action>
  <verify>
    `npm run build` passes. Dropzone hover state softer, upload button has `rounded-full`.
  </verify>
  <done>
    MediaUpload renders with enhanced dropzone hover, capsule upload button — all upload logic preserved.
  </done>
</task>

<task type="auto">
  <name>Task 6: Restyle Media page layout (media/page.tsx)</name>
  <files>
    app/(app)/media/page.tsx
  </files>
  <action>
    Restyle the MediaPage server component — minimal changes.

    Changes:
    1. Page wrapper: `<div className="space-y-6 animate-fade-in">` — keep.
    2. Section header: h2 with `text-2xl font-semibold tracking-tight` and subtitle with `text-sm text-muted-foreground` — keep (already matches design system).

    Do NOT change: imports, data fetching, Supabase queries.
  </action>
  <verify>
    `npm run build` passes.
  </verify>
  <done>
    Media page layout confirmed consistent with design system.
  </done>
</task>

<!-- ==================== PLAN 03: PLAYLISTS ==================== -->

<task type="auto">
  <name>Task 7: Restyle Playlists list (playlists-list.tsx)</name>
  <files>
    app/(app)/playlists/playlists-list.tsx
  </files>
  <action>
    Restyle PlaylistsList component per Section 4 rules.

    Changes:
    1. **Search**: Already has `rounded-xl pl-10 border-border bg-card`. Change to `rounded-full bg-muted` — capsule shape with muted background.
    2. **Header area**: h2 + subtitle — already correct.
    3. **Create button**: Already `rounded-xl gap-2 h-10 shadow-sm`. Keep.
    4. **Create dialog**: Already `rounded-2xl`. Keep. Form inputs already `rounded-xl h-11`. Keep. Cancel button `rounded-xl`. Change submit to `rounded-full`.
    5. **Playlist cards** (the grid):
       - Card wrapper: currently `rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-primary/20`. Remove `border border-border` and `hover:border-primary/20` — use shadow-only cards. Change hover to `hover:shadow-card-hover hover:-translate-y-0.5`.
       - Icon area: keep `rounded-xl bg-gradient-to-br from-primary/10 to-primary/5`. Fine.
       - Delete button: keep `opacity-0 group-hover:opacity-100`.
       - Name link: keep `font-semibold`. Keep `hover:text-primary`.
       - Item count: keep `text-sm text-muted-foreground`.
    6. **Empty state**: Keep — already good.
    
    Do NOT change: imports, state, create/delete handlers, router, supabase, or any data logic.
  </action>
  <verify>
    `npm run build` passes. Cards are borderless with hover lift, search is `rounded-full bg-muted`.
  </verify>
  <done>
    PlaylistsList renders with borderless cards, capsule search, hover lift — all data logic preserved.
  </done>
</task>

<task type="auto">
  <name>Task 8: Restyle Playlist builder with dnd-kit (playlist-builder.tsx)</name>
  <files>
    app/(app)/playlists/[id]/playlist-builder.tsx
  </files>
  <action>
    Restyle the PlaylistBuilder component — the dnd-kit drag-and-drop builder per Section 4 rules.

    Changes:
    1. **Top bar**: Back button + name input + actions. Keep layout.
       - Back button: keep variant ghost.
       - Name input: already `rounded-xl border-border`. Keep.
       - "Add Items" button: already `variant="outline" rounded-xl gap-2`. Keep.
       - Save button: already `rounded-xl gap-2`. Change to `rounded-full` for capsule CTA.
    2. **Add Items dialog**: Already `rounded-2xl`. Already looks good with search + media list. Keep. Change any `rounded-xl` on the media items to `rounded-lg` for consistency? They already use `rounded-xl`. Keep.
    3. **Stats row**: Badge `variant="secondary" rounded-lg` + total duration. Keep.
    4. **dnd-kit sortable items** (SortableItem component):
       - Card wrapper: currently `rounded-xl border border-border bg-card px-4 py-3.5 transition-all shadow-sm`. This is already close. Remove `border border-border` — go borderless with shadow. Change to: `rounded-xl bg-card px-4 py-3.5 shadow-sm transition-all duration-200 hover:shadow-card`. Keep the existing `isDragging` state which adds `opacity-50 shadow-lg border-primary/30`.
       - When dragging (`isDragging`): currently adds `opacity-50 shadow-lg border-primary/30`. Change to: `opacity-90 shadow-card-elevated ring-2 ring-primary/20` — elevated shadow + blue ring for the drag state.
       - Grip handle: currently `<GripVertical className="h-5 w-5" />` with `cursor-grab text-muted-foreground hover:text-foreground`. Keep. Add `hover:text-primary transition-colors` to make the grip accent on hover.
       - Media icon: Keep `rounded-xl bg-gradient-to-br from-primary/10 to-primary/5`. Fine.
       - Duration input for images: Already `rounded-lg h-8 text-xs`. Keep.
       - Remove button: Keep.
    5. **Empty state**: Keep.
    6. **Dialog media items** (the "Add Items" picker): Keep current styling. Make click feedback more visible by adding `active:scale-[0.99]`.

    Do NOT change: dnd-kit imports, sensor configuration, drag handlers, add/remove/duration logic, save handler, supabase wiring, or any state management.
  </action>
  <verify>
    `npm run build` passes. Sortable items have no border class, grip handle has `hover:text-primary`, drag state shows `shadow-card-elevated` with `ring-2 ring-primary/20`.
  </verify>
  <done>
    PlaylistBuilder renders with borderless dnd-kit cards, blue-accented grip handle, elevated drag shadow — all dnd-kit logic preserved.
  </done>
</task>

<task type="auto">
  <name>Task 9: Restyle Playlists detail + list pages (pages)</name>
  <files>
    app/(app)/playlists/page.tsx
    app/(app)/playlists/[id]/page.tsx
  </files>
  <action>
    Restyle the Playlists server page components.

    Changes:
    1. **playlists/page.tsx**: Already renders PlaylistsList directly. Add `<div className="space-y-6 animate-fade-in">` wrapper around the component call if missing (it currently returns just `<PlaylistsList ... />`). Wrap it to match other page layout patterns: 
       ```
       <div className="space-y-6 animate-fade-in">
         <div>
           <h2 className="text-2xl font-semibold tracking-tight">Playlists</h2>
           <p className="text-sm text-muted-foreground">Create and manage content playlists</p>
         </div>
         <PlaylistsList playlists={...} orgId={...} />
       </div>
       ```
       NOTE: The PlaylistsList already HAS a h2 inside it. I need to check if there's duplication. Looking at playlists-list.tsx lines 43-44: it already renders an h2. So I should NOT add a duplicate header in the page. Instead, I should remove the header from the page (currently it doesn't have one). The PlaylistsList has its own header. So keep playlists/page.tsx as-is.

    2. **playlists/[id]/page.tsx**: Already renders PlaylistBuilder inside the page. Keep as-is but add wrapping div with `space-y-6 animate-fade-in p-8` — wait, the app layout already provides padding via `max-w-7xl p-4 sm:p-6 lg:p-8`. So just keep the existing structure.

    Take-away: both page files are already fine — minimal to no changes needed since the layout container styles are handled by the app shell.
  </action>
  <verify>
    `npm run build` passes. No visual regression.
  </verify>
  <done>
    Playlist pages confirmed consistent with app shell layout.
  </done>
</task>

<!-- ==================== PLAN 04: TEMPLATES ==================== -->

<task type="auto">
  <name>Task 10: Restyle Templates list (templates-list.tsx)</name>
  <files>
    app/(app)/templates/templates-list.tsx
  </files>
  <action>
    Restyle TemplatesList component per Section 4 rules.

    Changes:
    1. **Header**: h2 + subtitle — already match design. Keep.
    2. **New Template button**: already `rounded-xl gap-2 h-10 shadow-sm`. Keep.
    3. **Create dialog**: already `sm:max-w-xl rounded-2xl`. Keep.
       - Name input: already `rounded-xl h-11`. Keep.
       - Preset grid inside dialog: currently `rounded-xl border-2 p-4` with selected state `border-primary bg-primary-muted`. Keep — this is already the "selected = blue ring" behavior. Just ensure the border width is correct.
       - Create button: already `rounded-xl`. Keep.
    4. **"Preset Layouts" section header**: currently `text-sm font-semibold uppercase tracking-wider text-muted-foreground`. Keep.
    5. **Preset cards**: 
       - Card wrapper: currently `rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover`. Remove `border border-border` for borderless cards. Change hover to `hover:shadow-card-hover hover:-translate-y-0.5`.
       - Icon + name/description section: already correct. Keep.
       - Zone wireframe container (the `aspect-video` div): currently `rounded-xl bg-muted relative overflow-hidden`. Keep.
       - Zone divs: currently `absolute border-2 border-primary/30 bg-primary/5 rounded-lg`. These are the blue outline wireframes. Make them more visible: change to `border-2 border-primary/40 bg-primary/8 rounded-lg` — slightly more opaque border, very subtle fill. On the parent card hover, make zones more prominent: the card has hover — keep.
       - The selected state in the dialog (not the card list itself) already shows `border-primary bg-primary-muted`. This is the "blue ring" for selected templates. The card list doesn't have a selection mechanism. But for the presets cards, add a selection UX: allow clicking a card to select it, showing a blue ring. Wait — the presets section currently shows "Use Template" buttons. The selection only happens in the dialog. So the standalone preset cards just show the blue wireframe. Keep as-is.
    6. **"Your Templates" section**: same card treatment — remove `border border-border`. Keep hover lift.
       - Template name + zone count: keep.
       - Delete button: keep opacity-0/group-hover pattern.
       - Zone wireframes in custom templates: currently `border-2 border-primary/30 bg-primary/5 rounded-lg`. Update to `border-2 border-primary/40 bg-primary/8 rounded-lg`.

    Do NOT change: imports, template data, create/delete handlers, preset definitions, supabase calls, or state management.
  </action>
  <verify>
    `npm run build` passes. Preset cards are borderless, zone wireframes have `border-primary/40` and `bg-primary/8`, hover produces lift.
  </verify>
  <done>
    TemplatesList renders with borderless cards, enhanced blue zone wireframes, hover lift — all template logic preserved.
  </done>
</task>

<task type="auto">
  <name>Task 11: Restyle Templates page (templates/page.tsx)</name>
  <files>
    app/(app)/templates/page.tsx
  </files>
  <action>
    Already wrapped in `<div className="animate-fade-in">`. Keep as-is — the TemplatesList component handles all header/content.
  </action>
  <verify>
    `npm run build` passes.
  </verify>
  <done>
    Templates page confirmed consistent.
  </done>
</task>

<!-- ==================== PLAN 05: SCHEDULE ==================== -->

<task type="auto">
  <name>Task 12: Restyle Schedule calendar (schedule-calendar.tsx)</name>
  <files>
    app/(app)/schedule/schedule-calendar.tsx
  </files>
  <action>
    Restyle ScheduleCalendar component per Section 4 rules.

    Changes:
    1. **Header area**: Already handled by schedule/page.tsx. In the component, the top-right "Add Schedule Rule" button already uses `rounded-xl gap-2 h-10 shadow-sm`. Keep.
    2. **Calendar card wrapper**: currently `rounded-2xl border border-border bg-card p-5 shadow-card`. Already correct. Keep.
    3. **FullCalendar event colors**: Currently events use hard-coded colors:
       - Default schedules: `#10b981` (green) — change to `#4A7CF7` (blue per design tokens).
       - Non-default: `#ff6b35` (orange) — change to `#6B95FF` (primary-light).
       - Both: change `textColor` to `#FFFFFF` (keep).
       
       Update the `events` mapping (lines 38-47):
       ```tsx
       backgroundColor: s.is_default ? "#4A7CF7" : "#6B95FF",
       borderColor: s.is_default ? "#4A7CF7" : "#6B95FF",
       ```
    4. **Schedule rules list** below the calendar:
       - Rule items: currently `rounded-xl border border-border bg-card px-5 py-3.5 transition-all hover:shadow-sm`. Remove `border border-border` and add `shadow-sm` by default (change to `shadow-sm` only, no border). Change to: `rounded-xl bg-card px-5 py-3.5 shadow-sm transition-all duration-200 hover:shadow-card`.
       - Badge variant: keep — `is_default ? "secondary" : "default"`. The default variant uses primary blue, which is correct.
    5. **Empty state**: Keep.
    6. **Add Schedule dialog**: Already `rounded-2xl`. Form selects already `rounded-xl h-11`. Keep. Submit button: change from `rounded-xl h-11` to `rounded-full h-11` for capsule CTA. Date inputs: currently `rounded-xl h-11`. Keep — change to `rounded-full`? No, datetime-local inputs should stay rounded-xl.
    
    Also update the calendar card to NOT have a border — remove `border border-border` from the FullCalendar wrapper div, keeping only `rounded-2xl bg-card p-5 shadow-card`.

    The FullCalendar CSS overrides in globals.css are already good (applied in Phase 1). The current overrides have:
    - `--fc-event-bg-color: #4A7CF7` (already blue)  
    - `--fc-event-border-color: #4A7CF7`
    - `border-radius: 6px` for events
    - Light grid lines from `--fc-border-color: #E4E9F2`
    
    Keep these globals.css overrides — they're already correct. The main fix is the hardcoded inline colors in the component's events mapping.

    Do NOT change: imports, state, schedule CRUD handlers, FullCalendar plugins/config, dialog form logic, supabase calls.
  </action>
  <verify>
    `npm run build` passes. Calendar events use `#4A7CF7` (default) and `#6B95FF` (scheduled). Rule list cards are borderless with hover shadow. Submit button uses `rounded-full`.
  </verify>
  <done>
    ScheduleCalendar renders with token-blue events, borderless rule cards, capsule submit — all schedule logic preserved.
  </done>
</task>

<task type="auto">
  <name>Task 13: Restyle Schedule page (schedule/page.tsx)</name>
  <files>
    app/(app)/schedule/page.tsx
  </files>
  <action>
    Keep as-is. The page already has `<div className="space-y-6 animate-fade-in">` wrapper with h2 section header that matches the design system.
  </action>
  <verify>
    `npm run build` passes.
  </verify>
  <done>
    Schedule page confirmed consistent.
  </done>
</task>

<!-- ==================== PLAN 06: ANALYTICS ==================== -->

<task type="auto">
  <name>Task 14: Restyle Analytics dashboard (analytics-dashboard.tsx)</name>
  <files>
    app/(app)/analytics/analytics-dashboard.tsx
  </files>
  <action>
    Restyle the AnalyticsDashboard component — the heaviest page. Per Section 4: "Same KPI-card + gradient-area-chart language as Overview. Recharts restyle: thin axes, slate labels, blue/emerald series, soft grid."

    Changes:

    **A. COLORS object (lines 53-62)** — Replace the entire COLORS object:
    ```tsx
    const COLORS = {
      primary: "#4A7CF7",
      success: "#10B981",
      warning: "#F59E0B",
      destructive: "#F43F5E",
      purple: "#A78BFA",
      blue: "#6B95FF",
      pink: "#EC4899",
      teal: "#14B8A6",
    };
    ```
    Key changes: primary from `#ff6b35` → `#4A7CF7`, destructive from `#ef4444` → `#F43F5E`, purple from `#8b5cf6` → `#A78BFA`, blue from `#3b82f6` → `#6B95FF`.

    **B. Stats/KPI cards (lines 223-258)** — Update to match Overview KPI cards:
    - The `stats` array defines 4 KPI cards. Each has `color` and `bg` fields. Update:
      - Total Impressions: `color: "#4A7CF7", bg: "bg-primary-muted"` (blue)
      - Total Play Time: `color: "#10B981", bg: "bg-emerald-50"` (emerald)
      - Active Screens: `color: "#F59E0B", bg: "bg-amber-50"` (amber)
      - Avg. Duration: `color: "#A78BFA", bg: "bg-purple-50"` (purple)
    - The KPI card rendering (lines 334-372): currently uses `rounded-2xl border border-border bg-card p-5 shadow-card`. Remove `border border-border` — use shadow-only cards matching the design. Change to: `rounded-2xl bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5`.
    - Icon container: currently `rounded-xl ${card.bg} p-3`. Keep but ensure bg values match new colors.
    - Icon color: uses `style={{ color: card.color }}`. Keep.

    **C. Filter bar (lines 263-330)**:
    - Currently `rounded-2xl border border-border bg-card p-4 shadow-sm`. Remove `border border-border` — use shadow-only. Keep `shadow-sm`.
    - View toggle buttons: keep the existing toggle UI. The active pill style uses `bg-primary text-primary-foreground shadow-sm` — correct.

    **D. Playback Trend Chart (lines 378-439)** — Restyle to match the Overview gradient area chart language:
    - Chart card: currently `rounded-2xl border border-border bg-card p-5 shadow-card`. Remove `border border-border`.
    - Gradient: currently uses `COLORS.primary` (which is now `#4A7CF7`). The gradient def `trendGradient` needs to use the updated COLORS.primary. Keep the gradient definition — it'll automatically use the new blue.
    - Axes: Currently `tick={{ fontSize: 11, fill: "#64748b" }}`. Keep — this is slate, matches design.
    - Grid: `CartesianGrid strokeDasharray="3 3" stroke="#e8ecf4"` — keep. Matches soft grid.
    - Area: `stroke={COLORS.primary} strokeWidth={2.5}` — keep, now blue.

    **E. Top Media bar chart (lines 445-493)**:
    - Card: remove `border border-border`.
    - Bars: currently use `fill={entry.type === "image" ? COLORS.primary : COLORS.purple}`. Now primary is blue, purple is A78BFA. Keep.
    - Bar radius: `radius={[0, 4, 4, 0]}`. Keep.

    **F. Screen Performance bar chart (lines 496-548)**:
    - Card: remove `border border-border`.
    - Bars: currently use `fill={entry.uptime ? COLORS.success : COLORS.destructive}`. Now success is emerald, destructive is coral. Keep.

    **G. Content Type Distribution pie chart (lines 555-599)**:
    - Card: remove `border border-border`.
    - Pie colors: currently `name === "image" ? COLORS.primary : COLORS.purple`. Now blue and purple. Keep.

    **H. Daily Play Time area chart (lines 602-649)**:
    - Card: remove `border border-border`.
    - Gradient: uses `COLORS.purple` (now A78BFA). Keep.

    **I. Play Log table (lines 655-734)**:
    - Table wrapper: currently `rounded-2xl border border-border bg-card shadow-card overflow-hidden`. Remove `border border-border`.
    - Header row: `bg-muted/50`. Change to `bg-muted/30`.
    - Data rows: `border-t border-border hover:bg-muted/30 transition-colors`. Keep.

    **J. Chart tooltip styles** — Update all inline `contentStyle` objects:
    Currently each chart has inline tooltip style:
    ```tsx
    contentStyle={{
      borderRadius: "10px",
      border: "1px solid #e8ecf4",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      fontSize: "13px",
    }}
    ```
    These are already decent. Update border color to `#ECEFF4` (the design token). And update boxShadow to match: `boxShadow: "0 4px 12px rgba(16,26,46,0.06)"`.

    Do NOT change: imports, state, date/screen filters, memoized calculations, CSV export logic, any data logic, or the component function signature.
  </action>
  <verify>
    `npm run build` passes. Verify:
    - KPI cards are borderless with hover lift (`hover:-translate-y-0.5`)
    - All chart cards are borderless
    - KPI colors updated to blue/emerald/amber/purple palette
    - COLORS.primary changed from orange to `#4A7CF7`
    - Play Log table header uses `bg-muted/30`
    - Tooltip border colors use `#ECEFF4`
  </verify>
  <done>
    AnalyticsDashboard renders with borderless shadow cards, updated blue/emerald chart palette, hover-lift KPI cards, lighter table header — all analytics data logic preserved.
  </done>
</task>

<task type="auto">
  <name>Task 15: Restyle Analytics page (analytics/page.tsx)</name>
  <files>
    app/(app)/analytics/page.tsx
  </files>
  <action>
    Keep as-is. The page already has correct `<div className="space-y-6 animate-fade-in">` wrapper with section header matching the design system.
  </action>
  <verify>
    `npm run build` passes.
  </verify>
  <done>
    Analytics page confirmed consistent.
  </done>
</task>

<!-- ==================== PLAN 07: SETTINGS + AUTH ==================== -->

<task type="auto">
  <name>Task 16: Restyle Settings form (settings-form.tsx)</name>
  <files>
    app/(app)/settings/settings-form.tsx
    app/(app)/settings/page.tsx
  </files>
  <action>
    Restyle SettingsForm component per Section 4 rules: "Sectioned cards, capsule inputs, labels slate, save = primary blue."

    Changes in `settings-form.tsx`:

    1. **Section cards** (the outer cards wrapping each section):
       - Currently: `rounded-2xl border border-border bg-card p-6 shadow-card`.
       - Remove `border border-border` — use shadow-only cards.
       - Change to: `rounded-2xl bg-card p-6 shadow-card transition-all duration-200 hover:shadow-card-hover`.

    2. **Section header** (icon + title):
       - Currently: `rounded-xl bg-gradient-to-br from-primary/10 to-primary/5` for the icon container. Keep.
       - Title: `font-semibold text-foreground`. Keep.

    3. **Form inputs** — Update THE ENTIRE `sections` array:
       - Input fields (`Organization Name`, `Timezone`, `Slug`): currently `rounded-xl h-11`. Change to `rounded-lg h-11` — per Section 4, settings uses capsule/rounded-lg inputs specifically. Keep the disabled state and other classes.
       - The disabled inputs (Slug, Email, Role): keep `text-muted-foreground`.
       - Save button (`Organization` section): currently `rounded-xl h-10`. Change to `rounded-full h-10` for capsule CTA.
       - Invite form inputs: email input `rounded-xl h-11` → `rounded-lg h-11`. Role select `rounded-xl h-11` → `rounded-lg h-11`. Invite button: currently `rounded-xl h-11` → `rounded-full h-11`.
       - Upgrade Plan button (`Billing`): currently `rounded-xl h-11 border-border`. Change to `rounded-full h-11 border-border` for capsule shape.

    4. **Team member rows**:
       - Currently `rounded-xl bg-muted/50 px-4 py-3.5`. Keep. Add `border border-border` for subtle separation? No — let's keep borderless. Just adjust to `rounded-xl bg-muted/30 px-4 py-3.5` for a lighter row.
       - Avatar: already `bg-primary-muted text-primary text-xs font-semibold`. Keep.
       - Role badge: already `rounded-lg`. Keep.

    5. **Current plan box** (Billing section):
       - Currently `rounded-xl bg-muted/50 px-5 py-4`. Keep.

    6. **Settings page** (settings/page.tsx): Keep as-is — already has correct `<div className="space-y-6 animate-fade-in">` wrapper with h2 section header.

    Do NOT change: imports, state, save/invite/remove handlers, sections structure, supabase calls, router, or any data logic.
  </action>
  <verify>
    `npm run build` passes. Verify:
    - Section cards are borderless with shadow
    - Inputs use `rounded-lg` (capsule)
    - Save and Invite buttons use `rounded-full`
    - Team member rows use `bg-muted/30`
  </verify>
  <done>
    SettingsForm renders with borderless sectioned cards, capsule inputs, primary-blue CTA buttons — all settings logic preserved.
  </done>
</task>

<task type="auto">
  <name>Task 17: Restyle Auth layout (auth/layout.tsx)</name>
  <files>
    app/(auth)/layout.tsx
  </files>
  <action>
    Restyle the auth layout per Section 4 rules: "Split layout: left brand panel (subtle blue gradient + logo + tagline), right white form card."

    Changes:
    1. **Left brand panel** (the `hidden w-1/2 ... lg:flex` div):
       - Currently uses: `bg-gradient-to-br from-sidebar via-[#0f1729] to-[#1a1f35]` — dark navy gradient from the OLD design.
       - Replace with: `bg-gradient-to-br from-primary/90 via-primary to-primary-dark` — blue gradient matching the new Vella-inspired light theme. The brand panel should be blue-light, not dark.
       - Full new class: `hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary/90 via-primary to-primary-dark p-12 lg:flex`
       - Text colors inside: "Welcome to Screens" h2 — change from `text-white` to `text-white` (keep — white on blue works). Subtitle p — currently `text-sidebar-foreground` which was `#8B95B5`. Change to `text-white/80`.
       - Icon container: currently `rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20`. Change to `rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg` — frosted glass look on the blue gradient. Icon (Monitor) stays white.
       - Logo mark: keep Monitor icon in the icon container. Fine.
       
    2. **Stat cards** (the 3-column grid at bottom of brand panel):
       - Currently: `rounded-xl border border-white/10 bg-white/5 px-4 py-3`.
       - Change to: `rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3` — remove border, add frosted glass.
       - Stat value: `text-lg font-bold text-white`. Keep.
       - Stat label: `text-xs text-white/60`. Change from `text-sidebar-foreground` to `text-white/60`.

    3. **Right side** (form container):
       - Currently: `<div className="flex w-full items-center justify-center bg-background p-8 lg:w-1/2">`
       - Change to white form card pattern: `<div className="flex w-full items-center justify-center p-8 lg:w-1/2">` — remove the `bg-background`. The card itself (children) will provide the white background. This makes the right side seamless.

    Do NOT change: imports, the redirect logic, or the overall layout structure.
  </action>
  <verify>
    `npm run build` passes. Brand panel uses blue gradient (`from-primary/90 via-primary to-primary-dark`), stat cards use `bg-white/10 backdrop-blur-sm`, subtitle uses `text-white/80`.
  </verify>
  <done>
    Auth layout renders with blue-gradient brand panel, frosted glass stat cards — all auth redirect logic preserved.
  </done>
</task>

<task type="auto">
  <name>Task 18: Restyle Login / Signup / Reset-password pages</name>
  <files>
    app/(auth)/login/page.tsx
    app/(auth)/signup/page.tsx
    app/(auth)/reset-password/page.tsx
  </files>
  <action>
    Restyle all three auth form pages to match: "right white form card, capsule inputs, full-width blue CTA."

    **Login page (login/page.tsx):**

    1. **Outer wrapper**: currently `w-full max-w-sm animate-fade-in`. Wrap this in a white card: change to `w-full max-w-sm animate-fade-in bg-card rounded-2xl shadow-card p-8`. This gives the form a card container.

    Wait — the right side of the auth layout no longer has `bg-background`, so the form needs its own card. Yes, this is correct.

    2. **Header section**: Keep text. Remove the mobile-only icon (the Sparkles div that shows on `sm:hidden`) — it's not needed since the brand panel handles branding.

    3. **Form inputs**: Currently `h-11 w-full rounded-xl border-border bg-white px-4 text-sm`. Change `rounded-xl` to `rounded-lg` for capsule inputs consistent with settings. Keep `border-border bg-white`. Keep focus styles (`focus:border-primary focus:ring-2 focus:ring-primary/20`).

    4. **Show/hide password button**: Keep.

    5. **Submit button**: currently `h-11 w-full rounded-xl`. Change to `h-11 w-full rounded-full` for full-width capsule CTA — "full-width blue CTA" per Section 4. Keep the primary variant.

    6. **Forgot password link**: Keep.

    7. **Divider + signup link**: Keep.

    **Signup page (signup/page.tsx):**

    1. **Outer wrapper**: Same treatment — wrap in card: change to `w-full max-w-sm animate-fade-in bg-card rounded-2xl shadow-card p-8`.

    2. **Form inputs**: Change `rounded-xl` to `rounded-lg` throughout for capsule shape.

    3. **Password strength**: Already uses colored bars and check marks. Keep styling as-is — it's functional.

    4. **Submit button**: Change from `rounded-xl` to `rounded-full`.

    5. **Existing account link**: Keep.

    **Reset-password page (reset-password/page.tsx):**

    1. **Outer wrapper**: Same — both for the form state and the "sent" state. Change to `bg-card rounded-2xl shadow-card p-8`.

    2. **Form state**:
       - Input: change `rounded-xl` to `rounded-lg`.
       - Submit: change `rounded-xl` to `rounded-full`.

    3. **Sent state**:
       - Already has centered layout with CheckCircle2 icon. Keep. The success card wrapper needs the same card treatment.

    4. **Email icon inside input**: Keep the Mail icon positioning.

    Do NOT change: imports, form state, validation, auth calls, error display, links, or any of the auth logic/routing.
  </action>
  <verify>
    `npm run build` passes. Verify:
    - Login, signup, and reset-password are wrapped in `bg-card rounded-2xl shadow-card p-8`
    - Inputs use `rounded-lg` (capsule shape)
    - Submit buttons use `rounded-full`
    - Login page no longer has `sm:hidden` Sparkles icon
  </verify>
  <done>
    Auth form pages render as white cards on the right side, capsule inputs, full-width round CTA buttons — all auth logic preserved.
  </done>
</task>

</tasks>

<verification>
Run `npm run build` and fix any TypeScript/compilation errors after all tasks complete. Each task has been designed to preserve all data logic, imports, and component APIs — build errors should be rare. If an error occurs, it's likely a missing import or Tailwind class typo.

Post-build, check each page group by searching for key class patterns:
```powershell
# Screens: status pills with new colors
Select-String -Path "app/(app)/screens/screens-table.tsx" -Pattern "border-emerald-200 bg-emerald-50"

# Media: borderless cards  
Select-String -Path "app/(app)/media/media-grid.tsx" -Pattern "hover:-translate-y-0.5"

# Analytics: COLORS object updated
Select-String -Path "app/(app)/analytics/analytics-dashboard.tsx" -Pattern "#4A7CF7"

# Auth: blue gradient brand panel
Select-String -Path "app/(auth)/layout.tsx" -Pattern "from-primary/90"
```
</verification>

<success_criteria>
- [ ] All 22 files restyled without changing routes, data fetching, Supabase wiring, or component file names
- [ ] `npm run build` passes with no errors
- [ ] Screens table has capsule search, lighter rows, emerald/red status pills
- [ ] Add Screen modal has monospace pairing code in soft blue container
- [ ] Media grid uses borderless cards with hover lift and type badges on all items
- [ ] Playlist builder items have borderless cards with blue-accented grip handle
- [ ] Templates show enhanced blue zone wireframes, borderless cards
- [ ] Schedule calendar uses blue token events, borderless rule list
- [ ] Analytics uses blue KPI cards, borderless chart cards, updated COLORS palette
- [ ] Settings uses borderless sectioned cards with capsule inputs
- [ ] Auth layout uses blue-gradient brand panel, white form card for each page
- [ ] All auth form inputs use capsule (rounded-lg) shape with round (rounded-full) CTA buttons
</success_criteria>

<output>
After completion, create `.planning/phases/phase-5-pages/05-pages-SUMMARY.md` with:
- Summary of all files modified and key changes per page group
- Any build issues encountered and fixes applied
- Visual verification notes (what to look for on each page)
</output>
