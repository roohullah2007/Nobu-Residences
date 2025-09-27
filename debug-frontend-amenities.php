<?php

// Debug script to check what data is being passed to the frontend
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Property;
use App\Models\Building;

echo "=== FRONTEND DEBUGGING FOR PROPERTY C12380712 ===\n\n";

// This is an MLS property, let's check how the controller would handle it
$listingKey = 'C12380712';

echo "1. CHECKING MLS PROPERTY LOGIC:\n";

// Try to find if there's a local property with this listing key
$localProperty = Property::where('mls_number', $listingKey)
    ->orWhere('id', $listingKey)
    ->with(['building.amenities'])
    ->first();

if ($localProperty) {
    echo "   Found LOCAL property with listing key: {$listingKey}\n";
    echo "   Property ID: {$localProperty->id}\n";
    echo "   Building ID: {$localProperty->building_id}\n";
    
    if ($localProperty->building) {
        echo "   Building Name: {$localProperty->building->name}\n";
        echo "   Building Amenities: " . $localProperty->building->amenities->count() . "\n";
    } else {
        echo "   Property has NO building\n";
    }
} else {
    echo "   No LOCAL property found for listing key: {$listingKey}\n";
    echo "   This means it's an MLS property that needs building matching\n";
}

echo "\n2. SIMULATING MLS PROPERTY ADDRESS MATCHING:\n";

// For MLS properties, the controller tries to match by address
// Let's simulate this for 15 Mercer Street
$buildingAddress = '15 Mercer Street';
echo "   Looking for building with address containing: {$buildingAddress}\n";

$building = Building::with(['amenities' => function($query) {
    $query->orderBy('name');
}])->where('address', 'LIKE', '%15 Mercer%')->first();

if ($building) {
    echo "   FOUND building: {$building->name}\n";
    echo "   Building ID: {$building->id}\n";
    echo "   Building Address: {$building->address}\n";
    echo "   Amenities count: " . $building->amenities->count() . "\n";
    
    // This is what would be passed to the frontend
    $amenities = $building->amenities->map(function($amenity) {
        return [
            'id' => $amenity->id,
            'name' => $amenity->name,
            'icon' => $amenity->icon
        ];
    })->toArray();
    
    $buildingData = [
        'id' => $building->id,
        'name' => $building->name,
        'slug' => $building->slug,
        'address' => $building->address,
        'main_image' => $building->main_image,
        'units_for_sale' => $building->units_for_sale,
        'units_for_rent' => $building->units_for_rent,
        'amenities' => $amenities
    ];
    
    echo "\n3. BUILDING DATA THAT SHOULD BE PASSED TO FRONTEND:\n";
    echo "   Building Name: {$buildingData['name']}\n";
    echo "   Amenities Count: " . count($buildingData['amenities']) . "\n";
    echo "   First Amenity: " . ($buildingData['amenities'][0]['name'] ?? 'None') . "\n";
    
    echo "\n   Full buildingData structure:\n";
    echo json_encode($buildingData, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "   NO building found for address: {$buildingAddress}\n";
    echo "   This means no amenities should be shown\n";
}

echo "\n=== DEBUGGING COMPLETE ===\n";
echo "If building data exists, the frontend should receive it and show dynamic amenities.\n";
echo "If showing static amenities, check:\n";
echo "1. WebsiteController propertyDetail method for MLS properties\n";
echo "2. BuildingAmenities component receiving correct props\n";
echo "3. Any fallback components showing static data\n";
