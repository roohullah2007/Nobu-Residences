<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Test the PropertySearchController directly
$controller = app(\App\Http\Controllers\PropertySearchController::class);

// Create a mock request
$request = new \Illuminate\Http\Request();
$request->merge([
    'search_params' => [
        'page' => 1,
        'page_size' => 2,
        'status' => 'For Sale'
    ]
]);

try {
    echo "Testing Property Search Controller...\n\n";
    
    $response = $controller->search($request);
    $data = json_decode($response->getContent(), true);
    
    if ($data['success']) {
        echo "Search successful!\n";
        echo "Total properties: " . $data['data']['total'] . "\n";
        echo "Properties returned: " . count($data['data']['properties']) . "\n\n";
        
        foreach ($data['data']['properties'] as $index => $property) {
            echo "Property " . ($index + 1) . ":\n";
            echo "  ListingKey: " . $property['ListingKey'] . "\n";
            echo "  Address: " . $property['UnparsedAddress'] . "\n";
            echo "  MediaURL: " . ($property['MediaURL'] ?? 'NOT SET') . "\n";
            echo "  Images count: " . count($property['Images'] ?? []) . "\n";
            if (!empty($property['Images'])) {
                echo "  First image: " . $property['Images'][0]['MediaURL'] . "\n";
            }
            echo "\n";
        }
    } else {
        echo "Search failed: " . $data['message'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}