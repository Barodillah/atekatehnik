import React from 'react';
import { formatNumber, formatRupiah, terbilang } from './utils';

export const RabHeader = ({ quotationNumber }) => (
  <div className="flex justify-between items-center border-b-2 border-slate-200 pb-3 mb-3">
    <div>
      <h2 className="font-black text-blue-950 uppercase">Rincian Anggaran Biaya (RAB)</h2>
      <p className="text-xs text-slate-500">Lampiran Penawaran No: {quotationNumber}</p>
    </div>
    <div className="text-right">
      <span className="text-2xl font-black text-slate-200 opacity-50 uppercase tracking-tighter">Ateka Tehnik</span>
    </div>
  </div>
);

/**
 * Table container for a run of rows on one page; the header is repeated on every page.
 * `table-fixed` keeps column widths independent of content so measured row heights match.
 */
export const RabTable = ({ measureId, children, showSummaryNote }) => (
  <div className="flow-root" data-measure={measureId}>
    <div className="pb-4">
      <table className="w-full table-fixed text-xs text-left border border-slate-800">
        <thead>
          <tr className="bg-slate-800 text-white font-bold">
            <th className="p-2 border-r border-slate-700 w-10 text-center">NO</th>
            <th className="p-2 border-r border-slate-700">URAIAN / SPESIFIKASI</th>
            <th className="p-2 border-r border-slate-700 w-12 text-center">QTY</th>
            <th className="p-2 border-r border-slate-700 w-16 text-center">SATUAN</th>
            <th className="p-2 border-r border-slate-700 w-28 text-right">HARGA SATUAN</th>
            <th className="p-2 w-32 text-right">JUMLAH (Rp)</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {showSummaryNote && (
        <div className="mt-2 text-[10px] text-right text-slate-500 italic">
          * Rincian Subtotal hingga Grand Total dilanjutkan pada lembar berikutnya
        </div>
      )}
    </div>
  </div>
);

export const RabTableRow = ({ item, number, measureId }) => (
  <tr className="border-b border-slate-300" data-measure={measureId}>
    <td className="p-2 border-r border-slate-300 text-center">{number}</td>
    <td className="p-2 border-r border-slate-300 font-medium break-words">{item.name}</td>
    <td className="p-2 border-r border-slate-300 text-center">{item.qty}</td>
    <td className="p-2 border-r border-slate-300 text-center break-words">{item.unit}</td>
    <td className="p-2 border-r border-slate-300 text-right">{formatNumber(item.price)}</td>
    <td className="p-2 text-right font-bold bg-slate-50">{formatNumber(item.qty * item.price)}</td>
  </tr>
);

export const SummaryBlock = ({ q, subtotalItems, dpp, tax, grandTotal }) => (
  <>
    {/* Subtotals & Grand Total */}
    <div className="flex justify-end mb-8">
      <div className="w-72 space-y-1 text-xs">
        <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
          <span>Subtotal Biaya Mesin:</span>
          <span className="font-bold">{formatRupiah(subtotalItems)}</span>
        </div>
        {q.install_fee > 0 && (
          <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
            <span>Biaya Instalasi &amp; Jasa:</span>
            <span className="font-bold">{formatRupiah(q.install_fee)}</span>
          </div>
        )}
        {q.shipping_fee > 0 && (
          <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
            <span>Biaya Ekspedisi:</span>
            <span className="font-bold">{formatRupiah(q.shipping_fee)}</span>
          </div>
        )}
        {q.discount > 0 && (
          <div className="flex justify-between border-b border-dashed border-slate-300 pb-1 text-red-600">
            <span>Diskon Khusus:</span>
            <span className="font-bold">({formatRupiah(q.discount)})</span>
          </div>
        )}

        <div className="flex justify-between pt-1">
          <span>Dasar Pengenaan Pajak:</span>
          <span className="font-bold">{formatRupiah(dpp)}</span>
        </div>
        {q.use_tax && (
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span>PPN (11%):</span>
            <span className="font-bold">{formatRupiah(tax)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 text-sm text-blue-900">
          <span className="font-black">GRAND TOTAL:</span>
          <span className="font-black">{formatRupiah(grandTotal)}</span>
        </div>
      </div>
    </div>

    {/* Terbilang */}
    <div className="bg-slate-100 p-2 text-xs italic font-semibold text-slate-700 text-center mb-8 border border-slate-200">
      Terbilang: {terbilang(grandTotal).trim()} Rupiah
    </div>
  </>
);

/** Syarat & Ketentuan + Pengesahan — always kept together on one page. */
export const TermsSignatureBlock = ({ q, companyProfile, edit }) => {
  const isEditing = !!edit?.editStates.terms;
  return (
    <>
      {/* T&C */}
      <div className="mb-8">
        <div className="flex justify-between items-end border-b border-slate-800 pb-1 mb-2">
          <h3 className="font-bold text-xs uppercase m-0 p-0 leading-none">Syarat &amp; Ketentuan (Terms &amp; Conditions)</h3>
          <span className="text-[9px] text-slate-500 font-medium leading-none tracking-wider">{q.quotation_number}</span>
        </div>
        {isEditing ? (
          <div onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) edit.cancelEdit('terms'); }}>
            <textarea
              className="w-full text-[10px] text-slate-700 p-2 border-2 border-blue-400 rounded outline-none min-h-[150px] leading-relaxed resize-y font-mono mb-1"
              value={edit.editValues.terms}
              onChange={(e) => { const v = e.target.value; edit.setEditValues((prev) => ({ ...prev, terms: v })); }}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => edit.saveEdit('terms', 'terms')} className="no-print bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded">Simpan</button>
            </div>
          </div>
        ) : (
          <div
            onDoubleClick={() => edit?.startEdit('terms', q.terms)}
            className="text-[10px] text-slate-700 whitespace-pre-wrap font-mono transition-colors hover:bg-slate-50 cursor-pointer rounded p-1"
            title="Klik 2x untuk edit teks"
          >
            {q.terms || <span className="text-slate-400 italic">Klik 2x untuk menambah Syarat &amp; Ketentuan...</span>}
          </div>
        )}
      </div>

      {/* Pengesahan */}
      <div className="flex justify-between mt-12 text-sm">
        <div className="text-center w-48">
          <p className="mb-16">Menyetujui / Pemesan,</p>
          <p className="font-bold border-b border-slate-800 pb-1">{q.customer.customer_name}</p>
          <p className="text-xs text-slate-500">Pimpinan {q.customer.company_name}</p>
        </div>
        <div className="text-center w-48 relative">
          <p className="mb-1">Karanganyar, {q.quotation_date_fmt}</p>
          <p className="font-bold mb-1">{companyProfile?.company_name || 'CV. ATEKA TEHNIK'}</p>

          <div className="h-16 relative flex items-center justify-center">
            {companyProfile?.stamp_image_url && (
              <img
                src={companyProfile.stamp_image_url}
                alt="Stamp"
                className="h-28 max-w-none absolute opacity-75 z-0 mix-blend-multiply pointer-events-none"
                style={{ top: '-1.25rem' }}
              />
            )}
            {!companyProfile?.stamp_image_url && (
              <div className="h-16"></div>
            )}
          </div>

          <p className="font-bold border-b border-slate-800 pb-1 mt-1">{companyProfile?.signatory_name || 'WARSITO'}</p>
          <p className="text-xs text-slate-500">{companyProfile?.signatory_title || 'Pimpinan'}</p>
        </div>
      </div>
    </>
  );
};
