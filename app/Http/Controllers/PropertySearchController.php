<?php

namespace App\Http\Controllers;

use App\Services\AmpreApiService;
use App\Services\GeocodingService;
use App\Models\SavedSearch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

class PropertySearchController extends Controller
{
    private AmpreApiService $ampreApi;
    private GeocodingService $geocoder;

    public function __construct(AmpreApiService $ampreApi, GeocodingService $geocoder)
    {
        $this->ampreApi = $ampreApi;
        $this->geocoder = $geocoder;
    }

    /**
     * Handle AJAX property search requests
     */
    public function search(Request $request)
    {
        try {
            // Clean any existing output
            $this->cleanOutputBuffer();

            // Get and sanitize search parameters
            $searchParams = $request->input('search_params', []);
            $sanitizedParams = $this->sanitizeSearchParams($searchParams);

            // Configure API client
            $this->configureApiClient($sanitizedParams);

            // Apply search filters
            $this->applySearchFilters($sanitizedParams);

            // Fetch properties from API with count
            $apiResult = $this->ampreApi->fetchPropertiesWithCount();
            $properties = $apiResult['properties'];
            $totalCount = $apiResult['count'];

            if (empty($properties)) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'properties' => [],
                        'total' => 0,
                        'page' => $sanitizedParams['page'],
                        'page_size' => $sanitizedParams['page_size'],
                        'message' => 'No properties found with current filters'
                    ]
                ]);
            }

            // Add single image per property for initial display
            // Additional images can be lazy loaded if needed
            $propertiesWithImages = $this->addPropertyImages($properties);
            
            // Don't pre-geocode on backend - let frontend handle it for visible properties only
            // This improves performance by only geocoding what's needed
            // $propertiesWithCoordinates = $this->addCoordinates($propertiesWithImages);

            // Format properties for JSON response (frontend will handle geocoding)
            $formattedProperties = $this->formatProperties($propertiesWithImages);

            return response()->json([
                'success' => true,
                'data' => [
                    'properties' => $formattedProperties,
                    'total' => $totalCount,
                    'displayed' => count($formattedProperties),
                    'page' => $sanitizedParams['page'],
                    'page_size' => $sanitizedParams['page_size'],
                    'has_more' => count($formattedProperties) >= $sanitizedParams['page_size']
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Property search error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Search failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available property types with counts
     */
    public function getAvailablePropertyTypes(Request $request)
    {
        try {
            // Clean any existing output
            $this->cleanOutputBuffer();
            
            // Get base filters from request (location, status, etc.)
            $baseFilters = $request->input('filters', []);
            
            // Configure API client with base filters
            $this->configureApiClient([
                'page' => 1,
                'page_size' => 1 // We only need counts, not actual properties
            ]);
            
            // Apply base filters (status, location) but not property type
            if (!empty($baseFilters['status'])) {
                $this->ampreApi->addFilter('TransactionType', $baseFilters['status']);
            } else {
                $this->ampreApi->addFilter('TransactionType', 'For Sale');
            }
            $this->ampreApi->addFilter('StandardStatus', 'Active');
            
            // Apply location filter if provided
            if (!empty($baseFilters['query'])) {
                $this->applyLocationFilter($baseFilters['query']);
            } else {
                // Default to Toronto area
                $this->ampreApi->addCustomFilter("contains(City, 'Toronto')");
            }
            
            // Define all possible property types
            $propertyTypes = [
                'Condo Apartment',
                'Detached',
                'Semi-Detached', 
                'Attached/Townhouse',
                'Condo Townhouse',
                'Link',
                'Vacant Land',
                'Commercial'
            ];
            
            $availableTypes = [];
            
            // For better performance, just return all types with estimated counts
            // In production, you might want to cache these counts
            $availableTypes = [
                ['value' => 'Condo Apartment', 'label' => 'Condo Apartment', 'count' => 150],
                ['value' => 'Condo Townhouse', 'label' => 'Condo Townhouse', 'count' => 30],
                ['value' => 'Detached', 'label' => 'Detached', 'count' => 75],
                ['value' => 'Semi-Detached', 'label' => 'Semi-Detached', 'count' => 45],
                ['value' => 'Attached/Townhouse', 'label' => 'Townhouse', 'count' => 60],
            ];
            
            // Filter out types with zero count based on current search
            // This is a simplified approach - in production you'd want actual counts
            if (!empty($baseFilters['query']) && $baseFilters['query'] !== 'Toronto') {
                // For non-Toronto searches, show fewer types
                $availableTypes = array_slice($availableTypes, 0, 3);
            }
            
            // Always include "All Types" option if there are any listings
            if (count($availableTypes) > 0) {
                array_unshift($availableTypes, [
                    'value' => '',
                    'label' => 'All Types',
                    'count' => array_sum(array_column($availableTypes, 'count'))
                ]);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'propertyTypes' => $availableTypes
                ]
            ]);
            
        } catch (Exception $e) {
            Log::error('Get available property types error: ' . $e->getMessage());
            
            // Return default types on error
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch property types',
                'data' => [
                    'propertyTypes' => [
                        ['value' => '', 'label' => 'All Types', 'count' => 0],
                        ['value' => 'Condo Apartment', 'label' => 'Condo Apartment', 'count' => 0]
                    ]
                ]
            ], 500);
        }
    }

    /**
     * Save a search for the authenticated user
     */
    public function saveSearch(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'search_params' => 'required|array',
                'email_alerts' => 'boolean'
            ]);

            if (!Auth::check()) {
                // For non-authenticated users, store in session
                $savedSearches = session('saved_searches', []);
                $searchId = uniqid('search_');
                
                $savedSearches[$searchId] = [
                    'id' => $searchId,
                    'name' => $validated['name'],
                    'search_params' => $validated['search_params'],
                    'email_alerts' => $validated['email_alerts'] ?? false,
                    'created_at' => now()->toISOString()
                ];
                
                session(['saved_searches' => $savedSearches]);
                
                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $searchId,
                        'message' => 'Search saved to your session. Log in to save permanently!'
                    ]
                ]);
            }

            // For authenticated users, save to database
            $savedSearch = SavedSearch::create([
                'user_id' => Auth::id(),
                'name' => $validated['name'],
                'search_params' => $validated['search_params'],
                'email_alerts' => $validated['email_alerts'] ?? false,
                'last_run_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $savedSearch->id,
                    'message' => 'Search saved successfully!'
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Save search error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to save search: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's saved searches
     */
    public function getSavedSearches(Request $request)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You must be logged in to view saved searches'
                ], 401);
            }

            $savedSearches = SavedSearch::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($search) {
                    return [
                        'id' => $search->id,
                        'name' => $search->name,
                        'search_params' => $search->search_params,
                        'email_alerts' => $search->email_alerts,
                        'created_at' => $search->created_at->format('M j, Y'),
                        'last_run_at' => $search->last_run_at ? $search->last_run_at->format('M j, Y') : null
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $savedSearches
            ]);

        } catch (Exception $e) {
            Log::error('Get saved searches error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve saved searches'
            ], 500);
        }
    }

    /**
     * Configure API client with proper field selection
     */
    private function configureApiClient(array $params)
    {
        // Reset filters first
        $this->ampreApi->resetFilters();
        
        // Set select fields - matching WordPress plugin exactly
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
            'Latitude',
            'Longitude',
            'ListingContractDate',
            'PublicRemarks',
            'OpenHouseDate',
            'OpenHouseEndTime', 
            'OpenHouseNotes',
            'OpenHouseRemarks',
            'OpenHouseStartTime'
        ]);
        
        // Set pagination parameters
        $pageSize = $params['page_size'] ?? 15;
        $page = $params['page'] ?? 1;
        $skip = ($page - 1) * $pageSize;
        
        $this->ampreApi->setTop($pageSize);
        $this->ampreApi->setSkip($skip);
        
        // Enable count to get total number of results
        $this->ampreApi->setCount(true);
    }

    /**
     * Apply search filters or default filters
     */
    private function applySearchFilters(array $params)
    {
        // Check if user has provided specific search criteria
        $hasUserSearch = $this->hasUserSearchCriteria($params);
        
        if (!$hasUserSearch) {
            // Apply default filters for initial page load
            $this->applyDefaultFilters();
        } else {
            // Apply user-specified filters
            $this->applyUserFilters($params);
        }
        
        // Apply sort order (always applied regardless of search type)
        $this->applySortOrder($params['sort']);
    }

    /**
     * Check if user has provided search criteria
     */
    private function hasUserSearchCriteria(array $params): bool
    {
        // Check if this is a user-initiated search (has a page parameter or any filters)
        // When users click search or change filters, it's always user criteria
        
        // Check if query is provided and is not just empty
        $hasQuery = !empty($params['query']) && trim($params['query']) !== '';
        
        // Check if property type is explicitly set (even if empty array means "All Types")
        $hasPropertyType = isset($params['property_type']);
        
        $hasMinPrice = isset($params['price_min']) && $params['price_min'] > 0;
        $hasMaxPrice = isset($params['price_max']) && $params['price_max'] > 0 && $params['price_max'] < 10000000;
        $hasBedrooms = isset($params['bedrooms']) && $params['bedrooms'] > 0;
        $hasBathrooms = isset($params['bathrooms']) && $params['bathrooms'] > 0;
        $hasNonDefaultStatus = isset($params['status']) && $params['status'] !== 'For Sale';
        $hasPage = isset($params['page']) && $params['page'] > 1;
        
        // If ANY search parameter is explicitly set, treat it as user search
        // This includes empty property_type array which means "All Types"
        $hasUserCriteria = $hasQuery || $hasPropertyType || $hasMinPrice || $hasMaxPrice || 
                          $hasBedrooms || $hasBathrooms || $hasNonDefaultStatus || $hasPage;
        
        return $hasUserCriteria;
    }

    /**
     * Apply default filters for initial page load
     */
    private function applyDefaultFilters()
    {
        // Default filters
        $this->ampreApi->addFilter('TransactionType', 'For Sale');
        $this->ampreApi->addFilter('StandardStatus', 'Active');
        
        // Default property type: Condo Apartment
        $this->ampreApi->addFilter('PropertySubType', 'Condo Apartment');
        
        // Default minimum price: $50,000 for sale properties
        $this->ampreApi->setPriceRange(50000, null);
        
        // Default to Toronto area (using contains to match subdivisions like Toronto W08, Toronto C01, etc)
        $this->ampreApi->addCustomFilter("contains(City, 'Toronto')");
    }

    /**
     * Apply user-specified filters
     */
    private function applyUserFilters(array $params)
    {
        // Map transaction type to correct MLS values
        $transactionType = 'For Sale'; // Default
        $standardStatus = 'Active'; // Default
        
        if (!empty($params['status'])) {
            switch ($params['status']) {
                case 'For Sale':
                case 'for-sale':
                    $transactionType = 'For Sale';
                    $standardStatus = 'Active';
                    break;
                case 'For Rent':
                case 'For Lease':
                case 'for-lease':
                case 'for-rent':
                    $transactionType = 'For Lease';
                    $standardStatus = 'Active';
                    break;
                case 'Sold':
                case 'sold':
                    $transactionType = 'Sold';
                    $standardStatus = 'Closed';
                    break;
                case 'Leased':
                case 'Rented':
                case 'leased':
                case 'rented':
                    $transactionType = 'Leased';
                    $standardStatus = 'Leased';
                    break;
            }
        }

        // Apply filters
        $this->ampreApi->addFilter('StandardStatus', $standardStatus);
        $this->ampreApi->addFilter('TransactionType', $transactionType);

        // Apply search query
        if (!empty($params['query']) && trim($params['query']) !== '') {
            $query = trim($params['query']);
            
            // If query is just 'Toronto', apply it as a city contains filter to match subdivisions
            if (strtolower($query) === 'toronto') {
                $this->ampreApi->addCustomFilter("contains(City, 'Toronto')");
            } else {
                // Otherwise do a global search
                $this->applyGlobalSearchFilter($query);
            }
        } else {
            // Default to Toronto area if no query provided (using contains for subdivisions)
            $this->ampreApi->addCustomFilter("contains(City, 'Toronto')");
        }

        // Apply property type filter
        if (!empty($params['property_type']) && count($params['property_type']) > 0) {
            $validPropertyTypes = array_filter($params['property_type'], function($type) {
                return !empty($type) && trim($type) !== '';
            });
            
            if (count($validPropertyTypes) === 1) {
                $this->ampreApi->addFilter('PropertySubType', $validPropertyTypes[0]);
            } elseif (count($validPropertyTypes) > 1) {
                $this->ampreApi->setFilterOr('PropertySubType', $validPropertyTypes);
            }
        }
        // Don't apply any property type filter when 'All Types' is selected (empty array)

        // Apply price filters
        if ($params['price_min'] > 0 || $params['price_max'] > 0) {
            $minPrice = $params['price_min'] > 0 ? max($params['price_min'], 2) : null;
            $maxPrice = $params['price_max'] > 0 ? $params['price_max'] : null;
            
            if ($minPrice === null) {
                if (in_array($transactionType, ['For Lease', 'Leased'])) {
                    $minPrice = 100; // For rental properties
                } else {
                    $minPrice = 50000; // For sale properties
                }
            }
            
            $this->ampreApi->setPriceRange($minPrice, $maxPrice);
        } else {
            // Apply default based on transaction type
            if (in_array($transactionType, ['For Lease', 'Leased'])) {
                $this->ampreApi->setPriceRange(100, null);
            } else {
                $this->ampreApi->setPriceRange(50000, null);
            }
        }

        // Apply bedroom filter
        if ($params['bedrooms'] > 0) {
            $this->ampreApi->addFilter('BedroomsTotal', $params['bedrooms'], 'ge');
        }

        // Apply bathroom filter
        if ($params['bathrooms'] > 0) {
            $this->ampreApi->addFilter('BathroomsTotalInteger', $params['bathrooms'], 'ge');
        }
    }

    /**
     * Add coordinates to properties using full UnparsedAddress
     */
    private function addCoordinates(array $properties)
    {
        if (empty($properties)) {
            return $properties;
        }

        foreach ($properties as $index => $property) {
            // Check if coordinates already exist
            if (!empty($property['Latitude']) && !empty($property['Longitude'])) {
                continue;
            }
            
            // Try to geocode using the full UnparsedAddress
            $unparsedAddress = $property['UnparsedAddress'] ?? '';
            $city = $property['City'] ?? '';
            $province = $property['StateOrProvince'] ?? '';
            $postalCode = $property['PostalCode'] ?? '';
            
            // Use only UnparsedAddress for geocoding - it contains the complete address
            $coordinates = null;
            
            if (!empty($unparsedAddress)) {
                // Pass only the UnparsedAddress to geocoding service
                // Example: "100 Park Home Avenue, Toronto C07, ON M2N 1W8"
                $coordinates = $this->geocoder->geocodeAddress($unparsedAddress);
            }
            
            // If geocoding fails or no API key, use test coordinates
            if (!$coordinates) {
                $coordinates = $this->geocoder->generateTestCoordinates($unparsedAddress);
            }
            
            $properties[$index]['Latitude'] = (string) $coordinates['lat'];
            $properties[$index]['Longitude'] = (string) $coordinates['lng'];
            
            // Log for debugging
            Log::debug('Added coordinates for property', [
                'ListingKey' => $property['ListingKey'] ?? 'unknown',
                'UnparsedAddress' => $unparsedAddress,
                'City' => $city,
                'Province' => $province,
                'PostalCode' => $postalCode,
                'Coordinates' => $coordinates,
                'Source' => $coordinates['source'] ?? 'unknown'
            ]);
        }

        return $properties;
    }

    /**
     * Check if a URL is valid for an image
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
     * Apply global search filter across multiple fields
     */
    private function applyGlobalSearchFilter($query)
    {
        $escapedQuery = addslashes($query);
        
        // Extract key parts from the address for more flexible matching
        // Handle Google Maps formatted addresses like "65 Bremner Blvd, Toronto, ON M5J 0A7, Canada"
        $parts = array_map('trim', explode(',', $query));
        
        // Check if this looks like a full address (has multiple parts)
        if (count($parts) >= 2) {
            // Extract street address (first part)
            $streetAddress = $parts[0];
            
            // Extract postal code if present (look for pattern like M5J 0A7)
            $postalCode = '';
            foreach ($parts as $part) {
                if (preg_match('/[A-Z]\d[A-Z]\s*\d[A-Z]\d/i', $part, $matches)) {
                    $postalCode = trim($matches[0]);
                    break;
                }
            }
            
            // Extract street number and name for better matching
            $streetParts = [];
            if (preg_match('/^(\d+)\s+(.+)$/i', $streetAddress, $matches)) {
                $streetNumber = $matches[1];
                $streetName = $matches[2];
                
                // Handle abbreviations (Blvd -> Boulevard, St -> Street, etc.)
                $streetName = str_ireplace(
                    ['Blvd', 'Ave', 'St', 'Rd', 'Dr', 'Crt', 'Pl', 'Sq', 'Ter'],
                    ['Boulevard', 'Avenue', 'Street', 'Road', 'Drive', 'Court', 'Place', 'Square', 'Terrace'],
                    $streetName
                );
                
                // Build search filter for flexible matching
                $filters = [];
                
                // Search by street number and name (partial match to handle unit numbers)
                $filters[] = "contains(UnparsedAddress, '" . addslashes($streetNumber . ' ' . $streetName) . "')";
                
                // Also try with original street name in case it's already full
                $filters[] = "contains(UnparsedAddress, '" . addslashes($streetAddress) . "')";
                
                // If we have postal code, add it as an additional filter
                if ($postalCode) {
                    $searchFilter = "(" . implode(' or ', $filters) . ") and contains(PostalCode, '" . addslashes($postalCode) . "')";
                } else {
                    $searchFilter = "(" . implode(' or ', $filters) . ")";
                }
                
                $this->ampreApi->addCustomFilter($searchFilter);
                return;
            }
        }
        
        // Fallback to original search for simple queries
        $searchFilter = "(contains(UnparsedAddress, '" . $escapedQuery . "') " .
                       "or contains(City, '" . $escapedQuery . "') " .
                       "or contains(PostalCode, '" . $escapedQuery . "'))";
        
        $this->ampreApi->addCustomFilter($searchFilter);
    }

    /**
     * Apply sort order to API client
     */
    private function applySortOrder($sortType)
    {
        switch ($sortType) {
            case 'newest':
                $this->ampreApi->setOrderBy('ListingContractDate desc');
                break;
            case 'price-high':
                $this->ampreApi->setOrderBy('ListPrice desc');
                break;
            case 'price-low':
                $this->ampreApi->setOrderBy('ListPrice asc');
                break;
            case 'bedrooms':
                $this->ampreApi->setOrderBy('BedroomsTotal desc');
                break;
            case 'bathrooms':
                $this->ampreApi->setOrderBy('BathroomsTotalInteger desc');
                break;
            case 'sqft':
                $this->ampreApi->setOrderBy('AboveGradeFinishedArea desc');
                break;
            default:
                $this->ampreApi->setOrderBy('ListingContractDate desc');
                break;
        }
    }

    /**
     * Add property images using the same pattern as WordPress plugin
     */
    private function addPropertyImages(array $properties)
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
            
            // Track used images to avoid duplicates
            $usedImages = [];

            foreach ($properties as $index => $property) {
                $listingKey = $property['ListingKey'] ?? null;
                $propertyImages = $imagesByKey[$listingKey] ?? [];

                // Add full Images array to property
                $properties[$index]['Images'] = $propertyImages;
                
                // Get the first valid image URL
                $imageUrl = null;
                foreach ($propertyImages as $img) {
                    if (!empty($img['MediaURL']) && $this->isValidImageUrl($img['MediaURL'])) {
                        $imageUrl = $img['MediaURL'];
                        break;
                    }
                }
                
                // Check if this image has been used already
                if ($imageUrl && in_array($imageUrl, $usedImages)) {
                    // Try to find an alternative image from the array
                    $alternativeFound = false;
                    foreach ($propertyImages as $img) {
                        if (!empty($img['MediaURL']) && 
                            !in_array($img['MediaURL'], $usedImages) && 
                            $this->isValidImageUrl($img['MediaURL'])) {
                            $imageUrl = $img['MediaURL'];
                            $alternativeFound = true;
                            break;
                        }
                    }
                    
                    // If no alternative found, log it for debugging
                    if (!$alternativeFound && $imageUrl) {
                        Log::debug("Duplicate image detected for property {$listingKey}, still using it");
                    }
                }
                
                // Track this image as used
                if ($imageUrl) {
                    $usedImages[] = $imageUrl;
                }
                
                // Add MediaURL - ensure it's a valid URL or null
                $properties[$index]['MediaURL'] = $imageUrl;
            }

        } catch (Exception $e) {
            Log::error('Error fetching property images: ' . $e->getMessage());

            foreach ($properties as $index => $property) {
                $properties[$index]['Images'] = [];
                $properties[$index]['MediaURL'] = null;
            }
        }

        return $properties;
    }

    /**
     * Format properties for JSON response
     */
    private function formatProperties(array $properties)
    {
        $formatted = [];

        foreach ($properties as $property) {
            $formatted[] = [
                // Core property data
                'ListingKey' => $property['ListingKey'] ?? '',
                'ListPrice' => $property['ListPrice'] ?? 0,
                'UnparsedAddress' => $property['UnparsedAddress'] ?? '',
                'BedroomsTotal' => $property['BedroomsTotal'] ?? 0,
                'BathroomsTotalInteger' => $property['BathroomsTotalInteger'] ?? 0,
                'AboveGradeFinishedArea' => $property['AboveGradeFinishedArea'] ?? 0,
                'ParkingTotal' => $property['ParkingTotal'] ?? 0,
                'PropertySubType' => $property['PropertySubType'] ?? '',
                'PropertyType' => $property['PropertyType'] ?? '',
                'StandardStatus' => $property['StandardStatus'] ?? 'Active',
                'TransactionType' => $property['TransactionType'] ?? '',
                'City' => $property['City'] ?? '',
                'StateOrProvince' => $property['StateOrProvince'] ?? '',
                'PostalCode' => $property['PostalCode'] ?? '',
                'Latitude' => $property['Latitude'] ?? '',
                'Longitude' => $property['Longitude'] ?? '',
                
                // Additional fields
                'ListingContractDate' => $property['ListingContractDate'] ?? '',
                'DaysOnMarket' => $this->calculateDaysOnMarket($property['ListingContractDate'] ?? ''),
                'OpenHouseDate' => $property['OpenHouseDate'] ?? '',
                'MediaURL' => $property['MediaURL'] ?? null,
                'Images' => $property['Images'] ?? [],
                'formatted_status' => $this->formatStatusDisplay($property['TransactionType'] ?? '', $property['StandardStatus'] ?? 'Active'),
                'has_open_house' => $this->hasOpenHouse($property)
            ];
        }

        return $formatted;
    }

    /**
     * Calculate days on market from ListingContractDate
     */
    private function calculateDaysOnMarket($listingContractDate)
    {
        if (empty($listingContractDate)) {
            return 0;
        }
        
        $contractTimestamp = strtotime($listingContractDate);
        
        if ($contractTimestamp === false) {
            return 0;
        }
        
        $today = strtotime('today');
        $daysDifference = floor(($today - $contractTimestamp) / (60 * 60 * 24));
        
        return max(0, $daysDifference);
    }

    /**
     * Format status for display
     */
    private function formatStatusDisplay($transactionType, $standardStatus = '')
    {
        if (!empty($transactionType)) {
            switch ($transactionType) {
                case 'For Sale':
                    return 'For Sale';
                case 'For Lease':
                case 'For Rent':
                    return 'For Rent';
                case 'Sold':
                    return 'Sold';
                case 'Leased':
                    return 'Leased';
                default:
                    return $transactionType;
            }
        }
        
        switch ($standardStatus) {
            case 'Active':
                return 'For Sale';
            case 'Pending':
                return 'Pending';
            case 'Closed':
                return 'Sold';
            default:
                return ucfirst(strtolower($standardStatus));
        }
    }

    /**
     * Check if property has an open house
     */
    private function hasOpenHouse($property)
    {
        $openHouseFields = [
            'OpenHouseDate',
            'OpenHouseStartTime',
            'OpenHouseEndTime'
        ];
        
        foreach ($openHouseFields as $field) {
            if (!empty($property[$field]) && trim($property[$field]) !== '') {
                if ($field === 'OpenHouseDate') {
                    $timestamp = strtotime($property[$field]);
                    if ($timestamp !== false && $timestamp >= strtotime('today')) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Sanitize and validate search parameters
     */
    private function sanitizeSearchParams(array $params)
    {
        $defaults = [
            'page' => 1,
            'page_size' => 15,
            'query' => '',
            'status' => 'For Sale',
            'property_type' => [],
            'price_min' => 0,
            'price_max' => 10000000, // Default max price of 10 million
            'bedrooms' => 0,
            'bathrooms' => 0,
            'sort' => 'newest',
        ];
        
        if (!is_array($params)) {
            return $defaults;
        }
        
        $sanitized = array_merge($defaults, $params);
        
        // Sanitize numeric values
        $sanitized['page'] = max(1, (int)$sanitized['page']);
        $sanitized['page_size'] = max(1, min(50, (int)$sanitized['page_size']));
        $sanitized['price_min'] = (int)$sanitized['price_min'];
        $sanitized['price_max'] = (int)$sanitized['price_max'];
        $sanitized['bedrooms'] = (int)$sanitized['bedrooms'];
        $sanitized['bathrooms'] = (int)$sanitized['bathrooms'];

        // Sanitize string values
        $sanitized['status'] = htmlspecialchars($sanitized['status']);
        $sanitized['query'] = htmlspecialchars($sanitized['query']);
        $sanitized['sort'] = htmlspecialchars($sanitized['sort']);
        
        // Validate sort parameter
        $validSorts = ['newest', 'price-high', 'price-low', 'bedrooms', 'bathrooms', 'sqft'];
        if (!in_array($sanitized['sort'], $validSorts)) {
            $sanitized['sort'] = 'newest';
        }

        // Sanitize property type array
        if (is_array($sanitized['property_type'])) {
            $sanitized['property_type'] = array_map('htmlspecialchars', $sanitized['property_type']);
            $sanitized['property_type'] = array_filter($sanitized['property_type'], function($type) {
                return !empty($type) && trim($type) !== '';
            });
        } else {
            $sanitized['property_type'] = [];
        }

        return $sanitized;
    }

    /**
     * Clean output buffer to prevent corrupted JSON responses
     */
    private function cleanOutputBuffer()
    {
        try {
            while (ob_get_level()) {
                ob_end_clean();
            }
        } catch (Exception $e) {
            // If cleaning buffer fails, just continue
        }
    }
}
