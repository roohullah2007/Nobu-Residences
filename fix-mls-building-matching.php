<?php

// Direct fix for WebsiteController propertyDetail method
$file = 'app/Http/Controllers/WebsiteController.php';
$content = file_get_contents($file);

// Add the missing MLS building matching logic after the AMPRE property data formatting
$searchFor = '                    // Format the property data
                    $propertyData = $this->formatAmprePropertyData($ampreProperty);';

$addAfter = '                    // Format the property data
                    $propertyData = $this->formatAmprePropertyData($ampreProperty);
                    
                    // Try to match building by address for MLS properties
                    if (!empty($propertyData[\'address\'])) {
                        // Extract building address from full property address
                        // Example: "15 Mercer Street 610, Toronto C01, ON M5V 1H2" -> "15 Mercer Street"
                        $fullAddress = $propertyData[\'address\'];
                        
                        // Extract street number and street name
                        if (preg_match(\'/^(\d+)\s+([^,\d]+?)(?:\s+\d+)?(?:,|$)/\', $fullAddress, $matches)) {
                            $streetNumber = $matches[1]; // "15"
                            $streetName = trim($matches[2]); // "Mercer Street"
                            $buildingAddress = $streetNumber . \' \' . $streetName; // "15 Mercer Street"
                            
                            \Log::info(\'MLS property building matching\', [
                                \'listing_key\' => $listingKey,
                                \'full_address\' => $fullAddress,
                                \'extracted_address\' => $buildingAddress,
                                \'street_number\' => $streetNumber,
                                \'street_name\' => $streetName
                            ]);
                            
                            // Find building by address
                            $building = \\App\\Models\\Building::with([\'amenities\' => function($query) {
                                $query->orderBy(\'name\');
                            }])->where(\'address\', \'LIKE\', \'%\' . $buildingAddress . \'%\')
                                ->first();
                            
                            if ($building) {
                                // Force load the amenities relationship
                                $building->load(\'amenities\');
                                
                                $amenities = $building->amenities->map(function($amenity) {
                                    return [
                                        \'id\' => $amenity->id,
                                        \'name\' => $amenity->name,
                                        \'icon\' => $amenity->icon
                                    ];
                                })->toArray();
                                
                                $buildingData = [
                                    \'id\' => $building->id,
                                    \'name\' => $building->name,
                                    \'slug\' => $building->slug,
                                    \'address\' => $building->address,
                                    \'main_image\' => $building->main_image,
                                    \'units_for_sale\' => $building->units_for_sale,
                                    \'units_for_rent\' => $building->units_for_rent,
                                    \'amenities\' => $amenities
                                ];
                                
                                \Log::info(\'MLS property matched to building\', [
                                    \'listing_key\' => $listingKey,
                                    \'building_name\' => $building->name,
                                    \'building_address\' => $building->address,
                                    \'amenities_count\' => count($amenities),
                                    \'amenities\' => $amenities
                                ]);
                            } else {
                                \Log::info(\'No building found for MLS property\', [
                                    \'listing_key\' => $listingKey,
                                    \'searched_address\' => $buildingAddress
                                ]);
                            }
                        } else {
                            \Log::warning(\'Failed to parse address for MLS property\', [
                                \'listing_key\' => $listingKey,
                                \'full_address\' => $fullAddress
                            ]);
                        }
                    }';

if (strpos($content, $searchFor) !== false) {
    $newContent = str_replace($searchFor, $addAfter, $content);
    file_put_contents($file, $newContent);
    echo "✅ Added MLS building matching logic to WebsiteController\n";
    echo "The controller will now properly extract building addresses from MLS properties\n";
    echo "and match them to existing buildings in the database.\n\n";
    echo "Test the fix by visiting: http://127.0.0.1:8000/toronto/15-mercer-street-610/C12380712\n";
} else {
    echo "❌ Could not find the target location in WebsiteController\n";
    echo "Manual fix required in the propertyDetail method\n";
}
