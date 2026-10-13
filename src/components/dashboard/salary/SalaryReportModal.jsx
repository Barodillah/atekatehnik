import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { formatNumberComma } from '../../../services/salaryStorage';

const SalaryReportModal = ({
  isOpen,
  onClose,
  period,
  records = [],
  initialDept = 'ALL',
}) => {
  const [selectedDept, setSelectedDept] = useState(initialDept);

  if (!isOpen || !period) return null;

  // Filter records by department
  const filteredRecords = records.filter(
    (r) => selectedDept === 'ALL' || r.department === selectedDept
  );

  // Departments list for filter
  const departments = Array.from(new Set(records.map((r) => r.department))).filter(Boolean);

  // Summary Metrics for the report
  const totalEmployees = filteredRecords.length;
  const totalWorkshopDays = filteredRecords.reduce((acc, curr) => acc + (Number(curr.workshop_days) || 0), 0);
  const avgWorkshopDays =
    totalEmployees > 0
      ? Math.round((totalWorkshopDays / totalEmployees) * 10) / 10
      : 0;
  const totalTripDays = filteredRecords.reduce((acc, curr) => acc + (Number(curr.business_trip_days) || 0), 0);
  const totalLeaveDays = filteredRecords.reduce((acc, curr) => acc + (Number(curr.leave_days) || 0), 0);
  const totalBaseSalary = filteredRecords.reduce((acc, curr) => acc + (Number(curr.base_salary) || 0), 0);
  const totalTripAllowance = filteredRecords.reduce((acc, curr) => acc + (Number(curr.trip_allowance_total) || 0), 0);
  const totalSalarySubtotal = filteredRecords.reduce((acc, curr) => acc + (Number(curr.salary_subtotal) || 0), 0);
  const totalExtraIncome = filteredRecords.reduce((acc, curr) => acc + (Number(curr.extra_income_amount) || 0), 0);
  const totalNetSalary = filteredRecords.reduce((acc, curr) => acc + (Number(curr.net_income) || 0), 0);

  // Print function using invisible iframe for clean print output
  const handlePrint = () => {
    const printEl = document.getElementById('printable-salary-report');
    if (!printEl) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets from head
    let styles = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      styles += el.outerHTML;
    });

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Laporan Rekapitulasi Gaji - ${period.period_name || 'Periode'}</title>
          ${styles}
          <style>
            @page {
              size: A4 landscape;
              margin: 8mm;
            }
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-wrapper {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">${printEl.innerHTML}</div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Iframe print error:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 350);
  };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return createPortal(
    <div className="salary-report-backdrop fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div className="salary-report-card bg-white border border-slate-200 rounded-xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Modal Toolbar - Hidden during print */}
        <div className="salary-report-toolbar px-5 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-700 text-2xl">summarize</span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Preview Cetak Laporan Gaji
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {period.period_name} &bull; {totalEmployees} Karyawan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Departemen */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Divisi:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
              >
                <option value="ALL">Semua Departemen</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Tombol Cetak */}
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Cetak Laporan</span>
            </button>

            {/* Tombol Tutup */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              title="Tutup Preview"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Area with Paper Look */}
        <div className="salary-report-content p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-100 flex justify-center">
          <style>{`
            @media print {
              #root {
                display: none !important;
              }
              body {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              @page {
                size: A4 landscape;
                margin: 8mm;
              }
              .salary-report-backdrop {
                position: static !important;
                inset: auto !important;
                background: transparent !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                display: block !important;
              }
              .salary-report-card {
                border: none !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                max-height: none !important;
                max-width: 100% !important;
                width: 100% !important;
                overflow: visible !important;
                display: block !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              .salary-report-toolbar {
                display: none !important;
              }
              .salary-report-content {
                padding: 0 !important;
                margin: 0 !important;
                background: white !important;
                overflow: visible !important;
                display: block !important;
                width: 100% !important;
              }
              #printable-salary-report {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
                display: block !important;
              }
            }
          `}</style>

          {/* Printable Report Document (A4 Landscape Formatted) */}
          <div
            id="printable-salary-report"
            className="relative overflow-hidden bg-white text-slate-900 font-sans p-6 sm:p-8 w-full max-w-[1100px] shadow-lg border border-slate-300 rounded-sm select-none"
            style={{ boxSizing: 'border-box' }}
          >
            {/* Background Watermark Ateka Tehnik */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none overflow-hidden"
              aria-hidden="true"
            >
              <img
                src="https://atekatehnik.com/wp/uploads/url_6acd5ef4669dc7.96486380.png"
                alt=""
                className="w-1/2 max-w-[450px] object-contain opacity-[0.04]"
                style={{ opacity: 0.04 }}
              />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 text-left">
              {/* 1. Header Laporan (Dark Blue) */}
              <div
                className="text-white text-center py-3 px-4 mb-4 rounded-t-sm"
                style={{ backgroundColor: '#112d61' }}
              >
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider m-0 leading-tight">
                  ATEKA TEHNIK
                </h1>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mt-1 opacity-95">
                  LAPORAN REKAPITULASI GAJI KARYAWAN
                </p>
              </div>

              {/* 2. Metadata Info Bar */}
              <div className="bg-slate-50 border border-slate-300 rounded-sm p-3 mb-4 text-xs font-sans">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Periode</span>
                    <span className="font-bold text-slate-900 uppercase text-xs">{period.period_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Rentang Tanggal</span>
                    <span className="font-semibold text-slate-800 font-mono text-xs">
                      {period.start_date} s/d {period.end_date}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Standar Hari Kerja</span>
                    <span className="font-semibold text-slate-800 font-mono text-xs">
                      {period.work_days} Hari Kerja
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Status / Tgl Cetak</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      <span className="font-bold uppercase text-blue-900">{period.status || 'Draft'}</span> &bull; {todayStr}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Kotak Summary Mode Cetak (Sesuai Permintaan User) */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                <div className="border border-slate-300 bg-slate-50/80 p-2.5 rounded-sm text-left">
                  <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider block">
                    Total Karyawan
                  </span>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {totalEmployees} <span className="text-xs font-normal text-slate-600">Orang</span>
                  </div>
                </div>

                <div className="border border-blue-200 bg-blue-50/60 p-2.5 rounded-sm text-left">
                  <span className="text-[10px] text-blue-800 uppercase font-bold tracking-wider block">
                    Avg. Hadir Bengkel
                  </span>
                  <div className="text-lg font-black text-blue-800 mt-0.5">
                    {avgWorkshopDays} <span className="text-xs font-normal text-slate-600">Hari</span>
                  </div>
                </div>

                <div className="border border-amber-200 bg-amber-50/60 p-2.5 rounded-sm text-left">
                  <span className="text-[10px] text-amber-900 uppercase font-bold tracking-wider block">
                    Total Perjalanan Bisnis
                  </span>
                  <div className="text-lg font-black text-amber-800 mt-0.5">
                    {totalTripDays} <span className="text-xs font-normal text-slate-600">Hari</span>
                  </div>
                </div>

                <div className="border border-emerald-300 bg-emerald-50/80 p-2.5 rounded-sm text-left">
                  <span className="text-[10px] text-emerald-900 uppercase font-bold tracking-wider block">
                    Total Gaji Periode Ini
                  </span>
                  <div className="text-base sm:text-lg font-black text-emerald-800 font-mono mt-0.5 whitespace-nowrap">
                    Rp {formatNumberComma(totalNetSalary)}
                  </div>
                </div>
              </div>

              {/* 4. Tabel Rekapitulasi Gaji (Mode Cetak Lengkap) */}
              <div className="border border-slate-300 rounded-sm overflow-hidden mb-6">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-200/90 text-slate-900 font-bold uppercase tracking-wider text-[9px] border-b border-slate-300 leading-tight">
                      <th className="py-2 px-1.5 text-center w-8 border-r border-slate-300">No</th>
                      <th className="py-2 px-2 text-left border-r border-slate-300 min-w-[130px]">Nama Karyawan</th>
                      <th className="py-2 px-1.5 text-left border-r border-slate-300">Divisi</th>
                      <th className="py-2 px-1 text-center border-r border-slate-300">Bisnis</th>
                      <th className="py-2 px-1 text-center border-r border-slate-300">Bengkel</th>
                      <th className="py-2 px-1 text-center border-r border-slate-300">Cuti</th>
                      <th className="py-2 px-1.5 text-right border-r border-slate-300">Tarif Pokok</th>
                      <th className="py-2 px-1.5 text-right border-r border-slate-300">Tarif Tunj.</th>
                      <th className="py-2 px-1.5 text-right border-r border-slate-300">Gaji Pokok</th>
                      <th className="py-2 px-1.5 text-right border-r border-slate-300">Tunj. Bisnis</th>
                      <th className="py-2 px-1.5 text-right border-r border-slate-300">Subtotal</th>
                      <th className="py-2 px-1.5 text-left border-r border-slate-300 min-w-[90px]">Tambahan (Ket/Rp)</th>
                      <th className="py-2 px-2 text-right bg-slate-300/80 text-slate-950 font-black">Penghasilan Bersih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[10px]">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan="13" className="py-8 text-center text-slate-400 font-sans">
                          Tidak ada data karyawan dalam filter ini.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((r, idx) => (
                        <tr key={r.id} className="even:bg-slate-50/60">
                          {/* No */}
                          <td className="py-1.5 px-1.5 text-center font-sans text-slate-600 border-r border-slate-200">
                            {idx + 1}
                          </td>

                          {/* Nama */}
                          <td className="py-1.5 px-2 font-sans border-r border-slate-200">
                            <span className="font-bold text-slate-900 uppercase block whitespace-nowrap">
                              {r.name}
                            </span>
                            {r.id_absen && (
                              <span className="text-[8px] text-slate-500 font-mono">
                                ID: {r.id_absen}
                              </span>
                            )}
                          </td>

                          {/* Divisi */}
                          <td className="py-1.5 px-1.5 font-sans text-slate-700 font-semibold border-r border-slate-200 whitespace-nowrap text-[9px]">
                            {r.department}
                          </td>

                          {/* Bisnis (hari) */}
                          <td className="py-1.5 px-1 text-center font-bold text-slate-800 border-r border-slate-200">
                            {r.business_trip_days ?? 0}
                          </td>

                          {/* Bengkel (hari) */}
                          <td className="py-1.5 px-1 text-center font-bold text-slate-800 border-r border-slate-200">
                            {r.workshop_days ?? 0}
                          </td>

                          {/* Cuti (hari) */}
                          <td className="py-1.5 px-1 text-center font-bold text-slate-600 border-r border-slate-200">
                            {r.leave_days ?? 0}
                          </td>

                          {/* Tarif Pokok */}
                          <td className="py-1.5 px-1.5 text-right text-slate-600 border-r border-slate-200 whitespace-nowrap">
                            {formatNumberComma(r.rate_daily_salary)}
                          </td>

                          {/* Tarif Perjalanan */}
                          <td className="py-1.5 px-1.5 text-right text-slate-600 border-r border-slate-200 whitespace-nowrap">
                            {formatNumberComma(r.rate_trip_allowance)}
                          </td>

                          {/* Gaji Pokok */}
                          <td className="py-1.5 px-1.5 text-right font-semibold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                            {formatNumberComma(r.base_salary)}
                          </td>

                          {/* Tunjangan Perjalanan */}
                          <td className="py-1.5 px-1.5 text-right font-semibold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                            {formatNumberComma(r.trip_allowance_total)}
                          </td>

                          {/* Subtotal Gaji */}
                          <td className="py-1.5 px-1.5 text-right font-bold text-blue-900 border-r border-slate-200 whitespace-nowrap">
                            {formatNumberComma(r.salary_subtotal)}
                          </td>

                          {/* Catatan / Nominal Tambahan */}
                          <td className="py-1.5 px-1.5 text-left border-r border-slate-200 font-sans">
                            {r.extra_income_amount > 0 || r.extra_income_notes ? (
                              <div>
                                {r.extra_income_notes && (
                                  <span className="block text-[8px] uppercase text-slate-600 leading-tight">
                                    {r.extra_income_notes}
                                  </span>
                                )}
                                <span className="font-mono text-emerald-700 font-bold text-[9px]">
                                  +{formatNumberComma(r.extra_income_amount)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono">-</span>
                            )}
                          </td>

                          {/* Penghasilan Bersih */}
                          <td className="py-1.5 px-2 text-right font-black text-slate-950 bg-slate-100/70 whitespace-nowrap">
                            Rp{formatNumberComma(r.net_income)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                  {/* Footer Total Keseluruhan */}
                  {filteredRecords.length > 0 && (
                    <tfoot className="border-t-2 border-slate-400 bg-slate-200/90 font-mono text-[10px] font-bold text-slate-900">
                      <tr>
                        <td colSpan="3" className="py-2 px-2 text-left font-sans uppercase font-black border-r border-slate-300">
                          Total ({totalEmployees} Karyawan)
                        </td>
                        <td className="py-2 px-1 text-center border-r border-slate-300 font-black">
                          {totalTripDays}
                        </td>
                        <td className="py-2 px-1 text-center border-r border-slate-300 font-black">
                          {totalWorkshopDays}
                        </td>
                        <td className="py-2 px-1 text-center border-r border-slate-300 font-black">
                          {totalLeaveDays}
                        </td>
                        <td className="py-2 px-1 text-center border-r border-slate-300 text-slate-400 font-sans">-</td>
                        <td className="py-2 px-1 text-center border-r border-slate-300 text-slate-400 font-sans">-</td>
                        <td className="py-2 px-1.5 text-right border-r border-slate-300 whitespace-nowrap">
                          {formatNumberComma(totalBaseSalary)}
                        </td>
                        <td className="py-2 px-1.5 text-right border-r border-slate-300 whitespace-nowrap">
                          {formatNumberComma(totalTripAllowance)}
                        </td>
                        <td className="py-2 px-1.5 text-right border-r border-slate-300 font-black text-blue-900 whitespace-nowrap">
                          {formatNumberComma(totalSalarySubtotal)}
                        </td>
                        <td className="py-2 px-1.5 text-right border-r border-slate-300 text-emerald-800 font-black whitespace-nowrap">
                          {totalExtraIncome > 0 ? `+${formatNumberComma(totalExtraIncome)}` : '-'}
                        </td>
                        <td className="py-2 px-2 text-right font-black text-slate-950 bg-slate-300 text-[11px] whitespace-nowrap">
                          Rp{formatNumberComma(totalNetSalary)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* 5. Tanda Tangan Pengesahan (2 Kolom) */}
              <div className="grid grid-cols-2 gap-12 text-xs mt-6 mb-6">
                {/* Kiri: Dibuat oleh (Administrasi) */}
                <div>
                  <p className="text-slate-700 font-medium mb-1">Karanganyar, {todayStr}</p>
                  <p className="font-semibold text-slate-800 mb-1">Dibuat oleh,</p>
                  <div className="h-16 flex items-center">
                    {/* Ruang tanda tangan Administrasi */}
                  </div>
                  <p className="font-bold text-slate-950 uppercase tracking-wide mt-1">
                    ( ADMINISTRASI )
                  </p>
                </div>

                {/* Kanan: Disetujui oleh (Direktur) */}
                <div className="text-right">
                  <p className="text-transparent mb-1 select-none pointer-events-none">&nbsp;</p>
                  <p className="font-semibold text-slate-800 mb-1">Disetujui oleh,</p>
                  <div className="h-16 flex items-center justify-end">
                    <img
                      src="https://atekatehnik.com/wp/uploads/asset_6acd5d6b506ee2.49528031.png"
                      alt="Tanda Tangan Direktur"
                      className="h-16 w-auto max-w-[160px] object-contain -mr-2"
                    />
                  </div>
                  <p className="font-bold text-slate-950 uppercase tracking-wide mt-1">
                    ( DIREKTUR )
                  </p>
                </div>
              </div>

              {/* 6. Footer Cetak */}
              <div className="border-t border-slate-200 pt-2 text-slate-500 text-[9px] flex justify-between items-center italic">
                <span>
                  Dicetak dari Sistem Rekapitulasi Penggajian CV Ateka Tehnik pada {todayStr}.
                </span>
                <span>Dokumen Sah &bull; Rahasia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SalaryReportModal;
