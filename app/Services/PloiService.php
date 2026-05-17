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

        $endpoint = "{$this->baseUrl}/servers/{$this->serverId}/sites/{$targetSite}/aliases";

        try {
            $response = $this->client()->post($endpoint, [
                'domain' => $domain,
            ]);

            if ($response->successful()) {
                Log::info('Ploi alias added', ['domain' => $domain, 'site' => $targetSite]);

                if ($this->requestSsl) {
                    $this->requestSsl($domain, $targetSite);
                }

                return [true, 'Alias added on Ploi.', $response->json()];
            }

            // Already exists is fine
            if ($response->status() === 422 && str_contains((string) $response->body(), 'already')) {
                Log::info('Ploi alias already exists', ['domain' => $domain]);
                return [true, 'Alias already exists on Ploi.', $response->json()];
            }

            Log::warning('Ploi alias failed', [
                'domain' => $domain,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [false, "Ploi API returned {$response->status()}: {$response->body()}", $response->json()];
        } catch (\Throwable $e) {
            Log::error('Ploi alias exception', ['domain' => $domain, 'error' => $e->getMessage()]);
            return [false, 'Ploi request failed: ' . $e->getMessage(), null];
        }
    }

    /**
     * Issue a Let's Encrypt certificate for a domain on the given site.
     */
    public function requestSsl(string $domain, ?string $siteId = null): array
    {
        $targetSite = $siteId ?: $this->siteId;

        if (!$this->isConfigured() || empty($targetSite)) {
            return [false, 'Ploi not configured.', null];
        }

        $endpoint = "{$this->baseUrl}/servers/{$this->serverId}/sites/{$targetSite}/certificates/letsencrypt";

        try {
            $response = $this->client()->post($endpoint, [
                'certificates' => [$domain],
            ]);

            if ($response->successful()) {
                Log::info('Ploi SSL requested', ['domain' => $domain]);
                return [true, 'SSL requested.', $response->json()];
            }

            Log::warning('Ploi SSL failed', [
                'domain' => $domain,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [false, "Ploi SSL returned {$response->status()}", $response->json()];
        } catch (\Throwable $e) {
            Log::error('Ploi SSL exception', ['error' => $e->getMessage()]);
            return [false, $e->getMessage(), null];
        }
    }

    protected function client()
    {
        return Http::withToken($this->token)
            ->acceptJson()
            ->timeout(20);
    }

    protected function normalizeDomain(string $domain): string
    {
        $domain = trim($domain);
        $domain = preg_replace('#^https?://#i', '', $domain);
        return rtrim($domain, '/');
    }
}
