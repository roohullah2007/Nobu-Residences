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
        Schema::create('user_property_favourites', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('property_listing_key');
            $table->text('property_data')->nullable(); // Store JSON data
            $table->string('property_address')->nullable();
            $table->decimal('property_price', 12, 2)->nullable();
            $table->string('property_type')->nullable();
            $table->string('property_city')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['user_id', 'property_listing_key']);
            $table->index('property_listing_key');
            $table->index('property_city');
            $table->index('property_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_property_favourites');
    }
};
