<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

/**
 * The MLS sync subsystem (SyncMLSListings/SyncMLSImages/GeocodeMLSProperties
 * commands, MLSProperty/MLSSyncState models, MLSController, admin pages) was
 * removed — all property data now comes live from the Repliers API. This
 * drops the orphaned mirror tables. Guarded + irreversible by design: the
 * old create-migrations stay in history, and the data is a stale mirror of
 * Repliers, so there is nothing to restore.
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (['mls_properties', 'mls_sync_state', 'mls_sync_states'] as $table) {
            if (Schema::hasTable($table)) {
                Schema::drop($table);
            }
        }
    }

    public function down(): void
    {
        // Intentionally empty — the mirror tables are gone for good; the
        // live Repliers API is the single source of property data.
    }
};
