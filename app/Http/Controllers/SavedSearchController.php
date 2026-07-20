<?php

namespace App\Http\Controllers;

use App\Models\SavedSearch;
use App\Services\Tenancy\TenantResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavedSearchController extends Controller
{
    public function __construct(protected TenantResolver $tenantResolver)
    {
    }

    /**
     * The landing site the request came in on — stored so alert emails are
     * branded with and link back to the same site. Never blocks a save.
     */
    private function currentWebsiteId(Request $request): ?int
    {
        try {
            return $this->tenantResolver->resolve($request)?->id;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Display a listing of the user's saved searches.
     */
    public function index()
    {
        $savedSearches = Auth::user()->savedSearches()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($search) {
                // Ensure the formatted_criteria attribute is included
                return array_merge($search->toArray(), [
                    'formatted_criteria' => $search->formatted_criteria
                ]);
            });

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

        // Create the saved search (local DB)
        $savedSearch = SavedSearch::create([
            'user_id' => Auth::id(),
            'website_id' => $this->currentWebsiteId($request),
            'name' => $validated['name'],
            'search_params' => $validated['search_params'],
            'email_alerts' => $validated['email_alerts'] ?? false,
            'frequency' => $validated['frequency'] ?? 1,
            'results_count' => 0
        ]);

        // Mirror to Repliers so their own alert engine also notifies the user.
        // Best-effort: never blocks/fails the local save.
        $this->syncToRepliers($savedSearch);

        return response()->json([
            'success' => true,
            'message' => 'Search saved successfully',
            'data' => $savedSearch->fresh()
        ]);
    }

    /**
     * Push a saved search to Repliers (create, or delete+recreate when it
     * already exists there — the API has no update endpoint). Ensures the
     * user has a Repliers client first, creating one when missing.
     *
     * Guarded behind the Repliers API key; every failure is logged and
     * recorded in repliers_sync_status without ever throwing, so local
     * saved searches keep working when Repliers is down/unconfigured.
     */
    private function syncToRepliers(SavedSearch $savedSearch): void
    {
        if (empty(config('repliers.api_key'))) {
            return; // Repliers not configured — nothing to sync.
        }

        try {
            $repliersApi = app(\App\Services\RepliersApiService::class);
            $user = $savedSearch->user ?: Auth::user();

            // Ensure the user exists as a Repliers client.
            if (empty($user->repliers_client_id)) {
                $client = $repliersApi->createClient([
                    'email' => $user->email,
                    'name' => $user->name,
                ]);
                if (!empty($client['clientId'])) {
                    $user->update(['repliers_client_id' => $client['clientId']]);
                }
            }

            if (empty($user->repliers_client_id)) {
                $savedSearch->update(['repliers_sync_status' => 'failed']);
                return;
            }

            // No update endpoint on Repliers — replace on change.
            if (!empty($savedSearch->repliers_saved_search_id)) {
                $repliersApi->deleteSavedSearch($savedSearch->repliers_saved_search_id);
            }

            $result = $repliersApi->createSavedSearch(
                $user->repliers_client_id,
                $savedSearch->search_params ?? [],
                $savedSearch->name
            );

            $repliersId = $result['savedSearchId'] ?? $result['id'] ?? null;
            $savedSearch->update([
                'repliers_saved_search_id' => $repliersId,
                'repliers_sync_status' => $repliersId ? 'synced' : 'failed',
            ]);
        } catch (\Throwable $e) {
            \Log::warning('Repliers saved-search sync failed', [
                'saved_search_id' => $savedSearch->id,
                'error' => $e->getMessage(),
            ]);
            try {
                $savedSearch->update(['repliers_sync_status' => 'failed']);
            } catch (\Throwable) {
                // Column may not exist yet pre-migration — never fail the request.
            }
        }
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

        // Keep the Repliers copy in step when the search itself changed
        // (name/params). Best-effort — see syncToRepliers().
        if (array_intersect_key($validated, array_flip(['name', 'search_params']))) {
            $this->syncToRepliers($savedSearch);
        }

        return response()->json([
            'success' => true,
            'message' => 'Search updated successfully',
            'data' => $savedSearch->fresh()
        ]);
    }

    /**
     * Remove the specified saved search.
     */
    public function destroy($id)
    {
        $savedSearch = SavedSearch::where('user_id', Auth::id())
            ->findOrFail($id);

        // Also delete from Repliers API
        if (!empty($savedSearch->repliers_saved_search_id)) {
            try {
                $repliersApi = app(\App\Services\RepliersApiService::class);
                $repliersApi->deleteSavedSearch($savedSearch->repliers_saved_search_id);
            } catch (\Exception $e) {
                \Log::warning('Failed to delete Repliers saved search', ['error' => $e->getMessage()]);
            }
        }

        $savedSearch->delete();

        return response()->json([
            'success' => true,
            'message' => 'Search deleted successfully'
        ]);
    }

    /**
     * Is the current user subscribed to alerts for this building?
     */
    public function buildingAlertStatus(Request $request)
    {
        $request->validate(['building_id' => 'required|string']);

        return response()->json([
            'success' => true,
            'subscribed' => SavedSearch::where('user_id', Auth::id())
                ->where('building_id', $request->building_id)
                ->exists(),
        ]);
    }

    /**
     * Toggle a building alert subscription.
     *
     * A building alert is just a saved search whose search_params pin the
     * building's street address(es) (building_id + street_addresses — the
     * exact shape buildRepliersListingsParams() executes against Repliers),
     * so the existing SavedSearchAlertService scheduling, Repliers sync and
     * mail delivery all apply unchanged. Idempotent: one subscription per
     * user+building; calling again unsubscribes (deletes the saved search).
     */
    public function toggleBuildingAlert(Request $request)
    {
        $validated = $request->validate([
            'building_id' => 'required|string|exists:buildings,id',
            'status' => 'nullable|in:For Sale,For Rent,Both',
        ]);

        $user = Auth::user();
        $building = \App\Models\Building::find($validated['building_id']);

        $existing = SavedSearch::where('user_id', $user->id)
            ->where('building_id', $building->id)
            ->first();

        if ($existing) {
            // Unsubscribe — clean up the Repliers mirror first (best-effort).
            if (!empty($existing->repliers_saved_search_id)) {
                try {
                    app(\App\Services\RepliersApiService::class)
                        ->deleteSavedSearch($existing->repliers_saved_search_id);
                } catch (\Throwable $e) {
                    \Log::warning('Failed to delete Repliers saved search on building-alert unsubscribe', ['error' => $e->getMessage()]);
                }
            }
            $existing->delete();

            return response()->json([
                'success' => true,
                'subscribed' => false,
                'message' => 'Alerts turned off for ' . $building->name,
            ]);
        }

        // Pin the building the same way the building detail page scopes its
        // live listings: every street address, comma-separated.
        $addresses = array_filter([
            $building->street_address_1 ?? null,
            $building->street_address_2 ?? null,
        ]);
        if (is_array($building->additional_addresses)) {
            $addresses = array_merge($addresses, array_filter($building->additional_addresses));
        }
        if (empty($addresses) && !empty($building->address)) {
            $addresses[] = $building->address;
        }

        $savedSearch = SavedSearch::create([
            'user_id' => $user->id,
            'website_id' => $this->currentWebsiteId($request),
            'building_id' => $building->id,
            'name' => 'Alerts: ' . $building->name,
            'search_params' => [
                'building_id' => $building->id,
                'street_addresses' => implode(',', array_values($addresses)),
                // 'Both' = no sale/lease type filter → alerts for new sale
                // AND rent listings in this building.
                'status' => $validated['status'] ?? 'Both',
            ],
            'email_alerts' => true,
            'frequency' => 1,
            'results_count' => 0,
        ]);

        // Mirror to Repliers (best-effort — never blocks subscribing).
        $this->syncToRepliers($savedSearch);

        return response()->json([
            'success' => true,
            'subscribed' => true,
            'message' => 'Alerts turned on for ' . $building->name,
            'data' => $savedSearch->fresh(),
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

        // Map saved search params to search page URL params
        $urlParams = [];

        // Location/Query
        if (!empty($params['query'])) {
            $urlParams['query'] = $params['query'];
        }

        // Transaction type (For Sale/For Rent)
        if (!empty($params['status'])) {
            $urlParams['status'] = $params['status'];
        } elseif (!empty($params['transaction_type'])) {
            $urlParams['status'] = $params['transaction_type'];
        }

        // Property types - handle as array
        if (!empty($params['property_type'])) {
            if (is_array($params['property_type'])) {
                // If multiple types, join them
                $urlParams['property_type'] = implode(',', $params['property_type']);
            } else {
                $urlParams['property_type'] = $params['property_type'];
            }
        }

        // Price range
        if (isset($params['price_min']) && $params['price_min'] > 0) {
            $urlParams['min_price'] = $params['price_min'];
        }
        if (isset($params['price_max']) && $params['price_max'] < 10000000) {
            $urlParams['max_price'] = $params['price_max'];
        }

        // Bedrooms and bathrooms
        if (isset($params['bedrooms']) && $params['bedrooms'] > 0) {
            $urlParams['bedrooms'] = $params['bedrooms'];
        }
        if (isset($params['bathrooms']) && $params['bathrooms'] > 0) {
            $urlParams['bathrooms'] = $params['bathrooms'];
        }

        // Square footage
        if (isset($params['min_sqft']) && $params['min_sqft'] > 0) {
            $urlParams['min_sqft'] = $params['min_sqft'];
        }
        if (isset($params['max_sqft']) && $params['max_sqft'] > 0) {
            $urlParams['max_sqft'] = $params['max_sqft'];
        }

        // Sort order
        if (!empty($params['sort'])) {
            $urlParams['sort'] = $params['sort'];
        }

        // Other filters that might be saved
        if (!empty($params['parking'])) {
            $urlParams['parking'] = $params['parking'];
        }
        if (!empty($params['year_built'])) {
            $urlParams['year_built'] = $params['year_built'];
        }

        $queryString = http_build_query($urlParams);

        return redirect('/search?' . $queryString);
    }
}