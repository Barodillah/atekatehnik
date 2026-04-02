import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatAdminDateTime, formatAdminTime } from '../../utils/dateUtils';

// ── Simple Markdown → HTML for detail view ──────────────────────────
const parseMd = (text) => {
  if (!text) return '';
  let h = text;
  h = h.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
  h = h.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 text-xs px-1 py-0.5 rounded font-mono">$1</code>');
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 underline">$1</a>');
  h = h.replace(/^[\-\*] (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>');
  h = h.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm" value="$1">$2</li>');
  h = h.replace(/\n\n/g, '</p><p class="mb-1.5">');
  h = h.replace(/\n/g, '<br/>');
  return h;
};

const ChatHistory = () => {
  const { authFetch } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ totalSessions: 0, activeSessions: 0, totalMessages: 0, todaySessions: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [detailMessages, setDetailMessages] = useState([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);

  // ── Fetch sessions ────────────────────────────────────────────────
  const fetchSessions = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ action: 'sessions', page, limit: 15 });
      if (filterStatus) params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);

      const res = await authFetch(`/api/chat_history.php?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
        setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
      }
    } catch (err) {
      setError('Gagal memuat data chat sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Fetch stats ───────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await authFetch('/api/chat_history.php?action=stats');
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch {}
  };

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, [filterStatus]);

  // ── Search with Enter ─────────────────────────────────────────────
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchSessions(1);
    }
  };

  // ── Open detail modal ─────────────────────────────────────────────
  const openDetail = async (session) => {
    setSelectedSession(session);
    setIsDetailOpen(true);
    setIsLoadingDetail(true);
    try {
      const res = await authFetch(`/api/chat_history.php?action=messages&session_id=${session.id}`);
      const data = await res.json();
      if (data.success) {
        setDetailMessages(data.messages);
        setSelectedSession(data.session);
      }
    } catch (err) {
      setError('Gagal memuat detail percakapan.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedSession(null);
    setDetailMessages([]);
  };

  // ── Delete session ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await authFetch(`/api/chat_history.php?id=${id}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchSessions(pagination.page);
      fetchStats();
    } catch {
      setError('Gagal menghapus session.');
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────
  const formatDate = (d) => {
    return formatAdminDateTime(d);
  };

  const truncate = (str, len = 40) => {
    if (!str) return '—';
    return str.length > len ? str.substring(0, len) + '…' : str;
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Chat History</h2>
          <p className="text-on-surface-variant mt-1">Riwayat percakapan pengunjung dengan Ateka AI Assistant.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface-container-highest border-none rounded-sm px-4 py-2.5 text-sm font-semibold text-primary cursor-pointer appearance-none"
          >
            <option value="">Semua Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Cari IP / URL..."
              className="bg-surface-container-highest border-none rounded-sm py-2.5 pl-10 pr-4 text-sm w-48 focus:ring-2 focus:ring-blue-900/20"
            />
          </div>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-6 flex flex-col justify-between">
          <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Total Sesi</span>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-primary font-headline">{stats.totalSessions}</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 flex flex-col justify-between">
          <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Aktif</span>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-primary font-headline">{stats.activeSessions}</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 flex flex-col justify-between">
          <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Hari Ini</span>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-primary font-headline">{stats.todaySessions}</span>
          </div>
        </div>
        <div className="bg-primary-container p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <span className="text-xs font-bold font-label uppercase tracking-widest text-on-primary-container">Total Pesan</span>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-white font-headline tracking-tighter">{stats.totalMessages}</span>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5 pointer-events-none">chat</span>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-surface-container-lowest shadow-sm rounded-sm overflow-hidden border border-surface-container-low">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none">Session</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none">Pesan Pertama</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">IP</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Pesan</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Waktu</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
                    <p className="text-sm text-on-surface-variant mt-2">Memuat data...</p>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block">forum</span>
                    Belum ada riwayat chat.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                    onClick={() => openDetail(s)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-primary font-bold">{s.session_key?.substring(0, 8)}…</span>
                        <span className="text-[10px] text-on-surface-variant/60 mt-0.5">{truncate(s.page_url, 30)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-on-surface-variant max-w-[200px] block truncate">
                        {truncate(s.first_message, 50) || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-mono text-on-surface-variant">{s.visitor_ip || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-highest text-sm font-bold text-primary">
                        {s.message_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs text-on-surface-variant">{formatDate(s.last_message_at || s.started_at)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                        s.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDeleteId(s.id)}
                        className="text-on-surface-variant hover:text-red-500 transition-colors p-1"
                        title="Hapus sesi"
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
        <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
          <span className="text-xs font-medium text-on-surface-variant">
            Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} sesi)
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => fetchSessions(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 bg-surface-container-highest rounded-sm hover:opacity-80 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => fetchSessions(p)}
                className={`px-3 py-1 text-xs font-bold rounded-sm ${p === pagination.page ? 'bg-primary-container text-white' : 'bg-surface-container-highest text-on-surface hover:bg-slate-200'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => fetchSessions(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 bg-surface-container-highest rounded-sm hover:opacity-80 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ────────────────────────────────── */}
      {deleteId && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/40 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-sm shadow-2xl overflow-hidden">
            <div className="p-8 text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-red-400">warning</span>
              <h3 className="text-xl font-headline font-bold text-primary-container">Hapus Sesi Chat?</h3>
              <p className="text-sm text-on-surface-variant">Semua pesan dalam sesi ini akan dihapus secara permanen.</p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-outline hover:bg-surface-container-low transition-colors rounded-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="px-6 py-2.5 bg-red-500 text-white font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Detail Chat Modal ────────────────────────────────────────── */}
      {isDetailOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/40 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest w-full max-w-2xl max-h-[85vh] rounded-sm shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-surface-container-low bg-surface shrink-0">
              <div>
                <h3 className="text-xl font-headline font-bold text-primary-container flex items-center gap-2">
                  <span className="material-symbols-outlined">smart_toy</span>
                  Detail Percakapan
                </h3>
                {selectedSession && (
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-on-surface-variant">
                    <span className="font-mono">{selectedSession.session_key?.substring(0, 12)}…</span>
                    <span>•</span>
                    <span>{selectedSession.visitor_ip || 'IP Unknown'}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedSession.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedSession.status}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={closeDetail}
                className="text-slate-400 hover:text-error transition-colors p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 chathistory-scroll">
              {isLoadingDetail ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
                  <p className="text-sm text-on-surface-variant">Memuat percakapan...</p>
                </div>
              ) : detailMessages.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 block">chat_bubble_outline</span>
                  <p className="text-sm">Tidak ada pesan dalam sesi ini.</p>
                </div>
              ) : (
                detailMessages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === 'user' ? 'bg-amber-600 text-white' : 'bg-blue-900 text-white'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {msg.role === 'user' ? 'person' : 'smart_toy'}
                      </span>
                    </div>

                    <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* Role Label */}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-1 px-1">
                        {msg.role === 'user' ? 'Pengunjung' : 'Ateka AI'}
                      </span>
                      {/* Bubble */}
                      <div className={`p-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-amber-600 text-white rounded-2xl rounded-tr-none shadow-md'
                          : `bg-white text-on-surface rounded-2xl rounded-tl-none shadow-sm border border-surface-container-low ${msg.is_error === 1 || msg.is_error === '1' ? 'border-red-300 bg-red-50' : ''}`
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div 
                            className="chathistory-md prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: parseMd(msg.content) }}
                          />
                        ) : (
                          <span>{msg.content}</span>
                        )}
                      </div>
                      {/* Timestamp */}
                      <span className="text-[10px] text-on-surface-variant/40 mt-1 px-1">
                        {msg.sent_at ? formatAdminTime(msg.sent_at) : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            {selectedSession && (
              <div className="px-6 py-4 border-t border-surface-container-low bg-surface shrink-0 flex justify-between items-center">
                <div className="text-xs text-on-surface-variant space-x-4">
                  <span><strong>{selectedSession.message_count}</strong> pesan</span>
                  <span>Mulai: {formatDate(selectedSession.started_at)}</span>
                </div>
                <button
                  onClick={closeDetail}
                  className="px-6 py-2 text-sm font-bold uppercase tracking-widest text-outline hover:bg-surface-container-low transition-colors rounded-sm cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Injected scroll styles */}
      <style>{`
        .chathistory-scroll::-webkit-scrollbar { width: 4px; }
        .chathistory-scroll::-webkit-scrollbar-track { background: transparent; }
        .chathistory-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
        .chathistory-md strong { font-weight: 700; }
        .chathistory-md em { font-style: italic; }
        .chathistory-md a { color: #2563eb; text-decoration: underline; }
        .chathistory-md li { margin-bottom: 0.125rem; }
        .chathistory-md p { margin-bottom: 0.25rem; }
        .chathistory-md p:last-child { margin-bottom: 0; }
      `}</style>
    </div>
  );
};

export default ChatHistory;
