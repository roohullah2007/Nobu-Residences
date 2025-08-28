import React, { useEffect, useRef, useState, useCallback } from 'react';
import GoogleMapContainer from './GoogleMapContainer';

const SimplePropertyMap = ({ 
  properties = [], 
  className = '', 
  onPropertyClick = null,
  viewType = 'full'
}) => {
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

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
          fullscreenControl: viewType === 'full'
        });

        mapInstanceRef.current = map;
        mapDiv._mapInstance = map;
        
        console.log('Map created successfully');
        setMapLoaded(true);
        
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
    
    if (!apiKey) {
      setMapError('Google Maps API key not configured');
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


  // Add markers to the map
  const addMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // Add new markers
    properties.forEach((property, index) => {
      if (!property.Latitude || !property.Longitude) return;

      const lat = parseFloat(property.Latitude);
      const lng = parseFloat(property.Longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: property.UnparsedAddress || property.address || `Property ${index + 1}`
      });

      // Add click listener
      if (onPropertyClick) {
        marker.addListener('click', () => {
          onPropertyClick(property);
        });
      }

      // Simple info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
              ${property.UnparsedAddress || property.address || 'Property'}
            </h3>
            ${property.ListPrice ? `<p style="margin: 0; color: #2563eb; font-weight: 600;">$${parseInt(property.ListPrice).toLocaleString()}</p>` : ''}
            ${property.BedroomsTotal ? `<p style="margin: 4px 0 0 0; font-size: 12px;">${property.BedroomsTotal} bed${property.BedroomsTotal > 1 ? 's' : ''}</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
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
      addMarkers();
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
};

export default SimplePropertyMap;