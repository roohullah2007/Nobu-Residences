<?php

namespace Database\Seeders;

use App\Models\Building;
use App\Models\Property;
use Illuminate\Database\Seeder;

class BuildingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample buildings data
        $buildings = [
            [
                'name' => 'The Residences at NOBU',
                'description' => 'Luxury condominiums featuring world-class amenities and stunning city views.',
                'address' => '15 Mercer Street',
                'full_address' => '15 Mercer Street, Toronto, ON M5V 1H2',
                'city' => 'Toronto',
                'province' => 'Ontario',
                'postal_code' => 'M5V 1H2',
                'latitude' => 43.6444,
                'longitude' => -79.3874,
                'building_type' => 'Condo',
                'total_floors' => 45,
                'total_units' => 660,
                'year_built' => 2021,
                'developer_name' => 'Madison Group',
                'management_company' => 'FirstService Residential',
                'architect' => 'Teeple Architects',
                'maintenance_fee_range_min' => 450.00,
                'maintenance_fee_range_max' => 1200.00,
                'property_tax_range_min' => 3500.00,
                'property_tax_range_max' => 12000.00,
                'amenities' => [
                    'Concierge', 'Fitness Centre', 'Pool', 'Rooftop Terrace', 
                    'Party Room', 'Guest Suites', 'Valet Parking'
                ],
                'features' => [
                    'Floor-to-ceiling windows', 'Hardwood floors', 
                    'Stainless steel appliances', 'Granite countertops'
                ],
                'images' => [
                    '/assets/nobu-building.jpg'
                ],
                'status' => 'active',
                'is_featured' => true,
                'mls_building_id' => 'NOBU_TORONTO_001',
            ],
            [
                'name' => 'One Bloor East',
                'description' => 'Premium high-rise living in the heart of Yorkville.',
                'address' => '1 Bloor Street East',
                'full_address' => '1 Bloor Street East, Toronto, ON M4W 1A9',
                'city' => 'Toronto',
                'province' => 'Ontario',
                'postal_code' => 'M4W 1A9',
                'latitude' => 43.6708,
                'longitude' => -79.3899,
                'building_type' => 'Condo',
                'total_floors' => 76,
                'total_units' => 756,
                'year_built' => 2017,
                'developer_name' => 'Great Gulf',
                'management_company' => 'FirstService Residential',
                'architect' => 'Hariri Pontarini Architects',
                'maintenance_fee_range_min' => 500.00,
                'maintenance_fee_range_max' => 1500.00,
                'property_tax_range_min' => 4000.00,
                'property_tax_range_max' => 15000.00,
                'amenities' => [
                    'Concierge', 'Fitness Centre', 'Pool', 'Spa', 
                    'Theatre Room', 'Wine Cellar', 'Outdoor Terraces'
                ],
                'features' => [
                    'Panoramic city views', 'Premium finishes', 
                    'Smart home technology', 'Built-in appliances'
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'
                ],
                'status' => 'active',
                'is_featured' => true,
                'mls_building_id' => 'ONE_BLOOR_EAST_001',
            ],
            [
                'name' => 'Harbour Plaza Residences',
                'description' => 'Waterfront luxury living with stunning lake views.',
                'address' => '90 Harbour Street',
                'full_address' => '90 Harbour Street, Toronto, ON M5J 2N7',
                'city' => 'Toronto',
                'province' => 'Ontario',
                'postal_code' => 'M5J 2N7',
                'latitude' => 43.6426,
                'longitude' => -79.3799,
                'building_type' => 'Condo',
                'total_floors' => 38,
                'total_units' => 426,
                'year_built' => 2019,
                'developer_name' => 'Menkes Developments',
                'management_company' => 'Brookfield Properties',
                'architect' => 'P + S / Kirkor',
                'maintenance_fee_range_min' => 400.00,
                'maintenance_fee_range_max' => 1000.00,
                'property_tax_range_min' => 3000.00,
                'property_tax_range_max' => 10000.00,
                'amenities' => [
                    'Waterfront Promenade', 'Fitness Centre', 'Pool', 
                    'Party Room', 'Business Centre', 'Pet Spa'
                ],
                'features' => [
                    'Lake views', 'Modern kitchen', 
                    'Ensuite laundry', 'Balconies'
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
                ],
                'status' => 'active',
                'is_featured' => false,
                'mls_building_id' => 'HARBOUR_PLAZA_001',
            ]
        ];

        foreach ($buildings as $buildingData) {
            $building = Building::create($buildingData);

            // Create sample properties for each building
            $this->createSampleProperties($building);
        }
    }

    private function createSampleProperties(Building $building)
    {
        $propertyTypes = ['1 Bedroom', '2 Bedroom', '3 Bedroom', 'Penthouse'];
        $transactionTypes = ['sale', 'rent'];
        
        for ($i = 0; $i < rand(3, 8); $i++) {
            $bedrooms = rand(1, 3);
            $propertyType = $propertyTypes[$bedrooms - 1] ?? '1 Bedroom';
            $transactionType = $transactionTypes[array_rand($transactionTypes)];
            
            $basePrice = match($bedrooms) {
                1 => rand(400000, 600000),
                2 => rand(600000, 900000),
                3 => rand(900000, 1500000),
                default => rand(400000, 600000)
            };

            if ($transactionType === 'rent') {
                $basePrice = intval($basePrice * 0.004); // Convert to monthly rent
            }

            Property::create([
                'building_id' => $building->id,
                'title' => $propertyType . ' at ' . $building->name,
                'description' => 'Beautiful ' . strtolower($propertyType) . ' with modern finishes and great amenities.',
                'address' => $building->address,
                'full_address' => $building->full_address,
                'city' => $building->city,
                'province' => $building->province,
                'postal_code' => $building->postal_code,
                'country' => $building->country ?? 'Canada',
                'latitude' => $building->latitude + (rand(-10, 10) / 10000), // Slight variation
                'longitude' => $building->longitude + (rand(-10, 10) / 10000),
                'price' => $basePrice,
                'property_type' => 'Condo Apartment',
                'transaction_type' => $transactionType,
                'status' => 'active',
                'bedrooms' => $bedrooms,
                'bathrooms' => $bedrooms + rand(0, 1),
                'area' => rand(500, 1200),
                'area_unit' => 'sqft',
                'parking' => rand(0, 2),
                'maintenance_fees' => rand(400, 800),
                'property_taxes' => rand(3000, 8000),
                'year_built' => $building->year_built,
                'features' => [
                    'Hardwood floors', 'Stainless steel appliances', 
                    'Granite countertops', 'In-suite laundry'
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop'
                ],
                'listing_date' => now()->subDays(rand(1, 30)),
                'mls_number' => 'MLS' . rand(100000, 999999),
                'is_featured' => rand(0, 1) == 1,
                'view_count' => rand(0, 100),
            ]);
        }
    }
}