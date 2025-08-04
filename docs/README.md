# Laravel React Starter - Project Documentation

## Project Overview
This is a Laravel-React application starter template with a well-organized website structure for scalable development.

## Structure Documentation

### Website Architecture
All website-related components follow a structured organization pattern:

```
resources/js/Website/
├── [PageName].jsx          # Main page components
├── Global/                 # Shared components
└── Sections/              # Page-specific sections
    └── [PageName]/        # Sections for each page
```

For detailed information about the website structure and guidelines, see: [Website Structure Documentation](./WEBSITE_STRUCTURE_README.md)

## Quick Start

1. Install dependencies:
   ```bash
   composer install
   npm install
   ```

2. Set up environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. Run development server:
   ```bash
   npm run dev
   php artisan serve
   ```

## Current Status

### ✅ Completed
- Website folder structure organization
- Home page converted to modular section components
- Global components (Layout, Navbar, Footer) organized
- Documentation created

### 🔄 In Progress
- Breaking down existing components into reusable sections
- Creating additional page templates

### 📋 Next Steps
1. Create additional page structures (About, Contact, etc.)
2. Implement section-based architecture for other pages
3. Add more global components as needed

## File Organization

### Main Pages
- `resources/js/Website/Home.jsx` - Main home page
- `resources/js/Pages/Welcome.jsx` - Compatibility redirect to Home

### Global Components
- `resources/js/Website/Global/MainLayout.jsx` - Main site layout
- `resources/js/Website/Global/Navbar.jsx` - Site navigation
- `resources/js/Website/Global/Footer.jsx` - Site footer

### Home Page Sections
- `resources/js/Website/Sections/Home/HeroSection.jsx` - Hero/banner area
- `resources/js/Website/Sections/Home/AboutSection.jsx` - About content with tabs
- `resources/js/Website/Sections/Home/PropertiesSection.jsx` - Properties listings
- `resources/js/Website/Sections/Home/FAQSection.jsx` - FAQ accordion

## Contributing

When adding new pages or sections, please follow the established structure patterns outlined in the [Website Structure Documentation](./WEBSITE_STRUCTURE_README.md).

---

**Last Updated**: August 3, 2025
