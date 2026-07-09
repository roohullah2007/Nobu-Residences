<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Website;
use App\Models\WebsitePage;
use App\Models\Icon;
use App\Models\AgentInfo;
use App\Services\PloiService;
use App\Services\GeminiAIService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class WebsiteManagementController extends Controller
{
    /**
     * Display websites listing
     */
    public function index(): Response
    {
        $websites = Website::with('pages')->orderBy('is_default', 'desc')->orderBy('name')->get();

        return Inertia::render('Admin/Websites/Index', [
            'title' => 'Website Management',
            'websites' => $websites
        ]);
    }

    /**
     * Show website details
     */
    public function show(Website $website): Response
    {
        $website->load(['pages', 'agentInfo']);

        return Inertia::render('Admin/Websites/Show', [
            'title' => "Website: {$website->name}",
            'website' => $website
        ]);
    }

    /**
     * Show create website form
     */
    public function create(): Response
    {
        $buildings = Building::select(
                'id', 'name', 'slug', 'address', 'city', 'description',
                'main_image', 'agent_name', 'agent_title', 'agent_phone',
                'agent_email', 'agent_brokerage', 'agent_image', 'website_url'
            )
            ->orderBy('name')
            ->get();

        // Default branding + agent from the default website (typically Nobu).
        // Looking up the agent by name was returning the FIRST "Jatin Gill"
        // row by ID, which was a stale row from the older "Broker /
        // Property.ca" setup rather than the current "Agent / RE/MAX" one
        // saved against the default website. Source-of-truth is the
        // is_default site's agentInfo relation.
        $nobu = Website::where('is_default', true)->with('agentInfo')->first();
        $defaultAgent = $nobu?->agentInfo;

        $defaultAgentPayload = $defaultAgent
            ? [
                'agent_name' => $defaultAgent->agent_name,
                'agent_title' => $defaultAgent->agent_title,
                'agent_phone' => $defaultAgent->agent_phone,
                'brokerage' => $defaultAgent->brokerage,
                'profile_image' => $defaultAgent->profile_image,
            ]
            : [
                'agent_name' => null,
                'agent_title' => null,
                'agent_phone' => null,
                'brokerage' => null,
                'profile_image' => null,
            ];

        $defaultBranding = [
            'logo_url' => $nobu?->logo_url ?: $nobu?->logo ?: '/assets/logo.png',
            'favicon_url' => $nobu?->favicon_url ?: '/favicon.ico',
        ];

        // Default contact_info / social_media inherited from the default
        // site so new sites pre-fill with Nobu's phone/email/address +
        // social handles rather than starting blank.
        $defaultContactInfo = is_array($nobu?->contact_info) ? $nobu->contact_info : [];
        $defaultSocialMedia = is_array($nobu?->social_media) ? $nobu->social_media : [];

        return Inertia::render('Admin/Websites/Create', [
            'title' => 'Create New Website',
            'buildings' => $buildings,
            'defaultAgent' => $defaultAgentPayload,
            'defaultBranding' => $defaultBranding,
            'defaultContactInfo' => $defaultContactInfo,
            'defaultSocialMedia' => $defaultSocialMedia,
            'ploiEnabled' => config('services.ploi.auto_provision') && !empty(config('services.ploi.token')),
            // Origin server IP for the DNS instruction block under the Custom
            // Domain field (PLOI_SERVER_IP env, else Ploi API; the frontend
            // falls back to the documented IP when null).
            'serverIp' => app(PloiService::class)->getServerIp(),
            // "Launch Website" shortcut from the Building edit page
            'preselectedBuildingId' => request()->query('building_id'),
        ]);
    }

    /**
     * Generate SEO metadata (title/description/keywords) for the Create form.
     */
    public function aiGenerateSeo(Request $request, GeminiAIService $ai)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'building_id' => 'nullable|exists:buildings,id',
        ]);

        $context = [
            'name' => $request->input('name') ?: 'New Website',
        ];

        if ($buildingId = $request->input('building_id')) {
            $building = Building::find($buildingId);
            if ($building) {
                $context['building_name'] = $building->name;
                $context['address'] = $building->address;
                $context['city'] = $building->city;
                $context['description'] = $building->description;
            }
        }

        $seo = $ai->generateSeoMeta($context);

        return response()->json($seo);
    }

    /**
     * Store new website
     */
    public function store(Request $request, PloiService $ploi): RedirectResponse
    {
        // Parse nested keys from FormData (e.g., 'brand_colors.primary')
        $data = $request->all();

        // Auto-generate slug from name if missing (we no longer expose the slug field in the UI)
        if (empty($data['slug']) && !empty($data['name'])) {
            $base = Str::slug($data['name']);
            $slug = $base;
            $i = 2;
            while (Website::where('slug', $slug)->exists()) {
                $slug = $base . '-' . $i++;
            }
            $data['slug'] = $slug;
        }

        // Convert string booleans to actual booleans
        foreach (['is_default', 'is_active'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN);
            }
        }

        // Handle nested keys from FormData (e.g., 'brand_colors.primary')
        $nestedData = [];
        foreach ($data as $key => $value) {
            if (strpos($key, '.') !== false) {
                $keys = explode('.', $key);
                $current = &$nestedData;
                foreach ($keys as $index => $k) {
                    if ($index === count($keys) - 1) {
                        $current[$k] = $value;
                    } else {
                        if (!isset($current[$k])) {
                            $current[$k] = [];
                        }
                        $current = &$current[$k];
                    }
                }
                unset($data[$key]);
            }
        }

        // Merge nested data back
        foreach ($nestedData as $key => $value) {
            if (!isset($data[$key])) {
                $data[$key] = [];
            }
            $data[$key] = array_merge(is_array($data[$key]) ? $data[$key] : [], $value);
        }

        // Merge the parsed data back into the request
        $request->merge($data);

        // Convert empty string to null for the building-id nullable fields, then validate
        foreach (['homepage_building_id', 'building_id'] as $f) {
            if (isset($data[$f]) && $data[$f] === '') {
                $data[$f] = null;
                $request->merge([$f => null]);
            }
        }
        if (array_key_exists('use_building_as_homepage', $data)) {
            $request->merge([
                'use_building_as_homepage' => filter_var($data['use_building_as_homepage'], FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:websites',
            'domain' => 'nullable|string|max:255',
            'building_id' => 'nullable|exists:buildings,id',
            'homepage_building_id' => 'nullable|exists:buildings,id',
            'use_building_as_homepage' => 'boolean',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'logo_file' => 'nullable|file|mimes:jpg,jpeg,png,svg,webp|max:2048',
            'logo_url' => 'nullable|string|max:255',
            'favicon_file' => 'nullable|file|mimes:jpg,jpeg,png,ico,svg|max:1024',
            'favicon_url' => 'nullable|string|max:255',
            'brand_colors' => 'nullable|array',
            'fonts' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'contact_info' => 'nullable|array',
            'agent_name' => 'nullable|string|max:255',
            'agent_title' => 'nullable|string|max:255',
            'agent_phone' => 'nullable|string|max:255',
            'brokerage' => 'nullable|string|max:255',
            'agent_profile_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'social_media' => 'nullable|array',
            'description' => 'nullable|string',
            'business_hours' => 'nullable|array',
            'timezone' => 'nullable|string|max:255',
            // Raw tracking snippets (e.g. Follow Up Boss pixel) — intentionally
            // unsanitized; only admins can write it and it renders in <head>.
            'tracking_scripts' => 'nullable|string|max:20000',
        ]);

        // If user picked a building in step 1 and didn't override the homepage_building_id, copy it across.
        // use_building_as_homepage deliberately defaults to FALSE: new sites
        // serve the same Home page design as the default (Nobu) site, with
        // hero/facts/listings resolved dynamically from homepage_building_id.
        // Admins can still opt in to the BuildingDetail-as-homepage layout
        // via the checkbox on Admin > Websites > Edit.
        if (!empty($validated['building_id']) && empty($validated['homepage_building_id'])) {
            $validated['homepage_building_id'] = $validated['building_id'];
            $validated['use_building_as_homepage'] = $validated['use_building_as_homepage'] ?? false;
        }
        unset($validated['building_id']);

        // If this is set as default, remove default from other websites
        if ($validated['is_default'] ?? false) {
            Website::where('is_default', true)->update(['is_default' => false]);
        }

        // New sites inherit the default website's full color palette + fonts
        // when the admin didn't override them. This keeps every new site
        // visually consistent with Nobu out of the box (navbar bg, button
        // colors, footer colors, hero overlay, etc.) instead of falling back
        // to the model's hardcoded skeleton defaults. When the new site IS
        // the default site, there's no inheritance to do — skip.
        if (empty($validated['is_default'])) {
            $defaultSite = Website::where('is_default', true)->first();
            if ($defaultSite) {
                foreach (['brand_colors', 'fonts'] as $field) {
                    if (empty($validated[$field]) && !empty($defaultSite->{$field})) {
                        $validated[$field] = $defaultSite->{$field};
                    }
                }
            }
        }

        // Handle logo file upload
        if ($request->hasFile('logo_file')) {
            $logoFile = $request->file('logo_file');
            $logoFileName = 'logo_' . uniqid() . '_' . time() . '.' . $logoFile->getClientOriginalExtension();

            // Store in public/assets directory
            $assetsPath = public_path('assets');
            if (!file_exists($assetsPath)) {
                mkdir($assetsPath, 0755, true);
            }
            $logoFile->move($assetsPath, $logoFileName);

            $validated['logo'] = '/assets/' . $logoFileName;
            $validated['logo_url'] = '/assets/' . $logoFileName;
        }
        unset($validated['logo_file']);

        // Handle favicon file upload
        if ($request->hasFile('favicon_file')) {
            $faviconFile = $request->file('favicon_file');
            $faviconFileName = 'favicon_' . uniqid() . '_' . time() . '.' . $faviconFile->getClientOriginalExtension();

            // Store in public/assets directory
            $assetsPath = public_path('assets');
            if (!file_exists($assetsPath)) {
                mkdir($assetsPath, 0755, true);
            }
            $faviconFile->move($assetsPath, $faviconFileName);

            $validated['favicon_url'] = '/assets/' . $faviconFileName;
        }
        unset($validated['favicon_file']);

        // Remove agent fields from validated array as they're handled separately
        $agentData = [
            'agent_name' => $validated['agent_name'] ?? null,
            'agent_title' => $validated['agent_title'] ?? null,
            'agent_phone' => $validated['agent_phone'] ?? null,
            'brokerage' => $validated['brokerage'] ?? null,
        ];
        unset($validated['agent_name'], $validated['agent_title'], $validated['agent_phone'],
              $validated['brokerage'], $validated['agent_profile_image']);

        $website = Website::create($validated);

        // Handle agent profile image upload
        $agentImagePath = null;
        if ($request->hasFile('agent_profile_image')) {
            $agentImageFile = $request->file('agent_profile_image');

            // Ensure storage directory exists
            if (!Storage::disk('public')->exists('agents')) {
                Storage::disk('public')->makeDirectory('agents');
            }

            // Generate unique filename for agent image
            $agentImageFileName = uniqid() . '_' . time() . '.' . $agentImageFile->getClientOriginalExtension();

            // Store the file with specific filename. Use a relative
            // /storage/ URL (not Storage::url()) so the saved value is
            // host-agnostic — Storage::url() bakes APP_URL into the DB,
            // which breaks the image when the record was saved with a
            // different host (e.g. a localhost APP_URL) than it is
            // served from.
            $agentImagePath = $agentImageFile->storeAs('agents', $agentImageFileName, 'public');
            $agentData['profile_image'] = '/storage/' . $agentImagePath;
        }

        // Create agent info if any agent data is provided
        if ($agentData['agent_name'] || $agentData['agent_title'] || $agentData['agent_phone'] ||
            $agentData['brokerage'] || isset($agentData['profile_image'])) {
            AgentInfo::create([
                'website_id' => $website->id,
                ...$agentData
            ]);
        }

        // Create default home page — personalized from the linked building
        // (name/city/image/facts) when this site was launched for one.
        WebsitePage::create([
            'website_id' => $website->id,
            'page_type' => 'home',
            'title' => "Home - {$website->name}",
            'content' => ($homepageBuilding = $website->homepageBuilding)
                ? WebsitePage::getDefaultHomeContentForBuilding($homepageBuilding)
                : WebsitePage::getDefaultHomeContent(),
            'is_active' => true,
            'sort_order' => 0,
        ]);

        $this->runProvisioning($website, $ploi);

        return redirect()->route('admin.websites.created', $website);
    }

    /**
     * Run the alias add (synchronous) and queue the SSL request (async with
     * 30s delay + retries). Persists per-step status on the Website row so
     * the status page reflects reality on every reload.
     */
    protected function runProvisioning(Website $website, PloiService $ploi): void
    {
        $report = [
            'db'    => ['ok' => true, 'message' => 'Website saved in the database.'],
            'ploi'  => ['ok' => null, 'message' => 'Skipped — no custom domain entered.'],
            'ssl'   => ['ok' => null, 'message' => 'Skipped — no custom domain entered.'],
        ];

        if (empty($website->domain)) {
            $website->update([
                'ploi_alias_status' => 'not_required',
                'ploi_ssl_status' => 'not_required',
                'ploi_last_error' => null,
            ]);
            session()->flash('website_created_report', $report);
            return;
        }

        if (!config('services.ploi.auto_provision') || !$ploi->isConfigured()) {
            $msg = 'Ploi auto-provisioning is disabled or PLOI_API_TOKEN / PLOI_SERVER_ID / PLOI_SITE_ID is missing in the .env.';
            $website->update([
                'ploi_alias_status' => 'failed',
                'ploi_ssl_status' => 'failed',
                'ploi_last_error' => $msg,
            ]);
            $report['ploi'] = ['ok' => false, 'message' => $msg];
            $report['ssl'] = ['ok' => false, 'message' => 'Skipped — Ploi not configured.'];
            session()->flash('website_created_report', $report);
            return;
        }

        // Alias is added synchronously so we can report it on the redirect.
        [$aliasOk, $aliasMsg] = $ploi->addAlias($website->domain);
        $report['ploi'] = ['ok' => $aliasOk, 'message' => $aliasMsg];

        if ($aliasOk) {
            $website->update([
                'ploi_alias_status' => 'added',
                'ploi_alias_added_at' => now(),
                'ploi_last_error' => null,
            ]);

            // SSL is queued — runs 30s later so the alias has time to settle,
            // and Laravel's queue auto-retries on failure with backoff.
            if (config('services.ploi.request_ssl', true)) {
                $website->update(['ploi_ssl_status' => 'queued']);
                \App\Jobs\RequestPloiSslJob::dispatch($website->id)
                    ->delay(now()->addSeconds(30));
                $report['ssl'] = [
                    'ok' => null,
                    'message' => "SSL queued — Let's Encrypt request will run in ~30s with automatic retries (30s/1m/2m/5m/10m backoff). Refresh this page in 1–2 minutes to see status.",
                ];
            } else {
                $website->update(['ploi_ssl_status' => 'not_required']);
                $report['ssl'] = ['ok' => null, 'message' => 'SSL not requested (PLOI_REQUEST_SSL=false).'];
            }
        } else {
            $website->update([
                'ploi_alias_status' => 'failed',
                'ploi_ssl_status' => 'pending',
                'ploi_last_error' => $aliasMsg,
            ]);
            $report['ssl'] = [
                'ok' => false,
                'message' => 'Skipped — SSL needs the alias to be added first.',
            ];
        }

        session()->flash('website_created_report', $report);
    }

    /**
     * Post-creation status page. Always queries Ploi for the *live* alias +
     * cert state so reloading shows the real picture (not stale flash data).
     */
    public function created(Website $website, PloiService $ploi): Response
    {
        $report = session('website_created_report');

        $domain = $website->domain;
        $aliases = [];
        $certificates = [];

        $ploiConfigured = (bool) (config('services.ploi.token') && config('services.ploi.server_id') && config('services.ploi.site_id'));

        if ($ploiConfigured) {
            $aliases = $ploi->listAliases();
            $certificates = $ploi->listCertificates();
        }

        // Derive a fresh "current state" report from what Ploi actually shows.
        // Canonical comparison (trim / lowercase / strip trailing dot): Ploi
        // may return the alias cased or padded differently from what the
        // admin typed, and a strict comparison then reports a present alias
        // as missing forever. $aliasListVerified distinguishes "Ploi answered
        // and the alias is absent" from "couldn't fetch the list" — a failed
        // fetch must never be presented as "not on Ploi".
        $canon = fn ($d) => strtolower(rtrim(trim((string) $d), '.'));
        $aliasListVerified = $ploiConfigured && $ploi->aliasListFetchOk;
        $hasAlias = $domain && in_array($canon($domain), array_map($canon, $aliases), true);
        $hasCert = false;
        if ($domain) {
            foreach ($certificates as $c) {
                foreach (($c['domains'] ?? []) as $d) {
                    if (strcasecmp($d, $domain) === 0) {
                        $hasCert = true;
                        break 2;
                    }
                }
            }
        }

        // Keep the persisted DB state in sync with what Ploi actually shows.
        // The sticky DB row was getting out of sync when an admin deleted the
        // alias directly in Ploi's UI: the front-end would still see
        // alias_status='added' and lock the Retry button as disabled. Trust
        // Ploi's live view as the source of truth whenever we can talk to it.
        if ($ploiConfigured && $domain) {
            $needsUpdate = [];
            if ($hasAlias && $website->ploi_alias_status !== 'added') {
                $needsUpdate['ploi_alias_status'] = 'added';
                $needsUpdate['ploi_alias_added_at'] = $website->ploi_alias_added_at ?: now();
            } elseif (!$hasAlias && $ploi->aliasListFetchOk && $website->ploi_alias_status === 'added') {
                // Only downgrade added→pending when Ploi actually answered the
                // alias-list call. A transient API failure returns an empty
                // list too, and treating that as "alias deleted" flips a
                // perfectly good alias back to Pending.
                $needsUpdate['ploi_alias_status'] = 'pending';
                $needsUpdate['ploi_alias_added_at'] = null;
            }
            if ($hasCert && $website->ploi_ssl_status !== 'issued') {
                $needsUpdate['ploi_ssl_status'] = 'issued';
                $needsUpdate['ploi_ssl_issued_at'] = $website->ploi_ssl_issued_at ?: now();
                $needsUpdate['ploi_last_error'] = null;
            }
            if (!empty($needsUpdate)) {
                $website->update($needsUpdate);
            }
        }

        $liveStatus = [
            'db'   => ['ok' => true, 'message' => 'Website is in the database.'],
            'ploi' => $domain
                ? ($hasAlias
                    ? ['ok' => true, 'message' => "Alias \"{$domain}\" is present on the Ploi site."]
                    : ($aliasListVerified
                        ? ['ok' => false, 'message' => "Alias \"{$domain}\" is NOT on the Ploi site yet. Click Retry below."]
                        : ($website->ploi_alias_status === 'added'
                            ? ['ok' => true, 'message' => "Alias \"{$domain}\" is marked as added. (Couldn't verify with Ploi right now — the live alias list was unavailable.)"]
                            : ['ok' => null, 'message' => "Couldn't verify the alias list with Ploi right now. Refresh in a moment — this is NOT a confirmation that the alias is missing."])))
                : ['ok' => null, 'message' => 'No custom domain set — nothing to add to Ploi.'],
            'ssl'  => $domain
                ? ($hasCert
                    ? ['ok' => true, 'message' => "Let's Encrypt certificate is issued and covers \"{$domain}\"."]
                    : ['ok' => false, 'message' => "No SSL certificate yet covers \"{$domain}\". Click Retry below (alias must be added first)."])
                : ['ok' => null, 'message' => 'No custom domain set — nothing to issue.'],
        ];

        // Persistent provisioning state from the DB — survives reloads and
        // reflects what the queued SSL job has done in the background.
        $persisted = [
            'alias_status' => $website->ploi_alias_status,
            'alias_added_at' => $website->ploi_alias_added_at ? $website->ploi_alias_added_at->toDateTimeString() : null,
            'ssl_status' => $website->ploi_ssl_status,
            'ssl_issued_at' => $website->ploi_ssl_issued_at ? $website->ploi_ssl_issued_at->toDateTimeString() : null,
            'last_error' => $website->ploi_last_error,
        ];

        // Fresh DNS lookup so the user sees what the server currently resolves
        // the domain to. This is the same view Ploi's resolver will get (give
        // or take cache TTL), so it tells the user whether a Retry SSL is
        // likely to succeed without having to guess.
        $dnsCheck = $this->lookupDomainIps($domain);
        if ($dnsCheck) {
            // Flag Cloudflare's orange-cloud proxy specifically: Let's Encrypt
            // can never validate through it, and the fix (gray-cloud the
            // record) is different from a plain wrong-IP A record.
            $dnsCheck['cloudflare'] = !empty(array_filter(
                $dnsCheck['ips'] ?? [],
                [PloiService::class, 'isCloudflareIp']
            ));
            $dnsCheck['server_ip'] = $ploiConfigured ? $ploi->getServerIp() : null;
        }

        return Inertia::render('Admin/Websites/Created', [
            'title' => 'Website Created',
            'website' => [
                'id' => $website->id,
                'name' => $website->name,
                'slug' => $website->slug,
                'domain' => $website->domain,
                'is_active' => $website->is_active,
                'created_at' => optional($website->created_at)->toDateTimeString(),
            ],
            // The most recent action (if any) plus the live current state.
            'report' => $report ?: $liveStatus,
            'liveStatus' => $liveStatus,
            'liveAliases' => $aliases,
            'liveAliasesVerified' => $aliasListVerified,
            'liveCertificates' => $certificates,
            'persisted' => $persisted,
            'dnsCheck' => $dnsCheck,
            'ploi' => [
                'configured' => $ploiConfigured,
                'auto_provision' => (bool) config('services.ploi.auto_provision'),
                'server_id' => config('services.ploi.server_id'),
                'site_id' => config('services.ploi.site_id'),
            ],
        ]);
    }

    /**
     * Fresh A/AAAA lookup for a domain. Returns:
     *   [ 'domain' => '...', 'ips' => ['157.180.26.95'], 'error' => null,
     *     'checked_at' => '2026-05-18 ...' ]
     * Returns null when there's no domain to check.
     */
    protected function lookupDomainIps(?string $domain): ?array
    {
        if (empty($domain)) {
            return null;
        }

        try {
            $records = @dns_get_record($domain, DNS_A + DNS_AAAA);
            $ips = [];
            foreach ((array) $records as $r) {
                if (!empty($r['ip']))   { $ips[] = $r['ip']; }
                if (!empty($r['ipv6'])) { $ips[] = $r['ipv6']; }
            }
            return [
                'domain' => $domain,
                'ips' => array_values(array_unique($ips)),
                'error' => empty($ips) ? 'No A/AAAA record found for this domain.' : null,
                'checked_at' => now()->toDateTimeString(),
            ];
        } catch (\Throwable $e) {
            return [
                'domain' => $domain,
                'ips' => [],
                'error' => 'DNS lookup failed: ' . $e->getMessage(),
                'checked_at' => now()->toDateTimeString(),
            ];
        }
    }

    /**
     * Retry the Ploi alias add (and optional SSL request) for an existing website.
     */
    public function retryPloi(Website $website, PloiService $ploi): RedirectResponse
    {
        if (empty($website->domain)) {
            return back()->withErrors(['domain' => 'This website has no custom domain.']);
        }

        $this->runProvisioning($website, $ploi);

        return redirect()->route('admin.websites.created', $website);
    }

    /**
     * Retry ONLY the Ploi alias add (does not dispatch the SSL job).
     */
    public function retryAlias(Website $website, PloiService $ploi): RedirectResponse
    {
        if (empty($website->domain)) {
            return back()->withErrors(['domain' => 'This website has no custom domain.']);
        }
        if (!$ploi->isConfigured()) {
            return back()->withErrors(['ploi' => 'Ploi is not configured in .env.']);
        }

        [$ok, $msg] = $ploi->addAlias($website->domain);

        if ($ok) {
            $website->update([
                'ploi_alias_status' => 'added',
                'ploi_alias_added_at' => $website->ploi_alias_added_at ?: now(),
                'ploi_last_error' => null,
            ]);
        } else {
            $website->update([
                'ploi_alias_status' => 'failed',
                'ploi_last_error' => $msg,
            ]);
        }

        // Reflect current SSL state in the report so it doesn't render as a
        // misleading "Skipped" — query Ploi and report what's actually issued.
        $hasCert = false;
        foreach ($ploi->listCertificates() as $c) {
            foreach (($c['domains'] ?? []) as $d) {
                if (strcasecmp($d, $website->domain) === 0) { $hasCert = true; break 2; }
            }
        }

        session()->flash('website_created_report', [
            'db'   => ['ok' => true, 'message' => 'Website already in the database.'],
            'ploi' => ['ok' => $ok, 'message' => $msg],
            'ssl'  => $hasCert
                ? ['ok' => true, 'message' => "Let's Encrypt certificate already covers \"{$website->domain}\"."]
                : ['ok' => false, 'message' => 'SSL not requested in this retry. Click "Retry SSL certificate" to issue it.'],
        ]);

        return redirect()->route('admin.websites.created', $website);
    }

    /**
     * Retry ONLY the SSL request.
     *
     * Runs synchronously so the user gets immediate feedback. We used to
     * dispatch a queued job here, but on production the queue worker isn't
     * always running, so the status would sit at "queued" forever and the
     * user thought the button was broken. The synchronous call is fast — Ploi
     * either accepts the request and returns 200 (or 422 "already exists"),
     * or rejects it with a DNS-mismatch 422 that we surface immediately.
     */
    public function retrySsl(Website $website, PloiService $ploi): RedirectResponse
    {
        if (empty($website->domain)) {
            return back()->withErrors(['domain' => 'This website has no custom domain.']);
        }
        if (!$ploi->isConfigured()) {
            return back()->withErrors(['ploi' => 'Ploi is not configured in .env.']);
        }

        $website->update(['ploi_ssl_status' => 'queued']);

        [$ok, $message] = $ploi->requestSsl($website->domain);

        if ($ok) {
            $website->update([
                'ploi_ssl_status' => 'issued',
                'ploi_ssl_issued_at' => now(),
                'ploi_last_error' => null,
            ]);
            $sslReport = ['ok' => true, 'message' => $message];
        } else {
            $website->update([
                'ploi_ssl_status' => 'failed',
                'ploi_last_error' => $message,
            ]);
            $sslReport = ['ok' => false, 'message' => $message];
        }

        // Re-query Ploi for the alias state AFTER the SSL request. Ploi
        // auto-creates aliases for every SAN subject in a successful cert
        // issuance, so the alias is almost always present post-SSL even if
        // it wasn't before. aliasExists() is tri-state: true/false when Ploi
        // answered (all pages, canonical comparison), NULL when the alias
        // list couldn't be fetched — which must never be reported as "NOT
        // on Ploi".
        $aliasOnPloiAfter = $ploi->aliasExists($website->domain);
        if ($aliasOnPloiAfter === true && $website->ploi_alias_status !== 'added') {
            $website->update([
                'ploi_alias_status' => 'added',
                'ploi_alias_added_at' => $website->ploi_alias_added_at ?: now(),
            ]);
        }

        if ($aliasOnPloiAfter === true) {
            $ploiReport = ['ok' => true, 'message' => "Alias \"{$website->domain}\" is on Ploi."];
        } elseif ($aliasOnPloiAfter === null) {
            // Couldn't verify. If the SSL request just succeeded, Ploi creates
            // the alias as part of issuance; likewise trust a persisted
            // "added". Otherwise stay neutral — never claim it's missing.
            $ploiReport = ($ok || $website->ploi_alias_status === 'added')
                ? ['ok' => true, 'message' => "Alias \"{$website->domain}\" is marked as added. (Couldn't verify with Ploi right now — the live alias list was unavailable.)"]
                : ['ok' => null, 'message' => "Couldn't verify the alias list with Ploi right now — this is NOT a confirmation that the alias is missing."];
        } else {
            $ploiReport = ['ok' => false, 'message' => "Alias \"{$website->domain}\" is NOT on Ploi yet — click \"Retry domain alias\" first."];
        }

        session()->flash('website_created_report', [
            'db'   => ['ok' => true, 'message' => 'Website already in the database.'],
            'ploi' => $ploiReport,
            'ssl'  => $sslReport,
        ]);

        return redirect()->route('admin.websites.created', $website);
    }

    /**
     * Show edit website form
     */
    public function edit(Website $website): Response
    {
        $website->load('agentInfo', 'homepageBuilding');

        // Get all buildings for the dropdown
        $buildings = \App\Models\Building::select('id', 'name', 'address')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Websites/Edit', [
            'title' => "Edit Website: {$website->name}",
            'website' => $website,
            'buildings' => $buildings
        ]);
    }

    /**
     * Update website
     */
    public function update(Request $request, Website $website)
    {
        // Parse JSON strings for nested objects if they come from FormData
        $data = $request->all();

        // Convert string booleans to actual booleans
        foreach (['is_default', 'is_active', 'use_building_as_homepage'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN);
            }
        }

        // Convert empty strings to null for nullable fields
        $nullableFields = ['homepage_building_id', 'domain', 'logo_url', 'favicon_url', 'meta_title', 'meta_description', 'meta_keywords', 'description', 'tracking_scripts'];
        foreach ($nullableFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        // Parse nested JSON objects if they are strings
        foreach (['brand_colors', 'contact_info', 'social_media', 'fonts', 'business_hours'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = json_decode($data[$field], true);
            }
        }

        // Handle nested keys from FormData
        // FormData converts dots to underscores, so we need to handle both formats:
        // - 'brand_colors.primary' (dot notation - original)
        // - 'brand_colors_primary' (underscore notation - from FormData)
        $nestedData = [];
        $keysToRemove = [];

        // Define the nested field prefixes we need to handle
        $nestedPrefixes = ['brand_colors', 'contact_info', 'social_media', 'fonts', 'business_hours'];

        foreach ($data as $key => $value) {
            // Check for dot notation first
            if (strpos($key, '.') !== false) {
                $keys = explode('.', $key);
                $current = &$nestedData;
                foreach ($keys as $index => $k) {
                    if ($index === count($keys) - 1) {
                        $current[$k] = $value;
                    } else {
                        if (!isset($current[$k])) {
                            $current[$k] = [];
                        }
                        $current = &$current[$k];
                    }
                }
                $keysToRemove[] = $key;
            } else {
                // Check for underscore notation (FormData converts dots to underscores)
                foreach ($nestedPrefixes as $prefix) {
                    if (strpos($key, $prefix . '_') === 0 && $key !== $prefix) {
                        // Extract the nested key (e.g., 'brand_colors_primary' -> 'primary')
                        $nestedKey = substr($key, strlen($prefix) + 1);
                        if (!isset($nestedData[$prefix])) {
                            $nestedData[$prefix] = [];
                        }
                        $nestedData[$prefix][$nestedKey] = $value;
                        $keysToRemove[] = $key;
                        break;
                    }
                }
            }
        }

        // Remove dot-notation keys from data
        foreach ($keysToRemove as $key) {
            unset($data[$key]);
        }

        // Merge nested data back into main data array
        foreach ($nestedData as $key => $value) {
            if (!isset($data[$key]) || !is_array($data[$key])) {
                $data[$key] = [];
            }
            $data[$key] = array_merge($data[$key], $value);
        }

        // Merge the parsed data back into the request
        $request->merge($data);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('websites')->ignore($website->id)],
            'domain' => 'nullable|string|max:255',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'homepage_building_id' => 'nullable|exists:buildings,id',
            'use_building_as_homepage' => 'boolean',
            'logo_file' => 'nullable|file|mimes:jpg,jpeg,png,svg,webp|max:2048',
            'logo' => 'nullable|string|max:255',
            'logo_url' => 'nullable|string|max:255',
            'favicon_file' => 'nullable|file|mimes:jpg,jpeg,png,ico,svg|max:1024',
            'favicon_url' => 'nullable|string|max:255',
            'brand_colors' => 'nullable|array',
            'fonts' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'contact_info' => 'nullable|array',
            'agent_name' => 'nullable|string|max:255',
            'agent_title' => 'nullable|string|max:255',
            'agent_phone' => 'nullable|string|max:255',
            'brokerage' => 'nullable|string|max:255',
            'agent_profile_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'social_media' => 'nullable|array',
            'description' => 'nullable|string',
            'business_hours' => 'nullable|array',
            'timezone' => 'nullable|string|max:255',
            // Raw tracking snippets (e.g. Follow Up Boss pixel) — intentionally
            // unsanitized; only admins can write it and it renders in <head>.
            'tracking_scripts' => 'nullable|string|max:20000',
        ]);

        // Handle logo file upload
        if ($request->hasFile('logo_file')) {
            $logoFile = $request->file('logo_file');

            // Delete old logo if it exists
            $oldLogoPath = $website->logo ?? $website->logo_url;
            if ($oldLogoPath) {
                // Handle logos in storage directory
                if (strpos($oldLogoPath, '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $oldLogoPath);
                    Storage::disk('public')->delete($oldPath);
                }
                // Handle logos in public/assets directory
                elseif (strpos($oldLogoPath, '/assets/') === 0) {
                    $publicPath = public_path(ltrim($oldLogoPath, '/'));
                    if (file_exists($publicPath) && is_file($publicPath)) {
                        // Don't delete the default Logo.png - keep it as backup
                        if (basename($publicPath) !== 'Logo.png') {
                            unlink($publicPath);
                        }
                    }
                }
            }

            // Generate unique filename
            $logoFileName = 'logo_' . uniqid() . '_' . time() . '.' . $logoFile->getClientOriginalExtension();

            // Store in public/assets directory for consistency
            $assetsPath = public_path('assets');
            if (!file_exists($assetsPath)) {
                mkdir($assetsPath, 0755, true);
            }

            // Move the uploaded file to assets directory
            $logoFile->move($assetsPath, $logoFileName);

            // Update both logo and logo_url with the assets path
            $validated['logo'] = '/assets/' . $logoFileName;
            $validated['logo_url'] = '/assets/' . $logoFileName;
        }
        // Remove logo_file from validated array as it's not a database field
        unset($validated['logo_file']);

        // Handle favicon file upload
        if ($request->hasFile('favicon_file')) {
            $faviconFile = $request->file('favicon_file');

            // Delete old favicon if it exists in assets
            $oldFaviconPath = $website->favicon_url;
            if ($oldFaviconPath && strpos($oldFaviconPath, '/assets/') === 0) {
                $publicPath = public_path(ltrim($oldFaviconPath, '/'));
                if (file_exists($publicPath) && is_file($publicPath)) {
                    // Don't delete default favicon.ico
                    if (basename($publicPath) !== 'favicon.ico') {
                        unlink($publicPath);
                    }
                }
            }

            // Generate unique filename
            $faviconFileName = 'favicon_' . uniqid() . '_' . time() . '.' . $faviconFile->getClientOriginalExtension();

            // Store in public/assets directory
            $assetsPath = public_path('assets');
            if (!file_exists($assetsPath)) {
                mkdir($assetsPath, 0755, true);
            }

            // Move the uploaded file to assets directory
            $faviconFile->move($assetsPath, $faviconFileName);

            // Update favicon_url with the assets path
            $validated['favicon_url'] = '/assets/' . $faviconFileName;
        }
        // Remove favicon_file from validated array as it's not a database field
        unset($validated['favicon_file']);

        // Handle agent information separately
        $agentData = [
            'website_id' => $website->id,
            'agent_name' => $validated['agent_name'] ?? null,
            'agent_title' => $validated['agent_title'] ?? null,
            'agent_phone' => $validated['agent_phone'] ?? null,
            'brokerage' => $validated['brokerage'] ?? null,
        ];

        // Handle agent profile image upload
        if ($request->hasFile('agent_profile_image')) {
            $agentImageFile = $request->file('agent_profile_image');

            // Ensure storage directory exists
            if (!Storage::disk('public')->exists('agents')) {
                Storage::disk('public')->makeDirectory('agents');
            }

            // Delete old image if exists. Match '/storage/' anywhere in
            // the value, not just at the start — records saved via
            // Storage::url() hold absolute URLs (APP_URL prefix) and
            // would otherwise never be cleaned up.
            $agentInfo = $website->agentInfo;
            if ($agentInfo && $agentInfo->profile_image &&
                ($storagePos = strpos($agentInfo->profile_image, '/storage/')) !== false) {
                $oldPath = substr($agentInfo->profile_image, $storagePos + strlen('/storage/'));
                Storage::disk('public')->delete($oldPath);
            }

            // Generate unique filename for agent image
            $agentImageFileName = uniqid() . '_' . time() . '.' . $agentImageFile->getClientOriginalExtension();

            // Store the file with specific filename. Relative URL on
            // purpose — see the matching comment in store().
            $agentImagePath = $agentImageFile->storeAs('agents', $agentImageFileName, 'public');

            // Update agent data with new image path
            $agentData['profile_image'] = '/storage/' . $agentImagePath;
        }

        // Update or create agent info
        AgentInfo::updateOrCreate(
            ['website_id' => $website->id],
            $agentData
        );

        // Remove agent fields from validated array as they're handled separately
        unset($validated['agent_name'], $validated['agent_title'], $validated['agent_phone'],
              $validated['brokerage'], $validated['agent_profile_image']);

        // If this is set as default, remove default from other websites
        if ($validated['is_default'] ?? false) {
            Website::where('id', '!=', $website->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        // Update the website
        $website->update($validated);

        // Return Inertia redirect to edit page to stay on same page
        return redirect()->route('admin.websites.edit', $website->id)
            ->with('success', 'Website updated successfully!');
    }

    /**
     * Delete website. Also removes the domain alias from the Ploi site so the
     * server stops answering for it — otherwise the alias would stay in
     * nginx's server_name list forever. Certs are intentionally left alone:
     * Ploi reuses one cert file across multiple alias names, so deleting a
     * cert here could take unrelated domains offline.
     *
     * Cleanup covers both the apex and the www variant so a website saved
     * with domain "foo.com" also clears "www.foo.com" (and vice versa) —
     * those variants are commonly added via Ploi's SSL request side effect.
     */
    public function destroy(Website $website, PloiService $ploi): RedirectResponse
    {
        if ($website->is_default) {
            return redirect()->back()
                ->withErrors(['error' => 'Cannot delete the default website.']);
        }

        $ploiMessages = [];
        if (!empty($website->domain) && $ploi->isConfigured()) {
            $candidates = $this->aliasVariants($website->domain);
            foreach ($candidates as $variant) {
                [$ok, $msg] = $ploi->deleteAlias($variant);
                $ploiMessages[] = $msg;
                if (!$ok) {
                    Log::warning('Website delete: Ploi alias cleanup failed', [
                        'website_id' => $website->id,
                        'variant' => $variant,
                        'message' => $msg,
                    ]);
                }
            }
        }

        $name = $website->name;
        $website->delete();

        $success = "Website \"{$name}\" deleted.";
        if (!empty($ploiMessages)) {
            $success .= ' Ploi: ' . implode(' | ', $ploiMessages);
        }

        return redirect()->route('admin.websites.index')
            ->with('success', $success);
    }

    /**
     * Given a saved domain, return the list of alias variants we should try
     * to clean up on delete. For "foo.com" returns ["foo.com", "www.foo.com"].
     * For "www.foo.com" returns ["www.foo.com", "foo.com"]. For anything else
     * (e.g. "blog.foo.com") returns just the original.
     */
    protected function aliasVariants(string $domain): array
    {
        $domain = strtolower(trim($domain));
        if ($domain === '') {
            return [];
        }
        if (str_starts_with($domain, 'www.')) {
            return [$domain, substr($domain, 4)];
        }
        if (substr_count($domain, '.') === 1) {
            return [$domain, 'www.' . $domain];
        }
        return [$domain];
    }

    /**
     * Duplicate a website
     */
    public function duplicate(Website $website): RedirectResponse
    {
        try {
            // Generate a unique slug
            $baseSlug = $website->slug . '-copy';
            $slug = $baseSlug;
            $counter = 1;
            while (Website::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            // Create the duplicate website
            $newWebsite = $website->replicate();
            $newWebsite->name = $website->name . ' (Copy)';
            $newWebsite->slug = $slug;
            $newWebsite->domain = null; // Clear domain for the copy
            $newWebsite->is_default = false; // Never duplicate as default
            $newWebsite->save();

            // Duplicate agent info if exists
            if ($website->agentInfo) {
                $newAgentInfo = $website->agentInfo->replicate();
                $newAgentInfo->website_id = $newWebsite->id;
                $newAgentInfo->save();
            }

            // Duplicate pages
            foreach ($website->pages as $page) {
                $newPage = $page->replicate();
                $newPage->website_id = $newWebsite->id;
                $newPage->save();
            }

            return redirect()->route('admin.websites.edit', $newWebsite)
                ->with('success', 'Website duplicated successfully! You can now customize the copy.');
        } catch (\Exception $e) {
            \Log::error('Website duplication failed: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Failed to duplicate website: ' . $e->getMessage()]);
        }
    }

    /**
     * Edit home page content
     */
    public function editHomePage($websiteId): Response
    {
        try {
            $website = Website::findOrFail($websiteId);
            $homePage = $website->pages()->where('page_type', 'home')->first();
            
            if (!$homePage) {
                // Create default home page if it doesn't exist
                $homePage = WebsitePage::create([
                    'website_id' => $website->id,
                    'page_type' => 'home',
                    'title' => "Home - {$website->name}",
                    'content' => WebsitePage::getDefaultHomeContent(),
                    'is_active' => true,
                    'sort_order' => 0,
                ]);
            }

            // Get all icons grouped by category
            $icons = Icon::active()
                ->select('id', 'name', 'category', 'svg_content', 'icon_url')
                ->orderBy('category')
                ->orderBy('name')
                ->get()
                ->groupBy('category');

            return Inertia::render('Admin/Websites/EditHomePage', [
                'title' => "Edit Home Page: {$website->name}",
                'website' => $website,
                'homePage' => $homePage,
                'availableIcons' => $icons
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Edit home page failed: ' . $e->getMessage());
            return redirect()->route('admin.websites.index')
                ->withErrors(['error' => 'Failed to load home page editor.']);
        }
    }

    /**
     * Update home page content
     */
    public function updateHomePage(Request $request, $websiteId): RedirectResponse
    {
        try {
            // Debug: Log all request data
            \Log::info('UpdateHomePage Request Data:', [
                'all' => $request->all(),
                'files' => $request->allFiles(),
                'method' => $request->method()
            ]);
            
            $website = Website::findOrFail($websiteId);
            $homePage = $website->pages()->where('page_type', 'home')->first();
            
            if (!$homePage) {
                // Create home page if it doesn't exist
                $homePage = WebsitePage::create([
                    'website_id' => $website->id,
                    'page_type' => 'home',
                    'title' => 'Home - ' . $website->name,
                    'content' => WebsitePage::getDefaultHomeContent(),
                    'is_active' => true,
                    'sort_order' => 0,
                ]);
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'nullable', // Remove type restriction since it can be string or array
                'hero_background_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
                'about_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
                'footer_logo' => 'nullable|file|mimes:jpg,jpeg,png,webp,svg|max:5120', // 5MB max
                'footer_background_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
            ]);

            // Handle content field (can be JSON string or array)
            $content = $homePage->content; // Start with existing content
            if (isset($validated['content'])) {
                if (is_string($validated['content'])) {
                    // If it's a string, decode it
                    $decodedContent = json_decode($validated['content'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $content = $decodedContent;
                        \Log::info('FAQ content decoded successfully:', [
                            'faq_enabled' => $content['faq']['enabled'] ?? 'not set',
                            'faq_title' => $content['faq']['title'] ?? 'not set',
                            'faq_items_count' => count($content['faq']['items'] ?? [])
                        ]);
                    } else {
                        \Log::error('JSON decode error for content:', [
                            'content' => $validated['content'],
                            'error' => json_last_error_msg()
                        ]);
                    }
                } elseif (is_array($validated['content'])) {
                    // If it's already an array, use it directly
                    $content = $validated['content'];
                    \Log::info('FAQ content updated from array:', [
                        'faq_enabled' => $content['faq']['enabled'] ?? 'not set',
                        'faq_title' => $content['faq']['title'] ?? 'not set',
                        'faq_items_count' => count($content['faq']['items'] ?? [])
                    ]);
                }
            }

            // Handle hero background image upload
            if ($request->hasFile('hero_background_image')) {
                $heroImageFile = $request->file('hero_background_image');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old image if exists
                if (isset($content['hero']['background_image']) && 
                    strpos($content['hero']['background_image'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['hero']['background_image']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $heroImagePath = $heroImageFile->store('home-page', 'public');
                $content['hero']['background_image'] = '/storage/' . $heroImagePath;
            }

            // Handle about image upload
            if ($request->hasFile('about_image')) {
                $aboutImageFile = $request->file('about_image');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old image if exists
                if (isset($content['about']['image']) && 
                    strpos($content['about']['image'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['about']['image']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $aboutImagePath = $aboutImageFile->store('home-page', 'public');
                $content['about']['image'] = '/storage/' . $aboutImagePath;
            }

            // Handle footer logo upload
            if ($request->hasFile('footer_logo')) {
                $footerLogoFile = $request->file('footer_logo');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old logo if exists
                if (isset($content['footer']['logo_url']) && 
                    strpos($content['footer']['logo_url'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['footer']['logo_url']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $footerLogoPath = $footerLogoFile->store('home-page', 'public');
                if (!isset($content['footer'])) {
                    $content['footer'] = [];
                }
                $content['footer']['logo_url'] = '/storage/' . $footerLogoPath;
            }

            // Handle footer background image upload
            if ($request->hasFile('footer_background_image')) {
                $footerBgFile = $request->file('footer_background_image');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old background image if exists
                if (isset($content['footer']['background_image']) && 
                    strpos($content['footer']['background_image'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['footer']['background_image']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $footerBgPath = $footerBgFile->store('home-page', 'public');
                if (!isset($content['footer'])) {
                    $content['footer'] = [];
                }
                $content['footer']['background_image'] = '/storage/' . $footerBgPath;
            }

            $homePage->update([
                'title' => $validated['title'],
                'content' => $content
            ]);

            return redirect()->route('admin.websites.edit-home-page', $website->id)
                ->with('success', 'Home page updated successfully!');

        } catch (\Exception $e) {
            \Log::error('Home page update failed: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Failed to update home page: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display website pages management
     */
    public function pages(Website $website): Response
    {
        $website->load('pages');

        return Inertia::render('Admin/Websites/Pages', [
            'title' => "Pages: {$website->name}",
            'website' => $website
        ]);
    }

    /**
     * Manage icons
     */
    public function icons(): Response
    {
        $icons = Icon::orderBy('category')->orderBy('name')->get();

        return Inertia::render('Admin/Icons/Index', [
            'title' => 'Icon Management',
            'icons' => $icons
        ]);
    }

    /**
     * Create new icon
     */
    public function storeIcon(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'svg_content' => 'required_without:icon_url|string',
            'icon_url' => 'required_without:svg_content|string|max:255',
            'description' => 'nullable|string',
        ]);

        Icon::create($validated);

        return redirect()->back()
            ->with('success', 'Icon created successfully!');
    }

    /**
     * Delete icon
     */
    public function destroyIcon(Icon $icon): RedirectResponse
    {
        $icon->delete();

        return redirect()->back()
            ->with('success', 'Icon deleted successfully!');
    }

    /**
     * Update website
     */
    public function updateWebsite(Request $request, $websiteId): RedirectResponse
    {
        $website = Website::findOrFail($websiteId);

        // Use the logic from the update method
        return $this->update($request, $website);
    }

    /**
     * Get icons for API
     */
    public function getIcons()
    {
        $icons = Icon::orderBy('category')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'icons' => $icons
        ]);
    }

    /**
     * Store a new icon via AJAX with file upload support
     */
    public function storeIconAjax(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:key_facts,amenities,highlights,contact,general',
            'svg_content' => 'nullable|string',
            'icon_url' => 'nullable|url|max:500',
            'icon_file' => 'nullable|file|mimes:svg,png,jpg,jpeg|max:2048', // 2MB max
            'description' => 'nullable|string|max:500',
        ]);

        $iconContent = $validated['svg_content'] ?? null;
        $iconUrl = $validated['icon_url'] ?? null;

        // Handle file upload
        if ($request->hasFile('icon_file')) {
            $file = $request->file('icon_file');
            $extension = strtolower($file->getClientOriginalExtension());
            
            // Ensure icons directory exists
            if (!Storage::disk('public')->exists('icons')) {
                Storage::disk('public')->makeDirectory('icons');
            }
            
            if ($extension === 'svg') {
                // For SVG files, store the content directly and also save file
                $iconContent = file_get_contents($file->getRealPath());
                $filename = time() . '_' . \Illuminate\Support\Str::slug($validated['name']) . '.svg';
                $path = $file->storeAs('icons', $filename, 'public');
                $iconUrl = '/storage/' . $path;
            } else {
                // For PNG/JPG files, store the file and save URL
                $filename = time() . '_' . \Illuminate\Support\Str::slug($validated['name']) . '.' . $extension;
                $path = $file->storeAs('icons', $filename, 'public');
                $iconUrl = '/storage/' . $path;
                $iconContent = null; // Clear SVG content for non-SVG files
            }
        }

        $icon = Icon::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'svg_content' => $iconContent,
            'icon_url' => $iconUrl,
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        // For Inertia requests, return a redirect
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Icon created successfully!');
        }
        
        // For regular AJAX requests, return JSON
        return response()->json([
            'success' => true,
            'message' => 'Icon created successfully!',
            'icon' => [
                'id' => $icon->id,
                'name' => $icon->name,
                'category' => $icon->category,
                'svg_content' => $icon->svg_content,
                'icon_url' => $icon->icon_url,
                'description' => $icon->description,
                'is_active' => $icon->is_active,
                'display_name' => ucwords(str_replace('_', ' ', $icon->name))
            ]
        ]);
    }

    /**
     * Update an existing icon with file upload support
     */
    public function updateIcon(Request $request, $iconId)
    {
        $icon = Icon::findOrFail($iconId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:key_facts,amenities,highlights,contact,general',
            'svg_content' => 'nullable|string',
            'icon_url' => 'nullable|url|max:500',
            'icon_file' => 'nullable|file|mimes:svg,png,jpg,jpeg|max:2048',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $iconContent = $validated['svg_content'] ?? $icon->svg_content;
        $iconUrl = $validated['icon_url'] ?? $icon->icon_url;

        // Handle file upload
        if ($request->hasFile('icon_file')) {
            $file = $request->file('icon_file');
            $extension = strtolower($file->getClientOriginalExtension());
            
            // Delete old file if it exists
            if ($icon->icon_url && Storage::disk('public')->exists(str_replace('/storage/', '', $icon->icon_url))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $icon->icon_url));
            }
            
            // Ensure icons directory exists
            if (!Storage::disk('public')->exists('icons')) {
                Storage::disk('public')->makeDirectory('icons');
            }
            
            if ($extension === 'svg') {
                // For SVG files, store the content directly and also save file
                $iconContent = file_get_contents($file->getRealPath());
                $filename = time() . '_' . \Illuminate\Support\Str::slug($validated['name']) . '.svg';
                $path = $file->storeAs('icons', $filename, 'public');
                $iconUrl = '/storage/' . $path;
            } else {
                // For PNG/JPG files, store the file and save URL
                $filename = time() . '_' . \Illuminate\Support\Str::slug($validated['name']) . '.' . $extension;
                $path = $file->storeAs('icons', $filename, 'public');
                $iconUrl = '/storage/' . $path;
                $iconContent = null; // Clear SVG content for non-SVG files
            }
        }

        $icon->update([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'svg_content' => $iconContent,
            'icon_url' => $iconUrl,
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Icon updated successfully!');
    }
}
