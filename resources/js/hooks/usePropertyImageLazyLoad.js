import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for lazy loading property images
 * Implements batch loading similar to IDX-AMPRE plugin
 */
export const usePropertyImageLazyLoad = (options = {}) => {
  const {
    batchSize = 4,
    batchDelay = 100,
    rootMargin = '100px',
    threshold = 0.1,
    debug = false
  } = options;

  const [imageCache, setImageCache] = useState({});
  const [loadingImages, setLoadingImages] = useState(new Set());
  const imageQueue = useRef([]);
  const processingBatch = useRef(false);
  const observerRef = useRef(null);
  const elementsRef = useRef(new Map());

  // Debug logger
  const log = useCallback((...args) => {
    if (debug) {
      console.log('[PropertyImageLazyLoad]', ...args);
    }
  }, [debug]);

  // Get CSRF token
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  // Fetch images from API
  const fetchPropertyImages = async (listingKeys) => {
    try {
      log('Fetching images for listing keys:', listingKeys);
      
      const response = await fetch('/api/property-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken()
        },
        body: JSON.stringify({ listing_keys: listingKeys })
      });

      const result = await response.json();
      
      if (result.success && result.data?.images) {
        log('Successfully fetched images:', result.data.images);
        return result.data.images;
      } else {
        log('Failed to fetch images:', result.message);
        return {};
      }
    } catch (error) {
      console.error('[PropertyImageLazyLoad] Error fetching images:', error);
      return {};
    }
  };

  // Process batch of images
  const processBatch = useCallback(async () => {
    if (imageQueue.current.length === 0) {
      processingBatch.current = false;
      log('No images in queue, batch processing complete');
      return;
    }

    processingBatch.current = true;

    // Take up to batchSize items from queue
    const batch = imageQueue.current.splice(0, batchSize);
    const listingKeys = batch.map(item => item.listingKey);
    
    log('Processing batch of', batch.length, 'images:', listingKeys);

    // Mark images as loading
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      listingKeys.forEach(key => newSet.add(key));
      return newSet;
    });

    // Fetch images from API
    const fetchedImages = await fetchPropertyImages(listingKeys);

    // Update cache with fetched images
    setImageCache(prev => ({
      ...prev,
      ...fetchedImages
    }));

    // Remove from loading state
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      listingKeys.forEach(key => newSet.delete(key));
      return newSet;
    });

    // Trigger callbacks for each element
    batch.forEach(item => {
      const imageData = fetchedImages[item.listingKey];
      if (item.callback && imageData) {
        item.callback(imageData);
      }
    });

    // Process next batch after delay
    setTimeout(() => {
      processBatch();
    }, batchDelay);
  }, [batchSize, batchDelay, log]);

  // Queue image for loading
  const queueImageForLoading = useCallback((listingKey, callback) => {
    // Check if already in cache
    if (imageCache[listingKey]) {
      log('Image already in cache for:', listingKey);
      if (callback) callback(imageCache[listingKey]);
      return;
    }

    // Check if already queued or loading
    const isQueued = imageQueue.current.some(item => item.listingKey === listingKey);
    const isLoading = loadingImages.has(listingKey);
    
    if (isQueued || isLoading) {
      log('Image already queued or loading:', listingKey);
      return;
    }

    // Add to queue
    log('Queueing image for loading:', listingKey);
    imageQueue.current.push({
      listingKey,
      callback
    });

    // Start processing if not already processing
    if (!processingBatch.current) {
      processBatch();
    }
  }, [imageCache, loadingImages, processBatch, log]);

  // Observer callback
  const handleIntersect = useCallback((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const listingKey = element.getAttribute('data-listing-key');
        
        if (listingKey) {
          log('Element with listing key', listingKey, 'is in view');
          
          // Unobserve the element
          observerRef.current?.unobserve(element);
          
          // Get callback from elements map
          const callback = elementsRef.current.get(element);
          
          // Queue for loading
          queueImageForLoading(listingKey, callback);
        }
      }
    });
  }, [queueImageForLoading, log]);

  // Initialize observer
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      log('IntersectionObserver not supported');
      return;
    }

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin,
      threshold
    });

    observerRef.current = observer;
    log('IntersectionObserver initialized');

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, rootMargin, threshold, log]);

  // Observe element for lazy loading
  const observeElement = useCallback((element, listingKey, callback) => {
    if (!element || !listingKey) {
      log('Invalid element or listing key');
      return;
    }

    // Check if already in cache
    if (imageCache[listingKey]) {
      log('Image already cached for:', listingKey);
      if (callback) callback(imageCache[listingKey]);
      return;
    }

    // Set data attribute
    element.setAttribute('data-listing-key', listingKey);
    
    // Store callback
    if (callback) {
      elementsRef.current.set(element, callback);
    }

    // Start observing
    observerRef.current?.observe(element);
    log('Started observing element for listing key:', listingKey);
  }, [imageCache, log]);

  // Unobserve element
  const unobserveElement = useCallback((element) => {
    observerRef.current?.unobserve(element);
    elementsRef.current.delete(element);
  }, []);

  // Force load image immediately
  const loadImageNow = useCallback((listingKey, callback) => {
    queueImageForLoading(listingKey, callback);
  }, [queueImageForLoading]);

  // Get image from cache
  const getImage = useCallback((listingKey) => {
    return imageCache[listingKey] || null;
  }, [imageCache]);

  // Check if image is loading
  const isImageLoading = useCallback((listingKey) => {
    return loadingImages.has(listingKey);
  }, [loadingImages]);

  return {
    observeElement,
    unobserveElement,
    loadImageNow,
    getImage,
    isImageLoading,
    imageCache,
    loadingImages: Array.from(loadingImages)
  };
};

export default usePropertyImageLazyLoad;