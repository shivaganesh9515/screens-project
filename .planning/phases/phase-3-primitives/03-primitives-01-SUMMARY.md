---
phase: 03-primitives
plan: 01
subsystem: ui
tags: [ui, primitives, components, recharts, tailwind, base-ui]
requires:
  - phase: 01-tokens
    provides: Design tokens (colors, radius, shadows, fonts)
  - phase: 02-shell
    provides: App shell layout, sidebar, topbar
provides:
  - "8 reusable UI primitives in components/ui/"
  - "Updated radius tokens (--radius-xl, --radius-2xl)"
affects: phase-4-overview, phase-5-pages-sweep, phase-6-motion
tech-stack:
  added: []
  patterns:
    - "Standalone presentational components with design token references"
    - "Wrapper primitives composing existing shadcn/base-ui components"
    - "Chart primitives using recharts + ChartContainer infrastructure"
key-files:
  created:
    - components/ui/trend-pill.tsx
    - components/ui/status-pill.tsx
    - components/ui/progress-bar.tsx
    - components/ui/section-card.tsx
    - components/ui/capsule-input.tsx
    - components/ui/capsule-select.tsx
    - components/ui/timeframe-toggle.tsx
    - components/ui/stat-card.tsx
    - components/ui/gradient-area-chart.tsx
  modified:
    - app/globals.css
key-decisions:
  - "CapsuleInput uses React.forwardRef for form library compatibility"
  - "BaseUI ToggleGroup expects array values for single-select — TimeframeToggle wraps with array adapter"
  - "SectionCard does NOT use shadcn Card components — lighter styled <div> wrapper"
  - "GradientAreaChart delegates to existing ChartContainer infrastructure"
patterns-established:
  - "Component uses design token variables (--color-*, --shadow-*, --radius*) exclusively — no hardcoded colors"
  - "Interactive components marked 'use client', presentational wrappers may omit"
requirements-completed: []
duration: 12min
completed: 2026-06-29
---

# Phase 3: UI Primitives Summary

**9 reusable UI primitives (TrendPill, StatusPill, ProgressBar, SectionCard, CapsuleInput, CapsuleSelect, TimeframeToggle, StatCard, GradientAreaChart) built on design token system with zero hardcoded colors**

## Performance

- **Duration:** 12 min
- **Started:** 2026-06-29T22:54:00Z
- **Completed:** 2026-06-29T23:06:00Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- TrendPill: emerald/coral rounded chip with directional arrow icon for up/down/neutral trends, supports default and subtle variants, sm/default sizes
- StatusPill: Online/Offline/Playing/Scheduled variants with colored dot indicator using statusConfig helper
- ProgressBar: labeled linear meter with blue/emerald/coral color variants, clamped 0-100, optional value label
- SectionCard: white card with 14px radius, soft shadow, p-6 padding, optional header (title+subtitle+action slot)
- CapsuleInput: forwardRef wrapper around Input with pill (rounded-full) and rounded (rounded-lg) variants
- CapsuleSelect: wrapper around SelectTrigger with pill and rounded variants
- TimeframeToggle: pill-group toggle with 1D/1W/1M/1Y/ALL options, blue active fill using ToggleGroup
- StatCard: KPI card composing icon chip + label + bold value + optional TrendPill inside SectionCard, hero variant
- GradientAreaChart: Recharts AreaChart wrapper with SVG blue linear gradient, configurable axes, tooltip via ChartTooltip, cartesian grid
- Updated globals.css with --radius-xl (1.25rem) and --radius-2xl (1.5rem) tokens

## Task Commits

Each task was committed atomically:

1. **Task 1: Build standalone primitives (TrendPill, StatusPill, ProgressBar) + globals.css** - `3546e09` (feat)
2. **Task 2: Build layout/input wrappers (SectionCard, CapsuleInput, CapsuleSelect)** - `3ae941d` (feat)
3. **Task 3: Build composite primitives (TimeframeToggle, StatCard, GradientAreaChart)** - `96e8cb9` (feat)

**Fix commit:** `b239715` (fix: TimeframeToggle value types for BaseUI ToggleGroup)

## Files Created/Modified
- `components/ui/trend-pill.tsx` - Trend indicator pill (emerald up / coral down)
- `components/ui/status-pill.tsx` - Status badge with dot + label for Online/Offline/Playing/Scheduled
- `components/ui/progress-bar.tsx` - Labeled linear progress bar with colored fill
- `components/ui/section-card.tsx` - Vella-style card container with header slots
- `components/ui/capsule-input.tsx` - Rounded-full or rounded-lg wrapper around existing Input
- `components/ui/capsule-select.tsx` - Rounded-full or rounded-lg wrapper around SelectTrigger
- `components/ui/timeframe-toggle.tsx` - Pill-group toggle with timeframe labels
- `components/ui/stat-card.tsx` - KPI stat card composing icon chip + label + value + trend pill
- `components/ui/gradient-area-chart.tsx` - Recharts AreaChart wrapper with blue gradient fill
- `app/globals.css` - Added --radius-xl (1.25rem) and --radius-2xl (1.5rem) tokens

## Decisions Made
- CapsuleInput uses `React.forwardRef` for form library compatibility as specified in plan
- BaseUI ToggleGroup expects array values for single-select (unlike Radix) — TimeframeToggle adapts via `value={[value]}` and handles `string[]` in `onValueChange`
- SectionCard implemented as lightweight `<div>` wrapper, not compositing shadcn Card — keeps the component simple and avoids CardHeader/CardFooter complexity
- GradientAreaChart delegates to existing `ChartContainer` infrastructure which handles `ResponsiveContainer` auto-sizing

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- BaseUI's ToggleGroup API differs from Radix: `value` expects `Value[]` (not `Value`), and `onValueChange` passes `Value[]` (not `Value | null`). Fixed by wrapping in array adapter pattern in `b239715`.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- All 8 primitives ready for consumption by Phase 4 (Overview) and Phase 5 (Pages Sweep)
- Components use design tokens exclusively — dark mode works via token inheritance
- Interactive components (CapsuleInput, CapsuleSelect, TimeframeToggle) have focus-visible rings via global styles
- `npx tsc --noEmit --pretty` passes with zero errors
- `npx next build` completes successfully

---
## Self-Check: PASSED

- [x] All 9 component files exist
- [x] All 4 commits present (3546e09, 3ae941d, 96e8cb9, b239715)
- [x] --radius-xl and --radius-2xl tokens in globals.css
- [x] `npx tsc --noEmit --pretty` passes
- [x] `npx next build` succeeds

*Phase: 03-primitives*
*Completed: 2026-06-29*
