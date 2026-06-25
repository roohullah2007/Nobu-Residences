// Location & Neighbourhood — Google Maps embed for the building address plus
// static transit / neighbourhood lists. Address is sourced from MLS settings.

export default function LocationSection({ pageContent, building = {} }) {
    const mlsSettings = pageContent?.mls_settings || {};

    const rawAddress = building.address || mlsSettings.default_building_address || '15 Mercer Street';
    const address = rawAddress.split(',')[0].trim();
    const city = building.city || 'Toronto';
    const province = building.province || 'ON';
    const fullAddress = `${address}, ${city}, ${province}`;

    // Prefer lat/lng when present, else fall back to the address string.
    const mapQuery = (building.latitude && building.longitude)
        ? `${building.latitude},${building.longitude}`
        : fullAddress;
    const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

    const buildingName = building.name || 'Nobu Residences';
    const locality = [building.sub_neighbourhood, building.neighbourhood].filter(Boolean).join(', ');

    const transit = [
        'St. Andrew Subway Station — 7 min walk',
        'Spadina & King Streetcar (504/510) — 2 min walk',
        'Union Station & GO Transit — 12 min walk',
        'Gardiner Expressway access — 4 min drive',
    ];

    const neighbourhood = [
        'Toronto Entertainment District',
        'Steps to the Financial District',
        'TIFF Bell Lightbox & Royal Alexandra Theatre',
        'Rogers Centre & Scotiabank Arena nearby',
        'King West dining, cafés & nightlife',
    ];

    return (
        <section id="location" className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-screen-xl px-4 md:px-0">
                <div className="mb-10 max-w-2xl">
                    <p className="font-work-sans text-xs uppercase tracking-[0.3em] text-gold-500">Where You Live</p>
                    <h2 className="mt-2 font-playfair text-3xl md:text-4xl font-semibold text-neutral-900">Location &amp; Neighbourhood</h2>
                    <p className="mt-3 font-work-sans text-neutral-500">
                        {fullAddress}{locality ? ` · ${locality}` : ''}
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-3xl border border-neutral-200">
                        <iframe
                            title={`${buildingName} location map`}
                            src={mapSrc}
                            className="h-[360px] w-full md:h-[460px]"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div className="grid gap-6">
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                            <h3 className="font-playfair text-xl font-semibold text-gold-600">Transit &amp; Connectivity</h3>
                            <ul className="mt-4 space-y-3">
                                {transit.map((t) => (
                                    <li key={t} className="flex items-start gap-3 font-work-sans text-sm text-neutral-600">
                                        <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-gold-500"></span>
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                            <h3 className="font-playfair text-xl font-semibold text-gold-600">The Neighbourhood</h3>
                            <ul className="mt-4 space-y-3">
                                {neighbourhood.map((t) => (
                                    <li key={t} className="flex items-start gap-3 font-work-sans text-sm text-neutral-600">
                                        <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-gold-500"></span>
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
