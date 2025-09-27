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
        Schema::table('properties', function (Blueprint $table) {
            $table->uuid('building_id')->nullable()->after('id');
            $table->foreign('building_id')->references('id')->on('buildings')->onDelete('set null');
            $table->index('building_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropForeign(['building_id']);
            $table->dropIndex(['building_id']);
            $table->dropColumn('building_id');
        });
    }
};