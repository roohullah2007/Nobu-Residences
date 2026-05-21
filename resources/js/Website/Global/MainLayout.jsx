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
                    // Spec: sticky, 82px tall, deep navy #041B52, 18px
                    // outer radius, 14px top margin, width = 100% - 28px
                    // (14px gutter each side), horizontally centered.
                    // Sticks at top:14px so the side gutters stay visible
                    // while scrolling.
                    <div
                        className="sticky z-30 mx-auto flex items-center"
                        style={{
                            top: '14px',
                            marginTop: '14px',
                            width: 'calc(100% - 28px)',
                            height: '82px',
                            backgroundColor: '#041B52',
                            borderRadius: '18px',
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