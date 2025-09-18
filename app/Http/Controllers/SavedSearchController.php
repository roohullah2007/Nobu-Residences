<?php

namespace App\Http\Controllers;

use App\Models\SavedSearch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavedSearchController extends Controller
{
    /**
     * Display a listing of the user's saved searches.
     */
    public function index()
    {
        $savedSearches = Auth::user()->savedSearches()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $savedSearches
        ]);
    }

    /**
     * Store a newly created saved search.
     */
    public function store(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'search_params' => 'required|array',
            'email_alerts' => 'boolean',
            'frequency' => 'integer|in:1,7,30'
        ]);

        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Please log in to save searches'
            ], 401);
        }

        // Create the saved search
        $savedSearch = SavedSearch::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'search_params' => $validated['search_params'],
            'email_alerts' => $validated['email_alerts'] ?? false,
            'frequency' => $validated['frequency'] ?? 1,
            'results_count' => 0
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Search saved successfully',
            'data' => $savedSearch
        ]);
    }

    /**
     * Update the specified saved search.
     */
    public function update(Request $request, $id)
    {
        $savedSearch = SavedSearch::where('user_id', Auth::id())
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'search_params' => 'array',
            'email_alerts' => 'boolean',
            'frequency' => 'integer|in:1,7,30'
        ]);

        $savedSearch->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Search updated successfully',
            'data' => $savedSearch
        ]);
    }

    /**
     * Remove the specified saved search.
     */
    public function destroy($id)
    {
        $savedSearch = SavedSearch::where('user_id', Auth::id())
            ->findOrFail($id);

        $savedSearch->delete();

        return response()->json([
            'success' => true,
            'message' => 'Search deleted successfully'
        ]);
    }

    /**
     * Run a saved search and redirect to the search page.
     */
    public function run($id)
    {
        $savedSearch = SavedSearch::where('user_id', Auth::id())
            ->findOrFail($id);

        // Build URL parameters from saved search params
        $params = $savedSearch->search_params;
        $queryString = http_build_query([
            'location' => $params['query'] ?? '',
            'status' => $params['status'] ?? 'For Sale',
            'property_sub_type' => isset($params['property_type'][0]) ? $params['property_type'][0] : '',
            'min_price' => $params['price_min'] ?? 0,
            'max_price' => $params['price_max'] ?? 10000000,
            'bedrooms' => $params['bedrooms'] ?? 0,
            'bathrooms' => $params['bathrooms'] ?? 0,
            'sort' => $params['sort'] ?? 'newest'
        ]);

        return redirect('/search?' . $queryString);
    }
}