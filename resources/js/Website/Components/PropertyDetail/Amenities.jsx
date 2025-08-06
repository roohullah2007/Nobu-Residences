import React from 'react';

const Amenities = () => {
  // Left section amenities (4 columns layout)
  const leftAmenities = [
    { name: 'Concierge', iconPath: '/assets/svgs/concierge.svg' },
    { name: 'Party Room', iconPath: '/assets/svgs/party-horn.svg' },
    { name: 'Meeting Room', iconPath: '/assets/svgs/meeting-consider-deliberate-about-meet.svg' },
    { name: 'Security Guard', iconPath: '/assets/svgs/police-security-policeman.svg' }
  ];

  const middleAmenities = [
    { name: 'Gym', iconPath: '/assets/svgs/gym.svg' },
    { name: 'Visitor Parking', iconPath: '/assets/svgs/parking.svg' },
    { name: 'Parking Garage', iconPath: '/assets/svgs/parking-garage-transportation-car-parking.svg' }
  ];

  const rightAmenities = [
    { name: 'Guest Suites', iconPath: '/assets/svgs/bed.svg' },
    { name: 'Pet Restriction', iconPath: '/assets/svgs/pets.svg' },
    { name: 'BBQ Permitted', iconPath: '/assets/svgs/bbq-grill.svg' }
  ];

  const farRightAmenities = [
    { name: 'Outdoor Pool', iconPath: '/assets/svgs/pool-ladder.svg' },
    { name: 'Media Room', iconPath: '/assets/svgs/media.svg' },
    { name: 'Rooftop Deck', iconPath: '/assets/svgs/deck-chair-under-the-sun.svg' }
  ];

  const bottomRowAmenities = [
    { name: 'Security System', iconPath: '/assets/svgs/security.svg' }
  ];

  // All amenities combined for responsive grid
  const allAmenities = [
    ...leftAmenities,
    ...middleAmenities, 
    ...rightAmenities,
    ...farRightAmenities,
    ...bottomRowAmenities
  ];

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

  return (
    <div>
      <h2 className="text-base font-semibold mb-4" style={{ color: '#293056' }}>Amenities</h2>
      <p className="text-gray-600 text-sm mb-4">Explore the amenities available at 109OZ, including shared spaces and building services.</p>
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