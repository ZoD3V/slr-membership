# SLR Membership — Backend Verification & Issue Rules

Standard operating procedures for auditing, testing, and verifying the SLR Next.js parent platform integrations with the Express.js API.

---

## 1. General API Conventions
- **Base URL:** `https://api.smartliferewards.com.au/api/v1`
- **Response Envelope:** `apiFetch` unwraps the standard `{ success, message, data, meta }` response. Always read `data`.
- **Mata Uang:** Integer cents (AUD) ONLY. Div oleh 100 untuk rupiah/dollar di UI.
- **Siklus Billing:** Tepat 28 hari anchored dari waktu transaksi Stripe sukses.

---

## 2. Pendaftaran (Registration) & Login
- **Registrasi Paid Tiers (RED/BLUE):**
  - Mengembalikan `requires_otp: false`, `requires_payment: true`, `access_token` dan `refresh_token`.
  - Token ini digunakan langsung untuk menembak `POST /membership/checkout` tanpa force OTP.
- **Login Gates:**
  - Login **WAJIB** diizinkan bagi user dengan status pembayaran tertunda (`requires_payment: true` / pending).
  - Pembatasan status "ACTIVE only" dilarang agar user tidak terkunci.
  - Setelah login berhasil, middleware/Auth redirection mendeteksi `requiresPayment === true` dan mengalihkan user ke `/complete-payment` (bukan `/dashboard` atau `/member`).
- **Daftar Ulang (Duplicate Account):**
  - Mendaftar ulang menggunakan email yang sama namun belum membayar harus ditolak oleh API dengan error `409 ACCOUNT_PENDING_PAYMENT`.
  - Frontend menangkap error ini dan mengarahkan kembali ke sign-in dengan query email terisi.

---

## 3. Stripe Checkout & Webhook Verification
- **Checkout URL: /membership/checkout vs /stripe/checkout**
  - Gunakan `POST /membership/checkout` dengan body `{ sub_tier }` untuk membuat checkout session baru saat ganti sub-tier dari status pending.
  - Sesi lama akan kedaluwarsa setelah 24 jam.
  - `/stripe/checkout` hanya boleh dipakai untuk kenaikan/perubahan tier di halaman account terautentikasi oleh Visitor.
- **Webhook Aktivasi (A4/S1/S2):**
  - Pengetesan webhook menggunakan test card Stripe `4242 4242 4242 4242`.
  - Setelah redirect pembayaran sukses (`/payment/success?session_id=...`), lakukan polling status `GET /billing/status` untuk memastikan:
    - Status menjadi `active`,
    - Terbuat cycle baru di database dengan default tokens (misal `r4 === 4` token),
    - Terbentuk baris invoice di `GET /billing/invoices` dan record payment di `GET /payments/me`.

---

## 4. Spin Wheel Rules
- **Eligibility:**
  - Terbatas 1x per pendaftaran, terikat pada ID pengguna (`user_id`) dan momen (`moment` = 'signup' | 'renewal'), bukan pada plan/sub-tier.
  - database harus memvalidasi unique constraint `(user_id, moment)`.
- **Harga Discount:**
  - `discount_cents` tidak diselesaikan saat roda berputar (spin), melainkan direduksi langsung ke Stripe line item saat checkout session dibentuk.

---

## 5. Log Akun Pengujian
Setiap kali melakukan simulasi/pendaftaran akun test di mode production/staging, wajib mencatat riwayat berikut ke dalam `docs/BACKEND-ISSUES.md` di bagian lampiran:
- Email test
- UUID (`user_id`)
- Stripe Customer ID (`cus_...`)
- Stripe Subscription ID (`sub_...`)
- Tier & Sub-tier (`red/r4`, `blue/b4`, dll)
- Tanggal s/d Waktu (AEST/UTC) pembuatan
