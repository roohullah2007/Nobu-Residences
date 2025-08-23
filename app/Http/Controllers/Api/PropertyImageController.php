<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AmpreApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
     * Similar to idx_ampre_get_property_image in WordPress plugin
     */
    public function getPropertyImages(Request $request)
    {
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
            
            // Limit batch size to prevent API overload
            $batchSize = min(count($listingKeys), 10);
            $listingKeys = array_slice($listingKeys, 0, $batchSize);
            
            // Fetch images for the listing keys
            $imagesByKey = $this->ampreApi->getPropertiesImages($listingKeys);
            
            // Format response similar to IDX-AMPRE plugin
            $formattedImages = [];
            foreach ($listingKeys as $listingKey) {
                $images = $imagesByKey[$listingKey] ?? [];
                
                if (!empty($images) && isset($images[0]['MediaURL'])) {
                    $formattedImages[$listingKey] = [
                        'image_url' => $images[0]['MediaURL'],
                        'all_images' => $images,
                        'status' => 'success'
                    ];
                } else {
                    // Use placeholder for properties without images
                    $formattedImages[$listingKey] = [
                        'image_url' => null,
                        'all_images' => [],
                        'status' => 'no_image'
                    ];
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'images' => $formattedImages,
                    'count' => count($formattedImages)
                ]
            ]);
            
        } catch (Exception $e) {
            Log::error('Property images fetch error: ' . $e->getMessage());
            
            // Return placeholder data on error
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
                'message' => 'Failed to fetch images',
                'data' => [
                    'images' => $placeholderImages,
                    'count' => 0
                ]
            ], 500);
        }
    }
    
    /**
     * Get a single property image
     */
    public function getPropertyImage(Request $request)
    {
        try {
            $listingKey = $request->input('listing_key');
            
            if (empty($listingKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Listing key is required'
                ], 400);
            }
            
            // Fetch image for single listing
            $images = $this->ampreApi->getPropertiesImages([$listingKey]);
            $propertyImages = $images[$listingKey] ?? [];
            
            if (!empty($propertyImages) && isset($propertyImages[0]['MediaURL'])) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'image_url' => $propertyImages[0]['MediaURL'],
                        'all_images' => $propertyImages
                    ]
                ]);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'image_url' => null,
                    'all_images' => []
                ]
            ]);
            
        } catch (Exception $e) {
            Log::error('Single property image fetch error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch image',
                'data' => [
                    'image_url' => null,
                    'all_images' => []
                ]
            ], 500);
        }
    }
}