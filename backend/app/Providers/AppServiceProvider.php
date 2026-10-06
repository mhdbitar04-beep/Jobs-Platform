<?php

namespace App\Providers;

use App\Models\JobPost;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Routes use {job}; the model is JobPost because Laravel's queue owns the "jobs" table.
        Route::model('job', JobPost::class);
    }
}
