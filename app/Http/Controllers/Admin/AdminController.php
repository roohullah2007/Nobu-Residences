<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Admin dashboard
     */
    public function dashboard(): Response
    {
        // Get actual websites data - currently just the default website
        $websites = [
            [
                'id' => 1,
                'name' => 'Nobu Residences',
                'domain' => 'Default Website',
                'status' => 'active',
                'lastUpdated' => 'Today',
                'properties' => 0 // Will be populated from MLS API when connected
            ]
        ];

        // Get contact form stats
        $contactStats = [
            'total_contacts' => \App\Models\ContactForm::count(),
            'unread_contacts' => \App\Models\ContactForm::unread()->count(),
            'recent_contacts' => \App\Models\ContactForm::recent(7)->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'title' => 'Dashboard',
            'stats' => [
                'total_properties' => 0, // Will be populated from MLS API
                'active_listings' => 0,
                'pending_listings' => 0,
                'total_users' => \App\Models\User::count(),
                'total_contacts' => $contactStats['total_contacts'],
                'unread_contacts' => $contactStats['unread_contacts'],
                'recent_contacts' => $contactStats['recent_contacts'],
            ],
            'websites' => $websites,
            'contactStats' => $contactStats
        ]);
    }

    /**
     * Websites management
     */
    public function websites(): Response
    {
        return Inertia::render('Admin/Websites/Index', [
            'title' => 'Website Management',
            'websites' => [
                [
                    'id' => 1,
                    'name' => 'Nobu Residences',
                    'slug' => 'nobu-residences',
                    'domain' => null,
                    'is_default' => true,
                    'is_active' => true,
                    'logo_url' => '/assets/logo.png',
                    'pages' => [
                        ['id' => 1, 'page_type' => 'home', 'title' => 'Home', 'is_active' => true]
                    ]
                ]
            ]
        ]);
    }

    /**
     * Icon Management
     */
    public function icons(): Response
    {
        $icons = \App\Models\Icon::orderBy('category')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Icons/Index', [
            'title' => 'Icon Management',
            'icons' => $icons
        ]);
    }
}
