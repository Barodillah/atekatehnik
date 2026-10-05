import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatAdminDate, formatAdminDateTime } from '../../utils/dateUtils';

const Leads = () => {
  const { authFetch } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext();

  const [modalMode, setModalMode] = useState(null); // 'create', 'edit', 'view'
  const [selectedLead, setSelectedLead] = useState(null);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, follow_up: 0, conversionRate: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [leadToDelete, setLeadToDelete] = useState(null);

  // States for RAB Modal
  const [rabModalLead, setRabModalLead] = useState(null);
  const [rabModalData, setRabModalData] = useState([]);
  const [isRabModalLoading, setIsRabModalLoading] = useState(false);

  // Modal form state
  const emptyForm = {
    name: '', company: '', capacity_ref: '', location: '',
    email: '', phone: '', service_request: '', status: 'New'
  };
  const [formData, setFormData] = useState(emptyForm);

  const statusStyleMap = {
    'New': { bg: 'bg-secondary-container text-on-secondary-container' },
    'Follow-up': { bg: 'bg-blue-100 text-blue-800' },
    'Closed': { bg: 'bg-surface-container-high text-on-surface-variant' },
  };

  // Fetch leads
  const fetchLeads = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (searchQuery) params.append('search', searchQuery);
      const res = await authFetch(`/api/leads.php?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
        setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
      }
    } catch (err) {
      setError('Gagal memuat data leads.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await authFetch('/api/leads.php?action=stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch { }
  };

  useEffect(() => {
    fetchLeads(1);
    fetchStats();
  }, [searchQuery]);

  useEffect(() => {
    if (location.state?.openNewLeadModal) {
      openModal('create');
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const openModal = (mode, lead = null) => {
    setModalMode(mode);
    setFormData(lead || emptyForm);
    setSelectedLead(lead);
    setError('');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedLead(null);
    setFormData(emptyForm);
  };

  const handleOpenRabModal = async (lead) => {
    setRabModalLead(lead);
    setIsRabModalLoading(true);
    try {
      const res = await authFetch('/api/quotations.php?lead_id=' + lead.id);
      const data = await res.json();
      if (data.success) {
        // Filter out templates
        setRabModalData(data.quotations.filter(q => q.is_template != 1 && q.status !== 'template'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRabModalLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await authFetch(`/api/leads.php?id=${leadId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchLeads(pagination.page);
      fetchStats();
    } catch (err) {
      setError('Gagal mengubah status.');
    }
  };

  // Handle Delete
  const requestDeleteLead = (lead) => {
    setLeadToDelete(lead);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      const res = await authFetch(`/api/leads.php?id=${leadToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchLeads(pagination.page);
        fetchStats();
      } else {
        setError(data.error || 'Gagal menghapus lead.');
      }
    } catch (err) {
      setError('Gagal menghapus lead.');
    } finally {
      setLeadToDelete(null);
    }
  };

  // Submit form (create or edit)
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const isEdit = modalMode === 'edit';
      const url = isEdit ? `/api/leads.php?id=${selectedLead.id}` : '/api/leads.php';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        fetchLeads(pagination.page);
        fetchStats();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Gagal menyimpan lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatWhatsAppLink = (phone) => {
    if (!phone) return '#';
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary font-headline tracking-tight">Customer Leads</h2>
          <p className="text-sm md:text-base text-on-surface-variant mt-1">Real-time overview of incoming service requests and industrial inquiries.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-highest text-primary font-semibold rounded-sm hover:bg-slate-200 transition-all text-sm">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            CSV
          </button>
          <button
            onClick={() => openModal('create')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary font-semibold rounded-sm hover:opacity-90 transition-all text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && !modalMode && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-1 bg-surface-container-low p-4 md:p-6 flex flex-col justify-between">
          <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Active Leads</span>
          <div className="mt-2 md:mt-4">
            <span className="text-3xl md:text-4xl font-extrabold text-primary font-headline">{stats.total}</span>
          </div>
        </div>
        <div className="col-span-1 bg-surface-container-low p-4 md:p-6 flex flex-col justify-between">
          <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">New</span>
          <div className="mt-2 md:mt-4">
            <span className="text-3xl md:text-4xl font-extrabold text-primary font-headline">{stats.new}</span>
          </div>
        </div>
        <div className="col-span-2 bg-primary-container p-4 md:p-6 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-primary-container">Conversion Rate</span>
            <div className="mt-2 md:mt-4 flex items-end gap-4 md:gap-6">
              <span className="text-3xl md:text-4xl font-extrabold text-white font-headline tracking-tighter">{stats.conversionRate}%</span>
              <div className="flex-1 h-2 bg-blue-900 mb-2 overflow-hidden">
                <div className="h-full bg-secondary-container" style={{ width: `${stats.conversionRate}%` }}></div>
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5 pointer-events-none hidden md:block">monitoring</span>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-surface-container-lowest shadow-sm rounded-sm overflow-hidden border border-surface-container-low">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none">Name / Company</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none">Service Request</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Date</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">RAB</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
                    <p className="text-sm text-on-surface-variant mt-2">Memuat data...</p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">inbox</span>
                    Belum ada leads.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary flex items-center gap-2">
                          {lead.name}
                          {lead.source === 'Website' ? (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] uppercase tracking-widest font-bold rounded-sm border border-blue-200">Web</span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] uppercase tracking-widest font-bold rounded-sm border border-slate-200">Manual</span>
                          )}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">{lead.company || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        <span className="flex items-center gap-1.5 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">call</span>
                          {lead.phone}
                        </span>
                        <span className="flex items-center gap-1.5 text-on-surface-variant/70 text-[12px]">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          {lead.location || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2 py-1 bg-surface-container text-xs font-bold rounded-sm border-l-2 border-primary max-w-[200px] truncate" title={lead.service_request}>
                        {lead.service_request}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-on-surface-variant">
                        {formatAdminDate(lead.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border-none cursor-pointer appearance-none text-center ${statusStyleMap[lead.status]?.bg || 'bg-surface-container-high text-on-surface-variant'}`}
                      >
                        <option value="New">New</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {lead.rab_count > 0 ? (
                        <button
                          onClick={() => handleOpenRabModal(lead)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs hover:bg-secondary hover:text-white transition-colors"
                          title="Lihat RAB"
                        >
                          {lead.rab_count}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/admin/rab/create', { state: { lead_id: lead.id } })}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-surface-container-highest text-primary font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-primary-container hover:text-white transition-colors"
                          title="Buatkan RAB"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          Buat
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openModal('view', lead)}
                        className="text-on-surface-variant hover:text-primary transition-colors p-1" title="View details"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button
                        onClick={() => openModal('edit', lead)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-1 ml-1" title="Edit lead"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => requestDeleteLead(lead)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1 ml-1" title="Delete lead"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between border-t border-outline-variant/10">
          <span className="text-xs font-medium text-on-surface-variant">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} results)
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => fetchLeads(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 bg-surface-container-highest rounded-sm hover:opacity-80 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              let start = Math.max(1, pagination.page - 2);
              if (start + 4 > pagination.totalPages) start = Math.max(1, pagination.totalPages - 4);
              return start + i;
            }).map(p => (
              <button
                key={p}
                onClick={() => fetchLeads(p)}
                className={`px-3 py-1 text-xs font-bold rounded-sm ${p === pagination.page ? 'bg-primary-container text-white' : 'bg-surface-container-highest text-on-surface hover:bg-slate-200'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => fetchLeads(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 bg-surface-container-highest rounded-sm hover:opacity-80 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {leadToDelete && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/50 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
              </div>
              <h3 className="text-xl font-headline font-bold text-center text-on-surface mb-2">Hapus Lead</h3>
              <p className="text-center text-on-surface-variant text-sm">
                Apakah Anda yakin ingin menghapus lead <span className="font-bold">"{leadToDelete.name}"</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface-container-low bg-surface">
              <button
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 text-sm font-bold uppercase tracking-widest text-outline hover:bg-surface-container-low transition-colors rounded-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteLead}
                className="px-4 py-2 bg-red-500 text-white font-bold text-sm uppercase tracking-widest rounded-sm shadow-md hover:bg-red-600 transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal View / Form */}
      {modalMode && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/50 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-8 py-5 border-b border-surface-container-low bg-surface">
              <h3 className="text-2xl font-headline font-bold text-primary-container">
                {modalMode === 'create' && 'New Lead Entry'}
                {modalMode === 'edit' && 'Edit Lead'}
                {modalMode === 'view' && 'Lead Details'}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-error transition-colors p-1 cursor-pointer rounded-full hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-sm flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {modalMode === 'view' && selectedLead ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-outline">Full Name</span>
                        <p className="font-bold text-lg text-primary">{selectedLead.name}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-outline">Company</span>
                        <p className="font-medium text-on-surface">{selectedLead.company || '—'}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-outline">Capacity Reference</span>
                        <p className="text-sm text-on-surface-variant bg-surface capitalize px-2 py-1 inline-block mt-1 font-bold">{selectedLead.capacity_ref || 'None'}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-outline">Status</span>
                        <span className={`inline-block mt-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${statusStyleMap[selectedLead.status]?.bg || 'bg-surface-container-high'}`}>
                          {selectedLead.status}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-outline">Source</span>
                        <p className="text-sm font-bold text-on-surface mt-1">
                          {selectedLead.source === 'Website' ? (
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-blue-500">language</span>Website Form</span>
                          ) : (
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-slate-500">edit_document</span>Manual Input</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-1">Contact Actions</span>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={formatWhatsAppLink(selectedLead.phone)}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold rounded-sm text-xs hover:bg-green-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">chat</span>
                            WhatsApp
                          </a>
                          <a
                            href={`mailto:${selectedLead.email}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-sm text-xs hover:bg-blue-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                            Email
                          </a>
                        </div>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-outline">Phone</span>
                        <p className="text-sm font-bold text-on-surface">{selectedLead.phone}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-outline">Email</span>
                        <p className="text-sm font-bold text-on-surface">{selectedLead.email}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-widest font-bold text-outline">Location / Region</span>
                        <p className="text-sm text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span>{selectedLead.location || '—'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-surface-container-low">
                    <span className="block text-[10px] uppercase tracking-widest font-bold text-outline">Service Request / Notes</span>
                    <p className="mt-2 text-sm text-on-surface-variant leading-relaxed bg-surface p-4 rounded-sm border border-outline-variant/10 whitespace-pre-wrap">
                      {selectedLead.service_request}
                    </p>
                  </div>

                  <div className="text-xs text-outline font-medium pt-2">
                    Date Created: {formatAdminDateTime(selectedLead.created_at)}
                  </div>
                </div>
              ) : (
                <form id="lead-form" className="space-y-6" onSubmit={handleSubmitLead}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Full Name *</label>
                      <input required name="name" value={formData.name} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" placeholder="Budi Santoso" type="text" />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Company</label>
                      <input name="company" value={formData.company} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" placeholder="PT. Maju Pangan" type="text" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Capacity Ref</label>
                      <div className="flex flex-col gap-2">
                        <input 
                          name="capacity_ref" 
                          value={formData.capacity_ref} 
                          onChange={handleFormChange} 
                          className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm font-semibold" 
                          placeholder="Type capacity or select below" 
                          type="text" 
                        />
                        <div className="flex flex-wrap gap-2 mt-1">
                          {['500 Kg/Jam', '500 Kg - 1 Ton/Jam', '1 - 5 Ton/Jam', '> 5 Ton/Jam'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleFormChange({ target: { name: 'capacity_ref', value: preset } })}
                              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                formData.capacity_ref === preset
                                  ? 'bg-secondary text-white border-secondary'
                                  : 'bg-transparent border-outline-variant text-outline hover:bg-surface-container-high'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Location Region</label>
                      <input name="location" value={formData.location} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" placeholder="City or Region" type="text" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Email Contact</label>
                      <input name="email" value={formData.email} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" placeholder="name@company.com" type="email" />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Phone Number</label>
                      <input name="phone" value={formData.phone} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" placeholder="+62 812-XXXX-XXXX" type="tel" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Service Request / Notes *</label>
                    <textarea required name="service_request" value={formData.service_request} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none resize-none text-sm" placeholder="Details about this lead's inquiry..." rows={3}></textarea>
                  </div>

                  {modalMode === 'edit' && (
                    <div className="relative">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Lead Status</label>
                      <select name="status" value={formData.status} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none appearance-none text-sm font-semibold">
                        <option value="New">New</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  )}
                </form>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 px-4 md:px-8 py-4 md:py-5 border-t border-surface-container-low bg-surface">
              <button
                type="button"
                onClick={closeModal}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-outline hover:bg-surface-container-low transition-colors rounded-sm cursor-pointer"
              >
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </button>
              {modalMode !== 'view' && (
                <button
                  type="submit"
                  form="lead-form"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-2.5 bg-primary-container text-white font-bold text-sm uppercase tracking-widest rounded-sm shadow-md hover:bg-secondary transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Saving...
                    </>
                  ) : (
                    modalMode === 'edit' ? 'Save Changes' : 'Save Lead'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* RAB Modal */}
      {rabModalLead && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/50 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-surface-container-low bg-surface">
              <h3 className="text-xl font-headline font-bold text-primary-container flex items-center gap-2">
                <span className="material-symbols-outlined">request_quote</span>
                Daftar RAB
              </h3>
              <button
                onClick={() => setRabModalLead(null)}
                className="text-slate-400 hover:text-error transition-colors p-1 cursor-pointer rounded-full hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 bg-surface-container-lowest border-b border-surface-container-low flex flex-col">
              <span className="text-xs text-outline font-bold uppercase tracking-widest">Lead Name</span>
              <span className="text-lg font-bold text-on-surface">{rabModalLead.name}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-surface">
              {isRabModalLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                  <span className="mt-2 text-sm text-on-surface-variant">Memuat data RAB...</span>
                </div>
              ) : rabModalData.length > 0 ? (
                rabModalData.map(rab => (
                  <div key={rab.id}
                    onClick={() => navigate(`/admin/rab/edit/${rab.id}`)}
                    className="p-4 border border-outline-variant/30 rounded-sm hover:border-primary hover:bg-surface-container-low transition-colors cursor-pointer group flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary group-hover:underline">{rab.quotation_number}</span>
                        <span className="text-xs text-on-surface-variant">{rab.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold rounded-sm ${rab.status === 'sent' ? 'bg-green-100 text-green-700' :
                          rab.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                            'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                        {rab.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-outline font-bold uppercase tracking-widest">Grand Total</span>
                        <span className="text-sm font-bold text-on-surface">Rp {Number(rab.grand_total).toLocaleString('id-ID')}</span>
                      </div>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_forward</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-on-surface-variant">
                  Belum ada RAB.
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-surface border-t border-surface-container-low flex justify-end gap-3">
              <button
                onClick={() => setRabModalLead(null)}
                className="px-4 py-2 text-sm font-bold uppercase tracking-widest text-outline hover:bg-surface-container-low transition-colors rounded-sm cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => navigate('/admin/rab/create', { state: { lead_id: rabModalLead.id } })}
                className="px-4 py-2 bg-primary text-white text-sm font-bold uppercase tracking-widest rounded-sm shadow-md hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Buat RAB Baru
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Leads;
