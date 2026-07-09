<?php

namespace App\Console\Commands;

use App\Models\Building;
use Illuminate\Console\Command;

class RefreshBuildingMlsStats extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'buildings:refresh-mls-stats {--id= : Refresh a single building by ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recompute price_range, sqft_range and avg_price_per_sqft for buildings from live MLS (Repliers) listings';

    public function handle(): int
    {
        $query = Building::query();

        if ($id = $this->option('id')) {
            $query->whereKey($id);
        }

        $buildings = $query->get();

        if ($buildings->isEmpty()) {
            $this->warn('No buildings found.');
            return self::SUCCESS;
        }

        $updated = 0;
        foreach ($buildings as $building) {
            $ok = $building->refreshPriceRangeFromMls();
            $building->refresh();
            $this->line(sprintf(
                '%s %s | price: %s | sqft: %s | avg $/sqft: %s',
                $ok ? '[OK]  ' : '[SKIP]',
                $building->name,
                $building->price_range ?? '-',
                $building->sqft_range ?? '-',
                $building->avg_price_per_sqft ?? '-'
            ));
            if ($ok) {
                $updated++;
            }
        }

        $this->info("Done. {$updated}/{$buildings->count()} buildings updated.");

        return self::SUCCESS;
    }
}
