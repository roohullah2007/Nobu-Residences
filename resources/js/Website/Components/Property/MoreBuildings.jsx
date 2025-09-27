import React, { useState } from 'react';

const MoreBuildings = ({ agentName = "Jatin Gill", buildings = null }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample buildings data
  const defaultBuildings = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058474",
      price: "$480K",
      agentName: "Logan Mews",
      bedrooms: "1BD",
      bathrooms: "1BA",
      parking: "1 Parking",
      sqft: "603 sqft",
      address: "122-370 Highway 7 #, Richmond Hill, ON",
      link: "#"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058475",
      price: "$520K",
      agentName: "Logan Mews",
      bedrooms: "2BD",
      bathrooms: "1BA",
      parking: "1 Parking",
      sqft: "750 sqft",
      address: "125-380 Highway 7 #, Richmond Hill, ON",
      link: "#"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058476",
      price: "$650K",
      agentName: "Logan Mews",
      bedrooms: "2BD",
      bathrooms: "2BA",
      parking: "1 Parking",
      sqft: "850 sqft",
      address: "130-390 Highway 7 #, Richmond Hill, ON",
      link: "#"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058477",
      price: "$780K",
      agentName: "Logan Mews",
      bedrooms: "3BD",
      bathrooms: "2BA",
      parking: "2 Parking",
      sqft: "950 sqft",
      address: "135-400 Highway 7 #, Richmond Hill, ON",
      link: "#"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058478",
      price: "$820K",
      agentName: "Logan Mews",
      bedrooms: "3BD",
      bathrooms: "2BA",
      parking: "2 Parking",
      sqft: "1100 sqft",
      address: "140-410 Highway 7 #, Richmond Hill, ON",
      link: "#"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop&crop=center",
      status: "For Sale",
      mlsNumber: "#N7058479",
      price: "$890K",
      agentName: "Logan Mews",
      bedrooms: "3BD",
      bathrooms: "3BA",
      parking: "2 Parking",
      sqft: "1200 sqft",
      address: "145-420 Highway 7 #, Richmond Hill, ON",
      link: "#"
    }
  ];

  const buildingsData = buildings || defaultBuildings;
  const cardsToShow = 4;
  const maxIndex = Math.max(0, buildingsData.length - cardsToShow);

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  // Icon components
  const ChevronLeftIcon = ({ className }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  const ChevronRightIcon = ({ className }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );

  const BuildingCard = ({ building }) => (
    <div className="flex-none w-[249px] bg-white h-80 rounded-xl shadow-lg overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl group">
      {/* Card Image */}
      <div className="relative h-[169px] overflow-hidden">
        <img 
          src={building.image}
          alt={building.address}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop&crop=center';
          }}
        />
        
        {/* Status Badge */}
        <span className="absolute top-3 left-3 bg-white text-[#293056] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
          {building.status}
        </span>
        
        {/* MLS Badge */}
        <span className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">
          {building.mlsNumber}
        </span>
      </div>
      
      {/* Card Content */}
      <div className="p-2.5">
        {/* Price Row */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-xl font-bold text-[#293056]">
            {building.price}
          </span>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {building.agentName}
          </span>
        </div>
        
        {/* Features Row */}
        <div className="flex gap-3 mb-3 flex-wrap justify-between">
          <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
            {building.bedrooms}
          </span>
          <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
            {building.bathrooms}
          </span>
          <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
            {building.parking}
          </span>
          <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
            {building.sqft}
          </span>
        </div>
        
        {/* Address Row */}
        <div className="mt-2">
          <a 
            href={building.link}
            className="text-sm font-medium text-gray-700 hover:text-blue-700 hover:underline leading-snug block"
          >
            {building.address}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 rounded-xl py-8 px-6 my-10 font-work-sans max-w-[1280px] mx-auto">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="font-red-hat text-2xl font-bold text-[#293056] tracking-tight">
          More Buildings by {agentName}
        </h2>
      </div>
      
      {/* Buildings Carousel */}
      <div className="relative">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-center">
            {/* Previous Button */}
            <button 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center justify-center w-12 h-12 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full text-white mr-6 transition-colors duration-200 z-10"
              aria-label="Previous buildings"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            {/* Cards Container */}
            <div className="overflow-hidden" style={{ width: 'calc(4 * 249px + 3 * 16px)' }}>
              <div 
                className="flex gap-4 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * (249 + 16)}px)` }}
              >
                {buildingsData.map((building) => (
                  <BuildingCard key={building.id} building={building} />
                ))}
              </div>
            </div>
            
            {/* Next Button */}
            <button 
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="flex items-center justify-center w-12 h-12 bg-orange-700 hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full text-white ml-6 transition-colors duration-200 z-10"
              aria-label="Next buildings"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile: Horizontal scroll */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide">
          <div className="flex gap-4">
            {buildingsData.map((building) => (
              <BuildingCard key={building.id} building={building} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreBuildings;