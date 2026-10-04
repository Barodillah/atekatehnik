import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';

const RabList = () => {
  const { authFetch } = useAuth();
  const { addToast } = useToast();
  const { confirmDialog } = useConfirm();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/quotations.php?is_template=0');
      const data = await res.json();
      if (data.success) {
        setQuotations(data.quotations);
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [authFetch]);

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog('Yakin ingin menghapus RAB ini?', 'Hapus RAB', 'danger');
    if (confirmed) {
      try {
        const res = await authFetch(`/api/quotations.php?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) {
          addToast('RAB berhasil dihapus', 'success');
          fetchQuotations();
        } else {
          addToast(data.message || 'Gagal menghapus RAB', 'error');
        }
      } catch(error) {
        console.error(error);
        addToast('Terjadi kesalahan', 'error');
      }
    }
  };

  const filteredQuotas = quotations.filter(q => {
    const titleMatch = q.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const numberMatch = q.quotation_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const leadMatch = q.lead_name?.toLowerCase().includes(searchTerm.toLowerCase()) || q.lead_company?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || numberMatch || leadMatch;
  });

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'draft': return <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Draft</span>;
      case 'sent': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Sent</span>;
      case 'accepted': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Accepted</span>;
      default: return <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs">{status}</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-950 font-manrope">RAB Maker</h1>
          <p className="text-slate-500 text-sm">Kelola dan buat Rencana Anggaran Biaya (Penawaran) untuk klien Anda.</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/admin/rab/company" 
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined">domain</span>
            Comp. Setting
          </Link>
          <Link 
            to="/admin/rab/catalog" 
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined">inventory</span>
            Catalog Setting
          </Link>
          <Link 
            to="/admin/rab/create" 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Buat RAB Baru
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Cari Nomor RAB, Judul, atau Klien..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">No. RAB & Judul</th>
                <th className="p-4 font-bold">Klien</th>
                <th className="p-4 font-bold">Tanggal</th>
                <th className="p-4 font-bold">Grand Total</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotas.map((q) => (
                <tr 
                  key={q.id} 
                  onClick={() => navigate(`/admin/rab/edit/${q.id}`)}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                    <div className="font-bold text-blue-900">{q.quotation_number}</div>
                    <div className="text-sm text-slate-500">{q.title}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{q.lead_name || '-'}</div>
                    <div className="text-xs text-slate-500">{q.lead_company || '-'}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <div>{q.quotation_date ? new Date(q.quotation_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'}) : '-'}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-700">
                    {formatRupiah(q.grand_total)}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(q.status)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/admin/rab/preview/${q.id}`} onClick={(e) => e.stopPropagation()} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Preview Print">
                        <span className="material-symbols-outlined text-xl">print</span>
                      </Link>
                      <Link to={`/admin/rab/edit/${q.id}`} onClick={(e) => e.stopPropagation()} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded" title="Edit">
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </Link>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Hapus">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredQuotas.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    Tidak ada data RAB yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RabList;
