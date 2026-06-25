import { useState, useEffect } from 'react';
import Navbar from '@/Website/Global/Navbar';

// Scroll-aware home page header.
//
// Sits over the dark hero (transparent at the top of the page) and
// transitions to the site's solid navy sticky bar once the user scrolls
// past the threshold. The solid state mirrors MainLayout's `blueHeader`
// branch exactly: a full-width, 82px-tall navy band wrapping the shared
// Navbar in `onDarkBg` mode (220x60 logo, white nav links, Log In).
//
// The navy colour is admin-driven (website.brand_colors) so it stays
// themeable like the rest of the site, falling back to the current
// hardcoded #041B52.
export default function HomeHeader({ auth, website }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            setScrolled(window.scrollY > 32);
        };

        // Read the initial scroll position once mounted (e.g. when the
        // user lands mid-page via an anchor or after a back-navigation).
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Admin-driven navy, matching the rest of the site, with the current
    // hardcoded fallback.
    const navy =
        website?.brand_colors?.header_bg ||
        website?.brand_colors?.secondary ||
        '#041B52';

    return (
        <div
            className="fixed top-0 left-0 right-0 z-50 w-full flex items-center transition-all duration-300"
            style={{
                height: '82px',
                backgroundColor: scrolled ? navy : 'transparent',
                boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.25)' : 'none',
            }}
        >
            <Navbar auth={auth} website={website} onDarkBg={true} />
        </div>
    );
}
