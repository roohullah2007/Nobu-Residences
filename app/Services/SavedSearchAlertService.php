<?php

namespace App\Services;

use App\Models\MLSProperty;
use App\Models\SavedSearch;
use App\Models\SavedSearchAlertHistory;
use App\Models\User;
use App\Notifications\SavedSearchAlertNotification;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Service for processing saved search alerts
 *
 * Handles:
 * - Finding saved searches due for alerts
 * - Running searches to find new listings
 * - Sending notifications to users
 * - Tracking alert history
 */
class SavedSearchAlertService
{
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

        // Build query
        $query = MLSProperty::query()
            ->where('is_active', true)
            ->where('status', 'active');

        // Apply listing date filter - only get listings added since last alert
        $query->where('listed_date', '>=', $sinceDate);

        // Apply status/transaction type filter
        $status = $params['status'] ?? 'For Sale';
        if ($status === 'For Sale') {
            $query->where('property_type', 'For Sale');
        } elseif (in_array($status, ['For Lease', 'For Rent'])) {
            $query->where('property_type', 'For Rent');
        }

        // Apply location filter
        if (!empty($params['query'])) {
            $searchQuery = trim($params['query']);

            // Detect if it's a postal code
            if (preg_match('/^[A-Za-z]\d[A-Za-z][\s-]?\d[A-Za-z]\d$/i', $searchQuery)) {
                $postalCode = strtoupper(str_replace([' ', '-'], '', $searchQuery));
                $query->whereRaw("REPLACE(REPLACE(postal_code, ' ', ''), '-', '') LIKE ?", ["%{$postalCode}%"]);
            } else {
                // Street address or city search - use FULLTEXT on address
                $words = preg_split('/\s+/', $searchQuery);
                $longWords = array_filter($words, fn($w) => strlen($w) >= 4);
                $shortWords = array_filter($words, fn($w) => strlen($w) < 4 && strlen($w) > 0);

                if (!empty($longWords)) {
                    $fulltextQuery = implode(' ', array_map(fn($w) => '+' . $w . '*', $longWords));
                    $query->whereRaw("MATCH(address) AGAINST(? IN BOOLEAN MODE)", [$fulltextQuery]);
                }

                if (!empty($shortWords)) {
                    foreach ($shortWords as $word) {
                        $query->where('address', 'like', $word . ' %');
                    }
                }
            }
        }

        // Apply property type filter
        if (!empty($params['property_type']) && is_array($params['property_type']) && count($params['property_type']) > 0) {
            $query->whereIn('property_sub_type', $params['property_type']);
        }

        // Apply price range filter
        $priceMin = $params['price_min'] ?? 0;
        $priceMax = $params['price_max'] ?? 0;

        if ($priceMin > 0) {
            $query->where('price', '>=', $priceMin);
        }
        if ($priceMax > 0 && $priceMax < 10000000) {
            $query->where('price', '<=', $priceMax);
        }

        // Apply bedroom filter
        $bedrooms = $params['bedrooms'] ?? 0;
        if ($bedrooms > 0) {
            $query->where('bedrooms', '>=', $bedrooms);
        }

        // Apply bathroom filter
        $bathrooms = $params['bathrooms'] ?? 0;
        if ($bathrooms > 0) {
            $query->where('bathrooms', '>=', $bathrooms);
        }

        // Prioritize properties with images, order by newest
        $query->orderBy('has_images', 'desc')
              ->orderBy('listed_date', 'desc');

        // Limit to 10 properties for email (don't want to overwhelm)
        return $query->limit(10)->get();
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

        // Format properties for the notification
        $formattedListings = $newListings->map(function ($property) {
            return [
                'id' => $property->id,
                'mls_id' => $property->mls_id,
                'address' => $property->address,
                'city' => $property->city,
                'price' => $property->price,
                'formatted_price' => '$' . number_format($property->price),
                'bedrooms' => $property->bedrooms,
                'bathrooms' => $property->bathrooms,
                'square_footage' => $property->square_footage,
                'property_type' => $property->property_sub_type ?? $property->property_type,
                'image_url' => $this->getFirstImageUrl($property),
                'url' => $this->getPropertyUrl($property),
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
            $listingKeys = $newListings->pluck('mls_id')->toArray();
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
     * Get the first image URL for a property
     *
     * @param MLSProperty $property
     * @return string|null
     */
    protected function getFirstImageUrl(MLSProperty $property): ?string
    {
        $imageUrls = $property->image_urls;

        if (is_array($imageUrls) && !empty($imageUrls)) {
            return $imageUrls[0];
        }

        return null;
    }

    /**
     * Generate property URL
     *
     * @param MLSProperty $property
     * @return string
     */
    protected function getPropertyUrl(MLSProperty $property): string
    {
        return config('app.url') . '/property/' . $property->mls_id;
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
