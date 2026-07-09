<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Converge the saved_searches schema.
     *
     * Two conflicting create-migrations exist for this table: the 2024_08_18
     * one (no alert columns) and the 2025_09_17 one (full schema, but it
     * self-skips when the table already exists). A database that ran the
     * 2024 variant first is missing the columns the alert pipeline writes
     * on every save — SavedSearchController@store and
     * SavedSearchAlertService then fail with "column not found".
     * Every add below is hasColumn-guarded so this runs safely on both
     * schema variants.
     */
    public function up(): void
    {
        Schema::table('saved_searches', function (Blueprint $table) {
            if (!Schema::hasColumn('saved_searches', 'frequency')) {
                // Days between alerts: 1 = daily, 7 = weekly, 30 = monthly
                $table->integer('frequency')->default(1);
            }
            if (!Schema::hasColumn('saved_searches', 'last_alert_sent')) {
                $table->timestamp('last_alert_sent')->nullable();
            }
            if (!Schema::hasColumn('saved_searches', 'results_count')) {
                $table->integer('results_count')->default(0);
            }
        });
    }

    public function down(): void
    {
        // Intentionally a no-op: these columns may have been created by the
        // 2025_09_17 create-migration rather than this one, and dropping
        // them on rollback would destroy alert state either way.
    }
};
