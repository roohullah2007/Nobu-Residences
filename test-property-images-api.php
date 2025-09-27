<?php
/**
 * Test script to verify property images API integration
 * Run with: php test-property-images-api.php
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$app = Application::configure(basePath: __DIR__)
    ->withRouting(
        web: __DIR__ . '/routes/web.php',
        commands: __DIR__ . '/routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test with a known listing key
$testListingKey = 'X11930665'; // This should be replaced with a valid listing key from your system

try {
    echo "=== Testing Property Images API Integration ===\n\n";
    
    // Test 1: Check if AmpreApiService can be instantiated
    echo "1. Testing AmpreApiService instantiation...\n";
    $ampreApi = app(\App\Services\AmpreApiService::class);
    echo "✓ AmpreApiService instantiated successfully\n\n";
    
    // Test 2: Test API connection
    echo "2. Testing AMPRE API connection...\n";
    try {
        // Try to get a single property to test connection
        $property = $ampreApi->getPropertyByKey($testListingKey);
        if ($property) {
            echo "✓ Successfully connected to AMPRE API\n";
            echo "✓ Found property: " . ($property['UnparsedAddress'] ?? 'No address') . "\n\n";
        } else {
            echo "⚠ AMPRE API connected but no property found with key: $testListingKey\n\n";
        }
    } catch (\Exception $e) {
        echo "✗ Failed to connect to AMPRE API: " . $e->getMessage() . "\n\n";
    }
    
    // Test 3: Test property images API
    echo "3. Testing property images API...\n";
    try {
        $imagesResponse = $ampreApi->getPropertiesImages([$testListingKey]);
        
        if (!empty($imagesResponse)) {
            echo "✓ Successfully fetched images response\n";
            echo "Response structure:\n";
            print_r(array_keys($imagesResponse));
            
            if (isset($imagesResponse[$testListingKey])) {
                $images = $imagesResponse[$testListingKey];
                echo "✓ Found " . count($images) . " images for listing $testListingKey\n";
                
                if (!empty($images)) {
                    echo "First image structure:\n";
                    print_r($images[0]);
                    
                    // Test image URL extraction
                    $imageUrls = array_map(function($image) {
                        return $image['MediaURL'] ?? '';
                    }, $images);
                    
                    $imageUrls = array_filter($imageUrls);
                    echo "✓ Extracted " . count($imageUrls) . " valid image URLs\n";
                    
                    if (!empty($imageUrls)) {
                        echo "Sample image URLs:\n";
                        foreach (array_slice($imageUrls, 0, 3) as $i => $url) {
                            echo "  " . ($i + 1) . ". $url\n";
                        }
                    }
                }
            } else {
                echo "⚠ No images found for listing key: $testListingKey\n";
                echo "Available keys in response: " . implode(', ', array_keys($imagesResponse)) . "\n";
            }
        } else {
            echo "⚠ Empty images response\n";
        }
        echo "\n";
    } catch (\Exception $e) {
        echo "✗ Failed to fetch property images: " . $e->getMessage() . "\n\n";
    }
    
    // Test 4: Test property detail API endpoint
    echo "4. Testing /api/property-detail endpoint...\n";
    try {
        $controller = new \App\Http\Controllers\Api\PropertyDetailController($ampreApi);
        $request = new \Illuminate\Http\Request();
        $request->merge(['listingKey' => $testListingKey]);
        
        $response = $controller->getPropertyDetail($request);
        $responseData = $response->getData(true);
        
        if (isset($responseData['property'])) {
            echo "✓ Property detail API working\n";
            echo "Property address: " . ($responseData['property']['address'] ?? 'No address') . "\n";
            
            if (isset($responseData['images']) && !empty($responseData['images'])) {
                echo "✓ Found " . count($responseData['images']) . " images in API response\n";
                echo "First image: " . ($responseData['images'][0]['url'] ?? 'No URL') . "\n";
            } else {
                echo "⚠ No images in API response\n";
            }
        } else {
            echo "⚠ No property data in API response\n";
        }
        echo "\n";
    } catch (\Exception $e) {
        echo "✗ Property detail API failed: " . $e->getMessage() . "\n\n";
    }
    
    echo "=== Test Complete ===\n";
    
} catch (\Exception $e) {
    echo "✗ Fatal error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
