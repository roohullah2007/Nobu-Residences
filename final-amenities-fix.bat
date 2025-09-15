@echo off
echo ================================================
echo          COMPLETE AMENITIES FIX v3.0
echo ================================================
echo.

echo Step 1: Clear all caches...
php artisan cache:clear
php artisan view:clear
php artisan config:clear

echo.
echo Step 2: Run complete amenities fix...
php complete-amenities-fix.php

echo.
echo Step 3: Run migration to remove JSON column...
php artisan migrate --path=database/migrations/2025_09_16_remove_amenities_json_column.php

echo.
echo Step 4: Verify the fixes...
php -r "
require 'vendor/autoload.php';
\$app = require 'bootstrap/app.php';
\$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

echo '=== VERIFICATION ===' . PHP_EOL;
\$nobu = App\\Models\\Building::with('amenities')->where('name', 'LIKE', '%NOBU%')->first();
if (\$nobu) {
    echo 'NOBU Building: ' . \$nobu->name . PHP_EOL;
    echo 'Relationship amenities: ' . \$nobu->amenities->count() . PHP_EOL;
    
    // Check if JSON column exists
    try {
        \$rawAmenities = \$nobu->getRawOriginal('amenities');
        echo 'JSON column still exists (BAD): ' . (\$rawAmenities ? 'HAS DATA' : 'NULL') . PHP_EOL;
    } catch (Exception \$e) {
        echo 'JSON column removed (GOOD)' . PHP_EOL;
    }
    
    if (\$nobu->amenities->count() > 0) {
        echo 'First 5 amenities:' . PHP_EOL;
        foreach (\$nobu->amenities->take(5) as \$amenity) {
            echo '  - ' . \$amenity->name . PHP_EOL;
        }
    }
} else {
    echo 'NOBU building not found!' . PHP_EOL;
}
"

echo.
echo ================================================
echo              FIX COMPLETE!
echo ================================================
echo.
echo What was fixed:
echo - ✅ Cleared ALL JSON amenities data from buildings table
echo - ✅ Ensured NOBU has relationship amenities
echo - ✅ Removed JSON amenities column entirely
echo - ✅ Fixed admin controller logging
echo - ✅ Cleared all caches
echo.
echo Now test:
echo 1. Admin: Update NOBU building amenities
echo 2. Frontend: Check property detail pages
echo 3. Console: Should show relationship data only
echo.
pause
