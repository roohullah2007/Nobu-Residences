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
        // SQLite doesn't support ALTER COLUMN, so we skip this for SQLite
        // The column is already created as string in a previous migration
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        // Use raw SQL to alter the column type (MySQL)
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Try to drop the foreign key constraint if it exists
        try {
            DB::statement('ALTER TABLE websites DROP FOREIGN KEY websites_homepage_building_id_foreign');
        } catch (\Exception $e) {
            // Foreign key doesn't exist, continue
        }

        // Change the column type to VARCHAR(36) for UUID
        DB::statement('ALTER TABLE websites MODIFY homepage_building_id VARCHAR(36) NULL');

        // Add the foreign key constraint
        DB::statement('ALTER TABLE websites ADD CONSTRAINT websites_homepage_building_id_foreign FOREIGN KEY (homepage_building_id) REFERENCES buildings(id) ON DELETE SET NULL');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // SQLite doesn't support ALTER COLUMN
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        // Use raw SQL to revert the column type (MySQL)
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Drop the foreign key constraint
        DB::statement('ALTER TABLE websites DROP FOREIGN KEY websites_homepage_building_id_foreign');

        // Change back to BIGINT UNSIGNED
        DB::statement('ALTER TABLE websites MODIFY homepage_building_id BIGINT UNSIGNED NULL');

        // Re-add the foreign key constraint
        DB::statement('ALTER TABLE websites ADD CONSTRAINT websites_homepage_building_id_foreign FOREIGN KEY (homepage_building_id) REFERENCES buildings(id) ON DELETE SET NULL');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
