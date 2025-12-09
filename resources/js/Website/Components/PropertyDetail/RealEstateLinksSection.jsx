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
      "Condos for sale in King West",
      "Condos for sale in Bay St. Corridor",
      "Condos for sale in Entertainment District",
      "Condos for sale in Financial District",
      "Recently sold condos in King West",
      "Recently leased condos in Entertainment District"
    ],
    "West Toronto": [
      "Condos for sale in Liberty Village",
      "Condos for sale in CityPlace",
      "Condos for sale in Mimico",
      "Condos for sale in The Waterfront"
    ],
    "East Toronto": [
      "Condos for sale in St. Lawrence",
      "Condos for sale in Distillery District",
      "Condos for sale in Regent Park",
      "Condos for sale in Corktown"
    ],
    "Central Toronto": [
      "Condos for sale in Church St. Corridor",
      "Condos for sale in Yonge and Bloor",
      "Condos for sale in Mount Pleasant West",
      "Condos for sale in Willowdale East"
    ],
    "Midtown Toronto": [
      "Condos for sale in Davisville",
      "Condos for sale in Yonge and Eglinton",
      "Condos for sale in Lawrence Park",
      "Condos for sale in Leaside"
    ],
    "North York": [
      "Condos for sale in Sheppard and Yonge",
      "Condos for sale in Bayview Village",
      "Condos for sale in Don Mills",
      "Condos for sale in York Mills"
    ],
    "Etobicoke": [
      "Condos for sale in Humber Bay",
      "Condos for sale in Islington Village",
      "Condos for sale in Royal York",
      "Condos for sale in The Kingsway"
    ],
    "Scarborough": [
      "Condos for sale in Scarborough Town Centre",
      "Condos for sale in Birch Cliff",
      "Condos for sale in Cliffside",
      "Condos for sale in Guildwood"
    ]
  };

  // Nearby Cities
  const nearbyCities = {
    "York Region": [
      "Condos for sale in Richmond Hill",
      "Condos for sale in Vaughan",
      "Condos for sale in Markham",
      "Condos for sale in Aurora"
    ],
    "Durham Region": [
      "Condos for sale in Pickering",
      "Condos for sale in Ajax",
      "Condos for sale in Whitby",
      "Condos for sale in Oshawa"
    ],
    "Peel Region": [
      "Condos for sale in Mississauga",
      "Condos for sale in Brampton",
      "Condos for sale in Caledon",
      "Townhouses for sale in Mississauga"
    ],
    "Halton Region": [
      "Condos for sale in Oakville",
      "Condos for sale in Burlington",
      "Condos for sale in Milton",
      "Townhouses for sale in Oakville"
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