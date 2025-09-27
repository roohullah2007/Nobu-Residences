<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;
use App\Models\User;

class PropertySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // First, ensure we have at least one agent user
        $agent = User::where('email', 'agent@example.com')->first();
        
        if (!$agent) {
            $agent = User::create([
                'name' => 'John Smith',
                'email' => 'agent@example.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                // 'phone' => '+1 (555) 123-4567',
                // 'brokerage' => 'Premium Real Estate',
                // 'license_number' => 'RE12345',
                // 'is_active' => true,
            ]);
        }

        // Create sample properties with realistic data
        $properties = [
            [
                'title' => 'Luxury Downtown Condo',
                'description' => 'Beautiful 2-bedroom condo in the heart of downtown with stunning city views. Features modern amenities, granite countertops, stainless steel appliances, and a private balcony.',
                'address' => '123 King Street West',
                'full_address' => '123 King Street West, Unit 1205, Toronto, ON M5H 3M9',
                'city' => 'Toronto',
                'province' => 'Ontario',
                'postal_code' => 'M5H 3M9',
                'country' => 'Canada',
                'latitude' => 43.6426,
                'longitude' => -79.3871,
                'price' => 850000.00,
                'property_type' => 'condo',
                'transaction_type' => 'sale',
                'status' => 'active',
                'bedrooms' => 2,
                'bathrooms' => 2,
                'area' => 1200,
                'area_unit' => 'sqft',
                'parking' => 1,
                'maintenance_fees' => 650.00,
                'property_taxes' => 4200.00,
                'exposure' => 'South',
                'year_built' => 2018,
                'features' => ['Granite Countertops', 'Stainless Steel Appliances', 'Balcony', 'In-unit Laundry', 'Gym Access'],
                'images' => [
                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
                ],
                'listing_date' => now()->subDays(7),
                'is_featured' => true,
            ],
            [
                'title' => 'Charming Family Home',
                'description' => 'Spacious 4-bedroom family home in a quiet neighborhood. Recently renovated kitchen and bathrooms, large backyard perfect for children and pets.',
                'address' => '456 Maple Avenue',
                'full_address' => '456 Maple Avenue, North York, ON M2N 2K8',
                'city' => 'North York',
                'province' => 'Ontario',
                'postal_code' => 'M2N 2K8',
                'country' => 'Canada',
                'latitude' => 43.7615,
                'longitude' => -79.4119,
                'price' => 1250000.00,
                'contact_price' => 12.00,
                'property_type' => 'detached',
                'transaction_type' => 'sale',
                'status' => 'active',
                'bedrooms' => 4,
                'bathrooms' => 3,
                'area' => 2400,
                'area_unit' => 'sqft',
                'parking' => 2,
                'property_taxes' => 8500.00,
                'exposure' => 'West',
                'year_built' => 1995,
                'features' => ['Updated Kitchen', 'Hardwood Floors', 'Large Backyard', 'Finished Basement', 'Double Garage'],
                'images' => [
                    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop'
                ],
                'listing_date' => now()->subDays(3),
                'is_featured' => false,
            ],
            [
                'title' => 'Modern Townhouse',
                'description' => 'Contemporary 3-bedroom townhouse with open concept living. Features include a rooftop terrace, modern kitchen with quartz counters, and attached garage.',
                'address' => '789 Oak Street',
                'full_address' => '789 Oak Street, Unit 15, Mississauga, ON L5B 1M6',
                'city' => 'Mississauga',
                'province' => 'Ontario',
                'postal_code' => 'L5B 1M6',
                'country' => 'Canada',
                'latitude' => 43.5890,
                'longitude' => -79.6441,
                'price' => 750000.00,
                'contact_price' => 10.00,
                'property_type' => 'townhouse',
                'transaction_type' => 'sale',
                'status' => 'active',
                'bedrooms' => 3,
                'bathrooms' => 2,
                'area' => 1800,
                'area_unit' => 'sqft',
                'parking' => 1,
                'maintenance_fees' => 180.00,
                'property_taxes' => 5200.00,
                'exposure' => 'East',
                'year_built' => 2020,
                'features' => ['Rooftop Terrace', 'Quartz Counters', 'Open Concept', 'Attached Garage', 'Modern Design'],
                'images' => [
                    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
                ],
                'listing_date' => now()->subDays(1),
                'is_featured' => true,
            ],
            [
                'title' => 'Luxury Rental Apartment',
                'description' => 'High-end 1-bedroom apartment for rent in a premium building. Includes concierge service, gym, pool, and rooftop lounge.',
                'address' => '321 Bay Street',
                'full_address' => '321 Bay Street, Unit 2501, Toronto, ON M5H 2Y1',
                'city' => 'Toronto',
                'province' => 'Ontario',
                'postal_code' => 'M5H 2Y1',
                'country' => 'Canada',
                'latitude' => 43.6532,
                'longitude' => -79.3832,
                'price' => 2800.00,
                'contact_price' => 8.00,
                'property_type' => 'apartment',
                'transaction_type' => 'rent',
                'status' => 'active',
                'bedrooms' => 1,
                'bathrooms' => 1,
                'area' => 750,
                'area_unit' => 'sqft',
                'parking' => 1,
                'maintenance_fees' => 0.00, // Included in rent
                'exposure' => 'South',
                'year_built' => 2019,
                'features' => ['Concierge', 'Gym', 'Pool', 'Rooftop Lounge', 'Floor-to-Ceiling Windows'],
                'images' => [
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop'
                ],
                'listing_date' => now()->subDays(5),
                'is_featured' => false,
            ],
            [
                'title' => 'Executive Commercial Space',
                'description' => 'Prime commercial space for lease in the financial district. Perfect for professional offices, recently renovated with modern finishes.',
                'address' => '100 Queen Street West',
                'full_address' => '100 Queen Street West, Suite 1200, Toronto, ON M5H 2N2',
                'city' => 'Toronto',
                'province' => 'Ontario',
                'postal_code' => 'M5H 2N2',
                'country' => 'Canada',
                'latitude' => 43.6520,
                'longitude' => -79.3844,
                'price' => 8500.00,
                'contact_price' => 20.00,
                'property_type' => 'commercial',
                'transaction_type' => 'lease',
                'status' => 'active',
                'bedrooms' => 0,
                'bathrooms' => 2,
                'area' => 3500,
                'area_unit' => 'sqft',
                'parking' => 4,
                'maintenance_fees' => 1200.00,
                'exposure' => 'North',
                'year_built' => 2010,
                'features' => ['Modern Finishes', 'Conference Rooms', 'Reception Area', 'Parking Included', 'Transit Access'],
                'images' => [
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop'
                ],
                'listing_date' => now()->subDays(10),
                'is_featured' => false,
            ]
        ];

        foreach ($properties as $propertyData) {
            Property::create(array_merge($propertyData, [
                'agent_id' => $agent->id,
            ]));
        }

        // Create a second agent with some properties
        $agent2 = User::create([
            'name' => 'Sarah Wilson',
            'email' => 'sarah@realestate.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            // 'phone' => '+1 (555) 987-6543',
            // 'brokerage' => 'Elite Properties Inc.',
            // 'license_number' => 'RE67890',
            // 'is_active' => true,
        ]);

        // Add a few more properties for the second agent
        $agent2Properties = [
            [
                'title' => 'Waterfront Luxury Condo',
                'description' => 'Stunning waterfront condo with panoramic lake views. Premium finishes throughout, private terrace, and access to exclusive amenities.',
                'address' => '88 Harbour Street',
                'full_address' => '88 Harbour Street, Unit 4502, Toronto, ON M5J 2G2',
                'city' => 'Toronto',
                'province' => 'Ontario',
                'postal_code' => 'M5J 2G2',
                'country' => 'Canada',
                'latitude' => 43.6405,
                'longitude' => -79.3790,
                'price' => 1850000.00,
                'contact_price' => 25.00,
                'property_type' => 'condo',
                'transaction_type' => 'sale',
                'status' => 'active',
                'bedrooms' => 3,
                'bathrooms' => 3,
                'area' => 2100,
                'area_unit' => 'sqft',
                'parking' => 2,
                'maintenance_fees' => 1200.00,
                'property_taxes' => 12000.00,
                'exposure' => 'South',
                'year_built' => 2021,
                'features' => ['Lake Views', 'Private Terrace', 'Premium Finishes', 'Concierge', 'Valet Parking'],
                'images' => [
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
                ],
                'listing_date' => now()->subDays(2),
                'is_featured' => true,
            ]
        ];

        foreach ($agent2Properties as $propertyData) {
            Property::create(array_merge($propertyData, [
                'agent_id' => $agent2->id,
            ]));
        }

        $this->command->info('Sample properties created successfully!');
    }
}
