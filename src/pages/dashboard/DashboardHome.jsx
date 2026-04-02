import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const DashboardHome = () => {
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await authFetch('/api/dashboard_summary.php');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load dashboard summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [authFetch]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-primary font-bold animate-pulse text-lg flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-error font-bold">Failed to load data</div>;

  const kpis = data.kpis || {};
  const chart = data.leadChart || [];
  const activities = data.recentActivity || [];
  const featured = data.featuredProduct || {};

  // Formatter for relative time
  const timeAgo = (dateStr) => {
    const safeDate = dateStr.includes('Z') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
    const date = new Date(safeDate);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
    return Math.floor(seconds) + " seconds ago";
  };

  // Find max chart total for proper height scaling
  const maxChartVal = Math.max(...chart.map(c => Math.max(c.total, 1)), 10) * 1.2;

  // Icon mapping for activities
  const getIconForAction = (action, entityType) => {
    if (entityType === 'lead') return { icon: 'contact_page', bg: 'bg-secondary-fixed text-on-secondary-fixed' };
    if (entityType === 'auth') return { icon: 'vpn_key', bg: 'bg-surface-container-highest text-primary' };
    if (entityType === 'post') return { icon: 'edit_square', bg: 'bg-primary-fixed text-on-primary-fixed' };
    if (entityType === 'product') return { icon: 'precision_manufacturing', bg: 'bg-secondary-container text-on-secondary-container' };
    if (action.includes('comment')) return { icon: 'forum', bg: 'bg-primary text-white' };
    return { icon: 'history', bg: 'bg-outline-variant text-on-surface' };
  };

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Dashboard Overview</h2>
          <p className="text-on-surface-variant font-body">Operational performance and engagement metrics.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-surface-container-highest text-primary text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-outline-variant transition-colors">
            Generate Report
          </button>
          <button className="px-4 py-2 bg-primary-container text-on-primary text-xs font-bold uppercase tracking-widest rounded-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            Overview
          </button>
        </div>
      </div>

      {/* KPI Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Leads */}
        <div className="bg-surface-container-lowest border border-surface-container-low p-6 flex flex-col justify-between h-40 group transition-all hover:shadow-xl hover:shadow-primary/5 rounded-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Total Leads</span>
            <div className="p-2 bg-secondary-fixed text-on-secondary-fixed rounded-sm shadow-inner hidden md:block">
              <span className="material-symbols-outlined">person_search</span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-headline font-extrabold text-primary tracking-tighter">{kpis.totalLeads}</h3>
            <p className="text-xs text-secondary font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">monitoring</span> All recorded inquiries
            </p>
          </div>
        </div>
        
        {/* Total Products */}
        <div className="bg-surface-container-lowest border border-surface-container-low p-6 flex flex-col justify-between h-40 group transition-all hover:shadow-xl hover:shadow-primary/5 rounded-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Total Products</span>
            <div className="p-2 bg-primary-fixed text-on-primary-fixed rounded-sm hidden md:block">
              <span className="material-symbols-outlined">precision_manufacturing</span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-headline font-extrabold text-primary tracking-tighter">{kpis.totalProducts}</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-1">Live in product catalog</p>
          </div>
        </div>
        
        {/* Total Views (Engagement) */}
        <div className="bg-primary-container p-6 flex flex-col justify-between h-40 text-on-primary group transition-all hover:shadow-xl hover:shadow-primary/20 rounded-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-label font-bold text-on-primary/60 uppercase tracking-widest">Total Page Views</span>
            <div className="p-2 bg-secondary-container text-on-secondary-container rounded-sm hidden md:block">
              <span className="material-symbols-outlined">visibility</span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-headline font-extrabold tracking-tighter">{kpis.totalViews}</h3>
            <p className="text-xs text-secondary-container font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">public</span> Overall reach & traffic
            </p>
          </div>
        </div>
        
        {/* Total Comments (Engagement) */}
        <div className="bg-surface-container-lowest border border-surface-container-low p-6 flex flex-col justify-between h-40 group transition-all hover:shadow-xl hover:shadow-primary/5 rounded-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Post Comments</span>
            <div className="p-2 bg-surface-container-highest text-primary rounded-sm hidden md:block">
              <span className="material-symbols-outlined">forum</span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-headline font-extrabold text-primary tracking-tighter">{kpis.totalComments}</h3>
            <p className="text-xs text-secondary font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">chat</span> User engagement
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Lead Acquisition Chart */}
        <div className="xl:col-span-2 bg-surface-container-lowest border border-surface-container-low rounded-sm p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
            <h4 className="text-lg font-bold text-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary-container"></span>
              Monthly Lead Acquisition (Last 6 Months)
            </h4>
            <div className="flex gap-4 text-[10px] font-label font-bold text-outline">
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-primary-container rounded-full"></span> QUALIFIED</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-secondary-container rounded-full"></span> RAW</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2 md:px-4">
            {chart.map((c, i) => {
              const bgHeight1 = Math.max((c.qualified / maxChartVal) * 100, 0);
              const bgHeight2 = Math.max((c.total / maxChartVal) * 100, 0); // stack raw on top implicitly by overlapping
              
              return (
                <div key={i} className="w-full flex flex-col items-center gap-2 group">
                  <div className="w-full bg-surface-container px-1 md:px-0 relative flex items-end h-full rounded-t-sm group-hover:bg-surface-container-high transition-colors overflow-hidden">
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 font-bold whitespace-nowrap transition-opacity">
                      Q: {c.qualified} / Total: {c.total}
                    </div>
                    
                    {/* The Bars */}
                    {c.total > 0 && (
                      <div className="absolute bottom-0 w-full bg-secondary-container/40 rounded-t-sm transition-all duration-1000 ease-out" style={{ height: `${bgHeight2}%` }}></div>
                    )}
                    {c.qualified > 0 && (
                      <div className="absolute bottom-0 w-full bg-primary-container rounded-t-sm transition-all duration-1000 ease-out" style={{ height: `${bgHeight1}%` }}></div>
                    )}
                  </div>
                  <span className={`text-[10px] font-label uppercase ${i === chart.length - 1 ? 'text-primary font-bold' : 'text-outline'}`}>
                    {c.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-surface-container-lowest border border-surface-container-low rounded-sm p-6 flex flex-col shadow-sm max-h-[420px]">
          <h4 className="text-lg font-bold text-primary mb-6 flex items-center justify-between">
            Recent Activity
            <span className="material-symbols-outlined text-outline text-sm">history</span>
          </h4>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activities.length === 0 ? (
               <div className="text-center py-6 text-on-surface-variant">No recent activity</div>
            ) : (
               activities.map((act, i) => {
                 const ui = getIconForAction(act.action, act.entity_type);
                 return (
                  <div className="flex gap-4 group" key={i}>
                    <div className="relative">
                      <div className={`w-10 h-10 ${ui.bg} rounded-full flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-xl">{ui.icon}</span>
                      </div>
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-full bg-outline-variant/30 group-last:hidden"></div>
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-semibold text-primary capitalize">{act.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{act.details || `Modified ${act.entity_type}`}</p>
                      <span className="text-[10px] text-outline font-label uppercase mt-2 block">{timeAgo(act.created_at)}</span>
                    </div>
                  </div>
                 );
               })
            )}
          </div>
          <a href="/admin/logs" className="w-full mt-6 text-xs font-bold text-primary-container hover:text-secondary transition-colors uppercase tracking-widest text-center border-t border-outline-variant/20 pt-4 block">
            View All Activity
          </a>
        </div>
      </div>

      {/* Featured Equipment Slot */}
      {featured && featured.nama && (
        <div className="bg-primary-container relative overflow-hidden rounded-sm min-h-[300px] flex items-center border border-primary/20 shadow-md">
          <div className="absolute right-0 top-0 w-2/3 h-full opacity-20 pointer-events-none">
            <img
              alt="Technical Background"
              className="w-full h-full object-cover mix-blend-overlay"
              src="https://images.unsplash.com/photo-1565439390118-bbf375f46401?q=80&w=2000&auto=format&fit=crop"
            />
          </div>
          <div className="relative z-10 p-8 md:p-12 max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm">
              Latest Additions
            </div>
            <h2 className="text-4xl lg:text-5xl font-headline font-extrabold text-white tracking-tighter leading-tight">
              {featured.nama}
            </h2>
            <div className="flex gap-8 pt-4">
              <div className="space-y-1">
                <span className="text-[10px] font-label font-bold text-white/50 uppercase tracking-widest">Category</span>
                <p className="text-xl font-bold text-white uppercase">{featured.kategori}</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="space-y-1">
                <span className="text-[10px] font-label font-bold text-white/50 uppercase tracking-widest">Page Views</span>
                <p className="text-xl font-bold text-secondary-container flex items-center gap-2"><span className="material-symbols-outlined text-xl">visibility</span> {featured.views || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
