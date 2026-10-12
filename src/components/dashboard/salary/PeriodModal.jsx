import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Indonesian month names for auto-generating period title
const MONTH_NAMES = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER',
];

// Helper to calculate week of month
const getWeekOfMonth = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  return Math.ceil(day / 7);
};

const PeriodModal = ({ isOpen, onClose, onSave, period = null }) => {
  const [formData, setFormData] = useState({
    period_name: '',
    start_date: '',
    end_date: '',
    work_days: 6,
    status: 'Draft',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (period) {
      setFormData({
        id: period.id,
        period_name: period.period_name || '',
        start_date: period.start_date || '',
        end_date: period.end_date || '',
        work_days: period.work_days !== undefined ? period.work_days : 6,
        status: period.status || 'Draft',
        notes: period.notes || '',
      });
    } else {
      // Default to current week
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const monthStr = MONTH_NAMES[currentMonth];
      const weekNum = getWeekOfMonth(now);

      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      setFormData({
        period_name: `${monthStr} ${currentYear} - Minggu ke ${weekNum}`,
        start_date: todayStr,
        end_date: todayStr,
        work_days: 6,
        status: 'Draft',
        notes: '',
      });
    }
    setErrors({});
  }, [period, isOpen]);

  if (!isOpen) return null;

  // Auto-generate name when start_date changes (if adding new)
  const handleStartDateChange = (val) => {
    const updated = { ...formData, start_date: val };
    if (!period && val) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const month = MONTH_NAMES[d.getMonth()];
        const year = d.getFullYear();
        const week = getWeekOfMonth(d);
        updated.period_name = `${month} ${year} - Minggu ke ${week}`;
      }
    }
    setFormData(updated);
  };

  const validate = () => {
    const err = {};
    if (!formData.period_name.trim()) err.period_name = 'Nama periode wajib diisi';
    if (!formData.start_date) err.start_date = 'Tanggal mulai wajib dipilih';
    if (!formData.end_date) err.end_date = 'Tanggal selesai wajib dipilih';
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      err.end_date = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
    }
    if (formData.work_days === '' || Number(formData.work_days) <= 0) {
      err.work_days = 'Jumlah hari kerja minimal 1 hari';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...formData,
      period_name: formData.period_name.trim().toUpperCase(),
      work_days: Number(formData.work_days),
      notes: formData.notes.trim(),
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center border border-orange-200">
              <span className="material-symbols-outlined text-xl">date_range</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                {period ? 'Edit Periode Penggajian' : 'Buat Periode Baru'}
              </h2>
              <p className="text-xs text-slate-500">Atur rentang tanggal, minggu, dan hari kerja</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-left">
          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dari Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={`w-full bg-white border ${errors.start_date ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500 transition-all`}
              />
              {errors.start_date && <p className="text-red-500 text-[11px] mt-1">{errors.start_date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sampai Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={`w-full bg-white border ${errors.end_date ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500 transition-all`}
              />
              {errors.end_date && <p className="text-red-500 text-[11px] mt-1">{errors.end_date}</p>}
            </div>
          </div>

          {/* Nama / Label Periode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Label Periode (Bulan &amp; Minggu) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: OKTOBER 2026 - Minggu ke 2"
              value={formData.period_name}
              onChange={(e) => setFormData({ ...formData, period_name: e.target.value })}
              className={`w-full bg-white border ${errors.period_name ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all uppercase font-medium`}
            />
            {errors.period_name && <p className="text-red-500 text-[11px] mt-1">{errors.period_name}</p>}
            <p className="text-[11px] text-slate-500 mt-1">
              Format ini yang akan tercetak pada Slip Gaji Karyawan
            </p>
          </div>

          {/* Jumlah Hari Kerja & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Hari Kerja <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="31"
                  value={formData.work_days}
                  onChange={(e) => setFormData({ ...formData, work_days: e.target.value })}
                  className={`w-full bg-white border ${errors.work_days ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500 transition-all font-mono font-medium`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 pointer-events-none">
                  Hari
                </span>
              </div>
              {errors.work_days && <p className="text-red-500 text-[11px] mt-1">{errors.work_days}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Periode</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500 transition-all cursor-pointer font-medium"
              >
                <option value="Draft">Draft (Dalam Penyusunan)</option>
                <option value="Published">Published (Disetujui)</option>
                <option value="Paid">Paid (Sudah Dicairkan)</option>
              </select>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              rows="2"
              placeholder="Catatan mengenai lembur, pergantian shift, atau memo mingguan..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all resize-none"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                {period ? 'save' : 'arrow_forward'}
              </span>
              <span>{period ? 'Simpan Perubahan' : 'Lanjut Isi Data Absen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PeriodModal;
