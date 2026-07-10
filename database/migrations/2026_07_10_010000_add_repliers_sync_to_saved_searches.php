<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Repliers saved-search sync. SavedSearchController already wrote/read
 * repliers_saved_search_id, but no migration ever created the column — the
 * Repliers-side search ID was silently dropped, so it could never be
 * updated or deleted on Repliers. repliers_sync_status records the outcome
 * of the last sync attempt ('synced' | 'failed' | null = never attempted)
 * without ever blocking the local save.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('saved_searches', function (Blueprint $table) {
            if (!Schema::hasColumn('saved_searches', 'repliers_saved_search_id')) {
                $table->string('repliers_saved_search_id')->nullable()->after('results_count');
            }
            if (!Schema::hasColumn('saved_searches', 'repliers_sync_status')) {
                $table->string('repliers_sync_status', 16)->nullable()->after('repliers_saved_search_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('saved_searches', function (Blueprint $table) {
            foreach (['repliers_saved_search_id', 'repliers_sync_status'] as $col) {
                if (Schema::hasColumn('saved_searches', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
