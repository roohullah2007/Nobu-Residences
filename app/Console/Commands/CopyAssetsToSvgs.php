<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CopyAssetsToSvgs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'svgs:copy-from-assets';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Copy all SVG files from public/assets/svgs to public/svgs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sourcePath = public_path('assets/svgs');
        $destinationPath = public_path('svgs');

        if (!File::exists($sourcePath)) {
            $this->error("Source directory does not exist: {$sourcePath}");
            return 1;
        }

        // Create destination directory if it doesn't exist
        if (!File::exists($destinationPath)) {
            File::makeDirectory($destinationPath, 0755, true);
            $this->info("Created directory: {$destinationPath}");
        }

        // Get all SVG files from source
        $files = File::files($sourcePath);
        $copiedCount = 0;

        foreach ($files as $file) {
            if ($file->getExtension() === 'svg') {
                $filename = $file->getFilename();
                $destination = $destinationPath . DIRECTORY_SEPARATOR . $filename;

                if (File::copy($file->getPathname(), $destination)) {
                    $this->info("✓ Copied: {$filename}");
                    $copiedCount++;
                } else {
                    $this->error("✗ Failed to copy: {$filename}");
                }
            }
        }

        $this->newLine();
        $this->info("Summary: Copied {$copiedCount} SVG files to public/svgs/");

        return 0;
    }
}
