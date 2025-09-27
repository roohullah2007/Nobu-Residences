import React from 'react';

const PropertyDescription = ({ propertyData }) => {
  const defaultDescription = `This stunning 2+1 bedroom, 2 bathroom condo offers modern urban living in the heart of downtown Toronto. 
  
Located in the prestigious NO55 Mercer building, this unit features floor-to-ceiling windows with north-facing exposure, providing abundant natural light throughout the day.

The open-concept layout seamlessly connects the living, dining, and kitchen areas, perfect for both entertaining and everyday living. The modern kitchen boasts stainless steel appliances, quartz countertops, and ample storage space.

The master bedroom includes an ensuite bathroom and walk-in closet, while the second bedroom offers flexibility as a guest room or home office. The additional den space can serve as a study or children's play area.

Building amenities include a 24-hour concierge, fitness center, rooftop terrace with stunning city views, and guest suites. The location offers unparalleled access to Toronto's best dining, shopping, and entertainment options.

With easy access to public transportation and major highways, this property represents the perfect blend of luxury, convenience, and urban lifestyle.`;

  const description = propertyData?.description || defaultDescription;

  return (
    <section className="py-8 bg-white">
      <div className="max-w-[1280px] mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Description</h2>
        <div className="prose max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {description}
          </div>
        </div>
        
        {/* Property Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                Floor-to-ceiling windows
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                Modern kitchen with quartz countertops
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                In-unit laundry
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                Private balcony
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                Hardwood flooring
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Building Amenities</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                24-hour concierge
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                Fitness center
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                Rooftop terrace
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                Guest suites
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                Underground parking
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyDescription;