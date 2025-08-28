import React, { useEffect, useRef, useState } from 'react';

// This component creates a portal-like container for Google Maps
// to prevent React-Google Maps DOM conflicts
const GoogleMapContainer = ({ onMapReady, className = '', style = {} }) => {
  const containerRef = useRef(null);
  const mapDivRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a div that React won't manage
    const mapDiv = document.createElement('div');
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapDiv.className = 'google-map-container';
    
    // Append it outside of React's control
    containerRef.current.appendChild(mapDiv);
    mapDivRef.current = mapDiv;
    
    setIsReady(true);
    
    // Notify parent that map container is ready
    if (onMapReady) {
      onMapReady(mapDiv);
    }

    // Cleanup
    return () => {
      if (mapDivRef.current && mapDivRef.current.parentNode) {
        // Clear Google Maps first
        if (window.google && window.google.maps) {
          const mapInstance = mapDivRef.current._mapInstance;
          if (mapInstance) {
            // Clear all listeners
            if (window.google.maps.event) {
              window.google.maps.event.clearInstanceListeners(mapInstance);
            }
          }
        }
        
        // Remove the div after a small delay to avoid conflicts
        setTimeout(() => {
          if (mapDivRef.current && mapDivRef.current.parentNode) {
            mapDivRef.current.parentNode.removeChild(mapDivRef.current);
          }
        }, 0);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={style}
    />
  );
};

export default GoogleMapContainer;