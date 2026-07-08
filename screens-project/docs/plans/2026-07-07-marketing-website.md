# Screens Marketing Website — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full marketing website for the Screens digital signage platform targeting advertisers/brands, with landing page, features, pricing, about, and contact pages.

**Architecture:** Next.js 16 App Router with Tailwind CSS v4. Marketing pages live under `app/(marketing)/` route group with a shared layout (navbar + footer). Each page is a server component with client-side animations via Framer Motion. Branding is fresh — dark theme with electric blue accent.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Framer Motion, Lucide React icons, React Hook Form (contact form)

---

## Design Tokens

### Colors
```
--color-bg: #0a0a0f (near-black)
--color-surface: #12121a (dark card)
--color-surface-hover: #1a1a25
--color-border: #1e1e2a
--color-text: #f0f0f5 (primary text)
--color-text-muted: #8888a0 (secondary text)
--color-accent: #3b82f6 (electric blue)
--color-accent-hover: #2563eb
--color-accent-glow: rgba(59, 130, 246, 0.15)
--color-success: #22c55e
--color-warning: #f59e0b
```

### Typography
```
Font: Inter (Google Fonts)
H1: 4xl/5xl bold
H2: 3xl font-semibold
H3: xl font-medium
Body: base regular
Small: sm regular
```

### Spacing
```
Section padding: py-24 px-6
Container max-width: max-w-7xl mx-auto
Card padding: p-6 to p-8
```

---

## File Structure

```
app/(marketing)/
├── layout.tsx              — shared navbar + footer
├── page.tsx                — landing page (/)
├── features/page.tsx       — features page (/features)
├── pricing/page.tsx        — pricing page (/pricing)
├── about/page.tsx          — about page (/about)
├── contact/page.tsx        — contact page (/contact)
└── components/
    ├── navbar.tsx          — navigation bar
    ├── footer.tsx          — site footer
    ├── hero.tsx            — hero section
    ├── how-it-works.tsx    — 3-step process
    ├── features-grid.tsx   — feature cards
    ├── stats.tsx           — numbers/stats section
    ├── pricing-card.tsx    — pricing tier card
    ├── contact-form.tsx    — contact form
    └── animated-section.tsx — scroll animation wrapper
```

---

## Task 1: Install Dependencies & Setup Design Tokens

**Files:**
- Modify: `package.json` (add framer-motion)
- Create: `app/(marketing)/globals.css` (design tokens)
- Modify: `tailwind.config.ts` (extend theme)

**Steps:**

1. Install Framer Motion:
```bash
npm install framer-motion
```

2. Create `app/(marketing)/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0f;
  --color-surface: #12121a;
  --color-surface-hover: #1a1a25;
  --color-border: #1e1e2a;
  --color-text: #f0f0f5;
  --color-text-muted: #8888a0;
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  --color-accent-glow: rgba(59, 130, 246, 0.15);
  --color-success: #22c55e;
  --color-warning: #f59e0b;
}
```

3. Add Inter font to `app/layout.tsx`:
```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
```

4. Commit: `feat(marketing): install framer-motion and setup design tokens`

---

## Task 2: Create Marketing Layout (Navbar + Footer)

**Files:**
- Create: `app/(marketing)/layout.tsx`
- Create: `app/(marketing)/components/navbar.tsx`
- Create: `app/(marketing)/components/footer.tsx`

**Steps:**

1. Create `app/(marketing)/layout.tsx`:
```tsx
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

2. Create `app/(marketing)/components/navbar.tsx`:
- Fixed top navbar with logo, nav links (Features, Pricing, About, Contact), and CTA button ("Get Started")
- Mobile hamburger menu
- Glassmorphism background on scroll
- Links:
  - `/` → Home
  - `/features` → Features
  - `/pricing` → Pricing
  - `/about` → About
  - `/contact` → Contact

3. Create `app/(marketing)/components/footer.tsx`:
- 4-column layout: Product, Company, Resources, Legal
- Social links placeholder
- Copyright line

4. Commit: `feat(marketing): add navbar and footer layout`

---

## Task 3: Create Animated Section Wrapper

**Files:**
- Create: `app/(marketing)/components/animated-section.tsx`

**Steps:**

1. Create `app/(marketing)/components/animated-section.tsx`:
```tsx
"use client";
import { motion } from "framer-motion";

export function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
```

2. Commit: `feat(marketing): add animated section component`

---

## Task 4: Build Landing Page Hero

**Files:**
- Create: `app/(marketing)/components/hero.tsx`
- Modify: `app/(marketing)/page.tsx`

**Steps:**

1. Create `app/(marketing)/components/hero.tsx`:
- Headline: "Turn Every Screen Into Revenue"
- Subheadline: "Manage, schedule, and track digital ads on screens across buses, autos, and static locations — all from one dashboard."
- Two CTAs: "Start Free Trial" (primary), "See How It Works" (secondary)
- Background: subtle gradient mesh or grid pattern
- Floating dashboard preview image (use a placeholder or screenshot)

2. Update `app/(marketing)/page.tsx`:
```tsx
import { Hero } from "./components/hero";

export default function MarketingHome() {
  return (
    <>
      <Hero />
      {/* more sections below */}
    </>
  );
}
```

3. Commit: `feat(marketing): add hero section`

---

## Task 5: Build "How It Works" Section

**Files:**
- Create: `app/(marketing)/components/how-it-works.tsx`

**Steps:**

1. Create `app/(marketing)/components/how-it-works.tsx`:
- Section title: "How It Works"
- 3 steps with icons, title, and description:
  1. **Upload** — "Upload your images and videos, organize them into playlists"
  2. **Schedule** — "Set when and where your content plays — by screen, group, or time"
  3. **Track** — "See real-time analytics: impressions, play time, screen uptime"
- Each step has a number badge (01, 02, 03)
- Staggered animation on scroll

2. Add to `app/(marketing)/page.tsx`

3. Commit: `feat(marketing): add how it works section`

---

## Task 6: Build Features Grid

**Files:**
- Create: `app/(marketing)/components/features-grid.tsx`

**Steps:**

1. Create `app/(marketing)/components/features-grid.tsx`:
- Section title: "Everything You Need"
- 6 feature cards in a 3x2 grid:
  1. **Media Management** — Upload, organize, tag images and videos
  2. **Smart Scheduling** — Time-based, recurring, priority scheduling
  3. **Zone Templates** — Split-screen layouts with per-zone playlists
  4. **Live Analytics** — Real-time dashboards, CSV export
  5. **Multi-Screen Groups** — Manage hundreds of screens at once
  6. **Auto-Pairing** — screens pair with a simple code, no IT needed
- Each card: icon (Lucide), title, description
- Hover effect with accent glow

2. Add to `app/(marketing)/page.tsx`

3. Commit: `feat(marketing): add features grid section`

---

## Task 7: Build Stats Section

**Files:**
- Create: `app/(marketing)/components/stats.tsx`

**Steps:**

1. Create `app/(marketing)/components/stats.tsx`:
- Dark background strip
- 4 stats in a row:
  - "10,000+" — Screens Managed
  - "50M+" — Impressions Tracked
  - "99.9%" — Uptime
  - "24/7" — Support
- Numbers animate (count up) when scrolled into view

2. Add to `app/(marketing)/page.tsx`

3. Commit: `feat(marketing): add stats section`

---

## Task 8: Build Landing Page CTA + Complete Page

**Files:**
- Modify: `app/(marketing)/page.tsx`

**Steps:**

1. Add final CTA section to landing page:
- Title: "Ready to Start?"
- Subtitle: "Join thousands of advertisers already using Screens"
- Button: "Get Started Free"
- Background: accent gradient

2. Final landing page composition:
```tsx
import { Hero } from "./components/hero";
import { HowItWorks } from "./components/how-it-works";
import { FeaturesGrid } from "./components/features-grid";
import { Stats } from "./components/stats";

export default function MarketingHome() {
  return (
    <>
      <Hero />
      <Stats />
      <HowItWorks />
      <FeaturesGrid />
      {/* CTA section inline */}
    </>
  );
}
```

3. Commit: `feat(marketing): complete landing page with CTA`

---

## Task 9: Build Features Page

**Files:**
- Create: `app/(marketing)/features/page.tsx`

**Steps:**

1. Create `app/(marketing)/features/page.tsx`:
- Hero section with page title
- 6 detailed feature sections (alternating left/right layout with image placeholders):
  1. Media Management
  2. Playlist Builder
  3. Zone Templates
  4. Scheduling Engine
  5. Analytics Dashboard
  6. Player & Screen Management
- Each section: title, description, bullet points, placeholder image
- CTA at bottom

2. Commit: `feat(marketing): add features page`

---

## Task 10: Build Pricing Page

**Files:**
- Create: `app/(marketing)/pricing/page.tsx`
- Create: `app/(marketing)/components/pricing-card.tsx`

**Steps:**

1. Create `app/(marketing)/components/pricing-card.tsx`:
- Props: name, price, description, features[], highlighted
- Card with checkmark list
- Highlighted card has accent border

2. Create `app/(marketing)/pricing/page.tsx`:
- 3 tiers:
  - **Starter** — $49/mo — Up to 10 screens, 1 user, basic analytics
  - **Growth** — $149/mo — Up to 100 screens, 5 users, advanced analytics, scheduling
  - **Enterprise** — Custom — Unlimited screens, unlimited users, API access, dedicated support
- Feature comparison table
- FAQ section (5 questions)

3. Commit: `feat(marketing): add pricing page`

---

## Task 11: Build About Page

**Files:**
- Create: `app/(marketing)/about/page.tsx`

**Steps:**

1. Create `app/(marketing)/about/page.tsx`:
- Hero: "About Screens"
- Mission: "We make digital signage accessible for every business"
- Story section
- Team section (placeholder cards)
- Values section (3-4 values with icons)

2. Commit: `feat(marketing): add about page`

---

## Task 12: Build Contact Page

**Files:**
- Create: `app/(marketing)/contact/page.tsx`
- Create: `app/(marketing)/components/contact-form.tsx`

**Steps:**

1. Create `app/(marketing)/components/contact-form.tsx`:
- Fields: Name, Email, Company, Subject, Message
- React Hook Form + Zod validation
- Submit button with loading state
- Success toast on submit

2. Create `app/(marketing)/contact/page.tsx`:
- Two-column layout: form on left, contact info on right
- Contact info: email, phone placeholder, office address placeholder
- Map placeholder

3. Commit: `feat(marketing): add contact page`

---

## Task 13: SEO & Metadata

**Files:**
- Modify: `app/(marketing)/layout.tsx`
- Create: `app/(marketing)/sitemap.ts`
- Create: `app/(marketing)/robots.ts`

**Steps:**

1. Add metadata to layout:
```tsx
export const metadata = {
  title: "Screens — Digital Signage Platform for Advertisers",
  description: "Manage, schedule, and track digital ads on screens across buses, autos, and static locations.",
};
```

2. Create sitemap.ts for all marketing pages
3. Create robots.ts allowing all crawlers

4. Commit: `feat(marketing): add SEO metadata, sitemap, and robots`

---

## Task 14: Final Polish & Responsive Testing

**Files:**
- Review all marketing components

**Steps:**

1. Test all pages on mobile, tablet, desktop
2. Fix any responsive issues
3. Verify all links work
4. Verify page transitions are smooth
5. Add page-level loading states if needed

6. Commit: `feat(marketing): final responsive polish`

---

## Verification Criteria

- [ ] All 5 pages load without errors (`/`, `/features`, `/pricing`, `/about`, `/contact`)
- [ ] Navbar links work and highlight active page
- [ ] Footer links work
- [ ] Mobile hamburger menu works
- [ ] Animations play on scroll
- [ ] Contact form validates and shows success
- [ ] All pages are responsive (mobile/tablet/desktop)
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes

---

## Total Tasks: 14
## Estimated Time: 6-8 hours (single developer)
## Can be parallelized: Yes — Tasks 4-8 (landing sections) can be split across 2-3 people
