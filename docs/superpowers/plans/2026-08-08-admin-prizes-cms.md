# Admin Prizes CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admins a single-document editor at `/dashboard/prizes` that drives the Prizes page content, with stage figures derived from the paid-member count rather than typed.

**Architecture:** The prize pool is one stored document (`GET /api/v1/public/prizes`, `PUT /api/v1/admin/prizes`). Everything stage-related — active stage, stage label, progress, the 100…2000 ladder — is *derived* in a dependency-free module `src/lib/prizes.ts`, never stored. The admin page follows the established dashboard shape (server `page.tsx` → `'use client'` form → `'use server'` actions → `lib/api/resources/*`), differing only in having no list and no route params.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui · React Hook Form + Zod · Sonner · Vitest (added in Task 1, scoped to `src/lib/prizes.ts`)

**Source spec:** [docs/superpowers/specs/2026-08-08-admin-prizes-cms-design.md](../specs/2026-08-08-admin-prizes-cms-design.md)

## Global Constraints

- **Prettier:** 4-space indent, single quotes, JSX single quotes, semicolons, print width 120, trailing comma `none`. Never hand-format — run `npm run format`.
- **Imports:** sorted by `@trivago/prettier-plugin-sort-imports`; Tailwind classes sorted by `prettier-plugin-tailwindcss`. Both run via `npm run format`.
- **Path alias:** `@/*` → `src/*`.
- **Server Components by default.** Add `'use client'` only for the form.
- **Money:** integer cents everywhere in this codebase — but note the prize pool's `headline` is a **display string** (`'$2,100'`), not a number. Do not convert it.
- **Never render `draw_pass`** in any UI. Not applicable to this feature, but it holds.
- **Dark tokens only** — reuse `bg-slr-navy-card`, `text-slr-muted`, `text-slr-dim`, `text-slr-gold-label`, `goldButtonStyle`. No light mode, no new fonts.
- **Stage ladder is code-side:** `[100, 200, 300, 400, 500, 1000, 2000]`. PRD v3.2 §"Stage Prize Pool System" calls this table *"internal reference"*; it is deliberately not CMS-editable.
- **Stage derivation rule (PRD, verbatim):** *"current_stage is derived from paid_members — do NOT hardcode. The active stage is the highest stage whose threshold has been reached."*
- **Progress formula (PRD, verbatim):** *"Progress 'X more members until Stage N+1' = next_stage_threshold - paid_members … Progress bar = paid_members / next_threshold."*
- **Stage label rule (PRD, verbatim):** *"The 'For X Members' label = the active stage's threshold (e.g. 'For 100 Members' for Stage 1), NOT the real paid_members count."*
- **Two-phase delivery.** Tasks 1–5 are Phase 1 and may merge at any time. Tasks 6–7 are Phase 2 and merge **only** after `curl -s -o /dev/null -w '%{http_code}' https://api.smartliferewards.com.au/api/v1/public/prizes` returns `200`. Merging them early turns two working production pages into an error state.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/prizes.ts` (new) | Stage ladder constant + four pure derivation functions. Zero imports, zero I/O — this is why it is unit-testable. |
| `src/lib/prizes.test.ts` (new) | Vitest suite driving the derivation table from spec §9. |
| `vitest.config.ts` (new) | Resolves the `@/` alias; restricts the suite to `src/**/*.test.ts`. |
| `src/types/member.ts` (modify) | `PrizePool` loses its three derived fields; `PrizeStage` is deleted. |
| `src/lib/api/endpoints.ts` (modify) | New `prizes` namespace. |
| `src/lib/api/resources/prizes.ts` (new) | `getPrizePool` / `updatePrizePool` on top of `apiFetch`. |
| `src/app/dashboard/(routes)/prizes/page.tsx` (new) | Server: auth gate, fetch, error normalisation, shell. |
| `src/app/dashboard/(routes)/prizes/prizes-client.tsx` (new) | Client: RHF + Zod form, derived-stage readout, submit. |
| `src/app/dashboard/(routes)/prizes/actions.ts` (new) | Server action: save + revalidate. |
| `src/app/dashboard/(routes)/prizes/loading.tsx` (new) | Route skeleton. |
| `src/components/ui/nav-main.tsx` (modify) | One nav entry. |
| `src/app/member/prizes/page.tsx` (modify) | Derived stage label; then API + `EmptyState` in Phase 2. |
| `src/app/member/prizes/_components/stage-tracker.tsx` (modify) | Consumes `lib/prizes.ts`; corrects the progress formula. |
| `src/app/(home)/(routes)/prizes/page.tsx` (modify) | Phase 2: async fetch + ISR. |
| `src/app/(home)/(routes)/prizes/_components/membership-club-section.tsx` (modify) | Phase 2: accepts optional props. |
| `src/data/prizes.ts` (delete in Phase 2) | Mock source, retired once consumers read the API. |

---

## Task 1: Stage derivation module (Phase 1)

The riskiest piece in the feature and the only one with a machine-checkable contract — PRD supplies both the rules and a worked example. Built test-first.

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/prizes.test.ts`
- Create: `src/lib/prizes.ts`
- Modify: `package.json` (scripts + devDependency)

**Interfaces:**
- Consumes: nothing. `src/lib/prizes.ts` must import nothing — that is what keeps it trivially testable.
- Produces: `PRIZE_STAGES`, `ActiveStage { stage, threshold }`, `activeStage(paidMembers) → ActiveStage`, `nextThreshold(paidMembers) → number | null`, `nextStageNumber(paidMembers) → number | null`, `stageLabel(active) → string`, `StageProgress { pct, remaining }`, `stageProgress(paidMembers) → StageProgress`. Tasks 2, 5, 6 all consume these.

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest@^3
```

- [ ] **Step 2: Add the config**

Create `vitest.config.ts`:

```ts
import path from 'node:path';

import { defineConfig } from 'vitest/config';

// Scoped deliberately: this repo verifies with type-check/lint/build plus
// Playwright E2E. Vitest exists only for the pure stage-derivation maths in
// src/lib/prizes.ts, which encodes PRD rules that are easy to get subtly wrong.
export default defineConfig({
    resolve: {
        alias: { '@': path.resolve(__dirname, './src') }
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts']
    }
});
```

- [ ] **Step 3: Add the test scripts**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write the failing test**

Create `src/lib/prizes.test.ts`:

```ts
import { activeStage, nextStageNumber, nextThreshold, stageLabel, stageProgress } from '@/lib/prizes';

import { describe, expect, it } from 'vitest';

// Cases come straight from PRD v3.2 §"Stage Prize Pool System" — the 142-member
// row is PRD's own worked example, and the 99-member row is its pre-launch edge
// case ("if paid_members < 100 … show Stage 1 as the target").
describe('activeStage', () => {
    it.each([
        [0, 1, 100],
        [99, 1, 100],
        [100, 1, 100],
        [142, 1, 100],
        [199, 1, 100],
        [200, 2, 200],
        [999, 5, 500],
        [1000, 6, 1000],
        [2500, 7, 2000]
    ])('%i paid members → Stage %i (threshold %i)', (members, stage, threshold) => {
        expect(activeStage(members)).toEqual({ stage, threshold });
    });
});

describe('nextThreshold', () => {
    it.each([
        [99, 100],
        [142, 200],
        [200, 300],
        [1999, 2000]
    ])('%i counts toward %i', (members, target) => {
        expect(nextThreshold(members)).toBe(target);
    });

    it('returns null once the top stage is reached', () => {
        expect(nextThreshold(2000)).toBeNull();
        expect(nextThreshold(2500)).toBeNull();
    });
});

describe('nextStageNumber', () => {
    it.each([
        [99, 1],
        [142, 2],
        [200, 3]
    ])('%i is counting toward Stage %i', (members, stage) => {
        expect(nextStageNumber(members)).toBe(stage);
    });

    it('returns null at the top stage', () => {
        expect(nextStageNumber(2500)).toBeNull();
    });
});

describe('stageLabel', () => {
    it('uses the stage threshold, never the live member count', () => {
        expect(stageLabel(activeStage(142))).toBe('For 100 Members • Stage 1');
    });

    it('groups thousands', () => {
        expect(stageLabel(activeStage(2500))).toBe('For 2,000 Members • Stage 7');
    });
});

describe('stageProgress', () => {
    // PRD: "Progress bar = paid_members / next_threshold". The superseded
    // implementation used (current - base) / (target - base), which gave 42%
    // for the 142-member example instead of 71%.
    it.each([
        [99, 99, 1],
        [142, 71, 58],
        [200, 67, 100]
    ])('%i members → %i%% with %i remaining', (members, pct, remaining) => {
        expect(stageProgress(members)).toEqual({ pct, remaining });
    });

    it('is complete at the top stage', () => {
        expect(stageProgress(2500)).toEqual({ pct: 100, remaining: 0 });
    });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "@/lib/prizes"`.

- [ ] **Step 6: Write the implementation**

Create `src/lib/prizes.ts`:

```ts
/**
 * Stage prize pool derivation (PRD v3.2 §"Stage Prize Pool System").
 *
 * Only `current_members` is stored — every other stage figure is computed here.
 * PRD is explicit: "current_stage is derived from paid_members — do NOT
 * hardcode." Deriving also removes the failure mode where an admin types a
 * stage that contradicts the member count.
 *
 * This module imports nothing on purpose: it is pure arithmetic over PRD rules
 * and is covered by prizes.test.ts.
 */

/**
 * Stage thresholds in paid members (RED + BLUE combined, Visitors excluded).
 * PRD calls this table "internal reference" — code-side, not CMS-editable.
 */
export const PRIZE_STAGES = [100, 200, 300, 400, 500, 1000, 2000] as const;

export interface ActiveStage {
    /** 1-based stage number. */
    stage: number;
    /** The stage's member threshold — the figure shown as "For X Members". */
    threshold: number;
}

/**
 * The stage whose figures are on display: the highest one whose threshold has
 * been reached. Below the first threshold the pool is pre-launch, and PRD says
 * to show Stage 1 as the target — so Stage 1 is returned there too.
 */
export function activeStage(paidMembers: number): ActiveStage {
    let index = 0;

    for (let i = 0; i < PRIZE_STAGES.length; i++) {
        if (paidMembers >= PRIZE_STAGES[i]) index = i;
    }

    return { stage: index + 1, threshold: PRIZE_STAGES[index] };
}

/**
 * The threshold the progress bar counts toward, or null at the top stage.
 * Pre-launch counts toward Stage 1's own threshold rather than Stage 2's.
 */
export function nextThreshold(paidMembers: number): number | null {
    return PRIZE_STAGES.find((threshold) => paidMembers < threshold) ?? null;
}

/** The stage number being counted toward, or null at the top stage. */
export function nextStageNumber(paidMembers: number): number | null {
    const index = PRIZE_STAGES.findIndex((threshold) => paidMembers < threshold);

    return index === -1 ? null : index + 1;
}

/** e.g. 'For 100 Members • Stage 1'. Built from the threshold, never the live count. */
export function stageLabel(active: ActiveStage): string {
    return `For ${active.threshold.toLocaleString('en-AU')} Members • Stage ${active.stage}`;
}

export interface StageProgress {
    /** 0–100, clamped and rounded. */
    pct: number;
    /** Members still needed to reach the next threshold; 0 at the top stage. */
    remaining: number;
}

export function stageProgress(paidMembers: number): StageProgress {
    const target = nextThreshold(paidMembers);

    if (target === null) return { pct: 100, remaining: 0 };

    return {
        pct: Math.min(100, Math.max(0, Math.round((paidMembers / target) * 100))),
        remaining: Math.max(0, target - paidMembers)
    };
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — 5 suites, 26 assertions.

- [ ] **Step 8: Type-check and format**

```bash
npm run format
npm run type-check
```
Expected: both clean.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/prizes.ts src/lib/prizes.test.ts
git commit -m "feat(prizes): derive stage figures from the paid-member count

PRD v3.2 states current_stage is derived from paid_members and must not
be hardcoded. This adds the derivation as pure functions so the rule is
enforced in one place rather than re-implemented per consumer.

Vitest is introduced scoped to this module only. The repo otherwise
verifies via type-check/lint/build plus Playwright, which cannot
reasonably cover arithmetic with four PRD-specified edge cases.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: Retire the stored stage fields (Phase 1)

Trims the type and moves both member-page consumers onto Task 1's derivations. This corrects the progress-bar formula, so it is a user-visible fix that needs no backend.

**Files:**
- Modify: `src/types/member.ts` (the Prizes block, currently lines 134–161)
- Modify: `src/data/prizes.ts`
- Modify: `src/app/member/prizes/page.tsx`
- Modify: `src/app/member/prizes/_components/stage-tracker.tsx`

**Interfaces:**
- Consumes: `activeStage`, `nextStageNumber`, `stageLabel`, `stageProgress` from Task 1.
- Produces: the trimmed `PrizePool { headline, prizes_sublabel, current_members, odds_label, tiers }`. Tasks 3, 5, 6, 7 all use this shape.

- [ ] **Step 1: Trim the type**

In `src/types/member.ts`, delete the `PrizeStage` interface entirely and replace `PrizePool` with:

```ts
export interface PrizePool {
    headline: string; // CMS text, e.g. '$2,100'
    prizes_sublabel: string; // e.g. '@ 22 Prizes • One Month'
    current_members: number; // paid members, typed by admin (PRD §3.2 "total members")
    odds_label: string; // e.g. '9 in 10 wins yearly'
    tiers: PrizeTierBreakdown[];
}
```

Leave `PrizeTierBreakdown` exactly as it is. Update the block comment above it to note that stage figures are derived in `@/lib/prizes`.

- [ ] **Step 2: Trim the mock constant**

In `src/data/prizes.ts`, delete the `stage_label`, `current_stage` and `stages` properties from `PRIZE_POOL`. Keep everything else, including `current_members: 142`. The file keeps its existing `getPrizePool()` export — Task 6 replaces it.

- [ ] **Step 3: Derive the hero label**

In `src/app/member/prizes/page.tsx`, add the import:

```ts
import { activeStage, stageLabel } from '@/lib/prizes';
```

Inside the component, after the existing `const memberGroup = …` line:

```tsx
const stage = activeStage(pool.current_members);
```

Then replace `{pool.stage_label}` in the hero with `{stageLabel(stage)}`.

- [ ] **Step 4: Rewrite the stage tracker's maths**

In `src/app/member/prizes/_components/stage-tracker.tsx`, replace the whole derivation preamble — the `current` / `next` / `base` / `target` / `pct` / `remaining` block at the top of the component — with:

```tsx
const stage = activeStage(pool.current_members);
const nextStage = nextStageNumber(pool.current_members);
const { pct, remaining } = stageProgress(pool.current_members);
```

Add the import:

```ts
import { PRIZE_STAGES, activeStage, nextStageNumber, stageProgress } from '@/lib/prizes';
```

In the JSX, replace `Stage {pool.current_stage}` with `Stage {stage.stage}`, and change the progress caption's condition from `next ?` to `nextStage !== null ?` with `Stage {nextStage}` as the target. Replace the `pool.stages.map(...)` chip row with:

```tsx
{PRIZE_STAGES.map((threshold, index) => {
    const reached = pool.current_members >= threshold;
    const isCurrent = index + 1 === stage.stage;

    return (
        <span
            key={threshold}
            className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums',
                isCurrent
                    ? 'border-slr-gold-label/40 bg-gold-tint text-slr-gold-label'
                    : reached
                      ? 'border-white/10 text-white/70'
                      : 'text-slr-dim border-white/5'
            )}>
            Stage {index + 1} · {threshold.toLocaleString('en-AU')}
        </span>
    );
})}
```

- [ ] **Step 5: Verify**

```bash
npm run format
npm run type-check
npm run lint
npm test
```
Expected: all clean. `type-check` failing here means a consumer of the deleted fields was missed — fix it rather than restoring the fields.

- [ ] **Step 6: Confirm the bug fix visually**

Run `npm run dev`, sign in as a member, open `/member/prizes`. With `current_members: 142` the bar must read **71%** and the caption **"58 more members until Stage 2"**. Before this task it read 42%.

- [ ] **Step 7: Commit**

```bash
git add src/types/member.ts src/data/prizes.ts src/app/member/prizes/
git commit -m "fix(prizes): use PRD's progress formula and derive the stage label

The tracker computed progress as (current-base)/(target-base); PRD
specifies paid_members/next_threshold. At the mock's 142 members that
rendered 42% instead of the intended 71%, and PRD's own worked example
('142 paid → 58 more until Stage 2') confirms the reading.

Drops stage_label, current_stage and stages from PrizePool — all three
are now derived, so they can no longer drift from the member count.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: API endpoint map and resource (Phase 1)

**Files:**
- Modify: `src/lib/api/endpoints.ts`
- Create: `src/lib/api/resources/prizes.ts`

**Interfaces:**
- Consumes: `PrizePool` from Task 2; `apiFetch` from `@/lib/api/http`; `API` from `@/lib/api/endpoints`.
- Produces: `getPrizePool(): Promise<PrizePool>` and `updatePrizePool(token: string, payload: PrizePool): Promise<PrizePool>`. Tasks 4, 5, 6, 7 consume these.

- [ ] **Step 1: Add the endpoint namespace**

In `src/lib/api/endpoints.ts`, add after the `notifications` namespace:

```ts
    // Proposed 2026-08-08 — both routes return 404 today (verified live).
    // See docs/superpowers/specs/2026-08-08-admin-prizes-cms-design.md §4.
    prizes: {
        public: '/api/v1/public/prizes',
        update: '/api/v1/admin/prizes'
    },
```

- [ ] **Step 2: Write the resource**

Create `src/lib/api/resources/prizes.ts`:

```ts
import { cache } from 'react';

import type { PrizePool } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * The stage prize pool document (PRD §"Stage Prize Pool System").
 *
 * Read from the public endpoint: the unauthenticated marketing page at /prizes
 * consumes it alongside the member page, following the /public/discounts
 * precedent. Cached for 5 minutes — the figures change only when an admin edits
 * them, and the save action revalidates both consumer routes.
 */
export const getPrizePool = cache(() => {
    return apiFetch<PrizePool>(API.prizes.public, { revalidate: 300 });
});

/** Full-document replace. Admin only. */
export function updatePrizePool(token: string, payload: PrizePool) {
    return apiFetch<PrizePool>(API.prizes.update, {
        method: 'PUT',
        token,
        body: payload
    });
}
```

- [ ] **Step 3: Verify**

```bash
npm run format
npm run type-check
npm run lint
```
Expected: all clean.

- [ ] **Step 4: Commit**

```bash
git add src/lib/api/endpoints.ts src/lib/api/resources/prizes.ts
git commit -m "feat(prizes): add prize pool endpoints and resource

Read goes through /public/prizes because the unauthenticated marketing
page consumes the same document as the member page, matching the
existing /public/discounts precedent.

Both routes 404 today; consumers are wired in a later phase once the
backend answers.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: Admin route, read-only (Phase 1)

Renders the current document and the derived stage readout. No editing yet, so the route can be reviewed on its own.

**Files:**
- Create: `src/app/dashboard/(routes)/prizes/page.tsx`
- Create: `src/app/dashboard/(routes)/prizes/loading.tsx`
- Modify: `src/components/ui/nav-main.tsx`

**Interfaces:**
- Consumes: `getPrizePool` (Task 3); `activeStage`, `stageLabel`, `stageProgress`, `nextStageNumber` (Task 1); `getAccessToken`, `handleApiAuthError`, `toListError`, `ListErrorCard`, `DashboardPageShell`, `Heading`.
- Produces: the `/dashboard/prizes` route. Task 5 replaces the read-only body with the form.

- [ ] **Step 1: Add the nav entry**

In `src/components/ui/nav-main.tsx`, add `Sparkles` to the `lucide-react` import (keep the list alphabetical) and insert into `ITEMS` immediately after the Winners entry:

```ts
    { title: 'Prizes', href: '/dashboard/prizes', icon: Sparkles },
```

`Gift` and `Trophy` are already taken by Giveaways and Winners.

- [ ] **Step 2: Add the loading skeleton**

Create `src/app/dashboard/(routes)/prizes/loading.tsx`:

```tsx
import { DetailSkeleton } from '@/components/common/skeletons';

export default function Loading() {
    return <DetailSkeleton />;
}
```

- [ ] **Step 3: Write the page**

Create `src/app/dashboard/(routes)/prizes/page.tsx`:

```tsx
import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import { type ListError, ListErrorCard } from '@/components/common/list-error-card';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { toListError } from '@/lib/api/list-error';
import { getPrizePool } from '@/lib/api/resources/prizes';
import { getAccessToken } from '@/lib/api/server';
import { activeStage, nextStageNumber, stageLabel, stageProgress } from '@/lib/prizes';
import type { PrizePool } from '@/types/member';

export default async function PrizesPage() {
    // The read itself is public; the token gates the route and is what the save
    // action will need in Task 5.
    await getAccessToken();

    let pool: PrizePool | null = null;
    let listError: ListError | null = null;

    try {
        pool = await getPrizePool();
    } catch (error) {
        handleApiAuthError(error); // 401 → force logout; other errors fall through
        listError = toListError(error);
    }

    const stage = pool ? activeStage(pool.current_members) : null;
    const progress = pool ? stageProgress(pool.current_members) : null;
    const nextStage = pool ? nextStageNumber(pool.current_members) : null;

    return (
        <DashboardPageShell>
            <Heading title='Prizes' description='Edit the prize pool shown on the Prizes page' />

            {listError ? (
                <ListErrorCard
                    error={listError}
                    title='Could not load the prize pool'
                    description='The prizes endpoint is not available yet. See docs/BACKEND-ISSUES.md.'
                />
            ) : null}

            {pool && stage && progress ? (
                <dl className='max-w-4xl space-y-2 text-sm'>
                    <div className='flex gap-2'>
                        <dt className='text-muted-foreground w-40'>Headline</dt>
                        <dd>{pool.headline}</dd>
                    </div>
                    <div className='flex gap-2'>
                        <dt className='text-muted-foreground w-40'>Sub-label</dt>
                        <dd>{pool.prizes_sublabel}</dd>
                    </div>
                    <div className='flex gap-2'>
                        <dt className='text-muted-foreground w-40'>Odds</dt>
                        <dd>{pool.odds_label}</dd>
                    </div>
                    <div className='flex gap-2'>
                        <dt className='text-muted-foreground w-40'>Paid members</dt>
                        <dd className='tabular-nums'>{pool.current_members.toLocaleString('en-AU')}</dd>
                    </div>
                    <div className='flex gap-2'>
                        <dt className='text-muted-foreground w-40'>Derived stage</dt>
                        <dd>
                            {stageLabel(stage)} · {progress.pct}%
                            {nextStage !== null
                                ? ` · ${progress.remaining.toLocaleString('en-AU')} more until Stage ${nextStage}`
                                : ' · top stage'}
                        </dd>
                    </div>
                </dl>
            ) : null}
        </DashboardPageShell>
    );
}
```

- [ ] **Step 4: Verify**

```bash
npm run format
npm run type-check
npm run lint
npm run build
```
Expected: all clean.

- [ ] **Step 5: Check it in the browser**

Run `npm run dev`, sign in as an admin, open `/dashboard/prizes`. Expect the **Prizes** sidebar item to be highlighted and a `ListErrorCard` reading `status 404` — that is correct until the backend lands.

- [ ] **Step 6: Commit**

```bash
git add "src/app/dashboard/(routes)/prizes" src/components/ui/nav-main.tsx
git commit -m "feat(prizes): add the admin Prizes route

PRD §3.2 lists Prizes / Stage as an admin section. Read-only for now so
the route, nav entry and error path can be reviewed before the form
lands. Shows the derived stage alongside the stored fields to make the
derivation visible to admins.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: Admin form and save action (Phase 1)

**Files:**
- Create: `src/app/dashboard/(routes)/prizes/actions.ts`
- Create: `src/app/dashboard/(routes)/prizes/prizes-client.tsx`
- Modify: `src/app/dashboard/(routes)/prizes/page.tsx`

**Interfaces:**
- Consumes: `updatePrizePool` (Task 3); `PrizePool` (Task 2); derivations (Task 1).
- Produces: `savePrizePoolAction(payload: PrizePool): Promise<ActionResult<PrizePool>>` and the `PrizesClient` component.

- [ ] **Step 1: Write the server action**

Create `src/app/dashboard/(routes)/prizes/actions.ts`. The `ActionResult` / `toActionError` shape is copied from `(routes)/ebooks/actions.ts` so the dashboard stays uniform:

```ts
'use server';

import { revalidatePath } from 'next/cache';

import { handleApiAuthError } from '@/lib/api/guard';
import { updatePrizePool } from '@/lib/api/resources/prizes';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type { PrizePool } from '@/types/member';

export type ActionError = {
    ok: false;
    message: string;
    status?: number;
    code?: string | null;
    requestId?: string | null;
};

export type ActionResult<T> = { ok: true; data: T; message: string } | ActionError;

function toActionError(error: unknown): ActionError {
    // 401 (expired/invalid session) → redirect('/api/auth/logout'), never returns.
    handleApiAuthError(error);

    if (error instanceof ApiError) {
        const payload = error.payload as { code?: string; requestId?: string } | undefined;

        return {
            ok: false,
            message: error.message,
            status: error.status,
            code: payload?.code ?? null,
            requestId: payload?.requestId ?? null
        };
    }

    return { ok: false, message: 'Something went wrong. Please try again.' };
}

export async function savePrizePoolAction(payload: PrizePool): Promise<ActionResult<PrizePool>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updatePrizePool(token, payload);

        revalidatePath('/dashboard/prizes');
        revalidatePath('/member/prizes');
        revalidatePath('/prizes');

        return { ok: true, data, message: 'Prize pool saved.' };
    } catch (error) {
        return toActionError(error);
    }
}
```

- [ ] **Step 2: Write the client form**

Create `src/app/dashboard/(routes)/prizes/prizes-client.tsx`:

```tsx
'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { activeStage, nextStageNumber, stageLabel, stageProgress } from '@/lib/prizes';
import type { PrizePool } from '@/types/member';
import { zodResolver } from '@hookform/resolvers/zod';

import { savePrizePoolAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { type Resolver, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// tier_group is fixed: the three rows always exist and are never added or
// removed, so the form edits their copy only.
const TIER_ROWS = [
    { tier_group: 'visitor', heading: 'Visitor' },
    { tier_group: 'red', heading: 'SLR RED' },
    { tier_group: 'blue', heading: 'SLR BLUE' }
] as const;

const formSchema = z.object({
    headline: z.string().min(1, 'Headline is required'),
    prizes_sublabel: z.string().min(1, 'Sub-label is required'),
    odds_label: z.string().min(1, 'Odds label is required'),
    current_members: z.coerce.number().int('Must be a whole number').min(0, 'Must be 0 or more'),
    tiers: z
        .array(
            z.object({
                tier_group: z.enum(['visitor', 'red', 'blue']),
                tier_label: z.string().min(1, 'Required'),
                price_label: z.string().min(1, 'Required'),
                weekly: z.string().min(1, 'Required'),
                // Visitor has no monthly bonus — empty is serialised back to null.
                monthly: z.string()
            })
        )
        .length(3)
});

type FormValues = z.infer<typeof formSchema>;

export function PrizesClient({ pool }: { pool: PrizePool }) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: {
            headline: pool.headline,
            prizes_sublabel: pool.prizes_sublabel,
            odds_label: pool.odds_label,
            current_members: pool.current_members,
            tiers: TIER_ROWS.map(({ tier_group }) => {
                const existing = pool.tiers.find((tier) => tier.tier_group === tier_group);

                return {
                    tier_group,
                    tier_label: existing?.tier_label ?? '',
                    price_label: existing?.price_label ?? '',
                    weekly: existing?.weekly ?? '',
                    monthly: existing?.monthly ?? ''
                };
            })
        }
    });

    // Recomputed as the admin types, so the effect of current_members is visible
    // without letting them desynchronise the stage by hand.
    const members = Number(useWatch({ control: form.control, name: 'current_members' })) || 0;
    const stage = activeStage(members);
    const progress = stageProgress(members);
    const nextStage = nextStageNumber(members);

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            const result = await savePrizePoolAction({
                headline: values.headline,
                prizes_sublabel: values.prizes_sublabel,
                odds_label: values.odds_label,
                current_members: values.current_members,
                tiers: values.tiers.map((tier) => ({
                    ...tier,
                    monthly: tier.monthly.trim() === '' ? null : tier.monthly
                }))
            });

            if (result.ok) {
                toast.success(result.message);
                form.reset(values);
            } else {
                toast.error(result.message, {
                    description: result.status ? `status ${result.status} · ${result.code ?? 'no code'}` : undefined
                });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='max-w-4xl space-y-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Prize pool</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='headline'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Headline</FormLabel>
                                    <FormControl>
                                        <Input placeholder='$2,100' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='prizes_sublabel'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sub-label</FormLabel>
                                    <FormControl>
                                        <Input placeholder='@ 22 Prizes • One Month' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='odds_label'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Odds</FormLabel>
                                    <FormControl>
                                        <Input placeholder='9 in 10 wins yearly' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='current_members'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Paid members</FormLabel>
                                    <FormControl>
                                        <Input type='number' min={0} step={1} {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {stageLabel(stage)} · progress {progress.pct}%
                                        {nextStage !== null
                                            ? ` · ${progress.remaining.toLocaleString('en-AU')} more until Stage ${nextStage}`
                                            : ' · top stage reached'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Prize breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        {TIER_ROWS.map((row, index) => (
                            <div key={row.tier_group} className='space-y-3'>
                                <p className='text-sm font-semibold'>{row.heading}</p>
                                <div className='grid gap-3 sm:grid-cols-2'>
                                    <FormField
                                        control={form.control}
                                        name={`tiers.${index}.tier_label`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tier label</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`tiers.${index}.price_label`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price label</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`tiers.${index}.weekly`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Weekly</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`tiers.${index}.monthly`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Monthly</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormDescription>Leave empty when the tier has none.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Button type='submit' disabled={isPending}>
                    {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                    Save changes
                </Button>
            </form>
        </Form>
    );
}
```

- [ ] **Step 3: Swap the read-only body for the form**

In `src/app/dashboard/(routes)/prizes/page.tsx`, delete the `<dl>` block and the three derivation consts (`stage`, `progress`, `nextStage`) along with their now-unused imports from `@/lib/prizes`, and render instead:

```tsx
{pool ? <PrizesClient pool={pool} /> : null}
```

Add `import { PrizesClient } from './prizes-client';`.

- [ ] **Step 4: Verify**

```bash
npm run format
npm run type-check
npm run lint
npm run build
npm test
```
Expected: all clean.

- [ ] **Step 5: Check the derived readout in the browser**

The endpoint still 404s, so the form will not render from live data yet. To exercise it, temporarily stub the page's `pool` with the §4 sample document, then confirm: typing `142` shows *"For 100 Members • Stage 1 · progress 71% · 58 more until Stage 2"*; `99` shows Stage 1 with 99%; `2500` shows Stage 7 and *"top stage reached"*. **Remove the stub before committing.**

- [ ] **Step 6: Commit**

```bash
git add "src/app/dashboard/(routes)/prizes"
git commit -m "feat(prizes): add the prize pool editor form

Single-document form — no list, no create/delete — matching PRD's
'minimal CMS (one editable page)'. The three tier rows are fixed;
only their copy is editable.

The derived stage is shown live under the member count so admins can
see what their number produces, while remaining unable to set the
stage independently.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6: Member page reads the API — PHASE 2 (backend-gated)

> **Do not start** until `curl -s -o /dev/null -w '%{http_code}' https://api.smartliferewards.com.au/api/v1/public/prizes` returns `200`. Starting early replaces a working page with an error state.

**Files:**
- Modify: `src/app/member/prizes/page.tsx`

**Interfaces:**
- Consumes: `getPrizePool` (Task 3); `EmptyState` from `@/components/common/empty-state`.
- Produces: nothing new.

- [ ] **Step 1: Confirm the gate is open**

```bash
curl -s https://api.smartliferewards.com.au/api/v1/public/prizes | head -c 400
```
Expected: the document from spec §4. Diff every field name against §4 and log any mismatch in `docs/BACKEND-ISSUES.md` per [RULES.md](../../../RULES.md) §5 before continuing.

- [ ] **Step 2: Swap the data source**

In `src/app/member/prizes/page.tsx`, replace the `@/data/prizes` import with `import { getPrizePool } from '@/lib/api/resources/prizes';`, and wrap the fetch so a failure is caught rather than thrown:

```tsx
let pool: PrizePool | null = null;

try {
    pool = await getPrizePool();
} catch {
    pool = null;
}

const member = await getCurrentMember();
```

Note this replaces the existing `Promise.all([getPrizePool(), getCurrentMember()])`; the member fetch keeps its own behaviour.

- [ ] **Step 3: Render the error state**

Still in the same file, keep the `<header>` and return early when `pool` is null:

```tsx
if (!pool) {
    return (
        <div className='mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8'>
            <header className='space-y-1'>
                <h1 className='font-bebas-neue text-3xl tracking-wide uppercase sm:text-4xl'>Prizes</h1>
            </header>
            <EmptyState
                icon={Trophy}
                title='Prize pool unavailable'
                description='We could not load the current prize pool. Please check back shortly.'
            />
        </div>
    );
}
```

Add `import EmptyState from '@/components/common/empty-state';` and `Trophy` to the `lucide-react` import. `ListErrorCard` is deliberately **not** used here — it exposes `requestId` and raw status, which is debug output rather than member UX.

- [ ] **Step 4: Verify**

```bash
npm run format
npm run type-check
npm run lint
npm run build
```

- [ ] **Step 5: Exercise both paths**

With `npm run dev`: `/member/prizes` shows the live figures and the corrected progress bar. Then set `NEXT_PUBLIC_API_BASE` to a bad host, restart, and confirm the page renders `EmptyState` — never a crash, never stale numbers.

- [ ] **Step 6: Commit**

```bash
git add src/app/member/prizes/page.tsx
git commit -m "feat(prizes): read the member prize pool from the API

Falls back to an EmptyState rather than cached copy on failure. Prize
figures are TPAL-regulated promotional claims, so silently serving a
stale pool is worse than showing nothing.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 7: Public page reads the API — PHASE 2 (backend-gated)

> Same gate as Task 6.

**Files:**
- Modify: `src/app/(home)/(routes)/prizes/page.tsx`
- Modify: `src/app/(home)/(routes)/prizes/_components/membership-club-section.tsx`
- Delete: `src/data/prizes.ts`

**Interfaces:**
- Consumes: `getPrizePool` (Task 3).
- Produces: `MembershipClubSection` gains `{ headline?: string; sublabel?: string }`.

- [ ] **Step 1: Accept props in the section**

In `membership-club-section.tsx`, change the signature to:

```tsx
const MembershipClubSection = ({ headline, sublabel }: { headline?: string; sublabel?: string }) => {
```

Replace the hardcoded `$2100` (line 32) with `{headline}` and `@ 22 Prizes • One Month` (line 35) with `{sublabel}`. Immediately inside the component body, drop the whole prize-pool card when the data is missing:

```tsx
    const hasPool = Boolean(headline && sublabel);
```

Wrap only the `<div className='mx-auto mt-12 w-full max-w-xs rounded-2xl p-0.5' …>` block in `{hasPool ? ( … ) : null}`. The "Membership Club" wordmark above it always renders. All gradient and glow styling is untouched.

- [ ] **Step 2: Fetch on the page**

Rewrite `src/app/(home)/(routes)/prizes/page.tsx`:

```tsx
import { getPrizePool } from '@/lib/api/resources/prizes';
import type { PrizePool } from '@/types/member';

import WelcomeSection from '../(membership)/_components/welcome-section';
import MembershipClubSection from './_components/membership-club-section';
import SlrLifeTiersSection from './_components/slr-life-tiers-section';
import VisitorRedBlueSection from './_components/visitor-red-blue-section';

export const revalidate = 300;

const Page = async () => {
    // A marketing page must not show an error card to prospects: on failure the
    // prize-pool card is omitted and the rest of the page still sells.
    let pool: PrizePool | null = null;

    try {
        pool = await getPrizePool();
    } catch {
        pool = null;
    }

    return (
        <main className='bg-slr-ink pt-12'>
            <MembershipClubSection headline={pool?.headline} sublabel={pool?.prizes_sublabel} />
            <VisitorRedBlueSection />
            <WelcomeSection />
            <SlrLifeTiersSection />
        </main>
    );
};

export default Page;
```

`VisitorRedBlueSection` and `SlrLifeTiersSection` are **not** modified — their tier cards stay hardcoded per spec §3.2.

- [ ] **Step 3: Delete the mock**

```bash
git rm src/data/prizes.ts
```

- [ ] **Step 4: Verify**

```bash
npm run format
npm run type-check
npm run lint
npm run build
npm test
```
Expected: all clean. A `type-check` failure here means something still imports `@/data/prizes` — rewire it to the resource.

- [ ] **Step 5: Exercise both paths**

`/prizes` shows the CMS headline. With a bad `NEXT_PUBLIC_API_BASE`, the prize-pool card disappears while the wordmark, tier cards and CTA all still render.

- [ ] **Step 6: Refresh the knowledge graph and commit**

```bash
graphify update .
git add "src/app/(home)/(routes)/prizes" src/data/prizes.ts
git commit -m "feat(prizes): drive the public prize pool figure from the CMS

The marketing page degrades by omitting the prize-pool card rather than
showing an error, since the tier cards and CTA below remain valid.

Retires the data/prizes.ts mock now that both consumers read the API.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:** §3.1 derived fields → Tasks 1–2. §3.2 flat rewards / hardcoded public tier cards → Task 2 (type untouched) and Task 7 Step 2 (sections not modified). §3.3 three different failure behaviours → Task 4 (`ListErrorCard`), Task 6 (`EmptyState`), Task 7 (omitted card). §4 contract → Task 3, verified at Task 6 Step 1. §5 data layer → Tasks 1–3. §6 admin editor → Tasks 4–5. §7 consumer pages → Tasks 6–7. §8 two-phase rollout → the Global Constraints gate plus the banners on Tasks 6 and 7. §9 verification → Task 1's suite covers the derivation table; endpoint and manual checks are distributed across tasks. §10 file touch list → matches the File Structure table. §11 backend asks → Task 6 Step 1 diffs the live payload and routes deviations to `BACKEND-ISSUES.md`. **No gaps.**

**Placeholder scan:** no TBD/TODO. Every code step carries complete code. Task 5 Step 5 describes a deliberate temporary stub and explicitly requires its removal before commit. ✔

**Type consistency:** `PrizePool` is trimmed once in Task 2 and used identically in Tasks 3, 5, 6, 7. `activeStage` returns `ActiveStage { stage, threshold }` in Task 1 and is destructured as `stage.stage` / `stage.threshold` everywhere after. `stageProgress` returns `{ pct, remaining }` and is destructured that way in Tasks 2, 4, 5. `nextStageNumber` returns `number | null` and every consumer tests `!== null`. `savePrizePoolAction` returns `ActionResult<PrizePool>` and the client branches on `result.ok` / `result.message` / `result.status` / `result.code` — all present on that union. `stageLabel` takes an `ActiveStage`, never a raw number, at all three call sites. ✔

**One deliberate scope note:** Task 2 changes what members see (progress 42% → 71%) while still in Phase 1. That is intended — it is a PRD-conformance bug fix with no backend dependency, and holding it back until Phase 2 would leave a known-wrong figure on screen for no reason.
