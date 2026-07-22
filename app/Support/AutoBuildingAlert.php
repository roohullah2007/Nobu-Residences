<?php

namespace App\Support;

use App\Models\Building;
use App\Models\SavedSearch;
use App\Models\User;
use App\Models\Website;
use Illuminate\Support\Facades\Log;

/**
 * Auto-subscribes a NEW registrant to the tenant building's daily listings
 * alert (per client: every signup starts receiving the listings email the
 * next day). Creates the exact same SavedSearch row the "Get alerts" button
 * does (SavedSearchController::toggleBuildingAlert), so the button correctly
 * shows "subscribed" and can unsubscribe, and the existing
 * alerts:send-saved-search scheduler picks it up unchanged — with
 * last_alert_sent null, the first daily send covers the past day's listings.
 */
class AutoBuildingAlert
{
    /**
     * Guarded — a failure here must never break registration (same contract
     * as WelcomeNewUser::send).
     */
    public static function subscribe(User $user, ?Website $website): void
    {
        try {
            if (!$website || !$website->homepage_building_id) {
                return;
            }

            $building = Building::find($website->homepage_building_id);
            if (!$building) {
                return;
            }

            // One subscription per user+building — the same idempotence key
            // toggleBuildingAlert uses.
            $exists = SavedSearch::where('user_id', $user->id)
                ->where('building_id', $building->id)
                ->exists();
            if ($exists) {
                return;
            }

            // Pin the building the same way the building detail page scopes
            // its live listings: every street address, comma-separated.
            $addresses = array_filter([
                $building->street_address_1 ?? null,
                $building->street_address_2 ?? null,
            ]);
            if (is_array($building->additional_addresses)) {
                $addresses = array_merge($addresses, array_filter($building->additional_addresses));
            }
            if (empty($addresses) && !empty($building->address)) {
                $addresses[] = $building->address;
            }

            SavedSearch::create([
                'user_id' => $user->id,
                'website_id' => $website->id,
                'building_id' => $building->id,
                'name' => 'Alerts: ' . $building->name,
                'search_params' => [
                    'building_id' => $building->id,
                    'street_addresses' => implode(',', array_values($addresses)),
                    // 'Both' = no sale/lease type filter → alerts for new sale
                    // AND rent listings in this building.
                    'status' => 'Both',
                ],
                'email_alerts' => true,
                'frequency' => 1, // daily
                'results_count' => 0,
            ]);

            Log::info('Auto-subscribed new registrant to building alerts', [
                'user_id' => $user->id,
                'building_id' => $building->id,
                'website_id' => $website->id,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Auto building-alert subscription failed for new registrant', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
