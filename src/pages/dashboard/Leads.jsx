import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth';

const Leads = () => {
  const { authFetch } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, follow_up: 0, conversionRate: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Modal form state
  const [formData, setFormData] = useState({
    name: '', company: '', capacity_ref: '', location: '',
    email: '', phone: '', service_request: ''
  });

  const statusStyleMap = {
    'New': { bg: 'bg-secondary-container text-on-secondary-container' },
    'Follow-up': { bg: 'bg-blue-100 text-blue-800' },
    'Closed': { bg: 'bg-surface-container-high text-on-surface-variant' },
  };

  // Fetch leads
  const fetchLeads = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/leads.php?page=${page}&limit=10`);
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
    } catch {}
  };

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

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

  // Submit new lead
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/leads.php', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ name: '', company: '', capacity_ref: '', location: '', email: '', phone: '', service_request: '' });
        fetchLeads();
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

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Customer Leads</h2>
          <p className="text-on-surface-variant mt-1">Real-time overview of incoming service requests and industrial inquiries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-highest text-primary font-semibold rounded-sm hover:bg-slate-200 transition-all text-sm">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary font-semibold rounded-sm hover:opacity-90 transition-all text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Entry
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-surface-container-low p-6 flex flex-col justify-between">
          <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Active Leads</span>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-primary font-headline">{stats.total}</span>
          </div>
        </div>
        <div className="md:col-span-1 bg-surface-container-low p-6 flex flex-col justify-between">
          <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">New</span>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-primary font-headline">{stats.new}</span>
          </div>
        </div>
        <div className="md:col-span-2 bg-primary-container p-6 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <span className="text-xs font-bold font-label uppercase tracking-widest text-on-primary-container">Conversion Rate</span>
            <div className="mt-4 flex items-end gap-6">
              <span className="text-4xl font-extrabold text-white font-headline tracking-tighter">{stats.conversionRate}%</span>
              <div className="flex-1 h-2 bg-blue-900 mb-2 overflow-hidden">
                <div className="h-full bg-secondary-container" style={{ width: `${stats.conversionRate}%` }}></div>
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5 pointer-events-none">monitoring</span>
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
                    <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
                    Belum ada leads.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{lead.name}</span>
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
                      <div className="inline-flex items-center px-2 py-1 bg-surface-container text-xs font-bold rounded-sm border-l-2 border-primary max-w-[200px] truncate">
                        {lead.service_request}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-on-surface-variant">
                        {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                    <td className="px-6 py-4 text-right">
                      <button className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
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
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(p => (
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

      {/* Modal Input Form */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/40 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-8 py-6 border-b border-surface-container-low bg-surface">
              <h3 className="text-2xl font-headline font-bold text-primary-container">New Lead Entry</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-error transition-colors p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={handleSubmitLead}>
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
                  <select name="capacity_ref" value={formData.capacity_ref} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none appearance-none text-sm font-semibold">
                    <option value="">Select Capacity</option>
                    <option value="1-5">1-5 Ton/Hour</option>
                    <option value="5-15">5-15 Ton/Hour</option>
                    <option value="15+">15+ Ton/Hour</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Location Region</label>
                  <input name="location" value={formData.location} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" placeholder="City or Region" type="text" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Email Contact *</label>
                  <input required name="email" value={formData.email} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" placeholder="name@company.com" type="email" />
                </div>
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Phone Number *</label>
                  <input required name="phone" value={formData.phone} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none text-sm" placeholder="+62 812-XXXX-XXXX" type="tel" />
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2">Lead Notes / Message *</label>
                <textarea required name="service_request" value={formData.service_request} onChange={handleFormChange} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-secondary transition-colors py-3 px-4 outline-none resize-none text-sm" placeholder="Details about this lead's inquiry..." rows={3}></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-container-low">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-outline hover:bg-surface-container-low transition-colors rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-primary-container text-white font-bold text-sm uppercase tracking-widest rounded-sm shadow-md hover:bg-secondary transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Saving...
                    </>
                  ) : (
                    'Save Lead'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Leads;
