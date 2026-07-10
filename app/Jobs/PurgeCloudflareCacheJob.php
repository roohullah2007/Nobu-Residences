<?php

namespace App\Jobs;

use App\Services\CloudflareService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Purges Cloudflare's edge cache for a customer domain after content or
 * settings change, so published edits show on the live site in real time.
 * Dispatched from the Website / WebsitePage model hooks with
 * dispatchAfterResponse() — it runs right after the admin's request finishes
 * and does not depend on a queue worker being up.
 */
class PurgeCloudflareCacheJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 30;

    public function __construct(public string $domain)
    {
    }

    public function backoff(): array
    {
        return [5, 15];
    }

    public function handle(CloudflareService $cloudflare): void
    {
        if (!$cloudflare->isConfigured()) {
            return;
        }

        $cloudflare->purgeDomainCache($this->domain);
    }
}
