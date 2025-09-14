import React, { useState, useEffect } from 'react';

const PropertyRooms = ({ property }) => {
  const [isMetric, setIsMetric] = useState(true);
  const [showHiddenRooms, setShowHiddenRooms] = useState(false);

  // Sample rooms data based on the HTML structure
  const roomsData = [
    {
      name: 'Dining Room',
      meters: '1.1 x 2.1 m',
      feet: '3.6 x 6.9 ft',
      features: 'Hardwood Floor, South View,',
      isAlternate: true
    },
    {
      name: 'Bedroom 2',
      meters: '2.3 x 1.8 m',
      feet: '7.5 x 5.9 ft',
      features: 'Hardwood Floor, South View,',
      isAlternate: false
    },
    {
      name: 'Living Room',
      meters: '1.8 x 1.2 m',
      feet: '5.9 x 3.9 ft',
      features: 'Hardwood Floor, Breakfast Bar,',
      isAlternate: true
    }
  ];

  const hiddenRoomsData = [
    {
      name: 'Family Room',
      meters: '1.7 x 1.3 m',
      feet: '5.6 x 4.3 ft',
      features: 'Hardwood Floor, W/O To Balcony',
      isAlternate: false
    },
    {
      name: 'Laundry',
      meters: '0.6 x 0.8 m',
      feet: '2.0 x 2.6 ft',
      features: 'Hardwood Floor, 6 Pc Ensui',
      isAlternate: true
    },
    {
      name: 'Primary Bedroom',
      meters: '2.0 x 1.9 m',
      feet: '6.6 x 6.2 ft',
      features: 'Hardwood Floor, W/I Closet,',
      isAlternate: false
    },
    {
      name: 'Bedroom 3',
      meters: '1.2 x 1.3 m',
      feet: '3.9 x 4.3 ft',
      features: 'Hardwood Floor, East View',
      isAlternate: true
    },
    {
      name: 'Kitchen',
      meters: '1.4 x 0.8 m',
      feet: '4.6 x 2.6 ft',
      features: 'Tile Floor',
      isAlternate: false
    }
  ];

  const handleToggleUnit = () => {
    setIsMetric(!isMetric);
  };

  const handleToggleRooms = () => {
    setShowHiddenRooms(!showHiddenRooms);
  };

  return (
    <div>
      <h2 className="text-base font-semibold mb-4" style={{ color: '#293056' }}>Room Dimensions</h2>
      <p className="text-gray-600 text-sm mb-4">Explore the dimensions of each room and the overall layout of the unit.</p>

      {/* Mobile Toggle - Full Width */}
      <div className="md:hidden mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Unit:</span>
          <div className="relative inline-block align-middle">
            <input
              type="checkbox"
              id="unit-toggle-mobile"
              className="sr-only"
              checked={!isMetric}
              onChange={handleToggleUnit}
            />
            <label htmlFor="unit-toggle-mobile" className="flex items-center cursor-pointer">
              <div className="w-28 h-8 bg-gray-200 rounded-full relative flex items-center">
                {/* Sliding white background */}
                <div
                  className={`absolute w-14 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out top-1 ${
                    isMetric ? 'left-1' : 'left-[52px]'
                  }`}
                ></div>

                {/* Text labels inside the toggle */}
                <div className="flex w-full relative z-10">
                  <span className={`text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${
                    isMetric ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    Meter
                  </span>
                  <span className={`text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${
                    !isMetric ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    Feet
                  </span>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Header Row with Toggle - Desktop Only */}
      <div className="hidden md:flex items-center mb-2">
        <div className="grid grid-cols-12 text-sm gap-2 w-full">
          <div className="col-span-3 font-medium">Name</div>
          <div className="col-span-3 font-medium">Size</div>
          <div className="col-span-2 flex items-center">
            {/* Toggle Switch - Desktop */}
            <div className="relative inline-block align-middle mr-2">
              <input
                type="checkbox"
                id="unit-toggle-desktop"
                className="sr-only"
                checked={!isMetric}
                onChange={handleToggleUnit}
              />
              <label htmlFor="unit-toggle-desktop" className="flex items-center cursor-pointer">
                <div className="w-28 h-8 bg-gray-200 rounded-full relative flex items-center">
                  {/* Sliding white background */}
                  <div
                    className={`absolute w-14 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out top-1 ${
                      isMetric ? 'left-1' : 'left-[52px]'
                    }`}
                  ></div>

                  {/* Text labels inside the toggle */}
                  <div className="flex w-full relative z-10">
                    <span className={`text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${
                      isMetric ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      Meter
                    </span>
                    <span className={`text-xs font-medium flex items-center justify-center w-14 transition-colors duration-300 ${
                      !isMetric ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      Feet
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div className="col-span-4 font-medium">Features</div>
        </div>
      </div>

      {/* Mobile Header Row - Simple */}
      <div className="md:hidden mb-2">
        <div className="grid grid-cols-12 text-sm gap-2 w-full">
          <div className="col-span-3 font-medium">Name</div>
          <div className="col-span-3 font-medium">Size</div>
          <div className="col-span-2"></div>
          <div className="col-span-4 font-medium">Features</div>
        </div>
      </div>

      <div id="rooms-container">
        {/* Initial visible rooms */}
        {roomsData.map((room, index) => (
          <div key={index} className={`mb-1 ${room.isAlternate ? 'bg-blue-50' : 'bg-white'}`}>
            <div className="grid grid-cols-12 py-2 text-sm items-center px-3">
              <div className="col-span-3 text-[#263238]">{room.name}</div>
              <div className="col-span-3">{isMetric ? room.meters : room.feet}</div>
              <div className="col-span-2"></div>
              <div className="col-span-4 text-[#263238]">{room.features}</div>
            </div>
          </div>
        ))}

        {/* Hidden rooms */}
        {showHiddenRooms && (
          <div id="hidden-rooms">
            {hiddenRoomsData.map((room, index) => (
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
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={handleToggleRooms}
          className="text-blue-600 text-sm hover:underline focus:outline-none"
        >
          {showHiddenRooms ? 'Show less' : 'Show more'}
        </button>
      </div>
    </div>
  );
};

export default PropertyRooms;