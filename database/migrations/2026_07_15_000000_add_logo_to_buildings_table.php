<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            if (!Schema::hasColumn('buildings', 'logo')) {
                // Building brand logo (URL). Drives the website color theme:
                // when a website is created for the building, the palette is
                // auto-detected from this logo.
                $table->string('logo')->nullable()->after('main_image');
            }
        });
    }

    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            if (Schema::hasColumn('buildings', 'logo')) {
                $table->dropColumn('logo');
            }
        });
    }
};
