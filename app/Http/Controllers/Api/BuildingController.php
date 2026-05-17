<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\RepliersApiService;

class BuildingController extends Controller
{
    /**
     * Display a listing of buildings
     */
    public function index(Request $request): JsonResponse
    {
        $query = Building::with(['developer', 'amenities']);
        
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('city')) {
            $query->where('city', $request->input('city'));
        }
        
        if ($request->has('building_type')) {
            $query->where('building_type', $request->input('building_type'));
        }

        if ($request->has('listing_type')) {
            $query->where('listing_type', $request->input('listing_type'));
        }

        if ($request->has('developer_name')) {
            $query->where('developer_name', $request->input('developer_name'));
        }

        // Filter by developer_id (taxonomy)
        if ($request->has('developer_id')) {
            $query->where('developer_id', $request->input('developer_id'));
        }
        
        if ($request->has('min_price')) {
            $query->where('price_range', '>=', $request->input('min_price'));
        }
        
        if ($request->has('max_price')) {
            $query->where('price_range', '<=', $request->input('max_price'));
        }
        
        if ($request->has('featured')) {
            $query->where('is_featured', true);
        }
        
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        $perPage = $request->input('per_page', 12);
        $buildings = $query->paginate($perPage);

        // Enrich each building with live units_for_sale / units_for_rent
        // counts from the Repliers API (cached for 10 minutes per building).
        $items = collect($buildings->items())->map(function ($b) {
            $arr = $b->toArray();
            $counts = $b->getLiveListingCounts();
            $arr['units_for_sale'] = $counts['sale'];
            $arr['units_for_rent'] = $counts['rent'];
            return $arr;
        });

        return response()->json([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'total' => $buildings->total(),
                'per_page' => $buildings->perPage(),
                'current_page' => $buildings->currentPage(),
                'last_page' => $buildings->lastPage(),
                'from' => $buildings->firstItem(),
                'to' => $buildings->lastItem(),
            ]
        ]);
    }

    /**
     * Parse a Canadian street address into Repliers-style {number, name}.
     * Handles multi-word street names (e.g. "Lake Shore") by stripping the
     * trailing suffix ("Blvd", "Street", ...) and direction ("W", "East", ...).
     * Returns null if the address can't be parsed.
     */
    private function parseStreetAddress(?string $address): ?array
    {
        if (!$address) return null;
        if (!preg_match('/^(\d+)\s+(.+)$/u', trim($address), $m)) return null;
        $number = $m[1];
        // Strip city/postal suffix like ", Toronto" or ", ON M5V 0K6"
        $rest = preg_split('/\s*,/', $m[2])[0] ?? $m[2];

        // Strip trailing direction
        $rest = preg_replace('/\s+(?:W|E|N|S|West|East|North|South|NE|NW|SE|SW)\.?$/i', '', $rest);
        // Strip trailing street suffix
        $rest = preg_replace(
            '/\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Crescent|Cres|Court|Ct|Place|Pl|Park|Parkway|Pkwy|Square|Sq|Terrace|Ter|Circle|Cir|Trail|Tr|Gate|Hill|Heights|Hts|Mews|Walk|Common|Commons)\.?$/i',
            '',
            $rest
        );

        $name = trim($rest);
        return $name === '' ? null : ['number' => $number, 'name' => $name];
    }

    /**
     * Get live for-sale / for-rent counts for a building from the Repliers API.
     * Cached for 10 minutes per building to avoid hammering the API.
     */
    private function getBuildingListingCounts(Building $building): array
    {
        $cacheKey = 'building_listing_counts:' . $building->id;
        return \Illuminate\Support\Facades\Cache::remember($cacheKey, 600, function () use ($building) {
            $rawCandidates = [
                $building->street_address_1 ?? null,
                $building->street_address_2 ?? null,
            ];
            if (is_array($building->additional_addresses)) {
                foreach ($building->additional_addresses as $a) {
                    $rawCandidates[] = $a;
                }
            }

            $addresses = [];
            $seen = [];
            foreach ($rawCandidates as $a) {
                if ($parsed = $this->parseStreetAddress($a)) {
                    $key = strtolower($parsed['number'] . '|' . $parsed['name']);
                    if (!isset($seen[$key])) {
                        $seen[$key] = true;
                        $addresses[] = $parsed;
                    }
                }
            }
            if (empty($addresses) && !empty($building->address)) {
                // Buildings often store joined addresses like "15 Mercer St & 35 Mercer"
                // or "15 Mercer St, 35 Mercer".
                $parts = preg_split('/\s*[,&]\s*/', $building->address);
                foreach (array_filter(array_map('trim', $parts)) as $part) {
                    if ($parsed = $this->parseStreetAddress($part)) {
                        $key = strtolower($parsed['number'] . '|' . $parsed['name']);
                        if (!isset($seen[$key])) {
                            $seen[$key] = true;
                            $addresses[] = $parsed;
                        }
                    }
                }
            }

            $sale = 0;
            $rent = 0;
            if (empty($addresses)) {
                return ['sale' => 0, 'rent' => 0];
            }

            try {
                $api = app(\App\Services\RepliersApiService::class);
                foreach ($addresses as $addr) {
                    foreach (['sale', 'lease'] as $t) {
                        $params = [
                            'class' => 'condoProperty',
                            'status' => 'A',
                            'type' => $t,
                            'streetNumber' => $addr['number'],
                            'streetName' => $addr['name'],
                            'pageNum' => 1,
                            'resultsPerPage' => 1,
                        ];
                        if (!empty($building->city)) {
                            $params['city'] = $building->city;
                        }
                        $res = $api->searchListings($params);
                        $count = (int) ($res['count'] ?? 0);
                        if ($t === 'sale') {
                            $sale += $count;
                        } else {
                            $rent += $count;
                        }
                    }
                }
            } catch (\Throwable $e) {
                \Log::warning('Building listing count fetch failed', [
                    'building_id' => $building->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return ['sale' => $sale, 'rent' => $rent];
        });
    }
    
    /**
     * Display the specified building
     */
    public function show($id): JsonResponse
    {
        $building = Building::with(['developer', 'amenities', 'properties' => function($query) {
            $query->where('status', 'active')
                  ->orderBy('created_at', 'desc')
                  ->limit(10);
        }])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $building
        ]);
    }
    
    /**
     * Get buildings for search page
     */
    public function search(Request $request): JsonResponse
    {
        $query = Building::with('developer');
        
        if ($request->has('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }
        
        $filters = $request->only([
            'city', 
            'building_type', 
            'listing_type',
            'bedrooms',
            'bathrooms',
            'min_price',
            'max_price',
            'has_parking',
            'has_locker'
        ]);
        
        foreach ($filters as $key => $value) {
            if (!empty($value)) {
                switch($key) {
                    case 'has_parking':
                        if ($value) {
                            $query->where('parking_spots', '>', 0);
                        }
                        break;
                    case 'has_locker':
                        if ($value) {
                            $query->where('locker_spots', '>', 0);
                        }
                        break;
                    default:
                        $query->where($key, $value);
                        break;
                }
            }
        }
        
        $query->where('status', 'active');
        
        $buildings = $query->paginate($request->input('per_page', 12));
        
        return response()->json([
            'success' => true,
            'data' => $buildings->items(),
            'pagination' => [
                'total' => $buildings->total(),
                'per_page' => $buildings->perPage(),
                'current_page' => $buildings->currentPage(),
                'last_page' => $buildings->lastPage(),
            ]
        ]);
    }
    
    /**
     * Get featured buildings
     */
    public function featured(): JsonResponse
    {
        $buildings = Building::where('is_featured', true)
            ->where('status', 'active')
            ->with('developer')
            ->limit(6)
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $buildings
        ]);
    }
    
    /**
     * Get building types
     */
    public function buildingTypes(): JsonResponse
    {
        $types = Building::distinct()
            ->pluck('building_type')
            ->filter()
            ->values();
            
        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }
    
    /**
     * Get cities
     */
    public function cities(): JsonResponse
    {
        $cities = Building::distinct()
            ->pluck('city')
            ->filter()
            ->values();
            
        return response()->json([
            'success' => true,
            'data' => $cities
        ]);
    }
    
    /**
     * Find building by street address
     * Searches in address, street_address_1, and street_address_2 fields
     * to support buildings with multiple addresses (e.g., NOBU Residences with 15 Mercer and 35 Mercer)
     */
    public function findByAddress(Request $request): JsonResponse
    {
        $streetNumber = $request->input('street_number');
        $streetName = $request->input('street_name');

        if (!$streetNumber || !$streetName) {
            return response()->json([
                'success' => false,
                'message' => 'Street number and street name are required',
                'data' => null
            ]);
        }

        // Search for building with matching street address
        // Check all address fields: address, street_address_1, and street_address_2
        $searchPattern = $streetNumber . ' ' . $streetName;

        $building = Building::with(['developer', 'amenities'])
            ->where(function($query) use ($searchPattern, $streetNumber, $streetName) {
                // Search in main address field
                $query->where('address', 'LIKE', $searchPattern . '%')
                      ->orWhere('address', 'LIKE', $streetNumber . ' ' . $streetName . '%')
                      // Also search in street_address_1 field (supports multi-address buildings)
                      ->orWhere('street_address_1', 'LIKE', $searchPattern . '%')
                      ->orWhere('street_address_1', 'LIKE', $streetNumber . ' ' . $streetName . '%')
                      // Also search in street_address_2 field (supports multi-address buildings)
                      ->orWhere('street_address_2', 'LIKE', $searchPattern . '%')
                      ->orWhere('street_address_2', 'LIKE', $streetNumber . ' ' . $streetName . '%');
            })
            ->where('status', 'active')
            ->first();

        if (!$building) {
            return response()->json([
                'success' => false,
                'message' => 'No building found at this address',
                'data' => null
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $building
        ]);
    }
    
    /**
     * Count MLS listings for a building address
     */
    public function countMLSListings(Request $request): JsonResponse
    {
        $streetNumber = $request->input('street_number');
        $streetName = $request->input('street_name');
        
        if (!$streetNumber || !$streetName) {
            return response()->json([
                'success' => false,
                'message' => 'Street number and street name are required',
                'data' => [
                    'for_sale' => 0,
                    'for_rent' => 0
                ]
            ]);
        }
        
        // Always use MLS API for accurate condo apartment counts
        // Skip static counts to ensure we get filtered results from MLS

        // Otherwise, try to use MLS API (Repliers)
        try {
            $repliersService = app(RepliersApiService::class);

            $streetPattern = $streetNumber . ' ' . $streetName;

            // Count FOR SALE listings
            $saleResponse = $repliersService->searchListings([
                'search' => $streetPattern,
                'status' => 'A',
                'type' => 'sale',
                'class' => 'condo',
                'resultsPerPage' => 1,
            ]);
            $forSale = $saleResponse['count'] ?? 0;

            \Log::info('MLS Sale Query for: ' . $streetPattern, ['count' => $forSale]);

            // Count FOR RENT listings
            $rentResponse = $repliersService->searchListings([
                'search' => $streetPattern,
                'status' => 'A',
                'type' => 'lease',
                'class' => 'condo',
                'resultsPerPage' => 1,
            ]);
            $forRent = $rentResponse['count'] ?? 0;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'for_sale' => $forSale,
                    'for_rent' => $forRent,
                    'total' => $forSale + $forRent,
                    'source' => 'mls'
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('MLS API error: ' . $e->getMessage());
            
            // Fallback to local database
            $searchPattern = $streetNumber . ' ' . $streetName;
            
            // Count properties for sale
            $forSale = \App\Models\Property::where('transaction_type', 'sale')
                ->where(function($query) use ($searchPattern, $streetNumber, $streetName) {
                    $query->where('address', 'LIKE', $searchPattern . '%')
                          ->orWhere('address', 'LIKE', $streetNumber . ' ' . $streetName . '%');
                })
                ->where('status', 'active')
                ->count();
                
            // Count properties for rent
            $forRent = \App\Models\Property::where('transaction_type', 'rent')
                ->where(function($query) use ($searchPattern, $streetNumber, $streetName) {
                    $query->where('address', 'LIKE', $searchPattern . '%')
                          ->orWhere('address', 'LIKE', $streetNumber . ' ' . $streetName . '%');
                })
                ->where('status', 'active')
                ->count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'for_sale' => $forSale,
                    'for_rent' => $forRent,
                    'total' => $forSale + $forRent,
                    'source' => 'local'
                ]
            ]);
        }
    }

    /**
     * Upload image for a building
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB
            'building_id' => 'nullable|exists:buildings,id', // Optional — Create page has no building yet
            'image_type' => 'nullable|in:main,gallery' // Optional, defaults to main
        ]);

        try {
            $buildingId = $request->building_id;
            $building = $buildingId ? Building::findOrFail($buildingId) : null;

            \Log::info('Upload request received', [
                'building_id' => $buildingId,
                'image_type' => $request->input('image_type', 'main'),
                'has_file' => $request->hasFile('image')
            ]);

            // Store the image
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $prefix = $building ? 'building_' . $building->id : 'building_new';
                $imageName = $prefix . '_' . time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();

                // Create directory if it doesn't exist
                $uploadPath = public_path('images/buildings');
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0777, true);
                }

                // Store in public/images/buildings directory
                $path = $image->move($uploadPath, $imageName);

                // Generate URL
                $imageUrl = asset('images/buildings/' . $imageName);

                $imageType = $request->input('image_type', 'main');

                // Only attach to an existing building. For Create, the URL is returned to
                // the client which submits it with the rest of the form.
                if ($building) {
                    if ($imageType === 'main') {
                        $building->main_image = $imageUrl;
                    } else {
                        $currentImages = $building->images;
                        if (is_string($currentImages)) {
                            $images = json_decode($currentImages, true) ?? [];
                        } elseif (is_array($currentImages)) {
                            $images = $currentImages;
                        } else {
                            $images = [];
                        }

                        $images[] = $imageUrl;
                        $building->images = $images;
                    }
                    $building->save();
                }

                \Log::info('Image uploaded successfully', [
                    'url' => $imageUrl,
                    'type' => $imageType
                ]);

                return response()->json([
                    'success' => true,
                    'url' => $imageUrl,
                    'type' => $imageType,
                    'message' => 'Image uploaded successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No image file provided'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete image from a building
     */
    public function deleteImage(Request $request): JsonResponse
    {
        $request->validate([
            'building_id' => 'required|exists:buildings,id',
            'image_url' => 'required|string'
        ]);

        try {
            $building = Building::findOrFail($request->building_id);
            $imageUrl = $request->image_url;

            // Check if it's the main image
            if ($building->main_image === $imageUrl) {
                $building->main_image = null;
            } else {
                // Remove from gallery images
                $currentImages = $building->images;
                if (is_string($currentImages)) {
                    $images = json_decode($currentImages, true) ?? [];
                } elseif (is_array($currentImages)) {
                    $images = $currentImages;
                } else {
                    $images = [];
                }

                $images = array_values(array_filter($images, function($img) use ($imageUrl) {
                    return $img !== $imageUrl;
                }));
                $building->images = $images; // Laravel will handle the JSON encoding
            }

            $building->save();

            // Try to delete the physical file (optional)
            $filename = basename($imageUrl);
            $filePath = public_path('images/buildings/' . $filename);
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate AI description for building using Gemini AI
     */
    public function generateAiDescription(Request $request): JsonResponse
    {
        try {
            $buildingData = $request->input('building_data', []);
            $buildingId = $request->input('building_id');

            // Create a comprehensive building description prompt
            $prompt = $this->buildAiDescriptionPrompt($buildingData);

            // Use Gemini AI to generate description
            $geminiService = app(\App\Services\GeminiAIService::class);
            $description = $geminiService->generateBuildingDescription($prompt, $buildingData);

            if ($description) {
                // If building_id is provided, save the description to the building
                if ($buildingId) {
                    $building = Building::find($buildingId);
                    if ($building) {
                        $building->description = $description;
                        $building->save();
                        \Log::info("AI description saved for building: {$buildingId}");
                    }
                }

                return response()->json([
                    'success' => true,
                    'description' => $description,
                    'message' => 'AI description generated successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => 'Failed to generate AI description'
            ], 500);

        } catch (\Exception $e) {
            \Log::error('Error generating building AI description: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate AI description: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Build AI description prompt for building
     */
    private function buildAiDescriptionPrompt(array $buildingData): string
    {
        $name = $buildingData['name'] ?? 'Building';
        $address = $buildingData['address'] ?? '';
        $city = $buildingData['city'] ?? '';
        $province = $buildingData['province'] ?? '';
        $buildingType = $buildingData['building_type'] ?? 'residential';
        $totalUnits = $buildingData['total_units'] ?? '';
        $yearBuilt = $buildingData['year_built'] ?? '';
        $floors = $buildingData['floors'] ?? '';
        $amenities = $buildingData['amenities'] ?? [];
        $maintenanceAmenities = $buildingData['maintenance_fee_amenities'] ?? [];
        $priceRange = $buildingData['price_range'] ?? '';
        $maintenanceFeeRange = $buildingData['maintenance_fee_range'] ?? '';
        $developerName = $buildingData['developer_name'] ?? '';
        $managementName = $buildingData['management_name'] ?? '';

        $prompt = "Generate a compelling and professional real estate description for this building:\n\n";
        $prompt .= "Building Name: {$name}\n";

        if ($address) {
            $prompt .= "Address: {$address}";
            if ($city) $prompt .= ", {$city}";
            if ($province) $prompt .= ", {$province}";
            $prompt .= "\n";
        }

        if ($buildingType) $prompt .= "Type: " . ucfirst($buildingType) . "\n";
        if ($totalUnits) $prompt .= "Total Units: {$totalUnits}\n";
        if ($floors) $prompt .= "Number of Floors: {$floors}\n";
        if ($yearBuilt) $prompt .= "Year Built: {$yearBuilt}\n";
        if ($priceRange) $prompt .= "Price Range: {$priceRange}\n";
        if ($maintenanceFeeRange) $prompt .= "Maintenance Fee Range: {$maintenanceFeeRange}\n";
        if ($developerName) $prompt .= "Developer: {$developerName}\n";
        if ($managementName) $prompt .= "Management: {$managementName}\n";

        if (!empty($amenities)) {
            $prompt .= "Building Amenities: " . implode(', ', $amenities) . "\n";
        }

        if (!empty($maintenanceAmenities)) {
            $prompt .= "Amenities Included in Maintenance Fees: " . implode(', ', $maintenanceAmenities) . "\n";
        }

        $prompt .= "\nPlease create a compelling, professional building description that:\n";
        $prompt .= "- Highlights the building's key features and location benefits\n";
        $prompt .= "- Emphasizes luxury and lifestyle aspects\n";
        $prompt .= "- Mentions the amenities and their value\n";
        $prompt .= "- Appeals to potential buyers or residents\n";
        $prompt .= "- Is 100-200 words in length\n";
        $prompt .= "- Uses engaging, professional real estate language\n";
        $prompt .= "- Focuses on quality of life and investment value\n\n";
        $prompt .= "Return only the description text, no additional formatting or explanations.";

        return $prompt;
    }
}