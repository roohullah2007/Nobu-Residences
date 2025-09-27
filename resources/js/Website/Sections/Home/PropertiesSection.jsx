import PropertiesForSale from '@/Website/Components/Property/PropertiesForSale';
import PropertiesForRent from '@/Website/Components/Property/PropertiesForRent';

export default function PropertiesSection({ auth, website, pageContent }) {
    return (
        <section className="py-4 md:py-16 bg-gray-50">
            <div className="mx-auto px-4 md:px-0 max-w-screen-[1280px]">
                {/* Section Header */}
                <div className="text-center mb-8">
                    <div className="flex flex-row items-start gap-2 w-[103px] h-8 bg-[#F5F5F5] rounded-[100px] flex-none mx-auto mb-4">
                        <div className="flex flex-row justify-center items-center py-1.5 px-4 gap-2 w-[103px] h-8 flex-none">
                            <span className="w-[71px] h-6 font-work-sans font-medium text-sm leading-6 flex items-center text-center text-[#293056] flex-none">
                                Properties
                            </span>
                        </div>
                    </div>
                    <h2 className="font-space-grotesk font-bold text-[40px] leading-[50px] tracking-[-0.03em] text-center text-gray-900 mb-4">
                        What you are looking for?
                    </h2>
                    <p className="font-work-sans font-normal text-lg leading-[27px] tracking-[-0.03em] text-center text-gray-600 max-w-2xl mx-auto">
                        Whether you're planning to move in temporarily or find a forever home, our listings are tailored to your needs.
                    </p>
                </div>
                
                {/* Properties For Sale Component */}
                <PropertiesForSale 
                    auth={auth} 
                    carouselSettings={pageContent?.carousel_settings?.for_sale}
                    mlsSettings={pageContent?.mls_settings} 
                />
                
                {/* Properties For Rent Component */}
                <PropertiesForRent 
                    auth={auth} 
                    carouselSettings={pageContent?.carousel_settings?.for_rent}
                    mlsSettings={pageContent?.mls_settings}
                />
            </div>
        </section>
    );
}
