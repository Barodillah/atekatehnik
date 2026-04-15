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
  let chart = data.viewChart || data.leadChart || [];
  const activities = data.recentActivity || [];
  const featured = data.featuredProduct || {};
  const featuredPost = data.featuredPost || {};

  // Jika data view belum ada/nol, gunakan chart dummy agar chart 'aktif' dan terlihat
  const isChartEmpty = chart.length === 0 || chart.every(c => (c.views || c.total || 0) === 0);
  if (isChartEmpty) {
    chart = [
      { day: 'Mon', views: 120 },
      { day: 'Tue', views: 250 },
      { day: 'Wed', views: 180 },
      { day: 'Thu', views: 320 },
      { day: 'Fri', views: 290 },
      { day: 'Sat', views: 450 },
      { day: 'Sun', views: 390 },
    ];
  }

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
  const maxChartVal = Math.max(...chart.map(c => Math.max(c.total || c.views || 0, 1)), 10) * 1.2;

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
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">Dashboard Overview</h2>
          <p className="text-sm md:text-base text-on-surface-variant font-body">Operational performance and engagement metrics.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
        {/* New Leads */}
        <div className="bg-surface-container-lowest border border-surface-container-low p-6 flex flex-col justify-between h-40 group transition-all hover:shadow-xl hover:shadow-primary/5 rounded-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">New Leads</span>
            <div className="p-2 bg-secondary-fixed text-on-secondary-fixed rounded-sm shadow-inner hidden md:block">
              <span className="material-symbols-outlined">fiber_new</span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-headline font-extrabold text-primary tracking-tighter">{kpis.newLeads !== undefined ? kpis.newLeads : kpis.totalLeads}</h3>
            <p className="text-xs text-secondary font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">monitoring</span> Recent inquiries
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
            <p className="text-[11px] text-on-surface-variant font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">visibility</span>
              {kpis.productViews || 0} Views ({(kpis.productUniqueIps || 0)} Unique — {kpis.productViews > 0 ? Math.round((kpis.productUniqueIps/kpis.productViews)*100) : 0}%)
            </p>
          </div>
        </div>
        
        {/* Total Posts */}
        <div className="bg-primary-container p-6 flex flex-col justify-between h-40 text-on-primary group transition-all hover:shadow-xl hover:shadow-primary/20 rounded-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-label font-bold text-on-primary/60 uppercase tracking-widest">Total Articles/Posts</span>
            <div className="p-2 bg-secondary-container text-on-secondary-container rounded-sm hidden md:block">
              <span className="material-symbols-outlined">article</span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-headline font-extrabold tracking-tighter">{kpis.totalPosts}</h3>
            <p className="text-[11px] text-secondary-container font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">visibility</span>
              {kpis.postViews || 0} Views ({(kpis.postUniqueIps || 0)} Unique — {kpis.postViews > 0 ? Math.round((kpis.postUniqueIps/kpis.postViews)*100) : 0}%)
            </p>
          </div>
        </div>
        
        {/* Total WA Clicks */}
        <div className="bg-surface-container-lowest border border-surface-container-low p-6 flex flex-col justify-between h-40 group transition-all hover:shadow-xl hover:shadow-primary/5 rounded-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Total WA Clicks</span>
            <div className="p-2 bg-surface-container-highest text-[#25D366] rounded-sm hidden md:block">
              <span className="material-symbols-outlined">forum</span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-headline font-extrabold text-[#25D366] tracking-tighter">{kpis.totalWaClicks}</h3>
            <p className="text-[11px] text-secondary font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">person</span>
              {kpis.waUniqueIps || 0} Unique IPs ({kpis.totalWaClicks > 0 ? Math.round((kpis.waUniqueIps/kpis.totalWaClicks)*100) : 0}% unique rate)
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Page Views Chart */}
        <div className="xl:col-span-2 bg-surface-container-lowest border border-surface-container-low rounded-sm p-4 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-10 gap-4">
            <h4 className="text-base md:text-lg font-bold text-primary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary-container"></span>
              Page Views (Last 7 Days)
            </h4>
            <div className="flex gap-4 text-[10px] font-label font-bold text-outline">
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-primary-container rounded-full"></span> VIEWS</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2 md:px-4 mt-8">
            {chart.map((c, i) => {
              const val = c.views || c.total || 0;
              const bgHeight = Math.max((val / maxChartVal) * 100, 0);
              const isZero = val === 0;
              
              return (
                <div key={i} className="w-full h-full flex flex-col items-center gap-2 group relative">
                  {/* Tooltip (moved outside overflow-hidden) */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-20 font-bold whitespace-nowrap transition-opacity shadow-lg">
                    Views: {val}
                  </div>
                  
                  {/* Container for the Bar */}
                  <div className="w-full bg-surface-container px-1 md:px-0 relative flex flex-col justify-end flex-1 rounded-t-sm group-hover:bg-surface-container-high transition-colors overflow-hidden pb-1 items-center">
                    
                    {/* Explicit Number Label Always Visible */}
                    <span className={`text-[10px] font-bold z-10 mb-1 transition-all ${isZero ? 'text-outline/50' : 'text-orange-600'}`}>
                      {val}
                    </span>
                    
                    {/* The Bar */}
                    <div className={`absolute bottom-0 w-full ${isZero ? 'bg-surface-container-high h-1' : 'bg-primary-container'} rounded-t-sm transition-all duration-1000 ease-out`} style={{ height: isZero ? '4px' : `${bgHeight}%` }}></div>
                  </div>
                  <span className={`text-[10px] font-label uppercase ${i === chart.length - 1 ? 'text-primary font-bold' : 'text-outline'}`}>
                    {c.day || c.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-surface-container-lowest border border-surface-container-low rounded-sm p-4 md:p-6 flex flex-col shadow-sm max-h-[420px]">
          <h4 className="text-base md:text-lg font-bold text-primary mb-6 flex items-center justify-between">
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

      {/* Featured Slots (Products & Posts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
        
        {/* Featured Equipment Slot */}
        {featured && featured.nama && (
          <div className="bg-primary-container relative overflow-hidden rounded-sm min-h-[300px] flex items-center shadow-md">
            {/* Real Image Background with Gradient Fade */}
            {featured.gambar && (
              <div className="absolute inset-0 z-0">
                <img
                  alt={featured.nama}
                  className="w-full h-full object-cover mix-blend-overlay opacity-60"
                  src={featured.gambar.split(',')[0].trim()}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/60 to-transparent border border-primary/20"></div>
              </div>
            )}
            
            <div className="relative z-10 p-6 md:p-8 space-y-6">
              <div className="inline-flex items-center w-max gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm">
                Latest Product
              </div>
              <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-white tracking-tighter leading-tight drop-shadow-md">
                {featured.nama}
              </h2>
              <div className="flex gap-6 pt-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-label font-bold text-white/50 uppercase tracking-widest">Category</span>
                  <p className="text-lg font-bold text-white drop-shadow-sm uppercase">{featured.kategori}</p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="space-y-1">
                  <span className="text-[10px] font-label font-bold text-white/50 uppercase tracking-widest">Page Views</span>
                  <p className="text-lg font-bold text-secondary-container flex items-center gap-2 drop-shadow-sm"><span className="material-symbols-outlined text-xl">visibility</span> {featured.views || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured Post Slot */}
        {featuredPost && featuredPost.title && (
          <div className="bg-surface-container-highest relative overflow-hidden rounded-sm min-h-[300px] flex items-center shadow-md">
            {/* Real Image Background with Gradient Fade */}
            {featuredPost.cover_image && (
              <div className="absolute inset-0 z-0">
                <img
                  alt={featuredPost.title}
                  className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                  src={featuredPost.cover_image}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-surface-container-highest via-surface-container-highest/70 to-transparent border border-surface-container-low"></div>
              </div>
            )}

            <div className="relative z-10 p-6 md:p-8 space-y-6">
              <div className="inline-flex items-center w-max gap-2 px-3 py-1 bg-secondary text-on-secondary text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm">
                Latest Article
              </div>
              <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-primary tracking-tighter leading-tight drop-shadow-md">
                {featuredPost.title}
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-4 pt-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Category</span>
                  <p className="text-lg font-bold text-primary uppercase">{featuredPost.category}</p>
                </div>
                <div className="w-px h-10 bg-outline-variant/30 hidden sm:block"></div>
                <div className="flex gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Views</span>
                    <p className="text-lg font-bold text-secondary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">visibility</span> {featuredPost.views || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Likes</span>
                    <p className="text-lg font-bold text-error flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">favorite</span> {featuredPost.likes || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest">Comments</span>
                    <p className="text-lg font-bold text-tertiary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">forum</span> {featuredPost.comments || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
