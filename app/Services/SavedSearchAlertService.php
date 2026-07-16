<?php

namespace App\Services;

use App\Http\Controllers\PropertySearchController;
use App\Models\SavedSearch;
use App\Models\SavedSearchAlertHistory;
use App\Models\User;
use App\Notifications\SavedSearchAlertNotification;
use App\Services\RepliersApiService;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Service for processing saved search alerts
 *
 * Handles:
 * - Finding saved searches due for alerts
 * - Running searches to find new listings (live Repliers API — the local
 *   mls_properties mirror and its sync commands were removed, so matching
 *   queries the same source the search page uses)
 * - Sending notifications to users
 * - Tracking alert history
 */
class SavedSearchAlertService
{
    public function __construct(protected RepliersApiService $repliersApi)
    {
    }

    /**
     * Process all due saved search alerts
     *
     * @param bool $dryRun If true, don't actually send alerts or update timestamps
     * @return array Statistics about the processing
     */
    public function processAlerts(bool $dryRun = false): array
    {
        $stats = [
            'total_searches_checked' => 0,
            'searches_due' => 0,
            'alerts_sent' => 0,
            'alerts_skipped' => 0,
            'errors' => [],
            'dry_run' => $dryRun,
            'started_at' => now()->toDateTimeString(),
        ];

        try {
            // Get all saved searches with email alerts enabled
            $savedSearches = SavedSearch::withEmailAlerts()
                ->with('user')
                ->get();

            $stats['total_searches_checked'] = $savedSearches->count();

            foreach ($savedSearches as $savedSearch) {
                try {
                    // Check if this search is due for an alert
                    if (!$this->isDueForAlert($savedSearch)) {
                        $stats['alerts_skipped']++;
                        continue;
                    }

                    $stats['searches_due']++;

                    // Find new listings matching this search
                    $newListings = $this->findNewListings($savedSearch);

                    if ($newListings->isEmpty()) {
                        Log::debug("No new listings for saved search #{$savedSearch->id}");
                        $stats['alerts_skipped']++;

                        // Update last_alert_sent even if no new listings to prevent repeated checks
                        if (!$dryRun) {
                            $savedSearch->updateLastAlertSent();
                        }
                        continue;
                    }

                    // Send notification
                    if (!$dryRun) {
                        $this->sendAlertNotification($savedSearch, $newListings);
                        $savedSearch->updateLastAlertSent();
                        $savedSearch->update(['results_count' => $newListings->count()]);
                    }

                    $stats['alerts_sent']++;

                    Log::info("Alert sent for saved search #{$savedSearch->id}", [
                        'user_id' => $savedSearch->user_id,
                        'new_listings_count' => $newListings->count(),
                        'dry_run' => $dryRun
                    ]);

                } catch (Exception $e) {
                    $stats['errors'][] = "Search #{$savedSearch->id}: " . $e->getMessage();
                    Log::error("Error processing saved search alert", [
                        'search_id' => $savedSearch->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

        } catch (Exception $e) {
            $stats['errors'][] = 'Fatal error: ' . $e->getMessage();
            Log::error("Fatal error in alert processing: " . $e->getMessage());
        }

        $stats['completed_at'] = now()->toDateTimeString();

        return $stats;
    }

    /**
     * Check if a saved search is due for an alert based on frequency
     *
     * @param SavedSearch $savedSearch
     * @return bool
     */
    public function isDueForAlert(SavedSearch $savedSearch): bool
    {
        // If never sent before, it's due
        if (!$savedSearch->last_alert_sent) {
            return true;
        }

        $frequency = $savedSearch->frequency ?? 1; // Default to daily
        $lastSent = $savedSearch->last_alert_sent;

        // Calculate when next alert is due
        $nextDue = match ($frequency) {
            1 => $lastSent->addDay(),      // Daily
            7 => $lastSent->addWeek(),     // Weekly
            30 => $lastSent->addMonth(),   // Monthly
            default => $lastSent->addDay()
        };

        return now()->gte($nextDue);
    }

    /**
     * Find new listings matching a saved search since last alert
     *
     * @param SavedSearch $savedSearch
     * @return Collection
     */
    public function findNewListings(SavedSearch $savedSearch): Collection
    {
        $params = $savedSearch->search_params ?? [];

        // Determine the date to look for new listings from
        $sinceDate = $savedSearch->last_alert_sent ?? now()->subDays($savedSearch->frequency ?? 1);

        // Reuse the search page's param mapping (city/address parsing,
        // property-type expansion, price/bed/bath filters, building
        // scoping) so alert emails match exactly what the user sees when
        // they run the same search on the site.
        $apiParams = app(PropertySearchController::class)->buildRepliersListingsParams($params);

        // Alerts are always about NEW active listings — never sold/leased
        // history, even if the saved search was created from a Sold tab.
        $apiParams['status'] = 'A';
        unset($apiParams['lastStatus']);

        // Only listings added since the last alert
        $apiParams['minListDate'] = $sinceDate->format('Y-m-d');

        // Limit to 10 newest for the email (don't want to overwhelm);
        // bypass the search cache so a stale count never suppresses alerts.
        $apiParams['pageNum'] = 1;
        $apiParams['resultsPerPage'] = 10;
        $apiParams['sortBy'] = 'createdOnDesc';

        $result = $this->repliersApi->searchListingsNoCache($apiParams);

        return collect($result['listings'] ?? []);
    }

    /**
     * Send alert notification to user
     *
     * @param SavedSearch $savedSearch
     * @param Collection $newListings
     */
    protected function sendAlertNotification(SavedSearch $savedSearch, Collection $newListings): void
    {
        $user = $savedSearch->user;

        if (!$user || !$user->email) {
            Log::warning("Cannot send alert - user not found or has no email", [
                'search_id' => $savedSearch->id
            ]);
            return;
        }

        // Format Repliers listings for the notification
        $formattedListings = $newListings->map(function ($listing) {
            $price = (float) ($listing['listPrice'] ?? 0);
            $details = $listing['details'] ?? [];

            return [
                'id' => $listing['mlsNumber'] ?? null,
                'mls_id' => $listing['mlsNumber'] ?? null,
                'address' => $this->formatListingAddress($listing),
                'city' => $listing['address']['city'] ?? '',
                'price' => $price,
                'formatted_price' => '$' . number_format($price),
                'bedrooms' => $details['numBedrooms'] ?? null,
                'bathrooms' => $details['numBathrooms'] ?? null,
                'square_footage' => $details['sqft'] ?? null,
                'property_type' => $details['propertyType'] ?? null,
                'image_url' => $this->getFirstImageUrl($listing),
                'url' => $this->getPropertyUrl($listing),
            ];
        })->toArray();

        // Send the notification
        $user->notify(new SavedSearchAlertNotification(
            $savedSearch,
            $formattedListings,
            $newListings->count()
        ));

        // Record alert history
        try {
            $listingKeys = $newListings->pluck('mlsNumber')->filter()->values()->toArray();
            SavedSearchAlertHistory::recordAlert($savedSearch, $listingKeys, 'sent');

            // Increment total alerts sent counter
            $savedSearch->increment('total_alerts_sent');
        } catch (Exception $e) {
            Log::warning("Failed to record alert history", [
                'search_id' => $savedSearch->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Format a Repliers listing's street address, e.g. "3201 - 308 Jarvis St E"
     *
     * @param array $listing
     * @return string
     */
    protected function formatListingAddress(array $listing): string
    {
        $address = $listing['address'] ?? [];

        $street = trim(implode(' ', array_filter([
            $address['streetNumber'] ?? null,
            $address['streetName'] ?? null,
            $address['streetSuffix'] ?? null,
            $address['streetDirection'] ?? null,
        ])));

        $unit = $address['unitNumber'] ?? null;

        return $unit ? "{$unit} - {$street}" : $street;
    }

    /**
     * Get the first image URL for a Repliers listing
     *
     * @param array $listing
     * @return string|null
     */
    protected function getFirstImageUrl(array $listing): ?string
    {
        $urls = $this->repliersApi->getListingImageUrls($listing, 'medium');

        return $urls[0] ?? null;
    }

    /**
     * Generate property URL
     *
     * @param array $listing
     * @return string
     */
    protected function getPropertyUrl(array $listing): string
    {
        return config('app.url') . '/property/' . ($listing['mlsNumber'] ?? '');
    }

    /**
     * Get statistics about saved search alerts
     *
     * @return array
     */
    public function getAlertStats(): array
    {
        $totalSearches = SavedSearch::count();
        $alertsEnabled = SavedSearch::withEmailAlerts()->count();

        $frequencies = SavedSearch::withEmailAlerts()
            ->selectRaw('frequency, COUNT(*) as count')
            ->groupBy('frequency')
            ->pluck('count', 'frequency')
            ->toArray();

        $recentAlerts = SavedSearch::withEmailAlerts()
            ->whereNotNull('last_alert_sent')
            ->where('last_alert_sent', '>=', now()->subDays(7))
            ->count();

        return [
            'total_saved_searches' => $totalSearches,
            'alerts_enabled' => $alertsEnabled,
            'alerts_disabled' => $totalSearches - $alertsEnabled,
            'frequency_breakdown' => [
                'daily' => $frequencies[1] ?? 0,
                'weekly' => $frequencies[7] ?? 0,
                'monthly' => $frequencies[30] ?? 0,
            ],
            'alerts_sent_last_7_days' => $recentAlerts,
        ];
    }

    /**
     * Process alerts for a specific user (useful for testing)
     *
     * @param int $userId
     * @param bool $dryRun
     * @return array
     */
    public function processAlertsForUser(int $userId, bool $dryRun = false): array
    {
        $stats = [
            'user_id' => $userId,
            'searches_processed' => 0,
            'alerts_sent' => 0,
            'errors' => [],
        ];

        $savedSearches = SavedSearch::withEmailAlerts()
            ->where('user_id', $userId)
            ->with('user')
            ->get();

        foreach ($savedSearches as $savedSearch) {
            try {
                $stats['searches_processed']++;

                $newListings = $this->findNewListings($savedSearch);

                if ($newListings->isEmpty()) {
                    continue;
                }

                if (!$dryRun) {
                    $this->sendAlertNotification($savedSearch, $newListings);
                    $savedSearch->updateLastAlertSent();
                    $savedSearch->update(['results_count' => $newListings->count()]);
                }

                $stats['alerts_sent']++;

            } catch (Exception $e) {
                $stats['errors'][] = $e->getMessage();
            }
        }

        return $stats;
    }
}
