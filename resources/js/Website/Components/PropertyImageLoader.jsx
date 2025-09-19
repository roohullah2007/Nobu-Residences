import React, { useState, useEffect, useRef } from 'react';

/**
 * PropertyImageLoader - Real MLS Image Loading Component
 * 
 * This component implements the same image loading mechanism as the WordPress plugin:
 * - Lazy loading with Intersection Observer
 * - Real MLS image fetching via API
 * - Proper error handling and fallbacks
 * - Loading animations
 */
const PropertyImageLoader = ({ 
  listingKey, 
  alt, 
  className,
  fallbackImage = null,
  enableLazyLoading = true 
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!enableLazyLoading);
  const imgRef = useRef();

  // Intersection Observer for lazy loading (same as plugin)
  useEffect(() => {
    if (!enableLazyLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px', threshold: 0.1 } // Same as plugin config
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [enableLazyLoading]);

  // Fetch real property image when in view (same as plugin mechanism)
  useEffect(() => {
    if (inView && listingKey && !imageUrl && !error) {
      fetchPropertyImage(listingKey);
    }
  }, [inView, listingKey, imageUrl, error]);

  const fetchPropertyImage = async (key) => {
    if (!key || key.trim() === '') {
      setError(true);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/property-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: JSON.stringify({ 
          listing_keys: [key.trim()],
          batch: false 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.images && data.images[key]) {
        const imageData = data.images[key];
        if (imageData.image_url && !imageData.is_placeholder) {
          setImageUrl(imageData.image_url);
        } else {
          // Plugin returned placeholder, use our fallback
          setError(true);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error fetching property image:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayImage = () => {
    if (imageUrl) return imageUrl;
    if (fallbackImage) return fallbackImage;
    
    // Return null if no real image available - don't show placeholder
    return null;
  };

  // Show placeholder while not in view (same as plugin)
  if (!inView) {
    return (
      <div 
        ref={imgRef}
        className={`${className} bg-gray-200 flex items-center justify-center`}
      >
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  const displayImage = getDisplayImage();

  return (
    <div ref={imgRef} className="relative w-full h-full">
      {/* Loading animation (similar to plugin) */}
      {loading && (
        <div className="absolute inset-0 bg-gray-200/80 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {displayImage ? (
        <img 
          src={displayImage}
          alt={alt}
          className={`${className} ${loading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
          onError={() => {
            if (!error) {
              setError(true);
              setLoading(false);
            }
          }}
          onLoad={() => setLoading(false)}
        />
      ) : (
        // Show a gray placeholder when no image available
        <div className={`${className} bg-gray-200 flex items-center justify-center`}>
          <div className="text-gray-500 text-sm">No Image</div>
        </div>
      )}

    </div>
  );
};

export default PropertyImageLoader;
