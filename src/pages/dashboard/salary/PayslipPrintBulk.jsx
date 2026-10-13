import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import {
  getPeriodById,
  getPeriodRecords,
} from '../../../services/salaryStorage';
import salaryApi from '../../../services/salaryApi';
import PayslipDocument from '../../../components/dashboard/salary/PayslipDocument';

const PayslipPrintBulk = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [period, setPeriod] = useState(null);
  const [records, setRecords] = useState([]);

  const isDraft = (period?.status || 'Draft').toLowerCase() === 'draft';

  useEffect(() => {
    const p = getPeriodById(id);
    if (p) {
      setPeriod(p);
      const recs = getPeriodRecords(id);
      setRecords(recs);
    }
    Promise.all([
      salaryApi.getPeriodById(id),
      salaryApi.getPeriodRecords(id),
    ]).then(([freshP, freshRecs]) => {
      if (freshP) setPeriod(freshP);
      if (freshRecs && freshRecs.length > 0) setRecords(freshRecs);
    }).catch(() => {});
  }, [id]);

  const handlePrint = () => {
    if (isDraft) {
      addToast(
        'Tidak dapat mencetak slip! Status periode masih Draft. Ubah status periode ke "Published" atau "Paid" terlebih dahulu.',
        'warning'
      );
      return;
    }
    window.print();
  };

  if (!period) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Periode tidak ditemukan.</p>
        <button
          onClick={() => navigate('/admin/salary/periods')}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded text-sm"
        >
          Kembali ke Daftar Periode
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:text-black print:min-h-0 print:h-auto">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/salary/periods/${id}`)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <div className="text-left">
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Cetak Slip Gaji Masal
            </h1>
            <p className="text-xs text-orange-600 font-medium">
              {period.period_name} ({records.length} Karyawan)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDraft ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-xs font-bold shadow-2xs">
                <span className="material-symbols-outlined text-sm">lock</span>
                Mode Preview (Status: Draft)
              </span>
              <button
                onClick={() => {
                  addToast(
                    'Tidak dapat mencetak slip! Status periode masih Draft. Ubah status periode ke "Published" atau "Paid" terlebih dahulu untuk membuka izin cetak.',
                    'warning'
                  );
                }}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-500 rounded-lg font-bold text-xs uppercase tracking-wider border border-slate-300 flex items-center gap-2 cursor-not-allowed transition-colors"
                title="Cetak terkunci karena status periode masih Draft"
              >
                <span className="material-symbols-outlined text-base">lock</span>
                <span>Cetak Terkunci (Draft)</span>
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500 hidden sm:block">
                * Setiap slip gaji otomatis terbagi ke halaman baru
              </p>
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                <span>Cetak ({records.length} Slip)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Printable Pages Container */}
      <div className="p-4 sm:p-8 space-y-8 print:p-0 print:space-y-0 print:m-0 print:h-auto print:min-h-0">
        <style>{`
          @media print {
            html, body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            .bulk-payslip-item {
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .bulk-payslip-item:not(:last-child) {
              page-break-after: always !important;
              break-after: page !important;
            }
            .bulk-payslip-item:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
              margin-bottom: 0 !important;
              padding-bottom: 0 !important;
            }
          }
        `}</style>

        {records.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Tidak ada data karyawan dalam periode ini.
          </div>
        ) : (
          records.map((record, index) => (
            <div
              key={record.id}
              className="bulk-payslip-item pb-8 print:pb-0"
            >
              <div className="text-xs text-slate-500 mb-2 font-mono print:hidden text-center">
                Slip #{index + 1} dari {records.length} &bull; {record.name}
              </div>
              <PayslipDocument
                record={record}
                period={period}
                showSelectorLabel={true}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PayslipPrintBulk;
