# Multi-Tenant Website Management System

## Overview

This Laravel-React application now features a comprehensive multi-tenant website management system that allows you to create and manage multiple real estate websites (like Nobu Residences) with fully customizable content, branding, and functionality.

## 🏗️ System Architecture

### Database Structure

The system uses three main tables to manage multi-tenant websites:

1. **`websites`** - Main website configuration
2. **`website_pages`** - Page content for each website
3. **`icons`** - Reusable icon library for all websites

### Key Features

- ✅ **Multi-tenant Architecture**: Support multiple websites from one codebase
- ✅ **Dynamic Content Management**: Edit hero sections, about content, contact info
- ✅ **Brand Customization**: Custom colors, fonts, logos per website
- ✅ **Icon Management**: Dynamic icon system for amenities, key facts, highlights
- ✅ **Global Contact System**: Centralized contact information used across pages
- ✅ **Admin Interface**: Full admin panel for website management

## 🚀 Getting Started

### 1. Database Setup

Run the migrations to create the required tables:

```bash
php artisan migrate
```

### 2. Seed Default Data

Seed the database with the default Nobu Residences website:

```bash
php artisan db:seed --class=WebsiteSeeder
```

This creates:
- Default Nobu Residences website with full configuration
- Default home page content
- Basic icon library for amenities, key facts, and highlights

### 3. Admin Access

Access the website management system at:
- **Main Admin**: `/admin/dashboard`
- **Website Management**: `/admin/websites`
- **Icon Management**: `/admin/icons`

## 📋 Website Management

### Default Website (Nobu Residences)

The system comes with a pre-configured Nobu Residences website that serves as the default. This includes:

**Brand Configuration:**
- Primary Color: `#912018`
- Secondary Color: `#293056`
- Accent Color: `#F5F8FF`
- Fonts: Work Sans, Space Grotesk, Red Hat Mono

**Contact Information:**
- Phone: `+1 437 998 1795`
- Email: `contact@noburesidences.com`
- Address: `Building No.88, Toronto CA, Ontario, Toronto`
- Agent: `Jatin Gill - Property Manager`

### Creating New Websites

1. **Navigate to Admin Panel**: Go to `/admin/websites`
2. **Click "Create New Website"**
3. **Fill in Website Details**:
   - Name (e.g., "Luxury Condos Downtown")
   - Slug (URL-friendly name)
   - Domain (optional custom domain)
   - Branding (colors, fonts, logo)
   - Contact information
   - SEO settings

4. **Automatic Home Page Creation**: A default home page is created automatically
5. **Customize Content**: Edit the home page content to match your property

## 🎨 Content Management

### Home Page Sections

Each website's home page consists of several customizable sections:

#### Hero Section
```json
{
  "welcome_text": "WELCOME TO YOUR PROPERTY",
  "main_heading": "Your Next Home Is\nJust a Click Away",
  "subheading": "Description of your property and services",
  "background_image": "/assets/hero-image.jpg",
  "buttons": [
    {
      "text": "View Rentals",
      "url": "/rent",
      "style": "primary"
    },
    {
      "text": "View Sales",
      "url": "/sale", 
      "style": "secondary"
    }
  ]
}
```

#### About Section Tabs

The about section supports multiple tabs with different content types:

**Overview Tab:**
- Rich text content describing the property

**Key Facts Tab:**
- Icon-based facts about the building
- Square footage, floors, year built, etc.

**Amenities Tab:**
- Grid of amenities with icons
- Gym, pool, concierge, parking, etc.

**Highlights Tab:**
- Key selling points with icons
- Location benefits, luxury features, etc.

**Contact Tab:**
- Uses global contact information
- Displays agent details and contact form

### Icon Management

The system includes a dynamic icon management system:

1. **Categories**: `key_facts`, `amenities`, `highlights`, `general`
2. **Format**: SVG content or image URLs
3. **Usage**: Icons are automatically loaded into content based on name matching

**Adding New Icons:**
1. Go to `/admin/icons`
2. Click "Add New Icon"
3. Provide name, category, and SVG content or image URL
4. Icon becomes available for use in all websites

## 🎯 Brand Customization

### Color System

Each website supports a complete color palette:

```json
{
  "primary": "#912018",     // Main brand color
  "secondary": "#293056",   // Secondary brand color
  "accent": "#F5F8FF",      // Accent/background color
  "text": "#000000",        // Primary text color
  "background": "#FFFFFF",  // Background color
  "success": "#10B981",     // Success messages
  "warning": "#F59E0B",     // Warning messages
  "error": "#EF4444"        // Error messages
}
```

### Typography

Configure fonts for different purposes:

```json
{
  "primary": "Work Sans",     // Body text
  "heading": "Space Grotesk", // Headings
  "mono": "Red Hat Mono"      // Monospace text
}
```

### Logo and Assets

- **Logo**: Upload custom logo for each website
- **Favicon**: Custom favicon per website
- **Images**: Background images, property photos, etc.

## 🔧 Technical Implementation

### Controller Structure

**WebsiteController**: Handles public website rendering
- Automatically detects current website (default system)
- Loads dynamic content and branding
- Passes data to React components

**WebsiteManagementController**: Admin interface
- CRUD operations for websites
- Home page content editing
- Icon management

### Frontend Components

**Updated Components:**
- `Home.jsx`: Accepts dynamic website and content props
- `HeroSection.jsx`: Uses dynamic text, images, colors, and buttons
- `AboutSection.jsx`: Loads dynamic tab content and icons
- `MainLayout.jsx`: Applies brand colors and fonts
- `Footer.jsx`: Uses global contact information

### Data Flow

1. **Request**: User visits website
2. **Detection**: System identifies current website (default for now)
3. **Loading**: Website settings and page content loaded from database
4. **Enrichment**: Content enriched with icon data
5. **Rendering**: React components receive dynamic props
6. **Display**: Fully customized website rendered

## 📖 API Reference

### Website Model

**Relationships:**
- `pages()`: HasMany relationship to WebsitePage
- `homePage()`: Get the home page specifically

**Methods:**
- `getBrandColors()`: Returns brand colors with defaults
- `getContactInfo()`: Returns contact info with defaults
- `getSocialMedia()`: Returns social media links

**Scopes:**
- `default()`: Get the default website
- `active()`: Get active websites only

### WebsitePage Model

**Content Structure:**
- Flexible JSON structure for page content
- Supports nested sections and complex layouts
- Icon integration through name references

### Icon Model

**Usage:**
- Icons referenced by name in content
- Automatically loaded and injected into components
- Supports SVG content or image URLs

## 🔐 Admin Features

### Website Management
- List all websites
- Create new websites
- Edit website settings
- Delete websites (except default)
- Set default website

### Home Page Editor
- Visual content editing
- Dynamic section management
- Icon selection interface
- Live preview capabilities

### Icon Library
- Upload new icons
- Categorize icons
- Edit existing icons
- Bulk icon management

## 🚀 Deployment Considerations

### Multi-Domain Setup

For production multi-domain support:

1. **Domain Detection**: Modify `WebsiteController::getCurrentWebsite()` to detect by domain
2. **DNS Configuration**: Point domains to your application
3. **SSL Certificates**: Configure SSL for each domain
4. **Environment Variables**: Set domain-specific configurations

### Performance Optimization

- **Caching**: Cache website settings and content
- **CDN**: Use CDN for images and assets
- **Database Indexing**: Index frequently queried fields
- **Asset Optimization**: Optimize images and compress assets

### Security

- **Admin Access**: Restrict admin panel access
- **Input Validation**: Validate all user inputs
- **File Uploads**: Secure file upload handling
- **Database Security**: Use proper database permissions

## 📚 Usage Examples

### Creating a New Condo Website

1. **Access Admin Panel**: `/admin/websites`
2. **Create Website**:
   ```
   Name: "Skyline Towers"
   Slug: "skyline-towers"
   Domain: "skylinetowers.com" (optional)
   ```

3. **Configure Branding**:
   ```json
   {
     "primary": "#1E40AF",
     "secondary": "#374151",
     "accent": "#F3F4F6"
   }
   ```

4. **Set Contact Info**:
   ```json
   {
     "phone": "+1 416 555 0123",
     "email": "info@skylinetowers.com",
     "address": "123 Bay Street, Toronto, ON"
   }
   ```

5. **Customize Home Page**: Edit hero section, about content, and contact details

### Adding Custom Icons

1. **Navigate to Icon Management**: `/admin/icons`
2. **Add New Icon**:
   ```
   Name: "rooftop-garden"
   Category: "amenities"
   SVG Content: <svg>...</svg>
   Description: "Rooftop Garden"
   ```

3. **Use in Content**: Reference by name in amenities list
   ```json
   {
     "icon": "rooftop-garden",
     "text": "Rooftop Garden"
   }
   ```

## 🔄 Future Enhancements

### Planned Features

- **Page Builder**: Visual drag-and-drop page builder
- **Template System**: Pre-built page templates
- **Multi-Language**: Support for multiple languages
- **Advanced Analytics**: Website performance tracking
- **Integration APIs**: Third-party service integrations
- **Mobile App**: Companion mobile application
- **Advanced SEO**: Enhanced SEO optimization tools

### Extension Points

- **Custom Page Types**: Add new page types beyond home page
- **Widget System**: Reusable content widgets
- **Theme System**: Complete visual themes
- **Plugin Architecture**: Third-party plugin support

---

**Last Updated**: August 3, 2025
**Version**: 1.0.0
**Maintained By**: Development Team

For support or questions about the multi-tenant system, please refer to this documentation or contact the development team.
