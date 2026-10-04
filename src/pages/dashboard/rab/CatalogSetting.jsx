import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import ImageCollectionModal from './ImageCollectionModal';

const CatalogSetting = () => {
  const { authFetch } = useAuth();
  const { addToast } = useToast();
  const { confirmDialog } = useConfirm();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const initialFormState = {
    sku: '', name: '', category: 'machine', default_unit: 'Unit', default_price: 0,
    specifications: '', description: '', image_url: '', is_active: true
  };
  const [formData, setFormData] = useState(initialFormState);

  const [isAiLoading, setIsAiLoading] = useState(false);

  const generateDescriptionWithAi = async () => {
    if (!formData.name) {
      addToast("Silakan isi 'Nama Item' terlebih dahulu", "error");
      return;
    }
    
    setIsAiLoading(true);
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      const model = import.meta.env.VITE_OPENROUTER_MODEL || 'google/gemini-2.5-flash-lite';
      
      const prompt = `Anda adalah asisten ahli mesin pertanian, khususnya pada sistem pabrik penggilingan padi (Rice Milling Unit).
Buatkan tepat 1 kalimat pendek deskripsi fungsi yang menarik, profesional, dan ringkas untuk dimasukkan ke dalam dokumen penawaran teknis. 

Nama Alat/Mesin: ${formData.name}
Spesifikasi: ${formData.specifications || 'Tidak ada spesifikasi khusus'}

PENTING:
- Konteksnya adalah mesin/alat untuk pengolahan padi atau kelengkapannya.
- Output HANYA 1 KALIMAT saja.
- DILARANG menggunakan tanda kutip.
- DILARANG menggunakan format bullet atau list.
- Fokus langsung pada fungsi utamanya atau efisiensi/keuntungan bagi operasional pabrik.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        let result = data.choices[0].message.content.trim();
        // Remove trailing or leading quotes just in case the AI added them
        result = result.replace(/^["']|["']$/g, '');
        
        setFormData(prev => ({ ...prev, description: result }));
        addToast("Deskripsi berhasil digenerate oleh AI", "success");
      } else {
        throw new Error("Gagal mengambil respon dari AI");
      }
    } catch (error) {
      console.error("AI Error:", error);
      addToast("Terjadi kesalahan saat menghubungi AI", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);
    
    try {
      const res = await authFetch('/api/upload_item_image.php', {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image_url: data.url }));
        addToast('Gambar berhasil diupload', 'success');
      } else {
        addToast(data.message || 'Gagal mengupload gambar', 'error');
      }
    } catch (error) {
      console.error("Upload error:", error);
      addToast('Terjadi kesalahan saat mengupload gambar', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const categories = ['machine', 'cleaner', 'destoner', 'elevator', 'polisher', 'motor', 'panel', 'accessories', 'service'];

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/items.php?limit=1000');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [authFetch]);

  const generateSKU = (category, currentItems) => {
    const prefixMap = {
      'machine': 'MAC', 'cleaner': 'CLN', 'destoner': 'DST',
      'elevator': 'ELV', 'polisher': 'PLS', 'motor': 'MTR',
      'panel': 'PNL', 'accessories': 'ACC', 'service': 'SRV'
    };
    
    const prefix = prefixMap[category] || 'ITM';
    
    const relatedItems = currentItems.filter(item => item.sku && item.sku.startsWith(`${prefix}-`));
    
    let maxNum = 0;
    relatedItems.forEach(item => {
      const parts = item.sku.split('-');
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    
    const nextNum = maxNum + 1;
    return `${prefix}-${nextNum.toString().padStart(3, '0')}`;
  };

  const openAddModal = () => {
    setEditingItem(null);
    const defaultCat = 'machine';
    setFormData({
      ...initialFormState,
      category: defaultCat,
      sku: generateSKU(defaultCat, items)
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      is_active: item.is_active == 1
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog('Yakin ingin menghapus item ini dari katalog?', 'Hapus Item', 'danger');
    if (confirmed) {
      try {
        const res = await authFetch(`/api/items.php?id=${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
          addToast('Item berhasil dihapus', 'success');
          fetchItems();
        } else {
          addToast(data.message || 'Gagal menghapus item', 'error');
        }
      } catch (error) {
        console.error("Failed to delete item:", error);
        addToast('Terjadi kesalahan', 'error');
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      let finalValue = type === 'checkbox' ? checked : value;
      
      if (name === 'default_price') {
        const rawValue = typeof value === 'string' ? value.replace(/\D/g, '') : value;
        finalValue = rawValue ? parseInt(rawValue, 10) : 0;
      }

      const newFormData = {
        ...prev,
        [name]: finalValue
      };
      
      if (name === 'category') {
        const prefixMap = {
          'machine': 'MAC', 'cleaner': 'CLN', 'destoner': 'DST',
          'elevator': 'ELV', 'polisher': 'PLS', 'motor': 'MTR',
          'panel': 'PNL', 'accessories': 'ACC', 'service': 'SRV'
        };
        const expectedPrefix = prefixMap[value] || 'ITM';
        
        if (editingItem && value === editingItem.category && editingItem.sku && editingItem.sku.startsWith(expectedPrefix)) {
          newFormData.sku = editingItem.sku;
        } else {
          newFormData.sku = generateSKU(value, items);
        }
      }
      
      return newFormData;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/items.php?id=${editingItem.id}` : '/api/items.php';
      
      const res = await authFetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          is_active: formData.is_active ? 1 : 0
        })
      });
      
      const data = await res.json();
      if (data.success) {
        addToast(editingItem ? 'Item berhasil diupdate' : 'Item berhasil ditambahkan', 'success');
        setIsModalOpen(false);
        fetchItems();
      } else {
        addToast(data.message || 'Error saving item', 'error');
      }
    } catch (error) {
      console.error("Error saving item:", error);
      addToast('Terjadi kesalahan', 'error');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/rab" className="p-2 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-blue-950 font-manrope">Catalog Setting</h1>
          <p className="text-slate-500 text-sm">Kelola template Master Produk & Item Komponen.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative max-w-sm w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Cari SKU atau Nama Barang..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-sm">add</span> Tambah Item Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold w-20 text-center">Gambar</th>
                <th className="p-4 font-bold w-28">SKU</th>
                <th className="p-4 font-bold">Nama Item & Kategori</th>
                <th className="p-4 font-bold text-right">Harga Dasar</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded bg-slate-200 border border-slate-300 overflow-hidden mx-auto">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 w-full h-full flex items-center justify-center">image</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm font-bold text-slate-600">{item.sku}</td>
                  <td className="p-4">
                    <div className="font-bold text-blue-900 text-sm mb-1">{item.name}</div>
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{item.category}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-bold text-slate-800">{formatRupiah(item.default_price)}</div>
                    <div className="text-xs text-slate-500">per {item.default_unit}</div>
                  </td>
                  <td className="p-4 text-center">
                    {item.is_active ? (
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-300">cancel</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    Tidak ada data master item ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-blue-900 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined">{editingItem ? 'edit_square' : 'add_box'}</span>
                {editingItem ? 'Edit Item Katalog' : 'Tambah Item Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">SKU Produk (Auto-Generated)</label>
                  <div className="w-full text-sm font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg py-2 px-3 flex items-center justify-between">
                    <span>{formData.sku || 'Menunggu kategori...'}</span>
                    <span className="material-symbols-outlined text-blue-400 text-sm">lock</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Kategori</label>
                  <select name="category" value={formData.category} onChange={handleFormChange} className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 capitalize">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nama Item</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 font-bold text-blue-900" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Harga Dasar (Rp)</label>
                  <input type="text" name="default_price" value={new Intl.NumberFormat('id-ID').format(formData.default_price || 0)} onChange={handleFormChange} required className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500 text-right font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Satuan Default</label>
                  <input type="text" name="default_unit" value={formData.default_unit} onChange={handleFormChange} required placeholder="Unit / Pcs / Set" className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Spesifikasi Singkat</label>
                <textarea name="specifications" value={formData.specifications} onChange={handleFormChange} rows="2" className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500" placeholder="Kapasitas, daya dinamo, bahan plat..."></textarea>
              </div>

              <div>
                <label className="flex justify-between items-end mb-1">
                  <span className="block text-xs font-bold text-slate-600">Deskripsi Fungsi (Untuk Print Hal 1)</span>
                  <button 
                    type="button" 
                    onClick={generateDescriptionWithAi}
                    disabled={isAiLoading || !formData.name}
                    className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate Deskripsi dengan AI berdasarkan Nama dan Spesifikasi"
                  >
                    {isAiLoading ? (
                      <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Generating...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[14px]">auto_awesome</span> Generate AI</>
                    )}
                  </button>
                </label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} rows="3" className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500" placeholder="Jelaskan fungsi komponen secara menarik..."></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Gambar Produk (Pilih Salah Satu Cara)</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    {/* Option 1: Drag & Drop Upload */}
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer relative ${
                        isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden" 
                        accept="image/jpeg, image/png, image/webp, image/gif" 
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center text-blue-600">
                          <span className="material-symbols-outlined animate-spin mb-1">sync</span>
                          <span className="text-xs font-bold">Mengupload...</span>
                        </div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">cloud_upload</span>
                          <p className="text-sm font-bold text-slate-700">Klik / Drag & Drop</p>
                          <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP max 2MB</p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-px bg-slate-200 flex-1"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">ATAU</span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    {/* Option 2: Text Input for Link */}
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Tempel Link Biasa</label>
                      <input 
                        type="text" 
                        name="image_url" 
                        value={formData.image_url} 
                        onChange={handleFormChange} 
                        placeholder="https://..." 
                        className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500" 
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-px bg-slate-200 flex-1"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">ATAU</span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    {/* Option 3: Select from collection */}
                    <button
                      type="button"
                      onClick={() => setIsCollectionOpen(true)}
                      className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">collections_bookmark</span>
                      Pilih dari Koleksi
                    </button>
                  </div>
                  
                  {/* Image Preview */}
                  <div className="border border-slate-200 rounded-lg bg-slate-100 flex flex-col items-center justify-center p-2 min-h-[160px] overflow-hidden relative group">
                    {formData.image_url ? (
                      <>
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="max-h-40 w-auto object-contain rounded"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = 'https://placehold.co/400x300/e2e8f0/475569?text=Gagal+Memuat+Gambar';
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({...prev, image_url: ''}))}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                          title="Hapus Gambar"
                        >
                          <span className="material-symbols-outlined text-[16px] block">delete</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-slate-400 flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl mb-1 opacity-40">image</span>
                        <span className="text-xs font-medium">Pratinjau Gambar</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleFormChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer">Item Aktif (Tampil di Katalog Picker)</label>
              </div>
              
            </form>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">Batal</button>
              <button onClick={handleFormSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors">Simpan Item</button>
            </div>
          </div>
        </div>
      )}

      <ImageCollectionModal
        isOpen={isCollectionOpen}
        onClose={() => setIsCollectionOpen(false)}
        onSelect={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
      />

    </div>
  );
};

export default CatalogSetting;
