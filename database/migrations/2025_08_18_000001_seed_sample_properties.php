<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert sample properties with proper images and data
        $properties = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440001',
                'title' => 'Luxury Downtown Condo',
                'description' => 'Beautiful modern condo in the heart of downtown Toronto with stunning city views.',
                'address' => '123 Bay Street',
                'full_address' => '123 Bay Street, Toronto, ON M5H 2Y2',
                'city' => 'Toronto',
                'province' => 'ON',
                'postal_code' => 'M5H 2Y2',
                'country' => 'Canada',
                'latitude' => 43.6426,
                'longitude' => -79.3871,
                'price' => 850000.00,
                'property_type' => 'Condo Apartment',
                'transaction_type' => 'sale',
                'status' => 'active',
                'bedrooms' => 2,
                'bathrooms' => 2,
                'area' => 1200.00,
                'area_unit' => 'sqft',
                'parking' => 1,
                'maintenance_fees' => 650.00,
                'property_taxes' => 4500.00,
                'exposure' => 'South',
                'year_built' => 2019,
                'features' => json_encode(['Hardwood Floors', 'Granite Counters', 'Stainless Appliances', 'Balcony', 'Concierge']),
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&auto=format&q=80'
                ]),
                'mls_number' => 'C5123456',
                'is_featured' => true,
                'listing_date' => '2024-12-01',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440002',
                'title' => 'Spacious Family Home',
                'description' => 'Perfect family home with large backyard in quiet residential neighborhood.',
                'address' => '456 Maple Avenue',
                'full_address' => '456 Maple Avenue, North York, ON M2N 3K1',
                'city' => 'North York',
                'province' => 'ON',
                'postal_code' => 'M2N 3K1',
                'country' => 'Canada',
                'latitude' => 43.7615,
                'longitude' => -79.4111,
                'price' => 1200000.00,
                'property_type' => 'Detached',
                'transaction_type' => 'sale',
                'status' => 'active',
                'bedrooms' => 4,
                'bathrooms' => 3,
                'area' => 2500.00,
                'area_unit' => 'sqft',
                'parking' => 2,
                'property_taxes' => 8500.00,
                'exposure' => 'West',
                'year_built' => 2005,
                'features' => json_encode(['Finished Basement', 'Hardwood Floors', 'Updated Kitchen', 'Large Deck', 'Fenced Yard']),
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop&auto=format&q=80'
                ]),
                'mls_number' => 'N5789012',
                'is_featured' => false,
                'listing_date' => '2024-11-25',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440003',
                'title' => 'Modern Rental Unit',
                'description' => 'Brand new 1-bedroom rental unit with all modern amenities.',
                'address' => '789 Queen Street West',
                'full_address' => '789 Queen Street West, Toronto, ON M6J 1G1',
                'city' => 'Toronto',
                'province' => 'ON',
                'postal_code' => 'M6J 1G1',
                'country' => 'Canada',
                'latitude' => 43.6438,
                'longitude' => -79.4095,
                'price' => 2200.00,
                'property_type' => 'Condo Apartment',
                'transaction_type' => 'rent',
                'status' => 'active',
                'bedrooms' => 1,
                'bathrooms' => 1,
                'area' => 650.00,
                'area_unit' => 'sqft',
                'parking' => 0,
                'maintenance_fees' => 0.00,
                'exposure' => 'East',
                'year_built' => 2022,
                'features' => json_encode(['In-unit Laundry', 'Dishwasher', 'Air Conditioning', 'Gym Access', 'Rooftop Terrace']),
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&auto=format&q=80'
                ]),
                'mls_number' => 'W5345678',
                'is_featured' => false,
                'listing_date' => '2024-12-10',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440004',
                'title' => 'Luxury Penthouse',
                'description' => 'Stunning penthouse with panoramic city views and premium finishes.',
                'address' => '100 Harbour Street',
                'full_address' => '100 Harbour Street, Toronto, ON M5J 1B6',
                'city' => 'Toronto',
                'province' => 'ON',
                'postal_code' => 'M5J 1B6',
                'country' => 'Canada',
                'latitude' => 43.6419,
                'longitude' => -79.3755,
                'price' => 2500000.00,
                'property_type' => 'Condo Apartment',
                'transaction_type' => 'sale',
                'status' => 'active',
                'bedrooms' => 3,
                'bathrooms' => 3,
                'area' => 2200.00,
                'area_unit' => 'sqft',
                'parking' => 2,
                'maintenance_fees' => 1200.00,
                'property_taxes' => 12000.00,
                'exposure' => 'South-West',
                'year_built' => 2020,
                'features' => json_encode(['Floor-to-ceiling Windows', 'Private Terrace', 'Wine Storage', 'Smart Home', 'Concierge', 'Valet Parking']),
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&auto=format&q=80'
                ]),
                'mls_number' => 'C5987654',
                'is_featured' => true,
                'listing_date' => '2024-12-05',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440005',
                'title' => 'Cozy Townhouse',
                'description' => 'Charming townhouse in family-friendly community with great schools nearby.',
                'address' => '321 Oak Street',
                'full_address' => '321 Oak Street, Mississauga, ON L5B 3Y7',
                'city' => 'Mississauga',
                'province' => 'ON',
                'postal_code' => 'L5B 3Y7',
                'country' => 'Canada',
                'latitude' => 43.5890,
                'longitude' => -79.6441,
                'price' => 750000.00,
                'property_type' => 'Townhouse',
                'transaction_type' => 'sale',
                'status' => 'active',
                'bedrooms' => 3,
                'bathrooms' => 2,
                'area' => 1600.00,
                'area_unit' => 'sqft',
                'parking' => 1,
                'maintenance_fees' => 350.00,
                'property_taxes' => 5500.00,
                'exposure' => 'North',
                'year_built' => 2010,
                'features' => json_encode(['Fireplace', 'Patio', 'Storage', 'Near Schools', 'Community Center']),
                'images' => json_encode([
                    'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop&auto=format&q=80',
                    'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&h=600&fit=crop&auto=format&q=80'
                ]),
                'mls_number' => 'W5246810',
                'is_featured' => false,
                'listing_date' => '2024-11-30',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        // Insert the sample properties
        foreach ($properties as $property) {
            DB::table('properties')->insertOrIgnore($property);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the sample properties
        DB::table('properties')->whereIn('id', [
            '550e8400-e29b-41d4-a716-446655440001',
            '550e8400-e29b-41d4-a716-446655440002',
            '550e8400-e29b-41d4-a716-446655440003',
            '550e8400-e29b-41d4-a716-446655440004',
            '550e8400-e29b-41d4-a716-446655440005'
        ])->delete();
    }
};
