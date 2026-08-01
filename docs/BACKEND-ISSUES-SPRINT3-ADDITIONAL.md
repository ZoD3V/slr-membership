# Temuan Tambahan Saat Live Testing (2026-07-29)

Berikut adalah dua bug backend baru yang terdeteksi saat melakukan simulasi pembayaran nyata (E2E) pasca-registrasi menggunakan akun test `test696969@stripe.com`.

---

## 1. Bug Webhook: stripe_subscription_id Mismatch / Null setelah Pembayaran Sukses

### Detail Terjadinya Error
Meskipun status pembayaran dialihkan ke `active`, endpoint `GET /api/v1/billing/status` mengembalikan `stripe_subscription_id: null`. Akibatnya, API `POST /api/v1/subscriptions/me/cancel` melempar error karena backend tidak memiliki ID subscription Stripe yang valid untuk dibatalkan di database.

### API
**Endpoint:** `POST /api/v1/subscriptions/me/cancel`

### Payload (Request Header)
```
Authorization: Bearer <access_token>
```

### Response
```json
HTTP/1.1 404 Not Found
{
  "success": false,
  "message": "No active subscription found associated with your user account to cancel.",
  "code": "NOT_FOUND",
  "requestId": "019fabff-f4e8-75b9-8e1c-9a0822f3aef8"
}
```

### Verifikasi Status Billing
**Endpoint:** `GET /api/v1/billing/status`

**Response:**
```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {
    "billing_status": "active",
    "next_renewal_at": null,
    "grace_period": null,
    "stripe_subscription_id": null
  }
}
```

### Dampak
User berbayar yang baru saja sukses melakukan pembayaran di Stripe tidak dapat membatalkan membership mereka dari halaman dashboard/membership.

### Root Cause
Handler webhook backend (`checkout.session.completed` atau `invoice.payment_succeeded`) mengubah status member menjadi `active` tetapi tidak menyimpan/menyinkronkan `stripe_subscription_id` dari Stripe event ke database.

### Rekomendasi Perbaikan
1. Pastikan webhook handler menyimpan `subscription.id` dari Stripe event ke kolom `stripe_subscription_id` di tabel users/memberships
2. Validasi bahwa setiap member dengan `billing_status: "active"` wajib memiliki `stripe_subscription_id` yang tidak null

---

## 2. Bug Stripe Idempotency Key: Konflik Idempotensi saat Berpindah/Ganti Paket

### Detail Terjadinya Error
Jika user melakukan registrasi plan berbayar, lalu menekan tombol kembali (back) dari Stripe Checkout dan memilih plan lain (misal dari Red Premium ke Blue), request checkout BENY (`POST /api/v1/beny/subscribe`) selanjutnya menghasilkan error 400 Bad Request dari Stripe. Ini karena backend menggunakan format Idempotency Key statis berbasiskan ID User (`cust-<user_id>`) untuk memanggil Stripe API, padahal parameter produk/tier/harga telah berubah.

### API
**Endpoint:** `POST /api/v1/beny/subscribe`

### Payload
```json
{
  "name": "test696969",
  "email": "test696969@stripe.com",
  "phone": "6269696966969"
}
```

### Request Header
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Response
```json
HTTP/1.1 400 Bad Request
{
  "success": false,
  "message": "Keys for idempotent requests can only be used with the same parameters they were first used with. Try using a key other than 'cust-019fa964-568f-75fc-89fa-4a20f74ae1aa' if you meant to execute a different request.",
  "code": "BAD_REQUEST",
  "requestId": "019fac00-3fb9-7198-9c4f-0dfba408bc4d"
}
```

### Dampak
User yang sempat mengganti paket saat checkout pertama diblokir selamanya untuk membeli addon BENY $4/bulan karena Stripe menolak request dengan idempotency key yang sama tetapi parameter berbeda.

### Root Cause
Backend menggunakan `user_id` sebagai Idempotency Key statis saat melakukan request ke Stripe API. Ketika user mengubah pilihan paket (misal: Red R7 → Blue B1), parameter yang dikirim ke Stripe berubah, tetapi Idempotency Key tetap sama (`cust-<user_id>`). Stripe mendeteksi inkonsistensi ini dan menolak request.

### Skenario Reproduksi
1. User registrasi dengan plan Red Premium (R7)
2. User redirect ke Stripe Checkout
3. User klik tombol Back/Cancel di Stripe
4. User kembali ke form registrasi dan ganti plan ke Blue (B1)
5. User submit kembali → Stripe checkout berhasil dengan plan baru
6. Setelah pembayaran sukses, user mencoba subscribe BENY
7. Backend memanggil Stripe API dengan idempotency key `cust-019fa964-568f-75fc-89fa-4a20f74ae1aa`
8. Stripe menolak karena key tersebut sudah pernah digunakan dengan parameter berbeda (Red R7 vs Blue B1)

### Rekomendasi Perbaikan
Backend harus men-generate Idempotency Key secara dinamis menggunakan UUID baru untuk setiap request sesi checkout Stripe, bukan me-reuse `user_id` yang statis.

**Contoh implementasi:**
```javascript
// ❌ SALAH - Static key berdasarkan user_id
const idempotencyKey = `cust-${userId}`;

// ✅ BENAR - Dynamic key per request
const { v4: uuidv4 } = require('uuid');
const idempotencyKey = uuidv4();
```

---

## Catatan Pengujian

**Akun Test:** `test696969@stripe.com`  
**User ID:** `019fa964-568f-75fc-89fa-4a20f74ae1aa`  
**Tanggal Verifikasi:** 2026-07-29  
**Base API:** `https://api.smartliferewards.com.au/api/v1`  
**Metode Verifikasi:** Direct HTTP request menggunakan `curl` dengan token JWT valid

### Command Verifikasi Bug #1 (Cancel Subscription)
```bash
TOKEN=$(curl -s -X POST https://api.smartliferewards.com.au/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test696969@stripe.com","password":"ChangeMeImmediately!1"}' \
  | jq -r '.data.access_token')

curl -s -X POST https://api.smartliferewards.com.au/api/v1/subscriptions/me/cancel \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Command Verifikasi Bug #2 (BENY Subscribe)
```bash
TOKEN=$(curl -s -X POST https://api.smartliferewards.com.au/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test696969@stripe.com","password":"ChangeMeImmediately!1"}' \
  | jq -r '.data.access_token')

curl -s -X POST https://api.smartliferewards.com.au/api/v1/beny/subscribe \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test696969","email":"test696969@stripe.com","phone":"6269696966969"}' | jq .
```
