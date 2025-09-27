// hooks/usePropertyListings.js
import { useState, useEffect, useCallback, useRef } from 'react';
import imageOptimizationService from '../services/ImageOptimizationService';

const usePropertyListings = (listingKey) => {
  const [nearbyListings, setNearbyListings] = useState([]);
  const [similarListings, setSimilarListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Update image loading state
  const updateImageLoadingState = useCallback((listingId, loaded) => {
    if (!mountedRef.current) return;
    
    setImageLoadingStates(prev => ({
      ...prev,
      [listingId]: loaded
    }));
  }, []);

  // Fetch nearby listings with enhanced error handling and timeout
  const fetchNearbyListings = useCallback(async () => {
    if (!listingKey || !mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller with timeout
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => abortControllerRef.current.abort(), 10000); // 10 second timeout

      const response = await fetch(`/api/nearby-listings?listingKey=${listingKey}&limit=6`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!mountedRef.current) return;

      if (data.properties && data.properties.length > 0) {
        const formattedListings = data.properties.map(formatPropertyForDisplay);
        setNearbyListings(formattedListings);

        // Preload images with staggered loading
        const imageUrls = formattedListings
          .map(listing => listing.imageUrl || listing.MediaURL)
          .filter(Boolean);

        if (imageUrls.length > 0) {
          setTimeout(() => {
            imageOptimizationService.preloadImages(imageUrls, 2)
              .then(results => {
                if (!mountedRef.current) return;
                
                results.forEach((result, index) => {
                  if (!result.error) {
                    const listing = formattedListings[index];
                    if (listing) {
                      updateImageLoadingState(listing.listingKey, true);
                    }
                  }
                });
              })
              .catch(error => {
                console.warn('Nearby listings image preloading failed:', error);
              });
          }, 100); // Small delay to prevent blocking UI
        }

        // Fetch images via API with timeout
        await fetchImagesForListings(formattedListings, setNearbyListings);
      } else {
        setNearbyListings([]);
      }

    } catch (error) {
      if (!mountedRef.current) return;
      
      if (error.name === 'AbortError') {
        console.log('Nearby listings request was aborted');
        return;
      }

      console.error('Error fetching nearby listings:', error);
      setError(error.message);
      setNearbyListings([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [listingKey, updateImageLoadingState]);

  // Fetch similar listings with enhanced error handling
  const fetchSimilarListings = useCallback(async () => {
    if (!listingKey || !mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller with timeout
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => abortControllerRef.current.abort(), 10000);

      const response = await fetch(`/api/similar-listings?listingKey=${listingKey}&limit=6`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!mountedRef.current) return;

      if (data.properties && data.properties.length > 0) {
        const formattedListings = data.properties.map(formatPropertyForDisplay);
        setSimilarListings(formattedListings);

        // Preload images with staggered loading
        const imageUrls = formattedListings
          .map(listing => listing.imageUrl || listing.MediaURL)
          .filter(Boolean);

        if (imageUrls.length > 0) {
          setTimeout(() => {
            imageOptimizationService.preloadImages(imageUrls, 2)
              .then(results => {
                if (!mountedRef.current) return;
                
                results.forEach((result, index) => {
                  if (!result.error) {
                    const listing = formattedListings[index];
                    if (listing) {
                      updateImageLoadingState(listing.listingKey, true);
                    }
                  }
                });
              })
              .catch(error => {
                console.warn('Similar listings image preloading failed:', error);
              });
          }, 200); // Slightly more delay for similar listings
        }

        // Fetch images via API with timeout
        await fetchImagesForListings(formattedListings, setSimilarListings);
      } else {
        setSimilarListings([]);
      }

    } catch (error) {
      if (!mountedRef.current) return;
      
      if (error.name === 'AbortError') {
        console.log('Similar listings request was aborted');
        return;
      }

      console.error('Error fetching similar listings:', error);
      setError(error.message);
      setSimilarListings([]);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [listingKey, updateImageLoadingState]);

  // Enhanced image fetching with better error handling
  const fetchImagesForListings = async (listings, setListings) => {
    if (!listings || listings.length === 0) return;

    const listingKeysToFetch = listings
      .filter(listing => listing.listingKey)
      .map(listing => listing.listingKey);
    
    if (listingKeysToFetch.length === 0) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const imageResponse = await fetch('/api/property-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ listing_keys: listingKeysToFetch }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!imageResponse.ok) {
        console.warn(`Image API returned ${imageResponse.status}, continuing without images`);
        return;
      }

      const imageResult = await imageResponse.json();
      const imagesData = imageResult.data?.images || imageResult.images;
      
      if (imageResult.success && imagesData) {
        // Update listings with fetched images
        setListings(prev => prev.map(listing => {
          const imageData = imagesData[listing.listingKey];
          if (imageData && imageData.image_url) {
            // Process image URL to fix SSL issues
            let processedImageUrl = imageData.image_url;
            if (processedImageUrl && processedImageUrl.includes('ampre.ca')) {
              processedImageUrl = processedImageUrl.replace('https://', 'http://');
            }
            
            return { 
              ...listing, 
              imageUrl: processedImageUrl,
              images: imageData.all_images || []
            };
          }
          return listing;
        }));
      }
    } catch (imgError) {
      if (imgError.name === 'AbortError') {
        console.warn('Image fetch timeout - continuing without images');
      } else {
        console.error('Error fetching images:', imgError);
      }
    }
  };

  // Format property data for consistent display
  const formatPropertyForDisplay = (property) => {
    let imageUrl = property.MediaURL || property.imageUrl || property.image_url || null;
    
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
      imageUrl: imageUrl,
      images: property.images || [],
      source: 'mls'
    };
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (listingKey) {
      fetchNearbyListings();
      fetchSimilarListings();
    }
  }, [listingKey, fetchNearbyListings, fetchSimilarListings]);

  // Retry function
  const retry = useCallback(() => {
    if (listingKey) {
      imageOptimizationService.clearFailedImages(); // Clear failed images for retry
      fetchNearbyListings();
      fetchSimilarListings();
    }
  }, [listingKey, fetchNearbyListings, fetchSimilarListings]);

  return {
    nearbyListings,
    similarListings,
    loading,
    error,
    imageLoadingStates,
    updateImageLoadingState,
    retry,
    fetchNearbyListings,
    fetchSimilarListings,
  };
};

export default usePropertyListings;