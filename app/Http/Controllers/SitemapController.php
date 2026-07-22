<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Building;
use App\Models\Website;
use App\Services\Tenancy\TenantResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Per-tenant /sitemap.xml. Every landing-page domain gets its own sitemap
 * built from ITS pages: home, the linked building page, the building city's
 * for-sale/for-rent pages, the static public pages and the published blogs.
 * The admin host serves no public site, so it gets a 404 like every other
 * public route there.
 */
class SitemapController extends Controller
{
    private const STATIC_PATHS = [
        '/search',
        '/blogs',
        '/developers',
        '/contact',
        '/privacy',
        '/terms',
    ];

    private const CACHE_SECONDS = 3600;

    private const MAX_BLOG_URLS = 500;

    public function __construct(private TenantResolver $resolver)
    {
    }

    public function __invoke(Request $request): Response
    {
        $website = $this->resolver->resolve($request);
        if (!$website) {
            abort(404);
        }

        $base = rtrim($request->getSchemeAndHttpHost(), '/');

        $xml = Cache::remember(
            'sitemap.' . $website->id . '.' . md5($base),
            self::CACHE_SECONDS,
            fn () => $this->buildXml($website, $base)
        );

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    private function buildXml(Website $website, string $base): string
    {
        $entries = [['loc' => $base . '/', 'priority' => '1.0']];

        $building = $website->homepage_building_id
            ? Building::query()->find($website->homepage_building_id, ['id', 'slug', 'city', 'updated_at'])
            : null;

        if ($building) {
            // Clean tenant inventory pages (client SEO spec): the building's
            // own units for sale / for rent at the domain root.
            $entries[] = ['loc' => "{$base}/for-sale", 'priority' => '0.9'];
            $entries[] = ['loc' => "{$base}/for-rent", 'priority' => '0.9'];
        }

        if ($building && $building->slug && $building->city) {
            $citySlug = Str::slug($building->city);
            $entries[] = [
                'loc' => "{$base}/{$citySlug}/{$building->slug}",
                'lastmod' => $building->updated_at?->toDateString(),
                'priority' => '0.9',
            ];
            $entries[] = ['loc' => "{$base}/{$citySlug}/for-sale", 'priority' => '0.8'];
            $entries[] = ['loc' => "{$base}/{$citySlug}/for-rent", 'priority' => '0.8'];
        }

        foreach (self::STATIC_PATHS as $path) {
            $entries[] = ['loc' => $base . $path, 'priority' => '0.5'];
        }

        $blogs = Blog::published()
            ->orderByDesc('published_at')
            ->limit(self::MAX_BLOG_URLS)
            ->get(['slug', 'updated_at']);
        foreach ($blogs as $blog) {
            $entries[] = [
                'loc' => "{$base}/blogs/{$blog->slug}",
                'lastmod' => $blog->updated_at?->toDateString(),
                'priority' => '0.6',
            ];
        }

        $lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
        $lines[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($entries as $entry) {
            $lines[] = '  <url>';
            $lines[] = '    <loc>' . e($entry['loc']) . '</loc>';
            if (!empty($entry['lastmod'])) {
                $lines[] = '    <lastmod>' . e($entry['lastmod']) . '</lastmod>';
            }
            $lines[] = '    <priority>' . $entry['priority'] . '</priority>';
            $lines[] = '  </url>';
        }
        $lines[] = '</urlset>';

        return implode("\n", $lines);
    }
}
