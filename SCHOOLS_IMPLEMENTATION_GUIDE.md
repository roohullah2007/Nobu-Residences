# SCHOOLS IMPLEMENTATION GUIDE

## Overview
This document outlines the complete implementation of the Schools functionality for the NOBU Residences Laravel React application. The system allows users to view nearby schools on property detail pages and navigate to dedicated school pages for more information.

## Features Implemented

### 1. Database Structure
- **School Model** (`app/Models/School.php`)
- **Migration** (`database/migrations/2025_09_01_000001_create_schools_table.php`)
- **Sample Data Seeder** (`database/migrations/2025_09_01_000002_seed_sample_schools.php`)

### 2. API Endpoints
- `GET /api/schools` - List all schools with filtering
- `GET /api/schools/nearby` - Get nearby schools for a property
- `GET /api/schools/{id}` - Get specific school details
- `GET /api/schools/slug/{slug}` - Get school by slug
- `GET /api/schools/featured` - Get featured schools
- `GET /api/schools/types` - Get available school types
- `GET /api/schools/grade-levels` - Get available grade levels
- `GET /api/schools/cities` - Get cities with schools
- `POST /api/schools/geocode/{id}` - Geocode specific school
- `POST /api/schools/batch-geocode` - Batch geocode all schools

### 3. Public Pages
- `/school/{id}` - School detail page by ID
- `/schools/{slug}` - School detail page by slug (SEO-friendly)

### 4. Admin Management
- `/admin/schools` - School management dashboard
- `/admin/schools/create` - Add new school
- `/admin/schools/{id}/edit` - Edit school
- `/admin/real-estate/schools` - Legacy redirect to new schools management

## Key Components

### 1. NearbySchools Component (`resources/js/Website/Components/PropertyDetail/NearbySchools.jsx`)

**Features:**
- Fetches nearby schools using property coordinates
- Calculates distance and walking time automatically
- Makes school names clickable to navigate to school detail pages
- Shows loading states and error handling
- Fallback to sample data if no real schools found
- "Show More" functionality for schools beyond the first 3

**API Integration:**
- Uses `/api/schools/nearby` endpoint
- Requires property latitude/longitude coordinates
- 2km radius search by default
- Displays up to 10 schools, shows 3 initially

### 2. SchoolDetail Page (`resources/js/Website/Pages/SchoolDetail.jsx`)

**Features:**
- Complete school information display
- Contact information with clickable phone/email/website links
- School programs, facilities, and languages
- Related properties in the area
- Responsive design with loading states

### 3. School API Controller (`app/Http/Controllers/Api/SchoolController.php`)

**Key Methods:**
- `getNearbySchools()` - Distance calculation using Haversine formula
- `geocodeAddress()` - OpenStreetMap Nominatim API integration
- `batchGeocodeSchools()` - Batch process multiple school addresses

## Distance Calculation

### Implementation
The system uses the **Haversine formula** for calculating distances between property and school coordinates:

```php
public function getDistanceFromProperty($propertyLat, $propertyLng)
{
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
```

### Walking Time
- Calculated based on average walking speed: 5 km/h
- Converts distance to walking minutes
- Minimum 1 minute for very close schools

## Geocoding Integration

### OpenStreetMap Nominatim API
- **Free API** - No API key required
- **Rate Limited** - 1 request per second (implemented in batch geocoding)
- **Cached Results** - 30-day cache to avoid repeated API calls
- **Canada Focus** - Uses `countrycodes=ca` parameter

### Batch Geocoding
- Processes up to 50 schools at a time
- Respects API rate limits with 1-second delays
- Provides detailed success/failure reporting
- Can be run from admin panel

### Google Maps API (Optional)
The system is designed to easily add Google Maps Geocoding API as a fallback:

```php
// TODO: Add Google Maps API as fallback
// You can implement Google Maps Geocoding API here if you have an API key
```

## Setup Instructions

### 1. Run the Setup Script
```bash
./setup-schools.bat
```

This will:
- Run the school migration
- Seed sample school data
- Clear application caches
- Test the implementation

### 2. Manual Setup (Alternative)
```bash
# Run migrations
php artisan migrate --path=database/migrations/2025_09_01_000001_create_schools_table.php
php artisan migrate --path=database/migrations/2025_09_01_000002_seed_sample_schools.php

# Clear caches
php artisan config:clear
php artisan route:clear
```

### 3. Geocode Schools
After adding schools, run batch geocoding to add coordinates:
1. Visit `/admin/schools`
2. Click "Batch Geocode" button
3. Wait for processing to complete

## Sample Data Included

The seeder includes 5 sample Toronto schools:
1. **St Michael's Choir (Sr) School** - Catholic Secondary
2. **Central Elementary School** - Public Elementary  
3. **Downtown Secondary Institute** - Public Secondary
4. **Jarvis Collegiate Institute** - Public Secondary (Historic)
5. **Nelson Mandela Park Public School** - Public Elementary

## Navigation Flow

### Property Detail Page → School Detail Page
1. User views property detail page
2. "Nearby Schools" section shows schools within 2km
3. User clicks on school name
4. Navigates to `/schools/{slug}` or `/school/{id}`
5. School detail page shows complete information

### URL Structure
- **SEO-Friendly**: `/schools/st-michaels-choir-sr-school`
- **Fallback**: `/school/1`

## Admin Features

### School Management Dashboard
- **Filtering**: By name, type, grade level, city
- **Search**: Full-text search across name, address, city, school board
- **Batch Operations**: Geocoding for coordinates
- **CRUD Operations**: Create, Read, Update, Delete schools

### Data Fields Managed
- Basic info (name, address, contact)
- School specifics (type, grade level, board)
- Academic info (rating, programs, facilities)
- Geographic coordinates (latitude/longitude)
- Status flags (active, featured)

## Technical Notes

### Performance Optimizations
- **Database Indexes** on frequently queried fields
- **API Caching** for geocoding results
- **Efficient Distance Queries** using SQL Haversine formula
- **Pagination** for large school datasets

### Error Handling
- **Graceful Degradation** when coordinates not available
- **Fallback Data** when API calls fail
- **User-Friendly Messages** for loading and error states
- **Validation** for all form inputs

### Security
- **Rate Limiting** for external API calls
- **Input Validation** on all endpoints
- **Admin Authentication** required for management features
- **CSRF Protection** on form submissions

## Testing the Implementation

### 1. Frontend Testing
1. Visit any property detail page with coordinates
2. Check "Nearby Schools" tab
3. Verify schools appear with distances
4. Click on school names to navigate
5. Verify school detail pages load correctly

### 2. Admin Testing
1. Visit `/admin/schools`
2. Add a new school
3. Test geocoding functionality
4. Verify filtering and search work
5. Test edit/delete operations

### 3. API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Get nearby schools
GET /api/schools/nearby?latitude=43.6532&longitude=-79.3832&radius=2&limit=5

# Get all schools
GET /api/schools?school_type=public&grade_level=elementary

# Geocode schools
POST /api/schools/batch-geocode
```

## Future Enhancements

### Potential Improvements
1. **Google Maps Integration** for more accurate geocoding
2. **School Ratings Integration** with third-party education APIs
3. **Real-time Enrollment Data** from school board APIs
4. **Advanced Filtering** by programs, facilities, languages
5. **School Comparison Tool** similar to property comparison
6. **School Catchment Areas** mapping and visualization
7. **Parent Reviews System** for community feedback

### Performance Improvements
1. **Elastic Search** for advanced school search
2. **Redis Caching** for frequently accessed data
3. **CDN Integration** for school images
4. **Database Optimization** with spatial indexes

## Troubleshooting

### Common Issues

**1. No schools appearing in Nearby Schools:**
- Check if property has latitude/longitude coordinates
- Verify schools table has geocoded schools with coordinates
- Run batch geocoding from admin panel

**2. Geocoding fails:**
- Check internet connection
- Verify OpenStreetMap Nominatim API is accessible
- Check rate limiting (max 1 request per second)

**3. School detail pages not loading:**
- Verify routes are properly cached: `php artisan route:clear`
- Check school exists and is active
- Verify slug is properly generated

**4. Distance calculations wrong:**
- Ensure coordinates are in decimal degrees format
- Verify Haversine formula implementation
- Check for null coordinate values

## Integration Points

### With Property System
- Properties pass coordinates to nearby schools component
- School proximity becomes a property selling point
- Integration with property search filters

### With Building System
- Buildings can highlight nearby schools as amenities
- School proximity calculations for building-level data
- Bulk school analysis for multiple properties

### With Admin System
- Seamless integration with existing admin layout
- Consistent styling with other admin pages
- Bulk operations support for efficiency

---

**Implementation Status: ✅ COMPLETE**

All core functionality implemented and ready for use. Run the setup script to get started!
