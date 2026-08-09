# Admin Spin Wheel Panel (Design)

- **Date:** 2026-08-08
- **Sprint:** 4 (Ronde 4) — item "Spin wheel (undian diskon saat registrasi & sebelum perpanjangan)", admin side
- **Status:** Approved (design), pending implementation plan
- **Area:** `src/app/dashboard/(routes)/spin/` (new)

---

## 1. Context & Goal

The spin wheel — a one-time billing-discount draw offered at registration and 24h before renewal — is fully built and live on the member side (`src/app/(auth)/(routes)/sign-up/components/step-spin-wheel.tsx`, `src/app/member/spin-actions.ts`, `src/lib/api/resources/spin.ts`). Nothing exists on the admin side.

PRD §5.7 "Spin Wheel Management" scopes the **first release** deliberately narrow:

> *"First release: View spin history (registration + renewal), filter by tier and moment. Enable/disable the spin wheel globally or per tier. Monitor the 24h-before-renewal email notifications (sent/failed). Deferred (not in the first release): Configuring the discount amount per sub-tier + probability... Decision (PO): Spin discounts & odds are static/seeded for the first release. The admin spin panel focuses on on/off + history + monitoring. Keep scope minimal per the timeline."*

This slice builds the parts of that scope an endpoint exists (or can reasonably be requested) for: history viewing and the enable/disable toggle. **Per explicit direction from the user, this is built ahead of the backend** — the API is still 404 across the board (verified live 2026-08-08) — with a clear seed/placeholder posture and a filed contract request, matching the pattern already shipped for the Prizes and Safe Hours admin panels.

---

## 2. Scope

**In scope:**
- `/dashboard/spin` — one page, two independent sections: a config card (global + per-sub-tier toggles) and a history table (filterable, read-only).
- Proposed API contract for both sections (§4).

**Out of scope — and why:**
- **Discount amount / probability editing.** Not a missing-endpoint gap like the rest of this sprint's items — PRD's PO decision explicitly defers this past the first release. No form field for it, ever, in this slice.
- **24h-before-renewal email notification monitoring** (PRD's third bullet). No endpoint exists for it anywhere in the API Contract — not under Spin Wheel, not under Notifications. Filed as a backend ask (§7), not guessed at.
- **Any write to history** (no edit/delete of spin records — PRD only asks for viewing).

---

## 3. Decisions

### 3.1 Toggle granularity: five sub-tiers, not two tier groups

PRD says "globally or per tier." The codebase already encodes which tiers spin applies to: `SPIN_ELIGIBLE_SUB_TIERS` in `src/constant/tiers.ts` — `R4, R7, B4, B7, B10` (Visitor/R1/B1 are permanently ineligible; `/spin/status` 403s for them). "Per tier" toggles at this granularity, not at the RED/BLUE group level, because it lets admin disable one problematic sub-tier (e.g. R7 alone) without taking down its whole tier group. The global toggle is a master switch: when off, spin is unavailable regardless of the five sub-tier values.

### 3.2 History columns are inferred from existing types, not invented

The API Contract gives only one line for `GET /admin/spin/history`: *"Riwayat spin (filter tier, moment)."* No field names. Rather than invent an arbitrary shape, the columns are pinned to what the codebase already models a spin result as — `src/lib/api/resources/spin.ts`'s `SpinResult { result: 'win' | 'lose'; discount_cents: number }` — plus the contextual fields PRD itself names (tier, moment) and what a history *row* necessarily needs beyond a status check (who, when):

```ts
interface SpinHistoryRow {
    id: string;
    member_name: string;
    tier: SubTierCode;
    moment: 'registration' | 'renewal';
    result: 'win' | 'lose';
    discount_cents: number;
    spun_at: string; // ISO 8601
}
```

This is the same reasoning already applied for Prizes' and Safe Hours' seed data: derive from what's already confirmed, not from a blank guess. If the real response disagrees, the mapping layer in the resource function is the only place that needs to change.

### 3.3 A `GET` for spin config is proposed, not assumed

The API Contract lists only `PUT /api/v1/admin/spin/config` — no `GET`. Without a read, the admin page has no way to display the currently active toggle state before a save. Every other admin document in this sprint (Prizes, Safe Hours) has a symmetric GET/PUT pair; this is very likely an omission in the contract doc rather than a deliberate write-only design, but it is **not assumed silently** — it's listed as an explicit ask in §7, the same way Safe Hours' missing public-read endpoint was.

### 3.4 One page, two sections, independent failure

PRD and the API Contract both group history and config under one "Spin Wheel" heading. The two surfaces hit different endpoints and can fail independently (e.g. `GET /admin/spin/config` could 404 while `GET /admin/spin/history` succeeds, or vice versa) — each section's fetch, seed-fallback and error state is handled on its own, not gated on the other.

### 3.5 Fallback: seed data, not an error card

Same posture as Prizes and Safe Hours, per the explicit preference already established with the user this sprint: the config card renders against a seed document (`enabled: true`, all five sub-tiers `true`) with a muted placeholder banner rather than a `ListErrorCard`, and the save action fails loudly via toast. The history table, when the endpoint fails, shows its normal empty-state ("No spins yet") rather than an error — there is no meaningful "seed" for a list of past events, so degrading to empty is the honest representation, not a fabricated placeholder row.

---

## 4. Proposed API contract

```
GET  /api/v1/admin/spin/history?tier={SubTierCode}&moment={registration|renewal}   → SpinHistoryRow[]   admin JWT
GET  /api/v1/admin/spin/config                                                     → SpinConfig          admin JWT   ← proposed, not in the contract doc
PUT  /api/v1/admin/spin/config                                                     → SpinConfig          admin JWT
```

```json
// SpinHistoryRow
{
  "id": "spin_123",
  "member_name": "Jane Doe",
  "tier": "R4",
  "moment": "registration",
  "result": "win",
  "discount_cents": 1000,
  "spun_at": "2026-08-05T09:14:00Z"
}
```

```json
// SpinConfig
{
  "enabled": true,
  "sub_tier_enabled": { "R4": true, "R7": true, "B4": true, "B7": true, "B10": true }
}
```

Both query params on `GET .../history` are optional; omitted means unfiltered. Client-side pagination on the returned array, matching the existing precedent in `src/app/dashboard/(routes)/winners/winners-client.tsx` (*"the endpoint ignores `?search=`, so the page loads every row and `DataTable` searches/paginates client-side"*) — the same is assumed here until proven otherwise.

---

## 5. Data layer

### `src/types/member.ts` — new types, near the other admin-panel types

```ts
export interface SpinHistoryRow {
    id: string;
    member_name: string;
    tier: SubTierCode;
    moment: 'registration' | 'renewal';
    result: 'win' | 'lose';
    discount_cents: number;
    spun_at: string;
}

export type SpinEligibleSubTier = 'R4' | 'R7' | 'B4' | 'B7' | 'B10';

export interface SpinConfig {
    enabled: boolean;
    sub_tier_enabled: Record<SpinEligibleSubTier, boolean>;
}
```

### `src/lib/api/endpoints.ts` — add to the existing `admin` namespace

```ts
spinHistory: '/api/v1/admin/spin/history',
spinConfig: '/api/v1/admin/spin/config',
```

### `src/lib/api/resources/spin-admin.ts` — new (kept separate from the member-facing `spin.ts`)

```ts
export function getAdminSpinHistory(token: string, filters?: { tier?: SpinEligibleSubTier; moment?: 'registration' | 'renewal' }): Promise<SpinHistoryRow[]>;
export function getAdminSpinConfig(token: string): Promise<SpinConfig>;
export function updateAdminSpinConfig(token: string, payload: SpinConfig): Promise<SpinConfig>;
```

A new file rather than adding to `spin.ts`: the existing file is member-facing (`getSpinStatus`, `executeSpin`) and admin-gated functions belong alongside the codebase's other `admin.*` / `*-admin.ts` resources, not mixed into a member resource module.

---

## 6. Admin page — `/dashboard/spin`

`page.tsx` (server) fetches both `getAdminSpinConfig` and `getAdminSpinHistory` independently — a `Promise.allSettled`, not `Promise.all`, so one failing does not blank the other — and renders:

1. **Config card** — reuses the seed-fallback pattern from `(routes)/safe-hours/page.tsx`: on fetch failure, render the form against a seed `SpinConfig` (`enabled: true`, all five sub-tiers `true`) with the placeholder banner. The form itself: one master `Switch` for `enabled`, five labelled `Switch` rows for the sub-tiers (labelled with `SUB_TIERS[code].marketingName` alongside the code, e.g. "R4 · Plus", reusing the existing `src/constant/tiers.ts` metadata rather than hardcoding labels again). Saves via a server action mirroring `(routes)/safe-hours/actions.ts`'s `ActionResult` shape.
2. **History section** — `DataTable` (existing component, same as Winners/Ebooks) with columns Member, Tier, Moment, Result, Discount, Date. Two filter dropdowns (tier: the five eligible sub-tiers; moment: registration/renewal) drive a `router.push` with query params, mirroring the pattern in `(routes)/winners/page.tsx` (`searchParams: Promise<{ giveaway?: string }>`). On fetch failure, the table renders its existing empty state, not an error card.

**Navigation:** add `{ title: 'Spin Wheel', href: '/dashboard/spin', icon: Dices }` to `ITEMS` in `src/components/ui/nav-main.tsx`, after Safe Hours. `Dices` is unused elsewhere in the nav and reads clearly for a chance-based feature.

---

## 7. Backend asks — append to `docs/BACKEND-ISSUES.md`, under the Sprint 4 heading

1. Implement `GET /api/v1/admin/spin/history` and `GET`+`PUT /api/v1/admin/spin/config` per §4.
2. **Confirm a `GET /admin/spin/config` endpoint will exist** — the API Contract currently lists only `PUT`, which leaves the admin page with no way to load the current toggle state before editing.
3. Confirm `SpinHistoryRow`'s field names against §4's proposal, or supply the real shape — this slice's shape is inferred from existing FE types, not confirmed by contract.
4. Confirm whether `GET .../history` is paginated server-side or returns the full set (FE currently assumes the latter, client-side paginating, matching the Winners/Ebooks precedent).
5. Seed `SpinConfig` with `{ enabled: true, sub_tier_enabled: { R4: true, R7: true, B4: true, B7: true, B10: true } }` so the first `GET` returns something renderable.
6. **Separately:** PRD §5.7 asks for monitoring of the 24h-before-renewal email notification (sent/failed). No endpoint exists for this anywhere in the contract, under Spin Wheel or Notifications. Flagged for scoping, not built against a guess.

---

## 8. Verification

**Static:**
```bash
npm run type-check
npx eslint "src/app/dashboard/(routes)/spin/**/*.{ts,tsx}" src/lib/api/resources/spin-admin.ts src/lib/api/endpoints.ts src/components/ui/nav-main.tsx src/types/member.ts
npm run build
```

**Manual (endpoint 404, current state):** `/dashboard/spin` renders the config card against seed data with the placeholder banner; the history table renders its normal empty state; the two filter dropdowns are present and change the URL query params even though the underlying fetch fails; Save on the config card fails with an error toast (expected); the nav item highlights on the route.

**After the backend lands (future, not this slice):** re-verify against the real payload shape, adjust the mapping in `spin-admin.ts` if field names differ, and confirm the seed banner disappears.

**After merging:** run `graphify update .`.

---

## 9. File touch list

**New**
- `src/lib/api/resources/spin-admin.ts`
- `src/app/dashboard/(routes)/spin/{page.tsx,spin-config-client.tsx,spin-history-client.tsx,actions.ts,seed.ts,loading.tsx}`

**Modified**
- `src/types/member.ts` — add `SpinHistoryRow`, `SpinEligibleSubTier`, `SpinConfig`
- `src/lib/api/endpoints.ts` — add `admin.spinHistory`, `admin.spinConfig`
- `src/components/ui/nav-main.tsx` — add nav item
- `docs/BACKEND-ISSUES.md` — append backend asks (§7)
