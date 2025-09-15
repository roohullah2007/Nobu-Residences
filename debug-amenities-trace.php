<?php

// Debug script to trace exactly what's happening with amenities
require_once 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Building;
use App\Models\Property;

echo "=== AMENITIES DEBUGGING TRACE ===\n\n";

// Check NOBU building
echo "1. CHECKING NOBU BUILDING:\n";
$nobu = Building::with('amenities')->where('name', 'LIKE', '%NOBU%')->first();
if ($nobu) {
    echo "   Building ID: {$nobu->id}\n";
    echo "   Building Name: {$nobu->name}\n";
    echo "   Address: {$nobu->address}\n";
    echo "   Relationship amenities: " . $nobu->amenities->count() . "\n";
    
    // Check getDisplayData method
    echo "\n2. CHECKING getDisplayData() METHOD:\n";
    $displayData = $nobu->getDisplayData();
    echo "   Amenities in displayData: " . (isset($displayData['amenities']) ? count($displayData['amenities']) : 0) . "\n";
    if (isset($displayData['amenities']) && count($displayData['amenities']) > 0) {
        echo "   First amenity: " . json_encode($displayData['amenities'][0]) . "\n";
    }
    
    // Check JSON field
    echo "\n3. CHECKING JSON FIELD:\n";
    try {
        $rawAmenities = $nobu->getRawOriginal('amenities');
        if ($rawAmenities) {
            $jsonAmenities = json_decode($rawAmenities, true);
            echo "   JSON amenities count: " . (is_array($jsonAmenities) ? count($jsonAmenities) : 0) . "\n";
            if (is_array($jsonAmenities) && count($jsonAmenities) > 0) {
                echo "   First JSON amenity: " . json_encode($jsonAmenities[0]) . "\n";
            }
        } else {
            echo "   JSON amenities field: NULL (good)\n";
        }
    } catch (Exception $e) {
        echo "   JSON column does not exist (good)\n";
    }
} else {
    echo "   NOBU building not found!\n";
}

// Check a property that should use the NOBU building
echo "\n4. CHECKING PROPERTY WITH BUILDING:\n";
$property = Property::where('building_id', $nobu ? $nobu->id : null)->first();
if ($property) {
    echo "   Property ID: {$property->id}\n";
    echo "   Property building_id: {$property->building_id}\n";
    
    // Load the property with building and amenities
    $property->load(['building.amenities']);
    if ($property->building) {
        echo "   Property building name: {$property->building->name}\n";
        echo "   Property building amenities: " . $property->building->amenities->count() . "\n";
    } else {
        echo "   Property has no building\n";
    }
} else {
    echo "   No property found for NOBU building\n";
}

// Check what the WebsiteController would return
echo "\n5. SIMULATING WEBSITECONTROLLER LOGIC:\n";
if ($nobu) {
    $nobu->load(['amenities' => function($query) {
        $query->orderBy('name');
    }]);
    
    $amenities = $nobu->amenities->map(function($amenity) {
        return [
            'id' => $amenity->id,
            'name' => $amenity->name,
            'icon' => $amenity->icon
        ];
    })->toArray();
    
    $buildingData = [
        'id' => $nobu->id,
        'name' => $nobu->name,
        'address' => $nobu->address,
        'amenities' => $amenities
    ];
    
    echo "   WebsiteController buildingData amenities: " . count($buildingData['amenities']) . "\n";
    if (count($buildingData['amenities']) > 0) {
        echo "   First controller amenity: " . json_encode($buildingData['amenities'][0]) . "\n";
    }
    
    echo "\n   Final buildingData structure:\n";
    echo "   " . json_encode($buildingData, JSON_PRETTY_PRINT) . "\n";
}

echo "\n=== DEBUG COMPLETE ===\n";
