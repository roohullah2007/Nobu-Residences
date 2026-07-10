<?php

namespace App\Services\Tenancy;

use App\Models\Website;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Single source of truth for "which website does this request belong to".
 *
 * Resolution order:
 *   1. Admin host (config tenancy.admin_host) and local dev hosts always get
 *      the default website — tenant domains can never capture them.
 *   2. ?website={slug} preview override — honored only on the admin host or
 *      local dev, so a tenant domain cannot be made to render another tenant.
 *   3. Exact (normalized) domain match against active websites.
 *   4. Unknown host: null (callers abort 404) or the default website when
 *      config tenancy.unknown_host = 'default'.
 *
 * The instance memoizes per request; the domain->id lookup is additionally
 * cached across requests so thousands of domains stay O(1).
 */
class TenantResolver
{
    /** @var array<string, Website|null> */
    protected array $memo = [];

    protected ?Website $defaultWebsite = null;

    protected bool $defaultLoaded = false;

    /**
     * Resolve the website for a request. Returns null ONLY for unknown hosts
     * when tenancy.unknown_host = '404' — callers decide whether to abort.
     */
    public function resolve(Request $request): ?Website
    {
        $host = self::normalizeHost($request->getHost());
        $previewSlug = (string) $request->query('website', '');
        $memoKey = $host . '|' . $previewSlug;

        if (array_key_exists($memoKey, $this->memo)) {
            return $this->memo[$memoKey];
        }

        return $this->memo[$memoKey] = $this->resolveUncached($host, $previewSlug);
    }

    /**
     * Is this host a reserved admin/main host (or local dev)?
     */
    public function isAdminHost(string $host): bool
    {
        $host = self::normalizeHost($host);

        if (in_array($host, self::adminHosts(), true)) {
            return true;
        }

        return $this->isLocalHost($host);
    }

    /**
     * The reserved admin/main hosts. ADMIN_HOST accepts a comma-separated
     * list so the panel keeps working on both the old and new domain while
     * a move (e.g. nobu.wpbun.xyz -> building.wpbun.xyz) is in progress.
     *
     * APP_URL's host is always included as well: the app's own canonical URL
     * can never be a tenant, and this keeps the main site reachable after a
     * domain move even when ADMIN_HOST in the server .env is stale.
     *
     * @return string[] Normalized, deduplicated, empty entries removed.
     */
    public static function adminHosts(): array
    {
        $hosts = explode(',', (string) config('tenancy.admin_host'));
        $hosts[] = (string) config('app.url');

        return array_values(array_unique(array_filter(array_map(
            fn (string $host) => self::normalizeHost($host),
            $hosts
        ))));
    }

    protected function resolveUncached(string $host, string $previewSlug): ?Website
    {
        $isAdminHost = $this->isAdminHost($host);

        // Preview override — admin host / local only, so tenant domains can
        // never be made to render a different tenant via a query param.
        if ($previewSlug !== '' && $isAdminHost) {
            $preview = Website::with('agentInfo')
                ->where('slug', $previewSlug)
                ->where('is_active', true)
                ->first();
            if ($preview) {
                return $preview;
            }
        }

        if ($isAdminHost) {
            return $this->defaultWebsite();
        }

        $website = $this->findByDomain($host);
        if ($website) {
            return $website;
        }

        if (config('tenancy.unknown_host') === 'default') {
            return $this->defaultWebsite();
        }

        return null;
    }

    protected function findByDomain(string $host): ?Website
    {
        $cacheKey = 'tenancy.domain.' . $host;
        $seconds = (int) config('tenancy.cache_seconds', 60);

        $websiteId = Cache::remember($cacheKey, $seconds, function () use ($host) {
            $id = Website::query()
                ->where('is_active', true)
                ->where(function ($q) use ($host) {
                    $q->where('domain', $host)
                        ->orWhere('domain', 'www.' . $host);
                })
                ->value('id');

            // Cache a sentinel for misses too, so unknown hosts don't hit the
            // DB on every request.
            return $id ?? 0;
        });

        if (!$websiteId) {
            return null;
        }

        return Website::with('agentInfo')->find($websiteId);
    }

    public function defaultWebsite(): ?Website
    {
        if ($this->defaultLoaded) {
            return $this->defaultWebsite;
        }
        $this->defaultLoaded = true;

        return $this->defaultWebsite = Website::with('agentInfo')
            ->where('is_default', true)
            ->where('is_active', true)
            ->first()
            ?? Website::with('agentInfo')->where('is_active', true)->orderBy('id')->first();
    }

    protected function isLocalHost(string $host): bool
    {
        return in_array($host, (array) config('tenancy.local_hosts', []), true)
            || str_ends_with($host, '.test')
            || str_ends_with($host, '.local');
    }

    /**
     * Canonical host form: lowercase, no scheme, no port, no path, no
     * leading www. Also used to normalize the websites.domain column value
     * before saving so lookups are exact string matches.
     */
    public static function normalizeHost(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('#^https?://#', '', $value);
        $value = preg_replace('#[/:].*$#', '', $value); // strip path / port
        return preg_replace('/^www\./', '', $value) ?? '';
    }

    /**
     * Flush the cross-request domain cache entry for a domain (call after a
     * website's domain changes).
     */
    public static function forgetDomain(?string $domain): void
    {
        if (!$domain) {
            return;
        }
        Cache::forget('tenancy.domain.' . self::normalizeHost($domain));
    }
}
