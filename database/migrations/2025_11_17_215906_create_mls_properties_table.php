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
        Schema::create('mls_properties', function (Blueprint $table) {
            $table->id();

            // MLS Identifiers
            $table->string('mls_id')->unique()->index();
            $table->string('mls_number')->nullable()->index();

            // Location Data
            $table->decimal('latitude', 10, 8)->nullable()->index();
            $table->decimal('longitude', 11, 8)->nullable()->index();
            $table->string('address')->nullable()->index();
            $table->string('city')->nullable()->index();
            $table->string('province')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->default('Canada');

            // Property Details (key fields for quick queries)
            $table->string('property_type')->nullable()->index(); // For Sale, For Rent
            $table->string('property_sub_type')->nullable()->index(); // Condo, House, etc.
            $table->string('status')->nullable()->index(); // Active, Sold, Leased, etc.
            $table->decimal('price', 15, 2)->nullable()->index();
            $table->integer('bedrooms')->nullable()->index();
            $table->decimal('bathrooms', 4, 1)->nullable();
            $table->integer('parking_spaces')->nullable();
            $table->decimal('square_footage', 10, 2)->nullable();
            $table->decimal('lot_size', 10, 2)->nullable();

            // Dates
            $table->timestamp('listed_date')->nullable()->index();
            $table->timestamp('sold_date')->nullable();
            $table->timestamp('updated_date')->nullable();
            $table->timestamp('last_synced_at')->nullable()->index();

            // Full MLS Data as JSON
            $table->json('mls_data')->nullable();

            // Image URLs (stored as JSON array, not downloaded)
            $table->json('image_urls')->nullable();

            // Sync tracking
            $table->boolean('is_active')->default(true)->index();
            $table->boolean('sync_failed')->default(false);
            $table->text('sync_error')->nullable();

            $table->timestamps();
            $table->softDeletes(); // For tracking removed listings
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mls_properties');
    }
};
