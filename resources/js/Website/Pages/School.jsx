import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import MainLayout from '@/Website/Global/MainLayout';
import SchoolHeroSection from '@/Website/Sections/School/SchoolHeroSection';
import PropertiesForSale from '@/Website/Components/Property/PropertiesForSale';
import PropertiesForRent from '@/Website/Components/Property/PropertiesForRent';
import { ViewingRequestModal, FAQ, RealEstateLinksSection } from '@/Website/Global/Components';

export default function School({ auth, website, siteName, siteUrl, year, title }) {
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
        <MainLayout siteName={siteName} siteUrl={siteUrl} year={year} website={website}>
            <Head title={`${siteName} - ${title}`} />
            
                <SchoolHeroSection auth={auth} siteName={siteName} website={website} />
            {/* Prevent horizontal overflow */}
            <div className="overflow-x-hidden px-4 md:px-0">
                
                {/* Text Section */}
                <section className="py-16 bg-white relative z-10">
                    <div className="max-w-[1280px] mx-auto">
                        {/* Heading */}
                        <h2 
                            className="font-space-grotesk mb-8"
                            style={{
                                fontWeight: 500,
                                fontSize: '28px',
                                color: 'rgba(41, 48, 86, 1)'
                            }}
                        >
                            Text Section
                        </h2>
                        
                        {/* Paragraph */}
                        <p 
                            className="font-work-sans leading-relaxed"
                            style={{
                                fontWeight: 400,
                                fontSize: '18px',
                                color: 'rgba(41, 48, 86, 1)'
                            }}
                        >
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                    </div>
                </section>

                {/* Properties Section */}
                <section className="py-8 bg-gray-50 relative z-10" style={{minHeight: '500px'}}>
                    <div className="mx-auto space-y-10 md:px-0 max-w-[1280px]">

                        
                        {/* Properties For Sale Component */}
                        <PropertiesForSale />
                        
                        {/* Properties For Rent Component */}
                        <PropertiesForRent />
                    </div>
                </section>

                {/* FAQ Section */}
                <FAQ 
                    title="FAQs"
                    containerClassName="py-4 md:py-16 bg-white"
                    showContainer={true}
                />

                <div className='max-w-[1280px] mx-auto'>
                    {/* Real Estate Links Section */}
                <RealEstateLinksSection />
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
