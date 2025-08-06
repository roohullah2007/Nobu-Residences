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
    <div className="py-6">
      {/* Main container - Mobile and Desktop responsive */}
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:justify-between">
        {/* Left main section - Amenities Grid */}
        <div className="flex-1 w-full lg:max-w-[658px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-8 lg:gap-y-16">
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
        
        {/* Right sidebar - Included Amenities */}
        <div className="w-full lg:w-[134px] lg:flex-shrink-0">
          <div className="lg:bg-transparent rounded-lg lg:rounded-none py-4 lg:p-0">
            <h3 className="font-semibold text-sm text-gray-700 mb-4 lg:hidden">Included:</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-8">
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