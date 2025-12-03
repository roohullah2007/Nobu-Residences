<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GeocodingService
{
    private $apiKey;
    private $cachePrefix = 'geocode_';
    private $cacheTTL = 604800; // 7 days like IDX-AMPRE
    private $rateLimitGoogle = 50; // requests per minute
    private $rateLimitNominatim = 1; // Nominatim allows 1 request per second (strict policy)
    private $rateLimitPhoton = 60; // Photon is more lenient
    private $useGoogleGeocoding = false; // Set to true to use Google (costs money)

    public function __construct()
    {
        $this->apiKey = config('ampre.google_maps_api_key') ?: config('maps.google-maps.api_key') ?: env('GOOGLE_MAPS_API_KEY');
        // Only use Google if explicitly enabled via env variable
        $this->useGoogleGeocoding = env('USE_GOOGLE_GEOCODING', false) && !empty($this->apiKey);
        $this->createGeocodingTable();
    }

    /**
     * Geocode an address to get coordinates
     * Uses FREE geocoding services by default (Nominatim/Photon)
     * Google is only used if USE_GOOGLE_GEOCODING=true in .env
     */
    public function geocodeAddress(string $unparsedAddress): ?array
    {
        // Use only the UnparsedAddress field - don't build from components
        $fullAddress = trim($unparsedAddress);

        if (empty($fullAddress)) {
            return null;
        }

        $addressHash = md5(strtolower($fullAddress));

        // Check database cache first (like IDX-AMPRE)
        $cached = $this->getCachedGeocode($addressHash);
        if ($cached !== null) {
            Log::debug("Using cached geocode for: {$fullAddress}");
            return $cached;
        }

        // Try Photon (OSM-based, free, no strict rate limits) - PRIMARY
        $result = $this->geocodeWithPhoton($fullAddress);
        if ($result !== null) {
            $this->cacheGeocode($addressHash, $fullAddress, $result, 'photon');
            return $result;
        }

        // Fallback to OpenStreetMap Nominatim (free but strict rate limit)
        $result = $this->geocodeWithNominatim($fullAddress);
        if ($result !== null) {
            $this->cacheGeocode($addressHash, $fullAddress, $result, 'nominatim');
            return $result;
        }

        // Only use Google Maps if explicitly enabled (costs money!)
        if ($this->useGoogleGeocoding) {
            $result = $this->geocodeWithGoogle($fullAddress);
            if ($result !== null) {
                $this->cacheGeocode($addressHash, $fullAddress, $result, 'google');
                return $result;
            }
        }

        // Cache failed attempts to avoid repeated API calls
        $this->cacheFailedGeocode($addressHash, $fullAddress);

        Log::warning("Failed to geocode address: {$fullAddress}");
        return null;
    }

    /**
     * Geocode using Google Maps API
     */
    private function geocodeWithGoogle(string $address): ?array
    {
        if (!$this->checkRateLimit('google', $this->rateLimitGoogle)) {
            Log::warning('Google Maps API rate limit exceeded');
            return null;
        }

        // Log the exact address being sent to Google Maps API
        Log::debug('Sending to Google Maps Geocoding API:', [
            'address' => $address,
            'api_key_present' => !empty($this->apiKey)
        ]);

        try {
            $response = Http::timeout(10)->get('https://maps.googleapis.com/maps/api/geocode/json', [
                'address' => $address,
                'key' => $this->apiKey,
                'region' => 'ca' // Bias results to Canada
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'OK' && !empty($data['results'])) {
                    $location = $data['results'][0]['geometry']['location'];
                    $formattedAddress = $data['results'][0]['formatted_address'];
                    
                    $this->recordRateLimit('google');
                    
                    $result = [
                        'lat' => floatval($location['lat']),
                        'lng' => floatval($location['lng']),
                        'source' => 'google',
                        'formatted_address' => $formattedAddress
                    ];
                    
                    Log::debug('Google Maps Geocoding successful:', [
                        'input_address' => $address,
                        'formatted_address' => $formattedAddress,
                        'lat' => $result['lat'],
                        'lng' => $result['lng']
                    ]);
                    
                    return $result;
                }
                
                Log::warning("Google Geocoding API status: " . ($data['status'] ?? 'unknown'), [
                    'address' => $address,
                    'error_message' => $data['error_message'] ?? null
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Google Geocoding error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Geocode using Photon API (OSM-based, free, hosted by Komoot)
     * More lenient rate limits than Nominatim, good accuracy
     * https://photon.komoot.io/
     */
    private function geocodeWithPhoton(string $address): ?array
    {
        if (!$this->checkRateLimit('photon', $this->rateLimitPhoton)) {
            Log::warning('Photon API rate limit exceeded');
            return null;
        }

        try {
            // Clean the address for better Canadian geocoding
            $cleanAddress = $this->cleanAddressForGeocoding($address);

            $response = Http::timeout(10)
                ->withHeaders(['User-Agent' => 'NobuResidences-RealEstate/1.0 (contact@noburesidences.com)'])
                ->get('https://photon.komoot.io/api/', [
                    'q' => $cleanAddress,
                    'limit' => 1,
                    'lang' => 'en',
                    // Bias results toward Canada (Ontario coordinates)
                    'lat' => 43.65,
                    'lon' => -79.38
                ]);

            if ($response->successful()) {
                $data = $response->json();

                if (!empty($data['features']) && is_array($data['features'])) {
                    $feature = $data['features'][0];
                    $coords = $feature['geometry']['coordinates'] ?? null;
                    $properties = $feature['properties'] ?? [];

                    if ($coords && count($coords) >= 2) {
                        $this->recordRateLimit('photon');

                        // Build formatted address from properties
                        $formattedParts = array_filter([
                            $properties['housenumber'] ?? '',
                            $properties['street'] ?? '',
                            $properties['city'] ?? $properties['town'] ?? $properties['village'] ?? '',
                            $properties['state'] ?? $properties['province'] ?? '',
                            $properties['postcode'] ?? '',
                            $properties['country'] ?? ''
                        ]);

                        $result = [
                            'lat' => floatval($coords[1]), // GeoJSON is [lon, lat]
                            'lng' => floatval($coords[0]),
                            'source' => 'photon',
                            'formatted_address' => !empty($formattedParts) ? implode(', ', $formattedParts) : $address
                        ];

                        Log::debug('Photon Geocoding successful:', [
                            'input_address' => $address,
                            'lat' => $result['lat'],
                            'lng' => $result['lng']
                        ]);

                        return $result;
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Photon Geocoding error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Geocode using OpenStreetMap Nominatim API (fallback)
     * Note: Strict rate limit of 1 request per second
     */
    private function geocodeWithNominatim(string $address): ?array
    {
        if (!$this->checkRateLimit('nominatim', $this->rateLimitNominatim)) {
            Log::warning('Nominatim API rate limit exceeded');
            return null;
        }

        try {
            // Clean the address for better geocoding
            $cleanAddress = $this->cleanAddressForGeocoding($address);

            // Nominatim requires 1 second between requests
            usleep(1000000); // 1 second delay

            $response = Http::timeout(10)
                ->withHeaders(['User-Agent' => 'NobuResidences-RealEstate/1.0 (contact@noburesidences.com)'])
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $cleanAddress,
                    'format' => 'json',
                    'limit' => 1,
                    'countrycodes' => 'ca',
                    'addressdetails' => 1
                ]);

            if ($response->successful()) {
                $data = $response->json();

                if (!empty($data) && is_array($data)) {
                    $result = $data[0];

                    $this->recordRateLimit('nominatim');

                    return [
                        'lat' => floatval($result['lat']),
                        'lng' => floatval($result['lon']),
                        'source' => 'nominatim',
                        'formatted_address' => $result['display_name'] ?? $address
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::error('Nominatim Geocoding error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Clean address string for better geocoding accuracy
     * Handles Canadian address formats and TRREB district codes
     */
    private function cleanAddressForGeocoding(string $address): string
    {
        // Remove unit numbers in various formats (e.g., "Unit 123", "#123", "Apt 123")
        $address = preg_replace('/\b(unit|apt|suite|ste|#)\s*\d+[a-z]?\b/i', '', $address);

        // TRREB uses district codes like "Toronto C01", "Toronto W08" - convert to just "Toronto"
        $address = preg_replace('/\b(Toronto|Mississauga|Brampton|Markham|Vaughan|Richmond Hill|Oakville|Burlington)\s+[CEWNSH]\d{2}\b/i', '$1', $address);

        // Remove extra whitespace
        $address = preg_replace('/\s+/', ' ', trim($address));

        // Ensure "Canada" is in the address for better international geocoding
        if (stripos($address, 'Canada') === false && stripos($address, 'ON') !== false) {
            $address .= ', Canada';
        }

        return $address;
    }

    /**
     * Batch geocode multiple addresses
     */
    public function batchGeocode(array $properties): array
    {
        $results = [];
        
        foreach ($properties as $property) {
            $listingKey = $property['ListingKey'] ?? null;
            
            if (!$listingKey) {
                continue;
            }
            
            // First check if property already has coordinates
            if (!empty($property['Latitude']) && !empty($property['Longitude'])) {
                $results[$listingKey] = [
                    'lat' => floatval($property['Latitude']),
                    'lng' => floatval($property['Longitude']),
                    'source' => 'mls'
                ];
                continue;
            }
            
            // Try to geocode using only UnparsedAddress field
            $unparsedAddress = $property['UnparsedAddress'] ?? '';
            if (!empty($unparsedAddress)) {
                $coordinates = $this->geocodeAddress($unparsedAddress);
                
                if ($coordinates) {
                    $results[$listingKey] = $coordinates;
                }
            }
        }
        
        return $results;
    }


    /**
     * Get cached geocoding result from database
     */
    private function getCachedGeocode(string $addressHash): ?array
    {
        $result = DB::table('geocoded_addresses')
            ->where('address_hash', $addressHash)
            ->where('geocoded_at', '>', now()->subSeconds($this->cacheTTL))
            ->first();

        if (!$result) {
            return null;
        }

        // Return null for previously failed attempts
        if ($result->status === 'failed') {
            return null;
        }

        if ($result->latitude && $result->longitude) {
            return [
                'lat' => floatval($result->latitude),
                'lng' => floatval($result->longitude),
                'source' => $result->geocoding_service ?? 'cached',
                'formatted_address' => $result->formatted_address
            ];
        }

        return null;
    }

    /**
     * Cache successful geocoding result
     */
    private function cacheGeocode(string $addressHash, string $originalAddress, array $result, string $service): void
    {
        DB::table('geocoded_addresses')->updateOrInsert(
            ['address_hash' => $addressHash],
            [
                'original_address' => $originalAddress,
                'latitude' => $result['lat'],
                'longitude' => $result['lng'],
                'formatted_address' => $result['formatted_address'],
                'geocoding_service' => $service,
                'geocoded_at' => now(),
                'status' => 'success'
            ]
        );
    }

    /**
     * Cache failed geocoding attempt
     */
    private function cacheFailedGeocode(string $addressHash, string $originalAddress): void
    {
        DB::table('geocoded_addresses')->updateOrInsert(
            ['address_hash' => $addressHash],
            [
                'original_address' => $originalAddress,
                'latitude' => null,
                'longitude' => null,
                'formatted_address' => null,
                'geocoding_service' => null,
                'geocoded_at' => now(),
                'status' => 'failed'
            ]
        );
    }

    /**
     * Check rate limiting
     */
    private function checkRateLimit(string $service, int $limit): bool
    {
        $key = "geocoding_rate_limit_{$service}";
        $currentMinute = floor(time() / 60);
        
        $data = Cache::get($key);
        if (!$data || $data['minute'] !== $currentMinute) {
            return true;
        }
        
        return $data['count'] < $limit;
    }

    /**
     * Record rate limit usage
     */
    private function recordRateLimit(string $service): void
    {
        $key = "geocoding_rate_limit_{$service}";
        $currentMinute = floor(time() / 60);
        
        $data = Cache::get($key, ['minute' => $currentMinute, 'count' => 0]);
        
        if ($data['minute'] !== $currentMinute) {
            $data = ['minute' => $currentMinute, 'count' => 1];
        } else {
            $data['count']++;
        }
        
        Cache::put($key, $data, 120); // Store for 2 minutes
    }

    /**
     * Create geocoding cache table
     */
    private function createGeocodingTable(): void
    {
        if (!DB::getSchemaBuilder()->hasTable('geocoded_addresses')) {
            DB::getSchemaBuilder()->create('geocoded_addresses', function ($table) {
                $table->id();
                $table->string('address_hash', 64)->unique();
                $table->text('original_address');
                $table->decimal('latitude', 10, 8)->nullable();
                $table->decimal('longitude', 11, 8)->nullable();
                $table->text('formatted_address')->nullable();
                $table->string('geocoding_service', 50)->nullable();
                $table->timestamp('geocoded_at');
                $table->enum('status', ['success', 'failed', 'pending'])->default('pending');
                $table->index('geocoded_at');
                $table->index('status');
            });
        }
    }

    /**
     * Generate test coordinates for development
     * Creates realistic coordinates around Toronto area based on address keywords
     */
    public function generateTestCoordinates(string $address = null): array
    {
        // Base coordinates for different Toronto areas
        $areas = [
            ['lat' => 43.6532, 'lng' => -79.3832, 'name' => 'Downtown', 'keywords' => ['downtown', 'king', 'queen', 'front', 'bay st', 'yonge']],
            ['lat' => 43.7000, 'lng' => -79.4000, 'name' => 'North York', 'keywords' => ['north york', 'sheppard', 'finch', 'willowdale']],
            ['lat' => 43.6500, 'lng' => -79.4500, 'name' => 'Etobicoke', 'keywords' => ['etobicoke', 'islington', 'kipling', 'royal york']],
            ['lat' => 43.6800, 'lng' => -79.3500, 'name' => 'East York', 'keywords' => ['east york', 'danforth', 'pape', 'coxwell']],
            ['lat' => 43.6200, 'lng' => -79.3800, 'name' => 'Harbourfront', 'keywords' => ['harbourfront', 'queens quay', 'lakeshore', 'waterfront']],
            ['lat' => 43.7200, 'lng' => -79.3700, 'name' => 'Midtown', 'keywords' => ['midtown', 'eglinton', 'lawrence', 'york mills']],
            ['lat' => 43.6700, 'lng' => -79.4200, 'name' => 'West End', 'keywords' => ['west end', 'bloor west', 'high park', 'roncesvalles']],
            ['lat' => 43.6900, 'lng' => -79.2900, 'name' => 'Scarborough', 'keywords' => ['scarborough', 'kennedy', 'mccowan', 'markham rd']],
            ['lat' => 43.6426, 'lng' => -79.3871, 'name' => 'Entertainment District', 'keywords' => ['entertainment', 'richmond', 'adelaide', 'john st']],
            ['lat' => 43.6689, 'lng' => -79.3883, 'name' => 'Yorkville', 'keywords' => ['yorkville', 'bloor', 'avenue rd', 'cumberland']],
            ['lat' => 43.6515, 'lng' => -79.3625, 'name' => 'Cabbagetown', 'keywords' => ['cabbagetown', 'parliament', 'carlton', 'winchester']],
            ['lat' => 43.6542, 'lng' => -79.4606, 'name' => 'Junction', 'keywords' => ['junction', 'dundas west', 'keele', 'annette']]
        ];
        
        // Try to match address to an area based on keywords
        $selectedArea = null;
        if (!empty($address)) {
            $addressLower = strtolower($address);
            foreach ($areas as $area) {
                foreach ($area['keywords'] as $keyword) {
                    if (stripos($addressLower, $keyword) !== false) {
                        $selectedArea = $area;
                        break 2;
                    }
                }
            }
        }
        
        // If no match found, use a random area
        if (!$selectedArea) {
            $selectedArea = $areas[array_rand($areas)];
        }
        
        // Add some random offset (within ~1km for more realistic clustering)
        // Use address hash for consistent coordinates for same address
        $seed = empty($address) ? rand() : crc32($address);
        srand($seed);
        $latOffset = (rand(-100, 100) / 10000);
        $lngOffset = (rand(-100, 100) / 10000);
        srand(); // Reset random seed
        
        return [
            'lat' => $selectedArea['lat'] + $latOffset,
            'lng' => $selectedArea['lng'] + $lngOffset,
            'source' => 'test',
            'area' => $selectedArea['name'],
            'address_used' => $address
        ];
    }
}