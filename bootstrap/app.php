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
        // Refuse scrapers/AI crawlers/security scanners on every request
        // before any other work happens (global, runs first).
        $middleware->prepend(\App\Http\Middleware\BlockScrapers::class);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\AddressProtectionMiddleware::class,
        ]);

        // CSRF cookie renamed from the framework's "XSRF-TOKEN" (a stack
        // fingerprint on every response); validation itself is unchanged,
        // and the except-list below still applies (static on the parent).
        $middleware->web(replace: [
            \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class => \App\Http\Middleware\ValidateCsrfToken::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'agent' => \App\Http\Middleware\AgentMiddleware::class,
            'address.protect' => \App\Http\Middleware\AddressProtectionMiddleware::class,
            'not.main-domain' => \App\Http\Middleware\NotOnMainDomain::class,
        ]);

        // Exclude API routes from CSRF verification
        $middleware->validateCsrfTokens(except: [
            'api/property-search',
            'api/property-search-viewport',
            'api/save-search',
            'api/saved-searches',
            'api/buildings-search',
            'api/buildings-counts',
            'api/schools/*',
            'api/buildings/upload-image',
            'api/buildings/delete-image',
            'api/buildings/generate-ai-description',
            'api/map-coordinates'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
