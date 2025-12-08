<?php

namespace App\Console\Commands;

use App\Services\SavedSearchAlertService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendSavedSearchAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alerts:send-saved-search
                            {--dry-run : Run without actually sending alerts or updating timestamps}
                            {--user= : Process alerts for a specific user ID only}
                            {--stats : Show statistics about saved search alerts}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send email alerts for saved searches with new matching listings';

    protected SavedSearchAlertService $alertService;

    /**
     * Create a new command instance.
     */
    public function __construct(SavedSearchAlertService $alertService)
    {
        parent::__construct();
        $this->alertService = $alertService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Show stats only
        if ($this->option('stats')) {
            $this->showStats();
            return 0;
        }

        $dryRun = $this->option('dry-run');
        $userId = $this->option('user');

        if ($dryRun) {
            $this->warn('Running in DRY RUN mode - no alerts will be sent or timestamps updated');
            $this->newLine();
        }

        $this->info('Starting saved search alert processing...');
        $this->newLine();

        $startTime = now();

        try {
            if ($userId) {
                // Process for specific user
                $this->line("Processing alerts for user ID: {$userId}");
                $result = $this->alertService->processAlertsForUser((int) $userId, $dryRun);
            } else {
                // Process all due alerts
                $result = $this->alertService->processAlerts($dryRun);
            }

            $duration = $startTime->diffInSeconds(now());

            $this->displayResults($result, $duration);

            // Log the results
            Log::info('Saved search alerts processed', [
                'result' => $result,
                'duration_seconds' => $duration,
                'dry_run' => $dryRun
            ]);

            return 0;

        } catch (\Exception $e) {
            $this->error('Alert processing failed: ' . $e->getMessage());
            Log::error('Saved search alert command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }

    /**
     * Display processing results
     */
    private function displayResults(array $result, int $duration): void
    {
        $this->info('Alert processing completed!');
        $this->newLine();

        $rows = [];

        if (isset($result['total_searches_checked'])) {
            $rows[] = ['Total searches checked', $result['total_searches_checked']];
        }

        if (isset($result['searches_due'])) {
            $rows[] = ['Searches due for alert', $result['searches_due']];
        }

        if (isset($result['searches_processed'])) {
            $rows[] = ['Searches processed', $result['searches_processed']];
        }

        $rows[] = ['Alerts sent', $result['alerts_sent'] ?? 0];

        if (isset($result['alerts_skipped'])) {
            $rows[] = ['Alerts skipped (no new listings)', $result['alerts_skipped']];
        }

        $rows[] = ['Duration', $duration . ' seconds'];

        if (!empty($result['dry_run'])) {
            $rows[] = ['Mode', 'DRY RUN (no changes made)'];
        }

        $this->table(['Metric', 'Value'], $rows);

        // Show errors if any
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
    }

    /**
     * Show saved search alert statistics
     */
    private function showStats(): void
    {
        $stats = $this->alertService->getAlertStats();

        $this->info('Saved Search Alert Statistics');
        $this->newLine();

        $this->table(
            ['Statistic', 'Value'],
            [
                ['Total saved searches', number_format($stats['total_saved_searches'])],
                ['Alerts enabled', number_format($stats['alerts_enabled'])],
                ['Alerts disabled', number_format($stats['alerts_disabled'])],
                ['Daily alerts', number_format($stats['frequency_breakdown']['daily'])],
                ['Weekly alerts', number_format($stats['frequency_breakdown']['weekly'])],
                ['Monthly alerts', number_format($stats['frequency_breakdown']['monthly'])],
                ['Alerts sent (last 7 days)', number_format($stats['alerts_sent_last_7_days'])],
            ]
        );
    }
}
