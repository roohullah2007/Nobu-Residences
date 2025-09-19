import React from 'react';
import PluginStyleImageLoader from '@/Website/Components/PluginStyleImageLoader';

const PropertyCardV3 = ({ 
  image,
  title,
  address,
  units,
  priceRange,
  onClick,
  listingKey
}) => {

  return (
    <div 
      className="bg-white shadow-lg mb-1 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative bg-gray-100 h-[200px] overflow-hidden">
        <PluginStyleImageLoader
          src={image}
          alt={`${title} - ${address}`}
          className="w-full h-full"
          enableLazyLoading={true}
          rootMargin="200px"
          threshold={0.01}
          enableBlurEffect={true}
          priority="normal"
          data-listing-key={listingKey}
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