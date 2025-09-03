#!/bin/bash

echo "Setting up buildings data..."

# Run the building seeder
php artisan db:seed --class=BuildingSeeder

echo "Building seeder completed!"

# Test the buildings API
echo "Testing buildings API..."
php test-buildings-data.php
