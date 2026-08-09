# Admin Spin Wheel Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admins one page at `/dashboard/spin` with two independent sections — a global/per-sub-tier enable toggle, and a filterable read-only spin history table — built ahead of a backend that returns 404 today.

**Architecture:** Two unrelated surfaces sharing one route. The config card follows the seed-fallback pattern already shipped for Prizes and Safe Hours (`page.tsx` fetch → seed on failure → form → server action). The history table is a plain filtered list (closest existing precedent: `src/app/dashboard/(routes)/winners/`), but degrades to its normal *empty* state on failure rather than a seed — there is no honest placeholder for a list of past events.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui (`Switch`, `Select`, `Form`) · React Hook Form + Zod 4.4.3 · Sonner · existing `DataTable` component

**Source spec:** [docs/superpowers/specs/2026-08-08-admin-spin-panel-design.md](../specs/2026-08-08-admin-spin-panel-design.md)

## Global Constraints

- **Prettier:** 4-space indent, single quotes, JSX single quotes, semicolons, print width 120, trailing comma `none`. Run `npm run format` or scope `npx prettier --write` to your own files — do not let it touch unrelated files (see the trap note in every task).
- **Path alias:** `@/*` → `src/*`.
- **Server Components by default.** `'use client'` only on the two client components (config form, history filters).
- **Dark tokens only** — no light mode, no new fonts.
- **Sub-tier scope:** the toggle covers exactly `R4, R7, B4, B7, B10` — `src/constant/tiers.ts`'s `SPIN_ELIGIBLE_SUB_TIERS`. Do not add Visitor, R1 or B1.
- **Never add a discount amount or probability field, anywhere in this feature.** PRD's PO decision defers that past the first release; this is a hard exclusion, not an oversight to flag later.
- **Seed fallback for the config card; empty state (not seed) for history** — this asymmetry is deliberate, see spec §3.5. Do not give history a fabricated placeholder row.
- **`npm run lint` is broken in this repo** (`next lint` mis-parses its arguments and lints a nonexistent directory). Every task uses `npx eslint <paths>` instead — do not attempt to fix `npm run lint` itself, out of scope.
- **Blank-input trap:** if you introduce any numeric text input in this feature, `z.coerce.number()` alone turns `""` into `0`. This plan's forms use `Switch` (boolean) and `Select` (enum) exclusively, so the trap does not apply here — noted for awareness only.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/types/member.ts` (modify) | Add `SpinHistoryRow`, `SpinEligibleSubTier`, `SpinConfig`. |
| `src/lib/api/endpoints.ts` (modify) | Add `admin.spinHistory`, `admin.spinConfig`. |
| `src/lib/api/resources/spin-admin.ts` (new) | Admin-gated resource functions, kept separate from the member-facing `spin.ts`. |
| `src/app/dashboard/(routes)/spin/seed.ts` (new) | Seed `SpinConfig` fallback. |
| `src/app/dashboard/(routes)/spin/page.tsx` (new) | Server: fetch both surfaces independently, render both sections. |
| `src/app/dashboard/(routes)/spin/spin-config-client.tsx` (new) | Client: toggle form. |
| `src/app/dashboard/(routes)/spin/spin-history-client.tsx` (new) | Client: filter dropdowns + `DataTable`. |
| `src/app/dashboard/(routes)/spin/_components/columns.tsx` (new) | `DataTable` column definitions for history rows. |
| `src/app/dashboard/(routes)/spin/actions.ts` (new) | Server action: save config. |
| `src/app/dashboard/(routes)/spin/loading.tsx` (new) | Route skeleton. |
| `src/components/ui/nav-main.tsx` (modify) | One nav entry. |
| `docs/BACKEND-ISSUES.md` (modify) | Backend asks per spec §7. |

---

## Task 1: Types, endpoints, resource

**Files:**
- Modify: `src/types/member.ts`
- Modify: `src/lib/api/endpoints.ts`
- Create: `src/lib/api/resources/spin-admin.ts`

**Interfaces:**
- Consumes: `apiFetch` from `@/lib/api/http`; `API` from `@/lib/api/endpoints`; `SubTierCode` from `@/types/member` (already defined).
- Produces: `SpinEligibleSubTier`, `SpinConfig { enabled: boolean; sub_tier_enabled: Record<SpinEligibleSubTier, boolean> }`, `SpinHistoryRow { id, member_name, tier, moment, result, discount_cents, spun_at }`; `getAdminSpinHistory(token, filters?)`, `getAdminSpinConfig(token)`, `updateAdminSpinConfig(token, payload)`. Tasks 2–4 all consume these.

- [ ] **Step 1: Add the types**

In `src/types/member.ts`, add near the Prizes/Safe Hours blocks:

```ts
// ── Spin Wheel Admin (PRD §5.7 "Spin Wheel Management") ──────────────────────
// First-release scope only: on/off + history. Discount amount and probability
// are explicitly deferred by PRD's PO decision — never add fields for them here.

export type SpinEligibleSubTier = 'R4' | 'R7' | 'B4' | 'B7' | 'B10';

export interface SpinConfig {
    enabled: boolean;
    sub_tier_enabled: Record<SpinEligibleSubTier, boolean>;
}

export interface SpinHistoryRow {
    id: string;
    member_name: string;
    tier: SubTierCode;
    moment: 'registration' | 'renewal';
    result: 'win' | 'lose';
    discount_cents: number;
    spun_at: string; // ISO 8601
}
```

- [ ] **Step 2: Add the endpoints**

In `src/lib/api/endpoints.ts`, add to the existing `admin` namespace (after `safeHours`):

```ts
        spinHistory: '/api/v1/admin/spin/history',
        spinConfig: '/api/v1/admin/spin/config',
```

- [ ] **Step 3: Write the resource**

Create `src/lib/api/resources/spin-admin.ts`:

```ts
import type { SpinConfig, SpinEligibleSubTier, SpinHistoryRow } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * Admin-only spin wheel functions (PRD §5.7). Kept separate from spin.ts, which
 * is the member-facing "check status / execute a spin" module — different
 * audience, different auth, no shared code.
 */

export interface SpinHistoryFilters {
    tier?: SpinEligibleSubTier;
    moment?: 'registration' | 'renewal';
}

function historyQuery(filters?: SpinHistoryFilters): string {
    const params = new URLSearchParams();
    if (filters?.tier) params.set('tier', filters.tier);
    if (filters?.moment) params.set('moment', filters.moment);

    const query = params.toString();

    return query ? `?${query}` : '';
}

export function getAdminSpinHistory(token: string, filters?: SpinHistoryFilters) {
    return apiFetch<SpinHistoryRow[]>(`${API.admin.spinHistory}${historyQuery(filters)}`, { token });
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

- [ ] **Step 4: Verify**

```bash
npm run format
npm run type-check
npx eslint src/lib/api/resources/spin-admin.ts src/lib/api/endpoints.ts src/types/member.ts
```
Expected: all clean.

- [ ] **Step 5: Commit**

```bash
git add src/types/member.ts src/lib/api/endpoints.ts src/lib/api/resources/spin-admin.ts
git commit -m "feat(spin): add admin spin endpoints and resource

Kept separate from the member-facing spin.ts — different audience,
different auth, no shared code. Both endpoints 404 today (verified
live); the admin page wired in a later task falls back to seed data
for config and an empty state for history.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: Seed, loading skeleton, nav entry

**Files:**
- Create: `src/app/dashboard/(routes)/spin/seed.ts`
- Create: `src/app/dashboard/(routes)/spin/loading.tsx`
- Modify: `src/components/ui/nav-main.tsx`

**Interfaces:**
- Consumes: `SpinConfig` (Task 1).
- Produces: `SPIN_CONFIG_SEED: SpinConfig`. Task 4 consumes this.

- [ ] **Step 1: Write the seed**

Create `src/app/dashboard/(routes)/spin/seed.ts`:

```ts
import type { SpinConfig } from '@/types/member';

/**
 * Placeholder document the config card falls back to while
 * `GET /api/v1/admin/spin/config` is unimplemented (verified 404 on 2026-08-08,
 * and not even documented in the API Contract — see spec §3.3).
 *
 * All five spin-eligible sub-tiers default to enabled, matching how the wheel
 * behaves today with no admin toggle at all. Delete once the endpoint answers.
 */
export const SPIN_CONFIG_SEED: SpinConfig = {
    enabled: true,
    sub_tier_enabled: {
        R4: true,
        R7: true,
        B4: true,
        B7: true,
        B10: true
    }
};
```

- [ ] **Step 2: Add the loading skeleton**

Create `src/app/dashboard/(routes)/spin/loading.tsx`:

```tsx
import { DetailSkeleton } from '@/components/common/skeletons';

export default function Loading() {
    return <DetailSkeleton />;
}
```

- [ ] **Step 3: Add the nav entry**

In `src/components/ui/nav-main.tsx`, add `Dices` to the `lucide-react` import in alphabetical position (it sits between `Clock` and `FileSpreadsheet` — `Di` sorts after `Cl` and before `Fi`), and insert into `ITEMS` immediately after the Safe Hours entry:

```ts
    { title: 'Spin Wheel', href: '/dashboard/spin', icon: Dices }
```

- [ ] **Step 4: Verify**

```bash
npm run format
npm run type-check
npx eslint src/components/ui/nav-main.tsx "src/app/dashboard/(routes)/spin/seed.ts" "src/app/dashboard/(routes)/spin/loading.tsx"
```
Expected: all clean. (No `page.tsx` yet — `npm run build` is deferred to Task 4.)

- [ ] **Step 5: Commit**

```bash
git add "src/app/dashboard/(routes)/spin/seed.ts" "src/app/dashboard/(routes)/spin/loading.tsx" src/components/ui/nav-main.tsx
git commit -m "feat(spin): add seed config, loading state and nav entry

Seed matches the wheel's current no-admin-toggle behaviour (every
eligible sub-tier enabled), so the placeholder figures are a faithful
default rather than an arbitrary one.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: History table

Built before the config card because it has no cross-task dependency beyond Task 1's types, and isolates the one genuinely new UI pattern in this plan (URL-driven filters) from the config form's already-proven pattern (copied near-verbatim from Safe Hours).

**Files:**
- Create: `src/app/dashboard/(routes)/spin/_components/columns.tsx`
- Create: `src/app/dashboard/(routes)/spin/spin-history-client.tsx`

**Interfaces:**
- Consumes: `SpinHistoryRow` (Task 1).
- Produces: `SpinHistoryClient` component, taking `{ rows: SpinHistoryRow[]; tier: string; moment: string }`. Task 4's `page.tsx` renders it.

- [ ] **Step 1: Write the columns**

Create `src/app/dashboard/(routes)/spin/_components/columns.tsx`:

```tsx
import type { Column } from '@/components/data-table';
import { SUB_TIERS } from '@/constant/tiers';
import type { SubTierCode } from '@/types/member';
import { cn } from '@/lib/utils';

const RESULT_STYLE: Record<'win' | 'lose', string> = {
    win: 'border-emerald-500/40 text-emerald-400',
    lose: 'border-white/10 text-slr-dim'
};

export const spinHistoryColumns: Column[] = [
    {
        key: 'member_name',
        label: 'Member',
        render: (row) => <span className='font-medium text-white'>{row.member_name}</span>
    },
    {
        key: 'tier',
        label: 'Tier',
        render: (row) => {
            const meta = SUB_TIERS[row.tier as SubTierCode];

            return <span className='text-sm'>{meta ? `${meta.label} · ${meta.marketingName}` : row.tier}</span>;
        }
    },
    {
        key: 'moment',
        label: 'Moment',
        render: (row) => <span className='text-sm capitalize'>{row.moment}</span>
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
        render: (row) => <span className='tabular-nums'>{row.result === 'win' ? `$${(row.discount_cents / 100).toFixed(2)}` : '—'}</span>
    },
    {
        key: 'spun_at',
        label: 'Date',
        render: (row) => <span className='text-slr-dim text-xs'>{new Date(row.spun_at).toLocaleString('en-AU')}</span>
    }
];
```

- [ ] **Step 2: Write the filters + table client component**

Create `src/app/dashboard/(routes)/spin/spin-history-client.tsx`. This is the one genuinely new pattern in this plan — a `Select` that drives the URL's query string, read back by the server page on next render:

```tsx
'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SpinHistoryRow } from '@/types/member';

import { spinHistoryColumns } from './_components/columns';
import { History } from 'lucide-react';

const TIER_OPTIONS = ['R4', 'R7', 'B4', 'B7', 'B10'] as const;
const MOMENT_OPTIONS = ['registration', 'renewal'] as const;

export function SpinHistoryClient({
    rows,
    tier,
    moment
}: {
    rows: SpinHistoryRow[];
    tier: string;
    moment: string;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Both filters live in the URL so the filtered view is shareable/reloadable,
    // matching how (routes)/winners/page.tsx keeps its ?giveaway= filter in the
    // URL rather than component state.
    const setFilter = (key: 'tier' | 'moment', value: string) => {
        const params = new URLSearchParams();
        if (key === 'tier' ? value !== 'all' : tier !== 'all') params.set('tier', key === 'tier' ? value : tier);
        if (key === 'moment' ? value !== 'all' : moment !== 'all')
            params.set('moment', key === 'moment' ? value : moment);

        const query = params.toString();

        startTransition(() => {
            router.push(`/dashboard/spin${query ? `?${query}` : ''}`);
        });
    };

    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap gap-3'>
                <Select value={tier} onValueChange={(value) => setFilter('tier', value)}>
                    <SelectTrigger className='w-40'>
                        <SelectValue placeholder='Tier' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>All tiers</SelectItem>
                        {TIER_OPTIONS.map((code) => (
                            <SelectItem key={code} value={code}>
                                {code}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={moment} onValueChange={(value) => setFilter('moment', value)}>
                    <SelectTrigger className='w-44'>
                        <SelectValue placeholder='Moment' />
                    </SelectTrigger>
                    <SelectContent className='dashboard-theme dark'>
                        <SelectItem value='all'>Registration + renewal</SelectItem>
                        {MOMENT_OPTIONS.map((value) => (
                            <SelectItem key={value} value={value}>
                                {value === 'registration' ? 'Registration' : 'Renewal'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                searchKey='member_name'
                columns={spinHistoryColumns}
                data={rows}
                isLoading={isPending}
                alwaysShowPagination
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

- [ ] **Step 3: Verify**

```bash
npm run format
npm run type-check
npx eslint "src/app/dashboard/(routes)/spin/_components/columns.tsx" "src/app/dashboard/(routes)/spin/spin-history-client.tsx"
```
Expected: all clean. (`npm run build` deferred to Task 4 — `page.tsx` doesn't exist yet, so this route can't compile standalone.)

- [ ] **Step 4: Commit**

```bash
git add "src/app/dashboard/(routes)/spin/_components/columns.tsx" "src/app/dashboard/(routes)/spin/spin-history-client.tsx"
git commit -m "feat(spin): add the spin history table and URL-driven filters

Tier and moment filters live in the URL (not component state), so a
filtered view is shareable and survives a reload — same reasoning as
the ?giveaway= filter on the Winners page.

Empty state, not a seed row: a fabricated placeholder spin would
misrepresent real history, unlike the config card where a sane
starting toggle state is honest.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: Config card, save action, and the page

**Files:**
- Create: `src/app/dashboard/(routes)/spin/actions.ts`
- Create: `src/app/dashboard/(routes)/spin/spin-config-client.tsx`
- Create: `src/app/dashboard/(routes)/spin/page.tsx`

**Interfaces:**
- Consumes: `getAdminSpinHistory`, `getAdminSpinConfig`, `updateAdminSpinConfig` (Task 1); `SPIN_CONFIG_SEED` (Task 2); `SpinHistoryClient` (Task 3); `SpinConfig`, `SpinEligibleSubTier` (Task 1).
- Produces: the working `/dashboard/spin` route.

- [ ] **Step 1: Write the server action**

Create `src/app/dashboard/(routes)/spin/actions.ts`. Same `ActionResult`/`toActionError` shape as `(routes)/safe-hours/actions.ts` and `(routes)/prizes/actions.ts` — every dashboard route owns its own actions file in this codebase:

```ts
'use server';

import { revalidatePath } from 'next/cache';

import { handleApiAuthError } from '@/lib/api/guard';
import { updateAdminSpinConfig } from '@/lib/api/resources/spin-admin';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type { SpinConfig } from '@/types/member';

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

export async function saveSpinConfigAction(payload: SpinConfig): Promise<ActionResult<SpinConfig>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updateAdminSpinConfig(token, payload);

        revalidatePath('/dashboard/spin');

        return { ok: true, data, message: 'Spin wheel settings saved.' };
    } catch (error) {
        return toActionError(error);
    }
}
```

- [ ] **Step 2: Write the config form**

Create `src/app/dashboard/(routes)/spin/spin-config-client.tsx`:

```tsx
'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SUB_TIERS } from '@/constant/tiers';
import type { SpinConfig, SpinEligibleSubTier } from '@/types/member';

import { saveSpinConfigAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

const ELIGIBLE_SUB_TIERS: SpinEligibleSubTier[] = ['R4', 'R7', 'B4', 'B7', 'B10'];

export function SpinConfigClient({ config }: { config: SpinConfig }) {
    const [isPending, startTransition] = useTransition();

    // No react-hook-form here: every field is a Switch, so there is nothing to
    // validate — Prizes/Safe Hours use RHF+Zod because they have text/number
    // fields with real validation rules; this form has none.
    const [enabled, setEnabled] = useState(config.enabled);
    const [subTierEnabled, setSubTierEnabled] = useState(config.sub_tier_enabled);

    const isDirty =
        enabled !== config.enabled ||
        ELIGIBLE_SUB_TIERS.some((code) => subTierEnabled[code] !== config.sub_tier_enabled[code]);

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveSpinConfigAction({ enabled, sub_tier_enabled: subTierEnabled });

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
                    <Switch id='spin-enabled' checked={enabled} onCheckedChange={setEnabled} />
                </div>

                <div className='space-y-3 border-t pt-4'>
                    {ELIGIBLE_SUB_TIERS.map((code) => (
                        <div key={code} className='flex items-center justify-between'>
                            <Label htmlFor={`spin-tier-${code}`}>
                                {SUB_TIERS[code].label} · {SUB_TIERS[code].marketingName}
                            </Label>
                            <Switch
                                id={`spin-tier-${code}`}
                                checked={subTierEnabled[code]}
                                onCheckedChange={(checked) =>
                                    setSubTierEnabled((prev) => ({ ...prev, [code]: checked }))
                                }
                            />
                        </div>
                    ))}
                </div>

                <Button onClick={handleSave} disabled={isPending || !isDirty}>
                    {isPending ? <Loader2Icon className='mr-2 h-4 w-4 animate-spin' /> : null}
                    Save changes
                </Button>
            </CardContent>
        </Card>
    );
}
```

- [ ] **Step 3: Write the page**

Create `src/app/dashboard/(routes)/spin/page.tsx`. Both fetches run independently via `Promise.allSettled` — a config failure must not blank the history table and vice versa:

```tsx
import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { getAdminSpinConfig, getAdminSpinHistory } from '@/lib/api/resources/spin-admin';
import { getAccessToken } from '@/lib/api/server';
import type { SpinConfig, SpinEligibleSubTier, SpinHistoryRow } from '@/types/member';

import { SpinConfigClient } from './spin-config-client';
import { SpinHistoryClient } from './spin-history-client';
import { SPIN_CONFIG_SEED } from './seed';

export default async function SpinPage({
    searchParams
}: {
    searchParams: Promise<{ tier?: string; moment?: string }>;
}) {
    const { tier = 'all', moment = 'all' } = await searchParams;
    const token = await getAccessToken();

    let config: SpinConfig;
    let isConfigPlaceholder = false;
    let history: SpinHistoryRow[] = [];

    if (token) {
        const [configResult, historyResult] = await Promise.allSettled([
            getAdminSpinConfig(token),
            getAdminSpinHistory(token, {
                tier: tier === 'all' ? undefined : (tier as SpinEligibleSubTier),
                moment: moment === 'all' ? undefined : (moment as 'registration' | 'renewal')
            })
        ]);

        if (configResult.status === 'fulfilled') {
            config = configResult.value;
        } else {
            config = SPIN_CONFIG_SEED;
            isConfigPlaceholder = true;
        }

        if (historyResult.status === 'fulfilled') {
            history = historyResult.value;
        }
        // On failure, history stays [] — the table's own empty state handles it,
        // per spec §3.5: a list has no honest placeholder, unlike the config card.
    } else {
        config = SPIN_CONFIG_SEED;
        isConfigPlaceholder = true;
    }

    return (
        <DashboardPageShell>
            <Heading title='Spin Wheel' description='Availability and spin history for the registration and renewal wheel.' />

            <div className='space-y-6'>
                {isConfigPlaceholder ? (
                    <p className='text-muted-foreground text-sm'>
                        Showing placeholder settings — the spin config endpoint is not live yet, so saving will not
                        persist.
                    </p>
                ) : null}

                <SpinConfigClient config={config} />
                <SpinHistoryClient rows={history} tier={tier} moment={moment} />
            </div>
        </DashboardPageShell>
    );
}
```

- [ ] **Step 4: Verify**

```bash
npm run format
npm run type-check
npx eslint "src/app/dashboard/(routes)/spin/**/*.tsx" "src/app/dashboard/(routes)/spin/**/*.ts"
npm run build
```
Expected: all clean; `/dashboard/spin` appears in the build's route table.

- [ ] **Step 5: Verify the two sections fail independently**

Cannot drive a browser. Instead, trace the code path by hand and confirm in the report: with both endpoints 404ing (today's real state), `configResult.status` is `'rejected'` → `config = SPIN_CONFIG_SEED`, `isConfigPlaceholder = true`; `historyResult.status` is also `'rejected'` → `history` stays `[]`. Confirm there is no code path where a `Promise.allSettled` rejection on one promise could throw and prevent the other's result from being read (there isn't, by construction of `allSettled`, but state that explicitly in the report rather than asserting it from memory).

- [ ] **Step 6: Commit**

```bash
git add "src/app/dashboard/(routes)/spin/actions.ts" "src/app/dashboard/(routes)/spin/spin-config-client.tsx" "src/app/dashboard/(routes)/spin/page.tsx"
git commit -m "feat(spin): add the config card and wire the spin admin page

Promise.allSettled, not Promise.all — the config and history fetches
hit different endpoints and must fail independently, per spec §3.4.
Config falls back to seed data (mirrors Prizes/Safe Hours); history
falls back to its own empty state instead, since a fabricated spin
record would misrepresent real history.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: Backend handoff

**Files:**
- Modify: `docs/BACKEND-ISSUES.md`

**Interfaces:** none — documentation only.

- [ ] **Step 1: Append the Spin Wheel subsection**

Open `docs/BACKEND-ISSUES.md`. The Sprint 4 section is a top-level `#` heading (promoted from `##` during the Safe Hours handoff) containing `## Prizes CMS ...` and `## Safe Hours (Admin Settings)` as `##` subsections. Append a third `##` subsection, `## Spin Wheel (Admin Panel)`, in the same Indonesian-prose/English-field-names style:

```markdown
## Spin Wheel (Admin Panel)

Endpoint yang dibutuhkan admin panel Spin Wheel (verified 404, 2026-08-08 — dan `GET /admin/spin/config` malah belum ada sama sekali di API Contract, cuma `PUT`):

### GET /api/v1/admin/spin/history
Riwayat spin, filter opsional `?tier=` (salah satu dari `R4|R7|B4|B7|B10`) dan `?moment=` (`registration|renewal`). Admin JWT.

Response body yang diasumsikan FE (belum dikonfirmasi — field names inferred dari tipe `SpinResult` yang sudah ada, tolong konfirmasi atau kasih bentuk aslinya):
```json
[
  {
    "id": "spin_123",
    "member_name": "Jane Doe",
    "tier": "R4",
    "moment": "registration",
    "result": "win",
    "discount_cents": 1000,
    "spun_at": "2026-08-05T09:14:00Z"
  }
]
```

### GET /api/v1/admin/spin/config — BELUM ADA DI KONTRAK, MOHON DITAMBAHKAN
Ambil status toggle saat ini. Tanpa ini, halaman admin gak punya cara nampilin state toggle yang aktif sebelum diedit. Admin JWT.

### PUT /api/v1/admin/spin/config
Update status enable/disable. Admin JWT.

Request/response body:
```json
{
  "enabled": true,
  "sub_tier_enabled": { "R4": true, "R7": true, "B4": true, "B7": true, "B10": true }
}
```

**Sengaja TIDAK ada** field `discount_cents`/probabilitas per sub-tier — PRD §5.7 (keputusan PO) eksplisit nunda config itu sampai rilis berikutnya. Kalau response asli backend punya field itu, FE form ini akan mengabaikannya (tidak dirender, tidak dikirim balik).

**Yang diminta ke tim backend:**
1. Implement `GET /admin/spin/history` dan `GET`+`PUT /admin/spin/config`.
2. **Tambahkan `GET /admin/spin/config`** ke kontrak — saat ini cuma `PUT` yang terdaftar.
3. Konfirmasi bentuk `SpinHistoryRow` di atas, atau kasih bentuk aslinya kalau beda.
4. Konfirmasi apakah `GET .../history` di-paginate server-side atau FE tetap ambil semua baris sekaligus dan paginate di client (asumsi FE saat ini, sama seperti Winners/Ebooks).
5. Seed `SpinConfig` dengan semua sub-tier `true` (default hari ini, tanpa toggle admin).

**Tambahan — di luar kontrak sama sekali:** PRD §5.7 juga minta monitoring status kirim email reminder 24 jam sebelum renewal (sent/failed). Tidak ada endpoint untuk ini di mana pun di API Contract, baik di bawah Spin Wheel maupun Notifications. Belum di-scope FE — nunggu endpoint atau konfirmasi ini masuk modul Notifications.

FE admin panel sudah dibangun (toggle + history + filter) dan langsung berfungsi begitu endpoint di atas hidup.
```

- [ ] **Step 2: Verify the heading hierarchy is still consistent**

```bash
grep -n "^# \|^## " docs/BACKEND-ISSUES.md | sed -n '/SPRINT 4/,+5p'
```
Expected: one `#` for Sprint 4, with `## Prizes CMS`, `## Safe Hours (Admin Settings)`, `## Spin Wheel (Admin Panel)` as its three `##` children, in that order.

- [ ] **Step 3: Commit**

```bash
git add docs/BACKEND-ISSUES.md
git commit -m "docs(spin): file the backend contract request

Same reasoning as the Prizes and Safe Hours handoffs — the FE admin
panel is built and waiting. Flags the missing GET /admin/spin/config
explicitly rather than assuming it exists.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:** §2 scope (toggle + history only, no discount/probability, no 24h-reminder monitoring) → enforced by the Global Constraints hard exclusion and Task 5's explicit backend ask for the monitoring gap. §3.1 (five sub-tier granularity) → Task 1's `SpinEligibleSubTier`, Task 4's `ELIGIBLE_SUB_TIERS` array. §3.2 (history columns inferred, not invented) → Task 1's `SpinHistoryRow`, sourced from the existing `SpinResult` shape. §3.3 (GET for config proposed, not assumed) → Task 1 includes `getAdminSpinConfig`, and Task 5 flags it explicitly as "BELUM ADA DI KONTRAK". §3.4 (independent failure) → Task 4's `Promise.allSettled`. §3.5 (seed vs empty-state asymmetry) → Task 2 (seed) and Task 3 (empty state), both explained inline. §4 (contract) → Task 1's resource + Task 5's doc, kept in sync. §5 (data layer) → Task 1. §6 (page, nav) → Tasks 2–4. §7 (backend asks) → Task 5. §8 (verification) → each task's Step 4/5. §9 (file touch list) → matches the File Structure table. **No gaps.**

**Placeholder scan:** no TBD/TODO. Every code step has complete code. ✔

**Type consistency:** `SpinConfig { enabled, sub_tier_enabled }` defined once in Task 1, consumed identically in Tasks 2 (seed), 4 (form, action, page). `SpinEligibleSubTier` used as the `Record` key in Task 1 and iterated identically in Task 4's `ELIGIBLE_SUB_TIERS` array — same five literal values in both places. `SpinHistoryRow` defined once in Task 1, consumed by Task 3's columns and `SpinHistoryClient` props, and Task 4's `page.tsx`. `getAdminSpinConfig`/`updateAdminSpinConfig`/`getAdminSpinHistory` all take `token` first, matching every other admin-gated resource in this sprint (Prizes, Safe Hours). `saveSpinConfigAction` returns `ActionResult<SpinConfig>`, and the client branches on `.ok`/`.message`/`.status`/`.code` — identical to the Prizes/Safe Hours action shape. ✔
