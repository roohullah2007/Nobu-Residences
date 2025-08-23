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
        Schema::table('buildings', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('buildings', 'postal_code')) {
                $table->string('postal_code', 20)->nullable()->after('province');
            }
            if (!Schema::hasColumn('buildings', 'country')) {
                $table->string('country', 100)->nullable()->default('Canada')->after('postal_code');
            }
            if (!Schema::hasColumn('buildings', 'building_type')) {
                $table->string('building_type', 50)->nullable()->default('condominium')->after('country');
            }
            if (!Schema::hasColumn('buildings', 'total_units')) {
                $table->integer('total_units')->nullable()->after('building_type');
            }
            if (!Schema::hasColumn('buildings', 'year_built')) {
                $table->integer('year_built')->nullable()->after('total_units');
            }
            if (!Schema::hasColumn('buildings', 'main_image')) {
                $table->text('main_image')->nullable()->after('description');
            }
            if (!Schema::hasColumn('buildings', 'images')) {
                $table->json('images')->nullable()->after('main_image');
            }
            if (!Schema::hasColumn('buildings', 'status')) {
                $table->string('status', 20)->default('pending')->after('images');
            }
            if (!Schema::hasColumn('buildings', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('status');
            }
            if (!Schema::hasColumn('buildings', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable()->after('is_featured');
            }
            if (!Schema::hasColumn('buildings', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            }
            if (!Schema::hasColumn('buildings', 'floors')) {
                $table->integer('floors')->nullable()->after('longitude');
            }
            if (!Schema::hasColumn('buildings', 'parking_spots')) {
                $table->integer('parking_spots')->nullable()->after('floors');
            }
            if (!Schema::hasColumn('buildings', 'locker_spots')) {
                $table->integer('locker_spots')->nullable()->after('parking_spots');
            }
            if (!Schema::hasColumn('buildings', 'maintenance_fee_range')) {
                $table->string('maintenance_fee_range')->nullable()->after('locker_spots');
            }
            if (!Schema::hasColumn('buildings', 'price_range')) {
                $table->string('price_range')->nullable()->after('maintenance_fee_range');
            }
            if (!Schema::hasColumn('buildings', 'website_url')) {
                $table->text('website_url')->nullable()->after('price_range');
            }
            if (!Schema::hasColumn('buildings', 'brochure_url')) {
                $table->text('brochure_url')->nullable()->after('website_url');
            }
            if (!Schema::hasColumn('buildings', 'floor_plans')) {
                $table->json('floor_plans')->nullable()->after('brochure_url');
            }
            if (!Schema::hasColumn('buildings', 'virtual_tour_url')) {
                $table->text('virtual_tour_url')->nullable()->after('floor_plans');
            }
            if (!Schema::hasColumn('buildings', 'features')) {
                $table->json('features')->nullable()->after('virtual_tour_url');
            }
            if (!Schema::hasColumn('buildings', 'nearby_transit')) {
                $table->json('nearby_transit')->nullable()->after('features');
            }
            if (!Schema::hasColumn('buildings', 'neighborhood_info')) {
                $table->text('neighborhood_info')->nullable()->after('nearby_transit');
            }
            if (!Schema::hasColumn('buildings', 'deposit_structure')) {
                $table->text('deposit_structure')->nullable()->after('neighborhood_info');
            }
            if (!Schema::hasColumn('buildings', 'estimated_completion')) {
                $table->string('estimated_completion')->nullable()->after('deposit_structure');
            }
            if (!Schema::hasColumn('buildings', 'architect')) {
                $table->string('architect')->nullable()->after('estimated_completion');
            }
            if (!Schema::hasColumn('buildings', 'interior_designer')) {
                $table->string('interior_designer')->nullable()->after('architect');
            }
            if (!Schema::hasColumn('buildings', 'landscape_architect')) {
                $table->string('landscape_architect')->nullable()->after('interior_designer');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            $table->dropColumn([
                'postal_code',
                'country',
                'building_type',
                'total_units',
                'year_built',
                'main_image',
                'images',
                'status',
                'is_featured',
                'latitude',
                'longitude',
                'floors',
                'parking_spots',
                'locker_spots',
                'maintenance_fee_range',
                'price_range',
                'website_url',
                'brochure_url',
                'floor_plans',
                'virtual_tour_url',
                'features',
                'nearby_transit',
                'neighborhood_info',
                'deposit_structure',
                'estimated_completion',
                'architect',
                'interior_designer',
                'landscape_architect'
            ]);
        });
    }
};