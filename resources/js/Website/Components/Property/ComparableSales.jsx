import React from 'react';

const ComparableSales = ({ comparableSales = null }) => {
  // Sample comparable sales data
  const defaultComparableSales = [
    {
      id: 1,
      address: '408-155 Dalhousie Str',
      soldPrice: 1139000,
      soldDate: '2025-03-15',
      daysOnMarket: 5,
      url: '#',
      latitude: null,
      longitude: null
    },
    {
      id: 2,
      address: '301-200 King Street',
      soldPrice: 1250000,
      soldDate: '2025-03-22',
      daysOnMarket: 12,
      url: '#',
      latitude: null,
      longitude: null
    },
    {
      id: 3,
      address: '505-75 Queens Avenue',
      soldPrice: 899000,
      soldDate: '2025-03-10',
      daysOnMarket: 8,
      url: '#',
      latitude: null,
      longitude: null
    },
    {
      id: 4,
      address: '1202-180 University St',
      soldPrice: 1575000,
      soldDate: '2025-03-28',
      daysOnMarket: 15,
      url: '#',
      latitude: null,
      longitude: null
    }
  ];

  const salesData = comparableSales || defaultComparableSales;

  // Helper functions
  const formatPrice = (price) => {
    if (typeof price === 'string' && price.startsWith('$')) {
      return price;
    }
    return '$' + Number(price).toLocaleString();
  };

  const formatDate = (date) => {
    if (!date) return '';
    // If already in DD/MM/YYYY format, return as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date;
    }
    // Otherwise format from standard date
    const dateObj = new Date(date);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="max-w-[1280px] mx-auto font-work-sans my-8">
      {/* Section Title */}
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-gray-900 mb-0">
          Comparable Sales
        </h2>
      </div>

      {/* Map Container */}
      <div className="w-full h-48 md:h-52 my-4 text-center bg-gray-50 rounded-lg overflow-hidden relative flex items-center justify-center">
        <img 
          src="/assets/svgs/map.svg" 
          alt="Comparable Sales Map" 
          className="w-full h-full object-cover rounded-lg shadow-sm"
          onError={(e) => {
            // Fallback to inline SVG if file not found
            e.target.style.display = 'none';
            const fallbackDiv = e.target.parentElement.querySelector('.fallback-svg');
            if (fallbackDiv) fallbackDiv.style.display = 'block';
          }}
        />
        
        {/* Fallback inline SVG */}
        <div className="fallback-svg w-full h-full" style={{ display: 'none' }}>
          <svg 
            className="w-full h-full" 
            viewBox="0 0 400 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background */}
            <rect width="400" height="200" fill="#f3f4f6" />
            
            {/* Map roads/streets */}
            <path d="M50 50 L350 50" stroke="#d1d5db" strokeWidth="2" />
            <path d="M50 100 L350 100" stroke="#d1d5db" strokeWidth="2" />
            <path d="M50 150 L350 150" stroke="#d1d5db" strokeWidth="2" />
            <path d="M100 20 L100 180" stroke="#d1d5db" strokeWidth="2" />
            <path d="M200 20 L200 180" stroke="#d1d5db" strokeWidth="2" />
            <path d="M300 20 L300 180" stroke="#d1d5db" strokeWidth="2" />
            
            {/* Property markers */}
            <circle cx="150" cy="75" r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
            <circle cx="250" cy="125" r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
            <circle cx="180" cy="60" r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
            <circle cx="280" cy="90" r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
            
            {/* Main property marker (larger) */}
            <circle cx="200" cy="100" r="8" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
            
            {/* Area labels */}
            <text x="200" y="190" textAnchor="middle" className="fill-gray-600 text-xs font-medium">
              Comparable Sales Area
            </text>
          </svg>
        </div>
      </div>

      {/* Sales Table */}
      <div className="mt-6 overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200"
                >
                  Address
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200"
                >
                  Sold Price
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200"
                >
                  Sold Date
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200"
                >
                  Days On Market
                </th>
              </tr>
            </thead>
            <tbody>
              {salesData && salesData.length > 0 ? (
                salesData.map((sale, index) => (
                  <tr key={sale.id || index} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-4 py-3">
                      <a 
                        href={sale.url || '#'} 
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                      >
                        {sale.address}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {formatPrice(sale.soldPrice)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {formatDate(sale.soldDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {sale.daysOnMarket}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="4" 
                    className="px-4 py-6 text-center text-gray-500 italic"
                  >
                    No comparable sales available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparableSales;