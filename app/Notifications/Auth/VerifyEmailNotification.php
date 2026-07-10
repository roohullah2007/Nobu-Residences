<?php

namespace App\Notifications\Auth;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Site-branded email verification. Extends the framework notification so the
 * signed verification URL / throttling behaviour stays stock — only the copy
 * changes. Provider-agnostic: goes through the mail channel and the default
 * mailer (Resend when its key is configured).
 *
 * Sent SYNCHRONOUSLY on purpose (no ShouldQueue): QUEUE_CONNECTION=database
 * and production runs no queue worker, so a queued notification would sit in
 * the jobs table forever — same rationale as SavedSearchAlertNotification.
 */
class VerifyEmailNotification extends VerifyEmail
{
    use Queueable;

    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);
        $siteName = $this->siteName();

        return (new MailMessage)
            ->subject("Verify your email address — {$siteName}")
            ->greeting("Welcome to {$siteName}!")
            ->line('Thanks for creating an account. Please confirm your email address so we can keep you updated on new listings and your saved searches.')
            ->action('Verify Email Address', $verificationUrl)
            ->line('If you did not create an account, no further action is required.')
            ->salutation("— The {$siteName} team");
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
