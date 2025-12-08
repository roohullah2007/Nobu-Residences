import Footer from '@/Website/Global/Footer';
import Navbar from '@/Website/Global/Navbar';

export default function MainLayout({ children, siteName, siteUrl, year, website, pageContent, auth, hideHeader = false, blueHeader = false, noPadding = false }) {
    const brandColors = website?.brand_colors || {
        primary: '#912018',
        secondary: '#1d957d',
        accent: '#F5F8FF',
        text: '#000000',
        background: '#FFFFFF'
    };

    return (
        <div className="min-h-screen">
            {/* Consistent header across all pages - same as homepage */}
            {!hideHeader && (
                blueHeader ? (
                    <div
                        className="w-screen h-[85px] md:h-[120px] relative flex items-center"
                        style={{ backgroundColor: brandColors.primary }}
                    >
                        <Navbar auth={auth} website={website} />
                    </div>
                ) : (
                    <Navbar auth={auth} website={website} />
                )
            )}

            <main className="md:px-0">{children}</main>
            <Footer siteName={siteName} siteUrl={siteUrl} year={year} website={website} pageContent={pageContent} auth={auth} />
        </div>
    );
}