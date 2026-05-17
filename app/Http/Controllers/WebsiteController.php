<?php

namespace App\Http\Controllers;

use App\Models\Website;
use App\Models\Icon;
use App\Models\Property;
use App\Models\Building;
use App\Models\Setting;
use App\Services\MLSIntegrationService;
use App\Services\RepliersApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Foundation\Application;

class WebsiteController extends Controller
{
    /**
     * Get the current website based on domain or query parameter
     *
     * Priority:
     * 1. ?website={slug} query parameter (for preview/testing)
     * 2. Domain matching
     * 3. Default active website
     */
    private function getCurrentWebsite()
    {
        $website = null;

        // Priority 1: Check for ?website={slug} query parameter
        $websiteSlug = request()->query('website');
        if ($websiteSlug) {
            $website = Website::with('agentInfo')
                ->where('slug', $websiteSlug)
                ->where('is_active', true)
                ->first();

            if ($website) {
                return $website;
            }
        }

        // Priority 2: Check for domain match
        $host = request()->getHost();

        // Remove 'www.' if present
        $host = preg_replace('/^www\./i', '', $host);

        // Skip domain matching for localhost/dev environments
        $skipDomains = ['localhost', '127.0.0.1', 'local'];
        $isLocalDev = in_array($host, $skipDomains) ||
                      str_ends_with($host, '.test') ||
                      str_ends_with($host, '.local');

        if (!$isLocalDev) {
            $website = Website::with('agentInfo')
                ->where('domain', $host)
                ->where('is_active', true)
                ->first();

            if ($website) {
                return $website;
            }

            // Also try with www prefix
            $website = Website::with('agentInfo')
                ->where('domain', 'www.' . $host)
                ->where('is_active', true)
                ->first();

            if ($website) {
                return $website;
            }
        }

        // Priority 3: Fall back to default website
        return Website::with('agentInfo')->default()->active()->first() ?? Website::with('agentInfo')->first();
    }

    /**
     * Get website settings/configuration with dynamic content
     */
    private function getWebsiteSettings()
    {
        $website = $this->getCurrentWebsite();

        if (!$website) {
            // Fallback if no website exists
            return [
                'siteName' => 'Nobu Residences',
                'siteUrl' => 'www.noburesidences.com',
                'year' => date('Y'),
                'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
                'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ];
        }

        // Get header_links from the home page content
        $homePage = $website->homePage();
        $homePageContent = $homePage?->content ?? null;
        $headerLinks = null;

        if ($homePageContent) {
            $contentData = is_string($homePageContent) ? json_decode($homePageContent, true) : $homePageContent;
            $headerLinks = $contentData['header_links'] ?? null;
        }

        return [
            'website' => [
                'id' => $website->id,
                'name' => $website->name,
                'slug' => $website->slug,
                'logo_url' => $website->logo_url,
                'logo_width' => $website->logo_width,
                'logo_height' => $website->logo_height,
                'brand_colors' => $website->getBrandColors(),
                'fonts' => $website->fonts,
                'meta_title' => $website->meta_title,
                'meta_description' => $website->meta_description,
                'favicon_url' => $website->favicon_url,
                'contact_info' => $website->getContactInfo(),
                'social_media' => $website->getSocialMedia(),
                'agent_info' => $website->agentInfo,
                'header_links' => $headerLinks,
            ],
            'siteName' => $website->name,
            'siteUrl' => $website->domain ?? request()->getHost(),
            'year' => date('Y'),
            'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
            'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ];
    }

    /**
     * Get page content with icons
     */
    private function getPageContent($pageType = 'home')
    {
        $website = $this->getCurrentWebsite();
        
        if (!$website) {
            return [];
        }

        $page = $website->pages()->where('page_type', $pageType)->first();
        
        if (!$page) {
            return [];
        }

        $content = $page->content;

        // Load icons for the page content
        if (isset($content['about']['tabs'])) {
            $content['about']['tabs'] = $this->enrichContentWithIcons($content['about']['tabs']);
        }

        return $content;
    }

    /**
     * Enrich content with actual icon data
     */
    private function enrichContentWithIcons($tabs)
    {
        // Get all icons grouped by category
        $iconsByCategory = Icon::active()
            ->get()
            ->groupBy('category');

        foreach ($tabs as $tabKey => &$tab) {
            if (isset($tab['items']) && is_array($tab['items'])) {
                foreach ($tab['items'] as &$item) {
                    if (isset($item['icon'])) {
                        $iconName = $item['icon'];
                        $category = $tabKey === 'key_facts' ? 'key_facts' : 
                                   ($tabKey === 'amenities' ? 'amenities' : 'highlights');
                        
                        // Find the icon
                        $icons = $iconsByCategory->get($category, collect());
                        $icon = $icons->firstWhere('name', $iconName);
                        
                        if ($icon) {
                            $item['icon_data'] = [
                                'id' => $icon->id,
                                'name' => $icon->name,
                                'svg_content' => $icon->svg_content,
                                'icon_url' => $icon->icon_url,
                            ];
                        }
                    }
                }
            }
        }

        return $tabs;
    }

    /**
     * Display the home page
     */
    public function home()
    {
        $website = $this->getCurrentWebsite();

        // Check if the website is configured to use a building as homepage
        if ($website && $website->use_building_as_homepage && $website->homepage_building_id) {
            // Load the building with all necessary relationships
            $building = Building::with([
                'properties' => function($query) {
                    $query->select('id', 'building_id', 'title', 'price', 'bedrooms',
                        'bathrooms', 'area', 'area_unit', 'status', 'property_type', 'images');
                },
                'amenities',
                'maintenanceFeeAmenities'
            ])->find($website->homepage_building_id);

            // If building exists, render the building detail page as homepage
            if ($building) {
                $settings = $this->getWebsiteSettings();

                // Calculate aggregated data
                $properties = $building->properties;
                $availableUnits = $properties->where('status', 'available')->count();
                $priceRange = $properties->count() > 0 ? [
                    'min' => $properties->min('price'),
                    'max' => $properties->max('price')
                ] : null;

                // Get building display data
                $buildingData = $building->getDisplayData();

                // Build the list of street addresses to query (e.g.
                // ["15 Mercer", "35 Mercer"]). Pull from street_address_1/2
                // first, then fall back to splitting the main address on
                // both "," and "&". Multi-word street names like
                // "Lake Shore Blvd W" must keep "Lake Shore" intact so the
                // downstream Repliers lookup matches.
                $parseAddress = function (string $a): ?string {
                    if (!preg_match('/^(\d+)\s+(.+)$/u', trim($a), $m)) return null;
                    $rest = preg_replace('/\s+(?:W|E|N|S|West|East|North|South|NE|NW|SE|SW)\.?$/i', '', $m[2]);
                    $rest = preg_replace('/\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Crescent|Cres|Court|Ct|Place|Pl|Park|Parkway|Pkwy|Square|Sq|Terrace|Ter|Circle|Cir|Trail|Tr|Gate|Hill|Heights|Hts|Mews|Walk|Common|Commons)\.?$/i', '', $rest);
                    $name = trim($rest);
                    return $name === '' ? null : $m[1] . ' ' . $name;
                };
                $streetAddresses = [];
                if (!empty($building->street_address_1) && ($p = $parseAddress($building->street_address_1))) {
                    $streetAddresses[] = $p;
                }
                if (!empty($building->street_address_2) && ($p = $parseAddress($building->street_address_2))) {
                    $streetAddresses[] = $p;
                }
                if (empty($streetAddresses) && !empty($building->address)) {
                    foreach (preg_split('/\s*[,&]\s*/', $building->address) as $part) {
                        if ($p = $parseAddress($part)) {
                            $streetAddresses[] = $p;
                        }
                    }
                }
                $streetAddresses = array_values(array_unique($streetAddresses));

                // Fetch live listings from Repliers (the local mls_properties
                // table is empty) for both sale + lease, attaching the
                // building's name + neighbourhood to each formatted listing.
                $mlsPropertiesForSale = $this->fetchBuildingListingsFromRepliers($streetAddresses, 'sale', $building);
                $mlsPropertiesForRent = $this->fetchBuildingListingsFromRepliers($streetAddresses, 'lease', $building);

                // Expose live counts so the building card shows real numbers
                // instead of "0 for sale / 0 for rent".
                $buildingData['units_for_sale'] = count($mlsPropertiesForSale);
                $buildingData['units_for_rent'] = count($mlsPropertiesForRent);
                $buildingData['mls_properties_for_sale'] = $mlsPropertiesForSale;
                $buildingData['mls_properties_for_rent'] = $mlsPropertiesForRent;
                $buildingData['priceHistory'] = $this->fetchBuildingPriceHistory($streetAddresses);

                return Inertia::render('BuildingDetail', [
                    'buildingData' => $buildingData,
                    'buildingId' => $building->id,
                    'properties' => $properties,
                    'availableUnits' => $availableUnits,
                    'priceRange' => $priceRange,
                    'isHomepage' => true,
                    'auth' => [
                        'user' => request()->user(),
                    ],
                    ...$settings
                ]);
            }
        }

        // Otherwise, render the regular homepage
        $settings = $this->getWebsiteSettings();
        $pageContent = $this->getPageContent('home');

        // Get all icons grouped by category for the frontend
        $icons = Icon::active()
            ->select('id', 'name', 'category', 'svg_content', 'icon_url', 'description')
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->groupBy('category');

        // Get latest blogs for homepage
        $blogs = \App\Models\Blog::with('blogCategory')
            ->published()
            ->orderBy('published_at', 'desc')
            ->limit(6)
            ->get();

        // Get active blog categories
        $blogCategories = \App\Models\BlogCategory::active()
            ->ordered()
            ->get(['id', 'name', 'slug', 'description', 'featured_image']);

        return Inertia::render('Welcome', array_merge($settings, [
            'auth' => [
                'user' => request()->user(),
            ],
            'pageContent' => $pageContent,
            'availableIcons' => $icons,
            'blogs' => $blogs,
            'blogCategories' => $blogCategories
        ]));
    }

    /**
     * Display the rent page
     */
    public function rent()
    {
        return Inertia::render('Rent', array_merge($this->getWebsiteSettings(), [
            'title' => 'Properties for Rent'
        ]));
    }

    /**
     * Display the sale page
     */
    public function sale()
    {
        return Inertia::render('Sale', array_merge($this->getWebsiteSettings(), [
            'title' => 'Properties for Sale'
        ]));
    }

    /**
     * Display the enhanced search page with Repliers API integration
     */
    public function search(Request $request)
    {
        // Get search filters from request
        $filters = $request->only([
            'search', 'forSale', 'bedType', 'minPrice', 'maxPrice', 'tab', 'page', 'sort'
        ]);

        $searchTab = $filters['tab'] ?? 'listings';

        return Inertia::render('Search', array_merge($this->getWebsiteSettings(), [
            'auth' => [
                'user' => $request->user(),
            ],
            'title' => 'Property Search',
            'filters' => $filters,
            'searchTab' => $searchTab
        ]));
    }

    /**
     * Parse a search slug like "2-bedroom-condos-for-sale" into structured
     * filter values: bedrooms, property kind, sale|rent.
     */
    private function parseSearchSlug(string $slug): array
    {
        $bedrooms = null;
        $kind = 'condos';
        $isRent = false;

        if (preg_match('/^(?:(\d+)-bedroom-)?(condos|houses|townhouses|apartments)-for-(sale|rent)$/i', $slug, $m)) {
            if (!empty($m[1])) {
                $bedrooms = (int) $m[1];
            }
            $kind = strtolower($m[2]);
            $isRent = strtolower($m[3]) === 'rent';
        }

        $kindToSubType = [
            'condos' => 'Condo Apartment',
            'apartments' => 'Condo Apartment',
            'townhouses' => 'Condo Townhouse',
            'houses' => 'Detached',
        ];

        return [
            'bedrooms' => $bedrooms,
            'kind' => $kind,
            'isRent' => $isRent,
            'property_sub_type' => $kindToSubType[$kind] ?? 'Condo Apartment',
        ];
    }

    /**
     * City-only search landing page (e.g. /toronto/condos-for-sale).
     */
    public function searchByCity(Request $request, $city, $searchSlug)
    {
        $cityName = ucwords(str_replace('-', ' ', $city));
        $parsed = $this->parseSearchSlug($searchSlug);
        $isRent = $parsed['isRent'];

        $initialFilters = [
            'search' => $cityName,
            'query' => $cityName,
            'status' => $isRent ? 'For Rent' : 'For Sale',
            'forSale' => $isRent ? 'For Rent' : 'For Sale',
            'city' => $cityName,
            'property_sub_type' => $parsed['property_sub_type'],
            'property_type' => [$parsed['property_sub_type']],
        ];
        if ($parsed['bedrooms']) {
            $initialFilters['bedrooms'] = $parsed['bedrooms'];
            $initialFilters['bedType'] = $parsed['bedrooms'];
        }

        $title = ucfirst($parsed['kind']) . ' for ' . ($isRent ? 'Rent' : 'Sale') . " in $cityName";
        if ($parsed['bedrooms']) {
            $title = "{$parsed['bedrooms']}-Bedroom $title";
        }

        return Inertia::render('Search', array_merge($this->getWebsiteSettings(), [
            'auth' => ['user' => $request->user()],
            'title' => $title,
            'filters' => $initialFilters,
            'searchTab' => 'listings',
            'initialSearchFilters' => $initialFilters,
        ]));
    }

    /**
     * Neighbourhood / area search landing page.
     * Routes like /toronto/king-west/condos-for-sale render the Search page
     * pre-filtered by city + neighbourhood + sale|rent (+ optional bedrooms/kind).
     */
    public function searchByArea(Request $request, $city, $neighbourhood, $searchSlug)
    {
        $cityName = ucwords(str_replace('-', ' ', $city));
        $neighbourhoodName = ucwords(str_replace('-', ' ', $neighbourhood));
        $parsed = $this->parseSearchSlug($searchSlug);
        $isRent = $parsed['isRent'];

        $initialFilters = [
            'search' => $neighbourhoodName,
            'query' => $neighbourhoodName,
            'status' => $isRent ? 'For Rent' : 'For Sale',
            'forSale' => $isRent ? 'For Rent' : 'For Sale',
            'city' => $cityName,
            'neighbourhood' => $neighbourhoodName,
            'property_sub_type' => $parsed['property_sub_type'],
            'property_type' => [$parsed['property_sub_type']],
        ];
        if ($parsed['bedrooms']) {
            $initialFilters['bedrooms'] = $parsed['bedrooms'];
            $initialFilters['bedType'] = $parsed['bedrooms'];
        }

        $title = ucfirst($parsed['kind']) . ' for ' . ($isRent ? 'Rent' : 'Sale') . " in $neighbourhoodName, $cityName";
        if ($parsed['bedrooms']) {
            $title = "{$parsed['bedrooms']}-Bedroom $title";
        }

        return Inertia::render('Search', array_merge($this->getWebsiteSettings(), [
            'auth' => ['user' => $request->user()],
            'title' => $title,
            'filters' => $initialFilters,
            'searchTab' => 'listings',
            'initialSearchFilters' => $initialFilters,
        ]));
    }

    /**
     * Display combined Mercer buildings for sale page (e.g., /15-35-Mercer/for-sale)
     */
    public function mercerBuildingsForSale(Request $request)
    {
        // Set filters for both 15 and 35 Mercer properties
        $filters = [
            'mercer_buildings' => true,
            'street_name' => 'Mercer',
            'transaction_type' => 'sale'
        ];

        return Inertia::render('Search', array_merge($this->getWebsiteSettings(), [
            'auth' => [
                'user' => $request->user(),
            ],
            'title' => "Nobu Residences (15 & 35 Mercer) - Properties for Sale",
            'filters' => $filters,
            'searchTab' => 'listings'
        ]));
    }

    /**
     * Display combined Mercer buildings for rent page (e.g., /15-35-Mercer/for-rent)
     */
    public function mercerBuildingsForRent(Request $request)
    {
        // Set filters for both 15 and 35 Mercer properties
        $filters = [
            'mercer_buildings' => true,
            'street_name' => 'Mercer',
            'transaction_type' => 'rent'
        ];

        return Inertia::render('Search', array_merge($this->getWebsiteSettings(), [
            'auth' => [
                'user' => $request->user(),
            ],
            'title' => "Nobu Residences (15 & 35 Mercer) - Properties for Rent",
            'filters' => $filters,
            'searchTab' => 'listings'
        ]));
    }

    /**
     * Display building-based for sale page (e.g., /15-Mercer/for-sale)
     */
    public function buildingForSale(Request $request, string $building)
    {
        // Parse building string (e.g., "15-Mercer" -> street_number: 15, street_name: "Mercer")
        $parts = explode('-', $building, 2);
        $streetNumber = $parts[0] ?? '';
        $streetName = isset($parts[1]) ? str_replace('-', ' ', $parts[1]) : '';

        // For Mercer street, redirect to combined URL
        if (strtolower($streetName) === 'mercer' && ($streetNumber === '15' || $streetNumber === '35')) {
            return redirect()->route('mercer-buildings-for-sale');
        }

        // Regular single building search
        $filters = [
            'street_number' => $streetNumber,
            'street_name' => $streetName,
            'transaction_type' => 'sale'
        ];
        $title = "{$streetNumber} {$streetName} - Properties for Sale";

        return Inertia::render('Search', array_merge($this->getWebsiteSettings(), [
            'auth' => [
                'user' => $request->user(),
            ],
            'title' => $title,
            'filters' => $filters,
            'searchTab' => 'listings'
        ]));
    }

    /**
     * Display building-based for rent page (e.g., /15-Mercer/for-rent)
     */
    public function buildingForRent(Request $request, string $building)
    {
        // Parse building string (e.g., "15-Mercer" -> street_number: 15, street_name: "Mercer")
        $parts = explode('-', $building, 2);
        $streetNumber = $parts[0] ?? '';
        $streetName = isset($parts[1]) ? str_replace('-', ' ', $parts[1]) : '';

        // For Mercer street, redirect to combined URL
        if (strtolower($streetName) === 'mercer' && ($streetNumber === '15' || $streetNumber === '35')) {
            return redirect()->route('mercer-buildings-for-rent');
        }

        // Regular single building search
        $filters = [
            'street_number' => $streetNumber,
            'street_name' => $streetName,
            'transaction_type' => 'rent'
        ];
        $title = "{$streetNumber} {$streetName} - Properties for Rent";

        return Inertia::render('Search', array_merge($this->getWebsiteSettings(), [
            'auth' => [
                'user' => $request->user(),
            ],
            'title' => $title,
            'filters' => $filters,
            'searchTab' => 'listings'
        ]));
    }

    /**
     * Display city-based for sale page (SEO-friendly)
     */
    public function cityForSale(Request $request, string $city)
    {
        // Convert city slug to proper format
        $cityName = ucwords(str_replace('-', ' ', $city));
        
        // Set filters for condo apartments for sale
        $filters = [
            'status' => 'For Sale',
            'property_type' => ['Condo Apartment'],
            'location' => $cityName
        ];
        
        return Inertia::render('Search', array_merge($this->getWebsiteSettings(), [
            'auth' => [
                'user' => $request->user(),
            ],
            'title' => "Condo Apartments for Sale in {$cityName} - Property Search",
            'filters' => $filters,
            'searchTab' => 'listings'
        ]));
    }

    /**
     * Display city-based for rent page (SEO-friendly)
     */
    public function cityForRent(Request $request, string $city)
    {
        // Convert city slug to proper format
        $cityName = ucwords(str_replace('-', ' ', $city));
        
        // Set filters for condo apartments for rent - use 'For Rent' for frontend display
        $filters = [
            'status' => 'For Rent',
            'property_type' => ['Condo Apartment'],
            'location' => $cityName
        ];
        
        return Inertia::render('Search', array_merge($this->getWebsiteSettings(), [
            'auth' => [
                'user' => $request->user(),
            ],
            'title' => "Condo Apartments for Rent in {$cityName} - Property Search",
            'filters' => $filters,
            'searchTab' => 'listings'
        ]));
    }

    /**
     * Search local properties with enhanced handling
     */
    private function searchLocalProperties(array $filters, int $currentPage, int $perPage): array
    {
        $query = Property::with('building')
            ->active()
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                          ->orWhere('address', 'like', "%{$search}%")
                          ->orWhere('city', 'like', "%{$search}%")
                          ->orWhereHas('building', function ($q) use ($search) {
                              $q->where('name', 'like', "%{$search}%");
                          });
                });
            })
            ->when($filters['forSale'] ?? null, function ($q, $forSale) {
                $transactionType = $forSale === 'sale' ? 'sale' : ($forSale === 'rent' ? 'rent' : $forSale);
                $q->where('transaction_type', $transactionType);
            })
            ->when($filters['bedType'] ?? null, function ($q, $bedType) {
                $q->where('bedrooms', '>=', (int)$bedType);
            })
            ->when($filters['minPrice'] ?? null, function ($q, $minPrice) {
                if ($minPrice !== '0' && $minPrice !== '') {
                    $price = (int)str_replace(['$', ','], '', $minPrice);
                    $q->where('price', '>=', $price);
                }
            })
            ->when($filters['maxPrice'] ?? null, function ($q, $maxPrice) {
                if ($maxPrice !== '$37,000,000' && $maxPrice !== '') {
                    $price = (int)str_replace(['$', ','], '', $maxPrice);
                    $q->where('price', '<=', $price);
                }
            });

        $total = $query->count();
        $offset = ($currentPage - 1) * $perPage;
        
        $properties = $query->orderBy('created_at', 'desc')
                           ->skip($offset)
                           ->limit($perPage)
                           ->get()
                           ->map(function ($property) {
                               $data = $property->getDisplayData();
                               return [
                                   'id' => $data['id'],
                                   'listingKey' => $data['mls_number'] ?? $data['id'],
                                   'price' => $data['price'],
                                   'formatted_price' => $this->formatPropertyPrice($data['price'], $data['transaction_type']),
                                   'propertyType' => $data['property_type'] ?: 'Residential',
                                   'transactionType' => ucfirst($data['transaction_type']),
                                   'bedrooms' => $data['bedrooms'] ?? 0,
                                   'bathrooms' => $data['bathrooms'] ?? 0,
                                   'address' => $data['address'],
                                   'city' => $data['city'],
                                   'province' => $data['province'],
                                   'latitude' => $data['latitude'],
                                   'longitude' => $data['longitude'],
                                   'isRental' => $data['transaction_type'] === 'rent',
                                   'building' => $property->building?->getDisplayData(),
                                   'source' => 'local', // Mark as local data (not MLS)
                                   'uniqueKey' => $this->generateUniqueKey($data['address'], $data['price'])
                               ];
                           })
                           ->toArray();

        return [
            'properties' => $properties,
            'total' => $total
        ];
    }

    /**
     * Search local buildings with deduplication
     */
    private function searchLocalBuildings(array $filters, int $currentPage, int $perPage): array
    {
        $query = Building::active()
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('address', 'like', "%{$search}%")
                          ->orWhere('city', 'like', "%{$search}%")
                          ->orWhere('developer_name', 'like', "%{$search}%");
                });
            });

        $total = $query->count();
        $offset = ($currentPage - 1) * $perPage;
        
        $buildings = $query->orderBy('created_at', 'desc')
                          ->skip($offset)
                          ->limit($perPage)
                          ->get()
                          ->map(function ($building) {
                              return array_merge($building->getDisplayData(), [
                                  'uniqueKey' => $this->generateUniqueKey($building->address, $building->name)
                              ]);
                          })
                          ->toArray();

        return [
            'buildings' => $buildings,
            'total' => $total
        ];
    }

    /**
     * Process MLS properties with enhanced image handling and proper formatting
     */
    private function processMLSProperties(array $mlsProperties): array
    {
        return array_map(function($property) {
            return [
                'id' => $property['id'],
                'listingKey' => $property['listingKey'],
                'price' => $property['price'],
                'formatted_price' => $this->formatPropertyPrice($property['price'], 
                    $property['isRental'] ? 'rent' : 'sale'),
                'propertyType' => $property['propertyType'] ?: 'Residential',
                'transactionType' => $property['transactionType'],
                'bedrooms' => $property['bedrooms'] ?? 0,
                'bathrooms' => $property['bathrooms'] ?? 0,
                'sqft' => $property['sqft'] ?? $property['area'] ?? 0,
                'parking' => $property['parking'] ?? 0,
                'address' => $property['address'],
                'city' => $property['city'],
                'province' => $property['province'],
                'latitude' => $property['latitude'],
                'longitude' => $property['longitude'],
                'isRental' => $property['isRental'],
                'building' => $property['building'] ?? null,
                'source' => 'mls', // Mark as real MLS data
                'uniqueKey' => $this->generateUniqueKey($property['address'], $property['price']),
                // Use the image URL from MLS if available
                'imageUrl' => $property['image'] ?? null
            ];
        }, $mlsProperties);
    }



    /**
     * Format property price consistently
     */
    private function formatPropertyPrice($price, string $transactionType = 'sale'): string
    {
        if (!$price || $price <= 0) {
            return 'Price on request';
        }
        
        $formattedPrice = '';
        if ($price >= 1000000) {
            $formattedPrice = '$' . number_format($price / 1000000, 1) . 'M';
        } else if ($price >= 1000) {
            $formattedPrice = '$' . number_format($price / 1000, 0) . 'K';
        } else {
            $formattedPrice = '$' . number_format($price, 0);
        }
        
        if ($transactionType === 'rent') {
            $formattedPrice .= '/mo';
        }
        
        return $formattedPrice;
    }

    /**
     * Generate unique key for deduplication
     */
    private function generateUniqueKey(string $address, $identifier): string
    {
        // Normalize address for comparison
        $normalizedAddress = strtolower(trim(preg_replace('/[^a-zA-Z0-9\s]/', '', $address)));
        return md5($normalizedAddress . '_' . $identifier);
    }

    /**
     * Deduplicate properties array
     */
    private function deduplicateProperties(array $properties): array
    {
        $seen = [];
        $deduplicated = [];
        
        foreach ($properties as $property) {
            $key = $property['uniqueKey'];
            
            if (!isset($seen[$key])) {
                $seen[$key] = true;
                $deduplicated[] = $property;
            } else {
                // If we already have this property, prefer local over MLS
                if ($property['source'] === 'local') {
                    // Replace the existing property with the local one
                    foreach ($deduplicated as $index => $existingProperty) {
                        if ($existingProperty['uniqueKey'] === $key) {
                            $deduplicated[$index] = $property;
                            break;
                        }
                    }
                }
            }
        }
        
        return $deduplicated;
    }

    /**
     * Display the blog page
     */
    public function blog(Request $request)
    {
        try {
            // Get the category from URL parameter
            $categorySlug = $request->get('category');
            $selectedCategory = null;

            // Build the query for blogs
            $blogsQuery = \App\Models\Blog::with('blogCategory')
                ->published();

            // Filter by category if provided
            if ($categorySlug) {
                // Find the category by slug
                $selectedCategory = \App\Models\BlogCategory::where('slug', $categorySlug)->first();
                if ($selectedCategory) {
                    $blogsQuery->where('category_id', $selectedCategory->id);
                }
            }

            // Fetch paginated blogs
            $blogs = $blogsQuery->orderBy('published_at', 'desc')
                ->paginate(9);

            // Get active blog categories from the database
            $categories = \App\Models\BlogCategory::active()
                ->ordered()
                ->get(['id', 'name', 'slug', 'description', 'featured_image']);

            return Inertia::render('Blog', array_merge($this->getWebsiteSettings(), [
                'title' => 'Real Estate Blog',
                'blogs' => $blogs,
                'categories' => $categories,
                'selectedCategory' => $selectedCategory ? $selectedCategory->slug : null
            ]));
        } catch (\Exception $e) {
            \Log::error('Blog page error: ' . $e->getMessage());
            // Return with minimal settings on error
            return Inertia::render('Blog', [
                'siteName' => 'Nobu Residences',
                'siteUrl' => request()->getHost(),
                'year' => date('Y'),
                'website' => null,
                'title' => 'Real Estate Blog',
                'blogs' => [],
                'categories' => [],
                'selectedCategory' => null
            ]);
        }
    }

    /**
     * Display individual blog post
     */
    public function blogDetail($slug)
    {
        $blog = \App\Models\Blog::with('blogCategory')
            ->where('slug', $slug)
            ->orWhere('id', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        // Increment views
        $blog->increment('views');

        // Get related posts by category_id
        $relatedPosts = \App\Models\Blog::with('blogCategory')
            ->published()
            ->where('id', '!=', $blog->id)
            ->where('category_id', $blog->category_id)
            ->limit(3)
            ->get();

        // Get recent posts
        $recentPosts = \App\Models\Blog::with('blogCategory')
            ->published()
            ->where('id', '!=', $blog->id)
            ->orderBy('published_at', 'desc')
            ->limit(4)
            ->get();

        return Inertia::render('BlogDetail', array_merge($this->getWebsiteSettings(), [
            'title' => $blog->title,
            'blog' => $blog,
            'relatedPosts' => $relatedPosts,
            'recentPosts' => $recentPosts
        ]));
    }

    /**
     * Display the contact page
     */
    public function contact()
    {
        try {
            return Inertia::render('Contact', array_merge($this->getWebsiteSettings(), [
                'title' => 'Contact Us'
            ]));
        } catch (\Exception $e) {
            \Log::error('Contact page error: ' . $e->getMessage());
            // Return with minimal settings on error
            return Inertia::render('Contact', [
                'siteName' => 'Nobu Residences',
                'siteUrl' => request()->getHost(),
                'year' => date('Y'),
                'website' => null,
                'title' => 'Contact Us'
            ]);
        }
    }

    /**
     * Display the developers listing page
     */
    public function developers(Request $request)
    {
        try {
            $search = $request->get('search');

            // Get all developers with buildings count
            $developersQuery = \App\Models\Developer::withCount('buildings')
                ->orderBy('name');

            // Apply search filter if provided
            if ($search) {
                $developersQuery->where('name', 'like', '%' . $search . '%');
            }

            $developers = $developersQuery->get();

            return Inertia::render('DeveloperDetail', array_merge($this->getWebsiteSettings(), [
                'title' => 'Top Condo Developers in Toronto',
                'developer' => null,
                'buildings' => [],
                'allDevelopers' => $developers
            ]));
        } catch (\Exception $e) {
            \Log::error('Developers page error: ' . $e->getMessage());
            return Inertia::render('DeveloperDetail', [
                'siteName' => 'Nobu Residences',
                'siteUrl' => request()->getHost(),
                'year' => date('Y'),
                'website' => null,
                'title' => 'Top Condo Developers in Toronto',
                'developer' => null,
                'buildings' => [],
                'allDevelopers' => []
            ]);
        }
    }

    /**
     * Display a specific developer detail page
     */
    public function developerDetail($developerSlug)
    {
        try {
            $developer = null;

            // First try to find by UUID (if it looks like a UUID)
            if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $developerSlug)) {
                $developer = \App\Models\Developer::where('id', $developerSlug)->first();
            }

            // If not found by ID, search all developers and match by slug
            if (!$developer) {
                $developers = \App\Models\Developer::all();
                $normalizedSlug = strtolower(trim($developerSlug));

                foreach ($developers as $dev) {
                    $devSlug = \Illuminate\Support\Str::slug($dev->name);
                    if ($devSlug === $normalizedSlug) {
                        $developer = $dev;
                        break;
                    }
                }
            }

            // If still not found, try partial name match (case insensitive)
            if (!$developer) {
                $searchName = str_replace('-', ' ', $developerSlug);
                $developer = \App\Models\Developer::whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($searchName) . '%'])->first();
            }

            if (!$developer) {
                \Log::warning('Developer not found for slug: ' . $developerSlug);
                abort(404, 'Developer not found');
            }

            // Get buildings by this developer
            $buildings = \App\Models\Building::where('developer_id', $developer->id)
                ->orderBy('name')
                ->get();

            // Listings - empty for now (MlsProperty model may not exist on all environments)
            $listings = [];

            // Get all developers for the search dropdown
            $allDevelopers = \App\Models\Developer::withCount('buildings')
                ->orderBy('name')
                ->get();

            return Inertia::render('DeveloperDetail', array_merge($this->getWebsiteSettings(), [
                'title' => $developer->name . ' - Developer',
                'developer' => $developer,
                'buildings' => $buildings,
                'listings' => $listings,
                'allDevelopers' => $allDevelopers
            ]));
        } catch (\Exception $e) {
            \Log::error('Developer detail page error: ' . $e->getMessage());
            abort(404, 'Developer not found');
        }
    }

    /**
     * Proxy images to avoid CORS/SSL errors
     */
    public function proxyImage(Request $request)
    {
        $imageUrl = $request->get('url');
        
        if (!$imageUrl) {
            return response('No image URL provided', 400);
        }
        
        try {
            // Fetch the image without SSL verification
            $response = Http::withOptions([
                'verify' => false,
                'timeout' => 10,
            ])->get($imageUrl);
            
            if ($response->successful()) {
                return response($response->body())
                    ->header('Content-Type', $response->header('Content-Type') ?: 'image/jpeg')
                    ->header('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
            }
        } catch (\Exception $e) {
            \Log::error('Image proxy error: ' . $e->getMessage());
        }
        
        // Return a placeholder image if the fetch fails
        return redirect('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80');
    }

    /**
     * Display the school page
     */
    public function school()
    {
        return Inertia::render('School', array_merge($this->getWebsiteSettings(), [
            'title' => 'School Information'
        ]));
    }

    /**
     * Display the privacy policy page
     */
    public function privacy()
    {
        return Inertia::render('Privacy', array_merge($this->getWebsiteSettings(), [
            'title' => 'Privacy Policy'
        ]));
    }

    /**
     * Display the terms of service page
     */
    public function terms()
    {
        return Inertia::render('Terms', array_merge($this->getWebsiteSettings(), [
            'title' => 'Terms of Service'
        ]));
    }

    /**
     * Get nearby listings for a property
     */
    public function getNearbyListings(Request $request)
    {
        $listingKey = $request->input('listingKey');
        $limit = $request->input('limit', 6);

        try {
            // First try to get current property from local database
            $mlsProperty = \App\Models\MLSProperty::where('mls_id', $listingKey)->first();

            $city = $mlsProperty->city ?? '';
            $currentPrice = $mlsProperty->price ?? 0;

            // If no local data, try Repliers API
            if (!$city) {
                $repliersApi = app(RepliersApiService::class);
                $currentProperty = $repliersApi->getListingByMlsNumber($listingKey);
                if ($currentProperty) {
                    $city = $currentProperty['address']['city'] ?? '';
                    $currentPrice = $currentProperty['listPrice'] ?? 0;
                }
            }

            if (!$city) {
                return response()->json(['properties' => []]);
            }

            // Try database first for nearby listings (much faster)
            $dbQuery = \App\Models\MLSProperty::active()
                ->whereNull('deleted_at')
                ->where('city', 'like', '%' . $city . '%')
                ->where('mls_id', '!=', $listingKey);

            if ($currentPrice > 0) {
                $dbQuery->where('price', '>=', $currentPrice * 0.5)
                        ->where('price', '<=', $currentPrice * 1.5);
            }

            $dbResults = $dbQuery->orderBy('price', 'desc')->limit($limit)->get();

            if ($dbResults->count() > 0) {
                $formattedProperties = $dbResults->map(function ($prop) {
                    $images = $prop->image_urls ?? [];
                    $mediaUrl = !empty($images) ? $images[0] : null;
                    $mlsData = $prop->mls_data ?? [];
                    $address = $mlsData['address'] ?? [];
                    $details = $mlsData['details'] ?? [];

                    return [
                        'ListingKey' => $prop->mls_id,
                        'listingKey' => $prop->mls_id,
                        'ListPrice' => (float) $prop->price,
                        'listPrice' => (float) $prop->price,
                        // Same value under the lowercase key the frontend's
                        // PropertyCardV5 reads first — the DB path was
                        // dropping it and showing "Price on request".
                        'price' => (float) $prop->price,
                        'UnparsedAddress' => $prop->address ?? '',
                        'address' => $prop->address ?? '',
                        'BedroomsTotal' => $prop->bedrooms ?? 0,
                        'bedroomsTotal' => $prop->bedrooms ?? 0,
                        'BathroomsTotalInteger' => $prop->bathrooms ?? 0,
                        'bathroomsTotalInteger' => $prop->bathrooms ?? 0,
                        'LivingAreaRange' => $details['sqft'] ?? '',
                        'ParkingTotal' => $prop->parking_spaces ?? 0,
                        'PropertySubType' => $prop->property_sub_type ?? '',
                        'propertySubType' => $prop->property_sub_type ?? '',
                        'TransactionType' => $prop->property_type ?? 'For Sale',
                        'City' => $prop->city ?? '',
                        'city' => $prop->city ?? '',
                        'StateOrProvince' => $prop->province ?? 'ON',
                        'province' => $prop->province ?? 'ON',
                        'Latitude' => $prop->latitude ? (string) $prop->latitude : '',
                        'Longitude' => $prop->longitude ? (string) $prop->longitude : '',
                        'UnitNumber' => $address['unitNumber'] ?? '',
                        'StreetNumber' => $address['streetNumber'] ?? '',
                        'StreetName' => $address['streetName'] ?? '',
                        'MediaURL' => $mediaUrl,
                        'imageUrl' => $mediaUrl,
                        'Images' => array_map(fn($url) => ['MediaURL' => $url], $images),
                        'StandardStatus' => 'Active',
                    ];
                })->toArray();

                \Log::info('Nearby listings from DB: ' . count($formattedProperties));
                return response()->json(['properties' => $formattedProperties]);
            }

            // Fallback to Repliers API
            $repliersApi = app(RepliersApiService::class);
            $params = [
                'status' => 'A',
                'city' => $city,
                'resultsPerPage' => $limit * 3,
                'sortBy' => 'updatedOnDesc',
            ];

            if ($currentPrice > 0) {
                $params['minPrice'] = intval($currentPrice * 0.5);
                $params['maxPrice'] = intval($currentPrice * 1.5);
            }

            $result = $repliersApi->searchListings($params);
            $listings = $result['listings'] ?? [];

            $allFormattedProperties = [];
            foreach ($listings as $listing) {
                $mlsNumber = $listing['mlsNumber'] ?? '';
                if ($mlsNumber !== $listingKey) {
                    $formatted = $this->formatRepliersListingData($listing, $repliersApi);
                    $allFormattedProperties[] = $formatted;
                }
            }

            $finalProperties = array_slice($allFormattedProperties, 0, $limit);

            \Log::info('Nearby listings from API: ' . count($finalProperties));
            return response()->json(['properties' => $finalProperties]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch nearby listings: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['properties' => []]);
        }
    }
    
    /**
     * Get similar listings for a property
     */
    public function getSimilarListings(Request $request)
    {
        $listingKey = $request->input('listingKey');
        $limit = $request->input('limit', 6);

        try {
            $repliersApi = app(RepliersApiService::class);

            // Try local database first
            $mlsProperty = \App\Models\MLSProperty::where('mls_id', $listingKey)->first();
            $currentProperty = null;

            if ($mlsProperty && !empty($mlsProperty->mls_data)) {
                $currentProperty = $mlsProperty->mls_data;
            } else {
                $currentProperty = $repliersApi->getListingByMlsNumber($listingKey);
            }

            if (!$currentProperty) {
                return response()->json(['properties' => []]);
            }

            // Try the built-in similar listings endpoint first
            $boardId = $currentProperty['boardId'] ?? null;
            if ($boardId) {
                $similarListings = $repliersApi->getSimilarListings($listingKey, $boardId, $limit);
                if (!empty($similarListings)) {
                    $formattedProperties = [];
                    foreach ($similarListings as $listing) {
                        $formattedProperties[] = $this->formatRepliersListingData($listing, $repliersApi);
                    }
                    return response()->json(['properties' => $formattedProperties]);
                }
            }

            // Fallback: search for similar properties manually
            $currentPrice = $currentProperty['listPrice'] ?? 0;
            $bedrooms = $currentProperty['details']['numBedrooms'] ?? 0;

            $params = [
                'status' => 'A',
                'resultsPerPage' => $limit * 3,
            ];

            // Filter by similar bedroom count
            if ($bedrooms > 0) {
                $params['minBedrooms'] = max(1, $bedrooms - 1);
                $params['maxBedrooms'] = $bedrooms + 1;
            }

            // Add price range filter (within 20% of current property price)
            if ($currentPrice > 0) {
                $params['minPrice'] = intval($currentPrice * 0.8);
                $params['maxPrice'] = intval($currentPrice * 1.2);
            }

            $result = $repliersApi->searchListings($params);
            $listings = $result['listings'] ?? [];

            // Filter out the current property
            $allFormattedProperties = [];
            foreach ($listings as $listing) {
                $mlsNumber = $listing['mlsNumber'] ?? '';
                if ($mlsNumber !== $listingKey) {
                    $allFormattedProperties[] = $this->formatRepliersListingData($listing, $repliersApi);
                }
            }

            $finalProperties = array_slice($allFormattedProperties, 0, $limit);

            \Log::info('Similar listings - Returning ' . count($finalProperties) . ' properties');

            return response()->json(['properties' => $finalProperties]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch similar listings: ' . $e->getMessage());
            return response()->json(['properties' => []]);
        }
    }

    /**
     * Get comparable sales (sold properties) for a property
     */
    public function getComparableSales(Request $request)
    {
        $listingKey = $request->input('listingKey');
        $limit = $request->input('limit', 6);

        try {
            $repliersApi = app(RepliersApiService::class);

            // Get the current property to find comparable sales
            $currentProperty = $repliersApi->getListingByMlsNumber($listingKey);

            if (!$currentProperty) {
                return response()->json(['properties' => []]);
            }

            $bedrooms = $currentProperty['details']['numBedrooms'] ?? 0;
            $currentPrice = $currentProperty['listPrice'] ?? 0;

            // Search for sold/closed properties
            $params = [
                'status' => 'U', // Sold/closed status in Repliers
                'resultsPerPage' => $limit * 3,
            ];

            // Filter by similar bedroom count (+-1)
            if ($bedrooms > 0) {
                $params['minBedrooms'] = max(1, $bedrooms - 1);
                $params['maxBedrooms'] = $bedrooms + 1;
            }

            // Add price range filter (within 20% of current property price)
            if ($currentPrice > 0) {
                $params['minPrice'] = intval($currentPrice * 0.8);
                $params['maxPrice'] = intval($currentPrice * 1.2);
            }

            $result = $repliersApi->searchListings($params);
            $listings = $result['listings'] ?? [];

            // Filter out the current property and format the results
            $allFormattedProperties = [];
            foreach ($listings as $listing) {
                $mlsNumber = $listing['mlsNumber'] ?? '';
                if ($mlsNumber !== $listingKey) {
                    $formatted = $this->formatRepliersListingData($listing, $repliersApi);
                    // Add sold-specific fields
                    $formatted['soldPrice'] = $listing['soldPrice'] ?? $listing['listPrice'] ?? 0;
                    $formatted['soldDate'] = $listing['soldDate'] ?? null;
                    $formatted['daysOnMarket'] = $listing['daysOnMarket'] ?? null;
                    $formatted['isSold'] = true;
                    $allFormattedProperties[] = $formatted;
                }
            }

            $finalProperties = array_slice($allFormattedProperties, 0, $limit);

            \Log::info('Comparable sales - Returning ' . count($finalProperties) . ' properties');

            return response()->json(['properties' => $finalProperties]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch comparable sales: ' . $e->getMessage());
            return response()->json(['properties' => []]);
        }
    }

    /**
     * Redirect old property URL to new SEO-friendly format
     */
    public function propertyDetailRedirect($listingKey)
    {
        // Check if it's a backend database property (DB_ prefix)
        if (str_starts_with($listingKey, 'DB_')) {
            $backendPropertyId = substr($listingKey, 3);
            $property = Property::find($backendPropertyId);

            if ($property) {
                // Format city
                $city = strtolower(trim(str_replace(' ', '-', $property->city ?? 'toronto')));

                // Extract and format street address
                $addressSlug = $this->createAddressSlug($property->address ?? $property->full_address ?? 'property');

                return redirect()->route('property-detail', [
                    'city' => $city,
                    'address' => $addressSlug,
                    'listingKey' => $listingKey
                ]);
            }
        }

        // Fetch basic property data from Repliers API for MLS properties
        try {
            $repliersApi = app(\App\Services\RepliersApiService::class);
            $property = $repliersApi->getListingByMlsNumber($listingKey);

            if ($property) {
                // Format city - remove district codes like C08, W04, etc.
                $city = $property['address']['city'] ?? 'toronto';
                $city = preg_replace('/\s*[cewns]\d{2}\b/i', '', $city); // Remove district codes
                $city = strtolower(trim(str_replace(' ', '-', $city)));

                $addr = $property['address'] ?? [];
                $address = $addr['unparsedAddress']
                    ?? trim(($addr['streetNumber'] ?? '') . ' ' . ($addr['streetName'] ?? '') . ' ' . ($addr['streetSuffix'] ?? ''));

                // Extract and format street address
                $addressSlug = $this->createAddressSlug($address);

                return redirect()->route('property-detail', [
                    'city' => $city,
                    'address' => $addressSlug,
                    'listingKey' => $listingKey
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to redirect property: ' . $e->getMessage());
        }

        // Fallback to default redirect
        return redirect()->route('property-detail', [
            'city' => 'toronto',
            'address' => 'property',
            'listingKey' => $listingKey
        ]);
    }

    /**
     * Create URL-friendly slug from address
     */
    private function createAddressSlug($address)
    {
        // Extract street number and name from full address
        // Example: "55 Mercer Street, Unit 2507" -> "55-mercer-street"
        $address = strtolower($address);
        
        // Remove unit/suite/apt information (including #618 format)
        $address = preg_replace('/[,\s]*#\s*\d+.*/i', '', $address); // Remove #unit format
        $address = preg_replace('/,?\s*(unit|suite|apt|apartment)\s*\d+.*/i', '', $address); // Remove other unit formats
        
        // Remove city, province, postal code
        $address = preg_replace('/,?\s*(toronto|mississauga|brampton|vaughan|markham|richmond hill|oakville|burlington).*/i', '', $address);
        
        // Clean up the address
        $address = trim($address);
        $address = preg_replace('/[^a-z0-9\s\-]/', '', $address);
        $address = preg_replace('/\s+/', '-', $address);
        $address = preg_replace('/-+/', '-', $address);
        
        return trim($address, '-');
    }

    /**
     * Display the property detail page
     */
    public function propertyDetail($city, $address, $listingKey)
    {
        // Extract MLS number from new URL format: unit-604-S12960990 -> S12960990.
        // Unit numbers can contain letters too (PL01, TH3, 4A) — must allow
        // [A-Za-z0-9] not just \d, otherwise we leave the prefix attached and
        // Repliers returns null, which leaves the page stuck on "Loading…".
        if (preg_match('/^unit-[A-Za-z0-9]+-([A-Z]\d+)$/i', $listingKey, $matches)) {
            $listingKey = $matches[1];
        }

        // Try to fetch property data from Repliers API or local database
        $propertyData = null;
        $rawListingData = null; // Store raw listing data for AI generation
        $propertyImages = [];
        $buildingData = null;

        // Cache key for this property
        $cacheKey = 'property_detail_' . $listingKey;
        $cacheTime = 300; // 5 minutes

        // Check if it's a backend database property (DB_ prefix or numeric ID)
        $isBackendProperty = str_starts_with($listingKey, 'DB_') || is_numeric($listingKey);
        $backendPropertyId = str_starts_with($listingKey, 'DB_') ? substr($listingKey, 3) : $listingKey;

        if ($isBackendProperty) {
            $property = Property::with(['building.amenities' => function($query) {
                $query->orderBy('name');
            }, 'building.maintenanceFeeAmenities'])->find($backendPropertyId);
            if ($property) {
                $propertyData = $property->getDisplayData();
                // Add images from backend property
                $propertyImages = $property->images ?? [];

                // Check if images are placeholder URLs and try to fetch real MLS images
                if ($this->hasPlaceholderImages($propertyImages) && !empty($property->mls_number)) {
                    $mlsImages = $this->fetchMlsImagesForBackendProperty($property->mls_number);
                    if (!empty($mlsImages)) {
                        $propertyImages = $mlsImages;
                    }
                }

                // Get building data and amenities if property belongs to a building
                if ($property->building) {
                    // Force load the amenities relationships if not loaded
                    $property->building->loadMissing(['amenities', 'maintenanceFeeAmenities']);

                    $amenities = $property->building->amenities->map(function($amenity) {
                        return [
                            'id' => $amenity->id,
                            'name' => $amenity->name,
                            'icon' => $amenity->icon
                        ];
                    })->toArray();

                    $buildingData = [
                        'id' => $property->building->id,
                        'name' => $property->building->name,
                        'slug' => $property->building->slug,
                        'address' => $property->building->address,
                        'city' => $property->building->city,
                        'neighbourhood' => $property->building->neighbourhood,
                        'sub_neighbourhood' => $property->building->sub_neighbourhood,
                        'main_image' => $property->building->main_image,
                        'units_for_sale' => $property->building->units_for_sale,
                        'units_for_rent' => $property->building->units_for_rent,
                        'amenities' => $amenities,
                        'maintenance_fee_amenities' => $property->building->maintenanceFeeAmenities->map(function($amenity) {
                            return [
                                'name' => $amenity->name,
                                'icon' => $amenity->icon,
                                'category' => $amenity->category
                            ];
                        })->toArray()
                    ];

                    \Log::info('Local property building amenities loaded:', [
                        'building_id' => $property->building->id,
                        'building_name' => $property->building->name,
                        'amenities_count' => count($amenities),
                        'amenities' => $amenities,
                        'relationship_count' => $property->building->amenities->count(),
                        'source' => 'relationship_table'
                    ]);
                }
            }
        }
        
        // If not found locally, fetch from Repliers API (for MLS listings)
        if (!$propertyData) {
            try {
                // Always fetch from Repliers API for fresh data
                $repliersApi = app(\App\Services\RepliersApiService::class);
                $repliersListing = $repliersApi->getListingByMlsNumber($listingKey);

                if ($repliersListing) {
                    // Debug log the raw API response
                    \Log::info('Repliers listing data for ' . $listingKey, [
                        'sqft' => $repliersListing['details']['sqft'] ?? 'not set',
                        'numParkingSpaces' => $repliersListing['details']['numParkingSpaces'] ?? 'not set',
                        'maintenanceFee' => $repliersListing['details']['maintenanceFee'] ?? 'not set',
                    ]);

                    // Store raw data for AI generation
                    $rawListingData = $repliersListing;

                    // Format the property data for display
                    $propertyData = $this->formatRepliersPropertyData($repliersListing);
                    
                    // Try to match building by address for MLS properties
                    if (!empty($propertyData['address'])) {
                        // Extract building address from full property address.
                        // Strip an optional unit prefix like "813 - " or
                        // "Suite 813, " so we don't confuse the unit number
                        // with the actual street number.
                        $fullAddress = $propertyData['address'];
                        $fullAddress = preg_replace('/^\s*(?:unit|suite|apt|apartment)\s*\d+\s*[,\-]?\s*/i', '', $fullAddress);
                        $fullAddress = preg_replace('/^\s*\d+\s*-\s*/', '', $fullAddress); // "813 - 15 Mercer..."

                        // Extract street number and street name (handle both "Street" and "St" etc)
                        if (preg_match('/^(\d+)\s+([A-Za-z]+)(?:\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Court|Ct|Place|Pl|Lane|Ln))?\s*(?:\d+)?(?:,|$)/i', $fullAddress, $matches)) {
                            $streetNumber = $matches[1]; // "15"
                            $streetBaseName = $matches[2]; // "Mercer" (just the base name)

                            \Log::info('MLS property building matching - improved', [
                                'listing_key' => $listingKey,
                                'full_address' => $fullAddress,
                                'street_number' => $streetNumber,
                                'street_base_name' => $streetBaseName
                            ]);

                            // Log all available buildings for debugging
                            $allBuildings = \App\Models\Building::pluck('address', 'name');
                            \Log::info('All available buildings:', $allBuildings->toArray());

                            // Find building by address - match against
                            // street_address_1, street_address_2, AND the
                            // joined address field (so we catch buildings
                            // like NOBU which is at 15 Mercer + 35 Mercer).
                            $needle = $streetNumber . ' ' . $streetBaseName;
                            $building = \App\Models\Building::with(['amenities' => function($query) {
                                $query->orderBy('name');
                            }, 'maintenanceFeeAmenities'])
                                ->where(function($query) use ($streetNumber, $streetBaseName, $needle) {
                                    $query->where('street_address_1', 'LIKE', $needle . '%')
                                          ->orWhere('street_address_2', 'LIKE', $needle . '%')
                                          ->orWhere('address', 'LIKE', $needle . '%')
                                          ->orWhere('address', 'LIKE', '%' . $needle . '%')
                                          ->orWhere(function($q) use ($streetNumber, $streetBaseName) {
                                              $q->where('address', 'LIKE', '%' . $streetNumber . '%')
                                                ->where('address', 'LIKE', '%' . $streetBaseName . '%');
                                          });
                                })
                                ->first();

                            if (!$building) {
                                \Log::warning('Building not found with flexible matching', [
                                    'street_number' => $streetNumber,
                                    'street_base_name' => $streetBaseName,
                                    'attempted_patterns' => [
                                        $streetNumber . ' ' . $streetBaseName . '%',
                                        '%' . $streetNumber . '%' . ' AND ' . '%' . $streetBaseName . '%'
                                    ]
                                ]);
                            }

                            if ($building) {
                                // Force load the amenities relationships if not loaded
                                $building->loadMissing(['amenities', 'maintenanceFeeAmenities']);
                                
                                $amenities = $building->amenities->map(function($amenity) {
                                    return [
                                        'id' => $amenity->id,
                                        'name' => $amenity->name,
                                        'icon' => $amenity->icon
                                    ];
                                })->toArray();
                                
                                $buildingData = [
                                    'id' => $building->id,
                                    'name' => $building->name,
                                    'slug' => $building->slug,
                                    'address' => $building->address,
                                    'city' => $building->city,
                                    'neighbourhood' => $building->neighbourhood,
                                    'sub_neighbourhood' => $building->sub_neighbourhood,
                                    'main_image' => $building->main_image,
                                    'units_for_sale' => $building->units_for_sale,
                                    'units_for_rent' => $building->units_for_rent,
                                    'amenities' => $amenities,
                                    'maintenance_fee_amenities' => $building->maintenanceFeeAmenities->map(function($amenity) {
                                        return [
                                            'name' => $amenity->name,
                                            'icon' => $amenity->icon,
                                            'category' => $amenity->category
                                        ];
                                    })->toArray()
                                ];

                                \Log::info('MLS property matched to building', [
                                    'listing_key' => $listingKey,
                                    'building_name' => $building->name,
                                    'building_address' => $building->address,
                                    'amenities_count' => count($amenities),
                                    'amenities' => $amenities
                                ]);
                            } else {
                                \Log::info('No building found for MLS property', [
                                    'listing_key' => $listingKey,
                                    'searched_address' => ($streetNumber ?? '') . ' ' . ($streetBaseName ?? '')
                                ]);
                            }
                        } else {
                            \Log::warning('Failed to parse address for MLS property', [
                                'listing_key' => $listingKey,
                                'full_address' => $fullAddress
                            ]);
                        }
                    }
                    
                    // Try to find building by matching address
                    if (!empty($propertyData['address'])) {
                        // Extract building address from property address
                        $addressParts = explode(',', $propertyData['address']);
                        if (count($addressParts) > 0) {
                            $buildingAddress = trim($addressParts[0]);
                            // Remove unit number if present
                            $buildingAddress = preg_replace('/^(\d+\s*-\s*)?/', '', $buildingAddress);

                            // Try to find building by address
                            $building = \App\Models\Building::with(['amenities' => function($query) {
                                $query->orderBy('name');
                            }])->where('address', 'LIKE', '%' . $buildingAddress . '%')
                                ->first();

                            if ($building) {
                                // Force load the amenities relationship
                                $building->load('amenities');
                                
                                $amenities = $building->amenities->map(function($amenity) {
                                    return [
                                        'id' => $amenity->id,
                                        'name' => $amenity->name,
                                        'icon' => $amenity->icon
                                    ];
                                })->toArray();
                                
                                $buildingData = [
                                    'id' => $building->id,
                                    'name' => $building->name,
                                    'slug' => $building->slug,
                                    'address' => $building->address,
                                    'city' => $building->city,
                                    'neighbourhood' => $building->neighbourhood,
                                    'sub_neighbourhood' => $building->sub_neighbourhood,
                                    'main_image' => $building->main_image,
                                    'units_for_sale' => $building->units_for_sale,
                                    'units_for_rent' => $building->units_for_rent,
                                    'amenities' => $amenities,
                                    'maintenance_fee_amenities' => $building->maintenanceFeeAmenities->map(function($amenity) {
                                        return [
                                            'name' => $amenity->name,
                                            'icon' => $amenity->icon,
                                            'category' => $amenity->category
                                        ];
                                    })->toArray()
                                ];
                                \Log::info('Found building for MLS property:', [
                                    'building' => $building->name, 
                                    'amenities_count' => count($amenities),
                                    'amenities' => $amenities,
                                    'relationship_count' => $building->amenities->count(),
                                    'source' => 'relationship_table'
                                ]);
                            }
                        }
                    }
                    
                    // Debug log the formatted data
                    \Log::info('Formatted Property Data for ' . $listingKey, [
                        'LivingAreaRange' => $propertyData['LivingAreaRange'] ?? 'not set',
                        'TaxAnnualAmount' => $propertyData['TaxAnnualAmount'] ?? 'not set',
                        'Exposure' => $propertyData['Exposure'] ?? 'not set',
                        'ParkingTotal' => $propertyData['ParkingTotal'] ?? 'not set',
                        'AssociationFee' => $propertyData['AssociationFee'] ?? 'not set',
                    ]);
                    
                    // Get images from the Repliers listing data
                    if (!empty($repliersListing['images'])) {
                        $repliersApiForImages = app(\App\Services\RepliersApiService::class);
                        $propertyImages = $repliersApiForImages->getListingImageUrls($repliersListing);
                        $propertyImages = array_filter($propertyImages);
                        \Log::info('Repliers property images for ' . $listingKey, ['count' => count($propertyImages)]);
                    } else {
                        // Try local database for images
                        if ($mlsDbProperty && !empty($mlsDbProperty->image_urls)) {
                            $propertyImages = $mlsDbProperty->image_urls;
                        } else {
                            \Log::warning('No images found for listing: ' . $listingKey);
                        }
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Failed to fetch property from Repliers: ' . $e->getMessage());
            }
        }
        
        // Debug log the property data being passed to React
        \Log::info('PropertyDetail Data being passed to React for ' . $listingKey, [
            'ListingContractDate' => $propertyData['ListingContractDate'] ?? 'NOT_FOUND',
            'listingContractDate' => $propertyData['listingContractDate'] ?? 'NOT_FOUND',
            'listingDate' => $propertyData['listingDate'] ?? 'NOT_FOUND',
            'DaysOnMarket' => $propertyData['DaysOnMarket'] ?? 'NOT_FOUND',
            'daysOnMarket' => $propertyData['daysOnMarket'] ?? 'NOT_FOUND',
            'unitNumber' => $propertyData['unitNumber'] ?? 'NOT_FOUND',
            'streetNumber' => $propertyData['streetNumber'] ?? 'NOT_FOUND',
            'streetName' => $propertyData['streetName'] ?? 'NOT_FOUND',
        ]);

        // Add building data to property data if available
        if ($buildingData && $propertyData) {
            $propertyData['buildingData'] = $buildingData;
        }
        
        // Log final building data being passed to view
        if ($buildingData) {
            \Log::info('Final building data passed to PropertyDetail view:', [
                'building_name' => $buildingData['name'] ?? 'unknown',
                'has_amenities' => isset($buildingData['amenities']) && count($buildingData['amenities']) > 0,
                'amenities_count' => count($buildingData['amenities'] ?? [])
            ]);
        } else {
            \Log::info('No building data found for property:', ['listingKey' => $listingKey]);
        }

        // Fetch AI description and FAQs from database if they exist
        $aiDescription = null;
        try {
            $aiDescriptionRecord = \App\Models\PropertyAiDescription::where('mls_id', $listingKey)->first();
            $aiFaqsCollection = \App\Models\PropertyFaq::where('mls_id', $listingKey)
                ->where('is_active', true)
                ->orderBy('order', 'asc')
                ->get();

            // Generate AI content if it doesn't exist and we have property data
            // Use raw listing data for AI generation, or fallback to formatted data
            $aiGenerationData = $rawListingData ?: $propertyData;

            if ($aiGenerationData && (!$aiDescriptionRecord || $aiFaqsCollection->count() == 0)) {
                $geminiService = new \App\Services\GeminiAIService();

                // Generate description if it doesn't exist
                if (!$aiDescriptionRecord) {
                    try {
                        \Log::info('Generating AI description for property:', ['listingKey' => $listingKey]);
                        $descriptions = $geminiService->generatePropertyDescriptions($aiGenerationData, $listingKey);
                        $aiDescriptionRecord = \App\Models\PropertyAiDescription::where('mls_id', $listingKey)->first();
                    } catch (\Exception $e) {
                        \Log::error('Failed to generate AI description:', ['error' => $e->getMessage()]);
                    }
                }

                // Generate FAQs if they don't exist
                if ($aiFaqsCollection->count() == 0) {
                    try {
                        \Log::info('Generating AI FAQs for property:', ['listingKey' => $listingKey]);
                        $faqsResult = $geminiService->generatePropertyFaqs($aiGenerationData, $listingKey);
                        $aiFaqsCollection = \App\Models\PropertyFaq::where('mls_id', $listingKey)
                            ->where('is_active', true)
                            ->orderBy('order', 'asc')
                            ->get();
                    } catch (\Exception $e) {
                        \Log::error('Failed to generate AI FAQs:', ['error' => $e->getMessage()]);
                    }
                }
            }

            if ($aiDescriptionRecord || $aiFaqsCollection->count() > 0) {
                $aiDescription = [];

                if ($aiDescriptionRecord) {
                    $aiDescription['overview'] = $aiDescriptionRecord->overview_description;
                    $aiDescription['detailed'] = $aiDescriptionRecord->detailed_description;
                    $aiDescription['generated_at'] = $aiDescriptionRecord->created_at;
                    $aiDescription['exists'] = true;

                    \Log::info('AI description ready for property:', [
                        'listingKey' => $listingKey,
                        'has_overview' => !empty($aiDescriptionRecord->overview_description),
                        'has_detailed' => !empty($aiDescriptionRecord->detailed_description)
                    ]);
                }

                if ($aiFaqsCollection->count() > 0) {
                    $aiDescription['faqs'] = $aiFaqsCollection->map(function ($faq) {
                        return [
                            'id' => $faq->id,
                            'question' => $faq->question,
                            'answer' => $faq->answer,
                            'order' => $faq->order
                        ];
                    })->toArray();

                    \Log::info('AI FAQs ready for property:', [
                        'listingKey' => $listingKey,
                        'faq_count' => $aiFaqsCollection->count()
                    ]);
                }
            } else {
                \Log::info('No AI content available for property:', ['listingKey' => $listingKey]);
            }
        } catch (\Exception $e) {
            \Log::error('Error fetching AI content:', ['error' => $e->getMessage()]);
        }

        // Canonical-URL redirect: if this listing belongs to a known
        // building, the URL should be
        //   /{city}/{building-rich-slug}/unit-{unitNumber}-{listingKey}
        // If the current request path doesn't match, 301-redirect to it.
        if ($buildingData && !empty($buildingData['name'])) {
            $slugify = function ($s) {
                $s = strtolower((string) $s);
                $s = preg_replace('/[^\w\s-]/', '', $s);
                $s = preg_replace('/[\s_-]+/', '-', $s);
                return trim($s, '-');
            };

            $cityForUrl = $buildingData['city'] ?? 'Toronto';
            $citySlug = $slugify($cityForUrl) ?: 'toronto';

            $slugParts = [$slugify($buildingData['name'])];
            if (!empty($buildingData['street_address_1'])) {
                $slugParts[] = $slugify($buildingData['street_address_1']);
            }
            if (!empty($buildingData['street_address_2'])) {
                $slugParts[] = $slugify($buildingData['street_address_2']);
            }
            if (count($slugParts) === 1 && !empty($buildingData['address'])) {
                foreach (preg_split('/\s*[,&]\s*/', $buildingData['address']) as $part) {
                    if (trim($part) !== '') {
                        $slugParts[] = $slugify($part);
                    }
                }
            }
            $buildingSlug = implode('-', array_filter($slugParts));

            $unitNumber = $propertyData['UnitNumber'] ?? $propertyData['unitNumber'] ?? '';
            $unitSegment = $unitNumber ? "unit-{$unitNumber}-{$listingKey}" : $listingKey;

            $canonicalPath = "/{$citySlug}/{$buildingSlug}/{$unitSegment}";
            $currentPath = '/' . ltrim(request()->path(), '/');

            if ($buildingSlug && $canonicalPath !== $currentPath) {
                return redirect($canonicalPath, 301);
            }
        }

        return Inertia::render('PropertyDetail', array_merge($this->getWebsiteSettings(), [
            'title' => $propertyData ? ($propertyData['address'] ?? 'Property Detail') : 'Property Detail',
            'listingKey' => $listingKey,
            'propertyData' => $propertyData,
            'propertyImages' => $propertyImages,
            'buildingData' => $buildingData,
            'aiDescription' => $aiDescription
        ]));
    }
    
    /**
     * Format listing data for display (property detail page)
     * Handles BOTH old AMPRE flat format and new Repliers nested format
     */
    private function formatRepliersPropertyData($listing): array
    {
        // Detect format: Repliers has nested 'address' object, AMPRE has flat 'City' field
        $isRepliersFormat = isset($listing['address']) && is_array($listing['address']);

        if ($isRepliersFormat) {
            $address = $listing['address'] ?? [];
            $details = $listing['details'] ?? [];
            $office = $listing['office'] ?? [];
            $agents = $listing['agents'] ?? [];
            $map = $listing['map'] ?? [];
            $taxes = $listing['taxes'] ?? [];
            $condominium = $listing['condominium'] ?? [];

            $unparsedAddress = $address['unparsedAddress']
                ?? trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
            if (!empty($address['unitNumber'])) {
                $unparsedAddress = $address['unitNumber'] . ' - ' . $unparsedAddress;
            }

            $listAgent = !empty($agents) ? ($agents[0]['name'] ?? '') : '';
            $taxAmount = !empty($taxes) && isset($taxes[0]) ? ($taxes[0]['annualAmount'] ?? 0) : (!empty($taxes) ? ($taxes['annualAmount'] ?? 0) : 0);
            $sqft = $details['sqft'] ?? '';
            $maintenanceFee = $condominium['fees']['maintenance'] ?? $details['maintenanceFee'] ?? 0;
            $parking = $details['numParkingSpaces'] ?? 0;
            $exposure = $condominium['exposure'] ?? $details['exposure'] ?? '';
            $type = $listing['type'] ?? 'Sale';
            $transactionType = (strtolower($type) === 'lease') ? 'For Lease' : 'For Sale';
        } else {
            // Old AMPRE flat format from existing DB records
            $address = [];
            $details = [];
            $office = [];
            $map = [];
            $taxes = [];

            $unparsedAddress = $listing['UnparsedAddress'] ?? '';
            $listAgent = $listing['ListAgentFullName'] ?? '';
            $taxAmount = $listing['TaxAnnualAmount'] ?? $listing['AssessmentYear'] ?? 0;
            $sqft = $listing['LivingAreaRange'] ?? $listing['LivingArea'] ?? $listing['AboveGradeFinishedArea'] ?? '';
            $maintenanceFee = $listing['AssociationFee'] ?? 0;
            $parking = $listing['ParkingTotal'] ?? $listing['ParkingSpaces'] ?? 0;
            $exposure = $listing['Exposure'] ?? '';
            $transactionType = $listing['TransactionType'] ?? 'For Sale';
        }

        // Extract fields based on format
        if ($isRepliersFormat) {
            $listingKey = $listing['mlsNumber'] ?? '';
            $unitNumber = $address['unitNumber'] ?? '';
            $streetNumber = $address['streetNumber'] ?? '';
            $streetName = $address['streetName'] ?? '';
            $streetSuffix = $address['streetSuffix'] ?? '';
            $city = $address['city'] ?? '';
            $province = $address['state'] ?? 'ON';
            $postalCode = $address['zip'] ?? '';
            $listPrice = $listing['listPrice'] ?? 0;
            $originalPrice = $listing['originalPrice'] ?? null;
            $soldPrice = $listing['soldPrice'] ?? null;
            $propertyType = $details['propertyType'] ?? '';
            $propertySubType = $details['style'] ?? $propertyType;
            $bedrooms = ($details['numBedrooms'] ?? 0) + ($details['numBedroomsPlus'] ?? 0);
            $bathrooms = ($details['numBathrooms'] ?? 0) + ($details['numBathroomsPlus'] ?? 0);
            $yearBuilt = $details['yearBuilt'] ?? null;
            $garageSpaces = $details['numGarageSpaces'] ?? 0;
            $description = $details['description'] ?? '';
            $listDate = $listing['listDate'] ?? null;
            $daysOnMarket = $listing['daysOnMarket'] ?? $listing['simpleDaysOnMarket'] ?? null;
            $status = $this->mapRepliersStatusReadable($listing['status'] ?? 'A', $listing['lastStatus'] ?? '');
            $mlsStatus = $listing['lastStatus'] ?? '';
            $latitude = $map['latitude'] ?? null;
            $longitude = $map['longitude'] ?? null;
            $officeName = $office['brokerageName'] ?? '';
            $virtualTour = $details['virtualTourUrl'] ?? $listing['virtualTourUrl'] ?? '';
        } else {
            // Old AMPRE flat format
            $listingKey = $listing['ListingKey'] ?? $listing['MLSNumber'] ?? '';
            $unitNumber = $listing['UnitNumber'] ?? '';
            $streetNumber = $listing['StreetNumber'] ?? '';
            $streetName = $listing['StreetName'] ?? '';
            $streetSuffix = $listing['StreetSuffix'] ?? '';
            $city = $listing['City'] ?? '';
            $province = $listing['StateOrProvince'] ?? 'ON';
            $postalCode = $listing['PostalCode'] ?? '';
            $listPrice = $listing['ListPrice'] ?? 0;
            $originalPrice = $listing['OriginalListPrice'] ?? null;
            $soldPrice = $listing['ClosePrice'] ?? null;
            $propertyType = $listing['PropertyType'] ?? '';
            $propertySubType = $listing['PropertySubType'] ?? $propertyType;
            $bedrooms = $listing['BedroomsTotal'] ?? 0;
            $bathrooms = $listing['BathroomsTotalInteger'] ?? 0;
            $yearBuilt = $listing['YearBuilt'] ?? null;
            $garageSpaces = $listing['GarageSpaces'] ?? 0;
            $description = $listing['PublicRemarks'] ?? '';
            $listDate = $listing['ListingContractDate'] ?? $listing['ModificationTimestamp'] ?? null;
            $daysOnMarket = $listing['DaysOnMarket'] ?? null;
            $status = $listing['StandardStatus'] ?? 'Active';
            $mlsStatus = $listing['MlsStatus'] ?? '';
            $latitude = $listing['Latitude'] ?? null;
            $longitude = $listing['Longitude'] ?? null;
            $officeName = $listing['ListOfficeName'] ?? '';
            $virtualTour = $listing['VirtualTourURLUnbranded'] ?? '';
        }

        return [
            'listingKey' => $listingKey,
            'ListingKey' => $listingKey,
            'address' => $unparsedAddress,
            'unitNumber' => $unitNumber,
            'UnitNumber' => $unitNumber,
            'streetNumber' => $streetNumber,
            'StreetNumber' => $streetNumber,
            'streetName' => $streetName,
            'StreetName' => $streetName,
            'streetSuffix' => $streetSuffix,
            'StreetSuffix' => $streetSuffix,
            'city' => $city,
            'province' => $province,
            'postalCode' => $postalCode,
            'price' => $listPrice,
            'listPrice' => $listPrice,
            'ListPrice' => $listPrice,
            'originalPrice' => $originalPrice,
            'OriginalListPrice' => $originalPrice,
            'soldPrice' => $soldPrice,
            'ClosePrice' => $soldPrice,
            'propertyType' => $propertyType,
            'PropertyType' => $propertyType,
            'propertySubType' => $propertySubType,
            'PropertySubType' => $propertySubType,
            'transactionType' => $transactionType,
            'bedrooms' => $bedrooms,
            'bedroomsTotal' => $bedrooms,
            'BedroomsTotal' => $bedrooms,
            'bathrooms' => $bathrooms,
            'bathroomsTotal' => $bathrooms,
            'BathroomsTotalInteger' => $bathrooms,
            'bathroomsFull' => $bathrooms,
            'bathroomsHalf' => 0,
            'livingArea' => $sqft,
            'lotSize' => null,
            'yearBuilt' => $yearBuilt,
            'parkingTotal' => $parking,
            'parkingSpaces' => $parking,
            'garageSpaces' => $garageSpaces,
            'description' => $description,
            'publicRemarks' => $description,
            'PublicRemarks' => $description,
            'features' => [],
            'appliances' => [],
            'heating' => [],
            'cooling' => [],
            'flooring' => [],
            'basement' => [],
            'listingDate' => $listDate,
            'ListingContractDate' => $listDate,
            'listingContractDate' => $listDate,
            'daysOnMarket' => $daysOnMarket,
            'DaysOnMarket' => $daysOnMarket,
            'status' => $status,
            'StandardStatus' => $status,
            'MlsStatus' => $mlsStatus,
            'mlsNumber' => $listingKey,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'listingOffice' => $officeName,
            'listOfficeName' => $officeName,
            'ListOfficeName' => $officeName,
            'listingAgent' => $listAgent,
            'listAgentFullName' => $listAgent,
            'ListAgentFullName' => $listAgent,
            'virtualTourUrl' => $virtualTour,
            'rooms' => $isRepliersFormat ? $this->formatRooms($listing) : [],
            'taxYear' => null,
            'taxAmount' => $taxAmount,
            'taxAnnualAmount' => $taxAmount,
            'associationFee' => $maintenanceFee,
            'associationFeeFrequency' => $details['maintenanceFeeFrequency'] ?? null,
            'LeaseTerm' => $details['leaseTerm'] ?? null,
            // Fields for PropertyGallery component
            'TransactionType' => $transactionType,
            'LivingAreaRange' => $sqft,
            'TaxAnnualAmount' => $taxAmount,
            'exposure' => $exposure,
            'Exposure' => $exposure,
            'ParkingTotal' => $parking,
            'AssociationFee' => $maintenanceFee,
            'AboveGradeFinishedArea' => $sqft,
            'BuildingAreaTotal' => $sqft,
            'GrossFloorArea' => $sqft,
            // Price history straight from the Repliers listing object.
            // Each entry typically has: mlsNumber, listPrice, listDate,
            // lastStatus, soldPrice, soldDate, daysOnMarket, type.
            // If Repliers returned an empty history array (most common —
            // history requires elevated API access), fall back to a single
            // synthetic entry built from the current listing fields so the
            // Price History section always has at least one row to render.
            'priceHistory' => $isRepliersFormat
                ? $this->buildPriceHistory($listing, $listingKey, $listPrice, $listDate, $soldPrice, $listing['soldDate'] ?? null, $mlsStatus, $daysOnMarket)
                : [],
            'PriceHistory' => $isRepliersFormat
                ? $this->buildPriceHistory($listing, $listingKey, $listPrice, $listDate, $soldPrice, $listing['soldDate'] ?? null, $mlsStatus, $daysOnMarket)
                : [],
        ];
    }

    /**
     * Build a normalized price history array.
     *
     * Strategy:
     * 1. If Repliers' `history` field is populated on the listing, use it.
     * 2. Otherwise query Repliers for all prior listings at the same
     *    streetNumber + streetName + unitNumber (status=U for sold/leased/
     *    expired/terminated) — this is how Repliers actually represents
     *    historical relistings.
     * 3. Always merge in the current listing as one entry so the row for
     *    the active listing is part of the timeline.
     * 4. Sort newest-first by soldDate / listDate.
     */
    private function buildPriceHistory(array $listing, $mlsNumber, $listPrice, $listDate, $soldPrice, $soldDate, $lastStatus, $daysOnMarket): array
    {
        $entries = [];
        $seen = [];

        // 1. Repliers-provided history (if any)
        $repliersHistory = $listing['history'] ?? $listing['historyTransactions'] ?? [];
        if (is_array($repliersHistory)) {
            foreach ($repliersHistory as $h) {
                $key = ($h['mlsNumber'] ?? '') . '|' . ($h['listDate'] ?? '');
                if (isset($seen[$key])) continue;
                $seen[$key] = true;
                $entries[] = $h;
            }
        }

        // 2. Look up prior listings at the same address+unit. Used to skip
        // the property `class` filter and only search status `U` (sold/
        // expired) — that missed history for non-condo properties and
        // active relistings at the same address. Now we run two queries
        // (sold/expired, then active) without a class filter so every
        // listing type gets its full history.
        $address = $listing['address'] ?? [];
        $streetNumber = $address['streetNumber'] ?? null;
        $streetName = $address['streetName'] ?? null;
        $unitNumber = $address['unitNumber'] ?? null;

        if ($streetNumber && $streetName) {
            try {
                $api = app(\App\Services\RepliersApiService::class);
                $baseParams = [
                    'streetNumber' => (string) $streetNumber,
                    'streetName' => $streetName,
                    'resultsPerPage' => 30,
                    'sortBy' => 'updatedOnDesc',
                ];
                if ($unitNumber !== null && $unitNumber !== '') {
                    $baseParams['unitNumber'] = (string) $unitNumber;
                }

                $absorb = function (array $listings) use (&$entries, &$seen) {
                    foreach ($listings as $h) {
                        $key = ($h['mlsNumber'] ?? '') . '|' . ($h['listDate'] ?? '');
                        if (isset($seen[$key])) continue;
                        $seen[$key] = true;

                        $entries[] = [
                            'mlsNumber' => $h['mlsNumber'] ?? null,
                            'listPrice' => $h['listPrice'] ?? null,
                            'listDate' => $h['listDate'] ?? null,
                            'soldPrice' => $h['soldPrice'] ?? null,
                            'soldDate' => $h['soldDate'] ?? null,
                            'lastStatus' => $h['lastStatus'] ?? null,
                            'daysOnMarket' => $h['daysOnMarket'] ?? $h['simpleDaysOnMarket'] ?? null,
                            'type' => $h['type'] ?? null,
                        ];
                    }
                };

                // Sold/leased/expired/terminated history
                $unavailable = $api->searchListings($baseParams + ['status' => 'U']);
                $absorb($unavailable['listings'] ?? []);

                // Currently-active listings at the same address (excludes
                // the current listing in the React layer via mlsNumber).
                $active = $api->searchListings($baseParams + ['status' => 'A']);
                $absorb($active['listings'] ?? []);

                // If unit-specific search came up empty AND we filtered by
                // unit, retry without the unit filter — some MLS feeds
                // record the unit on the active listing but not on the
                // historical ones, so a unit-strict query drops them.
                if (count($entries) <= count($repliersHistory)
                    && isset($baseParams['unitNumber'])) {
                    unset($baseParams['unitNumber']);
                    $unavailableLoose = $api->searchListings($baseParams + ['status' => 'U']);
                    $absorb($unavailableLoose['listings'] ?? []);
                }
            } catch (\Throwable $e) {
                \Log::warning('priceHistory address-lookup failed', ['error' => $e->getMessage()]);
            }
        }

        // 3. Always include the current listing as an entry. The Repliers
        // `listDate` field is not always populated (notably for off-market or
        // freshly imported listings); without a date the React filter drops
        // the row and the section shows "No price history available". Fall
        // back through every other timestamp Repliers gives us so the current
        // listing is always represented.
        $effectiveListDate = $listDate
            ?: ($listing['timestamps']['listingEntryDate'] ?? null)
            ?: ($listing['timestamps']['listingUpdated'] ?? null)
            ?: ($listing['originalEntryTimestamp'] ?? null)
            ?: ($listing['updatedOn'] ?? null)
            ?: ($listing['createdOn'] ?? null);

        $currentKey = $mlsNumber . '|' . $effectiveListDate;
        if (!isset($seen[$currentKey]) && ($listPrice || $soldPrice || $effectiveListDate)) {
            $entries[] = [
                'mlsNumber' => $mlsNumber,
                'listPrice' => $listPrice ?: null,
                'listDate' => $effectiveListDate ?: null,
                'soldPrice' => $soldPrice ?: null,
                'soldDate' => $soldDate ?: null,
                'lastStatus' => $lastStatus ?: 'A',
                'daysOnMarket' => $daysOnMarket ?: null,
                'type' => $listing['type'] ?? null,
            ];
        }

        // 4. Sort newest-first
        usort($entries, function ($a, $b) {
            $da = strtotime($a['soldDate'] ?? $a['listDate'] ?? 0);
            $db = strtotime($b['soldDate'] ?? $b['listDate'] ?? 0);
            return $db - $da;
        });

        return $entries;
    }

    /**
     * Format Repliers listing data for list/search results
     * Used by getNearbyListings, getSimilarListings, getComparableSales
     */
    private function formatRepliersListingData(array $listing, RepliersApiService $repliersApi): array
    {
        $formatted = $this->formatRepliersPropertyData($listing);

        // Add image URLs from Repliers CDN
        $imageUrls = $repliersApi->getListingImageUrls($listing);
        $imageUrl = !empty($imageUrls) ? $imageUrls[0] : null;

        $formatted['MediaURL'] = $imageUrl;
        $formatted['image'] = $imageUrl;
        $formatted['images'] = array_map(fn($url) => ['MediaURL' => $url], $imageUrls);

        return $formatted;
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

    /**
     * Format room data from listing
     */
    private function formatRooms($listing): array
    {
        $rooms = [];

        // Repliers format: rooms array with description, length, width, features
        if (isset($listing['rooms']) && is_array($listing['rooms'])) {
            foreach ($listing['rooms'] as $room) {
                $length = $room['length'] ?? '';
                $width = $room['width'] ?? '';
                $dimensions = ($length && $width) ? "{$length} x {$width} m" : ($room['dimensions'] ?? $room['RoomDimensions'] ?? '');

                $rooms[] = [
                    'type' => $room['description'] ?? $room['type'] ?? $room['RoomType'] ?? '',
                    'name' => $room['description'] ?? $room['type'] ?? $room['RoomType'] ?? '',
                    'level' => $room['level'] ?? $room['RoomLevel'] ?? '',
                    'length' => $length,
                    'width' => $width,
                    'dimensions' => $dimensions,
                    'features' => $room['features'] ?? $room['RoomFeatures'] ?? '',
                ];
            }
        }
        // Legacy AMPRE format
        elseif (isset($listing['Rooms']) && is_array($listing['Rooms'])) {
            foreach ($listing['Rooms'] as $room) {
                $rooms[] = [
                    'type' => $room['RoomType'] ?? '',
                    'name' => $room['RoomType'] ?? '',
                    'level' => $room['RoomLevel'] ?? '',
                    'length' => $room['RoomLength'] ?? '',
                    'width' => $room['RoomWidth'] ?? '',
                    'dimensions' => $room['RoomDimensions'] ?? '',
                    'features' => $room['RoomFeatures'] ?? '',
                ];
            }
        }

        return $rooms;
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
     * Fetch real MLS images for a backend property by MLS number
     */
    private function fetchMlsImagesForBackendProperty(string $mlsNumber): array
    {
        try {
            // First check if we have cached images in mls_properties table
            $mlsProperty = \App\Models\MLSProperty::where('mls_id', $mlsNumber)
                ->orWhere('mls_number', $mlsNumber)
                ->first();

            if ($mlsProperty && !empty($mlsProperty->image_urls)) {
                \Log::info('Using cached MLS images for backend property', [
                    'mls_number' => $mlsNumber,
                    'image_count' => count($mlsProperty->image_urls)
                ]);
                return $mlsProperty->image_urls;
            }

            // If not in cache, try to fetch from Repliers API
            $repliersApi = app(\App\Services\RepliersApiService::class);
            $listing = $repliersApi->getListingByMlsNumber($mlsNumber);
            if ($listing && !empty($listing['images'])) {
                $images = $repliersApi->getListingImageUrls($listing);

                \Log::info('Fetched MLS images from Repliers API for backend property', [
                    'mls_number' => $mlsNumber,
                    'image_count' => count($images)
                ]);
                return array_filter($images);
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to fetch MLS images for backend property', [
                'mls_number' => $mlsNumber,
                'error' => $e->getMessage()
            ]);
        }

        return [];
    }

    /**
     * Display the building detail page
     */
    public function buildingDetail($cityOrSlug, $street = null, $buildingSlug = null)
    {
        // Normalize args across the three routes that hit this method:
        //   /building/{buildingSlug}                 (1 segment)
        //   /{city}/{buildingSlug}                   (2 segments)
        //   /{city}/{street}/{buildingSlug}          (3 segments)
        // Laravel passes route params positionally, so without normalization
        // the 2-segment case puts the slug in $street and leaves $buildingSlug
        // null — which then triggers the wrong fallback ("toronto" matched by
        // name LIKE %toronto% returns NOBU).
        if ($buildingSlug === null) {
            if ($street !== null) {
                // 2 segments: $cityOrSlug = city, $street = the building slug
                $buildingSlug = $street;
                $street = null;
            } else {
                // 1 segment: $cityOrSlug is the slug
                $buildingSlug = $cityOrSlug;
            }
        }
        // else: 3 segments — all positions already correct
        
        $building = null;
        
        // Try to find building by slug first
        $building = Building::with(['developer', 'amenities', 'maintenanceFeeAmenities', 'properties' => function($query) {
            $query->where('status', 'active')
                  ->orderBy('created_at', 'desc')
                  ->limit(10);
        }])->where('slug', $buildingSlug)->first();
        
        // If not found by slug, try to find by ID (for backwards compatibility)
        if (!$building) {
            $buildingId = $this->extractBuildingIdFromSlug($buildingSlug);
            if ($this->isValidUuid($buildingId)) {
                $building = Building::with(['developer', 'amenities', 'maintenanceFeeAmenities', 'properties' => function($query) {
                    $query->where('status', 'active')
                          ->orderBy('created_at', 'desc')
                          ->limit(10);
                }])->find($buildingId);
            }
        }
        
        // If still not found, try to find by name (or by rich slug
        // matching name+addresses, e.g. "nobu-residences-15-mercer-st-35-mercer-st").
        if (!$building) {
            $nameFromSlug = str_replace('-', ' ', $buildingSlug);

            $building = Building::with(['developer', 'amenities', 'maintenanceFeeAmenities', 'properties' => function($query) {
                $query->where('status', 'active')
                      ->orderBy('created_at', 'desc')
                      ->limit(10);
            }])->where(function($query) use ($nameFromSlug, $buildingSlug) {
                $query->whereRaw('LOWER(name) = ?', [strtolower($nameFromSlug)])
                      ->orWhereRaw('LOWER(name) LIKE ?', ['%' . strtolower($nameFromSlug) . '%'])
                      ->orWhereRaw('LOWER(REPLACE(name, " ", "-")) = ?', [strtolower($buildingSlug)]);
            })->first();

            // Rich-slug match: try matching the leading name slug only
            // (everything before the first numeric token in the slug).
            if (!$building && preg_match('/^([a-z\-]+?)-\d/', $buildingSlug, $m)) {
                $namePrefix = str_replace('-', ' ', $m[1]);
                $candidates = Building::with(['developer', 'amenities', 'maintenanceFeeAmenities'])
                    ->whereRaw('LOWER(name) LIKE ?', [strtolower($namePrefix) . '%'])
                    ->get();
                foreach ($candidates as $cand) {
                    // Build the same rich slug from the candidate and compare
                    $candParts = [\Str::slug($cand->name)];
                    if (!empty($cand->street_address_1)) $candParts[] = \Str::slug($cand->street_address_1);
                    if (!empty($cand->street_address_2)) $candParts[] = \Str::slug($cand->street_address_2);
                    if (count($candParts) === 1 && !empty($cand->address)) {
                        foreach (array_filter(array_map('trim', explode(',', $cand->address))) as $part) {
                            $candParts[] = \Str::slug($part);
                        }
                    }
                    $candSlug = implode('-', array_filter($candParts));
                    if ($candSlug === $buildingSlug) {
                        $building = $cand;
                        break;
                    }
                }
                // Looser fallback: just match the leading name prefix
                if (!$building && $candidates->count() > 0) {
                    $building = $candidates->first();
                }
            }
        }
        
        // If building not found, return 404
        if (!$building) {
            abort(404, 'Building not found');
        }
        
        // Get building display data
        $buildingData = $building->getDisplayData();

        // Format properties for display
        if ($building->properties) {
            $buildingData['properties'] = $building->properties->map(function($property) {
                return [
                    'id' => $property->id ?? null,
                    'title' => $property->title ?? '',
                    'price' => $property->price ?? 0,
                    'bedrooms' => $property->bedrooms ?? 0,
                    'bathrooms' => $property->bathrooms ?? 0,
                    'area' => $property->area ?? 0,
                    'images' => $property->images ?? [],
                    'status' => $property->status ?? 'active',
                ];
            })->toArray();
        }

        // Fetch MLS properties matching building's street addresses
        $mlsPropertiesForSale = [];
        $mlsPropertiesForRent = [];

        // Extract street addresses and street name from building
        $streetAddresses = [];
        $streetName = null;

        // Parse address parts. The previous /^(\d+\s+[A-Za-z]+)/i regex only
        // captured the FIRST word of the street name, so multi-word streets
        // like "Lake Shore Blvd W" became just "Lake" — and Repliers stores
        // streetName as "Lake Shore" (without suffix), so the lookup returned 0.
        $parseAddress = function (string $a): ?string {
            if (!preg_match('/^(\d+)\s+(.+)$/u', trim($a), $m)) return null;
            $rest = preg_replace('/\s+(?:W|E|N|S|West|East|North|South|NE|NW|SE|SW)\.?$/i', '', $m[2]);
            $rest = preg_replace('/\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Crescent|Cres|Court|Ct|Place|Pl|Park|Parkway|Pkwy|Square|Sq|Terrace|Ter|Circle|Cir|Trail|Tr|Gate|Hill|Heights|Hts|Mews|Walk|Common|Commons)\.?$/i', '', $rest);
            $name = trim($rest);
            return $name === '' ? null : $m[1] . ' ' . $name;
        };

        if (!empty($building->street_address_1) && ($p = $parseAddress($building->street_address_1))) {
            $streetAddresses[] = $p;
        }
        if (!empty($building->street_address_2) && ($p = $parseAddress($building->street_address_2))) {
            $streetAddresses[] = $p;
        }

        // Fall back to the main address field (e.g. "15 Mercer St & 35 Mercer"
        // or "155 Dalhousie Street").
        if (empty($streetAddresses) && !empty($building->address)) {
            $parts = array_map('trim', preg_split('/\s*[,&]\s*/', $building->address));
            foreach ($parts as $part) {
                if ($p = $parseAddress($part)) {
                    $streetAddresses[] = $p;
                }
            }
        }

        // Just the street name (no number) — used as a broader fallback elsewhere.
        if (!empty($building->address) && ($p = $parseAddress($building->address))) {
            // $p is "<num> <name>" — strip the leading number
            $streetName = preg_replace('/^\d+\s+/', '', $p);
        }

        // Fetch live listings for this building from the Repliers API. The
        // local mls_properties table is often empty/stale, so the previous DB
        // query returned nothing — leaving the For Sale / For Rent panels
        // empty on the building page.
        $mlsPropertiesForSale = $this->fetchBuildingListingsFromRepliers($streetAddresses, 'sale', $building);
        $mlsPropertiesForRent = $this->fetchBuildingListingsFromRepliers($streetAddresses, 'lease', $building);

        // Aggregated price history across every unit in this building's
        // streets — used by the Price History section on the building page.
        $buildingData['priceHistory'] = $this->fetchBuildingPriceHistory($streetAddresses);

        // Add MLS properties to building data
        $buildingData['mls_properties_for_sale'] = $mlsPropertiesForSale;
        $buildingData['mls_properties_for_rent'] = $mlsPropertiesForRent;

        return Inertia::render('BuildingDetail', array_merge($this->getWebsiteSettings(), [
            'title' => $building->name,
            'buildingId' => $building->id,
            'buildingSlug' => $building->slug,
            'buildingData' => $buildingData
        ]));
    }
    
    /**
     * Full price history page for a building.
     * Route: /{city}/{buildingSlug}/price-history
     */
    public function buildingPriceHistory(Request $request, $city, $buildingSlug)
    {
        // Reuse the same lookup buildingDetail uses
        $building = Building::where('slug', $buildingSlug)->first();

        if (!$building) {
            $buildingId = $this->extractBuildingIdFromSlug($buildingSlug);
            if ($this->isValidUuid($buildingId)) {
                $building = Building::find($buildingId);
            }
        }

        if (!$building && preg_match('/^([a-z\-]+?)-\d/', $buildingSlug, $m)) {
            $namePrefix = str_replace('-', ' ', $m[1]);
            $candidates = Building::whereRaw('LOWER(name) LIKE ?', [strtolower($namePrefix) . '%'])->get();
            foreach ($candidates as $cand) {
                $candParts = [\Str::slug($cand->name)];
                if (!empty($cand->street_address_1)) $candParts[] = \Str::slug($cand->street_address_1);
                if (!empty($cand->street_address_2)) $candParts[] = \Str::slug($cand->street_address_2);
                if (count($candParts) === 1 && !empty($cand->address)) {
                    foreach (array_filter(array_map('trim', preg_split('/\s*[,&]\s*/', $cand->address))) as $part) {
                        $candParts[] = \Str::slug($part);
                    }
                }
                if (implode('-', array_filter($candParts)) === $buildingSlug) {
                    $building = $cand;
                    break;
                }
            }
            if (!$building && $candidates->count() > 0) {
                $building = $candidates->first();
            }
        }

        if (!$building) {
            abort(404, 'Building not found');
        }

        // Build the street address list (15 Mercer + 35 Mercer for NOBU)
        $streetAddresses = [];
        if (!empty($building->street_address_1) && preg_match('/^(\d+\s+[A-Za-z]+)/i', trim($building->street_address_1), $m1)) {
            $streetAddresses[] = $m1[1];
        }
        if (!empty($building->street_address_2) && preg_match('/^(\d+\s+[A-Za-z]+)/i', trim($building->street_address_2), $m2)) {
            $streetAddresses[] = $m2[1];
        }
        if (empty($streetAddresses) && !empty($building->address)) {
            foreach (preg_split('/\s*[,&]\s*/', $building->address) as $part) {
                if (preg_match('/^(\d+\s+[A-Za-z]+)/i', trim($part), $mP)) {
                    $streetAddresses[] = $mP[1];
                }
            }
        }
        $streetAddresses = array_values(array_unique($streetAddresses));

        $priceHistory = $this->fetchBuildingPriceHistory($streetAddresses);

        return Inertia::render('BuildingPriceHistory', array_merge($this->getWebsiteSettings(), [
            'auth' => ['user' => $request->user()],
            'title' => 'Price History — ' . $building->name,
            'building' => [
                'id' => $building->id,
                'name' => $building->name,
                'slug' => $building->slug,
                'address' => $building->address,
                'street_address_1' => $building->street_address_1,
                'street_address_2' => $building->street_address_2,
                'city' => $building->city,
                'neighbourhood' => $building->neighbourhood,
                'sub_neighbourhood' => $building->sub_neighbourhood,
                'main_image' => $building->main_image,
            ],
            'priceHistory' => $priceHistory,
        ]));
    }

    /**
     * Price history search landing page.
     * Route: /price-history
     *
     * Lets the user search by address or MLS number; on selection the
     * client navigates to /price-history/{listingKey}.
     */
    public function priceHistorySearch(Request $request)
    {
        return Inertia::render('PriceHistorySearch', array_merge($this->getWebsiteSettings(), [
            'auth' => ['user' => $request->user()],
            'title' => 'Price History Search',
        ]));
    }

    /**
     * Per-listing full price history page.
     * Route: /price-history/{listingKey}
     *
     * Used as the universal target for the "View full price history" button
     * on every property detail page — works for any listing regardless of
     * whether it's been matched to a building.
     */
    public function propertyPriceHistory(Request $request, $listingKey)
    {
        // Same SEO-URL stripping the propertyDetail route does.
        if (preg_match('/^unit-[A-Za-z0-9]+-([A-Z]\d+)$/i', $listingKey, $matches)) {
            $listingKey = $matches[1];
        }

        $repliersApi = app(\App\Services\RepliersApiService::class);
        $listing = $repliersApi->getListingByMlsNumber($listingKey);

        if (!$listing) {
            abort(404, 'Listing not found');
        }

        $address = $listing['address'] ?? [];
        $details = $listing['details'] ?? [];

        $listPrice = (float) ($listing['listPrice'] ?? 0);
        $soldPrice = isset($listing['soldPrice']) ? (float) $listing['soldPrice'] : null;
        $listDate = $listing['listDate'] ?? null;
        $soldDate = $listing['soldDate'] ?? null;
        $lastStatus = $listing['lastStatus'] ?? '';
        $daysOnMarket = $listing['daysOnMarket'] ?? $listing['simpleDaysOnMarket'] ?? null;

        $priceHistory = $this->buildPriceHistory(
            $listing,
            $listingKey,
            $listPrice,
            $listDate,
            $soldPrice,
            $soldDate,
            $lastStatus,
            $daysOnMarket
        );

        $images = $listing['images'] ?? [];
        $imageUrls = array_map(fn($img) => $repliersApi->getImageUrl($img), $images);

        $unitNumber = $address['unitNumber'] ?? '';
        $streetNumber = $address['streetNumber'] ?? '';
        $streetName = $address['streetName'] ?? '';
        $streetSuffix = $address['streetSuffix'] ?? '';
        $unparsedAddress = trim(implode(' ', array_filter([$streetNumber, $streetName, $streetSuffix])));
        $title = trim(($unitNumber ? "$unitNumber - " : '') . $unparsedAddress) ?: 'Listing';

        return Inertia::render('PropertyPriceHistory', array_merge($this->getWebsiteSettings(), [
            'auth' => ['user' => $request->user()],
            'title' => 'Price History — ' . $title,
            'listingKey' => $listingKey,
            'property' => [
                'listingKey' => $listingKey,
                'address' => $unparsedAddress,
                'unitNumber' => $unitNumber,
                'streetNumber' => $streetNumber,
                'streetName' => $streetName,
                'streetSuffix' => $streetSuffix,
                'city' => $address['city'] ?? '',
                'imageUrl' => $imageUrls[0] ?? null,
                'images' => $imageUrls,
            ],
            'priceHistory' => $priceHistory,
        ]));
    }

    /**
     * Fetch aggregated price history for a building — every sold/leased/
     * expired/terminated listing across all of the building's streets.
     * Each entry has: mlsNumber, listPrice, listDate, soldPrice, soldDate,
     * lastStatus, daysOnMarket, type, address, image.
     */
    private function fetchBuildingPriceHistory(array $streetAddresses): array
    {
        if (empty($streetAddresses)) return [];

        try {
            $api = app(\App\Services\RepliersApiService::class);
            $entries = [];
            $seen = [];

            foreach ($streetAddresses as $addr) {
                if (!preg_match('/^(\d+)\s+(.+)$/', trim($addr), $m)) continue;
                $streetNumber = $m[1];
                $streetName = $m[2];

                $res = $api->searchListings([
                    'class' => 'condoProperty',
                    'streetNumber' => $streetNumber,
                    'streetName' => $streetName,
                    'status' => 'U',
                    'pageNum' => 1,
                    'resultsPerPage' => 100,
                    'sortBy' => 'updatedOnDesc',
                ]);

                foreach (($res['listings'] ?? []) as $l) {
                    $key = ($l['mlsNumber'] ?? '') . '|' . ($l['listDate'] ?? '');
                    if (isset($seen[$key])) continue;
                    $seen[$key] = true;

                    $address = $l['address'] ?? [];
                    $images = $l['images'] ?? [];
                    $imageUrl = !empty($images[0])
                        ? $api->getImageUrl($images[0])
                        : null;

                    $unit = $address['unitNumber'] ?? '';
                    $street = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
                    $fullAddress = $unit ? ($unit . ' - ' . $street) : $street;

                    $details = $l['details'] ?? [];
                    $entries[] = [
                        'mlsNumber' => $l['mlsNumber'] ?? null,
                        'listPrice' => $l['listPrice'] ?? null,
                        'listDate' => $l['listDate'] ?? null,
                        'soldPrice' => $l['soldPrice'] ?? null,
                        'soldDate' => $l['soldDate'] ?? null,
                        'lastStatus' => $l['lastStatus'] ?? null,
                        'daysOnMarket' => $l['daysOnMarket'] ?? $l['simpleDaysOnMarket'] ?? null,
                        'type' => $l['type'] ?? null,
                        'unitNumber' => $unit,
                        'address' => $fullAddress,
                        'image' => $imageUrl,
                        'bedrooms' => $details['numBedrooms'] ?? null,
                        'bedroomsPlus' => $details['numBedroomsPlus'] ?? null,
                        'bathrooms' => isset($details['numBathrooms']) ? ($details['numBathrooms'] + ($details['numBathroomsPlus'] ?? 0)) : null,
                        'sqft' => $details['sqft'] ?? null,
                        'parking' => $details['numParkingSpaces'] ?? null,
                    ];
                }
            }

            // Sort newest-first by sold/list date
            usort($entries, function ($a, $b) {
                $da = strtotime($a['soldDate'] ?? $a['listDate'] ?? 0);
                $db = strtotime($b['soldDate'] ?? $b['listDate'] ?? 0);
                return $db - $da;
            });

            return $entries;
        } catch (\Throwable $e) {
            \Log::warning('fetchBuildingPriceHistory failed', [
                'error' => $e->getMessage(),
                'addresses' => $streetAddresses,
            ]);
            return [];
        }
    }

    /**
     * Fetch active listings for a building from the Repliers API.
     * $streetAddresses is an array like ["15 Mercer", "35 Mercer"].
     * $type is "sale" or "lease".
     */
    private function fetchBuildingListingsFromRepliers(array $streetAddresses, string $type, $building = null): array
    {
        if (empty($streetAddresses)) {
            return [];
        }

        // Pre-compute building name + neighbourhood string once
        $buildingName = $building->name ?? null;
        $buildingNeighbourhood = null;
        if ($building) {
            $nbParts = array_filter([
                $building->sub_neighbourhood ?? null,
                $building->neighbourhood ?? null,
                $building->city ?? null,
            ]);
            $buildingNeighbourhood = implode(', ', $nbParts) ?: null;
        }
        $buildingArr = $building ? [
            'id' => $building->id,
            'name' => $building->name,
            'slug' => $building->slug,
            'address' => $building->address,
            'street_address_1' => $building->street_address_1,
            'street_address_2' => $building->street_address_2,
            'city' => $building->city,
            'neighbourhood' => $building->neighbourhood,
            'sub_neighbourhood' => $building->sub_neighbourhood,
        ] : null;

        try {
            $repliersApi = app(\App\Services\RepliersApiService::class);
            $results = [];
            $seen = [];

            foreach ($streetAddresses as $addr) {
                if (!preg_match('/^(\d+)\s+(.+)$/', trim($addr), $m)) {
                    continue;
                }
                $streetNumber = $m[1];
                $streetName = $m[2];

                $apiParams = [
                    'class' => 'condoProperty',
                    'status' => 'A',
                    'type' => $type,
                    'streetNumber' => $streetNumber,
                    'streetName' => $streetName,
                    'pageNum' => 1,
                    'resultsPerPage' => 50,
                ];

                $response = $repliersApi->searchListings($apiParams);
                $listings = $response['listings'] ?? [];

                foreach ($listings as $listing) {
                    $mlsNumber = $listing['mlsNumber'] ?? null;
                    if (!$mlsNumber || isset($seen[$mlsNumber])) {
                        continue;
                    }
                    $seen[$mlsNumber] = true;

                    $address = $listing['address'] ?? [];
                    $details = $listing['details'] ?? [];
                    $map = $listing['map'] ?? [];
                    $images = $listing['images'] ?? [];

                    $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
                    if (!empty($address['unitNumber'])) {
                        $fullAddress = $address['unitNumber'] . ' - ' . $fullAddress;
                    }

                    $imageUrls = array_map(fn($img) => $repliersApi->getImageUrl($img), $images);
                    $mediaUrl = !empty($imageUrls) ? $imageUrls[0] : null;

                    $isLease = $type === 'lease';
                    $transactionDisplay = $isLease ? 'For Rent' : 'For Sale';

                    $results[] = [
                        'ListingKey' => $mlsNumber,
                        'listingKey' => $mlsNumber,
                        'ListPrice' => (float) ($listing['listPrice'] ?? 0),
                        'price' => (float) ($listing['listPrice'] ?? 0),
                        'UnparsedAddress' => $fullAddress,
                        'address' => $fullAddress,
                        'StreetNumber' => $address['streetNumber'] ?? '',
                        'streetNumber' => $address['streetNumber'] ?? '',
                        'StreetName' => $address['streetName'] ?? '',
                        'streetName' => $address['streetName'] ?? '',
                        'StreetSuffix' => $address['streetSuffix'] ?? '',
                        'streetSuffix' => $address['streetSuffix'] ?? '',
                        'UnitNumber' => $address['unitNumber'] ?? '',
                        'unitNumber' => $address['unitNumber'] ?? '',
                        'BedroomsTotal' => (int) ($details['numBedrooms'] ?? 0),
                        'bedroomsTotal' => (int) ($details['numBedrooms'] ?? 0),
                        'bedrooms' => (int) ($details['numBedrooms'] ?? 0),
                        'BathroomsTotalInteger' => (int) (($details['numBathrooms'] ?? 0) + ($details['numBathroomsPlus'] ?? 0)),
                        'bathroomsTotalInteger' => (int) (($details['numBathrooms'] ?? 0) + ($details['numBathroomsPlus'] ?? 0)),
                        'bathrooms' => (int) (($details['numBathrooms'] ?? 0) + ($details['numBathroomsPlus'] ?? 0)),
                        'AboveGradeFinishedArea' => $details['sqft'] ?? 0,
                        'BuildingAreaTotal' => $details['sqft'] ?? '',
                        'buildingAreaTotal' => $details['sqft'] ?? '',
                        'PropertySubType' => $details['style'] ?? $details['propertyType'] ?? 'Condo Apartment',
                        'propertyType' => $details['style'] ?? $details['propertyType'] ?? 'Condo Apartment',
                        'TransactionType' => $transactionDisplay,
                        'transactionType' => $isLease ? 'Rent' : 'Sale',
                        'isRental' => $isLease,
                        'City' => $address['city'] ?? '',
                        'city' => $address['city'] ?? '',
                        'Latitude' => $map['latitude'] ?? '',
                        'Longitude' => $map['longitude'] ?? '',
                        'MediaURL' => $mediaUrl,
                        'imageUrl' => $mediaUrl,
                        'Images' => array_map(fn($url) => ['MediaURL' => $url], $imageUrls),
                        'images' => $imageUrls,
                        'has_images' => !empty($imageUrls),
                        'source' => 'repliers',
                        '_source' => 'repliers_api',
                        'building_name' => $buildingName,
                        'buildingName' => $buildingName,
                        'building_neighbourhood' => $buildingNeighbourhood,
                        'buildingNeighbourhood' => $buildingNeighbourhood,
                        'building' => $buildingArr,
                    ];
                }
            }

            return $results;
        } catch (\Throwable $e) {
            \Log::warning('fetchBuildingListingsFromRepliers failed', [
                'error' => $e->getMessage(),
                'addresses' => $streetAddresses,
                'type' => $type,
            ]);
            return [];
        }
    }

    /**
     * Display the school detail page
     * Handles both numeric IDs (from database) and Google Place IDs
     */
    public function schoolDetail($placeId, $schoolName = null)
    {
        $schoolData = null;
        $displayName = 'School Detail';

        // Check if this is a numeric ID (database school)
        if (is_numeric($placeId)) {
            $school = \App\Models\School::active()->find($placeId);

            if ($school) {
                $schoolData = $school->getDisplayData();
                $displayName = $school->name;
                
                // If school name is not in URL, redirect to include it
                if (!$schoolName) {
                    $slugifiedName = \Illuminate\Support\Str::slug($school->name);
                    return redirect()->route('school-detail', [
                        'placeId' => $placeId,
                        'schoolName' => $slugifiedName
                    ]);
                }
            }
        } else {
            // This is a Google Place ID - fetch from Google Places API
            $googlePlacesService = new \App\Services\GooglePlacesService();
            $schoolDetails = $googlePlacesService->getSchoolDetails($placeId);

            // Log for debugging
            \Log::info('Fetching school details for Place ID: ' . $placeId, [
                'has_details' => !empty($schoolDetails),
                'details' => $schoolDetails ? 'Found' : 'Not found'
            ]);

            if ($schoolDetails) {
                // Format Google Places data to match our school data structure
                $schoolData = [
                    'id' => $placeId,
                    'place_id' => $placeId,
                    'name' => $schoolDetails['name'] ?? 'School',
                    'address' => $schoolDetails['formatted_address'] ?? '',
                    'phone' => $schoolDetails['formatted_phone_number'] ?? null,
                    'website_url' => $schoolDetails['website'] ?? null,
                    'rating' => isset($schoolDetails['rating']) ? round($schoolDetails['rating'] * 2, 1) : null,
                    'user_ratings_total' => $schoolDetails['user_ratings_total'] ?? 0,
                    'latitude' => $schoolDetails['geometry']['location']['lat'] ?? null,
                    'longitude' => $schoolDetails['geometry']['location']['lng'] ?? null,
                    'opening_hours' => $schoolDetails['opening_hours']['weekday_text'] ?? [],
                    'photos' => isset($schoolDetails['photos']) ? array_map(function($photo) {
                        return [
                            'photo_reference' => $photo['photo_reference'] ?? null,
                            'width' => $photo['width'] ?? null,
                            'height' => $photo['height'] ?? null
                        ];
                    }, $schoolDetails['photos']) : [],
                    'reviews' => isset($schoolDetails['reviews']) ? array_map(function($review) {
                        return [
                            'author_name' => $review['author_name'] ?? 'Anonymous',
                            'rating' => $review['rating'] ?? null,
                            'text' => $review['text'] ?? '',
                            'time' => $review['time'] ?? null,
                            'relative_time_description' => $review['relative_time_description'] ?? ''
                        ];
                    }, $schoolDetails['reviews']) : [],
                    'source' => 'google_places'
                ];

                $displayName = $schoolData['name'];
                
                // If school name is not in URL, redirect to include it
                if (!$schoolName && isset($schoolData['name'])) {
                    $slugifiedName = \Illuminate\Support\Str::slug($schoolData['name']);
                    return redirect()->route('school-detail', [
                        'placeId' => $placeId,
                        'schoolName' => $slugifiedName
                    ]);
                }
            }
        }

        // If school not found, return 404
        if (!$schoolData) {
            abort(404, 'School not found');
        }

        return Inertia::render('SchoolDetail', array_merge($this->getWebsiteSettings(), [
            'title' => $displayName,
            'schoolId' => $placeId,
            'placeId' => $placeId,
            'schoolName' => $schoolName,
            'schoolData' => $schoolData
        ]));
    }
    
    /**
     * Display the school detail page by slug
     */
    public function schoolDetailBySlug($schoolSlug)
    {
        // First try to find by slug in database
        $school = \App\Models\School::active()->where('slug', $schoolSlug)->first();

        $schoolData = null;

        if ($school) {
            $schoolData = $school->getDisplayData();
        } else {
            // If not found in database, try to fetch from Google Places API
            // by searching for schools with matching name
            try {
                $googlePlacesService = app(\App\Services\GooglePlacesService::class);

                // Convert slug back to potential school name
                $potentialName = str_replace('-', ' ', $schoolSlug);

                // Search for schools with this name near Toronto
                $searchResults = $googlePlacesService->searchSchools($potentialName, [
                    'lat' => 43.6532,
                    'lng' => -79.3832
                ], 50000); // 50km radius

                // Find exact or close match
                if (!empty($searchResults)) {
                    foreach ($searchResults as $result) {
                        $resultSlug = \Illuminate\Support\Str::slug($result['name']);
                        if ($resultSlug === $schoolSlug) {
                            // Found exact match - fetch full details
                            $details = $googlePlacesService->getSchoolDetails($result['place_id']);
                            if ($details) {
                                // Format the Google Places data to match our expected structure
                                $schoolData = [
                                    'id' => $result['place_id'],
                                    'name' => $details['name'] ?? $result['name'],
                                    'slug' => $schoolSlug,
                                    'address' => $details['formatted_address'] ?? $result['address'],
                                    'phone' => $details['formatted_phone_number'] ?? null,
                                    'website' => $details['website'] ?? null,
                                    'website_url' => $details['website'] ?? null,
                                    'rating' => $details['rating'] ?? null,
                                    'total_reviews' => $details['user_ratings_total'] ?? 0,
                                    'reviews' => $details['reviews'] ?? [],
                                    'opening_hours' => $details['opening_hours']['weekday_text'] ?? [],
                                    'latitude' => $details['geometry']['location']['lat'] ?? null,
                                    'longitude' => $details['geometry']['location']['lng'] ?? null,
                                    'school_type_label' => 'School',
                                    'grade_level_label' => '',
                                    'school_board' => '',
                                    'is_google_place' => true
                                ];
                            }
                            break;
                        }
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Error fetching school from Google Places: ' . $e->getMessage());
            }
        }

        return Inertia::render('SchoolDetail', array_merge($this->getWebsiteSettings(), [
            'title' => $schoolData ? $schoolData['name'] : 'School Detail',
            'schoolSlug' => $schoolSlug,
            'schoolData' => $schoolData
        ]));
    }

    /**
     * Extract building ID from slug
     * Handles multiple formats:
     * - Just UUID (old format)
     * - name-slug-UUID
     * - name-slug/UUID (new SEO format)
     */
    private function extractBuildingIdFromSlug($slug)
    {
        // Check if it's already just a UUID (old format for backwards compatibility)
        $uuidPattern = '/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i';
        if (preg_match($uuidPattern, $slug)) {
            return $slug;
        }
        
        // Check if slug contains a forward slash (new SEO format: building-name/UUID)
        if (strpos($slug, '/') !== false) {
            $parts = explode('/', $slug);
            $lastPart = end($parts);
            // Check if the last part is a UUID
            if (preg_match($uuidPattern, $lastPart)) {
                return $lastPart;
            }
        }
        
        // Extract UUID from the end of the slug (format: building-name-uuid)
        $uuidFromSlugPattern = '/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i';
        if (preg_match($uuidFromSlugPattern, $slug, $matches)) {
            return $matches[1];
        }
        
        // If no UUID found, return the original slug (will likely result in not found)
        return $slug;
    }
    
    /**
     * Check if a string is a valid UUID
     */
    private function isValidUuid($uuid)
    {
        $uuidPattern = '/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i';
        return preg_match($uuidPattern, $uuid);
    }
}
