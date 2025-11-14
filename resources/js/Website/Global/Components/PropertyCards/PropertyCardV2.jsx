import React from 'react';
import PropertyImageLoader from '@/Website/Components/PropertyImageLoader';
import { generatePropertyUrl } from '@/utils/propertyUrl';
import { 
  formatCardAddress, 
  buildCardFeatures, 
  getBrokerageName 
} from '@/utils/propertyFormatters';

/**
 * PropertyCardV2 - For Rent Properties
 * 
 * A reusable property card component designed for rental properties.
 * Features white background with white rent/price chips and overlay action buttons.
 * 
 * @param {Object} property - Property data object
 * @param {string} size - Card size ('default', 'mobile') - default: 'default'
 * @param {Function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 */
const PropertyCardV2 = ({ 
  property, 
  size = 'default',
  onClick,
  className = '' 
}) => {
  // Format price function
  const formatPrice = (price, isRental = false) => {
    if (!price || price <= 0) return 'Price on request';

    let formattedPrice = '$' + price.toLocaleString();

    if (isRental) {
      formattedPrice += '/mo';
    }

    return formattedPrice;
  };

  // Build features display
  const buildFeatures = (bedrooms, bathrooms) => {
    const features = [];
    if (bedrooms > 0) {
      features.push(bedrooms + ' Bed' + (bedrooms > 1 ? 's' : ''));
    }
    if (bathrooms > 0) {
      features.push(bathrooms + ' Bath' + (bathrooms > 1 ? 's' : ''));
    }
    return features.join(' | ');
  };

  const formattedPrice = formatPrice(property.price, property.isRental);
  const displayAddress = formatCardAddress(property);
  const features = buildCardFeatures(property);
  const brokerageName = getBrokerageName(property);
  const detailsUrl = generatePropertyUrl(property);

  // Size configurations
  const sizeConfig = {
    default: {
      container: 'w-[360px] h-[500px]',
      image: 'h-[275px]',
      content: 'p-4 gap-2.5 h-[225px]',
      chip: 'px-4 py-1.5 text-sm',
      title: 'text-lg',
      details: 'text-base'
    },
    mobile: {
      container: 'w-80 h-[450px]',
      image: 'h-60',
      content: 'p-3 gap-2 h-44',
      chip: 'px-2 py-1 text-xs',
      title: 'text-lg',
      details: 'text-sm'
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
    <div className={`flex-none ${config.container} bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-200 -translate-y-0.5 hover:-translate-y-0.10 shadow-xl hover:shadow-2xl group ${className}`}>
      <a 
        href={detailsUrl} 
        className="block h-full text-inherit no-underline"
        onClick={handleClick}
      >
        {/* Card Image - Now uses real MLS images */}
        <div className={`relative w-full ${config.image} overflow-hidden bg-gray-100 rounded-t-xl`}>
          {property.image ? (
            // Use pre-fetched image from API if available
            <img
              src={property.image}
              alt={`${property.propertyType || 'Property'} in ${property.address}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            // Fallback to PropertyImageLoader for dynamic loading
            <PropertyImageLoader
              listingKey={property.listingKey}
              alt={`${property.propertyType || 'Property'} in ${property.address}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              enableLazyLoading={true}
            />
          )}
          
          {/* Filter Chips and Action Buttons */}
          <div className="absolute inset-2 flex flex-col justify-between">
            {/* Top row - Rent and Price chips */}
            <div className="flex justify-between items-center gap-2.5 h-8">
              <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200`}>
                Rent
              </span>
              <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200`}>
                {formattedPrice}
              </span>
            </div>
            
            {/* Bottom row - Request button only (Compare hidden for next phase) */}
            <div className="flex justify-end items-center gap-2.5 h-8">
              {/* Compare Button - Hidden for next phase */}
              {/* <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle compare functionality
                  if (window.addToCompare) {
                    window.addToCompare(property);
                  } else {
                    alert(`Added ${property.address} to compare`);
                  }
                }}
                className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 hover:bg-gray-50 transition-colors duration-200`}
                aria-label={`Add ${property.address} to compare`}
              >
                Compare
              </button> */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle request viewing
                  if (window.openViewingModal) {
                    window.openViewingModal(property);
                  } else {
                    alert(`Request a viewing for ${property.address}`);
                  }
                }}
                className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 hover:bg-gray-50 transition-colors duration-200`}
                aria-label={`Request viewing for ${property.address}`}
              >
                Request
              </button>
            </div>
          </div>
        </div>
        
        {/* Card Content */}
        <div className={`flex flex-col items-start ${config.content} box-border`}>
          {/* Property Type Title */}
          <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold ${config.title} leading-7 tracking-tight text-[#293056]`}>
            {property.propertyType}
          </div>
          
          {/* Property Details */}
          <div className="flex flex-col items-start gap-2 w-full flex-1">
            {/* Address */}
            <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`}>
              {displayAddress}
            </div>
            
            {/* Features */}
            {features && (
              <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`}>
                {features}
              </div>
            )}
            
            {/* Brokerage Name */}
            {brokerageName && (
              <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-600`}>
                {brokerageName}
              </div>
            )}
            
            {/* MLS Number */}
            <div className="flex items-center justify-start w-full min-h-8">
              <div className={`font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`}>
                MLS#: {property.listingKey}
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default PropertyCardV2;