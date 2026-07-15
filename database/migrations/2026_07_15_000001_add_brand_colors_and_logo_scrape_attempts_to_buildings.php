<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            // Palette pre-detected from the building's logo (dotted-key shape,
            // e.g. {"brand_colors.primary": "#BF442F", ...}). Seeds the Website
            // Create color pickers instantly when a building is picked — no
            // in-browser detection round-trip. Null for logos we could not
            // read server-side (e.g. SVG, which the browser extracts instead).
            if (!Schema::hasColumn('buildings', 'brand_colors')) {
                $table->json('brand_colors')->nullable()->after('logo');
            }

            // Guards the buildings:scrape-logos batch the same way
            // image_download_attempts guards image downloads — after
            // MAX_ATTEMPTS failed runs a building is left alone so the batch
            // never loops forever on a dead / logo-less marketing site.
            if (!Schema::hasColumn('buildings', 'logo_scrape_attempts')) {
                $table->unsignedTinyInteger('logo_scrape_attempts')->default(0)->after('brand_colors');
            }
        });
    }

    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            foreach (['brand_colors', 'logo_scrape_attempts'] as $column) {
                if (Schema::hasColumn('buildings', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
