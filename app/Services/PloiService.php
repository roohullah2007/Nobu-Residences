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
        // site. Without this, certbot overwrites the cert file with one that
        // only covers the new domains — taking the site's primary domain
        // offline with ERR_CERT_COMMON_NAME_INVALID. This single line is the
        // difference between "issuing a new cert" and "wiping the existing
        // one and replacing it with a narrower scope".
        foreach ($this->listCertificates($targetSite) as $cert) {
            foreach (($cert['domains'] ?? []) as $existing) {
                if (!in_array($existing, $domains, true)) {
                    $domains[] = $existing;
                }
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
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if ($response->successful()) {
                return [true, "SSL requested for: {$certificateString}", $response->json()];
            }

            // 422 with "already" is fine — cert already exists / pending
            if ($response->status() === 422 && str_contains((string) $response->body(), 'already')) {
                return [true, 'SSL certificate already exists for this domain.', $response->json()];
            }

            return [false, "Ploi SSL returned {$response->status()}: {$response->body()}", $response->json()];
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
        $targetSite = $siteId ?: $this->siteId;
        if (!$this->isConfigured() || empty($targetSite)) {
            return [];
        }

        $endpoint = "{$this->baseUrl}/servers/{$this->serverId}/sites/{$targetSite}/aliases";

        try {
            $response = $this->client()->get($endpoint);
            if (!$response->successful()) {
                Log::warning('Ploi listAliases failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return [];
            }
            $data = $response->json();
            // Ploi typically returns { "data": [ { "id":..., "domain": "..."}, ... ] }
            $rows = $data['data'] ?? $data ?? [];
            $aliases = [];
            foreach ($rows as $row) {
                if (is_string($row)) {
                    $aliases[] = $row;
                } elseif (is_array($row)) {
                    $aliases[] = $row['domain'] ?? $row['name'] ?? null;
                }
            }
            return array_values(array_filter($aliases));
        } catch (\Throwable $e) {
            Log::error('Ploi listAliases exception', ['error' => $e->getMessage()]);
            return [];
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
