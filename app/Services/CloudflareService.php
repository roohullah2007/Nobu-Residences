<?php

namespace App\Services;

use App\Services\Tenancy\TenantResolver;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cloudflare for SaaS (Custom Hostnames) client. ALL Cloudflare API calls
 * live here — no other class may talk to the API directly.
 *
 * Flow: a customer domain is registered as a Custom Hostname on the SaaS
 * zone; the customer points ONE CNAME at cname_target; Cloudflare validates
 * via HTTP and terminates SSL at its edge. No certbot, no server certs, no
 * nginx aliases — the origin only ever serves the admin host, and Laravel
 * resolves tenants by Host header exactly as before.
 */
class CloudflareService
{
    protected string $token;
    protected string $zoneId;
    protected string $accountId;
    protected string $baseUrl;

    public function __construct()
    {
        $this->token = (string) config('services.cloudflare.token', '');
        $this->zoneId = (string) config('services.cloudflare.zone_id', '');
        $this->accountId = (string) config('services.cloudflare.account_id', '');
        $this->baseUrl = rtrim((string) config('services.cloudflare.base_url', 'https://api.cloudflare.com/client/v4'), '/');
    }

    public function isConfigured(): bool
    {
        return $this->token !== '' && $this->zoneId !== '';
    }

    /**
     * Zone-managed mode: customer domains become DNS zones in OUR Cloudflare
     * account and the apex CNAME is created via the API — the customer only
     * points nameservers. Off (falls back to CNAME instructions) when
     * CLOUDFLARE_ACCOUNT_ID is not set.
     */
    public function zoneProvisioningEnabled(): bool
    {
        return $this->isConfigured() && $this->accountId !== '';
    }

    /**
     * The hostname customers must point their CNAME at.
     */
    public function cnameTarget(): string
    {
        return TenantResolver::normalizeHost((string) config('services.cloudflare.cname_target', ''));
    }

    /**
     * Register a customer domain as a Custom Hostname.
     * Returns [ok(bool), message(string), hostname(array|null)].
     *
     * Idempotent: if the hostname already exists on the zone, returns it
     * instead of erroring. The reserved admin host is refused outright.
     */
    public function createCustomHostname(string $hostname): array
    {
        $hostname = TenantResolver::normalizeHost($hostname);

        if ($hostname === '') {
            return [false, 'No domain provided.', null];
        }
        if ($this->isAdminHost($hostname)) {
            return [false, "\"{$hostname}\" is the reserved admin domain and cannot be a Custom Hostname.", null];
        }
        if (!$this->isConfigured()) {
            return [false, 'Cloudflare is not configured (CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID).', null];
        }

        // Idempotency: reuse an existing registration for this hostname.
        $existing = $this->findCustomHostname($hostname);
        if ($existing) {
            return [true, "Custom hostname \"{$hostname}\" already registered on Cloudflare.", $existing];
        }

        try {
            $response = $this->client()->post("{$this->baseUrl}/zones/{$this->zoneId}/custom_hostnames", [
                'hostname' => $hostname,
                'ssl' => [
                    'method' => 'http',
                    'type' => 'dv',
                    'settings' => ['min_tls_version' => '1.2'],
                ],
            ]);

            Log::info('Cloudflare custom hostname create', [
                'hostname' => $hostname,
                'status' => $response->status(),
            ]);

            $json = $response->json();
            if ($response->successful() && ($json['success'] ?? false)) {
                return [true, "Custom hostname \"{$hostname}\" registered on Cloudflare.", $this->mapHostname($json['result'] ?? [])];
            }

            return [false, $this->errorMessage($json, $response->status()), null];
        } catch (\Throwable $e) {
            Log::error('Cloudflare custom hostname create exception', ['hostname' => $hostname, 'error' => $e->getMessage()]);
            return [false, 'Cloudflare request failed: ' . $e->getMessage(), null];
        }
    }

    /**
     * Fetch a Custom Hostname by its Cloudflare ID. Null when missing or on
     * API failure (callers treat null as "cannot verify", not "gone").
     */
    public function getCustomHostname(string $hostnameId): ?array
    {
        if (!$this->isConfigured() || $hostnameId === '') {
            return null;
        }

        try {
            $response = $this->client()->get("{$this->baseUrl}/zones/{$this->zoneId}/custom_hostnames/{$hostnameId}");
            $json = $response->json();
            if ($response->successful() && ($json['success'] ?? false)) {
                return $this->mapHostname($json['result'] ?? []);
            }
        } catch (\Throwable $e) {
            Log::error('Cloudflare custom hostname get exception', ['id' => $hostnameId, 'error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Look a Custom Hostname up by domain name.
     */
    public function findCustomHostname(string $hostname): ?array
    {
        $hostname = TenantResolver::normalizeHost($hostname);
        if (!$this->isConfigured() || $hostname === '') {
            return null;
        }

        try {
            $response = $this->client()->get("{$this->baseUrl}/zones/{$this->zoneId}/custom_hostnames", [
                'hostname' => $hostname,
            ]);
            $json = $response->json();
            if ($response->successful() && ($json['success'] ?? false)) {
                foreach (($json['result'] ?? []) as $row) {
                    if (TenantResolver::normalizeHost((string) ($row['hostname'] ?? '')) === $hostname) {
                        return $this->mapHostname($row);
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::error('Cloudflare custom hostname find exception', ['hostname' => $hostname, 'error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Remove a Custom Hostname. Deleting a customer's hostname only affects
     * that customer — every hostname has its own edge certificate, so this
     * can never take the admin domain or another tenant offline.
     */
    public function deleteCustomHostname(string $hostnameId): array
    {
        if (!$this->isConfigured()) {
            return [false, 'Cloudflare is not configured.'];
        }
        if ($hostnameId === '') {
            return [true, 'No Cloudflare hostname to remove.'];
        }

        try {
            $response = $this->client()->delete("{$this->baseUrl}/zones/{$this->zoneId}/custom_hostnames/{$hostnameId}");

            Log::info('Cloudflare custom hostname delete', [
                'id' => $hostnameId,
                'status' => $response->status(),
            ]);

            if ($response->successful() || $response->status() === 404) {
                return [true, 'Custom hostname removed from Cloudflare.'];
            }

            return [false, $this->errorMessage($response->json(), $response->status())];
        } catch (\Throwable $e) {
            Log::error('Cloudflare custom hostname delete exception', ['id' => $hostnameId, 'error' => $e->getMessage()]);
            return [false, 'Cloudflare request failed: ' . $e->getMessage()];
        }
    }

    /**
     * List every Custom Hostname on the zone (paginated).
     */
    public function listCustomHostnames(): array
    {
        if (!$this->isConfigured()) {
            return [];
        }

        $out = [];
        $page = 1;

        try {
            do {
                $response = $this->client()->get("{$this->baseUrl}/zones/{$this->zoneId}/custom_hostnames", [
                    'page' => $page,
                    'per_page' => 50,
                ]);
                $json = $response->json();
                if (!$response->successful() || !($json['success'] ?? false)) {
                    break;
                }
                foreach (($json['result'] ?? []) as $row) {
                    $out[] = $this->mapHostname($row);
                }
                $totalPages = (int) ($json['result_info']['total_pages'] ?? 1);
                $page++;
            } while ($page <= $totalPages);
        } catch (\Throwable $e) {
            Log::error('Cloudflare custom hostname list exception', ['error' => $e->getMessage()]);
        }

        return $out;
    }

    /**
     * Ensure the customer's domain exists as a DNS zone in our account AND
     * carries the apex CNAME to the SaaS target. Idempotent end-to-end:
     * an existing zone is reused, an existing correct record is kept.
     * Returns [ok(bool), message(string), zone(array|null)] where zone is
     * ['id', 'status', 'name_servers'].
     */
    public function provisionZone(string $domain): array
    {
        $domain = TenantResolver::normalizeHost($domain);

        if ($domain === '') {
            return [false, 'No domain provided.', null];
        }
        if ($this->isAdminHost($domain)) {
            return [false, "\"{$domain}\" is the reserved admin domain.", null];
        }
        if (!$this->zoneProvisioningEnabled()) {
            return [false, 'Zone provisioning is not enabled (CLOUDFLARE_ACCOUNT_ID missing).', null];
        }
        // Custom hostnames are registered for exact hosts, possibly a
        // subdomain (www.customer.com) — the zone is always the registrable
        // root. Cloudflare rejects zone creation for subdomains.
        $zoneName = $this->registrableDomain($domain);

        $zone = $this->findZone($zoneName);
        $created = false;

        if (!$zone) {
            try {
                $response = $this->client()->post("{$this->baseUrl}/zones", [
                    'name' => $zoneName,
                    'account' => ['id' => $this->accountId],
                    'type' => 'full',
                ]);
                $json = $response->json();

                Log::info('Cloudflare zone create', ['zone' => $zoneName, 'status' => $response->status()]);

                if ($response->successful() && ($json['success'] ?? false)) {
                    $zone = $this->mapZone($json['result'] ?? []);
                    $created = true;
                } else {
                    return [false, $this->errorMessage($json, $response->status()), null];
                }
            } catch (\Throwable $e) {
                Log::error('Cloudflare zone create exception', ['zone' => $zoneName, 'error' => $e->getMessage()]);
                return [false, 'Cloudflare request failed: ' . $e->getMessage(), null];
            }
        }

        [$recordOk, $recordMessage] = $this->ensureCnameRecord($zone['id'], $domain);

        $message = ($created
            ? "Zone \"{$zoneName}\" created in our Cloudflare account."
            : "Zone \"{$zoneName}\" already exists in our Cloudflare account.")
            . ' ' . $recordMessage;

        // A failed record write is reported but the zone still returns —
        // the sync scheduler retries the record on every run, so a
        // transient DNS-API error can never strand the flow.
        return [$recordOk, $message, $zone];
    }

    /**
     * Look a zone up by name in our account. Null when absent or on error.
     */
    public function findZone(string $zoneName): ?array
    {
        if (!$this->zoneProvisioningEnabled() || $zoneName === '') {
            return null;
        }

        try {
            $response = $this->client()->get("{$this->baseUrl}/zones", [
                'name' => $zoneName,
                'account.id' => $this->accountId,
            ]);
            $json = $response->json();
            if ($response->successful() && ($json['success'] ?? false)) {
                foreach (($json['result'] ?? []) as $row) {
                    if (strcasecmp((string) ($row['name'] ?? ''), $zoneName) === 0) {
                        return $this->mapZone($row);
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::error('Cloudflare zone find exception', ['zone' => $zoneName, 'error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Fetch a zone by ID. Null when missing or on API failure (callers treat
     * null as "cannot verify", not "gone").
     */
    public function getZone(string $zoneId): ?array
    {
        if (!$this->isConfigured() || $zoneId === '') {
            return null;
        }

        try {
            $response = $this->client()->get("{$this->baseUrl}/zones/{$zoneId}");
            $json = $response->json();
            if ($response->successful() && ($json['success'] ?? false)) {
                return $this->mapZone($json['result'] ?? []);
            }
        } catch (\Throwable $e) {
            Log::error('Cloudflare zone get exception', ['id' => $zoneId, 'error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Make sure the domain's CNAME to the SaaS target exists inside the
     * given zone. Conflicting records on the same name (A/AAAA/CNAME —
     * typically auto-imported from the old DNS host) are replaced: this zone
     * exists solely to route the domain to our platform, and a leftover A
     * record would silently point the live domain at a dead server.
     * DNS-only (unproxied) on purpose — the custom hostname's edge
     * certificate does the proxying. Returns [ok(bool), message(string)].
     */
    protected function ensureCnameRecord(string $zoneId, string $domain): array
    {
        $target = $this->cnameTarget();
        if ($target === '') {
            return [false, 'CLOUDFLARE_CNAME_TARGET is not configured.'];
        }

        try {
            $response = $this->client()->get("{$this->baseUrl}/zones/{$zoneId}/dns_records", [
                'name' => $domain,
            ]);
            $json = $response->json();
            if (!$response->successful() || !($json['success'] ?? false)) {
                return [false, $this->errorMessage($json, $response->status())];
            }

            foreach (($json['result'] ?? []) as $record) {
                $type = strtoupper((string) ($record['type'] ?? ''));
                if ($type === 'CNAME' && TenantResolver::normalizeHost((string) ($record['content'] ?? '')) === $target) {
                    return [true, "CNAME {$domain} -> {$target} already exists."];
                }
                if (in_array($type, ['A', 'AAAA', 'CNAME'], true)) {
                    $this->client()->delete("{$this->baseUrl}/zones/{$zoneId}/dns_records/{$record['id']}");
                    Log::info('Cloudflare replaced conflicting DNS record', [
                        'zone_id' => $zoneId,
                        'name' => $domain,
                        'type' => $type,
                        'content' => $record['content'] ?? null,
                    ]);
                }
            }

            $response = $this->client()->post("{$this->baseUrl}/zones/{$zoneId}/dns_records", [
                'type' => 'CNAME',
                'name' => $domain,
                'content' => $target,
                'ttl' => 1, // auto
                'proxied' => false,
            ]);
            $json = $response->json();
            if ($response->successful() && ($json['success'] ?? false)) {
                Log::info('Cloudflare CNAME record created', ['zone_id' => $zoneId, 'name' => $domain, 'target' => $target]);
                return [true, "CNAME {$domain} -> {$target} created automatically."];
            }

            return [false, $this->errorMessage($json, $response->status())];
        } catch (\Throwable $e) {
            Log::error('Cloudflare CNAME ensure exception', ['zone_id' => $zoneId, 'domain' => $domain, 'error' => $e->getMessage()]);
            return [false, 'Cloudflare request failed: ' . $e->getMessage()];
        }
    }

    /**
     * The registrable root of a host: "www.customer.com" -> "customer.com".
     * Handles common two-part public suffixes (co.uk, com.au, on.ca, ...)
     * well enough for the TLDs our customers use; everything else keeps the
     * last two labels.
     */
    protected function registrableDomain(string $host): string
    {
        $labels = explode('.', $host);
        $count = count($labels);
        if ($count <= 2) {
            return $host;
        }

        $lastTwo = implode('.', array_slice($labels, -2));
        $twoPartSuffixes = ['co.uk', 'org.uk', 'me.uk', 'com.au', 'net.au', 'org.au', 'co.nz', 'co.in', 'com.pk'];
        $take = in_array($lastTwo, $twoPartSuffixes, true) ? 3 : 2;

        return implode('.', array_slice($labels, -min($take, $count)));
    }

    /**
     * Normalize Cloudflare's zone payload to the fields the app uses.
     */
    protected function mapZone(array $row): array
    {
        return [
            'id' => $row['id'] ?? null,
            'name' => $row['name'] ?? null,
            // 'pending' until the nameservers point at Cloudflare, then 'active'.
            'status' => $row['status'] ?? null,
            'name_servers' => array_values($row['name_servers'] ?? []),
        ];
    }

    public function isAdminHost(string $hostname): bool
    {
        return in_array(TenantResolver::normalizeHost($hostname), TenantResolver::adminHosts(), true);
    }

    /**
     * Purge Cloudflare's edge cache for one customer domain so content and
     * settings changes show on the live site immediately. Tries the
     * hosts-based purge first (one call covers every URL on the domain);
     * plans without it fall back to purging the domain's root URLs by file.
     */
    public function purgeDomainCache(string $domain): array
    {
        $domain = TenantResolver::normalizeHost($domain);
        if ($domain === '') {
            return [false, 'No domain provided.'];
        }
        if (!$this->isConfigured()) {
            return [false, 'Cloudflare is not configured.'];
        }

        $hosts = array_values(array_unique([$domain, 'www.' . $domain]));

        try {
            if ($this->requestPurge(['hosts' => $hosts])) {
                Log::info('Cloudflare cache purged by host', ['hosts' => $hosts]);
                return [true, "Cloudflare cache purged for {$domain}."];
            }

            $files = [];
            foreach ($hosts as $host) {
                $files[] = "https://{$host}/";
                $files[] = "http://{$host}/";
            }
            if ($this->requestPurge(['files' => $files])) {
                Log::info('Cloudflare cache purged by URL', ['files' => $files]);
                return [true, "Cloudflare cache purged for {$domain}."];
            }

            Log::warning('Cloudflare cache purge failed', ['domain' => $domain]);
            return [false, "Cloudflare cache purge failed for {$domain}."];
        } catch (\Throwable $e) {
            Log::error('Cloudflare cache purge exception', ['domain' => $domain, 'error' => $e->getMessage()]);
            return [false, 'Cloudflare request failed: ' . $e->getMessage()];
        }
    }

    protected function requestPurge(array $payload): bool
    {
        $response = $this->client()->post("{$this->baseUrl}/zones/{$this->zoneId}/purge_cache", $payload);

        return $response->successful() && ($response->json()['success'] ?? false);
    }

    /**
     * Normalize Cloudflare's hostname payload to the fields the app uses.
     */
    protected function mapHostname(array $row): array
    {
        return [
            'id' => $row['id'] ?? null,
            'hostname' => $row['hostname'] ?? null,
            // 'active' | 'pending' | 'moved' | 'deleted' ...
            'status' => $row['status'] ?? null,
            // 'initializing' | 'pending_validation' | 'active' ...
            'ssl_status' => $row['ssl']['status'] ?? null,
            'ssl_validation_errors' => array_values(array_filter(array_map(
                fn ($e) => $e['message'] ?? null,
                $row['ssl']['validation_errors'] ?? []
            ))),
            'verification_errors' => $row['verification_errors'] ?? [],
            'ownership_verification' => $row['ownership_verification'] ?? null,
            'created_at' => $row['created_at'] ?? null,
        ];
    }

    protected function errorMessage(?array $json, int $status): string
    {
        $errors = array_map(
            fn ($e) => trim(($e['code'] ?? '') . ' ' . ($e['message'] ?? '')),
            $json['errors'] ?? []
        );

        return 'Cloudflare API returned ' . $status
            . (!empty($errors) ? ': ' . implode(' | ', $errors) : '.');
    }

    protected function client(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::withToken($this->token)
            ->acceptJson()
            ->timeout(20);
    }
}
