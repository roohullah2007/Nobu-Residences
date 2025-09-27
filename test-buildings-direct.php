<?php
// Test direct API call to buildings endpoint with minimal params

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/buildings-search');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'search_params' => [
        'page' => 1,
        'page_size' => 15
    ]
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

echo "=== Buildings API Test ===\n";
echo "Success: " . ($data['success'] ? 'YES' : 'NO') . "\n";
echo "Total Buildings: " . $data['data']['total'] . "\n";
echo "Buildings Returned: " . count($data['data']['buildings']) . "\n\n";

if (count($data['data']['buildings']) > 0) {
    echo "Buildings Found:\n";
    foreach ($data['data']['buildings'] as $building) {
        echo "- " . $building['name'] . "\n";
        echo "  City: " . $building['city'] . "\n";
        echo "  Status: " . $building['status'] . "\n";
        echo "  Floors: " . $building['floors'] . "\n";
        echo "  Total Units: " . $building['total_units'] . "\n\n";
    }
} else {
    echo "NO BUILDINGS FOUND!\n";
}

echo "\nDirect Link to Buildings Tab:\n";
echo "http://127.0.0.1:8000/search?tab=buildings\n";