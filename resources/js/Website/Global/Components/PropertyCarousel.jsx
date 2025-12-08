import React, { useState } from 'react';
import PropertyCard from '@/Website/Components/Property/PropertyCard';
import { usePage } from '@inertiajs/react';

/**
 * PropertyCarousel - Reusable carousel component for property cards
 *
 * A responsive property carousel with favourite functionality.
 * Handles desktop (3 cards), tablet (2 cards), and mobile (horizontal scroll) layouts.
 *
 * @param {Array} properties - Array of property objects
 * @param {Object} auth - Auth object from Inertia
 * @param {string} title - Section title
 * @param {string} type - Card type ('sale' or 'rent')
 * @param {string} viewAllLink - Link for "View all" button
 * @param {Function} onCardClick - Optional click handler for cards
 * @param {string} className - Additional CSS classes
 */
const PropertyCarousel = ({
  properties = [],
  auth,
  title = 'Properties',
  type = 'sale',
  viewAllLink = '/properties',
  onCardClick,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get website and brand colors
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;

  const brandColors = currentWebsite?.brand_colors || {
    primary: '#912018',
    button_secondary_bg: '#912018',
    button_secondary_text: '#FFFFFF',
    button_tertiary_bg: '#000000',
    button_tertiary_text: '#FFFFFF'
  };

  // Get button colors with fallbacks
  const buttonSecondaryBg = brandColors.button_secondary_bg || '#912018';
  const buttonSecondaryText = brandColors.button_secondary_text || '#FFFFFF';
  const buttonTertiaryBg = brandColors.button_tertiary_bg || '#000000';
  const buttonTertiaryText = brandColors.button_tertiary_text || '#FFFFFF';

  // Limit properties to max 12 and prepare carousel items
  const limitedProperties = properties.slice(0, 12);
  
  // Create carousel items array with properties + View All card
  const carouselItems = [...limitedProperties];
  
  // Always add View All card as the last item
  carouselItems.push({ isViewAllCard: true });

  const cardsToShow = { desktop: 3, tablet: 2, mobile: 1 };
  const cardWidth = 360;
  const cardGap = 20;
  
  // Calculate proper max index for each layout
  // This ensures we stop when the last card is visible
  const getMaxIndex = (screenType) => {
    const cardsVisible = cardsToShow[screenType];
    // If we have fewer items than cards to show, max index is 0
    if (carouselItems.length <= cardsVisible) {
      return 0;
    }
    // Otherwise, calculate so the last card is visible
    return carouselItems.length - cardsVisible;
  };
  
  const maxIndexDesktop = getMaxIndex('desktop');
  const maxIndexTablet = getMaxIndex('tablet');

  // Calculate the translation amount for smooth scrolling
  const getTranslateX = (index, visibleCards) => {
    const totalCards = carouselItems.length;
    const cardTotalWidth = cardWidth + cardGap;
    
    // If we're at the last possible position, align the last cards to the right edge
    if (index >= totalCards - visibleCards) {
      // Calculate how much to translate to show the last set of cards
      const containerWidth = visibleCards * cardWidth + (visibleCards - 1) * cardGap;
      const totalWidth = totalCards * cardWidth + (totalCards - 1) * cardGap;
      return Math.max(0, totalWidth - containerWidth);
    }
    
    // Normal scrolling
    return index * cardTotalWidth;
  };

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


  // Don't render if no properties
  if (!properties.length) {
    return null;
  }

  return (
    <div className={`font-work-sans w-full max-w-[1280px] mx-auto clear-both overflow-visible ${className}`}>
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
            
            {/* Cards Container - Show 3 cards at once */}
            <div className="overflow-hidden flex-1" style={{ maxWidth: '1120px' }}>
              <div 
                className="flex gap-5 transition-transform duration-300 ease-in-out"
                style={{ 
                  transform: `translateX(-${getTranslateX(currentIndex, cardsToShow.desktop)}px)`,
                  minWidth: 'max-content'
                }}
              >
                {carouselItems.map((item, index) => {
                  // Check if this is the View All card
                  if (item.isViewAllCard) {
                    return (
                      <div key={`desktop-view-all-${index}`} className="flex flex-col w-[300px] min-h-0 idx-ampre-property-card bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative">
                        <a
                          href={viewAllLink}
                          className="flex flex-col h-full text-inherit no-underline"
                        >
                          {/* CTA Card Image Area - Same height as property cards */}
                          <div
                            className="relative w-full h-[200px] property-image-container overflow-hidden rounded-t-xl flex items-center justify-center"
                            style={{ backgroundColor: buttonSecondaryBg }}
                          >
                            <div className="text-center" style={{ color: buttonSecondaryText }}>
                              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <p className="text-xl font-bold">Explore More</p>
                            </div>
                          </div>

                          {/* CTA Card Content - Matching property card structure */}
                          <div className="flex flex-col flex-grow items-start p-4 gap-2.5 box-border">
                            {/* Title Section */}
                            <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]">
                              Discover More Properties
                            </div>

                            {/* Content Sections */}
                            <div className="flex flex-col items-start gap-2 w-full">
                              <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]">
                                Browse All Available Listings
                              </div>

                              {/* CTA Button Section */}
                              <div className="flex items-center justify-center w-full min-h-8 pb-2 border-b border-gray-200">
                                <div
                                  className="inline-flex items-center justify-center px-6 py-2 rounded-full hover:opacity-90 transition-all font-work-sans font-semibold text-sm"
                                  style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }}
                                >
                                  View All Properties →
                                </div>
                              </div>
                              
                              {/* Additional Info */}
                              <div className="flex items-center justify-center w-full min-h-8">
                                <div className="font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056] text-center">
                                  Updated Daily
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    );
                  }
                  
                  return (
                    <PropertyCard
                      key={`desktop-${item.id}-${index}`}
                      property={item}
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
            
            {/* Cards Container - Show 2 cards at once */}
            <div className="overflow-hidden flex-1" style={{ maxWidth: '740px' }}>
              <div 
                className="flex gap-5 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${getTranslateX(currentIndex, cardsToShow.tablet)}px)` }}
              >
                {carouselItems.map((item, index) => {
                  // Check if this is the View All card
                  if (item.isViewAllCard) {
                    return (
                      <div key={`tablet-view-all-${index}`} className="flex flex-col w-[300px] min-h-0 idx-ampre-property-card bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative">
                        <a
                          href={viewAllLink}
                          className="flex flex-col h-full text-inherit no-underline"
                        >
                          {/* CTA Card Image Area - Same height as property cards */}
                          <div
                            className="relative w-full h-[200px] property-image-container overflow-hidden rounded-t-xl flex items-center justify-center"
                            style={{ backgroundColor: buttonSecondaryBg }}
                          >
                            <div className="text-center" style={{ color: buttonSecondaryText }}>
                              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <p className="text-xl font-bold">Explore More</p>
                            </div>
                          </div>

                          {/* CTA Card Content - Matching property card structure */}
                          <div className="flex flex-col flex-grow items-start p-4 gap-2.5 box-border">
                            {/* Title Section */}
                            <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]">
                              Discover More Properties
                            </div>

                            {/* Content Sections */}
                            <div className="flex flex-col items-start gap-2 w-full">
                              <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]">
                                Browse All Available Listings
                              </div>

                              {/* CTA Button Section */}
                              <div className="flex items-center justify-center w-full min-h-8 pb-2 border-b border-gray-200">
                                <div
                                  className="inline-flex items-center justify-center px-6 py-2 rounded-full hover:opacity-90 transition-all font-work-sans font-semibold text-sm"
                                  style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }}
                                >
                                  View All Properties →
                                </div>
                              </div>
                              
                              {/* Additional Info */}
                              <div className="flex items-center justify-center w-full min-h-8">
                                <div className="font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056] text-center">
                                  Updated Daily
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    );
                  }
                  
                  return (
                    <PropertyCard
                      key={`tablet-${item.id}-${index}`}
                      property={item}
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
            {carouselItems.map((item, index) => {
              // Check if this is the View All card
              if (item.isViewAllCard) {
                return (
                  <div key={`mobile-view-all-${index}`} className="flex flex-col w-[300px] min-h-0 idx-ampre-property-card bg-white border-gray-300 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl group relative flex-none">
                    <a
                      href={viewAllLink}
                      className="flex flex-col h-full text-inherit no-underline"
                    >
                      {/* CTA Card Image Area - Same height as property cards */}
                      <div
                        className="relative w-full h-[200px] property-image-container overflow-hidden rounded-t-xl flex items-center justify-center"
                        style={{ backgroundColor: buttonSecondaryBg }}
                      >
                        <div className="text-center" style={{ color: buttonSecondaryText }}>
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <p className="text-xl font-bold">Explore More</p>
                        </div>
                      </div>

                      {/* CTA Card Content - Matching property card structure */}
                      <div className="flex flex-col flex-grow items-start p-4 gap-2.5 box-border">
                        {/* Title Section */}
                        <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]">
                          Discover More Properties
                        </div>

                        {/* Content Sections */}
                        <div className="flex flex-col items-start gap-2 w-full">
                          <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]">
                            Browse All Available Listings
                          </div>

                          {/* CTA Button Section */}
                          <div className="flex items-center justify-center w-full min-h-8 pb-2 border-b border-gray-200">
                            <div
                              className="inline-flex items-center justify-center px-6 py-2 rounded-full hover:opacity-90 transition-all font-work-sans font-semibold text-sm"
                              style={{ backgroundColor: buttonSecondaryBg, color: buttonSecondaryText }}
                            >
                              View All Properties →
                            </div>
                          </div>
                          
                          {/* Additional Info */}
                          <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-gray-600">
                            100+ Active Listings
                          </div>
                          
                          <div className="flex items-center justify-start w-full min-h-8">
                            <div className="font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]">
                              Updated Daily
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                );
              }
              
              return (
                <div key={`mobile-${item.id}-${index}`} className="flex-none">
                  <PropertyCard
                    property={item}
                  />
                </div>
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

export default PropertyCarousel;