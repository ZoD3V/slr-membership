# Admin Safe Hours Settings (Design)

- **Date:** 2026-08-08
- **Sprint:** 4 (Ronde 4) — item "Pengaturan Safe Hours"
- **Status:** Approved (design), pending implementation plan
- **Area:** `src/app/dashboard/(routes)/safe-hours/` (new)

---

## 1. Context & Goal

Safe Hours is the Friday lockout window during which sign-up, upgrade and downgrade are blocked so admin can pull the TPAL CSV and run the draw. Today the window is a **hardcoded constant** — `SAFE_HOURS = { weekday: 'Fri', startHour: 16, endHour: 19, timeZone: 'Australia/Sydney' }` in [src/lib/safe-hours.ts](../../../src/lib/safe-hours.ts) — consumed by six member-facing call sites (the advisory pre-check hook, the notice banner, and every action that catches `SAFE_HOURS_LOCKED`).

PRD §5.8 "Safe Hours Management" asks for four admin capabilities: configure the window, manually override it, view a log of blocked attempts, and notify affected members. This slice builds an editor for the window itself.

**Verified live 2026-08-08:** `GET /api/v1/admin/safe-hours` returns **404**.

---

## 2. Scope

**In scope:**
- Admin editor at `/dashboard/safe-hours` — a single-document form (weekday, start hour, end hour). No list, no history.
- Falls back to seed data (the current hardcoded default) while the endpoint is unimplemented, matching the pattern already shipped for Prizes.

**Out of scope — and why:**
- **Blocked-attempts log and member notification** (PRD's items 3 and 4). The API Contract's Safe Hours section defines only `GET/PUT /admin/safe-hours` — no log or notify endpoint exists to build against. Logged as a backend ask in §6, the same way Prizes' gaps were logged.
- **Rewiring the member-facing advisory check** (`src/lib/safe-hours.ts`, `hooks/use-safe-hours.ts`, `SafeHoursNotice`). The API Contract lists `/admin/safe-hours` only — there is no public/unauthenticated equivalent a member's browser could call. Members cannot fetch an admin-gated endpoint, so the hardcoded constant cannot be replaced without a new backend route. **This is a real, accepted gap**: if an admin changes the window, the backend enforces the new one immediately (it is the authority — see the existing code comment in `lib/safe-hours.ts`), but the member-facing button keeps disabling itself on the *old* schedule until a page reload happens to hit fresh code, or until this constant is manually updated to match. Logged as a backend ask in §6.
- **Timezone editing.** PRD's window is always `Australia/Sydney`; nothing in PRD or the API Contract suggests this varies. Not a field.

---

## 3. Decisions

### 3.1 One document, not default-vs-override

PRD's "manual override" (e.g. extending the window if TPAL is delayed) is not a second, expiring value layered on top of a permanent default. It is the admin editing the same document. The API Contract gives one `GET/PUT /admin/safe-hours` pair with no expiry field, and introducing an expiring-override concept would mean inventing a wire shape nothing has confirmed — the same category of risk flagged for Notifications' template shape. An admin who extends the window for one Friday is expected to change it back afterward, the same way they would for Prizes' `current_members`.

### 3.2 Weekday is editable, not locked to Friday

PRD phrases the window as *"default: Friday 16:00–19:00"* — "default" implies it can be something else, and the TPAL draw's day is a scheduling decision that could move. The form renders a 7-day dropdown rather than fixing Friday as a label.

### 3.3 Fallback and error handling — reuse the Prizes pattern exactly

The user has already made this call once, for Prizes: don't show an error card while the backend is unimplemented, render the form against seed data instead so admin walkthroughs and demos work, and let the save action fail loudly (toast) rather than pretending the save succeeded. Same shape here, same reasons — this is a single, small settings form with no compliance angle like Prizes' TPAL-regulated figures, so there's no reason to diverge.

Seed values are the current hardcoded default: `{ weekday: 'Fri', start_hour: 16, end_hour: 19 }` — matching what the backend should seed once it implements the endpoint.

---

## 4. Proposed API contract

```
GET /api/v1/admin/safe-hours     → SafeHoursConfig     admin JWT
PUT /api/v1/admin/safe-hours     → SafeHoursConfig     admin JWT, full-document replace
```

```json
{
  "weekday": "Fri",
  "start_hour": 16,
  "end_hour": 19
}
```

`weekday` is one of `Mon|Tue|Wed|Thu|Fri|Sat|Sun` — the same three-letter values `src/lib/safe-hours.ts` already uses, so no mapping layer is needed if the backend matches this shape. `start_hour`/`end_hour` are 0–23; the API Contract does not document a timezone field, so none is sent — the platform-wide `Australia/Sydney` from `src/lib/safe-hours.ts` is left untouched in code, not on the wire.

---

## 5. Data layer

### `src/types/member.ts` — new type, small enough to sit near other admin CMS types

```ts
export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface SafeHoursConfig {
    weekday: Weekday;
    start_hour: number;
    end_hour: number;
}
```

### `src/lib/api/endpoints.ts` — add to the existing `admin` namespace

```ts
safeHours: '/api/v1/admin/safe-hours',
```

### `src/lib/api/resources/safe-hours.ts` — new

```ts
export function getAdminSafeHours(token: string): Promise<SafeHoursConfig>;
export function updateAdminSafeHours(token: string, payload: SafeHoursConfig): Promise<SafeHoursConfig>;
```

Both admin-gated (unlike Prizes' public read) — every call takes a token, matching the `admin.*` resource functions already in `src/lib/api/resources/admin.ts`. Not wrapped in `cache()`: it's a one-page admin form, not a shared read across public and member surfaces the way Prizes' pool is.

---

## 6. Admin editor — `/dashboard/safe-hours`

Same shape as Prizes: `page.tsx` (server, fetch + seed fallback) → `safe-hours-client.tsx` (form) → `actions.ts` (`'use server'`, save + revalidate) → `seed.ts` (fallback constant).

**Form:** one card, three fields — weekday (`Select`, 7 options), start hour and end hour (`Input type='number'`, 0–23). Zod validates both hours as integers in range and `end_hour > start_hour` (a window can't close before or exactly when it opens). Same blank-input trap as Prizes' `current_members` applies here — `z.coerce.number()` alone turns `""` into `0`, which is a valid hour and would silently save a zero-width or wrong window; Prizes' string-first-then-transform pattern is reused verbatim, not re-derived.

**Navigation:** add `{ title: 'Safe Hours', href: '/dashboard/safe-hours', icon: Clock }` to `ITEMS` in `src/components/ui/nav-main.tsx`, after Prizes. `Clock` is already the icon `SafeHoursNotice` uses for the same concept on the member side — reusing it keeps the association obvious, and it isn't taken by any existing nav item.

**Seed banner:** identical wording pattern to Prizes — a muted line under the heading when the endpoint 404s: *"Showing placeholder figures — the safe-hours endpoint is not live yet, so saving will not persist."*

---

## 7. Backend asks — append to `docs/BACKEND-ISSUES.md`

Same section style as the Prizes entry added there:
1. Implement `GET/PUT /api/v1/admin/safe-hours` per §4.
2. Confirm `PUT` is full-replace and returns the saved document.
3. Confirm the admin route enforces the admin role, 401/403 consistent with other `/api/v1/admin/*` routes.
4. **New backend ask, not present for Prizes:** consider a public or member-authenticated read endpoint for the *current* safe-hours window (or include it in the existing member session/bootstrap payload). Without one, `src/lib/safe-hours.ts`'s hardcoded constant cannot track an admin-edited window, and the member-facing advisory disable will silently drift from what the backend actually enforces. The backend remains the authority either way — this is strictly a UX-timing gap, not a security one — but it should be a known, owned gap rather than a surprise.

---

## 8. Verification

**Static:**
```bash
npm run type-check
npx eslint "src/app/dashboard/(routes)/safe-hours/**/*.{ts,tsx}" src/lib/api/resources/safe-hours.ts src/lib/api/endpoints.ts src/components/ui/nav-main.tsx src/types/member.ts
npm run build
```

**Validation cases** (hand-verify or exercise in the browser, no PRD-derived arithmetic table is needed here — unlike Prizes, there is no stage math):
- `start_hour = 16, end_hour = 19` → valid.
- `start_hour = 19, end_hour = 16` → rejected, "end must be after start".
- `start_hour = 16, end_hour = 16` → rejected (zero-width window).
- Blank start or end hour → rejected, not silently `0`.
- `start_hour = 25` → rejected as out of range.

**Manual:** `/dashboard/safe-hours` renders the form against seed data while the endpoint 404s; the seed banner is visible; Save fails with a toast (expected, endpoint doesn't exist); the nav item highlights on the route.

**After merging:** run `graphify update .`.

---

## 9. File touch list

**New**
- `src/lib/api/resources/safe-hours.ts`
- `src/app/dashboard/(routes)/safe-hours/{page.tsx,safe-hours-client.tsx,actions.ts,seed.ts,loading.tsx}`

**Modified**
- `src/types/member.ts` — add `Weekday`, `SafeHoursConfig`
- `src/lib/api/endpoints.ts` — add `admin.safeHours`
- `src/components/ui/nav-main.tsx` — add nav item
- `docs/BACKEND-ISSUES.md` — append backend asks (§7)
