<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Neighbourhood;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NeighbourhoodController extends Controller
{
    /**
     * Display a listing of neighbourhoods.
     */
    public function index(Request $request)
    {
        $query = Neighbourhood::query()->withCount(['subNeighbourhoods', 'buildings']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        // Filter by city
        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $neighbourhoods = $query->ordered()->paginate(20)->withQueryString();

        // Get unique cities for filter
        $cities = Neighbourhood::distinct()->whereNotNull('city')->pluck('city')->sort()->values();

        return Inertia::render('Admin/Neighbourhoods/Index', [
            'neighbourhoods' => $neighbourhoods,
            'cities' => $cities,
            'filters' => $request->only(['search', 'city', 'status'])
        ]);
    }

    /**
     * Show the form for creating a new neighbourhood.
     */
    public function create()
    {
        // Get unique cities from existing neighbourhoods
        $cities = Neighbourhood::distinct()->whereNotNull('city')->pluck('city')->sort()->values();

        return Inertia::render('Admin/Neighbourhoods/Create', [
            'cities' => $cities
        ]);
    }

    /**
     * Store a newly created neighbourhood.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $neighbourhood = Neighbourhood::create($validated);

        return redirect()->route('admin.neighbourhoods.index')
            ->with('success', 'Neighbourhood created successfully.');
    }

    /**
     * Show the form for editing the specified neighbourhood.
     */
    public function edit(Neighbourhood $neighbourhood)
    {
        $neighbourhood->loadCount(['subNeighbourhoods', 'buildings']);

        // Get unique cities from existing neighbourhoods
        $cities = Neighbourhood::distinct()->whereNotNull('city')->pluck('city')->sort()->values();

        return Inertia::render('Admin/Neighbourhoods/Edit', [
            'neighbourhood' => $neighbourhood,
            'cities' => $cities
        ]);
    }

    /**
     * Update the specified neighbourhood.
     */
    public function update(Request $request, Neighbourhood $neighbourhood)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $neighbourhood->update($validated);

        return redirect()->route('admin.neighbourhoods.index')
            ->with('success', 'Neighbourhood updated successfully.');
    }

    /**
     * Remove the specified neighbourhood.
     */
    public function destroy(Neighbourhood $neighbourhood)
    {
        // Check if neighbourhood has buildings
        if ($neighbourhood->buildings()->count() > 0) {
            return back()->with('error', 'Cannot delete neighbourhood with associated buildings.');
        }

        // Delete associated sub-neighbourhoods first
        $neighbourhood->subNeighbourhoods()->delete();
        $neighbourhood->delete();

        return redirect()->route('admin.neighbourhoods.index')
            ->with('success', 'Neighbourhood deleted successfully.');
    }

    /**
     * Get neighbourhoods for API (used by dropdowns)
     */
    public function getNeighbourhoods(Request $request)
    {
        $query = Neighbourhood::active()->ordered();

        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        return response()->json($query->get(['id', 'name', 'city']));
    }
}
