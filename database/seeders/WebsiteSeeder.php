<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Website;
use App\Models\WebsitePage;

class WebsiteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default website
        $website = Website::updateOrCreate(
            ['slug' => 'nobu-residences'],
            [
                'name' => 'Nobu Residences',
                'slug' => 'nobu-residences',
                'is_default' => true,
                'is_active' => true,
                'logo_url' => '/assets/logo.png',
                'domain' => null,
                'description' => 'Luxury condos in downtown Toronto',
                'timezone' => 'America/Toronto',
                'brand_colors' => [
                    'primary' => '#912018',
                    'secondary' => '#293056',
                    'accent' => '#F5F8FF',
                    'text' => '#000000',
                    'background' => '#FFFFFF'
                ],
                'contact_info' => [
                    'phone' => '+1 437 998 1795',
                    'email' => 'contact@noburesidences.com',
                    'address' => 'Building No.88, Toronto CA, Ontario, Toronto',
                    'agent' => [
                        'name' => 'Jatin Gill',
                        'title' => 'Property Manager'
                    ]
                ],
                'social_media' => [
                    'facebook' => 'https://facebook.com/noburesidences',
                    'instagram' => 'https://instagram.com/noburesidences',
                    'twitter' => 'https://twitter.com/noburesidences',
                    'linkedin' => 'https://linkedin.com/company/noburesidences'
                ],
                'meta_title' => 'Nobu Residences - Luxury Toronto Condos',
                'meta_description' => 'Discover luxury living at Nobu Residences in downtown Toronto. Premium condos with world-class amenities.',
                'meta_keywords' => 'Toronto condos, luxury condos, Nobu Residences, downtown Toronto',
                'favicon_url' => '/favicon.ico'
            ]
        );
    }
}
