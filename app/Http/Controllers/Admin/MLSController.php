<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MLSProperty;
use App\Services\MLSSyncService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class MLSController extends Controller
{
    protected MLSSyncService $syncService;

    public function __construct(MLSSyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    /**
     * Display MLS Properties management dashboard
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 20);
        $search = $request->get('search');

        // Build query
        $query = MLSProperty::query();

        // Search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('mls_number', 'like', "%{$search}%")
                    ->orWhere('mls_id', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        // Property type filter
        if ($request->has('property_type')) {
            $query->where('property_type', $request->get('property_type'));
        }

        // City filter
        if ($request->has('city')) {
            $query->where('city', 'like', '%' . $request->get('city') . '%');
        }

        // Order by
        $query->orderBy('last_synced_at', 'desc');

        // Paginate
        $properties = $query->paginate($perPage)->withQueryString();

        // Get statistics
        $stats = $this->syncService->getSyncStats();

        // Get recent sync logs (from MLS properties)
        $recentSyncs = MLSProperty::orderBy('last_synced_at', 'desc')
            ->take(10)
            ->get(['mls_id', 'address', 'city', 'last_synced_at', 'sync_failed', 'sync_error']);

        // Get available filters
        $cities = MLSProperty::select('city')
            ->distinct()
            ->whereNotNull('city')
            ->orderBy('city')
            ->pluck('city');

        return Inertia::render('Admin/MLS/Index', [
            'properties' => $properties,
            'stats' => $stats,
            'recentSyncs' => $recentSyncs,
            'cities' => $cities,
            'filters' => $request->only(['search', 'status', 'property_type', 'city', 'per_page']),
        ]);
    }

    /**
     * Trigger manual full sync
     */
    public function syncFull(Request $request): RedirectResponse
    {
        try {
            $limit = $request->get('limit', 1000);

            Log::info('Admin triggered full MLS sync', [
                'user_id' => auth()->id(),
                'limit' => $limit
            ]);

            // Run sync in background using Artisan command
            Artisan::queue('mls:sync', [
                '--limit' => $limit
            ]);

            return redirect()->back()->with('success', "Full sync initiated for {$limit} properties. This will run in the background.");
        } catch (\Exception $e) {
            Log::error('Admin full sync failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to start sync: ' . $e->getMessage());
        }
    }

    /**
     * Trigger manual incremental sync
     */
    public function syncIncremental(): RedirectResponse
    {
        try {
            Log::info('Admin triggered incremental MLS sync', [
                'user_id' => auth()->id()
            ]);

            // Run sync in background using Artisan command
            Artisan::queue('mls:sync', [
                '--incremental' => true
            ]);

            return redirect()->back()->with('success', 'Incremental sync initiated. Only changed properties will be updated.');
        } catch (\Exception $e) {
            Log::error('Admin incremental sync failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to start sync: ' . $e->getMessage());
        }
    }

    /**
     * Sync specific property by MLS ID
     */
    public function syncProperty(Request $request): RedirectResponse
    {
        $request->validate([
            'mls_id' => 'required|string'
        ]);

        try {
            $mlsId = $request->get('mls_id');

            Log::info('Admin triggered single property sync', [
                'user_id' => auth()->id(),
                'mls_id' => $mlsId
            ]);

            $result = $this->syncService->syncSpecificListings([$mlsId]);

            if ($result['synced'] > 0 || $result['updated'] > 0) {
                return redirect()->back()->with('success', "Property {$mlsId} synced successfully with images.");
            } else {
                return redirect()->back()->with('warning', "Property {$mlsId} not found in MLS.");
            }
        } catch (\Exception $e) {
            Log::error('Admin property sync failed', [
                'mls_id' => $request->get('mls_id'),
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Failed to sync property: ' . $e->getMessage());
        }
    }

    /**
     * View single property details
     */
    public function show(string $id): Response
    {
        $property = MLSProperty::findOrFail($id);

        return Inertia::render('Admin/MLS/Show', [
            'property' => $property
        ]);
    }

    /**
     * Delete property
     */
    public function destroy(string $id): RedirectResponse
    {
        try {
            $property = MLSProperty::findOrFail($id);
            $property->delete();

            Log::info('Admin deleted MLS property', [
                'user_id' => auth()->id(),
                'property_id' => $id
            ]);

            return redirect()->route('admin.mls.index')->with('success', 'Property deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Admin property delete failed', [
                'property_id' => $id,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Failed to delete property: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete properties
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:mls_properties,id'
        ]);

        try {
            MLSProperty::whereIn('id', $request->ids)->delete();

            Log::info('Admin bulk deleted MLS properties', [
                'user_id' => auth()->id(),
                'count' => count($request->ids)
            ]);

            return redirect()->back()->with('success', count($request->ids) . ' properties deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Admin bulk delete failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to delete properties: ' . $e->getMessage());
        }
    }

    /**
     * Get sync statistics (API endpoint)
     */
    public function getStats()
    {
        return response()->json($this->syncService->getSyncStats());
    }

    /**
     * Clear all MLS properties
     */
    public function clearAll(): RedirectResponse
    {
        try {
            $count = MLSProperty::count();
            MLSProperty::query()->delete();

            Log::warning('Admin cleared all MLS properties', [
                'user_id' => auth()->id(),
                'count' => $count
            ]);

            return redirect()->back()->with('success', "All {$count} properties cleared successfully.");
        } catch (\Exception $e) {
            Log::error('Admin clear all failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to clear properties: ' . $e->getMessage());
        }
    }
}
