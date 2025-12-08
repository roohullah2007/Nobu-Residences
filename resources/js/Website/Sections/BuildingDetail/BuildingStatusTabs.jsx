import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import NearbySchools from '../../Components/PropertyDetail/NearbySchools';
import Amenities from '../../Components/PropertyDetail/Amenities';
import MortgageCalculator from '../../Components/PropertyDetail/MortgageCalculator';

const BuildingStatusTabs = ({ building }) => {
  const { globalWebsite, website } = usePage().props;
  const effectiveWebsite = website || globalWebsite;

  const brandColors = effectiveWebsite?.brand_colors || {
    button_primary_bg: '#293056',
    button_primary_text: '#FFFFFF'
  };

  const buttonPrimaryBg = brandColors.button_primary_bg || '#293056';
  const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';

  const [activeTab, setActiveTab] = useState('overview');

  const buildingData = {
    daysOnMarket: 180,
    constructionDate: 'Completed 2018',
    status: 'Available',
    description: 'Found in Toronto\'s North York suburb and built in 2001 by Menkes Development Inc, this Toronto condo sits near the intersection of Yonge St & Hillcrest Ave. The Pinnacle is a high-rise condo situated in the bustling neighbourhood of Willowdale East. Located at The Pinnacle this North York condo has suites ranging from 406 to 1790 sqft. There are 378 units at The Pinnacle, with a variety of exposures and layouts over 31 levels. Residents of this condo can enjoy amenities like a Gym / Exercise Room, Concierge, Parking Garage and a Sauna, along with an Enter Phone System. Monthly maintenance fees include Common Element Maintenance, Building Insurance and Water. Ranked the 154 most expensive condo building in North York, this condo is one of the more exclusive options. The price per square foot is currently averaging $882.07. The average one bed condo at The Pinnacle has been selling for around $535000.00. The average two bed condo at The Pinnacle has been selling for around $750000.00.',
    details: {
      developer: '-',
      management: 'Crossbridge Condominium Services',
      corp: 'MTCC-1362',
      dateRegistered: 'Jan 29, 2001',
      location: 'Yonge St & Hillcrest Ave',
      neighbourhood: 'Willowdale East',
      totalUnits: '378 units',
      levels: '31 levels',
      suiteRange: '406 to 1790 sqft',
      avgPricePerSqft: '$882.07',
      avgOneBedPrice: '$535,000.00',
      avgTwoBedPrice: '$750,000.00',
      ranking: '154th most expensive condo building in North York'
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'schools', label: 'Nearby schools' },
    { id: 'mortgage', label: 'Mortgage Calculator' },
    { id: 'floors', label: 'Floors & Rooms' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="flex flex-col rounded-xl border-gray-200 border p-4 items-start gap-2 w-full max-w-[1280px]">
            <div className="w-full font-work-sans text-lg leading-7 tracking-tight text-[#252B37]">
              <h3 className="font-bold mr-2 font-space-grotesk" style={{ color: '#293056' }}>About The Building</h3>
              <span className="font-normal">{building?.description || buildingData.description}</span>
            </div>
          </div>
        );
      
      case 'amenities':
        return (
          <div className="p-4 rounded-xl border-gray-200 border shadow-sm">
            <Amenities buildingData={building} />
          </div>
        );
      
      case 'schools':
        return (
          <div className="p-4 rounded-xl border-gray-200 border shadow-sm">
            <NearbySchools propertyData={building} />
          </div>
        );

      case 'mortgage':
        return (
          <div className="p-4 rounded-xl border-gray-200 border shadow-sm">
            <MortgageCalculator property={building} />
          </div>
        );

      case 'floors':
        return (
          <BuildingFloorsRooms building={building} />
        );

      default:
        return null;
    }
  };

  // Building Floors & Rooms Component
  const BuildingFloorsRooms = ({ building }) => {
    const [isMetric, setIsMetric] = useState(true);
    const [showAllFloors, setShowAllFloors] = useState(false);

    // Generate floor data based on building info
    const totalFloors = building?.floors || building?.total_floors || 45;
    const totalUnits = building?.total_units || 660;
    const unitsPerFloor = Math.ceil(totalUnits / totalFloors);

    // Common building areas/rooms
    const commonAreas = [
      { name: 'Lobby', floor: '1', size: { meters: '15.0 x 12.0 m', feet: '49.2 x 39.4 ft' }, features: 'Marble Flooring, 24/7 Concierge' },
      { name: 'Amenity Floor', floor: '2-3', size: { meters: '25.0 x 20.0 m', feet: '82.0 x 65.6 ft' }, features: 'Fitness Center, Pool, Lounge' },
      { name: 'Party Room', floor: '2', size: { meters: '8.0 x 6.0 m', feet: '26.2 x 19.7 ft' }, features: 'Kitchen, Entertainment System' },
      { name: 'Rooftop Terrace', floor: String(totalFloors), size: { meters: '30.0 x 15.0 m', feet: '98.4 x 49.2 ft' }, features: 'BBQ Area, Lounge Seating' },
    ];

    // Generate floor breakdown
    const floorBreakdown = [];
    for (let i = 1; i <= Math.min(showAllFloors ? totalFloors : 10, totalFloors); i++) {
      let floorType = 'Residential';
      let units = unitsPerFloor;

      if (i === 1) {
        floorType = 'Lobby & Commercial';
        units = 0;
      } else if (i === 2 || i === 3) {
        floorType = 'Amenity Level';
        units = 0;
      } else if (i >= totalFloors - 2) {
        floorType = 'Penthouse Level';
        units = Math.max(1, Math.floor(unitsPerFloor / 2));
      }

      floorBreakdown.push({
        floor: i,
        type: floorType,
        units: units,
        avgSqft: floorType === 'Penthouse Level' ? '1,800 - 3,500' : floorType === 'Residential' ? '500 - 1,500' : '-'
      });
    }

    return (
      <div className="p-4 rounded-xl border-gray-200 border shadow-sm">
        <div className="space-y-6">
          {/* Building Overview */}
          <div>
            <h2 className="text-base font-semibold mb-2" style={{ color: '#293056' }}>Building Floor Plan Overview</h2>
            <p className="text-gray-600 text-sm mb-4">
              {building?.name || 'This building'} features {totalFloors} floors with {totalUnits} total units.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#F5F5F5] rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Floors</p>
                <p className="text-lg font-bold" style={{ color: '#293056' }}>{totalFloors}</p>
              </div>
              <div className="bg-[#F5F5F5] rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Units</p>
                <p className="text-lg font-bold" style={{ color: '#293056' }}>{totalUnits}</p>
              </div>
              <div className="bg-[#F5F5F5] rounded-lg p-3">
                <p className="text-xs text-gray-600">Parking Spots</p>
                <p className="text-lg font-bold" style={{ color: '#293056' }}>{building?.parking_spots || 'N/A'}</p>
              </div>
              <div className="bg-[#F5F5F5] rounded-lg p-3">
                <p className="text-xs text-gray-600">Year Built</p>
                <p className="text-lg font-bold" style={{ color: '#293056' }}>{building?.year_built || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Common Areas Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#293056' }}>Common Areas & Amenity Spaces</h3>

            {/* Unit Toggle */}
            <div className="flex justify-end mb-3">
              <div className="relative inline-block align-middle">
                <input
                  type="checkbox"
                  id="unit-toggle-floors"
                  className="sr-only"
                  checked={!isMetric}
                  onChange={() => setIsMetric(!isMetric)}
                />
                <label htmlFor="unit-toggle-floors" className="flex items-center cursor-pointer">
                  <div className="w-28 h-8 bg-gray-200 rounded-full relative flex items-center">
                    <div
                      className={`absolute w-14 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out top-1 ${
                        isMetric ? 'left-1' : 'left-[52px]'
                      }`}
                    ></div>
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

            {/* Common Areas Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Area</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Floor</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Size</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Features</th>
                  </tr>
                </thead>
                <tbody>
                  {commonAreas.map((area, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                      <td className="py-2 px-3 text-[#263238]">{area.name}</td>
                      <td className="py-2 px-3">{area.floor}</td>
                      <td className="py-2 px-3">{isMetric ? area.size.meters : area.size.feet}</td>
                      <td className="py-2 px-3 text-[#263238]">{area.features}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Floor Breakdown Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#293056' }}>Floor Breakdown</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Floor</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Type</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Units</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Avg. Unit Size (sqft)</th>
                  </tr>
                </thead>
                <tbody>
                  {floorBreakdown.map((floor, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                      <td className="py-2 px-3 font-medium" style={{ color: '#293056' }}>{floor.floor}</td>
                      <td className="py-2 px-3">{floor.type}</td>
                      <td className="py-2 px-3">{floor.units > 0 ? floor.units : '-'}</td>
                      <td className="py-2 px-3">{floor.avgSqft}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalFloors > 10 && (
              <button
                onClick={() => setShowAllFloors(!showAllFloors)}
                className="mt-4 text-blue-600 text-sm hover:underline focus:outline-none"
              >
                {showAllFloors ? `Show less (first 10 floors)` : `Show all ${totalFloors} floors`}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto py-0" data-building-status-tabs>
      {/* Building Status Navigation */}
      <div className="flex flex-col items-start gap-3 md:gap-6 w-full relative z-10">
        {/* Status Labels Section - Scrollable on mobile */}
        <div className="flex flex-row items-center gap-2 md:gap-[22px] w-full overflow-x-auto scrollbar-hide pb-2 md:pb-0 md:flex-wrap">
          {/* Building Status Badge */}
          <div className="flex items-center px-3 gap-2 h-8 md:h-10 rounded-lg md:rounded-xl flex-shrink-0" style={{ backgroundColor: buttonPrimaryBg }}>
            <span className="font-work-sans font-bold text-xs md:text-sm leading-5 md:leading-6 tracking-tight whitespace-nowrap" style={{ color: buttonPrimaryText }}>
              {building?.status || 'Available'} Building
            </span>
          </div>

          {/* Construction Date Badge */}
          {building?.year_built && (
            <div className="flex items-center px-3 gap-2 h-8 md:h-10 rounded-lg md:rounded-xl flex-shrink-0" style={{ backgroundColor: buttonPrimaryBg }}>
              <span className="font-work-sans font-bold text-xs md:text-sm leading-5 md:leading-6 tracking-tight whitespace-nowrap" style={{ color: buttonPrimaryText }}>
                Built in {building.year_built}
              </span>
            </div>
          )}

          {/* Units Available Badge */}
          {building?.total_units && (
            <div className="flex items-center px-3 gap-2 h-8 md:h-10 rounded-lg md:rounded-xl flex-shrink-0" style={{ backgroundColor: buttonPrimaryBg }}>
              <span className="font-work-sans font-bold text-xs md:text-sm leading-5 md:leading-6 tracking-tight whitespace-nowrap" style={{ color: buttonPrimaryText }}>
                {building.total_units} Total Units
              </span>
            </div>
          )}
        </div>
        
        {/* Navigation Tabs Section */}
        <div className="flex flex-col items-start gap-[18px] w-full">
          <div className="flex flex-row items-center gap-[8px] h-[50px] overflow-x-auto scrollbar-hide w-full md:flex-wrap">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className={`flex justify-center items-center p-2.5 cursor-pointer transition-all duration-300 border-b flex-shrink-0 ${
                  activeTab === tab.id 
                    ? 'border-[#252B37]' 
                    : 'border-transparent hover:border-[#3E4784]'
                } ${
                  index === 0 ? 'min-w-[108px]' :
                  index === 1 ? 'min-w-[120px]' :
                  index === 2 ? 'min-w-[158px]' :
                  index === 3 ? 'min-w-[180px]' :
                  'min-w-[150px]'
                } h-[50px]`}
                onClick={() => handleTabClick(tab.id)}
                data-tab={tab.id}
              >
                <span className={`font-red-hat font-bold text-xl leading-[30px] tracking-tight whitespace-nowrap flex items-center ${
                  activeTab === tab.id ? 'text-[#252B37]' : 'text-[#252B37] hover:text-[#3E4784]'
                }`}>
                  {tab.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tab Content Area */}
      <div className="w-full relative min-h-[200px] mt-5">
        <div className="w-full animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .flex-row.items-center.gap-\\[14px\\] {
            padding-bottom: 8px;
          }
          
          .font-red-hat.font-bold.text-xl {
            font-size: 16px;
            line-height: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default BuildingStatusTabs;