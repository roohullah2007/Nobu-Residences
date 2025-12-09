<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubNeighbourhood;
use App\Models\Neighbourhood;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubNeighbourhoodController extends Controller
{
    /**
     * Display a listing of sub-neighbourhoods.
     */
    public function index(Request $request)
    {
        $query = SubNeighbourhood::query()
            ->with('neighbourhood')
            ->withCount('buildings');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Filter by neighbourhood
        if ($request->filled('neighbourhood_id')) {
            $query->where('neighbourhood_id', $request->neighbourhood_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $subNeighbourhoods = $query->ordered()->paginate(20)->withQueryString();

        // Get neighbourhoods for filter
        $neighbourhoods = Neighbourhood::active()->ordered()->get(['id', 'name', 'city']);

        return Inertia::render('Admin/SubNeighbourhoods/Index', [
            'subNeighbourhoods' => $subNeighbourhoods,
            'neighbourhoods' => $neighbourhoods,
            'filters' => $request->only(['search', 'neighbourhood_id', 'status'])
        ]);
    }

    /**
     * Show the form for creating a new sub-neighbourhood.
     */
    public function create()
    {
        $neighbourhoods = Neighbourhood::active()->ordered()->get(['id', 'name', 'city']);

        return Inertia::render('Admin/SubNeighbourhoods/Create', [
            'neighbourhoods' => $neighbourhoods
        ]);
    }

    /**
     * Store a newly created sub-neighbourhood.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'neighbourhood_id' => 'nullable|exists:neighbourhoods,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $subNeighbourhood = SubNeighbourhood::create($validated);

        return redirect()->route('admin.sub-neighbourhoods.index')
            ->with('success', 'Sub-neighbourhood created successfully.');
    }

    /**
     * Show the form for editing the specified sub-neighbourhood.
     */
    public function edit(SubNeighbourhood $subNeighbourhood)
    {
        $subNeighbourhood->load('neighbourhood');
        $subNeighbourhood->loadCount('buildings');

        $neighbourhoods = Neighbourhood::active()->ordered()->get(['id', 'name', 'city']);

        return Inertia::render('Admin/SubNeighbourhoods/Edit', [
            'subNeighbourhood' => $subNeighbourhood,
            'neighbourhoods' => $neighbourhoods
        ]);
    }

    /**
     * Update the specified sub-neighbourhood.
     */
    public function update(Request $request, SubNeighbourhood $subNeighbourhood)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'neighbourhood_id' => 'nullable|exists:neighbourhoods,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $subNeighbourhood->update($validated);

        return redirect()->route('admin.sub-neighbourhoods.index')
            ->with('success', 'Sub-neighbourhood updated successfully.');
    }

    /**
     * Remove the specified sub-neighbourhood.
     */
    public function destroy(SubNeighbourhood $subNeighbourhood)
    {
        // Check if sub-neighbourhood has buildings
        if ($subNeighbourhood->buildings()->count() > 0) {
            return back()->with('error', 'Cannot delete sub-neighbourhood with associated buildings.');
        }

        $subNeighbourhood->delete();

        return redirect()->route('admin.sub-neighbourhoods.index')
            ->with('success', 'Sub-neighbourhood deleted successfully.');
    }

    /**
     * Get sub-neighbourhoods for API (used by dropdowns)
     */
    public function getSubNeighbourhoods(Request $request)
    {
        $query = SubNeighbourhood::active()->ordered();

        if ($request->filled('neighbourhood_id')) {
            $query->where('neighbourhood_id', $request->neighbourhood_id);
        }

        return response()->json($query->get(['id', 'name', 'neighbourhood_id']));
    }
}
