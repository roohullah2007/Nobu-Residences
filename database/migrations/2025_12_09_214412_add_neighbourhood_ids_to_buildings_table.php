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
            // Add foreign key columns for neighbourhood taxonomies
            $table->foreignId('neighbourhood_id')->nullable()->after('neighbourhood')->constrained('neighbourhoods')->nullOnDelete();
            $table->foreignId('sub_neighbourhood_id')->nullable()->after('sub_neighbourhood')->constrained('sub_neighbourhoods')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            $table->dropForeign(['neighbourhood_id']);
            $table->dropForeign(['sub_neighbourhood_id']);
            $table->dropColumn(['neighbourhood_id', 'sub_neighbourhood_id']);
        });
    }
};
