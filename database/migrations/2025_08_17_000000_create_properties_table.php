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
        Schema::create('properties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('address');
            $table->string('full_address')->nullable();
            $table->string('city');
            $table->string('province');
            $table->string('postal_code')->nullable();
            $table->string('country')->default('Canada');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->decimal('price', 12, 2);
            
            // Property details
            $table->string('property_type')->nullable();
            $table->enum('transaction_type', ['sale', 'rent', 'lease'])->default('sale');
            $table->enum('status', ['active', 'sold', 'rented', 'inactive'])->default('active');
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->decimal('area', 8, 2)->nullable();
            $table->string('area_unit')->default('sqft');
            $table->integer('parking')->nullable();
            $table->decimal('maintenance_fees', 8, 2)->nullable();
            $table->decimal('property_taxes', 8, 2)->nullable();
            $table->string('exposure')->nullable();
            $table->year('year_built')->nullable();
            
            // Additional data
            $table->json('features')->nullable();
            $table->json('images')->nullable();
            $table->string('virtual_tour_url')->nullable();
            $table->date('listing_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('mls_number')->nullable()->unique();
            $table->boolean('is_featured')->default(false);
            $table->integer('view_count')->default(0);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['city', 'status']);
            $table->index(['property_type', 'status']);
            $table->index(['transaction_type', 'status']);
            $table->index(['price', 'status']);
            $table->index('mls_number');
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};