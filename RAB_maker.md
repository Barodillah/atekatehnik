## 1. Ringkasan Sistem (System Overview)

Sistem **Automated RAB Maker** dirancang untuk menghasilkan dokumen penawaran harga/RAB (Rencana Anggaran Biaya) secara otomatis, dinamis, presisi, dan tersimpan rapi dalam database.

### Fitur Kunci:

1. **Integrasi Data Lead/Konsumen:** Memilih profil prospek secara instan tanpa input manual berulang.
2. **Master Katalog Produk Dinamis:** Menyimpan modul mesin, deskripsi fungsi, spesifikasi dinamo/penggerak, foto unit, dan harga acuan.
3. **Penyusunan RAB Interaktif:** Menambah item, menyesuaikan spesifikasi khusus, *toggle* pajak (PPN), dan kalkulasi otomatis tanpa risiko salah hitung.
4. **Format Dokumen Baku (2-Page Hybrid):** Halaman 1 berfokus pada visualisasi teknis & edukasi, Halaman 2 berfokus pada rincian akuntansi & persetujuan legalitas.
5. **Penyimpanan Snapshot:** Menyimpan riwayat harga dan deskripsi item saat RAB dibuat (tidak terpengaruh jika master data di masa depan berubah).

---

## 2. Standar Format Dokumen RAB (2-Page Layout)

Dokumen diatur dengan ukuran baku **A4 (Portrait)** menggunakan CSS Paged Media (`@page { size: A4; margin: 15mm 15mm 15mm 15mm; }`).

### Halaman 1: *Technical Specification & Product Value Profile*

Tujuan: Menjelaskan apa yang dibeli konsumen, keunggulan mesin, dan menumbuhkan rasa percaya melalui visual produk.

```
+-------------------------------------------------------------------------+
| [KOP SURAT RESMI: Logo CV. Ateka Tehnik, Alamat Bengkel, Telp/WA, Email]|
+-------------------------------------------------------------------------+
| No Surat : {nomor_rab}                     Tanggal      : {tgl_dibuat}  |
| Perihal  : Penawaran Harga Mesin           Masa Berlaku : {valid_until} |
| Kepada   : {nama_konsumen} / {perusahaan}                               |
| Lokasi   : {kota_konsumen}                                              |
+-------------------------------------------------------------------------+
| JUDUL PENAWARAN:                                                        |
| {judul_rab} (contoh: Rencana Anggaran Biaya Combined Rice Mill 1100kg/j)|
+-------------------------------------------------------------------------+
| [FOTO/RENDER UTAMA UNIT MESIN]                                          |
| Gambar unit terpasang beresolusi tinggi dengan label komponen           |
+-------------------------------------------------------------------------+
| KOMPONEN UTAMA SISTEM (Grid 2 Kolom):                                   |
| 1. Unit Pembersih & Destoner    | 3. Unit Penggiling/Poles             |
|    - [Deskripsi fungsi & dinamo]|    - [Deskripsi fungsi & dinamo]      |
| 2. Sistem Elevator Otomatis     | 4. Sistem Penggerak & Panel          |
|    - [Deskripsi fungsi & dinamo]|    - [Deskripsi daya & keamanan box]  |
+-------------------------------------------------------------------------+
| KEUNGGULAN INVESTASI & NILAI TAMBAH:                                    |
| - Efisiensi tenaga kerja dengan alur vertikal otomatis.                 |
| - Tingkat rendemen optimal dengan meminimalkan beras patah.             |
+-------------------------------------------------------------------------+
| Halaman 1 dari 2                                                        |
+-------------------------------------------------------------------------+

```

---

### Halaman 2: *Commercial Breakdown & Legal Approval*

Tujuan: Rincian biaya transparan standar akuntansi, klausul syarat kerja sama, dan legalitas formal.

```
+-------------------------------------------------------------------------+
| [MINI HEADER / LOGO WATERMARK & NOMOR RAB]                              |
+-------------------------------------------------------------------------+
| RINCIAN ANGGARAN BIAYA (RAB)                                            |
|                                                                         |
| +----+-----------------------+-----+--------+---------------+---------+ |
| | NO | URAIAN / SPESIFIKASI  | QTY | SATUAN | HARGA SATUAN  | JUMLAH  | |
| +----+-----------------------+-----+--------+---------------+---------+ |
| | 1  | Cleaner + Destoner    |  1  |  Unit  | 75.000.000    | 75.000.000|
| | 2  | Rice Mill Unit        |  1  |  Unit  | 40.000.000    | 40.000.000|
| | 3  | Elevator + Dinamo     |  2  |  Unit  | 17.500.000    | 35.000.000|
| | ...| ...                   | ... |  ...   | ...           | ...     | |
| +----+-----------------------+-----+--------+---------------+---------+ |
|                                                                         |
|                                     Subtotal Biaya Mesin: Rp xxx.xxx.xxx|
|                              Biaya Instalasi & Ekspedisi: Rp  xx.xxx.xxx|
|                                             Diskon Khusus: (Rp xx.xxx.xxx)|
|                                      Dasar Pengenaan Pajak: Rp xxx.xxx.xxx|
|                                                  PPN 11%: Rp  xx.xxx.xxx|
|                                              GRAND TOTAL: Rp XXX.XXX.XXX|
|                                                                         |
| Terbilang: [Tiga Ratus Lima Puluh Juta Rupiah]                          |
+-------------------------------------------------------------------------+
| SYARAT & KETENTUAN (TERMS & CONDITIONS):                                |
| 1. Sistem Pembayaran: DP 40%, Termin Fabrikasi 40%, Pelunasan 20%     |
|    setelah komisioning/uji coba mesin di lokasi.                        |
| 2. Pengerjaan fabrikasi & instalasi membutuhkan waktu {estimasi_hari}.  |
| 3. Garansi suku cadang dan servis mekanik berlaku selama 6 bulan.       |
| 4. Belum termasuk: Bahan gabah untuk pengujian dan daya listrik lokasi. |
+-------------------------------------------------------------------------+
| KOLOM PENGESAHAN DUA PIHAK:                                             |
|                                                                         |
| Menyetujui / Pembeli,                   Karanganyar, {tgl_dibuat}       |
|                                         CV. ATEKA TEHNIK                |
|                                                                         |
| (.......................)               WARSITO                         |
| Klien / Pemesan                         Pimpinan                        |
+-------------------------------------------------------------------------+
| Halaman 2 dari 2                                                        |
+-------------------------------------------------------------------------+

```

---

## 3. Workflow Aplikasi (Application Architecture)

```
[1. DATA LEAD] ------------+
(Pilih Lead Masuk/Database) |
                           v
               [2. FORM PEMBUATAN RAB] <----+ [MASTER ITEM/PRODUK]
               - Judul & Jenis Mesin        | (Katalog Unit, Dinamo,
               - Pilih Item dari Master     |  Elevator, Panel, Rangka)
               - Ubah Qty / Kustomisasi     |
                           |
                           v
               [3. ENGINE KALKULASI]
               - Hitung Subtotal per Item
               - Hitung Pajak (Toggle PPN 11% / 0%)
               - Biaya Pengiriman & Dudukan Mesin
               - Penomoran Otomatis: {seq}/ATK.S.PN/{bulan_romawi}/{tahun}
                           |
                           v
               [4. PREVIEW & APPROVAL]
               - Tampilan Live HTML mirip cetak (Page 1 & Page 2)
               - Validasi Redaksi & Kejelasan Spek
                           |
                           v
               [5. GENERATE & PENYIMPANAN]
               - Simpan Snapshot ke Database (Data tidak berubah jika master diedit)
               - Ekspor PDF siap cetak / kirim WhatsApp

```

### Penjelasan Tahapan:

1. **Pemilihan Lead:** Operator memilih data konsumen yang sudah tersimpan di CRM/Leads. Informasi seperti Nama, Perusahaan/Kelompok Tani, No. HP/WA, dan Alamat Pengiriman otomatis terisi.
2. **Penyusunan Rincian:** Operator memilih item mesin dari katalog. Input harga satuan dan deskripsi spesifikasi terisi secara otomatis, namun tetap dapat diubah (*override*) jika ada negosiasi atau spesifikasi khusus.
3. **Kalkulasi & Pajak:** Sistem menghitung baris secara otomatis. Tombol *toggle PPN* memungkinkan penerbitan penawaran untuk konsumen perorangan (non-PPN) maupun instansi/koperasi resmi (dengan PPN 11%).
4. **Validasi Penomoran Surat:** Sistem membuat nomor urut surat resmi otomatis berbasis bulan Romawi dan tahun kalender berjalan.
5. **Penyimpanan Snapshot (Penting):** Sistem menyalin seluruh teks, nama barang, gambar, dan harga satuan ke tabel transaksi (`quotation_items`). Jika di masa depan harga besi atau motor naik di tabel master, dokumen penawaran lama tidak akan berubah nilainya.

---

## 4. Skema Database (Database Schema - MySQL DDL)

Berikut rancangan 5 tabel utama dengan relasi referensial yang lengkap dan siap dieksekusi.

```sql
-- 1. Tabel Profil Perusahaan (Pengaturan Kop Surat & Legalitas)
CREATE TABLE `company_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_name` VARCHAR(150) NOT NULL DEFAULT 'CV. ATEKA TEHNIK',
    `tagline` VARCHAR(255) DEFAULT 'RICE MILLING UNIT SOLUTION',
    `address` TEXT NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `logo_url` VARCHAR(255) NULL,
    `signature_image_url` VARCHAR(255) NULL,
    `stamp_image_url` VARCHAR(255) NULL,
    `signatory_name` VARCHAR(100) NOT NULL DEFAULT 'WARSITO',
    `signatory_title` VARCHAR(100) NOT NULL DEFAULT 'Pimpinan',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Konsumen / Data Lead
CREATE TABLE `leads` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) UNIQUE,
    `customer_name` VARCHAR(150) NOT NULL,
    `company_name` VARCHAR(150) NULL,
    `phone` VARCHAR(30) NOT NULL,
    `email` VARCHAR(100) NULL,
    `address` TEXT NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Master Produk & Item Komponen
CREATE TABLE `items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sku` VARCHAR(50) UNIQUE,
    `name` VARCHAR(200) NOT NULL,
    `category` ENUM('machine', 'cleaner', 'destoner', 'elevator', 'polisher', 'motor', 'panel', 'accessories', 'service') NOT NULL,
    `default_unit` VARCHAR(30) NOT NULL DEFAULT 'Unit',
    `default_price` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `specifications` TEXT NULL COMMENT 'Daya dinamo, kapasitas kg/jam, ukuran pipa, tebal plat',
    `description` TEXT NULL COMMENT 'Deskripsi fungsi untuk halaman 1 proposal',
    `image_url` VARCHAR(255) NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Header Penawaran (RAB Master)
CREATE TABLE `quotations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `lead_id` INT NOT NULL,
    `quotation_number` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Contoh: 44/ATK.S.PN/X/2026',
    `title` VARCHAR(255) NOT NULL COMMENT 'Judul proyek / penawaran mesin',
    `capacity_label` VARCHAR(100) NULL COMMENT 'Contoh: 1100 kg/jam',
    `quotation_date` DATE NOT NULL,
    `valid_until_date` DATE NOT NULL,
    `cover_image_url` VARCHAR(255) NULL COMMENT 'Foto unit utama untuk halaman 1',
    `value_propositions` TEXT NULL COMMENT 'Poin keunggulan sistem yang ditawarkan',
    
    -- Kalkulasi Keuangan
    `subtotal` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `installation_fee` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `shipping_fee` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `discount_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `tax_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '0.00 atau 11.00',
    `tax_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `grand_total` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Status & Ketentuan
    `terms_conditions` TEXT NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('draft', 'sent', 'revised', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_quotation_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel Snapshot Rincian Item Penawaran (Detail Line Items)
CREATE TABLE `quotation_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quotation_id` INT NOT NULL,
    `item_id` INT NULL COMMENT 'Boleh NULL jika item kustom non-master',
    `item_name` VARCHAR(200) NOT NULL,
    `specifications` VARCHAR(255) NULL,
    `item_description` TEXT NULL COMMENT 'Deskripsi ringkas yang dicetak',
    `image_url` VARCHAR(255) NULL,
    `qty` INT NOT NULL DEFAULT 1,
    `unit` VARCHAR(30) NOT NULL DEFAULT 'Unit',
    `unit_price` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `total_price` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `sort_order` INT NOT NULL DEFAULT 0,
    `show_on_cover` TINYINT(1) DEFAULT 0 COMMENT '1 jika ditampilkan di highlight halaman 1',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_detail_quotation` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

```

---

## 5. Aturan Bisnis & Rekomendasi Teknis (Technical Best Practices)

1. **Format Penomoran Otomatis:**
```
Rumus: {No_Urut}/ATK.S.PN/{Bulan_Romawi}/{Tahun}
Contoh: 01/ATK.S.PN/X/2026

```


2. **Kalkulasi Desimal:**
* Di sisi kode aplikasi (PHP/Node.js/JS), gunakan integer sen atau pembulatan eksak (`Math.round()` atau `round($val, 2)`).
* Hindari angka pecahan ganjil buatan manusia (seperti `Rp 5.977.477`). Tetapkan harga wajar per item, lalu biarkan sistem menghitung PPN dan pembulatan secara alami.


3. **Pemisahan Halaman Cetak (Print CSS):**
```css
@media print {
  .page-break {
    page-break-after: always;
    break-after: page;
  }
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

```


Pastikan Halaman 1 dibungkus dalam wadah `.page-break` agar saat dikonversi ke PDF atau dicetak langsung dari browser, konten tabel rincian biaya tidak terpotong di tengah halaman.