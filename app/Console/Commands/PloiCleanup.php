<?php

namespace App\Console\Commands;

use App\Models\Website;
use App\Services\PloiService;
use App\Services\Tenancy\TenantResolver;
use Illuminate\Console\Command;

class PloiCleanup extends Command
{
    protected $signature = 'ploi:cleanup
        {--keep-orphans : Do not remove aliases that belong to no active website}';

    protected $description = 'One-shot heal: dedupe aliases, remove orphan aliases, force a fresh superset certificate for the admin host, and re-sync every website\'s SSL state. The admin host is never touched.';

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
        $this->info("Admin host (protected, never touched): {$adminHost}");

        // ------------------------------------------------------------------
        // Step 1: remove duplicate alias rows (same domain listed twice+).
        // ------------------------------------------------------------------
        $removedDupes = $ploi->dedupeAliases();
        $this->info("Step 1 - duplicate alias rows removed: {$removedDupes}");

        // ------------------------------------------------------------------
        // Step 2: remove ORPHAN aliases — rows whose domain belongs to no
        // active website. The admin host (and its www) is always kept.
        // ------------------------------------------------------------------
        if ($this->option('keep-orphans')) {
            $this->line('Step 2 - skipped (--keep-orphans).');
        } else {
            $activeBare = Website::whereNotNull('domain')->where('is_active', true)
                ->pluck('domain')
                ->map(fn ($d) => preg_replace('/^www\./i', '', TenantResolver::normalizeHost((string) $d)))
                ->filter()
                ->flip();

            $removedOrphans = 0;
            foreach ($ploi->listAliasesWithIds() as $row) {
                $bare = preg_replace('/^www\./i', '', TenantResolver::normalizeHost((string) ($row['domain'] ?? '')));
                if ($bare === '' || empty($row['id'])) {
                    continue;
                }
                if ($bare === $adminHost) {
                    continue; // never touch the admin host
                }
                if (!isset($activeBare[$bare])) {
                    if ($ploi->deleteAliasById((int) $row['id'])) {
                        $this->warn("  removed orphan alias \"{$row['domain']}\" (no active website uses it)");
                        $removedOrphans++;
                    } else {
                        $this->error("  FAILED to remove orphan alias \"{$row['domain']}\"");
                    }
                }
            }
            $this->info("Step 2 - orphan aliases removed: {$removedOrphans}");
        }

        // ------------------------------------------------------------------
        // Step 3: force-issue a fresh certificate. requestSsl now ALWAYS
        // includes the admin host in the batch, plus every known tenant
        // domain that resolves here — so the shared cert file nginx serves
        // is guaranteed to cover the main site again.
        // ------------------------------------------------------------------
        $this->info('Step 3 - force-reissuing certificate (admin host + resolving tenant domains)...');
        [$ok, $message] = $ploi->requestSsl($adminHost, null, force: true);
        $this->line(($ok ? '  OK: ' : '  FAILED: ') . $message);

        // ------------------------------------------------------------------
        // Step 4: re-sync every active website's persisted SSL state with
        // what Ploi actually has now.
        // ------------------------------------------------------------------
        $covered = [];
        foreach ($ploi->listCertificates() as $cert) {
            foreach (($cert['domains'] ?? []) as $d) {
                $covered[TenantResolver::normalizeHost((string) $d)] = true;
            }
        }

        $issued = 0;
        $requeued = 0;
        foreach (Website::whereNotNull('domain')->where('is_active', true)->get() as $website) {
            $domain = TenantResolver::normalizeHost((string) $website->domain);
            if ($domain === '') {
                continue;
            }
            if (isset($covered[$domain])) {
                if ($website->ploi_ssl_status !== 'issued') {
                    $website->update([
                        'ploi_ssl_status' => 'issued',
                        'ploi_ssl_issued_at' => $website->ploi_ssl_issued_at ?: now(),
                        'ploi_last_error' => null,
                    ]);
                }
                $issued++;
            } else {
                $website->update([
                    'ploi_ssl_status' => 'waiting_dns',
                    'ploi_last_error' => 'Re-queued by ploi:cleanup — will be provisioned automatically once DNS points at the server.',
                ]);
                $this->warn("  {$domain}: not covered — re-queued (ploi:watch-dns provisions it within 5 minutes once DNS points here).");
                $requeued++;
            }
        }
        $this->info("Step 4 - websites covered: {$issued}, re-queued: {$requeued}");

        $this->line('');
        $this->info('Cleanup complete. If the browser still shows an SSL error, restart nginx from the Ploi panel once.');

        return $ok ? self::SUCCESS : self::FAILURE;
    }
}
