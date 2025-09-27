@echo off
echo 🔧 Quick Fix for Property Favourites Import Error...

echo 📦 Clearing npm cache...
npm cache clean --force

echo 🧹 Clearing Laravel caches...
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo 🎨 Rebuilding assets...
npm run build

echo ✅ Quick fix complete! Try refreshing your browser.
pause
