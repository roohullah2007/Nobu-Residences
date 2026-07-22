import React from 'react';
import { resolveAmenityIconPath } from '@/utils/amenityIcon';

export default function BuildingAmenities({ buildingData }) {
  console.log('=== BuildingAmenities Component Debug ===');
  console.log('Raw buildingData received:', buildingData);
  console.log('buildingData type:', typeof buildingData);
  console.log('buildingData.amenities exists:', !!(buildingData && buildingData.amenities));
  console.log('buildingData.amenities type:', buildingData && buildingData.amenities ? typeof buildingData.amenities : 'undefined');
  console.log('buildingData.amenities length:', buildingData && buildingData.amenities ? buildingData.amenities.length : 0);
  console.log('buildingData.amenities content:', buildingData && buildingData.amenities ? buildingData.amenities : 'none');
  
  // Don't render if no building data or no amenities
  if (!buildingData || !buildingData.amenities || buildingData.amenities.length === 0) {
    console.log('BuildingAmenities: No amenities to display - Component will NOT render');
    console.log('Conditions checked:', {
      hasBuildingData: !!buildingData,
      hasAmenities: !!(buildingData && buildingData.amenities),
      amenitiesLength: buildingData && buildingData.amenities ? buildingData.amenities.length : 0,
      shouldRender: false
    });
    return null;
  }

  console.log('BuildingAmenities: Component WILL render with', {
    buildingName: buildingData.name,
    amenitiesCount: buildingData.amenities.length,
    amenities: buildingData.amenities,
    firstAmenity: buildingData.amenities[0],
    dataSource: 'relationship_table'
  });

  const getAmenityIcon = (amenity) => {
    // Bare filenames from the DB keep the legacy assets-path treatment;
    // everything else goes through the shared keyword resolver so every
    // amenity shows a related icon.
    if (amenity.icon && !amenity.icon.startsWith('http') && !amenity.icon.startsWith('/')) {
      return `/assets/svgs/${amenity.icon}`;
    }

    return resolveAmenityIconPath(amenity.name, amenity.icon);
  };

  // Get maintenance fee amenities
  const maintenanceFeeAmenities = buildingData.maintenance_fee_amenities ||
                                  buildingData.maintenanceFeeAmenities ||
                                  [];

  console.log('BuildingAmenities: Maintenance Fee Amenities:', maintenanceFeeAmenities);

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6">
      {/* Main amenities section */}
      <div className="flex-1 w-full lg:max-w-[658px]">
        <h3 className="text-base font-semibold mb-4" style={{ color: 'rgb(41, 48, 86)' }}>
          Building Features & Services
        </h3>
        <div className="border border-gray-200 rounded-lg p-4 h-full">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 lg:gap-x-8 lg:gap-y-4">
            {buildingData.amenities.map((amenity, index) => {
              const iconSrc = getAmenityIcon(amenity);
              console.log('Rendering amenity:', { name: amenity.name, iconSrc, amenity });

              return (
                <div key={amenity.id || index} className="flex flex-row items-center gap-2">
                  <img
                    src={iconSrc}
                    alt={amenity.name}
                    className="w-5 h-5 flex-shrink-0"
                    onError={(e) => {
                      console.log('Icon failed to load for amenity:', amenity.name, 'src:', iconSrc);
                      // Fallback to default icon if image fails to load
                      e.target.src = '/assets/svgs/amenity-default.svg';
                    }}
                    onLoad={() => {
                      console.log('Icon loaded successfully for amenity:', amenity.name);
                    }}
                  />
                  <span className="font-red-hat font-semibold text-sm leading-6 text-[#545454] truncate">
                    {amenity.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Maintenance fee amenities section - only show if available */}
      {maintenanceFeeAmenities.length > 0 && (
        <div className="w-full lg:w-[300px] lg:flex-shrink-0">
          <h3 className="text-base font-semibold mb-4" style={{ color: 'rgb(41, 48, 86)' }}>
            Included in Maintenance Fees
          </h3>
          <div className="border border-gray-200 rounded-lg p-4 h-full">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {maintenanceFeeAmenities.map((amenity, index) => (
                <div key={amenity.id || index} className="flex flex-row items-center gap-2">
                  <img
                    src={getAmenityIcon(amenity)}
                    alt={amenity.name}
                    className="w-5 h-5 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = '/assets/svgs/amenity-default.svg';
                    }}
                  />
                  <span className="font-work-sans font-medium text-sm leading-6 tracking-[-0.03em] text-[#293056] flex-1 truncate">
                    {amenity.name}
                  </span>
                  <img src="/assets/svgs/tick.svg" alt="Included" className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}