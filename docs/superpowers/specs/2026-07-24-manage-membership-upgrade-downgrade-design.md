# Manage Membership — Upgrade / Downgrade / Cancel (Design)

- **Date:** 2026-07-24
- **Sprint:** 3 (Ronde 3) — item "Upgrade / downgrade tier"
- **Status:** Approved (design), pending implementation plan
- **Area:** `src/app/member/membership/` (member-facing account area)

---

## 1. Context & Goal

The member Membership page (`/member/membership`) currently shows two **"Coming soon"** placeholders in the *Manage Membership* card for paid (RED/BLUE) members: **Change plan (upgrade/downgrade)** and **Cancel membership**. This slice wires them to the real backend endpoints so a paid member can:

1. **Schedule a plan change** (upgrade or downgrade to another paid sub-tier), applied at the next renewal with no proration, cancelable before it applies.
2. **Cancel** their scheduled plan change.
3. **Cancel their membership** at period end.

Visitor members are unaffected — they keep the existing `UpgradeTierButtons` → Stripe Checkout flow.

Per PRD v3.2 / API Contract §4: Paid→Paid changes are **scheduled** (`pending_upgrade`), applied at the next renewal by the Stripe `invoice.payment_succeeded` webhook. The FE only initiates the schedule and reflects status.

---

## 2. Scope

**In scope (this slice):**
- Change-plan action (`POST /memberships/upgrade`) + cancel-scheduled (`DELETE /memberships/upgrade`).
- Cancel-membership action (`POST /subscriptions/me/cancel`).
- Safe Hours (`SAFE_HOURS_LOCKED`) error handling.
- Optimistic display of the scheduled change (see §6 — A2 gap).

**Out of scope (separate slices):**
- Grace-period "Pay now" (`POST /billing/pay-manual`) — item 8.
- Invoice download link (`hosted_invoice_url`) — backend-gated (BACKEND-ISSUES A3).
- Paid-registration checkout — backend-blocked (BACKEND-ISSUES A1).
- Any admin billing UI — not needed (client manages billing via Stripe dashboard; BACKEND-ISSUES B2).

---

## 3. Endpoints (live-verified 2026-07-24)

### `POST /api/v1/memberships/upgrade` — schedule a plan change
Request body (camelCase, live-authoritative):
```json
{ "targetSubTierId": "r7" }
```
Response:
```json
{ "success": true, "message": "Upgrade scheduled for next renewal",
  "data": { "target_sub_tier": "r7", "effective_at": "2026-07-30T05:20:22.145Z" },
  "meta": { "status": "scheduled" } }
```
Handles both upgrade and downgrade — direction is inferred from the target sub-tier (single endpoint; there is no separate `/downgrade`). See BACKEND-ISSUES D1 for the contract-vs-live drift.

### `DELETE /api/v1/memberships/upgrade` — cancel the scheduled change
No body. Response:
```json
{ "success": true, "message": "Pending upgrade cancelled.", "data": null }
```

### `POST /api/v1/subscriptions/me/cancel` — cancel membership at period end
No body. Returns `200`. Not live-verifiable on seed accounts (fake Stripe subs → likely `400`; BACKEND-ISSUES C3). Built with a guard.

### Read sources (already fetched by the page)
- `getMembershipTiers()` — `GET /memberships/tiers` → target sub-tier options (marketing_name, price_cents, token). **Never render `draw_pass`.**
- `getBillingStatus()` — `next_renewal_at` → the "effective / active until" date shown in confirm copy.

---

## 4. Data layer changes

**`src/lib/api/endpoints.ts`**
```ts
memberships: { …, upgrade: '/api/v1/memberships/upgrade' },
subscriptions: { cancel: '/api/v1/subscriptions/me/cancel' },
```

**`src/lib/api/resources/memberships.ts`** — add:
```ts
export interface ScheduledTierChange { target_sub_tier: string; effective_at: string; }

export const scheduleMembershipChange = (targetSubTierId: MemberSubTierId, token: string) =>
    apiFetch<ScheduledTierChange>(API.memberships.upgrade, {
        method: 'POST', body: { targetSubTierId }, token
    });

export const cancelScheduledChange = (token: string) =>
    apiFetch<null>(API.memberships.upgrade, { method: 'DELETE', token });
```

**`src/lib/api/resources/subscriptions.ts`** (new):
```ts
export const cancelMySubscription = (token: string) =>
    apiFetch<unknown>(API.subscriptions.cancel, { method: 'POST', token });
```

---

## 5. Server actions (`src/app/member/membership/actions.ts`)

Add three actions, each returning a discriminated `{ ok: true, … } | { ok: false, message }` result (matching the existing `openBillingPortal` / `startTierCheckout` pattern in this file), and each mapping `SAFE_HOURS_LOCKED` to a friendly message via a shared helper.

```ts
scheduleTierChangeAction(targetSubTierId) → { ok: true, change: ScheduledTierChange } | { ok: false, message }
cancelScheduledTierChangeAction()          → { ok: true } | { ok: false, message }
cancelMembershipAction()                   → { ok: true } | { ok: false, message }
```

Shared error mapper:
```ts
// ApiError.code === 'SAFE_HOURS_LOCKED' →
'Plan changes are paused Fridays 4–7pm AEST. Please try again after 7pm.'
// else → error.message (ApiError) or a generic fallback
```

---

## 6. Components & UI

**Approach:** inline card controls; plan picker in a small `Dialog`; cancel via the existing `ConfirmDialog`.

**`page.tsx`** (server) — fetch `getMembershipTiers()` (already partially wired via `SUB_TIERS`; prefer live) and pass to `ManageTier`:
- `currentSubTier` (code), `tierOptions` (paid sub-tiers ≠ current, visitor excluded), `nextRenewal` (`billing.next_renewal_at`).

**`_components/manage-tier.tsx`** (stays a server component) — for paid members, render the heading, the current-plan line (`SLR Red · Plus — $20 / 28 days`), and delegate all interactivity to one client component:
```tsx
{isVisitor ? <UpgradeTierButtons /> :
    <ManageMembershipActions currentSubTier={…} tierOptions={…} nextRenewal={…} />}
```

**`_components/manage-membership-actions.tsx`** (new, **client**) — single owner of the optimistic scheduled state; renders three things:
1. **Change plan** — `[ Change plan ]` opens a `Dialog` with a radio list of `tierOptions`, grouped RED / BLUE, each showing marketing name + price + tokens (**no draw_pass**). Info line: `Applies at your next renewal (30 Jul 2026) · no proration · cancelable anytime before then`. `[ Confirm change ]` → `scheduleTierChangeAction` → on success: set optimistic `scheduled` state, toast, close.
2. **Scheduled banner** — when `scheduled` is set: `Scheduled → SLR Red Premium on 30 Jul 2026` + `[ Cancel scheduled change ]` (→ `cancelScheduledTierChangeAction`, clears the optimistic state on success).
3. **Cancel membership** — `[ Cancel membership ]` opens the existing `ConfirmDialog`: `Access continues until 30 Jul 2026. No further charges.` → `cancelMembershipAction`.

Keeping all three in one client component avoids splitting the shared `scheduled` state across files. The radio picker MAY be extracted into a local sub-component if `manage-membership-actions.tsx` grows too large.

**Reuse:** shadcn `Dialog`, existing `ConfirmDialog`, `Button` + `goldButtonStyle`, `formatAud` / `formatShortDate` from `@/lib/member`, tier gradients from the existing `UpgradeTierButtons`.

---

## 7. Guards & backend gaps (build-now + file-asks)

| Guard | Behavior | Ref |
|---|---|---|
| **No persistent `pending_upgrade`** | Scheduled state is **optimistic client state** (survives until reload). Toast confirms. Swap to real source when backend exposes `pending_upgrade` on `memberships/me`. Mark `// BACKEND GAP A2`. | BACKEND-ISSUES A2 |
| **Safe Hours** | Catch `403 SAFE_HOURS_LOCKED` → friendly message. | BACKEND-ISSUES D4 |
| **Seed 400** | Cancel/portal `400` on seed accounts → surface `error.message`, never crash. Resume via "Manage Billing" (portal). | BACKEND-ISSUES C3 |
| **draw_pass** | Never rendered in the picker — tokens + price only. | PRD / CLAUDE.md |

---

## 8. Verification

- `npm run type-check` + `npx eslint` on touched files.
- Live round-trip on `red@`: `scheduleTierChangeAction('r7')` → assert `{ target_sub_tier:'r7', effective_at }`, then `cancelScheduledTierChangeAction()` → assert cancelled, restore. (Already proven manually 2026-07-24.)
- Cancel-membership: not verifiable on seed (C3) — assert the guard renders the backend error gracefully; re-verify once a real Stripe test sub exists.
- Visual: paid member sees real controls; visitor still sees `UpgradeTierButtons`.

---

## 9. File touch list

- `src/lib/api/endpoints.ts` — add `memberships.upgrade`, `subscriptions.*`.
- `src/lib/api/resources/memberships.ts` — `scheduleMembershipChange`, `cancelScheduledChange`, `ScheduledTierChange`.
- `src/lib/api/resources/subscriptions.ts` — new, `cancelMySubscription`.
- `src/app/member/membership/actions.ts` — 3 actions + Safe Hours mapper.
- `src/app/member/membership/page.tsx` — fetch tiers, pass props to `ManageTier`.
- `src/app/member/membership/_components/manage-tier.tsx` — current-plan line + delegate to client component.
- `src/app/member/membership/_components/manage-membership-actions.tsx` — new, client (change plan + scheduled banner + cancel).
