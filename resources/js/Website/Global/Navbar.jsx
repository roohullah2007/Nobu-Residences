import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { LoginModal } from '@/Website/Global/Components';
import Dropdown from '@/Components/Dropdown';
import { Heart } from '@/Website/Components/Icons';

export default function Navbar({ auth = {}, website = {} }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);


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
        <header className="absolute top-0 left-0 right-0 w-full flex items-center justify-center z-20">
            <div className="mx-auto px-4 py-4 md:py-8 w-full max-w-[1280px] sm:px-6 md:px-0">
                {/* Mobile Navbar */}
                <div className="flex md:hidden justify-between items-center px-4 py-2 bg-white rounded-xl">
                    {/* Logo */}
                    <Link href="/" className="flex items-center cursor-pointer">
                        {website?.logo_url ? (
                            <img
                                src={website.logo_url}
                                alt={website?.name || 'Site Logo'}
                                style={{
                                    width: website?.logo_width ? `${website.logo_width}px` : '146px',
                                    height: website?.logo_height ? `${website.logo_height}px` : '36px'
                                }}
                                className="object-contain"
                            />
                        ) : (
                            <div className="font-space-grotesk font-bold text-black">
                                {website?.name || 'X HOUSES'}
                            </div>
                        )}
                    </Link>
                    
                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button 
                            className="bg-white rounded-lg p-2 text-gray-900 hover:bg-gray-50 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? (
                                // Close icon
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="#1C1463" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            ) : (
                                // Hamburger icon
                                <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0 2.66667V0H24V2.66667H0ZM0 9.33333H24V6.66667H0V9.33333ZM0 16H24V13.3333H0V16Z" fill="#1C1463"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Desktop Navbar */}
                <div className="hidden md:flex h-16 bg-white rounded-xl items-center justify-between px-6">
                    {/* Logo and Brand */}
                    <Link href="/" className="flex items-center cursor-pointer">
                        {website?.logo_url ? (
                            <img
                                src={website.logo_url}
                                alt={website?.name || 'Site Logo'}
                                style={{
                                    width: website?.logo_width ? `${website.logo_width}px` : '146px',
                                    height: website?.logo_height ? `${website.logo_height}px` : '36px'
                                }}
                                className="object-contain"
                            />
                        ) : (
                            <div className="font-space-grotesk font-bold text-black text-[32px] leading-[36px] tracking-[-0.011em]">
                                {website?.name || 'X HOUSES'}
                            </div>
                        )}
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center" style={{ gap: '32px' }}>
                        <Link 
                            href="/" 
                            className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                            style={{ 
                                fontSize: '16px', 
                                fontWeight: '500' 
                            }}
                        >
                            Home
                        </Link>
                        <Link 
                            href="/toronto/for-rent" 
                            className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                            style={{ 
                                fontSize: '16px', 
                                fontWeight: '500' 
                            }}
                        >
                            Rent
                        </Link>
                        <Link 
                            href="/toronto/for-sale" 
                            className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                            style={{ 
                                fontSize: '16px', 
                                fontWeight: '500' 
                            }}
                        >
                            Sale
                        </Link>
                        <Link 
                            href="/search" 
                            className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                            style={{ 
                                fontSize: '16px', 
                                fontWeight: '500' 
                            }}
                        >
                            Search All
                        </Link>
                        <Link 
                            href="/blog" 
                            className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                            style={{ 
                                fontSize: '16px', 
                                fontWeight: '500' 
                            }}
                        >
                            Blog
                        </Link>
                        <Link 
                            href="/contact" 
                            className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                            style={{ 
                                fontSize: '16px', 
                                fontWeight: '500' 
                            }}
                        >
                            Contact Us
                        </Link>
                        {auth?.user ? (
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-work-sans hover:bg-gray-100">
                                        {auth.user.avatar ? (
                                            <img
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-[#293056] text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                {auth.user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <span className="text-gray-900" style={{ fontSize: '16px', fontWeight: '500' }}>
                                            {auth.user.name || 'User'}
                                        </span>
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="right" width="56">
                                    <Dropdown.Link href="/user/dashboard">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            Dashboard
                                        </div>
                                    </Dropdown.Link>
                                    <Dropdown.Link href="/user/favourites">
                                        <div className="flex items-center gap-3">
                                            <Heart className="w-4 h-4 text-red-500" filled={true} />
                                            My Favourites
                                        </div>
                                    </Dropdown.Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <Dropdown.Link href="/profile">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Profile Settings
                                        </div>
                                    </Dropdown.Link>
                                    <Dropdown.Link href="/logout" method="post" as="button">
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
                                className="px-4 py-2 rounded-lg transition-colors font-work-sans hover:bg-gray-100"
                                style={{ 
                                    fontSize: '16px', 
                                    fontWeight: '500' 
                                }}
                            >
                                Log In
                            </button>
                        )} 
                    </nav>
                </div>
            </div>

            {/* Mobile Navigation Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50">
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
                                <Link 
                                    href="/" 
                                    className="block px-6 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors font-work-sans border-b border-gray-50 last:border-b-0"
                                    style={{ fontSize: '16px', fontWeight: '500' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Home
                                </Link>
                                <Link 
                                    href="/toronto/for-rent" 
                                    className="block px-6 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors font-work-sans border-b border-gray-50 last:border-b-0"
                                    style={{ fontSize: '16px', fontWeight: '500' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Rent
                                </Link>
                                <Link 
                                    href="/toronto/for-sale" 
                                    className="block px-6 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors font-work-sans border-b border-gray-50 last:border-b-0"
                                    style={{ fontSize: '16px', fontWeight: '500' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sale
                                </Link>
                                <Link 
                                    href="/search" 
                                    className="block px-6 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors font-work-sans border-b border-gray-50 last:border-b-0"
                                    style={{ fontSize: '16px', fontWeight: '500' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Search All
                                </Link>
                                <Link 
                                    href="/blog" 
                                    className="block px-6 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors font-work-sans border-b border-gray-50 last:border-b-0"
                                    style={{ fontSize: '16px', fontWeight: '500' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Blog
                                </Link>
                                <Link 
                                    href="/contact" 
                                    className="block px-6 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors font-work-sans border-b border-gray-50 last:border-b-0"
                                    style={{ fontSize: '16px', fontWeight: '500' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Contact Us
                                </Link>
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
                                                <div className="w-10 h-10 bg-[#293056] text-white rounded-full flex items-center justify-center font-bold text-sm">
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
                                            href="/user/dashboard"
                                            className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-work-sans text-center"
                                            style={{ fontSize: '16px', fontWeight: '600' }}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/user/favourites"
                                            className="flex items-center justify-center gap-2 w-full border border-red-500 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors font-work-sans"
                                            style={{ fontSize: '16px', fontWeight: '600' }}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Heart className="w-4 h-4" filled={true} />
                                            My Favourites
                                        </Link>
                                        <Link
                                            href="/profile"
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
                                        className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-work-sans text-center"
                                        style={{ fontSize: '16px', fontWeight: '600' }}
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
            />
        </header>
    );
}