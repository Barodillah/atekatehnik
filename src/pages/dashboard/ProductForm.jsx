import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { authFetch } = useAuth();

  const [formData, setFormData] = useState({
    nama: '',
    gambar: '',
    kategori: 'Paket',
    shopeeLink: '',
    description: '',
  });

  const [spesifikasi, setSpesifikasi] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await authFetch(`/api/products.php?id=${id}`);
          const data = await res.json();
          if (data.success && data.product) {
            setFormData({
              nama: data.product.nama,
              gambar: data.product.gambar || '',
              kategori: data.product.kategori || 'Paket',
              shopeeLink: data.product.shopee_link || '',
              description: data.product.description || '',
            });
            if (data.product.spesifikasi && data.product.spesifikasi.length > 0) {
              setSpesifikasi(data.product.spesifikasi);
            }
          }
        } catch (err) {
          setSubmitError('Gagal memuat data produk.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, authFetch, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index, value) => {
    const newSpecs = [...spesifikasi];
    newSpecs[index] = value;
    setSpesifikasi(newSpecs);
  };

  const addSpec = () => {
    setSpesifikasi([...spesifikasi, '']);
  };

  const removeSpec = (index) => {
    const newSpecs = [...spesifikasi];
    newSpecs.splice(index, 1);
    if (newSpecs.length === 0) newSpecs.push('');
    setSpesifikasi(newSpecs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const finalSpecs = spesifikasi.filter(s => s.trim() !== '');
    
    const finalData = {
      ...formData,
      spesifikasi: finalSpecs
    };

    try {
      const res = await authFetch(isEdit ? `/api/products.php?id=${id}` : '/api/products.php', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(finalData),
      });
      const data = await res.json();

      if (data.success) {
        navigate('/admin/products');
      } else {
        setSubmitError(data.error || 'Gagal menyimpan produk.');
      }
    } catch (err) {
      setSubmitError('Koneksi ke server gagal: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 w-full font-body">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/products')}
          className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">{isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
          <p className="text-on-surface-variant mt-1 text-sm">{isEdit ? 'Ubah detail produk, gambar, dan spesifikasi.' : 'Masukkan detail produk, gambar, dan spesifikasi teknis.'}</p>
        </div>
      </div>

      {/* Error Banner */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-red-700 text-sm font-medium">{submitError}</p>
          <button onClick={() => setSubmitError('')} className="ml-auto text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-sm border border-surface-container-low">
          <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
          <p className="text-sm text-on-surface-variant mt-3">Memuat data produk...</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest shadow-sm rounded-sm overflow-hidden border border-surface-container-low">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* General Information */}
          <div>
            <h3 className="text-sm font-label font-bold text-primary-container uppercase tracking-[0.2em] mb-6 border-b border-surface-container-low pb-2">Informasi Umum</h3>
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Nama Produk *</label>
                <input 
                  required 
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm font-semibold" 
                  placeholder="Contoh: PAKET 1-2 TON/JAM SIAP KONSUMSI" 
                  type="text" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Kategori *</label>
                  <select 
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none appearance-none text-sm font-semibold cursor-pointer"
                  >
                    <option value="Paket">Paket Lengkap</option>
                    <option value="Suku Cadang">Suku Cadang</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2 flex items-center gap-2">
                    URL Gambar Referensi
                    <span className="material-symbols-outlined text-[14px] text-orange-400">image</span>
                  </label>
                  <input 
                    name="gambar"
                    value={formData.gambar}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" 
                    placeholder="https://atekateknik.com/wp-content/uploads/..." 
                    type="url" 
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2 flex items-center gap-2">
                  Tautan E-Commerce (Shopee) <span className="text-outline-variant lowercase tracking-normal">(Opsional)</span>
                  <span className="material-symbols-outlined text-[14px] text-orange-400">shopping_bag</span>
                </label>
                <input 
                  name="shopeeLink"
                  value={formData.shopeeLink}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" 
                  placeholder="https://shopee.co.id/..." 
                  type="url" 
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Deskripsi Produk (Opsional)</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm leading-relaxed" 
                  placeholder="Tuliskan deskripsi lengkap atau keterangan tambahan mengenai produk ini..."
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div>
            <div className="flex items-center justify-between border-b border-surface-container-low pb-2 mb-6">
              <h3 className="text-sm font-label font-bold text-primary-container uppercase tracking-[0.2em]">Spesifikasi Teknis</h3>
              <button 
                type="button" 
                onClick={addSpec}
                className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                Tambah Baris
              </button>
            </div>
            
            <div className="space-y-3">
              {spesifikasi.map((spec, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-surface-container flex items-center justify-center rounded-sm text-xs font-bold text-outline shrink-0">
                    {index + 1}
                  </div>
                  <input 
                    value={spec}
                    onChange={(e) => handleSpecChange(index, e.target.value)}
                    className="flex-1 bg-surface-container-low border-none rounded-sm focus:ring-2 focus:ring-secondary/50 transition-colors py-2 px-4 outline-none text-sm" 
                    placeholder="Contoh: Elevator 3unit 5/6in" 
                    type="text" 
                  />
                  <button 
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="w-10 h-10 text-slate-400 hover:text-error hover:bg-error-container/20 transition-all rounded-sm flex items-center justify-center shrink-0"
                    title="Hapus Spesifikasi"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-8 border-t border-surface-container-low">
            <button 
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-8 py-3 text-sm font-bold uppercase tracking-widest text-outline hover:bg-surface-container-low transition-colors rounded-sm cursor-pointer"
            >
              Batalkan
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary-container text-white font-bold text-sm uppercase tracking-widest rounded-sm shadow-md hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Simpan Produk
                </>
              )}
            </button>
          </div>

        </form>
      </div>
      )}
    </div>
  );
};

export default ProductForm;
