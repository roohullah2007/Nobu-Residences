@echo off
echo ========================================
echo    QUICK AMENITIES VERIFICATION
echo ========================================
echo.

echo Step 1: Clear all caches to ensure fresh data...
php artisan cache:clear
php artisan view:clear
php artisan config:clear

echo.
echo Step 2: Test the amenities data...
php test-amenities-data.php

echo.
echo Step 3: Quick building check...
php -r "
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo 'NOBU Building Amenities Check:' . PHP_EOL;
\$nobu = App\Models\Building::with('amenities')->where('name', 'LIKE', '%NOBU%')->first();
if (\$nobu) {
    echo 'Building: ' . \$nobu->name . PHP_EOL;
    echo 'Relationship amenities: ' . \$nobu->amenities->count() . PHP_EOL;
    echo 'JSON field check: ' . (empty(\$nobu->getRawOriginal('amenities')) ? 'No JSON data' : 'Has JSON data') . PHP_EOL;
    if (\$nobu->amenities->count() > 0) {
        echo 'First amenity: ' . \$nobu->amenities->first()->name . PHP_EOL;
    }
} else {
    echo 'NOBU building not found' . PHP_EOL;
}
"

echo.
echo ========================================
echo    VERIFICATION COMPLETE
echo ========================================
echo.
pause
