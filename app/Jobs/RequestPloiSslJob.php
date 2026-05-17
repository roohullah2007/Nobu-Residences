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
        // are not going to resolve on their own. Retrying every minute just
        // burns the Let's Encrypt rate-limit budget, so stop here and let the
        // user fix DNS before clicking Retry SSL again.
        if ($this->isDnsMismatch($message)) {
            $website->update([
                'ploi_ssl_status' => 'failed',
                'ploi_last_error' => $message,
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
     * Detect the Ploi/Let's Encrypt "domain does not resolve to this server"
     * error so we can stop retrying. The message comes back HTML-escaped from
     * Ploi, so match on phrases that are stable across renderings.
     */
    protected function isDnsMismatch(string $message): bool
    {
        $needles = [
            'unable to match one of these domains',
            'point your domain DNS to your server',
            'should resolve to',
        ];
        foreach ($needles as $n) {
            if (stripos($message, $n) !== false) {
                return true;
            }
        }
        return false;
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
