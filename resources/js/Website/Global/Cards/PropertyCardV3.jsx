import React, { useState, useEffect } from 'react';

const PropertyCardV3 = ({ 
  image,
  title,
  address,
  units,
  priceRange,
  onClick,
  listingKey
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(image);
  
  // Update image when prop changes
  useEffect(() => {
    setCurrentImage(image);
    setImageLoading(true);
  }, [image]);
  
  const handleImageLoad = () => {
    setImageLoading(false);
  };
  
  const handleImageError = (e) => {
    console.log('Image failed to load:', image);
    setImageLoading(false);
    // Set fallback image
    const fallbackImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80";
    if (e.target.src !== fallbackImage) {
      e.target.src = fallbackImage;
    }
  };

  return (
    <div 
      className="bg-white shadow-lg mb-1 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative bg-gray-100 h-[200px] overflow-hidden">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="animate-pulse w-full h-full bg-gray-200"></div>
          </div>
        )}
        <img 
          src={currentImage} 
          alt={`${title} - ${address}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: imageLoading ? 0 : 1 }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
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