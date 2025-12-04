<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\AddressProtectionMiddleware::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'agent' => \App\Http\Middleware\AgentMiddleware::class,
            'address.protect' => \App\Http\Middleware\AddressProtectionMiddleware::class,
        ]);

        // Exclude API routes from CSRF verification
        $middleware->validateCsrfTokens(except: [
            'api/property-search',
            'api/property-search-viewport',
            'api/save-search',
            'api/saved-searches',
            'api/buildings-search',
            'api/schools/*',
            'api/buildings/upload-image',
            'api/buildings/delete-image',
            'api/map-coordinates'
        ]);
    })
    ->withSchedule(function ($schedule): void {
        // INTELLIGENT BATCH ROTATION SYNC - 15,000+ Properties Per Day
        // Uses offset tracking to sync DIFFERENT properties each run
        // Automatically switches to "new listings only" after initial load completes

        // Batch #1 - 2:00 AM (Properties 0-2499)
        $schedule->command('mls:sync --limit=2500')
            ->dailyAt('02:00')
            ->timezone('America/Toronto')
            ->withoutOverlapping()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/mls-sync-full.log'));

        // Batch #2 - 6:00 AM (Properties 2500-4999)
        $schedule->command('mls:sync --limit=2500')
            ->dailyAt('06:00')
            ->timezone('America/Toronto')
            ->withoutOverlapping()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/mls-sync-full.log'));

        // Batch #3 - 10:00 AM (Properties 5000-7499)
        $schedule->command('mls:sync --limit=2500')
            ->dailyAt('10:00')
            ->timezone('America/Toronto')
            ->withoutOverlapping()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/mls-sync-full.log'));

        // Batch #4 - 2:00 PM (Properties 7500-9999)
        $schedule->command('mls:sync --limit=2500')
            ->dailyAt('14:00')
            ->timezone('America/Toronto')
            ->withoutOverlapping()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/mls-sync-full.log'));

        // Batch #5 - 6:00 PM (Properties 10000-12499)
        $schedule->command('mls:sync --limit=2500')
            ->dailyAt('18:00')
            ->timezone('America/Toronto')
            ->withoutOverlapping()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/mls-sync-full.log'));

        // Batch #6 - 10:00 PM (Properties 12500-14999)
        $schedule->command('mls:sync --limit=2500')
            ->dailyAt('22:00')
            ->timezone('America/Toronto')
            ->withoutOverlapping()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/mls-sync-full.log'));

        // Incremental sync every 2 hours (NEW listings & UPDATED properties only)
        // After initial 15K load completes, this becomes the primary sync method
        $schedule->command('mls:sync --incremental')
            ->everyTwoHours()
            ->timezone('America/Toronto')
            ->withoutOverlapping()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/mls-sync-incremental.log'));

        // IMAGE SYNC - Separate cron to update images for existing properties
        // Runs daily at 1:00 AM to refresh image URLs
        $schedule->command('mls:sync-images --limit=2500 --skip-existing')
            ->dailyAt('01:00')
            ->timezone('America/Toronto')
            ->withoutOverlapping()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/mls-sync-images.log'));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
