# Spesifikasi Desain: Website WiraWiri Feeder Suroboyo

Tanggal: 22 November 2026 · Status: menunggu review

## 1. Tujuan

Mengubah desain Figma WiraWiri (7 halaman + 4 tampilan turunan) menjadi website yang berjalan dan di-hosting, sebagai bagian portofolio yang menunjukkan tiga hal sekaligus: UI/UX, decision making (SAW), dan kemampuan frontend serta backend.

**Pengguna website:** rekruter, dosen, atau reviewer portofolio yang membuka link, masuk dengan akun demo, dan mencoba alur kerja dalam beberapa menit.

**Kriteria sukses:**

1. Link live bisa langsung dicoba tanpa instalasi. Halaman login menampilkan akun demo untuk ketiga peran.
2. Tampilan pada lebar 1280 px setara dengan desain Figma (warna, tipografi, tata letak, teks).
3. SAW dihitung backend dari data di database. Dengan data awal, hasilnya identik dengan laporan: V(A4) = 0,9667, skor 97/87/75/70/46, dan Tabel IX untuk sensitivitas. Kesamaan ini dijaga oleh uji otomatis.
4. Mengubah bobot, batas kategori, atau data koridor langsung mengubah rekomendasi.
5. Alur laporan berjalan dari ujung ke ujung: buat, ajukan, sahkan oleh Kepala Bidang, arsipkan, unduh PDF.
6. Kode di folder `web/` rapi, teruji, dan bisa dijelaskan saat interview.

## 2. Keputusan yang sudah disepakati

| Topik | Keputusan |
|---|---|
| Stack | Next.js (App Router) + TypeScript, Postgres di Supabase, hosting Vercel |
| Arsitektur | Pendekatan A: satu aplikasi Next.js dengan lapisan backend yang tegas (REST API → service → database) |
| Fitur yang berfungsi | Login + 3 peran, SAW live, kelola data koridor (CRUD + impor CSV), alur laporan sampai PDF |
| Data demo | Data bersama untuk semua pengunjung, direset ke kondisi awal setiap hari pukul 00.00 WIB |
| Lokasi kode | Folder `web/` di repo `UIUX-of-Wirawiri-Decision-Making-` |

## 3. Di luar lingkup

- Tampilan seluler. Sesuai laporan, desain hanya untuk desktop. Di layar di bawah 1024 px muncul pemberitahuan, dan pengunjung tetap bisa melanjutkan dengan scroll horizontal.
- Integrasi data nyata (GPS, tiket elektronik, WargaKu). Tombol "Sinkron Sekarang" hanya mensimulasikan sinkronisasi.
- Pengiriman email dan SMS. Tombol "Kirim Email" dinonaktifkan dengan keterangan "Tidak tersedia di demo". Preferensi notifikasi tetap disimpan, dan hanya kanal Dashboard (ikon lonceng) yang aktif.
- Reset kata sandi dan manajemen pengguna. "Lupa kata sandi?" dan "Hubungi Admin Dishub" membuka dialog informasi.
- Peta geografis sungguhan. Peta Rute memakai peta skematis seperti di desain.

## 4. Arsitektur

```
Browser ──► Next.js di Vercel
            ├─ Halaman (React Server Components + komponen klien)
            ├─ REST API  /api/v1/*   validasi zod · cek sesi & peran · format error seragam
            ├─ Services  src/server/services/*   logika bisnis, transaksi, audit log
            ├─ Domain    src/domain/*   fungsi murni tanpa I/O: SAW, kategori, dampak, sensitivitas, parser KML & CSV
            └─ Data      Drizzle ORM ──► Postgres (Supabase; Docker saat pengembangan lokal)
Vercel Cron (1×/hari) ──► /api/cron/reset ──► hapus data dan isi ulang seed dalam satu transaksi
```

Aturan antarlapisan:

- Halaman server membaca data lewat service secara langsung, tanpa memanggil HTTP ke dirinya sendiri.
- Semua perubahan data dari browser lewat REST API, tidak lewat Server Actions, supaya backend terlihat jelas dan bisa diuji lewat HTTP.
- Domain tidak tahu apa pun soal database atau HTTP. Lapisan ini paling banyak diuji.

Pustaka utama:

| Kebutuhan | Pustaka |
|---|---|
| Tampilan | Tailwind CSS, `next/font` (Poppins), lucide-react (ikon di desain) |
| Grafik | SVG buatan sendiri (garis tren dan bar sederhana), tanpa pustaka grafik |
| Validasi | zod, dipakai bersama di klien dan server |
| Database | drizzle-orm, drizzle-kit (migrasi), postgres-js |
| Autentikasi | bcryptjs (hash kata sandi), jose (JWT di cookie httpOnly) |
| Dokumen | @react-pdf/renderer (PDF), exceljs (XLSX) |
| Pengujian | Vitest, Playwright |

Struktur folder:

```
web/
├── src/app/(auth)/login/            halaman login
├── src/app/(app)/                   layout sidebar + header, lalu tiap halaman
│   ├── dashboard/  peta-rute/  data-koridor/  data-koridor/unit/
│   ├── rekomendasi/  laporan/  laporan/arsip/  pengaturan/
├── src/app/api/v1/                  route handler REST
├── src/app/api/cron/reset/          reset harian
├── src/server/{db,auth,services}/   skema, migrasi, seed, sesi, service
├── src/domain/{saw,kml,csv}/        logika murni
├── src/components/{ui,charts,layout}/
├── src/documents/                   template PDF dan XLSX
├── tests/{unit,integration}/  e2e/
├── docker-compose.yml  .env.example  README.md
```

## 5. Peran dan hak akses

| Aksi | Transport Planner | Kepala Bidang | Admin Depo |
|---|:-:|:-:|:-:|
| Melihat semua halaman | ✓ | ✓ | ✓ |
| Tambah, ubah, hapus koridor; impor CSV | ✓ | | |
| Ubah status unit armada | | | ✓ |
| Ubah Pengaturan (bobot, SPM, kategori) | ✓ | | |
| Sinkron sekarang | ✓ | | |
| Setujui rekomendasi & buat laporan | ✓ | | |
| Sahkan atau kembalikan laporan | | ✓ | |
| Unduh dan cetak dokumen | ✓ | ✓ | ✓ |

Tombol aksi yang tidak diizinkan tetap terlihat tapi nonaktif, dengan tooltip yang menyebut peran yang berwenang. Dengan begitu pengunjung paham perbedaan peran. API tetap menolak dengan 403 walaupun tombol dilewati.

Akun demo, ditampilkan di halaman login sebagai tiga pilihan cepat:

| Peran | Nama (fiktif, dari desain) | Email |
|---|---|---|
| Transport Planner | Bambang Irawan, S.T. | bambang.irawan@dishub.surabaya.go.id |
| Kepala Bidang Angkutan | Ir. H. Arif Sunaryo, M.T. | arif.sunaryo@dishub.surabaya.go.id |
| Admin Depo | Siti Rahmawati | siti.rahmawati@dishub.surabaya.go.id |

Kata sandi ketiganya `wirawiri-demo`, dan login bisa memakai email atau NIP.

Pengesahan dilakukan oleh **Kepala Bidang Angkutan**, sesuai kolom tanda tangan di desain. Subjudul halaman Laporan yang menyebut "Kepala Dinas" diubah menjadi "Kepala Bidang" di website, dan hal yang sama perlu diperbaiki di Figma.

## 6. Autentikasi dan keamanan

- Kata sandi di-hash dengan bcrypt. Sesi berupa JWT (HS256, `SESSION_SECRET`) di cookie `httpOnly`, `secure`, `sameSite=lax`. Masa berlaku 8 jam, atau 30 hari jika "Ingat saya" dicentang.
- Middleware mengalihkan pengunjung tanpa sesi ke `/login`. Setiap endpoint memanggil `requireRole(...)`.
- Login gagal 5 kali dalam 15 menit untuk email atau NIP yang sama akan diblokir sementara. Percobaan disimpan di tabel `login_attempts`.
- Endpoint cron hanya menerima header `Authorization: Bearer ${CRON_SECRET}`.
- Batas input untuk demo publik: paling banyak 10 koridor, teks maksimal 80 karakter, CSV maksimal 200 KB dan 100 baris, KML maksimal 1 MB.

## 7. Model data

| Tabel | Isi utama |
|---|---|
| `users` | nama, gelar/jabatan, email, NIP, hash kata sandi, peran, preferensi notifikasi (JSON) |
| `login_attempts` | identitas, berhasil/gagal, waktu |
| `corridors` | kode (A1…), titik awal, titik akhir, kelompok, panjang (km), jumlah halte, depo, tanggal mulai, jam operasional, moda transit terhubung (daftar), nama berkas jalur |
| `buses` | kode unit (FD-04-07), koridor, status (beroperasi/perawatan/cadangan), keterangan, tanggal kembali, posisi pada rute (0–1) |
| `corridor_metrics` | koridor × periode (bulan): penumpang/hari, kepadatan %, waktu tunggu, keluhan/bulan, ketepatan waktu %, jumlah unit pada periode itu |
| `daily_ridership` | tanggal, total penumpang (untuk grafik tren 8 minggu) |
| `criteria` | C1–C6: nama, deskripsi, satuan, jenis benefit/cost, bobot aktif |
| `settings` | satu baris: target tunggu, ketepatan minimal, kepadatan ideal & kritis, jam sibuk, tambahan armada maksimal, batas kategori, rentang usulan per kategori, jam hitung ulang, pengubah terakhir |
| `allocations` | koridor × periode: jumlah unit usulan (masukan analis) |
| `reports` | nomor, judul, jenis, periode, status, snapshot (JSON), format tersedia, pembuat, pengesah, waktu, catatan pengembalian |
| `operational_events` | peringatan operasional per hari (seed + otomatis saat unit masuk perawatan) |
| `complaint_categories` | periode × kategori keluhan (armada penuh, menunggu terlalu lama, ...) |
| `stops`, `route_geometry`, `busiest_stops` | data peta skematis: halte/hub dengan koordinat, garis rute, halte tersibuk jam sibuk |
| `data_sources` | GPS, tiket elektronik, WargaKu, data trayek: status dan waktu sinkron terakhir |
| `audit_log` | pelaku, aksi, entitas, pesan, waktu (ditampilkan sebagai "Riwayat Perubahan Data") |

Nilai C5 (armada per km) dihitung dari `jumlah unit / panjang rute`, tidak disimpan. Ini sama dengan desain: A1 = 10/22,2 = 0,45. Skor keterhubungan transit (C6) dihitung dari jumlah moda terhubung dari lima pilihan, sesuai formulir Tambah Koridor (3 moda dipilih menghasilkan 3/5).

## 8. Data awal (seed)

- **Periode:** Agustus 2025 sampai November 2026 (16 bulan). Tanggal "hari ini" pada demo dikunci di Jumat, 20 November 2026, sama dengan desain.
- **November 2026:** nilainya persis desain dan laporan (Tabel VI, KPI 2.090 / 44 dari 48 / 23,6 menit / 80,4%, 48 unit, keluhan 81).
- **Oktober 2026:** keluhan 69 (sesuai "▲ 12 dari Oktober").
- **Bulan sebelumnya:** dibuat oleh generator deterministik (seed acak tetap) dengan nilai wajar dan tren menuju November.
- **Arsip:** 24 dokumen seperti desain. Isinya:
  - 16 prioritas bulanan: 15 disahkan, dan November menunggu pengesahan.
  - 5 evaluasi kuartal dan 3 simulasi pembobotan, berstatus arsip.

  Setiap snapshot dibuat dengan menjalankan mesin SAW yang sama pada data bulannya. Hasilnya, semua dokumen di arsip bisa diunduh dan angkanya konsisten.
- Script seed yang sama dipakai untuk pengembangan lokal (`npm run db:seed`), pengujian, dan reset harian.

## 9. Mesin SAW (`src/domain/saw`)

Fungsi murni:

```ts
computeSaw(alternatives, criteria) → {
  matrix, extremes, normalized, scores: { code, v, score, rank }[]
}
categorize(score, settings) → 'sangat_perlu' | 'perlu' | 'pantau' | 'belum_perlu'
nearBoundary(score, settings) → boolean      // |skor − batas kategori| ≤ 2
allocate(ranking, storedAllocations, settings) → { code, units }[]
estimateImpact(corridor, addedUnits) → { waitAfter, loadAfter }
sensitivity(alternatives, baseCriteria, scenarios) → hasil per skenario
```

- Normalisasi benefit `x / max`, cost `min / x`. `V = Σ w·r`. Skor = `round(V × 100)` dengan pembulatan half-up.
- Urutan berdasarkan V menurun. Jika V sama, urutan memakai kode koridor.
- Koridor ikut dihitung pada suatu periode hanya jika datanya lengkap untuk periode itu. Koridor yang belum lengkap ditampilkan dengan catatan "belum ada data periode ini".
- **Alokasi unit:** jumlah unit adalah masukan analis yang tersimpan di `allocations`.
  - Jika kategori sebuah koridor berubah sehingga nilainya keluar dari rentang kategori, nilainya dipotong ke batas rentang terdekat. Pantau dan Belum perlu berarti 0.
  - Koridor tanpa alokasi tersimpan memakai batas bawah rentang kategorinya.
  - Jika total melebihi "tambahan armada maksimal", halaman menampilkan peringatan tanpa memangkas otomatis.
- **Perkiraan dampak:** `tunggu' = tunggu × n/(n+k)` dan `kepadatan' = kepadatan × n/(n+k)`, dengan n = unit saat ini dan k = tambahan. Asumsinya headway berbanding terbalik dengan jumlah armada.
  - Hasil ditampilkan dalam menit dan persen bulat. Dengan data awal: A4 28→21 menit dan 95→71%; A1 25→21 menit dan 92→77%; A3 30→27 menit dan 70→63%. Rata-rata waktu tunggu semua koridor turun dari 23,6 menjadi 20,8 menit (−2,8 menit; dihitung dari nilai sebelum pembulatan).
  - Desain dan laporan menulis −3,1 menit dengan angka per koridor yang sedikit berbeda (20 menit, 75%, 70%, 62%), karena angka di desain adalah ilustrasi. Website akan memakai hasil rumus, lalu teks laporan dan Figma disesuaikan.
- Panel "Kenapa A4 paling perlu?" membandingkan nilai koridor teratas dengan rata-rata semua koridor per kriteria.
- Tautan "Lihat detail perhitungan" membuka panel geser berisi matriks X, matriks R, bobot, V, peringkat, dan tab "Uji sensitivitas" (skenario S0–S5 seperti Tabel IX).
- **Penanda "dekat batas":** koridor yang skornya berjarak ≤ 2 dari batas kategori diberi penanda. Ini mewujudkan saran di laporan.

## 10. Halaman dan perilaku

| Halaman | Perilaku |
|---|---|
| Login | Animasi bus masuk ke peta rute (CSS, dimatikan jika `prefers-reduced-motion`). Formulir email/NIP, tombol tampil/sembunyi kata sandi, "Ingat saya", pilihan akun demo, pesan galat inline. |
| Dashboard | Data dari periode terpilih, lewat aturan status SPM (lihat bawah). Unduh Ringkasan menghasilkan PDF. Panel geser Data Koridor dan Rekomendasi Armada. Lonceng menampilkan 5 notifikasi terbaru. |
| Peta Rute | Peta SVG skematis dengan garis rute dari desain. Posisi bus dianimasikan di klien sepanjang garis. Filter segmen status, daftar koridor, dan halte tersibuk. Koridor baru tampil di daftar dengan catatan "belum ada di peta skematis". |
| Data Koridor | Tabel induk dengan pencarian, baris total/rata-rata, daftar unit, dan riwayat perubahan. Tombol Tambah Koridor membuka formulir 3 bagian. Berkas KML diunggah ke server, lalu panjang rute dan jumlah halte terisi otomatis. Klik baris membuka formulir yang sama untuk ubah atau hapus (dengan konfirmasi). Impor Data menerima CSV metrik bulanan, dengan template yang bisa diunduh dan laporan validasi per baris. |
| Semua Unit (`/data-koridor/unit`) | Tampilan turunan baru dengan gaya design system: daftar 48+ unit dengan filter. Admin Depo bisa mengubah status. Saat unit masuk perawatan, peringatan operasional dan entri riwayat tercatat otomatis. |
| Rekomendasi Armada | Kesimpulan, urutan kebutuhan, "Kenapa A4", perkiraan dampak, dan bobot, semuanya dari mesin SAW. "Setujui & Buat Laporan" membuka **dialog konfirmasi** berisi ringkasan yang akan diajukan. "Atur Faktor" menuju Pengaturan. |
| Laporan | Pratinjau lembar keputusan dari snapshot. Pilihan lampiran dan format (PDF atau Excel). Unduh, dan Cetak (membuka PDF di tab baru). Kepala Bidang melihat tombol "Sahkan" dan "Kembalikan" (dengan catatan). Setelah disahkan, kolom tanda tangan menampilkan "Disahkan secara elektronik", nama, dan waktu. |
| Semua Arsip | Kartu ringkasan, tab jenis, filter tahun dan status, pencarian, dan paginasi 10 per halaman. Semuanya diproses di server. Aksi lihat dan unduh. |
| Pengaturan | Penggeser dan isian bobot (total harus 100%), pratinjau hasil yang dihitung ulang oleh `POST /settings/preview` setiap kali nilai berubah (debounce 300 ms), batas SPM, batas kategori, sumber data, Sinkron Sekarang, notifikasi, Simpan Perubahan, dan Kembalikan Default. |

**Status koridor (Kritis, Waspada, Normal) dihitung dari Pengaturan:**

- **Kritis:** kepadatan ≥ batas kritis, atau waktu tunggu ≥ 1,5 × target SPM.
- **Waspada:** waktu tunggu > target, kepadatan > batas atas kepadatan ideal, atau ketepatan waktu < minimal.
- **Normal:** selain itu.

Dengan data awal, aturan ini menghasilkan status yang sama dengan desain untuk kelima koridor.

**Alur laporan:**

1. Planner membuat laporan, statusnya menjadi *menunggu*, dan snapshot dikunci.
2. Kepala Bidang mengesahkan laporan (status *disahkan*) atau mengembalikannya (status *dikembalikan*, dengan catatan).
3. Jika Planner membuat laporan baru untuk periode yang laporannya masih *menunggu*, laporan lama otomatis menjadi *arsip* dengan catatan "digantikan".
4. Nomor laporan melanjutkan urutan seed: 551.2/895/436.7.14/2026, dan seterusnya.

## 11. Penanganan error

- **Format error API** selalu `{ error: { code, message, fields? } }`.
- **Kode status:**
  - 401: arahkan ke login
  - 403: toast "Peran Anda tidak memiliki akses"
  - 404
  - 409: misalnya kode koridor sudah dipakai
  - 422: galat per kolom, ditampilkan inline di formulir. Ini sekaligus menutup temuan heuristik "pesan galat belum dirancang".
  - 500: pesan umum, dengan detail dicatat di log server.
- **Status tampilan:** skeleton saat memuat, empty state (misalnya pencarian arsip kosong), dan toast untuk hasil aksi.
- **Galat impor CSV:** dilaporkan per baris, dan impor bersifat semua-atau-tidak-sama-sekali (satu transaksi).

## 12. Pengujian

| Lapisan | Alat | Isi |
|---|---|---|
| Unit | Vitest | Golden test SAW terhadap Tabel VI–IX laporan; kategori, dekat batas, alokasi, dampak; parser KML dan CSV; aturan status SPM; generator seed (deterministik) |
| Integrasi | Vitest + Postgres (Docker) | Setiap endpoint: validasi, 401/403 per peran, alur laporan, impor CSV, reset cron |
| End-to-end | Playwright | (1) Planner mengubah bobot, rekomendasi berubah, lalu membuat laporan. (2) Kepala Bidang mengesahkan laporan dan mengunduh PDF. (3) Planner menambah koridor dan mengimpor metrik, lalu koridor ikut dalam peringkat. (4) Admin Depo mengubah status unit. |
| Visual | Playwright screenshot | Perbandingan manual tiap halaman pada 1280 px dengan render desain di `design/screens/` |

GitHub Actions menjalankan lint, typecheck, uji unit, uji integrasi, dan e2e dengan layanan Postgres pada setiap push.

## 13. Deploy dan operasional

- **Database:** proyek Supabase (free tier) dengan migrasi Drizzle. Aplikasi memakai connection string pooler (mode transaksi, `prepare: false`).
- **Vercel:** proyek dengan *Root Directory* `web/`, terhubung ke repo GitHub sehingga setiap push ke `main` otomatis deploy. Environment variable: `DATABASE_URL`, `SESSION_SECRET`, `CRON_SECRET`.
- **Cron harian:** `0 17 * * *` (00.00 WIB) memanggil `/api/cron/reset`. Cron ini juga mencegah proyek Supabase dijeda karena tidak aktif.
- **Banner demo:** semua halaman menampilkan "Mode demo · data kembali ke kondisi awal setiap hari pukul 00.00 WIB".
- **Persetujuan sebelum dibuat:** pembuatan proyek Supabase dan Vercel, serta penyambungan repo, menunggu persetujuan pemilik akun. Dashboard Vercel mungkin meminta otorisasi GitHub secara manual.
- **Setelah live:** README utama ditambah link demo, akun demo, dan ringkasan arsitektur. README `web/` berisi cara menjalankan lokal (`docker compose up`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`).

## 14. Tahapan pengerjaan

Setiap tahap menghasilkan aplikasi yang bisa dijalankan dan di-commit:

1. **Fondasi:** scaffold, design system (token, komponen dasar), skema DB, seed, mesin SAW beserta golden test.
2. **Autentikasi dan kerangka:** login, sesi, peran, layout sidebar dan header, banner demo.
3. **Halaman baca:** Dashboard (beserta panel geser), Peta Rute, Data Koridor, Rekomendasi, Semua Arsip.
4. **Halaman tulis:** Pengaturan (SAW live), CRUD koridor, KML, impor CSV, status unit.
5. **Laporan:** pembuatan, pengesahan, PDF dan XLSX, unduh arsip.
6. **Kualitas dan rilis:** e2e, CI, cek visual, deploy, cron, pembaruan README.
