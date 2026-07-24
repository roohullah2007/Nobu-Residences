<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Per-website platform type: 'condo' (existing behaviour, default) or
     * 'lowrise' for the house-focused domains (homeforsaletoronto.com ...)
     * whose location pages carry freehold low-rise inventory instead of
     * condos.
     */
    public function up(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->string('site_type', 20)->default('condo')->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->dropColumn('site_type');
        });
    }
};
