<?php

namespace App\Console\Commands;

use App\Models\Website;
use App\Services\PloiService;
use App\Services\Tenancy\TenantResolver;
use Illuminate\Console\Command;

class PloiDiagnose extends Command
{
    protected $signature = 'ploi:diagnose';

    protected $description = 'Read-only diagnostic dump: code version, config, Ploi aliases, certificates with coverage verdicts, DNS state, and website provisioning statuses. Paste the output when reporting SSL/domain problems.';

    public function handle(PloiService $ploi): int
    {
        $this->line('================ PLOI DIAGNOSE ================');

        // ------------------------------------------------------------
        // Code + config
        // ------------------------------------------------------------
        $commit = trim((string) @shell_exec('git -C ' . escapeshellarg(base_path()) . ' rev-parse --short HEAD 2>&1'));
        $this->line('Code commit:        ' . ($commit !== '' ? $commit : 'unknown (git unavailable)'));
        $this->line('App env:            ' . config('app.env'));

        $adminHost = TenantResolver::normalizeHost((string) config('tenancy.admin_host'));
        $this->line('Admin host:         ' . ($adminHost ?: 'NOT SET (critical!)'));
        $this->line('Unknown host mode:  ' . config('tenancy.unknown_host'));
        $this->line('Ploi configured:    ' . ($ploi->isConfigured() ? 'yes' : 'NO'));

        if (!$ploi->isConfigured()) {
            $this->error('Ploi not configured — cannot inspect aliases/certificates.');
            return self::FAILURE;
        }

        $serverIp = $ploi->getServerIp();
        $this->line('Server IP:          ' . ($serverIp ?: 'unknown'));

        // ------------------------------------------------------------
        // Websites table
        // ------------------------------------------------------------
        $this->line('');
        $this->line('---- Websites (domain / active / alias status / ssl status) ----');
        foreach (Website::orderBy('id')->get() as $w) {
            $this->line(sprintf(
                '#%d %s | domain=%s | active=%s | default=%s | alias=%s | ssl=%s',
                $w->id,
                $w->name,
                $w->domain ?: '-',
                $w->is_active ? 'yes' : 'NO',
                $w->is_default ? 'YES' : 'no',
                $w->ploi_alias_status ?: '-',
                $w->ploi_ssl_status ?: '-'
            ));
        }

        // ------------------------------------------------------------
        // Ploi aliases
        // ------------------------------------------------------------
        $this->line('');
        $this->line('---- Ploi aliases (rows on the site) ----');
        $aliases = $ploi->listAliasesWithIds();
        if (empty($aliases)) {
            $this->line('(none, or alias list could not be fetched)');
        }
        $counts = [];
        foreach ($aliases as $row) {
            $this->line(sprintf('  id=%s  %s', $row['id'] ?? '?', $row['domain'] ?? '?'));
            $key = TenantResolver::normalizeHost((string) ($row['domain'] ?? ''));
            $counts[$key] = ($counts[$key] ?? 0) + 1;
        }
        foreach ($counts as $domain => $n) {
            if ($n > 1) {
                $this->warn("  DUPLICATE: {$domain} appears {$n} times in server_name");
            }
        }

        // ------------------------------------------------------------
        // Certificates — the crucial part. The NEWEST cert's file is what
        // nginx actually serves for EVERY domain on the site.
        // ------------------------------------------------------------
        $this->line('');
        $this->line('---- Ploi certificates (newest one is the file nginx serves) ----');
        $certs = $ploi->listCertificates();
        if (empty($certs)) {
            $this->warn('(no certificates on the site — HTTPS cannot work)');
        }

        $newest = null;
        foreach ($certs as $cert) {
            $this->line(sprintf(
                '  id=%s  status=%s  domains=[%s]',
                $cert['id'] ?? '?',
                $cert['status'] ?? '?',
                implode(', ', $cert['domains'] ?? [])
            ));
            if (($cert['id'] ?? 0) > ($newest['id'] ?? -1)) {
                $newest = $cert;
            }
        }

        // ------------------------------------------------------------
        // Verdicts
        // ------------------------------------------------------------
        $this->line('');
        $this->line('---- Verdicts ----');
        $problems = 0;

        if ($newest) {
            $newestDomains = array_map(
                fn ($d) => TenantResolver::normalizeHost((string) $d),
                $newest['domains'] ?? []
            );
            if ($adminHost !== '' && !in_array($adminHost, $newestDomains, true)) {
                $problems++;
                $this->error("CRITICAL: the newest certificate (id={$newest['id']}) does NOT include the admin host {$adminHost}.");
                $this->error('  Because Ploi reuses one cert file for the whole site, the main website is serving');
                $this->error('  a certificate without its own name right now (ERR_CERT_COMMON_NAME_INVALID).');
                $this->error('  FIX: php artisan ploi:cleanup   (force-issues a superset cert including the admin host)');
            } else {
                $this->info("OK: newest certificate includes the admin host ({$adminHost}).");
            }
        }

        if ($adminHost !== '' && $serverIp) {
            $points = $ploi->domainPointsToServer($adminHost);
            if ($points === false) {
                $problems++;
                $this->error("CRITICAL: admin host {$adminHost} does not resolve to {$serverIp}.");
            } else {
                $this->info("OK: admin host resolves to the server.");
            }
        }

        foreach (Website::whereNotNull('domain')->where('is_active', true)->get() as $w) {
            $domain = TenantResolver::normalizeHost((string) $w->domain);
            $onPloi = false;
            foreach ($aliases as $row) {
                if (TenantResolver::normalizeHost((string) ($row['domain'] ?? '')) === $domain) {
                    $onPloi = true;
                    break;
                }
            }
            $points = $ploi->domainPointsToServer($domain);
            $covered = false;
            foreach ($certs as $cert) {
                foreach (($cert['domains'] ?? []) as $d) {
                    if (TenantResolver::normalizeHost((string) $d) === $domain) {
                        $covered = ($cert['status'] ?? null) === 'active';
                        break 2;
                    }
                }
            }
            $this->line(sprintf(
                '  %s: alias=%s dns=%s cert-covered=%s',
                $domain,
                $onPloi ? 'yes' : 'MISSING',
                $points === null ? 'unknown' : ($points ? 'points here' : 'NOT POINTING'),
                $covered ? 'yes' : 'no'
            ));
            if (!$onPloi || !$covered) {
                $problems++;
            }
        }

        $this->line('');
        $this->line($problems === 0
            ? 'No problems detected.'
            : "{$problems} problem(s) detected. Run: php artisan ploi:cleanup");
        $this->line('===============================================');

        return self::SUCCESS;
    }
}
