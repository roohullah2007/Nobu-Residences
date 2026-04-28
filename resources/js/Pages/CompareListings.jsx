import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import ContactAgentModal from '@/Website/Components/ContactAgentModal';
import LoginModal from '@/Website/Global/Components/LoginModal';
import FAQ from '@/Website/Global/Components/FAQ';
import RealEstateLinksSection from '@/Website/Global/Components/RealEstateLinksSection';
import { generatePropertyUrl } from '@/utils/propertyUrl';

const MAX_COMPARE_SLOTS = 3;

const formatPrice = (n) => {
    if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) return null;
    return `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const formatPriceWithDecimals = (n) => {
    if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) return null;
    return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const dash = '—';

export default function CompareListings({
    auth,
    website,
    favourites = []
}) {
    const [showContactModal, setShowContactModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginInitialTab, setLoginInitialTab] = useState('login');
    const [showShareSuccess, setShowShareSuccess] = useState(false);
    const [hydrated, setHydrated] = useState([]);
    const [isHydrating, setIsHydrating] = useState(false);
    const [savedAll, setSavedAll] = useState(false);

    const openLogin = (tab = 'login') => {
        setLoginInitialTab(tab);
        setShowLoginModal(true);
    };

    const csrfToken = useMemo(
        () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        []
    );

    // Read compare keys from localStorage (with one-time seed from favourites
    // for logged-in users so the page is useful on a fresh device).
    const readKeys = useCallback(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('compareListings') || '[]');
            if (Array.isArray(stored) && stored.length > 0) {
                return stored
                    .map((item) => item.listingKey || item.property_listing_key || item?.property_data?.listingKey)
                    .filter(Boolean);
            }
        } catch (_) {}
        // Seed from favourites if available
        if (auth?.user && favourites?.length) {
            const seeded = favourites.slice(0, MAX_COMPARE_SLOTS).map((fav) => ({
                listingKey: fav.listingKey || fav.property_listing_key || fav.property_data?.listingKey,
                property_listing_key: fav.listingKey || fav.property_listing_key || fav.property_data?.listingKey,
                property_data: fav.property_data || {},
            })).filter((it) => it.listingKey);
            if (seeded.length) {
                try {
                    localStorage.setItem('compareListings', JSON.stringify(seeded));
                } catch (_) {}
                return seeded.map((it) => it.listingKey);
            }
        }
        return [];
    }, [auth?.user, favourites]);

    const hydrate = useCallback(async (keys) => {
        if (!keys.length) {
            setHydrated([]);
            return;
        }
        setIsHydrating(true);
        try {
            const res = await fetch('/api/properties/compare-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ keys }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const items = Array.isArray(data?.items) ? data.items : [];
            // Preserve client-side compare order
            const ordered = keys
                .map((k) => items.find((it) => it.listingKey === k))
                .filter(Boolean);
            setHydrated(ordered);
        } catch (error) {
            console.error('Failed to hydrate compare details:', error);
            setHydrated([]);
        } finally {
            setIsHydrating(false);
        }
    }, [csrfToken]);

    // Initial hydration + listen for changes from other components
    useEffect(() => {
        const keys = readKeys();
        hydrate(keys);

        const onChange = () => hydrate(readKeys());
        window.addEventListener('compareListChanged', onChange);
        return () => window.removeEventListener('compareListChanged', onChange);
    }, [hydrate, readKeys]);

    const removeFromCompare = (listingKey) => {
        try {
            const stored = JSON.parse(localStorage.getItem('compareListings') || '[]');
            const updated = stored.filter((it) => (it.listingKey || it.property_listing_key) !== listingKey);
            localStorage.setItem('compareListings', JSON.stringify(updated));
            setHydrated((curr) => curr.filter((it) => it.listingKey !== listingKey));
            window.dispatchEvent(new CustomEvent('compareListChanged'));
        } catch (error) {
            console.error('Error removing from compare:', error);
        }
    };

    const clearAllCompare = () => {
        try {
            localStorage.setItem('compareListings', JSON.stringify([]));
            setHydrated([]);
            window.dispatchEvent(new CustomEvent('compareListChanged'));
        } catch (_) {}
    };

    // Save all visible listings to favourites. The toggle endpoint flips
    // state, so we check first and only add the ones not already saved.
    const saveAllToFavourites = async () => {
        if (!auth?.user) {
            openLogin('login');
            return;
        }
        try {
            await Promise.all(hydrated.map(async (item) => {
                const checkRes = await fetch('/api/favourites/properties/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ property_listing_key: item.listingKey }),
                });
                if (checkRes.ok) {
                    const data = await checkRes.json();
                    if (data?.is_favourited) return; // already saved, skip
                }

                await fetch('/api/favourites/properties/toggle', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        property_listing_key: item.listingKey,
                        property_data: {
                            listingKey: item.listingKey,
                            ListingKey: item.listingKey,
                            address: item.shortAddress,
                            UnparsedAddress: item.shortAddress,
                            City: item.city,
                            ListPrice: item.listPrice,
                            price: item.listPrice,
                            BedroomsTotal: item.bedrooms,
                            BathroomsTotalInteger: item.bathrooms,
                            imageUrl: item.imageUrl,
                            MediaURL: item.imageUrl,
                            PropertyType: item.propertyType,
                            TransactionType: item.transactionType,
                        },
                    }),
                });
            }));
            setSavedAll(true);
            setTimeout(() => setSavedAll(false), 3000);
        } catch (error) {
            console.error('Failed to save all listings:', error);
        }
    };

    // Build a property URL for the address link in each card
    const propertyHref = (item) => {
        try {
            return generatePropertyUrl({
                listingKey: item.listingKey,
                streetNumber: (item.street || '').split(' ')[0],
                streetName: (item.street || '').split(' ').slice(1).join(' '),
                unitNumber: item.unitNumber,
                city: item.city,
            });
        } catch (_) {
            return `/property/${item.listingKey}`;
        }
    };

    // Agent card data
    const agentName = website?.agent_info?.agent_name || website?.contact_info?.agent?.name || '';
    const agentTitle = website?.agent_info?.agent_title || website?.contact_info?.agent?.title || '';
    const agentBrokerage = website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage || '';
    const agentPhone = website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone || '';
    const agentEmail = website?.agent_info?.agent_email || website?.contact_info?.email || '';
    const agentImage = website?.agent_info?.profile_image || website?.contact_info?.agent?.image || '';
    const agentData = { name: agentName, title: agentTitle, brokerage: agentBrokerage, phone: agentPhone, email: agentEmail, image: agentImage };

    const items = hydrated.slice(0, MAX_COMPARE_SLOTS);
    const hasItems = items.length > 0;
    const slots = [...items, ...Array(MAX_COMPARE_SLOTS - items.length).fill(null)];

    const handleShare = async () => {
        const shareData = { title: 'Compare Listings', text: "Check out these listings I'm comparing!", url: window.location.href };
        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                setShowShareSuccess(true);
                setTimeout(() => setShowShareSuccess(false), 3000);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    setShowShareSuccess(true);
                    setTimeout(() => setShowShareSuccess(false), 3000);
                } catch (_) {}
            }
        }
    };

    const handleContactClick = () => {
        if (!auth?.user) openLogin('login');
        else setShowContactModal(true);
    };

    // ----- Row value getters -----
    const propertyRows = [
        { label: 'Instant Estimate', get: (it) => formatPrice(it.listPrice) || dash },
        {
            label: 'Beds & Bath',
            get: (it) => {
                const beds = it.bedrooms ? `${it.bedrooms} Bed` : null;
                const baths = it.bathrooms ? `${it.bathrooms} Bath` : null;
                if (!beds && !baths) return dash;
                return [beds, baths].filter(Boolean).join(' | ');
            },
        },
        {
            label: 'Size',
            get: (it) => {
                if (!auth?.user) return { value: 'Account required', isAction: true, onClick: () => openLogin('login') };
                if (!it.sqft && !it.sqftAvg) return dash;
                if (typeof it.sqft === 'string' && /\D/.test(it.sqft)) return `${it.sqft} sqft`;
                return `${(it.sqftAvg || it.sqft).toLocaleString()} sqft`;
            },
        },
        {
            label: 'Price/sqft',
            get: (it) => (it.pricePerSqft ? `${formatPrice(it.pricePerSqft)}/sqft` : dash),
        },
        {
            label: 'Maintenance Fee',
            get: (it) => (it.maintenanceFee ? formatPriceWithDecimals(it.maintenanceFee) : dash),
        },
        {
            label: 'Days on Market',
            get: (it) => {
                if (!auth?.user) return { value: 'Account required', isAction: true, onClick: () => openLogin('login') };
                return it.daysOnMarket != null ? `${it.daysOnMarket} on site` : dash;
            },
        },
        {
            label: 'Tax',
            get: (it) => {
                if (it.taxAnnualAmount == null) return dash;
                const price = formatPrice(it.taxAnnualAmount);
                return it.taxYear ? `${price}/${it.taxYear}` : price;
            },
        },
        { label: 'Exposure', get: (it) => it.exposureShort || it.exposure || dash },
        {
            label: 'Parking',
            get: (it) => {
                if (it.parking == null) return dash;
                if (it.parking <= 0) return 'No';
                return `Yes | ${it.parking} spot${it.parking === 1 ? '' : 's'}`;
            },
        },
        { label: 'Outdoor Space', get: (it) => (it.hasOutdoorSpace ? 'Yes' : 'No') },
    ];

    const includesRows = [
        { label: 'Locker', get: (it) => (it.hasLocker ? 'Yes' : 'No') },
        { label: 'Furnished', get: (it) => (it.furnished ? (it.isFurnished ? 'Yes' : it.furnished) : dash) },
        {
            label: 'Hydro',
            get: (it) => {
                if (it.hydroIncluded === true) return 'Yes';
                if (it.hydroIncluded === false) return 'No';
                return dash;
            },
        },
    ];

    const buildingRows = [
        {
            label: 'Building Name',
            get: (it) => {
                if (!it.building?.name) return dash;
                const slug = it.building.slug || it.building.id;
                const city = (it.city || 'toronto').toLowerCase().replace(/\s*[cewns]\d{2}\b/gi, '').trim().replace(/\s+/g, '-');
                return { value: it.building.name, href: `/${city}/${slug}`, isLink: true };
            },
        },
        {
            label: 'Building Age',
            get: (it) => {
                const yb = parseInt(String(it.yearBuilt || '').replace(/\D.*$/, ''), 10);
                if (!yb) return dash;
                const age = new Date().getFullYear() - yb;
                return `${age} Years`;
            },
        },
        { label: 'Avg Price/sqft', get: (it) => (it.pricePerSqft ? `${formatPrice(it.pricePerSqft)}/sqft` : dash) },
        { label: 'Last Year Growth', get: () => dash },
        { label: 'Avg Days On Market', get: (it) => (it.daysOnMarket != null ? String(it.daysOnMarket) : dash) },
    ];

    const neighbourhoodRows = [
        {
            label: 'Name',
            get: (it) => {
                if (!it.neighborhood) return dash;
                return {
                    value: it.neighborhood,
                    href: `/search?neighborhood=${encodeURIComponent(it.neighborhood)}`,
                    isLink: true,
                };
            },
        },
        { label: 'Avg Price/sqft', get: () => dash },
        { label: 'Last Year Growth', get: () => dash },
    ];

    const renderCellContent = (val) => {
        if (val == null) return <span className="text-gray-400">{dash}</span>;
        if (typeof val === 'object') {
            if (val.isLink) {
                return (
                    <a href={val.href} className="text-[#037888] underline truncate" title={val.value}>
                        {val.value}
                    </a>
                );
            }
            if (val.isAction) {
                return (
                    <button
                        type="button"
                        onClick={val.onClick}
                        className="text-[#037888] underline"
                    >
                        {val.value}
                    </button>
                );
            }
            return String(val.value ?? dash);
        }
        return String(val);
    };

    const ComparisonGrid = ({ rows, sectionTitle }) => (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 mb-4">
            {sectionTitle && (
                <h2 className="font-space-grotesk font-bold text-[#293056] text-xl sm:text-2xl mb-4 sm:mb-6">
                    {sectionTitle}
                </h2>
            )}
            <div className="divide-y divide-dashed divide-gray-200">
                {rows.map((row) => (
                    <div key={row.label} className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-2 lg:gap-4 py-3 items-center">
                        <div className="font-work-sans text-[#293056] text-sm lg:text-base">{row.label}</div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {slots.map((it, idx) => (
                                <div
                                    key={idx}
                                    className="min-h-[36px] sm:min-h-[40px] flex items-center justify-center bg-[#E8EBF5] rounded-lg font-work-sans text-[#293056] text-xs sm:text-sm px-2 truncate"
                                >
                                    {it ? renderCellContent(row.get(it)) : <span className="text-gray-400">{dash}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <MainLayout auth={auth} website={website}>
            <Head title="Compare Listings" />

            {/* Header bar */}
            <div className="w-full h-[85px] md:h-[120px] relative flex items-center" style={{ backgroundColor: '#292E56' }} />

            <div className="min-h-screen bg-white">
                <div className="max-w-[1280px] mx-auto px-4 py-6 sm:py-12">
                    {/* Header section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
                        <div>
                            <h1 className="font-space-grotesk font-bold text-[#293056] mb-2 text-[28px] sm:text-[36px] md:text-[40px]">
                                Compare Listings
                            </h1>
                            {hasItems ? (
                                <button
                                    type="button"
                                    onClick={saveAllToFavourites}
                                    className="font-work-sans text-base sm:text-lg text-[#293056] inline-flex items-center gap-2 group"
                                >
                                    <svg className={`w-5 h-5 ${savedAll ? 'text-red-500 fill-red-500' : 'text-[#037888]'}`} fill={savedAll ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                                    </svg>
                                    <span className="text-[#037888] underline">{savedAll ? 'Saved!' : 'Save all listings'}</span>
                                    <span className="text-gray-600">to your favourites to compare later.</span>
                                </button>
                            ) : (
                                <p className="font-work-sans text-gray-600 text-base sm:text-lg">
                                    Add properties to compare by clicking the compare button on any property card.
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                            {hasItems && (
                                <button
                                    onClick={clearAllCompare}
                                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 border border-red-300 rounded-full font-work-sans font-medium text-red-600 hover:bg-red-50 transition-colors text-sm sm:text-base"
                                >
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={handleShare}
                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-full font-work-sans font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base inline-flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4-4 4M12 4v12" />
                                </svg>
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Top: agent card + property thumbnails */}
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start mb-6">
                        {/* Agent card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 flex-shrink-0 shadow-sm w-full lg:w-[300px]">
                            <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-4 border-gray-100 lg:mb-4 flex-shrink-0">
                                    {agentImage ? (
                                        <img src={agentImage} alt={agentName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-500">
                                                {agentName ? agentName.charAt(0) : '?'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 lg:flex-none lg:text-center">
                                    {agentTitle && (
                                        <p className="font-work-sans text-gray-500 text-xs sm:text-sm lg:text-center">{agentTitle}</p>
                                    )}
                                    {agentName && (
                                        <h3 className="font-work-sans font-bold text-[#101323] text-base sm:text-lg lg:text-center mt-1">{agentName}</h3>
                                    )}
                                    {agentPhone && (
                                        <a href={`tel:${agentPhone}`} className="block font-work-sans text-[#037888] underline text-sm mt-2 lg:text-center">
                                            {agentPhone}
                                        </a>
                                    )}
                                </div>
                                <button
                                    onClick={handleContactClick}
                                    className="hidden sm:block lg:w-full mt-0 lg:mt-6 py-2 sm:py-3 px-4 sm:px-6 bg-[#037888] text-white font-work-sans font-semibold text-sm sm:text-base rounded-full hover:bg-[#037888]/90 transition-colors"
                                >
                                    Contact
                                </button>
                            </div>
                            <button
                                onClick={handleContactClick}
                                className="sm:hidden w-full mt-4 py-2.5 px-4 bg-[#037888] text-white font-work-sans font-semibold text-sm rounded-full hover:bg-[#037888]/90 transition-colors"
                            >
                                Contact
                            </button>
                        </div>

                        {/* Property thumbnail row (3 slots, empty placeholders for missing) */}
                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {slots.map((it, idx) => (
                                <div key={idx} className="relative">
                                    {it ? (
                                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => removeFromCompare(it.listingKey)}
                                                className="absolute top-2 right-2 z-10 w-7 h-7 bg-white hover:bg-gray-50 text-gray-700 rounded-full flex items-center justify-center shadow-md border border-gray-200"
                                                title="Remove from compare"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <a href={propertyHref(it)} className="block relative">
                                                {/* Featured badge */}
                                                <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-[#293056] text-white text-xs font-semibold px-2 py-1 rounded">
                                                    <svg className="w-3 h-3 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 .587l3.668 7.568L24 9.75l-6 5.847L19.336 24 12 19.897 4.664 24 6 15.597 0 9.75l8.332-1.595z" />
                                                    </svg>
                                                    Featured
                                                </span>
                                                {it.imageUrl ? (
                                                    <img src={it.imageUrl} alt={it.shortAddress} className="w-full h-[160px] object-cover" />
                                                ) : (
                                                    <div className="w-full h-[160px] bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No image</div>
                                                )}
                                            </a>
                                            <div className="p-3">
                                                <div className="font-work-sans font-bold text-[#293056] text-base">
                                                    {formatPrice(it.listPrice) || dash}
                                                </div>
                                                <a href={propertyHref(it)} className="block font-work-sans text-[#037888] underline text-sm mt-1 truncate">
                                                    {it.shortAddress || it.listingKey}
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <a
                                            href="/search"
                                            className="flex flex-col items-center justify-center h-[260px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                                        >
                                            <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="text-sm font-medium">Add a property</span>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Loading state */}
                    {isHydrating && hasItems === false && (
                        <div className="text-center text-gray-500 py-8">Loading comparison details…</div>
                    )}

                    {/* Empty state */}
                    {!isHydrating && !hasItems && (
                        <div className="flex flex-col items-center justify-center h-[250px] sm:h-[352px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 px-4">
                            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="font-work-sans font-semibold text-gray-700 text-base sm:text-lg mb-2 text-center">
                                No properties to compare
                            </h3>
                            <p className="font-work-sans text-gray-500 text-center text-sm sm:text-base max-w-sm">
                                Add properties to compare by clicking the compare button on any property card.
                            </p>
                            <a
                                href="/search"
                                className="mt-4 px-5 sm:px-6 py-2 bg-[#293056] text-white font-work-sans font-medium text-sm sm:text-base rounded-full hover:bg-[#293056]/90 transition-colors"
                            >
                                Browse Properties
                            </a>
                        </div>
                    )}

                    {/* Comparison sections */}
                    {hasItems && (
                        <>
                            <ComparisonGrid sectionTitle="Properties detail" rows={propertyRows} />
                            <ComparisonGrid sectionTitle="Includes" rows={includesRows} />
                            <ComparisonGrid sectionTitle="Building" rows={buildingRows} />
                            <ComparisonGrid sectionTitle="Neighbourhood" rows={neighbourhoodRows} />

                            {/* See what's around CTA */}
                            <div className="flex justify-center mb-8">
                                <a
                                    href="/search"
                                    className="px-5 py-2 border border-gray-300 rounded-full font-work-sans text-[#293056] hover:bg-gray-50 transition-colors text-sm"
                                >
                                    See what's around
                                </a>
                            </div>
                        </>
                    )}

                    {/* FAQ */}
                    <div className="mt-8 sm:mt-12 -mx-4 sm:mx-0">
                        <FAQ
                            title="Frequently Asked Questions"
                            faqItems={[
                                { id: 1, question: 'How do I add listings to compare?', answer: 'Click the "Compare" badge on any property card. Up to 3 properties can be compared side by side.' },
                                { id: 2, question: 'How many properties can I compare at once?', answer: 'You can compare up to 3 properties side by side.' },
                                { id: 3, question: 'What information is shown in the comparison?', answer: 'Property details (price, beds, baths, area, parking, fees, taxes, exposure), what is included (locker, furnished, hydro), building details (age, amenities), and neighbourhood.' },
                                { id: 4, question: 'Can I share my comparison with others?', answer: 'Yes — click "Share" at the top of the page to copy the link.' },
                            ]}
                            showContainer={false}
                            className="max-w-full"
                        />
                    </div>

                    <div className="mt-8 sm:mt-12 -mx-4 sm:mx-0">
                        <RealEstateLinksSection />
                    </div>
                </div>
            </div>

            <ContactAgentModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                agentData={agentData}
                propertyData={{ BuildingName: 'Compare Listings', address: 'Multiple Properties' }}
                auth={auth}
                websiteSettings={{ website }}
            />

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                website={website}
                initialTab={loginInitialTab}
            />

            {showShareSuccess && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000000] animate-fade-in">
                    <div className="bg-[#293056] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-work-sans font-medium text-sm">Link copied to clipboard!</span>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
