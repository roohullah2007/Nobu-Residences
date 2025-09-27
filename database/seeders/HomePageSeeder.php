<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Website;
use App\Models\WebsitePage;

class HomePageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create default website
        $website = Website::firstOrCreate(
            ['slug' => 'nobu-residences'],
            [
                'name' => 'Nobu Residences',
                'is_default' => true,
                'is_active' => true,
                'logo_url' => '/assets/logo.png',
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
                ]
            ]
        );

        // Create or update home page with FAQ data
        WebsitePage::updateOrCreate(
            [
                'website_id' => $website->id,
                'page_type' => 'home'
            ],
            [
                'title' => 'Home - Nobu Residences',
                'content' => WebsitePage::getDefaultHomeContent(),
                'is_active' => true,
                'sort_order' => 0
            ]
        );

        $this->command->info('Home page seeded successfully with FAQ data!');
    }
}
