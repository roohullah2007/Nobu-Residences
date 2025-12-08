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
 * Syncs MLS data to local mls_properties table for caching
 * Does NOT download images - only stores URLs
 */
class MLSSyncService
{
    private AmpreApiService $ampreApi;

    public function __construct(AmpreApiService $ampreApi)
    {
        $this->ampreApi = $ampreApi;
    }

    /**
     * Get or create sync state instance
     */
    private function getSyncState(): MLSSyncState
    {
        return MLSSyncState::getInstance();
    }

    /**
     * Sync all active listings from MLS with offset tracking
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

            // Check if already syncing
            if ($syncState->isSyncing()) {
                Log::warning('Sync already in progress');
                return [
                    'success' => false,
                    'error' => 'Sync already in progress',
                    'synced' => 0,
                    'updated' => 0
                ];
            }

            // Start sync
            $syncState->startSync('initial_load');

            Log::info('Starting MLS sync', [
                'limit' => $limit,
                'batch_size' => $batchSize,
                'resumable' => $resumable,
                'all_statuses' => $allStatuses,
                'sold_leased_only' => $soldLeasedOnly,
                'starting_offset' => $resumable ? $syncState->current_batch_offset : 0
            ]);

            $synced = 0;
            $updated = 0;
            $failed = 0;
            $errors = [];
            $reachedEnd = false;  // Track if we reached end of available listings

            // Start from saved offset if resumable, otherwise start fresh
            $startOffset = $resumable ? $syncState->current_batch_offset : 0;

            // Calculate end offset: start + limit (number of properties to process in this run)
            $endOffset = $startOffset + $limit;

            // Process in batches
            for ($skip = $startOffset; $skip < $endOffset; $skip += $batchSize) {
                try {
                    $batchResult = $this->syncBatch($skip, $batchSize, $allStatuses, $soldLeasedOnly);

                    $synced += $batchResult['synced'];
                    $updated += $batchResult['updated'];
                    $failed += $batchResult['failed'];

                    if (!empty($batchResult['errors'])) {
                        $errors = array_merge($errors, $batchResult['errors']);
                    }

                    // Update sync state with progress
                    $syncState->updateRunStats([
                        'synced' => $batchResult['synced'],
                        'updated' => $batchResult['updated'],
                        'failed' => $batchResult['failed']
                    ]);

                    // Update offset
                    $syncState->update(['current_batch_offset' => $skip + $batchSize]);

                    Log::info("Processed batch", [
                        'skip' => $skip,
                        'batch_size' => $batchSize,
                        'synced' => $batchResult['synced'],
                        'updated' => $batchResult['updated'],
                        'total_offset' => $skip + $batchSize
                    ]);

                    // If we got fewer results than batch size, we're done
                    if ($batchResult['fetched'] < $batchSize) {
                        $reachedEnd = true;  // We actually reached the end of available listings
                        Log::info('Reached end of available listings', [
                            'last_batch_size' => $batchResult['fetched']
                        ]);
                        break;
                    }

                } catch (Exception $e) {
                    Log::error('Batch sync failed', [
                        'skip' => $skip,
                        'error' => $e->getMessage()
                    ]);
                    $errors[] = "Batch at offset {$skip}: " . $e->getMessage();

                    // Mark sync as failed but keep progress
                    $syncState->failSync($e->getMessage());

                    return [
                        'success' => false,
                        'error' => $e->getMessage(),
                        'synced' => $synced,
                        'updated' => $updated,
                        'failed' => $failed,
                        'errors' => $errors,
                        'offset' => $skip,
                        'resumable' => true
                    ];
                }
            }

            // Mark old listings as inactive
            $deactivated = $this->deactivateOldListings();

            // Only mark initial sync as complete if we actually reached the end
            if ($reachedEnd && $syncState->sync_mode === 'initial_load') {
                $syncState->markInitialSyncComplete();
                Log::info('Initial sync complete - switching to incremental mode');
            }

            // Complete sync successfully
            $syncState->completeSync();

            return [
                'success' => true,
                'synced' => $synced,
                'updated' => $updated,
                'failed' => $failed,
                'deactivated' => $deactivated,
                'errors' => $errors,
                'timestamp' => now()->toDateTimeString()
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
                'updated' => 0
            ];
        }
    }

    /**
     * Sync only UPDATED/CHANGED listings since last sync (Incremental Sync)
     * Much more efficient - only syncs listings modified since last sync
     */
    public function syncIncrementalUpdates(array $options = []): array
    {
        try {
            $batchSize = $options['batch_size'] ?? 100;
            $maxBatches = $options['max_batches'] ?? 50; // Max 5000 listings per run

            $syncState = $this->getSyncState();

            // Check if already syncing
            if ($syncState->isSyncing()) {
                Log::warning('Sync already in progress');
                return [
                    'success' => false,
                    'error' => 'Sync already in progress',
                    'synced' => 0,
                    'updated' => 0
                ];
            }

            // Start incremental sync
            $syncState->startSync('incremental');

            // Get last sync time from database
            $lastSync = MLSProperty::whereNotNull('last_synced_at')
                ->orderBy('last_synced_at', 'desc')
                ->first();

            $sinceDate = $lastSync
                ? $lastSync->last_synced_at->subMinutes(5) // 5 min buffer for clock differences
                : now()->subDays(7); // First run: get last 7 days

            Log::info('Starting incremental sync', [
                'since' => $sinceDate->toDateTimeString(),
                'batch_size' => $batchSize
            ]);

            $synced = 0;
            $updated = 0;
            $statusChanged = 0;
            $failed = 0;
            $errors = [];

            // Process in batches
            for ($batch = 0; $batch < $maxBatches; $batch++) {
                $skip = $batch * $batchSize;

                try {
                    $batchResult = $this->syncIncrementalBatch($skip, $batchSize, $sinceDate);

                    $synced += $batchResult['synced'];
                    $updated += $batchResult['updated'];
                    $statusChanged += $batchResult['status_changed'];
                    $failed += $batchResult['failed'];

                    if (!empty($batchResult['errors'])) {
                        $errors = array_merge($errors, $batchResult['errors']);
                    }

                    // Update sync state
                    $syncState->updateRunStats([
                        'synced' => $batchResult['synced'],
                        'updated' => $batchResult['updated'],
                        'failed' => $batchResult['failed'],
                        'status_changed' => $batchResult['status_changed']
                    ]);

                    Log::info("Processed incremental batch", [
                        'batch' => $batch,
                        'synced' => $batchResult['synced'],
                        'updated' => $batchResult['updated'],
                        'status_changed' => $batchResult['status_changed']
                    ]);

                    // If we got fewer results than batch size, we're done
                    if ($batchResult['fetched'] < $batchSize) {
                        break;
                    }

                } catch (Exception $e) {
                    Log::error('Incremental batch failed', [
                        'batch' => $batch,
                        'error' => $e->getMessage()
                    ]);
                    $errors[] = "Batch {$batch}: " . $e->getMessage();
                    break;
                }
            }

            // Complete sync
            $syncState->completeSync();

            return [
                'success' => true,
                'synced' => $synced,
                'updated' => $updated,
                'status_changed' => $statusChanged,
                'failed' => $failed,
                'since' => $sinceDate->toDateTimeString(),
                'errors' => $errors,
                'timestamp' => now()->toDateTimeString()
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
                'updated' => 0
            ];
        }
    }

    /**
     * Auto sync - intelligently choose between initial and incremental
     */
    public function syncAuto(array $options = []): array
    {
        $syncState = $this->getSyncState();

        // If initial sync is not complete, continue/start initial load
        if ($syncState->needsInitialSync()) {
            Log::info('Running initial sync (auto mode)');
            return $this->syncAllListings(array_merge($options, ['resumable' => true]));
        }

        // Otherwise, run incremental sync
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
     * Sync a batch of ONLY modified listings
     */
    private function syncIncrementalBatch(int $skip, int $batchSize, Carbon $sinceDate): array
    {
        // Configure API request - fetch COMPLETE listing object (all fields)
        $this->ampreApi->resetFilters();
        $this->ampreApi->setSelect([]); // Empty select = fetch ALL fields (no config defaults)
        $this->ampreApi->setCacheTtl(0); // Disable caching to avoid max_allowed_packet errors

        // IMPORTANT: Use ALL STATUSES filter to catch status changes (Active → Sold/Leased)
        $this->applyGTACondoFiltersAllStatuses();

        // KEY: Only get listings modified since last sync
        // Use custom filter with proper OData date syntax
        $formattedDate = $sinceDate->copy()->setTimezone('UTC')->format('Y-m-d\TH:i:s');
        $this->ampreApi->addCustomFilter("ModificationTimestamp ge {$formattedDate}Z");

        // Set pagination
        $this->ampreApi->setTop($batchSize);
        $this->ampreApi->setSkip($skip);

        // Order by modification date (newest first)
        $this->ampreApi->setOrderBy(['ModificationTimestamp desc']);

        // Fetch properties
        $result = $this->ampreApi->fetchPropertiesWithCount();

        $synced = 0;
        $updated = 0;
        $statusChanged = 0;
        $failed = 0;
        $errors = [];

        // Get image URLs for this batch
        $listingKeys = array_column($result['properties'], 'ListingKey');
        $imagesByListing = $this->fetchImageUrls($listingKeys);

        // Sync each property
        foreach ($result['properties'] as $mlsData) {
            try {
                $listingKey = $mlsData['ListingKey'];
                $imageUrls = $imagesByListing[$listingKey] ?? [];

                // Check if this is a status change
                $existing = MLSProperty::where('mls_id', $listingKey)->first();
                $hadStatusChange = false;

                if ($existing && $existing->status !== $this->mapStatus($mlsData['StandardStatus'] ?? 'Active', $mlsData['TransactionType'] ?? null, $mlsData['MlsStatus'] ?? null)) {
                    $hadStatusChange = true;
                    $statusChanged++;
                }

                $wasUpdated = $this->syncProperty($mlsData, $imageUrls);

                if ($wasUpdated && !$hadStatusChange) {
                    $updated++;
                } elseif (!$wasUpdated) {
                    $synced++;
                }

            } catch (Exception $e) {
                $failed++;
                $errors[] = "Property {$mlsData['ListingKey']}: " . $e->getMessage();
                Log::error('Property incremental sync failed', [
                    'listing_key' => $mlsData['ListingKey'],
                    'error' => $e->getMessage()
                ]);
            }
        }

        return [
            'fetched' => count($result['properties']),
            'synced' => $synced,
            'updated' => $updated,
            'status_changed' => $statusChanged,
            'failed' => $failed,
            'errors' => $errors
        ];
    }

    /**
     * Sync a batch of listings
     */
    private function syncBatch(int $skip, int $batchSize, bool $allStatuses = false, bool $soldLeasedOnly = false): array
    {
        // Configure API request - fetch COMPLETE listing object (all fields)
        // Store everything in mls_data JSON column, extract key fields for indexing
        $this->ampreApi->resetFilters();
        $this->ampreApi->setSelect([]); // Empty select = fetch ALL fields (no config defaults)
        $this->ampreApi->setCacheTtl(0); // Disable caching to avoid max_allowed_packet errors

        // DEFAULT FILTERS: GTA Condo Apartments
        // Priority: soldLeasedOnly > allStatuses > Active only
        if ($soldLeasedOnly) {
            $this->applyGTACondoFiltersSoldLeased();
        } elseif ($allStatuses) {
            $this->applyGTACondoFiltersAllStatuses();
        } else {
            $this->applyGTACondoFilters();
        }

        // Set pagination
        $this->ampreApi->setTop($batchSize);
        $this->ampreApi->setSkip($skip);

        // Order by modification date to get latest first
        $this->ampreApi->setOrderBy(['ModificationTimestamp desc']);

        // Fetch properties
        $result = $this->ampreApi->fetchPropertiesWithCount();

        $synced = 0;
        $updated = 0;
        $failed = 0;
        $errors = [];

        // Get image URLs for this batch
        $listingKeys = array_column($result['properties'], 'ListingKey');
        $imagesByListing = $this->fetchImageUrls($listingKeys);

        // Sync each property
        foreach ($result['properties'] as $mlsData) {
            try {
                $listingKey = $mlsData['ListingKey'];
                $imageUrls = $imagesByListing[$listingKey] ?? [];

                $wasUpdated = $this->syncProperty($mlsData, $imageUrls);

                if ($wasUpdated) {
                    $updated++;
                } else {
                    $synced++;
                }

            } catch (Exception $e) {
                $failed++;
                $errors[] = "Property {$mlsData['ListingKey']}: " . $e->getMessage();
                Log::error('Property sync failed', [
                    'listing_key' => $mlsData['ListingKey'],
                    'error' => $e->getMessage()
                ]);
            }
        }

        return [
            'fetched' => count($result['properties']),
            'synced' => $synced,
            'updated' => $updated,
            'failed' => $failed,
            'errors' => $errors
        ];
    }

    /**
     * Sync individual property
     * Returns true if updated, false if created
     */
    private function syncProperty(array $mlsData, array $imageUrls = []): bool
    {
        $listingKey = $mlsData['ListingKey'];

        // Find existing property
        $property = MLSProperty::where('mls_id', $listingKey)->first();

        // Prepare data
        $data = [
            'mls_id' => $listingKey,
            'mls_number' => $listingKey, // Use ListingKey as MLS number
            'latitude' => $mlsData['Latitude'] ?? null,
            'longitude' => $mlsData['Longitude'] ?? null,
            'address' => $mlsData['UnparsedAddress'] ?? null,
            'city' => $mlsData['City'] ?? null,
            'province' => $mlsData['StateOrProvince'] ?? null,
            'postal_code' => $mlsData['PostalCode'] ?? null,
            'country' => $mlsData['Country'] ?? 'Canada',
            'property_type' => $this->mapTransactionType($mlsData['TransactionType'] ?? null),
            'property_sub_type' => $mlsData['PropertySubType'] ?? null,
            'status' => $this->mapStatus($mlsData['StandardStatus'] ?? 'Active', $mlsData['TransactionType'] ?? null, $mlsData['MlsStatus'] ?? null),
            'price' => $mlsData['ListPrice'] ?? null,
            'bedrooms' => $mlsData['BedroomsTotal'] ?? null,
            'bathrooms' => $mlsData['BathroomsTotalInteger'] ?? null,
            'parking_spaces' => $mlsData['ParkingTotal'] ?? $mlsData['GarageSpaces'] ?? null,
            'square_footage' => $mlsData['LivingArea'] ?? $mlsData['AboveGradeFinishedArea'] ?? $mlsData['BuildingAreaTotal'] ?? null,
            'lot_size' => $mlsData['LotSizeArea'] ?? $mlsData['LotSizeSquareFeet'] ?? null,
            'listed_date' => $this->parseDate($mlsData['ListingContractDate'] ?? $mlsData['ModificationTimestamp'] ?? null),
            'sold_date' => $this->parseDate($mlsData['CloseDate'] ?? null),
            'updated_date' => $this->parseDate($mlsData['ModificationTimestamp'] ?? null),
            'last_synced_at' => now(),
            'mls_data' => $mlsData,
            'image_urls' => $imageUrls,
            // is_active: true for Active listings, false for Sold/Leased
            // Check MlsStatus first (Sold/Leased = not active), then StandardStatus
            'is_active' => $this->isActiveProperty($mlsData),
            'sync_failed' => false,
            'sync_error' => null,
        ];

        if ($property) {
            // Update existing
            $property->update($data);
            return true;
        } else {
            // Create new
            MLSProperty::create($data);
            return false;
        }
    }

    /**
     * Fetch image URLs for listings (does NOT download)
     */
    private function fetchImageUrls(array $listingKeys): array
    {
        if (empty($listingKeys)) {
            return [];
        }

        try {
            // Try different size descriptions to get the best quality
            $sizeDescriptions = ['Large', 'Medium', 'Largest', 'Original'];

            foreach ($sizeDescriptions as $sizeDescription) {
                $images = $this->ampreApi->getPropertiesImages($listingKeys, $sizeDescription, 250);

                if (!empty($images)) {
                    // Convert to array of URLs only
                    $imagesByListing = [];
                    foreach ($images as $listingKey => $propertyImages) {
                        $imagesByListing[$listingKey] = array_map(function($img) {
                            return $img['MediaURL'] ?? null;
                        }, $propertyImages);

                        // Filter out null URLs
                        $imagesByListing[$listingKey] = array_filter($imagesByListing[$listingKey]);
                    }

                    return $imagesByListing;
                }
            }

            return [];

        } catch (Exception $e) {
            Log::warning('Failed to fetch image URLs', [
                'error' => $e->getMessage(),
                'listing_count' => count($listingKeys)
            ]);
            return [];
        }
    }

    /**
     * Delete listings that haven't been synced recently
     * We no longer use "inactive" status - old listings are simply removed
     */
    private function deactivateOldListings(int $hoursOld = 48): int
    {
        $cutoffTime = now()->subHours($hoursOld);

        return MLSProperty::where('is_active', true)
            ->where(function($query) use ($cutoffTime) {
                $query->whereNull('last_synced_at')
                      ->orWhere('last_synced_at', '<', $cutoffTime);
            })
            ->delete();
    }

    /**
     * Sync specific listings by MLS IDs
     */
    public function syncSpecificListings(array $mlsIds): array
    {
        $synced = 0;
        $updated = 0;
        $failed = 0;
        $errors = [];

        foreach ($mlsIds as $mlsId) {
            try {
                $this->ampreApi->resetFilters();
                $this->ampreApi->addFilter('ListingKey', $mlsId);

                $result = $this->ampreApi->fetchPropertiesWithCount();

                if (!empty($result['properties'])) {
                    $mlsData = $result['properties'][0];

                    // Fetch images
                    $imagesByListing = $this->fetchImageUrls([$mlsId]);
                    $imageUrls = $imagesByListing[$mlsId] ?? [];

                    $wasUpdated = $this->syncProperty($mlsData, $imageUrls);

                    if ($wasUpdated) {
                        $updated++;
                    } else {
                        $synced++;
                    }
                }

            } catch (Exception $e) {
                $failed++;
                $errors[] = "MLS ID {$mlsId}: " . $e->getMessage();
            }
        }

        return [
            'success' => true,
            'synced' => $synced,
            'updated' => $updated,
            'failed' => $failed,
            'errors' => $errors
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

        // Count properties with images (image_urls is not null and not empty array)
        $withImages = MLSProperty::whereNotNull('image_urls')
            ->whereRaw("JSON_LENGTH(image_urls) > 0")
            ->count();

        // Count properties with geocoding (valid lat/lng)
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
                ->where(function($query) {
                    $query->whereNull('last_synced_at')
                          ->orWhere('last_synced_at', '<', now()->subHours(24));
                })
                ->count(),
        ];
    }

    /**
     * Map transaction type to our property type
     * MLS API returns: "For Sale", "For Lease", "Sale", "Lease", etc.
     * We store: "For Sale" or "For Rent"
     */
    private function mapTransactionType(?string $transactionType): ?string
    {
        if (!$transactionType) {
            return null;
        }

        $lower = strtolower(trim($transactionType));

        // Match various formats from MLS API
        return match (true) {
            str_contains($lower, 'sale') => 'For Sale',
            str_contains($lower, 'lease') || str_contains($lower, 'rent') => 'For Rent',
            default => 'For Sale'
        };
    }

    /**
     * Map MLS status to our status
     * Uses MlsStatus field (TRREB-specific) for accurate status detection
     *
     * @param string|null $standardStatus The StandardStatus from MLS (Active, Closed, Expired, etc.)
     * @param string|null $transactionType The TransactionType from MLS (For Sale, For Lease)
     * @param string|null $mlsStatus The MlsStatus from MLS (Sold, Leased, New, Price Change, etc.)
     */
    private function mapStatus(?string $standardStatus, ?string $transactionType = null, ?string $mlsStatus = null): string
    {
        // First check MlsStatus field - most accurate for Sold/Leased
        if ($mlsStatus) {
            $mlsStatusLower = strtolower($mlsStatus);

            // Direct mapping from MlsStatus
            if ($mlsStatusLower === 'sold') {
                return 'sold';
            }
            if ($mlsStatusLower === 'leased') {
                return 'leased';
            }
        }

        // Fallback to StandardStatus
        if (!$standardStatus) {
            return 'active';
        }

        $status = strtolower($standardStatus);
        $txType = strtolower($transactionType ?? '');

        // Handle 'Closed' status - determine if Sold or Leased based on transaction type
        if ($status === 'closed') {
            // If it was a lease transaction, mark as leased; otherwise mark as sold
            if (str_contains($txType, 'lease') || str_contains($txType, 'rent')) {
                return 'leased';
            }
            return 'sold';
        }

        // We only keep: active, sold, leased
        // Expired/withdrawn/cancelled listings will be deleted during sync cleanup
        return match ($status) {
            'active' => 'active',
            'sold' => 'sold',
            'leased' => 'leased',
            default => 'active'
        };
    }

    /**
     * Determine if a property is active (for sale/rent) vs closed (sold/leased)
     * Uses MlsStatus field for accurate detection
     *
     * @param array $mlsData The MLS data array
     * @return bool True if active, false if sold/leased
     */
    private function isActiveProperty(array $mlsData): bool
    {
        $mlsStatus = strtolower($mlsData['MlsStatus'] ?? '');

        // Sold or Leased = not active
        if ($mlsStatus === 'sold' || $mlsStatus === 'leased') {
            return false;
        }

        // Check StandardStatus as fallback
        $standardStatus = strtolower($mlsData['StandardStatus'] ?? 'active');

        return $standardStatus === 'active';
    }

    /**
     * Parse date from MLS format
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
     * Apply default GTA Condo Apartment filters
     * This restricts sync to ONLY ACTIVE Condo Apartments in GTA cities
     */
    private function applyGTACondoFilters(): void
    {
        // Filter 1: Only Condo Apartments
        $this->ampreApi->addFilter('PropertySubType', 'Condo Apartment');

        // Filter 2: ONLY ACTIVE listings (exclude Sold, Leased, Expired, etc.)
        $this->ampreApi->addFilter('StandardStatus', 'Active');

        // Filter 3: GTA Cities (using OR logic via custom filter)
        $gtaCities = [
            'Toronto', 'Mississauga', 'Brampton', 'Caledon',
            'Markham', 'Vaughan', 'Richmond Hill', 'Aurora',
            'Newmarket', 'King', 'Whitchurch-Stouffville', 'Georgina',
            'Oshawa', 'Whitby', 'Ajax', 'Pickering', 'Clarington',
            'Uxbridge', 'Scugog', 'Brock',
            'Oakville', 'Burlington', 'Milton', 'Halton Hills'
        ];

        // Build OR condition for cities using contains
        $cityConditions = array_map(function($city) {
            return "contains(City,'{$city}')";
        }, $gtaCities);

        $cityFilter = '(' . implode(' or ', $cityConditions) . ')';
        $this->ampreApi->addCustomFilter($cityFilter);

        Log::info('Applied GTA Condo filters - ACTIVE ONLY', [
            'property_type' => 'Condo Apartment',
            'status' => 'Active',
            'cities' => count($gtaCities)
        ]);
    }

    /**
     * Apply GTA Condo Apartment filters - SOLD AND LEASED ONLY
     * Used to sync sold and leased properties using MlsStatus field
     * Filters: MlsStatus IN ('Sold', 'Leased')
     */
    private function applyGTACondoFiltersSoldLeased(): void
    {
        // Filter 1: Only Condo Apartments
        $this->ampreApi->addFilter('PropertySubType', 'Condo Apartment');

        // Filter 2: Only Sold OR Leased using MlsStatus field
        // MlsStatus = 'Sold' for sold properties, 'Leased' for leased properties
        $this->ampreApi->addCustomFilter("(MlsStatus eq 'Sold' or MlsStatus eq 'Leased')");

        // Filter 3: GTA Cities
        $gtaCities = [
            'Toronto', 'Mississauga', 'Brampton', 'Caledon',
            'Markham', 'Vaughan', 'Richmond Hill', 'Aurora',
            'Newmarket', 'King', 'Whitchurch-Stouffville', 'Georgina',
            'Oshawa', 'Whitby', 'Ajax', 'Pickering', 'Clarington',
            'Uxbridge', 'Scugog', 'Brock',
            'Oakville', 'Burlington', 'Milton', 'Halton Hills'
        ];

        // Build OR condition for cities using contains
        $cityConditions = array_map(function($city) {
            return "contains(City,'{$city}')";
        }, $gtaCities);

        $cityFilter = '(' . implode(' or ', $cityConditions) . ')';
        $this->ampreApi->addCustomFilter($cityFilter);

        Log::info('Applied GTA Condo filters - SOLD/LEASED ONLY', [
            'property_type' => 'Condo Apartment',
            'mls_status' => "Sold, Leased",
            'cities' => count($gtaCities)
        ]);
    }

    /**
     * Apply GTA Condo Apartment filters - ALL RELEVANT STATUSES
     * Used for incremental sync to detect status changes
     * Includes: Active (For Sale/Rent), Sold, Leased
     * Excludes: Terminated, Expired, Suspended, Cancelled
     */
    private function applyGTACondoFiltersAllStatuses(): void
    {
        // Filter 1: Only Condo Apartments
        $this->ampreApi->addFilter('PropertySubType', 'Condo Apartment');

        // Filter 2: Only relevant statuses (Active + Sold + Leased)
        // StandardStatus = 'Active' for active listings
        // MlsStatus = 'Sold' or 'Leased' for closed deals
        $this->ampreApi->addCustomFilter("(StandardStatus eq 'Active' or MlsStatus eq 'Sold' or MlsStatus eq 'Leased')");

        // Filter 3: GTA Cities
        $gtaCities = [
            'Toronto', 'Mississauga', 'Brampton', 'Caledon',
            'Markham', 'Vaughan', 'Richmond Hill', 'Aurora',
            'Newmarket', 'King', 'Whitchurch-Stouffville', 'Georgina',
            'Oshawa', 'Whitby', 'Ajax', 'Pickering', 'Clarington',
            'Uxbridge', 'Scugog', 'Brock',
            'Oakville', 'Burlington', 'Milton', 'Halton Hills'
        ];

        // Build OR condition for cities using contains
        $cityConditions = array_map(function($city) {
            return "contains(City,'{$city}')";
        }, $gtaCities);

        $cityFilter = '(' . implode(' or ', $cityConditions) . ')';
        $this->ampreApi->addCustomFilter($cityFilter);

        Log::info('Applied GTA Condo filters - ACTIVE + SOLD + LEASED', [
            'property_type' => 'Condo Apartment',
            'status' => 'Active, Sold, Leased (excludes Terminated, Expired, Suspended)',
            'cities' => count($gtaCities)
        ]);
    }
}
