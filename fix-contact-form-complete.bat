#!/bin/bash

echo "=============================================="
echo "CONTACT FORM COMPLETE FIX SCRIPT"
echo "=============================================="

echo "Step 1: Running database migrations..."
php artisan migrate --force

echo "Step 2: Clearing all caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "Step 3: Optimizing application..."
php artisan config:cache
php artisan route:cache

echo "Step 4: Testing contact form setup..."
php test-contact-form.php

echo ""
echo "=============================================="
echo "CONTACT FORM FIX COMPLETED!"
echo "=============================================="
echo ""
echo "The contact form has been debugged and fixed with:"
echo "- Simplified React component with console logging"
echo "- Proper form validation and error handling"
echo "- Fixed database migrations"
echo "- Improved controller with better error responses"
echo "- Added debugging output for troubleshooting"
echo ""
echo "TO TEST THE FORM:"
echo "1. Open your website homepage"
echo "2. Press F12 to open developer tools"
echo "3. Go to Console tab"
echo "4. Try submitting the contact form"
echo "5. Watch console for debug messages"
echo ""
echo "IF FORM STILL NOT WORKING:"
echo "1. Check browser console for errors"
echo "2. Check Network tab for failed requests"
echo "3. Check Laravel logs: tail -f storage/logs/laravel.log"
echo "4. Ensure your .env database settings are correct"
echo ""
echo "Admin panel: /admin/contacts (after successful submissions)"
echo "=============================================="
