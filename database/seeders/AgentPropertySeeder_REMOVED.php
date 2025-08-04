<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Property;
use Illuminate\Support\Facades\Hash;

class AgentPropertySeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create an agent user
        $agent = User::create([
            'name' => 'Jatin Gill',
            'email' => 'jatin@noburesidences.com',
            'password' => Hash::make('password'),
            'role' => 'agent',
            'phone' => '+1 437 998 1795',
            'bio' => 'Experienced real estate agent specializing in luxury condos in downtown Toronto.',
            'license_number' => 'RE123456',
            'brokerage' => 'Nobu Residences Inc.',
            'is_active' => true,
        ]);

        // Create sample properties
        $properties = [
            [
                'id' => 'dba2b835-2239-486a-8ca0-57ece3badbc4',
                'title' => 'Appartement lumineux avec balcon',
                'description' => 'Appartement lumineux avec balcon, proche du Vieux-Port et des commodités.',
                'address' => '33 Rue Nationale, 13000 Marseille',
                'full_address' => '33 Rue Nationale, 13000 Marseille, France',
                'city' => 'Marseille',
                'province' => 'Provence-Alpes-Côte d\'Azur',
                'postal_code' => '13000',
                'latitude' => 43.2965,
                'longitude' => 5.3698,
                'price' => 195000,
                'contact_price' => 15.00,
                'property_type' => 'apartment',
                'transaction_type' => 'sale',
                'bedrooms' => 2,
                'bathrooms' => 1,
                'area' => 70,
                'area_unit' => 'sqm',
                'parking' => 0,
                'maintenance_fees' => null,
                'property_taxes' => null,
                'exposure' => 'South',
                'year_built' => 1980,
                'features' => [
                    'Floor-to-ceiling windows',
                    'Hardwood floors',
                    'Stainless steel appliances',
                    'Balcony',
                    'Ensuite laundry',
                    'Concierge',
                    'Gym',
                    'Rooftop terrace'
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                ],
                'listing_date' => now(),
                'is_featured' => true,
            ],
            [
                'title' => '1205 - 88 Scott Street',
                'description' => 'Luxury 1-bedroom condo with stunning lake views. This bright and spacious unit features modern finishes, a private balcony, and access to world-class amenities including a fitness center, pool, and 24-hour concierge.',
                'address' => '1205 - 88 Scott Street, Toronto, ON',
                'full_address' => '1205 - 88 Scott Street, Financial District, Toronto, ON M5E 1G5',
                'city' => 'Toronto',
                'province' => 'Ontario',
                'postal_code' => 'M5E 1G5',
                'latitude' => 43.6465,
                'longitude' => -79.3756,
                'price' => 850000,
                'contact_price' => 12.00,
                'property_type' => 'condo',
                'transaction_type' => 'sale',
                'bedrooms' => 1,
                'bathrooms' => 1,
                'area' => 650,
                'parking' => 1,
                'maintenance_fees' => 850,
                'property_taxes' => 4200,
                'exposure' => 'South',
                'year_built' => 2020,
                'features' => [
                    'Lake views',
                    'Floor-to-ceiling windows',
                    'Modern kitchen',
                    'Private balcony',
                    'Concierge',
                    'Fitness center',
                    'Swimming pool',
                    'Party room'
                ],
                'images' => [
                    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1000&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1000&h=600&fit=crop&auto=format&q=80'
                ],
                'listing_date' => now()->subDays(5),
                'is_featured' => false,
            ],
        ];

        foreach ($properties as $propertyData) {
            Property::create(array_merge($propertyData, [
                'agent_id' => $agent->id,
            ]));
        }
    }
}
