<?php

namespace App\Jobs;

use App\Models\Website;
use App\Services\CloudflareService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Polls Cloudflare until the website's Custom Hostname (and its SSL) is
 * active, then marks the website live. Retries with growing backoff; if the
 * customer hasn't created their CNAME within the retry window, the website
 * stays in pending_dns and the scheduled cloudflare:sync-hostnames command
 * keeps checking every 5 minutes — no manual retry ever needed.
 */
class SyncCustomHostnameStatusJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 8;

    public int $timeout = 30;

    public function __construct(public int $websiteId)
    {
    }

    /**
     * 30s, 1m, 2m, 5m, 5m, 10m, 10m between attempts — most customers create
     * the CNAME within minutes; the scheduler covers the long tail.
     */
    public function backoff(): array
    {
        return [30, 60, 120, 300, 300, 600, 600];
    }

    public function handle(CloudflareService $cloudflare): void
    {
        $website = Website::find($this->websiteId);
        if (!$website || empty($website->domain)) {
            return;
        }

        if (!$cloudflare->isConfigured()) {
            $website->update([
                'cloudflare_status' => 'failed',
                'cloudflare_last_error' => 'Cloudflare is not configured on the server.',
            ]);
            return;
        }

        // Zone-managed domains: track when the customer's nameservers land
        // so the status page can show real progress. The custom hostname
        // check below is what actually flips the site live.
        if ($website->cloudflare_zone_id && $website->cloudflare_zone_status !== 'active') {
            $zone = $cloudflare->getZone($website->cloudflare_zone_id);
            if ($zone) {
                $website->update([
                    'cloudflare_zone_status' => $zone['status'],
                    'cloudflare_name_servers' => $zone['name_servers'] ?: $website->cloudflare_name_servers,
                ]);
            }
        }

        $hostname = $website->cloudflare_hostname_id
            ? $cloudflare->getCustomHostname($website->cloudflare_hostname_id)
            : $cloudflare->findCustomHostname($website->domain);

        if (!$hostname) {
            $website->update([
                'cloudflare_status' => 'failed',
                'cloudflare_last_error' => 'Custom hostname not found on Cloudflare. Re-save the domain to re-register it.',
            ]);
            $this->delete();
            return;
        }

        $website->update([
            'cloudflare_hostname_id' => $hostname['id'] ?: $website->cloudflare_hostname_id,
            'cloudflare_status' => $hostname['status'] === 'active' && $hostname['ssl_status'] === 'active'
                ? 'active'
                : 'pending_dns',
            'cloudflare_ssl_status' => $hostname['ssl_status'],
            'cloudflare_last_error' => !empty($hostname['ssl_validation_errors'])
                ? implode(' | ', $hostname['ssl_validation_errors'])
                : null,
            'cloudflare_active_at' => $hostname['status'] === 'active' && $hostname['ssl_status'] === 'active'
                ? ($website->cloudflare_active_at ?: now())
                : $website->cloudflare_active_at,
        ]);

        if ($website->cloudflare_status === 'active') {
            Log::info('Custom hostname active', ['website_id' => $website->id, 'domain' => $website->domain]);
            return;
        }

        // Still pending: retry with backoff. Once attempts are exhausted the
        // scheduled sync command takes over — failed() below keeps the row in
        // pending_dns rather than failing it.
        $this->release($this->backoff()[min($this->attempts() - 1, count($this->backoff()) - 1)]);
    }

    public function failed(\Throwable $exception): void
    {
        // Exhausting retries is EXPECTED when the customer is slow to create
        // their CNAME — leave the website pending; the scheduler continues.
        Log::info('SyncCustomHostnameStatusJob handed off to scheduler', [
            'website_id' => $this->websiteId,
            'reason' => $exception->getMessage(),
        ]);
    }
}
