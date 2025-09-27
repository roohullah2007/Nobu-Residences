import React from 'react';
import PluginStyleImageLoader from '@/Website/Components/PluginStyleImageLoader';
import { generatePropertyUrl } from '@/utils/propertyUrl';
import { createSEOBuildingUrl } from '@/utils/slug';
import { 
  formatCardAddress, 
  buildCardFeatures, 
  getBrokerageName 
} from '@/utils/propertyFormatters';

/**
 * PropertyCardV5 - Enhanced for Search Page with IDX-AMPRE Style
 * 
 * Features:
 * - 4 cards per row in grid view
 * - IDX-AMPRE style loading and animations
 * - Enhanced image loading with fallbacks
 * - Interactive hover effects
 * - Compare and Request buttons
 * 
 * @param {Object} property - Property data object
 * @param {string} size - Card size ('default', 'mobile') - default: 'default'
 * @param {Function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 */
const PropertyCardV5 = ({ 
  property, 
  size = 'default',
  onClick,
  className = '' 
}) => {
  
  // Format price function (same as CardV1)
  const formatPrice = (price, isRental = false) => {
    if (!price || price <= 0) return 'Price on request';
    
    let formattedPrice = '';
    if (price >= 1000000) {
      formattedPrice = '$' + (price / 1000000).toFixed(1) + 'M';
    } else if (price >= 1000) {
      formattedPrice = '$' + Math.round(price / 1000) + 'K';
    } else {
      formattedPrice = '$' + price.toLocaleString();
    }
    
    if (isRental) {
      formattedPrice += '/mo';
    }
    
    return formattedPrice;
  };

  // Check if we have real MLS data vs dummy data (same as CardV1)
  const isRealMLSData = property.source === 'mls' || 
                       (property.listingKey && property.listingKey.length > 10);

  const formattedPrice = property.formatted_price || formatPrice(property.price, property.isRental);
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
                    // Check MlsStatus first (most reliable for Sold/Leased)
                    const mlsStatusLower = property.MlsStatus ? property.MlsStatus.toLowerCase() : '';
                    if (mlsStatusLower === 'sold') {
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
              
              {/* Request button removed - keeping empty div for layout consistency */}
              <div className="flex justify-end items-center gap-2.5 h-8">
                {/* Request and Compare buttons removed as requested */}
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
            
            {/* Features or Building Stats - Only show if exists */}
            {(features || (property.source === 'building' && (property.total_units || property.total_floors))) && (
              <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-[#293056]`}>
                {property.source === 'building' 
                  ? `${property.total_units || 0} Units | ${property.total_floors || 0} Floors`
                  : features}
              </div>
            )}
            
            {/* Brokerage Name - Only show if exists */}
            {brokerageName && (
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