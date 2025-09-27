import React from 'react';

const Amenities = ({ buildingData, propertyData }) => {
  // Default amenity icon mapping
  const amenityIcons = {
    'Concierge': '/assets/svgs/concierge.svg',
    'Party Room': '/assets/svgs/party-horn.svg',
    'Meeting Room': '/assets/svgs/meeting-consider-deliberate-about-meet.svg',
    'Security Guard': '/assets/svgs/police-security-policeman.svg',
    'Gym': '/assets/svgs/gym.svg',
    'Fitness Center': '/assets/svgs/gym.svg',
    'Visitor Parking': '/assets/svgs/parking.svg',
    'Parking Garage': '/assets/svgs/parking-garage-transportation-car-parking.svg',
    'Guest Suites': '/assets/svgs/bed.svg',
    'Pet Restriction': '/assets/svgs/pets.svg',
    'BBQ Permitted': '/assets/svgs/bbq-grill.svg',
    'Outdoor Pool': '/assets/svgs/pool-ladder.svg',
    'Pool': '/assets/svgs/pool-ladder.svg',
    'Media Room': '/assets/svgs/media.svg',
    'Rooftop Deck': '/assets/svgs/deck-chair-under-the-sun.svg',
    'Security System': '/assets/svgs/security.svg',
    'Sauna': '/assets/svgs/radiator.svg',
    'Hot Tub': '/assets/svgs/shower.svg',
    'Playground': '/assets/svgs/party-horn.svg',
    'Tennis Court': '/assets/svgs/gym.svg',
    'Basketball Court': '/assets/svgs/gym.svg',
    'Library': '/assets/svgs/meeting-consider-deliberate-about-meet.svg',
    'Storage': '/assets/svgs/parking-garage-transportation-car-parking.svg',
    'Lounge': '/assets/svgs/party-horn.svg'
  };

  // Use buildingData directly or fallback to propertyData
  const building = buildingData || propertyData?.buildingData || propertyData;
  const buildingAmenities = building?.amenities || [];

  console.log('Amenities Component - Property Data:', propertyData);
  console.log('Amenities Component - Building Data:', buildingData);
  console.log('Amenities Component - Building:', building);
  console.log('Amenities Component - Building Amenities:', buildingAmenities);
  console.log('Amenities Component - Maintenance Fee Amenities:', building?.maintenance_fee_amenities);

  // Only show amenities from the database - NO HARDCODED DATA
  let allAmenities = [];

  if (buildingAmenities && Array.isArray(buildingAmenities) && buildingAmenities.length > 0) {
    // Use actual building amenities from database
    allAmenities = buildingAmenities.map(amenity => {
      // Use icon from database or map to local icon
      let iconPath = amenity.icon;

      // If icon is from storage, use it directly
      if (iconPath && (iconPath.startsWith('/storage') || iconPath.startsWith('http'))) {
        // Use as is
      } else if (amenityIcons[amenity.name]) {
        // Fallback to mapped icon
        iconPath = amenityIcons[amenity.name];
      } else {
        // Default icon
        iconPath = '/assets/svgs/amenity-default.svg';
      }

      return {
        name: amenity.name,
        iconPath: iconPath
      };
    });
  }
  // NO FALLBACK TO HARDCODED DATA - if no amenities from backend, show nothing

  // Get maintenance fee amenities from backend - check both possible property names
  const maintenanceFeeAmenities = building?.maintenance_fee_amenities ||
                                  building?.maintenanceFeeAmenities ||
                                  [];

  console.log('Maintenance Fee Amenities from Backend:', maintenanceFeeAmenities);
  console.log('Type of maintenance_fee_amenities:', typeof maintenanceFeeAmenities);
  console.log('Is Array:', Array.isArray(maintenanceFeeAmenities));

  // Use dynamic maintenance amenities from backend
  const includedAmenities = Array.isArray(maintenanceFeeAmenities)
    ? maintenanceFeeAmenities.map(amenity => ({
        name: amenity.name,
        iconPath: amenity.icon || '/assets/svgs/amenity-default.svg',
        included: true
      }))
    : [];

  const CheckIcon = () => (
    <img src="/assets/svgs/tick.svg" alt="Check" className="w-5 h-5" />
  );

  const CrossIcon = () => (
    <img src="/assets/svgs/cross.svg" alt="Cross" className="w-5 h-5" />
  );

  // Get building name from property data
  const buildingName = building?.name || propertyData?.buildingName || propertyData?.building?.name || 'this building';

  // Don't render if no amenities available
  if (!allAmenities || allAmenities.length === 0) {
    return (
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: '#293056' }}>Amenities</h2>
        <p className="text-gray-600 text-sm">No amenities information available for this property.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-semibold mb-4" style={{ color: '#293056' }}>Amenities</h2>
      <p className="text-gray-600 text-sm mb-4">Explore the amenities available at {buildingName}, including shared spaces and building services.</p>
      {/* Main container - Mobile and Desktop responsive */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left main section - Amenities Grid */}
        <div className="flex-1 w-full lg:max-w-[658px]">
          <h3 className="text-base font-semibold mb-4" style={{ color: '#293056' }}>Building Features & Services</h3>
          <div className="border border-gray-200 rounded-lg p-4 h-full">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 lg:gap-x-8 lg:gap-y-4">
            {allAmenities.map((amenity, index) => (
              <div key={amenity.id || index} className="flex flex-row items-center gap-2">
                <img
                  src={amenity.iconPath}
                  alt={amenity.name}
                  className="w-5 h-5 flex-shrink-0"
                  onError={(e) => {
                    e.target.src = '/assets/svgs/amenity-default.svg';
                  }}
                />
                <span className="font-red-hat font-semibold text-sm leading-6 text-[#545454] truncate">
                  {amenity.name}
                </span>
              </div>
            ))}
            </div>
          </div>
        </div>
        
        {/* Right sidebar - Included Amenities - Only show if we have data */}
        {includedAmenities.length > 0 && (
          <div className="w-full lg:w-[300px] lg:flex-shrink-0">
            <h3 className="text-base font-semibold mb-4" style={{ color: '#293056' }}>Included in Maintenance Fees</h3>
            <div className="border border-gray-200 rounded-lg p-4 h-full">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {includedAmenities.length === 0 ? (
                  <p className="text-sm text-gray-500">No amenities included in maintenance fees</p>
                ) : (
                  includedAmenities.map((amenity, index) => (
                    <div key={index} className="flex flex-row items-center gap-2">
                      <img
                        src={amenity.iconPath}
                        alt={amenity.name}
                        className="w-5 h-5 flex-shrink-0"
                      />
                      <span className="font-work-sans font-medium text-sm leading-6 tracking-[-0.03em] text-[#293056] flex-1 truncate">
                        {amenity.name}
                      </span>
                      <div className="w-5 h-5 flex-shrink-0">
                        <CheckIcon />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Amenities;