# Laporan Backend — Stripe Checkout & Webhook (Sprint 3)

**Tanggal uji:** 2026-07-26 · **Base URL:** `https://api.smartliferewards.com.au/api/v1`
**Metode:** 2× pembayaran Stripe test-mode **nyata** (kartu `4242 4242 4242 4242`) sampai tuntas di hosted checkout, lalu polling endpoint.
**Swagger:** `https://api.smartliferewards.com.au/docsx-2s3crt3-199/json`

Semua request/response di bawah adalah **hasil tangkapan langsung**, bukan rekonstruksi.

---

## Akun yang dipakai

| Label | Email | user_id | Keterangan |
|---|---|---|---|
| **Akun A** | `fe-stripe-test-1785041074@example.com` | `019f9cbd-3dc5-73fc-b3de-949f4b3e664b` | Registrasi paid baru (red/r4), bayar ~10:11:51Z. Aman dipurge. |
| **Akun B** | `visitor@smartliferewards.com.au` | `019f2145-40f9-734c-86de-ebc27287b39e` | Upgrade Visitor→Paid lewat `/stripe/checkout`, bayar 10:38:20Z. |

---

## Ringkasan

| # | Temuan | Severity | Status |
|---|---|---|---|
| S1 | Webhook aktivasi jalan, **cycle allocation tidak** → member berbayar `draw_pass: -1` | 🔴 Blocker | Baru (A4 sebagian) |
| S2 | **Invoice/payment row tidak pernah dibuat** — 0 row platform-wide setelah 2 bayar sukses | 🔴 Blocker | Baru (A4 sebagian) |
| S3 | **Seluruh jalur baca `payments` → 400** (`billing/invoices`, `payments/me`, `payments/`) | 🔴 Regresi | Baru — memburuk saat uji berlangsung |
| S4 | `POST /stripe/checkout` — `couponId` selalu gagal + 3 cacat validasi (S4.1 `subTierId` ✅ sudah didokumentasikan 12:47) | 🔴 Blocker | Baru |
| S5 | Siklus billing **30 hari**, bukan 28; `current_period_start` 2 hari di masa depan | 🟠 Wajib | Baru |
| ~~S6~~ | ~~Mata uang checkout IDR + AUD~~ | — | ✅ **Selesai — di luar scope kita, tidak perlu aksi** |

**Sudah benar, jangan sampai regresi:** `POST /auth/register` (paid) mengembalikan token ✅ · `POST /stripe/checkout` membuat session ✅ · `GET /memberships/me` mengembalikan `pending_upgrade` ✅ · aktivasi `billing_status` ✅ · subscription row dengan id Stripe nyata ✅.

---

## S1 🔴 Webhook mengaktivasi, tapi TIDAK membuat billing cycle

Ini pendalaman A4. Aktivasi **sudah jalan** (perbaikan dari laporan sebelumnya). Yang belum: alokasi entry cycle.

### Bukti 1 — Akun A (registrasi baru, tidak ada cycle sama sekali)

```http
GET /api/v1/admin/members/019f9cbd-3dc5-73fc-b3de-949f4b3e664b
Authorization: Bearer <superadmin>
```
```json
→ 200
{
  "success": true,
  "data": {
    "user_id": "019f9cbd-3dc5-73fc-b3de-949f4b3e664b",
    "email": "fe-stripe-test-1785041074@example.com",
    "created_at": "2026-07-26T04:44:35.656Z",
    "membership": {
      "tier": "Plus",
      "tier_code": "red",
      "billing_status": "active",          // ✅ aktivasi jalan
      "renew_at": "2026-08-25T10:11:51.327Z"
    },
    "subscription": {
      "stripe_subscription_id": "sub_1TxJxnEAtqxn8cm3a0AGGHPZ",   // ✅ id Stripe nyata
      "status": "active",
      "current_period_start": "2026-07-28T10:11:51.327Z",
      "current_period_end": "2026-08-25T10:11:51.327Z"
    },
    "cycles": [],                            // ❌ KOSONG — tidak ada cycle
    "wins": []
  }
}
```

Konfirmasi subscription-nya nyata (bukan seed):
```http
GET /api/v1/subscriptions/
Authorization: Bearer <superadmin>
```
```json
→ 200 data[0] = {
  "id": "019f9de8-dba6-7245-8ca7-797a416e51d1",
  "userId": "019f9cbd-3dc5-73fc-b3de-949f4b3e664b",
  "stripeSubscriptionId": "sub_1TxJxnEAtqxn8cm3a0AGGHPZ",
  "stripeCustomerId": "cus_UxEOBn2lw3mQIf",
  "status": "ACTIVE",
  "currentPeriodEnd": "2026-08-25T10:11:51.327Z",
  "createdAt": "2026-07-26T10:11:51.336Z"
}
```

### Bukti 2 — Akun B (punya cycle lama, tidak diganti)

**Langkah 1 — buat session:**
```http
POST /api/v1/stripe/checkout
Authorization: Bearer <token visitor@>
Content-Type: application/json

{ "tier": "RED" }
```
```json
→ 200
{
  "success": true,
  "data": {
    "url": "https://checkout.stripe.com/c/pay/cs_test_b18ailwgdv2dgLZdCQd3tw0fv76FWlyf…",
    "sessionId": "cs_test_b18ailwgdv2dgLZdCQd3tw0fv76FWlyfJrFm5lrQF4qMwmiOpSXWKFC6GM"
  }
}
```

**Langkah 2 — bayar `4242 4242 4242 4242` di hosted checkout → sukses, 2026-07-26T10:38:20Z.**

**Langkah 3 — baca hasilnya:**
```http
GET /api/v1/billing/status
Authorization: Bearer <token visitor@>
```
```json
→ 200
{ "billing_status": "active",                                  // ✅
  "next_renewal_at": "2026-08-25T10:38:20.438Z",
  "grace_period": null,
  "stripe_subscription_id": "sub_1TxPRmEAtqxn8cm3QDLL5UVa" }   // ✅ nyata
```
```http
GET /api/v1/memberships/me
```
```json
→ 200
{ "userId": "019f2145-40f9-734c-86de-ebc27287b39e",
  "subTierId": "r1",                                  // ✅ visitor → r1
  "billingStatus": "ACTIVE",
  "updatedAt": "2026-07-26T10:38:20.457Z",            // ✅ row disentuh webhook
  "subTier": { "id": "r1", "priceCents": 1000, "token": 1,
               "drawPassDefault": 4, "stripePriceId": null },
  "pending_upgrade": null }
```
```http
GET /api/v1/entries/          # dipoll sampai 2026-07-26T10:43:57Z (5m37s setelah bayar)
```
```json
→ 200
{ "data": {
    "current_cycle": {
      "cycle_id": "019f2145-548a-72da-9bb5-10d727f7e52c",   // ❌ cycle SEED tgl 2 Juli
      "start_at": "2026-07-02T05:20:19.594Z",               // ❌ tidak diganti
      "end_at":   "2026-07-30T05:20:19.594Z",
      "tier": "visitor",                                     // ❌ masih visitor
      "base_token": 1, "referral_bonus": 0, "total_token": 1,
      "entry_status": "active"
    },
    "history": [] } }
```
```http
GET /api/v1/admin/members/019f2145-40f9-734c-86de-ebc27287b39e
Authorization: Bearer <superadmin>
```
```json
→ 200 data.cycles = [
  { "cycle_id": "019f2145-548a-72da-9bb5-10d727f7e52c",
    "start_at": "2026-07-02T05:20:19.594Z",
    "end_at":   "2026-07-30T05:20:19.594Z",
    "base_token": 1, "referral_bonus": 0, "total_token": 1,
    "draw_pass": -1,                     // ❌ INFINITE — privilege khusus Visitor
    "status": "active" } ]
```

### Kenapa ini kritikal

Member sekarang berada di **sub-tier berbayar r1 (pool RED)** tapi memegang **`draw_pass: -1` (tak terbatas)** — hak yang seharusnya hanya milik Visitor. Konsekuensi langsung:

1. Member $10 bisa ikut giveaway **tanpa batas**; PRD mewajibkan paid = **4 draw_pass**.
2. Token-nya 1 (nilai Visitor), bukan nilai sub-tier yang dibayar.
3. Export TPAL akan menaruh member ini di **pool RED** (dari membership) dengan **token/pass Visitor** (dari cycle) — dua sumber yang saling bertentangan dalam satu baris CSV.
4. Untuk registrasi baru (Akun A) lebih parah lagi: `cycles: []` → **0 token, tidak masuk CSV sama sekali**. Bayar penuh, dapat nol peluang undian.

Dua bukti ini datang dari **jalur pembayaran PRD asli** (`/stripe/checkout` → webhook), bukan dari admin override `change-tier`. Jadi ini murni bug webhook.

**Expected (Kontrak §12 / PRD):** `checkout.session.completed` harus membuat **cycle baru** — `total_token` = `subTier.token`, `draw_pass` = `subTier.drawPassDefault` (4), `start_at` = detik pembayaran sukses, `end_at` = +28 hari — dan **menutup cycle Visitor lama**.

**Ask:**
1. Pastikan handler `checkout.session.completed` memanggil allocator entry, bukan hanya set `billing_status`.
2. Untuk Visitor→Paid: cycle Visitor lama harus **ditutup/diganti** cycle baru (PRD: "Visitor→Paid immediate, new cycle now").
3. Pastikan `draw_pass` di-set 4 untuk semua tier berbayar; `-1` hanya sah untuk Visitor.

---

## S2 🔴 Invoice / payment row tidak pernah dibuat

Setelah **2 pembayaran Stripe sukses nyata**, tabel payments kosong total.

```http
GET /api/v1/payments/                 # admin, seluruh platform
Authorization: Bearer <superadmin>
```
```json
→ 200 { "success": true, "message": "OK", "data": [],
        "meta": { "total": 0, "page": null, "pageSize": 20, "hasMore": false } }
```
```http
GET /api/v1/payments/?userId=019f9cbd-3dc5-73fc-b3de-949f4b3e664b
```
```json
→ 200 { "data": [], "meta": { "total": 0, … } }
```
```http
GET /api/v1/payments/me
Authorization: Bearer <token visitor@>          # akun yang baru bayar 5 menit lalu
```
```json
→ 200 { "success": true, "data": [] }
```

**Dampak:** tidak ada riwayat pembayaran, tidak ada `hosted_invoice_url`, tidak ada `stripe_invoice_id`. Ini juga yang **memblokir verifikasi A3** — field `hosted_invoice_url` tidak bisa dites karena barisnya tidak pernah ada.

**Ask:** handler webhook (`checkout.session.completed` dan/atau `invoice.paid`) harus menulis row `payments` berisi minimal — sesuai B1 yang sudah disepakati:
`stripe_invoice_id`, `hosted_invoice_url`, `currency`, `amount_cents`, `discount_cents`, `paid_at`, `type`, `payment_method_brand`, `payment_method_last4`, `sub_tier_snapshot`, `state_snapshot`.

⚠️ Metadata ini **tidak bisa di-backfill** — transaksi yang sudah lewat hilang datanya permanen.

---

## S3 🔴 REGRESI — SELURUH jalur baca `payments` mengembalikan 400

Bukan hanya `billing/invoices`. **Ketiga endpoint yang membaca tabel `payments` mati**, sementara endpoint lain di service yang sama sehat.

| Endpoint | Status 10:31–10:43 UTC | Status 12:24–12:26 UTC |
|---|---|---|
| `GET /api/v1/billing/invoices` | 🔴 400 | 🔴 400 |
| `GET /api/v1/payments/me` | ✅ **200** `{"data":[]}` | 🔴 **400** |
| `GET /api/v1/payments/` (admin) | ✅ **200** `{"data":[],"meta":{"total":0}}` | 🔴 **400** |
| `GET /api/v1/billing/status` | ✅ 200 | ✅ 200 |
| `GET /api/v1/subscriptions/` | ✅ 200 | ✅ 200 |
| `GET /api/v1/memberships/me` | ✅ 200 | ✅ 200 |
| `GET /api/v1/entries/` | ✅ 200 | ✅ 200 |

⚠️ `payments/me` dan `payments/` **masih 200 pada 10:43 UTC dan sudah 400 pada 12:24 UTC** — pecah di rentang ~100 menit itu. Mohon cek deploy/migrasi yang masuk di jendela tersebut.

> **Catatan untuk pembacaan S2:** bukti "0 payment row" pada S2 diambil **10:31–10:43 UTC saat endpoint masih sehat (200 + array kosong)** — bukan hasil dari 400 ini. Dua temuan yang terpisah.

### Daftar ringkas endpoint yang 400

Ketiganya **GET** → tidak ada request body. "Payload" = query string. Semua dicapture 2026-07-26 12:31 UTC.

---

**1. `GET /api/v1/billing/invoices`**

Authorization: `Bearer <JWT red@smartliferewards.com.au>`

payload:
```json
{}
```

response:
```json
{
  "success": false,
  "message": "Unable to process your request.",
  "code": "BAD_REQUEST",
  "requestId": "019f9e68-7d43-77ea-bd13-ae3ed966dec7"
}
```

---

**2. `GET /api/v1/payments/me`**

Authorization: `Bearer <JWT red@smartliferewards.com.au>`

payload:
```json
{}
```

response:
```json
{
  "success": false,
  "message": "Unable to process your request.",
  "code": "BAD_REQUEST",
  "requestId": "019f9e68-7f93-74cc-8893-b704feb3acd3"
}
```

---

**3. `GET /api/v1/payments/`** — Admin: list payments

Endpoint ini punya **4 query param** sesuai OpenAPI. **Keempatnya sudah diuji, semua kombinasi 400.**

```
userId    string (uuid)               opsional
status    enum SUCCEEDED | FAILED     opsional
page      integer, min 1              opsional
pageSize  integer, min 1, max 100     opsional
```

Authorization: `Bearer <JWT superadmin@smartliferewards.com.au>`

**3a — tanpa param**

payload:
```json
{}
```
response:
```json
{
  "success": false,
  "message": "Unable to process your request.",
  "code": "BAD_REQUEST",
  "requestId": "019f9e6c-c0ed-7168-b0e6-e5ce99241026"
}
```

**3b — filter userId**

payload:
```json
{
  "userId": "019f9cbd-3dc5-73fc-b3de-949f4b3e664b"
}
```
response:
```json
{
  "success": false,
  "message": "Unable to process your request.",
  "code": "BAD_REQUEST",
  "requestId": "019f9e6c-c2ff-706b-b6c2-805439886b50"
}
```

**3c — filter status SUCCEEDED**

payload:
```json
{
  "status": "SUCCEEDED"
}
```
response:
```json
{
  "success": false,
  "message": "Unable to process your request.",
  "code": "BAD_REQUEST",
  "requestId": "019f9e6c-c506-756b-8c47-ad9e7b3592f7"
}
```

**3d — filter status FAILED**

payload:
```json
{
  "status": "FAILED"
}
```
response:
```json
{
  "success": false,
  "message": "Unable to process your request.",
  "code": "BAD_REQUEST",
  "requestId": "019f9e6c-c70e-7461-9618-c1ee261de016"
}
```

**3e — paginasi**

payload:
```json
{
  "page": 1,
  "pageSize": 20
}
```
response:
```json
{
  "success": false,
  "message": "Unable to process your request.",
  "code": "BAD_REQUEST",
  "requestId": "019f9e6c-c855-7639-a0b9-6089720a5b8a"
}
```

**3f — keempat param sekaligus**

payload:
```json
{
  "userId": "019f9cbd-3dc5-73fc-b3de-949f4b3e664b",
  "status": "SUCCEEDED",
  "page": 1,
  "pageSize": 20
}
```
response:
```json
{
  "success": false,
  "message": "Unable to process your request.",
  "code": "BAD_REQUEST",
  "requestId": "019f9e6c-ca6d-7458-9fb5-f46e8f12ab7a"
}
```

---

**Pembanding — param sengaja invalid, semuanya dijawab dengan benar:**

**3g — status di luar enum**

payload:
```json
{
  "status": "FOO"
}
```
response:
```json
{
  "success": false,
  "message": "One or more input fields failed validation. Please verify the submitted data and try again.",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "status",
      "message": "Invalid enum value. Expected 'SUCCEEDED' | 'FAILED', received 'FOO'"
    }
  ],
  "requestId": "019f9e6c-de63-74ec-af26-b803a88f7680"
}
```

**3h — pageSize melebihi batas**

payload:
```json
{
  "pageSize": 101
}
```
response:
```json
{
  "success": false,
  "message": "One or more input fields failed validation. Please verify the submitted data and try again.",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "pageSize",
      "message": "Number must be less than or equal to 100"
    }
  ],
  "requestId": "019f9e6c-e06d-72df-9332-2f253f52abd4"
}
```

**3i — userId bukan uuid**

payload:
```json
{
  "userId": "abc"
}
```
response:
```json
{
  "success": false,
  "message": "One or more input fields failed validation. Please verify the submitted data and try again.",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "userId",
      "message": "Invalid uuid"
    }
  ],
  "requestId": "019f9e6c-e281-77ea-9f4a-143be9d28701"
}
```

⇒ Ke-4 param diparse dan divalidasi dengan benar (3g–3i). Tidak ada kombinasi valid yang lolos (3a–3f). Kegagalan terjadi **setelah** validasi.

> **Catatan drift kontrak (minor):** paginasi tidak konsisten antar endpoint — `/billing/invoices` memakai `per_page` (snake_case), `/payments/` memakai `pageSize` (camelCase). Mohon diseragamkan atau dikonfirmasi disengaja.

---

**4. `GET /api/v1/billing/invoices?page=1&per_page=10`** — dengan parameter valid, tetap gagal

Authorization: `Bearer <JWT red@smartliferewards.com.au>`

payload:
```json
{
  "page": 1,
  "per_page": 10
}
```

response:
```json
{
  "success": false,
  "message": "Unable to process your request.",
  "code": "BAD_REQUEST",
  "requestId": "019f9e68-83f6-7240-b8e7-1615ed562198"
}
```

---

**5. `GET /api/v1/billing/invoices?per_page=101`** — PEMBANDING, parameter sengaja invalid

Authorization: `Bearer <JWT red@smartliferewards.com.au>`

payload:
```json
{
  "per_page": 101
}
```

response:
```json
{
  "success": false,
  "message": "One or more input fields failed validation. Please verify the submitted data and try again.",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "per_page",
      "message": "Number must be less than or equal to 100"
    }
  ],
  "requestId": "019f9e68-8621-775f-9a48-3bbd378a8888"
}
```

👉 Bandingkan **#4 dan #5**: parameter yang **salah** dijawab rapi dengan `VALIDATION_ERROR` + detail field, sedangkan parameter yang **benar** dijawab `BAD_REQUEST` generik. Ini bukti paling ringkas bahwa validasi lolos dan kegagalan terjadi **setelah** itu — di query ke tabel `payments`.

---

### Payload lengkap — request & response mentah

```http
GET /api/v1/billing/invoices HTTP/2
Host: api.smartliferewards.com.au
Authorization: Bearer <JWT red@smartliferewards.com.au>
Accept: application/json
User-Agent: curl/8.7.1
```
*(GET — tidak ada request body)*

```http
HTTP/2 400
date: Sun, 26 Jul 2026 12:24:54 GMT
content-type: application/json; charset=utf-8
content-length: 133
server: cloudflare
x-request-id: 019f9e62-abb9-74dc-b103-51bd7f3082c1
x-ratelimit-limit: 200
x-ratelimit-remaining: 199
cf-ray: a213624ac845ce52-SIN
vary: Origin
access-control-allow-credentials: true

{"success":false,"message":"Unable to process your request.","code":"BAD_REQUEST","requestId":"019f9e62-abb9-74dc-b103-51bd7f3082c1"}
```

`x-request-id` header == `requestId` di body → bisa langsung di-grep di log aplikasi.

### Bukti ini BUKAN kegagalan validasi

Parameter yang **sengaja dibuat salah** menghasilkan error yang **berbeda** — artinya lapisan validasi berjalan normal dan **meloloskan** input yang valid. Yang gagal ada di **belakang** validasi.

| Query | HTTP | `code` | Arti |
|---|---|---|---|
| *(tanpa param)* | 400 | `BAD_REQUEST` | ❌ input valid, tetap gagal |
| `?page=1` | 400 | `BAD_REQUEST` | ❌ input valid, tetap gagal |
| `?per_page=20` (= default) | 400 | `BAD_REQUEST` | ❌ input valid, tetap gagal |
| `?page=1&per_page=10` | 400 | `BAD_REQUEST` | ❌ input valid, tetap gagal |
| `?per_page=101` (> max 100) | 400 | `VALIDATION_ERROR` | ✅ validasi bekerja |
| `?per_page=0` (< min 1) | 400 | `VALIDATION_ERROR` | ✅ validasi bekerja |
| `?page=abc` (salah tipe) | 400 | `VALIDATION_ERROR` | ✅ validasi bekerja |

Contoh respons validasi yang benar (sebagai pembanding):
```json
→ 400
{ "success": false,
  "message": "One or more input fields failed validation. Please verify the submitted data and try again.",
  "code": "VALIDATION_ERROR",
  "errors": [ … ] }
```

### Bukti ini BUKAN masalah auth / token / user

| Uji | Hasil |
|---|---|
| Tanpa `Authorization` | **401** `UNAUTHORIZED` → middleware auth jalan duluan |
| Token sama → `/billing/status` | **200** |
| Token sama → `/memberships/me` | **200** |
| Token sama → `/entries/` | **200** |
| 3× berturut, `red@` + `visitor@` | **400 konsisten** (bukan intermiten) |
| `superadmin@` | **400** juga |

Semua requestId 400 yang tertangkap (silakan telusuri di log):

| Waktu (UTC) | Endpoint | Akun | requestId |
|---|---|---|---|
| 10:29 | `billing/invoices` | `red@` | `019f9dfa-da5a-7159-858a-b97fe60f9618` |
| 10:29 | `billing/invoices` | `visitor@` | `019f9dfa-e439-751b-b8d6-2e889fc040a7` |
| 10:30 | `billing/invoices?page=1&per_page=10` | `red@` | `019f9dfb-4f5b-774e-a580-cf26bf5e1660` |
| 10:30 | `billing/invoices?page=1` | `red@` | `019f9dfb-514d-7462-8473-71e09d867be4` |
| 10:31 | `billing/invoices` | `superadmin@` | `019f9dfc-9bf4-738d-8b89-0bc1003f493c` |
| 10:31 | `billing/invoices` | `visitor@` | `019f9dfc-9f01-7360-9181-c57b28bd5350` |
| 10:43 | `billing/invoices` | `visitor@` | `019f9e06-4851-7657-8584-ffc7549894d3` |
| 12:24 | `billing/invoices` | `red@` | `019f9e62-abb9-74dc-b103-51bd7f3082c1` |
| 12:25 | `billing/invoices` | `red@` | `019f9e63-91e8-729d-8715-b9e9d1d4ebfd` |
| 12:25 | `payments/me` | `red@` | `019f9e63-a894-7158-a9e2-873547f8a62f` |
| 12:26 | `payments/` (admin) | `superadmin@` | `019f9e64-6061-7…` |
| 12:26 | `payments/me` | `superadmin@` | `019f9e64-618e-7…` |
| 12:26 | `billing/invoices` | `superadmin@` | `019f9e64-62c8-7…` |

### Dugaan penyebab — dikuatkan oleh regenerate OpenAPI 12:47 UTC

Saat laporan ini disusun, OpenAPI di-regenerate dan schema `GET /billing/invoices` **bertambah 6 field metadata**:

```diff
  item invoice — SEBELUMNYA (12:26 UTC)        item invoice — SEKARANG (12:47 UTC)
  invoice_id                                   invoice_id
  amount_cents                                 amount_cents
  discount_cents                               discount_cents
  stripe_invoice_id                            stripe_invoice_id
  paid_at                                      paid_at
  type                                         type
+                                              currency
+                                              hosted_invoice_url
+                                              payment_method_brand
+                                              payment_method_last4
+                                              state_snapshot
+                                              sub_tier_snapshot
```

Ini persis field metadata B1 yang diminta. **Tapi endpointnya tetap 400** — diuji ulang 12:47:33 UTC, ketiganya masih gagal:

```
GET /billing/invoices  → 400  requestId 019f9e77-6c75-70f8-9e4f-d5e7f7e58eca
GET /payments/me       → 400  requestId 019f9e77-6e93-760a-ae07-ca96fcb4111c
GET /payments/         → 400  requestId 019f9e77-70a1-7756-bdd5-1e5d21ba464f
GET /billing/status    → 200  (kontrol, tetap sehat)
```

⇒ Kode dan schema **sudah** memuat kolom metadata baru, tapi pembacaannya meledak. Ini sangat cocok dengan **kolom baru yang belum ada di database** — query menyeleksi `currency`, `hosted_invoice_url`, `payment_method_brand`, `payment_method_last4`, `state_snapshot`, `sub_tier_snapshot`, driver melempar exception, lalu ter-map jadi `BAD_REQUEST` generik.

Cocok pula dengan lini masanya: `payments/me` masih 200 pukul 10:43 (sebelum kolom ditambahkan) dan sudah 400 pukul 12:24 (sesudah).

**Cek tercepat:** bandingkan kolom tabel `payments` di database dengan field yang diseleksi query. Kemungkinan besar migrasinya belum dijalankan di environment ini.

### Ask

1. Grep log dengan `requestId` mana pun di tabel atas → ambil **stack trace aslinya**. Pesan `"Unable to process your request."` menyembunyikan error sebenarnya.
2. Periksa deploy/migrasi antara **10:43** dan **12:24 UTC 2026-07-26**.
3. Pastikan skema tabel `payments` dan query pembacanya sinkron.
4. Setelah pulih, **regenerate OpenAPI** — spec live masih memuat schema invoice lama tanpa `hosted_invoice_url`:
   ```json
   { "invoice_id": "uuid", "amount_cents": number, "discount_cents": number,
     "stripe_invoice_id": "string|null", "paid_at": "string", "type": "string" }
   ```
5. Pertimbangkan menaikkan detail error: exception tak tertangani sebaiknya **500**, bukan `400 BAD_REQUEST` — 400 memberi sinyal salah ke klien bahwa request-nya yang keliru.

**Status frontend:** tombol **View** invoice sudah di-wire defensif — begitu endpoint pulih dan field-nya ada, tombolnya muncul otomatis tanpa perubahan FE. Saat ini tabel payment-history hanya menampilkan empty state.

---

## S4 🔴 `POST /stripe/checkout` — `subTierId` tidak terdokumentasi, plus 4 cacat perilaku

> **Koreksi laporan awal.** Sebelumnya kami menyimpulkan "sub-tier tidak bisa dibeli". **Itu keliru** — field `subTierId` **ada dan berfungsi** untuk ketujuh sub-tier. Masalah sebenarnya: field itu **tidak ada di OpenAPI**, sehingga klien yang membangun berdasarkan spec tidak mungkin tahu keberadaannya.

### S4.1 ✅ RESOLVED 12:47 UTC — `subTierId` kini ada di spec

> **Update 2026-07-26 12:47 UTC.** OpenAPI sudah di-regenerate saat laporan ini disusun. `subTierId` kini terdokumentasi dan `tier` tidak lagi wajib — persis sesuai permintaan. Laporan asli disimpan di bawah sebagai catatan. **Tidak ada aksi tersisa untuk butir ini.**
>
> ```json
> // requestBody sekarang
> { "tier":      { "type": "string", "enum": ["RED","BLUE"] },
>   "subTierId": { "type": "string", "maxLength": 20 },        // ← BARU
>   "couponId":  { "type": "string", "maxLength": 100 } }
> // "required": ["tier"]  ← DIHAPUS, kini opsional
> ```
>
> Sisa permintaan kecil: batasi `subTierId` sebagai **enum** (`r1,r4,r7,b1,b4,b7,b10`) alih-alih `string maxLength 20`, supaya nilai salah tertolak di validasi, bukan baru ketahuan sebagai 404.

<details>
<summary>Laporan asli (sebelum regenerate) — disimpan sebagai riwayat</summary>

OpenAPI saat itu hanya mencantumkan 2 field:
```json
{ "tier": "RED" | "BLUE",     // required
  "couponId": "string"        // optional, maxLength 100
}
```

Tapi validator server membocorkan field ketiga:
```json
// POST /stripe/checkout  payload {}
→ 400 { "code": "VALIDATION_ERROR",
        "errors": [ { "message": "Either tier or subTierId must be provided." } ] }
```

Dan `subTierId` **berhasil untuk semua sub-tier** (dites 2026-07-26 12:43 UTC, semua 200):

| payload | HTTP |
|---|---|
| `{ "subTierId": "r1" }` | 200 |
| `{ "subTierId": "r4" }` | 200 |
| `{ "subTierId": "r7" }` | 200 |
| `{ "subTierId": "b1" }` | 200 |
| `{ "subTierId": "b4" }` | 200 |
| `{ "subTierId": "b7" }` | 200 |
| `{ "subTierId": "b10" }` | 200 |
| `{ "subTierId": "xx" }` | 404 `NOT_FOUND` — "The requested membership tier configuration was not found." |

**Dampak nyata:** karena mengikuti spec, frontend hanya mengirim `{ "tier": "RED" }` → server memilih sendiri sub-tier termurah, dan member mendarat di **r1 ($10)**. Terbukti pada pembayaran uji: kirim `tier: RED`, hasil akhir `subTierId: "r1"`. Selama `subTierId` tidak didokumentasikan, ladder harga r4/r7/b4/b7/b10 tidak akan pernah terjual lewat integrasi yang taat spec.

**Ask:** tambahkan `subTierId` (enum `r1,r4,r7,b1,b4,b7,b10`) ke schema `POST /stripe/checkout` di OpenAPI, dan konfirmasi apakah ia menggantikan atau melengkapi `tier`.

</details>

### S4.2 🔴 `couponId` selalu gagal — error Stripe mentah bocor ke klien

```json
// payload { "tier": "RED", "couponId": "TIDAKADA123" }
→ 400 { "success": false,
        "message": "You may only specify one of these parameters: allow_promotion_codes, discounts.",
        "code": "BAD_REQUEST",
        "requestId": "019f9e72-792d-71ae-85c0-d9a044379921" }
```

Ini **pesan error Stripe apa adanya**, bukan error aplikasi. Artinya backend menyetel `allow_promotion_codes` **dan** `discounts` sekaligus pada Checkout Session — kombinasi yang ditolak Stripe. Konsekuensinya `couponId` **tidak bisa dipakai sama sekali**, apa pun nilainya.

**Ini memblokir Spin Wheel.** PRD: hadiah spin = potongan sekali pakai pada invoice tersebut, yang jalurnya lewat coupon/discount di Checkout Session.

**Ask:** pilih salah satu — `allow_promotion_codes` **atau** `discounts` — jangan keduanya. Lalu bungkus error Stripe agar tidak bocor mentah ke klien.

### S4.3 🟠 `subTierId: "visitor"` menghasilkan sesi pembayaran

```json
// payload { "subTierId": "visitor" }
→ 200 { "data": { "url": "https://checkout.stripe.com/c/pay/cs_test_b1lYulnDY1iJ2fdPUt…",
                  "sessionId": "cs_test_b1lYulnDY1iJ2fdPUt…" } }
```

Visitor adalah tier **gratis**. Membuat Checkout Session untuknya tidak masuk akal dan berpotensi menagih member untuk sesuatu yang seharusnya nol biaya.

**Ask:** tolak `subTierId: "visitor"` dengan 400.

### S4.4 🟠 `tier` dan `subTierId` yang bertentangan diterima diam-diam

```json
// payload { "tier": "RED", "subTierId": "b10" }   ← RED vs sub-tier BLUE
→ 200 { "data": { "sessionId": "cs_test_b156wSNm5Fon7wim9O…" } }
```

Tidak ada error walau keduanya bertabrakan. Tidak jelas mana yang menang. Sama halnya, field asing di-strip senyap:

```json
{ "tier": "RED", "sub_tier": "r4" }    → 200   // sub_tier diabaikan
{ "tier": "RED", "subTier":  "r4" }    → 200   // subTier diabaikan
```

Klien mendapat 200 dan mengira sub-tier pilihannya terpakai, padahal dibuang. Ini persis jenis kegagalan senyap yang menghasilkan salah tagih.

**Ask:** tolak kombinasi `tier`/`subTierId` yang tidak konsisten dengan 400, dan tolak field tak dikenal alih-alih men-strip-nya.

### S4.5 🟠 Member yang sudah berlangganan tetap bisa membuat checkout baru

Semua uji di atas dijalankan dengan `visitor@` yang **sudah berlangganan aktif**:
```json
GET /memberships/me  → { "subTierId": "r1", "billingStatus": "ACTIVE" }
GET /billing/status  → { "billing_status": "active",
                         "stripe_subscription_id": "sub_1TxPRmEAtqxn8cm3QDLL5UVa" }
```
Namun `POST /stripe/checkout` tetap **200** dan membuat sesi baru. Kalau dibayar, member punya **dua subscription Stripe aktif** → tertagih dua kali.

Frontend sudah memagari ini sendiri (tombol upgrade hanya untuk tier VISITOR), tapi server semestinya tidak bergantung pada disiplin klien.

**Ask:** tolak checkout bila member sudah punya subscription aktif — arahkan ke `POST /memberships/upgrade` atau Billing Portal.

### Konteks — config tier sudah benar (AUD cents)

```http
GET /api/v1/memberships/tiers
```
```json
→ 200 data = {
  "red":  [ { "sub_tier":"r1",  "price_cents":1000, "token":1,  "draw_pass":4, "spin":false },
            { "sub_tier":"r4",  "price_cents":2000, "token":4,  "draw_pass":4, "spin":true  },
            { "sub_tier":"r7",  "price_cents":3000, "token":7,  "draw_pass":4, "spin":true  } ],
  "blue": [ { "sub_tier":"b1",  "price_cents":2600, "token":1,  "draw_pass":4 },
            { "sub_tier":"b4",  "price_cents":3900, "token":4,  "draw_pass":4 },
            { "sub_tier":"b7",  "price_cents":5200, "token":7,  "draw_pass":4 },
            { "sub_tier":"b10", "price_cents":6500, "token":10, "draw_pass":4 } ] }
```

Tapi mapping ke Stripe kosong: `GET /memberships/me` → `data.subTier.stripePriceId = null`. Mohon konfirmasi bagaimana Price Stripe dipilih per sub-tier, dan pastikan webhook memakai sub-tier itu untuk alokasi token (lihat S1).

---

## S5 🟠 Siklus billing 30 hari, bukan 28 — dan `current_period_start` di masa depan

Tereproduksi identik di kedua akun.

| | Akun A | Akun B |
|---|---|---|
| Waktu bayar / sub dibuat | `2026-07-26T10:11:51.336Z` | `2026-07-26T10:38:20.4Z` |
| `current_period_start` | `2026-07-28T10:11:51.327Z` | `2026-07-28T10:38:20.438Z` |
| `current_period_end` | `2026-08-25T10:11:51.327Z` | `2026-08-25T10:38:20.438Z` |
| `membership.renew_at` | `2026-08-25T10:11:51.327Z` | `2026-08-25T10:38:20.438Z` |

Hitungannya:
- bayar → `period_end` = **+30 hari** (seharusnya +28)
- bayar → `period_start` = **+2 hari, di masa depan** (saat dibaca 10:43Z tanggal 26, period_start tertulis tanggal 28)
- `period_start` → `period_end` = 28 hari ✅ (rentangnya benar, **anchor-nya yang geser +2 hari**)

**Expected (PRD):** siklus 28 hari **anchored ke detik pembayaran sukses**. Untuk Akun B seharusnya `2026-08-23T10:38:20.438Z`.

Pola konsisten di dua akun ⇒ deterministik, bukan anomali sesaat. Dugaan: interval Stripe Price bukan 28 hari (mis. `interval=day, interval_count=30` atau `month`), lalu `period_start` diturunkan dari `end − 28d`.

**Ask:** konfirmasi interval Stripe Price, dan pastikan `period_start` = waktu pembayaran, `period_end` = pembayaran + 28 hari.

---

## ~~S6~~ ✅ Mata uang checkout — SELESAI, tidak perlu aksi

Laporan A5 sebelumnya menyebut harga tampil **IDR**. Pada uji ini terlihat **IDR dan AUD bersamaan** — dan sudah dikonfirmasi bahwa ini **bukan defect di sisi aplikasi** (perilaku tampilan di level akun Stripe, bukan Price object yang salah currency).

**Tidak ada yang perlu dikerjakan backend maupun frontend untuk item ini.** Dicatat di sini hanya agar A5 pada [BACKEND-ISSUES.md](BACKEND-ISSUES.md) bisa ditutup dan tidak dilaporkan ulang.

Satu-satunya sisa yang masih relevan: pastikan kolom `payments.currency` menyimpan `aud` saat row payment akhirnya ditulis (lihat S2).

---

## Cara reproduksi (untuk backend)

```bash
API=https://api.smartliferewards.com.au/api/v1

# 1. login
TOKEN=$(curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"visitor@smartliferewards.com.au","password":"ChangeMeImmediately!1"}' \
  | jq -r .data.access_token)

# 2. buat checkout session
curl -s -X POST "$API/stripe/checkout" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"tier":"RED"}' | jq .

# 3. buka .data.url, bayar dengan 4242 4242 4242 4242, exp 12/30, cvc 123

# 4. cek hasil — cycle & invoice tidak akan terbentuk
curl -s "$API/billing/status"   -H "Authorization: Bearer $TOKEN" | jq .
curl -s "$API/entries/"         -H "Authorization: Bearer $TOKEN" | jq .data.current_cycle
curl -s "$API/payments/me"      -H "Authorization: Bearer $TOKEN" | jq .
curl -s "$API/billing/invoices" -H "Authorization: Bearer $TOKEN" | jq .   # 400
```

Untuk telusur di Stripe Dashboard (test mode) → Developers → Webhooks, cari event untuk session:
- Akun A: subscription `sub_1TxJxnEAtqxn8cm3a0AGGHPZ`, customer `cus_UxEOBn2lw3mQIf`
- Akun B: subscription `sub_1TxPRmEAtqxn8cm3QDLL5UVa`, session `cs_test_b18ailwgdv2dgLZdCQd3tw0fv76FWlyfJrFm5lrQF4qMwmiOpSXWKFC6GM`

Periksa **delivery attempts + response code** tiap event — khususnya apakah `checkout.session.completed` menghasilkan 2xx tapi handler-nya berhenti setelah set `billing_status`.

---

## Urutan pengerjaan yang disarankan

1. **S3** — perbaiki 400 (paling kecil, membuka jalan verifikasi invoice).
2. **S2 + B1 metadata** — tulis row `payments` lengkap. Tidak bisa di-backfill, makin cepat makin baik.
3. **S1** — allocator cycle di webhook. Tanpa ini seluruh mekanisme undian tidak jalan.
4. **S4** — Price AUD per sub-tier + `sub_tier` di body checkout.
5. **S5** — anchor 28 hari.

## Catatan data uji

Semua temuan di atas dibuktikan lewat **transaksi baru**, bukan data seed:

- `fe-stripe-test-1785041074@example.com` — registrasi paid baru, bayar sungguhan. Akun throwaway, aman dipurge setelah trace webhook selesai.
- `visitor@smartliferewards.com.au` — kini **paid r1 dengan subscription Stripe nyata** (`sub_1TxPRmEAtqxn8cm3QDLL5UVa`) hasil pembayaran uji. Tidak perlu di-restore kecuali dibutuhkan untuk tes lain.
