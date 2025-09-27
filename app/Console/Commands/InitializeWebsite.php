<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Website;
use App\Models\WebsitePage;
use App\Models\User;

class InitializeWebsite extends Command
{
    protected $signature = 'website:init';
    protected $description = 'Initialize the website with default data';

    public function handle()
    {
        $this->info('Initializing website...');

        // Create default website if it doesn't exist
        $website = Website::firstOrCreate(
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

        // Create home page if it doesn't exist
        $homePage = $website->pages()->where('page_type', 'home')->first();
        if (!$homePage) {
            WebsitePage::create([
                'website_id' => $website->id,
                'page_type' => 'home',
                'title' => "Home - {$website->name}",
                'content' => WebsitePage::getDefaultHomeContent(),
                'is_active' => true,
                'sort_order' => 0,
            ]);
            $this->info('Created default home page.');
        }

        // Create admin user if it doesn't exist
        $adminUser = User::where('email', 'admin@example.com')->first();
        if (!$adminUser) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
            $this->info('Created admin user (admin@example.com / password).');
        }

        $this->info('Website initialization completed!');
        $this->info("Website ID: {$website->id}");
        $this->info("Visit: http://127.0.0.1:8000/admin/websites/{$website->id}/home-page/edit");
        
        return 0;
    }
}
