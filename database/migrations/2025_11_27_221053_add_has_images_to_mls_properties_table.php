<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mls_properties', function (Blueprint $table) {
            $table->boolean('has_images')->default(false)->after('image_urls')->index();
        });

        // Update existing records based on image_urls content
        if (DB::connection()->getDriverName() === 'sqlite') {
            // SQLite-compatible version
            DB::statement("UPDATE mls_properties SET has_images = 1 WHERE image_urls IS NOT NULL AND image_urls != '[]' AND image_urls != 'null' AND LENGTH(image_urls) > 2");
        } else {
            // MySQL version with JSON_LENGTH
            DB::statement("UPDATE mls_properties SET has_images = 1 WHERE image_urls IS NOT NULL AND image_urls != '[]' AND image_urls != 'null' AND JSON_LENGTH(image_urls) > 0");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mls_properties', function (Blueprint $table) {
            $table->dropColumn('has_images');
        });
    }
};
