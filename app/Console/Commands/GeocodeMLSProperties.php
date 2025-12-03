<?php

namespace App\Console\Commands;

use App\Models\MLSProperty;
use App\Services\GeocodingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GeocodeMLSProperties extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mls:geocode
                            {--limit=100 : Maximum number of properties to geocode per run}
                            {--force : Force re-geocode even if coordinates exist}
                            {--failed-only : Only retry previously failed geocoding attempts}
                            {--dry-run : Show what would be geocoded without actually doing it}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Geocode MLS properties that are missing latitude/longitude coordinates using Google Maps or OpenStreetMap API';

    private GeocodingService $geocoder;

    /**
     * Execute the console command.
     */
    public function handle(GeocodingService $geocoder): int
    {
        $this->geocoder = $geocoder;

        $limit = (int) $this->option('limit');
        $force = $this->option('force');
        $failedOnly = $this->option('failed-only');
        $dryRun = $this->option('dry-run');

        $this->info('Starting MLS property geocoding...');
        $this->newLine();

        // Build the query for properties needing geocoding
        $query = MLSProperty::query();

        if ($failedOnly) {
            // Only get properties that previously failed geocoding
            $query->whereNotNull('geocode_attempted_at')
                  ->where(function($q) {
                      $q->whereNull('latitude')
                        ->orWhereNull('longitude')
                        ->orWhere('latitude', 0)
                        ->orWhere('longitude', 0);
                  });
            $this->info('Mode: Retrying failed geocoding attempts only');
        } elseif (!$force) {
            // Get properties without coordinates
            $query->where(function($q) {
                $q->whereNull('latitude')
                  ->orWhereNull('longitude')
                  ->orWhere('latitude', 0)
                  ->orWhere('longitude', 0);
            });
            $this->info('Mode: Geocoding properties without coordinates');
        } else {
            $this->info('Mode: Force re-geocoding all properties');
        }

        // Only get active properties
        $query->where('is_active', true);

        // Get total count before limiting
        $totalCount = $query->count();
        $this->info("Found {$totalCount} properties needing geocoding");

        if ($totalCount === 0) {
            $this->info('No properties need geocoding. Exiting.');
            return Command::SUCCESS;
        }

        // Apply limit
        $properties = $query->limit($limit)->get();
        $processCount = $properties->count();

        $this->info("Processing {$processCount} properties (limit: {$limit})");
        $this->newLine();

        if ($dryRun) {
            $this->warn('DRY RUN - No changes will be made');
            $this->newLine();

            $this->table(
                ['MLS ID', 'Address', 'City', 'Current Lat', 'Current Lng'],
                $properties->map(fn($p) => [
                    $p->mls_id,
                    substr($p->address ?? 'N/A', 0, 40),
                    $p->city ?? 'N/A',
                    $p->latitude ?? 'NULL',
                    $p->longitude ?? 'NULL'
                ])->toArray()
            );

            return Command::SUCCESS;
        }

        // Progress tracking
        $successful = 0;
        $failed = 0;
        $skipped = 0;

        $progressBar = $this->output->createProgressBar($processCount);
        $progressBar->start();

        foreach ($properties as $property) {
            try {
                $result = $this->geocodeProperty($property);

                if ($result === 'success') {
                    $successful++;
                } elseif ($result === 'failed') {
                    $failed++;
                } else {
                    $skipped++;
                }
            } catch (\Exception $e) {
                $failed++;
                Log::error('Geocoding error for MLS property', [
                    'mls_id' => $property->mls_id,
                    'error' => $e->getMessage()
                ]);
            }

            $progressBar->advance();

            // Rate limiting: sleep briefly between requests to respect API limits
            // Photon is lenient but we still want to be respectful
            usleep(200000); // 200ms delay between requests (5 requests/sec max)
        }

        $progressBar->finish();
        $this->newLine(2);

        // Summary
        $this->info('Geocoding completed!');
        $this->table(
            ['Status', 'Count'],
            [
                ['Successful', $successful],
                ['Failed', $failed],
                ['Skipped', $skipped],
                ['Total Processed', $processCount],
                ['Remaining', max(0, $totalCount - $processCount)]
            ]
        );

        // Log summary
        Log::info('MLS Geocoding completed', [
            'successful' => $successful,
            'failed' => $failed,
            'skipped' => $skipped,
            'total_processed' => $processCount,
            'remaining' => max(0, $totalCount - $processCount)
        ]);

        return Command::SUCCESS;
    }

    /**
     * Geocode a single property
     */
    private function geocodeProperty(MLSProperty $property): string
    {
        // Build the address string for geocoding
        $address = $this->buildAddressString($property);

        if (empty($address)) {
            Log::warning('Cannot geocode MLS property - no address data', [
                'mls_id' => $property->mls_id
            ]);
            return 'skipped';
        }

        // Attempt geocoding
        $coordinates = $this->geocoder->geocodeAddress($address);

        // Update the property with geocode attempt timestamp
        $property->geocode_attempted_at = now();

        if ($coordinates && isset($coordinates['lat']) && isset($coordinates['lng'])) {
            // Success - update coordinates
            $property->latitude = $coordinates['lat'];
            $property->longitude = $coordinates['lng'];
            $property->geocode_source = $coordinates['source'] ?? 'unknown';
            $property->save();

            Log::debug('Successfully geocoded MLS property', [
                'mls_id' => $property->mls_id,
                'address' => $address,
                'lat' => $coordinates['lat'],
                'lng' => $coordinates['lng'],
                'source' => $coordinates['source'] ?? 'unknown'
            ]);

            return 'success';
        } else {
            // Failed - save the attempt timestamp
            $property->save();

            Log::warning('Failed to geocode MLS property', [
                'mls_id' => $property->mls_id,
                'address' => $address
            ]);

            return 'failed';
        }
    }

    /**
     * Build address string from property data
     */
    private function buildAddressString(MLSProperty $property): string
    {
        // First try to use the full address from mls_data if available
        $mlsData = $property->mls_data ?? [];

        // Try UnparsedAddress from MLS data first (most complete)
        if (!empty($mlsData['UnparsedAddress'])) {
            return $mlsData['UnparsedAddress'];
        }

        // Build from property fields
        $parts = [];

        if (!empty($property->address)) {
            $parts[] = $property->address;
        }

        if (!empty($property->city)) {
            $parts[] = $property->city;
        }

        if (!empty($property->province)) {
            $parts[] = $property->province;
        }

        if (!empty($property->postal_code)) {
            $parts[] = $property->postal_code;
        }

        // Add country for better geocoding accuracy
        if (!empty($parts)) {
            $parts[] = 'Canada';
        }

        return implode(', ', $parts);
    }
}
