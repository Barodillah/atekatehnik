import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import { getEmployees } from '../../../services/salaryStorage';

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
  // Step 1: Info Periode, Step 2: Upload Absensi Excel
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    period_name: '',
    start_date: '',
    end_date: '',
  });

  const [holidays, setHolidays] = useState('0');
  const [errors, setErrors] = useState({});

  // Attendance upload states
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Helper to calculate total calendar days between two dates inclusive
  const calculateRangeDays = (start, end) => {
    if (!start || !end) return 0;
    const [y1, m1, d1] = start.split('-').map(Number);
    const [y2, m2, d2] = end.split('-').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    if (isNaN(date1.getTime()) || isNaN(date2.getTime()) || date2 < date1) return 0;
    const diffTime = date2.getTime() - date1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const rangeDays = calculateRangeDays(formData.start_date, formData.end_date);
  const holidayCount = Number(holidays) || 0;
  const effectiveWorkDays = Math.max(0, rangeDays - holidayCount);

  // Active employees for matching
  const registeredEmployees = getEmployees().filter((e) => e.is_active !== false);

  useEffect(() => {
    setStep(1);
    setUploadedFileName('');
    setParsedRows([]);
    setIsDragging(false);

    if (period) {
      setFormData({
        id: period.id,
        period_name: period.period_name || '',
        start_date: period.start_date || '',
        end_date: period.end_date || '',
      });

      if (period.holidays !== undefined && period.holidays !== null) {
        setHolidays(String(period.holidays));
      } else if (period.work_days !== undefined) {
        const rDays = calculateRangeDays(period.start_date, period.end_date);
        const diff = Math.max(0, rDays - period.work_days);
        setHolidays(String(diff));
      } else {
        setHolidays('0');
      }
    } else {
      // Default to current week (Monday to Saturday or 6-day span)
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const monthStr = MONTH_NAMES[currentMonth];
      const weekNum = getWeekOfMonth(now);

      const formatDateStr = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
      };

      const startD = new Date();
      const endD = new Date();
      endD.setDate(startD.getDate() + 5);

      setFormData({
        period_name: `${monthStr} ${currentYear} - Minggu ke ${weekNum}`,
        start_date: formatDateStr(startD),
        end_date: formatDateStr(endD),
      });
      setHolidays('0');
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

  // Process Excel File with XLSX library
  const processExcelFile = async (file) => {
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!sheetData || sheetData.length === 0) {
        alert('File Excel kosong atau tidak memiliki data.');
        return;
      }

      // Detect column indices dynamically if a header row is present
      let colIdxId = 0;
      let colIdxName = 1;
      let colIdxHours = 2;
      let startIndex = 0;

      for (let i = 0; i < Math.min(5, sheetData.length); i++) {
        const row = sheetData[i];
        if (!row || row.length === 0) continue;
        const rowStr = row.map((c) => String(c || '').toLowerCase()).join(' ');
        if (
          rowStr.includes('absen') ||
          rowStr.includes('nama') ||
          rowStr.includes('jam') ||
          rowStr.includes('karyawan')
        ) {
          row.forEach((cell, idx) => {
            const str = String(cell || '').trim().toLowerCase();
            if (str.includes('absen') || (str.includes('id') && !str.includes('nama'))) {
              colIdxId = idx;
            } else if (str.includes('nama') || str.includes('name') || str.includes('karyawan')) {
              colIdxName = idx;
            } else if (
              str.includes('jam') ||
              str.includes('hour') ||
              str.includes('kerja') ||
              str.includes('total')
            ) {
              colIdxHours = idx;
            }
          });
          startIndex = i + 1;
          break;
        }
      }

      const rows = [];

      for (let i = startIndex; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (!row || row.length === 0) continue;

        let idAbsen =
          row[colIdxId] !== undefined && row[colIdxId] !== null ? String(row[colIdxId]).trim() : '';
        let name =
          row[colIdxName] !== undefined && row[colIdxName] !== null ? String(row[colIdxName]).trim() : '';
        let hoursRaw =
          row[colIdxHours] !== undefined && row[colIdxHours] !== null
            ? String(row[colIdxHours]).trim()
            : '';

        // Fallback if 2 columns provided (ID, Jam)
        if (!hoursRaw && name && !isNaN(Number(name.replace(',', '.')))) {
          hoursRaw = name;
          name = '';
        }

        if (!idAbsen && !name && !hoursRaw) continue;

        const hours = parseFloat(hoursRaw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
        // 1 hari = 8 jam kerja
        const days = Math.round((hours / 8) * 100) / 100;

        const matchedEmp = registeredEmployees.find(
          (emp) =>
            (emp.id_absen && emp.id_absen.toString().trim() === idAbsen.toString().trim()) ||
            (emp.name && name && emp.name.toLowerCase().trim() === name.toLowerCase().trim())
        );

        const finalName = name || (matchedEmp ? matchedEmp.name : '-');

        rows.push({
          id_absen: idAbsen,
          name: finalName,
          hours,
          days,
          matched: !!matchedEmp,
          matchedEmp: matchedEmp || null,
        });
      }

      if (rows.length === 0) {
        alert('Tidak ditemukan baris absensi yang valid dalam file Excel.');
        return;
      }

      setUploadedFileName(file.name);
      setParsedRows(rows);
    } catch (err) {
      console.error('Error reading excel with XLSX:', err);
      alert('Gagal membaca file Excel. Pastikan format file valid (.xlsx, .xls, atau .csv)');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileName('');
    setParsedRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download template Excel (.xlsx) using XLSX library
  const handleDownloadTemplate = () => {
    try {
      const templateData = [];
      if (registeredEmployees.length > 0) {
        registeredEmployees.forEach((emp) => {
          const defaultHours = effectiveWorkDays * 8;
          templateData.push({
            'ID Absen': emp.id_absen || '',
            'Nama Karyawan': emp.name || '',
            'Jam Kerja': defaultHours,
          });
        });
      } else {
        templateData.push(
          { 'ID Absen': '101', 'Nama Karyawan': 'ERWIN SASONGKO', 'Jam Kerja': 48 },
          { 'ID Absen': '102', 'Nama Karyawan': 'BAMBANG SUTRISNO', 'Jam Kerja': 48 },
          { 'ID Absen': '103', 'Nama Karyawan': 'AGUS SETIAWAN', 'Jam Kerja': 48 }
        );
      }

      const ws = XLSX.utils.json_to_sheet(templateData);

      ws['!cols'] = [
        { wch: 14 }, // ID Absen
        { wch: 30 }, // Nama Karyawan
        { wch: 14 }, // Jam Kerja
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Absensi');

      const fileName = `Template_Absensi_${(formData.period_name || 'Periode').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Error exporting template with XLSX:', err);
    }
  };

  const validateStep1 = () => {
    const err = {};
    if (!formData.period_name.trim()) err.period_name = 'Nama periode wajib diisi';
    if (!formData.start_date) err.start_date = 'Tanggal mulai wajib dipilih';
    if (!formData.end_date) err.end_date = 'Tanggal selesai wajib dipilih';
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      err.end_date = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
    }
    if (rangeDays <= 0) {
      err.start_date = 'Rentang tanggal tidak valid';
    }
    if (effectiveWorkDays <= 0) {
      err.work_days = 'Hari kerja efektif minimal 1 hari (rentang tanggal harus lebih besar dari hari libur)';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const getPayload = () => ({
    ...formData,
    period_name: formData.period_name.trim().toUpperCase(),
    work_days: effectiveWorkDays,
    holidays: holidayCount,
    status: period?.status || 'Draft',
  });

  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    if (period) {
      // Edit mode: save immediately
      onSave(getPayload(), []);
    } else {
      // New mode: advance to Step 2 (Upload File Absen)
      setStep(2);
    }
  };

  const handleFinishWithoutImport = () => {
    onSave(getPayload(), []);
  };

  const handleFinishWithImport = () => {
    onSave(getPayload(), parsedRows);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-white border border-slate-200 rounded-2xl w-full ${
          step === 2 && parsedRows.length > 0 ? 'max-w-2xl' : 'max-w-lg'
        } shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all duration-200`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center border border-orange-200">
              <span className="material-symbols-outlined text-xl">
                {step === 2 ? 'upload_file' : 'date_range'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-manrope">
                  {period
                    ? 'Edit Periode Penggajian'
                    : step === 2
                    ? 'Upload Data Absensi'
                    : 'Buat Periode Baru'}
                </h2>
                {!period && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                    Langkah {step} dari 2
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {step === 2
                  ? `${formData.period_name} • Standar: ${effectiveWorkDays} Hari Kerja`
                  : 'Atur rentang tanggal, hari libur, dan hari kerja'}
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

        {/* Modal Body: STEP 1 (Period Details) */}
        {step === 1 && (
          <form
            onSubmit={handleSubmitStep1}
            className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-left"
          >
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
                  className={`w-full bg-white border ${
                    errors.start_date ? 'border-red-500' : 'border-slate-300'
                  } rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500 transition-all`}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.start_date}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sampai Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className={`w-full bg-white border ${
                    errors.end_date ? 'border-red-500' : 'border-slate-300'
                  } rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500 transition-all`}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.end_date}</p>
                )}
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
                className={`w-full bg-white border ${
                  errors.period_name ? 'border-red-500' : 'border-slate-300'
                } rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all uppercase font-medium`}
              />
              {errors.period_name && (
                <p className="text-red-500 text-[11px] mt-1">{errors.period_name}</p>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                Format ini yang akan tercetak pada Slip Gaji Karyawan
              </p>
            </div>

            {/* Hari Libur & Informasi Hari Kerja */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Hari Libur
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={holidays}
                    onChange={(e) => setHolidays(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500 transition-all font-mono font-medium"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 pointer-events-none">
                    Hari
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Libur nasional / hari libur non-kerja (hanya angka)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Hari Kerja Efektif
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 flex items-center justify-between min-h-[42px]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-600 text-lg">
                      event_available
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {effectiveWorkDays} Hari
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {rangeDays} hari - {holidayCount} libur
                  </span>
                </div>
                {errors.work_days && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.work_days}</p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Otomatis dihitung dari rentang tanggal dikurang hari libur
                </p>
              </div>
            </div>

            {/* Footer Actions Step 1 */}
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
                className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">
                  {period ? 'save' : 'arrow_forward'}
                </span>
                <span>{period ? 'Simpan Perubahan' : 'Lanjut Isi Data Absen'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Body: STEP 2 (Drag & Drop / Upload Area Only + Conditional Preview) */}
        {step === 2 && (
          <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-left">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            {/* Drag & Drop Upload Area (when no file detected yet) */}
            {!uploadedFileName ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                    : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 bg-slate-50/50'
                }`}
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs">
                  <span className="material-symbols-outlined text-3xl">upload_file</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Tarik &amp; lepas file Excel di sini
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  atau <span className="text-emerald-700 font-semibold underline">klik untuk memilih file</span> dari komputer Anda
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
                  <span className="font-semibold text-slate-600">Format:</span> ID Absen, Nama, Jam Kerja (.xlsx, .xls, .csv)
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadTemplate();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Download Template Excel (.xlsx)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Detected File Badge */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-4 border rounded-xl flex items-center justify-between gap-3 shadow-2xs transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-100/70 scale-[1.01]'
                    : 'bg-emerald-50/60 border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-xl">description</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {uploadedFileName}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      ✓ {parsedRows.length} data absensi karyawan terdeteksi (1 Hari = 8 Jam)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    Ganti File
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus file"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            )}

            {/* PREVIEW: Only appears if file has been uploaded and detected */}
            {parsedRows.length > 0 && (
              <div className="space-y-2 pt-1 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Preview Hasil Konversi
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {parsedRows.length} Karyawan
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    Total: <strong className="text-slate-800">{parsedRows.reduce((a, c) => a + c.hours, 0)} Jam</strong> (÷8 = {(parsedRows.reduce((a, c) => a + c.days, 0)).toFixed(1)} Hari)
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-[220px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600 sticky top-0 z-10">
                        <th className="py-2 px-3 w-10 text-center">No</th>
                        <th className="py-2 px-3">ID Absen</th>
                        <th className="py-2 px-3">Nama Karyawan</th>
                        <th className="py-2 px-3 text-right">Jam Kerja</th>
                        <th className="py-2 px-3 text-center">Hasil (Jam ÷ 8)</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {parsedRows.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2 px-3 text-center text-slate-400 font-sans">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-bold text-orange-700">
                            {r.id_absen || '-'}
                          </td>
                          <td className="py-2 px-3 font-sans font-bold text-slate-900 truncate max-w-[160px]">
                            {r.name}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-700">
                            {r.hours} Jam
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              {r.days} Hari
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-sans">
                            {r.matched ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Cocok
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Belum Terdaftar
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Actions Step 2 */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishWithoutImport}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline transition-colors cursor-pointer"
                >
                  Lewati
                </button>
              </div>

              <button
                type="button"
                onClick={handleFinishWithImport}
                disabled={parsedRows.length === 0}
                className={`px-5 py-2 text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  parsedRows.length > 0
                    ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/20 hover:scale-[1.02] active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>
                  {parsedRows.length > 0
                    ? `Simpan & Terapkan Absen (${parsedRows.length} Karyawan)`
                    : 'Upload File Terlebih Dahulu'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default PeriodModal;
