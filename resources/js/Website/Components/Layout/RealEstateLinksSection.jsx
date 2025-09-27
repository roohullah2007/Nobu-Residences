import { useState } from 'react';

const RealEstateLinksSection = () => {
    const [showMore, setShowMore] = useState(false);

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };

    // North Riverdale real estate links
    const northRiverdaleLinks = [
        {
            column: 1,
            links: [
                "2 bedroom condos for sale in North Riverdale",
                "2 bed apartments for sale in North Riverdale"
            ]
        },
        {
            column: 2,
            links: [
                "1 bedroom condos for sale in North Riverdale",
                "3 bed apartments for sale in North Riverdale"
            ]
        },
        {
            column: 3,
            links: [
                "3 bedroom condos for sale in North Riverdale",
                "Cheap condos for sale in North Riverdale"
            ]
        },
        {
            column: 4,
            links: [
                "1 bed apartments for sale in North Riverdale",
                "Luxury condos for sale in North Riverdale"
            ]
        }
    ];

    // Popular Toronto searches
    const torontoSearches = [
        {
            column: 1,
            links: [
                "condos for sale in King West",
                "condos for sale in Willowdale East"
            ]
        },
        {
            column: 2,
            links: [
                "condos for sale in Mimico",
                "condos for sale in Bay St. Corridor"
            ]
        },
        {
            column: 3,
            links: [
                "condos for sale in The Waterfront",
                "condos for sale in Mount Pleasant West"
            ]
        },
        {
            column: 4,
            links: [
                "condos for sale in Church St. Corridor",
                "condos for sale in Yonge and Bloor"
            ]
        }
    ];

    // Additional Toronto searches (hidden by default)
    const additionalTorontoSearches = [
        {
            column: 1,
            links: [
                "condos for sale in Entertainment District",
                "condos for sale in CityPlace"
            ]
        },
        {
            column: 2,
            links: [
                "condos for sale in Liberty Village",
                "condos for sale in Financial District"
            ]
        },
        {
            column: 3,
            links: [
                "condos for sale in St. Lawrence",
                "condos for sale in Distillery District"
            ]
        },
        {
            column: 4,
            links: [
                "condos for sale in Regent Park",
                "condos for sale in Corktown"
            ]
        }
    ];

    // Nearby cities
    const nearbyCities = [
        {
            column: 1,
            links: [
                "condos for sale in Richmond Hill",
                "condos for sale in Pickering"
            ]
        },
        {
            column: 2,
            links: [
                "condos for sale in Vaughan",
                "condos for sale in Brampton"
            ]
        },
        {
            column: 3,
            links: [
                "condos for sale in Markham",
                "condos for sale in Ajax"
            ]
        },
        {
            column: 4,
            links: [
                "condos for sale in Mississauga",
                "condos for sale in Aurora"
            ]
        }
    ];

    const LinkGrid = ({ data, className = "" }) => (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 ${className}`}>
            {data.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-4">
                    {column.links.map((link, linkIndex) => (
                        <a 
                            key={linkIndex}
                            href="#" 
                            className="block text-gray-700 hover:text-blue-600 transition-colors duration-200"
                        >
                            {link}
                        </a>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <div className="real-estate-links-container mx-auto max-w-[1200px]">
            {/* Explore North Riverdale Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Explore the North Riverdale Real Estate Market
                </h2>
                
                <LinkGrid data={northRiverdaleLinks} />
            </section>
            
            {/* Popular Toronto Searches Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Popular Toronto Searches
                </h2>
                
                <LinkGrid data={torontoSearches} />
                
                {/* Show More Button */}
                <div className="mt-6">
                    <button 
                        onClick={toggleShowMore}
                        className="flex items-center transition-colors duration-200 font-medium focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 bg-none border-none cursor-pointer p-0 text-left"
                        style={{ color: '#9C2A10' }}
                        onMouseEnter={(e) => e.target.style.color = '#7A1F0D'}
                        onMouseLeave={(e) => e.target.style.color = '#9C2A10'}
                    >
                        <span className="mr-2">
                            {showMore ? 'Show less' : 'Show more'}
                        </span>
                        <svg 
                            className={`w-4 h-4 transform transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                </div>
                
                {/* Hidden Additional Content */}
                {showMore && (
                    <div className="mt-6">
                        <LinkGrid data={additionalTorontoSearches} />
                    </div>
                )}
            </section>
            
            {/* Nearby Cities Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Nearby Cities
                </h2>
                
                <LinkGrid data={nearbyCities} />
            </section>
        </div>
    );
};

export default RealEstateLinksSection;