<?php

namespace App\Http\Controllers;

use App\Models\Website;
use App\Models\Icon;
use App\Models\Property;
use App\Models\Building;
use App\Services\MLSIntegrationService;
use Illuminate\Http\Request;
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
        
        return Inertia::render('Website/Pages/Search', array_merge($this->getWebsiteSettings(), [
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
     * Display the property detail page
     */
    public function propertyDetail($listingKey)
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
                    // Format the property data
                    $propertyData = $this->formatAmprePropertyData($ampreProperty);
                    
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
        
        return Inertia::render('Website/Pages/PropertyDetail', array_merge($this->getWebsiteSettings(), [
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
            'address' => $property['UnparsedAddress'] ?? '',
            'city' => $property['City'] ?? '',
            'province' => $property['StateOrProvince'] ?? '',
            'postalCode' => $property['PostalCode'] ?? '',
            'price' => $property['ListPrice'] ?? 0,
            'originalPrice' => $property['OriginalListPrice'] ?? null,
            'soldPrice' => $property['ClosePrice'] ?? null,
            'propertyType' => $property['PropertyType'] ?? '',
            'propertySubType' => $property['PropertySubType'] ?? '',
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
            'status' => $property['StandardStatus'] ?? '',
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
        $building = Building::find($buildingId);
        $buildingData = null;
        
        if ($building) {
            $buildingData = $building->getDisplayData();
            // Get related properties
            $buildingData['properties'] = $building->properties()->active()->get()->map(function($property) {
                return $property->getDisplayData();
            })->toArray();
        }
        
        return Inertia::render('Website/Pages/BuildingDetail', array_merge($this->getWebsiteSettings(), [
            'title' => $building ? $building->name : 'Building Detail',
            'buildingId' => $buildingId,
            'buildingData' => $buildingData
        ]));
    }
}
