import React from 'react';
import { createBuildingUrl, createSEOBuildingUrl } from '@/utils/slug';

const BuildingCard = ({ building, size = "default", className = "" }) => {
  if (!building) {
    return null;
  }

  const {
    id,
    name,
    address,
    city,
    province,
    building_type,
    total_units,
    year_built,
    developer,
    available_units_count,
    price_range,
    main_image
  } = building;
  
  // Extract developer name from developer object if it exists
  const developer_name = developer?.name || null;

  const cardClasses = {
    default: "w-full max-w-sm",
    large: "w-full max-w-lg"
  };

  return (
    <div className={`${cardClasses[size]} ${className}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Building Image */}
        <div className="relative h-48 bg-gray-200">
          <img
            src={main_image || '/images/no-image-placeholder.jpg'}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/no-image-placeholder.jpg';
            }}
          />
          
          {/* Building Type Badge */}
          {building_type && (
            <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs font-semibold text-gray-700">
              {building_type}
            </div>
          )}
          
          {/* Year Built Badge */}
          {year_built && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              Built {year_built}
            </div>
          )}
        </div>

        {/* Building Details */}
        <div className="p-4">
          {/* Building Name - Clickable */}
          <h3 
            className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-gray-700 transition-colors duration-200"
            onClick={() => window.location.href = createSEOBuildingUrl(building)}
          >
            {name}
          </h3>

          {/* Address */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-1">
            {address}, {city}, {province}
          </p>

          {/* Developer */}
          {developer_name && (
            <p className="text-gray-500 text-xs mb-3">
              By {developer_name}
            </p>
          )}

          {/* Building Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Total Units */}
            {total_units && (
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{total_units}</div>
                <div className="text-xs text-gray-500">Total Units</div>
              </div>
            )}
            
            {/* Available Units */}
            {available_units_count !== undefined && (
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{available_units_count}</div>
                <div className="text-xs text-gray-500">Available</div>
              </div>
            )}
          </div>

          {/* Price Range */}
          {price_range && (
            <div className="mb-3">
              <div className="text-xl font-bold text-gray-900">{price_range}</div>
              <div className="text-xs text-gray-500">Price Range</div>
            </div>
          )}

          {/* View Building Button */}
          <button
            onClick={() => window.location.href = createSEOBuildingUrl(building)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
          >
            View Building
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildingCard;