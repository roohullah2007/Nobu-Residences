<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\EnhancedPropertyImagesController;
use App\Http\Controllers\AmpreTestController;
use App\Http\Controllers\WebsiteController;

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
Route::get('/blog', [WebsiteController::class, 'blog'])->name('blog');
Route::get('/contact', [WebsiteController::class, 'contact'])->name('contact');
Route::get('/school', [WebsiteController::class, 'school'])->name('school');
Route::get('/privacy', [WebsiteController::class, 'privacy'])->name('privacy');
Route::get('/terms', [WebsiteController::class, 'terms'])->name('terms');
Route::get('/property-detail', [WebsiteController::class, 'propertyDetail'])->name('property-detail');
Route::get('/building-detail', [WebsiteController::class, 'buildingDetail'])->name('building-detail');

// Property Image API routes (using same mechanism as WordPress plugin)
Route::post('/api/property-images', [\App\Http\Controllers\Api\PropertyImageController::class, 'getPropertyImages']);
Route::post('/api/property-image', [\App\Http\Controllers\Api\PropertyImageController::class, 'getPropertyImage']);

// Property Search API routes
Route::post('/api/property-search', [\App\Http\Controllers\PropertySearchController::class, 'search']);
Route::post('/api/save-search', [\App\Http\Controllers\PropertySearchController::class, 'saveSearch']); // Removed auth middleware - handled in controller
Route::get('/api/saved-searches', [\App\Http\Controllers\PropertySearchController::class, 'getSavedSearches'])->middleware('auth');
Route::post('/api/buildings-search', [\App\Http\Controllers\Admin\BuildingController::class, 'searchBuildings']);

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// User Dashboard Route - For regular website users
Route::get('/user/dashboard', function () {
    return Inertia::render('UserDashboard', [
        'siteName' => 'X Houses',
        'siteUrl' => config('app.url'),
        'year' => date('Y')
    ]);
})->middleware(['auth', 'verified'])->name('user.dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
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
        Route::get('/{building}', [\App\Http\Controllers\Admin\BuildingController::class, 'show'])->name('show');
        Route::get('/{building}/edit', [\App\Http\Controllers\Admin\BuildingController::class, 'edit'])->name('edit');
        Route::put('/{building}', [\App\Http\Controllers\Admin\BuildingController::class, 'update'])->name('update');
        Route::delete('/{building}', [\App\Http\Controllers\Admin\BuildingController::class, 'destroy'])->name('destroy');
    });
    
    // Developer Management routes
    Route::resource('developers', \App\Http\Controllers\Admin\DeveloperController::class);
    
    // Amenity Management routes
    Route::resource('amenities', \App\Http\Controllers\Admin\AmenityController::class);
    
    // Website Management routes
    Route::prefix('websites')->name('websites.')->group(function () {
        Route::get('/', [AdminController::class, 'websites'])->name('index');
        Route::get('/create', function() { 
            return Inertia::render('Admin/Websites/Create', ['title' => 'Create New Website']); 
        })->name('create');
        Route::post('/', function() { 
            return redirect()->route('admin.websites.index')->with('success', 'Website created!'); 
        })->name('store');
        Route::get('/{id}', function($id) { 
            return Inertia::render('Admin/Websites/Show', [
                'title' => 'Website Details',
                'website' => [
                    'id' => $id,
                    'name' => 'Nobu Residences',
                    'slug' => 'nobu-residences',
                    'is_default' => true,
                    'is_active' => true,
                    'logo_url' => '/assets/logo.png',
                    'domain' => null,
                    'description' => 'Luxury condos in downtown Toronto',
                    'timezone' => 'America/Toronto',
                    'brand_colors' => [
                        'primary' => '#912018',
                        'secondary' => '#293056',
                        'accent' => '#F5F8FF',
                        'text' => '#000000',
                        'background' => '#FFFFFF'
                    ],
                    'contact_info' => [
                        'phone' => '+1 437 998 1795',
                        'email' => 'contact@noburesidences.com',
                        'address' => 'Building No.88, Toronto CA, Ontario, Toronto',
                        'agent' => [
                            'name' => 'Jatin Gill',
                            'title' => 'Property Manager'
                        ]
                    ],
                    'social_media' => [
                        'facebook' => 'https://facebook.com/noburesidences',
                        'instagram' => 'https://instagram.com/noburesidences',
                        'twitter' => 'https://twitter.com/noburesidences',
                        'linkedin' => 'https://linkedin.com/company/noburesidences'
                    ],
                    'pages' => [
                        ['id' => 1, 'page_type' => 'home', 'title' => 'Home', 'is_active' => true]
                    ]
                ]
            ]); 
        })->name('show');
        Route::get('/{id}/edit', function($id) { 
            return Inertia::render('Admin/Websites/Edit', [
                'title' => 'Edit Website',
                'website' => [
                    'id' => $id,
                    'name' => 'Nobu Residences',
                    'slug' => 'nobu-residences',
                    'is_default' => true,
                    'is_active' => true,
                    'logo_url' => '/assets/logo.png',
                    'domain' => null,
                    'description' => 'Luxury condos in downtown Toronto',
                    'timezone' => 'America/Toronto',
                    'meta_title' => 'Nobu Residences - Luxury Condos Toronto',
                    'meta_description' => 'Discover luxury living at Nobu Residences in downtown Toronto',
                    'meta_keywords' => 'toronto condos, luxury residences, nobu',
                    'favicon_url' => '/favicon.ico',
                    'brand_colors' => [
                        'primary' => '#912018',
                        'secondary' => '#293056',
                        'accent' => '#F5F8FF',
                        'text' => '#000000',
                        'background' => '#FFFFFF'
                    ],
                    'contact_info' => [
                        'phone' => '+1 437 998 1795',
                        'email' => 'contact@noburesidences.com',
                        'address' => 'Building No.88, Toronto CA, Ontario, Toronto',
                        'agent' => [
                            'name' => 'Jatin Gill',
                            'title' => 'Property Manager'
                        ]
                    ],
                    'social_media' => [
                        'facebook' => 'https://facebook.com/noburesidences',
                        'instagram' => 'https://instagram.com/noburesidences',
                        'twitter' => 'https://twitter.com/noburesidences',
                        'linkedin' => 'https://linkedin.com/company/noburesidences'
                    ]
                ]
            ]); 
        })->name('edit');
        Route::put('/{id}', [WebsiteManagementController::class, 'updateWebsite'])->name('update');
        Route::delete('/{id}', function($id) { 
            return redirect()->route('admin.websites.index')->with('success', 'Website deleted!'); 
        })->name('destroy');
        
        // Pages management
        Route::get('/{id}/pages', function($id) { 
            return Inertia::render('Admin/Websites/Pages', [
                'title' => 'Website Pages',
                'website' => [
                    'id' => $id,
                    'name' => 'Nobu Residences',
                    'slug' => 'nobu-residences',
                    'is_default' => true,
                    'is_active' => true,
                    'pages' => [
                        [
                            'id' => 1, 
                            'page_type' => 'home', 
                            'title' => 'Home Page', 
                            'slug' => '',
                            'is_active' => true,
                            'updated_at' => '2024-08-03T10:30:00Z'
                        ]
                    ]
                ]
            ]); 
        })->name('pages');
        
        // Home page management
        Route::get('/{id}/home-page/edit', [WebsiteManagementController::class, 'editHomePage'])->name('home-page.edit');
        Route::put('/{id}/home-page', [WebsiteManagementController::class, 'updateHomePage'])->name('home-page.update');
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
});

require __DIR__.'/auth.php';



// Enhanced Property Images API Routes
Route::prefix('api')->group(function () {
    Route::post('/property-images', [EnhancedPropertyImagesController::class, 'getPropertyImages'])->name('api.property-images');
    Route::post('/property-images/clear-cache', [EnhancedPropertyImagesController::class, 'clearImageCache'])->name('api.property-images.clear-cache');
});

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
