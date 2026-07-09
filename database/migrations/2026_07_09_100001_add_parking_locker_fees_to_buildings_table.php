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
        if (!Schema::hasTable('buildings')) {
            return;
        }

        Schema::table('buildings', function (Blueprint $table) {
            if (!Schema::hasColumn('buildings', 'parking_maintenance_fee')) {
                $table->decimal('parking_maintenance_fee', 8, 2)->nullable()->after('maintenance_fee_range');
            }
            if (!Schema::hasColumn('buildings', 'locker_maintenance_fee')) {
                $table->decimal('locker_maintenance_fee', 8, 2)->nullable()->after('parking_maintenance_fee');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('buildings')) {
            return;
        }

        Schema::table('buildings', function (Blueprint $table) {
            foreach (['parking_maintenance_fee', 'locker_maintenance_fee'] as $column) {
                if (Schema::hasColumn('buildings', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
