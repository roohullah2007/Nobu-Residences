<?php

namespace App\Notifications;

use App\Models\SavedSearch;
use App\Support\EmailBranding;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * "New listings match your saved search" email, on the shared site-branded
 * template (emails/branded.blade.php) — branded with and linking to the
 * landing site the search was saved on (website_id), falling back to the
 * default website.
 *
 * Sent synchronously (no ShouldQueue) on purpose: alerts go out from the
 * scheduled alerts:send-saved-search command, and the production server
 * runs no queue worker — a queued notification would sit in the jobs
 * table forever and never reach the user.
 */
class SavedSearchAlertNotification extends Notification
{
    protected SavedSearch $savedSearch;
    protected array $listings;
    protected int $totalCount;

    private const MAX_LISTINGS_SHOWN = 5;

    public function __construct(SavedSearch $savedSearch, array $listings, int $totalCount)
    {
        $this->savedSearch = $savedSearch;
        $this->listings = $listings;
        $this->totalCount = $totalCount;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $branding = EmailBranding::forWebsite($this->savedSearch->website);
        $searchName = $this->savedSearch->name ?? 'Your Saved Search';
        $firstName = explode(' ', trim((string) $notifiable->name), 2)[0] ?: 'there';
        $listingWord = $this->totalCount === 1 ? 'listing' : 'listings';
        $shown = array_slice($this->listings, 0, self::MAX_LISTINGS_SHOWN);
        $remaining = count($this->listings) - count($shown);

        $paragraphs = [
            'Hi ' . e($firstName) . ", we found <strong>{$this->totalCount} new {$listingWord}</strong> matching your saved search \"" . e($searchName) . '".',
        ];
        if ($remaining > 0) {
            $paragraphs[] = 'Here are the newest ' . count($shown) . ' — plus ' . $remaining . ' more on the site.';
        }

        return (new MailMessage)
            ->subject("New Listings Match \"{$searchName}\" - {$this->totalCount} Properties Found")
            ->view('emails.branded', [
                'siteName' => $branding['siteName'],
                'logoUrl' => $branding['logoUrl'],
                'title' => 'New listings match your search',
                'paragraphs' => $paragraphs,
                'rows' => ['Criteria' => $this->savedSearch->formatted_criteria],
                'listings' => $this->brandedListings($shown, $branding['homeUrl']),
                'buttonText' => 'View all listings',
                'buttonUrl' => $this->getSearchUrl($branding['homeUrl']),
                'footnote' => "You're receiving this email because you have a {$this->getFrequencyText()} alert set up for \"{$searchName}\". You can manage your alerts from your dashboard.",
            ]);
    }

    /**
     * Get the array representation of the notification (for database storage).
     */
    public function toArray($notifiable): array
    {
        return [
            'saved_search_id' => $this->savedSearch->id,
            'saved_search_name' => $this->savedSearch->name,
            'listings_count' => $this->totalCount,
            'listings' => array_map(function ($listing) {
                return [
                    'mls_id' => $listing['mls_id'],
                    'address' => $listing['address'],
                    'price' => $listing['price'],
                ];
            }, array_slice($this->listings, 0, self::MAX_LISTINGS_SHOWN)),
            'sent_at' => now()->toDateTimeString(),
        ];
    }

    /**
     * Re-point each listing's detail link at the branded site's domain (the
     * service builds them against app.url).
     */
    protected function brandedListings(array $listings, string $homeUrl): array
    {
        return array_map(function ($listing) use ($homeUrl) {
            if (!empty($listing['mls_id'])) {
                $listing['url'] = $homeUrl . '/property/' . $listing['mls_id'];
            }

            return $listing;
        }, $listings);
    }

    protected function getFrequencyText(): string
    {
        return match ($this->savedSearch->frequency ?? 1) {
            1 => 'daily',
            7 => 'weekly',
            30 => 'monthly',
            default => 'daily'
        };
    }

    /**
     * Link to the branded site's search page with the saved criteria applied
     * (same param mapping as SavedSearchController::run()).
     */
    protected function getSearchUrl(string $homeUrl): string
    {
        $params = $this->savedSearch->search_params ?? [];

        $urlParams = array_filter([
            'query' => $params['query'] ?? null,
            'status' => $params['status'] ?? $params['transaction_type'] ?? null,
            'property_type' => is_array($params['property_type'] ?? null)
                ? implode(',', $params['property_type'])
                : ($params['property_type'] ?? null),
            'min_price' => ($params['price_min'] ?? 0) > 0 ? $params['price_min'] : null,
            'max_price' => ($params['price_max'] ?? 0) > 0 && ($params['price_max'] ?? 0) < 10000000 ? $params['price_max'] : null,
            'bedrooms' => ($params['bedrooms'] ?? 0) > 0 ? $params['bedrooms'] : null,
            'bathrooms' => ($params['bathrooms'] ?? 0) > 0 ? $params['bathrooms'] : null,
            'min_sqft' => ($params['min_sqft'] ?? 0) > 0 ? $params['min_sqft'] : null,
            'max_sqft' => ($params['max_sqft'] ?? 0) > 0 ? $params['max_sqft'] : null,
        ]);

        return $homeUrl . '/search' . ($urlParams ? '?' . http_build_query($urlParams) : '');
    }
}
