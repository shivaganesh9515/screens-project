# Screens — UI Redesign Roadmap

## Overview

Full visual overhaul of the Screens digital-signage dashboard to match the Vella Fintech design language — light, spacious, premium SaaS. **Visual + layout redesign only; no feature changes, no route changes, no data wiring changes.**

## Phases

### Phase 1: Design Tokens + Font

**Goal:** Swap design tokens in `app/globals.css` and add Plus Jakarta Sans font.

**Plans:** 1 plan

Plans:
- [ ] `phase-1-PLAN.md` — Replace @theme block with new tokens, update body/glow/calendar styles, add Plus Jakarta Sans font

---

### Phase 2: App Shell (Sidebar + Header)

**Goal:** Light sidebar + new top header with welcome message, capsule search, and utility cluster.

**Plans:** 1 plan

Plans:
- [ ] `phase-2-PLAN.md` — Light sidebar rewrite (logo, nav sections, storage meter, collapse) + three-zone header (welcome, capsule search, notification cluster) + layout integration

---

### Phase 3: UI Primitives ✅

**Goal:** Build reusable StatCard, TrendPill, StatusPill, SectionCard, CapsuleInput, TimeframeToggle, ProgressBar, GradientAreaChart.

**Completed:** 2026-06-29 — 9 component files created, TypeScript + build pass

---

### Phase 4: Overview Dashboard Redesign

**Goal:** Full KPI cards + playback activity chart + quick deploy + recent activity + insights.

---

### Phase 5: Per-Page Sweep ✅

**Goal:** Apply tokens to Screens, Media, Playlists, Schedule, Analytics, Settings, Auth pages.

**Completed:** 2026-06-30 — 22 files covered across all 8 page groups, borderless card pattern + capsule button convention established

---

### Phase 6: Motion + Polish

**Goal:** Subtle animations, hover effects, empty/loading/error states.

---

## Progress

| Phase | Status | Plans |
|-------|--------|-------|
| 1 — Tokens | ✅ Planned (2 tasks, Wave 1) | 1 plan |
| 2 — Shell | ✅ Planned (3 tasks, Wave 1) | 1 plan |
| 3 — Primitives | ✅ Complete (9 files, all checks pass) | ✅ phase-3-SUMMARY.md |
| 4 — Overview | ✅ Planned (4 tasks, Wave 1) | 1 plan |
| 5 — Sweep | ✅ Complete (22 files, build passes) | ✅ 05-pages-SUMMARY.md |
| 6 — Polish | ✅ Planned (5 tasks, Wave 1) | 1 plan |
