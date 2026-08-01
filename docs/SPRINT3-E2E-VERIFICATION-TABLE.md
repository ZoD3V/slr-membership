# Tabel Verifikasi End-to-End Sprint 3 (Pasca-Perbaikan Bug A6 & A7)

**Tanggal:** 2026-07-30  
**Tujuan:** Memverifikasi perbaikan bug A6 (stripe_subscription_id null) dan A7 (Stripe Idempotency Key conflict) setelah backend diperbaiki.

---

## Tabel Verifikasi Lengkap

| # | Langkah Aksi Pengguna | Respons Sistem yang Diharapkan | Target Verifikasi | Status |
|:---:|:---|:---|:---|:---:|
| **1** | Buka `/sign-up`, isi data akun (nama, email baru, password, state, DOB, phone). Klik **Next**. | Pindah ke **Step 2 (Plan Selection)** dengan form tersimpan di state lokal. | Data form tidak hilang saat berpindah step. | ⬜ |
| **2** | Pilih plan **Blue B4 ($39/mo)**. Klik **Next**. | API `POST /auth/register` dipanggil dengan `sub_tier: "b4"`. Akun dibuat dengan status `pending_payment`, token JWT didapat. | `checkoutToken` terisi, user dialihkan ke halaman Spin Wheel. | ⬜ |
| **3** | Klik **Spin** pada roda undian. | Memanggil `POST /api/v1/spin`. Jika menang, diskon tercatat. Tampilkan hasil spin, lalu tombol **Continue to checkout** muncul. | Spin hanya bisa dilakukan 1x per akun (refresh tidak reset). | ⬜ |
| **4** | Klik **Complete Payment**. | FE memanggil `POST /membership/checkout` dengan Bearer token. Dapat URL Stripe Checkout. Redirect otomatis ke domain Stripe dengan nominal B4 (dan diskon spin jika ada). | Halaman Stripe Checkout terbuka dengan harga yang benar (AUD). | ⬜ |
| **5** | **[TEST BUG A7]** Klik tombol **Back/Cancel** di Stripe Checkout. | Stripe me-redirect ke `/payment/cancel`. FE otomatis redirect ke `/complete-payment?status=cancelled`. | Menampilkan layar "Complete payment" dengan opsi **Change Plan** dan **Complete payment**. | ⬜ |
| **6** | **[TEST BUG A7]** Klik **Change plan**, pilih **Red R7 ($30)**, lalu klik **Complete payment** lagi. | Memicu checkout baru untuk Red R7 melalui `POST /membership/checkout` dengan `sub_tier: "r7"`. Redirect ke Stripe dengan nominal $30. | ✅ **VERIFIKASI BUG A7:** Checkout berhasil tanpa error Stripe Idempotency Key conflict. | ⬜ |
| **7** | Masukkan kartu test Stripe `4242 4242 4242 4242` (exp: future, CVC: any 3 digits, ZIP: any). Klik **Pay**. | Stripe memproses pembayaran, webhook `checkout.session.completed` dipanggil backend. Stripe me-redirect ke `/payment/success?session_id=cs_test_...`. | Halaman `/payment/success` muncul dengan status "Processing payment...". | ⬜ |
| **8** | Tunggu polling aktivasi (2-10 detik). | FE me-run polling `GET /billing/status` setiap 2 detik. Ketika webhook selesai, status berubah menjadi `active` dan `stripe_subscription_id` tersimpan. | Laman sukses menampilkan tombol **Sign In to Dashboard** ketika status berubah menjadi `active`. | ⬜ |
| **9** | Klik **Sign In to Dashboard**. | Logout paksa → redirect ke `/sign-in`. | User logout dan dialihkan ke halaman login. | ⬜ |
| **10** | Login kembali dengan email dan password yang sama. | Login berhasil, middleware NextAuth mendeteksi `requiresPayment: false` (dari `/auth/me`), user dialihkan langsung ke `/member` (dashboard utama). | Dashboard member terbuka dengan akses penuh (tidak redirect ke `/complete-payment`). | ⬜ |
| **11** | **[TEST BUG A6]** Masuk ke `/member/membership`, klik tombol **Cancel membership**. | Dialog konfirmasi muncul dengan tanggal renewal sebagai batas akhir akses. Klik **Continue**. API `POST /subscriptions/me/cancel` dipanggil. | ✅ **VERIFIKASI BUG A6:** API mengembalikan 200 OK, status berubah menjadi `cancelled` atau grace period aktif. Tidak ada error "No active subscription found". | ⬜ |
| **12** | Refresh halaman `/member/membership`. | Laman diperbarui dengan status penangguhan (*grace period*) dan tanggal akhir akses gratis ditampilkan. Tombol **Cancel membership** disembunyikan (karena sudah dibatalkan). | Status langganan menampilkan info grace period dengan benar. | ⬜ |
| **13** | **[TEST BUG A7]** Di halaman `/member/discounts`, scroll ke bagian BENY, klik **Get BENY Access ($4/mo)**. | Form input nama, email, phone muncul. Isi form dan klik **Subscribe**. | API `POST /beny/subscribe` dipanggil dengan payload `{name, email, phone}`. | ⬜ |
| **14** | **[TEST BUG A7]** Tunggu response dari API BENY. | ✅ **VERIFIKASI BUG A7:** API mengembalikan 200 OK dengan status `pending_activation`. Tidak ada error Stripe Idempotency Key conflict. Toast sukses muncul: "BENY requested — pending admin activation." | Status BENY berubah menjadi `pending_activation`. | ⬜ |
| **15** | Logout dari web. Buka `/sign-in`, masukkan kredensial yang sama. | Login diizinkan. Middleware NextAuth mengenali `requiresPayment: false`, user dialihkan langsung ke `/member`. | Akses dashboard lancar tanpa redirect ke `/complete-payment`. | ⬜ |
| **16** | Buka `/sign-up`, daftarkan email yang sama lagi. | API me-return status `409 ACCOUNT_PENDING_PAYMENT` atau `ACCOUNT_EXISTS`. Form menangkap error ini, memunculkan toast, dan me-redirect ke sign-in dengan email terpopulasi. | Menghindari duplikasi akun atau account takeover. | ⬜ |
| **17** | Di `/member/membership`, klik **Change plan**, pilih plan **Blue B7 ($52)**. Klik **Schedule Change**. | Memanggil `POST /memberships/upgrade` dengan payload `{target_sub_tier: "b7"}`. | Banner jadwal perubahan paket muncul persisten: "Scheduled → Blue B7 on [renewal_date]". | ⬜ |
| **18** | Klik **Cancel scheduled change** pada banner. | Memanggil `DELETE /memberships/upgrade`. Banner hilang, plan tetap di tier saat ini. | Perubahan jadwal berhasil dibatalkan, tidak ada error. | ⬜ |

---

## Fokus Utama Verifikasi Bug A6 & A7

### ✅ Bug A6 (stripe_subscription_id null)
**Target:** Langkah #11-12  
**Kriteria Sukses:**
- `POST /subscriptions/me/cancel` mengembalikan **200 OK**
- Tidak ada error "No active subscription found"
- Status berubah menjadi `cancelled` atau grace period aktif
- `GET /billing/status` mengembalikan `stripe_subscription_id` yang valid (bukan null)

### ✅ Bug A7 (Stripe Idempotency Key conflict)
**Target:** Langkah #5-6 dan #13-14  
**Kriteria Sukses:**
- Setelah ganti plan dari Blue B4 ke Red R7, checkout berhasil tanpa error `400 Bad Request` dari Stripe
- `POST /beny/subscribe` berhasil tanpa error "Keys for idempotent requests can only be used with the same parameters..."
- User dapat membeli BENY addon setelah mengganti plan saat registrasi

---

## Instruksi Penggunaan

1. **Gunakan email baru** untuk setiap siklus testing (misal: `test-$(date +%s)@stripe.com`) agar tidak bentrok dengan data test sebelumnya.
2. **Catat hasilnya** di kolom "Status" dengan:
   - ✅ = Berhasil sesuai ekspektasi
   - ❌ = Gagal / tidak sesuai ekspektasi (catat detail error)
   - ⚠️ = Berhasil sebagian / ada anomali (catat detail)
3. **Screenshot** atau catat requestId jika ada error untuk diserahkan ke backend.
4. **Prioritas Tinggi:** Langkah #6, #11, #14 adalah verifikasi langsung bug A6 & A7.

---

## Checklist Pra-Testing

- [ ] Backend sudah deploy versi terbaru dengan perbaikan bug A6 & A7
- [ ] Webhook Stripe sudah dikonfigurasi dan aktif (verifikasi di Stripe Dashboard)
- [ ] Stripe test mode aktif dengan kartu test `4242 4242 4242 4242`
- [ ] Frontend sudah pull latest commit (auth.ts, dialog styling, /payment/success redirect)
- [ ] Environment variable `NEXT_PUBLIC_API_BASE` sudah pointing ke backend yang benar

---

## Hasil Testing

**Tanggal:** _____________  
**Tester:** _____________  
**Email Test Akun:** _____________  
**User ID:** _____________  

**Bug A6 Status:** ⬜ Fixed / ⬜ Masih Error  
**Bug A7 Status:** ⬜ Fixed / ⬜ Masih Error  

**Catatan Tambahan:**
```
[Tulis di sini jika ada temuan bug baru atau anomali lainnya]
```
