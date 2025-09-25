import React, { useState } from 'react';
import PropertyRooms from './PropertyRooms';
import MortgageCalculator from './MortgageCalculator';
import NearbySchools from './NearbySchools';
import Amenities from './Amenities';

const PropertyStatusTabs = ({ property, buildingData }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Comprehensive debugging for buildingData
  React.useEffect(() => {
    console.log('🏢 === PropertyStatusTabs Component Debug ===');
    console.log('🏢 Props received:', { property, buildingData });
    console.log('🏢 Building data type:', typeof buildingData);
    console.log('🏢 Building data is null/undefined?', buildingData === null || buildingData === undefined);
    console.log('🏢 Building data is empty object?', buildingData && Object.keys(buildingData).length === 0);

    if (buildingData) {
      console.log('🏢 Building data exists!');
      console.log('🏢 Building ID:', buildingData.id);
      console.log('🏢 Building Name:', buildingData.name);
      console.log('🏢 Building Address:', buildingData.address);
      console.log('🏢 Building Keys:', Object.keys(buildingData));
      console.log('🏢 Has amenities property?', 'amenities' in buildingData);
      console.log('🏢 Amenities value:', buildingData.amenities);
      console.log('🏢 Amenities is array?', Array.isArray(buildingData.amenities));
      console.log('🏢 Amenities length:', buildingData.amenities ? buildingData.amenities.length : 'N/A');
      console.log('🏢 Full building data object:', JSON.stringify(buildingData, null, 2));
    } else {
      console.log('⚠️ Building data is NOT present!');
      console.log('⚠️ This property does not have building data');
    }

    // Check property for building reference
    if (property) {
      console.log('🏠 Property has building_id?', property.building_id);
      console.log('🏠 Property has building?', property.building);
      console.log('🏠 Property keys:', Object.keys(property));
    }
  }, [buildingData, property]);

  // Calculate days on market from ListingContractDate to today
  const calculateDaysOnMarket = () => {
    // Debug: Log the property object to see structure
    console.log('🔍 Full property object:', property);
    console.log('🔍 Property keys available:', Object.keys(property || {}));
    
    // Look for ListingContractDate in various possible locations
    let listingDate = null;
    let dateSource = null;
    
    // Check all possible locations for ListingContractDate
    if (property?.ListingContractDate) {
      listingDate = property.ListingContractDate;
      dateSource = 'ListingContractDate';
    } else if (property?.listingContractDate) {
      listingDate = property.listingContractDate;
      dateSource = 'listingContractDate';
    } else if (property?.property?.ListingContractDate) {
      listingDate = property.property.ListingContractDate;
      dateSource = 'property.ListingContractDate';
    } else if (property?.property?.listingContractDate) {
      listingDate = property.property.listingContractDate;
      dateSource = 'property.listingContractDate';
    }
    
    console.log('📅 Date source:', dateSource, 'Value:', listingDate);
    
    // If we have a listing date, calculate days from that date to today
    if (listingDate) {
      try {
        // Parse the date string
        let parsedDate;
        
        // Handle different date formats
        if (typeof listingDate === 'string') {
          // If it's just YYYY-MM-DD format
          if (listingDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Add time component to avoid timezone issues
            parsedDate = new Date(listingDate + 'T00:00:00');
          } else {
            // Try direct parsing for ISO format
            parsedDate = new Date(listingDate);
          }
        } else {
          parsedDate = new Date(listingDate);
        }
        
        // Check if the date is valid
        if (!isNaN(parsedDate.getTime())) {
          // Get today's date
          const today = new Date();
          
          // Set both dates to midnight for accurate day calculation
          parsedDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          
          // Calculate the difference in milliseconds
          const diffInMs = today.getTime() - parsedDate.getTime();
          
          // Convert to days
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          
          console.log('📊 Days calculation:', {
            listingDate: listingDate,
            parsedDate: parsedDate.toDateString(),
            today: today.toDateString(),
            diffInDays: diffInDays,
            calculation: `${today.toDateString()} - ${parsedDate.toDateString()} = ${diffInDays} days`
          });
          
          // Return the calculated days (minimum 0)
          return Math.max(0, diffInDays);
        } else {
          console.warn('⚠️ Could not parse date:', listingDate);
        }
      } catch (error) {
        console.error('❌ Error parsing date:', error);
      }
    }
    
    // Try fallback to OriginalEntryTimestamp if no ListingContractDate
    const originalEntry = property?.OriginalEntryTimestamp || 
                         property?.originalEntryTimestamp ||
                         property?.property?.OriginalEntryTimestamp ||
                         property?.property?.originalEntryTimestamp;
    
    if (originalEntry) {
      console.log('📅 Using OriginalEntryTimestamp as fallback:', originalEntry);
      try {
        const entryDate = new Date(originalEntry);
        if (!isNaN(entryDate.getTime())) {
          const today = new Date();
          entryDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          const diffInMs = today.getTime() - entryDate.getTime();
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          console.log('📊 OriginalEntryTimestamp calculation:', diffInDays);
          return Math.max(0, diffInDays);
        }
      } catch (error) {
        console.error('❌ Error parsing OriginalEntryTimestamp:', error);
      }
    }
    
    // Check for pre-calculated DaysOnMarket field
    const existingDays = property?.DaysOnMarket || property?.daysOnMarket;
    if (existingDays !== undefined && existingDays !== null && existingDays !== '') {
      console.log('📊 Using existing DaysOnMarket field:', existingDays);
      return parseInt(existingDays) || 0;
    }
    
    // If no date information found, log warning and return 0
    console.warn('⚠️ No date information found for days on market calculation');
    console.log('Available property fields:', Object.keys(property || {}));
    
    // Return 0 instead of 1 when no date is found
    return 0;
  };

  // Format close date for sold properties
  const formatCloseDate = () => {
    const closeDate = property?.CloseDate || property?.closeDate;
    if (closeDate) {
      const date = new Date(closeDate);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return null;
  };

  const propertyData = {
    daysOnMarket: calculateDaysOnMarket(),
    closeDate: formatCloseDate(),
    status: property?.StandardStatus || property?.standardStatus || property?.MlsStatus || property?.mlsStatus || 'Active',
    transactionType: property?.TransactionType || property?.transactionType || 'For Sale',
    description: property?.PublicRemarks || property?.publicRemarks || property?.description || ''
  };

  // Debug building data
  console.log('📊 === Tab Building Check ===');
  console.log('📊 Building Data:', buildingData);
  console.log('📊 Building Data Type:', typeof buildingData);
  console.log('📊 Building Data Keys:', buildingData ? Object.keys(buildingData) : 'null');

  // Check amenities presence
  const hasAmenities = buildingData && buildingData.amenities && Array.isArray(buildingData.amenities) && buildingData.amenities.length > 0;
  const hasMaintenanceFeeAmenities = buildingData && buildingData.maintenance_fee_amenities && Array.isArray(buildingData.maintenance_fee_amenities) && buildingData.maintenance_fee_amenities.length > 0;

  console.log('📊 Has regular amenities:', hasAmenities);
  console.log('📊 Has maintenance fee amenities:', hasMaintenanceFeeAmenities);
  console.log('📊 Building exists:', !!buildingData);
  console.log('📊 Building ID:', buildingData?.id);
  console.log('📊 Building Name:', buildingData?.name);

  // Build tabs dynamically - only include amenities if building exists
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'rooms', label: 'Property rooms' },
    { id: 'mortgage', label: 'Mortgage calculator' },
    { id: 'schools', label: 'Nearby schools' }
  ];

  // Add amenities tab if building exists - even if amenities are empty, we want to show the tab
  // because the building might have amenities that just aren't loaded yet
  console.log('🎯 === AMENITIES TAB DECISION ===');
  console.log('🎯 Checking condition: buildingData && buildingData.id');
  console.log('🎯 buildingData exists?', !!buildingData);
  console.log('🎯 buildingData.id exists?', !!(buildingData && buildingData.id));
  console.log('🎯 buildingData.id value:', buildingData?.id);

  if (buildingData && buildingData.id) {
    tabs.push({ id: 'amenities', label: 'Amenities' });
    console.log('✅ AMENITIES TAB ADDED! Building ID:', buildingData.id);
    console.log('✅ Final tabs array:', tabs.map(t => t.id));
  } else {
    console.log('❌ AMENITIES TAB NOT ADDED!');
    console.log('❌ Reason: buildingData =', buildingData);
    console.log('❌ Reason: buildingData?.id =', buildingData?.id);
    console.log('❌ Final tabs array:', tabs.map(t => t.id));
  }

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
            <Amenities buildingData={buildingData} />
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
            <div className="flex items-center px-2 gap-2 min-w-[138px] h-10 bg-[#293056] rounded-xl">
              <span className="font-work-sans font-bold text-sm leading-6 tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis">
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