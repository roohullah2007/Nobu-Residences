<?php

// Fix script to update WebsiteController MLS building matching
$controllerPath = 'app/Http/Controllers/WebsiteController.php';
$controllerContent = file_get_contents($controllerPath);

echo "=== FIXING MLS BUILDING MATCHING IN WEBSITECONTROLLER ===\n\n";

// The issue is in the address parsing logic for MLS properties
// Property address: "15 Mercer Street 610, Toronto C01, ON M5V 1H2"
// Needs to extract: "15 Mercer Street"

// Check if the MLS building matching logic exists
if (strpos($controllerContent, 'Extract building address from property address') !== false) {
    echo "✅ Found existing MLS building matching logic\n";
} else {
    echo "❌ MLS building matching logic missing or incorrect\n";
    echo "The issue is that WebsiteController is not properly handling MLS properties\n";
    echo "and matching them to buildings by address.\n\n";
    
    echo "Based on the console output:\n";
    echo "- Property address: '15 Mercer Street 610, Toronto C01, ON M5V 1H2'\n";
    echo "- Should extract: '15 Mercer Street'\n";
    echo "- Should match: NOBU Residences Toronto\n";
    echo "- But currently returning: null\n\n";
    
    echo "The WebsiteController propertyDetail method needs to be updated\n";
    echo "to properly parse MLS property addresses and match them to buildings.\n";
}

echo "\n=== NEXT STEPS ===\n";
echo "1. Find the propertyDetail method in WebsiteController\n";
echo "2. Add/fix MLS building matching logic\n";
echo "3. Test with property C12380712\n";
