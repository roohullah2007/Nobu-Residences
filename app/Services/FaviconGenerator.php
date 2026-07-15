<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Turn a site logo into a browser-tab favicon, saved to public/assets.
 *
 * Raster logos (PNG/JPG/GIF/WebP) are rendered — via GD — into a square,
 * transparent-background PNG that "contains" the logo (never stretched). SVG
 * logos are copied through as-is, since browsers accept an SVG favicon
 * directly. Returns the web path ('/assets/…') or null on any failure — the
 * caller falls back to the inherited / default favicon.
 */
class FaviconGenerator
{
    /** Output favicon side length in pixels. */
    private const SIZE = 64;

    /** A logo bigger than this is never processed. */
    private const MAX_BYTES = 5 * 1024 * 1024;

    /**
     * @param string $logo Web path ('/images/buildings/…', '/assets/…') or an
     *                      absolute URL.
     * @return string|null  '/assets/favicon_…' web path, or null.
     */
    public function fromLogo(string $logo): ?string
    {
        $bytes = $this->readBytes($logo);
        if ($bytes === null || $bytes === '' || strlen($bytes) > self::MAX_BYTES) {
            return null;
        }

        return $this->looksLikeSvg($bytes)
            ? $this->store($bytes, 'svg')
            : $this->renderPng($bytes);
    }

    /**
     * Read the logo bytes from local public storage or a remote URL.
     */
    private function readBytes(string $logo): ?string
    {
        $logo = trim($logo);
        if ($logo === '') {
            return null;
        }

        // Remote URL.
        if (preg_match('#^https?://#i', $logo)) {
            try {
                $response = Http::timeout(20)->withHeaders(['Accept' => 'image/*'])->get($logo);
                return $response->successful() ? $response->body() : null;
            } catch (\Throwable $e) {
                Log::info('Favicon: remote logo fetch failed', ['logo' => $logo, 'error' => $e->getMessage()]);
                return null;
            }
        }

        // Local path under public/. Strip any host the model left on it and a
        // leading slash, then read from disk.
        $relative = ltrim(preg_replace('#^https?://[^/]+#i', '', $logo), '/');
        $path = public_path($relative);
        return is_file($path) ? (@file_get_contents($path) ?: null) : null;
    }

    /**
     * Render raster bytes into a square, transparent PNG favicon.
     */
    private function renderPng(string $bytes): ?string
    {
        if (!function_exists('imagecreatefromstring')) {
            return null;
        }

        $src = @imagecreatefromstring($bytes);
        if ($src === false) {
            return null;
        }

        try {
            $sw = imagesx($src);
            $sh = imagesy($src);
            if ($sw < 1 || $sh < 1) {
                return null;
            }

            // Contain-fit: scale so the whole logo fits inside SIZE×SIZE.
            $scale = min(self::SIZE / $sw, self::SIZE / $sh);
            $dw = max(1, (int) round($sw * $scale));
            $dh = max(1, (int) round($sh * $scale));
            $dx = (int) round((self::SIZE - $dw) / 2);
            $dy = (int) round((self::SIZE - $dh) / 2);

            $canvas = imagecreatetruecolor(self::SIZE, self::SIZE);
            imagealphablending($canvas, false);
            imagesavealpha($canvas, true);
            $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
            imagefilledrectangle($canvas, 0, 0, self::SIZE, self::SIZE, $transparent);
            imagealphablending($canvas, true);
            imagecopyresampled($canvas, $src, $dx, $dy, 0, 0, $dw, $dh, $sw, $sh);

            $file = $this->assetPath('png');
            imagealphablending($canvas, false);
            imagesavealpha($canvas, true);
            $ok = imagepng($canvas, $file['absolute']);
            imagedestroy($canvas);

            return $ok ? $file['web'] : null;
        } finally {
            if ($src instanceof \GdImage || is_resource($src)) {
                @imagedestroy($src);
            }
        }
    }

    /**
     * Persist raw bytes (e.g. an SVG logo) as a favicon asset.
     */
    private function store(string $bytes, string $ext): ?string
    {
        $file = $this->assetPath($ext);
        return file_put_contents($file['absolute'], $bytes) !== false ? $file['web'] : null;
    }

    /**
     * Allocate a unique favicon file under public/assets and return both the
     * absolute disk path and the web path.
     */
    private function assetPath(string $ext): array
    {
        $dir = public_path('assets');
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $name = 'favicon_' . uniqid() . '_' . time() . '.' . $ext;
        return [
            'absolute' => $dir . DIRECTORY_SEPARATOR . $name,
            'web' => '/assets/' . $name,
        ];
    }

    private function looksLikeSvg(string $bytes): bool
    {
        $head = ltrim(substr($bytes, 0, 512));
        return str_contains($head, '<svg') || (str_starts_with($head, '<?xml') && str_contains($bytes, '<svg'));
    }
}
