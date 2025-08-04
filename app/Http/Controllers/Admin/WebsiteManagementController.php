<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Website;
use App\Models\WebsitePage;
use App\Models\Icon;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class WebsiteManagementController extends Controller
{
    /**
     * Display websites listing
     */
    public function index(): Response
    {
        $websites = Website::with('pages')->orderBy('is_default', 'desc')->orderBy('name')->get();

        return Inertia::render('Admin/Websites/Index', [
            'title' => 'Website Management',
            'websites' => $websites
        ]);
    }

    /**
     * Show website details
     */
    public function show(Website $website): Response
    {
        $website->load('pages');

        return Inertia::render('Admin/Websites/Show', [
            'title' => "Website: {$website->name}",
            'website' => $website
        ]);
    }

    /**
     * Show create website form
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Websites/Create', [
            'title' => 'Create New Website'
        ]);
    }

    /**
     * Store new website
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:websites',
            'domain' => 'nullable|string|max:255',
            'is_default' => 'boolean',
            'logo_url' => 'nullable|string|max:255',
            'brand_colors' => 'nullable|array',
            'fonts' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'favicon_url' => 'nullable|string|max:255',
            'contact_info' => 'nullable|array',
            'social_media' => 'nullable|array',
            'description' => 'nullable|string',
            'business_hours' => 'nullable|array',
            'timezone' => 'nullable|string|max:255',
        ]);

        // If this is set as default, remove default from other websites
        if ($validated['is_default'] ?? false) {
            Website::where('is_default', true)->update(['is_default' => false]);
        }

        $website = Website::create($validated);

        // Create default home page
        WebsitePage::create([
            'website_id' => $website->id,
            'page_type' => 'home',
            'title' => "Home - {$website->name}",
            'content' => WebsitePage::getDefaultHomeContent(),
            'is_active' => true,
            'sort_order' => 0,
        ]);

        return redirect()->route('admin.websites.show', $website)
            ->with('success', 'Website created successfully!');
    }

    /**
     * Show edit website form
     */
    public function edit(Website $website): Response
    {
        return Inertia::render('Admin/Websites/Edit', [
            'title' => "Edit Website: {$website->name}",
            'website' => $website
        ]);
    }

    /**
     * Update website
     */
    public function update(Request $request, Website $website): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('websites')->ignore($website->id)],
            'domain' => 'nullable|string|max:255',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'logo_url' => 'nullable|string|max:255',
            'brand_colors' => 'nullable|array',
            'fonts' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'favicon_url' => 'nullable|string|max:255',
            'contact_info' => 'nullable|array',
            'social_media' => 'nullable|array',
            'description' => 'nullable|string',
            'business_hours' => 'nullable|array',
            'timezone' => 'nullable|string|max:255',
        ]);

        // If this is set as default, remove default from other websites
        if ($validated['is_default'] ?? false) {
            Website::where('id', '!=', $website->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $website->update($validated);

        return redirect()->route('admin.websites.show', $website)
            ->with('success', 'Website updated successfully!');
    }

    /**
     * Delete website
     */
    public function destroy(Website $website): RedirectResponse
    {
        if ($website->is_default) {
            return redirect()->back()
                ->withErrors(['error' => 'Cannot delete the default website.']);
        }

        $website->delete();

        return redirect()->route('admin.websites.index')
            ->with('success', 'Website deleted successfully!');
    }

    /**
     * Edit home page content
     */
    public function editHomePage($websiteId): Response
    {
        try {
            $website = Website::findOrFail($websiteId);
            $homePage = $website->pages()->where('page_type', 'home')->first();
            
            if (!$homePage) {
                // Create default home page if it doesn't exist
                $homePage = WebsitePage::create([
                    'website_id' => $website->id,
                    'page_type' => 'home',
                    'title' => "Home - {$website->name}",
                    'content' => WebsitePage::getDefaultHomeContent(),
                    'is_active' => true,
                    'sort_order' => 0,
                ]);
            }

            // Get all icons grouped by category
            $icons = Icon::active()
                ->select('id', 'name', 'category', 'svg_content', 'icon_url')
                ->orderBy('category')
                ->orderBy('name')
                ->get()
                ->groupBy('category');

            return Inertia::render('Admin/Websites/EditHomePage', [
                'title' => "Edit Home Page: {$website->name}",
                'website' => $website,
                'homePage' => $homePage,
                'availableIcons' => $icons
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Edit home page failed: ' . $e->getMessage());
            return redirect()->route('admin.websites.index')
                ->withErrors(['error' => 'Failed to load home page editor.']);
        }
    }

    /**
     * Update home page content
     */
    public function updateHomePage(Request $request, $websiteId): RedirectResponse
    {
        try {
            // Debug: Log all request data
            \Log::info('UpdateHomePage Request Data:', [
                'all' => $request->all(),
                'files' => $request->allFiles(),
                'method' => $request->method()
            ]);
            
            $website = Website::findOrFail($websiteId);
            $homePage = $website->pages()->where('page_type', 'home')->first();
            
            if (!$homePage) {
                // Create home page if it doesn't exist
                $homePage = WebsitePage::create([
                    'website_id' => $website->id,
                    'page_type' => 'home',
                    'title' => 'Home - ' . $website->name,
                    'content' => WebsitePage::getDefaultHomeContent(),
                    'is_active' => true,
                    'sort_order' => 0,
                ]);
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'nullable', // Remove type restriction since it can be string or array
                'hero_background_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
                'about_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
                'footer_logo' => 'nullable|file|mimes:jpg,jpeg,png,webp,svg|max:5120', // 5MB max
                'footer_background_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
            ]);

            // Handle content field (can be JSON string or array)
            $content = $homePage->content; // Start with existing content
            if (isset($validated['content'])) {
                if (is_string($validated['content'])) {
                    // If it's a string, decode it
                    $decodedContent = json_decode($validated['content'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $content = $decodedContent;
                        \Log::info('FAQ content decoded successfully:', [
                            'faq_enabled' => $content['faq']['enabled'] ?? 'not set',
                            'faq_title' => $content['faq']['title'] ?? 'not set',
                            'faq_items_count' => count($content['faq']['items'] ?? [])
                        ]);
                    } else {
                        \Log::error('JSON decode error for content:', [
                            'content' => $validated['content'],
                            'error' => json_last_error_msg()
                        ]);
                    }
                } elseif (is_array($validated['content'])) {
                    // If it's already an array, use it directly
                    $content = $validated['content'];
                    \Log::info('FAQ content updated from array:', [
                        'faq_enabled' => $content['faq']['enabled'] ?? 'not set',
                        'faq_title' => $content['faq']['title'] ?? 'not set',
                        'faq_items_count' => count($content['faq']['items'] ?? [])
                    ]);
                }
            }

            // Handle hero background image upload
            if ($request->hasFile('hero_background_image')) {
                $heroImageFile = $request->file('hero_background_image');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old image if exists
                if (isset($content['hero']['background_image']) && 
                    strpos($content['hero']['background_image'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['hero']['background_image']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $heroImagePath = $heroImageFile->store('home-page', 'public');
                $content['hero']['background_image'] = '/storage/' . $heroImagePath;
            }

            // Handle about image upload
            if ($request->hasFile('about_image')) {
                $aboutImageFile = $request->file('about_image');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old image if exists
                if (isset($content['about']['image']) && 
                    strpos($content['about']['image'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['about']['image']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $aboutImagePath = $aboutImageFile->store('home-page', 'public');
                $content['about']['image'] = '/storage/' . $aboutImagePath;
            }

            // Handle footer logo upload
            if ($request->hasFile('footer_logo')) {
                $footerLogoFile = $request->file('footer_logo');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old logo if exists
                if (isset($content['footer']['logo_url']) && 
                    strpos($content['footer']['logo_url'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['footer']['logo_url']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $footerLogoPath = $footerLogoFile->store('home-page', 'public');
                if (!isset($content['footer'])) {
                    $content['footer'] = [];
                }
                $content['footer']['logo_url'] = '/storage/' . $footerLogoPath;
            }

            // Handle footer background image upload
            if ($request->hasFile('footer_background_image')) {
                $footerBgFile = $request->file('footer_background_image');
                
                // Ensure storage directory exists
                if (!Storage::disk('public')->exists('home-page')) {
                    Storage::disk('public')->makeDirectory('home-page');
                }
                
                // Delete old background image if exists
                if (isset($content['footer']['background_image']) && 
                    strpos($content['footer']['background_image'], '/storage/') === 0) {
                    $oldPath = str_replace('/storage/', '', $content['footer']['background_image']);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $footerBgPath = $footerBgFile->store('home-page', 'public');
                if (!isset($content['footer'])) {
                    $content['footer'] = [];
                }
                $content['footer']['background_image'] = '/storage/' . $footerBgPath;
            }

            $homePage->update([
                'title' => $validated['title'],
                'content' => $content
            ]);

            return redirect()->route('admin.websites.home-page.edit', $website->id)
                ->with('success', 'Home page updated successfully!');

        } catch (\Exception $e) {
            \Log::error('Home page update failed: ' . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Failed to update home page: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Manage icons
     */
    public function icons(): Response
    {
        $icons = Icon::orderBy('category')->orderBy('name')->get();

        return Inertia::render('Admin/Icons/Index', [
            'title' => 'Icon Management',
            'icons' => $icons
        ]);
    }

    /**
     * Create new icon
     */
    public function storeIcon(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'svg_content' => 'required_without:icon_url|string',
            'icon_url' => 'required_without:svg_content|string|max:255',
            'description' => 'nullable|string',
        ]);

        Icon::create($validated);

        return redirect()->back()
            ->with('success', 'Icon created successfully!');
    }

    /**
     * Update icon
     */
    public function updateIcon(Request $request, Icon $icon): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'svg_content' => 'nullable|string',
            'icon_url' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $icon->update($validated);

        return redirect()->back()
            ->with('success', 'Icon updated successfully!');
    }

    /**
     * Delete icon
     */
    public function destroyIcon(Icon $icon): RedirectResponse
    {
        $icon->delete();

        return redirect()->back()
            ->with('success', 'Icon deleted successfully!');
    }

    /**
     * API endpoint to get icons by category
     */
    public function getIcons(Request $request)
    {
        $category = $request->get('category');
        
        $query = Icon::active()->orderBy('name');
        
        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }
        
        $icons = $query->get()->map(function ($icon) {
            return [
                'id' => $icon->id,
                'name' => $icon->name,
                'category' => $icon->category,
                'svg_content' => $icon->svg_content,
                'icon_url' => $icon->icon_url,
                'description' => $icon->description,
                'display_name' => ucwords(str_replace('_', ' ', $icon->name))
            ];
        });

        return response()->json($icons);
    }

    /**
     * Create new icon via AJAX
     */
    public function storeIconAjax(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:icons,name',
            'category' => 'required|string|max:255',
            'icon_file' => 'required|file|mimes:svg,png,jpg,jpeg|max:2048',
        ]);

        $iconContent = null;
        $iconUrl = null;

        if ($request->hasFile('icon_file')) {
            $file = $request->file('icon_file');
            $extension = $file->getClientOriginalExtension();
            
            if ($extension === 'svg') {
                // For SVG files, store the content directly
                $iconContent = file_get_contents($file->getRealPath());
            } else {
                // For PNG/JPG files, store the file and save URL
                $filename = time() . '_' . $validated['name'] . '.' . $extension;
                $path = $file->storeAs('icons', $filename, 'public');
                $iconUrl = '/storage/' . $path;
            }
        }

        $icon = Icon::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'svg_content' => $iconContent,
            'icon_url' => $iconUrl,
            'description' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Icon created successfully!',
            'icon' => [
                'id' => $icon->id,
                'name' => $icon->name,
                'category' => $icon->category,
                'svg_content' => $icon->svg_content,
                'icon_url' => $icon->icon_url,
                'display_name' => ucwords(str_replace('_', ' ', $icon->name))
            ]
        ]);
    }

    /**
     * Update website
     */
    public function updateWebsite(Request $request, $websiteId): RedirectResponse
    {
        // For now, we'll just simulate updating and redirect back
        // In a real application, you would validate and save to database
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'domain' => 'nullable|string|max:255',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'logo_file' => 'nullable|file|mimes:png,jpg,jpeg,svg|max:2048',
            'logo_url' => 'nullable|string|max:255',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'favicon_url' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'timezone' => 'nullable|string|max:255',
            // Brand colors
            'brand_colors.primary' => 'nullable|string|max:7',
            'brand_colors.secondary' => 'nullable|string|max:7',
            'brand_colors.accent' => 'nullable|string|max:7',
            'brand_colors.text' => 'nullable|string|max:7',
            'brand_colors.background' => 'nullable|string|max:7',
            // Contact info
            'contact_info.phone' => 'nullable|string|max:255',
            'contact_info.email' => 'nullable|email|max:255',
            'contact_info.address' => 'nullable|string',
            'contact_info.agent.name' => 'nullable|string|max:255',
            'contact_info.agent.title' => 'nullable|string|max:255',
            // Social media
            'social_media.facebook' => 'nullable|url|max:255',
            'social_media.instagram' => 'nullable|url|max:255',
            'social_media.twitter' => 'nullable|url|max:255',
            'social_media.linkedin' => 'nullable|url|max:255',
        ]);

        // Handle logo file upload
        if ($request->hasFile('logo_file')) {
            $logoFile = $request->file('logo_file');
            
            // Ensure storage directory exists
            if (!Storage::disk('public')->exists('logos')) {
                Storage::disk('public')->makeDirectory('logos');
            }
            
            $logoPath = $logoFile->store('logos', 'public');
            $validated['logo_url'] = '/storage/' . $logoPath;
        }

        // In a real application, you would update the website in the database
        // Website::find($websiteId)->update($validated);
        
        return redirect()->route('admin.websites.show', $websiteId)
            ->with('success', 'Website updated successfully!');
    }
}
