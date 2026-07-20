<?php

namespace App\Notifications;

use App\Models\EmailTemplate;
use App\Models\Website;
use App\Support\EmailBranding;
use App\Support\EmailMergeTags;
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

        $template = EmailTemplate::resolve('favourite_update', $this->website?->id);
        $values = $this->mergeValues($notifiable, $branding, $agent);
        $rawValues = ['site_link' => $this->siteLinkHtml($branding['homeUrl'])];

        return (new MailMessage)
            ->from(config('mail.from.address'), $branding['siteName'])
            ->subject(EmailMergeTags::apply($template['subject'], $values))
            ->view('emails.listing-alert', [
                'siteName' => $branding['siteName'],
                'logoUrl' => $branding['logoUrl'],
                'logoPath' => $branding['logoPath'],
                'agent' => $agent,
                'headline' => EmailMergeTags::apply($template['headline'], $values),
                'introHtml' => EmailMergeTags::applyHtml($template['intro'], $values, $rawValues),
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

    /**
     * The per-recipient values every %merge_tag% in the admin-edited
     * template resolves to.
     */
    protected function mergeValues(object $notifiable, array $branding, array $agent): array
    {
        $nameParts = explode(' ', trim((string) $notifiable->name), 2);

        return [
            'first_name' => $nameParts[0] ?: 'there',
            'last_name' => $nameParts[1] ?? '',
            'full_name' => trim((string) $notifiable->name),
            'site_name' => $branding['siteName'],
            'site_domain' => parse_url($branding['homeUrl'], PHP_URL_HOST) ?: $branding['homeUrl'],
            'listing_count' => count($this->updates),
            'agent_name' => $agent['name'],
            'agent_phone' => $agent['phone'],
            'agent_email' => $agent['email'],
        ];
    }

    protected function siteLinkHtml(string $homeUrl): string
    {
        $host = parse_url($homeUrl, PHP_URL_HOST) ?: $homeUrl;

        return '<a href="' . $homeUrl . '" style="color:#293056; text-decoration:underline; font-weight:600;">' . e($host) . '</a>';
    }
}
