import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatAdminDateTime, formatAdminTime } from '../../utils/dateUtils';

// ── Markdown Parser ──────────────────────────────────────────────────
const parseMarkdown = (text) => {
  if (!text) return '';
  let html = text;
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/^(\*\*\*|---|___)$/gm, '<hr class="my-3 border-t border-gray-300/50"/>');
  html = html.replace(/^###### (.+)$/gm, '<h6 class="text-xs font-bold mt-2 mb-1">$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5 class="text-xs font-bold mt-2 mb-1">$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h6 class="text-sm font-bold mt-2 mb-1">$1</h6>');
  html = html.replace(/^### (.+)$/gm, '<h5 class="text-sm font-semibold mt-2 mb-1">$1</h5>');
  html = html.replace(/^## (.+)$/gm, '<h4 class="text-base font-bold mt-3 mb-1">$1</h4>');
  html = html.replace(/^# (.+)$/gm, '<h3 class="text-lg font-bold mt-3 mb-1.5">$1</h3>');
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-green-300 text-xs p-3 rounded-lg my-2 overflow-x-auto font-mono whitespace-pre-wrap">$1</pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-red-600 text-xs px-1.5 py-0.5 rounded font-mono">$1</code>');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em class="italic">$1</em>');
  html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em class="italic">$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del class="line-through opacity-60">$1</del>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-2"/>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800 transition-colors">$1</a>');
  html = html.replace(/^&gt;&gt; (.+)$/gm, '<blockquote class="border-l-4 border-amber-400 bg-amber-50/50 pl-3 py-1 my-1 ml-4 text-xs italic text-gray-600">$1</blockquote>');
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-blue-400 bg-blue-50/50 pl-3 py-1 my-1 text-xs italic text-gray-600">$1</blockquote>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="chat-ol-item ml-4 text-sm list-decimal" value="$1">$2</li>');
  html = html.replace(/^[\-\*\+] (.+)$/gm, '<li class="chat-ul-item ml-4 text-sm list-disc">$1</li>');
  html = html.replace(/((?:<li class="chat-ol-item[^>]*>.*?<\/li>\n?)+)/g, '<ol class="space-y-0.5 my-1.5">$1</ol>');
  html = html.replace(/((?:<li class="chat-ul-item[^>]*>.*?<\/li>\n?)+)/g, '<ul class="space-y-0.5 my-1.5">$1</ul>');
  html = html.replace(/\\([*_~`#>\-\[\]()!])/g, '$1');
  html = html.replace(/\n\n/g, '</p><p class="mb-2">');
  html = html.replace(/\n/g, '<br/>');
  return html;
};

// ── JSON Parser from AI Response ──────────────────────────────────────
const parseAIResponse = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      try { return JSON.parse(match[1]); } catch (e2) {}
    }
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      try { return JSON.parse(text.substring(startIdx, endIdx + 1)); } catch (e3) {}
    }
  }
  return { answer: text, quick_questions: [], related_links: [] };
};

const ChatHistory = () => {
  const { authFetch } = useAuth();
  const { searchQuery: globalSearch } = useOutletContext();

  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ totalSessions: 0, activeSessions: 0, totalMessages: 0, todaySessions: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync topbar search into local search
  useEffect(() => {
    setSearchQuery(globalSearch);
  }, [globalSearch]);

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
    fetchSessions(1);
    fetchStats();
  }, [filterStatus, globalSearch]);

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
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary font-headline tracking-tight">Chat History</h2>
          <p className="text-sm md:text-base text-on-surface-variant mt-1">Riwayat percakapan pengunjung dengan Ateka AI Assistant.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto bg-surface-container-highest border-none rounded-sm px-4 py-2.5 text-sm font-semibold text-primary cursor-pointer appearance-none"
          >
            <option value="">Semua Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Cari IP / URL..."
              className="bg-surface-container-highest border-none rounded-sm py-2.5 pl-10 pr-4 text-sm w-full sm:w-48 focus:ring-2 focus:ring-blue-900/20"
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-1 bg-surface-container-low p-4 md:p-6 flex flex-col justify-between">
          <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Total Sesi</span>
          <div className="mt-2 md:mt-4">
            <span className="text-3xl md:text-4xl font-extrabold text-primary font-headline">{stats.totalSessions}</span>
          </div>
        </div>
        <div className="col-span-1 bg-surface-container-low p-4 md:p-6 flex flex-col justify-between">
          <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Aktif</span>
          <div className="mt-2 md:mt-4">
            <span className="text-3xl md:text-4xl font-extrabold text-primary font-headline">{stats.activeSessions}</span>
          </div>
        </div>
        <div className="col-span-1 bg-surface-container-low p-4 md:p-6 flex flex-col justify-between">
          <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Hari Ini</span>
          <div className="mt-2 md:mt-4">
            <span className="text-3xl md:text-4xl font-extrabold text-primary font-headline">{stats.todaySessions}</span>
          </div>
        </div>
        <div className="col-span-1 bg-primary-container p-4 md:p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-primary-container">Total Pesan</span>
            <div className="mt-2 md:mt-4">
              <span className="text-3xl md:text-4xl font-extrabold text-white font-headline tracking-tighter">{stats.totalMessages}</span>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5 pointer-events-none hidden md:block">chat</span>
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
        <div className="px-4 md:px-6 py-4 bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-4 border-t border-outline-variant/10">
          <span className="text-[10px] md:text-xs font-medium text-on-surface-variant">
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
                  detailMessages.map((msg, i) => {
                  let parsedMsg = null;
                  if (msg.role === 'assistant' && !(msg.is_error === 1 || msg.is_error === '1')) {
                    parsedMsg = parseAIResponse(msg.content);
                  }

                  return (
                  <div key={msg.id || i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === 'user' ? 'bg-amber-600 text-white' : 'bg-blue-900 text-white'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {msg.role === 'user' ? 'person' : 'smart_toy'}
                      </span>
                    </div>

                    <div className={`max-w-[85%] flex flex-col min-w-0 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* Role Label */}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-1 px-1">
                        {msg.role === 'user' ? 'Pengunjung' : 'Ateka AI'}
                      </span>
                      {/* Bubble */}
                      <div className={`p-3 text-sm leading-relaxed overflow-hidden ${
                        msg.role === 'user'
                          ? 'bg-amber-600 text-white rounded-2xl rounded-tr-none shadow-md'
                          : `bg-white text-on-surface rounded-2xl rounded-tl-none shadow-sm border border-surface-container-low ${msg.is_error === 1 || msg.is_error === '1' ? 'border-red-300 bg-red-50' : ''}`
                      }`}>
                        {msg.role === 'assistant' ? (
                          <>
                            <div 
                              className="chatbot-markdown prose prose-sm max-w-none break-words"
                              dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.is_error ? msg.content : parsedMsg.answer) }}
                            />
                            {/* Rich Related Links UI */}
                            {parsedMsg && parsedMsg.related_links && parsedMsg.related_links.length > 0 && (
                              <div className="mt-4 flex flex-col sm:flex-row gap-2.5 sm:overflow-x-auto pb-2 sm:snap-x chatbot-scroll sm:-mr-2 sm:pr-2">
                                {parsedMsg.related_links.map((link, idx) => (
                                  <Link to={link.link || '#'} key={idx} target="_blank" className="sm:snap-start shrink-0 w-full sm:w-44 bg-surface-container-lowest hover:bg-surface-container transition-colors rounded-xl border border-outline-variant/30 overflow-hidden flex flex-col shadow-sm group">
                                    {link.image && (
                                      <div className="h-24 w-full bg-surface-container-high overflow-hidden shrink-0">
                                        <img src={link.image} alt={link.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.style.display = 'none' }} />
                                      </div>
                                    )}
                                    <div className="p-2.5 flex-1 flex flex-col">
                                      <h5 className="text-[11px] font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{link.title || 'Informasi Terkait'}</h5>
                                      {link.subtitle && <p className="text-[10px] text-on-surface-variant line-clamp-2 mt-0.5 leading-tight">{link.subtitle}</p>}
                                      <div className="mt-auto pt-2 text-[10px] font-semibold text-primary flex items-center gap-1">
                                        Lihat Detail <span className="material-symbols-outlined text-[12px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <span>{msg.content}</span>
                        )}
                      </div>
                      
                      {/* AI Quick Questions Log */}
                      {msg.role === 'assistant' && !msg.is_error && parsedMsg?.quick_questions?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {parsedMsg.quick_questions.map((q, qIndex) => (
                            <span
                              key={qIndex}
                              className="text-[10px] bg-surface border border-outline-variant/20 text-on-surface-variant px-2 py-1 rounded-full leading-tight shadow-sm opacity-70"
                            >
                              ? {q}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <span className="text-[10px] text-on-surface-variant/40 mt-1 px-1">
                        {msg.sent_at ? formatAdminTime(msg.sent_at) : ''}
                      </span>
                    </div>
                  </div>
                );
                })
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
        .chatbot-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .chatbot-scroll::-webkit-scrollbar-track { background: transparent; }
        .chatbot-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
        .chatbot-markdown strong { font-weight: 700; }
        .chatbot-markdown em { font-style: italic; }
        .chatbot-markdown del { text-decoration: line-through; opacity: 0.6; }
        .chatbot-markdown a { color: #2563eb; text-decoration: underline; }
        .chatbot-markdown a:hover { color: #1d4ed8; }
        .chatbot-markdown h3, .chatbot-markdown h4, .chatbot-markdown h5, .chatbot-markdown h6 {
          margin-top: 0.5rem; margin-bottom: 0.25rem; font-weight: 600;
        }
        .chatbot-markdown ul, .chatbot-markdown ol { padding-left: 1rem; }
        .chatbot-markdown li { margin-bottom: 0.125rem; }
        .chatbot-markdown blockquote { margin: 0.375rem 0; }
        .chatbot-markdown hr { margin: 0.5rem 0; border-color: rgba(0,0,0,0.1); }
        .chatbot-markdown pre { white-space: pre-wrap; word-break: break-word; }
        .chatbot-markdown code { font-size: 0.75rem; }
        .chatbot-markdown p { margin-bottom: 0.5rem; }
        .chatbot-markdown p:last-child { margin-bottom: 0; }
      `}</style>
    </div>
  );
};

export default ChatHistory;
