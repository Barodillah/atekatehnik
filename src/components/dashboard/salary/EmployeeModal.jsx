import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DEPARTMENTS, formatNumberComma } from '../../../services/salaryStorage';

const EmployeeModal = ({ isOpen, onClose, onSave, employee = null }) => {
  const [formData, setFormData] = useState({
    id_absen: '',
    name: '',
    department: 'PRODUKSI',
    daily_salary: 150000,
    trip_allowance: 250000,
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        id: employee.id,
        id_absen: employee.id_absen || '',
        name: employee.name || '',
        department: employee.department || 'PRODUKSI',
        daily_salary: employee.daily_salary !== undefined ? employee.daily_salary : 150000,
        trip_allowance: employee.trip_allowance !== undefined ? employee.trip_allowance : 250000,
        is_active: employee.is_active !== undefined ? employee.is_active : true,
      });
    } else {
      setFormData({
        id_absen: '',
        name: '',
        department: 'PRODUKSI',
        daily_salary: 150000,
        trip_allowance: 250000,
        is_active: true,
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = 'Nama karyawan wajib diisi';
    if (!formData.id_absen.trim()) err.id_absen = 'ID Absen wajib diisi';
    if (formData.daily_salary === '' || Number(formData.daily_salary) < 0) {
      err.daily_salary = 'Gaji pokok harian tidak valid';
    }
    if (formData.trip_allowance === '' || Number(formData.trip_allowance) < 0) {
      err.trip_allowance = 'Tunjangan perjalanan tidak valid';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...formData,
      name: formData.name.trim().toUpperCase(),
      id_absen: formData.id_absen.trim(),
      daily_salary: Number(formData.daily_salary),
      trip_allowance: Number(formData.trip_allowance),
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center border border-orange-200">
              <span className="material-symbols-outlined text-xl">badge</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                {employee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h2>
              <p className="text-xs text-slate-500">Master data profil &amp; tarif harian karyawan</p>
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
          {/* ID Absen & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ID Absen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 101 atau EMP-01"
                value={formData.id_absen}
                onChange={(e) => setFormData({ ...formData, id_absen: e.target.value })}
                className={`w-full bg-white border ${errors.id_absen ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all`}
              />
              {errors.id_absen && <p className="text-red-500 text-[11px] mt-1">{errors.id_absen}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Karyawan</label>
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emp_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="emp_active" className="text-sm text-slate-700 cursor-pointer select-none">
                  {formData.is_active ? (
                    <span className="text-emerald-600 font-medium">Aktif Bekerja</span>
                  ) : (
                    <span className="text-slate-400">Non-Aktif</span>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Nama Karyawan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Karyawan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: ERWIN SASONGKO"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-slate-300'} rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all uppercase font-medium`}
            />
            {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
          </div>

          {/* Departemen */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Departemen</label>
            <div className="relative">
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none text-xl">
                expand_more
              </span>
            </div>
          </div>

          {/* Gaji Pokok Harian */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Tarif Gaji Pokok Harian (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500">Rp</span>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="150000"
                value={formData.daily_salary}
                onChange={(e) => setFormData({ ...formData, daily_salary: e.target.value })}
                className={`w-full bg-white border ${errors.daily_salary ? 'border-red-500' : 'border-slate-300'} rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono font-medium`}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Format tampilan: <span className="font-semibold text-orange-600">Rp {formatNumberComma(formData.daily_salary)}</span> / hari kerja di bengkel
            </p>
            {errors.daily_salary && <p className="text-red-500 text-[11px]">{errors.daily_salary}</p>}
          </div>

          {/* Tunjangan Perjalanan */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Tarif Tunjangan Perjalanan / Luar Kota (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500">Rp</span>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="250000"
                value={formData.trip_allowance}
                onChange={(e) => setFormData({ ...formData, trip_allowance: e.target.value })}
                className={`w-full bg-white border ${errors.trip_allowance ? 'border-red-500' : 'border-slate-300'} rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono font-medium`}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Format tampilan: <span className="font-semibold text-orange-600">Rp {formatNumberComma(formData.trip_allowance)}</span> / hari tugas luar kota
            </p>
            {errors.trip_allowance && <p className="text-red-500 text-[11px]">{errors.trip_allowance}</p>}
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
              <span className="material-symbols-outlined text-sm">save</span>
              <span>{employee ? 'Simpan Perubahan' : 'Tambah Karyawan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EmployeeModal;
