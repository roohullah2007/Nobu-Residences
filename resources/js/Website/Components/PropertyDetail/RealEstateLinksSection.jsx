import React, { useState } from 'react';

export default function RealEstateLinksSection() {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  // Parse link text and create search parameters
  const parseSearchLink = (linkText) => {
    const params = new URLSearchParams();
    const text = linkText.toLowerCase();

    // Parse bedrooms
    const bedMatch = text.match(/(\d+)\s*(?:bed|bedroom)/i);
    if (bedMatch) {
      params.append('bedrooms', bedMatch[1]);
    }

    // Parse property type
    if (text.includes('condo')) {
      params.append('property_sub_type', 'Condo Apartment');
      params.append('property_type', 'For Sale');
    } else if (text.includes('apartment')) {
      params.append('property_sub_type', 'Condo Apartment');
      params.append('property_type', 'For Sale');
    }

    // Parse price range/type
    if (text.includes('luxury')) {
      params.append('min_price', '1000000');
      params.append('property_type', 'For Sale');
    } else if (text.includes('cheap')) {
      params.append('max_price', '500000');
      params.append('property_type', 'For Sale');
    }

    // Parse sale/rent
    if (text.includes('for sale')) {
      params.append('property_type', 'For Sale');
    } else if (text.includes('for rent')) {
      params.append('property_type', 'For Rent');
    }

    // Extract location - everything after "in"
    const locationMatch = text.match(/in\s+(.+)$/i);
    if (locationMatch) {
      const location = locationMatch[1].trim();
      params.append('location', location);
      params.append('search_type', 'city');
    }

    return params.toString();
  };

  // Handle link click
  const handleLinkClick = (linkText) => {
    const searchParams = parseSearchLink(linkText);

    // Construct absolute URL
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/search?${searchParams}`;

    // Navigate to search page with parameters
    window.location.href = url;
  };

  return (
    <section className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-0">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Explore North Riverdale Section */}
          <div className="mb-12">
            <h2 className="text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6" style={{ color: '#293056' }}>Explore the North Riverdale Real Estate Market</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {/* Column 1 */}
              <div className="space-y-4">
                <button
                  onClick={() => handleLinkClick('2 bedroom condos for sale in North Riverdale')}
                  className="block text-left text-gray-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer w-full"
                >
                  2 bedroom condos for sale in North Riverdale
                </button>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick('2 bed apartments for sale in North Riverdale'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  2 bed apartments for sale in North Riverdale
                </a>
              </div>
              
              {/* Column 2 */}
              <div className="space-y-4">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( '1 bedroom condos for sale in North Riverdale'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  1 bedroom condos for sale in North Riverdale
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( '3 bed apartments for sale in North Riverdale'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  3 bed apartments for sale in North Riverdale
                </a>
              </div>
              
              {/* Column 3 */}
              <div className="space-y-4">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( '3 bedroom condos for sale in North Riverdale'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  3 bedroom condos for sale in North Riverdale
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'Cheap condos for sale in North Riverdale'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Cheap condos for sale in North Riverdale
                </a>
              </div>
              
              {/* Column 4 */}
              <div className="space-y-4">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( '1 bed apartments for sale in North Riverdale'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  1 bed apartments for sale in North Riverdale
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'Luxury condos for sale in North Riverdale'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
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
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in King West'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in King West
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Willowdale East'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Willowdale East
                </a>
              </div>
              
              {/* Column 2 */}
              <div className="space-y-4">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Mimico'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Mimico
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Bay St. Corridor'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Bay St. Corridor
                </a>
              </div>
              
              {/* Column 3 */}
              <div className="space-y-4">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in The Waterfront'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in The Waterfront
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Mount Pleasant West'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Mount Pleasant West
                </a>
              </div>
              
              {/* Column 4 */}
              <div className="space-y-4">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Church St. Corridor'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Church St. Corridor
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Yonge and Bloor'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Yonge and Bloor
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
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Entertainment District'); }}
                      className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      condos for sale in Entertainment District
                    </a>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in CityPlace'); }}
                      className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      condos for sale in CityPlace
                    </a>
                  </div>
                  
                  {/* Additional Column 2 */}
                  <div className="space-y-4">
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Liberty Village'); }}
                      className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      condos for sale in Liberty Village
                    </a>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Financial District'); }}
                      className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      condos for sale in Financial District
                    </a>
                  </div>
                  
                  {/* Additional Column 3 */}
                  <div className="space-y-4">
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in St. Lawrence'); }}
                      className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      condos for sale in St. Lawrence
                    </a>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Distillery District'); }}
                      className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      condos for sale in Distillery District
                    </a>
                  </div>
                  
                  {/* Additional Column 4 */}
                  <div className="space-y-4">
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Regent Park'); }}
                      className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      condos for sale in Regent Park
                    </a>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Corktown'); }}
                      className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      condos for sale in Corktown
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
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Richmond Hill'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Richmond Hill
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Pickering'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Pickering
                </a>
              </div>
              
              {/* Column 2 */}
              <div className="space-y-4">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Vaughan'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Vaughan
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Brampton'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Brampton
                </a>
              </div>
              
              {/* Column 3 */}
              <div className="space-y-4">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Markham'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Markham
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Ajax'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Ajax
                </a>
              </div>
              
              {/* Column 4 */}
              <div className="space-y-4">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Mississauga'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Mississauga
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleLinkClick( 'condos for sale in Aurora'); }}
                  className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  condos for sale in Aurora
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
