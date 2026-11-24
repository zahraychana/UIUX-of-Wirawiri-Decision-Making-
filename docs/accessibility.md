# Audit aksesibilitas (WCAG 2.1 AA)

Kontras dihitung dengan rumus luminans relatif WCAG. Ambang: 4,5:1 untuk teks normal, 3:1 untuk batas komponen UI (1.4.11).

| Elemen | Lama | Rasio lama | Baru | Rasio baru | Ambang | Latar |
|---|---|---|---|---|---|---|
| Teks sekunder (muted) | `#6A788A` | 4.19 ❌ | `#606D7D` | 4.91 ✅ | 4.5 | `#F4F7FC` |
| Placeholder kolom input | `#9AA8B8` | 2.26 ❌ | `#5F7288` | 4.60 ✅ | 4.5 | `#F4F7FC` |
| Merah status (Kritis) | `#C83A44` | 4.43 ❌ | `#C43741` | 4.63 ✅ | 4.5 | `#FCECEE` |
| Amber teks (Waspada) | `#A86F12` | 3.92 ❌ | `#986410` | 4.65 ✅ | 4.5 | `#FDF5E6` |
| Hijau teks (Normal) | `#2F8F5B` | 3.56 ❌ | `#287A4E` | 4.65 ✅ | 4.5 | `#E6F4EC` |
| Label menu sidebar | `#7FA0C2` | 4.24 ❌ | `#9CB6D0` | 5.50 ✅ | 4.5 | `#163A63` |
| Label kecil hero | `#A9C8EC` | 3.52 ❌ | `#D3E3F5` | 4.66 ✅ | 4.5 | `#2F64A0` |
| Keterangan kecil hero | `#9FB6CA` | 2.90 ❌ | `#D9E2EA` | 4.64 ✅ | 4.5 | `#2F64A0` |
| Batas kolom input | `#D6DEE8` | 1.26 ❌ | `#808FA5` | 3.06 ✅ | 3.0 | `#F4F7FC` |
| Sakelar posisi mati | `#D6DEE8` | 1.36 ❌ | `#808FA5` | 3.29 ✅ | 3.0 | `#FFFFFF` |
| Label putih di batang C3 | `#4F86C6` | 3.78 ❌ | `#3C76BA` | 4.67 ✅ | 4.5 | `#FFFFFF` |

## Perubahan lain

- Ukuran teks terkecil dinaikkan dari 10 px menjadi 11 px (statistik mini, label batang).
- Tautan **Lewati ke konten utama** untuk pengguna keyboard dan pembaca layar.
- Semua animasi dimatikan bila sistem meminta `prefers-reduced-motion`.
- Dialog konfirmasi memakai `role="alertdialog"` dan `aria-modal`; halaman yang sedang dimuat memberi `aria-busy` dan teks status untuk pembaca layar.
- Banner galat sinkronisasi memakai `role="alert"`.

## Yang perlu diubah di Figma

Ganti nilai color style berikut, maka semua layar ikut berubah:

| Style | Dari | Ke |
|---|---|---|
| Teks sekunder (muted) | `#6A788A` | `#606D7D` |
| Placeholder kolom input | `#9AA8B8` | `#5F7288` |
| Merah status (Kritis) | `#C83A44` | `#C43741` |
| Amber teks (Waspada) | `#A86F12` | `#986410` |
| Hijau teks (Normal) | `#2F8F5B` | `#287A4E` |
| Label menu sidebar | `#7FA0C2` | `#9CB6D0` |
| Label kecil hero | `#A9C8EC` | `#D3E3F5` |
| Keterangan kecil hero | `#9FB6CA` | `#D9E2EA` |
| Batas kolom input | `#D6DEE8` | `#808FA5` |
| Sakelar posisi mati | `#D6DEE8` | `#808FA5` |
| Label putih di batang C3 | `#4F86C6` | `#3C76BA` |

Catatan: `#A9C8EC` tetap dipakai untuk kata "Wiri" pada logo dan rampa C5 (bukan teks kecil), dan `#4F86C6` tetap untuk grafik tanpa label. Ekspor SVG di `design/desktop/svg/` sudah memakai warna baru; PNG di `design/desktop/screens/` sudah dirender ulang.
