import Footer from '@/Website/Components/Layout/Footer/Footer';

export default function MainLayout({ children, noPadding = false }) {
    return (
        <div className="min-h-screen">
            <main className={`md:px-0 ${noPadding ? '' : 'py-5'}`}>{children}</main>
            <Footer />
        </div>
    );
}