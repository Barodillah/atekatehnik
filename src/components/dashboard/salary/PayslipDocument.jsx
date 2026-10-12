import React from 'react';
import { formatNumberComma } from '../../../services/salaryStorage';

/**
 * PayslipDocument renders the exact payslip layout based on the user's reference image:
 * - ATEKA TEHNIK / SLIP GAJI KARYAWAN (Dark Blue Header)
 * - Pilih Karyawan (Yellow accent badge)
 * - INFORMASI KARYAWAN (Blue section bar & table)
 * - RINCIAN HARI & TARIF (Blue section bar & table)
 * - RINCIAN GAJI (Blue section bar & table)
 * - PENGHASILAN BERSIH (Dark blue bar with total)
 * - Signatures: Dibuat oleh (DIREKTUR) & Diterima oleh
 * - Footer notice
 */
const PayslipDocument = ({
  record,
  period,
  showSelectorLabel = true,
  className = '',
}) => {
  if (!record) return null;

  const empName = record.name || '';
  const department = record.department || '';
  const periodLabel = period?.period_name || record.period_name || 'OKTOBER 2026 - Minggu ke 2';

  const workshopDays = Number(record.workshop_days) || 0;
  const businessTripDays = Number(record.business_trip_days) || 0;
  const leaveDays = Number(record.leave_days) || 0;

  const rateDailySalary = Number(record.rate_daily_salary) || 0;
  const rateTripAllowance = Number(record.rate_trip_allowance) || 0;

  const baseSalary = Number(record.base_salary) || 0;
  const tripAllowanceTotal = Number(record.trip_allowance_total) || 0;
  const salarySubtotal = Number(record.salary_subtotal) || 0;

  const extraIncomeNotes = record.extra_income_notes || '';
  const extraIncomeAmount = Number(record.extra_income_amount) || 0;
  const netIncome = Number(record.net_income) || 0;

  return (
    <div
      className={`bg-white text-slate-900 font-sans p-6 sm:p-8 max-w-[850px] mx-auto shadow-md border border-slate-200 select-none print:shadow-none print:border-none print:p-6 print:m-0 print:max-w-none ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* 1. Header Box (Dark Blue) */}
      <div
        className="text-white text-center py-3.5 px-4 mb-4"
        style={{ backgroundColor: '#112d61' }}
      >
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider m-0 leading-tight">
          ATEKA TEHNIK
        </h1>
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest mt-1 opacity-95">
          SLIP GAJI KARYAWAN
        </p>
      </div>



      {/* 3. Section: INFORMASI KARYAWAN */}
      <div className="mb-4">
        <div
          className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-3 py-1.5"
          style={{ backgroundColor: '#2563eb' }}
        >
          INFORMASI KARYAWAN
        </div>
        <table className="w-full text-xs sm:text-sm border-collapse">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800 w-1/2 sm:w-2/5">
                Nama Karyawan
              </td>
              <td className="py-1.5 px-3 font-bold text-slate-950 uppercase">{empName}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800">Departemen</td>
              <td className="py-1.5 px-3 font-bold text-slate-950 uppercase">{department}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800">Periode</td>
              <td className="py-1.5 px-3 font-bold text-slate-950 uppercase">{periodLabel}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Section: RINCIAN HARI & TARIF */}
      <div className="mb-4">
        <div
          className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-3 py-1.5"
          style={{ backgroundColor: '#2563eb' }}
        >
          RINCIAN HARI &amp; TARIF
        </div>
        <table className="w-full text-xs sm:text-sm border-collapse">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800 w-1/2 sm:w-2/5">
                Perjalanan Bisnis (hari)
              </td>
              <td className="py-1.5 px-3 font-mono text-slate-950">
                {businessTripDays > 0 ? businessTripDays : ''}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800">Hadir Bengkel (hari)</td>
              <td className="py-1.5 px-3 font-mono text-slate-950">
                {workshopDays > 0 ? workshopDays : '0'}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800">Cuti (hari)</td>
              <td className="py-1.5 px-3 font-mono text-slate-950">
                {leaveDays > 0 ? leaveDays : ''}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800">Tarif Gaji Pokok (Rp)</td>
              <td className="py-1.5 px-3 font-mono text-slate-950">
                {formatNumberComma(rateDailySalary)}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800">
                Tarif Tunjangan Luar Kota (Rp)
              </td>
              <td className="py-1.5 px-3 font-mono text-slate-950">
                {formatNumberComma(rateTripAllowance)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Section: RINCIAN GAJI */}
      <div className="mb-4">
        <div
          className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-3 py-1.5"
          style={{ backgroundColor: '#2563eb' }}
        >
          RINCIAN GAJI
        </div>
        <table className="w-full text-xs sm:text-sm border-collapse">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800 w-1/2 sm:w-2/5">
                Gaji Pokok (Rp)
              </td>
              <td className="py-1.5 px-3 font-mono text-slate-950">
                {formatNumberComma(baseSalary)}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800">
                Tunjangan Luar Kota (Rp)
              </td>
              <td className="py-1.5 px-3 font-mono text-slate-950">
                {formatNumberComma(tripAllowanceTotal)}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800">Subtotal Gaji (Rp)</td>
              <td className="py-1.5 px-3 font-mono text-slate-950">
                {formatNumberComma(salarySubtotal)}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800">Catatan Tambahan</td>
              <td className="py-1.5 px-3 font-sans font-bold text-slate-950 uppercase">
                {extraIncomeNotes || '-'}
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 font-semibold text-slate-800">Nominal Tambahan (Rp)</td>
              <td className="py-1.5 px-3 font-mono text-slate-950">
                {formatNumberComma(extraIncomeAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. Total Box: PENGHASILAN BERSIH */}
      <div
        className="text-white py-2.5 px-4 mb-8 flex items-center justify-between"
        style={{ backgroundColor: '#112d61' }}
      >
        <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
          PENGHASILAN BERSIH
        </span>
        <span className="text-sm sm:text-base font-black font-mono tracking-tight">
          Rp{formatNumberComma(netIncome)}
        </span>
      </div>

      {/* 7. Signatures Row */}
      <div className="grid grid-cols-2 gap-8 text-xs sm:text-sm mt-6 mb-8">
        {/* Left: Dibuat oleh */}
        <div>
          <p className="font-semibold text-slate-800 mb-1">Dibuat oleh,</p>
          <div className="h-16 flex items-center">
            {/* SVG Signature of Director */}
            <svg
              viewBox="0 0 160 70"
              className="h-14 w-32 object-contain"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 18 55 C 24 28, 30 10, 36 8 C 42 6, 44 26, 47 52 M 25 38 C 42 34, 52 30, 62 28 C 68 26, 75 42, 80 40 C 86 38, 92 24, 98 36 C 104 48, 110 38, 118 36 C 124 34, 132 38, 138 34 M 18 56 C 52 52, 90 56, 136 46"
                stroke="#0f172a"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-bold text-slate-950 uppercase tracking-wide">( DIREKTUR )</p>
        </div>

        {/* Right: Diterima oleh */}
        <div>
          <p className="font-semibold text-slate-800 mb-1">Diterima oleh,</p>
          <div className="h-16"></div>
          <p className="font-bold text-slate-950 uppercase tracking-wide">{empName}</p>
        </div>
      </div>

      {/* 8. Bottom Notice */}
      <div className="pt-2 text-left">
        <p className="text-[10px] sm:text-[11px] text-slate-500 italic">
          Apabila terdapat kesalahan input gaji mohon di laporkan secara terang terangan ke pihak CV
          Ateka Tehnik!!!!!
        </p>
      </div>
    </div>
  );
};

export default PayslipDocument;
