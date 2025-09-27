# Enhanced Property Search with IDX-AMPRE Style Mixed View & Lazy Loading

This implementation adds advanced lazy loading for card images and an IDX-AMPRE style mixed view to your Laravel-React starter application, providing a professional real estate search experience.

## Features Implemented

### 🖼️ Enhanced Lazy Loading
- **Intersection Observer API** with performance optimizations
- **Batch loading** for improved performance
- **Progressive image loading** with blur-up effect
- **Smart caching** to prevent re-fetching
- **Preload on hover** functionality
- **Error handling** with graceful fallbacks
- **Priority-based loading** (high, normal, low)

### 🗺️ IDX-AMPRE Style Mixed View
- **Split-screen layout** (50/50 property cards and map)
- **Real-time synchronization** between map and property cards
- **Interactive property markers** with custom styling
- **Enhanced info windows** with property previews
- **Hover effects** and active property highlighting
- **Responsive design** with mobile optimization

### 🔧 Configuration Management
- **Google Maps configuration** with environment variables
- **Lazy loading settings** with customizable thresholds
- **Mixed view options** with sync preferences
- **Image cache management** with configurable duration

## Files Created/Modified

### Configuration Files
```
config/maps/google-maps.php - Google Maps and lazy loading configuration
```

### React Components
```
resources/js/Components/EnhancedPropertyImageLoader.jsx - Advanced lazy loading component
resources/js/Components/EnhancedPropertyMap.jsx - IDX-AMPRE style map component
resources/js/Pages/Search.jsx - Enhanced search page with mixed view
```

## Setup Instructions

### 1. Environment Configuration

Add your Google Maps API key to your `.env` file:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (optional for enhanced features)
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 3. Required Libraries

The following libraries should already be available in your Laravel-React setup:
- React
- @inertiajs/react
- Tailwind CSS

### 4. Backend API Endpoints

Ensure these API endpoints are implemented:

```php
// routes/api.php
Route::post('/property-search', [PropertySearchController::class, 'search']);
Route::post('/property-images', [PropertyImageController::class, 'getImages']);
Route::post('/save-search', [SavedSearchController::class, 'store']);
```

## Usage Examples

### Basic Property Search
```jsx
import EnhancedPropertySearch from '@/Pages/Search';

// Use in your route
<EnhancedPropertySearch 
  auth={auth}
  siteName="Your Site"
  siteUrl="https://yoursite.com"
  year={2025}
  filters={{
    search: 'Toronto',
    property_type: ['Condo Apartment'],
    minPrice: 500000,
    maxPrice: 1000000
  }}
/>
```

### Lazy Loading Component
```jsx
import EnhancedPropertyImageLoader from '@/Components/EnhancedPropertyImageLoader';

<EnhancedPropertyImageLoader
  listingKey="property-123"
  alt="Property Image"
  className="w-full h-48 object-cover"
  enableLazyLoading={true}
  enableBlurEffect={true}
  preloadOnHover={true}
  priority="high"
/>
```

### Map Component
```jsx
import EnhancedPropertyMap from '@/Components/EnhancedPropertyMap';

<EnhancedPropertyMap 
  properties={properties}
  className="w-full h-96"
  activeProperty={activeProperty}
  onPropertyHover={handlePropertyHover}
  onPropertyClick={handlePropertyClick}
  viewType="mixed"
  enableClustering={true}
  enableInfoWindows={true}
/>
```

## IDX-AMPRE Style Features

### Mixed View Layout
- **50/50 split** between property cards and interactive map
- **Synchronized hover effects** between cards and map markers
- **Auto-centering** map on active property
- **Enhanced scrollable** property list with custom scrollbars
- **Professional styling** with Work Sans font family

### Interactive Map Markers
- **Custom price markers** with property pricing
- **Active state indicators** with pulsing animations
- **Hover effects** with scale transforms
- **Info windows** with property previews and images
- **Clustering support** for multiple properties in close proximity

### Enhanced Property Cards
- **Lazy-loaded images** with progressive enhancement
- **Active state highlighting** with blue ring and scale effect
- **Hover animations** with smooth transitions
- **IDX-AMPRE styling** with proper spacing and typography
- **Status badges** and price overlays

## Performance Optimizations

### Lazy Loading Optimizations
- **Intersection Observer** with passive event listeners
- **Batch processing** with configurable delays
- **Image caching** to prevent duplicate requests
- **Priority queuing** for above-the-fold content
- **Progressive enhancement** with blur-to-sharp transitions

### Map Performance
- **Marker clustering** for large datasets
- **Optimized rendering** with efficient marker creation
- **Bounds calculation** for automatic map fitting
- **Event debouncing** for smooth interactions

## Customization Options

### Lazy Loading Configuration
```javascript
// In google-maps.php config
'images' => [
    'lazy_loading' => [
        'threshold' => 0.1,           // When to start loading
        'root_margin' => '50px',      // Margin around viewport
        'batch_size' => 15,           // Images per batch
        'batch_delay' => 100,         // Milliseconds between batches
        'enable_blur_effect' => true  // Progressive blur effect
    ]
]
```

### Mixed View Settings
```javascript
// In google-maps.php config
'mixed_view' => [
    'split_ratio' => '50/50',              // Card/map ratio
    'property_card_height' => 340,         // Card height in pixels
    'enable_synchronized_hover' => true,   // Sync hover effects
    'auto_center_on_hover' => true,       // Auto-center map
    'map_padding' => 50                    // Map bounds padding
]
```

### Map Styling
```javascript
// In google-maps.php config
'map_styles' => [
    [
        'featureType' => 'poi',
        'elementType' => 'labels',
        'stylers' => [['visibility' => 'off']]
    ],
    // Add more style rules
]
```

## Browser Support

- **Modern browsers** with Intersection Observer support
- **Chrome 58+**, **Firefox 55+**, **Safari 12.1+**, **Edge 16+**
- **Graceful degradation** for older browsers
- **Mobile responsive** design for touch devices

## Security Considerations

1. **API Key Restriction**: Always restrict your Google Maps API key to your domain
2. **Environment Variables**: Store sensitive keys in `.env` file
3. **CSRF Protection**: Ensure all API endpoints have CSRF token validation
4. **Input Sanitization**: Validate and sanitize all search parameters

## Troubleshooting

### Common Issues

1. **Google Maps not loading**
   - Check API key is set correctly in `.env`
   - Verify API key has Maps JavaScript API enabled
   - Check browser console for API errors

2. **Images not lazy loading**
   - Ensure `/api/property-images` endpoint exists
   - Check browser console for network errors
   - Verify CSRF token is being sent

3. **Mixed view not synchronizing**
   - Check that properties have valid `Latitude` and `Longitude`
   - Ensure `onPropertyHover` callback is properly set
   - Verify map component is receiving updated `activeProperty`

### Debug Mode

Enable debug logging by adding to your `.env`:
```env
APP_DEBUG=true
```

This will show detailed logging in the browser console for:
- Lazy loading batch operations
- Map marker creation and updates
- Property hover synchronization
- API request/response cycles

## Future Enhancements

Potential improvements for future versions:
- **Virtual scrolling** for large property lists
- **Advanced filtering** with faceted search
- **Saved searches** with email notifications
- **Property comparison** feature
- **Street View integration**
- **Draw on map** for custom area searches
- **Property alerts** with real-time notifications

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all API endpoints are working
3. Test with sample data to isolate issues
4. Check network tab for failed requests

## License

This implementation follows the same license as your Laravel-React starter application.
