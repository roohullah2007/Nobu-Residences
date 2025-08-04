import React from 'react';

const MoreBuildings = () => {
  // Sample building data
  const buildings = [
    {
      id: 1,
      name: "Luxury Downtown Tower",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop&auto=format&q=80",
      address: "123 King Street West",
      units: 45,
      priceRange: "$800K - $2.5M"
    },
    {
      id: 2,
      name: "Riverside Condominiums", 
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=200&fit=crop&auto=format&q=80",
      address: "456 Queen Street East",
      units: 32,
      priceRange: "$600K - $1.8M"
    },
    {
      id: 3,
      name: "Modern Urban Living",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop&auto=format&q=80", 
      address: "789 Bay Street",
      units: 67,
      priceRange: "$900K - $3.2M"
    }
  ];

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">More Buildings in the Area</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map((building) => (
            <div key={building.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <img 
                src={building.image} 
                alt={building.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{building.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{building.address}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{building.units} units</span>
                  <span className="font-semibold text-gray-900">{building.priceRange}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoreBuildings;