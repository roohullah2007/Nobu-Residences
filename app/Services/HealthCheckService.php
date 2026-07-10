<?php

namespace App\Services;

use App\Models\Website;

/**
 * Verifies a website's custom-domain health against Cloudflare:
 * hostname registration, SSL state, verification status, and ownership.
 * Read-only — never mutates Cloudflare or the database.
 */
class HealthCheckService
{
    public function __construct(protected CloudflareService $cloudflare)
    {
    }

    /**
     * Health snapshot for one website. Shape:
     * [
     *   'configured'        => bool,   Cloudflare credentials present
     *   'has_domain'        => bool,
     *   'hostname_exists'   => bool|null,  null = could not verify
     *   'ssl_active'        => bool|null,
     *   'ssl_status'        => ?string,    Cloudflare's raw ssl status
     *   'status'            => ?string,    Cloudflare's hostname status
     *   'ownership_verified'=> bool|null,
     *   'errors'            => string[],   validation/verification errors
     *   'hostname'          => ?array,     raw mapped hostname payload
     * ]
     */
    public function checkWebsite(Website $website): array
    {
        $result = [
            'configured' => $this->cloudflare->isConfigured(),
            'has_domain' => !empty($website->domain),
            'hostname_exists' => null,
            'ssl_active' => null,
            'ssl_status' => null,
            'status' => null,
            'ownership_verified' => null,
            'errors' => [],
            'hostname' => null,
        ];

        if (!$result['configured'] || !$result['has_domain']) {
            return $result;
        }

        // Prefer the stored ID; fall back to a name lookup so health checks
        // still work for rows provisioned before the ID was persisted.
        $hostname = $website->cloudflare_hostname_id
            ? $this->cloudflare->getCustomHostname($website->cloudflare_hostname_id)
            : null;
        $hostname ??= $this->cloudflare->findCustomHostname((string) $website->domain);

        if (!$hostname) {
            $result['hostname_exists'] = false;
            $result['errors'][] = 'Custom hostname is not registered on Cloudflare.';
            return $result;
        }

        $result['hostname'] = $hostname;
        $result['hostname_exists'] = true;
        $result['status'] = $hostname['status'];
        $result['ssl_status'] = $hostname['ssl_status'];
        $result['ssl_active'] = $hostname['ssl_status'] === 'active';
        // Ownership is proven once Cloudflare marks the hostname active;
        // while pending, the ownership_verification record is what the
        // customer still needs to satisfy (the CNAME covers it for
        // HTTP-validated hostnames).
        $result['ownership_verified'] = $hostname['status'] === 'active';

        foreach ($hostname['ssl_validation_errors'] as $err) {
            $result['errors'][] = $err;
        }
        foreach ((array) $hostname['verification_errors'] as $err) {
            $result['errors'][] = is_string($err) ? $err : json_encode($err);
        }

        return $result;
    }
}
