<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Services\GooglePlacesService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class SchoolController extends Controller
{
    /**
     * Get nearby schools for a property
     */
    public function getNearbySchools(Request $request): JsonResponse
    {
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');
        $address = $request->input('address');
        $radius = $request->input('radius', 2); // Default 2km radius
        $limit = $request->input('limit', 100);

        // Debug logging
        \Log::info('getNearbySchools called with:', [
            'latitude' => $latitude,
            'longitude' => $longitude,
            'address' => $address,
            'radius' => $radius,
            'limit' => $limit
        ]);

        // If no coordinates provided but address is, try to geocode
        if ((!$latitude || !$longitude) && $address) {
            // Clean up the address for better geocoding
            $cleanAddress = $address;

            // Remove unit/apartment numbers (e.g., "15 Mercer Street 610" -> "15 Mercer Street")
            $cleanAddress = preg_replace('/\s+\d{3,}(?=,)/', '', $cleanAddress);

            // Remove Toronto district codes like "C01"
            $cleanAddress = preg_replace('/,?\s*[A-Z]\d{2}(?=,|\s)/', '', $cleanAddress);

            // Try geocoding with cleaned address
            $geocoded = $this->geocodeAddress($cleanAddress);

            // If still fails, try a simpler version
            if (!$geocoded && strpos($address, ',') !== false) {
                // Extract just street and city
                $parts = explode(',', $address);
                if (count($parts) >= 2) {
                    $simpleAddress = trim($parts[0]) . ', Toronto, ON, Canada';
                    \Log::info('Trying simpler address:', ['address' => $simpleAddress]);
                    $geocoded = $this->geocodeAddress($simpleAddress);
                }
            }

            if ($geocoded) {
                $latitude = $geocoded['lat'];
                $longitude = $geocoded['lng'];
                \Log::info('Geocoded address to:', [
                    'original' => $address,
                    'cleaned' => $cleanAddress,
                    'lat' => $latitude,
                    'lng' => $longitude
                ]);
            } else {
                \Log::warning('Failed to geocode address:', [
                    'original' => $address,
                    'cleaned' => $cleanAddress
                ]);
            }
        }

        // Final fallback to Toronto downtown coordinates if everything fails
        if (!$latitude || !$longitude) {
            // Check if the address contains "Toronto" to use default Toronto coordinates
            if ($address && stripos($address, 'Toronto') !== false) {
                $latitude = 43.6532;
                $longitude = -79.3832;
                \Log::info('Using default Toronto coordinates as fallback');
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to determine location. Please provide latitude/longitude or a valid address.',
                    'data' => []
                ]);
            }
        }

        try {
            // First try to get schools from Google Places API
            $googlePlacesService = new GooglePlacesService();
            $googleSchools = $googlePlacesService->getNearbySchools($latitude, $longitude, $radius * 1000); // Convert km to meters

            // If we have Google Places results, return them
            if (!empty($googleSchools)) {
                \Log::info('Found ' . count($googleSchools) . ' schools from Google Places API');

                // Format schools for display
                $formattedSchools = collect($googleSchools)->map(function ($school) {
                    return [
                        'id' => $school['id'] ?? uniqid(),
                        'name' => $school['name'],
                        'slug' => null,
                        'address' => $school['address'] ?? '',
                        'city' => 'Toronto',
                        'province' => 'ON',
                        'phone' => null,
                        'email' => null,
                        'website_url' => null,
                        'school_type' => $school['school_type'] ?? 'Public',
                        'school_type_label' => $school['school_type'] ?? 'Public',
                        'grade_level' => $school['grade_level'] ?? 'Elementary',
                        'grade_level_label' => $school['grade_level'] ?? 'Elementary',
                        'school_board' => $school['school_board'] ?? '',
                        'principal_name' => null,
                        'student_capacity' => null,
                        'established_year' => null,
                        'rating' => $school['rating'] ?? null,
                        'programs' => [],
                        'languages' => [],
                        'facilities' => [],
                        'distance_km' => $school['distance_km'],
                        'distance_text' => $school['distance_text'],
                        'walking_time_minutes' => $school['walking_time_minutes'],
                        'walking_time_text' => $school['walking_time_text'],
                        'place_id' => $school['place_id'] ?? null,
                        'in_boundary' => $school['in_boundary'] ?? null,
                    ];
                });

                // Limit results if needed
                if ($limit && $formattedSchools->count() > $limit) {
                    $formattedSchools = $formattedSchools->take($limit);
                }

                return response()->json([
                    'success' => true,
                    'data' => $formattedSchools->values(),
                    'source' => 'google_places'
                ]);
            }

            // Fallback to database schools if Google Places returns nothing
            \Log::info('No schools from Google Places, trying database');
            $schools = School::getNearbySchools($latitude, $longitude, $radius, $limit);

            // Format schools for display
            $formattedSchools = $schools->map(function ($school) {
                return [
                    'id' => $school->id,
                    'name' => $school->name,
                    'slug' => $school->slug,
                    'address' => $school->address,
                    'city' => $school->city,
                    'province' => $school->province,
                    'phone' => $school->phone,
                    'email' => $school->email,
                    'website_url' => $school->website_url,
                    'school_type' => $school->school_type,
                    'school_type_label' => $school->getSchoolTypeLabel(),
                    'grade_level' => $school->grade_level,
                    'grade_level_label' => $school->getGradeLevelLabel(),
                    'school_board' => $school->school_board,
                    'principal_name' => $school->principal_name,
                    'student_capacity' => $school->student_capacity,
                    'established_year' => $school->established_year,
                    'rating' => $school->rating,
                    'programs' => $school->programs,
                    'languages' => $school->languages,
                    'facilities' => $school->facilities,
                    'distance_km' => $school->distance_km,
                    'distance_text' => $school->distance_text,
                    'walking_time_minutes' => $school->walking_time_minutes,
                    'walking_time_text' => $school->walking_time_text,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedSchools,
                'source' => 'database'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching nearby schools: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error fetching nearby schools',
                'data' => []
            ]);
        }
    }
    
    /**
     * Display a listing of schools
     */
    public function index(Request $request): JsonResponse
    {
        $query = School::active();
        
        // Search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('school_board', 'like', "%{$search}%");
            });
        }
        
        // Filter by city
        if ($request->has('city')) {
            $query->where('city', $request->input('city'));
        }
        
        // Filter by school type
        if ($request->has('school_type')) {
            $query->where('school_type', $request->input('school_type'));
        }
        
        // Filter by grade level
        if ($request->has('grade_level')) {
            $query->where('grade_level', $request->input('grade_level'));
        }
        
        // Filter by featured
        if ($request->has('featured')) {
            $query->where('is_featured', true);
        }
        
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);
        
        $perPage = $request->input('per_page', 12);
        $schools = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $schools->items(),
            'pagination' => [
                'total' => $schools->total(),
                'per_page' => $schools->perPage(),
                'current_page' => $schools->currentPage(),
                'last_page' => $schools->lastPage(),
                'from' => $schools->firstItem(),
                'to' => $schools->lastItem(),
            ]
        ]);
    }
    
    /**
     * Display the specified school
     */
    public function show($id): JsonResponse
    {
        $school = School::active()->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $school->getDisplayData()
        ]);
    }
    
    /**
     * Get schools by slug
     */
    public function showBySlug($slug): JsonResponse
    {
        $school = School::active()->where('slug', $slug)->firstOrFail();
        
        return response()->json([
            'success' => true,
            'data' => $school->getDisplayData()
        ]);
    }
    
    /**
     * Debug endpoint to check all schools and their distances
     */
    public function debugDistances(Request $request): JsonResponse
    {
        $latitude = $request->input('latitude', 43.6532); // Default Toronto coordinates
        $longitude = $request->input('longitude', -79.3832);
        
        // Get ALL schools with distances
        $schools = School::active()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->selectRaw("*, 
                (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance_km", 
                [$latitude, $longitude, $latitude])
            ->orderBy('distance_km')
            ->get();
        
        $debugInfo = [
            'test_point' => [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'description' => 'Property coordinates used for testing'
            ],
            'total_schools' => $schools->count(),
            'schools_with_coordinates' => School::whereNotNull('latitude')->whereNotNull('longitude')->count(),
            'all_schools_in_db' => School::count(),
            'schools_by_distance' => $schools->map(function ($school) {
                return [
                    'id' => $school->id,
                    'name' => $school->name,
                    'address' => $school->address,
                    'city' => $school->city,
                    'latitude' => $school->latitude,
                    'longitude' => $school->longitude,
                    'distance_km' => round($school->distance_km, 2),
                    'within_2km' => $school->distance_km <= 2,
                    'within_5km' => $school->distance_km <= 5,
                ];
            })
        ];
        
        return response()->json([
            'success' => true,
            'debug_info' => $debugInfo
        ]);
    }
    
    /**
     * Get featured schools
     */
    public function featured(): JsonResponse
    {
        $schools = School::active()
            ->featured()
            ->orderBy('name')
            ->limit(6)
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $schools->map(function ($school) {
                return $school->getDisplayData();
            })
        ]);
    }
    
    /**
     * Get school types
     */
    public function schoolTypes(): JsonResponse
    {
        $types = collect(['public', 'catholic', 'private', 'charter', 'french', 'other'])
            ->map(function ($type) {
                return [
                    'value' => $type,
                    'label' => ucfirst($type)
                ];
            });
            
        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }
    
    /**
     * Get grade levels
     */
    public function gradeLevels(): JsonResponse
    {
        $levels = collect(['elementary', 'secondary', 'k-12', 'preschool', 'special'])
            ->map(function ($level) {
                return [
                    'value' => $level,
                    'label' => match($level) {
                        'elementary' => 'Elementary',
                        'secondary' => 'Secondary',
                        'k-12' => 'K-12',
                        'preschool' => 'Preschool',
                        'special' => 'Special Education',
                        default => ucfirst($level)
                    }
                ];
            });
            
        return response()->json([
            'success' => true,
            'data' => $levels
        ]);
    }
    
    /**
     * Get cities with schools
     */
    public function cities(): JsonResponse
    {
        $cities = School::active()
            ->distinct()
            ->pluck('city')
            ->filter()
            ->sort()
            ->values();
            
        return response()->json([
            'success' => true,
            'data' => $cities
        ]);
    }
    
    /**
     * Geocode school address using OpenStreetMap Nominatim API
     */
    public function geocodeSchool($schoolId): JsonResponse
    {
        $school = School::findOrFail($schoolId);
        
        if ($school->latitude && $school->longitude) {
            return response()->json([
                'success' => true,
                'message' => 'School already has coordinates',
                'data' => [
                    'latitude' => $school->latitude,
                    'longitude' => $school->longitude
                ]
            ]);
        }
        
        try {
            $address = $school->address . ', ' . $school->city . ', ' . $school->province;
            $coordinates = $this->geocodeAddress($address);
            
            if ($coordinates) {
                $school->update([
                    'latitude' => $coordinates['lat'],
                    'longitude' => $coordinates['lng']
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'School coordinates updated successfully',
                    'data' => [
                        'latitude' => $coordinates['lat'],
                        'longitude' => $coordinates['lng']
                    ]
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Unable to geocode school address',
                'data' => null
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error geocoding school: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error geocoding school address',
                'data' => null
            ]);
        }
    }
    
    /**
     * Geocode an address using OpenStreetMap Nominatim API
     * Falls back to local geocoding service if available
     */
    private function geocodeAddress($address)
    {
        try {
            // Cache key for geocoding results
            $cacheKey = 'geocode_' . md5($address);
            
            // Check cache first
            if (Cache::has($cacheKey)) {
                return Cache::get($cacheKey);
            }
            
            // Use OpenStreetMap Nominatim API (free, no API key required)
            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => 'Laravel Real Estate App'
                ])
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $address,
                    'format' => 'json',
                    'limit' => 1,
                    'countrycodes' => 'ca', // Canada only
                    'addressdetails' => 1
                ]);
            
            if ($response->successful()) {
                $data = $response->json();
                
                if (!empty($data) && isset($data[0]['lat'], $data[0]['lon'])) {
                    $coordinates = [
                        'lat' => (float) $data[0]['lat'],
                        'lng' => (float) $data[0]['lon']
                    ];
                    
                    // Cache for 30 days
                    Cache::put($cacheKey, $coordinates, now()->addDays(30));
                    
                    return $coordinates;
                }
            }
            
            // TODO: Add Google Maps API as fallback if needed
            // You can implement Google Maps Geocoding API here if you have an API key
            
            return null;
            
        } catch (\Exception $e) {
            Log::error('Geocoding error: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Batch geocode multiple schools
     */
    public function batchGeocodeSchools(): JsonResponse
    {
        $schools = School::active()
            ->whereNull('latitude')
            ->orWhereNull('longitude')
            ->limit(50) // Process in batches to avoid API limits
            ->get();
            
        $processed = 0;
        $successful = 0;
        $failed = 0;
        
        foreach ($schools as $school) {
            $processed++;
            
            try {
                $address = $school->address . ', ' . $school->city . ', ' . $school->province;
                $coordinates = $this->geocodeAddress($address);
                
                if ($coordinates) {
                    $school->update([
                        'latitude' => $coordinates['lat'],
                        'longitude' => $coordinates['lng']
                    ]);
                    $successful++;
                } else {
                    $failed++;
                }
                
                // Rate limiting - wait 1 second between requests to be respectful to free API
                sleep(1);
                
            } catch (\Exception $e) {
                Log::error('Error geocoding school ' . $school->id . ': ' . $e->getMessage());
                $failed++;
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => "Processed {$processed} schools. {$successful} successful, {$failed} failed.",
            'data' => [
                'processed' => $processed,
                'successful' => $successful,
                'failed' => $failed
            ]
        ]);
    }
}
