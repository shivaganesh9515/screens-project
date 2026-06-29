---
phase: 2-shell
plan: phase-2
subsystem: "App Shell (Sidebar + Header + Layout)"
tags:
  - sidebar
  - header
  - layout
  - light-theme
  - shell
requires: []
provides:
  - SHELL-01 — Light sidebar with white bg, nav items, logo block, storage meter
  - SHELL-02 — Three-zone header with welcome, capsule search, notification/avatar cluster
  - SHELL-03 — Updated app layout wiring shell components correctly
affects:
  - Phase 3 (primitives) will build on this shell
  - Phase 4 (overview) renders inside this layout
tech-stack:
  added:
    - "Plus Jakarta Sans (next/font/google) — already loaded in Phase 1"
  patterns:
    - "Custom `usePathname()`-based active nav highlighting"
    - "Sectioned nav with MENU/SYSTEM labels and separate item arrays"
    - "Three-zone header: flexbox with left/center/right regions"
    - "Mobile responsive via hidden sm:block / md:block breakpoints"
key-files:
  created: []
  modified:
    - app/globals.css — light sidebar tokens (already done in Phase 1)
    - components/layout/sidebar.tsx — complete sidebar rewrite
    - components/layout/header.tsx — complete header rewrite
    - app/(app)/layout.tsx — off-white bg, p-8 padding
decisions: []
metrics:
  duration: "~5 minutes"
  completed: "2026-06-29"
---

# Phase 2 Plan: App Shell Redesign — Summary

Rewrote the app shell with a light sidebar (white bg, blue accent, new nav order, storage meter) and a three-zone header (welcome message, capsule search, notification/avatar cluster), then wired the layout with correct off-white background and consistent 32px page padding.

## What Was Built

### Sidebar (`components/layout/sidebar.tsx`)
- White background with subtle `#ECEFF4` right border, `bg-white` fill
- Logo block: blue `#4A7CF7` rounded icon box + "screens" lowercase wordmark
- **MENU** section: Overview · Screens · Media · Playlists · Templates · Schedule (6 items)
- **SYSTEM** section: Analytics · Settings (2 items)
- Active nav: `#EEF3FF` soft blue bg, `#4A7CF7` blue icon+text, font-medium
- Inactive nav: `#6B7394` slate text/icon, `#F0F3FA` hover bg
- `12px` vertical padding, `10px` border-radius on nav items
- Section labels in tiny uppercase slate (`11px`, `tracking-wider`)
- Storage meter card at bottom: HardDrive icon, progress bar (48%), "2.4 GB / 5 GB"
- Collapse toggle with ChevronLeft icon
- Mobile: hamburger button, overlay + sliding panel

### Header (`components/layout/header.tsx`)
- **Left zone:** "Welcome back, {displayName}" bold title + subline "Here's what's happening..." (hidden on mobile)
- **Center zone:** Capsule-shaped search `rounded-full bg-[#F0F3FA]` with magnifier `Search` icon, max-w-md
- **Right zone:**
  - Quick-add button (`Plus` icon, `bg-[#4A7CF7]`)
  - Notification bell (`Bell` icon, red dot `#F43F5E` ring-2)
  - Divider (`#ECEFF4`)
  - Avatar (initials from email) + "Admin" role pill + dropdown with Settings/Sign out
- `h-16`, white bg, `#ECEFF4` bottom border, `px-6`
- Responsive: hides search and name+role on mobile, only shows icons+avatar

### Layout (`app/(app)/layout.tsx`)
- Main content background: `bg-[#F8F9FA]` (off-white)
- Page padding: `p-8` (consistent 32px gutter)
- Max width: `max-w-7xl` centered wrapper

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| `npm run build` compiles | ✅ Passed — no TypeScript errors |
| `--color-sidebar: #FFFFFF` in globals.css | ✅ Already correct from Phase 1 |
| `export function Sidebar` in sidebar.tsx | ✅ Line 36 |
| `#EEF3FF` active bg in sidebar.tsx | ✅ Line 62 |
| `export function Header` in header.tsx | ✅ Line 18 |
| `Welcome back` in header.tsx | ✅ Line 61 |
| Capsule search (`rounded-full`) in header.tsx | ✅ Lines 75, 93, 111 |
| `bg-[#F8F9FA]` in layout.tsx | ✅ Line 15 |
| `p-8` in layout.tsx | ✅ Line 16 |

## Self-Check: PASSED

All modified files verified to exist with correct content. Build passed. All commits properly recorded.
