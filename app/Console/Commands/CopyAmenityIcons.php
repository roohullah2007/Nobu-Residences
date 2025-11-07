<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MaintenanceFeeAmenity;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class CopyAmenityIcons extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'amenity:copy-icons';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Copy all maintenance fee amenity icons from storage to public/svgs folder';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to copy amenity icons...');

        // Create public/svgs directory if it doesn't exist
        $publicSvgsPath = public_path('svgs');
        if (!File::exists($publicSvgsPath)) {
            File::makeDirectory($publicSvgsPath, 0755, true);
            $this->info("Created directory: {$publicSvgsPath}");
        }

        // Get all maintenance fee amenities
        $amenities = MaintenanceFeeAmenity::whereNotNull('icon')->get();

        if ($amenities->isEmpty()) {
            $this->warn('No amenities with icons found in the database.');
            return 0;
        }

        $copiedCount = 0;
        $failedCount = 0;

        foreach ($amenities as $amenity) {
            $oldPath = $amenity->icon;

            // Skip if already in public/svgs
            if (str_starts_with($oldPath, '/svgs/')) {
                $this->comment("Skipping {$amenity->name} - already in public/svgs");
                continue;
            }

            // Convert storage path to actual file path
            $storagePath = str_replace('/storage/', '', $oldPath);
            $sourceFile = storage_path('app/public/' . $storagePath);

            // Check if source file exists
            if (!File::exists($sourceFile)) {
                $this->error("Source file not found for {$amenity->name}: {$sourceFile}");
                $failedCount++;
                continue;
            }

            // Generate new filename
            $filename = basename($oldPath);
            $newPath = $publicSvgsPath . '/' . $filename;

            // Copy file
            if (File::copy($sourceFile, $newPath)) {
                // Update database
                $amenity->icon = '/svgs/' . $filename;
                $amenity->save();

                $this->info("✓ Copied {$amenity->name}: {$filename}");
                $copiedCount++;
            } else {
                $this->error("✗ Failed to copy {$amenity->name}");
                $failedCount++;
            }
        }

        $this->newLine();
        $this->info("Summary:");
        $this->info("- Successfully copied: {$copiedCount}");
        if ($failedCount > 0) {
            $this->error("- Failed: {$failedCount}");
        }

        return 0;
    }
}
