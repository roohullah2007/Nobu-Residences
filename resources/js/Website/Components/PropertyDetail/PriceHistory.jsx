import React, { useState } from 'react';

/**
 * Price History — driven by the `priceHistory` array attached to
 * propertyData (sourced from Repliers via WebsiteController::buildPriceHistory).
 *
 * Each entry has: mlsNumber, listPrice, listDate, soldPrice, soldDate,
 *   lastStatus, daysOnMarket, type.
 *
 * Layout matches the reference design:
 *   [thumb] [date / time-ago]   [Status / Listed for $X on date]   [N days on market]
 *
 * Public-by-default: rows render in full for every visitor (no auth blur),
 * since the price history is the same information shown elsewhere on the
 * page.
 */
const PriceHistory = ({
  propertyData = null,
  propertyImages = null,
  showAll = false,
  building = null,
  // `auth` and `onLoginClick` are accepted for backwards-compatibility with
  // existing callers but are no longer used internally.
  auth: _auth = null,
  onLoginClick: _onLoginClick = null,
}) => {
  const [expanded, setExpanded] = useState(false);

  const pickFromImageList = (list) => {
    if (!Array.isArray(list) || list.length === 0) return null;
    const first = list[0];
    if (typeof first === 'string') return first;
    if (first?.MediaURL) return first.MediaURL;
    if (first?.url) return first.url;
    return null;
  };

  const getPropertyImage = () => {
    return (
      pickFromImageList(propertyImages) ||
      pickFromImageList(propertyData?.Images) ||
      pickFromImageList(propertyData?.ImageObjects) ||
      pickFromImageList(propertyData?.images) ||
      propertyData?.MediaURL ||
      propertyData?.imageUrl ||
      propertyData?.image ||
      null
    );
  };

  const propertyImage = getPropertyImage();

  // Normalize and filter the raw history
  const rawHistory =
    propertyData?.priceHistory ||
    propertyData?.PriceHistory ||
    propertyData?.history ||
    [];

  const history = (Array.isArray(rawHistory) ? rawHistory : [])
    .map((h) => ({
      mlsNumber: h.mlsNumber || h.MlsNumber || h.listingKey || '',
      listPrice: parseFloat(h.listPrice || h.ListPrice || 0) || 0,
      listDate: h.listDate || h.ListDate || h.listingContractDate || null,
      soldPrice: parseFloat(h.soldPrice || h.SoldPrice || h.closePrice || 0) || 0,
      soldDate: h.soldDate || h.SoldDate || h.closeDate || null,
      lastStatus: h.lastStatus || h.LastStatus || h.status || '',
      daysOnMarket:
        parseInt(h.daysOnMarket || h.DaysOnMarket || h.simpleDaysOnMarket || 0, 10) ||
        null,
      type: h.type || h.Type || '',
      // Per-entry address + image — present in building-level history
      // (each entry is a different unit in the building).
      address: h.address || null,
      unitNumber: h.unitNumber || null,
      image: h.image || null,
    }))
    // Keep any entry that carries something worth showing. We used to require
    // a date, but Repliers occasionally omits dates on the active listing —
    // a row with a price + status is still useful, just rendered without a
    // date stamp.
    .filter((h) => h.listDate || h.soldDate || h.listPrice || h.soldPrice);

  // Sort newest first
  history.sort((a, b) => {
    const da = new Date(a.soldDate || a.listDate || 0).getTime();
    const db = new Date(b.soldDate || b.listDate || 0).getTime();
    return db - da;
  });

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (n) =>
    n
      ? `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      : '';

  // Friendly relative time: "1 day ago" / "3 weeks ago" / "1 year ago"
  const relativeTime = (d) => {
    if (!d) return '';
    const then = new Date(d).getTime();
    if (isNaN(then)) return '';
    const days = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`;
    const years = Math.floor(days / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  };

  // Status code → display label + color class
  const statusDisplay = (s) => {
    const code = (s || '').toString().toLowerCase();
    if (['sld', 'sold'].includes(code)) return { label: 'Sold', cls: 'text-emerald-600' };
    if (['lsd', 'leased'].includes(code)) return { label: 'Leased', cls: 'text-emerald-600' };
    if (['exp', 'expired'].includes(code)) return { label: 'Expired', cls: 'text-rose-600' };
    if (['ter', 'terminated'].includes(code)) return { label: 'Terminated', cls: 'text-rose-600' };
    if (['sus', 'suspended'].includes(code)) return { label: 'Suspended', cls: 'text-amber-600' };
    if (['pc', 'price change'].includes(code)) return { label: 'Price Change', cls: 'text-blue-600' };
    if (['new', 'a', 'active'].includes(code)) return { label: 'Listed', cls: 'text-[#293056]' };
    return { label: s || 'Listed', cls: 'text-[#293056]' };
  };

  // Show a preview of recent entries inline; the "View full price history"
  // button below sends the user to the dedicated page (or expands the list
  // when no full page exists). No auth gating — entries are public info.
  const PREVIEW_LIMIT = 5;
  const previewCount = showAll || expanded
    ? history.length
    : Math.min(history.length, PREVIEW_LIMIT);
  const visibleHistory = history.slice(0, previewCount);

  // Address subtitle ("813 - 15 Mercer Street")
  const subtitleAddress = (() => {
    const unit = propertyData?.UnitNumber || propertyData?.unitNumber || '';
    const sn = propertyData?.StreetNumber || propertyData?.streetNumber || '';
    const stName = propertyData?.StreetName || propertyData?.streetName || '';
    const stSuf = propertyData?.StreetSuffix || propertyData?.streetSuffix || '';
    const street = [sn, stName, stSuf].filter(Boolean).join(' ');
    return unit ? `${unit} - ${street}` : street || propertyData?.address || '';
  })();

  return (
    <div className="w-full p-6 rounded-2xl border border-gray-200 shadow-sm bg-white max-w-[1280px] mx-auto">
      <div className="mb-5">
        <h2
          className="text-[28px] font-bold mb-1 font-space-grotesk"
          style={{ color: '#293056' }}
        >
          Price History
        </h2>
        <p className="text-gray-500 text-sm">
          Discover the price history for {subtitleAddress || 'this listing'}
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-sm text-gray-500 py-6 text-center bg-gray-50 rounded-xl">
          No price history available for this listing.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleHistory.map((entry, idx) => {
            const status = statusDisplay(entry.lastStatus);
            const wasSold = ['Sold', 'Leased'].includes(status.label);
            const displayPrice = wasSold ? entry.soldPrice : entry.listPrice;
            const displayDate = entry.listDate || entry.soldDate;
            const eventDate = entry.soldDate || entry.listDate;

            return (
              <div
                key={`${entry.mlsNumber || 'h'}-${idx}`}
                className="flex items-center gap-4 bg-[#F8F8F8] rounded-xl p-3 md:p-4"
              >
                {/* Thumbnail — prefer per-entry image (building view) */}
                <div className="flex-shrink-0">
                  {(entry.image || propertyImage) ? (
                    <img
                      src={entry.image || propertyImage}
                      alt="Property"
                      className="w-[72px] h-[60px] md:w-[80px] md:h-[68px] object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-[72px] h-[60px] md:w-[80px] md:h-[68px] bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-[10px] text-center px-1">
                        No image
                      </span>
                    </div>
                  )}
                </div>

                {/* Date column */}
                <div className="flex flex-col min-w-[110px]">
                  <div className="text-sm font-semibold text-[#293056]">
                    {formatDate(eventDate) || '—'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {relativeTime(eventDate)}
                  </div>
                </div>

                {/* Status + listed-for line */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className={`font-bold text-sm ${status.cls}`}>
                    {status.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {wasSold ? 'Sold for ' : 'Listed for '}
                    <span className="font-semibold text-[#293056]">
                      {' '}
                      {formatPrice(displayPrice) || 'N/A'}
                    </span>
                    {displayDate && (
                      <>
                        {' '}
                        on{' '}
                        <span>{formatDate(displayDate)}</span>
                      </>
                    )}
                  </div>
                  {entry.address && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {entry.address}
                    </div>
                  )}
                </div>

                {/* Days on market separator + value */}
                <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                  <div className="h-10 w-px bg-gray-300" />
                  <div className="text-sm text-gray-700 whitespace-nowrap">
                    {entry.daysOnMarket
                      ? `${entry.daysOnMarket} days on market`
                      : 'Not Available'}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Footer button — always shown (unless caller already requested
              showAll). Resolves to a link to the building's dedicated full
              price-history page when we have building info; otherwise falls
              back to the universal /price-history/{listingKey} page so the
              button always goes somewhere useful. */}
          {!showAll && (() => {
            const slugify = (s) =>
              (s || '')
                .toString()
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');

            // The component is reused on building detail pages where
            // `propertyData` IS the building. On property detail pages the
            // building info is passed via the explicit `building` prop.
            const looksLikeBuilding =
              !!propertyData?.slug &&
              !!propertyData?.name &&
              !propertyData?.listingKey &&
              !propertyData?.ListingKey;

            const buildingSource = looksLikeBuilding ? propertyData : building;

            let href = null;
            if (buildingSource && (buildingSource.slug || buildingSource.name)) {
              const cityForUrl = buildingSource.city || 'Toronto';
              const slugParts = [];
              if (buildingSource.name) slugParts.push(slugify(buildingSource.name));
              if (buildingSource.street_address_1) slugParts.push(slugify(buildingSource.street_address_1));
              if (buildingSource.street_address_2) slugParts.push(slugify(buildingSource.street_address_2));
              if (slugParts.length === 1 && buildingSource.address) {
                buildingSource.address
                  .split(/\s*[,&]\s*/)
                  .filter(Boolean)
                  .forEach((p) => slugParts.push(slugify(p)));
              }
              href = `/${slugify(cityForUrl)}/${slugParts.filter(Boolean).join('-')}/price-history`;
            } else {
              // No building context — fall back to the per-listing
              // price-history page. Works for any property type.
              const listingKey =
                propertyData?.listingKey ||
                propertyData?.ListingKey ||
                propertyData?.mlsNumber ||
                propertyData?.MlsNumber ||
                null;
              if (listingKey) {
                href = `/price-history/${listingKey}`;
              }
            }

            if (href) {
              return (
                <a
                  href={href}
                  className="block w-full text-center border border-gray-200 text-[#263238] py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors mt-1"
                >
                  View full price history
                </a>
              );
            }

            // Last-resort fallback: no building, no listingKey — just
            // expand inline so the button is never a dead end.
            return (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full border border-gray-200 text-[#263238] py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors mt-1"
              >
                {expanded ? 'Hide full listing history' : 'View full listing history'}
              </button>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default PriceHistory;
