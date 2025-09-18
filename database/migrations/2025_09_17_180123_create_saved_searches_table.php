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
        Schema::create('saved_searches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->json('search_params'); // Store all search parameters
            $table->boolean('email_alerts')->default(false);
            $table->integer('frequency')->default(1); // 1=daily, 7=weekly, 30=monthly
            $table->timestamp('last_alert_sent')->nullable();
            $table->integer('results_count')->default(0);
            $table->timestamps();

            // Index for user queries
            $table->index('user_id');
            $table->index(['user_id', 'email_alerts']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_searches');
    }
};
