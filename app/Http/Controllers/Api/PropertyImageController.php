<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AmpreApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

class PropertyImageController extends Controller
{
    private AmpreApiService $ampreApi;

    public function __construct(AmpreApiService $ampreApi)
    {
        $this->ampreApi = $ampreApi;
    }

    /**
     * Get property images for multiple listing keys
     * Enhanced with better timeout handling and error recovery
     */
    public function getPropertyImages(Request $request)
    {
        $startTime = microtime(true);
        
        try {
            // Get listing keys from request
            $listingKeys = $request->input('listing_keys', []);
            
            // Handle both array and comma-separated string
            if (is_string($listingKeys)) {
                $listingKeys = explode(',', $listingKeys);
                $listingKeys = array_map('trim', $listingKeys);
            }
            
            // Filter out empty values
            $listingKeys = array_filter($listingKeys, function($key) {
                return !empty($key) && trim($key) !== '';
            });
            
            if (empty($listingKeys)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No listing keys provided'
                ], 400);
            }
            
            // Limit batch size to prevent API overload and timeouts
            $batchSize = min(count($listingKeys), 15); // Reduced for better performance
            $listingKeys = array_slice($listingKeys, 0, $batchSize);
            
            Log::info('Fetching images for listing keys: ' . implode(', ', $listingKeys));
            
            // Set timeout context for API calls
            $context = stream_context_create([
                'http' => [
                    'timeout' => 8 // 8 second timeout
                ]
            ]);
            
            // Fetch images for the listing keys with timeout handling
            $imagesByKey = [];
            try {
                $imagesByKey = $this->ampreApi->getPropertiesImages($listingKeys);
            } catch (\Exception $apiException) {
                Log::warning('AMPRE API timeout or error: ' . $apiException->getMessage());
                // Continue with empty results rather than failing completely
                $imagesByKey = [];
            }
            
            // Format response similar to IDX-AMPRE plugin
            $formattedImages = [];
            $successCount = 0;
            
            foreach ($listingKeys as $listingKey) {
                $images = $imagesByKey[$listingKey] ?? [];
                
                if (!empty($images) && isset($images[0]['MediaURL'])) {
                    $imageUrl = $images[0]['MediaURL'];
                    
                    // Convert HTTPS to HTTP for AMPRE images to avoid SSL errors
                    if (strpos($imageUrl, 'ampre.ca') !== false && strpos($imageUrl, 'https://') === 0) {
                        $imageUrl = str_replace('https://', 'http://', $imageUrl);
                    }
                    
                    // Also convert all images in the array
                    $processedImages = array_map(function($img) {
                        if (isset($img['MediaURL']) && strpos($img['MediaURL'], 'ampre.ca') !== false && strpos($img['MediaURL'], 'https://') === 0) {
                            $img['MediaURL'] = str_replace('https://', 'http://', $img['MediaURL']);
                        }
                        return $img;
                    }, $images);
                    
                    $formattedImages[$listingKey] = [
                        'image_url' => $imageUrl,
                        'all_images' => $processedImages,
                        'status' => 'success'
                    ];
                    $successCount++;
                } else {
                    // Use placeholder for properties without images
                    $formattedImages[$listingKey] = [
                        'image_url' => null,
                        'all_images' => [],
                        'status' => 'no_image'
                    ];
                }
            }
            
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::info("Image fetch completed: {$successCount}/{$batchSize} images in {$executionTime}ms");
            
            return response()->json([
                'success' => true,
                'data' => [
                    'images' => $formattedImages,
                    'count' => count($formattedImages),
                    'success_count' => $successCount,
                    'execution_time_ms' => $executionTime
                ]
            ])->header('Cache-Control', 'public, max-age=300'); // 5 minute cache
            
        } catch (Exception $e) {
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::error("Property images fetch error after {$executionTime}ms: " . $e->getMessage());
            
            // Return placeholder data on error but don't fail the entire request
            $placeholderImages = [];
            foreach ($listingKeys ?? [] as $listingKey) {
                $placeholderImages[$listingKey] = [
                    'image_url' => null,
                    'all_images' => [],
                    'status' => 'error'
                ];
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch images - using placeholders',
                'data' => [
                    'images' => $placeholderImages,
                    'count' => count($placeholderImages),
                    'success_count' => 0,
                    'execution_time_ms' => $executionTime
                ]
            ])->header('Cache-Control', 'public, max-age=60'); // 1 minute cache for errors
        }
    }
    
    /**
     * Get a single property image with enhanced timeout handling
     */
    public function getPropertyImage(Request $request)
    {
        $startTime = microtime(true);
        
        try {
            $listingKey = $request->input('listing_key');
            
            if (empty($listingKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Listing key is required'
                ], 400);
            }
            
            // Fetch image for single listing with timeout
            $images = [];
            try {
                $images = $this->ampreApi->getPropertiesImages([$listingKey]);
            } catch (\Exception $apiException) {
                Log::warning("AMPRE API timeout for listing {$listingKey}: " . $apiException->getMessage());
                // Return empty result rather than error
            }
            
            $propertyImages = $images[$listingKey] ?? [];
            
            if (!empty($propertyImages) && isset($propertyImages[0]['MediaURL'])) {
                $imageUrl = $propertyImages[0]['MediaURL'];
                
                // Convert HTTPS to HTTP for AMPRE images to avoid SSL errors
                if (strpos($imageUrl, 'ampre.ca') !== false && strpos($imageUrl, 'https://') === 0) {
                    $imageUrl = str_replace('https://', 'http://', $imageUrl);
                }
                
                // Also convert all images in the array
                $processedImages = array_map(function($img) {
                    if (isset($img['MediaURL']) && strpos($img['MediaURL'], 'ampre.ca') !== false && strpos($img['MediaURL'], 'https://') === 0) {
                        $img['MediaURL'] = str_replace('https://', 'http://', $img['MediaURL']);
                    }
                    return $img;
                }, $propertyImages);
                
                $executionTime = round((microtime(true) - $startTime) * 1000, 2);
                
                return response()->json([
                    'success' => true,
                    'data' => [
                        'image_url' => $imageUrl,
                        'all_images' => $processedImages,
                        'execution_time_ms' => $executionTime
                    ]
                ])->header('Cache-Control', 'public, max-age=300'); // 5 minute cache
            }
            
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'image_url' => null,
                    'all_images' => [],
                    'execution_time_ms' => $executionTime
                ]
            ]);
            
        } catch (Exception $e) {
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::error("Single property image fetch error after {$executionTime}ms: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch image',
                'data' => [
                    'image_url' => null,
                    'all_images' => [],
                    'execution_time_ms' => $executionTime
                ]
            ])->header('Cache-Control', 'public, max-age=60'); // 1 minute cache for errors
        }
    }
}