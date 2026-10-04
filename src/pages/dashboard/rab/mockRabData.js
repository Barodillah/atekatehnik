export const mockLeads = [
  {
    id: 1,
    code: 'LD-001',
    customer_name: 'Bapak Budi Santoso',
    company_name: 'Kelompok Tani Makmur',
    phone: '081234567890',
    email: 'budi.makmur@gmail.com',
    address: 'Jl. Raya Pertanian No. 12',
    city: 'Ngawi, Jawa Timur',
  },
  {
    id: 2,
    code: 'LD-002',
    customer_name: 'CV. Agro Pangan',
    company_name: 'CV. Agro Pangan Sejahtera',
    phone: '085678901234',
    email: 'info@agropangan.com',
    address: 'Kawasan Industri Candi Blok A',
    city: 'Semarang, Jawa Tengah',
  }
];

export const mockItems = [
  {
    id: 1,
    sku: 'MCH-001',
    name: 'Paddy Cleaner & Destoner 1 Ton',
    category: 'machine',
    default_unit: 'Unit',
    default_price: 35000000,
    specifications: 'Kapasitas 1-1.5 Ton/Jam. Termasuk Blower hisap debu.',
    description: 'Unit pembersih gabah dari kotoran ringan (jerami, tali) dan batu kerikil secara otomatis.',
    image_url: 'https://placehold.co/400x300?text=Cleaner+Destoner',
  },
  {
    id: 2,
    sku: 'MCH-002',
    name: 'Rice Mill Unit (Pecah Kulit + Poles)',
    category: 'machine',
    default_unit: 'Unit',
    default_price: 55000000,
    specifications: 'Roll Karet 6 inch, Besi Cor Tebal',
    description: 'Mesin utama penggiling padi dua tahap (pecah kulit dan poles beras putih) dengan tingkat rendemen optimal.',
    image_url: 'https://placehold.co/400x300?text=Rice+Mill',
  },
  {
    id: 3,
    sku: 'ELV-001',
    name: 'Elevator Mangkok (Bucket Elevator)',
    category: 'elevator',
    default_unit: 'Unit',
    default_price: 15000000,
    specifications: 'Tinggi 3 Meter, Mangkok PVC, Sabuk Karet.',
    description: 'Sistem pengangkat material vertikal otomatis untuk menghemat tenaga kerja.',
    image_url: 'https://placehold.co/400x300?text=Elevator',
  },
  {
    id: 4,
    sku: 'MTR-001',
    name: 'Dinamo Motor 15 HP (3 Phase)',
    category: 'motor',
    default_unit: 'Pcs',
    default_price: 6500000,
    specifications: '15 HP / 11 kW, 380V, 1450 RPM.',
    description: 'Motor penggerak utama spesifikasi industri kelas berat.',
    image_url: 'https://placehold.co/400x300?text=Motor+15HP',
  },
  {
    id: 5,
    sku: 'PNL-001',
    name: 'Panel Kontrol Listrik Utama',
    category: 'panel',
    default_unit: 'Set',
    default_price: 12000000,
    specifications: 'Komponen Schneider, Box Panel 80x60x30cm, Indikator Ampere & Voltase.',
    description: 'Pusat kendali operasional mesin dengan fitur keselamatan otomatis (MCB, Contactor).',
    image_url: 'https://placehold.co/400x300?text=Panel+Box',
  }
];

export const mockQuotations = [
  {
    id: 1,
    quotation_number: '01/ATK.S.PN/X/2026',
    title: 'Rencana Anggaran Biaya Combined Rice Mill 1.5 Ton/Jam',
    customer: mockLeads[0],
    quotation_date: '2026-10-01',
    valid_until_date: '2026-10-15',
    grand_total: 135000000,
    status: 'sent',
  },
  {
    id: 2,
    quotation_number: '02/ATK.S.PN/X/2026',
    title: 'Upgrade Sistem Poles Beras dan Elevator',
    customer: mockLeads[1],
    quotation_date: '2026-10-02',
    valid_until_date: '2026-10-16',
    grand_total: 45000000,
    status: 'draft',
  }
];

export const defaultTerms = `1. Sistem Pembayaran:
   - DP (Down Payment) 40% pada saat penandatanganan kontrak kerja.
   - Termin Fabrikasi 40% saat barang siap dikirim ke lokasi.
   - Pelunasan 20% setelah komisioning/uji coba mesin selesai dilakukan di lokasi.
2. Waktu Pengerjaan: Fabrikasi dan instalasi membutuhkan waktu estimasi 21-30 hari kerja setelah DP diterima.
3. Garansi: Garansi suku cadang (non-consumable) dan servis mekanik berlaku selama 6 bulan sejak serah terima.
4. Exclusions (Belum Termasuk):
   - Bahan gabah untuk pengujian di lokasi.
   - Penyediaan daya listrik utama yang memadai di lokasi.
   - Pekerjaan sipil (pengecoran pondasi mesin).`;

export const mockRabTemplates = [
  {
    id: 1,
    title: 'Penawaran Sistem Komplit 1.5 Ton',
    capacity: '1.5 Ton/Jam',
    image_url: 'https://placehold.co/400x300?text=Complete+Set',
    description: 'Paket lengkap penggilingan padi terpadu untuk menghasilkan beras berkualitas dengan tingkat beras patah yang minim.\nMengintegrasikan proses pembersihan, pemisahan batu, pengupasan, hingga penyosohan secara efisien.',
    advantages: [
      'Struktur kompak & hemat ruang',
      'Alur kerja otomatis dengan elevator',
      'Hasil beras bersih & mengkilap'
    ],
    items: [
      { id: 101, name: 'Paddy Cleaner & Destoner', qty: 1, unit: 'Unit', price: 15000000, showOnCover: true, desc: 'Pembersih gabah dan pemisah batu otomatis.' },
      { id: 102, name: 'Pneumatic Husker', qty: 1, unit: 'Unit', price: 25000000, showOnCover: true, desc: 'Pengupas kulit gabah sistem pneumatik.' }
    ],
    installFee: 5000000,
    shippingFee: 2000000,
    discount: 1000000,
    useTax: true,
    terms: defaultTerms
  },
  {
    id: 2,
    title: 'Upgrade Sistem Poles Premium',
    capacity: '2 Ton/Jam',
    image_url: 'https://placehold.co/400x300?text=Polisher+System',
    description: 'Sistem penyosohan dan pemolesan beras tingkat lanjut menggunakan double polisher air untuk menghasilkan beras putih, kristal, dan tahan lama.',
    advantages: [
      'Hasil beras super premium / kepala',
      'Sistem kabut air otomatis',
      'Mengurangi suhu beras saat dipoles',
      'Minim debu dan dedak'
    ],
    items: [
      { id: 201, name: 'Water Polisher', qty: 2, unit: 'Unit', price: 18000000, showOnCover: true, desc: 'Polisher air presisi tinggi.' },
      { id: 202, name: 'Rotary Sifter', qty: 1, unit: 'Unit', price: 12000000, showOnCover: false, desc: 'Penyaring beras patah (menir).' }
    ],
    installFee: 3000000,
    shippingFee: 1500000,
    discount: 0,
    useTax: false,
    terms: defaultTerms
  }
];
