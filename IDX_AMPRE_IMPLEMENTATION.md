# IDX-AMPRE Style Property Search Implementation

## Overview
This document outlines the implementation of IDX-AMPRE style property listings in your Laravel-React application, matching the design and functionality of the WordPress IDX-AMPRE plugin.

## Key Features Implemented

### 1. Enhanced Property Cards (IDX-AMPRE Style)
- **Four cards per row** in grid view (matching IDX-AMPRE layout)
- **Two cards per row** in mixed view sidebar
- **Professional image loading** with blur-to-sharp transitions
- **Interactive hover effects** with Compare/Request buttons
- **Active property highlighting** with blue ring and pulse animation
- **Responsive design** for mobile and tablet devices

### 2. Mixed View Layout
- **Split-screen design** with property cards on left, map on right
- **Synchronized hovering** between cards and map markers
- **Two-column card grid** in the left panel for compact display
- **Scrollable sidebar** with custom scrollbar styling
- **Real-time map updates** when hovering over properties

### 3. Image Loading System
- **PluginStyleImageLoader** with professional loading animations
- **Multiple fallback images** from Unsplash for properties without images
- **Skeleton loading** with shimmer effects
- **Blur-to-sharp transitions** for smooth image appearance
- **Error handling** with retry functionality

### 4. Google Maps Integration
- **Enhanced markers** with price display and IDX-AMPRE styling
- **Clustering support** for multiple properties
- **Info windows** with property previews
- **Synchronized highlighting** with property cards
- **Responsive map controls** for different view types

### 5. Search Functionality
- **Three view modes**: Grid, Mixed, and Map-only
- **Property filtering** by price, bedrooms, bathrooms, etc.
- **Real-time search** with loading states
- **Pagination support** for large result sets
- **Save search** functionality

## Files Modified/Created

### Core Components
1. **Search.jsx** - Main search page with IDX-AMPRE layout
2. **PropertyCardV5.jsx** - Enhanced property cards with IDX-AMPRE styling
3. **PluginStyleImageLoader.jsx** - Professional image loading component
4. **EnhancedPropertyMap.jsx** - Advanced map component with IDX-AMPRE markers

### Styling
1. **idx-ampre-styles.css** - IDX-AMPRE specific CSS animations and styles
2. **app.css** - Updated to include IDX-AMPRE styles

### Configuration
1. **PropertyCards.jsx** - Updated exports for enhanced components
2. **google-maps.php** - Map configuration file

## IDX-AMPRE Style Features

### Visual Design
- **Work Sans font family** throughout the interface
- **Professional card shadows** and hover effects
- **Blue accent color** (#3182ce) for active states
- **Smooth animations** and transitions (300ms cubic-bezier)
- **Clean typography** with proper spacing and hierarchy

### Interactive Elements
- **Hover-activated buttons** (Compare/Request) on property cards
- **Active property highlighting** with blue ring and pulse
- **Smooth scale transforms** on hover (1.02x scale)
- **Image zoom effects** on card hover (1.05x scale)

### Loading States
- **Skeleton loading** with shimmer animation
- **Progressive image loading** with blur effects
- **Loading indicators** for search operations
- **Error states** with retry functionality

### Responsive Behavior
- **Desktop**: 4 cards per row in grid view
- **Tablet**: 3 cards per row
- **Mobile**: 2 cards per row, then 1 card per row
- **Mixed view**: 2 cards per row in sidebar

## Grid Layout Specifications

### Desktop (1280px+)
```css
grid-template-columns: repeat(4, 1fr);
gap: 19px;
max-width: 1280px;
```

### Tablet (900px - 1200px)
```css
grid-template-columns: repeat(3, 1fr);
gap: 16px;
max-width: 900px;
```

### Mobile (600px - 900px)
```css
grid-template-columns: repeat(2, 1fr);
gap: 12px;
max-width: 600px;
```

### Small Mobile (<600px)
```css
grid-template-columns: repeat(1, 1fr);
gap: 16px;
max-width: 400px;
```

## Usage Instructions

### Basic Grid View
```jsx
// Standard 4-card grid layout
<div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-[1280px] mx-auto\">
  {properties.map((property) => (
    <IDXAmprePropertyCard
      key={property.ListingKey}
      property={property}
      isActive={activeProperty === property.ListingKey}
      onHover={handlePropertyHover}
      onClick={handlePropertyClick}
      compact={false}
    />
  ))}
</div>
```

### Mixed View with Two Cards Per Row
```jsx
// Compact cards for sidebar
<div className=\"grid grid-cols-2 gap-3\">
  {properties.map((property) => (
    <IDXAmprePropertyCard
      key={property.ListingKey}
      property={property}
      isActive={activeProperty === property.ListingKey}
      onHover={handlePropertyHover}
      onClick={handlePropertyClick}
      compact={true}
    />
  ))}
</div>
```

### Enhanced Image Loading
```jsx
<PluginStyleImageLoader
  src={imageUrl}
  alt=\"Property Image\"
  className=\"w-full h-full\"
  enableBlurEffect={true}
  priority=\"normal\"
/>
```

## Property Card Props

### IDXAmprePropertyCard
- `property` - Property data object with MLS fields
- `isActive` - Boolean for active/highlighted state
- `onHover` - Function called on mouse enter/leave
- `onClick` - Function called on card click
- `compact` - Boolean for compact display (mixed view)

### Property Data Structure
```javascript
{
  ListingKey: 'MLS123456',
  ListPrice: 599000,
  BedroomsTotal: 3,
  BathroomsTotalInteger: 2,
  AboveGradeFinishedArea: 1200,
  PropertySubType: 'Detached',
  UnparsedAddress: '123 Main St, Toronto, ON',
  MediaURL: 'https://example.com/image.jpg',
  Latitude: 43.6532,
  Longitude: -79.3832
}
```

## Performance Optimizations

1. **Lazy Loading**: Images load only when visible
2. **Memoization**: Map calculations cached to prevent re-renders
3. **Batched Updates**: Property markers updated in batches
4. **Optimized Re-renders**: Smart state management to minimize updates
5. **Image Fallbacks**: Multiple fallback images for reliability

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Support**: iOS Safari 13+, Chrome Mobile 80+
- **Map Features**: Requires Google Maps JavaScript API v3.x

## Notes

- Ensure `GOOGLE_MAPS_API_KEY` is set in your `.env` file
- Fallback images use Unsplash API for reliable property images
- All animations use `cubic-bezier(0.4, 0, 0.2, 1)` for smooth transitions
- Active states use blue (#3182ce) to match IDX-AMPRE design
- Cards maintain 300px width in grid view for consistent 4-card layout
