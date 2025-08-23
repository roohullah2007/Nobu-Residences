<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Enhanced Property Images API Controller
 * 
 * Handles advanced property image loading with features inspired by IDX-AMPRE:
 * - Batch image loading for performance
 * - Advanced caching strategies
 * - Smart fallback mechanisms
 * - Priority-based loading
 * - Real MLS image integration
 */
class EnhancedPropertyImagesController extends Controller
{
    private const CACHE_TTL = 3600; // 1 hour
    private const BATCH_SIZE_LIMIT = 50; // Maximum images per batch
    private const HIGH_PRIORITY_CACHE_TTL = 7200; // 2 hours for high priority
    
    /**
     * Get property images with advanced features
     */
    public function getPropertyImages(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'listing_keys' => 'required|array|min:1|max:' . self::BATCH_SIZE_LIMIT,
            'listing_keys.*' => 'required|string|max:50',
            'batch' => 'boolean',
            'priority' => 'in:high,normal,low',
            'cache_duration' => 'integer|min:300|max:86400', // 5 min to 24 hours
            'enable_fallback' => 'boolean',
            'image_size' => 'in:thumbnail,medium,large,original'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid parameters',
                'errors' => $validator->errors()
            ], 400);
        }

        $listingKeys = $request->input('listing_keys', []);
        $isBatch = $request->input('batch', false);
        $priority = $request->input('priority', 'normal');
        $cacheDuration = $request->input('cache_duration', self::CACHE_TTL);
        $enableFallback = $request->input('enable_fallback', true);
        $imageSize = $request->input('image_size', 'medium');

        try {
            // Adjust cache duration based on priority
            if ($priority === 'high') {
                $cacheDuration = self::HIGH_PRIORITY_CACHE_TTL;
            }

            $images = [];
            $cacheHits = [];
            $cacheMisses = [];

            // Check cache first for all requested images
            foreach ($listingKeys as $listingKey) {
                $cacheKey = $this->getCacheKey($listingKey, $imageSize);
                $cachedImage = Cache::get($cacheKey);
                
                if ($cachedImage) {
                    $images[$listingKey] = $cachedImage;
                    $cacheHits[] = $listingKey;
                } else {
                    $cacheMisses[] = $listingKey;
                }
            }

            // Fetch missing images from API
            if (!empty($cacheMisses)) {
                $fetchedImages = $this->fetchImagesFromAPI($cacheMisses, $imageSize, $isBatch);
                
                // Cache the fetched images and add to results
                foreach ($fetchedImages as $listingKey => $imageData) {
                    $cacheKey = $this->getCacheKey($listingKey, $imageSize);
                    Cache::put($cacheKey, $imageData, $cacheDuration);
                    $images[$listingKey] = $imageData;
                }

                // Apply fallback for failed fetches if enabled
                if ($enableFallback) {
                    $images = $this->applyFallbackImages($images, $listingKeys);
                }
            }

            // Log performance metrics for monitoring
            $this->logPerformanceMetrics([
                'total_requested' => count($listingKeys),
                'cache_hits' => count($cacheHits),
                'cache_misses' => count($cacheMisses),
                'batch_mode' => $isBatch,
                'priority' => $priority,
                'processing_time' => microtime(true) - $this->getRequestStartTime()
            ]);

            return response()->json([
                'success' => true,
                'images' => $images,
                'metadata' => [
                    'cache_hits' => count($cacheHits),
                    'cache_misses' => count($cacheMisses),
                    'total_count' => count($images),
                    'priority' => $priority,
                    'batch_mode' => $isBatch
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Enhanced Property Images Error', [
                'message' => $e->getMessage(),
                'listing_keys' => $listingKeys,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch property images',
                'images' => $enableFallback ? $this->getPlaceholderImages($listingKeys) : []
            ], 500);
        }
    }

    /**
     * Fetch images from external MLS API
     */
    private function fetchImagesFromAPI(array $listingKeys, string $imageSize, bool $isBatch): array
    {
        $images = [];
        
        // Use your existing MLS API configuration
        $apiKey = config('services.mls.api_key');
        $apiUrl = config('services.mls.api_url', 'https://api.mls.example.com');
        
        if (!$apiKey) {
            Log::warning('MLS API key not configured, using placeholders');
            // Return placeholder images if no API key
            foreach ($listingKeys as $listingKey) {
                $images[$listingKey] = $this->getPlaceholderImageData($listingKey);
            }
            return $images;
        }

        if ($isBatch && count($listingKeys) > 1) {
            // Batch API call for multiple images
            $images = $this->fetchImagesBatch($listingKeys, $imageSize, $apiKey, $apiUrl);
        } else {
            // Individual API calls
            foreach ($listingKeys as $listingKey) {
                $images[$listingKey] = $this->fetchSingleImage($listingKey, $imageSize, $apiKey, $apiUrl);
            }
        }

        return $images;
    }

    /**
     * Fetch multiple images in a single batch request
     */
    private function fetchImagesBatch(array $listingKeys, string $imageSize, string $apiKey, string $apiUrl): array
    {
        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'Accept' => 'application/json'
                ])
                ->post("{$apiUrl}/media/batch", [
                    'listing_keys' => $listingKeys,
                    'image_size' => $imageSize,
                    'limit_per_property' => 1, // First image only for performance
                    'include_metadata' => true
                ]);

            if (!$response->successful()) {
                throw new \Exception("Batch API request failed: " . $response->status());
            }

            $data = $response->json();
            $images = [];

            foreach ($data['results'] ?? [] as $result) {
                $listingKey = $result['listing_key'];
                $mediaItems = $result['media'] ?? [];
                
                if (!empty($mediaItems)) {
                    $primaryImage = $mediaItems[0];
                    $images[$listingKey] = [
                        'image_url' => $primaryImage['url'],
                        'alt_text' => $primaryImage['description'] ?? "Property image for {$listingKey}",
                        'width' => $primaryImage['width'] ?? null,
                        'height' => $primaryImage['height'] ?? null,
                        'is_placeholder' => false,
                        'metadata' => [
                            'source' => 'mls_api',
                            'image_size' => $imageSize,
                            'fetched_at' => now()->toISOString()
                        ]
                    ];
                } else {
                    $images[$listingKey] = $this->getPlaceholderImageData($listingKey);
                }
            }

            return $images;
        } catch (\Exception $e) {
            Log::error("Batch image fetch failed: " . $e->getMessage());
            // Return placeholders for all requested keys
            $images = [];
            foreach ($listingKeys as $listingKey) {
                $images[$listingKey] = $this->getPlaceholderImageData($listingKey);
            }
            return $images;
        }
    }

    /**
     * Fetch a single property image
     */
    private function fetchSingleImage(string $listingKey, string $imageSize, string $apiKey, string $apiUrl): array
    {
        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'Accept' => 'application/json'
                ])
                ->get("{$apiUrl}/media", [
                    'listing_key' => $listingKey,
                    'image_size' => $imageSize,
                    'limit' => 1
                ]);

            if (!$response->successful()) {
                Log::warning("Single image API request failed for {$listingKey}: " . $response->status());
                return $this->getPlaceholderImageData($listingKey);
            }

            $data = $response->json();
            $mediaItems = $data['media'] ?? [];

            if (!empty($mediaItems)) {
                $primaryImage = $mediaItems[0];
                return [
                    'image_url' => $primaryImage['url'],
                    'alt_text' => $primaryImage['description'] ?? "Property image for {$listingKey}",
                    'width' => $primaryImage['width'] ?? null,
                    'height' => $primaryImage['height'] ?? null,
                    'is_placeholder' => false,
                    'metadata' => [
                        'source' => 'mls_api',
                        'image_size' => $imageSize,
                        'fetched_at' => now()->toISOString()
                    ]
                ];
            }

            return $this->getPlaceholderImageData($listingKey);
        } catch (\Exception $e) {
            Log::error("Single image fetch failed for {$listingKey}: " . $e->getMessage());
            return $this->getPlaceholderImageData($listingKey);
        }
    }

    /**
     * Apply fallback images for missing ones
     */
    private function applyFallbackImages(array $images, array $requestedKeys): array
    {
        foreach ($requestedKeys as $listingKey) {
            if (!isset($images[$listingKey])) {
                $images[$listingKey] = $this->getPlaceholderImageData($listingKey);
            }
        }

        return $images;
    }

    /**
     * Get placeholder images for all requested keys
     */
    private function getPlaceholderImages(array $listingKeys): array
    {
        $images = [];
        foreach ($listingKeys as $listingKey) {
            $images[$listingKey] = $this->getPlaceholderImageData($listingKey);
        }
        return $images;
    }

    /**
     * Get placeholder image data
     */
    private function getPlaceholderImageData(string $listingKey): array
    {
        // Use professional real estate placeholders from Unsplash
        $placeholders = [
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&auto=format&q=80',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format&q=80'
        ];

        // Use listing key hash to consistently select same placeholder
        $index = abs(crc32($listingKey)) % count($placeholders);

        return [
            'image_url' => $placeholders[$index],
            'alt_text' => "Property placeholder image for {$listingKey}",
            'width' => 400,
            'height' => 300,
            'is_placeholder' => true,
            'metadata' => [
                'source' => 'placeholder',
                'image_size' => 'medium',
                'fetched_at' => now()->toISOString()
            ]
        ];
    }

    /**
     * Generate cache key for image
     */
    private function getCacheKey(string $listingKey, string $imageSize): string
    {
        return "property_image:{$listingKey}:{$imageSize}:v2";
    }

    /**
     * Log performance metrics
     */
    private function logPerformanceMetrics(array $metrics): void
    {
        Log::info('Enhanced Property Images Performance', $metrics);
    }

    /**
     * Get request start time for performance measurement
     */
    private function getRequestStartTime(): float
    {
        return defined('LARAVEL_START') ? LARAVEL_START : microtime(true);
    }

    /**
     * Clear image cache for specific listing keys
     */
    public function clearImageCache(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'listing_keys' => 'required|array|min:1',
            'listing_keys.*' => 'required|string|max:50',
            'image_sizes' => 'array',
            'image_sizes.*' => 'in:thumbnail,medium,large,original'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid parameters',
                'errors' => $validator->errors()
            ], 400);
        }

        $listingKeys = $request->input('listing_keys', []);
        $imageSizes = $request->input('image_sizes', ['thumbnail', 'medium', 'large', 'original']);
        $clearedCount = 0;

        foreach ($listingKeys as $listingKey) {
            foreach ($imageSizes as $imageSize) {
                $cacheKey = $this->getCacheKey($listingKey, $imageSize);
                if (Cache::forget($cacheKey)) {
                    $clearedCount++;
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Cleared {$clearedCount} cached images",
            'cleared_count' => $clearedCount
        ]);
    }
}
