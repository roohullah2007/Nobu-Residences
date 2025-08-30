import React from 'react';

const ComparableSales = ({ comparableSales = null }) => {
  // NO DEFAULT DATA - only show real comparable sales
  const salesData = comparableSales || [];

  const formatPrice = (price) => {
    if (typeof price === 'string' && price.startsWith('$')) {
      return price;
    }
    return '$' + price.toLocaleString();
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date;
    }
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-GB');
  };

  return (
    <section className="p-4 rounded-xl border-gray-200 border shadow-sm bg-white">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="text-xl md:text-2xl font-bold font-space-grotesk mb-5" style={{ color: '#293056' }}>
          Comparable Sales
        </h2>

        <div className="w-full h-[200px] md:h-[250px] my-4 text-center bg-gray-50 rounded-lg overflow-hidden relative flex items-center justify-center">
          <div className="bg-gray-100 w-full h-full flex items-center justify-center">
            <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg">
              <span className="text-gray-700 font-medium">Map View Coming Soon</span>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold Price
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days On Market
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesData && salesData.length > 0 ? (
                    salesData.map((sale, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <a 
                            href={sale.url || '#'} 
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {sale.address}
                          </a>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-900 font-medium">
                          {formatPrice(sale.sold_price)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-900">
                          {formatDate(sale.sold_date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-900">
                          {sale.days_on_market}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        <em>No comparable sales available</em>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparableSales;