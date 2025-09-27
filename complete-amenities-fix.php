<?php

// Complete amenities fix script
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

echo "=== COMPLETE AMENITIES FIX ===\n\n";

// Step 1: Clear ALL JSON amenities data from buildings table
echo "Step 1: Clearing JSON amenities field from all buildings...\n";
$result = DB::table('buildings')->update(['amenities' => null]);
echo "Cleared JSON amenities from {$result} buildings\n\n";

// Step 2: Verify NOBU building's relationship amenities
echo "Step 2: Checking NOBU building relationship amenities...\n";
$nobu = Building::with('amenities')->where('name', 'LIKE', '%NOBU%')->first();

if ($nobu) {
    echo "NOBU building found: {$nobu->name}\n";
    echo "Relationship amenities count: " . $nobu->amenities->count() . "\n";
    
    if ($nobu->amenities->count() === 0) {
        echo "No relationship amenities found. Creating them...\n";
        
        // Create/find the amenities and attach them
        $amenityNames = [
            'Concierge', 'Party Room', 'Meeting Room', 'Security Guard', 'Gym',
            'Visitor Parking', 'Parking Garage', 'Guest Suites', 'Pet Restriction',
            'BBQ Permitted', 'Outdoor Pool', 'Media Room', 'Rooftop Deck', 'Security System'
        ];
        
        $amenityIds = [];
        foreach ($amenityNames as $name) {
            $amenity = Amenity::firstOrCreate(['name' => $name], [
                'icon' => '/storage/amenity-icons/' . strtolower(str_replace(' ', '-', $name)) . '.svg'
            ]);
            $amenityIds[] = $amenity->id;
        }
        
        $nobu->amenities()->sync($amenityIds);
        echo "Attached " . count($amenityIds) . " amenities to NOBU building\n";
    } else {
        echo "Relationship amenities already exist:\n";
        foreach ($nobu->amenities as $amenity) {
            echo "  - {$amenity->name}\n";
        }
    }
    
    // Verify JSON field is null
    $rawAmenities = $nobu->getRawOriginal('amenities');
    echo "JSON amenities field: " . ($rawAmenities ? 'HAS DATA (BAD)' : 'NULL (GOOD)') . "\n";
} else {
    echo "NOBU building not found!\n";
}

echo "\n=== FIX COMPLETE ===\n";
echo "Next steps:\n";
echo "1. Clear all caches\n";
echo "2. Test admin amenities update\n";
echo "3. Check frontend property detail pages\n";
