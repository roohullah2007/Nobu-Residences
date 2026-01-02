<?php

namespace App\Http\Middleware;

use App\Models\Website;
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
     * Get the current website based on domain or query parameter
     *
     * Priority:
     * 1. ?website={slug} query parameter (for preview/testing)
     * 2. Domain matching
     * 3. Default active website
     */
    protected function getCurrentWebsite(Request $request): ?Website
    {
        $website = null;

        // Priority 1: Check for ?website={slug} query parameter
        $websiteSlug = $request->query('website');
        if ($websiteSlug) {
            $website = Website::with('agentInfo')
                ->where('slug', $websiteSlug)
                ->where('is_active', true)
                ->first();

            if ($website) {
                return $website;
            }
        }

        // Priority 2: Check for domain match
        $host = $request->getHost();

        // Remove 'www.' if present
        $host = preg_replace('/^www\./i', '', $host);

        // Skip domain matching for localhost/dev environments
        $skipDomains = ['localhost', '127.0.0.1', 'local'];
        $isLocalDev = in_array($host, $skipDomains) ||
                      str_ends_with($host, '.test') ||
                      str_ends_with($host, '.local');

        if (!$isLocalDev) {
            $website = Website::with('agentInfo')
                ->where('domain', $host)
                ->where('is_active', true)
                ->first();

            if ($website) {
                return $website;
            }

            // Also try with www prefix
            $website = Website::with('agentInfo')
                ->where('domain', 'www.' . $host)
                ->where('is_active', true)
                ->first();

            if ($website) {
                return $website;
            }
        }

        // Priority 3: Fall back to default website
        $website = Website::with('agentInfo')
            ->where('is_default', true)
            ->where('is_active', true)
            ->first();

        // Last resort: get any active website
        if (!$website) {
            $website = Website::with('agentInfo')
                ->where('is_active', true)
                ->first();
        }

        return $website;
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
            ];
        }

        // Check if Google OAuth is properly configured (not placeholder values)
        $googleClientId = config('services.google.client_id');
        $googleOAuthEnabled = !empty($googleClientId) &&
                              $googleClientId !== 'your-google-client-id' &&
                              !str_starts_with($googleClientId, 'your-');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'globalWebsite' => $globalWebsite,
            'currentWebsiteSlug' => $website?->slug,
            'googleMapsApiKey' => env('GOOGLE_MAPS_API_KEY', ''),
            'googleOAuthEnabled' => $googleOAuthEnabled,
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
