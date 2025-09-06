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
            
            // Format the response
            $responseData = [
                'property' => $formattedProperty,
                'images' => $this->formatImages($images, $listingKey)
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
}