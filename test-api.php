<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Test the AMPRE API service
$ampreApi = app(\App\Services\AmpreApiService::class);

try {
    echo "Testing AMPRE API Connection...\n";
    
    // First, get some properties
    $ampreApi->resetFilters();
    $ampreApi->setSelect([
        'ListingKey',
        'BedroomsTotal',
        'UnparsedAddress',
        'ListPrice',
        'TransactionType',
        'City'
    ]);
    $ampreApi->setTop(3);
    $ampreApi->addCustomFilter("TransactionType eq 'For Sale'");
    
    $properties = $ampreApi->fetchProperties();
    echo "Found " . count($properties) . " properties\n";
    
    if (!empty($properties)) {
        // Get listing keys
        $listingKeys = array_column($properties, 'ListingKey');
        echo "Listing Keys: " . implode(', ', $listingKeys) . "\n\n";
        
        // Now try to get images for these properties
        echo "Fetching images for these properties...\n";
        $images = $ampreApi->getPropertiesImages($listingKeys);
        
        echo "Images response:\n";
        foreach ($listingKeys as $key) {
            echo "Property $key: ";
            if (isset($images[$key]) && !empty($images[$key])) {
                echo count($images[$key]) . " images found\n";
                if (isset($images[$key][0]['MediaURL'])) {
                    echo "  First image URL: " . $images[$key][0]['MediaURL'] . "\n";
                }
            } else {
                echo "No images\n";
            }
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}