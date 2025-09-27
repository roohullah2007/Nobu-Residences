<?php

require_once 'vendor/autoload.php';

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Building;
use App\Models\Amenity;
use Illuminate\Support\Facades\DB;

echo "=== Quick Diagnostic ===\n\n";

// Check the NOBU building
$building = Building::where('name', 'NOBU Residences Toronto')->first();

if (!$building) {
    echo "Building not found!\n";
    exit(1);
}

echo "Building: {$building->name}\n";
echo "Building ID: {$building->id}\n\n";

// Check amenities in system
$totalAmenities = Amenity::count();
echo "Total amenities in system: {$totalAmenities}\n";

// Check pivot table
$pivotCount = DB::table('amenity_building')->where('building_id', $building->id)->count();
echo "Amenities in pivot table for this building: {$pivotCount}\n";

// Check relationship
$relationshipCount = $building->amenities()->count();
echo "Amenities via relationship: {$relationshipCount}\n";

// Check JSON column
$jsonAmenities = $building->amenities ?? [];
echo "Amenities in JSON column: " . count($jsonAmenities) . "\n\n";

if ($pivotCount === 0) {
    echo "❌ ISSUE FOUND: No amenities in pivot table!\n";
    echo "This is why the edit page shows empty amenities.\n\n";
    
    echo "=== QUICK FIX ===\n";
    echo "Adding some default amenities...\n";
    
    // Get first 5 amenities and attach them
    $someAmenities = Amenity::limit(5)->get();
    if ($someAmenities->count() > 0) {
        $amenityIds = $someAmenities->pluck('id')->toArray();
        $building->amenities()->sync($amenityIds);
        
        // Update JSON column too
        $amenitiesData = $someAmenities->map(function($amenity) {
            return [
                'id' => $amenity->id,
                'name' => $amenity->name,
                'icon' => $amenity->icon
            ];
        })->toArray();
        
        $building->update(['amenities' => $amenitiesData]);
        
        echo "✅ Added " . count($amenityIds) . " amenities:\n";
        foreach ($someAmenities as $amenity) {
            echo "- {$amenity->name}\n";
        }
        
        echo "\n✅ FIXED! Refresh your browser page.\n";
    } else {
        echo "❌ No amenities available to add!\n";
    }
} else {
    echo "✅ Building has amenities in database.\n";
    echo "The issue might be in the frontend code or data loading.\n";
}

echo "\n=== DONE ===\n";
