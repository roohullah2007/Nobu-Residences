<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\PropertyAiDescription;
use Illuminate\Support\Facades\DB;

echo "Checking AI Descriptions in Database:\n";
echo "=====================================\n\n";

// Get total count
$total = PropertyAiDescription::count();
echo "Total AI descriptions: $total\n\n";

// Check for duplicate MLS IDs
$duplicates = DB::table('property_ai_descriptions')
    ->select('mls_id', DB::raw('COUNT(*) as count'))
    ->groupBy('mls_id')
    ->having('count', '>', 1)
    ->get();

if ($duplicates->count() > 0) {
    echo "Found duplicate MLS IDs:\n";
    foreach ($duplicates as $dup) {
        echo "  MLS ID: {$dup->mls_id} appears {$dup->count} times\n";
    }
    echo "\n";
} else {
    echo "No duplicate MLS IDs found.\n\n";
}

// Show recent descriptions
echo "Recent AI Descriptions (last 10):\n";
$recent = PropertyAiDescription::orderBy('created_at', 'desc')->limit(10)->get();

foreach ($recent as $desc) {
    echo "-------------------\n";
    echo "ID: {$desc->id}\n";
    echo "MLS ID: {$desc->mls_id}\n";
    echo "Created: {$desc->created_at}\n";
    echo "Overview (first 100 chars): " . substr($desc->overview_description, 0, 100) . "...\n";
    echo "Detailed (first 100 chars): " . substr($desc->detailed_description, 0, 100) . "...\n";
}

// Check if all descriptions are the same
echo "\n\nChecking for identical descriptions:\n";
$uniqueOverviews = PropertyAiDescription::distinct('overview_description')->count('overview_description');
$uniqueDetailed = PropertyAiDescription::distinct('detailed_description')->count('detailed_description');

echo "Unique overview descriptions: $uniqueOverviews\n";
echo "Unique detailed descriptions: $uniqueDetailed\n";

if ($uniqueOverviews == 1 && $total > 1) {
    echo "WARNING: All overview descriptions are identical!\n";
}
if ($uniqueDetailed == 1 && $total > 1) {
    echo "WARNING: All detailed descriptions are identical!\n";
}