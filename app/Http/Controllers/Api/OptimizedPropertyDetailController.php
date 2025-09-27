<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Services\AmpreApiService;
use App\Models\Property;
use App\Models\Building;

class OptimizedPropertyDetailController extends Controller
{
    protected $ampreApiService;

    public function __construct(AmpreApiService $ampreApiService)
    {
        $this->ampreApiService = $ampreApiService;
    }

    /**
     * Get all property detail data in a single optimized request
     */
    public function getAllPropertyData(Request $request)
    {
        $listingKey = $request->input('listingKey');

        if (!$listingKey) {
            return response()->json(['error' => 'Listing key is required'], 400);
        }

        // Check cache first
        $cacheKey = 'optimized_property_' . $listingKey;
        $cachedData = Cache::get($cacheKey);

        if ($cachedData && !$request->input('force_refresh')) {
            return response()->json([
                'success' => true,
                'data' => $cachedData,
                'cached' => true
            ]);
        }

        try {
            // Fetch all data in parallel
            $propertyData = $this->getPropertyData($listingKey);

            if (!$propertyData) {
                return response()->json(['error' => 'Property not found'], 404);
            }

            // Prepare response data
            $responseData = [
                'property' => $propertyData,
                'images' => [],
                'nearby' => [],
                'similar' => [],
                'building' => null
            ];

            // Fetch images if MLS property
            if (!is_numeric($listingKey)) {
                $images = $this->ampreApiService->getPropertyImages($listingKey);
                if ($images && isset($images['data'])) {
                    $responseData['images'] = $images['data'];
                }
            }

            // Get building data if available
            if ($propertyData && isset($propertyData['address'])) {
                $buildingData = $this->getBuildingData($propertyData['address']);
                if ($buildingData) {
                    $responseData['building'] = $buildingData;
                }
            }

            // Fetch nearby and similar listings (limit these for performance)
            $responseData['nearby'] = $this->getNearbyListings($listingKey, 3);
            $responseData['similar'] = $this->getSimilarListings($listingKey, $propertyData['propertySubType'] ?? null, 3);

            // Cache the combined result
            Cache::put($cacheKey, $responseData, now()->addMinutes(10));

            return response()->json([
                'success' => true,
                'data' => $responseData,
                'cached' => false
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching optimized property data: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch property data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get property data from local or AMPRE
     */
    private function getPropertyData($listingKey)
    {
        // Check if it's a local property
        if (is_numeric($listingKey)) {
            $property = Property::with(['building.amenities'])->find($listingKey);
            if ($property) {
                return $property->getDisplayData();
            }
        }

        // Try AMPRE API
        $ampreProperty = $this->ampreApiService->getPropertyByKey($listingKey);
        if ($ampreProperty) {
            return $this->formatAmprePropertyData($ampreProperty);
        }

        return null;
    }

    /**
     * Get building data by address
     */
    private function getBuildingData($address)
    {
        if (!$address) return null;

        // Extract building address
        if (preg_match('/^(\d+)\s+([^,\d]+?)(?:\s+\d+)?(?:,|$)/', $address, $matches)) {
            $streetNumber = $matches[1];
            $streetName = trim($matches[2]);
            $buildingAddress = $streetNumber . ' ' . $streetName;

            $building = Building::with(['amenities', 'maintenanceFeeAmenities'])
                ->where('address', 'LIKE', $buildingAddress . '%')
                ->orWhere('address', 'LIKE', $streetNumber . ' ' . $streetName . '%')
                ->first();

            if ($building) {
                return [
                    'id' => $building->id,
                    'name' => $building->name,
                    'slug' => $building->slug,
                    'address' => $building->address,
                    'main_image' => $building->main_image,
                    'units_for_sale' => $building->units_for_sale,
                    'units_for_rent' => $building->units_for_rent,
                    'amenities' => $building->amenities->map(function($amenity) {
                        return [
                            'id' => $amenity->id,
                            'name' => $amenity->name,
                            'icon' => $amenity->icon
                        ];
                    })->toArray(),
                    'maintenance_fee_amenities' => $building->maintenanceFeeAmenities->map(function($amenity) {
                        return [
                            'name' => $amenity->name,
                            'icon' => $amenity->icon,
                            'category' => $amenity->category
                        ];
                    })->toArray()
                ];
            }
        }

        return null;
    }

    /**
     * Get nearby listings (cached)
     */
    private function getNearbyListings($listingKey, $limit = 6)
    {
        $cacheKey = 'nearby_' . $listingKey . '_' . $limit;

        return Cache::remember($cacheKey, now()->addMinutes(30), function() use ($listingKey, $limit) {
            try {
                // This would call your existing nearby listings logic
                $response = app(\App\Http\Controllers\WebsiteController::class)->getNearbyListings(
                    request()->merge(['listingKey' => $listingKey, 'limit' => $limit])
                );

                $data = json_decode($response->getContent(), true);
                return $data['properties'] ?? [];
            } catch (\Exception $e) {
                \Log::error('Error fetching nearby listings: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Get similar listings (cached)
     */
    private function getSimilarListings($listingKey, $propertySubType, $limit = 6)
    {
        $cacheKey = 'similar_' . $listingKey . '_' . ($propertySubType ?? 'all') . '_' . $limit;

        return Cache::remember($cacheKey, now()->addMinutes(30), function() use ($listingKey, $propertySubType, $limit) {
            try {
                // This would call your existing similar listings logic
                $response = app(\App\Http\Controllers\WebsiteController::class)->getSimilarListings(
                    request()->merge([
                        'listingKey' => $listingKey,
                        'propertySubType' => $propertySubType,
                        'limit' => $limit
                    ])
                );

                $data = json_decode($response->getContent(), true);
                return $data['properties'] ?? [];
            } catch (\Exception $e) {
                \Log::error('Error fetching similar listings: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Format AMPRE property data
     */
    private function formatAmprePropertyData($property)
    {
        return [
            'listingKey' => $property['ListingKey'] ?? '',
            'address' => $property['UnparsedAddress'] ?? '',
            'price' => $property['ListPrice'] ?? 0,
            'propertyType' => $property['PropertyType'] ?? '',
            'propertySubType' => $property['PropertySubType'] ?? '',
            'bedrooms' => $property['BedroomsTotal'] ?? 0,
            'bathrooms' => $property['BathroomsTotalInteger'] ?? 0,
            'livingAreaRange' => $property['LivingAreaRange'] ?? '',
            'publicRemarks' => $property['PublicRemarks'] ?? '',
            'listingContractDate' => $property['ListingContractDate'] ?? null,
            'daysOnMarket' => $property['DaysOnMarket'] ?? 0,
            'standardStatus' => $property['StandardStatus'] ?? '',
            'mlsStatus' => $property['MlsStatus'] ?? '',
            'listOfficeName' => $property['ListOfficeName'] ?? '',
            'listAgentName' => $property['ListAgentFullName'] ?? '',
            'city' => $property['City'] ?? '',
            'stateProvince' => $property['StateOrProvince'] ?? '',
            'postalCode' => $property['PostalCode'] ?? '',
            'latitude' => $property['Latitude'] ?? null,
            'longitude' => $property['Longitude'] ?? null,
            'taxAnnualAmount' => $property['TaxAnnualAmount'] ?? 0,
            'associationFee' => $property['AssociationFee'] ?? 0,
            'parkingTotal' => $property['ParkingTotal'] ?? 0,
            'exposure' => $property['Exposure'] ?? '',
            'unitNumber' => $property['UnitNumber'] ?? '',
            'streetNumber' => $property['StreetNumber'] ?? '',
            'streetName' => $property['StreetName'] ?? '',
            'streetSuffix' => $property['StreetSuffix'] ?? '',
            'details' => [
                'type' => $property['PropertySubType'] ?? $property['PropertyType'] ?? '',
                'bedrooms' => $property['BedroomsTotal'] ?? 0,
                'bathrooms' => $property['BathroomsTotalInteger'] ?? 0,
                'parking' => $property['ParkingTotal'] ?? 0,
                'exposure' => $property['Exposure'] ?? '',
                'maintenance' => $property['AssociationFee'] ?? 0,
                'taxes' => $property['TaxAnnualAmount'] ?? 0,
                'area' => $property['LivingAreaRange'] ?? '',
                'description' => $property['PublicRemarks'] ?? ''
            ]
        ];
    }
}