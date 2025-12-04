import React, { useEffect, useRef, useState, useCallback } from 'react';
import GoogleMapContainer from './GoogleMapContainer';
import { debounce } from 'lodash';

/**
 * ClusteredPropertyMap - High-performance map component for displaying 500+ property markers
 * Uses MarkerClusterer for grouping nearby markers into clusters
 * Shows property markers with price labels, fetches coordinates from API based on viewport
 */
const ClusteredPropertyMap = ({
  searchFilters = {},
  className = '',
  onPropertyClick = null,
  onMarkerCountChange = null,
  initialCenter = { lat: 43.6532, lng: -79.3832 }, // Toronto default
  initialZoom = 11,
}) => {
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const markerClustererRef = useRef(null);
  const infoWindowRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [markerStats, setMarkerStats] = useState({ displayed: 0, total: 0 });
  const lastBoundsRef = useRef(null);
  const lastZoomRef = useRef(initialZoom);

  // Get CSRF token
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  // Format price for marker display
  const formatPrice = (price) => {
    if (!price || price <= 0) return '?';
    if (price >= 1000000) {
      return '$' + (price / 1000000).toFixed(1) + 'M';
    }
    return '$' + Math.round(price / 1000) + 'K';
  };

  // Fetch map coordinates from API
  const fetchMapCoordinates = useCallback(async (bounds, zoom) => {
    if (!bounds) return [];

    setIsLoading(true);
    try {
      const searchParams = {
        ...searchFilters,
        viewport_bounds: bounds,
        zoom_level: zoom,
        limit: 2000 // Request all properties in viewport (up to 2000)
      };

      const response = await fetch('/api/map-coordinates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
          'Accept': 'application/json'
        },
        body: JSON.stringify({ search_params: searchParams })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setMarkerStats({
          displayed: result.data.displayed,
          total: result.data.total
        });

        if (onMarkerCountChange) {
          onMarkerCountChange(result.data.displayed, result.data.total);
        }

        return result.data.coordinates || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching map coordinates:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [searchFilters, onMarkerCountChange]);

  // Create custom marker icon with price
  const createMarkerIcon = (price, isHovered = false) => {
    const priceText = formatPrice(price);
    const bgColor = isHovered ? '#0056b3' : '#007cba';
    const width = 70;
    const height = 36;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="${width-4}" height="${height-10}" rx="4" fill="${bgColor}" stroke="white" stroke-width="1.5"/>
          <text x="${width/2}" y="${height/2 - 2}" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="Arial, sans-serif">${priceText}</text>
          <polygon points="${width/2},${height-4} ${width/2+6},${height-10} ${width/2-6},${height-10}" fill="${bgColor}" stroke="white" stroke-width="1.5"/>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(width, height),
      anchor: new window.google.maps.Point(width/2, height)
    };
  };

  // Create cluster icon
  const createClusterIcon = (count) => {
    const size = count < 10 ? 40 : count < 100 ? 50 : 60;
    const bgColor = count < 10 ? '#007cba' : count < 100 ? '#0056b3' : '#003d82';

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${bgColor}" stroke="white" stroke-width="3"/>
          <text x="${size/2}" y="${size/2 + 5}" text-anchor="middle" fill="white" font-size="${count < 100 ? 14 : 12}" font-weight="bold" font-family="Arial, sans-serif">${count}</text>
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(size, size),
      anchor: new window.google.maps.Point(size/2, size/2)
    };
  };

  // Clear all markers and clusterer
  const clearMarkers = useCallback(() => {
    // Clear clusterer first
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
    }

    // Then clear individual markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
  }, []);

  // Update markers on the map with clustering
  const updateMarkers = useCallback(async (bounds, zoom) => {
    if (!mapInstanceRef.current || !window.google) return;

    // Round bounds to prevent micro-changes triggering fetches
    const roundedBounds = {
      north: Math.round(bounds.north * 1000) / 1000,
      south: Math.round(bounds.south * 1000) / 1000,
      east: Math.round(bounds.east * 1000) / 1000,
      west: Math.round(bounds.west * 1000) / 1000
    };

    const boundsKey = `${roundedBounds.north}_${roundedBounds.south}_${roundedBounds.east}_${roundedBounds.west}_${zoom}`;

    // Skip if bounds haven't changed significantly
    if (lastBoundsRef.current === boundsKey) {
      return;
    }
    lastBoundsRef.current = boundsKey;

    // Fetch coordinates from API
    const coordinates = await fetchMapCoordinates(roundedBounds, zoom);

    if (!coordinates || coordinates.length === 0) {
      clearMarkers();
      return;
    }

    // Clear existing markers
    clearMarkers();

    // Create info window if not exists
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({
        maxWidth: 280,
        pixelOffset: new window.google.maps.Size(0, -5)
      });
    }

    // Create new markers for each property
    const newMarkers = coordinates.map((coord) => {
      const marker = new window.google.maps.Marker({
        position: { lat: coord.lat, lng: coord.lng },
        icon: createMarkerIcon(coord.price),
        title: coord.address,
        optimized: true,
        zIndex: 100
      });

      // Store coordinate data on marker for later use
      marker._propertyData = coord;

      // Add hover effect
      marker.addListener('mouseover', () => {
        marker.setIcon(createMarkerIcon(coord.price, true));
        marker.setZIndex(200);
      });

      marker.addListener('mouseout', () => {
        marker.setIcon(createMarkerIcon(coord.price, false));
        marker.setZIndex(100);
      });

      // Add click listener to show info window
      marker.addListener('click', () => {
        const content = `
          <div style="padding: 10px; min-width: 220px; font-family: Arial, sans-serif;">
            <div style="font-weight: bold; font-size: 18px; color: #007cba; margin-bottom: 6px;">
              ${formatPrice(coord.price)}
            </div>
            <div style="font-size: 14px; color: #333; margin-bottom: 4px;">
              ${coord.address || 'Address not available'}
            </div>
            <div style="font-size: 13px; color: #666; margin-bottom: 8px;">
              ${coord.city || ''}
            </div>
            <div style="font-size: 13px; color: #666; margin-bottom: 10px;">
              ${coord.beds || '?'} bed${coord.beds !== 1 ? 's' : ''} | ${coord.baths || '?'} bath${coord.baths !== 1 ? 's' : ''}
              ${coord.type ? ` | ${coord.type}` : ''}
            </div>
            <a href="/property/${coord.mls_id}"
               style="display: inline-block; padding: 8px 16px; background: #007cba; color: white; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: 500;">
              View Details
            </a>
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);

        if (onPropertyClick) {
          onPropertyClick(coord);
        }
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // Initialize or update MarkerClusterer
    if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
      // Clear existing clusterer
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
      }

      // Create new clusterer with markers
      markerClustererRef.current = new window.markerClusterer.MarkerClusterer({
        map: mapInstanceRef.current,
        markers: newMarkers,
        algorithm: new window.markerClusterer.SuperClusterAlgorithm({
          maxZoom: 16,
          radius: 80
        }),
        renderer: {
          render: ({ count, position }) => {
            return new window.google.maps.Marker({
              position,
              icon: createClusterIcon(count),
              label: null,
              zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + count
            });
          }
        },
        onClusterClick: (event, cluster, map) => {
          // Zoom in when cluster is clicked
          const bounds = new window.google.maps.LatLngBounds();
          cluster.markers.forEach(marker => {
            bounds.extend(marker.getPosition());
          });
          map.fitBounds(bounds);
          map.setZoom(Math.min(map.getZoom() + 2, 18));
        }
      });
    } else {
      // Fallback: add markers directly to map without clustering
      newMarkers.forEach(marker => {
        marker.setMap(mapInstanceRef.current);
      });
    }

    console.log(`Map updated with ${newMarkers.length} property markers (clustered)`);
  }, [fetchMapCoordinates, clearMarkers, onPropertyClick]);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((bounds, zoom) => {
      updateMarkers(bounds, zoom);
    }, 500),
    [updateMarkers]
  );

  // Load MarkerClusterer library
  const loadMarkerClusterer = () => {
    return new Promise((resolve) => {
      if (window.markerClusterer) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
      script.async = true;
      script.onload = () => {
        console.log('MarkerClusterer library loaded');
        resolve();
      };
      script.onerror = () => {
        console.warn('Failed to load MarkerClusterer, falling back to individual markers');
        resolve();
      };
      document.head.appendChild(script);
    });
  };

  // Initialize map
  const handleMapContainerReady = useCallback((mapDiv) => {
    if (!mapDiv || mapInstanceRef.current) return;

    const initMap = async () => {
      if (!window.google || !window.google.maps) {
        setMapError('Google Maps not loaded');
        return;
      }

      try {
        // Load MarkerClusterer library
        await loadMarkerClusterer();

        const map = new window.google.maps.Map(mapDiv, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeId: 'roadmap',
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          scrollwheel: true,
          gestureHandling: 'greedy'
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Listen for map idle (user stopped moving/zooming)
        map.addListener('idle', () => {
          const bounds = map.getBounds();
          const zoom = map.getZoom();

          if (bounds) {
            const viewportBounds = {
              north: bounds.getNorthEast().lat(),
              south: bounds.getSouthWest().lat(),
              east: bounds.getNorthEast().lng(),
              west: bounds.getSouthWest().lng()
            };

            debouncedUpdate(viewportBounds, zoom);
          }
        });

        // Track zoom changes
        map.addListener('zoom_changed', () => {
          lastZoomRef.current = map.getZoom();
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      }
    };

    if (!window.google || !window.google.maps) {
      loadGoogleMapsScript(initMap);
    } else {
      initMap();
    }
  }, [initialCenter, initialZoom, debouncedUpdate]);

  // Load Google Maps script
  const loadGoogleMapsScript = (callback) => {
    const apiKey = window.googleMapsApiKey;

    if (!apiKey) {
      setMapError('Google Maps API key not configured');
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          callback();
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 5000);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initClusteredMap`;
    script.async = true;
    script.defer = true;

    window.initClusteredMap = () => {
      callback();
      delete window.initClusteredMap;
    };

    script.onerror = () => setMapError('Failed to load Google Maps');
    document.head.appendChild(script);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
      if (debouncedUpdate) {
        debouncedUpdate.cancel();
      }
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
        markerClustererRef.current = null;
      }
    };
  }, [clearMarkers, debouncedUpdate]);

  // Re-fetch when filters change
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      const bounds = mapInstanceRef.current.getBounds();
      const zoom = mapInstanceRef.current.getZoom();

      if (bounds) {
        const viewportBounds = {
          north: bounds.getNorthEast().lat(),
          south: bounds.getSouthWest().lat(),
          east: bounds.getNorthEast().lng(),
          west: bounds.getSouthWest().lng()
        };

        // Reset bounds key to force refresh
        lastBoundsRef.current = null;
        updateMarkers(viewportBounds, zoom);
      }
    }
  }, [searchFilters, mapLoaded, updateMarkers]);

  if (mapError) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg border flex items-center justify-center`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Map Unavailable</h3>
          <p className="text-sm text-gray-600">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden border bg-gray-50`} style={{ minHeight: '400px' }}>
      {/* Stats overlay */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg px-3 py-2">
        <div className="text-sm font-medium text-gray-700">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#007cba]"></div>
              Loading...
            </span>
          ) : (
            <>
              {markerStats.displayed} of {markerStats.total.toLocaleString()} properties
            </>
          )}
        </div>
      </div>

      {/* Zoom hint */}
      {markerStats.displayed > 0 && markerStats.displayed < markerStats.total && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 text-white rounded-full px-4 py-2 text-sm">
          Zoom in to see more properties
        </div>
      )}

      <GoogleMapContainer
        onMapReady={handleMapContainerReady}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading Map</h3>
            <p className="text-sm text-gray-600">Please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClusteredPropertyMap;
