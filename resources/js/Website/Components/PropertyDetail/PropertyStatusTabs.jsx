import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import PropertyRooms from './PropertyRooms';
import MortgageCalculator from './MortgageCalculator';
import NearbySchools from './NearbySchools';
import Amenities from './Amenities';
import { usePropertyAiDescription } from '@/hooks/usePropertyAiDescription';

const PropertyStatusTabs = ({ property, buildingData, aiDescription: backendAiDescription, auth }) => {
  const { globalWebsite, website } = usePage().props;
  const brandColors = globalWebsite?.brand_colors || website?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || '#293056';
  const buttonPrimaryText = brandColors.button_primary_text || '#FFFFFF';

  const [activeTab, setActiveTab] = useState('overview');

  // Check if user is admin
  const isAdmin = auth?.user?.role === 'admin' || auth?.user?.is_admin === true;

  // AI Description integration
  const {
    loading: aiLoading,
    description: aiDescription,
    faqs: aiFaqs,
    error: aiError,
    generateDescription,
    generateFaqs,
    generateDescriptionAndFaqs,
    getAllContent,
    setDescription
  } = usePropertyAiDescription();

  // Get MLS ID from property
  const mlsId = property?.ListingKey || property?.listingKey || property?.MLS_NUMBER || property?.mls_number || '';

  // Track if generation is already in progress to prevent duplicates
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-load existing AI description when component mounts - PRIORITY #1
  useEffect(() => {
    // If we have AI description and FAQs from backend, use them immediately
    if (backendAiDescription) {
      if (backendAiDescription.overview || backendAiDescription.detailed) {
        setDescription({
          overview: backendAiDescription.overview,
          detailed: backendAiDescription.detailed
        });
      }
      if ((backendAiDescription.overview || backendAiDescription.detailed) && backendAiDescription.faqs) {
        return; // Both exist, no need to generate
      }
    }

    // PRIORITY: AI generation must happen FIRST before other content
    if (mlsId && !isGenerating) {
      setIsGenerating(true);

      // Quick check for existing content first
      getAllContent(mlsId).then((result) => {
        const hasDescription = result && result.description;
        const hasFaqs = result && result.faqs && result.faqs.length > 0;

        if (hasDescription && hasFaqs) {
          setIsGenerating(false);
        } else {
          // Generate missing content
          handleGenerateAiDescription();
        }
      }).catch((error) => {
        // If any error, immediately start AI generation
        handleGenerateAiDescription();
      });
    }
  }, [mlsId, backendAiDescription]);

  // Function to generate AI description and FAQs
  const handleGenerateAiDescription = async () => {
    if (!mlsId || isGenerating) {
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateDescriptionAndFaqs(mlsId, false); // Don't force regenerate
      // Result logging is handled inside generateDescriptionAndFaqs
    } catch (error) {
      console.error('Error generating AI content');
    } finally {
      setIsGenerating(false);
    }
  };


  // Calculate days on market from ListingContractDate to today
  const calculateDaysOnMarket = () => {
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
      try {
        const entryDate = new Date(originalEntry);
        if (!isNaN(entryDate.getTime())) {
          const today = new Date();
          entryDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          const diffInMs = today.getTime() - entryDate.getTime();
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          return Math.max(0, diffInDays);
        }
      } catch (error) {
        console.error('❌ Error parsing OriginalEntryTimestamp:', error);
      }
    }
    
    // Check for pre-calculated DaysOnMarket field
    const existingDays = property?.DaysOnMarket || property?.daysOnMarket;
    if (existingDays !== undefined && existingDays !== null && existingDays !== '') {
      return parseInt(existingDays) || 0;
    }
    
    // If no date information found, log warning and return 0
    console.warn('⚠️ No date information found for days on market calculation');
    
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

  // Check amenities presence
  const hasAmenities = buildingData && buildingData.amenities && Array.isArray(buildingData.amenities) && buildingData.amenities.length > 0;
  const hasMaintenanceFeeAmenities = buildingData && buildingData.maintenance_fee_amenities && Array.isArray(buildingData.maintenance_fee_amenities) && buildingData.maintenance_fee_amenities.length > 0;

  // Build tabs dynamically - only include amenities if building exists
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'rooms', label: 'Property rooms' },
    { id: 'mortgage', label: 'Mortgage calculator' },
    { id: 'schools', label: 'Nearby schools' }
  ];

  // Add amenities tab if building exists - even if amenities are empty, we want to show the tab
  // because the building might have amenities that just aren't loaded yet
  if (buildingData && buildingData.id) {
    tabs.push({ id: 'amenities', label: 'Amenities' });
  }

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        // Fallback to other AI description fields if overview is not available
        const displayDescription = aiDescription?.overview ||
                                  aiDescription?.detailed ||
                                  backendAiDescription?.overview ||
                                  backendAiDescription?.detailed ||
                                  property?.PublicRemarks ||
                                  property?.publicRemarks ||
                                  property?.description ||
                                  "Loading property description...";
        const isAiGenerated = !!(aiDescription?.overview || aiDescription?.detailed || backendAiDescription?.overview || backendAiDescription?.detailed);

        return (
          <div className="flex flex-col rounded-xl border-gray-200 border p-4 items-start gap-2 w-full max-w-[1280px]">
            <div className="w-full font-work-sans text-lg leading-7 tracking-tight text-[#252B37]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold mr-2 font-space-grotesk" style={{ color: '#293056' }}>About</h3>

                {/* AI Generation Controls */}
                <div className="flex items-center gap-2">
                  {isAdmin && isAiGenerated && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Generated
                    </span>
                  )}

                  {isAdmin && !aiLoading && isAiGenerated && (
                    <button
                      onClick={handleGenerateAiDescription}
                      className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-1"
                      title="Regenerate AI Description"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Regenerate
                    </button>
                  )}

                </div>
              </div>

              {/* Description Content */}
              <span className="font-normal block">
                {displayDescription || ''}
              </span>

              {/* Error Display */}
              {aiError && (
                <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AI Generation Error: {aiError}
                  </div>
                </div>
              )}
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
            <div className="flex items-center px-2 gap-2 min-w-[138px] h-10 rounded-xl" style={{ backgroundColor: buttonPrimaryBg }}>
              <span className="font-work-sans font-bold text-sm leading-6 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: buttonPrimaryText }}>
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