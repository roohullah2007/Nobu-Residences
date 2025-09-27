<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Test fetching images for multiple properties
$ampreApi = app(\App\Services\AmpreApiService::class);

try {
    echo "Fetching properties to test image uniqueness...\n\n";
    
    // Get some properties
    $ampreApi->resetFilters();
    $ampreApi->setSelect(['ListingKey', 'UnparsedAddress', 'ListPrice']);
    $ampreApi->setTop(10);
    $ampreApi->addCustomFilter("TransactionType eq 'For Sale'");
    
    $properties = $ampreApi->fetchProperties();
    $listingKeys = array_column($properties, 'ListingKey');
    
    echo "Testing " . count($listingKeys) . " properties:\n";
    echo implode(', ', $listingKeys) . "\n\n";
    
    // Fetch images for all properties at once
    echo "Fetching all images in one batch...\n";
    $allImages = $ampreApi->getPropertiesImages($listingKeys);
    
    $imageUrls = [];
    $duplicates = [];
    
    foreach ($listingKeys as $key) {
        if (isset($allImages[$key]) && !empty($allImages[$key])) {
            $firstImage = $allImages[$key][0]['MediaURL'] ?? 'NO_URL';
            echo "Property $key: ";
            
            if (in_array($firstImage, $imageUrls)) {
                echo "DUPLICATE! (same as " . array_search($firstImage, $imageUrls) . ")\n";
                $duplicates[] = $key;
            } else {
                echo "Unique image\n";
            }
            
            $imageUrls[$key] = $firstImage;
            echo "  URL: " . substr($firstImage, 0, 80) . "...\n";
            echo "  Total images: " . count($allImages[$key]) . "\n";
        } else {
            echo "Property $key: NO IMAGES\n";
            $imageUrls[$key] = null;
        }
    }
    
    echo "\n=== SUMMARY ===\n";
    echo "Total properties: " . count($listingKeys) . "\n";
    echo "Properties with images: " . count(array_filter($imageUrls)) . "\n";
    echo "Properties without images: " . count(array_filter($imageUrls, function($v) { return $v === null; })) . "\n";
    echo "Duplicate images found: " . count($duplicates) . "\n";
    
    if (count($duplicates) > 0) {
        echo "\nProperties with duplicate images: " . implode(', ', $duplicates) . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}