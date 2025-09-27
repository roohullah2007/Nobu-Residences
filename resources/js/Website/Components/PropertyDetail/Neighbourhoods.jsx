import React from 'react';

// Map marker component for property locations
const MapMarker = ({ x, y, isMainProperty = false }) => (
  <div 
    className="absolute"
    style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
  >
    {isMainProperty ? (
      // Main property marker (red location pin)
      <div className="relative">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path 
            d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.58172 7.02944 2 12 2C16.9706 2 21 5.58172 21 10Z" 
            fill="#F34545" 
            stroke="#FFFFFF" 
            strokeWidth="2"
          />
          <circle cx="12" cy="10" r="3" fill="#FFFFFF" />
        </svg>
      </div>
    ) : (
      // Other property markers (black dots)
      <div 
        className="w-[10px] h-[10px] bg-black rounded-full"
        style={{ borderRadius: '40px' }}
      />
    )}
  </div>
);

const Neighbourhoods = ({ propertyData }) => {
  // Property markers positioned according to your CSS specifications
  const propertyMarkers = [
    { x: 327, y: 91 },
    { x: 401, y: 91 },
    { x: 379, y: 129 },
    { x: 307, y: 125 },
    { x: 283, y: 66 },
    { x: 348, y: 66 },
    { x: 343, y: 129 },
    { x: 293, y: 109 },
    { x: 401, y: 56 },
    { x: 369, y: 86 },
  ];

  // Main property location (the red pin)
  const mainPropertyLocation = { x: 340, y: 85 };

  return (
    <div className="w-full max-w-[1280px]">
      {/* Map Section Only */}
      <div className="w-full h-[250px] relative">
        <img 
          src="/assets/map.jpg" 
          alt="Neighborhood Map" 
          className="w-full h-full object-cover rounded-[10px]"
        />
        <div className="absolute inset-0 rounded-[10px] overflow-hidden">
          {/* Property markers */}
          {propertyMarkers.map((marker, index) => (
            <MapMarker key={index} x={marker.x} y={marker.y} />
          ))}
          
          {/* Main property marker (red pin) */}
          <MapMarker 
            x={mainPropertyLocation.x} 
            y={mainPropertyLocation.y} 
            isMainProperty={true} 
          />
        </div>
      </div>
    </div>
  );
};

export default Neighbourhoods;