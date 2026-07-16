<?php

namespace App\Http\Middleware;

use App\Models\Website;
use App\Services\Tenancy\TenantResolver;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Get the current website via the shared TenantResolver (tenant domains
     * resolve by Host header; the admin/main host resolves to null unless a
     * ?website= preview override is present). Admin panel pages keep using
     * the default-website fallback purely for panel branding.
     */
    protected function getCurrentWebsite(Request $request): ?Website
    {
        $resolver = app(TenantResolver::class);

        if ($request->is('admin', 'admin/*')) {
            return $resolver->defaultWebsite();
        }

        // Unknown hosts resolve to null; shared props degrade gracefully and
        // the route layer decides whether to 404.
        return $resolver->resolve($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Get the current website based on domain/query parameter
        $website = $this->getCurrentWebsite($request);

        $globalWebsite = null;
        $globalFooterContent = null;
        if ($website) {
            // Get header_links and footer content from the home page content
            $homePage = $website->homePage();
            $homePageContent = $homePage?->content ?? null;
            $headerLinks = null;

            if ($homePageContent) {
                // Content might be stored as JSON string or array
                $contentData = is_string($homePageContent) ? json_decode($homePageContent, true) : $homePageContent;
                $headerLinks = $contentData['header_links'] ?? null;
                // Extract footer content for global use
                $globalFooterContent = $contentData['footer'] ?? null;
            }

            $globalWebsite = [
                'id' => $website->id,
                'name' => $website->name,
                'slug' => $website->slug,
                'domain' => $website->domain,
                'logo_url' => $website->logo_url,
                'logo' => $website->logo,
                'favicon_url' => $website->favicon_url ?? '/favicon.ico',
                'brand_colors' => $website->getBrandColors(),
                'contact_info' => $website->getContactInfo(),
                'social_media' => $website->getSocialMedia(),
                'agent_info' => $website->agentInfo,
                'meta_title' => $website->meta_title,
                'meta_description' => $website->meta_description,
                'meta_keywords' => $website->meta_keywords,
                'description' => $website->description,
                'header_links' => $headerLinks,
                'footer_content' => $globalFooterContent,
                // Admin-managed raw tracking snippets, injected into the public
                // <head> by app.blade.php; kept out of admin pages.
                'tracking_scripts' => $request->is('admin*') ? null : $website->tracking_scripts,
            ];

            // This site's linked building image/logo for global chrome (e.g.
            // the footer CTA image) so every domain shows ITS building, not a
            // stock photo. Cached briefly; Building accessors strip the host
            // so tenant domains serve the file same-origin.
            $building = null;
            if ($website->homepage_building_id) {
                $building = \Illuminate\Support\Facades\Cache::remember(
                    'website.' . $website->id . '.footer_building',
                    60,
                    fn () => \App\Models\Building::query()
                        ->where('id', $website->homepage_building_id)
                        ->first(['id', 'name', 'main_image', 'logo'])
                );
            }
            $globalWebsite['building_name'] = $building?->name;
            $globalWebsite['building_image'] = $building?->main_image;
            $globalWebsite['building_logo'] = $building?->logo;
        }

        // The admin/main host gets a bare login screen: no signup, no forgot
        // password, no Google login (per owner request). Tenant sites keep
        // their full auth UI.
        $isMainDomain = app(TenantResolver::class)->isAdminHost($request->getHost());

        // Check if Google OAuth is properly configured (not placeholder values).
        // Hidden on the main domain (bare login screen) and on sub-sites/
        // created sites (each needs its own OAuth redirect URI config).
        $googleClientId = config('services.google.client_id');
        $googleOAuthEnabled = !empty($googleClientId) &&
                              $googleClientId !== 'your-google-client-id' &&
                              !str_starts_with($googleClientId, 'your-') &&
                              !$isMainDomain &&
                              ($website && $website->is_default);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'globalWebsite' => $globalWebsite,
            'currentWebsiteSlug' => $website?->slug,
            'isMainDomain' => $isMainDomain,
            'googleMapsApiKey' => (string) config('repliers.google_maps_browser_key', ''),
            'googleOAuthEnabled' => $googleOAuthEnabled,
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
