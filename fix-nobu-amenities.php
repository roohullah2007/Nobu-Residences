<?php

require_once 'vendor/autoload.php';

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Building;
use App\Models\Amenity;

echo "=== Fixing NOBU Residences Amenities ===\n\n";

// Find the NOBU building
$building = Building::where('name', 'NOBU Residences Toronto')->first();

if (!$building) {
    echo "Building not found!\n";
    exit(1);
}

echo "Found building: {$building->name} (ID: {$building->id})\n";

// Get current amenities
$currentAmenities = $building->amenities()->get();
echo "Current amenities count: " . $currentAmenities->count() . "\n";

// Get all available amenities
$allAmenities = Amenity::all();
echo "Total available amenities: " . $allAmenities->count() . "\n\n";

// List all available amenities
echo "Available amenities:\n";
foreach ($allAmenities as $amenity) {
    echo "- {$amenity->name} (ID: {$amenity->id})\n";
}

echo "\n=== FIXING AMENITIES ===\n";

// Let's add some luxury amenities that would be appropriate for NOBU Residences
$luxuryAmenities = [
    'Concierge',
    'Security', 
    'Elevator',
    'Rooftop Terrace',
    'Gym',
    'Spa',
    'Pool',
    'Lounge',
    'Business Centre',
    'Visitor Parking'
];

$amenityIds = [];

foreach ($luxuryAmenities as $amenityName) {
    $amenity = $allAmenities->where('name', $amenityName)->first();
    if ($amenity) {
        $amenityIds[] = $amenity->id;
        echo "✓ Found amenity: {$amenityName}\n";
    } else {
        echo "✗ Amenity not found: {$amenityName}\n";
    }
}

if (!empty($amenityIds)) {
    echo "\nAttaching " . count($amenityIds) . " amenities to building...\n";
    
    // Attach amenities to the building
    $building->amenities()->sync($amenityIds);
    
    // Also update the JSON column
    $amenitiesData = Amenity::whereIn('id', $amenityIds)->get()->map(function($amenity) {
        return [
            'id' => $amenity->id,
            'name' => $amenity->name,
            'icon' => $amenity->icon
        ];
    })->toArray();
    
    $building->update(['amenities' => $amenitiesData]);
    
    echo "✓ Successfully attached amenities!\n";
    echo "✓ Updated JSON column!\n";
    
    // Verify the changes
    $verifyAmenities = $building->amenities()->get();
    echo "\nVerification: Building now has " . $verifyAmenities->count() . " amenities:\n";
    foreach ($verifyAmenities as $amenity) {
        echo "- {$amenity->name}\n";
    }
} else {
    echo "No amenities to attach!\n";
}

echo "\n=== DONE ===\n";
