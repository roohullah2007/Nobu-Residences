import React from 'react';

const ComparableSales = () => {
  // Sample comparable sales data
  const comparableSales = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop&auto=format&q=80",
      soldPrice: "$1,100,000",
      originalPrice: "$1,139,000", 
      address: "408 - 155 Dalhousie Street",
      soldDate: "Jan 2024",
      beds: 2,
      baths: 2,
      sqft: "1,276 sqft",
      daysOnMarket: 45
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&auto=format&q=80",
      soldPrice: "$1,050,000",
      originalPrice: "$1,100,000",
      address: "302 - 155 Dalhousie Street", 
      soldDate: "Dec 2023",
      beds: 2,
      baths: 1,
      sqft: "1,100 sqft",
      daysOnMarket: 32
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=300&h=200&fit=crop&auto=format&q=80",
      soldPrice: "$1,250,000",
      originalPrice: "$1,300,000",
      address: "610 - 155 Dalhousie Street",
      soldDate: "Nov 2023", 
      beds: 3,
      baths: 2,
      sqft: "1,450 sqft",
      daysOnMarket: 28
    }
  ];

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparable Sales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparableSales.map((sale) => (
            <div key={sale.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={sale.image} 
                alt={`Sold property at ${sale.address}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xl font-bold text-green-600">{sale.soldPrice}</div>
                  <div className="text-sm text-gray-500 line-through">{sale.originalPrice}</div>
                </div>
                <div className="text-gray-600 text-sm mb-3">{sale.address}</div>
                <div className="text-xs text-gray-500 mb-3">Sold {sale.soldDate} • {sale.daysOnMarket} days on market</div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{sale.beds} beds</span>
                  <span>{sale.baths} baths</span>
                  <span>{sale.sqft}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparableSales;