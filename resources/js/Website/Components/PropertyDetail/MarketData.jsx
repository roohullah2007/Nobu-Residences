import React, { useState, useEffect } from 'react';

/**
 * MarketData — "Market Data" card on the property detail page.
 * Median sold price / sales count by year, live from Repliers via
 * /api/market-stats. Renders nothing until there are >= 2 data points.
 */

const NAVY = 'rgb(2, 46, 80)';

const fmtMoney = (n) => {
  if (!n) return '$0';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${n}`;
};

export default function MarketData({ propertyData = {}, buildingData = null, auth = null, onLoginClick }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('price');
  const [loading, setLoading] = useState(true);

  const isGuest = !auth?.user;
  const city = propertyData.city || propertyData.City || '';
  const area = propertyData.area || buildingData?.neighbourhood || '';
  const neighborhood =
    propertyData.neighborhood || buildingData?.sub_neighbourhood || buildingData?.neighbourhood || '';
  const isRent = /rent|lease/i.test(propertyData.transactionType || propertyData.TransactionType || '');

  useEffect(() => {
    // Market data is gated — don't even fetch it for signed-out visitors.
    if (isGuest) { setLoading(false); return; }
    if (!city && !area) { setLoading(false); return; }
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (area) params.set('area', area);
    if (neighborhood) params.set('neighborhood', neighborhood);
    params.set('type', isRent ? 'lease' : 'sale');

    let cancelled = false;
    fetch(`/api/market-stats?${params.toString()}`, {
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [city, area, neighborhood, isGuest]);

  if (loading) return null;

  // Login gate — show a sign-in prompt instead of the chart for guests.
  if (isGuest) {
    const gatedScope = neighborhood || area || city;
    return (
      <div id="market-info" className="scroll-mt-32 rounded-2xl bg-white p-5 sm:p-6 border border-gray-200">
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: NAVY }}>Market Data</h3>
        <p className="mt-1 text-sm text-gray-500">
          Sold price &amp; sales trends{gatedScope ? ` in ${gatedScope}` : ''}
        </p>
        <div className="mt-5 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 py-10 px-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p className="mt-3 text-sm font-semibold" style={{ color: NAVY }}>Sign in to view market trends</p>
          <p className="mt-1 text-xs text-gray-500">See median sold price and sales history for this area.</p>
          <button
            type="button"
            onClick={() => onLoginClick && onLoginClick()}
            className="mt-4 px-5 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: NAVY }}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const priceByYear = data?.trends?.priceByYear || [];
  const salesByYear = data?.trends?.salesByYear || [];
  const sentiment = data?.sentiment || null;
  if (priceByYear.length < 2 && !sentiment) return null;

  const hasTrends = priceByYear.length >= 2;
  const series = (tab === 'price' ? priceByYear : salesByYear).map((p) => ({
    x: p.year,
    y: tab === 'price' ? p.value : p.count,
  }));

  // Chart geometry (matches the agreed 720×240 viewBox layout).
  const X0 = 56, X1 = 704, Y0 = 16, Y1 = 212;
  const ys = series.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const range = maxY - minY || 1;
  const px = (i) => (series.length === 1 ? X1 : X0 + ((X1 - X0) * i) / (series.length - 1));
  const py = (y) => Y1 - (Y1 - Y0) * ((y - minY) / range);
  const pts = series.map((p, i) => ({ cx: px(i), cy: py(p.y), ...p }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx.toFixed(0)},${p.cy.toFixed(0)}`).join(' ');
  const areaPath = `${linePath} L${X1},${Y1} L${X0},${Y1} Z`;
  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => ({ y: Y0 + (Y1 - Y0) * t, val: maxY - (maxY - minY) * t }));
  const fmtY = (v) => (tab === 'price' ? fmtMoney(v) : Math.round(v).toLocaleString());
  const scopeName = data?.area || neighborhood || area || city;

  const tabBtn = (id, label) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className="-mb-px pb-2.5 transition-colors"
      style={{
        fontSize: '14px',
        fontWeight: tab === id ? 700 : 500,
        color: tab === id ? NAVY : 'rgb(107, 114, 128)',
        borderBottom: `2px solid ${tab === id ? NAVY : 'transparent'}`,
      }}
    >
      {label}
    </button>
  );

  return (
    <div id="market-info" className="scroll-mt-32 rounded-2xl bg-white p-5 sm:p-6 border border-gray-200">
      <h3 style={{ fontSize: '20px', fontWeight: 700, color: NAVY }}>Market Data</h3>
      <p className="mt-1 text-sm text-gray-500">Sold price &amp; sales trends in {scopeName}</p>

      {/* Market Sentiment gauge (per client reference): Buyer's/Balanced/
          Seller's gradient with pointer + key stats for the area. */}
      {sentiment && (
        <div className="mt-4 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: NAVY }}>Market Sentiment</span>
            <span className="text-sm font-bold text-blue-600">{sentiment.label}</span>
          </div>
          <div className="relative mt-3">
            <div
              className="h-1.5 rounded-full"
              style={{ background: 'linear-gradient(to right, #2563eb, #d1d5db 45%, #d1d5db 55%, #dc2626)' }}
            />
            <div
              className="absolute -top-1.5 -translate-x-1/2"
              style={{ left: `${sentiment.position}%` }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: `7px solid ${NAVY}`,
                }}
              />
            </div>
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-gray-500">
            <span>Buyer's Market</span>
            <span>Balanced</span>
            <span>Seller's Market</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            {sentiment.monthsInventory != null && (
              <span><span className="font-bold" style={{ color: NAVY }}>{sentiment.monthsInventory}</span> mo inventory</span>
            )}
            {sentiment.medianDom != null && (
              <span><span className="font-bold" style={{ color: NAVY }}>{sentiment.medianDom}</span> median DOM</span>
            )}
            {sentiment.saleToList != null && (
              <span><span className="font-bold" style={{ color: NAVY }}>{sentiment.saleToList}%</span> sale-to-list</span>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Based on {sentiment.active} active listings · {sentiment.sold90} sales in {sentiment.scope || scopeName} (last 90 days)
          </p>
        </div>
      )}

      {hasTrends && (
      <div className="mt-4">
        <div className="flex gap-6 border-b border-gray-200">
          {tabBtn('price', 'Price Trends')}
          {tabBtn('sales', 'Sales Trends')}
        </div>
        <div className="mt-4">
          <svg viewBox="0 0 720 240" className="w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0e9f6e" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0e9f6e" stopOpacity="0" />
              </linearGradient>
            </defs>
            {grid.map((g, i) => (
              <g key={i}>
                <line x1={X0} y1={g.y} x2={X1} y2={g.y} stroke="#f3f4f6" strokeWidth="1" />
                <text x="48" y={g.y + 4} textAnchor="end" style={{ fontSize: '10px', fill: 'rgb(156,163,175)' }}>
                  {fmtY(g.val)}
                </text>
              </g>
            ))}
            <path d={areaPath} fill="url(#trendGrad)" />
            <path d={linePath} fill="none" stroke="#0e9f6e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r="3" fill="#fff" stroke="#0e9f6e" strokeWidth="2" />
            ))}
            {pts.map((p, i) => (
              <text key={`t${i}`} x={p.cx} y="232" textAnchor="middle" style={{ fontSize: '10px', fill: 'rgb(156,163,175)' }}>
                {p.x}
              </text>
            ))}
          </svg>
          <p className="mt-2 text-xs text-gray-400">
            {tab === 'price' ? 'Median sold price by year' : 'Sales count by year'} in {scopeName} — source: Repliers.
          </p>
        </div>
      </div>
      )}
    </div>
  );
}
