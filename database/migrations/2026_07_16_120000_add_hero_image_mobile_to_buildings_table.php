<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Optional mobile-specific hero image for a building. Desktop keeps
     * using main_image; landing-page heroes render this one on small
     * screens when set (client request: different hero per device).
     */
    public function up(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            $table->string('hero_image_mobile')->nullable()->after('main_image');
        });
    }

    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            $table->dropColumn('hero_image_mobile');
        });
    }
};
