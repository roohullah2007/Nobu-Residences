# Website Structure Documentation

## 📁 Folder Organization

This document outlines the organizational structure for all website pages, components, and sections to ensure consistency and maintainability.

## 🏗️ Directory Structure

```
resources/js/
├── Website/                    # Main website root folder
│   ├── Home.jsx               # Homepage main file
│   ├── PropertyDetail.jsx     # Property detail page
│   ├── About.jsx              # About page
│   ├── Contact.jsx            # Contact page
│   └── [Other Pages].jsx     # Additional pages
│
├── Website/Sections/          # Page sections and components
│   ├── Home/                  # Home page sections
│   │   ├── HeroSection.jsx    # Hero banner component
│   │   ├── AboutSection.jsx   # About section component
│   │   ├── PropertiesSection.jsx
│   │   └── FAQSection.jsx
│   │
│   ├── PropertyDetail/        # Property detail sections
│   │   ├── ImageGallery.jsx
│   │   ├── PropertyInfo.jsx
│   │   └── SimilarProperties.jsx
│   │
│   └── [PageName]/            # Other page sections
│       ├── Section1.jsx
│       └── Section2.jsx
│
├── Website/Global/            # Shared components across website
│   ├── Header.jsx             # Main navigation header
│   ├── Footer.jsx             # Website footer
│   ├── Navbar.jsx             # Navigation component
│   ├── MainLayout.jsx         # Main layout wrapper
│   └── SEO.jsx                # SEO meta components
│
└── Pages/                     # Keep for Laravel Inertia routing
    ├── Welcome.jsx            # Redirect to Website/Home.jsx
    └── [Other Routes].jsx     # Other route handlers
```

## 📋 Naming Conventions

### **Files & Components**
- Use **PascalCase** for all component files: `HeroSection.jsx`
- Use **descriptive names** that indicate the component's purpose
- Keep filenames **concise but clear**

### **Folders**
- Use **PascalCase** for page-specific folders: `Home/`, `PropertyDetail/`
- Use **descriptive names** that match the page they belong to

## 🔄 Import Structure

### **Page-level imports** (Website/*.jsx):
```jsx
// Global components
import MainLayout from '@/Website/Global/MainLayout';
import Header from '@/Website/Global/Header';

// Page sections
import HeroSection from '@/Website/Sections/Home/HeroSection';
import AboutSection from '@/Website/Sections/Home/AboutSection';
```

### **Section-level imports** (Website/Sections/*/*.jsx):
```jsx
// Global components only when needed
import Button from '@/Website/Global/Button';

// External libraries
import { useState } from 'react';
import { Link } from '@inertiajs/react';
```

## 📁 Component Organization Rules

### **Website/ (Main Pages)**
- **Purpose**: Contains the main page components
- **Content**: Page structure, layout, and section orchestration
- **Should include**: 
  - Page layout structure
  - Section imports and arrangement
  - Page-specific state management
  - SEO meta information

### **Website/Sections/ (Page Sections)**
- **Purpose**: Contains reusable sections for specific pages
- **Content**: Individual sections that make up pages
- **Should include**: 
  - Section-specific components
  - Local state management
  - Section styling and layout
  - Interactive elements

### **Website/Global/ (Shared Components)**
- **Purpose**: Contains components used across multiple pages
- **Content**: Reusable UI components and layouts
- **Should include**: 
  - Navigation components
  - Layout wrappers
  - Common UI elements
  - Utility components

## 🚀 Implementation Guidelines

### **1. Page Creation Process**
1. Create main page file in `Website/[PageName].jsx`
2. Create corresponding section folder in `Website/Sections/[PageName]/`
3. Break down page into logical sections
4. Create individual section components
5. Import and arrange sections in main page file

### **2. Component Dependencies**
- **Pages** can import from `Global/` and `Sections/[PageName]/`
- **Sections** can import from `Global/` only
- **Global** components should be self-contained

### **3. Responsive Design**
- Use **mobile-first** approach with Tailwind CSS
- Implement responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Test across different screen sizes

### **4. State Management**
- Keep **page-level state** in main page components
- Keep **section-level state** in individual sections
- Use **global state** only when necessary

## 📝 Migration Steps

### **Moving Existing Components**
1. **Identify component type** (Page, Section, or Global)
2. **Move to appropriate folder**
3. **Update import paths** in all files that reference it
4. **Test functionality** after migration
5. **Update documentation** if needed

### **Example Migration**
```bash
# Before
Pages/Welcome.jsx

# After
Website/Home.jsx
Website/Sections/Home/HeroSection.jsx
Website/Sections/Home/AboutSection.jsx
Website/Sections/Home/PropertiesSection.jsx
Website/Sections/Home/FAQSection.jsx
```

## ✅ Best Practices

### **Do's**
- ✅ Keep components **focused and single-purpose**
- ✅ Use **descriptive component names**
- ✅ Follow the **established folder structure**
- ✅ **Document complex components** with comments
- ✅ **Test responsive behavior** on all devices
- ✅ **Reuse Global components** when possible

### **Don'ts**
- ❌ Don't mix **page logic with section logic**
- ❌ Don't create **deeply nested component structures**
- ❌ Don't put **page-specific components** in Global/
- ❌ Don't **duplicate code** across sections
- ❌ Don't forget to **update import paths** after moving files

## 🔧 Maintenance

### **Regular Tasks**
- **Review component usage** across pages
- **Refactor common patterns** into Global components
- **Update documentation** when structure changes
- **Clean up unused components** and imports

### **Before Adding New Pages**
1. **Plan the page structure** and sections needed
2. **Identify reusable components** that can go in Global/
3. **Create folder structure** following the guidelines
4. **Implement sections** before assembling the main page

---

**Note**: This structure is designed to scale with the project and make it easier for developers to find, maintain, and extend website functionality.

**Last Updated**: January 2025