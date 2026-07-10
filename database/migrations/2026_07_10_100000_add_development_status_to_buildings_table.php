<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The admin Create/Edit Building forms used to render two selects both
     * bound to `status`: a construction-phase one (pre_construction,
     * under_construction, completed, sold_out) and a publish one (active,
     * inactive, pending). Construction values saved into `status` break
     * public status=active filtering. Split them: `status` keeps publish
     * state, `development_status` holds the construction phase.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('buildings', 'development_status')) {
            Schema::table('buildings', function (Blueprint $table) {
                $table->string('development_status', 50)->nullable()->after('status');
            });
        }

        // Rescue rows where a construction phase was saved into status:
        // move it to development_status and restore a sane publish state.
        DB::table('buildings')
            ->whereIn('status', ['pre_construction', 'under_construction', 'completed', 'sold_out'])
            ->update([
                'development_status' => DB::raw('status'),
                'status' => 'active',
            ]);
    }

    public function down(): void
    {
        if (Schema::hasColumn('buildings', 'development_status')) {
            Schema::table('buildings', function (Blueprint $table) {
                $table->dropColumn('development_status');
            });
        }
    }
};
