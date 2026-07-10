<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Website;
use App\Models\WebsitePage;
use App\Models\Icon;
use App\Models\AgentInfo;
use App\Services\CloudflareService;
use App\Services\HealthCheckService;
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

        // Branding/contact/agent inheritance now happens server-side in
        // store(), so the create screen only needs the building list plus
        // the Cloudflare bits for the optional-domain field. The badge data
        // lets the UI flag buildings that already have a website (duplicates
        // are allowed — the slug auto-suffixes).
        return Inertia::render('Admin/Websites/Create', [
            'title' => 'Create New Website',
            'buildings' => $buildings,
            'buildingIdsWithWebsite' => Website::whereNotNull('homepage_building_id')
                ->pluck('homepage_building_id'),
            'cloudflareEnabled' => app(CloudflareService::class)->isConfigured(),
            // The hostname customers point their single CNAME record at.
            'cnameTarget' => app(CloudflareService::class)->cnameTarget(),
            // "Launch Website" shortcut from the Building edit page
            'preselectedBuildingId' => request()->query('building_id'),
        ]);
    }

    /**
     * Store new website
     */
    public function store(Request $request, CloudflareService $cloudflare): RedirectResponse
    {
        // Parse nested keys from FormData (e.g., 'brand_colors.primary')
        $data = $request->all();

        // One-click flow: the website name defaults to the selected
        // building's name when the admin didn't type one.
        if (empty($data['name']) && !empty($data['building_id'])) {
            $data['name'] = Building::find($data['building_id'])?->name;
        }

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

        $this->normalizeDomainInput($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:websites',
            'domain' => $this->domainRules(),
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
                // These used to arrive prefilled from the Create form; the
                // one-click flow submits none of them, so the same
                // inheritance now happens here.
                foreach (['brand_colors', 'fonts', 'contact_info', 'social_media', 'logo', 'logo_url', 'favicon_url', 'timezone'] as $field) {
                    if (empty($validated[$field]) && !empty($defaultSite->{$field})) {
                        $validated[$field] = $defaultSite->{$field};
                    }
                }
            }
        }
        if (empty($validated['timezone'])) {
            $validated['timezone'] = 'America/Toronto';
        }

        // Instant SEO fallback (same shape as GeminiAIService's fallback) so
        // the site has usable meta immediately — the queued AI job replaces
        // these with generated copy within a minute when a worker is running.
        $linkedBuilding = !empty($validated['homepage_building_id'])
            ? Building::find($validated['homepage_building_id'])
            : null;
        if (empty($validated['meta_title'])) {
            $loc = $linkedBuilding?->city ?: 'Toronto';
            $siteName = $validated['name'];
            $validated['meta_title'] = trim($siteName . ' - Luxury Condos in ' . $loc);
            $validated['meta_description'] = "Discover {$siteName} - premium condos in {$loc}. Explore floor plans, amenities, and current listings.";
            $validated['meta_keywords'] = strtolower($siteName) . ", {$loc} condos, luxury real estate, toronto condos, condos for sale, real estate {$loc}";
        }
        if (empty($validated['description']) && $linkedBuilding && trim((string) $linkedBuilding->description) !== '') {
            $validated['description'] = $linkedBuilding->description;
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

        // One-click flow submits no agent fields: prefer the linked
        // building's agent, then fall back to the default website's
        // agentInfo row (same precedence the old Create form prefill used).
        if (!array_filter($agentData) && !$request->hasFile('agent_profile_image')) {
            if ($linkedBuilding && ($linkedBuilding->agent_name || $linkedBuilding->agent_phone)) {
                $agentData = [
                    'agent_name' => $linkedBuilding->agent_name,
                    'agent_title' => $linkedBuilding->agent_title,
                    'agent_phone' => $linkedBuilding->agent_phone,
                    'brokerage' => $linkedBuilding->agent_brokerage,
                ];
                if ($linkedBuilding->agent_image) {
                    $agentData['profile_image'] = $linkedBuilding->agent_image;
                }
            } elseif ($defaultAgent = Website::where('is_default', true)->first()?->agentInfo) {
                $agentData = [
                    'agent_name' => $defaultAgent->agent_name,
                    'agent_title' => $defaultAgent->agent_title,
                    'agent_phone' => $defaultAgent->agent_phone,
                    'brokerage' => $defaultAgent->brokerage,
                ];
                if ($defaultAgent->profile_image) {
                    $agentData['profile_image'] = $defaultAgent->profile_image;
                }
            }
        }

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

        // No photo from the upload, the building or the default site's
        // agent — or the inherited local path points at a file that no
        // longer exists: every new website still gets the standard agent
        // profile photo (stored locally in public/assets, editable later).
        $resolvedImage = $agentData['profile_image'] ?? null;
        $isLocalPath = is_string($resolvedImage) && str_starts_with($resolvedImage, '/');
        if (
            empty($resolvedImage)
            || ($isLocalPath && !file_exists(public_path(ltrim($resolvedImage, '/'))))
        ) {
            $agentData['profile_image'] = '/assets/default-agent-profile.png';
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

        // Auto-provision the content with AI in the background: SEO meta,
        // building description (if missing) and homepage copy. The site is
        // fully usable with the personalized template meanwhile; the Created
        // status page polls ai_content_status until this lands.
        if ($website->homepage_building_id) {
            $website->update(['ai_content_status' => 'pending']);
            // dispatchAfterResponse (not a queued dispatch): production runs
            // no queue worker, so a database-queued job would sit pending
            // forever. This runs right after the redirect is sent — same
            // pattern as GeneratePropertyAiContentJob.
            \App\Jobs\GenerateWebsiteAiContentJob::dispatchAfterResponse($website->id);
        }

        $this->provisionCustomHostname($website, $cloudflare);

        return redirect()->route('admin.websites.created', $website);
    }

    /**
     * Canonicalize the submitted custom domain before validation so the
     * stored value always matches TenantResolver's host normalization
     * (lowercase, no scheme/port/path). Empty becomes null.
     */
    protected function normalizeDomainInput(Request $request): void
    {
        if (!$request->has('domain')) {
            return;
        }

        $normalized = \App\Services\Tenancy\TenantResolver::normalizeHost((string) $request->input('domain'));
        $request->merge(['domain' => $normalized !== '' ? $normalized : null]);
    }

    /**
     * Custom-domain rules: unique across websites (a duplicate would make
     * Host-header resolution indeterminate) and never the reserved admin
     * host — a tenant claiming it would capture the admin panel's domain.
     */
    protected function domainRules(?int $ignoreWebsiteId = null): array
    {
        $unique = Rule::unique('websites', 'domain');
        if ($ignoreWebsiteId !== null) {
            $unique = $unique->ignore($ignoreWebsiteId);
        }

        return [
            'nullable',
            'string',
            'max:255',
            $unique,
            function (string $attribute, $value, \Closure $fail) {
                $normalized = \App\Services\Tenancy\TenantResolver::normalizeHost((string) $value);
                if ($value !== null && in_array($normalized, \App\Services\Tenancy\TenantResolver::adminHosts(), true)) {
                    $fail("\"{$normalized}\" is reserved for the admin panel and cannot be assigned to a website.");
                }
            },
        ];
    }

    /**
     * Register the website's custom domain as a Cloudflare Custom Hostname
     * (synchronous, so the redirect can report it) and queue the SSL-status
     * polling job. Persists per-step state on the Website row so the status
     * page reflects reality on every reload.
     */
    protected function provisionCustomHostname(Website $website, CloudflareService $cloudflare): void
    {
        $report = [
            'db'         => ['ok' => true, 'message' => 'Website saved in the database.'],
            'cloudflare' => ['ok' => null, 'message' => 'Skipped — no custom domain entered.'],
            'ssl'        => ['ok' => null, 'message' => 'Skipped — no custom domain entered.'],
        ];

        if (empty($website->domain)) {
            $website->update([
                'cloudflare_status' => null,
                'cloudflare_ssl_status' => null,
                'cloudflare_last_error' => null,
            ]);
            session()->flash('website_created_report', $report);
            return;
        }

        if (!$cloudflare->isConfigured()) {
            $msg = 'Cloudflare is not configured (CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID missing in .env).';
            $website->update([
                'cloudflare_status' => 'failed',
                'cloudflare_last_error' => $msg,
            ]);
            $report['cloudflare'] = ['ok' => false, 'message' => $msg];
            $report['ssl'] = ['ok' => false, 'message' => 'Skipped — Cloudflare not configured.'];
            session()->flash('website_created_report', $report);
            return;
        }

        [$ok, $message, $hostname] = $cloudflare->createCustomHostname($website->domain);
        $report['cloudflare'] = ['ok' => $ok, 'message' => $message];

        if ($ok) {
            $website->update([
                'cloudflare_hostname_id' => $hostname['id'] ?? null,
                'cloudflare_status' => 'pending_dns',
                'cloudflare_ssl_status' => $hostname['ssl_status'] ?? null,
                'cloudflare_last_error' => null,
            ]);

            // Poll Cloudflare until the customer's CNAME lands and SSL goes
            // active; the scheduled sync command covers the long tail.
            \App\Jobs\SyncCustomHostnameStatusJob::dispatch($website->id)
                ->delay(now()->addSeconds(30));

            $cnameTarget = $cloudflare->cnameTarget();
            $report['ssl'] = [
                'ok' => null,
                'message' => "Waiting for the customer's CNAME. Create ONE DNS record: CNAME {$website->domain} -> {$cnameTarget}. "
                    . 'Cloudflare validates and activates SSL automatically (checked every 30s, then every 5 minutes).',
            ];
        } else {
            $website->update([
                'cloudflare_status' => 'failed',
                'cloudflare_last_error' => $message,
            ]);
            $report['ssl'] = ['ok' => false, 'message' => 'Skipped — the custom hostname must be registered first.'];
        }

        session()->flash('website_created_report', $report);
    }

    /**
     * Post-creation status page. Queries Cloudflare for the live custom
     * hostname + SSL state so reloading shows the real picture (not stale
     * flash data), and keeps the persisted DB state in sync with it.
     */
    public function created(Website $website, HealthCheckService $health, CloudflareService $cloudflare): Response
    {
        $report = session('website_created_report');

        $domain = $website->domain;
        $check = $health->checkWebsite($website);

        // Sync persisted state with Cloudflare's live view (source of truth
        // whenever we can talk to it).
        if ($check['configured'] && $domain && $check['hostname_exists'] !== null) {
            $isLive = $check['hostname_exists'] && $check['ssl_active'];
            $website->update([
                'cloudflare_hostname_id' => $check['hostname']['id'] ?? $website->cloudflare_hostname_id,
                'cloudflare_status' => $check['hostname_exists'] ? ($isLive ? 'active' : 'pending_dns') : 'failed',
                'cloudflare_ssl_status' => $check['ssl_status'],
                'cloudflare_last_error' => !empty($check['errors']) ? implode(' | ', $check['errors']) : null,
                'cloudflare_active_at' => $isLive ? ($website->cloudflare_active_at ?: now()) : $website->cloudflare_active_at,
            ]);
        }

        $cnameTarget = $cloudflare->cnameTarget();

        $liveStatus = [
            'db' => ['ok' => true, 'message' => 'Website is in the database.'],
            'cloudflare' => !$domain
                ? ['ok' => null, 'message' => 'No custom domain set — nothing to register on Cloudflare.']
                : (!$check['configured']
                    ? ['ok' => false, 'message' => 'Cloudflare is not configured (CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID).']
                    : ($check['hostname_exists'] === true
                        ? ['ok' => true, 'message' => "Custom hostname \"{$domain}\" is registered on Cloudflare (status: {$check['status']})."]
                        : ($check['hostname_exists'] === false
                            ? ['ok' => false, 'message' => "Custom hostname \"{$domain}\" is NOT registered on Cloudflare. Click Retry below."]
                            : ['ok' => null, 'message' => "Couldn't reach Cloudflare right now — this is NOT a confirmation that the hostname is missing. Refresh in a moment."]))),
            'ssl' => !$domain
                ? ['ok' => null, 'message' => 'No custom domain set — nothing to activate.']
                : ($check['ssl_active'] === true
                    ? ['ok' => true, 'message' => "SSL is ACTIVE — https://{$domain} is live via Cloudflare."]
                    : ($check['hostname_exists'] === true
                        ? ['ok' => null, 'message' => "SSL status: " . ($check['ssl_status'] ?: 'pending') . ". Waiting for the CNAME record ({$domain} -> {$cnameTarget}); activation is automatic once it exists."]
                        : ['ok' => null, 'message' => 'SSL activates automatically after the hostname is registered and the CNAME exists.'])),
            'ai' => match ($website->ai_content_status) {
                'completed' => ['ok' => true, 'message' => 'AI content is live: SEO metadata, hero copy, About text and building-specific FAQs.'],
                'failed' => ['ok' => false, 'message' => 'AI content generation failed — the template content stays live. ' . ($website->ai_content_error ?: '')],
                'pending' => ['ok' => null, 'message' => 'AI is writing the SEO metadata, hero copy, About text and FAQs — template content is live meanwhile.'],
                default => null,
            },
        ];

        // Persistent provisioning state from the DB — survives reloads and
        // reflects what the polling job/scheduler has done in the background.
        $persisted = [
            'hostname_id' => $website->cloudflare_hostname_id,
            'status' => $website->cloudflare_status,
            'ssl_status' => $website->cloudflare_ssl_status,
            'active_at' => $website->cloudflare_active_at ? $website->cloudflare_active_at->toDateTimeString() : null,
            'last_error' => $website->cloudflare_last_error,
        ];

        return Inertia::render('Admin/Websites/Created', [
            'title' => 'Website Created',
            'website' => [
                'id' => $website->id,
                'name' => $website->name,
                'slug' => $website->slug,
                'domain' => $website->domain,
                'is_active' => $website->is_active,
                'created_at' => optional($website->created_at)->toDateTimeString(),
                'ai_content_status' => $website->ai_content_status,
                'ai_content_error' => $website->ai_content_error,
            ],
            // The most recent action (if any) plus the live current state.
            'report' => $report ?: $liveStatus,
            'liveStatus' => $liveStatus,
            'persisted' => $persisted,
            'cloudflare' => [
                'configured' => $check['configured'],
                'cnameTarget' => $cnameTarget,
            ],
        ]);
    }

    /**
     * Re-register the custom hostname on Cloudflare (idempotent) and re-queue
     * the SSL status polling. One button replaces the old alias/SSL retries —
     * Cloudflare handles validation and certificates itself.
     */
    public function retryHostname(Website $website, CloudflareService $cloudflare): RedirectResponse
    {
        if (empty($website->domain)) {
            return back()->withErrors(['domain' => 'This website has no custom domain.']);
        }

        $this->provisionCustomHostname($website, $cloudflare);

        return redirect()->route('admin.websites.created', $website);
    }

    /**
     * Re-run the AI content auto-provisioning (SEO meta + homepage copy)
     * for a building-linked website. force=true bypasses the job's
     * completed-guard so an explicit regenerate always regenerates.
     */
    public function retryAiContent(Website $website): RedirectResponse
    {
        if (empty($website->homepage_building_id)) {
            return back()->withErrors(['ai' => 'This website has no linked building — nothing to generate from.']);
        }

        $website->update(['ai_content_status' => 'pending', 'ai_content_error' => null]);
        // After-response so it completes without a queue worker (none in prod).
        \App\Jobs\GenerateWebsiteAiContentJob::dispatchAfterResponse($website->id, true);

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
            'buildings' => $buildings,
            // Shown in the Domain & Hosting section so admins know exactly
            // which hostname the customer's CNAME must point at.
            'cnameTarget' => app(CloudflareService::class)->cnameTarget(),
            'cloudflareEnabled' => app(CloudflareService::class)->isConfigured(),
        ]);
    }

    /**
     * Update website
     */
    public function update(Request $request, Website $website, CloudflareService $cloudflare)
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

        $this->normalizeDomainInput($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('websites')->ignore($website->id)],
            'domain' => $this->domainRules($website->id),
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

        // Domain lifecycle: when the custom domain changes (or is removed),
        // delete the OLD custom hostname on Cloudflare and register the new
        // one. Safe by design: every custom hostname has its own edge
        // certificate, so removing one can never affect the admin domain or
        // any other tenant.
        $oldDomain = $website->domain;
        $newDomain = $validated['domain'] ?? null;
        $oldBuildingId = $website->homepage_building_id;
        $cfMessages = [];

        if ($oldDomain && $oldDomain !== $newDomain && $cloudflare->isConfigured()) {
            if ($website->cloudflare_hostname_id) {
                [, $msg] = $cloudflare->deleteCustomHostname($website->cloudflare_hostname_id);
                $cfMessages[] = $msg;
            }
            Log::info('Website update: removed old custom hostname from Cloudflare', [
                'website_id' => $website->id,
                'old_domain' => $oldDomain,
                'new_domain' => $newDomain,
                'messages' => $cfMessages,
            ]);
        }

        // Reset provisioning state when the domain changed.
        if ($oldDomain !== $newDomain) {
            $validated['cloudflare_hostname_id'] = null;
            $validated['cloudflare_status'] = null;
            $validated['cloudflare_ssl_status'] = null;
            $validated['cloudflare_last_error'] = null;
            $validated['cloudflare_active_at'] = null;
        }

        // Update the website
        $website->update($validated);

        // Changing the linked building must refresh the homepage content:
        // the stored home-page JSON embeds the building's name, facts,
        // images and FAQ copy, so without regeneration the site keeps
        // showing the previous building's data.
        $buildingMessage = $this->regenerateHomePageForBuildingChange($website, $oldBuildingId);

        // Register the NEW domain right away — the customer only has to
        // create their CNAME; activation is then fully automatic.
        if ($newDomain && $oldDomain !== $newDomain && $cloudflare->isConfigured()) {
            [$ok, $msg, $hostname] = $cloudflare->createCustomHostname($newDomain);
            $cfMessages[] = $msg;
            $website->update($ok
                ? [
                    'cloudflare_hostname_id' => $hostname['id'] ?? null,
                    'cloudflare_status' => 'pending_dns',
                    'cloudflare_ssl_status' => $hostname['ssl_status'] ?? null,
                ]
                : [
                    'cloudflare_status' => 'failed',
                    'cloudflare_last_error' => $msg,
                ]);
            if ($ok) {
                \App\Jobs\SyncCustomHostnameStatusJob::dispatch($website->id)
                    ->delay(now()->addSeconds(30));
            }
        }

        $success = 'Website updated successfully!';
        if ($buildingMessage !== null) {
            $success .= ' ' . $buildingMessage;
        }
        if (!empty($cfMessages)) {
            $success .= ' Cloudflare: ' . implode(' | ', $cfMessages);
        }
        if ($oldDomain !== $newDomain && $newDomain) {
            $success .= ' Point a CNAME record at ' . $cloudflare->cnameTarget() . ' to go live.';
        }

        // Return Inertia redirect to edit page to stay on same page
        return redirect()->route('admin.websites.edit', $website->id)
            ->with('success', $success);
    }

    /**
     * When the website's linked building changed, rebuild the home page
     * content from the NEW building (same generator the create flow uses)
     * so its name, facts, images and FAQ copy replace the old building's.
     * Returns a status message for the redirect, or null when unchanged.
     */
    protected function regenerateHomePageForBuildingChange(Website $website, ?string $oldBuildingId): ?string
    {
        $newBuildingId = $website->homepage_building_id;
        if (!$newBuildingId || (string) $newBuildingId === (string) $oldBuildingId) {
            return null;
        }

        $building = Building::find($newBuildingId);
        $homePage = $website->homePage();
        if (!$building || !$homePage) {
            return null;
        }

        $homePage->update([
            'title' => "Home - {$website->name}",
            'content' => WebsitePage::getDefaultHomeContentForBuilding($building),
        ]);

        Log::info('Website homepage regenerated for building change', [
            'website_id' => $website->id,
            'old_building_id' => $oldBuildingId,
            'new_building_id' => $newBuildingId,
        ]);

        return "Homepage content was refreshed with the data of \"{$building->name}\".";
    }

    /**
     * Delete website. Removes its Cloudflare custom hostname too — safe by
     * design, since every custom hostname carries its own edge certificate.
     */
    public function destroy(Website $website, CloudflareService $cloudflare): RedirectResponse
    {
        if ($website->is_default) {
            return redirect()->back()
                ->withErrors(['error' => 'Cannot delete the default website.']);
        }

        $cfMessages = [];
        if (!empty($website->cloudflare_hostname_id) && $cloudflare->isConfigured()) {
            [, $msg] = $cloudflare->deleteCustomHostname($website->cloudflare_hostname_id);
            $cfMessages[] = $msg;
            Log::info('Website delete: removed custom hostname from Cloudflare', [
                'website_id' => $website->id,
                'domain' => $website->domain,
                'messages' => $cfMessages,
            ]);
        }

        $name = $website->name;
        $website->delete();

        $success = "Website \"{$name}\" deleted.";
        if (!empty($cfMessages)) {
            $success .= ' Cloudflare: ' . implode(' | ', $cfMessages);
        }

        return redirect()->route('admin.websites.index')
            ->with('success', $success);
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
