# Manage Membership — Upgrade / Downgrade / Cancel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the paid-member "Manage Membership" card so a RED/BLUE member can schedule a tier upgrade/downgrade (applied at next renewal), cancel that scheduled change, and cancel their membership at period end.

**Architecture:** Thin resource functions over `apiFetch` → server actions in `membership/actions.ts` (returning `{ ok, … } | { ok:false, message }`) → one client component `manage-membership-actions.tsx` that owns the optimistic scheduled state and drives two `ConfirmDialog`s. The page (Server Component) passes the current sub-tier + next-renewal date; visitor members keep the existing Stripe-checkout buttons unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui, `sonner` toasts, server actions.

## Global Constraints

- **Style:** 4-space indent, single quotes, semicolons, width 120, trailing comma `none`. Tailwind classes auto-sorted. (Prettier is the authority — run `npm run format` if unsure.)
- **Path alias:** `@/*` → `src/*`.
- **No test runner in this repo.** Verification cycle per task = `npm run type-check` + `npx eslint <touched files>` (+ `npm run build` and live curl on the final task). This replaces the unit-test cycle. Do NOT scaffold jest/vitest.
- **Never render `draw_pass`.** The picker shows the config `tokens` count + price only — `tokens` is member-facing, `draw_pass` is internal-only and is never fetched or shown.
- **Money is integer cents (AUD)** → format with `formatAud` (divides by 100).
- **Envelope:** every call goes through `apiFetch<T>` which unwraps to `data` and throws `ApiError(status, message, payload)`. Business error codes (e.g. `SAFE_HOURS_LOCKED`) live in `error.payload.code` (flat envelope), NOT on the ApiError instance.
- **Dark tokens only** — reuse `bg-slr-navy-card`, `text-slr-muted`, `text-slr-dim`, `goldButtonStyle`. No light mode, no new fonts.
- **Server Components by default**; add `'use client'` only to `manage-membership-actions.tsx`.
- **Backend gaps are handled by guards, not blocked on** (per approved spec): optimistic scheduled state (A2), Safe Hours message (D4), graceful seed-400 (C3). See [docs/BACKEND-ISSUES.md](../../BACKEND-ISSUES.md) and [the design spec](../specs/2026-07-24-manage-membership-upgrade-downgrade-design.md).

---

### Task 1: Data layer — endpoints + resource functions

**Files:**
- Modify: `src/lib/api/endpoints.ts`
- Modify: `src/lib/api/resources/memberships.ts`
- Create: `src/lib/api/resources/subscriptions.ts`

**Interfaces:**
- Consumes: `apiFetch` (`src/lib/api/http.ts`), `API` map, `MemberSubTierId` (already exported from `resources/memberships.ts`).
- Produces:
  - `interface ScheduledTierChange { target_sub_tier: string; effective_at: string }`
  - `scheduleMembershipChange(targetSubTierId: MemberSubTierId, token: string): Promise<ScheduledTierChange>`
  - `cancelScheduledChange(token: string): Promise<null>`
  - `cancelMySubscription(token: string): Promise<unknown>`

- [ ] **Step 1: Add the endpoint paths**

In `src/lib/api/endpoints.ts`, add `upgrade` to the `memberships` namespace and a new top-level `subscriptions` namespace. The `memberships` block becomes:

```ts
    memberships: {
        tiers: '/api/v1/memberships/tiers',
        me: '/api/v1/memberships/me',
        changeTier: '/api/v1/memberships/change-tier',
        stats: '/api/v1/memberships/stats',
        upgrade: '/api/v1/memberships/upgrade'
    },
```

And add this namespace (place it next to `stripe`, keeping the trailing objects valid):

```ts
    subscriptions: { cancel: '/api/v1/subscriptions/me/cancel' },
```

- [ ] **Step 2: Add the membership resource functions**

In `src/lib/api/resources/memberships.ts`, after the existing `changeMemberTier` function, add:

```ts
// ─── Upgrade / downgrade scheduling (Paid → Paid, applied at next renewal) ────

// Live POST /memberships/upgrade response `data`. Handles BOTH directions —
// direction is inferred from the target sub-tier (there is no separate
// /downgrade endpoint). See docs/BACKEND-ISSUES.md D1 for contract drift.
export interface ScheduledTierChange {
    target_sub_tier: string;
    effective_at: string;
}

/** Schedule a paid tier change for the member's next renewal (no proration). */
export const scheduleMembershipChange = (targetSubTierId: MemberSubTierId, token: string) =>
    apiFetch<ScheduledTierChange>(API.memberships.upgrade, { method: 'POST', body: { targetSubTierId }, token });

/** Cancel a scheduled (pending) tier change before it applies. */
export const cancelScheduledChange = (token: string) =>
    apiFetch<null>(API.memberships.upgrade, { method: 'DELETE', token });
```

- [ ] **Step 3: Create the subscriptions resource**

Create `src/lib/api/resources/subscriptions.ts`:

```ts
import { API } from '../endpoints';
import { apiFetch } from '../http';

/**
 * Cancel my subscription at the end of the current period. Access continues
 * until the period end; no further charges. Seed dev accounts carry a fake
 * Stripe sub (`sub_seeded_*`) so this may return 400 there — the caller guards
 * it (docs/BACKEND-ISSUES.md C3).
 */
export const cancelMySubscription = (token: string) =>
    apiFetch<unknown>(API.subscriptions.cancel, { method: 'POST', token });
```

- [ ] **Step 4: Type-check**

Run: `npm run type-check`
Expected: PASS (no errors). If `API.memberships.upgrade` / `API.subscriptions.cancel` are reported missing, re-check Step 1.

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/endpoints.ts src/lib/api/resources/memberships.ts src/lib/api/resources/subscriptions.ts
git commit -m "feat(membership): add upgrade/downgrade + cancel-subscription resource layer"
```

---

### Task 2: Server actions + Safe Hours mapping

**Files:**
- Modify: `src/app/member/membership/actions.ts`

**Interfaces:**
- Consumes: `scheduleMembershipChange`, `cancelScheduledChange`, `ScheduledTierChange`, `MemberSubTierId` (Task 1); `cancelMySubscription` (Task 1); `getAccessToken` (`@/lib/api/server`); `ApiError`, `apiErrorMessage` (`@/lib/api/types`).
- Produces:
  - `scheduleTierChangeAction(targetSubTierId: MemberSubTierId): Promise<{ ok: true; change: ScheduledTierChange } | { ok: false; message: string }>`
  - `cancelScheduledTierChangeAction(): Promise<{ ok: true } | { ok: false; message: string }>`
  - `cancelMembershipAction(): Promise<{ ok: true } | { ok: false; message: string }>`

- [ ] **Step 1: Add imports**

At the top of `src/app/member/membership/actions.ts`, add these imports alongside the existing ones (keep the existing `stripe` + `server` + `types` imports):

```ts
import {
    type MemberSubTierId,
    type ScheduledTierChange,
    cancelScheduledChange,
    scheduleMembershipChange
} from '@/lib/api/resources/memberships';
import { cancelMySubscription } from '@/lib/api/resources/subscriptions';
import { ApiError, apiErrorMessage } from '@/lib/api/types';
```

Note: `ApiError` may already be imported in this file — if so, merge rather than duplicate the import.

- [ ] **Step 2: Add the shared error mapper**

Append to `src/app/member/membership/actions.ts`:

```ts
// Maps an API failure to a user-facing message. Business error codes live in
// the envelope, exposed via ApiError.payload.code (the ApiError instance has no
// `code` field). Safe Hours (Fri 16:00–19:00 AEST) gets a specific message.
function toActionMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        const code = (error.payload as { code?: string } | null | undefined)?.code;
        if (code === 'SAFE_HOURS_LOCKED') {
            return 'Plan changes are paused Fridays 4–7pm AEST. Please try again after 7pm.';
        }

        return apiErrorMessage(error);
    }

    return fallback;
}
```

- [ ] **Step 3: Add the three server actions**

Append to `src/app/member/membership/actions.ts`:

```ts
// Schedule a paid tier upgrade/downgrade for the next renewal. Returns the
// scheduled change so the UI can show it optimistically (memberships/me does
// not yet expose pending_upgrade — docs/BACKEND-ISSUES.md A2).
export async function scheduleTierChangeAction(
    targetSubTierId: MemberSubTierId
): Promise<{ ok: true; change: ScheduledTierChange } | { ok: false; message: string }> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        const change = await scheduleMembershipChange(targetSubTierId, token);

        return { ok: true, change };
    } catch (error) {
        return { ok: false, message: toActionMessage(error, 'Could not schedule the plan change.') };
    }
}

// Cancel a scheduled (pending) tier change before it applies.
export async function cancelScheduledTierChangeAction(): Promise<
    { ok: true } | { ok: false; message: string }
> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        await cancelScheduledChange(token);

        return { ok: true };
    } catch (error) {
        return { ok: false, message: toActionMessage(error, 'Could not cancel the scheduled change.') };
    }
}

// Cancel the membership at period end. On seed accounts the fake Stripe sub may
// 400 — the message is surfaced to the user (docs/BACKEND-ISSUES.md C3).
export async function cancelMembershipAction(): Promise<{ ok: true } | { ok: false; message: string }> {
    const token = await getAccessToken();
    if (!token) return { ok: false, message: 'Not authenticated.' };

    try {
        await cancelMySubscription(token);

        return { ok: true };
    } catch (error) {
        return { ok: false, message: toActionMessage(error, 'Could not cancel your membership.') };
    }
}
```

- [ ] **Step 4: Type-check + lint**

Run: `npm run type-check && npx eslint src/app/member/membership/actions.ts`
Expected: PASS. If `apiErrorMessage`/`ApiError` import errors appear, confirm they exist in `src/lib/api/types.ts` (they do).

- [ ] **Step 5: Commit**

```bash
git add src/app/member/membership/actions.ts
git commit -m "feat(membership): server actions for tier change + cancel with Safe Hours mapping"
```

---

### Task 3: Client component — `manage-membership-actions.tsx`

**Files:**
- Create: `src/app/member/membership/_components/manage-membership-actions.tsx`

**Interfaces:**
- Consumes: `scheduleTierChangeAction`, `cancelScheduledTierChangeAction`, `cancelMembershipAction` (Task 2); `ScheduledTierChange`, `MemberSubTierId` (Task 1); `ConfirmDialog` (`@/components/confirm-dialog`); `RadioGroup`, `RadioGroupItem` (`@/components/ui/radio-group`); `Button` (`@/components/ui/button`); `SUB_TIERS` (`@/constant/tiers`); `SubTierCode` (`@/types/member`); `formatAud`, `formatShortDate`, `formatTierName` (`@/lib/member`); `goldButtonStyle` (`@/lib/styles`); `toast` (`sonner`).
- Produces: `ManageMembershipActions({ currentSubTier: SubTierCode; nextRenewalIso: string | null })` (named export).

**Note (deviation from spec §6, justified):** the picker options are built from the existing static `SUB_TIERS` constant rather than fetching `getMembershipTiers`. API Contract §4 explicitly sanctions hardcoding this static pricing on the FE, the page already imports `SUB_TIERS`, and it avoids an extra request + mapping. `tokens` shown is the member-facing config token count — never `draw_pass`.

- [ ] **Step 1: Create the component**

Create `src/app/member/membership/_components/manage-membership-actions.tsx`:

```tsx
'use client';

import { useMemo, useState, useTransition } from 'react';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SUB_TIERS } from '@/constant/tiers';
import { type MemberSubTierId, type ScheduledTierChange } from '@/lib/api/resources/memberships';
import { formatAud, formatShortDate, formatTierName } from '@/lib/member';
import { goldButtonStyle } from '@/lib/styles';
import type { SubTierCode } from '@/types/member';

import { cancelMembershipAction, cancelScheduledTierChangeAction, scheduleTierChangeAction } from '../actions';
import { toast } from 'sonner';

interface ManageMembershipActionsProps {
    currentSubTier: SubTierCode;
    nextRenewalIso: string | null;
}

interface ChangeOption {
    id: MemberSubTierId;
    label: string;
    priceLabel: string;
    tokens: number;
}

// Paid sub-tiers a member may switch to. Visitor is intentionally excluded —
// stopping payment is "Cancel membership", not a plan change.
const PAID_CODES: SubTierCode[] = ['R1', 'R4', 'R7', 'B1', 'B4', 'B7', 'B10'];

export function ManageMembershipActions({ currentSubTier, nextRenewalIso }: ManageMembershipActionsProps) {
    const [planOpen, setPlanOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [selected, setSelected] = useState<MemberSubTierId | null>(null);
    const [scheduled, setScheduled] = useState<ScheduledTierChange | null>(null);
    const [pending, startTransition] = useTransition();

    const options = useMemo<ChangeOption[]>(
        () =>
            PAID_CODES.filter((code) => code !== currentSubTier).map((code) => {
                const meta = SUB_TIERS[code];

                return {
                    id: code.toLowerCase() as MemberSubTierId,
                    label: formatTierName(code),
                    priceLabel: `${formatAud(meta.price_cents)} / 28 days`,
                    tokens: meta.tokens
                };
            }),
        [currentSubTier]
    );

    const renewalLabel = nextRenewalIso ? formatShortDate(nextRenewalIso) : 'your next renewal';
    const scheduledLabel = scheduled
        ? formatTierName(scheduled.target_sub_tier.toUpperCase() as SubTierCode)
        : '';

    const confirmChange = () => {
        if (!selected) return;
        startTransition(async () => {
            const res = await scheduleTierChangeAction(selected);
            if (res.ok) {
                setScheduled(res.change);
                setPlanOpen(false);
                setSelected(null);
                toast.success('Plan change scheduled for your next renewal.');
            } else {
                toast.error(res.message);
            }
        });
    };

    const cancelScheduled = () => {
        startTransition(async () => {
            const res = await cancelScheduledTierChangeAction();
            if (res.ok) {
                setScheduled(null);
                toast.success('Scheduled plan change cancelled.');
            } else {
                toast.error(res.message);
            }
        });
    };

    const confirmCancelMembership = () => {
        startTransition(async () => {
            const res = await cancelMembershipAction();
            if (res.ok) {
                setCancelOpen(false);
                toast.success('Membership cancellation scheduled.');
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <div className='mt-4 space-y-3'>
            {/* Optimistic scheduled banner — memberships/me has no pending_upgrade yet (BACKEND GAP A2). */}
            {scheduled ? (
                <div className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E2B42B4D] bg-[#E2B42B14] p-4'>
                    <span className='text-sm text-white/90'>
                        Scheduled → {scheduledLabel} on {formatShortDate(scheduled.effective_at)}
                    </span>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={pending}
                        onClick={cancelScheduled}
                        className='border-white/15 bg-white/5 text-xs text-white/90 hover:bg-white/10'>
                        Cancel scheduled change
                    </Button>
                </div>
            ) : null}

            <div className='flex flex-wrap gap-3'>
                <Button
                    className='h-11 rounded-xl font-bold uppercase'
                    style={goldButtonStyle}
                    disabled={pending}
                    onClick={() => setPlanOpen(true)}>
                    Change plan
                </Button>
                <Button
                    variant='outline'
                    className='h-11 rounded-xl border-white/15 bg-white/5 text-white/90 uppercase hover:bg-white/10'
                    disabled={pending}
                    onClick={() => setCancelOpen(true)}>
                    Cancel membership
                </Button>
            </div>

            {/* Change plan */}
            <ConfirmDialog
                open={planOpen}
                onOpenChange={setPlanOpen}
                title='Change plan'
                confirmText={pending ? 'Scheduling…' : 'Confirm change'}
                cancelBtnText='Back'
                isLoading={pending}
                disabled={!selected}
                handleConfirm={confirmChange}
                desc={`Applies at ${renewalLabel} · no proration · cancelable anytime before then.`}>
                <RadioGroup
                    value={selected ?? undefined}
                    onValueChange={(v) => setSelected(v as MemberSubTierId)}
                    className='my-2 gap-2'>
                    {options.map((opt) => (
                        <label
                            key={opt.id}
                            htmlFor={opt.id}
                            className='flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/3 p-3 hover:bg-white/5'>
                            <span className='flex items-center gap-3'>
                                <RadioGroupItem id={opt.id} value={opt.id} />
                                <span className='text-sm text-white/90'>{opt.label}</span>
                            </span>
                            <span className='text-slr-dim text-xs'>
                                {opt.priceLabel} · {opt.tokens} tokens
                            </span>
                        </label>
                    ))}
                </RadioGroup>
            </ConfirmDialog>

            {/* Cancel membership */}
            <ConfirmDialog
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                title='Cancel membership?'
                destructive
                confirmText={pending ? 'Cancelling…' : 'Yes, cancel'}
                cancelBtnText='Keep membership'
                isLoading={pending}
                handleConfirm={confirmCancelMembership}
                desc={`Access continues until ${renewalLabel}. No further charges after that.`}
            />
        </div>
    );
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npm run type-check && npx eslint src/app/member/membership/_components/manage-membership-actions.tsx`
Expected: PASS. Common fixes if it fails:
- If `Button` has no `size='sm'` or `variant='outline'`, open `src/components/ui/button.tsx`, use an available variant/size (e.g. drop `size` and keep `variant='outline'`).
- If `goldButtonStyle` is not exported from `@/lib/styles`, confirm the export name there.

- [ ] **Step 3: Commit**

```bash
git add src/app/member/membership/_components/manage-membership-actions.tsx
git commit -m "feat(membership): manage-membership-actions client component (change/cancel plan)"
```

---

### Task 4: Wire the page + manage-tier card

**Files:**
- Modify: `src/app/member/membership/_components/manage-tier.tsx`
- Modify: `src/app/member/membership/page.tsx`

**Interfaces:**
- Consumes: `ManageMembershipActions` (Task 3); `SUB_TIERS`, `SubTierCode`, `formatAud`, `formatTierName`; the page's already-computed `subTier` (`SubTierCode`) and `billing?.next_renewal_at`.
- Produces: `ManageTier({ isVisitor: boolean; currentSubTier: SubTierCode; nextRenewalIso: string | null })`.

- [ ] **Step 1: Replace `manage-tier.tsx`**

Overwrite `src/app/member/membership/_components/manage-tier.tsx` with:

```tsx
import { SUB_TIERS } from '@/constant/tiers';
import { formatAud, formatTierName } from '@/lib/member';
import type { SubTierCode } from '@/types/member';

import { ManageMembershipActions } from './manage-membership-actions';
import { UpgradeTierButtons } from './upgrade-tier-buttons';

interface ManageTierProps {
    isVisitor: boolean;
    currentSubTier: SubTierCode;
    nextRenewalIso: string | null;
}

// Visitor → Stripe checkout (new subscription). Paid → schedule a tier change or
// cancel, via ManageMembershipActions (POST/DELETE /memberships/upgrade +
// POST /subscriptions/me/cancel).
export function ManageTier({ isVisitor, currentSubTier, nextRenewalIso }: ManageTierProps) {
    const meta = SUB_TIERS[currentSubTier];

    return (
        <section className='bg-slr-navy-card border-slr-navy-border rounded-2xl border p-5 md:p-6'>
            <h2 className='font-bebas-neue text-xl tracking-wide text-white uppercase md:text-2xl'>
                Manage Membership
            </h2>

            {isVisitor ? (
                <div className='mt-4'>
                    <p className='text-slr-muted mb-3 text-sm'>
                        Upgrade to unlock member draws, partner discounts and e-books. You’ll be taken to Stripe’s
                        secure checkout — no charge until you confirm.
                    </p>
                    <UpgradeTierButtons />
                </div>
            ) : (
                <>
                    <p className='text-slr-muted mt-2 text-sm'>
                        Current plan: <span className='text-white/90'>{formatTierName(currentSubTier)}</span> —{' '}
                        {formatAud(meta.price_cents)} / 28 days
                    </p>
                    <ManageMembershipActions currentSubTier={currentSubTier} nextRenewalIso={nextRenewalIso} />
                </>
            )}
        </section>
    );
}
```

- [ ] **Step 2: Pass the new props from the page**

In `src/app/member/membership/page.tsx`, find the existing render:

```tsx
            <ManageTier isVisitor={isVisitor} />
```

Replace it with (both `subTier` and `billing` are already computed above in the file):

```tsx
            <ManageTier
                isVisitor={isVisitor}
                currentSubTier={subTier}
                nextRenewalIso={billing?.next_renewal_at ?? null}
            />
```

- [ ] **Step 3: Type-check + lint + build**

Run: `npm run type-check && npx eslint src/app/member/membership/page.tsx src/app/member/membership/_components/manage-tier.tsx && npm run build`
Expected: type-check + eslint PASS; build completes with no errors on `/member/membership`.

- [ ] **Step 4: Commit**

```bash
git add src/app/member/membership/page.tsx src/app/member/membership/_components/manage-tier.tsx
git commit -m "feat(membership): wire Manage Membership card to real change/cancel controls"
```

---

### Task 5: End-to-end verification + graph update

**Files:** none (verification only).

- [ ] **Step 1: Full static verification**

Run: `npm run type-check && npx eslint src/app/member/membership src/lib/api/resources/subscriptions.ts src/lib/api/resources/memberships.ts src/lib/api/endpoints.ts && npm run build`
Expected: all PASS.

- [ ] **Step 2: Live round-trip against the real endpoints (already proven manually 2026-07-24, re-confirm)**

```bash
BASE="https://api.smartliferewards.com.au/api/v1"
TOK=$(curl -s "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"red@smartliferewards.com.au","password":"ChangeMeImmediately!1"}' | jq -r '.data.access_token')
# schedule r4 -> r7
curl -s "$BASE/memberships/upgrade" -X POST -H "Authorization: Bearer $TOK" \
  -H 'Content-Type: application/json' -d '{"targetSubTierId":"r7"}' | jq '.data'
# expect: { "target_sub_tier": "r7", "effective_at": "..." }
# restore
curl -s "$BASE/memberships/upgrade" -X DELETE -H "Authorization: Bearer $TOK" | jq '.message'
# expect: "Pending upgrade cancelled."
```

Expected: schedule returns `{ target_sub_tier: "r7", effective_at }`; delete returns `"Pending upgrade cancelled."`. Leaves `red@` restored.

- [ ] **Step 3: Manual visual check**

Run `npm run dev`, sign in as `red@smartliferewards.com.au` (password `ChangeMeImmediately!1`), open `/member/membership`. Confirm:
- "Current plan: SLR Red · Plus — $20 / 28 days" line renders.
- "Change plan" opens the picker (RED + BLUE options, each `price · N tokens`, **no draw_pass**), "Confirm change" shows the scheduled banner + "Cancel scheduled change".
- "Cancel membership" opens the destructive confirm ("Access continues until …"). On a seed account expect a graceful error toast (C3), not a crash.
- Sign in as `visitor@…` → the card still shows the Stripe upgrade buttons.

- [ ] **Step 4: Update the knowledge graph**

Run: `graphify update .`
Expected: "Code graph updated."

- [ ] **Step 5: Final commit (if graph outputs changed)**

```bash
git add -A
git commit -m "chore(membership): refresh graphify graph after manage-membership work" || echo "nothing to commit"
```

---

## Self-Review

**Spec coverage:** schedule change (Tasks 1–4), cancel scheduled change (Tasks 1–4), cancel membership (Tasks 1–4), Safe Hours mapping (Task 2), optimistic scheduled state / A2 guard (Task 3), seed-400 guard (Task 2 surfaces message, Task 5 visual confirms), draw_pass never rendered (Task 3 shows `tokens` only). Visitor path preserved (Task 4). Out-of-scope items (grace-pay, invoice link, paid-register) intentionally excluded. ✔

**Type consistency:** `ScheduledTierChange { target_sub_tier, effective_at }` defined once (Task 1) and consumed identically (Tasks 2–3). Actions return `{ ok:true; change }` / `{ ok:true }` / `{ ok:false; message }` — matched by the component's `res.ok` / `res.change` / `res.message` usage. `MemberSubTierId` lowercase used for the API; `SubTierCode` uppercase used for constants/labels; the `code.toLowerCase()` / `.toUpperCase()` conversions are explicit at each boundary. ✔

**Placeholder scan:** no TBD/TODO; every code step shows full code; verification uses real commands (type-check/eslint/build/curl) appropriate to a repo with no unit-test runner. ✔
