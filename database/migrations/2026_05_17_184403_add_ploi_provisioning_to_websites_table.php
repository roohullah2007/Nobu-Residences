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
        Schema::table('websites', function (Blueprint $table) {
            if (!Schema::hasColumn('websites', 'ploi_alias_status')) {
                $table->string('ploi_alias_status', 32)->nullable()->after('domain');
            }
            if (!Schema::hasColumn('websites', 'ploi_alias_added_at')) {
                $table->timestamp('ploi_alias_added_at')->nullable()->after('ploi_alias_status');
            }
            if (!Schema::hasColumn('websites', 'ploi_ssl_status')) {
                $table->string('ploi_ssl_status', 32)->nullable()->after('ploi_alias_added_at');
            }
            if (!Schema::hasColumn('websites', 'ploi_ssl_issued_at')) {
                $table->timestamp('ploi_ssl_issued_at')->nullable()->after('ploi_ssl_status');
            }
            if (!Schema::hasColumn('websites', 'ploi_last_error')) {
                $table->text('ploi_last_error')->nullable()->after('ploi_ssl_issued_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            foreach (['ploi_alias_status','ploi_alias_added_at','ploi_ssl_status','ploi_ssl_issued_at','ploi_last_error'] as $col) {
                if (Schema::hasColumn('websites', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
