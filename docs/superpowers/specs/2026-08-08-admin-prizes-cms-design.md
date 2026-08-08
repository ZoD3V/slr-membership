# Admin Prizes CMS — Stage Prize Pool (Design)

- **Date:** 2026-08-08
- **Sprint:** 4 (Ronde 4) — item "Admin dashboard modules & content management (halaman Prizes)"
- **Status:** Approved (design), pending implementation plan
- **Area:** `src/app/dashboard/(routes)/prizes/` (new), `src/app/member/prizes/`, `src/app/(home)/(routes)/prizes/`

---

## 1. Context & Goal

The Prizes page is one of only two CMS-managed areas in the platform (PRD §"Implementation Note: Static vs CMS" — the other is E-book content). Its figures change every time the paid-membership count crosses a stage threshold, so hardcoding them would force a re-deploy per stage.

Today nothing is CMS-driven:

- `/member/prizes` reads a hardcoded mock constant in `src/data/prizes.ts`.
- `/prizes` (public marketing) has its copy inlined across three components.
- There is no admin editor, and no backend route.

**Verified live 2026-08-08:** `GET /api/v1/prizes`, `/public/prizes`, `/prize-pool`, `/admin/prizes`, `/admin/prize-pool` all return **404**. Control probes on the same host return 401 (`/ebooks/`, `/notifications/`, `/admin/members`) and 200 (`/public/discounts/`, `/memberships/tiers`), so the 404s mean the routes genuinely do not exist — not an auth artefact.

This slice builds the admin editor and the derivation logic, and proposes the API contract for the backend to implement.

---

## 2. Scope

**In scope:**
- Admin editor at `/dashboard/prizes` — a single-document form (no list, no create/delete).
- Stage derivation module — active stage, next threshold, progress, stage label.
- Rewiring `/member/prizes` to the API, with a member-friendly error state.
- Rewiring the prize-pool figure on the public `/prizes` page.
- Proposed API contract for backend (§4).

**Out of scope:**
- Backend implementation — this spec proposes the contract; the Express service owns it.
- The public page's RED/BLUE tier reward cards and `stats[]` band — deliberately left static, see §3.2.
- Icon/image uploads — PRD §"Stage Prize Pool System": *"All fields on this page are plain text/number inputs (not a rich editor, not uploads)."*
- Admin Notifications CRUD and Safe Hours settings — separate Sprint 4 sub-projects, each getting its own spec.

---

## 3. Decisions

### 3.1 The prize pool is one document, and three of its fields are derived

PRD §"Stage Prize Pool System" specifies *"minimal CMS (one editable page)"*, and PRD §3.2 lists the admin section as **Prizes / Stage** — *"edit prize pool headline text, number of prizes, RED/BLUE prize details, total members, odds."*

Crucially, PRD adds under "Stage derivation rules": ***"current_stage is derived from paid_members — do NOT hardcode. The active stage is the highest stage whose threshold has been reached."***

So the stored document shrinks — `current_stage`, `stage_label` and `stages[]` come out and become computed:

| Field | Source |
|---|---|
| `headline`, `prizes_sublabel`, `odds_label`, `tiers[]` | admin-edited |
| `current_members` | admin-edited (PRD §3.2 "total members") |
| `current_stage` | **derived** from `current_members` |
| `stage_label` | **derived** — PRD: *"'For X Members' = the active stage's threshold, NOT the real paid_members count"* |
| stage ladder (100…2000) | **code constant** — PRD calls it *"internal reference"* |

Deriving rather than storing removes the failure mode where an admin types a stage that contradicts the member count.

### 3.2 Reward breakdown stays flat, and the public tier cards stay hardcoded

PRD §"Stage Prize Pool System" gives the breakdown as a flat table (Weekly / Monthly text per tier), matching the existing `PrizeTierBreakdown` type exactly. PRD's stated principle is *"minimise CMS for development efficiency."*

A structured per-reward shape was considered, because the public page renders each reward as a separate icon card (`visitor-red-blue-section.tsx`) and a flat string cannot be split back into cards. That option was **rejected in favour of PRD compliance**. The consequence is accepted knowingly:

> When the stage advances, the public page's RED/BLUE tier cards keep showing the previous stage's figures until someone edits the code and re-deploys, while `/member/prizes` updates immediately.

Keeping those two surfaces consistent is an **operational responsibility**, not a system guarantee. If that proves painful in practice, revisit with a structured `rewards[]` shape — but that needs client sign-off as a PRD deviation.

### 3.3 Failure behaviour differs per surface

| Surface | On fetch failure | Why |
|---|---|---|
| `/member/prizes` | `EmptyState` card, page header retained | Members expect data; silently serving stale prize figures is a compliance risk — these are TPAL-regulated promotional claims |
| `/prizes` (public) | Prize-pool block is **omitted**; rest of page renders | An error card shown to prospects costs conversions, and the tier/CTA content below is still valid marketing |
| `/dashboard/prizes` | `ListErrorCard` | Matches every other dashboard client; dumps status/code/requestId for a backend bug report |

Note `ListErrorCard` is deliberately **not** used on member/public surfaces — it exposes `requestId` and raw status, which is debug output, not member UX.

---

## 4. Proposed API contract

```
GET /api/v1/public/prizes     → PrizePool     no auth
PUT /api/v1/admin/prizes      → PrizePool     admin JWT, full-document replace
```

`GET` is public because the unauthenticated `/prizes` marketing page consumes it. This follows the existing `/api/v1/public/discounts/` precedent. Both pages read the same endpoint — there is no separate admin read.

Response body (snake_case, unwrapped from the standard `{ success, message, data, meta }` envelope by `apiFetch`):

```json
{
  "headline": "$2,100",
  "prizes_sublabel": "@ 22 Prizes • One Month",
  "current_members": 142,
  "odds_label": "9 in 10 wins yearly",
  "tiers": [
    { "tier_group": "visitor", "tier_label": "Visitor",  "price_label": "Free to join",    "weekly": "$25 Coles Digital Credit",    "monthly": null },
    { "tier_group": "red",     "tier_label": "SLR RED",  "price_label": "from $10/month",  "weekly": "$25 Coles Credits + $50 Cash",  "monthly": "$300 Bonus Monthly Credit" },
    { "tier_group": "blue",    "tier_label": "SLR BLUE", "price_label": "from $26/month",  "weekly": "$25 Coles Credits + $150 Cash", "monthly": "$700 Bonus Monthly Credit" }
  ]
}
```

`PUT` takes the same body and returns the saved document. No `current_stage`, `stage_label` or `stages` on the wire — all derived client-side.

**Ask for the backend team:** seed the document with the Stage 1 values above (they are PRD's own example data), so the first `GET` after deploy returns something renderable.

---

## 5. Data layer

### `src/types/member.ts` — trim `PrizePool`

```ts
export interface PrizePool {
    headline: string;
    prizes_sublabel: string;
    current_members: number;
    odds_label: string;
    tiers: PrizeTierBreakdown[];
}
```

`PrizeTierBreakdown` is **unchanged**. `PrizeStage` moves to `src/lib/prizes.ts` as a derived shape.

### `src/lib/prizes.ts` — new, pure functions

The stage ladder and every derivation rule from PRD live here, with no I/O:

```ts
export const PRIZE_STAGES = [100, 200, 300, 400, 500, 1000, 2000] as const;  // Stage 1..7

export interface ActiveStage { stage: number; threshold: number; }

/** Highest stage whose threshold is reached. Below 100 → Stage 1 (pre-launch). */
export function activeStage(paidMembers: number): ActiveStage;

/**
 * The threshold the progress bar counts toward, or null at Stage 7.
 * Below 100 this is Stage 1's own threshold (100) — pre-launch counts *toward*
 * Stage 1. At or above 100 it is the next stage up.
 */
export function nextThreshold(paidMembers: number): number | null;

/** 'For 100 Members • Stage 1' — built from the stage threshold, never from paidMembers. */
export function stageLabel(active: ActiveStage): string;

/** { pct, remaining }. pct = paidMembers / nextThreshold; 100 and remaining 0 at Stage 7. */
export function stageProgress(paidMembers: number): { pct: number; remaining: number };
```

Ranges per PRD: Stage 1 = 100–199, 2 = 200–299, 3 = 300–399, 4 = 400–499, 5 = 500–999, 6 = 1,000–1,999, 7 = 2,000+. Edge case per PRD: *"if paid_members < 100 (Stage 1 not yet reached), show Stage 1 as the target (pre-launch state)."*

**Existing bug this corrects.** `stage-tracker.tsx:10` computes progress as `(current − base) / (target − base)`. PRD §"Stage derivation rules" specifies `paid_members / next_threshold`. At 142 members the current code renders 42%; PRD's formula gives 71%. PRD's worked example (*"142 paid → Stage 1 active, next threshold 200 → '58 more until Stage 2'"*) confirms the intended reading. The tracker is corrected to match.

### `src/lib/api/resources/prizes.ts` — new

```ts
export const getPrizePool = cache((token?: string) => apiFetch<PrizePool>(API.prizes.public, { token }));
export function updatePrizePool(token: string, payload: PrizePool): Promise<PrizePool>;
```

`src/data/prizes.ts` is deleted **in Phase 2** (§8), once consumers no longer read it. Its mock constant survives only as the §4 example and the backend seed request — no stale local copy is kept, because per §3.3 a failed fetch must surface rather than silently fall back. During Phase 1 the old `data/prizes.ts#getPrizePool` and the new `resources/prizes.ts#getPrizePool` coexist in separate modules with no shared importer.

### `src/lib/api/endpoints.ts` — add namespace

```ts
prizes: {
    public: '/api/v1/public/prizes',
    update: '/api/v1/admin/prizes'
}
```

---

## 6. Admin editor — `/dashboard/prizes`

Follows the established dashboard shape (`page.tsx` server fetch → `*-client.tsx` form → `actions.ts`), but with **no list and no route params** — it edits one document.

| File | Role |
|---|---|
| `page.tsx` | Server. `getAccessToken()` (auth gate + token for the save action) → `getPrizePool()`, `handleApiAuthError` + `toListError`, renders `DashboardPageShell` + `Heading`. The read itself hits the public endpoint and needs no token; the token is fetched because the page is admin-gated and the action requires it |
| `prizes-client.tsx` | `'use client'`. React Hook Form + Zod, `useFieldArray` for the three tier rows, submits to the action, `toast` on result |
| `actions.ts` | `'use server'`. `savePrizePoolAction(payload)` returning the existing `ActionResult<T>` / `toActionError` shape copied from `(routes)/ebooks/actions.ts`, plus `revalidatePath` for `/member/prizes` and `/prizes` |
| `loading.tsx` | Skeleton, matching `(routes)/ebooks/loading.tsx` |

**Form layout** — two cards:

1. **Prize pool** — `headline`, `prizes_sublabel`, `odds_label`, `current_members` (number). Directly beneath `current_members`, a **read-only derived line** recomputed as the admin types: *"Stage 1 · label will read 'For 100 Members • Stage 1' · 58 more members until Stage 2."* This makes the derivation visible without letting the admin desynchronise it.
2. **Prize breakdown** — three fixed rows (Visitor / RED / BLUE), each with `tier_label`, `price_label`, `weekly`, `monthly`. Rows cannot be added or removed; `tier_group` is fixed and rendered as a label. Visitor's `monthly` accepts empty → serialised as `null`.

**Validation (Zod):** all text fields non-empty except Visitor `monthly`; `current_members` an integer ≥ 0; `tiers` exactly three entries with `tier_group` matching `visitor` / `red` / `blue`.

**Navigation:** add `{ title: 'Prizes', href: '/dashboard/prizes', icon: Sparkles }` to `ITEMS` in `src/components/ui/nav-main.tsx`, placed after *Winners*. `Gift` and `Trophy` are already taken by Giveaways and Winners.

---

## 7. Consumer pages

### `/member/prizes`

- `page.tsx` fetches via the resource inside `try/catch`; on failure renders the existing page header plus `EmptyState` (`icon={Trophy}`, title *"Prize pool unavailable"*, description inviting a retry shortly). `EmptyState`'s own doc comment designates it for exactly this case.
- `stage-tracker.tsx` takes `{ pool }` still, but reads stage facts from `src/lib/prizes.ts` instead of `pool.current_stage` / `pool.stages`, and adopts PRD's progress formula.
- `prize-tier-card.tsx` is unchanged — `PrizeTierBreakdown` did not change.
- Fetch is cached (prize data is identical for every member); the member-identity fetch alongside it keeps its existing `no-store`.

### `/prizes` (public)

- `page.tsx` becomes an async Server Component with `export const revalidate = 300`, fetches the pool, and passes `headline` / `prizes_sublabel` into `MembershipClubSection`. On failure it passes `null` and the component renders nothing in place of the prize-pool card (§3.3).
- `membership-club-section.tsx` takes optional props, replacing the inlined `$2100` (line 32) and `@ 22 Prizes • One Month` (line 35). All gradient/glow styling is untouched.
- `visitor-red-blue-section.tsx` and `slr-life-tiers-section.tsx` are **not modified** — per §3.2.

---

## 8. Rollout — two phases, not one

The endpoint returns 404 today. Merging the page rewiring before the backend lands would turn two working production pages into an error state and a missing section.

- **Phase 1 — safe to merge immediately.** §5 (types, `lib/prizes.ts`, resource, endpoints) and §6 (admin page, nav item). Zero user-visible change: the admin page shows `ListErrorCard` until the backend answers, which is the correct signal for an admin.
- **Phase 2 — merge only once `GET /api/v1/public/prizes` returns 200.** §7 (member and public page rewiring), plus deleting `src/data/prizes.ts`.

Phase 1 is the sprint deliverable; Phase 2 is gated on the backend.

---

## 9. Verification

**Static:**
```bash
npm run type-check
npm run lint
npm run build
```

**Stage derivation** — assert against PRD's own worked examples:

| `current_members` | Expected stage | Label | Remaining | pct |
|---|---|---|---|---|
| 142 | 1 | For 100 Members • Stage 1 | 58 until Stage 2 | 71 |
| 99 | 1 (pre-launch) | For 100 Members • Stage 1 | 1 until Stage 1 | 99 |
| 200 | 2 | For 200 Members • Stage 2 | 100 until Stage 3 | 67 |
| 2500 | 7 | For 2,000 Members • Stage 7 | 0 | 100 |

**Endpoint:**
```bash
curl -s -o /dev/null -w '%{http_code}\n' https://api.smartliferewards.com.au/api/v1/public/prizes
```
404 → Phase 2 stays unmerged. 200 → proceed, and diff the payload against §4.

**Manual, Phase 1:** `/dashboard/prizes` renders the form and shows `ListErrorCard` while the backend 404s; the derived stage line updates live as `current_members` is typed; the Prizes nav item highlights on the route.

**Manual, Phase 2:** `/member/prizes` renders real figures and the corrected progress bar; forcing a failure (bad base URL) shows `EmptyState`, never a crash or stale numbers; `/prizes` renders the CMS headline, and on forced failure drops the prize-pool card while the rest of the page still renders.

**After merging:** run `graphify update .`.

---

## 10. File touch list

**New**
- `src/lib/prizes.ts`
- `src/lib/api/resources/prizes.ts`
- `src/app/dashboard/(routes)/prizes/{page.tsx,prizes-client.tsx,actions.ts,loading.tsx}`

**Modified**
- `src/types/member.ts` — trim `PrizePool`, move `PrizeStage` out
- `src/lib/api/endpoints.ts` — add `prizes` namespace
- `src/components/ui/nav-main.tsx` — add nav item
- `src/app/member/prizes/page.tsx` — API fetch + `EmptyState`
- `src/app/member/prizes/_components/stage-tracker.tsx` — derived stage + PRD progress formula
- `src/app/(home)/(routes)/prizes/page.tsx` — async fetch + `revalidate`
- `src/app/(home)/(routes)/prizes/_components/membership-club-section.tsx` — props

**Deleted (Phase 2)**
- `src/data/prizes.ts`

---

## 11. Open items for the backend team

1. Implement `GET /api/v1/public/prizes` and `PUT /api/v1/admin/prizes` per §4.
2. Seed the document with the PRD Stage 1 values in §4.
3. Confirm `PUT` is full-replace (not merge) and returns the saved document.
4. Confirm the admin route enforces the admin role and answers 401/403 consistently with `/api/v1/admin/*`.

Log any deviation found during integration in `docs/BACKEND-ISSUES.md`, per [RULES.md](../../../RULES.md) §5.
