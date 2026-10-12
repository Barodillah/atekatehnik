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
    window.print();
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container */}
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Modal Toolbar - Hidden during print */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 print:hidden">
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
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
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
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-100/70 print:p-0 print:bg-white print:overflow-visible">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-payslip, #printable-payslip * {
                visibility: visible;
              }
              #printable-payslip {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
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
