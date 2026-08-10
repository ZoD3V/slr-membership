# Sprint 4 Admin Contract Rewire Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the Admin Prizes, Safe Hours, and Spin Wheel panels (shipped earlier this sprint against guessed shapes) to match the real API document the user provided on 2026-08-09.

**Architecture:** Three independent, self-contained tasks — one per admin panel. No task depends on another's output; all three touch different sections of the shared `src/types/member.ts` file and can be done in any order. Each task replaces the panel's types, resource functions, seed data, and form UI in place — no new routes, no new files except where noted.

**Tech Stack:** Next.js 16 App Router (Server Components + Server Actions), React Hook Form + Zod 4, shadcn/ui, Tailwind v4.

## Global Constraints

- **All four endpoints are LIVE and were verified against production with a real admin token on 2026-08-10.** Earlier notes in this repo claiming they were 404 came from probes that omitted the `/api/v1` prefix — that claim was wrong; never repeat it in code comments or UI copy. Verified state:

  | Endpoint | Result |
  | --- | --- |
  | `GET /api/v1/admin/prizes` | **200** — payload matches the API doc field-for-field, except `updated_at` came back `null` |
  | `GET /api/v1/admin/spin/history` | **200** — keys and `meta` match the doc exactly; `?moment=pre_renewal` accepted, `?moment=renewal` rejected with `VALIDATION_ERROR` (confirms the `pre_renewal` spelling) |
  | `GET /api/v1/admin/spin/history?tier=<any value>` | **500 INTERNAL_ERROR** — `r4`, `R4`, and `Plus` all crash the endpoint |
  | `GET /api/v1/admin/safe-hours` | **500 INTERNAL_ERROR** |
  | `GET /api/v1/admin/spin/config` | **500 INTERNAL_ERROR** |

- Every page keeps its seed document as a defensive fallback, but the placeholder banner must NOT claim the endpoint is missing. Use the exact copy given per task: `Couldn't load the current <thing> — showing defaults. Saving may fail.` Save still calls the real endpoint and fails loudly via toast.
- **Never issue a write (PUT/POST/DELETE) against the production API while implementing or verifying this plan.** It holds real member data. Verification is read-only; Save buttons are exercised only by the user, never by an implementer or reviewer.
- No automated test suite covers these admin CRUD routes today (only `src/lib/prizes.ts`'s pure derivation math has a Vitest suite, and it is untouched by this plan). Verify each task via `npm run type-check`, a scoped `npx eslint`, `npm run build`, and a hand-traced walk of the failure paths in the task report — not TDD. This is a deliberate deviation from this skill's default TDD framing, matching how the Prizes/Safe Hours/Spin panels were originally built this sprint.
- `npm run lint` is broken in this repo (mis-parses its `next lint` invocation) — use `npx eslint <paths>` instead, never `npm run lint`.
- `npm run format` reformats the whole repo if run unscoped. Run `npx prettier --write <files you touched>` only, or run it unscoped and `git checkout -- <files you didn't mean to touch>` before committing.
- Every admin `<SelectContent>` needs `className='dashboard-theme dark'` — established convention, already present in the code being edited; preserve it.
- Money is always integer cents. Time-of-day values are `'HH:MM'` 24-hour strings (not epoch/Date objects).
- Do **not** touch `src/types/member.ts`'s `PrizePool`/`PrizeTierBreakdown` types, `src/lib/prizes.ts`, `src/lib/prizes.test.ts`, `src/app/member/prizes/**`, `src/app/(home)/**prizes**` (public marketing page), or `src/lib/safe-hours.ts` (member-facing advisory constant) — all explicitly out of scope per the design spec (`docs/superpowers/specs/2026-08-09-admin-sprint4-contract-rewire-design.md` §2.1/§2.3).
- Run `graphify update .` once all three tasks are merged.

---

### Task 1: Prizes admin panel — rewire to real `/admin/prizes` document

**Files:**
- Modify: `src/types/member.ts` (insert after the `PrizePool` interface, currently ending at line 155)
- Modify: `src/lib/api/endpoints.ts`
- Modify: `src/lib/api/resources/prizes.ts`
- Modify: `src/app/dashboard/(routes)/prizes/seed.ts`
- Modify: `src/app/dashboard/(routes)/prizes/page.tsx`
- Modify: `src/app/dashboard/(routes)/prizes/prizes-client.tsx`
- Modify: `src/app/dashboard/(routes)/prizes/actions.ts`

**Interfaces:**
- Consumes: nothing from other tasks in this plan.
- Produces: nothing consumed by other tasks in this plan. `PrizeContent`/`PrizeContentUpdatePayload` are new exports from `src/types/member.ts`, additive only — no existing export in that file is renamed or removed by this task.

- [ ] **Step 1: Add the `PrizeContent` type**

In `src/types/member.ts`, immediately after the closing `}` of the `PrizePool` interface (line 155), insert:

```ts

// ── Admin Prize Content (real API, 2026-08-09) ───────────────────────────────
// Flat CMS document returned by GET/PUT /admin/prizes. Distinct from PrizePool
// above, which models a still-unconfirmed public/member document on a
// different, still-404 endpoint (Phase 2, not touched by this rewire).
export interface PrizeContent {
    prize_pool_headline: string;
    prize_count: string;
    stage_label: string;
    visitor_prize: string;
    red_weekly: string;
    red_monthly: string;
    blue_weekly: string;
    blue_monthly: string;
    odds: string;
    // Nullable: the live endpoint returned `null` here on 2026-08-10 even
    // though the API doc's example shows an ISO string.
    updated_at: string | null;
}

export type PrizeContentUpdatePayload = Omit<PrizeContent, 'updated_at'>;
```

Do not modify anything else in this file for this task — `PrizePool`/`PrizeTierBreakdown` above it stay exactly as they are.

- [ ] **Step 2: Add the admin endpoint**

In `src/lib/api/endpoints.ts`, inside the `admin: { ... }` object, add a `prizes` entry (alphabetical position doesn't matter — put it near `safeHours`/`spinConfig` for locality):

```ts
        safeHours: '/api/v1/admin/safe-hours',
        spinHistory: '/api/v1/admin/spin/history',
        spinConfig: '/api/v1/admin/spin/config',
        prizes: '/api/v1/admin/prizes'
```

Then, in the `prizes: { ... }` object (separate from `admin`), remove the `update` line entirely — it pointed at the same path with the old, wrong-shaped `PrizePool` type. Leave `public: '/api/v1/public/prizes'` untouched:

```ts
    prizes: {
        public: '/api/v1/public/prizes'
    },
```

- [ ] **Step 3: Rewrite the prizes resource file**

Replace the full contents of `src/lib/api/resources/prizes.ts` with:

```ts
import { cache } from 'react';

import type { PrizeContent, PrizeContentUpdatePayload, PrizePool } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * The stage prize pool document (PRD §"Stage Prize Pool System").
 *
 * Read from the public endpoint: the unauthenticated marketing page at /prizes
 * consumes it alongside the member page, following the /public/discounts
 * precedent. Cached for 5 minutes — the figures change only when an admin edits
 * them, and the save action revalidates both consumer routes.
 *
 * Untouched by the 2026-08-09 contract rewire — this is a different, still-
 * unconfirmed document on a different endpoint from the admin CMS below.
 */
export const getPrizePool = cache(() => {
    return apiFetch<PrizePool>(API.prizes.public, { revalidate: 300 });
});

/**
 * The admin-editable Prizes CMS document (real API, 2026-08-09). Admin-gated
 * in both directions, so neither function is wrapped in cache().
 */
export function getAdminPrizeContent(token: string) {
    return apiFetch<PrizeContent>(API.admin.prizes, { token });
}

export function updateAdminPrizeContent(token: string, payload: PrizeContentUpdatePayload) {
    return apiFetch<PrizeContent>(API.admin.prizes, {
        method: 'PUT',
        token,
        body: payload
    });
}
```

This removes the old `updatePrizePool` function. Before moving on, confirm nothing else in the codebase still imports it:

Run: `grep -rn "updatePrizePool" src/`
Expected: no matches outside this file's git history (the only caller was the old `prizes-client.tsx`, rewritten in Step 6).

- [ ] **Step 4: Replace the seed document**

Replace the full contents of `src/app/dashboard/(routes)/prizes/seed.ts` with:

```ts
import type { PrizeContent } from '@/types/member';

/**
 * Defensive fallback the editor renders against when `GET /api/v1/admin/prizes`
 * cannot be read (network error, or a non-401 API error).
 *
 * The endpoint is live — it answers 401 unauthenticated, verified 2026-08-10 —
 * so reaching this seed means something went wrong, not that the backend is
 * missing. Values are the real API doc's own Stage 1 example response.
 *
 * Scoped to this route on purpose — distinct from PrizePool's mock in
 * src/data/prizes.ts, which is a different, still-unconfirmed document.
 */
export const PRIZE_CONTENT_SEED: PrizeContent = {
    prize_pool_headline: '$2,100',
    prize_count: '@ 22 Prizes • One Month',
    stage_label: 'For 100 Members • Stage 1',
    visitor_prize: '1x Free Draw Pass Entry',
    red_weekly: '1x $100 Gift Card',
    red_monthly: '1x $500 Tech Bundle',
    blue_weekly: '1x $250 Gift Card',
    blue_monthly: '1x $1000 Cash Prize',
    odds: '9 in 10 wins yearly',
    updated_at: null
};
```

- [ ] **Step 5: Switch the page to a token-gated admin fetch**

Replace the full contents of `src/app/dashboard/(routes)/prizes/page.tsx` with:

```tsx
import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminPrizeContent } from '@/lib/api/resources/prizes';
import { getAccessToken } from '@/lib/api/server';
import type { PrizeContent } from '@/types/member';

import { PrizesClient } from './prizes-client';
import { PRIZE_CONTENT_SEED } from './seed';

export default async function PrizesPage() {
    const token = await getAccessToken();

    let content: PrizeContent;
    let isPlaceholder = false;

    try {
        content = token ? await getAdminPrizeContent(token) : PRIZE_CONTENT_SEED;
        if (!token) isPlaceholder = true;
    } catch (error) {
        handleApiAuthError(error); // 401 → force logout; other errors fall through
        // The endpoint is live, so reaching here means a real failure (network,
        // or a 5xx). Render against the seed so the editor stays usable rather
        // than blanking; saving still fails loudly via the action's toast.
        content = PRIZE_CONTENT_SEED;
        isPlaceholder = true;
    }

    return (
        <DashboardPageShell>
            <Heading
                title='Prizes'
                description='Edit the prize pool shown on the Prizes page. Saved changes are not yet reflected on member-facing pages.'
            />

            {isPlaceholder ? (
                <p className='text-muted-foreground text-sm'>
                    Couldn&apos;t load the current prize content — showing defaults. Saving may fail.
                </p>
            ) : null}

            <PrizesClient content={content} />
        </DashboardPageShell>
    );
}
```

This mirrors the token-gated pattern already used by `safe-hours/page.tsx` and `spin/page.tsx` — the old version read from the *public* cached endpoint instead, which was the wrong endpoint for an editor (no admin GET was known to exist yet).

- [ ] **Step 6: Rewrite the form**

Replace the full contents of `src/app/dashboard/(routes)/prizes/prizes-client.tsx` with:

```tsx
'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { PrizeContent } from '@/types/member';
import { zodResolver } from '@hookform/resolvers/zod';

import { savePrizeContentAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
    prize_pool_headline: z.string().min(1, 'Required'),
    prize_count: z.string().min(1, 'Required'),
    stage_label: z.string().min(1, 'Required'),
    odds: z.string().min(1, 'Required'),
    visitor_prize: z.string().min(1, 'Required'),
    red_weekly: z.string().min(1, 'Required'),
    red_monthly: z.string().min(1, 'Required'),
    blue_weekly: z.string().min(1, 'Required'),
    blue_monthly: z.string().min(1, 'Required')
});

type FormValues = z.infer<typeof formSchema>;

function toFormValues(content: PrizeContent): FormValues {
    return {
        prize_pool_headline: content.prize_pool_headline,
        prize_count: content.prize_count,
        stage_label: content.stage_label,
        odds: content.odds,
        visitor_prize: content.visitor_prize,
        red_weekly: content.red_weekly,
        red_monthly: content.red_monthly,
        blue_weekly: content.blue_weekly,
        blue_monthly: content.blue_monthly
    };
}

export function PrizesClient({ content }: { content: PrizeContent }) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: toFormValues(content)
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            const result = await savePrizeContentAction(values);

            if (result.ok) {
                toast.success(result.message);
                // Reset from the saved document, not the submitted values — any
                // backend normalisation must be reflected, not silently dropped.
                form.reset(toFormValues(result.data));
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
                    <CardContent className='grid gap-4 sm:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='prize_pool_headline'
                            render={({ field }) => (
                                <FormItem className='min-w-0'>
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
                            name='prize_count'
                            render={({ field }) => (
                                <FormItem className='min-w-0'>
                                    <FormLabel>Prize count</FormLabel>
                                    <FormControl>
                                        <Input placeholder='@ 22 Prizes • One Month' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='stage_label'
                            render={({ field }) => (
                                <FormItem className='min-w-0 sm:col-span-2'>
                                    <FormLabel>Stage label</FormLabel>
                                    <FormControl>
                                        <Input placeholder='For 100 Members • Stage 1' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='odds'
                            render={({ field }) => (
                                <FormItem className='min-w-0 sm:col-span-2'>
                                    <FormLabel>Odds</FormLabel>
                                    <FormControl>
                                        <Input placeholder='9 in 10 wins yearly' {...field} />
                                    </FormControl>
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
                        <fieldset className='min-w-0 space-y-3'>
                            <legend className='text-sm font-semibold'>Visitor</legend>
                            <FormField
                                control={form.control}
                                name='visitor_prize'
                                render={({ field }) => (
                                    <FormItem className='min-w-0'>
                                        <FormLabel>Prize</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </fieldset>

                        <fieldset className='min-w-0 space-y-3'>
                            <legend className='text-sm font-semibold'>SLR RED</legend>
                            <div className='grid gap-3 sm:grid-cols-2'>
                                <FormField
                                    control={form.control}
                                    name='red_weekly'
                                    render={({ field }) => (
                                        <FormItem className='min-w-0'>
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
                                    name='red_monthly'
                                    render={({ field }) => (
                                        <FormItem className='min-w-0'>
                                            <FormLabel>Monthly</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </fieldset>

                        <fieldset className='min-w-0 space-y-3'>
                            <legend className='text-sm font-semibold'>SLR BLUE</legend>
                            <div className='grid gap-3 sm:grid-cols-2'>
                                <FormField
                                    control={form.control}
                                    name='blue_weekly'
                                    render={({ field }) => (
                                        <FormItem className='min-w-0'>
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
                                    name='blue_monthly'
                                    render={({ field }) => (
                                        <FormItem className='min-w-0'>
                                            <FormLabel>Monthly</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </fieldset>
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

- [ ] **Step 7: Update the server action**

Replace the full contents of `src/app/dashboard/(routes)/prizes/actions.ts` with:

```ts
'use server';

import { revalidatePath } from 'next/cache';

import { handleApiAuthError } from '@/lib/api/guard';
import { updateAdminPrizeContent } from '@/lib/api/resources/prizes';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type { PrizeContent, PrizeContentUpdatePayload } from '@/types/member';

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

export async function savePrizeContentAction(
    payload: PrizeContentUpdatePayload
): Promise<ActionResult<PrizeContent>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updateAdminPrizeContent(token, payload);

        // Only this route consumes PrizeContent — the member/public prizes
        // pages read a different, unrelated document (PrizePool), so they are
        // no longer revalidated here.
        revalidatePath('/dashboard/prizes');

        return { ok: true, data, message: 'Prize content saved.' };
    } catch (error) {
        return toActionError(error);
    }
}
```

- [ ] **Step 8: Verify**

Run: `npm run type-check`
Expected: no errors.

Run: `npx eslint "src/app/dashboard/(routes)/prizes/**/*.{ts,tsx}" src/lib/api/resources/prizes.ts src/lib/api/endpoints.ts src/types/member.ts`
Expected: no errors (warnings pre-existing elsewhere in the repo are fine, but not in these files).

Run: `npm run build`
Expected: succeeds, `/dashboard/prizes` still appears in the route table.

Manually trace (endpoint is 404, no server available to click through): with `getAccessToken()` returning a token but `getAdminPrizeContent` throwing a non-401 `ApiError` (the live 404 case), `page.tsx`'s catch sets `content = PRIZE_CONTENT_SEED` and `isPlaceholder = true` — the placeholder banner renders and `PrizesClient` receives the 9-field seed document, matching `toFormValues`'s 9 keys exactly (no more, no less) so the form renders fully populated.

- [ ] **Step 9: Commit**

```bash
git add src/types/member.ts src/lib/api/endpoints.ts src/lib/api/resources/prizes.ts \
    "src/app/dashboard/(routes)/prizes/seed.ts" "src/app/dashboard/(routes)/prizes/page.tsx" \
    "src/app/dashboard/(routes)/prizes/prizes-client.tsx" "src/app/dashboard/(routes)/prizes/actions.ts"
git commit -m "fix(prizes): rewire admin CMS to the real /admin/prizes contract"
```

---

### Task 2: Safe Hours admin panel — add manual override, correct field shapes

**Files:**
- Modify: `src/types/member.ts` (replace the `// ── Safe Hours …` block, currently lines 157-169)
- Modify: `src/lib/api/resources/safe-hours.ts`
- Modify: `src/app/dashboard/(routes)/safe-hours/seed.ts`
- Modify: `src/app/dashboard/(routes)/safe-hours/safe-hours-client.tsx`
- Modify: `src/app/dashboard/(routes)/safe-hours/actions.ts`
- Modify: `src/app/dashboard/(routes)/safe-hours/page.tsx` (one string + one comment only — see Step 5b)

**Interfaces:**
- Consumes: nothing from other tasks in this plan.
- Produces: nothing consumed by other tasks in this plan.

- [ ] **Step 1: Replace the Safe Hours types**

In `src/types/member.ts`, replace the entire block from the `// ── Safe Hours …` comment through the closing `}` of the old `SafeHoursConfig` interface (the block currently reading, roughly, lines 157-169: the section header comment, `Weekday`, and the old 3-field `SafeHoursConfig`) with:

```ts
// ── Safe Hours (real API, 2026-08-09) ─────────────────────────────────────────
// Admin-edited lockout window during which sign-up/upgrade/downgrade are
// locked. The member-facing advisory check in src/lib/safe-hours.ts is a
// separate, independent static constant with its own drift-gap comment —
// nothing about this document's shape affects that file.

export type SafeHoursDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type SafeHoursOverride = 'NONE' | 'FORCE_LOCK' | 'FORCE_UNLOCK';

export interface SafeHoursConfig {
    day_of_week: SafeHoursDay;
    start_time: string; // 'HH:MM', 24h
    end_time: string; // 'HH:MM', 24h, strictly after start_time
    is_active: boolean;
    manual_override: SafeHoursOverride;
    is_currently_locked: boolean; // read-only, server-computed
    updated_at: string;
}

export type SafeHoursUpdatePayload = Omit<SafeHoursConfig, 'is_currently_locked' | 'updated_at'>;
```

The old `Weekday` type is deleted — nothing outside this block used it (confirm: `grep -rn "Weekday" src/` after this edit should show zero matches; Step 4 rewrites its only consumer).

- [ ] **Step 2: Update the resource file's payload type**

Replace the full contents of `src/lib/api/resources/safe-hours.ts` with:

```ts
import type { SafeHoursConfig, SafeHoursUpdatePayload } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * The Friday lockout window (PRD §5.8, real API 2026-08-09). Admin-gated in
 * both directions — unlike Prizes there is no public/member-facing read of
 * this document, so neither function is wrapped in cache().
 */
export function getAdminSafeHours(token: string) {
    return apiFetch<SafeHoursConfig>(API.admin.safeHours, { token });
}

/** Full-document replace, minus the two read-only fields the server computes. */
export function updateAdminSafeHours(token: string, payload: SafeHoursUpdatePayload) {
    return apiFetch<SafeHoursConfig>(API.admin.safeHours, {
        method: 'PUT',
        token,
        body: payload
    });
}
```

- [ ] **Step 3: Replace the seed document**

Replace the full contents of `src/app/dashboard/(routes)/safe-hours/seed.ts` with:

```ts
import type { SafeHoursConfig } from '@/types/member';

/**
 * Defensive fallback the editor renders against when `GET /api/v1/admin/safe-hours`
 * cannot be read.
 *
 * The endpoint exists but answered 500 INTERNAL_ERROR when verified against
 * production on 2026-08-10, so this fallback is load-bearing right now — see
 * the Safe Hours entry in docs/BACKEND-ISSUES.md. Values are the real API
 * doc's own example: the default Friday 16:00-19:00 Sydney window, no override
 * active, currently unlocked.
 *
 * Scoped to this route.
 */
export const SAFE_HOURS_SEED: SafeHoursConfig = {
    day_of_week: 'Friday',
    start_time: '16:00',
    end_time: '19:00',
    is_active: true,
    manual_override: 'NONE',
    is_currently_locked: false,
    updated_at: '2026-08-09T14:30:00.000Z'
};
```

- [ ] **Step 4: Rewrite the form**

Replace the full contents of `src/app/dashboard/(routes)/safe-hours/safe-hours-client.tsx` with:

```tsx
'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { SafeHoursConfig, SafeHoursDay, SafeHoursOverride, SafeHoursUpdatePayload } from '@/types/member';
import { zodResolver } from '@hookform/resolvers/zod';

import { saveSafeHoursAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const WEEKDAYS: SafeHoursDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const OVERRIDE_OPTIONS: { value: SafeHoursOverride; label: string; description: string }[] = [
    { value: 'NONE', label: 'None', description: 'Follow the automatic schedule below.' },
    {
        value: 'FORCE_LOCK',
        label: 'Force lock',
        description: 'Block sign-up & plan changes right now, regardless of schedule.'
    },
    {
        value: 'FORCE_UNLOCK',
        label: 'Force unlock',
        description: 'Force the platform open even during the scheduled window.'
    }
];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeField = (label: string) => z.string().regex(TIME_PATTERN, `${label} must be HH:MM, 24h`);

const formSchema = z
    .object({
        day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
        start_time: timeField('Start time'),
        end_time: timeField('End time'),
        is_active: z.boolean(),
        manual_override: z.enum(['NONE', 'FORCE_LOCK', 'FORCE_UNLOCK'])
    })
    // Safe as a plain string compare: both sides are always zero-padded
    // 'HH:MM', so lexicographic order matches time-of-day order.
    .refine((values) => values.end_time > values.start_time, {
        message: 'End time must be after start time',
        path: ['end_time']
    });

type FormValues = z.infer<typeof formSchema>;

function toFormValues(config: SafeHoursConfig): FormValues {
    return {
        day_of_week: config.day_of_week,
        start_time: config.start_time,
        end_time: config.end_time,
        is_active: config.is_active,
        manual_override: config.manual_override
    };
}

export function SafeHoursClient({ config }: { config: SafeHoursConfig }) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: toFormValues(config)
    });

    const onSubmit = (values: FormValues) => {
        const payload: SafeHoursUpdatePayload = values;

        startTransition(async () => {
            const result = await saveSafeHoursAction(payload);

            if (result.ok) {
                toast.success(result.message);
                form.reset(toFormValues(result.data));
            } else {
                toast.error(result.message, {
                    description: result.status ? `status ${result.status} · ${result.code ?? 'no code'}` : undefined
                });
            }
        });
    };

    return (
        <div className='max-w-md space-y-4'>
            <p className='text-slr-muted text-sm'>
                Currently locked:{' '}
                <span
                    className={
                        config.is_currently_locked ? 'font-semibold text-red-400' : 'font-semibold text-emerald-400'
                    }>
                    {config.is_currently_locked ? 'Yes' : 'No'}
                </span>
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Lockout window</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <FormField
                                control={form.control}
                                name='day_of_week'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Day</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select day' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='dashboard-theme dark'>
                                                {WEEKDAYS.map((day) => (
                                                    <SelectItem key={day} value={day}>
                                                        {day}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='grid grid-cols-2 gap-4'>
                                <FormField
                                    control={form.control}
                                    name='start_time'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start time</FormLabel>
                                            <FormControl>
                                                <Input type='time' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='end_time'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End time</FormLabel>
                                            <FormControl>
                                                <Input type='time' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name='is_active'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center justify-between'>
                                        <FormLabel>Window active</FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Manual override</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name='manual_override'
                                render={({ field }) => (
                                    <FormItem>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select override' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className='dashboard-theme dark'>
                                                {OVERRIDE_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            {OVERRIDE_OPTIONS.find((opt) => opt.value === field.value)?.description}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Button type='submit' disabled={isPending}>
                        {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                        Save changes
                    </Button>
                </form>
            </Form>
        </div>
    );
}
```

- [ ] **Step 5: Update the server action's payload type**

In `src/app/dashboard/(routes)/safe-hours/actions.ts`, change the import and the function signature only — everything else (the `ActionError`/`ActionResult`/`toActionError` boilerplate, the function body) stays identical:

```ts
import type { SafeHoursConfig, SafeHoursUpdatePayload } from '@/types/member';
```

```ts
export async function saveSafeHoursAction(payload: SafeHoursUpdatePayload): Promise<ActionResult<SafeHoursConfig>> {
```

- [ ] **Step 5b: Correct the page's placeholder copy**

In `src/app/dashboard/(routes)/safe-hours/page.tsx`, change only the banner string and the comment above the seed assignment. Everything else in the file stays as it is.

Replace this comment:

```tsx
        // The endpoint is still unimplemented, so the editor renders against the
        // seed document rather than an error card — the form stays usable for
        // admin walkthroughs. Saving still fails loudly via the action's toast.
```

with:

```tsx
        // The endpoint is live but currently answers 500 (verified 2026-08-10),
        // so this fallback is load-bearing. Render against the seed rather than
        // blanking; saving still fails loudly via the action's toast.
```

Replace this banner:

```tsx
                    Showing placeholder figures — the safe-hours endpoint is not live yet, so saving will not persist.
```

with:

```tsx
                    Couldn&apos;t load the current safe-hours settings — showing defaults. Saving may fail.
```

- [ ] **Step 6: Verify**

Run: `npm run type-check`
Expected: no errors.

Run: `npx eslint "src/app/dashboard/(routes)/safe-hours/**/*.{ts,tsx}" src/lib/api/resources/safe-hours.ts src/types/member.ts`
Expected: no errors.

Run: `npm run build`
Expected: succeeds, `/dashboard/safe-hours` still in the route table.

Manually trace: `grep -rn "Weekday\b" src/` returns nothing (old type fully removed, not just unused). With the endpoint 404, `page.tsx` (unmodified) still assigns `config = SAFE_HOURS_SEED` and `isPlaceholder = true` on catch; `SafeHoursClient` receives the new 7-field seed, `toFormValues` reads exactly the 5 form-editable fields from it (`is_currently_locked`/`updated_at` are read separately for the status line, never entering the form), and the "Currently locked: No" line renders above the form.

- [ ] **Step 7: Commit**

```bash
git add src/types/member.ts src/lib/api/resources/safe-hours.ts \
    "src/app/dashboard/(routes)/safe-hours/seed.ts" "src/app/dashboard/(routes)/safe-hours/safe-hours-client.tsx" \
    "src/app/dashboard/(routes)/safe-hours/actions.ts" "src/app/dashboard/(routes)/safe-hours/page.tsx"
git commit -m "feat(safe-hours): add manual override + active toggle, correct field shapes"
```

---

### Task 3: Spin Wheel admin panel — server pagination, real field shapes, per-tier discount

**Files:**
- Modify: `src/types/member.ts` (replace the `// ── Spin Wheel Admin …` block, currently lines 228-247)
- Modify: `src/lib/api/http.ts`
- Modify: `src/lib/api/resources/spin-admin.ts`
- Modify: `src/app/dashboard/(routes)/spin/seed.ts`
- Modify: `src/app/dashboard/(routes)/spin/page.tsx`
- Modify: `src/app/dashboard/(routes)/spin/spin-config-client.tsx`
- Modify: `src/app/dashboard/(routes)/spin/spin-history-client.tsx`
- Modify: `src/app/dashboard/(routes)/spin/_components/columns.tsx`
- `src/app/dashboard/(routes)/spin/actions.ts` — **not modified**: `saveSpinConfigAction(payload: SpinConfig)` and `updateAdminSpinConfig(token, payload: SpinConfig)` keep their signatures; only the shape `SpinConfig` refers to changes (Step 1), which this file doesn't need to know about.

**Interfaces:**
- Consumes: nothing from other tasks in this plan.
- Produces: `apiFetchPaginated<T, M>()`, a new export from `src/lib/api/http.ts`, additive — `apiFetch<T>()`'s existing signature and behaviour are unchanged for its ~20 other call sites.

- [ ] **Step 1: Replace the Spin Wheel types**

In `src/types/member.ts`, replace the entire block from the `// ── Spin Wheel Admin …` comment through the closing `}` of the old `SpinHistoryRow` interface (currently lines 228-247, including the old `SpinEligibleSubTier` and `SpinConfig`) with:

```ts
// ── Spin Wheel Admin (real API, 2026-08-09) ───────────────────────────────────
// First-release scope: on/off (global + per sub-tier) + per-sub-tier discount +
// history. constant/tiers.ts's SPIN_ELIGIBLE_SUB_TIERS (SubTierCode-keyed,
// uppercase) still gates which sub-tiers the config form renders as editable —
// Visitor/R1/B1 stay permanently ineligible per PRD, regardless of what the
// wire format (SpinTierId, lowercase, all 8 codes) includes.

export type SpinTierId = 'visitor' | 'r1' | 'r4' | 'r7' | 'b1' | 'b4' | 'b7' | 'b10';

export type SpinMoment = 'registration' | 'pre_renewal';

export interface SpinSubTierConfig {
    sub_tier_id: SpinTierId;
    marketing_name: string;
    has_spin: boolean;
    spin_discount_cents: number;
}

export interface SpinConfig {
    global_enabled: boolean;
    sub_tiers: SpinSubTierConfig[];
}

export interface SpinHistoryRow {
    spin_id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    /**
     * Display string from the API. The doc's example shows 'Red Plus', but the
     * live endpoint returns bare marketing names ('Plus', 'Premium', 'Elite',
     * 'Standard', 'Visitor') — so 'Plus' is ambiguous between R4 and B4, and a
     * BENY add-on label leaks in as if it were a tier. Rendered verbatim
     * because there is no group field to disambiguate it with; filed in
     * docs/BACKEND-ISSUES.md.
     */
    tier: string;
    moment: SpinMoment;
    result: 'win' | 'lose';
    discount_cents: number;
    applied: boolean;
    expires_at: string | null;
    created_at: string;
}

export interface SpinHistoryMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}
```

The old `SpinEligibleSubTier` type is deleted — its only two consumers (`spin-config-client.tsx`, `spin-history-client.tsx`) are rewritten in Steps 5-6 to use `SubTierCode` (already exported near the top of this same file) instead.

- [ ] **Step 2: Add `apiFetchPaginated` to the HTTP client**

Replace the full contents of `src/lib/api/http.ts` with:

```ts
import { API_BASE_URL } from './endpoints';
import { logApi } from './logger';
import { type ApiEnvelope, ApiError } from './types';

type ApiFetchOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /** JSON body — serialized automatically. */
    body?: unknown;
    /** Bearer token for authenticated calls. */
    token?: string;
    headers?: Record<string, string>;
    /** Next.js fetch cache mode (server). */
    cache?: RequestCache;
    /** ISR revalidate seconds, or false to opt out (server). */
    revalidate?: number | false;
    /** Cache tags for on-demand revalidation (server). */
    tags?: string[];
    signal?: AbortSignal;
};

/** Shared request/parse/error/logging logic for apiFetch and apiFetchPaginated. */
async function doFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<ApiEnvelope<T>> {
    const { method = 'GET', body, token, headers, cache, revalidate, tags, signal } = opts;

    const next =
        revalidate !== undefined || tags
            ? { revalidate: revalidate === false ? undefined : revalidate, tags }
            : undefined;

    const start = Date.now();

    let res: Response;
    try {
        res = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: {
                Accept: 'application/json',
                ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal,
            ...(cache ? { cache } : {}),
            ...(next ? { next } : {})
        });
    } catch (networkError) {
        // Request never reached the API (DNS, offline, aborted).
        logApi({
            method,
            path,
            status: 0,
            ms: Date.now() - start,
            ok: false,
            error: { message: String(networkError) }
        });
        throw networkError;
    }

    let json: ApiEnvelope<T> | undefined;
    try {
        json = (await res.json()) as ApiEnvelope<T>;
    } catch {
        // Non-JSON response (e.g. gateway error page).
    }

    const ms = Date.now() - start;

    if (!res.ok || !json?.success) {
        logApi({
            method,
            path,
            status: res.status,
            statusText: res.statusText,
            message: json?.message ?? `Request failed (${res.status})`,
            ms,
            ok: false,
            error: json ?? { message: `Request failed (${res.status})` }
        });
        throw new ApiError(res.status, json?.message ?? `Request failed (${res.status})`, json);
    }

    logApi({ method, path, status: res.status, message: json.message, ms, ok: true, data: json.data });

    return json;
}

/**
 * Single entry point for hitting the SLR API. Works in Server Components,
 * route handlers, server actions, and the client. Unwraps the `{ success,
 * message, data }` envelope and throws `ApiError` on failure.
 *
 * Build typed resource functions on top of this (see `resources/*`) rather
 * than calling it directly from components.
 */
export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
    return (await doFetch<T>(path, opts)).data;
}

/**
 * Same as apiFetch, but keeps the envelope's `meta` — for server-paginated
 * list endpoints that return `{ data: T[], meta: { page, total_pages, ... } }`.
 */
export async function apiFetchPaginated<T, M = Record<string, unknown>>(
    path: string,
    opts: ApiFetchOptions = {}
): Promise<{ data: T; meta: M }> {
    const json = await doFetch<T>(path, opts);

    return { data: json.data, meta: (json.meta ?? {}) as M };
}
```

`apiFetch`'s exported signature and runtime behaviour are byte-for-byte identical to before for every existing call site — this is a pure internal refactor (extracting the shared body into `doFetch`) plus one new additive export.

- [ ] **Step 3: Update the spin-admin resource file**

Replace the full contents of `src/lib/api/resources/spin-admin.ts` with:

```ts
import type { SpinConfig, SpinHistoryMeta, SpinHistoryRow, SpinMoment, SpinTierId } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch, apiFetchPaginated } from '../http';

/**
 * Admin-only spin wheel functions (real API, 2026-08-09). Kept separate from
 * spin.ts, which is the member-facing "check status / execute a spin" module —
 * different audience, different auth, no shared code.
 */

export interface SpinHistoryFilters {
    tier?: SpinTierId;
    moment?: SpinMoment;
    page?: number;
    perPage?: number;
}

function historyQuery(filters?: SpinHistoryFilters): string {
    const params = new URLSearchParams();
    if (filters?.tier) params.set('tier', filters.tier);
    if (filters?.moment) params.set('moment', filters.moment);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.perPage) params.set('per_page', String(filters.perPage));

    const query = params.toString();

    return query ? `?${query}` : '';
}

/** Server-paginated — the API returns `meta.total_pages`, not the full set. */
export function getAdminSpinHistory(token: string, filters?: SpinHistoryFilters) {
    return apiFetchPaginated<SpinHistoryRow[], SpinHistoryMeta>(`${API.admin.spinHistory}${historyQuery(filters)}`, {
        token
    });
}

export function getAdminSpinConfig(token: string) {
    return apiFetch<SpinConfig>(API.admin.spinConfig, { token });
}

export function updateAdminSpinConfig(token: string, payload: SpinConfig) {
    return apiFetch<SpinConfig>(API.admin.spinConfig, {
        method: 'PUT',
        token,
        body: payload
    });
}
```

- [ ] **Step 4: Replace the seed data**

Replace the full contents of `src/app/dashboard/(routes)/spin/seed.ts` with:

```ts
import type { SpinConfig, SpinHistoryMeta } from '@/types/member';

/**
 * Defensive fallbacks the panel renders against when the spin admin endpoints
 * cannot be read.
 *
 * `GET /api/v1/admin/spin/config` exists but answered 500 INTERNAL_ERROR when
 * verified against production on 2026-08-10, so SPIN_CONFIG_SEED is
 * load-bearing right now — see docs/BACKEND-ISSUES.md. `GET /admin/spin/history`
 * works; SPIN_HISTORY_META_SEED only covers its failure case.
 *
 * All five spin-eligible sub-tiers default to enabled with a $10 discount,
 * matching the real API doc's own r4 example.
 */
export const SPIN_CONFIG_SEED: SpinConfig = {
    global_enabled: true,
    sub_tiers: [
        { sub_tier_id: 'r4', marketing_name: 'Red Plus', has_spin: true, spin_discount_cents: 1000 },
        { sub_tier_id: 'r7', marketing_name: 'Red Premium', has_spin: true, spin_discount_cents: 1000 },
        { sub_tier_id: 'b4', marketing_name: 'Blue Plus', has_spin: true, spin_discount_cents: 1000 },
        { sub_tier_id: 'b7', marketing_name: 'Blue Premium', has_spin: true, spin_discount_cents: 1000 },
        { sub_tier_id: 'b10', marketing_name: 'Blue Elite', has_spin: true, spin_discount_cents: 1000 }
    ]
};

export const SPIN_HISTORY_META_SEED: SpinHistoryMeta = { page: 1, per_page: 20, total: 0, total_pages: 1 };
```

- [ ] **Step 5: Rewrite the config form**

Replace the full contents of `src/app/dashboard/(routes)/spin/spin-config-client.tsx` with:

```tsx
'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SPIN_ELIGIBLE_SUB_TIERS, SUB_TIERS } from '@/constant/tiers';
import type { SpinConfig, SpinSubTierConfig, SubTierCode } from '@/types/member';

import { saveSpinConfigAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

// Derived from the authoritative constant (also read by the member-side spin
// flow) so admin and member eligibility can't silently drift apart.
const ELIGIBLE_SUB_TIERS = Array.from(SPIN_ELIGIBLE_SUB_TIERS) as SubTierCode[];

function findSubTier(config: SpinConfig, code: SubTierCode): SpinSubTierConfig | undefined {
    return config.sub_tiers.find((t) => t.sub_tier_id === code.toLowerCase());
}

function toEditableRow(config: SpinConfig, code: SubTierCode) {
    const existing = findSubTier(config, code);

    return {
        has_spin: existing?.has_spin ?? false,
        spin_discount_cents: existing?.spin_discount_cents ?? 0
    };
}

export function SpinConfigClient({ config }: { config: SpinConfig }) {
    const [isPending, startTransition] = useTransition();

    // No react-hook-form here: toggles + a small numeric field, no cross-field
    // validation rules worth pulling in RHF+Zod for.
    const [globalEnabled, setGlobalEnabled] = useState(config.global_enabled);
    const [rows, setRows] = useState(() =>
        Object.fromEntries(ELIGIBLE_SUB_TIERS.map((code) => [code, toEditableRow(config, code)]))
    );
    // Raw text per row so a blank/mid-edit discount field doesn't snap to 0
    // while the admin is typing — see Prizes/Safe Hours for the same reasoning
    // applied to a different value.
    const [discountText, setDiscountText] = useState(() =>
        Object.fromEntries(
            ELIGIBLE_SUB_TIERS.map((code) => [code, String(toEditableRow(config, code).spin_discount_cents / 100)])
        )
    );

    const isDirty =
        globalEnabled !== config.global_enabled ||
        ELIGIBLE_SUB_TIERS.some((code) => {
            const original = toEditableRow(config, code);

            return (
                rows[code].has_spin !== original.has_spin ||
                rows[code].spin_discount_cents !== original.spin_discount_cents
            );
        });

    const setHasSpin = (code: SubTierCode, has_spin: boolean) => {
        setRows((prev) => ({ ...prev, [code]: { ...prev[code], has_spin } }));
    };

    const setDiscount = (code: SubTierCode, text: string) => {
        setDiscountText((prev) => ({ ...prev, [code]: text }));

        const dollars = Number(text);
        const cents =
            Number.isFinite(dollars) && dollars >= 0 ? Math.round(dollars * 100) : rows[code].spin_discount_cents;

        setRows((prev) => ({ ...prev, [code]: { ...prev[code], spin_discount_cents: cents } }));
    };

    const handleSave = () => {
        // Preserve every sub_tier the last GET returned, even ones this form
        // doesn't render (ineligible codes) — a save must never silently drop
        // them from the document.
        const eligibleIds = new Set(ELIGIBLE_SUB_TIERS.map((code) => code.toLowerCase()));
        const untouched = config.sub_tiers.filter((t) => !eligibleIds.has(t.sub_tier_id));
        const edited: SpinSubTierConfig[] = ELIGIBLE_SUB_TIERS.map((code) => ({
            sub_tier_id: code.toLowerCase() as SpinSubTierConfig['sub_tier_id'],
            marketing_name: SUB_TIERS[code].marketingName,
            has_spin: rows[code].has_spin,
            spin_discount_cents: rows[code].spin_discount_cents
        }));

        startTransition(async () => {
            const result = await saveSpinConfigAction({
                global_enabled: globalEnabled,
                sub_tiers: [...untouched, ...edited]
            });

            if (result.ok) {
                toast.success(result.message);
            } else {
                toast.error(result.message, {
                    description: result.status ? `status ${result.status} · ${result.code ?? 'no code'}` : undefined
                });
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                    <Label htmlFor='spin-enabled'>Spin wheel enabled (all tiers)</Label>
                    <Switch id='spin-enabled' checked={globalEnabled} onCheckedChange={setGlobalEnabled} />
                </div>

                <fieldset className='min-w-0 space-y-4 border-t pt-4'>
                    <legend className='text-sm font-semibold'>Per sub-tier</legend>
                    {ELIGIBLE_SUB_TIERS.map((code) => (
                        <div key={code} className='flex items-center justify-between gap-4'>
                            <Label htmlFor={`spin-tier-${code}`} className='min-w-0 flex-1'>
                                {SUB_TIERS[code].label} · {SUB_TIERS[code].marketingName}
                            </Label>
                            <div className='flex items-center gap-2'>
                                <span className='text-slr-dim text-xs'>$</span>
                                <Input
                                    aria-label={`${SUB_TIERS[code].marketingName} discount, dollars`}
                                    type='number'
                                    min={0}
                                    step='0.01'
                                    className='h-8 w-20'
                                    value={discountText[code]}
                                    onChange={(e) => setDiscount(code, e.target.value)}
                                />
                                <Switch
                                    id={`spin-tier-${code}`}
                                    checked={rows[code].has_spin}
                                    onCheckedChange={(checked) => setHasSpin(code, checked)}
                                />
                            </div>
                        </div>
                    ))}
                </fieldset>

                <Button onClick={handleSave} disabled={isPending || !isDirty}>
                    {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                    Save changes
                </Button>
            </CardContent>
        </Card>
    );
}
```

- [ ] **Step 6: Rewrite the history table + filters**

Replace the full contents of `src/app/dashboard/(routes)/spin/spin-history-client.tsx` with:

```tsx
'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUB_TIERS } from '@/constant/tiers';
import type { SpinHistoryMeta, SpinHistoryRow, SpinMoment, SpinTierId, SubTierCode } from '@/types/member';

import { spinHistoryColumns } from './_components/columns';
import { History } from 'lucide-react';

const ALL_TIER_IDS: SpinTierId[] = ['visitor', 'r1', 'r4', 'r7', 'b1', 'b4', 'b7', 'b10'];

const TIER_OPTIONS: { value: SpinTierId; label: string }[] = ALL_TIER_IDS.map((id) => {
    const meta = SUB_TIERS[id.toUpperCase() as SubTierCode];

    return { value: id, label: meta ? `${meta.label} · ${meta.marketingName}` : id };
});

const MOMENT_OPTIONS: { value: SpinMoment; label: string }[] = [
    { value: 'registration', label: 'Registration' },
    { value: 'pre_renewal', label: 'Pre-renewal' }
];

export function SpinHistoryClient({
    rows,
    meta,
    tier,
    moment
}: {
    rows: SpinHistoryRow[];
    meta: SpinHistoryMeta;
    tier: string;
    moment: string;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // All three filters live in the URL so the filtered/paged view is
    // shareable/reloadable, matching (routes)/winners/page.tsx's ?giveaway=.
    const pushParams = (next: { tier?: string; moment?: string; page?: number }) => {
        const nextTier = next.tier ?? tier;
        const nextMoment = next.moment ?? moment;
        const nextPage = next.page ?? 1;

        const params = new URLSearchParams();
        if (nextTier !== 'all') params.set('tier', nextTier);
        if (nextMoment !== 'all') params.set('moment', nextMoment);
        if (nextPage > 1) params.set('page', String(nextPage));

        const query = params.toString();

        startTransition(() => {
            router.push(`/dashboard/spin${query ? `?${query}` : ''}`);
        });
    };

    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap gap-3'>
                {/* Disabled on purpose: `?tier=<any value>` makes the live
                    endpoint answer 500 (verified 2026-08-10 with r4, R4 and
                    Plus). Rendering an enabled control that always errors is
                    worse than showing it unavailable. Re-enable by deleting
                    `disabled` and the title once the backend ask in
                    docs/BACKEND-ISSUES.md is resolved. */}
                <Select value={tier} onValueChange={(value) => pushParams({ tier: value })} disabled>
                    <SelectTrigger
                        className='w-44'
                        title='Tier filtering is temporarily unavailable — the API errors on this filter.'>
                        <SelectValue placeholder='Tier' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>All tiers</SelectItem>
                        {TIER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={moment} onValueChange={(value) => pushParams({ moment: value })}>
                    <SelectTrigger className='w-44'>
                        <SelectValue placeholder='Moment' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>Registration + pre-renewal</SelectItem>
                        {MOMENT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                searchKey='user_name'
                isSearch={false}
                columns={spinHistoryColumns}
                data={rows}
                isLoading={isPending}
                serverSide
                alwaysShowPagination
                currentPage={meta.page}
                totalItems={meta.total}
                itemsPerPage={meta.per_page}
                onPageChange={(page) => pushParams({ page })}
                emptyMessage={
                    <span className='flex flex-col items-center gap-1'>
                        <History className='mb-1 size-8 opacity-40' />
                        <span className='text-foreground text-sm font-semibold'>No spins yet</span>
                        <span className='max-w-sm text-xs leading-relaxed'>
                            Spin history will appear here once members start spinning at registration or renewal.
                        </span>
                    </span>
                }
            />
        </div>
    );
}
```

`isSearch={false}`: `DataTable`'s search box only filters client-held `data` (see `src/components/data-table.tsx`'s `filteredData` memo, which returns `data` unfiltered whenever `serverSide` is true) — with server pagination, typing into a search box that does nothing would be a dead control, so it's turned off rather than wired to a query param this endpoint doesn't document.

- [ ] **Step 7: Rewrite the table columns**

Replace the full contents of `src/app/dashboard/(routes)/spin/_components/columns.tsx` with:

```tsx
import type { Column } from '@/components/data-table';
import { cn } from '@/lib/utils';

const RESULT_STYLE: Record<'win' | 'lose', string> = {
    win: 'border-emerald-500/40 text-emerald-400',
    lose: 'border-white/10 text-slr-dim'
};

const MOMENT_LABEL: Record<string, string> = {
    registration: 'Registration',
    pre_renewal: 'Pre-renewal'
};

export const spinHistoryColumns: Column[] = [
    {
        key: 'user_name',
        label: 'Member',
        render: (row) => (
            <span className='flex flex-col'>
                <span className='font-medium text-white'>{row.user_name}</span>
                <span className='text-slr-dim text-xs'>{row.user_email}</span>
            </span>
        )
    },
    {
        key: 'tier',
        // Already a display string from the API (e.g. 'Red Plus') — no code
        // lookup needed, unlike the old guessed shape.
        label: 'Tier',
        render: (row) => <span className='text-sm'>{row.tier}</span>
    },
    {
        key: 'moment',
        label: 'Moment',
        render: (row) => <span className='text-sm'>{MOMENT_LABEL[row.moment] ?? row.moment}</span>
    },
    {
        key: 'result',
        label: 'Result',
        render: (row) => (
            <span
                className={cn(
                    'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                    RESULT_STYLE[row.result as 'win' | 'lose']
                )}>
                {row.result}
            </span>
        )
    },
    {
        key: 'discount_cents',
        label: 'Discount',
        render: (row) => (
            <span className='tabular-nums'>
                {row.result === 'win' ? `$${(row.discount_cents / 100).toFixed(2)}` : '—'}
            </span>
        )
    },
    {
        key: 'applied',
        label: 'Applied',
        render: (row) =>
            row.result === 'win' ? (
                <span
                    className={cn(
                        'rounded-md border px-2 py-0.5 text-xs font-semibold uppercase',
                        row.applied ? 'border-emerald-500/40 text-emerald-400' : 'border-white/10 text-slr-dim'
                    )}>
                    {row.applied ? 'Yes' : 'No'}
                </span>
            ) : (
                <span className='text-slr-dim text-xs'>—</span>
            )
    },
    {
        key: 'expires_at',
        label: 'Expires',
        render: (row) => (
            <span className='text-slr-dim text-xs'>
                {row.expires_at ? new Date(row.expires_at).toLocaleDateString('en-AU') : '—'}
            </span>
        )
    },
    {
        key: 'created_at',
        label: 'Date',
        render: (row) => (
            <span className='text-slr-dim text-xs'>{new Date(row.created_at).toLocaleString('en-AU')}</span>
        )
    }
];
```

- [ ] **Step 8: Rewrite the page**

Replace the full contents of `src/app/dashboard/(routes)/spin/page.tsx` with:

```tsx
import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { SPIN_ELIGIBLE_SUB_TIERS } from '@/constant/tiers';
import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminSpinConfig, getAdminSpinHistory } from '@/lib/api/resources/spin-admin';
import { getAccessToken } from '@/lib/api/server';
import type { SpinConfig, SpinHistoryMeta, SpinHistoryRow, SpinMoment, SpinTierId, SubTierCode } from '@/types/member';

import { SPIN_CONFIG_SEED, SPIN_HISTORY_META_SEED } from './seed';
import { SpinConfigClient } from './spin-config-client';
import { SpinHistoryClient } from './spin-history-client';

const TIER_VALUES: SpinTierId[] = ['visitor', 'r1', 'r4', 'r7', 'b1', 'b4', 'b7', 'b10'];
const MOMENT_VALUES: SpinMoment[] = ['registration', 'pre_renewal'];
const ELIGIBLE_SUB_TIERS = Array.from(SPIN_ELIGIBLE_SUB_TIERS) as SubTierCode[];

function isSpinTierId(value: string): value is SpinTierId {
    return (TIER_VALUES as readonly string[]).includes(value);
}

function isSpinMoment(value: string): value is SpinMoment {
    return (MOMENT_VALUES as readonly string[]).includes(value);
}

// GET /admin/spin/config's exact set of sub_tier_ids on a fresh response isn't
// confirmed (all 8 vs only the 5 eligible ones) — merge the eligible 5 over
// the seed's shape so the config form always has a row to render for each,
// and carry through anything else (ineligible codes) untouched.
function normalizeSpinConfig(raw: Partial<SpinConfig> | null | undefined): SpinConfig {
    const rawSubTiers = raw?.sub_tiers ?? [];

    const merged = ELIGIBLE_SUB_TIERS.map((code) => {
        const id = code.toLowerCase();
        const existing = rawSubTiers.find((t) => t.sub_tier_id === id);

        // Non-null: SPIN_CONFIG_SEED is authored with exactly these 5 ids.
        return existing ?? SPIN_CONFIG_SEED.sub_tiers.find((t) => t.sub_tier_id === id)!;
    });
    const untouched = rawSubTiers.filter(
        (t) => !ELIGIBLE_SUB_TIERS.some((code) => code.toLowerCase() === t.sub_tier_id)
    );

    return {
        global_enabled: raw?.global_enabled ?? SPIN_CONFIG_SEED.global_enabled,
        sub_tiers: [...merged, ...untouched]
    };
}

export default async function SpinPage({
    searchParams
}: {
    searchParams: Promise<{ tier?: string; moment?: string; page?: string }>;
}) {
    const { tier: rawTier = 'all', moment: rawMoment = 'all', page: rawPage } = await searchParams;
    // Whitelist before use — an unrecognised value would otherwise be sent to
    // the backend as a filter while the Select silently falls back to its
    // placeholder, showing no filter active for a filtered fetch.
    const tier = rawTier === 'all' || isSpinTierId(rawTier) ? rawTier : 'all';
    const moment = rawMoment === 'all' || isSpinMoment(rawMoment) ? rawMoment : 'all';
    const parsedPage = Number(rawPage);
    const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const token = await getAccessToken();

    let config: SpinConfig;
    let isConfigPlaceholder = false;
    let history: SpinHistoryRow[] = [];
    let historyMeta: SpinHistoryMeta = SPIN_HISTORY_META_SEED;

    if (token) {
        const [configResult, historyResult] = await Promise.allSettled([
            getAdminSpinConfig(token),
            getAdminSpinHistory(token, {
                // `tier` is deliberately NOT forwarded: `?tier=<any value>`
                // makes the endpoint answer 500 (verified 2026-08-10), which
                // would take the whole history table down. The filter control
                // is disabled in the client for the same reason. A hand-typed
                // ?tier= in the URL therefore changes nothing rather than
                // breaking the page. Restore this when the backend ask in
                // docs/BACKEND-ISSUES.md is resolved.
                moment: moment === 'all' ? undefined : moment,
                page,
                perPage: 20
            })
        ]);

        // Inspect rejections before any fallback logic runs: a 401 (expired
        // admin session) must force a logout, not be swallowed as "endpoint
        // missing" and silently rendered as seed data.
        if (configResult.status === 'rejected') handleApiAuthError(configResult.reason);
        if (historyResult.status === 'rejected') handleApiAuthError(historyResult.reason);

        if (configResult.status === 'fulfilled') {
            config = normalizeSpinConfig(configResult.value);
        } else {
            config = SPIN_CONFIG_SEED;
            isConfigPlaceholder = true;
        }

        if (historyResult.status === 'fulfilled') {
            history = historyResult.value.data;
            historyMeta = historyResult.value.meta;
        }
        // On failure, history/historyMeta stay at their seeded defaults — the
        // table's own empty state handles it, no honest placeholder exists for
        // a list of past events.
    } else {
        config = SPIN_CONFIG_SEED;
        isConfigPlaceholder = true;
    }

    return (
        <DashboardPageShell>
            <Heading
                title='Spin Wheel'
                description='Availability, per-tier discount and spin history for the registration and renewal wheel.'
            />

            <div className='space-y-6'>
                {isConfigPlaceholder ? (
                    <p className='text-muted-foreground text-sm'>
                        Couldn&apos;t load the current spin settings — showing defaults. Saving may fail.
                    </p>
                ) : null}

                <SpinConfigClient config={config} />
                <SpinHistoryClient rows={history} meta={historyMeta} tier={tier} moment={moment} />
            </div>
        </DashboardPageShell>
    );
}
```

- [ ] **Step 9: Verify**

Run: `npm run type-check`
Expected: no errors.

Run: `npx eslint "src/app/dashboard/(routes)/spin/**/*.{ts,tsx}" src/lib/api/resources/spin-admin.ts src/lib/api/http.ts src/types/member.ts`
Expected: no errors.

Run: `npm run build`
Expected: succeeds, `/dashboard/spin` still in the route table.

Manually trace three cases and state the result in the task report:
1. **Both `GET`s 404** (current live state): `configResult`/`historyResult` both reject with a non-401 `ApiError` → `config = SPIN_CONFIG_SEED`, `isConfigPlaceholder = true`, `history = []`, `historyMeta = SPIN_HISTORY_META_SEED` (`{page:1,per_page:20,total:0,total_pages:1}`) — the config card shows the placeholder banner + 5 pre-filled rows, the history table shows its empty state with the pager collapsed to page 1 of 1.
2. **`GET /admin/spin/config` returns `{}`** (Important-2's old failure case, still relevant): `normalizeSpinConfig({})` → `raw?.sub_tiers` is `undefined` → `rawSubTiers = []` → every eligible code falls through to the seed's matching row via the `existing ?? SPIN_CONFIG_SEED...` fallback → `sub_tiers` is 5 complete rows, `untouched` is `[]`. No crash, no `undefined` reaching the form.
3. **A 401** on either request: `handleApiAuthError` is called with the rejection reason before any fallback assignment happens, and (per its existing implementation used identically by the sibling Prizes/Safe Hours pages) redirects — the function never returns, so no placeholder/seed logic downstream ever executes for that request.

- [ ] **Step 10: Commit**

```bash
git add src/types/member.ts src/lib/api/http.ts src/lib/api/resources/spin-admin.ts \
    "src/app/dashboard/(routes)/spin/seed.ts" "src/app/dashboard/(routes)/spin/page.tsx" \
    "src/app/dashboard/(routes)/spin/spin-config-client.tsx" "src/app/dashboard/(routes)/spin/spin-history-client.tsx" \
    "src/app/dashboard/(routes)/spin/_components/columns.tsx"
git commit -m "feat(spin): server-paginate history, add per-tier discount, correct field shapes"
```

---

## Self-Review

**Spec coverage:** §2.1/§2.2 (Prizes two-document split + endpoint correction) → Task 1. §2.3 (Safe Hours override/active/shapes) → Task 2. §2.4 (Spin discount + pagination + shapes) + §2.5 (DataTable serverSide) → Task 3. §3 (all type definitions) → Step 1 of each task, verbatim from the spec. §7 (BACKEND-ISSUES.md note) — **gap found and added below as Task 4.**

**Placeholder scan:** no TBD/TODO markers; every step carries full code, not descriptions of code.

**Type consistency:** `PrizeContent`/`PrizeContentUpdatePayload` (Task 1) used identically in `actions.ts`, `prizes-client.tsx`, `resources/prizes.ts`. `SafeHoursConfig`/`SafeHoursUpdatePayload` (Task 2) likewise consistent across `actions.ts`/`safe-hours-client.tsx`/`resources/safe-hours.ts`. `SpinConfig`/`SpinSubTierConfig`/`SpinHistoryRow`/`SpinHistoryMeta`/`SpinTierId`/`SpinMoment` (Task 3) consistent across `page.tsx`, both client components, `columns.tsx`, and `resources/spin-admin.ts` — `SpinHistoryFilters.tier` is `SpinTierId | undefined`, matching what `page.tsx` passes (`tier === 'all' ? undefined : tier`, where `tier` was already narrowed to `SpinTierId | 'all'`).

### Task 4: Update `docs/BACKEND-ISSUES.md` (added during self-review)

**Files:**
- Modify: `docs/BACKEND-ISSUES.md`

**Interfaces:** none — documentation only, no code.

- [ ] **Step 1: Correct the false "404 / not implemented" claims**

Search `docs/BACKEND-ISSUES.md` for every claim that the Sprint 4 admin endpoints are missing, unimplemented, or 404 (the Prizes CMS, Safe Hours, and Spin Wheel subsections under the Sprint 4 heading each carry some form of it). Every one of those claims is **wrong** and must be corrected in place: the routes exist and are live. They read as 404 only because the probes that produced them omitted the `/api/v1` prefix. State the correction explicitly — a reader who acted on the old text would waste a sprint waiting for endpoints that already shipped.

- [ ] **Step 2: Record the verified state and the real defects**

Under the Sprint 4 heading, replace the per-feature "not live yet" framing with what was actually verified against production on 2026-08-10 using a superadmin token (read-only; no writes were issued). Write these as concrete, reproducible backend asks:

1. **`GET /api/v1/admin/safe-hours` answers 500 INTERNAL_ERROR.** The route exists and authenticates; it fails once it reaches the handler. Blocks the entire Safe Hours admin panel — the FE currently falls back to a seed document.
2. **`GET /api/v1/admin/spin/config` answers 500 INTERNAL_ERROR.** Same shape of failure; blocks the spin config card the same way.
3. **`GET /api/v1/admin/spin/history?tier=<value>` answers 500 INTERNAL_ERROR** for every value tried (`r4`, `R4`, `Plus`). The unfiltered call and `?moment=` both work, so the tier filter alone is broken. The FE has disabled the tier filter control and does not forward the parameter until this is fixed.
4. **`GET /api/v1/admin/spin/history` returns an ambiguous `tier`.** The API doc's example shows `"Red Plus"`, but live rows carry bare marketing names — `Plus`, `Premium`, `Elite`, `Standard`, `Visitor`. `Plus` cannot be resolved to R4 vs B4, and `Premium` cannot be resolved to R7 vs B7, so the admin table shows a value no one can trace back to a sub-tier. Ask for either the sub-tier id alongside it or a fully-qualified name (`Red Plus`).
5. **A BENY add-on label leaks into tier data.** `spin/history.tier` and `dashboard.members_by_tier` both emit `"Smart Life Rewards Add On - BENY - DAILY"` as though it were a membership tier. BENY is a $4/month add-on, not a tier, and should not appear in either.
6. **`GET /api/v1/admin/dashboard`'s `members_by_tier` collapses Red and Blue.** It returned duplicate `Plus`, `Standard` and `Premium` rows because only the marketing name is sent, with no group. The existing dashboard page already works around this by reading `/memberships/stats` instead — the ask is to include the sub-tier id so the workaround can be dropped.
7. **`GET /api/v1/admin/prizes` returns `updated_at: null`** although the doc's example shows an ISO timestamp. The FE types it as `string | null`; confirm whether null is intended or the column is simply not being populated on write.
8. **`GET /api/v1/admin/notification-logs` emits a `type` outside the documented enum** — `password_reset` appeared in live rows but is not among the 10 documented notification types. Confirm the full real set before the Notifications admin panel is built against the documented enum.

Also note the one question the doc alone couldn't answer: whether a fresh `GET /admin/spin/config` returns only the 5 spin-eligible `sub_tier_id`s or all 8. It currently 500s so this is unverifiable; the FE's merge-and-preserve logic (`normalizeSpinConfig`) is written to be correct either way.

- [ ] **Step 3: Commit**

```bash
git add docs/BACKEND-ISSUES.md
git commit -m "docs(backend-issues): correct the false 404 claims, file the verified Sprint 4 defects"
```
