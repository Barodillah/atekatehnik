import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import {
  getPeriods,
  savePeriod,
  deletePeriod,
  getPeriodRecords,
  formatNumberComma,
  applyAttendanceToPeriod,
} from '../../../services/salaryStorage';
import PeriodModal from '../../../components/dashboard/salary/PeriodModal';

const Periods = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { confirmDialog } = useConfirm();

  const [periods, setPeriods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);

  const loadPeriods = () => {
    const list = getPeriods();
    setPeriods(list);
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const handleOpenAdd = () => {
    setEditingPeriod(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPeriod(p);
    setIsModalOpen(true);
  };

  const handleSave = (periodData, attendanceRows = []) => {
    try {
      const saved = savePeriod(periodData);
      if (attendanceRows && attendanceRows.length > 0) {
        applyAttendanceToPeriod(saved.id, attendanceRows);
      }
      setIsModalOpen(false);
      loadPeriods();
      if (!periodData.id) {
        addToast(
          attendanceRows && attendanceRows.length > 0
            ? `Periode berhasil dibuat & ${attendanceRows.length} data absen terimpor!`
            : 'Periode berhasil dibuat. Silakan periksa data absensi karyawan.',
          'success'
        );
        navigate(`/admin/salary/periods/${saved.id}`);
      } else {
        addToast('Data periode berhasil diperbarui', 'success');
      }
    } catch (e) {
      console.error(e);
      addToast('Gagal menyimpan periode', 'error');
    }
  };

  const handleDelete = async (p) => {
    const confirmed = await confirmDialog(
      `Apakah Anda yakin ingin menghapus "${p.period_name}"? Semua data absensi dan kalkulasi slip gaji pada periode ini juga akan dihapus.`,
      'Hapus Periode',
      'danger'
    );
    if (confirmed) {
      try {
        deletePeriod(p.id);
        addToast(`Periode ${p.period_name} berhasil dihapus`, 'success');
        loadPeriods();
      } catch (e) {
        console.error(e);
        addToast('Gagal menghapus periode', 'error');
      }
    }
  };

  const filteredPeriods = periods.filter((p) => {
    const matchName = (p.period_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchNotes = (p.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchName || matchNotes;
  });

  const getPeriodStats = (periodId) => {
    const records = getPeriodRecords(periodId);
    const count = records.length;
    const totalNet = records.reduce((acc, curr) => acc + (Number(curr.net_income) || 0), 0);
    return { count, totalNet };
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full max-w-full min-w-0 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-600 text-2xl">date_range</span>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-950 uppercase tracking-tight font-manrope">
              Periode Penggajian
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar periode gaji mingguan/bulanan, input absensi kerja, dan cetak slip gaji karyawan
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Tambah Periode</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama periode atau keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full max-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Periode</th>
                <th className="py-3 px-4">Rentang Tanggal</th>
                <th className="py-3 px-4 text-center">Hari Kerja</th>
                <th className="py-3 px-4 text-center">Karyawan</th>
                <th className="py-3 px-4 text-right">Total Pengeluaran Gaji</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPeriods.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 block">
                      event_busy
                    </span>
                    Belum ada periode penggajian. Klik "Tambah Periode" untuk membuat baru.
                  </td>
                </tr>
              ) : (
                filteredPeriods.map((p, idx) => {
                  const stats = getPeriodStats(p.id);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/admin/salary/periods/${p.id}`)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-4 text-center text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 tracking-wide">
                        <Link
                          to={`/admin/salary/periods/${p.id}`}
                          className="text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1.5"
                          title="Klik untuk lihat detail & input absen"
                        >
                          <span>{p.period_name}</span>
                          <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            arrow_forward
                          </span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {p.start_date || '-'} s/d {p.end_date || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {p.work_days} Hari
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                          {stats.count} Orang
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                        Rp {formatNumberComma(stats.totalNet)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'Published'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.status || 'Draft'}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-4 text-center cursor-default"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/admin/salary/periods/${p.id}`}
                            className="p-1.5 rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
                            title="Buka Settingan Gaji & Absen"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Periode"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Periode"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Period Modal */}
      <PeriodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        period={editingPeriod}
      />
    </div>
  );
};

export default Periods;
