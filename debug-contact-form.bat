#!/bin/bash

echo "Running Contact Form Debug and Fix..."

# Run the migration first
echo "1. Running database migration..."
php artisan migrate --force

# Clear all caches
echo "2. Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild the routes for JavaScript
echo "3. Rebuilding routes..."
php artisan route:cache

echo "4. Contact Form Debug Complete!"
echo ""
echo "If the form is still not working, check:"
echo "- Browser console for JavaScript errors"
echo "- Network tab for failed requests"
echo "- Laravel logs in storage/logs/"
