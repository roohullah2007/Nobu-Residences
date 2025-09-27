<?php

// Test Contact Form Setup
echo "=== Contact Form Debug Test ===\n\n";

// Check if contact forms table exists
try {
    $contactCount = \App\Models\ContactForm::count();
    echo "✅ Database: contact_forms table exists with {$contactCount} records\n";
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    echo "Run: php artisan migrate\n";
}

// Check if the route exists
$routes = collect(\Route::getRoutes())->filter(function($route) {
    return $route->uri() === 'contact' && in_array('POST', $route->methods());
});

if ($routes->count() > 0) {
    echo "✅ Route: POST /contact exists\n";
} else {
    echo "❌ Route: POST /contact not found\n";
}

// Check ContactController exists
if (class_exists('\App\Http\Controllers\ContactController')) {
    echo "✅ Controller: ContactController exists\n";
} else {
    echo "❌ Controller: ContactController not found\n";
}

// Check if ContactForm model exists
if (class_exists('\App\Models\ContactForm')) {
    echo "✅ Model: ContactForm exists\n";
} else {
    echo "❌ Model: ContactForm not found\n";
}

// Test database connection
try {
    \DB::connection()->getPdo();
    echo "✅ Database: Connection successful\n";
} catch (Exception $e) {
    echo "❌ Database: Connection failed - " . $e->getMessage() . "\n";
}

echo "\n=== Next Steps ===\n";
echo "1. Open your browser and go to your homepage\n";
echo "2. Open browser developer tools (F12)\n";
echo "3. Try submitting the contact form\n";
echo "4. Check console for any JavaScript errors\n";
echo "5. Check Network tab for the /contact POST request\n";
echo "6. Check storage/logs/laravel.log for server errors\n";

echo "\n=== If form still doesn't work ===\n";
echo "1. Clear browser cache\n";
echo "2. Run: php artisan cache:clear\n";
echo "3. Run: php artisan config:clear\n";
echo "4. Run: php artisan route:clear\n";
echo "5. Check Laravel logs: tail -f storage/logs/laravel.log\n";
