<?php

require_once 'vendor/autoload.php';

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Building;
use App\Models\Amenity;

echo "=== Diagnostic: Building Amenities System ===\n\n";

// Check if amenities table exists and has data
$amenitiesCount = Amenity::count();
echo "Total amenities in database: {$amenitiesCount}\n";

if ($amenitiesCount > 0) {
    echo "\nAll amenities:\n";
    $amenities = Amenity::all();
    foreach ($amenities as $amenity) {
        echo "- {$amenity->name} (ID: {$amenity->id})\n";
    }
} else {
    echo "No amenities found! Creating default amenities...\n";
    
    $defaultAmenities = [
        ['name' => 'Concierge', 'icon' => null],
        ['name' => 'Security', 'icon' => null],
        ['name' => 'Elevator', 'icon' => null],
        ['name' => 'Party Room', 'icon' => null],
        ['name' => 'Guest Suite', 'icon' => null],
        ['name' => 'Rooftop Terrace', 'icon' => null],
        ['name' => 'Gym', 'icon' => null],
        ['name' => 'Yoga Studio', 'icon' => null],
        ['name' => 'Spa', 'icon' => null],
        ['name' => 'Sauna', 'icon' => null],
        ['name' => 'Pool', 'icon' => null],
        ['name' => 'Theatre', 'icon' => null],
        ['name' => 'Games Room', 'icon' => null],
        ['name' => 'Library', 'icon' => null],
        ['name' => 'BBQ Area', 'icon' => null],
        ['name' => 'Lounge', 'icon' => null],
        ['name' => 'Business Centre', 'icon' => null],
        ['name' => 'Meeting Room', 'icon' => null],
        ['name' => 'Garden', 'icon' => null],
        ['name' => 'Visitor Parking', 'icon' => null],
    ];
    
    foreach ($defaultAmenities as $amenityData) {
        Amenity::create($amenityData);
        echo "✓ Created amenity: {$amenityData['name']}\n";
    }
    
    echo "\nCreated " . count($defaultAmenities) . " default amenities.\n";
}

// Find the NOBU building
echo "\n=== Checking NOBU Building ===\n";
$building = Building::where('name', 'NOBU Residences Toronto')->first();

if (!$building) {
    echo "NOBU Building not found!\n";
    exit(1);
}

echo "Found building: {$building->name} (ID: {$building->id})\n";

// Check current amenities relationship
$currentAmenities = $building->amenities()->get();
echo "Current amenities from relationship: " . $currentAmenities->count() . "\n";

if ($currentAmenities->count() > 0) {
    foreach ($currentAmenities as $amenity) {
        echo "- {$amenity->name}\n";
    }
} else {
    echo "No amenities attached via relationship.\n";
}

// Check JSON column
$jsonAmenities = $building->amenities ?? [];
echo "Amenities in JSON column: " . count($jsonAmenities) . "\n";

if (count($jsonAmenities) > 0) {
    foreach ($jsonAmenities as $amenity) {
        echo "- " . ($amenity['name'] ?? 'Unknown') . "\n";
    }
} else {
    echo "No amenities in JSON column.\n";
}

// Check pivot table directly
try {
    $pivotCount = DB::table('amenity_building')
        ->where('building_id', $building->id)
        ->count();
    echo "Records in pivot table: {$pivotCount}\n";
} catch (Exception $e) {
    echo "Error checking pivot table: " . $e->getMessage() . "\n";
}

echo "\n=== Fixing Amenities for NOBU ===\n";

// Add luxury amenities appropriate for NOBU
$luxuryAmenityNames = [
    'Concierge',
    'Security',
    'Elevator', 
    'Rooftop Terrace',
    'Gym',
    'Spa',
    'Pool',
    'Lounge',
    'Business Centre',
    'Guest Suite',
    'Theatre',
    'Visitor Parking'
];

$amenityIds = [];
$allAmenities = Amenity::all();

foreach ($luxuryAmenityNames as $amenityName) {
    $amenity = $allAmenities->where('name', $amenityName)->first();
    if ($amenity) {
        $amenityIds[] = $amenity->id;
        echo "✓ Will add: {$amenityName} (ID: {$amenity->id})\n";
    } else {
        echo "✗ Amenity not found: {$amenityName}\n";
    }
}

if (!empty($amenityIds)) {
    echo "\nSyncing " . count($amenityIds) . " amenities...\n";
    
    // Sync amenities in pivot table
    $result = $building->amenities()->sync($amenityIds);
    echo "Sync result - Attached: " . count($result['attached']) . ", Detached: " . count($result['detached']) . "\n";
    
    // Update JSON column
    $amenitiesData = Amenity::whereIn('id', $amenityIds)->get()->map(function($amenity) {
        return [
            'id' => $amenity->id,
            'name' => $amenity->name,
            'icon' => $amenity->icon
        ];
    })->toArray();
    
    $building->update(['amenities' => $amenitiesData]);
    echo "✓ Updated JSON column with " . count($amenitiesData) . " amenities\n";
    
    // Verify the fix
    echo "\n=== Verification ===\n";
    $building->refresh();
    $verifyAmenities = $building->amenities()->get();
    echo "Building now has " . $verifyAmenities->count() . " amenities via relationship:\n";
    foreach ($verifyAmenities as $amenity) {
        echo "- {$amenity->name}\n";
    }
    
    $jsonVerify = $building->amenities ?? [];
    echo "\nJSON column has " . count($jsonVerify) . " amenities:\n";
    foreach ($jsonVerify as $amenity) {
        echo "- " . ($amenity['name'] ?? 'Unknown') . "\n";
    }
    
} else {
    echo "No amenities to sync!\n";
}

echo "\n=== DONE ===\n";
echo "The building edit page should now show the amenities properly.\n";
echo "You may need to refresh the page in your browser.\n";
