import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { formatPrice, formatAddress, getPropertyFeatures } from '@/Website/Utils/property-utils';
import axios from 'axios';

const PropertyCard = ({ property }) => {
  // Image loading states
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Format property data
  const price = formatPrice(property.ListPrice || property.price || 0, property.isRental);
  const bedrooms = property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0;
  const bathrooms = property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0;
  const sqft = property.LivingAreaRange || property.livingAreaRange || property.sqft || '';
  const parking = property.ParkingTotal || property.parkingTotal || property.parking || 0;
  const listingKey = property.ListingKey || property.listingKey || '';
  const propertyType = property.PropertySubType || property.propertyType || 'Property';
  const transactionType = property.TransactionType || property.transactionType || 'For Sale';
  const listOfficeName = property.ListOfficeName || property.listOfficeName || '';

  // Format address for display - street address only (no city/province)
  let displayAddress = '';

  // For buildings, use the address directly
  if (property.source === 'building') {
    displayAddress = property.address || property.name || 'Building Address';
  } else {
    // For properties, format as "Unit - StreetNumber StreetName" (no city/province)
    const unitNumber = property.UnitNumber || property.unitNumber || '';
    const streetNumber = property.StreetNumber || property.streetNumber || '';
    const streetName = property.StreetName || property.streetName || '';
    const streetSuffix = property.StreetSuffix || property.streetSuffix || '';

    // Build the simplified address exactly like the example: "1901 - 15 Mercer"
    if (unitNumber && streetNumber && streetName) {
      displayAddress = `${unitNumber} - ${streetNumber} ${streetName}`.trim();
    } else if (streetNumber && streetName) {
      displayAddress = `${streetNumber} ${streetName}`.trim();
    } else {
      // Fallback to unparsed address if components are missing
      const fallbackAddress = property.address || property.UnparsedAddress || property.unparsedAddress || '';
      // Try to extract just the street portion (before the first comma)
      if (fallbackAddress) {
        const parts = fallbackAddress.split(',');
        displayAddress = parts[0].trim();
      } else {
        displayAddress = 'Address not available';
      }
    }
  }

  // Get property image and convert HTTPS to HTTP for AMPRE images
  let imageUrl = property.MediaURL || property.imageUrl || property.image || '/images/no-image-placeholder.jpg';
  
  // Fix AMPRE SSL issues by converting HTTPS to HTTP
  if (imageUrl && imageUrl.includes('ampre.ca') && imageUrl.startsWith('https://')) {
    imageUrl = imageUrl.replace('https://', 'http://');
  }

  // Build property URL - use the simple redirect route that only needs listing key
  // The backend will handle the redirect to the proper SEO-friendly URL
  const propertyUrl = `/property/${listingKey}`;

  // Format transaction type for badge
  const statusBadgeText = transactionType === 'For Lease' ? 'For Rent' : transactionType;

  // Format sqft display
  const sqftDisplay = sqft ? (typeof sqft === 'string' ? sqft : `${sqft} sqft`) : '';

  // Handle property card click - trigger AI generation in background immediately
  const handlePropertyClick = (e) => {
    const mlsId = listingKey;

    if (mlsId) {
      console.log('🤖 PropertyCard clicked - Triggering immediate AI generation for:', mlsId);

      // Fire and forget - start AI generation immediately without waiting
      axios.post('/api/property-ai/generate-description', {
        mls_id: mlsId,
        force_regenerate: false
      }).catch(() => {
        // Silently handle errors to avoid blocking navigation
      });
    }
    // Navigation continues immediately without any delays
  };

  return (
    <div className="flex flex-col w-[300px] min-h-0 idx-ampre-property-card bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative">
      <Link href={propertyUrl} className="flex flex-col h-full text-inherit no-underline" onClick={handlePropertyClick}>
        {/* Image Container */}
        <div className="relative w-full h-[200px] property-image-container overflow-hidden bg-gray-100 rounded-t-xl">
          <div className="relative overflow-hidden w-full h-full property-image lazy-property-image transition-transform duration-300 group-hover:scale-105">
            {/* Loading State - Enhanced IDX-AMPRE style */}
            {imageLoading && !imageError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-2">
                  {/* Skeleton loading animation */}
                  <div className="w-full h-full absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse"></div>
                  {/* Loading spinner */}
                  <div className="relative z-10 w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="relative z-10 text-xs text-gray-600 font-medium">Loading image...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {imageError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">Image unavailable</span>
                </div>
              </div>
            )}

            <img
              src={imageUrl}
              alt={`${propertyType} in ${displayAddress}`}
              className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                imageLoading ? 'opacity-50 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'
              }`}
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
              onError={(e) => {
                // Try HTTP version if HTTPS fails for AMPRE images
                if (e.target.src.includes('ampre.ca') && e.target.src.startsWith('https://')) {
                  e.target.src = e.target.src.replace('https://', 'http://');
                } else if (!imageError) {
                  // Set error state and try fallback
                  setImageError(true);
                  setImageLoading(false);
                  e.target.src = '/images/no-image-placeholder.jpg';
                }
              }}
            />

            {/* Success indicator */}
            {!imageLoading && !imageError && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full opacity-75 animate-pulse"></div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 animate-fade-in"></div>
          </div>

          {/* Badges */}
          <div className="absolute inset-2 flex flex-col justify-between">
            <div className="flex justify-between items-center gap-2.5 h-8">
              <span className="flex items-center justify-center px-3 py-1.5 text-sm property-badge h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 status-badge">
                {statusBadgeText}
              </span>
              <span className="flex items-center justify-center px-3 py-1.5 text-sm property-badge h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200">
                {propertyType}
              </span>
            </div>
            <div className="flex justify-end items-center gap-2.5 h-8"></div>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex flex-col flex-grow items-start p-4 gap-2.5 box-border">
          {/* Price */}
          <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]">
            {price}
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            {/* Address */}
            <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056] line-clamp-2">
              {displayAddress}
            </div>

            {/* Features */}
            <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-6 tracking-tight text-[#293056]">
              {bedrooms}BD | {bathrooms}BA{sqftDisplay ? ` | ${sqftDisplay}` : ''}
            </div>

            {/* Brokerage */}
            {listOfficeName && (
              <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-600">
                {listOfficeName}
              </div>
            )}

            {/* MLS Number */}
            {listingKey && (
              <div className="flex items-center justify-start w-full min-h-8">
                <div className="font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]">
                  MLS#: {listingKey}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;