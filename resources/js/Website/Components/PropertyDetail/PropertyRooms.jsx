import React, { useState } from 'react';

const PropertyRooms = ({ property }) => {
  const [activeUnit, setActiveUnit] = useState('feet');

  // Extract rooms data from property object
  let roomsData = [];

  if (property?.Rooms && Array.isArray(property.Rooms) && property.Rooms.length > 0) {
    roomsData = property.Rooms.map(room => {
      const name = room.RoomType || '';
      const length = room.RoomLength || '';
      const width = room.RoomWidth || '';
      const units = room.RoomLengthWidthUnits || '';
      
      // Create dimension strings for both units
      let dimensionMeters = '';
      let dimensionFeet = '';
      
      if (length && width) {
        if (units?.toLowerCase() === 'meters' || units?.toLowerCase() === 'm') {
          dimensionMeters = `${length}m x ${width}m`;
          // Convert to feet
          const lengthFeet = Math.round(length * 3.28084 * 100) / 100;
          const widthFeet = Math.round(width * 3.28084 * 100) / 100;
          dimensionFeet = `${lengthFeet}ft x ${widthFeet}ft`;
        } else {
          // Assume feet if not specified
          dimensionFeet = `${length}ft x ${width}ft`;
          // Convert to meters
          const lengthMeters = Math.round((length / 3.28084) * 100) / 100;
          const widthMeters = Math.round((width / 3.28084) * 100) / 100;
          dimensionMeters = `${lengthMeters}m x ${widthMeters}m`;
        }
      }
      
      // Get features
      const features = [
        room.RoomFeature1,
        room.RoomFeature2,
        room.RoomFeature3
      ].filter(Boolean).join(', ');
      
      return {
        name,
        dimensionMeters,
        dimensionFeet,
        features
      };
    });
  }

  // If no rooms data, add sample data to match the image
  if (roomsData.length === 0) {
    roomsData = [
      {
        name: 'Living Room',
        dimensionMeters: '7.19m x 3.26m',
        dimensionFeet: '23.6ft x 10.7ft',
        features: 'Combined w/Dining Window Floor to Ceil Laminate'
      },
      {
        name: 'Living Room',
        dimensionMeters: '7.19m x 3.26m',
        dimensionFeet: '23.6ft x 10.7ft',
        features: 'Combined w/Dining Window Floor to Ceil Laminate'
      },
      {
        name: 'Living Room',
        dimensionMeters: '7.19m x 3.26m',
        dimensionFeet: '23.6ft x 10.7ft',
        features: 'Combined w/Dining Window Floor to Ceil Laminate'
      },
      {
        name: 'Living Room',
        dimensionMeters: '7.19m x 3.26m',
        dimensionFeet: '23.6ft x 10.7ft',
        features: 'Combined w/Dining Window Floor to Ceil Laminate'
      },
      {
        name: 'Living Room',
        dimensionMeters: '7.19m x 3.26m',
        dimensionFeet: '23.6ft x 10.7ft',
        features: 'Combined w/Dining Window Floor to Ceil Laminate'
      }
    ];
  }

  return (
    <div className="py-6">
      {/* Property Rooms Container */}
      <div className="flex flex-col">
        {/* Rooms Table Container */}
        <div className="bg-white">
          <div className="overflow-x-auto">
            {/* Table */}
            <div className="min-w-full">
              {/* Header */}
              <div className="border-b border-gray-200">
                <div className="grid grid-cols-3 gap-0">
                  <div className="px-6 py-4 text-left text-base font-semibold text-gray-900">
                    Rooms
                  </div>
                  <div className="px-6 py-4 text-left text-base font-semibold text-gray-900 flex items-center justify-between">
                    <span>Dimensions</span>
                    <div className="inline-flex bg-gray-100 text-black rounded-lg p-1 ml-4">
                      <button
                        onClick={() => setActiveUnit('feet')}
                        className={`px-2 py-1 border-none bg-none rounded-md text-xs font-medium cursor-pointer transition-all duration-200 ${
                          activeUnit === 'feet'
                            ? 'bg-white shadow-sm text-black'
                            : 'hover:bg-gray-200 text-black'
                        }`}
                      >
                        Square Feet
                      </button>
                      <button
                        onClick={() => setActiveUnit('meters')}
                        className={`px-2 py-1 border-none bg-none rounded-md text-xs font-medium cursor-pointer transition-all duration-200 ${
                          activeUnit === 'meters'
                            ? 'bg-white shadow-sm text-black'
                            : 'hover:bg-gray-200 text-black'
                        }`}
                      >
                        Meters
                      </button>
                    </div>
                  </div>
                  <div className="px-6 py-4 text-left text-base font-semibold text-gray-900">
                    Features
                  </div>
                </div>
              </div>
              
              {/* Body */}
              <div className="bg-white">
                {roomsData.slice(0, 5).map((room, index) => (
                  <div key={index} className="grid grid-cols-3 gap-0 border-b border-gray-100 last:border-b-0">
                    <div className="px-6 py-4 text-sm font-normal text-gray-700">
                      {room.name}
                    </div>
                    <div className="px-6 py-4 text-sm font-normal text-gray-700">
                      {activeUnit === 'feet' ? room.dimensionFeet : room.dimensionMeters}
                    </div>
                    <div className="px-6 py-4 text-sm font-normal text-gray-700">
                      {room.features}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Show more button */}
              {roomsData.length > 5 && (
                <div className="px-6 py-4">
                  <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                    Show more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyRooms;