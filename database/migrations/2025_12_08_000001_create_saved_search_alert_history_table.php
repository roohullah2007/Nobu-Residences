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
        // Create table to track sent alert history
        Schema::create('saved_search_alert_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('saved_search_id')->constrained('saved_searches')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('listings_count')->default(0);
            $table->json('listing_keys')->nullable(); // Store MLS IDs that were included
            $table->string('status')->default('sent'); // sent, failed, bounced
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->useCurrent();
            $table->timestamps();

            // Indexes for querying
            $table->index('saved_search_id');
            $table->index('user_id');
            $table->index('sent_at');
            $table->index(['saved_search_id', 'sent_at']);
        });

        // Add new columns to saved_searches table if they don't exist
        if (!Schema::hasColumn('saved_searches', 'total_alerts_sent')) {
            Schema::table('saved_searches', function (Blueprint $table) {
                $table->integer('total_alerts_sent')->default(0)->after('results_count');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_search_alert_history');

        if (Schema::hasColumn('saved_searches', 'total_alerts_sent')) {
            Schema::table('saved_searches', function (Blueprint $table) {
                $table->dropColumn('total_alerts_sent');
            });
        }
    }
};
