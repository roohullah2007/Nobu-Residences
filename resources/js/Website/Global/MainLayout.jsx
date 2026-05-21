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
                    // Full-width sticky navy band, 82px tall, no top/side
                    // gutters or border radius. Inner Navbar centres its
                    // content within a 1280px max-width container with
                    // 32px horizontal padding.
                    <div
                        className="sticky top-0 z-30 w-full flex items-center"
                        style={{
                            height: '82px',
                            backgroundColor: '#041B52',
                        }}
                    >
                        <Navbar auth={auth} website={website} onDarkBg={true} />
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