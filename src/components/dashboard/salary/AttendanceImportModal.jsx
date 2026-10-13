import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import salaryApi from '../../../services/salaryApi';
import { useToast } from '../../../contexts/ToastContext';

const AttendanceImportModal = ({
  isOpen,
  onClose,
  period,
  records = [],
  onImportSuccess,
}) => {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [uploadedFileName, setUploadedFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !period) return null;

  const workDays = period.work_days || 6;

  // Process uploaded Excel file
  const processExcelFile = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!sheetData || sheetData.length === 0) {
          addToast('File Excel kosong atau tidak terbaca.', 'error');
          return;
        }

        // Detect column indices dynamically
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

          let idAbsen = row[colIdxId] !== undefined && row[colIdxId] !== null ? String(row[colIdxId]).trim() : '';
          let name = row[colIdxName] !== undefined && row[colIdxName] !== null ? String(row[colIdxName]).trim() : '';
          let hoursRaw = row[colIdxHours] !== undefined && row[colIdxHours] !== null ? String(row[colIdxHours]).trim() : '';

          if (!hoursRaw && name && !isNaN(Number(name.replace(',', '.')))) {
            hoursRaw = name;
            name = '';
          }

          if (!idAbsen && !name && !hoursRaw) continue;

          const hours = parseFloat(hoursRaw.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
          // Standar 1 hari = 8 jam kerja
          const days = Math.round((hours / 8) * 100) / 100;

          const matchedRec = records.find(
            (r) =>
              (r.id_absen && String(r.id_absen).trim() === String(idAbsen).trim()) ||
              (r.name && name && r.name.toLowerCase().trim() === name.toLowerCase().trim())
          );

          rows.push({
            id_absen: idAbsen,
            name: name || (matchedRec ? matchedRec.name : '-'),
            hours,
            total_hours: hours,
            days,
            matched: !!matchedRec,
            matchedRecord: matchedRec || null,
          });
        }

        if (rows.length === 0) {
          addToast('Tidak ditemukan baris absensi yang valid dalam file Excel.', 'error');
          return;
        }

        setUploadedFileName(file.name);
        setParsedRows(rows);
      } catch (err) {
        console.error('Error reading excel:', err);
        addToast('Gagal membaca file Excel. Pastikan format file valid (.xlsx / .xls)', 'error');
      }
    };

    reader.readAsArrayBuffer(file);
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

  const handleDownloadTemplate = () => {
    try {
      const templateData = [];
      if (records.length > 0) {
        records.forEach((r) => {
          templateData.push({
            'ID Absen': r.id_absen || '',
            'Nama Karyawan': r.name || '',
            'Jam Kerja': workDays * 8,
          });
        });
      } else {
        templateData.push(
          { 'ID Absen': '1', 'Nama Karyawan': 'BARRONSAVE', 'Jam Kerja': 48 },
          { 'ID Absen': '4', 'Nama Karyawan': 'WARSITO', 'Jam Kerja': 48 },
          { 'ID Absen': '5', 'Nama Karyawan': 'MULYOTO', 'Jam Kerja': 48 }
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
      XLSX.writeFile(wb, `Template_Absensi_${(period.period_name || 'Periode').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
      addToast('Template Excel berhasil diunduh.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Gagal mengunduh template.', 'error');
    }
  };

  const handleApplyAttendance = async () => {
    if (!parsedRows || parsedRows.length === 0) return;
    try {
      setIsLoading(true);
      const attendancePayload = parsedRows.map((r) => ({
        id_absen: r.id_absen,
        name: r.name,
        days: r.days,
        total_hours: r.hours,
      }));

      await salaryApi.applyAttendanceToPeriod(
        period.id,
        attendancePayload,
        uploadedFileName || 'Import_Absensi.xlsx'
      );

      addToast(`Berhasil menerapkan ${parsedRows.length} data absensi ke database!`, 'success');
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Gagal menerapkan absensi: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const matchedCount = parsedRows.filter((r) => r.matched).length;
  const unmatchedCount = parsedRows.length - matchedCount;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-white border border-slate-200 rounded-2xl w-full ${
          parsedRows.length > 0 ? 'max-w-2xl' : 'max-w-lg'
        } shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all duration-200`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center border border-orange-200">
              <span className="material-symbols-outlined text-xl">upload_file</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider font-manrope">
                  Upload Data Absensi
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                {period.period_name} • Standar: {workDays} Hari Kerja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
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

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleApplyAttendance}
              disabled={parsedRows.length === 0 || isLoading}
              className={`px-5 py-2 text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                parsedRows.length > 0 && !isLoading
                  ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/20 hover:scale-[1.02] active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${isLoading ? 'animate-spin' : ''}`}>
                {isLoading ? 'sync' : 'check_circle'}
              </span>
              <span>
                {isLoading
                  ? 'Menerapkan Absensi...'
                  : parsedRows.length > 0
                  ? `Simpan & Terapkan Absen (${parsedRows.length} Karyawan)`
                  : 'Upload File Terlebih Dahulu'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AttendanceImportModal;
