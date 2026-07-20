<?php

namespace App\Notifications;

use App\Models\User;
use App\Support\EmailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * "New user registered" email to the site admins, on the shared site-branded
 * template (emails/branded.blade.php). Fired from both registration paths
 * (email form + Google OAuth).
 *
 * Sent SYNCHRONOUSLY on purpose (no ShouldQueue): QUEUE_CONNECTION=database
 * and production runs no queue worker — same rationale as
 * SavedSearchAlertNotification. Callers wrap dispatch in try/catch so a
 * mail failure can never break registration.
 */
class NewUserRegistered extends Notification
{
    use Queueable;

    public function __construct(
        protected User $newUser,
        protected string $host,
        protected ?string $websiteName = null,
        protected string $source = 'email registration',
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $branding = EmailBranding::current();
        $siteName = $this->websiteName ?: $branding['siteName'];
        $site = $this->websiteName ? "{$this->websiteName} ({$this->host})" : $this->host;

        $rows = array_filter([
            'Name' => $this->newUser->name,
            'Email' => $this->newUser->email,
            'Phone' => $this->newUser->phone ?: null,
            'Website' => $site,
            'Signed up via' => $this->source,
            'Time' => now()->format('Y-m-d H:i (T)'),
        ]);

        return (new MailMessage)
            ->subject('New user registered — ' . ($this->websiteName ?: $this->host))
            ->view('emails.branded', [
                'siteName' => $siteName,
                'logoUrl' => $branding['logoUrl'],
                'logoPath' => $branding['logoPath'],
                'title' => 'New user registration',
                'paragraphs' => ['A new user just signed up.'],
                'rows' => $rows,
                'buttonText' => 'View users',
                'buttonUrl' => url('/admin/users'),
                'footnote' => 'This is an automated notification.',
            ]);
    }

    /**
     * Notify every admin about a new registration. Static helper so both
     * registration controllers share the exact same guarded behaviour.
     */
    public static function notifyAdmins(User $newUser, string $host, ?string $websiteName = null, string $source = 'email registration'): void
    {
        try {
            $admins = User::where('role', 'admin')
                ->where('id', '!=', $newUser->id)
                ->whereNotNull('email')
                ->get();

            foreach ($admins as $admin) {
                try {
                    $admin->notify(new self($newUser, $host, $websiteName, $source));
                } catch (\Throwable $e) {
                    \Log::warning('New-user admin notification failed for one admin', [
                        'admin_id' => $admin->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        } catch (\Throwable $e) {
            \Log::warning('New-user admin notification skipped', ['error' => $e->getMessage()]);
        }
    }
}
