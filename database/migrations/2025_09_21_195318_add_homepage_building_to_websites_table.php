<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * buildings.id is a UUID (char(36)); an earlier version of this
     * migration declared homepage_building_id as unsignedBigInteger, so the
     * foreign key failed with MySQL error 3780 and aborted every fresh
     * migrate run. The column adds had already executed by then (MySQL DDL
     * is not transactional), so crashed databases are left with a mistyped
     * half-applied column. Everything below is guarded so the migration
     * works on: fresh databases, crashed-halfway databases, and databases
     * where it already ran.
     */
    public function up(): void
    {
        // Drop the mistyped leftover from a crashed earlier run.
        if (Schema::hasColumn('websites', 'homepage_building_id')
            && !in_array(Schema::getColumnType('websites', 'homepage_building_id'), ['char', 'varchar', 'string', 'uuid', 'guid'], true)) {
            Schema::table('websites', function (Blueprint $table) {
                $table->dropColumn('homepage_building_id');
            });
        }

        Schema::table('websites', function (Blueprint $table) {
            if (!Schema::hasColumn('websites', 'homepage_building_id')) {
                $table->uuid('homepage_building_id')->nullable()->after('is_active');
                $table->foreign('homepage_building_id')->references('id')->on('buildings')->onDelete('set null');
            }
            if (!Schema::hasColumn('websites', 'use_building_as_homepage')) {
                $table->boolean('use_building_as_homepage')->default(false)->after('homepage_building_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            if (Schema::hasColumn('websites', 'homepage_building_id')) {
                $table->dropForeign(['homepage_building_id']);
                $table->dropColumn('homepage_building_id');
            }
            if (Schema::hasColumn('websites', 'use_building_as_homepage')) {
                $table->dropColumn('use_building_as_homepage');
            }
        });
    }
};
