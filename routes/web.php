<?php

use App\Http\Controllers\ProfileController;
// Image proxy and AMPRE test controllers removed - using Repliers CDN directly
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

// Per-tenant SEO files: each domain advertises its own sitemap. robots.txt
// used to be a static public/ file, which could not carry a Sitemap line.
Route::get('/robots.txt', \App\Http\Controllers\RobotsTxtController::class)->name('robots');
Route::get('/sitemap.xml', \App\Http\Controllers\SitemapController::class)->name('sitemap');

// Public routes for the real estate website
Route::get('/rent', [WebsiteController::class, 'rent'])->name('rent');
Route::get('/sale', [WebsiteController::class, 'sale'])->name('sale');
Route::get('/search', [WebsiteController::class, 'search'])->name('search');

// Clean per-tenant building inventory pages (client SEO spec): each landing
// domain is a single-building site, so /for-sale and /for-rent at the domain
// root list that building's units. Legacy /search?building_id=... links 301
// here (see WebsiteController::search()).
Route::get('/for-sale', [WebsiteController::class, 'tenantBuildingForSale'])->name('site-for-sale');
Route::get('/for-rent', [WebsiteController::class, 'tenantBuildingForRent'])->name('site-for-rent');

// Special routes for combined Mercer buildings
Route::get('/15-35-Mercer/for-sale', [WebsiteController::class, 'mercerBuildingsForSale'])
    ->name('mercer-buildings-for-sale');
Route::get('/15-35-Mercer/for-rent', [WebsiteController::class, 'mercerBuildingsForRent'])
    ->name('mercer-buildings-for-rent');

// SEO-friendly building-based search routes (e.g., /15-Mercer/for-sale)
Route::get('/{building}/for-sale', [WebsiteController::class, 'buildingForSale'])
    ->where('building', '\d+-[A-Za-z\-]+')
    ->name('building-for-sale');
Route::get('/{building}/for-rent', [WebsiteController::class, 'buildingForRent'])
    ->where('building', '\d+-[A-Za-z\-]+')
    ->name('building-for-rent');

// SEO-friendly city-based search routes
Route::get('/{city}/for-sale', [WebsiteController::class, 'cityForSale'])
    ->where('city', '(?!admin|api|mls|login|register|dashboard|profile|user)[a-z][a-z\-]*')
    ->name('city-for-sale');
Route::get('/{city}/for-rent', [WebsiteController::class, 'cityForRent'])
    ->where('city', '(?!admin|api|mls|login|register|dashboard|profile|user)[a-z][a-z\-]*')
    ->name('city-for-rent');
Route::get('/blogs', [WebsiteController::class, 'blog'])->name('blog');
// Category listing (must be registered before /blogs/{slug} so "category"
// isn't swallowed as a post slug). Reuses the Blog page filtered by category.
Route::get('/blogs/category/{categorySlug}', [WebsiteController::class, 'blogCategory'])->name('blog.category');
Route::get('/blogs/{slug}', [WebsiteController::class, 'blogDetail'])->name('blog.detail');

// Developer routes
Route::get('/developers', [WebsiteController::class, 'developers'])->name('developers');
Route::get('/developer/{developerSlug}', [WebsiteController::class, 'developerDetail'])->name('developer.detail');
Route::get('/contact', [WebsiteController::class, 'contact'])->name('contact');
Route::get('/privacy', [WebsiteController::class, 'privacy'])->name('privacy');
Route::get('/terms', [WebsiteController::class, 'terms'])->name('terms');
// New SEO-friendly property route structure: /city/street-address/mls-id
// Property detail: supports both old format (/city/address/C12550852) and
// new SEO format (/city/address/unit-604-C12550852)
Route::get('/{city}/{address}/{listingKey}', [WebsiteController::class, 'propertyDetail'])
    ->where([
        'city' => '(?!admin|api|mls|login|register|dashboard|profile|user|building|school|storage)[a-z][a-z\-]*',
        'address' => '[a-z0-9\-]+',
        'listingKey' => '(?:unit-[A-Za-z0-9]+-)?[A-Z][0-9]+' // MLS ID or unit-{unitNumber}-{MLS ID}; unit numbers can be alphanumeric (e.g. PL01, TH3, 4A)
    ])
    ->name('property-detail');

// Keep old route for backwards compatibility (redirect to new format)
Route::get('/property/{listingKey}', [WebsiteController::class, 'propertyDetailRedirect']);

// Canonical /mls/ listing URLs (client SEO spec). Registered before every
// /{city}/... catch-all; "mls" is also excluded from their {city} patterns.
// Order inside this block matters: homes-for-* must win over the generic
// 3-segment form.
// Homes/townhomes (no matched condo building):
//   /mls/toronto/homes-for-rent/144-elmer-avenue-E12057013
Route::get('/mls/{city}/homes-for-{saleRent}/{addressMls}', [WebsiteController::class, 'propertyDetailMlsHome'])
    ->where([
        'city' => '[a-z][a-z\-]*',
        'saleRent' => 'sale|rent',
        'addressMls' => '[a-z0-9\-]+-[A-Z][0-9]+',
    ])
    ->name('mls.property-detail.home');
// Condo canonical form:
//   /mls/toronto/the-well-condos/480-front-st-w/unit-1009-E12057013
Route::get('/mls/{city}/{buildingSlug}/{streetSlug}/{listingKey}', [WebsiteController::class, 'propertyDetailMls'])
    ->where([
        'city' => '[a-z][a-z\-]*',
        'buildingSlug' => '[a-z0-9\-]+',
        'streetSlug' => '[a-z0-9\-]+',
        'listingKey' => '(?:unit-[A-Za-z0-9]+-)?[A-Z][0-9]+',
    ])
    ->name('mls.property-detail');
// Collapsed 3-segment variant from the client doc examples
// (building+street in one segment) — 301s to the 4-segment form inside the
// action via the canonical check.
Route::get('/mls/{city}/{combinedSlug}/{listingKey}', [WebsiteController::class, 'propertyDetailMlsShort'])
    ->where([
        'city' => '[a-z][a-z\-]*',
        'combinedSlug' => '[a-z0-9\-]+',
        'listingKey' => '(?:unit-[A-Za-z0-9]+-)?[A-Z][0-9]+',
    ])
    ->name('mls.property-detail.short');
// Static location search pages per the client doc ("will be Static URLs,
// not search query"): /mls/toronto/homes-for-sale, /mls/toronto/homes-for-rent,
// /mls/toronto/apartments-for-sale, /mls/toronto/apartments-for-rent (plus the
// condos/houses/townhouses variants). Two segments after /mls, so it can
// never collide with the 3+-segment listing routes above.
Route::get('/mls/{city}/{searchSlug}', [WebsiteController::class, 'searchByCity'])
    ->where([
        'city' => '[a-z][a-z\-]*',
        'searchSlug' => '(?:\d+-bedroom-)?(?:homes|condos|houses|townhouses|apartments)-for-(?:sale|rent)',
    ])
    ->name('mls.search.city');

// One-click unsubscribe from a saved-search alert email (signed link — the
// recipient may not be logged in on the device they open the email on)
Route::get('/alerts/saved-search/{savedSearch}/unsubscribe', \App\Http\Controllers\SavedSearchUnsubscribeController::class)
    ->middleware('signed')
    ->name('alerts.saved-search.unsubscribe');

// Building full price history page
Route::get('/{city}/{buildingSlug}/price-history', [WebsiteController::class, 'buildingPriceHistory'])
    ->where([
        'city' => '(?!admin|api|mls|login|register|dashboard|profile|user|building|school|storage|price-history)[a-z][a-z\-]*',
        'buildingSlug' => '[a-z0-9\-]+',
    ])
    ->name('building.price-history');

// Price history search landing — registered BEFORE the listingKey route so
// a bare /price-history hits this handler instead of 404'ing on the
// parameterized one.
Route::get('/price-history', [WebsiteController::class, 'priceHistorySearch'])
    ->name('price-history.search');

// Per-listing full price history page (universal fallback used by the
// "View full price history" button on every property detail page)
Route::get('/price-history/{listingKey}', [WebsiteController::class, 'propertyPriceHistory'])
    ->where([
        'listingKey' => '(?:unit-[A-Za-z0-9]+-)?[A-Z][0-9]+',
    ])
    ->name('property.price-history');

// Neighbourhood / area search URLs.
// Examples:
//   /toronto/king-west/condos-for-sale
//   /toronto/king-west/condos-for-rent
//   /toronto/king-west/2-bedroom-condos-for-sale
//   /toronto/king-west/townhouses-for-sale
Route::get('/{city}/{neighbourhood}/{searchSlug}', [WebsiteController::class, 'searchByArea'])
    ->where([
        'city' => '(?!admin|api|mls|login|register|dashboard|profile|user|building|school|storage)[a-z][a-z\-]*',
        'neighbourhood' => '[a-z0-9\-]+',
        'searchSlug' => '(?:\d+-bedroom-)?(?:condos|houses|townhouses|apartments)-for-(?:sale|rent)',
    ])
    ->name('search.area');

// City-only search URLs e.g. /toronto/condos-for-sale, /mississauga/houses-for-sale
// (registered before the 2-segment building route so it wins the match)
Route::get('/{city}/{searchSlug}', [WebsiteController::class, 'searchByCity'])
    ->where([
        'city' => '(?!admin|api|mls|login|register|dashboard|profile|user|building|school|storage)[a-z][a-z\-]*',
        'searchSlug' => '(?:\d+-bedroom-)?(?:condos|houses|townhouses|apartments)-for-(?:sale|rent)',
    ])
    ->name('search.city');

// Building routes - both formats supported
Route::get('/building/{buildingSlug}', [WebsiteController::class, 'buildingDetail'])->name('building-detail');

// School routes - simplified to use only school name slug
Route::get('/school/{schoolSlug}', [WebsiteController::class, 'schoolDetailBySlug'])
    ->where('schoolSlug', '[a-z0-9\-]+')
    ->name('school-detail');

// Image proxy removed - Repliers CDN images work directly via HTTPS

// Property Enquiry route
Route::post('/property-enquiry', [PropertyEnquiryController::class, 'store'])->name('property.enquiry');

// Agent / Building Enquiry route (used by the "Contact Agent about <Building>" modal)
Route::post('/agent-enquiry', [PropertyEnquiryController::class, 'agentEnquiry'])->name('agent.enquiry');

// Contact Form route
Route::post('/contact', [\App\Http\Controllers\ContactController::class, 'store'])->name('contact.store');

// Property Image API routes (using same mechanism as WordPress plugin)
Route::post('/api/property-images', [\App\Http\Controllers\Api\PropertyImageController::class, 'getPropertyImages']);
Route::post('/api/property-image', [\App\Http\Controllers\Api\PropertyImageController::class, 'getPropertyImage']);

// Property Search API routes
Route::post('/api/property-search', [\App\Http\Controllers\PropertySearchController::class, 'search']);
Route::post('/api/property-search-count', [\App\Http\Controllers\PropertySearchController::class, 'searchCount']);
Route::post('/api/property-search-viewport', [\App\Http\Controllers\PropertySearchController::class, 'searchByViewport']);
Route::post('/api/map-coordinates', [\App\Http\Controllers\PropertySearchController::class, 'getMapCoordinates']);
Route::get('/api/address-suggestions', [\App\Http\Controllers\PropertySearchController::class, 'getAddressSuggestions']);
Route::get('/api/price-history-suggestions', [\App\Http\Controllers\PropertySearchController::class, 'getPriceHistorySuggestions']);
Route::get('/api/city-suggestions', [\App\Http\Controllers\PropertySearchController::class, 'getCitySuggestions']);
Route::post('/api/save-search', [\App\Http\Controllers\SavedSearchController::class, 'store'])->middleware('auth');
Route::get('/api/saved-searches', [\App\Http\Controllers\SavedSearchController::class, 'index'])->middleware('auth');
Route::put('/api/saved-searches/{id}', [\App\Http\Controllers\SavedSearchController::class, 'update'])->middleware('auth');
Route::delete('/api/saved-searches/{id}', [\App\Http\Controllers\SavedSearchController::class, 'destroy'])->middleware('auth');
Route::get('/saved-searches/{id}/run', [\App\Http\Controllers\SavedSearchController::class, 'run'])->middleware('auth');
// Building alerts — a saved search pinned to a building's street addresses
Route::get('/api/building-alerts/status', [\App\Http\Controllers\SavedSearchController::class, 'buildingAlertStatus'])->middleware('auth');
Route::post('/api/building-alerts/toggle', [\App\Http\Controllers\SavedSearchController::class, 'toggleBuildingAlert'])->middleware('auth');
Route::post('/api/buildings-search', [\App\Http\Controllers\Admin\BuildingController::class, 'searchBuildings']);
// Live for-sale/for-rent counts for the buildings currently on screen.
// Called AFTER the cards render so the slow Repliers fetch never blocks the list.
Route::post('/api/buildings-counts', [\App\Http\Controllers\Admin\BuildingController::class, 'buildingCounts']);

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
    Route::post('/mls-facts', [\App\Http\Controllers\Api\BuildingController::class, 'mlsFacts'])->middleware('auth');
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
Route::get('/api/comparable-sales', [WebsiteController::class, 'getComparableSales']);
Route::get('/api/market-stats', [WebsiteController::class, 'getMarketStats']);
Route::post('/api/newsletter/subscribe', [\App\Http\Controllers\NewsletterController::class, 'subscribe']);

Route::get('/dashboard', function () {
    // Get website settings for consistent header/footer. Resolve by the
    // request's domain (tenant sites keep their own logo/branding on these
    // global pages); the default website is only a fallback.
    $resolver = app(\App\Services\Tenancy\TenantResolver::class);
    $website = $resolver->resolve(request()) ?? $resolver->defaultWebsite();

    $websiteData = null;
    if ($website) {
        $websiteData = [
            'id' => $website->id,
            'name' => $website->name,
            'slug' => $website->slug,
            'logo_url' => $website->logo_url,
            'logo_width' => $website->logo_width,
            'logo_height' => $website->logo_height,
            'brand_colors' => $website->getBrandColors(),
            'fonts' => $website->fonts,
            'meta_title' => $website->meta_title,
            'meta_description' => $website->meta_description,
            'favicon_url' => $website->favicon_url,
            'contact_info' => $website->getContactInfo(),
            'social_media' => $website->getSocialMedia(),
            'agent_info' => $website->agentInfo,
        ];
    }

    return Inertia::render('Dashboard', [
        'auth' => [
            'user' => auth()->user()
        ],
        'website' => $websiteData,
        'siteName' => $website?->name ?? 'Nobu Residences',
        'siteUrl' => $website?->domain ?? config('app.url'),
        'year' => date('Y'),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// User Dashboard Route - Redirects to main dashboard
Route::get('/user/dashboard', function () {
    return redirect()->route('dashboard');
})->middleware(['auth', 'verified'])->name('user.dashboard');

// User Favourites Route
Route::get('/user/favourites', function () {
    // Get website settings for consistent header/footer. Resolve by the
    // request's domain (tenant sites keep their own logo/branding on these
    // global pages); the default website is only a fallback.
    $resolver = app(\App\Services\Tenancy\TenantResolver::class);
    $website = $resolver->resolve(request()) ?? $resolver->defaultWebsite();

    $websiteData = null;
    if ($website) {
        $websiteData = [
            'id' => $website->id,
            'name' => $website->name,
            'slug' => $website->slug,
            'logo_url' => $website->logo_url,
            'logo_width' => $website->logo_width,
            'logo_height' => $website->logo_height,
            'brand_colors' => $website->getBrandColors(),
            'fonts' => $website->fonts,
            'meta_title' => $website->meta_title,
            'meta_description' => $website->meta_description,
            'favicon_url' => $website->favicon_url,
            'contact_info' => $website->getContactInfo(),
            'social_media' => $website->getSocialMedia(),
            'agent_info' => $website->agentInfo,
        ];
    }

    return Inertia::render('Website/Pages/UserFavourites', [
        'auth' => [
            'user' => auth()->user()
        ],
        'website' => $websiteData,
        'siteName' => $website?->name ?? 'Nobu Residences',
        'siteUrl' => $website?->domain ?? config('app.url'),
        'year' => date('Y'),
    ]);
})->middleware(['auth', 'verified'])->name('user.favourites');

// Compare Listings Route
Route::get('/compare-listings', function () {
    // Get website settings for consistent header/footer. Resolve by the
    // request's domain (tenant sites keep their own logo/branding on these
    // global pages); the default website is only a fallback.
    $resolver = app(\App\Services\Tenancy\TenantResolver::class);
    $website = $resolver->resolve(request()) ?? $resolver->defaultWebsite();

    $websiteData = null;
    if ($website) {
        $websiteData = [
            'id' => $website->id,
            'name' => $website->name,
            'slug' => $website->slug,
            'logo_url' => $website->logo_url,
            'logo_width' => $website->logo_width,
            'logo_height' => $website->logo_height,
            'brand_colors' => $website->getBrandColors(),
            'fonts' => $website->fonts,
            'meta_title' => $website->meta_title,
            'meta_description' => $website->meta_description,
            'favicon_url' => $website->favicon_url,
            'contact_info' => $website->getContactInfo(),
            'social_media' => $website->getSocialMedia(),
            'agent_info' => $website->agentInfo,
        ];
    }

    // Get user favourites with property data
    $favourites = [];
    if (auth()->check()) {
        $favourites = \App\Models\UserPropertyFavourite::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    return Inertia::render('CompareListings', [
        'auth' => [
            'user' => auth()->user()
        ],
        'website' => $websiteData,
        'favourites' => $favourites,
        'siteName' => $website?->name ?? 'Nobu Residences',
        'siteUrl' => $website?->domain ?? config('app.url'),
        'year' => date('Y'),
    ]);
})->name('compare.listings');

// User Alerts Route
Route::get('/user/alerts', function () {
    // Get website settings for consistent header/footer. Resolve by the
    // request's domain (tenant sites keep their own logo/branding on these
    // global pages); the default website is only a fallback.
    $resolver = app(\App\Services\Tenancy\TenantResolver::class);
    $website = $resolver->resolve(request()) ?? $resolver->defaultWebsite();

    $websiteData = null;
    if ($website) {
        $websiteData = [
            'id' => $website->id,
            'name' => $website->name,
            'slug' => $website->slug,
            'logo_url' => $website->logo_url,
            'logo_width' => $website->logo_width,
            'logo_height' => $website->logo_height,
            'brand_colors' => $website->getBrandColors(),
            'fonts' => $website->fonts,
            'meta_title' => $website->meta_title,
            'meta_description' => $website->meta_description,
            'favicon_url' => $website->favicon_url,
            'contact_info' => $website->getContactInfo(),
            'social_media' => $website->getSocialMedia(),
            'agent_info' => $website->agentInfo,
        ];
    }

    return Inertia::render('Website/Pages/UserAlerts', [
        'auth' => [
            'user' => auth()->user()
        ],
        'website' => $websiteData,
        'siteName' => $website?->name ?? 'Nobu Residences',
        'siteUrl' => $website?->domain ?? config('app.url'),
        'year' => date('Y'),
    ]);
})->middleware(['auth', 'verified'])->name('user.alerts');

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

    // User Management routes
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\UserManagementController::class, 'index'])->name('index');
        Route::get('/{user}/edit', [\App\Http\Controllers\Admin\UserManagementController::class, 'edit'])->name('edit');
        Route::put('/{user}', [\App\Http\Controllers\Admin\UserManagementController::class, 'update'])->name('update');
        Route::delete('/{user}', [\App\Http\Controllers\Admin\UserManagementController::class, 'destroy'])->name('destroy');
    });

    // Settings routes
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('index');
        Route::put('/', [\App\Http\Controllers\Admin\SettingsController::class, 'update'])->name('update');
    });

    
    // Real Estate routes
    Route::get('/real-estate/buildings', [RealEstateController::class, 'buildings'])->name('real-estate.buildings');
    Route::get('/real-estate/developers', [RealEstateController::class, 'developers'])->name('real-estate.developers');
    Route::get('/real-estate/schools', [RealEstateController::class, 'schools'])->name('real-estate.schools');
    
    // Building Management routes
    Route::prefix('buildings')->name('buildings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\BuildingController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Admin\BuildingController::class, 'create'])->name('create');
        // CSV import wizard (must be declared before the {buildingSlug} routes)
        Route::get('/import', [\App\Http\Controllers\Admin\BuildingImportController::class, 'show'])->name('import');
        Route::post('/import/upload', [\App\Http\Controllers\Admin\BuildingImportController::class, 'upload'])->name('import.upload');
        Route::post('/import/run', [\App\Http\Controllers\Admin\BuildingImportController::class, 'run'])->name('import.run');
        Route::post('/import/process/{token}', [\App\Http\Controllers\Admin\BuildingImportController::class, 'process'])->name('import.process');
        Route::get('/import/progress/{token}', [\App\Http\Controllers\Admin\BuildingImportController::class, 'progress'])->name('import.progress');
        Route::post('/', [\App\Http\Controllers\Admin\BuildingController::class, 'store'])->name('store');
        Route::post('/bulk-delete', [\App\Http\Controllers\Admin\BuildingController::class, 'bulkDestroy'])->name('bulk-delete');
        Route::get('/{buildingSlug}', [\App\Http\Controllers\Admin\BuildingController::class, 'show'])->name('show');
        Route::get('/{buildingSlug}/edit', [\App\Http\Controllers\Admin\BuildingController::class, 'edit'])->name('edit');
        Route::put('/{buildingSlug}', [\App\Http\Controllers\Admin\BuildingController::class, 'update'])->name('update');
        Route::delete('/{buildingSlug}', [\App\Http\Controllers\Admin\BuildingController::class, 'destroy'])->name('destroy');
    });
    
    // Developer Management routes
    Route::post('api/developers', [\App\Http\Controllers\Admin\DeveloperController::class, 'quickStore'])->name('api.developers.store');
    Route::resource('developers', \App\Http\Controllers\Admin\DeveloperController::class);

    // Condos.ca Developers API proxy (search / auto-match / import) — see
    // DEVELOPERS-API-DOCS.md. Keeps the API key server-side.
    Route::get('api/developers-api/search', [\App\Http\Controllers\Admin\DeveloperApiController::class, 'search'])->name('api.developers-api.search');
    Route::post('api/developers-api/match-building', [\App\Http\Controllers\Admin\DeveloperApiController::class, 'matchBuilding'])->name('api.developers-api.match-building');
    Route::post('api/developers-api/import', [\App\Http\Controllers\Admin\DeveloperApiController::class, 'import'])->name('api.developers-api.import');
    
    // Amenity Management routes
    Route::post('api/amenities', [\App\Http\Controllers\Admin\AmenityController::class, 'quickStore'])->name('api.amenities.store');
    Route::resource('amenities', \App\Http\Controllers\Admin\AmenityController::class);

    // Saved searches / email alert stats
    Route::get('saved-searches', [\App\Http\Controllers\Admin\SavedSearchAdminController::class, 'index'])->name('saved-searches.index');

    // Personalizable email templates (subject/headline/intro with %merge_tags%)
    Route::get('email-templates', [\App\Http\Controllers\Admin\EmailTemplateController::class, 'index'])->name('email-templates.index');
    Route::put('email-templates', [\App\Http\Controllers\Admin\EmailTemplateController::class, 'update'])->name('email-templates.update');

    // Maintenance Fee Amenity Management routes
    Route::post('api/maintenance-fee-amenities', [\App\Http\Controllers\Admin\MaintenanceFeeAmenityController::class, 'quickStore'])->name('api.maintenance-fee-amenities.store');
    Route::resource('maintenance-fee-amenities', \App\Http\Controllers\Admin\MaintenanceFeeAmenityController::class);
    Route::get('api/maintenance-fee-amenities/active', [\App\Http\Controllers\Admin\MaintenanceFeeAmenityController::class, 'getAllActive']);

    // Neighbourhood Taxonomy routes
    Route::resource('neighbourhoods', \App\Http\Controllers\Admin\NeighbourhoodController::class);
    Route::get('api/neighbourhoods', [\App\Http\Controllers\Admin\NeighbourhoodController::class, 'getNeighbourhoods'])->name('api.neighbourhoods');
    Route::post('api/neighbourhoods', [\App\Http\Controllers\Admin\NeighbourhoodController::class, 'quickStore'])->name('api.neighbourhoods.store');

    // Sub-Neighbourhood Taxonomy routes
    Route::resource('sub-neighbourhoods', \App\Http\Controllers\Admin\SubNeighbourhoodController::class);
    Route::get('api/sub-neighbourhoods', [\App\Http\Controllers\Admin\SubNeighbourhoodController::class, 'getSubNeighbourhoods'])->name('api.sub-neighbourhoods');
    Route::post('api/sub-neighbourhoods', [\App\Http\Controllers\Admin\SubNeighbourhoodController::class, 'quickStore'])->name('api.sub-neighbourhoods.store');

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
        Route::get('/{website}/created', [WebsiteManagementController::class, 'created'])->name('created');
        Route::post('/{website}/retry-hostname', [WebsiteManagementController::class, 'retryHostname'])->name('retry-hostname');
        Route::post('/{website}/retry-ai-content', [WebsiteManagementController::class, 'retryAiContent'])->name('retry-ai-content');
        Route::get('/{website}', [WebsiteManagementController::class, 'show'])->name('show');
        Route::get('/{website}/edit', [WebsiteManagementController::class, 'edit'])->name('edit');
        Route::put('/{website}', [WebsiteManagementController::class, 'update'])->name('update');
        Route::delete('/{website}', [WebsiteManagementController::class, 'destroy'])->name('destroy');
        Route::post('/{website}/duplicate', [WebsiteManagementController::class, 'duplicate'])->name('duplicate');
        Route::get('/{website}/edit-home-page', [WebsiteManagementController::class, 'editHomePage'])->name('edit-home-page');
        Route::match(['put', 'post'], '/{website}/update-home-page', [WebsiteManagementController::class, 'updateHomePage'])->name('update-home-page');
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

    // Blog Categories Management routes
    Route::resource('blog-categories', \App\Http\Controllers\Admin\BlogCategoryController::class);
});

require __DIR__.'/auth.php';

// SEO-friendly building URLs - must be at the end to avoid matching admin routes
Route::get('/{city}/{street}/{buildingSlug}', [WebsiteController::class, 'buildingDetail'])
    ->where([
        'city' => '(?!admin|api|mls|login|register|dashboard|profile|user|building|school|storage)[a-z][a-z0-9\-]*',  // Must start with lowercase letter and exclude reserved words
        'street' => '[a-z0-9\-]+',
        'buildingSlug' => '.*'
    ])
    ->name('building-detail-seo');

// New 2-segment SEO building URL: /{city}/{rich-building-slug}
// e.g. /toronto/nobu-residences-15-mercer-st-35-mercer-st
Route::get('/{city}/{buildingSlug}', [WebsiteController::class, 'buildingDetail'])
    ->where([
        'city' => '(?!admin|api|mls|login|register|dashboard|profile|user|building|school|storage|blog|blogs|developer|developers|search|rent|sale|contact|privacy|terms|saved-searches|compare-listings|property)[a-z][a-z\-]*',
        'buildingSlug' => '[a-z0-9\-]+',
    ])
    ->name('building-detail-city-slug');

// Enhanced Property Images API Routes - DISABLED to use PropertyImageController instead
// Route::prefix('api')->group(function () {
// Enhanced image routes removed - using Repliers CDN directly
// });

// Old AMPRE test routes removed - using Repliers API now


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
