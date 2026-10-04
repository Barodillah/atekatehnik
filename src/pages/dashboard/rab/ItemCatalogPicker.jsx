import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

const ItemCatalogPicker = ({ isOpen, onClose, onSelectItem }) => {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchItems = async () => {
        setIsLoading(true);
        try {
          const res = await authFetch('/api/items.php?limit=1000');
          const data = await res.json();
          if (data.success) {
            setItems(data.items);
          }
        } catch (error) {
          console.error("Failed to fetch catalog items:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchItems();
    }
  }, [isOpen, authFetch]);

  if (!isOpen) return null;

  const categories = ['all', 'machine', 'cleaner', 'destoner', 'elevator', 'polisher', 'motor', 'panel', 'accessories', 'service'];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat && item.is_active == 1;
  });

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-blue-950 flex items-center gap-2">
            <span className="material-symbols-outlined">inventory_2</span>
            Katalog Master Produk
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col gap-4">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input 
              type="text" 
              placeholder="Cari nama barang atau SKU..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-2 w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full capitalize whitespace-nowrap transition-colors ${
                  categoryFilter === cat ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                  <div className="h-32 bg-slate-100 relative">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm text-slate-700">
                      {item.sku}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.specifications}</p>
                    <div className="mt-auto">
                      <div className="font-bold text-blue-700">{formatRupiah(item.default_price)} <span className="text-xs text-slate-400 font-normal">/{item.default_unit}</span></div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="w-full bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      Pilih Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory</span>
              <p>Tidak ada item yang sesuai pencarian.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCatalogPicker;
