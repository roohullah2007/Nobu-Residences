<?php

// Test script to check amenities data in the database
require_once 'vendor/autoload.php';

// Load environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Set up Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Building;
use App\Models\Amenity;

echo "=== Testing Amenities Data ===\n\n";

// Check if amenities table has data
$amenitiesCount = Amenity::count();
echo "Total amenities in database: {$amenitiesCount}\n\n";

if ($amenitiesCount > 0) {
    echo "First 10 amenities:\n";
    $amenities = Amenity::take(10)->get();
    foreach ($amenities as $amenity) {
        echo "- {$amenity->name} (Icon: {$amenity->icon})\n";
    }
    echo "\n";
}

// Check buildings and their amenities
$buildingsCount = Building::count();
echo "Total buildings in database: {$buildingsCount}\n\n";

if ($buildingsCount > 0) {
    echo "Buildings with amenities:\n";
    $buildings = Building::with('amenities')->get();
    
    foreach ($buildings as $building) {
        // Force use of relationship by calling the amenities() method
        $relationshipAmenities = $building->amenities;
        $jsonAmenities = $building->getRawOriginal('amenities') ? json_decode($building->getRawOriginal('amenities'), true) : [];
        
        // Check relationship first (this is what we want to use)
        if ($relationshipAmenities instanceof \Illuminate\Database\Eloquent\Collection) {
            $amenitiesCount = $relationshipAmenities->count();
            echo "- {$building->name}: {$amenitiesCount} amenities (from relationship)\n";
            
            if ($amenitiesCount > 0) {
                foreach ($relationshipAmenities as $amenity) {
                    echo "  * {$amenity->name} (Icon: {$amenity->icon})\n";
                }
            } else {
                echo "  No amenities in relationship table\n";
            }
        }
        
        // Also show JSON data for comparison (but we don't want to use this)
        if (is_array($jsonAmenities) && count($jsonAmenities) > 0) {
            echo "  [Legacy JSON]: " . count($jsonAmenities) . " amenities (DEPRECATED - should migrate to relationship)\n";
        }
        
        echo "\n";
    }
}

// Check NOBU Residences specifically
echo "=== NOBU Residences Building ===\n";
$nobuBuilding = Building::with('amenities')
    ->where('name', 'LIKE', '%NOBU%')
    ->orWhere('address', 'LIKE', '%15 Mercer%')
    ->first();

if ($nobuBuilding) {
    echo "Found NOBU building: {$nobuBuilding->name}\n";
    echo "Address: {$nobuBuilding->address}\n";
    
    // Force use of relationship
    $relationshipAmenities = $nobuBuilding->amenities;
    $jsonAmenities = $nobuBuilding->getRawOriginal('amenities') ? json_decode($nobuBuilding->getRawOriginal('amenities'), true) : [];
    
    // Check relationship amenities (this is what we want)
    if ($relationshipAmenities instanceof \Illuminate\Database\Eloquent\Collection) {
        echo "Amenities count (from relationship): " . $relationshipAmenities->count() . "\n";
        
        if ($relationshipAmenities->count() > 0) {
            echo "Amenities (from relationship - ACTIVE):\n";
            foreach ($relationshipAmenities as $amenity) {
                echo "- {$amenity->name} (Icon: {$amenity->icon})\n";
            }
        } else {
            echo "No amenities in relationship table.\n";
        }
    }
    
    // Show JSON data for comparison
    if (is_array($jsonAmenities) && count($jsonAmenities) > 0) {
        echo "\n[Legacy JSON data]: " . count($jsonAmenities) . " amenities (DEPRECATED)\n";
    }
} else {
    echo "NOBU building not found.\n";
}

echo "\n=== Test Complete ===\n";
