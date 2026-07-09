import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import PropertyCardV5 from "./PropertyCardV5-CX7Swo2f.js";
import { usePage } from "@inertiajs/react";
import { c as createBuildingUrl } from "./slug-BdTdDGUL.js";
import "./propertyUrl-B4IVbEgn.js";
import "./propertyFormatters-B0QibXFa.js";
const MoreBuildings = ({
  title = "More Buildings By Agent",
  propertyData = null,
  propertyType: filterPropertyType = null,
  transactionType: filterTransactionType = null,
  buildingData = null,
  fetchType = null,
  // 'buildings' for backend buildings, null for MLS properties
  onLoginRequired,
  onSignupRequired
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
  const currentWebsite = globalWebsite || website || {};
  const brandColors = currentWebsite?.brand_colors || {
    primary: "#912018",
    button_primary_bg: "#912018",
    button_primary_text: "#FFFFFF"
  };
  const buttonPrimaryBg = brandColors.button_primary_bg || brandColors.primary || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  propertyData?.propertyType || null;
  propertyData?.propertySubType || null;
  useEffect(() => {
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
    if (propertyData?.properties && Array.isArray(propertyData.properties)) {
      console.log("[MoreBuildings] PATH: Using properties passed directly");
      setIsLoading(false);
      return;
    }
    if (fetchType === "buildings") {
      console.log("[MoreBuildings] PATH: fetchType is buildings");
      if (title === "Nearby Buildings" || title === "Similar Buildings" || title.startsWith("More Buildings by")) {
        fetchBuildings();
      }
      return;
    }
    const isPropertiesSection = title === "Properties For Sale" || title === "Properties For Rent";
    console.log(`[MoreBuildings] isPropertiesSection:`, isPropertiesSection);
    console.log(`[MoreBuildings] Checking buildingData:`, !!buildingData);
    if (isPropertiesSection && buildingData) {
      console.log(`[MoreBuildings] PATH: Properties section for "${title}"`);
      const preloadedProperties = filterTransactionType === "For Rent" ? buildingData?.mls_properties_for_rent : buildingData?.mls_properties_for_sale;
      console.log(`[MoreBuildings] preloadedProperties for "${filterTransactionType}":`, preloadedProperties);
      console.log(`[MoreBuildings] preloadedProperties length:`, preloadedProperties?.length);
      if (preloadedProperties && preloadedProperties.length > 0) {
        console.log(`[MoreBuildings] SUCCESS: Using ${preloadedProperties.length} pre-loaded MLS properties`);
        console.log(`[MoreBuildings] First preloaded property:`, preloadedProperties[0]);
        const formattedListings = preloadedProperties.map((property) => {
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
            city: property.city || property.City || "",
            bedrooms: property.bedrooms || property.BedroomsTotal || property.bedroomsTotal || 0,
            BedroomsTotal: property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0,
            bedroomsTotal: property.bedroomsTotal || property.BedroomsTotal || property.bedrooms || 0,
            bathrooms: property.bathrooms || property.BathroomsTotalInteger || property.bathroomsTotalInteger || 0,
            BathroomsTotalInteger: property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0,
            bathroomsTotalInteger: property.bathroomsTotalInteger || property.BathroomsTotalInteger || property.bathrooms || 0,
            BuildingAreaTotal: property.BuildingAreaTotal || property.buildingAreaTotal || "",
            buildingAreaTotal: property.buildingAreaTotal || property.BuildingAreaTotal || "",
            price: property.price || property.ListPrice || 0,
            ListPrice: property.ListPrice || property.price || 0,
            isRental: property.isRental || filterTransactionType === "For Rent",
            transactionType: property.transactionType || filterTransactionType || "For Sale",
            imageUrl,
            images: property.images || [],
            country: property.country || property.Country || "",
            source: property.source || "mls"
          };
        });
        console.log("[MoreBuildings] Formatted listings count:", formattedListings.length);
        console.log("[MoreBuildings] First formatted listing:", formattedListings[0]);
        setCondoListings(formattedListings);
        setIsLoading(false);
        console.log(`[MoreBuildings] ========== useEffect END (success) ==========`);
        return;
      }
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
      const response = await fetch(`/api/nearby-listings?listingKey=${listingKey}&limit=6`, {
        headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" }
      });
      const data = await response.json();
      console.log("Nearby listings API response:", data);
      if (data.properties && data.properties.length > 0) {
        const formattedListings = data.properties.map((property) => {
          let imageUrl = property.MediaURL || null;
          return {
            // Match PropertyCardV5 expected format
            listingKey: property.listingKey,
            propertyType: property.propertySubType || property.propertyType || "Residential",
            address: property.address || "Address not available",
            // Include fields needed for formatCardAddress
            UnitNumber: property.UnitNumber || property.unitNumber || "",
            unitNumber: property.unitNumber || property.UnitNumber || "",
            StreetNumber: property.StreetNumber || property.streetNumber || "",
            streetNumber: property.streetNumber || property.StreetNumber || "",
            StreetName: property.StreetName || property.streetName || "",
            streetName: property.streetName || property.StreetName || "",
            StreetSuffix: property.StreetSuffix || property.streetSuffix || "",
            streetSuffix: property.streetSuffix || property.StreetSuffix || "",
            // Include fields for buildCardFeatures
            bedrooms: property.bedrooms || property.BedroomsTotal || property.bedroomsTotal || 0,
            BedroomsTotal: property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0,
            bedroomsTotal: property.bedroomsTotal || property.BedroomsTotal || property.bedrooms || 0,
            bathrooms: property.bathrooms || property.BathroomsTotalInteger || property.bathroomsTotalInteger || 0,
            BathroomsTotalInteger: property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0,
            bathroomsTotalInteger: property.bathroomsTotalInteger || property.BathroomsTotalInteger || property.bathrooms || 0,
            LivingAreaRange: property.LivingAreaRange || property.livingAreaRange || "",
            livingAreaRange: property.livingAreaRange || property.LivingAreaRange || "",
            BuildingAreaTotal: property.BuildingAreaTotal || property.buildingAreaTotal || "",
            buildingAreaTotal: property.buildingAreaTotal || property.BuildingAreaTotal || "",
            ParkingSpaces: property.ParkingSpaces || property.parkingSpaces || 0,
            parkingSpaces: property.parkingSpaces || property.ParkingSpaces || 0,
            ParkingTotal: property.ParkingTotal || property.parkingTotal || 0,
            parkingTotal: property.parkingTotal || property.ParkingTotal || 0,
            ListOfficeName: property.ListOfficeName || property.listOfficeName || "",
            listOfficeName: property.listOfficeName || property.ListOfficeName || "",
            // The /api/nearby-listings endpoint returns DB-backed listings as
            // ListPrice/listPrice (no lowercase `price`), and Repliers-backed
            // listings as price/listPrice/ListPrice. Fall back across all
            // variants so the card can render an actual price instead of
            // "Price on request".
            price: property.price || property.listPrice || property.ListPrice || 0,
            ListPrice: property.ListPrice || property.listPrice || property.price || 0,
            listPrice: property.listPrice || property.ListPrice || property.price || 0,
            isRental: property.transactionType === "Rent",
            transactionType: property.transactionType || "Sale",
            imageUrl,
            images: property.images || [],
            country: property.country || property.Country || "",
            source: "mls"
          };
        });
        console.log("Formatted nearby listings:", formattedListings);
        setNearbyListings(formattedListings);
        const listingKeysToFetch = formattedListings.filter((listing) => listing.listingKey).map((listing) => listing.listingKey);
        if (listingKeysToFetch.length > 0) {
          console.log("Fetching images for listings:", listingKeysToFetch);
          setIsLoadingImages(true);
          try {
            const imageResponse = await fetch("/api/property-images", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
              },
              body: JSON.stringify({ listing_keys: listingKeysToFetch })
            });
            const imageResult = await imageResponse.json();
            console.log("Image API response:", imageResult);
            const imagesData = imageResult.data?.images || imageResult.images;
            if (imageResult.success && imagesData) {
              console.log("Images data found:", imagesData);
              setNearbyListings((prev) => prev.map((listing) => {
                const imageData = imagesData[listing.listingKey];
                if (imageData && imageData.image_url) {
                  console.log(`Updating image for ${listing.listingKey}:`, imageData.image_url);
                  return {
                    ...listing,
                    imageUrl: imageData.image_url,
                    images: imageData.all_images || []
                  };
                }
                return listing;
              }));
            }
          } catch (imgError) {
            console.error("Error fetching images:", imgError);
          } finally {
            setIsLoadingImages(false);
          }
        }
      } else {
        setNearbyListings([]);
      }
    } catch (error) {
      console.error("Error fetching nearby listings:", error);
      setNearbyListings([]);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchSimilarListings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        listingKey,
        limit: 6
      });
      console.log("Fetching similar listings with params:", params.toString());
      const response = await fetch(`/api/similar-listings?${params.toString()}`, {
        headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" }
      });
      const data = await response.json();
      console.log("Similar listings API response:", data);
      if (data.properties && data.properties.length > 0) {
        const formattedListings = data.properties.map((property) => {
          let imageUrl = property.MediaURL || null;
          return {
            // Match PropertyCardV5 expected format
            listingKey: property.listingKey,
            propertyType: property.propertySubType || property.propertyType || "Residential",
            address: property.address || "Address not available",
            // Include fields needed for formatCardAddress
            UnitNumber: property.UnitNumber || property.unitNumber || "",
            unitNumber: property.unitNumber || property.UnitNumber || "",
            StreetNumber: property.StreetNumber || property.streetNumber || "",
            streetNumber: property.streetNumber || property.StreetNumber || "",
            StreetName: property.StreetName || property.streetName || "",
            streetName: property.streetName || property.StreetName || "",
            StreetSuffix: property.StreetSuffix || property.streetSuffix || "",
            streetSuffix: property.streetSuffix || property.StreetSuffix || "",
            // Include fields for buildCardFeatures
            bedrooms: property.bedrooms || property.BedroomsTotal || property.bedroomsTotal || 0,
            BedroomsTotal: property.BedroomsTotal || property.bedroomsTotal || property.bedrooms || 0,
            bedroomsTotal: property.bedroomsTotal || property.BedroomsTotal || property.bedrooms || 0,
            bathrooms: property.bathrooms || property.BathroomsTotalInteger || property.bathroomsTotalInteger || 0,
            BathroomsTotalInteger: property.BathroomsTotalInteger || property.bathroomsTotalInteger || property.bathrooms || 0,
            bathroomsTotalInteger: property.bathroomsTotalInteger || property.BathroomsTotalInteger || property.bathrooms || 0,
            LivingAreaRange: property.LivingAreaRange || property.livingAreaRange || "",
            livingAreaRange: property.livingAreaRange || property.LivingAreaRange || "",
            BuildingAreaTotal: property.BuildingAreaTotal || property.buildingAreaTotal || "",
            buildingAreaTotal: property.buildingAreaTotal || property.BuildingAreaTotal || "",
            ParkingSpaces: property.ParkingSpaces || property.parkingSpaces || 0,
            parkingSpaces: property.parkingSpaces || property.ParkingSpaces || 0,
            ParkingTotal: property.ParkingTotal || property.parkingTotal || 0,
            parkingTotal: property.parkingTotal || property.ParkingTotal || 0,
            ListOfficeName: property.ListOfficeName || property.listOfficeName || "",
            listOfficeName: property.listOfficeName || property.ListOfficeName || "",
            // The /api/nearby-listings endpoint returns DB-backed listings as
            // ListPrice/listPrice (no lowercase `price`), and Repliers-backed
            // listings as price/listPrice/ListPrice. Fall back across all
            // variants so the card can render an actual price instead of
            // "Price on request".
            price: property.price || property.listPrice || property.ListPrice || 0,
            ListPrice: property.ListPrice || property.listPrice || property.price || 0,
            listPrice: property.listPrice || property.ListPrice || property.price || 0,
            isRental: property.transactionType === "Rent",
            transactionType: property.transactionType || "Sale",
            imageUrl,
            images: property.images || [],
            country: property.country || property.Country || "",
            source: "mls"
          };
        });
        console.log("Formatted similar listings:", formattedListings);
        setSimilarListings(formattedListings);
        const listingKeysToFetch = formattedListings.filter((listing) => listing.listingKey).map((listing) => listing.listingKey);
        if (listingKeysToFetch.length > 0) {
          console.log("Fetching images for listings:", listingKeysToFetch);
          setIsLoadingImages(true);
          try {
            const imageResponse = await fetch("/api/property-images", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
              },
              body: JSON.stringify({ listing_keys: listingKeysToFetch })
            });
            const imageResult = await imageResponse.json();
            console.log("Image API response:", imageResult);
            const imagesData = imageResult.data?.images || imageResult.images;
            if (imageResult.success && imagesData) {
              console.log("Images data found:", imagesData);
              setSimilarListings((prev) => prev.map((listing) => {
                const imageData = imagesData[listing.listingKey];
                if (imageData && imageData.image_url) {
                  console.log(`Updating image for ${listing.listingKey}:`, imageData.image_url);
                  return {
                    ...listing,
                    imageUrl: imageData.image_url,
                    images: imageData.all_images || []
                  };
                }
                return listing;
              }));
            }
          } catch (imgError) {
            console.error("Error fetching images:", imgError);
          } finally {
            setIsLoadingImages(false);
          }
        }
      } else {
        setSimilarListings([]);
      }
    } catch (error) {
      console.error("Error fetching similar listings:", error);
      setSimilarListings([]);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchBuildings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (buildingData?.city) {
        params.append("city", buildingData.city);
      }
      if (title === "Similar Buildings" && buildingData?.building_type) {
        params.append("building_type", buildingData.building_type);
      }
      if (title.startsWith("More Buildings by") && buildingData?.developer_id) {
        params.append("developer_id", buildingData.developer_id);
        console.log("DeveloperBuildings - developer_id:", buildingData.developer_id);
        console.log("DeveloperBuildings - Fetching buildings for developer:", buildingData.developer?.name || buildingData.developer_name);
      } else if (title.startsWith("More Buildings by") && buildingData?.developer_name) {
        params.append("developer_name", buildingData.developer_name);
        console.log("DeveloperBuildings - developer_name (fallback):", buildingData.developer_name);
      }
      const url = `/api/buildings?${params.toString()}`;
      console.log("DeveloperBuildings - API URL:", url);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        }
      });
      const result = await response.json();
      console.log("Buildings API response:", result);
      const buildings2 = result.data || result || [];
      console.log("DeveloperBuildings - Total buildings found:", buildings2.length);
      if (buildings2 && buildings2.length > 0) {
        const filteredBuildings = buildings2.filter((b) => b.id !== buildingData?.id);
        console.log("DeveloperBuildings - After filtering current building:", filteredBuildings.length);
        const formattedBuildings = filteredBuildings.map((building) => {
          let imageUrl = building.main_image;
          if (!imageUrl && building.images && Array.isArray(building.images) && building.images.length > 0) {
            imageUrl = building.images[0];
          }
          if (!imageUrl) {
            imageUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80";
          }
          return {
            id: building.id,
            listingKey: `BLDG-${building.id}`,
            propertyType: building.building_type || "Residential Building",
            address: building.address || building.name,
            name: building.name,
            city: building.city,
            province: building.province,
            imageUrl,
            price: building.price_range || building.units_for_sale || 0,
            bedrooms: building.bedrooms || "1-3",
            bathrooms: building.bathrooms || "1-2",
            totalUnits: building.total_units,
            unitsForSale: building.units_for_sale,
            unitsForRent: building.units_for_rent,
            yearBuilt: building.year_built,
            isRental: false,
            transactionType: "Building",
            source: "building",
            // Add formatted address for card display
            UnitNumber: "",
            StreetNumber: "",
            StreetName: building.address || building.name,
            City: building.city,
            StateOrProvince: building.province
          };
        });
        console.log("Formatted buildings:", formattedBuildings);
        console.log("DeveloperBuildings - Rendering with", formattedBuildings.length, "buildings");
        setBuildingsData(formattedBuildings);
      } else {
        const sampleBuildings = [
          {
            id: "sample-1",
            listingKey: "BLDG-SAMPLE-1",
            propertyType: "Residential Building",
            address: "123 King Street West",
            name: "King West Condos",
            city: "Toronto",
            province: "ON",
            imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format&q=80",
            price: 45,
            bedrooms: "1-3",
            bathrooms: "1-2",
            totalUnits: 250,
            unitsForSale: 45,
            unitsForRent: 12,
            yearBuilt: 2020,
            isRental: false,
            transactionType: "Building",
            source: "building",
            UnitNumber: "",
            StreetNumber: "123",
            StreetName: "King Street West",
            City: "Toronto",
            StateOrProvince: "ON"
          },
          {
            id: "sample-2",
            listingKey: "BLDG-SAMPLE-2",
            propertyType: "Luxury Condo",
            address: "88 Blue Jays Way",
            name: "SkyView Towers",
            city: "Toronto",
            province: "ON",
            imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&auto=format&q=80",
            price: 28,
            bedrooms: "1-2",
            bathrooms: "1-2",
            totalUnits: 180,
            unitsForSale: 28,
            unitsForRent: 8,
            yearBuilt: 2019,
            isRental: false,
            transactionType: "Building",
            source: "building",
            UnitNumber: "",
            StreetNumber: "88",
            StreetName: "Blue Jays Way",
            City: "Toronto",
            StateOrProvince: "ON"
          },
          {
            id: "sample-3",
            listingKey: "BLDG-SAMPLE-3",
            propertyType: "Mixed Use",
            address: "155 Yorkville Avenue",
            name: "Yorkville Plaza",
            city: "Toronto",
            province: "ON",
            imageUrl: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=400&h=300&fit=crop&auto=format&q=80",
            price: 52,
            bedrooms: "2-4",
            bathrooms: "2-3",
            totalUnits: 320,
            unitsForSale: 52,
            unitsForRent: 15,
            yearBuilt: 2021,
            isRental: false,
            transactionType: "Building",
            source: "building",
            UnitNumber: "",
            StreetNumber: "155",
            StreetName: "Yorkville Avenue",
            City: "Toronto",
            StateOrProvince: "ON"
          }
        ];
        if (title === "Similar Buildings") {
          setBuildingsData(sampleBuildings.slice(0, 2));
        } else {
          setBuildingsData(sampleBuildings);
        }
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
      setBuildingsData([]);
    } finally {
      setIsLoading(false);
    }
  };
  const buildings = (() => {
    console.log(`[MoreBuildings CALC v3] Starting for "${title}"`);
    console.log(`[MoreBuildings CALC v3] buildingData:`, buildingData);
    console.log(`[MoreBuildings CALC v3] buildingData keys:`, buildingData ? Object.keys(buildingData) : "NULL");
    console.log(`[MoreBuildings CALC v3] filterTransactionType:`, filterTransactionType);
    console.log(`[MoreBuildings CALC v3] mls_properties_for_sale:`, buildingData?.mls_properties_for_sale);
    console.log(`[MoreBuildings CALC v3] mls_properties_for_rent:`, buildingData?.mls_properties_for_rent);
    if (propertyData?.properties && Array.isArray(propertyData.properties)) {
      console.log(`[MoreBuildings CALC] Returning propertyData.properties`);
      return propertyData.properties;
    }
    if (title === "Nearby Buildings" || title === "Similar Buildings" || title.startsWith("More Buildings by")) {
      console.log(`[MoreBuildings CALC] Returning buildingsData for ${title}`);
      return buildingsData;
    }
    if (title === "Properties For Sale" || title === "Properties For Rent") {
      console.log(`[MoreBuildings CALC] Properties section detected`);
      console.log(`[MoreBuildings CALC] condoListings.length:`, condoListings?.length);
      if (condoListings && condoListings.length > 0) {
        console.log(`[MoreBuildings CALC] Returning condoListings`);
        return condoListings;
      }
      if (buildingData) {
        console.log(`[MoreBuildings CALC] buildingData exists, checking MLS properties`);
        console.log(`[MoreBuildings CALC] mls_properties_for_sale:`, buildingData.mls_properties_for_sale);
        console.log(`[MoreBuildings CALC] mls_properties_for_rent:`, buildingData.mls_properties_for_rent);
        const preloadedProperties = filterTransactionType === "For Rent" ? buildingData.mls_properties_for_rent : buildingData.mls_properties_for_sale;
        console.log(`[MoreBuildings CALC] preloadedProperties for ${filterTransactionType}:`, preloadedProperties);
        if (preloadedProperties && preloadedProperties.length > 0) {
          console.log(`[MoreBuildings CALC] SUCCESS: Returning ${preloadedProperties.length} preloaded properties`);
          return preloadedProperties;
        }
      } else {
        console.log(`[MoreBuildings CALC] buildingData is NULL/undefined!`);
      }
      console.log(`[MoreBuildings CALC] Falling back to condoListings (empty)`);
      return condoListings;
    }
    if (title === "Nearby Listings") {
      return nearbyListings;
    } else if (title === "Similar Listings") {
      return similarListings;
    } else {
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
  const isGridLayout = (title === "Properties For Sale" || title === "Properties For Rent") && buildingData;
  console.log(`[MoreBuildings RENDER] title="${title}"`);
  console.log(`[MoreBuildings RENDER] buildings.length=${buildings.length}`);
  console.log(`[MoreBuildings RENDER] isGridLayout=${isGridLayout}`);
  console.log(`[MoreBuildings RENDER] isLoading=${isLoading}`);
  console.log(`[MoreBuildings RENDER] buildingData exists:`, !!buildingData);
  if (buildings.length > 0) {
    console.log(`[MoreBuildings RENDER] First building:`, buildings[0]);
  }
  return /* @__PURE__ */ jsxs("section", { className: `p-3 rounded-xl border-gray-200 border shadow-sm bg-gray-50 ${title === "Nearby Listings" ? "nearby-listings-container" : title === "Similar Listings" ? "similar-listings-container" : ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-bold font-space-grotesk", style: { color: "#293056" }, children: title }),
          isGridLayout && (() => {
            let count = buildings.length;
            if (count === 0 && buildingData) {
              const preloaded = title === "Properties For Rent" ? buildingData.mls_properties_for_rent : buildingData.mls_properties_for_sale;
              count = preloaded?.length || 0;
            }
            return count > 0 ? /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center px-3 py-1 text-sm font-bold rounded-full", style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }, children: count }) : null;
          })()
        ] }),
        !isGridLayout && /* @__PURE__ */ jsxs("div", { className: "hidden md:flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: prevSlide,
              disabled: currentSlide === 0,
              className: `w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${currentSlide === 0 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800 hover:bg-white"}`,
              children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M10 12L6 8L10 4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: nextSlide,
              disabled: currentSlide === totalSlides - 1,
              className: `w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${currentSlide === totalSlides - 1 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800 hover:bg-white"}`,
              children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M6 4L10 8L6 12", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) })
            }
          )
        ] })
      ] }),
      (isLoading && buildings.length === 0 || isLoadingImages) && /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center py-12", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#293056]" }) }),
      !isLoading && !isLoadingImages && buildings.length === 0 && (() => {
        const hasPreloadedSale = buildingData?.mls_properties_for_sale?.length > 0;
        const hasPreloadedRent = buildingData?.mls_properties_for_rent?.length > 0;
        console.log(`[MoreBuildings NO DATA] title="${title}", hasPreloadedSale=${hasPreloadedSale}, hasPreloadedRent=${hasPreloadedRent}`);
        console.log(`[MoreBuildings NO DATA] buildingData keys:`, buildingData ? Object.keys(buildingData) : "NULL");
        if (title === "Properties For Sale" && hasPreloadedSale) return null;
        if (title === "Properties For Rent" && hasPreloadedRent) return null;
        return /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center items-center py-12 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xl font-bold text-gray-700 mb-2", children: title.startsWith("More Buildings by") ? "No buildings found" : "No listings available" }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-500", children: title.startsWith("More Buildings by") ? `No other buildings by ${buildingData?.developer_name || "this developer"} are currently available in our database.` : "No listings available at the moment" })
        ] });
      })(),
      (() => {
        let displayProperties = buildings;
        console.log(`[MoreBuildings GRID] title="${title}", isGridLayout=${isGridLayout}`);
        console.log(`[MoreBuildings GRID] buildings.length=${buildings.length}`);
        console.log(`[MoreBuildings GRID] buildingData exists:`, !!buildingData);
        if (buildings.length === 0 && isGridLayout && buildingData) {
          console.log(`[MoreBuildings GRID] Checking preloaded...`);
          console.log(`[MoreBuildings GRID] mls_properties_for_sale:`, buildingData.mls_properties_for_sale);
          console.log(`[MoreBuildings GRID] mls_properties_for_rent:`, buildingData.mls_properties_for_rent);
          const preloaded = title === "Properties For Rent" ? buildingData.mls_properties_for_rent : buildingData.mls_properties_for_sale;
          if (preloaded && preloaded.length > 0) {
            displayProperties = preloaded;
            console.log(`[MoreBuildings GRID FALLBACK] Using preloaded data: ${displayProperties.length} items`);
          }
        }
        console.log(`[MoreBuildings GRID] Final displayProperties.length=${displayProperties.length}`);
        if (displayProperties.length > 0 && isGridLayout) {
          return /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: (showAllListings ? displayProperties : displayProperties.slice(0, 6)).map((building) => /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(
              PropertyCardV5,
              {
                property: building,
                size: "grid",
                onClick: () => {
                  if (building.source === "building" && building.id) {
                    window.location.href = createBuildingUrl(building.name || building.address, building.id);
                  } else if (building.listingKey || building.ListingKey) {
                    window.location.href = `/property/${building.listingKey || building.ListingKey}`;
                  }
                },
                onLoginRequired,
                onSignupRequired
              }
            ) }, building.listingKey || building.ListingKey || building.id)) }),
            displayProperties.length > 6 && !showAllListings && /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-6", children: /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setShowAllListings(true),
                className: "px-6 py-3 font-work-sans font-semibold rounded-lg hover:opacity-90 transition-colors duration-200",
                style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
                children: [
                  "Show All Listings (",
                  displayProperties.length,
                  ")"
                ]
              }
            ) })
          ] });
        }
        return null;
      })(),
      !isLoading && !isLoadingImages && buildings.length > 0 && !isGridLayout && /* @__PURE__ */ jsx("div", { className: "block md:hidden", children: /* @__PURE__ */ jsx("div", { className: "mobile-listings-scroll", children: buildings.map((building) => /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 carousel-item", children: /* @__PURE__ */ jsx(
        PropertyCardV5,
        {
          property: building,
          size: "default",
          className: "w-[300px]",
          onClick: () => {
            if (building.source === "building" && building.id) {
              window.location.href = createBuildingUrl(building.name || building.address, building.id);
            } else if (building.listingKey) {
              window.location.href = `/property/${building.listingKey}`;
            }
          },
          onLoginRequired,
          onSignupRequired
        }
      ) }, building.listingKey || building.id)) }) }),
      !isLoading && !isLoadingImages && buildings.length > 0 && !isGridLayout && /* @__PURE__ */ jsx("div", { className: "hidden md:block relative overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          ref: sliderRef,
          className: "flex transition-transform duration-500 ease-in-out",
          style: { transform: `translateX(-${currentSlide * 100}%)` },
          children: Array.from({ length: totalSlides }).map((_, slideIndex) => /* @__PURE__ */ jsx("div", { className: "w-full flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "desktop-listings-grid", children: buildings.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((building) => /* @__PURE__ */ jsx("div", { className: "flex justify-center items-start slider-item", children: /* @__PURE__ */ jsx(
            PropertyCardV5,
            {
              property: building,
              size: "default",
              onClick: () => {
                if (building.source === "building" && building.id) {
                  window.location.href = createBuildingUrl(building.name || building.address, building.id);
                } else if (building.listingKey) {
                  window.location.href = `/property/${building.listingKey}`;
                }
              },
              className: "w-[300px]",
              onLoginRequired,
              onSignupRequired
            }
          ) }, building.listingKey || building.id)) }) }, slideIndex))
        }
      ) }),
      !isLoading && !isLoadingImages && buildings.length > 0 && totalSlides > 1 && !isGridLayout && /* @__PURE__ */ jsx("div", { className: "hidden md:flex justify-center mt-6 gap-2", children: Array.from({ length: totalSlides }).map((_, index) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => goToSlide(index),
          className: `w-3 h-3 rounded-full transition-all ${currentSlide === index ? "bg-gray-800" : "bg-gray-300 hover:bg-gray-400"}`
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      ` })
  ] });
};
export {
  MoreBuildings as default
};
