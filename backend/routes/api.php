<?php

use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Company;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SavedJobController;
use Illuminate\Support\Facades\Route;

// Public
Route::middleware('throttle:10,1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
});

Route::get('stats', [JobController::class, 'stats']);
Route::get('categories', [JobController::class, 'categories']);
Route::get('jobs', [JobController::class, 'index']);
Route::get('jobs/{job}', [JobController::class, 'show'])->whereNumber('job');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    Route::put('profile', [ProfileController::class, 'update']);
    Route::post('profile/resume', [ProfileController::class, 'resume']);
    Route::put('profile/password', [ProfileController::class, 'password']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/read-all', [NotificationController::class, 'readAll']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'read']);

    // Applicant, owning company and admins; the policy decides.
    Route::get('applications/{application}/resume', [ApplicationController::class, 'resume']);

    // Job seekers
    Route::middleware('role:seeker')->group(function () {
        Route::post('jobs/{job}/apply', [ApplicationController::class, 'store']);
        Route::post('jobs/{job}/save', [SavedJobController::class, 'toggle']);
        Route::get('my/applications', [ApplicationController::class, 'index']);
        Route::delete('my/applications/{application}', [ApplicationController::class, 'destroy']);
        Route::get('my/saved-jobs', [SavedJobController::class, 'index']);
    });

    // Companies
    Route::middleware('role:company')->prefix('company')->group(function () {
        Route::get('dashboard', Company\DashboardController::class);
        Route::apiResource('jobs', Company\JobController::class);
        Route::get('jobs/{job}/applications', [Company\ApplicationController::class, 'forJob']);
        Route::get('applications', [Company\ApplicationController::class, 'index']);
        Route::patch('applications/{application}', [Company\ApplicationController::class, 'update']);
    });

    // Admins
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('stats', Admin\StatsController::class);
        Route::get('users', [Admin\UserController::class, 'index']);
        Route::patch('users/{user}', [Admin\UserController::class, 'update']);
        Route::delete('users/{user}', [Admin\UserController::class, 'destroy']);
        Route::get('jobs', [Admin\JobController::class, 'index']);
        Route::patch('jobs/{job}', [Admin\JobController::class, 'update']);
        Route::delete('jobs/{job}', [Admin\JobController::class, 'destroy']);
        Route::post('categories', [Admin\CategoryController::class, 'store']);
        Route::put('categories/{category}', [Admin\CategoryController::class, 'update']);
        Route::delete('categories/{category}', [Admin\CategoryController::class, 'destroy']);
    });
});
