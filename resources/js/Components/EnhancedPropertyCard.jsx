import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { formatPrice, formatAddress, getPropertyFeatures } from '@/Website/Utils/property-utils';
import imageOptimizationService from '@/services/ImageOptimizationService';

const EnhancedPropertyCard = ({ property, onImageLoad, onImageError }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const imgRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

  // Format address for display
  let displayAddress = '';

  if (property.source === 'building') {
    displayAddress = property.address || property.name || 'Building Address';
  } else {
    const unitNumber = property.UnitNumber || property.unitNumber || '';
    const streetNumber = property.StreetNumber || property.streetNumber || '';
    const streetName = property.StreetName || property.streetName || '';
    const streetSuffix = property.StreetSuffix || property.streetSuffix || '';

    if (unitNumber && (streetNumber || streetName)) {
      displayAddress = `${unitNumber} - ${streetNumber} ${streetName}`.trim();
    } else if (streetNumber || streetName) {
      displayAddress = `${streetNumber} ${streetName}`.trim();
    } else {
      const fallbackAddress = property.address || property.UnparsedAddress || property.unparsedAddress || '';
      if (fallbackAddress) {
        const parts = fallbackAddress.split(',');
        displayAddress = parts[0].trim();
      } else {
        displayAddress = 'Address not available';
      }
    }
  }

  // Get property image with fallbacks
  const getImageUrl = () => {
    return property.MediaURL || property.imageUrl || property.image || null;
  };

  // Default and placeholder images
  const placeholderImage = '/images/no-image-placeholder.jpg';
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjRDFENURCIi8+CjxwYXRoIGQ9Ik0xMzcuNSA5NEMxMzcuNSA5Ny4wMzc2IDEzNC43ODggMTAwIDEzMS4yNSAxMDBDMTI3LjcxMiAxMDAgMTI1IDk3LjAzNzYgMTI1IDk0QzEyNSA5MC45NjI0IDEyNy43MTIgODggMTMxLjI1IDg4QzEzNC43ODggODggMTM3LjUgOTAuOTYyNCAxMzcuNSA5NFoiIGZpbGw9IiNEMUQ1REIiLz4KPHA+Tm8gSW1hZ2U8L3A+Cjwvc3ZnPgo=';

  // Load image with timeout and error handling
  useEffect(() => {
    const imageUrl = getImageUrl();
    
    if (!imageUrl) {
      setImageError(true);
      setImageLoaded(true);
      return;
    }

    // Check if image is already cached
    if (imageOptimizationService.isImageCached(imageUrl)) {
      setCurrentImageUrl(imageUrl);
      setImageLoaded(true);
      setImageError(false);
      if (onImageLoad) onImageLoad(listingKey);
      return;
    }

    // Check if image previously failed
    if (imageOptimizationService.hasImageFailed(imageUrl)) {
      setImageError(true);
      setImageLoaded(true);
      if (onImageError) onImageError(listingKey);
      return;
    }

    // Reset states
    setImageLoaded(false);
    setImageError(false);
    setCurrentImageUrl(null);

    // Preload image with timeout
    imageOptimizationService.preloadImage(imageUrl, 6000)
      .then(() => {
        if (!mountedRef.current) return;
        setCurrentImageUrl(imageUrl);
        setImageLoaded(true);
        setImageError(false);
        if (onImageLoad) onImageLoad(listingKey);
      })
      .catch((error) => {
        if (!mountedRef.current) return;
        console.warn(`Failed to load image for property ${listingKey}:`, error.message);
        setImageError(true);
        setImageLoaded(true);
        if (onImageError) onImageError(listingKey);
      });
  }, [property.imageUrl, property.MediaURL, property.image, listingKey, onImageLoad, onImageError]);

  // Build property URL
  const propertyUrl = `/property/${listingKey}`;

  // Format transaction type for badge
  const statusBadgeText = transactionType === 'For Lease' ? 'For Rent' : transactionType;

  // Format sqft display
  const sqftDisplay = sqft ? (typeof sqft === 'string' ? sqft : `${sqft} sqft`) : '';

  return (
    <div className="flex flex-col w-[300px] min-h-0 idx-ampre-property-card bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative">
      <Link href={propertyUrl} className="flex flex-col h-full text-inherit no-underline">
        {/* Image Container */}
        <div className="relative w-full h-[200px] property-image-container overflow-hidden bg-gray-100 rounded-t-xl">
          {/* Loading State */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#293056]"></div>
            </div>
          )}

          {/* Image */}
          <div className={`relative overflow-hidden w-full h-full property-image lazy-property-image transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}>
            {currentImageUrl && !imageError ? (
              <img
                ref={imgRef}
                src={currentImageUrl}
                alt={`${propertyType} in ${displayAddress}`}
                className="w-full h-full object-cover transition-all duration-300"
                style={{ filter: 'blur(0px)' }}
                onLoad={() => {
                  if (!imageLoaded) {
                    setImageLoaded(true);
                    setImageError(false);
                    if (onImageLoad) onImageLoad(listingKey);
                  }
                }}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                  if (onImageError) onImageError(listingKey);
                }}
              />
            ) : (
              // Fallback/Error image
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 mt-1">No Image</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
              {bedrooms}BD | {bathrooms}BA{sqftDisplay ? ` | ${sqftDisplay}` : ''}{parking ? ` | ${parking} Parking` : ''}
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

export default EnhancedPropertyCard;