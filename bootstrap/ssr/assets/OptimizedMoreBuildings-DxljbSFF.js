import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import PropertyCard from "./PropertyCard-BWgqbSLf.js";
import { usePage } from "@inertiajs/react";
import { c as createBuildingUrl } from "./slug-BdTdDGUL.js";
import "axios";
const PropertyCardSkeleton = () => /* @__PURE__ */ jsxs("div", { className: "animate-pulse", children: [
  /* @__PURE__ */ jsx("div", { className: "bg-gray-200 rounded-lg h-64 mb-3" }),
  /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" }),
    /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2" }),
    /* @__PURE__ */ jsx("div", { className: "h-6 bg-gray-200 rounded w-1/3 mt-3" })
  ] })
] });
const imageCache = /* @__PURE__ */ new Map();
const OptimizedMoreBuildings = ({
  title = "More Buildings By Agent",
  propertyData = null,
  propertyType: filterPropertyType = null,
  transactionType: filterTransactionType = null,
  buildingData = null,
  fetchType = null,
  lazy = true
  // Enable lazy loading by default
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
  useMemo(() => propertyData?.propertyType || null, [propertyData]);
  const propertySubType = useMemo(() => propertyData?.propertySubType || null, [propertyData]);
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
        rootMargin: "200px",
        // Start loading 200px before component is visible
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
  const fetchWithCache = useCallback(async (url, cacheKey) => {
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey);
    }
    const response = await fetch(url);
    const data = await response.json();
    imageCache.set(cacheKey, data);
    if (imageCache.size > 50) {
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }
    return data;
  }, []);
  const fetchImagesForListings = useCallback(async (listingsToProcess) => {
    const listingKeys = listingsToProcess.filter((listing) => listing.listingKey && !listing.imageUrl).map((listing) => listing.listingKey);
    if (listingKeys.length === 0) return listingsToProcess;
    const uncachedKeys = listingKeys.filter((key) => !imageCache.has(`images_${key}`));
    if (uncachedKeys.length === 0) {
      return listingsToProcess.map((listing) => {
        const cachedData = imageCache.get(`images_${listing.listingKey}`);
        if (cachedData) {
          return { ...listing, ...cachedData };
        }
        return listing;
      });
    }
    try {
      const imageResponse = await fetch("/api/property-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
        },
        body: JSON.stringify({ listing_keys: uncachedKeys })
      });
      const imageResult = await imageResponse.json();
      const imagesData = imageResult.data?.images || imageResult.images;
      if (imageResult.success && imagesData) {
        Object.entries(imagesData).forEach(([key, data]) => {
          imageCache.set(`images_${key}`, data);
        });
        return listingsToProcess.map((listing) => {
          const imageData = imagesData[listing.listingKey] || imageCache.get(`images_${listing.listingKey}`);
          if (imageData && imageData.image_url) {
            return {
              ...listing,
              imageUrl: imageData.image_url,
              images: imageData.all_images || []
            };
          }
          return listing;
        });
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
    return listingsToProcess;
  }, []);
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
      console.error("Error fetching nearby listings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [listingKey, fetchWithCache, fetchImagesForListings]);
  const fetchSimilarListings = useCallback(async () => {
    if (!listingKey) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        listingKey,
        limit: "6"
      });
      if (propertySubType) {
        params.append("propertySubType", propertySubType);
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
      console.error("Error fetching similar listings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [listingKey, propertySubType, fetchWithCache, fetchImagesForListings]);
  const formatPropertyData = useCallback((property) => {
    return {
      listingKey: property.listingKey,
      propertyType: property.propertySubType || property.propertyType || "Residential",
      address: property.address || "Address not available",
      UnitNumber: property.UnitNumber || property.unitNumber || "",
      unitNumber: property.unitNumber || property.UnitNumber || "",
      StreetNumber: property.StreetNumber || property.streetNumber || "",
      streetNumber: property.streetNumber || property.StreetNumber || "",
      StreetName: property.StreetName || property.streetName || "",
      streetName: property.streetName || property.StreetName || "",
      StreetSuffix: property.StreetSuffix || property.streetSuffix || "",
      streetSuffix: property.streetSuffix || property.StreetSuffix || "",
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
      // Fall back across all price field variants (price / listPrice /
      // ListPrice) — the DB-backed nearby-listings response uses the
      // PascalCase keys, while the Repliers fallback uses lowercase.
      price: property.price || property.listPrice || property.ListPrice || 0,
      ListPrice: property.ListPrice || property.listPrice || property.price || 0,
      listPrice: property.listPrice || property.ListPrice || property.price || 0,
      isRental: property.transactionType === "Rent",
      transactionType: property.transactionType || "Sale",
      imageUrl: property.MediaURL || null,
      images: property.images || [],
      source: "mls"
    };
  }, []);
  useEffect(() => {
    if (!isVisible) return;
    if (propertyData?.properties && Array.isArray(propertyData.properties)) {
      setListings(propertyData.properties);
      setIsLoading(false);
      return;
    }
    if (title === "Nearby Listings") {
      fetchNearbyListings();
    } else if (title === "Similar Listings") {
      fetchSimilarListings();
    } else {
      setIsLoading(false);
    }
  }, [isVisible, title, fetchNearbyListings, fetchSimilarListings, propertyData]);
  const nextSlide = useCallback(() => {
    if (currentSlide < Math.max(0, listings.length - 3)) {
      setCurrentSlide(currentSlide + 1);
      if (sliderRef.current) {
        sliderRef.current.scrollBy({ left: 420, behavior: "smooth" });
      }
    }
  }, [currentSlide, listings.length]);
  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      if (sliderRef.current) {
        sliderRef.current.scrollBy({ left: -420, behavior: "smooth" });
      }
    }
  }, [currentSlide]);
  if (!isLoading && listings.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { ref: componentRef, className: "mb-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: title }),
      listings.length > 3 && /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: prevSlide,
            disabled: currentSlide === 0,
            className: "p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors",
            "aria-label": "Previous slide",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: nextSlide,
            disabled: currentSlide >= listings.length - 3,
            className: "p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors",
            "aria-label": "Next slide",
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: sliderRef,
        className: "flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory",
        style: { scrollbarWidth: "none", msOverflowStyle: "none" },
        children: isLoading ? (
          // Show skeleton loaders while loading
          [...Array(3)].map((_, index) => /* @__PURE__ */ jsx("div", { className: "flex-none w-[400px] snap-start", children: /* @__PURE__ */ jsx(PropertyCardSkeleton, {}) }, `skeleton-${index}`))
        ) : (
          // Show actual listings
          listings.map((property, index) => /* @__PURE__ */ jsx("div", { className: "flex-none w-[400px] snap-start", children: fetchType === "buildings" && property.id ? (
            // Building card
            /* @__PURE__ */ jsx(
              "a",
              {
                href: createBuildingUrl(property.slug),
                className: "block hover:shadow-lg transition-shadow",
                children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg overflow-hidden", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: property.main_image || "/images/placeholder-property.jpg",
                      alt: property.name,
                      className: "w-full h-48 object-cover",
                      loading: "lazy"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg", children: property.name }),
                    /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: property.address }),
                    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex gap-4 text-sm", children: [
                      property.units_for_sale > 0 && /* @__PURE__ */ jsxs("span", { className: "text-blue-600", children: [
                        property.units_for_sale,
                        " for sale"
                      ] }),
                      property.units_for_rent > 0 && /* @__PURE__ */ jsxs("span", { className: "text-green-600", children: [
                        property.units_for_rent,
                        " for rent"
                      ] })
                    ] })
                  ] })
                ] })
              }
            )
          ) : (
            // Property card
            /* @__PURE__ */ jsx(
              PropertyCard,
              {
                property,
                isAuthenticated: !!auth?.user,
                userFavourites: auth?.user?.favourite_properties || []
              }
            )
          ) }, property.listingKey || property.id || index))
        )
      }
    )
  ] });
};
export {
  OptimizedMoreBuildings as default
};
