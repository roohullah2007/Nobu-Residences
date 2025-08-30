import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function MerchandiseLofts({ propertyData }) {
  const [buildingData, setBuildingData] = useState(null);
  const [mlsCounts, setMlsCounts] = useState({ for_sale: 0, for_rent: 0 });
  const [loading, setLoading] = useState(true);

  // Extract street number and name from property data
  const extractAddress = () => {
    if (!propertyData) return null;
    
    // Try to get street number and name from different possible fields
    const streetNumber = propertyData.StreetNumber || propertyData.streetNumber || '';
    const streetName = propertyData.StreetName || propertyData.streetName || '';
    
    // If we have both, return them
    if (streetNumber && streetName) {
      return { streetNumber, streetName };
    }
    
    // Try to parse from full address if available
    const fullAddress = propertyData.address || propertyData.StreetAddress || '';
    if (fullAddress) {
      // Match pattern like "123 Main Street" or "123-456 Main Street"
      const match = fullAddress.match(/^(\d+)(?:-\d+)?\s+(.+?)(?:\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Court|Ct|Place|Pl|Lane|Ln|Way))?/i);
      if (match) {
        return {
          streetNumber: match[1],
          streetName: match[2]
        };
      }
    }
    
    return null;
  };

  useEffect(() => {
    const fetchBuildingData = async () => {
      const address = extractAddress();
      
      if (!address || !address.streetNumber || !address.streetName) {
        setLoading(false);
        return;
      }

      try {
        // Fetch building data
        const buildingResponse = await fetch(`/api/buildings/find-by-address?street_number=${address.streetNumber}&street_name=${encodeURIComponent(address.streetName)}`);
        const buildingResult = await buildingResponse.json();
        
        if (buildingResult.success && buildingResult.data) {
          setBuildingData(buildingResult.data);
        }

        // Fetch MLS counts
        const mlsResponse = await fetch(`/api/buildings/count-mls-listings?street_number=${address.streetNumber}&street_name=${encodeURIComponent(address.streetName)}`);
        const mlsResult = await mlsResponse.json();
        
        if (mlsResult.success) {
          setMlsCounts(mlsResult.data);
        }
      } catch (error) {
        console.error('Error fetching building data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingData();
  }, [propertyData]);

  // Don't render if no building data found
  if (!loading && !buildingData) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <section>
        <div className="mx-auto md:h-[268px] max-w-[1280px]">
          <div className="bg-white rounded-lg md:rounded-xl border shadow-md overflow-hidden h-full animate-pulse">
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-[330px] bg-gray-200"></div>
              <div className="flex-1 p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-16 bg-gray-200 rounded mb-6"></div>
                <div className="flex gap-4">
                  <div className="flex-1 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Use building data only - no fallbacks
  const buildingName = buildingData?.name || 'The Building';
  const buildingAddress = buildingData?.address || extractAddress()?.streetNumber + ' ' + extractAddress()?.streetName;
  const buildingImage = buildingData?.main_image || buildingData?.images?.[0] || null;
  const buildingId = buildingData?.id;

  return (
    <section>
      <div className="mx-auto md:h-[268px] max-w-[1280px]">
        <div className="bg-white rounded-lg md:rounded-xl border shadow-md overflow-hidden h-full">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left side - Image */}
            <div className="md:w-[330px]">
              {buildingImage ? (
                <img 
                  src={buildingImage}
                  alt={buildingName}
                  className="w-full h-48 md:h-full object-cover"
                  onError={(e) => {
                    // Hide image on error instead of showing fallback
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-48 md:h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            
            {/* Right side - Content */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2 font-space-grotesk" style={{ color: '#293056' }}>
                  {buildingName}
                </h2>
                <p className="text-gray-600 mb-2 text-sm md:text-base">
                  {buildingAddress}
                </p>
                <p className="text-gray-700 mb-6 text-sm md:text-base">
                  Browse all listings at {buildingName} — condos for sale and rent at {buildingAddress}.
                </p>
              </div>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                {buildingId ? (
                  <>
                    <Link 
                      href={`/search?building_id=${buildingId}&transaction_type=rent`}
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-orange-400 rounded-full text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors duration-200 font-medium text-sm md:text-base text-center"
                    >
                      {mlsCounts.for_rent || 0} for rent
                    </Link>
                    <Link 
                      href={`/search?building_id=${buildingId}&transaction_type=sale`}
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm md:text-base text-center"
                    >
                      {mlsCounts.for_sale || 0} for sale
                    </Link>
                  </>
                ) : (
                  <>
                    <button 
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-orange-400 rounded-full text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors duration-200 font-medium text-sm md:text-base"
                      onClick={() => window.location.href = `/search?address=${encodeURIComponent(buildingAddress)}&transaction_type=rent`}
                    >
                      {mlsCounts.for_rent || 0} for rent
                    </button>
                    <button 
                      className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm md:text-base"
                      onClick={() => window.location.href = `/search?address=${encodeURIComponent(buildingAddress)}&transaction_type=sale`}
                    >
                      {mlsCounts.for_sale || 0} for sale
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}