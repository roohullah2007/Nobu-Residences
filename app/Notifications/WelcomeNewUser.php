<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Registration-confirmation ("welcome") email to the new registrant.
 * Fired from both registration paths (email form + Google OAuth) —
 * counterpart to NewUserRegistered, which goes to the admins.
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
        $siteName = $this->websiteName ?: $this->siteName();
        $firstName = explode(' ', trim((string) $notifiable->name), 2)[0] ?: 'there';

        return (new MailMessage)
            ->subject("Welcome to {$siteName} — your registration is confirmed")
            ->greeting("Hi {$firstName},")
            ->line("Thanks for registering with {$siteName} — your account has been created successfully.")
            ->line('You can now save your favourite listings, set up search alerts to be notified the moment matching properties hit the market, and request private tours.')
            ->action('Go to your dashboard', url('/dashboard'))
            ->line('If you did not create this account, please ignore this email or contact us.')
            ->salutation("— The {$siteName} team");
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

    private function siteName(): string
    {
        try {
            return \App\Models\Website::where('is_default', true)->value('name')
                ?? config('app.name');
        } catch (\Throwable $e) {
            return config('app.name');
        }
    }
}
