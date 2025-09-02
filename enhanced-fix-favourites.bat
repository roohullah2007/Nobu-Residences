@echo off
echo 🔧 Enhanced Fix for Property Favourites Syntax Error...

echo 🛑 Stopping any running dev server...
taskkill /F /IM node.exe >nul 2>&1

echo 🗑️ Cleaning build artifacts...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "public\build" rmdir /s /q "public\build"
if exist "bootstrap\ssr" rmdir /s /q "bootstrap\ssr"

echo 📦 Clearing all caches...
npm cache clean --force
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo 🔧 Running migration...
php artisan migrate --path=database/migrations/2025_09_03_000001_create_user_property_favourites_table.php

echo 🎨 Rebuilding assets...
npm run build

echo ✅ Fix complete! 
echo 🚀 You can now start the dev server with: npm run dev
echo 📱 Or visit the production build at your local server
echo.
echo 🎯 Test these features:
echo    - Heart icons on property cards
echo    - User dropdown with 'My Favourites'
echo    - /user/favourites page (requires login)
echo.
pause
