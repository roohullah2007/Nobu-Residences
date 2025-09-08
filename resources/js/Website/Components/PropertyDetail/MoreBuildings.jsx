import React, { useState, useRef, useEffect } from 'react';
import PropertyCardV3 from '../../Global/Cards/PropertyCardV3';
import PropertyCardV5 from '../../Global/Components/PropertyCards/PropertyCardV5';
import PropertyCardV6 from '../../Global/Components/PropertyCards/PropertyCardV6';
import { usePage } from '@inertiajs/react';
import { createBuildingUrl, createSEOBuildingUrl } from '@/utils/slug';

const MoreBuildings = ({ 
  title = "More Buildings By Agent", 
  propertyData = null,
  propertyType: filterPropertyType = null,
  transactionType: filterTransactionType = null,
  fetchType = null,
  buildingData = null
}) => {
  // Slider state and refs
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [buildingsData, setBuildingsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { listingKey, auth } = usePage().props;
  
  // Get property type and subtype from propertyData
  const propertyType = propertyData?.propertyType || null;
  const propertySubType = propertyData?.propertySubType || null;

  // Format building for card display (same as search page)
  const formatBuildingForCard = (building) => {
    return {
      id: building.id,
      slug: building.slug,
      listingKey: building.id,
      price: building.price_range || 'Price on Request',
      bedrooms: building.total_units ? `${building.total_units} Units` : null,
      bathrooms: building.floors ? `${building.floors} Floors` : null,
      sqft: building.year_built ? `Built ${building.year_built}` : null,
      parking: building.parking_spots || null,
      address: building.address,
      propertyType: building.name || building.building_type || 'Building',
      transactionType: building.listing_type || 'For Sale',
      city: building.city,
      province: building.province,
      imageUrl: building.main_image || null,
      isBuilding: true,
      source: 'building',
      name: building.name,
      developer: building.developer,
      available_units_count: building.available_units_count
    };
  };

  // NO SAMPLE DATA - only show real listings from API

  // Fetch listings from API based on title (skip if properties are passed directly)
  useEffect(() => {
    // If properties are passed directly, no need to fetch from API
    if (propertyData?.properties && Array.isArray(propertyData.properties)) {
      setIsLoading(false);
      return;
    }
    
    // If we need to fetch buildings from backend
    if (fetchType === 'buildings') {
      if (title === "Nearby Buildings" || title === "Similar Buildings") {
        fetchBuildings();
      }
      return;
    }
    
    // If we need to fetch condo apartments (for building page)
    if (filterPropertyType && (title === "Properties For Sale" || title === "Properties For Rent")) {
      fetchCondoApartments();
      return;
    }
    
    // Otherwise fetch based on title
    const fetchData = async () => {
      setIsLoading(true);
      
      let url = '/api/listings';
      const params = new URLSearchParams();
      
      // Determine what to fetch based on title
      if (title === "More Buildings by Agent") {
        if (!listingKey) {
          setIsLoading(false);
          return;
        }
        
        // Get agent listings
        url = `/api/property-detail/${listingKey}/similar`;
        
      } else if (title === "More Buildings By Developer") {
        // Get developer listings
        const developerId = propertyData?.developerId;
        if (!developerId) {
          setIsLoading(false);
          return;
        }
        url = `/api/developer/${developerId}/properties`;
        
      } else if (title === "Buildings Nearby") {
        // Get nearby listings based on location
        const lat = propertyData?.latitude;
        const lng = propertyData?.longitude;
        if (!lat || !lng) {
          setIsLoading(false);
          return;
        }
        params.append('lat', lat);
        params.append('lng', lng);
        params.append('radius', '1'); // 1km radius
        
      } else if (title === "Buildings Under Development") {
        // Get pre-construction listings
        params.append('status', 'pre-construction');
        
      } else if (title === "Available Units") {
        // Get available units in the building
        const buildingId = propertyData?.buildingId;
        if (!buildingId) {
          setIsLoading(false);
          return;
        }
        url = `/api/building/${buildingId}/units`;
      }
      
      // Add property type filter if specified
      if (propertyType) {
        params.append('property_type', propertyType);
      }
      if (propertySubType) {
        params.append('property_sub_type', propertySubType);
      }
      
      // Add limit
      params.append('limit', '12');
      
      try {
        const queryString = params.toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        
        const response = await fetch(fullUrl);
        const data = await response.json();
        
        if (data.success && data.data) {
          setBuildingsData(data.data);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [title, listingKey, propertyData, propertyType, propertySubType]);
  
  // Function to fetch buildings (Nearby or Similar)
  const fetchBuildings = async () => {
    setIsLoading(true);
    try {
      let url = '/api/buildings';
      const params = new URLSearchParams();
      
      if (title === "Nearby Buildings" && buildingData?.latitude && buildingData?.longitude) {
        // Fetch nearby buildings based on location
        params.append('lat', buildingData.latitude);
        params.append('lng', buildingData.longitude);
        params.append('radius', '2'); // 2km radius
        params.append('limit', '8');
      } else if (title === "Similar Buildings") {
        // Fetch similar buildings based on criteria
        if (buildingData?.building_type) {
          params.append('building_type', buildingData.building_type);
        }
        if (buildingData?.city) {
          params.append('city', buildingData.city);
        }
        params.append('limit', '8');
      }
      
      // Exclude current building
      if (buildingData?.id) {
        params.append('exclude', buildingData.id);
      }
      
      const queryString = params.toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      if (data.success && data.data) {
        // Format buildings using the same formatter as search page
        const formattedBuildings = data.data.map(building => formatBuildingForCard(building));
        setBuildingsData(formattedBuildings);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch condo apartments for sale/rent
  const fetchCondoApartments = async () => {
    setIsLoading(true);
    try {
      const transactionType = title === "Properties For Sale" ? "For Sale" : "For Lease";
      
      // If we have building data with address, use it for filtering
      let streetNumber = '';
      let streetName = '';
      
      if (buildingData?.address) {
        const match = buildingData.address.match(/^(\d+)\s+(.+?)(?:,|$)/);
        if (match) {
          streetNumber = match[1];
          // Remove street suffix for better matching
          streetName = match[2].replace(/\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Court|Ct|Place|Pl|Lane|Ln|Way)$/i, '').trim();
        }
      }
      
      const requestBody = {
        search_params: {
          query: streetNumber && streetName ? `${streetNumber} ${streetName}` : '',
          street_number: streetNumber,
          street_name: streetName,
          status: transactionType,
          property_type: ["Condo Apartment"],
          page: 1,
          page_size: 12
        }
      };
      
      const response = await fetch('/api/property-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.properties) {
        // Format properties for display
        const formattedProperties = data.data.properties.map(property => ({
          ...property,
          listingKey: property.ListingKey,
          price: property.ListPrice || property.LeasePrice || 0,
          bedrooms: property.BedroomsTotal || 0,
          bathrooms: property.BathroomsTotalInteger || 0,
          sqft: property.BuildingAreaTotal || null,
          parking: property.ParkingTotal || null,
          address: property.UnparsedAddress || '',
          propertyType: property.PropertyType || property.PropertySubType || 'Property',
          transactionType: property.TransactionType || 'For Sale',
          city: property.City || '',
          province: property.StateOrProvince || 'ON',
          imageUrl: property.images?.[0]?.url || null,
          images: property.images || [],
          source: 'property',
          isBuilding: false
        }));
        setBuildingsData(formattedProperties);
      }
    } catch (error) {
      console.error('Error fetching condo apartments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get the data to display (either passed properties or fetched data)
  const buildings = propertyData?.properties || buildingsData;
  
  // Mobile slider: Touch handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < totalSlides - 1) {
      nextSlide();
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide();
    }
  };

  // Calculate slides
  const itemsPerSlide = 4; // 4 items per slide on desktop
  const totalSlides = Math.ceil(buildings.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="idx-ampre-more-listings">
      <div className="mx-auto max-w-[1280px] pb-6">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-space-grotesk font-bold text-gray-800">{title}</h2>
          
          {/* Navigation Arrows for Desktop */}
          {buildings.length > itemsPerSlide && (
          <div className="hidden md:flex gap-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentSlide === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentSlide === totalSlides - 1}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          )}
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#293056]"></div>
          </div>
        )}
        
        {/* No Data State */}
        {!isLoading && buildings.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">No listings available at the moment</div>
          </div>
        )}
        
        {/* Mobile: Horizontal Scrollable Row */}
        {!isLoading && buildings.length > 0 && (
        <div className="block md:hidden">
          <div className="mobile-listings-scroll">
            {buildings.map((building) => (
              <div key={building.listingKey || building.id} className="flex-shrink-0 carousel-item" style={{ width: '300px' }}>
                {/* Use PropertyCardV5 for building cards (same as search page) */}
                {building.isBuilding ? (
                  <PropertyCardV5
                    property={building}
                    size="grid"
                    onClick={() => {
                      window.location.href = createSEOBuildingUrl(building);
                    }}
                    className="w-full"
                  />
                ) : (
                  <PropertyCardV6
                    property={building}
                    auth={auth}
                    size="mobile"
                    onClick={() => {
                      window.location.href = `/property/${building.listingKey}`;
                    }}
                    className="w-full"
                  />
                )}
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
                      <div key={building.listingKey || building.id} className="flex justify-center items-start slider-item">
                        {/* Use PropertyCardV5 for building cards (same as search page) */}
                        {building.isBuilding ? (
                          <PropertyCardV5
                            property={building}
                            size="grid"
                            onClick={() => {
                              window.location.href = createSEOBuildingUrl(building);
                            }}
                            className="w-full"
                          />
                        ) : (
                          <PropertyCardV6
                            property={building}
                            auth={auth}
                            size="default"
                            onClick={() => {
                              window.location.href = `/property/${building.listingKey}`;
                            }}
                            className="w-full"
                          />
                        )}
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
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .mobile-listings-scroll {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 1rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .mobile-listings-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .carousel-item {
          scroll-snap-align: start;
        }
        
        .desktop-listings-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(280px, 1fr));
          gap: 1rem;
          padding: 0;
        }
        
        @media (max-width: 1280px) {
          .desktop-listings-grid {
            grid-template-columns: repeat(3, minmax(280px, 1fr));
          }
        }
        
        @media (max-width: 1024px) {
          .desktop-listings-grid {
            grid-template-columns: repeat(2, minmax(280px, 1fr));
          }
        }
        
        .slider-item {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        
        /* Match search page grid styles */
        .idx-ampre-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .idx-ampre-mixed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default MoreBuildings;