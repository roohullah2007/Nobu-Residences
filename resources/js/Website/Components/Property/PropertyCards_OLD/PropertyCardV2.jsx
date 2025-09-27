import React from 'react';

/**
 * PropertyCardV2 - For Rent Properties
 * 
 * A reusable property card component designed for rental properties.
 * Features white background with green rent/price chips.
 * 
 * @param {Object} property - Property data object
 * @param {string} size - Card size ('default', 'mobile') - default: 'default'
 * @param {Function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 */
const PropertyCardV2 = ({ 
  property, 
  size = 'default',
  onClick,
  className = '' 
}) => {
  // Format price function
  const formatPrice = (price, isRental = false) => {
    if (!price || price <= 0) return 'Price on request';
    
    let formattedPrice = '';
    if (price >= 1000000) {
      formattedPrice = '$' + (price / 1000000).toFixed(1) + 'M';
    } else if (price >= 1000) {
      formattedPrice = '$' + Math.round(price / 1000) + 'K';
    } else {
      formattedPrice = '$' + price.toLocaleString();
    }
    
    if (isRental) {
      formattedPrice += '/mo';
    }
    
    return formattedPrice;
  };

  // Build features display
  const buildFeatures = (bedrooms, bathrooms) => {
    const features = [];
    if (bedrooms > 0) {
      features.push(bedrooms + ' Bed' + (bedrooms > 1 ? 's' : ''));
    }
    if (bathrooms > 0) {
      features.push(bathrooms + ' Bath' + (bathrooms > 1 ? 's' : ''));
    }
    return features.join(' | ');
  };

  const formattedPrice = formatPrice(property.price, property.isRental);
  const features = buildFeatures(property.bedrooms, property.bathrooms);
  const detailsUrl = `/property/${property.listingKey}`;

  // Size configurations
  const sizeConfig = {
    default: {
      container: 'w-[360px] h-[470px]',
      image: 'h-[275px]',
      content: 'p-4 gap-2.5 h-[195px]',
      chip: 'px-4 py-1.5 text-sm',
      title: 'text-lg',
      details: 'text-base'
    },
    mobile: {
      container: 'w-80 h-[420px]',
      image: 'h-60',
      content: 'p-3 gap-2 h-40',
      chip: 'px-2 py-1 text-xs',
      title: 'text-lg',
      details: 'text-sm'
    }
  };

  const config = sizeConfig[size];

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(property);
    }
  };

  return (
    <div className={`flex-none ${config.container} bg-white shadow-lg rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group ${className}`}>
      <a 
        href={detailsUrl} 
        className="block h-full text-inherit no-underline"
        onClick={handleClick}
      >
        {/* Card Image */}
        <div className={`relative w-full ${config.image} overflow-hidden bg-gray-100 rounded-t-xl`}>
          <img 
            src={property.image}
            alt={`${property.propertyType} in ${property.address}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80';
            }}
          />
          
          {/* Filter Chips - Green background for rent properties */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center gap-2.5 h-8">
            <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-green-100 text-green-800 border border-green-300`}>
              Rent
            </span>
            <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-green-100 text-green-800 border border-green-300`}>
              {formattedPrice}
            </span>
          </div>
        </div>
        
        {/* Card Content */}
        <div className={`flex flex-col items-start ${config.content} box-border`}>
          {/* Property Type Title */}
          <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold ${config.title} leading-7 tracking-tight text-[#293056]`}>
            {property.propertyType}
          </div>
          
          {/* Property Details */}
          <div className="flex flex-col items-start gap-2 w-full flex-1">
            {/* Address */}
            <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`}>
              {property.address}
            </div>
            
            {/* Features */}
            {features && (
              <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`}>
                {features}
              </div>
            )}
            
            {/* MLS */}
            <div className={`flex items-center justify-start w-full min-h-8 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`}>
              MLS#: {property.listingKey}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default PropertyCardV2;