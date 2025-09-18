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
        Schema::create('maintenance_fee_amenities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('icon')->nullable(); // Icon path or class
            $table->string('category')->nullable(); // e.g., 'Utilities', 'Services', etc.
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('name');
            $table->index('is_active');
        });

        // Insert default maintenance fee amenities
        DB::table('maintenance_fee_amenities')->insert([
            ['name' => 'Water', 'icon' => '/assets/svgs/shower.svg', 'category' => 'Utilities', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Heat', 'icon' => '/assets/svgs/radiator.svg', 'category' => 'Utilities', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Hydro', 'icon' => '/assets/svgs/hydro-power-water.svg', 'category' => 'Utilities', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Gas', 'icon' => '/assets/svgs/radiator.svg', 'category' => 'Utilities', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Central Air Conditioning', 'icon' => '/assets/svgs/radiator.svg', 'category' => 'Utilities', 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Internet', 'icon' => '/assets/svgs/tv.svg', 'category' => 'Services', 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Cable TV', 'icon' => '/assets/svgs/tv.svg', 'category' => 'Services', 'sort_order' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Building Insurance', 'icon' => '/assets/svgs/security.svg', 'category' => 'Services', 'sort_order' => 8, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Parking', 'icon' => '/assets/svgs/parking-2.svg', 'category' => 'Facilities', 'sort_order' => 9, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Storage', 'icon' => '/assets/svgs/parking-garage-transportation-car-parking.svg', 'category' => 'Facilities', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Snow Removal', 'icon' => '/assets/svgs/security.svg', 'category' => 'Services', 'sort_order' => 11, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Lawn Care', 'icon' => '/assets/svgs/security.svg', 'category' => 'Services', 'sort_order' => 12, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Common Area Maintenance', 'icon' => '/assets/svgs/security.svg', 'category' => 'Services', 'sort_order' => 13, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Garbage Collection', 'icon' => '/assets/svgs/security.svg', 'category' => 'Services', 'sort_order' => 14, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Security', 'icon' => '/assets/svgs/police-security-policeman.svg', 'category' => 'Services', 'sort_order' => 15, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_fee_amenities');
    }
};
