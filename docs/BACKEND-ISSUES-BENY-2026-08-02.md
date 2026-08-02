# BENY — Laporan Gap Backend (2026-08-02)

> **Sumber kebenaran:** [API Contract v1.0 §7 + §13](https://www.notion.so/389df1937d98816ab84ff538176fa4bb) · [PRD v3.2 §2.3 + §5.10](https://www.notion.so/35edf1937d9881d9abc4f9ebf19a308d)
> **Cara verifikasi:** live API `https://api.smartliferewards.com.au/api/v1`, login sebagai admin seed, 2026-08-02.
> **Status FE:** UI 4-state sudah selesai dan menunggu backend. Tidak ada pekerjaan FE yang tersisa di modul ini.

Flow yang diminta client (dan yang ditulis di kontrak):

```
1. member cancel BENY
2. status → pending_deactivation      ← BELUM ADA
3. admin cabut akses di portal BENY   (manual, di luar sistem)
4. admin approve di web SLR           → status jadi cancelled
5. tagihan Stripe BENY berhenti bulan berikutnya  ← BELUM BISA (lihat B5)
6. status BENY user jadi cancelled
```

Yang jalan hari ini hanya `pending_activation → active → cancelled`. Langkah 2, 4, dan 5 tidak ada.

---

## Ringkasan

| # | Isu | Dampak | Prioritas |
|---|---|---|---|
| B1 | Enum status tidak punya `pending_deactivation` | Flow 4-state mustahil | 🔴 Blocker |
| B2 | `DELETE /beny/subscribe` langsung set `cancelled` | Member kehilangan akses yang sudah dibayar | 🔴 Blocker |
| B3 | Kolom `access_ends_at` / `deactivated_at` / `deactivation_reason` tidak ada | Guard 422 tidak bisa dibuat | 🔴 Blocker |
| B4 | `GET /beny/status` tidak mengembalikan `access_ends_at` | Member tidak tahu kapan akses habis | 🟠 Wajib |
| B5 | `stripe_subscription_id` berisi **Checkout Session ID**, bukan subscription ID | Tagihan BENY tidak bisa dihentikan | 🔴 Blocker |
| B6 | Baris BENY duplikat per user (1 user punya 5 baris) | Admin lihat orang yang sama berkali-kali | 🟠 Wajib |
| B7 | `charge.refunded` belum bedakan BENY vs membership | Refund BENY bisa menonaktifkan membership | 🔴 Blocker |
| B8 | Drift nama field & envelope vs kontrak | FE sudah menyesuaikan — mohon konfirmasi mana yang benar | 🟡 Konfirmasi |
| B9 | `GET /admin/giveaways/{id}/eligible-members` → 404 | Admin terpaksa ketik `user_id` mentah (dilarang kontrak) | 🟠 Wajib |

---

## B1. 🔴 Enum `status` tidak punya `pending_deactivation`

```http
GET /api/v1/admin/beny?status=PENDING_DEACTIVATION
```
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "errors": [{ "field": "status", "message": "Invalid status. Allowed values: PENDING_ACTIVATION, ACTIVE, CANCELLED" }]
}
```

Huruf kecil (`pending_deactivation`) ditolak dengan error yang sama.

Kontrak §7 dan §13 keduanya menyebut siklus `pending_activation → active → pending_deactivation → cancelled`.

**Yang diminta:** tambahkan `PENDING_DEACTIVATION` ke enum kolom `beny_subscriptions.status` dan ke validator query `GET /admin/beny`.

**Status FE:** tab "Pending Deactivation" sudah ada di `/dashboard/beny`, tapi sengaja **tidak menembak request** karena hanya akan menghasilkan 400. Tab itu menampilkan notice "Awaiting backend support". Begitu enum ditambah, tab langsung hidup tanpa perubahan kode FE.

---

## B2. 🔴 `DELETE /beny/subscribe` langsung set `cancelled`

Kontrak §7 (dev note pada `DELETE /beny/subscribe`) menyebut eksplisit:

> **jangan set `cancelled` langsung:** Cancel → set status **`pending_deactivation`** + isi `access_ends_at` = akhir periode yang sudah dibayar. Member tetap punya akses sampai tanggal itu. Status jadi `cancelled` HANYA setelah admin klik "Mark as Deactivated".

Live justru langsung `cancelled`. Bukti dari data produksi — selisih `activated_at` → `cancelled_at` pada 6 baris yang punya kedua timestamp:

```
minimum 25 detik, maksimum 87.239 detik
```

Baris 25 detik itu artinya member kehilangan akses BENY 25 detik setelah diaktifkan, padahal sudah membayar satu periode penuh.

Contoh baris nyata:

```json
{
  "name": "Agus Susanto",
  "status": "cancelled",
  "created_at":   "2026-08-02T02:14:39.311Z",
  "activated_at": "2026-08-02T02:14:49.223Z",
  "cancelled_at": "2026-08-02T02:15:57.663Z"
}
```

**Yang diminta:** `DELETE /beny/subscribe` set `status = pending_deactivation`, `access_ends_at = <akhir periode berbayar>`, `deactivation_reason = 'member_cancelled'`. Jangan set `cancelled`.

---

## B3. 🔴 Kolom `access_ends_at`, `deactivated_at`, `deactivation_reason` tidak ada

Baris `GET /admin/beny` hari ini (dicek pada seluruh 14 baris, ketiga status):

```
activated_at · beny_subscription_id · cancelled_at · created_at · email ·
name · phone · status · stripe_subscription_id · updated_at · user_id
```

Kontrak §13 mensyaratkan juga: `access_ends_at`, `deactivation_reason` (`member_cancelled` | `payment_failed` | `refunded`), dan `deactivated_at` pada response deactivate.

Tanpa `access_ends_at`, **guard wajib** di kontrak tidak bisa diimplementasikan:

> **Guard wajib:** Tolak (422) jika `access_ends_at` belum lewat — "Access ends on 27 Oct 2026. Cannot deactivate before this date."

**Status FE:** kolom Access Ends / Reason dan tombol "Mark as Deactivated" (disabled sampai tanggal lewat) sudah dibuat di `beny/_components/columns.tsx`. Sekarang membaca field yang selalu `undefined`. Begitu field dikirim, langsung terisi.

---

## B4. 🟠 `GET /beny/status` tidak mengembalikan `access_ends_at`

```http
GET /api/v1/beny/status
```
```json
{ "success": true, "data": { "beny_status": "inactive" } }
```

Kontrak §7 mensyaratkan:

```json
{ "data": { "beny_status": "pending_deactivation", "access_ends_at": "2026-10-27T14:14:30Z" } }
```

Tanpa ini member yang sudah cancel tidak punya cara tahu sampai kapan akses BENY-nya masih jalan.

Catatan tambahan: nilai `inactive` tidak ada di enum kontrak (`pending_activation` | `active` | `pending_deactivation` | `cancelled`). Mohon konfirmasi apakah `inactive` = "belum pernah berlangganan".

---

## B5. 🔴 `stripe_subscription_id` berisi Checkout Session ID, bukan Subscription ID

Ini yang membuat **langkah 5 (tagihan Stripe berhenti bulan berikutnya) mustahil dikerjakan**.

Dari 14 baris BENY:

```
prefix "cs_"  → 9 baris   (Checkout Session ID)
prefix "sub_" → 5 baris   (Subscription ID — yang benar)
```

Contoh:
```json
"stripe_subscription_id": "cs_test_a1a0Q3UIxiT5O1DvLoFrQOzUpw8y3crYaBziXFfiXQfoLg6PlqGF6YyLQw"
```

`cs_...` adalah ID Checkout Session, bukan Subscription. Dengan nilai itu backend **tidak bisa** memanggil `stripe.subscriptions.update(id, { cancel_at_period_end: true })` — jadi meski status di DB jadi `cancelled`, Stripe akan terus menagih \$4/bulan.

**Yang diminta:**
1. Saat handle `checkout.session.completed` untuk BENY, ambil `session.subscription` (bukan `session.id`) dan simpan itu.
2. Backfill 9 baris yang salah — `session.id` masih bisa dipakai untuk retrieve session lalu ambil `subscription`-nya.
3. Saat cancel, set `cancel_at_period_end: true` di Stripe, dan pakai `current_period_end` yang dikembalikan Stripe sebagai `access_ends_at` (B3).

---

## B6. 🟠 Baris BENY duplikat per user

Dari 14 baris, ada **2 user yang punya lebih dari satu baris BENY** — masing-masing **5 baris** dan **4 baris**. Contoh: `user_id` `019fbad8-e29b-7696-a64c-b07307c14ba3` ("Agus Susanto") muncul berkali-kali dengan `beny_subscription_id` berbeda.

Akibat di admin panel: orang yang sama tampil berulang di list, dan tidak ada aturan yang menentukan baris mana yang otoritatif untuk status BENY user tersebut.

**Yang diminta:** unique constraint per user untuk baris yang masih hidup (mis. partial unique index pada `user_id` dengan `status != 'cancelled'`), dan `POST /beny/subscribe` menolak (409) kalau user sudah punya baris aktif/pending.

---

## B7. 🔴 `charge.refunded` harus bedakan BENY vs membership

Kontrak §12 menandai ini sebagai bug mahal:

> Refund **BENY** → set `beny_subscriptions.status = pending_deactivation` · `deactivation_reason = 'refunded'`, membership/token/draw_pass **TIDAK** terpengaruh. Refund **membership** → evaluasi status membership + draw_pass. Kalau tidak dibedakan, refund BENY bisa ikut menonaktifkan keanggotaan — bug mahal.

Tidak bisa dites dari FE (butuh refund nyata di Stripe). Tapi karena `pending_deactivation` dan `deactivation_reason` **belum ada sama sekali** (B1 + B3), jalur refund BENY dipastikan belum sesuai kontrak.

**Yang diminta:** konfirmasi handler `charge.refunded` sudah memisahkan sumber refund berdasarkan subscription/price ID, dan hasil refund BENY tidak menyentuh `draw_pass`.

---

## B8. 🟡 Drift nama field & envelope vs kontrak

FE sudah menyesuaikan ke bentuk **live** untuk semua poin di bawah. Mohon konfirmasi mana yang jadi acuan supaya kontrak bisa di-update.

| Hal | Kontrak v1.0 | Live | Dipakai FE |
|---|---|---|---|
| ID baris | `beny_id` | `beny_subscription_id` | live |
| Waktu request | `requested_at` | `created_at` | live |
| Envelope list | `data: []` + `meta` | `data: { items, pagination }` | live |
| Verb activate/deactivate | `PATCH` | `POST` (PATCH → 404) | live |
| Enum di query | huruf kecil | **UPPERCASE** | live |

Envelope dan casing enum ini berlaku juga untuk `admin/giveaways` dan `admin/winners`, bukan cuma BENY.

---

## B9. 🟠 `GET /admin/giveaways/{id}/eligible-members` → 404

```http
GET /api/v1/admin/giveaways/019fc19f-4936-7443-bd76-7a2984d19224/eligible-members
→ 404 NOT_FOUND
```

Kontrak §13 menjadikan endpoint ini sumber autocomplete pada form input pemenang, dan melarang alternatifnya:

> **Jangan minta admin mengetik `user_id` mentah.** FE pakai autocomplete/search by nama atau email.

Karena endpoint ini tidak ada, form "Record Winner" di `/dashboard/winners/new` **terpaksa** memakai input teks `user_id` mentah. Ini melanggar kontrak dan rawan salah input — dan salah input berdampak: `draw_pass` pemenang jadi 0.

**Yang diminta:** implementasikan endpoint tersebut (filter: tier & state cocok dengan giveaway, `draw_pass > 0`, support `?search=`). FE akan langsung mengganti input teks jadi autocomplete.

Dua hal terkait di kontrak §13 yang juga perlu dikonfirmasi:
- `POST /admin/winners` apakah sudah set `draw_pass = 0` untuk pemenang + kirim notifikasi?
- `DELETE /admin/winners/{id}` apakah sudah **mengembalikan `draw_pass` ke nilai semula**? Kontrak menandai ini WAJIB — kalau tidak, member yang salah dicatat kehilangan sisa giveaway tanpa alasan.

---

## Yang dibutuhkan FE, ringkas

Supaya modul BENY bisa selesai, cukup ini:

1. `PENDING_DEACTIVATION` masuk enum status (B1).
2. `DELETE /beny/subscribe` set `pending_deactivation` + `access_ends_at` + `deactivation_reason`, bukan `cancelled` (B2).
3. `access_ends_at`, `deactivated_at`, `deactivation_reason` ikut di baris `GET /admin/beny` (B3).
4. `POST /admin/beny/{id}/deactivate` tolak 422 kalau `access_ends_at` belum lewat (B3).
5. `GET /beny/status` ikut kirim `access_ends_at` (B4).
6. `stripe_subscription_id` diisi `sub_...` + backfill, dan cancel pakai `cancel_at_period_end` (B5).

Nomor 6 yang paling mendesak secara uang — selama itu belum beres, member yang cancel tetap ditagih \$4/bulan.
