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
            // Add geocoding tracking fields
            $table->timestamp('geocode_attempted_at')->nullable()->after('last_synced_at');
            $table->string('geocode_source', 50)->nullable()->after('geocode_attempted_at');

            // Add index for efficient querying of properties needing geocoding
            $table->index(['latitude', 'longitude', 'is_active'], 'idx_mls_geocode_status');
            $table->index('geocode_attempted_at', 'idx_mls_geocode_attempted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mls_properties', function (Blueprint $table) {
            $table->dropIndex('idx_mls_geocode_status');
            $table->dropIndex('idx_mls_geocode_attempted');
            $table->dropColumn(['geocode_attempted_at', 'geocode_source']);
        });
    }
};
