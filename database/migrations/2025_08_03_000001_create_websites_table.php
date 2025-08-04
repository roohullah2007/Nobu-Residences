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
        Schema::create('websites', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Nobu Residences"
            $table->string('slug')->unique(); // e.g., "nobu-residences"
            $table->string('domain')->nullable(); // Custom domain if any
            $table->boolean('is_default')->default(false); // Main website flag
            $table->boolean('is_active')->default(true);
            
            // Branding
            $table->string('logo_url')->nullable();
            $table->json('brand_colors')->nullable(); // Primary, secondary, accent colors
            $table->json('fonts')->nullable(); // Font families
            
            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->string('favicon_url')->nullable();
            
            // Contact Information (Global)
            $table->json('contact_info')->nullable(); // Phone, email, address
            $table->json('social_media')->nullable(); // Social media links
            
            // Business Information
            $table->text('description')->nullable();
            $table->json('business_hours')->nullable();
            $table->string('timezone')->default('America/Toronto');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('websites');
    }
};
