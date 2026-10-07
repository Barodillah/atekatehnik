import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatAdminDateTime } from '../../utils/dateUtils';

const Analytics = () => {
  const { authFetch } = useAuth();
  const { searchQuery } = useOutletContext();

  const [viewType, setViewType] = useState('post'); // post or product
  const [selectedCityFilter, setSelectedCityFilter] = useState('');
  const [selectedIpFilter, setSelectedIpFilter] = useState('');
  const [locationTab, setLocationTab] = useState('cities'); // 'cities' | 'ips'
  const [drawerCityFilter, setDrawerCityFilter] = useState(null);
  const [drawerIpFilter, setDrawerIpFilter] = useState(null);
  const [drawerLocationTab, setDrawerLocationTab] = useState('cities'); // 'cities' | 'ips'
  const [pages, setPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [details, setDetails] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [overallStats, setOverallStats] = useState({ totalViews: 0, uniqueIps: 0, topCountries: [], topCities: [], topBrowsers: [], topDevices: [] });

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const url = `/api/admin_analytics.php?type=${viewType}${selectedCityFilter ? `&city=${encodeURIComponent(selectedCityFilter)}` : ''}${selectedIpFilter ? `&ip=${encodeURIComponent(selectedIpFilter)}` : ''}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPages(data.pages);
        setOverallStats(data.overall);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetails = async (slug) => {
    setIsDetailLoading(true);
    setSelectedSlug(slug);
    try {
      const url = `/api/admin_analytics.php?type=${viewType}&slug=${slug}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}${selectedIpFilter ? `&ip=${encodeURIComponent(selectedIpFilter)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDetails(data.views);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCityFilter('');
    setSelectedIpFilter('');
  }, [viewType]);

  useEffect(() => {
    fetchPages();
    // Do not clear selectedSlug, details, summary so that drawer stays open while searching.
    // We just want to refetch the overview (and details if we had logic for it, but for details we can let the client-side filter handle it or refetch).
    // Let's refetch details if a slug is selected
    if (selectedSlug) {
      fetchDetails(selectedSlug);
    }
  }, [viewType, selectedCityFilter, selectedIpFilter, searchQuery]);

  // The backend API now handles global search via the `q` parameter.
  // We no longer need to filter on the frontend.
  const filteredPages = pages;
  const filteredLatestViews = overallStats.latestViews || [];
  const filteredDetails = details.filter(v => 
    (!drawerCityFilter || v.city === drawerCityFilter) &&
    (!drawerIpFilter || v.ip_address === drawerIpFilter)
  );

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 w-full max-w-[1600px] mx-auto relative animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 font-headline tracking-tight">Analytics Dashboard</h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">Pantau performa trafik secara real-time.</p>
        </div>
        
        {/* Toggle Group Modern */}
        <div className="inline-flex bg-slate-100/80 p-1.5 rounded-sm shadow-inner border border-slate-200/60 backdrop-blur-sm">
          {['post', 'product', 'gallery'].map((type) => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-all duration-300 ${viewType === type ? 'bg-white text-blue-900 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] scale-100' : 'text-slate-500 hover:text-blue-900 hover:bg-slate-200/50 scale-95'}`}
            >
              {type === 'post' ? 'Posts' : type === 'product' ? 'Products' : 'Gallery'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between group hover:border-blue-200 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Views</span>
            <div className="text-3xl font-extrabold text-blue-950 mt-1">{overallStats.totalViews}</div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between group hover:border-orange-200 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unique IPs</span>
            <div className="text-3xl font-extrabold text-blue-950 mt-1">{overallStats.uniqueIps}</div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">group</span>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between group hover:border-teal-200 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top City</span>
            <div className="text-xl font-extrabold text-blue-950 mt-1 truncate max-w-[100px]" title={overallStats.topCities?.[0]?.city || '—'}>{overallStats.topCities?.[0]?.city || '—'}</div>
            <div className="text-[10px] text-slate-400 mt-1">{overallStats.topCities?.[0]?.count || 0} views</div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-teal-50 text-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">location_city</span>
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between group hover:border-indigo-200 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Browser</span>
            <div className="text-xl font-extrabold text-blue-950 mt-1 truncate max-w-[100px]" title={overallStats.topBrowsers?.[0]?.browser || '—'}>{overallStats.topBrowsers?.[0]?.browser || '—'}</div>
            <div className="text-[10px] text-slate-400 mt-1">{overallStats.topBrowsers?.[0]?.count || 0} views</div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">web</span>
          </div>
        </div>
        {/* Card 5 */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between group hover:border-purple-200 transition-colors col-span-2 lg:col-span-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Device</span>
            <div className="text-xl font-extrabold text-blue-950 mt-1 truncate max-w-[100px]" title={overallStats.topDevices?.[0]?.device_type || '—'}>{overallStats.topDevices?.[0]?.device_type || '—'}</div>
            <div className="text-[10px] text-slate-400 mt-1">{overallStats.topDevices?.[0]?.count || 0} views</div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">devices</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Top Pages (Left) & Demographics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Top Pages */}
        <div className="lg:col-span-2 bg-white rounded-sm shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-950 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-lg">star</span>
              Top Performing Pages
            </h3>
            {searchQuery && (
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-sm font-bold animate-pulse">
                Filtering by: "{searchQuery}"
              </span>
            )}
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar flex-1 relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Slug / Page</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Views</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Unique IPs</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Last View</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-blue-500 animate-spin text-3xl">progress_activity</span>
                    </td>
                  </tr>
                ) : filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">search_off</span>
                      Tidak ada halaman yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((p) => (
                    <tr key={p.slug} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <a href={viewType === 'gallery' ? (p.slug === 'main' ? '/gallery' : `/gallery?view=${p.slug}`) : `/${viewType}/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                          {p.slug}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded text-blue-700 font-extrabold text-sm">
                          {p.total_views}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-slate-600">{p.unique_ips}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-500 whitespace-nowrap">
                        {p.last_view ? formatAdminDateTime(p.last_view) : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => fetchDetails(p.slug)}
                          className="text-[10px] font-bold bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 px-3 py-1.5 rounded-sm uppercase tracking-widest transition-all shadow-sm active:scale-95"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Demographics */}
        <div className="bg-white rounded-sm shadow-sm border border-slate-100 flex flex-col overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
            <div className="flex bg-slate-200/50 p-1 rounded-sm w-full">
              <button 
                className={`flex-1 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all px-3 py-2 rounded-sm ${locationTab === 'cities' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                onClick={() => setLocationTab('cities')}
              >
                <span className={`material-symbols-outlined text-[16px] ${locationTab === 'cities' ? 'text-orange-500' : ''}`}>public</span>
                Top Locations
              </button>
              <button 
                className={`flex-1 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all px-3 py-2 rounded-sm ${locationTab === 'ips' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                onClick={() => setLocationTab('ips')}
              >
                <span className={`material-symbols-outlined text-[16px] ${locationTab === 'ips' ? 'text-orange-500' : ''}`}>wifi</span>
                Top IPs
              </button>
            </div>
            {(selectedCityFilter || selectedIpFilter) && (
              <div className="flex justify-end">
                <button onClick={() => { setSelectedCityFilter(''); setSelectedIpFilter(''); }} className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[14px]">close</span> Clear Filter
                </button>
              </div>
            )}
          </div>
          <div className="p-6 space-y-4 overflow-y-auto max-h-[400px]">
             {locationTab === 'cities' ? (
               overallStats.topCities?.length > 0 ? (
                 overallStats.topCities.map((c, i) => {
                   const maxCount = overallStats.topCities[0].count;
                   const percentage = Math.max(5, Math.round((c.count / maxCount) * 100)); // min 5% width for visibility
                   const isSelected = selectedCityFilter === c.city;
                 return (
                    <div 
                      key={i} 
                      className={`group cursor-pointer rounded-sm p-3 border transition-all duration-300 ${isSelected ? 'border-orange-400 bg-orange-50' : 'border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
                      onClick={() => setSelectedCityFilter(isSelected ? '' : c.city)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-bold ${isSelected ? 'text-orange-700' : 'text-slate-700'} flex items-center gap-1.5`}>
                          <span className="material-symbols-outlined text-[14px] opacity-70">location_on</span>
                          {c.city}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${isSelected ? 'bg-orange-200 text-orange-800' : 'bg-slate-100 text-slate-600'}`}>
                          {c.count} views
                        </span>
                      </div>
                      {/* Visual Progress Bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden">
                        <div 
                          className={`h-full rounded-sm transition-all duration-1000 ${isSelected ? 'bg-orange-500' : 'bg-slate-300 group-hover:bg-blue-400'}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                   );
                 })
               ) : (
                 <div className="text-center text-slate-400 text-xs py-8">Belum ada data kota.</div>
               )
             ) : (
               overallStats.topIps?.length > 0 ? (
                 overallStats.topIps.map((ipObj, i) => {
                   const maxCount = overallStats.topIps[0].count;
                   const percentage = Math.max(5, Math.round((ipObj.count / maxCount) * 100));
                   const isSelected = selectedIpFilter === ipObj.ip_address;
                   return (
                      <div 
                        key={i} 
                        className={`group cursor-pointer rounded-sm p-3 border transition-all duration-300 ${isSelected ? 'border-orange-400 bg-orange-50' : 'border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
                        onClick={() => setSelectedIpFilter(isSelected ? '' : ipObj.ip_address)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-xs font-bold font-mono ${isSelected ? 'text-orange-700' : 'text-slate-700'} flex items-center gap-1.5`}>
                            <span className="material-symbols-outlined text-[14px] opacity-70">router</span>
                            {ipObj.ip_address}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${isSelected ? 'bg-orange-200 text-orange-800' : 'bg-slate-100 text-slate-600'}`}>
                            {ipObj.count} views
                          </span>
                        </div>
                        {/* Visual Progress Bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden">
                          <div 
                            className={`h-full rounded-sm transition-all duration-1000 ${isSelected ? 'bg-orange-500' : 'bg-slate-300 group-hover:bg-blue-400'}`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                   );
                 })
               ) : (
                 <div className="text-center text-slate-400 text-xs py-8">Belum ada data IP.</div>
               )
             )}
          </div>
        </div>
      </div>

      {/* Recent Global Views Table (Full Width) */}
      <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-blue-950 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-lg">history</span>
            Log Aktivitas Terbaru
          </h3>
           {searchQuery && (
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-sm font-bold animate-pulse">
                Filtering by: "{searchQuery}"
              </span>
            )}
        </div>
        <div className="overflow-x-auto max-h-[500px] custom-scrollbar relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Page / Link</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">IP Address</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Location</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Device</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Browser</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {filteredLatestViews.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-bold text-xs text-blue-600 truncate max-w-[150px]">{v.page_slug}</td>
                    <td className="px-6 py-3 font-mono text-[11px] text-slate-600">
                       <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{v.ip_address}</span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-700 flex items-center gap-1.5">
                       {v.country && <img src={`https://flagcdn.com/16x12/${v.country.toLowerCase()}.png`} alt={v.country} className="rounded-sm opacity-80" onError={(e) => e.target.style.display='none'} />}
                       {v.city ? `${v.city}${v.country ? ', ' + v.country : ''}` : (v.country || 'Unknown')}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm ${v.device_type === 'Mobile' ? 'bg-purple-50 text-purple-700' : v.device_type === 'Tablet' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        <span className="material-symbols-outlined text-[12px]">{v.device_type === 'Mobile' ? 'smartphone' : v.device_type === 'Tablet' ? 'tablet' : 'desktop_windows'}</span>
                        {v.device_type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[11px] text-slate-600 font-medium">{v.browser || '—'}</td>
                    <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap text-right">{formatAdminDateTime(v.viewed_at)}</td>
                  </tr>
               ))}
               {filteredLatestViews.length === 0 && (
                  <tr>
                     <td colSpan="6" className="px-6 py-8 text-center text-xs text-slate-400">Tidak ada log aktivitas ditemukan.</td>
                  </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Drawer for Details (Portal) */}
      {selectedSlug && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-blue-950/40 backdrop-blur-sm z-[999] transition-opacity duration-300"
            onClick={() => { setSelectedSlug(null); setDetails([]); setSummary(null); setDrawerCityFilter(null); setDrawerIpFilter(null); setDrawerLocationTab('cities'); }}
          ></div>

          {/* Drawer */}
          <div 
            className={`fixed top-0 right-0 h-full w-full max-w-4xl bg-white shadow-2xl z-[1000] transform transition-transform duration-500 ease-in-out flex flex-col ${selectedSlug ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Drawer Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="font-extrabold text-blue-950 text-xl tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500">analytics</span>
                  Detail Halaman
                </h3>
                <p className="text-sm font-bold text-blue-600 mt-1">{selectedSlug}</p>
              </div>
              <button 
                onClick={() => { setSelectedSlug(null); setDetails([]); setSummary(null); setDrawerCityFilter(null); setDrawerIpFilter(null); setDrawerLocationTab('cities'); }} 
                className="w-10 h-10 rounded-sm bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Drawer Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
               {/* Summary Cards */}
                {summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-sm shadow-sm border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Views</span>
                      <div className="text-2xl font-extrabold text-blue-950 mt-1">{summary.total}</div>
                    </div>
                    <div className="bg-white p-4 rounded-sm shadow-sm border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unique IPs</span>
                      <div className="text-2xl font-extrabold text-orange-600 mt-1">{summary.uniqueIps}</div>
                    </div>
                    <div className="bg-white p-4 rounded-sm shadow-sm border border-slate-100 col-span-2">
                      <div className="flex flex-col gap-3">
                        <div className="flex bg-slate-200/50 p-1 rounded-sm w-full">
                          <button 
                            className={`flex-1 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all px-2 py-1.5 rounded-sm ${drawerLocationTab === 'cities' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                            onClick={() => setDrawerLocationTab('cities')}
                          >
                            <span className={`material-symbols-outlined text-[14px] ${drawerLocationTab === 'cities' ? 'text-orange-500' : ''}`}>public</span>
                            All Locations
                          </button>
                          <button 
                            className={`flex-1 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all px-2 py-1.5 rounded-sm ${drawerLocationTab === 'ips' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                            onClick={() => setDrawerLocationTab('ips')}
                          >
                            <span className={`material-symbols-outlined text-[14px] ${drawerLocationTab === 'ips' ? 'text-orange-500' : ''}`}>wifi</span>
                            All IPs
                          </button>
                        </div>
                        {(drawerCityFilter || drawerIpFilter) && (
                          <div className="flex justify-end">
                            <button onClick={() => { setDrawerCityFilter(null); setDrawerIpFilter(null); }} className="text-[9px] text-red-500 font-bold hover:underline flex items-center gap-1 uppercase tracking-widest">
                              <span className="material-symbols-outlined text-[12px]">close</span> Clear Filter
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2 max-h-[80px] overflow-y-auto custom-scrollbar pr-1">
                        {drawerLocationTab === 'cities' ? (
                          summary.cities?.length > 0 ? (
                            summary.cities.map((c, i) => (
                              <button 
                                key={i} 
                                onClick={() => setDrawerCityFilter(drawerCityFilter === c.city ? null : c.city)}
                                className={`border text-[10px] font-bold px-2 py-1 rounded-sm transition-colors cursor-pointer ${drawerCityFilter === c.city ? 'bg-teal-500 text-white border-teal-500' : 'bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100'}`}
                                title={`Filter log untuk kota: ${c.city}`}
                              >
                                {c.city} ({c.count})
                              </button>
                            ))
                          ) : (
                            <div className="text-[10px] text-slate-400">Belum ada data kota.</div>
                          )
                        ) : (
                          summary.ips?.length > 0 ? (
                            summary.ips.map((ipObj, i) => (
                              <button 
                                key={i} 
                                onClick={() => setDrawerIpFilter(drawerIpFilter === ipObj.ip_address ? null : ipObj.ip_address)}
                                className={`border font-mono text-[10px] font-bold px-2 py-1 rounded-sm transition-colors cursor-pointer ${drawerIpFilter === ipObj.ip_address ? 'bg-orange-500 text-white border-orange-500' : 'bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100'}`}
                                title={`Filter log untuk IP: ${ipObj.ip_address}`}
                              >
                                {ipObj.ip_address} ({ipObj.count})
                              </button>
                            ))
                          ) : (
                            <div className="text-[10px] text-slate-400">Belum ada data IP.</div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Detail Table */}
                <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-white flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Log Pengunjung Spesifik</h4>
                    {searchQuery && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-sm font-bold">
                          Filter: "{searchQuery}"
                        </span>
                    )}
                  </div>
                  
                  {isDetailLoading ? (
                    <div className="px-6 py-16 text-center">
                      <span className="material-symbols-outlined text-blue-500 animate-spin text-4xl">progress_activity</span>
                      <p className="text-xs text-slate-400 mt-2 font-medium tracking-widest uppercase">Memuat log...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">IP Address</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Lokasi</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">OS / Browser</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Referrer</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">Waktu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDetails.map((v, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-3 font-mono text-[11px] text-slate-700">{v.ip_address}</td>
                              <td className="px-5 py-3 text-xs text-slate-600">{v.city || '—'}, {v.country || '—'}</td>
                              <td className="px-5 py-3 text-xs">
                                <div className="font-bold text-slate-700">{v.browser || '—'}</div>
                                <div className="text-[10px] text-slate-400">{v.os} • {v.device_type}</div>
                              </td>
                              <td className="px-5 py-3 max-w-[150px] truncate text-[11px] text-slate-500" title={v.referrer}>
                                {v.referrer && v.referrer !== '—' ? (
                                  <a href={v.referrer} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{v.referrer}</a>
                                ) : '—'}
                              </td>
                              <td className="px-5 py-3 text-[11px] text-slate-500 whitespace-nowrap text-right">{formatAdminDateTime(v.viewed_at)}</td>
                            </tr>
                          ))}
                          {filteredDetails.length === 0 && (
                            <tr>
                              <td colSpan="5" className="px-5 py-8 text-center text-xs text-slate-400">Tidak ada data yang cocok dengan pencarian.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </>,
        document.body
      )}

    </div>
  );
};

export default Analytics;
