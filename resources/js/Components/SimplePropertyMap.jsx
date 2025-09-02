import React, { useEffect, useRef, useState, useCallback } from 'react';
import GoogleMapContainer from './GoogleMapContainer';
import { renderPropertyCardInInfoWindow } from '@/Components/MapPropertyCard';
import frontendGeocoding from '@/services/frontendGeocoding';

const SimplePropertyMap = React.forwardRef(({ 
  properties = [], 
  className = '', 
  onPropertyClick = null,
  onPropertyHover = null,
  viewType = 'full',
  onMapReady = null
}, ref) => {
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  
  // Expose map instance through ref
  React.useImperativeHandle(ref, () => ({
    getMapInstance: () => mapInstanceRef.current,
    getMarkers: () => markersRef.current,
    centerOnProperties: () => {
      if (mapInstanceRef.current && properties.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        properties.forEach(p => {
          if (p.Latitude && p.Longitude) {
            bounds.extend({ lat: parseFloat(p.Latitude), lng: parseFloat(p.Longitude) });
          }
        });
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }), [properties]);

  // Clean map center calculation
  const getMapCenter = useCallback(() => {
    if (properties.length > 0) {
      const validProps = properties.filter(p => p.Latitude && p.Longitude);
      if (validProps.length > 0) {
        const avgLat = validProps.reduce((sum, p) => sum + parseFloat(p.Latitude), 0) / validProps.length;
        const avgLng = validProps.reduce((sum, p) => sum + parseFloat(p.Longitude), 0) / validProps.length;
        return { lat: avgLat, lng: avgLng };
      }
    }
    return { lat: 43.6532, lng: -79.3832 }; // Toronto default
  }, [properties]);

  // Initialize map when container is ready
  const handleMapContainerReady = useCallback((mapDiv) => {
    console.log('Map container ready, checking Google Maps...', {
      hasGoogle: !!window.google,
      hasGoogleMaps: !!(window.google && window.google.maps),
      apiKey: !!window.googleMapsApiKey
    });
    
    if (!mapDiv) return;
    
    // Store the div reference for later use
    const initMap = () => {
      if (!mapDiv || mapInstanceRef.current) return;
      
      // Double check that Google Maps is loaded
      if (!window.google || !window.google.maps || !window.google.maps.Map) {
        console.error('Google Maps not properly loaded');
        setMapError('Google Maps failed to load properly');
        return;
      }

      try {
        const center = getMapCenter();
        
        console.log('Creating map with center:', center);
        
        const map = new window.google.maps.Map(mapDiv, {
          center: center,
          zoom: 11,
          mapTypeId: 'roadmap',
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: viewType === 'full',
          scrollwheel: true, // Enable scroll wheel zoom
          gestureHandling: 'greedy' // Allow single finger/mouse drag and scroll
        });

        mapInstanceRef.current = map;
        mapDiv._mapInstance = map;
        
        console.log('Map created successfully');
        setMapLoaded(true);
        
        // Call onMapReady callback if provided
        if (onMapReady) {
          onMapReady(map);
        }
        
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map: ' + error.message);
      }
    };
    
    if (!window.google || !window.google.maps) {
      loadGoogleMapsScript(initMap);
    } else {
      initMap();
    }
  }, [getMapCenter, viewType]);

  // Load Google Maps script if needed
  const loadGoogleMapsScript = (callback) => {
    const apiKey = window.googleMapsApiKey;
    
    console.log('Loading Google Maps script, API key:', apiKey ? 'Present' : 'Missing');
    
    if (!apiKey || apiKey === '') {
      setMapError('Google Maps API key not configured. Please add your API key in the .env file.');
      console.error('Google Maps API key is missing. Add GOOGLE_MAPS_API_KEY to your .env file');
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('Google Maps script already in DOM, waiting for it to load...');
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          clearInterval(checkInterval);
          console.log('Google Maps now available');
          callback();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.google || !window.google.maps) {
          setMapError('Google Maps failed to load');
        }
      }, 5000);
      return;
    }

    // Check if already loading
    if (window._googleMapsLoading) {
      window._googleMapsCallbacks = window._googleMapsCallbacks || [];
      window._googleMapsCallbacks.push(callback);
      return;
    }

    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.Map) {
      callback();
      return;
    }

    window._googleMapsLoading = true;
    window._googleMapsCallbacks = [callback];

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Create a global callback function for Google Maps to call
    window.initGoogleMaps = () => {
      console.log('Google Maps loaded successfully');
      window._googleMapsLoading = false;
      const callbacks = window._googleMapsCallbacks || [];
      callbacks.forEach(cb => cb());
      window._googleMapsCallbacks = [];
      delete window.initGoogleMaps; // Clean up
    };
    
    script.onerror = () => {
      window._googleMapsLoading = false;
      setMapError('Failed to load Google Maps');
    };

    document.head.appendChild(script);
  };


  // Format price for marker display
  const formatPrice = (price) => {
    if (!price || price <= 0) return '?';
    if (price >= 1000000) return Math.round(price / 1000000) + 'M';
    if (price >= 1000) return Math.round(price / 1000) + 'K';
    return Math.round(price / 1000) + 'K';
  };

  // Add markers to the map
  const addMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // Create info window once (reused for all markers) - smaller size
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({
        maxWidth: 240,
        pixelOffset: new window.google.maps.Size(0, -30),
        disableAutoPan: false
      });
    }

    // Add new markers with custom price labels
    properties.forEach((property, index) => {
      if (!property.Latitude || !property.Longitude) return;

      const lat = parseFloat(property.Latitude);
      const lng = parseFloat(property.Longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;

      const priceText = formatPrice(property.ListPrice);
      
      // Create custom marker icon with blue background and price
      const icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg width="80" height="45" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow${property.ListingKey || index}" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
              </filter>
            </defs>
            <rect x="5" y="5" width="70" height="26" rx="4" fill="#007cba" stroke="white" stroke-width="2" filter="url(#shadow${property.ListingKey || index})"/>
            <text x="40" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="Arial, sans-serif">$${priceText}</text>
            <polygon points="40,32 48,32 44,40 36,32" fill="#007cba" stroke="white" stroke-width="2"/>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(80, 45),
        anchor: new window.google.maps.Point(40, 40)
      };

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        icon: icon,
        title: property.UnparsedAddress || property.address || `Property ${index + 1}`,
        optimized: false,
        zIndex: 100
      });

      // Add hover effect and sync with property list
      marker.addListener('mouseover', () => {
        const hoverIcon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="85" height="48" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="shadowHover${property.ListingKey || index}" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.4"/>
                </filter>
              </defs>
              <rect x="5" y="5" width="75" height="28" rx="4" fill="#0056b3" stroke="white" stroke-width="2" filter="url(#shadowHover${property.ListingKey || index})"/>
              <text x="42.5" y="22" text-anchor="middle" fill="white" font-size="15" font-weight="bold" font-family="Arial, sans-serif">$${priceText}</text>
              <polygon points="42.5,34 50.5,34 46.5,42 38.5,34" fill="#0056b3" stroke="white" stroke-width="2"/>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(85, 48),
          anchor: new window.google.maps.Point(42.5, 42)
        };
        marker.setIcon(hoverIcon);
        
        // Notify parent about hover
        if (onPropertyHover) {
          onPropertyHover(property, 'enter');
        }
      });

      marker.addListener('mouseout', () => {
        marker.setIcon(icon);
        
        // Notify parent about hover end
        if (onPropertyHover) {
          onPropertyHover(null, 'leave');
        }
      });

      // Add click listener to show PropertyCardV5 in info window
      marker.addListener('click', () => {
        console.log('Marker clicked for property:', property.ListingKey, property);
        
        try {
          // Close any existing info window cleanup
          if (window.currentInfoWindowCleanup) {
            window.currentInfoWindowCleanup();
            window.currentInfoWindowCleanup = null;
          }

          // Check if we have the required data
          if (!property || !property.ListingKey) {
            console.error('Invalid property data for info window');
            return;
          }

          // Pass the property with its image to the info window
          // The property should already have imageUrl from the formatPropertyForCard function
          const cleanup = renderPropertyCardInInfoWindow(property, infoWindowRef.current, mapInstanceRef.current);
          window.currentInfoWindowCleanup = cleanup;
          
          // Open the info window at the marker position
          infoWindowRef.current.open(mapInstanceRef.current, marker);
          
          console.log('Info window opened successfully');

          // Add close event listener for cleanup
          window.google.maps.event.addListenerOnce(infoWindowRef.current, 'closeclick', () => {
            if (window.currentInfoWindowCleanup) {
              window.currentInfoWindowCleanup();
              window.currentInfoWindowCleanup = null;
            }
          });

          // Optional: notify parent component about click without navigating
          if (onPropertyClick) {
            onPropertyClick(property);
          }
        } catch (error) {
          console.error('Error showing property card in info window:', error);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [properties, onPropertyClick]);

  // Update markers when properties change
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      console.log('Updating markers for', properties.length, 'properties');
      
      // Add markers immediately for properties that have coordinates
      addMarkers();
      
      // Then geocode properties that need it
      const handlePropertyUpdate = (property) => {
        console.log('Property geocoded, updating markers:', property.ListingKey);
        // Re-add markers when a property is geocoded
        addMarkers();
      };
      
      // Only geocode if geocoding service is available
      if (frontendGeocoding && frontendGeocoding.geocodeVisibleProperties) {
        frontendGeocoding.geocodeVisibleProperties(properties, handlePropertyUpdate).catch(err => {
          console.error('Geocoding error:', err);
          // Still show markers for properties that already have coordinates
        });
      }
    }
  }, [properties, mapLoaded, addMarkers]);

  // Error state
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

  // Render the map container always, show loading overlay if not loaded
  return (
    <div className={`${className} relative rounded-lg overflow-hidden border bg-gray-50`} style={{ minHeight: '400px' }}>
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
            <p className="text-sm text-gray-600">Please wait while we load the property locations...</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default SimplePropertyMap;