import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const NearbySchools = ({ propertyData = null }) => {
  const [showAll, setShowAll] = useState(false);
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get property address for geocoding
  const getPropertyAddress = () => {
    // Check various possible address fields
    const addressFields = [
      'UnparsedAddress',
      'unparsedAddress',
      'address',
      'Address',
      'full_address',
      'FullAddress'
    ];

    for (const field of addressFields) {
      if (propertyData?.[field]) {
        return propertyData[field];
      }
    }

    // Try to construct address from components
    if (propertyData?.StreetNumber && propertyData?.StreetName) {
      const streetAddress = `${propertyData.StreetNumber} ${propertyData.StreetName} ${propertyData.StreetSuffix || ''}`.trim();
      const city = propertyData.City || 'Toronto';
      const province = propertyData.StateOrProvince || propertyData.Province || 'ON';
      const postalCode = propertyData.PostalCode || '';
      return `${streetAddress}, ${city}, ${province} ${postalCode}`.trim();
    }

    return null;
  };

  // Fetch nearby schools from API - only when component mounts (tab is clicked)
  useEffect(() => {
    const fetchNearbySchools = async () => {
      if (!propertyData) {
        setIsLoading(false);
        return;
      }

      // Don't fetch if we already have schools data
      if (schools.length > 0) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First, try to get coordinates from property data
        const possibleLatFields = ['latitude', 'Latitude', 'lat', 'Lat', 'LAT'];
        const possibleLngFields = ['longitude', 'Longitude', 'lng', 'Lng', 'LNG', 'long', 'Long'];

        let latitude = null;
        let longitude = null;

        // Try to find latitude
        for (const field of possibleLatFields) {
          if (propertyData?.[field]) {
            latitude = parseFloat(propertyData[field]);
            break;
          }
        }

        // Try to find longitude
        for (const field of possibleLngFields) {
          if (propertyData?.[field]) {
            longitude = parseFloat(propertyData[field]);
            break;
          }
        }

        // Build the API URL with coordinates or address
        const radius = 2; // 2km radius
        let apiUrl = `/api/schools/nearby?radius=${radius}&limit=100`;

        if (latitude && longitude) {
          // Use coordinates if available
          apiUrl += `&latitude=${latitude}&longitude=${longitude}`;
          console.info('📍 Using property coordinates for schools search:', { latitude, longitude });
        } else {
          // Otherwise, send the address for backend geocoding
          const address = getPropertyAddress();
          if (address) {
            apiUrl += `&address=${encodeURIComponent(address)}`;
            console.info('📍 Using property address for schools search:', address);
          } else {
            console.warn('No coordinates or address available for property');
            setError('Unable to determine property location');
            setIsLoading(false);
            return;
          }
        }

        // Fetch schools from backend API
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success && result.data) {
          console.info(`✅ Found ${result.data.length} schools within ${radius}km`);
          setSchools(result.data);
        } else {
          console.warn('No schools data returned from API:', result.message);
          setError(result.message || 'No schools found nearby');
          setSchools([]);
        }
      } catch (err) {
        console.error('Error fetching nearby schools:', err);
        setError('Error loading nearby schools. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbySchools();
  }, [propertyData]);

  // Format schools data for display
  const getSchoolsData = () => {
    return schools.map(school => {
      // Create URL for all schools - use only school name slug
      let url = null;
      if (school.slug) {
        // Use existing slug if available
        url = `/school/${school.slug}`;
      } else if (school.name) {
        // Create slug from school name
        const schoolNameSlug = school.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim('-'); // Remove leading/trailing hyphens

        url = `/school/${schoolNameSlug}`;
      }

      return {
        id: school.id,
        slug: school.slug,
        distance_km: school.distance_text || `${school.distance_km} km`,
        walk_time: school.walking_time_text || `${school.walking_time_minutes} min walk`,
        name: school.name,
        type: school.school_type_label,
        board: `${school.school_type_label} | ${school.grade_level_label}${school.school_board ? ' | ' + school.school_board : ''}`,
        url: url,
        rating: school.rating,
        in_boundary: school.in_boundary,
        place_id: school.place_id // Keep track of Google Place ID if available
      };
    });
  };

  const schoolsData = getSchoolsData();
  const displayedSchools = showAll ? schoolsData : schoolsData.slice(0, 3);
  const remainingCount = schoolsData.length - 3;

  const handleToggleShow = () => {
    setShowAll(!showAll);
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: '#293056' }}>Nearby Schools</h2>
        <p className="text-gray-600 text-sm mb-4">Explore the educational institutions in the surrounding area and their proximity to this property.</p>
        <div className="flex flex-col space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex flex-col md:flex-row md:items-center p-4 gap-3 md:gap-8 w-full min-h-[82px] border border-[#D2D2D2] rounded-lg md:rounded-none animate-pulse">
              <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start p-0 w-full md:w-[104px] h-auto md:h-12 md:border-r border-[#A4A7AE]">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex flex-col justify-center items-start p-0 gap-1 flex-1 h-auto md:h-[50px]">
                <div className="h-5 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: '#293056' }}>Nearby Schools</h2>
        <p className="text-gray-600 text-sm mb-4">Explore the educational institutions in the surrounding area and their proximity to this property.</p>
        <div className="flex items-center justify-center py-8 text-gray-500">
          Unable to load nearby schools. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-semibold mb-4" style={{ color: '#293056' }}>Nearby Schools</h2>
      <p className="text-gray-600 text-sm mb-4">Explore the educational institutions in the surrounding area and their proximity to this property.</p>
      
      {schoolsData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 border border-gray-200 rounded-lg">
          <p>No schools found within walking distance (2km) of this property.</p>
          <p className="text-sm mt-2">Try expanding your search radius for more results.</p>
        </div>
      ) : (
      <div className="flex flex-col">
        <div className="space-y-4">
          {displayedSchools.map((school, index) => (
            <div key={school.id || index} className="flex flex-col md:flex-row md:items-center p-4 gap-3 md:gap-8 w-full min-h-[82px] border border-[#D2D2D2] rounded-lg md:rounded-none">
              {/* Distance Column */}
              <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start p-0 w-full md:w-[104px] h-auto md:h-12 md:border-r border-[#A4A7AE]">
                <div className="font-work-sans font-bold text-sm leading-6 flex items-center tracking-[-0.03em] text-[#727272]">
                  {school.distance_km}
                </div>
                <div className="font-work-sans font-medium text-sm leading-6 flex items-center tracking-[-0.03em] text-[#707070]">
                  {school.walk_time}
                </div>
              </div>

              {/* School Info Column */}
              <div className="flex flex-col justify-center items-start p-0 gap-1 flex-1 h-auto md:h-[50px]">
                {/* School Name with Rating and Boundary Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  {school.url ? (
                    <Link
                      href={school.url}
                      className="font-work-sans font-bold text-base leading-[25px] flex items-center tracking-[-0.03em] text-[#293056] hover:underline cursor-pointer transition-colors duration-200"
                    >
                      {school.name}
                    </Link>
                  ) : (
                    <div className="font-work-sans font-bold text-base leading-[25px] flex items-center tracking-[-0.03em] text-[#293056]">
                      {school.name}
                    </div>
                  )}
                  {/* Rating Badge */}
                  {school.rating && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {school.rating}/10
                    </span>
                  )}
                  {/* Boundary Badge */}
                  {school.in_boundary !== null && school.in_boundary !== undefined && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      school.in_boundary
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {school.in_boundary ? 'In Boundary' : 'Out of Boundary'}
                    </span>
                  )}
                </div>
                <div className="font-work-sans font-normal text-sm leading-6 flex items-center tracking-[-0.03em] text-[#717680]">
                  {school.board}
                </div>
              </div>
            </div>
          ))}
        </div>

        {schoolsData.length > 3 && (
          <div className="px-6 py-4">
            <button
              onClick={handleToggleShow}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              {showAll 
                ? 'Show Less' 
                : `Show More (${remainingCount})`
              }
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default NearbySchools;