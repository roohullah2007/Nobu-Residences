<?php

namespace App\Jobs;

use App\Models\Website;
use App\Services\PloiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RequestPloiSslJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Total attempts including the initial run. */
    public int $tries = 5;

    /** Discard after 15 minutes regardless of retries. */
    public int $timeout = 60;

    public function __construct(public int $websiteId)
    {
    }

    /**
     * Escalating backoff between retries (seconds): 30s, 1m, 2m, 5m, 10m.
     * Gives DNS + Ploi enough time to settle if the cert wasn't ready.
     */
    public function backoff(): array
    {
        return [30, 60, 120, 300, 600];
    }

    public function handle(PloiService $ploi): void
    {
        $website = Website::find($this->websiteId);
        if (!$website || empty($website->domain)) {
            Log::info('RequestPloiSslJob: website missing or no domain', ['id' => $this->websiteId]);
            return;
        }

        if (!$ploi->isConfigured()) {
            $website->update([
                'ploi_ssl_status' => 'failed',
                'ploi_last_error' => 'Ploi not configured on server.',
            ]);
            return;
        }

        // Don't even attempt issuance while the domain's DNS doesn't point at
        // this server — Let's Encrypt would fail anyway and burn rate-limit
        // budget. Park the website in waiting_dns; the ploi:watch-dns
        // scheduler picks it up automatically once DNS starts pointing.
        if ($ploi->domainPointsToServer($website->domain) === false) {
            $website->update([
                'ploi_ssl_status' => 'waiting_dns',
                'ploi_last_error' => "Waiting for DNS: \"{$website->domain}\" does not point to the server yet. "
                    . 'SSL will be requested automatically once the A record points here (checked every 5 minutes).',
            ]);
            $this->delete();
            return;
        }

        // If the cert is already issued for this domain, mark issued and stop.
        $certs = $ploi->listCertificates();
        foreach ($certs as $c) {
            foreach (($c['domains'] ?? []) as $d) {
                if (strcasecmp($d, $website->domain) === 0) {
                    $website->update([
                        'ploi_ssl_status' => 'issued',
                        'ploi_ssl_issued_at' => now(),
                        'ploi_last_error' => null,
                    ]);
                    return;
                }
            }
        }

        [$ok, $message] = $ploi->requestSsl($website->domain);

        if ($ok) {
            $website->update([
                'ploi_ssl_status' => 'issued',
                'ploi_ssl_issued_at' => now(),
                'ploi_last_error' => null,
            ]);
            return;
        }

        // DNS-mismatch failures (Let's Encrypt can't reach the origin because
        // the A record points somewhere else — usually Cloudflare proxy IPs)
        // won't resolve on their own within this job's retry window. Park in
        // waiting_dns instead of failed: the ploi:watch-dns scheduler retries
        // automatically once the domain points here — no manual Retry needed.
        if (PloiService::isDnsMismatchMessage($message)) {
            $website->update([
                'ploi_ssl_status' => 'waiting_dns',
                'ploi_last_error' => $message . ' SSL will be requested automatically once DNS points to the server (checked every 5 minutes).',
            ]);
            $this->delete();
            return;
        }

        // Throw so Laravel queue retries with backoff
        $website->update([
            'ploi_ssl_status' => 'queued',
            'ploi_last_error' => $message,
        ]);
        throw new \RuntimeException($message);
    }

    /**
     * Final failure — all retries exhausted.
     */
    public function failed(\Throwable $exception): void
    {
        if ($website = Website::find($this->websiteId)) {
            $website->update([
                'ploi_ssl_status' => 'failed',
                'ploi_last_error' => $exception->getMessage(),
            ]);
        }
        Log::error('RequestPloiSslJob exhausted retries', [
            'website_id' => $this->websiteId,
            'error' => $exception->getMessage(),
        ]);
    }
}
