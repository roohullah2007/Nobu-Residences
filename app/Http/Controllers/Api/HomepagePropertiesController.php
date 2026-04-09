<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RepliersApiService;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class HomepagePropertiesController extends Controller
{
    private RepliersApiService $repliersApi;

    public function __construct(RepliersApiService $repliersApi)
    {
        $this->repliersApi = $repliersApi;
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

            // Resolve the default building so we can use ALL of its street
            // addresses (e.g. NOBU Residences = 15 Mercer + 35 Mercer) and
            // attach the building name/neighbourhood to each listing.
            $defaultBuilding = $this->resolveDefaultBuilding($mlsSettings);
            $defaultAddresses = $this->buildingStreetAddresses($defaultBuilding, $mlsSettings);

            $forSaleProperties = [];
            $forRentProperties = [];

            // Fetch For Sale properties live from Repliers API
            if ($type === 'sale' || $type === 'both') {
                $forSaleProperties = $this->fetchHomepagePropertiesFromRepliers('sale', $defaultAddresses, $defaultBuilding);
            }

            // Fetch For Rent properties live from Repliers API
            if ($type === 'rent' || $type === 'both') {
                $forRentProperties = $this->fetchHomepagePropertiesFromRepliers('lease', $defaultAddresses, $defaultBuilding);
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
     * Find the building configured for the home page (by id, name, or address).
     * Falls back to looking up "NOBU" by name.
     */
    private function resolveDefaultBuilding(array $mlsSettings)
    {
        try {
            if (!empty($mlsSettings['default_building_id'])) {
                $b = \App\Models\Building::find($mlsSettings['default_building_id']);
                if ($b) return $b;
            }
            if (!empty($mlsSettings['default_building_name'])) {
                $b = \App\Models\Building::whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($mlsSettings['default_building_name']) . '%'])->first();
                if ($b) return $b;
            }
            // Fall back to NOBU Residences (the default the home page is built around)
            return \App\Models\Building::whereRaw('LOWER(name) LIKE ?', ['%nobu%'])->first();
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Return all street-address strings for a building (e.g. ["15 Mercer", "35 Mercer"]).
     * Splits the main address on "," and "&" if separate fields aren't set.
     */
    private function buildingStreetAddresses($building, array $mlsSettings = []): array
    {
        $addresses = [];
        if ($building) {
            foreach ([$building->street_address_1 ?? null, $building->street_address_2 ?? null] as $a) {
                if ($a && preg_match('/^(\d+\s+[A-Za-z]+)/i', trim($a), $m)) {
                    $addresses[] = $m[1];
                }
            }
            if (empty($addresses) && !empty($building->address)) {
                foreach (preg_split('/\s*[,&]\s*/', $building->address) as $part) {
                    if (preg_match('/^(\d+\s+[A-Za-z]+)/i', trim($part), $m)) {
                        $addresses[] = $m[1];
                    }
                }
            }
        }
        if (empty($addresses)) {
            // Fall back to the legacy mls_settings keys, then to NOBU defaults
            $configured = $mlsSettings['default_building_addresses'] ?? null;
            if (is_array($configured) && !empty($configured)) {
                $addresses = $configured;
            } else {
                $single = $mlsSettings['default_building_address'] ?? null;
                if ($single) {
                    foreach (preg_split('/\s*[,&]\s*/', $single) as $part) {
                        if (preg_match('/^(\d+\s+[A-Za-z]+)/i', trim($part), $m)) {
                            $addresses[] = $m[1];
                        }
                    }
                }
            }
        }
        if (empty($addresses)) {
            $addresses = ['15 Mercer', '35 Mercer'];
        }
        return array_values(array_unique($addresses));
    }

    /**
     * Fetch active listings for the homepage carousel from the Repliers API.
     * Mirrors WebsiteController::fetchBuildingListingsFromRepliers — calls
     * Repliers with streetNumber + streetName filters for each address so the
     * carousel reflects live MLS data instead of the (often empty) local DB.
     *
     * @param string $type 'sale' or 'lease'
     * @param array  $streetAddresses e.g. ['15 Mercer', '35 Mercer']
     * @param object|null $building Optional building model to attach name/neighbourhood
     */
    private function fetchHomepagePropertiesFromRepliers(string $type, array $streetAddresses, $building = null): array
    {
        try {
            $merged = [];
            $seen = [];
            $transactionType = $type === 'lease' ? 'For Rent' : 'For Sale';

            foreach ($streetAddresses as $addr) {
                if (!preg_match('/^(\d+)\s+(.+)$/', trim($addr), $m)) {
                    continue;
                }
                $streetNumber = $m[1];
                $streetName = preg_replace('/\s+(St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Ct|Court|Pl|Place|Ln|Lane|Way)$/i', '', $m[2]);

                $apiParams = [
                    'class' => 'condoProperty',
                    'status' => 'A',
                    'type' => $type,
                    'streetNumber' => $streetNumber,
                    'streetName' => $streetName,
                    'pageNum' => 1,
                    'resultsPerPage' => 12,
                    'sortBy' => 'createdOnDesc',
                ];

                $apiResult = $this->repliersApi->searchListings($apiParams);
                $listings = $apiResult['listings'] ?? [];

                foreach ($listings as $listing) {
                    $key = $listing['mlsNumber'] ?? null;
                    if (!$key || isset($seen[$key])) continue;
                    $seen[$key] = true;
                    $merged[] = $listing;
                }
            }

            Log::info("Homepage Repliers fetch", [
                'type' => $type,
                'addresses' => $streetAddresses,
                'count' => count($merged),
            ]);

            return $this->formatRepliersListingsForCarousel($merged, $transactionType, $building);
        } catch (Exception $e) {
            Log::error("Error fetching homepage properties from Repliers ({$type}): " . $e->getMessage());
            return [];
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
            // Parse address to search for nearby properties
            $addressParts = explode(',', $address);
            $streetAddress = trim($addressParts[0] ?? $address);

            // Extract street name for area search
            $streetParts = explode(' ', $streetAddress);
            $streetName = implode(' ', array_slice($streetParts, 1));

            // Filter by city - extract just the city name from full address format
            $cityName = explode(',', $city)[0] ?? 'Toronto';

            $type = ($transactionType === 'For Sale') ? 'sale' : 'lease';
            $minPrice = ($transactionType === 'For Sale') ? 200000 : 1000;

            $params = [
                'status' => 'A',
                'type' => $type,
                'city' => $cityName,
                'minPrice' => $minPrice,
                'resultsPerPage' => 12,
                'sortBy' => 'createdOnDesc',
            ];

            if (!empty($streetName)) {
                $params['search'] = $streetName;
            }

            // Fetch properties
            $apiResult = $this->repliersApi->searchListings($params);
            $listings = $apiResult['listings'] ?? [];

            // Log for debugging
            Log::info("Properties near {$address}, {$city} - {$transactionType}", [
                'street_name' => $streetName,
                'count' => count($listings),
                'total' => $apiResult['count'] ?? 0
            ]);

            // If no properties found, try broader search in the city
            if (empty($listings)) {
                Log::info("No properties found near {$address}, trying broader {$city} search");

                $broaderMinPrice = ($transactionType === 'For Sale') ? 300000 : 1500;
                $broaderMaxPrice = ($transactionType === 'For Sale') ? 3000000 : 6000;

                $broaderParams = [
                    'status' => 'A',
                    'type' => $type,
                    'city' => $cityName,
                    'minPrice' => $broaderMinPrice,
                    'maxPrice' => $broaderMaxPrice,
                    'resultsPerPage' => 12,
                    'sortBy' => 'priceDesc',
                ];

                $apiResult = $this->repliersApi->searchListings($broaderParams);
                $listings = $apiResult['listings'] ?? [];
            }

            // Format properties for frontend
            return $this->formatRepliersListingsForCarousel($listings, $transactionType);

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
            $type = ($transactionType === 'For Sale') ? 'sale' : 'lease';
            $minPrice = ($transactionType === 'For Sale') ? 200000 : 1000;

            $params = [
                'search' => $address,
                'status' => 'A',
                'type' => $type,
                'city' => 'Toronto',
                'minPrice' => $minPrice,
                'resultsPerPage' => 12,
                'sortBy' => 'createdOnDesc',
            ];

            // Fetch properties
            $apiResult = $this->repliersApi->searchListings($params);
            $listings = $apiResult['listings'] ?? [];

            // Log for debugging
            Log::info("Homepage properties fetch for {$address} - {$transactionType}", [
                'count' => count($listings),
                'total' => $apiResult['count'] ?? 0
            ]);

            // If no properties found at the address, try broader search
            if (empty($listings)) {
                Log::info("No properties found at {$address}, trying broader search");

                // Try to find properties on the same street (any number)
                $streetName = implode(' ', array_slice(explode(' ', $address), 1));
                $broaderMinPrice = ($transactionType === 'For Sale') ? 400000 : 2000;
                $broaderMaxPrice = ($transactionType === 'For Sale') ? 2000000 : 5000;

                $broaderParams = [
                    'status' => 'A',
                    'type' => $type,
                    'city' => 'Toronto',
                    'minPrice' => $broaderMinPrice,
                    'maxPrice' => $broaderMaxPrice,
                    'resultsPerPage' => 12,
                    'sortBy' => 'priceDesc',
                ];

                if (!empty($streetName)) {
                    $broaderParams['search'] = $streetName;
                }

                $apiResult = $this->repliersApi->searchListings($broaderParams);
                $listings = $apiResult['listings'] ?? [];

                Log::info("Broader {$streetName} search - {$transactionType}", [
                    'count' => count($listings),
                    'total' => $apiResult['count'] ?? 0
                ]);
            }

            // Format properties for frontend
            return $this->formatRepliersListingsForCarousel($listings, $transactionType);

        } catch (Exception $e) {
            Log::error("Error fetching {$transactionType} properties: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Format Repliers listings for carousel display
     */
    private function formatRepliersListingsForCarousel(array $listings, string $transactionType, $building = null)
    {
        $formatted = [];
        $isRental = in_array($transactionType, ['For Lease', 'For Rent']);

        // Pre-compute building name + neighbourhood string once
        $buildingName = $building->name ?? null;
        $buildingNeighbourhood = null;
        if ($building) {
            $parts = array_filter([
                $building->sub_neighbourhood ?? null,
                $building->neighbourhood ?? null,
                $building->city ?? null,
            ]);
            $buildingNeighbourhood = implode(', ', $parts) ?: null;
        }
        $buildingSlug = $building->slug ?? null;
        $buildingId = $building->id ?? null;
        $buildingStreet1 = $building->street_address_1 ?? null;
        $buildingStreet2 = $building->street_address_2 ?? null;
        $buildingAddress = $building->address ?? null;

        foreach ($listings as $listing) {
            // Get images from Repliers listing
            $imageUrls = $this->repliersApi->getListingImageUrls($listing);
            $imageUrl = !empty($imageUrls) ? $imageUrls[0] : null;

            $address = $listing['address']['unparsedAddress']
                ?? (($listing['address']['streetNumber'] ?? '') . ' ' . ($listing['address']['streetName'] ?? '') . ' ' . ($listing['address']['streetSuffix'] ?? ''))
                ?? '';

            $formatted[] = [
                'id' => $listing['mlsNumber'] ?? uniqid(),
                'listingKey' => $listing['mlsNumber'] ?? '',
                'imageUrl' => $imageUrl,
                'image' => $imageUrl,
                'images' => $imageUrls,
                'price' => $listing['listPrice'] ?? 0,
                'propertyType' => $listing['details']['propertyType'] ?? 'Property',
                'transactionType' => $listing['type'] ?? $transactionType,
                'bedrooms' => $listing['details']['numBedrooms'] ?? 0,
                'bathrooms' => $listing['details']['numBathrooms'] ?? 0,
                'address' => trim($address),
                'city' => $listing['address']['city'] ?? '',
                'postalCode' => $listing['address']['zip'] ?? '',
                'sqft' => $listing['details']['sqft'] ?? '',
                'LivingAreaRange' => $listing['details']['sqft'] ?? '',
                'livingAreaRange' => $listing['details']['sqft'] ?? '',
                'parking' => $listing['details']['numParkingSpaces'] ?? 0,
                'description' => $listing['details']['description'] ?? '',
                'isRental' => $isRental,
                'source' => 'mls',
                'UnitNumber' => $listing['address']['unitNumber'] ?? '',
                'unitNumber' => $listing['address']['unitNumber'] ?? '',
                'StreetNumber' => $listing['address']['streetNumber'] ?? '',
                'streetNumber' => $listing['address']['streetNumber'] ?? '',
                'StreetName' => $listing['address']['streetName'] ?? '',
                'streetName' => $listing['address']['streetName'] ?? '',
                'StreetSuffix' => $listing['address']['streetSuffix'] ?? '',
                'streetSuffix' => $listing['address']['streetSuffix'] ?? '',
                'ParkingTotal' => $listing['details']['numParkingSpaces'] ?? 0,
                'parkingTotal' => $listing['details']['numParkingSpaces'] ?? 0,
                'ListOfficeName' => $listing['office']['brokerageName'] ?? '',
                'listOfficeName' => $listing['office']['brokerageName'] ?? '',
                'BedroomsTotal' => $listing['details']['numBedrooms'] ?? 0,
                'bedroomsTotal' => $listing['details']['numBedrooms'] ?? 0,
                'BathroomsTotalInteger' => $listing['details']['numBathrooms'] ?? 0,
                'bathroomsTotalInteger' => $listing['details']['numBathrooms'] ?? 0,
                // Building info — used by listing cards to show
                // "Nobu Residences in King West, Downtown, Toronto"
                'building_name' => $buildingName,
                'buildingName' => $buildingName,
                'building_neighbourhood' => $buildingNeighbourhood,
                'buildingNeighbourhood' => $buildingNeighbourhood,
                'building_slug' => $buildingSlug,
                'building_id' => $buildingId,
                'building' => $building ? [
                    'id' => $buildingId,
                    'name' => $buildingName,
                    'slug' => $buildingSlug,
                    'address' => $buildingAddress,
                    'street_address_1' => $buildingStreet1,
                    'street_address_2' => $buildingStreet2,
                    'city' => $building->city ?? null,
                    'neighbourhood' => $building->neighbourhood ?? null,
                    'sub_neighbourhood' => $building->sub_neighbourhood ?? null,
                ] : null,
            ];
        }

        return $formatted;
    }
}