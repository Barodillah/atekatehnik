import React, { useState, useRef } from 'react';

/**
 * DualMetricLineChart
 * 
 * Menampilkan grafik garis interaktif dengan 2 metrik:
 * 1. Page Views (Post, Product, Gallery)
 * 2. WhatsApp Clicks
 * 
 * Mendukung mode Kumulatif (Running Total / Total Keseluruhan) dan mode Harian.
 */
const DualMetricLineChart = ({
  chartData = [],
  range = '7',
  onRangeChange,
  isLoading = false,
}) => {
  const [mode, setMode] = useState('cumulative'); // 'cumulative' | 'daily'
  const [showViews, setShowViews] = useState(true);
  const [showWa, setShowWa] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  const safeData = Array.isArray(chartData) ? chartData : [];

  // Hitung summary metrik dari data
  const lastItem = safeData[safeData.length - 1] || {};
  const totalViewsKumulatif = lastItem.views_cumulative ?? safeData.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalWaKumulatif = lastItem.wa_cumulative ?? safeData.reduce((acc, c) => acc + (c.wa_clicks || 0), 0);

  // Ambil nilai berdasarkan mode (kumulatif vs harian)
  const getValues = (item) => {
    const v = mode === 'cumulative' ? (item.views_cumulative ?? item.views ?? 0) : (item.views ?? 0);
    const w = mode === 'cumulative' ? (item.wa_cumulative ?? item.wa_clicks ?? 0) : (item.wa_clicks ?? 0);
    return { views: Math.max(0, Number(v) || 0), wa: Math.max(0, Number(w) || 0) };
  };

  const valuesList = safeData.map(getValues);
  const viewsValues = valuesList.map((v) => v.views);
  const waValues = valuesList.map((v) => v.wa);

  // Maximum scales untuk dual Y-axis
  const rawMaxViews = Math.max(...viewsValues, 0);
  const maxViews = Math.max(rawMaxViews > 0 ? Math.ceil(rawMaxViews * 1.15) : 10, 5);

  const rawMaxWa = Math.max(...waValues, 0);
  const maxWa = Math.max(rawMaxWa > 0 ? Math.ceil(rawMaxWa * 1.2) : 5, 3);

  // Dimensi SVG
  const width = 800;
  const height = 280;
  const padLeft = 56;
  const padRight = 56;
  const padTop = 30;
  const padBottom = 45;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const totalPoints = safeData.length;
  const xStep = totalPoints > 1 ? chartW / (totalPoints - 1) : chartW;

  // Koordinat titik Views & WA
  const pointsViews = safeData.map((item, i) => {
    const { views } = getValues(item);
    const x = padLeft + i * xStep;
    const y = padTop + chartH - (views / maxViews) * chartH;
    return { x, y, val: views, item };
  });

  const pointsWa = safeData.map((item, i) => {
    const { wa } = getValues(item);
    const x = padLeft + i * xStep;
    const y = padTop + chartH - (wa / maxWa) * chartH;
    return { x, y, val: wa, item };
  });

  // Helper untuk membuat smooth cubic bezier curve
  const generateBezierPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;

    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }
    return path;
  };

  const linePathViews = generateBezierPath(pointsViews);
  const areaPathViews =
    pointsViews.length > 0
      ? `${linePathViews} L ${pointsViews[pointsViews.length - 1].x},${padTop + chartH} L ${pointsViews[0].x},${padTop + chartH} Z`
      : '';

  const linePathWa = generateBezierPath(pointsWa);
  const areaPathWa =
    pointsWa.length > 0
      ? `${linePathWa} L ${pointsWa[pointsWa.length - 1].x},${padTop + chartH} L ${pointsWa[0].x},${padTop + chartH} Z`
      : '';

  // Interaktivitas hover via Mouse move
  const handleMouseMove = (e) => {
    if (!svgRef.current || totalPoints === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;

    // Cari titik terdekat
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < totalPoints; i++) {
      const ptX = padLeft + i * xStep;
      const diff = Math.abs(svgX - ptX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Format label tanggal bahasa Indonesia
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTooltipDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Tentukan interval penulisan label di sumbu X agar rapi
  const getLabelInterval = () => {
    if (totalPoints <= 7) return 1;
    if (totalPoints <= 14) return 2;
    return Math.ceil(totalPoints / 7);
  };
  const labelInterval = getLabelInterval();

  const activeItem = hoverIndex !== null ? safeData[hoverIndex] : null;
  const activeViewsPt = hoverIndex !== null ? pointsViews[hoverIndex] : null;
  const activeWaPt = hoverIndex !== null ? pointsWa[hoverIndex] : null;

  // Hitung posisi tooltip agar tidak keluar frame kanan
  const isRightSide = hoverIndex !== null && hoverIndex > totalPoints / 2;

  return (
    <div className="bg-surface-container-lowest border border-surface-container-low rounded-xl p-4 sm:p-6 md:p-8 shadow-sm flex flex-col justify-between">
      {/* ── Top Header & Filter Controls ───────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
              <span className="material-symbols-outlined text-xl">show_chart</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-headline tracking-tight flex items-center gap-2">
                Trafik & Konversi
                {isLoading && (
                  <span className="material-symbols-outlined text-xs text-slate-400 animate-spin">
                    progress_activity
                  </span>
                )}
              </h3>
            </div>
          </div>
        </div>

        {/* Action Controls: Mode & Range */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Toggle Mode: Kumulatif vs Harian */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setMode('cumulative')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${mode === 'cumulative'
                ? 'bg-white text-blue-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
              title="Tampilkan total keseluruhan berjalan"
            >
              Kumulatif
            </button>
            <button
              onClick={() => setMode('daily')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${mode === 'daily'
                ? 'bg-white text-blue-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
              title="Tampilkan pertambahan per hari"
            >
              Harian
            </button>
          </div>

          {/* Range Pills */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            {[
              { id: '7', label: '7 D' },
              { id: '14', label: '14 D' },
              { id: '30', label: '30 D' },
              { id: 'month', label: 'This Month' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => onRangeChange?.(r.id)}
                className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${range === r.id
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legend & KPI Badges ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-2">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Toggle Line Views */}
          <button
            onClick={() => setShowViews((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${showViews
              ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-2xs'
              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            title="Klik untuk tampilkan/sembunyikan garis Views"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-300"></span>
            <span className="font-bold">Page Views (Semua Halaman)</span>
            <span className="bg-white/80 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold text-blue-700 border border-blue-100">
              {totalViewsKumulatif.toLocaleString('id-ID')}
            </span>
          </button>

          {/* Toggle Line WA Clicks */}
          <button
            onClick={() => setShowWa((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${showWa
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-2xs'
              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            title="Klik untuk tampilkan/sembunyikan garis Klik WA"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-300"></span>
            <span className="font-bold">WhatsApp Clicks</span>
            <span className="bg-white/80 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold text-emerald-700 border border-emerald-100">
              {totalWaKumulatif.toLocaleString('id-ID')}
            </span>
          </button>
        </div>

        {/* Conversion Rate Indicator */}
        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <span className="material-symbols-outlined text-sm text-amber-500">trending_up</span>
          <span>Konversi Klik:</span>
          <span className="font-bold text-slate-800">
            {totalViewsKumulatif > 0
              ? `${((totalWaKumulatif / totalViewsKumulatif) * 100).toFixed(1)}%`
              : '0%'}
          </span>
        </div>
      </div>

      {/* ── SVG Chart Canvas ──────────────────────────────────────── */}
      <div className="relative w-full mt-3 select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Views Area Gradient */}
            <linearGradient id="viewsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
            </linearGradient>

            {/* WA Clicks Area Gradient */}
            <linearGradient id="waAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.00" />
            </linearGradient>

            {/* Drop Shadow for Line and Dots */}
            <filter id="shadowViews" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.3" />
            </filter>
            <filter id="shadowWa" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#059669" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = padTop + chartH * (1 - pct);
            const viewVal = Math.round(maxViews * pct);
            const waVal = Math.round(maxWa * pct);

            return (
              <g key={idx}>
                {/* Dashed line */}
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={pct === 0 ? '0' : '4 4'}
                />

                {/* Left Y-axis label (Views - Blue) */}
                {showViews && (
                  <text
                    x={padLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fill="#3b82f6"
                    className="text-[10px] font-mono font-semibold"
                  >
                    {viewVal}
                  </text>
                )}

                {/* Right Y-axis label (WA - Emerald) */}
                {showWa && (
                  <text
                    x={width - padRight + 8}
                    y={y + 3.5}
                    textAnchor="start"
                    fill="#10b981"
                    className="text-[10px] font-mono font-semibold"
                  >
                    {waVal}
                  </text>
                )}
              </g>
            );
          })}

          {/* Sumbu X Bottom Line */}
          <line
            x1={padLeft}
            y1={padTop + chartH}
            x2={width - padRight}
            y2={padTop + chartH}
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Area Fills */}
          {showViews && areaPathViews && (
            <path d={areaPathViews} fill="url(#viewsAreaGradient)" className="transition-all duration-300" />
          )}
          {showWa && areaPathWa && (
            <path d={areaPathWa} fill="url(#waAreaGradient)" className="transition-all duration-300" />
          )}

          {/* Stroke Lines */}
          {showViews && linePathViews && (
            <path
              d={linePathViews}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#shadowViews)"
              className="transition-all duration-300"
            />
          )}

          {showWa && linePathWa && (
            <path
              d={linePathWa}
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#shadowWa)"
              className="transition-all duration-300"
            />
          )}

          {/* Data Points (Dots) */}
          {showViews &&
            pointsViews.map((pt, i) => {
              const isHovered = hoverIndex === i;
              return (
                <circle
                  key={`v-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : totalPoints > 14 ? 2.5 : 3.5}
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-200"
                />
              );
            })}

          {showWa &&
            pointsWa.map((pt, i) => {
              const isHovered = hoverIndex === i;
              return (
                <circle
                  key={`w-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : totalPoints > 14 ? 2.5 : 3.5}
                  fill="#ffffff"
                  stroke="#059669"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-200"
                />
              );
            })}

          {/* Crosshair Guideline on Hover */}
          {hoverIndex !== null && activeViewsPt && (
            <line
              x1={activeViewsPt.x}
              y1={padTop}
              x2={activeViewsPt.x}
              y2={padTop + chartH}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="pointer-events-none"
            />
          )}

          {/* X Axis Labels */}
          {safeData.map((item, i) => {
            const shouldShow =
              i === 0 || i === totalPoints - 1 || i % labelInterval === 0 || hoverIndex === i;
            if (!shouldShow) return null;

            const x = padLeft + i * xStep;
            const isHovered = hoverIndex === i;

            return (
              <text
                key={`lbl-${i}`}
                x={x}
                y={padTop + chartH + 20}
                textAnchor="middle"
                fill={isHovered ? '#0f172a' : '#64748b'}
                className={`text-[10px] font-sans ${isHovered ? 'font-bold' : 'font-medium'}`}
              >
                {formatDateLabel(item.date)}
              </text>
            );
          })}
        </svg>

        {/* ── Floating Tooltip Card (HTML Layer on Hover) ──────── */}
        {hoverIndex !== null && activeItem && (
          <div
            className="absolute pointer-events-none z-30 transition-all duration-150 ease-out"
            style={{
              left: `${(pointsViews[hoverIndex].x / width) * 100}%`,
              top: '15px',
              transform: isRightSide ? 'translateX(-105%)' : 'translateX(8%)',
            }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-xl p-3 shadow-2xl border border-slate-700/80 min-w-[200px]">
              {/* Tooltip Header: Date */}
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-700/80 font-bold text-slate-200">
                <span className="material-symbols-outlined text-sm text-orange-400">calendar_today</span>
                <span>{formatTooltipDate(activeItem.date)}</span>
              </div>

              {/* Tooltip Body: Views */}
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Views:</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white text-sm font-mono">
                      {(activeItem.views_cumulative ?? activeItem.views ?? 0).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-blue-300 ml-1 font-mono">
                      (+{(activeItem.views || 0)})
                    </span>
                  </div>
                </div>

                {/* Tooltip Body: WA Clicks */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Klik WA:</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white text-sm font-mono">
                      {(activeItem.wa_cumulative ?? activeItem.wa_clicks ?? 0).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-emerald-300 ml-1 font-mono">
                      (+{(activeItem.wa_clicks || 0)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Mode indicator footer */}
              <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Mode:</span>
                <span className="font-semibold text-slate-300">
                  {mode === 'cumulative' ? 'Total Kumulatif' : 'Trafik Harian'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DualMetricLineChart;
