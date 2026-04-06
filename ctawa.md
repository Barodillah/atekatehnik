# WhatsApp CTA Click Tracking & Admin Dashboard

Mencatat setiap klik tombol WhatsApp CTA di seluruh website ke database, dan menampilkan hasilnya di halaman dashboard admin baru.

## User Review Required

> [!IMPORTANT]
> **Table baru vs `page_views` yang ada?**
> Saya **merekomendasikan table baru** (`wa_cta_clicks`) karena:
> - Data CTA click secara konseptual berbeda dari page view — ini adalah *konversi/aksi*, bukan *kunjungan*
> - Field yang dibutuhkan berbeda: perlu `source_page`, `source_label` (konteks tombol mana yang diklik), tapi tidak perlu `page_type`/`page_slug` yang spesifik post/product
> - Kalau digabung ke `page_views`, query analytics jadi campur dan rumit (harus filter `page_type = 'wa_click'` terus-menerus)
> - Table terpisah memungkinkan query dashboard yang lebih cepat dan bersih

### SQL Query untuk Membuat Table

```sql
CREATE TABLE wa_cta_clicks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_page VARCHAR(100) NOT NULL COMMENT 'Halaman asal klik, e.g. home, product-detail, contact',
    source_label VARCHAR(255) DEFAULT NULL COMMENT 'Label/konteks CTA, e.g. nama produk, chatbot-agent',
    wa_number VARCHAR(20) NOT NULL DEFAULT '62881080634612',
    ip_address VARCHAR(45) DEFAULT 'unknown',
    user_agent VARCHAR(500) DEFAULT '',
    browser VARCHAR(50) DEFAULT '',
    os VARCHAR(50) DEFAULT '',
    device_type VARCHAR(20) DEFAULT 'Desktop',
    country VARCHAR(100) DEFAULT '',
    city VARCHAR(100) DEFAULT '',
    referrer VARCHAR(500) DEFAULT '',
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Proposed Changes

### Backend API

#### [NEW] [track_wa_click.php](file:///c:/laragon/www/atekatehnik/public/api/track_wa_click.php)
- `POST /api/track_wa_click.php`
- Body: `{ "source_page": "product-detail", "source_label": "RMU 2 Ton" }`
- Reuse pola dari `track_view.php`: parse user-agent, geo-lookup via ip-api.com, insert ke `wa_cta_clicks`
- Tidak perlu auth (public endpoint, dipanggil dari frontend)

#### [NEW] [admin_wa_clicks.php](file:///c:/laragon/www/atekatehnik/public/api/admin_wa_clicks.php)
- `GET /api/admin_wa_clicks.php` — Overview: total clicks, clicks per source_page, top cities, top devices, recent clicks, trend 7 hari
- `GET /api/admin_wa_clicks.php?source_page=X` — Detail per source page
- Memerlukan auth (`requireAuth()`)

---

### Frontend Utility

#### [NEW] [trackWaClick.js](file:///c:/laragon/www/atekatehnik/src/utils/trackWaClick.js)
- Fungsi `trackWaClick(sourcePage, sourceLabel)` yang fire-and-forget POST ke `/api/track_wa_click.php`
- Dipanggil `onClick` sebelum redirect ke WhatsApp

---

### Modifikasi 7 CTA WhatsApp

Setiap file akan dimodifikasi untuk:
1. Import `trackWaClick`
2. Tambah `onClick` handler yang memanggil `trackWaClick(page, label)` sebelum buka link WA

| # | File | `source_page` | `source_label` |
|---|------|---------------|-----------------|
| 1 | [ChatbotWidget.jsx](file:///c:/laragon/www/atekatehnik/src/components/ChatbotWidget.jsx) L187 | `chatbot` | `contact-agent` |
| 2 | [ContactMe.jsx](file:///c:/laragon/www/atekatehnik/src/components/ContactMe.jsx) L69 | `home-contact` | `konsultasi` |
| 3 | [Contact.jsx](file:///c:/laragon/www/atekatehnik/src/pages/Contact.jsx) L177 | `contact-page` | `wa-support` |
| 4 | [Edukasi.jsx](file:///c:/laragon/www/atekatehnik/src/pages/Edukasi.jsx) L73-74 | `edukasi` | `cta-konsultasi` |
| 5 | [ErrorPage.jsx](file:///c:/laragon/www/atekatehnik/src/pages/ErrorPage.jsx) L199-200 | `error-page` | `bantuan` |
| 6 | [ProductDetail.jsx](file:///c:/laragon/www/atekatehnik/src/pages/ProductDetail.jsx) L158-159 | `product-detail` | `{product.nama}` |
| 7 | [Products.jsx](file:///c:/laragon/www/atekatehnik/src/pages/Products.jsx) L167-168 | `products-list` | `{product.nama}` |

> [!NOTE]
> Link WA tetap menggunakan `<a href>` normal. Handler `onClick` hanya mengirim tracking request secara async (fire-and-forget), tidak memblokir navigasi ke WhatsApp.

---

### Admin Dashboard Page

#### [NEW] [WaClicks.jsx](file:///c:/laragon/www/atekatehnik/src/pages/dashboard/WaClicks.jsx)
Halaman baru di admin dashboard (`/admin/wa-clicks`) dengan:
- **Summary Cards**: Total Clicks, Today's Clicks, Top Source, Unique Visitors
- **Chart**: Trend klik 7 hari terakhir (bar chart sederhana CSS)
- **Breakdown by Source Page**: tabel dengan jumlah klik per halaman asal
- **Recent Clicks**: 50 klik terakhir dengan detail (source, IP, browser, city, waktu)
- **Top Cities & Devices**: breakdown pie/bar

#### [MODIFY] [App.jsx](file:///c:/laragon/www/atekatehnik/src/App.jsx)
- Import `WaClicks` component
- Tambah route: `<Route path="wa-clicks" element={<WaClicks />} />`

#### [MODIFY] [DashboardLayout.jsx](file:///c:/laragon/www/atekatehnik/src/components/dashboard/DashboardLayout.jsx)
- Tambah sidebar link "WA Clicks" dengan icon `ads_click` di antara "Analytics" dan "Activity Logs"
- Update search placeholder untuk path `/admin/wa-clicks`

## Verification Plan

### Automated Tests
- Klik salah satu tombol WA di website → cek di browser Network tab bahwa POST ke `/api/track_wa_click.php` berhasil (200 OK)
- Buka `/admin/wa-clicks` → pastikan data muncul di summary cards dan recent clicks table
- Test di halaman Products → klik WA CTA di produk specific → cek `source_label` mencatat nama produk yang benar

### Manual Verification
- Jalankan SQL query di HeidiSQL: `SELECT * FROM wa_cta_clicks ORDER BY clicked_at DESC LIMIT 10`
- Verifikasi data geo-location terisi jika mengakses dari IP publik
