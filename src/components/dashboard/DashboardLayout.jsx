import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  
  const [isEntryModalOpen, setEntryModalOpen] = useState(false);

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

  return (
    <div className="bg-surface text-on-surface font-body flex min-h-screen text-left">
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 z-50 bg-blue-950 border-r border-blue-900/50 shadow-2xl flex flex-col py-6 font-inter text-sm font-medium tracking-wide">
        <div className="px-6 mb-8">
          <h1 className="text-lg font-extrabold text-white tracking-tighter uppercase">Industrial Admin</h1>
          <p className="text-[10px] text-orange-400/80 uppercase tracking-widest mt-1">Engineering Precision</p>
        </div>
        <div className="flex-1 px-4 space-y-1">
          <Link className={getLinkClasses('/admin')} to="/admin">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link className={getLinkClasses('/admin/leads')} to="/admin/leads">
            <span className="material-symbols-outlined">person_search</span>
            <span>Customer Leads</span>
          </Link>
          <Link className={getLinkClasses('/admin/products')} to="/admin/products">
            <span className="material-symbols-outlined">precision_manufacturing</span>
            <span>Product Management</span>
          </Link>
          <Link className={getLinkClasses('/admin/posts')} to="/admin/posts">
            <span className="material-symbols-outlined">edit_note</span>
            <span>Blog Posts</span>
          </Link>
          <Link className={getLinkClasses('/admin/comments')} to="/admin/comments">
            <span className="material-symbols-outlined">forum</span>
            <span>Comments</span>
          </Link>
          <Link className={getLinkClasses('/admin/chat-history')} to="/admin/chat-history">
            <span className="material-symbols-outlined">smart_toy</span>
            <span>Chat History</span>
          </Link>
          <Link className={getLinkClasses('/admin/analytics')} to="/admin/analytics">
            <span className="material-symbols-outlined">monitoring</span>
            <span>Analytics</span>
          </Link>
          <Link className={getLinkClasses('/admin/logs')} to="/admin/logs">
            <span className="material-symbols-outlined">history</span>
            <span>Activity Logs</span>
          </Link>
        </div>
        <div className="mt-auto px-4 pt-6 border-t border-blue-900/30">
          <button 
            onClick={() => setEntryModalOpen(true)}
            className="w-full bg-orange-400 text-blue-950 py-2 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-orange-500 transition-colors mb-4 cursor-pointer"
          >
            New Entry
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">help</span>
            <span>Support</span>
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
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="w-full h-16 sticky top-0 z-40 bg-slate-50 shadow-sm flex justify-between items-center px-6 font-manrope tracking-tight">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-blue-900 uppercase">Ateka Tehnik</span>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                className="bg-slate-100 border-none rounded-full py-1.5 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-blue-900/20"
                placeholder={
                  location.pathname.startsWith('/admin/leads') ? "Search leads..." :
                  location.pathname.startsWith('/admin/products') ? "Search inventory..." :
                  location.pathname.startsWith('/admin/posts') ? "Search blog posts..." :
                  location.pathname.startsWith('/admin/comments') ? "Search comments..." :
                  location.pathname.startsWith('/admin/chat-history') ? "Search chat sessions..." :
                  location.pathname.startsWith('/admin/analytics') ? "Search pages..." :
                  location.pathname.startsWith('/admin/logs') ? "Search logs..." :
                  "Search data..."
                }
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer active:opacity-80">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-slate-500 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer active:opacity-80">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="flex items-center gap-3 ml-2">
              <div className="text-right">
                <p className="text-xs font-bold text-blue-900 leading-none">{user.name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-500">{user.role || 'System Overseer'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                {(user.name || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Canvas */}
        <Outlet />
        
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
