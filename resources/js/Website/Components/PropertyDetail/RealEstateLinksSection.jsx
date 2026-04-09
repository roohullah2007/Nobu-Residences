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

  // Slugify a string for URL segments (e.g. "King West" -> "king-west")
  const slugify = (s) =>
    (s || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  // Parse the descriptive link text and produce a SEO-friendly URL.
  // Example outputs:
  //   "Condos for sale in King West"  ->  /toronto/king-west/condos-for-sale
  //   "2 bedroom condos for sale in King West"
  //                                    ->  /toronto/king-west/2-bedroom-condos-for-sale?beds=2-2,2.1-2.9
  //   "Houses for sale in Mississauga" ->  /mississauga/condos-for-sale (city-only) — but we treat
  //                                        Mississauga as the city slug since the location IS the city.
  //   "Townhouses for sale in Markham" ->  /markham/townhouses-for-sale
  const parseSearchLink = (linkText) => {
    const text = linkText.toLowerCase();

    // Bedrooms
    const bedMatch = text.match(/(\d+)\s*(?:bed|bedroom)/i);
    const beds = bedMatch ? parseInt(bedMatch[1], 10) : null;

    // Property "kind" segment
    let kindSegment = 'condos';
    if (text.includes('townhouse')) kindSegment = 'townhouses';
    else if (text.includes('house')) kindSegment = 'houses';
    else if (text.includes('apartment')) kindSegment = 'apartments';
    else if (text.includes('condo')) kindSegment = 'condos';

    // Sale vs rent vs sold/leased
    let txnSegment = 'for-sale';
    let statusFilter = null;
    if (text.includes('sold')) {
      txnSegment = 'for-sale';
      statusFilter = 'Sold';
    } else if (text.includes('leased')) {
      txnSegment = 'for-rent';
      statusFilter = 'Leased';
    } else if (text.includes('for rent')) {
      txnSegment = 'for-rent';
    }

    // Extract location ("everything after 'in '")
    const locationMatch = text.match(/in\s+(.+)$/i);
    const locationLabel = locationMatch ? locationMatch[1].trim() : '';
    const locationSlug = slugify(locationLabel);

    // Cities we treat as their own URL prefix (otherwise the location is a
    // neighbourhood inside Toronto).
    const knownCities = new Set([
      'toronto', 'mississauga', 'oakville', 'burlington', 'milton', 'brampton',
      'caledon', 'vaughan', 'richmond-hill', 'markham', 'aurora', 'pickering',
      'ajax', 'whitby', 'oshawa', 'etobicoke', 'scarborough', 'north-york',
    ]);

    let citySlug = 'toronto';
    let neighbourhoodSlug = '';
    if (knownCities.has(locationSlug)) {
      citySlug = locationSlug;
    } else if (locationSlug) {
      neighbourhoodSlug = locationSlug;
    }

    // Build the descriptive last segment, prefixing with bedroom count when
    // relevant: "2-bedroom-condos-for-sale", "condos-for-sale", etc.
    const bedroomPrefix = beds ? `${beds}-bedroom-` : '';
    const lastSegment = `${bedroomPrefix}${kindSegment}-${txnSegment}`;

    // Bedroom query string in the format the user requested:
    //   beds=2-2,2.1-2.9   (covers exact 2-bed and 2 + den variants)
    const search = new URLSearchParams();
    if (beds) {
      search.append('beds', `${beds}-${beds},${beds}.1-${beds}.9`);
    }
    if (statusFilter) {
      search.append('property_status', statusFilter);
    }

    const path = neighbourhoodSlug
      ? `/${citySlug}/${neighbourhoodSlug}/${lastSegment}`
      : `/${citySlug}/${lastSegment}`;

    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
  };

  // Generate search URL
  const generateSearchUrl = (linkText) => parseSearchLink(linkText);

  // Handle link click — let the SEO route handle it via Inertia
  const handleLinkClick = (e, linkText) => {
    e.preventDefault();
    router.get(parseSearchLink(linkText));
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