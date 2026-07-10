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
     * Searches address, street_address_1, street_address_2, and the JSON
     * additional_addresses array so units at any number in a building's
     * range (e.g. 30 Widmer for Theatre District where only 8/9 Widmer
     * sit in the primary fields) still resolve back to their building.
     * Without the additional_addresses check the building card on the
     * unit detail page silently returned null for those units.
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

        $searchPattern = $streetNumber . ' ' . $streetName;
        // For the JSON search we need the raw quoted token that would
        // appear inside the additional_addresses array element string,
        // e.g. "30 Widmer" matches both "30 Widmer St" and "30 Widmer St,
        // Toronto" elements. LIKE on the cast JSON column works on every
        // supported DB (MySQL, Postgres, SQLite) so no driver branching.
        $jsonLike = '%"' . $streetNumber . ' ' . $streetName . '%';

        $hasAdditionalAddresses = \Schema::hasColumn('buildings', 'additional_addresses');

        $building = Building::with(['developer', 'amenities'])
            ->where(function($query) use ($searchPattern, $streetNumber, $streetName, $jsonLike, $hasAdditionalAddresses) {
                $query->where('address', 'LIKE', $searchPattern . '%')
                      ->orWhere('street_address_1', 'LIKE', $searchPattern . '%')
                      ->orWhere('street_address_2', 'LIKE', $searchPattern . '%');
                if ($hasAdditionalAddresses) {
                    // additional_addresses is a JSON array of strings; the
                    // cast lets LIKE match the serialized list directly.
                    $query->orWhere('additional_addresses', 'LIKE', $jsonLike);
                }
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

            // Ground the copy in live MLS facts for this address (corp,
            // management, build year, typical fee, active listing count) —
            // typed values always win; failures fall back to typed data only.
            $buildingData = $this->enrichBuildingDataFromMls($buildingData);

            // Create a comprehensive building description prompt
            $prompt = $this->buildAiDescriptionPrompt($buildingData);

            // Use Gemini AI to generate description. Failures must reach the
            // admin (revoked key, quota, truncation) instead of silently
            // filling the field with a stub, so ask the service to throw and
            // hand the professional fact-based fallback to the frontend as an
            // explicit, clearly-labelled alternative.
            $geminiService = app(\App\Services\GeminiAIService::class);
            try {
                $description = $geminiService->generateBuildingDescription($prompt, $buildingData, true);
            } catch (\Exception $aiError) {
                \Log::error('Building AI description generation failed: ' . $aiError->getMessage());
                return response()->json([
                    'success' => false,
                    'error' => 'AI generation failed: ' . $aiError->getMessage(),
                    'fallback_description' => $geminiService->getFallbackBuildingDescription($buildingData),
                ], 422);
            }

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
     * Build an SEO-optimized AI description prompt for a building. Every
     * detail the admin has entered (building facts, neighbourhood, amenities,
     * fees, developer) becomes source material, and the instructions target
     * the search phrases buyers actually type.
     */
    private function buildAiDescriptionPrompt(array $buildingData): string
    {
        $name = $buildingData['name'] ?? 'Building';
        $city = ($buildingData['city'] ?? '') ?: 'Toronto';
        $neighbourhood = $buildingData['neighbourhood'] ?? '';
        $buildingType = str_replace('_', ' ', (string) ($buildingData['building_type'] ?? 'condominium'));

        $transit = $buildingData['nearby_transit'] ?? '';
        if (is_array($transit)) {
            $transit = implode(', ', array_filter(array_map(function ($item) {
                if (is_array($item)) {
                    return implode(' ', array_filter(array_map(
                        fn ($v) => is_scalar($v) ? trim((string) $v) : '',
                        $item
                    )));
                }
                return is_scalar($item) ? trim((string) $item) : '';
            }, $transit)));
        }

        $facts = array_filter([
            'Building Name' => $name,
            'Address' => implode(', ', array_filter([
                $buildingData['address'] ?? '',
                $city,
                $buildingData['province'] ?? '',
            ])),
            'Neighbourhood' => implode(' / ', array_filter([$buildingData['sub_neighbourhood'] ?? '', $neighbourhood])),
            'Type' => ucfirst($buildingType),
            'Construction Status' => str_replace('_', ' ', (string) ($buildingData['development_status'] ?? '')),
            'Total Units' => $buildingData['total_units'] ?? '',
            'Number of Floors' => $buildingData['floors'] ?? '',
            'Year Built' => $buildingData['year_built'] ?? '',
            'Parking Spots' => $buildingData['parking_spots'] ?? '',
            'Locker Spots' => $buildingData['locker_spots'] ?? '',
            'Price Range' => $buildingData['price_range'] ?? '',
            'Unit Size Range' => $buildingData['sqft_range'] ?? '',
            'Average Price Per Sqft' => $buildingData['avg_price_per_sqft'] ?? '',
            'Maintenance Fee Range' => $buildingData['maintenance_fee_range'] ?? '',
            'Typical Monthly Maintenance Fee' => $buildingData['typical_monthly_fee'] ?? '',
            'Condo Corporation' => $buildingData['corp_number'] ?? '',
            'Active Listings For Sale Right Now' => $buildingData['active_listing_count'] ?? '',
            'Developer' => $buildingData['developer_name'] ?? '',
            'Management' => $buildingData['management_name'] ?? '',
            'Nearby Transit' => $transit,
            'Building Amenities' => implode(', ', $buildingData['amenities'] ?? []),
            'Amenities Included in Maintenance Fees' => implode(', ', $buildingData['maintenance_fee_amenities'] ?? []),
        ], fn ($value) => $value !== '' && $value !== null);

        $prompt = "You are an expert real estate copywriter and SEO specialist. Write a building profile description for this {$buildingType}:\n\n";
        foreach ($facts as $label => $value) {
            $prompt .= "{$label}: {$value}\n";
        }

        $locationPhrase = $neighbourhood ? "{$neighbourhood}, {$city}" : $city;

        $prompt .= "\nSEO requirements:\n";
        $prompt .= "- Open the first sentence with the building name and its address/location — this is the page's primary keyword.\n";
        $prompt .= "- Naturally work in the search phrases buyers type, at most once each and only where they read naturally (never stuffed): \"{$name} condos\", \"condos for sale in {$locationPhrase}\", \"{$name} for sale\", \"{$name} floor plans and prices\", \"{$name} maintenance fees\", \"condos for rent in {$locationPhrase}\".\n";
        $prompt .= "- Include one sentence of neighbourhood lifestyle + transit context (use the Nearby Transit facts when given) so the copy ranks for local searches.\n";
        $prompt .= "- Include one concrete-facts sentence combining the hard numbers provided (year built, floors/units, condo corporation, management company, maintenance fees) — factual specificity builds search trust; skip any number not provided.\n";
        $prompt .= "- Use only the facts provided above. Never invent details, distances, prices or dates.\n\n";
        $prompt .= "Writing requirements:\n";
        $prompt .= "- 200-260 words in 3 short paragraphs of flowing prose (no headings, no bullet points, no markdown). Short, scannable sentences.\n";
        $prompt .= "- Paragraph 1: what/where — the building, its address and its position in the neighbourhood. Paragraph 2: living there — units, amenities, lifestyle, transit. Paragraph 3: the numbers — pricing, fees, management — ending with the call to action.\n";
        $prompt .= "- Confident, professional tone aimed at buyers, renters and investors.\n";
        $prompt .= "- Weave the strongest amenities into a lifestyle picture instead of listing them all.\n";
        $prompt .= "- Avoid filler cliches such as \"nestled\", \"boasts\", \"stunning\", \"epitome of luxury\" and \"perfect blend\".\n";
        $prompt .= "- End with a sentence that motivates the reader to explore current listings in the building.\n\n";
        $prompt .= "Return only the description text, no additional formatting or explanations.";

        return $prompt;
    }

    /**
     * Merge live MLS condo facts into the AI-description payload so the
     * generated copy is grounded in real data even before the building is
     * saved. Typed/admin values always win — only missing keys are filled.
     * One cached Repliers query per street name; any failure returns the
     * payload unchanged.
     */
    private function enrichBuildingDataFromMls(array $buildingData): array
    {
        try {
            $facts = Building::mlsFactsForAddress(
                $buildingData['address'] ?? null,
                $buildingData['city'] ?? null
            );
            if (!$facts) {
                return $buildingData;
            }

            foreach (['corp_number', 'management_name', 'year_built', 'typical_monthly_fee', 'active_listing_count'] as $key) {
                if (!empty($facts[$key]) && empty($buildingData[$key])) {
                    $buildingData[$key] = $facts[$key];
                }
            }
        } catch (\Throwable $e) {
            \Log::warning('AI description MLS enrichment failed', ['error' => $e->getMessage()]);
        }

        return $buildingData;
    }

    /**
     * Live MLS condo facts for the admin building form — called the moment
     * an address is selected/typed so corp number, management, year built
     * and fees fill BEFORE saving. The after-save MLS refresh remains the
     * safety net for multi-address buildings and MLS dry spells.
     */
    public function mlsFacts(Request $request): JsonResponse
    {
        $request->validate([
            'address' => 'required|string|max:255',
            'city' => 'nullable|string|max:100',
        ]);

        try {
            $facts = Building::mlsFactsForAddress(
                $request->input('address'),
                $request->input('city') ?: null
            );

            return response()->json(['success' => true, 'facts' => $facts]);
        } catch (\Throwable $e) {
            \Log::warning('MLS facts lookup failed', ['error' => $e->getMessage()]);

            return response()->json(['success' => false, 'facts' => null]);
        }
    }
}