<?php

namespace App\Notifications;

use App\Models\User;
use App\Support\EmailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Registration-confirmation ("welcome") email to the new registrant, on the
 * shared site-branded template (emails/branded.blade.php). Fired from both
 * registration paths (email form + Google OAuth) — counterpart to
 * NewUserRegistered, which goes to the admins.
 *
 * Sent SYNCHRONOUSLY on purpose (no ShouldQueue): QUEUE_CONNECTION=database
 * and production runs no queue worker — same rationale as
 * SavedSearchAlertNotification. Dispatch is guarded inside send() so a
 * mail failure can never break registration.
 */
class WelcomeNewUser extends Notification
{
    use Queueable;

    public function __construct(
        protected string $host,
        protected ?string $websiteName = null,
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
        $firstName = explode(' ', trim((string) $notifiable->name), 2)[0] ?: 'there';

        return (new MailMessage)
            ->from(config('mail.from.address'), $siteName)
            ->subject("Welcome to {$siteName} — your registration is confirmed")
            ->view('emails.branded', [
                'siteName' => $siteName,
                'logoUrl' => $branding['logoUrl'],
                'logoPath' => $branding['logoPath'],
                'title' => "Welcome to {$siteName}",
                'paragraphs' => [
                    'Hi ' . e($firstName) . ', thanks for registering with ' . e($siteName) . ' — your account has been created successfully.',
                    'You can now save your favourite listings, set up search alerts to be notified the moment matching properties hit the market, and request private tours.',
                ],
                'buttonText' => 'Go to your dashboard',
                'buttonUrl' => url('/dashboard'),
                'footnote' => 'If you did not create this account, please ignore this email or contact us.',
            ]);
    }

    /**
     * Notify the registrant, guarded so a mail failure never breaks signup —
     * same contract as NewUserRegistered::notifyAdmins().
     */
    public static function send(User $user, string $host, ?string $websiteName = null): void
    {
        try {
            $user->notify(new self($host, $websiteName));
        } catch (\Throwable $e) {
            \Log::warning('Welcome email failed for new registrant', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
