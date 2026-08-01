# SLR SPRINT 3 — END-TO-END TEST CASES REPORT

**Nama Penguji:** ____________________  
**Tanggal Pengujian:** ____________________  
**Browser / OS:** ____________________  

---

## TEST SUITE 1: ALUR REGISTRASI & PEMBAYARAN PENDING (NEW USERS)

### Test Case 1.1: Registrasi Berbayar & Spin Wheel
* **Tujuan:** Memastikan pendaftar baru paid-tier bisa spin wheel, diskon teraplikasikan, dan dialihkan ke Stripe.
* **Prasyarat:** Menggunakan email baru yang belum terdaftar.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status (Pass/Fail) |
|---|---|---|:---:|
| 1 | Buka alamat `/sign-up` | Halaman form registrasi terbuka. | |
| 2 | Isi nama, email baru, password, state, tanggal lahir, dan nomor telepon. Klik **Next**. | Halaman beralih ke pilihan paket (Step 2 - Tier Selection). | |
| 3 | Pilih plan **Blue B4 ($39/mo)**. Klik **Next**. | Halaman beralih ke Step **Spin Wheel**. | |
| 4 | Klik tombol **Spin** pada roda undian. | Piringan undian berputar dan menampilkan diskon yang diperoleh (contoh: mendapatkan potongan harga). | |
| 5 | Klik **Continue to checkout** -> **Complete Payment**. | Halaman langsung ter-redirect otomatis ke halaman Stripe Checkout eksternal. | |
| 6 | Verifikasi detail tagihan di halaman Stripe Checkout. | Nominal harga Blue B4 ($39) terpotong otomatis sesuai nilai diskon dari spin wheel. | |

---

### Test Case 1.2: Ganti Paket (Plan Swapping) saat Pembayaran Pending
* **Tujuan:** Verifikasi pengguna bisa kembali di tengah proses checkout dan ganti paket tanpa terblokir sistem.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status (Pass/Fail) |
|---|---|---|:---:|
| 1 | Di halaman Stripe Checkout, klik tombol Batal/Kembali. | Pengguna dikembalikan ke website SLR pada halaman status pembayaran ditangguhkan ("No worries"). | |
| 2 | Klik tombol **Change Plan** di layar complete-payment. | Muncul daftar pilihan paket berbayar yang tersedia. | |
| 3 | Pilih paket **Red R7 ($30)**, lalu klik **Complete Payment**. | Pengguna kembali ter-redirect ke Stripe Checkout baru dengan nominal $30 secara lancar tanpa hambatan/error. | |
| 4 | Klik tombol Batal/Kembali kembali dari Stripe R7. | Pengguna kembali ke layar penangguhan pembayaran secara sukses. | |

---

### Test Case 1.3: Redirection & Login Akun Pending Payment
* **Tujuan:** Memastikan pengguna yang belum melunasi tagihannya diarahkan untuk menyelesaikan pembayaran terlebih dahulu.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status (Pass/Fail) |
|---|---|---|:---:|
| 1 | Tutup browser tab saat berada di Stripe Checkout. | Sesi navigasi terputus (simulasi browser tertutup tidak sengaja). | |
| 2 | Buka kembali website SLR, kemudian masuk ke halaman `/sign-in` dan log in. | Login berhasil masuk. | |
| 3 | Coba akses halaman dashboard member secara langsung. | Pengguna secara otomatis dialihkan kembali ke layar checkout pembayaran guna melunasi tagihan. | |
| 4 | Coba daftarkan kembali email yang sama pada halaman registrasi. | Sistem menolak pendaftaran ulang dan menampilkan notifikasi ramah yang menyarankan pengguna untuk login dan melunasi pembayaran. | |

---

## TEST SUITE 2: STATUS PEMBAYARAN BERHASIL (ACTIVE MEMBER AREA)

### Test Case 2.1: Stripe Payment Success & Login Sesi Baru
* **Tujuan:** Verifikasi keanggotaan langsung aktif setelah pembayaran Stripe berhasil diselesaikan.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status (Pass/Fail) |
|---|---|---|:---:|
| 1 | Selesaikan pembayaran di halaman Stripe (menggunakan kartu uji standard). | Pembayaran terproses sukses dan Stripe me-redirect pengguna ke halaman sukses. | |
| 2 | Tunggu proses verifikasi status akun (2-10 detik). | Sistem mendeteksi pembayaran berhasil, status akun berubah menjadi aktif, dan tombol **Sign In to Dashboard** muncul. | |
| 3 | Klik **Sign In to Dashboard**. | Sesi lama dibersihkan secara otomatis, dan pengguna diarahkan ke halaman login. | |
| 4 | Login kembali menggunakan email dan password terdaftar. | Pengguna langsung masuk to dashboard utama member tanpa diarahkan ke halaman penangguhan pembayaran. | |

---

### Test Case 2.2: Batalkan Langganan (Cancel Membership)
* **Tujuan:** Memastikan anggota aktif bisa mengajukan pembatalan langganan untuk periode berikutnya.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status (Pass/Fail) |
|---|---|---|:---:|
| 1 | Buka menu **Membership** di dashboard member. | Halaman membership terbuka dan menampilkan status aktif dan rencana perpanjangan berikutnya. | |
| 2 | Klik tombol **Cancel membership**. | Dialog konfirmasi muncul, menginformasikan bahwa pembatalan akan berlaku setelah masa tenggang periode bayar berakhir. | |
| 3 | Klik konfirmasi pembatalan. | Status berubah menjadi ditangguhkan (grace period). Tombol pembatalan otomatis disembunyikan. | |

---

### Test Case 2.3: Upgrade/Downgrade Plan (Scheduled Change)
* **Tujuan:** Menguji penjadwalan pergantian paket untuk perpanjangan siklus berikutnya.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status (Pass/Fail) |
|---|---|---|:---:|
| 1 | Di menu **Membership**, klik **Change plan**. | Dialog pemilihan paket terbuka. | |
| 2 | Pilih paket lain (contoh: dari R4 ke B7), klik **Confirm change**. | Banner perubahan jadwal paket muncul secara persisten lintas reload. | |
| 3 | Klik tombol **Cancel scheduled change** di banner. | Siklus perubahan paket dibatalkan, dan detail membership kembali normal. | |

---

### Test Case 2.4: Beli Addon Kemitraan BENY ($4/mo)
* **Tujuan:** Menguji proses pemesanan add-on BENY untuk pengguna aktif.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status (Pass/Fail) |
|---|---|---|:---:|
| 1 | Buka halaman **Discounts** di dashboard member. | Panel BENY muncul menampilkan keterangan belum berlangganan. | |
| 2 | Klik **Add BENY — $4/mo** dan isi data Nama, Email, Telepon pada form. | Formulir terisi lengkap. | |
| 3 | Klik **Subscribe** / **Continue to checkout**. | Pendaftaran sukses dilakukan dan status berubah menjadi menunggu aktivasi admin ("Pending Activation"). | |
| 4 | Klik tombol **Cancel BENY**. | Pendaftaran add-on berhasil dibatalkan dan status kembali menjadi tidak aktif. | |

---

## TEST SUITE 3: ADMINISTRASI PLATFORM & TPAL EXPORTS (ADMIN SIDE)

### Test Case 3.1: Preview Undian (Giveaways) & Winner History (Riwayat Pemenang)
* **Tujuan:** Memverifikasi daftar undian dan pemenang undian di dashboard member.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status (Pass/Fail) |
|---|---|---|:---:|
| 1 | Buka menu **Giveaways** di dashboard member. | Layout list undian per tier (RED/BLUE/VISITOR) terakses rapi dalam bentuk grid. | |
| 2 | Ganti tab filter tier undian. | Daftar undian tersaring sesuai tab aktif (RED/BLUE). | |
| 3 | Klik salah satu kartu undian yang aktif. | Masuk ke halaman detail undian, menampilkan deskripsi undian, tanggal main, serta riwayat pemenang (winner history) di bagian bawah. | |

---

### Test Case 3.2: Export Dokumen TPAL (Generasi CSV Undian)
* **Tujuan:** Memvalidasi fitur download CSV audit untuk compliance randomdraws.com.au.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status (Pass/Fail) |
|---|---|---|:---:|
| 1 | Login ke dashboard administrator (/dashboard) menggunakan akun staf/admin. | Dashboard administrator terbuka. | |
| 2 | Buka menu **TPAL Exports**. | Halaman generator CSV dan riwayat audit undian terbuka dengan benar. | |
| 3 | Klik tombol **Generate CSV**. | Sistem merespons sukses dan membuat 3 file CSV terenkapsulasi per tier (Visitor, RED, BLUE). | |
| 4 | Klik tombol **Download** di file baris tabel riwayat yang baru dibuat. | File CSV sukses ter-download. | |
| 5 | Buka file CSV hasil unduhan dan periksa strukturnya. | File CSV memuat tepat 6 kolom: `id, email, full_name, state, phone, total_token`. | |

---

### Test Case 3.3: Aktivasi Manual Addon BENY oleh Admin
* **Tujuan:** Memvalidasi kemudahan admin dalam mengaktifkan langganan BENY yang berstatus pending.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status (Pass/Fail) |
|---|---|---|:---:|
| 1 | Di dalam dashboard admin, buka menu **BENY Activations**. | Halaman daftar antrean aktivasi BENY terbuka, menampilkan baris user yang berstatus pending. | |
| 2 | Cari pengguna yang mendaftar BENY di Test Case 2.4. | Data nama, email, telepon, dan status "pending_activation" user tersebut terlihat di baris list teratas. | |
| 3 | Klik tombol **Activate** pada baris pengguna tersebut, lalu konfirmasi. | Status akun BENY pengguna berubah menjadi aktif, baris list hilang dari antrean pending. | |
| 4 | Log out admin, login kembali menggunakan akun member tadi, buka menu **Discounts**. | Status BENY di dashboard member telah ter-update otomatis menjadi "Active". | |
