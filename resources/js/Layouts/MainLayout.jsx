import Footer from '@/Website/Components/Layout/Footer/Footer';

export default function MainLayout({ children }) {
    return (
        <div className="min-h-screen">
            <main className="md:px-0">{children}</main>
            <Footer />
        </div>
    );
}