/*
 * WiraWiri Feeder Suroboyo · prototype alur UX
 *
 * Isi file ini: tampilan tiap layar, perpindahan halaman, dan interaksi.
 * Semua angka SAW diambil dari saw.js, jadi saat bobot digeser di Pengaturan,
 * urutan di Rekomendasi Armada, Detail Perhitungan, Dashboard, dan Laporan ikut berubah.
 *
 * Susunan:
 *   1. Utilitas & ikon      4. Komponen kecil       7. Overlay (drawer & modal)
 *   2. Konten simulasi      5. Halaman (9 layar)    8. Aksi & event
 *   3. State                6. Pengaturan (live)    9. Router
 */
(function () {
  'use strict';
  const S = window.SAW;

  /* ================================================================ 1. Utilitas & ikon */
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NF = {};
  const num = (x, d = 0) => (NF[d] || (NF[d] = new Intl.NumberFormat('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }))).format(x);
  const sum = a => a.reduce((s, x) => s + x, 0);
  const avg = a => (a.length ? sum(a) / a.length : 0);
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const listID = a => (a.length < 2 ? a.join('') : a.length === 2 ? `${a[0]} dan ${a[1]}` : `${a.slice(0, -1).join(', ')}, dan ${a[a.length - 1]}`);
  const nowHM = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONTH = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const fmtDate = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MON[m - 1]} ${y}`; };
  const parseNum = v => parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));

  const ICONS = {
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z"/><path d="M9 4v14M15 6v14"/>',
    database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13"/><path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
    list: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4.5 5.5 6 4.5V8M4.3 10.8a1.2 1.2 0 0 1 2.2.7c0 .8-2.2 1.8-2.2 2.5h2.3M4.3 16.6h2.1l-1.2 1.3a1 1 0 1 1-.9 1.4"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3l1.6 2.3 2.7-.6.6 2.7L19.2 9 18.2 12l1 3-2.3 1.6-.6 2.7-2.7-.6L12 21l-1.6-2.3-2.7.6-.6-2.7L4.8 15l1-3-1-3 2.3-1.6.6-2.7 2.7.6z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    'chev-down': '<path d="m6 9 6 6 6-6"/>',
    'chev-right': '<path d="m9 6 6 6-6 6"/>',
    'chev-left': '<path d="m15 6-6 6 6 6"/>',
    bell: '<path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    bus: '<rect x="4" y="3.5" width="16" height="14" rx="3"/><path d="M4 10.5h16M8 17.5V20M16 17.5V20"/><path d="M7.5 14h.01M16.5 14h.01"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    gauge: '<path d="M4 17a8.5 8.5 0 1 1 16 0"/><path d="m12 13 4-4"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    bars: '<path d="M4 4v16h16"/><path d="M8.5 16v-5M12.5 16V8M16.5 16v-3"/>',
    hbars: '<path d="M4 4v16h16"/><path d="M8 8h8M8 12h5M8 16h10"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M10.3 4.3 2.7 17.5A2 2 0 0 0 4.4 20.5h15.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17h.01"/>',
    message: '<path d="M4 5h16v11H9l-5 4z"/><path d="M12 8.5v3M12 13.5h.01"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    'arrow-up': '<path d="M12 19V5M6 11l6-6 6 6"/>',
    'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 15V4M7 9l5-5 5 5M5 20h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.4L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 13a8 8 0 0 0 14.6 4.4L20 15.5"/><path d="M20 20v-4.5h-4.5"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5"/><path d="M3.5 4v4.5H8"/><path d="M12 8v4l3 2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'check-circle': '<circle cx="12" cy="12" r="8.5"/><path d="m8 12.2 2.8 2.8L16 9.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M3 3l18 18M10.6 6a9.6 9.6 0 0 1 1.4-.1c6 0 9.5 6.1 9.5 6.1a16 16 0 0 1-2.6 3.3M6.6 6.6A16 16 0 0 0 2.5 12S6 18.5 12 18.5c1.7 0 3.2-.5 4.5-1.2"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    more: '<path d="M6 12h.01M12 12h.01M18 12h.01" stroke-width="3"/>',
    folder: '<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    archive: '<rect x="3" y="4" width="18" height="4.5" rx="1"/><path d="M5 8.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5M10 12.5h4"/>',
    printer: '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    lock: '<rect x="4.5" y="11" width="15" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    login: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l4 4-4 4M14 12H3"/>',
    logout: '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M14 8l4 4-4 4M18 12H8"/>',
    pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H16a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h7.5"/>',
    ticket: '<path d="M4 6.5h16v3.5a2 2 0 0 0 0 4v3.5H4V14a2 2 0 0 0 0-4z"/><path d="M14.5 6.5v11" stroke-dasharray="2 2.2"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 7.9-7.5 9.5-4.3-1.6-7.5-4.9-7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
    sigma: '<path d="M17 5H7l6 7-6 7h10"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',
    crosshair: '<circle cx="12" cy="12" r="7"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2-2.4 3.5M12 17h.01"/>',
    activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
    clipboard: '<rect x="5" y="4.5" width="14" height="16.5" rx="2.5"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    sunrise: '<path d="M4 18h16M6.5 18a5.5 5.5 0 0 1 11 0M12 3v6M9 6l3-3 3 3M3.5 13l1.5 1M20.5 13 19 14"/>',
    save: '<path d="M5 4h11.5L19 6.5V20H5z"/><path d="M8 4v5h7V4M8 20v-6.5h8V20"/>',
    building: '<path d="M4 20V8l8-4 8 4v12"/><path d="M8 20v-6h8v6M8 10h8"/>',
    file2: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  };
  const ic = (n, s = 18, extra = '') => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICONS[n] || ''}</svg>`;

  function hydrateIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach(el => {
      const svg = ic(el.dataset.icon, +(el.dataset.size || 20));
      if (el.tagName === 'I') { const t = document.createElement('template'); t.innerHTML = svg; el.replaceWith(t.content.firstChild); }
      else el.innerHTML = svg;
      el.removeAttribute('data-icon');
    });
  }

  function toast(msg, ok = false) {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast' + (ok ? ' ok' : '');
    el.innerHTML = `${ic(ok ? 'check-circle' : 'info', 18)}<span>${msg}</span>`;
    box.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  }

  // Unduh CSV (pemisah titik koma, cocok untuk Excel berbahasa Indonesia).
  function downloadCSV(name, rows) {
    const cell = v => { const s = String(v ?? ''); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const blob = new Blob(['﻿' + rows.map(r => r.map(cell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // Aset dari desain Figma: logo Dishub (terang & gelap) dan ilustrasi login (frame 2).
  const LOGO_LIGHT = 'data:image/png;base64,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';
  const LOGO_DARK = 'data:image/png;base64,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';
  const LOGIN_ART = () => `<svg class="login-svg" viewBox="0 0 600 820" fill="none" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Bus WiraWiri tiba di peta rute. Layanan untuk tracking feeder WiraWiri"><defs><filter id="filter0_d_2075_178" x="710" y="128" width="460" height="552" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix" />
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
<feOffset dy="4" />
<feGaussianBlur stdDeviation="5" />
<feComposite in2="hardAlpha" operator="out" />
<feColorMatrix type="matrix" values="0 0 0 0 0.06 0 0 0 0 0.18 0 0 0 0 0.31 0 0 0 0.07 0" />
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2075_178" />
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2075_178" result="shape" />
</filter>
<linearGradient id="paint0_linear_2075_178" x1="0" y1="0" x2="0" y2="820" gradientUnits="userSpaceOnUse">
<stop stop-color="#F7FAFE" />
<stop offset="1" stop-color="#EBF1F9" />
</linearGradient>
<linearGradient id="paint1_linear_2075_178" x1="0" y1="0" x2="546.797" y2="666.826" gradientUnits="userSpaceOnUse">
<stop stop-color="#2F64A0" />
<stop offset="0.45" stop-color="#1E4B78" />
<stop offset="1" stop-color="#081C31" />
</linearGradient>
<linearGradient id="paint2_linear_2075_178" x1="52" y1="328" x2="52" y2="456" gradientUnits="userSpaceOnUse">
<stop stop-color="#7FA3C9" />
<stop offset="1" stop-color="#4D79A8" />
</linearGradient>
<linearGradient id="paint3_linear_2075_178" x1="52" y1="316" x2="52" y2="444" gradientUnits="userSpaceOnUse">
<stop stop-color="#F6F9FD" />
<stop offset="1" stop-color="#DDE8F4" />
</linearGradient>
<linearGradient id="paint4_linear_2075_178" x1="106" y1="220" x2="106" y2="350" gradientUnits="userSpaceOnUse">
<stop stop-color="white" />
<stop offset="1" stop-color="#E4ECF5" />
</linearGradient>
<linearGradient id="paint5_linear_2075_178" x1="128" y1="238" x2="147.304" y2="296.601" gradientUnits="userSpaceOnUse">
<stop stop-color="#3A6FA6" />
<stop offset="1" stop-color="#163A60" />
</linearGradient>
<linearGradient id="paint6_linear_2075_178" x1="204" y1="238" x2="223.304" y2="296.601" gradientUnits="userSpaceOnUse">
<stop stop-color="#3A6FA6" />
<stop offset="1" stop-color="#163A60" />
</linearGradient>
<linearGradient id="paint7_linear_2075_178" x1="280" y1="238" x2="299.304" y2="296.601" gradientUnits="userSpaceOnUse">
<stop stop-color="#3A6FA6" />
<stop offset="1" stop-color="#163A60" />
</linearGradient>
<linearGradient id="paint8_linear_2075_178" x1="358" y1="238" x2="419.613" y2="289.344" gradientUnits="userSpaceOnUse">
<stop stop-color="#3A6FA6" />
<stop offset="1" stop-color="#163A60" />
</linearGradient>
<linearGradient id="paint9_linear_2075_178" x1="404" y1="238" x2="430.264" y2="289.589" gradientUnits="userSpaceOnUse">
<stop stop-color="#3A6FA6" />
<stop offset="1" stop-color="#163A60" />
</linearGradient>
<linearGradient id="paint10_linear_2075_178" x1="456" y1="238" x2="489.408" y2="282.544" gradientUnits="userSpaceOnUse">
<stop stop-color="#3A6FA6" />
<stop offset="1" stop-color="#163A60" />
</linearGradient>
<linearGradient id="paint11_linear_2075_178" x1="764" y1="516" x2="779.036" y2="617.779" gradientUnits="userSpaceOnUse">
<stop stop-color="#1E4B78" />
<stop offset="1" stop-color="#0F2D4E" />
</linearGradient>
<path id="stroke0_2075_178" d="M782 476H774C771.239 476 769 478.239 769 481V489C769 491.761 771.239 494 774 494H782C784.761 494 787 491.761 787 489V481C787 478.239 784.761 476 782 476Z" />
</defs><g id="ll-bg"><path d="M600 0H0V820H600V0Z" fill="url(#paint1_linear_2075_178)" />
</g><g id="ll-tagline"><path d="M109.456 540.776H116.624V545H103.984V522.536H109.456V540.776ZM118.146 536.04C118.146 534.205 118.487 532.595 119.17 531.208C119.874 529.821 120.823 528.755 122.018 528.008C123.213 527.261 124.546 526.888 126.018 526.888C127.277 526.888 128.375 527.144 129.314 527.656C130.274 528.168 131.01 528.84 131.522 529.672V527.144H136.994V545H131.522V542.472C130.989 543.304 130.242 543.976 129.282 544.488C128.343 545 127.245 545.256 125.986 545.256C124.535 545.256 123.213 544.883 122.018 544.136C120.823 543.368 119.874 542.291 119.17 540.904C118.487 539.496 118.146 537.875 118.146 536.04ZM131.522 536.072C131.522 534.707 131.138 533.629 130.37 532.84C129.623 532.051 128.706 531.656 127.618 531.656C126.53 531.656 125.602 532.051 124.834 532.84C124.087 533.608 123.714 534.675 123.714 536.04C123.714 537.405 124.087 538.493 124.834 539.304C125.602 540.093 126.53 540.488 127.618 540.488C128.706 540.488 129.623 540.093 130.37 539.304C131.138 538.515 131.522 537.437 131.522 536.072ZM159.193 527.144L147.993 553.48H142.105L146.201 544.392L138.937 527.144H145.049L149.177 538.312L153.273 527.144H159.193ZM160.083 536.04C160.083 534.205 160.425 532.595 161.107 531.208C161.812 529.821 162.761 528.755 163.956 528.008C165.15 527.261 166.483 526.888 167.955 526.888C169.214 526.888 170.313 527.144 171.252 527.656C172.212 528.168 172.948 528.84 173.46 529.672V527.144H178.932V545H173.46V542.472C172.926 543.304 172.18 543.976 171.219 544.488C170.281 545 169.182 545.256 167.924 545.256C166.473 545.256 165.15 544.883 163.956 544.136C162.761 543.368 161.812 542.291 161.107 540.904C160.425 539.496 160.083 537.875 160.083 536.04ZM173.46 536.072C173.46 534.707 173.076 533.629 172.308 532.84C171.561 532.051 170.644 531.656 169.555 531.656C168.467 531.656 167.539 532.051 166.771 532.84C166.025 533.608 165.652 534.675 165.652 536.04C165.652 537.405 166.025 538.493 166.771 539.304C167.539 540.093 168.467 540.488 169.555 540.488C170.644 540.488 171.561 540.093 172.308 539.304C173.076 538.515 173.46 537.437 173.46 536.072ZM193.77 526.952C195.861 526.952 197.525 527.635 198.762 529C200.021 530.344 200.65 532.2 200.65 534.568V545H195.21V535.304C195.21 534.109 194.901 533.181 194.282 532.52C193.664 531.859 192.832 531.528 191.786 531.528C190.741 531.528 189.909 531.859 189.29 532.52C188.672 533.181 188.362 534.109 188.362 535.304V545H182.89V527.144H188.362V529.512C188.917 528.723 189.664 528.104 190.602 527.656C191.541 527.187 192.597 526.952 193.77 526.952ZM203.365 536.04C203.365 534.205 203.706 532.595 204.389 531.208C205.093 529.821 206.042 528.755 207.237 528.008C208.431 527.261 209.765 526.888 211.237 526.888C212.495 526.888 213.594 527.144 214.533 527.656C215.493 528.168 216.229 528.84 216.741 529.672V527.144H222.213V545H216.741V542.472C216.207 543.304 215.461 543.976 214.501 544.488C213.562 545 212.463 545.256 211.205 545.256C209.754 545.256 208.431 544.883 207.237 544.136C206.042 543.368 205.093 542.291 204.389 540.904C203.706 539.496 203.365 537.875 203.365 536.04ZM216.741 536.072C216.741 534.707 216.357 533.629 215.589 532.84C214.842 532.051 213.925 531.656 212.837 531.656C211.749 531.656 210.821 532.051 210.053 532.84C209.306 533.608 208.933 534.675 208.933 536.04C208.933 537.405 209.306 538.493 210.053 539.304C210.821 540.093 211.749 540.488 212.837 540.488C213.925 540.488 214.842 540.093 215.589 539.304C216.357 538.515 216.741 537.437 216.741 536.072ZM237.051 526.952C239.142 526.952 240.806 527.635 242.044 529C243.302 530.344 243.932 532.2 243.932 534.568V545H238.492V535.304C238.492 534.109 238.182 533.181 237.564 532.52C236.945 531.859 236.113 531.528 235.068 531.528C234.022 531.528 233.19 531.859 232.572 532.52C231.953 533.181 231.643 534.109 231.643 535.304V545H226.172V527.144H231.643V529.512C232.198 528.723 232.945 528.104 233.883 527.656C234.822 527.187 235.878 526.952 237.051 526.952ZM272.147 527.144V545H266.675V542.568C266.121 543.357 265.363 543.997 264.403 544.488C263.465 544.957 262.419 545.192 261.267 545.192C259.902 545.192 258.697 544.893 257.651 544.296C256.606 543.677 255.795 542.792 255.219 541.64C254.643 540.488 254.355 539.133 254.355 537.576V527.144H259.795V536.84C259.795 538.035 260.105 538.963 260.723 539.624C261.342 540.285 262.174 540.616 263.219 540.616C264.286 540.616 265.129 540.285 265.747 539.624C266.366 538.963 266.675 538.035 266.675 536.84V527.144H272.147ZM286.958 526.952C289.048 526.952 290.712 527.635 291.95 529C293.208 530.344 293.838 532.2 293.838 534.568V545H288.398V535.304C288.398 534.109 288.088 533.181 287.47 532.52C286.851 531.859 286.019 531.528 284.974 531.528C283.928 531.528 283.096 531.859 282.478 532.52C281.859 533.181 281.55 534.109 281.55 535.304V545H276.078V527.144H281.55V529.512C282.104 528.723 282.851 528.104 283.79 527.656C284.728 527.187 285.784 526.952 286.958 526.952ZM307.592 540.36V545H304.808C302.824 545 301.278 544.52 300.168 543.56C299.059 542.579 298.504 540.989 298.504 538.792V531.688H296.328V527.144H298.504V522.792H303.976V527.144H307.56V531.688H303.976V538.856C303.976 539.389 304.104 539.773 304.36 540.008C304.616 540.243 305.043 540.36 305.64 540.36H307.592ZM328.272 527.144V545H322.8V542.568C322.246 543.357 321.488 543.997 320.528 544.488C319.59 544.957 318.544 545.192 317.392 545.192C316.027 545.192 314.822 544.893 313.776 544.296C312.731 543.677 311.92 542.792 311.344 541.64C310.768 540.488 310.48 539.133 310.48 537.576V527.144H315.92V536.84C315.92 538.035 316.23 538.963 316.848 539.624C317.467 540.285 318.299 540.616 319.344 540.616C320.411 540.616 321.254 540.285 321.872 539.624C322.491 538.963 322.8 538.035 322.8 536.84V527.144H328.272ZM343.115 545L337.675 537.512V545H332.203V521.32H337.675V534.408L343.083 527.144H349.835L342.411 536.104L349.899 545H343.115ZM368.717 540.36V545H365.933C363.949 545 362.403 544.52 361.293 543.56C360.184 542.579 359.629 540.989 359.629 538.792V531.688H357.453V527.144H359.629V522.792H365.101V527.144H368.685V531.688H365.101V538.856C365.101 539.389 365.229 539.773 365.485 540.008C365.741 540.243 366.168 540.36 366.765 540.36H368.717ZM377.237 530.12C377.877 529.139 378.677 528.371 379.637 527.816C380.597 527.24 381.664 526.952 382.837 526.952V532.744H381.333C379.968 532.744 378.944 533.043 378.261 533.64C377.579 534.216 377.237 535.24 377.237 536.712V545H371.765V527.144H377.237V530.12ZM384.365 536.04C384.365 534.205 384.706 532.595 385.389 531.208C386.093 529.821 387.042 528.755 388.237 528.008C389.431 527.261 390.765 526.888 392.237 526.888C393.495 526.888 394.594 527.144 395.533 527.656C396.493 528.168 397.229 528.84 397.741 529.672V527.144H403.213V545H397.741V542.472C397.207 543.304 396.461 543.976 395.501 544.488C394.562 545 393.463 545.256 392.205 545.256C390.754 545.256 389.431 544.883 388.237 544.136C387.042 543.368 386.093 542.291 385.389 540.904C384.706 539.496 384.365 537.875 384.365 536.04ZM397.741 536.072C397.741 534.707 397.357 533.629 396.589 532.84C395.842 532.051 394.925 531.656 393.837 531.656C392.749 531.656 391.821 532.051 391.053 532.84C390.306 533.608 389.933 534.675 389.933 536.04C389.933 537.405 390.306 538.493 391.053 539.304C391.821 540.093 392.749 540.488 393.837 540.488C394.925 540.488 395.842 540.093 396.589 539.304C397.357 538.515 397.741 537.437 397.741 536.072ZM406.083 536.072C406.083 534.216 406.457 532.595 407.203 531.208C407.971 529.821 409.027 528.755 410.371 528.008C411.737 527.261 413.294 526.888 415.043 526.888C417.284 526.888 419.15 527.475 420.643 528.648C422.158 529.821 423.15 531.475 423.62 533.608H417.796C417.305 532.243 416.355 531.56 414.948 531.56C413.945 531.56 413.145 531.955 412.547 532.744C411.95 533.512 411.651 534.621 411.651 536.072C411.651 537.523 411.95 538.643 412.547 539.432C413.145 540.2 413.945 540.584 414.948 540.584C416.355 540.584 417.305 539.901 417.796 538.536H423.62C423.15 540.627 422.158 542.269 420.643 543.464C419.129 544.659 417.262 545.256 415.043 545.256C413.294 545.256 411.737 544.883 410.371 544.136C409.027 543.389 407.971 542.323 407.203 540.936C406.457 539.549 406.083 537.928 406.083 536.072ZM437.458 545L432.018 537.512V545H426.547V521.32H432.018V534.408L437.427 527.144H444.178L436.754 536.104L444.242 545H437.458ZM449.08 525.288C448.12 525.288 447.33 525.011 446.712 524.456C446.114 523.88 445.816 523.176 445.816 522.344C445.816 521.491 446.114 520.787 446.712 520.232C447.33 519.656 448.12 519.368 449.08 519.368C450.018 519.368 450.786 519.656 451.384 520.232C452.002 520.787 452.312 521.491 452.312 522.344C452.312 523.176 452.002 523.88 451.384 524.456C450.786 525.011 450.018 525.288 449.08 525.288ZM451.8 527.144V545H446.328V527.144H451.8ZM466.645 526.952C468.736 526.952 470.4 527.635 471.637 529C472.896 530.344 473.525 532.2 473.525 534.568V545H468.085V535.304C468.085 534.109 467.776 533.181 467.157 532.52C466.539 531.859 465.707 531.528 464.661 531.528C463.616 531.528 462.784 531.859 462.165 532.52C461.547 533.181 461.237 534.109 461.237 535.304V545H455.765V527.144H461.237V529.512C461.792 528.723 462.539 528.104 463.477 527.656C464.416 527.187 465.472 526.952 466.645 526.952ZM484.112 526.888C485.37 526.888 486.469 527.144 487.408 527.656C488.368 528.168 489.104 528.84 489.616 529.672V527.144H495.088V544.968C495.088 546.611 494.757 548.093 494.096 549.416C493.456 550.76 492.464 551.827 491.12 552.616C489.797 553.405 488.144 553.8 486.16 553.8C483.514 553.8 481.37 553.171 479.728 551.912C478.085 550.675 477.146 548.989 476.912 546.856H482.32C482.49 547.539 482.896 548.072 483.536 548.456C484.176 548.861 484.965 549.064 485.904 549.064C487.034 549.064 487.93 548.733 488.592 548.072C489.274 547.432 489.616 546.397 489.616 544.968V542.44C489.082 543.272 488.346 543.955 487.408 544.488C486.469 545 485.37 545.256 484.112 545.256C482.64 545.256 481.306 544.883 480.112 544.136C478.917 543.368 477.968 542.291 477.264 540.904C476.581 539.496 476.24 537.875 476.24 536.04C476.24 534.205 476.581 532.595 477.264 531.208C477.968 529.821 478.917 528.755 480.112 528.008C481.306 527.261 482.64 526.888 484.112 526.888ZM489.616 536.072C489.616 534.707 489.232 533.629 488.464 532.84C487.717 532.051 486.8 531.656 485.712 531.656C484.624 531.656 483.696 532.051 482.928 532.84C482.181 533.608 481.808 534.675 481.808 536.04C481.808 537.405 482.181 538.493 482.928 539.304C483.696 540.093 484.624 540.488 485.712 540.488C486.8 540.488 487.717 540.093 488.464 539.304C489.232 538.515 489.616 537.437 489.616 536.072Z" fill="white" />
<path d="M181.944 575.688H179V589H173.528V575.688H171.544V571.144H173.528V570.632C173.528 568.435 174.157 566.771 175.416 565.64C176.675 564.488 178.52 563.912 180.952 563.912C181.357 563.912 181.656 563.923 181.848 563.944V568.584C180.803 568.52 180.067 568.669 179.64 569.032C179.213 569.395 179 570.045 179 570.984V571.144H181.944V575.688ZM201.347 579.784C201.347 580.296 201.315 580.829 201.251 581.384H188.867C188.953 582.493 189.305 583.347 189.923 583.944C190.563 584.52 191.342 584.808 192.259 584.808C193.625 584.808 194.574 584.232 195.107 583.08H200.931C200.633 584.253 200.089 585.309 199.299 586.248C198.531 587.187 197.561 587.923 196.387 588.456C195.214 588.989 193.902 589.256 192.451 589.256C190.702 589.256 189.145 588.883 187.779 588.136C186.414 587.389 185.347 586.323 184.579 584.936C183.811 583.549 183.427 581.928 183.427 580.072C183.427 578.216 183.801 576.595 184.547 575.208C185.315 573.821 186.382 572.755 187.747 572.008C189.113 571.261 190.681 570.888 192.451 570.888C194.179 570.888 195.715 571.251 197.059 571.976C198.403 572.701 199.449 573.736 200.195 575.08C200.963 576.424 201.347 577.992 201.347 579.784ZM195.747 578.344C195.747 577.405 195.427 576.659 194.787 576.104C194.147 575.549 193.347 575.272 192.387 575.272C191.47 575.272 190.691 575.539 190.051 576.072C189.433 576.605 189.049 577.363 188.899 578.344H195.747ZM221.066 579.784C221.066 580.296 221.034 580.829 220.97 581.384H208.586C208.671 582.493 209.023 583.347 209.642 583.944C210.282 584.52 211.061 584.808 211.978 584.808C213.343 584.808 214.293 584.232 214.826 583.08H220.65C220.351 584.253 219.807 585.309 219.018 586.248C218.25 587.187 217.279 587.923 216.106 588.456C214.933 588.989 213.621 589.256 212.17 589.256C210.421 589.256 208.863 588.883 207.498 588.136C206.133 587.389 205.066 586.323 204.298 584.936C203.53 583.549 203.146 581.928 203.146 580.072C203.146 578.216 203.519 576.595 204.266 575.208C205.034 573.821 206.101 572.755 207.466 572.008C208.831 571.261 210.399 570.888 212.17 570.888C213.898 570.888 215.434 571.251 216.778 571.976C218.122 572.701 219.167 573.736 219.914 575.08C220.682 576.424 221.066 577.992 221.066 579.784ZM215.466 578.344C215.466 577.405 215.146 576.659 214.506 576.104C213.866 575.549 213.066 575.272 212.106 575.272C211.189 575.272 210.41 575.539 209.77 576.072C209.151 576.605 208.767 577.363 208.618 578.344H215.466ZM222.865 580.04C222.865 578.205 223.206 576.595 223.889 575.208C224.593 573.821 225.542 572.755 226.737 572.008C227.931 571.261 229.265 570.888 230.737 570.888C231.91 570.888 232.977 571.133 233.937 571.624C234.918 572.115 235.686 572.776 236.241 573.608V565.32H241.713V589H236.241V586.44C235.729 587.293 234.993 587.976 234.033 588.488C233.094 589 231.995 589.256 230.737 589.256C229.265 589.256 227.931 588.883 226.737 588.136C225.542 587.368 224.593 586.291 223.889 584.904C223.206 583.496 222.865 581.875 222.865 580.04ZM236.241 580.072C236.241 578.707 235.857 577.629 235.089 576.84C234.342 576.051 233.425 575.656 232.337 575.656C231.249 575.656 230.321 576.051 229.553 576.84C228.806 577.608 228.433 578.675 228.433 580.04C228.433 581.405 228.806 582.493 229.553 583.304C230.321 584.093 231.249 584.488 232.337 584.488C233.425 584.488 234.342 584.093 235.089 583.304C235.857 582.515 236.241 581.437 236.241 580.072ZM262.504 579.784C262.504 580.296 262.471 580.829 262.408 581.384H250.023C250.109 582.493 250.461 583.347 251.079 583.944C251.719 584.52 252.498 584.808 253.415 584.808C254.781 584.808 255.73 584.232 256.264 583.08H262.088C261.789 584.253 261.245 585.309 260.456 586.248C259.688 587.187 258.717 587.923 257.544 588.456C256.37 588.989 255.058 589.256 253.607 589.256C251.858 589.256 250.301 588.883 248.936 588.136C247.57 587.389 246.504 586.323 245.735 584.936C244.967 583.549 244.584 581.928 244.584 580.072C244.584 578.216 244.957 576.595 245.703 575.208C246.471 573.821 247.538 572.755 248.904 572.008C250.269 571.261 251.837 570.888 253.607 570.888C255.336 570.888 256.871 571.251 258.215 571.976C259.56 572.701 260.605 573.736 261.352 575.08C262.119 576.424 262.504 577.992 262.504 579.784ZM256.904 578.344C256.904 577.405 256.584 576.659 255.943 576.104C255.303 575.549 254.504 575.272 253.544 575.272C252.626 575.272 251.848 575.539 251.208 576.072C250.589 576.605 250.205 577.363 250.056 578.344H256.904ZM270.862 574.12C271.502 573.139 272.302 572.371 273.262 571.816C274.222 571.24 275.289 570.952 276.462 570.952V576.744H274.958C273.593 576.744 272.569 577.043 271.886 577.64C271.204 578.216 270.862 579.24 270.862 580.712V589H265.39V571.144H270.862V574.12ZM323.552 566.536L317.696 589H311.072L307.488 574.216L303.776 589H297.152L291.456 566.536H297.312L300.544 582.888L304.544 566.536H310.56L314.4 582.888L317.664 566.536H323.552ZM329.048 569.288C328.089 569.288 327.299 569.011 326.68 568.456C326.083 567.88 325.785 567.176 325.785 566.344C325.785 565.491 326.083 564.787 326.68 564.232C327.299 563.656 328.089 563.368 329.048 563.368C329.987 563.368 330.755 563.656 331.352 564.232C331.971 564.787 332.281 565.491 332.281 566.344C332.281 567.176 331.971 567.88 331.352 568.456C330.755 569.011 329.987 569.288 329.048 569.288ZM331.768 571.144V589H326.296V571.144H331.768ZM341.206 574.12C341.846 573.139 342.646 572.371 343.606 571.816C344.566 571.24 345.633 570.952 346.806 570.952V576.744H345.302C343.937 576.744 342.913 577.043 342.23 577.64C341.547 578.216 341.206 579.24 341.206 580.712V589H335.734V571.144H341.206V574.12ZM348.333 580.04C348.333 578.205 348.675 576.595 349.357 575.208C350.061 573.821 351.011 572.755 352.206 572.008C353.4 571.261 354.734 570.888 356.206 570.888C357.464 570.888 358.563 571.144 359.501 571.656C360.462 572.168 361.197 572.84 361.71 573.672V571.144H367.182V589H361.71V586.472C361.176 587.304 360.43 587.976 359.469 588.488C358.531 589 357.432 589.256 356.173 589.256C354.723 589.256 353.4 588.883 352.206 588.136C351.011 587.368 350.061 586.291 349.357 584.904C348.675 583.496 348.333 581.875 348.333 580.04ZM361.71 580.072C361.71 578.707 361.326 577.629 360.557 576.84C359.811 576.051 358.893 575.656 357.805 575.656C356.717 575.656 355.79 576.051 355.021 576.84C354.275 577.608 353.902 578.675 353.902 580.04C353.902 581.405 354.275 582.493 355.021 583.304C355.79 584.093 356.717 584.488 357.805 584.488C358.893 584.488 359.811 584.093 360.557 583.304C361.326 582.515 361.71 581.437 361.71 580.072ZM402.052 566.536L396.196 589H389.572L385.988 574.216L382.276 589H375.652L369.956 566.536H375.812L379.044 582.888L383.044 566.536H389.06L392.9 582.888L396.164 566.536H402.052ZM407.548 569.288C406.589 569.288 405.799 569.011 405.18 568.456C404.583 567.88 404.285 567.176 404.285 566.344C404.285 565.491 404.583 564.787 405.18 564.232C405.799 563.656 406.589 563.368 407.548 563.368C408.487 563.368 409.255 563.656 409.852 564.232C410.471 564.787 410.781 565.491 410.781 566.344C410.781 567.176 410.471 567.88 409.852 568.456C409.255 569.011 408.487 569.288 407.548 569.288ZM410.268 571.144V589H404.796V571.144H410.268ZM419.706 574.12C420.346 573.139 421.146 572.371 422.106 571.816C423.066 571.24 424.133 570.952 425.306 570.952V576.744H423.802C422.437 576.744 421.413 577.043 420.73 577.64C420.047 578.216 419.706 579.24 419.706 580.712V589H414.234V571.144H419.706V574.12ZM430.673 569.288C429.714 569.288 428.924 569.011 428.306 568.456C427.708 567.88 427.409 567.176 427.409 566.344C427.409 565.491 427.708 564.787 428.306 564.232C428.924 563.656 429.714 563.368 430.673 563.368C431.612 563.368 432.38 563.656 432.978 564.232C433.596 564.787 433.905 565.491 433.905 566.344C433.905 567.176 433.596 567.88 432.978 568.456C432.38 569.011 431.612 569.288 430.673 569.288ZM433.393 571.144V589H427.922V571.144H433.393Z" fill="white" />
</g><g id="ll-decor"><path opacity="0.04" d="M370 240C480.457 240 570 150.457 570 40C570 -70.4569 480.457 -160 370 -160C259.543 -160 170 -70.4569 170 40C170 150.457 259.543 240 370 240Z" fill="white" />
<path opacity="0.035" d="M40 1040C183.594 1040 300 923.594 300 780C300 636.406 183.594 520 40 520C-103.594 520 -220 636.406 -220 780C-220 923.594 -103.594 1040 40 1040Z" fill="white" />
</g><g id="ll-platform"><path opacity="0.45" d="M300 440C431.444 440 538 428.359 538 414C538 399.641 431.444 388 300 388C168.556 388 62 399.641 62 414C62 428.359 168.556 440 300 440Z" fill="#081C31" />
<path d="M300 456C436.967 456 548 427.346 548 392C548 356.654 436.967 328 300 328C163.033 328 52 356.654 52 392C52 427.346 163.033 456 300 456Z" fill="url(#paint2_linear_2075_178)" />
<path d="M300 444C436.967 444 548 415.346 548 380C548 344.654 436.967 316 300 316C163.033 316 52 344.654 52 380C52 415.346 163.033 444 300 444Z" fill="url(#paint3_linear_2075_178)" />
<mask id="mask0_2075_178" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="52" y="316" width="496" height="128">
<path d="M300 444C436.967 444 548 415.346 548 380C548 344.654 436.967 316 300 316C163.033 316 52 344.654 52 380C52 415.346 163.033 444 300 444Z" fill="white" />
</mask>
<g mask="url(#mask0_2075_178)">
<path d="M146.24 412.7C162.809 412.7 176.24 406.656 176.24 399.2C176.24 391.744 162.809 385.7 146.24 385.7C129.671 385.7 116.24 391.744 116.24 399.2C116.24 406.656 129.671 412.7 146.24 412.7Z" fill="#D6EAD3" />
<path d="M463.68 364.82C478.039 364.82 489.68 359.582 489.68 353.12C489.68 346.658 478.039 341.42 463.68 341.42C449.321 341.42 437.68 346.658 437.68 353.12C437.68 359.582 449.321 364.82 463.68 364.82Z" fill="#D6EAD3" />
<path d="M374.4 437.9C386.55 437.9 396.4 433.468 396.4 428C396.4 422.532 386.55 418.1 374.4 418.1C362.25 418.1 352.4 422.532 352.4 428C352.4 433.468 362.25 437.9 374.4 437.9Z" fill="#D6EAD3" />
<path d="M262.8 309.6C266.9 318.1 276.4 345.9 287.6 360.8C298.8 375.7 325.6 384.3 329.8 399.2C333.9 414.1 315.3 441.9 312.4 450.4" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" stroke="#BCD9F1" />
<path d="M27.2 370.4C60.3 371.5 163.6 377.3 225.6 376.8C287.6 376.3 341.3 366.1 399.2 367.2C457.1 368.3 543.9 380.5 572.8 383.2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke="white" />
<path d="M27.2 415.2C64.4 413.6 184.3 404.9 250.4 405.6C316.5 406.3 370.3 419.5 424 419.7C477.7 419.9 548 409 572.8 406.9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke="white" />
<path d="M163.6 309.6C167.7 321.3 181.4 356.5 188.4 380C195.4 403.5 202.9 438.7 205.8 450.4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke="white" />
<path d="M436.4 309.6C434.3 321.3 421.9 356.5 424 380C426.1 403.5 444.7 438.7 448.8 450.4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke="white" />
<path d="M39.6 351.2C60.3 352.8 120.2 360.5 163.6 360.8C207 361.1 254.5 356.5 300 353.1C345.5 349.7 393 340.1 436.4 340.3C479.8 340.5 539.7 352.1 560.4 354.4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke="white" />
<path d="M39.6 351.2C60.3 352.8 120.2 360.5 163.6 360.8C207 361.1 254.5 356.5 300 353.1C345.5 349.7 393 340.1 436.4 340.3C479.8 340.5 539.7 352.1 560.4 354.4" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" stroke="#C83A44" />
<path d="M39.6 399.2C64.4 402.6 138.8 417.3 188.4 419.7C238 422 289.7 411.6 337.2 413.3C384.7 415 436.4 428 473.6 429.9C510.8 431.8 545.9 425.7 560.4 424.8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke="white" />
<path d="M39.6 399.2C64.4 402.6 138.8 417.3 188.4 419.7C238 422 289.7 411.6 337.2 413.3C384.7 415 436.4 428 473.6 429.9C510.8 431.8 545.9 425.7 560.4 424.8" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" stroke="#E2A23B" />
<path d="M39.6 383.2C54.1 383.9 99.5 388.4 126.4 387.7C153.3 386.9 188.4 380.2 200.8 378.7" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke="white" />
<path d="M39.6 383.2C54.1 383.9 99.5 388.4 126.4 387.7C153.3 386.9 188.4 380.2 200.8 378.7" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" stroke="#2F8F5B" />
<path d="M453.8 383.2C463.3 385 493 393 510.8 394.1C528.6 395.1 552.1 390.3 560.4 389.6" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke="white" />
<path d="M453.8 383.2C463.3 385 493 393 510.8 394.1C528.6 395.1 552.1 390.3 560.4 389.6" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" stroke="#2F8F5B" />
<path d="M163.6 364.8C165.809 364.8 167.6 363.009 167.6 360.8C167.6 358.591 165.809 356.8 163.6 356.8C161.391 356.8 159.6 358.591 159.6 360.8C159.6 363.009 161.391 364.8 163.6 364.8Z" fill="white" stroke-width="2" stroke="#C83A44" />
<path d="M436.4 344.32C438.609 344.32 440.4 342.529 440.4 340.32C440.4 338.111 438.609 336.32 436.4 336.32C434.191 336.32 432.4 338.111 432.4 340.32C432.4 342.529 434.191 344.32 436.4 344.32Z" fill="white" stroke-width="2" stroke="#C83A44" />
<path d="M188.4 423.68C190.609 423.68 192.4 421.889 192.4 419.68C192.4 417.471 190.609 415.68 188.4 415.68C186.191 415.68 184.4 417.471 184.4 419.68C184.4 421.889 186.191 423.68 188.4 423.68Z" fill="white" stroke-width="2" stroke="#E2A23B" />
<path d="M473.6 433.92C475.809 433.92 477.6 432.129 477.6 429.92C477.6 427.711 475.809 425.92 473.6 425.92C471.391 425.92 469.6 427.711 469.6 429.92C469.6 432.129 471.391 433.92 473.6 433.92Z" fill="white" stroke-width="2" stroke="#E2A23B" />
<path d="M126.4 391.68C128.609 391.68 130.4 389.889 130.4 387.68C130.4 385.471 128.609 383.68 126.4 383.68C124.191 383.68 122.4 385.471 122.4 387.68C122.4 389.889 124.191 391.68 126.4 391.68Z" fill="white" stroke-width="2" stroke="#2F8F5B" />
</g>
<path opacity="0.7" d="M300 444C436.967 444 548 415.346 548 380C548 344.654 436.967 316 300 316C163.033 316 52 344.654 52 380C52 415.346 163.033 444 300 444Z" fill="black" stroke-width="1.5" stroke="white" />
<path opacity="0.25" d="M86.72 407.26C91.6906 407.26 95.72 405.693 95.72 403.76C95.72 401.827 91.6906 400.26 86.72 400.26C81.7495 400.26 77.72 401.827 77.72 403.76C77.72 405.693 81.7495 407.26 86.72 407.26Z" fill="#081C31" />
<path d="M86.7 401.8C82.7 391.8 73.7 385.8 73.7 375.8C73.7 372.352 75.0697 369.045 77.5076 366.607C79.9456 364.169 83.2522 362.8 86.7 362.8C90.1478 362.8 93.4544 364.169 95.8924 366.607C98.3304 369.045 99.7 372.352 99.7 375.8C99.7 385.8 90.7 391.8 86.7 401.8Z" fill="#2F8F5B" />
<path d="M86.72 380.76C89.4815 380.76 91.72 378.521 91.72 375.76C91.72 372.999 89.4815 370.76 86.72 370.76C83.9586 370.76 81.72 372.999 81.72 375.76C81.72 378.521 83.9586 380.76 86.72 380.76Z" fill="white" />
<path opacity="0.25" d="M518.24 391.9C523.211 391.9 527.24 390.333 527.24 388.4C527.24 386.467 523.211 384.9 518.24 384.9C513.269 384.9 509.24 386.467 509.24 388.4C509.24 390.333 513.269 391.9 518.24 391.9Z" fill="#081C31" />
<path d="M518.2 386.4C514.2 376.4 505.2 370.4 505.2 360.4C505.2 356.952 506.57 353.645 509.008 351.208C511.446 348.77 514.752 347.4 518.2 347.4C521.648 347.4 524.954 348.77 527.392 351.208C529.83 353.645 531.2 356.952 531.2 360.4C531.2 370.4 522.2 376.4 518.2 386.4Z" fill="#C83A44" />
<path d="M518.24 365.4C521.001 365.4 523.24 363.161 523.24 360.4C523.24 357.638 521.001 355.4 518.24 355.4C515.479 355.4 513.24 357.638 513.24 360.4C513.24 363.161 515.479 365.4 518.24 365.4Z" fill="white" />
</g><g id="ll-speed"><path opacity="0.25" d="M36 258H84" stroke-width="3" stroke-linecap="round" stroke="white" />
<path opacity="0.25" d="M48 282H84" stroke-width="3" stroke-linecap="round" stroke="white" />
<path opacity="0.25" d="M60 306H84" stroke-width="3" stroke-linecap="round" stroke="white" />
</g><g id="ll-bus"><path opacity="0.35" d="M302 383C406.934 383 492 378.075 492 372C492 365.925 406.934 361 302 361C197.066 361 112 365.925 112 372C112 378.075 197.066 383 302 383Z" fill="#081C31" />
<path d="M367 208H231C227.134 208 224 211.134 224 215V217C224 220.866 227.134 224 231 224H367C370.866 224 374 220.866 374 217V215C374 211.134 370.866 208 367 208Z" fill="#D3DEEA" />
<path d="M464 220H132C117.641 220 106 231.641 106 246V324C106 338.359 117.641 350 132 350H464C478.359 350 490 338.359 490 324V246C490 231.641 478.359 220 464 220Z" fill="url(#paint4_linear_2075_178)" />
<path d="M464 314H132C117.641 314 106 322.059 106 332C106 341.941 117.641 350 132 350H464C478.359 350 490 341.941 490 332C490 322.059 478.359 314 464 314Z" fill="#0F2D4E" />
<path d="M490 314H106V332H490V314Z" fill="#0F2D4E" />
<path d="M490 307H106V314H490V307Z" fill="#C83A44" />
<path d="M187 238H137C132.029 238 128 242.029 128 247V285C128 289.971 132.029 294 137 294H187C191.971 294 196 289.971 196 285V247C196 242.029 191.971 238 187 238Z" fill="url(#paint5_linear_2075_178)" />
<path opacity="0.12" d="M142 238H158L140 294H128L142 238Z" fill="white" />
<path d="M263 238H213C208.029 238 204 242.029 204 247V285C204 289.971 208.029 294 213 294H263C267.971 294 272 289.971 272 285V247C272 242.029 267.971 238 263 238Z" fill="url(#paint6_linear_2075_178)" />
<path opacity="0.12" d="M218 238H234L216 294H204L218 238Z" fill="white" />
<path d="M339 238H289C284.029 238 280 242.029 280 247V285C280 289.971 284.029 294 289 294H339C343.971 294 348 289.971 348 285V247C348 242.029 343.971 238 339 238Z" fill="url(#paint7_linear_2075_178)" />
<path opacity="0.12" d="M294 238H310L292 294H280L294 238Z" fill="white" />
<path d="M386 238H366C361.582 238 358 241.582 358 246V338C358 342.418 361.582 346 366 346H386C390.418 346 394 342.418 394 338V246C394 241.582 390.418 238 386 238Z" fill="url(#paint8_linear_2075_178)" />
<path opacity="0.35" d="M376 242V342" stroke-width="1.2" stroke="white" />
<path d="M439 238H413C408.029 238 404 242.029 404 247V285C404 289.971 408.029 294 413 294H439C443.971 294 448 289.971 448 285V247C448 242.029 443.971 238 439 238Z" fill="url(#paint9_linear_2075_178)" />
<path d="M456 238H472C482.667 239.333 488 246.667 488 260V298H456V238Z" fill="url(#paint10_linear_2075_178)" />
<path d="M495 247.5C495 245.567 493.433 244 491.5 244C489.567 244 488 245.567 488 247.5V264.5C488 266.433 489.567 268 491.5 268C493.433 268 495 266.433 495 264.5V247.5Z" fill="#0F2D4E" />
<path d="M485 320H479C477.343 320 476 321.343 476 323V326C476 327.657 477.343 329 479 329H485C486.657 329 488 327.657 488 326V323C488 321.343 486.657 320 485 320Z" fill="#FFD27A" />
<path d="M113 320H111C109.895 320 109 320.895 109 322V330C109 331.105 109.895 332 111 332H113C114.105 332 115 331.105 115 330V322C115 320.895 114.105 320 113 320Z" fill="#C83A44" />
<path d="M248.392 332.172L245.83 342H242.932L241.364 335.532L239.74 342H236.842L234.35 332.172H236.912L238.326 339.326L240.076 332.172H242.708L244.388 339.326L245.816 332.172H248.392ZM250.797 333.376C250.377 333.376 250.031 333.255 249.761 333.012C249.499 332.76 249.369 332.452 249.369 332.088C249.369 331.715 249.499 331.407 249.761 331.164C250.031 330.912 250.377 330.786 250.797 330.786C251.207 330.786 251.543 330.912 251.805 331.164C252.075 331.407 252.211 331.715 252.211 332.088C252.211 332.452 252.075 332.76 251.805 333.012C251.543 333.255 251.207 333.376 250.797 333.376ZM251.987 334.188V342H249.593V334.188H251.987ZM256.116 335.49C256.396 335.061 256.746 334.725 257.166 334.482C257.586 334.23 258.052 334.104 258.566 334.104V336.638H257.908C257.31 336.638 256.862 336.769 256.564 337.03C256.265 337.282 256.116 337.73 256.116 338.374V342H253.722V334.188H256.116V335.49ZM259.234 338.08C259.234 337.277 259.383 336.573 259.682 335.966C259.99 335.359 260.405 334.893 260.928 334.566C261.45 334.239 262.034 334.076 262.678 334.076C263.228 334.076 263.709 334.188 264.12 334.412C264.54 334.636 264.862 334.93 265.086 335.294V334.188H267.48V342H265.086V340.894C264.852 341.258 264.526 341.552 264.106 341.776C263.695 342 263.214 342.112 262.664 342.112C262.029 342.112 261.45 341.949 260.928 341.622C260.405 341.286 259.99 340.815 259.682 340.208C259.383 339.592 259.234 338.883 259.234 338.08ZM265.086 338.094C265.086 337.497 264.918 337.025 264.582 336.68C264.255 336.335 263.854 336.162 263.378 336.162C262.902 336.162 262.496 336.335 262.16 336.68C261.833 337.016 261.67 337.483 261.67 338.08C261.67 338.677 261.833 339.153 262.16 339.508C262.496 339.853 262.902 340.026 263.378 340.026C263.854 340.026 264.255 339.853 264.582 339.508C264.918 339.163 265.086 338.691 265.086 338.094Z" fill="white" />
<path d="M282.692 332.172L280.13 342H277.232L275.664 335.532L274.04 342H271.142L268.65 332.172H271.212L272.626 339.326L274.376 332.172H277.008L278.688 339.326L280.116 332.172H282.692ZM285.097 333.376C284.677 333.376 284.331 333.255 284.061 333.012C283.799 332.76 283.669 332.452 283.669 332.088C283.669 331.715 283.799 331.407 284.061 331.164C284.331 330.912 284.677 330.786 285.097 330.786C285.507 330.786 285.843 330.912 286.105 331.164C286.375 331.407 286.511 331.715 286.511 332.088C286.511 332.452 286.375 332.76 286.105 333.012C285.843 333.255 285.507 333.376 285.097 333.376ZM286.287 334.188V342H283.893V334.188H286.287ZM290.416 335.49C290.696 335.061 291.046 334.725 291.466 334.482C291.886 334.23 292.352 334.104 292.866 334.104V336.638H292.208C291.61 336.638 291.162 336.769 290.864 337.03C290.565 337.282 290.416 337.73 290.416 338.374V342H288.022V334.188H290.416V335.49ZM295.214 333.376C294.794 333.376 294.448 333.255 294.178 333.012C293.916 332.76 293.786 332.452 293.786 332.088C293.786 331.715 293.916 331.407 294.178 331.164C294.448 330.912 294.794 330.786 295.214 330.786C295.624 330.786 295.96 330.912 296.222 331.164C296.492 331.407 296.628 331.715 296.628 332.088C296.628 332.452 296.492 332.76 296.222 333.012C295.96 333.255 295.624 333.376 295.214 333.376ZM296.404 334.188V342H294.01V334.188H296.404Z" fill="#A9C8EC" />
<path d="M190 381C207.121 381 221 367.121 221 350C221 332.879 207.121 319 190 319C172.879 319 159 332.879 159 350C159 367.121 172.879 381 190 381Z" fill="#0B2540" />
<path d="M190 374C203.255 374 214 363.255 214 350C214 336.745 203.255 326 190 326C176.745 326 166 336.745 166 350C166 363.255 176.745 374 190 374Z" fill="#1B2A3A" />
<path d="M190 362C196.627 362 202 356.627 202 350C202 343.373 196.627 338 190 338C183.373 338 178 343.373 178 350C178 356.627 183.373 362 190 362Z" fill="#CBD5E1" />
<path d="M190 354C192.209 354 194 352.209 194 350C194 347.791 192.209 346 190 346C187.791 346 186 347.791 186 350C186 352.209 187.791 354 190 354Z" fill="#6A788A" />
<path d="M424 381C441.121 381 455 367.121 455 350C455 332.879 441.121 319 424 319C406.879 319 393 332.879 393 350C393 367.121 406.879 381 424 381Z" fill="#0B2540" />
<path d="M424 374C437.255 374 448 363.255 448 350C448 336.745 437.255 326 424 326C410.745 326 400 336.745 400 350C400 363.255 410.745 374 424 374Z" fill="#1B2A3A" />
<path d="M424 362C430.627 362 436 356.627 436 350C436 343.373 430.627 338 424 338C417.373 338 412 343.373 412 350C412 356.627 417.373 362 424 362Z" fill="#CBD5E1" />
<path d="M424 354C426.209 354 428 352.209 428 350C428 347.791 426.209 346 424 346C421.791 346 420 347.791 420 350C420 352.209 421.791 354 424 354Z" fill="#6A788A" />
</g><g id="ll-brand"><image x="56" y="52" width="79.36" height="48" preserveAspectRatio="none" href="${LOGO_LIGHT}"/><path d="M151.36 56V96" stroke="#4A78A8" />
<path d="M187.96 63.96L184.3 78H180.16L177.92 68.76L175.6 78H171.46L167.9 63.96H171.56L173.58 74.18L176.08 63.96H179.84L182.24 74.18L184.28 63.96H187.96ZM191.395 65.68C190.795 65.68 190.302 65.5067 189.915 65.16C189.542 64.8 189.355 64.36 189.355 63.84C189.355 63.3067 189.542 62.8667 189.915 62.52C190.302 62.16 190.795 61.98 191.395 61.98C191.982 61.98 192.462 62.16 192.835 62.52C193.222 62.8667 193.415 63.3067 193.415 63.84C193.415 64.36 193.222 64.8 192.835 65.16C192.462 65.5067 191.982 65.68 191.395 65.68ZM193.095 66.84V78H189.675V66.84H193.095ZM198.994 68.7C199.394 68.0867 199.894 67.6067 200.494 67.26C201.094 66.9 201.76 66.72 202.494 66.72V70.34H201.554C200.7 70.34 200.06 70.5267 199.634 70.9C199.207 71.26 198.994 71.9 198.994 72.82V78H195.574V66.84H198.994V68.7ZM203.448 72.4C203.448 71.2533 203.662 70.2467 204.088 69.38C204.528 68.5133 205.122 67.8467 205.868 67.38C206.615 66.9133 207.448 66.68 208.368 66.68C209.155 66.68 209.842 66.84 210.428 67.16C211.028 67.48 211.488 67.9 211.808 68.42V66.84H215.228V78H211.808V76.42C211.475 76.94 211.008 77.36 210.408 77.68C209.822 78 209.135 78.16 208.348 78.16C207.442 78.16 206.615 77.9267 205.868 77.46C205.122 76.98 204.528 76.3067 204.088 75.44C203.662 74.56 203.448 73.5467 203.448 72.4ZM211.808 72.42C211.808 71.5667 211.568 70.8933 211.088 70.4C210.622 69.9067 210.048 69.66 209.368 69.66C208.688 69.66 208.108 69.9067 207.628 70.4C207.162 70.88 206.928 71.5467 206.928 72.4C206.928 73.2533 207.162 73.9333 207.628 74.44C208.108 74.9333 208.688 75.18 209.368 75.18C210.048 75.18 210.622 74.9333 211.088 74.44C211.568 73.9467 211.808 73.2733 211.808 72.42Z" fill="white" />
<path d="M236.96 63.96L233.3 78H229.16L226.92 68.76L224.6 78H220.46L216.9 63.96H220.56L222.58 74.18L225.08 63.96H228.84L231.24 74.18L233.28 63.96H236.96ZM240.395 65.68C239.795 65.68 239.302 65.5067 238.915 65.16C238.542 64.8 238.355 64.36 238.355 63.84C238.355 63.3067 238.542 62.8667 238.915 62.52C239.302 62.16 239.795 61.98 240.395 61.98C240.982 61.98 241.462 62.16 241.835 62.52C242.222 62.8667 242.415 63.3067 242.415 63.84C242.415 64.36 242.222 64.8 241.835 65.16C241.462 65.5067 240.982 65.68 240.395 65.68ZM242.095 66.84V78H238.675V66.84H242.095ZM247.994 68.7C248.394 68.0867 248.894 67.6067 249.494 67.26C250.094 66.9 250.76 66.72 251.494 66.72V70.34H250.554C249.7 70.34 249.06 70.5267 248.634 70.9C248.207 71.26 247.994 71.9 247.994 72.82V78H244.574V66.84H247.994V68.7ZM254.848 65.68C254.248 65.68 253.755 65.5067 253.368 65.16C252.995 64.8 252.808 64.36 252.808 63.84C252.808 63.3067 252.995 62.8667 253.368 62.52C253.755 62.16 254.248 61.98 254.848 61.98C255.435 61.98 255.915 62.16 256.288 62.52C256.675 62.8667 256.868 63.3067 256.868 63.84C256.868 64.36 256.675 64.8 256.288 65.16C255.915 65.5067 255.435 65.68 254.848 65.68ZM256.548 66.84V78H253.128V66.84H256.548Z" fill="#A9C8EC" />
<path d="M172.817 87.4845V88.3355H169.332V91.038H172.161V91.889H169.332V95.5H168.286V87.4845H172.817ZM179.83 92.1075C179.83 92.3068 179.819 92.5177 179.796 92.74H174.759C174.797 93.361 175.008 93.8478 175.391 94.2005C175.782 94.5455 176.254 94.718 176.806 94.718C177.258 94.718 177.634 94.6145 177.933 94.4075C178.24 94.1928 178.454 93.9092 178.577 93.5565H179.704C179.535 94.1622 179.198 94.6567 178.692 95.04C178.186 95.4157 177.557 95.6035 176.806 95.6035C176.208 95.6035 175.671 95.4693 175.196 95.201C174.728 94.9327 174.36 94.5532 174.092 94.0625C173.824 93.5642 173.689 92.9892 173.689 92.3375C173.689 91.6858 173.82 91.1147 174.08 90.624C174.341 90.1333 174.705 89.7577 175.173 89.497C175.648 89.2287 176.193 89.0945 176.806 89.0945C177.404 89.0945 177.933 89.2248 178.393 89.4855C178.853 89.7462 179.206 90.1065 179.451 90.5665C179.704 91.0188 179.83 91.5325 179.83 92.1075ZM178.749 91.889C178.749 91.4903 178.661 91.1492 178.485 90.8655C178.309 90.5742 178.067 90.3557 177.76 90.21C177.461 90.0567 177.128 89.98 176.76 89.98C176.231 89.98 175.779 90.1487 175.403 90.486C175.035 90.8233 174.824 91.291 174.77 91.889H178.749ZM186.962 92.1075C186.962 92.3068 186.95 92.5177 186.927 92.74H181.89C181.929 93.361 182.139 93.8478 182.523 94.2005C182.914 94.5455 183.385 94.718 183.937 94.718C184.39 94.718 184.765 94.6145 185.064 94.4075C185.371 94.1928 185.586 93.9092 185.708 93.5565H186.835C186.667 94.1622 186.329 94.6567 185.823 95.04C185.317 95.4157 184.689 95.6035 183.937 95.6035C183.339 95.6035 182.803 95.4693 182.327 95.201C181.86 94.9327 181.492 94.5532 181.223 94.0625C180.955 93.5642 180.821 92.9892 180.821 92.3375C180.821 91.6858 180.951 91.1147 181.212 90.624C181.472 90.1333 181.837 89.7577 182.304 89.497C182.78 89.2287 183.324 89.0945 183.937 89.0945C184.535 89.0945 185.064 89.2248 185.524 89.4855C185.984 89.7462 186.337 90.1065 186.582 90.5665C186.835 91.0188 186.962 91.5325 186.962 92.1075ZM185.881 91.889C185.881 91.4903 185.793 91.1492 185.616 90.8655C185.44 90.5742 185.198 90.3557 184.892 90.21C184.593 90.0567 184.259 89.98 183.891 89.98C183.362 89.98 182.91 90.1487 182.534 90.486C182.166 90.8233 181.955 91.291 181.902 91.889H185.881ZM187.952 92.326C187.952 91.682 188.082 91.1185 188.343 90.6355C188.604 90.1448 188.96 89.7653 189.413 89.497C189.873 89.2287 190.386 89.0945 190.954 89.0945C191.444 89.0945 191.9 89.2095 192.322 89.4395C192.744 89.6618 193.066 89.957 193.288 90.325V86.99H194.346V95.5H193.288V94.3155C193.081 94.6912 192.774 95.0017 192.368 95.247C191.962 95.4847 191.486 95.6035 190.942 95.6035C190.382 95.6035 189.873 95.4655 189.413 95.1895C188.96 94.9135 188.604 94.5263 188.343 94.028C188.082 93.5297 187.952 92.9623 187.952 92.326ZM193.288 92.3375C193.288 91.8622 193.192 91.4482 193.001 91.0955C192.809 90.7428 192.548 90.4745 192.219 90.2905C191.897 90.0988 191.54 90.003 191.149 90.003C190.758 90.003 190.402 90.095 190.08 90.279C189.758 90.463 189.501 90.7313 189.309 91.084C189.117 91.4367 189.022 91.8507 189.022 92.326C189.022 92.809 189.117 93.2307 189.309 93.591C189.501 93.9437 189.758 94.2158 190.08 94.4075C190.402 94.5915 190.758 94.6835 191.149 94.6835C191.54 94.6835 191.897 94.5915 192.219 94.4075C192.548 94.2158 192.809 93.9437 193.001 93.591C193.192 93.2307 193.288 92.8128 193.288 92.3375ZM201.865 92.1075C201.865 92.3068 201.853 92.5177 201.83 92.74H196.793C196.831 93.361 197.042 93.8478 197.426 94.2005C197.817 94.5455 198.288 94.718 198.84 94.718C199.292 94.718 199.668 94.6145 199.967 94.4075C200.274 94.1928 200.488 93.9092 200.611 93.5565H201.738C201.569 94.1622 201.232 94.6567 200.726 95.04C200.22 95.4157 199.591 95.6035 198.84 95.6035C198.242 95.6035 197.705 95.4693 197.23 95.201C196.762 94.9327 196.394 94.5532 196.126 94.0625C195.858 93.5642 195.724 92.9892 195.724 92.3375C195.724 91.6858 195.854 91.1147 196.115 90.624C196.375 90.1333 196.739 89.7577 197.207 89.497C197.682 89.2287 198.227 89.0945 198.84 89.0945C199.438 89.0945 199.967 89.2248 200.427 89.4855C200.887 89.7462 201.24 90.1065 201.485 90.5665C201.738 91.0188 201.865 91.5325 201.865 92.1075ZM200.784 91.889C200.784 91.4903 200.695 91.1492 200.519 90.8655C200.343 90.5742 200.101 90.3557 199.795 90.21C199.496 90.0567 199.162 89.98 198.794 89.98C198.265 89.98 197.813 90.1487 197.437 90.486C197.069 90.8233 196.858 91.291 196.805 91.889H200.784ZM204.292 90.2215C204.476 89.8612 204.737 89.5813 205.074 89.382C205.419 89.1827 205.837 89.083 206.328 89.083V90.164H206.052C204.879 90.164 204.292 90.8003 204.292 92.073V95.5H203.246V89.198H204.292V90.2215ZM213.143 95.5805C212.614 95.5805 212.139 95.4885 211.717 95.3045C211.303 95.1128 210.978 94.8522 210.74 94.5225C210.502 94.1852 210.38 93.798 210.372 93.361H211.487C211.526 93.7367 211.679 94.0548 211.947 94.3155C212.223 94.5685 212.622 94.695 213.143 94.695C213.642 94.695 214.033 94.5723 214.316 94.327C214.608 94.074 214.753 93.752 214.753 93.361C214.753 93.0543 214.669 92.8052 214.5 92.6135C214.332 92.4218 214.121 92.2762 213.868 92.1765C213.615 92.0768 213.274 91.9695 212.844 91.8545C212.315 91.7165 211.89 91.5785 211.568 91.4405C211.254 91.3025 210.981 91.0878 210.751 90.7965C210.529 90.4975 210.418 90.0988 210.418 89.6005C210.418 89.1635 210.529 88.7763 210.751 88.439C210.974 88.1017 211.284 87.841 211.683 87.657C212.089 87.473 212.553 87.381 213.074 87.381C213.826 87.381 214.439 87.5688 214.914 87.9445C215.397 88.3202 215.67 88.8185 215.731 89.4395H214.581C214.543 89.1328 214.382 88.8645 214.098 88.6345C213.814 88.3968 213.439 88.278 212.971 88.278C212.534 88.278 212.177 88.393 211.901 88.623C211.625 88.8453 211.487 89.1597 211.487 89.566C211.487 89.8573 211.568 90.095 211.729 90.279C211.898 90.463 212.101 90.6048 212.338 90.7045C212.584 90.7965 212.925 90.9038 213.362 91.0265C213.891 91.1722 214.316 91.3178 214.638 91.4635C214.96 91.6015 215.236 91.82 215.466 92.119C215.696 92.4103 215.811 92.809 215.811 93.315C215.811 93.706 215.708 94.074 215.501 94.419C215.294 94.764 214.987 95.0438 214.581 95.2585C214.175 95.4732 213.695 95.5805 213.143 95.5805ZM222.94 89.198V95.5H221.894V94.5685C221.695 94.8905 221.415 95.1435 221.054 95.3275C220.702 95.5038 220.311 95.592 219.881 95.592C219.391 95.592 218.95 95.4923 218.559 95.293C218.168 95.086 217.857 94.7793 217.627 94.373C217.405 93.9667 217.294 93.4722 217.294 92.8895V89.198H218.329V92.7515C218.329 93.3725 218.486 93.8517 218.8 94.189C219.115 94.5187 219.544 94.6835 220.088 94.6835C220.648 94.6835 221.089 94.511 221.411 94.166C221.733 93.821 221.894 93.3188 221.894 92.6595V89.198H222.94ZM225.754 90.2215C225.938 89.8612 226.199 89.5813 226.536 89.382C226.881 89.1827 227.299 89.083 227.789 89.083V90.164H227.513C226.34 90.164 225.754 90.8003 225.754 92.073V95.5H224.707V89.198H225.754V90.2215ZM231.746 95.6035C231.156 95.6035 230.619 95.4693 230.136 95.201C229.661 94.9327 229.285 94.5532 229.009 94.0625C228.741 93.5642 228.606 92.9892 228.606 92.3375C228.606 91.6935 228.744 91.1262 229.02 90.6355C229.304 90.1372 229.687 89.7577 230.17 89.497C230.653 89.2287 231.194 89.0945 231.792 89.0945C232.39 89.0945 232.93 89.2287 233.413 89.497C233.896 89.7577 234.276 90.1333 234.552 90.624C234.836 91.1147 234.977 91.6858 234.977 92.3375C234.977 92.9892 234.832 93.5642 234.54 94.0625C234.257 94.5532 233.87 94.9327 233.379 95.201C232.888 95.4693 232.344 95.6035 231.746 95.6035ZM231.746 94.6835C232.122 94.6835 232.474 94.5953 232.804 94.419C233.134 94.2427 233.398 93.9782 233.597 93.6255C233.804 93.2728 233.908 92.8435 233.908 92.3375C233.908 91.8315 233.808 91.4022 233.609 91.0495C233.41 90.6968 233.149 90.4362 232.827 90.2675C232.505 90.0912 232.156 90.003 231.78 90.003C231.397 90.003 231.044 90.0912 230.722 90.2675C230.408 90.4362 230.155 90.6968 229.963 91.0495C229.772 91.4022 229.676 91.8315 229.676 92.3375C229.676 92.8512 229.768 93.2843 229.952 93.637C230.144 93.9897 230.397 94.2542 230.711 94.4305C231.025 94.5992 231.37 94.6835 231.746 94.6835ZM237.4 90.371C237.615 89.9953 237.929 89.6887 238.343 89.451C238.757 89.2133 239.228 89.0945 239.757 89.0945C240.325 89.0945 240.835 89.2287 241.287 89.497C241.739 89.7653 242.096 90.1448 242.356 90.6355C242.617 91.1185 242.747 91.682 242.747 92.326C242.747 92.9623 242.617 93.5297 242.356 94.028C242.096 94.5263 241.735 94.9135 241.275 95.1895C240.823 95.4655 240.317 95.6035 239.757 95.6035C239.213 95.6035 238.734 95.4847 238.32 95.247C237.914 95.0093 237.607 94.7065 237.4 94.3385V95.5H236.353V86.99H237.4V90.371ZM241.678 92.326C241.678 91.8507 241.582 91.4367 241.39 91.084C241.199 90.7313 240.938 90.463 240.608 90.279C240.286 90.095 239.93 90.003 239.539 90.003C239.156 90.003 238.799 90.0988 238.469 90.2905C238.147 90.4745 237.887 90.7467 237.687 91.107C237.496 91.4597 237.4 91.8698 237.4 92.3375C237.4 92.8128 237.496 93.2307 237.687 93.591C237.887 93.9437 238.147 94.2158 238.469 94.4075C238.799 94.5915 239.156 94.6835 239.539 94.6835C239.93 94.6835 240.286 94.5915 240.608 94.4075C240.938 94.2158 241.199 93.9437 241.39 93.591C241.582 93.2307 241.678 92.809 241.678 92.326ZM246.873 95.6035C246.283 95.6035 245.746 95.4693 245.263 95.201C244.788 94.9327 244.412 94.5532 244.136 94.0625C243.868 93.5642 243.734 92.9892 243.734 92.3375C243.734 91.6935 243.872 91.1262 244.148 90.6355C244.432 90.1372 244.815 89.7577 245.298 89.497C245.781 89.2287 246.321 89.0945 246.919 89.0945C247.517 89.0945 248.058 89.2287 248.541 89.497C249.024 89.7577 249.403 90.1333 249.679 90.624C249.963 91.1147 250.105 91.6858 250.105 92.3375C250.105 92.9892 249.959 93.5642 249.668 94.0625C249.384 94.5532 248.997 94.9327 248.506 95.201C248.016 95.4693 247.471 95.6035 246.873 95.6035ZM246.873 94.6835C247.249 94.6835 247.602 94.5953 247.931 94.419C248.261 94.2427 248.526 93.9782 248.725 93.6255C248.932 93.2728 249.035 92.8435 249.035 92.3375C249.035 91.8315 248.936 91.4022 248.736 91.0495C248.537 90.6968 248.276 90.4362 247.954 90.2675C247.632 90.0912 247.284 90.003 246.908 90.003C246.525 90.003 246.172 90.0912 245.85 90.2675C245.536 90.4362 245.283 90.6968 245.091 91.0495C244.899 91.4022 244.803 91.8315 244.803 92.3375C244.803 92.8512 244.895 93.2843 245.079 93.637C245.271 93.9897 245.524 94.2542 245.838 94.4305C246.153 94.5992 246.498 94.6835 246.873 94.6835ZM256.909 89.198L253.114 98.467H252.033L253.275 95.431L250.733 89.198H251.895L253.873 94.304L255.828 89.198H256.909ZM260.709 95.6035C260.119 95.6035 259.582 95.4693 259.099 95.201C258.624 94.9327 258.248 94.5532 257.972 94.0625C257.704 93.5642 257.57 92.9892 257.57 92.3375C257.57 91.6935 257.708 91.1262 257.984 90.6355C258.267 90.1372 258.651 89.7577 259.134 89.497C259.617 89.2287 260.157 89.0945 260.755 89.0945C261.353 89.0945 261.894 89.2287 262.377 89.497C262.86 89.7577 263.239 90.1333 263.515 90.624C263.799 91.1147 263.941 91.6858 263.941 92.3375C263.941 92.9892 263.795 93.5642 263.504 94.0625C263.22 94.5532 262.833 94.9327 262.342 95.201C261.852 95.4693 261.307 95.6035 260.709 95.6035ZM260.709 94.6835C261.085 94.6835 261.438 94.5953 261.767 94.419C262.097 94.2427 262.361 93.9782 262.561 93.6255C262.768 93.2728 262.871 92.8435 262.871 92.3375C262.871 91.8315 262.772 91.4022 262.572 91.0495C262.373 90.6968 262.112 90.4362 261.79 90.2675C261.468 90.0912 261.119 90.003 260.744 90.003C260.36 90.003 260.008 90.0912 259.686 90.2675C259.371 90.4362 259.118 90.6968 258.927 91.0495C258.735 91.4022 258.639 91.8315 258.639 92.3375C258.639 92.8512 258.731 93.2843 258.915 93.637C259.107 93.9897 259.36 94.2542 259.674 94.4305C259.989 94.5992 260.334 94.6835 260.709 94.6835Z" fill="#B7CBE0" />
</g><g id="ll-copy"><path d="M60.367 785.256C61.1077 785.256 61.7677 785.425 62.347 785.762C62.9263 786.092 63.3737 786.554 63.689 787.148C64.0117 787.735 64.173 788.406 64.173 789.161C64.173 789.916 64.0117 790.591 63.689 791.185C63.3737 791.772 62.9263 792.234 62.347 792.571C61.7677 792.901 61.1077 793.066 60.367 793.066C59.619 793.066 58.9553 792.901 58.376 792.571C57.7967 792.234 57.3457 791.772 57.023 791.185C56.7003 790.591 56.539 789.916 56.539 789.161C56.539 788.406 56.7003 787.735 57.023 787.148C57.3457 786.554 57.7967 786.092 58.376 785.762C58.9553 785.425 59.619 785.256 60.367 785.256ZM60.367 785.696C59.685 785.696 59.091 785.843 58.585 786.136C58.079 786.422 57.6903 786.825 57.419 787.346C57.1477 787.867 57.012 788.472 57.012 789.161C57.012 789.843 57.1477 790.448 57.419 790.976C57.6903 791.497 58.079 791.904 58.585 792.197C59.091 792.49 59.685 792.637 60.367 792.637C61.0417 792.637 61.6283 792.49 62.127 792.197C62.633 791.904 63.0217 791.497 63.293 790.976C63.5643 790.448 63.7 789.843 63.7 789.161C63.7 788.472 63.5643 787.867 63.293 787.346C63.0217 786.825 62.633 786.422 62.127 786.136C61.6283 785.843 61.0417 785.696 60.367 785.696ZM60.345 786.609C59.905 786.609 59.5017 786.712 59.135 786.917C58.7757 787.122 58.4897 787.419 58.277 787.808C58.0643 788.189 57.958 788.637 57.958 789.15C57.958 789.663 58.0643 790.114 58.277 790.503C58.4897 790.884 58.7757 791.181 59.135 791.394C59.5017 791.599 59.905 791.702 60.345 791.702C60.895 791.702 61.3717 791.555 61.775 791.262C62.1783 790.961 62.4533 790.562 62.6 790.063H61.676C61.456 790.672 61.0123 790.976 60.345 790.976C59.905 790.976 59.5457 790.818 59.267 790.503C58.9883 790.188 58.849 789.74 58.849 789.161C58.849 788.574 58.9883 788.123 59.267 787.808C59.5457 787.493 59.905 787.335 60.345 787.335C60.6677 787.335 60.9463 787.416 61.181 787.577C61.4157 787.731 61.5807 787.955 61.676 788.248H62.6C62.4607 787.727 62.1893 787.324 61.786 787.038C61.3827 786.752 60.9023 786.609 60.345 786.609ZM68.2055 792.197C69.1369 791.449 69.8665 790.837 70.3945 790.36C70.9225 789.876 71.3662 789.374 71.7255 788.853C72.0922 788.325 72.2755 787.808 72.2755 787.302C72.2755 786.825 72.1582 786.451 71.9235 786.18C71.6962 785.901 71.3259 785.762 70.8125 785.762C70.3139 785.762 69.9252 785.92 69.6465 786.235C69.3752 786.543 69.2285 786.957 69.2065 787.478H68.2385C68.2679 786.657 68.5172 786.022 68.9865 785.575C69.4559 785.128 70.0609 784.904 70.8015 784.904C71.5569 784.904 72.1545 785.113 72.5945 785.531C73.0419 785.949 73.2655 786.525 73.2655 787.258C73.2655 787.867 73.0822 788.461 72.7155 789.04C72.3562 789.612 71.9455 790.118 71.4835 790.558C71.0215 790.991 70.4312 791.497 69.7125 792.076H73.4965V792.912H68.2055V792.197ZM74.6537 788.941C74.6537 787.68 74.859 786.697 75.2697 785.993C75.6803 785.282 76.399 784.926 77.4257 784.926C78.445 784.926 79.16 785.282 79.5707 785.993C79.9813 786.697 80.1867 787.68 80.1867 788.941C80.1867 790.224 79.9813 791.222 79.5707 791.933C79.16 792.644 78.445 793 77.4257 793C76.399 793 75.6803 792.644 75.2697 791.933C74.859 791.222 74.6537 790.224 74.6537 788.941ZM79.1967 788.941C79.1967 788.303 79.1527 787.764 79.0647 787.324C78.984 786.877 78.8117 786.517 78.5477 786.246C78.291 785.975 77.917 785.839 77.4257 785.839C76.927 785.839 76.5457 785.975 76.2817 786.246C76.025 786.517 75.8527 786.877 75.7647 787.324C75.684 787.764 75.6437 788.303 75.6437 788.941C75.6437 789.601 75.684 790.155 75.7647 790.602C75.8527 791.049 76.025 791.409 76.2817 791.68C76.5457 791.951 76.927 792.087 77.4257 792.087C77.917 792.087 78.291 791.951 78.5477 791.68C78.8117 791.409 78.984 791.049 79.0647 790.602C79.1527 790.155 79.1967 789.601 79.1967 788.941ZM81.4399 792.197C82.3712 791.449 83.1009 790.837 83.6289 790.36C84.1569 789.876 84.6006 789.374 84.9599 788.853C85.3266 788.325 85.5099 787.808 85.5099 787.302C85.5099 786.825 85.3926 786.451 85.1579 786.18C84.9306 785.901 84.5602 785.762 84.0469 785.762C83.5482 785.762 83.1596 785.92 82.8809 786.235C82.6096 786.543 82.4629 786.957 82.4409 787.478H81.4729C81.5022 786.657 81.7516 786.022 82.2209 785.575C82.6902 785.128 83.2952 784.904 84.0359 784.904C84.7912 784.904 85.3889 785.113 85.8289 785.531C86.2762 785.949 86.4999 786.525 86.4999 787.258C86.4999 787.867 86.3166 788.461 85.9499 789.04C85.5906 789.612 85.1799 790.118 84.7179 790.558C84.2559 790.991 83.6656 791.497 82.9469 792.076H86.7309V792.912H81.4399V792.197ZM92.3211 786.939C92.1597 786.125 91.6574 785.718 90.8141 785.718C90.1614 785.718 89.6737 785.971 89.3511 786.477C89.0284 786.976 88.8707 787.801 88.8781 788.952C89.0467 788.571 89.3254 788.274 89.7141 788.061C90.1101 787.841 90.5501 787.731 91.0341 787.731C91.7894 787.731 92.3907 787.966 92.8381 788.435C93.2927 788.904 93.5201 789.553 93.5201 790.382C93.5201 790.881 93.4211 791.328 93.2231 791.724C93.0324 792.12 92.7391 792.435 92.3431 792.67C91.9544 792.905 91.4814 793.022 90.9241 793.022C90.1687 793.022 89.5784 792.853 89.1531 792.516C88.7277 792.179 88.4307 791.713 88.2621 791.119C88.0934 790.525 88.0091 789.792 88.0091 788.919C88.0091 786.228 88.9477 784.882 90.8251 784.882C91.5437 784.882 92.1084 785.076 92.5191 785.465C92.9297 785.854 93.1717 786.345 93.2451 786.939H92.3211ZM90.8251 788.578C90.5097 788.578 90.2127 788.644 89.9341 788.776C89.6554 788.901 89.4281 789.095 89.2521 789.359C89.0834 789.616 88.9991 789.931 88.9991 790.305C88.9991 790.862 89.1604 791.317 89.4831 791.669C89.8057 792.014 90.2677 792.186 90.8691 792.186C91.3824 792.186 91.7894 792.028 92.0901 791.713C92.3981 791.39 92.5521 790.958 92.5521 790.415C92.5521 789.843 92.4054 789.396 92.1121 789.073C91.8187 788.743 91.3897 788.578 90.8251 788.578ZM100.355 785.333C101.191 785.333 101.913 785.491 102.522 785.806C103.138 786.114 103.607 786.558 103.93 787.137C104.26 787.716 104.425 788.398 104.425 789.183C104.425 789.968 104.26 790.65 103.93 791.229C103.607 791.801 103.138 792.241 102.522 792.549C101.913 792.85 101.191 793 100.355 793H97.9681V785.333H100.355ZM100.355 792.175C101.345 792.175 102.1 791.915 102.621 791.394C103.142 790.866 103.402 790.129 103.402 789.183C103.402 788.23 103.138 787.485 102.61 786.95C102.089 786.415 101.338 786.147 100.355 786.147H98.9691V792.175H100.355ZM106.262 785.993C106.072 785.993 105.91 785.927 105.778 785.795C105.646 785.663 105.58 785.502 105.58 785.311C105.58 785.12 105.646 784.959 105.778 784.827C105.91 784.695 106.072 784.629 106.262 784.629C106.446 784.629 106.6 784.695 106.724 784.827C106.856 784.959 106.922 785.12 106.922 785.311C106.922 785.502 106.856 785.663 106.724 785.795C106.6 785.927 106.446 785.993 106.262 785.993ZM106.746 786.972V793H105.745V786.972H106.746ZM111.389 786.862C112.123 786.862 112.717 787.086 113.171 787.533C113.626 787.973 113.853 788.611 113.853 789.447V793H112.863V789.59C112.863 788.989 112.713 788.53 112.412 788.215C112.112 787.892 111.701 787.731 111.18 787.731C110.652 787.731 110.231 787.896 109.915 788.226C109.607 788.556 109.453 789.036 109.453 789.667V793H108.452V786.972H109.453V787.83C109.651 787.522 109.919 787.284 110.256 787.115C110.601 786.946 110.979 786.862 111.389 786.862ZM115.115 789.964C115.115 789.348 115.239 788.809 115.489 788.347C115.738 787.878 116.079 787.515 116.512 787.258C116.952 787.001 117.439 786.873 117.975 786.873C118.503 786.873 118.961 786.987 119.35 787.214C119.738 787.441 120.028 787.727 120.219 788.072V786.972H121.231V793H120.219V791.878C120.021 792.23 119.724 792.523 119.328 792.758C118.939 792.985 118.484 793.099 117.964 793.099C117.428 793.099 116.944 792.967 116.512 792.703C116.079 792.439 115.738 792.069 115.489 791.592C115.239 791.115 115.115 790.573 115.115 789.964ZM120.219 789.975C120.219 789.52 120.127 789.124 119.944 788.787C119.76 788.45 119.511 788.193 119.196 788.017C118.888 787.834 118.547 787.742 118.173 787.742C117.799 787.742 117.458 787.83 117.15 788.006C116.842 788.182 116.596 788.439 116.413 788.776C116.229 789.113 116.138 789.509 116.138 789.964C116.138 790.426 116.229 790.829 116.413 791.174C116.596 791.511 116.842 791.772 117.15 791.955C117.458 792.131 117.799 792.219 118.173 792.219C118.547 792.219 118.888 792.131 119.196 791.955C119.511 791.772 119.76 791.511 119.944 791.174C120.127 790.829 120.219 790.43 120.219 789.975ZM125.056 793.099C124.594 793.099 124.18 793.022 123.813 792.868C123.447 792.707 123.157 792.487 122.944 792.208C122.732 791.922 122.614 791.596 122.592 791.229H123.626C123.656 791.53 123.795 791.775 124.044 791.966C124.301 792.157 124.635 792.252 125.045 792.252C125.427 792.252 125.727 792.168 125.947 791.999C126.167 791.83 126.277 791.618 126.277 791.361C126.277 791.097 126.16 790.903 125.925 790.778C125.691 790.646 125.328 790.518 124.836 790.393C124.389 790.276 124.022 790.158 123.736 790.041C123.458 789.916 123.216 789.737 123.01 789.502C122.812 789.26 122.713 788.945 122.713 788.556C122.713 788.248 122.805 787.966 122.988 787.709C123.172 787.452 123.432 787.251 123.769 787.104C124.107 786.95 124.492 786.873 124.924 786.873C125.592 786.873 126.131 787.042 126.541 787.379C126.952 787.716 127.172 788.178 127.201 788.765H126.2C126.178 788.45 126.05 788.197 125.815 788.006C125.588 787.815 125.28 787.72 124.891 787.72C124.532 787.72 124.246 787.797 124.033 787.951C123.821 788.105 123.714 788.307 123.714 788.556C123.714 788.754 123.777 788.919 123.901 789.051C124.033 789.176 124.195 789.278 124.385 789.359C124.583 789.432 124.855 789.517 125.199 789.612C125.632 789.729 125.984 789.847 126.255 789.964C126.527 790.074 126.758 790.243 126.948 790.47C127.146 790.697 127.249 790.994 127.256 791.361C127.256 791.691 127.165 791.988 126.981 792.252C126.798 792.516 126.538 792.725 126.2 792.879C125.87 793.026 125.489 793.099 125.056 793.099ZM136.728 787.577C136.728 788.215 136.508 788.747 136.068 789.172C135.635 789.59 134.972 789.799 134.077 789.799H132.603V793H131.602V785.333H134.077C134.942 785.333 135.599 785.542 136.046 785.96C136.501 786.378 136.728 786.917 136.728 787.577ZM134.077 788.974C134.634 788.974 135.045 788.853 135.309 788.611C135.573 788.369 135.705 788.024 135.705 787.577C135.705 786.631 135.162 786.158 134.077 786.158H132.603V788.974H134.077ZM143.472 789.755C143.472 789.946 143.461 790.147 143.439 790.36H138.621C138.658 790.954 138.859 791.42 139.226 791.757C139.6 792.087 140.051 792.252 140.579 792.252C141.012 792.252 141.371 792.153 141.657 791.955C141.95 791.75 142.156 791.478 142.273 791.141H143.351C143.19 791.72 142.867 792.193 142.383 792.56C141.899 792.919 141.298 793.099 140.579 793.099C140.007 793.099 139.494 792.971 139.039 792.714C138.592 792.457 138.24 792.094 137.983 791.625C137.726 791.148 137.598 790.598 137.598 789.975C137.598 789.352 137.723 788.805 137.972 788.336C138.221 787.867 138.57 787.507 139.017 787.258C139.472 787.001 139.992 786.873 140.579 786.873C141.151 786.873 141.657 786.998 142.097 787.247C142.537 787.496 142.874 787.841 143.109 788.281C143.351 788.714 143.472 789.205 143.472 789.755ZM142.438 789.546C142.438 789.165 142.354 788.838 142.185 788.567C142.016 788.288 141.785 788.079 141.492 787.94C141.206 787.793 140.887 787.72 140.535 787.72C140.029 787.72 139.596 787.881 139.237 788.204C138.885 788.527 138.683 788.974 138.632 789.546H142.438ZM145.794 787.951C145.97 787.606 146.22 787.339 146.542 787.148C146.872 786.957 147.272 786.862 147.741 786.862V787.896H147.477C146.355 787.896 145.794 788.505 145.794 789.722V793H144.793V786.972H145.794V787.951ZM151.889 786.862C152.343 786.862 152.754 786.961 153.121 787.159C153.487 787.35 153.773 787.639 153.979 788.028C154.191 788.417 154.298 788.89 154.298 789.447V793H153.308V789.59C153.308 788.989 153.157 788.53 152.857 788.215C152.556 787.892 152.145 787.731 151.625 787.731C151.097 787.731 150.675 787.896 150.36 788.226C150.052 788.556 149.898 789.036 149.898 789.667V793H148.897V784.86H149.898V787.83C150.096 787.522 150.367 787.284 150.712 787.115C151.064 786.946 151.456 786.862 151.889 786.862ZM161.279 786.972V793H160.278V792.109C160.087 792.417 159.82 792.659 159.475 792.835C159.138 793.004 158.764 793.088 158.353 793.088C157.884 793.088 157.462 792.993 157.088 792.802C156.714 792.604 156.417 792.311 156.197 791.922C155.984 791.533 155.878 791.06 155.878 790.503V786.972H156.868V790.371C156.868 790.965 157.018 791.423 157.319 791.746C157.62 792.061 158.03 792.219 158.551 792.219C159.086 792.219 159.508 792.054 159.816 791.724C160.124 791.394 160.278 790.914 160.278 790.283V786.972H161.279ZM163.97 788.094C164.175 787.735 164.476 787.441 164.872 787.214C165.268 786.987 165.719 786.873 166.225 786.873C166.768 786.873 167.255 787.001 167.688 787.258C168.121 787.515 168.462 787.878 168.711 788.347C168.96 788.809 169.085 789.348 169.085 789.964C169.085 790.573 168.96 791.115 168.711 791.592C168.462 792.069 168.117 792.439 167.677 792.703C167.244 792.967 166.76 793.099 166.225 793.099C165.704 793.099 165.246 792.985 164.85 792.758C164.461 792.531 164.168 792.241 163.97 791.889V793H162.969V784.86H163.97V788.094ZM168.062 789.964C168.062 789.509 167.97 789.113 167.787 788.776C167.604 788.439 167.354 788.182 167.039 788.006C166.731 787.83 166.39 787.742 166.016 787.742C165.649 787.742 165.308 787.834 164.993 788.017C164.685 788.193 164.436 788.453 164.245 788.798C164.062 789.135 163.97 789.528 163.97 789.975C163.97 790.43 164.062 790.829 164.245 791.174C164.436 791.511 164.685 791.772 164.993 791.955C165.308 792.131 165.649 792.219 166.016 792.219C166.39 792.219 166.731 792.131 167.039 791.955C167.354 791.772 167.604 791.511 167.787 791.174C167.97 790.829 168.062 790.426 168.062 789.964ZM175.749 786.972V793H174.748V792.109C174.557 792.417 174.289 792.659 173.945 792.835C173.607 793.004 173.233 793.088 172.823 793.088C172.353 793.088 171.932 792.993 171.558 792.802C171.184 792.604 170.887 792.311 170.667 791.922C170.454 791.533 170.348 791.06 170.348 790.503V786.972H171.338V790.371C171.338 790.965 171.488 791.423 171.789 791.746C172.089 792.061 172.5 792.219 173.021 792.219C173.556 792.219 173.978 792.054 174.286 791.724C174.594 791.394 174.748 790.914 174.748 790.283V786.972H175.749ZM180.376 786.862C181.109 786.862 181.703 787.086 182.158 787.533C182.612 787.973 182.84 788.611 182.84 789.447V793H181.85V789.59C181.85 788.989 181.699 788.53 181.399 788.215C181.098 787.892 180.687 787.731 180.167 787.731C179.639 787.731 179.217 787.896 178.902 788.226C178.594 788.556 178.44 789.036 178.44 789.667V793H177.439V786.972H178.44V787.83C178.638 787.522 178.905 787.284 179.243 787.115C179.587 786.946 179.965 786.862 180.376 786.862ZM186.961 786.873C187.482 786.873 187.936 786.987 188.325 787.214C188.721 787.441 189.014 787.727 189.205 788.072V786.972H190.217V793.132C190.217 793.682 190.1 794.17 189.865 794.595C189.63 795.028 189.293 795.365 188.853 795.607C188.42 795.849 187.914 795.97 187.335 795.97C186.543 795.97 185.883 795.783 185.355 795.409C184.827 795.035 184.515 794.525 184.42 793.88H185.41C185.52 794.247 185.747 794.54 186.092 794.76C186.437 794.987 186.851 795.101 187.335 795.101C187.885 795.101 188.332 794.929 188.677 794.584C189.029 794.239 189.205 793.755 189.205 793.132V791.867C189.007 792.219 188.714 792.512 188.325 792.747C187.936 792.982 187.482 793.099 186.961 793.099C186.426 793.099 185.938 792.967 185.498 792.703C185.065 792.439 184.724 792.069 184.475 791.592C184.226 791.115 184.101 790.573 184.101 789.964C184.101 789.348 184.226 788.809 184.475 788.347C184.724 787.878 185.065 787.515 185.498 787.258C185.938 787.001 186.426 786.873 186.961 786.873ZM189.205 789.975C189.205 789.52 189.113 789.124 188.93 788.787C188.747 788.45 188.497 788.193 188.182 788.017C187.874 787.834 187.533 787.742 187.159 787.742C186.785 787.742 186.444 787.83 186.136 788.006C185.828 788.182 185.582 788.439 185.399 788.776C185.216 789.113 185.124 789.509 185.124 789.964C185.124 790.426 185.216 790.829 185.399 791.174C185.582 791.511 185.828 791.772 186.136 791.955C186.444 792.131 186.785 792.219 187.159 792.219C187.533 792.219 187.874 792.131 188.182 791.955C188.497 791.772 188.747 791.511 188.93 791.174C189.113 790.829 189.205 790.43 189.205 789.975ZM191.535 789.964C191.535 789.348 191.659 788.809 191.909 788.347C192.158 787.878 192.499 787.515 192.932 787.258C193.372 787.001 193.859 786.873 194.395 786.873C194.923 786.873 195.381 786.987 195.77 787.214C196.158 787.441 196.448 787.727 196.639 788.072V786.972H197.651V793H196.639V791.878C196.441 792.23 196.144 792.523 195.748 792.758C195.359 792.985 194.904 793.099 194.384 793.099C193.848 793.099 193.364 792.967 192.932 792.703C192.499 792.439 192.158 792.069 191.909 791.592C191.659 791.115 191.535 790.573 191.535 789.964ZM196.639 789.975C196.639 789.52 196.547 789.124 196.364 788.787C196.18 788.45 195.931 788.193 195.616 788.017C195.308 787.834 194.967 787.742 194.593 787.742C194.219 787.742 193.878 787.83 193.57 788.006C193.262 788.182 193.016 788.439 192.833 788.776C192.649 789.113 192.558 789.509 192.558 789.964C192.558 790.426 192.649 790.829 192.833 791.174C193.016 791.511 193.262 791.772 193.57 791.955C193.878 792.131 194.219 792.219 194.593 792.219C194.967 792.219 195.308 792.131 195.616 791.955C195.931 791.772 196.18 791.511 196.364 791.174C196.547 790.829 196.639 790.43 196.639 789.975ZM202.279 786.862C203.012 786.862 203.606 787.086 204.061 787.533C204.516 787.973 204.743 788.611 204.743 789.447V793H203.753V789.59C203.753 788.989 203.603 788.53 203.302 788.215C203.001 787.892 202.591 787.731 202.07 787.731C201.542 787.731 201.12 787.896 200.805 788.226C200.497 788.556 200.343 789.036 200.343 789.667V793H199.342V786.972H200.343V787.83C200.541 787.522 200.809 787.284 201.146 787.115C201.491 786.946 201.868 786.862 202.279 786.862ZM213.469 793L210.312 789.502V793H209.311V785.333H210.312V788.886L213.48 785.333H214.745L211.269 789.172L214.778 793H213.469ZM218.525 793.099C217.96 793.099 217.447 792.971 216.985 792.714C216.53 792.457 216.171 792.094 215.907 791.625C215.65 791.148 215.522 790.598 215.522 789.975C215.522 789.359 215.654 788.816 215.918 788.347C216.189 787.87 216.556 787.507 217.018 787.258C217.48 787.001 217.997 786.873 218.569 786.873C219.141 786.873 219.658 787.001 220.12 787.258C220.582 787.507 220.945 787.867 221.209 788.336C221.48 788.805 221.616 789.352 221.616 789.975C221.616 790.598 221.477 791.148 221.198 791.625C220.926 792.094 220.556 792.457 220.087 792.714C219.617 792.971 219.097 793.099 218.525 793.099ZM218.525 792.219C218.884 792.219 219.221 792.135 219.537 791.966C219.852 791.797 220.105 791.544 220.296 791.207C220.494 790.87 220.593 790.459 220.593 789.975C220.593 789.491 220.497 789.08 220.307 788.743C220.116 788.406 219.867 788.156 219.559 787.995C219.251 787.826 218.917 787.742 218.558 787.742C218.191 787.742 217.854 787.826 217.546 787.995C217.245 788.156 217.003 788.406 216.82 788.743C216.636 789.08 216.545 789.491 216.545 789.975C216.545 790.466 216.633 790.881 216.809 791.218C216.992 791.555 217.234 791.808 217.535 791.977C217.835 792.138 218.165 792.219 218.525 792.219ZM224.153 787.797V791.35C224.153 791.643 224.215 791.852 224.34 791.977C224.465 792.094 224.681 792.153 224.989 792.153H225.726V793H224.824C224.267 793 223.849 792.872 223.57 792.615C223.291 792.358 223.152 791.937 223.152 791.35V787.797H222.371V786.972H223.152V785.454H224.153V786.972H225.726V787.797H224.153ZM226.565 789.964C226.565 789.348 226.689 788.809 226.939 788.347C227.188 787.878 227.529 787.515 227.962 787.258C228.402 787.001 228.889 786.873 229.425 786.873C229.953 786.873 230.411 786.987 230.8 787.214C231.188 787.441 231.478 787.727 231.669 788.072V786.972H232.681V793H231.669V791.878C231.471 792.23 231.174 792.523 230.778 792.758C230.389 792.985 229.934 793.099 229.414 793.099C228.878 793.099 228.394 792.967 227.962 792.703C227.529 792.439 227.188 792.069 226.939 791.592C226.689 791.115 226.565 790.573 226.565 789.964ZM231.669 789.975C231.669 789.52 231.577 789.124 231.394 788.787C231.21 788.45 230.961 788.193 230.646 788.017C230.338 787.834 229.997 787.742 229.623 787.742C229.249 787.742 228.908 787.83 228.6 788.006C228.292 788.182 228.046 788.439 227.863 788.776C227.679 789.113 227.588 789.509 227.588 789.964C227.588 790.426 227.679 790.829 227.863 791.174C228.046 791.511 228.292 791.772 228.6 791.955C228.908 792.131 229.249 792.219 229.623 792.219C229.997 792.219 230.338 792.131 230.646 791.955C230.961 791.772 231.21 791.511 231.394 791.174C231.577 790.829 231.669 790.43 231.669 789.975ZM239.736 793.077C239.23 793.077 238.775 792.989 238.372 792.813C237.976 792.63 237.664 792.38 237.437 792.065C237.21 791.742 237.092 791.372 237.085 790.954H238.152C238.189 791.313 238.335 791.618 238.592 791.867C238.856 792.109 239.237 792.23 239.736 792.23C240.213 792.23 240.587 792.113 240.858 791.878C241.137 791.636 241.276 791.328 241.276 790.954C241.276 790.661 241.195 790.422 241.034 790.239C240.873 790.056 240.671 789.916 240.429 789.821C240.187 789.726 239.861 789.623 239.45 789.513C238.944 789.381 238.537 789.249 238.229 789.117C237.928 788.985 237.668 788.78 237.448 788.501C237.235 788.215 237.129 787.834 237.129 787.357C237.129 786.939 237.235 786.569 237.448 786.246C237.661 785.923 237.958 785.674 238.339 785.498C238.728 785.322 239.171 785.234 239.67 785.234C240.389 785.234 240.975 785.414 241.43 785.773C241.892 786.132 242.152 786.609 242.211 787.203H241.111C241.074 786.91 240.92 786.653 240.649 786.433C240.378 786.206 240.018 786.092 239.571 786.092C239.153 786.092 238.812 786.202 238.548 786.422C238.284 786.635 238.152 786.935 238.152 787.324C238.152 787.603 238.229 787.83 238.383 788.006C238.544 788.182 238.739 788.318 238.966 788.413C239.201 788.501 239.527 788.604 239.945 788.721C240.451 788.86 240.858 789 241.166 789.139C241.474 789.271 241.738 789.48 241.958 789.766C242.178 790.045 242.288 790.426 242.288 790.91C242.288 791.284 242.189 791.636 241.991 791.966C241.793 792.296 241.5 792.564 241.111 792.769C240.722 792.974 240.264 793.077 239.736 793.077ZM249.107 786.972V793H248.106V792.109C247.915 792.417 247.648 792.659 247.303 792.835C246.966 793.004 246.592 793.088 246.181 793.088C245.712 793.088 245.29 792.993 244.916 792.802C244.542 792.604 244.245 792.311 244.025 791.922C243.812 791.533 243.706 791.06 243.706 790.503V786.972H244.696V790.371C244.696 790.965 244.846 791.423 245.147 791.746C245.448 792.061 245.858 792.219 246.379 792.219C246.914 792.219 247.336 792.054 247.644 791.724C247.952 791.394 248.106 790.914 248.106 790.283V786.972H249.107ZM251.798 787.951C251.974 787.606 252.224 787.339 252.546 787.148C252.876 786.957 253.276 786.862 253.745 786.862V787.896H253.481C252.359 787.896 251.798 788.505 251.798 789.722V793H250.797V786.972H251.798V787.951ZM254.527 789.964C254.527 789.348 254.651 788.809 254.901 788.347C255.15 787.878 255.491 787.515 255.924 787.258C256.364 787.001 256.851 786.873 257.387 786.873C257.915 786.873 258.373 786.987 258.762 787.214C259.15 787.441 259.44 787.727 259.631 788.072V786.972H260.643V793H259.631V791.878C259.433 792.23 259.136 792.523 258.74 792.758C258.351 792.985 257.896 793.099 257.376 793.099C256.84 793.099 256.356 792.967 255.924 792.703C255.491 792.439 255.15 792.069 254.901 791.592C254.651 791.115 254.527 790.573 254.527 789.964ZM259.631 789.975C259.631 789.52 259.539 789.124 259.356 788.787C259.172 788.45 258.923 788.193 258.608 788.017C258.3 787.834 257.959 787.742 257.585 787.742C257.211 787.742 256.87 787.83 256.562 788.006C256.254 788.182 256.008 788.439 255.825 788.776C255.641 789.113 255.55 789.509 255.55 789.964C255.55 790.426 255.641 790.829 255.825 791.174C256.008 791.511 256.254 791.772 256.562 791.955C256.87 792.131 257.211 792.219 257.585 792.219C257.959 792.219 258.3 792.131 258.608 791.955C258.923 791.772 259.172 791.511 259.356 791.174C259.539 790.829 259.631 790.43 259.631 789.975ZM263.335 788.094C263.541 787.735 263.841 787.441 264.237 787.214C264.633 786.987 265.084 786.873 265.59 786.873C266.133 786.873 266.621 787.001 267.053 787.258C267.486 787.515 267.827 787.878 268.076 788.347C268.326 788.809 268.45 789.348 268.45 789.964C268.45 790.573 268.326 791.115 268.076 791.592C267.827 792.069 267.482 792.439 267.042 792.703C266.61 792.967 266.126 793.099 265.59 793.099C265.07 793.099 264.611 792.985 264.215 792.758C263.827 792.531 263.533 792.241 263.335 791.889V793H262.334V784.86H263.335V788.094ZM267.427 789.964C267.427 789.509 267.336 789.113 267.152 788.776C266.969 788.439 266.72 788.182 266.404 788.006C266.096 787.83 265.755 787.742 265.381 787.742C265.015 787.742 264.674 787.834 264.358 788.017C264.05 788.193 263.801 788.453 263.61 788.798C263.427 789.135 263.335 789.528 263.335 789.975C263.335 790.43 263.427 790.829 263.61 791.174C263.801 791.511 264.05 791.772 264.358 791.955C264.674 792.131 265.015 792.219 265.381 792.219C265.755 792.219 266.096 792.131 266.404 791.955C266.72 791.772 266.969 791.511 267.152 791.174C267.336 790.829 267.427 790.426 267.427 789.964ZM269.394 789.964C269.394 789.348 269.519 788.809 269.768 788.347C270.017 787.878 270.358 787.515 270.791 787.258C271.231 787.001 271.719 786.873 272.254 786.873C272.782 786.873 273.24 786.987 273.629 787.214C274.018 787.441 274.307 787.727 274.498 788.072V786.972H275.51V793H274.498V791.878C274.3 792.23 274.003 792.523 273.607 792.758C273.218 792.985 272.764 793.099 272.243 793.099C271.708 793.099 271.224 792.967 270.791 792.703C270.358 792.439 270.017 792.069 269.768 791.592C269.519 791.115 269.394 790.573 269.394 789.964ZM274.498 789.975C274.498 789.52 274.406 789.124 274.223 788.787C274.04 788.45 273.79 788.193 273.475 788.017C273.167 787.834 272.826 787.742 272.452 787.742C272.078 787.742 271.737 787.83 271.429 788.006C271.121 788.182 270.875 788.439 270.692 788.776C270.509 789.113 270.417 789.509 270.417 789.964C270.417 790.426 270.509 790.829 270.692 791.174C270.875 791.511 271.121 791.772 271.429 791.955C271.737 792.131 272.078 792.219 272.452 792.219C272.826 792.219 273.167 792.131 273.475 791.955C273.79 791.772 274.04 791.511 274.223 791.174C274.406 790.829 274.498 790.43 274.498 789.975ZM282.393 786.972L278.763 795.838H277.729L278.917 792.934L276.486 786.972H277.597L279.489 791.856L281.359 786.972H282.393ZM283.026 789.964C283.026 789.348 283.15 788.809 283.4 788.347C283.649 787.878 283.99 787.515 284.423 787.258C284.863 787.001 285.35 786.873 285.886 786.873C286.414 786.873 286.872 786.987 287.261 787.214C287.649 787.441 287.939 787.727 288.13 788.072V786.972H289.142V793H288.13V791.878C287.932 792.23 287.635 792.523 287.239 792.758C286.85 792.985 286.395 793.099 285.875 793.099C285.339 793.099 284.855 792.967 284.423 792.703C283.99 792.439 283.649 792.069 283.4 791.592C283.15 791.115 283.026 790.573 283.026 789.964ZM288.13 789.975C288.13 789.52 288.038 789.124 287.855 788.787C287.671 788.45 287.422 788.193 287.107 788.017C286.799 787.834 286.458 787.742 286.084 787.742C285.71 787.742 285.369 787.83 285.061 788.006C284.753 788.182 284.507 788.439 284.324 788.776C284.14 789.113 284.049 789.509 284.049 789.964C284.049 790.426 284.14 790.829 284.324 791.174C284.507 791.511 284.753 791.772 285.061 791.955C285.369 792.131 285.71 792.219 286.084 792.219C286.458 792.219 286.799 792.131 287.107 791.955C287.422 791.772 287.671 791.511 287.855 791.174C288.038 790.829 288.13 790.43 288.13 789.975Z" fill="#8FAACB" />
</g></svg>`;

  /* ================================================================ 2. Konten simulasi untuk layar */
  const RAMP = ['#1E4B78', '#2F64A0', '#4F86C6', '#79A6DA', '#A9C8EC', '#C9DCF2'];
  const RAMP_INK = ['#fff', '#fff', '#fff', '#0F2D4E', '#0F2D4E', '#0F2D4E'];
  const HEX = { red: '#C83A44', amber: '#E2A23B', blue: '#2F64A0', green: '#2F8F5B' };
  const RANK_ORDER = ['A4', 'A1', 'A3', 'A2', 'A5'];

  const TREND = [['5 Okt', 1785], ['12 Okt', 1822], ['19 Okt', 1905], ['26 Okt', 1860], ['2 Nov', 1950], ['9 Nov', 2006], ['16 Nov', 2140], ['Hari ini', 2090]];
  const ALERTS = [
    { tone: 'red', title: 'A4 penuh 95% di jam sibuk', time: '07:42', text: 'Pukul 06.30–08.30 penumpang tertinggal di Halte St. Gubeng.' },
    { tone: 'red', title: 'A3 menunggu 30 menit', time: '07:15', text: 'Dua kali lipat target SPM 15 menit.' },
    { tone: 'amber', title: 'FD-04-07 masuk bengkel', time: '06:50', text: 'Servis rem, estimasi kembali 22 November.' },
    { tone: 'green', title: 'Pelacakan GPS normal', time: '06:15', text: 'Seluruh unit aktif terpantau 5 menit lalu.' },
  ];
  const COMPLAINTS = [['Armada penuh', 34], ['Menunggu terlalu lama', 27], ['Pelayanan pengemudi', 12], ['Kebersihan unit', 8]];
  const BUSY_STOPS = [['Stasiun Gubeng', 'A4', 182], ['TIJ Joyoboyo', 'A4 · A5', 164], ['Tunjungan Plaza', 'A1', 140], ['Terminal Benowo', 'A1', 96]];
  const STOP_CAPACITY = 150; // orang/jam per halte sebelum dianggap melebihi kapasitas
  const GROUPS = ['Koridor Barat – Pusat', 'Koridor Sidoarjo – Selatan', 'Koridor Timur – Barat', 'Koridor Intermoda Pusat', 'Koridor Barat Daya', 'Koridor Timur – Pusat'];
  const DEPOTS = ['Depo Benowo', 'Depo Joyoboyo', 'Depo Kenjeran'];
  const MODES = ['Suroboyo Bus', 'Trans Semanggi', 'Kereta komuter', 'Terminal antarkota', 'Feeder lain'];

  // 48 unit armada: 2 perawatan dan 2 cadangan, sisanya beroperasi (cocok dengan 44/48 unit aktif).
  const UNIT_SPOTS = {
    A1: ['Tunjungan Plaza', 'Terminal Benowo', 'Halte Tandes', 'Halte Darmo', 'Halte Pasar Kembang', 'Halte Embong Malang', 'Halte Pakal', 'Halte Basuki Rahmat', 'Halte Sono Kembang'],
    A2: ['DTC Wonokromo', 'Puspa Agro', 'Halte Jemursari', 'Halte Margorejo', 'Halte Siwalankerto', 'Halte Wonocolo', 'Halte Ketintang', 'Halte Gayungan'],
    A3: ['Kenjeran Park', 'Mayjend Sungkono', 'Halte Kapas Krampung', 'Halte Tambaksari', 'Halte Kertajaya', 'Halte Dharmawangsa', 'Halte Kusuma Bangsa', 'Halte Kedung Cowek'],
    A4: ['Stasiun Gubeng', 'TIJ Joyoboyo', 'Halte Bratang', 'Halte Ngagel', 'Halte Biliton', 'Halte Sulawesi', 'Halte Darmo Kali', 'Halte Bung Tomo', 'Halte Raya Gubeng', 'Halte Pucang', 'Halte Barata Jaya'],
    A5: ['TIJ Joyoboyo', 'Lakarsantri', 'Halte Gunungsari', 'Halte Mastrip', 'Halte Kebraon', 'Halte Karangpilang', 'Halte Wiyung', 'Halte Bangkingan'],
  };
  const UNITS = (() => {
    const special = { 'FD-04-07': ['Perawatan', 'Servis rem · kembali 22 Nov'], 'FD-01-03': ['Perawatan', 'Ganti ban · kembali 21 Nov'],
      'FD-03-09': ['Cadangan', 'Siaga di Depo Kenjeran'], 'FD-05-09': ['Cadangan', 'Siaga di Depo Joyoboyo'] };
    const out = [];
    S.CORRIDORS.forEach((c, i) => {
      let k = 0;
      for (let n = 1; n <= c.units; n++) {
        const id = `FD-0${i + 1}-${String(n).padStart(2, '0')}`;
        const sp = special[id];
        out.push({ id, n, code: c.code, corridor: c.name, status: sp ? sp[0] : 'Beroperasi',
          note: sp ? sp[1] : `Dekat ${UNIT_SPOTS[c.code][k++ % UNIT_SPOTS[c.code].length]}` });
      }
    });
    const st = { Perawatan: 0, Cadangan: 1, Beroperasi: 2 };
    return out.sort((a, b) => st[a.status] - st[b.status] || RANK_ORDER.indexOf(a.code) - RANK_ORDER.indexOf(b.code) || a.n - b.n);
  })();

  // 24 dokumen arsip sejak Agustus 2025: 16 prioritas bulanan, 5 evaluasi kuartal, 3 simulasi pembobotan.
  const ARCHIVE = (() => {
    const monthly = [
      [2026, 11, 894, '2026-11-20', 2.9], [2026, 10, 812, '2026-10-28', 2.8], [2026, 9, 733, '2026-09-26', 2.6], [2026, 8, 655, '2026-08-27', 2.7],
      [2026, 7, 571, '2026-07-29', 2.5], [2026, 6, 498, '2026-06-26', 2.6], [2026, 5, 417, '2026-05-27', 2.4], [2026, 4, 341, '2026-04-28', 2.4],
      [2026, 3, 266, '2026-03-27', 2.3], [2026, 2, 190, '2026-02-26', 2.3], [2026, 1, 112, '2026-01-29', 2.2], [2025, 12, 905, '2025-12-22', 2.5],
      [2025, 11, 826, '2025-11-27', 2.4], [2025, 10, 748, '2025-10-29', 2.3], [2025, 9, 669, '2025-09-26', 2.2], [2025, 8, 590, '2025-08-28', 2.1],
    ].map(([y, m, no, created, size]) => ({ id: `p-${y}-${m}`, title: `Prioritas ${MONTH[m - 1]} ${y}`, no: `551.2/${no}/436.7.14/${y}`,
      type: 'Prioritas bulanan', period: `${MON[m - 1]} ${y}`, year: y, created, formats: ['PDF'], size, status: y === 2026 && m === 11 ? 'Menunggu' : 'Disahkan' }));
    const quarter = [
      ['III 2026', 'EVL-FDR/2026/III', 'Jul – Sep 2026', 2026, '2026-09-30', 4.3], ['II 2026', 'EVL-FDR/2026/II', 'Apr – Jun 2026', 2026, '2026-06-30', 4.1],
      ['I 2026', 'EVL-FDR/2026/I', 'Jan – Mar 2026', 2026, '2026-03-31', 3.9], ['IV 2025', 'EVL-FDR/2025/IV', 'Okt – Des 2025', 2025, '2025-12-31', 3.8],
      ['III 2025', 'EVL-FDR/2025/III', 'Agu – Sep 2025', 2025, '2025-09-30', 3.6],
    ].map(([q, no, period, year, created, size]) => ({ id: no, title: `Evaluasi Kuartal ${q}`, no, type: 'Evaluasi kuartal', period, year, created, formats: ['PDF', 'XLSX'], size, status: 'Arsip' }));
    const sims = [
      ['SIM-FDR/2026/02', 'Sep 2026', 2026, '2026-09-15', 1.4], ['SIM-FDR/2026/01', 'Mar 2026', 2026, '2026-03-12', 1.2], ['SIM-FDR/2025/01', 'Agu 2025', 2025, '2025-08-20', 1.1],
    ].map(([no, period, year, created, size]) => ({ id: no, title: 'Simulasi Pembobotan', no, type: 'Simulasi pembobotan', period, year, created, formats: ['XLSX'], size, status: 'Arsip' }));
    return [...monthly, ...quarter, ...sims].sort((a, b) => b.created.localeCompare(a.created));
  })();

  // Geometri peta skematik (viewBox 600 × 524), digambar ulang dari layar Peta Rute.
  const MAP = {
    A1: { pts: [[48, 89], [166, 126], [256, 136], [329, 157]], buses: [[188, 129], [274, 138]], stops: [[231, 134]], tag: [150, 150] },
    A3: { pts: [[204, 251], [256, 224], [336, 204], [396, 159], [456, 114], [540, 67]], buses: [[292, 214], [438, 125]], stops: [[377, 171], [496, 92]], tag: [348, 214] },
    A4: { pts: [[312, 324], [346, 269], [386, 222], [420, 193], [428, 234], [443, 293]], buses: [[332, 289], [383, 225], [431, 240]], stops: [[362, 249]], tag: [352, 279] },
    A5: { pts: [[60, 351], [146, 341], [185, 344], [223, 337], [312, 324]], buses: [[185, 344]], stops: [[146, 341], [223, 337]], tag: [196, 363] },
    A2: { pts: [[120, 471], [224, 434], [270, 419], [316, 400], [347, 382]], buses: [[224, 434]], stops: [[270, 419], [316, 400]], tag: [206, 459] },
  };
  const HUBS = [
    [48, 89, 'Terminal Benowo', 60, 112], [329, 157, 'Tunjungan Plaza', 342, 146], [204, 251, 'Mayjend Sungkono', 216, 241],
    [540, 67, 'Kenjeran Park', 528, 92, 'end'], [312, 324, 'TIJ Joyoboyo', 298, 331, 'end'], [420, 193, 'St. Gubeng', 434, 184],
    [443, 293, 'Bratang', 456, 283], [60, 351, 'Lakarsantri', 72, 340], [120, 471, 'Puspa Agro', 132, 462], [347, 382, 'DTC Wonokromo', 360, 372],
  ];

  /* ================================================================ 3. State */
  const DEFAULT_VERSION = '15 Sep 2026 · Tim Analis';
  const state = {
    corridors: S.CORRIDORS.map(c => ({ ...c })),
    newCorridors: [],
    weights: S.defaultWeights(),
    weightsVersion: DEFAULT_VERSION,
    settings: { ...S.SETTINGS, recalc: 'daily' },
    draft: null,
    snapshot: null, // perhitungan yang dibekukan saat "Setuju & Buat Laporan"
    reports: ARCHIVE.map(d => ({ ...d })),
    history: [
      { time: '20 Nov · 06:15', text: 'Sinkronisasi otomatis GPS & tiket elektronik', color: '#2F64A0' },
      { time: '18 Nov · 16:40', text: 'Unit FD-04-07 berstatus perawatan oleh Admin Depo', color: '#E2A23B' },
      { time: '15 Nov · 09:10', text: 'Data keluhan WargaKu diperbarui', color: '#A9C8EC' },
      { time: '1 Nov · 08:00', text: 'Panjang trayek A4 diperbarui menjadi 24,0 km', color: '#9AA8B8' },
    ],
    ui: {
      login: { user: 'bambang.irawan@dishub.surabaya.go.id', pass: 'wirawiri2026', err: {} },
      showPw: false, lastSync: '06:15', koridorQuery: '', showAllUnits: false,
      drawerFilter: 'all', mapFilter: 'all', mapFleet: true, mapSelected: 'A4', zoom: 1,
      tableMode: 'norm', expanded: 'A4',
      report: { lampiran: true, ringkasan: true, peta: true, pengesahan: false, format: 'pdf', zoom: 100 },
      archive: { tab: 'all', q: '', year: 'all', status: 'all', page: 1 },
      notif: { load: true, wait: true, rec: true, approved: false },
      channels: { Dashboard: true, Email: true, SMS: false },
      form: null, formErrors: {}, syncing: false,
    },
  };

  /* ================================================================ 4. Komponen kecil */
  const calc = (weights = state.weights, settings = state.settings) =>
    S.evaluate(state.corridors, weights, { maxExtraUnits: settings.maxExtraUnits });
  const statusOf = c => S.status(c, state.settings);
  const catColor = cat => ({ red: 'var(--red)', amber: 'var(--amber-bar)', blue: 'var(--blue)', green: 'var(--green)' }[cat.tone]);
  const catBadge = cat => `<span class="badge t-${cat.tone}">${cat.label}</span>`;
  const statusBadge = st => `<span class="badge t-${st.tone}">${st.label}</span>`;
  const levelClass = l => ['c-green', 'c-amber', 'c-red'][l];
  const weightsChanged = () => state.weights.some((w, i) => w !== S.CRITERIA[i].weight);

  function cardHead(icon, title, sub, right = '') {
    return `<div class="card-head"><div class="card-title">${ic(icon, 18)}<div><h2>${title}</h2>${sub ? `<p class="card-sub">${sub}</p>` : ''}</div></div>${right}</div>`;
  }
  function pageHead(title, sub, actions = '', crumb = '') {
    return `<div class="page-head"><div>${crumb}<h1>${title}</h1><p class="page-sub">${sub}</p></div>${actions ? `<div class="actions">${actions}</div>` : ''}</div>`;
  }
  const crumb = (href, label, here) => `<nav class="crumb" aria-label="Lokasi"><a href="${href}">${ic('arrow-left', 14)}${label}</a>${ic('chev-right', 12)}<span>${here}</span></nav>`;

  // Nilai mentah tiap kriteria sesuai satuannya.
  function fmtRaw(j, x) {
    return [num(x), `${x}%`, `${x} mnt`, `${x}/bln`, num(x, 2), `${x}/5`][j];
  }
  const fmtPlain = (j, x) => (j === 4 ? num(x, 2) : num(x));

  // Ringkasan perkiraan dampak dari usulan unit.
  function impactSummary(ev) {
    const before = avg(state.corridors.map(c => c.wait));
    const after = avg(ev.ranked.map(r => S.impact(r.corridor, r.units).wait));
    return { before, after, delta: after - before };
  }

  // Dua sorotan singkat per koridor, dibandingkan dengan SPM.
  function corridorTags(c) {
    const st = state.settings, t = [];
    if (c.load >= st.loadCritical) t.push(`Bus penuh ${c.load}%`);
    else if (c.load > st.loadIdeal[1]) t.push(`Bus padat ${c.load}%`);
    if (c.wait > st.waitMax) t.push(`Menunggu ${c.wait} menit`);
    if (t.length < 2 && c.complaints >= 20) t.push(`${c.complaints} keluhan`);
    return t.length ? t.slice(0, 2) : ['Layanan sesuai target'];
  }

  // Label usulan unit, termasuk saat dipotong batas "tambahan armada maksimal".
  function unitsLabel(r) {
    if (r.units && r.units === r.needed) return { main: `+${r.units} unit`, sub: 'diusulkan', none: false };
    if (r.units) return { main: `+${r.units} unit`, sub: `dibatasi anggaran (perlu +${r.needed})`, none: false };
    if (r.needed) return { main: 'Ditunda', sub: 'melebihi batas anggaran', none: true };
    return { main: 'Cukup', sub: 'tidak perlu tambahan', none: true };
  }

  function scoreBar(r) {
    return `<div class="row"><div class="bar" style="flex:1"><i style="width:${r.score}%;background:${catColor(r.category)}"></i></div></div>`;
  }

  /* ================================================================ 5. Halaman */
  const PAGES = {};

  /* ---------- Masuk ---------- */
  // Panel kiri memakai ilustrasi asli dari Figma (frame 2). Bus masuk dari kiri seperti
  // Smart Animate dari frame 1 ke frame 2; waktunya diatur di index.html (variabel --bus-*).
  function loginForm() {
    const f = state.ui.login, e = f.err;
    const err = k => (e[k] ? `<p class="error-text" id="err-${k}">${ic('alert', 14)}${e[k]}</p>` : '');
    return `<div class="login-card">
          <p class="over">SELAMAT DATANG</p>
          <h1>Masuk ke WiraWiri</h1>
          <p class="muted mt-8">Gunakan email dinas atau NIP pegawai Anda.</p>
          <form data-submit="login" novalidate>
            <div class="field"><label for="lg-user">Email / NIP Pegawai</label>
              <div class="input ${e.user ? 'is-invalid' : ''}">${ic('user', 20)}<input id="lg-user" name="user" data-input="login" value="${esc(f.user)}" autocomplete="username" ${e.user ? 'aria-invalid="true" aria-describedby="err-user"' : ''}></div>${err('user')}</div>
            <div class="field"><div class="between"><label for="lg-pass">Kata Sandi</label><button type="button" class="btn-link" data-action="toast" data-msg="Tautan atur ulang kata sandi dikirim ke email dinas (contoh).">Lupa kata sandi?</button></div>
              <div class="input ${e.pass ? 'is-invalid' : ''}">${ic('lock', 20)}<input id="lg-pass" name="pass" data-input="login" type="${state.ui.showPw ? 'text' : 'password'}" value="${esc(f.pass)}" autocomplete="current-password" ${e.pass ? 'aria-invalid="true" aria-describedby="err-pass"' : ''}>
                <button type="button" class="input-btn" data-action="toggle-pw" aria-label="${state.ui.showPw ? 'Sembunyikan' : 'Tampilkan'} kata sandi">${ic(state.ui.showPw ? 'eye-off' : 'eye', 20)}</button></div>${err('pass')}</div>
            <label class="check"><input type="checkbox"> Ingat saya di perangkat ini</label>
            <button class="btn btn-primary btn-block" style="height:52px;font-size:15px">${ic('login', 20)} Masuk</button>
          </form>
          <div class="help">${ic('help', 18)} Butuh bantuan? <button type="button" data-action="toast" data-msg="Admin Dishub dapat dihubungi lewat ekstensi 2104 (contoh).">Hubungi Admin Dishub</button></div>
        </div>
        <p class="login-foot">${ic('shield', 16)} Akses khusus pegawai Dinas Perhubungan Kota Surabaya</p>`;
  }

  PAGES.login = () => `<div class="login">
      <section class="login-art">${LOGIN_ART()}</section>
      <section class="login-main" id="login-main">${loginForm()}</section>
    </div>`;

  /* ---------- Dashboard ---------- */
  function trendChart() {
    const W = 560, H = 250, L = 46, R = 18, T = 40, B = 30, lo = 1600, hi = 2200;
    const x = i => L + (i * (W - L - R)) / (TREND.length - 1);
    const y = v => T + ((hi - v) / (hi - lo)) * (H - T - B);
    const pts = TREND.map(([, v], i) => [x(i), y(v)]);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    const peak = TREND.reduce((b, p, i) => (p[1] > TREND[b][1] ? i : b), 0);
    const [px, py] = pts[peak];
    const grid = [1600, 1800, 2000, 2200].map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#E3E9F1" stroke-dasharray="4 4"/><text x="${L - 10}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#9AA8B8">${num(v)}</text>`).join('');
    const labels = TREND.map(([l], i) => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" font-size="11" fill="${i === TREND.length - 1 ? '#0F2D4E' : '#6A788A'}" font-weight="${i === TREND.length - 1 ? 600 : 400}">${l}</text>`).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Penumpang harian naik dari ${num(TREND[0][1])} menjadi ${num(TREND[TREND.length - 1][1])} dalam 8 minggu, puncak ${num(TREND[peak][1])} pada ${TREND[peak][0]}">
      <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F64A0" stop-opacity=".22"/><stop offset="1" stop-color="#2F64A0" stop-opacity="0"/></linearGradient>
      <linearGradient id="ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#79A6DA"/><stop offset="1" stop-color="#1E4B78"/></linearGradient></defs>
      ${grid}
      <path d="${line} L${x(TREND.length - 1)} ${H - B} L${L} ${H - B} Z" fill="url(#area)"/>
      <line x1="${px}" x2="${px}" y1="${py}" y2="${H - B}" stroke="#1E4B78" stroke-dasharray="3 3"/>
      <path d="${line}" fill="none" stroke="url(#ln)" stroke-width="2.5" stroke-linejoin="round"/>
      ${pts.map(([a, b], i) => `<circle cx="${a}" cy="${b}" r="${i === peak ? 5.5 : 4}" fill="#fff" stroke="#2F64A0" stroke-width="2"/>`).join('')}
      <g transform="translate(${px} ${py - 22})"><rect x="-55" y="-17" width="110" height="28" rx="8" fill="#0F2D4E"/><text y="2" text-anchor="middle" font-size="12" font-weight="600" fill="#fff">Puncak ${num(TREND[peak][1])}</text></g>
      ${labels}
    </svg>`;
  }

  PAGES.dashboard = () => {
    const cs = state.corridors, st = state.settings, ev = calc();
    const pax = sum(cs.map(c => c.passengers)), active = sum(cs.map(c => c.active)), units = sum(cs.map(c => c.units));
    const wait = avg(cs.map(c => c.wait)), load = avg(cs.map(c => c.load));
    const maint = UNITS.filter(u => u.status === 'Perawatan').length, reserve = UNITS.filter(u => u.status === 'Cadangan').length;
    const last = TREND[TREND.length - 1][1], prevWeek = TREND[TREND.length - 3][1], wow = ((last - prevWeek) / prevWeek) * 100;
    const growth = ((last - TREND[0][1]) / TREND[0][1]) * 100;
    const waitB = wait <= st.waitMax ? ['t-green', 'Sesuai target'] : ['t-red', 'Di atas target'];
    const loadB = load <= st.loadIdeal[1] ? ['t-green', 'Ideal'] : load < st.loadCritical ? ['t-amber', 'Padat'] : ['t-red', 'Penuh'];
    const byPax = cs.slice().sort((a, b) => b.passengers - a.passengers);
    const maxPax = byPax[0].passengers;
    const complaints = sum(cs.map(c => c.complaints));
    const top = ev.ranked[0], next = ev.ranked.slice(1).filter(r => r.units > 0);
    const kpi = (icon, label, value, unit, foot, hero = false) => `<div class="card kpi ${hero ? 'kpi-hero' : ''}">
        <div class="kpi-top"><span class="kpi-icon">${ic(icon, 20)}</span><span>${label}</span></div>
        <div class="kpi-value">${value}<small>${unit}</small></div><div class="kpi-foot">${foot}</div></div>`;
    return `
    ${pageHead('Dashboard Operasional', 'Ringkasan layanan feeder WiraWiri Suroboyo · Jumat, 20 November 2026',
      `<span class="meta-note">${ic('refresh', 16)} Diperbarui ${state.ui.lastSync} WIB</span><button class="btn" data-action="dashboard-csv">${ic('download', 16)} Unduh Ringkasan</button>`)}
    <div class="grid g-4">
      ${kpi('users', 'Penumpang Hari Ini', num(pax), 'orang', `<span class="up">${wow >= 0 ? '▲' : '▼'} ${num(Math.abs(wow), 1)}%</span> dari minggu lalu`, true)}
      ${kpi('bus', 'Armada Beroperasi', `${active}/${units}`, 'unit', `${maint} perawatan · ${reserve} cadangan`)}
      ${kpi('clock', 'Rata-rata Waktu Tunggu', num(wait, 1), 'menit', `<span class="badge plain ${waitB[0]}">${waitB[1]}</span> ≤ ${st.waitMax} menit`)}
      ${kpi('gauge', 'Kepadatan Rata-rata', num(load, 1) + '%', '', `<span class="badge plain ${loadB[0]}">${loadB[1]}</span> ideal ${st.loadIdeal[0]}–${st.loadIdeal[1]}%`)}
    </div>
    <div class="grid g-2-1">
      <section class="card pad">${cardHead('trend', 'Tren Penumpang Harian', 'Rata-rata per hari, 8 minggu terakhir', `<span class="badge plain t-blue">▲ ${num(growth)}% sejak Oktober</span>`)}${trendChart()}</section>
      <section class="card pad">${cardHead('bars', 'Penumpang per Koridor', 'Hari ini, diurutkan dari terbanyak')}
        <div class="hbar-list">${byPax.map(c => `<div><div class="between"><span><b>${c.code}</b>&nbsp; ${c.name}</span><b>${num(c.passengers)}</b></div><div class="bar"><i style="width:${(c.passengers / maxPax) * 100}%"></i></div></div>`).join('')}</div>
        <div class="note mt-20">${ic('info', 18)} ${byPax[0].code} melayani ${num((byPax[0].passengers / pax) * 100)}% penumpang harian</div>
      </section>
    </div>
    <section class="card">
      <div class="pad-x">${cardHead('activity', 'Kinerja Koridor Hari Ini', 'Dibandingkan standar pelayanan minimal (SPM) Dishub', `<a class="btn-link" href="#/dashboard/koridor">Lihat Data Koridor ${ic('arrow-right', 16)}</a>`)}</div>
      <div class="tbl-wrap"><table class="tbl compact nowrap">
        <thead><tr><th>Kode</th><th>Koridor</th><th class="center">Armada aktif</th><th class="num">Penumpang</th><th>Kepadatan</th><th>Waktu tunggu</th><th class="num">Tepat waktu</th><th>Status</th></tr></thead>
        <tbody>${cs.map(c => { const s = statusOf(c); return `<tr>
          <td class="code">${c.code}</td><td class="name"><b>${c.name}</b><small>${c.group}</small></td>
          <td class="center">${c.active} / ${c.units}</td><td class="num">${num(c.passengers)}</td>
          <td><div class="row"><div class="bar" style="width:80px"><i style="width:${c.load}%;background:${['var(--green)', 'var(--amber-bar)', 'var(--red)'][s.loadLevel]}"></i></div><b class="${levelClass(s.loadLevel)}">${c.load}%</b></div></td>
          <td><b class="${levelClass(s.waitLevel)}">${c.wait} menit</b><small class="muted" style="display:block;font-size:12px">target ≤ ${st.waitMax}</small></td>
          <td class="num">${c.onTime}%</td><td>${statusBadge(s)}</td></tr>`; }).join('')}</tbody>
      </table></div>
    </section>
    <div class="grid g-3">
      <section class="card pad">${cardHead('alert', 'Peringatan Operasional', 'Hari ini')}
        <div class="alert-list">${ALERTS.map(a => `<div class="alert-item"><i style="background:${HEX[a.tone]}"></i><b>${a.title}</b><time>${a.time}</time><p>${a.text}</p></div>`).join('')}</div></section>
      <section class="card pad">${cardHead('message', 'Keluhan Warga', 'Bulan November 2026')}
        <div class="between mt-20"><span class="big-num">${complaints}<small>laporan</small></span><span class="badge plain t-red">▲ 12 dari Oktober</span></div>
        <div class="hbar-list">${COMPLAINTS.map(([l, v], i) => `<div><div class="between"><span>${l}</span><b>${v}</b></div><div class="bar"><i style="width:${(v / COMPLAINTS[0][1]) * 100}%;background:${RAMP[i + 1]}"></i></div></div>`).join('')}</div>
        <p class="small muted mt-20">Sumber: kanal WargaKu &amp; petugas halte</p></section>
      <section class="card pad">${cardHead('list', 'Rekomendasi Armada', 'Diperbarui otomatis · November 2026')}
        <div class="prio"><span class="over">PRIORITAS UTAMA</span><b>${top.code} · ${top.corridor.name}</b>
          <div class="between mt-8"><span class="big">${top.units ? `+${top.units} unit` : 'Cukup'}</span><span class="small" style="text-align:right;color:#C9D8E8">Kebutuhan<br><b style="font-size:17px;color:#fff;display:inline">${top.score}/100</b></span></div></div>
        ${next.map(r => `<div class="mini-rank"><span class="n">${r.rank}</span><span>${r.code} · ${r.corridor.name}</span><span class="u">+${r.units} unit</span><small>Kebutuhan ${r.score}/100</small></div>`).join('')}
        <div class="between mt-16"><span class="muted">Total usulan</span><b>+${ev.totalUnits} unit</b></div>
        <a class="btn btn-soft btn-block mt-16" href="#/dashboard/rekomendasi">Lihat Rekomendasi ${ic('arrow-right', 16)}</a></section>
    </div>`;
  };

  /* ---------- Peta Rute ---------- */
  function mapSvg({ filter = 'all', fleet = true, selected = null, zoom = 1, compact = false } = {}) {
    const items = state.corridors.map(c => ({ c, g: MAP[c.code], st: statusOf(c) })).filter(o => o.g);
    const dim = o => filter !== 'all' && o.st.label.toLowerCase() !== filter;
    const order = items.slice().sort((a, b) => (a.c.code === selected) - (b.c.code === selected));
    const path = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
    const lines = order.map(o => {
      const col = HEX[o.st.tone], sel = o.c.code === selected, op = dim(o) ? 0.18 : 1;
      return `<g opacity="${op}" id="map-${o.c.code}">
        ${sel ? `<path d="${path(o.g.pts)}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
        <path d="${path(o.g.pts)}" fill="none" stroke="${col}" stroke-width="${sel ? 7 : 5}" stroke-linecap="round" stroke-linejoin="round"/>
        ${o.g.stops.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#fff" stroke="${col}" stroke-width="2"/>`).join('')}
        ${fleet ? o.g.buses.map(([x, y]) => `<g transform="translate(${x} ${y})"><circle r="10" fill="#0F2D4E" stroke="#fff" stroke-width="2"/><rect x="-5" y="-5" width="10" height="8" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M-5 -1h10M-3 3v2M3 3v2" stroke="#fff" stroke-width="1.5"/></g>`).join('') : ''}
        <g transform="translate(${o.g.tag[0]} ${o.g.tag[1]})"><rect x="-15" y="-10" width="30" height="20" rx="5" fill="${col}"/><text y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${o.c.code}</text></g>
      </g>`;
    }).join('');
    const hubs = HUBS.map(([x, y, label, lx, ly, anchor]) => {
      const w = label.length * 5.6 + 14, bx = anchor === 'end' ? lx - w + 7 : lx - 7;
      return `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="#0F2D4E" stroke-width="3"/>
        ${compact ? '' : `<rect x="${bx}" y="${ly - 12}" width="${w}" height="18" rx="5" fill="#fff" stroke="#E3E9F1"/><text x="${anchor === 'end' ? lx : lx}" y="${ly + 1}" text-anchor="${anchor || 'start'}" font-size="10" fill="#1B2A3A">${label}</text>`}`;
    }).join('');
    return `<svg viewBox="0 0 600 524" role="img" aria-label="Peta skematik 5 koridor feeder dengan warna kondisi layanan" font-family="Poppins,sans-serif">
      <rect width="600" height="524" fill="#EEF3F9"/>
      <g transform="translate(300 262) scale(${zoom}) translate(-300 -262)">
        <path d="M600 0H452c22 44 70 74 148 88z" fill="#D6E7F6"/>
        <text x="540" y="30" text-anchor="middle" font-size="11" fill="#6A92B8">Selat Madura</text>
        <g stroke="#E1E8F0" stroke-width="8" fill="none" stroke-linecap="round">
          <path d="M0 178 600 222"/><path d="M0 300c150-16 400-22 600-30"/><path d="M0 410 600 360"/><path d="M60 236 600 246"/>
          <path d="M240 0 252 524"/><path d="M470 0 476 524"/><path d="M120 300 140 524"/>
        </g>
        <path d="M372 0c-12 110-20 210-40 290s22 160 30 234" fill="none" stroke="#CFE2F3" stroke-width="12" stroke-linecap="round"/>
        ${lines}${hubs}
      </g>
    </svg>`;
  }

  PAGES.peta = () => {
    const u = state.ui, cs = state.corridors;
    const counts = { all: cs.length, kritis: 0, waspada: 0, normal: 0 };
    cs.forEach(c => counts[statusOf(c).label.toLowerCase()]++);
    const chip = (k, label) => `<button class="chip ${u.mapFilter === k ? 'is-active' : ''}" data-action="map-filter" data-key="${k}" aria-pressed="${u.mapFilter === k}">${label} (${counts[k]})</button>`;
    return `
    ${pageHead('Peta Rute &amp; Koridor', 'Posisi armada dan kondisi layanan tiap koridor secara langsung')}
    <div class="grid g-side">
      <section class="card pad">
        <div class="between"><div class="chips tight">${chip('all', 'Semua')}${chip('kritis', 'Kritis')}${chip('waspada', 'Waspada')}${chip('normal', 'Normal')}</div>
          <label class="switch-label"><input type="checkbox" class="switch" data-change="map-fleet" ${u.mapFleet ? 'checked' : ''}> Tampilkan armada</label></div>
        <div class="map-wrap">${mapSvg({ filter: u.mapFilter, fleet: u.mapFleet, selected: u.mapSelected, zoom: u.zoom })}
          <div class="map-legend"><b>Kondisi layanan</b>
            <span><i class="ln" style="background:${HEX.red}"></i>Kritis</span><span>${ic('bus', 14)}Armada</span>
            <span><i class="ln" style="background:${HEX.amber}"></i>Waspada</span><span><i style="width:10px;height:10px;border-radius:50%;border:2.5px solid #0F2D4E"></i>Hub transit</span>
            <span><i class="ln" style="background:${HEX.green}"></i>Normal</span><span><i style="width:7px;height:7px;border-radius:50%;border:1.5px solid #9AA8B8"></i>Halte</span></div>
          <div class="map-ctrl"><button data-action="zoom" data-dir="1" aria-label="Perbesar">${ic('plus', 18)}</button><button data-action="zoom" data-dir="-1" aria-label="Perkecil">${ic('minus', 18)}</button><button data-action="zoom" data-dir="0" aria-label="Kembalikan tampilan">${ic('crosshair', 18)}</button></div>
        </div>
      </section>
      <section class="card pad">${cardHead('route', 'Daftar Koridor', 'GPS diperbarui 14:02 WIB')}
        <div class="corr-list">${cs.map(c => { const s = statusOf(c); const dim = u.mapFilter !== 'all' && s.label.toLowerCase() !== u.mapFilter; return `
          <button class="corr-card ${u.mapSelected === c.code ? 'is-sel' : ''} ${dim ? 'dim' : ''}" data-action="map-select" data-code="${c.code}" aria-pressed="${u.mapSelected === c.code}">
            <b>${c.code}&nbsp; ${c.name}</b>
            <div class="between"><span class="row">${ic('bus', 15)}${c.active} dari ${c.units} unit aktif</span>${statusBadge(s)}</div>
            <div class="between"><span class="row">${ic('clock', 15)}${c.nextStop}</span><span class="eta">tiba ${c.eta} menit</span></div>
          </button>`; }).join('')}</div>
      </section>
    </div>
    <section class="card pad">${cardHead('pin', 'Halte Tersibuk Saat Jam Sibuk', `Rata-rata penumpang naik per jam, pukul ${state.settings.peak} WIB`)}
      <div class="grid g-4 mt-20">${BUSY_STOPS.map(([n, l, v]) => { const over = v > STOP_CAPACITY; return `
        <div class="stop-card ${over ? 'over' : ''}"><div class="between"><b>${n}</b><span class="small muted strong">${l}</span></div>
          <div class="between mt-8"><span><span class="num-big">${v}</span> <span class="muted small">orang/jam</span></span>${over ? '<span class="small strong c-red">Melebihi kapasitas</span>' : ''}</div>
          <div class="bar"><i style="width:${Math.min(100, (v / 200) * 100)}%"></i></div></div>`; }).join('')}</div>
    </section>`;
  };

  /* ---------- Data Koridor ---------- */
  PAGES.koridor = () => {
    const q = state.ui.koridorQuery.trim().toLowerCase();
    const match = c => !q || `${c.code} ${c.name} ${c.group} ${c.from} ${c.to}`.toLowerCase().includes(q);
    const cs = state.corridors.filter(match), added = state.newCorridors.filter(match);
    const all = state.corridors, st = state.settings;
    const units = state.ui.showAllUnits ? UNITS : UNITS.slice(0, 6);
    const ub = { Perawatan: 't-amber', Cadangan: 't-grey', Beroperasi: 't-green' };
    return `
    ${pageHead('Data Koridor', 'Data induk dan rata-rata bulanan 5 koridor feeder WiraWiri Suroboyo',
      `<button class="btn" data-action="toast" data-msg="Impor CSV atau KML tidak aktif di prototype. Gunakan Tambah Koridor untuk mencoba alur input.">${ic('upload', 16)} Impor Data</button><a class="btn btn-primary" href="#/koridor/tambah">${ic('plus', 16)} Tambah Koridor</a>`)}
    <div class="banner">${ic('info', 20)} Data rata-rata bulan ini dipakai otomatis untuk menyusun Rekomendasi Armada.<span class="meta"><span>${ic('refresh', 15)} Sinkron ${state.ui.lastSync} WIB</span></span></div>
    <section class="card">
      <div class="pad-x">${cardHead('database', 'Daftar Koridor Feeder', 'Rata-rata bulan November 2026',
        `<label class="search" style="width:280px">${ic('search', 18)}<input id="koridor-q" data-input="koridor-q" value="${esc(state.ui.koridorQuery)}" placeholder="Cari kode atau nama rute…" aria-label="Cari kode atau nama rute"></label>`)}</div>
      <div class="tbl-wrap"><table class="tbl compact tight nowrap">
        <thead><tr><th>Kode</th><th>Nama rute &amp; koridor</th><th class="num">Panjang</th><th class="num">Halte</th><th class="num">Unit</th><th class="num">Penumpang</th><th class="num">Kepadatan</th><th class="num">Tunggu</th><th class="num">Keluhan</th><th class="num">Armada/km</th><th class="num">Transit</th></tr></thead>
        <tbody>
          ${cs.map(c => { const s = statusOf(c); return `<tr><td class="code">${c.code}</td><td class="name"><b>${c.name}</b><small>${c.group}</small></td>
            <td class="num">${num(c.km, 1)} km</td><td class="num">${c.stops}</td><td class="num">${c.units}</td><td class="num">${num(c.passengers)}</td>
            <td class="num ${s.loadLevel === 2 ? 'c-red' : ''}">${c.load}%</td><td class="num ${s.waitLevel === 2 ? 'c-red' : ''}">${c.wait} mnt</td>
            <td class="num">${c.complaints}/bln</td><td class="num">${num(S.fleetPerKm(c), 2)}</td><td class="num">${c.transit}/5</td></tr>`; }).join('')}
          ${added.map(c => `<tr><td class="code">${esc(c.code)}</td><td class="name"><b>${esc(c.name)}</b><small>${esc(c.group)} · <span class="c-blue">mulai ${esc(c.startLabel)}</span></small></td>
            <td class="num">${num(c.km, 1)} km</td><td class="num">${c.stops}</td><td class="num">${c.units}</td><td class="num muted">—</td><td class="num muted">—</td><td class="num muted">—</td><td class="num muted">—</td>
            <td class="num">${num(S.round(c.units / c.km, 2), 2)}</td><td class="num">${c.transit}/5</td></tr>`).join('')}
          ${!cs.length && !added.length ? `<tr><td colspan="11"><div class="empty"><b>Tidak ada koridor yang cocok</b>Coba kata kunci lain, misalnya kode “A4” atau nama halte.</div></td></tr>` : ''}
        </tbody>
        <tfoot><tr><td></td><td class="c-blue" style="font-size:12px;letter-spacing:.03em">TOTAL / RATA-RATA (${all.length} koridor aktif)</td>
          <td class="num">${num(sum(all.map(c => c.km)), 1)} km</td><td class="num">${sum(all.map(c => c.stops))}</td><td class="num">${sum(all.map(c => c.units))}</td>
          <td class="num">${num(sum(all.map(c => c.passengers)))}</td><td class="num">${num(avg(all.map(c => c.load)), 1)}%</td><td class="num">${num(avg(all.map(c => c.wait)), 1)} mnt</td>
          <td class="num">${sum(all.map(c => c.complaints))}/bln</td><td class="num" title="Total unit ÷ total km">${num(S.round(sum(all.map(c => c.units)) / sum(all.map(c => c.km)), 2), 2)}</td><td class="num">—</td></tr></tfoot>
      </table></div>
    </section>
    <div class="grid g-2-1">
      <section class="card">
        <div class="pad-x">${cardHead('bus', 'Daftar Unit Armada', 'Unit yang tidak beroperasi ditampilkan lebih dulu',
          `<button class="btn-link" data-action="units-toggle">${state.ui.showAllUnits ? 'Tampilkan ringkas' : `Lihat semua ${UNITS.length} unit`} ${ic(state.ui.showAllUnits ? 'chev-down' : 'arrow-right', 16, state.ui.showAllUnits ? 'style="transform:rotate(180deg)"' : '')}</button>`)}</div>
        <div class="tbl-wrap" style="${state.ui.showAllUnits ? 'max-height:520px' : ''}"><table class="tbl compact nowrap">
          <thead><tr><th>Kode unit</th><th>Koridor</th><th>Status</th><th>Keterangan</th></tr></thead>
          <tbody>${units.map(u => `<tr><td class="code">${u.id}</td><td>${u.code} · ${u.corridor}</td><td><span class="badge ${ub[u.status]}">${u.status}</span></td><td class="wrap">${u.note}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>
      <section class="card pad">${cardHead('clipboard', 'Riwayat Perubahan Data', 'Aktivitas terbaru')}
        <div class="timeline">${state.history.slice(0, 6).map(h => `<div class="tl-item"><i style="background:${h.color}"></i><div><time>${h.time}</time><p>${esc(h.text)}</p></div></div>`).join('')}</div>
      </section>
    </div>`;
  };

  /* ---------- Rekomendasi Armada ---------- */
  function whyTop(ev) {
    const top = ev.ranked[0];
    const items = S.CRITERIA.map((k, j) => {
      const v = top.raw[j], a = ev.avg[j], col = ev.rows.map(r => r.raw[j]), mx = Math.max(...col);
      const more = k.type === 'cost' ? v < a : v > a;
      return { k, j, v, a, mx, more };
    });
    const st = state.settings;
    const breach = [];
    if (top.corridor.load >= st.loadCritical) breach.push('kepadatan bus');
    if (top.corridor.wait > st.waitMax) breach.push('waktu tunggu');
    const n = items.filter(i => i.more).length;
    const fmtAvg = (j, a) => (j === 4 ? num(a, 2) : j === 0 ? num(a) : num(a, 1)) + ['/hari', '%', ' mnt', '/bln', '', '/5'][j];
    return { top, items, n, breach, fmtAvg };
  }

  PAGES.rekomendasi = () => {
    const ev = calc(), top = ev.ranked[0], prio = ev.ranked.filter(r => r.units > 0);
    const imp = impactSummary(ev), fleet = sum(state.corridors.map(c => c.units));
    const why = whyTop(ev), st = state.settings;
    return `
    ${pageHead('Rekomendasi Armada', 'Koridor yang paling membutuhkan tambahan armada, periode November 2026',
      `<a class="btn" href="#/pengaturan">${ic('sliders', 16)} Atur Faktor</a><button class="btn btn-primary" data-action="approve">${ic('check-circle', 16)} Setuju &amp; Buat Laporan</button>`)}
    ${weightsChanged() ? `<div class="banner warn">${ic('alert', 20)} Bobot faktor sudah diubah (${esc(state.weightsVersion)}). Urutan di bawah memakai bobot baru.<span class="meta"><a class="btn-link" href="#/pengaturan">Lihat Pengaturan</a></span></div>` : ''}
    <section class="hero">
      <div><span class="over">REKOMENDASI BULAN INI</span>
        <h2>${ev.totalUnits ? `Tambah ${ev.totalUnits} unit armada` : 'Belum perlu tambahan armada'}</h2>
        <p>${ev.totalUnits ? `Untuk ${prio.length} koridor, dimulai dari ${top.code} ${top.corridor.name} (+${top.units} unit).` : 'Semua koridor berada di kategori Pantau atau Belum perlu.'}
        <small>Diperbarui otomatis dari data operasional, 20 Nov 2026 pukul ${state.ui.lastSync} WIB.</small></p></div>
      <div class="hero-stats">
        <div><b>${prio.length}</b><span>koridor prioritas</span></div>
        <div><b>${imp.delta < 0 ? '−' : ''}${num(Math.abs(imp.delta), 1)} mnt</b><span>rata-rata waktu tunggu</span></div>
        <div><b>${fleet} → ${fleet + ev.totalUnits}</b><span>total armada</span></div>
      </div>
    </section>
    <div class="grid g-side">
      <section class="card pad">${cardHead('list', 'Urutan Kebutuhan Armada', 'Dari koridor yang paling membutuhkan')}
        <div class="rank-list">${ev.ranked.map((r, i) => `
          <div class="rank-item ${i === 0 ? 'is-top' : ''}">
            <span class="rank-num ${r.units ? '' : 'light'}">${r.rank}</span>
            <div><b>${r.code} ${r.corridor.name}</b><span class="sub">${r.corridor.group}</span>
              <div class="tags">${corridorTags(r.corridor).map(t => `<span class="tag grey">${t}</span>`).join('')}</div></div>
            <div class="need"><div class="between"><span>Tingkat kebutuhan</span><b>${r.score}</b></div>
              <div class="bar"><i style="width:${r.score}%;background:${catColor(r.category)}"></i></div>${catBadge(r.category)}${r.near ? ` <span title="Skor dekat batas kategori ${r.near}" class="c-amber">${ic('alert', 15, 'style="display:inline;vertical-align:-3px"')}</span>` : ''}</div>
            <div class="units ${unitsLabel(r).none ? 'none' : ''}"><b>${unitsLabel(r).main}</b><span>${unitsLabel(r).sub}</span></div>
          </div>`).join('')}</div>
      </section>
      <section class="card pad">${cardHead('info', `Kenapa ${top.code} paling perlu?`, 'Dibandingkan rata-rata semua koridor')}
        <div class="factor-cmp">${why.items.map(it => `<div>
          <div class="between"><span>${it.k.name}</span><span class="val ${it.more ? 'c-red' : ''}">${fmtRaw(it.j, it.v)}${it.j === 0 ? '/hari' : ''}</span></div>
          <div class="cmp-track"><i style="width:${(it.v / it.mx) * 100}%"></i><em style="left:${(it.a / it.mx) * 100}%"></em></div>
          <span class="small muted">rata-rata ${why.fmtAvg(it.j, it.a)}</span></div>`).join('')}</div>
        <div class="divider"></div>
        <p class="small" style="line-height:20px">${top.code} lebih membutuhkan armada dibanding rata-rata di ${why.n} dari 6 faktor${why.breach.length ? `, terutama ${listID(why.breach)}` : ''}.</p>
      </section>
    </div>
    <div class="grid g-side">
      <section class="card">
        <div class="pad-x">${cardHead('trend', 'Perkiraan Dampak', 'Jika usulan armada dijalankan')}</div>
        ${prio.length ? `<div class="tbl-wrap"><table class="tbl compact nowrap"><thead><tr><th>Koridor</th><th>Tambahan</th><th>Waktu tunggu</th><th>Kepadatan bus</th></tr></thead><tbody>
          ${prio.map(r => { const c = r.corridor, im = S.impact(c, r.units), wOk = (c.wait - im.wait) / c.wait >= 0.15;
            const lCls = im.load <= st.loadIdeal[1] ? 'c-green' : im.load < st.loadCritical ? 'c-amber' : 'c-red';
            return `<tr><td class="wrap"><b>${r.code} ${c.name}</b></td><td><b class="c-blue">+${r.units} unit</b></td>
              <td><span class="muted">${c.wait} mnt</span> <span class="arrow">${ic('arrow-right', 14)}</span> <b class="${wOk ? 'c-green' : 'c-amber'}">${num(im.wait)} mnt</b></td>
              <td><span class="muted">${c.load}%</span> <span class="arrow">${ic('arrow-right', 14)}</span> <b class="${lCls}">${num(im.load)}%</b></td></tr>`; }).join('')}
        </tbody></table></div>` : '<div class="empty"><b>Tidak ada usulan tambahan</b>Perkiraan dampak muncul saat ada koridor di kategori Perlu atau Sangat perlu.</div>'}
      </section>
      <section class="card pad">${cardHead('sliders', 'Faktor yang Dipertimbangkan', weightsChanged() ? `Diubah ${esc(state.weightsVersion)}` : 'Ditetapkan Tim Analis Dishub')}
        <div class="weights-list">${S.CRITERIA.map((k, j) => `<div class="w-row"><span class="dot" style="background:${RAMP[j]}"></span><span>${k.name}</span>
          <div class="bar" style="height:6px"><i style="width:${Math.min(100, (state.weights[j] / 30) * 100)}%;background:${RAMP[j]}"></i></div><b style="text-align:right">${state.weights[j]}%</b></div>`).join('')}</div>
        <div class="divider"></div>
        <a class="btn-link" href="#/rekomendasi/detail">Lihat detail perhitungan ${ic('arrow-right', 16)}</a>
      </section>
    </div>`;
  };

  /* ---------- Detail Perhitungan ---------- */
  // Penjelasan urutan yang terasa janggal, dihitung dari data. Bila koridor di atas mendapat nilai
  // penuh (1,000) di faktor tertentu dan itu menutup selisih poin penumpang, kalimatnya mengikuti
  // desain Detail Perhitungan. Selain itu dipakai selisih poin terbesar.
  const FULL_FIRST = ['Jumlah penumpang {c} paling banyak', 'Kepadatan bus {c} paling tinggi', 'Waktu tunggu {c} paling lama',
    'Keluhan {c} paling banyak', 'Armada per km {c} paling rendah', 'Keterhubungan transit {c} paling tinggi'];
  const FULL_NEXT = ['jumlah penumpangnya paling banyak', 'kepadatan busnya paling tinggi', 'waktu tunggunya paling lama',
    'keluhannya paling banyak', 'armada per km-nya paling rendah', 'keterhubungan transitnya paling tinggi'];
  const COUNT_WORD = ['', 'Faktor itu', 'Dua faktor itu', 'Tiga faktor itu', 'Empat faktor itu', 'Lima faktor itu'];
  function insight(ev) {
    const R = ev.ranked;
    for (let i = 0; i < R.length - 1; i++) {
      const hi = R[i], lo = R[i + 1];
      if (hi.corridor.passengers >= lo.corridor.passengers) continue;
      const q = `Kenapa ${hi.code} di atas ${lo.code}, padahal penumpangnya lebih sedikit?`;
      const loss = lo.pts[0] - hi.pts[0];
      const full = [1, 2, 3, 4, 5].filter(j => hi.r[j] > 0.9999 && lo.r[j] < 0.9999);
      if (full.length && sum(full.map(j => hi.pts[j] - lo.pts[j])) >= loss) {
        const parts = full.map((j, n) => `${n ? FULL_NEXT[j] : FULL_FIRST[j].replace('{c}', hi.code)} (${fmtRaw(j, hi.raw[j])})`);
        return { q, a: `${listID(parts)}. ${COUNT_WORD[full.length]} memberi ${hi.code} nilai penuh, yang menutup selisih jumlah penumpang.` };
      }
      const diffs = S.CRITERIA.map((k, j) => ({ k, j, d: hi.pts[j] - lo.pts[j] })).filter(x => x.d > 0).sort((a, b) => b.d - a.d).slice(0, 2);
      const parts = diffs.map(x => `${x.k.name.toLowerCase()} ${hi.code} ${fmtRaw(x.j, hi.raw[x.j])} (${lo.code} ${fmtRaw(x.j, lo.raw[x.j])})`);
      return { q, a: `Nilai ${listID(parts)}. ${COUNT_WORD[diffs.length]} menambah ${num(sum(diffs.map(x => x.d)), 1)} poin untuk ${hi.code}, lebih besar dari selisih jumlah penumpang (${num(loss, 1)} poin).` };
    }
    const top = R[0];
    const best = S.CRITERIA.map((k, j) => ({ k, j, p: top.pts[j] })).sort((a, b) => b.p - a.p).slice(0, 2);
    return { q: `Apa yang membuat ${top.code} paling atas?`, a: `Sumbangan terbesar datang dari ${listID(best.map(b => `${b.k.name.toLowerCase()} (${num(b.p, 1)} poin)`))}. Urutan koridor sejalan dengan jumlah penumpang.` };
  }

  // Label skenario mengikuti desain ("naik jadi"), arahnya dihitung dari bobot yang aktif.
  const SCEN_NAME = ['Penumpang', 'Kepadatan', 'Waktu tunggu', 'Keluhan', 'Armada/km', 'Transit'];
  const scenLabel = (s, ev) => (s.k === undefined || s.to === 0 ? s.label
    : `${SCEN_NAME[s.k]} ${s.to > ev.weights[s.k] + 1e-9 ? 'naik' : 'turun'} jadi ${num(s.to * 100)}%`);

  PAGES.detail = () => {
    const ev = calc(), u = state.ui, mode = u.tableMode, cats = S.CATEGORIES;
    const bounds = cats.map(k => k.min).filter(m => m > 0);
    const why = insight(ev);
    const sens = S.sensitivity(state.corridors, state.weights, { maxExtraUnits: state.settings.maxExtraUnits });
    // Koridor yang dipantau di uji kestabilan: yang dekat batas, atau dua yang paling dekat.
    const dist = r => Math.min(...bounds.map(b => Math.abs(r.score - b)));
    let watch = ev.ranked.filter(r => r.near !== null);
    if (watch.length < 2) watch = ev.ranked.slice().sort((a, b) => dist(a) - dist(b)).slice(0, 2);
    watch = watch.slice(0, 2);
    const stable = sens.filter(s => s.sameOrder).length;
    const changedScen = sens.filter(s => s.changed.length);
    const changedCodes = [...new Set(changedScen.flatMap(s => s.changed))];
    const steps = [['Kumpulkan data', 'Rata-rata bulanan 6 faktor dari GPS, tiket elektronik, dan WargaKu'], ['Samakan skala', 'Tiap nilai diubah ke 0–1 terhadap koridor pembanding'],
      ['Kalikan bobot', 'Nilai 0–1 dikali bobot faktor, lalu dijumlahkan'], ['Tentukan kategori', 'Skor 0–100 dicocokkan ke batas Tingkat Kebutuhan']];
    const cell = (r, j) => {
      const x = r.raw[j], isBench = Math.abs(x - ev.bench[j]) < 1e-9;
      if (mode === 'raw') return isBench ? `<span class="hi">${fmtRaw(j, x)}</span>` : `<b>${fmtRaw(j, x)}</b>`;
      if (mode === 'weighted') return `<b>${num(r.pts[j], 1)}</b><small>${num(r.r[j], 3)} × ${num(ev.weights[j] * 100)}%</small>`;
      const calcTxt = S.CRITERIA[j].type === 'cost' ? `${fmtPlain(j, ev.bench[j])} ÷ ${fmtPlain(j, x)}` : `${fmtPlain(j, x)} ÷ ${fmtPlain(j, ev.bench[j])}`;
      return `${isBench ? `<span class="hi">${num(r.r[j], 3)}</span>` : `<b>${num(r.r[j], 3)}</b>`}<small>${calcTxt}</small>`;
    };
    const subtitle = 'Langkah 1–2 · Diurutkan dari skor tertinggi';
    const n = ev.ranked.length;
    return `
    ${pageHead('Detail Perhitungan', 'Cara skor tingkat kebutuhan dihitung dengan metode SAW, periode November 2026',
      `<a class="btn" href="#/pengaturan">${ic('sliders', 16)} Atur Bobot</a><button class="btn btn-primary" data-action="export-calc">${ic('download', 16)} Ekspor Perhitungan</button>`,
      crumb('#/rekomendasi', 'Rekomendasi Armada', 'Detail Perhitungan'))}
    <div class="banner">${ic('info', 20)} Angka di sini sama dengan yang dipakai di Rekomendasi Armada dan Laporan.
      <span class="meta"><span>${ic('history', 15)} Bobot versi ${esc(state.weightsVersion.split(' · ')[0])}</span><span>${ic('refresh', 15)} Sinkron ${state.ui.lastSync} WIB</span></span></div>
    <div class="steps">${steps.map(([t, d], i) => `<div class="step"><i>${i + 1}</i><div><b>${t}</b><p>${d}</p></div></div>`).join('')}</div>

    <section class="card pad">${cardHead('hbars', 'Kontribusi Faktor ke Skor', 'Langkah 3–4 · Panjang tiap warna = nilai 0–1 × bobot faktor, dalam poin')}
      <div class="legend">${S.CRITERIA.map((k, j) => `<span><i class="sw" style="background:${RAMP[j]}"></i>${k.head === 'Tunggu' ? 'Waktu tunggu' : k.head} ${num(ev.weights[j] * 100)}%</span>`).join('')}<span><i class="dash"></i>Batas kategori</span></div>
      <div class="contrib">
        ${ev.ranked.map((r, i) => `
          <div class="lbl" style="grid-row:${i + 1};grid-column:1"><b>${r.code} ${r.corridor.name}</b><small>Peringkat ${r.rank} · ${r.units ? `+${r.units}` : '0'} unit</small></div>
          <div class="trk" style="grid-row:${i + 1};grid-column:2"><div class="track" role="img" aria-label="${r.code}: ${S.CRITERIA.map((k, j) => `${k.head} ${num(r.pts[j], 1)}`).join(', ')}">
            ${r.pts.map((p, j) => `<span style="width:${p}%;background:${RAMP[j]};color:${RAMP_INK[j]}">${p >= 6 ? num(p, 1) : ''}</span>`).join('')}</div></div>
          <div class="res" style="grid-row:${i + 1};grid-column:3"><b>${r.score}</b>${catBadge(r.category)}${r.near ? `<span title="Dekat batas ${r.near}">${ic('alert', 16)}</span>` : ''}</div>`).join('')}
        <div class="thresholds" style="grid-row:1 / span ${n}">${bounds.map(b => `<i style="left:${b}%"></i>`).join('')}</div>
        <div class="axis" style="grid-row:${n + 1}">${[0, ...bounds.slice().reverse(), 100].map(t => `<span style="left:${t}%">${t}</span>`).join('')}</div>
      </div>
      <div class="callout">${ic('bulb', 18)}<div><b>${why.q}</b>${why.a}</div></div>
    </section>

    <section class="card">
      <div class="pad-x">${cardHead('table', 'Tabel Perhitungan', subtitle,
        `<div class="seg" role="tablist" aria-label="Tampilan tabel">${[['raw', 'Nilai asli'], ['norm', 'Skala 0–1'], ['weighted', '× Bobot']].map(([k, l]) => `<button role="tab" aria-selected="${mode === k}" class="${mode === k ? 'is-active' : ''}" data-action="table-mode" data-mode="${k}">${l}</button>`).join('')}</div>`)}</div>
      <div class="formulas">
        <div class="formula"><small>${ic('arrow-up', 14)} Makin perlu jika nilai tinggi (5 faktor)</small><b>nilai ÷ nilai tertinggi</b></div>
        <div class="formula"><small class="c-amber">${ic('arrow-down', 14)} <span class="muted">Makin perlu jika nilai rendah (armada/km)</span></small><b>nilai terendah ÷ nilai</b></div>
        <div class="formula"><small>${ic('sigma', 14)} Skor tingkat kebutuhan</small><b>Σ (nilai 0–1 × bobot) × 100</b></div>
      </div>
      <div class="tbl-wrap"><table class="tbl calc-tbl compact nowrap">
        <thead><tr><th>Koridor</th>${S.CRITERIA.map((k, j) => `<th class="num">${k.head}<span class="w"><i class="sw" style="background:${RAMP[j]}"></i>${num(ev.weights[j] * 100)}% ${ic(k.type === 'cost' ? 'arrow-down' : 'arrow-up', 11, `style="color:${k.type === 'cost' ? 'var(--amber)' : 'var(--blue)'}"`)}</span></th>`).join('')}<th class="num">Skor</th><th>Kategori</th></tr></thead>
        <tbody>${ev.ranked.map(r => `
          <tr class="click ${u.expanded === r.code ? 'is-sel' : ''}" data-action="expand-row" data-code="${r.code}" tabindex="0" aria-expanded="${u.expanded === r.code}">
            <td class="name"><b>${r.corridor.name}</b><small>${r.code} · Peringkat ${r.rank}</small></td>
            ${S.CRITERIA.map((k, j) => `<td class="num">${cell(r, j)}</td>`).join('')}
            <td class="num score">${r.score}</td><td>${catBadge(r.category)}</td></tr>
          ${u.expanded === r.code ? `<tr class="detail"><td colspan="9"><b>${ic('sigma', 14)} Rincian ${r.code}</b>${r.r.map((x, j) => `${num(ev.weights[j], 2)} × ${num(x, 3)}`).join(' + ')} = ${num(r.V, 3)} → skor ${r.score}</td></tr>` : ''}`).join('')}</tbody>
        <tfoot><tr><td><span class="small" style="color:var(--muted-2)">${mode === 'weighted' ? 'POIN MAKSIMAL' : 'PEMBANDING'}</span><small class="muted" style="display:block;font-size:11px;font-weight:400">${mode === 'weighted' ? 'Bila nilai 0–1 = 1,000' : 'Nilai yang dianggap 1,000'}</small></td>
          ${S.CRITERIA.map((k, j) => `<td class="num c-blue">${mode === 'weighted' ? num(ev.weights[j] * 100, 1) : `${k.type === 'cost' ? 'Min' : 'Maks'} ${fmtPlain(j, ev.bench[j])}`}</td>`).join('')}<td class="num">${mode === 'weighted' ? '100' : ''}</td><td></td></tr></tfoot>
      </table></div>
      <p class="small muted" style="padding:14px 24px 18px"><span class="hi" style="display:inline-block;padding:1px 6px;border-radius:6px;background:var(--chip);color:var(--navy-2);font-weight:600">1,000</span> = koridor pembanding untuk faktor itu. Pilih baris untuk melihat rincian penjumlahannya.</p>
    </section>

    <div class="grid g-side">
      <section class="card">
        <div class="pad-x">${cardHead('shield', 'Uji Kestabilan Urutan', 'Bobot satu faktor diubah, bobot lain disesuaikan agar total 100%')}
          <div class="chip-row"><span class="badge ${stable === sens.length ? 't-green' : 't-amber'}">Urutan sama di ${stable} dari ${sens.length} skenario</span>
            <span class="badge ${changedScen.length ? 't-amber' : 't-green'}">${changedScen.length ? `Kategori ${listID(changedCodes)} berubah di ${changedScen.length} skenario` : 'Kategori tidak berubah di semua skenario'}</span></div></div>
        <div class="tbl-wrap"><table class="tbl compact nowrap"><thead><tr><th>Skenario bobot</th><th>Urutan koridor</th>${watch.map(w => `<th class="num">Skor ${w.code}</th>`).join('')}</tr></thead>
          <tbody>${sens.map((s, i) => `<tr style="${s.changed.length ? 'background:var(--amber-bg)' : i === 0 ? 'background:var(--soft)' : ''}">
            <td class="${i === 0 ? 'strong' : ''}">${scenLabel(s, ev)}</td>
            <td>${i === 0 ? s.result.ranked.map(r => r.code).join(' › ') : s.sameOrder ? `<span class="c-green row">${ic('check', 14)} Sama</span>` : `<span class="c-amber">${s.result.ranked.map(r => r.code).join(' › ')}</span>`}</td>
            ${watch.map(w => { const r = s.byCode[w.code]; return `<td class="num"><b>${r.score}</b> <span class="small" style="color:${catColor(r.category)}">${r.category.label}</span></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>
      </section>
      <section class="card pad stack" style="gap:18px">${cardHead('alert', 'Perlu Ditinjau', `Skor dalam ${S.SETTINGS.borderline} poin dari batas kategori`)}
        ${ev.ranked.filter(r => r.near !== null).map(r => {
          const above = r.score >= r.near, d = Math.abs(r.score - r.near), catAt = S.category(r.near);
          const flip = sens.find(s => s.changed.includes(r.code));
          const txt = above ? `${d} poin di atas batas ${catAt.label} (${r.near}).${r.units ? ` Usulan +${r.units} unit bisa batal bila bobot sedikit berubah.` : ''}`
            : `${d} poin di bawah batas ${catAt.label}.${flip ? ` Naik ke ${flip.byCode[r.code].category.label} bila ${scenLabel(flip, ev).toLowerCase()}.` : ''}`;
          return `<div class="review-item"><span class="score-tile t-${r.category.tone}">${r.score}</span><div><b>${r.code} ${r.corridor.name}</b><p>${txt}</p></div></div>`;
        }).join('') || '<p class="small muted">Tidak ada skor yang dekat batas kategori.</p>'}
        <div class="divider" style="margin:0"></div>
        <div class="note-item">${ic('info', 16)}<div><b>Skor bersifat relatif</b><p>Nilai 0–1 dihitung terhadap koridor tertinggi bulan ini. Saat A6 ikut dihitung mulai Desember 2026, skor koridor lain bisa berubah walau datanya sama.</p></div></div>
        <div class="note-item">${ic('lock', 16)}<div><b>Dibekukan saat disahkan</b><p>Laporan yang sudah disahkan menyimpan perhitungan pada saat itu, bukan bobot terbaru.</p></div></div>
      </section>
    </div>`;
  };

  /* ---------- Laporan ---------- */
  function reportEval() {
    const snap = state.snapshot;
    return snap ? S.evaluate(state.corridors, snap.weights, { maxExtraUnits: snap.maxExtraUnits }) : calc();
  }

  function docPages(ev) {
    const o = state.ui.report, st = state.settings, top = ev.ranked[0];
    const heads = `<div class="doc-head"><div class="doc-brand"><img class="doc-logo" src="${LOGO_DARK}" alt="Dishub Surabaya"><div><span class="over">PEMERINTAH KOTA SURABAYA</span><b>Dinas Perhubungan</b><small>Bidang Angkutan Jalan &amp; Transit Feeder</small></div></div>
      <div class="no">No. Dok.<br><b>ANG-FDR/2026/XI</b></div></div>`;
    const full = st.loadCritical, crowded = ev.ranked.filter(r => r.corridor.load >= full).map(r => `${r.code} ${r.corridor.load}%`);
    const late = state.corridors.filter(c => c.wait > st.waitMax).sort((a, b) => b.wait - a.wait).map(c => `${c.code} (${c.wait} mnt)`);
    const sig = (leftTitle, leftName, leftSub, rightTitle, rightRole, rightName, rightNip) => `<div class="sig"><div><small>${leftTitle}</small><b>${leftName}</b><span class="muted">${leftSub}</span></div>
        <div class="right"><small>${rightTitle}</small><b>${rightRole}</b><div class="box">Tanda tangan &amp; stempel</div><b style="font-size:12.5px">${rightName}</b><span class="muted" style="font-size:10.5px">${rightNip}</span></div></div>`;
    const pages = [`<article class="doc">${heads}
      <div class="doc-meta"><table><tr><td>Nomor</td><td>: 551.2/894/436.7.14/2026</td></tr><tr><td>Tanggal</td><td>: 20 November 2026</td></tr><tr><td>Perihal</td><td>: Rekomendasi Penambahan Armada Feeder</td></tr><tr><td>Sifat</td><td>: Segera</td></tr></table>
        <h3>Laporan Prioritas Penambahan Armada — November 2026</h3></div>
      <p class="body">Berdasarkan penilaian enam faktor operasional (jumlah penumpang, kepadatan bus, waktu tunggu, keluhan, armada per km, dan keterhubungan transit) terhadap ${ev.ranked.length} koridor feeder WiraWiri Suroboyo, koridor ${top.code} (${top.corridor.from} — ${top.corridor.to}) memiliki tingkat kebutuhan tertinggi, yaitu ${top.score} dari 100${top.units ? `, dan direkomendasikan menjadi prioritas utama penambahan ${top.units} unit armada` : ', namun belum memerlukan tambahan armada'}.</p>
      <div class="doc-stats"><div><small>KORIDOR DIANALISIS</small><b>${ev.ranked.length}</b><span>koridor</span></div><div><small>USULAN ARMADA</small><b>+${ev.totalUnits}</b><span>unit</span></div><div><small>KEBUTUHAN TERTINGGI</small><b>${top.score}</b><span>/100 · ${top.code}</span></div></div>
      <h4>Urutan kebutuhan armada</h4>
      <table class="doc-table"><thead><tr><th>#</th><th>Koridor</th><th class="num">Skor</th><th>Tingkat</th><th class="num">Usulan</th></tr></thead>
        <tbody>${ev.ranked.map(r => `<tr><td>${r.rank}</td><td>${r.code} · ${r.corridor.name}</td><td class="num"><b>${r.score}/100</b></td><td>${catBadge(r.category)}</td><td class="num"><b class="c-blue">${r.units ? `+${r.units} unit` : '—'}</b></td></tr>`).join('')}</tbody></table>
      <h4>Dasar pertimbangan</h4>
      <ul>${crowded.length ? `<li>Kepadatan bus ${listID(crowded)} pada jam sibuk (batas ${full}%).</li>` : ''}
        ${late.length ? `<li>Waktu tunggu ${listID(late)} melebihi target SPM ${st.waitMax} menit.</li>` : ''}
        <li>Keluhan penumpang November 2026 tercatat ${sum(state.corridors.map(c => c.complaints))} laporan, naik 12 dari Oktober.</li></ul>
      ${sig('DISIAPKAN OLEH', 'Tim Analis Transportasi', 'Dinas Perhubungan Kota Surabaya', 'MENGETAHUI &amp; MENYETUJUI', 'Kepala Bidang Angkutan', 'Ir. H. Arif Sunaryo, M.T.', 'NIP. 19780512 200312 1 004')}</article>`];
    const annex = [];
    const letter = () => String.fromCharCode(65 + annex.length);
    if (o.lampiran) annex.push(`<h4>Lampiran ${letter()} · Perhitungan rinci (SAW)</h4>
        <p>Normalisasi: faktor “makin perlu jika tinggi” = nilai ÷ nilai tertinggi; armada per km = nilai terendah ÷ nilai. Skor = Σ (nilai 0–1 × bobot) × 100.</p>
        <table class="doc-table" style="margin-top:12px"><thead><tr><th>Koridor</th>${S.CRITERIA.map(k => `<th class="num">${k.code}</th>`).join('')}<th class="num">Skor</th></tr></thead>
          <tbody><tr><td class="muted">Bobot</td>${ev.weights.map(w => `<td class="num muted">${num(w * 100)}%</td>`).join('')}<td></td></tr>
          ${ev.ranked.map(r => `<tr><td>${r.code}</td>${r.r.map(x => `<td class="num">${num(x, 3)}</td>`).join('')}<td class="num"><b>${r.score}</b></td></tr>`).join('')}</tbody></table>`);
    if (o.ringkasan) {
      const cs = state.corridors;
      annex.push(`<h4>Lampiran ${letter()} · Ringkasan operasional</h4>
        <div class="doc-stats"><div><small>PENUMPANG/HARI</small><b>${num(sum(cs.map(c => c.passengers)))}</b></div><div><small>ARMADA AKTIF</small><b>${sum(cs.map(c => c.active))}/${sum(cs.map(c => c.units))}</b></div><div><small>RATA-RATA TUNGGU</small><b>${num(avg(cs.map(c => c.wait)), 1)}</b><span>menit</span></div></div>
        <table class="doc-table" style="margin-top:14px"><thead><tr><th>Koridor</th><th class="num">Aktif</th><th class="num">Tunggu</th><th class="num">Kepadatan</th><th>Status</th></tr></thead>
          <tbody>${cs.map(c => `<tr><td>${c.code} · ${c.name}</td><td class="num">${c.active}/${c.units}</td><td class="num">${c.wait} mnt</td><td class="num">${c.load}%</td><td>${statusBadge(statusOf(c))}</td></tr>`).join('')}</tbody></table>`);
    }
    if (o.peta) annex.push(`<h4>Lampiran ${letter()} · Peta rute &amp; halte</h4><div style="border-radius:8px;overflow:hidden">${mapSvg({ fleet: false })}</div>`);
    if (annex.length) pages.push(`<article class="doc">${heads}${annex.join('')}</article>`);
    if (o.pengesahan) pages.push(`<article class="doc">${heads}<h3 class="doc-title">Lembar Pengesahan</h3>
      <div class="doc-meta"><table><tr><td>Nomor</td><td>: 551.2/894/436.7.14/2026</td></tr><tr><td>Perihal</td><td>: Rekomendasi Penambahan Armada Feeder</td></tr><tr><td>Periode</td><td>: November 2026</td></tr></table></div>
      <p class="body">Rekomendasi penambahan ${ev.totalUnits} unit armada untuk ${ev.ranked.filter(r => r.units > 0).length} koridor prioritas dalam laporan ini disahkan untuk ditindaklanjuti.</p>
      ${sig('DIPERIKSA OLEH', 'Kepala Bidang Angkutan', 'Ir. H. Arif Sunaryo, M.T.', 'DISAHKAN OLEH', 'Kepala Dinas Perhubungan', '………………………………', 'NIP. ………………………')}</article>`);
    return pages;
  }

  PAGES.laporan = () => {
    const o = state.ui.report, ev = reportEval(), pages = docPages(ev);
    const snap = state.snapshot;
    const stale = snap && (snap.weights.join() !== state.weights.join() || snap.maxExtraUnits !== state.settings.maxExtraUnits);
    const opt = (k, t, s) => `<label class="opt"><input type="checkbox" data-change="report-opt" data-key="${k}" ${o[k] ? 'checked' : ''}><span><b>${t}</b><small>${s}</small></span></label>`;
    const recent = state.reports.filter(d => d.id !== 'p-2026-11').slice(0, 3);
    const stBadge = s => `<span class="badge plain ${{ Disahkan: 't-green', Arsip: 't-grey', Menunggu: 't-amber' }[s]}">${s}</span>`;
    return `
    ${pageHead('Laporan &amp; Arsip', 'Lembar keputusan resmi rekomendasi armada, siap disahkan Kepala Dinas', `<span class="badge t-amber" style="padding:8px 14px;font-size:13px">Status: Menunggu pengesahan</span>`)}
    ${snap ? `<div class="banner ${stale ? 'warn' : ''}">${ic(stale ? 'alert' : 'lock', 20)} ${stale
      ? `Bobot sudah berubah sejak laporan dibuat pukul ${snap.time}. Laporan tetap memakai perhitungan saat disetujui.`
      : `Dibuat dari rekomendasi yang disetujui pukul ${snap.time}. Perhitungan dibekukan sampai laporan disahkan.`}
      <span class="meta">${stale ? '<a class="btn-link" href="#/rekomendasi">Buat ulang dari Rekomendasi</a>' : ''}</span></div>` : ''}
    <div class="grid g-side wide-side">
      <div class="doc-wrap">
        <div class="doc-toolbar">${ic('file', 18)} <b>Pratinjau · A4</b>
          <div class="zoom"><button data-action="report-zoom" data-dir="-1" aria-label="Perkecil">${ic('minus', 16)}</button><b>${o.zoom}%</b><button data-action="report-zoom" data-dir="1" aria-label="Perbesar">${ic('plus', 16)}</button></div>
          <span class="muted">Halaman 1 dari ${pages.length}</span>
          <span style="margin-left:auto" class="row"><button class="tool" data-action="print" aria-label="Cetak">${ic('printer', 18)}</button><button class="tool" data-action="download-report" aria-label="Unduh">${ic('download', 18)}</button></span></div>
        <div class="doc-pages" style="zoom:${o.zoom / 100}">${pages.join('')}</div>
      </div>
      <div class="stack">
        <section class="card pad pad-20">${cardHead('sliders', 'Pengaturan Laporan', 'Pilih lampiran sebelum mengunduh')}
          <div class="stack mt-20" style="gap:10px">${opt('lampiran', 'Lampiran perhitungan rinci', 'Untuk keperluan audit dan akademik')}${opt('ringkasan', 'Ringkasan operasional', 'KPI dan kinerja koridor dari Dashboard')}${opt('peta', 'Peta rute &amp; halte', 'Kondisi layanan tiap koridor')}${opt('pengesahan', 'Lembar pengesahan', 'Kolom tanda tangan Kepala Dinas')}</div>
          <p class="small strong mt-20" style="color:var(--muted-2);letter-spacing:.04em">FORMAT</p>
          <div class="seg wide mt-8">${[['pdf', 'PDF'], ['excel', 'Excel']].map(([k, l]) => `<button class="${o.format === k ? 'is-active' : ''}" data-action="report-format" data-key="${k}" aria-pressed="${o.format === k}">${l}</button>`).join('')}</div>
          <button class="btn btn-primary btn-block mt-16" style="height:48px" data-action="download-report">${ic('download', 18)} Unduh Laporan (${o.format === 'pdf' ? 'PDF' : 'Excel'})</button>
          <div class="grid g-2 mt-8" style="gap:10px"><button class="btn btn-soft" data-action="print">Cetak</button><button class="btn btn-soft" data-action="toast" data-msg="Laporan dikirim ke kepala.bidang.angkutan@contoh.go.id (simulasi).">Kirim Email</button></div>
        </section>
        <section class="card pad pad-20">${cardHead('clipboard', 'Riwayat Laporan', `${state.reports.length} dokumen tersimpan`)}
          <div class="stack mt-16" style="gap:10px">${recent.map(d => `<div class="file-item"><span class="fi">${ic('file', 18)}</span><div><b>${d.title}</b><small>${fmtDate(d.created)} · ${d.formats.join(' + ')} · ${num(d.size, 1)} MB</small></div>${stBadge(d.status)}</div>`).join('')}</div>
          <a class="btn-link mt-16" href="#/laporan/arsip" style="margin-top:18px">Lihat semua arsip ${ic('arrow-right', 16)}</a>
        </section>
      </div>
    </div>`;
  };

  /* ---------- Semua Arsip ---------- */
  PAGES.arsip = () => {
    const a = state.ui.archive, docs = state.reports;
    const q = a.q.trim().toLowerCase();
    const types = [['all', 'Semua'], ['Prioritas bulanan', 'Prioritas bulanan'], ['Evaluasi kuartal', 'Evaluasi kuartal'], ['Simulasi pembobotan', 'Simulasi pembobotan']];
    const count = t => docs.filter(d => t === 'all' || d.type === t).length;
    const list = docs.filter(d => (a.tab === 'all' || d.type === a.tab) && (a.year === 'all' || String(d.year) === a.year)
      && (a.status === 'all' || d.status === a.status) && (!q || `${d.title} ${d.no}`.toLowerCase().includes(q)));
    const pages = Math.max(1, Math.ceil(list.length / 10));
    const page = clamp(a.page, 1, pages);
    const rows = list.slice((page - 1) * 10, page * 10);
    const stBadge = s => `<span class="badge ${{ Disahkan: 't-green', Arsip: 't-grey', Menunggu: 't-amber' }[s]}">${s}</span>`;
    const kpi = (icon, bg, color, n, l) => `<div class="card kpi-sm"><span class="doc-ic" style="background:${bg};color:${color}">${ic(icon, 22)}</span><div><b>${n}</b><span>${l}</span></div></div>`;
    return `
    ${pageHead('Semua Arsip', 'Dokumen keputusan armada feeder WiraWiri Suroboyo sejak Agustus 2025', '', crumb('#/laporan', 'Laporan &amp; Arsip', 'Semua Arsip'))}
    <div class="grid g-4">
      ${kpi('file', 'var(--soft)', 'var(--blue)', docs.length, 'Total dokumen')}${kpi('check-circle', 'var(--green-bg)', 'var(--green)', docs.filter(d => d.status === 'Disahkan').length, 'Sudah disahkan')}
      ${kpi('clock', 'var(--amber-bg)', 'var(--amber)', docs.filter(d => d.status === 'Menunggu').length, 'Menunggu disahkan')}${kpi('archive', 'var(--nchip)', 'var(--muted-2)', docs.filter(d => d.type !== 'Prioritas bulanan').length, 'Evaluasi &amp; simulasi')}
    </div>
    <section class="card">
      <div class="pad-x">${cardHead('folder', 'Daftar Dokumen', 'Diurutkan dari yang terbaru', `<div class="row" style="gap:10px">
        <label class="search" style="width:260px">${ic('search', 18)}<input id="arsip-q" data-input="arsip-q" value="${esc(a.q)}" placeholder="Cari judul atau nomor dokumen…" aria-label="Cari judul atau nomor dokumen"></label>
        <select class="select" data-change="arsip-filter" data-key="year" aria-label="Tahun">${[['all', 'Tahun: Semua'], ['2026', '2026'], ['2025', '2025']].map(([v, l]) => `<option value="${v}" ${a.year === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <select class="select" data-change="arsip-filter" data-key="status" aria-label="Status">${[['all', 'Status: Semua'], ['Menunggu', 'Menunggu'], ['Disahkan', 'Disahkan'], ['Arsip', 'Arsip']].map(([v, l]) => `<option value="${v}" ${a.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`)}</div>
      <div class="tabs" role="tablist">${types.map(([k, l]) => `<button class="tab ${a.tab === k ? 'is-active' : ''}" role="tab" aria-selected="${a.tab === k}" data-action="arsip-tab" data-key="${k}">${l} <span class="count">${count(k)}</span></button>`).join('')}</div>
      <div class="tbl-wrap"><table class="tbl compact">
        <thead><tr><th>Dokumen</th><th>Jenis</th><th>Periode</th><th>Dibuat</th><th>Format</th><th>Status</th><th class="num">Aksi</th></tr></thead>
        <tbody>${rows.map(d => `<tr class="${d.status === 'Menunggu' ? 'is-pending' : ''}">
          <td><div class="row" style="gap:12px"><span class="doc-ic" style="${d.type === 'Prioritas bulanan' ? '' : 'background:var(--nchip);color:var(--muted-2)'}">${ic('file', 18)}</span><div class="name"><b>${d.title}</b><small>${d.no}</small></div></div></td>
          <td>${d.type}</td><td>${d.period}</td><td>${fmtDate(d.created)}</td>
          <td>${d.formats.map(f => `<span class="fmt ${f.toLowerCase()}">${f}</span>`).join('')}<small class="muted" style="display:block;font-size:12px">${num(d.size, 1)} MB</small></td>
          <td>${stBadge(d.status)}</td>
          <td class="num"><div class="row" style="justify-content:flex-end;gap:6px">
            <button class="btn btn-icon" data-action="arsip-view" data-id="${d.id}" aria-label="Lihat ${d.title}">${ic('eye', 17)}</button>
            <button class="btn btn-icon" data-action="toast" data-msg="Mengunduh ${d.title} (contoh, file tidak tersedia di prototype)." aria-label="Unduh ${d.title}">${ic('download', 17)}</button>
            <button class="btn btn-icon" data-action="toast" data-msg="Menu lain: salin nomor, bagikan, arsipkan (contoh)." aria-label="Aksi lain">${ic('more', 17)}</button></div></td></tr>`).join('')}
          ${rows.length ? '' : '<tr><td colspan="7"><div class="empty"><b>Tidak ada dokumen yang cocok</b>Ubah kata kunci, tahun, atau status.</div></td></tr>'}</tbody>
      </table></div>
      <div class="between" style="padding:16px 24px;border-top:1px solid var(--line-2)"><span class="muted">Menampilkan <b style="color:var(--ink)">${list.length ? `${(page - 1) * 10 + 1}–${Math.min(page * 10, list.length)}` : 0}</b> dari ${list.length} dokumen</span>
        <div class="pager"><button data-action="arsip-page" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="Sebelumnya">${ic('chev-left', 16, 'style="margin:auto"')}</button>
          ${Array.from({ length: pages }, (_, i) => `<button class="${page === i + 1 ? 'is-active' : ''}" data-action="arsip-page" data-page="${i + 1}" aria-current="${page === i + 1 ? 'page' : 'false'}">${i + 1}</button>`).join('')}
          <button data-action="arsip-page" data-page="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="Berikutnya">${ic('chev-right', 16, 'style="margin:auto"')}</button></div></div>
    </section>`;
  };

  /* ================================================================ 6. Pengaturan (pratinjau langsung) */
  const makeDraft = () => ({ weights: state.weights.slice(), settings: { ...state.settings } });
  const SETTING_KEYS = ['waitMax', 'onTimeMin', 'loadCritical', 'maxExtraUnits', 'recalc'];
  const draftTotal = () => sum(state.draft.weights);
  const isDirty = () => state.draft.weights.join() !== state.weights.join() || SETTING_KEYS.some(k => state.draft.settings[k] !== state.settings[k]);

  const totalBadge = t => (t === 100 ? `<span class="badge plain t-green">${ic('check', 14)} Total 100%</span>` : `<span class="badge plain t-amber">Total ${t}% · harus 100%</span>`);
  function compHTML() {
    const w = state.draft.weights, t = draftTotal() || 1;
    return w.map((x, j) => `<span style="width:${(x / Math.max(t, 100)) * 100}%;background:${RAMP[j]};color:${RAMP_INK[j]}" title="${S.CRITERIA[j].name} ${x}%">${x >= 6 ? `${x}%` : ''}</span>`).join('');
  }
  function previewHTML() {
    const d = state.draft, ev = S.evaluate(state.corridors, d.weights, { maxExtraUnits: d.settings.maxExtraUnits }), act = calc();
    const same = ev.ranked.map(r => r.code).join() === act.ranked.map(r => r.code).join();
    const prio = ev.ranked.filter(r => r.units > 0);
    const moved = ev.ranked.filter(r => act.ranked.find(x => x.code === r.code).rank !== r.rank).map(r => `${r.code} ke peringkat ${r.rank}`);
    return `${draftTotal() !== 100 ? '<p class="small c-amber mt-16">Pratinjau memakai bobot yang dinormalkan karena total belum 100%.</p>' : ''}
      <div class="mt-8">${ev.ranked.map(r => `<div class="prev-item"><span class="rank-num ${r.units ? '' : 'light'}">${r.rank}</span>
        <div><div class="between"><b>${r.code} ${r.corridor.name}</b><span class="sc">${r.score}</span></div>
        <div class="row"><div class="bar"><i style="width:${r.score}%;background:${catColor(r.category)}"></i></div>${catBadge(r.category)}</div></div></div>`).join('')}</div>
      <div class="status-box ${same ? 'ok' : 'diff'}">${ic(same ? 'check-circle' : 'alert', 18)}<div><b>${same ? 'Urutan sama dengan rekomendasi aktif' : 'Urutan berubah dari rekomendasi aktif'}</b>
        <p>${same ? '' : `${listID(moved)}. `}Usulan ${ev.totalUnits === act.totalUnits ? 'tetap' : 'menjadi'} +${ev.totalUnits} unit untuk ${prio.length} koridor.</p></div></div>`;
  }
  function dirtyHTML() {
    const t = draftTotal();
    if (!isDirty() && t === 100) return '';
    return `<span class="small c-amber strong">${isDirty() ? 'Ada perubahan yang belum disimpan.' : ''}</span>${t !== 100 ? `<button class="btn-link" data-action="auto-balance">Sesuaikan otomatis ke 100%</button>` : ''}`;
  }
  function updateSettingsLive() {
    const t = draftTotal();
    const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    set('w-total', totalBadge(t));
    set('w-comp', compHTML());
    set('w-preview', previewHTML());
    set('w-dirty', dirtyHTML());
  }

  PAGES.pengaturan = () => {
    if (!state.draft) state.draft = makeDraft();
    const d = state.draft, ds = d.settings, t = draftTotal(), cats = S.CATEGORIES;
    const field = (name, label, icon, value, suffix, hint, ro = false) => `<div class="field"><label for="spm-${name}">${label}</label>
      <div class="input ${ro ? 'ro' : ''}">${ic(icon, 20)}<input id="spm-${name}" ${ro ? 'readonly' : `type="number" data-input="spm" name="${name}"`} value="${esc(value)}"><span class="suffix">${suffix}</span></div><p class="hint">${hint}</p></div>`;
    const scale = [[0, 54, 'green'], [55, 71, 'blue'], [72, 79, 'amber'], [80, 100, 'red']];
    const src = [['pin', 'GPS armada', 'Posisi 48 unit · tiap 5 menit', 'Terakhir 14:02 WIB'], ['ticket', 'Tiket elektronik', 'Jumlah penumpang per koridor · harian', `Terakhir ${state.ui.lastSync} WIB`],
      ['message', 'Kanal WargaKu &amp; petugas halte', 'Keluhan penumpang · mingguan', 'Terakhir 15 Nov, 09:10']];
    const notif = [['load', 'Kepadatan di atas batas kritis', `Bus lebih dari ${ds.loadCritical}% saat jam sibuk`], ['wait', 'Waktu tunggu melewati SPM', `Lebih dari ${ds.waitMax} menit di satu koridor`],
      ['rec', 'Rekomendasi baru tersedia', 'Setelah hitung ulang harian'], ['approved', 'Laporan telah disahkan', 'Saat Kepala Bidang menyetujui']];
    return `
    ${pageHead('Pengaturan', 'Atur cara sistem menilai kebutuhan dan merekomendasikan armada',
      `<button class="btn" data-action="reset-settings">${ic('history', 16)} Kembalikan Default</button><button class="btn btn-primary" id="btn-save" data-action="save-settings">${ic('save', 16)} Simpan Perubahan</button>`)}
    <div class="banner">${ic('info', 20)} Perubahan bobot dan batas layanan langsung menghitung ulang Rekomendasi Armada.<span class="meta"><span>${ic('history', 15)} Terakhir diubah ${esc(state.weightsVersion)}</span></span></div>
    <div class="grid g-side">
      <section class="card pad">${cardHead('sliders', 'Bobot Faktor Penilaian', 'Geser atau ketik nilai untuk mengatur pengaruh tiap faktor', `<span id="w-total">${totalBadge(t)}</span>`)}
        <div class="w-table"><div class="w-head"><span>Faktor</span><span>Makin perlu jika</span><span>Bobot</span><span></span></div>
          ${S.CRITERIA.map((k, j) => `<div class="w-row">
            <div><b><span class="dot" style="background:${RAMP[j]}"></span>${k.name}</b><small>${k.hint}</small></div>
            <span class="dir ${k.type === 'cost' ? 'low' : ''}">${ic(k.type === 'cost' ? 'arrow-down' : 'arrow-up', 14)} Nilai ${k.type === 'cost' ? 'rendah' : 'tinggi'}</span>
            <input type="range" class="range" id="w-range-${j}" min="0" max="50" step="1" value="${d.weights[j]}" style="--p:${(Math.min(d.weights[j], 50) / 50) * 100}%" data-input="weight" data-j="${j}" aria-label="Bobot ${k.name}">
            <label class="numbox"><input type="number" id="w-num-${j}" min="0" max="100" value="${d.weights[j]}" data-input="weight-num" data-change="weight-num" data-j="${j}" aria-label="Bobot ${k.name} dalam persen"><span>%</span></label>
          </div>`).join('')}</div>
        <div class="between mt-20"><span class="small strong" style="color:var(--muted-2);letter-spacing:.04em">KOMPOSISI BOBOT</span><span class="small muted">6 faktor · jumlah harus 100%</span></div>
        <div class="comp mt-8" id="w-comp">${compHTML()}</div>
        <div class="between mt-16" id="w-dirty">${dirtyHTML()}</div>
      </section>
      <section class="card pad">${cardHead('eye', 'Pratinjau Hasil', 'Urutan koridor dengan bobot saat ini')}
        <div id="w-preview">${previewHTML()}</div>
        <a class="btn-link mt-16" style="margin-top:18px" href="#/rekomendasi">Lihat Rekomendasi Armada ${ic('arrow-right', 16)}</a>
      </section>
    </div>
    <div class="grid g-side">
      <section class="card pad">${cardHead('target', 'Batas Layanan (SPM)', 'Acuan status Kritis, Waspada, dan Normal di Dashboard &amp; Peta Rute')}
        <div class="form-grid fg-2 mt-20">
          ${field('waitMax', 'Target waktu tunggu maksimal', 'clock', ds.waitMax, 'menit', 'Standar pelayanan minimal Dishub')}
          ${field('onTimeMin', 'Ketepatan waktu minimal', 'clock', ds.onTimeMin, '%', 'Kedatangan sesuai jadwal')}
          ${field('loadIdeal', 'Kepadatan ideal', 'users', `${ds.loadIdeal[0]} – ${ds.loadIdeal[1]}`, '%', 'Rentang isi bus yang nyaman', true)}
          ${field('loadCritical', 'Batas kepadatan kritis', 'alert', ds.loadCritical, '%', 'Di atas batas ini bus dianggap penuh')}
          ${field('peak', 'Jam sibuk pagi', 'sunrise', ds.peak, 'WIB', 'Dipakai untuk menghitung kepadatan', true)}
          ${field('maxExtraUnits', 'Tambahan armada maksimal', 'bus', ds.maxExtraUnits, 'unit/bulan', 'Sesuai anggaran &amp; unit cadangan')}
        </div>
      </section>
      <section class="card pad">${cardHead('gauge', 'Tingkat Kebutuhan', 'Batas skor 0–100 tiap kategori')}
        <div class="cat-scale">${scale.map(([a, b, tone]) => `<i style="width:${b - a + 1}%;background:${HEX[tone]}"></i>`).join('')}</div>
        <div class="cat-ticks">${[0, 55, 72, 80, 100].map(v => `<span style="left:${v}%">${v}</span>`).join('')}</div>
        <div class="mt-8">${cats.map((c, i) => `<div class="cat-row"><div>${catBadge(c)}<small>${c.note}</small></div><span class="range-pill">${c.min} – ${i ? cats[i - 1].min - 1 : 100}</span></div>`).join('')}</div>
      </section>
    </div>
    <div class="grid g-side">
      <section class="card pad">${cardHead('database', 'Sumber Data &amp; Sinkronisasi', 'Data operasional yang dipakai untuk perhitungan',
        `<button class="btn" data-action="sync" ${state.ui.syncing ? 'disabled' : ''}>${ic('refresh', 16)} ${state.ui.syncing ? 'Menyinkronkan…' : 'Sinkron Sekarang'}</button>`)}
        <div class="stack mt-20" style="gap:10px">${src.map(([i, t, s, l]) => `<div class="src-item"><span class="fi">${ic(i, 18)}</span><div><b>${t}</b><small>${s}</small></div><span class="small muted">${l}</span><span class="badge t-green">Terhubung</span></div>`).join('')}
          <div class="src-item"><span class="fi">${ic('route', 18)}</span><div><b>Data trayek &amp; halte</b><small>Rute, halte &amp; transit · diubah 1 Nov 2026</small></div><a class="btn-link" href="#/koridor">Kelola di Data Koridor ${ic('arrow-right', 14)}</a><span class="badge t-grey">Manual</span></div></div>
        <div class="divider"></div>
        <div class="between"><div><b>Hitung ulang rekomendasi</b><p class="small muted">Skor dan usulan armada diperbarui otomatis</p></div>
          <select class="select" data-change="spm-select" name="recalc" aria-label="Jadwal hitung ulang">${[['daily', 'Setiap hari · 06:15 WIB'], ['weekly', 'Setiap Senin · 06:15 WIB'], ['manual', 'Manual saja']].map(([v, l]) => `<option value="${v}" ${ds.recalc === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      </section>
      <section class="card pad">${cardHead('bell', 'Notifikasi', 'Peringatan yang dikirim ke Anda')}
        <div class="mt-8">${notif.map(([k, t, s]) => `<label class="notif-row"><span><b>${t}</b><small>${s}</small></span><input type="checkbox" class="switch" data-change="notif" data-key="${k}" ${state.ui.notif[k] ? 'checked' : ''}></label>`).join('')}</div>
        <p class="small strong mt-16" style="color:var(--muted-2);letter-spacing:.04em">KIRIM MELALUI</p>
        <div class="chips mt-8">${Object.entries(state.ui.channels).map(([k, on]) => `<button class="toggle-chip ${on ? 'is-on' : ''}" data-action="channel" data-key="${k}" aria-pressed="${on}">${on ? ic('check', 16) : ''}${k}</button>`).join('')}</div>
      </section>
    </div>`;
  };

  /* ================================================================ 7. Overlay */
  const OVERLAYS = {};

  OVERLAYS.drawerKoridor = () => {
    const cs = state.corridors, f = state.ui.drawerFilter;
    const counts = { all: cs.length, kritis: 0, waspada: 0, normal: 0 };
    cs.forEach(c => counts[statusOf(c).label.toLowerCase()]++);
    const shown = cs.filter(c => f === 'all' || statusOf(c).label.toLowerCase() === f);
    const chip = (k, label, tone) => `<button class="chip ${f === k ? 'is-active' : ''}" data-action="drawer-filter" data-key="${k}" aria-pressed="${f === k}">${tone ? `<i class="dot" style="background:${HEX[tone]}"></i>` : ''}${label} <span class="count">${counts[k]}</span></button>`;
    return `<div class="scrim" data-action="close-overlay"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-title" tabindex="-1">
      <div class="drawer-head"><span class="card-icon">${ic('database', 20)}</span><div><h2 id="dr-title">Data Koridor</h2><p class="card-sub" style="font-size:13px">Ringkasan ${cs.length} koridor feeder · rata-rata November 2026</p></div>
        <button class="close-btn" data-action="close-overlay" aria-label="Tutup">${ic('x', 18)}</button></div>
      <div class="drawer-body">
        <div class="chips">${chip('all', 'Semua')}${chip('kritis', 'Kritis', 'red')}${chip('waspada', 'Waspada', 'amber')}${chip('normal', 'Normal', 'green')}</div>
        <div class="sum-strip mt-16"><div><b>${num(sum(cs.map(c => c.km)), 1)} km</b><span>Panjang rute</span></div><div><b>${sum(cs.map(c => c.stops))}</b><span>Halte</span></div><div><b>${sum(cs.map(c => c.units))}</b><span>Unit armada</span></div><div><b>${num(sum(cs.map(c => c.passengers)))}</b><span>Penumpang/hari</span></div></div>
        <div class="between mt-20"><b style="color:var(--navy)">Nilai 6 faktor penilaian tiap koridor</b><span class="small muted">Diurutkan berdasarkan kode</span></div>
        ${shown.map(c => { const s = statusOf(c); return `<div class="corr-row"><span class="code-tile">${c.code}</span><div>
          <div class="between"><b style="font-size:15px">${c.name}</b>${statusBadge(s)}</div>
          <p class="small muted">${c.group} · ${num(c.km, 1)} km · ${c.stops} halte · ${c.units} unit</p>
          <div class="mini-stats">
            <div><small>Penumpang</small><b>${c.passengers}</b></div><div><small>Kepadatan</small><b class="${levelClass(s.loadLevel)}">${c.load}%</b></div>
            <div><small>Tunggu</small><b class="${levelClass(s.waitLevel)}">${c.wait} mnt</b></div><div><small>Keluhan</small><b>${c.complaints}/bln</b></div>
            <div><small>Armada/km</small><b>${num(S.fleetPerKm(c), 2)}</b></div><div><small>Transit</small><b>${c.transit}/5</b></div></div></div></div>`; }).join('') || '<div class="empty"><b>Tidak ada koridor dengan status ini</b></div>'}
      </div>
      <div class="drawer-foot"><span class="row muted small">${ic('refresh', 16)} Sinkron ${state.ui.lastSync} WIB</span><span style="margin-left:auto"></span>
        <button class="btn" data-action="close-overlay">Tutup</button><a class="btn btn-primary" href="#/koridor">Buka Data Koridor ${ic('arrow-right', 16)}</a></div>
    </aside>`;
  };

  OVERLAYS.drawerRekomendasi = () => {
    const ev = calc(), top = ev.ranked[0], prio = ev.ranked.filter(r => r.units > 0), imp = impactSummary(ev);
    const fleet = sum(state.corridors.map(c => c.units));
    const loads = prio.slice(0, 2).map(r => ({ r, im: S.impact(r.corridor, r.units) }));
    return `<div class="scrim" data-action="close-overlay"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-title" tabindex="-1">
      <div class="drawer-head"><span class="card-icon">${ic('list', 20)}</span><div><h2 id="dr-title">Rekomendasi Armada</h2><p class="card-sub" style="font-size:13px">Periode November 2026 · diperbarui 20 Nov, ${state.ui.lastSync} WIB</p></div>
        <button class="close-btn" data-action="close-overlay" aria-label="Tutup">${ic('x', 18)}</button></div>
      <div class="drawer-body">
        <section class="hero compact"><div><span class="over">REKOMENDASI BULAN INI</span><h2>${ev.totalUnits ? `Tambah ${ev.totalUnits} unit armada` : 'Belum perlu tambahan armada'}</h2>
          <p style="font-size:13px">${ev.totalUnits ? `Untuk ${prio.length} koridor, dimulai dari ${top.code} ${top.corridor.name} (+${top.units} unit).` : 'Semua koridor masih dalam batas layanan.'}</p></div>
          <div class="hero-stats"><div><b>${fleet} → ${fleet + ev.totalUnits}</b><span>total armada</span></div><div><b>${imp.delta < 0 ? '−' : ''}${num(Math.abs(imp.delta), 1)} mnt</b><span>rata-rata waktu tunggu</span></div><div><b>${prio.length}</b><span>koridor prioritas</span></div></div></section>
        <div class="between mt-20"><b style="color:var(--navy)">Urutan kebutuhan armada</b><span class="small muted">Skor 0–100 dari 6 faktor</span></div>
        <div class="mt-8">${ev.ranked.map((r, i) => `<div class="rank-item ${i === 0 ? 'is-top' : ''}" style="grid-template-columns:40px minmax(0,1fr) 40px 110px 80px;padding:12px">
          <span class="rank-num ${r.units ? '' : 'light'}" style="width:30px;height:30px;font-size:13px">${r.rank}</span>
          <div><b style="font-size:14px">${r.code} ${r.corridor.name}</b><div class="bar mt-8" style="height:6px"><i style="width:${r.score}%;background:${catColor(r.category)}"></i></div></div>
          <b style="font-size:16px;color:var(--navy)">${r.score}</b>${catBadge(r.category)}<span class="units ${unitsLabel(r).none ? 'none' : ''}"><b style="font-size:15px">${unitsLabel(r).main}</b></span></div>`).join('')}</div>
        ${prio.length ? `<div class="card pad mt-16" style="box-shadow:none;background:#F7FAFE;padding:16px 18px"><b style="color:var(--navy)">Perkiraan dampak jika usulan dijalankan</b>
          <div class="grid g-3 mt-8" style="gap:12px">
            <div><b style="font-size:16px"><span class="muted">${num(imp.before, 1)} →</span> <span class="c-green">${num(imp.after, 1)} mnt</span></b><p class="small muted">Waktu tunggu rata-rata</p></div>
            ${loads.map(({ r, im }) => `<div><b style="font-size:16px"><span class="muted">${r.corridor.load}% →</span> <span class="c-green">${num(im.load)}%</span></b><p class="small muted">Kepadatan ${r.code}</p></div>`).join('')}</div></div>` : ''}
      </div>
      <div class="drawer-foot"><a class="btn-link" href="#/pengaturan">${ic('sliders', 16)} Atur faktor</a><span style="margin-left:auto"></span>
        <button class="btn" data-action="close-overlay">Tutup</button><a class="btn btn-primary" href="#/rekomendasi">Buka Rekomendasi Armada ${ic('arrow-right', 16)}</a></div>
    </aside>`;
  };

  const nextCode = () => `A${state.corridors.length + state.newCorridors.length + 1}`;
  const blankForm = () => ({ code: nextCode(), group: 'Koridor Timur – Pusat', from: '', to: '', km: '', stops: '', units: '', depot: 'Depo Kenjeran', start: '2026-12-01', hours: '05.30 – 21.00', transit: [], file: null });
  const exampleForm = () => ({ code: nextCode(), group: 'Koridor Timur – Pusat', from: 'Halte Keputih', to: 'Stasiun Gubeng', km: '14,6', stops: '19', units: '6',
    depot: 'Depo Kenjeran', start: '2026-12-01', hours: '05.30 – 21.00', transit: ['Suroboyo Bus', 'Kereta komuter', 'Feeder lain'],
    file: { name: 'rute-A6-keputih-gubeng.kml', size: 48 * 1024, km: '14,6', stops: 19 } });
  const periodOf = iso => { const [y, m] = String(iso).split('-').map(Number); return y && m ? `${MONTH[m - 1]} ${y}` : 'operasinya'; };
  const shortName = s => s.trim().replace(/^(Halte|Stasiun|Terminal|St\.)\s+/i, '');
  const routeName = f => (f.from.trim() && f.to.trim() ? `${shortName(f.from)} — ${shortName(f.to)}` : '');
  function ratioText(f) {
    const km = parseNum(f.km), u = parseNum(f.units);
    return km > 0 && u > 0 ? `Rasio armada ${num(S.round(u / km, 2), 2)} unit/km` : 'Rasio armada dihitung otomatis';
  }

  OVERLAYS.modalTambah = () => {
    if (!state.ui.form) state.ui.form = state.newCorridors.length ? blankForm() : exampleForm();
    const f = state.ui.form, e = state.ui.formErrors;
    const inv = k => (e[k] ? 'is-invalid' : '');
    const err = k => (e[k] ? `<p class="error-text" id="cf-err-${k}">${ic('alert', 14)}${e[k]}</p>` : '');
    const aria = k => (e[k] ? `aria-invalid="true" aria-describedby="cf-err-${k}"` : '');
    const txt = (k, label, icon, ph, extra = '') => `<div class="field"><label for="cf-${k}">${label} <span class="req">*</span></label>
      <div class="input ${inv(k)}">${icon ? ic(icon, 20) : ''}<input id="cf-${k}" name="${k}" data-input="cf" value="${esc(f[k])}" placeholder="${ph}" ${aria(k)} ${extra}></div>${err(k)}</div>`;
    const numF = (k, label, suffix, hint, hintId = '') => `<div class="field"><label for="cf-${k}">${label} <span class="req">*</span></label>
      <div class="input ${inv(k)}"><input id="cf-${k}" name="${k}" data-input="cf" inputmode="decimal" value="${esc(f[k])}" placeholder="0" ${aria(k)}><span class="suffix">${suffix}</span></div>${err(k) || `<p class="hint" ${hintId ? `id="${hintId}"` : ''}>${hint}</p>`}</div>`;
    const sel = (k, label, icon, opts) => `<div class="field"><label for="cf-${k}">${label} <span class="req">*</span></label>
      <div class="input">${icon ? ic(icon, 20) : ''}<select id="cf-${k}" name="${k}" data-input="cf">${opts.map(o => `<option ${o === f[k] ? 'selected' : ''}>${o}</option>`).join('')}</select>${ic('chev-down', 18)}</div></div>`;
    return `<div class="scrim" data-action="close-overlay"></div>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="md-title" tabindex="-1">
      <div class="modal-head"><span class="card-icon">${ic('route', 24)}</span><div><h2 id="md-title">Tambah Koridor Baru</h2><p class="muted" style="margin-top:2px">Lengkapi data induk koridor. Data operasional akan terisi otomatis.</p></div>
        <button class="close-btn" data-action="close-overlay" aria-label="Tutup">${ic('x', 18)}</button></div>
      <form class="modal-body" id="corridor-form" data-submit="save-corridor" novalidate>
        <p class="section-label"><i>1</i>Informasi rute</p>
        <div class="form-grid fg-code">${txt('code', 'Kode koridor', '', 'A6', 'style="font-weight:600"')}${sel('group', 'Kelompok koridor', '', GROUPS)}</div>
        <div class="form-grid fg-2">${txt('from', 'Titik awal', 'pin', 'Contoh: Halte Keputih')}${txt('to', 'Titik akhir', 'pin', 'Contoh: Stasiun Gubeng')}</div>
        <p class="hint" id="cf-route" style="margin-top:-8px">${routeName(f) ? `Nama rute otomatis: ${esc(routeName(f))}` : 'Nama rute dibuat otomatis dari titik awal dan akhir.'}</p>
        <div class="field"><span class="label">Jalur rute <span class="muted">(opsional)</span></span>
          <label class="dropzone" for="cf-file" style="cursor:pointer"><span class="file-ic">${ic('file2', 20)}</span>
            <span style="flex:1"><b>${f.file ? esc(f.file.name) : 'Pilih file jalur rute (.kml)'}</b><small class="muted" style="display:block;font-size:12px">${f.file ? `${num(f.file.size / 1024)} KB · ${f.file.km ? `jalur terbaca: ${f.file.km} km dan ${f.file.stops} halte` : 'panjang dan halte diisi manual'}` : 'Seret file ke sini atau klik untuk memilih'}</small></span>
            ${f.file ? `<span class="badge plain t-green">${ic('check', 12)} ${f.file.km ? 'Terbaca' : 'Dipilih'}</span>` : ''}<span class="btn-link">${f.file ? 'Ganti file' : 'Pilih file'}</span></label>
          <input type="file" id="cf-file" accept=".kml,.kmz,.gpx" class="sr" data-change="cf-file"></div>
        <div class="form-grid fg-3">${numF('km', 'Panjang rute', 'km', f.file && f.file.km ? 'Dari file jalur rute' : 'Isi manual dalam km')}${numF('stops', 'Jumlah halte', 'halte', f.file && f.file.stops ? 'Dari file jalur rute' : 'Termasuk halte awal dan akhir')}${numF('units', 'Jumlah unit awal', 'unit', ratioText(f), 'cf-ratio')}</div>
        <p class="section-label"><i>2</i>Operasional</p>
        <div class="form-grid fg-3">${sel('depot', 'Depo asal', 'building', DEPOTS)}
          <div class="field"><label for="cf-start">Mulai beroperasi <span class="req">*</span></label><div class="input ${inv('start')}">${ic('calendar', 20)}<input type="date" id="cf-start" name="start" data-input="cf" value="${esc(f.start)}" min="2026-12-01" ${aria('start')}></div>${err('start')}</div>
          <div class="field"><label for="cf-hours">Jam operasional</label><div class="input">${ic('clock', 20)}<input id="cf-hours" name="hours" data-input="cf" value="${esc(f.hours)}"><span class="suffix">WIB</span></div></div></div>
        <p class="section-label"><i>3</i>Keterhubungan transit<span class="aside" id="cf-transit-score">Nilai transit <b style="color:var(--navy)">${f.transit.length}/5</b></span></p>
        <div class="chips" role="group" aria-label="Moda yang terhubung">${MODES.map(m => `<button type="button" class="toggle-chip ${f.transit.includes(m) ? 'is-on' : ''}" data-action="cf-transit" data-mode="${m}" aria-pressed="${f.transit.includes(m)}">${f.transit.includes(m) ? ic('check', 16) : ''}${m}</button>`).join('')}</div>
        ${err('transit')}
        <div class="note">${ic('info', 18)}<span>Penumpang, kepadatan, waktu tunggu, dan keluhan terisi otomatis dari GPS, tiket elektronik, dan WargaKu. Koridor baru ikut dihitung di Rekomendasi Armada mulai periode <span id="cf-period">${periodOf(f.start)}</span>.</span></div>
      </form>
      <div class="modal-foot"><span class="small muted"><span class="req" style="color:var(--red)">*</span> Wajib diisi</span><span style="margin-left:auto"></span>
        <button class="btn btn-ghost" data-action="close-overlay">Batal</button><button class="btn btn-primary" type="submit" form="corridor-form">${ic('check-circle', 18)} Simpan Koridor</button></div>
    </div>`;
  };

  function validateCorridor(f) {
    const e = {}, codes = [...state.corridors, ...state.newCorridors].map(c => c.code.toUpperCase());
    const code = f.code.trim().toUpperCase();
    if (!code) e.code = 'Isi kode koridor.';
    else if (!/^A\d{1,2}$/.test(code)) e.code = 'Gunakan format A + angka, misalnya A6.';
    else if (codes.includes(code)) e.code = `Kode ${code} sudah dipakai.`;
    if (!f.from.trim()) e.from = 'Isi titik awal rute.';
    if (!f.to.trim()) e.to = 'Isi titik akhir rute.';
    else if (f.from.trim() && shortName(f.from).toLowerCase() === shortName(f.to).toLowerCase()) e.to = 'Titik akhir harus berbeda dari titik awal.';
    const km = parseNum(f.km), stops = parseNum(f.stops), units = parseNum(f.units);
    if (!(km > 0 && km <= 100)) e.km = 'Isi panjang rute dalam km, misalnya 14,6.';
    if (!(Number.isInteger(stops) && stops >= 2)) e.stops = 'Isi jumlah halte, minimal 2.';
    if (!(Number.isInteger(units) && units >= 1)) e.units = 'Isi jumlah unit awal, minimal 1.';
    if (!f.start) e.start = 'Pilih tanggal mulai beroperasi.';
    if (!f.transit.length) e.transit = 'Pilih minimal satu moda. Nilai transit memakai skala 1–5.';
    return e;
  }

  /* ================================================================ 8. Aksi & event */
  const ACTIONS = {
    toast: el => toast(el.dataset.msg),
    period: () => toast('Prototype ini hanya berisi data November 2026.'),
    menu(el) {
      const m = document.getElementById(`menu-${el.dataset.menu}`);
      const open = m.hidden;
      closeMenus();
      if (!open) return;
      m.innerHTML = el.dataset.menu === 'notif'
        ? `<h3>Notifikasi</h3>${ALERTS.slice(0, 3).map(a => `<a class="menu-item" href="#/dashboard"><i class="dot" style="background:${HEX[a.tone]};margin-top:5px"></i><span><b>${a.title}</b><small>${a.time} · ${a.text}</small></span></a>`).join('')}
           <a class="menu-item" href="#/rekomendasi"><i class="dot" style="background:var(--blue);margin-top:5px"></i><span><b>Rekomendasi November tersedia</b><small>06:15 · Tambah ${calc().totalUnits} unit untuk koridor prioritas</small></span></a>`
        : `<div class="menu-item" style="cursor:default"><span class="avatar">BI</span><span><b>Bambang Irawan, S.T.</b><small>Transport Planner · Dishub</small></span></div>
           <a class="menu-item" href="#/pengaturan">${ic('settings', 18)}<span>Pengaturan</span></a>
           <button class="menu-item" data-action="logout">${ic('logout', 18)}<span>Keluar</span></button>`;
      m.hidden = false;
      el.setAttribute('aria-expanded', 'true');
    },
    logout: () => { closeMenus(); location.hash = '#/login'; toast('Anda sudah keluar.'); },
    'toggle-pw': () => { state.ui.showPw = !state.ui.showPw; render(); },
    'close-overlay': () => closeOverlay(),
    'dashboard-csv': () => {
      downloadCSV('kinerja-koridor-november-2026.csv', [['Kode', 'Koridor', 'Armada aktif', 'Unit', 'Penumpang/hari', 'Kepadatan (%)', 'Waktu tunggu (menit)', 'Tepat waktu (%)', 'Status'],
        ...state.corridors.map(c => [c.code, c.name, c.active, c.units, c.passengers, c.load, c.wait, c.onTime, statusOf(c).label])]);
      toast('Ringkasan kinerja koridor diunduh (CSV).', true);
    },
    'drawer-filter': el => { state.ui.drawerFilter = el.dataset.key; renderOverlay(true); },
    'map-filter': el => { state.ui.mapFilter = el.dataset.key; render(); },
    'map-select': el => { state.ui.mapSelected = state.ui.mapSelected === el.dataset.code ? null : el.dataset.code; render(); },
    zoom: el => { const d = +el.dataset.dir; state.ui.zoom = d === 0 ? 1 : clamp(state.ui.zoom + d * 0.25, 1, 2); render(); },
    'units-toggle': () => { state.ui.showAllUnits = !state.ui.showAllUnits; render(); },
    'cf-transit': el => {
      const f = state.ui.form, m = el.dataset.mode, on = !f.transit.includes(m);
      f.transit = on ? [...f.transit, m] : f.transit.filter(x => x !== m);
      el.classList.toggle('is-on', on);
      el.setAttribute('aria-pressed', on);
      el.innerHTML = `${on ? ic('check', 16) : ''}${m}`;
      $('#cf-transit-score').innerHTML = `Nilai transit <b style="color:var(--navy)">${f.transit.length}/5</b>`;
      if (f.transit.length && state.ui.formErrors.transit) { delete state.ui.formErrors.transit; $('#cf-err-transit')?.remove(); }
    },
    approve: () => {
      const ev = calc();
      state.snapshot = { weights: state.weights.slice(), maxExtraUnits: state.settings.maxExtraUnits, version: state.weightsVersion, time: nowHM() };
      const doc = state.reports.find(d => d.id === 'p-2026-11');
      if (doc) doc.status = 'Menunggu';
      state.history.unshift({ time: `Hari ini · ${nowHM()}`, text: `Rekomendasi November 2026 disetujui (+${ev.totalUnits} unit), laporan dibuat`, color: '#2F8F5B' });
      location.hash = '#/laporan';
      toast(`Laporan prioritas November 2026 dibuat dari rekomendasi (+${ev.totalUnits} unit). Menunggu pengesahan.`, true);
    },
    'table-mode': el => { state.ui.tableMode = el.dataset.mode; render(); },
    'expand-row': el => { state.ui.expanded = state.ui.expanded === el.dataset.code ? null : el.dataset.code; render(); },
    'export-calc': () => {
      const ev = calc();
      downloadCSV('perhitungan-saw-november-2026.csv', [
        ['Peringkat', 'Kode', 'Koridor', ...S.CRITERIA.map(k => `${k.code} nilai`), ...S.CRITERIA.map(k => `${k.code} 0-1`), ...S.CRITERIA.map(k => `${k.code} poin`), 'V', 'Skor', 'Kategori', 'Usulan unit'],
        ['', '', 'Bobot', ...ev.weights.map(w => num(w * 100) + '%'), '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ...ev.ranked.map(r => [r.rank, r.code, r.corridor.name, ...r.raw.map((x, j) => fmtPlain(j, x)), ...r.r.map(x => num(x, 4)), ...r.pts.map(x => num(x, 2)), num(r.V, 4), r.score, r.category.label, r.units])]);
      toast('Perhitungan SAW diunduh (CSV, bisa dibuka di Excel).', true);
    },
    'report-format': el => { state.ui.report.format = el.dataset.key; render(); },
    'report-zoom': el => { state.ui.report.zoom = clamp(state.ui.report.zoom + +el.dataset.dir * 10, 70, 130); render(); },
    print: () => window.print(),
    'download-report': () => {
      if (state.ui.report.format === 'pdf') { toast('Pilih “Simpan sebagai PDF” di jendela cetak.'); setTimeout(() => window.print(), 300); return; }
      const ev = reportEval();
      downloadCSV('laporan-prioritas-armada-november-2026.csv', [['Peringkat', 'Kode', 'Koridor', 'Skor', 'Tingkat', 'Usulan unit'], ...ev.ranked.map(r => [r.rank, r.code, r.corridor.name, r.score, r.category.label, r.units])]);
      toast('Laporan diunduh dalam format Excel (CSV).', true);
    },
    'arsip-tab': el => { Object.assign(state.ui.archive, { tab: el.dataset.key, page: 1 }); render(); },
    'arsip-page': el => { state.ui.archive.page = +el.dataset.page; render(); },
    'arsip-view': el => {
      if (el.dataset.id === 'p-2026-11') location.hash = '#/laporan';
      else toast('Pratinjau arsip lama tidak tersedia di prototype. Coba “Prioritas November 2026”.');
    },
    'reset-settings': () => {
      state.draft = { weights: S.defaultWeights(), settings: { ...S.SETTINGS, recalc: state.settings.recalc } };
      render();
      toast('Nilai default dimuat. Tekan Simpan Perubahan untuk menerapkan.');
    },
    'auto-balance': () => {
      const w = state.draft.weights, t = sum(w);
      if (!t) { state.draft.weights = S.defaultWeights(); render(); return; }
      const raw = w.map(x => (x * 100) / t), fl = raw.map(Math.floor);
      let rest = 100 - sum(fl);
      raw.map((x, i) => [x - fl[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rest > 0) { fl[i]++; rest--; } });
      state.draft.weights = fl;
      render();
    },
    'save-settings': () => {
      if (!isDirty()) { toast('Belum ada perubahan untuk disimpan.'); return; }
      const d = state.draft, ds = d.settings, errs = [];
      if (sum(d.weights) !== 100) errs.push('total bobot harus 100%');
      if (!(ds.waitMax >= 1 && ds.waitMax <= 60)) errs.push('target waktu tunggu 1–60 menit');
      if (!(ds.onTimeMin >= 0 && ds.onTimeMin <= 100)) errs.push('ketepatan waktu 0–100%');
      if (!(ds.loadCritical > ds.loadIdeal[1] && ds.loadCritical <= 150)) errs.push(`batas kepadatan kritis di atas ${ds.loadIdeal[1]}%`);
      if (!(Number.isInteger(ds.maxExtraUnits) && ds.maxExtraUnits >= 0 && ds.maxExtraUnits <= 50)) errs.push('tambahan armada 0–50 unit');
      if (errs.length) { toast(`Belum bisa disimpan: ${listID(errs)}.`); return; }
      const before = calc().ranked.map(r => r.code).join();
      const weightChange = d.weights.join() !== state.weights.join();
      state.weights = d.weights.slice();
      state.settings = { ...d.settings };
      if (weightChange) state.weightsVersion = state.weights.join() === S.defaultWeights().join() ? DEFAULT_VERSION : `20 Nov 2026 ${nowHM()} · Bambang Irawan`;
      const ev = calc(), same = ev.ranked.map(r => r.code).join() === before;
      state.history.unshift({ time: `Hari ini · ${nowHM()}`, text: weightChange ? 'Bobot faktor penilaian diperbarui' : 'Batas layanan (SPM) diperbarui', color: '#2F64A0' });
      state.draft = makeDraft();
      render();
      toast(`Perubahan disimpan. Rekomendasi Armada dihitung ulang: ${same ? 'urutan tetap' : 'urutan berubah'}, usulan +${ev.totalUnits} unit.`, true);
    },
    sync: () => {
      state.ui.syncing = true;
      render();
      setTimeout(() => {
        state.ui.syncing = false;
        state.ui.lastSync = nowHM();
        state.history.unshift({ time: `Hari ini · ${state.ui.lastSync}`, text: 'Sinkronisasi manual GPS & tiket elektronik', color: '#2F64A0' });
        if (current.page === 'pengaturan') render();
        toast('Data tersinkron. Skor tidak berubah karena rata-rata November sama.', true);
      }, 900);
    },
    channel: el => { const k = el.dataset.key; state.ui.channels[k] = !state.ui.channels[k]; render(); },
  };

  const INPUTS = {
    login: el => { state.ui.login[el.name] = el.value; },
    'koridor-q': el => { state.ui.koridorQuery = el.value; render(); },
    'arsip-q': el => { state.ui.archive.q = el.value; state.ui.archive.page = 1; render(); },
    weight: el => setWeight(+el.dataset.j, +el.value, 'range'),
    'weight-num': el => { if (el.value === '') return; setWeight(+el.dataset.j, clamp(Math.round(+el.value || 0), 0, 100), 'num'); },
    spm: el => { const v = parseNum(el.value); state.draft.settings[el.name] = Number.isFinite(v) ? v : NaN; updateSettingsLive(); },
    cf: el => {
      const f = state.ui.form;
      f[el.name] = el.value;
      if (state.ui.formErrors[el.name]) { delete state.ui.formErrors[el.name]; el.closest('.input')?.classList.remove('is-invalid'); }
      if (el.name === 'from' || el.name === 'to') { const r = routeName(f); $('#cf-route').textContent = r ? `Nama rute otomatis: ${r}` : 'Nama rute dibuat otomatis dari titik awal dan akhir.'; }
      if ((el.name === 'km' || el.name === 'units') && $('#cf-ratio')) $('#cf-ratio').textContent = ratioText(f);
      if (el.name === 'start' && $('#cf-period')) $('#cf-period').textContent = periodOf(f.start);
    },
  };

  function setWeight(j, v, src) {
    state.draft.weights[j] = v;
    const r = document.getElementById(`w-range-${j}`), n = document.getElementById(`w-num-${j}`);
    if (r) { if (src !== 'range') r.value = Math.min(v, 50); r.style.setProperty('--p', `${(Math.min(v, 50) / 50) * 100}%`); }
    if (n && src !== 'num') n.value = v;
    updateSettingsLive();
  }

  const CHANGES = {
    'map-fleet': el => { state.ui.mapFleet = el.checked; render(); },
    'report-opt': el => { state.ui.report[el.dataset.key] = el.checked; render(); },
    'arsip-filter': el => { state.ui.archive[el.dataset.key] = el.value; state.ui.archive.page = 1; render(); },
    'spm-select': el => { state.draft.settings[el.name] = el.value; updateSettingsLive(); },
    notif: el => { state.ui.notif[el.dataset.key] = el.checked; },
    'cf-file': el => {
      const file = el.files && el.files[0];
      if (!file) return;
      state.ui.form.file = { name: file.name, size: file.size };
      renderOverlay(true);
    },
    'weight-num': el => { if (el.value === '') setWeight(+el.dataset.j, 0, 'num'); },
  };

  const SUBMITS = {
    login: () => {
      const f = state.ui.login, err = {};
      if (!f.user.trim()) err.user = 'Isi email dinas atau NIP pegawai.';
      if (!f.pass) err.pass = 'Isi kata sandi.';
      f.err = err;
      if (Object.keys(err).length) { render(); $(`#lg-${Object.keys(err)[0]}`)?.focus(); return; }
      location.hash = '#/dashboard';
      toast('Selamat datang, Bambang Irawan.', true);
    },
    search: form => {
      const q = form.q.value.trim();
      state.ui.koridorQuery = q;
      form.q.value = '';
      if (current.page === 'koridor' && !current.overlay) render();
      else location.hash = '#/koridor';
    },
    'save-corridor': () => {
      const f = state.ui.form, e = validateCorridor(f);
      state.ui.formErrors = e;
      if (Object.keys(e).length) {
        renderOverlay();
        const first = Object.keys(e)[0];
        (document.getElementById(`cf-${first}`) || $('[data-action="cf-transit"]'))?.focus();
        toast(`Periksa ${Object.keys(e).length} isian yang ditandai merah.`);
        return;
      }
      const d = new Date(f.start);
      const c = { code: f.code.trim().toUpperCase(), name: routeName(f), from: f.from.trim(), to: f.to.trim(), group: f.group, depot: f.depot,
        km: parseNum(f.km), stops: parseNum(f.stops), units: parseNum(f.units), transit: f.transit.length, startLabel: `${MON[d.getMonth()]} ${d.getFullYear()}` };
      state.newCorridors.push(c);
      state.history.unshift({ time: `Hari ini · ${nowHM()}`, text: `Koridor ${c.code} ${c.name} ditambahkan, mulai ${c.startLabel}`, color: '#2F8F5B' });
      state.ui.form = null;
      state.ui.formErrors = {};
      location.hash = '#/koridor';
      toast(`Koridor ${c.code} ${c.name} disimpan. Ikut dihitung di Rekomendasi Armada mulai ${c.startLabel}.`, true);
    },
  };

  function closeMenus() {
    document.querySelectorAll('.menu').forEach(m => { m.hidden = true; });
    document.querySelectorAll('[data-menu]').forEach(b => b.setAttribute('aria-expanded', 'false'));
  }
  function closeOverlay() {
    if (current.overlay) location.hash = `#/${current.path.split('/')[0]}`;
  }

  document.addEventListener('click', e => {
    if (!e.target.closest('.menu-wrap') || e.target.closest('.menu a')) closeMenus();
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = ACTIONS[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (current.overlay) closeOverlay(); else closeMenus(); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-action]')) { e.preventDefault(); ACTIONS[e.target.dataset.action](e.target, e); }
  });
  document.addEventListener('input', e => { const el = e.target.closest('[data-input]'); if (el && INPUTS[el.dataset.input]) INPUTS[el.dataset.input](el, e); });
  document.addEventListener('change', e => { const el = e.target.closest('[data-change]'); if (el && CHANGES[el.dataset.change]) CHANGES[el.dataset.change](el, e); });
  document.addEventListener('submit', e => { const f = e.target.closest('[data-submit]'); if (f && SUBMITS[f.dataset.submit]) { e.preventDefault(); SUBMITS[f.dataset.submit](f, e); } });

  /* ================================================================ 9. Router */
  const ROUTES = {
    login: { page: 'login' },
    dashboard: { page: 'dashboard' }, 'dashboard/koridor': { page: 'dashboard', overlay: 'drawerKoridor' }, 'dashboard/rekomendasi': { page: 'dashboard', overlay: 'drawerRekomendasi' },
    peta: { page: 'peta' }, koridor: { page: 'koridor' }, 'koridor/tambah': { page: 'koridor', overlay: 'modalTambah' },
    rekomendasi: { page: 'rekomendasi' }, 'rekomendasi/detail': { page: 'detail' },
    laporan: { page: 'laporan' }, 'laporan/arsip': { page: 'arsip' }, pengaturan: { page: 'pengaturan' },
  };
  const NAV_OF = { dashboard: 'dashboard', peta: 'peta', koridor: 'koridor', rekomendasi: 'rekomendasi', detail: 'rekomendasi', laporan: 'laporan', arsip: 'laporan', pengaturan: 'pengaturan' };
  const TITLES = { login: 'Masuk', dashboard: 'Dashboard', peta: 'Peta Rute', koridor: 'Data Koridor', rekomendasi: 'Rekomendasi Armada', detail: 'Detail Perhitungan', laporan: 'Laporan', arsip: 'Semua Arsip', pengaturan: 'Pengaturan' };
  let current = {};

  function route() {
    const path = location.hash.replace(/^#\/?/, '') || 'login';
    const r = ROUTES[path];
    if (!r) { location.replace('#/dashboard'); return; }
    const prev = current;
    current = { ...r, path };
    if (prev.page === 'pengaturan' && r.page !== 'pengaturan' && state.draft && !isDirty()) state.draft = null;
    render({ top: prev.page !== r.page, overlayOpened: !!r.overlay && prev.overlay !== r.overlay });
  }

  function render(opts = {}) {
    const isLogin = current.page === 'login';
    $('#login-root').hidden = !isLogin;
    $('#shell').hidden = isLogin;
    document.title = `${TITLES[current.page]} · WiraWiri`;
    closeMenus();
    const a = document.activeElement, focus = a && a.id ? { id: a.id, s: a.selectionStart, e: a.selectionEnd } : null;
    const restore = () => {
      const el = focus && document.getElementById(focus.id);
      if (el) { el.focus({ preventScroll: true }); try { if (focus.s != null) el.setSelectionRange(focus.s, focus.e); } catch (_) { /* input tanpa seleksi */ } }
    };
    if (isLogin) {
      // Ilustrasi dirender ulang hanya saat halaman masuk dibuka, jadi animasi bus tidak terulang saat mengetik.
      const main = $('#login-main');
      if (main && !opts.top) { main.innerHTML = loginForm(); restore(); } else $('#login-root').innerHTML = PAGES.login();
      $('#overlay').innerHTML = '';
      document.body.classList.remove('has-overlay');
      return;
    }
    $('#view').innerHTML = PAGES[current.page]();
    document.querySelectorAll('.nav a').forEach(n => {
      const on = n.dataset.nav === NAV_OF[current.page];
      n.classList.toggle('is-active', on);
      if (on) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current');
    });
    renderOverlay(false, opts.overlayOpened);
    if (opts.top) { window.scrollTo(0, 0); $('#view').focus({ preventScroll: true }); }
    if (!opts.top) restore();
  }

  function renderOverlay(keepScroll = false, focusIt = false) {
    const box = $('#overlay');
    const body = box.querySelector('.drawer-body, .modal-body');
    const y = keepScroll && body ? body.scrollTop : 0;
    box.innerHTML = current.overlay ? OVERLAYS[current.overlay]() : '';
    document.body.classList.toggle('has-overlay', !!current.overlay);
    const nb = box.querySelector('.drawer-body, .modal-body');
    if (nb && y) nb.scrollTop = y;
    if (focusIt) box.querySelector('[role="dialog"]')?.focus();
  }

  hydrateIcons();
  document.querySelectorAll('img[data-logo]').forEach(img => { img.src = img.dataset.logo === 'dark' ? LOGO_DARK : LOGO_LIGHT; });
  window.addEventListener('hashchange', route);
  if (!location.hash) location.replace('#/login');
  route();
})();
