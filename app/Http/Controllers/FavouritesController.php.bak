<?php

namespace App\Http\Controllers;

use App\Models\UserPropertyFavourite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavouritesController extends Controller
{
    /**
     * Check if a property is favourited by the current user
     */
    public function checkProperty(Request $request)
    {
        $request->validate([
            'property_listing_key' => 'required|string'
        ]);

        if (!Auth::check()) {
            return response()->json([
                'is_favourited' => false,
                'requires_auth' => true
            ]);
        }

        $isFavourited = UserPropertyFavourite::isPropertyFavourited(
            Auth::id(),
            $request->property_listing_key
        );

        return response()->json([
            'is_favourited' => $isFavourited
        ]);
    }

    /**
     * Toggle favourite status for a property
     */
    public function toggleProperty(Request $request)
    {
        $request->validate([
            'property_listing_key' => 'required|string',
            'property_data' => 'nullable|array',
            'property_address' => 'nullable|string',
            'property_price' => 'nullable|numeric',
            'property_type' => 'nullable|string',
            'property_city' => 'nullable|string',
        ]);

        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required',
                'requires_auth' => true
            ], 401);
        }

        $userId = Auth::id();
        $listingKey = $request->property_listing_key;

        // Check if already favourited
        $existing = UserPropertyFavourite::where('user_id', $userId)
            ->where('property_listing_key', $listingKey)
            ->first();

        if ($existing) {
            // Remove from favourites
            $existing->delete();
            
            return response()->json([
                'success' => true,
                'is_favourited' => false,
                'action' => 'removed',
                'message' => 'Property removed from favourites'
            ]);
        } else {
            // Add to favourites
            UserPropertyFavourite::create([
                'user_id' => $userId,
                'property_listing_key' => $listingKey,
                'property_data' => $request->property_data,
                'property_address' => $request->property_address,
                'property_price' => $request->property_price,
                'property_type' => $request->property_type,
                'property_city' => $request->property_city,
            ]);
            
            return response()->json([
                'success' => true,
                'is_favourited' => true,
                'action' => 'added',
                'message' => 'Property added to favourites'
            ]);
        }
    }

    /**
     * Get all favourite properties for the current user
     */
    public function getProperties(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required',
                'requires_auth' => true
            ], 401);
        }

        $favourites = UserPropertyFavourite::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'favourites' => $favourites
        ]);
    }

    /**
     * Remove a property from favourites
     */
    public function removeProperty(Request $request)
    {
        $request->validate([
            'property_listing_key' => 'required|string'
        ]);

        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required',
                'requires_auth' => true
            ], 401);
        }

        $deleted = UserPropertyFavourite::where('user_id', Auth::id())
            ->where('property_listing_key', $request->property_listing_key)
            ->delete();

        return response()->json([
            'success' => true,
            'deleted' => $deleted > 0,
            'message' => $deleted > 0 ? 'Property removed from favourites' : 'Property not found in favourites'
        ]);
    }
}