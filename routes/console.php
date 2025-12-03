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
// MLS Property Sync Tasks
// ============================================================================

// Sync MLS listings every 4 hours (6 times per day)
Schedule::command('mls:sync --limit=2500')
    ->cron('0 2,6,10,14,18,22 * * *')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/mls-sync.log'))
    ->description('Full MLS sync every 4 hours');

// Incremental sync every 2 hours (for new/updated listings)
Schedule::command('mls:sync --incremental')
    ->cron('0 */2 * * *')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/mls-sync.log'))
    ->description('Incremental MLS sync every 2 hours');

// ============================================================================
// MLS Image Sync Tasks
// ============================================================================

// Sync images for properties without images every minute (for active processing)
Schedule::command('mls:sync-images --limit=100 --skip-existing --only-active')
    ->everyMinute()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/mls-images.log'))
    ->description('Sync images for MLS properties without images');

// Full image refresh once daily at 1 AM (update all active properties)
Schedule::command('mls:sync-images --limit=2500 --only-active')
    ->dailyAt('01:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/mls-images.log'))
    ->description('Daily full image refresh for active MLS properties');

// ============================================================================
// Geocoding Tasks
// ============================================================================

// Geocode MLS properties without coordinates every minute (for active processing)
Schedule::command('mls:geocode --limit=50')
    ->everyMinute()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/mls-geocode.log'))
    ->description('Geocode MLS properties without coordinates');

// Retry failed geocoding attempts once daily at 3 AM
Schedule::command('mls:geocode --limit=200 --failed-only')
    ->dailyAt('03:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/mls-geocode.log'))
    ->description('Retry failed geocoding attempts');
