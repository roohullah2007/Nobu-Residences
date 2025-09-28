<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

$kernel->terminate($request, $response);

use App\Services\GeminiAIService;
use Illuminate\Support\Facades\Log;

// Test MLS ID
$mlsId = 'C9372416'; // You can change this to any valid MLS ID

echo "Testing FAQ generation for MLS ID: $mlsId\n";
echo "========================================\n\n";

try {
    // Create instance of the service
    $service = new GeminiAIService();

    // Get test property data (you would normally get this from AMPRE API)
    $propertyData = [
        'PropertySubType' => 'Condo Apartment',
        'UnparsedAddress' => '35 Mercer Street 1312, Toronto',
        'City' => 'Toronto',
        'StateOrProvince' => 'ON',
        'PostalCode' => 'M5V 0V1',
        'ListPrice' => 850000,
        'BedroomsTotal' => 2,
        'BathroomsTotalInteger' => 2,
        'LivingArea' => 850,
        'YearBuilt' => 2018,
        'ParkingTotal' => 1,
        'AssociationFee' => 650,
        'TaxAnnualAmount' => 4500,
        'TransactionType' => 'For Sale',
        'Area' => 'Entertainment District',
        'PublicRemarks' => 'Fully Furnished 2-bedroom + Den, 2-bathroom condominium located in the vibrant heart of Toronto\'s Entertainment District.',
        'InteriorFeatures' => ['Hardwood Floors', 'Quartz Countertops', 'Modern Kitchen'],
        'AssociationAmenities' => ['Gym', 'Concierge', 'Party Room', 'Rooftop Terrace']
    ];

    // Generate FAQs (method needs property data and MLS ID)
    echo "Generating FAQs...\n";
    $result = $service->generatePropertyFaqs($propertyData, $mlsId);

    // Debug the result
    echo "Result type: " . gettype($result) . "\n";
    if (is_array($result)) {
        echo "Result keys: " . implode(', ', array_keys($result)) . "\n";
        echo "Result content: " . json_encode($result, JSON_PRETTY_PRINT) . "\n\n";
    }

    $faqs = $result['faqs'] ?? $result ?? [];

    if ($faqs && !empty($faqs)) {
        echo "✅ FAQs generated successfully!\n\n";
        echo "Number of FAQs: " . count($faqs) . "\n\n";

        foreach ($faqs as $index => $faq) {
            echo "FAQ " . ($index + 1) . ":\n";
            echo "Q: " . $faq['question'] . "\n";
            echo "A: " . $faq['answer'] . "\n\n";
            echo "-------------------\n\n";
        }

        // Verify they're in the database (already saved by generatePropertyFaqs)
        $savedFaqs = \App\Models\PropertyFaq::where('mls_id', $mlsId)->get();
        echo "Verified: " . $savedFaqs->count() . " FAQs in database for MLS ID: $mlsId\n";
    } else {
        echo "❌ Failed to generate FAQs\n";
    }

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
}