import React, { useState, useRef, useEffect } from 'react';
import PropertyCardV3 from '../../Global/Cards/PropertyCardV3';
import { usePage } from '@inertiajs/react';

const MoreBuildings = ({ title = "More Buildings By Agent" }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [nearbyListings, setNearbyListings] = useState([]);
  const [similarListings, setSimilarListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { listingKey } = usePage().props;

  // Sample building data for "More Buildings By Agent"
  const buildingData = [
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

  // Sample nearby listings data for non-condo properties
  const nearbyListingsData = [
    {
      id: 1,
      name: "Charming Family Home",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80",
      address: "142 Maple Avenue",
      units: "4 BD, 3 BA",
      priceRange: "$1.2M"
    },
    {
      id: 2,
      name: "Modern Townhouse", 
      image: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400&h=300&fit=crop&auto=format&q=80",
      address: "78 Oak Street",
      units: "3 BD, 2.5 BA",
      priceRange: "$950K"
    },
    {
      id: 3,
      name: "Luxury Detached Home",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80", 
      address: "256 Pine Road",
      units: "5 BD, 4 BA",
      priceRange: "$2.1M"
    },
    {
      id: 4,
      name: "Cozy Bungalow",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&auto=format&q=80",
      address: "89 Elm Street",
      units: "2 BD, 2 BA",
      priceRange: "$720K"
    },
    {
      id: 5,
      name: "Executive Villa",
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop&auto=format&q=80",
      address: "445 Willow Drive",
      units: "6 BD, 5 BA",
      priceRange: "$3.8M"
    },
    {
      id: 6,
      name: "Contemporary Home",
      image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop&auto=format&q=80",
      address: "167 Cedar Lane",
      units: "3 BD, 3 BA",
      priceRange: "$1.4M"
    }
  ];

  // Fetch listings from API based on title
  useEffect(() => {
    if (listingKey) {
      if (title === "Nearby Listings") {
        fetchNearbyListings();
      } else if (title === "Similar Listings") {
        fetchSimilarListings();
      } else {
        setIsLoading(false);
      }
    }
  }, [listingKey, title]);
  
  const fetchNearbyListings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/nearby-listings?listingKey=${listingKey}&limit=6`);
      const data = await response.json();
      
      // Debug log to see what we're getting from API
      console.log('Nearby listings API response:', data);
      
      if (data.properties && data.properties.length > 0) {
        // Format the data for the PropertyCardV3 component
        const formattedListings = data.properties.map((property, index) => {
          // Use MediaURL field like the search page does, fallback to image field
          let imageUrl = property.MediaURL || property.image;
          
          // Check for null, undefined, empty string, or "none"
          if (!imageUrl) {
            // Fallback to placeholder if no image
            imageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80";
            console.log(`Nearby property ${property.listingKey} - No image, using placeholder`);
          } else if (imageUrl.includes('ampre.ca')) {
            // Use the proxy endpoint to avoid SSL issues for AMPRE images
            const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
            console.log(`Nearby property ${property.listingKey} - Proxying AMPRE image:`, imageUrl.substring(0, 50), '... to', proxiedUrl.substring(0, 50));
            imageUrl = proxiedUrl;
          } else {
            console.log(`Nearby property ${property.listingKey} - Using direct image:`, imageUrl.substring(0, 50));
          }
          
          return {
            id: property.listingKey || index,
            // Use the actual property type or subtype from the API
            name: property.propertySubType || property.propertyType || "Residential",
            // Use the processed image URL
            image: imageUrl,
            address: property.address || "Address not available",
            units: property.bedrooms ? `${property.bedrooms} BD, ${property.bathrooms || 0} BA` : "Details not available",
            priceRange: property.price ? `$${property.price.toLocaleString()}` : "Price on request",
            // Pass the listing key for navigation
            listingKey: property.listingKey,
            // Keep all images for potential carousel use
            images: property.images || []
          };
        });
        
        // Debug log formatted listings
        console.log('Formatted nearby listings:', formattedListings);
        setNearbyListings(formattedListings);
      }
    } catch (error) {
      console.error('Error fetching nearby listings:', error);
      // Set empty array on error
      setNearbyListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSimilarListings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/similar-listings?listingKey=${listingKey}&limit=6`);
      const data = await response.json();
      
      // Debug log to see what we're getting from API
      console.log('Similar listings API response:', data);
      
      if (data.properties && data.properties.length > 0) {
        // Format the data for the PropertyCardV3 component - same as nearby listings
        const formattedListings = data.properties.map((property, index) => {
          // Use MediaURL field like the search page does, fallback to image field
          let imageUrl = property.MediaURL || property.image;
          
          // Check for null, undefined, empty string, or "none"
          if (!imageUrl) {
            // Fallback to placeholder if no image
            imageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80";
            console.log(`Similar property ${property.listingKey} - No image, using placeholder`);
          } else if (imageUrl.includes('ampre.ca')) {
            // Use the proxy endpoint to avoid SSL issues for AMPRE images
            const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
            console.log(`Similar property ${property.listingKey} - Proxying AMPRE image:`, imageUrl.substring(0, 50), '... to', proxiedUrl.substring(0, 50));
            imageUrl = proxiedUrl;
          } else {
            console.log(`Similar property ${property.listingKey} - Using direct image:`, imageUrl.substring(0, 50));
          }
          
          return {
            id: property.listingKey || index,
            // Use the actual property type or subtype from the API
            name: property.propertySubType || property.propertyType || "Residential",
            // Use the processed image URL
            image: imageUrl,
            address: property.address || "Address not available",
            units: property.bedrooms ? `${property.bedrooms} BD, ${property.bathrooms || 0} BA` : "Details not available",
            priceRange: property.price ? `$${property.price.toLocaleString()}` : "Price on request",
            // Pass the listing key for navigation
            listingKey: property.listingKey,
            // Keep all images for potential carousel use
            images: property.images || []
          };
        });
        
        // Debug log formatted listings
        console.log('Formatted similar listings:', formattedListings);
        setSimilarListings(formattedListings);
      }
    } catch (error) {
      console.error('Error fetching similar listings:', error);
      // Set empty array on error
      setSimilarListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Choose data based on title and API availability
  const buildings = (() => {
    if (title === "Nearby Listings") {
      return nearbyListings.length > 0 ? nearbyListings : (isLoading ? [] : nearbyListingsData);
    } else if (title === "Similar Listings") {
      return similarListings.length > 0 ? similarListings : (isLoading ? [] : nearbyListingsData);
    } else if (title === "More Buildings By Agent") {
      return buildingData;
    } else {
      return nearbyListingsData;
    }
  })();

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
          <h2 className="text-xl md:text-2xl font-bold font-space-grotesk" style={{ color: '#293056' }}>{title}</h2>
          
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
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {buildings.map((building) => (
              <div key={building.id} className="flex-shrink-0 w-72">
                <PropertyCardV3
                  image={building.image}
                  title={building.name}
                  address={building.address}
                  units={building.units}
                  priceRange={building.priceRange}
                  listingKey={building.listingKey}
                  onClick={() => {
                    // Navigate to property detail page if it has a listingKey
                    if (building.listingKey) {
                      window.location.href = `/property/${building.listingKey}`;
                    } else {
                      console.log('Building clicked:', building.name);
                    }
                  }}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {buildings
                    .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                    .map((building) => (
                      <PropertyCardV3
                        key={building.id}
                        image={building.image}
                        title={building.name}
                        address={building.address}
                        units={building.units}
                        priceRange={building.priceRange}
                        listingKey={building.listingKey}
                        onClick={() => {
                          // Navigate to property detail page if it has a listingKey
                          if (building.listingKey) {
                            window.location.href = `/property/${building.listingKey}`;
                          } else {
                            console.log('Building clicked:', building.name);
                          }
                        }}
                      />
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
      `}</style>
    </section>
  );
};

export default MoreBuildings;