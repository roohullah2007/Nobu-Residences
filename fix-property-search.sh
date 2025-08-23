#!/bin/bash

# Fix Images and Property Search Issues
echo "🔧 Fixing property search and image loading issues..."

# Run migrations to add sample properties with proper images
echo "📦 Running migrations..."
php artisan migrate --force

# Clear application cache
echo "🧹 Clearing cache..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize application
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache

echo "✅ Property search and image fixes have been applied!"
echo ""
echo "🏠 Sample properties with proper images have been added to the database"
echo "🖼️  Enhanced image loading with fallbacks and error handling"
echo "🔄 Improved property deduplication to remove duplicates"
echo "💰 Consistent price formatting across all property sources"
echo "📍 Better handling of MLS vs local property data"
echo ""
echo "You can now test the search page at: /search"
