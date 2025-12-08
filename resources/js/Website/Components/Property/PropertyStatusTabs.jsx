import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import PropertyRooms from './PropertyRooms';
import MortgageCalculator from './MortgageCalculator';
import NearbySchools from './NearbySchools';
import Amenities from './Amenities';

const PropertyStatusTabs = () => {
  const { globalWebsite, website } = usePage().props;
  const brandColors = globalWebsite?.brand_colors || website?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || '#293056';
  const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';

  const [activeTab, setActiveTab] = useState('overview');

  const propertyData = {
    daysOnMarket: 25,
    saleDate: 'Apr 25, 2025',
    status: 'Sold',
    description: 'This is 2nd Bedroom Room Rental. At Luxury and Fashionable Condo alongside world-renowned Nobu Hospitality, state-of-the-art indoor and outdoor amenities including ground floor commercial retail, flexible private social function and meeting space, a state-of-the-art fitness centre and Zen Garden outdoor terrace. All Luxury Finishes, Custom Made Rolling Blinds. Tenant Has Own Bathroom, Sharing Living Room, Kitchen and Laundry. Steps to CN Tower, Rogers Centre, Subways.'
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'rooms', label: 'Property rooms' },
    { id: 'mortgage', label: 'Mortgage calculator' },
    { id: 'schools', label: 'Nearby schools' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'neighbourhoods', label: 'Neighbourhoods' }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="flex flex-col items-start gap-2 w-full max-w-[1280px]">
            <div className="w-full font-space-grotesk text-lg leading-7 tracking-tight text-[#252B37]">
              <span className="font-bold mr-2">About</span>
              <span className="font-normal">{propertyData.description}</span>
            </div>
          </div>
        );
      
      case 'rooms':
        return (
          <div className="py-6 rounded-xl shadow-sm">
            <PropertyRooms />
          </div>
        );
      
      case 'mortgage':
        return (
          <div className="py-6 rounded-xl shadow-sm">
            <MortgageCalculator />
          </div>
        );
      
      case 'schools':
        return (
          <div className="py-6 rounded-xl shadow-sm">
            <NearbySchools />
          </div>
        );
      
      case 'amenities':
        return (
          <div className="py-6">
            <Amenities propertyData={propertyData} />
          </div>
        );
      
      case 'neighbourhoods':
        return (
          <div className="p-8 bg-white rounded-xl shadow-sm">
            <h3 className="font-red-hat font-bold text-2xl text-[#252B37] mb-5">Neighbourhood Overview</h3>
            <div className="flex flex-col gap-6">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h4 className="font-red-hat font-bold text-lg text-[#293056] mb-3">King West</h4>
                <p className="text-[#535862] leading-relaxed">King West is one of Toronto's most vibrant neighborhoods, known for its entertainment district, fine dining, and luxury condominiums. The area offers easy access to the financial district and is home to many of the city's best restaurants and nightlife venues.</p>
              </div>
              
              <div>
                <h4 className="font-red-hat font-bold text-lg text-[#293056] mb-4">What's Nearby</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'CN Tower', time: '5 min walk' },
                    { name: 'Rogers Centre', time: '3 min walk' },
                    { name: 'Union Station', time: '8 min walk' },
                    { name: 'St. Lawrence Market', time: '12 min walk' },
                    { name: 'Harbourfront', time: '10 min walk' },
                    { name: 'Financial District', time: '15 min walk' }
                  ].map((place, index) => (
                    <div key={index} className="flex flex-col bg-white p-4 rounded-md border-l-4 border-[#293056]">
                      <strong className="text-[#293056] mb-1">{place.name}</strong>
                      <span className="text-[#535862] text-sm">{place.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-red-hat font-bold text-lg text-[#293056] mb-4">Neighbourhood Stats</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: '9.2/10', label: 'Walk Score' },
                    { value: '8.8/10', label: 'Transit Score' },
                    { value: '7.5/10', label: 'Bike Score' }
                  ].map((stat, index) => (
                    <div key={index} className="flex flex-col items-center bg-white p-5 rounded-lg text-center">
                      <span className="text-2xl font-bold text-[#3E4784] mb-1">{stat.value}</span>
                      <span className="text-[#535862] text-sm">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-5 py-0">
      {/* Property Status Navigation */}
      <div className="flex flex-col items-start gap-6 w-full relative z-10">
        {/* Status Labels Section */}
        <div className="flex flex-row items-start gap-[22px] h-10">
          {/* Days on Market Badge */}
          <div className="flex items-center px-2 gap-2 w-[138px] h-10 rounded-xl" style={{ backgroundColor: buttonPrimaryBg }}>
            <span className="font-work-sans font-bold text-sm leading-6 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-[122px]" style={{ color: buttonPrimaryText }}>
              {propertyData.daysOnMarket} Days on Market
            </span>
          </div>
          
          {/* Sold Status Badge */}
          <div className="flex items-center px-2 gap-2 w-[151px] h-10 bg-[#3E4784] rounded-xl">
            <span className="font-work-sans font-bold text-sm leading-6 tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis w-[135px]">
              {propertyData.status} on {propertyData.saleDate}
            </span>
          </div>
        </div>
        
        {/* Navigation Tabs Section */}
        <div className="flex flex-col items-start gap-[18px] w-full">
          <div className="flex flex-row items-center gap-[14px] h-[50px] overflow-x-auto flex-wrap max-w-full">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                className={`flex justify-center items-center p-2.5 cursor-pointer transition-all duration-300 border-b ${
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
      
      <style jsx>{`
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
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .flex-row.items-center.gap-\\[14px\\] {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            height: auto;
          }
          
          .min-w-\\[108px\\], .min-w-\\[163px\\], .min-w-\\[202px\\], .min-w-\\[158px\\], .min-w-\\[112px\\], .min-w-\\[173px\\] {
            min-width: auto;
            width: 100%;
            justify-content: flex-start;
            padding: 8px 12px;
            height: 40px;
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
