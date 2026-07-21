<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Zone-managed custom domains: when CLOUDFLARE_ACCOUNT_ID is set, the app
     * creates the customer's domain as a DNS zone in our own Cloudflare
     * account and adds the apex CNAME itself. The customer's only step is
     * pointing the domain at the two assigned Cloudflare nameservers (zero
     * steps for domains bought inside that account).
     */
    public function up(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            if (!Schema::hasColumn('websites', 'cloudflare_zone_id')) {
                $table->string('cloudflare_zone_id', 64)->nullable()->after('cloudflare_hostname_id');
            }
            if (!Schema::hasColumn('websites', 'cloudflare_zone_status')) {
                // Cloudflare's raw zone status: pending | active | moved | ...
                $table->string('cloudflare_zone_status', 32)->nullable()->after('cloudflare_zone_id');
            }
            if (!Schema::hasColumn('websites', 'cloudflare_name_servers')) {
                // The two nameservers Cloudflare assigned to the zone.
                $table->json('cloudflare_name_servers')->nullable()->after('cloudflare_zone_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            foreach (['cloudflare_zone_id', 'cloudflare_zone_status', 'cloudflare_name_servers'] as $col) {
                if (Schema::hasColumn('websites', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
