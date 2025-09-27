<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AmpreApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PropertyDetailController extends Controller
{
    private AmpreApiService $ampreApi;
    
    public function __construct(AmpreApiService $ampreApi)
    {
        $this->ampreApi = $ampreApi;
    }
    
    /**
     * Get property details by listing key
     */
    public function getPropertyDetail(Request $request): JsonResponse
    {
        $listingKey = $request->input('listingKey');
        
        if (!$listingKey) {
            return response()->json(['error' => 'Listing key is required'], 400);
        }
        
        try {
            // Cache key for this property
            $cacheKey = 'property_detail_' . $listingKey;
            
            // DEBUGGING: Temporarily disable cache to see fresh data
            // $cachedData = Cache::get($cacheKey);
            // if ($cachedData) {
            //     return response()->json($cachedData);
            // }
            
            // Fetch property details from AMPRE API
            $property = $this->ampreApi->getPropertyByKey($listingKey);
            
            if (!$property) {
                return response()->json(['error' => 'Property not found'], 404);
            }
            
            // DEBUGGING: Log the raw property data to see what fields are available
            Log::info('Raw property data from API:', [
                'listingKey' => $listingKey,
                'dateFields' => [
                    'ListingContractDate' => $property['ListingContractDate'] ?? 'NOT_FOUND',
                    'OnMarketDate' => $property['OnMarketDate'] ?? 'NOT_FOUND',
                    'ModificationTimestamp' => $property['ModificationTimestamp'] ?? 'NOT_FOUND',
                    'ListDate' => $property['ListDate'] ?? 'NOT_FOUND',
                    'DaysOnMarket' => $property['DaysOnMarket'] ?? 'NOT_FOUND',
                    'CumulativeDaysOnMarket' => $property['CumulativeDaysOnMarket'] ?? 'NOT_FOUND',
                ],
                'allKeys' => array_keys($property)
            ]);
            
            // Fetch property images
            $images = $this->ampreApi->getPropertiesImages([$listingKey]);
            
            // DEBUGGING: Log the formatted data being sent to frontend
            $formattedProperty = $this->formatPropertyData($property);
            Log::info('Formatted property data being sent to frontend:', [
                'listingKey' => $listingKey,
                'dateFieldsFormatted' => [
                    'ListingContractDate' => $formattedProperty['ListingContractDate'] ?? 'NOT_FOUND',
                    'listingContractDate' => $formattedProperty['listingContractDate'] ?? 'NOT_FOUND',
                    'OnMarketDate' => $formattedProperty['OnMarketDate'] ?? 'NOT_FOUND',
                    'onMarketDate' => $formattedProperty['onMarketDate'] ?? 'NOT_FOUND',
                    'DaysOnMarket' => $formattedProperty['DaysOnMarket'] ?? 'NOT_FOUND',
                    'daysOnMarket' => $formattedProperty['daysOnMarket'] ?? 'NOT_FOUND',
                ]
            ]);
            
            // Make sure the date is properly formatted and passed through
            if ($formattedProperty['ListingContractDate']) {
                Log::info('Found ListingContractDate in property data: ' . $formattedProperty['ListingContractDate']);
            }
            
            // Try to find building data by matching address
            $buildingData = null;
            if (!empty($formattedProperty['address'])) {
                // Extract building address from property address
                $addressParts = explode(',', $formattedProperty['address']);
                if (count($addressParts) > 0) {
                    $buildingAddress = trim($addressParts[0]);
                    // Remove unit number if present
                    $buildingAddress = preg_replace('/^(\d+\s*-\s*)?/', '', $buildingAddress);

                    // Try to find building by address
                    $building = \App\Models\Building::with('amenities')
                        ->where('address', 'LIKE', '%' . $buildingAddress . '%')
                        ->first();

                    if ($building) {
                        $buildingData = [
                            'id' => $building->id,
                            'name' => $building->name,
                            'slug' => $building->slug,
                            'address' => $building->address,
                            'main_image' => $building->main_image,
                            'units_for_sale' => $building->units_for_sale,
                            'units_for_rent' => $building->units_for_rent,
                            'amenities' => $building->amenities()->get()->map(function($amenity) {
                                return [
                                    'id' => $amenity->id,
                                    'name' => $amenity->name,
                                    'icon' => $amenity->icon,
                                    'category' => $amenity->category
                                ];
                            })->toArray()
                        ];
                        Log::info('Found building for API property: ', ['building' => $building->name, 'amenities_count' => count($buildingData['amenities'])]);
                    }
                }
            }

            // Format the response
            $responseData = [
                'property' => $formattedProperty,
                'images' => $this->formatImages($images, $listingKey),
                'buildingData' => $buildingData
            ];
            
            // Cache for 5 minutes - DEBUGGING: Disable cache temporarily
            // Cache::put($cacheKey, $responseData, 300);
            
            return response()->json($responseData);
            
        } catch (\Exception $e) {
            Log::error('Failed to fetch property detail: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch property details'], 500);
        }
    }
    
    /**
     * Format property data for frontend
     */
    private function formatPropertyData($property): array
    {
        return [
            'listingKey' => $property['ListingKey'] ?? '',
            'address' => $property['UnparsedAddress'] ?? '',
            'streetNumber' => $property['StreetNumber'] ?? '',
            'streetName' => $property['StreetName'] ?? '',
            'streetSuffix' => $property['StreetSuffix'] ?? '',
            'unitNumber' => $property['UnitNumber'] ?? '',
            'city' => $property['City'] ?? '',
            'province' => $property['StateOrProvince'] ?? '',
            'postalCode' => $property['PostalCode'] ?? '',
            'country' => $property['Country'] ?? 'Canada',
            
            // Pricing
            'listPrice' => $property['ListPrice'] ?? 0,
            'originalListPrice' => $property['OriginalListPrice'] ?? null,
            'closePrice' => $property['ClosePrice'] ?? null,
            
            // Property details
            'propertyType' => $property['PropertyType'] ?? '',
            'propertySubType' => $property['PropertySubType'] ?? '',
            'transactionType' => $property['TransactionType'] ?? 'For Sale',
            'standardStatus' => $property['StandardStatus'] ?? '',
            'mlsStatus' => $property['MlsStatus'] ?? '',
            
            // Rooms and spaces
            'bedroomsTotal' => $property['BedroomsTotal'] ?? 0,
            'bathroomsTotal' => $property['BathroomsTotalInteger'] ?? 0,
            'bathroomsFull' => $property['BathroomsFull'] ?? 0,
            'bathroomsHalf' => $property['BathroomsHalf'] ?? 0,
            'bathroomsThreeQuarter' => $property['BathroomsThreeQuarter'] ?? 0,
            
            // Size and dimensions
            'livingArea' => $property['LivingArea'] ?? null,
            'livingAreaUnits' => $property['LivingAreaUnits'] ?? 'sqft',
            'lotSizeArea' => $property['LotSizeArea'] ?? null,
            'lotSizeUnits' => $property['LotSizeUnits'] ?? 'sqft',
            'aboveGradeFinishedArea' => $property['AboveGradeFinishedArea'] ?? null,
            'belowGradeFinishedArea' => $property['BelowGradeFinishedArea'] ?? null,
            
            // Year and dates - FIXED: Include all date fields for Days on Market
            'yearBuilt' => $property['YearBuilt'] ?? null,
            'ListingContractDate' => $property['ListingContractDate'] ?? null, // Keep original case
            'listingContractDate' => $property['ListingContractDate'] ?? null, // Camel case version
            'OnMarketDate' => $property['OnMarketDate'] ?? null, // Keep original case
            'onMarketDate' => $property['OnMarketDate'] ?? null, // Camel case version
            'OriginalOnMarketTimestamp' => $property['OriginalOnMarketTimestamp'] ?? null,
            'originalOnMarketTimestamp' => $property['OriginalOnMarketTimestamp'] ?? null,
            'ModificationTimestamp' => $property['ModificationTimestamp'] ?? null, // Keep original case
            'modificationTimestamp' => $property['ModificationTimestamp'] ?? null, // Camel case version
            'ListDate' => $property['ListDate'] ?? null, // Keep original case
            'listDate' => $property['ListDate'] ?? null, // Camel case version
            'CloseDate' => $property['CloseDate'] ?? null, // Keep original case
            'closeDate' => $property['CloseDate'] ?? null, // Camel case version
            'DaysOnMarket' => $property['DaysOnMarket'] ?? null, // Keep original case
            'daysOnMarket' => $property['DaysOnMarket'] ?? null, // Camel case version
            'CumulativeDaysOnMarket' => $property['CumulativeDaysOnMarket'] ?? null,
            'cumulativeDaysOnMarket' => $property['CumulativeDaysOnMarket'] ?? null,
            
            // Parking
            'parkingTotal' => $property['ParkingTotal'] ?? 0,
            'garageSpaces' => $property['GarageSpaces'] ?? 0,
            'coveredSpaces' => $property['CoveredSpaces'] ?? 0,
            'openParkingSpaces' => $property['OpenParkingSpaces'] ?? 0,
            'parkingFeatures' => $property['ParkingFeatures'] ?? [],
            
            // Description
            'publicRemarks' => $property['PublicRemarks'] ?? '',
            'privateRemarks' => $property['PrivateRemarks'] ?? '',
            
            // Features and amenities
            'features' => $property['Features'] ?? [],
            'appliances' => $property['Appliances'] ?? [],
            'heating' => $property['Heating'] ?? [],
            'cooling' => $property['Cooling'] ?? [],
            'fireplaceFeatures' => $property['FireplaceFeatures'] ?? [],
            'flooring' => $property['Flooring'] ?? [],
            'interiorFeatures' => $property['InteriorFeatures'] ?? [],
            'exteriorFeatures' => $property['ExteriorFeatures'] ?? [],
            'poolFeatures' => $property['PoolFeatures'] ?? [],
            'waterSource' => $property['WaterSource'] ?? [],
            'sewer' => $property['Sewer'] ?? [],
            'utilities' => $property['Utilities'] ?? [],
            'view' => $property['View'] ?? [],
            
            // Building and construction
            'architecturalStyle' => $property['ArchitecturalStyle'] ?? [],
            'constructionMaterials' => $property['ConstructionMaterials'] ?? [],
            'foundation' => $property['FoundationDetails'] ?? [],
            'roof' => $property['Roof'] ?? [],
            'stories' => $property['Stories'] ?? null,
            'storiesTotal' => $property['StoriesTotal'] ?? null,
            
            // HOA and fees
            'associationFee' => $property['AssociationFee'] ?? null,
            'associationFeeFrequency' => $property['AssociationFeeFrequency'] ?? null,
            'associationName' => $property['AssociationName'] ?? null,
            'associationAmenities' => $property['AssociationAmenities'] ?? [],
            
            // Tax
            'taxYear' => $property['TaxYear'] ?? null,
            'taxAnnualAmount' => $property['TaxAnnualAmount'] ?? null,
            'taxAssessedValue' => $property['TaxAssessedValue'] ?? null,
            
            // Location
            'latitude' => $property['Latitude'] ?? null,
            'longitude' => $property['Longitude'] ?? null,
            'directions' => $property['Directions'] ?? '',
            'crossStreet' => $property['CrossStreet'] ?? '',
            
            // Listing information
            'listingId' => $property['ListingId'] ?? '',
            'listOfficeName' => $property['ListOfficeName'] ?? '',
            'listOfficePhone' => $property['ListOfficePhone'] ?? '',
            'listAgentFullName' => $property['ListAgentFullName'] ?? '',
            'listAgentDirectPhone' => $property['ListAgentDirectPhone'] ?? '',
            'listAgentEmail' => $property['ListAgentEmail'] ?? '',
            
            // Virtual tour
            'virtualTourURLUnbranded' => $property['VirtualTourURLUnbranded'] ?? '',
            
            // Additional info
            'disclaimer' => $property['Disclaimer'] ?? '',
            'disclosures' => $property['Disclosures'] ?? [],
            'exclusions' => $property['Exclusions'] ?? '',
            'inclusions' => $property['Inclusions'] ?? '',
            'ownership' => $property['Ownership'] ?? '',
            'possessionDate' => $property['PossessionDate'] ?? null,
            'zoning' => $property['Zoning'] ?? '',
            'zoningDescription' => $property['ZoningDescription'] ?? '',
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
            // Get the main property first to get its location
            $property = $this->ampreApi->getPropertyByKey($listingKey);
            
            if (!$property) {
                return response()->json(['error' => 'Property not found'], 404);
            }
            
            $latitude = $property['Latitude'] ?? null;
            $longitude = $property['Longitude'] ?? null;
            
            if (!$latitude || !$longitude) {
                return response()->json(['properties' => []]);
            }
            
            // Configure AMPRE API for nearby search
            $this->ampreApi->resetFilters();
            $this->ampreApi->setSelect([
                'ListingKey', 'UnparsedAddress', 'StreetNumber', 'StreetName', 'StreetSuffix',
                'UnitNumber', 'City', 'StateOrProvince', 'ListPrice', 'PropertyType',
                'PropertySubType', 'TransactionType', 'BedroomsTotal', 'BathroomsTotalInteger',
                'LivingArea', 'ParkingTotal', 'ListOfficeName', 'Latitude', 'Longitude',
                'StandardStatus', 'MlsStatus'
            ]);
            $this->ampreApi->setTop($limit + 5); // Get a few extra to filter out current property

            // Add filters for nearby search
            $this->ampreApi->addFilter('TransactionType', 'For Sale');
            $this->ampreApi->addFilter('StandardStatus', 'Active');

            // Add property type filters
            $propertyTypes = ['Apartment', 'Condo Apartment', 'Condo', 'Townhouse', 'House'];
            $this->ampreApi->setFilterOr('PropertySubType', $propertyTypes);

            // Get city from the current property for location filtering
            $currentCity = $property['City'] ?? '';
            if ($currentCity) {
                $this->ampreApi->addCustomFilter("contains(City, '{$currentCity}')");
            } else {
                // Fallback to Toronto area
                $this->ampreApi->addCustomFilter("contains(City, 'Toronto')");
            }

            // Fetch properties
            $searchResults = $this->ampreApi->fetchProperties();
            
            if (empty($searchResults)) {
                return response()->json(['properties' => []]);
            }

            // Filter out the current property and format results
            $nearbyProperties = array_filter($searchResults, function($prop) use ($listingKey) {
                return ($prop['ListingKey'] ?? '') !== $listingKey;
            });

            // Limit results
            $nearbyProperties = array_slice($nearbyProperties, 0, $limit);

            // Add images to properties
            $propertiesWithImages = $this->addPropertyImages($nearbyProperties);

            // Format properties for frontend
            $formattedProperties = array_map([$this, 'formatPropertyForListing'], $propertiesWithImages);
            
            return response()->json([
                'properties' => $formattedProperties,
                'count' => count($formattedProperties)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to fetch nearby listings: ' . $e->getMessage());
            return response()->json(['properties' => []], 200); // Return empty array instead of error
        }
    }
    
    /**
     * Get similar listings for a property
     */
    public function getSimilarListings(Request $request): JsonResponse
    {
        $listingKey = $request->input('listingKey');
        $propertyType = $request->input('propertyType');
        $propertySubType = $request->input('propertySubType');
        $limit = $request->input('limit', 6);
        
        if (!$listingKey) {
            return response()->json(['error' => 'Listing key is required'], 400);
        }
        
        try {
            // Get the main property first to get its characteristics
            $property = $this->ampreApi->getPropertyByKey($listingKey);
            
            if (!$property) {
                return response()->json(['error' => 'Property not found'], 404);
            }
            
            $currentPrice = $property['ListPrice'] ?? 0;
            $currentBedrooms = $property['BedroomsTotal'] ?? 0;
            $currentPropertyType = $propertySubType ?: ($propertyType ?: ($property['PropertySubType'] ?? $property['PropertyType'] ?? ''));
            
            // Configure AMPRE API for similar search
            $this->ampreApi->resetFilters();
            $this->ampreApi->setSelect([
                'ListingKey', 'UnparsedAddress', 'StreetNumber', 'StreetName', 'StreetSuffix',
                'UnitNumber', 'City', 'StateOrProvince', 'ListPrice', 'PropertyType',
                'PropertySubType', 'TransactionType', 'BedroomsTotal', 'BathroomsTotalInteger',
                'LivingArea', 'ParkingTotal', 'ListOfficeName', 'Latitude', 'Longitude',
                'StandardStatus', 'MlsStatus'
            ]);
            $this->ampreApi->setTop($limit + 10); // Get extra to filter out current property

            // Add basic filters
            $this->ampreApi->addFilter('TransactionType', 'For Sale');
            $this->ampreApi->addFilter('StandardStatus', 'Active');

            // Add property type filter
            if ($currentPropertyType) {
                $this->ampreApi->addFilter('PropertySubType', $currentPropertyType);
            }

            // Add price range (±30%)
            if ($currentPrice > 0) {
                $priceRange = $currentPrice * 0.3;
                $minPrice = max(0, $currentPrice - $priceRange);
                $maxPrice = $currentPrice + $priceRange;
                $this->ampreApi->setPriceRange($minPrice, $maxPrice);
            }

            // Add bedroom range (±1)
            if ($currentBedrooms > 0) {
                $this->ampreApi->addFilter('BedroomsTotal', max(0, $currentBedrooms - 1), 'ge');
                $this->ampreApi->addFilter('BedroomsTotal', $currentBedrooms + 1, 'le');
            }

            // Get city from the current property for location filtering
            $currentCity = $property['City'] ?? '';
            if ($currentCity) {
                $this->ampreApi->addCustomFilter("contains(City, '{$currentCity}')");
            } else {
                // Fallback to Toronto area
                $this->ampreApi->addCustomFilter("contains(City, 'Toronto')");
            }

            // Sort by newest
            $this->ampreApi->setOrderBy('ListingContractDate desc');

            $searchResults = $this->ampreApi->fetchProperties();
            
            if (empty($searchResults)) {
                return response()->json(['properties' => []]);
            }

            // Filter out the current property
            $similarProperties = array_filter($searchResults, function($prop) use ($listingKey) {
                return ($prop['ListingKey'] ?? '') !== $listingKey;
            });

            // Limit results
            $similarProperties = array_slice($similarProperties, 0, $limit);

            // Add images to properties
            $propertiesWithImages = $this->addPropertyImages($similarProperties);

            // Format properties for frontend
            $formattedProperties = array_map([$this, 'formatPropertyForListing'], $propertiesWithImages);
            
            return response()->json([
                'properties' => $formattedProperties,
                'count' => count($formattedProperties)
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to fetch similar listings: ' . $e->getMessage());
            return response()->json(['properties' => []], 200); // Return empty array instead of error
        }
    }
    
    /**
     * Format property data for listing display
     */
    private function formatPropertyForListing($property): array
    {
        // Get image URL from property if available
        $imageUrl = null;
        if (isset($property['Images']) && !empty($property['Images'])) {
            // Get the first valid image
            foreach ($property['Images'] as $img) {
                if (!empty($img['MediaURL'])) {
                    $imageUrl = $img['MediaURL'];
                    break;
                }
            }
        }

        return [
            'listingKey' => $property['ListingKey'] ?? '',
            'address' => $property['UnparsedAddress'] ?? '',
            'streetNumber' => $property['StreetNumber'] ?? '',
            'streetName' => $property['StreetName'] ?? '',
            'streetSuffix' => $property['StreetSuffix'] ?? '',
            'unitNumber' => $property['UnitNumber'] ?? '',
            'city' => $property['City'] ?? '',
            'province' => $property['StateOrProvince'] ?? '',
            'price' => $property['ListPrice'] ?? 0,
            'propertyType' => $property['PropertyType'] ?? '',
            'propertySubType' => $property['PropertySubType'] ?? '',
            'transactionType' => $property['TransactionType'] ?? 'For Sale',
            'bedroomsTotal' => $property['BedroomsTotal'] ?? 0,
            'bathroomsTotalInteger' => $property['BathroomsTotalInteger'] ?? 0,
            'livingAreaRange' => $property['LivingArea'] ?? '',
            'parkingTotal' => $property['ParkingTotal'] ?? 0,
            'listOfficeName' => $property['ListOfficeName'] ?? '',
            'latitude' => $property['Latitude'] ?? null,
            'longitude' => $property['Longitude'] ?? null,
            'standardStatus' => $property['StandardStatus'] ?? '',
            'mlsStatus' => $property['MlsStatus'] ?? '',
            'imageUrl' => $imageUrl,
            'MediaURL' => $imageUrl, // For PropertyCard compatibility
            'images' => $property['Images'] ?? [],
        ];
    }
    
    /**
     * Format images data
     */
    private function formatImages($imagesResponse, $listingKey): array
    {
        if (empty($imagesResponse) || !isset($imagesResponse[$listingKey])) {
            return [];
        }
        
        $images = [];
        foreach ($imagesResponse[$listingKey] as $image) {
            $images[] = [
                'url' => $image['MediaURL'] ?? '',
                'caption' => $image['ShortDescription'] ?? '',
                'description' => $image['LongDescription'] ?? '',
                'order' => $image['Order'] ?? 0,
                'modificationTimestamp' => $image['ModificationTimestamp'] ?? null,
            ];
        }
        
        // Sort by order
        usort($images, function($a, $b) {
            return $a['order'] - $b['order'];
        });
        
        return $images;
    }

    /**
     * Add property images using the same pattern as PropertySearchController
     */
    private function addPropertyImages(array $properties): array
    {
        if (empty($properties)) {
            return $properties;
        }

        $listingKeys = array_column($properties, 'ListingKey');

        if (empty($listingKeys)) {
            return $properties;
        }

        try {
            // Fetch images in smaller batches to avoid API limits and improve accuracy
            $batchSize = 5;
            $imagesByKey = [];

            foreach (array_chunk($listingKeys, $batchSize) as $batch) {
                $batchImages = $this->ampreApi->getPropertiesImages($batch);
                $imagesByKey = array_merge($imagesByKey, $batchImages);
            }

            foreach ($properties as $index => $property) {
                $listingKey = $property['ListingKey'] ?? null;
                $propertyImages = $imagesByKey[$listingKey] ?? [];

                // Add full Images array to property
                $properties[$index]['Images'] = $propertyImages;
            }

            return $properties;

        } catch (\Exception $e) {
            Log::error('Failed to fetch property images: ' . $e->getMessage());
            return $properties; // Return properties without images if fetch fails
        }
    }
}