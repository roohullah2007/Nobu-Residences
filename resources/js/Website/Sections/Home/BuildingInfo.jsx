// "The Building" info section. Sourced from the real building record
// (buildingData prop) with pageContent / Nobu-specific fallbacks so the
// layout always looks complete.

export default function BuildingInfo({ pageContent, building = {} }) {
    const aboutContent = pageContent?.about || {};
    const buildingImage = building.main_image || aboutContent.image || '/assets/building.jpg';

    const buildingName = building.name || 'Nobu Residences';

    // Fact cards driven by the building record (hide blank / placeholder values).
    const clean = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v).trim();
        return s === '-' || s === '' ? '' : s;
    };

    const facts = [
        { label: 'Developer', value: clean(building.developer_name) || 'Madison Group' },
        { label: 'Year Built', value: clean(building.year_built) || '2024' },
        { label: 'Floors', value: clean(building.floors) || '45' },
        { label: 'Total Units', value: clean(building.total_units) || '660' },
        { label: 'Management', value: clean(building.management_name) },
        { label: 'Corp #', value: clean(building.corp_number) },
    ].filter((f) => f.value !== '');

    const overviewText = building.description ||
        aboutContent?.tabs?.overview?.content ||
        `Rising above ${clean(building.street_address_1) || '15 Mercer Street'} in Toronto's Entertainment District, ${buildingName} pairs iconic residences with a hospitality-grade lifestyle. Home to the world-renowned Nobu Hotel and Restaurant, the building delivers concierge service, curated amenities, and suites ranging from intimate studios to expansive multi-bedroom residences.`;

    // Two real building addresses (15 Mercer St / 35 Mercer) from the record.
    const addresses = (building.address
        ? building.address.split(',').map((a) => a.trim())
        : [clean(building.street_address_1), clean(building.street_address_2)]
    ).filter(Boolean);

    const heading = `A landmark address${addresses.length ? ` on ${addresses[0]}` : " on Mercer Street"}`;

    return (
        <section id="building" className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-screen-xl px-4 md:px-0">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <p className="font-work-sans text-xs uppercase tracking-[0.3em] text-gold-500">The Building</p>
                        <h2 className="mt-2 font-playfair text-3xl md:text-4xl font-semibold text-neutral-900">
                            {heading}
                        </h2>
                        <p className="mt-5 font-work-sans text-base md:text-lg leading-relaxed text-neutral-500">
                            {overviewText}
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {facts.map((f) => (
                                <div key={f.label} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                    <p className="font-work-sans text-[11px] uppercase tracking-[0.18em] text-neutral-400">{f.label}</p>
                                    <p className="mt-1.5 font-work-sans text-sm font-semibold text-neutral-900">{f.value}</p>
                                </div>
                            ))}
                        </div>

                        {addresses.length > 1 && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {addresses.map((a) => (
                                    <span key={a} className="rounded-full border border-gold-300 bg-gold-50 px-4 py-1.5 font-work-sans text-sm text-gold-700">
                                        {a}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <div className="overflow-hidden rounded-3xl border border-neutral-200">
                            <img
                                src={buildingImage}
                                alt={`${buildingName} building`}
                                className="h-[420px] md:h-[560px] w-full object-cover"
                                onError={(e) => { e.currentTarget.src = '/assets/nobu-building.jpg'; }}
                            />
                        </div>
                        <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-gold-300 bg-white/90 px-6 py-4 backdrop-blur-sm shadow-lg md:block">
                            <p className="font-playfair text-2xl font-semibold text-gold-600">Nobu</p>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Hotel · Restaurant · Residences</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
