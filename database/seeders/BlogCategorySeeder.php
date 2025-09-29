<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BlogCategory;

class BlogCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Market Insights',
                'slug' => 'market-insights',
                'description' => 'Latest real estate market trends and analysis',
                'featured_image' => 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop',
                'sort_order' => 1
            ],
            [
                'name' => 'Tips',
                'slug' => 'tips',
                'description' => 'Helpful tips for buyers and sellers',
                'featured_image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                'sort_order' => 2
            ],
            [
                'name' => 'Lifestyle',
                'slug' => 'lifestyle',
                'description' => 'Lifestyle and neighborhood features',
                'featured_image' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=400&fit=crop',
                'sort_order' => 3
            ],
            [
                'name' => 'News',
                'slug' => 'news',
                'description' => 'Latest real estate news and updates',
                'featured_image' => 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=400&fit=crop',
                'sort_order' => 4
            ],
        ];

        foreach ($categories as $category) {
            BlogCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
