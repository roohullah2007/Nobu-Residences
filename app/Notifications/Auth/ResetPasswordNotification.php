<?php

namespace App\Notifications\Auth;

use App\Support\EmailBranding;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Site-branded, minimal password reset email on the shared template
 * (emails/branded.blade.php): the requesting tenant site's name + logo, one
 * line of copy, the button, and the expiry note — never the stock Laravel
 * notification (verbose copy, app-name branding, raw fallback URL block).
 *
 * Extends the framework notification so token semantics stay stock. The
 * reset URL is built exactly like the parent's — url() on the current
 * request — so the link keeps the landing domain the user started on
 * (sent synchronously; no queue worker in production, same rationale as
 * VerifyEmailNotification).
 */
class ResetPasswordNotification extends ResetPassword
{
    use Queueable;

    public function toMail($notifiable): MailMessage
    {
        $branding = EmailBranding::current();
        $siteName = $branding['siteName'];
        $expireMinutes = (int) config('auth.passwords.' . config('auth.defaults.passwords') . '.expire', 60);
        $firstName = explode(' ', trim((string) $notifiable->name), 2)[0] ?: 'there';
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        return (new MailMessage)
            ->subject("Reset your password — {$siteName}")
            ->view('emails.branded', [
                'siteName' => $siteName,
                'logoUrl' => $branding['logoUrl'],
                'logoPath' => $branding['logoPath'],
                'title' => 'Reset your password',
                'paragraphs' => [
                    'Hi ' . e($firstName) . ', tap the button below to choose a new password for your ' . e($siteName) . ' account.',
                ],
                'buttonText' => 'Reset password',
                'buttonUrl' => $resetUrl,
                'footnote' => "This link expires in {$expireMinutes} minutes. If you didn't request a password reset, you can safely ignore this email.",
            ]);
    }
}
