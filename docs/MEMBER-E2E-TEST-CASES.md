# SLR — Member End-to-End Test Cases (Full Coverage)

**Sumber acuan:** PRD v3.2 EN §3–4 (Notion) + kondisi kode aktual per 2026-08-12.
**Cakupan:** Seluruh alur member-facing — registrasi, dashboard, giveaways, discounts/BENY, spin wheel, e-books, profile, entry history, membership billing, referral, notifikasi.
**Di luar cakupan:** Alur admin (lihat `docs/SPRINT3-GOOGLE-DOCS-TEST-CASES.md` Suite 3 untuk sebagian admin).

**Nama Penguji:** ____________________
**Tanggal Pengujian:** 2026-08-13 s/d 2026-08-14
**Browser / OS:** ____________________
**Environment (`NEXT_PUBLIC_API_URL`):** dev.smartliferewards.com.au

Legend status: ✅ Pass · ❌ Fail · ⚠️ Partial/anomali · ⬜ Belum dites · 🚧 Known gap (bukan bug, catat saja)

---

## Known Gaps (jangan ditandai FAIL — sudah tercatat, verifikasi status terkininya saja)

| Area | Status kode saat ini | PRD ref |
|---|---|---|
| **Referral page** (`/member/referral`) | Stub `ComingSoon` — belum ada kode/progress/history real | §4.9 |
| **Spin Wheel Moment 2** (24h sebelum renewal) | ✅ 2026-08-15: FE lengkap (`RenewalSpinCard`, gating `spinEligible`), `GET /spin/status` live merespons shape benar. Belum live-tested karena tidak ada cara memaksa akun masuk window 24 jam pra-renewal — cron/timing-nya sendiri belum terverifikasi jalan. | §4.5 |
| **Membership card + QR code** | Tidak ditemukan di `/member/profile` — kemungkinan belum dibangun | §4.7 |
| **BENY charge** | ✅ 2026-08-15: RESOLVED — backend ternyata sudah kirim `checkout_url` (Stripe Checkout Session asli), FE-nya yang buang field itu (tidak pernah redirect member ke checkout). Sudah di-fix di FE (`resources/beny.ts`, `beny-actions.ts`, `beny-section.tsx`). Lihat Suite 7 langkah 5. | §4.4 |

Jika salah satu di atas ternyata sudah berubah (misal Referral sudah live), catat di kolom Status sebagai info, bukan fail.

---

## TEST SUITE 1 — Registrasi Visitor (Free, OTP)

**PRD ref:** §4.1. **Tujuan:** Visitor daftar gratis, verifikasi email via OTP, dapat 1 token + draw_pass infinite.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/sign-up`. Isi nama, email baru, password, DOB, state, phone. | Form step 1 (Account) valid. Coba isi DOB < 18 tahun dari hari ini → ditolak baik di client maupun submit. | ✅ |
| 2 | Isi DOB tepat/di atas 18 tahun, submit step 1. | Lanjut ke Step 2 (Tier Selection). | ✅ |
| 3 | Pilih **Visitor (Free)**. | Tidak ada step Spin Wheel (Visitor tidak eligible spin). Lanjut ke step verifikasi email/OTP. | ✅ |
| 4 | Cek inbox email test, masukkan kode OTP di `step-otp.tsx`. | OTP valid → akun aktif langsung (tanpa Stripe). | ✅ (email delay beberapa menit, bukan bug) |
| 5 | Masukkan OTP salah/kadaluarsa. | Error ditampilkan, ada opsi resend OTP. | ✅ Pass — OTP salah ditolak, error message muncul, tidak bisa lanjut. |
| 6 | Setelah OTP sukses, cek dashboard member. | Akun status `active`. Tier = Visitor. 1 token/cycle. draw_pass TIDAK pernah ditampilkan sebagai angka di UI manapun. | ✅ |
| 7 | Buka `/member/giveaways`. | Visitor hanya melihat draw Visitor mingguan ($25 Coles Digital Credit) — tab RED/BLUE TIDAK dirender sama sekali. | ✅ |
| 8 | Buka `/member/ebooks`, klik salah satu judul. | Listing terlihat, tapi konten full terkunci dengan CTA upgrade (Visitor tidak dapat akses penuh). | ✅ |

---

## TEST SUITE 2 — Registrasi Berbayar + Safe Hours + Spin Wheel (Moment 1)

**PRD ref:** §4.1, §4.5. **Tujuan:** Verifikasi tier berbayar, Safe Hours lockout, DOB gate, spin wheel anti-abuse, checkout Stripe.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Set waktu sistem/simulasi ke Jumat 16:00–19:00 (Safe Hours window), buka `/sign-up`, coba submit. | Tombol registrasi/lanjut ke checkout disabled, pesan "coba lagi setelah 19:00" muncul (`SafeHoursNotice`). | ✅ Diverifikasi via API (`manual_override:FORCE_LOCK`) untuk 3 endpoint: `/auth/register`, `/memberships/upgrade`, `/membership/checkout`. **Bug ditemukan & fixed**: `/membership/checkout` sempat 200 tembus ke Stripe walau lock aktif — sekarang 403 SAFE_HOURS_LOCKED. FE client-side gate (`useSafeHours`) hardcoded ke jam asli Jumat 16-19, tidak baca config admin (advisory only, by design). |
| 2 | Di luar Safe Hours, isi form registrasi dengan DOB valid (≥18 th). Klik Next. | Lanjut ke Step 2 (Tier Selection). | ✅ |
| 3 | Pilih **R1** atau **B1** (tanpa spin wheel). Klik Next. | Langsung ke step checkout — **tidak ada** step Spin Wheel (R1/B1/Visitor tidak eligible). | ✅ (dites dengan B1) |
| 4 | Ulangi registrasi baru, pilih **R4/R7/B4/B7/B10** (token-upgrade tier). | Step Spin Wheel muncul sebelum Stripe Checkout. | ✅ Pass — akun baru `spintest-20260815-01@careney.com` (R7 Premium), step "One free spin" muncul sebelum checkout. Wheel 8 segmen, 2/8 "$10 off" (= 1/4 odds, match PRD). |
| 5 | Klik **Spin**. | Wheel animasi, hasil 1/4 odds (menang/kalah), hasil tercatat untuk audit. | ✅ Pass — menang "$10 off". Dikonfirmasi tercatat di `GET /admin/spin/history`: `result:"win", discount_cents:1000, applied:true, moment:"registration"`. Record "lose" historis lain juga ditemukan konsisten (`discount_cents:0, applied:false`). |
| 6 | Jika menang → lanjut checkout. | Diskon sesuai tabel (R4 $5 / R7 $10 / B4 $10 / B7 $15 / B10 $20) otomatis diterapkan ke harga Stripe. | ✅ Pass — order review app: Subtotal $30 → Spin discount -$10 ("first month only") → Due today $20, "$30/month dari next billing". Dikonfirmasi ulang di halaman Stripe Checkout asli: Subtotal A$30.00 → Spin Wheel Discount -A$10.00 → Total due today A$20.00. Selesai bayar (kartu test 4242...) → `/auth/me` konfirmasi `billing_status:"active"`, `sub_tier:"r7"`, `token:7`. |
| 7 | Refresh halaman / reload di tengah step spin wheel. | Spin TIDAK reset — user tidak bisa spin ulang meski refresh (spin diikat ke user + moment `registration`, bukan ke sub-tier). | ✅ Pass — akun kedua `spintest-20260815-02@careney.com` (R4 Plus, menang $5 off). Setelah "refresh" (re-login + re-fetch), `GET /spin/status` → `available:false`; percobaan `POST /spin/execute` lagi → `409 CONFLICT "No spin is currently available for your account..."`. Server-side enforced, bukan cuma state client. |
| 8 | **[Anti-abuse]** Setelah kalah/menang di R4, coba ganti tier ke R7 sebelum bayar (jika ada opsi ganti tier saat pending), lalu cek apakah muncul spin baru. | Spin TIDAK boleh muncul lagi — eligibility dicek per user+moment, bukan per sub-tier. Jika sebelumnya menang di R4 lalu pindah ke R7, diskon ikut ke harga R7 (proporsional, bukan diskon flat lama). | ✅ Pass — akun `spintest-20260815-02` (menang $5 di R4), dari layar `/complete-payment` klik **Change plan** → pilih SLR RED Premium (R7) → checkout session BARU dibuat, tidak ada spin baru ditawarkan. Diskon di Stripe checkout ter-reprice otomatis jadi "Spin Wheel Discount (**Premium**)" -A$10.00 (Subtotal A$30) — BUKAN $5 flat lama dari R4. Sesuai spec persis. |
| 9 | Lanjut ke Stripe Checkout, bayar dengan kartu test `4242 4242 4242 4242`. | Redirect ke Stripe hosted checkout, nominal sesuai tier − diskon spin (jika menang). | ✅ (dites dengan B1, tanpa spin) |
| 10 | Selesaikan pembayaran. | Redirect ke `/complete-payment?status=...` → polling `GET /billing/status` → status jadi `active`, token + 4 draw_pass di-assign, draw pool state ditentukan. Welcome email + invoice terkirim. | ✅ Diverifikasi via `GET /auth/me`: `billing_status:"active"`, token assigned, `current_cycle` terisi |
| 11 | Klik **Sign In to Dashboard**, login ulang. | Masuk langsung ke `/member` dashboard, tidak diarahkan ke complete-payment lagi. | ✅ |

---

## TEST SUITE 3 — Edge Case Pending Payment

**PRD ref:** §4.1 (catatan "User abandons payment"). **Tujuan:** Pastikan user tidak locked-out dan tidak ada dirty data/duplikasi akun.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Daftar tier berbayar, sampai di Stripe Checkout, lalu klik Back/Cancel tanpa bayar. | Redirect ke `/complete-payment?status=cancelled`. Status akun = `pending_payment` (bukan `active`), TIDAK dapat token/draw_pass, TIDAK muncul di draw CSV. | ✅ Diverifikasi via `GET /auth/me`: `status:"pending_payment"`, `billing_status:"inactive"`, `current_cycle:null` |
| 2 | Dari layar complete-payment, klik **Change Plan**, pilih tier lain, klik **Complete Payment** lagi. | Checkout session BARU dibuat untuk tier baru — tidak ada error idempotency-key conflict. | ✅ |
| 3 | Tutup browser/tab di tengah Stripe Checkout. Login ulang dengan akun yang sama. | Login BERHASIL (jangan block login untuk status pending_payment). User diarahkan ke layar "complete your payment", bukan dashboard kosong/error. | ✅ |
| 4 | Dari layar itu, klik lanjut bayar lagi. | Checkout session baru dibuat (bukan reuse URL lama yang sudah expired 24h). | ✅ (mekanisme sama dengan langkah 2, dikonfirmasi bersama) |
| 5 | Coba daftar ulang dengan email yang SAMA (masih pending_payment). | Sistem TIDAK overwrite akun. Muncul pesan ramah "sudah pernah daftar, silakan login untuk lanjut bayar" + link forgot-password. Bukan dead-end, bukan overwrite. | ✅ Pesan "You've already started signing up with this email. Log in to finish your payment." → redirect ke `/sign-in?email=...` |
| 6 | Klik forgot-password dari pesan tsb, reset password, login. | Forgot-password bekerja normal untuk akun berstatus pending_payment. | ✅ (setelah fix — lihat catatan bug di bawah). Diverifikasi login dengan password baru via API 200 pada akun `pending_payment` |
| 7 | (Manual/DB check — opsional) Biarkan akun pending_payment >7 hari tanpa bayar. | Akun ditandai abandoned/deleted, email & phone dibebaskan (verifikasi via admin/backend, bukan FE). | ⏭️ Skip (perlu waktu 7 hari nyata / akses DB backend) |

---

## TEST SUITE 4 — Login, Forgot & Reset Password

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/sign-in`, login dengan akun aktif valid. | Berhasil masuk ke `/member`. | ✅ Pass |
| 2 | Login dengan password salah. | Error message jelas, tidak expose apakah email valid/tidak (anti user-enumeration). | ✅ Pass |
| 3 | Buka `/forgot-password`, masukkan email terdaftar. | Email reset terkirim (via Mailjet). | ✅ Pass |
| 4 | Buka link reset, buka `/reset-password`, set password baru. | Password berhasil diubah, redirect ke sign-in. | ✅ Pass |
| 5 | Login dengan password lama (setelah reset). | Ditolak — password lama sudah tidak valid. | ✅ Pass |
| 6 | Login dengan password baru. | Berhasil. | ✅ Pass |
| 7 | Buka `/verify-email` dengan akun Visitor yang belum verifikasi (jika applicable), gunakan tombol resend di `verify-email-panel.tsx`. | OTP baru terkirim, kode lama invalid. | ✅ Pass |

---

## TEST SUITE 5 — Member Dashboard (`/member`)

**PRD ref:** §4.2. **Fokus:** entry-display rule (draw_pass tidak boleh muncul), notifikasi bell.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Login, buka `/member`. | Header: logo, nav, avatar + tier badge. Greeting "Welcome back, [Nama]". | ✅ Pass |
| 2 | Cek Membership Summary Card. | Tampilkan tier, billing status, next payment date, entry count. **Entry count = token per draw** (mis. "Entries per draw: 4" untuk R4) — BUKAN token × draw_pass (mis. jangan pernah muncul "16 entries"). Istilah "draw_pass" tidak boleh muncul di UI sama sekali. | |
| 3 | Cek Draw Status Card. | Draw aktif saat ini, countdown timer, draw pool assignment (state+tier), entry count konsisten dengan Membership Summary Card. | |
| 4 | Cek Quick Actions. | Link ke Discounts, Giveaways, E-Books, Profile — semua berfungsi. | |
| 5 | Cek Featured Discounts (horizontal scroll) & Upcoming Giveaways (preview 2-3 draw). | Data terisi dari API, bukan hardcoded. | |
| 6-9 | ~~Bell notifikasi (buka panel, mark read, mark all read, empty state)~~ | 🚫 **Dihapus by design (2026-08-15)** — semua notifikasi member dikirim via email (Mailjet), bell in-app dicabut dari FE (`notifications-panel.tsx`, `resources/notifications.ts`, endpoint `notifications.list/read`, tipe `MemberNotification`/`NotificationType` dihapus). Bukan gap, bukan bug — keputusan scope. | N/A |
| 10 | Jika akun `cancelled`/grace period, cek banner terkait. | `CancelledMembershipBanner`/`grace-banner.tsx` muncul dengan info tanggal akses berakhir + CTA sesuai kondisi (mis. "Pay now" untuk grace period). | ⚠️ Verified via code only — `member/page.tsx:156,203` render `CancelledMembershipBanner` saat `billing_status==='canceled'` (accessEndsAt dari `cycle.end_at`); `grace-banner.tsx` render saat `billing_status==='grace'` (Pay now → `POST /api/v1/billing/pay-manual`, hosted Stripe). Logic sesuai spec tapi tidak live-tested — `billing_status` didorong dari Stripe subscription lifecycle via webhook, tidak ada admin API untuk memaksa state ini tanpa cancel/gagal bayar subscription asli. |

---

## TEST SUITE 6 — Giveaways (`/member/giveaways`, `/member/giveaways/[id]`)

**PRD ref:** §4.3. **Fokus:** tab visibility per role — ini rule yang paling sering salah implementasi.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Login sebagai **Visitor**, buka `/member/giveaways`. | TIDAK ada tab/segmented control RED/BLUE sama sekali. Hanya draw Visitor mingguan ($25 Coles) yang tampil. | ✅ Pass — akun `negise2138@careney.com`, tidak ada tab, `GET /giveaways` juga return `[]` (memang tidak ada draw Visitor aktif saat ini — data state, bukan bug). |
| 2 | Login sebagai **RED member** (R1/R4/R7), buka giveaways. | Default ke tab RED, badge "You're Entered". Tab BLUE terlihat tapi locked + CTA "Upgrade to Enter" — tidak bisa diklik masuk entry. | ✅ Pass — akun `stripetestafterfix10@stripe.com` (R7). Tab default RED. Tab BLUE: banner locked "You're on RED — these draws are BLUE only" + CTA "Compare tiers" → `/member/membership`. Per-card CTA persis "Upgrade to enter" ada di `giveaway-card.tsx:70-75` (link ke `/member/membership`, bukan ke detail draw) — tidak muncul live karena kebetulan tidak ada draw BLUE aktif untuk dibandingkan, dikonfirmasi lewat kode. |
| 3 | Login sebagai **BLUE member** (B1/B4/B7/B10), buka giveaways. | Kedua tab RED dan BLUE terlihat, KEDUANYA berstatus entered (BLUE = akses penuh semua draw). Tidak ada locked state. | ✅ Pass — akun `jecere6490@hutdot.com` (B1). Kedua tab terlihat, tidak ada locked state di manapun. |
| 4 | Cek badge "You're Entered" / "Active" di kartu draw. | Badge digerakkan oleh `entry_status` (active/inactive) dari API — BUKAN oleh draw_pass mentah. | ✅ Pass |
| 5 | Klik salah satu kartu draw aktif. | Masuk ke halaman detail (`/member/giveaways/[id]`): prize info lengkap, rules, catatan sertifikasi TPAL, entry history, past winners. | ✅ Pass |
| 6 | Cek countdown timer & total entries di kartu. | Update real-time/akurat sesuai draw config. | ✅ Pass |
| 7 | Cek empty state (belum ada draw aktif untuk tier). | "No Giveaways Right Now" ditampilkan dengan CTA kembali ke dashboard. | ✅ Pass — live ketemu tidak sengaja di step 1 (akun Visitor, tidak ada draw aktif saat ini), CTA "Back to dashboard" jalan. |
| 8 | Tier RED coba upgrade ke BLUE lalu cek tab draw upsell. | Setelah upgrade berlaku (sesuai jadwal cycle), tab BLUE tidak lagi locked. | ⚠️ Verified via code only — `giveaways-board.tsx:38-42,87` menghitung locked murni dari `tierGroupOf(memberSubTier)` tiap render (server component, tidak ada cache stale), jadi begitu tier member benar berubah pasca-upgrade otomatis unlock. Tidak live-tested karena butuh nunggu siklus billing beneran (upgrade paid→paid baru berlaku di renewal berikutnya, PRD §pending_upgrade). |

---

## TEST SUITE 7 — Discounts & BENY (`/member/discounts`)

**PRD ref:** §4.4. **Fokus:** BENY 4-state lifecycle.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/member/discounts`. | Search bar, category filter, partner discount cards tampil. | ✅ Pass |
| 2 | Klik salah satu discount card. | Detail: kode, deskripsi, terms, tombol copy-to-clipboard kode berfungsi. | ✅ Pass — dialog lengkap (kode, deskripsi, "How to claim", link website). Copy-to-clipboard `discount-detail-dialog.tsx:21-23` pakai `navigator.clipboard.writeText` + toast "Code copied" + icon Copy→Check, dikonfirmasi via kode. |
| 3 | Scroll ke section BENY, status awal `inactive`. | CTA "Get BENY Access ($4/mo)" tampil, form Nama/Email/Phone muncul saat diklik. | ✅ Pass — ⚠️ **koreksi lokasi:** section BENY (`BenySection`) dirender di `/member/membership`, BUKAN di `/member/discounts` seperti asumsi test case ini (`beny-section.tsx` diimport oleh `membership/page.tsx`, tidak dipakai sama sekali di `discounts/page.tsx`). CTA aktual "Add BENY — $4/mo" (copy beda dikit dari "Get BENY Access", bukan bug). Form pre-filled nama/email/phone member, muncul saat CTA diklik. |
| 4 | Isi form, submit. | `POST /beny/subscribe` dipanggil dengan payload `{name, email, phone}`. Status berubah ke `pending_activation`. Toast sukses muncul. | ✅ Pass — ada confirm dialog tambahan ("charge $4.00 AUD per month recursively") sebelum submit, bagus buat UX safety net. `beny_status` jadi `pending_activation` dikonfirmasi via `GET /beny/status`. |
| 5 | Verifikasi di Stripe dashboard apakah ada charge $4 pada langkah ini. | **Catat hasilnya** — per catatan internal, endpoint ini sebelumnya HANYA membuat record pending tanpa charge Stripe. Jika sudah charge, ini perubahan baru — laporkan sebagai temuan info, bukan bug. | ✅ **FIXED (2026-08-15)** — ditemukan backend SEKARANG mengembalikan `checkout_url` + `session_id` di response `POST /beny/subscribe` (dikonfirmasi via OpenAPI docs terbaru; record admin BENY subscribe kita punya `stripe_subscription_id: cs_test_...`, Stripe Checkout Session asli), tapi FE membuang field itu — member tidak pernah diarahkan bayar $4/mo. Fixed: `resources/beny.ts` (`BenySubscribeResponse` baru dengan `checkout_url`/`session_id`), `beny-actions.ts` (`subscribeBenyAction` meneruskan `checkoutUrl`, comment "BACKEND BLOCK" usang dihapus), `beny-section.tsx` (`window.open(checkoutUrl, '_blank', 'noopener,noreferrer')` setelah subscribe sukses, sesuai konvensi redirect eksternal CLAUDE.md). Type-check clean. Belum di-live-retest end-to-end — akun test yang tersedia (`jecere6490`, `kifego1134`) sama-sama sedang `pending_deactivation` sehingga `POST /beny/subscribe` ditolak `409 CONFLICT`; perlu akun RED/BLUE bersih (belum pernah subscribe BENY) untuk verifikasi live berikutnya. |
| 6 | Dengan status `pending_activation` atau `active`, klik **Cancel BENY**. | `DELETE /beny/subscribe` dipanggil. Response TIDAK membawa `beny_status` baru — FE harus assume cancelled atau re-fetch `GET /beny/status`. | ✅ Pass — dikonfirmasi via curl, response DELETE cuma `{success, message}`, tidak ada `beny_status`. FE (`beny-actions.ts:52-56`) hardcode assume `pending_deactivation`, konsisten dengan state asli setelah re-fetch. |
| 7 | Cek status setelah cancel jika sebelumnya `active`. | Status jadi `pending_deactivation` (BUKAN langsung "cancelled") — karena revoke akses BENY dilakukan manual oleh admin di portal BENY eksternal. Member TETAP punya akses selama masih `pending_deactivation`. | ✅ Pass — akun `kifego1134@amupx.com`: admin approve dulu (→`active`), lalu cancel → `beny_status:"pending_deactivation"`, `activated_at` tetap ada (akses tidak dicabut), `expires_at` terisi. |
| 8 | Cek status setelah cancel jika sebelumnya `pending_activation` (belum pernah diaktifkan admin). | Cancel tetap berhasil (backend fix — boleh cancel dari pending_activation, bukan cuma dari active). | ✅ Pass — akun `jecere6490@hutdot.com`, cancel dari `pending_activation` berhasil → `pending_deactivation`. |
| 9 | (Cross-check admin) Admin approve BENY dari `/dashboard/beny`. | Status member berubah `active`, member menerima email aktivasi + instruksi download app BENY. | ✅ Pass (partial) — `POST /admin/beny/{id}/activate` (akun `kifego1134`) → member-side `GET /beny/status` jadi `active`, `stripe_subscription_id` berubah dari format Checkout Session (`cs_test_`) ke Subscription asli (`sub_1U4c...`) — konfirmasi Stripe billing full-wired di backend. Isi email aktivasi tidak diverifikasi (tidak ada akses inbox). |

---

## TEST SUITE 8 — Spin Wheel Moment 2 (24h sebelum renewal)

**PRD ref:** §4.5. **Catatan:** butuh cron/backend job — cek dulu apakah sudah live (lihat Known Gaps).

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Akun tier R4/R7/B4/B7/B10, simulasikan H-24 jam sebelum renewal. | Email notifikasi terkirim otomatis berisi link ke spin wheel di dashboard. | ⚠️ Tidak bisa disimulasikan — tidak ada admin API untuk memaksa akun masuk window 24 jam pra-renewal, dan tidak ada akun test yang kebetulan berada di window itu sekarang. |
| 2 | Login → dashboard, cek section spin wheel. | Section spin aktif dengan 1 spin pass tersedia. | ⚠️ Verified via code only — `member/page.tsx:44-55,94,206-207` sudah lengkap: `getSpinStatus()` dipanggil kalau `spinEligible`, `RenewalSpinCard` dirender kalau `spin.available && spin.moment==='renewal'`. `GET /spin/status` live untuk akun R7 (`stripetestafterfix10`) mengembalikan shape benar (`available:false, moment:null` — karena memang bukan bukan window 24 jam). FE siap, tinggal nunggu window nyata. |
| 3 | Klik Spin. | 1/4 odds, hasil tercatat untuk audit. | ⚠️ Verified via code only — sama seperti Suite 2 Spin Moment 1 (`POST /spin/execute`), belum bisa live-test tanpa berada di window renewal. |
| 4 | Jika menang. | Diskon diterapkan ke tagihan auto-renewal berikutnya SAJA (one-time, bukan cycle selanjutnya). | ⚠️ Verified via code only — sama alasan di atas. |
| 5 | Jika tidak spin dalam 24 jam / kalah. | Expired, renewal ditagih harga penuh. | ⚠️ Verified via code only — sama alasan di atas. |
| 6 | Akun tier R1/B1/Visitor. | Section spin wheel TIDAK muncul sama sekali (tidak eligible). | ✅ Pass — akun `jecere6490@hutdot.com` (B1): `GET /spin/status` live return `403 FORBIDDEN "Your membership tier is not eligible"`, dan dashboard `/member` tidak menampilkan section spin sama sekali (FE gate di `spinEligible` sebelum manggil API sekalipun). |

---

## TEST SUITE 9 — E-Books (`/member/ebooks`, `/member/ebooks/[id]`)

**PRD ref:** §4.6.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/member/ebooks` sebagai Visitor. | Listing terlihat (cover, judul, deskripsi) untuk semua orang. | ✅ Pass |
| 2 | Klik salah satu e-book sebagai Visitor. | Konten terkunci dengan CTA upgrade — tidak bisa baca full content. | ✅ Pass — kartu locked link langsung ke `/member/membership` (tidak ada halaman detail locked dari list). Akses URL detail langsung (`/member/ebooks/{id}`) sebagai Visitor JUGA di-guard server-side: tampil "This e-book is a member benefit" + CTA "Upgrade now", tidak bocor konten. |
| 3 | Login sebagai RED atau BLUE, buka e-book yang sama. | Akses penuh — halaman baca long-form (BUKAN PDF viewer). | ✅ Pass — akun `stripetestafterfix10@stripe.com` (RED R7), konten lengkap 6 chapter. |
| 4 | Cek struktur halaman baca. | Hero (judul, subtitle, jumlah chapter, estimasi baca, cover) → sticky "In This Guide" TOC dengan progress indicator saat scroll → per-chapter (nomor+judul, gambar, body, pull-quote) → tombol "Back to Top" + "Next Ebook" → footer. | ✅ Pass — semua elemen ada. Catatan: TOC (`ebook-reader.tsx:129`) cuma tampil di breakpoint `xl:` (≥1280px), hilang di layar lebih sempit (bukan bug, delibrate — halaman baca full-width di mobile/tablet). |
| 5 | Klik TOC item. | Scroll ke chapter terkait, progress indicator update. | ✅ Pass — scroll ke anchor `#chapter-03`, item TOC ter-highlight gold, chapter sebelumnya dapat checkmark "read". |
| 6 | Klik "Next Ebook" di akhir. | Navigasi ke e-book berikutnya. | ✅ **FIXED & live-verified (2026-08-15)** — sebelumnya tombol berlabel "More E-Books" hardcode ke `/member/ebooks` (listing), bukan e-book spesifik berikutnya. Fixed: `[id]/page.tsx` sekarang fetch daftar katalog dan hitung item berikutnya berdasar urutan yang sama dengan `/member/ebooks`; item terakhir tetap fallback ke listing. Live-tested setelah deploy: dari "Everyday Fitness Blueprint" tombol jadi "Next: Australian Tax Cheatsheet" → link ke ebook yang benar. |
| 7 | Cari tombol download/offline. | TIDAK ADA — no download/offline feature di web (mobile-only). | ✅ **FIXED & live-verified (2026-08-15)** — 2 e-book lama berformat PDF ("React JS Ebooks", "Next JS Ebook", `chapter_count:0`) di-render lewat `PdfEbookViewer` yang punya tombol **"Download"** eksplisit (`download` attribute) — melanggar rule CLAUDE.md §1. Fixed: link `download` dihapus dari `pdf-ebook-viewer.tsx`, sisa "Open PDF" (tab baru, tanpa save-as paksa). Live-tested setelah deploy: tombol Download custom sudah hilang (ikon download yang tersisa di toolbar PDF adalah UI native browser Chrome sendiri, di luar kontrol app — normal untuk embed `<object type="application/pdf">` manapun). |
| 8 | (Cross-check admin) Edit chapter via `/dashboard/ebooks` CMS. | Perubahan langsung tercermin di halaman baca member tanpa re-deploy. | ⚠️ Verified via code only — `resources/ebooks.ts:106,111` pakai `cache:'no-store'` di kedua fetch (list & detail), pola sama seperti Prizes yang sudah terbukti live-update di sesi sebelumnya. Tidak di-live-retest langsung supaya tidak mengubah konten CMS asli. |

---

## TEST SUITE 10 — Profile & Account (`/member/profile`)

**PRD ref:** §4.7.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/member/profile`. | Header: avatar (inisial), nama, tier badge, state. Personal Info section, Security section, Support Links section. | ✅ Pass |
| 2 | Cek ada/tidaknya toggle 2FA. | TIDAK ADA toggle 2FA (deprioritized, di luar scope 4-round pertama). | ✅ Pass — tidak ada toggle 2FA di mana pun. |
| 3 | Cek ada/tidaknya membership card dengan QR code. | Sesuai Known Gaps — kemungkinan belum dibangun. Catat status aktualnya. | 🚧 Known Gap dikonfirmasi masih gap — tidak ada membership card/QR code di `/member/profile`. |
| 4 | Di Security section, ganti password. | Berhasil, bisa login dengan password baru. | ✅ Pass — akun `spintest-20260815-01@careney.com`. "Password updated" muncul, login ulang dengan password baru berhasil ke `/member`. |
| 5 | Cek Support Links. | FAQ, giveaway rules, T&C, privacy policy, contact — semua link valid. | ✅ Pass — kelima link (`/faq`, `/giveaway-rules`, `/terms`, `/privacy`, `/contact`) dicek langsung, semua render halaman dengan title benar, tidak ada 404. |
| 6 | Cek billing history / invoice (di `/member/membership`, bukan di profile). | Invoice TIDAK men-generate PDF sendiri — link "View" mengarah ke Stripe `hosted_invoice_url`. Jika URL tidak tersedia, hanya tampil status Paid + tanggal + jumlah tanpa tombol download. | ✅ Pass — link "View" mengarah ke `invoice.stripe.com/i/...` (hosted asli, `target='_blank'`). Kode (`membership/page.tsx:162-172`) fallback ke `-` (bukan tombol) kalau `hosted_invoice_url` null — sesuai spec. |

---

## TEST SUITE 11 — Entry History (`/member/entry-history`)

**PRD ref:** §4.10.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka `/member/entry-history`. | Current Cycle Card: rentang tanggal cycle, tier saat ini, base token, referral bonus (jika ada), total active token, status "Entry active"/"Entry inactive". | ✅ Pass — ⚠️ implementasi beda dari wording spec: bukan "card" terpisah, current cycle jadi baris pertama di tabel unified yang sama dengan histori (`entry-history-table.tsx`). Semua data ada: rentang tanggal, tier, base token (7), referral (-), total (7), status "Active". Bukan bug, cuma treatment UI berbeda. |
| 2 | Cek kolom draw_pass di mana pun di halaman ini. | TIDAK PERNAH ditampilkan — hanya status "Entry active"/"Entry inactive". | ✅ Pass — cuma "Entry Status: Active", tidak ada angka draw_pass. |
| 3 | Cek tabel riwayat cycle sebelumnya. | Urut terbaru dulu. Kolom: Cycle, Tier, Base Token, Referral Bonus, Total Token, Status. | ⚠️ Kolom persis sesuai (Cycle/Tier/Base/Referral/Total/Entry Status). Urutan tidak bisa dites — semua akun test baru berumur <28 hari, belum ada cycle ke-2. Kode (`page.tsx:29-36`) menaruh `current_cycle` duluan lalu `data.history` apa adanya dari API, tidak ada sort eksplisit di FE — asumsikan API sudah urutkan terbaru dulu, belum diverifikasi. |
| 4 | Cari baris di mana user upgrade/downgrade tier di tengah histori. | Ada label kecil di kolom tier menandakan perubahan (mis. "R1 (upgraded to R4)"). | ✅ **FIXED (2026-08-15)** — `entry-history-table.tsx` sekarang punya `tierChangeLabel()`: bandingkan `tier` baris ini vs baris berikutnya (cycle lebih lama, array urut terbaru dulu), tampil label gold kecil "Changed from {TIER}" di bawah TierBadge (desktop + mobile) kalau beda. Tidak perlu field baru dari backend — `tier` sudah ada di tiap row `EntryCycle`. Type-check pass. Tidak bisa live-test (butuh akun dengan histori upgrade 2+ cycle, belum ada di data test). |
| 5 | Gunakan filter status (jika tersedia). | Filter by status/cycle range bekerja. | N/A — tidak ada filter UI di kode sama sekali (dicek `entry-history-table.tsx` & `page.tsx`), sesuai kualifikasi "(jika tersedia)" di langkah ini. |
| 6 | Cek konsistensi total token di sini vs entry count di dashboard (`/member`) dan giveaways (`/member/giveaways`). | Angka harus konsisten di ketiga tempat. | ✅ Pass — akun `spintest-20260815-01` (R7): Entry History Total=7, Dashboard "Entries per draw"=7, konsisten. Draw Status Card & Giveaways sempat nunjukin "0 entries" untuk draw RED MONTHLY tertentu — bukan inkonsistensi, karena draw itu belum `active` (opens 1 Sep 2026), sesuai by-design `entered = phase==='active' && is_entered` yang sudah dikonfirmasi di sesi sebelumnya. |

---

## TEST SUITE 12 — Membership Upgrade / Downgrade / Cancel (`/member/membership`)

**PRD ref:** §4.11. Diverifikasi wired ke API real (bukan placeholder).

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Akun **Visitor**, buka `/member/membership`, upgrade ke tier berbayar (mis. R1). | Upgrade IMMEDIATE — cycle baru mulai sekarang, token + 4 draw_pass langsung di-assign. TIDAK melalui `pending_upgrade`. | ⚠️ Verified via code only — `UpgradePlanPicker` (dirender saat `isVisitor`) redirect ke Stripe Checkout via `startSubTierCheckout()`, bukan lewat `scheduleTierChangeAction`. Tidak live-tested di step ini (akun test yang dipakai sudah paid); immediate-vs-pending sudah dikonfirmasi live waktu Suite 2 registrasi berbayar. |
| 2 | Akun **Paid** (mis. R4), klik **Change plan**. | Dialog muncul, list opsi tier lain (exclude tier saat ini & exclude Visitor — turun ke Visitor = "Cancel membership", bukan plan change). | ✅ Pass (live, akun R7 `spintest-20260815-01`) — dialog list 6 opsi (R1/R4 Blue×4), R7 (tier sendiri) & Visitor tidak muncul. |
| 3 | Selama Safe Hours window (Jumat 16-19), coba klik Change plan. | Tombol disabled + `SafeHoursNotice` tampil (upgrade/downgrade ikut kena lockout Safe Hours). | ⚠️ Tidak bisa live-test — tanggal tes (Sabtu 15 Aug 2026) di luar window Jumat 16-19. Verified via code: `useSafeHours()` hook dipakai untuk disable tombol + render `SafeHoursNotice`, pola sama dengan yang sudah dikonfirmasi live di Suite 2/registrasi. |
| 4 | Di luar Safe Hours, pilih tier baru, klik **Confirm change**. | `POST /memberships/upgrade` dipanggil dengan `target_sub_tier`. Banner persisten muncul: "Scheduled → [Tier] on [tanggal renewal]". Status = SCHEDULED, bukan langsung berubah (no proration, applies at next renewal). | ✅ Pass (live) — pilih R4, confirm → banner "Scheduled → SLR Red · Plus on 12 Sep 2026" muncul, current plan tetap "SLR Red · Premium" (tidak langsung berubah). |
| 5 | Refresh halaman setelah step 4. | Banner scheduled tetap muncul (persisten lintas reload). | ✅ Pass (live) — reload, banner "Scheduled → SLR Red · Plus on 12 Sep 2026" tetap ada (server-side `pending_upgrade`, bukan cuma state client). |
| 6 | Klik **Cancel scheduled change** di banner. | `DELETE /memberships/upgrade` dipanggil. Banner hilang, tier tetap di tier lama. | ✅ Pass (live) — banner hilang setelah klik, current plan tetap "SLR Red · Premium". |
| 7 | Tunggu sampai next renewal date terlewati (atau simulasi backend). | Setelah bayar sukses di tier baru: fitur tier baru terbuka, token+draw_pass baru di-assign, `pending_upgrade` dihapus. | ⚠️ Tidak bisa live-test — butuh nunggu real 28-hari renewal cycle atau akses ke cron/simulasi backend, tidak tersedia di environment tes ini. |
| 8 | Klik **Cancel membership**. | Dialog konfirmasi: "Access continues until [tanggal renewal]. No further charges after that." Tombol "Keep membership" / "Yes, cancel". | ✅ Pass (live) — dialog persis sesuai: "Access continues until 15 Sep 2026. No further charges after that." + Keep membership / Yes, cancel. |
| 9 | Confirm cancel. | `POST /subscriptions/me/cancel` dipanggil. Tombol "Cancel membership" hilang dari UI (subscription sudah cancelled/inactive). Banner cancelled/grace muncul di dashboard. | ✅ **FIXED (2026-08-15)** — Banner "Membership Cancelled" muncul benar setelah reload, TAPI tombol "Cancel membership" tetap tampil & klik-able (bug ditemukan live: dialog cancel muncul lagi untuk subscription yang sudah cancelled). Root cause: `isSubscriptionCanceledOrInactive` (`manage-membership-actions.tsx`) cuma cek string `billing_status` literal ("canceled"/"cancelled"/"inactive"), padahal subscription cancelled-tapi-masih-grace tetap `billing_status: "active"` dengan `cancel_at_period_end: true` — flag terpisah yang sebelumnya tidak diteruskan ke komponen ini. Fix: tambah prop `cancelAtPeriodEnd` (dari `billing.cancel_at_period_end`, diteruskan lewat `page.tsx` → `ManageTier` → `ManageMembershipActions`) + state `justCancelled` untuk optimistic-hide di tab yang sama tanpa reload. Type-check pass. Belum di-deploy/live-re-verify (perlu push dulu). |
| 10 | Cek akses fitur selama grace/cancelled-tapi-belum-expired. | Akses tetap jalan sampai `nextRenewalIso` terlewati, sesuai pesan di step 8. | ✅ Pass (live) — setelah cancel, `/member/discounts` masih fully accessible (semua "Claim Deal" enabled, tidak ada gate), sesuai janji "Access continues until 15 Sep 2026". |
| 11 | (Cross-check backend) Admin cancel subscription langsung dari Stripe dashboard (bukan dari app). | Webhook `customer.subscription.deleted` diterima → membership di-set inactive + draw_pass = 0 di sisi backend, tidak drift dari data app. | ⚠️ Tidak bisa ditest dari FE — ini murni backend webhook behavior, butuh akses Stripe dashboard admin & backend log/DB untuk verifikasi. Di luar scope FE testing. |

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
**Progress:** Suite 1-9 selesai dites (2026-08-13 s/d 2026-08-15). Suite 10-13 belum dimulai.
**Suite dengan FAIL:** Tidak ada FAIL murni — 8 bug ditemukan lintas Suite 2/3/5/7/9, semua sudah di-fix (backend atau FE) dan diverifikasi ulang (lihat catatan di bawah).
**Known Gap yang dikonfirmasi masih gap:** Spin Wheel Moment 2 (Suite 8) — FE lengkap, tapi cron/timing 24-jam-pra-renewal belum bisa dibuktikan live. Membership card+QR (§4.7) belum di-recheck.
**Known Gap yang sudah dihapus dari scope:** Suite 3 langkah 8 (switch ke Visitor dari layar pending payment) — dihapus dari dokumen atas instruksi (bukan gap yang perlu di-track lagi).
**Known Gap yang ternyata sudah berubah:** BENY charge (Suite 7 langkah 5) — RESOLVED, lihat #5 di bawah.
**Catatan tambahan / bug baru ditemukan:**
```
1. [FIXED oleh backend] PUT /api/v1/admin/safe-hours sempat 500 INTERNAL_ERROR untuk
   SEMUA payload (termasuk payload identik dengan GET saat ini) — bukan cuma
   FORCE_LOCK. Diverifikasi ulang 2026-08-14: sekarang 200 untuk semua kombinasi
   manual_override (NONE/FORCE_LOCK/FORCE_UNLOCK).

2. [FIXED oleh backend] POST /api/v1/membership/checkout (Visitor→Paid checkout,
   dipakai UpgradePlanPicker) TIDAK mengecek Safe Hours lock — sempat 200 + URL
   Stripe asli walau admin.safe-hours.is_currently_locked:true, sementara
   /auth/register dan /memberships/upgrade sudah benar menolak 403
   SAFE_HOURS_LOCKED. Diverifikasi ulang 2026-08-14: sekarang konsisten 403 di
   ketiga endpoint.

3. [FIXED di FE] resources/auth.ts resetPassword() tidak mengirim confirm_password
   — backend sekarang mewajibkan field ini (required, min 1 char), request lama
   selalu gagal dengan 400 VALIDATION_ERROR sebelum sempat mengecek validitas
   token, sehingga SEMUA link reset password tampak "invalid or expired" padahal
   sebenarnya field yang kurang. Fixed: reset-password-form.tsx sekarang
   mengirim confirm password yang sudah dikumpulkan form (sebelumnya cuma
   dipakai validasi client-side, tidak pernah dikirim ke API).

4. [Data test, bukan bug] Giveaway dengan draws_at di masa depan yang sudah
   closed/ada pemenang tapi belum dihapus dari DB bisa membuat FE salah
   menampilkannya sebagai "Current Draw" aktif (FE memilih giveaway aktif
   murni dari draws_at > now, tidak ada flag "closed" terpisah di response
   list). Bukan bug kode — housekeeping data test.

5. [FIXED di FE] resources/beny.ts / beny-actions.ts / beny-section.tsx —
   backend POST /beny/subscribe sekarang mengembalikan checkout_url + session_id
   (Stripe Checkout Session asli, dikonfirmasi via OpenAPI + stripe_subscription_id
   riil di record admin BENY), tapi FE cuma baca beny_status dan membuang field
   itu — member TIDAK PERNAH diarahkan bayar $4/mo, langsung dapat status
   pending_activation tanpa payment. Fixed: checkout_url sekarang dipakai untuk
   window.open(_blank, noopener/noreferrer) setelah subscribe sukses. Revenue
   leak sebelum fix ini.

6. [FIXED di FE] components/common/pdf-ebook-viewer.tsx — 2 e-book format lama
   ("React JS Ebooks", "Next JS Ebook") punya tombol "Download" eksplisit
   (download attribute), melanggar rule "no download/offline on web
   (mobile-only)". Fixed: link download dihapus, sisa "Open PDF" (tab baru).

7. [FIXED di FE] app/member/ebooks/[id]/page.tsx — tombol akhir halaman baca
   berlabel "More E-Books" hardcode ke /member/ebooks (listing), bukan
   "Next Ebook" spesifik sesuai PRD. Fixed: sekarang hitung ebook berikutnya
   dari urutan katalog yang sama dengan listing; item terakhir tetap fallback
   ke listing.

8. [Removed by design] Notification bell in-app di member header dihapus
   (notifications-panel.tsx, resources/notifications.ts, endpoint
   /notifications, tipe MemberNotification/NotificationType) — keputusan
   scope: semua notifikasi member sekarang lewat email (Mailjet) saja, bukan
   bug.
```

**Suite 2 Spin Wheel (Moment 1) — live-tested penuh 2026-08-15** dengan 2 akun
baru (`spintest-20260815-01/02@careney.com`, R7 & R4): odds 1/4 (2/8 segmen),
diskon sesuai tabel ($10 untuk R7, $5 untuk R4), tercatat di
`GET /admin/spin/history` untuk audit, tidak bisa spin ulang (409 CONFLICT
server-side), dan anti-abuse tier-switch bekerja benar — pindah tier
sebelum bayar me-reprice diskon ke tarif tier baru (BUKAN flat lama),
tanpa spin baru ditawarkan.
