import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function RealEstateLinksSection() {
  const [showMore, setShowMore] = useState(false);

  // GTA Real Estate Links Data
  const gtaLinks = {
    "Popular Toronto Neighborhoods": [
      "Condos for sale in Yorkville",
      "Condos for sale in The Annex",
      "Houses for sale in Rosedale",
      "Condos for sale in Forest Hill"
    ],
    "West GTA": [
      "Houses for sale in Mississauga",
      "Condos for sale in Oakville",
      "Townhouses for sale in Burlington",
      "Condos for sale in Etobicoke"
    ],
    "North GTA": [
      "Houses for sale in Richmond Hill",
      "Condos for sale in Vaughan",
      "Townhouses for sale in Markham",
      "Houses for sale in Aurora"
    ],
    "East GTA": [
      "Houses for sale in Scarborough",
      "Condos for sale in North York",
      "Townhouses for sale in Pickering",
      "Condos for sale in Ajax"
    ]
  };

  // Popular Toronto Searches
  const popularSearches = {
    "Downtown Core": [
      "condos for sale in King West",
      "condos for sale in Bay St. Corridor",
      "condos for sale in Entertainment District",
      "condos for sale in Financial District",
      "recently sold condos in King West",
      "recently leased condos in Entertainment District"
    ],
    "West Toronto": [
      "condos for sale in Liberty Village",
      "condos for sale in CityPlace",
      "condos for sale in Mimico",
      "condos for sale in The Waterfront"
    ],
    "East Toronto": [
      "condos for sale in St. Lawrence",
      "condos for sale in Distillery District",
      "condos for sale in Regent Park",
      "condos for sale in Corktown"
    ],
    "Central Toronto": [
      "condos for sale in Church St. Corridor",
      "condos for sale in Yonge and Bloor",
      "condos for sale in Mount Pleasant West",
      "condos for sale in Willowdale East"
    ],
    "Midtown Toronto": [
      "condos for sale in Davisville",
      "condos for sale in Yonge and Eglinton",
      "condos for sale in Lawrence Park",
      "condos for sale in Leaside"
    ],
    "North York": [
      "condos for sale in Sheppard and Yonge",
      "condos for sale in Bayview Village",
      "condos for sale in Don Mills",
      "condos for sale in York Mills"
    ],
    "Etobicoke": [
      "condos for sale in Humber Bay",
      "condos for sale in Islington Village",
      "condos for sale in Royal York",
      "condos for sale in The Kingsway"
    ],
    "Scarborough": [
      "condos for sale in Scarborough Town Centre",
      "condos for sale in Birch Cliff",
      "condos for sale in Cliffside",
      "condos for sale in Guildwood"
    ]
  };

  // Nearby Cities
  const nearbyCities = {
    "York Region": [
      "condos for sale in Richmond Hill",
      "condos for sale in Vaughan",
      "condos for sale in Markham",
      "condos for sale in Aurora"
    ],
    "Durham Region": [
      "condos for sale in Pickering",
      "condos for sale in Ajax",
      "condos for sale in Whitby",
      "condos for sale in Oshawa"
    ],
    "Peel Region": [
      "condos for sale in Mississauga",
      "condos for sale in Brampton",
      "condos for sale in Caledon",
      "townhouses for sale in Mississauga"
    ],
    "Halton Region": [
      "condos for sale in Oakville",
      "condos for sale in Burlington",
      "condos for sale in Milton",
      "townhouses for sale in Oakville"
    ]
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

    // Parse property type - must match backend expectations
    if (text.includes('condo')) {
      params.append('property_sub_type', 'Condo Apartment');
    } else if (text.includes('apartment')) {
      params.append('property_sub_type', 'Condo Apartment');
    } else if (text.includes('townhouse')) {
      params.append('property_sub_type', 'Condo Townhouse');
    } else if (text.includes('house')) {
      params.append('property_sub_type', 'Detached');
    }

    // Parse price range/type
    if (text.includes('luxury')) {
      params.append('min_price', '1000000');
    } else if (text.includes('cheap')) {
      params.append('max_price', '500000');
    }

    // Parse sale/rent/sold/leased
    if (text.includes('sold')) {
      params.append('property_type', 'For Sale');
      params.append('property_status', 'Sold');
    } else if (text.includes('leased')) {
      params.append('property_type', 'For Rent');
      params.append('property_status', 'Leased');
    } else if (text.includes('for sale')) {
      params.append('property_type', 'For Sale');
    } else if (text.includes('for rent')) {
      params.append('property_type', 'For Rent');
    } else {
      // Default to For Sale if not specified
      params.append('property_type', 'For Sale');
    }

    // Extract location - everything after "in"
    const locationMatch = text.match(/in\s+(.+)$/i);
    if (locationMatch) {
      const location = locationMatch[1].trim();
      params.append('location', location);
      // Set search_type to global to search in all fields (city, address, postal)
      params.append('search_type', 'global');
    }

    return params.toString();
  };

  // Generate search URL
  const generateSearchUrl = (linkText) => {
    const searchParams = parseSearchLink(linkText);
    return `/search?${searchParams}`;
  };

  // Handle link click
  const handleLinkClick = (e, linkText) => {
    e.preventDefault();
    const searchParams = parseSearchLink(linkText);
    // Navigate to search page with parameters using Inertia router
    router.get(`/search?${searchParams}`);
  };

  // Render link component
  const RenderLink = ({ text }) => (
    <a
      href={generateSearchUrl(text)}
      onClick={(e) => handleLinkClick(e, text)}
      className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
    >
      {text}
    </a>
  );

  return (
    <section className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-0">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Explore Greater Toronto Area Section */}
          <div className="mb-12">
            <h2 className="text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6" style={{ color: '#293056' }}>
              Explore the Greater Toronto Area Real Estate Market
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {Object.entries(gtaLinks).map(([category, links], index) => (
                <div key={index} className="space-y-4">
                  {links.map((link, linkIndex) => (
                    <RenderLink key={linkIndex} text={link} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Popular Toronto Searches Section */}
          <div className="mb-12">
            <h2 className="text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6" style={{ color: '#293056' }}>
              Popular Toronto Searches
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {Object.entries(popularSearches).slice(0, showMore ? 8 : 4).map(([category, links], index) => (
                <div key={index} className="space-y-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{category}</h3>
                  {links.slice(0, 4).map((link, linkIndex) => (
                    <RenderLink key={linkIndex} text={link} />
                  ))}
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            <div className="mt-6">
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center text-gray-600 hover:text-gray-700 transition-colors duration-200 font-medium"
              >
                <span className="mr-2">{showMore ? 'Show less' : 'Show more'}</span>
                <svg
                  className={`w-4 h-4 transform transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Nearby Cities Section */}
          <div className="mb-12">
            <h2 className="text-lg md:text-2xl font-bold font-space-grotesk leading-tight mb-6" style={{ color: '#293056' }}>
              Nearby Cities
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {Object.entries(nearbyCities).map(([category, links], index) => (
                <div key={index} className="space-y-4">
                  {links.map((link, linkIndex) => (
                    <RenderLink key={linkIndex} text={link} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}