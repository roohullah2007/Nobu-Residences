<?php

namespace App\Providers;

use App\Services\RepliersApiService;
use Illuminate\Support\ServiceProvider;

class RepliersServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(RepliersApiService::class, function ($app) {
            return new RepliersApiService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
