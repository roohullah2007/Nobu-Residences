<?php

namespace App\Support;

/**
 * Small builders for schema.org JSON-LD objects rendered server-side by
 * app.blade.php via the per-page `seo.jsonLd` prop.
 */
class Schema
{
    /**
     * FAQPage schema from a collection of FAQs ({question, answer}).
     * Returns null when empty so callers can array_filter it away.
     */
    public static function faqPage(iterable $faqs): ?array
    {
        $entities = [];
        foreach ($faqs as $faq) {
            $question = is_array($faq) ? ($faq['question'] ?? '') : $faq->question;
            $answer = is_array($faq) ? ($faq['answer'] ?? '') : $faq->answer;
            if ($question === '' || $answer === '') {
                continue;
            }
            $entities[] = [
                '@type' => 'Question',
                'name' => $question,
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $answer,
                ],
            ];
        }

        if (empty($entities)) {
            return null;
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $entities,
        ];
    }

    /**
     * ApartmentComplex schema for a condo building. The featured image is the
     * building's hero image (main_image, mobile hero as a secondary), given as
     * absolute URLs — crawlers resolve schema images against nothing.
     */
    public static function building(\App\Models\Building $building, ?string $url = null): ?array
    {
        $absolute = fn (?string $path) => $path
            ? (str_starts_with($path, 'http') ? $path : url($path))
            : null;

        $images = array_values(array_filter([
            $absolute($building->main_image),
            $absolute($building->hero_image_mobile),
        ]));

        $address = array_filter([
            '@type' => 'PostalAddress',
            'streetAddress' => $building->address ?: $building->street_address_1,
            'addressLocality' => $building->city,
            'addressRegion' => $building->province,
            'postalCode' => $building->postal_code,
            'addressCountry' => $building->country ?: 'CA',
        ]);

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'ApartmentComplex',
            'name' => $building->name,
            'url' => $url ?: url()->current(),
            'image' => $images ?: null,
            'photo' => $images ? $images[0] : null,
            'description' => $building->description
                ? \Illuminate\Support\Str::limit(strip_tags($building->description), 300)
                : null,
            'address' => count($address) > 1 ? $address : null,
            'geo' => ($building->latitude && $building->longitude) ? [
                '@type' => 'GeoCoordinates',
                'latitude' => $building->latitude,
                'longitude' => $building->longitude,
            ] : null,
            'numberOfAccommodationUnits' => $building->total_units ?: null,
            'yearBuilt' => $building->year_built ?: null,
        ]);
    }
}
