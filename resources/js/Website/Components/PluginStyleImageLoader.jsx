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

  // No fallback images - we'll show a proper "no image" placeholder instead

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
      
      // Image load failed - show error state (no fallback)
      setImageState(prev => ({ 
        ...prev, 
        loading: false, 
        error: true, // Show error state
        loaded: false,
        src: null,
        attempts: attempt + 1
      }));
      if (onError) onError();
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
        // Convert to string and trim
        const srcString = String(src).trim();

        // If empty string after conversion, show error
        if (!srcString) {
          setImageState(prev => ({
            ...prev,
            loading: false,
            error: true,
            loaded: false,
            src: null,
            inView: true
          }));
          return;
        }

        // For AMPRE images, ensure we're using HTTP
        let processedSrc = srcString;
        if (srcString.includes('ampre.ca') && srcString.startsWith('https://')) {
          processedSrc = srcString.replace('https://', 'http://');
          console.log('Converting AMPRE URL to HTTP:', processedSrc);
        }

        // Check if it's a full URL or starts with http/https
        if (processedSrc.startsWith('http://') || processedSrc.startsWith('https://') || processedSrc.startsWith('//')) {
          loadImage(processedSrc, 0);
        } else if (processedSrc.startsWith('/')) {
          // Relative URL - try to load it
          loadImage(processedSrc, 0);
        } else {
          // Not a valid URL, show error state
          setImageState(prev => ({
            ...prev,
            loading: false,
            error: true,
            loaded: false,
            src: null,
            inView: true
          }));
        }
      } catch (e) {
        // Invalid URL, show error state
        console.log('Invalid image URL:', src);
        setImageState(prev => ({ 
          ...prev, 
          loading: false, 
          error: true,
          loaded: false,
          src: null,
          inView: true
        }));
      }
    } else if (!src && !imageState.loaded && !imageState.loading) {
      // No src provided, show error state
      setImageState(prev => ({ 
        ...prev, 
        loading: false, 
        error: true,
        loaded: false,
        src: null,
        inView: true
      }));
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

      {/* Error State - Show professional no image placeholder */}
      {imageState.error && !imageState.loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2 text-gray-400">
            <div className="w-16 h-16 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium">No Image Available</span>
            {src && typeof src === 'string' && src.startsWith('http') && (
              <button
                onClick={() => loadImage(src, 0)}
                className="text-xs text-blue-500 hover:text-blue-700 underline"
              >
                Retry
              </button>
            )}
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
