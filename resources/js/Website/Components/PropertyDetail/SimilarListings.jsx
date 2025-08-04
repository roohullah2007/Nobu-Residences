import React from 'react';

const SimilarListings = () => {
  // Sample similar property data
  const similarProperties = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop&auto=format&q=80",
      price: "$1,250,000",
      address: "410 - 155 Dalhousie Street",
      beds: 2,
      baths: 2,
      sqft: "1,150 sqft"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&h=200&fit=crop&auto=format&q=80",
      price: "$1,100,000",
      address: "312 - 155 Dalhousie Street", 
      beds: 2,
      baths: 1,
      sqft: "1,050 sqft"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4a0?w=300&h=200&fit=crop&auto=format&q=80",
      price: "$1,350,000",
      address: "505 - 155 Dalhousie Street",
      beds: 2,
      baths: 2,
      sqft: "1,300 sqft"
    }
  ];

  return (
    <section className="py-8 bg-white">
      <div className="max-w-[1280px] mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarProperties.map((property) => (
            <div key={property.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={property.image} 
                alt={`Property at ${property.address}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="text-xl font-bold text-gray-900 mb-1">{property.price}</div>
                <div className="text-gray-600 text-sm mb-3">{property.address}</div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{property.beds} beds</span>
                  <span>{property.baths} baths</span>
                  <span>{property.sqft}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimilarListings;