import React, { useState, useEffect } from 'react';
import PluginStyleImageLoader from '@/Website/Components/PluginStyleImageLoader';
import { generatePropertyUrl } from '@/utils/propertyUrl';
import { createSEOBuildingUrl } from '@/utils/slug';
import {
  formatCardAddress,
  buildCardFeatures,
  getBrokerageName
} from '@/utils/propertyFormatters';
import { usePage } from '@inertiajs/react';

/**
 * PropertyCardV5 - Enhanced for Search Page with IDX-AMPRE Style
 *
 * Features:
 * - 4 cards per row in grid view
 * - IDX-AMPRE style loading and animations
 * - Enhanced image loading with fallbacks
 * - Interactive hover effects
 * - Heart button for favourites
 *
 * @param {Object} property - Property data object
 * @param {string} size - Card size ('default', 'mobile') - default: 'default'
 * @param {Function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 * @param {boolean} showFavouriteButton - Whether to show favourite button (default: true)
 * @param {Function} onFavouriteChange - Optional callback when favourite status changes
 */
const PropertyCardV5 = ({
  property,
  size = 'default',
  onClick,
  className = '',
  showFavouriteButton = true,
  onFavouriteChange
}) => {
  const { auth } = usePage().props;
  const [isFavourited, setIsFavourited] = useState(false);
  const [isLoadingFavourite, setIsLoadingFavourite] = useState(false);

  const listingKey = property?.listingKey || property?.ListingKey || property?.id;
  const isAuthenticated = auth?.user ? true : false;

  // Check favourite status on mount
  useEffect(() => {
    if (isAuthenticated && listingKey && showFavouriteButton && property.source !== 'building') {
      checkFavouriteStatus();
    }
  }, [isAuthenticated, listingKey]);

  const checkFavouriteStatus = async () => {
    if (!listingKey) return;

    try {
      const response = await fetch('/api/favourites/properties/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          property_listing_key: listingKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavourited(data.is_favourited || false);
      }
    } catch (error) {
      console.error('Error checking favourite status:', error);
    }
  };

  const toggleFavourite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    if (!listingKey || isLoadingFavourite) return;

    setIsLoadingFavourite(true);

    try {
      // Prepare property data for storage
      const propertyData = {
        listingKey: listingKey,
        ListingKey: listingKey,
        id: listingKey,
        MediaURL: property?.MediaURL || property?.imageUrl,
        imageUrl: property?.imageUrl || property?.MediaURL,
        images: property?.images || property?.Images || [],
        ListPrice: property?.price || property?.ListPrice,
        price: property?.price || property?.ListPrice,
        address: property?.address || property?.Address || property?.UnparsedAddress,
        StreetNumber: property?.StreetNumber,
        StreetName: property?.StreetName,
        StreetSuffix: property?.StreetSuffix,
        UnitNumber: property?.UnitNumber,
        City: property?.city || property?.City,
        StateOrProvince: property?.province || property?.StateOrProvince || 'ON',
        PostalCode: property?.PostalCode,
        PropertyType: property?.propertyType || property?.PropertyType,
        PropertySubType: property?.PropertySubType || property?.propertyType,
        TransactionType: property?.TransactionType || 'For Sale',
        StandardStatus: property?.StandardStatus || 'Active',
        MlsStatus: property?.MlsStatus,
        BedroomsTotal: property?.bedrooms || property?.BedroomsTotal,
        BathroomsTotalInteger: property?.bathrooms || property?.BathroomsTotalInteger,
        LivingAreaRange: property?.area || property?.LivingAreaRange,
        ...property
      };

      const response = await fetch('/api/favourites/properties/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          property_listing_key: listingKey,
          property_data: propertyData,
          property_address: propertyData.address,
          property_price: propertyData.price,
          property_type: propertyData.PropertySubType || propertyData.PropertyType,
          property_city: propertyData.City,
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsFavourited(data.is_favourited);

        // Show notification
        showFavouriteNotification(data.message, data.action);

        // Call callback if provided
        if (onFavouriteChange) {
          onFavouriteChange(data.is_favourited, listingKey);
        }
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
    } finally {
      setIsLoadingFavourite(false);
    }
  };

  const showFavouriteNotification = (message, action) => {
    const notification = document.createElement('div');
    const isAdded = action === 'added';

    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${isAdded ? '❤️' : '💔'}</span>
        <span>${message}</span>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isAdded ? '#DC2626' : '#6B7280'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;

    if (!document.getElementById('favourite-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'favourite-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  // Determine if property is rental based on multiple fields
  const isRentalProperty = property.isRental ||
    property.TransactionType === 'For Lease' ||
    property.TransactionType === 'For Rent' ||
    property.transactionType === 'For Lease' ||
    property.transactionType === 'For Rent';

  // Format price function (same as CardV1)
  const formatPrice = (price, isRental = false) => {
    if (!price || price <= 0) return 'Price on request';

    let formattedPrice = '$' + price.toLocaleString();

    if (isRental) {
      formattedPrice += '/mo';
    }

    return formattedPrice;
  };

  // Check if we have real MLS data vs dummy data (same as CardV1)
  const isRealMLSData = property.source === 'mls' ||
                       (property.listingKey && property.listingKey.length > 10);

  // Always format price with rental check, ignore pre-formatted price to ensure /mo is added
  const formattedPrice = formatPrice(property.price || property.ListPrice, isRentalProperty);
  const displayAddress = formatCardAddress(property);
  const features = buildCardFeatures(property);
  const brokerageName = getBrokerageName(property);
  // Use building URL for buildings, property URL for properties
  const detailsUrl = property.source === 'building'
    ? createSEOBuildingUrl(property)
    : generatePropertyUrl(property);

  // Count the number of content sections to determine if we need minimum height
  const contentSections = [
    property.source === 'building' ? (property.name || property.propertyType || 'Building') : (property.propertyType || 'Residential'),
    displayAddress,
    features,
    brokerageName,
    property.source !== 'building' ? (property.source === 'mls' ? `MLS#: ${property.listingKey}` : `ID: ${property.listingKey}`) : null
  ].filter(Boolean);

  // Dynamic height calculation based on content
  // Only apply minimum height if we have minimal content
  const hasMinimalContent = contentSections.length <= 3;
  const dynamicMinHeight = hasMinimalContent ? 'min-h-[380px]' : 'min-h-0';

  // Size configurations - Updated with dynamic height
  const sizeConfig = {
    default: {
      container: `w-full md:w-[300px] ${dynamicMinHeight}`,
      image: 'h-[200px] property-image-container',
      content: 'p-4 gap-2.5',
      chip: 'px-3 py-1.5 text-sm property-badge',
      title: 'text-lg',
      details: 'text-base'
    },
    mobile: {
      container: `w-full md:w-[280px] ${dynamicMinHeight}`,
      image: 'h-[200px] property-image-container',
      content: 'p-3 gap-2',
      chip: 'px-2 py-1 text-xs property-badge',
      title: 'text-lg',
      details: 'text-sm'
    },
    grid: {
      container: `w-[372px] md:w-[300px] ${dynamicMinHeight}`,
      image: 'h-[200px] property-image-container',
      content: 'p-4 gap-2.5',
      chip: 'px-3 py-1.5 text-sm property-badge',
      title: 'text-lg',
      details: 'text-base'
    }
  };

  const config = sizeConfig[size];

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(property);
    }
  };

  return (
    <div className={`flex flex-col ${config.container} bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group ${className} relative`}>
      <a
        href={detailsUrl}
        className="flex flex-col h-full text-inherit no-underline"
        onClick={handleClick}
      >
        {/* Card Image - Enhanced with IDX-AMPRE Loading */}
        <div className={`relative w-full ${config.image} overflow-hidden bg-gray-100 rounded-t-xl`}>
          <PluginStyleImageLoader
            src={property.imageUrl}
            alt={`${property.propertyType || 'Property'} in ${property.address}`}
            className="w-full h-full property-image lazy-property-image transition-transform duration-300 group-hover:scale-105"
            enableLazyLoading={true}
            rootMargin="200px"
            threshold={0.01}
            enableBlurEffect={true}
            priority="normal"
            data-listing-key={property.listingKey}
          />

          {/* IDX-AMPRE Style Filter Chips and Action Buttons - Hide for Buildings */}
          {property.source !== 'building' && (
            <div className="absolute inset-2 flex flex-col justify-between">
              {/* Top row - Sale and Property Type chips - Swapped positions */}
              <div className="flex justify-between items-center gap-2.5 h-8">
                <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 status-badge`}>
                  {/* Priority: MlsStatus for Sold/Leased, then formatted_status, then TransactionType */}
                  {(() => {
                    // Helper function to calculate days since sold
                    const getDaysSinceSold = (soldDate) => {
                      if (!soldDate) return null;
                      try {
                        const sold = new Date(soldDate);
                        const now = new Date();
                        const diffTime = Math.abs(now - sold);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays;
                      } catch (e) {
                        return null;
                      }
                    };

                    // Check MlsStatus first (most reliable for Sold/Leased)
                    const mlsStatusLower = property.MlsStatus ? property.MlsStatus.toLowerCase() : '';
                    if (mlsStatusLower === 'sold') {
                      const daysSince = getDaysSinceSold(property.soldDate);
                      if (daysSince !== null) {
                        if (daysSince === 0) return 'Sold Today';
                        if (daysSince === 1) return 'Sold Yesterday';
                        return `Sold ${daysSince}d ago`;
                      }
                      return 'Sold';
                    }
                    if (mlsStatusLower === 'leased' || mlsStatusLower === 'rented' || mlsStatusLower === 'lease') {
                      return 'Leased';
                    }

                    // Check StandardStatus
                    const standardStatusLower = property.StandardStatus ? property.StandardStatus.toLowerCase() : '';
                    if (property.StandardStatus === 'Closed') {
                      // Closed with For Lease transaction = Leased, otherwise Sold
                      if (property.TransactionType === 'For Lease' || property.TransactionType === 'For Rent') {
                        return 'Leased';
                      }
                      const daysSince = getDaysSinceSold(property.soldDate);
                      if (daysSince !== null) {
                        if (daysSince === 0) return 'Sold Today';
                        if (daysSince === 1) return 'Sold Yesterday';
                        return `Sold ${daysSince}d ago`;
                      }
                      return 'Sold';
                    }
                    if (standardStatusLower === 'leased' || standardStatusLower === 'rented' || standardStatusLower === 'lease') {
                      return 'Leased';
                    }
                    if (property.StandardStatus === 'Off Market' &&
                        (property.TransactionType === 'For Lease' || property.TransactionType === 'For Rent')) {
                      return 'Leased';
                    }

                    // Use formatted_status from backend if available
                    if (property.formatted_status) {
                      return property.formatted_status;
                    }

                    // Fallback to TransactionType for active listings
                    return property.TransactionType || (property.isRental ? 'For Rent' : 'For Sale');
                  })()}
                </span>
                <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200`}>
                  {property.PropertySubType || property.propertyType || 'Residential'}
                </span>
              </div>

              {/* Bottom row - Heart button */}
              <div className="flex justify-end items-center gap-2.5 h-8">
                {showFavouriteButton && property.source !== 'building' && (
                  <button
                    onClick={toggleFavourite}
                    disabled={isLoadingFavourite}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
                      isFavourited
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-white/90 hover:bg-white backdrop-blur-sm'
                    } ${isLoadingFavourite ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    {isLoadingFavourite ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        className={`w-5 h-5 transition-colors ${isFavourited ? 'text-white' : 'text-red-500'}`}
                        fill={isFavourited ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card Content - Dynamic layout based on content amount */}
        <div className={`flex flex-col flex-grow items-start ${config.content} box-border`}>
          {/* Building Name or Price - Conditional display */}
          <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold ${config.title} leading-7 tracking-tight text-[#293056]`}>
            {property.source === 'building' ? (property.name || 'Building') : formattedPrice}
          </div>

          {/* Property Details - Compact layout without excessive spacing */}
          <div className="flex flex-col items-start gap-2 w-full">
            {/* Address */}
            <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056] line-clamp-2`}>
              {displayAddress}
            </div>

            {/* Developer/Builder Name for Buildings */}
            {property.source === 'building' && property.developer && (
              <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-gray-600`}>
                <span className="text-gray-500">By</span>&nbsp;<span className="text-[#293056] font-medium">{property.developer}</span>
              </div>
            )}

            {/* Features or Building Stats - Only show if exists */}
            {property.source === 'building' ? (
              /* Building Stats - Units, Floors, Year Built */
              (property.totalUnits || property.floors || property.sqft) && (
                <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-[#293056]`}>
                  {[
                    property.totalUnits ? `${property.totalUnits} Units` : null,
                    property.floors ? `${property.floors} Floors` : null,
                    property.sqft ? property.sqft : null
                  ].filter(Boolean).join(' | ')}
                </div>
              )
            ) : (
              /* Property Features - Beds, Baths, etc */
              features && (
                <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-[#293056]`}>
                  {features}
                </div>
              )
            )}

            {/* Brokerage Name - Only show for properties, not buildings */}
            {property.source !== 'building' && brokerageName && (
              <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-600`}>
                {brokerageName}
              </div>
            )}

            {/* MLS Number - Hide for buildings, only show if exists */}
            {property.source !== 'building' && property.listingKey && (
              <div className="flex items-center justify-start w-full min-h-8">
                <div className={`font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`}>
                  {property.source === 'mls' ? `MLS#: ${property.listingKey}` : `ID: ${property.listingKey}`}
                </div>
              </div>
            )}
          </div>
        </div>
      </a>
    </div>
  );
};

export default PropertyCardV5;
