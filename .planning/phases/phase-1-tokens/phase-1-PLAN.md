---
phase: 01-tokens
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/globals.css
  - app/layout.tsx
autonomous: true
requirements: []
user_setup: []

must_haves:
  truths:
    - "App background renders as #F8F9FA (off-white) instead of #F4F7FF"
    - "Card/interactive elements use 14px (0.875rem) base radius instead of 8px"
    - "Text renders in Plus Jakarta Sans font (falls back to Inter)"
    - "Sidebar renders with light/white background instead of dark navy #0B1124"
    - "Border colors render as #ECEFF4 (softer) instead of #E4E9F2"
    - "FullCalendar uses new border color #ECEFF4"
    - "Status colors: success = emerald #10B981, destructive = coral #F43F5E"
    - "Soft card shadows replace hard card borders on cards"
  artifacts:
    - path: "app/globals.css"
      provides: "Updated @theme tokens, body styles, ambient glow, FC overrides"
    - path: "app/layout.tsx"
      provides: "Plus Jakarta Sans font import and CSS variable"
  key_links:
    - from: "app/layout.tsx"
      to: "app/globals.css"
      via: "font-sans CSS variable reference in @theme"
      pattern: "Plus Jakarta Sans"
    - from: "app/globals.css @theme"
      to: "All components using Tailwind classes (bg-background, text-foreground, rounded-xl, etc.)"
      via: "Tailwind v4 @theme inline generates utility classes from tokens"
---

<objective>
Swap all design tokens in `app/globals.css` to the new Vella-inspired light theme and add Plus Jakarta Sans font loading.

**Purpose:** Establish the new visual foundation (colors, radii, shadows, typography) that all subsequent phases build on. This creates an instant global visual shift without breaking any existing component logic, routes, or data wiring.

**Output:** Updated `app/globals.css` with new @theme block, body styles, and FullCalendar overrides. Updated `app/layout.tsx` with Plus Jakarta Sans font.
</objective>

<execution_context>
@C:/Users/gunny/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/gunny/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@C:/Users/gunny/development/screens-website/app/globals.css
@C:/Users/gunny/development/screens-website/app/layout.tsx
@C:/Users/gunny/development/screens-website/UI_REDESIGN_PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace @theme block with new design tokens and update body/glow/calendar styles in globals.css</name>
  <files>app/globals.css</files>
  <action>
    Make the following targeted edits to `app/globals.css`. Do NOT change any keyframe animations, utility classes (.skeleton, .gradient-text, .badge-pulse, scrollbar styles, selection styles, focus styles), or the import statement.

    **1a — Replace the @theme inline block values (lines 5-46):**

    Replace the existing token values with the new ones from UI_REDESIGN_PLAN.md Section 1.

    Specific changes from current to new:
    - `--color-background`: `var(--background)` → `#F8F9FA` (direct value, no more var indirection)
    - `--color-foreground`: `var(--foreground)` → `#0F1A2E` (direct value)
    - `--color-sidebar`: `#0B1124` → `#FFFFFF` (dark navy → white — this is the biggest visual change)
    - `--color-sidebar-foreground`: `#8B95B5` → `#6B7394`
    - `--color-sidebar-active-bg`: `rgba(74, 124, 247, 0.1)` → `#EEF3FF`
    - `--color-sidebar-hover`: `#141D3A` → `#F0F3FA`
    - `--color-border`: `#E4E9F2` → `#ECEFF4`
    - `--color-input`: `#E4E9F2` → `#ECEFF4`
    - `--color-success`: `#22C55E` → `#10B981` (emerald)
    - `--color-destructive`: `#EF4444` → `#F43F5E` (coral)
    - `--color-destructive-foreground`: keep `#ffffff`
    - `--color-chart-2`: `#7C8DFF` → `#6B95FF`
    - `--color-chart-3`: `#34D399` → `#10B981`
    - `--font-sans`: `"Inter", ...` → `"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif`
    - `--radius`: `0.5rem` → `0.875rem`
    - Add `--radius-sm: 0.625rem` and `--radius-lg: 1rem` after `--radius`
    - Replace all three `--shadow-*` values with the new softer shadow values from Section 1
    - Keep all `--animate-*` tokens (fade-in, slide-up, pulse-soft, scale-in, enter-from-right) and `--shadow-dropdown` — these are NOT in the replacement spec and are still used by components

    **1b — Remove the `:root` block (lines 73-76):**

    After replacing @theme with direct values, the `:root { --background: #F4F7FF; --foreground: #0F1A2E; }` block is no longer needed. Remove it entirely. The body CSS below it will be updated in 1c.

    **1c — Update body background reference (lines 78-84):**

    Change `body { background: var(--background); ... }` to use `var(--color-background)` instead:
    ```
    body {
      background: var(--color-background);
      color: var(--color-foreground);
      ...
    }
    ```
    This ensures body background resolves to `#F8F9FA` from the new @theme value.

    **1d — Update FullCalendar border color (line 156):**

    Change `--fc-border-color: #E4E9F2 !important;` → `--fc-border-color: #ECEFF4 !important;`

    **1e — Ambient glow (lines 87-96):**

    The `body::before` glow uses the accent color `rgba(74, 124, 247, ...)` which is unchanged. No changes needed — the glow will now layer over the new `#F8F9FA` background instead of `#F4F7FF`.
  </action>
  <verify>
    Run `npm run build` or `npm run dev` and confirm no CSS errors. Check that:
    - `npx tailwindcss --help` succeeds (Tailwind CLI available)
    - No missing CSS variable warnings in dev/build output
  </verify>
  <done>
    - `app/globals.css` @theme block has all new values matching UI_REDESIGN_PLAN.md Section 1
    - `:root` block removed (no var(--background) indirection)
    - Body background references `var(--color-background)`
    - FullCalendar border color is `#ECEFF4`
    - Animation tokens and utility classes preserved unchanged
    - `npm run dev` starts without errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Add Plus Jakarta Sans font import in root layout</name>
  <files>app/layout.tsx</files>
  <action>
    Add Plus Jakarta Sans font alongside the existing Inter font (Inter stays as a fallback).

    **Changes to `app/layout.tsx`:**

    1. Update the import line to add `Plus_Jakarta_Sans`:
       ```
       import { Inter, Plus_Jakarta_Sans } from "next/font/google";
       ```

    2. Add a Plus_Jakarta_Sans instance before the metadata export:
       ```
       const plusJakartaSans = Plus_Jakarta_Sans({
         variable: "--font-plus-jakarta",
         subsets: ["latin"],
       });
       ```
       Keep the existing `inter` instance unchanged.

    3. Update the `<html>` className to include the new font variable:
       ```
       <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}>
       ```

    Do NOT change the Inter import, the inter instance, or any other part of the layout.
  </action>
  <verify>
    `npm run dev` starts without errors. Open the app in browser and verify Plus Jakarta Sans is used in rendered text (check computed font-family on body — should show "Plus Jakarta Sans" first, then "Inter" as fallback).
  </verify>
  <done>
    - Plus_Jakarta_Sans imported from next/font/google
    - Font variable created with `--font-plus-jakarta`
    - `<html>` className includes both `plusJakartaSans.variable` and `inter.variable`
    - `npm run dev` starts without errors
    - Plus Jakarta Sans renders in browser (confirmed via devtools computed styles)
  </done>
</task>

</tasks>

<verification>
1. **Build check:** `npm run build` succeeds with no type errors or CSS warnings.
2. **Visual check:** Start `npm run dev`, open the app. The background is noticeably lighter (off-white `#F8F9FA`). The sidebar is now white instead of dark navy. Cards have softer, more rounded corners.
3. **Font check:** Inspect any text element — computed font-family starts with `"Plus Jakarta Sans"`.
4. **No regressions:** All existing routes, components, and data functionality are intact. The CSS changes are purely visual.
5. **Status colors:** Any success indicators render emerald (#10B981), destructive/coral (#F43F5E) — visually distinct from the old green/red.
</verification>

<success_criteria>
- All design tokens from UI_REDESIGN_PLAN.md Section 1 are applied in `app/globals.css`
- Plus Jakarta Sans is loaded and rendered as the primary font
- `npm run build` passes with zero errors
- The app shows the new theme instantly: light sidebar, off-white background, 14px radii, soft shadows, new color palette
- No existing functionality is broken — routes, data, components all work identically
</success_criteria>

<output>
After completion, create `.planning/phases/phase-1-tokens/phase-1-SUMMARY.md`
</output>
