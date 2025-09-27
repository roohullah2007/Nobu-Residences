import React, { useState } from 'react';

const PropertyRooms = ({ propertyData = null }) => {
  const [activeUnit, setActiveUnit] = useState('feet');

  // Convert meters to feet
  const metersToFeet = (meters) => {
    return (meters * 3.28084).toFixed(1);
  };

  // Convert feet to meters
  const feetToMeters = (feet) => {
    return (feet / 3.28084).toFixed(1);
  };

  // Process rooms data from property object or use sample data
  const getRoomsData = () => {
    let roomsData = [];

    // If property data is provided and has rooms
    if (propertyData?.Rooms && Array.isArray(propertyData.Rooms) && propertyData.Rooms.length > 0) {
      roomsData = propertyData.Rooms.map(room => {
        const name = room.RoomType || '';
        const length = parseFloat(room.RoomLength) || 0;
        const width = parseFloat(room.RoomWidth) || 0;
        const units = room.RoomLengthWidthUnits?.toLowerCase() || 'feet';

        let dimensionMeters = '';
        let dimensionFeet = '';

        if (length && width) {
          if (units === 'meters' || units === 'm') {
            dimensionMeters = `${length}m x ${width}m`;
            const lengthFeet = metersToFeet(length);
            const widthFeet = metersToFeet(width);
            dimensionFeet = `${lengthFeet}ft x ${widthFeet}ft`;
          } else {
            dimensionFeet = `${length}ft x ${width}ft`;
            const lengthMeters = feetToMeters(length);
            const widthMeters = feetToMeters(width);
            dimensionMeters = `${lengthMeters}m x ${widthMeters}m`;
          }
        }

        const features = [
          room.RoomFeature1,
          room.RoomFeature2,
          room.RoomFeature3
        ].filter(feature => feature && feature.trim()).join(', ');

        return {
          name,
          dimensionMeters,
          dimensionFeet,
          features
        };
      });
    }

    // If no rooms data, use sample data
    if (roomsData.length === 0) {
      roomsData = [
        {
          name: 'Living Room',
          dimensionMeters: '7.19m x 3.26m',
          dimensionFeet: '23.6ft x 10.7ft',
          features: 'Combined w/Dining Window Floor to Ceil Laminate'
        },
        {
          name: 'Master Bedroom',
          dimensionMeters: '4.5m x 3.8m',
          dimensionFeet: '14.8ft x 12.5ft',
          features: 'Walk-in Closet, Ensuite Bathroom'
        },
        {
          name: 'Kitchen',
          dimensionMeters: '3.2m x 2.8m',
          dimensionFeet: '10.5ft x 9.2ft',
          features: 'Granite Countertops, Stainless Steel Appliances'
        }
      ];
    }

    return roomsData;
  };

  const roomsData = getRoomsData();

  const handleUnitToggle = (unit) => {
    setActiveUnit(unit);
  };

  return (
    <div className="flex flex-col">
      {/* Rooms Header */}
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-xl font-bold">Property Rooms</h2>
        <div className="inline-flex bg-gray-100 text-black rounded-lg p-1">
          <button
            onClick={() => handleUnitToggle('feet')}
            className={`px-2 py-1 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
              activeUnit === 'feet'
                ? 'bg-white shadow-sm text-black'
                : 'bg-transparent hover:bg-gray-200 text-black'
            }`}
          >
            Square Feet
          </button>
          <button
            onClick={() => handleUnitToggle('meters')}
            className={`px-2 py-1 border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
              activeUnit === 'meters'
                ? 'bg-white shadow-sm text-black'
                : 'bg-transparent hover:bg-gray-200 text-black'
            }`}
          >
            Meters
          </button>
        </div>
      </div>

      {/* Rooms Table Container */}
      <div className="bg-white border border-[#D2D2D2] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Table Header */}
            <div className="bg-[#FBF9F7] border-b border-[#D2D2D2]">
              <div className="grid grid-cols-[1fr_1fr_2fr] gap-0">
                <div className="px-6 py-3 text-left text-sm font-bold tracking-wide text-gray-700">
                  Room
                </div>
                <div className="px-6 py-3 text-left text-sm font-bold tracking-wide text-gray-700">
                  Dimensions
                </div>
                <div className="px-6 py-3 text-left text-sm font-bold tracking-wide text-gray-700">
                  Features
                </div>
              </div>
            </div>
            
            {/* Table Body */}
            <div className="bg-white">
              {roomsData.map((room, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-[1fr_1fr_2fr] gap-0 ${
                    index !== roomsData.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div className="px-6 py-4 text-sm font-medium whitespace-nowrap text-[#727272]">
                    {room.name}
                  </div>
                  <div className="px-6 py-4 text-sm font-medium whitespace-nowrap text-[#727272]">
                    {activeUnit === 'feet' ? room.dimensionFeet : room.dimensionMeters}
                  </div>
                  <div className="px-6 py-4 text-sm font-medium text-gray-900">
                    {room.features}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyRooms;
