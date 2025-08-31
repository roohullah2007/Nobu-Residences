import React, { useState, useEffect } from 'react';
import { PropertyCarousel } from '@/Website/Global/Components';
import axios from 'axios';

const PropertiesForSale = ({ forSaleProperties = null }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if no properties passed as props
    if (!forSaleProperties) {
      fetchProperties();
    }
  }, [forSaleProperties]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('/api/homepage-properties', {
        params: { type: 'sale' }
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

  // Only render if we have properties
  if (propertiesData.length === 0) {
    return null;
  }

  return (
    <PropertyCarousel
      properties={propertiesData}
      title="Properties For Sale"
      type="sale"
      viewAllLink="/sale"
    />
  );
};

export default PropertiesForSale;