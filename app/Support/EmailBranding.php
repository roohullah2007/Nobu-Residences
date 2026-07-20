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
     * @return array{siteName: string, logoUrl: ?string, homeUrl: string}
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
            'homeUrl' => $homeUrl,
        ];
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
