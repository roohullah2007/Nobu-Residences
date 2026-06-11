<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Remove the seeded Miami "dummy" blog posts. This is a Toronto site, so
     * these Miami-focused sample posts are placeholder content. Deleting them
     * via a migration cleans up production too on the next deploy/migrate.
     */
    private array $dummySlugs = [
        'understanding-miami-real-estate-market-2025',
        '5-tips-first-time-home-buyers',
        'luxury-living-nobu-residences-miami',
        'investment-opportunities-miami-beach',
        'new-development-exclusive-waterfront-condos',
        'miami-neighborhoods-guide',
    ];

    public function up(): void
    {
        DB::table('blogs')->whereIn('slug', $this->dummySlugs)->delete();
    }

    public function down(): void
    {
        // Placeholder seed data — intentionally not restored.
    }
};
