<?php

namespace App\Jobs;

use App\Models\Building;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Auto-fills a building's price_range from live MLS (Repliers) listings.
 *
 * Dispatched with dispatchAfterResponse() from the Building store/update
 * flow so the admin's save stays fast and the Repliers round-trips happen
 * after the HTTP response has been sent (no queue worker required).
 */
class RefreshBuildingPriceRangeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public int $timeout = 60;

    public function __construct(public string $buildingId)
    {
    }

    public function handle(): void
    {
        $building = Building::find($this->buildingId);
        if (!$building) {
            return;
        }

        $updated = $building->refreshPriceRangeFromMls();

        Log::info('Building price range MLS refresh', [
            'building_id' => $this->buildingId,
            'updated' => $updated,
            'price_range' => $building->price_range,
            'sqft_range' => $building->sqft_range,
            'avg_price_per_sqft' => $building->avg_price_per_sqft,
        ]);
    }
}
