import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Products = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { searchQuery } = useOutletContext();

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, nama: '' });
  const [copiedId, setCopiedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    kategori: '',
    has_shopee: false,
    has_tokopedia: false,
    has_tiktokshop: false,
    has_inaproc: false,
  });

  const observerTarget = useRef(null);

  const fetchProducts = async (page = 1, append = false) => {
    if (!append) setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 18 });
      if (searchQuery) params.append('search', searchQuery);
      if (filters.kategori) params.append('kategori', filters.kategori);
      if (filters.has_shopee) params.append('has_shopee', '1');
      if (filters.has_tokopedia) params.append('has_tokopedia', '1');
      if (filters.has_tiktokshop) params.append('has_tiktokshop', '1');
      if (filters.has_inaproc) params.append('has_inaproc', '1');

      const res = await authFetch(`/api/products.php?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        if (append) {
          setProducts(prev => {
             const existingIds = new Set(prev.map(p => p.id));
             const newProds = data.products.filter(p => !existingIds.has(p.id));
             return [...prev, ...newProds];
          });
        } else {
          setProducts(data.products);
        }
        setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, false);
  }, [searchQuery, filters]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages && !isLoading) {
      fetchProducts(pagination.page + 1, true);
    }
  }, [pagination, isLoading, filters, searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [loadMore]);

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await authFetch(`/api/products.php?id=${deleteModal.id}`, { method: 'DELETE' });
      setDeleteModal({ isOpen: false, id: null, nama: '' });
      fetchProducts(1, false);
    } catch {}
  };

  const handleCopyLink = (product) => {
    const link = `${window.location.origin}/product/${product.slug || product.id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
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
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-container-low p-4 rounded-sm border-l-4 border-primary">
            <p className="font-label text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Total Produk</p>
            <p className="text-3xl font-headline font-bold text-primary">{pagination.total}</p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-sm">
            <p className="font-label text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Kategori Utama</p>
            <div className="text-xs text-on-surface-variant mt-2 space-y-1 font-bold">
              <div className="flex justify-between"><span>Paket:</span> <span>{stats.byKategori['Paket'] || 0}</span></div>
              <div className="flex justify-between"><span>Suku Cadang:</span> <span>{stats.byKategori['Suku Cadang'] || 0}</span></div>
              <div className="flex justify-between"><span>Unit Mesin:</span> <span>{stats.byKategori['Unit Mesin Tunggal'] || 0}</span></div>
              <div className="flex justify-between"><span>Peralatan:</span> <span>{stats.byKategori['Peralatan Pendukung'] || 0}</span></div>
            </div>
          </div>
          <div className="bg-surface-container-low p-4 rounded-sm">
            <p className="font-label text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Marketplace Links</p>
            <div className="text-xs text-on-surface-variant mt-2 space-y-1 font-bold">
              <div className="flex justify-between text-orange-500"><span>Shopee:</span> <span>{stats.byLink.shopee}</span></div>
              <div className="flex justify-between text-green-600"><span>Tokopedia:</span> <span>{stats.byLink.tokopedia}</span></div>
              <div className="flex justify-between text-slate-800"><span>TikTok:</span> <span>{stats.byLink.tiktokshop}</span></div>
            </div>
          </div>
          <div className="bg-surface-container-low p-4 rounded-sm border-l-4 border-red-500">
            <p className="font-label text-[10px] text-outline font-bold uppercase tracking-widest mb-1">E-Katalog</p>
            <p className="text-2xl font-headline font-bold text-red-600 mt-1">{stats.byLink.inaproc}</p>
            <p className="text-xs text-on-surface-variant font-bold">INAPROC terhubung</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-surface-container-low p-4 rounded-sm mb-8 flex flex-col xl:flex-row gap-4 xl:items-center">
        <div className="flex-1">
          <select 
            value={filters.kategori}
            onChange={e => setFilters(prev => ({ ...prev, kategori: e.target.value }))}
            className="w-full xl:w-64 bg-white border border-outline-variant/30 text-sm py-2 px-3 outline-none focus:border-primary transition-colors font-bold text-on-surface"
          >
            <option value="">Semua Kategori</option>
            <option value="Paket">Paket Lengkap</option>
            <option value="Unit Mesin Tunggal">Unit Mesin Tunggal</option>
            <option value="Peralatan Pendukung">Peralatan Pendukung</option>
            <option value="Suku Cadang">Suku Cadang</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          <label className="flex items-center gap-1 cursor-pointer bg-orange-100 text-orange-700 px-3 py-2 rounded-sm hover:bg-orange-200 transition-colors">
            <input type="checkbox" checked={filters.has_shopee} onChange={e => setFilters(prev => ({ ...prev, has_shopee: e.target.checked }))} className="accent-orange-500" />
            Shopee
          </label>
          <label className="flex items-center gap-1 cursor-pointer bg-green-100 text-green-700 px-3 py-2 rounded-sm hover:bg-green-200 transition-colors">
            <input type="checkbox" checked={filters.has_tokopedia} onChange={e => setFilters(prev => ({ ...prev, has_tokopedia: e.target.checked }))} className="accent-green-600" />
            Tokopedia
          </label>
          <label className="flex items-center gap-1 cursor-pointer bg-slate-200 text-slate-800 px-3 py-2 rounded-sm hover:bg-slate-300 transition-colors">
            <input type="checkbox" checked={filters.has_tiktokshop} onChange={e => setFilters(prev => ({ ...prev, has_tiktokshop: e.target.checked }))} className="accent-slate-800" />
            TikTok
          </label>
          <label className="flex items-center gap-1 cursor-pointer bg-red-100 text-red-700 px-3 py-2 rounded-sm hover:bg-red-200 transition-colors">
            <input type="checkbox" checked={filters.has_inaproc} onChange={e => setFilters(prev => ({ ...prev, has_inaproc: e.target.checked }))} className="accent-red-600" />
            INAPROC
          </label>
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
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
          {products.map((product) => (
            <div key={product.id} className="group bg-surface-container-lowest transition-all flex flex-col h-full">
              <div className="aspect-square bg-surface-container-highest overflow-hidden relative">
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
                <div className="absolute top-2 right-2 flex gap-1 items-center">
                  {product.views !== undefined && (
                    <div className="bg-surface/90 backdrop-blur-sm text-primary px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm border border-outline-variant/20" title={`${product.views} kali dilihat`}>
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      <span className="text-[10px] font-bold">{product.views}</span>
                    </div>
                  )}
                  <button 
                    onClick={() => handleCopyLink(product)}
                    className="bg-surface/90 backdrop-blur-sm hover:bg-surface text-primary px-2 py-1 rounded-sm flex items-center justify-center shadow-sm border border-outline-variant/20 transition-colors" 
                    title="Salin Link Produk"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedId === product.id ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="pt-4 pb-2 px-2 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-label text-[9px] text-secondary font-bold uppercase tracking-widest">{product.kategori}</p>
                    <h3 className="font-headline text-sm font-bold text-primary leading-tight mt-1 line-clamp-2" title={product.nama}>{product.nama}</h3>
                  </div>
                </div>
                {product.shopee_link && (
                  <a href={product.shopee_link} target="_blank" rel="noreferrer" className="text-xs text-orange-500 font-bold flex items-center gap-1 hover:underline mt-1">
                    <span className="material-symbols-outlined text-[14px]">shopping_bag</span> Shopee
                  </a>
                )}
                {product.inaproc_link && (
                  <a href={product.inaproc_link} target="_blank" rel="noreferrer" className="text-xs text-red-600 font-bold flex items-center gap-1 hover:underline mt-1">
                    <span className="material-symbols-outlined text-[14px]">storefront</span> INAPROC
                  </a>
                )}
                {product.tokopedia_link && (
                  <a href={product.tokopedia_link} target="_blank" rel="noreferrer" className="text-xs text-green-600 font-bold flex items-center gap-1 hover:underline mt-1">
                    <span className="material-symbols-outlined text-[14px]">shopping_cart</span> Tokopedia
                  </a>
                )}
                {product.tiktokshop_link && (
                  <a href={product.tiktokshop_link} target="_blank" rel="noreferrer" className="text-xs text-slate-800 font-bold flex items-center gap-1 hover:underline mt-1">
                    <span className="material-symbols-outlined text-[14px]">local_mall</span> TikTok Shop
                  </a>
                )}
                <div className="flex gap-2 mt-auto pt-4 border-t border-outline-variant/10">
                  <button 
                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                    className="flex-1 py-2 bg-surface-container-highest text-primary font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-outline-variant transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, id: product.id, nama: product.nama })}
                    className="px-4 py-2 text-error hover:bg-error-container/30 transition-colors rounded-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {pagination.page < pagination.totalPages && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-md p-8 rounded-sm shadow-2xl flex flex-col items-center text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">Hapus Produk?</h3>
            <p className="text-on-surface-variant mb-8">
              Anda yakin ingin menghapus <strong>{deleteModal.nama}</strong>?<br/>Aksi ini permanen dan tidak dapat dibatalkan.
            </p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, id: null, nama: '' })}
                className="flex-1 py-4 bg-surface-container-highest text-on-surface font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-outline-variant transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-4 bg-error text-white font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-error/90 transition-colors cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Products;
