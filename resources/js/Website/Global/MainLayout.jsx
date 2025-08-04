import Footer from '@/Website/Global/Footer';

export default function MainLayout({ children, siteName, siteUrl, year, website, pageContent }) {
    return (
        <div className="min-h-screen">
            <main className="md:px-0">{children}</main>
            <Footer siteName={siteName} siteUrl={siteUrl} year={year} website={website} pageContent={pageContent} />
        </div>
    );
}