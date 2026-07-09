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
