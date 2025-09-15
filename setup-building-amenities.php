<?php

// Script to populate building amenities data
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

echo "=== Populating Building Amenities ===\n\n";

// First, create amenities if they don't exist
$amenities = [
    ['name' => 'Concierge', 'icon' => 'concierge.svg'],
    ['name' => 'Party Room', 'icon' => 'party-horn.svg'],
    ['name' => 'Meeting Room', 'icon' => 'meeting-consider-deliberate-about-meet.svg'],
    ['name' => 'Security Guard', 'icon' => 'police-security-policeman.svg'],
    ['name' => 'Gym', 'icon' => 'gym.svg'],
    ['name' => 'Visitor Parking', 'icon' => 'parking.svg'],
    ['name' => 'Parking Garage', 'icon' => 'parking-garage-transportation-car-parking.svg'],
    ['name' => 'Guest Suites', 'icon' => 'bed.svg'],
    ['name' => 'Pet Restriction', 'icon' => 'pets.svg'],
    ['name' => 'BBQ Permitted', 'icon' => 'bbq-grill.svg'],
    ['name' => 'Outdoor Pool', 'icon' => 'pool-ladder.svg'],
    ['name' => 'Media Room', 'icon' => 'media.svg'],
    ['name' => 'Rooftop Deck', 'icon' => 'deck-chair-under-the-sun.svg'],
    ['name' => 'Security System', 'icon' => 'security.svg'],
    ['name' => 'Hydro', 'icon' => 'hydro.svg'],
    ['name' => 'Water', 'icon' => 'water.svg'],
    ['name' => 'Parking', 'icon' => 'parking.svg'],
    ['name' => 'Cable', 'icon' => 'cable.svg'],
    ['name' => 'Heat', 'icon' => 'heat.svg'],
];

echo "Creating amenities...\n";
$createdAmenities = [];

foreach ($amenities as $amenityData) {
    $amenity = Amenity::firstOrCreate(
        ['name' => $amenityData['name']],
        ['icon' => $amenityData['icon']]
    );
    
    $createdAmenities[$amenity->name] = $amenity;
    echo "- {$amenity->name} (ID: {$amenity->id})\n";
}

echo "\nLooking for NOBU Residences building...\n";

// Find NOBU Residences building
$nobuBuilding = Building::where('name', 'LIKE', '%NOBU%')
    ->orWhere('address', 'LIKE', '%15 Mercer%')
    ->first();

if (!$nobuBuilding) {
    echo "NOBU building not found. Creating it...\n";
    
    $nobuBuilding = Building::create([
        'name' => 'NOBU Residences Toronto',
        'address' => '15 Mercer Street',
        'city' => 'Toronto',
        'province' => 'ON',
        'postal_code' => 'M5V 3M8',
        'country' => 'Canada',
        'building_type' => 'Residential',
        'year_built' => 2022,
        'status' => 'active',
        'listing_type' => 'condo',
        'total_units' => 17,
        'units_for_sale' => 11,
        'units_for_rent' => 6,
        'description' => 'NOBU Residences Toronto offers luxury living in the heart of downtown Toronto.',
    ]);
    
    echo "Created NOBU building with ID: {$nobuBuilding->id}\n";
} else {
    echo "Found NOBU building: {$nobuBuilding->name} (ID: {$nobuBuilding->id})\n";
}

// Associate amenities with NOBU building (based on the images you provided)
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

echo "\nAssociating amenities with NOBU building...\n";

// Clear existing amenities first
$nobuBuilding->amenities()->detach();

foreach ($nobuAmenities as $amenityName) {
    if (isset($createdAmenities[$amenityName])) {
        $amenity = $createdAmenities[$amenityName];
        $nobuBuilding->amenities()->attach($amenity->id);
        echo "- Associated: {$amenityName}\n";
    } else {
        echo "- Warning: Amenity '{$amenityName}' not found\n";
    }
}

// Verify the associations
$nobuBuilding->load('amenities');
echo "\nFinal verification:\n";
echo "NOBU building now has " . $nobuBuilding->amenities->count() . " amenities:\n";

foreach ($nobuBuilding->amenities as $amenity) {
    echo "- {$amenity->name} (Icon: {$amenity->icon})\n";
}

echo "\n=== Building Amenities Population Complete ===\n";
