import React, { useState, useEffect } from 'react';

/**
 * MarketData — "Market Sentiment" card on the property detail page, per the
 * client's reference design: Buyer's/Balanced/Seller's gradient gauge with a
 * pointer plus key area stats (months of inventory, median DOM, sale-to-list),
 * live from Repliers via /api/market-stats. No trends chart — the reference
 * card is the whole section.
 */

const NAVY = 'rgb(2, 46, 80)';

export default function MarketData({ propertyData = {}, buildingData = null, auth = null, onLoginClick }) {
  const [data, setData] = useState(null);
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

  // Login gate — show a sign-in prompt instead of the stats for guests.
  if (isGuest) {
    const gatedScope = neighborhood || area || city;
    return (
      <div id="market-info" className="scroll-mt-32 rounded-2xl bg-white p-5 sm:p-6 border border-gray-200">
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: NAVY }}>Market Sentiment</h3>
        <p className="mt-1 text-sm text-gray-500">
          Market conditions &amp; key stats{gatedScope ? ` in ${gatedScope}` : ''}
        </p>
        <div className="mt-5 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 py-10 px-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p className="mt-3 text-sm font-semibold" style={{ color: NAVY }}>Sign in to view market sentiment</p>
          <p className="mt-1 text-xs text-gray-500">See inventory, days on market, and sale-to-list for this area.</p>
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

  const sentiment = data?.sentiment || null;
  if (!sentiment) return null;

  const scopeName = sentiment.scope || data?.area || neighborhood || area || city;

  return (
    <div id="market-info" className="scroll-mt-32 rounded-2xl bg-white p-5 sm:p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: NAVY }}>Market Sentiment</h3>
        <span className="text-sm sm:text-base font-bold text-blue-600">{sentiment.label}</span>
      </div>
      <div className="relative mt-4">
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
      <div className="mt-1.5 flex justify-between text-[11px] sm:text-xs text-gray-500">
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
        Based on {sentiment.active} active listings · {sentiment.sold90} sales in {scopeName} (last 90 days)
      </p>
    </div>
  );
}
