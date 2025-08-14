<?php

namespace App\Http\Controllers;

use App\Models\Website;
use App\Models\Icon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Application;

class WebsiteController extends Controller
{
    /**
     * Get the current website (default for now, can be extended for multi-domain)
     */
    private function getCurrentWebsite()
    {
        return Website::default()->active()->first() ?? Website::first();
    }

    /**
     * Get website settings/configuration with dynamic content
     */
    private function getWebsiteSettings()
    {
        $website = $this->getCurrentWebsite();
        
        if (!$website) {
            // Fallback if no website exists
            return [
                'siteName' => 'Nobu Residences',
                'siteUrl' => 'www.noburesidences.com',
                'year' => date('Y'),
                'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
                'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion' => PHP_VERSION,
            ];
        }

        return [
            'website' => [
                'id' => $website->id,
                'name' => $website->name,
                'slug' => $website->slug,
                'logo_url' => $website->logo_url,
                'brand_colors' => $website->getBrandColors(),
                'fonts' => $website->fonts,
                'meta_title' => $website->meta_title,
                'meta_description' => $website->meta_description,
                'favicon_url' => $website->favicon_url,
                'contact_info' => $website->getContactInfo(),
                'social_media' => $website->getSocialMedia(),
            ],
            'siteName' => $website->name,
            'siteUrl' => $website->domain ?? request()->getHost(),
            'year' => date('Y'),
            'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
            'canRegister' => \Illuminate\Support\Facades\Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ];
    }

    /**
     * Get page content with icons
     */
    private function getPageContent($pageType = 'home')
    {
        $website = $this->getCurrentWebsite();
        
        if (!$website) {
            return [];
        }

        $page = $website->pages()->where('page_type', $pageType)->first();
        
        if (!$page) {
            return [];
        }

        $content = $page->content;

        // Load icons for the page content
        if (isset($content['about']['tabs'])) {
            $content['about']['tabs'] = $this->enrichContentWithIcons($content['about']['tabs']);
        }

        return $content;
    }

    /**
     * Enrich content with actual icon data
     */
    private function enrichContentWithIcons($tabs)
    {
        // Get all icons grouped by category
        $iconsByCategory = Icon::active()
            ->get()
            ->groupBy('category');

        foreach ($tabs as $tabKey => &$tab) {
            if (isset($tab['items']) && is_array($tab['items'])) {
                foreach ($tab['items'] as &$item) {
                    if (isset($item['icon'])) {
                        $iconName = $item['icon'];
                        $category = $tabKey === 'key_facts' ? 'key_facts' : 
                                   ($tabKey === 'amenities' ? 'amenities' : 'highlights');
                        
                        // Find the icon
                        $icons = $iconsByCategory->get($category, collect());
                        $icon = $icons->firstWhere('name', $iconName);
                        
                        if ($icon) {
                            $item['icon_data'] = [
                                'id' => $icon->id,
                                'name' => $icon->name,
                                'svg_content' => $icon->svg_content,
                                'icon_url' => $icon->icon_url,
                            ];
                        }
                    }
                }
            }
        }

        return $tabs;
    }

    /**
     * Display the home page
     */
    public function home()
    {
        $settings = $this->getWebsiteSettings();
        $pageContent = $this->getPageContent('home');
        
        // Get all icons grouped by category for the frontend
        $icons = Icon::active()
            ->select('id', 'name', 'category', 'svg_content', 'icon_url', 'description')
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->groupBy('category');

        return Inertia::render('Welcome', array_merge($settings, [
            'pageContent' => $pageContent,
            'availableIcons' => $icons
        ]));
    }

    /**
     * Display the rent page
     */
    public function rent()
    {
        return Inertia::render('Rent', array_merge($this->getWebsiteSettings(), [
            'title' => 'Properties for Rent'
        ]));
    }

    /**
     * Display the sale page
     */
    public function sale()
    {
        return Inertia::render('Sale', array_merge($this->getWebsiteSettings(), [
            'title' => 'Properties for Sale'
        ]));
    }

    /**
     * Display the search page
     */
    public function search(Request $request)
    {
        // Get search filters from request
        $filters = $request->only([
            'search', 'forSale', 'bedType', 'minPrice', 'maxPrice'
        ]);
        
        // Mock properties data for now - replace with actual property search logic
        $properties = [];
        
        return Inertia::render('Search', array_merge($this->getWebsiteSettings(), [
            'title' => 'Search All Properties',
            'properties' => $properties,
            'filters' => $filters
        ]));
    }

    /**
     * Display the blog page
     */
    public function blog()
    {
        return Inertia::render('Blog', array_merge($this->getWebsiteSettings(), [
            'title' => 'Real Estate Blog'
        ]));
    }

    /**
     * Display the contact page
     */
    public function contact()
    {
        return Inertia::render('Contact', array_merge($this->getWebsiteSettings(), [
            'title' => 'Contact Us'
        ]));
    }

    /**
     * Display the privacy policy page
     */
    public function privacy()
    {
        return Inertia::render('Privacy', array_merge($this->getWebsiteSettings(), [
            'title' => 'Privacy Policy'
        ]));
    }

    /**
     * Display the terms of service page
     */
    public function terms()
    {
        return Inertia::render('Terms', array_merge($this->getWebsiteSettings(), [
            'title' => 'Terms of Service'
        ]));
    }

    /**
     * Display the property detail page
     */
    public function propertyDetail()
    {
        return Inertia::render('PropertyDetail', array_merge($this->getWebsiteSettings(), [
            'title' => 'Property Detail'
        ]));
    }
}
