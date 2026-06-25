import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useState, useCallback, useEffect } from "react";
import SimplePropertyMap from "./SimplePropertyMap-CcNI_Icw.js";
import { debounce } from "lodash";
import "./GoogleMapContainer-1QRikaEJ.js";
import "./MapPropertyCard-JetgmWMH.js";
import "react-dom/client";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "@inertiajs/react";
import "./slug-BdTdDGUL.js";
const ViewportAwarePropertyMap = ({
  properties = [],
  className = "",
  onPropertyClick = null,
  onPropertyHover = null,
  viewType = "full",
  onViewportChange = null,
  // Callback to fetch new properties
  isLoading = false,
  searchFilters = {},
  activeTab = "listings"
  // Add activeTab prop to pass through to SimplePropertyMap
}) => {
  console.log("🗺️ ViewportAwarePropertyMap activeTab:", activeTab, "Properties count:", properties.length);
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [viewportProperties, setViewportProperties] = useState([]);
  const [combinedProperties, setCombinedProperties] = useState(properties);
  const [isFetchingViewport, setIsFetchingViewport] = useState(false);
  useRef(null);
  useRef(true);
  useRef(null);
  const fetchTimeoutRef = useRef(null);
  const fetchPropertiesForBounds = useCallback(async (bounds) => {
    console.log("fetchPropertiesForBounds called but DISABLED - only showing left side properties");
    return;
  }, [searchFilters, onViewportChange]);
  const debouncedFetch = useCallback(
    debounce((bounds) => {
      console.log("Debounced fetch triggered with bounds:", bounds);
      fetchPropertiesForBounds(bounds);
    }, 1500),
    // Wait 1.5 seconds after user stops moving the map to avoid too many requests
    [fetchPropertiesForBounds]
  );
  const handleMapReady = useCallback((map) => {
    if (!map) return;
    console.log("Map instance ready - viewport loading DISABLED");
    setMapInstance(map);
    return;
  }, [debouncedFetch]);
  useEffect(() => {
    console.log("Properties update - Using left side properties only:", properties.length);
    setCombinedProperties(properties);
  }, [properties]);
  const handleSimpleMapRef = useCallback((ref) => {
    mapRef.current = ref;
  }, []);
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (debouncedFetch) {
        debouncedFetch.cancel();
      }
    };
  }, [debouncedFetch]);
  return /* @__PURE__ */ jsxs("div", { className: `relative ${className}`, children: [
    isFetchingViewport && viewportProperties.length === 0 && /* @__PURE__ */ jsxs("div", { className: "absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-[#912018]" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-700", children: "Loading properties..." })
    ] }),
    combinedProperties.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg px-3 py-1", children: /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-gray-700", children: [
      combinedProperties.length,
      " properties in view"
    ] }) }),
    /* @__PURE__ */ jsx(
      SimplePropertyMap,
      {
        ref: handleSimpleMapRef,
        properties: combinedProperties,
        className,
        onPropertyClick,
        onPropertyHover,
        viewType,
        onMapReady: handleMapReady,
        activeTab
      }
    )
  ] });
};
export {
  ViewportAwarePropertyMap as default
};
