import React, { useState } from 'react';

const PropertyRooms = ({ property }) => {
  const [isMetric, setIsMetric] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Get rooms from property data (passed from Repliers API via backend)
  const rawRooms = property?.Rooms || property?.rooms || [];

  if (!rawRooms || rawRooms.length === 0) {
    return null;
  }

  // Format rooms with meter/feet conversion
  const rooms = rawRooms.map((room, index) => {
    const length = parseFloat(room.length) || 0;
    const width = parseFloat(room.width) || 0;
    const hasDimensions = length > 0 && width > 0;

    // Convert meters to feet (1m = 3.28084ft)
    const lengthFt = (length * 3.28084).toFixed(1);
    const widthFt = (width * 3.28084).toFixed(1);

    return {
      name: room.name || room.type || room.description || '',
      meters: hasDimensions ? `${length} x ${width} m` : (room.dimensions || ''),
      feet: hasDimensions ? `${lengthFt} x ${widthFt} ft` : (room.dimensions || ''),
      features: room.features || '',
      isAlternate: index % 2 === 0,
    };
  });

  const visibleRooms = showAll ? rooms : rooms.slice(0, 3);
  const hasMore = rooms.length > 3;

  return (
    <div>
      <h2 className="text-base font-semibold mb-4" style={{ color: '#293056' }}>Room Dimensions</h2>
      <p className="text-gray-600 text-sm mb-4">Explore the dimensions of each room and the overall layout of the unit.</p>

      {/* Mobile Toggle */}
      <div className="md:hidden mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Unit:</span>
          <ToggleSwitch id="unit-toggle-mobile" isMetric={isMetric} onToggle={() => setIsMetric(!isMetric)} />
        </div>
      </div>

      {/* Header Row */}
      <div className="mb-2">
        <div className="grid grid-cols-12 text-sm gap-2 w-full">
          <div className="col-span-3 font-medium">Rooms</div>
          <div className="col-span-3 font-medium">Dimensions</div>
          <div className="col-span-2"></div>
          <div className="col-span-4 font-medium">Features</div>
        </div>
      </div>

      {/* Room Rows */}
      <div id="rooms-container">
        {visibleRooms.map((room, index) => (
          <div key={index} className={`mb-1 ${room.isAlternate ? 'bg-blue-50' : 'bg-white'}`}>
            <div className="grid grid-cols-12 py-2 text-sm items-center px-3">
              <div className="col-span-3 text-[#263238]">{room.name}</div>
              <div className="col-span-3">{isMetric ? room.meters : room.feet}</div>
              <div className="col-span-2"></div>
              <div className="col-span-4 text-[#263238]">{room.features}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more/less + Toggle */}
      <div className="mt-4 flex justify-between items-center">
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 text-sm hover:underline focus:outline-none"
          >
            {showAll ? 'Show less' : `Show all ${rooms.length} rooms`}
          </button>
        )}
        <ToggleSwitch id="unit-toggle-bottom" isMetric={isMetric} onToggle={() => setIsMetric(!isMetric)} />
      </div>
    </div>
  );
};

const ToggleSwitch = ({ id, isMetric, onToggle }) => (
  <div className="relative inline-block align-middle">
    <input type="checkbox" id={id} className="sr-only" checked={!isMetric} onChange={onToggle} />
    <label htmlFor={id} className="flex items-center cursor-pointer">
      <div className="w-28 h-8 bg-gray-200 rounded-full relative flex items-center">
        <div className={`absolute w-14 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out top-1 ${isMetric ? 'left-1' : 'left-[52px]'}`}></div>
        <div className="flex w-full relative z-10">
          <span className={`text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${isMetric ? 'text-gray-700' : 'text-gray-400'}`}>Meter</span>
          <span className={`text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${!isMetric ? 'text-gray-700' : 'text-gray-400'}`}>Feet</span>
        </div>
      </div>
    </label>
  </div>
);

export default PropertyRooms;
