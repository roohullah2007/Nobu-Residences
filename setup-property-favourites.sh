#!/bin/bash

# Property Favourites Setup Script
echo "🚀 Setting up Property Favourites feature..."

# Run the migration
echo "📊 Running database migration..."
php artisan migrate --path=database/migrations/2025_09_03_000001_create_user_property_favourites_table.php

# Clear route cache
echo "🔄 Clearing route cache..."
php artisan route:clear

# Clear config cache
echo "⚙️ Clearing config cache..."
php artisan config:clear

# Build frontend assets
echo "🎨 Building frontend assets..."
npm run build

echo "✅ Property Favourites feature setup complete!"
echo "🔗 New routes available:"
echo "   - /user/favourites (User favourites page)"
echo "   - /api/favourites/properties/* (API endpoints)"
echo ""
echo "📝 Features added:"
echo "   - Heart icon on all property cards"
echo "   - Favourite/unfavourite functionality"
echo "   - Authentication prompts for non-logged users"
echo "   - User favourites dashboard"
echo "   - Favourites link in user dropdown menu"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the migration: Check if 'user_property_favourites' table was created"
echo "   2. Test favourite functionality on property cards"
echo "   3. Test favourites page at /user/favourites"
echo "   4. Verify authentication prompts work for non-logged users"
