# Custom Domains via Cloudflare for SaaS

The Ploi alias + certbot integration has been fully removed. Customer domains
now run through Cloudflare Custom Hostnames.

## How it works

```
Admin creates website with custom domain
        |
Laravel -> CloudflareService::createCustomHostname()
        |   POST /zones/{zone_id}/custom_hostnames  (ssl: http/dv)
        |
cloudflare_hostname_id stored on the website row
        |
Status page shows the ONE record the customer needs:
        |   CNAME  customer.com  ->  CLOUDFLARE_CNAME_TARGET
        |
SyncCustomHostnameStatusJob polls (30s..10m backoff)
cloudflare:sync-hostnames scheduler covers the long tail (every 5 min)
        |
Cloudflare validates + issues the edge certificate
        |
cloudflare_status = active  ->  website is live on https://customer.com
```

The origin server only ever serves the admin host (`ADMIN_HOST`,
nobu.wpbun.xyz). Cloudflare proxies each custom hostname to it; Laravel's
`TenantResolver` picks the website by Host header exactly as before. Unknown
hosts 404. Customer domains are unique (DB unique index + validation), and the
admin host can never be registered as a custom hostname
(`CloudflareService` refuses it).

## Why this is safer than the old Ploi/certbot setup

- Every custom hostname has its OWN edge certificate. Adding, retrying or
  deleting one domain can never affect the admin domain or another tenant
  (the old setup shared one certbot cert file across the whole nginx site).
- No nginx `server_name` list to grow or corrupt; no server reload per domain.
- The customer needs exactly one CNAME record; validation and renewal are
  Cloudflare's job.

## Components

| Piece | Purpose |
| --- | --- |
| `App\Services\CloudflareService` | ALL Cloudflare API calls (create/find/get/delete/list custom hostnames) |
| `App\Services\HealthCheckService` | Read-only verification: hostname exists, SSL active, verification, ownership |
| `App\Jobs\SyncCustomHostnameStatusJob` | Queued polling after create/update until active |
| `cloudflare:sync-hostnames` (every 5 min) | Activates pending hostnames once the CNAME lands |
| `cloudflare:health` (weekly + manual) | Health report across all custom domains |
| `websites.cloudflare_*` columns | hostname_id, status (pending_dns/active/failed), ssl_status, last_error, active_at |

## Environment

```
CLOUDFLARE_API_TOKEN=   # API token with Zone > SSL and Certificates > Edit on the SaaS zone
CLOUDFLARE_ZONE_ID=     # the zone that has Cloudflare for SaaS enabled
CLOUDFLARE_CNAME_TARGET=nobu.wpbun.xyz   # fallback origin hostname customers CNAME to
```

Cloudflare dashboard prerequisites (one-time):
1. Enable **SSL/TLS -> Custom Hostnames** (Cloudflare for SaaS) on the zone.
2. Set the **fallback origin** to the origin server (the record behind
   `CLOUDFLARE_CNAME_TARGET`, proxied).

## Deploying this change

1. `git pull`
2. Set the three `CLOUDFLARE_*` variables in `.env`; delete all `PLOI_*` ones.
3. `php artisan migrate` (drops `ploi_*` columns, adds `cloudflare_*`)
4. `php artisan config:cache`
5. Existing customer domains: open each website's status page or run
   `php artisan cloudflare:sync-hostnames` — hostnames are (re)registered
   automatically; customers must switch their old A records to the CNAME.
6. Ploi panel cleanup (manual, optional): remove old aliases/certificates
   from the site — the app no longer manages them.
