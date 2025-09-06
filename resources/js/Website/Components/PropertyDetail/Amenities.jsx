import React from 'react';

const Amenities = ({ propertyData }) => {
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

  // Check if property has building amenities
  const buildingAmenities = propertyData?.buildingAmenities || propertyData?.building?.amenities;
  
  let allAmenities = [];
  
  if (buildingAmenities && Array.isArray(buildingAmenities) && buildingAmenities.length > 0) {
    // Use actual building amenities from database
    allAmenities = buildingAmenities.map(amenity => ({
      name: amenity.name || amenity,
      iconPath: amenityIcons[amenity.name || amenity] || '/assets/svgs/concierge.svg'
    }));
  } else {
    // Fallback to default amenities for demo
    const defaultAmenities = [
      { name: 'Concierge', iconPath: '/assets/svgs/concierge.svg' },
      { name: 'Party Room', iconPath: '/assets/svgs/party-horn.svg' },
      { name: 'Meeting Room', iconPath: '/assets/svgs/meeting-consider-deliberate-about-meet.svg' },
      { name: 'Security Guard', iconPath: '/assets/svgs/police-security-policeman.svg' },
      { name: 'Gym', iconPath: '/assets/svgs/gym.svg' },
      { name: 'Visitor Parking', iconPath: '/assets/svgs/parking.svg' },
      { name: 'Parking Garage', iconPath: '/assets/svgs/parking-garage-transportation-car-parking.svg' },
      { name: 'Guest Suites', iconPath: '/assets/svgs/bed.svg' },
      { name: 'Pet Restriction', iconPath: '/assets/svgs/pets.svg' },
      { name: 'BBQ Permitted', iconPath: '/assets/svgs/bbq-grill.svg' },
      { name: 'Outdoor Pool', iconPath: '/assets/svgs/pool-ladder.svg' },
      { name: 'Media Room', iconPath: '/assets/svgs/media.svg' },
      { name: 'Rooftop Deck', iconPath: '/assets/svgs/deck-chair-under-the-sun.svg' },
      { name: 'Security System', iconPath: '/assets/svgs/security.svg' }
    ];
    allAmenities = defaultAmenities;
  }

  // Included amenities (right sidebar)
  const includedAmenities = [
    { name: 'Hydro', iconPath: '/assets/svgs/hydro-power-water.svg', included: true },
    { name: 'Water', iconPath: '/assets/svgs/shower.svg', included: true },
    { name: 'Parking', iconPath: '/assets/svgs/parking-2.svg', included: true },
    { name: 'Cable', iconPath: '/assets/svgs/tv.svg', included: false },
    { name: 'Heat', iconPath: '/assets/svgs/radiator.svg', included: true }
  ];

  const CheckIcon = () => (
    <img src="/assets/svgs/tick.svg" alt="Check" className="w-5 h-5" />
  );

  const CrossIcon = () => (
    <img src="/assets/svgs/cross.svg" alt="Cross" className="w-5 h-5" />
  );

  // Get building name from property data
  const buildingName = propertyData?.buildingName || propertyData?.building?.name || 'this building';
  
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
              <div key={index} className="flex flex-row items-center gap-2">
                <img 
                  src={amenity.iconPath} 
                  alt={amenity.name}
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="font-red-hat font-semibold text-sm leading-6 text-[#545454] truncate">
                  {amenity.name}
                </span>
              </div>
            ))}
            </div>
          </div>
        </div>
        
        {/* Right sidebar - Included Amenities */}
        <div className="w-full lg:w-[300px] lg:flex-shrink-0">
          <h3 className="text-base font-semibold mb-4" style={{ color: '#293056' }}>Included in Maintenance Fees</h3>
          <div className="border border-gray-200 rounded-lg p-4 h-full">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {includedAmenities.map((amenity, index) => (
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
                    {amenity.included ? <CheckIcon /> : <CrossIcon />}
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

export default Amenities;