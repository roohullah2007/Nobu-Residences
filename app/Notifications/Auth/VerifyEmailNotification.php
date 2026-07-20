<?php

namespace App\Notifications\Auth;

use App\Support\EmailBranding;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Site-branded email verification on the shared minimal template
 * (emails/branded.blade.php) — never the stock Laravel markdown layout.
 * Extends the framework notification so the signed verification URL /
 * throttling behaviour stays stock.
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
        $branding = EmailBranding::current();
        $siteName = $branding['siteName'];

        return (new MailMessage)
            ->subject("Verify your email address — {$siteName}")
            ->view('emails.branded', [
                'siteName' => $siteName,
                'logoUrl' => $branding['logoUrl'],
                'logoPath' => $branding['logoPath'],
                'title' => "Welcome to {$siteName}",
                'paragraphs' => [
                    'Thanks for creating an account. Please confirm your email address so we can keep you updated on new listings and your saved searches.',
                ],
                'buttonText' => 'Verify email address',
                'buttonUrl' => $this->verificationUrl($notifiable),
                'footnote' => 'If you did not create an account, no further action is required.',
            ]);
    }
}
