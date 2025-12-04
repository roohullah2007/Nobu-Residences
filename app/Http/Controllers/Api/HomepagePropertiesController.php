<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AmpreApiService;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class HomepagePropertiesController extends Controller
{
    private AmpreApiService $ampreApi;

    public function __construct(AmpreApiService $ampreApi)
    {
        $this->ampreApi = $ampreApi;
    }

    /**
     * Get properties for homepage carousels
     * Uses the default building address from MLS settings
     * Now fetches from local mls_properties database
     */
    public function getHomepageProperties(Request $request)
    {
        try {
            // Clean any existing output
            while (ob_get_level()) {
                ob_end_clean();
            }

            $type = $request->get('type', 'both'); // 'sale', 'rent', or 'both'

            // Get default building addresses from MLS settings
            $website = \App\Models\Website::find(1);
            $homePage = $website ? $website->pages()->where('page_type', 'home')->first() : null;
            $mlsSettings = $homePage ? ($homePage->content['mls_settings'] ?? []) : [];

            // Default addresses: 15 Mercer and 35 Mercer (NOBU Residences)
            $defaultAddresses = $mlsSettings['default_building_addresses'] ?? ['15 Mercer', '35 Mercer'];
            if (!is_array($defaultAddresses)) {
                // Parse single address like "15 Mercer Street" to "15 Mercer"
                $address = $mlsSettings['default_building_address'] ?? '15 Mercer Street';
                if (preg_match('/^(\d+\s+[A-Za-z]+)/i', trim($address), $matches)) {
                    $defaultAddresses = [$matches[1]];
                } else {
                    $defaultAddresses = ['15 Mercer', '35 Mercer'];
                }
            }

            $forSaleProperties = [];
            $forRentProperties = [];

            // Fetch For Sale properties from local database
            if ($type === 'sale' || $type === 'both') {
                $forSaleProperties = $this->fetchPropertiesFromDB('For Sale', $defaultAddresses);
            }

            // Fetch For Rent properties from local database
            if ($type === 'rent' || $type === 'both') {
                $forRentProperties = $this->fetchPropertiesFromDB('For Rent', $defaultAddresses);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'forSale' => $forSaleProperties,
                    'forRent' => $forRentProperties
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Homepage properties fetch error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch properties: ' . $e->getMessage(),
                'data' => [
                    'forSale' => [],
                    'forRent' => []
                ]
            ], 500);
        }
    }

    /**
     * Fetch properties from local mls_properties database
     */
    private function fetchPropertiesFromDB(string $propertyType, array $streetAddresses)
    {
        try {
            $query = DB::table('mls_properties')
                ->where('is_active', true)
                ->where('status', 'active')
                ->where('property_type', $propertyType)
                ->where(function($q) use ($streetAddresses) {
                    foreach ($streetAddresses as $streetAddr) {
                        $q->orWhereRaw('LOWER(address) LIKE ?', [strtolower($streetAddr) . '%']);
                    }
                })
                ->select([
                    'id', 'mls_id', 'address', 'city', 'province', 'postal_code',
                    'price', 'bedrooms', 'bathrooms', 'square_footage',
                    'property_type', 'property_sub_type', 'image_urls',
                    'has_images', 'listed_date', 'parking_spaces'
                ])
                ->orderBy('listed_date', 'desc')
                ->limit(12)
                ->get();

            // Format for frontend carousel
            $formatted = [];
            $isRental = $propertyType === 'For Rent';

            foreach ($query as $property) {
                $imageUrls = json_decode($property->image_urls ?? '[]', true);
                $imageUrl = !empty($imageUrls) ? $imageUrls[0] : null;

                // Parse address for unit/street formatting
                $addressParts = $this->parseAddress($property->address);

                $formatted[] = [
                    'id' => $property->id,
                    'listingKey' => $property->mls_id,
                    'imageUrl' => $imageUrl,
                    'image' => $imageUrl,
                    'images' => $imageUrls,
                    'price' => (int)$property->price,
                    'propertyType' => $property->property_sub_type ?? 'Condo Apartment',
                    'transactionType' => $property->property_type,
                    'bedrooms' => (int)$property->bedrooms,
                    'bathrooms' => (int)$property->bathrooms,
                    'address' => $property->address,
                    'city' => $property->city,
                    'postalCode' => $property->postal_code,
                    'sqft' => $property->square_footage,
                    'LivingAreaRange' => $property->square_footage ? "{$property->square_footage} sqft" : '',
                    'livingAreaRange' => $property->square_footage ? "{$property->square_footage} sqft" : '',
                    'parking' => (int)$property->parking_spaces,
                    'isRental' => $isRental,
                    'source' => 'mls',
                    // Address parts for formatters
                    'UnitNumber' => $addressParts['unit'] ?? '',
                    'unitNumber' => $addressParts['unit'] ?? '',
                    'StreetNumber' => $addressParts['streetNumber'] ?? '',
                    'streetNumber' => $addressParts['streetNumber'] ?? '',
                    'StreetName' => $addressParts['streetName'] ?? '',
                    'streetName' => $addressParts['streetName'] ?? '',
                    'StreetSuffix' => $addressParts['streetSuffix'] ?? '',
                    'streetSuffix' => $addressParts['streetSuffix'] ?? '',
                    'ParkingTotal' => (int)$property->parking_spaces,
                    'parkingTotal' => (int)$property->parking_spaces,
                    'BedroomsTotal' => (int)$property->bedrooms,
                    'bedroomsTotal' => (int)$property->bedrooms,
                    'BathroomsTotalInteger' => (int)$property->bathrooms,
                    'bathroomsTotalInteger' => (int)$property->bathrooms,
                ];
            }

            Log::info("Fetched {$propertyType} properties from DB", [
                'addresses' => $streetAddresses,
                'count' => count($formatted)
            ]);

            return $formatted;

        } catch (Exception $e) {
            Log::error("Error fetching {$propertyType} properties from DB: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Parse address string to extract parts
     * Example: "15 Mercer Street 419, Toronto C01, ON M5V 1H2" -> unit=419, streetNumber=15, streetName=Mercer, streetSuffix=Street
     */
    private function parseAddress(string $address): array
    {
        $parts = [
            'unit' => '',
            'streetNumber' => '',
            'streetName' => '',
            'streetSuffix' => ''
        ];

        // Try to extract: "15 Mercer Street 419" pattern
        if (preg_match('/^(\d+)\s+([A-Za-z]+)\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Court|Ct|Place|Pl|Lane|Ln|Way)\s+(\d+|[A-Z]+\d*)/i', $address, $matches)) {
            $parts['streetNumber'] = $matches[1];
            $parts['streetName'] = $matches[2];
            $parts['streetSuffix'] = $matches[3];
            $parts['unit'] = $matches[4];
        }
        // Try: "15 Mercer Street" pattern (no unit)
        elseif (preg_match('/^(\d+)\s+([A-Za-z]+)\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Court|Ct|Place|Pl|Lane|Ln|Way)/i', $address, $matches)) {
            $parts['streetNumber'] = $matches[1];
            $parts['streetName'] = $matches[2];
            $parts['streetSuffix'] = $matches[3];
        }

        return $parts;
    }

    /**
     * Fetch properties near a specific location (for schools and other location-based searches)
     */
    private function fetchPropertiesNearLocation(string $transactionType, string $address, string $city = 'Toronto')
    {
        try {
            // Reset filters
            $this->ampreApi->resetFilters();

            // Set select fields for display
            $this->ampreApi->setSelect([
                'ListingKey',
                'BedroomsTotal',
                'BathroomsTotalInteger',
                'UnparsedAddress',
                'ListPrice',
                'TransactionType',
                'City',
                'StateOrProvince',
                'PostalCode',
                'PropertySubType',
                'PropertyType',
                'StandardStatus',
                'LivingAreaRange',
                'AboveGradeFinishedArea',
                'ParkingTotal',
                'PublicRemarks',
                'ListOfficeName',
                'UnitNumber',
                'StreetNumber',
                'StreetName',
                'StreetSuffix'
            ]);

            // Set pagination - limit to 12 properties for carousel
            $this->ampreApi->setTop(12);
            $this->ampreApi->setSkip(0);

            // Apply filters
            $this->ampreApi->addFilter('TransactionType', $transactionType);
            $this->ampreApi->addFilter('StandardStatus', 'Active');

            // Parse address to search for nearby properties
            $addressParts = explode(',', $address);
            $streetAddress = trim($addressParts[0] ?? $address);

            // Extract street name for area search
            $streetParts = explode(' ', $streetAddress);
            $streetName = implode(' ', array_slice($streetParts, 1));

            // Search for properties in the same area/neighborhood
            if (!empty($streetName)) {
                // Search for properties on the same street or nearby streets
                $this->ampreApi->addCustomFilter("contains(UnparsedAddress, '{$streetName}')");
            }

            // Filter by city - extract just the city name from full address format
            $cityName = explode(',', $city)[0] ?? 'Toronto';
            $this->ampreApi->addCustomFilter("contains(City, '{$cityName}')");

            // Sort by newest listings first
            $this->ampreApi->setOrderBy('ListingContractDate desc');

            // Add reasonable price filter
            if ($transactionType === 'For Sale') {
                $this->ampreApi->setPriceRange(200000, null);
            } else {
                $this->ampreApi->setPriceRange(1000, null);
            }

            // Fetch properties
            $apiResult = $this->ampreApi->fetchPropertiesWithCount();
            $properties = $apiResult['properties'] ?? [];

            // Log for debugging
            Log::info("Properties near {$address}, {$city} - {$transactionType}", [
                'street_name' => $streetName,
                'count' => count($properties),
                'total' => $apiResult['count'] ?? 0
            ]);

            // If no properties found, try broader search in the city
            if (empty($properties)) {
                Log::info("No properties found near {$address}, trying broader {$city} search");

                $this->ampreApi->resetFilters();
                $this->ampreApi->setSelect([
                    'ListingKey',
                    'BedroomsTotal',
                    'BathroomsTotalInteger',
                    'UnparsedAddress',
                    'ListPrice',
                    'TransactionType',
                    'City',
                    'StateOrProvince',
                    'PostalCode',
                    'PropertySubType',
                    'PropertyType',
                    'StandardStatus',
                    'LivingAreaRange',
                    'AboveGradeFinishedArea',
                    'ParkingTotal',
                    'PublicRemarks',
                    'ListOfficeName',
                    'UnitNumber',
                    'StreetNumber',
                    'StreetName',
                    'StreetSuffix'
                ]);

                $this->ampreApi->setTop(12);
                $this->ampreApi->setSkip(0);
                $this->ampreApi->addFilter('TransactionType', $transactionType);
                $this->ampreApi->addFilter('StandardStatus', 'Active');
                // Filter by city - extract just the city name from full address format
                $cityName = explode(',', $city)[0] ?? 'Toronto';
                $this->ampreApi->addCustomFilter("contains(City, '{$cityName}')");

                // Add reasonable price filter for broader search
                if ($transactionType === 'For Sale') {
                    $this->ampreApi->setPriceRange(300000, 3000000);
                } else {
                    $this->ampreApi->setPriceRange(1500, 6000);
                }

                $this->ampreApi->setOrderBy('ListPrice desc');

                $apiResult = $this->ampreApi->fetchPropertiesWithCount();
                $properties = $apiResult['properties'] ?? [];
            }

            // Add images to properties
            if (!empty($properties)) {
                $properties = $this->addPropertyImages($properties);
            }

            // Format properties for frontend
            return $this->formatPropertiesForCarousel($properties, $transactionType);

        } catch (Exception $e) {
            Log::error("Error fetching {$transactionType} properties near {$address}: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Fetch properties for specific type and address (for homepage with default building)
     */
    private function fetchProperties(string $transactionType, string $address)
    {
        try {
            // Reset filters
            $this->ampreApi->resetFilters();

            // Set select fields for homepage display
            $this->ampreApi->setSelect([
                'ListingKey',
                'BedroomsTotal',
                'BathroomsTotalInteger',
                'UnparsedAddress',
                'ListPrice',
                'TransactionType',
                'City',
                'StateOrProvince',
                'PostalCode',
                'PropertySubType',
                'PropertyType',
                'StandardStatus',
                'LivingAreaRange',
                'AboveGradeFinishedArea',
                'ParkingTotal',
                'PublicRemarks',
                'ListOfficeName',
                'UnitNumber',
                'StreetNumber',
                'StreetName',
                'StreetSuffix'
            ]);

            // Set pagination - limit to 12 properties for carousel
            $this->ampreApi->setTop(12); // Limited to 12 for carousel display
            $this->ampreApi->setSkip(0);

            // Apply filters
            $this->ampreApi->addFilter('TransactionType', $transactionType);
            $this->ampreApi->addFilter('StandardStatus', 'Active');
            
            // Show all property types from 55 Mercer Street (not just Condo Apartments)
            // $this->ampreApi->addFilter('PropertySubType', 'Condo Apartment');
            
            // Filter specifically for the building address
            // Try multiple variations to catch different formats
            $addressParts = explode(' ', $address);
            $streetNumber = $addressParts[0] ?? '';
            $streetName = implode(' ', array_slice($addressParts, 1));
            
            // Build filter with variations
            $addressFilter = "(contains(UnparsedAddress, '{$address}') or " .
                           "contains(UnparsedAddress, '{$streetNumber} {$streetName}') or " .
                           "contains(UnparsedAddress, '{$streetNumber}-{$streetName}') or " .
                           "startswith(UnparsedAddress, '{$address}'))";
            $this->ampreApi->addCustomFilter($addressFilter);
            
            // Also filter for Toronto
            $this->ampreApi->addCustomFilter("contains(City, 'Toronto')");

            // Sort by newest listings first
            $this->ampreApi->setOrderBy('ListingContractDate desc');

            // Add reasonable price filter
            if ($transactionType === 'For Sale') {
                $this->ampreApi->setPriceRange(200000, null); // Min $200k for sale
            } else {
                $this->ampreApi->setPriceRange(1000, null); // Min $1000/month for rent
            }

            // Fetch properties
            $apiResult = $this->ampreApi->fetchPropertiesWithCount();
            $properties = $apiResult['properties'] ?? [];
            
            // Log for debugging
            Log::info("Homepage properties fetch for {$address} - {$transactionType}", [
                'count' => count($properties),
                'total' => $apiResult['count'] ?? 0
            ]);
            
            // If no properties found at the address, try broader search
            if (empty($properties)) {
                Log::info("No properties found at {$address}, trying broader search");
                
                // Reset and search for any Toronto properties as fallback
                $this->ampreApi->resetFilters();
                $this->ampreApi->setSelect([
                    'ListingKey',
                    'BedroomsTotal',
                    'BathroomsTotalInteger',
                    'UnparsedAddress',
                    'ListPrice',
                    'TransactionType',
                    'City',
                    'StateOrProvince',
                    'PostalCode',
                    'PropertySubType',
                    'PropertyType',
                    'StandardStatus',
                    'LivingAreaRange',
                    'AboveGradeFinishedArea',
                    'ParkingTotal',
                    'PublicRemarks',
                    'ListOfficeName',
                    'UnitNumber',
                    'StreetNumber',
                    'StreetName',
                    'StreetSuffix'
                ]);
                
                $this->ampreApi->setTop(12); // Limited to 12 for carousel display
                $this->ampreApi->setSkip(0);
                $this->ampreApi->addFilter('TransactionType', $transactionType);
                $this->ampreApi->addFilter('StandardStatus', 'Active');
                // Show all property types, not just condos
                // $this->ampreApi->addFilter('PropertySubType', 'Condo Apartment');
                
                // Try to find properties on the same street (any number)
                $streetName = implode(' ', array_slice(explode(' ', $address), 1));
                if (!empty($streetName)) {
                    $this->ampreApi->addCustomFilter("contains(UnparsedAddress, '{$streetName}')");
                }
                $this->ampreApi->addCustomFilter("contains(City, 'Toronto')");
                
                // Add reasonable price filter
                if ($transactionType === 'For Sale') {
                    $this->ampreApi->setPriceRange(400000, 2000000); // Premium condos
                } else {
                    $this->ampreApi->setPriceRange(2000, 5000); // Premium rentals
                }
                
                $this->ampreApi->setOrderBy('ListPrice desc');
                
                $apiResult = $this->ampreApi->fetchPropertiesWithCount();
                $properties = $apiResult['properties'] ?? [];
                
                Log::info("Broader {$streetName} search - {$transactionType}", [
                    'count' => count($properties),
                    'total' => $apiResult['count'] ?? 0
                ]);
            }

            // Add images to properties
            if (!empty($properties)) {
                $properties = $this->addPropertyImages($properties);
            }

            // Format properties for frontend
            return $this->formatPropertiesForCarousel($properties, $transactionType);

        } catch (Exception $e) {
            Log::error("Error fetching {$transactionType} properties: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Add images to properties
     */
    private function addPropertyImages(array $properties)
    {
        if (empty($properties)) {
            return $properties;
        }

        $listingKeys = array_column($properties, 'ListingKey');

        try {
            // Fetch images in smaller batches for better reliability
            $batchSize = 3;
            $imagesByKey = [];
            
            foreach (array_chunk($listingKeys, $batchSize) as $batch) {
                $batchImages = $this->ampreApi->getPropertiesImages($batch);
                $imagesByKey = array_merge($imagesByKey, $batchImages);
                
                // Log batch results for debugging
                Log::info('Image batch fetched', [
                    'batch' => $batch,
                    'image_count' => count($batchImages)
                ]);
            }

            foreach ($properties as $index => $property) {
                $listingKey = $property['ListingKey'] ?? null;
                $propertyImages = $imagesByKey[$listingKey] ?? [];

                // Get the first valid image URL - be less strict with validation
                $imageUrl = null;
                foreach ($propertyImages as $img) {
                    if (!empty($img['MediaURL'])) {
                        // More lenient validation - just check if it's not empty
                        $candidateUrl = trim($img['MediaURL']);
                        if (strlen($candidateUrl) > 10) {
                            $imageUrl = $candidateUrl;
                            break;
                        }
                    }
                }

                $properties[$index]['MediaURL'] = $imageUrl;
                $properties[$index]['Images'] = array_slice($propertyImages, 0, 10); // Show more images
                
                // Log image results for debugging
                if ($imageUrl) {
                    Log::info('Image found for property', [
                        'listing_key' => $listingKey,
                        'image_url' => substr($imageUrl, 0, 50) . '...'
                    ]);
                } else {
                    Log::warning('No image found for property', [
                        'listing_key' => $listingKey,
                        'image_count' => count($propertyImages)
                    ]);
                }
            }

        } catch (Exception $e) {
            Log::error('Error fetching property images: ' . $e->getMessage());
            
            foreach ($properties as $index => $property) {
                $properties[$index]['MediaURL'] = null;
                $properties[$index]['Images'] = [];
            }
        }

        return $properties;
    }

    /**
     * Check if URL is valid for an image
     */
    private function isValidImageUrl($url)
    {
        if (empty($url)) {
            return false;
        }
        
        // Check if it starts with http, https, or //
        if (!str_starts_with($url, 'http://') && 
            !str_starts_with($url, 'https://') && 
            !str_starts_with($url, '//')) {
            return false;
        }
        
        // Check if URL is not just a placeholder or invalid format
        if (strlen($url) < 10 || !filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }
        
        return true;
    }

    /**
     * Format properties for carousel display
     */
    private function formatPropertiesForCarousel(array $properties, string $transactionType)
    {
        $formatted = [];
        $isRental = in_array($transactionType, ['For Lease', 'For Rent']);

        foreach ($properties as $property) {
            // Try to get image from multiple sources
            $imageUrl = null;
            
            // First try the fetched MediaURL (from addPropertyImages)
            if (!empty($property['MediaURL'])) {
                $imageUrl = $property['MediaURL'];
            }
            // If no fetched image, try the original MediaURL from API response
            elseif (!empty($property['MediaURL'])) {
                $imageUrl = $property['MediaURL'];
            }
            // If still no image, try from Images array
            elseif (!empty($property['Images']) && is_array($property['Images'])) {
                foreach ($property['Images'] as $img) {
                    if (!empty($img['MediaURL'])) {
                        $imageUrl = $img['MediaURL'];
                        break;
                    }
                }
            }
            
            $formatted[] = [
                'id' => uniqid(), // Generate unique ID for React key
                'listingKey' => $property['ListingKey'] ?? '',
                'imageUrl' => $imageUrl, // Use the best available image URL - changed to imageUrl
                'image' => $imageUrl, // Keep for backward compatibility
                'images' => $property['Images'] ?? [],
                'price' => $property['ListPrice'] ?? 0,
                'propertyType' => $property['PropertySubType'] ?? 'Property',
                'transactionType' => $property['TransactionType'] ?? $transactionType,
                'bedrooms' => $property['BedroomsTotal'] ?? 0,
                'bathrooms' => $property['BathroomsTotalInteger'] ?? 0,
                'address' => $property['UnparsedAddress'] ?? '',
                'city' => $property['City'] ?? '',
                'postalCode' => $property['PostalCode'] ?? '',
                'sqft' => $property['LivingAreaRange'] ?? $property['AboveGradeFinishedArea'] ?? 0,
                'LivingAreaRange' => $property['LivingAreaRange'] ?? '',
                'livingAreaRange' => $property['LivingAreaRange'] ?? '',
                'AboveGradeFinishedArea' => $property['AboveGradeFinishedArea'] ?? '',
                'parking' => $property['ParkingTotal'] ?? 0,
                'description' => $property['PublicRemarks'] ?? '',
                'isRental' => $isRental,
                'source' => 'mls', // Mark as real MLS data
                // Add all MLS fields needed for formatters (both cases for compatibility)
                'UnitNumber' => $property['UnitNumber'] ?? '',
                'unitNumber' => $property['UnitNumber'] ?? '',
                'StreetNumber' => $property['StreetNumber'] ?? '',
                'streetNumber' => $property['StreetNumber'] ?? '',
                'StreetName' => $property['StreetName'] ?? '',
                'streetName' => $property['StreetName'] ?? '',
                'StreetSuffix' => $property['StreetSuffix'] ?? '',
                'streetSuffix' => $property['StreetSuffix'] ?? '',
                'AboveGradeFinishedArea' => $property['AboveGradeFinishedArea'] ?? '',
                'ParkingTotal' => $property['ParkingTotal'] ?? 0,
                'parkingTotal' => $property['ParkingTotal'] ?? 0,
                'ListOfficeName' => $property['ListOfficeName'] ?? '',
                'listOfficeName' => $property['ListOfficeName'] ?? '',
                'BedroomsTotal' => $property['BedroomsTotal'] ?? 0,
                'bedroomsTotal' => $property['BedroomsTotal'] ?? 0,
                'BathroomsTotalInteger' => $property['BathroomsTotalInteger'] ?? 0,
                'bathroomsTotalInteger' => $property['BathroomsTotalInteger'] ?? 0
            ];
        }

        return $formatted;
    }
}