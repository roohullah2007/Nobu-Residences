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
        Schema::table('buildings', function (Blueprint $table) {
            // Remove the JSON amenities column since we're using relationships
            if (Schema::hasColumn('buildings', 'amenities')) {
                $table->dropColumn('amenities');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            // Add back the amenities column if rolled back
            $table->json('amenities')->nullable();
        });
    }
};
