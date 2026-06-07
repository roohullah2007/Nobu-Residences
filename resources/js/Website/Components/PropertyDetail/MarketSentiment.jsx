import React, { useState, useEffect } from 'react';

/**
 * MarketSentiment — small sidebar gauge (Buyer's / Balanced / Seller's market)
 * computed from active vs recently-sold supply in the listing's neighbourhood,
 * live from Repliers via /api/market-stats. Renders nothing until data loads.
 */

const NAVY = 'rgb(2, 46, 80)';

export default function MarketSentiment({ propertyData = {}, buildingData = null }) {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  const city = propertyData.city || propertyData.City || '';
  const area = propertyData.area || '';
  const neighborhood =
    propertyData.neighborhood || buildingData?.sub_neighbourhood || buildingData?.neighbourhood || '';
  const isRent = /rent|lease/i.test(propertyData.transactionType || propertyData.TransactionType || '');

  useEffect(() => {
    if (!city && !area && !neighborhood) { setLoading(false); return; }
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
      .then((d) => { if (!cancelled) { setSentiment(d.sentiment); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [city, area, neighborhood]);

  if (loading || !sentiment) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-300 p-4">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '13px', fontWeight: 600, color: NAVY }}>Market Sentiment</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgb(4, 84, 195)' }}>{sentiment.label}</span>
      </div>
      <div
        className="relative mt-3 h-2 rounded-full"
        style={{
          background:
            'linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(147, 197, 253) 35%, rgb(134, 239, 172) 50%, rgb(252, 165, 165) 75%, rgb(239, 68, 68) 100%)',
        }}
      >
        <div className="absolute -top-1.5" style={{ left: `calc(${sentiment.position}% - 6px)` }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="#022E50">
            <path d="M6 9L1 3h10z" />
          </svg>
        </div>
      </div>
      <div
        className="mt-2 flex items-center justify-between"
        style={{ fontSize: '11px', color: 'rgb(156, 163, 175)', fontWeight: 600 }}
      >
        <span>Buyer's Market</span>
        <span>Balanced</span>
        <span>Seller's Market</span>
      </div>
      <p className="mt-3" style={{ fontSize: '11px', color: 'rgb(156, 163, 175)' }}>
        Based on {sentiment.active} active · {sentiment.sold90} sold in {sentiment.scope} (last 90 days)
      </p>
    </div>
  );
}
