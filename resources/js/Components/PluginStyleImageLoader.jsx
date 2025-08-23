import React, { useState, useEffect, useRef } from 'react';

/**
 * Professional Property Image Loader with Plugin-Style Loading States
 * 
 * Features:
 * - Skeleton loading animation
 * - Progressive blur-to-sharp loading
 * - Smooth fade-in transitions
 * - Error handling with working fallbacks
 * - Loading indicators
 * - Professional real estate plugin aesthetics
 */

const PluginStyleImageLoader = ({ 
  src, 
  alt, 
  className = '',
  style = {},
  onLoad = null,
  onError = null,
  priority = 'normal',
  enableBlurEffect = true,
  enableLazyLoading = true,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [imageState, setImageState] = useState({
    loading: false, // Start with false so we can trigger loading
    loaded: false,
    error: false,
    src: null,
    attempts: 0,
    inView: !enableLazyLoading // If lazy loading is disabled, immediately in view
  });
  
  const imgRef = useRef();
  const containerRef = useRef();
  const observerRef = useRef();
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Setup Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoading || imageState.inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && mountedRef.current) {
          setImageState(prev => ({ ...prev, inView: true }));
          observer.disconnect();
        }
      },
      { 
        rootMargin,
        threshold
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableLazyLoading, threshold, rootMargin, imageState.inView]);

  // Working fallback images for real estate - diverse property types
  const getFallbackImages = () => [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400&h=300&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&h=300&fit=crop&auto=format&q=80'
  ];

  // Get random fallback image - use listing key for consistent randomization
  const getRandomFallback = () => {
    const fallbacks = getFallbackImages();
    // If we have a src that looks like a listing key, use it for consistent random selection
    let index = Math.floor(Math.random() * fallbacks.length);
    if (src && typeof src === 'string' && src.length < 20) {
      // Use listing key to generate consistent index
      let hash = 0;
      for (let i = 0; i < src.length; i++) {
        hash = ((hash << 5) - hash) + src.charCodeAt(i);
        hash = hash & hash;
      }
      index = Math.abs(hash) % fallbacks.length;
    }
    return fallbacks[index];
  };

  // Load image with fallback logic
  const loadImage = (imageUrl, attempt = 0) => {
    if (!mountedRef.current) return;
    
    // Check if already loaded to prevent re-loading
    if (imageState.loaded && imageState.src === imageUrl) {
      return;
    }

    // Reset state for new load only on first attempt
    if (attempt === 0) {
      setImageState(prev => ({ 
        ...prev, 
        loading: true, 
        error: false, 
        loaded: false, 
        attempts: 0 
      }));
    }

    // Create new image to preload
    const img = new Image();
    
    img.onload = () => {
      if (mountedRef.current) {
        // Image loaded successfully - set state immediately
        setImageState({
          loading: false,
          loaded: true,
          error: false,
          src: imageUrl,
          attempts: attempt,
          inView: true
        });
        if (onLoad) onLoad();
      }
    };
    
    img.onerror = () => {
      if (!mountedRef.current) return;
      
      const fallbacks = getFallbackImages();
      
      // Try fallback images if original fails
      if (attempt < fallbacks.length) {
        console.log(`Image load failed, trying fallback ${attempt + 1}`);
        // Load next fallback immediately
        loadImage(fallbacks[attempt], attempt + 1);
      } else {
        // All attempts failed - show the last working fallback
        setImageState(prev => ({ 
          ...prev, 
          loading: false, 
          error: false, // Set to false to show last fallback
          loaded: true,
          src: fallbacks[fallbacks.length - 1], // Use last fallback
          attempts: attempt
        }));
        if (onError) onError();
      }
    };
    
    // Start loading
    img.src = imageUrl;
  };

  // Load image when src changes and in view
  useEffect(() => {
    // Only load if in view (or lazy loading disabled)
    if (!imageState.inView) {
      return;
    }
    
    // Don't reload if already loaded with same src
    if (imageState.loaded && imageState.src === src && !imageState.error) {
      return;
    }
    
    // If src changed or we haven't loaded yet
    if (src && (imageState.src !== src || (!imageState.loaded && !imageState.loading))) {
      // Check if src is a valid URL
      try {
        // Check if it's a full URL or starts with http/https
        if (src.startsWith('http://') || src.startsWith('https://')) {
          new URL(src);
          loadImage(src, 0);
        } else {
          // Not a valid URL, use fallback
          loadImage(getRandomFallback(), 0);
        }
      } catch (e) {
        // Invalid URL, use fallback
        console.log('Invalid image URL, using fallback');
        loadImage(getRandomFallback(), 0);
      }
    } else if (!src && !imageState.loaded && !imageState.loading) {
      // No src provided, use random fallback once
      loadImage(getRandomFallback(), 0);
    }
  }, [src, imageState.inView]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`} style={style}>
      {/* Show placeholder immediately if not in view yet */}
      {!imageState.inView && enableLazyLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      )}
      
      {/* Skeleton Loading Animation - when actually loading */}
      {imageState.loading && imageState.inView && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
          
          {/* Loading Content Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              {/* Image Icon Placeholder */}
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              {/* Loading Text */}
              <div className="text-xs text-gray-500 font-medium animate-pulse">
                Loading image...
              </div>
              
              {/* Loading Bar */}
              <div className="w-24 h-1 bg-gray-300 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-loading-bar"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State - Only show if all attempts failed */}
      {imageState.error && !imageState.loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2 text-gray-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Property Image</span>
            <button 
              onClick={() => loadImage(getRandomFallback(), 0)}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Actual Image */}
      {(imageState.loaded && imageState.src) && !imageState.error && (
        <img
          ref={imgRef}
          src={imageState.src}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            imageState.loaded 
              ? 'opacity-100 scale-100 blur-0' 
              : 'opacity-0 scale-110 blur-sm'
          }`}
          style={{
            filter: enableBlurEffect && !imageState.loaded ? 'blur(4px)' : 'blur(0px)'
          }}
        />
      )}

      {/* Success Fade-in Overlay */}
      {imageState.loaded && !imageState.error && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 animate-fade-in"></div>
      )}
    </div>
  );
};

// Add required CSS animations
const addImageLoaderStyles = () => {
  if (document.querySelector('#plugin-image-loader-styles')) return;

  const style = document.createElement('style');
  style.id = 'plugin-image-loader-styles';
  style.textContent = `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    @keyframes loading-bar {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .animate-shimmer {
      animation: shimmer 2s infinite linear;
    }
    
    .animate-loading-bar {
      animation: loading-bar 1.5s infinite ease-in-out;
    }
    
    .animate-fade-in {
      animation: fade-in 0.5s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
};

// Initialize styles
if (typeof window !== 'undefined') {
  addImageLoaderStyles();
}

export default PluginStyleImageLoader;
