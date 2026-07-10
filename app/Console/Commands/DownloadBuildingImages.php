<?php

namespace App\Console\Commands;

use App\Models\Building;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Download CSV-imported building images to local storage.
 *
 * The CSV importer parks remote image URLs in buildings.pending_image_urls
 * instead of hotlinking them. This command (scheduled every five minutes in
 * routes/console.php — no queue worker needed) takes a small batch of
 * buildings, downloads each pending URL over HTTP with timeout / image / size
 * validation, and stores the files exactly the way the admin's manual upload
 * does (public/images/buildings, building_{id}_{time}_{uniqid}.{ext}), so the
 * frontend renders them identically to manually-uploaded images.
 *
 * On success the first stored image becomes main_image (unless one is already
 * set) and all stored paths are appended to the images array; the pending
 * state is cleared. Failed URLs stay pending and the per-building attempt
 * counter increments — after MAX_ATTEMPTS the building is logged and given
 * up on so the batch never loops forever. A single bad building can never
 * crash the whole run.
 */
class DownloadBuildingImages extends Command
{
    protected $signature = 'buildings:download-images
        {--limit=20 : Maximum number of buildings to process in this run}
        {--id= : Process a single building by ID}';

    protected $description = 'Download pending building image URLs (from CSV imports) to local storage and promote them to main_image/images';

    /** Give up on a building after this many failed runs. */
    private const MAX_ATTEMPTS = 3;

    /** Per-image download cap — anything bigger is not a building photo. */
    private const MAX_BYTES = 10 * 1024 * 1024;

    /** Per-request HTTP timeout in seconds. */
    private const TIMEOUT_SECONDS = 20;

    public function handle(): int
    {
        $query = Building::query()
            ->whereNotNull('pending_image_urls')
            ->where('image_download_attempts', '<', self::MAX_ATTEMPTS)
            ->orderBy('updated_at');

        if ($id = $this->option('id')) {
            $query->whereKey($id);
        }

        $buildings = $query->limit(max(1, (int) $this->option('limit')))->get();

        if ($buildings->isEmpty()) {
            $this->info('No buildings with pending image downloads.');
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
                Log::warning('Building image download failed', [
                    'building_id' => $building->id,
                    'error' => $e->getMessage(),
                ]);
                $this->error("[FAIL] {$building->name}: {$e->getMessage()}");
            }
        }

        $this->info("Done. {$done} building(s) completed, {$retrying} left for retry.");
        return self::SUCCESS;
    }

    /**
     * Download every pending URL for one building. Returns true when the
     * building has no pending URLs left (all done or given up).
     */
    private function processBuilding(Building $building): bool
    {
        $urls = array_values(array_filter((array) $building->pending_image_urls, 'is_string'));
        if (empty($urls)) {
            $building->forceFill(['pending_image_urls' => null, 'image_download_attempts' => 0])->saveQuietly();
            return true;
        }

        $stored = [];
        $failedUrls = [];
        foreach ($urls as $url) {
            $path = $this->downloadImage($building, $url);
            if ($path !== null) {
                $stored[] = $path;
            } else {
                $failedUrls[] = $url;
            }
        }

        $updates = [];
        if (!empty($stored)) {
            $existing = is_array($building->images) ? $building->images : [];
            $updates['images'] = array_values(array_unique(array_merge($existing, $stored)));
            if (empty($building->main_image)) {
                $updates['main_image'] = $stored[0];
            }
        }

        if (empty($failedUrls)) {
            // Everything landed — clear the pending state.
            $updates['pending_image_urls'] = null;
            $updates['image_download_attempts'] = 0;
            $building->forceFill($updates)->saveQuietly();
            $this->line(sprintf('[OK]    %s — %d image(s) stored', $building->name, count($stored)));
            return true;
        }

        // Keep only the failed URLs pending and count the attempt.
        $attempts = (int) $building->image_download_attempts + 1;
        if ($attempts >= self::MAX_ATTEMPTS) {
            // Give up: log loudly and clear the pending state so the batch
            // query never picks this building up again.
            $updates['pending_image_urls'] = null;
            $updates['image_download_attempts'] = $attempts;
            Log::warning('Building image download abandoned after max attempts', [
                'building_id' => $building->id,
                'building_name' => $building->name,
                'failed_urls' => $failedUrls,
                'attempts' => $attempts,
            ]);
            $this->warn(sprintf('[GIVEUP] %s — %d URL(s) failed %d times', $building->name, count($failedUrls), $attempts));
            $building->forceFill($updates)->saveQuietly();
            return true;
        }

        $updates['pending_image_urls'] = array_values($failedUrls);
        $updates['image_download_attempts'] = $attempts;
        $building->forceFill($updates)->saveQuietly();
        $this->warn(sprintf('[RETRY] %s — %d stored, %d failed (attempt %d/%d)', $building->name, count($stored), count($failedUrls), $attempts, self::MAX_ATTEMPTS));
        return false;
    }

    /**
     * Download one image URL. Returns the stored web path
     * ("/images/buildings/…") or null when the download/validation fails.
     *
     * Storage matches Api\BuildingController::uploadImage exactly:
     * public/images/buildings + building_{id}_{time}_{uniqid}.{ext}, so the
     * frontend serves these files identically to manual admin uploads.
     */
    private function downloadImage(Building $building, string $url): ?string
    {
        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)
                ->withHeaders(['Accept' => 'image/*'])
                ->get($url);

            if (!$response->successful()) {
                Log::info('Building image URL returned non-2xx', ['url' => $url, 'status' => $response->status()]);
                return null;
            }

            $body = $response->body();
            if ($body === '' || strlen($body) > self::MAX_BYTES) {
                Log::info('Building image rejected by size check', ['url' => $url, 'bytes' => strlen($body)]);
                return null;
            }

            // Validate the actual bytes are an image we serve — the remote
            // content-type header alone is not trusted.
            $info = @getimagesizefromstring($body);
            $extension = match ($info['mime'] ?? null) {
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
                default => null,
            };
            if ($extension === null) {
                Log::info('Building image rejected: not a supported image', [
                    'url' => $url,
                    'content_type' => $response->header('Content-Type'),
                ]);
                return null;
            }

            $directory = public_path('images/buildings');
            if (!is_dir($directory)) {
                mkdir($directory, 0777, true);
            }

            $name = 'building_' . $building->id . '_' . time() . '_' . uniqid() . '.' . $extension;
            if (file_put_contents($directory . DIRECTORY_SEPARATOR . $name, $body) === false) {
                Log::warning('Building image could not be written to disk', ['url' => $url, 'file' => $name]);
                return null;
            }

            return '/images/buildings/' . $name;
        } catch (\Throwable $e) {
            Log::info('Building image download error', ['url' => $url, 'error' => $e->getMessage()]);
            return null;
        }
    }

    private function bumpAttempts(Building $building): void
    {
        try {
            $building->forceFill([
                'image_download_attempts' => (int) $building->image_download_attempts + 1,
            ])->saveQuietly();
        } catch (\Throwable) {
            // Counting is best-effort; never rethrow from the error path.
        }
    }
}
