import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { groupByBedrooms, formatMoney } from '@/Website/Sections/Home/iceData';

// Map a Unit Types row label to the integer `bedrooms` filter the Search page
// / PropertySearchController understands. Studio -> 0, "1 Bedroom"/"1 Bed + Den"
// -> 1, "N Bedrooms" -> N.
function bedroomsForLabel(label) {
    if (!label) return 0;
    if (/studio/i.test(label)) return 0;
    const m = String(label).match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
}

export default function UnitTypesTable({ forSale = [], forRent = [], building = {} }) {
    const [mode, setMode] = useState('sale');

    const source = mode === 'sale' ? forSale : forRent;
    const rows = groupByBedrooms(source);
    const totalCount = rows.reduce((sum, r) => sum + r.count, 0);

    const buildingName = building.name || 'Nobu Residences';
    const fmt = (n) => (n ? formatMoney(n) : '—');
    const sizeText = (s) => (s ? `${String(s).replace('-', ' – ')} sq ft` : 'N/A');

    // Discrete full street addresses for THIS building. The Search page +
    // PropertySearchController parse `street_addresses` (comma-separated) into
    // OR'd streetNumber/streetName arrays, which reliably covers multi-tower /
    // address-range buildings (e.g. Nobu = "15 Mercer St" + "35 Mercer"). We
    // prefer the discrete SA1/SA2 fields over the combined `address` string
    // (which can be a range like "8-38 Widmer St" that won't parse per-unit).
    const streetAddresses = [building.street_address_1, building.street_address_2]
        .map((v) => (v == null ? '' : String(v).trim()))
        .filter(Boolean)
        .join(',') || (building.address ? String(building.address).trim() : '');

    // Build the Search URL for a bedroom row scoped to this building + the
    // current Sale/Rent toggle. `status` carries the transaction (For Sale /
    // For Rent), `bedrooms` the bucket, and `street_addresses` (+ `building_id`
    // as backup) the building scope.
    const searchUrlFor = (beds) => {
        const params = new URLSearchParams();
        params.set('status', mode === 'sale' ? 'For Sale' : 'For Rent');
        params.set('bedrooms', String(beds));
        if (streetAddresses) params.set('street_addresses', streetAddresses);
        if (building.id) params.set('building_id', String(building.id));
        if (buildingName) params.set('query', buildingName);
        return `/search?${params.toString()}`;
    };

    return (
        <section id="units" className="bg-neutral-50 py-20 md:py-28">
            <div className="mx-auto max-w-screen-xl px-4 md:px-0">
                {/* Centered header */}
                <div className="text-center mb-12">
                    <p className="font-work-sans text-gold-500 text-[11px] tracking-[0.3em] uppercase mb-3">Available Units</p>
                    <h2 className="font-playfair text-3xl md:text-4xl text-neutral-900 mb-4">Unit Types &amp; Price Ranges</h2>
                    <p className="font-work-sans text-neutral-500 text-sm max-w-xl mx-auto">
                        Real-time breakdown of available units at {buildingName} by bedroom count, with current pricing from the Toronto MLS®.
                    </p>
                </div>

                {/* Centered Sale / Rent toggle */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex bg-neutral-200 rounded-full p-1">
                        <button
                            type="button"
                            onClick={() => setMode('sale')}
                            className={`px-6 py-2.5 text-[13px] tracking-[0.1em] uppercase font-medium rounded-full transition-all ${mode === 'sale' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            For Sale
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('rent')}
                            className={`px-6 py-2.5 text-[13px] tracking-[0.1em] uppercase font-medium rounded-full transition-all ${mode === 'rent' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            For Rent
                        </button>
                    </div>
                </div>

                {rows.length === 0 ? (
                    <p className="text-center font-work-sans text-neutral-500">
                        No {mode === 'sale' ? 'sale' : 'rental'} listings are currently available.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="min-w-[680px] bg-white rounded-xl overflow-hidden shadow-sm">
                            {/* Header row */}
                            <div className="grid grid-cols-5 bg-neutral-900 text-white px-6 py-4">
                                <span className="text-[11px] tracking-[0.15em] uppercase">Unit Type</span>
                                <span className="text-[11px] tracking-[0.15em] uppercase text-center">Available</span>
                                <span className="text-[11px] tracking-[0.15em] uppercase text-center">{mode === 'rent' ? 'Avg. Rent' : 'Avg. Price'}</span>
                                <span className="text-[11px] tracking-[0.15em] uppercase text-center">Price Range</span>
                                <span className="text-[11px] tracking-[0.15em] uppercase text-center">Size Range</span>
                            </div>

                            {/* Data rows (alternating white / neutral-50) */}
                            {rows.map((r, i) => (
                                <div
                                    key={r.label}
                                    className={`grid grid-cols-5 px-6 py-4 items-center border-b border-neutral-100 ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}
                                >
                                    <span className="text-[14px] font-medium text-neutral-800">{r.label}</span>
                                    <span className="text-[14px] text-neutral-600 text-center">
                                        <Link
                                            href={searchUrlFor(bedroomsForLabel(r.label))}
                                            aria-label={`View ${r.count} ${r.label} ${mode === 'sale' ? 'for sale' : 'for rent'} at ${buildingName}`}
                                            title={`View ${r.label} ${mode === 'sale' ? 'for sale' : 'for rent'} at ${buildingName}`}
                                            className="inline-flex items-center justify-center w-8 h-8 bg-gold-50 text-gold-700 rounded-full font-semibold text-sm cursor-pointer transition-all hover:bg-gold-100 hover:ring-2 hover:ring-gold-300 hover:scale-110"
                                        >
                                            {r.count}
                                        </Link>
                                    </span>
                                    <span className="text-[14px] text-neutral-600 text-center font-medium">{fmt(r.avg)}</span>
                                    <span className="text-[13px] text-neutral-500 text-center">
                                        {r.min ? `${fmt(r.min)} – ${fmt(r.max)}` : '—'}
                                    </span>
                                    <span className="text-[13px] text-neutral-500 text-center">{sizeText(r.sizeSample)}</span>
                                </div>
                            ))}

                            {/* Total row */}
                            <div className="grid grid-cols-5 px-6 py-4 bg-neutral-900 text-white">
                                <span className="text-[13px] font-semibold uppercase tracking-wider">Total</span>
                                <span className="text-[14px] font-semibold text-center">{totalCount}</span>
                                <span className="text-[13px] text-neutral-400 text-center">—</span>
                                <span className="text-[13px] text-neutral-400 text-center">—</span>
                                <span className="text-[13px] text-neutral-400 text-center">—</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
