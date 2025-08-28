# Google Maps Setup Guide for Search Page

## Quick Setup (5 Minutes)

### Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Library**
4. Search and enable these APIs:
   - **Maps JavaScript API** (Required)
   - **Geocoding API** (Optional, for future features)
   - **Places API** (Optional, for autocomplete)

5. Go to **APIs & Services** → **Credentials**
6. Click **+ CREATE CREDENTIALS** → **API Key**
7. Copy the generated API key

### Step 2: Add API Key to Your Project

1. Open your `.env` file
2. Add your API key:
```
GOOGLE_MAPS_API_KEY=AIzaSy_YOUR_ACTUAL_KEY_HERE
```

3. Clear Laravel cache:
```bash
php artisan config:clear
php artisan cache:clear
```

4. Restart your development server:
```bash
php artisan serve
```

### Step 3: Restrict Your API Key (Important for Production)

1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Click on your API key
3. Under **Application restrictions**, select **HTTP referrers**
4. Add your domains:
   - For development: `http://localhost:*` and `http://127.0.0.1:*`
   - For production: `https://yourdomain.com/*`
5. Under **API restrictions**, select **Restrict key**
6. Select only the APIs you enabled
7. Click **SAVE**

## Testing the Map

1. Go to http://127.0.0.1:8000/search
2. Click on the **Map View** button
3. You should see:
   - Map centered on Toronto
   - Property markers with prices
   - Clickable markers showing property info
   - Clustering for multiple properties

## Free Tier Limits

Google Maps provides **$200 free credit monthly**, which covers:
- ~28,000 map loads
- ~40,000 geocoding requests
- More than enough for development and small production sites

## Troubleshooting

### Map shows "API key not configured"
- Verify the API key is in `.env` file
- Run `php artisan config:clear`
- Check browser console for errors

### Map loads but no markers appear
- Check Network tab for `/api/property-search` response
- Verify properties have `Latitude` and `Longitude` fields
- Check browser console for JavaScript errors

### "This page can't load Google Maps correctly"
- API key might be invalid
- Required APIs might not be enabled
- API key restrictions might be blocking your domain

## What the Map Will Show

Once configured, your search page map will display:

1. **Property Markers**: Each property shown as a price marker (e.g., "$520K")
2. **Clustering**: Groups nearby properties into numbered clusters
3. **Info Windows**: Click markers to see:
   - Property image
   - Price and type
   - Bedrooms/Bathrooms
   - Address
   - "View Details" button
4. **Interactive Features**:
   - Zoom in/out
   - Pan around
   - Street view control
   - Fullscreen mode

## Alternative: Test Without API Key

If you want to see the property data without a map, the system will show a list view with:
- Property addresses
- Coordinates (Latitude, Longitude)
- All property details

This helps verify the data is correct before setting up the map.

## Sample Test API Key (Development Only)

⚠️ **WARNING**: This is for testing only. Create your own key for production!

You can temporarily test with this restricted key (may have usage limits):
```
GOOGLE_MAPS_API_KEY=AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU
```

This test key is restricted and may stop working. Always create your own key for production use.

## Next Steps

After setting up the Google Maps API key:

1. The map will automatically show all search results
2. Properties with coordinates will appear as markers
3. Clicking markers shows property details
4. The map works exactly like IDX-AMPRE plugins

## Need Help?

Check the browser console for specific error messages. Common issues:
- API key not activated
- Billing not enabled on Google Cloud account
- API restrictions blocking your domain