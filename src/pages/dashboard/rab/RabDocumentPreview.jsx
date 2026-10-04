import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../contexts/ToastContext';

const RabDocumentPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [companyProfile, setCompanyProfile] = useState(null);

  const { authFetch } = useAuth();
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paperSize, setPaperSize] = useState('A4');

  const [isEditingAdvantages, setIsEditingAdvantages] = useState(false);
  const [advantagesText, setAdvantagesText] = useState(`Efisiensi tenaga kerja dengan alur sistem vertikal otomatis yang terintegrasi.\nTingkat rendemen optimal dengan meminimalkan beras patah pada proses poles.\nKomponen mesin berkualitas industri untuk durabilitas dan pemakaian jangka panjang.`);

  useEffect(() => {
    const saved = localStorage.getItem('rab_preview_advantages');
    if (saved) setAdvantagesText(saved);
  }, []);

  const handleSaveAdvantages = () => {
    localStorage.setItem('rab_preview_advantages', advantagesText);
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

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const terbilang = (angka) => {
    angka = Math.floor(Math.abs(angka));
    const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    let temp = '';
    
    if (angka < 12) {
      temp = ' ' + bilangan[angka];
    } else if (angka < 20) {
      temp = terbilang(angka - 10) + ' Belas';
    } else if (angka < 100) {
      temp = terbilang(Math.floor(angka / 10)) + ' Puluh' + terbilang(angka % 10);
    } else if (angka < 200) {
      temp = ' Seratus' + terbilang(angka - 100);
    } else if (angka < 1000) {
      temp = terbilang(Math.floor(angka / 100)) + ' Ratus' + terbilang(angka % 100);
    } else if (angka < 2000) {
      temp = ' Seribu' + terbilang(angka - 1000);
    } else if (angka < 1000000) {
      temp = terbilang(Math.floor(angka / 1000)) + ' Ribu' + terbilang(angka % 1000);
    } else if (angka < 1000000000) {
      temp = terbilang(Math.floor(angka / 1000000)) + ' Juta' + terbilang(angka % 1000000);
    } else if (angka < 1000000000000) {
      temp = terbilang(Math.floor(angka / 1000000000)) + ' Milyar' + terbilang(angka % 1000000000);
    } else if (angka < 1000000000000000) {
      temp = terbilang(Math.floor(angka / 1000000000000)) + ' Trilyun' + terbilang(angka % 1000000000000);
    }
    
    return temp;
  };

  useEffect(() => {
    // Add print styles dynamically
    const style = document.createElement('style');
    style.innerHTML = `
      @page { size: A4 portrait; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; }
        .no-print { display: none !important; }
        .print-container { padding: 0 !important; background: white !important; box-shadow: none !important; }
        .a4-page { 
          width: 210mm !important; 
          height: 297mm !important; 
          min-height: 297mm !important; 
          margin: 0 !important; 
          padding: 0 !important;
          border: none !important; 
          box-shadow: none !important; 
          page-break-after: always;
          page-break-inside: avoid;
          position: relative !important;
          overflow: hidden !important;
        }
      }
    `;
    document.head.appendChild(style);

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

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Update dynamic page numbers after content loads
  useEffect(() => {
    if (!quotationDetails) return;

    const updatePages = () => {
      const pages = document.querySelectorAll('.a4-page');
      const total = pages.length;
      pages.forEach((page, index) => {
        const el = page.querySelector('.page-number-dynamic');
        if (el) {
          el.textContent = `Halaman ${index + 1} dari ${total}`;
        }
      });
    };
    
    updatePages();
    const t = setTimeout(updatePages, 500);
    return () => clearTimeout(t);
  }, [quotationDetails]);

  if (isLoading) {
    return <div className="p-10 text-center">Loading document...</div>;
  }
  if (!quotationDetails) return null;

  const subtotalItems = quotationDetails.items.reduce((s, i) => s + (i.qty * i.price), 0);
  const dpp = subtotalItems + quotationDetails.install_fee + quotationDetails.shipping_fee - quotationDetails.discount;
  const tax = quotationDetails.use_tax ? Math.ceil(dpp * 0.11) : 0;
  const grandTotal = dpp + tax;

  const coverItems = quotationDetails.items.filter(i => i.showOnCover);



  const HeaderKop = (
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

  const SimpleHeaderKop = (
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

  const paperHeight = paperSize === 'A4' ? '297mm' : '330mm';
  
  // Cover Pagination Logic
  const FIRST_COVER_LIMIT = paperSize === 'A4' ? 6 : 8;
  const NEXT_COVER_LIMIT = paperSize === 'A4' ? 14 : 18;
  
  const coverChunks = [];
  let remainingCoverItems = [...coverItems];
  if (remainingCoverItems.length > 0) {
    coverChunks.push(remainingCoverItems.splice(0, FIRST_COVER_LIMIT));
  } else {
    coverChunks.push([]); 
  }
  while (remainingCoverItems.length > 0) {
    coverChunks.push(remainingCoverItems.splice(0, NEXT_COVER_LIMIT));
  }

  // Details Pagination Logic
  const FIRST_PAGE_LIMIT = paperSize === 'A4' ? 18 : 24;
  const NEXT_PAGE_LIMIT = paperSize === 'A4' ? 28 : 34;

  const rawChunks = [];
  let remainingItems = [...quotationDetails.items];
  
  if (remainingItems.length > 0) {
    rawChunks.push(remainingItems.splice(0, FIRST_PAGE_LIMIT));
  }
  while (remainingItems.length > 0) {
    rawChunks.push(remainingItems.splice(0, NEXT_PAGE_LIMIT));
  }

  const chunksMetadata = rawChunks.map(chunk => ({ items: chunk, hasSubtotal: false, hasTnc: false }));

  if (chunksMetadata.length > 0) {
     const lastIndex = chunksMetadata.length - 1;
     const lastChunkItemsCount = chunksMetadata[lastIndex].items.length;
     const currentLimit = (lastIndex === 0) ? FIRST_PAGE_LIMIT : NEXT_PAGE_LIMIT;

     const SUBTOTAL_SPACE = 5;
     const TNC_SPACE = 12;
     const TOTAL_SPACE = SUBTOTAL_SPACE + TNC_SPACE;

     const remainingSpace = currentLimit - lastChunkItemsCount;

     if (remainingSpace >= TOTAL_SPACE) {
         chunksMetadata[lastIndex].hasSubtotal = true;
         chunksMetadata[lastIndex].hasTnc = true;
     } else if (remainingSpace >= SUBTOTAL_SPACE) {
         chunksMetadata[lastIndex].hasSubtotal = true;
         chunksMetadata.push({ items: [], hasSubtotal: false, hasTnc: true });
     } else {
         chunksMetadata.push({ items: [], hasSubtotal: true, hasTnc: true });
     }
  } else {
     chunksMetadata.push({ items: [], hasSubtotal: true, hasTnc: true });
  }

  return (
    <div className="bg-slate-200 min-h-screen py-8 print-container font-sans text-slate-800">

      {/* Action Bar (No Print) */}
      <div className="no-print fixed bottom-8 right-8 z-50 flex gap-2 items-center">
        {quotationDetails && (
          <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-3 border border-slate-200 mr-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
            <span className={`text-xs font-bold uppercase tracking-widest ${
              quotationDetails.status === 'draft' ? 'text-slate-500' :
              quotationDetails.status === 'sent' ? 'text-blue-500' :
              quotationDetails.status === 'accepted' ? 'text-green-500' :
              'text-red-500'
            }`}>
              {quotationDetails.status}
            </span>
            
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            
            {quotationDetails.status === 'draft' && (
              <button onClick={() => handleUpdateStatus('sent')} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 transition-colors" title="Tandai Terkirim">
                <span className="material-symbols-outlined text-[14px]">send</span> Terkirim
              </button>
            )}
            
            {quotationDetails.status === 'sent' && (
              <>
                <button onClick={() => handleUpdateStatus('accepted')} className="text-green-600 hover:text-green-800 text-xs font-bold flex items-center gap-1 transition-colors" title="Tandai Disetujui (Deal)">
                  <span className="material-symbols-outlined text-[14px]">handshake</span> Deal
                </button>
                <button onClick={() => handleUpdateStatus('rejected')} className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 transition-colors" title="Tandai Ditolak">
                  <span className="material-symbols-outlined text-[14px]">cancel</span> Batal
                </button>
              </>
            )}
            
            {(quotationDetails.status === 'accepted' || quotationDetails.status === 'rejected') && (
              <button onClick={() => handleUpdateStatus('draft')} className="text-slate-400 hover:text-slate-600 text-[10px] uppercase font-bold flex items-center gap-1 transition-colors" title="Kembalikan ke Draft">
                <span className="material-symbols-outlined text-[12px]">undo</span> Undo
              </button>
            )}
          </div>
        )}
        
        <div className="bg-white rounded-full px-3 py-2 shadow-lg flex items-center gap-2 border border-slate-200">
          <span className="material-symbols-outlined text-[16px] text-slate-500">article</span>
          <select 
            value={paperSize} 
            onChange={(e) => setPaperSize(e.target.value)}
            className="bg-transparent font-bold text-sm text-slate-700 outline-none cursor-pointer"
          >
            <option value="A4">A4 (21x29.7cm)</option>
            <option value="F4">F4 (21x33.0cm)</option>
          </select>
        </div>
        <button onClick={() => navigate(-1)} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali
        </button>
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">print</span> Cetak PDF
        </button>
      </div>

      {/* PAGES 1+: Technical & Value Profile (Cover Pages) */}
      {coverChunks.map((chunk, chunkIndex) => {
        const isFirstCover = chunkIndex === 0;
        const isLastCover = chunkIndex === coverChunks.length - 1;
        let startCoverIdx = 0;
        if (chunkIndex > 0) {
           startCoverIdx = FIRST_COVER_LIMIT + ((chunkIndex - 1) * NEXT_COVER_LIMIT);
        }

        return (
          <div key={`cover-${chunkIndex}`} className="a4-page bg-white w-[210mm] mx-auto mb-8 shadow-xl relative overflow-hidden page-break flex flex-col" style={{ minHeight: paperHeight }}>
            {isFirstCover ? HeaderKop : SimpleHeaderKop}
            
            <div className="px-10 pb-10 flex-1">
              {isFirstCover && (
                <>

          {/* Info Surat */}
          <div className="flex justify-between text-xs mb-8 border border-slate-200 p-3 rounded bg-slate-50">
            <div className="space-y-1">
              <div className="flex"><span className="w-20 font-bold">No. Surat</span>: {quotationDetails.quotation_number}</div>
              <div className="flex"><span className="w-20 font-bold">Perihal</span>: Penawaran Harga Mesin</div>
              <div className="flex"><span className="w-20 font-bold">Produk</span>: {quotationDetails.title}</div>
            </div>
            <div className="space-y-1">
              <div className="flex"><span className="w-24 font-bold">Tanggal</span>: {quotationDetails.quotation_date_fmt}</div>
              <div className="flex"><span className="w-24 font-bold">Masa Berlaku</span>: {quotationDetails.valid_until_fmt}</div>
              <div className="flex"><span className="w-24 font-bold">Kepada Yth.</span>: <b className="text-blue-900 ml-1">{quotationDetails.customer.customer_name === 'Kepada Yth.' ? '-' : quotationDetails.customer.customer_name}</b></div>
            </div>
          </div>

          <div className="text-center mb-6">
            {editStates.title ? (
              <div 
                className="flex flex-col items-center gap-2"
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) cancelEdit('title'); }}
              >
                <input 
                  type="text"
                  className="w-full max-w-md text-lg font-black text-blue-950 uppercase border-2 border-blue-400 p-1 text-center outline-none rounded"
                  value={editValues.title}
                  onChange={(e) => setEditValues(prev => ({ ...prev, title: e.target.value }))}
                  autoFocus
                />
                <div className="flex justify-center gap-2">
                  <button onClick={() => saveEdit('title', 'title')} className="no-print bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded">Simpan</button>
                </div>
              </div>
            ) : (
              <h2 
                onDoubleClick={() => startEdit('title', quotationDetails.title)}
                className="text-lg font-black text-blue-950 uppercase border-b-2 border-slate-200 inline-block pb-1 transition-colors hover:bg-slate-50 cursor-pointer rounded px-2"
                title="Klik 2x untuk edit teks"
              >
                {quotationDetails.title}
              </h2>
            )}
          </div>

          {/* Visualisasi Utama (Split Layout) */}
          <div className="flex gap-6 mb-8 items-stretch">
            {/* Left: Image */}
            <div className="w-1/3 shrink-0">
              <div className="w-full h-full min-h-[200px] bg-white border-2 border-slate-200 p-2 shadow-sm flex items-center justify-center">
                {quotationDetails.coverImage ? (
                  <img src={quotationDetails.coverImage} alt="Cover" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-slate-300">
                    <span className="material-symbols-outlined text-6xl">precision_manufacturing</span>
                    <p className="text-[10px] mt-2 uppercase tracking-widest font-bold">Image Placeholder</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Description & Advantages */}
            <div className="w-2/3 flex flex-col justify-center text-slate-700">
              
              {editStates.coverTitle ? (
                <div 
                  className="mb-2"
                  onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) cancelEdit('coverTitle'); }}
                >
                  <input 
                    type="text"
                    className="w-full text-xl font-bold text-blue-950 border-2 border-blue-400 p-1 outline-none rounded mb-1"
                    value={editValues.coverTitle}
                    onChange={(e) => setEditValues(prev => ({ ...prev, coverTitle: e.target.value }))}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit('coverTitle', 'coverTitle')} className="no-print bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded">Simpan</button>
                  </div>
                </div>
              ) : (
                <h3 
                  onDoubleClick={() => startEdit('coverTitle', quotationDetails.coverTitle)}
                  className="text-xl font-bold text-blue-950 mb-2 border-b border-slate-200 pb-1 inline-block transition-colors hover:bg-slate-50 cursor-pointer rounded px-1"
                  title="Klik 2x untuk edit teks"
                >
                  {quotationDetails.coverTitle}
                </h3>
              )}

              {editStates.coverDescription ? (
                <div 
                  className="mb-4"
                  onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) cancelEdit('coverDescription'); }}
                >
                  <textarea 
                    className="w-full text-sm p-2 border-2 border-blue-400 rounded outline-none min-h-[100px] leading-relaxed resize-y font-sans mb-1"
                    value={editValues.coverDescription}
                    onChange={(e) => setEditValues(prev => ({ ...prev, coverDescription: e.target.value }))}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit('coverDescription', 'coverDescription')} className="no-print bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded">Simpan</button>
                  </div>
                </div>
              ) : (
                <p 
                  onDoubleClick={() => startEdit('coverDescription', quotationDetails.coverDescription)}
                  className="text-sm whitespace-pre-line mb-4 transition-colors hover:bg-slate-50 cursor-pointer rounded p-1"
                  title="Klik 2x untuk edit teks"
                >
                  {quotationDetails.coverDescription}
                </p>
              )}

              {editStates.coverAdvantages ? (
                <div 
                  className="bg-blue-50/50 border border-blue-200 p-2 rounded-sm"
                  onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) cancelEdit('coverAdvantages'); }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-blue-950 text-xs">Kelebihan Utama:</h4>
                    <button
                      onClick={() => setEditValues(prev => ({ ...prev, coverAdvantagesArray: [...prev.coverAdvantagesArray, ''] }))}
                      className="text-[10px] font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[12px]">add</span> Tambah
                    </button>
                  </div>
                  <div className="space-y-1 mb-2">
                    {editValues.coverAdvantagesArray.map((adv, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-300 text-xs shrink-0">check_circle</span>
                        <input
                          type="text"
                          placeholder="Masukkan poin kelebihan..."
                          className="flex-1 border border-blue-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500 py-1 px-2 outline-none"
                          value={adv}
                          onChange={(e) => {
                            const newArr = [...editValues.coverAdvantagesArray];
                            newArr[index] = e.target.value;
                            setEditValues(prev => ({ ...prev, coverAdvantagesArray: newArr }));
                          }}
                          autoFocus={index === editValues.coverAdvantagesArray.length - 1}
                        />
                        <button
                          onClick={() => {
                            const newArr = [...editValues.coverAdvantagesArray];
                            newArr.splice(index, 1);
                            setEditValues(prev => ({ ...prev, coverAdvantagesArray: newArr }));
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex items-center justify-center shrink-0"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    ))}
                    {editValues.coverAdvantagesArray.length === 0 && (
                      <div className="text-center text-[10px] text-slate-400 py-2 border border-dashed border-slate-300 rounded">
                        Belum ada poin. Klik "Tambah".
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit('coverAdvantages', 'coverAdvantages')} className="no-print bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded">Simpan</button>
                  </div>
                </div>
              ) : (
                <div 
                  onDoubleClick={() => startEdit('coverAdvantages', quotationDetails.coverAdvantages)}
                  className="bg-blue-50/50 border border-blue-200 p-2 rounded-sm transition-colors hover:bg-blue-100/50 cursor-pointer"
                  title="Klik 2x untuk edit teks"
                >
                  <h4 className="font-bold text-blue-950 mb-1 text-xs">Kelebihan Utama:</h4>
                  {quotationDetails.coverAdvantages && quotationDetails.coverAdvantages.length > 0 && quotationDetails.coverAdvantages.some(adv => adv.trim() !== '') ? (
                    <ul className="list-disc pl-4 text-xs text-blue-900/80 leading-tight space-y-0.5">
                      {quotationDetails.coverAdvantages.map((adv, idx) => (
                        adv.trim() && <li key={idx}>{adv.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[10px] text-blue-800/50 italic">Klik 2x untuk menambah list kelebihan...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          
                </>
              )}

              {chunk.length > 0 && (
                <div className={`mb-6 ${!isFirstCover ? 'mt-6' : ''}`}>
                  {isFirstCover ? (
                    <h3 className="bg-blue-950 text-white font-bold text-xs uppercase px-3 py-1.5 inline-block mb-3 rounded-sm">Komponen Utama Sistem</h3>
                  ) : (
                    <h3 className="bg-blue-950 text-white font-bold text-xs uppercase px-3 py-1.5 inline-block mb-3 rounded-sm">Komponen Utama Sistem (Lanjutan)</h3>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {chunk.map((item, localIdx) => {
                      const absoluteIdx = startCoverIdx + localIdx + 1;
                      return (
                        <div key={item.id} className="flex gap-3 border border-slate-100 p-2 rounded bg-slate-50 break-inside-avoid">
                          <div className="w-16 h-16 bg-slate-200 rounded shrink-0 overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                <span className="material-symbols-outlined text-2xl">settings</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-blue-900 mb-0.5">{absoluteIdx}. {item.name}</h4>
                            <p className="text-[10px] text-slate-600 leading-tight">{item.desc}</p>
                            {item.specifications && (
                              <p className="text-[9px] text-slate-500 mt-1 italic leading-tight">{item.specifications}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isLastCover && (
                <>
{/* Value Propositions */}
          <div 
            onDoubleClick={() => setIsEditingAdvantages(true)}
            className={`transition-colors rounded-sm ${isEditingAdvantages ? '' : 'hover:bg-slate-50 cursor-pointer'}`}
            title={isEditingAdvantages ? '' : 'Klik 2x untuk edit teks'}
          >
            <h3 className="bg-orange-500 text-white font-bold text-xs uppercase px-3 py-1.5 inline-block mb-2 rounded-sm">Keunggulan Investasi</h3>
            
            {isEditingAdvantages ? (
              <div className="flex flex-col gap-2">
                <textarea 
                  className="w-full text-[11px] text-slate-700 p-2 border border-blue-400 rounded outline-none min-h-[100px] leading-relaxed resize-y font-sans"
                  value={advantagesText}
                  onChange={(e) => setAdvantagesText(e.target.value)}
                  autoFocus
                  onBlur={handleSaveAdvantages}
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handleSaveAdvantages}
                    className="no-print text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              <ul className="list-disc pl-5 text-[11px] text-slate-700 space-y-1">
                {advantagesText.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        
                </>
              )}
            </div>

            {/* Footer Halaman */}
            <div className="absolute bottom-5 right-10 text-[9px] text-slate-400 page-number-dynamic"></div>
          </div>
        );
      })}

      {/* PAGES 2+: DETAILS (Chunked) */}
      {chunksMetadata.map((chunkMeta, chunkIndex) => {
        const isFirstDetail = chunkIndex === 0;
        const chunk = chunkMeta.items;
        
        let startRowIdx = 0;
        if (chunkIndex > 0) {
           startRowIdx = FIRST_PAGE_LIMIT + ((chunkIndex - 1) * NEXT_PAGE_LIMIT);
        }

        return (
          <div key={chunkIndex} className="a4-page bg-white w-[210mm] mx-auto mb-8 shadow-xl relative overflow-hidden page-break flex flex-col" style={{ minHeight: paperHeight }}>
            {SimpleHeaderKop}

            <div className="px-10 flex-1">
              {isFirstDetail && (
                <div className="flex justify-between items-center border-b-2 border-slate-200 pb-3 mb-3">
                  <div>
                    <h2 className="font-black text-blue-950 uppercase">Rincian Anggaran Biaya (RAB)</h2>
                    <p className="text-xs text-slate-500">Lampiran Penawaran No: {quotationDetails.quotation_number}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-200 opacity-50 uppercase tracking-tighter">Ateka Tehnik</span>
                  </div>
                </div>
              )}

              {chunk.length > 0 && (
                <table className="w-full text-xs text-left border border-slate-800 mb-4">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold break-inside-avoid">
                      <th className="p-2 border-r border-slate-700 w-8 text-center">NO</th>
                      <th className="p-2 border-r border-slate-700">URAIAN / SPESIFIKASI</th>
                      <th className="p-2 border-r border-slate-700 w-12 text-center">QTY</th>
                      <th className="p-2 border-r border-slate-700 w-16 text-center">SATUAN</th>
                      <th className="p-2 border-r border-slate-700 w-28 text-right">HARGA SATUAN</th>
                      <th className="p-2 w-32 text-right">JUMLAH (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((item, localIdx) => (
                      <tr key={item.id} className="border-b border-slate-300 break-inside-avoid">
                        <td className="p-2 border-r border-slate-300 text-center">{startRowIdx + localIdx + 1}</td>
                        <td className="p-2 border-r border-slate-300 font-medium">{item.name}</td>
                        <td className="p-2 border-r border-slate-300 text-center">{item.qty}</td>
                        <td className="p-2 border-r border-slate-300 text-center">{item.unit}</td>
                        <td className="p-2 border-r border-slate-300 text-right">{formatRupiah(item.price).replace('Rp', '').trim()}</td>
                        <td className="p-2 text-right font-bold bg-slate-50">{formatRupiah(item.qty * item.price).replace('Rp', '').trim()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {chunkMeta.hasSubtotal && (
                <div className="break-inside-avoid">
                  {/* Subtotals & Grand Total */}
                  <div className="flex justify-end mb-8">
                    <div className="w-72 space-y-1 text-xs">
                      <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                        <span>Subtotal Biaya Mesin:</span>
                        <span className="font-bold">{formatRupiah(subtotalItems)}</span>
                      </div>
                      {quotationDetails.install_fee > 0 && (
                        <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                          <span>Biaya Instalasi & Jasa:</span>
                          <span className="font-bold">{formatRupiah(quotationDetails.install_fee)}</span>
                        </div>
                      )}
                      {quotationDetails.shipping_fee > 0 && (
                        <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                          <span>Biaya Ekspedisi:</span>
                          <span className="font-bold">{formatRupiah(quotationDetails.shipping_fee)}</span>
                        </div>
                      )}
                      {quotationDetails.discount > 0 && (
                        <div className="flex justify-between border-b border-dashed border-slate-300 pb-1 text-red-600">
                          <span>Diskon Khusus:</span>
                          <span className="font-bold">({formatRupiah(quotationDetails.discount)})</span>
                        </div>
                      )}

                      <div className="flex justify-between pt-1">
                        <span>Dasar Pengenaan Pajak:</span>
                        <span className="font-bold">{formatRupiah(dpp)}</span>
                      </div>
                      {quotationDetails.use_tax && (
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
                </div>
              )}

              {chunkMeta.hasTnc && (
                <div className="break-inside-avoid">
                  {/* T&C */}
                  <div className="mb-8">
                    <h3 className="font-bold text-xs uppercase border-b border-slate-800 pb-1 mb-2">Syarat & Ketentuan (Terms & Conditions)</h3>
                    {editStates.terms ? (
                      <div onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) cancelEdit('terms'); }}>
                        <textarea 
                          className="w-full text-[10px] text-slate-700 p-2 border-2 border-blue-400 rounded outline-none min-h-[150px] leading-relaxed resize-y font-mono mb-1"
                          value={editValues.terms}
                          onChange={(e) => setEditValues(prev => ({ ...prev, terms: e.target.value }))}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit('terms', 'terms')} className="no-print bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded">Simpan</button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onDoubleClick={() => startEdit('terms', quotationDetails.terms)}
                        className="text-[10px] text-slate-700 whitespace-pre-wrap font-mono transition-colors hover:bg-slate-50 cursor-pointer rounded p-1"
                        title="Klik 2x untuk edit teks"
                      >
                        {quotationDetails.terms || <span className="text-slate-400 italic">Klik 2x untuk menambah Syarat & Ketentuan...</span>}
                      </div>
                    )}
                  </div>

                  {/* Pengesahan */}
                  <div className="flex justify-between mt-12 text-sm">
                    <div className="text-center w-48">
                      <p className="mb-16">Menyetujui / Pemesan,</p>
                      <p className="font-bold border-b border-slate-800 pb-1">{quotationDetails.customer.customer_name}</p>
                      <p className="text-xs text-slate-500">Pimpinan {quotationDetails.customer.company_name}</p>
                    </div>
                    <div className="text-center w-48 relative">
                      <p className="mb-1">Karanganyar, {quotationDetails.quotation_date_fmt}</p>
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
                </div>
              )}

            </div>

            <div className="absolute bottom-5 right-10 text-[9px] text-slate-400 page-number-dynamic"></div>
          </div>
        );
      })}

    </div>
  );
};

export default RabDocumentPreview;
