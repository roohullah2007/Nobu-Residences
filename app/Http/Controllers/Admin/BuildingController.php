<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BuildingController extends Controller
{
    /**
     * Resolve building from slug (either UUID or name-slug-uuid format)
     */
    private function resolveBuildingFromSlug($buildingSlug)
    {
        // First try to find by UUID directly
        $building = Building::find($buildingSlug);
        
        if (!$building) {
            // Try to extract UUID from slug format (name-slug-uuid)
            $uuidPattern = '/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i';
            if (preg_match($uuidPattern, $buildingSlug, $matches)) {
                $building = Building::find($matches[1]);
            }
        }
        
        if (!$building) {
            abort(404, 'Building not found');
        }
        
        return $building;
    }

    public function index()
    {
        $buildings = Building::with(['developer', 'amenities'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Buildings/Index', [
            'buildings' => $buildings->through(function ($building) {
                return [
                    'id' => $building->id,
                    'name' => $building->name,
                    'address' => $building->address,
                    'city' => $building->city,
                    'province' => $building->province,
                    'developer' => $building->developer,
                    'management_name' => $building->management_name,
                    'date_registered' => $building->date_registered,
                    'building_type' => $building->building_type,
                    'status' => $building->status ?? 'pending',
                    'is_featured' => $building->is_featured ?? false,
                    'main_image' => $building->main_image,
                    'created_at' => $building->created_at->format('Y-m-d'),
                ];
            }),
            'links' => $buildings->links(),
        ]);
    }

    public function create()
    {
        $developers = \App\Models\Developer::orderBy('name')->get();
        $amenities = \App\Models\Amenity::orderBy('name')->get()->map(function ($amenity) {
            return [
                'id' => $amenity->id,
                'name' => $amenity->name,
                'icon' => $amenity->icon
            ];
        });

        // Get all active maintenance fee amenities
        $maintenanceFeeAmenities = \App\Models\MaintenanceFeeAmenity::active()
            ->ordered()
            ->get()
            ->map(function ($amenity) {
                return [
                    'id' => $amenity->id,
                    'name' => $amenity->name,
                    'icon' => $amenity->icon,
                    'category' => $amenity->category
                ];
            });

        return Inertia::render('Admin/Buildings/Create', [
            'developers' => $developers,
            'amenities' => $amenities,
            'maintenanceFeeAmenities' => $maintenanceFeeAmenities
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'street_address_1' => 'nullable|string|max:255',
            'street_address_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'neighbourhood' => 'nullable|string|max:255',
            'sub_neighbourhood' => 'nullable|string|max:255',
            'province' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'building_type' => 'nullable|string|max:50',
            'total_units' => 'nullable|integer',
            'year_built' => 'nullable|integer',
            'description' => 'nullable|string',
            'main_image' => 'nullable|string',
            'images' => 'nullable|array',
            'developer_id' => 'nullable|exists:developers,id',
            'developer_name' => 'nullable|string|max:255',
            'management_name' => 'nullable|string|max:255',
            'corp_number' => 'nullable|string|max:100',
            'date_registered' => 'nullable|date',
            'status' => 'nullable|string|in:active,inactive,pending,pre_construction,under_construction,completed,sold_out',
            'listing_type' => 'nullable|string|in:For Sale,For Rent,Both',
            'is_featured' => 'nullable|boolean',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'floors' => 'nullable|integer',
            'parking_spots' => 'nullable|integer',
            'locker_spots' => 'nullable|integer',
            'maintenance_fee_range' => 'nullable|string',
            'price_range' => 'nullable|string',
            'website_url' => 'nullable|string',
            'virtual_tour_url' => 'nullable|string',
            'amenity_ids' => 'nullable|array',
            'amenity_ids.*' => 'exists:amenities,id',
            'maintenance_fee_amenity_ids' => 'nullable|array',
            'maintenance_fee_amenity_ids.*' => 'exists:maintenance_fee_amenities,id',
        ]);

        // Extract amenity IDs for the relationship
        $amenityIds = $validated['amenity_ids'] ?? [];
        unset($validated['amenity_ids']);

        // Extract maintenance fee amenity IDs for the relationship
        $maintenanceFeeAmenityIds = $validated['maintenance_fee_amenity_ids'] ?? [];
        unset($validated['maintenance_fee_amenity_ids']);

        // Log the amenity IDs for debugging
        \Log::info('Creating building with amenities', [
            'request_all' => $request->all(),
            'amenity_ids' => $amenityIds,
            'amenity_count' => count($amenityIds),
            'maintenance_fee_amenity_ids' => $maintenanceFeeAmenityIds,
            'maintenance_fee_amenity_count' => count($maintenanceFeeAmenityIds)
        ]);

        $building = Building::create($validated);

        // Attach amenities if provided
        if (!empty($amenityIds)) {
            $building->amenities()->attach($amenityIds);

            \Log::info('Attached amenities to new building', [
                'building_id' => $building->id,
                'building_name' => $building->name,
                'amenity_ids' => $amenityIds,
                'amenity_count' => count($amenityIds)
            ]);
        }

        // Attach maintenance fee amenities if provided
        if (!empty($maintenanceFeeAmenityIds)) {
            $building->maintenanceFeeAmenities()->attach($maintenanceFeeAmenityIds);

            \Log::info('Attached maintenance fee amenities to new building', [
                'building_id' => $building->id,
                'building_name' => $building->name,
                'maintenance_fee_amenity_ids' => $maintenanceFeeAmenityIds,
                'maintenance_fee_amenity_count' => count($maintenanceFeeAmenityIds)
            ]);
        }

        return redirect()->route('admin.buildings.index')
            ->with('success', 'Building created successfully.');
    }

    public function show($buildingSlug)
    {
        $building = $this->resolveBuildingFromSlug($buildingSlug);
        $building->load(['developer', 'properties']);

        // Use direct query for amenities due to eager loading issue with UUIDs
        $building->setRelation('amenities', $building->amenities()->get());

        return Inertia::render('Admin/Buildings/Show', [
            'building' => $building
        ]);
    }

    public function edit($buildingSlug)
    {
        $building = $this->resolveBuildingFromSlug($buildingSlug);
        $developers = \App\Models\Developer::orderBy('name')->get();
        $amenities = \App\Models\Amenity::orderBy('name')->get()->map(function ($amenity) {
            return [
                'id' => $amenity->id,
                'name' => $amenity->name,
                'icon' => $amenity->icon
            ];
        });

        // Get all active maintenance fee amenities
        $maintenanceFeeAmenities = \App\Models\MaintenanceFeeAmenity::active()
            ->ordered()
            ->get()
            ->map(function ($amenity) {
                return [
                    'id' => $amenity->id,
                    'name' => $amenity->name,
                    'icon' => $amenity->icon,
                    'category' => $amenity->category
                ];
            });

        // Load the building relationships
        $building->load(['developer', 'maintenanceFeeAmenities']);

        // Get building amenities with explicit query to ensure we get the data
        $buildingAmenities = $building->amenities()->get();

        // Log for debugging
        \Log::info('Edit page amenities debug', [
            'building_id' => $building->id,
            'building_name' => $building->name,
            'amenities_count' => $buildingAmenities->count(),
            'amenity_ids' => $buildingAmenities->pluck('id')->toArray(),
            'amenity_names' => $buildingAmenities->pluck('name')->toArray(),
            'total_available_amenities' => $amenities->count()
        ]);

        return Inertia::render('Admin/Buildings/Edit', [
            'building' => [
                'id' => $building->id,
                'name' => $building->name,
                'address' => $building->address,
                'street_address_1' => $building->street_address_1,
                'street_address_2' => $building->street_address_2,
                'city' => $building->city,
                'neighbourhood' => $building->neighbourhood,
                'sub_neighbourhood' => $building->sub_neighbourhood,
                'province' => $building->province,
                'postal_code' => $building->postal_code,
                'country' => $building->country,
                'building_type' => $building->building_type,
                'total_units' => $building->total_units,
                'year_built' => $building->year_built,
                'description' => $building->description,
                'main_image' => $building->main_image,
                'images' => $building->images,
                'developer_id' => $building->developer_id,
                'developer_name' => $building->developer_name,
                'management_name' => $building->management_name,
                'corp_number' => $building->corp_number,
                'date_registered' => $building->date_registered ? $building->date_registered->format('Y-m-d') : null,
                'status' => $building->status,
                'is_featured' => $building->is_featured,
                'latitude' => $building->latitude,
                'longitude' => $building->longitude,
                'floors' => $building->floors,
                'parking_spots' => $building->parking_spots,
                'locker_spots' => $building->locker_spots,
                'maintenance_fee_range' => $building->maintenance_fee_range,
                'price_range' => $building->price_range,
                'website_url' => $building->website_url,
                'floor_plans' => $building->floor_plans,
                'virtual_tour_url' => $building->virtual_tour_url,
                'features' => $building->features,
                'nearby_transit' => $building->nearby_transit,
                'neighborhood_info' => $building->neighborhood_info,
                'deposit_structure' => $building->deposit_structure,
                'estimated_completion' => $building->estimated_completion,
                'architect' => $building->architect,
                'interior_designer' => $building->interior_designer,
                'landscape_architect' => $building->landscape_architect,
                'amenity_ids' => $buildingAmenities->pluck('id')->toArray(),
                'maintenance_fee_amenity_ids' => $building->maintenanceFeeAmenities->pluck('id')->toArray(),
            ],
            'developers' => $developers,
            'amenities' => $amenities,
            'maintenanceFeeAmenities' => $maintenanceFeeAmenities
        ]);
    }

    public function update(Request $request, $buildingSlug)
    {
        $building = $this->resolveBuildingFromSlug($buildingSlug);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'street_address_1' => 'nullable|string|max:255',
            'street_address_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'neighbourhood' => 'nullable|string|max:255',
            'sub_neighbourhood' => 'nullable|string|max:255',
            'province' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'building_type' => 'nullable|string|max:50',
            'total_units' => 'nullable|integer',
            'year_built' => 'nullable|integer',
            'description' => 'nullable|string',
            'main_image' => 'nullable|string',
            'images' => 'nullable|array',
            'developer_id' => 'nullable|exists:developers,id',
            'developer_name' => 'nullable|string|max:255',
            'management_name' => 'nullable|string|max:255',
            'corp_number' => 'nullable|string|max:100',
            'date_registered' => 'nullable|date',
            'status' => 'nullable|string|in:active,inactive,pending,pre_construction,under_construction,completed,sold_out',
            'listing_type' => 'nullable|string|in:For Sale,For Rent,Both',
            'is_featured' => 'nullable|boolean',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'floors' => 'nullable|integer',
            'parking_spots' => 'nullable|integer',
            'locker_spots' => 'nullable|integer',
            'maintenance_fee_range' => 'nullable|string',
            'price_range' => 'nullable|string',
            'website_url' => 'nullable|string',
            'virtual_tour_url' => 'nullable|string',
            'features' => 'nullable|array',
            'nearby_transit' => 'nullable|array',
            'neighborhood_info' => 'nullable|string',
            'deposit_structure' => 'nullable|string',
            'estimated_completion' => 'nullable|string',
            'architect' => 'nullable|string',
            'interior_designer' => 'nullable|string',
            'landscape_architect' => 'nullable|string',
            'amenity_ids' => 'nullable|array',
            'amenity_ids.*' => 'exists:amenities,id',
            'maintenance_fee_amenity_ids' => 'nullable|array',
            'maintenance_fee_amenity_ids.*' => 'exists:maintenance_fee_amenities,id',
        ]);

        // Extract amenity IDs for the relationship
        $amenityIds = $validated['amenity_ids'] ?? [];
        unset($validated['amenity_ids']);

        // Extract maintenance fee amenity IDs for the relationship
        $maintenanceFeeAmenityIds = $validated['maintenance_fee_amenity_ids'] ?? [];
        unset($validated['maintenance_fee_amenity_ids']);

        // Log the amenity IDs for debugging
        \Log::info('Updating building amenities', [
            'building_id' => $building->id,
            'building_name' => $building->name,
            'amenity_ids' => $amenityIds,
            'amenity_count' => count($amenityIds),
            'maintenance_fee_amenity_ids' => $maintenanceFeeAmenityIds,
            'maintenance_fee_amenity_count' => count($maintenanceFeeAmenityIds),
            'request_data_keys' => array_keys($request->all())
        ]);

        // Update building basic info (excluding amenities)
        $building->update($validated);

        // Sync amenities - this will add/remove relationships as needed
        if (!empty($amenityIds)) {
            $result = $building->amenities()->sync($amenityIds);

            \Log::info('Successfully synced amenities', [
                'building_id' => $building->id,
                'building_name' => $building->name,
                'amenity_ids' => $amenityIds,
                'sync_result' => $result,
                'attached' => $result['attached'] ?? [],
                'detached' => $result['detached'] ?? [],
                'updated' => $result['updated'] ?? []
            ]);
        } else {
            // Remove all amenities if none selected
            $result = $building->amenities()->detach();
            \Log::info('Detached all amenities', [
                'building_id' => $building->id,
                'building_name' => $building->name,
                'detach_result' => $result
            ]);
        }

        // Sync maintenance fee amenities - this will add/remove relationships as needed
        \Log::info('About to sync maintenance fee amenities', [
            'building_id' => $building->id,
            'building_name' => $building->name,
            'maintenance_fee_amenity_ids' => $maintenanceFeeAmenityIds,
            'count' => count($maintenanceFeeAmenityIds),
            'is_empty' => empty($maintenanceFeeAmenityIds)
        ]);

        if (!empty($maintenanceFeeAmenityIds)) {
            $result = $building->maintenanceFeeAmenities()->sync($maintenanceFeeAmenityIds);

            \Log::info('Successfully synced maintenance fee amenities', [
                'building_id' => $building->id,
                'building_name' => $building->name,
                'maintenance_fee_amenity_ids' => $maintenanceFeeAmenityIds,
                'sync_result' => $result,
                'attached' => $result['attached'] ?? [],
                'detached' => $result['detached'] ?? [],
                'updated' => $result['updated'] ?? []
            ]);
        } else {
            // Remove all maintenance fee amenities if none selected
            $result = $building->maintenanceFeeAmenities()->detach();
            \Log::info('Detached all maintenance fee amenities', [
                'building_id' => $building->id,
                'building_name' => $building->name,
                'detach_result' => $result
            ]);
        }

        return redirect()->route('admin.buildings.index')
            ->with('success', 'Building updated successfully.');
    }

    public function destroy($buildingSlug)
    {
        $building = $this->resolveBuildingFromSlug($buildingSlug);
        $building->delete();

        return redirect()->route('admin.buildings.index')
            ->with('success', 'Building deleted successfully.');
    }

    /**
     * Search buildings for the public search page
     */
    public function searchBuildings(Request $request)
    {
        try {
            $searchParams = $request->input('search_params', []);
            
            // Get pagination parameters
            $page = $searchParams['page'] ?? 1;
            $pageSize = $searchParams['page_size'] ?? 16;
            
            // Build query
            $query = Building::with(['developer', 'amenities']);
            
            // Apply filters ONLY if explicitly provided
            if (!empty($searchParams['query'])) {
                $searchTerm = $searchParams['query'];
                $query->where(function($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('address', 'like', "%{$searchTerm}%")
                      ->orWhere('city', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%");
                });
            }
            
            // Apply status filter ONLY if explicitly provided and not default values
            if (!empty($searchParams['status']) && 
                $searchParams['status'] !== 'All' && 
                $searchParams['status'] !== 'For Sale') {
                $query->where('status', $searchParams['status']);
            }
            
            // Apply floors filter for buildings ONLY if greater than 0
            if (!empty($searchParams['floors']) && $searchParams['floors'] > 0) {
                $query->where('floors', '>=', $searchParams['floors']);
            }
            
            // Apply price filters ONLY if they are meaningful
            if (!empty($searchParams['price_min']) && $searchParams['price_min'] > 0) {
                $query->where('price_range', '>=', $searchParams['price_min']);
            }
            
            if (!empty($searchParams['price_max']) && $searchParams['price_max'] < 10000000) {
                $query->where('price_range', '<=', $searchParams['price_max']);
            }
            
            // Get total count before pagination
            $totalCount = $query->count();
            
            // Apply pagination
            $buildings = $query->orderBy('created_at', 'desc')
                              ->skip(($page - 1) * $pageSize)
                              ->take($pageSize)
                              ->get();
            
            // Format buildings for response
            $formattedBuildings = $buildings->map(function($building) {
                return [
                    'id' => $building->id,
                    'name' => $building->name,
                    'address' => $building->address,
                    'city' => $building->city,
                    'province' => $building->province,
                    'postal_code' => $building->postal_code,
                    'price_range' => $building->price_range,
                    'total_units' => $building->total_units,
                    'floors' => $building->floors,
                    'status' => $building->status,
                    'year_built' => $building->year_built,
                    'description' => $building->description,
                    'features' => $building->features ?? [],
                    'images' => $building->images ?? [],
                    'main_image' => $building->main_image,
                    'building_type' => $building->building_type,
                    'amenities' => $building->amenities ? $building->amenities->map(function($amenity) {
                        return [
                            'id' => $amenity->id,
                            'name' => $amenity->name,
                            'icon' => $amenity->icon,
                        ];
                    }) : [],
                    'developer' => $building->developer ? [
                        'id' => $building->developer->id,
                        'name' => $building->developer->name,
                    ] : null,
                    'developer_name' => $building->developer_name ?? ($building->developer ? $building->developer->name : null),
                    'latitude' => $building->latitude,
                    'longitude' => $building->longitude,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => [
                    'buildings' => $formattedBuildings,
                    'total' => $totalCount,
                    'displayed' => count($formattedBuildings),
                    'page' => (int)$page,
                    'page_size' => (int)$pageSize,
                    'has_more' => count($formattedBuildings) >= $pageSize
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Buildings search error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to search buildings: ' . $e->getMessage()
            ], 500);
        }
    }
}