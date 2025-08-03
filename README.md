# Laravel React Multi-Tenant Real Estate Platform

A modern Laravel application with React frontend featuring a comprehensive multi-tenant website management system for real estate properties. Create and manage multiple property websites (like Nobu Residences) with fully customizable content, branding, and functionality.

## ✨ Key Features

- 🏢 **Multi-Tenant Architecture**: Manage multiple property websites from one platform
- 🎨 **Dynamic Content Management**: Edit hero sections, about content, contact info through admin
- 🎯 **Brand Customization**: Custom colors, fonts, logos per website
- 🔧 **Icon Management System**: Dynamic icons for amenities, key facts, highlights
- 📧 **Global Contact System**: Centralized contact information used across pages
- 👨‍💼 **Admin Interface**: Full admin panel for website and content management
- ⚡ **Server-Side Rendering**: SEO-optimized with Inertia.js SSR
- 📱 **Responsive Design**: Mobile-first responsive design with Tailwind CSS

## Features

- ✅ Laravel 12.x with Multi-Tenant Architecture
- ✅ React 18.x with JSX and Dynamic Content System
- ✅ Inertia.js with SSR support
- ✅ Tailwind CSS with Brand Customization
- ✅ Vite for asset bundling
- ✅ Laravel Breeze authentication
- ✅ Multi-Tenant Website Management
- ✅ Dynamic Icon System
- ✅ Admin Content Management Panel
- ✅ TypeScript support (JSconfig)

## Requirements

- PHP 8.2+
- Composer
- Node.js 18+
- NPM or Yarn

## Installation

1. Install PHP dependencies:
```bash
composer install
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Generate application key:
```bash
php artisan key:generate
```

4. Configure your environment:
```bash
cp .env.example .env
# Edit .env file with your database credentials
```

5. Run database migrations:
```bash
php artisan migrate
```

6. Seed the default website data:
```bash
php artisan db:seed --class=WebsiteSeeder
```

This creates the default Nobu Residences website with full configuration.

## Multi-Tenant Website Management

### Default Website (Nobu Residences)

The system comes pre-configured with Nobu Residences as the default website, featuring:

- **Customizable Hero Section**: Dynamic text, background images, and CTA buttons
- **About Section Management**: Editable tabs for Overview, Key Facts, Amenities, Highlights, Contact
- **Brand Customization**: Custom colors, fonts, and logos
- **Icon System**: Dynamic icons for amenities and features
- **Global Contact Management**: Centralized contact information

### Admin Panel Access

- **Main Dashboard**: `/admin/dashboard`
- **Website Management**: `/admin/websites`
- **Icon Management**: `/admin/icons`
- **Content Editing**: Each website has editable content sections

### Creating New Websites

1. Access `/admin/websites`
2. Click "Create New Website"
3. Configure branding, contact info, and content
4. Customize home page sections
5. Manage icons and assets

For detailed documentation, see: [Multi-Tenant System Guide](./docs/MULTI_TENANT_SYSTEM.md)

## Development

### Running the Development Server

1. Start the Laravel development server:
```bash
php artisan serve
```

2. In another terminal, start the Vite development server:
```bash
npm run dev
```

### Building for Production

Build both client-side and SSR assets:
```bash
npm run build
```

### SSR Setup

The application is pre-configured with Server-Side Rendering:

- SSR entry point: `resources/js/ssr.jsx`
- Vite configuration includes SSR build
- Built SSR bundle: `bootstrap/ssr/ssr.js`

## Project Structure

```
├── app/
│   ├── Http/Controllers/
│   │   ├── WebsiteController.php          # Public website rendering
│   │   └── Admin/
│   │       ├── AdminController.php        # Admin dashboard
│   │       └── WebsiteManagementController.php # Multi-tenant management
│   └── Models/
│       ├── Website.php                    # Website configuration model
│       ├── WebsitePage.php                # Page content model
│       └── Icon.php                       # Icon management model
├── database/
│   ├── migrations/                        # Multi-tenant database schema
│   └── seeders/
│       └── WebsiteSeeder.php              # Default website setup
├── resources/
│   ├── js/
│   │   ├── Website/                       # Main website components
│   │   │   ├── Home.jsx                   # Dynamic home page
│   │   │   ├── Global/                    # Shared components
│   │   │   │   ├── MainLayout.jsx         # Brand-aware layout
│   │   │   │   ├── Navbar.jsx             # Dynamic navigation
│   │   │   │   └── Footer.jsx             # Dynamic footer
│   │   │   └── Sections/                  # Page sections
│   │   │       └── Home/
│   │   │           ├── HeroSection.jsx    # Customizable hero
│   │   │           ├── AboutSection.jsx   # Dynamic about content
│   │   │           └── [other sections]
│   │   ├── Pages/                         # Inertia.js pages
│   │   │   └── Admin/                     # Admin interface pages
│   │   ├── app.jsx                        # Client-side entry point
│   │   └── ssr.jsx                        # SSR entry point
│   └── css/
│       └── app.css                        # Tailwind CSS
├── docs/
│   ├── MULTI_TENANT_SYSTEM.md             # Multi-tenant documentation
│   ├── WEBSITE_STRUCTURE_README.md        # Component structure
│   └── README.md                          # Project documentation
├── routes/
│   ├── web.php                            # Multi-tenant routes
│   └── auth.php                           # Authentication routes
└── public/build/                          # Built assets
```

## Available Routes

### Public Routes
- `/` - Dynamic home page (Nobu Residences by default)
- `/rent` - Properties for rent
- `/sale` - Properties for sale
- `/search` - Property search
- `/blog` - Real estate blog
- `/contact` - Contact page
- `/property-detail` - Property details

### Authentication Routes
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Authenticated dashboard
- `/profile` - User profile management

### Admin Routes (Protected)
- `/admin/dashboard` - Admin dashboard
- `/admin/websites` - Website management
- `/admin/websites/{website}/edit` - Edit website settings
- `/admin/websites/{website}/home-page/edit` - Edit home page content
- `/admin/icons` - Icon management
- `/admin/pages` - Page management
- `/admin/posts` - Blog post management
- `/admin/api-keys` - API configuration

## Authentication

Laravel Breeze provides:
- User registration
- Login/logout
- Password reset
- Email verification
- Profile management

## Technologies Used

- **Backend**: Laravel 12.x, PHP 8.2+
- **Frontend**: React 18.x, Inertia.js
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Authentication**: Laravel Breeze
- **SSR**: Inertia.js SSR

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
