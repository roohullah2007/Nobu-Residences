<?php

namespace App\Console\Commands;

use App\Services\MLSImageSyncService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncMLSImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mls:sync-images
                            {--limit= : Maximum number of properties to update}
                            {--batch-size=50 : Number of properties to process per batch}
                            {--skip-existing : Skip properties that already have images}
                            {--only-active : Only sync active properties}
                            {--mls-ids=* : Specific MLS IDs to sync images for}
                            {--stats : Show image statistics only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync/update image URLs for existing MLS properties';

    private MLSImageSyncService $imageSyncService;

    /**
     * Create a new command instance.
     */
    public function __construct(MLSImageSyncService $imageSyncService)
    {
        parent::__construct();
        $this->imageSyncService = $imageSyncService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Show stats only
        if ($this->option('stats')) {
            $this->showStats();
            return 0;
        }

        $this->info('Starting MLS image sync...');
        $this->newLine();

        $startTime = now();

        try {
            // Sync specific properties
            if (!empty($this->option('mls-ids'))) {
                $result = $this->syncSpecificImages();
            } else {
                $result = $this->syncAllImages();
            }

            $duration = $startTime->diffInSeconds(now());

            if ($result['success']) {
                $this->displayResults($result, $duration);
                return 0;
            } else {
                $this->error('Image sync failed: ' . ($result['error'] ?? 'Unknown error'));
                return 1;
            }

        } catch (\Exception $e) {
            $this->error('Image sync error: ' . $e->getMessage());
            Log::error('MLS Image Sync Command Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }

    /**
     * Sync images for all properties
     */
    private function syncAllImages(): array
    {
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $batchSize = (int) $this->option('batch-size');
        $skipExisting = $this->option('skip-existing') ?? true;
        $onlyActive = $this->option('only-active') ?? true;

        $this->line("Syncing images for properties...");
        if ($limit) {
            $this->line("Limit: {$limit} properties");
        }
        $this->line("Batch size: {$batchSize}");
        $this->line("Skip existing: " . ($skipExisting ? 'Yes' : 'No'));
        $this->line("Only active: " . ($onlyActive ? 'Yes' : 'No'));
        $this->newLine();

        // Create progress bar
        $progressBar = $this->output->createProgressBar($limit ?? 100);
        $progressBar->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');
        $progressBar->setMessage('Starting...');
        $progressBar->start();

        $result = $this->imageSyncService->syncImages([
            'limit' => $limit,
            'batch_size' => $batchSize,
            'skip_existing' => $skipExisting,
            'only_active' => $onlyActive,
        ]);

        $progressBar->setMessage('Complete!');
        $progressBar->finish();
        $this->newLine(2);

        return $result;
    }

    /**
     * Sync images for specific properties
     */
    private function syncSpecificImages(): array
    {
        $mlsIds = $this->option('mls-ids');

        $this->line("Syncing images for " . count($mlsIds) . " specific property(s)...");
        $this->newLine();

        $progressBar = $this->output->createProgressBar(count($mlsIds));
        $progressBar->setFormat(' %current%/%max% [%bar%] %percent:3s%%');
        $progressBar->start();

        $result = $this->imageSyncService->syncImagesForProperties($mlsIds);

        $progressBar->finish();
        $this->newLine(2);

        return $result;
    }

    /**
     * Display sync results
     */
    private function displayResults(array $result, int $duration): void
    {
        $this->info('Image sync completed successfully!');
        $this->newLine();

        $rows = [];

        if (isset($result['total_processed'])) {
            $rows[] = ['Total processed', $result['total_processed']];
        }

        $rows[] = ['Images updated', $result['updated']];
        $rows[] = ['Skipped', $result['skipped']];
        $rows[] = ['Failed', $result['failed']];
        $rows[] = ['Duration', $duration . ' seconds'];

        $this->table(['Metric', 'Count'], $rows);

        if (!empty($result['errors'])) {
            $this->newLine();
            $this->warn('Errors encountered:');
            foreach (array_slice($result['errors'], 0, 10) as $error) {
                $this->line('  - ' . $error);
            }

            if (count($result['errors']) > 10) {
                $this->line('  ... and ' . (count($result['errors']) - 10) . ' more errors');
            }
        }

        $this->newLine();
        $this->showStats();
    }

    /**
     * Show image statistics
     */
    private function showStats(): void
    {
        $stats = $this->imageSyncService->getImageStats();

        $this->info('MLS Image Statistics');
        $this->newLine();

        $withImages = $stats['properties_with_images'];
        $withoutImages = $stats['properties_without_images'];
        $total = $stats['total_properties'];
        $coverage = $total > 0 ? round(($withImages / $total) * 100, 1) : 0;

        $this->table(
            ['Statistic', 'Value'],
            [
                ['Total properties', number_format($total)],
                ['Properties with images', number_format($withImages)],
                ['Properties without images', number_format($withoutImages)],
                ['Active properties without images', number_format($stats['active_properties_without_images'])],
                ['Image coverage', $coverage . '%'],
            ]
        );
    }
}
