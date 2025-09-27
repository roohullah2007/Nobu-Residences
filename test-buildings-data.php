<?php

// Test if buildings are in the database and properly formatted
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Building;

echo "=== Building Database Test ===\n";

$buildings = Building::where('status', 'active')->get();

echo "Total active buildings: " . $buildings->count() . "\n\n";

if ($buildings->count() > 0) {
    echo "Buildings in database:\n";
    foreach ($buildings as $building) {
        echo "ID: " . $building->id . "\n";
        echo "Name: " . ($building->name ?: 'NO NAME') . "\n";
        echo "Address: " . ($building->address ?: 'NO ADDRESS') . "\n";
        echo "City: " . ($building->city ?: 'NO CITY') . "\n";
        echo "Latitude: " . ($building->latitude ?: 'NO LATITUDE') . "\n";
        echo "Longitude: " . ($building->longitude ?: 'NO LONGITUDE') . "\n";
        echo "Status: " . ($building->status ?: 'NO STATUS') . "\n";
        echo "---\n";
    }
} else {
    echo "No buildings found in database!\n";
    echo "Try running: php artisan db:seed --class=BuildingSeeder\n";
}

echo "\n=== Test Building API Call ===\n";

// Test the buildings search API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/buildings-search');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'search_params' => [
        'page' => 1,
        'page_size' => 5
    ]
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: " . $httpCode . "\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "API Success: " . ($data['success'] ? 'YES' : 'NO') . "\n";
    
    if ($data['success'] && isset($data['data']['buildings'])) {
        echo "API returned " . count($data['data']['buildings']) . " buildings\n";
        foreach ($data['data']['buildings'] as $building) {
            echo "- " . $building['name'] . " (Lat: " . $building['latitude'] . ", Lng: " . $building['longitude'] . ")\n";
        }
    }
} else {
    echo "API Error: " . $response . "\n";
}
