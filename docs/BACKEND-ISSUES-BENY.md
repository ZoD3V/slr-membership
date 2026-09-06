# SLR API — BENY add-on: laporan bug untuk backend

Modul BENY diuji ulang penuh setelah laporan lapangan bahwa add-on tidak sinkron dengan Stripe. Semua bukti di bawah ditangkap langsung dari API, bukan dari pembacaan kode.

- **Base URL:** `https://api-dev.smartliferewards.com.au/api/v1`
- **Ditangkap:** 2026-09-06 · **Akun probe:** `slr.beny.doc+1788693754@ebflyai.com` (RED r1, VIC) · **Admin:** `superadmin@smartliferewards.com.au`
- **Referensi PRD:** bagian _BENY (Add-on Eksternal — Tanpa Integrasi Sistem)_
- **Isu terkait sebelumnya:** [BACKEND-ISSUES.md](BACKEND-ISSUES.md) §D6 (jalur penjualan BENY) dan bagian `DELETE /beny/subscribe`

Kutipan PRD yang menjadi acuan seluruh laporan ini:

> Urutan pembayaran vs aktivasi (penting — sering disalahpahami): Admin TIDAK menyetujui pembayaran. Stripe memotong \$4 langsung saat member konfirmasi — sebelum admin bertindak. Peran admin hanya mendaftarkan member ke portal BENY. Jadi urutannya: **bayar → masuk daftar pending → admin aktivasi → email ke member.**

---

## Ringkasan

| #      | Isu                                                              | Severity   | Dampak                                                         |
| ------ | ---------------------------------------------------------------- | ---------- | -------------------------------------------------------------- |
| **B1** | Sesi Stripe BENY dibuat dalam **setup mode** — tidak menagih     | 🔴 Blocker | \$4 tidak pernah tertagih; pendapatan add-on nol               |
| **B2** | `pending_activation` ditulis **sebelum** pembayaran              | 🔴 Blocker | Admin mengaktifkan member yang belum membayar                  |
| **B3** | Record tidak dibersihkan saat checkout dibatalkan                | 🔴 Tinggi  | Antrean admin terisi permanen oleh permintaan mati             |
| **B4** | 2 record `active` menyimpan Checkout Session, bukan Subscription | 🟠 Sedang  | Tidak ada langganan Stripe untuk ditagih ulang                 |
| **B5** | `beny: true` pada `POST /membership/checkout` diabaikan diam     | 🟠 Sedang  | Field diterima tanpa efek; FE tak bisa membedakan sukses/gagal |
| **B6** | Pesan cancel menyebut "Pending admin review"                     | 🟡 Rendah  | Bertentangan dengan PRD "user bisa cancel kapan saja"          |
| **B7** | `expires_at` null setelah cancel                                 | 🟡 Rendah  | Admin tidak tahu kapan boleh mencabut akses di portal BENY     |

Status frontend: perbaikan sisi FE sudah dirilis pada commit `470b126` — lihat bagian [Sisi frontend](#sisi-frontend-sudah-dikerjakan) di akhir dokumen.

---

## B1. 🔴 Sesi Stripe BENY dibuat dalam setup mode — tidak pernah menagih

`POST /beny/subscribe` mengembalikan `checkout_url`. URL tersebut dibuka dan diperiksa: halamannya **tidak memuat nominal, line item, maupun total**.

```
POST /api/v1/beny/subscribe
{ "name": "BENY Doc Probe", "email": "slr.beny.doc+1788693754@ebflyai.com", "phone": "+61412345678" }

→ 201
{
  "success": true,
  "message": "BENY subscription created. Activation will be processed by admin.",
  "data": {
    "beny_status": "pending_activation",
    "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_c1cOzwTRtqZhDTR8ZucGC06t6xLtcCQ16pOzBaEEVTU7t0PY3LNgpRO0NF"
  }
}
```

Isi halaman `checkout_url` tersebut:

```
Dev Smart Life Rewards sandbox · Sandbox
Enter payment details
Email            slr.beny.doc+1788693754@ebflyai.com
Save payment information
Card information …
[ Save ]

By saving your payment information, you allow Dev Smart Life Rewards sandbox
to charge you for future payments in accordance with their terms.
```

Judulnya **"Save payment information"**, tombolnya **"Save"**, dan tidak ada baris harga sama sekali. Ini Stripe Checkout `mode: setup` — menyimpan kartu untuk ditagih di kemudian hari, bukan transaksi.

Bandingkan dengan sesi membership yang benar (`mode: subscription`), yang menampilkan line item dan total.

**Melanggar PRD:** _"Stripe memotong \$4 langsung saat member konfirmasi."_

**Yang diminta:** ubah sesi BENY menjadi `mode: 'subscription'` dengan Price BENY \$4 AUD recurring, sehingga member benar-benar tertagih saat konfirmasi.

---

## B2. 🔴 `pending_activation` ditulis sebelum ada pembayaran

Urutan lengkap pada satu akun baru, tanpa satu pun kartu dimasukkan:

```
1) POST /auth/register            → 201  user_id 01a07674-b89f-716f-9a23-3afe0d9a03ea
                                          requires_payment: true

2) GET  /beny/status              → 200  { "beny_status": "inactive" }

3) GET  /billing/status           → 200  { "billing_status": "inactive",
                                           "stripe_customer_id": null,
                                           "stripe_subscription_id": null }

4) POST /beny/subscribe           → 201  { "beny_status": "pending_activation" }

5) GET  /billing/status           → 200  { "billing_status": "inactive",
                                           "stripe_customer_id": null }     ← tetap nol
```

Antara langkah 3 dan 5 tidak ada perubahan pada billing — tidak ada customer, tidak ada subscription, tidak ada invoice. Namun record BENY sudah terbentuk dan langsung tampil di antrean admin:

```
GET /api/v1/admin/beny?status=pending_activation

{
  "beny_subscription_id": "01a07675-0291-7539-9670-8eab858c8d84",
  "user_id": "01a07674-b89f-716f-9a23-3afe0d9a03ea",
  "name": "BENY Doc Probe",
  "email": "slr.beny.doc+1788693754@ebflyai.com",
  "phone": "+61412345678",
  "status": "pending_activation",
  "created_at": "2026-09-06T11:22:54.994Z",
  "updated_at": "2026-09-06T11:22:54.994Z",
  "stripe_subscription_id": "cs_test_c1cOzwTRtqZhDTR8ZucGC06t6xLtcCQ16pOzBaEEVTU7t0PY3LNgpRO0NF",
  "activated_at": null,
  "cancelled_at": null,
  "expires_at": null
}
```

Perhatikan `stripe_subscription_id` berisi **`cs_test_…`** — itu id **Checkout Session**, bukan Subscription (`sub_…`). Kolomnya menyimpan jenis objek yang salah, dan itu konsisten di seluruh antrean:

```
status pending_activation : n=9   semua id cs_test_    activated_at terisi 0 dari 9
status active             : n=9   id sub_ 7, cs_test_ 2  activated_at terisi 9 dari 9
```

`created_at` sama persis dengan `updated_at` pada seluruh baris pending — record ditulis sekali lalu tidak pernah disentuh webhook mana pun.

**Melanggar PRD:** _"Member yang **sudah bayar** masuk ke daftar pending BENY activation."_

**Yang diminta:** tulis record hanya setelah pembayaran terkonfirmasi (`invoice.paid` atau `customer.subscription.created`), dan simpan `sub_…` pada `stripe_subscription_id`.

---

## B3. 🔴 Record tidak dibersihkan saat checkout dibatalkan

Diuji melalui UI penuh di `https://slr-membership.vercel.app` — sign-up RED Standard, centang BENY, klik "Continue to Stripe", lalu **tutup browser tanpa memasukkan kartu**.

```
POST /api/v1/beny/subscribe       → 201  pending_activation
POST /api/v1/membership/checkout  → 200
(checkout ditinggalkan, nol pembayaran)

GET /api/v1/admin/beny?status=pending_activation
→ slr.qa.beny+1788691430705@gmail.com   cs_test_c1BL…   activated_at: null
```

Record tetap berada di antrean aktivasi admin tanpa batas waktu. Tidak ada penanganan `checkout.session.expired` maupun pembatalan.

Dampak nyata: dari 9 record `pending_activation` yang ada saat ini, **nol** memiliki `activated_at` dan **seluruhnya** menyimpan Checkout Session. Dua di antaranya berasal dari percobaan manual tim pada 24 dan 27 Agustus.

**Yang diminta:** hapus atau tandai kedaluwarsa saat `checkout.session.expired`, dan sediakan cara admin membersihkan antrean.

---

## B4. 🟠 Dua record `active` menyimpan Checkout Session, bukan Subscription

```
GET /api/v1/admin/beny?status=active

stripetestafterfix10@stripe.com   activated_at 2026-08-01T09:40:16.341Z   cs_test_a1H2OAQwK0lxwp…
stripetestafterfix05@stripe.com   activated_at 2026-07-30T12:25:05.209Z   cs_test_a1oIhYTHMe2841…
```

Keduanya sudah diaktifkan admin, tetapi tidak memiliki Stripe Subscription. Tidak ada objek yang bisa ditagih berulang, dan tidak ada yang bisa dibatalkan lewat Stripe bila member berhenti.

Ini konsekuensi lanjutan dari B2: karena record dibuat pada tahap Checkout Session, admin dapat mengaktifkan record yang tidak pernah menjadi langganan.

**Yang diminta:** audit dua baris tersebut, dan pastikan aktivasi hanya mungkin untuk record yang memiliki `sub_…`.

---

## B5. 🟠 `beny: true` pada `POST /membership/checkout` diterima tetapi diabaikan

```
POST /api/v1/membership/checkout
{ "sub_tier": "r1", "beny": true }

→ 200 { "sessionId": "…", "url": "https://checkout.stripe.com/c/pay/cs_test_b1dwgPYR8tfkzGY5A9zp45Zv9pyXRVoHkwhF" }
```

Halaman Stripe yang dihasilkan hanya memuat satu line item:

```
Smart Life Rewards RED Membership
RED Tier membership subscription
Subtotal   IDR 132,061.65
```

Tidak ada baris BENY. `GET /beny/status` sebelum dan sesudah panggilan ini sama-sama `inactive` — jadi flag tersebut tidak membuat record maupun line item.

Endpoint membalas `200` sehingga frontend tidak punya cara membedakan "BENY berhasil ditambahkan" dari "flag diabaikan".

**Yang diminta — pilih satu, lalu konfirmasi ke FE:**

1. Proses `beny` sebagai line item kedua pada sesi membership (satu transaksi, paling dekat dengan PRD "saat checkout awal"); atau
2. Tolak field tersebut secara eksplisit (`400`) dan nyatakan `POST /beny/subscribe` sebagai satu-satunya jalur, agar FE berhenti mengirimnya.

Ini melanjutkan §D6 di [BACKEND-ISSUES.md](BACKEND-ISSUES.md) yang belum pernah ditutup.

---

## B6. 🟡 Pesan cancel menyebut persetujuan admin

```
DELETE /api/v1/beny/subscribe        (status saat itu: pending_activation)

→ 200
{
  "success": true,
  "data": {
    "success": true,
    "message": "BENY subscription cancellation requested. Pending admin review."
  }
}

GET /api/v1/beny/status → { "beny_status": "pending_deactivation" }
```

Transisi state-nya benar sesuai PRD. Yang keliru adalah kalimatnya: PRD menyatakan _"user bisa cancel kapan saja dari dashboard"_, dan peran admin hanya mencabut akses di portal BENY **setelah** periode berbayar berakhir — bukan menyetujui pembatalan.

Frontend menampilkan pesan ini apa adanya, sehingga member mengira pembatalannya perlu disetujui.

**Yang diminta:** ubah menjadi kalimat yang menyatakan pembatalan sudah tercatat dan akses berlanjut sampai akhir periode.

---

## B7. 🟡 `expires_at` null setelah cancel

Pada respons B6, `expires_at` tetap `null` meski status sudah `pending_deactivation`.

PRD mewajibkan daftar pending deactivation menampilkan _"deactivate on [tanggal]"_ (akhir periode berbayar), bukan "deactivate now". Tanpa `expires_at`, admin tidak tahu kapan boleh mencabut akses, dan member tidak tahu sampai kapan aksesnya berlaku.

Frontend sudah siap merender tanggal ini dan saat ini jatuh ke `next_renewal_at` membership sebagai perkiraan — nilai yang belum tentu sama dengan periode BENY.

**Yang diminta:** isi `expires_at` dengan akhir periode berbayar BENY saat status berpindah ke `pending_deactivation`.

---

## Cara reproduksi

Seluruh temuan di atas dapat diulang dengan akun baru mana pun:

```bash
BASE=https://api-dev.smartliferewards.com.au/api/v1

# 1. daftar akun RED baru (catat access_token)
curl -X POST "$BASE/auth/register" -H 'Content-Type: application/json' -d '{
  "full_name":"BENY Probe","email":"<email-baru>","password":"<password>",
  "state":"VIC","phone":"0412345678","dob":"1990-01-01",
  "tier":"red","sub_tier":"r1",
  "consents":[{"consent_type":"terms","agreed":true},{"consent_type":"privacy","agreed":true}]}'

# 2. pastikan belum ada billing sama sekali
curl "$BASE/billing/status" -H "Authorization: Bearer $TOKEN"

# 3. langganan BENY — perhatikan status langsung pending_activation
curl -X POST "$BASE/beny/subscribe" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"BENY Probe","email":"<email-baru>","phone":"+61412345678"}'

# 4. billing tetap kosong — tidak ada uang masuk
curl "$BASE/billing/status" -H "Authorization: Bearer $TOKEN"

# 5. buka checkout_url dari langkah 3 di browser → halaman "Save payment information"
```

Catatan: `POST /auth/register` ditolak `403 SAFE_HOURS` selama jendela safe hours berlaku (dapat dilihat pada `GET /admin/safe-hours`).

---

## Sisi frontend (sudah dikerjakan)

Commit `470b126`. Diperbaiki dari hasil pemeriksaan terhadap PRD:

1. **Sign-up membuang `checkout_url` BENY.** `POST /beny/subscribe` mengembalikan sesi Stripe tersendiri, tetapi wizard sign-up meng-`await` panggilan itu lalu mengabaikan hasilnya dan hanya melakukan redirect ke sesi membership. Member masuk antrean aktivasi tanpa pernah dibawa ke halaman pembayaran BENY. URL kini dibuka di tab baru, pola yang sama dengan jalur dashboard.

2. **Nomor telepon tidak divalidasi.** PRD menyatakan nomor ini dipakai admin untuk aktivasi manual di portal BENY, dan format yang salah membuat aktivasi gagal setelah member membayar. Sebuah record nyata di api-dev menyimpan `628558585858` — nomor Indonesia — pada membership Victoria. Ditambahkan validasi format Australia beserta normalisasi ke `+61`.

3. **Teks yang diminta PRD.** Form kini menyatakan alasan pengumpulan data, dan status pending memuat SLA aktivasi satu hari kerja.

Perbaikan ini membuat member sampai ke halaman pembayaran BENY, tetapi halaman tersebut belum menagih apa pun selama **B1** belum diperbaiki.

---

## Lampiran — akun probe

| Email                                 | user_id                                | Status BENY          | Keterangan                                    |
| ------------------------------------- | -------------------------------------- | -------------------- | --------------------------------------------- |
| `slr.beny.doc+1788693754@ebflyai.com` | `01a07674-b89f-716f-9a23-3afe0d9a03ea` | pending_deactivation | Probe utama dokumen ini                       |
| `slr.qa.beny+1788691430705@gmail.com` | —                                      | pending_activation   | Checkout ditinggalkan (B3)                    |
| `slr.qa.beny+1788690240@gmail.com`    | —                                      | pending_deactivation | Uji cancel saat pending                       |
| `tk6qs94k4p@ruutukf.com`              | `01a07664-8503-7314-aabf-836a0bb7b8c5` | pending_activation   | Uji alur sign-up penuh                        |
| `lotoha5385@airhemp.com`              | `01a0765a-37c5-76cd-a843-1e6b683f9370` | pending_activation   | Registrasi manual tim; telepon `628558585858` |

Seluruh akun di atas adalah data uji dan aman dihapus.
