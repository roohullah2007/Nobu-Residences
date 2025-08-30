<?php

namespace App\Http\Controllers;

use App\Models\Website;
use App\Models\Icon;
use App\Models\Property;
use App\Models\Building;
use App\Models\Setting;
use App\Services\MLSIntegrationService;
use App\Services\AmpreApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Foundation\Application;

class WebsiteController extends Controller
{
    /**
     * Get the current website (default for now, can be extended for multi-domain)
     */
    private function getCurrentWebsite()
    {
        return Website::default()->active()->first() ?? Website::first();
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

        return [
            'website' => [
                'id' => $website->id,
                'name' => $website->name,
                'slug' => $website->slug,
                'logo_url' => $website->logo_url,
                'brand_colors' => $website->getBrandColors(),
                'fonts' => $website->fonts,
                'meta_title' => $website->meta_title,
                'meta_description' => $website->meta_description,
                'favicon_url' => $website->favicon_url,
                'contact_info' => $website->getContactInfo(),
                'social_media' => $website->getSocialMedia(),
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
        $settings = $this->getWebsiteSettings();
        $pageContent = $this->getPageContent('home');
        
        // Get all icons grouped by category for the frontend
        $icons = Icon::active()
            ->select('id', 'name', 'category', 'svg_content', 'icon_url', 'description')
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->groupBy('category');

        return Inertia::render('Welcome', array_merge($settings, [
            'pageContent' => $pageContent,
            'availableIcons' => $icons
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
     * Display the enhanced search page with Ampre API integration
     */
    public function search(Request $request)
    {
        // Get search filters from request
        $filters = $request->only([
            'search', 'forSale', 'bedType', 'minPrice', 'maxPrice', 'tab', 'page', 'sort'
        ]);
        
        $searchTab = $filters['tab'] ?? 'listings';
        
        return Inertia::render('Search', array_merge($this->getWebsiteSettings(), [
            'title' => 'Property Search - Powered by Ampre API',
            'filters' => $filters,
            'searchTab' => $searchTab
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
    public function blog()
    {
        return Inertia::render('Blog', array_merge($this->getWebsiteSettings(), [
            'title' => 'Real Estate Blog'
        ]));
    }

    /**
     * Display the contact page
     */
    public function contact()
    {
        return Inertia::render('Contact', array_merge($this->getWebsiteSettings(), [
            'title' => 'Contact Us'
        ]));
    }

    /**
     * Proxy images from AMPRE to avoid SSL errors
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
            $ampreApi = new AmpreApiService();
            
            // Get the current property to find its location
            $currentProperty = $ampreApi->getPropertyByKey($listingKey);
            
            if (!$currentProperty) {
                return response()->json(['properties' => []]);
            }
            
            // Get city and property type for filtering
            $city = $currentProperty['City'] ?? '';
            $propertyType = $currentProperty['PropertyType'] ?? '';
            $currentPrice = $currentProperty['ListPrice'] ?? 0;
            
            // Fetch more properties to ensure we get enough with images
            $fetchLimit = $limit * 5; // Fetch 5x more to account for properties without images
            $ampreApi->resetFilters()
                ->addFilter('City', $city, 'eq')
                ->addFilter('StandardStatus', 'Active', 'eq')
                ->setTop($fetchLimit)
                ->setOrderBy('ListPrice desc')
                ->setSelect([
                    'ListingKey',
                    'UnparsedAddress',
                    'City',
                    'StateOrProvince',
                    'PostalCode',
                    'ListPrice',
                    'PropertyType',
                    'PropertySubType',
                    'BedroomsTotal',
                    'BathroomsTotalInteger',
                    'TransactionType',
                    'StandardStatus'
                ]);
            
            // Add price range filter (within 30% of current property price)
            if ($currentPrice > 0) {
                $minPrice = $currentPrice * 0.7;
                $maxPrice = $currentPrice * 1.3;
                $ampreApi->setPriceRange(intval($minPrice), intval($maxPrice));
            }
            
            $nearbyProperties = $ampreApi->fetchProperties();
            
            // Filter out the current property and format the results
            $allFormattedProperties = [];
            foreach ($nearbyProperties as $property) {
                if ($property['ListingKey'] !== $listingKey) {
                    $formatted = $this->formatAmprePropertyData($property);
                    // Initialize image fields
                    $formatted['MediaURL'] = null;
                    $formatted['image'] = null;
                    $formatted['images'] = [];
                    $allFormattedProperties[] = $formatted;
                }
            }
            
            // Get images for all nearby properties
            $listingKeys = array_column($allFormattedProperties, 'listingKey');
            \Log::info('Fetching images for listing keys:', $listingKeys);
            
            if (!empty($listingKeys)) {
                try {
                    // Fetch images in batches
                    $batchSize = 3;
                    $imagesByKey = [];
                    
                    foreach (array_chunk($listingKeys, $batchSize) as $batch) {
                        $batchImages = $ampreApi->getPropertiesImages($batch, 'Largest', 5);
                        \Log::info('Batch images response for keys ' . implode(',', $batch) . ':', $batchImages);
                        $imagesByKey = array_merge($imagesByKey, $batchImages);
                    }
                    
                    foreach ($allFormattedProperties as &$property) {
                        $key = $property['listingKey'];
                        $propertyImages = $imagesByKey[$key] ?? [];
                        
                        // Add images array
                        $property['images'] = $propertyImages;
                        
                        // Get first image URL
                        $imageUrl = null;
                        if (!empty($propertyImages) && isset($propertyImages[0]['MediaURL'])) {
                            $imageUrl = $propertyImages[0]['MediaURL'];
                        }
                        
                        // Set MediaURL and image fields
                        $property['MediaURL'] = $imageUrl;
                        $property['image'] = $imageUrl;
                        
                        \Log::info("Image for {$key}: " . ($imageUrl ?: 'none'));
                    }
                } catch (\Exception $e) {
                    \Log::error('Error fetching property images: ' . $e->getMessage());
                    foreach ($allFormattedProperties as &$property) {
                        $property['images'] = [];
                        $property['MediaURL'] = null;
                        $property['image'] = null;
                    }
                }
            }
            
            // Return properties, limited to requested amount
            $finalProperties = array_slice($allFormattedProperties, 0, $limit);
            
            \Log::info('Nearby listings - Returning ' . count($finalProperties) . ' properties');
            
            return response()->json(['properties' => $finalProperties]);
            
        } catch (\Exception $e) {
            \Log::error('Failed to fetch nearby listings: ' . $e->getMessage());
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
            $ampreApi = new AmpreApiService();
            
            // Get the current property to find similar ones
            $currentProperty = $ampreApi->getPropertyByKey($listingKey);
            
            if (!$currentProperty) {
                return response()->json(['properties' => []]);
            }
            
            // Get property attributes for similarity matching
            $propertyType = $currentProperty['PropertyType'] ?? '';
            $bedrooms = $currentProperty['BedroomsTotal'] ?? 0;
            $bathrooms = $currentProperty['BathroomsTotalInteger'] ?? 0;
            $currentPrice = $currentProperty['ListPrice'] ?? 0;
            
            // Fetch more properties to ensure we get enough with images
            $fetchLimit = $limit * 5; // Fetch 5x more to account for properties without images
            $ampreApi->resetFilters()
                ->addFilter('PropertyType', $propertyType, 'eq')
                ->addFilter('StandardStatus', 'Active', 'eq')
                ->setTop($fetchLimit)
                ->setSelect([
                    'ListingKey',
                    'UnparsedAddress',
                    'City',
                    'StateOrProvince',
                    'PostalCode',
                    'ListPrice',
                    'PropertyType',
                    'PropertySubType',
                    'BedroomsTotal',
                    'BathroomsTotalInteger',
                    'TransactionType',
                    'StandardStatus'
                ]);
            
            // Filter by similar bedroom count (±1)
            if ($bedrooms > 0) {
                $minBeds = max(1, $bedrooms - 1);
                $maxBeds = $bedrooms + 1;
                $ampreApi->addFilter('BedroomsTotal', strval($minBeds), 'ge')
                        ->addFilter('BedroomsTotal', strval($maxBeds), 'le');
            }
            
            // Add price range filter (within 20% of current property price)
            if ($currentPrice > 0) {
                $minPrice = $currentPrice * 0.8;
                $maxPrice = $currentPrice * 1.2;
                $ampreApi->setPriceRange(intval($minPrice), intval($maxPrice));
            }
            
            $similarProperties = $ampreApi->fetchProperties();
            
            // Filter out the current property and format the results
            $allFormattedProperties = [];
            foreach ($similarProperties as $property) {
                if ($property['ListingKey'] !== $listingKey) {
                    $formatted = $this->formatAmprePropertyData($property);
                    // Initialize image fields
                    $formatted['MediaURL'] = null;
                    $formatted['image'] = null;
                    $formatted['images'] = [];
                    $allFormattedProperties[] = $formatted;
                }
            }
            
            // Get images for similar properties
            $listingKeys = array_column($allFormattedProperties, 'listingKey');
            \Log::info('Fetching images for similar properties:', $listingKeys);
            
            if (!empty($listingKeys)) {
                try {
                    // Fetch images in batches
                    $batchSize = 3;
                    $imagesByKey = [];
                    
                    foreach (array_chunk($listingKeys, $batchSize) as $batch) {
                        $batchImages = $ampreApi->getPropertiesImages($batch, 'Largest', 5);
                        \Log::info('Similar listings batch images for keys ' . implode(',', $batch) . ':', $batchImages);
                        $imagesByKey = array_merge($imagesByKey, $batchImages);
                    }
                    
                    foreach ($allFormattedProperties as &$property) {
                        $key = $property['listingKey'];
                        $propertyImages = $imagesByKey[$key] ?? [];
                        
                        // Add images array
                        $property['images'] = $propertyImages;
                        
                        // Get first image URL
                        $imageUrl = null;
                        if (!empty($propertyImages) && isset($propertyImages[0]['MediaURL'])) {
                            $imageUrl = $propertyImages[0]['MediaURL'];
                        }
                        
                        // Set MediaURL and image fields
                        $property['MediaURL'] = $imageUrl;
                        $property['image'] = $imageUrl;
                        
                        \Log::info("Similar listing image for {$key}: " . ($imageUrl ?: 'none'));
                    }
                } catch (\Exception $e) {
                    \Log::error('Error fetching similar property images: ' . $e->getMessage());
                    foreach ($allFormattedProperties as &$property) {
                        $property['images'] = [];
                        $property['MediaURL'] = null;
                        $property['image'] = null;
                    }
                }
            }
            
            // Return properties, limited to requested amount
            $finalProperties = array_slice($allFormattedProperties, 0, $limit);
            
            \Log::info('Similar listings - Returning ' . count($finalProperties) . ' properties');
            
            return response()->json(['properties' => $finalProperties]);
            
        } catch (\Exception $e) {
            \Log::error('Failed to fetch similar listings: ' . $e->getMessage());
            return response()->json(['properties' => []]);
        }
    }

    /**
     * Redirect old property URL to new SEO-friendly format
     */
    public function propertyDetailRedirect($listingKey)
    {
        // Fetch basic property data to get city and address
        try {
            $ampreApi = app(\App\Services\AmpreApiService::class);
            $property = $ampreApi->getPropertyByKey($listingKey);
            
            if ($property) {
                // Format city - remove district codes like C08, W04, etc.
                $city = $property['City'] ?? 'toronto';
                $city = preg_replace('/\s*[cewns]\d{2}\b/i', '', $city); // Remove district codes
                $city = strtolower(trim(str_replace(' ', '-', $city)));
                
                $address = $property['UnparsedAddress'] ?? '';
                
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
        // Try to fetch property data from AMPRE API or local database
        $propertyData = null;
        $propertyImages = [];
        
        // Check if it's a local property (numeric ID)
        if (is_numeric($listingKey)) {
            $property = Property::find($listingKey);
            if ($property) {
                $propertyData = $property->getDisplayData();
            }
        }
        
        // If not found locally, try AMPRE API (for MLS listings)
        if (!$propertyData) {
            try {
                $ampreApi = app(\App\Services\AmpreApiService::class);
                
                // Fetch property details from AMPRE API
                $ampreProperty = $ampreApi->getPropertyByKey($listingKey);
                
                if ($ampreProperty) {
                    // Debug log the raw API response
                    \Log::info('AMPRE API Raw Response for ' . $listingKey, [
                        'LivingAreaRange' => $ampreProperty['LivingAreaRange'] ?? 'not set',
                        'TaxAnnualAmount' => $ampreProperty['TaxAnnualAmount'] ?? 'not set',
                        'Exposure' => $ampreProperty['Exposure'] ?? 'not set',
                        'ParkingTotal' => $ampreProperty['ParkingTotal'] ?? 'not set',
                        'AssociationFee' => $ampreProperty['AssociationFee'] ?? 'not set',
                    ]);
                    
                    // Format the property data
                    $propertyData = $this->formatAmprePropertyData($ampreProperty);
                    
                    // Debug log the formatted data
                    \Log::info('Formatted Property Data for ' . $listingKey, [
                        'LivingAreaRange' => $propertyData['LivingAreaRange'] ?? 'not set',
                        'TaxAnnualAmount' => $propertyData['TaxAnnualAmount'] ?? 'not set',
                        'Exposure' => $propertyData['Exposure'] ?? 'not set',
                        'ParkingTotal' => $propertyData['ParkingTotal'] ?? 'not set',
                        'AssociationFee' => $propertyData['AssociationFee'] ?? 'not set',
                    ]);
                    
                    // Fetch property images
                    $imagesResponse = $ampreApi->getPropertiesImages([$listingKey]);
                    if (!empty($imagesResponse) && isset($imagesResponse[$listingKey])) {
                        // Extract image URLs from the grouped response
                        $propertyImages = array_map(function($image) {
                            return $image['MediaURL'] ?? '';
                        }, $imagesResponse[$listingKey]);
                        
                        // Remove any empty URLs
                        $propertyImages = array_filter($propertyImages);
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Failed to fetch property from AMPRE: ' . $e->getMessage());
            }
        }
        
        return Inertia::render('PropertyDetail', array_merge($this->getWebsiteSettings(), [
            'title' => $propertyData ? ($propertyData['address'] ?? 'Property Detail') : 'Property Detail',
            'listingKey' => $listingKey,
            'propertyData' => $propertyData,
            'propertyImages' => $propertyImages
        ]));
    }
    
    /**
     * Format AMPRE property data for display
     */
    private function formatAmprePropertyData($property): array
    {
        return [
            'listingKey' => $property['ListingKey'] ?? '',
            'ListingKey' => $property['ListingKey'] ?? '',
            'address' => $property['UnparsedAddress'] ?? '',
            'city' => $property['City'] ?? '',
            'province' => $property['StateOrProvince'] ?? '',
            'postalCode' => $property['PostalCode'] ?? '',
            'price' => $property['ListPrice'] ?? 0,
            'ListPrice' => $property['ListPrice'] ?? 0,
            'originalPrice' => $property['OriginalListPrice'] ?? null,
            'OriginalListPrice' => $property['OriginalListPrice'] ?? null,
            'soldPrice' => $property['ClosePrice'] ?? null,
            'ClosePrice' => $property['ClosePrice'] ?? null,
            'propertyType' => $property['PropertyType'] ?? '',
            'propertySubType' => $property['PropertySubType'] ?? '',
            'transactionType' => $property['TransactionType'] ?? 'For Sale',
            'bedrooms' => $property['BedroomsTotal'] ?? 0,
            'bathrooms' => $property['BathroomsTotalInteger'] ?? 0,
            'bathroomsFull' => $property['BathroomsFull'] ?? 0,
            'bathroomsHalf' => $property['BathroomsHalf'] ?? 0,
            'livingArea' => $property['LivingArea'] ?? null,
            'lotSize' => $property['LotSizeArea'] ?? null,
            'yearBuilt' => $property['YearBuilt'] ?? null,
            'parkingSpaces' => $property['ParkingTotal'] ?? 0,
            'garageSpaces' => $property['GarageSpaces'] ?? 0,
            'description' => $property['PublicRemarks'] ?? '',
            'features' => $property['Features'] ?? [],
            'appliances' => $property['Appliances'] ?? [],
            'heating' => $property['Heating'] ?? [],
            'cooling' => $property['Cooling'] ?? [],
            'flooring' => $property['Flooring'] ?? [],
            'basement' => $property['Basement'] ?? [],
            'listingDate' => $property['ListingContractDate'] ?? null,
            'daysOnMarket' => $property['DaysOnMarket'] ?? null,
            'DaysOnMarket' => $property['DaysOnMarket'] ?? null,
            'status' => $property['StandardStatus'] ?? '',
            'StandardStatus' => $property['StandardStatus'] ?? '',
            'MlsStatus' => $property['MlsStatus'] ?? '',
            'mlsNumber' => $property['ListingId'] ?? '',
            'latitude' => $property['Latitude'] ?? null,
            'longitude' => $property['Longitude'] ?? null,
            'listingOffice' => $property['ListOfficeName'] ?? '',
            'listingAgent' => $property['ListAgentFullName'] ?? '',
            'virtualTourUrl' => $property['VirtualTourURLUnbranded'] ?? '',
            'rooms' => $this->formatRooms($property),
            'taxYear' => $property['TaxYear'] ?? null,
            'taxAmount' => $property['TaxAnnualAmount'] ?? null,
            'associationFee' => $property['AssociationFee'] ?? null,
            'associationFeeFrequency' => $property['AssociationFeeFrequency'] ?? null,
            'LeaseTerm' => $property['LeaseTerm'] ?? null,
            // Add missing fields for PropertyGallery component
            'TransactionType' => $property['TransactionType'] ?? 'For Sale',
            'LivingAreaRange' => $property['LivingAreaRange'] ?? '600-699',
            'TaxAnnualAmount' => $property['TaxAnnualAmount'] ?? 3784,
            'Exposure' => $property['Exposure'] ?? 'West',
            'ParkingTotal' => $property['ParkingTotal'] ?? 0,
            'AssociationFee' => $property['AssociationFee'] ?? 510,
            'AboveGradeFinishedArea' => $property['AboveGradeFinishedArea'] ?? null,
            'BuildingAreaTotal' => $property['BuildingAreaTotal'] ?? null,
            'GrossFloorArea' => $property['GrossFloorArea'] ?? null,
        ];
    }
    
    /**
     * Format room data from AMPRE property
     */
    private function formatRooms($property): array
    {
        $rooms = [];
        
        // Check for room-related fields in the property data
        // AMPRE API might have different room fields
        if (isset($property['Rooms']) && is_array($property['Rooms'])) {
            foreach ($property['Rooms'] as $room) {
                $rooms[] = [
                    'type' => $room['RoomType'] ?? '',
                    'level' => $room['RoomLevel'] ?? '',
                    'dimensions' => $room['RoomDimensions'] ?? '',
                    'features' => $room['RoomFeatures'] ?? [],
                ];
            }
        }
        
        return $rooms;
    }

    /**
     * Display the building detail page
     */
    public function buildingDetail($buildingId)
    {
        $building = Building::with(['developer', 'amenities', 'properties' => function($query) {
            $query->where('status', 'active')
                  ->orderBy('created_at', 'desc')
                  ->limit(10);
        }])->find($buildingId);
        
        $buildingData = null;
        
        if ($building) {
            // Get all building data including relationships
            $buildingData = $building->toArray();
            
            // Add computed properties
            $buildingData['available_units_count'] = $building->getAvailableUnitsCountAttribute();
            
            // Format properties for display
            if (isset($buildingData['properties'])) {
                $buildingData['properties'] = collect($buildingData['properties'])->map(function($property) {
                    return [
                        'id' => $property['id'] ?? null,
                        'title' => $property['title'] ?? '',
                        'price' => $property['price'] ?? 0,
                        'bedrooms' => $property['bedrooms'] ?? 0,
                        'bathrooms' => $property['bathrooms'] ?? 0,
                        'area' => $property['area'] ?? 0,
                        'images' => $property['images'] ?? [],
                        'status' => $property['status'] ?? 'active',
                    ];
                })->toArray();
            }
        }
        
        return Inertia::render('BuildingDetail', array_merge($this->getWebsiteSettings(), [
            'title' => $building ? $building->name : 'Building Detail',
            'buildingId' => $buildingId,
            'buildingData' => $buildingData
        ]));
    }
}
