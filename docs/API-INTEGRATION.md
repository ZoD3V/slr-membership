# SLR API Integration — Guide & Progress

Handoff doc for wiring the SLR web app to the Express backend. **Read this before adding an integration.**

> **Backend error handoff:** endpoints returning errors / off-spec behavior (with example requests + responses) are collected in [BACKEND-ISSUES.md](BACKEND-ISSUES.md).

- **API base:** `https://api.smartliferewards.com.au` · prefix `/api/v1`
- **Swagger UI:** `https://api.smartliferewards.com.au/docsx-2s3crt3-199` · **OpenAPI JSON:** `…/docsx-2s3crt3-199/json`
- **Auth:** Bearer JWT (`Authorization: Bearer <access_token>`) or `slr_at` cookie
- **Response envelope (every endpoint):** `{ success, message, data, meta }` — always unwrap to `data`
- **Money:** integer cents (AUD) → divide by 100 for display
- **Env:** `NEXT_PUBLIC_API_BASE`, `AUTH_SECRET`, `NEXT_PUBLIC_ALLOW_DEV_LOGIN`

---

## The API ecosystem (`src/lib/api/`)

| File | Purpose |
|---|---|
| `types.ts` | `ApiEnvelope<T>`, `ApiError` |
| `endpoints.ts` | `API_BASE_URL` + `API` path map (one namespace per domain) |
| `http.ts` | `apiFetch<T>(path, { method, body, token, cache, revalidate, tags })` — unwraps envelope, throws `ApiError`. Server + client. |
| `server.ts` | `getAccessToken()` — session token (`server-only`) |
| `guard.ts` | `handleApiAuthError(error)` — on `401` → `redirect('/api/auth/logout')` (force logout) |
| `resources/*.ts` | Typed **DTO interfaces** + resource functions per domain (`auth`, `memberships`, `admin`, `discounts`) |

Auth: `auth.ts` (NextAuth Credentials) → `POST /auth/login` → `GET /auth/me` (name/email/state) → session carries `accessToken, refreshToken, role, tier, sub_tier, state`. Role gating in `auth.config.ts`: `admin`/`super_admin` → `/dashboard` only; `member` → `/member` + `/ebooks` only.

---

## RULES — adding an integration (follow exactly)

1. Add the path to `API` in `endpoints.ts` (domain namespace).
2. **Hit the live endpoint FIRST** (curl with a real token / throwaway account) and read the actual response body — then declare the **DTO interface off that real response**, not just the OpenAPI schema (schema can drift). Build interfaces for EVERY response. Mirror the real shape so the data is trivial to render on the frontend. Then a function wrapped in `React.cache`:
   - Public: `export const getX = cache(() => apiFetch<X>(API.x.y, { revalidate: 3600 }))`
   - Authed: `export const getX = cache((token: string) => apiFetch<X>(API.x.y, { token, cache: 'no-store' }))`
3. Consume in a **Server Component**: `const token = await getAccessToken();` then call inside `try/catch`.
4. Catch: `catch (error) { handleApiAuthError(error); failed = true; }` — 401 force-logs-out; else falls through.
5. No data / failed → render `<EmptyState icon title description />` (`@/components/common/empty-state`).
6. Marketing pages MAY keep a static fallback (e.g. tiers); data pages show `EmptyState`.
7. **Never render `draw_pass`** — only `entry_status`. **Empty/missing display field → default value, never blank/`undefined`/`null`/`NaN`:** string → `"-"`, number → `0` (money still `/100` after defaulting). Omit the field only when a `-` would be meaningless.
8. Perf: one fetch per page (no waterfalls; `Promise.all` for independent), no barrel imports, no inline components, ternary conditionals.
9. Theme: admin `.slr-admin` (gold primary), member `.slr-member`; both dark. Reuse SLR tokens.
10. Verify: `npm run type-check` + `npx eslint <files>` + curl with a real token.

### Add-a-module template
```ts
// resources/giveaways.ts
export interface Giveaway { giveaway_id: string; title: string; /* … mirror schema … */ }
export const getGiveaways = cache((token: string) =>
    apiFetch<Giveaway[]>(API.giveaways.list, { token, cache: 'no-store' }));
```

---

## Dev login (sample accounts — password `ChangeMeImmediately!1`)

| Email | Role | Tier | Lands |
|---|---|---|---|
| superadmin@smartliferewards.com.au | super_admin | visitor | /dashboard |
| admin@smartliferewards.com.au | admin | visitor | /dashboard |
| visitor@smartliferewards.com.au | member | visitor | /member |
| red@smartliferewards.com.au | member | r4 | /member |
| blue@smartliferewards.com.au | member | b4 | /member |

Dev bypass: `NEXT_PUBLIC_ALLOW_DEV_LOGIN=true` → login `SLRadmin` / `SLRadmin`.

---

## Progress — integrated

**Ratio: 46 / 75 endpoints integrated (called from the app).**

| Endpoint | Where | Notes |
|---|---|---|
| `POST /api/v1/auth/login` | `auth.ts` | NextAuth credentials |
| `GET /api/v1/auth/me` | `auth.ts` | name/email/state/tier |
| `POST /api/v1/auth/register` | `sign-up/.../register-form.tsx` | Visitor-only (paid deferred to Stripe task); returns `{user_id, requires_otp, requires_payment, spin_available}`. Dedup guard skips re-register on Back→forward |
| `POST /api/v1/auth/verify-otp` | `sign-up/.../step-otp.tsx` | Visitor OTP; 401 on bad/expired code (caught locally, no forced logout). Returned session discarded → user signs in after |
| `POST /api/v1/auth/resend-otp` | `sign-up/.../step-otp.tsx` | 30s client cooldown |
| `POST /api/v1/auth/forgot-password` | `forgot-password/page.tsx` | Reset request |
| `POST /api/v1/auth/change-password` | `member/profile` (actions.ts → security-section) | ✅ **added by backend 2026-07-21**. Body `{current_password, new_password, confirm_password}` (all required, `new_password` ≥10). Replaced a mock that faked success with zero network calls — the reason "password changed but the old one still works" was reported. Server rejects new==current / wrong current (400 `BAD_REQUEST`) and confirm mismatch (400 `VALIDATION_ERROR` on `confirm_password`); the client mirrors all three. Full live round-trip verified (old password → 401 after change, then restored). By design it does **not** revoke other sessions, so the member stays signed in afterwards (no sign-out in the Security card) |
| `PATCH /api/v1/users/me` | `member/profile` (actions.ts) | self-service name/phone/dob. Phone is sent as `+61` + digits-only local part (server pattern `^\+?[0-9]{8,15}$`, letters → 400). ✅ **`dob` accepted since 2026-07-21** — send date-only (`1990-05-14`), comes back as ISO date-time; the earlier silent-strip guard is gone |
| `POST /api/v1/auth/reset-password` | `reset-password/.../reset-password-form.tsx` | Body `{reset_token, new_password}`; `reset_token` ≥20 chars server-validated. Reads `?token=` from email link |
| `GET /api/v1/memberships/tiers` | `membership/page.tsx` | live prices + EmptyState (public) |
| `GET /api/v1/admin/members` | `dashboard/(routes)/members` | live table. ✅ **now 200** (previously 400 `BAD_REQUEST` — backend fixed 2026-07-08); returns the member list + `meta` pagination. FE row-map hardened (`-` defaults) |
| `GET /api/v1/admin/dashboard` | `dashboard/page.tsx` | ops metrics. `members_by_tier` can repeat a label (r4+b4 = "Plus") → rows aggregated by label so keys stay unique |
| `GET /api/v1/giveaways/winners` | `dashboard/(routes)/winners` | admin Winners table; read-only, `-` defaults, EmptyState when none. ⚠️ **no write endpoint exists** to record winners back after the external draw |
| `POST /api/v1/admin/csv/generate` · `GET /api/v1/admin/csv/history` | `dashboard/(routes)/draw-exports` | **TPAL draw exports** — Generate button + audit history table with per-tier download links. DTOs mirrored off live (OpenAPI schemas were empty). 🔴 exporter emits **1 row/member** with `total_token` as a column instead of one row per token — see BACKEND-ISSUES.md |
| `GET /api/v1/discounts/` | `member/discounts/page.tsx` | card reduced to API fields |
| `POST /api/v1/discounts/` | `dashboard/(routes)/discounts` | admin create (server action, camelCase body); returns `{id, partnerName, isFeatured, isActive, …}` |
| `DELETE /api/v1/discounts/{id}` | `dashboard/(routes)/discounts` | admin delete (server action) |
| `PATCH /api/v1/discounts/{id}` | `dashboard/(routes)/discounts` | admin edit (server action; partial merge — verified omitting `description` keeps it). Reuses the create dialog; added the missing `action` column so Edit + Delete now render |
| `GET /api/v1/admin/members/{userId}` | `dashboard/(routes)/members/[userId]` | member detail (profile/membership/subscription/cycles/wins); renders `entry_status`, never `draw_pass` |
| `PUT /api/v1/admin/members/{userId}/status` | `dashboard/(routes)/members/[userId]` | admin status update (server action). Body `{status:'ACTIVE'\|'SUSPENDED'\|'DEACTIVATED'}` (uppercase enum); returns `{user_id, status}` (lowercase). Live round-trip verified |
| `PUT /api/v1/admin/members/{userId}` | `dashboard/(routes)/members/[userId]` (`member-profile-form.tsx`) | **admin profile edit** (server action). Body is any subset of `{full_name, email, phone, state, dob, pay_id_email}` — despite the PUT verb it **merges**, so the form sends only changed fields (verified live 2026-08-22: single-field PUT left the other five untouched). Returns the full record incl. `pay_id_email` — but the form **omits that field on purpose** (GET can't read it back, and its purpose is unconfirmed with the client; see BACKEND-ISSUES.md), so it edits five of the six. Validation: `full_name` min 1 → 400 `VALIDATION_ERROR`; bad `email` → 400, duplicate → **409 `CONFLICT`**; `state` enum-checked → 400; `dob` accepts date-only (`1990-05-14`) or `null`, returns ISO date-time. ⚠️ **`phone` has no server validation at all** — `"abc123"` stored 200 OK; the Zod schema on the form is the only guard. This also became the single editor for draw-pool `state`, replacing the separate `PATCH /users/{id}` control (see below). |
| `POST /api/v1/memberships/change-tier` | `dashboard/(routes)/members/[userId]` | admin tier/sub-tier update (server action, on behalf of member). Body `{userId, subTierId}` where `subTierId ∈ visitor,r1,r4,r7,b1,b4,b7,b10`; returns full membership record + nested `subTier`. Bad id → `NOT_FOUND`. Does **not** change `state` by design — use `PATCH /users/{id}` `{state}` for that (verified). Chosen over `PUT /tier` (base-tier-only) for finer control. Live cross-tier switch verified + restored. ⚠️ **admin-only override — NOT the PRD upgrade path.** Spec labels it "Admin: change user's tier/state". PRD Visitor→Paid = `stripe/checkout` → webhook; Paid→Paid = `POST /memberships/upgrade`. `change-tier` does not re-allocate the cycle (visitor→b4 leaves 1 token / `draw_pass -1` + `billing_status active` with no payment) — intent unconfirmed, see BACKEND-ISSUES.md |
| `PATCH /api/v1/users/{id}` | — (action kept, no longer called) | was the admin **Draw-pool state** control. `PUT /admin/members/{userId}` now sets `state` alongside the rest of the profile, so the standalone control was removed rather than leave two editors for one field disagreeing on screen. `changeMemberStateAction` is still in `members/actions.ts` if the split is ever wanted back |
| `GET /api/v1/memberships/stats` | `dashboard/(routes)/members` | member counts per **sub-tier**, rendered as a `SubTierStats` card above the list. ⚠️ **shape drift**: OpenAPI said "grouped by tier+state" but live returns Prisma-raw `[{ _count:{_all}, subTierId }]` grouped by **sub-tier only** (no state). Normalized → `{subTierId, count}`, present-only, canonical sort. Fetched via `Promise.allSettled` alongside `admin/members` so the list's 400 no longer blanks the card |
| `GET/POST/PATCH/DELETE /api/v1/ebooks/` | `dashboard/(routes)/ebooks` | full admin CRUD (list + create/edit/delete, server actions, camelCase body, errors surfaced). ✅ **`pdfUrl` integrated 2026-07-18** — the form has a locked-after-create Chapters/PDF content-type toggle; PDF mode uploads a PDF via `presigned-url` (`application/pdf`) into `pdfUrl` and hides the chapter UI. Mode is derived from `pdf_url` on edit (toggle disabled); chapter mode sends `pdfUrl: null` |
| `POST/PATCH/DELETE /api/v1/ebooks/{id}/chapters[/{chapterId}]` | `dashboard/(routes)/ebooks` (chapter-dialog) | admin chapter CRUD (server actions). Body camelCase `{chapterNumber, title, body, imageUrl, pullQuote, sortOrder}`. Edit needs the chapter `id` (UUID) from `GET /ebooks/{id}` |
| `POST /api/v1/ebooks/presigned-url` | `dashboard/(routes)/ebooks` (`upload-asset.ts`) | ebook asset upload. `{filename, contentType}` → `{upload_url, download_url, object_key}`; client PUTs the raw file to `upload_url` with a matching `Content-Type` (no FormData), then stores `download_url` as `coverUrl` / chapter `imageUrl` / `<img src>` in the WYSIWYG body. Unique filename per upload (`{ts}-{rand}-{name}`) so multi-image uploads never collide. ✅ **PUT now 200** (was 403 `SignatureDoesNotMatch`; backend fixed the signing host 2026-07-17) |
| `GET /api/v1/ebooks/` | `member/ebooks/page.tsx` | member library grid; server-computed `is_locked` per tier → lock badge + upgrade CTA on locked cards |
| `GET /api/v1/ebooks/{id}` | `member/ebooks/[id]` | **long-form reader (halaman baca)** — chapters → shared `<EbookReader>`. 403 (tier-locked) → in-page upgrade gate. ✅ **PDF branch 2026-07-18** — when `pdf_url` is set, renders `<PdfEbookViewer>` (native `<object>` embed + download/open CTA) instead of the chapter reader; chapter-count meta suppressed. 403 gate unchanged (upstream of the branch) |
| `GET /api/v1/entries/` | `member/entry-history/page.tsx` · `member/page.tsx` | entry history + **member dashboard cycle card** (current_cycle → entry_status, total_token, renewal countdown) |
| `GET /api/v1/notifications/` | `member/layout.tsx` | member bell panel |
| `GET /api/v1/beny/status` | `member/discounts/page.tsx` | member BENY add-on status → `BenySection`. Enum: inactive/pending_activation/active/canceled |
| `POST /api/v1/beny/subscribe` | `member/discounts` (beny-actions) | subscribe (body `{name,email,phone}`). ⚠️ **Stripe block** — see below |
| `DELETE /api/v1/beny/subscribe` | `member/discounts` (beny-actions) | cancel. Only cancels an **active** sub — returns NOT_FOUND on `pending_activation` |
| `GET /api/v1/billing/status` | `account/page.tsx` · `payment/success` | billing status card + success-page activation poll (`billing_status`, `next_renewal_at`, `grace_period`) |
| `GET /api/v1/billing/invoices` | `account/page.tsx` | payment-history table (`data` = invoice array + `meta`). Seed empty → "No payments yet" |
| `POST /api/v1/stripe/portal` | `account` (Manage Billing) | hosted Billing Portal; server action → redirect to `url`. 400 on seed customers; real members get a URL |
| `POST /api/v1/stripe/checkout` | `account` (Upgrade buttons) | hosted Checkout; server action `startTierCheckout(tier)` → redirect to `url`. Body `{tier:'RED'\|'BLUE', couponId?}` → `{url, sessionId}` (verified live with `visitor@`). **Gated to `subTier.tier === 'VISITOR'`** — checkout opens a NEW subscription, so paid members must use the portal / `POST /memberships/upgrade` instead of double-subscribing. Returns to `/payment/success` (polls activation) or `/payment/cancel` |
| `GET /api/v1/memberships/me` | `member/page.tsx` | dashboard summary card. Live shape == `MembershipRecord` (subTierId, billingStatus UPPERCASE, activatedAt, subTier). ⚠️ carries **no `state`** (session), no next-payment, no BENY |
| `GET /api/v1/giveaways/` | `member/page.tsx` · `member/giveaways` | upcoming + list board. ✅ **now 200** (was 500; fixed 2026-07-09). DTO verified: `{giveaway_id,name,tier,type,prize,opens_at,closes_at,draws_at,is_entered,entry_status}`. Entries-per-giveaway = member cycle tokens (API has no per-giveaway count) |
| `GET /api/v1/giveaways/{id}` | `member/giveaways/[id]` | detail (meta + `winners[]`). ⚠️ omits entry status → merged from the list item; rules/TPAL copy static (API/PRD don't supply it) |

**Mapped in `endpoints.ts`, not called:** `POST /auth/refresh`, `POST /auth/logout`.

### Stripe status (2026-07-17)
- ✅ **`POST /stripe/checkout` wired** on `/account` for **Visitor → RED/BLUE** (the only safe use: it opens a new subscription). Verified live end-to-end against `visitor@`; DTO `{url, sessionId}` matches the backend's `docs/fe_stripe_guide.md`.
- ❌ **Paid registration checkout still mocked** — `step-checkout.tsx` fakes the redirect. Blocked: `/stripe/checkout` needs a Bearer token, but a fresh paid account can't log in (`register` → `requires_otp:false`, yet `login` → 401 "Email verification is pending"). See BACKEND-ISSUES.md for the 3 possible backend fixes.
- ❌ **BENY → Stripe still blocked** — `POST /beny/subscribe` still returns only `{beny_status}`, no checkout URL (re-checked against the live OpenAPI 2026-07-17). The `⚠️ BACKEND BLOCK` comments in [beny-actions.ts](<src/app/member/discounts/beny-actions.ts>) + [beny-section.tsx](<src/app/member/discounts/_components/beny-section.tsx>) stay until it does.

### Known gaps / deferred

- **E-book mode `external` overloads `pdf_url`** (2026-08-31). E-books render in three modes; the mode is **derived, not stored**, because the API has no field for a third-party read link:

    ```
    pdf_url empty              → chapters  → long-form <EbookReader>
    pathname ends with .pdf    → pdf       → <PdfEbookViewer>
    any other http(s) URL      → external  → summary page + “Read More” CTA opening the source site in a new tab
    ```

    Single source of truth: [`src/lib/ebook-mode.ts`](../src/lib/ebook-mode.ts) (`resolveEbookMode`), unit-tested in `ebook-mode.test.ts`. In `external` mode the admin form labels `description` as **Summary** and requires it — it is the whole member-facing page. The admin form refuses to save a `.pdf` link as an external one, so the two can never collide. **Stop-gap** — the proper fix is a dedicated `external_url` field, requested in [BACKEND-ISSUES.md](BACKEND-ISSUES.md). Migrating later touches `resolveEbookMode` plus one field in the admin form, nothing else.

- **External e-books stay readable for every tier by design.** Their landing page is built entirely from the **list** item, never `GET /ebooks/{id}` — the detail endpoint has no `description` (which is the landing body) and `403`s on a locked tier. Locked members get the description plus an "Upgrade to read" CTA in place of the external link.
- **Token refresh not implemented** — access token expires → 401 → forced logout. Wire `POST /auth/refresh` into NextAuth `jwt` callback (refresh_token in session) to auto-rotate.
- **Discounts member DTO** (`GET /discounts/` + `/{id}`) — ✅ `code` + `terms` now returned (member card shows the real copy-code + terms). `value_label` intentionally dropped — `title` already carries the offer text, so no separate field is needed.
- ✅ **SP3 done** — admin discount **edit** (`PATCH /discounts/{id}`, partial merge) wired into `dashboard/(routes)/discounts` (reuses the create dialog; added the missing `action` column, which also revives the previously-unreachable **delete**). **Update 2026-07-09:** `GET /discounts/` + `/{id}` now return **200 for admin** (403 lifted) → the dashboard table **populates from the live list**, and edit prefill now uses a real **`getDiscount(id)`** for backend-listed rows (authoritative title/partner/category/description). `isActive` isn't exposed by list/GET, so it's sent only when known (session record) or the admin toggles it — PATCH's merge preserves the real value otherwise.
- ✅ **SP4 done (partial by design — Stripe-blocked)** — member BENY add-on flow: live `GET /beny/status` drives `BenySection`; `POST /beny/subscribe` (subscribe) + `DELETE /beny/subscribe` (cancel) wired via `member/discounts/beny-actions.ts`. `data/discounts.ts` trimmed to `BENY_CATEGORIES` (dead mock removed).
  - **🐞 BACKEND: BENY subscribe skips Stripe** — PRD §1 requires subscribe to redirect to Stripe Checkout ($4/mo) BEFORE creating the pending record. Live `POST /beny/subscribe` creates `pending_activation` **immediately, no charge, no checkout URL**. Integrated as-is; a `⚠️ BACKEND BLOCK — remove once Stripe is wired` comment marks both [beny-actions.ts](<src/app/member/discounts/beny-actions.ts>) (add the redirect here) and [beny-section.tsx](<src/app/member/discounts/_components/beny-section.tsx>) (the "redirected to secure checkout" copy). **Delete these comments once the backend returns a checkout session.**
  - **🐞 BACKEND: `DELETE /beny/subscribe` 404 on pending — VIOLATES PRD** (re-verified live 2026-07-17 with `red@`, which sits at `pending_activation`):
    ```
    GET    /beny/status     → 200 { "beny_status": "pending_activation" }
    DELETE /beny/subscribe  → 404 { "code": "NOT_FOUND",
                                    "message": "No active BENY subscription found to cancel." }
    ```
    Cancel only matches subs already `active`. **PRD v3.2 is explicit that this is wrong** — *"User bisa **cancel BENY kapan saja** dari dashboard"* and *"user bisa **cancel kapan saja**"*; it never restricts cancel to `active`. PRD also defines the post-cancel behaviour: *"Saat di-cancel, akses BENY berlanjut sampai akhir periode yang sudah dibayar"*. A member who subscribes and then changes their mind is **trapped in `pending_activation`** until an admin activates them — they cannot cancel, cannot back out.
    **Fix:** `DELETE` must accept `pending_activation` (and keep access until the paid period ends). Note the message is also misleading — the subscription **exists**, it just isn't `active` yet, so `NOT_FOUND` is the wrong code.
    **FE follow-up (1 line, blocked on the above):** [beny-section.tsx](<src/app/member/discounts/_components/beny-section.tsx>) renders "Cancel BENY" only for `status === 'active'`; once the backend accepts pending, drop that condition so pending members get the button. Kept hidden for now so members don't hit a 404. Note the section's own copy already promises *"cancel anytime"*, so FE currently contradicts itself.
    ✅ **RESOLVED 2026-07-17** — backend now accepts `pending_activation`; full round-trip re-verified (`cancelled → subscribe → pending → DELETE 200 → cancelled`). FE follow-up shipped: Cancel button now shown for pending members too. **Sprint 2 has no outstanding backend blockers.** Everything else outstanding is Ronde 3 (Stripe/TPAL/upgrade-downgrade).
  - Field name is `name` (not `full_name`). Subscribe returns only `{ beny_status }` (no record id).
  - **🐞 FE bugs found + fixed 2026-07-17** (surfaced once BENY was activated on `red@`, making the first successful cancel possible):
    - **Enum spelling** — the API returns **`"cancelled"`** (AU/British, double L); our type said `'canceled'`. `canSubscribe = status === 'inactive' || status === 'canceled'` was therefore **always false after a cancel** → a cancelled member **could not re-subscribe**, contradicting the PRD and our own "you can re-add it anytime" copy. Type now accepts both spellings via `isBenyCancelled()`.
    - **Cancel DTO** — `DELETE /beny/subscribe` returns `data: { success, message }` (or `null`), **never `beny_status`**. `cancelBeny` was typed `BenyStatusResponse`; only a `?? 'canceled'` fallback hid it (and that fallback then wrote the wrong spelling). Retyped; the action now treats any 2xx as cancelled.
  - Test side effect: `red@` dev account is now `pending_activation` (subscribe worked, DELETE can't clear pending) — admin activation or a backend reset needed to restore it to `inactive`.
- **Dummy leftovers:** member **referral, billing, spin, prizes** still mock. `data/discounts.ts` trimmed to `BENY_CATEGORIES` (static marketing; `getBenyStatus`/`getDiscounts`/`DISCOUNTS` mock removed); `data/member-dashboard.ts` reduced to a session-backed `getCurrentMember`; `data/giveaways.ts` **deleted**.
- ✅ **SP1 done** — member dashboard (`/member`) + giveaways list/detail now live off `memberships/me` + `entries/` + `discounts/` + `giveaways/`. Draw-cycle surface (entry_status, tokens, renewal) sourced from `entries/` current_cycle (never `draw_pass`).
- ✅ **SP2 done** — member e-books: list (`member/ebooks`) off `GET /ebooks/` with per-tier lock badge/upgrade CTA, and the long-form reader (`member/ebooks/[id]`) off `GET /ebooks/{id}` → shared `<EbookReader>` (extracted from the public `(home)/ebooks` page; both now share it). Locked (403) → in-page upgrade gate. Chapter body split on blank lines; CMS cover images render `unoptimized` (host allowlist unknown — add to `next.config` `images.remotePatterns` if optimization wanted). ✅ **Update 2026-07-17:** admin **chapters CRUD** (`POST/PATCH/DELETE /ebooks/{id}/chapters`) is now wired via the chapter-dialog, and **image upload** (`POST /ebooks/presigned-url` → PUT → `download_url`) works end-to-end for covers, chapter feature images, and inline `<img>` in the WYSIWYG body.
- `getCurrentMember()` now reads the session (name/sub_tier/state) with safe defaults — no longer dummy.
- **Paid registration deferred** — register wizard only wires the Visitor path (register → OTP → sign-in). RED/BLUE still flow into the mock spin/checkout screens; `requires_payment`/`spin_available` flags + Stripe checkout land in the next task.
- **No auto-login after OTP** — `verify-otp` returns a session token but it's discarded; the user is sent to `/sign-in`. Wire it into NextAuth (OTP mode) later if auto-login is wanted.
- ✅ **RESOLVED: `GET /admin/members`** now returns 200 with the member list + `meta` pagination (was 400 `BAD_REQUEST`; backend fixed 2026-07-08). Members page + sub-tier stats no longer degrade. See [BACKEND-ISSUES.md](BACKEND-ISSUES.md).
- **Dashboard theme** — `.slr-admin` now uses the member navy palette (`#131619` base) so the dashboard matches the member area; dashboard keeps its own sidebar/shell.
- ✅ **RESOLVED 2026-07-09: admin tier-gate lifted** — `GET /discounts/`, `GET /discounts/{id}`, and `GET /ebooks/{id}` now return **200 for admin** (were all 403). The dashboard Discounts table populates from the live list; admin can GET a discount/ebook to prefill edits (FE follow-up to switch off session records). Remaining: member discount DTO now returns `code` + `terms` (✅); `value_label` dropped (redundant with `title`). Field-name mismatch stands (list snake_case, mutation camelCase). Ebooks: `PATCH` resets unsent numeric fields → FE sends the full object; chapters CRUD ✅ **now wired** (2026-07-17).

- ✅ **RESOLVED: admin state change** — the draw-pool `state` half is changed via **`PATCH /api/v1/users/{id}`** with `{ "state": "NSW" }` (verified 2026-07-10: 200 "User updated.", persists). `change-tier` handles tier/sub-tier; `PATCH /users/{id}` handles state. FE **wired**: state dropdown on the member-detail admin actions → `PATCH /users/{id}`.

- ✅ **RESOLVED: `GET /giveaways/`** now returns 200 (was 500; fixed 2026-07-09). DTOs + mappers in `resources/giveaways.ts` refit to the verified shape; dashboard upcoming + `/member/giveaways` list/detail render live. **Remaining giveaway gaps** (not blockers): payload has **no per-giveaway entry/pool counts** (FE shows the member's cycle tokens as entries; "in pool" hidden), and **no rules/description/TPAL copy** on `/{id}` (FE uses static copy from CLAUDE.md §1 — move to payload/CMS when available). Detail also omits `entry_status`, so the FE merges it from the list item.
- **`memberships/me` shape gaps** — no `state` (session-sourced), no next-payment (derived `activatedAt + 28d` / `entries.current_cycle.end_at`), no BENY (row hidden until SP4). Also see the **entry-engine token bug** below.

- ⚠️ **Seed cycles don't match tier config — and the entry engine is UNVERIFIED** (2026-07-17). `red@` (r4) shows `total_token: 7` and `blue@` (b4) shows `15`, vs a config of 4 for both. **Confirmed by backend: these are seed-script artifacts, not an allocator bug** — the accounts carry placeholder Stripe ids (`sub_seeded_red_123`, portal 400 `No such customer`), have **0 invoices**, and their cycle rows were written **7.56s** after the user row (UUIDv7 timestamps). So the allocator/webhook **never ran**. Consequence: no cycle here was ever created by a real payment, so we have no evidence the allocator reads `token` from config or resets on renewal — **item 4 can't be signed off**. Needs: re-seed to 4/4, plus one Stripe test checkout (`4242…`) to exercise the allocator. Verified-correct so far: 28-day cycle, `draw_pass=4`, no cycle before payment, `change-tier` doesn't mutate live tokens. Full evidence in [BACKEND-ISSUES.md](BACKEND-ISSUES.md).

### Suggested next
`memberships/me` + `giveaways/` (member dashboard) · `ebooks/` (reader) · `auth/refresh` (stop forced logouts) · admin member detail/status/tier.

---

## Full Swagger inventory

Legend: ✅ integrated (called) · 🟡 mapped, not called · ❌ not integrated

| St | Method | Path | Tag | Summary |
|---|---|---|---|---|
| ❌ | GET | `/healthz` | - |  |
| ❌ | GET | `/metrics` | - |  |
| ✅ | GET | `/api/v1/admin/beny/pending` | admin | List pending BENY subscriptions |
| ✅ | POST | `/api/v1/admin/beny/{id}/activate` | admin | Activate a pending BENY subscription |
| ✅ | POST | `/api/v1/admin/csv/generate` | admin | Generate 3 TPAL CSVs → `dashboard/(routes)/draw-exports`. Returns `data.files[{tier,filename,row_count,download_url}]`. 🔴 **exporter emits 1 row/member with `total_token` as a column** — PRD needs 1 row *per token*; see BACKEND-ISSUES.md |
| ✅ | GET | `/api/v1/admin/csv/history` | admin | CSV audit history → `dashboard/(routes)/draw-exports` table. Flat array `{id,tier,filename,row_count,generated_at,download_url}`, newest first, no `meta`. `download_url` is **re-signed on every read** (verified) → links always fresh ~1h from page load |
| ✅ | GET | `/api/v1/admin/dashboard` | admin | Admin dashboard overview and metrics |
| ❌ | POST | `/api/v1/admin/members/{userId}/adjust-draw-pass` | admin | Adjust active cycle draw passes |
| ✅ | PUT | `/api/v1/admin/members/{userId}/status` | admin | Update member status (ACTIVE, SUSPENDED, DEACTIVATED) |
| ❌ | PUT | `/api/v1/admin/members/{userId}/tier` | admin | Update member tier config (base tier only; ignores state/sub_tier — **superseded by `/memberships/change-tier`** for admin tier control) |
| ✅ | GET | `/api/v1/admin/members/{userId}` | admin | Get detailed member profile and history. Returns `dob` (undeclared in its OpenAPI schema) but **omits `pay_id_email`**, which PUT can write — that field is unreadable after save |
| ✅ | PUT | `/api/v1/admin/members/{userId}` | admin | Update member profile details (full_name, email, phone, state, dob, pay_id_email) → member-detail **Edit profile** card. Merge semantics; `phone` unvalidated server-side |
| ✅ | GET | `/api/v1/admin/members` | admin | List all members with filters and pagination. Params are undeclared in OpenAPI — `tier`/`search`/`page`/`per_page` verified working. ⚠️ `status` filters correctly for `active`/`suspended` but **400s on `pending_payment`** (28 of 76 live members) and **500s on `deactivated`**, so the Members page filters status client-side instead — see BACKEND-ISSUES.md |
| ❌ | GET | `/api/v1/audit/` | audit | Admin: query audit log (filter + cursor or page) |
| ✅ | POST | `/api/v1/auth/forgot-password` | auth | Request password reset email |
| ✅ | POST | `/api/v1/auth/login` | auth | Login with email + password |
| 🟡 | POST | `/api/v1/auth/logout` | auth | Logout (revokes current session) |
| ✅ | GET | `/api/v1/auth/me` | auth | Current user profile |
| 🟡 | POST | `/api/v1/auth/refresh` | auth | Rotate refresh token, get a new access token |
| ✅ | POST | `/api/v1/auth/register` | auth | Register a new user |
| ✅ | POST | `/api/v1/auth/resend-otp` | auth | Resend OTP code |
| ✅ | POST | `/api/v1/auth/reset-password` | auth | Confirm password reset with token |
| ✅ | POST | `/api/v1/auth/verify-otp` | auth | Verify OTP code |
| ✅ | POST | `/api/v1/auth/change-password` | auth | Authenticated password change → `member/profile` Security card (added 2026-07-21) |
| ✅ | GET | `/api/v1/beny/status` | beny | Get current user BENY status → `member/discounts` BenySection |
| ✅ | DELETE | `/api/v1/beny/subscribe` | beny | Cancel BENY subscription. 🐞 **404 `NOT_FOUND` on `pending_activation`** — active-only, but PRD says *"cancel kapan saja"* → **PRD violation**, the last Ronde 2 blocker |
| ✅ | POST | `/api/v1/beny/subscribe` | beny | Subscribe to BENY add-on (⚠️ no Stripe charge — see blockers) |
| ✅ | GET | `/api/v1/billing/invoices` | billing | Get billing invoice list → `/account` payment history (`data` = invoice array + `meta`) |
| ❌ | POST | `/api/v1/billing/pay-manual` | billing | Pay manual for grace period invoice |
| ✅ | GET | `/api/v1/billing/status` | billing | Get current billing status → `/account` + `/payment/success` activation poll (`billing_status`/`next_renewal_at`) |
| ✅ | GET | `/api/v1/discounts/` | discounts | List partner discounts (RED/BLUE + **admin now 200**, was 403) |
| ✅ | POST | `/api/v1/discounts/` | discounts | Admin: create discount |
| ✅ | DELETE | `/api/v1/discounts/{id}` | discounts | Admin: delete discount |
| 🟡 | GET | `/api/v1/discounts/{id}` | discounts | Get discount details (`getDiscount` mapped; not called — member DTO thin. **admin now 200**, was 403) |
| ✅ | PATCH | `/api/v1/discounts/{id}` | discounts | Admin: update discount → `dashboard/(routes)/discounts` edit (partial merge) |
| ✅ | GET | `/api/v1/ebooks/` | ebooks | List published ebooks with is_locked properties |
| ✅ | POST | `/api/v1/ebooks/` | ebooks | Admin: create ebook |
| ✅ | DELETE | `/api/v1/ebooks/{id}/chapters/{chapterId}` | ebooks | Admin: delete chapter → `dashboard/(routes)/ebooks` |
| ✅ | PATCH | `/api/v1/ebooks/{id}/chapters/{chapterId}` | ebooks | Admin: update chapter → chapter-dialog (needs chapter `id` from `GET /ebooks/{id}`) |
| ✅ | POST | `/api/v1/ebooks/{id}/chapters` | ebooks | Admin: create chapter → chapter-dialog |
| ✅ | DELETE | `/api/v1/ebooks/{id}` | ebooks | Admin: delete ebook |
| ✅ | GET | `/api/v1/ebooks/{id}` | ebooks | Get ebook content and chapters if unlocked → `member/ebooks/[id]` reader. Below-tier member → 403 gate; **admin now 200** (was 403; fixed 2026-07-09) |
| ✅ | PATCH | `/api/v1/ebooks/{id}` | ebooks | Admin: update ebook |
| ✅ | GET | `/api/v1/entries/` | entries | Get my entry history grouped by billing cycles |
| ✅ | GET | `/api/v1/giveaways/` | giveaways | List active giveaways based on member tier (✅ 200; DTO verified 2026-07-09) |
| ✅ | GET | `/api/v1/giveaways/winners` | giveaways | List past giveaway winners |
| ✅ | GET | `/api/v1/giveaways/{id}` | giveaways | Get detailed giveaway information (meta + winners; entry status merged from list) |
| ❌ | GET | `/api/v1/health/livez` | health | Liveness probe |
| ❌ | GET | `/api/v1/health/readyz` | health | Readiness probe (DB + Redis) |
| ✅ | POST | `/api/v1/memberships/change-tier` | membership | Admin: change user's tier/sub-tier (state NOT changed) |
| ✅ | GET | `/api/v1/memberships/me` | membership | My membership → `member/page.tsx` summary (shape == `MembershipRecord`; no state/next-payment/BENY) |
| ✅ | GET | `/api/v1/memberships/stats` | membership | Member counts grouped by **sub-tier** (NOT tier+state — OpenAPI drift) → `dashboard/(routes)/members` |
| ✅ | GET | `/api/v1/memberships/tiers` | membership | Active membership tiers |
| ❌ | DELETE | `/api/v1/memberships/upgrade` | membership | Cancel scheduled pending upgrade/downgrade |
| ❌ | POST | `/api/v1/memberships/upgrade` | membership | Upgrade or downgrade membership tier (Paid -> Paid scheduling) |
| ✅ | GET | `/api/v1/notifications/` | notifications | Get my in-app notifications |
| ❌ | GET | `/api/v1/notifications/admin/logs` | notifications | Admin: list sent notification delivery logs |
| ❌ | POST | `/api/v1/notifications/admin/send` | notifications | Admin: send manual email notification |
| ✅ | PUT | `/api/v1/notifications/{id}/read` | notifications | Mark notification as read |
| ❌ | GET | `/api/v1/payments/` | payments | Admin: list payments |
| ❌ | GET | `/api/v1/payments/me` | payments | My payments/invoice list |
| ❌ | GET | `/api/v1/payments/{id}` | payments | Admin: payment detail |
| ❌ | GET | `/api/v1/referral/` | referral | Get referral details and reward history |
| ❌ | POST | `/api/v1/referral/validate` | referral | Validate referral code before submission |
| ❌ | POST | `/api/v1/spin/execute` | spin | Spin the wheel (one-time or pre-renewal) |
| ❌ | GET | `/api/v1/spin/status` | spin | Check spin wheel status and availability |
| ✅ | POST | `/api/v1/stripe/checkout` | stripe | Create Stripe Checkout session → `/account` Visitor→RED/BLUE upgrade (verified live: `{url, sessionId}`). **Register-flow wiring still blocked** — see BACKEND-ISSUES.md |
| ✅ | POST | `/api/v1/stripe/portal` | stripe | Create Stripe Billing Portal session → `/account` Manage Billing (400 on seed customers; real members get a URL) |
| ❌ | POST | `/api/v1/webhooks/stripe/` | stripe | Stripe webhook (signature-verified, raw body) |
| ❌ | GET | `/api/v1/subscriptions/` | subscriptions | Admin: list subscriptions |
| ❌ | POST | `/api/v1/subscriptions/me/cancel` | subscriptions | Cancel my subscription at period end |
| ❌ | GET | `/api/v1/subscriptions/me` | subscriptions | My subscriptions |
| ❌ | GET | `/api/v1/subscriptions/{id}` | subscriptions | Admin: subscription detail |
| ❌ | GET | `/api/v1/users/` | users | Admin: list users (filter/sort/search/cursor) |
| ✅ | PATCH | `/api/v1/users/me` | users | Self-service profile → `member/profile` (name, phone, dob). Keys `fullName \| phone \| state \| dob`; `dob` accepted since 2026-07-21 |
| ❌ | GET | `/api/v1/users/{id}` | users | Read one user (self or admin) |
| ✅ | PATCH | `/api/v1/users/{id}` | users | Admin: update user → member-detail **Draw-pool state** control (`{state}`, verified) |

_Generated 2026-07-03. Regenerate the table from `…/docsx-2s3crt3-199/json` when the API changes._
