<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ploi alias/certbot provisioning is replaced by Cloudflare for SaaS
     * Custom Hostnames: drop every ploi_* column and add the cloudflare_*
     * tracking columns.
     */
    public function up(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            foreach (['ploi_alias_status', 'ploi_alias_added_at', 'ploi_ssl_status', 'ploi_ssl_issued_at', 'ploi_last_error'] as $col) {
                if (Schema::hasColumn('websites', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::table('websites', function (Blueprint $table) {
            if (!Schema::hasColumn('websites', 'cloudflare_hostname_id')) {
                $table->string('cloudflare_hostname_id', 64)->nullable()->after('domain')->index();
            }
            if (!Schema::hasColumn('websites', 'cloudflare_status')) {
                // pending_dns | active | failed
                $table->string('cloudflare_status', 32)->nullable()->after('cloudflare_hostname_id');
            }
            if (!Schema::hasColumn('websites', 'cloudflare_ssl_status')) {
                // Cloudflare's raw ssl status: initializing | pending_validation | active | ...
                $table->string('cloudflare_ssl_status', 32)->nullable()->after('cloudflare_status');
            }
            if (!Schema::hasColumn('websites', 'cloudflare_last_error')) {
                $table->text('cloudflare_last_error')->nullable()->after('cloudflare_ssl_status');
            }
            if (!Schema::hasColumn('websites', 'cloudflare_active_at')) {
                $table->timestamp('cloudflare_active_at')->nullable()->after('cloudflare_last_error');
            }
        });
    }

    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            foreach (['cloudflare_hostname_id', 'cloudflare_status', 'cloudflare_ssl_status', 'cloudflare_last_error', 'cloudflare_active_at'] as $col) {
                if (Schema::hasColumn('websites', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::table('websites', function (Blueprint $table) {
            $table->string('ploi_alias_status', 32)->nullable()->after('domain');
            $table->timestamp('ploi_alias_added_at')->nullable();
            $table->string('ploi_ssl_status', 32)->nullable();
            $table->timestamp('ploi_ssl_issued_at')->nullable();
            $table->text('ploi_last_error')->nullable();
        });
    }
};
