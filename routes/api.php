<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\Api\PropertyImageController;
use App\Http\Controllers\Api\PropertyDetailController;
use App\Http\Controllers\Api\BuildingController;
use App\Http\Controllers\FavouritesController;
use App\Http\Controllers\PropertySearchController;
use App\Http\Controllers\SavedSearchController;
use App\Http\Controllers\Api\TourRequestController;
use App\Http\Controllers\Api\AgentInfoController;
use App\Http\Controllers\Api\PropertyAiController;
use App\Http\Controllers\Api\AlertHistoryController;
use App\Http\Controllers\ContactController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Contact Form API Route (no CSRF required)
Route::post('/contact', [ContactController::class, 'store'])->name('api.contact.store');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Debug route for checking leased property statuses
Route::get('/debug/leased-statuses', [PropertySearchController::class, 'debugLeasedStatuses']);

// Favourites API Routes
Route::prefix('favourites')->group(function () {
    Route::post('/properties/check', [FavouritesController::class, 'checkProperty']);
    Route::post('/properties/toggle', [FavouritesController::class, 'toggleProperty']);
    Route::get('/properties', [FavouritesController::class, 'getProperties']);
    Route::get('/properties/with-data', [FavouritesController::class, 'getPropertiesWithData']);
    Route::delete('/properties', [FavouritesController::class, 'removeProperty']);
});

// Saved Searches API Routes
Route::prefix('saved-searches')->group(function () {
    Route::get('/', [SavedSearchController::class, 'index']);
    Route::post('/', [SavedSearchController::class, 'store']);
    Route::delete('/{id}', [SavedSearchController::class, 'destroy']);
    Route::get('/{id}/run', [SavedSearchController::class, 'run']);
});

// Alert History API Routes
Route::prefix('alerts')->group(function () {
    Route::get('/', [AlertHistoryController::class, 'index']);
    Route::get('/{id}', [AlertHistoryController::class, 'show']);
});

// Property Image API Routes with Enhanced Error Handling
Route::prefix('property-images')->group(function () {
    Route::post('/', [PropertyImageController::class, 'getPropertyImages']);
    Route::get('/single', [PropertyImageController::class, 'getPropertyImage']);
});

// Property Detail API Routes
Route::prefix('properties')->group(function () {
    Route::get('/nearby-listings', [PropertyDetailController::class, 'getNearbyListings']);
    Route::get('/similar-listings', [PropertyDetailController::class, 'getSimilarListings']);
});

// Alternative routes for compatibility
Route::post('/property-images', [PropertyImageController::class, 'getPropertyImages']);
Route::get('/nearby-listings', [PropertyDetailController::class, 'getNearbyListings']);
Route::get('/similar-listings', [PropertyDetailController::class, 'getSimilarListings']);

// Building API Routes
Route::prefix('buildings')->group(function () {
    Route::get('/find-by-address', [BuildingController::class, 'findByAddress']);
    Route::get('/count-mls-listings', [BuildingController::class, 'countMLSListings']);
    Route::get('/featured', [BuildingController::class, 'featured']);
    Route::get('/types', [BuildingController::class, 'buildingTypes']);
    Route::get('/cities', [BuildingController::class, 'cities']);
    Route::get('/search', [BuildingController::class, 'search']);
    Route::post('/upload-image', [BuildingController::class, 'uploadImage']);
    Route::post('/delete-image', [BuildingController::class, 'deleteImage']);
    Route::get('/', [BuildingController::class, 'index']);
    Route::get('/{id}', [BuildingController::class, 'show']);
});

// School API Routes
Route::prefix('schools')->group(function () {
    Route::get('/nearby', [SchoolController::class, 'getNearbySchools']);
    Route::get('/debug-distances', [SchoolController::class, 'debugDistances']);
    Route::get('/featured', [SchoolController::class, 'featured']);
    Route::get('/types', [SchoolController::class, 'schoolTypes']);
    Route::get('/grade-levels', [SchoolController::class, 'gradeLevels']);
    Route::get('/cities', [SchoolController::class, 'cities']);
    Route::get('/{slug}', [SchoolController::class, 'showBySlug']);
    Route::get('/', [SchoolController::class, 'index']);
    Route::post('/{id}/geocode', [SchoolController::class, 'geocodeSchool']);
    Route::post('/batch-geocode', [SchoolController::class, 'batchGeocodeSchools']);
});

// Tour Request API Routes
Route::prefix('tour-requests')->group(function () {
    Route::post('/', [TourRequestController::class, 'store']);
    Route::get('/', [TourRequestController::class, 'index']);
    Route::put('/{id}/status', [TourRequestController::class, 'updateStatus']);
});

// Agent Info API Routes
Route::prefix('agent-info')->group(function () {
    Route::get('/', [AgentInfoController::class, 'getAgentInfo']);
    Route::get('/website/{websiteId}', [AgentInfoController::class, 'getAgentInfoByWebsite']);
});

// Property Questions API Routes
Route::prefix('property-questions')->group(function () {
    Route::post('/', [\App\Http\Controllers\Api\PropertyQuestionController::class, 'store']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\PropertyQuestionController::class, 'index']);
        Route::put('/{id}/status', [\App\Http\Controllers\Api\PropertyQuestionController::class, 'updateStatus']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\PropertyQuestionController::class, 'destroy']);
    });
});

// Property AI API Routes
Route::prefix('property-ai')->group(function () {
    Route::post('/generate-description', [PropertyAiController::class, 'generateDescription']);
    Route::post('/generate-faqs', [PropertyAiController::class, 'generateFaqs']);
    Route::get('/content', [PropertyAiController::class, 'getAllContent']);
    Route::delete('/content', [PropertyAiController::class, 'deleteContent']);
    Route::post('/bulk-generate', [PropertyAiController::class, 'bulkGenerate']);
});
