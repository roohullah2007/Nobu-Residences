<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Faker-free and idempotent so it can run on production, where deploys
     * install with composer --no-dev (no fakerphp/faker) and may pass
     * --seed on every release. Demo accounts are only created outside
     * production.
     */
    public function run(): void
    {
        if (!app()->environment('production')) {
            User::updateOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Admin User',
                    'role' => 'admin',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            User::updateOrCreate(
                ['email' => 'test@example.com'],
                [
                    'name' => 'Test User',
                    'role' => 'user',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
        }

        // Seed icons and website data
        $this->call([
            IconSeeder::class,
            WebsiteSeeder::class,
            BuildingSeeder::class,  // Seed buildings
            // PropertySeeder::class,  // Add sample properties with address protection - disabled due to missing columns
        ]);
    }
}
