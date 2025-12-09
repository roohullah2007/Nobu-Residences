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
    
    // Get building addresses from MLS settings - supports multiple buildings
    // Can be a single address like "15 Mercer Street" or comma-separated like "15 Mercer Street, 35 Mercer Street"
    const defaultBuildingAddresses = mlsSettings.default_building_address || '15 Mercer Street';
    const buildingAddresses = defaultBuildingAddresses.split(',').map(addr => addr.trim());

    // Parse the first building address for URL slug
    const firstAddress = buildingAddresses[0];
    const addressParts = firstAddress.split(' ');
    const streetNumber = addressParts[0] || '15';
    const streetName = addressParts.slice(1).join(' ').replace(/\s+Street$/i, '') || 'Mercer';
    const buildingSlug = `${streetNumber}-${streetName.replace(/\s+/g, '-')}`;

    // Fetch property counts on component mount - supports multiple buildings
    useEffect(() => {
        const fetchPropertyCounts = async () => {
            try {
                // Fetch counts for all configured buildings
                let totalForSale = 0;
                let totalForRent = 0;

                for (const address of buildingAddresses) {
                    const parts = address.split(' ');
                    const num = parts[0];
                    const name = parts.slice(1).join(' ').replace(/\s+Street$/i, '');

                    const response = await fetch(`/api/buildings/count-mls-listings?street_number=${num}&street_name=${name}`);
                    const data = await response.json();
                    if (data.success) {
                        totalForSale += data.data.for_sale || 0;
                        totalForRent += data.data.for_rent || 0;
                    }
                }

                setPropertyCounts({
                    for_sale: totalForSale,
                    for_rent: totalForRent,
                    total: totalForSale + totalForRent
                });
            } catch (error) {
                console.error('Error fetching property counts:', error);
            } finally {
                setIsLoadingCounts(false);
            }
        };

        fetchPropertyCounts();
    }, [defaultBuildingAddresses]);
    
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
        secondary: '#1d957d',
        accent: '#F5F8FF',
        text: '#000000',
        background: '#FFFFFF',
        // Extended button colors with fallbacks
        button_primary_bg: '#912018',
        button_primary_text: '#FFFFFF',
        button_secondary_bg: '#FFFFFF',
        button_secondary_text: '#000000'
    };

    // Get specific button colors (fallback to defaults)
    const buttonPrimaryBg = brandColors.button_primary_bg || brandColors.primary;
    const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';
    const buttonSecondaryBg = brandColors.button_secondary_bg || '#FFFFFF';
    const buttonSecondaryText = brandColors.button_secondary_text || '#000000';
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
                                    className="inline-flex items-center justify-center transition-colors shadow-lg font-work-sans font-bold text-sm md:text-lg leading-7 -tracking-wider text-center w-[314.5px] h-16 rounded-full px-8 py-2.5 hover:opacity-90"
                                    style={{
                                        backgroundColor: button.style === 'primary' ? buttonPrimaryBg : buttonSecondaryBg,
                                        color: button.style === 'primary' ? buttonPrimaryText : buttonSecondaryText
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
