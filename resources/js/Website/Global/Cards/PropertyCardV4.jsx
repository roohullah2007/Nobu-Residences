import React from 'react';

const PropertyCardV4 = ({ 
  image,
  title,
  address,
  units,
  priceRange,
  onClick,
  className = '',
  transactionType = 'Sale', // Sale/Rent
  price // Raw price value for proper formatting
}) => {
  // Format price for display
  const formatPrice = (priceValue) => {
    if (!priceValue || priceValue <= 0) return 'Price on request';
    
    let formattedPrice = '';
    if (priceValue >= 1000000) {
      formattedPrice = '$' + (priceValue / 1000000).toFixed(1) + 'M';
    } else if (priceValue >= 1000) {
      formattedPrice = '$' + Math.round(priceValue / 1000) + 'K';
    } else {
      formattedPrice = '$' + priceValue.toLocaleString();
    }
    
    return formattedPrice;
  };

  const displayPrice = price ? formatPrice(price) : priceRange;

  return (
    <div 
      className={`bg-white mb-1 border shadow-lg border-gray-200 rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Image Container with Overlay Buttons */}
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-[200px] object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80";
          }}
        />
        
        {/* Overlay Buttons */}
        <div className="absolute inset-2 flex flex-col justify-between">
          {/* Top row - Transaction Type and Price */}
          <div className="flex justify-between items-center gap-2.5 h-8">
            <span className="flex items-center justify-center px-4 py-1.5 text-sm h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200">
              {transactionType}
            </span>
            <span className="flex items-center justify-center px-4 py-1.5 text-sm h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200">
              {displayPrice}
            </span>
          </div>
          
          {/* Bottom row - Request button only (Compare hidden for next phase) */}
          <div className="flex justify-end items-center gap-2.5 h-8">
            {/* Compare Button - Hidden for next phase */}
            {/* <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle compare functionality
                console.log('Compare clicked for:', title);
              }}
              className="flex items-center justify-center px-4 py-1.5 text-sm h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              aria-label={`Add ${title} to compare`}
            >
              Compare
            </button> */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle request viewing
                console.log('Request clicked for:', title);
              }}
              className="flex items-center justify-center px-4 py-1.5 text-sm h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              aria-label={`Request viewing for ${title}`}
            >
              Request
            </button>
          </div>
        </div>
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
            {displayPrice}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardV4;
