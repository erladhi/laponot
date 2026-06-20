
# Aplikasi Laporan Akta Notaris

Aplikasi single-user (tanpa login) untuk mencatat dan mencetak buku-buku wajib notaris sesuai format Ikatan Notaris Indonesia (INI) / UU Jabatan Notaris (UU 2/2014) Pasal 58 & 61.

## Modul yang Dibuat

### 1. Daftar Akta (Reportorium)
Kolom sesuai buku resmi:
- Nomor urut akta
- Tanggal akta
- Nomor akta
- Bentuk akta (Akta Pihak / Akta Pejabat / Berita Acara)
- Judul / sifat akta (mis. Jual Beli, Kuasa, PT, Yayasan, Hibah, Wasiat, dst.)
- Nama penghadap (multi-baris)
- Saksi-saksi
- Keterangan

### 2. Buku Daftar Legalisasi
- Nomor urut, tanggal legalisasi
- Nama & alamat penanda tangan
- Sifat/judul surat
- Keterangan

### 3. Buku Daftar Waarmerking (Pendaftaran Surat di Bawah Tangan)
- Nomor urut, tanggal pendaftaran
- Nama pihak yang mendaftarkan
- Sifat/judul surat
- Keterangan

### 4. Buku Daftar Protes (Wesel/Cek) & Daftar Wasiat
Dua tab terpisah dengan kolom standar masing-masing (nomor, tanggal, jenis surat berharga / pewasiat, pihak terkait, keterangan).

### 5. Laporan Bulanan
- Pilih bulan & tahun → otomatis menarik data dari ke-4 buku di atas
- Ringkasan jumlah akta per jenis
- Daftar akta wasiat untuk laporan ke Daftar Pusat Wasiat (Kemenkumham)
- Tombol ekspor PDF & Excel

## Halaman & Navigasi

```text
Sidebar
├── Dashboard (ringkasan jumlah & cari cepat)
├── Reportorium Akta
├── Legalisasi
├── Waarmerking
├── Protes & Wasiat
├── Laporan Bulanan
└── Pengaturan Notaris (nama, SK, wilayah, kota kedudukan — dipakai di kop PDF)
```

Tiap halaman buku: tabel daftar + tombol "Tambah", pencarian (nomor/nama/tanggal), filter rentang tanggal, edit/hapus, tombol "Cetak PDF" dan "Ekspor Excel".

## Ekspor

- **PDF** memakai jsPDF + jsPDF-autoTable dengan layout landscape A4, kop notaris, judul buku, kolom persis format reportorium. Tiap buku punya template PDF sendiri.
- **Excel** memakai SheetJS (xlsx) dengan header kolom sama.

## Penyimpanan Data

Single-user, tanpa login → data disimpan di **IndexedDB** (via Dexie) di browser pengguna, dengan tombol **Backup (.json)** dan **Restore (.json)** di Pengaturan agar tidak hilang saat ganti perangkat. Tidak perlu Lovable Cloud.

## Desain Visual

- Tema "kantor notaris": warna utama navy `#1B2A4E` + emas `#B8924A` aksen, latar krem `#F7F3EC`, teks `#1A1A1A`.
- Tipografi: **Playfair Display** (judul, terkesan formal/legal) + **Inter** (body & tabel).
- Tabel padat, garis tipis, baris berseling halus — meniru estetika buku register.
- Layout sidebar tetap di kiri, konten lebar penuh dengan kartu putih bertepi tipis.

## Detail Teknis

- TanStack Start (sudah ada) + file routes baru: `/`, `/reportorium`, `/legalisasi`, `/waarmerking`, `/protes-wasiat`, `/laporan-bulanan`, `/pengaturan`.
- State & data: Dexie (`bun add dexie dexie-react-hooks`).
- Form: react-hook-form + zod (sudah tersedia di shadcn).
- PDF: `bun add jspdf jspdf-autotable`. Excel: `bun add xlsx`.
- Font: `bun add @fontsource/playfair-display @fontsource/inter`, import di `src/router.tsx` atau root, set token di `src/styles.css`.
- Komponen tabel & form pakai shadcn yang sudah ada (Table, Dialog, Input, Select, Calendar, Button, Card, Tabs).
- Validasi: nomor urut otomatis per buku per tahun, tanggal wajib, format tanggal Indonesia (dd-mm-yyyy) di tampilan; ISO di penyimpanan.

## Yang TIDAK termasuk (agar jelas)

- Tidak ada login / multi-user / sinkronisasi cloud.
- Tidak ada master data penghadap (sesuai pilihan: isi manual tiap akta).
- Tidak generate isi akta — hanya mencatat & melaporkan.
- Belum mengirim otomatis ke portal Kemenkumham (output PDF/Excel siap unggah manual).

Setelah disetujui, saya bangun seluruh modul + ekspor PDF/Excel dalam satu iterasi.
