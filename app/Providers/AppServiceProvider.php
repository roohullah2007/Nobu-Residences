<?php

namespace App\Providers;

use App\Services\RepliersApiService;
use App\Models\Setting;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(RepliersApiService::class, function ($app) {
            return new RepliersApiService();
        });

        // One resolver instance per request: memoizes host->website so the
        // middleware, controllers, and auth flows all agree on the current
        // website without re-querying. `scoped` (not `singleton`) so the memo
        // resets per request under Octane-style long-running workers too.
        $this->app->scoped(\App\Services\Tenancy\TenantResolver::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Share Google Maps API key with all views. API keys live in .env
        // only (read via config so they survive config caching) — the admin
        // panel no longer stores them.
        View::composer('*', function ($view) {
            $view->with('googleMapsApiKey', (string) config('repliers.google_maps_browser_key', ''));

            // Global tracking pixel (e.g. Follow Up Boss): admin-managed raw
            // snippet (Admin > Settings) rendered in the <head> of EVERY
            // public site, alongside each website's own tracking_scripts.
            $view->with('globalTrackingScripts', Setting::get('global_tracking_scripts', ''));
        });

        // Resend mail (RESEND_API_KEY in .env, read via config so it survives
        // config caching): register a lightweight HTTP transport (no composer
        // package needed) and, when a key is present, make Resend the default
        // mail path for alert/system emails.
        \Illuminate\Support\Facades\Mail::extend('resend', function () {
            return new \App\Mail\Transport\ResendTransport(
                (string) config('services.resend.key', '')
            );
        });
        if (!empty(config('services.resend.key'))) {
            config(['mail.default' => 'resend']);
        }
    }
}
