import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import MainLayout from '@/Website/Global/MainLayout';
import HeroSection from '@/Website/Sections/Home/HeroSection';
import AboutSection from '@/Website/Sections/Home/AboutSection';
import PropertiesSection from '@/Website/Sections/Home/PropertiesSection';
import FAQSection from '@/Website/Sections/Home/FAQSection';
import { ViewingRequestModal } from '@/Website/Global/Components';

export default function Home({ auth, laravelVersion, phpVersion, website, siteName, siteUrl, year, pageContent, availableIcons, ...props }) {
    const [viewingModal, setViewingModal] = useState({
        isOpen: false,
        property: null
    });

    // Global function to open viewing modal from property cards
    useEffect(() => {
        window.openViewingModal = (property) => {
            setViewingModal({
                isOpen: true,
                property: property
            });
        };

        // Cleanup
        return () => {
            delete window.openViewingModal;
        };
    }, []);

    const handleCloseViewingModal = () => {
        setViewingModal({
            isOpen: false,
            property: null
        });
    };

    return (
        <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} website={website} pageContent={pageContent} auth={auth} hideHeader={true}>
            <Head title={`${siteName} - Your Next Home Is Just a Click Away`} />
            {/* Prevent horizontal overflow */}
            <div className="overflow-x-hidden">
                <HeroSection auth={auth} siteName={siteName} website={website} pageContent={pageContent} />
                <AboutSection website={website} pageContent={pageContent} availableIcons={availableIcons} />
                <PropertiesSection auth={auth} website={website} pageContent={pageContent} />
                <div className=' px-4 md:px-0'>
                <FAQSection website={website} pageContent={pageContent} />
                </div>
            </div>

            {/* Global Viewing Request Modal */}
            <ViewingRequestModal 
                isOpen={viewingModal.isOpen}
                onClose={handleCloseViewingModal}
                property={viewingModal.property}
            />
        </MainLayout>
    );
}
