import React, { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import PropertyCardV5 from '../../Global/Components/PropertyCards/PropertyCardV5';
import { createBuildingUrl } from '@/utils/slug';

/**
 * DeveloperBuildings Component
 *
 * Displays other buildings by the same developer as the current building.
 * Fetches buildings from the backend buildings table filtered by developer_name.
 *
 * Features:
 * - Fetches buildings by developer_name from /api/buildings endpoint
 * - Filters out current building from results
 * - Shows PropertyCardV5 cards with building info
 * - Carousel navigation for 3+ buildings
 * - Count badge showing total buildings
 * - Custom empty state
 *
 * @param {Object} buildingData - Current building data with developer_name
 */
const DeveloperBuildings = ({ buildingData }) => {
  const { globalWebsite, website } = usePage().props;
  const brandColors = globalWebsite?.brand_colors || website?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || '#293056';
  const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';

  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get developer name from building data
  const developerName = buildingData?.developer_name;
  const title = `More Buildings by ${developerName}`;

  // Fetch buildings by developer
  useEffect(() => {
    if (!developerName) {
      setIsLoading(false);
      return;
    }

    fetchDeveloperBuildings();
  }, [developerName, buildingData?.city, buildingData?.id]);

  const fetchDeveloperBuildings = async () => {
    setIsLoading(true);
    console.log('DeveloperBuildings - buildingData:', buildingData);
    console.log('DeveloperBuildings - developer_name:', developerName);
    console.log('DeveloperBuildings - Fetching buildings for developer:', developerName);

    try {
      // Prepare query parameters
      const params = new URLSearchParams();
      params.append('developer_name', developerName);

      // Add city filter for better results
      if (buildingData?.city) {
        params.append('city', buildingData.city);
      }

      const url = `/api/buildings?${params.toString()}`;
      console.log('DeveloperBuildings - API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      const result = await response.json();
      console.log('DeveloperBuildings - API response:', result);

      // The API returns buildings in data array
      const allBuildings = result.data || result || [];
      console.log('DeveloperBuildings - Total buildings found:', allBuildings.length);

      // Filter out current building
      const filteredBuildings = allBuildings.filter(b => b.id !== buildingData?.id);
      console.log('DeveloperBuildings - After filtering current building:', filteredBuildings.length);

      if (filteredBuildings.length > 0) {
        // Format buildings for PropertyCardV5
        const formattedBuildings = filteredBuildings.map((building) => {
          // Process image URL
          let imageUrl = building.main_image;
          if (!imageUrl && building.images && Array.isArray(building.images) && building.images.length > 0) {
            imageUrl = building.images[0];
          }
          if (!imageUrl) {
            imageUrl = '/images/placeholder-property.jpg';
          }

          return {
            id: building.id,
            listingKey: `BLDG-${building.id}`,
            propertyType: building.building_type || 'Residential Building',
            address: building.address || building.name,
            name: building.name,
            city: building.city,
            province: building.province,
            imageUrl: imageUrl,
            price: building.price_range || building.units_for_sale || 0,
            bedrooms: building.bedrooms || '1-3',
            bathrooms: building.bathrooms || '1-2',
            total_units: building.total_units,
            total_floors: building.floors,
            unitsForSale: building.units_for_sale,
            unitsForRent: building.units_for_rent,
            yearBuilt: building.year_built,
            isRental: false,
            transactionType: 'Building',
            source: 'building',
            // Add formatted address for card display
            UnitNumber: '',
            StreetNumber: '',
            StreetName: building.address || building.name,
            City: building.city,
            StateOrProvince: building.province
          };
        });

        console.log('DeveloperBuildings - Formatted buildings:', formattedBuildings);
        console.log('DeveloperBuildings - Rendering with', formattedBuildings.length, 'buildings');
        setBuildings(formattedBuildings);
      } else {
        setBuildings([]);
      }
    } catch (error) {
      console.error('DeveloperBuildings - Error fetching buildings:', error);
      setBuildings([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleCardClick = (building) => {
    window.location.href = createBuildingUrl(building.name || building.address, building.id);
  };

  return (
    <section className="p-3 rounded-xl border-gray-200 border shadow-sm bg-gray-50">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk" style={{ color: '#293056' }}>
              {title}
            </h2>
            {/* Count badge */}
            {buildings.length > 0 && (
              <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold rounded-full" style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}>
                {buildings.length}
              </span>
            )}
          </div>

          {/* Navigation Arrows - Desktop Only */}
          {buildings.length > itemsPerSlide && (
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
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: buttonPrimaryBg }}></div>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && buildings.length === 0 && (
          <div className="flex flex-col justify-center items-center py-12 text-center">
            <div className="text-xl font-bold text-gray-700 mb-2">
              No buildings found
            </div>
            <div className="text-gray-500">
              No other buildings by {developerName} are currently available in our database.
            </div>
          </div>
        )}

        {/* Mobile: Horizontal Scrollable Row */}
        {!isLoading && buildings.length > 0 && (
          <div className="block md:hidden">
            <div className="mobile-listings-scroll">
              {buildings.map((building) => (
                <div key={building.id} className="flex-shrink-0 carousel-item">
                  <PropertyCardV5
                    property={building}
                    size="default"
                    onClick={() => handleCardClick(building)}
                    className="w-[300px]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop: Slider Container */}
        {!isLoading && buildings.length > 0 && (
          <div className="hidden md:block relative overflow-hidden">
            <div
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="desktop-listings-grid">
                    {buildings
                      .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                      .map((building) => (
                        <div key={building.id} className="flex justify-center items-start slider-item">
                          <PropertyCardV5
                            property={building}
                            size="default"
                            onClick={() => handleCardClick(building)}
                            className="w-[300px]"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dots Indicator - Desktop Only */}
        {!isLoading && buildings.length > 0 && totalSlides > 1 && (
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
        )}
      </div>

      <style>{`
        .mobile-listings-scroll {
          display: flex;
          overflow-x: auto;
          gap: 1rem;
          padding-bottom: 1rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .mobile-listings-scroll::-webkit-scrollbar {
          display: none;
        }
        .desktop-listings-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .carousel-item {
          min-width: 300px;
        }
        .slider-item {
          min-width: 0;
        }
      `}</style>
    </section>
  );
};

export default DeveloperBuildings;
