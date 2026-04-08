import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatAdminDateTime } from '../../utils/dateUtils';

const ActivityLogs = () => {
  const { authFetch } = useAuth();
  const { searchQuery: globalSearch } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Sync topbar search into local search
  useEffect(() => {
    setSearch(globalSearch);
    setPage(1);
  }, [globalSearch]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`/api/activity_logs.php?page=${page}&limit=25&search=${encodeURIComponent(search)}&entity_type=${filterType === 'all' ? '' : filterType}`);
      const data = await res.json();
      
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        setError(data.error || 'Failed to fetch activity logs.');
      }
    } catch (err) {
      setError('An error occurred while fetching activity logs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filterType, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getLogIcon = (action, entityType) => {
    if (entityType === 'lead') return { icon: 'contact_page', bg: 'bg-orange-100 text-orange-600' };
    if (entityType === 'auth') return { icon: 'vpn_key', bg: 'bg-slate-100 text-slate-600' };
    if (entityType === 'post') return { icon: 'edit_square', bg: 'bg-blue-100 text-blue-600' };
    if (entityType === 'product') return { icon: 'precision_manufacturing', bg: 'bg-indigo-100 text-indigo-600' };
    if (action.includes('comment')) return { icon: 'forum', bg: 'bg-teal-100 text-teal-600' };
    return { icon: 'history', bg: 'bg-gray-100 text-gray-500' };
  };

  const formatDate = (dateStr) => {
    return formatAdminDateTime(dateStr, {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 tracking-tight font-headline">Activity Logs</h2>
          <p className="text-sm md:text-base text-slate-500 font-body mt-1">System-wide audit trail for users and automated events.</p>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <span className="text-sm font-bold text-slate-400">Total: {total} Logs</span>
          <button onClick={fetchLogs} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-sm font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-sm shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search action or details..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
          />
        </form>
        <div className="flex w-full md:w-auto gap-2">
          <select 
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-sm px-4 py-2 text-sm text-slate-700 focus:outline-none w-full md:w-auto"
          >
            <option value="all">All Modules</option>
            <option value="lead">Leads</option>
            <option value="product">Products</option>
            <option value="post">Blog Posts</option>
            <option value="comment">Comments</option>
            <option value="auth">Authentication</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-sm border border-red-100 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Log List */}
      <div className="bg-white rounded-sm shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center py-20 text-slate-400">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">history</span>
            <p className="text-lg font-medium text-slate-500">No activity logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Icon</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">User / IP</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Details</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const ui = getLogIcon(log.action, log.entity_type);
                  return (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ui.bg}`}>
                          <span className="material-symbols-outlined text-[18px]">{ui.icon}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-blue-950 capitalize">{log.action.replace(/_/g, ' ')}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">{log.entity_type}{(log.entity_id ? ` #${log.entity_id}` : '')}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-700">{log.user_name || 'System / Auto'}</div>
                        <div className="text-[10px] text-slate-400 tracking-wider font-mono bg-slate-100 inline-block px-1 rounded">{log.ip_address || 'unknown'}</div>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <p className="text-sm text-slate-600 line-clamp-2" title={log.details}>{log.details || '-'}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-mono text-[11px]">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Details */}
        {!loading && totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center mt-auto">
            <span className="text-sm text-slate-500">
              Page <span className="font-bold text-blue-900">{page}</span> of <span className="font-bold text-blue-900">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 bg-white border border-slate-200 rounded-sm text-slate-500 hover:text-blue-900 disabled:opacity-50 transition-colors"
                title="Previous Page"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 bg-white border border-slate-200 rounded-sm text-slate-500 hover:text-blue-900 disabled:opacity-50 transition-colors"
                title="Next Page"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
