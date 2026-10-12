import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PayslipDocument from './PayslipDocument';

const PayslipSingleModal = ({
  isOpen,
  onClose,
  record,
  period,
  allRecords = [],
  onSelectRecord,
}) => {
  const [currentRecord, setCurrentRecord] = useState(record);

  useEffect(() => {
    setCurrentRecord(record);
  }, [record]);

  if (!isOpen || !currentRecord) return null;

  const handlePrint = () => {
    const printEl = document.getElementById('printable-payslip');
    if (!printEl) {
      window.print();
      return;
    }

    // Gunakan invisible iframe agar cetak slip bersih tanpa terpotong layout modal / dashboard
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

    // Salin seluruh CSS (Tailwind & style tag) ke dalam iframe
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
          <title>Slip Gaji - ${currentRecord.name || 'Karyawan'}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
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
              max-width: 850px;
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

    // Beri jeda agar browser memuat asset gambar (tanda tangan & watermark) sebelum dialog print muncul
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

  const handleEmployeeChange = (e) => {
    const selectedId = e.target.value;
    const found = allRecords.find((r) => r.id === selectedId);
    if (found) {
      setCurrentRecord(found);
      if (onSelectRecord) onSelectRecord(found);
    }
  };

  return createPortal(
    <div className="single-payslip-backdrop fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      {/* Container */}
      <div className="single-payslip-card bg-white border border-slate-200 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Toolbar - Hidden during print */}
        <div className="single-payslip-toolbar px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-600 text-xl">receipt_long</span>
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Preview Slip Gaji
            </span>
          </div>

          {/* Quick Dropdown to Switch Employee if multiple */}
          {allRecords.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Pilih Karyawan:</span>
              <select
                value={currentRecord.id}
                onChange={handleEmployeeChange}
                className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 px-3 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {allRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {r.department}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Cetak Slip</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Modal Content / Printable Area */}
        <div className="single-payslip-content p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-100/70">
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
                size: A4 portrait;
                margin: 8mm;
              }
              .single-payslip-backdrop {
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
              .single-payslip-card {
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
              .single-payslip-toolbar {
                display: none !important;
              }
              .single-payslip-content {
                padding: 0 !important;
                margin: 0 !important;
                background: white !important;
                overflow: visible !important;
                display: block !important;
                width: 100% !important;
              }
              #printable-payslip {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                display: block !important;
              }
            }
          `}</style>
          <div id="printable-payslip">
            <PayslipDocument
              record={currentRecord}
              period={period}
              showSelectorLabel={true}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PayslipSingleModal;
