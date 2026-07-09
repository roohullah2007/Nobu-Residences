<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

            Log::info('Fetching images from Repliers API for listing keys: ' . implode(', ', $listingKeys));

            $imagesByKey = $this->getImagesFromApi($listingKeys);

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

            $images = $this->getImagesFromApi([$listingKey]);
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
     * Get images for multiple properties from the Repliers API in one call.
     * Returns Repliers CDN URLs keyed by listing key.
     */
    private function getImagesFromApi(array $listingKeys): array
    {
        if (empty($listingKeys)) {
            return [];
        }

        $imagesByKey = array_fill_keys($listingKeys, []);

        $result = $this->repliersApi->searchListings([
            'mlsNumber' => array_values($listingKeys),
            'status' => ['A', 'U'],
            'fields' => 'mlsNumber,images',
            'resultsPerPage' => count($listingKeys),
        ]);

        $found = 0;
        foreach ($result['listings'] ?? [] as $listing) {
            $mlsNumber = $listing['mlsNumber'] ?? null;
            if (!$mlsNumber || !array_key_exists($mlsNumber, $imagesByKey)) {
                continue;
            }
            $imageUrls = $this->repliersApi->getListingImageUrls($listing);
            if (empty($imageUrls)) {
                continue;
            }
            $images = [];
            foreach (array_values($imageUrls) as $index => $url) {
                $images[] = [
                    'MediaURL' => $url,
                    'Order' => $index,
                ];
            }
            $imagesByKey[$mlsNumber] = $images;
            $found++;
        }

        Log::debug('Loaded images from Repliers API', [
            'requested' => count($listingKeys),
            'found' => $found,
        ]);

        return $imagesByKey;
    }

    /**
     * Get property images for a single listing from the Repliers API.
     * (Endpoint name kept for frontend compatibility.)
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

            Log::info('Fetching images from Repliers API for listing: ' . $listingKey);

            try {
                $result = $this->repliersApi->searchListings([
                    'mlsNumber' => $listingKey,
                    'status' => ['A', 'U'],
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

            // No images found
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
