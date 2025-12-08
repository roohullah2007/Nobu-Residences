import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import PropertyCardV4 from '@/Website/Global/Cards/PropertyCardV4';

/**
 * PropertyCarouselV2 - Reusable carousel component using PropertyCardV4 with overlay buttons
 *
 * A responsive property carousel that uses PropertyCardV4 (MoreBuildings card style with overlay buttons).
 * Slides one card at a time like PropertyCarouselV1.
 * Handles desktop (3 cards), tablet (2 cards), and mobile (horizontal scroll) layouts.
 *
 * @param {Array} properties - Array of property objects
 * @param {string} title - Section title
 * @param {string} viewAllLink - Link for "View all" button
 * @param {Function} onCardClick - Optional click handler for cards
 * @param {string} className - Additional CSS classes
 * @param {boolean} showBackground - Whether to show background styling (default: false)
 */
const PropertyCarouselV2 = ({
  properties = [],
  title = 'Properties',
  viewAllLink = '/properties',
  onCardClick,
  className = '',
  showBackground = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get brand colors
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite || {};
  const brandColors = currentWebsite?.brand_colors || {};
  const buttonTertiaryBg = brandColors.button_tertiary_bg || '#000000';
  const buttonTertiaryText = brandColors.button_tertiary_text || '#FFFFFF';

  const cardsToShow = { desktop: 3, tablet: 2, mobile: 1 };
  
  // Calculate proper max index for each layout (same as PropertyCarouselV1)
  const getMaxIndex = (screenType) => {
    const cardsVisible = cardsToShow[screenType];
    return Math.max(0, properties.length - cardsVisible);
  };
  
  const maxIndexDesktop = getMaxIndex('desktop');
  const maxIndexTablet = getMaxIndex('tablet');

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndexDesktop, prev + 1));
  };

  const handleNextTablet = () => {
    setCurrentIndex(prev => Math.min(maxIndexTablet, prev + 1));
  };

  // Format property data for PropertyCardV4
  const formatPropertyData = (property) => {
    return {
      image: property.image,
      title: property.propertyType || property.name || 'Property',
      address: property.address,
      units: property.bedrooms && property.bathrooms 
        ? `${property.bedrooms} Beds | ${property.bathrooms} Baths` 
        : (property.units || 'N/A'),
      priceRange: property.price 
        ? (property.isRental ? `$${property.price.toLocaleString()}/mo` : `$${property.price.toLocaleString()}`)
        : (property.priceRange || 'Price on request'),
      transactionType: property.isRental ? 'Rent' : 'Sale',
      price: property.price
    };
  };

  // Don't render if no properties
  if (!properties.length) {
    return null;
  }

  // Card width calculation (adjust based on PropertyCardV4 size)
  const cardWidth = 360; // PropertyCardV4 approximate width
  const cardGap = 20; // Gap between cards

  return (
    <div className={`font-work-sans w-full max-w-[1280px] mx-auto clear-both overflow-visible ${
      showBackground ? 'bg-gray-50 p-4 rounded-xl border-gray-200 border shadow-sm' : 'my-8'
    } ${className}`}>
      {/* Section Header */}
      <div className="mb-8 flex w-full">
        <h2 className="font-space-grotesk text-3xl font-bold text-gray-900 m-0 leading-9">
          {title}
        </h2>
      </div>
      
      {/* Carousel with Navigation */}
      <div className="relative">
        {/* Desktop Layout (3 cards) */}
        <div className="hidden xl:block">
          <div className="flex items-center justify-center gap-4">
            {/* Previous Button */}
            <div className="flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none">
              <button 
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center justify-center w-14 h-14 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:bg-gray-300 flex-none"
                aria-label="Previous properties"
              >
                <div className="flex items-center justify-center p-2 gap-2.5 w-10 h-10">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full">
                    <svg className="w-6 h-6" width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
            
            {/* Cards Container */}
            <div className="overflow-hidden w-full max-w-[1140px]"> {/* 3 * 360px + 2 * 20px = 1140px */}
              <div 
                className="flex gap-5 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (cardWidth + cardGap)}px)` }}
              >
                {properties.map((property, index) => {
                  const formattedData = formatPropertyData(property);
                  return (
                    <PropertyCardV4
                      key={`desktop-${property.id}-${index}`}
                      {...formattedData}
                      onClick={() => onCardClick && onCardClick(property)}
                      className="flex-none w-[360px]"
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Next Button */}
            <div className="flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none">
              <button 
                onClick={handleNext}
                disabled={currentIndex >= maxIndexDesktop}
                className="flex items-center justify-center w-14 h-14 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:bg-gray-300 flex-none"
                aria-label="Next properties"
              >
                <div className="flex items-center justify-center p-2 gap-2.5 w-10 h-10">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full">
                    <svg className="w-6 h-6" width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Tablet Layout (2 cards) */}
        <div className="hidden lg:block xl:hidden">
          <div className="flex items-center justify-center gap-4">
            {/* Previous Button */}
            <div className="flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none">
              <button 
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center justify-center w-14 h-14 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:bg-gray-300 flex-none"
                aria-label="Previous properties"
              >
                <div className="flex items-center justify-center p-2 gap-2.5 w-10 h-10">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full">
                    <svg className="w-6 h-6" width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
            
            {/* Cards Container */}
            <div className="overflow-hidden w-full max-w-[740px]"> {/* 2 * 360px + 1 * 20px = 740px */}
              <div 
                className="flex gap-5 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (cardWidth + cardGap)}px)` }}
              >
                {properties.map((property, index) => {
                  const formattedData = formatPropertyData(property);
                  return (
                    <PropertyCardV4
                      key={`tablet-${property.id}-${index}`}
                      {...formattedData}
                      onClick={() => onCardClick && onCardClick(property)}
                      className="flex-none w-[360px]"
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Next Button */}
            <div className="flex flex-col justify-center items-center p-1 gap-2.5 w-16 h-16 flex-none">
              <button 
                onClick={handleNextTablet}
                disabled={currentIndex >= maxIndexTablet}
                className="flex items-center justify-center w-14 h-14 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:bg-gray-300 flex-none"
                aria-label="Next properties"
              >
                <div className="flex items-center justify-center p-2 gap-2.5 w-10 h-10">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full">
                    <svg className="w-6 h-6" width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout (horizontal scroll) */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide py-4">
          <div className="flex gap-5">
            {properties.map((property, index) => {
              const formattedData = formatPropertyData(property);
              return (
                <PropertyCardV4
                  key={`mobile-${property.id}-${index}`}
                  {...formattedData}
                  onClick={() => onCardClick && onCardClick(property)}
                  className="flex-none w-80"
                />
              );
            })}
          </div>
        </div>
      </div>
      
      {/* View All Button */}
      <div className="flex justify-center mt-8">
        <a
          href={viewAllLink}
          className="flex items-center justify-center px-8 py-2.5 gap-2 h-11 rounded-full font-work-sans font-bold text-base leading-6 tracking-tight no-underline transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:no-underline whitespace-nowrap"
          style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
        >
          View all
        </a>
      </div>
    </div>
  );
};

export default PropertyCarouselV2;