<?php

namespace App\Console\Commands;

use App\Services\FavouriteUpdateAlertService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendFavouriteUpdateAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alerts:send-favourite-updates
                            {--dry-run : Detect changes without sending emails or updating snapshots}
                            {--user= : Process favourites for a specific user ID only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Email users when their favourited listings change (price change, sold, leased, delisted)';

    public function __construct(protected FavouriteUpdateAlertService $alertService)
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $userId = $this->option('user') ? (int) $this->option('user') : null;

        if ($dryRun) {
            $this->warn('Running in DRY RUN mode - no emails will be sent or snapshots updated');
        }

        $this->info('Checking favourited listings for updates...');

        try {
            $stats = $this->alertService->processUpdates($dryRun, $userId);

            $this->table(['Metric', 'Value'], [
                ['Favourites checked', $stats['favourites_checked']],
                ['Changes detected', $stats['changes_detected']],
                ['Emails sent', $stats['emails_sent']],
                ['Mode', $dryRun ? 'DRY RUN' : 'Live'],
            ]);

            foreach (array_slice($stats['errors'], 0, 10) as $error) {
                $this->warn('  - ' . $error);
            }

            Log::info('Favourite update alerts processed', $stats);

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Favourite update processing failed: ' . $e->getMessage());
            Log::error('Favourite update alert command failed', ['error' => $e->getMessage()]);

            return self::FAILURE;
        }
    }
}
