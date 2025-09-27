@echo off
echo Setting up buildings for search page...

echo.
echo Step 1: Running building seeder...
php artisan db:seed --class=BuildingSeeder

echo.
echo Step 2: Running developer seeder (needed for buildings)...
php artisan db:seed --class=DeveloperSeeder

echo.
echo Step 3: Testing buildings data...
php test-buildings-data.php

echo.
echo Step 4: Testing search page...
echo Open your browser to: http://127.0.0.1:8000/search?tab=buildings

pause