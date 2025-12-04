import React, { useState, useRef, useEffect } from 'react';
import PropertyCardV5 from '../../Global/Components/PropertyCards/PropertyCardV5';
import { usePage } from '@inertiajs/react';

const ComparableSales = ({
  title = "Comparable Sales",
  propertyData = null
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [comparableSales, setComparableSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { listingKey } = usePage().props;

  // Fetch comparable sales from API
  useEffect(() => {
    if (listingKey) {
      fetchComparableSales();
    } else {
      setIsLoading(false);
    }
  }, [listingKey]);

  const fetchComparableSales = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comparable-sales?listingKey=${listingKey}&limit=12`);
      const data = await response.json();

      console.log('Comparable sales API response:', data);

      if (data.properties && data.properties.length > 0) {
        // Format the data exactly like search page does for PropertyCardV5
        const formattedSales = data.properties.map((property) => {
          let imageUrl = property.MediaURL || null;

          return {
            // Match PropertyCardV5 expected format
            listingKey: property.listingKey,
            propertyType: property.propertySubType || property.propertyType || "Residential",
            PropertySubType: property.propertySubType || property.PropertySubType || property.propertyType,
            address: property.address || "Address not available",
            // Include fields needed for formatCardAddress
            UnitNumber: property.UnitNumber || property.unitNumber || '',
            unitNumber: property.unitNumber || property.UnitNumber || '',
            StreetNumber: property.StreetNumber || property.streetNumber || '',
            streetNumber: property.streetNumber || property.StreetNumber || '',
            StreetName: property.StreetName || property.streetName || '',
            streetName: property.streetName || property.StreetName || '',
            StreetSuffix: property.StreetSuffix || property.streetSuffix || '',
            streetSuffix: property.streetSuffix || property.StreetSuffix || '',
            // Include fields for buildCardFeatures
            bedrooms: property.bedrooms || property.BedroomsTotal || property.bedroomsTotal || 0,
            BedroomsTotal: property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0,
            bedroomsTotal: property.bedroomsTotal || property.BedroomsTotal || property.bedrooms || 0,
            bathrooms: property.bathrooms || property.BathroomsTotalInteger || property.bathroomsTotalInteger || 0,
            BathroomsTotalInteger: property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0,
            bathroomsTotalInteger: property.bathroomsTotalInteger || property.BathroomsTotalInteger || property.bathrooms || 0,
            LivingArea: property.LivingArea || property.livingArea || property.LotSizeSquareFeet || null,
            livingArea: property.livingArea || property.LivingArea || property.LotSizeSquareFeet || null,
            LivingAreaRange: property.LivingAreaRange || property.livingAreaRange || '',
            livingAreaRange: property.livingAreaRange || property.LivingAreaRange || '',
            ParkingTotal: property.ParkingTotal || property.parkingTotal || 0,
            parkingTotal: property.parkingTotal || property.ParkingTotal || 0,
            // Price fields - use sold price for comparable sales
            price: property.soldPrice || property.price || property.ListPrice,
            ListPrice: property.soldPrice || property.ListPrice || property.price,
            listPrice: property.soldPrice || property.listPrice || property.price,
            soldPrice: property.soldPrice,
            soldDate: property.soldDate,
            daysOnMarket: property.daysOnMarket,
            // Image - PropertyCardV5 uses imageUrl
            imageUrl: imageUrl,
            MediaURL: imageUrl,
            image: imageUrl,
            images: property.images || [],
            // MLS fields
            MlsStatus: 'Sold',
            mlsStatus: 'Sold',
            StandardStatus: 'Closed',
            standardStatus: 'Closed',
            source: 'mls',
            // Additional fields
            City: property.City || property.city || '',
            city: property.city || property.City || '',
            isSold: true,
          };
        });

        setComparableSales(formattedSales);
      } else {
        setComparableSales([]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching comparable sales:', error);
      setComparableSales([]);
      setIsLoading(false);
    }
  };

  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(comparableSales.length / itemsPerSlide);

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

  // Don't render if no sales available
  if (!isLoading && (!comparableSales || comparableSales.length === 0)) {
    return null;
  }

  return (
    <section className="p-3 rounded-xl border-gray-200 border shadow-sm bg-gray-50 similar-listings-container">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk" style={{ color: '#293056' }}>{title}</h2>
          </div>

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

        {/* Mobile: Horizontal Scrollable Row */}
        {!isLoading && comparableSales.length > 0 && (
        <div className="block md:hidden">
          <div className="mobile-listings-scroll">
            {comparableSales.map((property) => (
              <div key={property.listingKey} className="flex-shrink-0 carousel-item">
                <PropertyCardV5
                  property={property}
                  size="default"
                  className="w-[300px]"
                />
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Desktop: Slider Container */}
        {!isLoading && comparableSales.length > 0 && (
        <div className="hidden md:block relative overflow-hidden">
          <div
            ref={sliderRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="desktop-listings-grid">
                  {comparableSales
                    .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                    .map((property) => (
                      <div key={property.listingKey} className="flex justify-center items-start slider-item">
                        <PropertyCardV5
                          property={property}
                          size="default"
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
        {!isLoading && comparableSales.length > 0 && totalSlides > 1 && (
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

export default ComparableSales;
