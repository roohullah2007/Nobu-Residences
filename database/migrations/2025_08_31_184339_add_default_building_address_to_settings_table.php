<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add default building address setting if it doesn't exist
        DB::table('settings')->insertOrIgnore([
            'key' => 'default_building_address',
            'value' => '55 Mercer Street',
            'description' => 'Default building address for homepage property listings',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('settings')->where('key', 'default_building_address')->delete();
    }
};
