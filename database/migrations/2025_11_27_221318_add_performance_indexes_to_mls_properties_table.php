<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mls_properties', function (Blueprint $table) {
            // Composite index for common search queries
            $table->index(['is_active', 'status', 'property_type', 'property_sub_type'], 'idx_mls_search');

            // Index for sorting by date with has_images
            $table->index(['has_images', 'listed_date'], 'idx_mls_sort_date');

            // Index for sorting by price
            $table->index(['has_images', 'price'], 'idx_mls_sort_price');

            // Index for listed_date alone
            $table->index('listed_date', 'idx_mls_listed_date');

            // Index for status alone (commonly queried)
            $table->index('status', 'idx_mls_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mls_properties', function (Blueprint $table) {
            $table->dropIndex('idx_mls_search');
            $table->dropIndex('idx_mls_sort_date');
            $table->dropIndex('idx_mls_sort_price');
            $table->dropIndex('idx_mls_listed_date');
            $table->dropIndex('idx_mls_status');
        });
    }
};
