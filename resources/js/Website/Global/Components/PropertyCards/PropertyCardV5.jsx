import React, { useState } from 'react';
import PluginStyleImageLoader from '@/Components/PluginStyleImageLoader';
import { generatePropertyUrl } from '@/utils/propertyUrl';

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

  // Build features display (same as CardV1)
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

  const formattedPrice = property.formatted_price || formatPrice(property.price, property.isRental);
  const features = buildFeatures(property.bedrooms, property.bathrooms);
  const detailsUrl = generatePropertyUrl(property);

  // Size configurations - Optimized for IDX-AMPRE style 4 cards per row
  const sizeConfig = {
    default: {
      container: 'w-full h-[420px] idx-ampre-property-card',
      image: 'h-[200px] property-image-container',
      content: 'p-4 gap-2.5 h-[220px]',
      chip: 'px-3 py-1.5 text-sm property-badge',
      title: 'text-lg',
      details: 'text-base'
    },
    mobile: {
      container: 'w-full h-[450px] idx-ampre-property-card',
      image: 'h-60 property-image-container',
      content: 'p-3 gap-2 h-44',
      chip: 'px-2 py-1 text-xs property-badge',
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
    <div className={`flex-none ${config.container} bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group ${className} relative`}>
      <a 
        href={detailsUrl} 
        className="block h-full text-inherit no-underline"
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
          
          {/* IDX-AMPRE Style Filter Chips and Action Buttons */}
          <div className="absolute inset-2 flex flex-col justify-between">
            {/* Top row - Sale and Price chips - IDX-AMPRE style */}
            <div className="flex justify-between items-center gap-2.5 h-8">
              <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 status-badge`}>
                {property.transactionType || (property.isRental ? 'Rent' : 'Sale')}
              </span>
              <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200`}>
                {formattedPrice}
              </span>
            </div>
            
            {/* Bottom row - Compare and Request buttons - IDX-AMPRE style */}
            <div className="flex justify-between items-center gap-2.5 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
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
                className="property-action-btn flex items-center justify-center px-3 py-1.5 h-8 rounded-full font-bold tracking-tight whitespace-nowrap"
                aria-label={`Add ${property.address} to compare`}
              >
                Compare
              </button>
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
                className="property-action-btn flex items-center justify-center px-3 py-1.5 h-8 rounded-full font-bold tracking-tight whitespace-nowrap"
                aria-label={`Request viewing for ${property.address}`}
              >
                Request
              </button>
            </div>
          </div>
        </div>
        
        {/* Card Content - IDX-AMPRE Enhanced */}
        <div className={`flex flex-col items-start ${config.content} box-border`}>
          {/* Property Type Title */}
          <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold ${config.title} leading-7 tracking-tight text-[#293056]`}>
            {property.propertyType || 'Residential'}
          </div>
          
          {/* Property Details */}
          <div className="flex flex-col items-start gap-2 w-full flex-1">
            {/* Address */}
            <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056] line-clamp-2`}>
              {property.address}
            </div>
            
            {/* Features */}
            {features && (
              <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`}>
                {features}
              </div>
            )}
            
            {/* MLS Number */}
            <div className="flex items-center justify-start w-full min-h-8">
              <div className={`font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`}>
                {property.source === 'mls' ? `MLS#: ${property.listingKey}` : `ID: ${property.listingKey}`}
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default PropertyCardV5;