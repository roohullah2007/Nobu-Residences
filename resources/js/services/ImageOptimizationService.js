// ImageOptimizationService.js
class ImageOptimizationService {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.timeouts = new Map();
    this.failedImages = new Set();
  }

  // Preload images with timeout and caching
  async preloadImage(url, timeout = 8000) {
    if (!url) return null;
    
    // Return cached result if available
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    // Skip if image previously failed
    if (this.failedImages.has(url)) {
      return null;
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        this.failedImages.add(url);
        reject(new Error(`Image load timeout: ${url}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        this.cache.set(url, url);
        this.loadingPromises.delete(url);
        resolve(url);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        this.loadingPromises.delete(url);
        this.failedImages.add(url);
        reject(new Error(`Failed to load image: ${url}`));
      };

      // Start loading
      img.src = url;
    });

    this.loadingPromises.set(url, loadPromise);
    return loadPromise;
  }

  // Batch preload multiple images with controlled concurrency
  async preloadImages(urls, batchSize = 3) {
    if (!urls || urls.length === 0) return [];
    
    const validUrls = urls.filter(url => url && typeof url === 'string');
    const batches = [];
    
    for (let i = 0; i < validUrls.length; i += batchSize) {
      batches.push(validUrls.slice(i, i + batchSize));
    }

    const results = [];
    for (const batch of batches) {
      const batchPromises = batch.map(url => 
        this.preloadImage(url).catch(error => ({ error, url }))
      );
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  // Check if image is cached
  isImageCached(url) {
    return this.cache.has(url);
  }

  // Check if image failed to load
  hasImageFailed(url) {
    return this.failedImages.has(url);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
    this.failedImages.clear();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }

  // Clear failed images (for retry functionality)
  clearFailedImages() {
    this.failedImages.clear();
  }
}

// Create singleton instance
const imageOptimizationService = new ImageOptimizationService();

export default imageOptimizationService;