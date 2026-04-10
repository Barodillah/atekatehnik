import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Products = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { searchQuery } = useOutletContext();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (searchQuery) params.append('search', searchQuery);
      const res = await authFetch(`/api/products.php?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(1); }, [searchQuery]);

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus produk "${nama}"?`)) return;
    try {
      await authFetch(`/api/products.php?id=${id}`, { method: 'DELETE' });
      fetchProducts(pagination.page);
    } catch {}
  };

  return (
    <section className="p-4 md:p-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 md:gap-6">
        <div className="max-w-2xl">
          <span className="font-label text-[10px] md:text-xs tracking-widest text-secondary uppercase font-bold mb-1 md:mb-2 block">Inventory Control</span>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight leading-none mb-2 md:mb-4">Product Management</h2>
          <p className="text-sm md:text-base text-on-surface-variant max-w-lg leading-relaxed">
            Configure and monitor the Ateka Tehnik industrial rice milling units. Manage technical specifications, inventory status, and regional pricing tiers from a central control hub.
          </p>
        </div>
        <div>
          <button 
            onClick={() => navigate('/admin/products/new')}
            className="bg-primary-container text-on-primary px-6 py-3 rounded-sm font-label font-bold flex items-center gap-2 shadow-sm hover:brightness-110 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Entry
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 md:mb-12">
        <div className="bg-surface-container-low p-4 md:p-6 rounded-sm">
          <p className="font-label text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Total Products</p>
          <p className="text-3xl font-headline font-bold text-primary">{pagination.total}</p>
        </div>
        <div className="bg-surface-container-low p-4 md:p-6 rounded-sm">
          <p className="font-label text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Paket</p>
          <p className="text-2xl md:text-3xl font-headline font-bold text-primary">{products.filter(p => p.kategori === 'Paket').length}</p>
        </div>
        <div className="bg-surface-container-low p-4 md:p-6 rounded-sm">
          <p className="font-label text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Suku Cadang</p>
          <p className="text-2xl md:text-3xl font-headline font-bold text-secondary">{products.filter(p => p.kategori === 'Suku Cadang').length}</p>
        </div>
        <div className="bg-surface-container-low p-4 md:p-6 rounded-sm border-l-4 border-secondary">
          <p className="font-label text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Total Pages</p>
          <p className="text-2xl md:text-3xl font-headline font-bold text-primary">{pagination.totalPages}</p>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
          <p className="text-sm text-on-surface-variant mt-3">Memuat produk...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3">inventory_2</span>
          <p className="text-lg font-bold">Belum ada produk.</p>
          <p className="text-sm mt-1">Tambahkan produk pertama Anda!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group bg-surface-container-lowest transition-all">
              <div className="aspect-[16/10] bg-surface-container-highest overflow-hidden relative">
                {product.gambar ? (
                  <img
                    alt={product.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={product.gambar.split(',')[0].trim()}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-5xl">image</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter">
                  {product.kategori}
                </div>
              </div>
              <div className="pt-6 pb-2 px-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-label text-[10px] text-secondary font-bold uppercase tracking-widest">{product.kategori}</p>
                    <h3 className="font-headline text-xl font-bold text-primary">{product.nama}</h3>
                  </div>
                </div>
                {/* Specs preview */}
                {product.spesifikasi && product.spesifikasi.length > 0 && (
                  <div className="py-3 space-y-1">
                    {product.spesifikasi.slice(0, 3).map((spec, i) => (
                      <p key={i} className="text-xs text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[12px] text-secondary">check</span>
                        {spec}
                      </p>
                    ))}
                    {product.spesifikasi.length > 3 && (
                      <p className="text-[10px] text-outline">+{product.spesifikasi.length - 3} spesifikasi lainnya</p>
                    )}
                  </div>
                )}
                {product.shopee_link && (
                  <a href={product.shopee_link} target="_blank" rel="noreferrer" className="text-xs text-orange-500 font-bold flex items-center gap-1 hover:underline mt-1">
                    <span className="material-symbols-outlined text-[14px]">shopping_bag</span> Shopee
                  </a>
                )}
                <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant/10">
                  <button 
                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                    className="flex-1 py-2 bg-surface-container-highest text-primary font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-outline-variant transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id, product.nama)}
                    className="px-4 py-2 text-error hover:bg-error-container/30 transition-colors rounded-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Placeholder Card */}
          <div 
            onClick={() => navigate('/admin/products/new')}
            className="border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-12 hover:bg-surface-container transition-colors cursor-pointer group min-h-[400px]"
          >
            <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-container group-hover:text-on-primary transition-all">
              <span className="material-symbols-outlined text-3xl">add_circle</span>
            </div>
            <p className="font-headline font-bold text-primary">Register New Machine</p>
            <p className="text-xs text-on-surface-variant mt-2">Upload specs and high-res imagery</p>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-12 md:mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-label uppercase tracking-widest text-outline">
            Displaying page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => fetchProducts(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="w-10 h-10 flex items-center justify-center bg-surface-container-low text-primary rounded-sm hover:bg-surface-container-highest transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button 
                key={p}
                onClick={() => fetchProducts(p)}
                className={`w-10 h-10 flex items-center justify-center rounded-sm ${p === pagination.page ? 'bg-primary-container text-on-primary shadow-md' : 'bg-surface-container-low text-primary hover:bg-surface-container-highest transition-all'}`}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => fetchProducts(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="w-10 h-10 flex items-center justify-center bg-surface-container-low text-primary rounded-sm hover:bg-surface-container-highest transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Products;
