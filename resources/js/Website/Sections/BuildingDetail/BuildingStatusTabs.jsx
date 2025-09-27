import React, { useState } from 'react';
import NearbySchools from '../../Components/PropertyDetail/NearbySchools';
import Amenities from '../../Components/PropertyDetail/Amenities';

const BuildingStatusTabs = ({ building }) => {
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
    { id: 'schools', label: 'Nearby schools' }
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
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto py-0" data-building-status-tabs>
      {/* Building Status Navigation */}
      <div className="flex flex-col items-start gap-6 w-full relative z-10">
        {/* Status Labels Section */}
        <div className="flex flex-row items-start gap-[22px] h-10 flex-wrap">
          {/* Building Status Badge */}
          <div className="flex items-center px-2 gap-2 min-w-fit h-10 bg-[#293056] rounded-xl">
            <span className="font-work-sans font-bold text-sm leading-6 tracking-tight text-white whitespace-nowrap px-2">
              {building?.status || 'Available'} Building
            </span>
          </div>

          {/* Construction Date Badge */}
          {building?.year_built && (
            <div className="flex items-center px-3 gap-2 min-w-fit h-10 bg-[#293056] rounded-xl">
              <span className="font-work-sans font-bold text-sm leading-6 tracking-tight text-white whitespace-nowrap">
                Built in {building.year_built}
              </span>
            </div>
          )}

          {/* Units Available Badge */}
          {building?.total_units && (
            <div className="flex items-center px-3 gap-2 min-w-fit h-10 bg-[#293056] rounded-xl">
              <span className="font-work-sans font-bold text-sm leading-6 tracking-tight text-white whitespace-nowrap">
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
                  index === 1 ? 'min-w-[180px]' :
                  index === 2 ? 'min-w-[158px]' :
                  'min-w-[173px]'
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