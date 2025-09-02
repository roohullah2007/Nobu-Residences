import React, { useState } from 'react';
import PluginStyleImageLoader from '@/Components/PluginStyleImageLoader';
import { generatePropertyUrl } from '@/utils/propertyUrl';
import RequestTourModal from '@/Components/RequestTourModal';
import usePropertyFavourite from '@/hooks/usePropertyFavourite';
import { Heart } from '@/Website/Components/Icons';
import { Link } from '@inertiajs/react';
import { 
  formatCardAddress, 
  buildCardFeatures, 
  getBrokerageName 
} from '@/utils/propertyFormatters';

/**
 * PropertyCardV6 - Enhanced with Favourite Functionality
 * 
 * Features:
 * - All PropertyCardV5 features
 * - Integrated favourite functionality
 * - Authentication prompts for non-logged users
 * - Real-time favourite status updates
 * - Enhanced UX with loading states
 * 
 * @param {Object} property - Property data object
 * @param {Object} auth - Auth object from Inertia
 * @param {string} size - Card size ('default', 'mobile') - default: 'default'
 * @param {Function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 */
const PropertyCardV6 = ({ 
  property, 
  auth,
  size = 'default',
  onClick,
  className = '',
  showFavourite = true // Default to showing favourite icon
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  // Use the favourite hook
  const { isFavourited, toggleFavourite, isLoading: favouriteLoading, isAuthenticated } = usePropertyFavourite(property, auth);
  
  // Format price function (same as CardV5)
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

  // Check if we have real MLS data vs dummy data
  const isRealMLSData = property.source === 'mls' || 
                       (property.listingKey && property.listingKey.length > 10);

  const formattedPrice = property.formatted_price || formatPrice(property.price, property.isRental);
  const displayAddress = formatCardAddress(property);
  const features = buildCardFeatures(property);
  const brokerageName = getBrokerageName(property);
  const detailsUrl = generatePropertyUrl(property);

  // Size configurations - Optimized for IDX-AMPRE style 4 cards per row
  const sizeConfig = {
    default: {
      container: 'w-[360px] h-[420px] idx-ampre-property-card',
      image: 'h-[200px] property-image-container',
      content: 'p-4 gap-2.5 h-[220px]',
      chip: 'px-3 py-1.5 text-sm property-badge',
      title: 'text-lg',
      details: 'text-base'
    },
    mobile: {
      container: 'w-[320px] h-[450px] idx-ampre-property-card',
      image: 'h-60 property-image-container',
      content: 'p-3 gap-2 h-44',
      chip: 'px-2 py-1 text-xs property-badge',
      title: 'text-lg',
      details: 'text-sm'
    },
    grid: {
      container: 'w-full h-[420px] idx-ampre-property-card',
      image: 'h-[200px] property-image-container',
      content: 'p-4 gap-2.5 h-[220px]',
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

  const handleFavouriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    
    await toggleFavourite();
  };

  return (
    <>
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
            
            {/* Favourite Heart Button - Top Right - Only show if showFavourite is true */}
            {showFavourite && (
              <button
                onClick={handleFavouriteClick}
                disabled={favouriteLoading}
                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                  isFavourited 
                    ? 'bg-red-500 text-white shadow-lg hover:bg-red-600' 
                    : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500 shadow-md'
                } ${favouriteLoading ? 'animate-pulse' : 'hover:scale-110'}`}
                aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
              >
                {favouriteLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart className="w-5 h-5" filled={isFavourited} />
                )}
              </button>
            )}
            
            {/* IDX-AMPRE Style Filter Chips and Action Buttons - Hide for Buildings */}
            {property.source !== 'building' && (
              <div className="absolute inset-2 flex flex-col justify-between pointer-events-none">
                {/* Top row - Sale and Price chips - IDX-AMPRE style */}
                <div className="flex justify-between items-center gap-2.5 h-8">
                  <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 status-badge`}>
                    {property.transactionType || (property.isRental ? 'Rent' : 'Sale')}
                  </span>
                  <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 mr-12`}>
                    {formattedPrice}
                  </span>
                </div>
                
                {/* Bottom row - Request button only - IDX-AMPRE style */}
                <div className="flex justify-end items-center gap-2.5 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowRequestModal(true);
                    }}
                    className="property-action-btn flex items-center justify-center px-3 py-1.5 h-8 rounded-full font-bold tracking-tight whitespace-nowrap pointer-events-auto"
                    aria-label={`Request viewing for ${property.address}`}
                  >
                    Request
                  </button>
                </div>
              </div>
            )}
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
                  {property.source === 'mls' ? `MLS#: ${property.listingKey}` : `ID: ${property.listingKey}`}
                </div>
              </div>
            </div>
          </div>
        </a>
        
        {/* Request Tour Modal */}
        <RequestTourModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          property={property}
        />
      </div>

      {/* Authentication Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-red-500" filled={true} />
              <h3 className="text-xl font-bold text-[#293056]">
                Save to Favourites
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Create a free account to save your favourite properties and access them anytime.
            </p>
            
            <div className="flex flex-col gap-3">
              <Link
                href="/register"
                className="w-full py-3 px-4 bg-[#293056] text-white rounded-lg font-medium text-center hover:bg-[#1f2441] transition-colors"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="w-full py-3 px-4 border border-[#293056] text-[#293056] rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="w-full py-2 px-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyCardV6;
