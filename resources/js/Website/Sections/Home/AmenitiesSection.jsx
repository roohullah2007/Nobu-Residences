// Amenities driven by pageContent.about.tabs.amenities.items, rendered with
// the same availableIcons SVG approach used elsewhere. Plus a static
// Walk/Transit/Bike score strip.

export default function AmenitiesSection({ pageContent, availableIcons, building = {} }) {
    const aboutTabs = pageContent?.about?.tabs || {};

    // Prefer the real building amenities ({ id, name, icon }) from the record.
    // Fall back to pageContent items, then to a Nobu default list.
    const buildingAmenities = Array.isArray(building.amenities) ? building.amenities : [];

    const amenities = buildingAmenities.length
        ? buildingAmenities.map((a) => ({ text: a.name, iconUrl: a.icon, key: a.id || a.name }))
        : (aboutTabs?.amenities?.items || [
            { text: 'Concierge', icon: 'concierge' },
            { text: 'Outdoor Pool', icon: 'pool' },
            { text: 'Party Room', icon: 'party_room' },
            { text: 'Visitor Parking', icon: 'parking' },
            { text: 'Media Room', icon: 'media' },
            { text: 'Meeting Room', icon: 'meeting' },
            { text: 'Parking Garage', icon: 'garage' },
            { text: 'Rooftop Deck', icon: 'rooftop' },
            { text: 'Security Guard', icon: 'security' },
        ]).map((a, i) => ({ text: a.text, icon: a.icon, key: `${a.text}-${i}` }));

    const renderIcon = (a) => {
        // Direct icon URL from the building amenity record.
        if (a.iconUrl) {
            return <img src={a.iconUrl} alt={a.text} className="h-6 w-6" />;
        }

        const iconName = a.icon;
        const categoryIcons = availableIcons?.amenities || [];
        const icon = iconName ? categoryIcons.find((i) => i.name === iconName) : null;

        if (icon?.svg_content) {
            return <div className="h-6 w-6 [&>svg]:h-6 [&>svg]:w-6" dangerouslySetInnerHTML={{ __html: icon.svg_content }} />;
        }
        if (icon?.icon_url) {
            return <img src={icon.icon_url} alt={iconName} className="h-6 w-6" />;
        }
        // Fallback diamond mark
        return (
            <svg className="h-5 w-5 text-gold-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
            </svg>
        );
    };

    // Walk/Transit/Bike scores are admin-editable via pageContent (there is no
    // live Walk Score API / building field) — fall back to sensible defaults.
    const sc = pageContent?.scores || pageContent?.about?.scores || {};
    const scores = [
        { label: 'Walk Score', value: String(sc.walk_score ?? sc.walk ?? '97'), note: sc.walk_note || "Walker's Paradise" },
        { label: 'Transit Score', value: String(sc.transit_score ?? sc.transit ?? '100'), note: sc.transit_note || 'World-Class Transit' },
        { label: 'Bike Score', value: String(sc.bike_score ?? sc.bike ?? '89'), note: sc.bike_note || 'Very Bikeable' },
    ];

    return (
        <section id="amenities" className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-screen-xl px-4 md:px-0">
                <div className="mb-10 max-w-2xl">
                    <p className="font-work-sans text-xs uppercase tracking-[0.3em] text-gold-500">Lifestyle</p>
                    <h2 className="mt-2 font-playfair text-3xl md:text-4xl font-semibold text-neutral-900">Building Amenities</h2>
                    <p className="mt-3 font-work-sans text-neutral-500">
                        Hospitality-grade services and curated spaces designed around the Nobu lifestyle.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {amenities.map((a) => (
                        <div
                            key={a.key}
                            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4 transition-colors hover:border-gold-400"
                        >
                            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gold-50">
                                {renderIcon(a)}
                            </span>
                            <span className="font-work-sans text-sm font-medium text-neutral-800">{a.text}</span>
                        </div>
                    ))}
                </div>

                {/* Score strip — dark band, blue accent labels */}
                <div className="mt-14 grid grid-cols-3 bg-neutral-900 rounded-xl overflow-hidden">
                    {scores.map((s) => (
                        <div key={s.label} className="py-8 text-center border-r border-white/10 last:border-0">
                            <span className="block font-playfair text-3xl md:text-4xl text-white">{s.value}</span>
                            <span className="block text-[11px] tracking-[0.2em] uppercase text-gold-400 mt-1">{s.label}</span>
                            <span className="block text-[11px] text-white/40 mt-0.5">{s.note}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
