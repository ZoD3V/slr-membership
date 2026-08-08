# Admin Safe Hours Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admins a single-document editor at `/dashboard/safe-hours` for the Friday lockout window (weekday, start hour, end hour), rendered against seed data while the backend endpoint is unimplemented.

**Architecture:** One stored document (`GET/PUT /api/v1/admin/safe-hours`, both admin-gated). The admin page follows the exact shape already shipped for Prizes: server `page.tsx` (fetch + seed fallback) → `'use client'` form → `'use server'` action → `lib/api/resources/*`. No derivation module is needed here — unlike Prizes there is no stage math, just three fields and a range check.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui (`Select`, `Input`, `Form`) · React Hook Form + Zod 4.4.3 · Sonner

**Source spec:** [docs/superpowers/specs/2026-08-08-admin-safe-hours-design.md](../specs/2026-08-08-admin-safe-hours-design.md)

## Global Constraints

- **Prettier:** 4-space indent, single quotes, JSX single quotes, semicolons, print width 120, trailing comma `none`. Run `npm run format`, never hand-format.
- **Path alias:** `@/*` → `src/*`.
- **Server Components by default.** `'use client'` only on the form.
- **Dark tokens only** — no light mode, no new fonts.
- **Weekday values:** `'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'` — matches the values `src/lib/safe-hours.ts` already uses. Do not invent a different encoding (numbers, full names).
- **Hours are 0–23 integers.** `end_hour` must be strictly greater than `start_hour` — a window cannot close before or exactly when it opens.
- **Blank-input trap:** `z.coerce.number()` alone turns `""` into `0`, a valid hour, silently saving a wrong window. Reuse Prizes' string-first-then-transform pattern (`src/app/dashboard/(routes)/prizes/prizes-client.tsx`) verbatim — do not re-derive it.
- **No timezone field.** The window is always `Australia/Sydney`; this stays a code constant, never sent on the wire.
- **Seed fallback, not an error card.** On fetch failure, render the form against seed data with a muted placeholder banner — the same pattern Prizes uses (`src/app/dashboard/(routes)/prizes/{page.tsx,seed.ts}`). This is an explicit, confirmed user preference from the Prizes work in this session — do not substitute a `ListErrorCard`.
- **Out of scope, do not build:** a blocked-attempts log, member notifications, an expiring "override" concept distinct from the stored document, or any change to `src/lib/safe-hours.ts` / `hooks/use-safe-hours.ts` / `SafeHoursNotice` (no public endpoint exists for them to read from).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/types/member.ts` (modify) | Add `Weekday` and `SafeHoursConfig`. |
| `src/lib/api/endpoints.ts` (modify) | Add `admin.safeHours` path. |
| `src/lib/api/resources/safe-hours.ts` (new) | `getAdminSafeHours` / `updateAdminSafeHours` on top of `apiFetch`. |
| `src/app/dashboard/(routes)/safe-hours/seed.ts` (new) | Fallback constant — today's hardcoded default. |
| `src/app/dashboard/(routes)/safe-hours/page.tsx` (new) | Server: fetch, seed fallback, shell. |
| `src/app/dashboard/(routes)/safe-hours/safe-hours-client.tsx` (new) | Client: RHF + Zod form. |
| `src/app/dashboard/(routes)/safe-hours/actions.ts` (new) | Server action: save + revalidate. |
| `src/app/dashboard/(routes)/safe-hours/loading.tsx` (new) | Route skeleton. |
| `src/components/ui/nav-main.tsx` (modify) | One nav entry. |
| `docs/BACKEND-ISSUES.md` (modify) | Backend asks per spec §7. |

---

## Task 1: Types, endpoint, resource

**Files:**
- Modify: `src/types/member.ts`
- Modify: `src/lib/api/endpoints.ts`
- Create: `src/lib/api/resources/safe-hours.ts`

**Interfaces:**
- Consumes: `apiFetch` from `@/lib/api/http`; `API` from `@/lib/api/endpoints`.
- Produces: `Weekday`, `SafeHoursConfig { weekday: Weekday; start_hour: number; end_hour: number }`; `getAdminSafeHours(token: string): Promise<SafeHoursConfig>`; `updateAdminSafeHours(token: string, payload: SafeHoursConfig): Promise<SafeHoursConfig>`. Tasks 2, 3, 4 all consume these.

- [ ] **Step 1: Add the types**

In `src/types/member.ts`, add near the other admin-CMS-adjacent types (the Prizes block is a reasonable neighbour):

```ts
// ── Safe Hours (PRD §5.8 "Safe Hours Management") ────────────────────────────
// Admin-edited window during which sign-up/upgrade/downgrade are locked. The
// member-facing advisory check in src/lib/safe-hours.ts is a separate, static
// constant — there is no public endpoint for it to read this document from
// (see docs/superpowers/specs/2026-08-08-admin-safe-hours-design.md §2).

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface SafeHoursConfig {
    weekday: Weekday;
    start_hour: number; // 0-23
    end_hour: number; // 0-23, strictly greater than start_hour
}
```

- [ ] **Step 2: Add the endpoint**

In `src/lib/api/endpoints.ts`, add to the existing `admin` namespace (after `winnerDetail`):

```ts
        safeHours: '/api/v1/admin/safe-hours',
```

- [ ] **Step 3: Write the resource**

Create `src/lib/api/resources/safe-hours.ts`:

```ts
import type { SafeHoursConfig } from '@/types/member';

import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * The Friday lockout window (PRD §5.8). Admin-gated in both directions — unlike
 * Prizes there is no public/member-facing read of this document, so neither
 * function is wrapped in cache().
 */
export function getAdminSafeHours(token: string) {
    return apiFetch<SafeHoursConfig>(API.admin.safeHours, { token });
}

/** Full-document replace. */
export function updateAdminSafeHours(token: string, payload: SafeHoursConfig) {
    return apiFetch<SafeHoursConfig>(API.admin.safeHours, {
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
npx eslint src/lib/api/resources/safe-hours.ts src/lib/api/endpoints.ts src/types/member.ts
```
Expected: all clean.

- [ ] **Step 5: Commit**

```bash
git add src/types/member.ts src/lib/api/endpoints.ts src/lib/api/resources/safe-hours.ts
git commit -m "feat(safe-hours): add admin safe-hours endpoint and resource

Both directions are admin-gated — unlike Prizes, no public endpoint
exists for the member-facing advisory check to read from, so this
resource is used only by the admin editor.

Route returns 404 today (verified live); the admin page wired in a
later task falls back to seed data rather than erroring.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: Seed data and the route shell

**Files:**
- Create: `src/app/dashboard/(routes)/safe-hours/seed.ts`
- Create: `src/app/dashboard/(routes)/safe-hours/loading.tsx`
- Modify: `src/components/ui/nav-main.tsx`

**Interfaces:**
- Consumes: `SafeHoursConfig` (Task 1).
- Produces: `SAFE_HOURS_SEED: SafeHoursConfig`. Task 3 consumes this.

- [ ] **Step 1: Write the seed**

Create `src/app/dashboard/(routes)/safe-hours/seed.ts`:

```ts
import type { SafeHoursConfig } from '@/types/member';

/**
 * Placeholder document the editor falls back to while `GET /api/v1/admin/safe-hours`
 * is still unimplemented (verified 404 on 2026-08-08).
 *
 * Matches the current hardcoded default in src/lib/safe-hours.ts — the same
 * figures the backend is asked to seed with in docs/BACKEND-ISSUES.md, so what
 * an admin sees here matches what the first real GET will return.
 *
 * Scoped to this route. Delete once the endpoint answers.
 */
export const SAFE_HOURS_SEED: SafeHoursConfig = {
    weekday: 'Fri',
    start_hour: 16,
    end_hour: 19
};
```

- [ ] **Step 2: Add the loading skeleton**

Create `src/app/dashboard/(routes)/safe-hours/loading.tsx`:

```tsx
import { DetailSkeleton } from '@/components/common/skeletons';

export default function Loading() {
    return <DetailSkeleton />;
}
```

- [ ] **Step 3: Add the nav entry**

In `src/components/ui/nav-main.tsx`, add `Clock` to the `lucide-react` import between `ClipboardList` and `FileSpreadsheet` (`Cli` sorts before `Clo`), and insert into `ITEMS` immediately after the Prizes entry:

```ts
    { title: 'Safe Hours', href: '/dashboard/safe-hours', icon: Clock }
```

`Clock` is already the icon `SafeHoursNotice` uses for this same concept on the member side (`src/components/common/safe-hours-notice.tsx`) — reusing it keeps the association obvious. It is not used by any other nav item.

- [ ] **Step 4: Verify**

```bash
npm run format
npm run type-check
npx eslint src/components/ui/nav-main.tsx "src/app/dashboard/(routes)/safe-hours/**/*.tsx"
```
Expected: all clean. (The route has no `page.tsx` yet, so `npm run build` is deferred to Task 3, which adds it.)

- [ ] **Step 5: Commit**

```bash
git add "src/app/dashboard/(routes)/safe-hours/seed.ts" "src/app/dashboard/(routes)/safe-hours/loading.tsx" src/components/ui/nav-main.tsx
git commit -m "feat(safe-hours): add seed data, loading state and nav entry

Seed matches src/lib/safe-hours.ts's current hardcoded default, so the
admin editor's placeholder figures match what the backend is asked to
seed the real document with.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: Admin form, save action, and the page

**Files:**
- Create: `src/app/dashboard/(routes)/safe-hours/actions.ts`
- Create: `src/app/dashboard/(routes)/safe-hours/safe-hours-client.tsx`
- Create: `src/app/dashboard/(routes)/safe-hours/page.tsx`

**Interfaces:**
- Consumes: `getAdminSafeHours` / `updateAdminSafeHours` (Task 1); `SAFE_HOURS_SEED` (Task 2); `SafeHoursConfig`, `Weekday` (Task 1).
- Produces: the working `/dashboard/safe-hours` route.

- [ ] **Step 1: Write the server action**

Create `src/app/dashboard/(routes)/safe-hours/actions.ts`. The `ActionResult`/`toActionError` shape is copied from `(routes)/prizes/actions.ts` (itself copied from `(routes)/ebooks/actions.ts`) so every dashboard route stays uniform:

```ts
'use server';

import { revalidatePath } from 'next/cache';

import { handleApiAuthError } from '@/lib/api/guard';
import { updateAdminSafeHours } from '@/lib/api/resources/safe-hours';
import { getAccessToken } from '@/lib/api/server';
import { ApiError } from '@/lib/api/types';
import type { SafeHoursConfig } from '@/types/member';

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

export async function saveSafeHoursAction(payload: SafeHoursConfig): Promise<ActionResult<SafeHoursConfig>> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const data = await updateAdminSafeHours(token, payload);

        revalidatePath('/dashboard/safe-hours');

        return { ok: true, data, message: 'Safe hours saved.' };
    } catch (error) {
        return toActionError(error);
    }
}
```

- [ ] **Step 2: Write the client form**

Create `src/app/dashboard/(routes)/safe-hours/safe-hours-client.tsx`. The blank-input Zod pattern for the two hour fields is transcribed from `(routes)/prizes/prizes-client.tsx`'s `current_members` field — same reasoning, same shape, applied twice:

```tsx
'use client';

import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SafeHoursConfig, Weekday } from '@/types/member';
import { zodResolver } from '@hookform/resolvers/zod';

import { saveSafeHoursAction } from './actions';
import { Loader2Icon } from 'lucide-react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const WEEKDAYS: { value: Weekday; label: string }[] = [
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' },
    { value: 'Sun', label: 'Sunday' }
];

// Blank input must be rejected, not coerced to 0 — see prizes-client.tsx's
// current_members field for the same reasoning applied to a different value.
const hourField = (label: string) =>
    z.coerce
        .string()
        .trim()
        .min(1, 'Required')
        .transform((value, ctx) => {
            const parsed = Number(value);

            if (!Number.isInteger(parsed)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} must be a whole number` });

                return z.NEVER;
            }

            if (parsed < 0 || parsed > 23) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} must be between 0 and 23` });

                return z.NEVER;
            }

            return parsed;
        });

const formSchema = z
    .object({
        weekday: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
        start_hour: hourField('Start hour'),
        end_hour: hourField('End hour')
    })
    .refine((values) => values.end_hour > values.start_hour, {
        message: 'End hour must be after start hour',
        path: ['end_hour']
    });

type FormValues = z.infer<typeof formSchema>;

function toFormValues(config: SafeHoursConfig): FormValues {
    return {
        weekday: config.weekday,
        start_hour: config.start_hour,
        end_hour: config.end_hour
    };
}

export function SafeHoursClient({ config }: { config: SafeHoursConfig }) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: toFormValues(config)
    });

    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            const result = await saveSafeHoursAction(values);

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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='max-w-md space-y-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Lockout window</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='weekday'
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
                                                <SelectItem key={day.value} value={day.value}>
                                                    {day.label}
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
                                name='start_hour'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start hour</FormLabel>
                                        <FormControl>
                                            <Input type='number' min={0} max={23} step={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='end_hour'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End hour</FormLabel>
                                        <FormControl>
                                            <Input type='number' min={0} max={23} step={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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

- [ ] **Step 3: Write the page**

Create `src/app/dashboard/(routes)/safe-hours/page.tsx`, following the seed-fallback shape from `(routes)/prizes/page.tsx`:

```tsx
import { DashboardPageShell } from '@/app/dashboard/_components/page-shell';
import Heading from '@/components/ui/heading';
import { handleApiAuthError } from '@/lib/api/guard';
import { getAdminSafeHours } from '@/lib/api/resources/safe-hours';
import { getAccessToken } from '@/lib/api/server';
import type { SafeHoursConfig } from '@/types/member';

import { SafeHoursClient } from './safe-hours-client';
import { SAFE_HOURS_SEED } from './seed';

export default async function SafeHoursPage() {
    const token = await getAccessToken();

    let config: SafeHoursConfig;
    let isPlaceholder = false;

    try {
        config = token ? await getAdminSafeHours(token) : SAFE_HOURS_SEED;
        if (!token) isPlaceholder = true;
    } catch (error) {
        handleApiAuthError(error); // 401 → force logout; other errors fall through
        // The endpoint is still unimplemented, so the editor renders against the
        // seed document rather than an error card — the form stays usable for
        // admin walkthroughs. Saving still fails loudly via the action's toast.
        config = SAFE_HOURS_SEED;
        isPlaceholder = true;
    }

    return (
        <DashboardPageShell>
            <Heading title='Safe Hours' description='Configure the sign-up and plan-change lockout window.' />

            {isPlaceholder ? (
                <p className='text-muted-foreground text-sm'>
                    Showing placeholder figures — the safe-hours endpoint is not live yet, so saving will not
                    persist.
                </p>
            ) : null}

            <SafeHoursClient config={config} />
        </DashboardPageShell>
    );
}
```

- [ ] **Step 4: Verify**

```bash
npm run format
npm run type-check
npx eslint "src/app/dashboard/(routes)/safe-hours/**/*.tsx"
npm run build
```
Expected: all clean; `/dashboard/safe-hours` appears in the build's route table.

- [ ] **Step 5: Exercise the validation cases**

Cannot drive a browser — verify by hand-tracing the schema (or a throwaway script run with `node` against the installed zod, deleted afterward, same technique used for Prizes' schema verification):
- `start_hour='16', end_hour='19'` → valid.
- `start_hour='19', end_hour='16'` → rejected, "End hour must be after start hour".
- `start_hour='16', end_hour='16'` → rejected (not strictly greater).
- `start_hour=''` → rejected, "Start hour must be a whole number" (not silently 0).
- `start_hour='25'` → rejected, "Start hour must be between 0 and 23".

Report the actual output in the task report; do not claim a browser check.

- [ ] **Step 6: Commit**

```bash
git add "src/app/dashboard/(routes)/safe-hours/actions.ts" "src/app/dashboard/(routes)/safe-hours/safe-hours-client.tsx" "src/app/dashboard/(routes)/safe-hours/page.tsx"
git commit -m "feat(safe-hours): add the lockout window editor form

Single-document form for weekday + start/end hour, matching PRD's
'manual override' as editing one document rather than a separate
expiring-override concept (no such field exists in the API Contract).

Falls back to seed data while the endpoint 404s, per the pattern
already shipped for Prizes and confirmed as the preferred approach in
this session.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: Backend handoff

**Files:**
- Modify: `docs/BACKEND-ISSUES.md`

**Interfaces:** none — documentation only.

- [ ] **Step 1: Append the Safe Hours section**

Open `docs/BACKEND-ISSUES.md` and find the Prizes section added for the previous feature (search for `## Prizes` or similar — it was appended near the end of the file). Match its heading level, language (Indonesian prose, English field/endpoint names) and structure exactly. Append immediately after it:

```markdown
## Safe Hours (Admin Settings)

Endpoint yang dibutuhkan admin editor Safe Hours (verified 404, 2026-08-08):

### GET /api/v1/admin/safe-hours
Ambil window lockout saat ini. Admin JWT.

### PUT /api/v1/admin/safe-hours
Update window (full-document replace). Admin JWT.

Request/response body:
```json
{
  "weekday": "Fri",
  "start_hour": 16,
  "end_hour": 19
}
```

`weekday` salah satu dari `Mon|Tue|Wed|Thu|Fri|Sat|Sun`. `start_hour`/`end_hour` integer 0-23. Tidak ada field timezone — window selalu `Australia/Sydney`, ditangani di kode FE.

**Yang diminta ke tim backend:**
1. Implement kedua endpoint di atas.
2. Seed dokumen dengan nilai default saat ini: `{ weekday: "Fri", start_hour: 16, end_hour: 19 }` — sama seperti yang FE pakai sebagai fallback.
3. Konfirmasi PUT full-replace dan mengembalikan dokumen yang tersimpan.
4. Konfirmasi route mewajibkan role admin, 401/403 konsisten dengan `/api/v1/admin/*` lainnya.

**Tambahan — belum ada di kontrak sama sekali:** pertimbangkan endpoint publik atau member-authenticated buat *membaca* window saat ini (atau masukkan ke payload session/bootstrap member). Tanpa itu, pengecekan advisory di sisi member (`src/lib/safe-hours.ts` — constant hardcoded) tidak bisa mengikuti window yang diubah admin. Backend tetap jadi otoritas penegakan baik dengan atau tanpa ini (member yang mencoba di luar window versi FE tetap kena 403 dari backend), tapi tombol member bisa disable di jam yang salah sampai constant di kode di-update manual. Ini gap UX-timing, bukan gap keamanan, tapi sebaiknya jadi keputusan sadar bukan kejutan.

FE admin editor sudah dibangun dan langsung berfungsi begitu endpoint di atas hidup.
```

- [ ] **Step 2: Commit**

```bash
git add docs/BACKEND-ISSUES.md
git commit -m "docs(safe-hours): file the backend contract request

Matches the Prizes handoff filed earlier this sprint — same reasoning:
the FE admin editor is built and waiting, only the endpoint is missing.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:** §2 scope (editor only, no log/notify, no member-side rewiring) → enforced by the Global Constraints "out of scope" line and by Task 4's backend ask, which files the gap instead of building around it. §3.1 (one document, no expiry) → Task 3's schema has no expiry field. §3.2 (weekday editable) → Task 3's `WEEKDAYS` select, all seven days. §3.3 (seed fallback) → Task 3 Step 3. §4 (API contract) → Task 1 Steps 2-3, and Task 4's body matches it verbatim. §5 (types/resource) → Task 1. §6 (form, nav, seed banner) → Tasks 2-3. §7 (backend asks, including the public-endpoint gap) → Task 4. §8 (verification) → each task's Step 4/5. §9 (file touch list) → matches the File Structure table. **No gaps.**

**Placeholder scan:** no TBD/TODO. Every code step has complete code, copied or adapted from an existing, already-reviewed source (Prizes' actions/client/page, giveaway-form.tsx's Select pattern). ✔

**Type consistency:** `SafeHoursConfig` defined once in Task 1, used identically in Tasks 1 (resource), 3 (action, client, page). `getAdminSafeHours`/`updateAdminSafeHours` both take `token` first, matching every other admin-gated resource in the codebase (`memberships.ts`, `ebooks.ts`). `saveSafeHoursAction` returns `ActionResult<SafeHoursConfig>`, and the client branches on `result.ok`/`.message`/`.status`/`.code`/`.data` — all present on that union, identical to Prizes' `PrizesClient`. `Weekday` is defined once in Task 1 and consumed as a literal union in Task 3's `WEEKDAYS` array and Zod `z.enum`, with no second, divergent list of day values anywhere. ✔
