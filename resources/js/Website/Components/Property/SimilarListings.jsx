import React, { useState } from 'react';

const SimilarListings = ({ currentProperty = null, similarProperties = null }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample similar properties data
  const defaultSimilarProperties = [
    {
      id: 1,
      listingKey: "N7058474",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&auto=format&q=80",
      price: 479999,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 1,
      bathrooms: 1,
      address: "122-370 Highway 7 #, Richmond Hill, ON",
      isRental: false
    },
    {
      id: 2,
      listingKey: "N7058475",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop&auto=format&q=80",
      price: 2200,
      propertyType: "Condo Apartment",
      transactionType: "For Lease",
      bedrooms: 1,
      bathrooms: 1,
      address: "122-370 Highway 7 #, Richmond Hill, ON",
      isRental: true
    },
    {
      id: 3,
      listingKey: "N7058476",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80",
      price: 529999,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 2,
      bathrooms: 1,
      address: "125-380 Highway 7 #, Richmond Hill, ON",
      isRental: false
    },
    {
      id: 4,
      listingKey: "N7058477",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&auto=format&q=80",
      price: 3500,
      propertyType: "Condo Apartment",
      transactionType: "For Rent",
      bedrooms: 2,
      bathrooms: 2,
      address: "130-390 Highway 7 #, Richmond Hill, ON",
      isRental: true
    },
    {
      id: 5,
      listingKey: "N7058478",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&auto=format&q=80",
      price: 789999,
      propertyType: "Condo Apartment",
      transactionType: "For Sale",
      bedrooms: 3,
      bathrooms: 2,
      address: "135-400 Highway 7 #, Richmond Hill, ON",
      isRental: false
    },
    {
      id: 6,
      listingKey: "N7058479",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&auto=format&q=80",
      price: 4200,
      propertyType: "Condo Apartment",
      transactionType: "For Lease",
      bedrooms: 3,
      bathrooms: 2,
      address: "140-410 Highway 7 #, Richmond Hill, ON",
      isRental: true
    }
  ];

  const propertiesData = similarProperties || defaultSimilarProperties;
  const cardsToShow = { desktop: 3, tablet: 2, mobile: 1 };
  
  // Calculate proper max index for each layout
  const getMaxIndex = (screenType) => {
    const cardsVisible = cardsToShow[screenType];
    return Math.max(0, propertiesData.length - cardsVisible);
  };
  
  const maxIndexDesktop = getMaxIndex('desktop');
  const maxIndexTablet = getMaxIndex('tablet');

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    // Use appropriate max index based on current layout
    const maxIndex = maxIndexDesktop; // For desktop, use desktop max
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleNextTablet = () => {
    setCurrentIndex(prev => Math.min(maxIndexTablet, prev + 1));
  };

  // Format price function
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

  const PropertyCard = ({ property }) => {
    const formattedPrice = formatPrice(property.price, property.isRental);
    const features = buildFeatures(property.bedrooms, property.bathrooms);
    const detailsUrl = `/property/${property.listingKey}`;
    
    // Extract image URL from various possible sources
    const getImageUrl = () => {
      // Check for various image properties
      const imageUrl = property.image || 
                      property.imageUrl || 
                      property.MediaURL || 
                      property.mainImage ||
                      property.main_image ||
                      (property.images && property.images.length > 0 ? property.images[0] : null) ||
                      (property.Images && property.Images.length > 0 ? 
                        (typeof property.Images[0] === 'string' ? property.Images[0] : property.Images[0]?.MediaURL) : null);
      
      // If we have an image URL, ensure it's absolute
      if (imageUrl) {
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
          return window.location.origin + (imageUrl.startsWith('/') ? '' : '/') + imageUrl;
        }
        return imageUrl;
      }
      
      // Return fallback image
      return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80';
    };

    return (
      <div className="flex-none w-[360px] h-[470px] bg-white shadow-lg rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group">
        <a href={detailsUrl} className="block h-full text-inherit no-underline">
          {/* Card Image */}
          <div className="relative w-full h-[275px] overflow-hidden bg-gray-100 rounded-t-xl">
            <img 
              src={getImageUrl()}
              alt={`${property.propertyType} in ${property.address}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                // Only set fallback if not already a fallback image
                if (!e.target.src.includes('unsplash')) {
                  e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80';
                }
              }}
            />
            
            {/* Filter Chips */}
            <div className="absolute top-2 left-2 right-2 flex justify-between items-center gap-2.5 h-8">
              <span className={`flex items-center justify-center px-4 py-1.5 h-8 rounded-full text-sm font-bold tracking-tight whitespace-nowrap shadow-sm ${
                property.isRental 
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-white text-[#293056] border border-gray-200'
              }`}>
                {property.isRental ? 'Rent' : 'Sale'}
              </span>
              <span className={`flex items-center justify-center px-4 py-1.5 h-8 rounded-full text-sm font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto ${
                property.isRental 
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-white text-[#293056] border border-gray-200'
              }`}>
                {formattedPrice}
              </span>
            </div>
          </div>
          
          {/* Card Content */}
          <div className="flex flex-col items-start p-4 gap-2.5 h-[195px] box-border">
            {/* Property Type Title */}
            <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]">
              {property.propertyType}
            </div>
            
            {/* Property Details */}
            <div className="flex flex-col items-start gap-2 w-full flex-1">
              {/* Address */}
              <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]">
                {property.address}
              </div>
              
              {/* Features */}
              {features && (
                <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]">
                  {features}
                </div>
              )}
              
              {/* MLS */}
              <div className="flex items-center justify-start w-full min-h-8 font-work-sans font-normal text-base leading-6 tracking-tight text-[#293056]">
                MLS#: {property.listingKey}
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  };

  return (
    <div className="font-work-sans my-8 w-full max-w-[1280px] mx-auto clear-both overflow-visible">
      {/* Section Header */}
      <div className="mb-8 flex w-full">
        <h2 className="font-space-grotesk text-3xl font-bold text-gray-900 m-0 leading-9">
          Similar Listings
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
                {propertiesData.map((property) => (
                  <PropertyCard key={property.id} property={property} />
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
                {propertiesData.map((property) => (
                  <PropertyCard key={property.id} property={property} />
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
            {propertiesData.map((property) => (
              <div key={property.id} className="flex-none w-80 h-[420px]">
                <div className="w-80 h-[420px] bg-white shadow-lg rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group">
                  <a href={`/property/${property.listingKey}`} className="block h-full text-inherit no-underline">
                    {/* Mobile Card Image */}
                    <div className="relative w-full h-60 overflow-hidden bg-gray-100 rounded-t-xl">
                      <img 
                        src={property.image}
                        alt={`${property.propertyType} in ${property.address}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80';
                        }}
                      />
                      
                      {/* Mobile Filter Chips */}
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-center gap-2 h-8">
                        <span className={`flex items-center justify-center px-2 py-1 h-8 rounded-full text-xs font-bold tracking-tight whitespace-nowrap shadow-sm ${
                          property.isRental 
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-white text-[#293056] border border-gray-200'
                        }`}>
                          {property.isRental ? 'Rent' : 'Sale'}
                        </span>
                        <span className={`flex items-center justify-center px-2 py-1 h-8 rounded-full text-xs font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto ${
                          property.isRental 
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-white text-[#293056] border border-gray-200'
                        }`}>
                          {formatPrice(property.price, property.isRental)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mobile Card Content */}
                    <div className="flex flex-col items-start p-3 gap-2 h-40 box-border">
                      {/* Property Type Title */}
                      <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold text-lg leading-7 tracking-tight text-[#293056]">
                        {property.propertyType}
                      </div>
                      
                      {/* Property Details */}
                      <div className="flex flex-col items-start gap-2 w-full flex-1">
                        {/* Address */}
                        <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-[#293056]">
                          {property.address}
                        </div>
                        
                        {/* Features */}
                        {buildFeatures(property.bedrooms, property.bathrooms) && (
                          <div className="flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal text-sm leading-5 tracking-tight text-[#293056]">
                            {buildFeatures(property.bedrooms, property.bathrooms)}
                          </div>
                        )}
                        
                        {/* MLS */}
                        <div className="flex items-center justify-start w-full min-h-8 font-work-sans font-normal text-sm leading-5 tracking-tight text-[#293056]">
                          MLS#: {property.listingKey}
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* View All Button */}
      <div className="flex justify-center mt-8">
        <a 
          href="/properties"
          className="flex items-center justify-center px-8 py-2.5 gap-2 h-11 bg-black rounded-full text-white font-work-sans font-bold text-base leading-6 tracking-tight no-underline transition-all duration-200 hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg hover:no-underline whitespace-nowrap"
        >
          View all
        </a>
      </div>
    </div>
  );
};

export default SimilarListings;