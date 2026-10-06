import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../contexts/ToastContext';
import { defaultTerms } from './mockRabData';
import { PAPER_SIZES, mmToPx } from './preview/utils';
import { paginate, groupRuns, useBlockHeights } from './preview/pagination';
import { HeaderKop, SimpleHeaderKop, Block, PageFrame } from './preview/Layout';
import { CoverIntro, CoverSection, CoverItemRow, InvestAdvantages } from './preview/CoverBlocks';
import { RabHeader, RabTable, RabTableRow, SummaryBlock, TermsSignatureBlock } from './preview/DetailBlocks';

/** Space kept free at the bottom of every page for the page number footer. */
const BOTTOM_RESERVE_MM = 12;
/** Extra tolerance for screen vs print rendering differences. */
const SAFETY_MM = 3;

const RabDocumentPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [companyProfile, setCompanyProfile] = useState(null);

  const { authFetch } = useAuth();
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paperSize, setPaperSize] = useState('A4');
  const [measureRef, heights] = useBlockHeights();

  const [isEditingAdvantages, setIsEditingAdvantages] = useState(false);
  const [advantagesText, setAdvantagesText] = useState('');

  // Load from local storage or default text when quotationDetails changes
  useEffect(() => {
    if (quotationDetails) {
      const saved = localStorage.getItem(`rab_preview_advantages_${id}`);
      if (saved !== null) {
        setAdvantagesText(saved);
      } else {
        setAdvantagesText(`Efisiensi tenaga kerja dengan alur sistem vertikal otomatis yang terintegrasi.\nTingkat rendemen optimal dengan meminimalkan beras patah pada proses poles.\nKomponen mesin berkualitas industri untuk durabilitas dan pemakaian jangka panjang.`);
      }
    }
  }, [id, quotationDetails]);

  const handleSaveAdvantages = () => {
    localStorage.setItem(`rab_preview_advantages_${id}`, advantagesText);
    setIsEditingAdvantages(false);
  };

  const [editStates, setEditStates] = useState({
    title: false,
    coverTitle: false,
    coverDescription: false,
    coverAdvantages: false,
    terms: false
  });
  
  const [editValues, setEditValues] = useState({
    title: '',
    coverTitle: '',
    coverDescription: '',
    coverAdvantagesArray: [],
    terms: ''
  });

  const startEdit = (field, currentValue) => {
    if (field === 'coverAdvantages') {
      let arr = [];
      if (Array.isArray(currentValue)) arr = [...currentValue];
      else if (typeof currentValue === 'string') arr = currentValue.split('\\n');
      arr = arr.filter(v => typeof v === 'string' && v.trim() !== '');
      if (arr.length === 0) arr = [''];
      setEditValues(prev => ({ ...prev, coverAdvantagesArray: arr }));
    } else {
      setEditValues(prev => ({ ...prev, [field]: currentValue }));
    }
    setEditStates(prev => ({ ...prev, [field]: true }));
  };

  const cancelEdit = (field) => {
    setEditStates(prev => ({ ...prev, [field]: false }));
  };

  const handleSaveToDB = async (updates) => {
    try {
      const payload = {
        is_template: quotationDetails.is_template,
        template_name: quotationDetails.template_name,
        lead_id: quotationDetails.lead_id,
        quotation_number: quotationDetails.quotation_number,
        title: updates.title !== undefined ? updates.title : quotationDetails.title,
        capacity_label: quotationDetails.capacity_label,
        quotation_date: quotationDetails.quotation_date,
        valid_until: quotationDetails.valid_until,
        cover_title: updates.coverTitle !== undefined ? updates.coverTitle : quotationDetails.coverTitle,
        cover_description: updates.coverDescription !== undefined ? updates.coverDescription : quotationDetails.coverDescription,
        cover_advantages: updates.coverAdvantages !== undefined ? updates.coverAdvantages : quotationDetails.coverAdvantages,
        cover_image_url: quotationDetails.cover_image_url,
        subtotal: quotationDetails.subtotal,
        installation_fee: quotationDetails.installation_fee,
        shipping_fee: quotationDetails.shipping_fee,
        discount_amount: quotationDetails.discount_amount,
        use_tax: quotationDetails.use_tax ? 1 : 0,
        tax_amount: quotationDetails.tax_amount,
        grand_total: quotationDetails.grand_total,
        terms_conditions: updates.terms !== undefined ? updates.terms : quotationDetails.terms,
        status: quotationDetails.status,
        items: quotationDetails.items.map(i => ({
          item_id: i.item_id,
          name: i.name,
          specifications: i.specifications,
          description: i.desc,
          image_url: i.image_url,
          qty: i.qty,
          unit: i.unit,
          price: i.price,
          showOnCover: i.showOnCover ? 1 : 0
        }))
      };

      const res = await authFetch(`/api/quotations.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setQuotationDetails(prev => ({ ...prev, ...updates }));
        addToast('Data berhasil disimpan', 'success');
      } else {
        addToast("Gagal menyimpan: " + (data.error || data.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      console.error(err);
      addToast("Terjadi kesalahan saat menyimpan data.", 'error');
    }
  };

  const saveEdit = (field, updateKey) => {
    let finalValue = editValues[field];
    if (field === 'coverAdvantages') {
      finalValue = editValues.coverAdvantagesArray.map(l => l.trim()).filter(l => l !== '');
      updateKey = 'coverAdvantages';
    }
    
    handleSaveToDB({ [updateKey]: finalValue });
    setEditStates(prev => ({ ...prev, [field]: false }));
  };

  const handleUpdateStatus = async (newStatus) => {
    // Validation before moving to 'sent'
    if (newStatus === 'sent') {
      const missingFields = [];
      if (!quotationDetails.lead_id) missingFields.push('Klien (Lead)');
      if (!quotationDetails.title || !quotationDetails.title.trim()) missingFields.push('Judul Penawaran');
      if (!quotationDetails.quotation_date) missingFields.push('Tanggal Penawaran');
      if (!quotationDetails.valid_until) missingFields.push('Berlaku Sampai');

      if (missingFields.length > 0) {
        addToast(`Gagal: Harap lengkapi field berikut sebelum mengirim: ${missingFields.join(', ')}`, 'warning');
        return;
      }

      if (!quotationDetails.items || quotationDetails.items.length === 0) {
        addToast(`Gagal: Minimal harus ada 1 item di rincian.`, 'warning');
        return;
      }

      // Check if at least 1 item is completely filled
      const hasCompleteItem = quotationDetails.items.some(item => 
        item.name && item.name.trim() !== '' && 
        parseFloat(item.qty) > 0 && 
        parseFloat(item.price) > 0
      );

      if (!hasCompleteItem) {
        addToast(`Gagal: Minimal 1 item harus diisi lengkap (Nama, Qty > 0, Harga > 0).`, 'warning');
        return;
      }
    }

    try {
      const res = await authFetch(`/api/quotations.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quotationDetails, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setQuotationDetails(prev => ({ ...prev, status: newStatus }));
        addToast(`Status RAB berhasil diperbarui ke ${newStatus.toUpperCase()}`, 'success');
      } else {
        addToast("Gagal memperbarui status: " + (data.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      console.error(err);
      addToast("Terjadi kesalahan koneksi.", 'error');
    }
  };

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await authFetch(`/api/quotations.php?id=${id}`);
        const data = await res.json();
        if (data.success && data.quotation) {
          
          // Format some dates
          const qDate = data.quotation.quotation_date ? new Date(data.quotation.quotation_date) : new Date();
          const vDate = data.quotation.valid_until ? new Date(data.quotation.valid_until) : new Date();
          
          let advantages = [];
          if (Array.isArray(data.quotation.cover_advantages)) {
            advantages = data.quotation.cover_advantages;
          } else if (typeof data.quotation.cover_advantages === 'string') {
            try {
              advantages = data.quotation.cover_advantages ? JSON.parse(data.quotation.cover_advantages) : [];
            } catch(e) {}
          }

          const formattedQuotation = {
            ...data.quotation,
            quotation_date_fmt: qDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            valid_until_fmt: vDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            coverImage: data.quotation.cover_image_url || '',
            coverTitle: data.quotation.cover_title || 'Sistem Komplit (Complete Set)',
            coverDescription: data.quotation.cover_description || '',
            customer: {
              customer_name: data.quotation.lead_name || 'Kepada Yth.',
              company_name: data.quotation.lead_company || '',
              location: data.quotation.lead_location || '',
              phone: data.quotation.lead_phone || ''
            },
            items: (data.quotation.items || []).map(item => ({
              ...item,
              qty: parseInt(item.qty, 10),
              price: parseFloat(item.price),
              showOnCover: parseInt(item.show_on_cover, 10) === 1,
              desc: item.description // map description to desc
            })),
            coverAdvantages: advantages,
            install_fee: parseFloat(data.quotation.installation_fee || 0),
            shipping_fee: parseFloat(data.quotation.shipping_fee || 0),
            discount: parseFloat(data.quotation.discount_amount || 0),
            use_tax: parseInt(data.quotation.use_tax, 10) === 1,
            terms: data.quotation.terms_conditions || defaultTerms
          };
          setQuotationDetails(formattedQuotation);
        } else {
          addToast("Quotation not found", 'error');
          navigate('/admin/rab');
        }
      } catch (err) {
        console.error("Failed to fetch quotation", err);
        addToast("Gagal memuat quotation", 'error');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchQuotation();
  }, [id, authFetch, navigate]);

  useEffect(() => {
    if (quotationDetails) {
      const title = quotationDetails.title || 'Penawaran';
      const client = quotationDetails.customer?.company_name || quotationDetails.customer?.customer_name || 'Client';
      document.title = `RAB ${title} - ${client}`;
    } else {
      document.title = 'RAB Preview - Ateka Tehnik';
    }
    
    return () => {
      document.title = 'Ateka Tehnik';
    };
  }, [quotationDetails]);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const token = localStorage.getItem('ateka_token');
        const response = await fetch('/api/company_profile.php', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success && result.data) {
          setCompanyProfile(result.data);
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
      }
    };
    fetchCompanyProfile();
  }, []);

  // Print styles follow the selected paper size
  useEffect(() => {
    const { widthMm, heightMm } = PAPER_SIZES[paperSize];
    const style = document.createElement('style');
    style.innerHTML = `
      @page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; }
        .no-print { display: none !important; }
        .print-container { padding: 0 !important; background: white !important; box-shadow: none !important; }
        .a4-page {
          width: ${widthMm}mm !important;
          height: ${heightMm}mm !important;
          margin: 0 !important;
          border: none !important;
          box-shadow: none !important;
          break-after: page;
          page-break-after: always;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .rab-pages > .a4-page:last-child { break-after: auto; page-break-after: auto; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [paperSize]);

  if (isLoading) {
    return <div className="p-10 text-center">Loading document...</div>;
  }
  if (!quotationDetails) return null;

  const q = quotationDetails;
  const subtotalItems = q.items.reduce((s, i) => s + (i.qty * i.price), 0);
  const dpp = subtotalItems + q.install_fee + q.shipping_fee - q.discount;
  const tax = q.use_tax ? Math.ceil(dpp * 0.11) : 0;
  const grandTotal = dpp + tax;

  const coverItems = q.items.filter(i => i.showOnCover);
  const coverRows = [];
  for (let i = 0; i < coverItems.length; i += 2) coverRows.push(coverItems.slice(i, i + 2));

  const edit = { editStates, editValues, setEditValues, startEdit, cancelEdit, saveEdit };
  const summaryProps = { q, subtotalItems, dpp, tax, grandTotal };

  // ---------- Pagination (based on measured heights) ----------
  const paper = PAPER_SIZES[paperSize];
  const paperHeight = `${paper.heightMm}mm`;
  const h = (key) => heights?.[key] ?? 0;
  const sumHeights = (prefix, count) => {
    let s = 0;
    for (let i = 0; i < count; i++) s += h(`${prefix}-${i}`);
    return s;
  };

  const reservePx = mmToPx(BOTTOM_RESERVE_MM + SAFETY_MM);
  const paperPx = mmToPx(paper.heightMm);
  const availFirstCover = paperPx - h('hdr-full') - reservePx;
  const availSimple = paperPx - h('hdr-simple') - reservePx;

  const coverGroupHeader = Math.max(0, h('cover-section') - sumHeights('cover-row', coverRows.length));
  const coverBlocks = [
    { id: 'cover-intro', type: 'coverIntro', height: h('cover-intro') },
    ...coverRows.map((items, i) => ({
      id: `cover-row-${i}`, type: 'coverRow', items, rowIndex: i, startNumber: i * 2 + 1,
      height: h(`cover-row-${i}`), group: 'cover', groupHeader: coverGroupHeader,
    })),
    { id: 'invest', type: 'invest', height: h('invest') },
  ];

  const tableGroupHeader = Math.max(0, h('rab-table') - sumHeights('rab-row', q.items.length));
  const detailBlocks = [
    { id: 'rab-header', type: 'rabHeader', height: h('rab-header'), keepWithNext: true },
    ...q.items.map((item, i) => ({
      id: `rab-row-${i}`, type: 'rabRow', item, number: i + 1,
      height: h(`rab-row-${i}`), group: 'table', groupHeader: tableGroupHeader,
    })),
    { id: 'summary', type: 'summary', height: h('summary') },
    { id: 'terms', type: 'terms', height: h('terms') },
  ];

  const coverPages = heights ? paginate(coverBlocks, (i) => (i === 0 ? availFirstCover : availSimple)) : [];
  // RAB always starts on a fresh page
  const detailPages = heights ? paginate(detailBlocks, () => availSimple) : [];
  const totalPages = coverPages.length + detailPages.length;

  const renderRun = (run, idx, runsArray) => {
    const key = `${run.blocks[0].id}-${idx}`;
    if (run.group === 'cover') {
      return (
        <CoverSection key={key} isContinuation={run.blocks[0].rowIndex > 0}>
          {run.blocks.map(b => (
            <Block key={b.id} className="pb-4"><CoverItemRow items={b.items} startNumber={b.startNumber} /></Block>
          ))}
        </CoverSection>
      );
    }
    if (run.group === 'table') {
      const isLastRow = run.blocks[run.blocks.length - 1].number === q.items.length;
      const pageHasSummary = runsArray.some(r => r.blocks.some(b => b.type === 'summary'));
      const showSummaryNote = isLastRow && !pageHasSummary;

      return (
        <RabTable key={key} showSummaryNote={showSummaryNote}>
          {run.blocks.map(b => <RabTableRow key={b.id} item={b.item} number={b.number} />)}
        </RabTable>
      );
    }
    const b = run.blocks[0];
    switch (b.type) {
      case 'coverIntro':
        return <Block key={key}><CoverIntro q={q} edit={edit} /></Block>;
      case 'invest':
        return (
          <Block key={key}>
            <InvestAdvantages
              text={advantagesText}
              editable
              isEditing={isEditingAdvantages}
              setIsEditing={setIsEditingAdvantages}
              setText={setAdvantagesText}
              onSave={handleSaveAdvantages}
            />
          </Block>
        );
      case 'rabHeader':
        return <Block key={key}><RabHeader quotationNumber={q.quotation_number} /></Block>;
      case 'summary':
        return <Block key={key}><SummaryBlock {...summaryProps} /></Block>;
      case 'terms':
        return <Block key={key}><TermsSignatureBlock q={q} companyProfile={companyProfile} edit={edit} /></Block>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-200 min-h-screen py-8 print-container font-sans text-slate-800 relative">

      {/* Action Bar (No Print) */}
      <div className="no-print fixed bottom-8 right-8 z-50 flex gap-2 items-center">
        <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-3 border border-slate-200 mr-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
          <span className={`text-xs font-bold uppercase tracking-widest ${
            q.status === 'draft' ? 'text-slate-500' :
            q.status === 'sent' ? 'text-blue-500' :
            q.status === 'accepted' ? 'text-green-500' :
            'text-red-500'
          }`}>
            {q.status}
          </span>

          <div className="w-px h-4 bg-slate-200 mx-1"></div>

          {q.status === 'draft' && (
            <button onClick={() => handleUpdateStatus('sent')} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 transition-colors" title="Tandai Terkirim">
              <span className="material-symbols-outlined text-[14px]">send</span> Terkirim
            </button>
          )}

          {q.status === 'sent' && (
            <>
              <button onClick={() => handleUpdateStatus('accepted')} className="text-green-600 hover:text-green-800 text-xs font-bold flex items-center gap-1 transition-colors" title="Tandai Disetujui (Deal)">
                <span className="material-symbols-outlined text-[14px]">handshake</span> Deal
              </button>
              <button onClick={() => handleUpdateStatus('rejected')} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 transition-colors" title="Tandai Ditolak">
                <span className="material-symbols-outlined text-[14px]">cancel</span> Batal
              </button>
            </>
          )}

          {(q.status === 'accepted' || q.status === 'rejected') && (
            <button onClick={() => handleUpdateStatus('draft')} className="text-slate-400 hover:text-slate-600 text-[10px] uppercase font-bold flex items-center gap-1 transition-colors" title="Kembalikan ke Draft">
              <span className="material-symbols-outlined text-[12px]">undo</span> Undo
            </button>
          )}
        </div>

        <div className="bg-white rounded-full px-3 py-2 shadow-lg flex items-center gap-2 border border-slate-200">
          <span className="material-symbols-outlined text-[16px] text-slate-500">article</span>
          <select
            value={paperSize}
            onChange={(e) => setPaperSize(e.target.value)}
            className="bg-transparent font-bold text-sm text-slate-700 outline-none cursor-pointer"
          >
            {Object.entries(PAPER_SIZES).map(([key, p]) => (
              <option key={key} value={key}>{p.label}</option>
            ))}
          </select>
        </div>
        <button onClick={() => navigate(-1)} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali
        </button>
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">print</span> Cetak PDF
        </button>
      </div>

      {/* Hidden measure layer: renders every block once (display mode) to read its real height */}
      <div className="no-print" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden' }}>
        <div ref={measureRef} style={{ width: `${paper.widthMm}mm`, visibility: 'hidden', pointerEvents: 'none' }}>
          <div className="flow-root" data-measure="hdr-full"><HeaderKop companyProfile={companyProfile} /></div>
          <div className="flow-root" data-measure="hdr-simple"><SimpleHeaderKop companyProfile={companyProfile} /></div>
          <div className="px-10">
            <Block measureId="cover-intro"><CoverIntro q={q} edit={null} /></Block>
            {coverRows.length > 0 && (
              <CoverSection measureId="cover-section">
                {coverRows.map((items, i) => (
                  <Block key={i} measureId={`cover-row-${i}`} className="pb-4">
                    <CoverItemRow items={items} startNumber={i * 2 + 1} />
                  </Block>
                ))}
              </CoverSection>
            )}
            <Block measureId="invest"><InvestAdvantages text={advantagesText} editable={false} /></Block>

            <Block measureId="rab-header"><RabHeader quotationNumber={q.quotation_number} /></Block>
            {q.items.length > 0 && (
              <RabTable measureId="rab-table">
                {q.items.map((item, i) => (
                  <RabTableRow key={i} measureId={`rab-row-${i}`} item={item} number={i + 1} />
                ))}
              </RabTable>
            )}
            <Block measureId="summary"><SummaryBlock {...summaryProps} /></Block>
            <Block measureId="terms"><TermsSignatureBlock q={q} companyProfile={companyProfile} edit={null} /></Block>
          </div>
        </div>
      </div>

      {/* Pages */}
      <div className="rab-pages">
        {coverPages.map((pageBlocks, pageIdx) => (
          <PageFrame
            key={`cover-${pageIdx}`}
            header={pageIdx === 0 ? <HeaderKop companyProfile={companyProfile} /> : <SimpleHeaderKop companyProfile={companyProfile} />}
            paperHeight={paperHeight}
            pageNumber={pageIdx + 1}
            totalPages={totalPages}
            quotationNumber={q.quotation_number}
          >
            {groupRuns(pageBlocks).map(renderRun)}
          </PageFrame>
        ))}

        {detailPages.map((pageBlocks, pageIdx) => (
          <PageFrame
            key={`detail-${pageIdx}`}
            header={<SimpleHeaderKop companyProfile={companyProfile} />}
            paperHeight={paperHeight}
            pageNumber={coverPages.length + pageIdx + 1}
            totalPages={totalPages}
            quotationNumber={q.quotation_number}
          >
            {groupRuns(pageBlocks).map(renderRun)}
          </PageFrame>
        ))}
      </div>
    </div>
  );
};

export default RabDocumentPreview;


