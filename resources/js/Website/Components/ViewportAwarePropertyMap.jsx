import React, { useEffect, useRef, useState, useCallback } from 'react';
import SimplePropertyMap from './SimplePropertyMap';
import { debounce } from 'lodash';

const ViewportAwarePropertyMap = ({
  properties = [],
  className = '',
  onPropertyClick = null,
  onPropertyHover = null,
  viewType = 'full',
  onViewportChange = null, // Callback to fetch new properties
  isLoading = false,
  searchFilters = {},
  activeTab = 'listings' // Add activeTab prop to pass through to SimplePropertyMap
}) => {
  console.log('🗺️ ViewportAwarePropertyMap activeTab:', activeTab, 'Properties count:', properties.length); // Debug log
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [viewportProperties, setViewportProperties] = useState([]);
  const [combinedProperties, setCombinedProperties] = useState(properties);
  const [isFetchingViewport, setIsFetchingViewport] = useState(false);
  const lastBoundsRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const previousBoundsRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // Get CSRF token
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  // Check if bounds have changed significantly
  const hasSignificantBoundsChange = (oldBounds, newBounds) => {
    if (!oldBounds || !newBounds) return true;

    // Calculate the percentage change in bounds
    const latChange = Math.abs(newBounds.north - oldBounds.north) + Math.abs(newBounds.south - oldBounds.south);
    const lngChange = Math.abs(newBounds.east - oldBounds.east) + Math.abs(newBounds.west - oldBounds.west);

    // Get viewport dimensions
    const latSpan = Math.abs(newBounds.north - newBounds.south);
    const lngSpan = Math.abs(newBounds.east - newBounds.west);

    // Calculate percentage change
    const latChangePercent = (latChange / latSpan) * 100;
    const lngChangePercent = (lngChange / lngSpan) * 100;

    // Only fetch if map moved more than 30% of viewport
    const threshold = 30;
    return latChangePercent > threshold || lngChangePercent > threshold;
  };

  // Fetch properties for current viewport - DISABLED to prevent map refresh
  const fetchPropertiesForBounds = useCallback(async (bounds) => {
    // DISABLED - Don't fetch new properties when map moves
    console.log('fetchPropertiesForBounds called but DISABLED - only showing left side properties');
    return;

    if (!bounds) {
      console.log('No bounds provided, skipping fetch');
      return;
    }

    // Round to 4 decimal places to avoid micro-changes
    const roundedBounds = {
      north: Math.round(bounds.north * 10000) / 10000,
      south: Math.round(bounds.south * 10000) / 10000,
      east: Math.round(bounds.east * 10000) / 10000,
      west: Math.round(bounds.west * 10000) / 10000
    };

    // Check if bounds haven't changed at all
    const boundsKey = `${roundedBounds.north}_${roundedBounds.south}_${roundedBounds.east}_${roundedBounds.west}`;
    if (lastBoundsRef.current === boundsKey) {
      console.log('Bounds unchanged (exact match), skipping fetch');
      setIsFetchingViewport(false); // Make sure to hide loading indicator
      return;
    }

    // Check if change is significant enough to warrant a new fetch
    if (previousBoundsRef.current && !hasSignificantBoundsChange(previousBoundsRef.current, roundedBounds)) {
      console.log('Bounds change not significant, skipping fetch');
      setIsFetchingViewport(false);
      return;
    }

    lastBoundsRef.current = boundsKey;
    previousBoundsRef.current = roundedBounds;

    console.log('Starting viewport fetch...');
    setIsFetchingViewport(true);
    
    try {
      // Prepare search params with viewport bounds (use rounded values)
      const searchParams = {
        ...searchFilters,
        viewport_bounds: roundedBounds,
        page: 1,
        page_size: 20, // Load 20 properties for better coverage
        map_search: true // Flag to indicate this is a map-based search
      };

      console.log('Fetching properties for viewport:', bounds);
      console.log('Search params:', searchParams);

      const response = await fetch('/api/property-search-viewport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
          'Accept': 'application/json'
        },
        body: JSON.stringify({ search_params: searchParams })
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API Result:', result);
      
      if (result.success) {
        console.log(`Fetched ${result.data.properties.length} properties for viewport`);
        
        const newProperties = result.data.properties || [];
        setViewportProperties(newProperties);
        
        // If callback provided, let parent handle the properties
        if (onViewportChange) {
          onViewportChange(newProperties, bounds);
        }
      } else {
        console.error('Viewport search failed:', result.message);
        setViewportProperties([]);
      }
    } catch (error) {
      console.error('Error fetching viewport properties:', error);
      console.error('Error details:', error.message);
      setViewportProperties([]);
    } finally {
      console.log('Fetch completed, setting isFetchingViewport to false');
      setIsFetchingViewport(false);
    }
  }, [searchFilters, onViewportChange]);

  // Create stable debounced function with longer delay for better UX
  const debouncedFetch = useCallback(
    debounce((bounds) => {
      console.log('Debounced fetch triggered with bounds:', bounds);
      fetchPropertiesForBounds(bounds);
    }, 1500), // Wait 1.5 seconds after user stops moving the map to avoid too many requests
    [fetchPropertiesForBounds]
  );

  // Handle map ready event
  const handleMapReady = useCallback((map) => {
    if (!map) return;

    console.log('Map instance ready - viewport loading DISABLED');
    setMapInstance(map);

    // DISABLED - Don't listen for viewport changes to prevent loading more properties
    return;

    // Store initial zoom level
    let previousZoom = map.getZoom();
    let hasMoved = false;

    // Listen for drag start to track user interaction
    const dragStartListener = map.addListener('dragstart', () => {
      hasMoved = true;
      console.log('User started dragging map');
    });

    // Listen for zoom changes
    const zoomListener = map.addListener('zoom_changed', () => {
      const currentZoom = map.getZoom();
      console.log('Map zoom changed from', previousZoom, 'to', currentZoom);

      // Only mark as moved if zoom changed significantly or user zoomed out
      if (Math.abs(currentZoom - previousZoom) >= 1 || currentZoom < previousZoom) {
        hasMoved = true;
      }
      previousZoom = currentZoom;
    });

    // Listen for map idle event (user stopped moving/zooming)
    const idleListener = map.addListener('idle', () => {
      const bounds = map.getBounds();
      if (!bounds) return;

      const viewportBounds = {
        north: bounds.getNorthEast().lat(),
        south: bounds.getSouthWest().lat(),
        east: bounds.getNorthEast().lng(),
        west: bounds.getSouthWest().lng()
      };

      // Skip the initial load to avoid duplicate fetch
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        console.log('Initial map load - fetching properties');
        // Trigger the first fetch
        debouncedFetch(viewportBounds);
        return;
      }

      // Only fetch if user actually moved/zoomed the map
      if (hasMoved) {
        console.log('Map viewport changed after user interaction:', viewportBounds);
        debouncedFetch(viewportBounds);
        hasMoved = false; // Reset the flag
      } else {
        console.log('Map idle but no user interaction, skipping fetch');
      }
    });

    // Clean up listeners on unmount
    return () => {
      if (idleListener) idleListener.remove();
      if (zoomListener) zoomListener.remove();
      if (dragStartListener) dragStartListener.remove();
    };
  }, [debouncedFetch]);

  // Only use properties from the left side list - don't replace with viewport properties
  useEffect(() => {
    console.log('Properties update - Using left side properties only:', properties.length);

    // ALWAYS use the properties passed from parent (left side list)
    // Never replace with viewport properties to prevent refresh and disappearing listings
    setCombinedProperties(properties);
  }, [properties]);

  // Get the SimplePropertyMap ref to access its map instance
  const handleSimpleMapRef = useCallback((ref) => {
    mapRef.current = ref;
    // Don't try to get map instance here - wait for onMapReady callback
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      // Cancel any pending debounced calls
      if (debouncedFetch) {
        debouncedFetch.cancel();
      }
    };
  }, [debouncedFetch]);

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay - only show during initial load or significant moves */}
      {isFetchingViewport && viewportProperties.length === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#912018]"></div>
          <span className="text-sm font-medium text-gray-700">Loading properties...</span>
        </div>
      )}

      {/* Property count indicator */}
      {combinedProperties.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg px-3 py-1">
          <span className="text-sm font-medium text-gray-700">
            {combinedProperties.length} properties in view
          </span>
        </div>
      )}

      {/* Pass through to SimplePropertyMap */}
      <SimplePropertyMap
        ref={handleSimpleMapRef}
        properties={combinedProperties}
        className={className}
        onPropertyClick={onPropertyClick}
        onPropertyHover={onPropertyHover}
        viewType={viewType}
        onMapReady={handleMapReady}
        activeTab={activeTab}
      />
    </div>
  );
};

export default ViewportAwarePropertyMap;