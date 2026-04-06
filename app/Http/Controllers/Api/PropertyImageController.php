<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MLSProperty;
use App\Services\RepliersApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

class PropertyImageController extends Controller
{
    private RepliersApiService $repliersApi;

    public function __construct(RepliersApiService $repliersApi)
    {
        $this->repliersApi = $repliersApi;
    }

    /**
     * Get property images for multiple listing keys
     */
    public function getPropertyImages(Request $request)
    {
        $startTime = microtime(true);

        try {
            $listingKeys = $request->input('listing_keys', []);

            if (is_string($listingKeys)) {
                $listingKeys = explode(',', $listingKeys);
                $listingKeys = array_map('trim', $listingKeys);
            }

            $listingKeys = array_filter($listingKeys, function ($key) {
                return !empty($key) && trim($key) !== '';
            });

            if (empty($listingKeys)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No listing keys provided',
                ], 400);
            }

            $batchSize = min(count($listingKeys), 15);
            $listingKeys = array_slice($listingKeys, 0, $batchSize);

            Log::info('Fetching images from DATABASE for listing keys: ' . implode(', ', $listingKeys));

            $imagesByKey = $this->getImagesFromDatabase($listingKeys);

            $formattedImages = [];
            $successCount = 0;

            foreach ($listingKeys as $listingKey) {
                $images = $imagesByKey[$listingKey] ?? [];

                if (!empty($images) && isset($images[0]['MediaURL'])) {
                    $formattedImages[$listingKey] = [
                        'image_url' => $images[0]['MediaURL'],
                        'all_images' => $images,
                        'status' => 'success',
                    ];
                    $successCount++;
                } else {
                    $formattedImages[$listingKey] = [
                        'image_url' => null,
                        'all_images' => [],
                        'status' => 'no_image',
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
                    'execution_time_ms' => $executionTime,
                ],
            ])->header('Cache-Control', 'public, max-age=300');

        } catch (Exception $e) {
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::error("Property images fetch error after {$executionTime}ms: " . $e->getMessage());

            $placeholderImages = [];
            foreach ($listingKeys ?? [] as $listingKey) {
                $placeholderImages[$listingKey] = [
                    'image_url' => null,
                    'all_images' => [],
                    'status' => 'error',
                ];
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch images - using placeholders',
                'data' => [
                    'images' => $placeholderImages,
                    'count' => count($placeholderImages),
                    'success_count' => 0,
                    'execution_time_ms' => $executionTime,
                ],
            ])->header('Cache-Control', 'public, max-age=60');
        }
    }

    /**
     * Get a single property image
     */
    public function getPropertyImage(Request $request)
    {
        $startTime = microtime(true);

        try {
            $listingKey = $request->input('listing_key');

            if (empty($listingKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Listing key is required',
                ], 400);
            }

            $images = $this->getImagesFromDatabase([$listingKey]);
            $propertyImages = $images[$listingKey] ?? [];

            if (!empty($propertyImages) && isset($propertyImages[0]['MediaURL'])) {
                $executionTime = round((microtime(true) - $startTime) * 1000, 2);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'image_url' => $propertyImages[0]['MediaURL'],
                        'all_images' => $propertyImages,
                        'execution_time_ms' => $executionTime,
                    ],
                ])->header('Cache-Control', 'public, max-age=300');
            }

            $executionTime = round((microtime(true) - $startTime) * 1000, 2);

            return response()->json([
                'success' => true,
                'data' => [
                    'image_url' => null,
                    'all_images' => [],
                    'execution_time_ms' => $executionTime,
                ],
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
                    'execution_time_ms' => $executionTime,
                ],
            ])->header('Cache-Control', 'public, max-age=60');
        }
    }

    /**
     * Get images from database for multiple properties
     * Images are Repliers CDN URLs stored during sync
     */
    private function getImagesFromDatabase(array $listingKeys): array
    {
        if (empty($listingKeys)) {
            return [];
        }

        $mlsProperties = MLSProperty::whereIn('mls_id', $listingKeys)
            ->whereNotNull('image_urls')
            ->get()
            ->keyBy('mls_id');

        $imagesByKey = [];

        foreach ($listingKeys as $listingKey) {
            $mlsProperty = $mlsProperties->get($listingKey);

            if ($mlsProperty && !empty($mlsProperty->image_urls)) {
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
            'found' => $mlsProperties->count(),
        ]);

        return $imagesByKey;
    }

    /**
     * Get property images for a single listing with Repliers API fallback
     */
    public function getPropertyImagesWithFallback(string $listingKey)
    {
        $startTime = microtime(true);

        try {
            if (empty($listingKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Listing key is required',
                ], 400);
            }

            Log::info('Fetching images with fallback for listing: ' . $listingKey);

            // Step 1: Try database first
            $dbImages = $this->getImagesFromDatabase([$listingKey]);
            $propertyImages = $dbImages[$listingKey] ?? [];

            if (!empty($propertyImages)) {
                $executionTime = round((microtime(true) - $startTime) * 1000, 2);

                return response()->json([
                    'success' => true,
                    'source' => 'database',
                    'images' => array_map(fn($img) => $img['MediaURL'], $propertyImages),
                    'execution_time_ms' => $executionTime,
                ])->header('Cache-Control', 'public, max-age=300');
            }

            // Step 2: Try Repliers API
            Log::info('No images in DB, fetching from Repliers API for: ' . $listingKey);

            try {
                $result = $this->repliersApi->searchListings([
                    'search' => $listingKey,
                    'resultsPerPage' => 1,
                    'fields' => 'mlsNumber,images',
                ]);

                if (!empty($result['listings'][0])) {
                    $listing = $result['listings'][0];
                    $imageUrls = $this->repliersApi->getListingImageUrls($listing);

                    if (!empty($imageUrls)) {
                        $executionTime = round((microtime(true) - $startTime) * 1000, 2);

                        return response()->json([
                            'success' => true,
                            'source' => 'repliers_api',
                            'images' => $imageUrls,
                            'execution_time_ms' => $executionTime,
                        ])->header('Cache-Control', 'public, max-age=300');
                    }
                }
            } catch (Exception $e) {
                Log::warning('Repliers API image fetch failed: ' . $e->getMessage());
            }

            // Step 3: No images found
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);

            return response()->json([
                'success' => true,
                'source' => 'none',
                'images' => [],
                'execution_time_ms' => $executionTime,
            ])->header('Cache-Control', 'public, max-age=60');

        } catch (Exception $e) {
            $executionTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::error("Property images fetch with fallback error after {$executionTime}ms: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch images',
                'images' => [],
                'execution_time_ms' => $executionTime,
            ], 500)->header('Cache-Control', 'public, max-age=60');
        }
    }
}
