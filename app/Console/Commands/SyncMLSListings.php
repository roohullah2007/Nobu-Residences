<?php

namespace App\Console\Commands;

use App\Services\MLSSyncService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncMLSListings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mls:sync
                            {--limit=2500 : Maximum number of listings to sync}
                            {--batch=100 : Batch size for processing}
                            {--mls-ids=* : Specific MLS IDs to sync}
                            {--incremental : Only sync listings modified since last sync (RECOMMENDED)}
                            {--stats : Show sync statistics only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync MLS property listings to local database (does not download images)';

    private MLSSyncService $syncService;

    /**
     * Create a new command instance.
     */
    public function __construct(MLSSyncService $syncService)
    {
        parent::__construct();
        $this->syncService = $syncService;
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

        $this->info('🔄 Starting MLS sync...');
        $this->newLine();

        $startTime = now();

        try {
            // Sync specific listings by MLS IDs
            if (!empty($this->option('mls-ids'))) {
                $result = $this->syncSpecificListings();
            } elseif ($this->option('incremental')) {
                $result = $this->syncIncrementalUpdates();
            } else {
                $result = $this->syncAllListings();
            }

            $duration = $startTime->diffInSeconds(now());

            if ($result['success']) {
                $this->displayResults($result, $duration);
                return 0;
            } else {
                $this->error('❌ Sync failed: ' . ($result['error'] ?? 'Unknown error'));
                return 1;
            }

        } catch (\Exception $e) {
            $this->error('❌ Sync error: ' . $e->getMessage());
            Log::error('MLS Sync Command Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }

    /**
     * Sync all listings
     */
    private function syncAllListings(): array
    {
        $limit = (int) $this->option('limit');
        $batchSize = (int) $this->option('batch');

        $this->line("Syncing up to {$limit} listings in batches of {$batchSize}...");

        $progressBar = $this->output->createProgressBar($limit);
        $progressBar->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');
        $progressBar->setMessage('Starting...');
        $progressBar->start();

        $result = $this->syncService->syncAllListings([
            'limit' => $limit,
            'batch_size' => $batchSize,
        ]);

        $progressBar->setMessage('Complete!');
        $progressBar->finish();
        $this->newLine(2);

        return $result;
    }

    /**
     * Sync specific listings by MLS IDs
     */
    private function syncSpecificListings(): array
    {
        $mlsIds = $this->option('mls-ids');

        $this->line("Syncing " . count($mlsIds) . " specific listing(s)...");

        $progressBar = $this->output->createProgressBar(count($mlsIds));
        $progressBar->start();

        $result = $this->syncService->syncSpecificListings($mlsIds);

        $progressBar->finish();
        $this->newLine(2);

        return $result;
    }

    /**
     * Sync only updated/changed listings (Incremental)
     */
    private function syncIncrementalUpdates(): array
    {
        $batchSize = (int) $this->option('batch');

        $this->line("Syncing only modified listings since last sync (incremental)...");
        $this->newLine();

        $result = $this->syncService->syncIncrementalUpdates([
            'batch_size' => $batchSize,
            'max_batches' => 50,
        ]);

        return $result;
    }

    /**
     * Display sync results
     */
    private function displayResults(array $result, int $duration): void
    {
        $this->info('✅ Sync completed successfully!');
        $this->newLine();

        $rows = [
            ['New listings synced', $result['synced'] ?? 0],
            ['Listings updated', $result['updated'] ?? 0],
        ];

        // Add status changed if present (incremental sync)
        if (isset($result['status_changed'])) {
            $rows[] = ['Status changed', $result['status_changed']];
        }

        // Add deactivated if present (full sync)
        if (isset($result['deactivated'])) {
            $rows[] = ['Listings deactivated', $result['deactivated']];
        }

        $rows[] = ['Failed', $result['failed'] ?? 0];
        $rows[] = ['Duration', $duration . ' seconds'];

        // Add since date if present (incremental sync)
        if (isset($result['since'])) {
            $rows[] = ['Synced since', $result['since']];
        }

        $this->table(['Metric', 'Count'], $rows);

        if (!empty($result['errors'])) {
            $this->newLine();
            $this->warn('⚠️  Errors encountered:');
            foreach (array_slice($result['errors'], 0, 10) as $error) {
                $this->line('  • ' . $error);
            }

            if (count($result['errors']) > 10) {
                $this->line('  ... and ' . (count($result['errors']) - 10) . ' more errors');
            }
        }

        $this->newLine();
        $this->showStats();
    }

    /**
     * Show sync statistics
     */
    private function showStats(): void
    {
        $stats = $this->syncService->getSyncStats();

        $this->info('📊 MLS Database Statistics');
        $this->newLine();

        $this->table(
            ['Statistic', 'Value'],
            [
                ['Total properties', number_format($stats['total_properties'])],
                ['Active properties', number_format($stats['active_properties'])],
                ['Inactive properties', number_format($stats['inactive_properties'])],
                ['Failed syncs', number_format($stats['failed_syncs'])],
                ['For Sale', number_format($stats['for_sale'])],
                ['For Rent', number_format($stats['for_rent'])],
                ['Need sync (>24h old)', number_format($stats['needs_sync'])],
                ['Last sync', $stats['last_sync'] ? $stats['last_sync']->diffForHumans() : 'Never'],
            ]
        );
    }
}
