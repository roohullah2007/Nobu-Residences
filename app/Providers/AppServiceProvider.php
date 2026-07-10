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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Share Google Maps API key with all views
        View::composer('*', function ($view) {
            // Try to get from database first, then fallback to config, then env
            $googleMapsApiKey = Setting::get('google_maps_api_key')
                ?: config('repliers.google_maps_api_key')
                ?: config('maps.google-maps.api_key')
                ?: env('GOOGLE_MAPS_API_KEY', '');

            $view->with('googleMapsApiKey', $googleMapsApiKey);

            // Global tracking pixel (e.g. Follow Up Boss): admin-managed raw
            // snippet rendered in the <head> of EVERY public site, alongside
            // each website's own tracking_scripts.
            $view->with('globalTrackingScripts', Setting::get('global_tracking_scripts', ''));
        });

        // Resend mail: the admin can paste the API key on the ApiKeys page
        // (settings table) instead of .env. Register a lightweight HTTP
        // transport (no composer package needed) and, when a key is present,
        // make Resend the default mail path for alert/system emails.
        \Illuminate\Support\Facades\Mail::extend('resend', function () {
            return new \App\Mail\Transport\ResendTransport(
                (string) (Setting::get('resend_api_key') ?: env('RESEND_API_KEY', ''))
            );
        });
        try {
            $resendKey = Setting::get('resend_api_key') ?: env('RESEND_API_KEY');
            if (!empty($resendKey)) {
                config([
                    'services.resend.key' => $resendKey,
                    'mail.default' => 'resend',
                ]);
            }
        } catch (\Throwable $e) {
            // Settings table may not exist yet (fresh install / mid-migration).
        }
    }
}
