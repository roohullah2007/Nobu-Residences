<?php

namespace App\Services;

use App\Models\MLSProperty;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

/**
 * MLS Image Sync Service
 *
 * Updates image URLs for existing properties
 * Does NOT sync property data - only refreshes images
 * Processes properties one by one with progress tracking
 */
class MLSImageSyncService
{
    private AmpreApiService $ampreApi;

    public function __construct(AmpreApiService $ampreApi)
    {
        $this->ampreApi = $ampreApi;
    }

    /**
     * Sync images for properties
     *
     * @param array $options
     * @return array
     */
    public function syncImages(array $options = []): array
    {
        try {
            $limit = $options['limit'] ?? null; // null = all properties
            $batchSize = $options['batch_size'] ?? 50; // How many properties to process per batch
            $skipExisting = $options['skip_existing'] ?? true; // Skip properties that already have images
            $onlyActive = $options['only_active'] ?? true; // Only sync active properties

            Log::info('Starting MLS image sync', [
                'limit' => $limit,
                'batch_size' => $batchSize,
                'skip_existing' => $skipExisting,
                'only_active' => $onlyActive
            ]);

            $updated = 0;
            $skipped = 0;
            $failed = 0;
            $errors = [];

            // Build query for properties that need image updates
            $query = MLSProperty::query();

            if ($onlyActive) {
                $query->active();
            }

            if ($skipExisting) {
                // Only properties with no images or empty image array
                $query->where(function($q) {
                    $q->whereNull('image_urls')
                      ->orWhereRaw('JSON_LENGTH(image_urls) = 0');
                });
            }

            if ($limit) {
                $query->limit($limit);
            }

            $totalProperties = $query->count();
            Log::info("Found {$totalProperties} properties to process");

            // Process in chunks to avoid memory issues
            $query->chunk($batchSize, function(Collection $properties) use (&$updated, &$skipped, &$failed, &$errors, $batchSize) {
                // Collect all listing keys for this batch
                $listingKeys = $properties->pluck('mls_id')->toArray();

                // Fetch all images for this batch in one API call
                $imagesByListing = $this->fetchImageUrls($listingKeys);

                // Update each property
                foreach ($properties as $property) {
                    try {
                        $listingKey = $property->mls_id;
                        $imageUrls = $imagesByListing[$listingKey] ?? [];

                        if (empty($imageUrls)) {
                            $skipped++;
                            Log::debug("No images found for {$listingKey}");
                            continue;
                        }

                        // Update image URLs and has_images flag
                        $property->update([
                            'image_urls' => $imageUrls,
                            'has_images' => count($imageUrls) > 0,
                            'last_synced_at' => now(),
                            'sync_failed' => false,
                            'sync_error' => null,
                        ]);

                        $updated++;
                        Log::debug("Updated images for {$listingKey}", [
                            'image_count' => count($imageUrls)
                        ]);

                    } catch (Exception $e) {
                        $failed++;
                        $errors[] = "Property {$property->mls_id}: " . $e->getMessage();
                        Log::error('Image update failed', [
                            'mls_id' => $property->mls_id,
                            'error' => $e->getMessage()
                        ]);

                        // Mark property sync as failed
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
                'timestamp' => now()->toDateTimeString()
            ];

        } catch (Exception $e) {
            Log::error('Image Sync Error', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'updated' => 0,
                'skipped' => 0,
                'failed' => 0
            ];
        }
    }

    /**
     * Sync images for specific properties by MLS IDs
     *
     * @param array $mlsIds
     * @return array
     */
    public function syncImagesForProperties(array $mlsIds): array
    {
        $updated = 0;
        $skipped = 0;
        $failed = 0;
        $errors = [];

        try {
            // Fetch all images for these properties in one API call
            $imagesByListing = $this->fetchImageUrls($mlsIds);

            foreach ($mlsIds as $mlsId) {
                try {
                    $property = MLSProperty::where('mls_id', $mlsId)->first();

                    if (!$property) {
                        $skipped++;
                        $errors[] = "Property {$mlsId} not found in database";
                        continue;
                    }

                    $imageUrls = $imagesByListing[$mlsId] ?? [];

                    if (empty($imageUrls)) {
                        $skipped++;
                        continue;
                    }

                    $property->update([
                        'image_urls' => $imageUrls,
                        'has_images' => count($imageUrls) > 0,
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
                'errors' => $errors
            ];

        } catch (Exception $e) {
            Log::error('Specific image sync failed', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'updated' => $updated,
                'skipped' => $skipped,
                'failed' => $failed,
                'errors' => $errors
            ];
        }
    }

    /**
     * Get statistics about images in the database
     *
     * @return array
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

    /**
     * Fetch image URLs for listings (does NOT download)
     *
     * @param array $listingKeys
     * @return array Array keyed by ListingKey with array of image URLs as values
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

                        // Filter out null URLs and reset array keys
                        $imagesByListing[$listingKey] = array_values(array_filter($imagesByListing[$listingKey]));
                    }

                    return $imagesByListing;
                }
            }

            Log::warning('No images found for any size description', [
                'listing_count' => count($listingKeys),
                'tried_sizes' => $sizeDescriptions
            ]);

            return [];

        } catch (Exception $e) {
            Log::warning('Failed to fetch image URLs', [
                'error' => $e->getMessage(),
                'listing_count' => count($listingKeys)
            ]);
            return [];
        }
    }
}
