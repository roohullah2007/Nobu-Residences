<?php

namespace App\Console\Commands;

use App\Models\Website;
use App\Services\CloudflareService;
use App\Services\HealthCheckService;
use Illuminate\Console\Command;

class CloudflareSyncHostnames extends Command
{
    protected $signature = 'cloudflare:sync-hostnames';

    protected $description = 'Sync every pending custom hostname with Cloudflare: activate websites whose CNAME + SSL went live, surface validation errors';

    public function handle(CloudflareService $cloudflare): int
    {
        if (!$cloudflare->isConfigured()) {
            $this->info('Cloudflare not configured — nothing to sync.');
            return self::SUCCESS;
        }

        $pending = Website::whereNotNull('domain')
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('cloudflare_status')
                    ->orWhere('cloudflare_status', '!=', 'active');
            })
            ->get();

        if ($pending->isEmpty()) {
            $this->info('All custom hostnames are active.');
            return self::SUCCESS;
        }

        foreach ($pending as $website) {
            // Zone-managed domains: provisionZone is idempotent, so this
            // heals everything the create-time call may have missed (zone
            // deleted by Cloudflare after long NS inaction, record create
            // that hit a transient API error) and refreshes the zone status.
            if ($cloudflare->zoneProvisioningEnabled()) {
                [, $zoneMessage, $zone] = $cloudflare->provisionZone($website->domain);
                if ($zone) {
                    $website->update([
                        'cloudflare_zone_id' => $zone['id'],
                        'cloudflare_zone_status' => $zone['status'],
                        'cloudflare_name_servers' => $zone['name_servers'] ?: $website->cloudflare_name_servers,
                    ]);
                } else {
                    $this->warn("{$website->domain}: zone — {$zoneMessage}");
                }
            }

            $hostname = $website->cloudflare_hostname_id
                ? $cloudflare->getCustomHostname($website->cloudflare_hostname_id)
                : $cloudflare->findCustomHostname($website->domain);

            if (!$hostname) {
                // Not registered yet (e.g. Cloudflare was down at create time)
                // — register it now.
                [$ok, $message, $hostname] = $cloudflare->createCustomHostname($website->domain);
                if (!$ok) {
                    $website->update([
                        'cloudflare_status' => 'failed',
                        'cloudflare_last_error' => $message,
                    ]);
                    $this->error("{$website->domain}: {$message}");
                    continue;
                }
            }

            $isActive = ($hostname['status'] ?? null) === 'active'
                && ($hostname['ssl_status'] ?? null) === 'active';

            $website->update([
                'cloudflare_hostname_id' => $hostname['id'] ?: $website->cloudflare_hostname_id,
                'cloudflare_status' => $isActive ? 'active' : 'pending_dns',
                'cloudflare_ssl_status' => $hostname['ssl_status'] ?? null,
                'cloudflare_last_error' => !empty($hostname['ssl_validation_errors'])
                    ? implode(' | ', $hostname['ssl_validation_errors'])
                    : null,
                'cloudflare_active_at' => $isActive ? ($website->cloudflare_active_at ?: now()) : $website->cloudflare_active_at,
            ]);

            $this->line(sprintf(
                '%s: status=%s ssl=%s%s',
                $website->domain,
                $hostname['status'] ?? '?',
                $hostname['ssl_status'] ?? '?',
                $isActive ? ' -> LIVE' : ''
            ));
        }

        return self::SUCCESS;
    }
}
