import React from 'react';

const PriceHistory = ({ propertyData = null }) => {
  // Get property image from propertyData - no fallback
  const getPropertyImage = () => {
    if (propertyData?.Images && Array.isArray(propertyData.Images) && propertyData.Images.length > 0) {
      const firstImage = propertyData.Images[0];
      if (firstImage?.MediaURL) {
        return firstImage.MediaURL;
      }
    }
    // No fallback - return null if no image
    return null;
  };

  const propertyImage = getPropertyImage();
  
  return (
    <div className="w-full p-4 rounded-xl border-gray-200 border shadow-sm max-w-[1280px] mx-auto">
      {/* Price History */}
      <div className="bg-white rounded-lg p-0">
        <h2 className="text-[24px] font-bold mb-1 font-space-grotesk" style={{ color: '#293056' }}>Price History</h2>
        <p className="text-gray-600 text-sm mb-4">Discover the price history for 3002 - 33 Mill Street</p>
      </div>

      {/* Login Requirement Box */}
      <div className="border border-[#037888] rounded-lg font-medium px-4 py-2 text-sm mb-4 bg-[#EFF7F8]">
        <p>Real estate boards require you to be signed in to access price history.
          <a href="#" className="font-medium text-[#037888]"> Sign up</a> or
          <a href="#" className="font-medium text-[#037888]"> Log in</a>
        </p>
      </div>

      {/* Price History Table */}
      <div className="flex flex-col px-2 space-y-2 overflow-hidden">
        {/* Unblurred Row */}
        <div className="flex flex-col md:flex-row shadow-sm bg-[#F8F8F8] rounded-lg">
          <div className="w-full md:w-[69px] p-3 md:py-3 md:px-2">
            {propertyImage ? (
              <img 
                src={propertyImage} 
                alt="Property" 
                className="w-full md:w-full h-[120px] md:h-[52px] object-cover rounded-lg"
                onError={(e) => {
                  // Hide image on error instead of showing fallback
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full md:w-full h-[120px] md:h-[52px] bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row md:space-x-4 md:justify-between md:items-center p-4 pt-0 md:pt-4 w-full space-y-3 md:space-y-0">
            <div className="flex flex-col">
              <div className="text-sm text-gray-600 mb-1">Jul 08, 2025</div>
              <div className="text-sm text-gray-600">29 days ago</div>
            </div>
            <div className="flex flex-col">
              <div className="text-red-500 font-medium text-sm mb-1">Expired</div>
              <div className="text-sm text-gray-600">Listed for $749,900 on May 08, 2025</div>
            </div>
            <div className="flex items-center justify-start md:justify-center text-sm text-gray-600">
              61 days on market
            </div>
          </div>
        </div>

        {/* Blurred Row (Original) */}
        <div className="flex flex-col md:flex-row shadow-sm bg-[#F8F8F8] rounded-lg">
          <div className="w-full md:w-[69px] p-3 md:py-3 md:px-2">
            {propertyImage ? (
              <img 
                src={propertyImage} 
                alt="Property" 
                className="w-full md:w-full h-[120px] md:h-[52px] object-cover rounded-lg"
                onError={(e) => {
                  // Hide image on error instead of showing fallback
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full md:w-full h-[120px] md:h-[52px] bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row md:space-x-4 md:justify-between md:items-center p-4 pt-0 md:pt-4 space-y-3 md:space-y-0">
            <div className="flex flex-col md:justify-between">
              <div className="bg-gray-200 mt-2 md:mt-4 rounded h-6 w-32 blur-sm"></div>
            </div>
            <div className="flex flex-col">
              <div className="text-red-500 font-medium mb-1">Login Required</div>
              <div className="text-sm">Listed for <span className="bg-gray-200 rounded px-4 md:px-10 blur-sm">price</span> on <span
                  className="bg-gray-200 rounded px-4 md:px-10 blur-sm">date</span></div>
            </div>
            <div className="flex items-center justify-start md:justify-center text-sm">
              <div className="md:ml-auto">Not Available</div>
            </div>
          </div>
        </div>

        <button className="w-full border border-gray-200 text-[#263238] py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
          View full listing history
        </button>
      </div>
    </div>
  );
};

export default PriceHistory;