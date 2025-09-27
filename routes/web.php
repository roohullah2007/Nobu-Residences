<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\EnhancedPropertyImagesController;
use App\Http\Controllers\AmpreTestController;
use App\Http\Controllers\WebsiteController;
use App\Http\Controllers\PropertyEnquiryController;

use App\Http\Controllers\Admin\AdminController;

use App\Http\Controllers\Admin\RealEstateController;
use App\Http\Controllers\Admin\WebsiteManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Website routes using WebsiteController
Route::get('/', [WebsiteController::class, 'home']);

// Public routes for the real estate website
Route::get('/rent', [WebsiteController::class, 'rent'])->name('rent');
Route::get('/sale', [WebsiteController::class, 'sale'])->name('sale');
Route::get('/search', [WebsiteController::class, 'search'])->name('search');

// SEO-friendly building-based search routes (e.g., /15-Mercer/for-sale)
Route::get('/{building}/for-sale', [WebsiteController::class, 'buildingForSale'])
    ->where('building', '\d+-[A-Za-z\-]+')
    ->name('building-for-sale');
Route::get('/{building}/for-rent', [WebsiteController::class, 'buildingForRent'])
    ->where('building', '\d+-[A-Za-z\-]+')
    ->name('building-for-rent');

// SEO-friendly city-based search routes
Route::get('/{city}/for-sale', [WebsiteController::class, 'cityForSale'])
    ->where('city', '(?!admin|api|login|register|dashboard|profile|user)[a-z][a-z\-]*')
    ->name('city-for-sale');
Route::get('/{city}/for-rent', [WebsiteController::class, 'cityForRent'])
    ->where('city', '(?!admin|api|login|register|dashboard|profile|user)[a-z][a-z\-]*')
    ->name('city-for-rent');
Route::get('/blog', [WebsiteController::class, 'blog'])->name('blog');
Route::get('/blog/{slug}', [WebsiteController::class, 'blogDetail'])->name('blog.detail');
Route::get('/contact', [WebsiteController::class, 'contact'])->name('contact');
Route::get('/privacy', [WebsiteController::class, 'privacy'])->name('privacy');
Route::get('/terms', [WebsiteController::class, 'terms'])->name('terms');
// New SEO-friendly property route structure: /city/street-address/mls-id
Route::get('/{city}/{address}/{listingKey}', [WebsiteController::class, 'propertyDetail'])
    ->where([
        'city' => '(?!admin|api|login|register|dashboard|profile|user|building|school|storage)[a-z][a-z\-]*',
        'address' => '[a-z0-9\-]+',
        'listingKey' => '[A-Z0-9]+'
    ])
    ->name('property-detail');

// Keep old route for backwards compatibility (redirect to new format)
Route::get('/property/{listingKey}', [WebsiteController::class, 'propertyDetailRedirect']);

// Building routes - both formats supported
Route::get('/building/{buildingSlug}', [WebsiteController::class, 'buildingDetail'])->name('building-detail');

// School routes - simplified to use only school name slug
Route::get('/school/{schoolSlug}', [WebsiteController::class, 'schoolDetailBySlug'])
    ->where('schoolSlug', '[a-z0-9\-]+')
    ->name('school-detail');

Route::get('/api/image-proxy', [\App\Http\Controllers\ImageProxyController::class, 'proxy'])->name('image-proxy');

// Property Enquiry route
Route::post('/property-enquiry', [PropertyEnquiryController::class, 'store'])->name('property.enquiry');

// Contact Form route
Route::post('/contact', [\App\Http\Controllers\ContactController::class, 'store'])->name('contact.store');

// Property Image API routes (using same mechanism as WordPress plugin)
Route::post('/api/property-images', [\App\Http\Controllers\Api\PropertyImageController::class, 'getPropertyImages']);
Route::post('/api/property-image', [\App\Http\Controllers\Api\PropertyImageController::class, 'getPropertyImage']);

// Property Search API routes
Route::post('/api/property-search', [\App\Http\Controllers\PropertySearchController::class, 'search']);
Route::post('/api/property-search-viewport', [\App\Http\Controllers\PropertySearchController::class, 'searchByViewport']);
Route::post('/api/property-types', [\App\Http\Controllers\PropertySearchController::class, 'getAvailablePropertyTypes']);
Route::post('/api/save-search', [\App\Http\Controllers\SavedSearchController::class, 'store'])->middleware('auth');
Route::get('/api/saved-searches', [\App\Http\Controllers\SavedSearchController::class, 'index'])->middleware('auth');
Route::put('/api/saved-searches/{id}', [\App\Http\Controllers\SavedSearchController::class, 'update'])->middleware('auth');
Route::delete('/api/saved-searches/{id}', [\App\Http\Controllers\SavedSearchController::class, 'destroy'])->middleware('auth');
Route::get('/saved-searches/{id}/run', [\App\Http\Controllers\SavedSearchController::class, 'run'])->middleware('auth');
Route::post('/api/buildings-search', [\App\Http\Controllers\Admin\BuildingController::class, 'searchBuildings']);

// Property Detail API routes
Route::post('/api/property-detail', [\App\Http\Controllers\Api\PropertyDetailController::class, 'getPropertyDetail']);
Route::post('/api/optimized/property-detail', [\App\Http\Controllers\Api\OptimizedPropertyDetailController::class, 'getAllPropertyData']);

// Property Favourites API routes
Route::middleware('auth')->prefix('api/favourites')->group(function () {
    Route::get('/properties', [\App\Http\Controllers\Api\PropertyFavouriteController::class, 'index']);
    Route::post('/properties', [\App\Http\Controllers\Api\PropertyFavouriteController::class, 'store']);
    Route::delete('/properties', [\App\Http\Controllers\Api\PropertyFavouriteController::class, 'destroy']);
    Route::post('/properties/toggle', [\App\Http\Controllers\Api\PropertyFavouriteController::class, 'toggle']);
    Route::post('/properties/check', [\App\Http\Controllers\Api\PropertyFavouriteController::class, 'check']);
    Route::get('/properties/with-data', [\App\Http\Controllers\Api\PropertyFavouriteController::class, 'getFavouritesWithData']);
});

// Homepage Properties API route
Route::get('/api/homepage-properties', [\App\Http\Controllers\Api\HomepagePropertiesController::class, 'getHomepageProperties']);

// Building API routes
Route::prefix('api/buildings')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\BuildingController::class, 'index']);
    Route::get('/search', [\App\Http\Controllers\Api\BuildingController::class, 'search']);
    Route::get('/featured', [\App\Http\Controllers\Api\BuildingController::class, 'featured']);
    Route::get('/types', [\App\Http\Controllers\Api\BuildingController::class, 'buildingTypes']);
    Route::get('/cities', [\App\Http\Controllers\Api\BuildingController::class, 'cities']);
    Route::get('/find-by-address', [\App\Http\Controllers\Api\BuildingController::class, 'findByAddress']);
    Route::get('/count-mls-listings', [\App\Http\Controllers\Api\BuildingController::class, 'countMLSListings']);
    Route::post('/upload-image', [\App\Http\Controllers\Api\BuildingController::class, 'uploadImage'])->middleware('auth');
    Route::post('/generate-ai-description', [\App\Http\Controllers\Api\BuildingController::class, 'generateAiDescription'])->middleware('auth');
    Route::get('/{id}', [\App\Http\Controllers\Api\BuildingController::class, 'show']);
});

// School API routes
Route::prefix('api/schools')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\SchoolController::class, 'index']);
    Route::get('/nearby', [\App\Http\Controllers\Api\SchoolController::class, 'getNearbySchools']);
    Route::get('/featured', [\App\Http\Controllers\Api\SchoolController::class, 'featured']);
    Route::get('/types', [\App\Http\Controllers\Api\SchoolController::class, 'schoolTypes']);
    Route::get('/grade-levels', [\App\Http\Controllers\Api\SchoolController::class, 'gradeLevels']);
    Route::get('/cities', [\App\Http\Controllers\Api\SchoolController::class, 'cities']);
    Route::post('/geocode/{schoolId}', [\App\Http\Controllers\Api\SchoolController::class, 'geocodeSchool']);
    Route::post('/batch-geocode', [\App\Http\Controllers\Api\SchoolController::class, 'batchGeocodeSchools']);
    Route::get('/slug/{slug}', [\App\Http\Controllers\Api\SchoolController::class, 'showBySlug']);
    Route::get('/{id}', [\App\Http\Controllers\Api\SchoolController::class, 'show']);
});

// Nearby and Similar listings API routes
Route::get('/api/nearby-listings', [WebsiteController::class, 'getNearbyListings']);
Route::get('/api/similar-listings', [WebsiteController::class, 'getSimilarListings']);

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'auth' => [
            'user' => auth()->user()
        ]
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// User Dashboard Route - For regular website users
Route::get('/user/dashboard', function () {
    return Inertia::render('Website/Pages/UserDashboard', [
        'siteName' => 'X Houses',
        'siteUrl' => config('app.url'),
        'year' => date('Y')
    ]);
})->middleware(['auth', 'verified'])->name('user.dashboard');

// User Favourites Route
Route::get('/user/favourites', function () {
    return Inertia::render('Website/Pages/UserFavourites', [
        'siteName' => 'X Houses',
        'siteUrl' => config('app.url'),
        'year' => date('Y')
    ]);
})->middleware(['auth', 'verified'])->name('user.favourites');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::match(['post', 'patch'], '/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Routes - Only accessible by admin users
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/websites', [AdminController::class, 'websites'])->name('websites');

    Route::get('/api-keys', [AdminController::class, 'apiKeys'])->name('api-keys');
    Route::post('/api-keys', [AdminController::class, 'updateApiKeys'])->name('api-keys.update');
    Route::post('/api-keys/test', [AdminController::class, 'testApiConnection'])->name('api-keys.test');

    
    // Real Estate routes
    Route::get('/real-estate/buildings', [RealEstateController::class, 'buildings'])->name('real-estate.buildings');
    Route::get('/real-estate/developers', [RealEstateController::class, 'developers'])->name('real-estate.developers');
    Route::get('/real-estate/schools', [RealEstateController::class, 'schools'])->name('real-estate.schools');
    
    // Building Management routes
    Route::prefix('buildings')->name('buildings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\BuildingController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Admin\BuildingController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Admin\BuildingController::class, 'store'])->name('store');
        Route::get('/{buildingSlug}', [\App\Http\Controllers\Admin\BuildingController::class, 'show'])->name('show');
        Route::get('/{buildingSlug}/edit', [\App\Http\Controllers\Admin\BuildingController::class, 'edit'])->name('edit');
        Route::put('/{buildingSlug}', [\App\Http\Controllers\Admin\BuildingController::class, 'update'])->name('update');
        Route::delete('/{buildingSlug}', [\App\Http\Controllers\Admin\BuildingController::class, 'destroy'])->name('destroy');
    });
    
    // Developer Management routes
    Route::resource('developers', \App\Http\Controllers\Admin\DeveloperController::class);
    
    // Amenity Management routes
    Route::resource('amenities', \App\Http\Controllers\Admin\AmenityController::class);

    // Maintenance Fee Amenity Management routes
    Route::resource('maintenance-fee-amenities', \App\Http\Controllers\Admin\MaintenanceFeeAmenityController::class);
    Route::get('api/maintenance-fee-amenities/active', [\App\Http\Controllers\Admin\MaintenanceFeeAmenityController::class, 'getAllActive']);

    // Schools removed - using API data instead

    // Tour Requests Management
    Route::get('/tour-requests', [\App\Http\Controllers\Admin\TourRequestController::class, 'index'])->name('tour-requests.index');
    Route::get('/tour-requests/export', [\App\Http\Controllers\Admin\TourRequestController::class, 'export'])->name('tour-requests.export');

    // Property Questions Management
    Route::get('/property-questions', [\App\Http\Controllers\Admin\PropertyQuestionController::class, 'index'])->name('property-questions.index');
    Route::get('/property-questions/data', [\App\Http\Controllers\Admin\PropertyQuestionController::class, 'data'])->name('property-questions.data');
    Route::put('/property-questions/{id}/status', [\App\Http\Controllers\Admin\PropertyQuestionController::class, 'updateStatus'])->name('property-questions.updateStatus');
    Route::delete('/property-questions/{id}', [\App\Http\Controllers\Admin\PropertyQuestionController::class, 'destroy'])->name('property-questions.destroy');
    Route::get('/property-questions/export', [\App\Http\Controllers\Admin\PropertyQuestionController::class, 'export'])->name('property-questions.export');

    // Contact Form Management routes
    Route::prefix('contacts')->name('contacts.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\ContactController::class, 'index'])->name('index');
        Route::get('/{contact}', [\App\Http\Controllers\Admin\ContactController::class, 'show'])->name('show');
        Route::patch('/{contact}/read', [\App\Http\Controllers\Admin\ContactController::class, 'markAsRead'])->name('markAsRead');
        Route::delete('/{contact}', [\App\Http\Controllers\Admin\ContactController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-actions', [\App\Http\Controllers\Admin\ContactController::class, 'bulkActions'])->name('bulkActions');
    });

    // Website Management routes
    Route::prefix('websites')->name('websites.')->group(function () {
        Route::get('/', [WebsiteManagementController::class, 'index'])->name('index');
        Route::get('/create', [WebsiteManagementController::class, 'create'])->name('create');
        Route::post('/', [WebsiteManagementController::class, 'store'])->name('store');
        Route::get('/{website}', [WebsiteManagementController::class, 'show'])->name('show');
        Route::get('/{website}/edit', [WebsiteManagementController::class, 'edit'])->name('edit');
        Route::put('/{website}', [WebsiteManagementController::class, 'update'])->name('update');
        Route::delete('/{website}', [WebsiteManagementController::class, 'destroy'])->name('destroy');
        Route::get('/{website}/edit-home-page', [WebsiteManagementController::class, 'editHomePage'])->name('edit-home-page');
        Route::put('/{website}/update-home-page', [WebsiteManagementController::class, 'updateHomePage'])->name('update-home-page');
        Route::get('/{website}/pages', [WebsiteManagementController::class, 'pages'])->name('pages');
    });
    
    // Icon Management routes
    Route::prefix('icons')->name('icons.')->group(function () {
        Route::get('/', [AdminController::class, 'icons'])->name('index');
        Route::post('/', [WebsiteManagementController::class, 'storeIconAjax'])->name('store');
        Route::put('/{id}', [WebsiteManagementController::class, 'updateIcon'])->name('update');
        Route::delete('/{id}', function($id) {
            $icon = \App\Models\Icon::findOrFail($id);
            
            // Delete associated file if it exists
            if ($icon->icon_url && \Illuminate\Support\Facades\Storage::disk('public')->exists(str_replace('/storage/', '', $icon->icon_url))) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete(str_replace('/storage/', '', $icon->icon_url));
            }
            
            $icon->delete();
            return redirect()->route('admin.icons.index')->with('success', 'Icon deleted!');
        })->name('destroy');
        
        // API endpoints for icon management
        Route::get('/api/get', [WebsiteManagementController::class, 'getIcons'])->name('api.get');
        Route::post('/api/store', [WebsiteManagementController::class, 'storeIconAjax'])->name('api.store');
    });
    
    // Contact Form Management routes
    Route::prefix('contacts')->name('contacts.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\ContactController::class, 'index'])->name('index');
        Route::get('/{contact}', [\App\Http\Controllers\Admin\ContactController::class, 'show'])->name('show');
        Route::patch('/{contact}/mark-read', [\App\Http\Controllers\Admin\ContactController::class, 'markAsRead'])->name('mark-read');
        Route::delete('/{contact}', [\App\Http\Controllers\Admin\ContactController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-actions', [\App\Http\Controllers\Admin\ContactController::class, 'bulkActions'])->name('bulk-actions');
    });

    // Blog Management routes
    Route::prefix('blog')->name('blog.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\BlogController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Admin\BlogController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Admin\BlogController::class, 'store'])->name('store');
        Route::get('/{blog}', [\App\Http\Controllers\Admin\BlogController::class, 'show'])->name('show');
        Route::get('/{blog}/edit', [\App\Http\Controllers\Admin\BlogController::class, 'edit'])->name('edit');
        Route::put('/{blog}', [\App\Http\Controllers\Admin\BlogController::class, 'update'])->name('update');
        Route::delete('/{blog}', [\App\Http\Controllers\Admin\BlogController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-delete', [\App\Http\Controllers\Admin\BlogController::class, 'bulkDelete'])->name('bulk-delete');
    });
});

require __DIR__.'/auth.php';

// SEO-friendly building URLs - must be at the end to avoid matching admin routes
Route::get('/{city}/{street}/{buildingSlug}', [WebsiteController::class, 'buildingDetail'])
    ->where([
        'city' => '(?!admin|api|login|register|dashboard|profile|user|building|school|storage)[a-z][a-z0-9\-]*',  // Must start with lowercase letter and exclude reserved words
        'street' => '[a-z0-9\-]+', 
        'buildingSlug' => '.*'
    ])
    ->name('building-detail-seo');

// Enhanced Property Images API Routes - DISABLED to use PropertyImageController instead
// Route::prefix('api')->group(function () {
//     Route::post('/property-images', [EnhancedPropertyImagesController::class, 'getPropertyImages'])->name('api.property-images');
//     Route::post('/property-images/clear-cache', [EnhancedPropertyImagesController::class, 'clearImageCache'])->name('api.property-images.clear-cache');
// });

// AMPRE API Test Routes (remove in production)
Route::prefix('api/ampre/test')->group(function () {
    Route::get('/config', [AmpreTestController::class, 'testConfig']);
    Route::get('/properties', [AmpreTestController::class, 'testProperties']);
    Route::get('/properties-with-count', [AmpreTestController::class, 'testPropertiesWithCount']);
    Route::get('/price-range', [AmpreTestController::class, 'testPriceRange']);
    Route::get('/or-filters', [AmpreTestController::class, 'testOrFilters']);
    Route::get('/property/{listingKey}', [AmpreTestController::class, 'testPropertyByKey']);
    Route::get('/request-url', [AmpreTestController::class, 'getRequestUrl']);
});


// Test what's sent to edit page
Route::get('/test-edit-inertia/{building}', function ($buildingId) {
    $building = \App\Models\Building::find($buildingId);
    $buildingAmenities = $building->amenities()->get();

    $data = [
        'building' => [
            'id' => $building->id,
            'name' => $building->name,
            'amenity_ids' => $buildingAmenities->pluck('id')->toArray(),
        ],
        'amenities' => \App\Models\Amenity::orderBy('name')->get()->map(function ($amenity) {
            return [
                'id' => $amenity->id,
                'name' => $amenity->name,
                'icon' => $amenity->icon
            ];
        })
    ];

    return response()->json($data);
});

// Test edit data for debugging amenities
Route::get('/test-edit-data/{building}', function ($buildingId) {
    $building = \App\Models\Building::find($buildingId);
    if (!$building) {
        return response()->json(['error' => 'Building not found']);
    }

    // Direct query to test
    $directAmenities = $building->amenities()->get();

    // Then try loading
    $building->load(['developer', 'amenities']);

    $data = [
        'building_name' => $building->name,
        'direct_amenities_count' => $directAmenities->count(),
        'direct_amenity_names' => $directAmenities->pluck('name')->toArray(),
        'amenities_loaded' => $building->relationLoaded('amenities'),
        'loaded_amenities_is_null' => is_null($building->amenities),
        'loaded_amenities_count' => $building->amenities ? $building->amenities->count() : 0,
        'amenity_ids' => $building->amenities ? $building->amenities->pluck('id')->toArray() : [],
        'building_data_like_controller' => [
            'id' => $building->id,
            'name' => $building->name,
            'amenity_ids' => $building->amenities ? $building->amenities->pluck('id')->toArray() : [],
        ]
    ];

    return response()->json($data);
});
