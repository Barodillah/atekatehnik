import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatAdminDateTime } from '../../utils/dateUtils';

const Analytics = () => {
  const { authFetch } = useAuth();
  const { searchQuery } = useOutletContext();

  const [viewType, setViewType] = useState('post'); // post or product
  const [pages, setPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [details, setDetails] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [overallStats, setOverallStats] = useState({ totalViews: 0, uniqueIps: 0, topCountries: [], topCities: [], topBrowsers: [], topDevices: [] });

  // Fetch page list with view counts
  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin_analytics.php?type=${viewType}`);
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

  // Fetch detailed views for a specific page
  const fetchDetails = async (slug) => {
    setIsDetailLoading(true);
    setSelectedSlug(slug);
    try {
      const res = await fetch(`/api/admin_analytics.php?type=${viewType}&slug=${slug}`);
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
    fetchPages();
    setSelectedSlug(null);
    setDetails([]);
    setSummary(null);
  }, [viewType]);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary font-headline tracking-tight">Page Analytics</h2>
          <p className="text-sm md:text-base text-on-surface-variant mt-1">Detailed view analytics for posts and products.</p>
        </div>
        <div className="flex bg-surface-container-low rounded-sm overflow-hidden border border-outline-variant/30">
          <button
            onClick={() => setViewType('post')}
            className={`px-6 py-2.5 text-sm font-bold uppercase tracking-widest transition-all ${viewType === 'post' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-slate-200'}`}
          >
            Posts
          </button>
          <button
            onClick={() => setViewType('product')}
            className={`px-6 py-2.5 text-sm font-bold uppercase tracking-widest transition-all ${viewType === 'product' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-slate-200'}`}
          >
            Products
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface-container-low p-4 md:p-6 flex flex-col">
          <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Total Views</span>
          <span className="text-3xl md:text-4xl font-extrabold text-primary font-headline mt-2 md:mt-3">{overallStats.totalViews}</span>
        </div>
        <div className="bg-surface-container-low p-4 md:p-6 flex flex-col">
          <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Unique Visitors</span>
          <span className="text-3xl md:text-4xl font-extrabold text-primary font-headline mt-2 md:mt-3">{overallStats.uniqueIps}</span>
        </div>
        <div className="bg-surface-container-low p-4 md:p-6 flex flex-col">
          <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Top City</span>
          <span className="text-xl md:text-2xl font-extrabold text-primary font-headline mt-2 md:mt-3">{overallStats.topCities?.[0]?.city || '—'}</span>
          <span className="text-[10px] md:text-xs text-on-surface-variant">{overallStats.topCities?.[0]?.count || 0} views</span>
        </div>
        <div className="bg-surface-container-low p-4 md:p-6 flex flex-col">
          <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Top Browser</span>
          <span className="text-xl md:text-2xl font-extrabold text-primary font-headline mt-2 md:mt-3">{overallStats.topBrowsers?.[0]?.browser || '—'}</span>
          <span className="text-[10px] md:text-xs text-on-surface-variant">{overallStats.topBrowsers?.[0]?.count || 0} views</span>
        </div>
        <div className="bg-surface-container-low p-4 md:p-6 flex flex-col">
          <span className="text-[10px] md:text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Top Device</span>
          <span className="text-xl md:text-2xl font-extrabold text-primary font-headline mt-2 md:mt-3">{overallStats.topDevices?.[0]?.device_type || '—'}</span>
          <span className="text-[10px] md:text-xs text-on-surface-variant">{overallStats.topDevices?.[0]?.count || 0} views</span>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-surface-container-lowest shadow-sm rounded-sm overflow-hidden border border-surface-container-low">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none">#</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none">Slug</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Total Views</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Unique IPs</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-center">Last View</th>
                <th className="px-6 py-4 text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant border-none text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
                    <p className="text-sm text-on-surface-variant mt-2">Loading data...</p>
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">monitoring</span>
                    No view data recorded yet.
                  </td>
                </tr>
              ) : (() => {
                const filteredPages = searchQuery
                  ? pages.filter(p => p.slug.toLowerCase().includes(searchQuery.toLowerCase()))
                  : pages;
                return filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">search_off</span>
                      No pages match "{searchQuery}".
                    </td>
                  </tr>
                ) : filteredPages.map((p, i) => (
                  <tr key={p.slug} className={`hover:bg-surface-container-low transition-colors cursor-pointer ${selectedSlug === p.slug ? 'bg-blue-50' : ''}`} onClick={() => fetchDetails(p.slug)}>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface-variant">{i + 1}</td>
                    <td className="px-6 py-4">
                      <a href={`/${viewType === 'post' ? 'post' : 'product'}/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-700 hover:underline" onClick={(e) => e.stopPropagation()}>
                        {p.slug}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-extrabold text-primary">{p.total_views}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-on-surface">{p.unique_ips}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-on-surface-variant whitespace-nowrap">
                      {p.last_view ? formatAdminDateTime(p.last_view) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">{selectedSlug === p.slug ? 'expand_less' : 'expand_more'}</span>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedSlug && (
        <div className="bg-surface-container-lowest shadow-sm rounded-sm border border-surface-container-low overflow-hidden">
          <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <h3 className="font-bold text-primary text-lg">Detailed Views — <span className="text-secondary">{selectedSlug}</span></h3>
            </div>
            <button onClick={() => { setSelectedSlug(null); setDetails([]); setSummary(null); }} className="text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-4 border-b border-surface-container-low">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total Views</span>
                <span className="text-2xl font-extrabold text-primary">{summary.total}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Unique IPs</span>
                <span className="text-2xl font-extrabold text-primary">{summary.uniqueIps}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Countries</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {summary.countries.map((c, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{c.country} ({c.count})</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Cities</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {summary.cities?.map((c, i) => (
                    <span key={i} className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{c.city} ({c.count})</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Browsers</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {summary.browsers.map((b, i) => (
                    <span key={i} className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{b.browser} ({b.count})</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Views Table */}
          {isDetailLoading ? (
            <div className="px-6 py-12 text-center">
              <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="sticky top-0">
                  <tr className="bg-surface-container-low">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">IP Address</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Browser</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">OS</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Device</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Country</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">City</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Referrer</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {details.map((v, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs text-on-surface">{v.ip_address}</td>
                      <td className="px-4 py-2.5">{v.browser}</td>
                      <td className="px-4 py-2.5">{v.os}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${v.device_type === 'Mobile' ? 'bg-purple-50 text-purple-700' : v.device_type === 'Tablet' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                          <span className="material-symbols-outlined text-[14px]">{v.device_type === 'Mobile' ? 'smartphone' : v.device_type === 'Tablet' ? 'tablet' : 'desktop_windows'}</span>
                          {v.device_type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">{v.country || '—'}</td>
                      <td className="px-4 py-2.5">{v.city || '—'}</td>
                      <td className="px-4 py-2.5 max-w-[150px] truncate text-xs text-on-surface-variant" title={v.referrer}>{v.referrer || '—'}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{formatAdminDateTime(v.viewed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
