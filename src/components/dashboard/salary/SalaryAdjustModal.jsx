import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatNumberComma, calculateSalaryRow } from '../../../services/salaryStorage';

const SalaryAdjustModal = ({ isOpen, onClose, onSave, record, workDays = 6 }) => {
  const [formData, setFormData] = useState({
    workshop_days: 0,
    business_trip_days: 0,
    leave_days: 0,
    rate_daily_salary: 150000,
    rate_trip_allowance: 250000,
    extra_income_notes: '',
    extra_income_amount: 0,
  });

  useEffect(() => {
    if (record) {
      setFormData({
        ...record,
        workshop_days: record.workshop_days !== undefined ? record.workshop_days : 0,
        business_trip_days: record.business_trip_days !== undefined ? record.business_trip_days : 0,
        leave_days: record.leave_days !== undefined ? record.leave_days : 0,
        rate_daily_salary: record.rate_daily_salary !== undefined ? record.rate_daily_salary : 150000,
        rate_trip_allowance: record.rate_trip_allowance !== undefined ? record.rate_trip_allowance : 250000,
        extra_income_notes: record.extra_income_notes || '',
        extra_income_amount: record.extra_income_amount || 0,
      });
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  // Helper: Format currency string with commas (150000 -> "150,000", "" -> "")
  const formatCurrencyDisplay = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    const num = Number(val);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
  };

  // Restrict keyboard input to numeric keys
  const handleNumericKeyDown = (e, allowDecimal = true) => {
    if (
      [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ].includes(e.key) ||
      ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'y', 'r'].includes(e.key.toLowerCase()))
    ) {
      return;
    }
    if (allowDecimal && (e.key === '.' || e.key === ',')) {
      if (!String(e.currentTarget.value).includes('.')) {
        return;
      }
    }
    if (/^[0-9]$/.test(e.key)) {
      return;
    }
    e.preventDefault();
  };

  // Handle day attendance change (workshop, trip, leave)
  const handleDayChange = (field, raw) => {
    let val = raw.replace(',', '.');
    val = val.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleDayBlur = (field) => {
    const current = formData[field];
    if (current === '' || current === '.' || current === undefined || current === null) {
      setFormData((prev) => ({ ...prev, [field]: 0 }));
    } else {
      const num = parseFloat(current);
      setFormData((prev) => ({ ...prev, [field]: isNaN(num) ? 0 : num }));
    }
  };

  // Handle currency amount change with comma thousand formatting
  const handleCurrencyChange = (field, raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits === '') {
      setFormData((prev) => ({ ...prev, [field]: '' }));
    } else {
      const normalizedDigits = digits.replace(/^0+(?=\d)/, '');
      const num = parseInt(normalizedDigits, 10);
      setFormData((prev) => ({ ...prev, [field]: isNaN(num) ? '' : num }));
    }
  };

  const handleCurrencyBlur = (field) => {
    if (formData[field] === '' || formData[field] === undefined || formData[field] === null) {
      setFormData((prev) => ({ ...prev, [field]: 0 }));
    }
  };

  const standardWorkDays = Number(workDays || record?.standard_work_days || 6);
  const liveWorkshopDays = parseFloat(formData.workshop_days) || 0;
  const liveTripDays = parseFloat(formData.business_trip_days) || 0;
  const liveLeaveDays = Math.max(
    0,
    Math.round((standardWorkDays - (liveWorkshopDays + liveTripDays)) * 100) / 100
  );

  // Realtime calculated values
  const liveCalc = calculateSalaryRow(
    {
      ...formData,
      leave_days: liveLeaveDays,
      standard_work_days: standardWorkDays,
    },
    standardWorkDays
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanRecord = {
      ...formData,
      workshop_days: parseFloat(formData.workshop_days) || 0,
      business_trip_days: parseFloat(formData.business_trip_days) || 0,
      leave_days: liveLeaveDays,
      standard_work_days: standardWorkDays,
      rate_daily_salary: parseInt(String(formData.rate_daily_salary).replace(/\D/g, ''), 10) || 0,
      rate_trip_allowance: parseInt(String(formData.rate_trip_allowance).replace(/\D/g, ''), 10) || 0,
      extra_income_amount: parseInt(String(formData.extra_income_amount).replace(/\D/g, ''), 10) || 0,
    };
    onSave(calculateSalaryRow(cleanRecord, standardWorkDays));
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center border border-orange-200">
              <span className="material-symbols-outlined text-xl">tune</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Adjust Kehadiran &amp; Gaji
              </h2>
              <p className="text-xs text-orange-600 font-bold uppercase">
                {record.name} - {record.department}
              </p>
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

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-left">
          {/* Scrollable Body Content */}
          <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {/* Kehadiran & Hari Kerja */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-orange-600 text-base">today</span>
                Rincian Kehadiran (Hari)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Hadir Bengkel (hari)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.workshop_days ?? ''}
                    onKeyDown={(e) => handleNumericKeyDown(e, true)}
                    onChange={(e) => handleDayChange('workshop_days', e.target.value)}
                    onBlur={() => handleDayBlur('workshop_days')}
                    placeholder="0"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">Perjalanan Bisnis (hari)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.business_trip_days ?? ''}
                    onKeyDown={(e) => handleNumericKeyDown(e, true)}
                    onChange={(e) => handleDayChange('business_trip_days', e.target.value)}
                    onBlur={() => handleDayBlur('business_trip_days')}
                    placeholder="0"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1 flex items-center justify-between">
                    <span>Cuti (hari)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Otomatis</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    value={liveLeaveDays}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 font-mono select-none cursor-not-allowed"
                    title={`Otomatis: Standar (${standardWorkDays} hari) - (${liveTripDays} + ${liveWorkshopDays})`}
                  />
                </div>
              </div>
            </div>

            {/* Tarif Gaji & Tunjangan */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-orange-600 text-base">price_change</span>
                Tarif Dasar / Hari
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Tarif Gaji Pokok (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 select-none">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatCurrencyDisplay(formData.rate_daily_salary)}
                      onKeyDown={(e) => handleNumericKeyDown(e, false)}
                      onChange={(e) => handleCurrencyChange('rate_daily_salary', e.target.value)}
                      onBlur={() => handleCurrencyBlur('rate_daily_salary')}
                      placeholder="0"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">Tarif Tunjangan Perjalanan (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 select-none">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatCurrencyDisplay(formData.rate_trip_allowance)}
                      onKeyDown={(e) => handleNumericKeyDown(e, false)}
                      onChange={(e) => handleCurrencyChange('rate_trip_allowance', e.target.value)}
                      onBlur={() => handleCurrencyBlur('rate_trip_allowance')}
                      placeholder="0"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Penghasilan Tambahan */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-orange-600 text-base">add_circle</span>
                Penghasilan Tambahan (Bisa diadjust)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Catatan Tambahan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bonus Lembur"
                    value={formData.extra_income_notes}
                    onChange={(e) => setFormData({ ...formData, extra_income_notes: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-orange-500 uppercase font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-600 mb-1">Nominal Tambahan (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-emerald-600/70 select-none">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatCurrencyDisplay(formData.extra_income_amount)}
                      onKeyDown={(e) => handleNumericKeyDown(e, false)}
                      onChange={(e) => handleCurrencyChange('extra_income_amount', e.target.value)}
                      onBlur={() => handleCurrencyBlur('extra_income_amount')}
                      placeholder="0"
                      className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm font-bold text-emerald-700 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Kalkulasi Otomatis (Real-time Preview)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-white p-2 rounded border border-blue-200">
                  <span className="text-slate-500 block text-[10px]">Gaji Pokok:</span>
                  <span className="text-slate-900 font-bold">Rp {formatNumberComma(liveCalc.base_salary)}</span>
                </div>
                <div className="bg-white p-2 rounded border border-blue-200">
                  <span className="text-slate-500 block text-[10px]">Tunjangan:</span>
                  <span className="text-slate-900 font-bold">Rp {formatNumberComma(liveCalc.trip_allowance_total)}</span>
                </div>
                <div className="bg-white p-2 rounded border border-blue-200">
                  <span className="text-slate-500 block text-[10px]">Subtotal:</span>
                  <span className="text-slate-900 font-bold">Rp {formatNumberComma(liveCalc.salary_subtotal)}</span>
                </div>
                <div className="bg-orange-50 p-2 rounded border border-orange-200">
                  <span className="text-orange-700 block text-[10px] font-bold">Bersih:</span>
                  <span className="text-orange-600 font-black text-sm">
                    Rp {formatNumberComma(liveCalc.net_income)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions - Sticky Footer */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
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
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Terapkan Penyesuaian</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default SalaryAdjustModal;
