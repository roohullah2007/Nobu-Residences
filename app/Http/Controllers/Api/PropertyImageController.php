<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MLSProperty;
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
            
            Log::info('Fetching images from DATABASE for listing keys: ' . implode(', ', $listingKeys));

            // DATABASE-ONLY: Fetch images from mls_properties table (no API calls)
            $imagesByKey = $this->getImagesFromDatabase($listingKeys);
            
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
            
            // DATABASE-ONLY: Fetch images from mls_properties table (no API call)
            $images = $this->getImagesFromDatabase([$listingKey]);
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

    /**
     * Get images from database for multiple properties
     * DATABASE-ONLY: No API calls - uses images stored in mls_properties table
     */
    private function getImagesFromDatabase(array $listingKeys): array
    {
        if (empty($listingKeys)) {
            return [];
        }

        // Single query to get all properties with their images
        $mlsProperties = MLSProperty::whereIn('mls_id', $listingKeys)
            ->whereNotNull('image_urls')
            ->get()
            ->keyBy('mls_id');

        $imagesByKey = [];

        foreach ($listingKeys as $listingKey) {
            $mlsProperty = $mlsProperties->get($listingKey);

            if ($mlsProperty && !empty($mlsProperty->image_urls)) {
                // Format images in the same structure as API response
                $images = [];
                foreach ($mlsProperty->image_urls as $index => $url) {
                    $images[] = [
                        'MediaURL' => $url,
                        'Order' => $index,
                    ];
                }
                $imagesByKey[$listingKey] = $images;
            } else {
                $imagesByKey[$listingKey] = [];
            }
        }

        Log::debug('Loaded images from database', [
            'requested' => count($listingKeys),
            'found' => $mlsProperties->count()
        ]);

        return $imagesByKey;
    }

    /**
     * Get property images for a single listing with MLS API fallback
     * Tries DB first, then MLS API if not found
     */
    public function getPropertyImagesWithFallback(string $listingKey)
    {
        $startTime = microtime(true);

        try {
            if (empty($listingKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Listing key is required'
                ], 400);
            }

            Log::info('Fetching images with fallback for listing: ' . $listingKey);

            // Step 1: Try to get images from database first
            $dbImages = $this->getImagesFromDatabase([$listingKey]);
            $propertyImages = $dbImages[$listingKey] ?? [];

            if (!empty($propertyImages)) {
                // Found images in database
                $processedImages = $this->processAmpreImages($propertyImages);
                $executionTime = round((microtime(true) - $startTime) * 1000, 2);

                return response()->json([
                    'success' => true,
                    'source' => 'database',
                    'images' => array_map(fn($img) => $img['MediaURL'], $processedImages),
                    'execution_time_ms' => $executionTime
                ])->header('Cache-Control', 'public, max-age=300');
            }

            // Step 2: Try to fetch from MLS API
            Log::info('No images in DB, fetching from MLS API for: ' . $listingKey);

            try {
                // Use AmpreApiService to fetch images from MLS
                $this->ampreApi->resetFilters();
                $this->ampreApi->setSelect(['ListingKey', 'Media']);
                $this->ampreApi->addCustomFilter("ListingKey eq '{$listingKey}'");

                $properties = $this->ampreApi->fetchProperties();

                if (!empty($properties) && isset($properties[0])) {
                    $property = $properties[0];
                    $mlsImages = [];

                    // Get images from Media field
                    if (isset($property['Media']) && is_array($property['Media'])) {
                        foreach ($property['Media'] as $media) {
                            if (isset($media['MediaURL'])) {
                                $mlsImages[] = ['MediaURL' => $media['MediaURL']];
                            }
                        }
                    }

                    if (!empty($mlsImages)) {
                        $processedImages = $this->processAmpreImages($mlsImages);
                        $executionTime = round((microtime(true) - $startTime) * 1000, 2);

                        return response()->json([
                            'success' => true,
                            'source' => 'mls_api',
                            'images' => array_map(fn($img) => $img['MediaURL'], $processedImages),
                            'execution_time_ms' => $executionTime
                        ])->header('Cache-Control', 'public, max-age=300');
                    }
                }
            } catch (Exception $e) {
                Log::warning('MLS API image fetch failed: ' . $e->getMessage());
            }

            // Step 3: No images found in either source
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);

            return response()->json([
                'success' => true,
                'source' => 'none',
                'images' => [],
                'execution_time_ms' => $executionTime
            ])->header('Cache-Control', 'public, max-age=60');

        } catch (Exception $e) {
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::error("Property images fetch with fallback error after {$executionTime}ms: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch images',
                'images' => [],
                'execution_time_ms' => $executionTime
            ], 500)->header('Cache-Control', 'public, max-age=60');
        }
    }

    /**
     * Process AMPRE images - convert HTTPS to HTTP
     */
    private function processAmpreImages(array $images): array
    {
        return array_map(function($img) {
            if (isset($img['MediaURL']) && strpos($img['MediaURL'], 'ampre.ca') !== false && strpos($img['MediaURL'], 'https://') === 0) {
                $img['MediaURL'] = str_replace('https://', 'http://', $img['MediaURL']);
            }
            return $img;
        }, $images);
    }
}