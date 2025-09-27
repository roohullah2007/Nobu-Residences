import React from 'react';

// Lock icon component
const Lock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" />
  </svg>
);

/**
 * ProtectedPropertyCard - For Agent Properties with Address Protection
 * 
 * A property card component that shows address masking and contact protection status.
 * Used for agent properties where exact address is hidden until contact is purchased.
 * 
 * @param {Object} property - Property data object with security/masking applied
 * @param {string} size - Card size ('default', 'mobile') - default: 'default'
 * @param {Function} onClick - Optional click handler
 * @param {string} className - Additional CSS classes
 */
const ProtectedPropertyCard = ({ 
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

  const formattedPrice = formatPrice(property.price, property.transaction_type === 'rent');
  const features = buildFeatures(property.bedrooms, property.bathrooms);
  const detailsUrl = `/agent/properties/${property.id}`;

  // Size configurations
  const sizeConfig = {
    default: {
      container: 'w-[360px] h-[520px]',
      image: 'h-[275px]',
      content: 'p-4 gap-2.5 h-[245px]',
      chip: 'px-4 py-1.5 text-sm',
      title: 'text-lg',
      details: 'text-base'
    },
    mobile: {
      container: 'w-80 h-[470px]',
      image: 'h-60',
      content: 'p-3 gap-2 h-52',
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

  // Get the transaction type display
  const getTransactionTypeDisplay = () => {
    switch (property.transaction_type) {
      case 'rent':
        return 'For Rent';
      case 'lease':
        return 'For Lease';
      default:
        return 'For Sale';
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
            src={property.images && property.images.length > 0 ? property.images[0] : property.main_image}
            alt={`${property.property_type} in ${property.city}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80';
            }}
          />
          
          {/* Filter Chips */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center gap-2.5 h-8">
            <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm bg-white text-[#293056] border border-gray-200`}>
              {getTransactionTypeDisplay()}
            </span>
            <span className={`flex items-center justify-center ${config.chip} h-8 rounded-full font-bold tracking-tight whitespace-nowrap shadow-sm ml-auto bg-white text-[#293056] border border-gray-200`}>
              {formattedPrice}
            </span>
          </div>

          {/* Address Protection Indicator */}
          {!property.has_contact_access && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex items-center justify-center gap-1 bg-orange-500 bg-opacity-90 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                <Lock className="w-3 h-3" />
                <span>Address Protected</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Card Content */}
        <div className={`flex flex-col items-start ${config.content} box-border`}>
          {/* Property Type Title */}
          <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-bold ${config.title} leading-7 tracking-tight text-[#293056]`}>
            {property.property_type}
          </div>
          
          {/* Property Details */}
          <div className="flex flex-col items-start gap-2 w-full flex-1">
            {/* Address with protection indicator */}
            <div className={`flex items-center justify-between w-full min-h-8 pb-2 border-b border-gray-200`}>
              <div className={`font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056] flex-1`}>
                {property.address}
              </div>
              {!property.has_contact_access && (
                <div className="flex items-center gap-1 text-orange-600 ml-2">
                  <Lock className="w-3 h-3" />
                </div>
              )}
            </div>
            
            {/* Features */}
            {features && (
              <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`}>
                {features}
              </div>
            )}

            {/* Area if available */}
            {property.area && (
              <div className={`flex items-center justify-start w-full min-h-8 pb-2 border-b border-gray-200 font-work-sans font-normal ${config.details} leading-6 tracking-tight text-[#293056]`}>
                {property.area} {property.area_unit || 'sqft'}
              </div>
            )}
            
            {/* Contact Price and View Details Button */}
            <div className="flex items-center justify-between w-full min-h-8">
              {!property.has_contact_access && (
                <div className={`font-work-sans font-normal text-sm leading-6 tracking-tight text-gray-600`}>
                  Contact: ${property.contact_price}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = detailsUrl;
                }}
                className={`px-3 py-1.5 bg-[#93370D] text-white text-xs font-semibold rounded-md hover:bg-[#7A2A09] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#93370D] focus:ring-offset-1 ${!property.has_contact_access ? 'ml-auto' : 'w-full'}`}
                aria-label={`View details for ${property.title}`}
              >
                {property.has_contact_access ? 'View Full Details' : 'View & Contact'}
              </button>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default ProtectedPropertyCard;