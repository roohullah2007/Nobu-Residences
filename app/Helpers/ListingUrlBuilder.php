<?php

namespace App\Helpers;

/**
 * Single source of truth for canonical MLS listing URLs (client SEO spec).
 *
 * Condo (listing matched to a Building row):
 *   /mls/{city}/{building-slug}/{street-slug}/unit-{unit}-{MLS}
 *   e.g. /mls/toronto/the-well-condos/480-front-st-w/unit-1009-E12057013
 *
 * Not matched to a building (homes/townhomes and unmatched condos):
 *   /mls/{city}/homes-for-{sale|rent}/{street-address-slug}-{MLS}
 *   e.g. /mls/toronto/homes-for-rent/144-elmer-avenue-E12057013
 *
 * The frontend mirror lives in resources/js/utils/propertyUrl.js
 * (generatePropertyUrl) — slug rules must stay byte-identical so card links
 * land directly on the canonical URL with no 301 hop.
 */
class ListingUrlBuilder
{
    /**
     * @param array      $property formatRepliersPropertyData() output (needs
     *                             listingKey, unitNumber, streetNumber,
     *                             streetName, streetSuffix, streetDirection,
     *                             city, transactionType)
     * @param array|null $building matched building data (name, slug) or null
     */
    public static function canonicalUrl(array $property, ?array $building): string
    {
        $listingKey = (string) ($property['listingKey'] ?? $property['ListingKey'] ?? '');
        $citySlug = self::citySlug((string) ($property['city'] ?? $property['City'] ?? '')) ?: 'toronto';

        $streetSlug = self::slugify(trim(implode(' ', array_filter([
            $property['streetNumber'] ?? $property['StreetNumber'] ?? '',
            $property['streetName'] ?? $property['StreetName'] ?? '',
            $property['streetSuffix'] ?? $property['StreetSuffix'] ?? '',
            $property['streetDirection'] ?? $property['StreetDirection'] ?? '',
        ]))));

        if ($building && (!empty($building['slug']) || !empty($building['name']))) {
            $buildingSlug = !empty($building['slug'])
                ? (string) $building['slug']
                : self::slugify((string) $building['name']);
            // Route pattern allows only [A-Za-z0-9] inside the unit segment
            // ("PH 1" → "PH1") — anything else would build an unroutable path.
            $unitNumber = preg_replace('/[^A-Za-z0-9]/', '', (string) ($property['unitNumber'] ?? $property['UnitNumber'] ?? ''));
            $unitSegment = $unitNumber !== '' ? "unit-{$unitNumber}-{$listingKey}" : $listingKey;

            if ($buildingSlug !== '' && $streetSlug !== '') {
                return "/mls/{$citySlug}/{$buildingSlug}/{$streetSlug}/{$unitSegment}";
            }
        }

        $isRent = ($property['transactionType'] ?? $property['TransactionType'] ?? '') === 'For Lease';
        $addressSlug = $streetSlug !== '' ? $streetSlug : self::slugify(self::streetFromAddress(
            (string) ($property['address'] ?? '')
        ));
        if ($addressSlug === '') {
            $addressSlug = 'property';
        }

        return '/mls/' . $citySlug . '/homes-for-' . ($isRent ? 'rent' : 'sale') . "/{$addressSlug}-{$listingKey}";
    }

    /**
     * Byte-identical to createSlug() in resources/js/utils/slug.js.
     */
    public static function slugify(string $text): string
    {
        $text = strtolower(trim($text));
        $text = preg_replace('/[^\w\s-]/', '', $text);
        $text = preg_replace('/[\s_-]+/', '-', $text);

        return trim($text, '-');
    }

    /**
     * City slug with Repliers district codes stripped ("Toronto C08" → "toronto"),
     * mirroring resources/js/utils/propertyUrl.js.
     */
    public static function citySlug(string $city): string
    {
        return self::slugify(preg_replace('/\s*[cewns]\d{2}\b/i', '', $city));
    }

    /**
     * Street line from a display address like "1009 - 480 Front St W, Toronto":
     * strips the unit prefix and everything after the first comma.
     */
    private static function streetFromAddress(string $address): string
    {
        $address = preg_replace('/^\s*[A-Za-z0-9]+\s*-\s*/', '', $address);
        $commaAt = strpos($address, ',');

        return trim($commaAt === false ? $address : substr($address, 0, $commaAt));
    }
}
