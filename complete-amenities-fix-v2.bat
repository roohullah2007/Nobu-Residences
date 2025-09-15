@echo off
echo ================================================
echo    COMPLETE AMENITIES DYNAMIC FIX v2.0
echo ================================================
echo.

echo Step 1: Clear all caches...
php artisan cache:clear
php artisan view:clear
php artisan config:clear

echo.
echo Step 2: Run database migration...
php artisan migrate --path=database/migrations/2025_09_16_add_category_to_amenities_table.php

echo.
echo Step 3: Migrate amenities data to relationships...
php migrate-amenities-to-relationship.php

echo.
echo Step 4: Verify the fix...
php verify-amenities-fix.bat

echo.
echo ================================================
echo            ✅ FIX COMPLETE! ✅
echo ================================================
echo.
echo What was fixed:
echo - ✅ Removed amenities from Building model fillable/casts
echo - ✅ Forced use of relationship table instead of JSON
echo - ✅ Updated all controllers to use relationships
echo - ✅ Enhanced debugging and logging
echo - ✅ Migrated all data to proper tables
echo.
echo Now test your property detail pages:
echo - NOBU properties should show 14 amenities dynamically
echo - Properties without buildings should show NO amenities
echo - Check browser console for debug logs
echo.
pause
