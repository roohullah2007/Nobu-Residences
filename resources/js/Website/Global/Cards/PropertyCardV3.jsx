import React from 'react';

const PropertyCardV3 = ({ 
  image,
  title,
  address,
  units,
  priceRange,
  onClick
}) => {
  return (
    <div 
      className="bg-white shadow-lg mb-1 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-[200px] object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80";
          }}
        />
      </div>
      
      {/* Content Container */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-[18px] font-semibold text-[#263238] mb-2 leading-tight">
          {title}
        </h3>
        
        {/* Address */}
        <p className="text-[14px] text-gray-600 mb-3 leading-relaxed">
          {address}
        </p>
        
        {/* Bottom Row - Units and Price */}
        <div className="flex justify-between items-center">
          <span className="text-[14px] text-gray-500">
            {units}
          </span>
          <span className="text-[16px] font-bold text-[#263238]">
            {priceRange}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardV3;