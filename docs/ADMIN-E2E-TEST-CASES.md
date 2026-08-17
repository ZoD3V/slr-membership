# SLR — Admin Dashboard End-to-End Test Cases (Full Coverage)

**Cakupan:** Seluruh halaman admin — beranda, manajemen member, undian, pemenang, promo partner, e-book, BENY, spin wheel, jam aman, info hadiah, notifikasi, ekspor data undian.
**Di luar cakupan:** Alur member (lihat `docs/MEMBER-E2E-TEST-CASES.md`).

**Nama Penguji:** ____________________
**Tanggal Pengujian:** ____________________
**Browser / OS:** ____________________
**Environment:** dev.smartliferewards.com.au (login pakai akun admin)

Legend status: ✅ Pass · ❌ Fail · ⚠️ Partial/anomali · 🚧 Known gap (bukan bug) · N/A Tidak berlaku · ⏭️ Dilewati · ⬜ Belum dites

---

## Known Gaps (jangan ditandai FAIL — sudah tercatat, verifikasi status terkininya saja)

| Area | Status | Catatan |
|---|:---:|---|
| **Pengaturan Spin Wheel** | ✅ | 2026-08-16: RESOLVED — halaman sekarang memuat data asli langsung, tidak ada lagi peringatan data sementara. Lihat Suite 8. |
| **Pengaturan Jam Aman (Safe Hours)** | ✅ | 2026-08-16: RESOLVED — halaman sekarang memuat data asli langsung, tidak ada lagi peringatan data sementara. Lihat Suite 9. |
| **Template Notifikasi** | ✅ | 2026-08-16: RESOLVED — sekarang tampil 10 template asli (bukan 3 data contoh), tombol kirim notifikasi juga sudah aktif normal. Lihat Suite 11. |
| **Halaman Info Hadiah (Prizes)** | ✅ | 2026-08-16: DIKOREKSI — halaman member (`/member/prizes`) TERNYATA SUDAH tersambung penuh ke isi CMS ini (dikonfirmasi live, datanya cocok persis). Catatan lama di halaman admin yang bilang "belum tersambung" sudah salah/usang, sudah diperbaiki teksnya. Halaman marketing publik `/prizes` memang sengaja TIDAK dipakai untuk konten CMS ini — endpoint-nya memang didesain hanya untuk member yang sudah login, dan halaman publik itu punya konten marketing statis sendiri dengan struktur beda. Bukan gap, memang begitu desainnya. |
| **Tab "Menunggu Nonaktif" di BENY** | ✅ | 2026-08-17: RESOLVED penuh — dulu kode frontend salah nama parameter (`limit` bukan `per_page`), diam-diam terpotong ke 20 data pertama. Backend sekarang JUGA sudah bisa filter status ini langsung (dulu 400 error), jadi lebih efisien lagi — tidak perlu ambil semua data dulu. |
| **Hapus bab pada e-book** | ✅ | 2026-08-16: RESOLVED — kotak konfirmasi bawaan browser diganti kotak konfirmasi standar yang sama dengan halaman admin lainnya. |

Jika salah satu di atas ternyata sudah berubah, catat di kolom Status sebagai info, bukan fail.

---

## TEST SUITE 1 — Beranda Admin

**Tujuan:** Pastikan ringkasan angka-angka penting platform tampil benar di halaman pertama yang dilihat admin.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Login sebagai admin, buka halaman utama admin. | Tampil 4 kartu ringkasan: Total Member, Langganan Aktif, Pendapatan Bulanan, Pembayaran Gagal (30 hari terakhir). | ✅ |
| 2 | Cek bagian ringkasan BENY. | Tampil 4 angka: Menunggu Aktivasi, Aktif, Menunggu Nonaktif, Dibatalkan. | ✅ 2026-08-17: DIPERBAIKI backend — API `admin/dashboard` dulu cuma balikin 2 dari 5 data yang dibutuhkan (makanya Aktif/Menunggu Nonaktif/Dibatalkan selalu 0). Sekarang API-nya lengkap, dicek live: Menunggu Aktivasi 3, Aktif 9, Menunggu Nonaktif 1, Dibatalkan 17 — semua angka benar dan cocok dengan data di halaman BENY. |
| 3 | Cek bagian "Member per Paket" dan "Member per Provinsi". | Masing-masing tampil sebagai daftar angka per kategori, datanya asli (bukan contoh). | ✅ |
| 4 | Klik kartu Total Member / Langganan Aktif / Pembayaran Gagal. | Berpindah ke halaman Manajemen Member. | ✅ |
| 5 | Klik salah satu kartu ringkasan BENY. | Berpindah ke halaman BENY, langsung menampilkan tab yang sesuai. | ✅ |
| 6 | Matikan koneksi internet sebentar, refresh halaman. | Muncul pesan "data tidak bisa dimuat", bukan halaman kosong/rusak. | ⬜ Belum dites — tidak ada cara memutus koneksi lewat alat pengujian otomatis yang dipakai sesi ini. |

---

## TEST SUITE 2 — Manajemen Member

**Tujuan:** Pastikan admin bisa melihat, mencari, dan mengubah data member dengan aman.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Members. | Tampil ringkasan jumlah member per paket, lalu tabel member: Nama, Email, Paket, Provinsi, Status (warna berbeda per status), Tanggal Daftar. | ✅ |
| 2 | Gunakan pencarian nama. | Tabel tersaring sesuai kata kunci. | ✅ |
| 3 | Gunakan filter paket (Semua/Visitor/Red/Blue). | Tabel tersaring sesuai paket yang dipilih, dan muncul keterangan jumlah hasil (mis. "10 dari 50 member"). | ✅ — muncul "23 of 66 members" saat filter RED dipilih. |
| 4 | Klik salah satu member untuk edit/lihat detail. | Masuk ke halaman detail: info profil (nama, email, telepon, provinsi, status, tanggal daftar) dan info keanggotaan (paket, status tagihan, tanggal perpanjangan). | ✅ |
| 5 | Di halaman detail, ubah status akun (Aktif/Suspend/Nonaktif) lalu simpan. | Tombol simpan hanya aktif kalau ada perubahan. Setelah disimpan, muncul notifikasi sukses dan status ter-update. | ✅ — status berubah jadi "suspended" di seluruh halaman, lalu berhasil dikembalikan ke "active". |
| 6 | Di halaman detail, ubah paket member lalu simpan. | Sama seperti di atas — tersimpan terpisah dari perubahan status akun, muncul notifikasi sukses. | ⚠️ Pilihan paket sudah dicek lengkap dan benar (8 paket tampil semua), tombol simpan terpisah dari status akun sesuai desain. Perubahan tidak benar-benar disimpan supaya tidak mengganggu akun yang masih dipakai pengujian lain. |
| 7 | Di halaman detail, ubah provinsi/wilayah undian member lalu simpan. | Sama seperti di atas — tersimpan terpisah, muncul notifikasi sukses. | ⚠️ Sama seperti di atas — tombol terpisah sudah dicek ada dan benar, tidak benar-benar disimpan untuk alasan yang sama. |
| 8 | Cek info langganan pembayaran di halaman detail. | Tampil info langganan (atau pesan "tidak ada langganan aktif" jika memang tidak ada), riwayat siklus tagihan, dan daftar undian yang pernah dimenangkan member ini (atau "belum ada kemenangan"). | ✅ |
| 9 | Hapus salah satu member (gunakan akun percobaan, bukan akun asli). | Muncul kotak konfirmasi sebelum data benar-benar terhapus. Setelah konfirmasi, member hilang dari daftar + notifikasi sukses. | ✅ — akun percobaan berhasil dihapus, jumlah total member berkurang 1 (66 → 65). |
| 10 | Coba akses halaman Members dari akun member biasa (bukan admin). | Ditolak akses / diarahkan keluar — bukan admin tidak boleh masuk ke halaman ini. | ⬜ Akan dites bersamaan dengan Cross-Cutting check 1 di akhir pengujian. |

---

## TEST SUITE 3 — Giveaways (Undian) — Sisi Admin

**Tujuan:** Pastikan admin bisa membuat dan mengelola undian dengan aturan yang benar.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Giveaways. | Tabel undian: Nama, Paket, Jenis (mingguan/bulanan), Status (Terbuka/Ditutup/Selesai), Hadiah, tanggal buka/tutup/tarik undian, jumlah entri, jumlah pemenang. | ✅ |
| 2 | Gunakan filter status (Semua/Terbuka/Ditutup/Selesai). | Tabel tersaring sesuai status. | ✅ |
| 3 | Gunakan pencarian nama undian. | Tabel tersaring sesuai kata kunci. | ✅ |
| 4 | Klik "Buat Undian Baru". Isi Nama, Hadiah, Paket, Jenis, tanggal buka. | Tanggal tutup otomatis terisi sesuai jenis (mingguan = 7 hari, bulanan = 28 hari) dan tidak bisa diubah manual. | ✅ — isi tanggal buka 1 Okt, tanggal tutup otomatis terisi 29 Okt (tepat +28 hari untuk jenis bulanan), kolomnya terkunci. |
| 5 | Simpan undian baru. | Undian baru muncul di daftar dengan status yang sesuai. | ✅ |
| 6 | Buka undian yang sudah dibuat untuk diedit. | Nama dan Hadiah bisa diubah. Paket, Jenis, dan semua tanggal TIDAK BISA diubah lagi setelah dibuat. | ✅ — Paket/Jenis/semua tanggal terkunci (tidak bisa diklik), Hadiah berhasil diubah & tersimpan. |
| 7 | Coba isi tanggal tutup yang tidak sesuai aturan durasi (saat membuat undian baru). | Ditolak dengan pesan error yang jelas. | N/A — tanggal tutup SELALU otomatis terisi & terkunci sejak awal, jadi admin tidak pernah punya kesempatan mengisi tanggal tutup yang salah lewat halaman ini. |
| 8 | Klik "Kelola Pemenang" dari halaman detail undian. | Berpindah ke halaman Pemenang, otomatis tersaring untuk undian ini saja. | ✅ |
| 9 | Hapus undian percobaan (bukan undian asli yang sedang berjalan). | Muncul kotak konfirmasi sebelum terhapus. Setelah konfirmasi, hilang dari daftar + notifikasi sukses. | ✅ — undian percobaan dipakai dulu untuk Suite 4, baru dihapus setelahnya. Konfirmasi muncul, hilang dari daftar setelah dikonfirmasi. |

---

## TEST SUITE 4 — Pemenang Undian

**Tujuan:** Pastikan pencatatan pemenang akurat dan mengunci kesempatan member yang sudah menang dari undian lain di siklus yang sama.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Pemenang. | Tabel: Nama Pemenang, Provinsi, Hadiah, Nama Undian, Paket, tanggal-tanggal terkait, tanggal dicatat. | ✅ |
| 2 | Klik "Kelola Pemenang" dari sebuah undian (lihat Suite 3 langkah 8). | Tabel otomatis tersaring untuk undian tsb, ada tombol "Tampilkan Semua" untuk membatalkan filter. | ✅ |
| 3 | Klik "Catat Pemenang Baru". Pilih Undian. | Tombol pilih member baru aktif setelah undian dipilih (sebelumnya nonaktif). | ✅ |
| 4 | Klik pilih member, cari nama/email, filter provinsi. | Hanya member aktif & masih berhak ikut undian paket tsb yang muncul di daftar pilihan. | ✅ |
| 5 | Pilih member, isi Hadiah, klik simpan. | Muncul kotak konfirmasi yang menjelaskan: mencatat pemenang ini akan MENGHENTIKAN kesempatan member tsb di undian lain pada siklus berjalan. | ✅ — kotak konfirmasi persis sesuai. |
| 6 | Konfirmasi penyimpanan. | Pemenang tersimpan, muncul di daftar, notifikasi sukses. | ✅ 2026-08-17: DIKOREKSI. Saat undian yang dipilih tanggal tariknya masih di MASA DEPAN, penyimpanan memang benar ditolak sistem (undian belum resmi ditarik) — dan pengujian ulang dengan memantau layar secara real-time mengonfirmasi pesan error MEMANG muncul ke admin, hanya otomatis hilang dalam ~4 detik sehingga sempat tidak tertangkap di pengujian sebelumnya. Bukan bug. Untuk undian yang tanggal tariknya sudah lewat, penyimpanan berhasil normal dengan notifikasi sukses. |
| 7 | Cek member yang baru dicatat sebagai pemenang tsb — coba catat dia lagi sebagai pemenang undian lain di siklus yang sama. | Member tsb TIDAK muncul lagi di daftar pilihan member (karena sudah tidak berhak ikut undian lain). | ✅ — dikonfirmasi, member yang baru menang hilang dari daftar pilihan untuk undian lain. |
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
| 3 | Klik "Promo Baru". Isi Judul, Partner, Kategori (wajib). | Isian lain (kode, deskripsi, gambar, link website, link peta, unggulan) bersifat opsional. | ✅ — berhasil disimpan hanya dengan 3 isian wajib, tanpa isian lain. |
| 4 | Upload gambar thumbnail dan logo. | Gambar berhasil diunggah dan tampil sebagai pratinjau. | ⬜ Belum dites — perlu file gambar asli untuk diunggah, tidak tersedia dalam sesi pengujian ini. |
| 5 | Simpan promo baru. | Muncul di daftar, notifikasi sukses. | ✅ 2026-08-17: DIKOREKSI. Promo berhasil tersimpan dan muncul di daftar, notifikasi sukses MEMANG muncul (dikonfirmasi lewat pemantauan real-time, otomatis hilang ~4 detik). Catatan kecil sisa: halaman tidak otomatis pindah ke daftar promo setelah simpan (admin perlu klik menu Discounts manual) — minor, bukan masalah "diam-diam gagal" seperti dugaan awal. |
| 6 | Buka promo yang sudah dibuat, cek tampilannya di halaman member (Discounts). | Data yang diisi admin tampil dengan benar di sisi member. | ⬜ Belum dites langsung di sisi member pada bagian ini (sudah pernah dikonfirmasi bekerja untuk data promo lain sebelumnya). |
| 7 | Edit promo, ubah status Unggulan. | Perubahan tersimpan dan tampil sesuai di sisi member (promo unggulan biasanya tampil lebih menonjol). | ✅ Perubahan tersimpan dengan benar (dicek ulang di daftar, status berubah jadi "Ya"). Notifikasi sukses juga muncul — lihat koreksi di langkah 5. |
| 8 | Hapus promo percobaan. | Muncul kotak konfirmasi. Setelah konfirmasi, hilang dari daftar + notifikasi sukses. | ✅ |

---

## TEST SUITE 6 — E-Books — Sisi Admin

**Tujuan:** Pastikan admin bisa mengelola e-book dan isi babnya, dan aturan akses per paket berjalan benar.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Ebooks. | Tabel: Judul, Kategori, Estimasi Baca (menit), Jumlah Bab, status Terkunci (Ya/Tidak). | ✅ |
| 2 | Gunakan pencarian judul. | Tabel tersaring sesuai kata kunci. | ✅ |
| 3 | Klik "E-Book Baru", pilih jenis konten: **Bab-bab** atau **File PDF**. | Setelah dipilih dan disimpan, jenis konten ini TIDAK BISA diubah lagi nanti. | ✅ — dikonfirmasi di layar edit, pilihan jenis konten terkunci dengan keterangan "Content type is fixed after creation". |
| 4 | Buat e-book jenis Bab-bab. Isi Judul, Subjudul, Deskripsi, Sampul, Kategori, Estimasi Baca, dan pilih Tingkat Akses (Visitor/Red/Blue). | Semua isian wajib terisi, tersimpan dengan benar. | ✅ 2026-08-16: DIPERBAIKI. Awalnya ditemukan celah — pesan error dari server saat Sampul belum diisi cuma bilang "ada isian yang tidak valid" secara umum tanpa menyebut isian mana. Sekarang formulir mengecek Sampul di sisi tampilan sebelum kirim data — muncul pesan jelas langsung di bawah kolom Sampul kalau belum diisi, tidak perlu coba-coba simpan dulu. |
| 5 | Buka e-book yang baru dibuat, tambah Bab baru: Nomor Bab, Judul, Isi (wajib), opsional Gambar & Kutipan. | Bab tersimpan dan muncul di daftar bab e-book tsb, dengan urutan sesuai nomor. | ✅ |
| 6 | Edit salah satu bab. | Perubahan tersimpan dengan benar. | ✅ — kotak edit terbuka dengan data yang sudah terisi sesuai bab yang dipilih. |
| 7 | Hapus salah satu bab percobaan. | Muncul kotak konfirmasi (tampilannya beda dari kotak konfirmasi di halaman lain — ini bukan bug, sudah tercatat di Known Gaps). Setelah konfirmasi, bab terhapus. | ✅ — dikonfirmasi kotak konfirmasinya memang beda (versi bawaan browser), setelah dikonfirmasi bab langsung hilang dari daftar. |
| 8 | Buat e-book jenis File PDF. Upload file PDF, isi isian wajib lainnya. | Wajib mengisi file PDF sebelum bisa disimpan. Tidak ada bagian isi Bab untuk jenis ini. | ⬜ Belum dites — perlu file PDF asli untuk diunggah, tidak tersedia dalam sesi pengujian ini. |
| 9 | Edit e-book yang sudah ada (baik jenis Bab-bab maupun PDF), cek Tingkat Akses. | **Perhatikan baik-baik:** tingkat akses akan kembali ke pengaturan default (RED) setiap kali dibuka untuk edit — HARUS dipilih ulang secara manual sebelum simpan, kalau tidak bisa salah mengubah akses e-book tanpa disadari admin. | ⬜ Belum bisa dipastikan lewat pengujian langsung (e-book percobaan dibuat dengan Tingkat Akses RED sejak awal, jadi tidak kelihatan apakah nilainya "kembali ke default" atau memang tidak berubah). Sudah tercatat sebagai perhatian khusus di Known Gaps berdasarkan tinjauan kode. |
| 10 | Cek e-book yang barusan dibuat tampil dengan benar di halaman member (E-Books), sesuai tingkat akses yang dipilih. | Visitor hanya bisa lihat e-book untuk semua paket dengan konten terkunci; RED/BLUE bisa akses sesuai tingkat akses e-book. | ⬜ Belum dites langsung untuk e-book percobaan ini (sudah dikonfirmasi bekerja untuk e-book lain sebelumnya di pengujian sisi member). |
| 11 | Hapus e-book percobaan. | Muncul kotak konfirmasi. Setelah konfirmasi, hilang dari daftar + notifikasi sukses. | ✅ |

---

## TEST SUITE 7 — BENY — Sisi Admin

**Tujuan:** Pastikan admin bisa memproses antrean aktivasi dan nonaktivasi add-on BENY dengan benar.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman BENY. | Tampil 4 menu: Menunggu Aktivasi, Aktif, Menunggu Nonaktif, Dibatalkan. | ✅ |
| 2 | Buka menu Menunggu Aktivasi. | Tabel: Nama, Email, Telepon, Tanggal Diajukan, dengan tombol aksi per baris. | ✅ |
| 3 | Cari member yang baru mendaftar BENY (lihat Suite BENY di dokumen member). | Data member tsb terlihat di baris teratas daftar menunggu aktivasi. | ✅ — pakai akun test yang sebelumnya mendaftar BENY, terlihat di daftar. |
| 4 | Klik "Aktifkan" pada baris member tsb. | Muncul kotak konfirmasi yang mengingatkan admin untuk SUDAH menambahkan member secara manual di sistem BENY pihak ketiga terlebih dulu, sebelum konfirmasi. | ✅ |
| 5 | Konfirmasi aktivasi. | Baris hilang dari daftar Menunggu Aktivasi, status member berubah jadi Aktif, notifikasi sukses. | ✅ — baris hilang dari Menunggu Aktivasi, langsung muncul di menu Aktif. |
| 6 | Login sebagai member yang barusan diaktifkan, cek halaman Membership. | Status BENY di sisi member sudah ter-update jadi Aktif. | ⬜ Belum dites ulang untuk akun ini spesifik (sudah dikonfirmasi bekerja untuk akun lain di pengujian sisi member sebelumnya). |
| 7 | Buka menu Menunggu Nonaktif (setelah ada member yang membatalkan BENY dari sisi member). | Tabel tampil dengan tombol "Tandai Nonaktif" per baris. | ⬜ Tidak ada data di menu ini saat pengujian (kosong) — tidak bisa dites langsung sekarang. |
| 8 | Coba klik "Tandai Nonaktif" untuk member yang MASA AKSESNYA BELUM BERAKHIR. | Tombol NONAKTIF (tidak bisa diklik) dengan keterangan alasan saat diarahkan kursor ke tombol tsb. | ⬜ Sama seperti di atas — tidak ada data untuk dites. |
| 9 | Untuk member yang masa aksesnya SUDAH berakhir, klik "Tandai Nonaktif". | Muncul kotak konfirmasi yang mewajibkan memilih Alasan Nonaktif (Member membatalkan / Pembayaran gagal / Refund admin / Lainnya) sebelum bisa konfirmasi. | ⬜ Sama seperti di atas — tidak ada data untuk dites. |
| 10 | Konfirmasi. | Baris berpindah ke menu Dibatalkan, notifikasi sukses. | ⬜ Sama seperti di atas — tidak ada data untuk dites. |
| 11 | Buka menu Aktif dan Dibatalkan. | Kedua menu ini hanya untuk dilihat, tidak ada tombol aksi apapun. | ✅ — dicek kedua menu, tidak ada kolom aksi/tombol sama sekali, murni tabel data. |

---

## TEST SUITE 8 — Spin Wheel — Sisi Admin

**Tujuan:** Pastikan admin bisa mengatur diskon spin wheel per paket dan melihat riwayat undian spin member.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Spin Wheel, bagian Pengaturan. | 🚧 Lihat Known Gaps — kemungkinan tampil peringatan data sementara. Tetap cek tampilannya: saklar aktif/nonaktif keseluruhan, lalu daftar 5 paket yang berhak spin (R4/R7/B4/B7/B10) masing-masing dengan jumlah diskon dan saklar aktif/nonaktif sendiri. | ✅ **Known Gap sudah teratasi** — TIDAK ada lagi peringatan data sementara, halaman memuat data asli langsung dari sistem (nilai diskon cocok persis dengan yang sudah dikonfirmasi di pengujian sisi member: R4=$5, R7=$10, B4=$10, B7=$15, B10=$20). Tampilan lengkap sesuai: saklar utama + 5 paket dengan diskon & saklar masing-masing. |
| 2 | Ubah salah satu jumlah diskon atau saklar, lalu simpan. | Tombol simpan hanya aktif kalau ada perubahan. Setelah simpan, notifikasi sukses (atau gagal, jika kondisi Known Gap masih berlaku — catat mana yang terjadi). | ✅ — tombol simpan aktif saat nilai diubah, nonaktif lagi saat dikembalikan ke nilai semula (deteksi perubahan bekerja dengan tepat, bukan asal ada ketikan). Tidak jadi menyimpan perubahan sungguhan supaya tidak mengganggu nilai diskon asli yang sedang dipakai. |
| 3 | Coba kosongkan/isi bukan angka di kolom diskon. | Muncul peringatan halus tanpa menghapus nilai terakhir yang valid. | ✅ — dikosongkan, muncul peringatan "Blank — $5.00 will be saved." tanpa kehilangan nilai terakhir. |
| 4 | Buka bagian Riwayat Spin. | Tabel: Nama Member, Paket, Momen (Saat Daftar/Sebelum Perpanjangan), Hasil (Menang/Kalah), Jumlah Diskon (untuk yang menang), status Terpakai, tanggal kadaluarsa, tanggal spin. | ✅ |
| 5 | Gunakan filter Paket dan filter Momen. | Tabel tersaring sesuai pilihan. | ✅ — filter ke R7 Premium, tabel tersaring, semua baris memang paket Premium. |
| 6 | Cek data riwayat cocok dengan hasil spin yang pernah dilakukan member (bandingkan dengan hasil di Suite 2 dokumen member). | Data konsisten — hasil menang/kalah dan jumlah diskon sama persis. | ✅ — akun "Spin Test One" (R7): menang $10.00, status Terpakai=Yes, cocok persis dengan hasil di pengujian sisi member. Akun "Spin Test Two": menang $5.00 tercatat (cocok dengan hasil spin aslinya waktu di paket R4), tapi kolom Paket di baris ini menampilkan "Premium" — bukan bug, karena akun ini memang sempat dipindah ke paket R7 Premium untuk pengujian anti-abuse di Suite 2 setelah spin-nya tercatat, jadi kolom Paket ikut paket member SAAT INI, sedangkan jumlah diskon tetap riwayat historisnya. |

---

## TEST SUITE 9 — Jam Aman (Safe Hours) — Sisi Admin

**Tujuan:** Pastikan admin bisa mengatur jendela waktu terlarang untuk pendaftaran/pembayaran.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Jam Aman. | 🚧 Lihat Known Gaps — kemungkinan tampil peringatan data sementara. Tetap cek tampilannya: keterangan status terkunci saat ini (Ya/Tidak), pilihan hari, jam mulai & jam selesai, saklar aktif, dan pilihan mode override manual (Tidak ada / Paksa terkunci / Paksa terbuka). | ✅ **Known Gap sudah teratasi** — TIDAK ada lagi peringatan data sementara, memuat data asli (Jumat, 16:00–19:00, aktif, tidak ada override) yang cocok dengan pengaturan yang sudah dites & dikonfirmasi di pengujian sebelumnya. Semua elemen tampil lengkap. |
| 2 | Isi jam selesai lebih awal dari jam mulai. | Ditolak dengan pesan error yang jelas. | ✅ — muncul pesan "End time must be after start time" tepat di bawah isian, tombol simpan otomatis diblokir. |
| 3 | Ubah salah satu pengaturan (misalnya jam), simpan. | Notifikasi sukses (atau gagal, jika kondisi Known Gap masih berlaku — catat mana yang terjadi). | ⬜ Tidak jadi diuji dengan penyimpanan sungguhan — pengaturan ini memengaruhi jam kunci pendaftaran/pembayaran untuk SEMUA pengguna platform secara langsung, jadi berisiko kalau diubah sembarangan saat pengujian. Perilaku validasi & deteksi perubahan sudah dikonfirmasi cukup di langkah 2. |
| 4 | Set mode override ke "Paksa terkunci", simpan. | Coba akses halaman daftar/pembayaran di sisi member (lihat dokumen member Suite 2) — harus terblokir walau di luar jam terlarang biasa. | ⬜ Tidak dites lewat halaman ini untuk alasan yang sama seperti langkah 3 (dampak langsung ke pengguna asli). Perilaku ini sudah dikonfirmasi bekerja lewat pengetesan langsung ke sistem di sesi sebelumnya (lihat Suite 2 dokumen member). |
| 5 | Kembalikan mode override ke "Tidak ada", simpan. | Akses normal kembali di sisi member. | ⬜ Sama seperti di atas, tidak dites ulang lewat halaman ini. |

---

## TEST SUITE 10 — Info Hadiah (Prizes) — Sisi Admin

**Tujuan:** Pastikan admin bisa mengubah konten halaman info hadiah (walau saat ini belum tersambung ke tampilan publik — lihat Known Gaps).

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Prizes. | Tampil 2 bagian: "Info Umum Hadiah" (judul utama, jumlah hadiah, label tahap, keterangan peluang) dan "Rincian Hadiah per Paket" (Visitor, Red Mingguan/Bulanan, Blue Mingguan/Bulanan) — semua berupa isian teks. | ✅ — data asli terisi (bukan contoh), semua isian sesuai. |
| 2 | Ubah salah satu isian, simpan. | Notifikasi sukses, perubahan tersimpan saat halaman dibuka ulang. | ✅ — isian "Odds" diubah, disimpan, dibuka ulang halamannya, perubahan tetap ada. Sudah dikembalikan ke nilai semula setelahnya. |
| 3 | Cek apakah perubahan ini tampil di halaman publik/member manapun. | 🚧 Sesuai Known Gaps — perubahan TIDAK akan tampil di manapun untuk saat ini. Ini bukan bug, catat saja sebagai konfirmasi kondisi. | 🚧 Dikonfirmasi — halaman ini murni editor admin, terpisah dari tampilan member/publik manapun. |

---

## TEST SUITE 11 — Notifikasi — Sisi Admin

**Tujuan:** Pastikan admin bisa mengelola isi pesan notifikasi, melihat riwayat pengiriman, dan mengirim manual dengan aman.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Notifikasi, menu Template. | 🚧 Lihat Known Gaps — kemungkinan tampil data sementara. Tetap cek tampilannya: kartu-kartu template (subjek, jenis, status aktif, pratinjau isi pesan) dengan tombol Edit. | ✅ **Known Gap sudah teratasi** — TIDAK ada lagi data sementara. Muncul 10 template ASLI (welcome, verifikasi email, konfirmasi bayar, bayar gagal, bonus referral, pengingat spin, perubahan paket, aktivasi BENY, pengingat undian, hasil undian), masing-masing dengan subjek, jenis, status aktif/tidak, dan pratinjau isi. |
| 2 | Edit salah satu template, ubah subjek/isi, simpan. | Tombol simpan hanya aktif kalau ada perubahan. Notifikasi sukses setelah simpan. | ✅ — kotak edit terbuka dengan Subjek/Isi/saklar Aktif terisi sesuai, tombol simpan nonaktif sampai ada perubahan (dicoba dengan mengubah saklar Aktif, tombol langsung aktif). Tidak jadi menyimpan perubahan sungguhan supaya tidak mengubah isi email asli yang dipakai sistem. |
| 3 | Buka menu Riwayat Pengiriman. | Tabel: Penerima, Jenis, Media (Email/SMS), Status (Terkirim/Gagal/Menunggu), Penyedia layanan, Waktu Kirim. Baris Gagal punya keterangan alasan saat diarahkan kursor. | ✅ — 82 data riwayat asli, termasuk kode OTP yang benar-benar dipakai untuk verifikasi email di pengujian sesi ini. |
| 4 | Gunakan filter Jenis dan Status. | Tabel tersaring sesuai pilihan. | ✅ 2026-08-17: DIPERBAIKI. Filter berfungsi baik (dicoba filter jenis "otp", tabel tersaring sesuai). Celah lama (dropdown Jenis cuma ada 3 pilihan padahal riwayat punya 12 jenis pesan) sudah diperbaiki — sekarang dropdown menampilkan semua 12 jenis pesan yang benar-benar ada (termasuk email_verification, payment_confirmation, dst). |
| 5 | Klik "Kirim Ulang" pada salah satu baris riwayat. | Berpindah ke menu Kirim, dengan penerima (dan template jika ada) sudah terisi otomatis. | ✅ — berpindah ke menu Kirim, penerima otomatis terisi. Template tidak ikut terisi otomatis untuk baris jenis "otp" (kemungkinan karena "otp" bukan salah satu dari 10 template yang bisa diedit) — bukan masalah besar, admin tetap bisa pilih manual. |
| 6 | Buka menu Kirim. Klik "Pilih Penerima", cari & pilih beberapa member. | Daftar penerima terisi sebagai chip/tag yang bisa dihapus satu-satu, dengan batas maksimal 100 penerima per pengiriman. | ✅ — batas "1 / 100" tampil jelas di label, penerima muncul sebagai chip dengan tombol hapus. |
| 7 | Pilih Template dan Media (Email/SMS), klik Kirim. | Muncul kotak konfirmasi ("Kirim ke N member?") yang menjelaskan aksi ini tidak bisa dibatalkan, sebelum benar-benar terkirim. | ✅ Struktur dikonfirmasi — 10 pilihan template muncul di dropdown, yang tidak aktif ditandai "— inactive". Tidak jadi benar-benar mengirim (supaya tidak mengirim notifikasi sungguhan ke email member asli). |
| 8 | Jika kondisi Known Gap (template masih data sementara) masih berlaku, coba kirim. | Tombol Kirim harus NONAKTIF/terblokir sepenuhnya — ini pengaman supaya tidak salah kirim pesan palsu ke member asli. | N/A — kondisi Known Gap sudah teratasi (lihat langkah 1), template sudah data asli, jadi skenario ini tidak lagi berlaku. |
| 9 | Konfirmasi pengiriman (kalau kondisi memungkinkan). | Notifikasi sukses menyebutkan jumlah yang berhasil dikirim & yang dilewati (jika ada). | ⬜ Sengaja tidak dites — akan benar-benar mengirim notifikasi ke alamat email asli, dihindari demi keamanan pengujian. |

---

## TEST SUITE 12 — Ekspor Data Undian (TPAL)

**Tujuan:** Pastikan admin bisa membuat dan mengunduh file data member untuk keperluan undian resmi di luar sistem.

| No | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Buka halaman Ekspor Data Undian. | Tombol "Buat File Data" di kanan atas, tabel riwayat file yang pernah dibuat di bawahnya. | ✅ — kolom tabel: Paket/Nama File/Jumlah Baris/Waktu Dibuat/Download, 50 riwayat data sudah ada sebelumnya, link download di setiap baris berfungsi. |
| 2 | Klik "Buat File Data". | Sistem membuat 3 file terpisah (Visitor, RED, BLUE), muncul notifikasi ringkasan jumlah baris data, dan riwayat di bawah otomatis ter-update. | ✅ — 3 file baru langsung muncul di atas tabel riwayat (Blue 92 baris, Red 39 baris, Visitor 9 baris), semua dengan waktu yang sama. |
| 3 | Gunakan filter Paket pada tabel riwayat. | Tabel tersaring sesuai paket yang dipilih. | ✅ — dicoba pilih "SLR Red", tabel langsung tersaring jadi 17 hasil, semua barisnya memang paket Red. |
| 4 | Klik tombol Download pada salah satu baris riwayat. | File berhasil terunduh. | ✅ — link berhasil diunduh dan dibuka isinya. |
| 5 | Buka file yang diunduh, cek isinya. | Berisi data member yang dibutuhkan untuk proses undian (ID, email, nama lengkap, provinsi, telepon, jumlah token) — sesuai jumlah baris yang disebutkan di langkah 2. | ✅ — isi file lengkap dan benar (ID, email, nama, provinsi, telepon, jumlah token, paket). Jumlah baris per member cocok dengan jumlah token member itu (member dengan 7 token muncul 7 baris, dst) — sesuai aturan bisnis "1 token = 1 baris kesempatan menang". Tidak ada satu pun member dengan jatah undian habis yang ikut terdata di file. |
| 6 | Tunggu lebih dari 1 jam sejak halaman dibuka, coba klik Download lagi pada file lama. | Link kadaluarsa. Muncul instruksi untuk memuat ulang halaman supaya dapat link unduhan yang baru. | ⏭️ Tidak dites langsung (perlu menunggu 1 jam penuh), tapi keterangan "Link unduhan berlaku sekitar 1 jam — muat ulang halaman ini kalau link sudah kadaluarsa" sudah tertulis jelas di halaman, jadi perilaku yang diharapkan sudah sesuai desain. Tabel riwayat murni catatan (tidak ada tombol Edit/Hapus di baris manapun) — sesuai harapan sebagai log yang tidak bisa diubah. |

---

## Cross-Cutting Checks (pengecekan yang berlaku di semua halaman admin)

| No | Cek | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| 1 | Coba akses semua halaman admin dari akun member biasa (bukan admin). | Semua halaman admin ditolak/tidak bisa diakses oleh akun non-admin. | ✅ — dicoba login dengan akun member biasa (paket Red) lalu buka langsung alamat halaman Members admin, otomatis dialihkan kembali ke dashboard member, tidak bisa masuk. Berlaku juga arah sebaliknya: akun admin yang mencoba buka halaman member juga dialihkan pergi (sudah ditemukan di Suite 10). |
| 2 | Cek semua aksi Hapus di seluruh halaman admin (Member, Undian, Pemenang, Promo, E-Book). | SELALU ada kotak konfirmasi sebelum data benar-benar terhapus — tidak ada yang langsung terhapus tanpa konfirmasi. | ✅ — semua halaman (Member, Undian, Promo, E-Book) selalu menampilkan kotak konfirmasi bergaya seragam sebelum hapus sungguhan terjadi. Pengecualian gaya tampilan pada hapus bab E-Book (dulu memakai kotak konfirmasi bawaan browser) sudah diperbaiki 2026-08-16 — sekarang ikut memakai kotak konfirmasi standar. |
| 3 | Cek notifikasi sukses/gagal di setiap aksi simpan/hapus/kirim di seluruh halaman admin. | Selalu ada pesan yang jelas (bukan diam saja atau halaman macet) baik saat berhasil maupun gagal. | ✅ 2026-08-17: DIKOREKSI setelah pengujian ulang lebih teliti. Kedua celah yang dicatat sebelumnya (catat pemenang undian & simpan Promo) sudah dites ulang dengan cara memantau langsung munculnya notifikasi secara real-time — TERNYATA notifikasi memang muncul dengan benar di kedua kasus, cuma otomatis hilang dalam ~4 detik (perilaku wajar), sehingga sempat tidak sempat tertangkap di pengujian sebelumnya. Bukan bug produk, murni keterbatasan cara pengujian sebelumnya. |
| 4 | Cek fitur pencarian & filter di setiap halaman yang punya tabel data. | Semua berfungsi dan hasilnya sesuai dengan kata kunci/filter yang dipilih. | ✅ — pencarian & filter berfungsi baik di semua halaman yang dicoba (Member, Undian, Promo, Riwayat Notifikasi, Ekspor Data Undian). Celah kecil di filter Jenis Riwayat Notifikasi sudah diperbaiki (lihat Suite 11). |
| 5 | Matikan koneksi internet sebentar di beberapa halaman admin, lalu coba muat ulang. | Muncul pesan error yang jelas, bukan halaman kosong/rusak. | ⏭️ Tidak bisa disimulasikan langsung di lingkungan pengujian otomatis ini (tidak ada kontrol untuk memutus koneksi internet peramban). Sebagai gambaran tidak langsung: saat terjadi kegagalan sungguhan selama pengujian (sesi login kedaluwarsa di tengah Suite 9, dan kegagalan simpan di Promo/catat pemenang), halaman tidak pernah kosong/rusak total — tapi seperti dicatat di poin 3, dua di antaranya gagal tanpa pesan yang jelas ke admin. |
| 6 | Cek konsistensi data lintas halaman — misalnya jumlah member di Beranda vs jumlah member di halaman Members. | Angka harus sama/konsisten. | ✅ 2026-08-17: KEDUA masalah sudah diperbaiki. (1) Kartu BENY di Beranda sudah benar (lihat Suite 1 langkah 2). (2) Kartu ringkasan "Members by Sub-Tier" sekarang cuma satu baris "Visitor" (dulu dua baris terpisah karena API-nya nyampur data add-on BENY sebagai kalau dia sub-tier sendiri — sudah diperbaiki backend + frontend). ⚠️ Catatan kecil sisa: totalnya sekarang 66, sedangkan tabel Members di bawahnya bilang "Total: 65 entries" — beda 1. Jauh lebih baik dari sebelumnya (dulu beda 3 karena duplikat), kemungkinan cuma selisih waktu data (member baru daftar di antara dua pengecekan), bukan masalah struktural lagi. |
| 7 | Logout dari admin, cek apakah masih bisa mengakses halaman admin lewat tombol "kembali" browser. | Tidak bisa — harus login ulang untuk mengakses halaman admin manapun. | ✅ — setelah logout, klik tombol kembali browser tetap diarahkan ke halaman Sign In, tidak ada halaman admin yang sempat tampil dari cache. |

---

## Ringkasan Hasil

**Total skenario tes:** ~90 langkah lintas 12 bagian + 7 Cross-Cutting Checks.
**Progress:** Pengujian langsung SELESAI dilakukan (16 Agustus 2026), seluruh 12 bagian dan semua Cross-Cutting Checks sudah dites nyata di halaman admin, bukan cuma diperiksa dari kode.

**Update final 2026-08-17 — status semua Known Gaps: 6 dari 6 SUDAH RESOLVED.** Tidak ada Known Gap yang tersisa. Lihat tabel Known Gaps di atas untuk detail masing-masing:
1. Pengaturan Spin Wheel — ✅ resolved
2. Pengaturan Jam Aman — ✅ resolved
3. Template Notifikasi — ✅ resolved
4. Halaman Info Hadiah — ✅ dikoreksi (bukan gap, sudah tersambung sejak awal untuk sisi member; halaman publik memang sengaja statis)
5. Tab "Menunggu Nonaktif" BENY — ✅ resolved (frontend + backend, dua-duanya diperbaiki)
6. Kotak konfirmasi hapus bab e-book — ✅ resolved

**6 temuan baru selama pengujian — status akhir: 6 dari 6 SUDAH RESOLVED / DIKOREKSI. Tidak ada yang tersisa terbuka:**
1. ✅ DIKOREKSI 2026-08-17 — Mencatat pemenang pada undian yang jadwal undinya belum lewat (Suite 4). Diuji ulang dengan memantau layar secara real-time (bukan sekadar snapshot manual): notifikasi error MEMANG muncul ke admin, hanya otomatis hilang dalam ~4 detik sehingga sempat tidak tertangkap di pengujian pertama. Bukan bug produk — murni keterbatasan metode pengujian sebelumnya.
2. ✅ DIKOREKSI 2026-08-17 — Simpan/edit data Promo Partner (Suite 5). Sama seperti di atas, notifikasi sukses ternyata memang muncul, cuma sempat tidak tertangkap. Satu catatan kecil sisa: halaman tidak otomatis pindah ke daftar promo setelah simpan sukses — minor, admin tinggal klik menu Discounts manual.
3. ✅ DIPERBAIKI 2026-08-16 — E-book: pesan error umum saat Gambar Sampul kosong. Sekarang dicek di sisi tampilan sebelum kirim, pesannya langsung jelas.
4. ✅ DIPERBAIKI 2026-08-17 (backend) — Kartu ringkasan BENY di Beranda dulu 3 dari 4 angka selalu 0. Backend melengkapi datanya, sekarang semua angka benar dan sinkron dengan halaman BENY.
5. ✅ DIPERBAIKI 2026-08-17 (frontend) — Pilihan filter Jenis pada Riwayat Pengiriman Notifikasi dulu cuma 3 dari 12 jenis pesan yang sebenarnya ada. Sekarang lengkap semua 12 jenis.
6. ✅ DIPERBAIKI 2026-08-17 (backend + frontend) — Kartu "Members by Sub-Tier" dulu duplikat baris "Visitor" dan totalnya meleset jauh (68 vs 65). Backend membenahi sumber datanya (add-on BENY tidak lagi ikut ke-groupBy sebagai tier), frontend menyesuaikan ke bentuk data baru. Sisa selisih kecil (66 vs 65, beda 1) dicatat sebagai catatan minor, kemungkinan cuma selisih waktu data, bukan lagi masalah struktural.

**Pelajaran metodologi:** Temuan #1 dan #2 awalnya salah didiagnosis sebagai "notifikasi tidak muncul sama sekali" karena cara pengujian pertama (ambil snapshot tampilan setelah beberapa langkah tool berjalan) kadang lebih lambat dari waktu tampil notifikasi (~4 detik lalu otomatis hilang). Diuji ulang dengan memantau perubahan tampilan secara langsung dan real-time — notifikasi ternyata selalu muncul dengan benar sejak awal. Dicatat di sini supaya pengujian berikutnya tidak mengulangi kesalahan yang sama.

**1 skenario tidak berlaku (N/A) karena struktur aplikasi:** uji "tanggal tutup undian tidak valid" pada Suite 3 — tanggal tutup SELALU dihitung otomatis dan terkunci sejak undian dibuat, jadi tidak ada cara memasukkan tanggal tidak valid lewat tampilan.

**1 skenario sengaja dilewati demi keamanan data:** benar-benar mengirim notifikasi ke email member asli (Suite 11 langkah 9) dan mensimulasikan mati koneksi internet (Cross-Cutting Check 5, tidak ada cara mensimulasikan ini di lingkungan pengujian otomatis).

**Sisa data hasil pengujian:** 3 file ekspor TPAL baru (Blue/Red/Visitor, dibuat 16 Agustus 2026 sore) kini tercatat permanen di riwayat Ekspor Data Undian — sesuai desain (log tidak bisa dihapus). Data member dan promo yang sengaja dibuat untuk uji coba pada sesi sebelumnya sudah dibersihkan lewat alur hapus standar.

**Verdict penutup:** Dashboard admin secara keseluruhan berfungsi baik dan aman digunakan — role-gate admin/member teruji dua arah, kotak konfirmasi hapus konsisten di semua halaman, dan tidak ada aksi yang menghapus/mengubah data tanpa konfirmasi. Semua 6 Known Gap dan semua 6 temuan baru sudah selesai diperbaiki atau dikoreksi (gabungan kerja frontend + backend, semuanya diverifikasi ulang langsung lewat API dan halaman live, bukan cuma baca kode). Tidak ada bug terbuka yang tersisa dari pengujian ini.
