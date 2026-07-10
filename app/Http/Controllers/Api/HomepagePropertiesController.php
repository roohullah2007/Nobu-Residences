<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RepliersApiService;
use App\Models\Setting;
use Illuminate\Http\Request;
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
     * Fetches live from the Repliers API
     */
    public function getHomepageProperties(Request $request)
    {
        try {
            // Clean any existing output
            while (ob_get_level()) {
                ob_end_clean();
            }

            $type = $request->get('type', 'both'); // 'sale', 'rent', or 'both'

            // Resolve the CURRENT tenant (website) the same way WebsiteController
            // does — by ?website={slug} first, then domain match — so each site's
            // carousels show ITS OWN building, not a hardcoded default.
            $website = $this->resolveCurrentWebsite($request);
            $homePage = $website ? $website->pages()->where('page_type', 'home')->first() : null;
            $mlsSettings = $homePage ? ($homePage->content['mls_settings'] ?? []) : [];

            // Resolve the building this tenant's home page is built around
            // (prefer the website's homepage_building_id — same as home()) so we
            // can use ALL of its street addresses and attach the building
            // name/neighbourhood to each listing.
            $defaultBuilding = $this->resolveDefaultBuilding($mlsSettings, $website);

            $forSaleProperties = [];
            $forRentProperties = [];

            // Fetch For Sale properties live from Repliers API
            if ($type === 'sale' || $type === 'both') {
                $forSaleProperties = $this->fetchHomepagePropertiesFromRepliers('sale', $defaultBuilding, $mlsSettings);
            }

            // Fetch For Rent properties live from Repliers API
            if ($type === 'rent' || $type === 'both') {
                $forRentProperties = $this->fetchHomepagePropertiesFromRepliers('lease', $defaultBuilding, $mlsSettings);
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
     * Resolve the CURRENT tenant (website) for this request, mirroring
     * WebsiteController::getCurrentWebsite():
     *   1. ?website={slug} query parameter (preview/testing).
     *   2. Domain match against Website.domain (www. stripped; localhost/dev skipped).
     *   3. Last resort: the default active website, then the first website / id 1.
     * Kept self-contained so this API endpoint stays multi-tenant aware.
     */
    private function resolveCurrentWebsite(Request $request)
    {
        try {
            $resolver = app(\App\Services\Tenancy\TenantResolver::class);

            // API endpoint: fall back to the default site for unknown hosts
            // instead of 404 — the page-level 404 already happened (or not)
            // on the HTML request; this just feeds its property widgets.
            return $resolver->resolve($request)
                ?? $resolver->defaultWebsite()
                ?? \App\Models\Website::find(1);
        } catch (\Throwable $e) {
            return \App\Models\Website::find(1);
        }
    }

    /**
     * Find the building configured for the current tenant's home page.
     * Resolves the SAME way WebsiteController::home() does — prefer the
     * website's homepage_building_id, then the legacy mls_settings keys, and
     * only fall back to "NOBU" by name as a final default.
     */
    private function resolveDefaultBuilding(array $mlsSettings, $website = null)
    {
        try {
            // Priority 1: the tenant's configured homepage building (same as home()).
            if ($website && $website->homepage_building_id) {
                $b = \App\Models\Building::find($website->homepage_building_id);
                if ($b) return $b;
            }
            // Priority 2: legacy mls_settings keys.
            if (!empty($mlsSettings['default_building_id'])) {
                $b = \App\Models\Building::find($mlsSettings['default_building_id']);
                if ($b) return $b;
            }
            if (!empty($mlsSettings['default_building_name'])) {
                $b = \App\Models\Building::whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($mlsSettings['default_building_name']) . '%'])->first();
                if ($b) return $b;
            }
            // Final fallback: NOBU Residences (the default the home page is built around).
            return \App\Models\Building::whereRaw('LOWER(name) LIKE ?', ['%nobu%'])->first();
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Fetch active listings for the homepage carousel from the Repliers API.
     *
     * Reuses the building-detail page's address logic so the carousel returns
     * the SAME listings (and count) as the building-detail page:
     *   - Building::parsedStreetAddresses() expands SA1/SA2/additional_addresses
     *     (handles ranges like "8-38 Widmer St", stored as individual numbers).
     *   - Group by street name -> ONE Repliers query per street (not per number),
     *     then keep only listings whose streetNumber is one of the building's.
     * Mirrors WebsiteController::fetchBuildingListingsFromRepliers /
     * Building::getLiveListingCounts.
     *
     * @param string $type 'sale' or 'lease'
     * @param object|null $building Building model providing addresses + name/neighbourhood
     * @param array  $mlsSettings Legacy fallback addresses if the building has none
     */
    private function fetchHomepagePropertiesFromRepliers(string $type, $building = null, array $mlsSettings = []): array
    {
        try {
            $merged = [];
            $seen = [];
            $transactionType = $type === 'lease' ? 'For Rent' : 'For Sale';

            // Group the building's parsed addresses by street name so we make
            // ONE Repliers query per street, then number-match the results.
            $groups = [];
            if ($building) {
                foreach ($building->parsedStreetAddresses() as $addr) {
                    $key = strtolower($addr['name']);
                    if (!isset($groups[$key])) {
                        $groups[$key] = ['name' => $addr['name'], 'numbers' => []];
                    }
                    $groups[$key]['numbers'][(string) $addr['number']] = true;
                }
            }

            // Legacy fallback: if the building has no usable addresses, use the
            // mls_settings keys (then NOBU's defaults).
            if (empty($groups)) {
                $fallback = [];
                $configured = $mlsSettings['default_building_addresses'] ?? null;
                if (is_array($configured) && !empty($configured)) {
                    $fallback = $configured;
                } elseif (!empty($mlsSettings['default_building_address'])) {
                    $fallback = preg_split('/\s*[,&]\s*/', $mlsSettings['default_building_address']);
                } else {
                    $fallback = ['15 Mercer', '35 Mercer'];
                }
                foreach ($fallback as $addr) {
                    if (!preg_match('/^(\d+)\s+(.+)$/', trim($addr), $m)) {
                        continue;
                    }
                    $name = preg_replace('/\s+(St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Ct|Court|Pl|Place|Ln|Lane|Way)$/i', '', $m[2]);
                    $key = strtolower($name);
                    if (!isset($groups[$key])) {
                        $groups[$key] = ['name' => $name, 'numbers' => []];
                    }
                    $groups[$key]['numbers'][(string) $m[1]] = true;
                }
            }

            $cityFilter = $building->city ?? null;

            foreach ($groups as $g) {
                $apiParams = [
                    'class' => 'condoProperty',
                    'status' => 'A',
                    'type' => $type,
                    'streetName' => $g['name'],
                    'pageNum' => 1,
                    'resultsPerPage' => 200,
                    'sortBy' => 'createdOnDesc',
                ];
                if (!empty($cityFilter)) {
                    $apiParams['city'] = $cityFilter;
                }

                $apiResult = $this->repliersApi->searchListings($apiParams);
                $listings = $apiResult['listings'] ?? [];

                foreach ($listings as $listing) {
                    $key = $listing['mlsNumber'] ?? null;
                    if (!$key || isset($seen[$key])) continue;
                    // Keep only listings whose streetNumber matches the building.
                    $num = (string) ($listing['address']['streetNumber'] ?? '');
                    if ($num === '' || !isset($g['numbers'][$num])) continue;
                    $seen[$key] = true;
                    $merged[] = $listing;
                }
            }

            Log::info("Homepage Repliers fetch", [
                'type' => $type,
                'building' => $building->name ?? null,
                'streets' => array_keys($groups),
                'count' => count($merged),
            ]);

            return $this->formatRepliersListingsForCarousel($merged, $transactionType, $building);
        } catch (Exception $e) {
            Log::error("Error fetching homepage properties from Repliers ({$type}): " . $e->getMessage());
            return [];
        }
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

            // Maintenance fee (numeric or string; may be null)
            $maintenance = $listing['details']['maintenanceFee'] ?? ($listing['details']['maintenance'] ?? null);

            // Days on market — guard so a bad/missing date never throws.
            $daysOnMarket = null;
            if (!empty($listing['listDate'])) {
                try {
                    $daysOnMarket = (int) \Carbon\Carbon::parse($listing['listDate'])->diffInDays(now());
                } catch (\Throwable $e) {
                    $daysOnMarket = isset($listing['daysOnMarket']) ? (int) $listing['daysOnMarket'] : null;
                }
            } elseif (isset($listing['daysOnMarket'])) {
                $daysOnMarket = (int) $listing['daysOnMarket'];
            }

            $formatted[] = [
                'maintenance' => $maintenance,
                'days_on_market' => $daysOnMarket,
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