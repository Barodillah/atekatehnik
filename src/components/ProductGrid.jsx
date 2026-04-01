import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products.php?kategori=Paket&limit=4');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
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
              <p className="text-sm">Belum ada produk paket.</p>
            </div>
          ) : (
          products.map((item) => (
            <div key={item.id} className="group bg-surface-container-lowest rounded-sm overflow-hidden hover:shadow-[0_32px_32px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden bg-surface-container shrink-0">
                {item.gambar ? (
                <img 
                  alt={item.nama} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={item.gambar}
                />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-5xl">image</span>
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <h3 className="text-lg font-headline font-bold text-primary line-clamp-2">{item.nama}</h3>
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
      </div>
    </section>
  );
};

export default ProductGrid;
