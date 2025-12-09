import React, { useState, useRef, useEffect } from 'react';
import PropertyCardV3 from '../../Global/Cards/PropertyCardV3';
import PropertyCardV5 from '../../Global/Components/PropertyCards/PropertyCardV5';
import { usePage } from '@inertiajs/react';
import { createBuildingUrl } from '@/utils/slug';

const MoreBuildings = ({
  title = "More Buildings By Agent",
  propertyData = null,
  propertyType: filterPropertyType = null,
  transactionType: filterTransactionType = null,
  buildingData = null,
  fetchType = null // 'buildings' for backend buildings, null for MLS properties
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [nearbyListings, setNearbyListings] = useState([]);
  const [similarListings, setSimilarListings] = useState([]);
  const [condoListings, setCondoListings] = useState([]);
  const [buildingsData, setBuildingsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [showAllListings, setShowAllListings] = useState(false);
  
  const { listingKey, auth, globalWebsite, website } = usePage().props;

  // Get brand colors for button styling
  const currentWebsite = globalWebsite || website || {};
  const brandColors = currentWebsite?.brand_colors || {
    primary: '#912018',
    secondary: '#293056',
    button_primary_bg: '#912018',
    button_primary_text: '#FFFFFF'
  };
  const buttonPrimaryBg = brandColors.button_primary_bg || brandColors.primary || '#293056';
  const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';
  
  // Get property type and subtype from propertyData
  const propertyType = propertyData?.propertyType || null;
  const propertySubType = propertyData?.propertySubType || null;

  // NO SAMPLE DATA - only show real listings from API

  // Fetch listings from API based on title (skip if properties are passed directly)
  useEffect(() => {
    // DEBUG: Log all incoming props to identify issues
    console.log(`[MoreBuildings] ========== useEffect START for "${title}" ==========`);
    console.log(`[MoreBuildings] filterPropertyType="${filterPropertyType}"`);
    console.log(`[MoreBuildings] filterTransactionType="${filterTransactionType}"`);
    console.log(`[MoreBuildings] buildingData exists:`, !!buildingData);

    if (buildingData) {
      console.log(`[MoreBuildings] buildingData.name:`, buildingData.name);
      console.log(`[MoreBuildings] buildingData.mls_properties_for_sale:`, buildingData.mls_properties_for_sale);
      console.log(`[MoreBuildings] mls_properties_for_sale length:`, buildingData.mls_properties_for_sale?.length);
      console.log(`[MoreBuildings] mls_properties_for_rent length:`, buildingData.mls_properties_for_rent?.length);
    }

    // If properties are passed directly, no need to fetch from API
    if (propertyData?.properties && Array.isArray(propertyData.properties)) {
      console.log('[MoreBuildings] PATH: Using properties passed directly');
      setIsLoading(false);
      return;
    }

    // If we need to fetch buildings from backend
    if (fetchType === 'buildings') {
      console.log('[MoreBuildings] PATH: fetchType is buildings');
      if (title === "Nearby Buildings" || title === "Similar Buildings" || title.startsWith("More Buildings by")) {
        fetchBuildings();
      }
      return;
    }

    // If we need to fetch condo apartments (for building page)
    // Check if this is a Properties For Sale/Rent section on building page
    const isPropertiesSection = (title === "Properties For Sale" || title === "Properties For Rent");
    console.log(`[MoreBuildings] isPropertiesSection:`, isPropertiesSection);
    console.log(`[MoreBuildings] Checking buildingData:`, !!buildingData);

    if (isPropertiesSection && buildingData) {
      console.log(`[MoreBuildings] PATH: Properties section for "${title}"`);

      // Check if pre-loaded MLS properties are available from backend FIRST
      const preloadedProperties = filterTransactionType === 'For Rent'
        ? buildingData?.mls_properties_for_rent
        : buildingData?.mls_properties_for_sale;

      console.log(`[MoreBuildings] preloadedProperties for "${filterTransactionType}":`, preloadedProperties);
      console.log(`[MoreBuildings] preloadedProperties length:`, preloadedProperties?.length);

      if (preloadedProperties && preloadedProperties.length > 0) {
        console.log(`[MoreBuildings] SUCCESS: Using ${preloadedProperties.length} pre-loaded MLS properties`);
        console.log(`[MoreBuildings] First preloaded property:`, preloadedProperties[0]);

        // Backend already formats properties correctly - just use them directly
        // Properties already have: listingKey, price, address, bedrooms, bathrooms, imageUrl, images, etc.
        const formattedListings = preloadedProperties.map((property) => {
          // Get the first image URL - check both formats
          let imageUrl = property.imageUrl || property.MediaURL || null;
          if (!imageUrl && property.images && Array.isArray(property.images) && property.images.length > 0) {
            imageUrl = property.images[0];
          }

          return {
            // Use the pre-formatted fields from backend (listingKey, not mls_id)
            listingKey: property.listingKey || property.ListingKey || property.mls_id,
            id: property._mls_property_id || property.id,
            propertyType: property.propertyType || property.PropertySubType || "Condo Apartment",
            address: property.address || property.UnparsedAddress || "Address not available",
            city: property.city || property.City || '',
            bedrooms: property.bedrooms || property.BedroomsTotal || property.bedroomsTotal || 0,
            BedroomsTotal: property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0,
            bedroomsTotal: property.bedroomsTotal || property.BedroomsTotal || property.bedrooms || 0,
            bathrooms: property.bathrooms || property.BathroomsTotalInteger || property.bathroomsTotalInteger || 0,
            BathroomsTotalInteger: property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0,
            bathroomsTotalInteger: property.bathroomsTotalInteger || property.BathroomsTotalInteger || property.bathrooms || 0,
            BuildingAreaTotal: property.BuildingAreaTotal || property.buildingAreaTotal || '',
            buildingAreaTotal: property.buildingAreaTotal || property.BuildingAreaTotal || '',
            price: property.price || property.ListPrice || 0,
            ListPrice: property.ListPrice || property.price || 0,
            isRental: property.isRental || filterTransactionType === 'For Rent',
            transactionType: property.transactionType || filterTransactionType || 'For Sale',
            imageUrl: imageUrl,
            images: property.images || [],
            source: property.source || 'mls'
          };
        });

        console.log('[MoreBuildings] Formatted listings count:', formattedListings.length);
        console.log('[MoreBuildings] First formatted listing:', formattedListings[0]);
        setCondoListings(formattedListings);
        setIsLoading(false);
        console.log(`[MoreBuildings] ========== useEffect END (success) ==========`);
        return;
      }

      // No pre-loaded data available - show empty state (no API fallback)
      console.log(`[MoreBuildings] WARNING: No preloaded data found for ${title}`);
      console.log(`[MoreBuildings] Setting empty condoListings`);
      setCondoListings([]);
      setIsLoading(false);
      console.log(`[MoreBuildings] ========== useEffect END (no data) ==========`);
      return;
    }

    if (listingKey) {
      if (title === "Nearby Listings") {
        fetchNearbyListings();
      } else if (title === "Similar Listings") {
        fetchSimilarListings();
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [listingKey, title, propertyData, filterPropertyType, filterTransactionType, fetchType, buildingData]);
  
  const fetchNearbyListings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/nearby-listings?listingKey=${listingKey}&limit=6`);
      const data = await response.json();
      
      console.log('Nearby listings API response:', data);
      
      if (data.properties && data.properties.length > 0) {
        // Format the data exactly like search page does for PropertyCardV5
        const formattedListings = data.properties.map((property) => {
          let imageUrl = property.MediaURL || null;
          
          return {
            // Match PropertyCardV5 expected format
            listingKey: property.listingKey,
            propertyType: property.propertySubType || property.propertyType || "Residential",
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
        });
        
        console.log('Formatted nearby listings:', formattedListings);
        setNearbyListings(formattedListings);
        
        // Fetch ALL images directly via API
        const listingKeysToFetch = formattedListings
          .filter(listing => listing.listingKey)
          .map(listing => listing.listingKey);

        if (listingKeysToFetch.length > 0) {
          console.log('Fetching images for listings:', listingKeysToFetch);
          setIsLoadingImages(true);

          // Fetch all images in one API call
          try {
            const imageResponse = await fetch('/api/property-images', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
              },
              body: JSON.stringify({ listing_keys: listingKeysToFetch })
            });

            const imageResult = await imageResponse.json();
            console.log('Image API response:', imageResult);

            // Check both possible response structures
            const imagesData = imageResult.data?.images || imageResult.images;

            if (imageResult.success && imagesData) {
              console.log('Images data found:', imagesData);
              // Update listings with fetched images
              setNearbyListings(prev => prev.map(listing => {
                const imageData = imagesData[listing.listingKey];
                if (imageData && imageData.image_url) {
                  // Convert HTTPS to HTTP for AMPRE images to avoid SSL errors
                  let processedImageUrl = imageData.image_url;
                  if (processedImageUrl && processedImageUrl.includes('ampre.ca')) {
                    processedImageUrl = processedImageUrl.replace('https://', 'http://');
                  }

                  // Process all images array too
                  const processedImages = (imageData.all_images || []).map(url => {
                    if (url && typeof url === 'string' && url.includes('ampre.ca')) {
                      return url.replace('https://', 'http://');
                    }
                    return url;
                  });

                  console.log(`Updating image for ${listing.listingKey}:`, processedImageUrl);
                  return {
                    ...listing,
                    imageUrl: processedImageUrl,
                    images: processedImages
                  };
                }
                return listing;
              }));
            }
          } catch (imgError) {
            console.error('Error fetching images:', imgError);
          } finally {
            setIsLoadingImages(false);
          }
        }
      } else {
        setNearbyListings([]);
      }
    } catch (error) {
      console.error('Error fetching nearby listings:', error);
      setNearbyListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSimilarListings = async () => {
    setIsLoading(true);
    try {
      // Build query params - keep it simple to avoid backend errors
      const params = new URLSearchParams({
        listingKey: listingKey,
        limit: 6
      });
      
      console.log('Fetching similar listings with params:', params.toString());
      
      const response = await fetch(`/api/similar-listings?${params.toString()}`);
      const data = await response.json();
      
      console.log('Similar listings API response:', data);
      
      if (data.properties && data.properties.length > 0) {
        // Format the data exactly like search page does for PropertyCardV5
        const formattedListings = data.properties.map((property) => {
          let imageUrl = property.MediaURL || null;
          
          return {
            // Match PropertyCardV5 expected format
            listingKey: property.listingKey,
            propertyType: property.propertySubType || property.propertyType || "Residential",
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
        });
        
        console.log('Formatted similar listings:', formattedListings);
        setSimilarListings(formattedListings);
        
        // Fetch ALL images directly via API 
        const listingKeysToFetch = formattedListings
          .filter(listing => listing.listingKey)
          .map(listing => listing.listingKey);
        
        if (listingKeysToFetch.length > 0) {
          console.log('Fetching images for listings:', listingKeysToFetch);
          setIsLoadingImages(true);

          // Fetch all images in one API call
          try {
            const imageResponse = await fetch('/api/property-images', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
              },
              body: JSON.stringify({ listing_keys: listingKeysToFetch })
            });

            const imageResult = await imageResponse.json();
            console.log('Image API response:', imageResult);

            // Check both possible response structures
            const imagesData = imageResult.data?.images || imageResult.images;

            if (imageResult.success && imagesData) {
              console.log('Images data found:', imagesData);
              // Update listings with fetched images
              setSimilarListings(prev => prev.map(listing => {
                const imageData = imagesData[listing.listingKey];
                if (imageData && imageData.image_url) {
                  // Convert HTTPS to HTTP for AMPRE images to avoid SSL errors
                  let processedImageUrl = imageData.image_url;
                  if (processedImageUrl && processedImageUrl.includes('ampre.ca')) {
                    processedImageUrl = processedImageUrl.replace('https://', 'http://');
                  }

                  // Process all images array too
                  const processedImages = (imageData.all_images || []).map(url => {
                    if (url && typeof url === 'string' && url.includes('ampre.ca')) {
                      return url.replace('https://', 'http://');
                    }
                    return url;
                  });

                  console.log(`Updating image for ${listing.listingKey}:`, processedImageUrl);
                  return {
                    ...listing,
                    imageUrl: processedImageUrl,
                    images: processedImages
                  };
                }
                return listing;
              }));
            }
          } catch (imgError) {
            console.error('Error fetching images:', imgError);
          } finally {
            setIsLoadingImages(false);
          }
        }
      } else {
        setSimilarListings([]);
      }
    } catch (error) {
      console.error('Error fetching similar listings:', error);
      setSimilarListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch condo apartments for building page - Uses pre-loaded MLS properties from backend
  const fetchCondoApartments = async () => {
    setIsLoading(true);
    console.log('[fetchCondoApartments] Starting...');
    console.log('[fetchCondoApartments] filterTransactionType:', filterTransactionType);
    console.log('[fetchCondoApartments] buildingData:', buildingData);

    try {
      // Use pre-loaded MLS properties from backend
      const preloadedProperties = filterTransactionType === 'For Rent'
        ? buildingData?.mls_properties_for_rent
        : buildingData?.mls_properties_for_sale;

      console.log('[fetchCondoApartments] preloadedProperties:', preloadedProperties);
      console.log('[fetchCondoApartments] preloadedProperties count:', preloadedProperties?.length || 0);

      if (preloadedProperties && preloadedProperties.length > 0) {
        console.log(`[fetchCondoApartments] Using pre-loaded MLS properties (${filterTransactionType}):`, preloadedProperties.length);

        // Backend already formats properties correctly - just use them directly
        const formattedListings = preloadedProperties.map((property) => {
          // Get the first image URL - check both formats
          let imageUrl = property.imageUrl || property.MediaURL || null;
          if (!imageUrl && property.images && Array.isArray(property.images) && property.images.length > 0) {
            imageUrl = property.images[0];
          }

          return {
            // Use the pre-formatted fields from backend (listingKey, not mls_id)
            listingKey: property.listingKey || property.ListingKey || property.mls_id,
            id: property._mls_property_id || property.id,
            propertyType: property.propertyType || property.PropertySubType || "Condo Apartment",
            address: property.address || property.UnparsedAddress || "Address not available",
            city: property.city || property.City || '',
            bedrooms: property.bedrooms || property.BedroomsTotal || property.bedroomsTotal || 0,
            BedroomsTotal: property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0,
            bedroomsTotal: property.bedroomsTotal || property.BedroomsTotal || property.bedrooms || 0,
            bathrooms: property.bathrooms || property.BathroomsTotalInteger || property.bathroomsTotalInteger || 0,
            BathroomsTotalInteger: property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0,
            bathroomsTotalInteger: property.bathroomsTotalInteger || property.BathroomsTotalInteger || property.bathrooms || 0,
            BuildingAreaTotal: property.BuildingAreaTotal || property.buildingAreaTotal || '',
            buildingAreaTotal: property.buildingAreaTotal || property.BuildingAreaTotal || '',
            price: property.price || property.ListPrice || 0,
            ListPrice: property.ListPrice || property.price || 0,
            isRental: property.isRental || filterTransactionType === 'For Rent',
            transactionType: property.transactionType || filterTransactionType || 'For Sale',
            imageUrl: imageUrl,
            images: property.images || [],
            source: property.source || 'mls'
          };
        });

        console.log('[fetchCondoApartments] Formatted listings:', formattedListings.length);
        setCondoListings(formattedListings);
      } else {
        // No pre-loaded properties available
        console.log('[fetchCondoApartments] No preloaded properties found, showing empty');
        setCondoListings([]);
      }
    } catch (error) {
      console.error('[fetchCondoApartments] Error:', error);
      setCondoListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch buildings from backend database
  const fetchBuildings = async () => {
    setIsLoading(true);
    try {
      // Prepare query parameters for buildings
      const params = new URLSearchParams();

      // Add city filter if available
      if (buildingData?.city) {
        params.append('city', buildingData.city);
      }

      // Add limit - don't limit if we don't have many buildings
      // params.append('limit', '12');

      // For Similar Buildings, filter by building type
      if (title === "Similar Buildings" && buildingData?.building_type) {
        params.append('building_type', buildingData.building_type);
      }

      // For Developer Buildings, filter by developer_name
      if (title.startsWith("More Buildings by") && buildingData?.developer_name) {
        params.append('developer_name', buildingData.developer_name);
        console.log('DeveloperBuildings - developer_name:', buildingData.developer_name);
        console.log('DeveloperBuildings - Fetching buildings for developer:', buildingData.developer_name);
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
      console.log('Buildings API response:', result);

      // The API returns buildings directly in data array
      const buildings = result.data || result || [];

      console.log('DeveloperBuildings - Total buildings found:', buildings.length);

      if (buildings && buildings.length > 0) {
        // Filter out current building if it's in the results
        const filteredBuildings = buildings.filter(b => b.id !== buildingData?.id);

        console.log('DeveloperBuildings - After filtering current building:', filteredBuildings.length);
        
        // Format buildings for display as property cards
        const formattedBuildings = filteredBuildings.map((building) => {
          // Process image URL
          let imageUrl = building.main_image;
          if (!imageUrl && building.images && Array.isArray(building.images) && building.images.length > 0) {
            imageUrl = building.images[0];
          }
          if (!imageUrl) {
            imageUrl = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80';
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
            totalUnits: building.total_units,
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

        console.log('Formatted buildings:', formattedBuildings);
        console.log('DeveloperBuildings - Rendering with', formattedBuildings.length, 'buildings');
        setBuildingsData(formattedBuildings);
      } else {
        // If no buildings found, use sample data for demonstration
        const sampleBuildings = [
          {
            id: 'sample-1',
            listingKey: 'BLDG-SAMPLE-1',
            propertyType: 'Residential Building',
            address: '123 King Street West',
            name: 'King West Condos',
            city: 'Toronto',
            province: 'ON',
            imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80',
            price: 45,
            bedrooms: '1-3',
            bathrooms: '1-2',
            totalUnits: 250,
            unitsForSale: 45,
            unitsForRent: 12,
            yearBuilt: 2020,
            isRental: false,
            transactionType: 'Building',
            source: 'building',
            UnitNumber: '',
            StreetNumber: '123',
            StreetName: 'King Street West',
            City: 'Toronto',
            StateOrProvince: 'ON'
          },
          {
            id: 'sample-2',
            listingKey: 'BLDG-SAMPLE-2',
            propertyType: 'Luxury Condo',
            address: '88 Blue Jays Way',
            name: 'SkyView Towers',
            city: 'Toronto',
            province: 'ON',
            imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&auto=format&q=80',
            price: 28,
            bedrooms: '1-2',
            bathrooms: '1-2',
            totalUnits: 180,
            unitsForSale: 28,
            unitsForRent: 8,
            yearBuilt: 2019,
            isRental: false,
            transactionType: 'Building',
            source: 'building',
            UnitNumber: '',
            StreetNumber: '88',
            StreetName: 'Blue Jays Way',
            City: 'Toronto',
            StateOrProvince: 'ON'
          },
          {
            id: 'sample-3',
            listingKey: 'BLDG-SAMPLE-3',
            propertyType: 'Mixed Use',
            address: '155 Yorkville Avenue',
            name: 'Yorkville Plaza',
            city: 'Toronto',
            province: 'ON',
            imageUrl: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=400&h=300&fit=crop&auto=format&q=80',
            price: 52,
            bedrooms: '2-4',
            bathrooms: '2-3',
            totalUnits: 320,
            unitsForSale: 52,
            unitsForRent: 15,
            yearBuilt: 2021,
            isRental: false,
            transactionType: 'Building',
            source: 'building',
            UnitNumber: '',
            StreetNumber: '155',
            StreetName: 'Yorkville Avenue',
            City: 'Toronto',
            StateOrProvince: 'ON'
          }
        ];
        
        // Filter to show different buildings for Nearby vs Similar
        if (title === "Similar Buildings") {
          setBuildingsData(sampleBuildings.slice(0, 2));
        } else {
          setBuildingsData(sampleBuildings);
        }
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      setBuildingsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Choose data based on title and API availability or direct properties
  const buildings = (() => {
    console.log(`[MoreBuildings CALC v3] Starting for "${title}"`);
    console.log(`[MoreBuildings CALC v3] buildingData:`, buildingData);
    console.log(`[MoreBuildings CALC v3] buildingData keys:`, buildingData ? Object.keys(buildingData) : 'NULL');
    console.log(`[MoreBuildings CALC v3] filterTransactionType:`, filterTransactionType);
    console.log(`[MoreBuildings CALC v3] mls_properties_for_sale:`, buildingData?.mls_properties_for_sale);
    console.log(`[MoreBuildings CALC v3] mls_properties_for_rent:`, buildingData?.mls_properties_for_rent);

    // Check if properties are passed directly in propertyData
    if (propertyData?.properties && Array.isArray(propertyData.properties)) {
      console.log(`[MoreBuildings CALC] Returning propertyData.properties`);
      return propertyData.properties;
    }
    // Use buildings data for Nearby/Similar/Developer Buildings
    if (title === "Nearby Buildings" || title === "Similar Buildings" || title.startsWith("More Buildings by")) {
      console.log(`[MoreBuildings CALC] Returning buildingsData for ${title}`);
      return buildingsData;
    }
    // Use condo listings for Properties For Sale/Rent
    if (title === "Properties For Sale" || title === "Properties For Rent") {
      console.log(`[MoreBuildings CALC] Properties section detected`);
      console.log(`[MoreBuildings CALC] condoListings.length:`, condoListings?.length);

      // If condoListings has data, use it
      if (condoListings && condoListings.length > 0) {
        console.log(`[MoreBuildings CALC] Returning condoListings`);
        return condoListings;
      }
      // Otherwise, directly use from buildingData if available (fallback)
      // Properties are now formatted same as search page API
      if (buildingData) {
        console.log(`[MoreBuildings CALC] buildingData exists, checking MLS properties`);
        console.log(`[MoreBuildings CALC] mls_properties_for_sale:`, buildingData.mls_properties_for_sale);
        console.log(`[MoreBuildings CALC] mls_properties_for_rent:`, buildingData.mls_properties_for_rent);

        const preloadedProperties = filterTransactionType === 'For Rent'
          ? buildingData.mls_properties_for_rent
          : buildingData.mls_properties_for_sale;

        console.log(`[MoreBuildings CALC] preloadedProperties for ${filterTransactionType}:`, preloadedProperties);

        if (preloadedProperties && preloadedProperties.length > 0) {
          console.log(`[MoreBuildings CALC] SUCCESS: Returning ${preloadedProperties.length} preloaded properties`);
          // Properties are already formatted by backend - just return them directly
          return preloadedProperties;
        }
      } else {
        console.log(`[MoreBuildings CALC] buildingData is NULL/undefined!`);
      }
      console.log(`[MoreBuildings CALC] Falling back to condoListings (empty)`);
      return condoListings;
    }
    // Otherwise use API data based on title
    if (title === "Nearby Listings") {
      return nearbyListings;
    } else if (title === "Similar Listings") {
      return similarListings;
    } else {
      // For "More Buildings By Agent" or any other title, return empty array if no API data
      return [];
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

  // Check if this should be displayed as a grid (for Properties For Sale/Rent on building page)
  const isGridLayout = (title === "Properties For Sale" || title === "Properties For Rent") && buildingData;

  // DEBUG: Log what we're about to render
  console.log(`[MoreBuildings RENDER] title="${title}"`);
  console.log(`[MoreBuildings RENDER] buildings.length=${buildings.length}`);
  console.log(`[MoreBuildings RENDER] isGridLayout=${isGridLayout}`);
  console.log(`[MoreBuildings RENDER] isLoading=${isLoading}`);
  console.log(`[MoreBuildings RENDER] buildingData exists:`, !!buildingData);
  if (buildings.length > 0) {
    console.log(`[MoreBuildings RENDER] First building:`, buildings[0]);
  }

  return (
    <section className={`p-3 rounded-xl border-gray-200 border shadow-sm bg-gray-50 ${
      title === "Nearby Listings" ? 'nearby-listings-container' :
      title === "Similar Listings" ? 'similar-listings-container' : ''
    }`}>
      <div className="max-w-[1280px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold font-space-grotesk" style={{ color: '#293056' }}>{title}</h2>
            {/* Show count bubble for Properties For Sale/Rent on building page */}
            {isGridLayout && (() => {
              // Get count from buildings or fallback to preloaded data
              let count = buildings.length;
              if (count === 0 && buildingData) {
                const preloaded = title === "Properties For Rent"
                  ? buildingData.mls_properties_for_rent
                  : buildingData.mls_properties_for_sale;
                count = preloaded?.length || 0;
              }
              return count > 0 ? (
                <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold rounded-full" style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}>
                  {count}
                </span>
              ) : null;
            })()}
          </div>
          
          {/* Navigation Arrows - Desktop Only (hide for grid layout) */}
          {!isGridLayout && (
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

        {/* Loading State - Show while loading data OR loading images */}
        {((isLoading && buildings.length === 0) || isLoadingImages) && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#293056]"></div>
          </div>
        )}

        {/* No Data State - Only show if not loading AND no buildings AND no preloaded data */}
        {!isLoading && !isLoadingImages && buildings.length === 0 && (
          (() => {
            // For Properties sections, check if buildingData has MLS properties
            const hasPreloadedSale = buildingData?.mls_properties_for_sale?.length > 0;
            const hasPreloadedRent = buildingData?.mls_properties_for_rent?.length > 0;

            console.log(`[MoreBuildings NO DATA] title="${title}", hasPreloadedSale=${hasPreloadedSale}, hasPreloadedRent=${hasPreloadedRent}`);
            console.log(`[MoreBuildings NO DATA] buildingData keys:`, buildingData ? Object.keys(buildingData) : 'NULL');

            if (title === "Properties For Sale" && hasPreloadedSale) return null;
            if (title === "Properties For Rent" && hasPreloadedRent) return null;

            return (
              <div className="flex flex-col justify-center items-center py-12 text-center">
                <div className="text-xl font-bold text-gray-700 mb-2">
                  {title.startsWith("More Buildings by") ? "No buildings found" : "No listings available"}
                </div>
                <div className="text-gray-500">
                  {title.startsWith("More Buildings by")
                    ? `No other buildings by ${buildingData?.developer_name || 'this developer'} are currently available in our database.`
                    : "No listings available at the moment"}
                </div>
              </div>
            );
          })()
        )}
        
        {/* Grid Layout for Properties For Sale/Rent on Building Page */}
        {(() => {
          // Use buildings if populated, otherwise fall back to preloaded data directly
          let displayProperties = buildings;

          console.log(`[MoreBuildings GRID] title="${title}", isGridLayout=${isGridLayout}`);
          console.log(`[MoreBuildings GRID] buildings.length=${buildings.length}`);
          console.log(`[MoreBuildings GRID] buildingData exists:`, !!buildingData);

          if (buildings.length === 0 && isGridLayout && buildingData) {
            console.log(`[MoreBuildings GRID] Checking preloaded...`);
            console.log(`[MoreBuildings GRID] mls_properties_for_sale:`, buildingData.mls_properties_for_sale);
            console.log(`[MoreBuildings GRID] mls_properties_for_rent:`, buildingData.mls_properties_for_rent);

            const preloaded = title === "Properties For Rent"
              ? buildingData.mls_properties_for_rent
              : buildingData.mls_properties_for_sale;
            if (preloaded && preloaded.length > 0) {
              displayProperties = preloaded;
              console.log(`[MoreBuildings GRID FALLBACK] Using preloaded data: ${displayProperties.length} items`);
            }
          }

          console.log(`[MoreBuildings GRID] Final displayProperties.length=${displayProperties.length}`);

          if (displayProperties.length > 0 && isGridLayout) {
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(showAllListings ? displayProperties : displayProperties.slice(0, 6)).map((building) => (
                    <div key={building.listingKey || building.ListingKey || building.id} className="flex justify-center">
                      <PropertyCardV5
                        property={building}
                        size="grid"
                        onClick={() => {
                          if (building.source === 'building' && building.id) {
                            window.location.href = createBuildingUrl(building.name || building.address, building.id);
                          } else if (building.listingKey || building.ListingKey) {
                            window.location.href = `/property/${building.listingKey || building.ListingKey}`;
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Show All Button - Only show if there are more than 6 listings and not showing all */}
                {displayProperties.length > 6 && !showAllListings && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setShowAllListings(true)}
                      className="px-6 py-3 font-work-sans font-semibold rounded-lg hover:opacity-90 transition-colors duration-200"
                      style={{ backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }}
                    >
                      Show All Listings ({displayProperties.length})
                    </button>
                  </div>
                )}
              </>
            );
          }
          return null;
        })()}

        {/* Mobile: Grid Layout (for carousel layouts - same as Properties For Sale) */}
        {!isLoading && !isLoadingImages && buildings.length > 0 && !isGridLayout && (
        <div className="block md:hidden">
          <div className="grid grid-cols-1 gap-4">
            {buildings.slice(0, 6).map((building) => (
              <div key={building.listingKey || building.id} className="flex justify-center">
                <PropertyCardV5
                  property={building}
                  size="grid"
                  onClick={() => {
                    if (building.source === 'building' && building.id) {
                      window.location.href = createBuildingUrl(building.name || building.address, building.id);
                    } else if (building.listingKey) {
                      window.location.href = `/property/${building.listingKey}`;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Desktop: Slider Container (for carousel layouts) */}
        {!isLoading && !isLoadingImages && buildings.length > 0 && !isGridLayout && (
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
                        {/* Use PropertyCardV6 for all cards for consistency */}
                        <PropertyCardV5
                          property={building}
                          size="default"
                          onClick={() => {
                            if (building.source === 'building' && building.id) {
                              window.location.href = createBuildingUrl(building.name || building.address, building.id);
                            } else if (building.listingKey) {
                              window.location.href = `/property/${building.listingKey}`;
                            }
                          }}
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

        {/* Dots Indicator - Desktop Only (for carousel layouts) */}
        {!isLoading && !isLoadingImages && buildings.length > 0 && totalSlides > 1 && !isGridLayout && (
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