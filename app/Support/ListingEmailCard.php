<?php

namespace App\Support;

/**
 * Maps a formatted alert listing (SavedSearchAlertService /
 * FavouriteUpdateAlertService shape) to a property card for the
 * emails/listing-alert.blade.php template.
 */
final class ListingEmailCard
{
    /**
     * @param array{name: string, title: string, phone: string, email: string, brokerage: string, photoUrl: ?string} $agent
     */
    public static function make(array $listing, array $agent, string $homeUrl): array
    {
        $mls = $listing['mls_id'] ?? null;
        $url = $mls ? $homeUrl . '/property/' . $mls : $homeUrl;
        $address = trim((string) ($listing['address'] ?? '')) ?: 'View listing';
        $isLease = strcasecmp((string) ($listing['transaction_type'] ?? ''), 'lease') === 0;

        $bedsBaths = implode(' · ', array_filter([
            ($listing['bedrooms'] ?? null) !== null && $listing['bedrooms'] !== '' ? $listing['bedrooms'] . ' bed' : null,
            !empty($listing['bathrooms']) ? $listing['bathrooms'] . ' bath' : null,
        ]));
        if ($bedsBaths === '' && !empty($listing['square_footage'])) {
            $bedsBaths = $listing['square_footage'] . ' sqft';
        }

        return [
            'banner' => $isLease ? 'FOR RENT' : 'FOR SALE',
            'address_label' => $address,
            'url' => $url,
            'image_url' => $listing['image_url'] ?? null,
            'city' => $listing['city'] ?? '',
            'beds_baths' => $bedsBaths,
            'price_label' => $listing['formatted_price'] ?? '',
            'schedule_url' => $url,
            'email_href' => 'mailto:' . $agent['email'] . '?subject=' . rawurlencode('Listing inquiry: ' . $address),
            'note' => $listing['note'] ?? null,
            'note_color' => $listing['note_color'] ?? null,
        ];
    }
}
