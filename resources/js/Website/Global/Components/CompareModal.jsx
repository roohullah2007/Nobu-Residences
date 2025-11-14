import React, { useState, useEffect } from 'react';

const CompareModal = ({ isOpen, onClose, properties = [] }) => {
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    if (properties.length > 0) {
      setCompareList(properties);
    }
  }, [properties]);

  if (!isOpen) return null;

  const formatPrice = (price, isRental = false) => {
    if (!price || price <= 0) return 'N/A';

    let formattedPrice = '$' + price.toLocaleString();

    if (isRental) {
      formattedPrice += '/mo';
    }

    return formattedPrice;
  };

  const removeFromCompare = (listingKey) => {
    setCompareList(compareList.filter(p => p.listingKey !== listingKey));
    if (window.removeFromCompare) {
      window.removeFromCompare(listingKey);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Compare Properties</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close compare modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {compareList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No properties selected for comparison</p>
            <p className="text-gray-400 mt-2">Click "Compare" on property cards to add them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-700">Property</th>
                  {compareList.map((property) => (
                    <th key={property.listingKey} className="p-4 min-w-[250px]">
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(property.listingKey)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          aria-label={`Remove ${property.address} from comparison`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {property.imageUrl && (
                          <img 
                            src={property.imageUrl} 
                            alt={property.address}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800">{property.address}</h3>
                          <p className="text-sm text-gray-600">{property.propertyType || 'Residential'}</p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-700">Price</td>
                  {compareList.map((property) => (
                    <td key={property.listingKey} className="p-4 text-center font-bold text-lg">
                      {formatPrice(property.price, property.isRental)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-700">Bedrooms</td>
                  {compareList.map((property) => (
                    <td key={property.listingKey} className="p-4 text-center">
                      {property.bedrooms || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-700">Bathrooms</td>
                  {compareList.map((property) => (
                    <td key={property.listingKey} className="p-4 text-center">
                      {property.bathrooms || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-700">Square Feet</td>
                  {compareList.map((property) => (
                    <td key={property.listingKey} className="p-4 text-center">
                      {property.squareFeet ? `${property.squareFeet.toLocaleString()} sq ft` : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-700">Lot Size</td>
                  {compareList.map((property) => (
                    <td key={property.listingKey} className="p-4 text-center">
                      {property.lotSize || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-700">Year Built</td>
                  {compareList.map((property) => (
                    <td key={property.listingKey} className="p-4 text-center">
                      {property.yearBuilt || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-700">MLS #</td>
                  {compareList.map((property) => (
                    <td key={property.listingKey} className="p-4 text-center">
                      {property.listingKey || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-700">Actions</td>
                  {compareList.map((property) => (
                    <td key={property.listingKey} className="p-4 text-center">
                      <a
                        href={`/property/${property.listingKey}`}
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {compareList.length > 0 && (
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => {
                setCompareList([]);
                if (window.clearCompareList) {
                  window.clearCompareList();
                }
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareModal;