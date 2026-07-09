<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Safety net for environments whose database was created from a SQL dump
 * instead of running migrations from scratch (e.g. the live nobu_db).
 *
 * On those servers the base 0001_01_01_* migrations are already recorded in
 * the `migrations` table, so Laravel skips them even though the dump never
 * contained the framework tables they create (sessions, cache, jobs, ...).
 * With SESSION_DRIVER / CACHE_STORE / QUEUE_CONNECTION all set to
 * "database", that means a hard 500 on every request:
 *   SQLSTATE[42S02]: Table 'nobu_db.sessions' doesn't exist
 *
 * Every create here is guarded by Schema::hasTable(), so this migration is a
 * no-op on databases that already have the tables.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->foreignId('user_id')->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->longText('payload');
                $table->integer('last_activity')->index();
            });
        }

        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        if (!Schema::hasTable('cache')) {
            Schema::create('cache', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->mediumText('value');
                $table->integer('expiration');
            });
        }

        if (!Schema::hasTable('cache_locks')) {
            Schema::create('cache_locks', function (Blueprint $table) {
                $table->string('key')->primary();
                $table->string('owner');
                $table->integer('expiration');
            });
        }

        if (!Schema::hasTable('jobs')) {
            Schema::create('jobs', function (Blueprint $table) {
                $table->id();
                $table->string('queue')->index();
                $table->longText('payload');
                $table->unsignedTinyInteger('attempts');
                $table->unsignedInteger('reserved_at')->nullable();
                $table->unsignedInteger('available_at');
                $table->unsignedInteger('created_at');
            });
        }

        if (!Schema::hasTable('job_batches')) {
            Schema::create('job_batches', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('name');
                $table->integer('total_jobs');
                $table->integer('pending_jobs');
                $table->integer('failed_jobs');
                $table->longText('failed_job_ids');
                $table->mediumText('options')->nullable();
                $table->integer('cancelled_at')->nullable();
                $table->integer('created_at');
                $table->integer('finished_at')->nullable();
            });
        }

        if (!Schema::hasTable('failed_jobs')) {
            Schema::create('failed_jobs', function (Blueprint $table) {
                $table->id();
                $table->string('uuid')->unique();
                $table->text('connection');
                $table->text('queue');
                $table->longText('payload');
                $table->longText('exception');
                $table->timestamp('failed_at')->useCurrent();
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * Intentionally a no-op: these are framework tables that other
     * migrations (0001_01_01_*) claim ownership of on freshly-migrated
     * databases — dropping them on rollback could destroy live sessions,
     * cache, and queued jobs that this migration didn't create.
     */
    public function down(): void
    {
    }
};
