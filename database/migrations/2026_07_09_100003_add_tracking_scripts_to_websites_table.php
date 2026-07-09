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
        if (!Schema::hasTable('websites') || Schema::hasColumn('websites', 'tracking_scripts')) {
            return;
        }

        Schema::table('websites', function (Blueprint $table) {
            // Raw third-party tracking snippets (e.g. Follow Up Boss widget
            // tracker) pasted by admins; rendered verbatim in the public <head>.
            $table->text('tracking_scripts')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('websites') || !Schema::hasColumn('websites', 'tracking_scripts')) {
            return;
        }

        Schema::table('websites', function (Blueprint $table) {
            $table->dropColumn('tracking_scripts');
        });
    }
};
