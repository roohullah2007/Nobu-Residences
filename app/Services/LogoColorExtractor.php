<?php

namespace App\Services;

/**
 * Server-side dominant-color extraction — a faithful PHP/GD port of
 * resources/js/lib/extractLogoColors.js, so a logo scraped by
 * buildings:scrape-logos yields the SAME brand_colors palette the browser
 * would produce at Website Create time. Returns the dotted-key shape the
 * Website Create form + backend expect (e.g. 'brand_colors.primary').
 *
 * Works on raster logos (PNG/JPG/GIF/WebP) via GD. SVG cannot be rasterized
 * without Imagick, so fromBinary() returns null for it — the in-browser
 * extractor handles SVG at Create time instead.
 */
class LogoColorExtractor
{
    /**
     * Extract a full brand palette from raw image bytes.
     * Returns an assoc array of dotted brand_colors.* keys, or null when the
     * bytes can't be read or carry no usable color (transparent / all-white).
     */
    public static function fromBinary(string $body): ?array
    {
        if (!function_exists('imagecreatefromstring')) {
            return null;
        }

        $img = @imagecreatefromstring($body);
        if ($img === false) {
            return null;
        }

        try {
            $srcW = imagesx($img);
            $srcH = imagesy($img);
            if ($srcW < 1 || $srcH < 1) {
                return null;
            }

            // Downscale — 64px max side is plenty for a dominant-color read and
            // keeps the pixel loop cheap (mirrors the JS extractor).
            $scale = min(1, 64 / max($srcW, $srcH));
            $w = max(1, (int) round($srcW * $scale));
            $h = max(1, (int) round($srcH * $scale));

            $canvas = imagecreatetruecolor($w, $h);
            imagealphablending($canvas, false);
            imagesavealpha($canvas, true);
            imagecopyresampled($canvas, $img, 0, 0, 0, 0, $w, $h, $srcW, $srcH);

            // Bucket colors, quantizing to 4 bits/channel so near-identical
            // shades merge. Track a frequency count and the summed raw RGB so
            // we can return the bucket average (crisper than the quantized
            // center).
            $buckets = [];
            for ($y = 0; $y < $h; $y++) {
                for ($x = 0; $x < $w; $x++) {
                    $rgba = imagecolorat($canvas, $x, $y);
                    $r = ($rgba >> 16) & 0xFF;
                    $g = ($rgba >> 8) & 0xFF;
                    $b = $rgba & 0xFF;
                    // GD alpha is 0 (opaque) .. 127 (transparent); convert to
                    // the 0..255 opacity the JS threshold (a < 125) assumes.
                    $alpha = ($rgba >> 24) & 0x7F;
                    $opacity = 255 - (int) round($alpha * (255 / 127));

                    if ($opacity < 125) continue;                 // transparent
                    if ($r > 244 && $g > 244 && $b > 244) continue; // white-ish bg
                    if ($r < 12 && $g < 12 && $b < 12) continue;    // pure black outlines

                    $key = (($r >> 4) << 8) | (($g >> 4) << 4) | ($b >> 4);
                    if (isset($buckets[$key])) {
                        $buckets[$key]['count']++;
                        $buckets[$key]['r'] += $r;
                        $buckets[$key]['g'] += $g;
                        $buckets[$key]['b'] += $b;
                    } else {
                        $buckets[$key] = ['count' => 1, 'r' => $r, 'g' => $g, 'b' => $b];
                    }
                }
            }

            imagedestroy($canvas);

            if (empty($buckets)) {
                return null;
            }

            $colors = [];
            foreach ($buckets as $bucket) {
                $ar = $bucket['r'] / $bucket['count'];
                $ag = $bucket['g'] / $bucket['count'];
                $ab = $bucket['b'] / $bucket['count'];
                $colors[] = [
                    'hex' => self::rgbToHex($ar, $ag, $ab),
                    'count' => $bucket['count'],
                    'sat' => self::saturation($ar, $ag, $ab),
                ];
            }

            // Weight vivid colors higher so a logo's accent beats a large
            // muddy-gray field for the "primary" slot.
            usort($colors, fn ($a, $b) =>
                ($b['count'] * (0.4 + $b['sat'])) <=> ($a['count'] * (0.4 + $a['sat']))
            );

            $primary = $colors[0]['hex'];

            // Second color that's visibly different from the primary, else reuse.
            $secondary = self::shade($primary, 0.25);
            foreach ($colors as $c) {
                if ($c['hex'] !== $primary && self::colorDistance($c['hex'], $primary) > 60) {
                    $secondary = $c['hex'];
                    break;
                }
            }

            return [
                'brand_colors.primary' => $primary,
                'brand_colors.accent' => self::tint($primary, 0.9),
                'brand_colors.text' => '#000000',
                'brand_colors.background' => '#FFFFFF',

                'brand_colors.button_primary_bg' => $secondary,
                'brand_colors.button_primary_text' => self::readableTextOn($secondary),
                'brand_colors.button_secondary_bg' => $primary,
                'brand_colors.button_secondary_text' => self::readableTextOn($primary),
                'brand_colors.button_tertiary_bg' => self::shade($primary, 0.75),
                'brand_colors.button_tertiary_text' => '#FFFFFF',
                'brand_colors.button_quaternary_bg' => '#FFFFFF',
                'brand_colors.button_quaternary_text' => $primary,

                'brand_colors.footer_bg' => self::shade($primary, 0.78),
                'brand_colors.footer_text' => '#FFFFFF',

                'brand_colors.link_color' => $primary,
                'brand_colors.link_hover' => self::shade($primary, 0.25),
            ];
        } finally {
            if (is_resource($img) || $img instanceof \GdImage) {
                @imagedestroy($img);
            }
        }
    }

    // Relative luminance (WCAG) → pick black/white text that stays readable
    // on top of a given background color.
    private static function readableTextOn(string $hex): string
    {
        [$r, $g, $b] = array_values(self::hexToRgb($hex));
        $lum = (0.299 * $r + 0.587 * $g + 0.114 * $b) / 255;
        return $lum > 0.6 ? '#000000' : '#FFFFFF';
    }

    private static function hexToRgb(string $hex): array
    {
        $h = ltrim($hex, '#');
        return [
            'r' => hexdec(substr($h, 0, 2)),
            'g' => hexdec(substr($h, 2, 2)),
            'b' => hexdec(substr($h, 4, 2)),
        ];
    }

    private static function rgbToHex(float $r, float $g, float $b): string
    {
        $to2 = fn (float $n) => str_pad(dechex(max(0, min(255, (int) round($n)))), 2, '0', STR_PAD_LEFT);
        return strtoupper('#' . $to2($r) . $to2($g) . $to2($b));
    }

    // Mix a color toward white (amount 0..1) — the light accent tint.
    private static function tint(string $hex, float $amount): string
    {
        [$r, $g, $b] = array_values(self::hexToRgb($hex));
        return self::rgbToHex($r + (255 - $r) * $amount, $g + (255 - $g) * $amount, $b + (255 - $b) * $amount);
    }

    // Mix a color toward black (amount 0..1) — hover / footer shades.
    private static function shade(string $hex, float $amount): string
    {
        [$r, $g, $b] = array_values(self::hexToRgb($hex));
        return self::rgbToHex($r * (1 - $amount), $g * (1 - $amount), $b * (1 - $amount));
    }

    // Saturation of an RGB triple (0..1). Grays ~0; vivid colors preferred as
    // the brand primary over muddy near-grays.
    private static function saturation(float $r, float $g, float $b): float
    {
        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        return $max == 0 ? 0 : ($max - $min) / $max;
    }

    private static function colorDistance(string $a, string $b): float
    {
        $c1 = self::hexToRgb($a);
        $c2 = self::hexToRgb($b);
        return sqrt(
            ($c1['r'] - $c2['r']) ** 2 +
            ($c1['g'] - $c2['g']) ** 2 +
            ($c1['b'] - $c2['b']) ** 2
        );
    }
}
