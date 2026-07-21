<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Permanent record of CSV building imports. The live progress cache expires
 * after 12h, so this table is what the Import History section reads: every
 * import's file, status, counts, and row errors survive reloads, expiry,
 * and interrupted sessions.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('building_imports', function (Blueprint $table) {
            $table->id();
            $table->uuid('token')->unique();
            $table->string('filename')->nullable();
            $table->string('status')->default('queued')->index(); // queued | processing | finished | failed
            $table->string('duplicate_action')->default('skip');
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('processed')->default(0);
            $table->unsignedInteger('created_count')->default(0);
            $table->unsignedInteger('updated_count')->default(0);
            $table->unsignedInteger('skipped_count')->default(0);
            $table->unsignedInteger('error_count')->default(0);
            $table->json('errors')->nullable();
            $table->string('message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('building_imports');
    }
};
