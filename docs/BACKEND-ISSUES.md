# SLR API — Backend Issues (frontend handoff)

Endpoints that return errors or behave against the PRD, found while integrating the member/admin frontend. Each entry lists the route with its **Smart Life Rewards API** summary title, the login account used, and a real example request + response.

- **Base URL:** `https://api.smartliferewards.com.au/api/v1`
- **Swagger:** `https://api.smartliferewards.com.au/docsx-2s3crt3-199`
- **Captured:** 2026-07-08 · **Re-verified:** 2026-07-17
- **Envelope:** every response is `{ success, message, data, meta }`.

> **Reading order.** The **Sprint 3 (Ronde 3)** section directly below is the active sprint (Giveaway, Stripe, pembayaran). Sprint 2 follows it (CLEAR — no blockers). Everything after that is older history.

---

# 🔧 SPRINT 3 (Ronde 3) — Laporan & Pertanyaan untuk Backend

**Base:** `https://api.smartliferewards.com.au/api/v1` · Diverifikasi 2026-07-24 (Jum 13:21 AEST), akun `red@`
Legend: ✅ = dites live 2026-07-24 · 📄 = dari kontrak/handoff sebelumnya

## A. 🔴 BLOCKER — Sprint 3 tidak bisa selesai penuh tanpa ini

### A1. Registrasi tier berbayar tidak bisa sampai Stripe Checkout — ✅ RESOLVED 2026-07-26

> ✅ **RESOLVED 2026-07-26 (verified live).** `POST /auth/register` (paid) kini mengembalikan `access_token` + `refresh_token` langsung (`requires_otp:false, requires_payment:true`), **dan** `POST /auth/login` juga 200 + token. Register→checkout tidak lagi terblokir. Wiring checkout di register-wizard (`step-checkout.tsx`) jadi slice FE terpisah berikutnya. Laporan asli di bawah.

Blocker utama sprint (*register RED/BLUE harus jalan penuh sampai transaksi*).

```json
// POST /api/v1/auth/register
{ "full_name":"FE Test","email":"throwaway@example.com","password":"Secret123!",
  "state":"VIC","phone":"+61400000000","dob":"1990-01-01","tier":"red","sub_tier":"r4" }
→ 201 { "success":true, "data":{ "user_id":"019f6e1b-…",
        "requires_otp":false, "requires_payment":true, "spin_available":true } }   // tanpa token

// POST /api/v1/auth/login  (kredensial sama, langsung setelahnya)
{ "email":"throwaway@example.com","password":"Secret123!" }
→ 401 { "success":false, "code":"UNAUTHORIZED",
        "message":"Email verification is pending. Please verify your OTP to activate your account." }
```

`register` mengembalikan `requires_otp:false` **dan tanpa token**, tapi `login` menolak dengan alasan OTP. Karena `/stripe/checkout` butuh Bearer token, user paid baru **tidak punya cara mendapat token** → checkout tak terjangkau.

**Pertanyaan — pilih satu:** (1) izinkan akun paid **login walau belum verifikasi** (verifikasi via Stripe, sesuai PRD); atau (2) kembalikan **access token / checkout URL langsung dari `register`** saat `requires_payment:true`; atau (3) konfirmasi paid **memang butuh OTP** → perbaiki `register` jadi `requires_otp:true` (bertentangan dengan PRD → perlu keputusan produk).

### A2. `GET /memberships/me` tidak mengembalikan `pending_upgrade` — ✅ RESOLVED 2026-07-26

> ✅ **RESOLVED 2026-07-26 (verified live).** `GET /memberships/me` kini mengembalikan `pending_upgrade: { target_sub_tier, effective_at } | null`. FE sudah pakai sumber ini — banner "terjadwal" persisten lintas reload (bukan optimistic-only lagi). Laporan asli di bawah.

Dibuktikan live. Jadwalkan r4→r7, lalu baca `me`:

```json
// POST /api/v1/memberships/upgrade  { "targetSubTierId":"r7" }
→ 200 { "success":true, "message":"Upgrade scheduled for next renewal",
        "data":{ "target_sub_tier":"r7", "effective_at":"2026-07-30T05:20:22.145Z" },
        "meta":{ "status":"scheduled" } }

// GET /api/v1/memberships/me  (tepat setelah dijadwalkan)
→ 200 { "data":{ "subTierId":"r4", "billingStatus":"ACTIVE", "pendingBonusNextCycle":0 } }
        // tidak ada field pending_upgrade sama sekali

// DELETE /api/v1/memberships/upgrade → 200 "Pending upgrade cancelled."  (akun dikembalikan)
```

**Dampak:** setelah refresh halaman, FE tak punya sumber untuk menampilkan "perubahan terjadwal ke r7 pada 30 Jul" atau tombol "Batalkan perubahan terjadwal". Kontrak §5 (`GET /me`) sudah mencantumkan `pending_upgrade`; live `/memberships/me` tidak.

**Permintaan:** tambahkan `pending_upgrade: { target_sub_tier, effective_at } | null` pada `GET /api/v1/memberships/me` (sesuai kontrak §5).

### A3. `GET /billing/invoices` `hosted_invoice_url` — 🟡 backend bilang sudah ditambah 2026-07-26 (FE wired, belum bisa live-verify)

> 🟡 **UPDATE 2026-07-26.** Backend menyatakan `hosted_invoice_url` sudah ada di `GET /billing/invoices`. **Belum bisa dikonfirmasi live**: field belum muncul di OpenAPI publik (kemungkinan schema drift / belum ke-regenerate), dan tak ada akun test dengan invoice berbayar (`red@` = 0 invoice). FE sudah wire tombol **"View"** di tabel payment-history `/member/membership` secara defensif (field opsional + guard) → otomatis muncul begitu ada invoice nyata. **Ask:** regenerate OpenAPI + sediakan 1 invoice test untuk verifikasi. Laporan asli di bawah.

DTO invoice live: `{ invoice_id, amount_cents, discount_cents, stripe_invoice_id, paid_at, type }` — tanpa `hosted_invoice_url`. Catatan client: *tombol download invoice diarahkan ke `hosted_invoice_url` dari Stripe (jangan generate PDF sendiri)*. FE tak bisa memasang tombol download tanpa field ini.

**Permintaan:** tambahkan `hosted_invoice_url` pada tiap invoice di `GET /api/v1/billing/invoices` (dan simpan ke `payments`, lihat B1). Akun seed juga `data:[]` (0 invoice) → belum bisa dites sampai ada pembayaran nyata (lihat C3).

### A4. 🔴 Webhook `checkout.session.completed` TIDAK mengaktivasi — bayar sukses, member tetap inactive ✅

**Captured 2026-07-26 via real Stripe test payment.** Blocker paling kritikal Sprint 3 — lebih dalam dari A1.

**Repro (end-to-end):**
1. `POST /auth/register` (paid red/r4, throwaway `fe-stripe-test-1785041074@example.com`) → 201 + `access_token` ✅ (A1 fixed).
2. `POST /stripe/checkout {tier:"RED"}` → `200 { url, sessionId: "cs_test_b1PxwF2SgOIrdiMElP2j2cw4Fzn3sHOnaIUdByOP1JdElrwKJgl3Z7rqRA" }` ✅.
3. Bayar kartu test `4242 4242 4242 4242` di hosted checkout → **sukses**, redirect ke `…/payment/success?session_id=cs_test_b1PxwF2…` (Stripe konfirmasi bayar).
4. **Poll `GET /billing/status` 12× / ~48 detik → SELALU `inactive`.** State akhir:

```json
GET /billing/status     → { "billing_status":"inactive", "next_renewal_at":null, "grace_period":null, "stripe_subscription_id":null }
GET /billing/invoices   → { "data": [] }          // 0 invoice
GET /entries/           → { "current_cycle": null }
GET /memberships/me     → { "subTierId":"r4", "billingStatus":"INACTIVE" }
```

**Dampak:** Stripe menerima pembayaran, tapi backend tidak pernah tahu → member **bayar tapi dapat nol**: tak diaktivasi, tak dapat token/draw_pass, tak masuk pool undian, tak ada invoice. Ini menggagalkan **seluruh** alur berbayar Sprint 3 (headline).

**Expected (Kontrak §12):** `checkout.session.completed` → aktifkan akun, assign token + 4 draw_pass, set exact-time billing, generate referral code, buat invoice row.

**Ask (mohon telusuri di Stripe Dashboard):**
1. Cek webhook endpoint `POST /api/v1/webhooks/stripe/` terdaftar di Stripe Dashboard (test mode) → Developers → Webhooks.
2. Cari event untuk session `cs_test_b1PxwF2…` → lihat **delivery attempts** + response code (200? 4xx/5xx? signature error?).
3. Pastikan handler `checkout.session.completed` benar-benar mengaktivasi + membuat cycle/invoice.

**Catatan:** memblokir verifikasi **A3** (`hosted_invoice_url` — invoice tak pernah dibuat) dan **C4** (allocator paid — cycle tak pernah dibuat). Sekali webhook jalan, ketiganya bisa diverifikasi dalam 1 pembayaran. Akun `fe-stripe-test-1785041074@example.com` siap dipakai backend untuk trace (aman dipurge).

### A5. 🔴 Harga di Stripe Checkout tampil **IDR**, bukan **AUD** ✅

**Captured 2026-07-26** saat test payment. Di halaman hosted Stripe Checkout, harga muncul dalam **IDR**. Project ini **khusus Australia** — CLAUDE.md/PRD: semua nominal **AUD** (integer cents).

**Root cause (backend/Stripe config):** object **Price/Product di Stripe dibuat dengan `currency: idr`**, bukan `aud`. FE tidak bisa memperbaiki ini — hosted Checkout memakai currency dari Price object; FE hanya kirim `{ tier }` lalu redirect.

**Dampak:** pelanggan AU melihat + ditagih dalam IDR; ladder harga AUD ($10/$20/$30/$26/$39/$52/$65) tidak terpetakan benar. Salah mata uang = salah tagih.

**Ask:**
1. Buat ulang Stripe **Product/Price per sub-tier dalam `aud`** (r1=$10, r4=$20, r7=$30, b1=$26, b4=$39, b7=$52, b10=$65 → integer cents AUD).
2. Pastikan Checkout Session line items mereferensikan Price **AUD** yang benar per `tier`/`sub_tier`.
3. Pastikan `payments.currency` (client note B1) menyimpan `aud`.

## B. 🟠 WAJIB DIKERJAKAN DULU DI BACKEND (tidak ada UI, prioritas awal) 📄

### B1. Metadata Stripe — tidak bisa di-backfill, pasang di awal sprint

Saat **create Customer + Checkout Session**, sertakan `metadata`: `user_id, full_name, email, phone, state, tier, sub_tier`. Simpan balikan Stripe ke `payments`: `stripe_invoice_id, hosted_invoice_url, currency, payment_method_brand, payment_method_last4, sub_tier_snapshot, state_snapshot`.

⚡ Kalau baru dipasang di tengah/akhir sprint, transaksi yang sudah jalan **tidak bisa di-backfill**. Body FE `/stripe/checkout` tetap `{tier, couponId?}` — metadata diambil backend dari user login → **tidak ada perubahan FE**; mohon konfirmasi kontrak tetap.

### B2. Webhook wajib menangani perubahan dari luar aplikasi

Client kelola billing langsung dari Stripe dashboard → **tidak perlu UI billing khusus di admin**. Konsekuensinya webhook wajib menangani:

| Event | Aksi wajib |
|---|---|
| `customer.subscription.deleted` | membership → inactive, **`draw_pass = 0`** (termasuk saat admin cancel langsung di Stripe) |
| `customer.subscription.updated` | sinkron plan/pause/resume → update tier/status di DB |
| `charge.refunded` | catat refund di `payments`, evaluasi ulang status membership |

🔴 **Risiko kalau tidak:** admin cancel di Stripe → web tidak tahu → member yang berhenti bayar **tetap masuk CSV undian**.

### B3. 🔴 CSV TPAL: 1 baris per member, token jadi kolom (bukan baris berulang) 📄

```csv
// POST /api/v1/admin/csv/generate
id,email,full_name,state,phone,total_token
019f2145-…,red@smartliferewards.com.au,SLR Red Paid Member,VIC,+61400000004,7
```

`row_count`: red=1, blue=2, visitor=8 (masing-masing 1 baris). PRD: *token* = **jumlah baris/entry** per giveaway. randomdraws.com pilih **1 baris acak** → semua member peluangnya sama; R1 (1 token) = B10 (10 token) → **ladder token/harga tidak berfungsi**.

**Pertanyaan — konfirmasi satu:** (1) ulang tiap member sebanyak `total_token` (1 baris per token) → perbaiki exporter; atau (2) randomdraws.com baca `total_token` sebagai **bobot** → dokumentasikan. Juga konfirmasi exporter memfilter `draw_pass > 0`.

## C. 🟡 GAP VERIFIKASI (menghambat sign-off / tes live, bukan build)

### C3. Akun seed pakai Stripe sub palsu → cancel / grace / invoice belum bisa dites ✅

```
GET /api/v1/billing/status (red@) → { "billing_status":"active", "stripe_subscription_id":"sub_seeded_red_123", "grace_period":null }
GET /api/v1/subscriptions/me     → [ { "id":"019f2145-…","status":"ACTIVE","currentPeriodEnd":"2026-07-30T05:20:21.667Z" } ]
```

`sub_seeded_red_123` / `cus_seeded_red_123` = placeholder → `POST /stripe/portal` = 400 "No such customer". Jadi **`POST /subscriptions/me/cancel`** (cancel akhir periode) dan **`POST /billing/pay-manual`** (grace) **tidak bisa diverifikasi** di seed. (Cancel sengaja tidak dipanggil live agar akun dev tak tertinggal status cancelling.)

**Permintaan:** sediakan ≥1 customer Stripe **test** (kartu `4242…`) di akun dev untuk menguji cancel-subscription + grace-pay + list invoice. Juga dibutuhkan untuk C4.

### C4. Allocator entry jalur paid belum pernah dieksekusi; token seed salah 📄

| Akun | sub_tier | config token | seed `total_token` | |
|---|---|---|---|---|
| red@ | r4 | 4 | **7** | ❌ |
| blue@ | b4 | 4 | **15** | ❌ |

Artefak seed-script (0 invoice, sub palsu, cycle ditulis 7.56s setelah row user → allocator/webhook tak pernah jalan). Allocator Visitor terbukti benar via signup+OTP baru; jalur **paid belum terbukti**.

**Permintaan:** (1) re-seed red@/blue@ ke 4/4; (2) 1 checkout Stripe test nyata → pastikan `current_cycle.total_token == config sub_tier` (r4⇒4); (3) konfirmasi renewal **mereset** token+draw_pass (tidak akumulatif).

## D. 🟢 DRIFT KONTRAK / DATA KURANG (FE menyesuaikan; mohon konfirmasi)

### D1. Endpoint upgrade — drift kontrak vs live ✅

| | Kontrak §4 | Live (dipakai FE) |
|---|---|---|
| Path | `POST /membership/upgrade` | `POST /memberships/upgrade` |
| Body | `{ target_sub_tier }` (snake) | `{ targetSubTierId }` (camel) |
| Response `data` | `{ status, pending_upgrade:{…} }` | `{ target_sub_tier, effective_at }` + `meta.status:"scheduled"` |
| Downgrade | endpoint terpisah `/membership/downgrade` | **tidak ada** — 1 endpoint, arah dari target |

**Pertanyaan:** konfirmasi versi **live** kanonik + update kontrak; konfirmasi 1 endpoint menangani upgrade & downgrade.

### D2. Detail giveaway tidak lengkap vs kontrak ✅

`GET /api/v1/giveaways/{id}` → key `data`: `closes_at, draws_at, giveaway_id, name, opens_at, prize, tier, type, winners`. Tidak ada `rules`, `tpal_cert_note`, `entry_count`/jumlah pool, `entry_status`. Kontrak §6: detail harus berisi *"hadiah, aturan, TPAL cert note, entry history, past winners"*.

**Permintaan:** tambahkan `rules`, `tpal_cert_note`, `entry_count`/jumlah pool, dan `entry_status` pada detail.

### D3. Tidak ada write-back pemenang di giveaway ✅📄

`GET /giveaways/winners` bisa baca pemenang, tapi tak ada endpoint terintegrasi FE untuk **mencatat pemenang** setelah draw eksternal. Kontrak punya admin `PUT /admin/giveaways/{id}/winners` + `PUT /admin/members/{id}/draw-pass`, tapi tak ada di inventori live.

**Pertanyaan:** konfirmasi jalur pencatatan pemenang oleh admin untuk Sprint 3.

### D4. Safe Hours — mohon konfirmasi enforcement ✅(sebagian)

Kontrak: sign-up/upgrade/downgrade diblokir **Jum 16:00–19:00 AEST** → `403 SAFE_HOURS_LOCKED`. Tes upgrade jalan Jum 13:21 AEST (di luar window) → sukses, lock belum tersentuh.

**Pertanyaan:** konfirmasi `/memberships/upgrade` dan `/stripe/checkout` mengembalikan persis `{ code:"SAFE_HOURS_LOCKED" }` (403) di dalam window, dan konfirmasi window + timezone. FE akan menangani error ini.

## Ringkasan — apa memblokir apa

| Deliverable Sprint 3 | Blocker |
|---|---|
| Register→transaksi paid (headline) | A1 ✅ tapi 🔴 **A4** (webhook aktivasi tak jalan) memblokir end-to-end |
| UI upgrade/downgrade (persisten) | ~~A2~~ ✅ resolved 2026-07-26 |
| Download invoice | 🟡 A3 backend added, FE wired — verifikasi diblokir 🔴 **A4** |
| Semua pembayaran (kualitas data) | **B1** (dulu, tak bisa backfill) |
| Integritas CSV undian | **B2, B3** |
| Tes live cancel / grace | **C3** |
| Sign-off entry engine | **C4** |

---

# ✅ SPRINT 2 (Ronde 2) — CLEAR, no outstanding backend blockers

## ✅ `DELETE /api/v1/beny/subscribe` — RESOLVED 2026-07-17 (was 404 on `pending_activation`)

**Fixed by backend and re-verified live the same day.** Full round-trip on `red@`:

```
GET    /beny/status     → 200  { "beny_status": "cancelled" }
POST   /beny/subscribe  → 201  { "beny_status": "pending_activation" }
GET    /beny/status     → 200  { "beny_status": "pending_activation" }
DELETE /beny/subscribe  → 200  { "success": true, "message": "BENY subscription cancelled." }   ← was 404
GET    /beny/status     → 200  { "beny_status": "cancelled" }
```

Cancel now accepts `pending_activation`, matching PRD *"user bisa cancel kapan saja"*. **FE follow-up shipped**: the Cancel button is now shown for pending members too ([beny-section.tsx](<src/app/member/discounts/_components/beny-section.tsx>)).

**Still open on this endpoint (minor, non-blocking — please confirm when convenient):**
- `DELETE` returns `data: { success, message }` (and `null` on repeat) — it still never returns `beny_status`, unlike `GET /beny/status` and `POST /beny/subscribe`. Returning `{ beny_status }` would make the three consistent. FE handles it either way.
- Enum spelling is **`"cancelled"`** (double L). Please confirm that's canonical; FE accepts both defensively.

<details>
<summary>Original report (2026-07-17) — kept for history</summary>

**Account:** `red@smartliferewards.com.au` · **Ronde 2 item:** "BENY add-on flow ($4/bulan)"
**Did NOT depend on Stripe** — pure status logic.

### The bug

```http
GET /api/v1/beny/status
Authorization: Bearer <JWT>
```
```json
→ 200 { "success": true, "data": { "beny_status": "pending_activation" } }
```
```http
DELETE /api/v1/beny/subscribe
Authorization: Bearer <JWT>
(no request body)
```
```json
→ 404 { "success": false,
        "message": "No active BENY subscription found to cancel.",
        "code": "NOT_FOUND",
        "requestId": "019f6f35-edd2-76d5-aad4-6d989ae05b57" }
```

### Control case — cancelling an `active` sub works fine

```
GET    /beny/status     → 200  { "beny_status": "active" }
DELETE /beny/subscribe  → 200  { "success": true, "message": "BENY subscription cancelled." }
GET    /beny/status     → 200  { "beny_status": "cancelled" }
```

⇒ Cancel only matches subs already `active`. A member sitting at `pending_activation` (i.e. **waiting for admin activation**) is **trapped** — they cannot back out.

### Why this is a bug, not a design choice

PRD v3.2 states the opposite, three times, and never restricts cancel to `active`:
- [370] *"User bisa **cancel BENY kapan saja** dari dashboard"*
- [669] *"user bisa **cancel kapan saja**"*
- [204] *"Saat di-cancel, akses BENY berlanjut sampai akhir periode yang sudah dibayar"*

PRD also assumes `pending_activation` means **already paid** ([208] *"Member yang **sudah bayar** masuk ke daftar pending BENY activation"*). So a member who has paid cannot cancel until an admin acts — the worst case for this bug.

### Asks

1. **`DELETE` must accept `pending_activation`**, not only `active`.
2. Wrong error code — the subscription **exists**, it just isn't `active`. `NOT_FOUND` is misleading; if a cancel is ever legitimately refused, use `409 CONFLICT` with a specific message.
3. Confirm PRD [204]: after cancel, access continues until the end of the paid period.

### Two side findings on the same endpoint (please also fix/confirm)

- **Response shape is inconsistent.** `DELETE` returns `data: { success, message }` — and on a repeat call, `data: null`. It **never** returns `beny_status`, while `GET /beny/status` and `POST /beny/subscribe` both do. Please make `DELETE` return `{ beny_status }` too.
- **Enum spelling.** The API returns **`"cancelled"`** (double L). Our docs previously assumed `"canceled"`. Please confirm `cancelled` is canonical and stable — FE now accepts both defensively.

### FE status

- Cancel button was **deliberately hidden** for `pending_activation` so members didn't hit a 404. ✅ Now shown (backend fixed).
- Two FE bugs this exposed are **already fixed** on our side: the `cancelled`/`canceled` enum mismatch (which silently prevented cancelled members from re-subscribing) and the wrong `cancelBeny` DTO.

> **Note:** `POST /beny/subscribe` requires a real Stripe subscription in billing records (`"No active membership subscription found in our billing records"`), so the full BENY flow can only be exercised end-to-end from Ronde 3. This cancel fix did **not** need that — seed accounts (`sub_seeded_*`) reproduced it.

</details>

---

## Authentication

All authed calls below use a Bearer token from `/auth/login`.

**`POST /api/v1/auth/login` — Login with email + password**
```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "<account>", "password": "ChangeMeImmediately!1" }
```
```json
→ 200 { "success": true, "message": "Logged in successfully.",
        "data": { "access_token": "<jwt>", "refresh_token": "…" } }
```
Then send `Authorization: Bearer <access_token>` on each request.

**Dev accounts** (all share password `ChangeMeImmediately!1`):

| Account | Role | Tier |
|---|---|---|
| `admin@smartliferewards.com.au` | admin | visitor |
| `red@smartliferewards.com.au` | member | r4 (RED) |
| `blue@smartliferewards.com.au` | member | b4 (BLUE) |
| `visitor@smartliferewards.com.au` | member | visitor |

---

## ✅ `GET /api/v1/giveaways/` — RESOLVED (was a 500 blocker)

Previously 500 `INTERNAL_ERROR` for every tier; **now returns 200** (fixed 2026-07-09). The frontend DTO + mappers were refit to the verified shape and the giveaway UI (dashboard upcoming + `/member/giveaways` list/detail) renders live.

Verified list shape: `{ giveaway_id, name, tier, type, prize, opens_at, closes_at, draws_at, is_entered, entry_status }`. Detail (`/{id}`) = the same meta + `winners[]`.

**Remaining giveaway gaps** (minor, not blocking):
- `GET /giveaways/{id}` is **incomplete vs the Notion API Contract v1.0** — the contract specifies detail returns "hadiah, **aturan (rules), TPAL cert note, entry history, past winners**", but the live response only returns meta + `winners[]`. FE fills rules/TPAL from static copy (CLAUDE.md §1) and merges `entry_status` from the list item. Implement the contract fields to make them real/editable.
- No **per-giveaway entry/pool counts** in either the list or detail payload — FE shows the member's cycle token count as "entries" and hides the community "in pool" figure. Add counts if you want them shown.

The list DTO (`GET /giveaways`) **matches the contract exactly** — no issue there.

---

## ✅ Admin tier-gate — RESOLVED (2026-07-09)

`GET /discounts/`, `GET /discounts/{id}`, and `GET /ebooks/{id}` previously returned **403 FORBIDDEN** for admin (they were tier-gated to RED/BLUE members). **All now return 200 for admin:**
- `GET /api/v1/discounts/` (admin) → **200**, lists discounts
- `GET /api/v1/discounts/{id}` (admin, real id) → **200**
- `GET /api/v1/ebooks/{id}` (admin) → **200 with `chapters`** — admin can preview content

FE benefit: the admin discounts page now populates its table (no more 403 error card), and admin edit forms can prefill from a real GET (discount + ebook).

**✅ Resolved — member discount DTO:** `GET /discounts/` and `GET /discounts/{id}` now return `code` + `terms` (verified: `code: "TRAVEL15"`, real `terms`). The member card auto-swapped its placeholders → the copy-code chip shows the **real promo code** and the real terms. **No `value_label` needed** — `title` already carries the offer text ("15% off weekend getaways"), so the FE dropped that redundant field. Nothing outstanding here.

---

## 🟡 Behavior question

### `DELETE /api/v1/beny/subscribe` — Cancel BENY subscription
Cancels an **active** subscription (verified **200** on an active member → `{ beny_status: "cancelled" }`). But a member in `pending_activation` gets **404**, so they can't cancel a request that hasn't been activated yet (the frontend hides the cancel button for pending as a workaround).

**Account:** `red@smartliferewards.com.au`
```json
active member    → 200 { "success": true, "data": { "beny_status": "cancelled" } }
pending member   → 404 { "success": false, "code": "NOT_FOUND",
                         "message": "No active BENY subscription found." }
```
**Ask:** should a `pending_activation` subscription be cancelable?

---

## ✅ Member profile — change-password + editable `dob` — RESOLVED 2026-07-21 (same day)

**Account:** `red@smartliferewards.com.au` · reported and shipped by the backend within the day. Both fixes re-verified live; FE wired.

### 1. ✅ `POST /api/v1/auth/change-password` — added

```
POST /api/v1/auth/change-password   (Bearer)
{ current_password: 1-128, new_password: 10-128, confirm_password: 1-128 }   // all required
```

Full live round-trip on `red@` (password changed, then restored):

```
new == current        → 400 BAD_REQUEST      "New password must be different from your current password."
wrong current         → 400 BAD_REQUEST      "Current password is incorrect."
confirm mismatch      → 400 VALIDATION_ERROR errors[0] { field: "confirm_password",
                                              message: "Password confirmation does not match." }
valid change          → 200                  "Password changed successfully."
login with OLD        → 401                  ← old password really is dead
login with NEW        → 200
restore + login OLD   → 200 / NEW → 401      ← account left exactly as seeded
```

All three server-side rules match what the PRD-facing form needs, so the FE validation is a mirror, not the authority.

**Was:** the API had only the emailed reset flow, and the FE Security card *faked* success — "Password updated." with **zero network calls**, which is why members reported "password changed but the old one still works". Now wired to the real endpoint via `changePasswordAction` in [profile/actions.ts](<src/app/member/profile/actions.ts>).

**Session behaviour (confirmed by backend 2026-07-21, by design):** a successful change does **not** revoke other sessions — existing access and refresh tokens keep working. FE relies on this: the member stays signed in after changing their password, so the Security card doesn't sign them out.

### 2. ✅ `PATCH /users/me` now accepts `dob`

Schema keys are now `fullName | phone | state | dob` (`dob`: string, `format: date-time`). A **date-only** string is accepted and coerced:

```http
PATCH /api/v1/users/me   { "dob": "1990-05-14" }
→ 200 { … "dob": "1990-05-14T00:00:00.000Z" }
GET  /api/v1/auth/me     → "dob": "1990-05-14T00:00:00.000Z"   ← persists
```

**Was:** the key was silently stripped (`unknownKeys: "strip"`) while still answering 200 "Profile updated." — a success message that lied. The FE's echo-comparison guard has been removed now that the field lands.

**Side effect:** `red@` now carries a `dob` from these tests (was `null`). Harmless, but re-seed if you want it clean — the API takes no `null`, so it can't be cleared from the app.

### 3. Correct behavior, noted — `phone` validation

`PATCH /users/me { "phone": "+61abc12345" }` → **400 `VALIDATION_ERROR`** `{ field: "phone", message: "Invalid" }`, pattern `^\+?[0-9]{8,15}$`. Correct; the FE just wasn't enforcing it (letters reached the API). Now the field is digits-only with a fixed `+61` prefix, so the joined value always matches.

### 4. ⚠️ Unrelated: `/auth/login` returned 500 for ~45s (2026-07-21)

During the above run, `POST /auth/login` answered `500 INTERNAL_ERROR` for **every** account — including `blue@`, which was never touched — then recovered on its own after ~45 seconds. Not caused by the password change (the control account proves that), but worth checking the logs: a total login outage has no user-visible cause and no retry guidance. `requestId`s: `019f8531-b737-7089-9e19-b0a55f7d279a`, `019f8531-b988-7468-8eb1-16dd3b2f224e`. Also note `GET /healthz` is **404** on the public host, so there's no probe to distinguish "API down" from "login down".

---

## ⚠️ Business-logic gaps (return 200, but off-spec per PRD)

### `POST /api/v1/beny/subscribe` — Subscribe to BENY add-on
**⏭️ Scheduled for the next sprint (Stripe billing).** Creates `pending_activation` **immediately, with no Stripe charge and no checkout URL** in the response. PRD §1 requires the flow to redirect to Stripe Checkout ($4/mo) **before** the pending record is created. The frontend calls it directly for now and marks the gap with a removable `BACKEND BLOCK` comment — remove it once the backend returns a checkout session.

**Account:** `visitor@smartliferewards.com.au` (any RED/BLUE/visitor)
```http
POST /api/v1/beny/subscribe
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "V Test", "email": "visitor@smartliferewards.com.au", "phone": "0400000000" }
```
```json
→ 200
{
  "success": true,
  "message": "BENY subscription created. Activation will be processed by admin.",
  "data": { "beny_status": "pending_activation" }
}
```
Notes: field is `name` (not `full_name`); response carries no record id. **Ask:** return a Stripe Checkout session so the $4/mo can be collected before pending.

### `POST /api/v1/memberships/change-tier` — Admin: change user's tier/sub-tier
Accepts `{ userId, subTierId }` and silently **ignores a `state` field** — but that's by design. ✅ **RESOLVED:** the draw-pool halves use two endpoints — `POST /memberships/change-tier` changes **tier/sub-tier**, and **`PATCH /users/{id}`** with `{ "state": "NSW" }` changes the **geographic state** (verified: 200 "User updated.", state persists, restored). FE **wired**: a Draw-pool state dropdown on the member-detail admin actions (`PATCH /users/{id}`).

---

## ✅ Correct behavior (not bugs — documented so they aren't re-reported)

### `GET /api/v1/giveaways/{id}` — Get detailed giveaway information
Returns a correct 404 for an unknown id — the endpoint works and the list now yields valid ids. (Its payload is still **incomplete vs the contract** — meta + `winners[]` only; see the giveaways section above.)

**Account:** `red@smartliferewards.com.au`
```json
GET /api/v1/giveaways/00000000-0000-0000-0000-000000000000
→ 404 { "success": false, "message": "Giveaway not found.", "code": "NOT_FOUND" }
```

### `GET /api/v1/ebooks/{id}` — Get ebook content and chapters if unlocked
Correct tier gate: a below-tier member or visitor gets 403 (the seed ebook is BLUE-only, so `red@` and `visitor@` both 403). The member reader renders an upgrade gate.

**Account:** `visitor@smartliferewards.com.au`
```json
→ 403 { "code": "FORBIDDEN", "message": "Upgrade membership to unlock this ebook.",
        "requestId": "019f410e-fcea-761d-b237-14d4845771d0" }
```

---

## Resolved since the last integration pass

### `GET /api/v1/admin/members` — List all members with filters and pagination
Previously returned 400 `BAD_REQUEST` for every param combination. **Now returns 200** with the member list — no frontend change needed; the members table + sub-tier stats no longer degrade.

**Account:** `admin@smartliferewards.com.au`
```json
→ 200 { "success": true, "message": "OK",
        "data": [ { "user_id": "…", "full_name": "…", "email": "…", "state": "SA",
                    "status": "active", "tier": "Premium", "billing_status": "active", … } ],
        "meta": { "page": 1, "per_page": 20, "total": 6, "total_pages": 1 } }
```

---

## ✅ `POST /api/v1/ebooks/presigned-url` — RESOLVED 2026-07-17 (was a 403 `SignatureDoesNotMatch` blocker)

**Re-verified 2026-07-17:** the presigned PUT now returns **200**, and a follow-up `GET download_url` returns **200** — the image is stored and publicly readable. The signing host was corrected on the backend; `X-Amz-SignedHeaders=host` still, but the signature now validates on `object.smartliferewards.com.au`.

Ebook **cover + chapter image upload works end-to-end**, per `docs/Panduan Lengkap Integrasi API Ebook.md` (Step A presign → Step B raw `PUT` with matching `Content-Type`, no FormData → Step C/D store `download_url`). No frontend change was needed — `uploadEbookAsset` already matched the guide.

<details>
<summary>Original report (2026-07-16) — kept for history</summary>

**Captured:** 2026-07-16 · **Account:** `superadmin@smartliferewards.com.au`

The API endpoint itself is **fine** — it returns 200 with a valid envelope:
```json
→ 200 { "success": true, "message": "Presigned upload URL generated.",
        "data": {
          "upload_url": "https://object.smartliferewards.com.au/public/ebooks/2026-07-16/<uuid>.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minio_admin%2F20260716%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=…&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=…",
          "download_url": "https://object.smartliferewards.com.au/public/ebooks/2026-07-16/<uuid>.png",
          "object_key": "ebooks/2026-07-16/<uuid>.png" } }
```

**The bug is in the presign signature.** PUT-ing the file to `upload_url` (MinIO, fronted by Cloudflare) returns:
```xml
→ 403 <Error><Code>SignatureDoesNotMatch</Code>
  <Message>The request signature we calculated does not match the signature you provided.</Message>
  <BucketName>public</BucketName> …</Error>
```
Reproduced with a **bare `curl -X PUT --data-binary @file`** — no auth header, no extra headers, both **with and without** `Content-Type`. So it is **not** the frontend and **not** a Content-Type/CORS problem.

**Root cause:** `X-Amz-SignedHeaders=host` — only the `host` header is signed, yet it still mismatches on the correct public host. The presigner is signing against a **different endpoint host than the one the URL is served on** (typical MinIO-behind-proxy setup: the S3 client signs with the internal MinIO address, then the public host `object.smartliferewards.com.au` is what's presented → signature invalid).

**Backend fix:** make the S3/MinIO client presign against the **public** endpoint. For MinIO set `MINIO_SERVER_URL=https://object.smartliferewards.com.au` (and `MINIO_BROWSER_REDIRECT_URL` if used), or configure the SDK's `endpoint`/`publicEndpoint`/`forcePathStyle` so the signed host equals the public host. Also confirm the signed **region** (`ap-southeast-2`) matches the server. After the fix a plain PUT to `upload_url` must return **200**.

**Frontend status:** upload flow is fully wired (`uploadEbookAsset` → presign → PUT → store `download_url`) and correct; it will work unchanged once the presigned URL validates. Until then, cover/chapter image upload fails at the PUT step with a `Upload failed (403)` toast + console error.

</details>

---

## 🔴 TPAL CSV export — one row per member, tokens are a **column** instead of repeated rows

**Captured:** 2026-07-17 · **Endpoint:** `POST /api/v1/admin/csv/generate` · **Account:** `superadmin@`

The endpoint works and produces 3 files (visitor/red/blue). But the CSV puts `total_token` in a **column**, emitting **one row per member**:

```csv
id,email,full_name,state,phone,total_token
019f2145-…,red@smartliferewards.com.au,SLR Red Paid Member,VIC,+61400000004,7
```
`row_count` confirms it: **red = 1 row** (1 member, 7 tokens), **blue = 2 rows** (2 members), **visitor = 8 rows** (8 members).

**Why this is critical.** CLAUDE.md §1 / PRD v3.2 define **token** as *"rows/entries in the TPAL CSV per giveaway (chance of winning)"*. The draw runs externally at randomdraws.com/au, which picks a **random row**. With one row per member:

- **Every member has identical odds**, regardless of tokens.
- An R1 member ($10, 1 token) and a B10 member ($65, 10 tokens) are **equally likely to win**.
- The entire token/pricing ladder becomes cosmetic — the core monetisation of the product does not function.

**Expected:** a member with `total_token = 7` should appear as **7 separate rows** in that tier's CSV (or the export must document exactly how randomdraws.com is configured to weight the `total_token` column — if it can at all).

**Please confirm one of:**
1. The CSV should repeat each member `total_token` times → **fix the exporter**.
2. randomdraws.com/au is configured to read `total_token` as a **weight** → document it, and this becomes a non-issue.

**Also:** the `visitor` CSV includes members whose `draw_pass` is infinite — correct — but please confirm the exporter filters on **`draw_pass > 0`** per the PRD (we can't verify from outside; all current rows have passes).

> **PII note:** these CSVs contain real member emails and phone numbers. Handle the generated files accordingly (the `download_url`s are presigned and short-lived, which is good).

**Frontend status:** ✅ **`/dashboard/draw-exports` built** — Generate button (`POST /admin/csv/generate`) + history table with per-tier download links (`GET /admin/csv/history`). It surfaces `row_count` directly, so once the exporter is fixed the row counts will visibly jump to the token totals.

---

## ⚠️ Admin `change-tier` leaves membership and cycle inconsistent (NOT a PRD upgrade-path finding)

**Captured:** 2026-07-17 · **Endpoint:** `POST /api/v1/memberships/change-tier` · **Repro account:** `019f6f21-04fb-7425-b8eb-022dcbb2783a` (registered fresh — **not** seed)

> **⚠️ SCOPE CORRECTION (read first).** This test used **`POST /memberships/change-tier`**, which the OpenAPI spec labels **"Admin: change user's tier/state"** — an **admin override**, *not* the member upgrade path. The PRD's actual flows are:
> - **Visitor→Paid** → `POST /stripe/checkout` → pay → **Stripe webhook** creates the new cycle. **← never tested by us**
> - **Paid→Paid** → `POST /memberships/upgrade` (schedules `pending_upgrade`, applied at renewal). **← never tested by us** (not integrated)
>
> Therefore this is **NOT** evidence that "Visitor→Paid upgrade is broken", and our earlier claim to that effect is **retracted**. `change-tier` may legitimately not be responsible for cycle allocation — that may be the webhook's job. What remains below is narrower: an **admin tool can leave a member in an inconsistent state**. Please confirm whether that's intended before treating it as a bug.

### Reproduction (full trace)

1. `POST /auth/register` — tier **visitor**, VIC → `pending_otp`, **0 cycles** (cycle is created at OTP verification, not at register).
2. `POST /auth/verify-otp` → 200. Engine creates the Visitor cycle — **correctly**:
   `total_token: 1`, `draw_pass: -1` (infinite), `2026-07-17` → `2026-08-14` (**28 days**). ✅ Matches config exactly.
3. `POST /memberships/change-tier` `{subTierId: "b4"}` → `200 "Tier updated."`, response confirms `subTier.token = 4`.
4. **Re-read the cycle → UNCHANGED:**

| Field | After Visitor→b4 | Should be (b4) |
|---|---|---|
| `membership.tier` | Plus (blue) ✅ | blue |
| `membership.billing_status` | **active** (no payment made) | ? |
| `subscription` | `{}` | ? |
| `current_cycle.total_token` | **1** ← still Visitor's | **4** |
| `current_cycle.draw_pass` | **-1** ← still Visitor's "infinite" | **4** |
| cycle | same row, no new cycle created | new cycle |

**PRD §1 for reference** (describing the *real* upgrade paths, not this admin endpoint): *"Upgrade/downgrade — Visitor→Paid immediate (new cycle now). Paid→Paid scheduled via `pending_upgrade`, applied at next renewal."*

### Same state as the "seed" blue member

Member `019f329d-f1f7-704a-81f8-fff772a0608a` was reported as "just seed data". Its state matches what this repro produces exactly — blue membership + `total_token: 1` + `draw_pass: -1` + `subscription: {}` + `billing_status: active`. That's consistent with it having been created via `change-tier` (seed or manual), rather than being a random bad seed value. It does **not** by itself prove a bug in the PRD upgrade path.

> **Note:** `change-tier` **paid→paid** (verified r4→r1) also leaves the live cycle alone — consistent with the PRD's "applies at next renewal, no proration".

### Impact (IF admin change-tier is expected to be a complete upgrade)

1. Member is on a paid tier but holds **1 token** instead of 4 → fewer draw chances than they paid for.
2. `draw_pass = -1` (**infinite**) — a Visitor-only privilege. A paid member must have **4**. They can join unlimited giveaways.
3. The TPAL export puts them in the **blue** pool (from membership tier) but with Visitor token/pass (from the stale cycle) — the CSV mixes two sources that can disagree.
4. `billing_status` flips to **active with no payment at all** — `change-tier` bypasses Stripe entirely.

### Questions (not asserting a bug — please confirm intent)

1. **Is `change-tier` meant to re-allocate the cycle at all**, or is cycle allocation exclusively the Stripe webhook's job? If the latter, this is working as designed and only the admin UX/expectations need documenting.
2. If `change-tier` is *not* a complete upgrade, **what is the supported way for an admin to move a Visitor onto a paid tier** without a real payment? Today it produces membership=blue + `billing_status=active` + a Visitor cycle (`1` token, `draw_pass -1`).
3. Confirm `draw_pass = -1` is the intended "infinite" sentinel, and whether a paid member holding it is possible/acceptable.
4. Confirm whether admin `change-tier` is *meant* to set `billing_status: active` without a payment (`subscription: {}`).

### Still to be tested by us (the real PRD paths)

- **Visitor→Paid:** `POST /stripe/checkout` (card `4242 4242 4242 4242`) → webhook → assert new cycle has b4's `token: 4` / `draw_pass: 4`. Account `019f6f21-04fb…` is ready for this.
- **Paid→Paid:** `POST /memberships/upgrade` → assert `pending_upgrade` is scheduled and applied at renewal (not yet integrated on FE).

### Silver lining — the allocator itself is now proven correct (for Visitor)

Step 2 above is the **first time in this environment the allocator has demonstrably run**, and it read the config correctly (1 token / infinite pass / 28-day cycle). That's real evidence the entry engine works; the bug is specifically that **`change-tier` doesn't invoke it** on Visitor→Paid.

---

## ⚠️ Entry calculation engine — misleading seed data; engine itself **never exercised**

**Captured:** 2026-07-17 · **Resolved as seed data 2026-07-17 (confirmed by backend)** · **Sprint 2, item 4**

> **Verdict:** the wrong token counts below are **seed-script artifacts, NOT an allocator bug**. Confirmed by backend and independently proven (see "How we know" below). **However**, that also means the allocator has **never run** in this environment — item 4 is **unverified**, not verified-working. Two asks remain: (1) re-seed to match config, (2) exercise the allocator once via a real test payment.

`GET /memberships/tiers` (the config) is **correct** and matches PRD v3.2 exactly. The seeded cycles disagree with it for **both paid tiers**:

| Account | `subTierId` | Config `token` (`/memberships/tiers`) | Engine `current_cycle.total_token` (`/entries/`) | |
|---|---|---|---|---|
| `visitor@` | visitor | 1 | 1 | ✅ |
| `red@` | **r4** | **4** | **7** | ❌ +3 |
| `blue@` | **b4** | **4** | **15** | ❌ +11 |

Everything *else* about the cycle is right — `draw_pass = 4` ✅, cycle length 28 days (`2026-07-02` → `2026-07-30`) ✅, `entry_status: active` ✅. **Only `total_token` is wrong.**

**Ruled out:**
- **Not a spin/bonus grant** — `memberships/me.pendingBonusNextCycle = 0`.
- **Not accumulation across cycles** — `GET /admin/members/{id}` returns **exactly 1 cycle** for `red@`, already holding `total_token: 7` (so it was written wrong at cycle creation, not added to over time).

**Leads:**
- `red@` is on **r4** but received **7** — which is precisely **r7's** configured token value. Looks like the allocator resolved the wrong sub-tier row at cycle creation.
- `blue@` on **b4** received **15**, which matches **no** sub-tier (b4=4, b7=7, b10=10).

### `change-tier` round-trip test (run 2026-07-17, `red@` restored)

Switched `red@` **r4 → r1** (config token = 1), re-read `/entries/`, then restored **→ r4**:

| Step | `subTierId` | `current_cycle.total_token` |
|---|---|---|
| baseline | r4 | 7 |
| after → **r1** | r1 | **7** (unchanged) |
| restored → **r4** | r4 | 7 |

**Conclusions:**
- ❌ **Additive-mutation theory is disproven** — the value never moved (would have been 8). Earlier tier-switch testing did **not** cause `blue@`'s 15.
- ✅ **`change-tier` does not touch the live cycle's tokens** — consistent with the PRD (paid→paid applies at next renewal, no proration; token/draw_pass reset on **successful renewal**). Not a bug.
- ⇒ Both wrong values were therefore **written at cycle creation**.

### How we know it's the seed script (confirmed by backend 2026-07-17)

| Evidence | Finding |
|---|---|
| `GET /billing/status` | `stripe_subscription_id: "sub_seeded_red_123"` / `"sub_seeded_blue_123"` — literal placeholders |
| `POST /stripe/portal` | `400 No such customer: 'cus_seeded_red_123'` — no real Stripe customer exists |
| `GET /billing/invoices` | **0 invoices** on both accounts — no payment ever occurred |
| UUIDv7 timestamps | `red@` user created `05:20:14.585Z`, its cycle `05:20:22.145Z` → **7.56s apart**, and `cycle_id`'s embedded time == `start_at` exactly. A checkout cannot complete that fast — this is a script inserting rows sequentially. |

⇒ The **allocator/webhook never ran** for these accounts. The 7 and 15 are hardcoded seed values.

### Consequence: the entry engine was UNVERIFIED — now partially proven ✅

**Update 2026-07-17:** a fresh Visitor registration + OTP verification (account `019f6f21-04fb…`) showed the allocator **running correctly**: `total_token: 1`, `draw_pass: -1`, 28-day cycle — exactly the Visitor config. So the allocator does read config and does work.

Still unproven: the **paid** allocation path (cycle created by the Stripe payment webhook), since no real payment has occurred here (0 invoices across all accounts). Confirming r4 ⇒ 4 tokens on a real checkout is the remaining gap for item 4.

**Asks:**
1. **Re-seed `red@` / `blue@` so their cycles read 4 / 4** (match the sub-tier config). Current seed values misrepresent the product in demos/QA and — more importantly — would **mask a real allocator bug** if one exists, since wrong numbers already look "normal".
2. **Exercise the allocator once**: complete a **Stripe test checkout** (card `4242 4242 4242 4242`) → webhook creates a real cycle → assert `current_cycle.total_token` == the sub-tier's configured `token` (r4 ⇒ **4**). Until this runs once, item 4 is untested.
3. Confirm renewal **resets** `token` + `draw_pass` from config rather than incrementing (PRD: entries never accumulate across cycles).

**Verified-correct engine behaviour so far** (all consistent with PRD): cycle length exactly **28 days** (`2026-07-02` → `2026-07-30`); `draw_pass = 4` on paid tiers; visitor `draw_pass` infinite; `entry_status: active`; **no cycle allocated before payment** (a fresh unpaid r4 registration has 0 cycles); and `change-tier` does **not** mutate the live cycle's tokens (paid→paid applies at next renewal, no proration).

**Frontend status:** no FE change pending. `/member` + `/member/entry-history` source the draw-cycle surface from `entries/current_cycle` (`total_token`, `entry_status`, renewal) and never render `draw_pass`. FE deliberately does **not** fall back to `subTier.token` — `entries/` is what feeds the TPAL CSV, so showing the config value would hide discrepancies like this instead of surfacing them.

**Frontend status:** no FE change pending. `/member` + `/member/entry-history` already source the draw-cycle surface from `entries/current_cycle` (`total_token`, `entry_status`, renewal) and never render `draw_pass`. FE deliberately does **not** fall back to `subTier.token` — `entries/` is what feeds the TPAL CSV, so displaying the config value would hide this bug and mismatch the real draw. Members currently see the inflated number.

---

## 🐞 Paid registration can't reach Stripe Checkout — `register` says no OTP, but `login` demands it

**Captured:** 2026-07-17 · **Blocks:** the paid (RED/BLUE) registration checkout in `sign-up`

`POST /api/v1/stripe/checkout` **requires auth** (OpenAPI: no per-op `security` → inherits global `bearerAuth`), and the backend's own `docs/fe_stripe_guide.md` registration flow calls it right after "Review Order". But a freshly-registered paid user **cannot obtain a token**:

**1) Register a paid account → says OTP is NOT required:**
```json
POST /api/v1/auth/register
{ "full_name":"FE Test", "email":"<throwaway>", "password":"…", "state":"VIC",
  "phone":"0400000000", "dob":"1990-01-01", "tier":"red", "sub_tier":"r4" }

→ 201 { "success": true, "message": "Registration successful.",
        "data": { "user_id":"019f6e1b-…", "requires_otp": false,
                  "requires_payment": true, "spin_available": true } }
```

**2) Log in with those exact credentials → 401, demands OTP:**
```json
POST /api/v1/auth/login
{ "email":"<same>", "password":"<same>" }

→ 401 { "success": false, "code": "UNAUTHORIZED",
        "message": "Email verification is pending. Please verify your OTP to activate your account." }
```

**The contradiction:** `requires_otp: false` (and PRD/CLAUDE.md §1: *"OTP email verification is Visitor-only; paid tiers verify via Stripe (no OTP)"*) vs. login refusing to issue a token until OTP is verified. `register` also returns **no token**, so there is no other way to authenticate the new user → **`/stripe/checkout` is unreachable during registration**.

**Pick one and we'll wire it:**
1. **Let paid accounts log in unverified** (they verify via Stripe payment, per PRD) — makes `requires_otp:false` truthful; FE then does register → login → checkout.
2. **Return a session token (or the checkout URL) straight from `register`** when `requires_payment: true` — FE redirects immediately.
3. **Confirm paid signups really do need OTP** — then fix `register` to return `requires_otp: true`, and FE routes paid users through OTP first (contradicts the PRD, so needs a product decision).

**Frontend status:** the paid registration path is **still mocked** (`step-checkout.tsx` fakes the redirect); the wizard only creates accounts on the Visitor path. `POST /stripe/checkout` itself is **verified working** for an already-authenticated member (returns a real `{url, sessionId}`), and is now wired live on **`/account`** for Visitor→RED/BLUE upgrades.

> **Test data:** a throwaway paid account (`fe-test-<timestamp>@example.com`, VIC, r4) was created in production during this check and is stuck unverified — safe to purge.

---

## ⚠️ Member-account restructure (2026-07-18) — remaining gaps

**Captured:** 2026-07-18 · **Context:** `/member/profile` + `/member/membership` split (client-revision to the member-facing account area, replacing the old `/account` page). Filed at close of that work so the outstanding items aren't rediscovered later.

### 1. `pay_id_email` — new field needed on the user profile

Add a `pay_id_email` column + expose it for read/write on `PATCH /users/me` / `GET /auth/me`. Today the frontend renders it from a placeholder (`profile.pay_id_email` is always `null` from the API — see [personal-info-section.tsx](<src/app/member/profile/_components/personal-info-section.tsx>), badged `Placeholder` in the UI). **Please confirm the purpose with the client** — likely a PayID payout email for prize winnings, but unconfirmed. This is the only remaining profile placeholder field (name/phone/dob are all real; see item 4).

### 2. No member-facing change-request endpoint for `email` or `state`

Both fields are **admin-approval-only** per PRD — `state` in particular drives the draw pool, so PRD forbids self-service changes. Today there is **no member endpoint to request a change**; the only mutation path is admin-side `PATCH /users/{id}` (see the "Admin tier-gate" / draw-pool section above). The profile page shows both as display-only with a "request change (admin approval)" affordance that currently just routes to the existing support/contact flow.

**Ask:** either (a) add a member-facing request endpoint (e.g. `POST /users/me/change-request`) that queues an admin-reviewable request, or (b) confirm routing these through support/contact is the intended permanent flow, so the frontend affordance can be finalized instead of left as a placeholder.

**Contradiction to resolve:** `PATCH /users/me` currently **accepts** a `state` field in its request schema, which contradicts the PRD's "admin-approval-only" rule for state. The frontend never sends `state` on this endpoint (only `fullName`/`phone` — see [actions.ts](src/app/member/profile/actions.ts)), but the schema allowing it is a latent self-service hole. Please either remove `state` from `PATCH /users/me`'s accepted body, or confirm self-service state changes are intentionally allowed (in which case the PRD/FE lock needs revisiting).

### 3. Ronde 3: paid→paid upgrade + cancel not yet wired

`/member/membership`'s "Manage Membership" card shows **"Coming soon"** for both **Change plan (upgrade/downgrade)** and **Cancel membership** for paid members (see [manage-tier.tsx](<src/app/member/membership/_components/manage-tier.tsx>)). These controls are intentionally disabled pending:
- `POST /memberships/upgrade` — schedule a `pending_upgrade`, applied at next renewal, no proration, cancelable before it applies (per PRD).
- `DELETE /memberships/upgrade` — cancel a scheduled pending upgrade.
- The member-facing cancel-membership endpoint (subscription cancel at period end — distinct from BENY cancel, which is already wired).

Once these are live and verified, the frontend just needs to swap the "Coming soon" badges for real controls — no structural change to the page.

### ✅ Resolved as part of this restructure

- **`dob`** — now exposed on `GET /auth/me` (backend added it 2026-07-18). Profile reads it directly; display-only since `PATCH /users/me` doesn't accept it.
- **`address`** — dropped as a separate field; reuses the existing `state` (client decision 2026-07-18). No backend change needed beyond item 2 above.

---

## ~~`GET /api/v1/discounts/{id}` omits `isActive`~~ — RESOLVED (FE dropped the field)

**Captured:** 2026-07-18 · **Resolved:** 2026-07-18

The detail/list GET never returned `is_active`, so the admin edit form couldn't seed the Active switch or reactivate an inactive discount. Per client, the active toggle isn't needed in the admin UI — the FE removed `isActive` entirely from the discount form, DTOs, and table (2026-07-18). No backend change required. If active/inactive management is ever wanted again, backend must add `is_active` to `GET /discounts/` and `GET /discounts/{id}`.
