import React from 'react';

export const HeaderKop = ({ companyProfile }) => (
  <div className="border-b-4 border-blue-900 pb-4 mb-6 pt-10 px-10">
    <div className="flex justify-between items-end">
      <div className="flex items-center gap-4">
        {companyProfile?.logo_url && (
          <img src={companyProfile.logo_url} alt="Logo" className="h-16 object-contain" />
        )}
        <div>
          <h1 className="text-3xl font-black text-blue-950 uppercase tracking-tighter">{companyProfile?.company_name || 'CV. ATEKA TEHNIK'}</h1>
          <p className="text-sm font-bold text-orange-500 tracking-widest uppercase">{companyProfile?.tagline || 'Rice Milling Unit Solution'}</p>
          <p className="text-[9px] font-bold text-blue-900 tracking-wider uppercase mt-1 opacity-80">{companyProfile?.services || 'ELEVATOR, HULLER, POLISHER, DRYER, HAMMERMILL, SERVICE, SPAREPART'}</p>
        </div>
      </div>
      <div className="text-right text-[10px] text-slate-600 flex flex-col items-end leading-tight">
        <p className="max-w-[220px] whitespace-pre-wrap leading-snug mb-0.5">{companyProfile?.address || 'Jl. Raya Madiun - Ngawi Km 12'}</p>
        <p>Telp/WA: {companyProfile?.phone || '0812-3456-7890'}</p>
        <p>Email: {companyProfile?.email || 'admin@atekatehnik.com'}</p>
        <p>Website: atekatehnik.com</p>
      </div>
    </div>
  </div>
);

export const SimpleHeaderKop = ({ companyProfile }) => (
  <div className="border-b border-slate-300 pb-2 mb-4 pt-8 px-10 flex justify-between items-end">
    <div className="flex items-center gap-3">
      {companyProfile?.logo_url && (
        <img src={companyProfile.logo_url} alt="Logo" className="h-8 object-contain" />
      )}
      <div>
        <h1 className="text-xl font-black text-blue-950 uppercase tracking-tighter leading-none">{companyProfile?.company_name || 'CV. ATEKA TEHNIK'}</h1>
        <p className="text-[9px] font-bold text-orange-500 tracking-widest uppercase mt-0.5">{companyProfile?.tagline || 'Rice Milling Unit Solution'}</p>
      </div>
    </div>
    <div className="text-right text-[9px] text-slate-500 font-medium flex flex-col items-end">
      <p className="whitespace-pre-wrap leading-tight max-w-[250px]">{companyProfile?.address || 'Jl. Raya Madiun - Ngawi Km 12'}</p>
      <p className="mt-0.5">Telp/WA: {companyProfile?.phone || '0812-3456-7890'} | Email: {companyProfile?.email || 'admin@atekatehnik.com'}</p>
    </div>
  </div>
);

/**
 * Wrapper for every paginated block. `flow-root` contains child margins so the measured
 * height equals the space the block really occupies on the page.
 */
export const Block = ({ measureId, className = '', children }) => (
  <div className="flow-root" data-measure={measureId}>
    <div className={className}>{children}</div>
  </div>
);

export const PageFrame = ({ header, paperHeight, pageNumber, totalPages, quotationNumber, children }) => (
  <div
    className="a4-page bg-white w-[210mm] mx-auto mb-8 shadow-xl relative overflow-hidden flex flex-col"
    style={{ height: paperHeight }}
  >
    <div className="flow-root shrink-0">{header}</div>
    <div className="px-10 flex-1 min-h-0">{children}</div>
    <div className="absolute bottom-5 right-10 text-[9px] text-slate-400">
      {quotationNumber ? `${quotationNumber} | ` : ''}Halaman {pageNumber} dari {totalPages}
    </div>
  </div>
);
