import { jsx, jsxs } from "react/jsx-runtime";
import React, { useRef, useState, useCallback, useEffect } from "react";
import GoogleMapContainer from "./GoogleMapContainer-1QRikaEJ.js";
import { renderPropertyCardInInfoWindow } from "./MapPropertyCard-JetgmWMH.js";
import { c as createBuildingUrl } from "./slug-BdTdDGUL.js";
import "react-dom/client";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "@inertiajs/react";
class FrontendGeocodingService {
  constructor() {
    this.geocoder = null;
    this.cache = /* @__PURE__ */ new Map();
    this.queue = [];
    this.isProcessing = false;
    this.rateLimitDelay = 100;
    this.initializeGeocoder();
  }
  /**
   * Initialize Google Maps Geocoder
   */
  initializeGeocoder() {
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      this.geocoder = new window.google.maps.Geocoder();
      console.log("Frontend Geocoding: Google Maps Geocoder initialized");
    } else {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.Geocoder) {
          this.geocoder = new window.google.maps.Geocoder();
          console.log("Frontend Geocoding: Google Maps Geocoder initialized");
          clearInterval(checkInterval);
          if (this.queue.length > 0) {
            this.processQueue();
          }
        }
      }, 500);
      setTimeout(() => clearInterval(checkInterval), 1e4);
    }
  }
  /**
   * Geocode visible properties only
   * @param {Array} properties - Array of property objects
   * @param {Function} onUpdate - Callback when a property is geocoded
   * @returns {Promise}
   */
  async geocodeVisibleProperties(properties, onUpdate) {
    if (!properties || properties.length === 0) {
      return properties;
    }
    console.log("Frontend Geocoding: Processing", properties.length, "visible properties");
    const needsGeocoding = properties.filter((property) => {
      const lat = parseFloat(property.Latitude || property.lat || 0);
      const lng = parseFloat(property.Longitude || property.lng || 0);
      if (lat && lng && lat !== 0 && lng !== 0) {
        return false;
      }
      const address = this.getPropertyAddress(property);
      if (this.cache.has(address)) {
        const cached = this.cache.get(address);
        property.Latitude = cached.lat;
        property.Longitude = cached.lng;
        property.lat = cached.lat;
        property.lng = cached.lng;
        if (onUpdate) onUpdate(property);
        return false;
      }
      return true;
    });
    if (needsGeocoding.length === 0) {
      console.log("Frontend Geocoding: No properties need geocoding");
      return properties;
    }
    console.log("Frontend Geocoding: Found", needsGeocoding.length, "properties that need geocoding");
    needsGeocoding.forEach((property) => {
      this.queue.push({ property, onUpdate });
    });
    if (!this.isProcessing) {
      this.processQueue();
    }
    return properties;
  }
  /**
   * Process geocoding queue with rate limiting
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    if (!this.geocoder) {
      console.log("Frontend Geocoding: Geocoder not ready, waiting...");
      return;
    }
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const { property, onUpdate } = this.queue.shift();
      try {
        await this.geocodeProperty(property, onUpdate);
        await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay));
      } catch (error) {
        console.error("Frontend Geocoding: Error processing property", error);
      }
    }
    this.isProcessing = false;
  }
  /**
   * Geocode a single property
   */
  async geocodeProperty(property, onUpdate) {
    const address = this.getPropertyAddress(property);
    if (!address) {
      console.warn("Frontend Geocoding: No address for property", property.ListingKey || property.listingKey);
      return;
    }
    return new Promise((resolve) => {
      this.geocoder.geocode(
        {
          address,
          region: "CA"
          // Bias towards Canada
        },
        (results, status) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            property.Latitude = lat;
            property.Longitude = lng;
            property.lat = lat;
            property.lng = lng;
            property.IsGeocoded = true;
            this.cache.set(address, { lat, lng });
            console.log(
              "Frontend Geocoding: Successfully geocoded",
              property.ListingKey || property.listingKey,
              "Address:",
              address,
              "Coords:",
              lat,
              lng
            );
            if (onUpdate) {
              onUpdate(property);
            }
            resolve(property);
          } else {
            console.warn(
              "Frontend Geocoding: Failed to geocode",
              property.ListingKey || property.listingKey,
              "Address:",
              address,
              "Status:",
              status
            );
            resolve(property);
          }
        }
      );
    });
  }
  /**
   * Get property address for geocoding
   * Uses UnparsedAddress as primary source
   */
  getPropertyAddress(property) {
    if (property.UnparsedAddress) {
      return property.UnparsedAddress.trim();
    }
    if (property.address) {
      return property.address.trim();
    }
    const parts = [];
    if (property.StreetNumber && property.StreetName) {
      parts.push(property.StreetNumber + " " + property.StreetName);
    }
    if (property.City) {
      parts.push(property.City);
    }
    if (property.StateOrProvince) {
      parts.push(property.StateOrProvince);
    }
    if (property.PostalCode) {
      parts.push(property.PostalCode);
    }
    return parts.length > 0 ? parts.join(", ") : null;
  }
  /**
   * Clear geocoding cache
   */
  clearCache() {
    this.cache.clear();
  }
}
const frontendGeocoding = new FrontendGeocodingService();
const SimplePropertyMap = React.forwardRef(({
  properties = [],
  className = "",
  onPropertyClick = null,
  onPropertyHover = null,
  viewType = "full",
  onMapReady = null,
  activeTab = "listings"
  // Add activeTab prop to know if we're showing buildings or properties
}, ref) => {
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  console.log("🗺️ SimplePropertyMap activeTab:", activeTab, "Properties count:", properties.length);
  React.useImperativeHandle(ref, () => ({
    getMapInstance: () => mapInstanceRef.current,
    getMarkers: () => markersRef.current,
    centerOnProperties: () => {
      if (mapInstanceRef.current && properties.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        properties.forEach((p) => {
          if (p.Latitude && p.Longitude) {
            bounds.extend({ lat: parseFloat(p.Latitude), lng: parseFloat(p.Longitude) });
          }
        });
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }), [properties]);
  const getMapCenter = useCallback(() => {
    if (properties.length > 0) {
      const validProps = properties.filter((p) => p.Latitude && p.Longitude);
      if (validProps.length > 0) {
        const avgLat = validProps.reduce((sum, p) => sum + parseFloat(p.Latitude), 0) / validProps.length;
        const avgLng = validProps.reduce((sum, p) => sum + parseFloat(p.Longitude), 0) / validProps.length;
        return { lat: avgLat, lng: avgLng };
      }
    }
    return { lat: 43.6532, lng: -79.3832 };
  }, [properties]);
  const handleMapContainerReady = useCallback((mapDiv) => {
    console.log("Map container ready, checking Google Maps...", {
      hasGoogle: !!window.google,
      hasGoogleMaps: !!(window.google && window.google.maps),
      apiKey: !!window.googleMapsApiKey
    });
    if (!mapDiv) return;
    const initMap = () => {
      if (!mapDiv || mapInstanceRef.current) return;
      if (!window.google || !window.google.maps || !window.google.maps.Map) {
        console.error("Google Maps not properly loaded");
        setMapError("Google Maps failed to load properly");
        return;
      }
      try {
        const center = getMapCenter();
        console.log("Creating map with center:", center);
        const map = new window.google.maps.Map(mapDiv, {
          center,
          zoom: 11,
          mapTypeId: "roadmap",
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: viewType === "full",
          scrollwheel: true,
          // Enable scroll wheel zoom
          gestureHandling: "greedy"
          // Allow single finger/mouse drag and scroll
        });
        mapInstanceRef.current = map;
        mapDiv._mapInstance = map;
        map._hasUserInteracted = false;
        map._isInitializing = true;
        map.addListener("dragstart", () => {
          map._hasUserInteracted = true;
          console.log("User started dragging the map");
        });
        map.addListener("zoom_changed", () => {
          if (!map._isInitializing) {
            map._hasUserInteracted = true;
            console.log("User changed zoom level");
          }
        });
        map.addListener("click", () => {
          map._hasUserInteracted = true;
        });
        setTimeout(() => {
          map._isInitializing = false;
        }, 1e3);
        console.log("Map created successfully");
        setMapLoaded(true);
        if (onMapReady) {
          onMapReady(map);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Failed to initialize map: " + error.message);
      }
    };
    if (!window.google || !window.google.maps) {
      loadGoogleMapsScript(initMap);
    } else {
      initMap();
    }
  }, [getMapCenter, viewType]);
  const loadGoogleMapsScript = (callback) => {
    const apiKey = window.googleMapsApiKey;
    console.log("Loading Google Maps script, API key:", apiKey ? "Present" : "Missing");
    if (!apiKey || apiKey === "") {
      setMapError("Google Maps API key not configured. Please add your API key in the .env file.");
      console.error("Google Maps API key is missing. Add GOOGLE_MAPS_API_KEY to your .env file");
      return;
    }
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log("Google Maps script already in DOM, waiting for it to load...");
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          clearInterval(checkInterval);
          console.log("Google Maps now available");
          callback();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.google || !window.google.maps) {
          setMapError("Google Maps failed to load");
        }
      }, 5e3);
      return;
    }
    if (window._googleMapsLoading) {
      window._googleMapsCallbacks = window._googleMapsCallbacks || [];
      window._googleMapsCallbacks.push(callback);
      return;
    }
    if (window.google && window.google.maps && window.google.maps.Map) {
      callback();
      return;
    }
    window._googleMapsLoading = true;
    window._googleMapsCallbacks = [callback];
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    window.initGoogleMaps = () => {
      console.log("Google Maps loaded successfully");
      window._googleMapsLoading = false;
      const callbacks = window._googleMapsCallbacks || [];
      callbacks.forEach((cb) => cb());
      window._googleMapsCallbacks = [];
      delete window.initGoogleMaps;
    };
    script.onerror = () => {
      window._googleMapsLoading = false;
      setMapError("Failed to load Google Maps");
    };
    document.head.appendChild(script);
  };
  const formatPrice = (price) => {
    if (!price || price <= 0) return "?";
    return price.toLocaleString();
  };
  const getMarkerLabel = (property) => {
    console.log("🏷️ Getting marker label for activeTab:", activeTab, "Property name:", property.name || property.building_name || "NO NAME");
    if (activeTab === "buildings") {
      const buildingName = property.name || property.building_name || property.address || "Building";
      console.log("🏢 Building marker label:", buildingName);
      return buildingName;
    } else {
      return "$" + formatPrice(property.ListPrice);
    }
  };
  const getTruncatedLabel = (text) => {
    if (!text) return "?";
    const cleanText = text.toString().replace(/^\$/, "");
    if (cleanText.length <= 12) return text;
    return text.toString().substring(0, 9) + "...";
  };
  const addMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return;
    console.log("🗺️ Adding markers for", properties.length, "properties, activeTab:", activeTab);
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({
        maxWidth: 240,
        pixelOffset: new window.google.maps.Size(0, -30),
        disableAutoPan: false
      });
    }
    properties.forEach((property, index) => {
      console.log(`🏢 Processing property ${index}:`, {
        hasLatitude: !!property.Latitude,
        hasLongitude: !!property.Longitude,
        latitude: property.Latitude,
        longitude: property.Longitude,
        name: property.name,
        building_name: property.building_name,
        address: property.address
      });
      if (!property.Latitude || !property.Longitude) {
        console.warn(`⚠️ Skipping property ${index} - missing coordinates`);
        return;
      }
      const lat = parseFloat(property.Latitude);
      const lng = parseFloat(property.Longitude);
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`⚠️ Skipping property ${index} - invalid coordinates`);
        return;
      }
      const fullLabel = getMarkerLabel(property);
      const displayLabel = getTruncatedLabel(fullLabel);
      console.log(`📍 Creating marker ${index} at [${lat}, ${lng}] with label: "${displayLabel}"`);
      const isBuilding = activeTab === "buildings" || property.source === "building";
      const uid = property.ListingKey || property.id || index;
      const buildingPinUrl = (w, h) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${w}" height="${h}" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg">
          <defs><filter id="bs${uid}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/></filter></defs>
          <path d="M18 2C9.7 2 3 8.7 3 17c0 10.5 15 27 15 27s15-16.5 15-27C33 8.7 26.3 2 18 2z" fill="#293056" stroke="#ffffff" stroke-width="2" filter="url(#bs${uid})"/>
          <g fill="#ffffff"><rect x="10.5" y="10" width="7.5" height="15.5" rx="1"/><rect x="18" y="13" width="7.5" height="12.5" rx="1"/></g>
          <g fill="#293056"><rect x="12" y="12" width="1.5" height="1.5"/><rect x="15" y="12" width="1.5" height="1.5"/><rect x="12" y="15" width="1.5" height="1.5"/><rect x="15" y="15" width="1.5" height="1.5"/><rect x="12" y="18" width="1.5" height="1.5"/><rect x="15" y="18" width="1.5" height="1.5"/><rect x="19.5" y="15.5" width="1.4" height="1.4"/><rect x="22.2" y="15.5" width="1.4" height="1.4"/><rect x="19.5" y="18.5" width="1.4" height="1.4"/><rect x="22.2" y="18.5" width="1.4" height="1.4"/></g>
        </svg>
      `)}`;
      const icon = isBuilding ? {
        url: buildingPinUrl(32, 41),
        scaledSize: new window.google.maps.Size(32, 41),
        anchor: new window.google.maps.Point(16, 41)
      } : {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="80" height="45" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow${uid}" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
              </filter>
            </defs>
            <rect x="5" y="5" width="70" height="26" rx="4" fill="#007cba" stroke="white" stroke-width="2" filter="url(#shadow${uid})"/>
            <text x="40" y="21" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial, sans-serif">${displayLabel}</text>
            <polygon points="40,32 48,32 44,40 36,32" fill="#007cba" stroke="white" stroke-width="2"/>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(80, 45),
        anchor: new window.google.maps.Point(40, 40)
      };
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        icon,
        title: property.UnparsedAddress || property.address || `${activeTab === "buildings" ? "Building" : "Property"} ${index + 1}`,
        optimized: false,
        zIndex: 100
      });
      marker.addListener("mouseover", () => {
        const hoverIcon = isBuilding ? {
          url: buildingPinUrl(37, 47),
          scaledSize: new window.google.maps.Size(37, 47),
          anchor: new window.google.maps.Point(18.5, 47)
        } : {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="85" height="48" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="shadowHover${uid}" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.4"/>
                </filter>
              </defs>
              <rect x="5" y="5" width="75" height="28" rx="4" fill="#0056b3" stroke="white" stroke-width="2" filter="url(#shadowHover${uid})"/>
              <text x="42.5" y="22" text-anchor="middle" fill="white" font-size="13" font-weight="bold" font-family="Arial, sans-serif">${displayLabel}</text>
              <polygon points="42.5,34 50.5,34 46.5,42 38.5,34" fill="#0056b3" stroke="white" stroke-width="2"/>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(85, 48),
          anchor: new window.google.maps.Point(42.5, 42)
        };
        marker.setIcon(hoverIcon);
        if (onPropertyHover) {
          onPropertyHover(property, "enter");
        }
      });
      marker.addListener("mouseout", () => {
        marker.setIcon(icon);
        if (onPropertyHover) {
          onPropertyHover(null, "leave");
        }
      });
      marker.addListener("click", () => {
        console.log("Marker clicked for property:", property.ListingKey || property.id, property);
        if (property.source === "building" || activeTab === "buildings") {
          if (window.currentInfoWindowCleanup) {
            window.currentInfoWindowCleanup();
            window.currentInfoWindowCleanup = null;
          }
          const bUrl = createBuildingUrl(property.name || property.address, property.id);
          const bImg = property.main_image || Array.isArray(property.images) && property.images[0] || "";
          const bSale = property.units_for_sale ?? property.unitsForSale ?? 0;
          const bRent = property.units_for_rent ?? property.unitsForRent ?? 0;
          const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
          const html = `
            <a href="${esc(bUrl)}" style="display:block;width:240px;text-decoration:none;color:inherit;font-family:Arial,sans-serif;">
              ${bImg ? `<div style="width:100%;height:130px;background:#eef1f4;overflow:hidden;border-radius:8px 8px 0 0;"><img src="${esc(bImg)}" style="width:100%;height:130px;object-fit:cover;display:block;"/></div>` : ""}
              <div style="padding:10px 12px;">
                <div style="font-weight:700;font-size:14px;line-height:1.25;color:#293056;">${esc(property.name || property.address || "Building")}</div>
                ${property.address ? `<div style="font-size:12px;color:#6b7280;margin-top:2px;">${esc(property.address)}</div>` : ""}
                <div style="font-size:12px;font-weight:600;color:#2A8FA1;margin-top:6px;">${bSale} for sale &middot; ${bRent} for rent</div>
              </div>
            </a>`;
          infoWindowRef.current.setContent(html);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
          if (onPropertyClick) onPropertyClick(property);
          return;
        }
        try {
          if (window.currentInfoWindowCleanup) {
            window.currentInfoWindowCleanup();
            window.currentInfoWindowCleanup = null;
          }
          if (!property || !property.ListingKey && !property.id) {
            console.error("Invalid property data for info window");
            return;
          }
          const cleanup = renderPropertyCardInInfoWindow(property, infoWindowRef.current, mapInstanceRef.current);
          window.currentInfoWindowCleanup = cleanup;
          infoWindowRef.current.open(mapInstanceRef.current, marker);
          console.log("Info window opened successfully");
          window.google.maps.event.addListenerOnce(infoWindowRef.current, "closeclick", () => {
            if (window.currentInfoWindowCleanup) {
              window.currentInfoWindowCleanup();
              window.currentInfoWindowCleanup = null;
            }
          });
          if (onPropertyClick) {
            onPropertyClick(property);
          }
        } catch (error) {
          console.error("Error showing property card in info window:", error);
        }
      });
      markersRef.current.push(marker);
    });
    console.log(`📍 Created ${markersRef.current.length} markers on the map`);
    if (markersRef.current.length > 0 && !mapInstanceRef.current._hasUserInteracted) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach((marker) => {
        bounds.extend(marker.getPosition());
      });
      mapInstanceRef.current.fitBounds(bounds);
      const boundsListener = mapInstanceRef.current.addListener("bounds_changed", () => {
        window.google.maps.event.removeListener(boundsListener);
        const currentZoom = mapInstanceRef.current.getZoom();
        if (currentZoom > 15) {
          mapInstanceRef.current.setZoom(15);
        }
        if (markersRef.current.length === 1 && currentZoom > 13) {
          mapInstanceRef.current.setZoom(13);
        }
      });
    }
  }, [properties, onPropertyClick, activeTab]);
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      console.log("Updating markers for", properties.length, "properties");
      addMarkers();
      const handlePropertyUpdate = (property) => {
        console.log("Property geocoded, updating markers:", property.ListingKey);
        addMarkers();
      };
      if (frontendGeocoding && frontendGeocoding.geocodeVisibleProperties) {
        frontendGeocoding.geocodeVisibleProperties(properties, handlePropertyUpdate).catch((err) => {
          console.error("Geocoding error:", err);
        });
      }
    }
  }, [properties, mapLoaded, addMarkers]);
  if (mapError) {
    return /* @__PURE__ */ jsx("div", { className: `${className} bg-gray-100 rounded-lg border flex items-center justify-center`, children: /* @__PURE__ */ jsxs("div", { className: "text-center p-8", children: [
      /* @__PURE__ */ jsx("div", { className: "text-red-500 mb-2", children: /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: "Map Unavailable" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: mapError })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: `${className} relative rounded-lg overflow-hidden border bg-gray-50`, style: { minHeight: "400px" }, children: [
    /* @__PURE__ */ jsx(
      GoogleMapContainer,
      {
        onMapReady: handleMapContainerReady,
        className: "w-full h-full",
        style: { minHeight: "400px" }
      }
    ),
    !mapLoaded && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center p-8", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: "Loading Map" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Please wait while we load the property locations..." })
    ] }) })
  ] });
});
export {
  SimplePropertyMap as default
};
