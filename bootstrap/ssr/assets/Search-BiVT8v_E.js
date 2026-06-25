import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { usePage, Head } from "@inertiajs/react";
import MainLayout from "./MainLayout-BFh5qQm3.js";
import { g as generatePropertyUrl } from "./propertyUrl-B4IVbEgn.js";
import PropertyCardV5 from "./PropertyCardV5-CEcGAClp.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import LoginModal from "./LoginModal-C-0W-anf.js";
import "./Navbar-BOM1Kycz.js";
import LazyPropertyCard from "./LazyPropertyCard-DZZuEl7H.js";
import ViewportAwarePropertyMap from "./ViewportAwarePropertyMap-C_QmAwuf.js";
import ClusteredPropertyMap from "./ClusteredPropertyMap-BpL1V82V.js";
import { a as createSEOBuildingUrl } from "./slug-BdTdDGUL.js";
import IDXAmpreSearchBar from "./IDXAmpreSearchBar-BpkgyaSB.js";
import FiltersModal from "./FiltersModal-U8-T5uIZ.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
import "@headlessui/react";
import "./propertyFormatters-B0QibXFa.js";
import "./SimplePropertyMap-CcNI_Icw.js";
import "./GoogleMapContainer-1QRikaEJ.js";
import "./MapPropertyCard-JetgmWMH.js";
import "react-dom/client";
import "lodash";
const usePropertyImageLazyLoad = (options = {}) => {
  const {
    batchSize = 4,
    batchDelay = 100,
    rootMargin = "100px",
    threshold = 0.1,
    debug = false
  } = options;
  const [imageCache, setImageCache] = useState({});
  const [loadingImages, setLoadingImages] = useState(/* @__PURE__ */ new Set());
  const imageQueue = useRef([]);
  const processingBatch = useRef(false);
  const observerRef = useRef(null);
  const elementsRef = useRef(/* @__PURE__ */ new Map());
  const log = useCallback((...args) => {
    if (debug) {
      console.log("[PropertyImageLazyLoad]", ...args);
    }
  }, [debug]);
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
  };
  const fetchPropertyImages = async (listingKeys) => {
    try {
      log("Fetching images for listing keys:", listingKeys);
      const response = await fetch("/api/property-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken()
        },
        body: JSON.stringify({ listing_keys: listingKeys })
      });
      const result = await response.json();
      if (result.success && result.data?.images) {
        log("Successfully fetched images:", result.data.images);
        return result.data.images;
      } else {
        log("Failed to fetch images:", result.message);
        return {};
      }
    } catch (error) {
      console.error("[PropertyImageLazyLoad] Error fetching images:", error);
      return {};
    }
  };
  const processBatch = useCallback(async () => {
    if (imageQueue.current.length === 0) {
      processingBatch.current = false;
      log("No images in queue, batch processing complete");
      return;
    }
    processingBatch.current = true;
    const batch = imageQueue.current.splice(0, batchSize);
    const listingKeys = batch.map((item) => item.listingKey);
    log("Processing batch of", batch.length, "images:", listingKeys);
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      listingKeys.forEach((key) => newSet.add(key));
      return newSet;
    });
    const fetchedImages = await fetchPropertyImages(listingKeys);
    setImageCache((prev) => ({
      ...prev,
      ...fetchedImages
    }));
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      listingKeys.forEach((key) => newSet.delete(key));
      return newSet;
    });
    batch.forEach((item) => {
      const imageData = fetchedImages[item.listingKey];
      if (item.callback && imageData) {
        item.callback(imageData);
      }
    });
    setTimeout(() => {
      processBatch();
    }, batchDelay);
  }, [batchSize, batchDelay, log]);
  const queueImageForLoading = useCallback((listingKey, callback) => {
    if (imageCache[listingKey]) {
      log("Image already in cache for:", listingKey);
      if (callback) callback(imageCache[listingKey]);
      return;
    }
    const isQueued = imageQueue.current.some((item) => item.listingKey === listingKey);
    const isLoading = loadingImages.has(listingKey);
    if (isQueued || isLoading) {
      log("Image already queued or loading:", listingKey);
      return;
    }
    log("Queueing image for loading:", listingKey);
    imageQueue.current.push({
      listingKey,
      callback
    });
    if (!processingBatch.current) {
      processBatch();
    }
  }, [imageCache, loadingImages, processBatch, log]);
  const handleIntersect = useCallback((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const listingKey = element.getAttribute("data-listing-key");
        if (listingKey) {
          log("Element with listing key", listingKey, "is in view");
          observerRef.current?.unobserve(element);
          const callback = elementsRef.current.get(element);
          queueImageForLoading(listingKey, callback);
        }
      }
    });
  }, [queueImageForLoading, log]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      log("IntersectionObserver not supported");
      return;
    }
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin,
      threshold
    });
    observerRef.current = observer;
    log("IntersectionObserver initialized");
    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, rootMargin, threshold, log]);
  const observeElement = useCallback((element, listingKey, callback) => {
    if (!element || !listingKey) {
      log("Invalid element or listing key");
      return;
    }
    if (imageCache[listingKey]) {
      log("Image already cached for:", listingKey);
      if (callback) callback(imageCache[listingKey]);
      return;
    }
    element.setAttribute("data-listing-key", listingKey);
    if (callback) {
      elementsRef.current.set(element, callback);
    }
    observerRef.current?.observe(element);
    log("Started observing element for listing key:", listingKey);
  }, [imageCache, log]);
  const unobserveElement = useCallback((element) => {
    observerRef.current?.unobserve(element);
    elementsRef.current.delete(element);
  }, []);
  const loadImageNow = useCallback((listingKey, callback) => {
    queueImageForLoading(listingKey, callback);
  }, [queueImageForLoading]);
  const getImage = useCallback((listingKey) => {
    return imageCache[listingKey] || null;
  }, [imageCache]);
  const isImageLoading = useCallback((listingKey) => {
    return loadingImages.has(listingKey);
  }, [loadingImages]);
  return {
    observeElement,
    unobserveElement,
    loadImageNow,
    getImage,
    isImageLoading,
    imageCache,
    loadingImages: Array.from(loadingImages)
  };
};
const ChevronDownIcon = ({ className }) => /* @__PURE__ */ jsx("svg", { className, width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M6 9L12 15L18 9", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) });
const GridIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, width: "17", height: "15", viewBox: "0 0 17 15", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx("path", { d: "M16 1H13C12.7239 1 12.5 1.22386 12.5 1.5V3.5C12.5 3.77614 12.7239 4 13 4H16C16.2761 4 16.5 3.77614 16.5 3.5V1.5C16.5 1.22386 16.2761 1 16 1Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M16 6H13C12.7239 6 12.5 6.22386 12.5 6.5V8.5C12.5 8.77614 12.7239 9 13 9H16C16.2761 9 16.5 8.77614 16.5 8.5V6.5C16.5 6.22386 16.2761 6 16 6Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M16 11H13C12.7239 11 12.5 11.2239 12.5 11.5V13.5C12.5 13.7761 12.7239 14 13 14H16C16.2761 14 16.5 13.7761 16.5 13.5V11.5C16.5 11.2239 16.2761 11 16 11Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M10 1H7C6.72386 1 6.5 1.22386 6.5 1.5V3.5C6.5 3.77614 6.72386 4 7 4H10C10.2761 4 10.5 3.77614 10.5 3.5V1.5C10.5 1.22386 10.2761 1 10 1Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M4 1H1C0.723858 1 0.5 1.22386 0.5 1.5V3.5C0.5 3.77614 0.723858 4 1 4H4C4.27614 4 4.5 3.77614 4.5 3.5V1.5C4.5 1.22386 4.27614 1 4 1Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M10 6H7C6.72386 6 6.5 6.22386 6.5 6.5V8.5C6.5 8.77614 6.72386 9 7 9H10C10.2761 9 10.5 8.77614 10.5 8.5V6.5C6.5 6.22386 10.2761 6 10 6Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M4 6H1C0.723858 6 0.5 6.22386 0.5 6.5V8.5C0.5 8.77614 0.723858 9 1 9H4C4.27614 9 4.5 8.77614 4.5 8.5V6.5C4.5 6.22386 4.27614 6 4 6Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M10 11H7C6.72386 11 6.5 11.2239 6.5 11.5V13.5C6.5 13.7761 6.72386 14 7 14H10C10.2761 14 10.5 13.7761 10.5 13.5V11.5C10.5 11.2239 10.2761 11 10 11Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M4 11H1C0.723858 11 0.5 11.2239 0.5 11.5V13.5C0.5 13.7761 0.723858 14 1 14H4C4.27614 14 4.5 13.7761 4.5 13.5V11.5C4.5 11.2239 4.27614 11 4 11Z", fill: "currentColor" })
] });
const MapIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx("polygon", { points: "1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ jsx("line", { x1: "8", y1: "2", x2: "8", y2: "18", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ jsx("line", { x1: "16", y1: "6", x2: "16", y2: "22", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
] });
const MixedIcon = ({ className }) => /* @__PURE__ */ jsxs("svg", { className, width: "27", height: "15", viewBox: "0 0 27 15", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx("path", { d: "M25.7 1.5H12.7V13.5H25.7V1.5Z", stroke: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M9.69995 1H6.69995C6.42381 1 6.19995 1.22386 6.19995 1.5V3.5C6.19995 3.77614 6.42381 4 6.69995 4H9.69995C9.97609 4 10.2 3.77614 10.2 3.5V1.5C10.2 1.22386 9.97609 1 9.69995 1Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M9.69995 6H6.69995C6.42381 6 6.19995 6.22386 6.19995 6.5V8.5C6.19995 8.77614 6.42381 9 6.69995 9H9.69995C9.97609 9 10.2 8.77614 10.2 8.5V6.5C10.2 6.22386 9.97609 6 9.69995 6Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M9.69995 11H6.69995C6.42381 11 6.19995 11.2239 6.19995 11.5V13.5C6.19995 13.7761 6.42381 14 6.69995 14H9.69995C9.97609 14 10.2 13.7761 10.2 13.5V11.5C10.2 11.2239 9.97609 11 9.69995 11Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M3.69995 1H0.699951C0.423809 1 0.199951 1.22386 0.199951 1.5V3.5C0.199951 3.77614 0.423809 4 0.699951 4H3.69995C3.97609 4 4.19995 3.77614 4.19995 3.5V1.5C4.19995 1.22386 3.97609 1 3.69995 1Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M3.69995 6H0.699951C0.423809 6 0.199951 6.22386 0.199951 6.5V8.5C0.199951 8.77614 0.423809 9 0.699951 9H3.69995C3.97609 9 4.19995 8.77614 4.19995 8.5V6.5C4.19995 6.22386 3.97609 6 3.69995 6Z", fill: "currentColor" }),
  /* @__PURE__ */ jsx("path", { d: "M3.69995 11H0.699951C0.423809 11 0.199951 11.2239 0.199951 11.5V13.5C0.199951 13.7761 0.423809 14 0.699951 14H3.69995C3.97609 14 4.19995 13.7761 4.19995 13.5V11.5C4.19995 11.2239 3.97609 11 3.69995 11Z", fill: "currentColor" })
] });
function EnhancedPropertySearch({
  auth,
  website,
  siteName,
  siteUrl,
  year,
  filters = {},
  searchTab = "listings"
}) {
  console.log("🔍 Search page filters from controller:", filters);
  const { globalWebsite } = usePage().props;
  const currentWebsite = globalWebsite || website || {};
  const brandColors = currentWebsite?.brand_colors || {
    primary: "#912018",
    button_primary_bg: "#912018",
    button_primary_text: "#FFFFFF",
    button_quaternary_bg: "#FFFFFF",
    button_quaternary_text: "#293056",
    button_tertiary_bg: "#000000",
    button_tertiary_text: "#FFFFFF"
  };
  const buttonPrimaryBg = brandColors.button_primary_bg || brandColors.primary || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  brandColors.button_tertiary_bg || "#000000";
  brandColors.button_tertiary_text || "#FFFFFF";
  brandColors.button_quaternary_bg || "#FFFFFF";
  brandColors.button_quaternary_text || "#293056";
  const [showLoginModal, setShowLoginModal] = useState(false);
  const mapStatusToDisplay = (status) => {
    if (status === "For Lease") return "For Rent";
    return status;
  };
  const mapDisplayToStatus = (display) => {
    if (display === "For Rent") return "For Lease";
    return display;
  };
  const urlParams = new URLSearchParams(window.location.search);
  const propertySubType = urlParams.get("property_sub_type");
  const buildingId = urlParams.get("building_id");
  const transactionType = filters.transaction_type || urlParams.get("transaction_type");
  let statusFromTransaction = "";
  if (transactionType === "rent") {
    statusFromTransaction = "For Lease";
  } else if (transactionType === "sale") {
    statusFromTransaction = "For Sale";
  }
  let propertyTypeArray = filters.property_type || [];
  if (propertySubType !== null) {
    propertyTypeArray = propertySubType ? [propertySubType] : [];
    console.log("🏠 Property type from URL:", propertySubType, "→ Array:", propertyTypeArray);
  }
  if (buildingId && propertyTypeArray.length === 0) {
    propertyTypeArray = ["Condo Apartment"];
  }
  const streetNumber = filters.street_number || urlParams.get("street_number");
  const streetName = filters.street_name || urlParams.get("street_name");
  const locationQuery = streetNumber && streetName ? `${streetNumber} ${streetName}` : urlParams.get("query") || filters.search || urlParams.get("location") || "";
  const [searchFilters, setSearchFilters] = useState({
    query: locationQuery,
    status: mapStatusToDisplay(filters.status || filters.forSale || statusFromTransaction || urlParams.get("status") || urlParams.get("property_type") || "For Sale"),
    property_status: urlParams.get("property_status") || filters.property_status || "",
    // For Sold/Leased properties
    property_type: propertyTypeArray.length > 0 ? propertyTypeArray : [],
    // Don't default if no type specified
    building_id: buildingId || filters.building_id || "",
    street_number: streetNumber || filters.street_number || "",
    street_name: streetName || filters.street_name || "",
    street_addresses: urlParams.get("street_addresses") || filters.street_addresses || "",
    price_min: parseInt(urlParams.get("price_min")) || filters.minPrice || parseInt(urlParams.get("min_price")) || 0,
    price_max: parseInt(urlParams.get("price_max")) || filters.maxPrice || parseInt(urlParams.get("max_price")) || 1e7,
    // Default max price 10M
    bedrooms: filters.bedType || parseInt(urlParams.get("bedrooms")) || 0,
    bathrooms: filters.bathrooms || parseInt(urlParams.get("bathrooms")) || 0,
    sort: filters.sort || "newest",
    tab: filters.tab || searchTab || "listings",
    page: filters.page || 1
  });
  const [viewType, setViewType] = useState("grid");
  const [activeTab, setActiveTab] = useState(searchTab || "listings");
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [activeProperty, setActiveProperty] = useState(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [propertyImages, setPropertyImages] = useState({});
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const {
    observeElement,
    isImageLoading,
    imageCache
  } = usePropertyImageLazyLoad({
    batchSize: 4,
    batchDelay: 100,
    rootMargin: "50px",
    // Load images just before they come into view
    threshold: 0.01,
    debug: false
    // Disable debug logging for production
  });
  useEffect(() => {
    setPropertyImages(imageCache);
  }, [imageCache]);
  const handlePropertyHover = (listingKey) => {
    setActiveProperty(listingKey);
  };
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
  };
  const abortControllerRef = useRef(null);
  const performSearch = async (params = searchFilters, resetPage = false, tabOverride = null) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    const url = new URL(window.location);
    const tabParam = url.searchParams.get("tab");
    const pageParam = resetPage ? "1" : url.searchParams.get("page") || "1";
    const websiteParam = url.searchParams.get("website");
    for (const key of [...url.searchParams.keys()]) {
      url.searchParams.delete(key);
    }
    if (tabParam) url.searchParams.set("tab", tabParam);
    url.searchParams.set("page", pageParam);
    if (websiteParam) url.searchParams.set("website", websiteParam);
    const pathEncodesArea = /^\/[a-z][a-z-]*\/[a-z0-9-]+\/(?:\d+-bedroom-)?(?:condos|houses|townhouses|apartments)-for-(?:sale|rent)\/?$/.test(window.location.pathname);
    if (params.query && !pathEncodesArea) {
      url.searchParams.set("query", params.query);
    }
    if (params.status && params.status !== "For Sale") {
      url.searchParams.set("status", params.status);
    }
    if (params.building_id) {
      url.searchParams.set("building_id", params.building_id);
    }
    if (params.street_addresses) {
      url.searchParams.set("street_addresses", params.street_addresses);
    } else if (params.street_number && params.street_name) {
      url.searchParams.set("street_number", params.street_number);
      url.searchParams.set("street_name", params.street_name);
    }
    window.history.replaceState({}, "", url);
    try {
      const currentTab = tabOverride || activeTab;
      let searchParams;
      if (currentTab === "buildings") {
        searchParams = {
          page: resetPage ? 1 : params.page || 1,
          page_size: 16
        };
        if (params.query) searchParams.query = params.query;
        if (params.street_number) searchParams.street_number = params.street_number;
        if (params.street_name) searchParams.street_name = params.street_name;
        if (params.floors && params.floors > 0) searchParams.floors = params.floors;
        if (params.price_min && params.price_min > 0) searchParams.price_min = params.price_min;
        if (params.price_max && params.price_max < 1e7) searchParams.price_max = params.price_max;
      } else {
        const mappedParams = { ...params };
        mappedParams.status = mapDisplayToStatus(mappedParams.status);
        if (params.property_status) {
          mappedParams.property_status = params.property_status;
        }
        if (params.street_number) mappedParams.street_number = params.street_number;
        if (params.street_name) mappedParams.street_name = params.street_name;
        if (params.street_addresses) mappedParams.street_addresses = params.street_addresses;
        if (params.mercer_buildings) mappedParams.mercer_buildings = params.mercer_buildings;
        searchParams = {
          ...mappedParams,
          page: resetPage ? 1 : params.page || 1,
          page_size: 16
        };
        if (drawnPolygon) {
          searchParams.viewport_bounds = drawnPolygon;
        }
      }
      const endpoint = currentTab === "buildings" ? "/api/buildings-search" : "/api/property-search";
      console.log("🔍 Search Parameters:", {
        ...searchParams,
        property_status: searchParams.property_status,
        status: searchParams.status,
        query: searchParams.query,
        property_type: searchParams.property_type
      });
      if (searchParams.query) {
        console.log("🏘️ Neighborhood Search:", {
          query: searchParams.query,
          isNeighborhoodSearch: ["yorkville", "the annex", "rosedale", "forest hill"].includes(searchParams.query.toLowerCase()),
          propertyTypes: searchParams.property_type
        });
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken()
        },
        body: JSON.stringify({
          search_params: searchParams
        }),
        signal: abortControllerRef.current.signal
      });
      const result = await response.json();
      if (result.success) {
        console.log("🔍 SEARCH DEBUG:", {
          page: result.data.page,
          total: result.data.total,
          mls_db_total: result.data.mls_db_total,
          displayed: result.data.displayed,
          debug: result.data.debug
        });
        if (result.data.properties?.length > 0) {
          const dbCount = result.data.properties.filter((p) => p.data_source === "mls_database").length;
          const apiCount = result.data.properties.filter((p) => p.data_source === "mls_api").length;
          console.log(`📊 Property sources: ${dbCount} from DB, ${apiCount} from API`);
        }
        const currentTab2 = tabOverride || activeTab;
        if (currentTab2 === "listings") {
          if (result.data.properties && result.data.properties.length > 0) {
            console.log("📦 Properties loaded:", result.data.properties.length);
            console.log("🏷️ First property details:", {
              ListingKey: result.data.properties[0].ListingKey,
              StandardStatus: result.data.properties[0].StandardStatus,
              MlsStatus: result.data.properties[0].MlsStatus,
              TransactionType: result.data.properties[0].TransactionType,
              formatted_status: result.data.properties[0].formatted_status,
              data_source: result.data.properties[0].data_source
            });
            if (searchParams.property_status === "Sold" || searchParams.property_status === "Leased") {
              const statusCount = result.data.properties.filter(
                (p) => p.StandardStatus === searchParams.property_status || p.MlsStatus === searchParams.property_status
              ).length;
              console.log(`✅ ${searchParams.property_status} properties: ${statusCount}/${result.data.properties.length}`);
            }
          }
          const rawProperties = result.data.properties || [];
          const seenKeys = /* @__PURE__ */ new Set();
          const dedupedProperties = rawProperties.filter((p) => {
            const key = p.ListingKey;
            if (!key) return true;
            if (seenKeys.has(key)) return false;
            seenKeys.add(key);
            return true;
          });
          setProperties(dedupedProperties);
          setBuildings([]);
        } else {
          setBuildings(result.data.buildings || []);
          setProperties([]);
        }
        setTotal(result.data.total || 0);
        setCurrentPage(result.data.page || 1);
        setLastPage(Math.ceil((result.data.total || 0) / 16));
      } else {
        console.error("Search failed:", result.message);
        setProperties([]);
        setBuildings([]);
        setTotal(0);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Previous search aborted");
        return;
      }
      console.error("Search error:", error);
      setProperties([]);
      setBuildings([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const loadFromUrl = () => {
      const urlParams2 = new URLSearchParams(window.location.search);
      const pageFromUrl = parseInt(urlParams2.get("page")) || 1;
      const tabFromUrl = urlParams2.get("tab") || activeTab;
      const statusFromUrl = urlParams2.get("status") || urlParams2.get("property_type");
      const propertySubType2 = urlParams2.get("property_sub_type");
      if (tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl);
      }
      const buildingIdFromUrl = urlParams2.get("building_id");
      const transactionTypeFromUrl = filters.transaction_type || urlParams2.get("transaction_type");
      let statusFromTransaction2 = "";
      if (transactionTypeFromUrl === "rent") {
        statusFromTransaction2 = "For Lease";
      } else if (transactionTypeFromUrl === "sale") {
        statusFromTransaction2 = "For Sale";
      }
      let propertyTypes = ["Condo Apartment"];
      if (propertySubType2) {
        propertyTypes = [propertySubType2];
      }
      const streetNumber2 = filters.street_number || urlParams2.get("street_number");
      const streetName2 = filters.street_name || urlParams2.get("street_name");
      const locationQuery2 = filters.mercer_buildings ? "15 & 35 Mercer" : streetNumber2 && streetName2 ? `${streetNumber2} ${streetName2}` : urlParams2.get("query") || urlParams2.get("location") || filters.location || filters.query || "";
      const initialFilters = {
        query: locationQuery2,
        street_number: streetNumber2 || "",
        street_name: streetName2 || "",
        mercer_buildings: filters.mercer_buildings || false,
        status: mapStatusToDisplay(statusFromTransaction2 || statusFromUrl || filters.status || "For Sale"),
        property_type: propertyTypes.length > 0 ? propertyTypes : filters.property_type || ["Condo Apartment"],
        building_id: buildingIdFromUrl || filters.building_id || "",
        price_min: parseInt(urlParams2.get("price_min")) || parseInt(urlParams2.get("min_price")) || filters.price_min || 0,
        price_max: parseInt(urlParams2.get("price_max")) || parseInt(urlParams2.get("max_price")) || filters.price_max || 1e7,
        bedrooms: parseInt(urlParams2.get("bedrooms")) || filters.bedrooms || 0,
        bathrooms: parseInt(urlParams2.get("bathrooms")) || filters.bathrooms || 0,
        sort: urlParams2.get("sort") || filters.sort || "newest",
        tab: tabFromUrl,
        page: pageFromUrl
      };
      setSearchFilters(initialFilters);
      setCurrentPage(pageFromUrl);
      performSearch(initialFilters, false, tabFromUrl);
    };
    loadFromUrl();
    const handlePopState = () => {
      loadFromUrl();
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [filters.street_number, filters.street_name, filters.transaction_type, filters.mercer_buildings]);
  const handleTabChange = (tab) => {
    const url = new URL(window.location);
    url.searchParams.set("page", 1);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url);
    setActiveTab(tab);
    if (tab === "buildings" && (viewType === "map" || viewType === "mixed")) {
      setViewType("grid");
    }
    const newFilters = {
      ...searchFilters,
      tab,
      page: 1
    };
    setSearchFilters(newFilters);
    setCurrentPage(1);
    performSearch(newFilters, false, tab);
  };
  const handlePageChange = (page) => {
    if (page < 1 || page > lastPage || page === currentPage) return;
    const url = new URL(window.location);
    url.searchParams.set("page", page);
    window.history.pushState({}, "", url);
    const newFilters = { ...searchFilters, page };
    setSearchFilters(newFilters);
    setCurrentPage(page);
    performSearch(newFilters, false, activeTab);
    const resultsSection = document.querySelector(".property-listing-section");
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const handleFiltersApply = (filters2) => {
    console.log("🔍 FiltersModal filters received:", filters2);
    const isSoldOrLeased = filters2.status === "Sold" || filters2.status === "Leased";
    const newFilters = {
      ...searchFilters,
      // For Sold/Leased, set property_status and clear status; otherwise set status
      status: isSoldOrLeased ? "For Sale" : filters2.status,
      property_status: isSoldOrLeased ? filters2.status : "",
      // Price range
      price_min: filters2.price_min || 0,
      price_max: filters2.price_max || 1e7,
      // Property types (array)
      property_type: filters2.property_type || [],
      // Bedrooms & Bathrooms
      bedrooms: filters2.bedrooms || 0,
      den: filters2.den || false,
      bathrooms: filters2.bathrooms || 0,
      // Additional filters
      home_types: filters2.home_types || [],
      days_on_market: filters2.days_on_market !== "Any" ? filters2.days_on_market : "",
      locker: filters2.locker !== "Any" ? filters2.locker : "",
      balcony: filters2.balcony !== "Any" ? filters2.balcony : "",
      amenities: filters2.amenities || [],
      keywords: filters2.keywords || "",
      page: 1
      // Reset to first page when applying filters
    };
    console.log("🔍 New search filters:", newFilters);
    setSearchFilters(newFilters);
    setCurrentPage(1);
    performSearch(newFilters, true, activeTab);
  };
  const handlePolygonDraw = useCallback((bounds) => {
    setDrawnPolygon(bounds);
    setSearchFilters((prev) => ({ ...prev, viewport_bounds: bounds || void 0 }));
  }, []);
  const mapSearchFilters = useMemo(() => ({
    ...searchFilters,
    status: searchFilters.status === "For Rent" ? "For Lease" : searchFilters.status
  }), [searchFilters]);
  const handleMapPropertyClick = useCallback((coord) => {
    console.log("Property clicked:", coord?.mls_id);
  }, []);
  const handleMapMarkerCountChange = useCallback((displayed, total2) => {
    console.log(`Map showing ${displayed} of ${total2} properties`);
  }, []);
  const handleSaveSearch = async () => {
    if (!auth?.user) {
      setShowLoginModal(true);
      return;
    }
    const filters2 = [];
    if (searchFilters.status) filters2.push(searchFilters.status);
    if (searchFilters.price_min || searchFilters.price_max) {
      filters2.push(`$${(searchFilters.price_min || 0).toLocaleString()}-$${(searchFilters.price_max || 1e7).toLocaleString()}`);
    }
    if (searchFilters.bedrooms) filters2.push(`${searchFilters.bedrooms}+ beds`);
    const searchName = filters2.length > 0 ? filters2.join(", ") : `Search - ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`;
    const saveData = {
      name: searchName,
      search_params: searchFilters,
      email_alerts: false
    };
    try {
      const response = await fetch("/api/save-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": getCsrfToken()
        },
        body: JSON.stringify(saveData)
      });
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        setShowLoginModal(true);
        return;
      }
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to save searches");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        const successMsg = document.createElement("div");
        successMsg.className = "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
        successMsg.innerHTML = '<span class="flex items-center gap-2">✓ Search saved successfully!</span>';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          successMsg.style.transition = "opacity 0.3s";
          successMsg.style.opacity = "0";
          setTimeout(() => successMsg.remove(), 300);
        }, 2500);
      } else {
        throw new Error(result.message || "Failed to save search");
      }
    } catch (error) {
      console.error("Save search error:", error);
      const errorMsg = document.createElement("div");
      errorMsg.className = "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      errorMsg.innerHTML = `<span class="flex items-center gap-2">❌ ${error.message || "Failed to save search"}</span>`;
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        errorMsg.style.transition = "opacity 0.3s";
        errorMsg.style.opacity = "0";
        setTimeout(() => errorMsg.remove(), 300);
      }, 3e3);
    }
  };
  const formatPropertyForCard = (property) => {
    if (property.ListingKey === "C12373183") {
      console.log("🔍 Raw property from API:", property);
    }
    const cachedImage = propertyImages[property.ListingKey];
    let imageUrl = property.MediaURL;
    if (cachedImage && cachedImage.image_url) {
      imageUrl = cachedImage.image_url;
    }
    return {
      id: property.ListingKey,
      listingKey: property.ListingKey,
      ListingKey: property.ListingKey,
      // Include both cases
      price: property.ListPrice,
      bedrooms: property.BedroomsTotal,
      bathrooms: property.BathroomsTotalInteger,
      sqft: property.LivingAreaRange || property.AboveGradeFinishedArea || 0,
      parking: property.ParkingTotal,
      address: property.UnparsedAddress,
      propertyType: property.PropertySubType,
      PropertySubType: property.PropertySubType,
      // Include both cases
      transactionType: property.TransactionType,
      TransactionType: property.TransactionType,
      // Include both cases
      StandardStatus: property.StandardStatus,
      // IMPORTANT: Include StandardStatus
      MlsStatus: property.MlsStatus,
      // IMPORTANT: Include MlsStatus
      formatted_status: property.formatted_status,
      // IMPORTANT: Include formatted_status
      IsJustListed: property.IsJustListed || false,
      DaysOnMarket: property.DaysOnMarket,
      city: property.City,
      province: property.StateOrProvince,
      country: property.Country || property.country || "",
      source: "mls",
      imageUrl,
      // Will be updated via lazy loading
      images: cachedImage?.all_images || property.Images || [],
      isImageLoading: isImageLoading(property.ListingKey),
      // Add all MLS fields needed for formatters (both cases for compatibility)
      UnitNumber: property.UnitNumber,
      unitNumber: property.UnitNumber,
      StreetNumber: property.StreetNumber,
      streetNumber: property.StreetNumber,
      StreetName: property.StreetName,
      streetName: property.StreetName,
      StreetSuffix: property.StreetSuffix,
      streetSuffix: property.StreetSuffix,
      LivingAreaRange: property.LivingAreaRange,
      livingAreaRange: property.LivingAreaRange,
      LivingArea: property.LivingArea,
      livingArea: property.LivingArea,
      BuildingAreaTotal: property.BuildingAreaTotal || property.AboveGradeFinishedArea,
      buildingAreaTotal: property.BuildingAreaTotal || property.AboveGradeFinishedArea,
      AboveGradeFinishedArea: property.AboveGradeFinishedArea,
      ParkingSpaces: property.ParkingSpaces,
      parkingSpaces: property.ParkingSpaces,
      ParkingTotal: property.ParkingTotal,
      parkingTotal: property.ParkingTotal,
      ListOfficeName: property.ListOfficeName,
      listOfficeName: property.ListOfficeName,
      BedroomsTotal: property.BedroomsTotal,
      bedroomsTotal: property.BedroomsTotal,
      BathroomsTotalInteger: property.BathroomsTotalInteger,
      bathroomsTotalInteger: property.BathroomsTotalInteger
    };
  };
  const formatBuildingForCard = (building) => {
    console.log("🏢 Formatting building for card:", building);
    console.log("🏢 Building for URL generation:", {
      id: building.id,
      name: building.name,
      address: building.address,
      city: building.city
    });
    return {
      id: building.id,
      listingKey: building.id,
      price: building.price_range || "Price on Request",
      bedrooms: building.total_units ? `${building.total_units} Units` : null,
      bathrooms: building.floors ? `${building.floors} Floors` : null,
      sqft: building.year_built ? `Built ${building.year_built}` : null,
      parking: building.parking_spots || null,
      address: building.address,
      propertyType: building.name || building.building_type || "Building",
      // Show building name as property type
      transactionType: building.listing_type || "For Sale",
      city: building.city,
      province: building.province,
      source: "building",
      imageUrl: building.main_image || "/images/no-image-placeholder.jpg",
      images: building.images || [],
      isImageLoading: false,
      // Additional building-specific data
      developer: building.developer?.name || building.developer_name || null,
      totalUnits: building.total_units,
      floors: building.floors,
      status: building.status,
      // Live for-sale / for-rent counts from /api/buildings-search.
      // PropertyCardV5 reads these as `${unitsForSale} Condos for Sale | ${unitsForRent} Condos for Rent`.
      // Without these the card renders "0 Condos for Sale | 0 Condos for Rent".
      unitsForSale: building.units_for_sale,
      unitsForRent: building.units_for_rent,
      // Map coordinates for building markers (ensure proper case)
      Latitude: building.latitude || building.Latitude,
      Longitude: building.longitude || building.Longitude,
      // Building name for map labels - make sure it's available
      name: building.name,
      building_name: building.name
      // Additional fallback
    };
  };
  return /* @__PURE__ */ jsxs(MainLayout, { siteName, siteUrl, year, website, auth, noPadding: true, blueHeader: true, children: [
    /* @__PURE__ */ jsx(Head, { title: `Property Search - ${siteName}` }),
    /* @__PURE__ */ jsx("div", { className: "enhanced-property-search", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1280px] mx-auto px-4 md:px-0", children: [
      false,
      /* @__PURE__ */ jsx("div", { className: "my-6", children: /* @__PURE__ */ jsx(
        IDXAmpreSearchBar,
        {
          isAuthenticated: !!auth?.user,
          autoSearch: true,
          initialValues: {
            location: searchFilters.query || "",
            propertyType: searchFilters.status || "For Sale",
            propertySubType: searchFilters.property_type && searchFilters.property_type.length > 0 ? searchFilters.property_type[0] : "",
            bedrooms: String(searchFilters.bedrooms || "0"),
            bathrooms: String(searchFilters.bathrooms || "0"),
            minPrice: searchFilters.price_min || 0,
            maxPrice: searchFilters.price_max || 1e7,
            searchType: urlParams.get("search_type") || "global"
          },
          viewMode: viewType,
          onViewModeChange: (mode) => setViewType(mode),
          onSearch: (searchData) => {
            const soldOrLeasedStatus = searchData.property_status || "";
            const isSoldOrLeased = soldOrLeasedStatus === "Sold" || soldOrLeasedStatus === "Leased";
            const effectiveStatus = isSoldOrLeased ? soldOrLeasedStatus === "Sold" ? "For Sale" : "For Rent" : searchData.propertyType;
            const newFilters = {
              ...searchFilters,
              query: searchData.location,
              status: effectiveStatus,
              property_status: soldOrLeasedStatus,
              // Sold or Leased
              property_type: searchData.propertySubType ? [searchData.propertySubType] : [],
              bedrooms: parseInt(searchData.bedrooms) || 0,
              bathrooms: parseInt(searchData.bathrooms) || 0,
              price_min: searchData.minPrice,
              price_max: searchData.maxPrice,
              search_type: searchData.searchType || "street",
              sort: searchData.sortBy || "newest",
              page: 1
            };
            setSearchFilters(newFilters);
            performSearch(newFilters, true, activeTab);
          },
          onSaveSearch: handleSaveSearch,
          onFilterClick: () => setShowFiltersModal(true)
        }
      ) }),
      false,
      /* @__PURE__ */ jsxs("div", { className: "py-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsx("h1", { className: "font-space-grotesk font-bold text-[40px] leading-[50px] tracking-[-0.03em] text-black mb-6", children: activeTab === "listings" ? searchFilters.property_status === "Sold" ? "Sold Properties" : searchFilters.property_status === "Leased" ? "Leased Properties" : searchFilters.status === "For Rent" ? "Properties For Rent" : searchFilters.status === "For Sale" ? "Properties For Sale" : "Property Listings" : "Buildings" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center overflow-x-auto scrollbar-hide", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleTabChange("listings"),
                  className: `flex flex-row justify-center items-center px-2 md:px-[10px] py-[10px] gap-1 md:gap-[10px] min-w-fit md:w-[168px] h-[40px] md:h-[50px] ${activeTab === "listings" ? "border-b-2 border-[#252B37]" : ""} box-border flex-shrink-0`,
                  children: /* @__PURE__ */ jsxs("span", { className: `font-red-hat-display font-bold text-base md:text-[20px] leading-[24px] md:leading-[30px] flex items-center gap-1 md:gap-2 tracking-[-0.03em] whitespace-nowrap ${activeTab === "listings" ? "text-[#252B37]" : "text-gray-400"}`, children: [
                    "Listings ",
                    total > 0 && !isLoading && activeTab === "listings" && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center px-1.5 md:px-2 py-0.5 text-xs md:text-sm font-bold rounded-full min-w-[24px] md:min-w-[28px]", style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }, children: total.toLocaleString() })
                  ] })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleTabChange("buildings"),
                  className: `flex flex-row justify-center items-center px-2 md:px-[10px] py-[10px] gap-1 md:gap-[10px] min-w-fit md:w-[120px] h-[40px] md:h-[50px] ${activeTab === "buildings" ? "border-b-2 border-[#252B37]" : ""} flex-shrink-0`,
                  children: /* @__PURE__ */ jsxs("span", { className: `font-red-hat-display font-bold text-base md:text-[20px] leading-[24px] md:leading-[30px] flex items-center gap-1 md:gap-2 tracking-[-0.03em] whitespace-nowrap ${activeTab === "buildings" ? "text-[#252B37]" : "text-gray-400"}`, children: [
                    "Buildings ",
                    total > 0 && !isLoading && activeTab === "buildings" && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center px-1.5 md:px-2 py-0.5 text-xs md:text-sm font-bold rounded-full min-w-[24px] md:min-w-[28px]", style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText }, children: total.toLocaleString() })
                  ] })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 md:gap-4 justify-between md:justify-end", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center bg-white border border-black rounded-lg p-0.5 md:p-1", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setViewType("grid"),
                    className: `p-1.5 md:p-2 rounded ${viewType === "grid" ? "text-white" : "text-gray-600 hover:bg-gray-100"}`,
                    style: viewType === "grid" ? { backgroundColor: buttonPrimaryBg } : {},
                    title: "Grid View",
                    children: /* @__PURE__ */ jsx(GridIcon, { className: "w-4 h-4 md:w-5 md:h-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setViewType("mixed"),
                    className: `p-1.5 md:p-2 rounded ${viewType === "mixed" ? "text-white" : "text-gray-600 hover:bg-gray-100"}`,
                    style: viewType === "mixed" ? { backgroundColor: buttonPrimaryBg } : {},
                    title: "Mixed View",
                    children: /* @__PURE__ */ jsx(MixedIcon, { className: "w-4 h-4 md:w-5 md:h-5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setViewType("map"),
                    className: `p-1.5 md:p-2 rounded ${viewType === "map" ? "text-white" : "text-gray-600 hover:bg-gray-100"}`,
                    style: viewType === "map" ? { backgroundColor: buttonPrimaryBg } : {},
                    title: "Map View",
                    children: /* @__PURE__ */ jsx(MapIcon, { className: "w-4 h-4 md:w-5 md:h-5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowSortDropdown(!showSortDropdown),
                    className: "flex flex-row justify-center items-center px-2 md:px-4 py-1.5 md:py-2 gap-1 md:gap-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-white transition-colors",
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "font-work-sans font-medium text-sm md:text-base leading-[20px] md:leading-[25px] flex items-center text-center tracking-[-0.03em] text-black", children: "Sort" }),
                      /* @__PURE__ */ jsx("div", { className: "w-3 h-3 md:w-4 md:h-4", children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "w-3 h-3 md:w-4 md:h-4 text-black" }) })
                    ]
                  }
                ),
                showSortDropdown && /* @__PURE__ */ jsxs("div", { className: "absolute top-full right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-xl z-50", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => {
                        setSearchFilters((prev) => ({ ...prev, sort: "newest" }));
                        setShowSortDropdown(false);
                        performSearch({ ...searchFilters, sort: "newest" }, false, activeTab);
                      },
                      className: `w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg ${searchFilters.sort === "newest" ? "text-white" : ""}`,
                      style: searchFilters.sort === "newest" ? { backgroundColor: brandColors.primary } : {},
                      children: "Newest First"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => {
                        setSearchFilters((prev) => ({ ...prev, sort: "price-high" }));
                        setShowSortDropdown(false);
                        performSearch({ ...searchFilters, sort: "price-high" }, false, activeTab);
                      },
                      className: `w-full px-4 py-2 text-left hover:bg-gray-100 ${searchFilters.sort === "price-high" ? "text-white" : ""}`,
                      style: searchFilters.sort === "price-high" ? { backgroundColor: brandColors.primary } : {},
                      children: "Price: High to Low"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => {
                        setSearchFilters((prev) => ({ ...prev, sort: "price-low" }));
                        setShowSortDropdown(false);
                        performSearch({ ...searchFilters, sort: "price-low" }, false, activeTab);
                      },
                      className: `w-full px-4 py-2 text-left hover:bg-gray-100 ${searchFilters.sort === "price-low" ? "text-white" : ""}`,
                      style: searchFilters.sort === "price-low" ? { backgroundColor: brandColors.primary } : {},
                      children: "Price: Low to High"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => {
                        setSearchFilters((prev) => ({ ...prev, sort: "bedrooms" }));
                        setShowSortDropdown(false);
                        performSearch({ ...searchFilters, sort: "bedrooms" }, false, activeTab);
                      },
                      className: `w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-lg ${searchFilters.sort === "bedrooms" ? "text-white" : ""}`,
                      style: searchFilters.sort === "bedrooms" ? { backgroundColor: brandColors.primary } : {},
                      children: "Bedrooms: Most First"
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ] }),
        isLoading ? (
          // Centered loader in the property listings area
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "inline-block w-12 h-12 border-3 border-[#293056] border-t-transparent rounded-full animate-spin mb-4" }),
            /* @__PURE__ */ jsx("div", { className: "text-[#293056] text-lg font-medium", children: activeTab === "buildings" ? "Loading buildings..." : "Loading properties..." })
          ] }) })
        ) : viewType === "map" ? (
          // Full Map View with clustering for 500-1000+ markers
          activeTab === "listings" ? /* @__PURE__ */ jsx(
            ClusteredPropertyMap,
            {
              searchFilters: mapSearchFilters,
              className: "w-full h-[600px]",
              onPropertyClick: handleMapPropertyClick,
              onMarkerCountChange: handleMapMarkerCountChange,
              onPolygonDraw: handlePolygonDraw
            }
          ) : (
            // Use ViewportAwarePropertyMap for buildings
            /* @__PURE__ */ jsx(
              ViewportAwarePropertyMap,
              {
                properties: buildings,
                className: "w-full h-[600px]",
                onPropertyClick: (property) => {
                  console.log("Building clicked:", property.id);
                },
                viewType: "full",
                searchFilters,
                isLoading,
                activeTab
              }
            )
          )
        ) : viewType === "mixed" ? (
          // Enhanced Mixed View - IDX-AMPRE style split layout with two cards per row
          // On mobile: Show only listings (no map). On desktop: Show listings + map side by side
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex flex-col md:flex-row h-auto md:h-[calc(100vh-300px)] md:min-h-[700px] bg-white rounded-lg shadow-sm border overflow-hidden",
              style: { fontFamily: "'Helvetica', 'Arial', sans-serif" },
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col md:border-r border-gray-200", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 px-4 md:px-6 py-3 md:py-4 bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-bold text-base md:text-lg text-gray-900", children: activeTab === "listings" ? "Properties" : "Buildings" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxs("span", { className: "text-xs md:text-sm font-medium text-gray-600", children: [
                        activeTab === "listings" ? properties.length : buildings.length,
                        " results"
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full" })
                    ] })
                  ] }) }),
                  /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-2 md:p-4 mixed-view-scroll", children: isLoading ? (
                    // Loader for mixed view left panel
                    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsx("div", { className: "inline-block w-10 h-10 border-3 border-[#293056] border-t-transparent rounded-full animate-spin mb-3" }),
                      /* @__PURE__ */ jsx("div", { className: "text-[#293056] text-sm", children: "Loading..." })
                    ] }) })
                  ) : activeTab === "listings" ? (
                    // Show search results in the left panel
                    properties.length > 0 ? /* @__PURE__ */ jsx("div", { className: "idx-ampre-mixed-grid", children: properties.map((property, index) => {
                      const formattedProperty = formatPropertyForCard(property);
                      const cardKey = property.ListingKey ? `${property.ListingKey}-${index}` : `idx-${index}`;
                      if (formattedProperty.imageUrl) {
                        return /* @__PURE__ */ jsx(
                          PropertyCardV5,
                          {
                            property: formattedProperty,
                            size: "grid",
                            onClick: (property2) => {
                              window.location.href = generatePropertyUrl(property2);
                            },
                            onLoginRequired: () => setShowLoginModal(true),
                            className: `w-full transition-all duration-300 ${activeProperty === property.ListingKey ? "scale-[1.02] z-10" : ""}`
                          },
                          cardKey
                        );
                      }
                      return /* @__PURE__ */ jsx(
                        LazyPropertyCard,
                        {
                          property: formattedProperty,
                          size: "mobile",
                          observeElement,
                          onMouseEnter: () => handlePropertyHover(property.ListingKey),
                          onMouseLeave: () => handlePropertyHover(null),
                          onClick: (property2) => {
                            window.location.href = `/property/${property2.listingKey}`;
                          },
                          className: `w-full transition-all duration-300 ${activeProperty === property.ListingKey ? "scale-[1.02] z-10" : ""}`
                        },
                        cardKey
                      );
                    }) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
                      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-16 h-16 mx-auto text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) }) }),
                      /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-xl font-semibold mb-2", children: "No properties found" }),
                      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Try adjusting your search filters to see more results" })
                    ] })
                  ) : buildings && buildings.length > 0 ? /* @__PURE__ */ jsx("div", { className: "idx-ampre-mixed-grid", children: buildings.map((building) => {
                    const formattedBuilding = formatBuildingForCard(building);
                    return /* @__PURE__ */ jsx(
                      PropertyCardV5,
                      {
                        property: formattedBuilding,
                        size: "grid",
                        onClick: () => {
                          window.location.href = createSEOBuildingUrl(building);
                        },
                        className: `w-full transition-all duration-300 ${activeProperty === building.id ? "scale-[1.02] z-10" : ""}`
                      },
                      building.id
                    );
                  }) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
                    /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-16 h-16 mx-auto text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }) }) }),
                    /* @__PURE__ */ jsx("div", { className: "text-gray-600 text-xl font-semibold mb-2", children: "No buildings found" }),
                    /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Try adjusting your search filters to see more results" })
                  ] }) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "hidden md:flex flex-shrink-0 flex-col bg-gray-50 w-[40%] lg:w-[50%] max-w-[600px]", children: activeTab === "listings" ? (
                  // Use ClusteredPropertyMap for listings - shows ALL matching properties as clusters
                  /* @__PURE__ */ jsx(
                    ClusteredPropertyMap,
                    {
                      searchFilters: mapSearchFilters,
                      className: "w-full h-full",
                      onPropertyClick: handleMapPropertyClick,
                      onMarkerCountChange: handleMapMarkerCountChange,
                      onPolygonDraw: handlePolygonDraw,
                      initialZoom: 12
                    }
                  )
                ) : (
                  // Keep ViewportAwarePropertyMap for buildings tab
                  /* @__PURE__ */ jsx(
                    ViewportAwarePropertyMap,
                    {
                      properties: buildings,
                      className: "w-full h-full",
                      onPropertyClick: (property) => {
                        console.log("Building clicked:", property.id);
                      },
                      viewType: "mixed",
                      searchFilters,
                      isLoading,
                      activeTab
                    }
                  )
                ) })
              ]
            }
          )
        ) : (
          // Grid View - IDX-AMPRE style 4 cards per row like the plugin
          /* @__PURE__ */ jsx("div", { children: activeTab === "listings" ? (
            // Property Cards - 4 per row IDX-AMPRE style with lazy loading
            properties && properties.length > 0 ? /* @__PURE__ */ jsx("div", { className: "idx-ampre-grid", children: properties.map((property, index) => {
              const formattedProperty = formatPropertyForCard(property);
              const cardKey = property.ListingKey ? `${property.ListingKey}-${index}` : `idx-${index}`;
              if (formattedProperty.imageUrl) {
                return /* @__PURE__ */ jsx(
                  PropertyCardV5,
                  {
                    property: formattedProperty,
                    size: "default",
                    onClick: (property2) => {
                      window.location.href = generatePropertyUrl(property2);
                    },
                    onLoginRequired: () => setShowLoginModal(true),
                    className: ""
                  },
                  cardKey
                );
              }
              return /* @__PURE__ */ jsx(
                LazyPropertyCard,
                {
                  property: formattedProperty,
                  size: "default",
                  observeElement,
                  onMouseEnter: () => handlePropertyHover(property.ListingKey),
                  onMouseLeave: () => handlePropertyHover(null),
                  onClick: (property2) => {
                    window.location.href = generatePropertyUrl(property2);
                  },
                  className: ""
                },
                cardKey
              );
            }) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
              /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-lg", children: "No properties found" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-400 mt-2", children: "Try adjusting your search filters" })
            ] })
          ) : (
            // Building Cards - using same PropertyCardV5 as properties
            buildings && buildings.length > 0 ? /* @__PURE__ */ jsx("div", { className: "idx-ampre-grid", children: buildings.map((building) => {
              const formattedBuilding = formatBuildingForCard(building);
              return /* @__PURE__ */ jsx(
                PropertyCardV5,
                {
                  property: formattedBuilding,
                  size: "default",
                  onClick: () => {
                    window.location.href = createSEOBuildingUrl(building);
                  },
                  className: ""
                },
                building.id
              );
            }) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
              /* @__PURE__ */ jsx("div", { className: "text-gray-500 text-lg", children: "No buildings found" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-400 mt-2", children: "Try adjusting your search filters" })
            ] })
          ) })
        ),
        total > 16 && viewType !== "map" && /* @__PURE__ */ jsxs("div", { className: "pagination-grid-container mt-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "pagination-wrapper flex justify-center items-center gap-2", children: [
            currentPage > 1 && /* @__PURE__ */ jsx(
              "button",
              {
                className: "pagination-btn pagination-prev p-2 rounded border border-gray-300 hover:bg-gray-50",
                onClick: () => handlePageChange(currentPage - 1),
                disabled: isLoading,
                "aria-label": "Previous page",
                children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" }) })
              }
            ),
            (() => {
              const paginationRange = 5;
              const startPage = Math.max(1, currentPage - Math.floor(paginationRange / 2));
              let endPage = Math.min(lastPage, startPage + paginationRange - 1);
              const adjustedStartPage = endPage - startPage < paginationRange - 1 ? Math.max(1, endPage - paginationRange + 1) : startPage;
              return /* @__PURE__ */ jsxs(Fragment, { children: [
                adjustedStartPage > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "pagination-btn px-3 py-2 rounded border border-gray-300 hover:bg-gray-50",
                      onClick: () => handlePageChange(1),
                      disabled: isLoading,
                      children: "1"
                    }
                  ),
                  adjustedStartPage > 2 && /* @__PURE__ */ jsx("span", { className: "pagination-ellipsis px-2", children: "..." })
                ] }),
                Array.from({ length: endPage - adjustedStartPage + 1 }, (_, i) => adjustedStartPage + i).map((pageNum) => /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: `pagination-btn px-3 py-2 rounded border ${pageNum === currentPage ? "bg-[#293056] text-white border-[#293056] active" : "border-gray-300 hover:bg-gray-50"}`,
                    onClick: () => handlePageChange(pageNum),
                    disabled: isLoading,
                    "aria-current": pageNum === currentPage ? "page" : void 0,
                    children: pageNum
                  },
                  `page-${pageNum}`
                )),
                endPage < lastPage && /* @__PURE__ */ jsxs(Fragment, { children: [
                  endPage < lastPage - 1 && /* @__PURE__ */ jsx("span", { className: "pagination-ellipsis px-2", children: "..." }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "pagination-btn px-3 py-2 rounded border border-gray-300 hover:bg-gray-50",
                      onClick: () => handlePageChange(lastPage),
                      disabled: isLoading,
                      children: lastPage
                    }
                  )
                ] })
              ] });
            })(),
            currentPage < lastPage && /* @__PURE__ */ jsx(
              "button",
              {
                className: "pagination-btn pagination-next p-2 rounded border border-gray-300 hover:bg-gray-50",
                onClick: () => handlePageChange(currentPage + 1),
                disabled: isLoading,
                "aria-label": "Next page",
                children: /* @__PURE__ */ jsx("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" }) })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pagination-info text-center mt-3 text-gray-600", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Page ",
              currentPage,
              " of ",
              lastPage
            ] }),
            /* @__PURE__ */ jsx("span", { className: "pagination-separator mx-2", children: "•" }),
            /* @__PURE__ */ jsxs("span", { children: [
              total.toLocaleString(),
              " total properties"
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(
      FiltersModal,
      {
        isOpen: showFiltersModal,
        onClose: () => setShowFiltersModal(false),
        onApply: handleFiltersApply,
        currentFilters: searchFilters,
        totalCount: total
      }
    ),
    /* @__PURE__ */ jsx(
      LoginModal,
      {
        isOpen: showLoginModal,
        onClose: () => setShowLoginModal(false),
        website
      }
    )
  ] });
}
export {
  EnhancedPropertySearch as default
};
