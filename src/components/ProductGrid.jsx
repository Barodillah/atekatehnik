import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { parseMarkdown } from '../utils/markdownParser';

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products.php?limit=1000');
        const data = await res.json();
        if (data.success) {
          const allProducts = data.products;
          
          // 4 produk terlama dengan kategori paket
          const first4 = [...allProducts].filter(p => p.kategori === 'Paket').sort((a, b) => parseInt(a.id) - parseInt(b.id)).slice(0, 4);
          const first4Ids = new Set(first4.map(p => p.id));
          
          // Filter produk yang belum terpilih
          const remainingProducts = allProducts.filter(p => !first4Ids.has(p.id));

          const targetCategories = ['Paket', 'Unit Mesin Tunggal', 'Peralatan Pendukung', 'Suku Cadang'];
          const randomPicks = [];

          targetCategories.forEach(cat => {
              const catProducts = remainingProducts.filter(p => p.kategori === cat);
              if (catProducts.length > 0) {
                  const randomIndex = Math.floor(Math.random() * catProducts.length);
                  randomPicks.push(catProducts[randomIndex]);
              }
          });
          
          setProducts([...first4, ...randomPicks]);
        }
      } catch {
        // silent fail
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-24 bg-surface relative">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-headline font-bold text-primary mb-4">{t('productGrid.title')}</h2>
            <p className="text-on-surface-variant">{t('productGrid.subtitle')}</p>
          </div>
          <Link className="text-secondary font-bold flex items-center gap-2 group" to="/products">
            {t('productGrid.exploreAll')}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">trending_flat</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3">inventory_2</span>
              <p className="text-sm">Belum ada produk untuk ditampilkan.</p>
            </div>
          ) : (
          products.map((item) => (
            <div key={item.id} className="group bg-surface-container-lowest rounded-sm overflow-hidden hover:shadow-[0_32px_32px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden bg-surface-container shrink-0 relative">
                {item.gambar ? (
                <img 
                  alt={item.nama} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={item.gambar.split(',')[0].trim()}
                />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-5xl">image</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm ${item.kategori === 'Paket'
                    ? 'bg-secondary-fixed text-on-secondary-fixed'
                    : item.kategori === 'Unit Mesin Tunggal'
                      ? 'bg-primary-container text-white'
                      : item.kategori === 'Peralatan Pendukung'
                        ? 'bg-[#2e7d32] text-white'
                        : item.kategori === 'Suku Cadang'
                          ? 'bg-[#e65100] text-white'
                          : 'bg-primary text-white'
                  }`}>
                    {item.kategori === 'Paket' ? (t('products.catPaketLengkap') || 'Paket Lengkap')
                      : item.kategori === 'Unit Mesin Tunggal' ? (t('products.catUnitMesin') || 'Unit Mesin Tunggal')
                        : item.kategori === 'Peralatan Pendukung' ? (t('products.catPeralatan') || 'Peralatan Pendukung')
                          : item.kategori === 'Suku Cadang' ? (t('products.catSukuCadang') || 'Suku Cadang')
                            : item.kategori}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <h3 className="text-lg font-headline font-bold text-primary line-clamp-2">{item.nama}</h3>
                {item.description && (
                  <div 
                    className="text-sm text-on-surface-variant font-body line-clamp-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(item.description) }}
                  />
                )}
                <div className="pt-4 border-t border-outline-variant/10 mt-auto">
                  <Link 
                    to={`/product/${item.slug || item.id}`}
                    className="text-primary font-bold text-sm flex items-center gap-2 cursor-pointer hover:text-secondary transition-colors"
                  >
                    {t('productGrid.detailSpec')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        <div className="mt-10 flex justify-end">
          <Link className="text-secondary font-bold flex items-center gap-2 group" to="/products">
            {t('productGrid.exploreAll') || 'Lihat semua produk'}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">trending_flat</span>
          </Link>
        </div>

        <div className="mt-16 bg-surface-container-high p-8 rounded-sm border border-outline-variant/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-headline font-bold text-primary-container mb-2 flex items-center gap-2">
                Sistem pemesanan mesin untuk pemerintahan / dinas?
              </h3>
              <p className="text-on-surface-variant text-sm mb-4">
                Pemesanan institusional dapat dilakukan secara transparan melalui E-Katalog LKPP (INAPROC) karena kami adalah vendor resmi. Hubungi kami untuk pembuatan RAB dan desain spesifikasi sesuai anggaran Dinas Pertanian daerah Anda.
              </p>
              <details className="text-sm text-on-surface-variant mt-4 group">
                <summary className="cursor-pointer font-bold text-primary hover:text-secondary transition-colors mb-2 flex items-center gap-1">
                  Baca selengkapnya <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <div className="pl-4 border-l-2 border-primary/20 space-y-2 mt-4 text-xs">
                  <p>E-katalog INAPROC Katalog Elektronik adalah sistem toko online resmi yang dikelola oleh Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah (LKPP) guna memudahkan instansi pemerintah membeli kebutuhan barang dan jasa secara elektronik. Anda dapat mengakses portal utama dan daftar produk melalui INAPROC Katalog Elektronik.</p>
                  <p className="font-bold text-primary-container pt-2">Fungsi Utama</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Belanja Langsung (E-Purchasing):</strong> Memungkinkan pejabat pengadaan membeli barang tanpa harus lewat proses tender yang lama.</li>
                    <li><strong>Transparansi Harga:</strong> Menampilkan spesifikasi teknis, daftar harga, dan informasi Tingkat Komponen Dalam Negeri (TKDN) secara terbuka.</li>
                    <li><strong>Dukungan Produk Lokal:</strong> Membantu penyerapan produk dari Usaha Mikro, Kecil, dan Menengah (UMKM) dalam negeri.</li>
                  </ul>
                  <p className="font-bold text-primary-container pt-2">Keunggulan Sistem Baru</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Akun Terpusat:</strong> Menggunakan satu manajemen akun aman yang terintegrasi untuk seluruh akses pengadaan nasional.</li>
                    <li><strong>Sistem Terhubung:</strong> Terhubung langsung dengan pencatatan keuangan negara serta perpajakan.</li>
                  </ul>
                </div>
              </details>
            </div>
            <a href="https://katalog.inaproc.id/ateka-tehnik" target="_blank" rel="noreferrer" className="shrink-0 bg-[#D22B50] text-white px-8 py-3 font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-[#D22B50]/90 transition-colors">
              Kunjungi INAPROC
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
