# Screens — UI/UX Redesign Plan (Vella-inspired)
## Brief for Freebuff — Complete visual overhaul

> Goal: Re-skin the existing Screens digital-signage dashboard to match the **Vella Fintech** design language — light, spacious, premium SaaS — while keeping all existing routes, components, and data wiring intact. **This is a visual + layout redesign, not a feature change.**

---

## 0. Core Direction (read first)

| Aspect | Current | New (Vella-inspired) |
|--------|---------|----------------------|
| Mood | Dark sidebar, dense | Light, airy, spacious, premium |
| Sidebar | Dark navy `#0B1124` | **Light** — white/off-white, dark text, soft blue active block |
| Background | — | Off-white `#F8F9FA` |
| Cards | White, 8px radius | White, **14px radius**, generous padding, soft shadow |
| Accent | `#4A7CF7` (keep) | **Royal blue `#4A7CF7`** — used sparingly, intentionally |
| Density | Compact | Roomy — more whitespace, larger type scale |
| Header | Basic | Welcome message + capsule search + utility cluster |

**Rule:** Blue is a spotlight, not a flood. Use it only for: active nav, primary CTA, the ONE hero metric, focus rings. Everything else is charcoal/slate/white.

---

## 1. Design Tokens — replace in `app/globals.css` `@theme`

```css
@theme inline {
  /* Surfaces */
  --color-background: #F8F9FA;        /* off-white app bg */
  --color-foreground: #0F1A2E;        /* deep charcoal/navy text */
  --color-card: #FFFFFF;
  --color-card-foreground: #0F1A2E;

  /* Accent (keep brand blue) */
  --color-primary: #4A7CF7;
  --color-primary-foreground: #FFFFFF;
  --color-primary-dark: #3A66D9;
  --color-primary-light: #6B95FF;
  --color-primary-muted: #EEF3FF;     /* soft blue wash for active/hover */

  /* Sidebar → LIGHT now */
  --color-sidebar: #FFFFFF;
  --color-sidebar-foreground: #6B7394;     /* inactive label = slate */
  --color-sidebar-active: #4A7CF7;         /* active icon+text */
  --color-sidebar-active-bg: #EEF3FF;      /* soft blue active block */
  --color-sidebar-hover: #F0F3FA;

  /* Text hierarchy */
  --color-muted: #F0F3FA;
  --color-muted-foreground: #6B7394;       /* secondary labels/subtext */
  --color-border: #ECEFF4;                 /* lighter, softer borders */
  --color-input: #ECEFF4;
  --color-ring: #4A7CF7;

  /* Status */
  --color-success: #10B981;   /* emerald — online / up trends */
  --color-warning: #F59E0B;
  --color-destructive: #F43F5E; /* coral/soft red — offline / down trends */
  --color-destructive-foreground: #FFFFFF;

  /* Charts — keep cohesive blue/emerald family */
  --color-chart-1: #4A7CF7;
  --color-chart-2: #6B95FF;
  --color-chart-3: #10B981;
  --color-chart-4: #F59E0B;
  --color-chart-5: #A78BFA;

  /* Type */
  --font-sans: "Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Shape — softer, more premium */
  --radius: 0.875rem;   /* 14px base */
  --radius-sm: 0.625rem;
  --radius-lg: 1rem;

  /* Shadows — soft, diffuse (no harsh borders on cards) */
  --shadow-card: 0 1px 3px rgba(16,26,46,0.04), 0 1px 2px rgba(16,26,46,0.03);
  --shadow-card-hover: 0 8px 24px rgba(74,124,247,0.08), 0 2px 6px rgba(16,26,46,0.04);
  --shadow-card-elevated: 0 12px 32px rgba(16,26,46,0.08);
}
```

**Spacing/type scale to standardize:**
- Card padding: `24px` (`p-6`), large cards `28-32px`
- Grid gap between cards: `24px` (`gap-6`)
- Page outer padding: `32px` (`p-8`)
- KPI number: `text-3xl`/`text-4xl` `font-bold`
- Section title: `text-lg font-semibold`
- Label/subtext: `text-sm text-muted-foreground`
- Cards prefer **soft shadow over borders** — drop `border` on stat/chart cards, keep border only on tables/inputs.

---

## 2. App Shell Redesign (`components/layout/`)

### Sidebar (light)
- White bg, subtle right border `1px #ECEFF4`.
- **Logo block** top-left: blue geometric mark + wordmark `screens` (lowercase, charcoal).
- Nav items: line icons (Lucide) + label, `14px`, `12px` vertical padding, `10px` radius.
  - **Active:** soft blue block `#EEF3FF`, blue icon + blue text, `font-medium`.
  - **Inactive:** slate `#6B7394` icon+text; hover → `#F0F3FA` bg.
- Nav order: Overview · Screens · Media · Playlists · Templates · Schedule · Analytics · Settings.
- Optional section label "MENU" / "SYSTEM" in tiny uppercase slate.
- Bottom: a small "Storage used" mini-meter card (ties into signage usage) + collapse toggle.

### Top Header (global, in `(app)/layout.tsx`)
Three zones, `h-16`, white, bottom border:
- **Left:** `Welcome back, {name}` (bold) + subline `Here's what's happening across your screens today.` (slate).
- **Center:** capsule search `rounded-full bg-muted`, magnifier icon, placeholder `Search screens, media, playlists...`. Hidden on mobile, icon-only.
- **Right cluster:** `+` quick-add (soft square button) · notification bell (with dot) · avatar + `{name}` + role pill (`Admin`).

---

## 3. Overview Dashboard Redesign (`app/(app)/overview/`)

Translate Vella's fintech modules → signage equivalents. **Reuse existing components, restyle + relayout.**

### Row 1 — 4 KPI Stat Cards (`overview-stats.tsx` / `analytics-cards.tsx`)
Uniform white cards, 14px radius, soft shadow, `p-6`. Each: tiny icon chip (top-left, tinted bg), label (slate), big bold number, trend pill bottom.

| # | Card | Hero value | Trend indicator |
|---|------|-----------|-----------------|
| 1 | **Total Screens** | count (hero — subtle blue tint or sparkline) | `+N this month` |
| 2 | **Screens Online** | count | emerald ↑ `% vs yesterday` |
| 3 | **Screens Offline** | count | coral ↓ `% vs yesterday` |
| 4 | **Active Content** | playlists/items live now | emerald ↑ `% vs last week` |

Trend pill = small rounded chip, emerald bg-tint + up arrow (positive) / coral bg-tint + down arrow (negative).

### Row 2 — Split 60/40
- **Left 60% — "Playback Activity" Area Chart** (`playback-activity-chart.tsx`)
  - Smooth **gradient-filled area chart** (Recharts `Area` with linear gradient fill, blue).
  - Timeframe pills top-right: `1D 1W 1M 1Y ALL` (active = blue).
  - Hover tooltip: date + exact value (e.g. impressions / play count).
  - Card title: "Playback Activity" + subtitle muted.
- **Right 40% — "Quick Deploy" widget** (replaces Vella's currency exchange — same visual structure)
  - Two stacked select blocks separated by a center swap/arrow chip:
    - Block A: **Playlist** dropdown ("Select content")
    - Block B: **Screen / Group** dropdown ("Select target")
  - Full-width primary blue CTA at bottom: **`Push to Screen`**.
  - This is the signage analog of the exchange card — keep the exact card shape, inputs, divider, and full-width button styling.

### Row 3 — Split 50/50
- **Left 50% — Recent Activity list** (`recent-activity.tsx` / `screen-status-list.tsx`)
  - Row: circular icon (screen/media thumb) → name (`Lobby Screen`, `Summer Promo.mp4`) → timestamp → right-aligned status **pill** (`Online`/`Playing` emerald bg-tint; `Offline` coral; `Scheduled` blue).
- **Right 50% — Insights + Operational Metrics** (stack two mini-panels)
  - **Smart Insights panel:** 2–3 auto text rows with small icon (e.g. "Uptime is 99.2% this week", "3 screens went offline in the last hour", "Summer Promo played 1,204 times today").
  - **Operational Metrics panel:** horizontal **linear progress bars**:
    - *Fleet Uptime* — `99.2%` blue bar
    - *Storage Used* — `64%` blue bar
    - *Content Freshness* — `% screens on latest schedule` emerald bar

> Existing extra charts (`media-distribution-chart`, `screen-health-chart`, `top-content`, `recent-media`, `upcoming-schedules`) → move **below the fold** into a secondary 3-col grid of smaller cards, same restyle. Don't delete; demote.

---

## 4. Per-Page Restyle Rules (apply tokens consistently)

| Page | Key restyle |
|------|-------------|
| **Screens** (`screens-table.tsx`) | TanStack table → light rows, no zebra (use hover `#F8F9FA`), status pills, avatar/thumbnail col, soft row dividers `#ECEFF4`. Filter/search as capsule. "Add Screen" = primary blue. |
| **Add Screen modal** | Centered card, 16px radius, big pairing code in mono, soft blue code container. |
| **Media** (`media-grid.tsx`) | Card grid, 14px radius thumbnails, hover lift (`shadow-card-hover` + scale 1.02), type badge chip top-left, duration chip bottom-right. Upload dropzone = dashed border + soft blue wash on drag. |
| **Playlists** (`playlists-list.tsx`) | Cards w/ stacked thumbnail preview, item count + duration chips. Builder: dnd-kit rows as light cards with grip handle, drag = elevated shadow. |
| **Templates** | Preset layout cards showing zone wireframe (blue outlines on light), selected = blue ring. |
| **Schedule** (`schedule-calendar.tsx`) | FullCalendar themed to tokens: blue events, light grid lines `#ECEFF4`, rounded event blocks, remove default heavy borders. |
| **Analytics** (`analytics-dashboard.tsx`) | Same KPI-card + gradient-area-chart language as Overview. Recharts restyle: thin axes, slate labels, blue/emerald series, soft grid. |
| **Settings** (`settings-form.tsx`) | Sectioned cards, capsule inputs (`rounded-lg`), labels slate, save = primary blue. Tabbed left-nav within page. |
| **Auth** (`(auth)/`) | Split layout: left = brand panel (subtle blue gradient + logo + tagline), right = white form card, capsule inputs, full-width blue CTA. |

---

## 5. Reusable Primitives to Standardize (`components/ui/`)

Build/restyle these once, reuse everywhere:
- **`StatCard`** — icon chip + label + value + trend pill.
- **`TrendPill`** — emerald/coral rounded chip with arrow.
- **`StatusPill`** — Online/Offline/Playing/Scheduled variants.
- **`SectionCard`** — white, 14px radius, soft shadow, `p-6`, optional title+subtitle+action slot.
- **`CapsuleInput` / `CapsuleSelect`** — rounded-full / rounded-lg fields.
- **`TimeframeToggle`** — pill group `1D 1W 1M 1Y ALL`.
- **`ProgressBar`** — labeled linear meter (value + track).
- **`GradientAreaChart`** — Recharts wrapper with the blue gradient fill preset.

---

## 6. Motion (subtle, premium)
- Cards: `animate-slide-up` on mount (stagger 40ms across a row).
- Hover: cards lift to `shadow-card-hover`, 150ms ease.
- Nav active: soft blue block fades in.
- Numbers: optional count-up on KPI cards.
- Keep it calm — no bouncy/aggressive easing.

---

## 7. Execution Order for Freebuff (do in this sequence)
1. **Tokens first** — swap `globals.css` `@theme` block (Section 1). Add Plus Jakarta Sans font in root layout. → instant global shift.
2. **Shell** — light sidebar + new header (Section 2).
3. **UI primitives** — Section 5 (everything else depends on these).
4. **Overview** — full relayout (Section 3) — this is the showcase page.
5. **Sweep remaining pages** — Section 4, one per pass.
6. **Motion + polish** — Section 6, empty/loading/error states last.

> Constraint: don't change routes, data fetching, Supabase wiring, or component file names — restyle in place. If a layout needs new structure, keep the same exported component name.
