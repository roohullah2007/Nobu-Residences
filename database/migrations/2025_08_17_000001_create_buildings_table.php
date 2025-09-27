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
        Schema::create('buildings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('address');
            $table->string('full_address')->nullable();
            $table->string('city');
            $table->string('province');
            $table->string('postal_code')->nullable();
            $table->string('country')->default('Canada');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Building details
            $table->string('building_type')->nullable(); // Condo, Apartment, Townhouse, etc.
            $table->integer('total_floors')->nullable();
            $table->integer('total_units')->nullable();
            $table->year('year_built')->nullable();
            $table->year('year_renovated')->nullable();
            
            // Developer & Management
            $table->string('developer_name')->nullable();
            $table->string('management_company')->nullable();
            $table->string('architect')->nullable();
            
            // Financial
            $table->decimal('maintenance_fee_range_min', 10, 2)->nullable();
            $table->decimal('maintenance_fee_range_max', 10, 2)->nullable();
            $table->decimal('property_tax_range_min', 10, 2)->nullable();
            $table->decimal('property_tax_range_max', 10, 2)->nullable();
            
            // Amenities and Features
            $table->json('amenities')->nullable();
            $table->json('features')->nullable();
            $table->json('images')->nullable();
            $table->string('virtual_tour_url')->nullable();
            
            // MLS Integration
            $table->string('mls_building_id')->nullable()->unique();
            $table->json('mls_data')->nullable();
            $table->timestamp('mls_last_sync')->nullable();
            
            // Status
            $table->enum('status', ['active', 'inactive', 'sold_out', 'pre_construction'])->default('active');
            $table->boolean('is_featured')->default(false);
            $table->integer('view_count')->default(0);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['city', 'status']);
            $table->index(['building_type', 'status']);
            $table->index('mls_building_id');
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buildings');
    }
};