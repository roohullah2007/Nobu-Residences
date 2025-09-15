<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Amenity;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class AmenitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create amenity-icons directory if it doesn't exist
        Storage::disk('public')->makeDirectory('amenity-icons', 0755, true);

        $amenities = [
            ['name' => 'Concierge', 'icon' => 'concierge.svg'],
            ['name' => 'Gym', 'icon' => 'gym.svg'],
            ['name' => 'Guest Suites', 'icon' => 'bed.svg'],
            ['name' => 'Outdoor Pool', 'icon' => 'pool-ladder.svg'],
            ['name' => 'Party Room', 'icon' => 'party-horn.svg'],
            ['name' => 'Visitor Parking', 'icon' => 'parking.svg'],
            ['name' => 'Pet Restriction', 'icon' => 'pets.svg'],
            ['name' => 'Media Room', 'icon' => 'media.svg'],
            ['name' => 'Meeting Room', 'icon' => 'meeting-consider-deliberate-about-meet.svg'],
            ['name' => 'Parking Garage', 'icon' => 'parking-garage-transportation-car-parking.svg'],
            ['name' => 'BBQ Permitted', 'icon' => 'bbq-grill.svg'],
            ['name' => 'Rooftop Deck', 'icon' => 'deck-chair-under-the-sun.svg'],
            ['name' => 'Security Guard', 'icon' => 'police-security-policeman.svg'],
            ['name' => 'Security System', 'icon' => 'security.svg'],
        ];

        foreach ($amenities as $amenityData) {
            $sourcePath = public_path('assets/svgs/' . $amenityData['icon']);

            if (File::exists($sourcePath)) {
                // Copy icon to storage
                $destinationPath = 'amenity-icons/' . $amenityData['icon'];
                Storage::disk('public')->put($destinationPath, File::get($sourcePath));

                // Create or update amenity
                Amenity::updateOrCreate(
                    ['name' => $amenityData['name']],
                    ['icon' => Storage::url($destinationPath)]
                );
            } else {
                // Create amenity without icon if file doesn't exist
                Amenity::updateOrCreate(
                    ['name' => $amenityData['name']],
                    ['icon' => null]
                );
            }
        }

        $this->command->info('Amenities seeded successfully!');
    }
}