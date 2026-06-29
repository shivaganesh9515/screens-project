---
phase: "01-tokens"
plan: "01"
subsystem: "design-tokens"
tags: ["theme", "globals.css", "layout", "fonts", "colors", "radius", "shadows"]
requires: []
provides: ["design-tokens", "font-config"]
affects: ["app/globals.css", "app/layout.tsx"]
tech-stack:
  added:
    - "Plus Jakarta Sans (next/font/google)"
  patterns:
    - "Direct color values in @theme (no var indirection)"
    - "font-sans cascade: Plus Jakarta Sans → Inter → system-ui"
key-files:
  created: []
  modified:
    - "app/globals.css"
    - "app/layout.tsx"
decisions:
  - "Direct hex values in @theme instead of --var indirection"
  - "Plus Jakarta Sans loaded alongside Inter (both in CSS cascade)"
  - "Soft shadows replace blue-tinted shadows for neutral card styling"
  - "radius-sm (0.625rem) and radius-lg (1rem) added alongside base radius"
metrics:
  duration: "~5 min"
  completed: "2026-06-29"
  tasks: 2
  modifications: 2
---

# Phase 1 Plan 1: Design Tokens Summary

New Vella-inspired light theme applied globally via design token swap. Background shifts from `#F4F7FF` to `#F8F9FA`, sidebar from dark navy `#0B1124` to white `#FFFFFF`, base radius from `0.5rem` to `0.875rem` (14px), status colors updated to emerald/coral, and Plus Jakarta Sans added as the primary font.

## Changes Made

### Task 1: Replace @theme block with new design tokens — ✅ committed `4e54dbe`

**File: `app/globals.css`**

| Token | Old Value | New Value |
|-------|-----------|-----------|
| `--color-background` | `var(--background)` → `#F4F7FF` | `#F8F9FA` (direct) |
| `--color-foreground` | `var(--foreground)` → `#0F1A2E` | `#0F1A2E` (direct) |
| `--color-sidebar` | `#0B1124` | `#FFFFFF` |
| `--color-sidebar-foreground` | `#8B95B5` | `#6B7394` |
| `--color-sidebar-active-bg` | `rgba(74,124,247,0.1)` | `#EEF3FF` |
| `--color-sidebar-hover` | `#141D3A` | `#F0F3FA` |
| `--color-border` | `#E4E9F2` | `#ECEFF4` |
| `--color-input` | `#E4E9F2` | `#ECEFF4` |
| `--color-success` | `#22C55E` | `#10B981` |
| `--color-destructive` | `#EF4444` | `#F43F5E` |
| `--color-chart-2` | `#7C8DFF` | `#6B95FF` |
| `--color-chart-3` | `#34D399` | `#10B981` |
| `--font-sans` | `"Inter", ...` | `"Plus Jakarta Sans", "Inter", ...` |
| `--radius` | `0.5rem` | `0.875rem` |
| *(new)* `--radius-sm` | — | `0.625rem` |
| *(new)* `--radius-lg` | — | `1rem` |

Shadows replaced with soft, diffuse values (no harsh borders on cards).
`:root { --background, --foreground }` block removed — body now uses `var(--color-background)` directly.
FullCalendar border color updated to `#ECEFF4`.
All animation tokens, keyframes, and utility classes preserved.

### Task 2: Add Plus Jakarta Sans font import — ✅ committed `9985056`

**File: `app/layout.tsx`**

- Imported `Plus_Jakarta_Sans` from `next/font/google` alongside `Inter`
- Created `plusJakartaSans` font instance with `--font-plus-jakarta` CSS variable
- Updated `<html>` className to include both `plusJakartaSans.variable` and `inter.variable`
- Inter remains unchanged as a fallback in the font-family cascade

## Verification

1. ✅ **Build check:** `npm run build` passes with zero errors (compiled successfully, TypeScript clean, all 22 pages generated)
2. ✅ **CSS check:** No missing variable warnings. All tokens reference direct values.
3. ✅ **No regressions:** All existing routes, components, and data wiring intact — changes are purely visual.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- ✅ `app/globals.css` created/updated — commit `4e54dbe`
- ✅ `app/layout.tsx` created/updated — commit `9985056`
- ✅ `npm run build` passes with zero errors
- ✅ No CSS warnings or missing variable errors
