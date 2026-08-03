# Sprint 3 — Temuan Modul Giveaways (Verifikasi Live 2026-08-03)

Temuan backend khusus modul **Giveaways** (member + admin) saat integrasi FE. Semua diverifikasi live 2026-08-03 (AEST) terhadap `https://api.smartliferewards.com.au/api/v1`.

- **Akun:** `red@smartliferewards.com.au` (member, `subTierId:"r4"`, `billingStatus:"ACTIVE"`) · `admin@smartliferewards.com.au`
- **Envelope:** semua response `{ success, message, data, meta }` — contoh di bawah hanya menampilkan `data` yang relevan.
- **Konteks data saat verifikasi** — 4 giveaway: **SLR Red June** (monthly, draws 30 Jun — sudah lewat), **Red Weekly Draw** (weekly, live, draws 7 Aug), **SLR Red September** (monthly, baru buka 1 Sep), **Blue Weekly Draw** (draws 3 Jul — sudah lewat).

---

## G1. 🔴 `GET /giveaways/` — `is_entered:true` + `entry_status:"active"` untuk draw yang sudah diundi DAN yang belum buka

Semua giveaway se-tier dikirim `is_entered:true, entry_status:"active"`, termasuk draw yang diundi >1 bulan lalu dan yang windownya belum mulai:

```json
// GET /api/v1/giveaways/  (red@, 2026-08-03)
{ "name":"SLR Red June",      "opens_at":"2026-06-01…", "draws_at":"2026-06-30…",
  "is_entered":true, "entry_status":"active" }   // draw sudah lewat 1 bulan
{ "name":"SLR Red September", "opens_at":"2026-09-01…", "draws_at":"2026-09-30…",
  "is_entered":true, "entry_status":"active" }   // belum buka sampai 1 Sep
```

Per PRD, entries di-assign per cycle 28 hari, **reset tiap renewal, tidak carry-over** — member tidak mungkin "entered" di draw yang tutup sebelum cycle-nya mulai, apalagi di draw yang belum buka. Kelihatannya flag di-set per tier, bukan per window giveaway × cycle member.

**Expected:** `is_entered`/`entry_status` aktif hanya bila window giveaway overlap dengan cycle aktif member.
**FE workaround (2026-08-03):** klaim entered di-gate client-side dari `opens_at`/`draws_at` (phase upcoming/active/drawn), jadi UI tidak lagi menampilkan "You're Entered" di June/September — tapi sumber datanya tetap salah (mis. mobile app akan kena hal yang sama).

## G2. 🔴 `GET /entries/` — cycle yang sudah berakhir masih dilaporkan sebagai `current_cycle` + `active`

```json
// GET /api/v1/entries/  (red@, 2026-08-03 — 4 hari SETELAH end_at)
"current_cycle": { "start_at":"2026-07-02T05:20:22.145Z", "end_at":"2026-07-30T05:20:22.145Z",
                   "tier":"r4", "base_token":7, "total_token":7, "entry_status":"active" }
// GET /memberships/me → { "subTierId":"r4", "billingStatus":"ACTIVE" }
```

Billing `ACTIVE` tapi tidak ada cycle baru setelah 30 Jul — renewal harusnya membuat cycle baru (28 hari, anchored ke jam pembayaran) dan me-reset token + draw_pass. Kalau memang payment lapse, `entry_status` tidak boleh `active` (dan billing bukan `ACTIVE`). Salah satu dari renewal engine atau pelaporan status tidak jalan.

## G3. 🔴 Alokasi token salah — `tier:"r4"` tapi `base_token:7`

Terlihat di response G2: cycle ber-`tier:"r4"` dengan `base_token:7`. Per PRD, R4 = **4 token**/cycle ($20); 7 token itu jatah R7 ($30). Berarti alokasi token saat cycle dibuat tidak mengikuti sub-tier (atau sub-tier record-nya yang salah). Berdampak langsung ke jumlah baris member di TPAL CSV (fairness undian).

## G4. 🟠 `status` giveaway tidak pernah transisi — semua `OPEN`

```json
// GET /api/v1/admin/giveaways  (admin@, 2026-08-03)
{ "name":"SLR Red June",      "status":"OPEN", "draws_at":"2026-06-30…" }  // lewat >1 bulan → harusnya DRAWN/CLOSED
{ "name":"SLR Red September", "status":"OPEN", "opens_at":"2026-09-01…" }  // belum buka → harusnya SCHEDULED/UPCOMING
{ "name":"Blue Weekly Draw",  "status":"OPEN", "draws_at":"2026-07-03…", "winner_count":1 }  // sudah ada winner, tetap OPEN
```

`status` didefinisikan server-derived (FE dilarang menghitung ulang dari tanggal), jadi lifecycle-nya harus benar di server: *scheduled → open → closed → drawn*.

## G5. 🟠 `POST /admin/winners` menerima winner SEBELUM draw terjadi

Red Weekly Draw `draws_at:"2026-08-07T08:00Z"`, tapi dua winner tercatat **2–3 Aug** (`recorded_at:"2026-08-02T14:39…"`, `"2026-08-03T00:45…"`). Draw dijalankan eksternal via TPAL setelah `draws_at` — merekam winner sebelum tanggal undian harusnya ditolak (422 VALIDATION_ERROR) supaya data compliance-nya bersih.

## G6. 🟠 `entry_count: 0` di semua giveaway admin padahal ada member yang entered

Member `red@` dilaporkan entered dengan 7 token aktif (G1/G2), tapi `GET /admin/giveaways` menampilkan `entry_count:0` untuk semua giveaway. Admin butuh angka ini untuk sanity-check pool sebelum TPAL export (`draw_pass > 0` → masuk CSV).

## G7. 🟡 `?search=` diabaikan diam-diam di `/admin/giveaways` & `/admin/winners`

```
GET /admin/giveaways?search=zzzquux → 200, total 4 (semua row, tidak terfilter)
GET /admin/winners?search=zzzquux  → 200, semua row
```

`GET /admin/members` sudah support `search` (verified 2026-08-02) — dua endpoint ini belum, dan parameternya di-*ignore* tanpa error. **FE workaround:** fetch-all + filter client-side. **Expected:** implement `search` (giveaways: name/prize · winners: nama/email/prize), atau kembalikan 400 supaya tidak silent.

## G8. 🟡 Rekap gap kontrak lama yang masih open (referensi — detail di [BACKEND-ISSUES.md](BACKEND-ISSUES.md))

- `GET /giveaways/{id}` masih incomplete vs API Contract v1.0 — tanpa rules, TPAL note, entry history, past winners → FE mengisi copy statis.
- Stub giveaway di `GET /admin/winners` tidak membawa `opens_at/closes_at/draws_at` → FE join manual dari `GET /admin/giveaways` by `giveaway_id`.
- Tidak ada pool entries / entries-per-giveaway untuk member (konteks odds, PRD §4.3) → FE memakai token cycle sebagai proxy.

---

## Ringkasan prioritas

| ID | Endpoint | Masalah | Prioritas |
| --- | --- | --- | --- |
| G1 | `GET /giveaways/` | `is_entered` bocor ke draw lewat/belum buka | 🔴 |
| G2 | `GET /entries/` | cycle kadaluarsa masih current + active | 🔴 |
| G3 | cycle engine | `base_token` tidak sesuai sub-tier (r4 → 7) | 🔴 |
| G4 | `GET /admin/giveaways` | `status` tidak transisi (semua OPEN) | 🟠 |
| G5 | `POST /admin/winners` | winner bisa direkam sebelum `draws_at` | 🟠 |
| G6 | `GET /admin/giveaways` | `entry_count` selalu 0 | 🟠 |
| G7 | `GET /admin/giveaways`·`winners` | `?search=` di-ignore diam-diam | 🟡 |
| G8 | (rekap) | gap kontrak detail/stub/pool masih open | 🟡 |
