<?php

namespace App\Notifications;

use App\Models\Website;
use App\Support\EmailBranding;
use App\Support\ListingEmailCard;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * "Your favourited listing changed" email (price change / sold / leased /
 * delisted) on the listing-alert template (emails/listing-alert.blade.php —
 * agent header, context box, property cards with change notes, manage
 * footer). One email per user bundles every changed favourite; branded with
 * the landing site the favourites were saved on.
 *
 * Sent synchronously (no ShouldQueue) on purpose: updates go out from the
 * scheduled alerts:send-favourite-updates command, and the production
 * server runs no queue worker — same rationale as
 * SavedSearchAlertNotification.
 */
class FavouriteListingUpdateNotification extends Notification
{
    /**
     * @param array $updates Formatted listings (FavouriteUpdateAlertService
     *                       shape), each with a 'note' describing the change.
     */
    public function __construct(
        protected array $updates,
        protected ?Website $website = null,
    ) {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $branding = EmailBranding::forWebsite($this->website);
        $agent = EmailBranding::agentForWebsite($this->website);
        $siteName = $branding['siteName'];
        $count = count($this->updates);
        $listingWord = $count === 1 ? 'listing' : 'listings';

        return (new MailMessage)
            ->subject("Updates on your favourite {$listingWord} — {$siteName}")
            ->view('emails.listing-alert', [
                'siteName' => $siteName,
                'logoUrl' => $branding['logoUrl'],
                'agent' => $agent,
                'headline' => 'Updates on your favourite listings.',
                'introHtml' => $this->introHtml($notifiable, $branding['homeUrl'], $count, $listingWord),
                'sectionTitle' => 'Updated Properties',
                'cards' => array_map(
                    fn (array $listing) => ListingEmailCard::make($listing, $agent, $branding['homeUrl']),
                    $this->updates
                ),
                'buttonText' => 'View your favourites',
                'buttonUrl' => $branding['homeUrl'] . '/dashboard',
                'manageUrl' => $branding['homeUrl'] . '/dashboard',
                'unsubscribeUrl' => null,
            ]);
    }

    protected function introHtml(object $notifiable, string $homeUrl, int $count, string $listingWord): string
    {
        $firstName = explode(' ', trim((string) $notifiable->name), 2)[0] ?: 'there';
        $host = parse_url($homeUrl, PHP_URL_HOST) ?: $homeUrl;
        $siteLink = '<a href="' . $homeUrl . '" style="color:#293056; text-decoration:underline; font-weight:600;">' . e($host) . '</a>';

        return 'Hi ' . e($firstName) . ", here's what changed on {$count} {$listingWord} you favourited at {$siteLink}. "
            . 'Each card shows the update below its details. Feel free to contact me should you have any questions.';
    }
}
