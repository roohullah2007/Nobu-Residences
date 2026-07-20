<?php

namespace App\Services;

use App\Models\UserPropertyFavourite;
use App\Notifications\FavouriteListingUpdateNotification;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Detects changes on favourited listings (price change, sold, leased,
 * terminated, expired, suspended) against the live Repliers API and emails
 * the owner — one bundled email per user, branded with the landing site the
 * favourites were saved on.
 *
 * The comparison baseline is last_notified_price / last_notified_status
 * (falling back to the price/status captured when the listing was
 * favourited), so each change is only ever emailed once.
 */
class FavouriteUpdateAlertService
{
    private const BATCH_SIZE = 50;

    private const STATUS_LABELS = [
        'sld' => 'Sold',
        'lsd' => 'Leased',
        'ter' => 'Terminated',
        'exp' => 'Expired',
        'sus' => 'Suspended',
        'lc' => 'Lease Cancelled',
        'sc' => 'Sold Conditionally',
        'pc' => 'Price Change',
        'ext' => 'Extended',
        'new' => 'Back on Market',
    ];

    private const GOOD_NEWS_COLOR = '#059669';
    private const BAD_NEWS_COLOR = '#e11d48';
    private const NEUTRAL_COLOR = '#293056';

    public function __construct(protected RepliersApiService $repliersApi)
    {
    }

    /**
     * Check every favourite for changes and send one bundled email per user.
     */
    public function processUpdates(bool $dryRun = false, ?int $userId = null): array
    {
        $stats = [
            'favourites_checked' => 0,
            'changes_detected' => 0,
            'emails_sent' => 0,
            'errors' => [],
            'dry_run' => $dryRun,
        ];

        $favourites = UserPropertyFavourite::with(['user', 'website'])
            ->when($userId, fn ($query) => $query->where('user_id', $userId))
            ->get()
            ->filter(fn ($favourite) => $favourite->user && $favourite->user->email);

        $stats['favourites_checked'] = $favourites->count();

        if ($favourites->isEmpty()) {
            return $stats;
        }

        $currentListings = $this->fetchCurrentListings(
            $favourites->pluck('property_listing_key')->unique()->values()->all()
        );

        foreach ($favourites->groupBy('user_id') as $userFavourites) {
            $this->processUserFavourites($userFavourites, $currentListings, $dryRun, $stats);
        }

        return $stats;
    }

    /**
     * Detect changes for one user's favourites, send the bundle, snapshot.
     *
     * @param Collection<int, UserPropertyFavourite> $userFavourites
     */
    private function processUserFavourites(Collection $userFavourites, array $currentListings, bool $dryRun, array &$stats): void
    {
        $updates = [];
        $changed = [];

        foreach ($userFavourites as $favourite) {
            $listing = $currentListings[$favourite->property_listing_key] ?? null;
            if (!$listing) {
                continue; // Listing no longer returned — nothing reliable to report.
            }

            $card = $this->detectChange($favourite, $listing, $dryRun);
            if ($card) {
                $updates[] = $card;
                $changed[] = $favourite;
            }
        }

        if (empty($updates)) {
            return;
        }

        $stats['changes_detected'] += count($updates);

        try {
            if (!$dryRun) {
                $user = $userFavourites->first()->user;
                $website = collect($changed)->first(fn ($favourite) => $favourite->website)?->website;
                $user->notify(new FavouriteListingUpdateNotification($updates, $website));
                $this->snapshot($changed, $currentListings);
            }
            $stats['emails_sent']++;
        } catch (Exception $e) {
            $stats['errors'][] = "User #{$userFavourites->first()->user_id}: " . $e->getMessage();
            Log::error('Favourite update alert failed', [
                'user_id' => $userFavourites->first()->user_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Compare a favourite against the listing's live state. Returns a listing
     * card (for the branded email template) when something changed, null
     * otherwise. First sight of a listing with no stored baseline status just
     * seeds the snapshot silently — never a change email.
     */
    private function detectChange(UserPropertyFavourite $favourite, array $listing, bool $dryRun): ?array
    {
        $notes = [];

        $currentPrice = (float) ($listing['listPrice'] ?? 0);
        $basePrice = (float) ($favourite->last_notified_price ?? $favourite->property_price ?? 0);
        if ($currentPrice > 0 && $basePrice > 0 && abs($currentPrice - $basePrice) >= 1) {
            $direction = $currentPrice < $basePrice ? 'reduced' : 'increased';
            $notes[] = [
                'text' => 'Price ' . $direction . ': $' . number_format($basePrice) . ' to $' . number_format($currentPrice),
                'color' => $currentPrice < $basePrice ? self::GOOD_NEWS_COLOR : self::NEUTRAL_COLOR,
            ];
        }

        $currentStatus = strtolower(trim((string) ($listing['lastStatus'] ?? '')));
        $baseStatus = $this->baselineStatus($favourite);

        if ($baseStatus === null) {
            // No baseline — seed it so the NEXT change is detected, but don't
            // email about a state the user may have favourited the listing in.
            if (!$dryRun && $currentStatus !== '') {
                $favourite->update(['last_notified_status' => $currentStatus]);
            }
        } elseif ($currentStatus !== '' && $currentStatus !== $baseStatus && $currentStatus !== 'pc') {
            // 'pc' (price change) is already covered by the price note above.
            $label = self::STATUS_LABELS[$currentStatus] ?? ucfirst($currentStatus);
            $notes[] = [
                'text' => 'Status changed: ' . $label,
                'color' => in_array($currentStatus, ['sld', 'lsd'], true) ? self::GOOD_NEWS_COLOR : self::BAD_NEWS_COLOR,
            ];
        }

        if (empty($notes)) {
            return null;
        }

        return $this->listingCard($favourite, $listing, $notes);
    }

    /**
     * Last status the user was told about, falling back to the status stored
     * when the listing was favourited.
     */
    private function baselineStatus(UserPropertyFavourite $favourite): ?string
    {
        $stored = $favourite->last_notified_status
            ?? ($favourite->property_data['lastStatus'] ?? null);

        $stored = strtolower(trim((string) $stored));

        return $stored === '' ? null : $stored;
    }

    /**
     * Build the email card for a changed favourite.
     */
    private function listingCard(UserPropertyFavourite $favourite, array $listing, array $notes): array
    {
        $details = $listing['details'] ?? [];
        $price = (float) ($listing['listPrice'] ?? 0);
        $imageUrls = $this->repliersApi->getListingImageUrls($listing, 'medium');

        return [
            'mls_id' => $listing['mlsNumber'] ?? $favourite->property_listing_key,
            'image_url' => $imageUrls[0] ?? null,
            'formatted_price' => $price > 0 ? '$' . number_format($price) : null,
            'address' => $this->formatListingAddress($listing) ?: $favourite->property_address,
            'city' => $listing['address']['city'] ?? $favourite->property_city,
            'bedrooms' => $details['numBedrooms'] ?? null,
            'bathrooms' => $details['numBathrooms'] ?? null,
            'square_footage' => $details['sqft'] ?? null,
            'note' => implode(' — ', array_column($notes, 'text')),
            'note_color' => $notes[0]['color'],
        ];
    }

    /**
     * Record what each changed favourite was notified about so the same
     * change never emails twice.
     *
     * @param array<int, UserPropertyFavourite> $changed
     */
    private function snapshot(array $changed, array $currentListings): void
    {
        foreach ($changed as $favourite) {
            $listing = $currentListings[$favourite->property_listing_key] ?? [];
            $price = (float) ($listing['listPrice'] ?? 0);
            $status = strtolower(trim((string) ($listing['lastStatus'] ?? '')));

            $favourite->update([
                'last_notified_price' => $price > 0 ? $price : $favourite->last_notified_price,
                'last_notified_status' => $status !== '' ? $status : $favourite->last_notified_status,
            ]);
        }
    }

    /**
     * Fetch the live state of every favourited listing, keyed by MLS number.
     * Includes unavailable (sold/leased) listings — status changes are the
     * whole point.
     */
    private function fetchCurrentListings(array $listingKeys): array
    {
        $map = [];

        foreach (array_chunk($listingKeys, self::BATCH_SIZE) as $batch) {
            try {
                $result = $this->repliersApi->searchListingsNoCache([
                    'mlsNumber' => $batch,
                    'status' => ['A', 'U'],
                    'resultsPerPage' => count($batch),
                    'fields' => 'mlsNumber,listPrice,lastStatus,address,details,images',
                ]);

                foreach ($result['listings'] ?? [] as $listing) {
                    if (!empty($listing['mlsNumber'])) {
                        $map[$listing['mlsNumber']] = $listing;
                    }
                }
            } catch (Exception $e) {
                Log::warning('Favourite update batch fetch failed', ['error' => $e->getMessage()]);
            }
        }

        return $map;
    }

    /**
     * Format a Repliers listing's street address, e.g. "3201 - 308 Jarvis St E".
     */
    private function formatListingAddress(array $listing): string
    {
        $address = $listing['address'] ?? [];

        $street = trim(implode(' ', array_filter([
            $address['streetNumber'] ?? null,
            $address['streetName'] ?? null,
            $address['streetSuffix'] ?? null,
            $address['streetDirection'] ?? null,
        ])));

        $unit = $address['unitNumber'] ?? null;

        return $unit && $street ? "{$unit} - {$street}" : $street;
    }
}
