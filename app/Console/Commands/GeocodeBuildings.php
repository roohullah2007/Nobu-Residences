<?php

namespace App\Console\Commands;

use App\Models\Building;
use App\Services\GeocodingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Fill missing postal codes (and coordinates) for buildings via the Google
 * Geocoding API.
 *
 * The CSV import sheets carry no postal code column, so imported buildings
 * land with postal_code = NULL. This command (scheduled every five minutes in
 * routes/console.php — same pattern as buildings:download-images, no queue
 * worker needed) takes a small batch of such buildings, geocodes
 * "street, city, province, Canada" and stores the returned postal code. When
 * the building also has no coordinates yet, the geocoder's latitude/longitude
 * are stored too — existing coordinates are never overwritten.
 *
 * Failures (API error, no result, result without a postal code) increment the
 * per-building geocode_attempts counter; after MAX_ATTEMPTS the building is
 * logged and skipped by the batch query forever, so an unresolvable address
 * can never loop. A single bad building never crashes the run.
 */
class GeocodeBuildings extends Command
{
    protected $signature = 'buildings:geocode
        {--limit=50 : Maximum number of buildings to process in this run}
        {--id= : Process a single building by ID}';

    protected $description = 'Fill missing building postal codes (and empty coordinates) via the Google Geocoding API';

    /** Give up on a building after this many failed runs. */
    private const MAX_ATTEMPTS = 3;

    public function __construct(private readonly GeocodingService $geocoder)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        if (empty(config('repliers.google_maps_api_key') ?: config('maps.google-maps.api_key') ?: env('GOOGLE_MAPS_API_KEY'))) {
            $this->warn('GOOGLE_MAPS_API_KEY is not configured — skipping geocoding run.');
            return self::SUCCESS;
        }

        $query = Building::query()
            ->whereNull('postal_code')
            ->whereNotNull('address')
            ->where('geocode_attempts', '<', self::MAX_ATTEMPTS)
            ->orderBy('updated_at');

        if ($id = $this->option('id')) {
            $query->whereKey($id);
        }

        $buildings = $query->limit(max(1, (int) $this->option('limit')))->get();

        if ($buildings->isEmpty()) {
            $this->info('No buildings need geocoding.');
            return self::SUCCESS;
        }

        $done = 0;
        $retrying = 0;
        foreach ($buildings as $building) {
            try {
                $this->processBuilding($building) ? $done++ : $retrying++;
            } catch (\Throwable $e) {
                // Never let one building kill the batch.
                $retrying++;
                $this->bumpAttempts($building);
                Log::warning('Building geocoding failed', [
                    'building_id' => $building->id,
                    'error' => $e->getMessage(),
                ]);
                $this->error("[FAIL] {$building->name}: {$e->getMessage()}");
            }
        }

        $this->info("Done. {$done} building(s) geocoded, {$retrying} left for retry.");
        return self::SUCCESS;
    }

    /**
     * Geocode one building. Returns true when the postal code was stored,
     * false when the building stays queued for another attempt.
     */
    private function processBuilding(Building $building): bool
    {
        $result = $this->geocoder->geocodeAddressDetails($this->geocodeQuery($building));

        if ($result === null || empty($result['postal_code'])) {
            $attempts = (int) $building->geocode_attempts + 1;
            $building->forceFill(['geocode_attempts' => $attempts])->saveQuietly();
            if ($attempts >= self::MAX_ATTEMPTS) {
                Log::warning('Building geocoding abandoned after max attempts', [
                    'building_id' => $building->id,
                    'building_name' => $building->name,
                    'address' => $building->address,
                    'attempts' => $attempts,
                ]);
                $this->warn(sprintf('[GIVEUP] %s — no postal code after %d attempts', $building->name, $attempts));
            } else {
                $this->warn(sprintf('[RETRY] %s — no postal code (attempt %d/%d)', $building->name, $attempts, self::MAX_ATTEMPTS));
            }
            return false;
        }

        $updates = [
            'postal_code' => $result['postal_code'],
            'geocode_attempts' => 0,
        ];
        // Fill coordinates only when the building has none — never overwrite
        // values that came from the CSV or were set manually.
        if (empty($building->latitude) && empty($building->longitude)) {
            $updates['latitude'] = $result['lat'];
            $updates['longitude'] = $result['lng'];
        }

        $building->forceFill($updates)->saveQuietly();
        $this->line(sprintf(
            '[OK]    %s — %s%s',
            $building->name,
            $result['postal_code'],
            isset($updates['latitude']) ? sprintf(' (%.6f, %.6f)', $updates['latitude'], $updates['longitude']) : ''
        ));
        return true;
    }

    /**
     * Build the address string to geocode: "street, city, province, Canada".
     *
     * street_address_1 (the first expanded address) is preferred over the
     * combined address — "229 Sutherland St S" geocodes far better than
     * "229 Sutherland St S & 255 Warden St, Clearview". City/province/country
     * are appended only when not already present.
     */
    private function geocodeQuery(Building $building): string
    {
        $query = trim((string) ($building->street_address_1 ?: $building->address));

        foreach ([$building->city, $building->province ?: 'ON', 'Canada'] as $part) {
            $part = trim((string) $part);
            if ($part !== '' && stripos($query, $part) === false) {
                $query .= ', ' . $part;
            }
        }

        return $query;
    }

    private function bumpAttempts(Building $building): void
    {
        try {
            $building->forceFill([
                'geocode_attempts' => (int) $building->geocode_attempts + 1,
            ])->saveQuietly();
        } catch (\Throwable) {
            // Counting is best-effort; never rethrow from the error path.
        }
    }
}
