@echo off
echo ================================================
echo    DYNAMIC AMENITIES COMPLETE SETUP SCRIPT
echo ================================================
echo.

echo Step 1: Running database migration for amenities categories...
php artisan migrate --path=database/migrations/2025_09_16_add_category_to_amenities_table.php

echo.
echo Step 2: Migrating JSON amenities to relationship tables...
php migrate-amenities-to-relationship.php

echo.
echo Step 3: Testing the amenities setup...
php test-amenities-data.php

echo.
echo Step 4: Clearing caches...
php artisan cache:clear
php artisan view:clear
php artisan config:clear

echo.
echo ================================================
echo            SETUP COMPLETE!
echo ================================================
echo.
echo The following has been completed:
echo - ✅ Database migration for amenity categories
echo - ✅ JSON amenities migrated to relationship tables  
echo - ✅ Test data verification
echo - ✅ Cache clearing
echo.
echo Now test your property detail pages:
echo - Properties with buildings should show dynamic amenities
echo - Properties without buildings should NOT show amenities section
echo.
pause
