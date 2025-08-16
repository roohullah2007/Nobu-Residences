import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { LoginModal } from '@/Website/Global/Components';

export default function Navbar({ auth = {} }) {
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
                    <div className="flex items-center">
                        <div className="font-space-grotesk font-bold text-black">
                            X HOUSES
                        </div>
                    </div>
                    
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
                    <div className="flex items-center">
                        <div className="font-space-grotesk font-bold text-black text-[32px] leading-[36px] tracking-[-0.011em]">
                            X HOUSES
                        </div>
                    </div>
                    
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
                            href="/rent" 
                            className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                            style={{ 
                                fontSize: '16px', 
                                fontWeight: '500' 
                            }}
                        >
                            Rent
                        </Link>
                        <Link 
                            href="/sale" 
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
                        <Link 
                            href="/property-detail" 
                            className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                            style={{ 
                                fontSize: '16px', 
                                fontWeight: '500' 
                            }}
                        >
                            Property Detail
                        </Link>
                        <Link 
                            href="/school" 
                            className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                            style={{ 
                                fontSize: '16px', 
                                fontWeight: '500' 
                            }}
                        >
                            School
                        </Link>
                        {auth?.user ? (
                            <Link
                                href="/user/dashboard"
                                className="px-4 py-2 rounded-lg transition-colors font-work-sans"
                                style={{ 
                                    fontSize: '16px', 
                                    fontWeight: '500' 
                                }}
                            >
                                My Account
                            </Link>
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
                                    href="/rent" 
                                    className="block px-6 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors font-work-sans border-b border-gray-50 last:border-b-0"
                                    style={{ fontSize: '16px', fontWeight: '500' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Rent
                                </Link>
                                <Link 
                                    href="/sale" 
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
                                <Link 
                                    href="/property-detail" 
                                    className="block px-6 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors font-work-sans border-b border-gray-50 last:border-b-0"
                                    style={{ fontSize: '16px', fontWeight: '500' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Property Detail
                                </Link>
                                <Link 
                                    href="/school" 
                                    className="block px-6 py-3 text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors font-work-sans border-b border-gray-50 last:border-b-0"
                                    style={{ fontSize: '16px', fontWeight: '500' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    School
                                </Link>
                            </div>
                            
                            {/* Action Button */}
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                                {auth?.user ? (
                                    <Link
                                        href="/user/dashboard"
                                        className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-work-sans text-center"
                                        style={{ fontSize: '16px', fontWeight: '600' }}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        My Account
                                    </Link>
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