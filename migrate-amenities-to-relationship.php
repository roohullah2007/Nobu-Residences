<?php

// Script to migrate JSON amenities data to many-to-many relationship
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
use Illuminate\Support\Facades\DB;

echo "=== Migrating JSON Amenities to Relationships ===\n\n";

// First, let's create the standard amenities if they don't exist
$standardAmenities = [
    ['name' => 'Concierge', 'icon' => '/storage/amenity-icons/concierge.svg'],
    ['name' => 'Party Room', 'icon' => '/storage/amenity-icons/party-horn.svg'],
    ['name' => 'Meeting Room', 'icon' => '/storage/amenity-icons/meeting-consider-deliberate-about-meet.svg'],
    ['name' => 'Security Guard', 'icon' => '/storage/amenity-icons/police-security-policeman.svg'],
    ['name' => 'Gym', 'icon' => '/storage/amenity-icons/gym.svg'],
    ['name' => 'Visitor Parking', 'icon' => '/storage/amenity-icons/parking.svg'],
    ['name' => 'Parking Garage', 'icon' => '/storage/amenity-icons/parking-garage-transportation-car-parking.svg'],
    ['name' => 'Guest Suites', 'icon' => '/storage/amenity-icons/bed.svg'],
    ['name' => 'Pet Restriction', 'icon' => '/storage/amenity-icons/pets.svg'],
    ['name' => 'BBQ Permitted', 'icon' => '/storage/amenity-icons/bbq-grill.svg'],
    ['name' => 'Outdoor Pool', 'icon' => '/storage/amenity-icons/pool-ladder.svg'],
    ['name' => 'Media Room', 'icon' => '/storage/amenity-icons/media.svg'],
    ['name' => 'Rooftop Deck', 'icon' => '/storage/amenity-icons/deck-chair-under-the-sun.svg'],
    ['name' => 'Security System', 'icon' => '/storage/amenity-icons/security.svg'],
];

echo "Creating/updating standard amenities...\n";
foreach ($standardAmenities as $amenityData) {
    $amenity = Amenity::firstOrCreate(
        ['name' => $amenityData['name']],
        ['icon' => $amenityData['icon']]
    );
    echo "- {$amenity->name}\n";
}

echo "\nProcessing buildings with JSON amenities...\n";

$buildings = Building::whereNotNull('amenities')
    ->where('amenities', '!=', '[]')
    ->where('amenities', '!=', 'null')
    ->get();

echo "Found " . $buildings->count() . " buildings with JSON amenities\n\n";

foreach ($buildings as $building) {
    echo "Processing building: {$building->name}\n";
    
    // Get the JSON amenities
    $jsonAmenities = $building->amenities;
    
    if (is_array($jsonAmenities) && count($jsonAmenities) > 0) {
        echo "  Found " . count($jsonAmenities) . " amenities in JSON field\n";
        
        // Clear existing relationships
        $building->amenities()->detach();
        
        foreach ($jsonAmenities as $amenityData) {
            if (is_array($amenityData) && isset($amenityData['name'])) {
                $amenityName = $amenityData['name'];
                $amenityIcon = $amenityData['icon'] ?? null;
                
                // Find or create the amenity
                $amenity = Amenity::firstOrCreate(
                    ['name' => $amenityName],
                    ['icon' => $amenityIcon]
                );
                
                // Attach to building
                $building->amenities()->attach($amenity->id);
                echo "    - Added: {$amenityName}\n";
            } elseif (is_string($amenityData)) {
                // Handle simple string amenities
                $amenity = Amenity::firstOrCreate(
                    ['name' => $amenityData],
                    ['icon' => '/storage/amenity-icons/default.svg']
                );
                
                $building->amenities()->attach($amenity->id);
                echo "    - Added: {$amenityData}\n";
            }
        }
        
        // Verify the relationships
        $relationshipCount = $building->amenities()->count();
        echo "  Verified: {$relationshipCount} amenities now in relationship\n";
        
    } else {
        echo "  No valid amenities found in JSON field\n";
    }
    
    echo "\n";
}

// Special handling for NOBU building
echo "=== Special handling for NOBU Residences ===\n";
$nobuBuilding = Building::where('name', 'LIKE', '%NOBU%')
    ->orWhere('address', 'LIKE', '%15 Mercer%')
    ->first();

if ($nobuBuilding) {
    echo "Found NOBU building: {$nobuBuilding->name}\n";
    
    // Clear existing relationships
    $nobuBuilding->amenities()->detach();
    
    // Add the amenities shown in your image
    $nobuAmenities = [
        'Concierge',
        'Party Room', 
        'Meeting Room',
        'Security Guard',
        'Gym',
        'Visitor Parking',
        'Parking Garage',
        'Guest Suites',
        'Pet Restriction',
        'BBQ Permitted',
        'Outdoor Pool',
        'Media Room',
        'Rooftop Deck',
        'Security System'
    ];
    
    foreach ($nobuAmenities as $amenityName) {
        $amenity = Amenity::where('name', $amenityName)->first();
        if ($amenity) {
            $nobuBuilding->amenities()->attach($amenity->id);
            echo "- Associated: {$amenityName}\n";
        } else {
            echo "- Warning: Amenity '{$amenityName}' not found\n";
        }
    }
    
    echo "NOBU building now has " . $nobuBuilding->amenities()->count() . " amenities\n";
} else {
    echo "NOBU building not found\n";
}

echo "\n=== Migration Complete ===\n";
echo "All buildings should now have their amenities in the many-to-many relationship table.\n";
echo "You can now use the relationship methods instead of the JSON field.\n";
