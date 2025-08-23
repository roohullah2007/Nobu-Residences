<?php

namespace App\Providers;

use App\Services\AmpreApiService;
use App\Services\MLSIntegrationService;
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
    }
}
