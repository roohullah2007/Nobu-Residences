import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Navbar({ auth = {}, website = {} }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    return (
        <header className="absolute top-0 left-0 right-0 w-full flex items-center justify-center z-20">
            <div className="mx-auto px-4 py-4 md:py-8 w-full max-w-[1280px] sm:px-6 md:px-8">
                {/* Mobile Navbar */}
                <div className="flex md:hidden justify-between items-center px-4 py-2 bg-white rounded-xl">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        {website?.logo_url ? (
                            <img
                                src={website.logo || website.logo_url}
                                alt={website?.name || 'Site Logo'}
                                className="h-8 w-auto object-contain"
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
                            className="bg-white rounded-lg p-2 text-gray-900"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{ background: '#FFFFFF' }}
                        >
                            <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M0 2.66667V0H24V2.66667H0ZM0 9.33333H24V6.66667H0V9.33333ZM0 16H24V13.3333H0V16Z" fill="#1C1463"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Desktop Navbar */}
                <div className="hidden md:flex h-16 bg-white rounded-xl items-center justify-between px-6">
                    {/* Logo and Brand */}
                    <Link href="/" className="flex items-center">
                        {website?.logo_url ? (
                            <img
                                src={website.logo || website.logo_url}
                                alt={website?.name || 'Site Logo'}
                                className="h-10 w-auto object-contain"
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
                                href="/login"
                                className="px-4 py-2 rounded-lg transition-colors font-work-sans"
                                style={{ 
                                    fontSize: '16px', 
                                    fontWeight: '500' 
                                }}
                            >
                                Log In
                            </Link> 
                    </nav>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div 
                        className="md:hidden absolute bg-white rounded-2xl shadow-lg py-4 px-6 z-50"
                        style={{
                            width: '350px',
                            height: '363px',
                            top: '277px',
                            left: '40px',
                            gap: '24px'
                        }}
                    >
                        <div className="flex flex-col space-y-4">
                            <Link 
                                href="/" 
                                className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                                style={{ fontSize: '16px', fontWeight: '500' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link 
                                href="/rent" 
                                className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                                style={{ fontSize: '16px', fontWeight: '500' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Rent
                            </Link>
                            <Link 
                                href="/sale" 
                                className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                                style={{ fontSize: '16px', fontWeight: '500' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sale
                            </Link>
                            <Link 
                                href="/search" 
                                className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                                style={{ fontSize: '16px', fontWeight: '500' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Search All
                            </Link>
                            <Link 
                                href="/blog" 
                                className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                                style={{ fontSize: '16px', fontWeight: '500' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Blog
                            </Link>
                            <Link 
                                href="/contact" 
                                className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                                style={{ fontSize: '16px', fontWeight: '500' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contact Us
                            </Link>
                            <Link 
                                href="/property-detail" 
                                className="text-gray-900 hover:text-blue-600 transition-colors font-work-sans"
                                style={{ fontSize: '16px', fontWeight: '500' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Property Detail
                            </Link>
                            {auth?.user ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-work-sans text-center"
                                    style={{ fontSize: '16px', fontWeight: '500' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-work-sans text-center"
                                    style={{ fontSize: '16px', fontWeight: '500' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
