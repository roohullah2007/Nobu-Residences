<?php

namespace App\Http\Controllers;

use App\Services\MLSIntegrationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * PropertyImageController - Handles real MLS image fetching
 * 
 * Implements the same image fetching mechanism as the WordPress plugin:
 * - Batch and single image requests
 * - Caching for performance
 * - Proper error handling with fallbacks
 * - Direct integration with AmpreApiService
 */
class PropertyImageController extends Controller
{
    public function __construct()
    {
        // No dependencies needed - we'll use app() to get services
    }

    /**
     * Get property images for given listing keys
     * Supports both single and batch requests (same as plugin)
     */
    public function getPropertyImages(Request $request): JsonResponse
    {
        $request->validate([
            'listing_keys' => 'required|array|min:1|max:10',
            'listing_keys.*' => 'required|string|max:50',
            'batch' => 'boolean'
        ]);

        $listingKeys = $request->input('listing_keys');
        $isBatch = $request->input('batch', false);

        try {
            // Use caching to avoid repeated API calls (same as plugin)
            $cacheKey = 'property_images_' . md5(implode(',', $listingKeys));
            $cacheTTL = 300; // 5 minutes (same as plugin)

            $images = Cache::remember($cacheKey, $cacheTTL, function () use ($listingKeys) {
                return $this->fetchImagesFromMLS($listingKeys);
            });

            if ($isBatch) {
                return response()->json([
                    'success' => true,
                    'images' => $images
                ]);
            } else {
                // Single image response (same format as plugin)
                $listingKey = $listingKeys[0];
                $imageData = $images[$listingKey] ?? ['image_url' => $this->getPlaceholderImage(), 'is_placeholder' => true];

                return response()->json([
                    'success' => true,
                    'images' => [$listingKey => $imageData]
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Error fetching property images', [
                'listing_keys' => $listingKeys,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return placeholder images on error (same as plugin)
            $errorImages = [];
            foreach ($listingKeys as $key) {
                $errorImages[$key] = [
                    'image_url' => $this->getPlaceholderImage(),
                    'is_placeholder' => true
                ];
            }

            return response()->json([
                'success' => true, // Still return success with placeholders
                'images' => $errorImages,
                'warning' => 'Using placeholder images due to API error'
            ]);
        }
    }

    /**
     * Fetch images from MLS API using the AmpreApiService directly
     */
    private function fetchImagesFromMLS(array $listingKeys): array
    {
        $images = [];

        try {
            // Get the AmpreApiService instance
            $ampreApiService = app(\App\Services\AmpreApiService::class);
            
            if (!$ampreApiService) {
                throw new \Exception('Ampre API service not available');
            }

            // Use the AmpreApiService to fetch images directly (same as plugin)
            $mlsImages = $ampreApiService->getPropertiesImages($listingKeys);

            foreach ($listingKeys as $key) {
                if (isset($mlsImages[$key]) && !empty($mlsImages[$key])) {
                    // Get the first (primary) image (same as plugin)
                    $primaryImage = $mlsImages[$key][0] ?? null;
                    
                    if ($primaryImage && isset($primaryImage['MediaURL']) && !empty($primaryImage['MediaURL'])) {
                        $imageUrl = $primaryImage['MediaURL'];
                        
                        // Convert HTTPS to HTTP for AMPRE images to avoid SSL errors
                        if (strpos($imageUrl, 'ampre.ca') !== false && strpos($imageUrl, 'https://') === 0) {
                            $imageUrl = str_replace('https://', 'http://', $imageUrl);
                            Log::info('PropertyImageController - Converting AMPRE URL to HTTP: ' . $imageUrl);
                        }
                        
                        $images[$key] = [
                            'image_url' => $imageUrl,
                            'is_placeholder' => false,
                            'media_key' => $primaryImage['MediaKey'] ?? null
                        ];
                    } else {
                        $images[$key] = [
                            'image_url' => $this->getPlaceholderImage(),
                            'is_placeholder' => true
                        ];
                    }
                } else {
                    $images[$key] = [
                        'image_url' => $this->getPlaceholderImage(),
                        'is_placeholder' => true
                    ];
                }
            }

        } catch (\Exception $e) {
            Log::error('MLS API error in fetchImagesFromMLS', [
                'error' => $e->getMessage(),
                'listing_keys' => $listingKeys
            ]);

            // Return placeholders for all keys on error (same as plugin)
            foreach ($listingKeys as $key) {
                $images[$key] = [
                    'image_url' => $this->getPlaceholderImage(),
                    'is_placeholder' => true
                ];
            }
        }

        return $images;
    }

    /**
     * Get a professional placeholder image (same approach as plugin)
     */
    private function getPlaceholderImage(): string
    {
        // Try to use local placeholder first
        $localPlaceholder = '/assets/images/property-placeholder.jpg';
        
        // Fallback to professional Unsplash image if local not available
        return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80';
    }

    /**
     * Batch fetch multiple property images efficiently (same as plugin)
     */
    public function batchGetPropertyImages(Request $request): JsonResponse
    {
        $request->validate([
            'properties' => 'required|array|min:1|max:20',
            'properties.*.listing_key' => 'required|string|max:50'
        ]);

        $properties = $request->input('properties');
        $listingKeys = array_column($properties, 'listing_key');

        try {
            // Fetch all images in one API call (same as plugin batch processing)
            $images = $this->fetchImagesFromMLS($listingKeys);

            // Format response for batch processing
            $response = [];
            foreach ($properties as $property) {
                $key = $property['listing_key'];
                $response[] = [
                    'listing_key' => $key,
                    'image_url' => $images[$key]['image_url'] ?? $this->getPlaceholderImage(),
                    'is_placeholder' => $images[$key]['is_placeholder'] ?? true
                ];
            }

            return response()->json([
                'success' => true,
                'results' => $response
            ]);

        } catch (\Exception $e) {
            Log::error('Error in batch property image fetch', [
                'listing_keys' => $listingKeys,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch property images',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
