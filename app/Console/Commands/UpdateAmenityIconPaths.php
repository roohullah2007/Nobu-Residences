<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MaintenanceFeeAmenity;

class UpdateAmenityIconPaths extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'amenity:update-paths';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update all maintenance fee amenity icon paths to use public/svgs directory';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating maintenance fee amenity icon paths...');

        $amenities = MaintenanceFeeAmenity::whereNotNull('icon')->get();

        if ($amenities->isEmpty()) {
            $this->warn('No amenities with icons found.');
            return 0;
        }

        $updatedCount = 0;

        foreach ($amenities as $amenity) {
            $oldPath = $amenity->icon;

            // Skip if already using /svgs/ path
            if (str_starts_with($oldPath, '/svgs/')) {
                $this->comment("Skipping {$amenity->name} - already uses /svgs/ path");
                continue;
            }

            // Extract filename from old path
            $filename = basename($oldPath);

            // Update to new path
            $amenity->icon = '/svgs/' . $filename;
            $amenity->save();

            $this->info("✓ Updated {$amenity->name}: {$oldPath} -> /svgs/{$filename}");
            $updatedCount++;
        }

        $this->newLine();
        $this->info("Summary: Updated {$updatedCount} amenity icon paths to /svgs/");
        $this->newLine();
        $this->comment('Note: You will need to manually upload the actual SVG files to public/svgs/ directory.');
        $this->comment('You can do this through the admin panel at: /admin/maintenance-fee-amenities');

        return 0;
    }
}
