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
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('address');
            $table->string('city');
            $table->string('province', 10)->default('ON');
            $table->string('postal_code', 10)->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website_url')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            
            // School specific fields
            $table->enum('school_type', ['public', 'catholic', 'private', 'charter', 'french', 'other'])->default('public');
            $table->enum('grade_level', ['elementary', 'secondary', 'k-12', 'preschool', 'special'])->default('elementary');
            $table->string('school_board')->nullable();
            $table->string('principal_name')->nullable();
            $table->integer('student_capacity')->nullable();
            $table->integer('established_year')->nullable();
            
            // Academic info
            $table->decimal('rating', 3, 2)->nullable(); // 0.00 to 10.00
            $table->json('programs')->nullable(); // Special programs offered
            $table->json('languages')->nullable(); // Languages of instruction
            $table->json('facilities')->nullable(); // Available facilities
            
            // Admin fields
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->json('meta_data')->nullable(); // Additional metadata
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['city', 'is_active']);
            $table->index(['school_type', 'grade_level']);
            $table->index(['latitude', 'longitude']);
            $table->index('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
