import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import PropertyCard from '@/Website/Components/Property/PropertyCard';
import { usePage } from '@inertiajs/react';
import { createBuildingUrl } from '@/utils/slug';

// Skeleton loader component
const PropertyCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg h-64 mb-3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3 mt-3"></div>
    </div>
  </div>
);

// Image cache to avoid refetching
const imageCache = new Map();

const OptimizedMoreBuildings = ({
  title = "More Buildings By Agent",
  propertyData = null,
  propertyType: filterPropertyType = null,
  transactionType: filterTransactionType = null,
  buildingData = null,
  fetchType = null,
  lazy = true // Enable lazy loading by default
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [hasLoaded, setHasLoaded] = useState(false);
  const observerRef = useRef(null);
  const componentRef = useRef(null);

  const { listingKey, auth } = usePage().props;

  // Memoize property details
  const propertyType = useMemo(() => propertyData?.propertyType || null, [propertyData]);
  const propertySubType = useMemo(() => propertyData?.propertySubType || null, [propertyData]);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || hasLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasLoaded(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before component is visible
        threshold: 0.01
      }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [lazy, hasLoaded]);

  // Optimized fetch with caching
  const fetchWithCache = useCallback(async (url, cacheKey) => {
    // Check cache first
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey);
    }

    const response = await fetch(url);
    const data = await response.json();

    // Cache the response
    imageCache.set(cacheKey, data);

    // Clean old cache entries if too many (keep last 50)
    if (imageCache.size > 50) {
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }

    return data;
  }, []);

  // Batch image fetching
  const fetchImagesForListings = useCallback(async (listingsToProcess) => {
    const listingKeys = listingsToProcess
      .filter(listing => listing.listingKey && !listing.imageUrl)
      .map(listing => listing.listingKey);

    if (listingKeys.length === 0) return listingsToProcess;

    // Check cache for existing images
    const uncachedKeys = listingKeys.filter(key => !imageCache.has(`images_${key}`));

    if (uncachedKeys.length === 0) {
      // All images are cached
      return listingsToProcess.map(listing => {
        const cachedData = imageCache.get(`images_${listing.listingKey}`);
        if (cachedData) {
          return { ...listing, ...cachedData };
        }
        return listing;
      });
    }

    try {
      const imageResponse = await fetch('/api/property-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ listing_keys: uncachedKeys })
      });

      const imageResult = await imageResponse.json();
      const imagesData = imageResult.data?.images || imageResult.images;

      if (imageResult.success && imagesData) {
        // Cache individual image data
        Object.entries(imagesData).forEach(([key, data]) => {
          imageCache.set(`images_${key}`, data);
        });

        // Update listings with fetched images
        return listingsToProcess.map(listing => {
          const imageData = imagesData[listing.listingKey] || imageCache.get(`images_${listing.listingKey}`);
          if (imageData && imageData.image_url) {
            let processedImageUrl = imageData.image_url;
            if (processedImageUrl && processedImageUrl.includes('ampre.ca')) {
              processedImageUrl = processedImageUrl.replace('https://', 'http://');
            }

            const processedImages = (imageData.all_images || []).map(url => {
              if (url && url.includes('ampre.ca')) {
                return url.replace('https://', 'http://');
              }
              return url;
            });

            return {
              ...listing,
              imageUrl: processedImageUrl,
              images: processedImages
            };
          }
          return listing;
        });
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }

    return listingsToProcess;
  }, []);

  // Fetch nearby listings
  const fetchNearbyListings = useCallback(async () => {
    if (!listingKey) return;

    setIsLoading(true);
    try {
      const data = await fetchWithCache(
        `/api/nearby-listings?listingKey=${listingKey}&limit=6`,
        `nearby_${listingKey}`
      );

      if (data.properties && data.properties.length > 0) {
        const formattedListings = data.properties.map(formatPropertyData);
        const listingsWithImages = await fetchImagesForListings(formattedListings);
        setListings(listingsWithImages);
      }
    } catch (error) {
      console.error('Error fetching nearby listings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [listingKey, fetchWithCache, fetchImagesForListings]);

  // Fetch similar listings
  const fetchSimilarListings = useCallback(async () => {
    if (!listingKey) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        listingKey,
        limit: '6'
      });

      if (propertySubType) {
        params.append('propertySubType', propertySubType);
      }

      const data = await fetchWithCache(
        `/api/similar-listings?${params}`,
        `similar_${listingKey}_${propertySubType}`
      );

      if (data.properties && data.properties.length > 0) {
        const formattedListings = data.properties.map(formatPropertyData);
        const listingsWithImages = await fetchImagesForListings(formattedListings);
        setListings(listingsWithImages);
      }
    } catch (error) {
      console.error('Error fetching similar listings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [listingKey, propertySubType, fetchWithCache, fetchImagesForListings]);

  // Format property data
  const formatPropertyData = useCallback((property) => {
    return {
      listingKey: property.listingKey,
      propertyType: property.propertySubType || property.propertyType || "Residential",
      address: property.address || "Address not available",
      UnitNumber: property.UnitNumber || property.unitNumber || '',
      unitNumber: property.unitNumber || property.UnitNumber || '',
      StreetNumber: property.StreetNumber || property.streetNumber || '',
      streetNumber: property.streetNumber || property.StreetNumber || '',
      StreetName: property.StreetName || property.streetName || '',
      streetName: property.streetName || property.StreetName || '',
      StreetSuffix: property.StreetSuffix || property.streetSuffix || '',
      streetSuffix: property.streetSuffix || property.StreetSuffix || '',
      bedrooms: property.bedrooms || property.BedroomsTotal || property.bedroomsTotal || 0,
      BedroomsTotal: property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0,
      bedroomsTotal: property.bedroomsTotal || property.BedroomsTotal || property.bedrooms || 0,
      bathrooms: property.bathrooms || property.BathroomsTotalInteger || property.bathroomsTotalInteger || 0,
      BathroomsTotalInteger: property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0,
      bathroomsTotalInteger: property.bathroomsTotalInteger || property.BathroomsTotalInteger || property.bathrooms || 0,
      LivingAreaRange: property.LivingAreaRange || property.livingAreaRange || '',
      livingAreaRange: property.livingAreaRange || property.LivingAreaRange || '',
      BuildingAreaTotal: property.BuildingAreaTotal || property.buildingAreaTotal || '',
      buildingAreaTotal: property.buildingAreaTotal || property.BuildingAreaTotal || '',
      ParkingSpaces: property.ParkingSpaces || property.parkingSpaces || 0,
      parkingSpaces: property.parkingSpaces || property.ParkingSpaces || 0,
      ParkingTotal: property.ParkingTotal || property.parkingTotal || 0,
      parkingTotal: property.parkingTotal || property.ParkingTotal || 0,
      ListOfficeName: property.ListOfficeName || property.listOfficeName || '',
      listOfficeName: property.listOfficeName || property.ListOfficeName || '',
      price: property.price || 0,
      isRental: property.transactionType === 'Rent',
      transactionType: property.transactionType || 'Sale',
      imageUrl: property.MediaURL || null,
      images: property.images || [],
      source: 'mls'
    };
  }, []);

  // Main effect to trigger data fetching
  useEffect(() => {
    if (!isVisible) return;

    // If properties are passed directly
    if (propertyData?.properties && Array.isArray(propertyData.properties)) {
      setListings(propertyData.properties);
      setIsLoading(false);
      return;
    }

    // Fetch based on title
    if (title === "Nearby Listings") {
      fetchNearbyListings();
    } else if (title === "Similar Listings") {
      fetchSimilarListings();
    } else {
      setIsLoading(false);
    }
  }, [isVisible, title, fetchNearbyListings, fetchSimilarListings, propertyData]);

  // Slider navigation
  const nextSlide = useCallback(() => {
    if (currentSlide < Math.max(0, listings.length - 3)) {
      setCurrentSlide(currentSlide + 1);
      if (sliderRef.current) {
        sliderRef.current.scrollBy({ left: 420, behavior: 'smooth' });
      }
    }
  }, [currentSlide, listings.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      if (sliderRef.current) {
        sliderRef.current.scrollBy({ left: -420, behavior: 'smooth' });
      }
    }
  }, [currentSlide]);

  // Don't render anything if we have no listings and not loading
  if (!isLoading && listings.length === 0) {
    return null;
  }

  return (
    <div ref={componentRef} className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {listings.length > 3 && (
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide >= listings.length - 3}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading ? (
          // Show skeleton loaders while loading
          [...Array(3)].map((_, index) => (
            <div key={`skeleton-${index}`} className="flex-none w-[400px] snap-start">
              <PropertyCardSkeleton />
            </div>
          ))
        ) : (
          // Show actual listings
          listings.map((property, index) => (
            <div key={property.listingKey || property.id || index} className="flex-none w-[400px] snap-start">
              {fetchType === 'buildings' && property.id ? (
                // Building card
                <a
                  href={createBuildingUrl(property.slug)}
                  className="block hover:shadow-lg transition-shadow"
                >
                  <div className="bg-white rounded-lg overflow-hidden">
                    <img
                      src={property.main_image || '/images/placeholder-property.jpg'}
                      alt={property.name}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{property.name}</h3>
                      <p className="text-gray-600">{property.address}</p>
                      <div className="mt-2 flex gap-4 text-sm">
                        {property.units_for_sale > 0 && (
                          <span className="text-blue-600">{property.units_for_sale} for sale</span>
                        )}
                        {property.units_for_rent > 0 && (
                          <span className="text-green-600">{property.units_for_rent} for rent</span>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ) : (
                // Property card
                <PropertyCard
                  property={property}
                  isAuthenticated={!!auth?.user}
                  userFavourites={auth?.user?.favourite_properties || []}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OptimizedMoreBuildings;