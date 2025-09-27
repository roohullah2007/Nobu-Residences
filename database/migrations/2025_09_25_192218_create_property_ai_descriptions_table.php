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
        Schema::create('property_ai_descriptions', function (Blueprint $table) {
            $table->id();
            $table->string('mls_id')->unique()->index();
            $table->text('overview_description')->nullable();
            $table->text('detailed_description')->nullable();
            $table->json('property_data')->nullable(); // Store the data used to generate descriptions
            $table->string('ai_model')->default('gemini-1.5-flash');
            $table->timestamps();
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_ai_descriptions');
    }
};
