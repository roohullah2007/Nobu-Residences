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
        Schema::table('websites', function (Blueprint $table) {
            $table->unsignedBigInteger('homepage_building_id')->nullable()->after('is_active');
            $table->boolean('use_building_as_homepage')->default(false)->after('homepage_building_id');

            $table->foreign('homepage_building_id')->references('id')->on('buildings')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->dropForeign(['homepage_building_id']);
            $table->dropColumn('homepage_building_id');
            $table->dropColumn('use_building_as_homepage');
        });
    }
};
