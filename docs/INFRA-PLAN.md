# Infrastructure Plan — Building Domains & Hosting Migration

Status: Part 1 (building domains) is **implemented** (July 2026). Part 2 (hosting
migration) remains a planning playbook for when we execute it.

---

## Part 1 — Building Domains (item #7)

> "How do I easily generate the building domains and implement the template into it?"

### What already exists

The platform is already multi-domain capable:

- **`websites` table** — each row is a site with its own `domain`, `slug`, branding
  (`brand_colors`, `fonts`, `logo_url`), SEO fields, contact info, and Ploi
  provisioning columns (`ploi_alias_status`, `ploi_ssl_status`, …).
- **Domain routing** — `app/Http/Middleware/HandleInertiaRequests.php` resolves the
  current website on every request:
  1. `?website={slug}` query parameter (preview/testing)
  2. `Host` header match against `websites.domain` (www. stripped)
  3. Fallback to the default website (`is_default = true`)
- **Same template everywhere** — all sites render through the same Laravel/React
  codebase; branding and content differ per `websites` row.
- **Admin UI** — `/admin/websites` create/edit pages already manage these rows.
- **`php artisan` command `InitializeWebsite`** exists for setting up new websites.

### How to launch a building domain (implemented — one-click flow)

1. **Admin → Buildings → Edit → "Launch Website"** (header button). It opens
   Admin → Websites → Create with the building preselected and everything
   prefilled (name, agent, branding inherited from the default site).
   - A building that already has a site shows a green "Website: {domain}"
     badge linking to its edit page instead.
2. **Enter the domain** (bought domain or a subdomain), submit. On create:
   - The home page content is auto-personalized from the building (hero
     title/image, about/overview from the building description, key facts from
     floors/units/year/sqft, footer/FAQ copy) — all editable afterwards in
     Admin → Websites → Edit Home Page.
   - Ploi provisioning runs automatically: server alias added synchronously,
     SSL certificate queued (`RequestPloiSslJob`, retries with backoff). The
     created-status page shows both states with retry buttons.
     Requires `PLOI_API_TOKEN` / `PLOI_SERVER_ID` / `PLOI_SITE_ID` in `.env`.
3. **DNS**: point the domain's A record at the server IP (or CNAME the
   subdomain). SSL issuance succeeds once DNS resolves to the server.
4. **Homepage style** — the "Use Building Page as Homepage" toggle (on by
   default in the launch flow) makes `/` serve the full BuildingDetail page
   (listings, price history, amenities). Toggle it off to serve the classic
   Welcome template homepage with the building's personalized content instead.
   The default (main) site always keeps the Welcome design regardless of flags.

### Remaining optional improvements

| Gap | Change |
| --- | --- |
| Content duplication risk | Per-building sites should canonical-link listing pages back to the main site OR carry unique content (building description, FAQs via the `faqs` system) to avoid duplicate-content SEO penalties |
| Sitemap/robots per domain | Generate per-website sitemap.xml scoped by domain |
| Per-site listing scoping | Property search on a building site currently searches the whole market (arguably desirable); scope by building if the client prefers |

### Recommended rollout

Start with **subdomains** (`{building}.yourdomain.com`) — one wildcard DNS record
+ one wildcard SSL cert covers every building with zero per-site DNS work. Buy
dedicated domains only for flagship buildings that justify the SEO investment.

---

## Part 2 — Hosting Migration: Cloudflare / AWS (item #8)

> "Let's move all the website codes, dashboards, backends etc. to Cloudflare or AWS
> so I can take over."

### Current footprint (audited July 2026)

| Component | Current state |
| --- | --- |
| App | Laravel 11 + Inertia/React (Vite build, SSR bundle) |
| Server | Laragon local dev; production on wpbun.xyz host (Ploi hints) |
| Database | MySQL (`nobu-residences`), dump-import history (self-repair migrations exist) |
| Queue | `database` driver — needs a running `queue:work` worker |
| Scheduler | `routes/console.php` — MLS sync, image sync, geocoding, saved-search alerts (08:00/18:00); needs cron `schedule:run` |
| Cache/Sessions | database driver |
| File storage | local `storage/` + `public/` (S3 config present but disabled) |
| Email | `MAIL_MAILER=log` — **not sending real email yet** |
| External APIs | Repliers (MLS data + images), Google Maps/Places, Gemini AI, WalkScore |
| CI/CD | none (no GitHub Actions) |

### Recommendation

**PHP Laravel cannot run on Cloudflare Workers/Pages** — Cloudflare is not a
compute option for this app. The right split is:

- **Compute: AWS** (or any VPS) running Linux + Nginx + PHP-FPM
- **Cloudflare in front** for DNS, CDN, WAF, and free SSL — this also makes
  Part 1's building domains trivial (all domains proxied through one CF account)

Suggested AWS shape (small, take-over-friendly):

| Need | Service | Notes |
| --- | --- | --- |
| App server | EC2 t3.small / Lightsail 2GB | Managed via **Ploi or Laravel Forge** so a non-sysadmin can operate it |
| Database | RDS MySQL 8 (db.t3.micro) | Automated backups; or MySQL on the same VPS to start |
| Storage | S3 bucket | `FILESYSTEM_DISK=s3`; config already in repo |
| Email | SES (or Resend) | Change `MAIL_MAILER` + creds — all app email code is already queued/provider-agnostic |
| Queue worker | Supervisor `php artisan queue:work` | Forge/Ploi UI manages this |
| Cron | `* * * * * php artisan schedule:run` | Forge/Ploi UI manages this |
| DNS/CDN/SSL | Cloudflare | Orange-cloud proxy, Full (strict) TLS |

### Migration runbook

1. **Access handover**: GitHub repo access, domain registrar, Cloudflare account,
   AWS account (billing under client), Repliers/Google/Gemini API keys.
2. **Provision** server via Forge/Ploi → connect GitHub repo → zero-downtime
   deploy script: `composer install --no-dev`, `npm ci && npm run build`,
   `php artisan migrate --force`, `php artisan config:cache route:cache view:cache`,
   restart queue.
3. **Database**: `mysqldump` from current host → import into RDS. The repo's
   migrations already self-repair dump-imported DBs (framework tables,
   AUTO_INCREMENT fixes — see commits `5543375`, `7ce5d93`) — run
   `php artisan migrate --force` after import and verify with `migrate:status`.
4. **Env**: copy `.env`, then change: `APP_URL`, DB creds, `FILESYSTEM_DISK=s3`
   + AWS keys, `MAIL_MAILER=smtp` + SES creds, real `REPLIERS_API_KEY`
   (the current local one returns 401).
5. **Storage**: sync `storage/app/public` and `public/images` uploads to S3 or
   the new server; `php artisan storage:link`.
6. **Workers/cron**: enable queue worker + scheduler in Forge/Ploi; verify with
   `php artisan schedule:list` and `php artisan queue:monitor`.
7. **Smoke test on a staging subdomain** (e.g. `staging.` in Cloudflare):
   search + map pins, property detail (AI description generation), registration
   email (check it actually sends now), saved-search alert dry-run
   (`php artisan alerts:send-saved-search --dry-run`), admin panel.
8. **DNS cutover**: lower TTL a day before → point Cloudflare records at the new
   server → monitor logs. **Rollback** = flip DNS back (keep the old host warm
   for a week; freeze admin content edits during the cutover window or re-sync
   the DB after).
9. **Post-cutover**: enable RDS automated backups + a nightly `mysqldump` to S3,
   set up uptime monitoring (BetterStack/UptimeRobot) and error tracking
   (Sentry has a first-class Laravel SDK).

### Cost ballpark (monthly)

- Lightsail/EC2 small: $10–25
- RDS micro: $15–25 (or $0 if DB on the VPS initially)
- S3 + SES: < $5 at current volume
- Cloudflare: free tier is sufficient
- Forge ($12) or Ploi ($10) — worth it for the client to self-operate

**Total: roughly $40–70/month** for a setup the client can take over without a
dedicated sysadmin.
