<?php

namespace App\Console\Commands;

use App\Models\Website;
use App\Services\PloiService;
use App\Services\Tenancy\TenantResolver;
use Illuminate\Console\Command;

class PloiReissueSsl extends Command
{
    protected $signature = 'ploi:reissue';

    protected $description = 'Emergency SSL recovery: force-issue a fresh certificate for the admin host (plus every covered tenant domain) and re-queue tenants that lost coverage';

    public function handle(PloiService $ploi): int
    {
        if (!$ploi->isConfigured()) {
            $this->error('Ploi is not configured (PLOI_API_TOKEN / PLOI_SERVER_ID / PLOI_SITE_ID).');
            return self::FAILURE;
        }

        $adminHost = TenantResolver::normalizeHost((string) config('tenancy.admin_host'));
        if ($adminHost === '') {
            $this->error('No admin host configured (ADMIN_HOST).');
            return self::FAILURE;
        }

        // Force a fresh issuance for the primary domain. requestSsl() unions
        // in every still-covered known tenant domain that resolves to this
        // server, so the new cert is a superset and restores the shared cert
        // file nginx serves for the whole site.
        $this->info("Force-reissuing certificate for {$adminHost}...");
        [$ok, $message] = $ploi->requestSsl($adminHost, null, force: true);
        $this->line(($ok ? 'OK: ' : 'FAILED: ') . $message);

        if (!$ok) {
            return self::FAILURE;
        }

        // Any active tenant domain the fresh cert does not cover gets flipped
        // to waiting_dns so ploi:watch-dns re-provisions it automatically
        // within 5 minutes (or immediately on the next manual run).
        $certs = $ploi->listCertificates();
        $covered = [];
        foreach ($certs as $cert) {
            foreach (($cert['domains'] ?? []) as $d) {
                $covered[strtolower(trim($d))] = true;
            }
        }

        $requeued = 0;
        foreach (Website::whereNotNull('domain')->where('is_active', true)->get() as $website) {
            $domain = strtolower(trim($website->domain));
            if ($domain !== '' && !isset($covered[$domain])) {
                $website->update([
                    'ploi_ssl_status' => 'waiting_dns',
                    'ploi_last_error' => 'Re-queued by ploi:reissue — certificate coverage will be restored automatically.',
                ]);
                $this->warn("{$domain}: not covered by any certificate — re-queued for automatic provisioning.");
                $requeued++;
            }
        }

        $this->info($requeued === 0
            ? 'All active tenant domains are covered.'
            : "{$requeued} tenant domain(s) re-queued; ploi:watch-dns will provision them within 5 minutes.");

        return self::SUCCESS;
    }
}
