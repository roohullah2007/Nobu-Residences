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
    protected string $baseUrl;

    public function __construct()
    {
        $this->token = (string) config('services.cloudflare.token', '');
        $this->zoneId = (string) config('services.cloudflare.zone_id', '');
        $this->baseUrl = rtrim((string) config('services.cloudflare.base_url', 'https://api.cloudflare.com/client/v4'), '/');
    }

    public function isConfigured(): bool
    {
        return $this->token !== '' && $this->zoneId !== '';
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

    public function isAdminHost(string $hostname): bool
    {
        return in_array(TenantResolver::normalizeHost($hostname), TenantResolver::adminHosts(), true);
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
