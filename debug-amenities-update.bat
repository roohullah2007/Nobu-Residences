@echo off
echo ================================================
echo    AMENITIES UPDATE DEBUGGING SCRIPT
echo ================================================
echo.

echo Step 1: Check current NOBU building amenities...
php -r "
require 'vendor/autoload.php';
\$app = require 'bootstrap/app.php';
\$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

echo 'Current NOBU Building Amenities:' . PHP_EOL;
\$nobu = App\\Models\\Building::with('amenities')->where('name', 'LIKE', '%NOBU%')->first();
if (\$nobu) {
    echo 'Building: ' . \$nobu->name . PHP_EOL;
    echo 'Amenities count: ' . \$nobu->amenities->count() . PHP_EOL;
    foreach (\$nobu->amenities as \$amenity) {
        echo '  - ' . \$amenity->name . ' (ID: ' . \$amenity->id . ')' . PHP_EOL;
    }
} else {
    echo 'NOBU building not found' . PHP_EOL;
}
"

echo.
echo Step 2: Clear all caches...
php artisan cache:clear
php artisan view:clear  
php artisan config:clear

echo.
echo ================================================
echo             DEBUGGING READY
echo ================================================
echo.
echo Now try to update the building in the admin panel:
echo 1. Go to: http://127.0.0.1:8000/admin/buildings/nobu-residences-toronto-891aa08a-8267-4987-b47a-bff4cb493290/edit
echo 2. Remove some amenities 
echo 3. Click "Update Building"
echo 4. Check the browser console for debug logs
echo 5. Check Laravel logs: storage/logs/laravel.log
echo.
echo Expected console logs:
echo - "Amenity toggled:" when you remove amenities
echo - "Form Submission ===" when you click update
echo - "Final form data being sent:" with amenity_ids array
echo.
pause
