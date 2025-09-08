import React, { useState, useEffect } from 'react';
import { PropertyCarousel } from '@/Website/Global/Components';
import axios from 'axios';

const PropertiesForRent = ({ auth, forRentProperties = null }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if no properties passed as props
    if (!forRentProperties) {
      fetchProperties();
    }
  }, [forRentProperties]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('/api/homepage-properties', {
        params: { type: 'rent' }
      });
      
      if (response.data.success && response.data.data.forRent) {
        setProperties(response.data.data.forRent);
      }
    } catch (error) {
      console.error('Error fetching rent properties:', error);
      // Fallback to empty array on error
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const propertiesData = forRentProperties || properties;

  // Don't render until data is loaded (unless props provided)
  if (!forRentProperties && loading) {
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
      auth={auth}
      title="Properties For Rent"
      type="rent"
      viewAllLink="/search?street_number=15&street_name=Mercer&transaction_type=rent"
    />
  );
};

export default PropertiesForRent;