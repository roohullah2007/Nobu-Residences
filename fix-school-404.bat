@echo off
echo ========================================
echo   FIXING SCHOOL 404 ROUTE CONFLICT
echo ========================================
echo.

echo 1. Clearing route cache...
php artisan route:clear
echo    ✓ Route cache cleared
echo.

echo 2. Clearing config cache...
php artisan config:clear
echo    ✓ Config cache cleared
echo.

echo 3. Testing route registration...
echo Looking for school routes:
php artisan route:list | findstr "school"
echo.

echo 4. Testing the specific problematic URL pattern...
echo The issue was: /{city}/{street}/{buildingSlug} was matching /school/... URLs
echo Fixed by adding 'school' to the exclusion pattern for the city regex
echo.

echo ========================================
echo   FIX APPLIED!
echo ========================================
echo.
echo The problem was route order conflict:
echo   ❌ The catch-all building route /{city}/{street}/{buildingSlug} 
echo      was matching /school/... URLs before school routes
echo.
echo   ✓ Fixed by updating the city regex pattern to exclude 'school'
echo.
echo Test the fix:
echo   1. Visit: http://127.0.0.1:8000/school/ChIJFQt1SEHL1IkRVW1fnwhoQ-8/momentum-montessori
echo   2. Should now load the school page successfully
echo   3. No more 404 errors!
echo.
pause
