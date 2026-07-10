<?php

namespace App\Console\Commands;

use App\Models\Website;
use App\Services\PloiService;
use App\Services\Tenancy\TenantResolver;
use Illuminate\Console\Command;

class PloiAuditAliases extends Command
{
    protected $signature = 'ploi:audit
        {--fix : Remove duplicate alias rows (and the admin host if it was added as an alias)}';

    protected $description = 'Audit Ploi site aliases against website domains: duplicates, orphans, missing aliases, admin-host capture';

    public function handle(PloiService $ploi): int
    {
        if (!$ploi->isConfigured()) {
            $this->error('Ploi is not configured (PLOI_API_TOKEN / PLOI_SERVER_ID / PLOI_SITE_ID).');
            return self::FAILURE;
        }

        $aliases = $ploi->listAliasesWithIds();
        $adminHost = TenantResolver::normalizeHost((string) config('tenancy.admin_host'));

        $this->info('Aliases on the Ploi site: ' . count($aliases));

        // Group alias rows by normalized domain to find exact duplicates.
        $byDomain = [];
        foreach ($aliases as $row) {
            $domain = TenantResolver::normalizeHost((string) ($row['domain'] ?? ''));
            if ($domain === '') {
                continue;
            }
            $byDomain[$domain][] = $row;
        }

        $problems = 0;

        // 1. Duplicate alias rows (the "domain listed twice in server_name" bug).
        foreach ($byDomain as $domain => $rows) {
            if (count($rows) > 1) {
                $problems++;
                $ids = array_column($rows, 'id');
                $this->warn("DUPLICATE: \"{$domain}\" has " . count($rows) . ' alias rows (ids: ' . implode(', ', $ids) . ')');

                if ($this->option('fix')) {
                    for ($i = 1; $i < count($rows); $i++) {
                        [$ok, $msg] = $ploi->deleteAlias($domain);
                        $this->line(($ok ? '  fixed: ' : '  FAILED: ') . $msg);
                    }
                }
            }
        }

        // 2. Admin host must never be an alias — it is the primary domain.
        if ($adminHost !== '' && isset($byDomain[$adminHost])) {
            $problems++;
            $this->warn("ADMIN HOST AS ALIAS: \"{$adminHost}\" is registered as an alias — it must only be the site's primary domain.");
            if ($this->option('fix')) {
                [$ok, $msg] = $ploi->deleteAlias($adminHost);
                $this->line(($ok ? '  fixed: ' : '  FAILED: ') . $msg);
            }
        }

        // 3. Cross-check against website rows.
        $websiteDomains = Website::whereNotNull('domain')->pluck('is_active', 'domain');

        foreach (array_keys($byDomain) as $domain) {
            if ($domain === $adminHost) {
                continue;
            }
            if (!isset($websiteDomains[$domain])) {
                $problems++;
                $this->warn("ORPHAN ALIAS: \"{$domain}\" is on Ploi but no website row has this domain (visitors get 404). Remove the alias or assign the domain to a website.");
            } elseif (!$websiteDomains[$domain]) {
                $problems++;
                $this->warn("INACTIVE WEBSITE: \"{$domain}\" alias points to a deactivated website (visitors get 404).");
            }
        }

        foreach ($websiteDomains as $domain => $isActive) {
            $normalized = TenantResolver::normalizeHost((string) $domain);
            if ($normalized !== '' && !isset($byDomain[$normalized]) && $normalized !== $adminHost) {
                $problems++;
                $this->warn("MISSING ALIAS: website domain \"{$domain}\" has no Ploi alias — the domain won't reach this server. Use \"Connect domain to Ploi\" on its Edit page.");
            }
        }

        if ($problems === 0) {
            $this->info('No problems found: aliases and website domains are in sync.');
        } else {
            $this->line('');
            $this->line($problems . ' problem(s) found.' . ($this->option('fix') ? '' : ' Re-run with --fix to remove duplicate rows and admin-host aliases.'));
        }

        return $problems === 0 ? self::SUCCESS : self::FAILURE;
    }
}
