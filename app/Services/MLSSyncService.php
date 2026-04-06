<?php

namespace App\Services;

use App\Models\MLSProperty;
use App\Models\MLSSyncState;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * MLS Sync Service
 *
 * Syncs MLS data from Repliers API to local mls_properties table
 * Images come directly from Repliers CDN - no separate download needed
 */
class MLSSyncService
{
    private RepliersApiService $repliersApi;

    public function __construct(RepliersApiService $repliersApi)
    {
        $this->repliersApi = $repliersApi;
    }

    /**
     * Get or create sync state instance
     */
    private function getSyncState(): MLSSyncState
    {
        return MLSSyncState::getInstance();
    }

    /**
     * Sync all active listings from MLS with pagination tracking
     */
    public function syncAllListings(array $options = []): array
    {
        try {
            $limit = $options['limit'] ?? 2500;
            $batchSize = $options['batch_size'] ?? 100;
            $resumable = $options['resumable'] ?? true;
            $allStatuses = $options['all_statuses'] ?? false;
            $soldLeasedOnly = $options['sold_leased_only'] ?? false;

            $syncState = $this->getSyncState();

            if ($syncState->isSyncing()) {
                Log::warning('Sync already in progress');
                return [
                    'success' => false,
                    'error' => 'Sync already in progress',
                    'synced' => 0,
                    'updated' => 0,
                ];
            }

            $syncState->startSync('initial_load');

            Log::info('Starting MLS sync via Repliers API', [
                'limit' => $limit,
                'batch_size' => $batchSize,
                'all_statuses' => $allStatuses,
                'sold_leased_only' => $soldLeasedOnly,
            ]);

            $synced = 0;
            $updated = 0;
            $failed = 0;
            $errors = [];
            $reachedEnd = false;

            // Calculate number of pages needed
            $totalPages = ceil($limit / $batchSize);
            $startPage = $resumable ? max(1, floor($syncState->current_batch_offset / $batchSize) + 1) : 1;

            for ($page = $startPage; $page <= $startPage + $totalPages - 1; $page++) {
                try {
                    $batchResult = $this->syncBatch($page, $batchSize, $allStatuses, $soldLeasedOnly);

                    $synced += $batchResult['synced'];
                    $updated += $batchResult['updated'];
                    $failed += $batchResult['failed'];

                    if (!empty($batchResult['errors'])) {
                        $errors = array_merge($errors, $batchResult['errors']);
                    }

                    $syncState->updateRunStats([
                        'synced' => $batchResult['synced'],
                        'updated' => $batchResult['updated'],
                        'failed' => $batchResult['failed'],
                    ]);

                    $syncState->update(['current_batch_offset' => $page * $batchSize]);

                    Log::info("Processed batch", [
                        'page' => $page,
                        'batch_size' => $batchSize,
                        'synced' => $batchResult['synced'],
                        'updated' => $batchResult['updated'],
                    ]);

                    // If we got fewer results than batch size, we're done
                    if ($batchResult['fetched'] < $batchSize) {
                        $reachedEnd = true;
                        Log::info('Reached end of available listings', [
                            'last_batch_size' => $batchResult['fetched'],
                        ]);
                        break;
                    }

                    // Check if we've hit the limit
                    if (($synced + $updated) >= $limit) {
                        break;
                    }

                } catch (Exception $e) {
                    Log::error('Batch sync failed', [
                        'page' => $page,
                        'error' => $e->getMessage(),
                    ]);
                    $errors[] = "Batch page {$page}: " . $e->getMessage();
                    $syncState->failSync($e->getMessage());

                    return [
                        'success' => false,
                        'error' => $e->getMessage(),
                        'synced' => $synced,
                        'updated' => $updated,
                        'failed' => $failed,
                        'errors' => $errors,
                        'resumable' => true,
                    ];
                }
            }

            $deactivated = $this->deactivateOldListings();

            if ($reachedEnd && $syncState->sync_mode === 'initial_load') {
                $syncState->markInitialSyncComplete();
                Log::info('Initial sync complete - switching to incremental mode');
            }

            $syncState->completeSync();

            return [
                'success' => true,
                'synced' => $synced,
                'updated' => $updated,
                'failed' => $failed,
                'deactivated' => $deactivated,
                'errors' => $errors,
                'timestamp' => now()->toDateTimeString(),
            ];

        } catch (Exception $e) {
            Log::error('MLS Sync Error', ['error' => $e->getMessage()]);

            if (isset($syncState)) {
                $syncState->failSync($e->getMessage());
            }

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'synced' => 0,
                'updated' => 0,
            ];
        }
    }

    /**
     * Sync only updated/changed listings since last sync (Incremental)
     */
    public function syncIncrementalUpdates(array $options = []): array
    {
        try {
            $batchSize = $options['batch_size'] ?? 100;
            $maxBatches = $options['max_batches'] ?? 50;

            $syncState = $this->getSyncState();

            if ($syncState->isSyncing()) {
                Log::warning('Sync already in progress');
                return [
                    'success' => false,
                    'error' => 'Sync already in progress',
                    'synced' => 0,
                    'updated' => 0,
                ];
            }

            $syncState->startSync('incremental');

            $lastSync = MLSProperty::whereNotNull('last_synced_at')
                ->orderBy('last_synced_at', 'desc')
                ->first();

            $sinceDate = $lastSync
                ? $lastSync->last_synced_at->subMinutes(5)
                : now()->subDays(7);

            Log::info('Starting incremental sync via Repliers', [
                'since' => $sinceDate->toDateTimeString(),
                'batch_size' => $batchSize,
            ]);

            $synced = 0;
            $updated = 0;
            $statusChanged = 0;
            $failed = 0;
            $errors = [];

            for ($page = 1; $page <= $maxBatches; $page++) {
                try {
                    $batchResult = $this->syncIncrementalBatch($page, $batchSize, $sinceDate);

                    $synced += $batchResult['synced'];
                    $updated += $batchResult['updated'];
                    $statusChanged += $batchResult['status_changed'];
                    $failed += $batchResult['failed'];

                    if (!empty($batchResult['errors'])) {
                        $errors = array_merge($errors, $batchResult['errors']);
                    }

                    $syncState->updateRunStats([
                        'synced' => $batchResult['synced'],
                        'updated' => $batchResult['updated'],
                        'failed' => $batchResult['failed'],
                        'status_changed' => $batchResult['status_changed'],
                    ]);

                    Log::info("Processed incremental batch", [
                        'page' => $page,
                        'synced' => $batchResult['synced'],
                        'updated' => $batchResult['updated'],
                        'status_changed' => $batchResult['status_changed'],
                    ]);

                    if ($batchResult['fetched'] < $batchSize) {
                        break;
                    }

                } catch (Exception $e) {
                    Log::error('Incremental batch failed', [
                        'page' => $page,
                        'error' => $e->getMessage(),
                    ]);
                    $errors[] = "Page {$page}: " . $e->getMessage();
                    break;
                }
            }

            $syncState->completeSync();

            return [
                'success' => true,
                'synced' => $synced,
                'updated' => $updated,
                'status_changed' => $statusChanged,
                'failed' => $failed,
                'since' => $sinceDate->toDateTimeString(),
                'errors' => $errors,
                'timestamp' => now()->toDateTimeString(),
            ];

        } catch (Exception $e) {
            Log::error('Incremental Sync Error', ['error' => $e->getMessage()]);

            if (isset($syncState)) {
                $syncState->failSync($e->getMessage());
            }

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'synced' => 0,
                'updated' => 0,
            ];
        }
    }

    /**
     * Auto sync - intelligently choose between initial and incremental
     */
    public function syncAuto(array $options = []): array
    {
        $syncState = $this->getSyncState();

        if ($syncState->needsInitialSync()) {
            Log::info('Running initial sync (auto mode)');
            return $this->syncAllListings(array_merge($options, ['resumable' => true]));
        }

        Log::info('Running incremental sync (auto mode)');
        return $this->syncIncrementalUpdates($options);
    }

    /**
     * Get sync state information
     */
    public function getSyncStateInfo(): array
    {
        $syncState = $this->getSyncState();

        return [
            'sync_mode' => $syncState->sync_mode,
            'sync_status' => $syncState->sync_status,
            'current_batch_offset' => $syncState->current_batch_offset,
            'batch_size' => $syncState->batch_size,
            'total_properties_synced' => $syncState->total_properties_synced,
            'initial_sync_complete' => $syncState->initial_sync_complete,
            'initial_sync_completed_at' => $syncState->initial_sync_completed_at?->toDateTimeString(),
            'last_sync_started_at' => $syncState->last_sync_started_at?->toDateTimeString(),
            'last_sync_completed_at' => $syncState->last_sync_completed_at?->toDateTimeString(),
            'current_run_synced' => $syncState->current_run_synced,
            'current_run_updated' => $syncState->current_run_updated,
            'current_run_failed' => $syncState->current_run_failed,
            'current_run_status_changed' => $syncState->current_run_status_changed,
            'last_error' => $syncState->last_error,
            'status_message' => $syncState->getStatusMessage(),
            'is_syncing' => $syncState->isSyncing(),
            'needs_initial_sync' => $syncState->needsInitialSync(),
            'should_use_incremental' => $syncState->shouldUseIncrementalSync(),
        ];
    }

    /**
     * Sync a batch of listings from Repliers
     */
    private function syncBatch(int $page, int $batchSize, bool $allStatuses = false, bool $soldLeasedOnly = false): array
    {
        $params = $this->buildGTACondoParams($page, $batchSize, $allStatuses, $soldLeasedOnly);

        $result = $this->repliersApi->searchListingsNoCache($params);

        $synced = 0;
        $updated = 0;
        $failed = 0;
        $errors = [];

        foreach ($result['listings'] as $listing) {
            try {
                $wasUpdated = $this->syncListingToDb($listing);

                if ($wasUpdated) {
                    $updated++;
                } else {
                    $synced++;
                }
            } catch (Exception $e) {
                $failed++;
                $errors[] = "Listing {$listing['mlsNumber']}: " . $e->getMessage();
                Log::error('Property sync failed', [
                    'mls_number' => $listing['mlsNumber'],
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return [
            'fetched' => count($result['listings']),
            'synced' => $synced,
            'updated' => $updated,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }

    /**
     * Sync a batch of incremental updates
     */
    private function syncIncrementalBatch(int $page, int $batchSize, Carbon $sinceDate): array
    {
        $params = $this->buildGTACondoParams($page, $batchSize, true, false);
        $params['minUpdatedOn'] = $sinceDate->format('Y-m-d');
        $params['sortBy'] = 'updatedOnDesc';

        $result = $this->repliersApi->searchListingsNoCache($params);

        $synced = 0;
        $updated = 0;
        $statusChanged = 0;
        $failed = 0;
        $errors = [];

        foreach ($result['listings'] as $listing) {
            try {
                $mlsNumber = $listing['mlsNumber'];

                // Check for status change
                $existing = MLSProperty::where('mls_id', $mlsNumber)->first();
                $hadStatusChange = false;
                $newStatus = $this->mapStatus($listing['status'] ?? 'A', $listing['lastStatus'] ?? '', $listing['type'] ?? 'sale');

                if ($existing && $existing->status !== $newStatus) {
                    $hadStatusChange = true;
                    $statusChanged++;
                }

                $wasUpdated = $this->syncListingToDb($listing);

                if ($wasUpdated && !$hadStatusChange) {
                    $updated++;
                } elseif (!$wasUpdated) {
                    $synced++;
                }

            } catch (Exception $e) {
                $failed++;
                $errors[] = "Listing {$listing['mlsNumber']}: " . $e->getMessage();
                Log::error('Property incremental sync failed', [
                    'mls_number' => $listing['mlsNumber'],
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return [
            'fetched' => count($result['listings']),
            'synced' => $synced,
            'updated' => $updated,
            'status_changed' => $statusChanged,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }

    /**
     * Sync individual Repliers listing to database
     * Returns true if updated, false if created
     */
    private function syncListingToDb(array $listing): bool
    {
        $mlsNumber = $listing['mlsNumber'];
        $address = $listing['address'] ?? [];
        $details = $listing['details'] ?? [];
        $map = $listing['map'] ?? [];
        $condominium = $listing['condominium'] ?? [];
        $taxes = $listing['taxes'] ?? [];

        $property = MLSProperty::withTrashed()->where('mls_id', $mlsNumber)->first();
        if ($property && $property->trashed()) {
            $property->restore();
        }

        // Build full address
        $fullAddress = trim(($address['streetNumber'] ?? '') . ' ' . ($address['streetName'] ?? '') . ' ' . ($address['streetSuffix'] ?? ''));
        if (!empty($address['unitNumber'])) {
            $fullAddress = $address['unitNumber'] . ' - ' . $fullAddress;
        }

        // Build image URLs from Repliers CDN
        $imageUrls = array_map(
            fn($img) => $this->repliersApi->getImageUrl($img),
            $listing['images'] ?? []
        );

        $transactionType = strtolower($listing['type'] ?? 'sale');

        $data = [
            'mls_id' => $mlsNumber,
            'mls_number' => $mlsNumber,
            'latitude' => $map['latitude'] ?? null,
            'longitude' => $map['longitude'] ?? null,
            'address' => $fullAddress,
            'city' => $address['city'] ?? null,
            'province' => $address['state'] ?? 'ON',
            'postal_code' => $address['zip'] ?? null,
            'country' => $address['country'] ?? 'Canada',
            'property_type' => $transactionType === 'lease' ? 'For Rent' : 'For Sale',
            'property_sub_type' => $details['style'] ?? $details['propertyType'] ?? null,
            'status' => $this->mapStatus($listing['status'] ?? 'A', $listing['lastStatus'] ?? '', $transactionType),
            'price' => $listing['listPrice'] ?? null,
            'bedrooms' => $details['numBedrooms'] ?? null,
            'bathrooms' => $details['numBathrooms'] ?? null,
            'parking_spaces' => $details['numParkingSpaces'] ?? $details['numGarageSpaces'] ?? null,
            'square_footage' => $this->parseSquareFootage($details['sqft'] ?? null),
            'lot_size' => null,
            'listed_date' => $this->parseDate($listing['listDate'] ?? null),
            'sold_date' => $this->parseDate($listing['soldDate'] ?? null),
            'updated_date' => $this->parseDate($listing['timestamps']['listingUpdated'] ?? null),
            'last_synced_at' => now(),
            'mls_data' => $listing,
            'image_urls' => $imageUrls,
            'has_images' => !empty($imageUrls),
            'is_active' => strtoupper($listing['status'] ?? 'A') === 'A',
            'sync_failed' => false,
            'sync_error' => null,
        ];

        if ($property) {
            $property->update($data);
            return true;
        } else {
            MLSProperty::create($data);
            return false;
        }
    }

    /**
     * Build Repliers API params for GTA Condo search
     */
    private function buildGTACondoParams(int $page, int $resultsPerPage, bool $allStatuses = false, bool $soldLeasedOnly = false): array
    {
        $params = [
            'pageNum' => $page,
            'resultsPerPage' => $resultsPerPage,
            'class' => 'condoProperty',
            'sortBy' => 'updatedOnDesc',
        ];

        // Status filters
        if ($soldLeasedOnly) {
            $params['status'] = 'U';
            $params['lastStatus'] = ['Sld', 'Lsd'];
        } elseif ($allStatuses) {
            // Don't set status - get all
        } else {
            $params['status'] = 'A';
        }

        // GTA Cities
        $gtaCities = config('repliers.gta_cities', [
            'Toronto', 'Mississauga', 'Brampton', 'Caledon',
            'Markham', 'Vaughan', 'Richmond Hill', 'Aurora',
            'Newmarket', 'King', 'Whitchurch-Stouffville', 'Georgina',
            'Oshawa', 'Whitby', 'Ajax', 'Pickering', 'Clarington',
            'Uxbridge', 'Scugog', 'Brock',
            'Oakville', 'Burlington', 'Milton', 'Halton Hills',
        ]);

        $params['city'] = $gtaCities;

        return $params;
    }

    /**
     * Delete listings that haven't been synced recently
     */
    private function deactivateOldListings(int $hoursOld = 48): int
    {
        $cutoffTime = now()->subHours($hoursOld);

        return MLSProperty::where('is_active', true)
            ->where(function ($query) use ($cutoffTime) {
                $query->whereNull('last_synced_at')
                    ->orWhere('last_synced_at', '<', $cutoffTime);
            })
            ->delete();
    }

    /**
     * Sync specific listings by MLS numbers
     */
    public function syncSpecificListings(array $mlsNumbers): array
    {
        $synced = 0;
        $updated = 0;
        $failed = 0;
        $errors = [];

        foreach ($mlsNumbers as $mlsNumber) {
            try {
                // Search for the listing by MLS number
                $result = $this->repliersApi->searchListingsNoCache([
                    'search' => $mlsNumber,
                    'resultsPerPage' => 1,
                ]);

                if (!empty($result['listings'])) {
                    $listing = $result['listings'][0];

                    // Verify it matches
                    if (($listing['mlsNumber'] ?? '') === $mlsNumber) {
                        $wasUpdated = $this->syncListingToDb($listing);

                        if ($wasUpdated) {
                            $updated++;
                        } else {
                            $synced++;
                        }
                    } else {
                        $errors[] = "MLS {$mlsNumber}: listing not found";
                    }
                } else {
                    $errors[] = "MLS {$mlsNumber}: no results";
                }

            } catch (Exception $e) {
                $failed++;
                $errors[] = "MLS {$mlsNumber}: " . $e->getMessage();
            }
        }

        return [
            'success' => true,
            'synced' => $synced,
            'updated' => $updated,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }

    /**
     * Get sync statistics
     */
    public function getSyncStats(): array
    {
        $lastSync = MLSProperty::whereNotNull('last_synced_at')
            ->orderBy('last_synced_at', 'desc')
            ->first();

        $withImages = MLSProperty::where('has_images', true)->count();

        $withGeocoding = MLSProperty::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->where('latitude', '!=', 0)
            ->where('longitude', '!=', 0)
            ->count();

        $totalProperties = MLSProperty::count();

        return [
            'total_properties' => $totalProperties,
            'active_properties' => MLSProperty::active()->count(),
            'sold_properties' => MLSProperty::where('status', 'sold')->count(),
            'leased_properties' => MLSProperty::where('status', 'leased')->count(),
            'failed_syncs' => MLSProperty::where('sync_failed', true)->count(),
            'for_sale' => MLSProperty::active()->propertyType('For Sale')->count(),
            'for_rent' => MLSProperty::active()->propertyType('For Rent')->count(),
            'with_images' => $withImages,
            'without_images' => $totalProperties - $withImages,
            'with_geocoding' => $withGeocoding,
            'without_geocoding' => $totalProperties - $withGeocoding,
            'last_sync' => $lastSync ? $lastSync->last_synced_at : null,
            'needs_sync' => MLSProperty::active()
                ->where(function ($query) {
                    $query->whereNull('last_synced_at')
                        ->orWhere('last_synced_at', '<', now()->subHours(24));
                })
                ->count(),
        ];
    }

    /**
     * Map Repliers status to our status
     *
     * Repliers uses:
     * - status: "A" (active), "U" (unavailable)
     * - lastStatus: "Sld" (sold), "Lsd" (leased), "Exp" (expired), etc.
     */
    private function mapStatus(?string $status, ?string $lastStatus = null, ?string $type = null): string
    {
        $lastStatusLower = strtolower($lastStatus ?? '');

        if ($lastStatusLower === 'sld') {
            return 'sold';
        }
        if (in_array($lastStatusLower, ['lsd', 'lc'])) {
            return 'leased';
        }

        $statusUpper = strtoupper($status ?? 'A');

        if ($statusUpper === 'U') {
            // Unavailable - check type to determine sold vs leased
            if ($type && (str_contains(strtolower($type), 'lease') || str_contains(strtolower($type), 'rent'))) {
                return 'leased';
            }
            return 'sold';
        }

        return 'active';
    }

    /**
     * Parse date from Repliers format
     */
    private function parseDate(?string $date): ?Carbon
    {
        if (!$date) {
            return null;
        }

        try {
            return Carbon::parse($date);
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Parse square footage from Repliers format (could be "500-599" range)
     */
    private function parseSquareFootage($sqft): ?float
    {
        if (!$sqft) {
            return null;
        }

        if (is_numeric($sqft)) {
            return (float) $sqft;
        }

        // Handle range format like "500-599"
        if (is_string($sqft) && str_contains($sqft, '-')) {
            $parts = explode('-', $sqft);
            if (count($parts) === 2 && is_numeric(trim($parts[0])) && is_numeric(trim($parts[1]))) {
                return ((float) trim($parts[0]) + (float) trim($parts[1])) / 2;
            }
        }

        return null;
    }
}
