import React from 'react';
import EnhancedPropertySearch from '@/Website/Pages/Search';

export default function Sale(props) {
  // Set default filters for sale properties
  const saleProps = {
    ...props,
    filters: {
      ...props.filters,
      transaction_type: 'sale',
      status: 'For Sale'
    },
    defaultTab: 'sale'
  };
  
  return <EnhancedPropertySearch {...saleProps} />;
}