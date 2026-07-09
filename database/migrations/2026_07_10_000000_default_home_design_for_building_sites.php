<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Building sub-sites should serve the SAME Home page design as the default
 * (Nobu) site at "/", with hero/facts/listings resolved dynamically from
 * their homepage_building_id — not the BuildingDetail page. The one-click
 * launch flow used to default use_building_as_homepage to true, which sent
 * "/" on new sites (e.g. theatredistrictresidences.ca) to BuildingDetail.
 *
 * The create-flow default is now false; this migration flips the sites that
 * were already created with the old default. Admins who explicitly want the
 * BuildingDetail-as-homepage layout can re-enable it per site on
 * Admin > Websites > Edit.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('websites', 'use_building_as_homepage')) {
            return;
        }

        DB::table('websites')
            ->where('is_default', false)
            ->where('use_building_as_homepage', true)
            ->update(['use_building_as_homepage' => false]);
    }

    public function down(): void
    {
        // Irreversible data normalization — the previous per-site values
        // aren't recorded. Sites can be re-opted-in via the admin UI.
    }
};
