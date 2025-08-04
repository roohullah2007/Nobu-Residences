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
      {/* Main container - Frame 1300192523 */}
      <div className="flex flex-row items-start p-0 gap-[129px] w-[921px] h-[224px]">
        {/* Left main section - Frame 1300192491 */}
        <div className="flex flex-col items-start p-0 gap-6 w-[658px] h-[224px]">
          {/* Frame 1171275947 */}
          <div className="flex flex-col items-start p-0 gap-12 w-[658px] h-[218px] self-stretch">
            {/* Frame 1300192494 */}
            <div className="w-[658px] h-[224px] self-stretch relative">
              {/* Frame 1171276407 - First column */}
              <div className="absolute left-0 top-0">
                {leftAmenities.map((amenity, index) => (
                  <div key={index} className="flex flex-row items-center p-0 gap-2 w-[140.5px] h-8 absolute" style={{ top: `${index * 64}px` }}>
                    <img 
                      src={amenity.iconPath} 
                      alt={amenity.name}
                      className="w-5 h-5 flex-none order-0"
                    />
                    <span className="font-red-hat font-semibold text-sm leading-6 flex items-center text-[#545454] flex-none order-1">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Frame 1171276026 - Second column */}
              <div className="absolute left-[172.5px] top-0">
                {middleAmenities.map((amenity, index) => (
                  <div key={index} className="flex flex-row items-center p-0 gap-2 w-[140.5px] h-8 absolute" style={{ top: `${index * 64}px` }}>
                    <img 
                      src={amenity.iconPath} 
                      alt={amenity.name}
                      className="w-5 h-5 flex-none order-0"
                    />
                    <span className="font-red-hat font-semibold text-sm leading-6 flex items-center text-[#545454] flex-none order-1">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Frame 1171276027 - Third column */}
              <div className="absolute left-[345px] top-0">
                {rightAmenities.map((amenity, index) => (
                  <div key={index} className="flex flex-row items-center p-0 gap-2 w-[140.5px] h-8 absolute" style={{ top: `${index * 64}px` }}>
                    <img 
                      src={amenity.iconPath} 
                      alt={amenity.name}
                      className="w-5 h-5 flex-none order-0"
                    />
                    <span className="font-red-hat font-semibold text-sm leading-6 flex items-center text-[#545454] flex-none order-1">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Frame 1171276028 - Fourth column */}
              <div className="absolute left-[517.5px] top-0">
                {farRightAmenities.map((amenity, index) => (
                  <div key={index} className="flex flex-row items-center p-0 gap-2 w-[140.5px] h-8 absolute" style={{ top: `${index * 64}px` }}>
                    <img 
                      src={amenity.iconPath} 
                      alt={amenity.name}
                      className="w-5 h-5 flex-none order-0"
                    />
                    <span className="font-red-hat font-semibold text-sm leading-6 flex items-center text-[#545454] flex-none order-1">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Frame 1171276419 - Bottom row Security System */}
              <div className="absolute left-[172.5px] top-[192px]">
                {bottomRowAmenities.map((amenity, index) => (
                  <div key={index} className="flex flex-row items-center p-0 gap-2 w-[140.5px] h-8 absolute">
                    <img 
                      src={amenity.iconPath} 
                      alt={amenity.name}
                      className="w-5 h-5 flex-none order-0"
                    />
                    <span className="font-red-hat font-semibold text-sm leading-6 flex items-center text-[#545454] flex-none order-1">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right sidebar - Frame 1300192522 - Amenities */}
        <div className="flex flex-col justify-between items-start p-0 gap-2 w-[134px] h-[223px] flex-none order-1">
          <div className="flex flex-col justify-between items-start px-4 py-0 gap-8 w-[134px] h-[223px] rounded-b-[10px] flex-none order-0 self-stretch">
            {includedAmenities.map((amenity, index) => (
              <div key={index} className="flex flex-row items-center p-0 gap-2 w-full h-6 flex-none" style={{ order: index }}>
                <img 
                  src={amenity.iconPath} 
                  alt={amenity.name}
                  className="w-5 h-5 flex-none order-0"
                />
                <span className="font-work-sans font-medium text-sm leading-6 flex items-center tracking-[-0.03em] text-[#293056] flex-none order-1">
                  {amenity.name}
                </span>
                <div className="w-5 h-5 flex-none order-2">
                  {amenity.included ? <CheckIcon /> : <CrossIcon />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Amenities;