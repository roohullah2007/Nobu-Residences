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
        Schema::create('tour_requests', function (Blueprint $table) {
            $table->id();
            $table->string('property_id')->nullable();
            $table->string('property_type')->nullable(); // 'property', 'building', etc.
            $table->string('property_address')->nullable();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone');
            $table->text('message')->nullable();
            $table->string('selected_date')->nullable();
            $table->string('selected_time')->nullable();
            $table->string('status')->default('pending'); // pending, contacted, completed
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            // Add indexes for better query performance
            $table->index('property_id');
            $table->index('email');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tour_requests');
    }
};
