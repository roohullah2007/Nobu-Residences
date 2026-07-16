<?php

namespace App\Console\Commands;

use App\Models\Building;
use App\Services\RepliersApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

/**
 * Step-by-step diagnostic for the "Available Units (Live MLS)" count on the
 * admin Building page. Prints every stage of Building::getLiveListingCounts()
 * (address fields -> parsed street addresses -> Repliers queries -> street
 * number matching -> cache) so a 0 can be traced to its exact cause.
 *
 * Usage:
 *   php artisan buildings:debug-counts a1a1407d-3cd6-4ed0-8c40-52d7cd625e53
 *   php artisan buildings:debug-counts the-well-a1a1407d-... --fresh
 */
class DebugBuildingCounts extends Command
{
    protected $signature = 'buildings:debug-counts
        {building : Building UUID or admin slug (name-slug-uuid)}
        {--fresh : Clear the counts cache and query Repliers without the listings cache}';

    protected $description = 'Trace why Available Units (Live MLS) shows a given number for a building';

    public function handle(RepliersApiService $api): int
    {
        $building = $this->resolveBuilding($this->argument('building'));
        if (!$building) {
            $this->error('Building not found.');
            return self::FAILURE;
        }

        $this->info("Building: {$building->name} ({$building->id})");
        $this->line('City: ' . ($building->city ?: '(empty)'));

        $this->newLine();
        $this->info('[1] Raw address fields');
        $this->line('address:              ' . ($building->address ?: '(empty)'));
        $this->line('street_address_1:     ' . ($building->street_address_1 ?: '(empty)'));
        $this->line('street_address_2:     ' . ($building->street_address_2 ?: '(empty)'));
        $this->line('additional_addresses: ' . json_encode($building->additional_addresses ?: []));

        $this->newLine();
        $this->info('[2] Parsed street addresses (what the matcher uses)');
        $addresses = $building->parsedStreetAddresses();
        if (empty($addresses)) {
            $this->error('NONE parsed -> counts are always 0. Fix: open the building in the admin,');
            $this->error('put the range (e.g. "455-480 Front St W, Toronto") in Address or fill the');
            $this->error('street address fields, and save. Ranges only expand on save.');
            return self::SUCCESS;
        }
        foreach ($addresses as $a) {
            $this->line("  {$a['number']} {$a['name']}");
        }

        $this->newLine();
        $this->info('[3] API config');
        $key = (string) config('repliers.api_key');
        $this->line('repliers.api_key: ' . ($key !== '' ? substr($key, 0, 4) . '...' . substr($key, -4) : 'MISSING'));
        $this->line('repliers.api_url: ' . config('repliers.api_url'));

        $this->newLine();
        $this->info('[4] Counts cache (what the admin page shows for up to 10 min)');
        $cacheKey = 'building_listing_counts:' . $building->id;
        $cached = Cache::get($cacheKey);
        $this->line("{$cacheKey} = " . ($cached === null ? '(not cached)' : json_encode($cached)));
        if ($this->option('fresh')) {
            Cache::forget($cacheKey);
            $this->line('--fresh: cache cleared.');
        }

        $this->newLine();
        $this->info('[5] Live Repliers queries (same grouping as getLiveListingCounts)');
        $groups = [];
        foreach ($addresses as $addr) {
            $groupKey = strtolower($addr['name']);
            if (!isset($groups[$groupKey])) {
                $groups[$groupKey] = ['name' => $addr['name'], 'numbers' => []];
            }
            $groups[$groupKey]['numbers'][$addr['number']] = true;
        }

        $sale = 0;
        $rent = 0;
        foreach ($groups as $g) {
            $wanted = array_keys($g['numbers']);
            $this->line("Street \"{$g['name']}\" | wanted numbers: " . implode(', ', $wanted));
            foreach (['sale', 'lease'] as $type) {
                $params = [
                    'class' => 'condoProperty',
                    'status' => 'A',
                    'type' => $type,
                    'streetName' => $g['name'],
                    'pageNum' => 1,
                    'resultsPerPage' => 200,
                ];
                if (!empty($building->city)) {
                    $params['city'] = $building->city;
                }

                try {
                    $resp = $this->option('fresh')
                        ? $api->searchListingsNoCache($params)
                        : $api->searchListings($params);
                } catch (\Throwable $e) {
                    $this->error("  {$type}: API ERROR -> " . $e->getMessage());
                    continue;
                }

                $listings = $resp['listings'] ?? [];
                $numbersSeen = [];
                $matched = 0;
                foreach ($listings as $L) {
                    $num = (string) ($L['address']['streetNumber'] ?? $L['StreetNumber'] ?? '');
                    if ($num !== '') {
                        $numbersSeen[$num] = true;
                    }
                    if ($num !== '' && isset($g['numbers'][$num])) {
                        $matched++;
                    }
                }
                if ($type === 'sale') $sale += $matched; else $rent += $matched;

                $this->line(sprintf(
                    '  %-5s: API returned %d listings (count=%s) | street numbers seen: %s | MATCHED: %d',
                    $type,
                    count($listings),
                    $resp['count'] ?? '?',
                    implode(', ', array_slice(array_keys($numbersSeen), 0, 25)) ?: '(none)',
                    $matched
                ));
            }
        }

        $this->newLine();
        $this->info("[6] Result: sale={$sale}, rent={$rent}, available_units_count=" . ($sale + $rent));
        if ($sale + $rent === 0) {
            $this->warn('Still 0 -> compare "street numbers seen" vs "wanted numbers" above:');
            $this->warn('- numbers seen but none wanted -> the building record is missing those street numbers (re-save with the full range in Address)');
            $this->warn('- 0 listings returned -> streetName/city do not match Repliers data, or API error above');
        } else {
            $this->line('The admin page will show this after its 10-minute cache expires (or run with --fresh and reload).');
        }

        return self::SUCCESS;
    }

    private function resolveBuilding(string $value): ?Building
    {
        // Accept a bare UUID or the admin's "name-slug-uuid" form.
        if (preg_match('/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i', $value, $m)) {
            return Building::find($m[1]);
        }

        return Building::find($value) ?? Building::where('slug', $value)->first();
    }
}
