<?php

// Quick fix to update WebsiteController to properly handle MLS building matching
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== WEBSITECONTROLLER MLS BUILDING MATCHING FIX ===\n\n";

// Let's check the controller file content for the MLS property handling
$controllerPath = 'app/Http/Controllers/WebsiteController.php';
$controllerContent = file_get_contents($controllerPath);

// Find the specific section that handles MLS properties
if (strpos($controllerContent, 'Extract building address from property address') !== false) {
    echo "Found MLS property building matching section in controller\n";
} else {
    echo "MLS property building matching section NOT found - this is the issue!\n";
}

// Let's check what the property address looks like for C12380712
echo "\nProperty address from our debug: '15 Mercer Street 610, Toronto C01, ON M5V 1H2'\n";
echo "This needs to be parsed to find building address: '15 Mercer Street'\n";

echo "\nThe issue is that the MLS property logic in WebsiteController is not\n";
echo "properly extracting the building address from the full property address.\n";
echo "\nWe need to fix the propertyDetail method in WebsiteController.php\n";
echo "to properly handle MLS properties and match them to buildings.\n";
