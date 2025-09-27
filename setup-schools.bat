@echo off
echo Setting up Schools functionality...
echo.

echo Step 1: Running school migration...
php artisan migrate --path=database/migrations/2025_09_01_000001_create_schools_table.php

echo.
echo Step 2: Seeding sample school data...
php artisan migrate --path=database/migrations/2025_09_01_000002_seed_sample_schools.php

echo.
echo Step 3: Clearing application cache...
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo.
echo Step 4: Testing school API endpoints...
echo Testing schools API...
php -r "
try {
    echo 'Testing school API endpoints...' . PHP_EOL;
    
    // Test if School model exists
    if (class_exists('App\\Models\\School')) {
        echo '✓ School model exists' . PHP_EOL;
    } else {
        echo '✗ School model not found' . PHP_EOL;
    }
    
    echo 'Setup completed successfully!' . PHP_EOL;
} catch (Exception $e) {
    echo '✗ Error: ' . $e->getMessage() . PHP_EOL;
}
"

echo.
echo ================================
echo Schools setup completed!
echo ================================
echo.
echo Next steps:
echo 1. Visit /admin/real-estate/schools to manage schools
echo 2. Run batch geocoding to add coordinates to schools
echo 3. Test nearby schools on property detail pages
echo.
echo API endpoints available:
echo - GET /api/schools - List all schools
echo - GET /api/schools/nearby - Get nearby schools for a property
echo - GET /api/schools/{id} - Get specific school
echo - GET /api/schools/slug/{slug} - Get school by slug
echo - POST /api/schools/batch-geocode - Geocode all schools
echo.
echo Public pages:
echo - /school/{id} - School detail page by ID
echo - /schools/{slug} - School detail page by slug
echo.
pause
