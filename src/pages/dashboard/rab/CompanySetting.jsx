import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CompanySetting = () => {
  const [formData, setFormData] = useState({
    company_name: 'CV. ATEKA TEHNIK',
    tagline: 'RICE MILLING UNIT SOLUTION',
    services: 'ELEVATOR, HULLER, POLISHER, DRYER, HAMMERMILL, SERVICE, SPAREPART',
    address: 'Jl. Raya Madiun - Ngawi Km 12',
    phone: '0812-3456-7890',
    email: 'admin@atekatehnik.com',
    signatory_name: 'WARSITO',
    signatory_title: 'Pimpinan',
    logo_url: '',
    signature_image_url: '',
    stamp_image_url: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('ateka_token');
      const response = await fetch('/api/company_profile.php', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success && result.data) {
        setFormData({
          company_name: result.data.company_name || '',
          tagline: result.data.tagline || '',
          services: result.data.services || '',
          address: result.data.address || '',
          phone: result.data.phone || '',
          email: result.data.email || '',
          signatory_name: result.data.signatory_name || '',
          signatory_title: result.data.signatory_title || '',
          logo_url: result.data.logo_url || '',
          signature_image_url: result.data.signature_image_url || '',
          stamp_image_url: result.data.stamp_image_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('ateka_token');
      const response = await fetch('/api/company_profile.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      
      if (result.success) {
        setMessage('Pengaturan Profil Perusahaan berhasil disimpan!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || result.message || 'Gagal menyimpan.');
      }
    } catch (error) {
      console.error('Error saving company profile:', error);
      setMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-slate-500 font-bold">Memuat Data...</div>;
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/rab" className="p-2 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-blue-950 font-manrope">Company Setting</h1>
          <p className="text-slate-500 text-sm">Pengaturan Kop Surat, Info Kontak & Legalitas Penandatangan.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Informasi Dasar */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-900">business</span>
            <h2 className="font-bold text-blue-900">Informasi Dasar</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Perusahaan</label>
              <input 
                type="text" name="company_name" value={formData.company_name} onChange={handleChange}
                className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Slogan (Tagline)</label>
              <input 
                type="text" name="tagline" value={formData.tagline} onChange={handleChange}
                className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Layanan / Produk Utama (Services)</label>
              <input 
                type="text" name="services" value={formData.services} onChange={handleChange}
                placeholder="Misal: ELEVATOR, HULLER, POLISHER..."
                className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Lengkap</label>
              <textarea 
                name="address" value={formData.address} onChange={handleChange} rows="3"
                className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">No. HP / Telp</label>
                <input 
                  type="text" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Card 2: Pengesahan & Penandatangan */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-900">draw</span>
              <h2 className="font-bold text-blue-900">Pengesahan (Halaman 2)</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Penandatangan</label>
                  <input 
                    type="text" name="signatory_name" value={formData.signatory_name} onChange={handleChange}
                    className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Jabatan</label>
                  <input 
                    type="text" name="signatory_title" value={formData.signatory_title} onChange={handleChange}
                    className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Aset Gambar (Optional for now) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-900">image</span>
              <h2 className="font-bold text-blue-900">Aset Visual (Logo, TTD, Stempel)</h2>
            </div>
            <div className="p-5 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">URL Logo Perusahaan</label>
                  <input 
                    type="text" name="logo_url" value={formData.logo_url} onChange={handleChange}
                    placeholder="https://..."
                    className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">URL Tanda Tangan</label>
                  <input 
                    type="text" name="signature_image_url" value={formData.signature_image_url} onChange={handleChange}
                    placeholder="https://..."
                    className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">URL Stempel</label>
                  <input 
                    type="text" name="stamp_image_url" value={formData.stamp_image_url} onChange={handleChange}
                    placeholder="https://..."
                    className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-slate-200 shadow p-4 z-40 flex justify-between items-center">
          <Link to="/admin/rab" className="text-slate-500 hover:text-slate-800 font-bold text-sm px-4 py-2 transition-colors">
            Kembali
          </Link>
          <div className="flex items-center gap-4">
            {message && (
              <span className={`text-sm font-bold ${message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </span>
            )}
            <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">{isSaving ? 'sync' : 'save'}</span>
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanySetting;
