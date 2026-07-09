<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('maintenance_fee_amenities')) {
            return;
        }

        $rows = [
            ['name' => 'Parking Maintenance', 'icon' => '/assets/svgs/parking-2.svg', 'category' => 'Facilities', 'sort_order' => 16],
            ['name' => 'Locker Maintenance', 'icon' => '/assets/svgs/parking-garage-transportation-car-parking.svg', 'category' => 'Facilities', 'sort_order' => 17],
        ];

        foreach ($rows as $row) {
            DB::table('maintenance_fee_amenities')->updateOrInsert(
                ['name' => $row['name']],
                $row + ['is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('maintenance_fee_amenities')) {
            return;
        }

        $ids = DB::table('maintenance_fee_amenities')
            ->whereIn('name', ['Parking Maintenance', 'Locker Maintenance'])
            ->pluck('id');

        if (Schema::hasTable('building_maintenance_fee_amenities')) {
            DB::table('building_maintenance_fee_amenities')
                ->whereIn('maintenance_fee_amenity_id', $ids)
                ->delete();
        }

        DB::table('maintenance_fee_amenities')->whereIn('id', $ids)->delete();
    }
};
