<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mls_sync_state', function (Blueprint $table) {
            $table->id();

            // Sync mode: 'initial_load' or 'incremental'
            $table->enum('sync_mode', ['initial_load', 'incremental'])
                ->default('initial_load')
                ->index();

            // Batch tracking for initial load
            $table->integer('current_batch_offset')->default(0)->index();
            $table->integer('batch_size')->default(100);

            // Total properties synced
            $table->integer('total_properties_synced')->default(0);

            // Initial sync completion tracking
            $table->boolean('initial_sync_complete')->default(false)->index();
            $table->timestamp('initial_sync_completed_at')->nullable();

            // Last sync timestamps
            $table->timestamp('last_sync_started_at')->nullable();
            $table->timestamp('last_sync_completed_at')->nullable()->index();

            // Sync statistics (for current run)
            $table->integer('current_run_synced')->default(0);
            $table->integer('current_run_updated')->default(0);
            $table->integer('current_run_failed')->default(0);
            $table->integer('current_run_status_changed')->default(0);

            // Sync status
            $table->enum('sync_status', ['idle', 'running', 'paused', 'failed'])
                ->default('idle')
                ->index();
            $table->text('last_error')->nullable();

            // Metadata
            $table->json('sync_metadata')->nullable(); // Store additional info like API limit, etc.

            $table->timestamps();
        });

        // Create initial state record
        DB::table('mls_sync_state')->insert([
            'sync_mode' => 'initial_load',
            'current_batch_offset' => 0,
            'batch_size' => 100,
            'total_properties_synced' => 0,
            'initial_sync_complete' => false,
            'sync_status' => 'idle',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mls_sync_state');
    }
};
