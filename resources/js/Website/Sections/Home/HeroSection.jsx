import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Navbar from '@/Website/Global/Navbar';

export default function HeroSection({ auth, siteName = 'Nobu Residences', website, pageContent }) {
    const [propertyCounts, setPropertyCounts] = useState({ for_sale: 0, for_rent: 0 });
    const [isLoadingCounts, setIsLoadingCounts] = useState(true);
    
    const heroContent = pageContent?.hero || {};
    const mlsSettings = pageContent?.mls_settings || {};
    const welcomeText = heroContent.welcome_text || `WELCOME TO ${siteName.toUpperCase()}`;
    const mainHeading = heroContent.main_heading || 'Your Next Home Is\nJust a Click Away';
    const subheading = heroContent.subheading || 'Whether buying or renting, Nobu makes finding your home easy and reliable.';
    const backgroundImage = heroContent.background_image || '/assets/hero-section.jpg';
    
    // Get default building address from MLS settings or use fallback
    const defaultBuildingAddress = mlsSettings.default_building_address || '15 Mercer Street';
    const addressParts = defaultBuildingAddress.split(' ');
    const streetNumber = addressParts[0] || '15';
    const streetName = addressParts.slice(1).join(' ').replace(/\s+Street$/i, '') || 'Mercer';
    const buildingSlug = `${streetNumber}-${streetName.replace(/\s+/g, '-')}`;
    
    // Fetch property counts on component mount
    useEffect(() => {
        const fetchPropertyCounts = async () => {
            try {
                // Use the building address from MLS settings
                const response = await fetch(`/api/buildings/count-mls-listings?street_number=${streetNumber}&street_name=${streetName}`);
                const data = await response.json();
                if (data.success) {
                    setPropertyCounts(data.data);
                }
            } catch (error) {
                console.error('Error fetching property counts:', error);
            } finally {
                setIsLoadingCounts(false);
            }
        };
        
        fetchPropertyCounts();
    }, [streetNumber, streetName]);
    
    // Always use dynamic buttons with building-specific URLs
    // IMPORTANT: Ignore database URLs and always use building-specific routes
    const buttons = [
        { 
            text: isLoadingCounts 
                ? 'Loading...' 
                : `${propertyCounts.for_rent || 0} ${propertyCounts.for_rent === 1 ? 'Condo' : 'Condos'} for rent`, 
            url: `/${buildingSlug}/for-rent`, // Always use dynamic URL
            style: 'primary' // First button is always primary
        },
        { 
            text: isLoadingCounts 
                ? 'Loading...' 
                : `${propertyCounts.for_sale || 0} ${propertyCounts.for_sale === 1 ? 'Condo' : 'Condos'} for sale`, 
            url: `/${buildingSlug}/for-sale`, // Always use dynamic URL
            style: 'secondary' // Second button is always secondary
        }
    ];
    
    const brandColors = website?.brand_colors || {
        primary: '#912018',
        secondary: '#293056'
    };
    return (
        <div className="relative bg-cover bg-center bg-no-repeat font-work-sans h-[696px]" style={{
            backgroundImage: `url('${backgroundImage}')`
        }}>
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
            
            {/* Header */}
            <Navbar auth={auth} website={website} />

            {/* Hero Section */}
            <main className="relative z-10 flex items-end h-[555px]  md:h-[calc(696px-64px)]">
                <div className="mx-auto px-4 md:px-0 w-full max-w-screen-xl">
                    <div className="max-w-3xl gap-y-6 flex flex-col">
                        {/* Welcome Text */}
                        <div>
                            <p className="text-white font-work-sans font-normal text-sm leading-6 -tracking-wider">
                                / {welcomeText}
                            </p>
                        </div>
                        
                        {/* Main Heading */}
                        <h1 className="text-white text-[45px] font-space-grotesk font-bold md:text-[65px] leading-[55px] md:leading-[72px] -tracking-wider">
                            <span>Your Next Home Is<br /></span>
                            <span>Just a Click Away</span>
                        </h1>
                        
                        {/* Subheading */}
                        <p className="text-white max-w-2xl font-work-sans font-normal text-lg leading-[27px] -tracking-wider">
                            {subheading}
                        </p>
                        
                        {/* CTA Buttons */}
                        <div className="flex gap-4">
                            {buttons.map((button, index) => (
                                <Link
                                    key={index}
                                    href={button.url}
                                    className={`inline-flex items-center justify-center transition-colors shadow-lg font-work-sans font-bold text-sm md:text-lg leading-7 -tracking-wider text-center w-[314.5px] h-16 rounded-full px-8 py-2.5 ${
                                        button.style === 'primary'
                                            ? 'text-white hover:opacity-90'
                                            : 'bg-white text-gray-900 hover:bg-gray-100'
                                    }`}
                                    style={{
                                        backgroundColor: button.style === 'primary' ? brandColors.primary : undefined
                                    }}
                                >
                                    {button.text}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
