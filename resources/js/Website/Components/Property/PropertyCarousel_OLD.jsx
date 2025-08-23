import React, { useState } from 'react';
import { PropertyCardV1, PropertyCardV2 } from '@/Website/Global/Components/PropertyCards/index.js';

/**
 * PropertyCarousel - Reusable carousel component for property cards
 * 
 * A responsive property carousel that works with both PropertyCardV1 (sale) and PropertyCardV2 (rent).
 * Handles desktop (3 cards), tablet (2 cards), and mobile (horizontal scroll) layouts.
 * 
 * @param {Array} properties - Array of property objects
 * @param {string} title - Section title
 * @param {string} type - Card type ('sale' or 'rent')
 * @param {string} viewAllLink - Link for "View all" button
 * @param {Function} onCardClick - Optional click handler for cards
 * @param {string} className - Additional CSS classes
 */
const PropertyCarousel = ({ 
  properties = [], 
  title = 'Properties',
  type = 'sale',
  viewAllLink = '/properties',
  onCardClick,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardsToShow = { desktop: 3, tablet: 2, mobile: 1 };
  
  // Calculate proper max index for each layout
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

  // Icon components
  const ChevronLeftIcon = ({ className }) => (
    <svg className={className} width="24" height="24" fill="white" viewBox="0 0 24 24">
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
    </svg>
  );

  const ChevronRightIcon = ({ className }) => (
    <svg className={className} width="24" height="24" fill="white" viewBox="0 0 24 24">
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
    </svg>
  );

  // Choose the appropriate card component
  const PropertyCard = type === 'rent' ? PropertyCardV2 : PropertyCardV1;

  // Don't render if no properties
  if (!properties.length) {
    return null;
  }

  return (
    <div className={`font-work-sans my-8 w-full max-w-[1280px] mx-auto clear-both overflow-visible ${className}`}>
      {/* Section Header */}
      <div className="mb-8 flex w-full">
        <h2 className="font-space-grotesk text-3xl font-bold text-gray-900 m-0 leading-9">
          {title}
        </h2>
      </div>
      
      {/* Carousel with Navigation */}
      <div className="relative">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
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
                    <ChevronLeftIcon className="w-6 h-6" />
                  </div>
                </div>
              </button>
            </div>
            
            {/* Cards Container */}
            <div className="overflow-hidden" style={{ width: 'calc(3 * 360px + 2 * 20px)' }}>
              <div 
                className="flex gap-5 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (360 + 20)}px)` }}
              >
                {properties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    size="default"
                    onClick={onCardClick}
                  />
                ))}
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
                    <ChevronRightIcon className="w-6 h-6" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Tablet Layout (2 cards) */}
        <div className="hidden md:block lg:hidden">
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
                    <ChevronLeftIcon className="w-6 h-6" />
                  </div>
                </div>
              </button>
            </div>
            
            {/* Cards Container */}
            <div className="overflow-hidden" style={{ width: 'calc(2 * 360px + 1 * 20px)' }}>
              <div 
                className="flex gap-5 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (360 + 20)}px)` }}
              >
                {properties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    size="default"
                    onClick={onCardClick}
                  />
                ))}
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
                    <ChevronRightIcon className="w-6 h-6" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout (horizontal scroll) */}
        <div className="md:hidden overflow-x-auto scrollbar-hide py-4">
          <div className="flex gap-5">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                size="mobile"
                onClick={onCardClick}
                className="flex-none"
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* View All Button */}
      <div className="flex justify-center mt-8">
        <a 
          href={viewAllLink}
          className="flex items-center justify-center px-8 py-2.5 gap-2 h-11 bg-black rounded-full text-white font-work-sans font-bold text-base leading-6 tracking-tight no-underline transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg hover:no-underline whitespace-nowrap"
        >
          View all
        </a>
      </div>
    </div>
  );
};

export default PropertyCarousel;