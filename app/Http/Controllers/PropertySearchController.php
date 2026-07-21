<?php

namespace App\Http\Controllers;

use App\Services\RepliersApiService;
use App\Services\GeocodingService;
use App\Models\SavedSearch;
use App\Models\Property;
use App\Models\Building;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;

class PropertySearchController extends Controller
{
    private RepliersApiService $repliersApi;
    private GeocodingService $geocoder;

    public function __construct(RepliersApiService $repliersApi, GeocodingService $geocoder)
    {
        $this->repliersApi = $repliersApi;
        $this->geocoder = $geocoder;
    }

    /**
     * Debug endpoint to check what leased statuses exist
     */
    public function debugLeasedStatuses(Request $request)
    {
        try {
            $this->cleanOutputBuffer();

            // Test different Repliers API queries
            $queries = [
                'active_sale' => ['status' => 'A', 'type' => 'sale', 'resultsPerPage' => 5],
                'active_lease' => ['status' => 'A', 'type' => 'lease', 'resultsPerPage' => 5],
                'sold' => ['status' => 'U', 'lastStatus' => 'Sld', 'resultsPerPage' => 5],
                'leased' => ['status' => 'U', 'lastStatus' => 'Lsd', 'resultsPerPage' => 5],
            ];

            $results = [];
            foreach ($queries as $key => $params) {
                try {
                    $result = $this->repliersApi->searchListings($params);
                    $results[$key] = [
                        'params' => $params,
                        'count' => $result['count'] ?? 0,
                        'sample' => array_slice($result['listings'] ?? [], 0, 2),
                    ];
                } catch (\Exception $e) {
                    $results[$key] = [
                        'params' => $params,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'test_results' => $results,
                'note' => 'Testing Repliers API filters for listing statuses',
            ]);

        } catch (\Exception $e) {
            Log::error('Debug leased statuses error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle AJAX property search requests
     * Properties are fetched live from the Repliers API.
     */
    public function search(Request $request)
    {
        try {
            // Clean any existing output
            $this->cleanOutputBuffer();

            // Get and sanitize search parameters
            $searchParams = $request->input('search_params', []);
            $sanitizedParams = $this->sanitizeSearchParams($searchParams);

            $pageSize = $sanitizedParams['page_size'];
            $currentPage = $sanitizedParams['page'];

            // Generate cache key for common searches (first 5 pages only)
            // Cache improves cold start performance significantly
            $cacheKey = null;
            $cacheTtl = 300; // 5 minutes cache
            if ($currentPage <= 5) {
                $cacheKey = 'search:' . md5(json_encode([
                    'params' => $sanitizedParams
                ]));

                // Try to get from cache
                $cachedResponse = Cache::get($cacheKey);
                if ($cachedResponse) {
                    $cachedResponse['data']['debug']['cache_hit'] = true;
                    return response()->json($cachedResponse);
                }
            }

            // Fetch listings directly from Repliers API
            $apiResult = $this->fetchPropertiesFromRepliersAPI($sanitizedParams);
            $properties = $apiResult['properties'];
            $totalCount = $apiResult['count'];

            // Add data_source marker to each property
            foreach ($properties as &$prop) {
                $prop['data_source'] = 'repliers_api';
            }
            unset($prop);

            // Return empty result if no properties found
            if (empty($properties)) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'properties' => [],
                        'total' => 0,
                        'page' => $currentPage,
                        'page_size' => $pageSize,
                        'has_more' => false,
                        'message' => 'No properties found with current filters'
                    ]
                ]);
            }

            // Format properties for JSON response (NO API calls - uses DB images)
            $formattedProperties = $this->formatProperties($properties);

            // Prepare response data
            $responseData = [
                'properties' => $formattedProperties,
                'total' => $totalCount,
                'displayed' => count($formattedProperties),
                'page' => $currentPage,
                'page_size' => $pageSize,
                'has_more' => ($currentPage * $pageSize) < $totalCount,
                'mls_db_total' => $totalCount,
                'debug' => [
                    'data_source' => 'repliers_api',
                    'properties_count' => count($properties),
                    'cache_hit' => false
                ]
            ];

            // Note: Map in mixed view now uses ClusteredPropertyMap which independently
            // fetches coordinates via /api/map-coordinates endpoint

            $response = [
                'success' => true,
                'data' => $responseData
            ];

            // Cache the response for first 5 pages
            if ($cacheKey) {
                Cache::put($cacheKey, $response, $cacheTtl);
            }

            return response()->json($response);

        } catch (Exception $e) {
            Log::error('Property search error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Search failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get property count for filter preview in FiltersModal
     * Lightweight endpoint that returns only the count, no property data
     * Used for dynamic "See X properties" button updates
     */
    public function searchCount(Request $request)
    {
        try {
            // Clean any existing output
            $this->cleanOutputBuffer();

            // Get and sanitize search parameters
            $searchParams = $request->input('search_params', []);
            $sanitizedParams = $this->sanitizeSearchParams($searchParams);

            // Generate cache key for count queries (short TTL for freshness)
            $cacheKey = 'search_count:' . md5(json_encode($sanitizedParams));
            $cacheTtl = 60; // 1 minute cache for count queries

            // Try to get from cache
            $cachedCount = Cache::get($cacheKey);
            if ($cachedCount !== null) {
                return response()->json([
                    'success' => true,
                    'count' => $cachedCount,
                    'cached' => true
                ]);
            }

            // Get count from Repliers API (use small page to minimize data transfer)
            $sanitizedParams['page_size'] = 1;
            $sanitizedParams['page'] = 1;
            $apiResult = $this->fetchPropertiesFromRepliersAPI($sanitizedParams);
            $count = $apiResult['count'];

            // Cache the count
            Cache::put($cacheKey, $count, $cacheTtl);

            return response()->json([
                'success' => true,
                'count' => $count,
                'cached' => false
            ]);

        } catch (Exception $e) {
            Log::error('Property search count error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'count' => 0,
                'message' => 'Count failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch properties from the backend database (Property model)
     */
    private function fetchBackendProperties(array $params): array
    {
        $query = Property::query()->with('building');

        // Apply status/transaction type filter
        $status = $params['status'] ?? 'For Sale';
        $propertyStatus = $params['property_status'] ?? '';

        if (!empty($propertyStatus)) {
            // Sold/Leased filtering
            if (strtolower($propertyStatus) === 'sold') {
                $query->where('status', 'sold');
            } elseif (strtolower($propertyStatus) === 'leased') {
                $query->whereIn('status', ['leased', 'rented']);
            }
        } else {
            // Active listings filtering
            $query->where('status', 'active');

            if ($status === 'For Sale') {
                $query->where('transaction_type', 'sale');
            } elseif (in_array($status, ['For Lease', 'For Rent'])) {
                $query->whereIn('transaction_type', ['rent', 'lease']);
            }
        }

        // Apply location filter
        if (!empty($params['query'])) {
            $searchQuery = $params['query'];
            $query->where(function($q) use ($searchQuery) {
                $q->where('city', 'like', "%{$searchQuery}%")
                  ->orWhere('address', 'like', "%{$searchQuery}%")
                  ->orWhere('full_address', 'like', "%{$searchQuery}%")
                  ->orWhere('postal_code', 'like', "%{$searchQuery}%");
            });
        }

        // Apply street_number and street_name filter
        if (!empty($params['street_number']) && !empty($params['street_name'])) {
            $query->where('address', 'like', "%{$params['street_number']}%{$params['street_name']}%");
        }

        // Apply property type filter
        if (!empty($params['property_type']) && count($params['property_type']) > 0) {
            $query->whereIn('property_type', $params['property_type']);
        }

        // Apply price range filter
        if ($params['price_min'] > 0) {
            $query->where('price', '>=', $params['price_min']);
        }
        if ($params['price_max'] > 0 && $params['price_max'] < 10000000) {
            $query->where('price', '<=', $params['price_max']);
        }

        // Apply bedroom filter
        if ($params['bedrooms'] > 0) {
            $query->where('bedrooms', '>=', $params['bedrooms']);
        }

        // Apply bathroom filter
        if ($params['bathrooms'] > 0) {
            $query->where('bathrooms', '>=', $params['bathrooms']);
        }

        // Apply sorting
        switch ($params['sort'] ?? 'newest') {
            case 'newest':
                $query->orderBy('listing_date', 'desc')->orderBy('created_at', 'desc');
                break;
            case 'price-high':
                $query->orderBy('price', 'desc');
                break;
            case 'price-low':
                $query->orderBy('price', 'asc');
                break;
            case 'bedrooms':
                $query->orderBy('bedrooms', 'desc');
                break;
            case 'bathrooms':
                $query->orderBy('bathrooms', 'desc');
                break;
            case 'sqft':
                $query->orderBy('area', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        // Get total count
        $totalCount = $query->count();

        // Apply pagination
        $pageSize = $params['page_size'] ?? 16;
        $page = $params['page'] ?? 1;
        $offset = ($page - 1) * $pageSize;

        $properties = $query->skip($offset)->take($pageSize)->get();

        // Convert to MLS-like format for consistency
        $formattedProperties = $properties->map(function ($property) {
            return $this->convertBackendPropertyToMlsFormat($property);
        })->toArray();

        return [
            'properties' => $formattedProperties,
            'count' => $totalCount
        ];
    }

    /**
     * Build the Repliers GET /listings query params from our internal search shape.
     * Shared by the listings grid and the map cluster endpoint.
     */
    // Public: SavedSearchAlertService reuses this mapping so alert emails
    // match exactly what the same saved search shows on the search page.
    public function buildRepliersListingsParams(array $params): array
    {
        $apiParams = [
            'pageNum' => $params['page'] ?? 1,
            'resultsPerPage' => $params['page_size'] ?? 16,
            'class' => 'condoProperty',
        ];

        // Status mapping
        $status = $params['status'] ?? 'For Sale';
        $propertyStatus = $params['property_status'] ?? '';

        if (!empty($propertyStatus)) {
            if (strtolower($propertyStatus) === 'sold') {
                $apiParams['status'] = 'U';
                $apiParams['lastStatus'] = ['Sld', 'Sc'];
            } elseif (strtolower($propertyStatus) === 'leased') {
                $apiParams['status'] = 'U';
                $apiParams['lastStatus'] = ['Lsd', 'Lc'];
            }
        } else {
            $apiParams['status'] = 'A';
            if (in_array($status, ['For Lease', 'For Rent'])) {
                $apiParams['type'] = 'lease';
            } elseif (in_array($status, ['Both', 'All'], true)) {
                // No sale/lease type filter — Repliers returns both. Used by
                // building alert saved searches that watch sale AND rent.
            } else {
                $apiParams['type'] = 'sale';
            }
        }

        // Location/search query. Three forms handled here:
        //   1) Exact GTA city name ("Toronto", "Mississauga"…) → city filter
        //   2) Street address with leading number ("189 Queen Street East",
        //      "15 Mercer St") → streetNumber + streetName (Repliers treats
        //      these as exact matches, where free-text `search` often
        //      misses on suffix/direction variations).
        //   3) Anything else (neighbourhood, keyword) → free-text `search`.
        if (!empty($params['query'])) {
            $query = trim($params['query']);
            $matchedCity = $this->matchGtaCity($query);
            if ($matchedCity) {
                $apiParams['city'] = $matchedCity;
            } elseif (preg_match('/^(\d+)\s+(.+)/', $query, $m)) {
                $num = $m[1];
                $rest = trim($m[2]);
                // Strip trailing direction (East/West/N/S etc.) first —
                // Repliers stores it separately from streetName.
                $rest = preg_replace(
                    '/\s*(North|South|East|West|N|S|E|W|NE|NW|SE|SW)\.?\s*$/i',
                    '',
                    $rest
                );
                // Then strip the trailing street-type suffix so "Queen
                // Street" → "Queen", matching Repliers' streetName column.
                $name = preg_replace(
                    '/\s*(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ct|Court|Pl|Place|Ln|Lane|Way|Cres|Crescent|Terr|Terrace)\.?\s*$/i',
                    '',
                    $rest
                );
                $name = trim($name);
                if ($name !== '') {
                    $apiParams['streetNumber'] = [$num];
                    $apiParams['streetName'] = [$name];
                } else {
                    $apiParams['search'] = $query;
                }
            } else {
                $apiParams['search'] = $query;
            }
        }

        // Default to Toronto only when no specific city/area scope is set.
        // Matches condos.ca's default and keeps the headline count meaningful
        // for the dominant condo market — wider GTA cities (Mississauga,
        // Vaughan, etc.) are still reachable by typing them into the search
        // box. Without this default, Repliers would return all of Ontario
        // and the count balloons to ~10k.
        if (empty($apiParams['city'])) {
            $apiParams['city'] = 'Toronto';
        }

        // Building scoping — accepts either ?building_id=<uuid> (we load the
        // Building and pull its street addresses) or ?street_addresses=
        // "15 Mercer St,35 Mercer" (we use the addresses directly, no DB
        // lookup required so the URL alone is sufficient). Multi-tower
        // buildings need every address fanned out to the Repliers query as
        // arrays which Repliers ORs together.
        $rawAddresses = [];
        if (!empty($params['street_addresses'])) {
            $rawAddresses = array_filter(array_map('trim', explode(',', $params['street_addresses'])));
        }
        if (empty($rawAddresses) && !empty($params['building_id'])) {
            $building = Building::find($params['building_id']);
            if ($building) {
                $candidates = [
                    $building->street_address_1 ?? null,
                    $building->street_address_2 ?? null,
                ];
                if (is_array($building->additional_addresses)) {
                    foreach ($building->additional_addresses as $a) {
                        $candidates[] = $a;
                    }
                }
                if (empty(array_filter($candidates))) {
                    $candidates[] = $building->address ?? null;
                }
                $rawAddresses = array_filter($candidates);
            }
        }

        // Expand compound values before parsing: legacy building data stores
        // "&"-joined pairs ("455 Front St W & 455 Wellington St W") and hyphen
        // ranges ("455-480 Front St W"). Parsing those raw swallows the tail
        // into streetName ("Front St W & 455 Wellington") and Repliers
        // returns zero listings — the "clicking a unit count shows nothing"
        // bug. splitCompoundAddress() is the same expander the count paths use.
        if (!empty($rawAddresses)) {
            $expandedAddresses = [];
            foreach ($rawAddresses as $raw) {
                foreach (Building::splitCompoundAddress($raw) as $piece) {
                    $expandedAddresses[] = $piece;
                }
            }
            $rawAddresses = $expandedAddresses;
        }

        if (!empty($rawAddresses)) {
            $streetNumbers = [];
            $streetNames = [];
            foreach ($rawAddresses as $addr) {
                if (!preg_match('/^(\d+)\s+(.+)/', trim($addr), $m)) {
                    continue;
                }
                $num = $m[1];
                $rest = trim($m[2]);
                // Strip ", Toronto" / ", ON M5V …" first so the suffix and
                // direction anchors below can hit the end-of-string.
                $rest = trim(preg_split('/\s*,/', $rest)[0] ?? $rest);
                // Strip the trailing direction from streetName ("470 Front
                // St W" → streetName=Front) — Repliers returns zero hits when
                // "W" / "East" stays glued on. The direction is deliberately
                // NOT passed as a streetDirection filter: Repliers ANDs it,
                // and many listings carry no direction in their MLS record
                // (The Well's "455 Front St W" units are all stored
                // direction-less), so filtering on it silently dropped 9 of
                // the building's 26 for-sale units. streetNumber + streetName
                // + city is precise enough.
                if (preg_match('/\s+(North|South|East|West|N|S|E|W|NE|NW|SE|SW)\.?$/i', $rest)) {
                    $rest = preg_replace('/\s+(North|South|East|West|N|S|E|W|NE|NW|SE|SW)\.?$/i', '', $rest);
                }
                $name = preg_replace(
                    '/\s*(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Ct|Court|Pl|Place|Ln|Lane|Way|Cres|Crescent|Terr|Terrace|Sq|Square)\.?\s*$/i',
                    '',
                    trim($rest)
                );
                $name = trim($name);
                if ($name === '') {
                    continue;
                }
                $key = $num . '|' . strtolower($name);
                if (isset($streetNumbers[$key])) continue;
                $streetNumbers[$key] = $num;
                $streetNames[$key] = $name;
            }

            if (!empty($streetNumbers)) {
                $apiParams['streetNumber'] = array_values($streetNumbers);
                $apiParams['streetName'] = array_values($streetNames);
                // Repliers ORs the streetNumber and streetName arrays
                // INDEPENDENTLY — a multi-street building like The Well
                // (455-480 Front + 455 Wellington) therefore cross-matches
                // strays such as "468 Wellington" (468 from the Front range,
                // Wellington from the name set). The exact number|name pairs
                // travel along under an internal key so fetch paths can
                // post-filter listings back to the real addresses; callers
                // MUST strip it before hitting the Repliers API.
                $apiParams['_streetAddressPairs'] = array_keys($streetNumbers);
                // Drop the generic free-text search so it doesn't narrow
                // the address-scoped query down further.
                unset($apiParams['search']);
            }
        }

        // When the user has scoped to an exact address (either via a
        // "189 Queen Street East" query or via building_id/street_addresses
        // for a building page), skip the style filter entirely. That
        // default style=Apartment was hiding lofts, townhouses, and
        // bachelor units at the same address — users searching for a
        // specific building want every unit type there.
        $hasAddressScope = !empty($apiParams['streetNumber']);
        if (!$hasAddressScope && !empty($params['property_type']) && count($params['property_type']) > 0) {
            // Map the FiltersModal property-type labels to Repliers `propertyType`
            // values. Repliers exposes the Detached/Semi/Condo distinction via
            // `propertyType` (NOT `style`, which on freehold homes describes the
            // storey layout — "2-Storey", "Bungalow" — so the old style=Detached
            // mapping matched nothing). Repliers ORs repeated params together, so
            // every selected type is passed as an array (makeRequest serialises
            // arrays as propertyType=Detached&propertyType=…). Freehold types also
            // require broadening `class` beyond the default condoProperty, else
            // they're excluded and the count never changes.
            //
            // Each label can expand to several Repliers propertyType values
            // (e.g. "Townhouse" covers both condo and freehold townhouses).
            $typeMap = [
                'Condo Apartment' => ['types' => ['Condo Apartment'], 'classes' => ['condoProperty']],
                'Co-Op Apt'       => ['types' => ['Co-Op Apartment', 'Co-Ownership Apartment'], 'classes' => ['condoProperty']],
                'Townhouse'       => ['types' => ['Condo Townhouse', 'Att/Row/Townhouse'], 'classes' => ['condoProperty', 'residentialProperty']],
                'Condo Townhouse' => ['types' => ['Condo Townhouse'], 'classes' => ['condoProperty']],
                'Detached'        => ['types' => ['Detached'], 'classes' => ['residentialProperty']],
                'Semi-Detached'   => ['types' => ['Semi-Detached'], 'classes' => ['residentialProperty']],
            ];

            $propertyTypes = [];
            $classes = [];
            foreach ($params['property_type'] as $type) {
                $entry = $typeMap[$type] ?? ['types' => [$type], 'classes' => ['condoProperty']];
                foreach ($entry['types'] as $t) {
                    if (!in_array($t, $propertyTypes, true)) {
                        $propertyTypes[] = $t;
                    }
                }
                foreach ($entry['classes'] as $c) {
                    if (!in_array($c, $classes, true)) {
                        $classes[] = $c;
                    }
                }
            }

            if (!empty($propertyTypes)) {
                $apiParams['propertyType'] = count($propertyTypes) === 1 ? $propertyTypes[0] : $propertyTypes;
                // Widen the class to cover the selected types (a Detached-only
                // selection must drop the default condoProperty class entirely).
                if (!empty($classes)) {
                    $apiParams['class'] = count($classes) === 1 ? $classes[0] : $classes;
                }
            }
        }

        if (($params['price_min'] ?? 0) > 0) {
            $apiParams['minPrice'] = $params['price_min'];
        }
        if (($params['price_max'] ?? 0) > 0 && $params['price_max'] < 10000000) {
            $apiParams['maxPrice'] = $params['price_max'];
        }

        if (($params['bedrooms'] ?? 0) > 0) {
            $beds = (int) $params['bedrooms'];
            $apiParams['minBedrooms'] = $beds;
            if ($beds < 5) {
                $apiParams['maxBedrooms'] = $beds;
            }
        }
        // "+den" variants (1+1, 2+1): Repliers exposes the den as numBedroomsPlus,
        // filterable via minBedroomsPlus.
        if (!empty($params['den']) && $params['den'] !== 'false') {
            $apiParams['minBedroomsPlus'] = 1;
        }
        if (($params['bathrooms'] ?? 0) > 0) {
            $apiParams['minBaths'] = $params['bathrooms'];
        }

        if (!empty($params['days_on_market']) && $params['days_on_market'] !== 'Any') {
            $days = (int) $params['days_on_market'];
            if (($apiParams['status'] ?? 'A') === 'U') {
                $apiParams['maxDaysOnMarket'] = $days;
            } else {
                $apiParams['minListDate'] = now()->subDays($days)->format('Y-m-d');
            }
        }

        if (!empty($params['keywords'])) {
            $existingSearch = $apiParams['search'] ?? '';
            $apiParams['search'] = trim($existingSearch . ' ' . $params['keywords']);
        }

        // Home types: "Loft" maps to a native Repliers style; the rest
        // (High-Rise, Mid-Rise, Low-Rise, Luxury, Penthouse) have no native
        // Repliers filter, so fold them into the free-text search.
        if (!empty($params['home_types']) && is_array($params['home_types'])) {
            $searchTerms = [];
            foreach ($params['home_types'] as $ht) {
                if (strcasecmp($ht, 'Loft') === 0 && empty($apiParams['style'])) {
                    $apiParams['style'] = 'Loft';
                } else {
                    $searchTerms[] = $ht;
                }
            }
            if (!empty($searchTerms)) {
                $apiParams['search'] = trim(($apiParams['search'] ?? '') . ' ' . implode(' ', $searchTerms));
            }
        }

        // Amenities — Repliers filters on condominium amenity names via repeated
        // `amenities` query params, which it ANDs together (a listing must have
        // every requested amenity). The FiltersModal uses friendly labels that
        // don't all match Repliers' canonical vocabulary (verified against the
        // condominium.amenities aggregate), so map each label to its exact
        // Repliers name. Labels with no Repliers amenity equivalent (internet
        // providers) fall back to free-text search so they still narrow results.
        if (!empty($params['amenities']) && is_array($params['amenities'])) {
            $amenityMap = [
                'Gym'             => 'Gym',
                'Pool'            => 'Indoor Pool',
                'Concierge'       => 'Concierge',
                'Guest Suites'    => 'Guest Suites',
                'Visitor Parking' => 'Visitor Parking',
                'BBQ Permitted'   => 'BBQs Allowed',
                'Party Room'      => 'Party Room/Meeting Room',
                'Rooftop Deck'    => 'Rooftop Deck/Garden',
            ];
            $mappedAmenities = [];
            $amenitySearchTerms = [];
            foreach ($params['amenities'] as $amenity) {
                if (isset($amenityMap[$amenity])) {
                    $mappedAmenities[] = $amenityMap[$amenity];
                } else {
                    // No native Repliers amenity (e.g. Beanfield Fibre,
                    // FibreStream) — fold into search so the count still moves.
                    $amenitySearchTerms[] = $amenity;
                }
            }
            if (!empty($mappedAmenities)) {
                $apiParams['amenities'] = array_values(array_unique($mappedAmenities));
            }
            if (!empty($amenitySearchTerms)) {
                $apiParams['search'] = trim(($apiParams['search'] ?? '') . ' ' . implode(' ', $amenitySearchTerms));
            }
        }

        // Locker / Balcony — Repliers filters natively on condominium.locker and
        // details.balcony (verified against their aggregates). "Yes" must match
        // any non-None value, so pass the full set of present values as an array
        // (Repliers ORs repeated params); "No" matches the literal "None".
        if (!empty($params['locker']) && $params['locker'] !== 'Any') {
            if (strcasecmp($params['locker'], 'No') === 0) {
                $apiParams['locker'] = 'None';
            } else {
                $apiParams['locker'] = [
                    'Owned', 'Exclusive', 'Ensuite', 'Common',
                    'Ensuite+Exclusive', 'Ensuite+Common', 'Ensuite+Owned',
                ];
            }
        }
        if (!empty($params['balcony']) && $params['balcony'] !== 'Any') {
            if (strcasecmp($params['balcony'], 'No') === 0) {
                $apiParams['balcony'] = 'None';
            } else {
                $apiParams['balcony'] = ['Open', 'Terrace', 'Juliette', 'Enclosed'];
            }
        }

        $sortMap = [
            'newest' => 'createdOnDesc',
            'price-high' => 'listPriceDesc',
            'price-low' => 'listPriceAsc',
            'bedrooms' => 'updatedOnDesc',
            'bathrooms' => 'updatedOnDesc',
            'sqft' => 'updatedOnDesc',
        ];
        $apiParams['sortBy'] = $sortMap[$params['sort'] ?? 'newest'] ?? 'createdOnDesc';

        if (!empty($params['viewport_bounds'])) {
            $bounds = $params['viewport_bounds'];
            if (!empty($bounds['polygon']) && is_array($bounds['polygon']) && count($bounds['polygon']) >= 3) {
                $ring = array_values(array_map(function ($pt) {
                    return [(float) $pt[0], (float) $pt[1]];
                }, $bounds['polygon']));
                if ($ring[0] !== end($ring)) {
                    $ring[] = $ring[0];
                }
                $apiParams['map'] = json_encode([[$ring]]);
            } elseif (isset($bounds['lat'], $bounds['long'], $bounds['radius'])) {
                $apiParams['lat'] = $bounds['lat'];
                $apiParams['long'] = $bounds['long'];
                $apiParams['radius'] = $bounds['radius'];
            } elseif (isset($bounds['north'], $bounds['south'], $bounds['east'], $bounds['west'])) {
                $n = (float) $bounds['north'];
                $s = (float) $bounds['south'];
                $e = (float) $bounds['east'];
                $w = (float) $bounds['west'];
                $centerLat = ($n + $s) / 2;
                $centerLng = ($e + $w) / 2;
                $latDiff = abs($n - $s) * 111.32;
                $lngDiff = abs($e - $w) * 111.32 * cos(deg2rad($centerLat));
                $radius = max($latDiff, $lngDiff) / 2;
                $radius = min(max($radius, 1), 50);

                $apiParams['lat'] = round($centerLat, 6);
                $apiParams['long'] = round($centerLng, 6);
                $apiParams['radius'] = round($radius, 1);
            }
        }

        return $apiParams;
    }

    /**
     * Exact (case-insensitive) match of a search query against the configured
     * GTA city list. Returns the canonical city name or null.
     */
    private function matchGtaCity(?string $query): ?string
    {
        $query = trim((string) $query);
        if ($query === '') {
            return null;
        }
        foreach (config('repliers.gta_cities', []) as $city) {
            if (strtolower($city) === strtolower($query)) {
                return $city;
            }
        }
        return null;
    }

    /**
     * Ray-casting point-in-polygon test. Polygon is an array of [lng, lat] pairs.
     */
    private function isPointInPolygon(float $lat, float $lng, array $polygon): bool
    {
        $count = count($polygon);
        if ($count < 3) return false;
        $inside = false;
        for ($i = 0, $j = $count - 1; $i < $count; $j = $i++) {
            [$xi, $yi] = $polygon[$i]; // [lng, lat]
            [$xj, $yj] = $polygon[$j];
            if ((($yi > $lat) !== ($yj > $lat)) &&
                ($lng < ($xj - $xi) * ($lat - $yi) / (($yj - $yi) ?: 1e-12) + $xi)) {
                $inside = !$inside;
            }
        }
        return $inside;
    }

    /**
     * Map a Google Maps zoom level to a Repliers clusterPrecision (geohash bits).
     * Higher precision = smaller geohash cells = more, finer clusters.
     *
     * Tuned against Toronto-wide condo data (~11k listings) and the 500-cluster
     * Repliers cap. Three bands — chunky at zoom-out (condos.ca-style big
     * neighbourhood bubbles), fine at mid-zoom so groups split, individual
     * price bubbles at zoom-in:
     *   zoom ≤ 13: precision = zoom + 2 (GTA-wide — a few dozen chunky
     *              bubbles with high listing counts per cluster)
     *   zoom 14-17: precision = zoom + 6 (street-level — small 2-4 point
     *              clusters that split further as the user zooms in)
     *   zoom ≥ 18: precision = zoom + 8 (building-level — every individual
     *              unit expands to a price marker)
     */
    private function clusterPrecisionForZoom(int $zoomLevel): int
    {
        if ($zoomLevel <= 13) {
            return max(9, $zoomLevel + 2);
        }
        if ($zoomLevel <= 17) {
            return min(24, $zoomLevel + 6);
        }
        return min(30, $zoomLevel + 8);
    }

    /**
     * Fetch properties directly from Repliers API
     * Buildings still come from local DB
     */
    private function fetchPropertiesFromRepliersAPI(array $params): array
    {
        $startTime = microtime(true);

        $apiParams = $this->buildRepliersListingsParams($params);

        // Address-scoped searches carry the exact number|name pairs (see
        // buildRepliersListingsParams): Repliers cross-matches its OR'd
        // arrays, so we fetch the (small) full result set in one call,
        // post-filter to the real addresses, and paginate locally — the
        // total then matches exactly what the building actually has.
        $addressPairs = $apiParams['_streetAddressPairs'] ?? null;
        unset($apiParams['_streetAddressPairs']);

        $requestedPage = (int) ($params['page'] ?? 1);
        $requestedPageSize = (int) ($params['page_size'] ?? 16);
        if ($addressPairs) {
            $apiParams['pageNum'] = 1;
            $apiParams['resultsPerPage'] = 100;
        }

        // Call Repliers API
        $repliersApi = app(\App\Services\RepliersApiService::class);
        $result = $repliersApi->searchListings($apiParams);

        $listings = $result['listings'] ?? [];
        $totalCount = $result['count'] ?? 0;

        if ($addressPairs) {
            $pairSet = array_flip($addressPairs);
            $matchesPair = function (array $listing) use ($pairSet): bool {
                $address = $listing['address'] ?? [];
                $num = trim((string) ($address['streetNumber'] ?? ''));
                // Repliers streetName excludes the suffix/direction already.
                $name = strtolower(trim((string) ($address['streetName'] ?? '')));
                return isset($pairSet[$num . '|' . $name]);
            };

            if ($totalCount <= 100) {
                $listings = array_values(array_filter($listings, $matchesPair));
                $totalCount = count($listings);
                $listings = array_slice($listings, ($requestedPage - 1) * $requestedPageSize, $requestedPageSize);
            } else {
                // Too many to fetch at once (never a single building) —
                // refetch the requested page and only drop the strays on it.
                $apiParams['pageNum'] = $requestedPage;
                $apiParams['resultsPerPage'] = $requestedPageSize;
                $result = $repliersApi->searchListings($apiParams);
                $listings = array_values(array_filter($result['listings'] ?? [], $matchesPair));
            }
        }

        // Transform Repliers listings to the format the frontend expects
        $formattedProperties = [];
        foreach ($listings as $listing) {
            $address = $listing['address'] ?? [];
            $details = $listing['details'] ?? [];
            $map = $listing['map'] ?? [];
            $office = $listing['office'] ?? [];
            $images = $listing['images'] ?? [];
            $condominium = $listing['condominium'] ?? [];

            $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
            if (!empty($address['unitNumber'])) {
                $fullAddress = $address['unitNumber'] . ' - ' . $fullAddress;
            }

            $imageUrls = array_map(fn($img) => $repliersApi->getImageUrl($img, 'medium'), $images);
            $mediaUrl = !empty($imageUrls) ? $imageUrls[0] : null;

            $transactionType = strtolower($listing['type'] ?? 'sale') === 'lease' ? 'For Rent' : 'For Sale';

            // "Just Listed" flag — true for active listings entered in the
            // last 7 days. Matches condos.ca's treatment where the badge
            // replaces the generic For Sale/For Rent pill for fresh stock.
            // Determined by daysOnMarket + excluding closed statuses. We
            // check lastStatus AND listDate fallback (daysOnMarket is
            // sometimes 0/missing on brand-new feeds).
            $isJustListed = false;
            $lastStatusLower = strtolower($listing['lastStatus'] ?? '');
            $isClosed = in_array($lastStatusLower, ['sld', 'sc', 'lsd', 'lc', 'exp', 'sus', 'ter', 'dft', 'cs'], true);
            $days = null;
            if (isset($listing['daysOnMarket']) && is_numeric($listing['daysOnMarket'])) {
                $days = (int) $listing['daysOnMarket'];
            } elseif (isset($listing['simpleDaysOnMarket']) && is_numeric($listing['simpleDaysOnMarket'])) {
                $days = (int) $listing['simpleDaysOnMarket'];
            } elseif (!empty($listing['listDate'])) {
                try {
                    $listedAt = new \DateTime($listing['listDate']);
                    $now = new \DateTime();
                    $days = (int) $now->diff($listedAt)->days;
                } catch (\Throwable $e) {
                    $days = null;
                }
            }
            if (!$isClosed && $days !== null && $days >= 0 && $days <= 7) {
                $isJustListed = true;
            }

            $formattedProperties[] = [
                'ListingKey' => $listing['mlsNumber'] ?? '',
                'ListPrice' => $listing['listPrice'] ?? 0,
                'UnparsedAddress' => $fullAddress,
                'BedroomsTotal' => $details['numBedrooms'] ?? 0,
                'BedroomsPlus' => $details['numBedroomsPlus'] ?? 0,
                'BathroomsTotalInteger' => ($details['numBathrooms'] ?? 0) + ($details['numBathroomsPlus'] ?? 0),
                'AboveGradeFinishedArea' => $details['sqft'] ?? 0,
                'LivingAreaRange' => $details['sqft'] ?? '',
                'ParkingTotal' => $details['numParkingSpaces'] ?? 0,
                'PropertySubType' => $details['style'] ?? $details['propertyType'] ?? '',
                'PropertyType' => $details['propertyType'] ?? 'Residential',
                'StandardStatus' => $this->mapRepliersListingStatus($listing),
                'MlsStatus' => $listing['lastStatus'] ?? '',
                'TransactionType' => $this->mapRepliersTransactionDisplay($listing, $transactionType),
                'City' => $address['city'] ?? '',
                'StateOrProvince' => $address['state'] ?? 'ON',
                'Country' => $address['country'] ?? '',
                'PostalCode' => $address['zip'] ?? '',
                'Latitude' => $map['latitude'] ?? '',
                'Longitude' => $map['longitude'] ?? '',
                'UnitNumber' => $address['unitNumber'] ?? '',
                'StreetNumber' => $address['streetNumber'] ?? '',
                'StreetName' => $address['streetName'] ?? '',
                'StreetSuffix' => $address['streetSuffix'] ?? '',
                'ListingContractDate' => $listing['listDate'] ?? '',
                'DaysOnMarket' => $listing['daysOnMarket'] ?? $listing['simpleDaysOnMarket'] ?? 0,
                'IsJustListed' => $isJustListed,
                'PublicRemarks' => $details['description'] ?? '',
                'ListOfficeName' => $office['brokerageName'] ?? '',
                'AssociationFee' => $condominium['fees']['maintenance'] ?? $details['maintenanceFee'] ?? null,
                'TaxAnnualAmount' => null,
                'MediaURL' => $mediaUrl,
                'Images' => array_map(fn($url) => ['MediaURL' => $url], $imageUrls),
                '_source' => 'repliers_api',
            ];
        }

        // Enrich each listing with the matching building (if any) so the
        // frontend can build URLs like /toronto/{building-slug}/unit-... and
        // show the "Nobu Residences in King West, Downtown, Toronto" line.
        $formattedProperties = $this->attachBuildingInfoToListings($formattedProperties);

        $totalTime = round((microtime(true) - $startTime) * 1000, 2);
        Log::info('Repliers API Search', [
            'params' => $apiParams,
            'total' => $totalCount,
            'returned' => count($formattedProperties),
            'time_ms' => $totalTime,
        ]);

        return [
            'properties' => $formattedProperties,
            'count' => $totalCount,
        ];
    }

    /**
     * Look up the matching Building (if any) for each listing by
     * streetNumber + streetName and attach a compact building payload.
     * Uses a per-call cache so each unique street is only queried once.
     */
    private function attachBuildingInfoToListings(array $properties): array
    {
        if (empty($properties)) return $properties;

        // Build the unique set of (streetNumber, streetBaseName) pairs
        $needles = [];
        foreach ($properties as $p) {
            $sn = trim((string)($p['StreetNumber'] ?? ''));
            $stName = trim((string)($p['StreetName'] ?? ''));
            if ($sn === '' || $stName === '') continue;
            $key = strtolower($sn . '|' . $stName);
            $needles[$key] = ['number' => $sn, 'name' => $stName];
        }
        if (empty($needles)) return $properties;

        // One query per unique street — cheap and predictable
        $buildingCache = [];
        foreach ($needles as $key => $n) {
            $needle = $n['number'] . ' ' . $n['name'];
            $b = \App\Models\Building::where('street_address_1', 'LIKE', $needle . '%')
                ->orWhere('street_address_2', 'LIKE', $needle . '%')
                ->orWhere('address', 'LIKE', $needle . '%')
                ->first();
            if ($b) {
                $buildingCache[$key] = [
                    'id' => $b->id,
                    'name' => $b->name,
                    'slug' => $b->slug,
                    'address' => $b->address,
                    'street_address_1' => $b->street_address_1,
                    'street_address_2' => $b->street_address_2,
                    'city' => $b->city,
                    'neighbourhood' => $b->neighbourhood,
                    'sub_neighbourhood' => $b->sub_neighbourhood,
                ];
            }
        }

        // Attach to each listing
        foreach ($properties as &$p) {
            $sn = trim((string)($p['StreetNumber'] ?? ''));
            $stName = trim((string)($p['StreetName'] ?? ''));
            if ($sn === '' || $stName === '') continue;
            $key = strtolower($sn . '|' . $stName);
            if (!empty($buildingCache[$key])) {
                $b = $buildingCache[$key];
                $nbParts = array_filter([
                    $b['sub_neighbourhood'] ?? null,
                    $b['neighbourhood'] ?? null,
                    $b['city'] ?? null,
                ]);
                $p['building'] = $b;
                $p['building_name'] = $b['name'];
                $p['buildingName'] = $b['name'];
                $p['building_neighbourhood'] = $nbParts ? implode(', ', $nbParts) : null;
                $p['buildingNeighbourhood'] = $p['building_neighbourhood'];
                $p['building_slug'] = $b['slug'];
            }
        }
        unset($p);

        return $properties;
    }

    /**
     * Map Repliers listing to readable status (Active, Sold, Leased)
     */
    private function mapRepliersListingStatus(array $listing): string
    {
        $status = strtoupper($listing['status'] ?? 'A');
        $lastStatus = strtolower($listing['lastStatus'] ?? '');

        if ($status === 'U') {
            if (in_array($lastStatus, ['sld', 'sc'])) return 'Sold';
            if (in_array($lastStatus, ['lsd', 'lc'])) return 'Leased';
            if ($lastStatus === 'exp') return 'Expired';
            return 'Off Market';
        }

        return 'Active';
    }

    /**
     * Map Repliers listing to transaction display text (For Sale, Sold, For Rent, Leased)
     */
    private function mapRepliersTransactionDisplay(array $listing, string $defaultType): string
    {
        $status = strtoupper($listing['status'] ?? 'A');
        $lastStatus = strtolower($listing['lastStatus'] ?? '');

        if ($status === 'U') {
            if (in_array($lastStatus, ['sld', 'sc'])) return 'Sold';
            if (in_array($lastStatus, ['lsd', 'lc'])) return 'Leased';
        }

        return $defaultType;
    }

    /**
     * Convert backend Property to MLS-like format for consistent handling
     */
    private function convertBackendPropertyToMlsFormat(Property $property): array
    {
        // Get images from backend
        $images = $property->images ?? [];

        // Check if images are placeholder URLs (unsplash.com) - need to fetch real images
        $hasPlaceholderImages = empty($images) || $this->hasPlaceholderImages($images);

        // If property has mls_number and has placeholder images, try to fetch real MLS images
        if ($hasPlaceholderImages && !empty($property->mls_number)) {
            $mlsImages = $this->fetchMlsImagesForProperty($property->mls_number);
            if (!empty($mlsImages)) {
                $images = $mlsImages;
            }
        }

        $mediaUrl = !empty($images) ? $images[0] : null;

        // Map transaction_type to TransactionType
        $transactionType = 'For Sale';
        if (in_array($property->transaction_type, ['rent', 'lease'])) {
            $transactionType = 'For Lease';
        }

        // Map status to StandardStatus
        $standardStatus = 'Active';
        if ($property->status === 'sold') {
            $standardStatus = 'Sold';
        } elseif (in_array($property->status, ['leased', 'rented'])) {
            $standardStatus = 'Leased';
        } elseif ($property->status === 'inactive') {
            $standardStatus = 'Off Market';
        }

        return [
            'ListingKey' => 'DB_' . $property->id,
            'ListPrice' => (float) $property->price,
            'UnparsedAddress' => $property->full_address ?? $property->address,
            'BedroomsTotal' => $property->bedrooms ?? 0,
            'BathroomsTotalInteger' => $property->bathrooms ?? 0,
            'AboveGradeFinishedArea' => $property->area ?? 0,
            'ParkingTotal' => $property->parking ?? 0,
            'PropertySubType' => $property->property_type ?? '',
            'PropertyType' => $property->property_type ?? '',
            'StandardStatus' => $standardStatus,
            'MlsStatus' => $standardStatus,
            'TransactionType' => $transactionType,
            'City' => $property->city ?? '',
            'StateOrProvince' => $property->province ?? 'ON',
            'PostalCode' => $property->postal_code ?? '',
            'Latitude' => $property->latitude ? (string) $property->latitude : '',
            'Longitude' => $property->longitude ? (string) $property->longitude : '',
            'UnitNumber' => '',
            'StreetNumber' => '',
            'StreetName' => $property->address ?? '',
            'ListingContractDate' => $property->listing_date ? $property->listing_date->format('Y-m-d') : '',
            'PublicRemarks' => $property->description ?? '',
            'ListOfficeName' => '',
            'MediaURL' => $mediaUrl,
            'Images' => array_map(function($url) {
                return ['MediaURL' => $url];
            }, $images),
            '_source' => 'backend',
            '_backend_id' => $property->id,
            '_mls_number' => $property->mls_number,
            '_backend_images' => $images,
        ];
    }

    /**
     * Check if images array contains placeholder URLs
     */
    private function hasPlaceholderImages(array $images): bool
    {
        if (empty($images)) {
            return true;
        }

        foreach ($images as $url) {
            // Check for common placeholder image sources
            if (strpos($url, 'unsplash.com') !== false ||
                strpos($url, 'placeholder') !== false ||
                strpos($url, 'picsum.photos') !== false ||
                strpos($url, 'via.placeholder') !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Fetch real MLS images for a property by MLS number
     */
    private function fetchMlsImagesForProperty(string $mlsNumber): array
    {
        try {
            // Fetch from the Repliers API
            $result = $this->repliersApi->searchListings([
                'search' => $mlsNumber,
                'resultsPerPage' => 1,
                'fields' => 'mlsNumber,images',
            ]);
            $listing = $result['listings'][0] ?? null;
            if ($listing && ($listing['mlsNumber'] ?? '') === $mlsNumber && !empty($listing['images'])) {
                return $this->repliersApi->getListingImageUrls($listing, 'medium');
            }
        } catch (Exception $e) {
            Log::warning('Failed to fetch MLS images for property', [
                'mls_number' => $mlsNumber,
                'error' => $e->getMessage()
            ]);
        }

        return [];
    }

    /**
     * Get all MLS identifiers from backend properties to exclude from MLS results
     */
    private function getBackendMlsIdentifiers(): array
    {
        $identifiers = [];

        // Get MLS numbers from Property model
        $mlsNumbers = Property::whereNotNull('mls_number')
            ->where('mls_number', '!=', '')
            ->pluck('mls_number')
            ->toArray();

        // Get addresses for matching (normalized)
        $addresses = Property::select('address', 'full_address', 'city', 'postal_code')
            ->get()
            ->map(function($p) {
                return strtolower(trim($p->address . ' ' . $p->city));
            })
            ->filter()
            ->toArray();

        return [
            'mls_numbers' => $mlsNumbers,
            'addresses' => $addresses
        ];
    }

    /**
     * Filter out MLS properties that already exist in backend database
     */
    private function filterOutBackendProperties(array $mlsProperties, array $excludeIdentifiers): array
    {
        $mlsNumbers = $excludeIdentifiers['mls_numbers'] ?? [];
        $addresses = $excludeIdentifiers['addresses'] ?? [];

        return array_filter($mlsProperties, function($property) use ($mlsNumbers, $addresses) {
            // Check by MLS number/ListingKey
            $listingKey = $property['ListingKey'] ?? '';
            if (in_array($listingKey, $mlsNumbers)) {
                return false;
            }

            // Check by address (normalized comparison)
            $propertyAddress = strtolower(trim(
                ($property['UnparsedAddress'] ?? '') . ' ' .
                ($property['City'] ?? '')
            ));

            foreach ($addresses as $backendAddress) {
                // Use similarity check for addresses
                if (!empty($backendAddress) && !empty($propertyAddress)) {
                    similar_text($backendAddress, $propertyAddress, $percent);
                    if ($percent > 85) {
                        return false;
                    }
                }
            }

            // Mark as MLS source
            $property['_source'] = 'mls';
            return true;
        });
    }

    /**
     * Search properties based on map viewport bounds
     * Priority: 1. Backend database properties first, 2. MLS properties (excluding those already in DB)
     */
    public function searchByViewport(Request $request)
    {
        try {
            // Clean any existing output
            $this->cleanOutputBuffer();

            // Get and sanitize search parameters
            $searchParams = $request->input('search_params', []);

            // Extract viewport bounds BEFORE sanitization (since sanitizeSearchParams removes it)
            $viewportBounds = $searchParams['viewport_bounds'] ?? null;

            // Sanitize search parameters
            $sanitizedParams = $this->sanitizeSearchParams($searchParams);

            if (!$viewportBounds || !isset($viewportBounds['north']) || !isset($viewportBounds['south']) ||
                !isset($viewportBounds['east']) || !isset($viewportBounds['west'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid viewport bounds provided'
                ], 400);
            }

            // Set page size to 16 for map searches as requested
            $sanitizedParams['page_size'] = 16;

            // Step 1: Fetch backend properties within viewport bounds
            $backendResult = $this->fetchBackendPropertiesInViewport($sanitizedParams, $viewportBounds);
            $backendProperties = $backendResult['properties'];
            $backendCount = count($backendProperties);

            Log::info('Backend properties in viewport', [
                'count' => $backendCount
            ]);

            // Get MLS IDs from backend to exclude from MLS results
            $excludeMlsIds = $this->getBackendMlsIdentifiers();

            // Step 2: Fetch MLS listings within the viewport from the Repliers API
            $apiParams = $sanitizedParams;
            $apiParams['viewport_bounds'] = $viewportBounds;
            $apiParams['page_size'] = 100;
            $apiResult = $this->fetchPropertiesFromRepliersAPI($apiParams);
            $allMlsProperties = $apiResult['properties'];
            $mlsTotalCount = $apiResult['count'];

            // Filter out MLS properties that exist in backend database
            $mlsProperties = $this->filterOutBackendProperties($allMlsProperties, $excludeMlsIds);

            Log::info('Viewport API fetch result', [
                'mls_original_count' => count($allMlsProperties),
                'mls_filtered_count' => count($mlsProperties),
                'total_count' => $mlsTotalCount
            ]);

            // Merge backend and MLS properties (backend first)
            $combinedProperties = array_merge($backendProperties, $mlsProperties);
            $totalCount = $backendCount + max(0, $mlsTotalCount - count($excludeMlsIds['mls_numbers'] ?? []));

            if (empty($combinedProperties)) {
                Log::info('No properties found in viewport area');
                return response()->json([
                    'success' => true,
                    'data' => [
                        'properties' => [],
                        'total' => 0,
                        'viewport_bounds' => $viewportBounds,
                        'message' => 'No properties found in this area'
                    ]
                ]);
            }

            // Re-index array
            $combinedProperties = array_values($combinedProperties);

            Log::info('Combined properties in viewport', [
                'backend_count' => $backendCount,
                'mls_count' => count($mlsProperties),
                'total_combined' => count($combinedProperties)
            ]);

            // Repliers listings already include CDN image URLs and backend
            // properties carry their own images — format directly.
            $formattedProperties = $this->formatProperties($combinedProperties);

            return response()->json([
                'success' => true,
                'data' => [
                    'properties' => $formattedProperties,
                    'total' => $totalCount,
                    'displayed' => count($formattedProperties),
                    'viewport_bounds' => $viewportBounds,
                    'has_more' => $totalCount > count($formattedProperties),
                    'backend_count' => $backendCount,
                    'mls_count' => count($mlsProperties)
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Viewport property search error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Viewport search failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch backend properties within viewport bounds
     */
    private function fetchBackendPropertiesInViewport(array $params, array $viewportBounds): array
    {
        $query = Property::query()->with('building');

        // Apply status/transaction type filter
        $status = $params['status'] ?? 'For Sale';
        $propertyStatus = $params['property_status'] ?? '';

        if (!empty($propertyStatus)) {
            if (strtolower($propertyStatus) === 'sold') {
                $query->where('status', 'sold');
            } elseif (strtolower($propertyStatus) === 'leased') {
                $query->whereIn('status', ['leased', 'rented']);
            }
        } else {
            $query->where('status', 'active');

            if ($status === 'For Sale') {
                $query->where('transaction_type', 'sale');
            } elseif (in_array($status, ['For Lease', 'For Rent'])) {
                $query->whereIn('transaction_type', ['rent', 'lease']);
            }
        }

        // Filter by viewport bounds (lat/lng)
        $query->whereNotNull('latitude')
              ->whereNotNull('longitude')
              ->where('latitude', '>=', $viewportBounds['south'])
              ->where('latitude', '<=', $viewportBounds['north'])
              ->where('longitude', '>=', $viewportBounds['west'])
              ->where('longitude', '<=', $viewportBounds['east']);

        // Apply property type filter
        if (!empty($params['property_type']) && count($params['property_type']) > 0) {
            $query->whereIn('property_type', $params['property_type']);
        }

        // Apply price range filter
        if ($params['price_min'] > 0) {
            $query->where('price', '>=', $params['price_min']);
        }
        if ($params['price_max'] > 0 && $params['price_max'] < 10000000) {
            $query->where('price', '<=', $params['price_max']);
        }

        // Apply bedroom filter
        if ($params['bedrooms'] > 0) {
            $query->where('bedrooms', '>=', $params['bedrooms']);
        }

        // Apply bathroom filter
        if ($params['bathrooms'] > 0) {
            $query->where('bathrooms', '>=', $params['bathrooms']);
        }

        $properties = $query->get();

        // Convert to MLS-like format for consistency
        $formattedProperties = $properties->map(function ($property) {
            return $this->convertBackendPropertyToMlsFormat($property);
        })->toArray();

        return [
            'properties' => $formattedProperties,
            'count' => count($formattedProperties)
        ];
    }

    /**
     * Apply viewport bounds filter to the API query
     */
    private function applyViewportBoundsFilter($bounds)
    {
        // We can't filter by Latitude/Longitude directly in the API
        // Instead, we'll fetch properties from the general area and filter after
        
        // Try to determine the city/area from the viewport center
        $centerLat = ($bounds['north'] + $bounds['south']) / 2;
        $centerLng = ($bounds['east'] + $bounds['west']) / 2;
        
        // Determine rough area based on coordinates
        $city = $this->getCityFromCoordinates($centerLat, $centerLng);
        
        // City filter is now handled in database query layer
        if ($city) {
            Log::info('Viewport city filter (for reference)', ['city' => $city]);
        }
        
        // Log the viewport being searched
        Log::info('Searching viewport bounds', [
            'north' => $bounds['north'],
            'south' => $bounds['south'],
            'east' => $bounds['east'],
            'west' => $bounds['west'],
            'center_city' => $city
        ]);
    }
    
    /**
     * Get approximate city from coordinates
     */
    private function getCityFromCoordinates($lat, $lng)
    {
        // Log the coordinates we're checking
        Log::info('Getting city from coordinates', ['lat' => $lat, 'lng' => $lng]);
        
        // Greater Toronto Area cities with approximate boundaries
        $cities = [
            'Toronto' => ['lat_min' => 43.5, 'lat_max' => 43.9, 'lng_min' => -79.7, 'lng_max' => -79.1],
            'Mississauga' => ['lat_min' => 43.5, 'lat_max' => 43.7, 'lng_min' => -79.8, 'lng_max' => -79.5],
            'Brampton' => ['lat_min' => 43.6, 'lat_max' => 43.8, 'lng_min' => -80.0, 'lng_max' => -79.6],
            'Markham' => ['lat_min' => 43.8, 'lat_max' => 44.0, 'lng_min' => -79.4, 'lng_max' => -79.2],
            'Vaughan' => ['lat_min' => 43.7, 'lat_max' => 43.9, 'lng_min' => -79.6, 'lng_max' => -79.4],
            'Richmond Hill' => ['lat_min' => 43.8, 'lat_max' => 44.0, 'lng_min' => -79.5, 'lng_max' => -79.3],
            'Oakville' => ['lat_min' => 43.4, 'lat_max' => 43.5, 'lng_min' => -79.7, 'lng_max' => -79.6],
            'Burlington' => ['lat_min' => 43.3, 'lat_max' => 43.4, 'lng_min' => -79.9, 'lng_max' => -79.7],
            'Hamilton' => ['lat_min' => 43.2, 'lat_max' => 43.3, 'lng_min' => -80.0, 'lng_max' => -79.7],
            'Pickering' => ['lat_min' => 43.8, 'lat_max' => 44.0, 'lng_min' => -79.2, 'lng_max' => -78.9],
            'Ajax' => ['lat_min' => 43.8, 'lat_max' => 43.9, 'lng_min' => -79.1, 'lng_max' => -78.9],
            'Whitby' => ['lat_min' => 43.8, 'lat_max' => 44.0, 'lng_min' => -78.9, 'lng_max' => -78.8],
            'Oshawa' => ['lat_min' => 43.8, 'lat_max' => 44.0, 'lng_min' => -78.9, 'lng_max' => -78.8]
        ];
        
        foreach ($cities as $city => $bounds) {
            if ($lat >= $bounds['lat_min'] && $lat <= $bounds['lat_max'] &&
                $lng >= $bounds['lng_min'] && $lng <= $bounds['lng_max']) {
                Log::info('Matched city: ' . $city);
                return $city;
            }
        }
        
        // Default to Toronto if no specific city matched
        Log::info('No city matched, defaulting to Toronto');
        return 'Toronto';
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
        // No-op: API search is now handled via Repliers searchListings() with params
        // This method is kept for backward compatibility with viewport search
    }

    /**
     * Apply location filter for property type search
     */
    private function applyLocationFilter($query)
    {
        // Just call the global search filter
        $this->applyGlobalSearchFilter($query);
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
        $hasPropertyStatus = !empty($params['property_status']); // New check for Sold/Leased
        $hasPage = isset($params['page']) && $params['page'] > 1;
        
        // If ANY search parameter is explicitly set, treat it as user search
        // This includes empty property_type array which means "All Types"
        $hasUserCriteria = $hasQuery || $hasPropertyType || $hasMinPrice || $hasMaxPrice || 
                          $hasBedrooms || $hasBathrooms || $hasNonDefaultStatus || $hasPropertyStatus || $hasPage;
        
        return $hasUserCriteria;
    }

    /**
     * Apply default filters for initial page load
     */
    private function applyDefaultFilters()
    {
        // No-op: Search now uses database. Repliers API filters are applied
        // directly via searchListings() params when API calls are needed.
    }

    /**
     * Apply user-specified filters
     */
    private function applyUserFilters(array $params)
    {
        // No-op: Search now uses database queries exclusively.
        // Repliers API filters are applied via searchListings() params when needed.
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
                
                // Filter applied via database queries, not API
                Log::info('Address search filter (for reference)', ['filter' => $searchFilter]);
                return;
            }
        }
        
        // Fallback to original search for simple queries
        // Check if this is a neighborhood search (not a postal code and not a full address)
        // Allow multi-word neighborhoods like "Bay St. Corridor" or "Yonge and Eglinton"
        $isNeighborhood = !preg_match('/[A-Z]\d[A-Z]/i', $escapedQuery) && str_word_count($escapedQuery) <= 5;

        if ($isNeighborhood) {
            // For neighborhoods, search more broadly in Toronto area
            // Many Toronto neighborhoods don't have the neighborhood name in the address fields
            $knownNeighborhoods = [
                'yorkville' => 'Toronto',
                'the annex' => 'Toronto',
                'rosedale' => 'Toronto',
                'forest hill' => 'Toronto',
                'king west' => 'Toronto',
                'bay st. corridor' => 'Toronto',
                'entertainment district' => 'Toronto',
                'financial district' => 'Toronto',
                'liberty village' => 'Toronto',
                'cityplace' => 'Toronto',
                'mimico' => 'Toronto',
                'the waterfront' => 'Toronto',
                'st. lawrence' => 'Toronto',
                'distillery district' => 'Toronto',
                'regent park' => 'Toronto',
                'corktown' => 'Toronto',
                'church st. corridor' => 'Toronto',
                'yonge and bloor' => 'Toronto',
                'mount pleasant west' => 'Toronto',
                'willowdale east' => 'Toronto',
                'davisville' => 'Toronto',
                'yonge and eglinton' => 'Toronto',
                'lawrence park' => 'Toronto',
                'leaside' => 'Toronto',
                'sheppard and yonge' => 'Toronto',
                'bayview village' => 'Toronto',
                'don mills' => 'Toronto',
                'york mills' => 'Toronto',
                'humber bay' => 'Toronto',
                'islington village' => 'Toronto',
                'royal york' => 'Toronto',
                'the kingsway' => 'Toronto',
                'scarborough town centre' => 'Toronto',
                'birch cliff' => 'Toronto',
                'cliffside' => 'Toronto',
                'guildwood' => 'Toronto',
                'leslieville' => 'Toronto',
                'beaches' => 'Toronto',
                'the beach' => 'Toronto',
                'etobicoke' => 'Toronto',
                'scarborough' => 'Toronto',
                'north york' => 'Toronto',
                'mississauga' => 'Mississauga',
                'oakville' => 'Oakville',
                'burlington' => 'Burlington',
                'richmond hill' => 'Richmond Hill',
                'vaughan' => 'Vaughan',
                'markham' => 'Markham',
                'aurora' => 'Aurora',
                'pickering' => 'Pickering',
                'ajax' => 'Ajax',
                'brampton' => 'Brampton',
                'milton' => 'Milton',
                'caledon' => 'Caledon',
                'whitby' => 'Whitby',
                'oshawa' => 'Oshawa'
            ];

            $lowerQuery = strtolower($escapedQuery);
            if (isset($knownNeighborhoods[$lowerQuery])) {
                // Search in the city where this neighborhood is located
                $city = $knownNeighborhoods[$lowerQuery];

                // Log for debugging
                \Log::info('Neighborhood search detected', [
                    'query' => $escapedQuery,
                    'city' => $city,
                    'neighborhood' => $lowerQuery,
                    'search_type' => 'neighborhood'
                ]);

                // Try to find properties with the neighborhood name in available fields
                // Only use fields that exist in Repliers API
                $searchFilter = "(contains(UnparsedAddress, '" . $escapedQuery . "') " .
                               "or contains(StreetName, '" . $escapedQuery . "'))";

                // Neighborhood-specific search logic
                switch ($lowerQuery) {
                    case 'yorkville':
                        // Yorkville postal codes (M4Y, M5R, parts of M4W)
                        $postalCodes = ['M4Y', 'M5R', 'M4W'];
                        $streets = ['Cumberland', 'Yorkville', 'Hazelton', 'Scollard', 'Bellair'];
                        break;
                    case 'bay st. corridor':
                        // Bay Street Corridor postal codes
                        $postalCodes = ['M5G', 'M5S', 'M5R'];
                        $streets = ['Bay', 'Charles', 'St Joseph', 'St Mary', 'Irwin'];
                        break;
                    case 'entertainment district':
                        // Entertainment District postal codes
                        $postalCodes = ['M5V', 'M5J'];
                        $streets = ['King', 'Peter', 'John', 'Duncan', 'Adelaide'];
                        break;
                    case 'financial district':
                        // Financial District postal codes
                        $postalCodes = ['M5H', 'M5J', 'M5X'];
                        $streets = ['Bay', 'York', 'Wellington', 'Front', 'Richmond'];
                        break;
                    case 'cityplace':
                        // CityPlace postal codes
                        $postalCodes = ['M5V'];
                        $streets = ['Spadina', 'Bremner', 'Fort York', 'Dan Leckie', 'Canoe'];
                        break;
                    case 'mimico':
                        // Mimico postal codes
                        $postalCodes = ['M8V'];
                        $streets = ['Lake Shore', 'Park Lawn', 'Marine Parade', 'Grand', 'Superior'];
                        break;
                    case 'the waterfront':
                        // Waterfront postal codes
                        $postalCodes = ['M5V', 'M5J', 'M5A'];
                        $streets = ['Queens Quay', 'Lake Shore', 'Harbour', 'York', 'Yonge'];
                        break;
                    case 'st. lawrence':
                        // St. Lawrence postal codes
                        $postalCodes = ['M5A', 'M5E'];
                        $streets = ['Front', 'King', 'Market', 'Jarvis', 'The Esplanade'];
                        break;
                    case 'regent park':
                        // Regent Park postal codes
                        $postalCodes = ['M5A'];
                        $streets = ['Dundas', 'River', 'Oak', 'Sackville', 'Regent'];
                        break;
                    case 'church st. corridor':
                        // Church Street Corridor postal codes
                        $postalCodes = ['M4Y', 'M5B'];
                        $streets = ['Church', 'Wellesley', 'Carlton', 'McGill', 'Alexander'];
                        break;
                    case 'yonge and bloor':
                        // Yonge and Bloor postal codes
                        $postalCodes = ['M4W', 'M4Y', 'M5R'];
                        $streets = ['Yonge', 'Bloor', 'Cumberland', 'Bay', 'Charles'];
                        break;
                    case 'mount pleasant west':
                        // Mount Pleasant West postal codes
                        $postalCodes = ['M4S', 'M4P'];
                        $streets = ['Mount Pleasant', 'Eglinton', 'Davisville', 'Soudan', 'Manor'];
                        break;
                    case 'willowdale east':
                        // Willowdale East postal codes
                        $postalCodes = ['M2N', 'M2M'];
                        $streets = ['Yonge', 'Sheppard', 'Finch', 'Empress', 'Byng'];
                        break;
                    case 'davisville':
                        // Davisville postal codes
                        $postalCodes = ['M4S', 'M4P'];
                        $streets = ['Davisville', 'Mount Pleasant', 'Bayview', 'Cleveland', 'Millwood'];
                        break;
                    case 'yonge and eglinton':
                        // Yonge and Eglinton postal codes
                        $postalCodes = ['M4P', 'M4S'];
                        $streets = ['Yonge', 'Eglinton', 'Broadway', 'Roehampton', 'Redpath'];
                        break;
                    case 'lawrence park':
                        // Lawrence Park postal codes
                        $postalCodes = ['M4N', 'M5P'];
                        $streets = ['Lawrence', 'Mount Pleasant', 'Bayview', 'Yonge', 'St Clements'];
                        break;
                    case 'leaside':
                        // Leaside postal codes
                        $postalCodes = ['M4G', 'M4H'];
                        $streets = ['Bayview', 'Laird', 'Eglinton', 'McRae', 'Sutherland'];
                        break;
                    case 'sheppard and yonge':
                        // Sheppard and Yonge postal codes
                        $postalCodes = ['M2N', 'M2P'];
                        $streets = ['Sheppard', 'Yonge'];
                        break;
                    case 'bayview village':
                        // Bayview Village postal codes
                        $postalCodes = ['M2K', 'M2L'];
                        $streets = ['Bayview', 'Sheppard'];
                        break;
                    case 'don mills':
                        // Don Mills postal codes
                        $postalCodes = ['M3B', 'M3C'];
                        $streets = ['Don Mills', 'Lawrence', 'Eglinton'];
                        break;
                    case 'york mills':
                        // York Mills postal codes
                        $postalCodes = ['M2P', 'M2L'];
                        $streets = ['York Mills', 'Bayview', 'Leslie'];
                        break;
                    case 'humber bay':
                        // Humber Bay postal codes
                        $postalCodes = ['M8V', 'M8W'];
                        $streets = ['Lake Shore', 'Park Lawn', 'Marine Parade'];
                        break;
                    case 'islington village':
                        // Islington Village postal codes
                        $postalCodes = ['M9A'];
                        $streets = ['Islington', 'Bloor', 'Dundas'];
                        break;
                    case 'royal york':
                        // Royal York postal codes
                        $postalCodes = ['M8Y', 'M8Z'];
                        $streets = ['Royal York', 'The Kingsway', 'Bloor'];
                        break;
                    case 'the kingsway':
                        // The Kingsway postal codes
                        $postalCodes = ['M8X', 'M9A'];
                        $streets = ['The Kingsway', 'Bloor', 'Royal York'];
                        break;
                    case 'scarborough town centre':
                        // Scarborough Town Centre postal codes
                        $postalCodes = ['M1P', 'M1W'];
                        $streets = ['McCowan', 'Ellesmere', 'Borough', 'Progress'];
                        break;
                    case 'birch cliff':
                        // Birch Cliff postal codes
                        $postalCodes = ['M1M', 'M1N'];
                        $streets = ['Kingston', 'Birch Cliff', 'Warden'];
                        break;
                    case 'cliffside':
                        // Cliffside postal codes
                        $postalCodes = ['M1M'];
                        $streets = ['Kingston', 'Bellamy', 'Scarborough Golf Club'];
                        break;
                    case 'guildwood':
                        // Guildwood postal codes
                        $postalCodes = ['M1E'];
                        $streets = ['Guildwood', 'Kingston', 'Morningside'];
                        break;

                    case 'the annex':
                        // The Annex postal codes (M5R, M5S)
                        $postalCodes = ['M5R', 'M5S'];
                        $streets = ['Bloor', 'Spadina', 'Bathurst', 'Madison', 'Walmer', 'Brunswick'];
                        break;

                    case 'rosedale':
                        // Rosedale postal codes (M4W, M4X)
                        $postalCodes = ['M4W', 'M4X', 'M5A'];
                        $streets = ['Park', 'Rosedale', 'Glen', 'Crescent', 'Chestnut Park'];
                        break;

                    case 'forest hill':
                        // Forest Hill postal codes (M4V, M5N, M5P)
                        $postalCodes = ['M4V', 'M5N', 'M5P'];
                        $streets = ['Spadina Road', 'Forest Hill', 'Russell Hill', 'Old Forest Hill', 'Lonsdale'];
                        break;

                    case 'king west':
                        // King West postal codes (M5V, M5H)
                        $postalCodes = ['M5V', 'M5H', 'M5X'];
                        $streets = ['King', 'Wellington', 'Front', 'Portland', 'Spadina'];
                        break;

                    case 'liberty village':
                        // Liberty Village postal codes (M6K)
                        $postalCodes = ['M6K'];
                        $streets = ['Liberty', 'Strachan', 'East Liberty', 'Hanna', 'Atlantic'];
                        break;

                    case 'distillery district':
                        // Distillery District postal codes (M5A)
                        $postalCodes = ['M5A'];
                        $streets = ['Mill', 'Trinity', 'Distillery', 'Gristmill', 'Tank House'];
                        break;

                    case 'etobicoke':
                        // Major Etobicoke areas
                        $postalCodes = ['M8V', 'M8W', 'M8X', 'M8Y', 'M8Z', 'M9A', 'M9B', 'M9C', 'M9P', 'M9R', 'M9V', 'M9W'];
                        $streets = null; // Too large, search by postal codes and city
                        break;

                    case 'scarborough':
                        // Major Scarborough areas
                        $postalCodes = ['M1B', 'M1C', 'M1E', 'M1G', 'M1H', 'M1J', 'M1K', 'M1L', 'M1M', 'M1N', 'M1P', 'M1R', 'M1S', 'M1T', 'M1V', 'M1W', 'M1X'];
                        $streets = null; // Too large, search by postal codes and city
                        break;

                    case 'north york':
                        // Major North York areas
                        $postalCodes = ['M2H', 'M2J', 'M2K', 'M2L', 'M2M', 'M2N', 'M2P', 'M2R', 'M3A', 'M3B', 'M3C', 'M3H', 'M3J', 'M3K', 'M3L', 'M3M', 'M3N', 'M4A', 'M5M', 'M6A', 'M6B', 'M6L', 'M9L', 'M9M'];
                        $streets = null; // Too large, search by postal codes and city
                        break;

                    default:
                        // For cities like Mississauga, Oakville, etc., just search by city name
                        $postalCodes = null;
                        $streets = null;
                        break;
                }

                // Build the search filter based on available data
                if (!empty($postalCodes) || !empty($streets)) {
                    $filters = [];

                    // Add postal code filters
                    if (!empty($postalCodes)) {
                        $postalFilters = [];
                        foreach ($postalCodes as $postal) {
                            $postalFilters[] = "contains(PostalCode, '" . $postal . "')";
                        }
                        $filters[] = "(" . implode(' or ', $postalFilters) . ")";
                    }

                    // Add street filters
                    if (!empty($streets)) {
                        $streetFilters = [];
                        foreach ($streets as $street) {
                            $streetFilters[] = "contains(StreetName, '" . $street . "')";
                        }
                        $filters[] = "(" . implode(' or ', $streetFilters) . ")";
                    }

                    // Combine filters with OR and limit to city
                    $searchFilter = "(" . implode(' or ', $filters) . ") and contains(City, '" . $city . "')";

                    // Log the final search filter for debugging
                    \Log::info('Neighborhood search filter built', [
                        'neighborhood' => $lowerQuery,
                        'postal_codes' => $postalCodes ?? [],
                        'streets' => $streets ?? [],
                        'filter' => $searchFilter
                    ]);
                } else {
                    // For regular cities or unknown neighborhoods
                    $searchFilter = "contains(City, '" . $city . "')";
                }
            } else {
                // For unknown neighborhoods, search in available fields
                $searchFilter = "(contains(UnparsedAddress, '" . $escapedQuery . "') " .
                               "or contains(City, '" . $escapedQuery . "') " .
                               "or contains(StreetName, '" . $escapedQuery . "'))";
            }
        } else {
            // Enhanced search for addresses and other queries
            $searchFilter = "(contains(UnparsedAddress, '" . $escapedQuery . "') " .
                           "or contains(City, '" . $escapedQuery . "') " .
                           "or contains(PostalCode, '" . $escapedQuery . "') " .
                           "or contains(StreetName, '" . $escapedQuery . "'))";
        }

        // Debug logging for search filter
        \Log::info('Applied search filter:', [
            'query' => $escapedQuery,
            'filter' => $searchFilter,
            'isNeighborhood' => $isNeighborhood ?? false
        ]);

        // Search filter is applied in database queries, not via API
        Log::info('Search filter (for reference)', ['filter' => $searchFilter]);
    }

    /**
     * Apply sort order - no-op, sorting handled by database queries
     */
    private function applySortOrder($sortType)
    {
        // Sorting is now handled in the database query layer
        // This method is kept for backward compatibility
        return;
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
                'MlsStatus' => $property['MlsStatus'] ?? '',
                'TransactionType' => $property['TransactionType'] ?? '',
                'City' => $property['City'] ?? '',
                'StateOrProvince' => $property['StateOrProvince'] ?? '',
                'Country' => $property['Country'] ?? '',
                'PostalCode' => $property['PostalCode'] ?? '',
                'Latitude' => $property['Latitude'] ?? '',
                'Longitude' => $property['Longitude'] ?? '',

                // Address components for card formatting
                'UnitNumber' => $property['UnitNumber'] ?? '',
                'StreetNumber' => $property['StreetNumber'] ?? '',
                'StreetName' => $property['StreetName'] ?? '',
                'StreetSuffix' => $property['StreetSuffix'] ?? '',
                'StreetDirSuffix' => $property['StreetDirSuffix'] ?? '',

                // Additional fields for display
                'LivingAreaRange' => $property['LivingAreaRange'] ?? '',
                'LivingArea' => $property['LivingArea'] ?? '',
                'ParkingSpaces' => $property['ParkingSpaces'] ?? 0,
                'ListOfficeName' => $property['ListOfficeName'] ?? '',

                // Additional fields
                'ListingContractDate' => $property['ListingContractDate'] ?? '',
                'DaysOnMarket' => $this->calculateDaysOnMarket($property['ListingContractDate'] ?? ''),
                'OpenHouseDate' => $property['OpenHouseDate'] ?? '',
                'MediaURL' => $property['MediaURL'] ?? null,
                'Images' => $property['Images'] ?? [],
                'formatted_status' => $this->formatStatusDisplay(
                    $property['TransactionType'] ?? '',
                    $property['StandardStatus'] ?? 'Active',
                    $property['MlsStatus'] ?? ''
                ),
                'has_open_house' => $this->hasOpenHouse($property),

                // Source tracking - to identify if property is from backend or MLS
                '_source' => $property['_source'] ?? 'mls',
                '_backend_id' => $property['_backend_id'] ?? null,
                '_mls_number' => $property['_mls_number'] ?? null,
                // Debug: data source (mls_database or mls_api)
                'data_source' => $property['data_source'] ?? 'unknown',
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
    private function formatStatusDisplay($transactionType, $standardStatus = '', $mlsStatus = '')
    {
        // First check MlsStatus if available (some MLS systems use this for Sold/Leased)
        if (!empty($mlsStatus)) {
            $mlsStatusLower = strtolower($mlsStatus);
            switch ($mlsStatusLower) {
                case 'sold':
                    return 'Sold';
                case 'leased':
                case 'rented':
                case 'lease':
                    return 'Leased';
            }
        }
        
        // Then check StandardStatus
        if (!empty($standardStatus)) {
            $standardStatusLower = strtolower($standardStatus);
            switch ($standardStatus) {
                case 'Sold':
                    return 'Sold';
                case 'Leased':
                case 'Rented':
                case 'Lease':
                    return 'Leased';
                case 'Pending':
                    return 'Pending';
                case 'Closed':
                    // Closed can mean Sold or Leased depending on TransactionType
                    if ($transactionType === 'For Lease' || $transactionType === 'For Rent') {
                        return 'Leased';
                    }
                    return 'Sold';
                case 'Off Market':
                    // Off Market with For Lease transaction type means Leased
                    if ($transactionType === 'For Lease' || $transactionType === 'For Rent') {
                        return 'Leased';
                    }
                    return 'Off Market';
                case 'Active':
                    // For active listings, determine based on transaction type
                    if ($transactionType === 'For Lease' || $transactionType === 'For Rent') {
                        return 'For Rent';
                    }
                    return 'For Sale';
            }
        }
        
        // Fall back to transaction type
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
        
        // Default
        return ucfirst(strtolower($standardStatus));
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
            'page_size' => 16,
            'query' => '',
            'status' => 'For Sale',
            'property_status' => '', // New parameter for Sold/Leased
            'property_type' => [],
            'price_min' => 0,
            'price_max' => 10000000, // Default max price of 10 million
            'bedrooms' => 0,
            'bathrooms' => 0,
            'sort' => 'newest',
            'building_id' => '', // Building ID for multi-address building searches
            'street_addresses' => '', // Comma-separated addresses, e.g. "15 Mercer St,35 Mercer"
            'viewport_bounds' => null,
            'days_on_market' => '',
            'keywords' => '',
            'home_types' => [],
            'amenities' => [],
            'locker' => '',
            'balcony' => '',
            'den' => false,
        ];
        
        if (!is_array($params)) {
            return $defaults;
        }
        
        // Preserve viewport_bounds if present (needed for polygon/map search)
        $viewportBounds = $params['viewport_bounds'] ?? null;

        $sanitized = array_merge($defaults, $params);

        // Restore viewport_bounds after merge
        $sanitized['viewport_bounds'] = $viewportBounds;

        // Map listing_type to status if provided (frontend sends 'sale'/'rent', backend expects 'For Sale'/'For Rent')
        if (isset($params['listing_type'])) {
            $listingType = strtolower($params['listing_type']);
            if ($listingType === 'sale') {
                $sanitized['status'] = 'For Sale';
            } elseif (in_array($listingType, ['rent', 'lease'])) {
                $sanitized['status'] = 'For Rent';
            }
        }

        // Sanitize numeric values
        $sanitized['page'] = max(1, (int)$sanitized['page']);
        $sanitized['page_size'] = max(1, min(50, (int)$sanitized['page_size']));
        $sanitized['price_min'] = (int)$sanitized['price_min'];
        $sanitized['price_max'] = (int)$sanitized['price_max'];
        $sanitized['bedrooms'] = (int)$sanitized['bedrooms'];
        $sanitized['bathrooms'] = (int)$sanitized['bathrooms'];

        // Sanitize string values
        $sanitized['status'] = htmlspecialchars($sanitized['status']);
        $sanitized['property_status'] = htmlspecialchars($sanitized['property_status'] ?? '');
        $sanitized['query'] = htmlspecialchars($sanitized['query']);
        $sanitized['sort'] = htmlspecialchars($sanitized['sort']);
        $sanitized['building_id'] = htmlspecialchars($sanitized['building_id'] ?? '');
        
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

    /**
     * Get address suggestions from MLS database for autocomplete
     * Uses FULLTEXT index for fast search performance
     */
    /**
     * Suggestions for the /price-history search input.
     * Like getAddressSuggestions but returns the listingKey for each match
     * so the UI can route directly to /price-history/{listingKey}.
     * Matches by MLS number prefix (when the query starts with a letter+digits)
     * or by address full-text.
     */
    public function getPriceHistorySuggestions(Request $request)
    {
        try {
            $query = trim($request->input('q', ''));
            $limit = min((int) $request->input('limit', 8), 20);

            if (strlen($query) < 2) {
                return response()->json(['suggestions' => []]);
            }

            $repliersApi = app(\App\Services\RepliersApiService::class);

            // MLS-number-like query ("C1234567") — exact lookup (include
            // unavailable listings, since price history covers sold/leased).
            $apiParams = [
                'resultsPerPage' => $limit,
                'fields' => 'mlsNumber,address,images[1]',
            ];
            if (preg_match('/^[A-Za-z]\d+$/', $query)) {
                $apiParams['mlsNumber'] = strtoupper($query);
                $apiParams['status'] = ['A', 'U'];
            } else {
                $apiParams['search'] = $query;
                $apiParams['status'] = 'A';
            }

            $result = $repliersApi->searchListings($apiParams);

            $suggestions = [];
            foreach ($result['listings'] ?? [] as $listing) {
                $mlsNumber = $listing['mlsNumber'] ?? null;
                if (!$mlsNumber) {
                    continue;
                }
                $address = $listing['address'] ?? [];
                $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
                if (!empty($address['unitNumber'])) {
                    $fullAddress = $address['unitNumber'] . ' - ' . $fullAddress;
                }
                $images = $listing['images'] ?? [];
                $suggestions[] = [
                    'listingKey' => $mlsNumber,
                    'address' => $fullAddress,
                    'city' => $address['city'] ?? '',
                    'province' => $address['state'] ?? 'ON',
                    'postalCode' => $address['zip'] ?? '',
                    'image' => !empty($images) ? $repliersApi->getImageUrl($images[0], 'small') : null,
                    'href' => '/price-history/' . $mlsNumber,
                ];
            }

            return response()->json(['suggestions' => $suggestions]);
        } catch (Exception $e) {
            Log::error('Price history suggestions error: ' . $e->getMessage());
            return response()->json(['suggestions' => [], 'error' => $e->getMessage()], 500);
        }
    }

    public function getAddressSuggestions(Request $request)
    {
        try {
            $query = $request->input('q', '');
            $limit = min((int) $request->input('limit', 8), 20);

            if (strlen($query) < 2) {
                return response()->json(['suggestions' => []]);
            }

            $searchQuery = trim($query);

            $repliersApi = app(\App\Services\RepliersApiService::class);
            $result = $repliersApi->searchListings([
                'search' => $searchQuery,
                'status' => 'A',
                'resultsPerPage' => $limit * 3,
                'fields' => 'address',
            ]);

            $suggestions = [];
            $seen = [];
            foreach ($result['listings'] ?? [] as $listing) {
                $address = $listing['address'] ?? [];
                $mainText = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
                if ($mainText === '') {
                    continue;
                }
                $city = $address['city'] ?? '';
                $key = strtolower($mainText . '|' . $city);
                if (isset($seen[$key])) {
                    continue;
                }
                $seen[$key] = true;

                $secondaryText = implode(', ', array_filter([
                    $city,
                    $address['state'] ?? 'ON',
                    $address['zip'] ?? '',
                ]));

                $suggestions[] = [
                    'main_text' => $mainText,
                    'secondary_text' => $secondaryText,
                    'description' => $mainText . ', ' . $secondaryText,
                    'address' => $mainText,
                    'city' => $city,
                    'postal_code' => $address['zip'] ?? '',
                    'display' => $mainText . ', ' . $city,
                ];

                if (count($suggestions) >= $limit) {
                    break;
                }
            }

            return response()->json(['suggestions' => $suggestions]);

        } catch (Exception $e) {
            Log::error('Address suggestions error: ' . $e->getMessage());
            return response()->json(['suggestions' => [], 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get city suggestions from the Repliers API city aggregates.
     * Returns distinct cities that match the search query.
     */
    public function getCitySuggestions(Request $request)
    {
        try {
            $query = $request->input('q', '');
            $limit = min((int) $request->input('limit', 10), 20);

            if (strlen($query) < 2) {
                return response()->json(['suggestions' => []]);
            }

            $searchQuery = strtolower(trim($query));

            $repliersApi = app(\App\Services\RepliersApiService::class);
            $result = $repliersApi->searchListings([
                'status' => 'A',
                'aggregates' => 'address.city',
                'listings' => 'false',
                'resultsPerPage' => 1,
            ]);

            $cityCounts = $result['aggregates']['address']['city'] ?? [];

            $matches = [];
            foreach ($cityCounts as $city => $count) {
                if (str_starts_with(strtolower((string) $city), $searchQuery)) {
                    $matches[] = ['city' => (string) $city, 'count' => (int) $count];
                }
            }

            usort($matches, fn ($a, $b) => $b['count'] <=> $a['count']);
            $matches = array_slice($matches, 0, $limit);

            $suggestions = array_map(fn ($m) => [
                'main_text' => $m['city'],
                'secondary_text' => 'ON',
                'listing_count' => $m['count'],
                'display' => $m['city'] . ', ON',
            ], $matches);

            return response()->json(['suggestions' => $suggestions]);

        } catch (Exception $e) {
            Log::error('City suggestions error: ' . $e->getMessage());
            return response()->json(['suggestions' => [], 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get map markers for the search map.
     *
     * Uses Repliers' server-side clustering (cluster=true) so a single response
     * represents ALL listings in the visible bounds — not just the first 100.
     * Returns:
     *   coordinates: single-listing markers (rendered as price tags)
     *   clusters:    multi-listing groups (rendered as count circles)
     */
    public function getMapCoordinates(Request $request)
    {
        try {
            $this->cleanOutputBuffer();

            $searchParams = $request->input('search_params', []);
            $zoomLevel = (int)($searchParams['zoom_level'] ?? 10);

            // Defaults the param builder expects
            $searchParams['price_min'] = $searchParams['price_min'] ?? 0;
            $searchParams['price_max'] = $searchParams['price_max'] ?? 0;
            $searchParams['bedrooms'] = $searchParams['bedrooms'] ?? 0;
            $searchParams['bathrooms'] = $searchParams['bathrooms'] ?? 0;
            $searchParams['property_type'] = $searchParams['property_type'] ?? [];
            $searchParams['page'] = 1;
            // page_size is irrelevant — listings=false suppresses the listings array
            $searchParams['page_size'] = 1;

            $apiParams = $this->buildRepliersListingsParams($searchParams);
            // Internal pair metadata — never send it to the Repliers API.
            unset($apiParams['_streetAddressPairs']);

            // Repliers filters spatially via either (lat,long,radius) or `map`
            // polygons. We use the viewport so clusters reflect the visible
            // area, and post-filter cluster centres against the GTA polygon
            // below — Repliers' mapOperator=AND currently behaves like OR
            // for disjoint polygons, so we can't combine the two upstream.
            $gtaPolygon = config('repliers.gta_polygon');

            $apiParams['cluster'] = 'true';
            $apiParams['clusterPrecision'] = $this->clusterPrecisionForZoom($zoomLevel);
            $apiParams['clusterLimit'] = 500;
            // How many listings per cluster Repliers should inline. A cluster
            // with inline listings expands into individual price markers on
            // the frontend; anything larger stays a count bubble. We keep
            // the threshold at 1 for everything short of the building zoom
            // so small groups render as "2", "4" bubbles instead of
            // overlapping price pins — much cleaner at street level.
            //   zoom ≤ 17: 1   (solitary listings only; groups stay bubbles)
            //   zoom ≥ 18: 100 (building level — show every individual unit)
            if ($zoomLevel >= 18) {
                $clusterListingsThreshold = 100;
            } else {
                $clusterListingsThreshold = 1;
            }
            $apiParams['clusterListingsThreshold'] = $clusterListingsThreshold;
            $apiParams['clusterFields'] = 'mlsNumber,listPrice,address,map,details.numBedrooms,details.numBathrooms,details.style,images[1]';
            $apiParams['listings'] = 'false';

            $repliersApi = app(\App\Services\RepliersApiService::class);

            $result = $repliersApi->searchListings($apiParams);

            $totalCount = $result['count'] ?? 0;
            $rawClusters = $result['aggregates']['map']['clusters'] ?? [];

            // Broaden-on-empty: city landing pages (e.g. /aurora/houses-for-sale)
            // open the map on Toronto, and that viewport becomes a lat/long/radius
            // filter Repliers ANDs with city=Aurora — a disjoint intersection that
            // returns nothing. When a text query is scoped but the visible area
            // has zero results, retry without the spatial filter and tell the
            // frontend to pan to the results via fit_bounds. A user-drawn polygon
            // is an explicit scope, so an empty result there is a valid answer.
            $searchMovedMap = false;
            $matchedCity = $this->matchGtaCity($searchParams['query'] ?? null);
            $hasSpatialFilter = isset($apiParams['lat']) || isset($apiParams['map']);
            $hasUserPolygon = !empty($searchParams['viewport_bounds']['polygon']);

            // Fresh search with an area intent (query / city / building
            // scope): the visible viewport is stale context from BEFORE the
            // search, so ANDing it in shows the previous area's markers (or
            // nothing) while the list shows the new results. Re-query
            // WITHOUT the spatial filter and fit the map to the results —
            // exactly what the broaden-on-empty path below does, but without
            // waiting for a fully-empty intersection. Pans/zooms after the
            // search (no search_context_changed flag) keep viewport behaviour.
            $hasAreaIntent = !empty($searchParams['query'])
                || !empty($searchParams['city'])
                || !empty($searchParams['street_addresses'])
                || !empty($searchParams['building_id']);
            if (!empty($searchParams['search_context_changed'])
                && $hasAreaIntent && $hasSpatialFilter && !$hasUserPolygon) {
                $freshParams = $apiParams;
                unset($freshParams['lat'], $freshParams['long'], $freshParams['radius'], $freshParams['map']);
                $freshResult = $repliersApi->searchListings($freshParams);
                $freshClusters = $freshResult['aggregates']['map']['clusters'] ?? [];
                if (!empty($freshClusters)) {
                    $result = $freshResult;
                    $totalCount = $freshResult['count'] ?? 0;
                    $rawClusters = $freshClusters;
                    $searchMovedMap = true;
                }
            }

            if ($totalCount == 0 && empty($rawClusters)
                && !empty($searchParams['query']) && $hasSpatialFilter && !$hasUserPolygon) {
                $retryParams = $apiParams;
                unset($retryParams['lat'], $retryParams['long'], $retryParams['radius'], $retryParams['map']);
                $result = $repliersApi->searchListings($retryParams);
                $totalCount = $result['count'] ?? 0;
                $rawClusters = $result['aggregates']['map']['clusters'] ?? [];
                $searchMovedMap = !empty($rawClusters);
                if (empty($rawClusters)) {
                    // Nothing from Repliers for this query at all — return an
                    // empty result set rather than erroring the map.
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'coordinates' => [],
                            'clusters' => [],
                            'total' => 0,
                            'displayed' => 0,
                            'zoom_level' => $zoomLevel,
                            'has_more' => false,
                        ],
                    ]);
                }
            }

            $coordinates = [];
            $clusters = [];

            // Returns null when the listing has no real lat/lng — we'd rather
            // drop the pin than anchor it at the cluster centroid, which puts
            // bubbles on the wrong block.
            $formatListing = function (array $listing) use ($repliersApi): ?array {
                $address = $listing['address'] ?? [];
                $details = $listing['details'] ?? [];
                $map = $listing['map'] ?? [];
                $images = $listing['images'] ?? [];
                $lat = isset($map['latitude']) ? (float) $map['latitude'] : 0.0;
                $lng = isset($map['longitude']) ? (float) $map['longitude'] : 0.0;
                if (!$lat || !$lng) {
                    return null;
                }
                $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
                if (!empty($address['unitNumber'])) {
                    $fullAddress = $address['unitNumber'] . ' - ' . $fullAddress;
                }
                return [
                    'id' => $listing['mlsNumber'] ?? null,
                    'mls_id' => $listing['mlsNumber'] ?? null,
                    'lat' => $lat,
                    'lng' => $lng,
                    'price' => (int) ($listing['listPrice'] ?? 0),
                    'address' => $fullAddress,
                    'city' => $address['city'] ?? '',
                    'beds' => (int) ($details['numBedrooms'] ?? 0),
                    'baths' => (int) ($details['numBathrooms'] ?? 0),
                    'type' => $details['style'] ?? '',
                    'hasImage' => !empty($images),
                    'image' => !empty($images) ? $repliersApi->getImageUrl($images[0], 'small') : null,
                ];
            };

            foreach ($rawClusters as $cluster) {
                $count = (int) ($cluster['count'] ?? 0);
                $loc = $cluster['location'] ?? [];
                $lat = (float) ($loc['latitude'] ?? 0);
                $lng = (float) ($loc['longitude'] ?? 0);
                if (!$lat || !$lng) continue;

                // Drop clusters whose centre is outside the GTA boundary —
                // except when the user explicitly searched a listed GTA city:
                // that city's own listings must never be silently filtered out
                // even if the polygon is later edited to exclude it.
                if (!$matchedCity && !empty($gtaPolygon) && !$this->isPointInPolygon($lat, $lng, $gtaPolygon)) {
                    continue;
                }

                $listings = $cluster['listings'] ?? [];

                // When inline listings are present (cluster size <= the
                // clusterListingsThreshold we requested), expand them into
                // individual price markers. For listings stacked at the
                // same exact lat/lng (multiple units of one building),
                // nudge each one outward so they don't sit on top of
                // each other and remain individually clickable.
                if ($count > 0 && count($listings) === $count) {
                    $byPoint = [];
                    foreach ($listings as $l) {
                        $key = round((float) ($l['map']['latitude'] ?? 0), 5)
                            . ',' . round((float) ($l['map']['longitude'] ?? 0), 5);
                        $byPoint[$key] ??= [];
                        $byPoint[$key][] = $l;
                    }
                    foreach ($byPoint as $group) {
                        $n = count($group);
                        // Tight fan-out so units stay visually on top of
                        // their own building footprint instead of drifting
                        // into adjacent blocks. Scales mildly with unit count
                        // but caps at ~35m so the halo never leaves the lot.
                        $radius = min(0.00032, 0.00018 + 0.00002 * max(0, $n - 2));
                        foreach ($group as $i => $l) {
                            $coord = $formatListing($l);
                            if ($coord === null) {
                                continue;
                            }
                            if ($n > 1) {
                                $angle = ($i / $n) * 2 * M_PI;
                                $coord['lat'] += $radius * cos($angle);
                                $coord['lng'] += ($radius * 1.35) * sin($angle);
                            }
                            $coordinates[] = $coord;
                        }
                    }
                    continue;
                }

                // Larger cluster — render as a count circle the user can
                // click to zoom in.
                $bounds = $cluster['bounds'] ?? [];
                $clusters[] = [
                    'lat' => $lat,
                    'lng' => $lng,
                    'count' => $count,
                    'bounds' => [
                        'north' => (float) ($bounds['top_left']['latitude'] ?? $lat),
                        'south' => (float) ($bounds['bottom_right']['latitude'] ?? $lat),
                        'east'  => (float) ($bounds['bottom_right']['longitude'] ?? $lng),
                        'west'  => (float) ($bounds['top_left']['longitude'] ?? $lng),
                    ],
                ];
            }

            // Drop individual price markers that landed outside GTA too.
            if (!$matchedCity && !empty($gtaPolygon) && !empty($coordinates)) {
                $coordinates = array_values(array_filter(
                    $coordinates,
                    fn($c) => $this->isPointInPolygon((float) $c['lat'], (float) $c['lng'], $gtaPolygon)
                ));
            }

            $displayed = count($coordinates) + array_sum(array_column($clusters, 'count'));

            $data = [
                'coordinates' => $coordinates,
                'clusters' => $clusters,
                'total' => $totalCount,
                'displayed' => $displayed,
                'zoom_level' => $zoomLevel,
                'has_more' => false,
            ];

            // Only when the broaden retry produced the results: tell the
            // frontend to pan/zoom to them. Omitted on the normal path so the
            // map never re-fits while the user pans around.
            if ($searchMovedMap) {
                $lats = [];
                $lngs = [];
                foreach ($coordinates as $c) {
                    $lats[] = (float) $c['lat'];
                    $lngs[] = (float) $c['lng'];
                }
                foreach ($clusters as $cl) {
                    $lats[] = $cl['bounds']['north'];
                    $lats[] = $cl['bounds']['south'];
                    $lngs[] = $cl['bounds']['east'];
                    $lngs[] = $cl['bounds']['west'];
                }
                if (!empty($lats)) {
                    $data['fit_bounds'] = [
                        'north' => max($lats),
                        'south' => min($lats),
                        'east' => max($lngs),
                        'west' => min($lngs),
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);

        } catch (Exception $e) {
            Log::error('Map coordinates error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch map coordinates: ' . $e->getMessage()
            ], 500);
        }
    }
}
