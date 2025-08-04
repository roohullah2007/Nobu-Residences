<?php

/**
 * Quick test for address masking
 * Run this from the Laravel root directory: php test-masking.php
 */

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Models\Property;

echo "🔍 Quick Address Masking Test\n";
echo "=============================\n\n";

// Test the address from the screenshot
$testAddress = "Islamabad, Islamabad - G - 8, Sector 1, House-353,street-16,G-8/1, Islamabad";

// Create a temporary property for testing
$tempProperty = new Property([
    'address' => $testAddress,
    'city' => 'Islamabad',
    'province' => 'Islamabad',
    'postal_code' => '12345'
]);

echo "Original Address: " . $testAddress . "\n";
echo "Masked Address: " . $tempProperty->getMaskedAddress() . "\n";
echo "Masked Postal: " . $tempProperty->getMaskedPostalCode() . "\n\n";

// Test with actual database properties if any exist
$property = Property::first();
if ($property) {
    echo "Database Property Test:\n";
    echo "Original: " . $property->address . "\n";
    echo "Masked: " . $property->getMaskedAddress() . "\n";
    echo "Has Access (no user): " . ($property->hasContactAccess(null, null) ? 'YES' : 'NO') . "\n";
    echo "Has Access (owner): " . ($property->hasContactAccess(null, $property->agent_id) ? 'YES' : 'NO') . "\n\n";
    
    // Test secure display data
    $secureData = $property->getSecureDisplayData(null, 'test-session');
    echo "Secure Display Data:\n";
    echo "Address: " . $secureData['address'] . "\n";
    echo "Has Access: " . ($secureData['has_contact_access'] ? 'YES' : 'NO') . "\n";
}

echo "\n✅ Test Complete!\n";
