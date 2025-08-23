<?php

namespace Database\Seeders;

use App\Models\Building;
use Illuminate\Database\Seeder;

class BuildingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $buildings = [
            [
                'name' => 'Nobu Residences Toronto',
                'address' => '15 Mercer Street',
                'full_address' => '15 Mercer Street, Toronto, ON M5V 1H2',
                'city' => 'Toronto',
                'province' => 'ON',
                'postal_code' => 'M5V 1H2',
                'country' => 'Canada',
                'latitude' => 43.6426,
                'longitude' => -79.3871,
                'building_type' => 'Luxury Condominium',
                'developer_name' => 'Madison Group',
                'year_built' => 2022,
                'total_units' => 678,
                'total_floors' => 45,
                'description' => 'Luxury condominium tower featuring world-class amenities and stunning city views.',
                'status' => 'active',
                'amenities' => json_encode([
                    'Concierge Service',
                    'Fitness Centre',
                    'Rooftop Terrace',
                    'Pool',
                    'Valet Parking',
                    'Business Center'
                ]),
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
                ])
            ],
            [
                'name' => 'The Yorkville',
                'address' => '1200 Bay Street',
                'full_address' => '1200 Bay Street, Toronto, ON M5R 2A5',
                'city' => 'Toronto',
                'province' => 'ON',
                'postal_code' => 'M5R 2A5',
                'country' => 'Canada',
                'latitude' => 43.6719,
                'longitude' => -79.3906,
                'building_type' => 'Luxury Condominium',
                'developer_name' => 'Camrost Felcorp',
                'year_built' => 2021,
                'total_units' => 456,
                'total_floors' => 32,
                'description' => 'Premium residential building in the heart of Yorkville.',
                'status' => 'active',
                'amenities' => json_encode([
                    '24/7 Concierge',
                    'Gym',
                    'Outdoor Terrace',
                    'Guest Suites',
                    'Storage Lockers'
                ]),
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
                ])
            ],
            [
                'name' => 'King West Towers',
                'address' => '500 King Street West',
                'full_address' => '500 King Street West, Toronto, ON M5V 1L9',
                'city' => 'Toronto',
                'province' => 'ON',
                'postal_code' => 'M5V 1L9',
                'country' => 'Canada',
                'latitude' => 43.6447,
                'longitude' => -79.3963,
                'building_type' => 'Mixed Use',
                'developer_name' => 'Menkes Developments',
                'year_built' => 2020,
                'total_units' => 589,
                'total_floors' => 38,
                'description' => 'Modern mixed-use development with retail and residential components.',
                'status' => 'active',
                'amenities' => json_encode([
                    'Concierge',
                    'Fitness Facility',
                    'Party Room',
                    'Rooftop Garden',
                    'Pet Washing Station'
                ]),
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1565623833408-d77e39b88af6?w=800&h=600&fit=crop'
                ])
            ]
        ];

        foreach ($buildings as $buildingData) {
            Building::updateOrCreate(
                ['name' => $buildingData['name'], 'city' => $buildingData['city']],
                $buildingData
            );
        }
    }
}