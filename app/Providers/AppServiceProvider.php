<?php

namespace App\Providers;

use App\Services\AmpreApiService;
use App\Services\MLSIntegrationService;
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
        $this->app->singleton(AmpreApiService::class, function ($app) {
            return new AmpreApiService();
        });

        $this->app->singleton(MLSIntegrationService::class, function ($app) {
            return new MLSIntegrationService($app->make(AmpreApiService::class));
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
                ?: config('ampre.google_maps_api_key')
                ?: config('maps.google-maps.api_key')
                ?: env('GOOGLE_MAPS_API_KEY', '');

            $view->with('googleMapsApiKey', $googleMapsApiKey);
        });
    }
}
