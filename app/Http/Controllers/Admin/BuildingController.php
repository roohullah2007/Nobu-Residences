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
     * Re-distribute a flat additional_addresses list back into the
     * structured street_address_1 / street_address_2 / additional columns.
     *
     * The admin form now shows a single "Additional Street Addresses"
     * repeater and submits the full list under that one key. Search and
     * listings still rely on street_address_1/2 being populated, so:
     *   - first item  -> street_address_1
     *   - second item -> street_address_2
     *   - rest        -> additional_addresses
     *
     * Runs after expandAddressRangeIntoStructuredFields and only when the
     * latter didn't already populate the structured columns (i.e. the
     * primary Address isn't a hyphen-range like NOBU's "15 Mercer St,
     * 35 Mercer").
     *
     * Mutates $validated in place.
     */
    private function distributeAdditionalAddresses(array &$validated): void
    {
        // The range-expand pass already filled these — leave it alone.
        if (!empty($validated['street_address_1']) || !empty($validated['street_address_2'])) {
            return;
        }
        $list = $validated['additional_addresses'] ?? null;
        if (!is_array($list) || empty($list)) {
            return;
        }
        $clean = array_values(array_filter(
            array_map(fn($a) => is_string($a) ? trim($a) : $a, $list),
            fn($a) => !empty($a)
        ));
        if (empty($clean)) {
            return;
        }
        $validated['street_address_1'] = $clean[0] ?? null;
        $validated['street_address_2'] = $clean[1] ?? null;
        $rest = array_values(array_slice($clean, 2));
        $validated['additional_addresses'] = !empty($rest) ? $rest : null;
    }

    /**
     * If `address` is a hyphen-range like "8-38 Widmer St, Toronto", expand it
     * into street_address_1 + street_address_2 + additional_addresses so the
     * search/listings pipeline doesn't depend on whoever edited the building
     * remembering to click the front-end "Expand" button.
     *
     * Strips the trailing ", City" / ", ON …" before storing each entry so
     * each row looks like "8 Widmer St" — PropertySearchController splits the
     * joined street_addresses on "," and was treating the city as a phantom
     * address.
     *
     * Mutates $validated in place. No-op when `address` isn't a hyphen-range
     * (e.g. NOBU's "15 Mercer St, 35 Mercer" — comma list, no hyphen between
     * the two numbers — keeps its admin-curated structured fields).
     */
    private function expandAddressRangeIntoStructuredFields(array &$validated): void
    {
        $address = $validated['address'] ?? null;
        if (!is_string($address) || !preg_match('/^(\d+)\s*[-\x{2013}\x{2014}]\s*(\d+)\s+(.+)$/u', trim($address), $m)) {
            return;
        }
        $start = (int) $m[1];
        $end = (int) $m[2];
        // Guard against typos / pathological ranges. 50 covers every Toronto
        // condo block we care about; anything bigger is almost certainly a
        // mistake we'd rather surface than silently fan out.
        if ($end <= $start || ($end - $start) > 50) {
            return;
        }
        // "Widmer St, Toronto" / "Widmer St, ON M5V 0K6" → "Widmer St"
        $streetPart = trim(preg_split('/\s*,/', $m[3])[0] ?? $m[3]);
        if ($streetPart === '') {
            return;
        }
        $expanded = [];
        for ($n = $start; $n <= $end; $n++) {
            $expanded[] = $n . ' ' . $streetPart;
        }
        $validated['street_address_1'] = $expanded[0] ?? null;
        $validated['street_address_2'] = $expanded[1] ?? null;
        $rest = array_values(array_slice($expanded, 2));
        $validated['additional_addresses'] = !empty($rest) ? $rest : null;
    }

    /**
     * Admins paste bare domains ("wellcondostoronto.ca"); without a scheme the
     * value renders as a relative link on the site. Prepend https:// when
     * missing. Mutates $validated in place.
     */
    private function normalizeUrlFields(array &$validated): void
    {
        foreach (['website_url', 'virtual_tour_url'] as $field) {
            $value = trim((string) ($validated[$field] ?? ''));
            if ($value === '' || preg_match('#^https?://#i', $value)) {
                continue;
            }
            $validated[$field] = 'https://' . $value;
        }
    }

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

        // Get neighbourhoods and sub-neighbourhoods for dropdowns
        $neighbourhoods = \App\Models\Neighbourhood::orderBy('name')->get();
        $subNeighbourhoods = \App\Models\SubNeighbourhood::with('neighbourhood')->orderBy('name')->get();

        return Inertia::render('Admin/Buildings/Create', [
            'developers' => $developers,
            'amenities' => $amenities,
            'maintenanceFeeAmenities' => $maintenanceFeeAmenities,
            'neighbourhoods' => $neighbourhoods,
            'subNeighbourhoods' => $subNeighbourhoods
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'street_address_1' => 'nullable|string|max:255',
            'street_address_2' => 'nullable|string|max:255',
            'additional_addresses' => 'nullable|array',
            'additional_addresses.*' => 'nullable|string|max:255',
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
            'logo' => 'nullable|string',
            'images' => 'nullable|array',
            'developer_id' => 'nullable|exists:developers,id',
            'neighbourhood_id' => 'nullable|exists:neighbourhoods,id',
            'sub_neighbourhood_id' => 'nullable|exists:sub_neighbourhoods,id',
            'developer_name' => 'nullable|string|max:255',
            'management_name' => 'nullable|string|max:255',
            'corp_number' => 'nullable|string|max:100',
            'date_registered' => 'nullable|date',
            'status' => 'nullable|string|in:active,inactive,pending',
            'development_status' => 'nullable|string|in:pre_construction,under_construction,completed,sold_out',
            'listing_type' => 'nullable|string|in:For Sale,For Rent,Both',
            'is_featured' => 'nullable|boolean',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'floors' => 'nullable|integer',
            'parking_spots' => 'nullable|integer',
            'locker_spots' => 'nullable|integer',
            'maintenance_fee_range' => 'nullable|string',
            'parking_maintenance_fee' => 'nullable|numeric|min:0|max:99999',
            'locker_maintenance_fee' => 'nullable|numeric|min:0|max:99999',
            'price_range' => 'nullable|string',
            'sqft_range' => 'nullable|string|max:100',
            'avg_price_per_sqft' => 'nullable|string|max:50',
            'website_url' => 'nullable|string',
            'virtual_tour_url' => 'nullable|string',
            'architect' => 'nullable|string',
            'amenity_ids' => 'nullable|array',
            'amenity_ids.*' => 'exists:amenities,id',
            'maintenance_fee_amenity_ids' => 'nullable|array',
            'maintenance_fee_amenity_ids.*' => 'exists:maintenance_fee_amenities,id',
        ]);

        $this->normalizeUrlFields($validated);

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

        // Auto-expand "8-38 Widmer St, Toronto" → fills street_address_1/2 +
        // additional_addresses. Overrides whatever the client sent for those
        // fields when the primary address is a range, so the source of truth
        // stays consistent.
        $this->expandAddressRangeIntoStructuredFields($validated);
        // For non-range addresses, take the submitted flat list of
        // additional_addresses and re-distribute the first two entries
        // into street_address_1/2 so search/listings still work.
        $this->distributeAdditionalAddresses($validated);

        // Drop empty entries from additional_addresses before saving
        if (isset($validated['additional_addresses']) && is_array($validated['additional_addresses'])) {
            $validated['additional_addresses'] = array_values(array_filter(
                array_map(fn($a) => is_string($a) ? trim($a) : $a, $validated['additional_addresses']),
                fn($a) => !empty($a)
            ));
            if (empty($validated['additional_addresses'])) {
                $validated['additional_addresses'] = null;
            }
        }

        // Drop additional_addresses if the column hasn't been migrated on this
        // environment yet — prevents a 500 on production until `php artisan
        // migrate` runs the 2026_05_17 migration.
        if (array_key_exists('additional_addresses', $validated)
            && !\Schema::hasColumn('buildings', 'additional_addresses')) {
            unset($validated['additional_addresses']);
            \Log::warning('buildings.additional_addresses column missing — value dropped on save. Run `php artisan migrate`.');
        }

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

        // Price range is no longer typed in by the admin — auto-fill it from
        // live MLS listings after the response is sent (no queue worker needed).
        \App\Jobs\RefreshBuildingPriceRangeJob::dispatchAfterResponse($building->id);

        // "Save & Launch Website" on the create form: land on the website
        // create page with the new building preselected instead of the index.
        if ($request->boolean('create_website')) {
            return redirect()->route('admin.websites.create', ['building_id' => $building->id])
                ->with('success', 'Building created successfully. Now set up its website.');
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

        // available_units_count is an accessor without $appends, so it never
        // reaches the frontend (the page always showed 0). Listings are live
        // MLS, not local properties — use the cached live counts (10 min TTL,
        // fails soft to 0/0 when the API is unreachable).
        $buildingData = $building->toArray();
        $counts = $building->getLiveListingCounts();
        $buildingData['units_for_sale'] = $counts['sale'] ?? 0;
        $buildingData['units_for_rent'] = $counts['rent'] ?? 0;
        $buildingData['available_units_count'] = ($counts['sale'] ?? 0) + ($counts['rent'] ?? 0);

        return Inertia::render('Admin/Buildings/Show', [
            'building' => $buildingData
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

        // Get all active neighbourhoods for dropdown
        $neighbourhoods = \App\Models\Neighbourhood::active()
            ->ordered()
            ->get()
            ->map(function ($neighbourhood) {
                return [
                    'id' => $neighbourhood->id,
                    'name' => $neighbourhood->name,
                    'city' => $neighbourhood->city
                ];
            });

        // Get all active sub-neighbourhoods for dropdown
        $subNeighbourhoods = \App\Models\SubNeighbourhood::active()
            ->ordered()
            ->with('neighbourhood')
            ->get()
            ->map(function ($subNeighbourhood) {
                return [
                    'id' => $subNeighbourhood->id,
                    'name' => $subNeighbourhood->name,
                    'neighbourhood_id' => $subNeighbourhood->neighbourhood_id,
                    'neighbourhood_name' => $subNeighbourhood->neighbourhood?->name
                ];
            });

        // Load the building relationships
        $building->load(['developer', 'maintenanceFeeAmenities', 'neighbourhoodTaxonomy', 'subNeighbourhoodTaxonomy']);

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
                'additional_addresses' => $building->additional_addresses ?? [],
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
                'logo' => $building->logo,
                'images' => $building->images,
                'developer_id' => $building->developer_id,
                'developer_name' => $building->developer_name,
                'management_name' => $building->management_name,
                'corp_number' => $building->corp_number,
                'date_registered' => $building->date_registered ? $building->date_registered->format('Y-m-d') : null,
                'status' => $building->status,
                'development_status' => $building->development_status,
                'is_featured' => $building->is_featured,
                'latitude' => $building->latitude,
                'longitude' => $building->longitude,
                'floors' => $building->floors,
                'parking_spots' => $building->parking_spots,
                'locker_spots' => $building->locker_spots,
                'maintenance_fee_range' => $building->maintenance_fee_range,
                'parking_maintenance_fee' => $building->parking_maintenance_fee,
                'locker_maintenance_fee' => $building->locker_maintenance_fee,
                'price_range' => $building->price_range,
                'sqft_range' => $building->sqft_range,
                'avg_price_per_sqft' => $building->avg_price_per_sqft,
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
                'neighbourhood_id' => $building->neighbourhood_id,
                'sub_neighbourhood_id' => $building->sub_neighbourhood_id,
            ],
            'developers' => $developers,
            'amenities' => $amenities,
            'maintenanceFeeAmenities' => $maintenanceFeeAmenities,
            'neighbourhoods' => $neighbourhoods,
            'subNeighbourhoods' => $subNeighbourhoods,
            // Standalone website launched for this building (if any) — powers
            // the "Launch Website" / "View Website" header action.
            'linkedWebsite' => \App\Models\Website::where('homepage_building_id', $building->id)
                ->select('id', 'name', 'domain', 'slug')
                ->first(),
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
            'additional_addresses' => 'nullable|array',
            'additional_addresses.*' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'neighbourhood' => 'nullable|string|max:255',
            'neighbourhood_id' => 'nullable|exists:neighbourhoods,id',
            'sub_neighbourhood' => 'nullable|string|max:255',
            'sub_neighbourhood_id' => 'nullable|exists:sub_neighbourhoods,id',
            'province' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'building_type' => 'nullable|string|max:50',
            'total_units' => 'nullable|integer',
            'year_built' => 'nullable|integer',
            'description' => 'nullable|string',
            'main_image' => 'nullable|string',
            'logo' => 'nullable|string',
            'images' => 'nullable|array',
            'developer_id' => 'nullable|exists:developers,id',
            'developer_name' => 'nullable|string|max:255',
            'management_name' => 'nullable|string|max:255',
            'corp_number' => 'nullable|string|max:100',
            'date_registered' => 'nullable|date',
            'status' => 'nullable|string|in:active,inactive,pending',
            'development_status' => 'nullable|string|in:pre_construction,under_construction,completed,sold_out',
            'listing_type' => 'nullable|string|in:For Sale,For Rent,Both',
            'is_featured' => 'nullable|boolean',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'floors' => 'nullable|integer',
            'parking_spots' => 'nullable|integer',
            'locker_spots' => 'nullable|integer',
            'maintenance_fee_range' => 'nullable|string',
            'parking_maintenance_fee' => 'nullable|numeric|min:0|max:99999',
            'locker_maintenance_fee' => 'nullable|numeric|min:0|max:99999',
            'price_range' => 'nullable|string',
            'sqft_range' => 'nullable|string|max:100',
            'avg_price_per_sqft' => 'nullable|string|max:50',
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

        $this->normalizeUrlFields($validated);

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

        // Auto-expand "8-38 Widmer St, Toronto" → fills street_address_1/2 +
        // additional_addresses. Overrides whatever the client sent for those
        // fields when the primary address is a range, so the source of truth
        // stays consistent.
        $this->expandAddressRangeIntoStructuredFields($validated);
        // For non-range addresses, take the submitted flat list of
        // additional_addresses and re-distribute the first two entries
        // into street_address_1/2 so search/listings still work.
        $this->distributeAdditionalAddresses($validated);

        // Drop empty entries from additional_addresses before saving
        if (array_key_exists('additional_addresses', $validated)) {
            $list = is_array($validated['additional_addresses']) ? $validated['additional_addresses'] : [];
            $list = array_values(array_filter(
                array_map(fn($a) => is_string($a) ? trim($a) : $a, $list),
                fn($a) => !empty($a)
            ));
            $validated['additional_addresses'] = !empty($list) ? $list : null;
        }

        // Drop additional_addresses if the column hasn't been migrated yet
        if (array_key_exists('additional_addresses', $validated)
            && !\Schema::hasColumn('buildings', 'additional_addresses')) {
            unset($validated['additional_addresses']);
            \Log::warning('buildings.additional_addresses column missing — value dropped on update. Run `php artisan migrate`.');
        }

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

        // Re-derive the MLS-backed price range after every save — the admin
        // form no longer exposes a manual Price Range input.
        \App\Jobs\RefreshBuildingPriceRangeJob::dispatchAfterResponse($building->id);

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
     * Bulk delete from the buildings list (checkbox selection). Same
     * soft-delete as destroy(), applied per model so delete hooks keep
     * firing; websites linked via homepage_building_id keep working and
     * simply stop resolving the building.
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'buildings' => 'required|array|min:1',
            'buildings.*' => 'exists:buildings,id',
        ]);

        $buildings = Building::whereIn('id', $validated['buildings'])->get();
        foreach ($buildings as $building) {
            $building->delete();
        }
        $count = $buildings->count();

        return redirect()->back()
            ->with('success', $count . ' ' . ($count === 1 ? 'building' : 'buildings') . ' deleted successfully.');
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
            
            // Cache the formatted result. The slow part is getLiveListingCounts()
            // per building (a Repliers round-trip each); buildings + their counts
            // change slowly, so a short TTL keeps the Buildings tab fast.
            $cacheKey = 'buildings_search_' . md5(json_encode([
                $searchParams['query'] ?? '',
                $searchParams['status'] ?? '',
                $searchParams['floors'] ?? '',
                $searchParams['price_min'] ?? '',
                $searchParams['price_max'] ?? '',
                (int) $page,
                (int) $pageSize,
            ]));

            $data = \Cache::remember($cacheKey, now()->addMinutes(10), function () use ($searchParams, $page, $pageSize) {
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
                // IMPORTANT: do NOT call getLiveListingCounts() here — it makes
                // ~2 Repliers round-trips per building (sale + lease), which made
                // a cold-cache page of 16 buildings ~30s and 500 (PHP timeout).
                // Read the per-building count from cache only; when it's absent
                // we return null counts (a "loading" state) and the frontend
                // fills them in afterwards via POST /api/buildings-counts, which
                // fetches them in parallel. The list query itself is pure DB.
                $counts = \Cache::get('building_listing_counts:' . $building->id);
                // IMPORTANT: the buildings table has a physical `developer`
                // COLUMN (usually null), which shadows the developer()
                // relation on property access — $building->developer returns
                // the column, never the eager-loaded model. Read the relation
                // explicitly so the payload carries id/name/slug.
                $developer = $building->relationLoaded('developer')
                    ? $building->getRelation('developer')
                    : null;
                return [
                    'id' => $building->id,
                    'name' => $building->name,
                    'address' => $building->address,
                    'street_address_1' => $building->street_address_1,
                    'street_address_2' => $building->street_address_2,
                    'city' => $building->city,
                    'province' => $building->province,
                    'postal_code' => $building->postal_code,
                    'price_range' => $building->price_range,
                    'total_units' => $building->total_units,
                    // null = "unknown/loading" — frontend resolves it via
                    // /api/buildings-counts. Only a cache HIT yields a number here.
                    'units_for_sale' => is_array($counts) ? $counts['sale'] : null,
                    'units_for_rent' => is_array($counts) ? $counts['rent'] : null,
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
                    'developer' => $developer ? [
                        'id' => $developer->id,
                        'name' => $developer->name,
                        // Canonical /developer/{slug} URL segment for card links
                        'slug' => $developer->slug,
                    ] : null,
                    'developer_id' => $building->developer_id,
                    'developer_name' => $building->developer_name ?? ($developer ? $developer->name : null),
                    'latitude' => $building->latitude,
                    'longitude' => $building->longitude,
                ];
            });
            
                return [
                    'buildings' => $formattedBuildings,
                    'total' => $totalCount,
                    'displayed' => count($formattedBuildings),
                    'page' => (int)$page,
                    'page_size' => (int)$pageSize,
                    'has_more' => count($formattedBuildings) >= $pageSize
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            \Log::error('Buildings search error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to search buildings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lightweight live-counts endpoint for the Buildings tab.
     *
     * The list endpoint (searchBuildings) renders the cards instantly using
     * pure DB data + whatever per-building counts are already cached. The
     * frontend then calls THIS endpoint with the IDs currently on screen
     * (<=16) to fill in the live for-sale/for-rent numbers.
     *
     * Counts come from Building::getLiveListingCounts() (Repliers-backed,
     * cached 600s per building). We fetch all the needed Repliers queries
     * CONCURRENTLY (Guzzle async pool, capped concurrency) so ~32 requests
     * finish in a few seconds instead of ~30s serially. A building whose
     * fetch fails returns 0/0 rather than failing the whole batch.
     *
     * Request:  { ids: ["uuid", ...] }
     * Response: { success: true, counts: { "uuid": { sale: int, rent: int }, ... } }
     */
    public function buildingCounts(Request $request)
    {
        try {
            $ids = $request->input('ids', []);
            if (!is_array($ids)) {
                $ids = [];
            }
            // Cap the batch — the frontend only ever shows a page (16).
            $ids = array_slice(array_values(array_filter($ids)), 0, 24);

            if (empty($ids)) {
                return response()->json(['success' => true, 'counts' => (object) []]);
            }

            $buildings = Building::whereIn('id', $ids)->get();

            $counts = [];
            $toCompute = [];

            // Serve cache hits immediately; collect misses for a parallel fetch.
            foreach ($buildings as $building) {
                $cached = \Cache::get('building_listing_counts:' . $building->id);
                if (is_array($cached)) {
                    $counts[$building->id] = ['sale' => $cached['sale'], 'rent' => $cached['rent']];
                } else {
                    $toCompute[] = $building;
                }
            }

            if (!empty($toCompute)) {
                $computed = $this->computeCountsConcurrently($toCompute);
                foreach ($computed as $id => $c) {
                    $counts[$id] = $c;
                }
            }

            return response()->json([
                'success' => true,
                'counts' => $counts,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Buildings counts error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch building counts',
            ], 500);
        }
    }

    /**
     * Compute live sale/rent counts for the given buildings, running every
     * Repliers query concurrently via a single Guzzle async pool, then
     * caching each building's result for 600s (same key/TTL as
     * Building::getLiveListingCounts so both paths share the cache).
     *
     * @param  \Illuminate\Support\Collection|array  $buildings
     * @return array<string, array{sale:int, rent:int}>
     */
    private function computeCountsConcurrently($buildings): array
    {
        $api = app(\App\Services\RepliersApiService::class);

        // Build the flat list of Repliers queries we need. Each building groups
        // its addresses by street name (mirrors getLiveListingCounts) and emits
        // a {sale, lease} query per street group.
        $requests = [];          // index => ['params' => [...], 'numbers' => [...]]
        $buildingMeta = [];      // building_id => ['sale' => 0, 'rent' => 0, 'requests' => [['idx'=>i,'type'=>'sale'], ...]]

        foreach ($buildings as $building) {
            $groups = $this->buildingStreetGroups($building);
            $buildingMeta[$building->id] = ['sale' => 0, 'rent' => 0, 'requests' => []];

            foreach ($groups as $g) {
                foreach (['sale', 'lease'] as $t) {
                    $params = [
                        'class' => 'condoProperty',
                        'status' => 'A',
                        'type' => $t,
                        'streetName' => $g['name'],
                        'pageNum' => 1,
                        'resultsPerPage' => 200,
                    ];
                    if (!empty($building->city)) {
                        $params['city'] = $building->city;
                    }
                    $idx = count($requests);
                    $requests[$idx] = ['params' => $params, 'numbers' => $g['numbers']];
                    $buildingMeta[$building->id]['requests'][] = ['idx' => $idx, 'type' => $t];
                }
            }
        }

        // Fire all requests concurrently and collect each response's listings.
        $listingsByIdx = !empty($requests)
            ? $api->searchListingsConcurrent(array_map(fn($r) => $r['params'], $requests))
            : [];

        // Tally matches per building.
        $result = [];
        foreach ($buildingMeta as $buildingId => $meta) {
            $sale = 0;
            $rent = 0;
            foreach ($meta['requests'] as $req) {
                $listings = $listingsByIdx[$req['idx']] ?? [];
                $numbers = $requests[$req['idx']]['numbers'];
                $matched = 0;
                foreach ($listings as $L) {
                    $num = (string) (
                        $L['address']['streetNumber']
                        ?? $L['StreetNumber']
                        ?? ''
                    );
                    if ($num !== '' && isset($numbers[$num])) {
                        $matched++;
                    }
                }
                if ($req['type'] === 'sale') {
                    $sale += $matched;
                } else {
                    $rent += $matched;
                }
            }
            $counts = ['sale' => $sale, 'rent' => $rent];
            // Cache with the same key/TTL getLiveListingCounts() uses so the
            // list endpoint picks these up on the next page load.
            \Cache::put('building_listing_counts:' . $buildingId, $counts, 600);
            $result[$buildingId] = $counts;
        }

        return $result;
    }

    /**
     * Parse a building's addresses into street-name groups (one Repliers query
     * per group). Mirrors the grouping logic in
     * Building::getLiveListingCounts() so counts stay identical.
     *
     * @return array<int, array{name:string, numbers:array<string,bool>}>
     */
    private function buildingStreetGroups(Building $building): array
    {
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
            if ($parsed = Building::parseStreetAddress($a)) {
                $key = strtolower($parsed['number'] . '|' . $parsed['name']);
                if (!isset($seen[$key])) {
                    $seen[$key] = true;
                    $addresses[] = $parsed;
                }
            }
        }
        if (empty($addresses) && !empty($building->address)) {
            $parts = preg_split('/\s*[,&]\s*/', $building->address);
            foreach (array_filter(array_map('trim', $parts)) as $part) {
                if ($parsed = Building::parseStreetAddress($part)) {
                    $key = strtolower($parsed['number'] . '|' . $parsed['name']);
                    if (!isset($seen[$key])) {
                        $seen[$key] = true;
                        $addresses[] = $parsed;
                    }
                }
            }
        }

        $groups = [];
        foreach ($addresses as $addr) {
            $key = strtolower($addr['name']);
            if (!isset($groups[$key])) {
                $groups[$key] = ['name' => $addr['name'], 'numbers' => []];
            }
            $groups[$key]['numbers'][$addr['number']] = true;
        }

        return array_values($groups);
    }
}