<?php

namespace App\Console\Commands;

use App\Models\Building;
use App\Services\LogoScraperService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Scrape building brand logos from their marketing websites and detect the
 * site color theme from each logo.
 *
 * Mirrors buildings:download-images: it runs off the same schedule:run cron
 * (no queue worker needed), takes a small batch of buildings that have a
 * website_url but no logo yet, and for each one asks LogoScraperService to
 * find the logo on the marketing site, download it to public/images/buildings
 * and read its palette. On success the building's `logo` and `brand_colors`
 * are filled — picking that building in Website Create then shows its theme
 * instantly.
 *
 * A building that fails is retried; after MAX_ATTEMPTS runs it is left alone
 * (logo_scrape_attempts) so a logo-less / dead site never loops forever. One
 * bad building can never crash the batch.
 */
class ScrapeBuildingLogos extends Command
{
    protected $signature = 'buildings:scrape-logos
        {--limit=20 : Maximum number of buildings to process in this run}
        {--id= : Process a single building by ID (ignores the has-logo / attempts filters)}
        {--force : Re-scrape even buildings that already have a logo}';

    protected $description = 'Scrape building logos from their marketing websites and detect the site color theme';

    /** Give up on a building after this many failed runs. */
    private const MAX_ATTEMPTS = 3;

    public function handle(LogoScraperService $scraper): int
    {
        $query = Building::query()
            ->whereNotNull('website_url')
            ->where('website_url', '!=', '')
            ->orderBy('updated_at');

        if ($id = $this->option('id')) {
            $query->whereKey($id);
        } else {
            if (!$this->option('force')) {
                $query->whereNull('logo');
            }
            $query->where('logo_scrape_attempts', '<', self::MAX_ATTEMPTS);
        }

        $buildings = $query->limit(max(1, (int) $this->option('limit')))->get();

        if ($buildings->isEmpty()) {
            $this->info('No buildings pending a logo scrape.');
            return self::SUCCESS;
        }

        $done = 0;
        $failed = 0;
        foreach ($buildings as $building) {
            try {
                $this->processBuilding($scraper, $building) ? $done++ : $failed++;
            } catch (\Throwable $e) {
                // Never let one building kill the batch.
                $failed++;
                $this->bumpAttempts($building);
                Log::warning('Building logo scrape failed', [
                    'building_id' => $building->id,
                    'error' => $e->getMessage(),
                ]);
                $this->error("[FAIL] {$building->name}: {$e->getMessage()}");
            }
        }

        $this->info("Done. {$done} logo(s) scraped, {$failed} left for retry.");
        return self::SUCCESS;
    }

    /**
     * Scrape one building. Returns true when a logo was stored.
     */
    private function processBuilding(LogoScraperService $scraper, Building $building): bool
    {
        $result = $scraper->scrapeForBuilding($building);

        if ($result === null || empty($result['logo'])) {
            $attempts = (int) $building->logo_scrape_attempts + 1;
            $building->forceFill(['logo_scrape_attempts' => $attempts])->saveQuietly();
            if ($attempts >= self::MAX_ATTEMPTS) {
                Log::info('Building logo scrape abandoned after max attempts', [
                    'building_id' => $building->id,
                    'building_name' => $building->name,
                    'website_url' => $building->website_url,
                ]);
                $this->warn(sprintf('[GIVEUP] %s — no logo found on %s (attempt %d/%d)', $building->name, $building->website_url, $attempts, self::MAX_ATTEMPTS));
            } else {
                $this->warn(sprintf('[RETRY]  %s — no logo found (attempt %d/%d)', $building->name, $attempts, self::MAX_ATTEMPTS));
            }
            return false;
        }

        $updates = [
            'logo' => $result['logo'],
            'logo_scrape_attempts' => 0,
        ];
        if (!empty($result['brand_colors'])) {
            $updates['brand_colors'] = $result['brand_colors'];
        }
        $building->forceFill($updates)->saveQuietly();

        $colorNote = !empty($result['brand_colors'])
            ? 'colors detected'
            : 'logo stored (colors detected in-browser)';
        $this->line(sprintf('[OK]     %s — %s', $building->name, $colorNote));
        return true;
    }

    private function bumpAttempts(Building $building): void
    {
        try {
            $building->forceFill([
                'logo_scrape_attempts' => (int) $building->logo_scrape_attempts + 1,
            ])->saveQuietly();
        } catch (\Throwable) {
            // Counting is best-effort; never rethrow from the error path.
        }
    }
}
