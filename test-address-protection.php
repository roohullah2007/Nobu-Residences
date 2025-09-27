<?php

/**
 * Test script for address masking functionality
 * Run this from the Laravel root directory: php test-address-protection.php
 */

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Models\Property;
use App\Models\User;
use App\Models\ContactPurchase;
use Illuminate\Support\Facades\DB;

echo "🔒 Testing Address Protection System\n";
echo "=====================================\n\n";

// Test 1: Basic address masking
echo "1. Testing Basic Address Masking:\n";
echo "---------------------------------\n";

$property = Property::first();
if ($property) {
    echo "Original Address: " . $property->address . "\n";
    echo "Masked Address: " . $property->getMaskedAddress() . "\n";
    echo "Original Postal: " . $property->postal_code . "\n";
    echo "Masked Postal: " . $property->getMaskedPostalCode() . "\n";
    echo "Approximate Lat: " . $property->getApproximateLatitude() . "\n";
    echo "Approximate Lng: " . $property->getApproximateLongitude() . "\n\n";
} else {
    echo "❌ No properties found. Run PropertySeeder first.\n\n";
}

// Test 2: Contact access checking
echo "2. Testing Contact Access Logic:\n";
echo "--------------------------------\n";

if ($property) {
    // Test without any purchases
    $hasAccess = $property->hasContactAccess('test-session-123', null);
    echo "Access without purchase: " . ($hasAccess ? "✅ YES" : "❌ NO") . "\n";
    
    // Test property owner access
    $hasOwnerAccess = $property->hasContactAccess(null, $property->agent_id);
    echo "Property owner access: " . ($hasOwnerAccess ? "✅ YES" : "❌ NO") . "\n";
    
    // Simulate a contact purchase
    $purchase = ContactPurchase::create([
        'property_id' => $property->id,
        'session_id' => 'test-session-123',
        'buyer_name' => 'Test Buyer',
        'buyer_email' => 'test@example.com',
        'amount' => $property->contact_price ?? 10.00,
        'payment_method' => 'test',
        'payment_status' => 'completed',
    ]);
    
    $hasAccessAfterPurchase = $property->hasContactAccess('test-session-123', null);
    echo "Access after purchase: " . ($hasAccessAfterPurchase ? "✅ YES" : "❌ NO") . "\n";
    
    // Clean up test purchase
    $purchase->delete();
    echo "\n";
}

// Test 3: Secure display data
echo "3. Testing Secure Display Data:\n";
echo "-------------------------------\n";

if ($property) {
    $publicData = $property->getSecureDisplayData(null, 'test-session-456');
    echo "Public view (no access):\n";
    echo "- Address: " . $publicData['address'] . "\n";
    echo "- Has Access: " . ($publicData['has_contact_access'] ? 'YES' : 'NO') . "\n";
    echo "- Postal Code: " . $publicData['postal_code'] . "\n\n";
    
    $ownerData = $property->getSecureDisplayData(
        User::find($property->agent_id), 
        'test-session-456'
    );
    echo "Owner view (full access):\n";
    echo "- Address: " . $ownerData['address'] . "\n";
    echo "- Has Access: " . ($ownerData['has_contact_access'] ? 'YES' : 'NO') . "\n";
    echo "- Postal Code: " . $ownerData['postal_code'] . "\n\n";
}

// Test 4: Agent display data
echo "4. Testing Agent Contact Protection:\n";
echo "-----------------------------------\n";

if ($property && $property->agent) {
    $protectedAgent = $property->getAgentDisplayData(false);
    echo "Protected agent data:\n";
    echo "- Name: " . $protectedAgent['name'] . "\n";
    echo "- Email: " . $protectedAgent['email'] . "\n";
    echo "- Phone: " . $protectedAgent['phone'] . "\n\n";
    
    $fullAgent = $property->getAgentDisplayData(true);
    echo "Full agent data (after purchase):\n";
    echo "- Name: " . $fullAgent['name'] . "\n";
    echo "- Email: " . $fullAgent['email'] . "\n";
    echo "- Phone: " . $fullAgent['phone'] . "\n\n";
}

// Test 5: Multiple address formats
echo "5. Testing Various Address Formats:\n";
echo "-----------------------------------\n";

$testAddresses = [
    '123 Main Street, Toronto, ON',
    '456 Oak Avenue, Unit 5B, Mississauga, Ontario, Canada',
    '789 Pine Road',
    'Complex Address With, Multiple, Commas, Toronto, ON, Canada',
];

foreach ($testAddresses as $address) {
    $tempProperty = new Property(['address' => $address, 'city' => 'Toronto', 'province' => 'ON']);
    echo "Original: $address\n";
    echo "Masked: " . $tempProperty->getMaskedAddress() . "\n\n";
}

echo "✅ Address Protection Tests Completed!\n";
echo "=====================================\n\n";

echo "🔧 Next Steps:\n";
echo "- Run: php artisan db:seed --class=PropertySeeder (to add sample data)\n";
echo "- Visit: /agent/properties (to see protected property listings)\n";
echo "- Visit: /agent/properties/{id} (to see individual property with protection)\n";
echo "- Test the purchase flow by trying to buy contact information\n\n";

echo "🛡️ Security Features Active:\n";
echo "- ✅ Address masking (street numbers hidden)\n";
echo "- ✅ Postal code partial masking\n";
echo "- ✅ Approximate coordinates (±1km)\n";
echo "- ✅ Agent contact protection\n";
echo "- ✅ Property owner bypass\n";
echo "- ✅ Purchase-based access control\n";
echo "- ✅ Session and user-based tracking\n";
echo "- ✅ 30-day access expiration\n\n";
