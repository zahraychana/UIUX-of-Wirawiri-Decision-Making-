/*
 * WiraWiri Feeder Suroboyo · data simulasi + metode SAW (Simple Additive Weighting)
 *
 * File ini tidak menyentuh tampilan. app.js memanggil fungsi di sini setiap kali
 * bobot atau data berubah, jadi semua angka di layar berasal dari rumus yang sama.
 * Nilainya sama dengan analysis/saw-wirawiri.xlsx dan laporan (Tabel VII-IX).
 *
 * Cek cepat di terminal:
 *   node -e "const S=require('./saw.js'); console.log(S.evaluate(S.CORRIDORS, S.defaultWeights()).ranked.map(r => r.code + ' ' + r.score))"
 */
(function (root) {
  'use strict';

  // Enam kriteria. Bobot dalam persen; type menentukan arah normalisasi.
  const CRITERIA = [
    { code: 'C1', key: 'passengers', name: 'Jumlah penumpang', hint: 'Rata-rata penumpang per hari', head: 'Penumpang', type: 'benefit', weight: 25 },
    { code: 'C2', key: 'load', name: 'Kepadatan bus', hint: 'Isi bus saat jam sibuk', head: 'Kepadatan', type: 'benefit', weight: 20 },
    { code: 'C3', key: 'wait', name: 'Waktu tunggu', hint: 'Rata-rata menunggu di halte', head: 'Tunggu', type: 'benefit', weight: 20 },
    { code: 'C4', key: 'complaints', name: 'Keluhan penumpang', hint: 'Laporan warga per bulan', head: 'Keluhan', type: 'benefit', weight: 15 },
    { code: 'C5', key: 'fleetPerKm', name: 'Armada per km rute', hint: 'Unit dibanding panjang rute', head: 'Armada/km', type: 'cost', weight: 10 },
    { code: 'C6', key: 'transit', name: 'Keterhubungan transit', hint: 'Moda lain yang terhubung', head: 'Transit', type: 'benefit', weight: 10 },
  ];

  // Tingkat kebutuhan, dari batas tertinggi. extra = usulan tambahan unit per kategori.
  const CATEGORIES = [
    { min: 80, label: 'Sangat perlu', tone: 'red', note: 'Usulan +2 hingga +4 unit' },
    { min: 72, label: 'Perlu', tone: 'amber', note: 'Usulan +1 unit' },
    { min: 55, label: 'Pantau', tone: 'blue', note: 'Dipantau, tanpa tambahan' },
    { min: 0, label: 'Belum perlu', tone: 'green', note: 'Layanan sesuai target' },
  ];

  // Standar pelayanan minimal (SPM) dan batas lain dari layar Pengaturan.
  const SETTINGS = {
    borderline: 3,        // skor sejauh ini dari batas kategori ditandai "perlu ditinjau"
    waitMax: 15,          // menit
    onTimeMin: 85,        // persen
    loadIdeal: [70, 75],  // persen
    loadCritical: 90,     // persen
    maxExtraUnits: 8,     // unit per bulan
    peak: '06.30 – 08.30',
  };

  // Data simulasi rata-rata November 2026 (sheet Data di workbook).
  const CORRIDORS = [
    { code: 'A1', name: 'Benowo — TP', from: 'Terminal Benowo', to: 'Tunjungan Plaza', group: 'Koridor Barat – Pusat', depot: 'Depo Benowo',
      km: 22.2, stops: 24, units: 10, active: 9, onTime: 82, passengers: 520, load: 92, wait: 25, complaints: 18, transit: 5, nextStop: 'Tunjungan Plaza', eta: 4 },
    { code: 'A2', name: 'Puspa Agro — DTC', from: 'Puspa Agro', to: 'DTC Wonokromo', group: 'Koridor Sidoarjo – Selatan', depot: 'Depo Joyoboyo',
      km: 13.3, stops: 18, units: 8, active: 8, onTime: 88, passengers: 410, load: 85, wait: 20, complaints: 12, transit: 4, nextStop: 'DTC Wonokromo', eta: 6 },
    { code: 'A3', name: 'Sungkono — Kenjeran', from: 'Mayjend Sungkono', to: 'Kenjeran Park', group: 'Koridor Timur – Barat', depot: 'Depo Kenjeran',
      km: 22.5, stops: 31, units: 9, active: 8, onTime: 79, passengers: 300, load: 70, wait: 30, complaints: 20, transit: 3, nextStop: 'Kenjeran Park', eta: 11 },
    { code: 'A4', name: 'Bratang — Joyoboyo', from: 'Bratang', to: 'TIJ Joyoboyo', group: 'Koridor Intermoda Pusat', depot: 'Depo Joyoboyo',
      km: 24.0, stops: 22, units: 12, active: 11, onTime: 76, passengers: 610, load: 95, wait: 28, complaints: 25, transit: 5, nextStop: 'Stasiun Gubeng', eta: 3 },
    { code: 'A5', name: 'Joyoboyo — Lakarsantri', from: 'TIJ Joyoboyo', to: 'Lakarsantri', group: 'Koridor Barat Daya', depot: 'Depo Joyoboyo',
      km: 12.9, stops: 26, units: 9, active: 8, onTime: 94, passengers: 250, load: 60, wait: 15, complaints: 6, transit: 2, nextStop: 'TIJ Joyoboyo', eta: 7 },
  ];

  const round = (x, d = 0) => { const f = 10 ** d; return Math.round((x + Number.EPSILON) * f) / f; };
  const defaultWeights = () => CRITERIA.map(k => k.weight);

  // C5 dihitung dari unit ÷ panjang rute, dibulatkan 2 desimal seperti yang tampil di aplikasi.
  const fleetPerKm = c => round(c.units / c.km, 2);
  const value = (c, k) => (k.key === 'fleetPerKm' ? fleetPerKm(c) : c[k.key]);

  function category(score, cats = CATEGORIES) {
    return cats.find(k => score >= k.min) || cats[cats.length - 1];
  }

  // Batas kategori terdekat bila skor berada dalam margin, selain itu null.
  function nearBoundary(score, cats = CATEGORIES, margin = SETTINGS.borderline) {
    const b = cats.map(k => k.min).filter(m => m > 0).find(m => Math.abs(score - m) <= margin);
    return b === undefined ? null : b;
  }

  // Inti SAW. weights boleh dalam persen atau pecahan; selalu dinormalkan agar totalnya 1.
  function evaluate(corridors, weights, opts = {}) {
    const cats = opts.categories || CATEGORIES;
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    const w = weights.map(x => x / total);
    const raw = corridors.map(c => CRITERIA.map(k => value(c, k)));
    // Langkah 2: pembanding tiap kriteria (maks untuk benefit, min untuk cost)
    const bench = CRITERIA.map((k, j) => {
      const col = raw.map(r => r[j]);
      return k.type === 'cost' ? Math.min(...col) : Math.max(...col);
    });
    const avg = CRITERIA.map((k, j) => raw.reduce((s, r) => s + r[j], 0) / raw.length);
    const rows = corridors.map((c, i) => {
      const r = raw[i].map((x, j) => (CRITERIA[j].type === 'cost' ? bench[j] / x : x / bench[j]));
      const pts = r.map((x, j) => x * w[j] * 100);           // Langkah 3: kontribusi dalam poin
      const V = r.reduce((s, x, j) => s + x * w[j], 0);       // V = Σ (bobot × nilai 0-1)
      const score = Math.round(V * 100 + 1e-9);                // Langkah 4: skor 0-100
      return { code: c.code, corridor: c, raw: raw[i], r, pts, V, score,
        category: category(score, cats), near: nearBoundary(score, cats, opts.margin ?? SETTINGS.borderline) };
    });
    const ranked = rows.slice().sort((a, b) => b.V - a.V);
    ranked.forEach((row, i) => { row.rank = i + 1; });
    allocate(ranked, cats, opts.maxExtraUnits ?? SETTINGS.maxExtraUnits);
    return { weights: w, bench, avg, rows, ranked, totalUnits: ranked.reduce((s, r) => s + r.units, 0) };
  }

  // Aturan usulan unit untuk prototype. Di model asli ini masukan analis (sheet Ranking).
  // Kategori tertinggi: +4 bila skor ≥ 90, selain itu +2. Kategori kedua: +1. Lainnya 0.
  // Total dibatasi "tambahan armada maksimal". Kelebihan dipotong dulu dari jatah terbesar
  // (tanpa turun di bawah minimum kategorinya: 2 dan 1), baru dari peringkat terbawah.
  function allocate(ranked, cats, max) {
    const minOf = row => { const i = cats.indexOf(row.category); return i === 0 ? 2 : i === 1 ? 1 : 0; };
    ranked.forEach(row => {
      const idx = cats.indexOf(row.category);
      row.units = idx === 0 ? (row.score >= 90 ? 4 : 2) : idx === 1 ? 1 : 0;
      row.needed = row.units;
    });
    let total = ranked.reduce((s, r) => s + r.units, 0);
    while (total > max) {
      const above = ranked.filter(r => r.units > minOf(r));
      const pick = above.length
        ? above.reduce((a, b) => (b.units >= a.units ? b : a))         // jatah terbesar, peringkat lebih bawah bila sama
        : ranked.slice().reverse().find(r => r.units > 0);              // anggaran sangat kecil: potong dari bawah
      if (!pick) break;
      pick.units--; total--;
    }
  }

  // Perkiraan dampak: waktu tunggu dan kepadatan turun sebanding unit aktif.
  function impact(c, add) {
    const f = c.active / (c.active + add);
    return { wait: c.wait * f, load: c.load * f };
  }

  // Status layanan terhadap SPM: 0 normal, 1 waspada, 2 kritis.
  function status(c, s = SETTINGS) {
    const waitLevel = c.wait <= s.waitMax ? 0 : c.wait <= s.waitMax + 5 ? 1 : 2;
    const loadLevel = c.load <= s.loadIdeal[1] ? 0 : c.load < s.loadCritical ? 1 : 2;
    const level = Math.max(waitLevel, loadLevel);
    return { level, waitLevel, loadLevel, label: ['Normal', 'Waspada', 'Kritis'][level], tone: ['green', 'amber', 'red'][level] };
  }

  // Uji kestabilan: satu bobot diubah, bobot lain diskalakan agar total tetap 100%.
  const SCENARIOS = [
    { code: 'S0', label: 'Bobot dasar (aktif)' },
    { code: 'S1', label: 'Semua bobot sama (16,7%)', equal: true },
    { code: 'S2', label: 'Penumpang jadi 35%', k: 0, to: 0.35 },
    { code: 'S3', label: 'Waktu tunggu jadi 30%', k: 2, to: 0.30 },
    { code: 'S4', label: 'Keluhan tidak dihitung', k: 3, to: 0 },
    { code: 'S5', label: 'Armada/km jadi 20%', k: 4, to: 0.20 },
  ];

  function rescale(w, k, to) {
    if (w[k] >= 1) return w.map((_, j) => (j === k ? to : (1 - to) / (w.length - 1)));
    return w.map((x, j) => (j === k ? to : x * (1 - to) / (1 - w[k])));
  }

  function sensitivity(corridors, weights, opts = {}) {
    const base = evaluate(corridors, weights, opts);
    const order = base.ranked.map(r => r.code).join();
    return SCENARIOS.map(s => {
      const w = s.equal ? base.weights.map(() => 1 / base.weights.length)
        : s.k === undefined ? base.weights : rescale(base.weights, s.k, s.to);
      const e = evaluate(corridors, w, opts);
      const byCode = Object.fromEntries(e.rows.map(r => [r.code, r]));
      const changed = base.rows.filter(r => byCode[r.code].category !== r.category).map(r => r.code);
      return { ...s, weights: w, result: e, byCode, sameOrder: e.ranked.map(r => r.code).join() === order, changed };
    });
  }

  const api = { CRITERIA, CATEGORIES, SETTINGS, CORRIDORS, SCENARIOS, round, defaultWeights, fleetPerKm, value,
    category, nearBoundary, evaluate, allocate, impact, status, rescale, sensitivity };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SAW = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
