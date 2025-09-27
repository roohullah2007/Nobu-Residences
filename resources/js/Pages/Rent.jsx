import React from 'react';
import EnhancedPropertySearch from '@/Website/Pages/Search';

export default function Rent(props) {
  // Set default filters for rent properties
  const rentProps = {
    ...props,
    filters: {
      ...props.filters,
      transaction_type: 'rent',
      status: 'For Rent'
    },
    defaultTab: 'rent'
  };
  
  return <EnhancedPropertySearch {...rentProps} />;
}