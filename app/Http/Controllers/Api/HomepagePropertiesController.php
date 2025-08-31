<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AmpreApiService;
use App\Models\Setting;
use Illuminate\Http\Request;
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
     * Specifically for 55 Mercer Street condos
     */
    public function getHomepageProperties(Request $request)
    {
        try {
            // Clean any existing output
            while (ob_get_level()) {
                ob_end_clean();
            }

            $type = $request->get('type', 'both'); // 'sale', 'rent', or 'both'

            $forSaleProperties = [];
            $forRentProperties = [];

            // Get default building address from settings
            $defaultAddress = Setting::get('default_building_address') ?: '55 Mercer Street';
            
            // Fetch For Sale properties for the default building
            if ($type === 'sale' || $type === 'both') {
                $forSaleProperties = $this->fetchProperties('For Sale', $defaultAddress);
            }

            // Fetch For Rent properties for the default building
            if ($type === 'rent' || $type === 'both') {
                $forRentProperties = $this->fetchProperties('For Lease', $defaultAddress);
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
     * Fetch properties for specific type and address
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
                'AboveGradeFinishedArea',
                'ParkingTotal',
                'PublicRemarks'
            ]);

            // Set pagination - get up to 12 properties for carousel
            $this->ampreApi->setTop(12);
            $this->ampreApi->setSkip(0);

            // Apply filters
            $this->ampreApi->addFilter('TransactionType', $transactionType);
            $this->ampreApi->addFilter('StandardStatus', 'Active');
            
            // Filter for Condo Apartments only
            $this->ampreApi->addFilter('PropertySubType', 'Condo Apartment');
            
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
                
                // Reset and search for any Toronto condos as fallback
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
                    'AboveGradeFinishedArea',
                    'ParkingTotal',
                    'PublicRemarks'
                ]);
                
                $this->ampreApi->setTop(12);
                $this->ampreApi->setSkip(0);
                $this->ampreApi->addFilter('TransactionType', $transactionType);
                $this->ampreApi->addFilter('StandardStatus', 'Active');
                $this->ampreApi->addFilter('PropertySubType', 'Condo Apartment');
                
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
            // Fetch images in batches
            $batchSize = 5;
            $imagesByKey = [];
            
            foreach (array_chunk($listingKeys, $batchSize) as $batch) {
                $batchImages = $this->ampreApi->getPropertiesImages($batch);
                $imagesByKey = array_merge($imagesByKey, $batchImages);
            }

            foreach ($properties as $index => $property) {
                $listingKey = $property['ListingKey'] ?? null;
                $propertyImages = $imagesByKey[$listingKey] ?? [];

                // Get the first valid image URL
                $imageUrl = null;
                foreach ($propertyImages as $img) {
                    if (!empty($img['MediaURL']) && $this->isValidImageUrl($img['MediaURL'])) {
                        $imageUrl = $img['MediaURL'];
                        break;
                    }
                }

                $properties[$index]['MediaURL'] = $imageUrl;
                $properties[$index]['Images'] = array_slice($propertyImages, 0, 5); // Limit to 5 images
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
            $formatted[] = [
                'id' => uniqid(), // Generate unique ID for React key
                'listingKey' => $property['ListingKey'] ?? '',
                'image' => $property['MediaURL'] ?? null,
                'images' => $property['Images'] ?? [],
                'price' => $property['ListPrice'] ?? 0,
                'propertyType' => $property['PropertySubType'] ?? 'Condo Apartment',
                'transactionType' => $property['TransactionType'] ?? $transactionType,
                'bedrooms' => $property['BedroomsTotal'] ?? 0,
                'bathrooms' => $property['BathroomsTotalInteger'] ?? 0,
                'address' => $property['UnparsedAddress'] ?? '',
                'city' => $property['City'] ?? '',
                'postalCode' => $property['PostalCode'] ?? '',
                'sqft' => $property['AboveGradeFinishedArea'] ?? 0,
                'parking' => $property['ParkingTotal'] ?? 0,
                'description' => $property['PublicRemarks'] ?? '',
                'isRental' => $isRental
            ];
        }

        return $formatted;
    }
}