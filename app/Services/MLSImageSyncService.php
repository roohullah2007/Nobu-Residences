<?php

namespace App\Services;

use App\Models\MLSProperty;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

/**
 * MLS Image Sync Service
 *
 * Updates image URLs for existing properties using Repliers API
 * Images are served via Repliers CDN (https://cdn.repliers.io/)
 */
class MLSImageSyncService
{
    private RepliersApiService $repliersApi;

    public function __construct(RepliersApiService $repliersApi)
    {
        $this->repliersApi = $repliersApi;
    }

    /**
     * Sync images for properties by re-fetching listing data from Repliers
     */
    public function syncImages(array $options = []): array
    {
        try {
            $limit = $options['limit'] ?? null;
            $batchSize = $options['batch_size'] ?? 50;
            $skipExisting = $options['skip_existing'] ?? true;
            $onlyActive = $options['only_active'] ?? true;
            $soldLeasedOnly = $options['sold_leased_only'] ?? false;

            Log::info('Starting MLS image sync via Repliers', [
                'limit' => $limit,
                'batch_size' => $batchSize,
                'skip_existing' => $skipExisting,
                'only_active' => $onlyActive,
                'sold_leased_only' => $soldLeasedOnly,
            ]);

            $updated = 0;
            $skipped = 0;
            $failed = 0;
            $errors = [];

            $query = MLSProperty::query();

            if ($soldLeasedOnly) {
                $query->whereIn('status', ['sold', 'leased']);
            } elseif ($onlyActive) {
                $query->active();
            }

            if ($skipExisting) {
                $query->where(function ($q) {
                    $q->whereNull('image_urls')
                        ->orWhere('has_images', false);
                });
            }

            if ($limit) {
                $query->limit($limit);
            }

            $totalProperties = $query->count();
            Log::info("Found {$totalProperties} properties to process for images");

            $query->chunk($batchSize, function (Collection $properties) use (&$updated, &$skipped, &$failed, &$errors) {
                foreach ($properties as $property) {
                    try {
                        $mlsNumber = $property->mls_id;

                        // Re-fetch listing from Repliers to get latest images
                        $result = $this->repliersApi->searchListingsNoCache([
                            'search' => $mlsNumber,
                            'resultsPerPage' => 1,
                            'fields' => 'mlsNumber,images',
                        ]);

                        $listing = null;
                        if (!empty($result['listings'])) {
                            foreach ($result['listings'] as $l) {
                                if (($l['mlsNumber'] ?? '') === $mlsNumber) {
                                    $listing = $l;
                                    break;
                                }
                            }
                        }

                        if (!$listing || empty($listing['images'])) {
                            $skipped++;
                            Log::debug("No images found for {$mlsNumber}");
                            continue;
                        }

                        $imageUrls = array_map(
                            fn($img) => $this->repliersApi->getImageUrl($img),
                            $listing['images']
                        );

                        $property->update([
                            'image_urls' => $imageUrls,
                            'has_images' => true,
                            'last_synced_at' => now(),
                            'sync_failed' => false,
                            'sync_error' => null,
                        ]);

                        $updated++;
                        Log::debug("Updated images for {$mlsNumber}", [
                            'image_count' => count($imageUrls),
                        ]);

                    } catch (Exception $e) {
                        $failed++;
                        $errors[] = "Property {$property->mls_id}: " . $e->getMessage();
                        Log::error('Image update failed', [
                            'mls_id' => $property->mls_id,
                            'error' => $e->getMessage(),
                        ]);
                        $property->markSyncFailed($e->getMessage());
                    }
                }
            });

            return [
                'success' => true,
                'total_processed' => $totalProperties,
                'updated' => $updated,
                'skipped' => $skipped,
                'failed' => $failed,
                'errors' => $errors,
                'timestamp' => now()->toDateTimeString(),
            ];

        } catch (Exception $e) {
            Log::error('Image Sync Error', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'updated' => 0,
                'skipped' => 0,
                'failed' => 0,
            ];
        }
    }

    /**
     * Sync images for specific properties by MLS IDs
     */
    public function syncImagesForProperties(array $mlsIds): array
    {
        $updated = 0;
        $skipped = 0;
        $failed = 0;
        $errors = [];

        foreach ($mlsIds as $mlsId) {
            try {
                $property = MLSProperty::where('mls_id', $mlsId)->first();

                if (!$property) {
                    $skipped++;
                    $errors[] = "Property {$mlsId} not found in database";
                    continue;
                }

                // Fetch from Repliers
                $result = $this->repliersApi->searchListingsNoCache([
                    'search' => $mlsId,
                    'resultsPerPage' => 1,
                    'fields' => 'mlsNumber,images',
                ]);

                $listing = null;
                if (!empty($result['listings'])) {
                    foreach ($result['listings'] as $l) {
                        if (($l['mlsNumber'] ?? '') === $mlsId) {
                            $listing = $l;
                            break;
                        }
                    }
                }

                if (!$listing || empty($listing['images'])) {
                    $skipped++;
                    continue;
                }

                $imageUrls = array_map(
                    fn($img) => $this->repliersApi->getImageUrl($img),
                    $listing['images']
                );

                $property->update([
                    'image_urls' => $imageUrls,
                    'has_images' => true,
                    'last_synced_at' => now(),
                    'sync_failed' => false,
                    'sync_error' => null,
                ]);

                $updated++;

            } catch (Exception $e) {
                $failed++;
                $errors[] = "Property {$mlsId}: " . $e->getMessage();
            }
        }

        return [
            'success' => true,
            'updated' => $updated,
            'skipped' => $skipped,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }

    /**
     * Get statistics about images in the database
     */
    public function getImageStats(): array
    {
        return [
            'total_properties' => MLSProperty::count(),
            'properties_with_images' => MLSProperty::where('has_images', true)->count(),
            'properties_without_images' => MLSProperty::where('has_images', false)->count(),
            'active_properties_without_images' => MLSProperty::active()
                ->where('has_images', false)
                ->count(),
        ];
    }
}
