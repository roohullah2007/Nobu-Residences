import React, { useState } from 'react';

export default function PropertyCardV3({ 
  property, 
  className = "",
  onFavoriteToggle,
  onViewingRequest 
}) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id, !isFavorited);
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  };

  const formatPriceRange = (minPrice, maxPrice) => {
    if (minPrice && maxPrice) {
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }
    return formatPrice(minPrice || maxPrice || 0);
  };

  return (
    <div className={`bg-white shadow-xl border-gray-200 rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-200 ${className}`}>
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.image || property.Images?.[0]?.MediaURL} 
          alt={property.address || property.title}
          className="w-full h-full object-cover"
        />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
        >
          <svg 
            className={`w-4 h-4 transition-colors duration-200 ${
              isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600'
            }`}
            fill={isFavorited ? 'currentColor' : 'none'}
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </button>

        {/* Property Type Badge */}
        {property.transactionType && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
            {property.transactionType}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="text-lg font-bold text-gray-900 mb-1">
          {property.priceRange ? 
            formatPriceRange(property.minPrice, property.maxPrice) : 
            formatPrice(property.price || 0)
          }
        </div>

        {/* Agent/Developer */}
        {property.agent && (
          <div className="text-sm text-blue-600 font-medium mb-2">
            {property.agent}
          </div>
        )}

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
          {property.bedrooms > 0 && (
            <span>{property.bedrooms}BD</span>
          )}
          {property.bathrooms > 0 && (
            <span>{property.bathrooms}BA</span>
          )}
          {property.parking > 0 && (
            <span>{property.parking} Parking</span>
          )}
          {property.area && (
            <span>{property.area} sqft</span>
          )}
          {property.units && (
            <span>{property.units} units</span>
          )}
        </div>

        {/* Address */}
        <div className="text-sm text-gray-700 leading-tight">
          {property.address || property.location}
        </div>
      </div>
    </div>
  );
}
