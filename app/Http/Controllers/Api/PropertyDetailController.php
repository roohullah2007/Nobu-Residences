<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MLSProperty;
use App\Services\RepliersApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PropertyDetailController extends Controller
{
    private RepliersApiService $repliersApi;

    public function __construct(RepliersApiService $repliersApi)
    {
        $this->repliersApi = $repliersApi;
    }

    /**
     * Get property details by listing key (MLS number)
     */
    public function getPropertyDetail(Request $request): JsonResponse
    {
        $listingKey = $request->input('listingKey');

        if (!$listingKey) {
            return response()->json(['error' => 'Listing key is required'], 400);
        }

        try {
            // First try to get from database (has full mls_data JSON)
            $mlsProperty = MLSProperty::where('mls_id', $listingKey)->first();

            $listing = null;

            if ($mlsProperty && !empty($mlsProperty->mls_data)) {
                $listing = $mlsProperty->mls_data;
            } else {
                // Fallback: fetch from Repliers API
                $listing = $this->repliersApi->getListingByMlsNumber($listingKey);
            }

            if (!$listing) {
                return response()->json(['error' => 'Property not found'], 404);
            }

            // Get images from database or listing data
            $images = $this->getImagesForListing($listingKey, $listing);

            // Format property data for frontend
            $formattedProperty = $this->formatPropertyData($listing);

            // Try to find building data
            $buildingData = $this->findBuildingData($formattedProperty);

            $responseData = [
                'property' => $formattedProperty,
                'images' => $images,
                'buildingData' => $buildingData,
            ];

            return response()->json($responseData);

        } catch (\Exception $e) {
            Log::error('Failed to fetch property detail: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch property details'], 500);
        }
    }

    /**
     * Format Repliers listing data for frontend
     */
    private function formatPropertyData(array $listing): array
    {
        // Detect format: Repliers has nested 'address', AMPRE has flat 'City'
        $isRepliers = isset($listing['address']) && is_array($listing['address']);

        if ($isRepliers) {
            $address = $listing['address'] ?? [];
            $details = $listing['details'] ?? [];
            $map = $listing['map'] ?? [];
            $condominium = $listing['condominium'] ?? [];
            $lot = $listing['lot'] ?? [];
            $taxes = $listing['taxes'] ?? [];
            $timestamps = $listing['timestamps'] ?? [];
            $office = $listing['office'] ?? [];
            $agents = $listing['agents'] ?? [];
            $listAgent = $agents[0] ?? [];

            $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
            if (!empty($address['unitNumber'])) {
                $fullAddress = $address['unitNumber'] . ' - ' . $fullAddress;
            }
        } else {
            // Old AMPRE flat format
            $address = [];
            $details = [];
            $map = [];
            $condominium = [];
            $lot = [];
            $taxes = [];
            $timestamps = [];
            $office = [];
            $agents = [];
            $listAgent = [];

            $fullAddress = $listing['UnparsedAddress'] ?? '';
        }

        // Helper to get field from either format
        $get = function(string $repliersPath, string $ampreKey, $default = '') use ($listing, $isRepliers, $address, $details, $map, $condominium, $office, $timestamps) {
            if ($isRepliers) {
                $parts = explode('.', $repliersPath);
                $val = $listing;
                foreach ($parts as $p) { $val = $val[$p] ?? null; if ($val === null) break; }
                return $val ?? $default;
            }
            return $listing[$ampreKey] ?? $default;
        };

        return [
            'listingKey' => $get('mlsNumber', 'ListingKey'),
            'address' => $fullAddress,
            'streetNumber' => $get('address.streetNumber', 'StreetNumber'),
            'streetName' => $get('address.streetName', 'StreetName'),
            'streetSuffix' => $get('address.streetSuffix', 'StreetSuffix'),
            'unitNumber' => $get('address.unitNumber', 'UnitNumber'),
            'city' => $get('address.city', 'City'),
            'province' => $get('address.state', 'StateOrProvince', 'ON'),
            'postalCode' => $get('address.zip', 'PostalCode'),
            'country' => $get('address.country', 'Country', 'Canada'),

            // Pricing
            'listPrice' => $get('listPrice', 'ListPrice', 0),
            'originalListPrice' => $get('originalPrice', 'OriginalListPrice'),
            'closePrice' => $get('soldPrice', 'ClosePrice'),

            // Property details
            'propertyType' => $get('details.propertyType', 'PropertyType'),
            'propertySubType' => $isRepliers ? ($details['style'] ?? $details['propertyType'] ?? '') : ($listing['PropertySubType'] ?? ''),
            'transactionType' => $isRepliers ? ucfirst($listing['type'] ?? 'Sale') : ($listing['TransactionType'] ?? 'For Sale'),
            'standardStatus' => $isRepliers
                ? $this->mapRepliersStatusToReadable($listing['status'] ?? 'A', $listing['lastStatus'] ?? '')
                : ($listing['StandardStatus'] ?? 'Active'),
            'mlsStatus' => $isRepliers ? ($listing['lastStatus'] ?? '') : ($listing['MlsStatus'] ?? ''),

            // Rooms and spaces
            'bedroomsTotal' => $isRepliers
                ? (($details['numBedrooms'] ?? 0) + ($details['numBedroomsPlus'] ?? 0))
                : ($listing['BedroomsTotal'] ?? 0),
            'bathroomsTotal' => $isRepliers
                ? (($details['numBathrooms'] ?? 0) + ($details['numBathroomsPlus'] ?? 0))
                : ($listing['BathroomsTotalInteger'] ?? 0),
            'bathroomsFull' => $isRepliers ? ($details['numBathrooms'] ?? 0) : ($listing['BathroomsFull'] ?? 0),
            'bathroomsHalf' => $isRepliers ? ($details['numBathroomsPlus'] ?? 0) : ($listing['BathroomsHalf'] ?? 0),
            'bathroomsThreeQuarter' => 0,

            // Size and dimensions
            'livingArea' => $isRepliers ? ($details['sqft'] ?? null) : ($listing['LivingAreaRange'] ?? $listing['LivingArea'] ?? $listing['AboveGradeFinishedArea'] ?? null),
            'livingAreaUnits' => 'sqft',
            'lotSizeArea' => $isRepliers ? ($lot['size'] ?? null) : ($listing['LotSizeArea'] ?? null),
            'lotSizeUnits' => 'sqft',
            'aboveGradeFinishedArea' => null,
            'belowGradeFinishedArea' => null,

            // Year and dates
            'yearBuilt' => $get('details.yearBuilt', 'YearBuilt'),
            'ListingContractDate' => $get('listDate', 'ListingContractDate'),
            'listingContractDate' => $get('listDate', 'ListingContractDate'),
            'OnMarketDate' => $get('listDate', 'OnMarketDate'),
            'onMarketDate' => $get('listDate', 'OnMarketDate'),
            'OriginalOnMarketTimestamp' => null,
            'originalOnMarketTimestamp' => null,
            'ModificationTimestamp' => $get('timestamps.listingUpdated', 'ModificationTimestamp'),
            'modificationTimestamp' => $get('timestamps.listingUpdated', 'ModificationTimestamp'),
            'ListDate' => $get('listDate', 'ListDate'),
            'listDate' => $get('listDate', 'ListDate'),
            'CloseDate' => $get('soldDate', 'CloseDate'),
            'closeDate' => $get('soldDate', 'CloseDate'),
            'DaysOnMarket' => $isRepliers ? ($listing['daysOnMarket'] ?? $listing['simpleDaysOnMarket'] ?? null) : ($listing['DaysOnMarket'] ?? null),
            'daysOnMarket' => $isRepliers ? ($listing['daysOnMarket'] ?? $listing['simpleDaysOnMarket'] ?? null) : ($listing['DaysOnMarket'] ?? null),
            'CumulativeDaysOnMarket' => $get('daysOnMarket', 'CumulativeDaysOnMarket'),
            'cumulativeDaysOnMarket' => $get('daysOnMarket', 'CumulativeDaysOnMarket'),

            // Parking
            'parkingTotal' => $isRepliers ? ($details['numParkingSpaces'] ?? 0) : ($listing['ParkingTotal'] ?? 0),
            'garageSpaces' => $isRepliers ? ($details['numGarageSpaces'] ?? 0) : ($listing['GarageSpaces'] ?? 0),
            'coveredSpaces' => 0,
            'openParkingSpaces' => 0,
            'parkingFeatures' => [],

            // Description
            'publicRemarks' => $isRepliers ? ($details['description'] ?? '') : ($listing['PublicRemarks'] ?? ''),
            'privateRemarks' => '',

            // Features and amenities
            'features' => [],
            'appliances' => [],
            'heating' => $isRepliers ? ($details['heating'] ?? '') : ($listing['Heating'] ?? ''),
            'cooling' => $isRepliers ? ($details['airConditioning'] ?? '') : ($listing['Cooling'] ?? ''),
            'fireplaceFeatures' => [],
            'flooring' => [],
            'interiorFeatures' => [],
            'exteriorFeatures' => [],
            'poolFeatures' => $details['swimmingPool'] ?? '',
            'waterSource' => [],
            'sewer' => [],
            'utilities' => [],
            'view' => [],

            // Building and construction
            'architecturalStyle' => $details['style'] ?? '',
            'constructionMaterials' => $details['exteriorConstruction1'] ?? '',
            'foundation' => [],
            'roof' => [],
            'stories' => $condominium['stories'] ?? null,
            'storiesTotal' => $condominium['stories'] ?? null,

            // HOA and fees
            'associationFee' => $isRepliers
                ? ($condominium['fees']['maintenance'] ?? $details['maintenanceFee'] ?? null)
                : ($listing['AssociationFee'] ?? null),
            'associationFeeFrequency' => $isRepliers ? 'Monthly' : ($listing['AssociationFeeFrequency'] ?? 'Monthly'),
            'associationName' => $isRepliers ? ($condominium['condoCorp'] ?? null) : ($listing['AssociationName'] ?? null),
            'associationAmenities' => $isRepliers ? ($condominium['amenities'] ?? []) : ($listing['AssociationAmenities'] ?? []),

            // Tax
            'taxYear' => $isRepliers
                ? (!empty($taxes) ? ($taxes['assessmentYear'] ?? (isset($taxes[0]) ? ($taxes[0]['assessmentYear'] ?? null) : null)) : null)
                : ($listing['TaxYear'] ?? $listing['AssessmentYear'] ?? null),
            'taxAnnualAmount' => $isRepliers
                ? (!empty($taxes) ? ($taxes['annualAmount'] ?? (isset($taxes[0]) ? ($taxes[0]['annualAmount'] ?? null) : null)) : null)
                : ($listing['TaxAnnualAmount'] ?? null),
            'taxAssessedValue' => null,

            // Location
            'latitude' => $isRepliers ? ($map['latitude'] ?? null) : ($listing['Latitude'] ?? null),
            'longitude' => $isRepliers ? ($map['longitude'] ?? null) : ($listing['Longitude'] ?? null),
            'directions' => '',
            'crossStreet' => $isRepliers ? ($address['majorIntersection'] ?? '') : ($listing['CrossStreet'] ?? ''),

            // Listing information
            'listingId' => $get('mlsNumber', 'ListingKey'),
            'listOfficeName' => $isRepliers ? ($office['brokerageName'] ?? '') : ($listing['ListOfficeName'] ?? ''),
            'listOfficePhone' => $listing['ListOfficePhone'] ?? '',
            'listAgentFullName' => $isRepliers ? ($listAgent['name'] ?? '') : ($listing['ListAgentFullName'] ?? ''),
            'listAgentDirectPhone' => $isRepliers ? ($listAgent['phone'] ?? '') : ($listing['ListAgentDirectPhone'] ?? ''),
            'listAgentEmail' => $isRepliers ? ($listAgent['email'] ?? '') : ($listing['ListAgentEmail'] ?? ''),

            // Virtual tour
            'virtualTourURLUnbranded' => $isRepliers ? ($details['virtualTourUrl'] ?? '') : ($listing['VirtualTourURLUnbranded'] ?? ''),

            // Additional info
            'disclaimer' => '',
            'disclosures' => [],
            'exclusions' => '',
            'inclusions' => '',
            'ownership' => '',
            'possessionDate' => $timestamps['possessionDate'] ?? null,
            'zoning' => '',
            'zoningDescription' => '',

            // Additional fields
            'boardId' => $listing['boardId'] ?? null,
            'photoCount' => $listing['photoCount'] ?? 0,
            'exposure' => $isRepliers ? ($condominium['exposure'] ?? $details['exposure'] ?? '') : ($listing['Exposure'] ?? ''),
            'Exposure' => $isRepliers ? ($condominium['exposure'] ?? $details['exposure'] ?? '') : ($listing['Exposure'] ?? ''),
            'pets' => $condominium['pets'] ?? '',
            'locker' => $condominium['locker'] ?? '',
            'balcony' => $details['balcony'] ?? '',
            'den' => $details['den'] ?? '',
            'elevator' => $details['elevator'] ?? '',
            'basement' => $details['basement1'] ?? '',
            'garage' => $details['garage'] ?? '',
        ];
    }

    /**
     * Get nearby listings for a property
     */
    public function getNearbyListings(Request $request): JsonResponse
    {
        $listingKey = $request->input('listingKey');
        $limit = $request->input('limit', 6);

        if (!$listingKey) {
            return response()->json(['error' => 'Listing key is required'], 400);
        }

        try {
            // Get the main property from database
            $mlsProperty = MLSProperty::where('mls_id', $listingKey)->first();

            if (!$mlsProperty) {
                return response()->json(['properties' => []]);
            }

            $city = $mlsProperty->city ?? 'Toronto';

            // Search for nearby listings in the same city
            $result = $this->repliersApi->searchListings([
                'city' => $city,
                'status' => 'A',
                'class' => 'condoProperty',
                'type' => 'sale',
                'resultsPerPage' => $limit + 5,
                'sortBy' => 'updatedOnDesc',
            ]);

            if (empty($result['listings'])) {
                return response()->json(['properties' => []]);
            }

            // Filter out current property
            $nearbyListings = array_filter($result['listings'], function ($l) use ($listingKey) {
                return ($l['mlsNumber'] ?? '') !== $listingKey;
            });

            $nearbyListings = array_slice($nearbyListings, 0, $limit);

            $formattedProperties = array_map([$this, 'formatPropertyForListing'], $nearbyListings);

            return response()->json([
                'properties' => array_values($formattedProperties),
                'count' => count($formattedProperties),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch nearby listings: ' . $e->getMessage());
            return response()->json(['properties' => []], 200);
        }
    }

    /**
     * Get similar listings for a property
     */
    public function getSimilarListings(Request $request): JsonResponse
    {
        $listingKey = $request->input('listingKey');
        $limit = $request->input('limit', 6);

        if (!$listingKey) {
            return response()->json(['error' => 'Listing key is required'], 400);
        }

        try {
            // Get from DB first for context
            $mlsProperty = MLSProperty::where('mls_id', $listingKey)->first();
            $mlsData = $mlsProperty->mls_data ?? [];

            $boardId = $mlsData['boardId'] ?? null;

            // Try Repliers similar endpoint if we have boardId
            if ($boardId) {
                $similarListings = $this->repliersApi->getSimilarListings($listingKey, $boardId, $limit);

                if (!empty($similarListings)) {
                    $formattedProperties = array_map([$this, 'formatPropertyForListing'], $similarListings);

                    return response()->json([
                        'properties' => array_values($formattedProperties),
                        'count' => count($formattedProperties),
                    ]);
                }
            }

            // Fallback: search for similar properties manually
            $params = [
                'status' => 'A',
                'class' => 'condoProperty',
                'type' => 'sale',
                'resultsPerPage' => $limit + 5,
                'sortBy' => 'updatedOnDesc',
            ];

            if ($mlsProperty) {
                if ($mlsProperty->city) {
                    $params['city'] = $mlsProperty->city;
                }
                if ($mlsProperty->price) {
                    $params['minPrice'] = max(0, (int) ($mlsProperty->price * 0.7));
                    $params['maxPrice'] = (int) ($mlsProperty->price * 1.3);
                }
                if ($mlsProperty->bedrooms) {
                    $params['minBedrooms'] = max(0, $mlsProperty->bedrooms - 1);
                    $params['maxBedrooms'] = $mlsProperty->bedrooms + 1;
                }
            }

            $result = $this->repliersApi->searchListings($params);

            $similarListings = array_filter($result['listings'] ?? [], function ($l) use ($listingKey) {
                return ($l['mlsNumber'] ?? '') !== $listingKey;
            });

            $similarListings = array_slice($similarListings, 0, $limit);
            $formattedProperties = array_map([$this, 'formatPropertyForListing'], $similarListings);

            return response()->json([
                'properties' => array_values($formattedProperties),
                'count' => count($formattedProperties),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch similar listings: ' . $e->getMessage());
            return response()->json(['properties' => []], 200);
        }
    }

    /**
     * Format a Repliers listing for property card display
     */
    private function formatPropertyForListing(array $listing): array
    {
        $address = $listing['address'] ?? [];
        $details = $listing['details'] ?? [];
        $map = $listing['map'] ?? [];
        $images = $listing['images'] ?? [];

        $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
        if (!empty($address['unitNumber'])) {
            $fullAddress = $address['unitNumber'] . ' - ' . $fullAddress;
        }

        $imageUrl = !empty($images) ? $this->repliersApi->getImageUrl($images[0]) : null;

        $allImages = array_map(function ($img, $index) {
            return [
                'MediaURL' => $this->repliersApi->getImageUrl($img),
                'Order' => $index,
            ];
        }, $images, array_keys($images));

        return [
            'listingKey' => $listing['mlsNumber'] ?? '',
            'address' => $fullAddress,
            'streetNumber' => $address['streetNumber'] ?? '',
            'streetName' => $address['streetName'] ?? '',
            'streetSuffix' => $address['streetSuffix'] ?? '',
            'unitNumber' => $address['unitNumber'] ?? '',
            'city' => $address['city'] ?? '',
            'province' => $address['state'] ?? 'ON',
            'price' => $listing['listPrice'] ?? 0,
            'propertyType' => $details['propertyType'] ?? '',
            'propertySubType' => $details['style'] ?? '',
            'transactionType' => ucfirst($listing['type'] ?? 'Sale'),
            'bedroomsTotal' => ($details['numBedrooms'] ?? 0) + ($details['numBedroomsPlus'] ?? 0),
            'bathroomsTotalInteger' => ($details['numBathrooms'] ?? 0) + ($details['numBathroomsPlus'] ?? 0),
            'livingAreaRange' => $details['sqft'] ?? '',
            'parkingTotal' => $details['numParkingSpaces'] ?? 0,
            'listOfficeName' => $listing['office']['brokerageName'] ?? '',
            'latitude' => $map['latitude'] ?? null,
            'longitude' => $map['longitude'] ?? null,
            'standardStatus' => $this->mapRepliersStatusToReadable($listing['status'] ?? 'A', $listing['lastStatus'] ?? ''),
            'mlsStatus' => $listing['lastStatus'] ?? '',
            'imageUrl' => $imageUrl,
            'MediaURL' => $imageUrl,
            'images' => $allImages,
        ];
    }

    /**
     * Get images for a listing from DB or listing data
     */
    private function getImagesForListing(string $listingKey, array $listing): array
    {
        // Try database first
        $mlsProperty = MLSProperty::where('mls_id', $listingKey)->first();

        if ($mlsProperty && !empty($mlsProperty->image_urls)) {
            $images = [];
            foreach ($mlsProperty->image_urls as $index => $url) {
                $images[] = [
                    'url' => $url,
                    'caption' => '',
                    'description' => '',
                    'order' => $index,
                    'modificationTimestamp' => null,
                ];
            }
            return $images;
        }

        // Fall back to listing images from API
        $listingImages = $listing['images'] ?? [];
        $images = [];
        foreach ($listingImages as $index => $filename) {
            $images[] = [
                'url' => $this->repliersApi->getImageUrl($filename),
                'caption' => '',
                'description' => '',
                'order' => $index,
                'modificationTimestamp' => null,
            ];
        }

        return $images;
    }

    /**
     * Try to find building data by address
     */
    private function findBuildingData(array $formattedProperty): ?array
    {
        if (empty($formattedProperty['address'])) {
            return null;
        }

        $addressParts = explode(',', $formattedProperty['address']);
        if (count($addressParts) > 0) {
            $buildingAddress = trim($addressParts[0]);
            $buildingAddress = preg_replace('/^(\d+\s*-\s*)?/', '', $buildingAddress);

            $building = \App\Models\Building::with('amenities')
                ->where('address', 'LIKE', '%' . $buildingAddress . '%')
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
                    'amenities' => $building->amenities()->get()->map(function ($amenity) {
                        return [
                            'id' => $amenity->id,
                            'name' => $amenity->name,
                            'icon' => $amenity->icon,
                            'category' => $amenity->category,
                        ];
                    })->toArray(),
                ];
            }
        }

        return null;
    }

    /**
     * Map Repliers status codes to human-readable status
     * Repliers uses: status "A" (active), "U" (unavailable)
     * lastStatus: "Sld" (sold), "Lsd" (leased), "New", "Sc" (sold conditional), etc.
     */
    private function mapRepliersStatusToReadable(string $status, string $lastStatus = ''): string
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
        if (in_array($lastStatusLower, ['ter', 'sus'])) {
            return 'Terminated';
        }

        return strtoupper($status) === 'A' ? 'Active' : 'Inactive';
    }
}
