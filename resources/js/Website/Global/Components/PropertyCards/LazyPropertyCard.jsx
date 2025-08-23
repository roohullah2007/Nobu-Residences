import React, { useEffect, useRef, useState } from 'react';
import PropertyCardV5 from './PropertyCardV5';

/**
 * LazyPropertyCard - Wrapper for PropertyCardV5 with lazy image loading
 * Similar to IDX-AMPRE plugin's lazy loading mechanism
 */
const LazyPropertyCard = ({ 
  property, 
  size = 'default',
  onClick,
  className = '',
  observeElement,
  onMouseEnter,
  onMouseLeave
}) => {
  const cardRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [localProperty, setLocalProperty] = useState(property);

  useEffect(() => {
    if (cardRef.current && property.listingKey && observeElement) {
      // Start observing this card for lazy loading
      observeElement(cardRef.current, property.listingKey, (imageData) => {
        // Update property with loaded image
        setLocalProperty(prev => ({
          ...prev,
          imageUrl: imageData.image_url || null,
          images: imageData.all_images || []
        }));
        setImageLoaded(true);
      });
    }
  }, [property.listingKey, observeElement]);

  // Update local property when prop changes
  useEffect(() => {
    setLocalProperty(property);
  }, [property]);

  return (
    <div 
      ref={cardRef}
      data-listing-key={property.listingKey}
      className={`lazy-property-card ${imageLoaded ? 'image-loaded' : 'image-loading'}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <PropertyCardV5
        property={localProperty}
        size={size}
        onClick={onClick}
        className={className}
      />
    </div>
  );
};

export default LazyPropertyCard;