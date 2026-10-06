import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { defaultTerms } from './mockRabData';
import ItemCatalogPicker from './ItemCatalogPicker';
import ImageCollectionModal from './ImageCollectionModal';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';

const RabBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { authFetch } = useAuth();
  const { addToast } = useToast();
  const { confirmDialog } = useConfirm();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // States - Upload
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file, onSuccess) => {
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await authFetch('/api/upload_item_image.php', {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (data.success) {
        (onSuccess || setCoverImage)(data.url);
        addToast('Gambar berhasil diupload', 'success');
      } else {
        addToast(data.message || 'Gagal mengupload gambar', 'error');
      }
    } catch (error) {
      console.error("Upload error:", error);
      addToast('Terjadi kesalahan saat mengupload gambar', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // States - General Info
  const [dbLeads, setDbLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState('');
  const [leadDetails, setLeadDetails] = useState(null);
  const [quotationNumber, setQuotationNumber] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState('');
  const [title, setTitle] = useState('');
  const [capacity, setCapacity] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverTitle, setCoverTitle] = useState('Sistem Komplit (Complete Set)');
  const [coverDescription, setCoverDescription] = useState('Paket lengkap penggilingan padi terpadu untuk menghasilkan beras berkualitas dengan tingkat beras patah yang minim.\nMengintegrasikan proses pembersihan, pemisahan batu, pengupasan, hingga penyosohan secara efisien.');
  const [coverAdvantages, setCoverAdvantages] = useState([
    'Struktur kompak & hemat ruang',
    'Alur kerja otomatis dengan elevator',
    'Hasil beras bersih & mengkilap'
  ]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [dbTemplates, setDbTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');

  // States - Save Template Modal
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState('');

  // States - AI Generate
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiRawText, setAiRawText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // States - Image Collection Modal
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionTarget, setCollectionTarget] = useState('cover'); // 'cover' or item id

  // States - Item Image Modal
  const [itemImageModalId, setItemImageModalId] = useState(null);
  const [isItemDragOver, setIsItemDragOver] = useState(false);
  const itemFileInputRef = useRef(null);

  // States - Items
  const [items, setItems] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // States - Auto Save
  const [autoSaveCountdown, setAutoSaveCountdown] = useState(0);
  const [lastSavedPayloadStr, setLastSavedPayloadStr] = useState(null);
  const handleSaveRef = useRef();

  // States - Calculation
  const [installFee, setInstallFee] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [useTax, setUseTax] = useState(false); // PPN 11%
  const [terms, setTerms] = useState(defaultTerms);

  // States - Tax Calculator
  const [isTaxCalcModalOpen, setIsTaxCalcModalOpen] = useState(false);
  const [taxCalcTarget, setTaxCalcTarget] = useState('');
  const [taxCalcItemSelection, setTaxCalcItemSelection] = useState({});

  const getReverseTaxPreview = () => {
    const target = parseFloat(taxCalcTarget.replace(/[^0-9]/g, '')) || 0;
    if (target <= 0) return { dpp: 0, previewItems: items, isValid: false, message: 'Masukkan target > 0' };

    const checkedItems = items.filter(item => taxCalcItemSelection[item.id]);
    const uncheckedItems = items.filter(item => !taxCalcItemSelection[item.id]);

    const dpp = target / 1.11;
    const fixedTotal = uncheckedItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1), 0);
    const targetCheckedSubtotal = dpp - installFee - shippingFee + discount - fixedTotal;

    if (targetCheckedSubtotal <= 0) {
      return { dpp, previewItems: items, isValid: false, message: 'Target terlalu kecil untuk menutupi biaya/item tetap.' };
    }

    const currentCheckedSubtotal = checkedItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1), 0);
    
    if (currentCheckedSubtotal <= 0 && checkedItems.length > 0) {
      return { dpp, previewItems: items, isValid: false, message: 'Subtotal item terpilih bernilai Rp 0.' };
    }

    const multiplier = currentCheckedSubtotal > 0 ? (targetCheckedSubtotal / currentCheckedSubtotal) : 1;

    let allocatedTotal = 0;
    const checkedItemIds = checkedItems.map(i => i.id);
    const lastCheckedItemId = checkedItemIds.length > 0 ? checkedItemIds[checkedItemIds.length - 1] : null;

    const previewItems = items.map(item => {
      if (taxCalcItemSelection[item.id]) {
        const qty = parseFloat(item.qty) || 1;
        if (item.id === lastCheckedItemId) {
          const remainder = targetCheckedSubtotal - allocatedTotal;
          const newPrice = Math.round(remainder / qty);
          return { ...item, newPrice };
        } else {
          const oldPrice = parseFloat(item.price) || 0;
          const newPrice = Math.round(oldPrice * multiplier);
          allocatedTotal += newPrice * qty;
          return { ...item, newPrice };
        }
      }
      return { ...item, newPrice: parseFloat(item.price) || 0 };
    });

    return { dpp, previewItems, isValid: true, message: '' };
  };

  const taxPreview = isTaxCalcModalOpen ? getReverseTaxPreview() : null;

  const handleOpenTaxCalc = () => {
    const initialSelection = {};
    items.forEach(item => {
      initialSelection[item.id] = true;
    });
    setTaxCalcItemSelection(initialSelection);
    
    const subTotal = items.reduce((acc, item) => acc + (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1), 0);
    const dppVal = subTotal + installFee + shippingFee - discount;
    const taxVal = useTax ? Math.round(dppVal * 0.11) : 0;
    const currentGrandTotal = dppVal + taxVal;

    setTaxCalcTarget(currentGrandTotal > 0 ? new Intl.NumberFormat('id-ID').format(currentGrandTotal) : '');
    setIsTaxCalcModalOpen(true);
  };

  const handleApplyReverseTax = () => {
    if (!taxPreview || !taxPreview.isValid) {
      addToast(taxPreview ? taxPreview.message : 'Target tidak valid', 'error');
      return;
    }

    const newItems = taxPreview.previewItems.map(item => {
      const { newPrice, ...rest } = item;
      return { ...rest, price: newPrice };
    });

    setItems(newItems);
    setUseTax(true);
    setIsTaxCalcModalOpen(false);
    addToast('Harga item berhasil disesuaikan secara otomatis.', 'success');
  };

  // States - Custom Select Lead
  const [isSelectLeadOpen, setIsSelectLeadOpen] = useState(false);
  const [searchLeadText, setSearchLeadText] = useState('');

  // States - Create Lead
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    name: '', company: '', capacity_ref: '', location: '', email: '', phone: '', service_request: ''
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const handleLeadFormChange = (e) => {
    const { name, value } = e.target;
    setLeadFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    try {
      const res = await authFetch('/api/leads.php', {
        method: 'POST',
        body: JSON.stringify(leadFormData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchDbLeads(); // Refresh leads
        const newId = data.data?.lead_id || data.lead_id;
        setSelectedLead(newId ? newId.toString() : '');
        setShowLeadModal(false);
        setLeadFormData({ name: '', company: '', capacity_ref: '', location: '', email: '', phone: '', service_request: '' });
        addToast('Lead berhasil dibuat', 'success');
      } else {
        addToast("Gagal membuat lead: " + (data.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      addToast("Error: " + err.message, 'error');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleGenerateRABFromAI = async () => {
    if (!aiRawText.trim()) return;
    setIsAiLoading(true);
    try {
      // 1. Fetch catalog to inject into prompt
      let catalogText = "Katalog kosong.";
      try {
        const catRes = await authFetch('/api/items.php?limit=200');
        const catData = await catRes.json();
        if (catData.success && catData.items) {
          catalogText = catData.items.map(i => `[ID:${i.id}] ${i.name} (Spek: ${i.specifications || '-'}) - Rp${i.default_price}/${i.default_unit}`).join('\n');
        }
      } catch (e) {
        console.error("Gagal ambil katalog untuk AI:", e);
      }

      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      const model = import.meta.env.VITE_OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";

      const systemPrompt = `Anda adalah estimator proyek profesional. Buatlah list RAB dan informasi penawaran berdasarkan teks pengguna.
Gunakan HANYA item dari katalog berikut jika cocok dengan permintaan (gunakan ID-nya). Jika tidak ada yang cocok di katalog, buat item kustom (biarkan item_id null).

Katalog Item Tersedia:
${catalogText}

Output HARUS berupa JSON murni dengan format berikut:
{
  "title": "Judul Penawaran (string, misal: Penawaran Instalasi Mesin Padi)",
  "cover_title": "Judul Visualisasi Utama (string, singkat dan menarik)",
  "cover_description": "Deskripsi untuk Visualisasi Utama (string, menjelaskan secara umum apa yang ditawarkan)",
  "cover_advantages": ["Keunggulan 1", "Keunggulan 2", "Keunggulan 3"],
  "terms": "Syarat & Ketentuan (T&C) penawaran (dukung baris baru dengan \\n). Modifikasi/isi jika user memintanya secara khusus.",
  "items": [
    {
      "item_id": "ID_DARI_KATALOG_JIKA_ADA_ATAU_NULL",
      "name": "Nama Item",
      "specifications": "Spesifikasi lengkap",
      "description": "Deskripsi opsional",
      "qty": angka,
      "unit": "satuan (misal: unit, ls, m2)",
      "price": angka (harga satuan)
    }
  ]
}

Sebagai referensi, ini adalah Syarat & Ketentuan (T&C) standar kami. Anda bisa memodifikasinya atau menambahkan poin baru HANYA jika teks pengguna meminta persyaratan/kondisi khusus. Jika tidak ada permintaan khusus, Anda dapat mengembalikan teks standar ini:
"""
${defaultTerms}
"""`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
          "X-Title": "Ateka Tehnik RAB Builder"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: aiRawText }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) throw new Error("Gagal terhubung ke OpenRouter API");

      const data = await response.json();
      let content = data.choices[0].message.content;
      
      // Clean up potential markdown formatting
      content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(content);
      
      if (parsedData) {
        // Set Header & Cover info
        if (parsedData.title) setTitle(parsedData.title);
        if (parsedData.cover_title) setCoverTitle(parsedData.cover_title);
        if (parsedData.cover_description) setCoverDescription(parsedData.cover_description);
        if (parsedData.cover_advantages && Array.isArray(parsedData.cover_advantages)) {
          setCoverAdvantages(parsedData.cover_advantages);
        }
        if (parsedData.terms) setTerms(parsedData.terms);

        // Set items
        if (parsedData.items && Array.isArray(parsedData.items)) {
          const newItems = parsedData.items.map(item => ({
            id: Date.now().toString() + Math.random().toString(),
            item_id: item.item_id || null,
            name: item.name || "Item Baru",
            specifications: item.specifications || "",
            description: item.description || "",
            qty: Number(item.qty) || 1,
            unit: item.unit || "unit",
            price: Number(item.price) || 0,
            showOnCover: true,
            image_url: "" 
          }));
          setItems(prev => [...prev, ...newItems]);
        }
        
        setIsAiModalOpen(false);
        setAiRawText("");
        addToast("RAB berhasil di-generate dari AI", 'success');
      } else {
        addToast("Format dari AI tidak sesuai, silakan coba prompt yang lebih jelas.", 'warning');
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      addToast("Terjadi kesalahan saat memproses permintaan AI. Cek konsol browser.", 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Derived calculations
  const subtotalItems = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const subtotalBeforeTax = subtotalItems + installFee + shippingFee - discount;
  const taxAmount = useTax ? Math.ceil(subtotalBeforeTax * 0.11) : 0;
  const grandTotal = subtotalBeforeTax + taxAmount;

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // Fetch leads from database
  const fetchDbLeads = async () => {
    try {
      const res = await authFetch('/api/leads.php?limit=100');
      const data = await res.json();
      if (data.success) {
        setDbLeads(data.leads);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    }
  };

  useEffect(() => {
    fetchDbLeads();
  }, [authFetch]);

  // Fetch existing quotation if edit mode
  useEffect(() => {
    if (!id && location.state?.lead_id) {
      setSelectedLead(location.state.lead_id.toString());
    }
    
    if (id) {
      const fetchQuotation = async () => {
        setIsLoading(true);
        try {
          const res = await authFetch(`/api/quotations.php?id=${id}`);
          const data = await res.json();
          if (data.success) {
            const q = data.quotation;
            setSelectedLead(q.lead_id ? q.lead_id.toString() : '');
            setQuotationNumber(q.quotation_number || '');
            setQuotationDate(q.quotation_date ? q.quotation_date.substring(0, 10) : new Date().toISOString().slice(0, 10));
            setValidUntil(q.valid_until ? q.valid_until.substring(0, 10) : '');
            setTitle(q.title || '');
            setCapacity(q.capacity_label || '');
            setCoverTitle(q.cover_title || '');
            setCoverImage(q.cover_image_url || '');
            setCoverDescription(q.cover_description || '');
            setCoverAdvantages(q.cover_advantages || []);
            setInstallFee(parseFloat(q.installation_fee) || 0);
            setShippingFee(parseFloat(q.shipping_fee) || 0);
            setDiscount(parseFloat(q.discount_amount) || 0);
            setUseTax(q.use_tax == 1);
            setTerms(q.terms_conditions || defaultTerms);

            if (q.items && q.items.length > 0) {
              setItems(q.items.map(item => ({
                id: item.id.toString(), // local id for list rendering
                item_id: item.item_id,
                name: item.name,
                specifications: item.specifications,
                description: item.description,
                qty: parseInt(item.qty, 10),
                unit: item.unit,
                price: parseFloat(item.price),
                showOnCover: item.show_on_cover == 1,
                image_url: item.image_url
              })));
            }
          }
        } catch (error) {
          console.error("Failed to fetch quotation:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchQuotation();
    }
  }, [id, authFetch]);

  // Fetch templates when modal opens
  useEffect(() => {
    if (isTemplateModalOpen && dbTemplates.length === 0) {
      const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
          const res = await authFetch('/api/quotations.php?is_template=1');
          const data = await res.json();
          if (data.success) {
            setDbTemplates(data.quotations);
          }
        } catch (error) {
          console.error("Failed to fetch templates:", error);
        } finally {
          setIsLoadingTemplates(false);
        }
      };
      fetchTemplates();
    }
  }, [isTemplateModalOpen, dbTemplates.length, authFetch]);



  // Handle lead selection
  useEffect(() => {
    if (selectedLead) {
      const lead = dbLeads.find(l => l.id.toString() === selectedLead);
      setLeadDetails(lead);
    } else {
      setLeadDetails(null);
    }
  }, [selectedLead, dbLeads]);

  const handleSelectItemFromCatalog = (catalogItem) => {
    const newItem = {
      id: Date.now().toString(), // unique id for cart
      item_id: catalogItem.id,
      name: catalogItem.name,
      specifications: catalogItem.specifications,
      description: catalogItem.description,
      qty: 1,
      unit: catalogItem.default_unit,
      price: catalogItem.default_price,
      showOnCover: true,
      image_url: catalogItem.image_url
    };
    setItems([...items, newItem]);
    setIsCatalogOpen(false);
  };

  const addCustomItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: '',
      specifications: '',
      description: '',
      qty: 1,
      unit: 'Unit',
      price: 0,
      showOnCover: false,
      image_url: ''
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id, field, value) => {
    setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const onItemDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const onItemDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onItemDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setItems(prev => {
      const newItems = [...prev];
      const draggedItem = newItems[draggedIndex];
      newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);
      return newItems;
    });
    setDraggedIndex(null);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const setItemImage = (itemId, url) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, image_url: url } : item));
  };

  const openCollection = (target) => {
    setCollectionTarget(target);
    setIsCollectionModalOpen(true);
  };

  const handleSelectFromCollection = (url) => {
    if (collectionTarget === 'cover') {
      setCoverImage(url);
    } else {
      setItemImage(collectionTarget, url);
    }
    setIsCollectionModalOpen(false);
  };

  const activeImageItem = items.find(i => i.id === itemImageModalId) || null;
  const isActiveItemCustom = activeImageItem ? !activeImageItem.item_id : false;

  // Kelebihan Utama Handlers
  const handleAddAdvantage = () => {
    setCoverAdvantages([...coverAdvantages, '']);
  };

  const handleUpdateAdvantage = (index, value) => {
    const newAdvantages = [...coverAdvantages];
    newAdvantages[index] = value;
    setCoverAdvantages(newAdvantages);
  };

  const handleRemoveAdvantage = (index) => {
    const newAdvantages = [...coverAdvantages];
    newAdvantages.splice(index, 1);
    setCoverAdvantages(newAdvantages);
  };

  const generatePayload = (isTemplate = false, templateName = null) => {
    return {
      is_template: isTemplate ? 1 : 0,
      template_name: templateName,
      lead_id: selectedLead || null,
      quotation_number: isTemplate ? null : (quotationNumber || null),
      quotation_date: quotationDate,
      valid_until: validUntil,
      title: title,
      capacity_label: capacity,
      cover_title: coverTitle,
      cover_description: coverDescription,
      cover_advantages: coverAdvantages.filter(a => a.trim() !== ''),
      cover_image_url: coverImage,
      subtotal: subtotalItems,
      installation_fee: installFee,
      shipping_fee: shippingFee,
      discount_amount: discount,
      use_tax: useTax ? 1 : 0,
      tax_amount: taxAmount,
      grand_total: grandTotal,
      terms_conditions: terms,
      status: 'draft',
      items: items
    };
  };

  const handleSaveTemplate = () => {
    setTemplateNameInput('');
    setIsSaveTemplateModalOpen(true);
  };

  const confirmSaveTemplate = async () => {
    if (!templateNameInput.trim()) return;

    try {
      setIsSaving(true);
      const payload = generatePayload(true, templateNameInput.trim());
      const res = await authFetch('/api/quotations.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        addToast("Template berhasil disimpan!", 'success');
        setIsSaveTemplateModalOpen(false);
      } else {
        addToast("Gagal menyimpan template: " + (data.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      console.error(err);
      addToast("Terjadi kesalahan saat menyimpan template.", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const applyTemplate = async (template) => {
    // Need to fetch full template details if they are not included in the list
    // The list endpoint only returns the quotation fields, not the items, unless we fetch the specific ID
    try {
      setIsLoading(true);
      const res = await authFetch(`/api/quotations.php?id=${template.id}`);
      const data = await res.json();
      if (data.success) {
        const fullTemplate = data.quotation;
        setQuotationDate(fullTemplate.quotation_date ? fullTemplate.quotation_date.substring(0, 10) : new Date().toISOString().slice(0, 10));
        setValidUntil(fullTemplate.valid_until ? fullTemplate.valid_until.substring(0, 10) : '');
        setTitle(fullTemplate.template_name || fullTemplate.title || '');
        setCapacity(fullTemplate.capacity_label || '');
        setCoverTitle(fullTemplate.cover_title || fullTemplate.title || '');
        setCoverImage(fullTemplate.cover_image_url || '');
        setCoverDescription(fullTemplate.cover_description || '');
        setCoverAdvantages(fullTemplate.cover_advantages || []);

        if (fullTemplate.items && fullTemplate.items.length > 0) {
          setItems(fullTemplate.items.map(item => ({
            id: Date.now().toString() + Math.random().toString(), // local id for list rendering
            item_id: item.item_id,
            name: item.name,
            specifications: item.specifications,
            description: item.description,
            qty: parseInt(item.qty, 10),
            unit: item.unit,
            price: parseFloat(item.price),
            showOnCover: item.show_on_cover == 1,
            image_url: item.image_url
          })));
        } else {
          setItems([]);
        }

        setInstallFee(parseFloat(fullTemplate.installation_fee) || 0);
        setShippingFee(parseFloat(fullTemplate.shipping_fee) || 0);
        setDiscount(parseFloat(fullTemplate.discount_amount) || 0);
        setUseTax(fullTemplate.use_tax == 1);
        if (fullTemplate.terms_conditions) setTerms(fullTemplate.terms_conditions);

        setIsTemplateModalOpen(false);
        addToast("Template berhasil dimuat", 'success');
      }
    } catch (err) {
      console.error(err);
      addToast("Gagal memuat template", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    const confirmed = await confirmDialog('Apakah Anda yakin ingin menghapus template ini?', 'Hapus Template', 'danger');
    if (confirmed) {
      try {
        const res = await authFetch(`/api/quotations.php?id=${templateId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          addToast('Template berhasil dihapus', 'success');
          setDbTemplates(prev => prev.filter(t => t.id !== templateId));
        } else {
          addToast(data.message || 'Gagal menghapus template', 'error');
        }
      } catch (error) {
        console.error(error);
        addToast('Terjadi kesalahan saat menghapus', 'error');
      }
    }
  };

  const handleSave = async (isAutoSave = false) => {
    const autoSave = isAutoSave === true;
    try {
      if (!autoSave) setIsSaving(true);
      const payload = generatePayload(false, null);

      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/quotations.php?id=${id}` : '/api/quotations.php';

      const res = await authFetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        if (data.quotation_number) {
          setQuotationNumber(data.quotation_number);
        }

        if (!id) {
          navigate(`/admin/rab/edit/${data.id}`, { replace: true });
        }
        
        setLastSavedPayloadStr(JSON.stringify(payload));
        
        if (autoSave) {
          addToast("Perubahan otomatis disimpan.", 'success');
        } else {
          addToast("Draft penawaran berhasil disimpan!", 'success');
        }
      } else {
        addToast("Gagal menyimpan: " + (data.message || 'Unknown error'), 'error');
      }
    } catch (err) {
      console.error(err);
      addToast("Terjadi kesalahan saat menyimpan draft.", 'error');
    } finally {
      if (!autoSave) setIsSaving(false);
    }
  };

  // --- Auto Save Logic ---
  useEffect(() => {
    handleSaveRef.current = handleSave;
  });

  const currentPayloadStr = JSON.stringify(generatePayload(false, null));

  useEffect(() => {
    if (id && !isLoading && lastSavedPayloadStr === null) {
      setLastSavedPayloadStr(currentPayloadStr);
    }
  }, [id, isLoading, currentPayloadStr, lastSavedPayloadStr]);

  useEffect(() => {
    if (!id || isLoading || lastSavedPayloadStr === null) return;
    
    if (currentPayloadStr === lastSavedPayloadStr) {
      setAutoSaveCountdown(0);
      return;
    }

    let timeoutId = setTimeout(() => {
      setAutoSaveCountdown(5);
      let count = 5;
      let intervalId = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(intervalId);
          setAutoSaveCountdown(0);
          if (handleSaveRef.current) handleSaveRef.current(true);
        } else {
          setAutoSaveCountdown(count);
        }
      }, 1000);
      timeoutId.intervalId = intervalId; 
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      if (timeoutId && timeoutId.intervalId) clearInterval(timeoutId.intervalId);
      setAutoSaveCountdown(0);
    };
  }, [id, isLoading, currentPayloadStr, lastSavedPayloadStr]);
  // -----------------------

  return (
    <div className="p-4 sm:p-6 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="mt-1 sm:mt-0 p-2 bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center shadow-sm"
            title="Kembali"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-blue-950 font-manrope">{id ? 'Edit RAB' : 'Buat RAB Baru'}</h1>
            <p className="text-slate-500 text-sm">Susun penawaran harga dinamis dan interaktif.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span> Generate AI
          </button>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="text-sm font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">view_carousel</span> Pilih Template
          </button>
          <button
            onClick={handleSaveTemplate}
            className="text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">save</span> Simpan sbg Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Form & Items (Takes up 2/3 space) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card 1: Informasi Dokumen & Konsumen */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 relative">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 rounded-t-xl">
              <h2 className="font-bold text-blue-900 flex items-center gap-2">
                <span className="material-symbols-outlined">assignment</span>
                Informasi Dokumen & Klien
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nomor RAB</label>
                  <input
                    type="text"
                    placeholder="Otomatis diisi saat simpan draft"
                    className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                    value={quotationNumber}
                    readOnly
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Klien (Lead)</label>
                  <div 
                    className="w-full border border-slate-300 rounded-lg text-sm bg-white p-2 cursor-pointer flex justify-between items-center"
                    onClick={() => setIsSelectLeadOpen(!isSelectLeadOpen)}
                  >
                    <span className={selectedLead ? "text-slate-800 font-medium" : "text-slate-400"}>
                      {selectedLead ? (() => {
                        const l = dbLeads.find(x => x.id.toString() === selectedLead);
                        return l ? `${l.name} (${l.company || '-'})` : 'Loading...';
                      })() : "-- Pilih Data Klien --"}
                    </span>
                    <span className="material-symbols-outlined text-sm text-slate-400">expand_more</span>
                  </div>
                  
                  {isSelectLeadOpen && (
                    <>
                      <div className="fixed inset-0 z-[50]" onClick={() => setIsSelectLeadOpen(false)}></div>
                      <div className="absolute z-[60] mt-1 w-full bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden">
                        <div className="p-2 border-b border-slate-100 flex gap-2">
                           <input 
                             type="text" 
                             className="w-full p-2 text-xs border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500" 
                             placeholder="Cari nama atau perusahaan..."
                             value={searchLeadText}
                             onChange={(e) => setSearchLeadText(e.target.value)}
                             autoFocus
                           />
                        </div>
                        <ul className="max-h-60 overflow-y-auto">
                          <li 
                            className="p-3 text-xs text-blue-600 font-bold hover:bg-blue-50 cursor-pointer flex items-center gap-2 border-b border-slate-100"
                            onClick={() => {
                              setIsSelectLeadOpen(false);
                              setShowLeadModal(true);
                            }}
                          >
                            <span className="material-symbols-outlined text-[16px]">add_circle</span> Buat Lead Baru
                          </li>
                          <li 
                            className="p-2.5 text-xs text-slate-500 font-medium hover:bg-slate-50 cursor-pointer italic text-center border-b border-slate-100"
                            onClick={() => {
                              setSelectedLead('');
                              setIsSelectLeadOpen(false);
                            }}
                          >
                            -- Kosongkan Pilihan --
                          </li>
                          {dbLeads.filter(l => (l.name+' '+l.company).toLowerCase().includes(searchLeadText.toLowerCase())).map(l => (
                            <li 
                              key={l.id} 
                              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                              onClick={() => {
                                setSelectedLead(l.id.toString());
                                setIsSelectLeadOpen(false);
                                setSearchLeadText('');
                              }}
                            >
                              <div className="font-bold text-sm text-slate-800">{l.name}</div>
                              <div className="text-[11px] text-slate-500">{l.company || 'Tanpa Perusahaan'}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Judul Penawaran</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rice Milling Unit 1 Ton/Jam..."
                    className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal Penawaran</label>
                    <input
                      type="date"
                      className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={quotationDate}
                      onChange={(e) => setQuotationDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Berlaku Sampai</label>
                    <input
                      type="date"
                      className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {leadDetails && (
                <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] leading-tight flex flex-col gap-1.5 mt-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-200 pb-1.5 gap-1">
                    <div>
                      <span className="font-bold text-slate-800 uppercase">{leadDetails.name}</span>
                      <span className="text-slate-500 ml-1">({leadDetails.company || 'Personal'})</span>
                    </div>
                    <div className="text-slate-600 sm:text-right">
                      <span className="font-medium">{leadDetails.phone}</span> • <span>{leadDetails.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600">
                    <div><span className="font-bold text-slate-400">Lokasi:</span> {leadDetails.location || '-'}</div>
                    <div><span className="font-bold text-slate-400">Kapasitas:</span> {leadDetails.capacity_ref || '-'}</div>
                  </div>
                  {leadDetails.service_request && (
                    <div className="text-slate-600 mt-0.5">
                      <span className="font-bold text-slate-400">Catatan:</span> <span className="italic">{leadDetails.service_request}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card 1.5: Informasi Visual & Deskripsi */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
              <h2 className="font-bold text-blue-900 flex items-center gap-2">
                <span className="material-symbols-outlined">image</span>
                Visualisasi Utama & Deskripsi
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Side: General Visual Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Judul Visual</label>
                    <input
                      type="text"
                      placeholder="Contoh: Sistem Komplit (Complete Set)"
                      className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={coverTitle}
                      onChange={(e) => setCoverTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Gambar Cover Produk (Pilih Salah Satu Cara)</label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-3">
                        {/* Option 1: Drag & Drop Upload */}
                        <div
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer relative ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                            }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => !isUploading && fileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                            className="hidden"
                            accept="image/jpeg, image/png, image/webp, image/gif"
                          />
                          {isUploading ? (
                            <div className="flex flex-col items-center justify-center text-blue-600">
                              <span className="material-symbols-outlined animate-spin mb-1">sync</span>
                              <span className="text-xs font-bold">Mengupload...</span>
                            </div>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">cloud_upload</span>
                              <p className="text-sm font-bold text-slate-700">Klik / Drag & Drop</p>
                              <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP max 2MB</p>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="h-px bg-slate-200 flex-1"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">ATAU</span>
                          <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        {/* Option 2: Text Input for Link */}
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Tempel Link Biasa</label>
                          <input
                            type="text"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="https://..."
                            className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="h-px bg-slate-200 flex-1"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">ATAU</span>
                          <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        {/* Option 3: Select from collection */}
                        <button
                          type="button"
                          onClick={() => openCollection('cover')}
                          className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">collections_bookmark</span>
                          Pilih dari Koleksi
                        </button>
                      </div>

                      {/* Image Preview */}
                      <div className="border border-slate-200 rounded-lg bg-slate-100 flex flex-col items-center justify-center p-2 min-h-[160px] overflow-hidden relative group">
                        {coverImage ? (
                          <>
                            <img
                              src={coverImage}
                              alt="Preview Cover"
                              className="max-h-40 w-auto object-contain rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/400x300/e2e8f0/475569?text=Gagal+Memuat+Gambar';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setCoverImage('')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                              title="Hapus Gambar"
                            >
                              <span className="material-symbols-outlined text-[16px] block">delete</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-center text-slate-400 flex flex-col items-center">
                            <span className="material-symbols-outlined text-4xl mb-1 opacity-40">image</span>
                            <span className="text-xs font-medium">Pratinjau Gambar Cover</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Side: Kelebihan Utama & Deskripsi */}
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Deskripsi Sistem</label>
                    <textarea
                      rows="4"
                      placeholder="Deskripsi fungsi dan proses mesin..."
                      className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={coverDescription}
                      onChange={(e) => setCoverDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4 flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-bold text-blue-900">Kelebihan Utama</label>
                      <button
                        onClick={handleAddAdvantage}
                        className="text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span> Tambah
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                      {coverAdvantages.map((adv, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-300 text-sm shrink-0">check_circle</span>
                          <input
                            type="text"
                            placeholder="Masukkan poin kelebihan..."
                            className="flex-1 border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 py-1.5 shadow-sm"
                            value={adv}
                            onChange={(e) => handleUpdateAdvantage(index, e.target.value)}
                          />
                          <button
                            onClick={() => handleRemoveAdvantage(index)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex items-center justify-center shrink-0"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      ))}
                      {coverAdvantages.length === 0 && (
                        <div className="text-center text-xs text-slate-400 py-4 border-2 border-dashed border-slate-200 rounded-lg">
                          Belum ada poin. Klik "Tambah" untuk memasukkan list kelebihan.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Card 2: Manajemen Item (Keranjang) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-blue-900 flex items-center gap-2">
                <span className="material-symbols-outlined">format_list_bulleted</span>
                Rincian Item (Cart)
              </h2>
              <div className="flex gap-2">
                <button onClick={addCustomItem} className="text-xs font-bold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors">
                  + Item Kustom
                </button>
                <button onClick={() => setIsCatalogOpen(true)} className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded hover:bg-blue-700 transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">search</span> Katalog
                </button>
              </div>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider">
                    <th className="p-3 w-8"></th>
                    <th className="p-3 w-24 text-center">Cover</th>
                    <th className="p-3">Nama & Spek</th>
                    <th className="p-3 w-20">Qty</th>
                    <th className="p-3 w-24">Satuan</th>
                    <th className="p-3 w-36">Harga Satuan</th>
                    <th className="p-3 w-36 text-right">Total</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50 group align-top ${draggedIndex === index ? 'opacity-50 bg-slate-100' : ''}`}
                      onDragOver={onItemDragOver}
                      onDrop={(e) => onItemDrop(e, index)}
                    >
                      <td className="p-3 text-center align-middle">
                        <div 
                          draggable
                          onDragStart={(e) => onItemDragStart(e, index)}
                          onDragEnd={() => setDraggedIndex(null)}
                          className="cursor-grab hover:text-blue-500 text-slate-400 active:cursor-grabbing"
                          title="Geser untuk memindah urutan"
                        >
                          <span className="material-symbols-outlined">drag_indicator</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.showOnCover}
                          onChange={(e) => updateItem(item.id, 'showOnCover', e.target.checked)}
                          title="Tampilkan di deskripsi teknis Halaman 1"
                          className="rounded text-blue-600 focus:ring-blue-500 mt-2"
                        />
                        {item.showOnCover && (
                          <button
                            type="button"
                            onClick={() => setItemImageModalId(item.id)}
                            title="Klik untuk ubah gambar"
                            className="mt-2 mx-auto block w-16 h-16 rounded-md border border-slate-200 bg-slate-50 overflow-hidden hover:border-blue-500 hover:shadow transition-all relative group/thumb"
                          >
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name || 'Item'}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/100x100/e2e8f0/475569?text=X';
                                }}
                              />
                            ) : (
                              <span className="material-symbols-outlined text-slate-400 text-[22px] leading-[64px]">
                                add_photo_alternate
                              </span>
                            )}
                            <span className="absolute inset-0 bg-blue-900/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="material-symbols-outlined text-white text-[18px]">edit</span>
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="p-3 space-y-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          placeholder="Nama Barang..."
                          className="w-full text-sm font-bold border-slate-300 rounded-md focus:ring-blue-500 py-1 px-2"
                        />
                        <textarea
                          value={item.specifications}
                          onChange={(e) => updateItem(item.id, 'specifications', e.target.value)}
                          placeholder="Spesifikasi / Detail..."
                          className="w-full text-xs text-slate-600 border-slate-300 rounded-md focus:ring-blue-500 py-1 px-2"
                          rows="2"
                        ></textarea>
                      </td>
                      <td className="p-3">
                        <input
                          type="number" min="1"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                          className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 py-1 px-2 text-center"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 py-1 px-2 text-center"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.price ? new Intl.NumberFormat('id-ID').format(item.price) : ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            updateItem(item.id, 'price', val ? parseInt(val, 10) : 0);
                          }}
                          className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 py-1 px-2 text-right"
                        />
                      </td>
                      <td className="p-3 text-right font-bold text-sm text-slate-700 pt-5">
                        {formatRupiah(item.qty * item.price)}
                      </td>
                      <td className="p-3 text-center pt-4">
                        <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Hapus">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400 text-sm">
                        Belum ada item ditambahkan. Klik <b>Katalog</b> untuk memilih produk.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {items.length > 0 && (
              <div className="bg-slate-50 p-4 border-t border-slate-200 text-right">
                <span className="text-slate-500 text-sm mr-4">Subtotal Item:</span>
                <span className="font-bold text-lg text-blue-900">{formatRupiah(subtotalItems)}</span>
              </div>
            )}
          </div>

          {/* Card 4: Syarat & Ketentuan */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
              <h2 className="font-bold text-blue-900 flex items-center gap-2">
                <span className="material-symbols-outlined">gavel</span>
                Syarat & Ketentuan (T&C)
              </h2>
            </div>
            <div className="p-5">
              <textarea
                className="w-full border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-blue-500 focus:border-blue-500 font-mono"
                rows="6"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              ></textarea>
              <p className="text-xs text-slate-400 mt-2">Teks ini akan muncul di bagian bawah halaman 2 dokumen RAB.</p>
            </div>
          </div>

        </div>

        {/* Right Column: Calculations (Sticky) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-20">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
              <h2 className="font-bold text-blue-900 flex items-center gap-2">
                <span className="material-symbols-outlined">calculate</span>
                Kalkulasi Finansial
              </h2>
            </div>
            <div className="p-5 space-y-4">

              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div>
                  <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Biaya Instalasi/Jasa</span>
                    <span className="font-normal text-slate-400">Rp</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border-slate-300 rounded-lg text-sm text-right focus:ring-blue-500 focus:border-blue-500"
                    value={installFee ? new Intl.NumberFormat('id-ID').format(installFee) : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setInstallFee(val ? parseInt(val, 10) : 0);
                    }}
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Biaya Ekspedisi/Kirim</span>
                    <span className="font-normal text-slate-400">Rp</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border-slate-300 rounded-lg text-sm text-right focus:ring-blue-500 focus:border-blue-500"
                    value={shippingFee ? new Intl.NumberFormat('id-ID').format(shippingFee) : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setShippingFee(val ? parseInt(val, 10) : 0);
                    }}
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Potongan / Diskon</span>
                    <span className="font-normal text-slate-400">Rp</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border-slate-300 rounded-lg text-sm text-right focus:ring-blue-500 focus:border-blue-500 text-red-500"
                    value={discount ? new Intl.NumberFormat('id-ID').format(discount) : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setDiscount(val ? parseInt(val, 10) : 0);
                    }}
                  />
                </div>
              </div>

              {/* PPN Toggle */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    Kenakan PPN 11%
                    <button 
                      onClick={handleOpenTaxCalc}
                      title="Kalkulator Reverse PPN"
                      className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">calculate</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-500">Pajak pertambahan nilai resmi.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={useTax} onChange={() => setUseTax(!useTax)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Summary Totals */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Dasar Pengenaan Pajak (DPP)</span>
                  <span className="font-medium">{formatRupiah(subtotalBeforeTax)}</span>
                </div>
                {useTax && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>PPN (11%)</span>
                    <span className="font-medium">{formatRupiah(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                  <span className="text-base font-bold text-slate-800">Grand Total</span>
                  <span className="text-2xl font-black text-orange-500 tracking-tight">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 z-40 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 font-bold text-sm px-4 py-2 transition-colors">
          Batal
        </button>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={isSaving} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 min-w-[140px]">
            {isSaving ? 'Menyimpan...' : (autoSaveCountdown > 0 ? `Auto Save (${autoSaveCountdown}s)...` : 'Simpan Draft')}
          </button>
          <button onClick={() => id ? navigate(`/admin/rab/preview/${id}`) : addToast("Silakan simpan draft terlebih dahulu sebelum melihat preview.", "warning")} className="bg-blue-950 hover:bg-blue-900 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg transition-colors">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Live Preview (Cetak)
          </button>
        </div>
      </div>

      {/* Catalog Modal */}
      <ItemCatalogPicker
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectItem={handleSelectItemFromCatalog}
      />

      {/* Full RAB Template Picker Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm" onClick={() => setIsTemplateModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="font-bold text-blue-900 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined">view_carousel</span>
                Pilih Template RAB
              </h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                  <input
                    type="text"
                    placeholder="Cari template..."
                    value={templateSearchTerm}
                    onChange={(e) => setTemplateSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 bg-slate-50">
              {isLoadingTemplates ? (
                <div className="col-span-full text-center py-10 text-slate-500">Memuat template...</div>
              ) : dbTemplates.length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-500">Belum ada template tersimpan.</div>
              ) : dbTemplates.filter(t => (t.template_name || t.title || '').toLowerCase().includes(templateSearchTerm.toLowerCase()) || (t.cover_description || '').toLowerCase().includes(templateSearchTerm.toLowerCase())).length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-500">Pencarian tidak ditemukan.</div>
              ) : (
                dbTemplates.filter(t => (t.template_name || t.title || '').toLowerCase().includes(templateSearchTerm.toLowerCase()) || (t.cover_description || '').toLowerCase().includes(templateSearchTerm.toLowerCase())).map(template => (
                  <div key={template.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                    <div className="h-32 bg-slate-100 overflow-hidden relative">
                      {template.cover_image_url ? (
                        <img src={template.cover_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-slate-300">image</span></div>
                      )}
                      <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-tl-lg">
                        {template.item_count || 0} Item Komponen
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-blue-950 text-sm mb-1">{template.template_name || template.title}</h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">{template.cover_description || template.title}</p>
                      <div className="mt-auto pt-2 text-[10px] text-slate-400 font-medium">
                        {(template.cover_advantages && Array.isArray(template.cover_advantages)) ? template.cover_advantages.length : 0} poin visual & kalkulasi finansial
                      </div>
                    </div>
                    <div className="p-3 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => applyTemplate(template)}
                        className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white py-1.5 rounded-lg text-sm font-bold transition-colors"
                      >
                        Gunakan Template
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="w-9 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
                        title="Hapus Template"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Item Image Modal */}
      {activeImageItem && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4" onClick={() => setItemImageModalId(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-blue-600">image</span>
                <span className="truncate">Gambar Item: {activeImageItem.name || 'Tanpa Nama'}</span>
              </h2>
              <button onClick={() => setItemImageModalId(null)} className="text-slate-400 hover:text-red-500">
                <span className="material-symbols-outlined block">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    {/* Option 1: Drag & Drop Upload */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer relative ${isItemDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}
                      onDragOver={(e) => { e.preventDefault(); setIsItemDragOver(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsItemDragOver(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsItemDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileUpload(file, (url) => setItemImage(activeImageItem.id, url));
                      }}
                      onClick={() => !isUploading && itemFileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={itemFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, (url) => setItemImage(activeImageItem.id, url));
                          e.target.value = '';
                        }}
                        className="hidden"
                        accept="image/jpeg, image/png, image/webp, image/gif"
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center text-blue-600">
                          <span className="material-symbols-outlined animate-spin mb-1">sync</span>
                          <span className="text-xs font-bold">Mengupload...</span>
                        </div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">cloud_upload</span>
                          <p className="text-sm font-bold text-slate-700">Klik / Drag & Drop</p>
                          <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP max 2MB</p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-px bg-slate-200 flex-1"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">ATAU</span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    {/* Option 2: Link */}
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Tempel Link Biasa</label>
                      <input
                        type="text"
                        value={activeImageItem.image_url || ''}
                        onChange={(e) => setItemImage(activeImageItem.id, e.target.value)}
                        placeholder="https://..."
                        className="w-full text-sm border-slate-300 rounded-lg focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-px bg-slate-200 flex-1"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">ATAU</span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    {/* Option 3: Collection */}
                    <button
                      type="button"
                      onClick={() => openCollection(activeImageItem.id)}
                      className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">collections_bookmark</span>
                      Pilih dari Koleksi
                    </button>
                  </div>

                  {/* Preview */}
                  <div className="border border-slate-200 rounded-lg bg-slate-100 flex flex-col items-center justify-center p-2 min-h-[200px] overflow-hidden relative group">
                    {activeImageItem.image_url ? (
                      <>
                        <img
                          src={activeImageItem.image_url}
                          alt="Preview Item"
                          className="max-h-60 w-auto object-contain rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/400x300/e2e8f0/475569?text=Gagal+Memuat+Gambar';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setItemImage(activeImageItem.id, '')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                          title="Hapus Gambar"
                        >
                          <span className="material-symbols-outlined text-[16px] block">delete</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-slate-400 flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl mb-1 opacity-40">image</span>
                        <span className="text-xs font-medium">Pratinjau Gambar Item</span>
                      </div>
                    )}
                  </div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
              <button onClick={() => setItemImageModalId(null)} className="text-sm font-bold bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Collection Modal */}
      <ImageCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onSelect={handleSelectFromCollection}
      />

      {/* Save Template Modal */}
      {isSaveTemplateModalOpen && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-blue-950/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-blue-950 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">save</span>
                Simpan Sebagai Template
              </h3>
              <button 
                onClick={() => setIsSaveTemplateModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Simpan pengaturan RAB ini sebagai template agar dapat digunakan kembali di masa mendatang tanpa harus menyusun dari awal.
              </p>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Nama Template</label>
              <input 
                type="text" 
                autoFocus
                placeholder="Contoh: RAB RMU 2 Ton/Jam Standard"
                className="w-full border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 p-3"
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') confirmSaveTemplate(); }}
              />
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsSaveTemplateModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={confirmSaveTemplate}
                disabled={!templateNameInput.trim() || isSaving}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Menyimpan...</>
                ) : (
                  'Simpan Template'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* LEAD CREATION MODAL */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-xl font-bold text-blue-900">
                Buat Lead Baru
              </h3>
              <button
                onClick={() => setShowLeadModal(false)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer rounded-full hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <form id="inline-lead-form" className="space-y-6" onSubmit={handleCreateLead}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Nama Lengkap *</label>
                    <input required name="name" value={leadFormData.name} onChange={handleLeadFormChange} className="w-full bg-slate-50 border-b-2 border-slate-300 focus:border-blue-500 transition-colors py-3 px-4 outline-none text-sm" placeholder="Budi Santoso" type="text" />
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Perusahaan</label>
                    <input name="company" value={leadFormData.company} onChange={handleLeadFormChange} className="w-full bg-slate-50 border-b-2 border-slate-300 focus:border-blue-500 transition-colors py-3 px-4 outline-none text-sm" placeholder="PT. Maju Pangan" type="text" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Ref Kapasitas</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        name="capacity_ref" 
                        value={leadFormData.capacity_ref} 
                        onChange={handleLeadFormChange} 
                        className="w-full bg-slate-50 border-b-2 border-slate-300 focus:border-blue-500 transition-colors py-3 px-4 outline-none text-sm font-semibold" 
                        placeholder="Ketik kapasitas atau pilih opsi..." 
                        type="text" 
                      />
                      <div className="flex flex-wrap gap-2 mt-1">
                        {['500 Kg/Jam', '500 Kg - 1 Ton/Jam', '1 - 5 Ton/Jam', '> 5 Ton/Jam'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleLeadFormChange({ target: { name: 'capacity_ref', value: preset } })}
                            className={`px-3 py-1.5 text-[10px] sm:text-xs rounded-full border transition-colors ${
                              leadFormData.capacity_ref === preset
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Wilayah / Lokasi</label>
                    <input name="location" value={leadFormData.location} onChange={handleLeadFormChange} className="w-full bg-slate-50 border-b-2 border-slate-300 focus:border-blue-500 transition-colors py-3 px-4 outline-none text-sm" placeholder="Nama Kota atau Provinsi" type="text" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Email</label>
                    <input name="email" value={leadFormData.email} onChange={handleLeadFormChange} className="w-full bg-slate-50 border-b-2 border-slate-300 focus:border-blue-500 transition-colors py-3 px-4 outline-none text-sm" placeholder="name@company.com" type="email" />
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">No WhatsApp/Telp</label>
                    <input name="phone" value={leadFormData.phone} onChange={handleLeadFormChange} className="w-full bg-slate-50 border-b-2 border-slate-300 focus:border-blue-500 transition-colors py-3 px-4 outline-none text-sm" placeholder="+62 812-XXXX-XXXX" type="tel" />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Permintaan/Catatan *</label>
                  <textarea required name="service_request" value={leadFormData.service_request} onChange={handleLeadFormChange} className="w-full bg-slate-50 border-b-2 border-slate-300 focus:border-blue-500 transition-colors py-3 px-4 outline-none resize-none text-sm" placeholder="Detail permintaan..." rows={3}></textarea>
                </div>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 px-4 md:px-8 py-4 md:py-5 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors rounded-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="inline-lead-form"
                disabled={isSubmittingLead}
                className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white font-bold text-sm uppercase tracking-widest rounded-sm shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingLead ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Lead'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm" onClick={() => setIsAiModalOpen(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col relative z-10 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600">auto_awesome</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Generate RAB dengan AI</h3>
                  <p className="text-sm text-slate-500">Otomatisasi pembuatan item dari deskripsi atau catatan</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            <div className="p-4 sm:p-6 bg-slate-50/50">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Masukkan kebutuhan / spesifikasi (teks bebas):
              </label>
              <textarea
                value={aiRawText}
                onChange={(e) => setAiRawText(e.target.value)}
                placeholder="Contoh: Tolong buatkan penawaran untuk 2 buah motor penggerak 5HP, dan tambahkan 1 panel listrik otomatis beserta biaya jasa pasangnya..."
                className="w-full h-40 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none shadow-inner bg-white"
              ></textarea>
              <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                <span className="material-symbols-outlined text-[16px] text-amber-500">info</span>
                <p>AI akan mencoba mencocokkan permintaan Anda dengan <b>Katalog Produk</b> yang ada. Jika tidak ada yang cocok, AI akan membuat item kustom.</p>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                disabled={isAiLoading}
              >
                Batal
              </button>
              <button
                onClick={handleGenerateRABFromAI}
                disabled={isAiLoading || !aiRawText.trim()}
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">magic_button</span>
                    Generate Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Tax Calculator Modal */}
      {isTaxCalcModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-blue-900 flex items-center gap-2">
                <span className="material-symbols-outlined">calculate</span>
                Kalkulator Reverse PPN
              </h3>
              <button onClick={() => setIsTaxCalcModalOpen(false)} className="text-slate-400 hover:text-red-500 rounded-full p-1 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Target Grand Total (Dengan PPN 11%)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                  <input
                    type="text"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 border-slate-300 rounded-lg font-bold focus:ring-blue-500 focus:border-blue-500 text-lg"
                    value={taxCalcTarget}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setTaxCalcTarget(val ? new Intl.NumberFormat('id-ID').format(val) : '');
                    }}
                    placeholder="Contoh: 150.000.000"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Masukkan total akhir yang diinginkan. Sistem akan otomatis mencari DPP dan menyesuaikan harga item yang Anda centang di bawah ini.
                </p>
                <div className="flex justify-between items-center mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-xs font-bold text-blue-900">Estimasi DPP:</span>
                  <span className="text-sm font-bold text-blue-700">
                    {taxPreview ? formatRupiah(taxPreview.dpp) : 'Rp 0'}
                  </span>
                </div>
                {!taxPreview?.isValid && taxCalcTarget && (
                  <p className="text-[11px] text-red-500 mt-2 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {taxPreview?.message}
                  </p>
                )}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between">
                  <span>Pilih Item yang Akan Disesuaikan Harganya</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {taxPreview?.previewItems.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">Tidak ada item.</div>
                  ) : (
                    taxPreview?.previewItems.map(item => {
                      const isChecked = taxCalcItemSelection[item.id] || false;
                      const hasChanged = isChecked && parseFloat(item.price) !== item.newPrice;
                      return (
                        <label key={item.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                            checked={isChecked}
                            onChange={(e) => setTaxCalcItemSelection(prev => ({
                              ...prev,
                              [item.id]: e.target.checked
                            }))}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 truncate">{item.name || '(Item Tanpa Nama)'}</div>
                            <div className="flex flex-col gap-0.5 mt-1">
                              <div className={`text-[11px] ${hasChanged ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                Harga lama: {formatRupiah(item.price)}
                              </div>
                              {isChecked && (
                                <div className="text-[11px] font-bold text-green-600">
                                  Harga baru: {formatRupiah(item.newPrice)}
                                </div>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsTaxCalcModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleApplyReverseTax}
                disabled={!taxPreview?.isValid || items.length === 0}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Terapkan Harga Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RabBuilder;
