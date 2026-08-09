# Sprint 4 Admin Contract Rewire (Design)

- **Date:** 2026-08-09
- **Sprint:** 4 (Ronde 4) — correcting Prizes CMS, Safe Hours, Spin Wheel admin panels against the real API doc
- **Status:** Approved (design), pending implementation plan
- **Area:** `src/app/dashboard/(routes)/{prizes,safe-hours,spin}/`, `src/lib/api/resources/{prizes,safe-hours,spin-admin}.ts`, `src/types/member.ts`, `src/lib/api/http.ts`

---

## 1. Context & Goal

The user pasted a real Sprint 4 admin API document (`GET /admin/dashboard`, `GET/PUT /admin/prizes`, `GET/PUT /admin/spin/config`, `GET /admin/spin/history`, `GET/PUT /admin/safe-hours`) covering endpoints this project already shipped admin UI for — Prizes, Safe Hours, Spin Wheel — all built earlier this sprint against **guessed/PRD-derived shapes** while the backend was still 404. The real shapes differ substantially from what was built:

- **Prizes**: the admin document is a flat CMS record with a **free-text `stage_label`** and no `current_members` field at all — contradicting the PRD-derivation rule ("current_stage must never be hardcoded") that this project enforced earlier. The real contract wins; see §3.
- **Safe Hours**: field names and types differ (`day_of_week`/`start_time`/`end_time` as strings, not `weekday`/`start_hour`/`end_hour` as numbers), and the real document adds a **`manual_override`** capability (`NONE`/`FORCE_LOCK`/`FORCE_UNLOCK`) plus a read-only `is_currently_locked` flag — both previously out of scope because the contract didn't have them.
- **Spin Wheel**: history rows use different field names (`spin_id`/`user_name`/`user_email`, `moment: 'pre_renewal'` not `'renewal'`), tier values are lowercase codes covering all 8 sub-tiers (not just the 5 spin-eligible ones), history is **server-paginated** (not client-side), and the config document exposes a **`spin_discount_cents` per sub-tier** — which the PRD's PO decision had explicitly deferred, but the real contract ships it now.

All three endpoints are still 404 live (re-verified 2026-08-09) — this is a shape correction, not a live-integration task. Same build-ahead posture as before: seed fallback, placeholder banner, save fails loudly.

**Explicitly out of scope for this doc:** `GET /admin/dashboard` — already has a shipped admin page (`src/app/dashboard/page.tsx`) built against an older, broader guess (extra `alerts` fields with `as any` fallbacks not in the new doc). It already degrades safely (`?? 0` defaults) and is not part of what the user asked to be rewired this round. Flagged as a follow-up candidate, not touched here.

---

## 2. Decisions

### 2.1 Prizes: two separate documents, not one

The real `/admin/prizes` document has no relationship to the old guessed `PrizePool` type (`current_members`, `tiers[]`) that `src/lib/prizes.ts`'s stage-derivation module and the **member-facing** `/member/prizes` and public `/prizes` pages already consume. Those consumer pages were explicitly deferred (Phase 2, never started this sprint) and are not touched here — no live endpoint feeds them yet either.

So: introduce a new `PrizeContent` type matching the real admin document exactly, used only by the admin editor. `PrizePool`, `PrizeTierBreakdown`, `src/lib/prizes.ts` (stage derivation + its test suite), and the member/public prizes pages are **left untouched** — they're a different, still-hypothetical document on a still-unconfirmed endpoint.

The admin form gets simpler: no `current_members` input, no derived stage progress line (there's nothing to derive from in this document) — `stage_label` is just a text field the admin types directly, matching the real contract's own example (`"For 150 Members • Stage 2"`).

### 2.2 Prizes: endpoint correction

The real doc confirms `GET` **and** `PUT /admin/prizes` both exist under the admin-authenticated base — there was no admin GET modelled before (the admin page previously read from the assumed *public* cached endpoint, then wrote to the admin PUT — an asymmetric split that turns out to be wrong). Both verbs now hit `/api/v1/admin/prizes`, and the admin page switches to the same token-gated `getAccessToken()` fetch pattern already used by Safe Hours and Spin, instead of the public cached `getPrizePool()`.

`API.prizes.public` (still unconfirmed, still unused until Phase 2) stays as-is for the member/public side. `API.prizes.update` is replaced by a new `API.admin.prizes` entry, consistent with how Safe Hours/Spin's admin endpoints are named in that namespace.

### 2.3 Safe Hours: add manual override + active toggle, correct field shapes

Field rename and type change: `weekday` (3-letter, e.g. `'Fri'`) → `day_of_week` (full name, e.g. `'Friday'`); `start_hour`/`end_hour` (0–23 numbers) → `start_time`/`end_time` (`'HH:MM'` strings). Two new fields: `is_active: boolean` (window on/off) and `manual_override: 'NONE' | 'FORCE_LOCK' | 'FORCE_UNLOCK'` (previously filed as a backend ask — now real). One new read-only field: `is_currently_locked: boolean`, server-computed, displayed but never submitted.

`start_time`/`end_time` as `'HH:MM'` map naturally onto a native `<input type="time">` — cleaner than the old two number inputs, and the browser handles the format for free.

The member-facing advisory constant `src/lib/safe-hours.ts` (`SAFE_HOURS`, `isSafeHoursLocked()`) is **not** touched — it's a deliberately separate, independent fallback per its own existing comment (no public read endpoint exists for it), and nothing about the admin document's shape changes what that file needs to do.

### 2.4 Spin: config now includes per-sub-tier discount; history is server-paginated

Per the user's explicit answer, `spin_discount_cents` becomes a real editable field per sub-tier — added as a dollar input next to each sub-tier's toggle. The config document's `sub_tiers` array is keyed by lowercase `sub_tier_id` (`'r1'`, `'r4'`, …) covering all 8 codes, not just the 5 PRD-eligible ones (`R4/R7/B4/B7/B10`). The form still only renders editable rows for the 5 eligible sub-tiers — PRD's permanent-ineligibility rule for Visitor/R1/B1 doesn't change just because the wire format now includes them. Non-eligible entries from the GET response are carried through untouched (not dropped) when the form saves, so a PUT never silently erases them.

History rows are read essentially as-is from the API (`spin_id`, `user_name`, `user_email`, `tier` as a **display string** like `"Red Plus"` — no more code-to-label lookup needed in the columns), plus two new fields worth showing: `applied` (has this win's discount been used on an invoice yet) and `expires_at`. `moment` gains a third distinct value spelling: `'pre_renewal'` (not `'renewal'`) — label mapping updates accordingly.

Pagination moves from "fetch everything, paginate client-side" to real server pagination (`page`, `per_page` up to 100, response `meta.total_pages`/`total`). This needs `apiFetch` to expose `meta` — today it's discarded (`return json.data`). Add a sibling function `apiFetchPaginated<T, M>()` in `http.ts` that shares the same request/error/logging logic but resolves `{ data: T; meta: M }`, rather than changing `apiFetch`'s existing contract (used by ~20 call sites). `page` joins `tier`/`moment` as a third URL-driven filter on `/dashboard/spin`, matching the existing pattern.

### 2.5 Data-table server pagination

`DataTable` (`src/components/data-table.tsx`) already supports a `serverSide` mode (`currentPage`/`totalItems`/`itemsPerPage`/`onPageChange` props) — no new component needed, just wiring `SpinHistoryClient` to use it instead of the current client-paginated mode.

---

## 3. Data layer

### `src/types/member.ts`

Replace the `// ── Prizes …` block's nothing (that section stays untouched — `PrizePool`/`PrizeTierBreakdown` unchanged) and add a new section:

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
    updated_at: string;
}
```

Replace the `// ── Safe Hours …` block:

```ts
// ── Safe Hours (real API, 2026-08-09) ─────────────────────────────────────────
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

Replace the `// ── Spin Wheel Admin …` block:

```ts
// ── Spin Wheel Admin (real API, 2026-08-09) ───────────────────────────────────
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
    tier: string; // display string from the API, e.g. 'Red Plus'
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

`SpinEligibleSubTier` (`'R4'|'R7'|'B4'|'B7'|'B10'`) stays — still used to decide which 5 rows the config form renders, compared case-insensitively against the new lowercase `sub_tier_id`.

### `src/lib/api/http.ts` — add `apiFetchPaginated`

Extract the existing body of `apiFetch` (the `fetch()` call, JSON parse, logging, and the `!res.ok || !json?.success` error branch — everything except the final `return json.data`) into a private `doFetch<T>(path, opts): Promise<ApiEnvelope<T>>`. `apiFetch` becomes a two-line wrapper (`return (await doFetch<T>(path, opts)).data`); its exported signature and behaviour for all ~20 existing call sites are unchanged. Add the new export alongside it:

```ts
export async function apiFetchPaginated<T, M = Record<string, unknown>>(
    path: string,
    opts: ApiFetchOptions = {}
): Promise<{ data: T; meta: M }> {
    const json = await doFetch<T>(path, opts);

    return { data: json.data, meta: (json.meta ?? {}) as M };
}
```

### `src/lib/api/endpoints.ts`

```ts
admin: {
    // ...existing entries unchanged...
    prizes: '/api/v1/admin/prizes' // replaces the old prizes.update entry
}
```

Remove `prizes.update` from the `prizes` namespace (wrong shape, superseded). Keep `prizes.public`.

### `src/lib/api/resources/prizes.ts`

Keep `getPrizePool()` (public, cached, `PrizePool`) untouched. Remove `updatePrizePool()` (wrote the wrong shape to the now-corrected admin path). Add:

```ts
export function getAdminPrizeContent(token: string) {
    return apiFetch<PrizeContent>(API.admin.prizes, { token });
}

export function updateAdminPrizeContent(token: string, payload: PrizeContent) {
    return apiFetch<PrizeContent>(API.admin.prizes, { method: 'PUT', token, body: payload });
}
```

### `src/lib/api/resources/safe-hours.ts`

Same two functions, payload type becomes `SafeHoursUpdatePayload`, return type stays `SafeHoursConfig` (server echoes `is_currently_locked`/`updated_at` back).

### `src/lib/api/resources/spin-admin.ts`

`getAdminSpinConfig`/`updateAdminSpinConfig` unchanged signatures, new types flow through automatically. `getAdminSpinHistory` changes to use `apiFetchPaginated` and accepts `page`/`per_page`:

```ts
export interface SpinHistoryFilters {
    tier?: SpinTierId;
    moment?: SpinMoment;
    page?: number;
    perPage?: number;
}

export function getAdminSpinHistory(token: string, filters?: SpinHistoryFilters) {
    return apiFetchPaginated<SpinHistoryRow[], SpinHistoryMeta>(`${API.admin.spinHistory}${historyQuery(filters)}`, {
        token
    });
}
```

`historyQuery` adds `page`/`per_page` params alongside the existing `tier`/`moment`.

---

## 4. Admin pages

### `/dashboard/prizes`

- `page.tsx`: switch to `getAccessToken()` + `getAdminPrizeContent(token)`, same seed-fallback posture (placeholder banner, 401 → `handleApiAuthError`).
- `seed.ts`: replace `PRIZE_POOL_SEED` with a `PrizeContent`-shaped seed using the real doc's own example values (already given — Stage 1 $2,100 figures, straight from the pasted doc's response sample).
- `prizes-client.tsx`: rewritten flat form. Two cards: "Prize pool" (`prize_pool_headline`, `prize_count`, `stage_label`, `odds` — all required text) and "Prize breakdown" (`visitor_prize` alone; `red_weekly`+`red_monthly` paired; `blue_weekly`+`blue_monthly` paired — all required text, no more Visitor/monthly-optional special case since the real document has no monthly field for Visitor at all — it's just one `visitor_prize` string). No more `TIER_ROWS`/static label plumbing — those existed to round-trip fields (`tier_label`/`price_label`) that don't exist in the real document at all.
- `actions.ts`: payload type `PrizeContent`; `revalidatePath('/dashboard/prizes')` only (drop the member/public revalidate calls — confirmed unrelated documents now, keeping them would misleadingly imply a connection).

### `/dashboard/safe-hours`

- `page.tsx`: unchanged structure, types flow through.
- `seed.ts`: updated field names/values (`day_of_week: 'Friday'`, `start_time: '16:00'`, `end_time: '19:00'`, `is_active: true`, `manual_override: 'NONE'`, `is_currently_locked: false`, `updated_at` a fixed ISO string).
- `safe-hours-client.tsx`: day `Select` now uses full-name values (`WEEKDAYS` list becomes `{value:'Monday',label:'Monday'}` etc. — value and label converge since the API uses full names). Start/end become `<Input type='time' {...field} />` bound to `'HH:MM'` strings. New `is_active` `Switch` row. New `manual_override` `Select` with 3 options, each with one line of helper copy (mirrors the doc's own explanation: "Follow the automatic schedule" / "Block sign-up & plan changes right now" / "Force open even during the window"). A read-only status line above the form showing `Currently locked: Yes/No` sourced from `config.is_currently_locked` (not part of the form/submission — re-read only on load/save).
- Zod: `day_of_week` enum of the 7 full names; `start_time`/`end_time` via `z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM, 24h')`, refined so `end_time > start_time` (safe as a plain string compare — both are zero-padded `HH:MM`); `is_active` boolean; `manual_override` enum of the 3 values.

### `/dashboard/spin`

- `page.tsx`: adds `page` to the whitelisted search params (default `1`), reuses `normalizeSpinConfig` (adjusted to the new `SpinConfig` shape: default `global_enabled: true`, and for `sub_tiers`, merge-by-`sub_tier_id` over the seed's 5 eligible rows rather than a flat boolean record). `getAdminSpinHistory` now returns `{data, meta}` — page passes both `history = data` and the new `historyMeta` down to `SpinHistoryClient`; on failure, history stays `[]` and `historyMeta` stays a zeroed default (`{page:1, per_page:20, total:0, total_pages:1}`) so the table's pager doesn't crash on a failed fetch.
- `seed.ts`: `SPIN_CONFIG_SEED` becomes `{ global_enabled: true, sub_tiers: [5 eligible rows with has_spin:true, spin_discount_cents:1000] }` (one seed discount value for all, matching the doc's own `r4` example).
- `spin-config-client.tsx`: `enabled`→`global_enabled` state rename; each of the 5 eligible sub-tier rows gets, alongside its existing `Switch`, a small `$` `Input` (cents-to-dollars display, same coercion pattern as Prizes/Safe Hours — blank rejected, non-negative integer) bound to `spin_discount_cents`. On save, the full `sub_tiers` array is rebuilt: the 5 edited rows from form state, plus any other `sub_tier_id`s that came back from the original GET (ineligible ones) copied through unchanged — never dropped.
- `spin-history-client.tsx`: filter dropdown values switch to lowercase `SpinTierId` (all 8, matching the documented query enum) with labels built from `SUB_TIERS[code.toUpperCase()]` where that exists, else the raw id capitalised (covers `visitor` which isn't in the eligible set's styling but is a valid filter value). Moment options become `registration`/`pre_renewal` with labels "Registration"/"Pre-renewal". Switches from client-side to server-side `DataTable` (`serverSide`, `currentPage={meta.page}`, `totalItems={meta.total}`, `itemsPerPage={meta.per_page}`, `onPageChange` pushes `page` into the URL alongside the existing `tier`/`moment` params).
- `_components/columns.tsx`: `member_name`→`user_name` (+ `user_email` as a secondary line under the name), tier column renders `row.tier` directly (already a display string, no `SUB_TIERS` lookup), `moment` label map (`registration`/`pre_renewal`), two new columns — `Applied` (badge, Yes/No) and `Expires` (formatted date or `—` when null).

---

## 5. Verification

**Static:**
```bash
npm run type-check
npx eslint "src/app/dashboard/(routes)/{prizes,safe-hours,spin}/**/*.{ts,tsx}" \
    src/lib/api/resources/{prizes,safe-hours,spin-admin}.ts src/lib/api/http.ts src/lib/api/endpoints.ts src/types/member.ts
npm run build
```
(`npm run lint` stays broken repo-wide — use the `npx eslint` form.)

**Vitest:** `src/lib/prizes.ts` + `src/lib/prizes.test.ts` are untouched — no changes expected, re-run `npx vitest run` to confirm nothing regressed by the sibling type edits in `member.ts`.

**Manual (endpoints still 404):** each of the 3 pages renders against its updated seed with the placeholder banner; Safe Hours shows the new override select + active toggle + read-only lock status; Spin's config card shows a $ input per sub-tier and the history table's pager renders against the seed's implied single page; all three Save buttons fail loudly via toast (expected, no live backend yet).

**After merging:** run `graphify update .`.

---

## 6. File touch list

**New:** none (no new files — this is a shape correction across existing files).

**Modified:**
- `src/types/member.ts` — new `PrizeContent`; replaced `SafeHoursConfig` + new `SafeHoursDay`/`SafeHoursOverride`/`SafeHoursUpdatePayload`; replaced `SpinConfig`/`SpinHistoryRow` + new `SpinTierId`/`SpinSubTierConfig`/`SpinMoment`/`SpinHistoryMeta`
- `src/lib/api/http.ts` — new `apiFetchPaginated`
- `src/lib/api/endpoints.ts` — `admin.prizes` added, `prizes.update` removed
- `src/lib/api/resources/prizes.ts` — `updatePrizePool` removed, `getAdminPrizeContent`/`updateAdminPrizeContent` added
- `src/lib/api/resources/safe-hours.ts` — payload type only
- `src/lib/api/resources/spin-admin.ts` — `getAdminSpinHistory` now paginated, filters gain `page`/`perPage`
- `src/app/dashboard/(routes)/prizes/{page.tsx,prizes-client.tsx,actions.ts,seed.ts}`
- `src/app/dashboard/(routes)/safe-hours/{safe-hours-client.tsx,seed.ts}`
- `src/app/dashboard/(routes)/spin/{page.tsx,spin-config-client.tsx,spin-history-client.tsx,seed.ts,_components/columns.tsx}`

---

## 7. Backend asks — update `docs/BACKEND-ISSUES.md`

All three subsections under the Sprint 4 heading get a short addendum noting the FE shape now matches the 2026-08-09 API doc exactly, so the earlier "shape unconfirmed" caveats (Spin's `GET /admin/spin/config` in particular — item was previously flagged as *not even in the contract*) are resolved. No new asks — the doc answers every open question these three subsections previously raised, except confirming exactly which `sub_tier_id`s are present on a fresh `GET` (all 8 vs only eligible ones) — kept as a note in Spin's subsection since the form's merge-and-preserve behaviour (§4) is designed to be safe either way.
