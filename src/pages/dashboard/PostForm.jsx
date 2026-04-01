import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DatePicker from '../../components/dashboard/DatePicker';

const PostForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { authFetch, token } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: '',
    location: '',
    date: '',
    coverImage: '',
    content: ''
  });

  const [deliverables, setDeliverables] = useState(['']);
  
  const [techSpecs, setTechSpecs] = useState([
    { header: '', value: '', unit: '', description: '' }
  ]);

  const [phases, setPhases] = useState([
    { title: '', image: '' }
  ]);

  const [impactData, setImpactData] = useState({
    title: '',
    description: '',
    image: ''
  });

  const [impactStats, setImpactStats] = useState([
    { value: '', label: '' }
  ]);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const res = await authFetch(`/api/posts.php?id=${id}`);
          const data = await res.json();
          if (data.success && data.post) {
            const p = data.post;
            setFormData({
              title: p.title || '',
              subtitle: p.subtitle || '',
              category: p.category || '',
              location: p.location || '',
              date: p.publish_date || '',
              coverImage: p.cover_image || '',
              content: p.content || ''
            });

            if (p.deliverables && p.deliverables.length) setDeliverables(p.deliverables);
            
            if (p.techSpecs && p.techSpecs.length) {
              setTechSpecs(p.techSpecs.map(s => ({
                header: s.header || '', 
                value: s.spec_value || '', 
                unit: s.unit || '', 
                description: s.description || ''
              })));
            }

            if (p.phases && p.phases.length) {
              setPhases(p.phases.map(ph => ({ 
                title: ph.title || '', 
                image: ph.image_url || '' 
              })));
            }

            if (p.impact) {
              setImpactData({
                title: p.impact.title || '',
                description: p.impact.description || '',
                image: p.impact.image_url || ''
              });
              if (p.impact.stats && p.impact.stats.length) {
                setImpactStats(p.impact.stats.map(st => ({ 
                  value: st.stat_value || '', 
                  label: st.stat_label || '' 
                })));
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch post", err);
        }
      };
      fetchPost();
    }
  }, [id, authFetch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImpactChange = (e) => {
    const { name, value } = e.target;
    setImpactData(prev => ({ ...prev, [name]: value }));
  };

  // Deliverables Handle
  const handleDeliverableChange = (index, value) => {
    const newList = [...deliverables];
    newList[index] = value;
    setDeliverables(newList);
  };
  const addDeliverable = () => setDeliverables([...deliverables, '']);
  const removeDeliverable = (index) => {
    const newList = [...deliverables];
    newList.splice(index, 1);
    if (newList.length === 0) newList.push('');
    setDeliverables(newList);
  };

  // Tech Specs Handle
  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...techSpecs];
    newSpecs[index][field] = value;
    setTechSpecs(newSpecs);
  };
  const addSpec = () => setTechSpecs([...techSpecs, { header: '', value: '', unit: '', description: '' }]);
  const removeSpec = (index) => {
    const newSpecs = [...techSpecs];
    newSpecs.splice(index, 1);
    if (newSpecs.length === 0) newSpecs.push({ header: '', value: '', unit: '', description: '' });
    setTechSpecs(newSpecs);
  };

  // Phases Handle
  const handlePhaseChange = (index, field, value) => {
    const newPhases = [...phases];
    newPhases[index][field] = value;
    setPhases(newPhases);
  };
  const addPhase = () => setPhases([...phases, { title: '', image: '' }]);
  const removePhase = (index) => {
    const newPhases = [...phases];
    newPhases.splice(index, 1);
    if (newPhases.length === 0) newPhases.push({ title: '', image: '' });
    setPhases(newPhases);
  };

  // Impact Stats Handle
  const handleImpactStatChange = (index, field, value) => {
    const newStats = [...impactStats];
    newStats[index][field] = value;
    setImpactStats(newStats);
  };
  const addImpactStat = () => setImpactStats([...impactStats, { value: '', label: '' }]);
  const removeImpactStat = (index) => {
    const newStats = [...impactStats];
    newStats.splice(index, 1);
    if (newStats.length === 0) newStats.push({ value: '', label: '' });
    setImpactStats(newStats);
  };

  const getFinalData = () => ({
    ...formData,
    deliverables: deliverables.filter(d => d.trim() !== ''),
    techSpecs: techSpecs.filter(s => s.header.trim() !== ''),
    phases: phases.filter(p => p.title.trim() !== ''),
    impact: {
      ...impactData,
      stats: impactStats.filter(s => s.value.trim() !== '' || s.label.trim() !== '')
    }
  });

  const generatePreview = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await authFetch('/api/posts.php?action=translate_preview', {
        method: 'POST',
        body: JSON.stringify(getFinalData())
      });
      const data = await res.json();
      if (data.success && data.translated) {
        setTranslationResult(data.translated);
        setShowPreviewModal(true);
      } else {
        setSubmitError(data.error || 'Gagal generate preview translasi.');
      }
    } catch (err) {
      setSubmitError('Koneksi translate gagal: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e, withEnglish = false) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const finalData = getFinalData();

    try {
      // 1. Save original post (Indonesian)
      const url = id ? `/api/posts.php?id=${id}` : '/api/posts.php';
      const method = id ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method: method,
        body: JSON.stringify(finalData),
      });
      const data = await res.json();

      if (data.success) {
        // 2. If user confirmed English version, save it as well
        if (withEnglish && translationResult) {
           const enData = {
               ...translationResult,
               language: 'en'
           };
           // Note: Depending on your exact schema, we might need to link it
           // but your posts API handles POST insertion properly if slug and language are set.
           const enRes = await authFetch('/api/posts.php', {
               method: 'POST',
               body: JSON.stringify(enData)
           });
           const enDataRes = await enRes.json();
           if (!enDataRes.success) {
               console.error("Gagal save versi EN:", enDataRes.error);
               // Still redirect because main id post saved
           }
        }
        
        setShowPreviewModal(false);
        navigate('/admin/posts');
        
      } else {
        setSubmitError(data.error || 'Gagal menyimpan post.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setSubmitError('Koneksi ke server gagal: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 w-full font-body">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/posts')}
          className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <span className="text-secondary font-bold text-xs tracking-widest uppercase">Content Entry</span>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">{id ? 'Edit Post' : 'Log New Project / Post'}</h1>
          <p className="text-sm text-on-surface-variant max-w-lg mt-1">
            {id ? 'Perbarui informasi dan struktur laporan proyek atau artikel Anda di sini.' : 'Lengkapi detail proyek untuk menampilkannya di halaman portofolio utama.'}
          </p>
        </div>
      </div>


      {/* Error Banner */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="text-red-700 text-sm font-medium">{submitError}</p>
          <button onClick={() => setSubmitError('')} className="ml-auto text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      <div className="bg-surface-container-lowest shadow-sm rounded-sm overflow-hidden border border-surface-container-low">
        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          
          {/* General Information */}
          <div>
            <h3 className="text-sm font-label font-bold text-primary-container uppercase tracking-[0.2em] mb-6 border-b border-surface-container-low pb-2">Hero Section Settings</h3>
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Main Headline / Title *</label>
                <input 
                  required 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-xl font-headline font-bold" 
                  placeholder="e.g., Modernizing Agriculture: 5 Ton/Hr RMU..." 
                  type="text" 
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Subtitle / Brief Summary</label>
                <input 
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" 
                  placeholder="A Case Study in Industrial Precision..." 
                  type="text" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Post Category *</label>
                  <select 
                    required
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none appearance-none text-sm font-semibold cursor-pointer ${!formData.category ? 'text-outline' : ''}`}
                  >
                    <option value="" disabled>— Pilih Kategori —</option>
                    <option value="Industrial Installations">Industrial Installations</option>
                    <option value="Product News">Product News</option>
                    <option value="Maintenance Tips">Maintenance Tips</option>
                    <option value="Company Update">Company Update</option>
                  </select>
                </div>

                <DatePicker 
                  label="TANGGAL PUBLIKASI"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />

                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2 flex items-center gap-2">
                    Hero Background Image URL
                    <span className="material-symbols-outlined text-[14px] text-secondary">image</span>
                  </label>
                  <input 
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" 
                    placeholder="https://..." 
                    type="url" 
                  />
                </div>
              </div>

              {/* Location field — only for Industrial Installations */}
              {formData.category === 'Industrial Installations' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary">Lokasi <span className="text-error">*</span></label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-sm px-4 py-3 placeholder:text-outline-variant focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    placeholder="Contoh: Karawang, Jawa Barat"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Text Editor Mockup */}
          <div>
            <h3 className="text-sm font-label font-bold text-primary-container uppercase tracking-[0.2em] mb-6 border-b border-surface-container-low pb-2">Article Body Content</h3>
            <div className="border-2 border-surface-container-low rounded-sm overflow-hidden bg-white focus-within:border-primary transition-colors">
              {/* Toolbar */}
              <div className="bg-surface-container-low border-b border-surface-container py-2 px-3 flex flex-wrap gap-1 items-center">
                <select className="text-xs bg-white border border-outline-variant rounded-sm px-2 py-1 outline-none mr-2">
                  <option>Paragraph</option>
                  <option>Heading 2</option>
                  <option>Heading 3</option>
                </select>
                <div className="w-px h-4 bg-outline-variant mx-1"></div>
                <button type="button" className="p-1.5 hover:bg-surface-container-highest rounded-sm text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                <button type="button" className="p-1.5 hover:bg-surface-container-highest rounded-sm text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                <button type="button" className="p-1.5 hover:bg-surface-container-highest rounded-sm text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">format_underlined</span></button>
                <div className="w-px h-4 bg-outline-variant mx-1"></div>
                <button type="button" className="p-1.5 hover:bg-surface-container-highest rounded-sm text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                <button type="button" className="p-1.5 hover:bg-surface-container-highest rounded-sm text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">format_list_numbered</span></button>
                <div className="w-px h-4 bg-outline-variant mx-1"></div>
                <button type="button" className="p-1.5 hover:bg-surface-container-highest rounded-sm text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">link</span></button>
                <button type="button" className="p-1.5 hover:bg-surface-container-highest rounded-sm text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">image</span></button>
              </div>
              {/* Editor Area */}
              <textarea 
                required
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full h-64 p-4 outline-none resize-y text-sm leading-relaxed"
                placeholder="Write your project overview or article here..."
              ></textarea>
            </div>
          </div>

          {/* Key Deliverables */}
          <div>
            <div className="flex items-center justify-between border-b border-surface-container-low pb-2 mb-6">
              <h3 className="text-sm font-label font-bold text-primary-container uppercase tracking-[0.2em]">Key Deliverables (Checklist)</h3>
              <button type="button" onClick={addDeliverable} className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">add</span> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {deliverables.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                  <input 
                    value={item}
                    onChange={(e) => handleDeliverableChange(index, e.target.value)}
                    className="flex-1 bg-surface-container-low border-none rounded-sm focus:ring-2 focus:ring-secondary/50 transition-colors py-2 px-4 outline-none text-sm" 
                    placeholder="e.g., Integrated Control Panel Assembly" type="text" 
                  />
                  <button type="button" onClick={() => removeDeliverable(index)} className="w-10 h-10 text-slate-400 hover:text-error hover:bg-error-container/20 transition-all rounded-sm flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specifications Matrix */}
          <div>
            <div className="flex items-center justify-between border-b border-surface-container-low pb-2 mb-6">
              <h3 className="text-sm font-label font-bold text-primary-container uppercase tracking-[0.2em]">Technical Specs Grid</h3>
              <button type="button" onClick={addSpec} className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">add</span> Add Spec Box
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {techSpecs.map((spec, index) => (
                <div key={index} className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/30 flex gap-4 pr-12 relative">
                  <div className="flex-1 space-y-3">
                    <input 
                      value={spec.header} onChange={(e) => handleSpecChange(index, 'header', e.target.value)}
                      className="w-full bg-white border border-outline-variant/30 text-xs font-bold uppercase tracking-widest px-2 py-1 outline-none" placeholder="HEADER (e.g. System Throughput)" 
                    />
                    <div className="flex gap-2">
                      <input 
                        value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        className="w-2/3 bg-white border border-outline-variant/30 text-lg font-black px-2 py-1 outline-none" placeholder="Value (e.g. 5.0)" 
                      />
                      <input 
                        value={spec.unit} onChange={(e) => handleSpecChange(index, 'unit', e.target.value)}
                        className="w-1/3 bg-white border border-outline-variant/30 text-sm font-medium px-2 py-1 outline-none" placeholder="Unit (T/Hr)" 
                      />
                    </div>
                    <input 
                      value={spec.description} onChange={(e) => handleSpecChange(index, 'description', e.target.value)}
                      className="w-full bg-white border border-outline-variant/30 text-xs px-2 py-1 outline-none" placeholder="Description (e.g. Optimized for...)" 
                    />
                  </div>
                  <button type="button" onClick={() => removeSpec(index)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-error hover:bg-error-container/20 rounded-sm">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Installation Phases / Gallery */}
          <div>
            <div className="flex items-center justify-between border-b border-surface-container-low pb-2 mb-6">
              <h3 className="text-sm font-label font-bold text-primary-container uppercase tracking-[0.2em]">Project Phases Gallery</h3>
              <button type="button" onClick={addPhase} className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">add</span> Add Gallery Image
              </button>
            </div>
            <div className="space-y-4">
              {phases.map((phase, index) => (
                <div key={index} className="flex gap-4 items-start bg-surface-container-lowest border border-outline-variant/20 p-4 rounded-sm">
                  <div className="w-16 h-16 bg-surface-container-low flex items-center justify-center font-black text-outline text-xl shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 space-y-3">
                    <input 
                      value={phase.title} onChange={(e) => handlePhaseChange(index, 'title', e.target.value)}
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-2 px-3 outline-none font-bold text-sm" placeholder="Phase Title (e.g. Structural Foundation)" 
                    />
                    <input 
                      value={phase.image} onChange={(e) => handlePhaseChange(index, 'image', e.target.value)}
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-2 px-3 outline-none text-xs" placeholder="Image URL" 
                    />
                  </div>
                  <button type="button" onClick={() => removePhase(index)} className="p-2 text-slate-400 hover:text-error hover:bg-error-container/20 rounded-sm mt-2">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* The Impact of Precision Section (Optional) */}
          <div>
            <h3 className="text-sm font-label font-bold text-primary-container uppercase tracking-[0.2em] mb-6 border-b border-surface-container-low pb-2">The Impact of Precision (Optional)</h3>
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Section Title</label>
                <input 
                  name="title"
                  value={impactData.title}
                  onChange={handleImpactChange}
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm font-bold" 
                  placeholder="e.g., The Impact of Precision" 
                  type="text" 
                />
              </div>

              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Description Paragraph</label>
                <textarea 
                  name="description"
                  value={impactData.description}
                  onChange={handleImpactChange}
                  className="w-full h-32 bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm resize-none" 
                  placeholder="Post-installation metrics demonstrate a transformative shift..." 
                ></textarea>
              </div>

              <div>
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2 mb-4">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-outline">Impact Stats</label>
                  <button type="button" onClick={addImpactStat} className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">add</span> Add Stat
                  </button>
                </div>
                <div className="space-y-3">
                  {impactStats.map((stat, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <div className="w-1/3">
                        <input value={stat.value} onChange={(e) => handleImpactStatChange(index, 'value', e.target.value)} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary py-2 px-3 outline-none text-sm font-black" placeholder="+20%" type="text" />
                      </div>
                      <div className="flex-1">
                        <input value={stat.label} onChange={(e) => handleImpactStatChange(index, 'label', e.target.value)} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary py-2 px-3 outline-none text-sm" placeholder="Purity Gain" type="text" />
                      </div>
                      <button type="button" onClick={() => removeImpactStat(index)} className="p-2 text-slate-400 hover:text-error hover:bg-error-container/20 rounded-sm">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2 flex items-center gap-2">
                  Impact Section Image URL
                  <span className="material-symbols-outlined text-[14px]">image</span>
                </label>
                <input 
                  name="image"
                  value={impactData.image}
                  onChange={handleImpactChange}
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" 
                  placeholder="https://..." 
                  type="url" 
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 pb-24 border-t border-outline-variant/20">
            <button 
              type="button"
              onClick={generatePreview}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-6 py-3 rounded-sm font-bold hover:bg-blue-200 transition-colors w-full md:w-auto justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined">{isSubmitting && !showPreviewModal ? 'progress_activity' : 'auto_awesome'}</span>
              {isSubmitting && !showPreviewModal ? 'Generating Preview...' : 'Preview Auto-Generate English'}
            </button>
            
            <div className="flex gap-4 w-full md:w-auto">
              <button 
                type="button"
                onClick={() => navigate('/admin/posts')}
                className="flex-1 md:flex-none px-6 py-3 font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors rounded-sm cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={(e) => handleSubmit(e, false)}
                disabled={isSubmitting}
                className="flex-1 md:flex-none px-8 py-3 font-bold text-white bg-secondary hover:bg-secondary-container transition-colors rounded-sm shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><span className="material-symbols-outlined animate-spin hidden md:inline">progress_activity</span> Menyimpan...</>
                ) : (
                  <><span className="material-symbols-outlined hidden md:inline text-lg">{id ? 'update' : 'publish'}</span> {id ? 'Save & Update (ID only)' : 'Save & Publish (ID only)'}</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && translationResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-sm max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-primary">English Version Preview</h3>
                <p className="text-xs text-on-surface-variant">Review AI translation before publishing BOTH versions.</p>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="text-on-surface-variant hover:text-error transition-colors cursor-pointer p-1">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container">
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider mb-1 block">Title</label>
                <div className="bg-white p-3 border border-outline-variant/30 rounded-sm font-bold text-primary">
                  {translationResult.title}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider mb-1 block">Subtitle</label>
                <div className="bg-white p-3 border border-outline-variant/30 rounded-sm text-sm text-on-surface-variant">
                  {translationResult.subtitle}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider mb-1 block">Content Snippet</label>
                <div className="bg-white p-4 border border-outline-variant/30 rounded-sm text-sm text-on-surface-variant max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {translationResult.content}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-4 bg-surface-container-lowest">
              <button 
                type="button" 
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-2 bg-surface-container font-bold text-on-surface-variant rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel 
              </button>
              <button 
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-white font-bold rounded-sm shadow-md hover:bg-primary-container transition-colors cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? 'Publishing Both...' : 'Confirm Add English Version & Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostForm;
