<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
|
| Here you can define all of your scheduled tasks. Laravel will evaluate
| these tasks and run them at the appropriate times.
|
*/

// ============================================================================
// Queue worker fallback
// ============================================================================
//
// The whole schedule below (and the queued jobs: CSV building imports, price
// range refreshes, SSL requests) only needs ONE server cron entry:
//
//   * * * * * cd /home/ploi/<site> && php artisan schedule:run >> /dev/null 2>&1
//
// (On Ploi: server → Scheduler, or it is added automatically for Laravel
// sites. A dedicated queue worker/daemon is better when available — this
// fallback drains the database queue once a minute either way, and running
// both is safe because jobs are reserved atomically.)
Schedule::command('queue:work --stop-when-empty --max-time=50 --tries=3')
    ->everyMinute()
    ->withoutOverlapping()
    ->description('Drain the database queue when no dedicated worker is running');

// ============================================================================
// Building MLS stats
// ============================================================================

// Keep price_range / sqft_range / maintenance_fee_range fresh from live MLS
// listings instead of only refreshing on manual saves.
Schedule::command('buildings:refresh-mls-stats')
    ->dailyAt('05:30')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/buildings-mls-stats.log'))
    ->description('Refresh building price/sqft/maintenance ranges from MLS');

// CSV imports park remote image URLs in buildings.pending_image_urls instead
// of hotlinking them. This drains that queue in small batches (20 buildings
// per run) — downloads each image to public/images/buildings and promotes the
// stored paths to main_image/images. Runs off the same schedule:run cron as
// everything else; no queue worker required.
Schedule::command('buildings:download-images --limit=20')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/building-image-downloads.log'))
    ->description('Download pending CSV-imported building images to local storage');

// Buildings carry a marketing website_url but usually no logo. This scrapes
// each building's logo from that site (header/nav <img>, schema.org logo,
// apple-touch-icon…), stores it in public/images/buildings, and reads the
// site color theme from it — so a building picked in Website Create shows its
// brand colors instantly. Small batches (20/run), same schedule:run cron; a
// building whose site has no findable logo is given up on after 3 attempts
// (logo_scrape_attempts).
Schedule::command('buildings:scrape-logos --limit=20')
    ->everyTenMinutes()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/building-logo-scrape.log'))
    ->description('Scrape building logos from marketing sites and detect the color theme');

// The import sheets carry no postal code column, so imported buildings land
// with postal_code = NULL. This drains that backlog in batches of 50 via the
// Google Geocoding API — postal code always, latitude/longitude only when the
// building has none. A building that fails 3 runs is given up on
// (geocode_attempts) so dead addresses are never re-queried forever.
Schedule::command('buildings:geocode --limit=50')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/building-geocode.log'))
    ->description('Fill missing building postal codes/coordinates via Google Geocoding');

// ============================================================================
// Saved Search Alerts
// ============================================================================

// Send saved search alerts daily at 8 AM
// This checks all saved searches with email_alerts enabled and sends
// notifications for those with new matching listings based on their frequency
Schedule::command('alerts:send-saved-search')
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/saved-search-alerts.log'))
    ->description('Send daily saved search email alerts');

// Additional alert check at 6 PM for users who want fresher alerts
Schedule::command('alerts:send-saved-search')
    ->dailyAt('18:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/saved-search-alerts.log'))
    ->description('Send evening saved search email alerts');

// ============================================================================
// Cloudflare custom hostnames
// ============================================================================

// Long-tail activation: the SyncCustomHostnameStatusJob polls for ~30 minutes
// after a domain is saved; this sweep catches customers who create their
// CNAME record later. Once Cloudflare reports hostname + SSL active, the
// website flips to live automatically — no manual retry ever needed.
Schedule::command('cloudflare:sync-hostnames')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/cloudflare-sync.log'))
    ->description('Activate pending custom hostnames once their CNAME + SSL go live');

// Weekly health report (read-only): hostname exists, SSL active, ownership.
Schedule::command('cloudflare:health')
    ->weeklyOn(1, '06:00')
    ->appendOutputTo(storage_path('logs/cloudflare-health.log'))
    ->description('Audit custom domains against Cloudflare');
