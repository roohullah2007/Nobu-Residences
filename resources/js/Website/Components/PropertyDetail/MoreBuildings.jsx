import React, { useState, useRef } from 'react';
import PropertyCardV3 from '../../Global/Cards/PropertyCardV3';

const MoreBuildings = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  // Sample building data with more items to demonstrate slider
  const buildings = [
    {
      id: 1,
      name: "Luxury Downtown Tower",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&auto=format&q=80",
      address: "123 King Street West",
      units: 45,
      priceRange: "$800K - $2.5M"
    },
    {
      id: 2,
      name: "Riverside Condominiums", 
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80",
      address: "456 Queen Street East",
      units: 32,
      priceRange: "$600K - $1.8M"
    },
    {
      id: 3,
      name: "Modern Urban Living",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80", 
      address: "789 Bay Street",
      units: 67,
      priceRange: "$900K - $3.2M"
    },
    {
      id: 4,
      name: "Executive Suites",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop&auto=format&q=80",
      address: "321 Yonge Street",
      units: 28,
      priceRange: "$1.2M - $4.5M"
    },
    {
      id: 5,
      name: "Waterfront Towers",
      image: "https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4a0?w=400&h=300&fit=crop&auto=format&q=80",
      address: "555 Lake Shore Boulevard",
      units: 89,
      priceRange: "$750K - $2.8M"
    },
    {
      id: 6,
      name: "Downtown Residences",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80",
      address: "888 University Avenue",
      units: 156,
      priceRange: "$650K - $3.5M"
    }
  ];

  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(buildings.length / itemsPerSlide);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <section className="p-4 rounded-xl border-gray-200 border shadow-sm bg-gray-50">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold font-space-grotesk" style={{ color: '#293056' }}>More Buildings By Agent</h2>
          
          {/* Navigation Arrows - Desktop Only */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                currentSlide === 0
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800 hover:bg-white'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                currentSlide === totalSlides - 1
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800 hover:bg-white'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile: Horizontal Scrollable Row */}
        <div className="block md:hidden">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {buildings.map((building) => (
              <div key={building.id} className="flex-shrink-0 w-72">
                <PropertyCardV3
                  image={building.image}
                  title={building.name}
                  address={building.address}
                  units={`${building.units} units`}
                  priceRange={building.priceRange}
                  onClick={() => console.log('Building clicked:', building.name)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Slider Container */}
        <div className="hidden md:block relative overflow-hidden">
          <div 
            ref={sliderRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {buildings
                    .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                    .map((building) => (
                      <PropertyCardV3
                        key={building.id}
                        image={building.image}
                        title={building.name}
                        address={building.address}
                        units={`${building.units} units`}
                        priceRange={building.priceRange}
                        onClick={() => console.log('Building clicked:', building.name)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator - Desktop Only */}
        <div className="hidden md:flex justify-center mt-6 gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index
                  ? 'bg-gray-800'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
      
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default MoreBuildings;