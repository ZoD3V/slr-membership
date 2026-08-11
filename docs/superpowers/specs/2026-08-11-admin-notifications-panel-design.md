# Admin Notifications Panel — Design Spec

**Date:** 2026-08-11
**Sprint:** 4 (Ronde 4)
**Status:** approved, ready for planning

---

## 1. Goal

Ship the last unbuilt Sprint 4 admin surface: a Notifications panel at
`/dashboard/notifications` covering the three sub-resources the backend
exposes — email/SMS templates, delivery logs, and manual send.

Secondary: re-enable the Tier filter on `/dashboard/spin`, which was shipped
disabled because `?tier=` used to 500 and no longer does.

---

## 2. Live API state (verified 2026-08-11 01:02 UTC, production, read-only)

The backend renamed all three admin notification routes between
2026-08-10 and 2026-08-11. `info.version` was not bumped, so the rename was
only caught by diffing OpenAPI snapshots.

| Operation | Path | Live |
| --- | --- | --- |
| List templates | `GET /api/v1/admin/notifications/templates` | 500 |
| Update template | `PUT /api/v1/admin/notifications/templates/{template_id}` | untested (list is 500) |
| List logs | `GET /api/v1/admin/notifications/logs` | 500 |
| Manual send | `POST /api/v1/admin/notifications/send` | untested (needs a `template_id`) |

Removed in the same deploy: `/admin/notification-templates`,
`/admin/notification-logs`, `/notifications/admin/logs`,
`/notifications/admin/send`. The FE never referenced any of them, so the
rename caused no breakage.

`GET /admin/notifications/logs` previously answered 200 with 44 real rows at
its old path. Its 500 is therefore a regression, filed in
`docs/BACKEND-ISSUES.md`.

**Consequence for this build:** the same build-ahead-of-backend posture used
for Prizes, Safe Hours and Spin applies here. Every read gets a seed fallback
plus an honest banner; no UI copy may claim the endpoint does not exist.

### 2.1 Contract shapes (from the OpenAPI spec, not guessed)

```jsonc
// GET /admin/notifications/templates → data: Template[]
{
  "id": "string",            // NOTE: `id`, not `template_id`
  "type": "string",
  "channel": "string",       // present on templates, absent from the PUT body
  "subject": "string",
  "body": "string",
  "is_active": true,
  "updated_at": "string"     // required, non-nullable
}

// PUT /admin/notifications/templates/{template_id} → data: Template
// body — all three optional, additionalProperties: false
{ "subject": "string (max 255)", "body": "string", "is_active": true }

// GET /admin/notifications/logs → data: LogRow[], meta: pagination
{
  "id": "string",
  "user_id": "string",
  "email": "string",
  "channel": "string",
  "type": "string",
  "template_id": "string | null",   // ADDED by backend since the last audit
  "status": "string",
  "provider": "string",
  "error": "string | null",
  "sent_at": "string"
}
// query params: user_id, type, status (enum sent|failed|pending), page, per_page (max 100)

// POST /admin/notifications/send → data
{ "queued": 0, "skipped": 0 }
// body — user_ids (1..100) and template_id required; channel enum email|sms, default email
```

`subject` is still absent from the log row; that ask stays open in
`docs/BACKEND-ISSUES.md` and this panel does not depend on it.

### 2.2 Values observed in production

From the 44 log rows readable before the rename:

- `type`: `welcome` (27), `otp` (12), `password_reset` (5)
- `status`: `sent` (44) — `failed` and `pending` never observed
- `channel`: `email` (44) — `sms` never observed
- `provider`: `google-smtp` (44)
- `error`: `null` (44)

The spec types `type` as a bare string with no enum. The FE therefore treats
these three as the *known* set for building filter options, and renders any
unknown value verbatim rather than dropping or crashing on it.

---

## 3. Architecture

Follows the established admin-panel shape exactly — the same one used by
Prizes, Safe Hours and Spin:

```
src/app/dashboard/(routes)/notifications/
  page.tsx                     Server Component: token, fetch, seed fallback, tab routing
  loading.tsx                  Skeleton, matching siblings
  seed.ts                      Placeholder templates + empty log meta
  actions.ts                   'use server' mutations
  templates-client.tsx         Tab 1
  logs-client.tsx              Tab 2
  send-client.tsx              Tab 3
  _components/
    template-edit-dialog.tsx   Subject / body / is_active editor
    log-columns.tsx            DataTable column defs
    recipient-picker-dialog.tsx  Multi-select member picker (max 100)
```

Supporting changes:

- `src/lib/api/endpoints.ts` — four paths under `API.admin`
- `src/lib/api/resources/notifications-admin.ts` — **new file**, admin-only.
  Deliberately separate from the existing `notifications.ts`, which is the
  member-facing bell panel: different audience, different auth, no shared
  code. This mirrors how `spin-admin.ts` sits beside `spin.ts`.
- `src/types/member.ts` — the types below
- `src/components/ui/nav-main.tsx` — sidebar entry

### 3.1 Types

```ts
export type NotificationChannel = 'email' | 'sms';
export type NotificationLogStatus = 'sent' | 'failed' | 'pending';

/** The three values production has actually emitted. The API types `type` as
 *  a bare string, so unknown values must still render. */
export const KNOWN_NOTIFICATION_TYPES = ['welcome', 'otp', 'password_reset'] as const;
export type KnownNotificationType = (typeof KNOWN_NOTIFICATION_TYPES)[number];

export interface NotificationTemplate {
    id: string;
    type: string;
    channel: string;
    subject: string;
    body: string;
    is_active: boolean;
    updated_at: string;
}

export interface NotificationTemplateUpdatePayload {
    subject: string;
    body: string;
    is_active: boolean;
}

export interface NotificationLogRow {
    id: string;
    user_id: string;
    email: string;
    channel: string;
    type: string;
    template_id: string | null;
    status: string;
    provider: string;
    error: string | null;
    sent_at: string;
}

export interface NotificationLogMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

export interface NotificationSendPayload {
    user_ids: string[];
    template_id: string;
    channel: NotificationChannel;
}

export interface NotificationSendResult {
    queued: number;
    skipped: number;
}
```

### 3.2 Data flow

`page.tsx` reads `searchParams` for `tab`, `type`, `status`, `page`, and
`user_id`, then fetches templates and logs concurrently via
`Promise.allSettled`. Rejections are passed to `handleApiAuthError` **before**
any fallback runs, so an expired admin session forces a logout instead of
being silently rendered as seed data. This ordering is load-bearing and is
copied from `spin/page.tsx`.

Templates fall back to `NOTIFICATION_TEMPLATES_SEED` with
`isTemplatesPlaceholder = true`. Logs fall back to an empty array with
`logsFailed = true`, which the table renders as a distinct "couldn't load"
state — never as the factual claim "no notifications sent yet".

---

## 4. Tabs

Tab state lives in the URL as `?tab=templates|logs|send`, defaulting to
`templates`. Filters and pagination are URL state too, so a filtered view is
shareable and reloadable — matching `winners/page.tsx` and `spin/page.tsx`.

### 4.1 Templates

A card per template showing type, channel, subject, an active/inactive badge,
and a truncated body preview. **Edit** opens a dialog with:

- `subject` — Input, required, max 255
- `body` — Textarea, required, monospace, ~12 rows
- `is_active` — Switch, with a one-line explanation that turning it off stops
  that notification from being sent at all

Saving calls `PUT`, and on success re-seeds the form from the returned
template — the same `form.reset(toFormValues(result.data))` discipline the
other three panels use, so a server-clamped value can't leave the form
permanently dirty.

The seed carries the three observed types (`welcome`, `otp`,
`password_reset`) with placeholder copy, so the layout and the edit dialog are
reviewable while the endpoint 500s.

### 4.2 Logs

`DataTable` in `serverSide` mode. Columns: Recipient (email + `user_id`
truncated), Type, Channel, Status, Provider, Sent at, and a Resend action.

Filters: `type` (the three known values plus All) and `status` (`sent` /
`failed` / `pending` plus All). Changing either resets to page 1.

Status renders as a coloured badge — `sent` green, `failed` red, `pending`
amber. A `failed` row exposes its `error` string in a tooltip. Because
production has never produced a `failed` row, this path is built from the
contract and flagged as unverified in the ledger.

**Resend** navigates to `?tab=send` carrying the row's `user_id` and, when
`template_id` is non-null, its template. When `template_id` is null the Send
tab opens with the recipient prefilled and the template left for the admin to
choose — the button is never disabled and never silently no-ops.

### 4.3 Send

Three inputs plus a confirm step:

1. **Recipients** — a multi-select dialog over `getAdminMembers`, modelled on
   `winners/_components/member-picker-dialog.tsx` (debounced search, DataTable,
   state filter) but multi-select with checkboxes. `MemberPickerDialog` itself
   is *not* reused: it is single-select and coupled to draw-pool eligibility.
   Selected recipients render as removable chips. A live counter shows
   `n / 100`; passing 100 blocks further selection with an inline explanation.
2. **Template** — Select over the loaded templates. Inactive templates are
   listed but marked, since sending one is likely a mistake.
3. **Channel** — Select, `email` or `sms`, default `email`. SMS is marked
   "not yet verified in production" because no SMS log row has ever existed.

Submit is disabled until at least one recipient and a template are chosen.
A confirmation dialog restates the recipient count and template before firing,
because this action emails real members and cannot be undone.

On success the toast reports the API's own numbers — "Queued 12, skipped 3" —
rather than asserting delivery. A non-zero `skipped` renders an inline note
that the API skipped some recipients without saying why, since the contract
gives no reason field.

---

## 5. Validation

Zod schemas, matching the contract's own limits:

- Template edit: `subject` non-empty, max 255; `body` non-empty;
  `is_active` boolean
- Send: `user_ids` min 1, max 100; `template_id` non-empty; `channel` enum

The 100 cap is enforced in the picker (blocking selection) *and* in the
schema, so a stale client can't post 101.

---

## 6. Spin Tier filter re-enable

`?tier=` now answers 200 and correctly discriminates sub-tiers — verified
across all seven ids plus the marketing names and `RED`/`red`:

| `?tier=` | rows | | `?tier=` | rows |
| --- | --- | --- | --- | --- |
| `r1` | 1 | | `b1` | 2 |
| `r4` | 1 | | `b4` | 4 |
| `r7` | 7 | | `b7` | 4 |
| | | | `b10` | 10 |

Three changes revert the workaround shipped on 2026-08-10:

- `spin/page.tsx` — read `searchParams.tier` again instead of hardcoding
  `'all'`, and forward it to `getAdminSpinHistory`
- `spin-history-client.tsx` — drop `disabled` and the explanatory `title`
- Delete the three comment blocks that reference the 500

The response body still returns bare marketing names (`"tier": "Plus"`), so a
filtered row still can't be read as RED or BLUE at a glance. That is a
separate backend ask and is explicitly **not** worked around here.

An unknown `?tier=` value must not be forwarded: the API answers
`200 { data: [] }` for garbage rather than a validation error, which would
render as "no spins" for a typo. `page.tsx` validates against the seven known
ids and falls back to `'all'`.

---

## 7. Out of scope

- Anything depending on log `subject` — still absent from the contract
- SMS-specific UI beyond the channel selector — no SMS row has ever existed
- Member-facing notification preferences — not in Sprint 4
- Retro-fitting `sub_tier_id` display; blocked on the backend response change

---

## 8. Testing

Type-check and lint via `npx tsc --noEmit` and `npx eslint <changed paths>`
(`npm run lint` is broken in this repo and `npm run format` is unscoped —
use `npx prettier --write` on own files only).

Because all reads 500, verification is: seed rendering, banner copy, filter
and pagination URL behaviour, the 100-recipient cap, the confirm dialog, and
that a rejected fetch renders the failure state rather than an empty state.
Live-endpoint verification is deferred until the backend 500s are fixed and
is tracked as an open item, not claimed as done.
