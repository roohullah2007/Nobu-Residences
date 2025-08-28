<?php

namespace App\Helpers;

class PropertyUrlHelper
{
    /**
     * Generate SEO-friendly URL for a property
     */
    public static function generatePropertyUrl($property)
    {
        $listingKey = '';
        $city = '';
        $address = '';
        
        // Get listing key (handle different field names)
        $listingKey = $property['ListingKey'] ?? 
                     $property['listingKey'] ?? 
                     $property['mls_id'] ?? 
                     $property['mlsNumber'] ?? '';
        
        // Get city
        $city = $property['City'] ?? 
                $property['city'] ?? 
                'toronto';
        
        // Get address
        $address = $property['UnparsedAddress'] ?? 
                   $property['address'] ?? 
                   $property['StreetAddress'] ?? '';
        
        // Format city for URL - remove district codes like C08, W04, etc.
        $citySlug = strtolower($city);
        $citySlug = preg_replace('/\s*[cewns]\d{2}\b/i', '', $citySlug); // Remove district codes
        $citySlug = trim(str_replace(' ', '-', $citySlug));
        
        // Format address for URL
        $addressSlug = self::createAddressSlug($address);
        
        // Generate the URL
        return '/' . $citySlug . '/' . $addressSlug . '/' . $listingKey;
    }
    
    /**
     * Create URL-friendly slug from address
     */
    private static function createAddressSlug($address)
    {
        // Extract street number and name from full address
        // Example: "55 Mercer Street, Unit 2507" -> "55-mercer-street"
        $address = strtolower($address);
        
        // Remove unit/suite/apt information (including #618 format)
        $address = preg_replace('/[,\s]*#\s*\d+.*/i', '', $address); // Remove #unit format
        $address = preg_replace('/,?\s*(unit|suite|apt|apartment)\s*\d+.*/i', '', $address); // Remove other unit formats
        
        // Remove city, province, postal code
        $address = preg_replace('/,?\s*(toronto|mississauga|brampton|vaughan|markham|richmond hill|oakville|burlington|hamilton|london|ottawa|kitchener).*/i', '', $address);
        
        // Clean up the address
        $address = trim($address);
        $address = preg_replace('/[^a-z0-9\s\-]/', '', $address);
        $address = preg_replace('/\s+/', '-', $address);
        $address = preg_replace('/-+/', '-', $address);
        
        return trim($address, '-') ?: 'property';
    }
}