<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'address',
        'city',
        'province',
        'postal_code',
        'phone',
        'email',
        'website_url',
        'latitude',
        'longitude',
        'school_type',
        'grade_level',
        'school_board',
        'principal_name',
        'student_capacity',
        'established_year',
        'rating',
        'programs',
        'languages',
        'facilities',
        'is_active',
        'is_featured',
        'meta_data'
    ];

    protected $casts = [
        'programs' => 'array',
        'languages' => 'array',
        'facilities' => 'array',
        'meta_data' => 'array',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'rating' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'established_year' => 'integer',
        'student_capacity' => 'integer'
    ];

    /**
     * Automatically generate slug when name is set
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($school) {
            if (empty($school->slug)) {
                $school->slug = Str::slug($school->name);
            }
        });
        
        static::updating(function ($school) {
            if ($school->isDirty('name') && empty($school->slug)) {
                $school->slug = Str::slug($school->name);
            }
        });
    }

    /**
     * Scope for active schools
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for featured schools
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope for filtering by school type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('school_type', $type);
    }

    /**
     * Scope for filtering by grade level
     */
    public function scopeOfGradeLevel($query, $gradeLevel)
    {
        return $query->where('grade_level', $gradeLevel);
    }

    /**
     * Calculate distance from a property using Haversine formula
     * 
     * @param float $propertyLat Property latitude
     * @param float $propertyLng Property longitude
     * @return float Distance in kilometers
     */
    public function getDistanceFromProperty($propertyLat, $propertyLng)
    {
        if (!$this->latitude || !$this->longitude || !$propertyLat || !$propertyLng) {
            return null;
        }

        $earthRadius = 6371; // Earth's radius in kilometers

        $latDiff = deg2rad($this->latitude - $propertyLat);
        $lngDiff = deg2rad($this->longitude - $propertyLng);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
             cos(deg2rad($propertyLat)) * cos(deg2rad($this->latitude)) *
             sin($lngDiff / 2) * sin($lngDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        return round($distance, 2);
    }

    /**
     * Calculate walking time in minutes (average walking speed: 5 km/h)
     * 
     * @param float $distanceKm Distance in kilometers
     * @return int Walking time in minutes
     */
    public function calculateWalkingTime($distanceKm)
    {
        if (!$distanceKm) return null;
        
        $walkingSpeedKmh = 5; // Average walking speed
        $timeHours = $distanceKm / $walkingSpeedKmh;
        $timeMinutes = $timeHours * 60;
        
        return max(1, round($timeMinutes)); // Minimum 1 minute
    }

    /**
     * Get nearby schools for a property
     * 
     * @param float $propertyLat Property latitude
     * @param float $propertyLng Property longitude
     * @param int $radius Radius in kilometers (default: 2km)
     * @param int $limit Maximum number of schools to return (default: 100)
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getNearbySchools($propertyLat, $propertyLng, $radius = 2, $limit = 100)
    {
        if (!$propertyLat || !$propertyLng) {
            return collect();
        }

        // Use Haversine formula in SQL for efficient querying
        $schools = self::active()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->selectRaw("*, 
                (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance_km", 
                [$propertyLat, $propertyLng, $propertyLat])
            ->having('distance_km', '<=', $radius)
            ->orderBy('distance_km')
            ->limit($limit)
            ->get();

        // Add walking time to each school
        return $schools->map(function ($school) {
            $school->walking_time_minutes = $school->calculateWalkingTime($school->distance_km);
            $school->walking_time_text = $school->walking_time_minutes ? $school->walking_time_minutes . ' min walk' : null;
            $school->distance_text = $school->distance_km ? number_format($school->distance_km, 1) . ' km' : null;
            return $school;
        });
    }

    /**
     * Get display data for API responses
     */
    public function getDisplayData()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'phone' => $this->phone,
            'email' => $this->email,
            'website_url' => $this->website_url,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'school_type' => $this->school_type,
            'grade_level' => $this->grade_level,
            'school_board' => $this->school_board,
            'principal_name' => $this->principal_name,
            'student_capacity' => $this->student_capacity,
            'established_year' => $this->established_year,
            'rating' => $this->rating,
            'programs' => $this->programs,
            'languages' => $this->languages,
            'facilities' => $this->facilities,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured
        ];
    }

    /**
     * Get school type label
     */
    public function getSchoolTypeLabel()
    {
        return match($this->school_type) {
            'public' => 'Public',
            'catholic' => 'Catholic',
            'private' => 'Private',
            'charter' => 'Charter',
            'french' => 'French',
            default => 'Other'
        };
    }

    /**
     * Get grade level label
     */
    public function getGradeLevelLabel()
    {
        return match($this->grade_level) {
            'elementary' => 'Elementary',
            'secondary' => 'Secondary',
            'k-12' => 'K-12',
            'preschool' => 'Preschool',
            'special' => 'Special Education',
            default => 'Unknown'
        };
    }
}
