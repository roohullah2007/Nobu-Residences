<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Building-based "Get Alerts": a building alert is a saved search whose
 * criteria pin the building's street address(es). building_id marks a saved
 * search as THE alert subscription for that building, making the toggle
 * idempotent (one per user+building) — the alert delivery itself rides the
 * existing saved-search machinery unchanged.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('saved_searches', function (Blueprint $table) {
            if (!Schema::hasColumn('saved_searches', 'building_id')) {
                $table->string('building_id')->nullable()->after('user_id')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('saved_searches', function (Blueprint $table) {
            if (Schema::hasColumn('saved_searches', 'building_id')) {
                $table->dropColumn('building_id');
            }
        });
    }
};
