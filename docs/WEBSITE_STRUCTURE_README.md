# Multi-Tenant Website Structure Organization

This document outlines the website file organization structure for the multi-tenant real estate platform. The system supports multiple property websites (like Nobu Residences) with fully customizable content, branding, and functionality.

## Directory Structure

```
resources/js/Website/
├── Home.jsx                    # Main home page component
├── Global/                     # Shared components across the website
│   ├── MainLayout.jsx         # Main layout wrapper
│   ├── Navbar.jsx             # Site navigation
│   ├── Footer.jsx             # Site footer
│   └── [other global components]
└── Sections/                   # Page-specific sections
    ├── Home/                   # Home page sections
    │   ├── HeroSection.jsx     # Hero/banner section
    │   ├── AboutSection.jsx    # About section
    │   ├── PropertiesSection.jsx # Properties listing section
    │   ├── FAQSection.jsx      # FAQ accordion section
    │   └── [other home sections]
    ├── About/                  # About page sections
    │   ├── TeamSection.jsx     # Team members section
    │   ├── CompanyInfo.jsx     # Company information
    │   └── [other about sections]
    ├── Contact/                # Contact page sections
    │   ├── ContactForm.jsx     # Contact form
    │   ├── MapSection.jsx      # Location map
    │   └── [other contact sections]
    └── [other page sections]
```

## Dynamic Content System

### Component Props Structure

All main page components now receive dynamic content and branding data:

```jsx
export default function Home({ 
    auth, 
    website,        // Website configuration and branding
    siteName,       // Dynamic site name
    pageContent,    // Dynamic page content from database
    ...props 
}) {
    return (
        <MainLayout siteName={siteName} website={website}>
            <HeroSection 
                auth={auth} 
                website={website} 
                pageContent={pageContent} 
            />
            <AboutSection 
                website={website} 
                pageContent={pageContent} 
            />
        </MainLayout>
    );
}
```

### Website Object Structure

```javascript
website: {
    id: 1,
    name: "Nobu Residences",
    slug: "nobu-residences",
    brand_colors: {
        primary: "#912018",
        secondary: "#293056",
        accent: "#F5F8FF"
    },
    contact_info: {
        phone: "+1 437 998 1795",
        email: "contact@noburesidences.com",
        address: "Building No.88, Toronto CA, Ontario, Toronto",
        agent: {
            name: "Jatin Gill",
            title: "Property Manager",
            photo: "/assets/jatin-gill.png"
        }
    },
    social_media: {
        facebook: "https://facebook.com/noburesidences",
        instagram: "https://instagram.com/noburesidences"
    }
}
```

### Page Content Structure

```javascript
pageContent: {
    hero: {
        welcome_text: "WELCOME TO NOBU RESIDENCES",
        main_heading: "Your Next Home Is\nJust a Click Away",
        subheading: "Whether buying or renting...",
        background_image: "/assets/hero-section.jpg",
        buttons: [
            { text: "6 Condos for rent", url: "/rent", style: "primary" },
            { text: "6 Condos for sale", url: "/sale", style: "secondary" }
        ]
    },
    about: {
        title: "Learn everything about Nobu Residence",
        image: "/assets/nobu-building.jpg",
        tabs: {
            overview: { title: "Overview", content: "..." },
            key_facts: { 
                title: "Key Facts",
                items: [
                    { icon: "building", text: "45 floors/ 657 units", icon_data: {...} },
                    { icon: "calendar", text: "Built in 2024", icon_data: {...} }
                ]
            },
            amenities: {
                title: "Amenities",
                items: [
                    { icon: "concierge", text: "Concierge", icon_data: {...} },
                    { icon: "gym", text: "Gym", icon_data: {...} }
                ]
            }
        }
    }
}
```

## File Organization Guidelines

### 1. Page Main Files
- **Location**: `resources/js/Website/`
- **Purpose**: Contains the main page components (Home.jsx, About.jsx, Contact.jsx, etc.)
- **Naming**: Use PascalCase with `.jsx` extension
- **Example**: `Home.jsx`, `AboutUs.jsx`, `ContactUs.jsx`

### 2. Global Components
- **Location**: `resources/js/Website/Global/`
- **Purpose**: Components shared across multiple pages
- **Includes**:
  - `MainLayout.jsx` - Main website layout wrapper
  - `Navbar.jsx` - Site navigation
  - `Footer.jsx` - Site footer
  - `Header.jsx` - Site header (if different from navbar)
  - `Sidebar.jsx` - Sidebar components
  - `Breadcrumbs.jsx` - Navigation breadcrumbs
  - Any other components used site-wide

### 3. Page Sections
- **Location**: `resources/js/Website/Sections/[PageName]/`
- **Purpose**: Individual sections that make up a page
- **Organization**: Create a subfolder for each page
- **Naming**: Descriptive names with "Section" suffix
- **Examples**:
  - `Sections/Home/HeroSection.jsx`
  - `Sections/Home/AboutSection.jsx`
  - `Sections/Home/PropertiesSection.jsx`
  - `Sections/About/TeamSection.jsx`

## Implementation Rules

### 1. Import Structure
When importing components, use the following pattern:

```jsx
// Global components
import MainLayout from '@/Website/Global/MainLayout';
import Navbar from '@/Website/Global/Navbar';
import Footer from '@/Website/Global/Footer';

// Page sections
import HeroSection from '@/Website/Sections/Home/HeroSection';
import AboutSection from '@/Website/Sections/Home/AboutSection';
```

### 2. Component Structure
Each page should be structured as follows:

```jsx
import { Head } from '@inertiajs/react';
import MainLayout from '@/Website/Global/MainLayout';
import HeroSection from '@/Website/Sections/Home/HeroSection';
import AboutSection from '@/Website/Sections/Home/AboutSection';

export default function Home({ auth, ...props }) {
    return (
        <MainLayout>
            <Head title="Page Title" />
            <HeroSection {...props} />
            <AboutSection {...props} />
            {/* Other sections */}
        </MainLayout>
    );
}
```

### 3. Props Management
- Pass auth and other common props from the main page component to sections
- Use prop destructuring to pass only necessary data to each section
- Keep section components focused on their specific functionality

## Migration Steps

### When Creating New Pages:
1. Create the main page component in `resources/js/Website/`
2. Create a new folder in `resources/js/Website/Sections/` with the page name
3. Break down the page into logical sections and place them in the sections folder
4. Import global components from `resources/js/Website/Global/`

### When Creating New Sections:
1. Determine which page(s) the section belongs to
2. Create the section component in the appropriate `Sections/[PageName]/` folder
3. Use descriptive names ending with "Section"
4. Import and use the section in the main page component

### When Creating Global Components:
1. Place the component in `resources/js/Website/Global/`
2. Ensure the component is truly reusable across multiple pages
3. Update imports in all pages that use the component

## Best Practices

1. **Single Responsibility**: Each section should have a single, clear purpose
2. **Reusability**: Keep sections modular and reusable where possible
3. **Consistent Naming**: Use descriptive names that clearly indicate the component's purpose
4. **Import Organization**: Group imports by type (global, sections, utilities)
5. **Component Size**: Keep components reasonably sized; break down large components into smaller sections
6. **Documentation**: Add comments for complex sections and their props

## Multi-Tenant Development Guidelines

### 1. Dynamic Content Integration
When creating new components, always consider:
- Accept `website` prop for branding data
- Accept `pageContent` prop for dynamic content
- Use brand colors from `website.brand_colors`
- Use contact info from `website.contact_info`

### 2. Icon Integration
For components that use icons:
```jsx
// Access icon data from content
const iconData = item.icon_data;
if (iconData?.svg_content) {
    return <div dangerouslySetInnerHTML={{__html: iconData.svg_content}} />;
} else if (iconData?.icon_url) {
    return <img src={iconData.icon_url} alt={iconData.name} />;
}
```

### 3. Brand Color Usage
```jsx
// Use dynamic brand colors
const brandColors = website?.brand_colors || defaultColors;
const buttonStyle = {
    backgroundColor: brandColors.primary,
    color: 'white'
};
```

### 4. Content Fallbacks
Always provide fallback content:
```jsx
const heroContent = pageContent?.hero || {};
const welcomeText = heroContent.welcome_text || `WELCOME TO ${siteName.toUpperCase()}`;
const mainHeading = heroContent.main_heading || 'Default Heading';
```

### 5. Admin-Editable Content
Mark content that should be editable in admin:
- Hero section text and images
- About section tabs and content
- Contact information
- Brand colors and fonts
- Icon selections for amenities/features

## Current Status

- ✅ Multi-tenant website system implemented
- ✅ Dynamic content management system
- ✅ Website folder structure organized
- ✅ Home.jsx converted to dynamic content system
- ✅ HeroSection.jsx updated with dynamic props
- ✅ AboutSection.jsx ready for dynamic content (needs implementation)
- ✅ Global components (MainLayout, Navbar, Footer) organized
- ✅ Icon management system implemented
- ✅ Database schema and models created
- ✅ Admin interface structure established
- 🔄 AboutSection dynamic content implementation needed
- 🔄 Admin UI components need to be created
- 🔄 Icon integration in AboutSection needed

## Next Steps

1. **Complete AboutSection Dynamic Implementation**
   - Update AboutSection.jsx to use pageContent prop
   - Implement dynamic tab content rendering
   - Integrate icon system for key facts, amenities, highlights

2. **Create Admin UI Components**
   - Website listing and management interface
   - Home page content editor
   - Icon management interface
   - Brand customization panel

3. **Implement About Section Background Color Removal**
   - Remove all white background colors from tabs area
   - Apply dynamic brand colors where appropriate

4. **Extend Multi-Tenant System**
   - Add more page types (About, Contact, etc.)
   - Implement template system for new websites
   - Add bulk content management tools

5. **Testing and Documentation**
   - Create comprehensive test suite
   - Document admin workflows
   - Create user guides for content management

---

**Last Updated**: August 3, 2025
**Maintained By**: Development Team
