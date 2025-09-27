@echo off
echo Setting up Enhanced Property Search with Ampre API Integration...

echo.
echo 1. Running database migration for saved_searches table...
php artisan migrate

echo.
echo 2. Clearing Laravel caches...
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo.
echo 3. Installing/updating JavaScript dependencies...
npm install

echo.
echo 4. Building assets...
npm run build

echo.
echo =====================================================
echo Enhanced Property Search Setup Complete!
echo =====================================================
echo.
echo Features added:
echo - Real Ampre API integration for property search
echo - Grid, Map, and Mixed view modes
echo - Save search functionality (requires user authentication)
echo - Dynamic filtering and sorting
echo - Property image loading from Ampre API
echo - Mobile responsive search interface
echo.
echo Next steps:
echo 1. Make sure your Ampre API credentials are configured
echo 2. Test the search functionality at /search
echo 3. Users can save searches when logged in
echo.
echo Happy searching!
pause
