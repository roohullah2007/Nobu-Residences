import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { LoginModal } from '@/Website/Global/Components';
import Dropdown from '@/Components/Dropdown';
import { Heart } from '@/Website/Components/Icons';

export default function Navbar({ auth = {}, website = {}, simplified = false, onDarkBg = false }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    // Lock body scroll while the mobile menu is open so the page underneath
    // doesn't move when the user scrolls the menu.
    useEffect(() => {
        if (!mobileMenuOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobileMenuOpen]);

    // Get globalWebsite from page props for reliable access to website data
    const { globalWebsite, isMainDomain } = usePage().props;
    const effectiveWebsite = website?.id ? website : globalWebsite;

    // The ?website={slug} preview override is only honored on the admin/main
    // host (TenantResolver ignores it on tenant domains, which resolve by
    // domain), so links carry it only there. On a site's own domain every
    // URL stays clean, and any stored website param (e.g. header links saved
    // while previewing) is stripped.
    const buildUrl = (path) => {
        let cleanPath = path;
        if (path.includes('?website=') || path.includes('&website=')) {
            cleanPath = path.replace(/[?&]website=[^&]*/g, '').replace(/\?&/, '?').replace(/\?$/, '');
        }
        if (isMainDomain && effectiveWebsite?.slug) {
            const separator = cleanPath.includes('?') ? '&' : '?';
            return `${cleanPath}${separator}website=${effectiveWebsite.slug}`;
        }
        return cleanPath;
    };

    // Default navigation links. Rent/Sale point at the site's own building
    // city (a Pickering site must not send visitors to /toronto/for-sale);
    // Toronto stays the fallback for sites without a linked building.
    const citySlug = (effectiveWebsite?.building_city || 'Toronto')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-');
    const defaultNavLinks = [
        { id: 1, text: 'Home', url: '/', enabled: true },
        { id: 2, text: 'Rent', url: `/${citySlug}/for-rent`, enabled: true },
        { id: 3, text: 'Sale', url: `/${citySlug}/for-sale`, enabled: true },
        { id: 4, text: 'Search All', url: '/search', enabled: true },
        { id: 5, text: 'Blog', url: '/blogs', enabled: true },
        { id: 6, text: 'Developers', url: '/developers', enabled: true },
        { id: 7, text: 'Compare', url: '/compare-listings', enabled: true },
        { id: 8, text: 'Contact Us', url: '/contact', enabled: true }
    ];

    // Get navigation links from website settings or use defaults
    const getNavLinks = () => {
        const headerLinks = effectiveWebsite?.header_links;
        let links = defaultNavLinks;

        if (headerLinks?.enabled !== false && headerLinks?.links?.length > 0) {
            // Filter to only enabled links
            links = headerLinks.links.filter(link => link.enabled !== false);
        }

        // Always ensure Developers link is included
        const hasDevelopersLink = links.some(link =>
            link.url === '/developers' || link.text?.toLowerCase() === 'developers'
        );

        if (!hasDevelopersLink) {
            // Find Contact Us position to insert before it
            const contactIndex = links.findIndex(link =>
                link.text?.toLowerCase() === 'contact us' || link.url === '/contact'
            );

            const developersLink = { id: 'developers', text: 'Developers', url: '/developers', enabled: true };

            if (contactIndex !== -1) {
                // Insert before Contact Us
                links = [
                    ...links.slice(0, contactIndex),
                    developersLink,
                    ...links.slice(contactIndex)
                ];
            } else {
                // Add at the end
                links = [...links, developersLink];
            }
        }

        // Always ensure Compare link is included
        const hasCompareLink = links.some(link =>
            link.url === '/compare-listings' || link.text?.toLowerCase() === 'compare'
        );

        if (!hasCompareLink) {
            // Find Contact Us position to insert before it
            const contactIndex = links.findIndex(link =>
                link.text?.toLowerCase() === 'contact us' || link.url === '/contact'
            );

            const compareLink = { id: 'compare', text: 'Compare', url: '/compare-listings', enabled: true };

            if (contactIndex !== -1) {
                // Insert before Contact Us
                links = [
                    ...links.slice(0, contactIndex),
                    compareLink,
                    ...links.slice(contactIndex)
                ];
            } else {
                // Add at the end
                links = [...links, compareLink];
            }
        }

        // Building-linked sites: Rent/Sale go to THIS building's available
        // listings (per client), not the generic city pages. Saved header
        // links still carry '/toronto/for-rent'-style defaults, so the
        // rewrite happens here instead of in every stored page.
        const buildingId = globalWebsite?.building_id;
        if (buildingId) {
            const buildingSearchUrl = (status) => {
                const params = new URLSearchParams();
                params.set('status', status);
                params.set('building_id', String(buildingId));
                if (globalWebsite?.building_name) params.set('query', globalWebsite.building_name);
                return `/search?${params.toString()}`;
            };
            links = links.map((link) => {
                if (/^\/[a-z-]+\/for-rent$/.test(link.url || '')) {
                    return { ...link, url: buildingSearchUrl('For Rent') };
                }
                if (/^\/[a-z-]+\/for-sale$/.test(link.url || '')) {
                    return { ...link, url: buildingSearchUrl('For Sale') };
                }
                return link;
            });
        }

        return links;
    };

    const navLinks = getNavLinks();

    // Helper to get the correct URL - ALWAYS apply buildUrl to ensure website slug is added
    // This handles both default links and custom header_links from database
    const getNavUrl = (link) => {
        return buildUrl(link.url);
    };

    const brandColors = website?.brand_colors || {
        primary: '#912018',
        secondary: '#1d957d',
        accent: '#F5F8FF',
        text: '#000000',
        background: '#FFFFFF',
        button_primary_bg: '#912018',
        button_primary_text: '#FFFFFF'
    };

    // Get button colors for avatar fallback
    const buttonPrimaryBg = brandColors.button_primary_bg || brandColors.primary;
    const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';

    // Close mobile menu when screen size changes to desktop (lg breakpoint —
    // the desktop link row only fits from 1024px up, so tablets keep the
    // hamburger).
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    // When the Navbar is rendered inside a coloured band (MainLayout's
    // blueHeader wrapper), drop the inner white "pill" so the header reads
    // as one continuous bar, and flip link text to white. Otherwise keep
    // the existing white pill + dark text used on the homepage.
    // On the dark band the mobile logo is centered in the header (absolute,
    // so the hamburger stays pinned right); the white-pill variant keeps the
    // original left logo / right burger layout.
    const mobileContainerClass = onDarkBg
        ? 'relative flex lg:hidden justify-end items-center w-full'
        : 'flex lg:hidden justify-between items-center px-4 py-3 bg-white rounded-xl w-full';
    const mobileLogoLinkClass = onDarkBg
        ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center cursor-pointer'
        : 'flex items-center cursor-pointer';
    const linkTextClass = onDarkBg ? 'text-white' : 'text-gray-900';
    const logoFallbackTextClass = onDarkBg ? 'text-white' : 'text-gray-900';
    const mobileBurgerClass = onDarkBg
        ? 'rounded-lg p-2 hover:opacity-80 transition-colors bg-transparent text-white'
        : 'rounded-lg p-2 hover:opacity-80 transition-colors bg-white text-gray-900';

    // In onDarkBg mode the wrapping MainLayout band already provides the
    // sticky positioning, fixed height and background colour — the
    // Navbar just sits inside it as in-flow content, constrained to a
    // 1280px max-width container centred with no horizontal padding so
    // the logo + nav links sit flush against the container edge.
    // Outside that mode keep the original absolute layered header used
    // on the homepage.
    const headerClass = onDarkBg
        ? 'w-full h-full flex items-center justify-center z-20'
        : 'absolute top-0 left-0 right-0 w-full h-[85px] lg:h-auto flex items-center justify-center z-20';
    // Horizontal padding drops at lg (not md): the compact hamburger row is
    // shown through tablet widths and needs the gutter so the logo/pill
    // doesn't sit flush against the screen edge.
    const innerWrapperClass = onDarkBg
        ? 'mx-auto px-4 sm:px-6 lg:px-0 w-full max-w-[1280px] h-full flex items-center'
        : 'mx-auto px-3 w-full max-w-[1280px] sm:px-6 lg:px-0 flex items-center justify-center py-0 lg:py-8';

    return (
        <header className={headerClass}>
            <div className={innerWrapperClass}>
                {/* Mobile Navbar */}
                <div className={mobileContainerClass}>
                    {/* Logo */}
                    <Link href={buildUrl("/")} className={mobileLogoLinkClass}>
                        {effectiveWebsite?.logo_url ? (
                            <img
                                src={effectiveWebsite.logo_url}
                                alt={effectiveWebsite?.name || 'Site Logo'}
                                className={onDarkBg ? 'object-contain w-[160px] h-[55px]' : 'object-contain w-[140px] h-[35px] md:w-[200px] md:h-[50px]'}
                            />
                        ) : (
                            <div className={`font-space-grotesk font-bold text-base tracking-tight leading-tight ${logoFallbackTextClass}`}>
                                {effectiveWebsite?.name || 'X HOUSES'}
                            </div>
                        )}
                    </Link>

                    {/* Mobile menu button */}
                    <div className="lg:hidden">
                        <button
                            className={mobileBurgerClass}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? (
                                // Close icon
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            ) : (
                                // Hamburger icon
                                <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0 2.66667V0H24V2.66667H0ZM0 9.33333H24V6.66667H0V9.33333ZM0 16H24V13.3333H0V16Z" fill="currentColor"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Desktop Navbar — lg and up only. The full link row (8 links
                    + Log In) needs ~1050px next to the 220px logo, so md
                    widths (768–1024) keep the hamburger; between lg and xl the
                    row uses tighter gaps and text-sm so it fits on one line. */}
                <div className={`hidden lg:flex items-center justify-between w-full ${onDarkBg ? 'h-full' : 'px-6 h-16 bg-white rounded-xl'}`}>
                    {/* Logo and Brand */}
                    <Link href={buildUrl("/")} className="flex items-center cursor-pointer">
                        {effectiveWebsite?.logo_url ? (
                            <img
                                src={effectiveWebsite.logo_url}
                                alt={effectiveWebsite?.name || 'Site Logo'}
                                style={onDarkBg
                                    ? { width: '220px', height: '60px', maxWidth: '220px' }
                                    : { width: '200px', height: '50px', maxWidth: '200px' }
                                }
                                className={onDarkBg ? 'object-contain object-left' : 'object-contain'}
                            />
                        ) : (
                            <div className={`font-space-grotesk font-bold text-[32px] leading-[36px] tracking-[-0.011em] ${logoFallbackTextClass}`}>
                                {effectiveWebsite?.name || 'X HOUSES'}
                            </div>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.id}
                                href={getNavUrl(link)}
                                className={`hover:opacity-70 transition-colors font-work-sans whitespace-nowrap text-sm xl:text-base font-medium ${linkTextClass}`}
                            >
                                {link.text}
                            </Link>
                        ))}
                        {simplified ? (
                            <button
                                onClick={() => setLoginModalOpen(true)}
                                className={`px-4 py-2 rounded-lg transition-colors font-work-sans hover:opacity-80 whitespace-nowrap text-sm xl:text-base font-medium ${linkTextClass}`}
                            >
                                Log In
                            </button>
                        ) : auth?.user ? (
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-work-sans hover:opacity-80">
                                        {auth.user.avatar ? (
                                            <img
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-8 h-8 text-white rounded-full flex items-center justify-center font-bold text-sm"
                                                style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
                                            >
                                                {auth.user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <span className={`whitespace-nowrap text-sm xl:text-base font-medium ${linkTextClass}`}>
                                            {auth.user.name || 'User'}
                                        </span>
                                        <svg className={`w-4 h-4 ${linkTextClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="right" width="56" contentClasses="py-1 bg-white">
                                    <Dropdown.Link href={buildUrl("/user/dashboard")}>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            Dashboard
                                        </div>
                                    </Dropdown.Link>
                                    <Dropdown.Link href={buildUrl("/user/favourites")}>
                                        <div className="flex items-center gap-3">
                                            <Heart className="w-4 h-4 text-red-500" filled={true} />
                                            My Favourites
                                        </div>
                                    </Dropdown.Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <Dropdown.Link href={buildUrl("/profile")}>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Profile Settings
                                        </div>
                                    </Dropdown.Link>
                                    <Dropdown.Link href={buildUrl("/logout")} method="post" as="button">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Log Out
                                        </div>
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        ) : (
                            <button
                                onClick={() => setLoginModalOpen(true)}
                                className={`px-4 py-2 rounded-lg transition-colors font-work-sans hover:opacity-80 whitespace-nowrap text-sm xl:text-base font-medium ${linkTextClass}`}
                            >
                                Log In
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* Mobile Navigation Menu Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[200]">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    
                    {/* Menu Container — centered vertically on mobile so the
                        full sheet (including the Log In footer) sits inside
                        the viewport regardless of viewport height. */}
                    <div className="relative h-full flex items-center justify-center p-4">
                        {/* Navigation Menu — max-w-md keeps the sheet a neat
                            centered card at tablet widths (the hamburger now
                            shows up to lg) without changing phones. */}
                        <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {/* Menu Header */}
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0">
                                <h3 className="font-space-grotesk font-semibold text-gray-900 text-lg">
                                    Navigation
                                </h3>
                                {/* Close Button */}
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                    aria-label="Close menu"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Menu Items (scroll internally so the footer
                                action button always stays in view). */}
                            <div className="py-2 flex-1 overflow-y-auto overscroll-contain">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.id}
                                        href={getNavUrl(link)}
                                        className="block px-6 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors font-work-sans border-b border-gray-50 last:border-b-0"
                                        style={{ fontSize: '16px', fontWeight: '500' }}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.text}
                                    </Link>
                                ))}
                            </div>
                            
                            {/* Action Button */}
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                                {auth?.user ? (
                                    <div className="space-y-3">
                                        {/* User Profile Section */}
                                        <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                                            {auth.user.avatar ? (
                                                <img
                                                    src={auth.user.avatar}
                                                    alt={auth.user.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                                                    style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
                                                >
                                                    {auth.user.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-work-sans font-semibold text-gray-900">
                                                    {auth.user.name || 'User'}
                                                </div>
                                                <div className="font-work-sans text-sm text-gray-500">
                                                    {auth.user.email}
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={buildUrl("/user/dashboard")}
                                            className="block w-full px-4 py-3 rounded-lg hover:opacity-90 transition-colors font-work-sans text-center"
                                            style={{ fontSize: '16px', fontWeight: '600', backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href={buildUrl("/user/favourites")}
                                            className="flex items-center justify-center gap-2 w-full border border-red-500 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors font-work-sans"
                                            style={{ fontSize: '16px', fontWeight: '600' }}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Heart className="w-4 h-4" filled={true} />
                                            My Favourites
                                        </Link>
                                        <Link
                                            href={buildUrl("/profile")}
                                            className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-work-sans"
                                            style={{ fontSize: '16px', fontWeight: '600' }}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Profile Settings
                                        </Link>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            setLoginModalOpen(true);
                                        }}
                                        className="block w-full px-4 py-3 rounded-lg hover:opacity-90 transition-colors font-work-sans text-center"
                                        style={{ fontSize: '16px', fontWeight: '600', backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
                                    >
                                        Log In
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Login Modal */}
            <LoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                website={website}
            />
        </header>
    );
}