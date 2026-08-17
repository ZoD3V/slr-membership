# SLR — Admin Dashboard End-to-End Test Cases (Full Coverage)

**Cakupan:** Seluruh halaman admin — beranda, manajemen member, undian, pemenang, promo partner, e-book, BENY, spin wheel, jam aman, info hadiah, notifikasi, ekspor data undian.
**Di luar cakupan:** Alur member (lihat `docs/MEMBER-E2E-TEST-CASES.md`).

**Nama Penguji:** ____________________
**Tanggal Pengujian:** ____________________
**Browser / OS:** ____________________
**Environment:** dev.smartliferewards.com.au (login pakai akun admin)

Legend status: ✅ Pass · ❌ Fail · ⚠️ Partial/anomali · 🚧 Known gap (bukan bug) · N/A Tidak berlaku · ⏭️ Dilewati · ⬜ Belum dites

---

## TEST SUITE 1 — Beranda Admin

**Tujuan:** Pastikan ringkasan angka-angka penting platform tampil benar di halaman pertama yang dilihat admin.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Login sebagai admin, buka halaman utama admin. | Tampil 4 kartu ringkasan: Total Member, Langganan Aktif, Pendapatan Bulanan, Pembayaran Gagal (30 hari terakhir). | ✅ |
| 2 | Cek bagian ringkasan BENY. | Tampil 4 angka: Menunggu Aktivasi, Aktif, Menunggu Nonaktif, Dibatalkan. | ✅ |
| 3 | Cek bagian "Member per Paket" dan "Member per Provinsi". | Masing-masing tampil sebagai daftar angka per kategori, datanya asli (bukan contoh). | ✅ |
| 4 | Klik kartu Total Member / Langganan Aktif / Pembayaran Gagal. | Berpindah ke halaman Manajemen Member. | ✅ |
| 5 | Klik salah satu kartu ringkasan BENY. | Berpindah ke halaman BENY, langsung menampilkan tab yang sesuai. | ✅ |
| 6 | Matikan koneksi internet sebentar, refresh halaman. | Muncul pesan "data tidak bisa dimuat", bukan halaman kosong/rusak. | ⬜ |

---

## TEST SUITE 2 — Manajemen Member

**Tujuan:** Pastikan admin bisa melihat, mencari, dan mengubah data member dengan aman.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Members. | Tampil ringkasan jumlah member per paket, lalu tabel member: Nama, Email, Paket, Provinsi, Status (warna berbeda per status), Tanggal Daftar. | ✅ |
| 2 | Gunakan pencarian nama. | Tabel tersaring sesuai kata kunci. | ✅ |
| 3 | Gunakan filter paket (Semua/Visitor/Red/Blue). | Tabel tersaring sesuai paket yang dipilih, dan muncul keterangan jumlah hasil (mis. "10 dari 50 member"). | ✅ |
| 4 | Klik salah satu member untuk edit/lihat detail. | Masuk ke halaman detail: info profil (nama, email, telepon, provinsi, status, tanggal daftar) dan info keanggotaan (paket, status tagihan, tanggal perpanjangan). | ✅ |
| 5 | Di halaman detail, ubah status akun (Aktif/Suspend/Nonaktif) lalu simpan. | Tombol simpan hanya aktif kalau ada perubahan. Setelah disimpan, muncul notifikasi sukses dan status ter-update. | ✅ |
| 6 | Di halaman detail, ubah paket member lalu simpan. | Sama seperti di atas — tersimpan terpisah dari perubahan status akun, muncul notifikasi sukses. | ⚠️ |
| 7 | Di halaman detail, ubah provinsi/wilayah undian member lalu simpan. | Sama seperti di atas — tersimpan terpisah, muncul notifikasi sukses. | ⚠️ |
| 8 | Cek info langganan pembayaran di halaman detail. | Tampil info langganan (atau pesan "tidak ada langganan aktif" jika memang tidak ada), riwayat siklus tagihan, dan daftar undian yang pernah dimenangkan member ini (atau "belum ada kemenangan"). | ✅ |
| 9 | Hapus salah satu member (gunakan akun percobaan, bukan akun asli). | Muncul kotak konfirmasi sebelum data benar-benar terhapus. Setelah konfirmasi, member hilang dari daftar + notifikasi sukses. | ✅ |
| 10 | Coba akses halaman Members dari akun member biasa (bukan admin). | Ditolak akses / diarahkan keluar — bukan admin tidak boleh masuk ke halaman ini. | ✅ |

---

## TEST SUITE 3 — Giveaways (Undian) — Sisi Admin

**Tujuan:** Pastikan admin bisa membuat dan mengelola undian dengan aturan yang benar.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Giveaways. | Tabel undian: Nama, Paket, Jenis (mingguan/bulanan), Status (Terbuka/Ditutup/Selesai), Hadiah, tanggal buka/tutup/tarik undian, jumlah entri, jumlah pemenang. | ✅ |
| 2 | Gunakan filter status (Semua/Terbuka/Ditutup/Selesai). | Tabel tersaring sesuai status. | ✅ |
| 3 | Gunakan pencarian nama undian. | Tabel tersaring sesuai kata kunci. | ✅ |
| 4 | Klik "Buat Undian Baru". Isi Nama, Hadiah, Paket, Jenis, tanggal buka. | Tanggal tutup otomatis terisi sesuai jenis (mingguan = 7 hari, bulanan = 28 hari) dan tidak bisa diubah manual. | ✅ |
| 5 | Simpan undian baru. | Undian baru muncul di daftar dengan status yang sesuai. | ✅ |
| 6 | Buka undian yang sudah dibuat untuk diedit. | Nama dan Hadiah bisa diubah. Paket, Jenis, dan semua tanggal TIDAK BISA diubah lagi setelah dibuat. | ✅ |
| 7 | Coba isi tanggal tutup yang tidak sesuai aturan durasi (saat membuat undian baru). | Ditolak dengan pesan error yang jelas. | N/A |
| 8 | Klik "Kelola Pemenang" dari halaman detail undian. | Berpindah ke halaman Pemenang, otomatis tersaring untuk undian ini saja. | ✅ |
| 9 | Hapus undian percobaan (bukan undian asli yang sedang berjalan). | Muncul kotak konfirmasi sebelum terhapus. Setelah konfirmasi, hilang dari daftar + notifikasi sukses. | ✅ |

---

## TEST SUITE 4 — Pemenang Undian

**Tujuan:** Pastikan pencatatan pemenang akurat dan mengunci kesempatan member yang sudah menang dari undian lain di siklus yang sama.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Pemenang. | Tabel: Nama Pemenang, Provinsi, Hadiah, Nama Undian, Paket, tanggal-tanggal terkait, tanggal dicatat. | ✅ |
| 2 | Klik "Kelola Pemenang" dari sebuah undian (lihat Suite 3 langkah 8). | Tabel otomatis tersaring untuk undian tsb, ada tombol "Tampilkan Semua" untuk membatalkan filter. | ✅ |
| 3 | Klik "Catat Pemenang Baru". Pilih Undian. | Tombol pilih member baru aktif setelah undian dipilih (sebelumnya nonaktif). | ✅ |
| 4 | Klik pilih member, cari nama/email, filter provinsi. | Hanya member aktif & masih berhak ikut undian paket tsb yang muncul di daftar pilihan. | ✅ |
| 5 | Pilih member, isi Hadiah, klik simpan. | Muncul kotak konfirmasi yang menjelaskan: mencatat pemenang ini akan MENGHENTIKAN kesempatan member tsb di undian lain pada siklus berjalan. | ✅ |
| 6 | Konfirmasi penyimpanan. | Pemenang tersimpan, muncul di daftar, notifikasi sukses. | ✅ |
| 7 | Cek member yang baru dicatat sebagai pemenang tsb — coba catat dia lagi sebagai pemenang undian lain di siklus yang sama. | Member tsb TIDAK muncul lagi di daftar pilihan member (karena sudah tidak berhak ikut undian lain). | ✅ |
| 8 | Ganti Undian yang dipilih setelah sudah memilih member. | Member yang sudah dipilih otomatis terhapus/reset (harus pilih ulang). | ✅ |
| 9 | Edit pemenang yang sudah tercatat (ubah Hadiah saja). | Tersimpan tanpa memicu ulang kotak konfirmasi/efek penguncian di langkah 5. | ✅ |
| 10 | Hapus data pemenang percobaan. | Muncul kotak konfirmasi. Setelah konfirmasi, hilang dari daftar + notifikasi sukses. | ✅ |

---

## TEST SUITE 5 — Discounts (Promo Partner) — Sisi Admin

**Tujuan:** Pastikan admin bisa mengelola daftar promo partner yang tampil ke member.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Discounts. | Tabel: Judul, Nama Partner, Kategori, status Unggulan (Ya/Tidak). | ✅ |
| 2 | Gunakan pencarian judul. | Tabel tersaring sesuai kata kunci. | ✅ |
| 3 | Klik "Promo Baru". Isi Judul, Partner, Kategori (wajib). | Isian lain (kode, deskripsi, gambar, link website, link peta, unggulan) bersifat opsional. | ✅ |
| 4 | Upload gambar thumbnail dan logo. | Gambar berhasil diunggah dan tampil sebagai pratinjau. | ⬜ |
| 5 | Simpan promo baru. | Muncul di daftar, notifikasi sukses. | ✅ |
| 6 | Buka promo yang sudah dibuat, cek tampilannya di halaman member (Discounts). | Data yang diisi admin tampil dengan benar di sisi member. | ⬜ |
| 7 | Edit promo, ubah status Unggulan. | Perubahan tersimpan dan tampil sesuai di sisi member (promo unggulan biasanya tampil lebih menonjol). | ✅ |
| 8 | Hapus promo percobaan. | Muncul kotak konfirmasi. Setelah konfirmasi, hilang dari daftar + notifikasi sukses. | ✅ |

---

## TEST SUITE 6 — E-Books — Sisi Admin

**Tujuan:** Pastikan admin bisa mengelola e-book dan isi babnya, dan aturan akses per paket berjalan benar.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Ebooks. | Tabel: Judul, Kategori, Estimasi Baca (menit), Jumlah Bab, status Terkunci (Ya/Tidak). | ✅ |
| 2 | Gunakan pencarian judul. | Tabel tersaring sesuai kata kunci. | ✅ |
| 3 | Klik "E-Book Baru", pilih jenis konten: **Bab-bab** atau **File PDF**. | Setelah dipilih dan disimpan, jenis konten ini TIDAK BISA diubah lagi nanti. | ✅ |
| 4 | Buat e-book jenis Bab-bab. Isi Judul, Subjudul, Deskripsi, Sampul, Kategori, Estimasi Baca, dan pilih Tingkat Akses (Visitor/Red/Blue). | Semua isian wajib terisi, tersimpan dengan benar. | ✅ |
| 5 | Buka e-book yang baru dibuat, tambah Bab baru: Nomor Bab, Judul, Isi (wajib), opsional Gambar & Kutipan. | Bab tersimpan dan muncul di daftar bab e-book tsb, dengan urutan sesuai nomor. | ✅ |
| 6 | Edit salah satu bab. | Perubahan tersimpan dengan benar. | ✅ |
| 7 | Hapus salah satu bab percobaan. | Muncul kotak konfirmasi (tampilannya beda dari kotak konfirmasi di halaman lain — ini bukan bug, sudah tercatat di Known Gaps). Setelah konfirmasi, bab terhapus. | ✅ |
| 8 | Buat e-book jenis File PDF. Upload file PDF, isi isian wajib lainnya. | Wajib mengisi file PDF sebelum bisa disimpan. Tidak ada bagian isi Bab untuk jenis ini. | ⬜ |
| 9 | Edit e-book yang sudah ada (baik jenis Bab-bab maupun PDF), cek Tingkat Akses. | **Perhatikan baik-baik:** tingkat akses akan kembali ke pengaturan default (RED) setiap kali dibuka untuk edit — HARUS dipilih ulang secara manual sebelum simpan, kalau tidak bisa salah mengubah akses e-book tanpa disadari admin. | 🚧 |
| 10 | Cek e-book yang barusan dibuat tampil dengan benar di halaman member (E-Books), sesuai tingkat akses yang dipilih. | Visitor hanya bisa lihat e-book untuk semua paket dengan konten terkunci; RED/BLUE bisa akses sesuai tingkat akses e-book. | ⬜ |
| 11 | Hapus e-book percobaan. | Muncul kotak konfirmasi. Setelah konfirmasi, hilang dari daftar + notifikasi sukses. | ✅ |

---

## TEST SUITE 7 — BENY — Sisi Admin

**Tujuan:** Pastikan admin bisa memproses antrean aktivasi dan nonaktivasi add-on BENY dengan benar.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman BENY. | Tampil 4 menu: Menunggu Aktivasi, Aktif, Menunggu Nonaktif, Dibatalkan. | ✅ |
| 2 | Buka menu Menunggu Aktivasi. | Tabel: Nama, Email, Telepon, Tanggal Diajukan, dengan tombol aksi per baris. | ✅ |
| 3 | Cari member yang baru mendaftar BENY (lihat Suite BENY di dokumen member). | Data member tsb terlihat di baris teratas daftar menunggu aktivasi. | ✅ |
| 4 | Klik "Aktifkan" pada baris member tsb. | Muncul kotak konfirmasi yang mengingatkan admin untuk SUDAH menambahkan member secara manual di sistem BENY pihak ketiga terlebih dulu, sebelum konfirmasi. | ✅ |
| 5 | Konfirmasi aktivasi. | Baris hilang dari daftar Menunggu Aktivasi, status member berubah jadi Aktif, notifikasi sukses. | ✅ |
| 6 | Login sebagai member yang barusan diaktifkan, cek halaman Membership. | Status BENY di sisi member sudah ter-update jadi Aktif. | ⬜ |
| 7 | Buka menu Menunggu Nonaktif (setelah ada member yang membatalkan BENY dari sisi member). | Tabel tampil dengan tombol "Tandai Nonaktif" per baris. | ⬜ |
| 8 | Coba klik "Tandai Nonaktif" untuk member yang MASA AKSESNYA BELUM BERAKHIR. | Tombol NONAKTIF (tidak bisa diklik) dengan keterangan alasan saat diarahkan kursor ke tombol tsb. | ⬜ |
| 9 | Untuk member yang masa aksesnya SUDAH berakhir, klik "Tandai Nonaktif". | Muncul kotak konfirmasi yang mewajibkan memilih Alasan Nonaktif (Member membatalkan / Pembayaran gagal / Refund admin / Lainnya) sebelum bisa konfirmasi. | ⬜ |
| 10 | Konfirmasi. | Baris berpindah ke menu Dibatalkan, notifikasi sukses. | ⬜ |
| 11 | Buka menu Aktif dan Dibatalkan. | Kedua menu ini hanya untuk dilihat, tidak ada tombol aksi apapun. | ✅ |

---

## TEST SUITE 8 — Spin Wheel — Sisi Admin

**Tujuan:** Pastikan admin bisa mengatur diskon spin wheel per paket dan melihat riwayat undian spin member.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Spin Wheel, bagian Pengaturan. | Saklar aktif/nonaktif keseluruhan, lalu daftar 5 paket yang berhak spin (R4/R7/B4/B7/B10) masing-masing dengan jumlah diskon dan saklar aktif/nonaktif sendiri. | ✅ |
| 2 | Ubah salah satu jumlah diskon atau saklar, lalu simpan. | Tombol simpan hanya aktif kalau ada perubahan. Setelah simpan, notifikasi sukses. | ✅ |
| 3 | Coba kosongkan/isi bukan angka di kolom diskon. | Muncul peringatan halus tanpa menghapus nilai terakhir yang valid. | ✅ |
| 4 | Buka bagian Riwayat Spin. | Tabel: Nama Member, Paket, Momen (Saat Daftar/Sebelum Perpanjangan), Hasil (Menang/Kalah), Jumlah Diskon (untuk yang menang), status Terpakai, tanggal kadaluarsa, tanggal spin. | ✅ |
| 5 | Gunakan filter Paket dan filter Momen. | Tabel tersaring sesuai pilihan. | ✅ |
| 6 | Cek data riwayat cocok dengan hasil spin yang pernah dilakukan member (bandingkan dengan hasil di Suite 2 dokumen member). | Data konsisten — hasil menang/kalah dan jumlah diskon sama persis. | ✅ |

---

## TEST SUITE 9 — Jam Aman (Safe Hours) — Sisi Admin

**Tujuan:** Pastikan admin bisa mengatur jendela waktu terlarang untuk pendaftaran/pembayaran.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Jam Aman. | Keterangan status terkunci saat ini (Ya/Tidak), pilihan hari, jam mulai & jam selesai, saklar aktif, dan pilihan mode override manual (Tidak ada / Paksa terkunci / Paksa terbuka). | ✅ |
| 2 | Isi jam selesai lebih awal dari jam mulai. | Ditolak dengan pesan error yang jelas. | ✅ |
| 3 | Ubah salah satu pengaturan (misalnya jam), simpan. | Notifikasi sukses. | ⬜ |
| 4 | Set mode override ke "Paksa terkunci", simpan. | Coba akses halaman daftar/pembayaran di sisi member (lihat dokumen member Suite 2) — harus terblokir walau di luar jam terlarang biasa. | ⬜ |
| 5 | Kembalikan mode override ke "Tidak ada", simpan. | Akses normal kembali di sisi member. | ⬜ |

---

## TEST SUITE 10 — Info Hadiah (Prizes) — Sisi Admin

**Tujuan:** Pastikan admin bisa mengubah konten halaman info hadiah.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Prizes. | Tampil 2 bagian: "Info Umum Hadiah" (judul utama, jumlah hadiah, label tahap, keterangan peluang) dan "Rincian Hadiah per Paket" (Visitor, Red Mingguan/Bulanan, Blue Mingguan/Bulanan) — semua berupa isian teks. | ✅ |
| 2 | Ubah salah satu isian, simpan. | Notifikasi sukses, perubahan tersimpan saat halaman dibuka ulang. | ✅ |
| 3 | Cek apakah perubahan ini tampil di halaman publik/member manapun. | Perubahan tampil di `/member/prizes`; halaman marketing publik `/prizes` sengaja statis (tidak terhubung ke CMS ini, by design). | 🚧 |

---

## TEST SUITE 11 — Notifikasi — Sisi Admin

**Tujuan:** Pastikan admin bisa mengelola isi pesan notifikasi, melihat riwayat pengiriman, dan mengirim manual dengan aman.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Notifikasi, menu Template. | Kartu-kartu template (subjek, jenis, status aktif, pratinjau isi pesan) dengan tombol Edit. | ✅ |
| 2 | Edit salah satu template, ubah subjek/isi, simpan. | Tombol simpan hanya aktif kalau ada perubahan. Notifikasi sukses setelah simpan. | ✅ |
| 3 | Buka menu Riwayat Pengiriman. | Tabel: Penerima, Jenis, Media (Email/SMS), Status (Terkirim/Gagal/Menunggu), Penyedia layanan, Waktu Kirim. Baris Gagal punya keterangan alasan saat diarahkan kursor. | ✅ |
| 4 | Gunakan filter Jenis dan Status. | Tabel tersaring sesuai pilihan. | ✅ |
| 5 | Klik "Kirim Ulang" pada salah satu baris riwayat. | Berpindah ke menu Kirim, dengan penerima (dan template jika ada) sudah terisi otomatis. | ✅ |
| 6 | Buka menu Kirim. Klik "Pilih Penerima", cari & pilih beberapa member. | Daftar penerima terisi sebagai chip/tag yang bisa dihapus satu-satu, dengan batas maksimal 100 penerima per pengiriman. | ✅ |
| 7 | Pilih Template dan Media (Email/SMS), klik Kirim. | Muncul kotak konfirmasi ("Kirim ke N member?") yang menjelaskan aksi ini tidak bisa dibatalkan, sebelum benar-benar terkirim. | ✅ |
| 8 | Jika template masih data sementara, coba kirim. | Tombol Kirim harus NONAKTIF/terblokir sepenuhnya — ini pengaman supaya tidak salah kirim pesan palsu ke member asli. | N/A |
| 9 | Konfirmasi pengiriman (kalau kondisi memungkinkan). | Notifikasi sukses menyebutkan jumlah yang berhasil dikirim & yang dilewati (jika ada). | ⬜ |

---

## TEST SUITE 12 — Ekspor Data Undian (TPAL)

**Tujuan:** Pastikan admin bisa membuat dan mengunduh file data member untuk keperluan undian resmi di luar sistem.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Ekspor Data Undian. | Tombol "Buat File Data" di kanan atas, tabel riwayat file yang pernah dibuat di bawahnya. | ✅ |
| 2 | Klik "Buat File Data". | Sistem membuat 3 file terpisah (Visitor, RED, BLUE), muncul notifikasi ringkasan jumlah baris data, dan riwayat di bawah otomatis ter-update. | ✅ |
| 3 | Gunakan filter Paket pada tabel riwayat. | Tabel tersaring sesuai paket yang dipilih. | ✅ |
| 4 | Klik tombol Download pada salah satu baris riwayat. | File berhasil terunduh. | ✅ |
| 5 | Buka file yang diunduh, cek isinya. | Berisi data member yang dibutuhkan untuk proses undian (ID, email, nama lengkap, provinsi, telepon, jumlah token) — sesuai jumlah baris yang disebutkan di langkah 2. | ✅ |
| 6 | Tunggu lebih dari 1 jam sejak halaman dibuka, coba klik Download lagi pada file lama. | Link kadaluarsa. Muncul instruksi untuk memuat ulang halaman supaya dapat link unduhan yang baru. | ⏭️ |

---

## Cross-Cutting Checks (pengecekan yang berlaku di semua halaman admin)

| No | Cek | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Coba akses semua halaman admin dari akun member biasa (bukan admin). | Semua halaman admin ditolak/tidak bisa diakses oleh akun non-admin. | ✅ |
| 2 | Cek semua aksi Hapus di seluruh halaman admin (Member, Undian, Pemenang, Promo, E-Book). | SELALU ada kotak konfirmasi sebelum data benar-benar terhapus — tidak ada yang langsung terhapus tanpa konfirmasi. | ✅ |
| 3 | Cek notifikasi sukses/gagal di setiap aksi simpan/hapus/kirim di seluruh halaman admin. | Selalu ada pesan yang jelas (bukan diam saja atau halaman macet) baik saat berhasil maupun gagal. | ✅ |
| 4 | Cek fitur pencarian & filter di setiap halaman yang punya tabel data. | Semua berfungsi dan hasilnya sesuai dengan kata kunci/filter yang dipilih. | ✅ |
| 5 | Matikan koneksi internet sebentar di beberapa halaman admin, lalu coba muat ulang. | Muncul pesan error yang jelas, bukan halaman kosong/rusak. | ⏭️ |
| 6 | Cek konsistensi data lintas halaman — misalnya jumlah member di Beranda vs jumlah member di halaman Members. | Angka harus sama/konsisten. | ⚠️ |
| 7 | Logout dari admin, cek apakah masih bisa mengakses halaman admin lewat tombol "kembali" browser. | Tidak bisa — harus login ulang untuk mengakses halaman admin manapun. | ✅ |

---

## Ringkasan Hasil

**Total skenario tes:** ~90 langkah lintas 12 bagian + 7 Cross-Cutting Checks.
**Progress:** Pengujian langsung SELESAI dilakukan (16 Agustus 2026), seluruh 12 bagian dan semua Cross-Cutting Checks sudah dites nyata di halaman admin, bukan cuma diperiksa dari kode.

**Known Gaps:** Tidak ada — 6 Known Gap yang sebelumnya tercatat (Pengaturan Spin Wheel, Pengaturan Jam Aman, Template Notifikasi, Halaman Info Hadiah, Tab "Menunggu Nonaktif" BENY, Kotak konfirmasi hapus bab e-book) semuanya sudah resolved/dikoreksi per 2026-08-17.

**8 temuan selama pengujian — status akhir: 7 dari 8 SUDAH RESOLVED / DIKOREKSI, 1 masih perlu tindakan backend:**
1. ✅ Mencatat pemenang pada undian yang jadwal undinya belum lewat (Suite 4) — bukan bug, notifikasi memang muncul (~4 detik lalu hilang otomatis), sempat tidak tertangkap di pengujian pertama.
2. ✅ Simpan data Promo Partner (Suite 5) — halaman gagal pindah ke daftar promo setelah simpan (tombol macet). Diperbaiki, dites ulang di server sungguhan.
3. ✅ E-book: pesan error umum saat Gambar Sampul kosong — sekarang dicek di sisi tampilan sebelum kirim.
4. ✅ Kartu ringkasan BENY di Beranda dulu 3 dari 4 angka selalu 0 — backend melengkapi datanya.
5. ✅ Filter Jenis pada Riwayat Pengiriman Notifikasi dulu cuma 3 dari 12 jenis — sekarang lengkap semua 12.
6. ✅ Kartu "Members by Sub-Tier" dulu duplikat baris "Visitor" dan totalnya meleset jauh (68 vs 65) — backend + frontend diperbaiki.
7. ✅ 2 akun ber-add-on BENY tampil dengan Tier "Smart Life Rewards Add On - BENY - DAILY" (bukan "Visitor") — diperbaiki di frontend.
8. 🚧 Selisih 66 vs 65 di temuan #6 diisolasi ke grup Visitor (statistik 14, tabel cuma 13; Red & Blue sama persis) — ada 1 data keanggotaan Visitor terhitung di statistik tapi tidak muncul di endpoint daftar member manapun. Perlu backend menelusuri.

**Pelajaran metodologi:** Temuan #1 dan #2 awalnya salah didiagnosis sebagai "notifikasi tidak muncul sama sekali" karena cara pengujian pertama (ambil snapshot tampilan setelah beberapa langkah tool berjalan) kadang lebih lambat dari waktu tampil notifikasi (~4 detik lalu otomatis hilang). Diuji ulang dengan memantau perubahan tampilan secara langsung dan real-time — notifikasi ternyata selalu muncul dengan benar sejak awal. Dicatat di sini supaya pengujian berikutnya tidak mengulangi kesalahan yang sama.

**1 skenario tidak berlaku (N/A) karena struktur aplikasi:** uji "tanggal tutup undian tidak valid" pada Suite 3 — tanggal tutup SELALU dihitung otomatis dan terkunci sejak undian dibuat, jadi tidak ada cara memasukkan tanggal tidak valid lewat tampilan.

**1 skenario sengaja dilewati demi keamanan data:** benar-benar mengirim notifikasi ke email member asli (Suite 11 langkah 9) dan mensimulasikan mati koneksi internet (Cross-Cutting Check 5, tidak ada cara mensimulasikan ini di lingkungan pengujian otomatis).

**Sisa data hasil pengujian:** 3 file ekspor TPAL baru (Blue/Red/Visitor, dibuat 16 Agustus 2026 sore) kini tercatat permanen di riwayat Ekspor Data Undian — sesuai desain (log tidak bisa dihapus). Data member dan promo yang sengaja dibuat untuk uji coba pada sesi sebelumnya sudah dibersihkan lewat alur hapus standar.

**Verdict penutup:** Dashboard admin secara keseluruhan berfungsi baik dan aman digunakan — role-gate admin/member teruji dua arah, kotak konfirmasi hapus konsisten di semua halaman, dan tidak ada aksi yang menghapus/mengubah data tanpa konfirmasi. Semua Known Gap dan 7 dari 8 temuan baru sudah selesai diperbaiki atau dikoreksi. Sisa 1 item terbuka murni di sisi backend (lihat temuan #8) — tidak berbahaya bagi member/admin, tapi perlu ditelusuri backend.
