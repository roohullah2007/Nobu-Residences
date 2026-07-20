<?php

namespace App\Notifications;

use App\Models\Website;
use App\Support\EmailBranding;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * "Your favourited listing changed" email (price change / sold / leased /
 * delisted), on the shared site-branded template (emails/branded.blade.php).
 * One email per user bundles every changed favourite; branded with the
 * landing site the favourites were saved on.
 *
 * Sent synchronously (no ShouldQueue) on purpose: updates go out from the
 * scheduled alerts:send-favourite-updates command, and the production
 * server runs no queue worker — same rationale as
 * SavedSearchAlertNotification.
 */
class FavouriteListingUpdateNotification extends Notification
{
    /**
     * @param array $updates Listing cards for the branded template, each with
     *                       a 'note' describing what changed.
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
        $siteName = $branding['siteName'];
        $firstName = explode(' ', trim((string) $notifiable->name), 2)[0] ?: 'there';
        $count = count($this->updates);
        $listingWord = $count === 1 ? 'listing' : 'listings';

        return (new MailMessage)
            ->subject("Updates on your favourite {$listingWord} — {$siteName}")
            ->view('emails.branded', [
                'siteName' => $siteName,
                'logoUrl' => $branding['logoUrl'],
                'title' => "Your favourite {$listingWord} changed",
                'paragraphs' => [
                    'Hi ' . e($firstName) . ", there " . ($count === 1 ? 'is an update' : "are updates") . " on {$count} {$listingWord} you saved to your favourites.",
                ],
                'listings' => $this->updates,
                'buttonText' => 'View your favourites',
                'buttonUrl' => $branding['homeUrl'] . '/dashboard',
                'footnote' => "You're receiving this email because you favourited " . ($count === 1 ? 'this listing' : 'these listings') . " on {$siteName}. You can manage your favourites from your dashboard.",
            ]);
    }
}
