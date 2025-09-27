import Footer from '@/Website/Global/Footer';
import Navbar from '@/Website/Global/Navbar';

export default function MainLayout({ children, siteName, siteUrl, year, website, pageContent, auth, hideHeader = false }) {
    return (
        <div className="min-h-screen">
            {/* Consistent header across all pages - same as homepage */}
            {!hideHeader && (
                <div className='bg-[#293056] w-screen h-[85px] md:h-[120px]'>
                    <div className="relative">
                        <Navbar auth={auth} website={website} />
                    </div>
                </div>
            )}

            <main className="md:px-0">{children}</main>
            <Footer siteName={siteName} siteUrl={siteUrl} year={year} website={website} pageContent={pageContent} auth={auth} />
        </div>
    );
}