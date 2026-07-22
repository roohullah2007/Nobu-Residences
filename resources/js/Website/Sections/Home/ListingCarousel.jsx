import { Link } from '@inertiajs/react';
import { useRef, useEffect, useState } from 'react';
import { formatMoney, formatMaint } from '@/Website/Sections/Home/iceData';
import { LoginModal } from '@/Website/Global/Components';

const CARD_GAP = 16; // matches gap-4 (1rem)

function LockIcon({ className = '' }) {
    return (
        <svg
            className={className}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function SparklesIcon({ className = '' }) {
    return (
        <svg
            className={className}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
            <path d="M4 17v2" />
            <path d="M5 18H3" />
        </svg>
    );
}

function bedroomLabelFor(listing) {
    if (!listing.bedrooms || listing.bedrooms <= 0) return 'Studio';
    return `${listing.bedrooms} BD${listing.den ? ' + Den' : ''}`;
}

function RealListingCard({ listing }) {
    const isRental = !!listing.isRental;
    const price = formatMoney(listing.price);
    const maint = !isRental ? formatMaint(listing.maintenance) : '';

    return (
        <Link
            href={listing.url}
            data-card
            className="flex-shrink-0 w-[320px] sm:w-[360px] md:w-[380px] snap-start group"
        >
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-200">
                <img
                    src={listing.imageUrl}
                    alt={listing.addressLine}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = '/images/no-image-placeholder.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {listing.buildingName && (
                    <span className="absolute top-3 right-3 px-3 py-1.5 bg-black/40 backdrop-blur-sm text-white text-[10px] tracking-[0.1em] uppercase font-medium rounded-md">
                        {listing.buildingName}
                    </span>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-white/80 text-[13px] mb-1.5 line-clamp-1">
                        {listing.addressLine}, {listing.city}
                    </p>
                    <p className="text-white text-2xl font-bold mb-2">
                        {price}
                        {isRental && <span className="text-base font-normal text-white/60">/MO</span>}
                    </p>
                    <div className="flex items-center gap-1.5 text-white/70 text-[12px] font-medium tracking-wide uppercase mb-3">
                        <span>{bedroomLabelFor(listing)}</span>
                        <span className="text-white/30">|</span>
                        <span>{listing.bathrooms} BA</span>
                        {listing.sqft && (
                            <>
                                <span className="text-white/30">|</span>
                                <span>{listing.sqft}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[11px] text-white/70 font-medium">
                            {!isRental && maint && <span>Maint: {maint}</span>}
                            {listing.daysOnMarket != null && <span>{listing.daysOnMarket}d on market</span>}
                        </div>
                        <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details
                        </span>
                    </div>
                    {/* Listing brokerage intentionally not shown (client request) */}
                </div>
            </div>
        </Link>
    );
}

function LockedCard({ building, isRental, onRegister }) {
    const image = building?.main_image || '/assets/nobu-building.jpg';
    const buildingName = building?.name || 'Nobu Residences';

    return (
        <div data-card className="flex-shrink-0 w-[320px] sm:w-[360px] md:w-[380px] snap-start">
            <div
                onClick={onRegister}
                className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-200 cursor-pointer group"
            >
                <img
                    src={image}
                    alt="Off-market listing"
                    className="w-full h-full object-cover blur-lg scale-110 brightness-50"
                />
                <div className="absolute top-0 right-0 z-10">
                    <div className="bg-gold-500 text-white px-4 py-2 text-[10px] tracking-[0.15em] uppercase font-bold rounded-bl-xl rounded-tr-xl flex items-center gap-1.5 shadow-lg">
                        <LockIcon />
                        Off-Market
                    </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <LockIcon className="text-white/80" />
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-1">Off-Market Listing</h3>
                    <p className="text-white/50 text-[13px] mb-4">Register to view exclusive details</p>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onRegister?.(); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-white text-[11px] tracking-[0.15em] uppercase font-bold rounded-lg transition-colors shadow-lg shadow-gold-500/20"
                    >
                        <SparklesIcon />
                        Register to View
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <p className="text-white/40 text-[13px] mb-1.5">
                        Exclusive {isRental ? 'Rental' : 'Sale'} · {buildingName}
                    </p>
                    <p className="text-white/50 text-xl font-bold mb-2 blur-[3px]">$•••,•••</p>
                    <div className="flex items-center gap-1.5 text-white/30 text-[12px] font-medium tracking-wide uppercase">
                        <span>1 BD + Den</span>
                        <span className="text-white/15">|</span>
                        <span>1 BA</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ListingCarousel({
    id,
    eyebrow,
    title,
    listings = [],
    viewMoreHref = '/search',
    auth,
    building,
    website,
}) {
    const scrollerRef = useRef(null);
    const pausedRef = useRef(false);
    const [registerOpen, setRegisterOpen] = useState(false);

    const isLoggedIn = !!auth?.user;
    const isRentalSection = (title || '').includes('Rent');

    // Build the rendered sequence: for logged-out users, splice a locked card
    // after every 4 real cards (positions 5, 10, ...).
    const items = [];
    listings.forEach((listing, i) => {
        items.push({ type: 'real', listing, key: listing.listingKey || `real-${i}` });
        if (!isLoggedIn && (i + 1) % 4 === 0) {
            items.push({ type: 'locked', key: `locked-${i}` });
        }
    });

    const scrollByCard = (dir) => {
        const el = scrollerRef.current;
        if (!el) return;
        const firstCard = el.querySelector('[data-card]');
        const step = firstCard ? firstCard.offsetWidth + CARD_GAP : el.clientWidth * 0.8;
        el.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    const handleArrow = (dir) => {
        pausedRef.current = true; // pause auto-advance on manual interaction
        scrollByCard(dir);
    };

    // Auto-slide: advance one card every 4s, loop back at the end.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const el = scrollerRef.current;
        if (!el) return;

        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) return;

        const interval = setInterval(() => {
            const node = scrollerRef.current;
            if (!node || pausedRef.current) return;

            // Nothing to scroll (single screen of cards).
            if (node.scrollWidth <= node.clientWidth + 8) return;

            const firstCard = node.querySelector('[data-card]');
            const step = firstCard ? firstCard.offsetWidth + CARD_GAP : node.clientWidth * 0.8;

            if (node.scrollLeft + node.clientWidth >= node.scrollWidth - 8) {
                node.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                node.scrollBy({ left: step, behavior: 'smooth' });
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [items.length]);

    if (!listings.length) return null;

    const subtitle = `${listings.length} units available · Live MLS® data`;

    return (
        <section id={id} className="py-14 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-0">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        {eyebrow && (
                            <p className="font-work-sans text-xs uppercase tracking-[0.3em] text-gold-500 mb-2">
                                {eyebrow}
                            </p>
                        )}
                        <h2 className="font-playfair text-3xl md:text-4xl text-neutral-900">{title}</h2>
                        <p className="text-neutral-400 text-sm mt-1">{subtitle}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => handleArrow(-1)}
                            aria-label="Scroll left"
                            className="w-11 h-11 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-neutral-500 hover:text-neutral-800 transition-colors"
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleArrow(1)}
                            aria-label="Scroll right"
                            className="w-11 h-11 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-neutral-500 hover:text-neutral-800 transition-colors"
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div
                ref={scrollerRef}
                className="carousel-scroll scrollbar-hide flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-10 pb-4 snap-x snap-mandatory"
                style={{ scrollPaddingLeft: '1rem' }}
                onMouseEnter={() => { pausedRef.current = true; }}
                onMouseLeave={() => { pausedRef.current = false; }}
                onFocusCapture={() => { pausedRef.current = true; }}
                onBlurCapture={() => { pausedRef.current = false; }}
            >
                {items.map((item) => (
                    item.type === 'real' ? (
                        <RealListingCard key={item.key} listing={item.listing} />
                    ) : (
                        <LockedCard key={item.key} building={building} isRental={isRentalSection} onRegister={() => setRegisterOpen(true)} />
                    )
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-0 mt-6 text-right">
                <Link
                    href={viewMoreHref}
                    className="inline-flex items-center gap-2 text-[14px] text-neutral-600 hover:text-neutral-900 font-medium"
                >
                    View More Properties
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>

            {/* Auth gate for off-market cards — opens the shared register/login
                modal (Register tab first), same modal used by the navbar. */}
            <LoginModal
                isOpen={registerOpen}
                onClose={() => setRegisterOpen(false)}
                website={website}
                initialTab="register"
            />
        </section>
    );
}
