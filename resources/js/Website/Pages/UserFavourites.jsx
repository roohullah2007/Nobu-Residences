import MainLayout from '@/Website/Global/MainLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Heart } from '@/Website/Components/Icons';
import PropertyCardV5 from '@/Website/Global/Components/PropertyCards/PropertyCardV5';

export default function UserFavourites({ auth, website }) {
    const [savedProperties, setSavedProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const { globalWebsite } = usePage().props;
    const currentWebsite = globalWebsite || website || {};
    const brandColors = currentWebsite?.brand_colors || {
        primary: '#912018',
        secondary: '#293056',
        button_primary_bg: '#912018',
        button_primary_text: '#FFFFFF'
    };
    const buttonPrimaryBg = brandColors.button_primary_bg || brandColors.primary || '#293056';
    const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';

    useEffect(() => {
        fetchFavourites();
    }, []);

    const formatTimeAgo = (date) => {
        if (!date) return 'Recently';

        const now = new Date();
        const saved = new Date(date);

        // Check for invalid date
        if (isNaN(saved.getTime())) return 'Recently';

        const diffTime = Math.abs(now - saved);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    };

    const fetchFavourites = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/favourites/properties/with-data', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched favorites data:', data);

                const formattedFavourites = (data.data || []).map(fav => {
                    // Format property data to match PropertyCardV5 requirements
                    const propertyData = fav.property_data || {};

                    return {
                        id: fav.id,
                        ListingKey: fav.property_listing_key,
                        listingKey: fav.property_listing_key,

                        // Price information
                        ListPrice: fav.property_price || propertyData.ListPrice,
                        price: fav.property_price || propertyData.ListPrice,

                        // Address information
                        StreetNumber: propertyData.StreetNumber || '',
                        StreetName: propertyData.StreetName || '',
                        StreetSuffix: propertyData.StreetSuffix || '',
                        UnitNumber: propertyData.UnitNumber || propertyData.ApartmentNumber || '',
                        City: fav.property_city || propertyData.City || '',
                        StateOrProvince: propertyData.StateOrProvince || 'ON',
                        PostalCode: propertyData.PostalCode || '',
                        address: fav.property_address || `${propertyData.StreetNumber || ''} ${propertyData.StreetName || ''} ${propertyData.StreetSuffix || ''}`.trim(),

                        // Property details
                        BedroomsTotal: propertyData.BedroomsTotal || 0,
                        BathroomsTotalInteger: propertyData.BathroomsTotalInteger || 0,
                        LivingAreaRange: propertyData.LivingAreaRange || propertyData.LivingArea || '',
                        PropertyType: propertyData.PropertyType || fav.property_type || 'Residential',
                        PropertySubType: propertyData.PropertySubType || '',
                        propertyType: propertyData.PropertySubType || propertyData.PropertyType || fav.property_type || 'Residential',
                        StandardStatus: propertyData.StandardStatus || 'Active',
                        TransactionType: propertyData.TransactionType || (propertyData.isRental ? 'For Lease' : 'For Sale'),

                        // Additional data
                        savedDate: formatTimeAgo(fav.favourited_at),
                        source: 'mls',
                        // Try multiple sources for image
                        imageUrl: propertyData.images?.[0] ||
                                 propertyData.imageUrl ||
                                 propertyData.MediaURL ||
                                 fav.property_data?.MediaURL ||
                                 fav.property_data?.images?.[0] ||
                                 fav.property_data?.imageUrl ||
                                 propertyData.Photos?.[0]?.Uri ||
                                 propertyData.Photos?.[0]?.MediaURL ||
                                 null,
                        originalPropertyData: fav
                    };
                });

                console.log('Formatted favorites:', formattedFavourites);
                setSavedProperties(formattedFavourites);
            }
        } catch (error) {
            console.error('Error fetching favourites:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFavourite = async (listingKey) => {
        try {
            const response = await fetch('/api/favourites/properties', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    property_listing_key: listingKey
                })
            });

            if (response.ok) {
                const updatedProperties = savedProperties.filter(prop => prop.listingKey !== listingKey);
                setSavedProperties(updatedProperties);

                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
                successMsg.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Property removed from favourites';
                document.body.appendChild(successMsg);

                setTimeout(() => {
                    successMsg.style.transition = 'opacity 0.3s';
                    successMsg.style.opacity = '0';
                    setTimeout(() => successMsg.remove(), 300);
                }, 2500);
            }
        } catch (error) {
            console.error('Error removing favourite:', error);
        }
    };

    return (
        <MainLayout auth={auth} website={website} blueHeader={true}>
            <Head title="My Favourites" />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Link
                                    href="/dashboard"
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-space-grotesk">
                                    My Favourites
                                </h1>
                                <Heart className="w-7 h-7 text-red-500" filled={true} />
                            </div>
                            <p className="text-gray-600 font-work-sans">
                                {savedProperties.length > 0
                                    ? `You have ${savedProperties.length} saved ${savedProperties.length === 1 ? 'property' : 'properties'}`
                                    : 'Properties you\'ve saved while browsing'
                                }
                            </p>
                        </div>
                        <Link
                            href="/search"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-work-sans font-medium hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Find More Properties
                        </Link>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="inline-block w-12 h-12 border-4 border-[#293056] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 font-work-sans">Loading your favourites...</p>
                        </div>
                    ) : savedProperties.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-12 h-12 text-red-300" filled={false} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 font-space-grotesk mb-2">
                                No favourites yet
                            </h3>
                            <p className="text-gray-500 font-work-sans max-w-md mx-auto mb-8">
                                Start exploring properties and click the heart icon to save them to your favourites.
                            </p>
                            <Link
                                href="/search"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-work-sans font-medium hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Browse Properties
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {savedProperties.map((property) => (
                                <div key={property.id} className="relative group">
                                    <PropertyCardV5
                                        property={property}
                                        size="default"
                                    />
                                    {/* Remove Button Overlay */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeFavourite(property.listingKey);
                                        }}
                                        className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-md z-10 opacity-0 group-hover:opacity-100"
                                        title="Remove from favourites"
                                    >
                                        <Heart className="w-5 h-5 text-red-500" filled={true} />
                                    </button>
                                    {/* Saved Date Badge */}
                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white font-work-sans z-10">
                                        Saved {property.savedDate}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
