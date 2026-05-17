<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PloiService
{
    protected string $token;
    protected ?string $serverId;
    protected ?string $siteId;
    protected string $baseUrl;
    protected bool $requestSsl;

    public function __construct()
    {
        $this->token = (string) config('services.ploi.token');
        $this->serverId = config('services.ploi.server_id');
        $this->siteId = config('services.ploi.site_id');
        $this->baseUrl = rtrim((string) config('services.ploi.base_url', 'https://ploi.io/api'), '/');
        $this->requestSsl = (bool) config('services.ploi.request_ssl', true);
    }

    public function isConfigured(): bool
    {
        return !empty($this->token) && !empty($this->serverId);
    }

    /**
     * Add a domain alias to the configured Ploi site.
     *
     * Idempotent: looks up the current aliases first and skips the POST if the
     * domain is already present (a duplicate POST can succeed and create a
     * second alias row, or fail noisily depending on Ploi's mood).
     *
     * Returns [ok, message, response].
     */
    public function addAlias(string $domain, ?string $siteId = null): array
    {
        $domain = $this->normalizeDomain($domain);
        $targetSite = $siteId ?: $this->siteId;

        if (!$this->isConfigured() || empty($targetSite)) {
            return [false, 'Ploi is not configured (PLOI_API_TOKEN, PLOI_SERVER_ID, PLOI_SITE_ID).', null];
        }

        if (empty($domain)) {
            return [false, 'No domain provided.', null];
        }

        $existing = $this->listAliases($targetSite);
        foreach ($existing as $a) {
            if (strcasecmp($a, $domain) === 0) {
                return [true, "Alias \"{$domain}\" is already on Ploi — nothing to do.", null];
            }
        }

        $endpoint = "{$this->baseUrl}/servers/{$this->serverId}/sites/{$targetSite}/aliases";

        try {
            // Ploi's /aliases endpoint expects a plural "aliases" field as an
            // ARRAY of domain strings.
            $response = $this->client()->post($endpoint, [
                'aliases' => [$domain],
            ]);

            Log::info('Ploi alias request', [
                'domain' => $domain,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if ($response->successful()) {
                // SSL is dispatched separately as a delayed queue job by the
                // controller so the alias has time to propagate before we
                // request a certificate. Don't fire it here.
                return [true, "Alias \"{$domain}\" submitted to Ploi (HTTP {$response->status()}).", $response->json()];
            }

            // Already exists is fine
            if ($response->status() === 422 && str_contains((string) $response->body(), 'already')) {
                return [true, "Alias \"{$domain}\" already exists on Ploi.", $response->json()];
            }

            return [false, "Ploi API returned {$response->status()}: {$response->body()}", $response->json()];
        } catch (\Throwable $e) {
            Log::error('Ploi alias exception', ['domain' => $domain, 'error' => $e->getMessage()]);
            return [false, 'Ploi request failed: ' . $e->getMessage(), null];
        }
    }

    /**
     * Issue a Let's Encrypt certificate for a domain on the given site.
     *
     * Important: Ploi reuses the site's primary domain as certbot's
     * --cert-name, so issuing a SAN cert for [domain, www.domain] alone will
     * OVERWRITE the file at /etc/letsencrypt/live/{site_primary}/fullchain.pem
     * — which is also the path nginx serves for the site's primary domain
     * and all other aliases. The fix is to always include every other
     * already-covered domain on the site in the new cert request, so the
     * resulting SAN cert is a superset of what was there before.
     *
     * Ploi's API: POST /servers/{server}/sites/{site}/certificates
     * Body: { "type": "letsencrypt", "certificate": "domain.com,www.domain.com" }
     */
    public function requestSsl(string $domain, ?string $siteId = null): array
    {
        $targetSite = $siteId ?: $this->siteId;

        if (!$this->isConfigured() || empty($targetSite)) {
            return [false, 'Ploi not configured.', null];
        }

        $domain = $this->normalizeDomain($domain);
        if ($domain === '') {
            return [false, 'No domain provided.', null];
        }

        // Start with the requested domain (+ www variant for bare apex).
        $domains = [$domain];
        if (!str_starts_with($domain, 'www.') && substr_count($domain, '.') === 1) {
            $domains[] = 'www.' . $domain;
        }

        // Union with every domain already covered by an existing cert on the
        // site so the resulting SAN cert is a superset and we don't take
        // existing aliases offline. BUT — and this is the bit that wasn't
        // here before — only include a covered domain if it currently
        // resolves to the Ploi server IP. Let's Encrypt's HTTP-01 challenge
        // is all-or-nothing: if any single domain in the batch fails DNS
        // validation (e.g. it now points back at Cloudflare's proxy), the
        // entire issuance fails. Excluding stale domains is safer than
        // letting them poison every retry.
        // Case-insensitive contains: Ploi sometimes returns "Foo.com" where
        // we already have "foo.com" in $domains. A strict in_array would let
        // both into the cert request and we'd be POSTing a duplicate.
        $hasDomain = function (string $needle, array $haystack): bool {
            foreach ($haystack as $h) {
                if (is_string($h) && strcasecmp($h, $needle) === 0) return true;
            }
            return false;
        };

        $serverIp = $this->getServerIp();
        $skipped = [];
        foreach ($this->listCertificates($targetSite) as $cert) {
            foreach (($cert['domains'] ?? []) as $existing) {
                if ($hasDomain($existing, $domains) || $hasDomain($existing, $skipped)) {
                    continue;
                }
                if ($serverIp && !$this->domainResolvesTo($existing, $serverIp)) {
                    $skipped[] = $existing;
                    continue;
                }
                $domains[] = $existing;
            }
        }

        // Ploi's /certificates endpoint expects a SINGULAR "certificate" field
        // containing a comma-separated string of domains (NOT a "certificates"
        // array). The 422 from Ploi spells this out: "The certificate field is required."
        $certificateString = implode(',', $domains);

        $endpoint = "{$this->baseUrl}/servers/{$this->serverId}/sites/{$targetSite}/certificates";

        try {
            $response = $this->client()->post($endpoint, [
                'type' => 'letsencrypt',
                'certificate' => $certificateString,
            ]);

            Log::info('Ploi SSL request', [
                'certificate' => $certificateString,
                'skipped' => $skipped,
                'server_ip' => $serverIp,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if ($response->successful()) {
                $msg = "SSL requested for: {$certificateString}";
                if (!empty($skipped)) {
                    $msg .= '. Skipped (DNS no longer points to server ' . $serverIp . '): ' . implode(', ', $skipped);
                }
                return [true, $msg, $response->json()];
            }

            // 422 with "already" is fine — cert already exists / pending
            if ($response->status() === 422 && str_contains((string) $response->body(), 'already')) {
                return [true, 'SSL certificate already exists for this domain.', $response->json()];
            }

            $errMsg = "Ploi SSL returned {$response->status()}: {$response->body()}";
            if (!empty($skipped)) {
                $errMsg .= ' [Skipped covered domains whose DNS no longer points to ' . $serverIp . ': ' . implode(', ', $skipped) . ']';
            }
            return [false, $errMsg, $response->json()];
        } catch (\Throwable $e) {
            Log::error('Ploi SSL exception', ['error' => $e->getMessage()]);
            return [false, $e->getMessage(), null];
        }
    }

    /**
     * Fetch the current list of aliases on the given site.
     * Returns an array of alias strings (empty array on failure).
     */
    public function listAliases(?string $siteId = null): array
    {
        return array_values(array_filter(array_map(
            fn ($row) => $row['domain'] ?? null,
            $this->listAliasesWithIds($siteId)
        )));
    }

    /**
     * Same as listAliases() but preserves the Ploi numeric ID so callers can
     * issue DELETE requests (which need /aliases/{id}, not /aliases/{domain}).
     * Returns [ ['id' => 123, 'domain' => 'foo.com'], ... ].
     */
    public function listAliasesWithIds(?string $siteId = null): array
    {
        $targetSite = $siteId ?: $this->siteId;
        if (!$this->isConfigured() || empty($targetSite)) {
            return [];
        }

        $endpoint = "{$this->baseUrl}/servers/{$this->serverId}/sites/{$targetSite}/aliases";

        try {
            $response = $this->client()->get($endpoint);
            if (!$response->successful()) {
                Log::warning('Ploi listAliasesWithIds failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return [];
            }
            $data = $response->json();
            // Ploi typically returns { "data": [ { "id":..., "domain": "..."}, ... ] }
            $rows = $data['data'] ?? $data ?? [];
            $out = [];
            foreach ($rows as $row) {
                if (is_string($row)) {
                    $out[] = ['id' => null, 'domain' => $row];
                } elseif (is_array($row)) {
                    $out[] = [
                        'id' => $row['id'] ?? null,
                        'domain' => $row['domain'] ?? $row['name'] ?? null,
                    ];
                }
            }
            return array_values(array_filter($out, fn ($r) => !empty($r['domain'])));
        } catch (\Throwable $e) {
            Log::error('Ploi listAliasesWithIds exception', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Remove a domain alias from the configured Ploi site.
     *
     * Idempotent: returns ok with a friendly message if the alias isn't on
     * the site (nothing to delete). Uses the alias's numeric Ploi ID for the
     * DELETE — Ploi's endpoint is /aliases/{id}, not /aliases/{domain}.
     *
     * Returns [ok, message, response].
     */
    public function deleteAlias(string $domain, ?string $siteId = null): array
    {
        $domain = $this->normalizeDomain($domain);
        $targetSite = $siteId ?: $this->siteId;

        if (!$this->isConfigured() || empty($targetSite)) {
            return [false, 'Ploi is not configured (PLOI_API_TOKEN, PLOI_SERVER_ID, PLOI_SITE_ID).', null];
        }

        if (empty($domain)) {
            return [true, 'No domain to remove from Ploi.', null];
        }

        $aliasId = null;
        foreach ($this->listAliasesWithIds($targetSite) as $row) {
            if (!empty($row['domain']) && strcasecmp($row['domain'], $domain) === 0) {
                $aliasId = $row['id'];
                break;
            }
        }

        if (!$aliasId) {
            return [true, "Alias \"{$domain}\" is not on Ploi — nothing to remove.", null];
        }

        $endpoint = "{$this->baseUrl}/servers/{$this->serverId}/sites/{$targetSite}/aliases/{$aliasId}";

        try {
            $response = $this->client()->delete($endpoint);

            Log::info('Ploi alias delete', [
                'domain' => $domain,
                'alias_id' => $aliasId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if ($response->successful() || $response->status() === 204) {
                return [true, "Alias \"{$domain}\" removed from Ploi.", $response->json()];
            }

            return [false, "Ploi alias delete returned {$response->status()}: {$response->body()}", $response->json()];
        } catch (\Throwable $e) {
            Log::error('Ploi alias delete exception', ['domain' => $domain, 'error' => $e->getMessage()]);
            return [false, 'Ploi request failed: ' . $e->getMessage(), null];
        }
    }

    /**
     * Fetch the current list of SSL certificates on the given site.
     * Returns array of [ 'id', 'type', 'domains' (array), 'status' ].
     */
    public function listCertificates(?string $siteId = null): array
    {
        $targetSite = $siteId ?: $this->siteId;
        if (!$this->isConfigured() || empty($targetSite)) {
            return [];
        }

        $endpoint = "{$this->baseUrl}/servers/{$this->serverId}/sites/{$targetSite}/certificates";

        try {
            $response = $this->client()->get($endpoint);
            if (!$response->successful()) {
                Log::warning('Ploi listCertificates failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return [];
            }
            $data = $response->json();
            $rows = $data['data'] ?? $data ?? [];
            $out = [];
            foreach ($rows as $r) {
                if (!is_array($r)) continue;
                $domains = $r['domain'] ?? $r['domains'] ?? '';
                if (is_string($domains)) {
                    $domains = array_map('trim', explode(',', $domains));
                }
                $out[] = [
                    'id' => $r['id'] ?? null,
                    'type' => $r['type'] ?? null,
                    'domains' => array_values(array_filter((array) $domains)),
                    'status' => $r['status'] ?? null,
                    'expires_at' => $r['expires_at'] ?? null,
                ];
            }
            return $out;
        } catch (\Throwable $e) {
            Log::error('Ploi listCertificates exception', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Cache for getServerIp() so a single SSL request doesn't hit GET /servers
     * multiple times when filtering many covered domains.
     */
    protected ?string $cachedServerIp = null;

    /**
     * Public IPv4 of the configured Ploi server. Used as the reference IP
     * when filtering which covered domains can still validate via HTTP-01.
     *
     * Resolution order:
     *   1. PLOI_SERVER_IP env var (if explicitly set)
     *   2. GET /servers/{server_id} → ip_address from Ploi's API
     *   3. null (caller should fall back to including all domains)
     */
    public function getServerIp(): ?string
    {
        if ($this->cachedServerIp !== null) {
            return $this->cachedServerIp ?: null;
        }

        $configured = config('services.ploi.server_ip');
        if (!empty($configured)) {
            return $this->cachedServerIp = $configured;
        }

        if (!$this->isConfigured()) {
            $this->cachedServerIp = '';
            return null;
        }

        try {
            $response = $this->client()->get("{$this->baseUrl}/servers/{$this->serverId}");
            if ($response->successful()) {
                $data = $response->json();
                $ip = $data['data']['ip_address']
                    ?? $data['ip_address']
                    ?? $data['data']['public_ip']
                    ?? $data['public_ip']
                    ?? null;
                if ($ip) {
                    return $this->cachedServerIp = $ip;
                }
            }
            Log::warning('Ploi getServerIp failed', [
                'status' => $response->status(),
                'body' => substr((string) $response->body(), 0, 500),
            ]);
        } catch (\Throwable $e) {
            Log::error('Ploi getServerIp exception', ['error' => $e->getMessage()]);
        }

        $this->cachedServerIp = '';
        return null;
    }

    /**
     * Does $domain currently resolve to $serverIp via DNS? Used to decide
     * whether a domain can safely be included in a Let's Encrypt batch — if
     * its DNS no longer points to the server, including it would cause the
     * whole all-or-nothing issuance to fail.
     */
    protected function domainResolvesTo(string $domain, string $serverIp): bool
    {
        if ($domain === '' || $serverIp === '') {
            return false;
        }
        try {
            $records = @dns_get_record($domain, DNS_A);
            foreach ((array) $records as $r) {
                if (!empty($r['ip']) && $r['ip'] === $serverIp) {
                    return true;
                }
            }
        } catch (\Throwable $e) {
            // Treat lookup failure as "can't confirm" — exclude to be safe.
        }
        return false;
    }

    protected function client()
    {
        return Http::withToken($this->token)
            ->acceptJson()
            ->timeout(20)
            // Force IPv4. Cloud hosts like Hetzner expose both stacks and curl
            // prefers IPv6, which makes outbound requests come from an IPv6
            // address that isn't on the Ploi token's IP whitelist. Pinning to
            // IPv4 makes the call originate from the documented server IP.
            ->withOptions([
                'curl' => [
                    CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                ],
            ]);
    }

    protected function normalizeDomain(string $domain): string
    {
        $domain = trim($domain);
        $domain = preg_replace('#^https?://#i', '', $domain);
        return rtrim($domain, '/');
    }
}
