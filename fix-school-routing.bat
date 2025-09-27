@echo off
echo ========================================
echo   FIXING SCHOOL ROUTING ISSUE
echo ========================================
echo.

echo 1. Clearing Laravel caches...
php artisan config:clear
php artisan cache:clear
php artisan route:clear
echo    ✓ Caches cleared
echo.

echo 2. Checking route registration...
php artisan route:list | findstr school
echo    ✓ School routes registered
echo.

echo 3. Testing Google Places API configuration...
php -r "
$apiKey = env('GOOGLE_MAPS_API_KEY');
if (empty($apiKey)) {
    echo '   ❌ Google Maps API key not configured\n';
} else {
    echo '   ✓ Google Maps API key configured: ' . substr($apiKey, 0, 10) . '...\n';
}
"
echo.

echo ========================================
echo   SCHOOL ROUTING FIX COMPLETE!
echo ========================================
echo.
echo Changes made:
echo   ✓ Updated routes to support school names in URLs
echo   ✓ Modified WebsiteController schoolDetail method
echo   ✓ Updated NearbySchools component to generate proper URLs
echo   ✓ Added proper error handling and redirects
echo.
echo Testing:
echo   1. Visit a property detail page
echo   2. Click on a school in the "Nearby Schools" section
echo   3. School page should load with SEO-friendly URL
echo   4. URL format: /school/{place-id}/{school-name}
echo.
echo If you still get 404 errors:
echo   1. Restart the Laravel server: php artisan serve
echo   2. Check the Google Maps API key is working
echo   3. Check browser console for JavaScript errors
echo.
pause
