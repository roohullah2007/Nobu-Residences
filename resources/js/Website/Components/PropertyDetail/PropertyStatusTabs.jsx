import React, { useState } from 'react';
import PropertyRooms from './PropertyRooms';
import MortgageCalculator from './MortgageCalculator';
import NearbySchools from './NearbySchools';
import Amenities from './Amenities';

const PropertyStatusTabs = ({ property }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate days on market
  const calculateDaysOnMarket = () => {
    if (property?.ListingContractDate) {
      const listingDate = new Date(property.ListingContractDate);
      const today = new Date();
      const diffTime = Math.abs(today - listingDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return property?.DaysOnMarket || 0;
  };

  // Format close date for sold properties
  const formatCloseDate = () => {
    if (property?.CloseDate) {
      const date = new Date(property.CloseDate);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return null;
  };

  const propertyData = {
    daysOnMarket: calculateDaysOnMarket(),
    closeDate: formatCloseDate(),
    status: property?.StandardStatus || property?.MlsStatus || 'Active',
    transactionType: property?.TransactionType || 'For Sale',
    description: property?.PublicRemarks || property?.description || ''
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'rooms', label: 'Property rooms' },
    { id: 'mortgage', label: 'Mortgage calculator' },
    { id: 'schools', label: 'Nearby schools' },
    { id: 'amenities', label: 'Amenities' }
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
              <h3 className="font-bold mr-2 font-space-grotesk" style={{ color: '#293056' }}>About</h3>
              <span className="font-normal">{propertyData.description}</span>
            </div>
          </div>
        );
      
      case 'rooms':
        return (
          <div className="p-4 rounded-xl border-gray-200 border">
            <PropertyRooms property={property} />
          </div>
        );
      
      case 'mortgage':
        return (
          <div className="p-4 rounded-xl border-gray-200 border shadow-sm">
            <MortgageCalculator property={property} />
          </div>
        );
      
      case 'schools':
        return (
          <div className="p-4 rounded-xl border-gray-200 border shadow-sm">
            <NearbySchools propertyData={property} />
          </div>
        );
      
      case 'amenities':
        return (
          <div className="p-4 rounded-xl border-gray-200 border shadow-sm">
            <Amenities propertyData={propertyData} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto py-0">
      {/* Property Status Navigation */}
      <div className="flex flex-col items-start gap-6 w-full relative z-10">
        {/* Status Labels Section */}
        <div className="flex flex-row items-start gap-[22px] h-10">
          {/* Days on Market Badge - show only for active listings */}
          {propertyData.status === 'Active' && (
            <div className="flex items-center px-2 gap-2 w-[138px] h-10 bg-[#293056] rounded-xl">
              <span className="font-work-sans font-bold text-sm leading-6 tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis w-[122px]">
                {propertyData.daysOnMarket} Days on Market
              </span>
            </div>
          )}
          
          {/* Sold Status Badge - show only for sold/closed properties */}
          {(propertyData.status === 'Sold' || propertyData.status === 'Closed') && propertyData.closeDate && (
            <div className="flex items-center px-3 gap-2 min-w-fit h-10 bg-[#3E4784] rounded-xl">
              <span className="font-work-sans font-bold text-sm leading-6 tracking-tight text-white whitespace-nowrap">
                Sold on {propertyData.closeDate}
              </span>
            </div>
          )}
          
          {/* Leased Status Badge - show only for leased properties */}
          {propertyData.status === 'Leased' && propertyData.closeDate && (
            <div className="flex items-center px-3 gap-2 min-w-fit h-10 bg-[#3E4784] rounded-xl">
              <span className="font-work-sans font-bold text-sm leading-6 tracking-tight text-white whitespace-nowrap">
                Leased on {propertyData.closeDate}
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
                  index === 1 ? 'min-w-[163px]' :
                  index === 2 ? 'min-w-[202px]' :
                  index === 3 ? 'min-w-[158px]' :
                  index === 4 ? 'min-w-[112px]' :
                  'min-w-[173px]'
                } h-[50px]`}
                onClick={() => handleTabClick(tab.id)}
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

export default PropertyStatusTabs;