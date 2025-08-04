<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Set up database connection
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => $_ENV['DB_CONNECTION'] ?? 'mysql',
    'host' => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'port' => $_ENV['DB_PORT'] ?? '3306',
    'database' => $_ENV['DB_DATABASE'],
    'username' => $_ENV['DB_USERNAME'],
    'password' => $_ENV['DB_PASSWORD'],
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

try {
    // Get the home page content
    $homePage = Capsule::table('website_pages')
        ->where('page_type', 'home')
        ->first();
    
    if ($homePage) {
        $content = json_decode($homePage->content, true);
        
        echo "=== FAQ DATA STRUCTURE ===\n";
        echo "FAQ Enabled: " . ($content['faq']['enabled'] ? 'Yes' : 'No') . "\n";
        echo "FAQ Title: " . ($content['faq']['title'] ?? 'Not set') . "\n";
        echo "FAQ Items Count: " . count($content['faq']['items'] ?? []) . "\n\n";
        
        if (isset($content['faq']['items'])) {
            echo "=== FAQ ITEMS ===\n";
            foreach ($content['faq']['items'] as $index => $item) {
                echo ($index + 1) . ". " . $item['question'] . "\n";
                echo "   Answer: " . substr($item['answer'], 0, 100) . "...\n\n";
            }
        }
    } else {
        echo "No home page found in database.\n";
    }
    
} catch (Exception $e) {
    echo "Database connection failed: " . $e->getMessage() . "\n";
}
