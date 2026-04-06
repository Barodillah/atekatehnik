import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { formatAdminDateTime } from '../../utils/dateUtils';

const WaClicks = () => {
  const { authFetch } = useAuth();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState(null);
  const [sourceDetail, setSourceDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Fetch overview data
  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin_wa_clicks.php');
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
      const res = await fetch(`/api/admin_wa_clicks.php?source_page=${encodeURIComponent(sourcePage)}`);
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
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Loading WA Click Data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-5xl mb-3 block opacity-40">error</span>
        <p>Failed to load data. Please try again.</p>
      </div>
    );
  }

  const maxTrend = Math.max(...data.trend.map(t => t.count), 1);

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

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-[#25D366]">ads_click</span>
            WA CTA Clicks
          </h2>
          <p className="text-on-surface-variant mt-1">Track every WhatsApp CTA button click across the website.</p>
        </div>
        <button
          onClick={fetchOverview}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container-low text-on-surface-variant font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-surface-container-high transition-colors border border-outline-variant/30"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-6 flex flex-col">
          <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Total Clicks</span>
          <span className="text-4xl font-extrabold text-primary font-headline mt-3">{data.totalClicks}</span>
        </div>
        <div className="bg-surface-container-low p-6 flex flex-col">
          <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Today's Clicks</span>
          <span className="text-4xl font-extrabold text-[#25D366] font-headline mt-3">{data.todayClicks}</span>
        </div>
        <div className="bg-surface-container-low p-6 flex flex-col">
          <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Top Source</span>
          <span className="text-2xl font-extrabold text-primary font-headline mt-3">{sourcePageLabels[data.topSource] || data.topSource}</span>
        </div>
        <div className="bg-surface-container-low p-6 flex flex-col">
          <span className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Unique Visitors</span>
          <span className="text-4xl font-extrabold text-secondary font-headline mt-3">{data.uniqueVisitors}</span>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="bg-surface-container-lowest shadow-sm rounded-sm border border-surface-container-low overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-low flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">trending_up</span>
          <h3 className="font-bold text-primary text-lg">7-Day Click Trend</h3>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-3 h-48">
            {data.trend.map((day, i) => {
              const height = maxTrend > 0 ? (day.count / maxTrend) * 100 : 0;
              const dayLabel = new Date(day.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
              const isToday = day.date === new Date().toISOString().split('T')[0];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-extrabold text-primary">{day.count}</span>
                  <div className="w-full flex justify-center">
                    <div
                      className={`w-full max-w-12 rounded-t transition-all duration-500 ${isToday ? 'bg-[#25D366]' : 'bg-primary-container/60'}`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-[#25D366]' : 'text-on-surface-variant'}`}>
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two-Column Layout: Sources + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Source Breakdown */}
        <div className="lg:col-span-2 bg-surface-container-lowest shadow-sm rounded-sm border border-surface-container-low overflow-hidden">
          <div className="px-6 py-4 bg-surface-container-low flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">call_split</span>
            <h3 className="font-bold text-primary text-lg">Clicks by Source Page</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none">Source Page</th>
                  <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Clicks</th>
                  <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Unique IPs</th>
                  <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Last Click</th>
                  <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {data.sources.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">ads_click</span>
                      No click data recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.sources.map((s, i) => (
                    <tr
                      key={s.source_page}
                      className={`hover:bg-surface-container-low transition-colors cursor-pointer ${selectedSource === s.source_page ? 'bg-green-50' : ''}`}
                      onClick={() => fetchSourceDetail(s.source_page)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-sm">ads_click</span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-primary block">{sourcePageLabels[s.source_page] || s.source_page}</span>
                            <span className="text-[10px] text-on-surface-variant font-mono">{s.source_page}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-extrabold text-primary">{s.total_clicks}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-on-surface">{s.unique_ips}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-on-surface-variant whitespace-nowrap">
                        {s.last_click ? formatAdminDateTime(s.last_click) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="material-symbols-outlined text-on-surface-variant text-lg">{selectedSource === s.source_page ? 'expand_less' : 'expand_more'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Stats */}
        <div className="space-y-6">
          {/* Top Cities */}
          <div className="bg-surface-container-lowest shadow-sm rounded-sm border border-surface-container-low overflow-hidden">
            <div className="px-6 py-4 bg-surface-container-low flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-lg">location_on</span>
              <h3 className="font-bold text-primary text-sm uppercase tracking-widest">Top Cities</h3>
            </div>
            <div className="p-4 space-y-2">
              {data.topCities.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-4 opacity-60">No geo data yet</p>
              ) : (
                data.topCities.map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-2 hover:bg-surface-container-low rounded transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-amber-50 text-amber-700 text-[10px] font-extrabold rounded-full flex items-center justify-center">{i + 1}</span>
                      <span className="text-sm font-medium text-on-surface">{c.city || '—'}</span>
                    </div>
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">{c.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Devices */}
          <div className="bg-surface-container-lowest shadow-sm rounded-sm border border-surface-container-low overflow-hidden">
            <div className="px-6 py-4 bg-surface-container-low flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-lg">devices</span>
              <h3 className="font-bold text-primary text-sm uppercase tracking-widest">Devices</h3>
            </div>
            <div className="p-4 space-y-2">
              {data.topDevices.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-4 opacity-60">No data yet</p>
              ) : (
                data.topDevices.map((d, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-2 hover:bg-surface-container-low rounded transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${d.device_type === 'Mobile' ? 'text-purple-600' : d.device_type === 'Tablet' ? 'text-orange-600' : 'text-slate-500'}`}>
                        {d.device_type === 'Mobile' ? 'smartphone' : d.device_type === 'Tablet' ? 'tablet' : 'desktop_windows'}
                      </span>
                      <span className="text-sm font-medium text-on-surface">{d.device_type}</span>
                    </div>
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">{d.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Browsers */}
          <div className="bg-surface-container-lowest shadow-sm rounded-sm border border-surface-container-low overflow-hidden">
            <div className="px-6 py-4 bg-surface-container-low flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-lg">language</span>
              <h3 className="font-bold text-primary text-sm uppercase tracking-widest">Browsers</h3>
            </div>
            <div className="p-4 space-y-2">
              {data.topBrowsers.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-4 opacity-60">No data yet</p>
              ) : (
                data.topBrowsers.map((b, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-2 hover:bg-surface-container-low rounded transition-colors">
                    <span className="text-sm font-medium text-on-surface">{b.browser}</span>
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">{b.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Source Detail Panel */}
      {selectedSource && (
        <div className="bg-surface-container-lowest shadow-sm rounded-sm border border-surface-container-low overflow-hidden">
          <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#25D366]">analytics</span>
              <h3 className="font-bold text-primary text-lg">Detail — <span className="text-[#25D366]">{sourcePageLabels[selectedSource] || selectedSource}</span></h3>
            </div>
            <button onClick={() => { setSelectedSource(null); setSourceDetail(null); }} className="text-on-surface-variant hover:text-primary cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {isDetailLoading ? (
            <div className="px-6 py-12 text-center">
              <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
            </div>
          ) : sourceDetail ? (
            <>
              {/* Detail Summary */}
              <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-surface-container-low">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total Clicks</span>
                  <span className="text-2xl font-extrabold text-primary">{sourceDetail.summary.total}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Unique IPs</span>
                  <span className="text-2xl font-extrabold text-primary">{sourceDetail.summary.uniqueIps}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Cities</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sourceDetail.summary.cities?.map((c, i) => (
                      <span key={i} className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{c.city} ({c.count})</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Labels</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sourceDetail.summary.labels?.map((l, i) => (
                      <span key={i} className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{l.source_label} ({l.count})</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detail Table */}
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-surface-container-low">
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Label</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">IP</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Browser</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">OS</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Device</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">City</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {sourceDetail.clicks.map((c, i) => (
                      <tr key={i} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-2.5 text-xs font-medium text-on-surface max-w-[150px] truncate" title={c.source_label}>{c.source_label || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-on-surface">{c.ip_address}</td>
                        <td className="px-4 py-2.5">{c.browser}</td>
                        <td className="px-4 py-2.5">{c.os}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${c.device_type === 'Mobile' ? 'bg-purple-50 text-purple-700' : c.device_type === 'Tablet' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                            <span className="material-symbols-outlined text-[14px]">{c.device_type === 'Mobile' ? 'smartphone' : c.device_type === 'Tablet' ? 'tablet' : 'desktop_windows'}</span>
                            {c.device_type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">{c.city || '—'}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">{formatAdminDateTime(c.clicked_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Recent Clicks */}
      <div className="bg-surface-container-lowest shadow-sm rounded-sm border border-surface-container-low overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-low flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">schedule</span>
          <h3 className="font-bold text-primary text-lg">Recent Clicks</h3>
          <span className="text-xs text-on-surface-variant ml-auto">Last 50 clicks</span>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0">
              <tr className="bg-surface-container-low">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Source</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Label</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">IP</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Browser</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Device</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">City</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {data.recentClicks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-on-surface-variant opacity-60">
                    No clicks recorded yet. They will appear here once users click WA CTA buttons.
                  </td>
                </tr>
              ) : (
                data.recentClicks.map((c, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[12px]">ads_click</span>
                        {sourcePageLabels[c.source_page] || c.source_page}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-on-surface max-w-[120px] truncate" title={c.source_label}>{c.source_label || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-on-surface">{c.ip_address}</td>
                    <td className="px-4 py-2.5 text-xs">{c.browser}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${c.device_type === 'Mobile' ? 'bg-purple-50 text-purple-700' : c.device_type === 'Tablet' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        <span className="material-symbols-outlined text-[14px]">{c.device_type === 'Mobile' ? 'smartphone' : c.device_type === 'Tablet' ? 'tablet' : 'desktop_windows'}</span>
                        {c.device_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs">{c.city || '—'}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs">{formatAdminDateTime(c.clicked_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WaClicks;
