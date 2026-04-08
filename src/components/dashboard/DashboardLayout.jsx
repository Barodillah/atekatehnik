import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout, authFetch } = useAuth();

  const [isEntryModalOpen, setEntryModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── Global Search State ─────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef(null);
  const searchDropdownRef = useRef(null);

  // Admin search dropdown state (only active on /admin home page)
  const [adminSearchResults, setAdminSearchResults] = useState([]);
  const [isAdminSearching, setIsAdminSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const isOnDashboardHome = location.pathname === '/admin' || location.pathname === '/admin/';

  // Debounce search input (400ms)
  useEffect(() => {
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchInput]);

  // Fetch admin search results when on dashboard home
  useEffect(() => {
    if (!isOnDashboardHome || !debouncedSearch.trim()) {
      setAdminSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const fetchAdminSearch = async () => {
      setIsAdminSearching(true);
      try {
        const res = await authFetch(`/api/admin_search.php?q=${encodeURIComponent(debouncedSearch)}&limit=12`);
        const data = await res.json();
        if (data.success) {
          setAdminSearchResults(data.results);
          setShowSearchDropdown(true);
        }
      } catch { /* silent */ }
      finally { setIsAdminSearching(false); }
    };
    fetchAdminSearch();
  }, [debouncedSearch, isOnDashboardHome, authFetch]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search when route changes
  useEffect(() => {
    setSearchInput('');
    setDebouncedSearch('');
    setShowSearchDropdown(false);
    setAdminSearchResults([]);
  }, [location.pathname]);

  // ── Notification State ─────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifData, setNotifData] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const res = await fetch('/api/admin_notifications.php');
      const json = await res.json();
      if (json.success) setNotifData(json);
    } catch {
      // silent
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Fetch on mount + poll every 60s
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr.replace(' ', 'T') + '+07:00');
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const colorMap = {
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-500' },
    green:  { bg: 'bg-green-100',  text: 'text-green-600',  dot: 'bg-green-500' },
    red:    { bg: 'bg-red-100',    text: 'text-red-500',    dot: 'bg-red-500' },
    amber:  { bg: 'bg-amber-100',  text: 'text-amber-600',  dot: 'bg-amber-500' },
    blue:   { bg: 'bg-blue-100',   text: 'text-blue-600',   dot: 'bg-blue-500' },
  };

  // Show loading screen while verifying token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
          <p className="text-sm font-bold text-primary uppercase tracking-widest">Verifying Session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClasses = (path) => {
    return isActive(path)
      ? "flex items-center gap-3 px-4 py-3 bg-blue-900 text-orange-400 rounded-sm border-l-4 border-orange-400 scale-95 duration-150 cursor-pointer"
      : "flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-blue-900/50 transition-all duration-200 cursor-pointer";
  };

  const handleLogout = async () => {
    await logout();
  };

  const badge = notifData?.badge || 0;
  const counts = notifData?.counts || {};
  const items = notifData?.items || [];

  return (
    <div className="bg-surface text-on-surface font-body flex min-h-screen text-left">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-blue-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`h-screen w-64 fixed left-0 top-0 z-50 bg-blue-950 border-r border-blue-900/50 shadow-2xl flex flex-col py-6 font-inter text-sm font-medium tracking-wide transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-6 mb-8 mt-2 lg:mt-0 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tighter uppercase hidden lg:block">Industrial Admin</h1>
            <p className="text-[10px] text-orange-400/80 uppercase tracking-widest mt-1 hidden lg:block">Engineering Precision</p>
            <h1 className="text-lg font-extrabold text-white tracking-tighter uppercase block lg:hidden">Ateka Tehnik</h1>
            <p className="text-[10px] text-orange-400/80 uppercase tracking-widest mt-1 block lg:hidden">Industrial Admin</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white cursor-pointer p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/admin')} to="/admin">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/admin/leads')} to="/admin/leads">
            <span className="material-symbols-outlined">person_search</span>
            <span>Customer Leads</span>
            {counts.leads > 0 && <span className="ml-auto bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">{counts.leads}</span>}
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/admin/products')} to="/admin/products">
            <span className="material-symbols-outlined">precision_manufacturing</span>
            <span>Product Management</span>
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/admin/posts')} to="/admin/posts">
            <span className="material-symbols-outlined">edit_note</span>
            <span>Blog Posts</span>
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/admin/comments')} to="/admin/comments">
            <span className="material-symbols-outlined">forum</span>
            <span>Comments</span>
            {counts.comments > 0 && <span className="ml-auto bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">{counts.comments}</span>}
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/admin/chat-history')} to="/admin/chat-history">
            <span className="material-symbols-outlined">smart_toy</span>
            <span>Chat History</span>
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/admin/analytics')} to="/admin/analytics">
            <span className="material-symbols-outlined">monitoring</span>
            <span>Analytics</span>
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/admin/wa-clicks')} to="/admin/wa-clicks">
            <span className="material-symbols-outlined">ads_click</span>
            <span>WA Clicks</span>
            {counts.waClicks > 0 && <span className="ml-auto bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">{counts.waClicks}</span>}
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/admin/logs')} to="/admin/logs">
            <span className="material-symbols-outlined">history</span>
            <span>Activity Logs</span>
          </Link>
        </div>
        <div className="mt-auto px-4 pt-4 border-t border-blue-900/30">
          <button
            onClick={() => { setIsMobileMenuOpen(false); setEntryModalOpen(true); }}
            className="w-full bg-orange-400 text-blue-950 py-2 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-orange-500 transition-colors mb-4 cursor-pointer"
          >
            New Entry
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="ml-0 lg:ml-64 flex-1 flex flex-col min-h-screen transition-all duration-300">
        {/* Topbar */}
        <header className="w-full h-16 sticky top-0 z-30 bg-slate-50 shadow-sm flex justify-between items-center px-4 lg:px-6 font-manrope tracking-tight">
          <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 lg:hidden text-slate-500 hover:text-primary transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <span className="text-xl font-bold text-blue-900 uppercase hidden lg:block shrink-0">Ateka Tehnik</span>
            <div className="hidden lg:block h-8 w-px bg-slate-200 mx-2 shrink-0"></div>
            <div className="relative flex-1 max-w-sm mr-2 lg:mr-0 min-w-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base md:text-lg">search</span>
              <input
                className="bg-slate-100 border-none rounded-full py-1.5 pl-9 md:pl-10 pr-3 md:pr-4 text-[13px] md:text-sm w-full focus:ring-2 focus:ring-blue-900/20 truncate"
                placeholder={
                  location.pathname.startsWith('/admin/leads') ? "Search leads..." :
                    location.pathname.startsWith('/admin/products') ? "Search inventory..." :
                      location.pathname.startsWith('/admin/posts') ? "Search blog posts..." :
                        location.pathname.startsWith('/admin/comments') ? "Search comments..." :
                          location.pathname.startsWith('/admin/chat-history') ? "Search chat sessions..." :
                            location.pathname.startsWith('/admin/analytics') ? "Search pages..." :
                              location.pathname.startsWith('/admin/wa-clicks') ? "Search WA clicks..." :
                                location.pathname.startsWith('/admin/logs') ? "Search logs..." :
                                  "Search data..."
                }
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setDebouncedSearch(''); setShowSearchDropdown(false); setAdminSearchResults([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}

              {/* Admin Search Dropdown (Dashboard Home only) */}
              {isOnDashboardHome && showSearchDropdown && searchInput && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto" ref={searchDropdownRef}>
                  {isAdminSearching ? (
                    <div className="p-6 flex flex-col items-center text-slate-400">
                      <span className="material-symbols-outlined animate-spin text-xl mb-1">progress_activity</span>
                      <span className="text-xs">Searching...</span>
                    </div>
                  ) : adminSearchResults.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                      {adminSearchResults.map(item => {
                        const colorMap = {
                          orange: 'bg-orange-100 text-orange-600',
                          blue: 'bg-blue-100 text-blue-600',
                          indigo: 'bg-indigo-100 text-indigo-600',
                          teal: 'bg-teal-100 text-teal-600',
                          slate: 'bg-slate-100 text-slate-600',
                        };
                        const typeLabels = { lead: 'Lead', post: 'Post', product: 'Product', comment: 'Comment', log: 'Activity Log' };
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => {
                                setSearchInput('');
                                setDebouncedSearch('');
                                setShowSearchDropdown(false);
                                setAdminSearchResults([]);
                                navigate(item.link);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                            >
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorMap[item.color] || 'bg-slate-100 text-slate-500'}`}>
                                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                              </div>
                              {item.image && (
                                <img src={item.image} alt="" className="w-9 h-9 rounded-sm object-cover shrink-0 bg-slate-100" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-900 transition-colors">{item.title}</p>
                                <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {item.badge && (
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{item.badge}</span>
                                )}
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{typeLabels[item.type] || item.type}</span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-slate-400">
                      <span className="material-symbols-outlined text-2xl mb-1 block opacity-40">search_off</span>
                      <p className="text-xs">No results for "{searchInput}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 shrink-0">

            {/* ══ Notification Bell ══ */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
                className="text-slate-500 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer active:opacity-80 relative"
              >
                <span className="material-symbols-outlined">notifications</span>
                {badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 leading-none animate-pulse shadow-sm">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {notifOpen && (
                <div className="absolute right-[-50px] sm:right-[-20px] lg:right-0 top-12 w-[calc(100vw-32px)] sm:w-[380px] lg:w-[420px] max-w-[420px] bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                  {/* Header */}
                  <div className="px-5 py-4 bg-gradient-to-r from-blue-950 to-blue-900 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-sm">Notifications</h3>
                      <p className="text-blue-300 text-[10px] uppercase tracking-widest mt-0.5">Last 24 hours</p>
                    </div>
                    <button
                      onClick={fetchNotifications}
                      className="text-blue-300 hover:text-white transition-colors p-1 cursor-pointer"
                      title="Refresh"
                    >
                      <span className={`material-symbols-outlined text-sm ${notifLoading ? 'animate-spin' : ''}`}>refresh</span>
                    </button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-5 gap-0 border-b border-slate-100">
                    <button onClick={() => { navigate('/admin/leads'); setNotifOpen(false); }} className="flex flex-col items-center py-3 hover:bg-orange-50 transition-colors cursor-pointer group">
                      <span className="material-symbols-outlined text-orange-500 text-lg">person_add</span>
                      <span className="text-lg font-extrabold text-slate-800 leading-none mt-1">{counts.leads || 0}</span>
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Leads</span>
                    </button>
                    <button onClick={() => { navigate('/admin/wa-clicks'); setNotifOpen(false); }} className="flex flex-col items-center py-3 hover:bg-green-50 transition-colors cursor-pointer group">
                      <span className="material-symbols-outlined text-green-500 text-lg">ads_click</span>
                      <span className="text-lg font-extrabold text-slate-800 leading-none mt-1">{counts.waClicks || 0}</span>
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">WA CTA</span>
                    </button>
                    <button onClick={() => { navigate('/admin/analytics'); setNotifOpen(false); }} className="flex flex-col items-center py-3 hover:bg-red-50 transition-colors cursor-pointer group">
                      <span className="material-symbols-outlined text-red-400 text-lg">favorite</span>
                      <span className="text-lg font-extrabold text-slate-800 leading-none mt-1">{counts.likes || 0}</span>
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Likes</span>
                    </button>
                    <button onClick={() => { navigate('/admin/comments'); setNotifOpen(false); }} className="flex flex-col items-center py-3 hover:bg-amber-50 transition-colors cursor-pointer group">
                      <span className="material-symbols-outlined text-amber-500 text-lg">forum</span>
                      <span className="text-lg font-extrabold text-slate-800 leading-none mt-1">{counts.comments || 0}</span>
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Comments</span>
                    </button>
                    <button onClick={() => { navigate('/admin/analytics'); setNotifOpen(false); }} className="flex flex-col items-center py-3 hover:bg-blue-50 transition-colors cursor-pointer group">
                      <span className="material-symbols-outlined text-blue-500 text-lg">language</span>
                      <span className="text-lg font-extrabold text-slate-800 leading-none mt-1">{counts.uniqueIps || 0}</span>
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">IPs</span>
                    </button>
                  </div>

                  {/* Timeline Items */}
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifLoading && !notifData ? (
                      <div className="py-10 text-center">
                        <span className="material-symbols-outlined text-primary animate-spin text-2xl">progress_activity</span>
                      </div>
                    ) : items.length === 0 ? (
                      <div className="py-10 text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">notifications_off</span>
                        <p className="text-xs text-slate-400 font-medium">No recent activity</p>
                      </div>
                    ) : (
                      items.map((item, i) => {
                        const c = colorMap[item.color] || colorMap.blue;
                        return (
                          <button
                            key={i}
                            onClick={() => { navigate(item.link); setNotifOpen(false); }}
                            className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer border-b border-slate-50 last:border-b-0 group"
                          >
                            <div className={`w-8 h-8 rounded-full ${c.bg} ${c.text} flex items-center justify-center shrink-0 mt-0.5`}>
                              <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 leading-tight truncate group-hover:text-blue-900 transition-colors">{item.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5 truncate">{item.desc}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0 mt-1">{formatTimeAgo(item.time)}</span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {items.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={() => { navigate('/admin/logs'); setNotifOpen(false); }}
                        className="text-[11px] font-bold text-blue-900 uppercase tracking-widest hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5 mx-auto"
                      >
                        View All Activity
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 lg:gap-3 ml-1 lg:ml-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-blue-900 leading-none">{user.name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-500">{user.role || 'System Overseer'}</p>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs lg:text-sm border-2 border-white shadow-sm shrink-0">
                {(user.name || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Canvas */}
        <Outlet context={{ searchQuery: debouncedSearch }} />

        {/* Footer Decoration */}
        <footer className="mt-auto py-8 px-8 border-t border-surface-container-low text-center opacity-50">
          <p className="text-[10px] font-bold font-label uppercase tracking-[0.4em] text-on-surface-variant">Ateka Tehnik Engineering Dashboard © 2026</p>
        </footer>
      </main>

      {/* New Entry Modal */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/40 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-sm shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setEntryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="p-8 space-y-6">
              <h3 className="text-xl font-headline font-bold text-primary-container text-center mb-2">Create New Entry</h3>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => { setEntryModalOpen(false); navigate('/admin/posts/new'); }}
                  className="flex items-center gap-3 p-4 bg-surface-container hover:bg-blue-50 text-left transition-colors rounded-sm group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">edit_square</span>
                  </div>
                  <div>
                    <div className="font-bold text-primary text-sm uppercase tracking-widest leading-tight">Blog Post</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Add an article / project update</div>
                  </div>
                </button>

                <button
                  onClick={() => { setEntryModalOpen(false); navigate('/admin/products/new'); }}
                  className="flex items-center gap-3 p-4 bg-surface-container hover:bg-indigo-50 text-left transition-colors rounded-sm group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
                  </div>
                  <div>
                    <div className="font-bold text-primary text-sm uppercase tracking-widest leading-tight">Product</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">List new machinery</div>
                  </div>
                </button>

                <button
                  onClick={() => { setEntryModalOpen(false); navigate('/admin/leads', { state: { openNewLeadModal: true } }); }}
                  className="flex items-center gap-3 p-4 bg-surface-container hover:bg-orange-50 text-left transition-colors rounded-sm group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">contact_page</span>
                  </div>
                  <div>
                    <div className="font-bold text-primary text-sm uppercase tracking-widest leading-tight">Lead / Query</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Manually insert a prospect</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
