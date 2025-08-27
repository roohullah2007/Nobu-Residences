<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\AmpreApiService;

class BuildingController extends Controller
{
    /**
     * Display a listing of buildings
     */
    public function index(Request $request): JsonResponse
    {
        $query = Building::with(['developer', 'amenities']);
        
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('city')) {
            $query->where('city', $request->input('city'));
        }
        
        if ($request->has('building_type')) {
            $query->where('building_type', $request->input('building_type'));
        }
        
        if ($request->has('listing_type')) {
            $query->where('listing_type', $request->input('listing_type'));
        }
        
        if ($request->has('min_price')) {
            $query->where('price_range', '>=', $request->input('min_price'));
        }
        
        if ($request->has('max_price')) {
            $query->where('price_range', '<=', $request->input('max_price'));
        }
        
        if ($request->has('featured')) {
            $query->where('is_featured', true);
        }
        
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        $perPage = $request->input('per_page', 12);
        $buildings = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $buildings->items(),
            'pagination' => [
                'total' => $buildings->total(),
                'per_page' => $buildings->perPage(),
                'current_page' => $buildings->currentPage(),
                'last_page' => $buildings->lastPage(),
                'from' => $buildings->firstItem(),
                'to' => $buildings->lastItem(),
            ]
        ]);
    }
    
    /**
     * Display the specified building
     */
    public function show($id): JsonResponse
    {
        $building = Building::with(['developer', 'amenities', 'properties' => function($query) {
            $query->where('status', 'active')
                  ->orderBy('created_at', 'desc')
                  ->limit(10);
        }])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $building
        ]);
    }
    
    /**
     * Get buildings for search page
     */
    public function search(Request $request): JsonResponse
    {
        $query = Building::with('developer');
        
        if ($request->has('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }
        
        $filters = $request->only([
            'city', 
            'building_type', 
            'listing_type',
            'bedrooms',
            'bathrooms',
            'min_price',
            'max_price',
            'has_parking',
            'has_locker'
        ]);
        
        foreach ($filters as $key => $value) {
            if (!empty($value)) {
                switch($key) {
                    case 'has_parking':
                        if ($value) {
                            $query->where('parking_spots', '>', 0);
                        }
                        break;
                    case 'has_locker':
                        if ($value) {
                            $query->where('locker_spots', '>', 0);
                        }
                        break;
                    default:
                        $query->where($key, $value);
                        break;
                }
            }
        }
        
        $query->where('status', 'active');
        
        $buildings = $query->paginate($request->input('per_page', 12));
        
        return response()->json([
            'success' => true,
            'data' => $buildings->items(),
            'pagination' => [
                'total' => $buildings->total(),
                'per_page' => $buildings->perPage(),
                'current_page' => $buildings->currentPage(),
                'last_page' => $buildings->lastPage(),
            ]
        ]);
    }
    
    /**
     * Get featured buildings
     */
    public function featured(): JsonResponse
    {
        $buildings = Building::where('is_featured', true)
            ->where('status', 'active')
            ->with('developer')
            ->limit(6)
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $buildings
        ]);
    }
    
    /**
     * Get building types
     */
    public function buildingTypes(): JsonResponse
    {
        $types = Building::distinct()
            ->pluck('building_type')
            ->filter()
            ->values();
            
        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }
    
    /**
     * Get cities
     */
    public function cities(): JsonResponse
    {
        $cities = Building::distinct()
            ->pluck('city')
            ->filter()
            ->values();
            
        return response()->json([
            'success' => true,
            'data' => $cities
        ]);
    }
    
    /**
     * Find building by street address
     */
    public function findByAddress(Request $request): JsonResponse
    {
        $streetNumber = $request->input('street_number');
        $streetName = $request->input('street_name');
        
        if (!$streetNumber || !$streetName) {
            return response()->json([
                'success' => false,
                'message' => 'Street number and street name are required',
                'data' => null
            ]);
        }
        
        // Search for building with matching street address
        $searchPattern = $streetNumber . ' ' . $streetName;
        
        $building = Building::with(['developer', 'amenities'])
            ->where(function($query) use ($searchPattern, $streetNumber, $streetName) {
                $query->where('address', 'LIKE', $searchPattern . '%')
                      ->orWhere('address', 'LIKE', $streetNumber . ' ' . $streetName . '%');
            })
            ->where('status', 'active')
            ->first();
            
        if (!$building) {
            return response()->json([
                'success' => false,
                'message' => 'No building found at this address',
                'data' => null
            ]);
        }
        
        return response()->json([
            'success' => true,
            'data' => $building
        ]);
    }
    
    /**
     * Count MLS listings for a building address
     */
    public function countMLSListings(Request $request): JsonResponse
    {
        $streetNumber = $request->input('street_number');
        $streetName = $request->input('street_name');
        
        if (!$streetNumber || !$streetName) {
            return response()->json([
                'success' => false,
                'message' => 'Street number and street name are required',
                'data' => [
                    'for_sale' => 0,
                    'for_rent' => 0
                ]
            ]);
        }
        
        // First check if building has static unit counts
        $searchPattern = $streetNumber . ' ' . $streetName;
        $building = Building::where(function($query) use ($searchPattern, $streetNumber, $streetName) {
                $query->where('address', 'LIKE', $searchPattern . '%')
                      ->orWhere('address', 'LIKE', $streetNumber . ' ' . $streetName . '%');
            })
            ->where('status', 'active')
            ->first();
            
        // If building has static counts, return those
        if ($building && $building->units_for_sale !== null && $building->units_for_rent !== null) {
            return response()->json([
                'success' => true,
                'data' => [
                    'for_sale' => $building->units_for_sale,
                    'for_rent' => $building->units_for_rent,
                    'total' => $building->units_for_sale + $building->units_for_rent,
                    'source' => 'building_static'
                ]
            ]);
        }
        
        // Otherwise, try to use MLS API
        try {
            $ampreService = app(AmpreApiService::class);
            
            // Count FOR SALE listings
            $ampreService->resetFilters();
            
            // Match address pattern
            $streetPattern = $streetNumber . ' ' . $streetName;
            $ampreService->addCustomFilter("contains(UnparsedAddress, '{$streetPattern}')");
            
            // Transaction and Status filters for Sale
            $ampreService->addFilter('TransactionType', 'For Sale', 'eq');
            $ampreService->addFilter('StandardStatus', 'Active', 'eq');
            
            // Filter for Condo Apartments only
            $ampreService->addFilter('PropertySubType', 'Condo Apartment', 'eq');
            
            // Set minimal fields for counting
            $ampreService->setTop(1);
            $ampreService->setSelect(['ListingKey']);
            
            // Get count for sale
            $saleResponse = $ampreService->fetchPropertiesWithCount();
            $forSale = $saleResponse['count'] ?? 0;
            
            // Log the query for debugging
            \Log::info('MLS Sale Query URL: ' . $ampreService->getRequestUrl());
            
            // Count FOR RENT listings
            $ampreService->resetFilters();
            
            // Match address pattern
            $ampreService->addCustomFilter("contains(UnparsedAddress, '{$streetPattern}')");
            
            // Transaction and Status filters for Lease/Rent
            $ampreService->addFilter('TransactionType', 'For Lease', 'eq');
            $ampreService->addFilter('StandardStatus', 'Active', 'eq');
            
            // Filter for Condo Apartments only
            $ampreService->addFilter('PropertySubType', 'Condo Apartment', 'eq');
            
            // Set minimal fields for counting
            $ampreService->setTop(1);
            $ampreService->setSelect(['ListingKey']);
            
            // Get count for rent
            $rentResponse = $ampreService->fetchPropertiesWithCount();
            $forRent = $rentResponse['count'] ?? 0;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'for_sale' => $forSale,
                    'for_rent' => $forRent,
                    'total' => $forSale + $forRent,
                    'source' => 'mls'
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('MLS API error: ' . $e->getMessage());
            
            // Fallback to local database
            $searchPattern = $streetNumber . ' ' . $streetName;
            
            // Count properties for sale
            $forSale = \App\Models\Property::where('transaction_type', 'sale')
                ->where(function($query) use ($searchPattern, $streetNumber, $streetName) {
                    $query->where('address', 'LIKE', $searchPattern . '%')
                          ->orWhere('address', 'LIKE', $streetNumber . ' ' . $streetName . '%');
                })
                ->where('status', 'active')
                ->count();
                
            // Count properties for rent
            $forRent = \App\Models\Property::where('transaction_type', 'rent')
                ->where(function($query) use ($searchPattern, $streetNumber, $streetName) {
                    $query->where('address', 'LIKE', $searchPattern . '%')
                          ->orWhere('address', 'LIKE', $streetNumber . ' ' . $streetName . '%');
                })
                ->where('status', 'active')
                ->count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'for_sale' => $forSale,
                    'for_rent' => $forRent,
                    'total' => $forSale + $forRent,
                    'source' => 'local'
                ]
            ]);
        }
    }
}