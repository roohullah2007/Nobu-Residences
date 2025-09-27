import React, { useState, useEffect } from 'react';
import { PropertyCarousel } from '@/Website/Global/Components';
import axios from 'axios';

const PropertiesForSale = ({ auth, forSaleProperties = null, carouselSettings, mlsSettings, schoolAddress = null }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get default building address from MLS settings or use fallback
  const defaultBuildingAddress = mlsSettings?.default_building_address || '15 Mercer Street';
  const addressParts = defaultBuildingAddress.split(' ');
  const streetNumber = addressParts[0] || '15';
  const streetName = addressParts.slice(1).join(' ').replace(/\s+Street$/i, '') || 'Mercer';
  const buildingSlug = `${streetNumber}-${streetName.replace(/\s+/g, '-')}`;

  useEffect(() => {
    // Only fetch if no properties passed as props
    if (!forSaleProperties) {
      fetchProperties();
    }
  }, [forSaleProperties, schoolAddress]);

  const fetchProperties = async () => {
    try {
      // Build params based on whether we have a school address
      const params = { type: 'sale' };

      // If schoolAddress is provided, use it for school pages
      // Otherwise, let the backend use default building address (15 Mercer)
      if (schoolAddress) {
        const [streetAddress, ...cityParts] = schoolAddress.split(',');
        params.address = streetAddress.trim();
        params.city = cityParts.join(',').trim() || 'Toronto';
      }
      // Don't pass address params for homepage - let backend use default

      const response = await axios.get('/api/homepage-properties', {
        params
      });

      if (response.data.success && response.data.data.forSale) {
        setProperties(response.data.data.forSale);
      }
    } catch (error) {
      console.error('Error fetching sale properties:', error);
      // Fallback to empty array on error
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const propertiesData = forSaleProperties || properties;

  // Don't render until data is loaded (unless props provided)
  if (!forSaleProperties && loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Check if carousel is enabled (default to true if not specified)
  const isEnabled = carouselSettings?.enabled !== false;
  
  // Only render if enabled and we have properties
  if (!isEnabled || propertiesData.length === 0) {
    return null;
  }

  return (
    <PropertyCarousel
      properties={propertiesData}
      auth={auth}
      title={carouselSettings?.title || "Properties For Sale"}
      type="sale"
      viewAllLink={`/${buildingSlug}/for-sale`}
    />
  );
};

export default PropertiesForSale;