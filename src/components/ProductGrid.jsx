import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { t } = useLanguage();

  const products = [
    {
      "nama": "PAKET 1-2 TON/JAM SIAP KONSUMSI",
      "gambar": "https://atekateknik.com/wp-content/uploads/2019/10/ateka-teknik-ricemill-4.jpg",
      "spesifikasi": [
        "Elevator 3unit 5/6in",
        "Huller Yanmar 2 Unit",
        "Saringan Gabah 1 Unit",
        "Polisher 2 unit N70",
        "Penggerak Mesin Mobil PS100"
      ]
    },
    {
      "nama": "PAKET 3-5 TON/JAM GLOSOR & POLES",
      "gambar": "https://atekateknik.com/wp-content/uploads/2020/07/rice-milling-ateka-teknik_2.jpg",
      "spesifikasi": [
        "Elevator 8unit 6in",
        "Huller HU 1 Unit",
        "Polisher 2 unit N70",
        "Separator",
        "Seed Cleaner",
        "Cello/Tandon Beras"
      ]
    },
    {
      "nama": "PAKET 1,5-2TON/JAM POLES SATAKE",
      "gambar": "https://atekateknik.com/wp-content/uploads/2020/07/rice-milling-ateka-teknik_3.jpg",
      "spesifikasi": [
        "Elevator 3unit 5/6in",
        "Polisher Satake",
        "Ayakan Menir",
        "PK HU"
      ]
    },
    {
      "nama": "PAKET SELEPAN KELILING",
      "gambar": "https://atekateknik.com/wp-content/uploads/2020/07/rice-milling-ateka-teknik_5.jpg",
      "spesifikasi": [
        "Huller Yanmar/LM 1 Unit",
        "Polisher N70 1 unit",
        "Penggerak Disel 1unit",
        "Sasis"
      ]
    }
  ];

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
          {products.map((item, index) => (
            <div key={index} className="group bg-surface-container-lowest rounded-sm overflow-hidden hover:shadow-[0_32px_32px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden bg-surface-container shrink-0">
                <img 
                  alt={item.nama} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={item.gambar}
                />
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <h3 className="text-lg font-headline font-bold text-primary line-clamp-2">{item.nama}</h3>
                <div className="pt-4 border-t border-outline-variant/10 mt-auto">
                  <button 
                    onClick={() => setSelectedProduct(item)}
                    className="text-primary font-bold text-sm flex items-center gap-2 cursor-pointer hover:text-secondary transition-colors"
                  >
                    {t('productGrid.detailSpec')} <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Detail Spesifikasi */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedProduct(null)}
          ></div>
          <div className="bg-surface-container-lowest rounded-sm shadow-2xl relative w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="aspect-video bg-surface-container shrink-0 relative">
              <img 
                src={selectedProduct.gambar} 
                alt={selectedProduct.nama} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center shadow-lg"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <h3 className="text-xl font-headline font-bold text-primary mb-6">{selectedProduct.nama}</h3>
              <div className="space-y-4">
                <p className="text-sm font-bold tracking-widest text-secondary uppercase">{t('productGrid.specLabel')}</p>
                <ul className="space-y-3">
                  {selectedProduct.spesifikasi.map((spec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-base mt-0.5">check_circle</span>
                      <span className="text-on-surface-variant text-sm font-medium leading-relaxed">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-6 bg-surface-container-low border-t border-outline-variant/10 shrink-0 flex justify-end gap-3">
               <button 
                 onClick={() => setSelectedProduct(null)}
                 className="px-6 py-2.5 rounded-sm font-bold text-sm text-primary hover:bg-surface-variant transition-colors"
               >
                 {t('productGrid.close')}
               </button>
               <a 
                 href={`https://wa.me/62881080634612?text=Halo%20Ateka%20Tehnik,%20saya%20ingin%20konsultasi%20detail%20mengenai%20${encodeURIComponent(selectedProduct.nama)}.`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="bg-primary-container text-white px-6 py-2.5 rounded-sm font-bold text-sm hover:bg-primary transition-colors flex items-center gap-2"
               >
                 <span className="material-symbols-outlined text-sm">chat</span>
                 {t('productGrid.consult')}
               </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
