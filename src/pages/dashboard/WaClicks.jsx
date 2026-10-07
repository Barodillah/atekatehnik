import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatAdminDateTime } from '../../utils/dateUtils';

const WaClicks = () => {
  const { authFetch } = useAuth();
  const { searchQuery } = useOutletContext();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for overview filtering
  const [selectedCityFilter, setSelectedCityFilter] = useState('');
  const [selectedIpFilter, setSelectedIpFilter] = useState('');
  const [locationTab, setLocationTab] = useState('cities'); // 'cities' | 'ips'

  // States for detailed drawer
  const [selectedSource, setSelectedSource] = useState(null);
  const [sourceDetail, setSourceDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [drawerCityFilter, setDrawerCityFilter] = useState(null);
  const [drawerIpFilter, setDrawerIpFilter] = useState(null);
  const [drawerLocationTab, setDrawerLocationTab] = useState('cities'); // 'cities' | 'ips'

  // Fetch overview data
  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const url = `/api/admin_wa_clicks.php?${selectedCityFilter ? `city=${encodeURIComponent(selectedCityFilter)}&` : ''}${selectedIpFilter ? `ip=${encodeURIComponent(selectedIpFilter)}&` : ''}${searchQuery ? `q=${encodeURIComponent(searchQuery)}` : ''}`;
      const res = await authFetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch WA clicks overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch detail for a specific source page
  const fetchSourceDetail = async (sourcePage) => {
    setIsDetailLoading(true);
    setSelectedSource(sourcePage);
    try {
      const url = `/api/admin_wa_clicks.php?source_page=${encodeURIComponent(sourcePage)}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}${selectedIpFilter ? `&ip=${encodeURIComponent(selectedIpFilter)}` : ''}`;
      const res = await authFetch(url);
      const json = await res.json();
      if (json.success) {
        setSourceDetail(json);
      }
    } catch (err) {
      console.error('Failed to fetch source detail:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    if (selectedSource) {
      fetchSourceDetail(selectedSource);
    }
  }, [selectedCityFilter, selectedIpFilter, searchQuery]);

  // Page name mapping for display
  const sourcePageLabels = {
    'hero': 'Hero Section',
    'chatbot': 'Chatbot Widget',
    'home-contact': 'Home — Contact CTA',
    'contact-page': 'Contact Page',
    'edukasi': 'Edukasi',
    'error-page': 'Error Page',
    'product-detail': 'Product Detail',
    'products-list': 'Products List',
    'artikel': 'Artikel Content',
  };

  if (isLoading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-blue-500 animate-spin text-4xl">progress_activity</span>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading WA Click Data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        <span className="material-symbols-outlined text-5xl mb-3 block opacity-40">error</span>
        <p>Failed to load data. Please try again.</p>
      </div>
    );
  }

  const maxTrend = Math.max(...data.trend.map(t => t.count), 1);
  const filteredSources = data.sources || [];
  const filteredRecentClicks = data.recentClicks || [];

  const generateChartData = () => {
    if (!data || !data.trend) return { line: '', area: '', points: [] };
    const max = maxTrend;
    const width = 600;
    const height = 160;
    const xStep = width / 6;
    
    let linePath = '';
    const points = [];
    
    data.trend.forEach((day, i) => {
      const x = i * xStep;
      const y = 180 - ((day.count / max) * height);
      
      const xPercent = (i / 6) * 100;
      const yPercent = (y / 200) * 100;

      if (i === 0) linePath += `M ${x},${y} `;
      else linePath += `L ${x},${y} `;
      
      points.push({ xPercent, yPercent, count: day.count, date: day.date });
    });
    
    const areaPath = `${linePath} L ${width},200 L 0,200 Z`;
    
    return { line: linePath, area: areaPath, points };
  };

  const chartData = generateChartData();

  // Filter drawer detail clicks client-side for immediate response
  const filteredDrawerClicks = sourceDetail?.clicks?.filter(c => 
    (!drawerCityFilter || c.city === drawerCityFilter) &&
    (!drawerIpFilter || c.ip_address === drawerIpFilter)
  ) || [];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 w-full max-w-[1600px] mx-auto relative animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 font-headline tracking-tight">WA Clicks Dashboard</h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">Pantau interaksi tombol WhatsApp secara komprehensif.</p>
        </div>
        
        <button
          onClick={fetchOverview}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-all duration-300 bg-white text-slate-600 border border-slate-200 hover:text-blue-900 hover:bg-slate-50 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Overview Stats (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between group hover:border-green-200 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Clicks</span>
            <div className="text-3xl font-extrabold text-blue-950 mt-1">{data.totalClicks}</div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">ads_click</span>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between group hover:border-emerald-200 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Today's Clicks</span>
            <div className="text-3xl font-extrabold text-[#25D366] mt-1">{data.todayClicks}</div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">today</span>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between group hover:border-blue-200 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Source</span>
            <div className="text-xl font-extrabold text-blue-950 mt-1 truncate max-w-[120px]" title={sourcePageLabels[data.topSource] || data.topSource}>{sourcePageLabels[data.topSource] || data.topSource}</div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">call_split</span>
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between group hover:border-orange-200 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unique Visitors</span>
            <div className="text-3xl font-extrabold text-blue-950 mt-1">{data.uniqueVisitors}</div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">group</span>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-blue-950 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500 text-lg">trending_up</span>
            7-Day Click Trend
          </h3>
        </div>
        <div className="p-6 pt-10">
          <div className="relative w-full h-48 mb-2">
            <svg viewBox="0 0 600 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="600" y2="20" stroke="#f8fafc" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#f8fafc" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="0" y1="180" x2="600" y2="180" stroke="#f1f5f9" strokeWidth="2" />
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={chartData.area} fill="url(#trendGradient)" />
              <path d={chartData.line} fill="none" stroke="#22c55e" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            
            {/* HTML Points Overlay */}
            {chartData.points.map((p, i) => {
              const isToday = p.date === new Date().toISOString().split('T')[0];
              return (
                <div 
                  key={i} 
                  className="absolute w-4 h-4 -ml-2 -mt-2 group cursor-pointer flex justify-center"
                  style={{ left: `${p.xPercent}%`, top: `${p.yPercent}%` }}
                >
                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm transition-transform duration-300 group-hover:scale-150 ${isToday ? 'bg-green-600 scale-125' : 'bg-green-400'}`}></div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 flex flex-col items-center">
                    <span className="bg-blue-950 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-lg whitespace-nowrap">
                      {p.count} Clicks
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* X Axis Labels */}
          <div className="relative w-full h-6 mt-4">
            {chartData.points.map((p, i) => {
              const dayLabel = new Date(p.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
              const isToday = p.date === new Date().toISOString().split('T')[0];
              return (
                <div 
                  key={i} 
                  className="flex flex-col items-center absolute" 
                  style={{ 
                    left: i === chartData.points.length - 1 ? 'auto' : i === 0 ? '0' : `${p.xPercent}%`,
                    right: i === chartData.points.length - 1 ? '0' : 'auto',
                    transform: i !== 0 && i !== chartData.points.length - 1 ? 'translateX(-50%)' : 'none'
                  }}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-green-600' : 'text-slate-400'}`}>
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Top Sources (Left) & Demographics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Clicks by Source */}
        <div className="lg:col-span-2 bg-white rounded-sm shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-950 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-lg">call_split</span>
              Clicks by Source Page
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
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Source Page</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Clicks</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Unique IPs</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Last Click</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading && !data ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-blue-500 animate-spin text-3xl">progress_activity</span>
                    </td>
                  </tr>
                ) : filteredSources.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">search_off</span>
                      Tidak ada sumber yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredSources.map((s, i) => (
                    <tr key={s.source_page} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-50 text-green-600 rounded-sm flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[16px]">ads_click</span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-blue-950 block">{sourcePageLabels[s.source_page] || s.source_page}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{s.source_page}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-sm text-blue-700 font-extrabold text-sm">
                          {s.total_clicks}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-slate-600">{s.unique_ips}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-500 whitespace-nowrap">
                        {s.last_click ? formatAdminDateTime(s.last_click) : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => fetchSourceDetail(s.source_page)}
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

        {/* Right Col: Demographics (Cities / IPs) */}
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
               data.topCities?.length > 0 ? (
                 data.topCities.map((c, i) => {
                   const maxCount = data.topCities[0].count;
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
                          {c.count} clicks
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
               data.topIps?.length > 0 ? (
                 data.topIps.map((ipObj, i) => {
                   const maxCount = data.topIps[0].count;
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
                            {ipObj.count} clicks
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

      {/* Recent Clicks Table */}
      <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-blue-950 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-lg">history</span>
            Log Klik Terbaru
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
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Source</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Label</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">IP Address</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Location</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">Device & Browser</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {filteredRecentClicks.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-sm whitespace-nowrap">
                        <span className="material-symbols-outlined text-[12px]">ads_click</span>
                        {sourcePageLabels[c.source_page] || c.source_page}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium text-xs text-blue-950 truncate max-w-[150px]">{c.source_label || '—'}</td>
                    <td className="px-6 py-3 font-mono text-[11px] text-slate-600">
                       <span className="bg-slate-100 px-1.5 py-0.5 rounded-sm border border-slate-200">{c.ip_address}</span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-700 flex items-center gap-1.5">
                       {c.country && <img src={`https://flagcdn.com/16x12/${c.country.toLowerCase()}.png`} alt={c.country} className="rounded-sm opacity-80" onError={(e) => e.target.style.display='none'} />}
                       {c.city ? `${c.city}${c.country ? ', ' + c.country : ''}` : (c.country || 'Unknown')}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm ${c.device_type === 'Mobile' ? 'bg-purple-50 text-purple-700' : c.device_type === 'Tablet' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                          <span className="material-symbols-outlined text-[12px]">{c.device_type === 'Mobile' ? 'smartphone' : c.device_type === 'Tablet' ? 'tablet' : 'desktop_windows'}</span>
                          {c.device_type}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">{c.browser || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap text-right">{formatAdminDateTime(c.clicked_at)}</td>
                  </tr>
               ))}
               {filteredRecentClicks.length === 0 && (
                  <tr>
                     <td colSpan="6" className="px-6 py-8 text-center text-xs text-slate-400">Tidak ada log aktivitas ditemukan.</td>
                  </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Drawer for Details (Portal) */}
      {selectedSource && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-blue-950/40 backdrop-blur-sm z-[999] transition-opacity duration-300"
            onClick={() => { setSelectedSource(null); setSourceDetail(null); setDrawerCityFilter(null); setDrawerIpFilter(null); setDrawerLocationTab('cities'); }}
          ></div>

          {/* Drawer */}
          <div 
            className={`fixed top-0 right-0 h-full w-full max-w-4xl bg-white shadow-2xl z-[1000] transform transition-transform duration-500 ease-in-out flex flex-col ${selectedSource ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Drawer Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="font-extrabold text-blue-950 text-xl tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500">ads_click</span>
                  Detail Sumber WA
                </h3>
                <p className="text-sm font-bold text-green-600 mt-1">{sourcePageLabels[selectedSource] || selectedSource}</p>
              </div>
              <button 
                onClick={() => { setSelectedSource(null); setSourceDetail(null); setDrawerCityFilter(null); setDrawerIpFilter(null); setDrawerLocationTab('cities'); }} 
                className="w-10 h-10 rounded-sm bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Drawer Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50">
               {/* Summary Cards */}
                {sourceDetail && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-sm shadow-sm border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Clicks</span>
                      <div className="text-2xl font-extrabold text-blue-950 mt-1">{sourceDetail.summary.total}</div>
                    </div>
                    <div className="bg-white p-4 rounded-sm shadow-sm border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unique IPs</span>
                      <div className="text-2xl font-extrabold text-orange-600 mt-1">{sourceDetail.summary.uniqueIps}</div>
                    </div>
                    
                    {/* Location / IP Tab Box */}
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
                          sourceDetail.summary.cities?.length > 0 ? (
                            sourceDetail.summary.cities.map((c, i) => (
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
                          sourceDetail.summary.ips?.length > 0 ? (
                            sourceDetail.summary.ips.map((ipObj, i) => (
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
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Label CTA</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">IP Address</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Lokasi</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">OS / Browser</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Referrer</th>
                            <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">Waktu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDrawerClicks.map((v, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-3 text-xs font-bold text-blue-950 truncate max-w-[150px]">{v.source_label || '—'}</td>
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
                              <td className="px-5 py-3 text-[11px] text-slate-500 whitespace-nowrap text-right">{formatAdminDateTime(v.clicked_at)}</td>
                            </tr>
                          ))}
                          {filteredDrawerClicks.length === 0 && (
                            <tr>
                              <td colSpan="6" className="px-5 py-8 text-center text-xs text-slate-400">Tidak ada data yang cocok dengan pencarian atau filter.</td>
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

export default WaClicks;
