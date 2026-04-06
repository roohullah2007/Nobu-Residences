<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Services\RepliersApiService;
use App\Models\Property;
use App\Models\Building;
use App\Models\MLSProperty;

class OptimizedPropertyDetailController extends Controller
{
    protected $repliersApi;

    public function __construct(RepliersApiService $repliersApi)
    {
        $this->repliersApi = $repliersApi;
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

            // Fetch images from DATABASE (no API call)
            if (!is_numeric($listingKey)) {
                $images = $this->getImagesFromDatabase($listingKey);
                $responseData['images'] = $images;
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
     * Get property data from local database or Repliers API
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

        // Try local MLS database first
        $mlsProperty = MLSProperty::where('mls_id', $listingKey)->first();
        if ($mlsProperty && !empty($mlsProperty->mls_data)) {
            return $this->formatRepliersPropertyData($mlsProperty->mls_data);
        }

        // Fallback to Repliers API
        $repliersListing = $this->repliersApi->getListingByMlsNumber($listingKey);
        if ($repliersListing) {
            return $this->formatRepliersPropertyData($repliersListing);
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
     * Get images from database for a property
     * DATABASE-ONLY: No API calls
     */
    private function getImagesFromDatabase(string $listingKey): array
    {
        $mlsProperty = MLSProperty::where('mls_id', $listingKey)->first();

        if (!$mlsProperty || empty($mlsProperty->image_urls)) {
            return [];
        }

        // Format images for frontend
        $images = [];
        foreach ($mlsProperty->image_urls as $index => $url) {
            $images[] = [
                'url' => $url,
                'MediaURL' => $url,
                'caption' => '',
                'description' => '',
                'order' => $index,
            ];
        }

        return $images;
    }

    /**
     * Format Repliers property data for display
     */
    private function formatRepliersPropertyData($listing)
    {
        $address = $listing['address'] ?? [];
        $details = $listing['details'] ?? [];
        $office = $listing['office'] ?? [];
        $agents = $listing['agents'] ?? [];
        $map = $listing['map'] ?? [];
        $taxes = $listing['taxes'] ?? [];

        $unparsedAddress = $address['unparsedAddress']
            ?? trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));

        $listAgent = !empty($agents) ? ($agents[0]['name'] ?? '') : '';
        $taxAmount = !empty($taxes) ? ($taxes[0]['annualAmount'] ?? 0) : 0;

        return [
            'listingKey' => $listing['mlsNumber'] ?? '',
            'address' => $unparsedAddress,
            'price' => $listing['listPrice'] ?? 0,
            'propertyType' => $details['propertyType'] ?? '',
            'propertySubType' => $details['propertyType'] ?? '',
            'bedrooms' => $details['numBedrooms'] ?? 0,
            'bathrooms' => $details['numBathrooms'] ?? 0,
            'livingAreaRange' => $details['sqft'] ?? '',
            'publicRemarks' => $details['description'] ?? '',
            'listingContractDate' => $listing['listDate'] ?? null,
            'daysOnMarket' => $listing['daysOnMarket'] ?? 0,
            'standardStatus' => $this->mapRepliersStatusReadable($listing['status'] ?? 'A', $listing['lastStatus'] ?? ''),
            'mlsStatus' => $listing['lastStatus'] ?? '',
            'listOfficeName' => $office['brokerageName'] ?? '',
            'listAgentName' => $listAgent,
            'city' => $address['city'] ?? '',
            'stateProvince' => $address['state'] ?? '',
            'postalCode' => $address['zip'] ?? '',
            'latitude' => $map['latitude'] ?? null,
            'longitude' => $map['longitude'] ?? null,
            'taxAnnualAmount' => $taxAmount,
            'associationFee' => $details['maintenanceFee'] ?? 0,
            'parkingTotal' => $details['numParkingSpaces'] ?? 0,
            'exposure' => $details['exposure'] ?? '',
            'unitNumber' => $address['unitNumber'] ?? '',
            'streetNumber' => $address['streetNumber'] ?? '',
            'streetName' => $address['streetName'] ?? '',
            'streetSuffix' => $address['streetSuffix'] ?? '',
            'details' => [
                'type' => $details['propertyType'] ?? '',
                'bedrooms' => $details['numBedrooms'] ?? 0,
                'bathrooms' => $details['numBathrooms'] ?? 0,
                'parking' => $details['numParkingSpaces'] ?? 0,
                'exposure' => $details['exposure'] ?? '',
                'maintenance' => $details['maintenanceFee'] ?? 0,
                'taxes' => $taxAmount,
                'area' => $details['sqft'] ?? '',
                'description' => $details['description'] ?? ''
            ]
        ];
    }

    /**
     * Map Repliers status codes to human-readable status
     */
    private function mapRepliersStatusReadable(string $status, string $lastStatus = ''): string
    {
        $lastStatusLower = strtolower($lastStatus);

        if (in_array($lastStatusLower, ['sld', 'sc'])) {
            return 'Sold';
        }
        if (in_array($lastStatusLower, ['lsd', 'lc'])) {
            return 'Leased';
        }
        if (in_array($lastStatusLower, ['exp'])) {
            return 'Expired';
        }

        return strtoupper($status) === 'A' ? 'Active' : 'Inactive';
    }
}