<?php

namespace App\Notifications\Auth;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Site-branded, minimal password reset email. Replaces the stock Laravel
 * notification (verbose copy, app-name branding, raw fallback URL block)
 * with a dedicated clean template: the requesting tenant site's name, one
 * line of copy, the button, and the expiry note.
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
        $siteName = $this->siteName();
        $expireMinutes = (int) config('auth.passwords.' . config('auth.defaults.passwords') . '.expire', 60);
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        return (new MailMessage)
            ->subject("Reset your password — {$siteName}")
            ->view('emails.password-reset', [
                'siteName' => $siteName,
                'resetUrl' => $resetUrl,
                'expireMinutes' => $expireMinutes,
                'firstName' => explode(' ', trim((string) $notifiable->name), 2)[0] ?: 'there',
            ]);
    }

    /**
     * The site the user requested the reset from (reset emails are sent
     * synchronously, so the tenant request is still current). Falls back to
     * the default website, then the app name — same chain as
     * VerifyEmailNotification.
     */
    private function siteName(): string
    {
        try {
            $website = app(\App\Services\Tenancy\TenantResolver::class)->resolve(request());

            return $website?->name
                ?? \App\Models\Website::where('is_default', true)->value('name')
                ?? config('app.name');
        } catch (\Throwable $e) {
            return config('app.name');
        }
    }
}
