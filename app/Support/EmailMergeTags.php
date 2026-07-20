<?php

namespace App\Support;

/**
 * Replaces %merge_tags% in admin-edited email template text with the real
 * per-recipient values (case-insensitive: %first_name% == %First_Name%).
 * Unknown tags render as empty — a typo must never reach an inbox as
 * literal "%first_nam%".
 */
final class EmailMergeTags
{
    /**
     * Plain-text context (subject lines, headlines rendered with {{ }}).
     */
    public static function apply(string $template, array $values): string
    {
        foreach ($values as $tag => $value) {
            $template = str_ireplace('%' . $tag . '%', (string) $value, $template);
        }

        return self::stripUnknown($template);
    }

    /**
     * HTML context (the intro box, rendered with {!! !!}): the admin's
     * template text and every value are escaped; only $rawValues (trusted,
     * self-built HTML like %site_link%) are inserted unescaped.
     */
    public static function applyHtml(string $template, array $values, array $rawValues = []): string
    {
        $out = e($template);

        foreach ($values as $tag => $value) {
            $out = str_ireplace('%' . $tag . '%', e((string) $value), $out);
        }
        foreach ($rawValues as $tag => $html) {
            $out = str_ireplace('%' . $tag . '%', (string) $html, $out);
        }

        return self::stripUnknown($out);
    }

    private static function stripUnknown(string $text): string
    {
        return preg_replace('/%[a-z0-9_]+%/i', '', $text);
    }
}
