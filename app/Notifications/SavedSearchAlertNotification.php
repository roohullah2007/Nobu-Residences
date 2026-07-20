<?php

namespace App\Notifications;

use App\Models\SavedSearch;
use App\Support\EmailBranding;
use App\Support\ListingEmailCard;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

/**
 * "New listings match your saved search" email on the listing-alert template
 * (emails/listing-alert.blade.php — agent header, thank-you box, property
 * cards with FOR SALE / FOR RENT banners, manage + one-click-unsubscribe
 * footer), branded with and linking to the landing site the search was
 * saved on (website_id), falling back to the default website.
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

    private const MAX_LISTINGS_SHOWN = 6;

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
        $agent = EmailBranding::agentForWebsite($this->savedSearch->website);
        $searchName = $this->savedSearch->name ?? 'Your Saved Search';
        $shown = array_slice($this->listings, 0, self::MAX_LISTINGS_SHOWN);

        return (new MailMessage)
            ->subject("New Listings Match \"{$searchName}\" - {$this->totalCount} Properties Found")
            ->view('emails.listing-alert', [
                'siteName' => $branding['siteName'],
                'logoUrl' => $branding['logoUrl'],
                'agent' => $agent,
                'headline' => 'Handpicked listings just for you.',
                'introHtml' => $this->introHtml($branding['homeUrl'], $searchName),
                'sectionTitle' => 'New or Updated Properties',
                'cards' => array_map(
                    fn (array $listing) => ListingEmailCard::make($listing, $agent, $branding['homeUrl']),
                    $shown
                ),
                'buttonText' => $this->totalCount > count($shown)
                    ? "View all {$this->totalCount} matching listings"
                    : 'View all matching listings',
                'buttonUrl' => $this->getSearchUrl($branding['homeUrl']),
                'manageUrl' => $branding['homeUrl'] . '/dashboard',
                'unsubscribeUrl' => $this->unsubscribeUrl(),
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
     * The thank-you box: alert frequency + site link + the saved criteria.
     */
    protected function introHtml(string $homeUrl, string $searchName): string
    {
        $host = parse_url($homeUrl, PHP_URL_HOST) ?: $homeUrl;
        $frequency = ucfirst($this->getFrequencyText());
        $siteLink = '<a href="' . $homeUrl . '" style="color:#293056; text-decoration:underline; font-weight:600;">' . e($host) . '</a>';

        return "Thank you for registering for the {$frequency} Listings Alert at {$siteLink}. "
            . "I've put together the list below to help you find new listings based on your specific Real Estate needs. "
            . 'Feel free to contact me should you have any questions.'
            . '<br><span style="color:#6b7280; font-size:13px;">Your search: "' . e($searchName) . '" — ' . e($this->savedSearch->formatted_criteria) . '</span>';
    }

    /**
     * One-click signed unsubscribe link for this saved search. Null (link
     * omitted) if the URL can't be generated — never blocks the alert.
     */
    protected function unsubscribeUrl(): ?string
    {
        if (!$this->savedSearch->id) {
            return null;
        }

        try {
            return URL::signedRoute('alerts.saved-search.unsubscribe', ['savedSearch' => $this->savedSearch->id]);
        } catch (\Throwable $e) {
            return null;
        }
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
