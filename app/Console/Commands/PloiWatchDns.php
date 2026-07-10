<?php

namespace App\Console\Commands;

use App\Models\Website;
use App\Services\PloiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class PloiWatchDns extends Command
{
    protected $signature = 'ploi:watch-dns';

    protected $description = 'Auto-provision websites whose SSL is waiting on DNS: once the domain points at the server, add the alias and request the certificate';

    /**
     * Statuses that mean "domain saved but provisioning not completed".
     * waiting_dns  -> a previous attempt found DNS not pointing here.
     * pending      -> domain saved/changed, Connect not run (or alias step pending).
     */
    protected const WATCH_STATUSES = ['waiting_dns', 'pending'];

    public function handle(PloiService $ploi): int
    {
        if (!$ploi->isConfigured()) {
            $this->info('Ploi not configured — nothing to watch.');
            return self::SUCCESS;
        }

        $websites = Website::whereNotNull('domain')
            ->where('is_active', true)
            ->whereIn('ploi_ssl_status', self::WATCH_STATUSES)
            ->get();

        if ($websites->isEmpty()) {
            $this->info('No websites waiting on DNS.');
            return self::SUCCESS;
        }

        foreach ($websites as $website) {
            $points = $ploi->domainPointsToServer($website->domain);

            if ($points === null) {
                $this->warn("{$website->domain}: server IP unknown — cannot check DNS.");
                continue;
            }

            if ($points === false) {
                $this->line("{$website->domain}: still not pointing at the server — waiting.");
                if ($website->ploi_ssl_status !== 'waiting_dns') {
                    $website->update(['ploi_ssl_status' => 'waiting_dns']);
                }
                continue;
            }

            $this->info("{$website->domain}: DNS now points at the server — provisioning.");

            // 1. Alias (idempotent: skips when it already exists, dedupes first).
            [$aliasOk, $aliasMsg] = $ploi->addAlias($website->domain);
            $website->update([
                'ploi_alias_status' => $aliasOk ? 'added' : 'failed',
                'ploi_alias_added_at' => $website->ploi_alias_added_at ?: ($aliasOk ? now() : null),
                'ploi_last_error' => $aliasOk ? null : $aliasMsg,
            ]);
            if (!$aliasOk) {
                $this->error("{$website->domain}: alias failed — {$aliasMsg}");
                continue;
            }

            // 2. Certificate (idempotent: returns early when already covered).
            [$sslOk, $sslMsg] = $ploi->requestSsl($website->domain);

            if ($sslOk) {
                $website->update([
                    'ploi_ssl_status' => 'issued',
                    'ploi_ssl_issued_at' => now(),
                    'ploi_last_error' => null,
                ]);
                $this->info("{$website->domain}: SSL issued. {$sslMsg}");
            } elseif (PloiService::isDnsMismatchMessage($sslMsg)) {
                // DNS flapped between our check and Let's Encrypt's — keep waiting.
                $website->update([
                    'ploi_ssl_status' => 'waiting_dns',
                    'ploi_last_error' => $sslMsg,
                ]);
                $this->warn("{$website->domain}: DNS not stable yet — still waiting. {$sslMsg}");
            } else {
                $website->update([
                    'ploi_ssl_status' => 'failed',
                    'ploi_last_error' => $sslMsg,
                ]);
                $this->error("{$website->domain}: SSL failed — {$sslMsg}");
            }

            Log::info('ploi:watch-dns processed website', [
                'website_id' => $website->id,
                'domain' => $website->domain,
                'alias_ok' => $aliasOk,
                'ssl_ok' => $sslOk ?? null,
            ]);
        }

        return self::SUCCESS;
    }
}
