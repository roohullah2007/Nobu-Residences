<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPropertyFavourite;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PropertyFavouriteController extends Controller
{
    /**
     * Get user's favourite properties
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $favourites = UserPropertyFavourite::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $favourites,
                'count' => $favourites->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching favourites: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add property to favourites
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please log in to save favourites',
                    'requires_auth' => true
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'property_listing_key' => 'required|string',
                'property_data' => 'required|array',
                'property_address' => 'nullable|string',
                'property_price' => 'nullable|numeric',
                'property_type' => 'nullable|string',
                'property_city' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid data provided',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Check if already favourited
            $existingFavourite = UserPropertyFavourite::where('user_id', $user->id)
                ->where('property_listing_key', $request->property_listing_key)
                ->first();

            if ($existingFavourite) {
                return response()->json([
                    'success' => false,
                    'message' => 'Property already in favourites',
                    'is_favourited' => true
                ], 409);
            }

            // Create favourite
            $favourite = UserPropertyFavourite::create([
                'user_id' => $user->id,
                'property_listing_key' => $request->property_listing_key,
                'property_data' => $request->property_data,
                'property_address' => $request->property_address,
                'property_price' => $request->property_price,
                'property_type' => $request->property_type,
                'property_city' => $request->property_city,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Property added to favourites',
                'data' => $favourite,
                'is_favourited' => true
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding to favourites: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove property from favourites
     */
    public function destroy(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'property_listing_key' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid data provided',
                    'errors' => $validator->errors()
                ], 400);
            }

            $favourite = UserPropertyFavourite::where('user_id', $user->id)
                ->where('property_listing_key', $request->property_listing_key)
                ->first();

            if (!$favourite) {
                return response()->json([
                    'success' => false,
                    'message' => 'Property not in favourites',
                    'is_favourited' => false
                ], 404);
            }

            $favourite->delete();

            return response()->json([
                'success' => true,
                'message' => 'Property removed from favourites',
                'is_favourited' => false
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error removing from favourites: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if property is favourited by user
     */
    public function check(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => true,
                    'is_favourited' => false,
                    'requires_auth' => true
                ]);
            }

            $validator = Validator::make($request->all(), [
                'property_listing_key' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid data provided',
                    'errors' => $validator->errors()
                ], 400);
            }

            $isFavourited = UserPropertyFavourite::isPropertyFavourited(
                $user->id, 
                $request->property_listing_key
            );

            return response()->json([
                'success' => true,
                'is_favourited' => $isFavourited,
                'requires_auth' => false
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking favourite status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's favourite properties with property data
     */
    public function getFavouritesWithData(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $favourites = UserPropertyFavourite::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Get all listing keys for batch image fetching
            $listingKeys = $favourites->pluck('property_listing_key')->toArray();

            // Fetch images and property data from MLS API if listing keys exist
            $imagesByKey = [];
            $propertiesByKey = [];
            if (!empty($listingKeys)) {
                try {
                    // Use the AmpreApiService to fetch images
                    $ampreApi = app(\App\Services\AmpreApiService::class);

                    // Fetch images
                    $imagesByKey = $ampreApi->getPropertiesImages($listingKeys);

                    // TODO: Fetch latest property data (address, price, etc.)
                    // For now, skip fetching property details to avoid breaking favorites
                    // We'll add this back once we verify the correct API method

                } catch (\Exception $e) {
                    \Log::warning('Failed to fetch MLS data for favourites: ' . $e->getMessage());
                    // Continue without updated data rather than failing
                }
            }

            $formattedFavourites = $favourites->map(function ($favourite) use ($imagesByKey) {
                $propertyData = $favourite->property_data;

                // TODO: Add back property data updates once we verify the API method
                // For now, just use the stored property data

                // Get images from MLS API if available
                $mlsImagesData = $imagesByKey[$favourite->property_listing_key] ?? [];

                // Extract image URLs from the MLS API response
                if (!empty($mlsImagesData)) {
                    $mlsImageUrls = array_map(function($imageItem) {
                        // Extract MediaURL from each image item
                        return $imageItem['MediaURL'] ?? null;
                    }, $mlsImagesData);

                    // Filter out null values
                    $mlsImageUrls = array_filter($mlsImageUrls);

                    // If we have valid image URLs, use them
                    if (!empty($mlsImageUrls)) {
                        $propertyData['images'] = array_values($mlsImageUrls); // Reset array keys
                        $propertyData['imageUrl'] = $mlsImageUrls[0] ?? null;
                    }
                }

                // Return formatted favourite data
                return [
                    'id' => $favourite->id,
                    'property_listing_key' => $favourite->property_listing_key,
                    'property_data' => $propertyData,
                    'property_address' => $favourite->property_address,
                    'property_price' => $favourite->property_price,
                    'property_type' => $favourite->property_type,
                    'property_city' => $favourite->property_city,
                    'favourited_at' => $favourite->created_at->format('Y-m-d H:i:s'),
                    'favourited_date' => $favourite->created_at->format('M d, Y'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedFavourites,
                'count' => $formattedFavourites->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching favourites: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle property favourite status
     */
    public function toggle(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please log in to save favourites',
                    'requires_auth' => true
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'property_listing_key' => 'required|string',
                'property_data' => 'required|array',
                'property_address' => 'nullable|string',
                'property_price' => 'nullable|numeric',
                'property_type' => 'nullable|string',
                'property_city' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid data provided',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Check if already favourited
            $existingFavourite = UserPropertyFavourite::where('user_id', $user->id)
                ->where('property_listing_key', $request->property_listing_key)
                ->first();

            if ($existingFavourite) {
                // Remove from favourites
                $existingFavourite->delete();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Property removed from favourites',
                    'is_favourited' => false,
                    'action' => 'removed'
                ]);
            } else {
                // Add to favourites
                $favourite = UserPropertyFavourite::create([
                    'user_id' => $user->id,
                    'property_listing_key' => $request->property_listing_key,
                    'property_data' => $request->property_data,
                    'property_address' => $request->property_address,
                    'property_price' => $request->property_price,
                    'property_type' => $request->property_type,
                    'property_city' => $request->property_city,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Property added to favourites',
                    'data' => $favourite,
                    'is_favourited' => true,
                    'action' => 'added'
                ]);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error toggling favourite: ' . $e->getMessage()
            ], 500);
        }
    }
}
