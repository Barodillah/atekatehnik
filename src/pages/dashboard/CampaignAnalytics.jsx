import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { formatAdminDateTime } from '../../utils/dateUtils';

const CampaignAnalytics = () => {
  const { searchQuery } = useOutletContext() || {};

  const [dimension, setDimension] = useState('campaign');
  const [dateRange, setDateRange] = useState('30d');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  // UTM URL Builder Modal State
  const [showBuilder, setShowBuilder] = useState(false);
  const [copied, setCopied] = useState(false);
  const [builderForm, setBuilderForm] = useState({
    baseUrl: typeof window !== 'undefined' ? `${window.location.origin}/products` : 'https://atekatehnik.com/products',
    source: 'meta',
    medium: 'cpc',
    campaign: '',
    content: '',
    term: '',
    id: '',
    platform: 'Meta Ads Manager',
    format: 'video',
    tactic: 'prospecting'
  });

  const fetchCampaignData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        dimension,
        date_range: dateRange,
        ...(campaignFilter ? { campaign: campaignFilter } : {}),
        ...(searchQuery ? { q: searchQuery } : {})
      });
      const res = await fetch(`/api/admin_campaigns.php?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch campaign analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, [dimension, dateRange, campaignFilter, searchQuery]);

  // Generated UTM URL computed in real-time
  const generatedUtmUrl = useMemo(() => {
    if (!builderForm.baseUrl) return '';
    try {
      const url = new URL(builderForm.baseUrl.startsWith('http') ? builderForm.baseUrl : `https://${builderForm.baseUrl}`);
      if (builderForm.source) url.searchParams.set('utm_source', builderForm.source);
      if (builderForm.medium) url.searchParams.set('utm_medium', builderForm.medium);
      if (builderForm.campaign) url.searchParams.set('utm_campaign', builderForm.campaign);
      if (builderForm.content) url.searchParams.set('utm_content', builderForm.content);
      if (builderForm.term) url.searchParams.set('utm_term', builderForm.term);
      if (builderForm.id) url.searchParams.set('utm_id', builderForm.id);
      if (builderForm.platform) url.searchParams.set('utm_source_platform', builderForm.platform);
      if (builderForm.format) url.searchParams.set('utm_creative_format', builderForm.format);
      if (builderForm.tactic) url.searchParams.set('utm_marketing_tactic', builderForm.tactic);
      return url.toString();
    } catch {
      return '';
    }
  }, [builderForm]);

  const handleCopyLink = () => {
    if (!generatedUtmUrl) return;
    navigator.clipboard.writeText(generatedUtmUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const summary = data?.summary || {};
  const breakdown = data?.breakdown || [];
  const logs = data?.logs || [];
  const distributions = data?.distributions || {};

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-3xl">campaign</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 font-headline tracking-tight">
              Campaign & UTM Analytics
            </h2>
          </div>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Pantau statistik efektivitas iklan, perolehan traffic kampanye, dan atribusi 9 parameter UTM.
          </p>
        </div>

        {/* Action Controls: Date Range Presets & UTM Builder */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="inline-flex bg-slate-100 p-1 rounded-sm shadow-inner border border-slate-200/60 text-xs font-semibold">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: '7d', label: '7 Hari' },
              { id: '30d', label: '30 Hari' },
              { id: 'this_month', label: 'Bulan Ini' },
              { id: 'all', label: 'Semua' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setDateRange(preset.id)}
                className={`px-3 py-1.5 rounded-sm transition-all duration-200 ${dateRange === preset.id
                    ? 'bg-white text-blue-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Active Filter Pill */}
          {campaignFilter && (
            <button
              onClick={() => setCampaignFilter('')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-orange-100 text-orange-800 text-xs font-bold hover:bg-orange-200 transition-colors"
              title="Reset filter kampanye"
            >
              <span>Filter: {campaignFilter}</span>
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}

          {/* Launch UTM Builder Button */}
          <button
            onClick={() => setShowBuilder(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_link</span>
            UTM URL Builder
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Clicks */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between hover:border-blue-200 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Ad Clicks</span>
            <div className="text-3xl font-extrabold text-blue-950 mt-1">{summary.total_clicks || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">Total interaksi iklan</div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">ads_click</span>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between hover:border-orange-200 transition-colors">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Unique Visitors</span>
            <div className="text-3xl font-extrabold text-blue-950 mt-1">{summary.unique_visitors || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">Pengunjung unik (IP)</div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-orange-50 text-orange-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">group</span>
          </div>
        </div>

        {/* Top Campaign */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between hover:border-emerald-200 transition-colors">
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Campaign</span>
            <div className="text-lg font-extrabold text-blue-950 mt-1 truncate" title={summary.top_campaign?.label || '—'}>
              {summary.top_campaign?.label || '—'}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {summary.top_campaign?.count || 0} klik ({summary.total_clicks > 0 ? Math.round(((summary.top_campaign?.count || 0) / summary.total_clicks) * 100) : 0}%)
            </div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">campaign</span>
          </div>
        </div>

        {/* Top Traffic Source */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between hover:border-indigo-200 transition-colors">
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Source</span>
            <div className="text-lg font-extrabold text-blue-950 mt-1 truncate" title={summary.top_source?.label || '—'}>
              {summary.top_source?.label || '—'}
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-1">
              {summary.top_source?.count || 0} klik
            </div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">hub</span>
          </div>
        </div>

        {/* Top Creative Format / Platform */}
        <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100 flex items-start justify-between hover:border-purple-200 transition-colors col-span-2 lg:col-span-1">
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Format / Platform</span>
            <div className="text-lg font-extrabold text-blue-950 mt-1 truncate" title={summary.top_format?.label || '—'}>
              {summary.top_format?.label !== '(not set)' ? summary.top_format?.label : summary.top_platform?.label || '—'}
            </div>
            <div className="text-[11px] text-purple-600 font-semibold mt-1">
              {summary.top_format?.count || summary.top_platform?.count || 0} klik
            </div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">auto_awesome_motion</span>
          </div>
        </div>
      </div>

      {/* ── Dimension Selector Tab Bar ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200/70 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {[
            { key: 'campaign', label: 'Kampanye (utm_campaign)', icon: 'campaign' },
            { key: 'source_medium', label: 'Sumber / Media', icon: 'hub' },
            { key: 'platform', label: 'Platform Iklan', icon: 'devices' },
            { key: 'creative_format', label: 'Format Kreatif', icon: 'palette' },
            { key: 'tactic', label: 'Taktik Marketing', icon: 'strategy' },
            { key: 'content', label: 'Konten Iklan', icon: 'text_snippet' },
            { key: 'term', label: 'Kata Kunci (Term)', icon: 'key' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setDimension(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm whitespace-nowrap transition-all duration-150 cursor-pointer ${dimension === tab.key
                  ? 'bg-blue-900 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {searchQuery && (
          <div className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 font-semibold shrink-0">
            Pencarian: "{searchQuery}"
          </div>
        )}
      </div>

      {/* ── Quick Distribution Breakdown (Top Sources & Cities) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sources & Platforms */}
        <div className="bg-white p-5 rounded-sm border border-slate-100 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-sm">pie_chart</span>
            Pangsa Traffic Berdasarkan Sumber (Traffic Share)
          </h3>
          <div className="space-y-3">
            {distributions.sources?.length > 0 ? (
              distributions.sources.map((item, idx) => {
                const total = summary.total_clicks || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {item.label}
                      </span>
                      <span className="text-slate-500 font-semibold">{item.count} klik ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">Belum ada data sumber.</div>
            )}
          </div>
        </div>

        {/* Top Geographic Locations */}
        <div className="bg-white p-5 rounded-sm border border-slate-100 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 text-sm">public</span>
            Sebaran Lokasi Pengunjung Iklan
          </h3>
          <div className="space-y-3">
            {distributions.cities?.length > 0 ? (
              distributions.cities.map((city, idx) => {
                const total = summary.total_clicks || 1;
                const pct = Math.round((city.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs text-orange-400">location_on</span>
                        {city.label || 'Unknown'} {city.country ? `(${city.country})` : ''}
                      </span>
                      <span className="text-slate-500 font-semibold">{city.count} views ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">Belum ada data lokasi.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Breakdown Table ────────────────────────────────────── */}
      <div className="bg-white rounded-sm border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-950 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">table_chart</span>
              Rincian Performa: {dimension.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Diurutkan berdasarkan total klik tertinggi
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Menampilkan {breakdown.length} grup data
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-6 py-3">Dimensi / Nama Kampanye</th>
                <th className="px-6 py-3">Atribusi (Source / Medium / Format)</th>
                <th className="px-6 py-3 text-center">Klik</th>
                <th className="px-6 py-3 text-center">Unique Visitors</th>
                <th className="px-6 py-3">Pangsa Traffic (%)</th>
                <th className="px-6 py-3 text-right">Terakhir Dilihat</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-3xl animate-spin text-blue-500">progress_activity</span>
                    <p className="mt-2 text-xs">Memuat data analitik kampanye...</p>
                  </td>
                </tr>
              ) : breakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-30">search_off</span>
                    <p className="font-semibold text-slate-600">Belum ada data untuk rentang waktu ini.</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tautan UTM pada iklan untuk mulai mengumpulkan statistik.</p>
                  </td>
                </tr>
              ) : (
                breakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    {/* Dimension Key */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-950 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-base">ads_click</span>
                        {row.dim_key}
                      </div>
                      {row.utm_id && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {row.utm_id}</div>
                      )}
                    </td>

                    {/* Attribution Badges */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {row.utm_source && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            {row.utm_source}
                          </span>
                        )}
                        {row.utm_medium && (
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {row.utm_medium}
                          </span>
                        )}
                        {row.utm_source_platform && (
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {row.utm_source_platform}
                          </span>
                        )}
                        {row.utm_creative_format && (
                          <span className="bg-purple-50 text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {row.utm_creative_format}
                          </span>
                        )}
                        {row.utm_marketing_tactic && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {row.utm_marketing_tactic}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Clicks */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-100/70 text-blue-900 font-extrabold text-sm px-2.5 py-1 rounded">
                        {row.clicks}
                      </span>
                    </td>

                    {/* Unique Visitors */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-slate-700">{row.unique_visitors}</span>
                    </td>

                    {/* Share (%) */}
                    <td className="px-6 py-4 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${row.share_pct}%` }}></div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600 w-10 text-right">{row.share_pct}%</span>
                      </div>
                    </td>

                    {/* Last Activity */}
                    <td className="px-6 py-4 text-right text-xs text-slate-500 whitespace-nowrap">
                      {row.last_seen ? formatAdminDateTime(row.last_seen) : '—'}
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setCampaignFilter(row.utm_campaign || row.utm_source || row.dim_key)}
                        className="text-[10px] font-bold uppercase tracking-wider text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors cursor-pointer"
                        title="Filter hanya data kampanye ini"
                      >
                        Filter
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Real-Time Individual Clickstream Logs ────────────────────── */}
      <div className="bg-white rounded-sm border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-950 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">receipt_long</span>
              Log Kunjungan Pengunjung Iklan (Clickstream Detail)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Catatan realtime setiap interaksi pengguna dari tautan kampanye</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded">
            {logs.length} Log Terbaru
          </span>
        </div>

        <div className="overflow-x-auto max-h-[550px] custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Pengunjung / Lokasi</th>
                <th className="px-5 py-3">Kampanye & Sumber</th>
                <th className="px-5 py-3">Format / Taktik / Konten</th>
                <th className="px-5 py-3">Landing URL</th>
                <th className="px-5 py-3">Perangkat</th>
                <th className="px-5 py-3 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Visitor & Location */}
                  <td className="px-5 py-3">
                    <div className="font-mono font-bold text-slate-700">{log.ip_address}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      {log.country && log.country !== 'Local' && (
                        <img
                          src={`https://flagcdn.com/16x12/${log.country.toLowerCase()}.png`}
                          alt={log.country}
                          className="rounded-sm"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      {log.city || 'Unknown'}, {log.country || 'Unknown'}
                    </div>
                  </td>

                  {/* Campaign & Source */}
                  <td className="px-5 py-3">
                    <div className="font-bold text-blue-900">{log.utm_campaign || '(not set)'}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <span className="font-semibold text-slate-700">{log.utm_source}</span>
                      {log.utm_medium && <span>/ {log.utm_medium}</span>}
                    </div>
                  </td>

                  {/* Creative, Format & Content */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {log.utm_source_platform && (
                        <span className="bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                          {log.utm_source_platform}
                        </span>
                      )}
                      {log.utm_creative_format && (
                        <span className="bg-purple-50 text-purple-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                          {log.utm_creative_format}
                        </span>
                      )}
                      {log.utm_marketing_tactic && (
                        <span className="bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                          {log.utm_marketing_tactic}
                        </span>
                      )}
                    </div>
                    {(log.utm_content || log.utm_term) && (
                      <div className="text-[10px] text-slate-500 mt-1">
                        {log.utm_content && <span>Content: {log.utm_content} </span>}
                        {log.utm_term && <span className="text-blue-600">[kw: {log.utm_term}]</span>}
                      </div>
                    )}
                  </td>

                  {/* Landing URL */}
                  <td className="px-5 py-3 max-w-[200px] truncate" title={log.landing_url}>
                    {log.landing_url ? (
                      <a href={log.landing_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {log.landing_url}
                      </a>
                    ) : (
                      <span className="text-slate-400">/{log.page_slug}</span>
                    )}
                  </td>

                  {/* Device / Browser */}
                  <td className="px-5 py-3">
                    <div className="text-slate-700 font-medium">{log.browser || '—'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{log.os} • {log.device_type}</div>
                  </td>

                  {/* Time */}
                  <td className="px-5 py-3 text-right text-slate-500 whitespace-nowrap">
                    {formatAdminDateTime(log.viewed_at)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada log pengunjung ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Built-In UTM URL Builder Modal ──────────────────────────── */}
      {showBuilder && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-sm shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-blue-950 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">link</span>
                <h3 className="font-extrabold text-lg">UTM Campaign URL Builder</h3>
              </div>
              <button
                onClick={() => setShowBuilder(false)}
                className="w-8 h-8 rounded-sm bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
              <p className="text-slate-500">
                Gunakan alat ini untuk membuat tautan kampanye dengan parameter UTM lengkap yang siap dipasang di Facebook Ads, Google Ads, TikTok, WhatsApp, atau Newsletter.
              </p>

              {/* Base URL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Page URL *</label>
                <input
                  type="text"
                  value={builderForm.baseUrl}
                  onChange={(e) => setBuilderForm({ ...builderForm, baseUrl: e.target.value })}
                  placeholder="https://atekatehnik.com/products"
                  className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Source & Medium */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">utm_source * (Contoh: meta, google, tiktok, wa)</label>
                  <input
                    type="text"
                    value={builderForm.source}
                    onChange={(e) => setBuilderForm({ ...builderForm, source: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {['meta', 'google', 'instagram', 'tiktok', 'wa'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setBuilderForm({ ...builderForm, source: s })}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">utm_medium (Contoh: cpc, banner, bio, story)</label>
                  <input
                    type="text"
                    value={builderForm.medium}
                    onChange={(e) => setBuilderForm({ ...builderForm, medium: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {['cpc', 'banner', 'bio', 'organic-social'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setBuilderForm({ ...builderForm, medium: m })}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campaign & Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">utm_campaign (Nama Kampanye Promo)</label>
                  <input
                    type="text"
                    value={builderForm.campaign}
                    onChange={(e) => setBuilderForm({ ...builderForm, campaign: e.target.value })}
                    placeholder="promo_rmu_2026"
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">utm_content (Varian Iklan / Posisi CTA)</label>
                  <input
                    type="text"
                    value={builderForm.content}
                    onChange={(e) => setBuilderForm({ ...builderForm, content: e.target.value })}
                    placeholder="banner_dryer_v1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Platform, Creative Format & Tactic */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">utm_source_platform</label>
                  <input
                    type="text"
                    value={builderForm.platform}
                    onChange={(e) => setBuilderForm({ ...builderForm, platform: e.target.value })}
                    placeholder="Meta Ads Manager"
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">utm_creative_format</label>
                  <input
                    type="text"
                    value={builderForm.format}
                    onChange={(e) => setBuilderForm({ ...builderForm, format: e.target.value })}
                    placeholder="video / carousel / single_image"
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">utm_marketing_tactic</label>
                  <input
                    type="text"
                    value={builderForm.tactic}
                    onChange={(e) => setBuilderForm({ ...builderForm, tactic: e.target.value })}
                    placeholder="prospecting / remarketing"
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Term & Campaign ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">utm_term (Keyword / Kata Kunci Target)</label>
                  <input
                    type="text"
                    value={builderForm.term}
                    onChange={(e) => setBuilderForm({ ...builderForm, term: e.target.value })}
                    placeholder="mesin selep padi"
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">utm_id (Ads Campaign ID)</label>
                  <input
                    type="text"
                    value={builderForm.id}
                    onChange={(e) => setBuilderForm({ ...builderForm, id: e.target.value })}
                    placeholder="cmp_99214"
                    className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Generated URL Box */}
              <div className="pt-2">
                <label className="block font-extrabold text-blue-950 mb-1">Tautan Final yang Dihasilkan:</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm font-mono text-[11px] text-blue-900 break-all select-all">
                  {generatedUtmUrl || 'Lengkapi URL target dan sumber iklan di atas...'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">Parameter otomatis disesuaikan dengan database Ateka.</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBuilder(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={!generatedUtmUrl}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Tersalin ke Clipboard!' : 'Salin Tautan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CampaignAnalytics;

