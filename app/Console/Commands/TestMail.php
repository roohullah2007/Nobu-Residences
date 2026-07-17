<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

/**
 * One-shot mail pipeline diagnostic: prints the active mailer config, checks
 * the Resend sending-domain verification status, sends a test email through
 * the Resend API directly, then polls the message's delivery events —
 * surfacing bounces/suppressions that a plain "accepted" send hides.
 *
 * Usage: php artisan mail:test you@example.com
 */
class TestMail extends Command
{
    protected $signature = 'mail:test {to : Recipient email address}';

    protected $description = 'Print mail configuration, verify the Resend domain, send a test email, and report its delivery status';

    private const RESEND_API = 'https://api.resend.com';

    public function handle(): int
    {
        $to = (string) $this->argument('to');
        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid recipient email address.');
            return self::FAILURE;
        }

        $key = (string) config('services.resend.key', '');
        $from = (string) config('mail.from.address');

        $this->info('[1] Active configuration');
        $this->line('mail.default:      ' . config('mail.default'));
        $this->line('from address:      ' . $from);
        $this->line('from name:         ' . config('mail.from.name'));
        $this->line('RESEND_API_KEY:    ' . ($key === '' ? 'NOT SET' : 'set (' . substr($key, 0, 6) . '..., ' . strlen($key) . ' chars)'));

        if (config('mail.default') === 'log') {
            $this->warn('Mailer is "log" — emails are written to storage/logs, never delivered.');
        }
        if (str_contains($from, 'example.com')) {
            $this->warn('From address is a placeholder — Resend rejects unverified from-domains.');
        }

        if (config('mail.default') !== 'resend' || $key === '') {
            return $this->sendViaMailer($to);
        }

        $this->newLine();
        $this->info('[2] Resend domain verification');
        $fromDomain = strtolower(substr(strrchr($from, '@') ?: '', 1));
        $domains = Http::withToken($key)->acceptJson()->timeout(15)->get(self::RESEND_API . '/domains');
        if (!$domains->successful()) {
            $this->warn('Could not list domains: HTTP ' . $domains->status() . ' ' . $domains->body());
        } else {
            $found = false;
            foreach ($domains->json('data', []) as $d) {
                $marker = strtolower($d['name'] ?? '') === $fromDomain ? '  <-- from-domain' : '';
                $this->line(sprintf('%-30s status: %s%s', $d['name'] ?? '?', $d['status'] ?? '?', $marker));
                if (strtolower($d['name'] ?? '') === $fromDomain) {
                    $found = true;
                    if (($d['status'] ?? '') !== 'verified') {
                        $this->warn("From-domain {$fromDomain} is NOT verified — emails will not be delivered.");
                    }
                }
            }
            if (!$found) {
                $this->warn("From-domain {$fromDomain} is not registered in this Resend account.");
            }
        }

        $this->newLine();
        $this->info("[3] Sending test email to {$to} via Resend API ...");
        $send = Http::withToken($key)->acceptJson()->timeout(15)->post(self::RESEND_API . '/emails', [
            'from' => config('mail.from.name') . ' <' . $from . '>',
            'to' => [$to],
            'subject' => 'Mail pipeline test — ' . config('app.name'),
            'text' => 'Test email from ' . config('app.name') . ' sent at ' . now()->toDateTimeString() . '.',
        ]);
        if (!$send->successful()) {
            $this->error('Resend REJECTED the send: HTTP ' . $send->status() . ' ' . $send->body());
            return self::FAILURE;
        }
        $emailId = (string) $send->json('id');
        $this->line('Accepted, id: ' . $emailId);

        $this->newLine();
        $this->info('[4] Delivery status (polling up to 15s)');
        $lastEvent = '';
        foreach ([3, 4, 4, 4] as $wait) {
            sleep($wait);
            $status = Http::withToken($key)->acceptJson()->timeout(15)->get(self::RESEND_API . '/emails/' . $emailId);
            if (!$status->successful()) {
                $this->warn('Status lookup failed: HTTP ' . $status->status());
                break;
            }
            $lastEvent = (string) $status->json('last_event');
            $this->line('last_event: ' . ($lastEvent ?: '(none yet)'));
            if (in_array($lastEvent, ['delivered', 'bounced', 'complained', 'failed'], true)) {
                break;
            }
        }

        if ($lastEvent === 'delivered') {
            $this->info('Delivered by Resend — if not in the inbox, check the spam/promotions folder.');
        } elseif (in_array($lastEvent, ['bounced', 'complained', 'failed'], true)) {
            $this->error("Resend reports \"{$lastEvent}\" — open this email in the Resend dashboard for the reason");
            $this->line('(resend.com > Emails > id ' . $emailId . '). Bounces usually mean DNS (DKIM/SPF/Return-Path)');
            $this->line('records incomplete for the from-domain, or the recipient address is suppressed.');
        } else {
            $this->warn('Still "' . ($lastEvent ?: 'queued') . '" after 15s — check resend.com > Emails > id ' . $emailId . ' for the final status.');
        }

        return self::SUCCESS;
    }

    /**
     * Non-Resend fallback: send through the framework mailer and surface the
     * transport's exact error.
     */
    private function sendViaMailer(string $to): int
    {
        $this->newLine();
        $this->info("[2] Sending test email to {$to} via the '" . config('mail.default') . "' mailer ...");
        try {
            Mail::raw(
                'Test email from ' . config('app.name') . ' sent at ' . now()->toDateTimeString() . '.',
                fn ($message) => $message->to($to)->subject('Mail pipeline test — ' . config('app.name'))
            );
            $this->info('Mailer accepted the message without error.');
            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Send FAILED: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
