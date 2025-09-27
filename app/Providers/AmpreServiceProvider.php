<?php

namespace App\Providers;

use App\Services\AmpreApiService;
use Illuminate\Support\ServiceProvider;

class AmpreServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(AmpreApiService::class, function ($app) {
            return new AmpreApiService();
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