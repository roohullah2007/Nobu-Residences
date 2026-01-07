import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import PropertyCardV5 from '@/Website/Global/Components/PropertyCards/PropertyCardV5';
import ContactAgentModal from '@/Website/Components/ContactAgentModal';
import LoginModal from '@/Website/Global/Components/LoginModal';
import FAQ from '@/Website/Global/Components/FAQ';
import RealEstateLinksSection from '@/Website/Global/Components/RealEstateLinksSection';

export default function CompareListings({
    auth,
    website,
    favourites = []
}) {
    const [showContactModal, setShowContactModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [compareListings, setCompareListings] = useState([]);
    const [showShareSuccess, setShowShareSuccess] = useState(false);

    // Load compare listings from localStorage on mount
    useEffect(() => {
        loadCompareListings();

        // Listen for changes from other components
        const handleCompareChange = () => loadCompareListings();
        window.addEventListener('compareListChanged', handleCompareChange);
        return () => window.removeEventListener('compareListChanged', handleCompareChange);
    }, []);

    const loadCompareListings = () => {
        try {
            const stored = JSON.parse(localStorage.getItem('compareListings') || '[]');
            setCompareListings(stored);
        } catch (error) {
            console.error('Error loading compare listings:', error);
            setCompareListings([]);
        }
    };

    const removeFromCompare = (listingKey) => {
        try {
            const updated = compareListings.filter(item => item.listingKey !== listingKey);
            localStorage.setItem('compareListings', JSON.stringify(updated));
            setCompareListings(updated);
            window.dispatchEvent(new CustomEvent('compareListChanged'));
        } catch (error) {
            console.error('Error removing from compare:', error);
        }
    };

    const clearAllCompare = () => {
        try {
            localStorage.setItem('compareListings', JSON.stringify([]));
            setCompareListings([]);
            window.dispatchEvent(new CustomEvent('compareListChanged'));
        } catch (error) {
            console.error('Error clearing compare:', error);
        }
    };

    // Get agent info from website settings - no hardcoded fallbacks
    const agentName = website?.agent_info?.agent_name || website?.contact_info?.agent?.name || '';
    const agentTitle = website?.agent_info?.agent_title || website?.contact_info?.agent?.title || '';
    const agentBrokerage = website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage || '';
    const agentPhone = website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone || '';
    const agentEmail = website?.agent_info?.agent_email || website?.contact_info?.email || '';
    const agentImage = website?.agent_info?.profile_image || website?.contact_info?.agent?.image || '';

    // Agent data for ContactAgentModal
    const agentData = {
        name: agentName,
        title: agentTitle,
        brokerage: agentBrokerage,
        phone: agentPhone,
        email: agentEmail,
        image: agentImage
    };

    // Get the first 3 compare listings for comparison
    const comparisonItems = compareListings.slice(0, 3);
    const hasComparisonData = comparisonItems.length > 0;

    // Format compare item for PropertyCardV5
    const formatProperty = (item) => {
        const propertyData = item.property_data || {};
        const listingKey = item.listingKey || item.property_listing_key || propertyData.listingKey;
        return {
            id: listingKey,
            listingKey: listingKey,
            ListingKey: listingKey,
            propertyType: propertyData.PropertyType || propertyData.propertyType || 'Residential',
            address: propertyData.address || propertyData.Address || propertyData.UnparsedAddress || '',
            name: propertyData.address || propertyData.Address || propertyData.UnparsedAddress || '',
            city: propertyData.City || propertyData.city || '',
            province: propertyData.StateOrProvince || propertyData.province || 'ON',
            imageUrl: propertyData.MediaURL || propertyData.imageUrl || propertyData.images?.[0] || '/images/placeholder-property.jpg',
            price: propertyData.ListPrice || propertyData.price || 0,
            bedrooms: propertyData.BedroomsTotal || propertyData.bedrooms,
            bathrooms: propertyData.BathroomsTotalInteger || propertyData.bathrooms,
            isRental: propertyData.TransactionType === 'For Rent',
            transactionType: propertyData.TransactionType || 'For Sale',
            source: 'mls',
            UnitNumber: propertyData.UnitNumber,
            StreetNumber: propertyData.StreetNumber,
            StreetName: propertyData.StreetName,
            City: propertyData.City || propertyData.city,
            StateOrProvince: propertyData.StateOrProvince || propertyData.province,
            daysOnMarket: propertyData.DaysOnMarket || propertyData.daysOnMarket
        };
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Compare Listings',
            text: 'Check out these listings I\'m comparing!',
            url: window.location.href
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                setShowShareSuccess(true);
                setTimeout(() => setShowShareSuccess(false), 3000);
            }
        } catch (error) {
            // If share was cancelled or failed, try clipboard
            if (error.name !== 'AbortError') {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    setShowShareSuccess(true);
                    setTimeout(() => setShowShareSuccess(false), 3000);
                } catch (clipboardError) {
                    console.error('Failed to copy:', clipboardError);
                }
            }
        }
    };

    const handleContactClick = () => {
        if (!auth?.user) {
            setShowLoginModal(true);
        } else {
            setShowContactModal(true);
        }
    };

    // Helper function to get property comparison value
    const getPropertyValue = (favourite, key) => {
        const propertyData = favourite?.property_data || {};

        switch (key) {
            case 'Instant Estimate':
                const price = propertyData.ListPrice || propertyData.price;
                return price ? `$${Number(price).toLocaleString()}` : '-';
            case 'Beds':
                const beds = propertyData.BedroomsTotal || propertyData.bedrooms;
                return beds ? String(beds) : '-';
            case 'Bathrooms':
                const baths = propertyData.BathroomsTotalInteger || propertyData.bathrooms;
                return baths ? String(baths) : '-';
            case 'Area':
                const area = propertyData.LivingArea || propertyData.BuildingAreaTotal || propertyData.area;
                return area ? `${Number(area).toLocaleString()} sqft` : '-';
            case 'Parking':
                const parking = propertyData.ParkingTotal || propertyData.GarageSpaces || propertyData.parking;
                if (parking === undefined || parking === null) return '-';
                return parking > 0 ? `${parking}` : 'No';
            case 'Maintenance Fees':
                const maintFee = propertyData.AssociationFee || propertyData.maintenanceFees;
                return maintFee ? `$${Number(maintFee).toLocaleString()}` : '-';
            case 'Property Taxes':
                const taxes = propertyData.TaxAnnualAmount || propertyData.propertyTaxes;
                return taxes ? `$${Number(taxes).toLocaleString()}` : '-';
            case 'Exposure':
                return propertyData.DirectionFaces || propertyData.exposure || '-';
            default:
                return '-';
        }
    };

    // Helper function to get building comparison value
    const getBuildingValue = (favourite, key) => {
        const propertyData = favourite?.property_data || {};

        switch (key) {
            case 'Building age':
                const yearBuilt = propertyData.YearBuilt || propertyData.yearBuilt;
                if (yearBuilt) {
                    const age = new Date().getFullYear() - parseInt(yearBuilt);
                    return `${age} years`;
                }
                return '-';
            case 'Avg Price/sqft':
                const price = propertyData.ListPrice || propertyData.price || 0;
                const area = propertyData.LivingArea || propertyData.BuildingAreaTotal || 0;
                if (price && area) {
                    return `$${Math.round(price / area).toLocaleString()}`;
                }
                return '-';
            case 'Last year growth':
                return propertyData.priceGrowth || '-';
            case 'Amenities':
                const amenities = propertyData.Amenities || propertyData.amenities;
                if (amenities && Array.isArray(amenities) && amenities.length > 0) {
                    return amenities[0];
                }
                return '-';
            default:
                return '-';
        }
    };

    // Helper function to get neighbourhood comparison value
    const getNeighbourhoodValue = (favourite, key) => {
        const propertyData = favourite?.property_data || {};

        switch (key) {
            case 'Name':
                return propertyData.SubdivisionName || propertyData.Neighborhood || propertyData.City || '-';
            case 'Avg Price/sqft':
                return propertyData.neighborhoodAvgPriceSqft || '-';
            case 'Last year growth':
                return propertyData.neighborhoodGrowth || '-';
            default:
                return '-';
        }
    };

    // Render comparison row
    const renderComparisonRow = (key, getValue) => (
        <div key={key} className="h-[48px] sm:h-[54px] flex items-center">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
                {comparisonItems.map((item, index) => (
                    <div
                        key={item.listingKey || item.property_listing_key || index}
                        className="h-[36px] sm:h-[40px] flex items-center justify-center bg-[#E8EBF5] rounded-lg font-work-sans text-[#293056] text-xs sm:text-base px-1 sm:px-2 truncate"
                    >
                        {getValue(item, key)}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <MainLayout auth={auth} website={website}>
            <Head title="Compare Listings" />

            {/* Header Bar - Same as developer details page */}
            <div className="w-full h-[85px] md:h-[120px] relative flex items-center" style={{ backgroundColor: '#292E56' }}>
            </div>

            <div className="min-h-screen bg-white">
                <div className="max-w-[1280px] mx-auto px-4 py-6 sm:py-12">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
                        <div>
                            <h1 className="font-space-grotesk font-bold text-[#293056] mb-2 text-[28px] sm:text-[36px] md:text-[40px]">
                                Compare Listings
                            </h1>
                            <p className="font-work-sans text-gray-600 text-base sm:text-lg">
                                {hasComparisonData
                                    ? `Comparing ${comparisonItems.length} ${comparisonItems.length === 1 ? 'property' : 'properties'}`
                                    : 'Add properties to compare by clicking the compare button on any property card.'
                                }
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                            {hasComparisonData && (
                                <button
                                    onClick={clearAllCompare}
                                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 border border-red-300 rounded-full font-work-sans font-medium text-red-600 hover:bg-red-50 transition-colors text-sm sm:text-base"
                                >
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={handleShare}
                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-full font-work-sans font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                            >
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Main Content - Agent Card + Property Cards */}
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
                        {/* Agent Info Card - Left Side */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 flex-shrink-0 shadow-sm w-full lg:w-[300px]">
                            <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-0">
                                {/* Agent Photo */}
                                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-4 border-gray-100 lg:mb-4 flex-shrink-0">
                                    {agentImage ? (
                                        <img
                                            src={agentImage}
                                            alt={agentName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-500">
                                                {agentName ? agentName.charAt(0) : '?'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Agent Details */}
                                <div className="flex-1 lg:flex-none lg:text-center">
                                    {agentName && (
                                        <h3 className="font-work-sans font-bold text-[#101323] text-base sm:text-lg uppercase tracking-wide lg:text-center">
                                            {agentName}
                                        </h3>
                                    )}
                                    {agentTitle && (
                                        <p className="font-work-sans text-[#912018] font-semibold text-xs sm:text-sm mt-1 lg:text-center">
                                            {agentTitle}
                                        </p>
                                    )}
                                    {agentBrokerage && (
                                        <p className="font-work-sans text-gray-600 text-xs sm:text-sm mt-1 lg:text-center hidden sm:block">
                                            {agentBrokerage}
                                        </p>
                                    )}
                                    {agentPhone && (
                                        <p className="font-work-sans text-[#101323] font-bold text-xs sm:text-sm mt-2 lg:text-center">
                                            {agentPhone}
                                        </p>
                                    )}
                                </div>

                                {/* Contact Button */}
                                <button
                                    onClick={handleContactClick}
                                    className="hidden sm:block lg:w-full mt-0 lg:mt-6 py-2 sm:py-3 px-4 sm:px-6 bg-[#292E56] text-white font-work-sans font-semibold text-sm sm:text-base rounded-full hover:bg-[#292E56]/90 transition-colors"
                                >
                                    Contact
                                </button>
                            </div>
                            {/* Mobile Contact Button */}
                            <button
                                onClick={handleContactClick}
                                className="sm:hidden w-full mt-4 py-2.5 px-4 bg-[#292E56] text-white font-work-sans font-semibold text-sm rounded-full hover:bg-[#292E56]/90 transition-colors"
                            >
                                Contact the team
                            </button>
                        </div>

                        {/* Property Cards - Right Side */}
                        <div className="flex-1 w-full">
                            {hasComparisonData ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {comparisonItems.map((item, index) => (
                                        <div key={item.listingKey || item.property_listing_key || index} className="relative">
                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromCompare(item.listingKey || item.property_listing_key)}
                                                className="absolute -top-2 -right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                                title="Remove from compare"
                                            >
                                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <PropertyCardV5
                                                property={formatProperty(item)}
                                                size="default"
                                                showFavouriteButton={true}
                                                showCompareButton={false}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[250px] sm:h-[352px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 px-4">
                                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <h3 className="font-work-sans font-semibold text-gray-700 text-base sm:text-lg mb-2 text-center">
                                        No properties to compare
                                    </h3>
                                    <p className="font-work-sans text-gray-500 text-center text-sm sm:text-base max-w-sm">
                                        Add properties to compare by clicking the compare button on any property card.
                                    </p>
                                    <a
                                        href="/search"
                                        className="mt-4 px-5 sm:px-6 py-2 bg-[#292E56] text-white font-work-sans font-medium text-sm sm:text-base rounded-full hover:bg-[#292E56]/90 transition-colors"
                                    >
                                        Browse Properties
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Properties Detail Comparison Section - Only show if we have favourites */}
                    {hasComparisonData && (
                        <div className="mt-8 sm:mt-12">
                            {/* Mobile: Stacked layout, Desktop: Side by side */}
                            <div className="block lg:hidden">
                                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                                    <h2 className="font-space-grotesk font-bold text-[#293056] text-lg sm:text-xl mb-4 sm:mb-6">
                                        Properties detail
                                    </h2>
                                    {[
                                        'Instant Estimate',
                                        'Beds',
                                        'Bathrooms',
                                        'Area',
                                        'Parking',
                                        'Maintenance Fees',
                                        'Property Taxes',
                                        'Exposure'
                                    ].map((label, idx) => (
                                        <div key={label} className={`py-3 ${idx < 7 ? 'border-b border-dashed border-gray-200' : ''}`}>
                                            <p className="font-work-sans text-[#293056] text-sm font-medium mb-2">{label}</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {comparisonItems.map((item, index) => (
                                                    <div
                                                        key={item.listingKey || item.property_listing_key || index}
                                                        className="h-[36px] flex items-center justify-center bg-[#E8EBF5] rounded-lg font-work-sans text-[#293056] text-xs px-1 truncate"
                                                    >
                                                        {getPropertyValue(item, label)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Desktop: Side by side layout */}
                            <div className="hidden lg:flex gap-6 items-start">
                                {/* Left Card - Labels */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-8 flex-shrink-0 w-[280px]">
                                    <h2 className="font-space-grotesk font-bold text-[#293056] text-xl mb-8">
                                        Properties detail
                                    </h2>
                                    <div>
                                        {[
                                            'Instant Estimate',
                                            'Beds',
                                            'Bathrooms',
                                            'Area',
                                            'Parking',
                                            'Maintenance Fees',
                                            'Property Taxes',
                                            'Exposure'
                                        ].map((label, idx) => (
                                            <div
                                                key={label}
                                                className={`h-[54px] flex items-center font-work-sans text-[#293056] text-base ${idx < 7 ? 'border-b border-dashed border-gray-300' : ''}`}
                                            >
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Card - Property Values */}
                                <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-8">
                                    {/* Spacer for header alignment */}
                                    <div className="h-[36px] mb-8"></div>

                                    {/* Rows of values */}
                                    {[
                                        'Instant Estimate',
                                        'Beds',
                                        'Bathrooms',
                                        'Area',
                                        'Parking',
                                        'Maintenance Fees',
                                        'Property Taxes',
                                        'Exposure'
                                    ].map((key) => renderComparisonRow(key, getPropertyValue))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Building Detail Comparison Section - Only show if we have favourites */}
                    {hasComparisonData && (
                        <div className="mt-4 sm:mt-6">
                            {/* Mobile: Stacked layout */}
                            <div className="block lg:hidden">
                                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                                    <h2 className="font-space-grotesk font-bold text-[#293056] text-lg sm:text-xl mb-4 sm:mb-6">
                                        Building detail
                                    </h2>
                                    {[
                                        'Building age',
                                        'Avg Price/sqft',
                                        'Last year growth',
                                        'Amenities'
                                    ].map((label, idx) => (
                                        <div key={label} className={`py-3 ${idx < 3 ? 'border-b border-dashed border-gray-200' : ''}`}>
                                            <p className="font-work-sans text-[#293056] text-sm font-medium mb-2">{label}</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {comparisonItems.map((item, index) => (
                                                    <div
                                                        key={item.listingKey || item.property_listing_key || index}
                                                        className="h-[36px] flex items-center justify-center bg-[#E8EBF5] rounded-lg font-work-sans text-[#293056] text-xs px-1 truncate"
                                                    >
                                                        {getBuildingValue(item, label)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Desktop: Side by side layout */}
                            <div className="hidden lg:flex gap-6 items-start">
                                {/* Left Card - Labels */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-8 flex-shrink-0 w-[280px]">
                                    <h2 className="font-space-grotesk font-bold text-[#293056] text-xl mb-8">
                                        Building detail
                                    </h2>
                                    <div>
                                        {[
                                            'Building age',
                                            'Avg Price/sqft',
                                            'Last year growth',
                                            'Amenities'
                                        ].map((label, idx) => (
                                            <div
                                                key={label}
                                                className={`h-[54px] flex items-center font-work-sans text-[#293056] text-base ${idx < 3 ? 'border-b border-dashed border-gray-300' : ''}`}
                                            >
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Card - Building Values */}
                                <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-8">
                                    {/* Spacer for header alignment */}
                                    <div className="h-[36px] mb-8"></div>

                                    {/* Rows of values */}
                                    {[
                                        'Building age',
                                        'Avg Price/sqft',
                                        'Last year growth',
                                        'Amenities'
                                    ].map((key) => renderComparisonRow(key, getBuildingValue))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Neighbourhood Comparison Section - Only show if we have favourites */}
                    {hasComparisonData && (
                        <div className="mt-4 sm:mt-6">
                            {/* Mobile: Stacked layout */}
                            <div className="block lg:hidden">
                                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                                    <h2 className="font-space-grotesk font-bold text-[#293056] text-lg sm:text-xl mb-4 sm:mb-6">
                                        Neighbourhood
                                    </h2>
                                    {[
                                        'Name',
                                        'Avg Price/sqft',
                                        'Last year growth'
                                    ].map((label, idx) => (
                                        <div key={label} className={`py-3 ${idx < 2 ? 'border-b border-dashed border-gray-200' : ''}`}>
                                            <p className="font-work-sans text-[#293056] text-sm font-medium mb-2">{label}</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {comparisonItems.map((item, index) => (
                                                    <div
                                                        key={item.listingKey || item.property_listing_key || index}
                                                        className="h-[36px] flex items-center justify-center bg-[#E8EBF5] rounded-lg font-work-sans text-[#293056] text-xs px-1 truncate"
                                                    >
                                                        {getNeighbourhoodValue(item, label)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Desktop: Side by side layout */}
                            <div className="hidden lg:flex gap-6 items-start">
                                {/* Left Card - Labels */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-8 flex-shrink-0 w-[280px]">
                                    <h2 className="font-space-grotesk font-bold text-[#293056] text-xl mb-8">
                                        Neighbourhood
                                    </h2>
                                    <div>
                                        {[
                                            'Name',
                                            'Avg Price/sqft',
                                            'Last year growth'
                                        ].map((label, idx) => (
                                            <div
                                                key={label}
                                                className={`h-[54px] flex items-center font-work-sans text-[#293056] text-base ${idx < 2 ? 'border-b border-dashed border-gray-300' : ''}`}
                                            >
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Card - Neighbourhood Values */}
                                <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-8">
                                    {/* Spacer for header alignment */}
                                    <div className="h-[36px] mb-8"></div>

                                    {/* Rows of values */}
                                    {[
                                        'Name',
                                        'Avg Price/sqft',
                                        'Last year growth'
                                    ].map((key) => renderComparisonRow(key, getNeighbourhoodValue))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Your Saved Favourites - Show database favourites if logged in */}
                    {auth?.user && favourites.length > 0 && (
                        <div className="mt-8 sm:mt-12">
                            <h2 className="font-space-grotesk font-bold text-[#293056] text-xl sm:text-2xl mb-4 sm:mb-6">
                                Your Saved Favourites
                            </h2>
                            <p className="font-work-sans text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                                Click the compare button to add these to your comparison.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {favourites.slice(0, 8).map((favourite, index) => (
                                    <PropertyCardV5
                                        key={favourite.id || favourite.property_listing_key || `fav-${index}`}
                                        property={formatProperty(favourite)}
                                        size="default"
                                        showFavouriteButton={true}
                                        showCompareButton={true}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FAQ Section */}
                    <div className="mt-8 sm:mt-12 -mx-4 sm:mx-0">
                        <FAQ
                            title="Frequently Asked Questions"
                            faqItems={[
                                {
                                    id: 1,
                                    question: 'How do I add listings to compare?',
                                    answer: 'You can add listings to your favourites by clicking the heart icon on any property card. Once saved, they will automatically appear on this comparison page.'
                                },
                                {
                                    id: 2,
                                    question: 'How many properties can I compare at once?',
                                    answer: 'You can compare up to 3 properties side by side in the comparison table. Additional favourites will be shown below in the "More Saved Listings" section.'
                                },
                                {
                                    id: 3,
                                    question: 'What information is shown in the comparison?',
                                    answer: 'The comparison includes property details (price, beds, baths, area, parking, maintenance fees, taxes, exposure), building details (age, price per sqft, amenities), and neighbourhood information.'
                                },
                                {
                                    id: 4,
                                    question: 'Can I share my comparison with others?',
                                    answer: 'Yes! Click the "Share" button at the top of the page to share your comparison link. Note that others will need to log in to see your saved listings.'
                                }
                            ]}
                            showContainer={false}
                            className="max-w-full"
                        />
                    </div>

                    {/* Real Estate Links Section */}
                    <div className="mt-8 sm:mt-12 -mx-4 sm:mx-0">
                        <RealEstateLinksSection />
                    </div>
                </div>
            </div>

            {/* Contact Agent Modal */}
            <ContactAgentModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                agentData={agentData}
                propertyData={{
                    BuildingName: 'Compare Listings',
                    address: 'Multiple Properties'
                }}
                auth={auth}
                websiteSettings={{ website }}
            />

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                website={website}
            />

            {/* Share Success Notification */}
            {showShareSuccess && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000000] animate-fade-in">
                    <div className="bg-[#293056] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-work-sans font-medium text-sm">Link copied to clipboard!</span>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
