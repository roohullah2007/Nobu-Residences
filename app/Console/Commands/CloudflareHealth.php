<?php

namespace App\Console\Commands;

use App\Models\Website;
use App\Services\HealthCheckService;
use App\Services\Tenancy\TenantResolver;
use Illuminate\Console\Command;

class CloudflareHealth extends Command
{
    protected $signature = 'cloudflare:health';

    protected $description = 'Read-only health report: every custom domain checked against Cloudflare (hostname exists, SSL active, verification, ownership)';

    public function handle(HealthCheckService $health): int
    {
        $adminHosts = implode(', ', TenantResolver::adminHosts());
        $this->line("Admin host(s) (never a custom hostname): {$adminHosts}");
        $this->line('');

        $websites = Website::whereNotNull('domain')->orderBy('id')->get();
        if ($websites->isEmpty()) {
            $this->info('No websites with custom domains.');
            return self::SUCCESS;
        }

        $problems = 0;

        foreach ($websites as $website) {
            $check = $health->checkWebsite($website);

            if (!$check['configured']) {
                $this->error('Cloudflare is not configured (CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID).');
                return self::FAILURE;
            }

            $ok = $check['hostname_exists'] === true && $check['ssl_active'] === true;
            if (!$ok) {
                $problems++;
            }

            $this->line(sprintf(
                '%s #%d %s | hostname=%s | status=%s | ssl=%s | ownership=%s',
                $ok ? 'OK  ' : 'FAIL',
                $website->id,
                $website->domain,
                $check['hostname_exists'] === null ? 'unknown' : ($check['hostname_exists'] ? 'exists' : 'MISSING'),
                $check['status'] ?? '-',
                $check['ssl_status'] ?? '-',
                $check['ownership_verified'] === null ? 'unknown' : ($check['ownership_verified'] ? 'verified' : 'pending')
            ));

            foreach ($check['errors'] as $err) {
                $this->warn("      {$err}");
            }
        }

        $this->line('');
        $this->line($problems === 0 ? 'All custom domains healthy.' : "{$problems} domain(s) need attention.");

        return $problems === 0 ? self::SUCCESS : self::FAILURE;
    }
}
