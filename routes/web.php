<?php

use App\Http\Controllers\ProfileController;
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
Route::get('/property-detail', [WebsiteController::class, 'propertyDetail'])->name('property-detail');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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
        Route::get('/', function() {
            return Inertia::render('Admin/Icons/Index', [
                'title' => 'Icon Management',
                'icons' => [
                    [
                        'id' => 1,
                        'name' => 'building',
                        'category' => 'key_facts',
                        'svg_content' => '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 4V28" stroke="#293056" stroke-width="2"/></svg>',
                        'is_active' => true
                    ],
                    [
                        'id' => 2,
                        'name' => 'gym',
                        'category' => 'amenities',
                        'svg_content' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6.25 10H13.75" stroke="#020202" stroke-width="1.5"/></svg>',
                        'is_active' => true
                    ]
                ]
            ]);
        })->name('index');
        Route::post('/', function() { 
            return redirect()->route('admin.icons.index')->with('success', 'Icon created!'); 
        })->name('store');
        Route::put('/{id}', function($id) { 
            return redirect()->route('admin.icons.index')->with('success', 'Icon updated!'); 
        })->name('update');
        Route::delete('/{id}', function($id) { 
            return redirect()->route('admin.icons.index')->with('success', 'Icon deleted!'); 
        })->name('destroy');
        
        // API endpoints for icon management
        Route::get('/api/get', [WebsiteManagementController::class, 'getIcons'])->name('api.get');
        Route::post('/api/store', [WebsiteManagementController::class, 'storeIconAjax'])->name('api.store');
    });
});

require __DIR__.'/auth.php';



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
