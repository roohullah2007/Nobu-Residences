<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SchoolController;

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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
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