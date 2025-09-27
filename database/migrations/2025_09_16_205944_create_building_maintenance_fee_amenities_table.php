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
        Schema::create('building_maintenance_fee_amenities', function (Blueprint $table) {
            $table->id();
            $table->uuid('building_id');
            $table->unsignedBigInteger('maintenance_fee_amenity_id');
            $table->timestamps();

            $table->foreign('building_id', 'bmfa_building_id_foreign')
                  ->references('id')->on('buildings')
                  ->onDelete('cascade');

            $table->foreign('maintenance_fee_amenity_id', 'bmfa_amenity_id_foreign')
                  ->references('id')->on('maintenance_fee_amenities')
                  ->onDelete('cascade');

            $table->unique(['building_id', 'maintenance_fee_amenity_id'], 'building_maintenance_fee_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('building_maintenance_fee_amenities');
    }
};
