import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

/**
 * Reusable "Koleksi Gambar" modal.
 * Loads images from /api/collection_images.php and calls onSelect(url).
 */
const ImageCollectionModal = ({ isOpen, onClose, onSelect, excludeSources = [] }) => {
  const { authFetch } = useAuth();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('Semua');

  useEffect(() => {
    if (!isOpen) return;
    setSearch('');
    if (images.length > 0) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await authFetch('/api/collection_images.php');
        const data = await res.json();
        if (data.success) setImages(data.images || []);
      } catch (err) {
        console.error('Failed to fetch collection images:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isOpen, images.length, authFetch]);

  if (!isOpen) return null;

  const q = search.trim().toLowerCase();
  const available = images.filter((img) => !excludeSources.includes(img.source));
  const uniqueSources = ['Semua', ...new Set(available.map(img => img.source))];

  const filtered = available.filter((img) => {
    if (selectedSource !== 'Semua' && img.source !== selectedSource) return false;
    return (img.name || '').toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">collections_bookmark</span>
            Koleksi Gambar
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-red-500">
            <span className="material-symbols-outlined block">close</span>
          </button>
        </div>
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              id="image-collection-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama gambar..."
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {uniqueSources.map(src => (
              <button
                key={src}
                type="button"
                onClick={() => setSelectedSource(src)}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                  selectedSource === src 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto bg-slate-100">
          {isLoading ? (
            <div className="text-center py-20 text-slate-500">
              <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
              <p>Memuat koleksi gambar...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => { onSelect(img.url); onClose(); }}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group flex flex-col"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img src={img.url} alt={img.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute top-2 left-2 text-[10px] font-semibold bg-white/90 text-slate-600 px-2 py-0.5 rounded-full">{img.source}</span>
                    <div className="absolute inset-0 bg-blue-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-bold text-sm bg-blue-600 px-3 py-1 rounded-full">Pilih</span>
                    </div>
                  </div>
                  <p className="px-2 py-1.5 text-xs font-medium text-slate-700 truncate" title={img.name}>{img.name}</p>
                </div>
              ))}
            </div>
          ) : available.length > 0 ? (
            <div className="text-center py-20 text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-30">search_off</span>
              <p>Tidak ada gambar yang cocok dengan "{search}".</p>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-30">image_not_supported</span>
              <p>Belum ada gambar dalam koleksi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCollectionModal;
