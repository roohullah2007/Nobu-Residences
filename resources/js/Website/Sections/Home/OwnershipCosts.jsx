// Maintenance / Ownership costs — ICE-reference layout. The per-suite fee
// estimates and "additional costs" are indicative presentational copy; the
// building name, "managed by" line, and the "Includes" column are dynamic
// from the building record.

export default function OwnershipCosts({ building = {} }) {
    const clean = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v).trim();
        return s === '-' || s === '' ? '' : s;
    };

    const buildingName = clean(building.name) || 'Nobu Residences';
    const management = clean(building.management_name);
    const corp = clean(building.corp_number);
    const managedBit = management
        ? ` Fees managed by ${management}${corp ? ` under ${corp}` : ''}.`
        : (corp ? ` Fees administered under ${corp}.` : '');

    // "Includes" — driven by the building's maintenance-fee amenities, with a
    // sensible fallback for a downtown luxury condo.
    const feeAmenities = Array.isArray(building.maintenance_fee_amenities) ? building.maintenance_fee_amenities : [];
    const includesText = (feeAmenities.length
        ? feeAmenities.map((a) => a.name).filter(Boolean)
        : ['Water', 'Heat', 'Building Insurance']
    ).join(', ');

    // Indicative monthly maintenance ranges by suite type (no live source).
    const rows = [
        { type: 'Studio (350–450 sq ft)', fee: '$350–$420/mo' },
        { type: '1 Bedroom (500–650 sq ft)', fee: '$420–$550/mo' },
        { type: '1 Bed + Den (600–750 sq ft)', fee: '$500–$620/mo' },
        { type: '2 Bedroom (750–950 sq ft)', fee: '$600–$750/mo' },
        { type: '2 Bed + Den (850–1,100 sq ft)', fee: '$680–$820/mo' },
        { type: '3 Bedroom (1,000–1,400 sq ft)', fee: '$750–$950/mo' },
    ];

    const extras = [
        { label: 'Property Tax (annual)', note: 'Varies by assessed value — typically 0.6–0.7% of MPAC value' },
        { label: 'Hydro (Electricity)', note: 'Separately metered — avg. $50–$120/mo depending on unit size' },
        { label: 'Parking', note: 'Underground spots available — purchase ($45K–$75K) or rent ($150–$250/mo)' },
        { label: 'Locker', note: 'Storage lockers available — purchase ($5K–$8K) or rent ($50–$75/mo)' },
        { label: 'Insurance', note: "Unit owner's insurance recommended — avg. $30–$60/mo" },
    ];

    return (
        <section id="costs" className="bg-neutral-50 py-20 md:py-28">
            <div className="mx-auto max-w-screen-xl px-4 md:px-0">
                {/* Centered header */}
                <div className="text-center mb-14">
                    <p className="font-work-sans text-gold-500 text-[11px] tracking-[0.3em] uppercase mb-3">Ownership Costs</p>
                    <h2 className="font-playfair text-3xl md:text-4xl text-neutral-900 mb-4">Maintenance Fees &amp; Cost of Living</h2>
                    <p className="font-work-sans text-neutral-500 text-sm max-w-xl mx-auto">
                        Estimated monthly costs for {buildingName} owners.{managedBit}
                    </p>
                </div>

                {/* Fee table card */}
                <div className="overflow-x-auto mb-12">
                    <div className="min-w-[640px] bg-white rounded-xl overflow-hidden shadow-sm">
                        <div className="grid grid-cols-3 bg-neutral-900 text-white px-6 py-4">
                            <span className="text-[11px] tracking-[0.15em] uppercase">Unit Type</span>
                            <span className="text-[11px] tracking-[0.15em] uppercase text-center">Est. Monthly Fee</span>
                            <span className="text-[11px] tracking-[0.15em] uppercase text-center">Includes</span>
                        </div>
                        {rows.map((r, i) => (
                            <div
                                key={r.type}
                                className={`grid grid-cols-3 px-6 py-4 items-center border-b border-neutral-100 ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}
                            >
                                <span className="text-[14px] font-medium text-neutral-800">{r.type}</span>
                                <span className="text-[14px] text-gold-600 font-semibold text-center">{r.fee}</span>
                                <span className="text-[13px] text-neutral-500 text-center">{includesText}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional costs card */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-500" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                        </svg>
                        <h3 className="text-[14px] font-semibold text-neutral-800">Additional Costs to Consider</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {extras.map((e) => (
                            <div key={e.label} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-gold-400 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <span className="block text-[14px] font-medium text-neutral-800">{e.label}</span>
                                    <span className="block text-[13px] text-neutral-500 mt-0.5">{e.note}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
