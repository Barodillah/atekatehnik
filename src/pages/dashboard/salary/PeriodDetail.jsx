import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import {
  getPeriodById,
  savePeriod,
  getPeriodRecords,
  saveRecord,
  deleteRecord,
  batchSaveRecords,
  initPeriodRecordsFromEmployees,
  getEmployees,
  formatNumberComma,
  calculateSalaryRow,
} from '../../../services/salaryStorage';
import PayslipSingleModal from '../../../components/dashboard/salary/PayslipSingleModal';
import SalaryAdjustModal from '../../../components/dashboard/salary/SalaryAdjustModal';

const PeriodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { confirmDialog } = useConfirm();

  const [period, setPeriod] = useState(null);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Modal states
  const [singlePrintRecord, setSinglePrintRecord] = useState(null);
  const [adjustingRecord, setAdjustingRecord] = useState(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [selectedEmpToAdd, setSelectedEmpToAdd] = useState('');

  // Top & Table Horizontal Scroll Sync States & Refs
  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);
  const tableRef = useRef(null);
  const isSyncingScroll = useRef(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  // Sync scroll from table to top
  const handleTableScroll = () => {
    if (!tableScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tableScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const pct = maxScroll > 0 ? Math.min(100, Math.round((scrollLeft / maxScroll) * 100)) : 0;
    setScrollPercent(pct);

    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    if (topScrollRef.current) {
      topScrollRef.current.scrollLeft = scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  // Sync scroll from top to table
  const handleTopScroll = () => {
    if (!topScrollRef.current) return;
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  const scrollTable = (direction) => {
    if (!tableScrollRef.current) return;
    const offset = direction === 'left' ? -250 : 250;
    tableScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // ResizeObserver to track exact table width in real-time
  useEffect(() => {
    const updateMetrics = () => {
      if (tableRef.current && tableScrollRef.current) {
        const fullWidth = tableRef.current.scrollWidth;
        const containerWidth = tableScrollRef.current.clientWidth;
        setTableScrollWidth(fullWidth);
        setCanScroll(fullWidth > containerWidth);
        const maxScroll = fullWidth - containerWidth;
        const sLeft = tableScrollRef.current.scrollLeft;
        setScrollPercent(maxScroll > 0 ? Math.min(100, Math.round((sLeft / maxScroll) * 100)) : 0);
      }
    };

    updateMetrics();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateMetrics();
      });
      if (tableRef.current) ro.observe(tableRef.current);
      if (tableScrollRef.current) ro.observe(tableScrollRef.current);
    }

    window.addEventListener('resize', updateMetrics);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateMetrics);
    };
  }, [records, searchTerm, selectedDept]);

  // Load period & records
  const loadData = () => {
    const p = getPeriodById(id);
    if (!p) {
      navigate('/admin/salary/periods');
      return;
    }
    setPeriod(p);
    let recs = getPeriodRecords(id);
    if (recs.length === 0) {
      recs = initPeriodRecordsFromEmployees(id, p.work_days || 6);
    } else {
      recs = recs.map((r) => calculateSalaryRow(r, p.work_days || 6));
    }
    setRecords(recs);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Handle direct inline change on a record cell
  const handleInlineChange = (recordId, field, value) => {
    const stdDays = period?.work_days || 6;
    const updated = records.map((r) => {
      if (r.id === recordId) {
        const raw = { ...r, [field]: value };
        return calculateSalaryRow(raw, stdDays);
      }
      return r;
    });
    setRecords(updated);
    batchSaveRecords(id, updated);
  };

  // Helper to restrict keyboard input to numeric keys only
  const handleNumericKeyDown = (e, allowDecimal = true) => {
    // Allow navigation, deletion, clipboard shortcuts
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) ||
      ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'r'].includes(e.key.toLowerCase()))
    ) {
      return;
    }
    // Allow decimal point or comma if allowed and not already present
    if (allowDecimal && (e.key === '.' || e.key === ',')) {
      if (!e.currentTarget.value.includes('.')) {
        return;
      }
    }
    // Allow digits 0-9
    if (/^[0-9]$/.test(e.key)) {
      return;
    }
    // Block any other key (letters, symbols, + / -)
    e.preventDefault();
  };

  // Handle day changes (integer or decimal like 0.5)
  const handleDayInputChange = (recordId, field, e) => {
    let val = e.target.value.replace(',', '.');
    val = val.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    handleInlineChange(recordId, field, val);
  };

  // Normalize day on blur (e.g. empty or "." becomes 0)
  const handleDayInputBlur = (recordId, field, e) => {
    let val = e.target.value.trim();
    if (val === '' || val === '.') {
      handleInlineChange(recordId, field, 0);
    } else {
      handleInlineChange(recordId, field, parseFloat(val) || 0);
    }
  };

  // Handle nominal amount changes (digits only, e.g. 50000)
  const handleAmountInputChange = (recordId, field, e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 1 && val.startsWith('0')) {
      val = String(parseInt(val, 10));
    }
    handleInlineChange(recordId, field, val === '' ? '' : parseInt(val, 10));
  };

  // Normalize amount on blur
  const handleAmountInputBlur = (recordId, field, e) => {
    let val = e.target.value.trim();
    if (val === '') {
      handleInlineChange(recordId, field, 0);
    }
  };

  // Handle save from Adjust Modal
  const handleSaveAdjust = (adjustedRecord) => {
    try {
      const updatedList = saveRecord(adjustedRecord);
      setRecords(updatedList);
      setAdjustingRecord(null);
      addToast(`Penyesuaian gaji ${adjustedRecord.name} berhasil disimpan`, 'success');
    } catch (e) {
      console.error(e);
      addToast('Gagal menyimpan penyesuaian gaji', 'error');
    }
  };

  // Handle delete a record from period
  const handleDeleteRecord = async (rec) => {
    const confirmed = await confirmDialog(
      `Hapus karyawan "${rec.name}" dari periode ${period?.period_name}?`,
      'Hapus Karyawan dari Periode',
      'danger'
    );
    if (confirmed) {
      try {
        const remaining = deleteRecord(rec.id);
        setRecords(remaining);
        addToast(`Karyawan ${rec.name} dihapus dari periode ini`, 'success');
      } catch (e) {
        console.error(e);
        addToast('Gagal menghapus karyawan dari periode', 'error');
      }
    }
  };

  // Handle status change for period (Draft, Published, Paid)
  const handleStatusChange = (newStatus) => {
    if (!period || !period.id) return;
    try {
      const updated = savePeriod({
        ...period,
        status: newStatus,
      });
      setPeriod(updated);
      addToast(`Status periode berhasil diubah menjadi "${newStatus}"`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Gagal mengubah status periode', 'error');
    }
  };

  // Sync / add active employees
  const handleSyncEmployees = () => {
    const updated = initPeriodRecordsFromEmployees(id, period?.work_days || 6);
    setRecords(updated);
    addToast('Daftar karyawan berhasil disinkronkan', 'success');
  };

  // Add individual employee to this period
  const handleAddEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmpToAdd) return;
    const allEmps = getEmployees();
    const emp = allEmps.find((e) => e.id === selectedEmpToAdd);
    if (emp) {
      const newRow = calculateSalaryRow({
        period_id: id,
        employee_id: emp.id,
        id_absen: emp.id_absen || '',
        name: emp.name,
        department: emp.department,
        business_trip_days: 0,
        workshop_days: period?.work_days || 6,
        leave_days: 0,
        rate_daily_salary: emp.daily_salary || 150000,
        rate_trip_allowance: emp.trip_allowance || 250000,
        extra_income_notes: '',
        extra_income_amount: 0,
      });
      const updated = saveRecord(newRow);
      setRecords(updated);
      setSelectedEmpToAdd('');
      setIsAddEmployeeOpen(false);
      addToast(`Karyawan ${emp.name} ditambahkan ke periode ini`, 'success');
    }
  };

  if (!period) return null;

  // Filtered rows
  const filteredRecords = records.filter((r) => {
    const matchSearch =
      (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.id_absen || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDept === 'ALL' || r.department === selectedDept;
    return matchSearch && matchDept;
  });

  // Summary Metrics
  const totalEmployees = records.length;
  const totalWorkshopDays = records.reduce((acc, curr) => acc + (Number(curr.workshop_days) || 0), 0);
  const avgWorkshopDays =
    totalEmployees > 0
      ? Math.round((totalWorkshopDays / totalEmployees) * 10) / 10
      : 0;
  const totalTripDays = records.reduce((acc, curr) => acc + (Number(curr.business_trip_days) || 0), 0);
  const totalNetSalary = records.reduce((acc, curr) => acc + (Number(curr.net_income) || 0), 0);

  // Available employees not yet in this period
  const existingEmpIds = new Set(records.map((r) => r.employee_id));
  const availableEmployees = getEmployees().filter((e) => !existingEmpIds.has(e.id));

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full max-w-full min-w-0 text-left">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <Link
            to="/admin/salary/periods"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all flex items-center justify-center shrink-0 shadow-xs cursor-pointer group"
            title="Kembali ke Daftar Periode"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-950 uppercase tracking-tight font-manrope">
                {period.period_name}
              </h1>
              <div className="relative inline-flex items-center">
                <select
                  value={period.status || 'Draft'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`pl-2.5 pr-6 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border appearance-none transition-all cursor-pointer focus:outline-none shadow-2xs ${
                    period.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : period.status === 'Published'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                      : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                  }`}
                  title="Klik untuk ubah status periode"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Paid">Paid</option>
                </select>
                <span className="material-symbols-outlined absolute right-1.5 text-xs pointer-events-none opacity-60">
                  expand_more
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-mono">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">calendar_month</span>
                {period.start_date} s/d {period.end_date}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                Standar: {period.work_days} Hari Kerja
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
          </button>

          <button
            onClick={handleSyncEmployees}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sinkronkan seluruh karyawan aktif"
          >
            <span className="material-symbols-outlined text-base">sync</span>
          </button>

          <Link
            to={`/admin/salary/periods/${id}/print`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>Cetak Slip</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Total Karyawan
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {totalEmployees} <span className="text-xs font-normal text-slate-500">Orang</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Avg. Hadir Bengkel
          </p>
          <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
            {avgWorkshopDays} <span className="text-xs font-normal text-slate-500">Hari</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Total Perjalanan Bisnis
          </p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            {totalTripDays} <span className="text-xs font-normal text-slate-500">Hari</span>
          </p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl shadow-sm">
          <p className="text-[11px] text-emerald-800 uppercase tracking-wider font-semibold">
            Total Gaji Periode Ini
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1">
            Rp {formatNumberComma(totalNetSalary)}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Cari karyawan dalam periode ini..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 shrink-0">Divisi:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">Semua Departemen</option>
            {Array.from(new Set(records.map((r) => r.department))).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Calculation & Adjustment Matrix Table */}
      <div className="w-full max-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

        {/* Synced Top Scrollbar Track (100% Kembar Identik dengan Scrollbar Bawah) */}
        {canScroll && (
          <div
            ref={topScrollRef}
            onScroll={handleTopScroll}
            className="w-full overflow-x-auto border-b border-slate-200 bg-slate-50"
          >
            <div style={{ width: `${tableScrollWidth}px`, height: '1px' }} />
          </div>
        )}

        {/* Table Container */}
        <div ref={tableScrollRef} onScroll={handleTableScroll} className="w-full overflow-x-auto">
          <table ref={tableRef} className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-700 align-top leading-tight">
                {/* No - Sticky & No-wrap */}
                <th className="py-3 px-2 w-12 min-w-[48px] max-w-[48px] text-center sticky left-0 z-20 bg-slate-100 whitespace-nowrap align-top">
                  No
                </th>

                {/* Nama & Departemen - Sticky & No-wrap */}
                <th className="py-3 px-3 text-left sticky left-12 z-20 bg-slate-100 whitespace-nowrap border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)] align-top">
                  Nama &amp; Departemen
                </th>

                {/* Kolom lainnya - Align Atas & Maksimal 2 Baris */}
                <th className="py-3 px-2 text-center bg-blue-50/70 border-l border-r border-blue-100 align-top">
                  <span className="whitespace-nowrap">Perjalanan</span>
                  <span className="block whitespace-nowrap text-[10px] text-blue-900/70 font-semibold">Bisnis (hari)*</span>
                </th>
                <th className="py-3 px-2 text-center bg-blue-50/70 border-r border-blue-100 align-top">
                  <span className="whitespace-nowrap">Hadir Bengkel</span>
                  <span className="block whitespace-nowrap text-[10px] text-blue-900/70 font-semibold">(hari)*</span>
                </th>
                <th className="py-3 px-2 text-center bg-blue-50/70 border-r border-blue-100 align-top">
                  <span className="whitespace-nowrap">Cuti</span>
                  <span className="block whitespace-nowrap text-[10px] text-blue-900/70 font-semibold">(hari)</span>
                </th>
                <th className="py-3 px-2 text-right align-top">
                  <span className="whitespace-nowrap">Tarif Gaji</span>
                  <span className="block whitespace-nowrap text-[10px] text-slate-500 font-semibold">Pokok (Rp)</span>
                </th>
                <th className="py-3 px-2 text-right align-top">
                  <span className="whitespace-nowrap">Tarif Tunjangan</span>
                  <span className="block whitespace-nowrap text-[10px] text-slate-500 font-semibold">Perjalanan (Rp)</span>
                </th>
                <th className="py-3 px-2 text-right bg-slate-50 font-bold text-slate-800 align-top">
                  <span className="whitespace-nowrap">Gaji Pokok</span>
                  <span className="block whitespace-nowrap text-[10px] text-slate-500 font-semibold">(Rp)</span>
                </th>
                <th className="py-3 px-2 text-right bg-slate-50 font-bold text-slate-800 align-top">
                  <span className="whitespace-nowrap">Tunjangan</span>
                  <span className="block whitespace-nowrap text-[10px] text-slate-500 font-semibold">Perjalanan (Rp)</span>
                </th>
                <th className="py-3 px-2 text-right bg-blue-50 font-black text-blue-700 align-top">
                  <span className="whitespace-nowrap">Subtotal</span>
                  <span className="block whitespace-nowrap text-[10px] text-blue-600 font-bold">Gaji (Rp)</span>
                </th>
                <th className="py-3 px-2.5 text-left bg-amber-50/50 border-l border-amber-100 align-top">
                  <span className="whitespace-nowrap">Catatan</span>
                  <span className="block whitespace-nowrap text-[10px] text-amber-800 font-semibold">Tambahan*</span>
                </th>
                <th className="py-3 px-2 text-right bg-amber-50/50 border-r border-amber-100 align-top">
                  <span className="whitespace-nowrap">Nominal</span>
                  <span className="block whitespace-nowrap text-[10px] text-amber-800 font-semibold">Tambahan (Rp)*</span>
                </th>
                <th className="py-3 px-2.5 text-right bg-emerald-50/80 font-black text-emerald-700 align-top">
                  <span className="whitespace-nowrap">Penghasilan</span>
                  <span className="block whitespace-nowrap text-[10px] text-emerald-600 font-bold">Bersih (Rp)</span>
                </th>
                <th className="py-3 px-2.5 text-center align-top">
                  <span className="whitespace-nowrap">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="14" className="py-12 text-center text-slate-400 font-sans">
                    Tidak ada karyawan yang sesuai kriteria pencarian
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={r.id} className="group hover:bg-slate-50/80 transition-colors">
                    {/* No - Sticky & No-wrap */}
                    <td className="py-3 px-2 w-12 min-w-[48px] max-w-[48px] text-center text-slate-500 font-sans align-middle sticky left-0 z-10 bg-white group-hover:bg-slate-50 whitespace-nowrap">
                      {idx + 1}
                    </td>

                    {/* Nama & Departemen - Sticky & No-wrap */}
                    <td className="py-3 px-3 font-sans align-middle sticky left-12 z-10 bg-white group-hover:bg-slate-50 whitespace-nowrap border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                      <div className="font-bold text-slate-900 tracking-wide uppercase whitespace-nowrap">{r.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                        <span className="text-[10px] text-blue-700 font-bold tracking-wide whitespace-nowrap">
                          {r.department}
                        </span>
                        {r.id_absen && (
                          <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono whitespace-nowrap">
                            ID: {r.id_absen}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Perjalanan Bisnis (Hari) - Editable */}
                    <td className="py-3 px-2 text-center bg-blue-50/30 border-l border-r border-blue-100 align-middle">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={r.business_trip_days ?? ''}
                        onKeyDown={(e) => handleNumericKeyDown(e, true)}
                        onChange={(e) =>
                          handleDayInputChange(r.id, 'business_trip_days', e)
                        }
                        onBlur={(e) =>
                          handleDayInputBlur(r.id, 'business_trip_days', e)
                        }
                        className="w-[68px] bg-white border border-slate-300 text-center py-1.5 px-1 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-orange-500 focus:bg-orange-50/30 transition-colors"
                        title="Perjalanan Bisnis (hari)"
                      />
                    </td>

                    {/* Hadir Bengkel (Hari) - Editable */}
                    <td className="py-3 px-2 text-center bg-blue-50/30 border-r border-blue-100 align-middle">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={r.workshop_days ?? ''}
                        onKeyDown={(e) => handleNumericKeyDown(e, true)}
                        onChange={(e) =>
                          handleDayInputChange(r.id, 'workshop_days', e)
                        }
                        onBlur={(e) =>
                          handleDayInputBlur(r.id, 'workshop_days', e)
                        }
                        className="w-[68px] bg-white border border-slate-300 text-center py-1.5 px-1 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-orange-500 focus:bg-orange-50/30 transition-colors"
                        title="Hadir Bengkel (hari)"
                      />
                    </td>

                    {/* Cuti (Hari) - Non Editable (Otomatis) */}
                    <td className="py-3 px-2 text-center bg-blue-50/30 border-r border-blue-100 align-middle">
                      <span
                        className="inline-block min-w-[50px] py-1.5 px-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs font-mono select-none"
                        title={`Otomatis: Standar (${period?.work_days || 6} hari) - (${r.business_trip_days || 0} + ${r.workshop_days || 0})`}
                      >
                        {r.leave_days ?? 0}
                      </span>
                    </td>

                    {/* Tarif Gaji Pokok (Rp) */}
                    <td className="py-3 px-2 text-right text-slate-600 align-middle whitespace-nowrap">
                      {formatNumberComma(r.rate_daily_salary)}
                    </td>

                    {/* Tarif Tunjangan Perjalanan (Rp) */}
                    <td className="py-3 px-2 text-right text-slate-600 align-middle whitespace-nowrap">
                      {formatNumberComma(r.rate_trip_allowance)}
                    </td>

                    {/* Gaji Pokok (Rp) */}
                    <td className="py-3 px-2 text-right font-bold text-slate-900 bg-slate-50/60 align-middle whitespace-nowrap">
                      {formatNumberComma(r.base_salary)}
                    </td>

                    {/* Tunjangan Perjalanan (Rp) */}
                    <td className="py-3 px-2 text-right font-bold text-slate-900 bg-slate-50/60 align-middle whitespace-nowrap">
                      {formatNumberComma(r.trip_allowance_total)}
                    </td>

                    {/* Subtotal Gaji (Rp) */}
                    <td className="py-3 px-2 text-right font-black text-blue-700 bg-blue-50/40 align-middle whitespace-nowrap">
                      {formatNumberComma(r.salary_subtotal)}
                    </td>

                    {/* Catatan Penghasilan Tambahan - Editable */}
                    <td className="py-3 px-2 bg-amber-50/30 border-l border-amber-100 align-middle">
                      <input
                        type="text"
                        placeholder="Lembur..."
                        value={r.extra_income_notes || ''}
                        onChange={(e) =>
                          handleInlineChange(r.id, 'extra_income_notes', e.target.value)
                        }
                        className="w-full min-w-[110px] bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg text-slate-900 text-xs uppercase focus:outline-none focus:border-orange-500 font-sans transition-colors"
                      />
                    </td>

                    {/* Nominal Tambahan (Rp) - Editable */}
                    <td className="py-3 px-2 text-right bg-amber-50/30 border-r border-amber-100 align-middle">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={r.extra_income_amount ?? ''}
                        onKeyDown={(e) => handleNumericKeyDown(e, false)}
                        onChange={(e) =>
                          handleAmountInputChange(r.id, 'extra_income_amount', e)
                        }
                        onBlur={(e) =>
                          handleAmountInputBlur(r.id, 'extra_income_amount', e)
                        }
                        placeholder="0"
                        className="w-24 bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg text-right text-emerald-700 font-bold focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </td>

                    {/* Penghasilan Bersih (Rp) */}
                    <td className="py-3 px-2.5 text-right font-black text-emerald-700 bg-emerald-50/80 text-xs whitespace-nowrap align-middle">
                      Rp{formatNumberComma(r.net_income)}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-2.5 text-center font-sans whitespace-nowrap align-middle">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSinglePrintRecord(r)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg border border-blue-200 transition-all font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Cetak Slip Gaji Satuan"
                        >
                          <span className="material-symbols-outlined text-sm">print</span>
                        </button>
                        <button
                          onClick={() => setAdjustingRecord(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Adjust Rinci"
                        >
                          <span className="material-symbols-outlined text-base">tune</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(r)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus dari Periode"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Single Payslip Preview & Print */}
      {singlePrintRecord && (
        <PayslipSingleModal
          isOpen={!!singlePrintRecord}
          onClose={() => setSinglePrintRecord(null)}
          record={singlePrintRecord}
          period={period}
          allRecords={records}
          onSelectRecord={(rec) => setSinglePrintRecord(rec)}
        />
      )}

      {/* Modal: Adjust Record */}
      {adjustingRecord && (
        <SalaryAdjustModal
          isOpen={!!adjustingRecord}
          onClose={() => setAdjustingRecord(null)}
          onSave={handleSaveAdjust}
          record={adjustingRecord}
          workDays={period?.work_days || 6}
        />
      )}

      {/* Modal: Add Employee to Period */}
      {isAddEmployeeOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Tambah Karyawan ke Periode Ini
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pilih karyawan dari master data yang belum masuk ke dalam periode ini.
            </p>

            {availableEmployees.length === 0 ? (
              <div className="p-4 bg-slate-100 rounded-lg text-center text-xs text-slate-500 mb-4">
                Semua karyawan aktif sudah terdaftar di periode ini.
              </div>
            ) : (
              <form onSubmit={handleAddEmployeeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Karyawan
                  </label>
                  <select
                    value={selectedEmpToAdd}
                    onChange={(e) => setSelectedEmpToAdd(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="">-- Pilih Karyawan --</option>
                    {availableEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEmployeeOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm"
                  >
                    Tambahkan
                  </button>
                </div>
              </form>
            )}

            {availableEmployees.length === 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PeriodDetail;
