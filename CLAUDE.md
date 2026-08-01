# CLAUDE.md

Guidance for Claude when working in this repo. Read this before making changes.

---

## 1. Project Overview

**Smart Life Rewards (SLR)** — Australian membership / rewards-club web platform.
Production domain: `smartliferewards.com.au`. This Next.js app is the **parent platform** for the SLR ecosystem; it owns registration, Stripe recurring billing, entry allocation, state-based draw pools, admin operations, and member-facing features. A separate mobile app consumes its data.

### Source-of-truth docs (Notion — fetch via MCP for detail; don't copy here)

- PRD v3.2 ID (MASTER): https://www.notion.so/35edf1937d9881d9abc4f9ebf19a308d
- PRD v3.2 EN: https://www.notion.so/356df1937d988113803bf97f2846a47f
- API Contract v1.0: https://www.notion.so/389df1937d98816ab84ff538176fa4bb
- DB Schema / ERD v1.0: https://www.notion.so/389df1937d98817c8d0afe7fe7cf3321
- Technical Spec v1.0: https://www.notion.so/389df1937d98817ab3f9fe8809d54a07
- Task Board (use "FE — Next.js" view): https://www.notion.so/29fbd767616c414c830be4385edc2bdf
- Sprint Schedule: https://www.notion.so/6a694bea0bdf4dfabc913b22a8b140b7

Rule: when unsure about copy, pricing, business rules, an endpoint shape, or a data field — fetch the relevant Notion doc via MCP rather than guessing. PRD ID is master; EN mirrors it.

### Roles & tiers

| Tier        | Sub-tiers (price/cycle · tokens)                        | Notes                                          |
| ----------- | ------------------------------------------------------- | ---------------------------------------------- |
| **Visitor** | Free · 1 token                                          | OTP signup, no payment. Visitor draw only.     |
| **RED**     | R1 $10·1tok · R4 $20·4tok · R7 $30·7tok                 | Discounts, RED draws, e-books                  |
| **BLUE**    | B1 $26·1tok · B4 $39·4tok · B7 $52·7tok · B10 $65·10tok | Full access. Optional **BENY** add-on (+$4/mo) |
| **Admin**   | —                                                       | Full platform control                          |

All paid sub-tiers get 4 draw_pass per cycle. Visitor draw_pass = infinite. Billing = 28-day exact-time cycle (not calendar month).

### Core domain concepts (don't paraphrase loosely — these have rules)

- **Token vs draw_pass** — _token_ = rows/entries in the TPAL CSV per giveaway (chance of winning). _draw_pass_ = giveaways joinable per cycle (4 paid, infinite Visitor). **draw_pass is INTERNAL-ONLY** — frontend must NEVER display the number. API exposes it as `entry_status` (active/inactive). draw_pass = 0 → excluded from CSV.
- **Cycle** — 28 days flat, anchored to the exact second of payment success. 4 giveaways/cycle. Reset token + draw_pass on successful renewal.
- **Entries** — assigned only after a successful Stripe payment. Do not accumulate across cycles; reset each cycle.
- **Draw pool** — `state + tier` (e.g. `SLR Red VIC`). Member can't change state without admin approval.
- **TPAL export** — 3 separate CSVs per tier (Visitor/RED/BLUE), filtered to draw_pass > 0. Draw runs externally at randomdraws.com/au; admin uploads CSV + records winners back.
- **Spin Wheel** — token-upgrade sub-tiers ONLY (R4/R7/B4/B7/B10 — NOT R1/B1/Visitor). Fires at 2 moments: at registration (before checkout) and 24h before auto-renewal. 1/4 odds. Prize = one-time billing discount on that invoice. No tier-lock after a win.
- **BENY** — separate third-party platform. Optional **$4/month recurring** add-on (RED/BLUE only), not bundled. No system integration: web sells access via Stripe + collects name/email/phone → admin activates manually (batch) → member notified by **email** → downloads BENY app.
- **Upgrade/downgrade** — Visitor→Paid immediate (new cycle now). Paid→Paid scheduled via `pending_upgrade`, applied at next renewal, cancelable, no proration.
- **E-books** — listing visible to all; full content gated to RED & BLUE (Visitor locked + upgrade CTA). Reading page is a long-form HTML web page (hero → sticky "In This Guide" TOC → per-chapter image+body+pull-quote → "Next Ebook" → footer), NOT a PDF reader. Content is CMS-managed. No download/offline on web (mobile-only).
- **Email/OTP** — OTP email verification is Visitor-only; paid tiers verify via Stripe (no OTP). Gateway = Mailjet, live from Sprint 1 (OTP + reset depend on it). SMS gateway TBD.
- **CMS scope** — only 2 areas are CMS-managed: the Prizes page and E-book content. Everything else static.

### This is a revamp

The **current production site** at [smartliferewards.com.au](https://smartliferewards.com.au) is a **WordPress** build with known feature limitations — this Next.js repo is the rebuild that removes those constraints (custom Stripe flows, state-based draw pools, TPAL export, spin wheel, admin tooling).

Current site nav (for content/copy reference, not visual): **Home · Membership** (Visitor Free / SLR RED / SLR Premium/BLUE) · **eBooks · FAQs · Account · Contact**. Use this for copy tone and feature parity baseline, but **don't copy the WordPress visual style** — the new design is darker and more premium (see §4).

### Competitor reference

- [rsrewards.com.au](https://rsrewards.com.au) — RS Rewards
- [lmctplus.com](https://lmctplus.com) — LMCT+ (PRD's primary benchmark)

Look here for patterns around dashboard layout, discount directory UX, and draw card design — but SLR differentiates on integrated Stripe billing, state-based pools, TPAL compliance, spin wheel, and BENY.

---

## 2. Engineering Context

- **Role:** Frontend engineer. Backend is a separate **Express.js** service (separate repo) integrated later — NOT Next.js API routes.
- **API conventions:** REST, JWT Bearer, snake_case JSON. Money is always integer cents (AUD). API exposes `entry_status`, never raw draw_pass. Stripe Checkout is hosted.
- **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 · shadcn/ui · NextAuth v5 (beta) · React Hook Form + Zod · Zustand · Axios · Sonner toasts · Motion (Framer Motion successor).
- **No design files.** There is no Figma. The home page is the **canonical style reference** — derive design tokens and patterns from there (see §4).

### Folder layout

```
src/
  app/
    (home)/(routes)/(membership)/_components/  ← canonical style reference
    (auth)/(routes)/{sign-in,sign-up}/
    dashboard/(routes)/                         ← admin + member dashboard
    api/auth/[...nextauth], api/auth/logout
    layout.tsx, globals.css
  components/
    ui/        ← shadcn primitives
    common/    ← navbar, footer, container
  hooks/, lib/, types/, constant/, data/
  auth.ts, auth.config.ts, proxy.ts
```

### Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` / `npm start`
- `npm run lint` / `npm run lint:fix`
- `npm run format` — Prettier
- `npm run type-check` — `tsc --noEmit`

### Conventions (already in place — match them)

- Prettier: 4-space indent, single quotes, JSX single quotes, semicolons, width 120, trailing comma `none`. Tailwind classes auto-sorted by `prettier-plugin-tailwindcss`. Imports sorted by `@trivago/prettier-plugin-sort-imports`.
- Path alias: `@/*` → `src/*`.
- Route groups: `(home)`, `(auth)`, `(routes)` — parentheses = no URL segment.
- Co-located components: page-specific UI lives under `_components/` or `components/` next to the route, not in global `src/components/`.
- **Redirects & External links:** Any redirect or link that navigates to an external payment/portal (like Stripe Checkout, Stripe Billing Portal, etc.) MUST open in a new tab/window (`_blank` with `rel="noopener noreferrer"`).
- shadcn primitives in `src/components/ui/`; only put genuinely cross-cutting custom components in `src/components/common/`.
- Server Components by default. Add `'use client'` only when needed (forms, hooks, interactivity).

### Backend integration (Express.js — upcoming)

- Use **Axios** with a single configured client (base URL from env, interceptors for auth token + error toasts).
- Auth flow: NextAuth credentials provider → calls Express `/auth/login` → stores JWT in session. See [auth.ts](src/auth.ts), [auth.config.ts](src/auth.config.ts).
- API base URL from `NEXT_PUBLIC_API_URL` (or server-only `API_URL` for server actions). Check [.env.example](.env.example) when adding new vars.
- **Stripe Checkout is hosted** — frontend redirects, backend handles webhooks. Don't build PCI-handling forms.
- **Backend Verification & Rules:** Wajib merujuk ke [RULES.md](RULES.md) untuk pedoman verifikasi API, penanganan duplikasi email, rules spin wheel, dan pengetesan Stripe webhook.

---

## 3. Working Style

- **Don't add features beyond the task.** Bug fix ≠ refactor. No speculative abstractions.
- **Don't write comments explaining WHAT.** Only WHY when non-obvious.
- **Reuse existing tokens, sections, and shadcn components** before creating new ones. Check `src/components/ui/` and `src/app/(home)/.../_components/` first.
- **Match the visual language of the home page** for any new public-facing page. The dashboard can deviate (lighter density, more data) but must keep the same brand palette and typography.
- **Convert hex to CSS variables when reusable.** If a hex appears 3+ times, promote it to a token in [globals.css](src/app/globals.css).
- When unsure about copy, pricing, or business rules — re-read the Notion PRD (§1 links) rather than guessing.
- Never render the draw_pass number in any UI — only `entry_status` (active/inactive).

---

## 4. Design Guide (derived from the home page)

The home page at `src/app/(home)/(routes)/(membership)/_components/` is the canonical reference. The system is a **premium dark theme** with metallic gold accents and tier-coloured cards (red, blue, gold, black). Vibe target: aspirational, lottery/rewards-club, Australian. Reference points: LMCT+, RS Rewards.

### 4.1 Color tokens

Defined in [globals.css](src/app/globals.css) under `:root` and exposed via `@theme inline` — use the Tailwind classes (`bg-slr-navy-deep`, `text-slr-gold`, etc.) instead of raw hex.

| Token               | Value                 | Use                                                 |
| ------------------- | --------------------- | --------------------------------------------------- |
| `--slr-navy-deep`   | `#131619`             | **Primary background** — every section uses this    |
| `--slr-navy`        | `oklch(20% 0.06 250)` | Surface                                             |
| `--slr-navy-card`   | `oklch(22% 0.05 250)` | Card surface                                        |
| `--slr-navy-border` | `oklch(30% 0.04 250)` | Card borders                                        |
| `--slr-red-tier`    | `oklch(52% 0.22 25)`  | RED tier accent                                     |
| `--slr-blue-tier`   | `oklch(50% 0.2 250)`  | BLUE/Premium tier accent                            |
| `--slr-gold`        | `oklch(78% 0.16 83)`  | Gold CTAs, brand highlight                          |
| `--slr-smart`       | `oklch(54% 0.15 155)` | "Smart" green accent                                |
| `--slr-muted`       | `#ADB0B5`             | Body muted text → `text-slr-muted`                  |
| `--slr-dim`         | `#8EA0B8`             | Ultra-muted text → `text-slr-dim`                   |
| `--slr-gold-label`  | `#E2B42B`             | Eyebrow / accent label gold → `text-slr-gold-label` |
| `--slr-ink`         | `#040404`             | Deep section background → `bg-slr-ink`              |

**Tier hex palettes (used as bespoke gradients on cards):**

- Gold gradient (CTAs, brand text): `linear-gradient(89.12deg, #F5D78E 3.07%, #D4AF37 41.36%, #FFE066 60.5%, #A07018 98.79%)` — exposed as `bg-gradient-gold` / `text-gradient-gold` (className) and `GOLD_GRADIENT` in [src/lib/styles.ts](src/lib/styles.ts) (inline `style`). Don't re-inline it.
- Red card bg: `linear-gradient(154.36deg, #1C0308 0.82%, #2A0810 49.73%, #1A0306 98.65%)` · border `#C8152E66` · text accent `#E88888`
- Blue (Premium) card bg: `linear-gradient(154.36deg, #0E1828 0.82%, #142034 49.73%, #0E1828 98.65%)` · border `#2878E84D` · text accent `#2878E8`
- Visitor/neutral card bg: `linear-gradient(154.36deg, #141820 0.82%, #1E2530 49.73%, #141820 98.65%)` · border `#A0B4D259` · muted text `#8EA0B8`
- Black tier card bg: `linear-gradient(154.36deg, #0A0A0A 0.82%, #181818 49.73%)` · subtle white border-image
- Body text muted: `#ADB0B5` (`text-slr-muted`) · ultra-muted: `#8EA0B8` (`text-slr-dim`) · gold accent label: `#E2B42B` (`text-slr-gold-label`) — **use the token classes, not raw hex**

### 4.2 Typography

Two Google fonts loaded in [app/layout.tsx](src/app/layout.tsx) via `next/font`:

- **Montserrat** (`--font-montserrat`, weights 100–900) → default sans, all body and UI text
- **Bebas Neue** (`--font-bebas-neue`, weight 400) → display headings only

| Use                             | Class                                                                                             | Notes                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Hero / section H2 display       | `font-bebas-neue text-[56px] md:text-[72px] xl:text-[90px] uppercase tracking-wider leading-none` | Always uppercase                      |
| Card display number ($10, FREE) | `font-bebas-neue text-[40px] sm:text-[52px] md:text-[60px] font-extrabold`                        |                                       |
| H3                              | `font-bebas-neue text-2xl md:text-4xl uppercase font-bold`                                        |                                       |
| Eyebrow label                   | `text-xs md:text-sm font-semibold uppercase text-slr-gold-label` (gold) or `text-red-600`         | Flanked by gradient hairline dividers |
| Body                            | `text-sm md:text-base text-slr-muted`                                                             |                                       |
| Micro/meta                      | `text-[10px] sm:text-xs uppercase tracking-widest text-slr-dim`                                   |                                       |

**Brand-text gradient pattern** (apply gold gradient to text):

```tsx
<span className='bg-[linear-gradient(89.12deg,#F5D78E_3.07%,#D4AF37_41.36%,#FFE066_60.5%,#A07018_98.79%)] bg-clip-text text-transparent'>
    REWARDS
</span>
```

### 4.3 Layout & spacing

- Page container: `mx-auto max-w-7xl px-4`
- Section vertical rhythm: `py-16 md:py-24`
- Every section uses `bg-slr-navy-deep` (or the `slr-section-bg` / `slr-stars-bg` utility for decorated sections)
- Section header pattern: gradient hairline + eyebrow + Bebas Neue H2 + muted lead
- Grid: `grid grid-cols-1 lg:grid-cols-2 gap-6` for content/visual splits; pricing uses `grid-cols-3 gap-2 sm:gap-3`

### 4.4 Components

**Cards (tier / pricing):**

- `rounded-xl` (or `rounded-2xl` for hero cards)
- Tier-specific diagonal gradient background (see §4.1)
- 1px tier-coloured border with alpha (`66`, `4D`, `59`)
- Shadow: `shadow-[0px_0px_13px_0px_#776D6D26]` or `shadow-[0px_0px_20px_0px_#776D6D26]`
- Inner padding: `p-3 sm:p-4` (compact) or `p-4 sm:p-6` (hero)

**Gradient-border card** (used on RED hero tier card):

```tsx
<div className='relative isolate rounded-2xl p-1.25'>
    <div className='absolute inset-0 -z-10 rounded-2xl bg-[linear-gradient(...)] mask-exclude [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]' />
    <div className='rounded-[calc(1rem-5px)] bg-[linear-gradient(...)] p-4 sm:p-6'>…</div>
</div>
```

**Primary CTA (gold button):** reuse the shared style from [src/lib/styles.ts](src/lib/styles.ts) — `goldButtonStyle` (gradient + dark text + gold top edge) or `goldBgStyle` (gradient fill only). For className contexts the `bg-gradient-gold` / `text-gradient-gold` utilities use the same gradient (`GOLD_GRADIENT`). **Don't re-inline the gold gradient or redefine a local `goldButtonStyle`.** Prefer the [GoldCtaButton](src/components/common/gold-cta-button.tsx) / [GoldPillButton](src/components/common/gold-pill-button.tsx) components where they fit.

```tsx
import { goldButtonStyle } from '@/lib/styles';

<Button className='h-11 w-full rounded-xl font-bold uppercase' style={goldButtonStyle}>
    Join Now
</Button>;
```

**Secondary CTA (gold outline):** `border border-[#FFD147] bg-[#FFD1471A] text-[#FFDC75]` with subtle inset shadow.

**Eyebrow label (section header):** prefer the [SectionEyebrow](src/components/common/section-eyebrow.tsx) component; the raw pattern is:

```tsx
<div className='flex items-center justify-center gap-2'>
    <div className='h-px w-16 bg-[linear-gradient(270deg,#B08A20_0%,rgba(255,255,255,0)_100%)]' />
    <p className='text-slr-gold-label text-xs font-semibold uppercase md:text-sm'>Member Benefits</p>
    <div className='h-px w-16 bg-[linear-gradient(90deg,#B08A20_0%,rgba(255,255,255,0)_100%)]' />
</div>
```

Use **gold** (`#E2B42B`) for SLR-brand sections, **red** (`text-red-600` with `#D0302F` divider) for RED-tier sections, **blue** (`#2878E8`) for Premium-tier sections.

**Check list item:** icon `/icons/ic-check-circle.png` at `h-4 w-4 sm:h-5 sm:w-5`, gap-2, body in `text-xs leading-relaxed text-white/90`.

**Form inputs:** Use shadcn `Input`/`Form` primitives; for dark surfaces, override with `bg-slr-navy-card border-slr-navy-border text-white placeholder:text-slr-dim`. Reference [sign-up/components/register-form.tsx](<src/app/(auth)/(routes)/sign-up/components/register-form.tsx>).

### 4.5 Effects & decoration

- **Spotlights** ([components/ui/spotlight](src/components/ui/spotlight.tsx)): used in hero to throw soft white light. Animated via `--animate-spotlight`.
- **Stars background** (`slr-stars-bg` utility): subtle 3-layer radial-gradient star field.
- **Radial glows**: large blurred radial circles with `mix-blend-screen blur-3xl` for color tinting (red/purple/white). Hide on mobile (`hidden xl:block`).
- **Grid overlay**: faint 100×100 grid with mask-fade, applied as decorative depth layer.
- **Bottom fade**: linear-gradient from transparent to `#131619` to fade hero into next section.
- Animations via `motion` package — keep entrances subtle (fade + 8–16px translate). Avoid bouncy easing — this is a premium brand.

### 4.6 Iconography & assets

- WebP images and icons live under [public/icons/](public/icons/) and [public/images/](public/images/).
- Naming: `ic-*` for icons, descriptive kebab-case for images.
- Always use `next/image` with explicit `width`/`height` (or `fill` + sized container).
- Decorative icons set `alt=''` only when truly redundant; otherwise meaningful alt text.

### 4.7 Responsive rules of thumb

Breakpoints used: `sm` (640), `md` (768), `lg` (1024), `xl` (1280). Mobile-first.

- Single column → 2-col split at `lg` for content/visual splits.
- Decorative glows/spotlights: hide below `xl` to avoid mobile clutter.
- Display type scales down ~40% on mobile (`text-[56px] md:text-[72px] xl:text-[90px]`).
- Pricing-card padding shrinks: `p-3 sm:p-4`. Buttons stay `h-11`.

### 4.8 Do / Don't

**Do:**

- Reuse the existing section template (eyebrow → H2 → lead → grid).
- Keep dark navy as the base; let gold and tier colours do the highlighting.
- Use Bebas Neue for display + uppercase, Montserrat for everything else.
- Promote repeated hex values to CSS variables in [globals.css](src/app/globals.css).

**Don't:**

- Don't introduce a light-mode design without explicit ask — the platform is dark-first.
- Don't mix new fonts. Two-font system only.
- Don't use plain `text-white` for body copy — use `text-slr-muted` or `text-white/60..90` to keep depth.
- Don't add new shadcn components without checking `src/components/ui/` first.
- Don't render Stripe card forms in-app — Stripe Checkout is hosted.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
