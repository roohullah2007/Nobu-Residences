<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\AmpreApiService;

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
        
        return response()->json([
            'success' => true,
            'data' => $buildings->items(),
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
        $searchPattern = $streetNumber . ' ' . $streetName;
        
        $building = Building::with(['developer', 'amenities'])
            ->where(function($query) use ($searchPattern, $streetNumber, $streetName) {
                $query->where('address', 'LIKE', $searchPattern . '%')
                      ->orWhere('address', 'LIKE', $streetNumber . ' ' . $streetName . '%');
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
        
        // Otherwise, try to use MLS API
        try {
            $ampreService = app(AmpreApiService::class);
            
            // Count FOR SALE listings
            $ampreService->resetFilters();
            
            // Match address pattern
            $streetPattern = $streetNumber . ' ' . $streetName;
            $ampreService->addCustomFilter("contains(UnparsedAddress, '{$streetPattern}')");
            
            // Transaction and Status filters for Sale
            $ampreService->addFilter('TransactionType', 'For Sale', 'eq');
            $ampreService->addFilter('StandardStatus', 'Active', 'eq');
            
            // Filter for condo apartments only
            $ampreService->addFilter('PropertySubType', 'Condo Apartment', 'eq');
            
            // Set minimal fields for counting
            $ampreService->setTop(1);
            $ampreService->setSelect(['ListingKey']);
            
            // Get count for sale
            $saleResponse = $ampreService->fetchPropertiesWithCount();
            $forSale = $saleResponse['count'] ?? 0;
            
            // Log the query for debugging
            \Log::info('MLS Sale Query URL: ' . $ampreService->getRequestUrl());
            
            // Count FOR RENT listings
            $ampreService->resetFilters();
            
            // Match address pattern
            $ampreService->addCustomFilter("contains(UnparsedAddress, '{$streetPattern}')");
            
            // Transaction and Status filters for Lease/Rent
            $ampreService->addFilter('TransactionType', 'For Lease', 'eq');
            $ampreService->addFilter('StandardStatus', 'Active', 'eq');
            
            // Filter for condo apartments only
            $ampreService->addFilter('PropertySubType', 'Condo Apartment', 'eq');
            
            // Set minimal fields for counting
            $ampreService->setTop(1);
            $ampreService->setSelect(['ListingKey']);
            
            // Get count for rent
            $rentResponse = $ampreService->fetchPropertiesWithCount();
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
            'building_id' => 'required|exists:buildings,id',
            'image_type' => 'nullable|in:main,gallery' // Optional, defaults to main
        ]);

        try {
            \Log::info('Upload request received', [
                'building_id' => $request->building_id,
                'image_type' => $request->input('image_type', 'main'),
                'has_file' => $request->hasFile('image')
            ]);

            $building = Building::findOrFail($request->building_id);

            // Store the image
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = 'building_' . $building->id . '_' . time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();

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

                if ($imageType === 'main') {
                    // Update main image
                    $building->main_image = $imageUrl;
                } else {
                    // Add to gallery images
                    $currentImages = $building->images;
                    if (is_string($currentImages)) {
                        $images = json_decode($currentImages, true) ?? [];
                    } elseif (is_array($currentImages)) {
                        $images = $currentImages;
                    } else {
                        $images = [];
                    }

                    $images[] = $imageUrl;
                    $building->images = $images; // Laravel will handle the JSON encoding
                }

                $building->save();

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