---
phase: 6-motion
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - hooks/useStaggerAnimation.ts
  - hooks/useCountUp.ts
  - app/globals.css
  - components/layout/sidebar.tsx
autonomous: true
requirements:
  - "Add `animate-slide-up` stagger mount animation to cards (40ms delay across row)"
  - "Add hover lift (`shadow-card-hover`, 150ms ease) to all card components"
  - "Add soft fade-in animation to nav active state in sidebar"
  - "Add optional count-up animation for KPI numbers"
  - "Keep motion calm (no bouncy/aggressive easing)"
must_haves:
  truths:
    - "Cards slide up smoothly when the page mounts"
    - "Cards have staggered entrance timing (40ms apart per card in a row)"
    - "Cards lift on hover with soft shadow transition (150ms ease)"
    - "Active nav item background fades in smoothly"
    - "KPI numbers optionally count up from 0 on mount"
  artifacts:
    - path: "hooks/useStaggerAnimation.ts"
      provides: "Stagger animation hook for card grids"
      min_lines: 25
    - path: "hooks/useCountUp.ts"
      provides: "Animated number count-up hook"
      min_lines: 30
    - path: "app/globals.css"
      provides: "Stagger-delay utility classes, nav transition keyframes"
      contains: "stagger"
    - path: "components/layout/sidebar.tsx"
      provides: "Nav active item with fade-in animation"
  key_links:
    - from: "hooks/useStaggerAnimation.ts"
      to: "component card grids"
      via: "import in client components"
      pattern: "useStaggerAnimation"
    - from: "hooks/useCountUp.ts"
      to: "overview-stats.tsx / analytics-cards.tsx"
      via: "import and usage in KPI card components"
      pattern: "useCountUp"
    - from: "app/globals.css"
      to: "components/layout/sidebar.tsx"
      via: "CSS animation class applied to active nav indicator"
      pattern: "animate-fade-in"
---

<objective>
Build the motion foundation for the UI — stagger animation hooks, count-up hooks, and all supporting CSS utilities. Apply nav active fade-in animation to the sidebar.

Purpose: Establish all motion primitives (hooks + CSS) that every card grid and nav element will use. No card-level motion application yet — that's Plan 2.
Output: Two hooks, updated globals.css, updated sidebar component.
</objective>

<execution_context>
@C:/Users/gunny/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/gunny/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/research/ARCHITECTURE.md
@.planning/research/STACK.md
@UI_REDESIGN_PLAN.md

Relevant existing files:
@app/globals.css — already has `animate-slide-up`, `animate-fade-in`, `animate-scale-in`, `shimmer` keyframes. Need stagger-delay utilities and nav transition CSS.
@hooks/use-mobile.ts — existing hook pattern to follow for useStaggerAnimation and useCountUp.
@components/layout/sidebar.tsx — nav items with active state, needs fade-in animation on active bg.
@lib/utils.ts — cn() utility used for class merging.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create useStaggerAnimation hook</name>
  <files>hooks/useStaggerAnimation.ts</files>
  <action>
    Create a React hook `useStaggerAnimation` that returns per-item animation props based on index and row count:

    ```ts
    import { useMemo } from "react";

    interface StaggerOptions {
      /** Index of the current item in the list */
      index: number;
      /** Items per row (used to compute column position for row-based stagger) */
      itemsPerRow?: number;
      /** Delay between each item in ms (default: 40) */
      baseDelay?: number;
      /** Animation duration in ms (default: 350, matches CSS slide-up) */
      duration?: number;
      /** Minimum delay before first item animates (default: 50) */
      initialDelay?: number;
      /** Whether the animation is enabled (default: true) */
      enabled?: boolean;
    }

    interface StaggerResult {
      /** Inline style to apply to the element for animation delay */
      style: React.CSSProperties;
      /** CSS animation class name */
      className: string;
      /** Whether this item has finished its mount animation */
      // Not needed — animation is CSS-driven
    }
    ```

    The hook should:
    1. Calculate `rowIndex = Math.floor(index / itemsPerRow)` and `colIndex = index % itemsPerRow` when itemsPerRow is provided
    2. Calculate delay as `initialDelay + (rowIndex * itemsPerRow + colIndex) * baseDelay` — this creates row-major stagger (left-to-right, top-to-bottom)
    3. Return `{ style: { animationDelay: `${delay}ms` }, className: "animate-slide-up" }` when enabled, `{ style: {}, className: "" }` when disabled
    4. Use `useMemo` to avoid re-calculation on every render

    Export both the hook and a `StaggerWrapper` component that takes a `staggerIndex` prop and wraps children with the animation. This lets you use it as either a hook (for direct control) or a wrapper component (for simpler usage):

    ```ts
    function StaggerWrapper({
      index,
      itemsPerRow,
      children,
      className,
      ...options
    }: StaggerOptions & { children: React.ReactNode; className?: string })
    ```

    The wrapper renders a div with the stagger style + className applied around children.

    The hook must NOT use `useState` or `useEffect` — delays are purely CSS-driven via `animation-delay`. This means no re-render overhead and the animation triggers on mount naturally.
  </action>
  <verify>
    `Get-Content hooks/useStaggerAnimation.ts` — confirm the file exists with the hook, interface, and StaggerWrapper export.
  </verify>
  <done>
    `hooks/useStaggerAnimation.ts` exists with:
    - Exported `useStaggerAnimation` hook returning `{ style, className }`
    - Exported `StaggerWrapper` component
    - Proper TypeScript interfaces for options
    - Row-major stagger calculation (rowIndex * itemsPerRow + colIndex)
    - No useState/useEffect — pure CSS-driven
  </done>
</task>

<task type="auto">
  <name>Task 2: Create useCountUp hook</name>
  <files>hooks/useCountUp.ts</files>
  <action>
    Create a React hook `useCountUp` that animates a number from 0 to target:

    ```ts
    interface CountUpOptions {
      /** Target value to count up to */
      end: number;
      /** Duration in ms (default: 800) */
      duration?: number;
      /** Start counting when this becomes true (default: true) */
      startOnMount?: boolean;
      /** Number of decimal places (default: 0 for integers) */
      decimals?: number;
      /** Enable/disable (default: true) — set false for server-rendered static numbers */
      enabled?: boolean;
    }

    function useCountUp({ end, duration = 800, startOnMount = true, decimals = 0, enabled = true }: CountUpOptions): {
      /** Current animated value (formatted string) */
      value: string;
      /** Current raw number for custom formatting */
      rawValue: number;
      /** Whether the animation is in progress */
      isAnimating: boolean;
    }
    ```

    Implementation:
    1. Use `useState` for `rawValue`, initialized to `enabled ? 0 : end` (skip animation when disabled)
    2. Use `useEffect` that runs on mount when `startOnMount && enabled`:
       - Start with `rawValue = 0`
       - Calculate `stepTime = Math.max(16, Math.floor(duration / Math.max(end, 1)))` (capped at ~60fps)
       - Use `setInterval` with `stepTime`, incrementing by 1 each tick
       - Clear interval when `rawValue >= end`
       - Cleanup interval on unmount
    3. Format `rawValue` using `Intl.NumberFormat` for locale-aware formatting with the specified decimals
    4. `isAnimating` is `true` while the interval is active

    The hook MUST:
    - Clean up intervals on unmount (useEffect return)
    - Handle `end = 0` gracefully (no animation, value is "0" immediately)
    - Handle `end` changes after mount (re-trigger animation if end changes)
    - Export both the hook and a `CountUp` component that wraps usage:
      ```ts
      function CountUp(props: CountUpOptions & { className?: string; as?: "span" | "p" | "div" })
      ```
  </action>
  <verify>
    `Get-Content hooks/useCountUp.ts` — confirm file exists with hook and CountUp component export.
  </verify>
  <done>
    `hooks/useCountUp.ts` exists with:
    - Exported `useCountUp` hook with all options
    - Exported `CountUp` component
    - Proper cleanup on unmount and end-change
    - Intl.NumberFormat formatting
  </done>
</task>

<task type="auto">
  <name>Task 3: Add stagger-delay CSS utilities + nav active animation + update sidebar</name>
  <files>app/globals.css, components/layout/sidebar.tsx</files>
  <action>
    **Part A — globals.css additions:**

    Add stagger-delay utility classes after the existing `badge-pulse` block and before the FullCalendar overrides:

    ```css
    /* === Stagger animation utilities === */
    .stagger-enter {
      animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    ```

    Also add the nav active fade-in keyframe and utility. Add after the stagger-enter class:

    ```css
    /* === Nav active fade === */
    @keyframes nav-active-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    .nav-active-enter {
      animation: nav-active-in 0.15s ease-out both;
    }
    ```

    Keep the comment consistent with the existing style (same `=== ... ===` pattern).

    **Part B — Update sidebar.tsx:**

    The sidebar currently uses `bg-primary/10 text-primary` for active nav items. Add the `nav-active-enter` class so the blue active block fades in when a nav item becomes active.

    In `components/layout/sidebar.tsx`, locate the active Link element (around line 52). Currently it uses:
    ```tsx
    isActive
      ? "bg-primary/10 text-primary"
      : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-white",
    ```

    Change the active classes to:
    ```tsx
    isActive
      ? "bg-primary/10 text-primary nav-active-enter"
      : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-white",
    ```

    This adds the `nav-active-enter` class which triggers the fade-in + scale animation when the active state is applied on navigation.

    The transition-all on the Link element is already `duration-150` — this covers the non-active hover transition. The `nav-active-enter` animation covers the active appearance. This is a subtle effect — scale(0.96) to scale(1) with opacity, 150ms ease-out.
  </action>
  <verify>
    1. `Select-String -Path "app/globals.css" -Pattern "stagger-enter"` — confirms stagger utility exists
    2. `Select-String -Path "app/globals.css" -Pattern "nav-active-enter"` — confirms nav animation utility exists
    3. `Select-String -Path "components/layout/sidebar.tsx" -Pattern "nav-active-enter"` — confirms sidebar uses the class
  </verify>
  <done>
    - `app/globals.css` has `.stagger-enter` class using existing `slide-up` keyframes with `both` fill-mode
    - `app/globals.css` has `@keyframes nav-active-in` and `.nav-active-enter` utility
    - `components/layout/sidebar.tsx` active nav Link includes `nav-active-enter` class
  </done>
</task>

</tasks>

<verification>
1. Wave 1 — Plan 1 runs independently (no dependencies)
2. Verify hooks/useStaggerAnimation.ts exports useStaggerAnimation hook and StaggerWrapper
3. Verify hooks/useCountUp.ts exports useCountUp hook and CountUp component
4. Verify globals.css has stagger-enter and nav-active-enter classes
5. Verify sidebar.tsx uses nav-active-enter on active item
6. Run `npx tsc --noEmit` to confirm no TypeScript errors
</verification>

<success_criteria>
- Two hooks created and exported (`useStaggerAnimation`, `useCountUp`)
- Stagger and nav animation utilities added to globals.css
- Sidebar nav active item has fade-in animation
- All TypeScript compiles cleanly
</success_criteria>

<output>
After completion, create `.planning/phases/phase-6-motion/phase-6-motion-01-SUMMARY.md`
</output>

---

---
phase: 6-motion
plan: 02
type: execute
wave: 2
depends_on: [phase-6-motion-01]
files_modified:
  - app/(app)/overview/analytics-cards.tsx
  - app/(app)/overview/overview-stats.tsx
  - app/(app)/overview/recent-activity.tsx
  - app/(app)/overview/screen-status-list.tsx
  - app/(app)/media/media-grid.tsx
  - app/(app)/playlists/playlists-list.tsx
  - app/(app)/templates/templates-list.tsx
  - app/(app)/schedule/schedule-calendar.tsx
  - app/(app)/analytics/analytics-dashboard.tsx
autonomous: true
requirements:
  - "Apply stagger mount animation with 40ms delay across row to card grids"
  - "Standardize hover lift with shadow-card-hover on all card components"
  - "Apply count-up animation to KPI number displays"
must_haves:
  truths:
    - "KPI cards on overview page slide up with stagger on mount"
    - "KPI card numbers count up from 0 on mount"
    - "Media grid items slide up with stagger in row-major order"
    - "Playlist cards slide up with stagger"
    - "Template preset cards and custom template cards slide up with stagger"
    - "Schedule rules animate in with stagger"
    - "Analytics dashboard KPI cards slide up with stagger + count-up"
    - "All hover interactions use consistent shadow-card-hover with 150ms ease"
  artifacts:
    - path: "app/(app)/overview/analytics-cards.tsx"
      provides: "Stagger animation + count-up applied to all 4 KPI cards"
    - path: "app/(app)/overview/overview-stats.tsx"
      provides: "Stagger animation + count-up applied to stat cards"
    - path: "app/(app)/media/media-grid.tsx"
      provides: "Stagger animation on grid items + consistent hover lift"
    - path: "app/(app)/playlists/playlists-list.tsx"
      provides: "Stagger animation on playlist cards"
    - path: "app/(app)/templates/templates-list.tsx"
      provides: "Stagger animation on preset cards and custom template cards"
    - path: "app/(app)/schedule/schedule-calendar.tsx"
      provides: "Stagger animation on schedule rule list items"
    - path: "app/(app)/analytics/analytics-dashboard.tsx"
      provides: "Stagger animation on KPI cards + consistent hover lift"
  key_links:
    - from: "hooks/useStaggerAnimation"
      to: "All card grid components"
      via: "import and StaggerWrapper usage"
    - from: "hooks/useCountUp"
      to: "analytics-cards.tsx, overview-stats.tsx, analytics-dashboard.tsx"
      via: "import and CountUp component"
---

<objective>
Apply the motion infrastructure (hooks + CSS from Plan 1) to every card grid and KPI card in the app. Standardize hover lift across all card components for a consistent premium feel.

Purpose: Every interactive card surface across all pages gets the slide-up stagger animation on mount, consistent hover lift, and KPI numbers get count-up animation.
Output: Modified card components across 7 page directories using stagger, count-up, and hover-lift.
</objective>

<execution_context>
@C:/Users/gunny/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/gunny/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@UI_REDESIGN_PLAN.md

Depends on Plan 1 outputs:
@hooks/useStaggerAnimation.ts — stagger hook and StaggerWrapper
@hooks/useCountUp.ts — count-up hook and CountUp component

Files to modify (all already have card patterns — add stagger wrapper + verify hover):
@app/(app)/overview/analytics-cards.tsx — 4 KPI stat cards, currently has inline `animationDelay` on each card div
@app/(app)/overview/overview-stats.tsx — 4 stat cards, currently server component
@app/(app)/overview/recent-activity.tsx — activity timeline card
@app/(app)/overview/screen-status-list.tsx — screen status list card
@app/(app)/media/media-grid.tsx — grid of media thumbnails
@app/(app)/playlists/playlists-list.tsx — playlist cards
@app/(app)/templates/templates-list.tsx — preset and custom template cards
@app/(app)/schedule/schedule-calendar.tsx — schedule rule list items
@app/(app)/analytics/analytics-dashboard.tsx — analytics KPI cards
</context>

<tasks>

<task type="auto">
  <name>Task 1: Apply stagger + count-up to all KPI stat card components</name>
  <files>
    app/(app)/overview/analytics-cards.tsx,
    app/(app)/overview/overview-stats.tsx,
    app/(app)/analytics/analytics-dashboard.tsx
  </files>
  <action>
    Apply stagger animation and count-up to all KPI stat card components. For each component, the itemsPerRow depends on the grid layout.

    **analytics-cards.tsx** (Overview page KPI cards):
    - Import `StaggerWrapper` from `@/hooks/useStaggerAnimation`
    - Import `CountUp` from `@/hooks/useCountUp`
    - Wrap each stat card div (the `.map` callback) with `<StaggerWrapper index={idx} itemsPerRow={4} className="...">` — replace the existing inline `style={{ animationDelay }}` with the StaggerWrapper
    - Remove the old `style={{ animationDelay: ... }}` prop
    - Replace the value `<p>` content with `<CountUp end={card.value} />` for numeric values (not the percentage/string values)
    - **Important:** The grid layout is `xl:grid-cols-4` so `itemsPerRow={4}` is correct. On smaller screens items reflow but the stagger order is still acceptable.

    **overview-stats.tsx** (Overview page older stat cards):
    - Since this is a server component, add `"use client"` at the top
    - Import `StaggerWrapper` from `@/hooks/useStaggerAnimation`
    - Import `CountUp` from `@/hooks/useCountUp`
    - Wrap each card div with `<StaggerWrapper index={idx} itemsPerRow={4}>`
    - Replace the card value `<p className="mt-1.5 text-3xl ...">{card.value}</p>` with `<CountUp end={card.value} className="mt-1.5 text-3xl font-bold tracking-tight text-card-foreground" />`
    - Confirm the grid is `lg:grid-cols-4` → `itemsPerRow={4}`

    **analytics-dashboard.tsx** (Analytics page KPI cards):
    - Import `StaggerWrapper` from `@/hooks/useStaggerAnimation`
    - Import `CountUp` from `@/hooks/useCountUp`
    - The `stats` array is mapped at line ~334 with a grid of `sm:grid-cols-2 lg:grid-cols-4`
    - Wrap each stat card div with `<StaggerWrapper index={idx} itemsPerRow={4}>`
    - Replace the value `<p className="text-2xl font-bold ...">{card.value}</p>` with `<CountUp end={...} className="text-2xl font-bold tracking-tight text-card-foreground" />` — only for numeric values (totalImpressions, activeScreens count). Skip for `formatDuration(totalPlayTime)` and `avgDuration` as those are not plain numbers.
    - For totalImpressions which is a number: `<CountUp end={totalImpressions} />`
    - For `activeScreens` this is `${activeScreens} / ${screens.length}` — NOT a plain number, so keep the existing string rendering

    For all three files, ensure the `"use client"` directive is present (analytics-cards.tsx already has it, overview-stats.tsx does not — needs to be added).
  </action>
  <verify>
    1. Grep each file for `StaggerWrapper` and `CountUp` imports
    2. Verify analytics-cards.tsx no longer has inline `style={{ animationDelay` pattern
    3. `npx tsc --noEmit --pretty 2>&1 | Select-String "error"` — no TypeScript errors
  </verify>
  <done>
    - analytics-cards.tsx: 4 KPI cards wrapped with StaggerWrapper, values use CountUp for numbers
    - overview-stats.tsx: "use client" added, StaggerWrapper + CountUp applied
    - analytics-dashboard.tsx: 4 stat cards wrapped with StaggerWrapper, CountUp for numeric values
  </done>
</task>

<task type="auto">
  <name>Task 2: Standardize hover lift + apply stagger to media grid, playlists, and templates</name>
  <files>
    app/(app)/media/media-grid.tsx,
    app/(app)/playlists/playlists-list.tsx,
    app/(app)/templates/templates-list.tsx
  </files>
  <action>
    **media-grid.tsx:**
    - Import `StaggerWrapper` from `@/hooks/useStaggerAnimation`
    - Already has `"use client"` — good
    - The grid is `sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5` — use `itemsPerRow={5}` (desktop max)
    - Wrap each `.map` callback's card div (the `<div key={item.id} className="group relative rounded-2xl ...">`) with `<StaggerWrapper index={idx} itemsPerRow={5}>`
    - Verify hover lift is already present (`hover:shadow-card-hover hover:border-primary/20` on line 78) — it is, so leave it.
    - Do NOT wrap the empty state — only the grid items.
    - Add `idx` parameter to the `.map` callback: `{filtered.map((item, idx) => (`

    **playlists-list.tsx:**
    - Import `StaggerWrapper` from `@/hooks/useStaggerAnimation`
    - Already has `"use client"` — good
    - The grid is `sm:grid-cols-2 lg:grid-cols-3` — use `itemsPerRow={3}`
    - Wrap each playlist card div (the `<div key={playlist.id} className="group relative rounded-2xl ...">`) with `<StaggerWrapper index={idx} itemsPerRow={3}>`
    - Add `idx` parameter to `.map` callback
    - Leave the empty state unwrapped

    **templates-list.tsx:**
    - Import `StaggerWrapper` from `@/hooks/useStaggerAnimation`
    - Already has `"use client"` — good
    - Two grids to animate:
      1. Presets grid: `sm:grid-cols-2 lg:grid-cols-3` — `itemsPerRow={3}`
         - Wrap each preset card div (the `<div key={preset.name} className="rounded-2xl ...">`) with `<StaggerWrapper index={i} itemsPerRow={3}>`
         - The presets map has `(preset, i)` so index variable `i` already exists
      2. Your Templates grid: same grid — `itemsPerRow={3}`
         - Wrap each template card div with `<StaggerWrapper index={idx} itemsPerRow={3}>`
         - Add `idx` parameter to the template `.map` callback
    - The preset cards and template cards already have `hover:shadow-card-hover` — confirm it's present and leave it.

    For all three files, verify the hover lift uses `shadow-card-hover` and `150ms` timing via `transition-all duration-200` or `duration-150`. If any card uses a different shadow or timing, standardize to match the existing pattern (`hover:shadow-card-hover` with `transition-all duration-200` on the card div).
  </action>
  <verify>
    1. Grep each file for `StaggerWrapper` import and usage
    2. Grep each file for `hover:shadow-card-hover` to confirm lift is present
    3. `npx tsc --noEmit --pretty 2>&1 | Select-String "error"` — no errors
  </verify>
  <done>
    - media-grid.tsx: grid items wrapped with StaggerWrapper
    - playlists-list.tsx: playlist cards wrapped with StaggerWrapper
    - templates-list.tsx: preset cards and custom template cards wrapped with StaggerWrapper
    - All cards have consistent `hover:shadow-card-hover` with `transition-all duration-200`
  </done>
</task>

<task type="auto">
  <name>Task 3: Apply stagger to schedule calendar + remaining overview cards</name>
  <files>
    app/(app)/schedule/schedule-calendar.tsx,
    app/(app)/overview/recent-activity.tsx,
    app/(app)/overview/screen-status-list.tsx
  </files>
  <action>
    **schedule-calendar.tsx:**
    - Import `StaggerWrapper` from `@/hooks/useStaggerAnimation`
    - Already has `"use client"` — good
    - The schedule rules list is a vertical list (not a grid) — use `itemsPerRow={1}` for a clean vertical stagger
    - Wrap each schedule rule div (the `<div key={schedule.id} className="flex items-center justify-between ...">` in the vertical list) with `<StaggerWrapper index={idx} itemsPerRow={1}>`
    - Add `idx` parameter to the `.map((schedule, idx) =>` callback
    - The list currently shows a div for each rule. Verify `hover:shadow-sm` is present on line 99 — it is. This is fine for the inline list items.

    **recent-activity.tsx:**
    - Import `StaggerWrapper` from `@/hooks/useStaggerAnimation`
    - Already has `"use client"` — good
    - The activity items are in a vertical list (timeline) — use `itemsPerRow={1}`
    - Wrap each activity item div with `<StaggerWrapper index={idx} itemsPerRow={1}>`
    - Add `idx` parameter to `.map((item, idx) =>` callback
    - Do NOT wrap the empty state

    **screen-status-list.tsx:**
    - Read this file first (it may be similar to recent-activity)
    - Import `StaggerWrapper` from `@/hooks/useStaggerAnimation`
    - Add `"use client"` if not already present
    - Apply StaggerWrapper to list items with `itemsPerRow={1}` for vertical stagger
    - Verify hover shadow is present

    For all files, maintain the existing hover styles. Do not remove or change them.
  </action>
  <verify>
    1. Grep each file for `StaggerWrapper` import and usage
    2. Verify schedule-calendar.tsx stagger on rules list section only, not on FullCalendar or buttons
    3. `npx tsc --noEmit --pretty 2>&1 | Select-String "error"` — no errors
  </verify>
  <done>
    - schedule-calendar.tsx: schedule rule items wrapped with StaggerWrapper
    - recent-activity.tsx: activity timeline items wrapped with StaggerWrapper
    - screen-status-list.tsx: status list items wrapped with StaggerWrapper
  </done>
</task>

</tasks>

<verification>
1. Wave 2 — depends on Plan 1 (hooks + CSS exist)
2. Every file listed in files_modified must import StaggerWrapper from hooks/useStaggerAnimation
3. KPI card files (analytics-cards, overview-stats, analytics-dashboard) must also use CountUp for numeric values
4. All cards have consistent hover:shadow-card-hover with transition-all duration-200
5. TypeScript compiles: `npx tsc --noEmit`
</verification>

<success_criteria>
- All card grids across 7 page directories use StaggerWrapper with appropriate itemsPerRow
- KPI cards in overview and analytics pages count up on mount
- All interactive cards use consistent hover:shadow-card-hover
- No TypeScript errors, no broken layouts
</success_criteria>

<output>
After completion, create `.planning/phases/phase-6-motion/phase-6-motion-02-SUMMARY.md`
</output>

---

---
phase: 6-motion
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - components/ui/empty-state.tsx
  - components/ui/error-state.tsx
  - components/ui/skeleton.tsx
  - components/ui/error-boundary.tsx
  - app/(app)/screens/screens-table.tsx
  - app/(app)/screens/page.tsx
  - app/(app)/media/media-grid.tsx
  - app/(app)/media/page.tsx
  - app/(app)/overview/page.tsx
  - app/(app)/playlists/playlists-list.tsx
  - app/(app)/playlists/page.tsx
  - app/(app)/schedule/schedule-calendar.tsx
  - app/(app)/schedule/page.tsx
  - app/(app)/templates/page.tsx
  - app/(app)/analytics/page.tsx
  - app/(app)/settings/page.tsx
autonomous: true
requirements:
  - "Handle empty states for every page"
  - "Handle loading skeleton states for every page"
  - "Handle error states for every page"
must_haves:
  truths:
    - "Empty states show a relevant icon, message, and optional action for every data list/page"
    - "Loading states show skeleton placeholders matching real card layouts"
    - "Error states show a clear message with retry option"
    - "All shared state components use the existing design tokens and card styling"
  artifacts:
    - path: "components/ui/empty-state.tsx"
      provides: "Reusable empty state component"
      min_lines: 30
    - path: "components/ui/error-state.tsx"
      provides: "Reusable error state component"
      min_lines: 30
    - path: "components/ui/skeleton.tsx"
      provides: "Upgraded skeleton with variant props"
      min_lines: 20
    - path: "components/ui/error-boundary.tsx"
      provides: "React error boundary for client components"
      min_lines: 25
  key_links:
    - from: "components/ui/empty-state.tsx"
      to: "All page components"
      via: "Replaces inline empty state divs"
    - from: "components/ui/skeleton.tsx"
      to: "Page loading states"
      via: "Used in loading skeletons"
    - from: "components/ui/error-boundary.tsx"
      to: "app/(app)/layout.tsx"
      via: "Wraps app layout for global error handling"
---

<objective>
Build shared empty, loading, and error state components. Apply them to every page to handle null/zero data, loading states, and fetch failures gracefully.

Purpose: Every page currently returns `null` on auth failure and has inconsistent or missing empty states. This creates a consistent pattern: Empty → Loading → Error handling across all pages with reusable primitives.
Output: 4 shared UI components + updates to 15 page/component files.
</objective>

<execution_context>
@C:/Users/gunny/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/gunny/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@UI_REDESIGN_PLAN.md

Existing state-handling patterns:
@Component/ui/skeleton.tsx — basic skeleton with `animate-pulse rounded-md bg-muted`
@/lib/utils.ts — cn utility
@Component/ui/card.tsx — existing Card components for skeleton layout patterns

Existing inline empty states (to replace or standardize):
- media-grid.tsx line ~70: dashed border div with ImageIcon
- playlists-list.tsx line ~62: dashed border div with ListMusic icon
- screens-table.tsx line ~100: TableCell with MonitorSmartphone icon
- schedule-calendar.tsx line ~95: dashed border div with CalendarIcon
- recent-activity.tsx line ~67: Clock icon + text
- analytics-dashboard.tsx line ~690: BarChart3 icon + text
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create shared EmptyState, ErrorState, and upgrade Skeleton components</name>
  <files>
    components/ui/empty-state.tsx,
    components/ui/error-state.tsx,
    components/ui/skeleton.tsx,
    components/ui/error-boundary.tsx
  </files>
  <action>
    Create three new shared state components and upgrade the existing Skeleton:

    **components/ui/empty-state.tsx:**
    ```tsx
    import { cn } from "@/lib/utils";
    import { Inbox } from "lucide-react";
    import { Button } from "@/components/ui/button";

    interface EmptyStateProps {
      /** Icon component (default: Inbox from lucide-react) */
      icon?: React.ComponentType<{ className?: string }>;
      /** Title text (required) */
      title: string;
      /** Description text (optional) */
      description?: string;
      /** Action button label (optional) */
      actionLabel?: string;
      /** Action callback (optional) */
      onAction?: () => void;
      /** Optional className override */
      className?: string;
      /** Use compact variant for tables/lists (default: false) */
      compact?: boolean;
    }

    export function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction, className, compact = false }: EmptyStateProps)
    ```

    Render a centered block with:
    - The icon in a `rounded-2xl` container with `bg-muted/50` background, `p-4`, icon size `h-10 w-10` in `text-muted-foreground/40` (larger in non-compact: `p-6` with `h-12 w-12`)
    - Title as `text-sm font-medium text-muted-foreground` (compact) or `text-base font-semibold text-card-foreground` (non-compact)
    - Optional description as `text-sm text-muted-foreground/60` (compact) or `text-sm text-muted-foreground` (non-compact)
    - Optional action button as `<Button variant="outline" size="sm" className="rounded-xl mt-3" onClick={onAction}>{actionLabel}</Button>`
    - `compact` mode: `py-12` padding, otherwise `py-20`
    - Wrapper div: `flex flex-col items-center justify-center text-center px-4` with `rounded-2xl border border-dashed border-border ${compact ? 'py-12' : 'py-20'}`

    **components/ui/error-state.tsx:**
    ```tsx
    import { cn } from "@/lib/utils";
    import { AlertCircle } from "lucide-react";
    import { Button } from "@/components/ui/button";

    interface ErrorStateProps {
      /** Title text (default: "Something went wrong") */
      title?: string;
      /** Description/error message (optional) */
      description?: string;
      /** Retry button callback (optional) */
      onRetry?: () => void;
      /** Retry button label (default: "Try again") */
      retryLabel?: string;
      /** Full page variant (centers vertically in viewport) (default: false) */
      fullPage?: boolean;
      className?: string;
    }

    export function ErrorState({ title = "Something went wrong", description, onRetry, retryLabel = "Try again", fullPage = false, className }: ErrorStateProps)
    ```

    Render:
    - Warning icon in red-tinted circle: `rounded-2xl bg-destructive/10 p-4`, icon `h-10 w-10 text-destructive`
    - Title as `text-base font-semibold text-card-foreground mt-4`
    - Description as `text-sm text-muted-foreground mt-1 max-w-sm`
    - Retry button: `<Button variant="outline" size="sm" className="rounded-xl mt-4 gap-2" onClick={onRetry}><RefreshCw className="h-3.5 w-3.5" />{retryLabel}</Button>` (import RefreshCw from lucide-react)
    - `fullPage` mode: wrapper div uses `flex flex-col items-center justify-center min-h-[60vh]` instead of just `py-20`

    **components/ui/skeleton.tsx — UPGRADE:**
    Add variants for different skeleton types. Keep the existing API but add:

    ```tsx
    interface SkeletonProps extends React.ComponentProps<"div"> {
      variant?: "default" | "card" | "chart" | "table-row" | "avatar" | "thumbnail";
    }
    ```

    The existing component renders `<div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-muted", className)} ...>`. Keep this for the `default` variant.

    Add variant-based class overrides:
    - `card`: `rounded-2xl bg-muted/70 h-[200px] w-full`
    - `chart`: `rounded-2xl bg-muted/60 h-[300px] w-full`
    - `table-row`: `h-12 w-full rounded-lg bg-muted/50`
    - `avatar`: `rounded-full bg-muted/70 h-10 w-10`
    - `thumbnail`: `aspect-video rounded-2xl bg-muted/70 w-full`
    - Default: keep existing behavior (`animate-pulse rounded-md bg-muted`)

    Add the variant prop with a switch/object lookup in the className.

    **components/ui/error-boundary.tsx:**
    ```tsx
    "use client";

    import { Component, type ReactNode } from "react";
    import { ErrorState } from "./error-state";

    interface ErrorBoundaryProps {
      children: ReactNode;
      fallback?: ReactNode;
    }

    interface ErrorBoundaryState {
      hasError: boolean;
      error: Error | null;
    }

    export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
      constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
      }

      handleRetry = () => {
        this.setState({ hasError: false, error: null });
      };

      render() {
        if (this.state.hasError) {
          if (this.props.fallback) return this.props.fallback;
          return (
            <ErrorState
              title="Something went wrong"
              description={this.state.error?.message ?? "An unexpected error occurred"}
              onRetry={this.handleRetry}
              fullPage
            />
          );
        }
        return this.props.children;
      }
    }
    ```
  </action>
  <verify>
    1. `Get-Content components/ui/empty-state.tsx` — confirms file exists
    2. `Get-Content components/ui/error-state.tsx` — confirms file exists
    3. `Get-Content components/ui/skeleton.tsx` — confirms variant prop exists
    4. `Get-Content components/ui/error-boundary.tsx` — confirms file exists
  </verify>
  <done>
    - `components/ui/empty-state.tsx` exported with icon/title/description/action props, compact mode
    - `components/ui/error-state.tsx` exported with title/description/retry/fullPage props
    - `components/ui/skeleton.tsx` exported with variant prop (default/card/chart/table-row/avatar/thumbnail)
    - `components/ui/error-boundary.tsx` exported as class component with retry state reset
  </done>
</task>

<task type="auto">
  <name>Task 2: Apply EmptyState to all page components — replace inline empty divs</name>
  <files>
    app/(app)/media/media-grid.tsx,
    app/(app)/playlists/playlists-list.tsx,
    app/(app)/screens/screens-table.tsx,
    app/(app)/schedule/schedule-calendar.tsx,
    app/(app)/overview/recent-activity.tsx,
    app/(app)/screens/screen-detail.tsx
  </files>
  <action>
    Replace inline empty state divs with the new `EmptyState` component. Each file gets an appropriate icon and messaging.

    **media-grid.tsx** (line ~69-74):
    Replace the empty state `<div className="rounded-2xl border border-dashed border-border py-20 text-center">...` with:
    ```tsx
    <EmptyState icon={ImageIcon} title="No media found" description="Upload images or videos to get started" />
    ```
    Note: `ImageIcon` is already imported as `Image` from lucide-react. Use it.
    Since the existing icon is `ImageIcon`, the import alias might be `Image`. Use: `icon={Image}`.

    **playlists-list.tsx** (line ~61-66):
    Replace the empty state div with:
    ```tsx
    <EmptyState icon={ListMusic} title="No playlists found" description="Create your first playlist to get started" />
    ```
    `ListMusic` is already imported.

    **screens-table.tsx** (line ~98-105):
    Replace the `TableCell colSpan={6}` empty state with a full-width row:
    ```tsx
    <TableRow>
      <TableCell colSpan={6} className="py-12">
        <EmptyState
          icon={MonitorSmartphone}
          title={search ? "No screens match your search" : "No screens found"}
          description={search ? "Try a different search term" : "Add a screen to get started"}
          compact
        />
      </TableCell>
    </TableRow>
    ```

    **schedule-calendar.tsx** (line ~94-96):
    Replace the `<div className="rounded-2xl border border-dashed border-border py-16 text-center">...` with:
    ```tsx
    <EmptyState icon={CalendarIcon} title="No schedule rules yet" description="Create a schedule rule to start assigning content" />
    ```
    `CalendarIcon` is already imported as `Calendar`.

    **recent-activity.tsx** (line ~66-70):
    Replace the `<div className="py-10 text-center">...` with:
    ```tsx
    <EmptyState icon={Clock} title="No recent activity" compact />
    ```
    `Clock` is already imported.

    **screens/[id]/screen-detail.tsx (if applicable):**
    Read the file fully to check if there are any empty state sections (e.g. no schedules). Apply EmptyState where appropriate.

    For each replacement:
    1. Add `import { EmptyState } from "@/components/ui/empty-state"` if not already imported
    2. Confirm the lucide icon used is already imported in the file
    3. Remove the old inline div
    4. Insert the EmptyState component
  </action>
  <verify>
    1. Grep each file for `EmptyState` import
    2. Grep each file for one remaining inline empty state pattern — there should be none
    3. `npx tsc --noEmit --pretty 2>&1 | Select-String "error"` — no errors
  </verify>
  <done>
    - All inline empty state divs replaced with `EmptyState` component
    - Each EmptyState uses appropriate icon and messaging
  </done>
</task>

<task type="auto">
  <name>Task 3: Apply loading skeletons + error states to server page components</name>
  <files>
    app/(app)/overview/page.tsx,
    app/(app)/screens/page.tsx,
    app/(app)/media/page.tsx,
    app/(app)/playlists/page.tsx,
    app/(app)/schedule/page.tsx,
    app/(app)/templates/page.tsx,
    app/(app)/analytics/page.tsx,
    app/(app)/settings/page.tsx,
    app/(app)/layout.tsx
  </files>
  <action>
    Apply loading skeleton and error state handling to all server component pages.

    **Part A — Create a Suspense loading skeleton for each page group:**

    Since these are server components using `async` data fetching, React Suspense is the correct pattern for loading states.

    Create loading files next to each page:

    For `app/(app)/overview/page.tsx`'s loading state: create `app/(app)/overview/loading.tsx`:
    ```tsx
    import { Skeleton } from "@/components/ui/skeleton";

    export default function OverviewLoading() {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton variant="default" className="h-8 w-32" />
              <Skeleton variant="default" className="h-4 w-64" />
            </div>
            <Skeleton variant="default" className="h-10 w-36 rounded-xl" />
          </div>
          {/* 4 KPI skeleton cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5">
                <Skeleton variant="default" className="h-4 w-24 mb-3" />
                <Skeleton variant="default" className="h-8 w-16 mb-2" />
                <Skeleton variant="default" className="h-3 w-32" />
              </div>
            ))}
          </div>
          {/* 2 chart skeletons */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton variant="chart" />
            <Skeleton variant="chart" />
          </div>
          {/* 3 small chart skeletons */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        </div>
      );
    }
    ```

    Create `app/(app)/screens/loading.tsx`:
    ```tsx
    import { Skeleton } from "@/components/ui/skeleton";

    export default function ScreensLoading() {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="table-row" />
              ))}
            </div>
          </div>
        </div>
      );
    }
    ```

    Create `app/(app)/media/loading.tsx`:
    Similar to screens but with a 5-column grid of thumbnail skeletons.
    ```tsx
    import { Skeleton } from "@/components/ui/skeleton";

    export default function MediaLoading() {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-60 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <Skeleton variant="thumbnail" />
                <div className="p-3.5 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    ```

    Create `app/(app)/playlists/loading.tsx`:
    3-column grid of playlist skeleton cards. Similar pattern to screens/loading but with card grids.

    Create `app/(app)/schedule/loading.tsx`:
    Calendar + list skeletons.

    Create `app/(app)/templates/loading.tsx`:
    3-column grid of template skeleton cards.

    Create `app/(app)/analytics/loading.tsx`:
    Filter bar + 4 KPI + chart skeletons.

    Create `app/(app)/settings/loading.tsx`:
    Simple form skeleton with a few skeleton lines.

    **Part B — Wrap app layout with ErrorBoundary:**

    In `app/(app)/layout.tsx`:
    - Add `import { ErrorBoundary } from "@/components/ui/error-boundary"`
    - Wrap the `<main>` content with `<ErrorBoundary>`
    - Leave the sidebar and header outside the error boundary (they're layout chrome)

    The important pattern: The error boundary must be a client component wrapper. Since the layout is a server component, create `app/(app)/error-boundary-wrapper.tsx`:
    ```tsx
    "use client";
    import { ErrorBoundary } from "@/components/ui/error-boundary";
    export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
      return <ErrorBoundary>{children}</ErrorBoundary>;
    }
    ```
    Then in `app/(app)/layout.tsx`:
    ```tsx
    import { ErrorBoundaryWrapper } from "./error-boundary-wrapper";
    // ...
    <ErrorBoundaryWrapper>
      <main ...>
        {children}
      </main>
    </ErrorBoundaryWrapper>
    ```

    **Part C — Handle null return on auth failure in page components:**

    The current pattern in all page components:
    ```tsx
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    ```

    These already return null which is acceptable for Next.js server components — it renders nothing. No need to change the auth guard pattern. The error boundary will catch any unhandled errors during rendering.

    For each loading.tsx file, make sure the skeleton layout approximates the real page layout so users see a smooth transition from loading → data.
  </action>
  <verify>
    1. `Get-Content app/(app)/overview/loading.tsx` — exists
    2. `Get-Content app/(app)/screens/loading.tsx` — exists
    3. `Get-Content app/(app)/media/loading.tsx` — exists
    4. Grep app/(app)/layout.tsx for `ErrorBoundaryWrapper`
    5. `npx tsc --noEmit --pretty 2>&1 | Select-String "error"` — no errors
  </verify>
  <done>
    - 8 loading.tsx files created (one per page directory under (app))
    - app/(app)/layout.tsx wraps main content with ErrorBoundaryWrapper
    - app/(app)/error-boundary-wrapper.tsx created as client component
  </done>
</task>

</tasks>

<verification>
1. Wave 1 — Plan 3 runs independently in parallel with Plan 1
2. All state components use existing design tokens (bg-card, text-muted-foreground, etc.)
3. EmptyState replaces all inline empty divs
4. Loading skeletons match real page layouts
5. ErrorBoundary wraps app layout with retry capability
6. TypeScript compiles: `npx tsc --noEmit`
</verification>

<success_criteria>
- 4 shared UI components created: EmptyState, ErrorState, upgraded Skeleton, ErrorBoundary
- 6 inline empty states replaced with EmptyState in page components
- 8 loading.tsx files created with skeleton layouts
- App layout wrapped with ErrorBoundary for graceful error handling
- All TypeScript compiles cleanly, no broken layouts
</success_criteria>

<output>
After completion, create `.planning/phases/phase-6-motion/phase-6-motion-03-SUMMARY.md`
</output>
