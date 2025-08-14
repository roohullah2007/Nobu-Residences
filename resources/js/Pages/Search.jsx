import React from 'react';
import PropertySearch from '../Website/Pages/PropertySearch';

// This is a simple wrapper that redirects to the PropertySearch component
export default function Search(props) {
  return <PropertySearch {...props} />;
}
