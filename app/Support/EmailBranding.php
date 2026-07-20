<?php

namespace App\Support;

use App\Models\Website;
use App\Services\Tenancy\TenantResolver;

/**
 * Resolves the site name / logo / base URL every outgoing email is branded
 * with, so all notifications share one chain instead of each carrying its
 * own siteName() copy:
 *
 *   - current():    the tenant site of the in-flight request (auth emails are
 *                   sent synchronously, so the request is still current),
 *                   falling back to the default website, then app config.
 *   - forWebsite(): an explicit website (scheduled alert emails carry the
 *                   site the search/favourite was created on), same fallback.
 *
 * The logo URL is absolutized against the site's own domain (emails render
 * outside the site, so relative asset paths would break).
 */
final class EmailBranding
{
    /**
     * Fixed landing-page agent fallbacks — the same constants the site
     * frontend uses (Footer / ContactSection) when a site has no
     * dashboard-entered agent details.
     */
    private const FALLBACK_AGENT_NAME = 'Jatin Gill';
    private const FALLBACK_AGENT_TITLE = 'Broker';
    private const FALLBACK_AGENT_PHONE = '+1 416 669 4755';
    private const FALLBACK_AGENT_EMAIL = 'info@jatingill.com';
    private const FALLBACK_AGENT_BROKERAGE = 'Re/Max Your Community Realty, Brokerage';

    /**
     * @return array{siteName: string, logoUrl: ?string, homeUrl: string}
     */
    public static function current(): array
    {
        try {
            $website = app()->runningInConsole()
                ? null
                : app(TenantResolver::class)->resolve(request());
        } catch (\Throwable $e) {
            $website = null;
        }

        return self::forWebsite($website);
    }

    /**
     * @return array{siteName: string, logoUrl: ?string, logoPath: ?string, homeUrl: string}
     */
    public static function forWebsite(?Website $website): array
    {
        try {
            $website ??= Website::where('is_default', true)->first();
        } catch (\Throwable $e) {
            $website = null;
        }

        $homeUrl = self::homeUrl($website);

        return [
            'siteName' => $website?->name ?: config('app.name'),
            'logoUrl' => self::absoluteLogoUrl($website, $homeUrl),
            // Local file path so templates can EMBED the logo inline (cid:)
            // — mail clients fetch remote images through proxies that
            // Cloudflare can block, which shows a broken image even though
            // the same URL works in a browser.
            'logoPath' => self::localPublicPath($website?->logo_url),
            'homeUrl' => $homeUrl,
        ];
    }

    /**
     * Absolute filesystem path for a site-relative public asset ("/assets/
     * logo.png"), or null for external URLs / missing files.
     */
    private static function localPublicPath(?string $urlPath): ?string
    {
        if (empty($urlPath) || str_starts_with($urlPath, 'http')) {
            return null;
        }

        $path = public_path(ltrim($urlPath, '/'));

        return is_file($path) ? $path : null;
    }

    /**
     * The agent block listing-alert emails lead with. Dashboard-entered
     * agent info on the site wins, then the default site's agent, then the
     * fixed landing-page agent (same chain the site frontend uses).
     *
     * @return array{name: string, title: string, phone: string, email: string, brokerage: string, photoUrl: ?string}
     */
    public static function agentForWebsite(?Website $website): array
    {
        try {
            $website ??= Website::where('is_default', true)->first();
            $agent = $website?->agentInfo;
            if (self::agentIsEmpty($agent) && !$website?->is_default) {
                $agent = Website::where('is_default', true)->first()?->agentInfo;
            }
        } catch (\Throwable $e) {
            $agent = null;
        }

        $contact = [];
        try {
            $contact = $website?->getContactInfo() ?? [];
        } catch (\Throwable $e) {
        }

        $homeUrl = self::homeUrl($website);
        $photo = $agent?->profile_image;

        return [
            'name' => $agent?->agent_name ?: self::FALLBACK_AGENT_NAME,
            'title' => $agent?->agent_title ?: self::FALLBACK_AGENT_TITLE,
            'phone' => $agent?->agent_phone ?: ($contact['phone'] ?? '') ?: self::FALLBACK_AGENT_PHONE,
            'email' => ($contact['email'] ?? '') ?: self::FALLBACK_AGENT_EMAIL,
            'brokerage' => $agent?->brokerage ?: self::FALLBACK_AGENT_BROKERAGE,
            'photoUrl' => $photo
                ? (str_starts_with($photo, 'http') ? $photo : $homeUrl . '/' . ltrim($photo, '/'))
                : null,
            // Same inline-embed treatment as the site logo (see forWebsite)
            'photoPath' => self::localPublicPath($photo),
        ];
    }

    private static function agentIsEmpty(?object $agent): bool
    {
        return !$agent
            || (empty($agent->agent_name) && empty($agent->agent_phone) && empty($agent->brokerage));
    }

    /**
     * Prefer the live request's host (keeps the tenant domain the user is
     * on); scheduled sends fall back to the website's own domain, then the
     * app URL.
     */
    private static function homeUrl(?Website $website): string
    {
        if (!app()->runningInConsole()) {
            return rtrim(url('/'), '/');
        }

        if (!empty($website?->domain)) {
            return 'https://' . trim($website->domain, '/');
        }

        return rtrim((string) config('app.url'), '/');
    }

    private static function absoluteLogoUrl(?Website $website, string $homeUrl): ?string
    {
        $logo = $website?->logo_url;

        if (empty($logo)) {
            return null;
        }

        if (str_starts_with($logo, 'http://') || str_starts_with($logo, 'https://')) {
            return $logo;
        }

        return $homeUrl . '/' . ltrim($logo, '/');
    }
}
