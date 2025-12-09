import React, { useState } from 'react';

export default function RealEstateLinksSection() {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <section className=" bg-white">
      <div className="mx-auto px-4 md:px-0">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Explore North Riverdale Section */}
          <div className="mb-12">
            <h2 className="text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6" style={{ color: '#293056' }}>Explore the North Riverdale Real Estate Market</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {/* Column 1 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  2 bedroom condos for sale in North Riverdale
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  2 bed apartments for sale in North Riverdale
                </a>
              </div>
              
              {/* Column 2 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  1 bedroom condos for sale in North Riverdale
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  3 bed apartments for sale in North Riverdale
                </a>
              </div>
              
              {/* Column 3 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  3 bedroom condos for sale in North Riverdale
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Cheap condos for sale in North Riverdale
                </a>
              </div>
              
              {/* Column 4 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  1 bed apartments for sale in North Riverdale
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Luxury condos for sale in North Riverdale
                </a>
              </div>
            </div>
          </div>
          
          {/* Popular Toronto Searches Section */}
          <div className="mb-12">
            <h2 className="text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6" style={{ color: '#293056' }}>Popular Toronto Searches</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {/* Column 1 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in King West
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Willowdale East
                </a>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Mimico
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Bay St. Corridor
                </a>
              </div>

              {/* Column 3 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in The Waterfront
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Mount Pleasant West
                </a>
              </div>

              {/* Column 4 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Church St. Corridor
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Yonge and Bloor
                </a>
              </div>
            </div>
            
            {/* Show More Button - Only show when content is collapsed */}
            {!showMore && (
              <div className="mt-6">
                <button 
                  onClick={toggleShowMore}
                  className="flex items-center text-gray-600 hover:text-gray-700 transition-colors duration-200 font-medium"
                >
                  <span className="mr-2">Show more</span>
                  <svg 
                    className="w-4 h-4 transform transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            )}
            
            {/* Additional Content */}
            {showMore && (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {/* Additional Column 1 */}
                  <div className="space-y-4">
                    <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                      Condos for sale in Entertainment District
                    </a>
                    <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                      Condos for sale in CityPlace
                    </a>
                  </div>

                  {/* Additional Column 2 */}
                  <div className="space-y-4">
                    <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                      Condos for sale in Liberty Village
                    </a>
                    <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                      Condos for sale in Financial District
                    </a>
                  </div>

                  {/* Additional Column 3 */}
                  <div className="space-y-4">
                    <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                      Condos for sale in St. Lawrence
                    </a>
                    <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                      Condos for sale in Distillery District
                    </a>
                  </div>

                  {/* Additional Column 4 */}
                  <div className="space-y-4">
                    <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                      Condos for sale in Regent Park
                    </a>
                    <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                      Condos for sale in Corktown
                    </a>
                  </div>
                </div>
                
                {/* Show Less Button - Show after expanded content */}
                <div className="mt-6">
                  <button 
                    onClick={toggleShowMore}
                    className="flex items-center text-gray-600 hover:text-gray-700 transition-colors duration-200 font-medium"
                  >
                    <span className="mr-2">Show less</span>
                    <svg 
                      className="w-4 h-4 transform transition-transform duration-200 rotate-180" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Nearby Cities Section */}
          <div className="mb-12">
            <h2 className="text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6" style={{ color: '#293056' }}>Nearby Cities</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {/* Column 1 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Richmond Hill
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Pickering
                </a>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Vaughan
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Brampton
                </a>
              </div>

              {/* Column 3 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Markham
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Ajax
                </a>
              </div>

              {/* Column 4 */}
              <div className="space-y-4">
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Mississauga
                </a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200">
                  Condos for sale in Aurora
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
