# Gemini AI Integration Test Guide

## Overview
This guide helps you test the Gemini AI integration for generating property descriptions.

## Prerequisites
- ✅ Gemini API Key is configured in .env: `GEMINI_API_KEY=AIzaSyAQiazBsYhcKBAcvcOLKoOuixJJMF8N95Q`
- ✅ Database migrations have been run
- ✅ API routes are registered

## Available API Endpoints

### 1. Generate Description
**POST** `/api/property-ai/generate-description`

**Request Body:**
```json
{
    "mls_id": "C9425648",
    "force_regenerate": false
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "overview": "AI-generated overview...",
        "detailed": "AI-generated detailed description...",
        "cached": false,
        "generated_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

### 2. Generate FAQs
**POST** `/api/property-ai/generate-faqs`

**Request Body:**
```json
{
    "mls_id": "C9425648",
    "force_regenerate": false
}
```

### 3. Get All Content
**GET** `/api/property-ai/content?mls_id=C9425648`

### 4. Delete Content
**DELETE** `/api/property-ai/content`

**Request Body:**
```json
{
    "mls_id": "C9425648",
    "delete_description": true,
    "delete_faqs": true
}
```

## Frontend Components

### 1. PropertyAiDescription Component
Located at: `resources/js/Website/Components/Property/PropertyAiDescription.jsx`

Usage:
```jsx
import PropertyAiDescription from '@/Website/Components/Property/PropertyAiDescription';

<PropertyAiDescription
    mlsId="C9425648"
    showFaqs={true}
    className="space-y-6"
/>
```

### 2. PropertyCardWithAI Component
Located at: `resources/js/Website/Components/Property/PropertyCardWithAI.jsx`

Usage:
```jsx
import PropertyCardWithAI from '@/Website/Components/Property/PropertyCardWithAI';

<PropertyCardWithAI property={propertyData} />
```

### 3. PropertyAiDemo Page
Located at: `resources/js/Website/Pages/PropertyAiDemo.jsx`

A complete demo page for testing AI functionality.

## Testing Steps

1. **Test API Directly:**
   ```bash
   curl -X POST http://localhost:8000/api/property-ai/generate-description \
     -H "Content-Type: application/json" \
     -d '{"mls_id":"C9425648"}'
   ```

2. **Test in Browser:**
   - Navigate to the PropertyAiDemo page
   - Enter a valid MLS ID
   - Click "Generate" to test the functionality

3. **Test with Property Cards:**
   - Replace `PropertyCard` with `PropertyCardWithAI` in your listings
   - Click the "AI Description" button overlay

## Database Tables

### property_ai_descriptions
- `id` - Primary key
- `mls_id` - Property MLS ID (unique, indexed)
- `overview_description` - Short overview
- `detailed_description` - Detailed description
- `property_data` - JSON property data used for generation
- `ai_model` - Model used (gemini-1.5-flash)
- `created_at`, `updated_at` - Timestamps

### property_faqs
- `id` - Primary key
- `mls_id` - Property MLS ID
- `question` - FAQ question
- `answer` - FAQ answer
- `order` - Display order
- `is_active` - Active status
- `ai_model` - Model used
- `created_at`, `updated_at` - Timestamps

## Services

### GeminiAIService
Main service for AI content generation with comprehensive fallbacks.

### GeminiDescriptionService
Alternative service with simpler interface.

## Error Handling

The system includes:
- API error handling with fallback descriptions
- Loading states
- Error messages in the UI
- Caching to reduce API calls
- Graceful degradation if API fails

## Next Steps

1. Test the integration with real MLS data
2. Customize prompts in the services if needed
3. Integrate `PropertyCardWithAI` into your property listings
4. Monitor API usage and costs
5. Consider adding admin controls for managing AI content