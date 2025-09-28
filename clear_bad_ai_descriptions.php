<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\PropertyAiDescription;
use App\Models\PropertyFaq;

echo "Clearing problematic AI descriptions...\n";
echo "======================================\n\n";

// Find and delete descriptions that mention "0 bedrooms" or "0 bathrooms"
$problematicDescriptions = PropertyAiDescription::where(function($query) {
    $query->where('overview_description', 'LIKE', '%0 bedrooms%')
          ->orWhere('overview_description', 'LIKE', '%0 bathrooms%')
          ->orWhere('detailed_description', 'LIKE', '%0 bedrooms%')
          ->orWhere('detailed_description', 'LIKE', '%0 bathrooms%')
          ->orWhere('overview_description', 'LIKE', '%0 bedroom%')
          ->orWhere('overview_description', 'LIKE', '%0 bathroom%')
          ->orWhere('detailed_description', 'LIKE', '%0 bedroom%')
          ->orWhere('detailed_description', 'LIKE', '%0 bathroom%');
})->get();

echo "Found {$problematicDescriptions->count()} problematic descriptions.\n";

$mlsIds = $problematicDescriptions->pluck('mls_id')->toArray();

if (count($mlsIds) > 0) {
    echo "MLS IDs with problematic descriptions:\n";
    foreach ($mlsIds as $mlsId) {
        echo "  - $mlsId\n";
    }

    // Delete the problematic descriptions
    PropertyAiDescription::whereIn('mls_id', $mlsIds)->delete();
    echo "\nDeleted problematic descriptions.\n";

    // Also delete associated FAQs
    $faqsDeleted = PropertyFaq::whereIn('mls_id', $mlsIds)->delete();
    echo "Deleted $faqsDeleted associated FAQs.\n";

    echo "\nThese properties will regenerate with correct data on next visit.\n";
} else {
    echo "No problematic descriptions found.\n";
}

// Show statistics
$totalDescriptions = PropertyAiDescription::count();
echo "\n\nTotal remaining AI descriptions: $totalDescriptions\n";