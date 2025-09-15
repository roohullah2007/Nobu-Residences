@echo off
echo ================================================
echo     EMERGENCY AMENITIES FIX - Remove JSON Column
echo ================================================
echo.

echo Step 1: Backup current data...
php -r "
require 'vendor/autoload.php';
\$app = require 'bootstrap/app.php';
\$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

echo 'Backing up NOBU amenities relationship data...' . PHP_EOL;
\$nobu = App\\Models\\Building::find('891aa08a-8267-4987-b47a-bff4cb493290');
if (\$nobu) {
    \$relationshipAmenities = \$nobu->amenities()->get();
    echo 'NOBU relationship amenities: ' . \$relationshipAmenities->count() . PHP_EOL;
    file_put_contents('nobu_amenities_backup.json', \$relationshipAmenities->toJson());
    echo 'Backup saved to nobu_amenities_backup.json' . PHP_EOL;
}
"

echo.
echo Step 2: Drop the JSON amenities column...
php artisan migrate --path=database/migrations/2025_09_16_remove_amenities_json_column.php

echo.
echo Step 3: Clear all caches...
php artisan cache:clear
php artisan view:clear
php artisan config:clear

echo.
echo Step 4: Verify the fix...
php -r "
require 'vendor/autoload.php';
\$app = require 'bootstrap/app.php';
\$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

echo 'Testing NOBU building after JSON column removal...' . PHP_EOL;
\$nobu = App\\Models\\Building::with('amenities')->find('891aa08a-8267-4987-b47a-bff4cb493290');
if (\$nobu) {
    echo 'Building: ' . \$nobu->name . PHP_EOL;
    try {
        echo 'Relationship amenities: ' . \$nobu->amenities->count() . PHP_EOL;
        if (\$nobu->amenities->count() > 0) {
            echo 'First amenity: ' . \$nobu->amenities->first()->name . PHP_EOL;
        }
    } catch (Exception \$e) {
        echo 'Error: ' . \$e->getMessage() . PHP_EOL;
    }
    
    // Test getDisplayData
    echo 'Testing getDisplayData method...' . PHP_EOL;
    try {
        \$displayData = \$nobu->getDisplayData();
        echo 'DisplayData amenities: ' . count(\$displayData['amenities'] ?? []) . PHP_EOL;
    } catch (Exception \$e) {
        echo 'DisplayData error: ' . \$e->getMessage() . PHP_EOL;
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
echo The JSON amenities column has been removed.
echo Now only relationship data will be used.
echo Test the admin panel and frontend again.
echo.
pause
