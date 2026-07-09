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
            if (!Schema::hasColumn('buildings', 'sqft_range')) {
                $table->string('sqft_range')->nullable()->after('price_range');
            }
            if (!Schema::hasColumn('buildings', 'avg_price_per_sqft')) {
                $table->string('avg_price_per_sqft')->nullable()->after('sqft_range');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            foreach (['sqft_range', 'avg_price_per_sqft'] as $col) {
                if (Schema::hasColumn('buildings', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
