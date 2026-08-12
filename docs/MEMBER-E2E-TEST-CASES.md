# SLR — Member End-to-End Test Cases (Full Coverage)

**Sumber acuan:** PRD v3.2 EN §3–4 (Notion) + kondisi kode aktual per 2026-08-12.
**Cakupan:** Seluruh alur member-facing — registrasi, dashboard, giveaways, discounts/BENY, spin wheel, e-books, profile, entry history, membership billing, referral, notifikasi.
**Di luar cakupan:** Alur admin (lihat `docs/SPRINT3-GOOGLE-DOCS-TEST-CASES.md` Suite 3 untuk sebagian admin).

**Nama Penguji:** ____________________
**Tanggal Pengujian:** ____________________
**Browser / OS:** ____________________
**Environment (`NEXT_PUBLIC_API_URL`):** ____________________

Legend status: ✅ Pass · ❌ Fail · ⚠️ Partial/anomali · ⬜ Belum dites · 🚧 Known gap (bukan bug, catat saja)

---

## Known Gaps (jangan ditandai FAIL — sudah tercatat, verifikasi status terkininya saja)

| Area | Status kode saat ini | PRD ref |
|---|---|---|
| **Referral page** (`/member/referral`) | Stub `ComingSoon` — belum ada kode/progress/history real | §4.9 |
| **Spin Wheel Moment 2** (24h sebelum renewal) | Perlu cron/backend job — cek apakah sudah live sebelum tes | §4.5 |
| **Membership card + QR code** | Tidak ditemukan di `/member/profile` — kemungkinan belum dibangun | §4.7 |
| **BENY charge** | `POST /beny/subscribe` membuat record pending; verifikasi manual apakah sudah benar-benar charge Stripe atau masih uncharged (cek Stripe dashboard) | §4.4 |

Jika salah satu di atas ternyata sudah berubah (misal Referral sudah live), catat di kolom Status sebagai info, bukan fail.

---

## TEST SUITE 1 — Registrasi Visitor (Free, OTP)

**PRD ref:** §4.1. **Tujuan:** Visitor daftar gratis, verifikasi email via OTP, dapat 1 token + draw_pass infinite.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/sign-up`. Isi nama, email baru, password, DOB, state, phone. | Form step 1 (Account) valid. Coba isi DOB < 18 tahun dari hari ini → ditolak baik di client maupun submit. | |
| 2 | Isi DOB tepat/di atas 18 tahun, submit step 1. | Lanjut ke Step 2 (Tier Selection). | |
| 3 | Pilih **Visitor (Free)**. | Tidak ada step Spin Wheel (Visitor tidak eligible spin). Lanjut ke step verifikasi email/OTP. | |
| 4 | Cek inbox email test, masukkan kode OTP di `step-otp.tsx`. | OTP valid → akun aktif langsung (tanpa Stripe). | |
| 5 | Masukkan OTP salah/kadaluarsa. | Error ditampilkan, ada opsi resend OTP. | |
| 6 | Setelah OTP sukses, cek dashboard member. | Akun status `active`. Tier = Visitor. 1 token/cycle. draw_pass TIDAK pernah ditampilkan sebagai angka di UI manapun. | |
| 7 | Buka `/member/giveaways`. | Visitor hanya melihat draw Visitor mingguan ($25 Coles Digital Credit) — tab RED/BLUE TIDAK dirender sama sekali. | |
| 8 | Buka `/member/ebooks`, klik salah satu judul. | Listing terlihat, tapi konten full terkunci dengan CTA upgrade (Visitor tidak dapat akses penuh). | |

---

## TEST SUITE 2 — Registrasi Berbayar + Safe Hours + Spin Wheel (Moment 1)

**PRD ref:** §4.1, §4.5. **Tujuan:** Verifikasi tier berbayar, Safe Hours lockout, DOB gate, spin wheel anti-abuse, checkout Stripe.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Set waktu sistem/simulasi ke Jumat 16:00–19:00 (Safe Hours window), buka `/sign-up`, coba submit. | Tombol registrasi/lanjut ke checkout disabled, pesan "coba lagi setelah 19:00" muncul (`SafeHoursNotice`). | |
| 2 | Di luar Safe Hours, isi form registrasi dengan DOB valid (≥18 th). Klik Next. | Lanjut ke Step 2 (Tier Selection). | |
| 3 | Pilih **R1** atau **B1** (tanpa spin wheel). Klik Next. | Langsung ke step checkout — **tidak ada** step Spin Wheel (R1/B1/Visitor tidak eligible). | |
| 4 | Ulangi registrasi baru, pilih **R4/R7/B4/B7/B10** (token-upgrade tier). | Step Spin Wheel muncul sebelum Stripe Checkout. | |
| 5 | Klik **Spin**. | Wheel animasi, hasil 1/4 odds (menang/kalah), hasil tercatat untuk audit. | |
| 6 | Jika menang → lanjut checkout. | Diskon sesuai tabel (R4 $5 / R7 $10 / B4 $10 / B7 $15 / B10 $20) otomatis diterapkan ke harga Stripe. | |
| 7 | Refresh halaman / reload di tengah step spin wheel. | Spin TIDAK reset — user tidak bisa spin ulang meski refresh (spin diikat ke user + moment `registration`, bukan ke sub-tier). | |
| 8 | **[Anti-abuse]** Setelah kalah/menang di R4, coba ganti tier ke R7 sebelum bayar (jika ada opsi ganti tier saat pending), lalu cek apakah muncul spin baru. | Spin TIDAK boleh muncul lagi — eligibility dicek per user+moment, bukan per sub-tier. Jika sebelumnya menang di R4 lalu pindah ke R7, diskon ikut ke harga R7 (proporsional, bukan diskon flat lama). | |
| 9 | Lanjut ke Stripe Checkout, bayar dengan kartu test `4242 4242 4242 4242`. | Redirect ke Stripe hosted checkout, nominal sesuai tier − diskon spin (jika menang). | |
| 10 | Selesaikan pembayaran. | Redirect ke `/complete-payment?status=...` → polling `GET /billing/status` → status jadi `active`, token + 4 draw_pass di-assign, draw pool state ditentukan. Welcome email + invoice terkirim. | |
| 11 | Klik **Sign In to Dashboard**, login ulang. | Masuk langsung ke `/member` dashboard, tidak diarahkan ke complete-payment lagi. | |

---

## TEST SUITE 3 — Edge Case Pending Payment

**PRD ref:** §4.1 (catatan "User abandons payment"). **Tujuan:** Pastikan user tidak locked-out dan tidak ada dirty data/duplikasi akun.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Daftar tier berbayar, sampai di Stripe Checkout, lalu klik Back/Cancel tanpa bayar. | Redirect ke `/complete-payment?status=cancelled`. Status akun = `pending_payment` (bukan `active`), TIDAK dapat token/draw_pass, TIDAK muncul di draw CSV. | |
| 2 | Dari layar complete-payment, klik **Change Plan**, pilih tier lain, klik **Complete Payment** lagi. | Checkout session BARU dibuat untuk tier baru — tidak ada error idempotency-key conflict. | |
| 3 | Tutup browser/tab di tengah Stripe Checkout. Login ulang dengan akun yang sama. | Login BERHASIL (jangan block login untuk status pending_payment). User diarahkan ke layar "complete your payment", bukan dashboard kosong/error. | |
| 4 | Dari layar itu, klik lanjut bayar lagi. | Checkout session baru dibuat (bukan reuse URL lama yang sudah expired 24h). | |
| 5 | Coba daftar ulang dengan email yang SAMA (masih pending_payment). | Sistem TIDAK overwrite akun. Muncul pesan ramah "sudah pernah daftar, silakan login untuk lanjut bayar" + link forgot-password. Bukan dead-end, bukan overwrite. | |
| 6 | Klik forgot-password dari pesan tsb, reset password, login. | Forgot-password bekerja normal untuk akun berstatus pending_payment. | |
| 7 | (Manual/DB check — opsional) Biarkan akun pending_payment >7 hari tanpa bayar. | Akun ditandai abandoned/deleted, email & phone dibebaskan (verifikasi via admin/backend, bukan FE). | |
| 8 | Dari layar pending, pilih ganti ke **Visitor**. | Alur berpindah ke `pending_otp` → verifikasi OTP seperti registrasi Visitor normal (tanpa Stripe). | |

---

## TEST SUITE 4 — Login, Forgot & Reset Password

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/sign-in`, login dengan akun aktif valid. | Berhasil masuk ke `/member`. | |
| 2 | Login dengan password salah. | Error message jelas, tidak expose apakah email valid/tidak (anti user-enumeration). | |
| 3 | Buka `/forgot-password`, masukkan email terdaftar. | Email reset terkirim (via Mailjet). | |
| 4 | Buka link reset, buka `/reset-password`, set password baru. | Password berhasil diubah, redirect ke sign-in. | |
| 5 | Login dengan password lama (setelah reset). | Ditolak — password lama sudah tidak valid. | |
| 6 | Login dengan password baru. | Berhasil. | |
| 7 | Buka `/verify-email` dengan akun Visitor yang belum verifikasi (jika applicable), gunakan tombol resend di `verify-email-panel.tsx`. | OTP baru terkirim, kode lama invalid. | |

---

## TEST SUITE 5 — Member Dashboard (`/member`)

**PRD ref:** §4.2. **Fokus:** entry-display rule (draw_pass tidak boleh muncul), notifikasi bell.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Login, buka `/member`. | Header: logo, nav, bell notifikasi (dengan badge unread), avatar + tier badge. Greeting "Welcome back, [Nama]". | |
| 2 | Cek Membership Summary Card. | Tampilkan tier, billing status, next payment date, entry count. **Entry count = token per draw** (mis. "Entries per draw: 4" untuk R4) — BUKAN token × draw_pass (mis. jangan pernah muncul "16 entries"). Istilah "draw_pass" tidak boleh muncul di UI sama sekali. | |
| 3 | Cek Draw Status Card. | Draw aktif saat ini, countdown timer, draw pool assignment (state+tier), entry count konsisten dengan Membership Summary Card. | |
| 4 | Cek Quick Actions. | Link ke Discounts, Giveaways, E-Books, Profile — semua berfungsi. | |
| 5 | Cek Featured Discounts (horizontal scroll) & Upcoming Giveaways (preview 2-3 draw). | Data terisi dari API, bukan hardcoded. | |
| 6 | Klik bell notifikasi. | Panel/dropdown terbuka: list notifikasi (icon tipe, judul, body singkat, waktu relatif, indikator unread). Badge angka hilang jika 0 unread. | |
| 7 | Klik salah satu notifikasi unread. | Notifikasi ditandai read (dot/bg berubah), badge count berkurang. Jika relevan, navigasi ke halaman terkait (mis. notifikasi menang → detail giveaway). | |
| 8 | Klik **Mark all as read**. | Semua notifikasi jadi read, badge = 0/hidden. | |
| 9 | Cek empty state (akun baru tanpa notifikasi). | "No notifications yet" ditampilkan. | |
| 10 | Jika akun `cancelled`/grace period, cek banner terkait. | `CancelledMembershipBanner`/`grace-banner.tsx` muncul dengan info tanggal akses berakhir + CTA sesuai kondisi (mis. "Pay now" untuk grace period). | |

---

## TEST SUITE 6 — Giveaways (`/member/giveaways`, `/member/giveaways/[id]`)

**PRD ref:** §4.3. **Fokus:** tab visibility per role — ini rule yang paling sering salah implementasi.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Login sebagai **Visitor**, buka `/member/giveaways`. | TIDAK ada tab/segmented control RED/BLUE sama sekali. Hanya draw Visitor mingguan ($25 Coles) yang tampil. | |
| 2 | Login sebagai **RED member** (R1/R4/R7), buka giveaways. | Default ke tab RED, badge "You're Entered". Tab BLUE terlihat tapi locked + CTA "Upgrade to Enter" — tidak bisa diklik masuk entry. | |
| 3 | Login sebagai **BLUE member** (B1/B4/B7/B10), buka giveaways. | Kedua tab RED dan BLUE terlihat, KEDUANYA berstatus entered (BLUE = akses penuh semua draw). Tidak ada locked state. | |
| 4 | Cek badge "You're Entered" / "Active" di kartu draw. | Badge digerakkan oleh `entry_status` (active/inactive) dari API — BUKAN oleh draw_pass mentah. | |
| 5 | Klik salah satu kartu draw aktif. | Masuk ke halaman detail (`/member/giveaways/[id]`): prize info lengkap, rules, catatan sertifikasi TPAL, entry history, past winners. | |
| 6 | Cek countdown timer & total entries di kartu. | Update real-time/akurat sesuai draw config. | |
| 7 | Cek empty state (belum ada draw aktif untuk tier). | "No Giveaways Right Now" ditampilkan dengan CTA kembali ke dashboard. | |
| 8 | Tier RED coba upgrade ke BLUE lalu cek tab draw upsell. | Setelah upgrade berlaku (sesuai jadwal cycle), tab BLUE tidak lagi locked. | |

---

## TEST SUITE 7 — Discounts & BENY (`/member/discounts`)

**PRD ref:** §4.4. **Fokus:** BENY 4-state lifecycle.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/member/discounts`. | Search bar, category filter, partner discount cards tampil. | |
| 2 | Klik salah satu discount card. | Detail: kode, deskripsi, terms, tombol copy-to-clipboard kode berfungsi. | |
| 3 | Scroll ke section BENY, status awal `inactive`. | CTA "Get BENY Access ($4/mo)" tampil, form Nama/Email/Phone muncul saat diklik. | |
| 4 | Isi form, submit. | `POST /beny/subscribe` dipanggil dengan payload `{name, email, phone}`. Status berubah ke `pending_activation`. Toast sukses muncul. | |
| 5 | Verifikasi di Stripe dashboard apakah ada charge $4 pada langkah ini. | **Catat hasilnya** — per catatan internal, endpoint ini sebelumnya HANYA membuat record pending tanpa charge Stripe. Jika sudah charge, ini perubahan baru — laporkan sebagai temuan info, bukan bug. | |
| 6 | Dengan status `pending_activation` atau `active`, klik **Cancel BENY**. | `DELETE /beny/subscribe` dipanggil. Response TIDAK membawa `beny_status` baru — FE harus assume cancelled atau re-fetch `GET /beny/status`. | |
| 7 | Cek status setelah cancel jika sebelumnya `active`. | Status jadi `pending_deactivation` (BUKAN langsung "cancelled") — karena revoke akses BENY dilakukan manual oleh admin di portal BENY eksternal. Member TETAP punya akses selama masih `pending_deactivation`. | |
| 8 | Cek status setelah cancel jika sebelumnya `pending_activation` (belum pernah diaktifkan admin). | Cancel tetap berhasil (backend fix — boleh cancel dari pending_activation, bukan cuma dari active). | |
| 9 | (Cross-check admin) Admin approve BENY dari `/dashboard/beny`. | Status member berubah `active`, member menerima email aktivasi + instruksi download app BENY. | |

---

## TEST SUITE 8 — Spin Wheel Moment 2 (24h sebelum renewal)

**PRD ref:** §4.5. **Catatan:** butuh cron/backend job — cek dulu apakah sudah live (lihat Known Gaps).

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Akun tier R4/R7/B4/B7/B10, simulasikan H-24 jam sebelum renewal. | Email notifikasi terkirim otomatis berisi link ke spin wheel di dashboard. | |
| 2 | Login → dashboard, cek section spin wheel. | Section spin aktif dengan 1 spin pass tersedia. | |
| 3 | Klik Spin. | 1/4 odds, hasil tercatat untuk audit. | |
| 4 | Jika menang. | Diskon diterapkan ke tagihan auto-renewal berikutnya SAJA (one-time, bukan cycle selanjutnya). | |
| 5 | Jika tidak spin dalam 24 jam / kalah. | Expired, renewal ditagih harga penuh. | |
| 6 | Akun tier R1/B1/Visitor. | Section spin wheel TIDAK muncul sama sekali (tidak eligible). | |

---

## TEST SUITE 9 — E-Books (`/member/ebooks`, `/member/ebooks/[id]`)

**PRD ref:** §4.6.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/member/ebooks` sebagai Visitor. | Listing terlihat (cover, judul, deskripsi) untuk semua orang. | |
| 2 | Klik salah satu e-book sebagai Visitor. | Konten terkunci dengan CTA upgrade — tidak bisa baca full content. | |
| 3 | Login sebagai RED atau BLUE, buka e-book yang sama. | Akses penuh — halaman baca long-form (BUKAN PDF viewer). | |
| 4 | Cek struktur halaman baca. | Hero (judul, subtitle, jumlah chapter, estimasi baca, cover) → sticky "In This Guide" TOC dengan progress indicator saat scroll → per-chapter (nomor+judul, gambar, body, pull-quote) → tombol "Back to Top" + "Next Ebook" → footer. | |
| 5 | Klik TOC item. | Scroll ke chapter terkait, progress indicator update. | |
| 6 | Klik "Next Ebook" di akhir. | Navigasi ke e-book berikutnya. | |
| 7 | Cari tombol download/offline. | TIDAK ADA — no download/offline feature di web (mobile-only). | |
| 8 | (Cross-check admin) Edit chapter via `/dashboard/ebooks` CMS. | Perubahan langsung tercermin di halaman baca member tanpa re-deploy. | |

---

## TEST SUITE 10 — Profile & Account (`/member/profile`)

**PRD ref:** §4.7.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/member/profile`. | Header: avatar (inisial), nama, tier badge, state. Personal Info section, Security section, Support Links section. | |
| 2 | Cek ada/tidaknya toggle 2FA. | TIDAK ADA toggle 2FA (deprioritized, di luar scope 4-round pertama). | |
| 3 | Cek ada/tidaknya membership card dengan QR code. | Sesuai Known Gaps — kemungkinan belum dibangun. Catat status aktualnya. | |
| 4 | Di Security section, ganti password. | Berhasil, bisa login dengan password baru. | |
| 5 | Cek Support Links. | FAQ, giveaway rules, T&C, privacy policy, contact — semua link valid. | |
| 6 | Cek billing history / invoice (di `/member/membership`, bukan di profile). | Invoice TIDAK men-generate PDF sendiri — link "View" mengarah ke Stripe `hosted_invoice_url`. Jika URL tidak tersedia, hanya tampil status Paid + tanggal + jumlah tanpa tombol download. | |

---

## TEST SUITE 11 — Entry History (`/member/entry-history`)

**PRD ref:** §4.10.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/member/entry-history`. | Current Cycle Card: rentang tanggal cycle, tier saat ini, base token, referral bonus (jika ada), total active token, status "Entry active"/"Entry inactive". | |
| 2 | Cek kolom draw_pass di mana pun di halaman ini. | TIDAK PERNAH ditampilkan — hanya status "Entry active"/"Entry inactive". | |
| 3 | Cek tabel riwayat cycle sebelumnya. | Urut terbaru dulu. Kolom: Cycle, Tier, Base Token, Referral Bonus, Total Token, Status. | |
| 4 | Cari baris di mana user upgrade/downgrade tier di tengah histori. | Ada label kecil di kolom tier menandakan perubahan (mis. "R1 (upgraded to R4)"). | |
| 5 | Gunakan filter status (jika tersedia). | Filter by status/cycle range bekerja. | |
| 6 | Cek konsistensi total token di sini vs entry count di dashboard (`/member`) dan giveaways (`/member/giveaways`). | Angka harus konsisten di ketiga tempat. | |

---

## TEST SUITE 12 — Membership Upgrade / Downgrade / Cancel (`/member/membership`)

**PRD ref:** §4.11. Diverifikasi wired ke API real (bukan placeholder).

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Akun **Visitor**, buka `/member/membership`, upgrade ke tier berbayar (mis. R1). | Upgrade IMMEDIATE — cycle baru mulai sekarang, token + 4 draw_pass langsung di-assign. TIDAK melalui `pending_upgrade`. | |
| 2 | Akun **Paid** (mis. R4), klik **Change plan**. | Dialog muncul, list opsi tier lain (exclude tier saat ini & exclude Visitor — turun ke Visitor = "Cancel membership", bukan plan change). | |
| 3 | Selama Safe Hours window (Jumat 16-19), coba klik Change plan. | Tombol disabled + `SafeHoursNotice` tampil (upgrade/downgrade ikut kena lockout Safe Hours). | |
| 4 | Di luar Safe Hours, pilih tier baru, klik **Confirm change**. | `POST /memberships/upgrade` dipanggil dengan `target_sub_tier`. Banner persisten muncul: "Scheduled → [Tier] on [tanggal renewal]". Status = SCHEDULED, bukan langsung berubah (no proration, applies at next renewal). | |
| 5 | Refresh halaman setelah step 4. | Banner scheduled tetap muncul (persisten lintas reload). | |
| 6 | Klik **Cancel scheduled change** di banner. | `DELETE /memberships/upgrade` dipanggil. Banner hilang, tier tetap di tier lama. | |
| 7 | Tunggu sampai next renewal date terlewati (atau simulasi backend). | Setelah bayar sukses di tier baru: fitur tier baru terbuka, token+draw_pass baru di-assign, `pending_upgrade` dihapus. | |
| 8 | Klik **Cancel membership**. | Dialog konfirmasi: "Access continues until [tanggal renewal]. No further charges after that." Tombol "Keep membership" / "Yes, cancel". | |
| 9 | Confirm cancel. | `POST /subscriptions/me/cancel` dipanggil. Tombol "Cancel membership" hilang dari UI (subscription sudah cancelled/inactive). Banner cancelled/grace muncul di dashboard. | |
| 10 | Cek akses fitur selama grace/cancelled-tapi-belum-expired. | Akses tetap jalan sampai `nextRenewalIso` terlewati, sesuai pesan di step 8. | |
| 11 | (Cross-check backend) Admin cancel subscription langsung dari Stripe dashboard (bukan dari app). | Webhook `customer.subscription.deleted` diterima → membership di-set inactive + draw_pass = 0 di sisi backend, tidak drift dari data app. | |

---

## TEST SUITE 13 — Referral (`/member/referral`) — Known Gap

**PRD ref:** §4.9. Saat ini halaman masih stub `ComingSoon`.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/member/referral`. | Jika masih stub: tampil pesan "Coming Soon — Invite friends and earn bonus tokens...". Ini BUKAN bug, jangan tandai FAIL — catat sebagai konfirmasi status. | |
| 2 | Jika sudah live (recheck sebelum tes): kode referral tampil uppercase, tombol Copy & Share. | Sesuai PRD — record hasil aktual. | |
| 3 | Jika sudah live: cek progress counter & bonus history sesuai tier (RED/BLUE = +3 token/10 referral; Visitor = gift manual admin). | Sesuai PRD §4.9 dua varian. | |

---

## Cross-Cutting Checks (jalankan di semua suite di atas)

| No | Cek | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Grep visual di semua halaman member: apakah ada angka draw_pass mentah ditampilkan? | TIDAK ADA DI MANA PUN. Hanya `entry_status` (active/inactive) atau token count yang boleh muncul. | |
| 2 | Semua link/redirect ke Stripe (Checkout, Billing Portal, hosted invoice). | Selalu buka tab baru (`target="_blank"` + `rel="noopener noreferrer"`). | |
| 3 | Semua form Stripe card details. | TIDAK ADA form kartu custom di app — selalu redirect ke Stripe hosted page. | |
| 4 | Cek semua state loading/error di setiap halaman (matikan network sebentar). | Ada fallback error state yang jelas, tidak crash blank page. | |
| 5 | Cek konsistensi entry/token count lintas halaman (Dashboard, Giveaways, Entry History). | Angka sama di ketiga tempat untuk akun yang sama. | |

---

## Ringkasan Hasil

**Total test case:** ~90+ langkah lintas 13 suite.
**Suite dengan FAIL:** ____________________
**Known Gap yang dikonfirmasi masih gap:** ____________________
**Known Gap yang ternyata sudah berubah (butuh update dokumen ini):** ____________________
**Catatan tambahan / bug baru ditemukan:**
```
[Tulis di sini]
```
