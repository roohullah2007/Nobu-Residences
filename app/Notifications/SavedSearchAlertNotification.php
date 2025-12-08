<?php

namespace App\Notifications;

use App\Models\SavedSearch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SavedSearchAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected SavedSearch $savedSearch;
    protected array $listings;
    protected int $totalCount;

    /**
     * Create a new notification instance.
     *
     * @param SavedSearch $savedSearch
     * @param array $listings
     * @param int $totalCount
     */
    public function __construct(SavedSearch $savedSearch, array $listings, int $totalCount)
    {
        $this->savedSearch = $savedSearch;
        $this->listings = $listings;
        $this->totalCount = $totalCount;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param mixed $notifiable
     * @return MailMessage
     */
    public function toMail($notifiable): MailMessage
    {
        $searchName = $this->savedSearch->name ?? 'Your Saved Search';
        $criteria = $this->savedSearch->formatted_criteria;
        $frequency = $this->getFrequencyText();

        $mail = (new MailMessage)
            ->subject("New Listings Match \"{$searchName}\" - {$this->totalCount} Properties Found")
            ->greeting("Hi {$notifiable->name}!")
            ->line("Great news! We found **{$this->totalCount} new " . ($this->totalCount === 1 ? 'listing' : 'listings') . "** matching your saved search.")
            ->line("**Search:** {$searchName}")
            ->line("**Criteria:** {$criteria}");

        // Add property listings
        if (!empty($this->listings)) {
            $mail->line('---');
            $mail->line('**Here are your new listings:**');

            foreach (array_slice($this->listings, 0, 5) as $listing) {
                $propertyLine = "**{$listing['formatted_price']}** - {$listing['address']}, {$listing['city']}";
                if ($listing['bedrooms'] || $listing['bathrooms']) {
                    $propertyLine .= " ({$listing['bedrooms']} bed, {$listing['bathrooms']} bath)";
                }
                $mail->line($propertyLine);
            }

            if (count($this->listings) > 5) {
                $remaining = count($this->listings) - 5;
                $mail->line("*...and {$remaining} more " . ($remaining === 1 ? 'listing' : 'listings') . "*");
            }
        }

        $mail->line('---');

        // Action button to view all results
        $searchUrl = $this->getSearchUrl();
        $mail->action('View All Listings', $searchUrl);

        $mail->line("You're receiving this email because you have a {$frequency} alert set up for \"{$searchName}\".");
        $mail->line('You can manage your alerts from your dashboard.');

        return $mail;
    }

    /**
     * Get the array representation of the notification (for database storage).
     *
     * @param mixed $notifiable
     * @return array
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
            }, array_slice($this->listings, 0, 5)),
            'sent_at' => now()->toDateTimeString(),
        ];
    }

    /**
     * Get human-readable frequency text
     *
     * @return string
     */
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
     * Generate URL to view search results
     *
     * @return string
     */
    protected function getSearchUrl(): string
    {
        $params = $this->savedSearch->search_params ?? [];
        $queryString = http_build_query(['search' => $params]);

        return config('app.url') . '/search?' . $queryString;
    }
}
