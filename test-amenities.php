<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Test MLS property address parsing
$testAddress = '15 Mercer Street 610, Toronto C01, ON M5V 1H2';
echo "Testing address: " . $testAddress . PHP_EOL;

if (preg_match('/^(\d+)\s+([^,\d]+?)(?:\s+\d+)?(?:,|$)/', $testAddress, $matches)) {
    $streetNumber = $matches[1];
    $streetName = trim($matches[2]);
    $buildingAddress = $streetNumber . ' ' . $streetName;
    echo "Extracted: " . $buildingAddress . PHP_EOL;

    $building = \App\Models\Building::where('address', 'LIKE', '%' . $buildingAddress . '%')->first();
    if ($building) {
        echo "Building found: " . $building->name . PHP_EOL;
        echo "Building ID: " . $building->id . PHP_EOL;
        echo "Amenities count: " . $building->amenities()->count() . PHP_EOL;

        $amenities = $building->amenities()->get();
        echo "Amenities list:" . PHP_EOL;
        foreach($amenities as $amenity) {
            echo "  - " . $amenity->name . " (icon: " . $amenity->icon . ")" . PHP_EOL;
        }

        // Test what getDisplayData returns
        echo PHP_EOL . "Testing getDisplayData():" . PHP_EOL;
        $displayData = $building->getDisplayData();
        echo "Amenities in display data: " . count($displayData['amenities']) . PHP_EOL;
    } else {
        echo "No building found for address: " . $buildingAddress . PHP_EOL;
    }
} else {
    echo "Failed to parse address" . PHP_EOL;
}

// Also test a local property
echo PHP_EOL . "Testing local property:" . PHP_EOL;
$property = \App\Models\Property::where('building_id', '891aa08a-8267-4987-b47a-bff4cb493290')->first();
if ($property) {
    echo "Property found: " . $property->address . PHP_EOL;
    if ($property->building) {
        echo "Building: " . $property->building->name . PHP_EOL;
        echo "Amenities: " . $property->building->amenities()->count() . PHP_EOL;
    }
}
