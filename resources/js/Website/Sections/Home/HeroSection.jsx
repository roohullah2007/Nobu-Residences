import { formatMoneyShort } from '@/Website/Sections/Home/iceData';

export default function HeroSection({
    auth,
    siteName = 'Nobu Residences',
    website,
    pageContent,
    building = {},
    startingFromPrice = 0,
    forSaleCount = 0,
    forRentCount = 0,
    countsReady = false,
}) {
    const heroContent = pageContent?.hero || {};
    const mlsSettings = pageContent?.mls_settings || {};

    const buildingName = building.name || siteName || 'Nobu Residences';
    const welcomeText = heroContent.welcome_text || `WELCOME TO ${buildingName.toUpperCase()}`;
    // Short hero tagline in the ICE-reference style, built from the building's
    // key facts — NOT the long API description. Admin can override it via the
    // home page hero subheading.
    const suiteBit = building.total_units
        ? `Over ${Number(building.total_units).toLocaleString()} luxury residences`
        : 'Luxury residences';
    const locBit = [building.neighbourhood, building.city].filter(Boolean).join(', ') || 'Downtown Toronto';
    const devBit = building.developer_name ? `, developed by ${building.developer_name}` : '';
    const risingBit = building.floors
        ? `Rising ${building.floors} storeys above ${building.sub_neighbourhood || building.neighbourhood || 'Toronto'}. `
        : '';
    const builtTagline = `${risingBit}${suiteBit} in ${locBit}${devBit}.`;

    // Prefer a summary of the building's own description over the old
    // auto-seeded "Whether buying or renting..." tagline. A custom
    // admin-written subheading still wins.
    const MAX_SUMMARY_LENGTH = 180;
    const GENERIC_TAGLINE_PATTERN = /makes finding your home easy and reliable/i;
    const summarizeDescription = (raw) => {
        const text = String(raw || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!text || text.length <= MAX_SUMMARY_LENGTH) return text;
        const clipped = text.slice(0, MAX_SUMMARY_LENGTH);
        const sentenceEnd = clipped.lastIndexOf('. ');
        if (sentenceEnd > 60) return clipped.slice(0, sentenceEnd + 1);
        return `${clipped.slice(0, clipped.lastIndexOf(' '))}…`;
    };
    const descriptionSummary = summarizeDescription(building.description);
    const adminSubheading = heroContent.subheading || '';
    const hasCustomSubheading = adminSubheading && !GENERIC_TAGLINE_PATTERN.test(adminSubheading);
    const subheading = hasCustomSubheading ? adminSubheading : (descriptionSummary || adminSubheading || builtTagline);
    const backgroundImage = building.main_image || heroContent.background_image || '/assets/nobu-building.jpg';
    // Phones get the building's dedicated mobile hero when set (admin upload
    // on the building); desktop keeps the main image.
    const backgroundImageMobile = building.hero_image_mobile || heroContent.background_image_mobile || '';

    // Building addresses: prefer the building record, fall back to MLS settings.
    const defaultBuildingAddresses = building.address || mlsSettings.default_building_address || '15 Mercer Street';
    const buildingAddresses = defaultBuildingAddresses.split(',').map((addr) => addr.trim()).filter(Boolean);

    // First building address, used for the eyebrow display line.
    const firstAddress = buildingAddresses[0] || '15 Mercer Street';

    // Eyebrow line: "15 Mercer St · King West · Downtown · Toronto"
    const locality = [building.sub_neighbourhood, building.neighbourhood, building.city]
        .filter(Boolean).join(' · ') || 'King West · Downtown · Toronto';
    const addressDisplayLine = `${firstAddress} · ${locality}`;

    // Hero CTAs go to THIS building's available listings (per client: "for
    // sale and for rent will take user to available for rent and for sale in
    // that specific building") — the clean /for-sale | /for-rent tenant pages
    // from the client SEO spec (they scope to the linked building server-side).
    // Sites without a linked building fall back to smooth-scrolling to the
    // on-page carousels (id="for-sale" / id="for-rent" from ListingCarousel).
    const forSaleHref = building.id ? '/for-sale' : '#for-sale';
    const forRentHref = building.id ? '/for-rent' : '#for-rent';

    const scrollToSection = (e, sectionId) => {
        if (building.id) return; // real navigation — let the link work
        e.preventDefault();
        if (typeof window === 'undefined') return;
        const el = document.getElementById(sectionId);
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top, behavior: 'smooth' });
        } else {
            // Fallback: let the browser jump to the anchor if it appears later.
            window.location.hash = sectionId;
        }
    };

    const stats = [
        { value: building.floors ? String(building.floors) : '49', label: 'Storeys', sub: 'Tower Residence' },
        { value: building.total_units ? `${building.total_units}` : '657', label: 'Residences', sub: 'Studios to 3BR' },
        { value: startingFromPrice > 0 ? formatMoneyShort(startingFromPrice) : '—', label: 'Starting From', sub: 'Current Listings' },
        { value: '100/100', label: 'Transit Score', sub: 'Transit Connected' },
    ];

    return (
        <section className="relative min-h-screen flex flex-col font-work-sans">
            {/* Building image background + dark luxury overlay */}
            <div className="absolute inset-0">
                <picture>
                    {backgroundImageMobile && (
                        <source media="(max-width: 767px)" srcSet={backgroundImageMobile} />
                    )}
                    <img
                        src={backgroundImage}
                        alt={`${buildingName} building`}
                        fetchPriority="high"
                        className="w-full h-full object-cover"
                    />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80"></div>
            </div>

            {/* Centered hero content */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-6 pt-28 sm:pt-32 pb-6">
                <div className="text-center max-w-4xl">
                    <h1 className="font-playfair text-white text-[38px] sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.05] mb-4 sm:mb-6">
                        {buildingName}
                    </h1>

                    <p className="text-white/80 text-[10px] sm:text-[12px] tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-5 sm:mb-8 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
                        {addressDisplayLine}
                    </p>

                    <p className="text-white/70 text-[15px] sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-12">
                        {subheading}
                    </p>

                    {/* CTA buttons with live counts */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                        <a
                            href={forSaleHref}
                            onClick={(e) => scrollToSection(e, 'for-sale')}
                            className="group relative inline-flex items-center gap-3 w-full sm:w-auto sm:min-w-[240px] justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-neutral-900 text-[12px] sm:text-[13px] tracking-[0.15em] uppercase font-medium rounded-lg overflow-hidden hover:shadow-lg hover:shadow-white/20 transition-all duration-300"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                                    <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                </svg>
                                For Sale — {countsReady ? forSaleCount : '…'}
                            </span>
                        </a>
                        <a
                            href={forRentHref}
                            onClick={(e) => scrollToSection(e, 'for-rent')}
                            className="group relative inline-flex items-center gap-3 w-full sm:w-auto sm:min-w-[240px] justify-center px-6 sm:px-8 py-3.5 sm:py-4 border border-white/40 text-white text-[12px] sm:text-[13px] tracking-[0.15em] uppercase font-medium rounded-lg overflow-hidden backdrop-blur-sm hover:border-gold-400/60 hover:shadow-lg hover:shadow-gold-400/10 transition-all duration-300"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
                                    <path d="m21 2-9.6 9.6" />
                                    <circle cx="7.5" cy="15.5" r="5.5" />
                                </svg>
                                For Rent — {countsReady ? forRentCount : '…'}
                            </span>
                        </a>
                    </div>

                    {/* Live MLS pill */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        <span className="text-white/90 text-[9px] sm:text-[10px] tracking-[0.1em] uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
                            Live MLS® · Updated Every 15 Min
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom stats bar */}
            <div className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
                    {stats.map((s) => (
                        <div key={s.label} className="py-6 md:py-8 text-center">
                            <span className="block font-playfair text-2xl md:text-3xl text-white font-light">{s.value}</span>
                            <span className="block text-[11px] tracking-[0.2em] uppercase text-white/80 mt-1">{s.label}</span>
                            <span className="block text-[10px] text-white/40 mt-0.5">{s.sub}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 animate-bounce">
                <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
        </section>
    );
}
