<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceFeeAmenity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceFeeAmenityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = MaintenanceFeeAmenity::query();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $amenities = $query->ordered()->paginate(15);

        // Get unique categories for filter
        $categories = MaintenanceFeeAmenity::distinct()->pluck('category')->filter();

        return Inertia::render('Admin/MaintenanceFeeAmenities/Index', [
            'amenities' => $amenities,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'is_active'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = MaintenanceFeeAmenity::distinct()->pluck('category')->filter();

        return Inertia::render('Admin/MaintenanceFeeAmenities/Create', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:maintenance_fee_amenities',
            'icon' => 'nullable|file|mimes:svg|max:2048',
            'category' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        // Handle file upload
        if ($request->hasFile('icon')) {
            $file = $request->file('icon');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('svgs'), $filename);
            $validated['icon'] = '/svgs/' . $filename;
        } else {
            unset($validated['icon']);
        }

        MaintenanceFeeAmenity::create($validated);

        return redirect()->route('admin.maintenance-fee-amenities.index')
            ->with('success', 'Maintenance fee amenity created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MaintenanceFeeAmenity $maintenanceFeeAmenity)
    {
        return Inertia::render('Admin/MaintenanceFeeAmenities/Show', [
            'amenity' => $maintenanceFeeAmenity
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MaintenanceFeeAmenity $maintenanceFeeAmenity)
    {
        $categories = MaintenanceFeeAmenity::distinct()->pluck('category')->filter();

        return Inertia::render('Admin/MaintenanceFeeAmenities/Edit', [
            'amenity' => $maintenanceFeeAmenity,
            'categories' => $categories
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MaintenanceFeeAmenity $maintenanceFeeAmenity)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:maintenance_fee_amenities,name,' . $maintenanceFeeAmenity->id,
            'icon' => 'nullable|file|mimes:svg|max:2048',
            'category' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        // Handle file upload
        if ($request->hasFile('icon')) {
            // Delete old icon if exists
            if ($maintenanceFeeAmenity->icon) {
                $oldIconPath = public_path(str_replace('/', DIRECTORY_SEPARATOR, $maintenanceFeeAmenity->icon));
                if (file_exists($oldIconPath)) {
                    unlink($oldIconPath);
                }
            }

            $file = $request->file('icon');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('svgs'), $filename);
            $validated['icon'] = '/svgs/' . $filename;
        } else {
            unset($validated['icon']);
        }

        $maintenanceFeeAmenity->update($validated);

        return redirect()->route('admin.maintenance-fee-amenities.index')
            ->with('success', 'Maintenance fee amenity updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MaintenanceFeeAmenity $maintenanceFeeAmenity)
    {
        $maintenanceFeeAmenity->delete();

        return redirect()->route('admin.maintenance-fee-amenities.index')
            ->with('success', 'Maintenance fee amenity deleted successfully.');
    }

    /**
     * Get all active maintenance fee amenities (for API)
     */
    public function getAllActive()
    {
        $amenities = MaintenanceFeeAmenity::active()
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

        return response()->json($amenities);
    }
}