import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { LoginModal } from '@/Website/Global/Components';
import Dropdown from '@/Components/Dropdown';
import { Heart } from '@/Website/Components/Icons';

export default function Navbar({ auth = {}, website = {}, simplified = false }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    // Get globalWebsite from page props for reliable access to website data
    const { globalWebsite } = usePage().props;
    const effectiveWebsite = website?.id ? website : globalWebsite;

    // Helper function to build URLs with website parameter preserved
    // Uses website slug from props - if it's not the default website, append the param
    const buildUrl = (path) => {
        // Check if website slug is available and not the default (ID 1)
        // The default website doesn't need the query param
        if (effectiveWebsite?.slug && effectiveWebsite?.id !== 1) {
            // Remove any existing website parameter first to avoid duplicates
            let cleanPath = path;
            if (path.includes('?website=') || path.includes('&website=')) {
                cleanPath = path.replace(/[?&]website=[^&]*/g, '').replace(/\?&/, '?').replace(/\?$/, '');
            }
            const separator = cleanPath.includes('?') ? '&' : '?';
            return `${cleanPath}${separator}website=${effectiveWebsite.slug}`;
        }
        return path;
    };

    // Default navigation links
    const defaultNavLinks = [
        { id: 1, text: 'Home', url: '/', enabled: true },
        { id: 2, text: 'Rent', url: '/toronto/for-rent', enabled: true },
        { id: 3, text: 'Sale', url: '/toronto/for-sale', enabled: true },
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

    // Close mobile menu when screen size changes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
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

    return (
        <header className="absolute top-0 left-0 right-0 w-full h-[85px] md:h-auto flex items-center justify-center z-20">
            <div className="mx-auto px-3 py-0 md:py-8 w-full max-w-[1280px] sm:px-6 md:px-0 flex items-center justify-center">
                {/* Mobile Navbar */}
                <div className="flex md:hidden justify-between items-center px-4 py-3 bg-white rounded-xl w-full">
                    {/* Logo */}
                    <Link href={buildUrl("/")} className="flex items-center cursor-pointer">
                        {website?.logo_url ? (
                            <img
                                src={website.logo_url}
                                alt={website?.name || 'Site Logo'}
                                className="object-contain w-[140px] h-[35px] md:w-[200px] md:h-[50px]"
                            />
                        ) : (
                            <div className="font-space-grotesk font-bold text-sm text-gray-900">
                                {website?.name || 'X HOUSES'}
                            </div>
                        )}
                    </Link>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            className="rounded-lg p-2 hover:opacity-80 transition-colors bg-white text-gray-900"
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
                
                {/* Desktop Navbar */}
                <div className="hidden md:flex w-full h-16 bg-white rounded-xl items-center justify-between px-6">
                    {/* Logo and Brand */}
                    <Link href={buildUrl("/")} className="flex items-center cursor-pointer">
                        {website?.logo_url ? (
                            <img
                                src={website.logo_url}
                                alt={website?.name || 'Site Logo'}
                                style={{
                                    width: '200px',
                                    height: '50px',
                                    maxWidth: '200px'
                                }}
                                className="object-contain"
                            />
                        ) : (
                            <div className="font-space-grotesk font-bold text-[32px] leading-[36px] tracking-[-0.011em] text-gray-900">
                                {website?.name || 'X HOUSES'}
                            </div>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.id}
                                href={getNavUrl(link)}
                                className="hover:opacity-70 transition-colors font-work-sans text-base font-medium text-gray-900"
                            >
                                {link.text}
                            </Link>
                        ))}
                        {simplified ? (
                            <button
                                onClick={() => setLoginModalOpen(true)}
                                className="px-4 py-2 rounded-lg transition-colors font-work-sans hover:opacity-80 text-base font-medium text-gray-900"
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
                                        <span className="text-base font-medium text-gray-900">
                                            {auth.user.name || 'User'}
                                        </span>
                                        <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="right" width="56">
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
                                className="px-4 py-2 rounded-lg transition-colors font-work-sans hover:opacity-80 text-base font-medium text-gray-900"
                            >
                                Log In
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* Mobile Navigation Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[200]">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    
                    {/* Menu Container */}
                    <div className="relative h-full flex flex-col">
                        {/* Top spacing to account for navbar */}
                        <div className="h-20" />
                        
                        {/* Navigation Menu */}
                        <div className="mx-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                            {/* Menu Header */}
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
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
                            
                            {/* Menu Items */}
                            <div className="py-2">
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
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
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