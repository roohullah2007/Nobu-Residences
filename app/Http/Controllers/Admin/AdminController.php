<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\ContactForm;
use App\Models\User;
use App\Models\Website;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Admin dashboard
     */
    public function dashboard(): Response
    {
        $contactStats = [
            'total_contacts' => ContactForm::count(),
            'unread_contacts' => ContactForm::unread()->count(),
            'recent_contacts' => ContactForm::recent(7)->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'title' => 'Dashboard',
            'stats' => [
                'total_properties' => Building::count(),
                'active_listings' => Building::where('status', 'active')->count(),
                'pending_listings' => Building::where('status', 'pending')->count(),
                'total_users' => User::count(),
                'total_contacts' => $contactStats['total_contacts'],
                'unread_contacts' => $contactStats['unread_contacts'],
                'recent_contacts' => $contactStats['recent_contacts'],
            ],
            'websites' => $this->websitesSummary(),
            'activity' => $this->recentActivity(),
            'contactStats' => $contactStats,
        ]);
    }

    /**
     * Websites list for the dashboard card
     */
    private function websitesSummary(): array
    {
        return Website::withCount('pages')
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get()
            ->map(fn (Website $website) => [
                'id' => $website->id,
                'name' => $website->name,
                'domain' => $website->domain ?? 'Default Website',
                'status' => $website->is_active ? 'active' : 'inactive',
                'pages' => $website->pages_count,
            ])
            ->all();
    }

    /**
     * Recent activity feed: latest buildings and contact inquiries
     */
    private function recentActivity(): array
    {
        $buildings = Building::latest()->limit(5)->get()
            ->map(fn (Building $building) => [
                'type' => 'building',
                'label' => "Building added: {$building->name}",
                'time' => $building->created_at?->diffForHumans(),
                'timestamp' => $building->created_at?->timestamp ?? 0,
            ]);

        $contacts = ContactForm::latest()->limit(5)->get()
            ->map(fn (ContactForm $contact) => [
                'type' => 'contact',
                'label' => "New contact inquiry from {$contact->name}",
                'time' => $contact->created_at?->diffForHumans(),
                'timestamp' => $contact->created_at?->timestamp ?? 0,
            ]);

        return $buildings->concat($contacts)
            ->sortByDesc('timestamp')
            ->take(6)
            ->values()
            ->map(fn (array $item) => collect($item)->except('timestamp')->all())
            ->all();
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
                    'logo_url' => '/assets/Logo.png',
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
