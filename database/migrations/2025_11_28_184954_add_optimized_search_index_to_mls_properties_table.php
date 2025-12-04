<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * These indexes are critical for search performance.
     * MySQL's optimizer doesn't always pick the right index for queries with
     * soft deletes (deleted_at IS NULL). These covering indexes include deleted_at
     * first, which allows the optimizer to use them efficiently.
     *
     * Performance improvements:
     * - COUNT queries: ~2400ms → ~6ms
     * - SELECT with ORDER BY + LIMIT: ~2400ms → ~2ms
     */
    public function up(): void
    {
        // SQLite doesn't support SHOW INDEX or DESC in index columns
        if (DB::connection()->getDriverName() === 'sqlite') {
            // Create a simpler index for SQLite
            Schema::table('mls_properties', function (Blueprint $table) {
                $table->index(['deleted_at', 'is_active', 'status', 'property_type', 'has_images', 'listed_date'], 'idx_mls_search_sort');
            });
            return;
        }

        // Check if index already exists (MySQL)
        $indexExists = DB::select("SHOW INDEX FROM mls_properties WHERE Key_name = 'idx_mls_search_sort'");

        if (empty($indexExists)) {
            // Use raw SQL because Laravel Schema doesn't support DESC index columns
            // This index covers WHERE + ORDER BY for the most common search pattern
            DB::statement('
                CREATE INDEX idx_mls_search_sort ON mls_properties
                (deleted_at, is_active, status, property_type, has_images DESC, listed_date DESC)
            ');
        }

        // Fix any existing data where property_type doesn't match MLS TransactionType
        // This fixes records where "For Lease" was incorrectly saved as "For Sale"
        DB::statement('
            UPDATE mls_properties
            SET property_type = "For Rent"
            WHERE property_type = "For Sale"
            AND JSON_EXTRACT(mls_data, "$.TransactionType") = "For Lease"
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mls_properties', function (Blueprint $table) {
            $table->dropIndex('idx_mls_search_sort');
        });
    }
};
