# Website WiraWiri: Rencana Implementasi

> **Untuk agen pelaksana:** WAJIB memakai sub-skill `anthropic-skills:subagent-driven-development` (disarankan) atau `anthropic-skills:executing-plans` untuk menjalankan rencana ini per task. Langkah memakai checkbox (`- [ ]`) untuk pelacakan.

**Tujuan:** Membangun website WiraWiri yang berjalan dan di-hosting: tampilan sesuai Figma, SAW dihitung di backend, ada tiga peran, kelola data, dan alur laporan sampai PDF.

**Arsitektur:** Satu aplikasi Next.js di `web/`. Halaman server membaca data lewat service. Semua perubahan data dari browser lewat REST `/api/v1/*`. Service memanggil domain murni (`src/domain`) dan Drizzle ke Postgres. Reset demo harian dijalankan oleh Vercel Cron.

**Tech stack** (versi stabil saat rencana ditulis, dikunci di Task 1):
- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS 4, lucide-react
- drizzle-orm 0.45 + drizzle-kit, postgres-js 4
- zod 4, jose 6, bcryptjs 3
- @react-pdf/renderer 4, exceljs 4, papaparse, fast-xml-parser
- Vitest 5, Playwright 1.65

**Spesifikasi:** `docs/specs/2026-11-22-website-wirawiri-design.md`. Baca bersama rencana ini.

## Batasan Global

- **Kode dan branch:** semua kode ada di `web/`. Kerjakan di branch `feat/web-app` di repo `zahraychana/UIUX-of-Wirawiri-Decision-Making-` dan push di akhir setiap fase. Merge ke `main` hanya di Task 24. Tidak ada repo baru.
- **Konvensi Next 16:**
  - Penjaga rute ada di `src/proxy.ts` (pengganti `middleware.ts`).
  - `params` di route handler berbentuk `Promise`.
  - Semua perubahan data lewat route handler `/api/v1/*`, tanpa Server Actions.
- **Bahasa UI dan teks:** Bahasa Indonesia. Teks UI disalin persis dari `design/svg/*.svg` versi lama di git (`git show 6fd1867:design/svg/<file>`); file di commit itu masih berisi teks, sedangkan SVG terbaru sudah di-outline.
- **Format angka dan waktu:** `Intl` `id-ID` (2.090; 23,6; 80,4%), zona waktu `Asia/Jakarta`, tanggal demo "hari ini" = **2026-11-20** (Jumat) sebagai konstanta `DEMO_TODAY`.
- **Layout:** desktop 1280 px; di bawah 1024 px tampilkan pemberitahuan dengan tombol "Tetap lanjutkan".
- **Token desain:**

  | Token | Nilai |
  |---|---|
  | Navy (primer) | `#0F2D4E` |
  | Biru (aksen) | `#2F64A0` |
  | Teks | `#1B2A3A` |
  | Latar | `#F1F5FA` |
  | Status | Kritis `#C83A44`, Waspada `#E2A23B`, Normal `#2F8F5B` |
  | Tipografi | Poppins; judul 28 px tebal, judul kartu 16 px, isi 13–14 px |
  | Kerangka | sidebar 260 px, header 72 px |

- **SAW:**
  - benefit `x/max`, cost `min/x`, `V = Σ w·r`
  - skor `round(V×100)` half-up
  - C5 = `round(unit/panjang_km, 2)` sebelum dinormalisasi (seperti Tabel VI)
  - V sama → urut berdasarkan kode
  - jarak "dekat batas" = 3
- **Pengaturan default:**
  - bobot 25/20/20/15/10/10
  - target tunggu 15 menit, tepat waktu minimal 85%
  - kepadatan ideal 70–75%, kepadatan kritis 90%
  - jam sibuk 06.30–08.30
  - tambahan maksimal 8 unit/bulan
  - kategori 80/72/55; usulan Sangat perlu +2..+4, Perlu +1..+1, lainnya 0
  - hitung ulang 06.15; terakhir diubah 15 Sep 2026 oleh "Tim Analis"
- **Keamanan:**
  - bcrypt
  - JWT HS256 di cookie `ww_session` (`httpOnly`, `secure` di produksi, `sameSite=lax`); berlaku 8 jam, atau 30 hari dengan "Ingat saya"
  - login gagal 5× dalam 15 menit → 429
  - batas: maksimal 10 koridor, teks ≤ 80 karakter, CSV ≤ 200 KB dan ≤ 100 baris, KML ≤ 1 MB
- **Format error API:** `{ "error": { "code": string, "message": string, "fields"?: Record<string,string> } }`. Kode status: 401, 403, 404, 409, 422, 429, 500.
- **Teks banner demo:** "Mode demo · data kembali ke kondisi awal setiap hari pukul 00.00 WIB".
- **Akun demo** (kata sandi `wirawiri-demo`, UUID tetap agar sesi bertahan setelah reset):

  | Peran | Nama | Email |
  |---|---|---|
  | `planner` | Bambang Irawan, S.T. | bambang.irawan@dishub.surabaya.go.id |
  | `kabid` | Ir. H. Arif Sunaryo, M.T. | arif.sunaryo@dishub.surabaya.go.id |
  | `admin_depo` | Bambang Irawan, S.T. | admin.depo@dishub.surabaya.go.id |

- **Nomor laporan:** `551.2/{seq}/436.7.14/{tahun}`. Seed November = 894, laporan baru dimulai dari 895.
- **Grafik:** tanpa pustaka grafik, SVG buatan sendiri.

## Fokus Review

Kondisi yang paling mungkin mengenai pengguna tetapi tidak tersirat langsung dari spesifikasi. Masing-masing sudah dipasangi tes di task pemiliknya.

1. **CSV dari Excel berbahasa Indonesia memakai pemisah `;` dan koma desimal ("14,6").** Keduanya harus diterima, dan angka tidak boleh terbaca 146. → Task 4 dan Task 16.
2. **Klik ganda "Setujui & Buat Laporan" atau dua tab sekaligus.** Hasilnya harus tetap satu laporan *menunggu* untuk periode itu. → Task 18.
3. **Kriteria dengan nilai 0 di semua koridor** (misalnya keluhan 0 semua hasil impor) atau koridor dengan unit 0. Tidak boleh muncul NaN atau crash. Benefit dengan max 0 menghasilkan r = 0, dan cost dengan x = 0 menghasilkan r = 1. → Task 2.
4. **Sesi yang dibuat sebelum reset tengah malam.** Sesi tetap berlaku (UUID pengguna tetap). Jika pengguna tidak ditemukan, respons 401 dan diarahkan ke login, bukan error 500. → Task 7.
5. **Bobot yang totalnya bukan 100%, atau batas kategori yang tumpang tindih** (misalnya Perlu ≥ Sangat perlu). Respons 422 dengan pesan per kolom, pratinjau tetap tampil dengan peringatan, dan tombol Simpan nonaktif. → Task 14.

---

## Fase 1: Fondasi

### Task 1: Scaffold `web/`, tooling, dan database lokal

**File:**
- Buat: `web/` (create-next-app: TypeScript, Tailwind, ESLint, App Router, `src/`, alias `@/*`)
- Buat: `web/docker-compose.yml`, `web/.env.example`, `web/vitest.config.ts`, `web/playwright.config.ts`
- Buat: `web/src/lib/env.ts`
- Tes: `web/tests/unit/env.test.ts`

**Antarmuka:**
- Menghasilkan:
  - `env: { DATABASE_URL: string; SESSION_SECRET: string; CRON_SECRET: string; NODE_ENV }`, divalidasi zod dan gagal cepat dengan pesan nama variabel.
  - Script npm:

    | Script | Isi |
    |---|---|
    | `dev`, `build`, `start` | bawaan Next.js |
    | `lint` | ESLint |
    | `typecheck` | `tsc --noEmit` |
    | `test:unit` | `vitest run --project unit` |
    | `test:int` | `vitest run --project integration` |
    | `test:e2e` | Playwright |
    | `db:generate`, `db:migrate`, `db:seed` | Drizzle dan seed |

- [ ] **Langkah 1:** buat branch `git checkout -b feat/web-app`, lalu jalankan `npx create-next-app@latest web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`.
- [ ] **Langkah 2:** pasang dependensi dari Tech Stack, plus `tsx` dan `@types/papaparse`. Catat versi terpasang di `web/README.md` bagian "Stack".
- [ ] **Langkah 3:** `docker-compose.yml` berisi layanan `db` (postgres:16, port host `54329`) dengan dua database: `wirawiri` dan `wirawiri_test`. Contoh di `.env.example`: `DATABASE_URL=postgres://postgres:postgres@localhost:54329/wirawiri`.
- [ ] **Langkah 4:** Vitest dengan dua project. `unit` mencakup `src/**/*.test.ts` dan `tests/unit/**`, environment node. `integration` mencakup `tests/integration/**`, `fileParallelism: false`, dan memakai `DATABASE_URL_TEST`.
- [ ] **Langkah 5:** tulis tes gagal `env.test.ts`. `parseEnv({})` harus melempar error yang menyebut `DATABASE_URL`, dan `parseEnv(valid)` mengembalikan objek.
- [ ] **Langkah 6:** implementasikan `parseEnv(source: Record<string,string|undefined>)` dan `export const env = parseEnv(process.env)`.
- [ ] **Langkah 7:** `npm run test:unit` PASS, `npm run typecheck` tanpa error, `docker compose up -d` dan `npm run build` berhasil.
- [ ] **Langkah 8:** commit `chore(web): scaffold Next.js app with tooling and local Postgres`.

### Task 2: Mesin SAW inti

**File:**
- Buat: `web/src/domain/saw/types.ts`, `web/src/domain/saw/engine.ts`, `web/src/domain/saw/categories.ts`
- Tes: `web/src/domain/saw/engine.test.ts`, `web/src/domain/saw/categories.test.ts`, `web/src/domain/saw/fixtures.ts` (matriks Tabel VI)

**Antarmuka:**
- Menghasilkan:
  ```ts
  type CriterionCode = 'C1'|'C2'|'C3'|'C4'|'C5'|'C6'
  interface Criterion { code: CriterionCode; weight: number; type: 'benefit'|'cost' }
  interface Alternative { code: string; values: Record<CriterionCode, number> }
  interface ScoredAlternative { code: string; v: number; score: number; rank: number }
  interface SawResult { extremes: Record<CriterionCode, number>; normalized: Alternative[]; scores: ScoredAlternative[] /* urut rank */ }
  computeSaw(alternatives: Alternative[], criteria: Criterion[]): SawResult   // RangeError jika |Σw − 1| > 1e-9 atau alternatif kosong
  type Category = 'sangat_perlu'|'perlu'|'pantau'|'belum_perlu'
  interface CategorySettings { sangatPerluMin: number; perluMin: number; pantauMin: number; unitRanges: Record<Category, [number, number]> }
  categorize(score: number, s: CategorySettings): Category
  nearBoundary(score: number, s: CategorySettings, margin?: number /* default 3 */): boolean
  roundHalfUp(x: number, digits?: number): number
  ```

- [ ] **Langkah 1:** tulis tes gagal `engine.test.ts`.
  - `matches Table VII`: nilai `normalized` (4 desimal) A1 = [0,8525; 0,9684; 0,8333; 0,7200; 0,8889; 1,0000], A3 = [0,4918; 0,7368; 1,0000; 0,8000; 1,0000; 0,6000], A4 = [1; 1; 0,9333; 1; 0,8; 1].
  - V (4 desimal): A1 0,8704; A2 0,6990; A3 0,7503; A4 0,9667; A5 0,4619.
  - `ranks and scores`: urutan [A4, A1, A3, A2, A5], skor [97, 87, 75, 70, 46].
  - `degenerate columns`: semua C4 = 0 → semua r(C4) = 0 tanpa NaN. Satu alternatif dengan C5 = 0 → r(C5) = 1 untuk alternatif itu dan 0 untuk yang lain.
  - `tie-break by code`: dua alternatif identik B2 dan B1 → B1 di peringkat lebih tinggi.
  - `rejects weights not summing to 1` → RangeError.
- [ ] **Langkah 2:** tulis tes gagal `categories.test.ts`. `categorize` untuk 97, 87, 75, 70, 46 → sangat_perlu, sangat_perlu, perlu, pantau, belum_perlu. Batas tepat: 80 → sangat_perlu, 72 → perlu, 55 → pantau, 54 → belum_perlu. `nearBoundary` true untuk 75 dan 70, false untuk 97, 87, 46.
- [ ] **Langkah 3:** jalankan `npx vitest run src/domain/saw` dan pastikan FAIL karena modul belum ada.
- [ ] **Langkah 4:** implementasikan sesuai antarmuka. `roundHalfUp` memakai `Math.round(x * 10**d + Number.EPSILON) / 10**d`.
- [ ] **Langkah 5:** tes PASS, lalu commit `feat(domain): SAW engine and categories with golden tests from the report`.

### Task 3: Sensitivitas, alokasi, dampak, status SPM, alasan

**File:**
- Buat: `web/src/domain/saw/sensitivity.ts`, `web/src/domain/saw/allocation.ts`, `web/src/domain/saw/impact.ts`, `web/src/domain/service-status.ts`, `web/src/domain/saw/explain.ts`
- Tes: berkas `*.test.ts` di samping masing-masing berkas

**Antarmuka:**
- Memakai: tipe dari Task 2.
- Menghasilkan:
  ```ts
  rescaleWeights(criteria: Criterion[], code: CriterionCode, newWeight: number): Criterion[]   // w'_j = w_j(1−w'_k)/(1−w_k)
  interface ScenarioResult { id: 'S0'|'S1'|'S2'|'S3'|'S4'|'S5'; label: string; ranking: string[]; vTop: number; scores: Record<string, number>; gapRank3Rank4: number }
  sensitivity(alternatives: Alternative[], base: Criterion[]): ScenarioResult[]   // S0 dasar, S1 1/6, S2 C1=0.35, S3 C3=0.30, S4 C4=0, S5 C5=0.20
  allocate(ranked: { code: string; category: Category }[], stored: Record<string, number>, s: CategorySettings): { code: string; units: number }[]
  estimateImpact(i: { units: number; added: number; waitMin: number; loadPct: number }): { waitAfter: number; loadAfter: number }  // tanpa pembulatan
  interface SpmSettings { waitTargetMin: number; onTimeMinPct: number; loadIdealMin: number; loadIdealMax: number; loadCriticalPct: number }
  serviceStatus(m: { loadPct: number; waitMin: number; onTimePct: number }, spm: SpmSettings): 'kritis'|'waspada'|'normal'
  buildReasons(m: { loadPct: number; waitMin: number; complaints: number }, spm: SpmSettings, avgComplaints: number): string[]   // maks 2
  compareToAverage(alts: Alternative[], code: string, criteria: Criterion[]): { code: CriterionCode; value: number; average: number; moreNeed: boolean }[]
  ```

- [ ] **Langkah 1:** tulis tes gagal.
  - `sensitivity` (nilai dari `analysis/results/sensitivity.csv`):

    | Skenario | vTop | Skor A3 / A2 | Catatan |
    |---|---|---|---|
    | S0 | 0,9667 | 75 / 70 | |
    | S1 | 0,9556 | 77 / 70 | |
    | S2 | 0,9711 | 72 / 70 | |
    | S3 | 0,9625 | 78 / 69 | |
    | S4 | 0,9608 | 74 / 74 | gap 0,0039 |
    | S5 | 0,9481 | 78 / 70 | |

    Semua skenario punya ranking [A4, A1, A3, A2, A5].
  - `allocate`:
    - stored {A4: 4, A1: 2, A3: 1} → A4 4, A1 2, A3 1, A2 0, A5 0.
    - Jika A2 menjadi `perlu` tanpa nilai tersimpan → 1.
    - Jika A1 menjadi `perlu` dengan stored 2 → dipotong ke 1.
    - Jika A3 menjadi `pantau` → 0.
  - `estimateImpact`:
    - {12, 4, 28, 95} → tunggu 21, kepadatan 71,25
    - {10, 2, 25, 92} → tunggu 20,833…, kepadatan 76,67
    - {9, 1, 30, 70} → tunggu 27, kepadatan 63
  - `serviceStatus` (default SPM, ambang kritis tunggu = 1,5 × target):

    | Koridor | Kepadatan / Tunggu / Tepat waktu | Status |
    |---|---|---|
    | A1 | 92 / 25 / 82 | kritis |
    | A2 | 85 / 20 / 88 | waspada |
    | A3 | 70 / 30 / 79 | kritis |
    | A4 | 95 / 28 / 76 | kritis |
    | A5 | 60 / 15 / 94 | normal |

  - `buildReasons` (avgComplaints 16,2):

    | Koridor | Alasan |
    |---|---|
    | A4 | ["Bus penuh 95%", "Menunggu 28 menit"] |
    | A1 | ["Bus penuh 92%", "Menunggu 25 menit"] |
    | A3 | ["Menunggu 30 menit", "20 keluhan"] |
    | A2 | ["Bus padat 85%", "Menunggu 20 menit"] |
    | A5 | ["Layanan sesuai target"] |

  - `compareToAverage` untuk A4 → rata-rata 418; 80,4; 23,6; 16,2; 0,53; 3,8. `moreNeed` bernilai true untuk keenam kriteria.
- [ ] **Langkah 2:** jalankan `npx vitest run src/domain` dan pastikan FAIL.
- [ ] **Langkah 3:** implementasikan. Urutan alasan: kepadatan (penuh jika ≥ kritis, padat jika > batas atas ideal), lalu tunggu (> target), lalu keluhan (> rata-rata). Ambil 2 pertama.
- [ ] **Langkah 4:** PASS, lalu commit `feat(domain): sensitivity, allocation, impact, SPM status and reasons`.

### Task 4: Parser KML dan CSV, helper koridor

**File:**
- Buat: `web/src/domain/kml.ts`, `web/src/domain/metrics-csv.ts`, `web/src/domain/corridor.ts`, `web/src/domain/number.ts`
- Tes: `*.test.ts` di samping masing-masing berkas, plus fixture `web/tests/fixtures/rute-A6-keputih-gubeng.kml` (19 Placemark Point dan satu LineString sepanjang ±14,6 km)

**Antarmuka:**
- Menghasilkan:
  ```ts
  parseDecimalId(raw: string): number | null          // "14,6"→14.6, "14.6"→14.6, "1.234,5"→1234.5, ""→null
  parseRouteKml(xml: string): { lengthKm: number; stopCount: number }   // melempar KmlError("Berkas tidak berisi jalur rute")
  const TRANSIT_OPTIONS = ['Suroboyo Bus','Trans Semanggi','Kereta komuter','Terminal antarkota','Feeder lain'] as const
  transitScore(links: readonly string[]): number      // jumlah moda unik yang valid, 0–5
  deriveRouteName(origin: string, destination: string): string  // "Halte Keputih","Stasiun Gubeng" → "Keputih — Gubeng"
  fleetPerKm(units: number, lengthKm: number): number // round(units/length, 2)
  interface MetricsRow { code: string; period: string /*YYYY-MM*/; passengersPerDay: number; loadPct: number; waitMin: number; complaints: number; onTimePct: number }
  parseMetricsCsv(text: string): { rows: MetricsRow[]; errors: { line: number; field: string; message: string }[] }
  const METRICS_CSV_HEADER = 'kode;periode;penumpang_per_hari;kepadatan_pct;waktu_tunggu_menit;keluhan_per_bulan;tepat_waktu_pct'
  ```

- [ ] **Langkah 1:** tulis tes gagal.
  - `parseDecimalId` untuk empat contoh di atas.
  - `parseRouteKml(fixture)` → stopCount 19, lengthKm dalam rentang 14,6 ± 0,1. XML tanpa LineString → KmlError.
  - `deriveRouteName` membuang awalan "Halte ", "Stasiun ", "St. ", "Terminal ". Spasi ganda dirapikan.
  - `transitScore(['Suroboyo Bus','Kereta komuter','Feeder lain'])` → 3. Duplikat dan nilai asing diabaikan.
  - `fleetPerKm(10, 22.2)` → 0,45.
  - `parseMetricsCsv`:
    - menerima pemisah `;` maupun `,` dan koma desimal ("23,5")
    - baris dengan kepadatan "abc" → error `{ line: 3, field: 'kepadatan_pct' }`
    - lebih dari 100 baris → satu error `{ line: 0, field: 'file' }`
    - header salah → error `{ line: 1, field: 'header' }`
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan dengan papaparse (`delimiter` dideteksi otomatis dari baris header), fast-xml-parser, dan haversine dengan R = 6371 km. **Langkah 4:** PASS. **Langkah 5:** commit `feat(domain): KML route parser, metrics CSV parser and corridor helpers`.

### Task 5: Skema database dan harness uji integrasi

**File:**
- Buat: `web/src/server/db/schema.ts`, `web/src/server/db/client.ts`, `web/drizzle.config.ts`, `web/drizzle/` (migrasi hasil generate)
- Buat: `web/tests/integration/setup.ts` (global setup: migrasi `wirawiri_test`)
- Tes: `web/tests/integration/schema.test.ts`

**Antarmuka:**
- Menghasilkan:
  - `db` (instance Drizzle; `postgres(url, { prepare: false })`), `type Db`, `type Tx`.
  - Tabel dan kolom penting, semua id `uuid defaultRandom` kecuali disebut lain:

    | Tabel | Kolom penting |
    |---|---|
    | `users` | `role` enum `planner\|kabid\|admin_depo`, `email` unik, `nip` unik, `notificationPrefs` jsonb, `notificationsSeenAt` |
    | `login_attempts` | |
    | `corridors` | `code` unik, `origin`, `destination`, `groupName`, `lengthKm numeric(5,1)`, `stopCount`, `depot`, `startDate`, `serviceHours`, `transitLinks text[]`, `routeFileName`, `isSeed` |
    | `buses` | `code` unik, `corridorId` FK cascade, `status` enum `beroperasi\|perawatan\|cadangan`, `note`, `returnDate`, `routeProgress real` |
    | `corridor_metrics` | PK (`corridorId`,`period date`); `passengersPerDay`, `loadPct`, `waitMin numeric(4,1)`, `complaints`, `onTimePct`, `fleetUnits` |
    | `daily_ridership` | PK `date`, `total` |
    | `criteria` | PK `code`; `name`, `description`, `unit`, `type`, `weight numeric(5,4)`, `sort` |
    | `settings` | satu baris `id=1`; kolom sesuai Batasan Global; `unitRanges` jsonb; `updatedAt`, `updatedByLabel` |
    | `allocations` | PK (`corridorId`,`period`); `units` |
    | `reports` | `seq`, `number` unik, `title`, `type` enum `prioritas_bulanan\|evaluasi_kuartal\|simulasi_pembobotan`, `periodStart`, `periodEnd`, `status` enum `menunggu\|disahkan\|dikembalikan\|arsip`, `snapshot` jsonb, `formats text[]`, `sizeLabel`, `createdById`, `createdAt`, `approvedById`, `approvedAt`, `reviewNote` |
    | `operational_events` | `date`, `time`, `title`, `detail`, `severity` `kritis\|waspada\|normal` |
    | `complaint_categories` | |
    | `stops` | `name`, `isHub`, `x`, `y`, `corridorCodes text[]` |
    | `route_geometry` | `corridorId` PK, `points jsonb` |
    | `busiest_stops` | |
    | `data_sources` | |
    | `audit_log` | |

    Indeks unik parsial: satu `reports` berstatus `menunggu` per (`type`,`periodStart`).

- [ ] **Langkah 1:** tulis tes gagal `schema.test.ts`. Setelah migrasi, `information_schema.tables` memuat 17 tabel di atas. Memasukkan dua laporan `menunggu` dengan type dan periode yang sama harus melanggar constraint.
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** tulis skema, `npm run db:generate`, lalu global setup menjalankan `migrate()` ke `wirawiri_test`. **Langkah 4:** `npm run test:int` PASS. **Langkah 5:** commit `feat(db): schema, migrations and integration test harness`.

### Task 6: Seed deterministik dan reset demo

**File:**
- Buat di `web/src/server/db/seed/`:
  - `index.ts` (`seed(tx)`)
  - `users.ts`, `corridors.ts`, `history.ts` (generator 16 bulan), `map.ts` (geometri dan halte), `archive.ts`, `misc.ts` (events, keluhan, data_sources, audit)
- Buat: `web/src/server/services/reset.ts`, `web/scripts/seed.ts`
- Tes: `web/tests/integration/seed.test.ts`

**Antarmuka:**
- Memakai: `computeSaw`, `sensitivity`, `allocate` (Task 2–3); skema (Task 5).
- Menghasilkan:
  - `resetDemoData(db: Db): Promise<void>`: satu transaksi, `TRUNCATE ... RESTART IDENTITY CASCADE` semua tabel lalu `seed(tx)`.
  - `DEMO_USERS` (3 akun dengan UUID tetap dan konstan).
  - `DEMO_TODAY = '2026-11-20'`, `SEED_RANDOM = 20261120`.
  - Integration test memanggil `resetDemoData` di `beforeEach`.

**Data yang dipatok:**

- **Koridor November 2026:**

  | Kode | Rute | Kelompok | Panjang | Halte | Unit | Penumpang | Kepadatan | Tunggu | Keluhan | Tepat waktu | Transit |
  |---|---|---|---|---|---|---|---|---|---|---|---|
  | A1 | Benowo — TP | Koridor Barat – Pusat | 22,2 km | 24 | 10 | 520 | 92 | 25 | 18 | 82 | 5 |
  | A2 | Puspa Agro — DTC | Koridor Sidoarjo – Selatan | 13,3 km | 18 | 8 | 410 | 85 | 20 | 12 | 88 | 4 |
  | A3 | Sungkono — Kenjeran | Koridor Timur – Barat | 22,5 km | 31 | 9 | 300 | 70 | 30 | 20 | 79 | 3 |
  | A4 | Bratang — Joyoboyo | Koridor Intermoda Pusat | 24,0 km | 22 | 12 | 610 | 95 | 28 | 25 | 76 | 5 |
  | A5 | Joyoboyo — Lakarsantri | Koridor Barat Daya | 12,9 km | 26 | 9 | 250 | 60 | 15 | 6 | 94 | 2 |

  Kolom Transit = jumlah moda di `transitLinks`.

- **Unit armada:** 48 unit `FD-0{n}-{nn}`, semuanya beroperasi kecuali:

  | Unit | Status | Keterangan |
  |---|---|---|
  | FD-04-07 | perawatan | "Servis rem · kembali 22 Nov" |
  | FD-01-03 | perawatan | "Ganti ban · kembali 21 Nov" |
  | FD-03-09 | cadangan | "Siaga di Depo Kenjeran" |
  | FD-05-09 | cadangan | "Siaga di Depo Joyoboyo" |

  Unit aktif per koridor: 9/10, 8/8, 8/9, 11/12, 8/9. Keterangan FD-04-01 "Dekat Stasiun Gubeng", FD-01-01 "Dekat Tunjungan Plaza".

- **Penumpang harian:** nilai yang dipatok:

  | Tanggal | Penumpang |
  |---|---|
  | 2026-10-05 | 1790 |
  | 2026-10-12 | 1830 |
  | 2026-10-19 | 1905 |
  | 2026-10-26 | 1850 |
  | 2026-11-02 | 1935 |
  | 2026-11-09 | 1990 |
  | 2026-11-13 | 2006 |
  | 2026-11-16 | 2140 |
  | 2026-11-20 | 2090 |

  Hari lain diisi generator dengan nilai di antara titik-titik tersebut.

- **Keluhan:** November 81 (Armada penuh 34, Menunggu terlalu lama 27, Pelayanan pengemudi 12, Kebersihan unit 8). Oktober 69.

- **Peringatan operasional 20 Nov:**

  | Jam | Judul | Detail | Tingkat |
  |---|---|---|---|
  | 07:42 | A4 penuh 95% di jam sibuk | Pukul 06.30–08.30 penumpang tertinggal di Halte St. Gubeng. | kritis |
  | 07:15 | A3 menunggu 30 menit | Dua kali lipat target SPM 15 menit. | kritis |
  | 06:50 | FD-04-07 masuk bengkel | Servis rem, estimasi kembali 22 November. | waspada |
  | 06:15 | Pelacakan GPS normal | Seluruh unit aktif terpantau 5 menit lalu. | normal |

- **Riwayat perubahan data:**

  | Waktu | Pesan |
  |---|---|
  | 20 Nov 06:15 | Sinkronisasi otomatis GPS & tiket elektronik |
  | 18 Nov 16:40 | Unit FD-04-07 berstatus perawatan oleh Admin Depo |
  | 15 Nov 09:10 | Data keluhan WargaKu diperbarui |
  | 1 Nov 08:00 | Panjang trayek A4 diperbarui menjadi 24,0 km |

- **Sumber data:**

  | Sumber | Isi | Status dan waktu |
  |---|---|---|
  | GPS armada | Posisi 48 unit · tiap 5 menit | Terhubung 14:02 |
  | Tiket elektronik | Jumlah penumpang per koridor · harian | Terhubung 06:15 |
  | Kanal WargaKu & petugas halte | Keluhan penumpang · mingguan | Terhubung 15 Nov 09:10 |
  | Data trayek & halte | Rute, halte & transit · diubah 1 Nov 2026 | Manual |

- **Halte tersibuk:**

  | Halte | Koridor | Orang/jam |
  |---|---|---|
  | Stasiun Gubeng | A4 | 182 |
  | TIJ Joyoboyo | A4·A5 | 164 |
  | Tunjungan Plaza | A1 | 140 |
  | Terminal Benowo | A1 | 96 |

  Kapasitas 150 orang/jam.

- **ETA per koridor:** A1 Tunjungan Plaza 4, A2 DTC Wonokromo 6, A3 Kenjeran Park 11, A4 Stasiun Gubeng 3, A5 TIJ Joyoboyo 7 (menit).

- **Geometri peta:** disalin dari garis rute dan titik di `design/svg/02-peta-rute.svg`, memakai koordinat dalam viewBox kartu peta.

- **Alokasi November:** A4 4, A1 2, A3 1.

- **Bulan Agustus 2025 sampai Oktober 2026:** dari generator dengan `SEED_RANDOM`, dalam rentang ±15% dari nilai November dan bergerak menuju November.

- **Arsip:**
  - 16 laporan `prioritas_bulanan`, Agustus 2025 sampai November 2026. Seq November = 894. Status: November `menunggu`, sisanya `disahkan`.
  - 5 laporan `evaluasi_kuartal` (Q3 2025 sampai Q3 2026) dan 3 `simulasi_pembobotan` (SIM-FDR/2026/01..03), semuanya `arsip`.
  - Snapshot dibuat dengan Task 2–3 dari data bulannya. `sizeLabel` diambil dari desain untuk 10 dokumen yang tampil di desain dan dibuat wajar untuk sisanya.

- [ ] **Langkah 1:** tulis tes gagal `seed.test.ts`:
  - `resetDemoData` dua kali → dump tabel `corridor_metrics` identik (deterministik).
  - Total penumpang November = 2090.
  - 44 unit beroperasi dari 48.
  - Keluhan November 81 dan Oktober 69.
  - Jumlah `reports` 24 per jenis 16/5/3 dan per status 15 disahkan, 1 menunggu, 8 arsip.
  - Snapshot November punya ranking [A4, A1, A3, A2, A5].
  - UUID `DEMO_USERS` sama sebelum dan sesudah reset.
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan. `scripts/seed.ts` memanggil `resetDemoData`. **Langkah 4:** `npm run test:int` PASS dan `npm run db:seed` berhasil di DB lokal. **Langkah 5:** commit `feat(db): deterministic 16-month seed and demo reset`.
- [ ] **Langkah 6:** push branch `git push -u origin feat/web-app`.

## Fase 2: Autentikasi dan kerangka

### Task 7: Autentikasi, helper HTTP, dan penjaga rute

**File:**
- Buat: `web/src/server/http.ts`, `web/src/server/auth/password.ts`, `web/src/server/auth/session.ts`, `web/src/server/auth/guard.ts`
- Buat: `web/src/app/api/v1/auth/login/route.ts`, `.../auth/logout/route.ts`, `.../auth/me/route.ts`, `web/src/proxy.ts`
- Tes: `web/tests/integration/auth.test.ts`, `web/tests/integration/helpers.ts`

**Antarmuka:**
- Menghasilkan:
  ```ts
  class ApiError extends Error { constructor(status: number, code: string, message: string, fields?: Record<string,string>) }
  handle<C>(fn: (req: NextRequest, ctx: C) => Promise<Response>): (req: NextRequest, ctx: C) => Promise<Response>  // ZodError→422 fields, ApiError→status, lainnya→500 + console.error
  type Role = 'planner'|'kabid'|'admin_depo'
  interface Session { userId: string; role: Role; name: string }
  createSessionCookie(s: Session, remember: boolean): Promise<string>   // header Set-Cookie
  readSession(req: NextRequest): Promise<Session | null>                // memverifikasi JWT dan memastikan user masih ada
  requireSession(req: NextRequest): Promise<Session>                    // 401 UNAUTHENTICATED
  requireRole(s: Session, ...roles: Role[]): void                       // 403 FORBIDDEN, pesan "Peran Anda tidak memiliki akses"
  getServerSession(): Promise<Session | null>                           // untuk Server Component (cookies())
  ```
  - `POST /api/v1/auth/login` dengan body `{ identifier, password, remember }` (identifier = email atau NIP) → 200 `{ user }` beserta cookie. Salah → 401 `INVALID_CREDENTIALS` "Email/NIP atau kata sandi salah". Terkunci → 429 `TOO_MANY_ATTEMPTS`.
  - Helper tes: `call(handler, { method, url, body?, role?, params? })` mengembalikan `{ status, json }`, dan `cookieFor(role)`.

- [ ] **Langkah 1:** tulis tes gagal:
  - Login dengan email planner → 200 dan cookie `ww_session` HttpOnly. Login dengan NIP kabid → 200.
  - Kata sandi salah → 401. Percobaan ke-6 dalam 15 menit → 429.
  - `me` tanpa cookie → 401. Logout → cookie kedaluwarsa.
  - **Fokus Review #4:** cookie yang dibuat sebelum `resetDemoData` tetap valid (`me` → 200). Cookie dengan userId yang tidak ada → 401, bukan 500.
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan. `proxy.ts` mengarahkan permintaan tanpa cookie ke `/login?next=<path>`, kecuali `/login`, `/api/v1/auth/*`, `/api/cron/*`, dan aset statis. **Langkah 4:** PASS. **Langkah 5:** commit `feat(auth): login, signed session cookie, role guard and route proxy`.

### Task 8: Design system dan halaman Login

**File:**
- Buat: `web/src/app/globals.css` (token `@theme`), `web/src/app/layout.tsx` (Poppins via `next/font`)
- Buat di `web/src/components/ui/`: `button.tsx`, `card.tsx`, `chip.tsx` (StatusChip kritis/waspada/normal dan CategoryChip), `checkbox.tsx`, `password-input.tsx`, `field.tsx` (label, galat inline, teks bantu), `modal.tsx`, `slide-over.tsx`, `toast.tsx`, `tooltip.tsx`, `skeleton.tsx`, `empty-state.tsx`, `table.tsx`
- Buat: `web/src/lib/api-client.ts`
- Buat: `web/src/app/(auth)/login/page.tsx`, `web/src/app/(auth)/login/login-form.tsx`, `web/src/app/(auth)/login/bus-intro.tsx`
- Tes: `web/e2e/login.spec.ts`, `web/e2e/global-setup.ts` (migrasi DB e2e), `web/e2e/fixtures.ts` (`test` dengan `beforeEach` otomatis memanggil `resetDemoData` ke DB e2e, plus helper `loginAs(page, role)`); `playwright.config.ts` memakai `workers: 1` dan `fullyParallel: false` karena semua tes berbagi satu DB

**Antarmuka:**
- Memakai: endpoint login (Task 7).
- Menghasilkan:
  - `apiFetch<T>(path, init?)`: mengurai format error, melempar `ApiClientError { status, code, message, fields }`, dan pada 401 mengarahkan ke `/login?next=` halaman saat ini.
  - Komponen UI di atas, dipakai semua halaman.

- [ ] **Langkah 1:** tulis tes e2e gagal `login.spec.ts`:
  - Pilih "Transport Planner" di panel akun demo → kolom terisi → Masuk → URL `/dashboard`, dan header memuat "Bambang Irawan, S.T." serta "Transport Planner · Dishub".
  - Kata sandi salah → galat inline "Email/NIP atau kata sandi salah".
  - Ikon mata mengubah `type` input menjadi `text`.
  - Membuka `/rekomendasi` tanpa sesi → diarahkan ke `/login?next=%2Frekomendasi`, dan setelah login kembali ke `/rekomendasi`.
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan sesuai `design/screens/00-login.png`.
  - Animasi bus dari posisi frame `00-login-1.svg` ke frame `00-login-2.svg`: 1,2 detik ease-out. Dengan `prefers-reduced-motion`, bus langsung di posisi akhir.
  - Panel "Akun demo" (tiga tombol peran dan kata sandi `wirawiri-demo`) ditempatkan di bawah kartu formulir.
  - "Lupa kata sandi?" dan "Hubungi Admin Dishub" membuka Modal informasi demo.
- [ ] **Langkah 4:** `npm run test:e2e -- login` PASS. Bandingkan screenshot 1280×820 dengan `design/screens/00-login.png` secara visual. **Langkah 5:** commit `feat(ui): design tokens, base components and login page`.

### Task 9: Kerangka aplikasi, periode, pencarian, notifikasi

**File:**
- Buat di `web/src/components/layout/`: `sidebar.tsx`, `header.tsx`, `period-picker.tsx`, `global-search.tsx`, `notification-bell.tsx`, `demo-banner.tsx`, `small-screen-notice.tsx`
- Buat: `web/src/app/(app)/layout.tsx`, `web/src/app/(app)/loading.tsx` (skeleton kartu dan tabel saat halaman memuat)
- Buat di `web/src/server/services/`: `periods.ts`, `search.ts`, `notifications.ts`
- Buat: `web/src/app/api/v1/periods/route.ts`, `.../search/route.ts`, `.../notifications/route.ts`, `.../notifications/seen/route.ts`
- Tes: `web/tests/integration/shell.test.ts`, `web/e2e/shell.spec.ts`

**Antarmuka:**
- Menghasilkan:
  ```ts
  listPeriods(): Promise<{ key: string /*YYYY-MM*/; label: string /*"November 2026"*/ }[]>  // terbaru dulu
  resolvePeriod(searchParam?: string): Promise<string>   // tidak valid atau kosong → periode terbaru
  search(q: string): Promise<{ type: 'koridor'|'halte'|'unit'; label: string; sublabel: string; href: string }[]>  // maks 8, q < 2 huruf → []
  listNotifications(s: Session): Promise<{ id: string; title: string; detail: string; at: string; unread: boolean; href?: string }[]>  // maks 5, mengikuti preferensi
  ```
  - Periode disimpan di query `?periode=YYYY-MM` dan dibawa ke semua tautan sidebar.

- [ ] **Langkah 1:** tulis tes gagal:
  - `listPeriods` → 16 item, pertama "2026-11" berlabel "November 2026".
  - `search('gub')` memuat halte "Stasiun Gubeng". `search('FD-04')` memuat unit.
  - Notifikasi kabid memuat "Laporan Prioritas November 2026 menunggu pengesahan".
  - E2E: klik setiap menu sidebar → judul halaman sesuai. Ubah periode ke "Oktober 2026" → URL memuat `periode=2026-10` dan tetap ada setelah pindah menu. Banner demo tampil. Viewport 800 px → pemberitahuan layar kecil, lalu "Tetap lanjutkan" menutupnya.
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan. Halaman yang belum dibuat sementara cukup menampilkan judul. Profil di header punya menu "Keluar". **Langkah 4:** PASS. **Langkah 5:** commit `feat(shell): sidebar, header, period picker, search and notifications`.
- [ ] **Langkah 6:** `git push`.

## Fase 3: Halaman baca

### Task 10: Service baca (dashboard, rekomendasi, koridor, peta, arsip)

**File:**
- Buat di `web/src/server/services/`: `settings.ts` (baca saja dulu), `recommendation.ts`, `dashboard.ts`, `corridors.ts` (baca), `buses.ts` (baca), `map.ts`, `reports.ts` (baca), `audit.ts`
- Buat: `web/src/app/api/v1/dashboard/route.ts`, `.../recommendations/route.ts`, `.../recommendations/calculation/route.ts`, `.../corridors/route.ts` (GET), `.../buses/route.ts` (GET), `.../map/route.ts`, `.../reports/route.ts` (GET), `.../audit-log/route.ts`
- Tes: `web/tests/integration/read-services.test.ts`

**Antarmuka:**
- Memakai: domain (Task 2–4) dan seed (Task 6).
- Menghasilkan:
  ```ts
  getSettings(): Promise<Settings>   // Settings = SpmSettings & CategorySettings & { weights: Record<CriterionCode, number> /*persen*/; peakStart; peakEnd; maxAdditionalUnits; recalcTime; updatedAt; updatedByLabel }
  interface RecItem { rank; code; name; group; v; score; category: Category; nearBoundary: boolean; units: number; reasons: string[]; impact?: { waitBefore; waitAfter; loadBefore; loadAfter } }
  interface Recommendation { period; items: RecItem[]; excluded: { code; name }[]; totalUnits; fleetBefore; fleetAfter; avgWaitBefore; avgWaitAfter; overCap: boolean; explain: ReturnType<typeof compareToAverage>; topCode: string; criteria: Criterion[]; saw: SawResult; matrix: Alternative[] }
  getRecommendation(period: string, weightsOverride?: Record<CriterionCode, number>): Promise<Recommendation>
  getCalculation(period: string): Promise<{ matrix; extremes; normalized; scores; criteria; scenarios: ScenarioResult[] }>
  getDashboard(period: string): Promise<DashboardData>  // kpis, trend (8 titik), perCorridor, performance (dengan status), events, complaints, recommendationPreview
  listCorridors(period: string, q?: string): Promise<CorridorRow[]>  // dengan total/rata-rata dan flag hasMetrics
  listBuses(f: { corridor?: string; status?: string; q?: string; limit?: number }): Promise<BusRow[]>  // perawatan dan cadangan lebih dulu
  getMapData(period: string): Promise<MapData>
  listReports(f: { type?; status?; year?; q?; page?: number }): Promise<{ items; total; counts: { all; prioritas_bulanan; evaluasi_kuartal; simulasi_pembobotan }; summary: { total; disahkan; menunggu; arsip } }>
  getReport(id: string): Promise<ReportDetail>
  listAudit(limit: number): Promise<AuditRow[]>
  logAudit(tx: Tx, e: { actorId?: string; action: string; entity: string; entityId?: string; message: string }): Promise<void>
  ```

- [ ] **Langkah 1:** tulis tes gagal untuk periode `2026-11`:
  - **Dashboard:** KPI 2090, 44/48, perawatan 2, cadangan 2, tunggu 23,6, kepadatan 80,4. Delta minggu lalu = 4,2 (1 desimal). Tren sejak Oktober = 17 (bulat), dengan 8 titik dan titik puncak 2140. Porsi A4 = 29. Status A1..A5 = kritis, waspada, kritis, kritis, normal. Keluhan 81 dengan delta +12.
  - **Rekomendasi:** skor 97/87/75/70/46. Unit 4/2/1/0/0, totalUnits 7, armada 48 → 55. avgWaitAfter dibulatkan 1 desimal = 20,8. Dampak A4 {21; 71}, A1 {21; 77}, A3 {27; 63} setelah dibulatkan. nearBoundary true hanya untuk A3 dan A2. topCode A4.
  - **Override bobot** {C1:35, C2:20, C3:20, C4:15, C5:5, C6:5} mengubah V tanpa menulis ke DB (`getSettings` tetap default).
  - **Arsip:** counts 24/16/5/3. Filter `status=disahkan` → total 15. `q='Oktober'` memuat "Prioritas Oktober 2026". Halaman 3 berisi 4 item.
  - **Bus:** `listBuses({limit: 6})` diawali FD-04-07 dan FD-01-03.
  - **Endpoint:** GET tanpa sesi → 401. Semua peran → 200.
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan. Koridor tanpa metrik periode masuk `excluded`. **Langkah 4:** PASS. **Langkah 5:** commit `feat(api): read services and endpoints for dashboard, recommendation, corridors, map and archive`.

### Task 11: Halaman Dashboard dan panel geser

**File:**
- Buat: `web/src/app/(app)/dashboard/page.tsx`
- Buat di `web/src/components/dashboard/`: `kpi-cards.tsx`, `trend-chart.tsx`, `corridor-bars.tsx`, `performance-table.tsx`, `alerts-card.tsx`, `complaints-card.tsx`, `recommendation-card.tsx`, `corridor-data-panel.tsx`, `recommendation-panel.tsx`
- Tes: `web/e2e/dashboard.spec.ts`

**Antarmuka:**
- Memakai: `getDashboard`, `getRecommendation`, `listCorridors`; SlideOver (Task 8).
- Panel geser dibuka lewat `?panel=koridor|rekomendasi` agar bisa ditautkan. "Unduh Ringkasan" adalah tautan ke `/api/v1/dashboard/summary.pdf?periode=` (endpoint di Task 19).

- [ ] **Langkah 1:** tulis tes e2e gagal:
  - Kartu menampilkan "2.090", "44/48", "23,6", "80,4%".
  - Baris A2 berchip "Waspada".
  - Kartu Rekomendasi menampilkan "+4 unit" dan "Total usulan +7 unit".
  - Klik "Lihat Data Koridor" → `/data-koridor`. Klik "Lihat Rekomendasi" → `/rekomendasi`.
  - Membuka `?panel=koridor` menampilkan panel "Data Koridor" dengan filter Semua 5, Kritis 3, Waspada 1, Normal 1.
  - Escape menutup panel.
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan sesuai `design/screens/01-dashboard.png`, `01a-…png`, dan `01b-…png`. **Langkah 4:** PASS dan bandingkan visual. **Langkah 5:** commit `feat(ui): dashboard with corridor and recommendation slide-overs`.

### Task 12: Halaman Peta Rute

**File:**
- Buat: `web/src/app/(app)/peta-rute/page.tsx`
- Buat di `web/src/components/map/`: `schematic-map.tsx`, `bus-markers.tsx` (klien, animasi), `corridor-list.tsx`, `busiest-stops.tsx`
- Tes: `web/e2e/map.spec.ts`

**Antarmuka:**
- Memakai: `getMapData` (Task 10).
- Posisi bus = `routeProgress + kecepatan × waktu`, berputar di garis rute dengan `requestAnimationFrame`. Animasi berhenti jika `prefers-reduced-motion`.

- [ ] **Langkah 1:** tulis tes e2e gagal:
  - Lima garis rute ter-render (`data-corridor="A1"`…`"A5"`).
  - Filter "Kritis (3)" → hanya A1, A3, A4 yang tidak redup, dan daftar koridor berisi 3.
  - Toggle "Tampilkan armada" mati → tidak ada `[data-bus]`.
  - Halte tersibuk "Stasiun Gubeng 182" berlabel "Melebihi kapasitas".
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan sesuai `design/screens/02-peta-rute.png`. Koridor tanpa `route_geometry` (misalnya A6 hasil Tambah Koridor) tetap tampil di Daftar Koridor dengan catatan "Belum ada di peta skematis". **Langkah 4:** PASS. **Langkah 5:** commit `feat(ui): schematic route map with live-looking bus markers`.

### Task 13: Data Koridor (baca), Semua Unit (baca), Rekomendasi, dan detail perhitungan

**File:**
- Buat: `web/src/app/(app)/data-koridor/page.tsx`, `web/src/app/(app)/data-koridor/unit/page.tsx`
- Buat: `web/src/app/(app)/rekomendasi/page.tsx`
- Buat di `web/src/components/recommendation/`: `hero.tsx`, `ranking-list.tsx`, `why-panel.tsx`, `impact-table.tsx`, `weights-panel.tsx`, `calculation-panel.tsx` (tab Matriks, Normalisasi, Hasil, Uji sensitivitas)
- Tes: `web/e2e/read-pages.spec.ts`

**Antarmuka:**
- Memakai: `listCorridors`, `listBuses`, `listAudit`, `getRecommendation`, `getCalculation`.
- Tombol tulis (Tambah Koridor, Impor Data, Setujui & Buat Laporan) sudah dirender di sini, tetapi masih nonaktif dengan tooltip peran (lihat tabel peran di spesifikasi bagian 5). Fungsinya disambungkan di Task 15, 16, dan 18.

- [ ] **Langkah 1:** tulis tes e2e gagal:
  - **Data Koridor:**
    - baris total "94,9 km", "121", "48", "2.090", "80,4%", "23,6 mnt", "81/bln", "0,51"
    - pencarian "kenj" → hanya A3
    - riwayat memuat "Panjang trayek A4 diperbarui menjadi 24,0 km"
  - **Semua Unit:** 48 baris, filter Perawatan → 2.
  - **Rekomendasi:**
    - hero "Tambah 7 unit armada"
    - "48 → 55", "−2,8 mnt"
    - A2 dan A3 memiliki penanda "Dekat batas"
    - "Kenapa A4 paling perlu?" memuat "rata-rata 418/hari"
    - "Atur Faktor" membuka `/pengaturan`
  - **Detail perhitungan:** "Lihat detail perhitungan" membuka panel. Tab Hasil menampilkan V A4 "0,9667", dan tab Uji sensitivitas memuat 6 baris dengan S4 "74 / 74".
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan sesuai `design/screens/03-data-koridor.png` dan `04-rekomendasi-armada.png`. Halaman Semua Unit dan panel perhitungan tidak punya desain Figma, jadi buat dengan komponen yang sama. **Langkah 4:** PASS. **Langkah 5:** commit `feat(ui): corridor data, unit list, recommendation and calculation detail`.
- [ ] **Langkah 6:** `git push`.

## Fase 4: Halaman tulis

### Task 14: Pengaturan (SAW live), sinkron, preferensi notifikasi

**File:**
- Ubah: `web/src/server/services/settings.ts` (tambah `updateSettings`, `resetDefaultSettings`, `DEFAULT_SETTINGS`, `settingsSchema`)
- Buat: `web/src/server/services/sync.ts`
- Buat: `web/src/app/api/v1/settings/route.ts` (GET, PUT), `.../settings/preview/route.ts` (POST), `.../settings/reset-default/route.ts` (POST), `.../sync/route.ts` (POST), `.../me/notification-prefs/route.ts` (PUT)
- Buat: `web/src/app/(app)/pengaturan/page.tsx`
- Buat di `web/src/components/settings/`: `weights-form.tsx`, `preview-panel.tsx`, `spm-form.tsx`, `category-bounds.tsx`, `data-sources.tsx`, `notification-prefs.tsx`
- Tes: `web/tests/integration/settings.test.ts`, `web/e2e/settings.spec.ts`

**Antarmuka:**
- Menghasilkan:
  - `settingsSchema` (zod) dengan aturan:
    - bobot bilangan bulat 0–100 dan Σ = 100 (`fields.weights` "Total bobot harus 100%")
    - 0 < pantauMin < perluMin < sangatPerluMin ≤ 100
    - rentang unit min ≤ max, bilangan bulat 0–8
    - idealMin < idealMax < critical ≤ 100
    - jam sibuk HH:MM dengan start < end
  - `PUT /settings` (planner) menyimpan, menulis audit, dan mengisi `updatedByLabel` = nama pengguna.
  - `POST /settings/preview` (planner) dengan body `{ weights }` → `{ items: RecItem[], sameAsActive: boolean, totalUnits }`. Total ≠ 100 → 422 untuk penyimpanan, tetapi pratinjau tetap dihitung dengan bobot yang dinormalisasi dan mengembalikan `warning: 'TOTAL_NOT_100'`.
  - `POST /sync` (planner) memperbarui `data_sources.lastSyncAt = now()` dan menulis audit "Sinkronisasi manual oleh {nama}".

- [ ] **Langkah 1:** tulis tes gagal:
  - Kabid atau admin_depo melakukan PUT → 403.
  - Bobot 30/20/20/15/10/10 (Σ110) → 422 dengan `fields.weights`.
  - **Fokus Review #5:** perluMin 85 dengan sangatPerluMin 80 → 422 `fields.perluMin`.
  - PUT bobot 35/17/17/13/9/9 (setara S2 dengan persen bulat) → `getRecommendation` memberi urutan [A4, A1, A3, A2, A5] dan skor [97, 87, 72, 70, 45].
  - Preview tidak mengubah DB.
  - reset-default mengembalikan 25/20/20/15/10/10.
  - E2E (planner):
    - mengubah bobot "Keterhubungan transit" ke 20 → total menjadi 110%, tombol Simpan nonaktif, dan pesan "Total bobot harus 100%" muncul
    - mengubah "Armada per km rute" ke 0 (bobot 25/20/20/15/0/20) → total kembali 100%, lalu dalam 1 detik pratinjau menukar A2 dan A3 (A2 0,7123 > A3 0,7103) dan tidak lagi menampilkan "Urutan sama dengan rekomendasi aktif"
    - Simpan → halaman Rekomendasi menampilkan bobot 20% untuk Keterhubungan transit
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan sesuai `design/screens/06-pengaturan.png`. Pratinjau memakai debounce 300 ms. Untuk peran non-planner, semua input nonaktif dengan tooltip. **Langkah 4:** PASS. **Langkah 5:** commit `feat(settings): live SAW weights, SPM thresholds, categories, sync and notification prefs`.

### Task 15: CRUD koridor dan unggah KML

**File:**
- Ubah: `web/src/server/services/corridors.ts` (tambah `createCorridor`, `updateCorridor`, `deleteCorridor`, `corridorInputSchema`)
- Buat: `web/src/app/api/v1/corridors/route.ts` (POST), `.../corridors/[id]/route.ts` (PATCH, DELETE), `.../corridors/route-file/route.ts` (POST multipart)
- Buat: `web/src/components/corridors/corridor-form-modal.tsx`, `web/src/components/corridors/delete-corridor-dialog.tsx`
- Tes: `web/tests/integration/corridors.test.ts`, `web/e2e/corridors.spec.ts`

**Antarmuka:**
- Menghasilkan:
  - `corridorInputSchema` dengan kolom:
    - `code` (format `^[A-Z]\d{1,2}$`)
    - `groupName`, `origin`, `destination` (masing-masing ≤ 80 karakter)
    - `lengthKm` (0,5–100; menerima koma desimal lewat `parseDecimalId`)
    - `stopCount` (1–200), `initialUnits` (1–30)
    - `depot`, `startDate`, `serviceHours`
    - `transitLinks` (subset `TRANSIT_OPTIONS`), `routeFileName?`
  - `POST /corridors` (planner) → 201 `{ id, code, name }`. Sekaligus membuat `initialUnits` unit `FD-{nn}-{mm}` berstatus `cadangan` dengan keterangan "Persiapan operasi {startDate}", lalu menulis audit. Kode duplikat → 409 `CORRIDOR_CODE_TAKEN`. Koridor ke-11 → 422 `LIMIT_REACHED`.
  - `POST /corridors/route-file` (planner, multipart `file` ≤ 1 MB, `.kml`) → `{ lengthKm, stopCount, fileName }` atau 422 dengan pesan `KmlError`.

- [ ] **Langkah 1:** tulis tes gagal:
  - Membuat A6 (Halte Keputih → Stasiun Gubeng, 14,6 km, 19 halte, 6 unit, 3 moda) → nama "Keputih — Gubeng", 6 unit cadangan, total unit 54, dan A6 masuk `excluded` di rekomendasi November.
  - `lengthKm: "14,6"` diterima.
  - Membuat A1 → 409. Admin_depo POST → 403.
  - PATCH panjang A4 → audit "Panjang trayek A4 diperbarui menjadi 25,0 km".
  - DELETE A6 → unitnya ikut terhapus.
  - Unggah fixture KML → lengthKm ±14,6. Unggah teks biasa → 422.
  - E2E: planner membuka "Tambah Koridor" → mengisi sesuai `03a-tambah-koridor.png` (dengan fixture KML) → panjang dan halte terisi otomatis → "Simpan Koridor" → toast "Koridor A6 ditambahkan" dan baris A6 tampil. Mengosongkan "Titik awal" → galat inline "Wajib diisi".
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan. Modal dipakai untuk tambah maupun ubah; klik baris membuka mode ubah dengan tombol "Hapus Koridor". **Langkah 4:** PASS. **Langkah 5:** commit `feat(corridors): create, edit, delete with KML auto-fill`.

### Task 16: Impor metrik CSV

**File:**
- Buat: `web/src/server/services/metrics.ts`
- Buat: `web/src/app/api/v1/metrics/import/route.ts` (POST multipart), `.../metrics/template/route.ts` (GET CSV)
- Buat: `web/src/components/corridors/import-dialog.tsx`
- Tes: `web/tests/integration/metrics.test.ts`, `web/e2e/import.spec.ts`, fixture `web/tests/fixtures/metrics-a6.csv`

**Antarmuka:**
- Memakai: `parseMetricsCsv` (Task 4).
- Menghasilkan:
  - `importMetrics(rows: MetricsRow[], actor: Session): Promise<{ inserted: number; updated: number }>`: satu transaksi, upsert per (koridor, periode), dengan `fleetUnits` = jumlah unit koridor saat ini.
  - Kode yang tidak dikenal → 422 dengan `{ line, field: 'kode' }`.
  - Template berisi header `METRICS_CSV_HEADER` dan satu baris contoh A6 November.

- [ ] **Langkah 1:** tulis tes gagal:
  - **Fokus Review #1:** setelah membuat A6 seperti di Task 15 (14,6 km, 6 unit, 3 moda), impor CSV berpemisah `;` dengan koma desimal (`A6;2026-11;380;88;22,5;14;84`). Hasil yang diharapkan:
    - rekomendasi November memuat 6 item
    - A6 di peringkat 4 dengan V 0,7326, skor 73, kategori perlu, dekat batas, dan 1 unit
    - totalUnits 8 dan `overCap` false
    - V A4 tetap 0,9667, karena max dan min tiap kolom tidak berubah
    - waktu tunggu A6 tersimpan 22,5, bukan 225
  - E2E `web/e2e/import.spec.ts`: planner menambah A6, lalu mengimpor `web/tests/fixtures/metrics-a6.csv` lewat dialog Impor Data → toast "1 baris diimpor" → halaman Rekomendasi menampilkan A6 di urutan 4.
  - Berkas dengan satu baris rusak → 422, dan tidak ada baris yang tersimpan (jumlah `corridor_metrics` tetap).
  - Berkas > 200 KB → 422. Kabid → 403.
- [ ] **Langkah 2:** pastikan FAIL. **Langkah 3:** implementasikan. Dialog menampilkan daftar galat per baris dan tautan unduh template. **Langkah 4:** PASS. **Langkah 5:** commit `feat(metrics): atomic CSV import with per-row validation`.

### Task 17: Status unit armada (Admin Depo)

**File:**
- Ubah: `web/src/server/services/buses.ts` (tambah `updateBusStatus`)
- Buat: `web/src/app/api/v1/buses/[code]/route.ts` (PATCH)
- Ubah: `web/src/app/(app)/data-koridor/unit/page.tsx` (kontrol status untuk admin_depo)
- Tes: `web/tests/integration/buses.test.ts`, `web/e2e/buses.spec.ts`

**Antarmuka:**
- Menghasilkan: `PATCH /buses/:code` (admin_depo) dengan body `{ status, note?, returnDate? }`.
  - Status `perawatan` wajib menyertakan `note`, dan menambah `operational_events` "{code} masuk bengkel" (waspada).
  - Setiap perubahan menulis audit "Unit {code} berstatus {status} oleh Admin Depo".

- [ ] **Langkah 1:** tulis tes gagal:
  - Admin_depo mengubah FD-02-01 ke perawatan → 200, KPI armada beroperasi 43/48, dan peringatan baru tampil di dashboard.
  - Perawatan tanpa note → 422. Planner → 403.
  - E2E: admin_depo mengubah status dari tabel → chip berubah dan toast tampil.
- [ ] **Langkah 2:** FAIL. **Langkah 3:** implementasikan. **Langkah 4:** PASS. **Langkah 5:** commit `feat(buses): admin depo can update unit status`.
- [ ] **Langkah 6:** `git push`.

## Fase 5: Laporan

### Task 18: Alur laporan (buat, sahkan, kembalikan) dan halaman Laporan

**File:**
- Ubah: `web/src/server/services/reports.ts` (tambah `createPriorityReport`, `approveReport`, `returnReport`, `buildConsiderations`, tipe `ReportSnapshot`)
- Buat: `web/src/domain/report-text.ts` (`buildConsiderations`, `buildSummaryParagraph`; fungsi murni)
- Buat: `web/src/app/api/v1/reports/route.ts` (POST), `.../reports/[id]/approve/route.ts`, `.../reports/[id]/return/route.ts`
- Buat: `web/src/app/(app)/laporan/page.tsx`, `web/src/app/(app)/laporan/arsip/page.tsx`
- Buat di `web/src/components/reports/`: `decision-sheet.tsx` (pratinjau HTML halaman 1), `report-options.tsx`, `report-history.tsx`, `approve-dialog.tsx`, `confirm-create-dialog.tsx`
- Tes: `web/src/domain/report-text.test.ts`, `web/tests/integration/reports.test.ts`, `web/e2e/reports.spec.ts`

**Antarmuka:**
- Memakai: `getRecommendation`, `listReports` (Task 10).
- Menghasilkan:
  ```ts
  type ReportSnapshot =
    | { type: 'prioritas_bulanan'; period; number; date; ranking: RecItem[]; totalUnits; topCode; topScore; criteria; summary: string; considerations: string[]; kpis; matrix; normalized }
    | { type: 'evaluasi_kuartal'; quarter; months: { period; ranking: RecItem[]; kpis }[] }
    | { type: 'simulasi_pembobotan'; period; scenarios: ScenarioResult[] }
  buildConsiderations(input: { metrics: { code; loadPct; waitMin }[]; spm: SpmSettings; complaints: number; prevComplaints: number; periodLabel: string }): string[]
  createPriorityReport(period: string, actor: Session): Promise<{ id: string; number: string }>   // menggantikan laporan 'menunggu' sebelumnya (→ 'arsip', reviewNote "Digantikan oleh {nomor}") dalam transaksi yang sama
  approveReport(id: string, actor: Session): Promise<void>        // hanya dari 'menunggu', selain itu 409
  returnReport(id: string, note: string, actor: Session): Promise<void>
  ```

- [ ] **Langkah 1:** tulis tes gagal:
  - `buildConsiderations` November menghasilkan tepat:
    1. "Kepadatan bus A4 mencapai 95% dan A1 92% pada jam sibuk (batas 90%)."
    2. "Waktu tunggu A3 (30 mnt), A4 (28 mnt), dan A1 (25 mnt) melebihi target SPM 15 menit."
    3. "Keluhan penumpang November 2026 tercatat 81 laporan, naik 12 dari Oktober."
  - Planner POST `{ period: '2026-11' }` → 201 dengan nomor "551.2/895/436.7.14/2026", dan laporan 894 menjadi `arsip`.
  - **Fokus Review #2:** dua POST paralel (`Promise.all`) → tepat satu laporan `menunggu` untuk November, dan keduanya tidak mengembalikan 500.
  - Kabid approve → `disahkan` dengan `approvedAt` terisi. Approve kedua → 409. Planner approve → 403.
  - Return tanpa catatan → 422.
  - E2E (urutan berlanjut):
    1. Planner klik "Setujui & Buat Laporan" → dialog konfirmasi meringkas "+7 unit untuk 3 koridor" → Konfirmasi → diarahkan ke `/laporan`, status "Menunggu pengesahan".
    2. Logout, login sebagai kabid → klik "Sahkan" → status "Disahkan", dan kolom tanda tangan memuat "Disahkan secara elektronik" serta "Ir. H. Arif Sunaryo, M.T.".
    3. Semua Arsip → "Sudah disahkan" bertambah 1. Mencari "zzz" → empty state "Tidak ada dokumen yang cocok".
- [ ] **Langkah 2:** FAIL. **Langkah 3:** implementasikan sesuai `design/screens/05-laporan.png` dan `05a-laporan-semua-arsip.png`.
  - Subjudul halaman Laporan menjadi "… siap disahkan Kepala Bidang".
  - Halaman Laporan menampilkan laporan prioritas terbaru untuk periode terpilih, atau `?id=`. Jika belum ada, tampilkan empty state dengan tautan ke Rekomendasi.
  - "Kirim Email" nonaktif dengan tooltip "Tidak tersedia di demo".
- [ ] **Langkah 4:** PASS. **Langkah 5:** commit `feat(reports): create, approve and return decision reports with archive`.

### Task 19: Dokumen PDF dan XLSX

**File:**
- Buat di `web/src/documents/`: `pdf/fonts.ts` (Poppins TTF dari `web/public/fonts`), `pdf/priority-report.tsx`, `pdf/quarterly-report.tsx`, `pdf/simulation-report.tsx`, `pdf/summary.tsx`, `pdf/attachments.tsx`, `render.ts`, `xlsx.ts`
- Buat: `web/src/app/api/v1/reports/[id]/file/route.ts`, `web/src/app/api/v1/dashboard/summary.pdf/route.ts`
- Tes: `web/tests/integration/documents.test.ts`, `web/e2e/documents.spec.ts` (kabid klik "Unduh Laporan (PDF)" → unduhan bernama `Prioritas-November-2026.pdf` dan berukuran lebih dari 10 KB)

**Antarmuka:**
- Memakai: `ReportSnapshot` (Task 18), `getDashboard`, `getMapData`.
- Menghasilkan:
  ```ts
  type Attachment = 'perhitungan' | 'ringkasan' | 'peta' | 'pengesahan'
  renderReportPdf(r: ReportDetail, attachments: Attachment[]): Promise<Buffer>
  renderReportXlsx(r: ReportDetail): Promise<Buffer>   // sheet: Ringkasan, Matriks, Normalisasi, Peringkat (atau per jenis)
  renderSummaryPdf(d: DashboardData): Promise<Buffer>
  ```
  - `GET /reports/:id/file?format=pdf|xlsx&lampiran=perhitungan,ringkasan&inline=1`. Nama berkas `Prioritas-November-2026.pdf`. Dengan `inline=1`, header `Content-Disposition: inline` dipakai untuk tombol Cetak.
  - Lampiran "peta" berupa tabel status koridor dan halte tersibuk, bukan gambar peta.

- [ ] **Langkah 1:** tulis tes gagal:
  - PDF laporan November diawali `%PDF`, dan teks hasil ekstraksi (pakai `unpdf` sebagai devDependency) memuat "551.2/894/436.7.14/2026" dan "97".
  - XLSX dibaca ulang dengan exceljs: sheet "Peringkat" sel V untuk A4 = 0,9667 (4 desimal). Sheet "Normalisasi" A1/C5 = 0,8889.
  - Format tidak dikenal → 422.
  - Tiap jenis arsip (evaluasi, simulasi) menghasilkan PDF valid.
  - `summary.pdf` → 200 `application/pdf`.
- [ ] **Langkah 2:** FAIL. **Langkah 3:** implementasikan, lalu sambungkan tombol Unduh, Cetak, dan pilihan lampiran di halaman Laporan, aksi unduh di Semua Arsip, dan "Unduh Ringkasan" di Dashboard. **Langkah 4:** PASS. Buka satu PDF dan periksa secara visual bahwa kop, tabel, dan kolom pengesahan rapi. **Langkah 5:** commit `feat(documents): PDF and XLSX for reports, archive and dashboard summary`.
- [ ] **Langkah 6:** `git push`.

## Fase 6: Kualitas dan rilis

### Task 20: Endpoint reset cron

**File:**
- Buat: `web/src/app/api/cron/reset/route.ts`, `web/vercel.json`
- Tes: `web/tests/integration/cron.test.ts`

**Antarmuka:**
- Memakai: `resetDemoData` (Task 6).
- `GET /api/cron/reset` dengan `Authorization: Bearer ${CRON_SECRET}` → 200 `{ ok: true, resetAt }`. Tanpa header atau dengan header salah → 401.
- `vercel.json`: `{ "crons": [{ "path": "/api/cron/reset", "schedule": "0 17 * * *" }] }`.

- [ ] **Langkah 1:** tulis tes gagal: ubah bobot dan tambah A6, panggil reset dengan secret yang benar → bobot kembali default dan A6 hilang. Secret salah → 401 dan data tidak berubah.
- [ ] **Langkah 2:** FAIL. **Langkah 3:** implementasikan. **Langkah 4:** PASS. **Langkah 5:** commit `feat(ops): daily demo reset cron`.

### Task 21: CI GitHub Actions

**File:**
- Buat: `.github/workflows/web.yml` di root repo, dengan `paths: ['web/**']` dan `working-directory: web`

**Antarmuka:**
- Job `test`: layanan `postgres:16` (port 5432, database `wirawiri_test` dan `wirawiri_e2e`), Node LTS, `npm ci`, lalu berurutan lint, typecheck, test:unit, test:int, `npx playwright install --with-deps chromium`, build, test:e2e. Laporan Playwright diunggah sebagai artefak jika gagal.

- [ ] **Langkah 1:** tulis workflow.
- [ ] **Langkah 2:** push branch, lalu cek dengan `gh run watch`. Hasil yang diharapkan: semua langkah hijau.
- [ ] **Langkah 3:** jika merah, perbaiki penyebabnya (bukan menonaktifkan langkahnya), lalu commit `ci(web): lint, typecheck, unit, integration and e2e on push`.

### Task 22: Pemeriksaan visual terhadap desain

**File:**
- Buat: `web/e2e/visual.spec.ts` (memotret 11 tampilan pada 1280 px ke `web/test-results/visual/`)
- Buat: `web/scripts/visual-compare.ts` (menyusun gambar berdampingan dengan `design/screens/*.png` ke `web/test-results/visual/compare/`)

- [ ] **Langkah 1:** jalankan `npx playwright test visual` dan `npx tsx scripts/visual-compare.ts`. Periksa 11 gambar berdampingan.
- [ ] **Langkah 2:** perbaiki selisih yang terlihat (jarak, ukuran huruf, warna, teks) sampai tiap halaman setara dengan desain. Catat perbedaan yang disengaja di `web/README.md` bagian "Perbedaan dari Figma", yaitu: panel akun demo, banner demo, halaman Semua Unit, panel detail perhitungan, tombol Sahkan dan Kembalikan, penanda dekat batas, dan dialog konfirmasi.
- [ ] **Langkah 3:** commit `test(visual): screenshot comparison against Figma exports`.

### Task 23: Dokumentasi

**File:**
- Buat: `web/README.md` dengan bagian:
  - fitur
  - arsitektur (diagram lapisan dari spesifikasi)
  - tabel endpoint API (metode, path, peran)
  - menjalankan lokal (`docker compose up -d`, `cp .env.example .env.local`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`)
  - pengujian
  - perbedaan dari Figma
  - stack beserta versi
- Ubah: `README.md` root. Tambahkan bagian "Live demo" di bawah judul (link diisi di Task 24) beserta tabel akun demo, ringkasan stack, dan bagian "Repository structure" yang memuat `web/`.

- [ ] **Langkah 1:** tulis keduanya. Pastikan setiap endpoint di `src/app/api/v1/**/route.ts` ada di tabel API (cek dengan `find src/app/api -name route.ts`).
- [ ] **Langkah 2:** commit `docs(web): README with architecture, API table and local setup`, lalu `git push`.

### Task 24: Deploy (Supabase + Vercel) dan rilis

**File:**
- Ubah: `README.md` (link demo live)

- [ ] **Langkah 1:** **minta persetujuan pengguna** sebelum membuat proyek Supabase (region Singapura `ap-southeast-1`, free tier) dan proyek Vercel. Jangan lanjut tanpa jawaban "ya".
- [ ] **Langkah 2:** buat proyek Supabase lewat MCP Supabase. Ambil dua connection string: *session pooler* (5432, untuk migrasi) dan *transaction pooler* (6543, untuk aplikasi).
- [ ] **Langkah 3:** dari lokal jalankan `DATABASE_URL=<session> npm run db:migrate`, lalu `npm run db:seed`. Verifikasi dengan `select count(*) from reports` = 24.
- [ ] **Langkah 4:** buat proyek Vercel dari repo GitHub yang sudah ada dengan Root Directory `web`. Jika Vercel meminta otorisasi GitHub manual, berikan instruksi langkah demi langkah ke pengguna. Set env `DATABASE_URL` (transaction pooler), `SESSION_SECRET` dan `CRON_SECRET` (`openssl rand -base64 32`) untuk Production.
- [ ] **Langkah 5:** merge ke `main`: `git checkout main && git pull --ff-only && git merge --ff-only feat/web-app && git push origin main`. Jika fast-forward gagal, rebase `feat/web-app` ke `main` lalu ulangi.
- [ ] **Langkah 6:** tunggu deploy selesai. Jalankan smoke test ke URL produksi dengan `BASE_URL=<url> npx playwright test login dashboard`, lalu cek bahwa cron "reset" terdaftar di dashboard Vercel.
- [ ] **Langkah 7:** isi link demo di README root, commit `docs: add live demo link`, lalu push ke `main`.
