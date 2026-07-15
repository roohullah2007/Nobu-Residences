<?php

namespace App\Services;

use App\Models\Building;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Scrape a building's brand logo from its own marketing website
 * (buildings.website_url — e.g. mcitycondos.com) and derive the site color
 * theme from it.
 *
 * A building's logo lives in the header/nav of its marketing site. This
 * service fetches that page, scores every logo candidate (schema.org logo,
 * og:image, header <img> tagged "logo", apple-touch-icon…), downloads the
 * best one to public/images/buildings exactly the way the manual admin
 * upload + the image-download cron do, and runs LogoColorExtractor over the
 * bytes so the palette is stored with the building. Selecting that building
 * in Website Create then shows its colors instantly.
 *
 * Every method fails soft (returns null + logs) — a bad site never throws.
 */
class LogoScraperService
{
    /** Per-request HTTP timeout in seconds. */
    private const TIMEOUT_SECONDS = 20;

    /** A logo file bigger than this is not a logo. */
    private const MAX_BYTES = 5 * 1024 * 1024;

    /** Browser-like UA — some marketing sites 403 the default Guzzle agent. */
    private const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

    /**
     * Resolve → download → store a logo for one building and detect its
     * palette. Returns ['logo' => '/images/buildings/…', 'brand_colors' =>
     * [...]|null] on success, or null when no logo could be obtained.
     *
     * brand_colors is null for logos we can't read server-side (SVG); the
     * logo is still stored and the browser detects colors at Create time.
     */
    public function scrapeForBuilding(Building $building): ?array
    {
        $site = trim((string) $building->website_url);
        if ($site === '') {
            return null;
        }

        $logoUrl = $this->resolveLogoUrl($site);
        if ($logoUrl === null) {
            return null;
        }

        $path = $this->downloadLogo($building, $logoUrl, $body);
        if ($path === null) {
            return null;
        }

        $colors = null;
        // Skip GD extraction for SVG (can't rasterize without Imagick).
        if (!$this->looksLikeSvg($body)) {
            $colors = LogoColorExtractor::fromBinary($body);
        }

        return ['logo' => $path, 'brand_colors' => $colors];
    }

    /**
     * Fetch the marketing page and pick the best logo URL (absolute), or null.
     */
    public function resolveLogoUrl(string $site): ?string
    {
        $url = $this->normalizeUrl($site);
        if ($url === null) {
            return null;
        }

        try {
            $response = Http::withHeaders([
                    'User-Agent' => self::USER_AGENT,
                    'Accept' => 'text/html,application/xhtml+xml',
                ])
                ->timeout(self::TIMEOUT_SECONDS)
                ->get($url);

            if (!$response->successful()) {
                Log::info('Logo scrape: site returned non-2xx', ['url' => $url, 'status' => $response->status()]);
                return null;
            }

            $html = $response->body();
            if ($html === '') {
                return null;
            }

            // Resolve relative logo paths against the FINAL url after redirects
            // (a redirect can move to www / another host).
            $base = $this->effectiveUri($response) ?? $url;

            return $this->pickLogoFromHtml($html, $base);
        } catch (\Throwable $e) {
            Log::info('Logo scrape: fetch error', ['url' => $url, 'error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Parse the HTML and return the highest-scoring absolute logo URL.
     */
    private function pickLogoFromHtml(string $html, string $baseUrl): ?string
    {
        $candidates = [];

        // 1. schema.org / JSON-LD "logo": "…" — an explicit brand logo.
        if (preg_match_all('/"logo"\s*:\s*"([^"]+)"/i', $html, $m)) {
            foreach ($m[1] as $raw) {
                $candidates[] = ['url' => stripcslashes($raw), 'score' => 100];
            }
        }

        // DOM pass for <img>, <link rel=icon>, and og:image.
        $dom = new \DOMDocument();
        $prev = libxml_use_internal_errors(true);
        // Force UTF-8 so accented alt text doesn't derail the parser.
        $loaded = $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);
        libxml_clear_errors();
        libxml_use_internal_errors($prev);

        if ($loaded) {
            $xpath = new \DOMXPath($dom);

            // 2. <img> candidates, scored by "logo" hints + header/nav ancestry.
            foreach ($xpath->query('//img') as $img) {
                /** @var \DOMElement $img */
                $src = $img->getAttribute('src') ?: $img->getAttribute('data-src');
                if ($src === '') {
                    continue;
                }
                $hint = strtolower(
                    $img->getAttribute('class') . ' ' .
                    $img->getAttribute('id') . ' ' .
                    $img->getAttribute('alt') . ' ' .
                    $src
                );

                $score = 0;
                if (str_contains($hint, 'logo')) $score += 50;
                if (str_contains($hint, 'brand')) $score += 10;
                if ($this->hasHeaderAncestor($img)) $score += 25;
                // Sprite / social / payment icons are never the brand logo.
                if (preg_match('/(sprite|icon|social|facebook|instagram|twitter|payment|badge)/', $hint)) $score -= 40;

                if ($score > 0) {
                    $candidates[] = ['url' => $src, 'score' => $score];
                }
            }

            // 3. <link rel="apple-touch-icon"> / icon — a decent square fallback.
            foreach ($xpath->query('//link[@rel]') as $link) {
                /** @var \DOMElement $link */
                $rel = strtolower($link->getAttribute('rel'));
                $href = $link->getAttribute('href');
                if ($href === '') {
                    continue;
                }
                if (str_contains($rel, 'apple-touch-icon')) {
                    $candidates[] = ['url' => $href, 'score' => 20];
                } elseif (str_contains($rel, 'icon')) {
                    $candidates[] = ['url' => $href, 'score' => 8];
                }
            }

            // 4. og:image — last resort (usually a hero, so weakest).
            foreach ($xpath->query('//meta[@property="og:image" or @name="og:image"]') as $meta) {
                /** @var \DOMElement $meta */
                $content = $meta->getAttribute('content');
                if ($content !== '') {
                    $candidates[] = ['url' => $content, 'score' => 5];
                }
            }
        }

        if (empty($candidates)) {
            return null;
        }

        // Highest score wins; resolve to absolute and skip data: URIs.
        usort($candidates, fn ($a, $b) => $b['score'] <=> $a['score']);
        foreach ($candidates as $candidate) {
            $abs = $this->absoluteUrl($candidate['url'], $baseUrl);
            if ($abs !== null) {
                return $abs;
            }
        }

        return null;
    }

    /**
     * Walk up to 4 ancestors looking for a <header>/<nav> or a header-ish
     * class — a logo sitting there is far more likely the real brand mark.
     */
    private function hasHeaderAncestor(\DOMElement $el): bool
    {
        $node = $el->parentNode;
        for ($i = 0; $i < 4 && $node instanceof \DOMElement; $i++) {
            $tag = strtolower($node->tagName);
            if ($tag === 'header' || $tag === 'nav') {
                return true;
            }
            $class = strtolower($node->getAttribute('class') . ' ' . $node->getAttribute('id'));
            if (preg_match('/(header|navbar|masthead|topbar|site-nav)/', $class)) {
                return true;
            }
            $node = $node->parentNode;
        }
        return false;
    }

    /**
     * Download one logo URL. Returns the stored web path
     * ("/images/buildings/…") or null. The raw bytes are handed back via
     * $body so the caller can run color extraction without re-downloading.
     */
    public function downloadLogo(Building $building, string $url, ?string &$body = null): ?string
    {
        $body = null;
        try {
            $response = Http::withHeaders([
                    'User-Agent' => self::USER_AGENT,
                    'Accept' => 'image/*',
                ])
                ->timeout(self::TIMEOUT_SECONDS)
                ->get($url);

            if (!$response->successful()) {
                Log::info('Logo download: non-2xx', ['url' => $url, 'status' => $response->status()]);
                return null;
            }

            $bytes = $response->body();
            if ($bytes === '' || strlen($bytes) > self::MAX_BYTES) {
                Log::info('Logo download: rejected by size', ['url' => $url, 'bytes' => strlen($bytes)]);
                return null;
            }

            $extension = $this->resolveExtension($bytes, $url);
            if ($extension === null) {
                Log::info('Logo download: unsupported image', ['url' => $url]);
                return null;
            }

            $directory = public_path('images/buildings');
            if (!is_dir($directory)) {
                mkdir($directory, 0777, true);
            }

            $name = 'building_' . $building->id . '_logo_' . time() . '_' . uniqid() . '.' . $extension;
            if (file_put_contents($directory . DIRECTORY_SEPARATOR . $name, $bytes) === false) {
                Log::warning('Logo download: could not write file', ['url' => $url, 'file' => $name]);
                return null;
            }

            $body = $bytes;
            return '/images/buildings/' . $name;
        } catch (\Throwable $e) {
            Log::info('Logo download: error', ['url' => $url, 'error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Validated file extension for the bytes, or null when not a logo image.
     * SVG is detected from content (getimagesizefromstring can't read it).
     */
    private function resolveExtension(string $bytes, string $url): ?string
    {
        if ($this->looksLikeSvg($bytes)) {
            return 'svg';
        }

        $info = @getimagesizefromstring($bytes);
        return match ($info['mime'] ?? null) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            default => null,
        };
    }

    private function looksLikeSvg(?string $bytes): bool
    {
        if ($bytes === null) {
            return false;
        }
        $head = ltrim(substr($bytes, 0, 512));
        return str_contains($head, '<svg') || (str_starts_with($head, '<?xml') && str_contains($bytes, '<svg'));
    }

    /**
     * Absolute URL for a src/href relative to the page. Skips data: URIs.
     */
    private function absoluteUrl(string $ref, string $baseUrl): ?string
    {
        $ref = trim(html_entity_decode($ref));
        if ($ref === '' || str_starts_with($ref, 'data:')) {
            return null;
        }
        if (str_starts_with($ref, '//')) {
            $scheme = parse_url($baseUrl, PHP_URL_SCHEME) ?: 'https';
            return $scheme . ':' . $ref;
        }
        if (preg_match('#^https?://#i', $ref)) {
            return $ref;
        }

        $parts = parse_url($baseUrl);
        if (empty($parts['scheme']) || empty($parts['host'])) {
            return null;
        }
        $origin = $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');

        if (str_starts_with($ref, '/')) {
            return $origin . $ref;
        }

        // Relative to the current directory of the page path.
        $dir = isset($parts['path']) ? preg_replace('#/[^/]*$#', '/', $parts['path']) : '/';
        if ($dir === '' || $dir[0] !== '/') {
            $dir = '/' . $dir;
        }
        return $origin . $dir . $ref;
    }

    private function normalizeUrl(string $site): ?string
    {
        $site = trim($site);
        if ($site === '') {
            return null;
        }
        if (!preg_match('#^https?://#i', $site)) {
            $site = 'https://' . $site;
        }
        return filter_var($site, FILTER_VALIDATE_URL) ? $site : null;
    }

    private function effectiveUri($response): ?string
    {
        try {
            $uri = $response->transferStats?->getEffectiveUri();
            return $uri ? (string) $uri : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
