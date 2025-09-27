@echo off
echo 🔒 Setting up Address Protection System...
echo =====================================

echo.
echo 1. Clearing application cache...
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

echo.
echo 2. Running database migrations...
php artisan migrate --force

echo.
echo 3. Seeding sample properties with address protection...
php artisan db:seed --class=PropertySeeder --force

echo.
echo 4. Testing address protection functionality...
php test-masking.php

echo.
echo 5. Final cache clear...
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo.
echo ✅ Address Protection System Setup Complete!
echo ===========================================
echo.
echo 🌐 Available Routes:
echo   - /agent/properties (Protected property listings)
echo   - /agent/properties/{id} (Individual property with protection)
echo.
echo 🔧 Test Accounts (if using sample data):
echo   - Agent 1: agent@example.com (password: password)
echo   - Agent 2: sarah@realestate.com (password: password)
echo.
echo 🛡️ Protection Features Active:
echo   ✓ Address masking (street numbers hidden)
echo   ✓ Postal code partial masking  
echo   ✓ Approximate coordinates (±1km)
echo   ✓ Agent contact protection
echo   ✓ Property owner bypass
echo   ✓ Purchase-based access control
echo   ✓ Session and user tracking
echo   ✓ 30-day access expiration
echo.
echo 📖 See ADDRESS_PROTECTION_GUIDE.md for detailed documentation
echo.
echo ⚠️  Note: If you're logged in as the property owner, you'll see full details.
echo    Log out or view a property you don't own to see the protection in action.
echo.
pause
