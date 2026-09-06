# SLR API — BENY add-on: laporan bug untuk backend

Modul BENY diuji ulang penuh setelah laporan lapangan bahwa add-on tidak sinkron dengan Stripe. Seluruh bukti di bawah ditangkap langsung dari API, bukan dari pembacaan kode. Setiap entri melampirkan endpoint, payload, dan response apa adanya.

- **Base URL:** `https://api-dev.smartliferewards.com.au/api/v1`
- **Ditangkap:** 2026-09-06 · **Akun member:** `tk6qs94k4p@ruutukf.com` (`user_id 01a07664-8503-7314-aabf-836a0bb7b8c5`, RED r1, VIC) · **Admin:** `superadmin@smartliferewards.com.au`
- **Referensi PRD:** bagian _BENY (Add-on Eksternal — Tanpa Integrasi Sistem)_
- **Isu terkait sebelumnya:** [BACKEND-ISSUES.md](BACKEND-ISSUES.md) §D6 (jalur penjualan BENY) dan bagian `DELETE /beny/subscribe`

Kutipan PRD yang menjadi acuan seluruh laporan ini:

> Urutan pembayaran vs aktivasi (penting — sering disalahpahami): Admin TIDAK menyetujui pembayaran. Stripe memotong \$4 langsung saat member konfirmasi — sebelum admin bertindak. Peran admin hanya mendaftarkan member ke portal BENY. Jadi urutannya: **bayar → masuk daftar pending → admin aktivasi → email ke member.**

---

## Endpoint yang perlu penyesuaian

| Endpoint                    | Isu                                                        | Severity   |
| --------------------------- | ---------------------------------------------------------- | ---------- |
| `POST /beny/subscribe`      | **B1** sesi Stripe dibuat setup mode — tidak menagih       | 🔴 Blocker |
| `POST /beny/subscribe`      | **B2** menulis `pending_activation` sebelum pembayaran     | 🔴 Blocker |
| `POST /beny/subscribe`      | **B3** `409` saat `pending_deactivation` — member terkunci | 🔴 Tinggi  |
| webhook Stripe              | **B4** record tidak dibersihkan saat checkout dibatalkan   | 🔴 Tinggi  |
| `GET /admin/beny`           | **B5** `stripe_subscription_id` menyimpan Checkout Session | 🟠 Sedang  |
| `POST /membership/checkout` | **B6** flag `beny` diterima tetapi diabaikan               | 🟠 Sedang  |
| `DELETE /beny/subscribe`    | **B7** pesan menyebut persetujuan admin                    | 🟡 Rendah  |
| `DELETE /beny/subscribe`    | **B8** `expires_at` tetap null setelah cancel              | 🟡 Rendah  |

Status frontend: perbaikan sisi FE sudah dirilis pada commit `470b126` — lihat bagian [Sisi frontend](#sisi-frontend-sudah-dikerjakan).

---

## Kondisi akun saat pengujian dimulai

`POST /api/v1/auth/login`

```json
{ "email": "tk6qs94k4p@ruutukf.com", "password": "<password>" }
```

→ `200`

```json
{
    "user_id": "01a07664-8503-7314-aabf-836a0bb7b8c5",
    "role": "member",
    "tier": "red",
    "sub_tier": "r1",
    "status": "pending_payment",
    "billing_status": "inactive",
    "requires_payment": true,
    "spin_available": false
}
```

Akun ini **belum pernah membayar apa pun** — `status: pending_payment`, `billing_status: inactive`. Catat itu, karena seluruh laporan di bawah berangkat dari sini.

---

## B1. 🔴 `POST /beny/subscribe` — sesi Stripe dibuat setup mode, tidak pernah menagih

**Endpoint:** `POST /api/v1/beny/subscribe`

**Payload**

```json
{ "name": "QA Beny WebProbe", "email": "tk6qs94k4p@ruutukf.com", "phone": "+61412345678" }
```

**Response** → `201`

```json
{
    "success": true,
    "message": "BENY subscription created. Activation will be processed by admin.",
    "data": {
        "beny_status": "pending_activation",
        "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_c1ELrM6dKUmn4c1rhz37SvaBJgYuUxknvpraIxkEttjWaTeSC8Ae0Mbnjx#…"
    }
}
```

`checkout_url` di atas dibuka di browser. Isinya:

```
Dev Smart Life Rewards sandbox · Sandbox
Enter payment details
Email             tk6qs94k4p@ruutukf.com
Save payment information
Card information …
[ Save ]

By saving your payment information, you allow Dev Smart Life Rewards sandbox
to charge you for future payments in accordance with their terms.
```

Tidak ada nominal, tidak ada line item, tidak ada total. Judulnya **"Save payment information"** dan tombolnya **"Save"** — ini Stripe Checkout `mode: setup`, yang hanya menyimpan kartu untuk ditagih kemudian.

Bandingkan dengan sesi membership (`mode: subscription`) yang menampilkan `Subtotal` dan `Total after trial`.

**Melanggar PRD:** _"Stripe memotong \$4 langsung saat member konfirmasi."_

**Yang diminta:** ubah sesi BENY menjadi `mode: 'subscription'` dengan Price BENY \$4 AUD recurring.

---

## B2. 🔴 `POST /beny/subscribe` — menulis `pending_activation` sebelum ada pembayaran

Urutan berikut dijalankan berurutan pada akun yang sama, tanpa satu pun kartu dimasukkan.

**Sebelum** — `GET /api/v1/billing/status` → `200`

```json
{
    "billing_status": "inactive",
    "next_renewal_at": null,
    "grace_period": null,
    "stripe_subscription_id": null,
    "stripe_customer_id": null,
    "subscription_status": "inactive",
    "cancel_at_period_end": false
}
```

**Aksi** — `POST /api/v1/beny/subscribe` → `201`, `beny_status: "pending_activation"` (payload dan response lengkap di B1).

**Sesudah** — `GET /api/v1/billing/status` → `200`

```json
{
    "billing_status": "inactive",
    "next_renewal_at": null,
    "grace_period": null,
    "stripe_subscription_id": null,
    "stripe_customer_id": null,
    "subscription_status": "inactive",
    "cancel_at_period_end": false
}
```

Identik. Tidak ada customer, subscription, invoice, maupun payment yang terbentuk. Namun record BENY sudah ada dan langsung masuk antrean admin.

**Melanggar PRD:** _"Member yang **sudah bayar** masuk ke daftar pending BENY activation."_

**Yang diminta:** tulis record hanya setelah pembayaran terkonfirmasi — `invoice.paid` atau `customer.subscription.created`.

---

## B3. 🔴 `POST /beny/subscribe` — `409` saat `pending_deactivation`, member terkunci

Setelah member membatalkan BENY (lihat B7), status menjadi `pending_deactivation`. Percobaan berlangganan lagi:

**Endpoint:** `POST /api/v1/beny/subscribe`

**Payload**

```json
{ "name": "QA Beny WebProbe", "email": "tk6qs94k4p@ruutukf.com", "phone": "+61412345678" }
```

**Response** → `409`

```json
{
    "success": false,
    "message": "Conflict: You already have an active or pending deactivation BENY subscription.",
    "code": "CONFLICT",
    "requestId": "01a0767a-1578-759a-8958-18e642aad146"
}
```

`GET /api/v1/beny/status` → `200`

```json
{
    "beny_status": "pending_deactivation",
    "activated_at": null,
    "cancelled_at": "2026-09-06T11:28:07.891Z",
    "expires_at": null
}
```

Perhatikan `activated_at: null` — langganan ini **tidak pernah aktif dan tidak pernah dibayar**, tetapi kini menghuni `pending_deactivation` dan hanya bisa dikeluarkan oleh admin.

Jalur yang menjebak member: klik "Add BENY" → tinggalkan checkout → batalkan → **tidak bisa berlangganan lagi selamanya** sampai admin turun tangan. Padahal tidak pernah ada transaksi.

**Yang diminta:** izinkan `subscribe` ulang bila record belum pernah aktif (`activated_at` null dan tidak ada `sub_…`), atau langsung set `cancelled` untuk record yang belum pernah dibayar alih-alih `pending_deactivation`.

---

## B4. 🔴 Webhook — record tidak dibersihkan saat checkout dibatalkan

Diuji melalui UI penuh (`https://slr-membership.vercel.app`): sign-up RED Standard, centang BENY, klik "Continue to Stripe", lalu **tutup browser tanpa memasukkan kartu**.

Panggilan yang terekam dari browser:

```
POST /api/v1/beny/subscribe        → 201  { "beny_status": "pending_activation", "checkout_url": "…" }
POST /api/v1/membership/checkout   → 200  { "url": "…", "sessionId": "…" }
(checkout ditinggalkan, nol pembayaran)
```

Record akun ini tetap ada di antrean admin sampai sekarang:

`GET /api/v1/admin/beny?status=pending_deactivation&page=1&limit=100` → `200`

```json
{
    "beny_subscription_id": "01a07664-9ad2-7446-b926-69b9cf21f682",
    "user_id": "01a07664-8503-7314-aabf-836a0bb7b8c5",
    "name": "QA Beny WebProbe",
    "email": "tk6qs94k4p@ruutukf.com",
    "phone": "+61412345678",
    "status": "pending_deactivation",
    "created_at": "2026-09-06T11:04:59.859Z",
    "updated_at": "2026-09-06T11:28:07.892Z",
    "stripe_subscription_id": "cs_test_c1ELrM6dKUmn4c1rhz37SvaBJgYuUxknvpraIxkEttjWaTeSC8Ae0Mbnjx",
    "activated_at": null,
    "cancelled_at": "2026-09-06T11:28:07.891Z",
    "expires_at": null
}
```

Tidak ada penanganan `checkout.session.expired` maupun pembatalan. Dampak terukur pada antrean saat ini:

```
status pending_activation : n=9   seluruhnya id cs_test_     activated_at terisi 0 dari 9
status active             : n=9   id sub_ 7, cs_test_ 2      activated_at terisi 9 dari 9
```

Sembilan permintaan aktivasi menunggu admin, **nol** di antaranya pernah dibayar.

**Yang diminta:** tangani `checkout.session.expired` untuk menghapus atau menandai kedaluwarsa record yang sesi checkout-nya tidak pernah diselesaikan.

---

## B5. 🟠 `GET /admin/beny` — `stripe_subscription_id` menyimpan Checkout Session

Pada seluruh response `/admin/beny`, kolom `stripe_subscription_id` berisi id **Checkout Session** (`cs_test_…`), bukan Subscription (`sub_…`):

```
"stripe_subscription_id": "cs_test_c1ELrM6dKUmn4c1rhz37SvaBJgYuUxknvpraIxkEttjWaTeSC8Ae0Mbnjx"
```

Dua record berstatus `active` bahkan sudah diaktifkan admin sambil tetap memegang Checkout Session:

`GET /api/v1/admin/beny?status=active&page=1&limit=100`

```
stripetestafterfix10@stripe.com   activated_at 2026-08-01T09:40:16.341Z   cs_test_a1H2OAQwK0lxwp…
stripetestafterfix05@stripe.com   activated_at 2026-07-30T12:25:05.209Z   cs_test_a1oIhYTHMe2841…
```

Keduanya tidak memiliki Stripe Subscription — tidak ada objek yang bisa ditagih berulang maupun dibatalkan bila member berhenti.

**Yang diminta:** simpan `sub_…` pada kolom tersebut setelah subscription terbentuk, dan audit dua baris di atas.

---

## B6. 🟠 `POST /membership/checkout` — flag `beny` diterima tetapi diabaikan

**Endpoint:** `POST /api/v1/membership/checkout`

**Payload**

```json
{ "sub_tier": "r1", "beny": true }
```

**Response** → `200`

```json
{
    "url": "https://checkout.stripe.com/c/pay/cs_test_b1TXCNtTkvmMJXmIOHjpEcJW2eukWSwA0mpj8iSyoIDY4qYtPlUXHsJz28#…",
    "sessionId": "cs_test_b1TXCNtTkvmMJXmIOHjpEcJW2eukWSwA0mpj8iSyoIDY4qYtPlUXHsJz28"
}
```

Halaman Stripe yang dihasilkan hanya memuat satu line item:

```
Smart Life Rewards RED Membership
RED Tier membership subscription
Subtotal            IDR 132,061.65
Total after trial   IDR 132,061.65
```

Tidak ada baris BENY. `GET /api/v1/beny/status` sebelum dan sesudah panggilan ini sama-sama mengembalikan `pending_deactivation` — flag tersebut tidak mengubah state maupun menambah line item.

Endpoint membalas `200`, sehingga frontend tidak punya cara membedakan "BENY berhasil ditambahkan" dari "flag diabaikan".

**Yang diminta — pilih satu, lalu konfirmasi ke FE:**

1. Proses `beny` sebagai line item kedua pada sesi membership (satu transaksi, paling dekat dengan PRD _"saat checkout awal"_); atau
2. Tolak field tersebut secara eksplisit (`400`) dan nyatakan `POST /beny/subscribe` sebagai satu-satunya jalur, agar FE berhenti mengirimnya.

Melanjutkan §D6 di [BACKEND-ISSUES.md](BACKEND-ISSUES.md) yang belum pernah ditutup.

---

## B7. 🟡 `DELETE /beny/subscribe` — pesan menyebut persetujuan admin

**Endpoint:** `DELETE /api/v1/beny/subscribe` (status saat itu `pending_activation`)

**Response** → `200`

```json
{
    "success": true,
    "message": "Request completed successfully",
    "data": {
        "success": true,
        "message": "BENY subscription cancellation requested. Pending admin review."
    }
}
```

Transisi state-nya benar. Yang keliru kalimatnya: PRD menyatakan _"user bisa cancel kapan saja dari dashboard"_, dan peran admin hanya mencabut akses di portal BENY **setelah** periode berbayar berakhir — bukan menyetujui pembatalan. Frontend menampilkan pesan ini apa adanya, sehingga member mengira pembatalannya perlu disetujui.

**Yang diminta:** ubah menjadi kalimat yang menyatakan pembatalan sudah tercatat dan akses berlanjut sampai akhir periode.

---

## B8. 🟡 `DELETE /beny/subscribe` — `expires_at` tetap null

`GET /api/v1/beny/status` setelah pembatalan → `200`

```json
{
    "beny_status": "pending_deactivation",
    "activated_at": null,
    "cancelled_at": "2026-09-06T11:28:07.891Z",
    "expires_at": null
}
```

`cancelled_at` terisi, `expires_at` tidak.

PRD mewajibkan daftar pending deactivation menampilkan _"deactivate on [tanggal]"_ (akhir periode berbayar), bukan "deactivate now". Tanpa `expires_at`, admin tidak tahu kapan boleh mencabut akses dan member tidak tahu sampai kapan aksesnya berlaku.

Frontend sudah siap merender tanggal ini dan sementara jatuh ke `next_renewal_at` membership sebagai perkiraan — nilai yang belum tentu sama dengan periode BENY.

**Yang diminta:** isi `expires_at` dengan akhir periode berbayar BENY saat status berpindah ke `pending_deactivation`.

---

## Cara reproduksi

```bash
BASE=https://api-dev.smartliferewards.com.au/api/v1

# 1. login
curl -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"tk6qs94k4p@ruutukf.com","password":"<password>"}'

# 2. pastikan belum ada billing sama sekali
curl "$BASE/billing/status" -H "Authorization: Bearer $TOKEN"

# 3. langganan BENY — status langsung pending_activation
curl -X POST "$BASE/beny/subscribe" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"QA Beny WebProbe","email":"tk6qs94k4p@ruutukf.com","phone":"+61412345678"}'

# 4. billing tetap kosong — tidak ada uang masuk   (B2)
curl "$BASE/billing/status" -H "Authorization: Bearer $TOKEN"

# 5. buka checkout_url dari langkah 3 → "Save payment information"   (B1)

# 6. batalkan, lalu coba berlangganan lagi → 409, member terkunci    (B3)
curl -X DELETE "$BASE/beny/subscribe" -H "Authorization: Bearer $TOKEN"
curl -X POST "$BASE/beny/subscribe" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"QA Beny WebProbe","email":"tk6qs94k4p@ruutukf.com","phone":"+61412345678"}'
```

Catatan: `POST /auth/register` ditolak `403 SAFE_HOURS` selama jendela safe hours berlaku — jendela aktif dapat dilihat pada `GET /admin/safe-hours`.

---

## Sisi frontend (sudah dikerjakan)

Commit `470b126`, hasil pemeriksaan terhadap PRD:

1. **Sign-up membuang `checkout_url` BENY.** `POST /beny/subscribe` mengembalikan sesi Stripe tersendiri, tetapi wizard sign-up meng-`await` panggilan itu lalu mengabaikan hasilnya dan hanya melakukan redirect ke sesi membership. Member masuk antrean aktivasi tanpa pernah dibawa ke halaman pembayaran BENY. URL kini dibuka di tab baru, pola yang sama dengan jalur dashboard.

2. **Nomor telepon tidak divalidasi.** PRD menyatakan nomor ini dipakai admin untuk aktivasi manual di portal BENY, dan format yang salah membuat aktivasi gagal setelah member membayar. Sebuah record nyata di api-dev menyimpan `628558585858` — nomor Indonesia — pada membership Victoria. Ditambahkan validasi format Australia beserta normalisasi ke `+61`.

3. **Teks yang diminta PRD.** Form kini menyatakan alasan pengumpulan data, dan status pending memuat SLA aktivasi satu hari kerja.

Perbaikan ini membuat member sampai ke halaman pembayaran BENY, tetapi halaman tersebut belum menagih apa pun selama **B1** belum diperbaiki.

---

## Lampiran — akun uji

| Email                    | user_id                                | Status BENY          | Keterangan                                    |
| ------------------------ | -------------------------------------- | -------------------- | --------------------------------------------- |
| `tk6qs94k4p@ruutukf.com` | `01a07664-8503-7314-aabf-836a0bb7b8c5` | pending_deactivation | Akun utama laporan ini                        |
| `lotoha5385@airhemp.com` | `01a0765a-37c5-76cd-a843-1e6b683f9370` | pending_activation   | Registrasi manual tim; telepon `628558585858` |

Kedua akun adalah data uji dan aman dihapus.
