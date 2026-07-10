<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The platform's brokerage is RE/MAX — the old "Property.ca Inc.,
     * Brokerage" default (and every stored copy of it) is replaced. Covers
     * both variants seen in data: with and without the dot after "Inc".
     */
    public function up(): void
    {
        DB::table('buildings')
            ->where('agent_brokerage', 'like', '%Property.ca%')
            ->update(['agent_brokerage' => 'RE/MAX']);

        DB::table('agent_infos')
            ->where('brokerage', 'like', '%Property.ca%')
            ->update(['brokerage' => 'RE/MAX']);

        Schema::table('buildings', function (Blueprint $table) {
            $table->string('agent_brokerage')->default('RE/MAX')->change();
        });
    }

    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            $table->string('agent_brokerage')->default('Property.ca Inc., Brokerage')->change();
        });
        // Data replacement is not reverted — the old brokerage strings are
        // not recoverable per-row.
    }
};
