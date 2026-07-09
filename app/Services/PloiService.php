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

    /**
     * Cloudflare proxy IP ranges (v4 + v6). A domain resolving here is
     * orange-clouded: Let's Encrypt's HTTP-01 challenge hits Cloudflare's
     * edge instead of this server, so issuance can never succeed until the
     * proxy is switched to "DNS only". https://www.cloudflare.com/ips/
     */
    protected const CLOUDFLARE_RANGES = [
        '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '188.114.96.0/20',
        '131.0.72.0/22', '190.93.240.0/20', '141.101.64.0/18', '108.162.192.0/18',
        '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
        '162.158.0.0/15', '198.41.128.0/17',
        '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
        '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32',
    ];

    /**
     * True when the most recent listAliasesWithIds() call got a successful
     * response from Ploi. Lets callers distinguish "site has no aliases"
     * from "couldn't reach Ploi" — both return [].
     */
    public bool $aliasListFetchOk = false;

    /**
     * Canonical form of a domain for comparisons: trimmed, lowercased, no
     * trailing dot. Ploi rows and admin input can disagree on case /
     * whitespace, and a strict comparison then misreports a present alias
     * as missing.
     */
    protected static function canonicalDomain(?string $domain): string
    {
        return strtolower(rtrim(trim((string) $domain), '.'));
    }

    /**
     * Does the site's live alias list contain this domain?
     * Returns true/false when Ploi answered, or NULL when the alias list
     * could not be fetched — callers must never present NULL as "not on
     * Ploi"; say "couldn't verify" instead.
     */
    public function aliasExists(string $domain, ?string $siteId = null): ?bool
    {
        $needle = self::canonicalDomain($this->normalizeDomain($domain));
        if ($needle === '') {
            return null;
        }
        foreach ($this->listAliases($siteId) as $a) {
            if (self::canonicalDomain($a) === $needle) {
                return true;
            }
        }
        return $this->aliasListFetchOk ? false : null;
    }

    /**
     * Is this IP inside Cloudflare's published proxy ranges (v4 or v6)?
     */
    public static function isCloudflareIp(string $ip): bool
    {
        $bin = @inet_pton($ip);
        if ($bin === false) {
            return false;
        }
        foreach (self::CLOUDFLARE_RANGES as $cidr) {
            [$net, $bits] = explode('/', $cidr);
            $netBin = @inet_pton($net);
            if ($netBin === false || strlen($netBin) !== strlen($bin)) {
                continue;
            }
            $bits = (int) $bits;
            $fullBytes = intdiv($bits, 8);
            $remainder = $bits % 8;
            if ($fullBytes > 0 && substr($bin, 0, $fullBytes) !== substr($netBin, 0, $fullBytes)) {
                continue;
            }
            if ($remainder > 0) {
                $mask = (0xFF << (8 - $remainder)) & 0xFF;
                if ((ord($bin[$fullBytes]) & $mask) !== (ord($netBin[$fullBytes]) & $mask)) {
                    continue;
                }
            }
            return true;
        }
        return false;
    }

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

        // Verify against Ploi's live alias list BEFORE posting. Ploi accepts
        // a repeat POST with HTTP 200 and creates a duplicate alias row, so a
        // blind re-add is never safe. If the list can't be fetched, refuse to
        // add rather than risk a duplicate.
        $existing = $this->listAliases($targetSite);
        if (!$this->aliasListFetchOk) {
            return [false,
                "Couldn't fetch the current alias list from Ploi, so the alias was NOT submitted "
                . "(re-adding blindly creates duplicate alias rows on Ploi). "
                . "Check the Ploi API token / connectivity and try again.",
                null];
        }
        foreach ($existing as $a) {
            if (self::canonicalDomain($a) === self::canonicalDomain($domain)) {
                return [true, "Alias \"{$domain}\" already exists on Ploi — nothing to add.", null];
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

        $serverIp = $this->getServerIp();

        // Pre-flight DNS check on the REQUESTED domain before talking to
        // Ploi at all. Let's Encrypt issuance is all-or-nothing, so a domain
        // that can't validate would fail the whole batch (and burn LE
        // rate-limit budget on every retry). The most common cause is
        // Cloudflare's orange-cloud proxy, which we detect specifically so
        // the user gets the exact fix instead of a generic Ploi 422.
        // Wording matters: "should resolve to one of" keeps the frontend's
        // dnsMismatch parsing and RequestPloiSslJob's stop-retrying
        // detection working on this message.
        if ($serverIp) {
            $ips = $this->lookupIps($domain);
            $cfIps = array_values(array_filter($ips, [self::class, 'isCloudflareIp']));
            $ipList = !empty($ips) ? implode(', ', $ips) : 'nothing (no A/AAAA record found)';

            if (!empty($cfIps)) {
                return [false,
                    "Pre-flight DNS check failed: \"{$domain}\" resolves to {$ipList} and should resolve to one of {$serverIp}. "
                    . "This domain is behind Cloudflare's proxy (orange cloud). Let's Encrypt can't validate it. "
                    . "In Cloudflare DNS, set the A record for the apex and www to {$serverIp} and switch Proxy status to "
                    . "DNS only (gray cloud), wait 1-2 min, then Retry SSL. After the cert issues you can re-enable the "
                    . "proxy with SSL/TLS mode Full (strict). No request was sent to Ploi.",
                    null];
            }

            if (!in_array($serverIp, $ips, true)) {
                return [false,
                    "Pre-flight DNS check failed: \"{$domain}\" resolves to {$ipList} and should resolve to one of {$serverIp}. "
                    . "Update the domain's A record to {$serverIp}, wait for DNS to propagate, then Retry SSL. "
                    . "No request was sent to Ploi.",
                    null];
            }
        }

        // Start with the requested domain (+ www variant for bare apex).
        // Only include www when it can actually pass HTTP-01 (or when we
        // can't check): a missing/proxied www record would otherwise fail
        // the entire batch, apex included.
        $skipped = [];
        $domains = [$domain];
        if (!str_starts_with($domain, 'www.') && substr_count($domain, '.') === 1) {
            $www = 'www.' . $domain;
            if (!$serverIp || $this->domainResolvesTo($www, $serverIp)) {
                $domains[] = $www;
            } else {
                $skipped[] = $www;
            }
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
        $this->aliasListFetchOk = false;

        $targetSite = $siteId ?: $this->siteId;
        if (!$this->isConfigured() || empty($targetSite)) {
            return [];
        }

        $endpoint = "{$this->baseUrl}/servers/{$this->serverId}/sites/{$targetSite}/aliases";

        $rows = $this->getAllPages($endpoint, 'listAliasesWithIds');
        if ($rows === null) {
            return [];
        }

        $this->aliasListFetchOk = true;
        // Ploi typically returns { "data": [ { "id":..., "domain": "..."}, ... ] }
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
    }

    /**
     * GET a Ploi list endpoint and follow pagination until every row is
     * collected. Ploi paginates list responses ({data, links, meta}) — with
     * 5+ aliases on the site a single-page read silently drops rows, which
     * then gets misreported as "alias not on Ploi".
     *
     * Returns the merged data rows, or NULL when any request failed (so
     * callers can distinguish "empty list" from "couldn't fetch").
     */
    protected function getAllPages(string $endpoint, string $context): ?array
    {
        $rows = [];
        $page = 1;
        try {
            do {
                $response = $this->client()->get($endpoint, ['page' => $page, 'per_page' => 50]);
                if (!$response->successful()) {
                    Log::warning("Ploi {$context} failed", [
                        'page' => $page,
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                    return null;
                }
                $data = $response->json();
                $batch = is_array($data) ? ($data['data'] ?? $data) : [];
                if (!is_array($batch) || empty($batch)) {
                    break;
                }
                $rows = array_merge($rows, $batch);
                $lastPage = (int) ($data['meta']['last_page'] ?? $page);
                $page++;
            } while ($page <= $lastPage && $page <= 20); // hard cap = 1000 rows
            return $rows;
        } catch (\Throwable $e) {
            Log::error("Ploi {$context} exception", ['error' => $e->getMessage()]);
            return null;
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

        $rows = $this->getAllPages($endpoint, 'listCertificates');
        if ($rows === null) {
            return [];
        }

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
    /**
     * All A + AAAA IPs a domain currently resolves to (empty on failure).
     * AAAA matters: Let's Encrypt prefers IPv6, so a stray AAAA record
     * pointing at Cloudflare breaks validation even when the A is correct.
     */
    protected function lookupIps(string $domain): array
    {
        if ($domain === '') {
            return [];
        }
        try {
            $records = @dns_get_record($domain, DNS_A + DNS_AAAA);
            $ips = [];
            foreach ((array) $records as $r) {
                if (!empty($r['ip']))   { $ips[] = $r['ip']; }
                if (!empty($r['ipv6'])) { $ips[] = $r['ipv6']; }
            }
            return array_values(array_unique($ips));
        } catch (\Throwable $e) {
            return [];
        }
    }

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
