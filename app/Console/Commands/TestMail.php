<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * One-shot mail pipeline diagnostic: prints the active mailer config (which
 * mailer, from address, Resend key presence) and sends a plain test email,
 * surfacing the transport's exact error instead of a silent "sent".
 *
 * Usage: php artisan mail:test you@example.com
 */
class TestMail extends Command
{
    protected $signature = 'mail:test {to : Recipient email address}';

    protected $description = 'Print the active mail configuration and send a test email';

    public function handle(): int
    {
        $to = (string) $this->argument('to');
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid recipient email address.');
            return self::FAILURE;
        }

        $key = (string) config('services.resend.key', '');

        $this->info('[1] Active configuration');
        $this->line('mail.default:      ' . config('mail.default'));
        $this->line('from address:      ' . config('mail.from.address'));
        $this->line('from name:         ' . config('mail.from.name'));
        $this->line('RESEND_API_KEY:    ' . ($key === '' ? 'NOT SET' : 'set (' . substr($key, 0, 6) . '..., ' . strlen($key) . ' chars)'));

        if (config('mail.default') === 'log') {
            $this->warn('Mailer is "log" — emails are written to storage/logs, never delivered.');
        }
        if (str_contains((string) config('mail.from.address'), 'example.com')) {
            $this->warn('From address is a placeholder — Resend rejects unverified from-domains.');
        }

        $this->newLine();
        $this->info("[2] Sending test email to {$to} ...");
        try {
            Mail::raw(
                'Test email from ' . config('app.name') . ' sent at ' . now()->toDateTimeString() . '.',
                fn ($message) => $message->to($to)->subject('Mail pipeline test — ' . config('app.name'))
            );
            $this->info('Mailer accepted the message without error.');
            $this->line('If it does not arrive: check the Resend dashboard (resend.com > Emails)');
            $this->line('for delivered/bounced/suppressed status, and the recipient spam folder.');
            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Send FAILED: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
