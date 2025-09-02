import React, { useEffect, useRef, useState, useCallback } from 'react';
import SimplePropertyMap from './SimplePropertyMap';
import debounce from 'lodash/debounce';

const ViewportAwarePropertyMap = ({ 
  properties = [], 
  className = '', 
  onPropertyClick = null,
  onPropertyHover = null,
  viewType = 'full',
  onViewportChange = null, // Callback to fetch new properties
  isLoading = false,
  searchFilters = {}
}) => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [viewportProperties, setViewportProperties] = useState(properties);
  const [isFetchingViewport, setIsFetchingViewport] = useState(false);
  const lastBoundsRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Get CSRF token
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  // Fetch properties for current viewport
  const fetchPropertiesForBounds = useCallback(async (bounds) => {
    if (!bounds || isFetchingViewport) return;
    
    // Check if bounds have changed significantly (avoid duplicate calls)
    const boundsKey = `${bounds.north}_${bounds.south}_${bounds.east}_${bounds.west}`;
    if (lastBoundsRef.current === boundsKey) return;
    lastBoundsRef.current = boundsKey;

    setIsFetchingViewport(true);
    
    try {
      // Prepare search params with viewport bounds
      const searchParams = {
        ...searchFilters,
        viewport_bounds: {
          north: bounds.north,
          south: bounds.south,
          east: bounds.east,
          west: bounds.west
        },
        page: 1,
        page_size: 100, // Fetch more properties for map view
        map_search: true // Flag to indicate this is a map-based search
      };

      console.log('Fetching properties for viewport:', bounds);

      const response = await fetch('/api/property-search-viewport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify({ search_params: searchParams })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`Fetched ${result.data.properties.length} properties for viewport`);
        
        // If callback provided, let parent handle the properties
        if (onViewportChange) {
          onViewportChange(result.data.properties, bounds);
        } else {
          // Otherwise update local state
          setViewportProperties(result.data.properties || []);
        }
      } else {
        console.error('Viewport search failed:', result.message);
      }
    } catch (error) {
      console.error('Error fetching viewport properties:', error);
    } finally {
      setIsFetchingViewport(false);
    }
  }, [searchFilters, onViewportChange, isFetchingViewport]);

  // Debounced version of fetchPropertiesForBounds
  const debouncedFetchProperties = useCallback(
    debounce((bounds) => {
      fetchPropertiesForBounds(bounds);
    }, 800), // Wait 800ms after user stops moving the map
    [fetchPropertiesForBounds]
  );

  // Handle map ready event
  const handleMapReady = useCallback((map) => {
    if (!map) return;
    
    console.log('Map instance ready, setting up viewport listeners');
    setMapInstance(map);

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
        return;
      }

      console.log('Map viewport changed:', viewportBounds);
      debouncedFetchProperties(viewportBounds);
    });

    // Listen for zoom changes
    const zoomListener = map.addListener('zoom_changed', () => {
      const zoom = map.getZoom();
      console.log('Map zoom changed:', zoom);
      
      // Show loading indicator
      setIsFetchingViewport(true);
      
      // The idle event will handle the actual fetch
    });

    // Clean up listeners on unmount
    return () => {
      if (idleListener) idleListener.remove();
      if (zoomListener) zoomListener.remove();
    };
  }, [debouncedFetchProperties]);

  // Update viewport properties when properties prop changes
  useEffect(() => {
    if (!onViewportChange) {
      setViewportProperties(properties);
    }
  }, [properties, onViewportChange]);

  // Get the SimplePropertyMap ref to access its map instance
  const handleSimpleMapRef = useCallback((ref) => {
    mapRef.current = ref;
    
    // Try to get map instance from ref
    if (ref && ref.getMapInstance) {
      const map = ref.getMapInstance();
      if (map) {
        handleMapReady(map);
      }
    }
  }, [handleMapReady]);

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay for viewport fetching */}
      {isFetchingViewport && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#912018]"></div>
          <span className="text-sm font-medium text-gray-700">Loading area properties...</span>
        </div>
      )}

      {/* Property count indicator */}
      {viewportProperties.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg px-3 py-1">
          <span className="text-sm font-medium text-gray-700">
            {viewportProperties.length} properties in view
          </span>
        </div>
      )}

      {/* Pass through to SimplePropertyMap */}
      <SimplePropertyMap
        ref={handleSimpleMapRef}
        properties={viewportProperties}
        className={className}
        onPropertyClick={onPropertyClick}
        onPropertyHover={onPropertyHover}
        viewType={viewType}
        onMapReady={handleMapReady}
      />
    </div>
  );
};

export default ViewportAwarePropertyMap;